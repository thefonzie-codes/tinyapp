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
};

//

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

const returnIdFromEmail = (obj, email) => {
  
  for (let id in obj) {
    if (obj[id].email === email) {
      return id;
    }
  }
};

const createNewUser = (obj, input) => {

  const email = input.email;
  const password = input.password;
  
  if (!email) {
    return { errStatus: 403, errMsg: 'Email required', id:{}, newUser:{} };
  }
  
  if (!password) {
    return { errStatus: 403, errMsg: 'Password Required', id:{}, newUser:{} };
  }
  
  const hashedPassword = bcrypt.hashSync(input.password, 10);

  for (let id in obj) {
    const existingEmail = obj[id].email;
    if (existingEmail === email) {
      return { errStatus: 403, errMsg: 'Email already in use', id:{}, newUser:{} };
    }
  }

  const newId = generateRandomString();
  const newUser = input[newId] = {
    id: newId,
    email,
    password: hashedPassword
  };

  return { errStatus: null, errMsg: null, id: newId, newUser };
};

const shortUrlExists = (obj, input) => {

  for (let each in obj) {
    if (each === input) {
      return { errStatus: null, errMsg: null, id: input };
    }
  }
  return { errStatus: 403, errMsg: 'Short URL does not exist.', id: input };
};

const authenticated = (input) => {
  if (input) {
    return { errStatus: null, errMsg: null, id: input };
  }

  return { errStatus: 403, errMsg: 'Only registered users can perform this action. Please log in.', id: input };
};

const ownedBy = (obj ,urlId, loginId) => {
  if (obj[urlId].userID === loginId) {
    return { errStatus: null, errMsg: null, id: loginId };
  }
  return { errStatus: 403, errMsg: 'Only the owner can edit the URL', id: loginId };
};



const ownedUrls = (urlDatabase, userId) => {
  const owned = {};

  for (let id in urlDatabase) {
    const urlUserId = urlDatabase[id].userID;
    if (userId === urlUserId) {
      owned[id] = {
        id,
        ...urlDatabase[id]
      };
    }
  }
  return owned;
};

module.exports = { generateRandomString, createNewUser, returnIdFromEmail, shortUrlExists, authenticated, ownedBy, ownedUrls };