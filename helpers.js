const bcrypt = require('bcryptjs');

// TEST OBJ

const users = {
  xlt42x: {
    id: "xlt42x",
    email: "123@123",
    password: "3046",
  },
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  }
};

const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: "xlt42x"
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'userRandomID'
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "xlt42x"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: 'userRandomID'
  },
}

//

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

const returnIdFromEmail = (obj, email) => {
  
  for (let id in obj) {
    if (obj[id].email === email){
      return obj[id].id;
    }
  }
  return undefined;
}

const createNewUser = (obj, input) => {

  const email = input.email;
  const password = bcrypt.hashSync(input.password, 10);


  if (!email) {
    return { errStatus: 403, errMsg: 'Email required', id:{}, newUser:{} }
  };
  
  if (!password) {
    return { errStatus: 403, errMsg: 'Password Required', id:{}, newUser:{} }
  };

  for (let id in obj) {
    const existingEmail = obj[id].email;
    if (existingEmail === email) {
    return { errStatus: 403, errMsg: 'Email already in use', id:{}, newUser:{} }
    }
  }

  const newId = generateRandomString();
  newUser = input[newId] = {
    newId,
    email,
    password
  }

  return { errStatus: null, errMsg: null, id: newId, newUser }
};

const shortUrlExists = (obj, input) => {

  for (let each in obj) {
    if (each === input) {
    return { errStatus: null, errMsg: null, id: input }
    }
  }
  return { errStatus: 403, errMsg: 'Short URL does not exist.', id: input }
}


const authenticated = (input) => {
  if (input) {
    return { errStatus: null, errMsg: null, id: input }
  };

  return { errStatus: 403, errMsg: 'Only registered users can perform this action. Please log in.', id: input }
};

const ownedBy = (urlId, userId) => {
  if (urlDatabase[urlId].userID === userId){
    return { errStatus: null, errMsg: null, id: userId }
  }
  return { errStatus: 403, errMsg: 'Only the owner can edit the URL', id: userId }
}


const login = (obj, input) => {

  const id = returnIdFromEmail(obj, input.email);
  
  if (!id) {
    return { errStatus: 403, errMsg: 'Email does not match any current user', id}
  }

  const userPassword = obj[id].password;
  const password = input.password;

  if (!password) {
    return { errStatus: 403, errMsg: 'Password required', id}
  }

  if (userPassword !== inputPassword) {
    return { errStatus: 403, errMsg: 'Username/password incorrect', id}
  }

  return { errStatus: null, errMsg: null, id }
}


module.exports = { generateRandomString, createNewUser, returnIdFromEmail, login, shortUrlExists, authenticated, ownedBy }