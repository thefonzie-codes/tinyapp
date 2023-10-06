const bcrypt = require('bcryptjs');

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
    return { errStatus: 400, errMsg: 'Email required', id:{}, newUser:{} };
  }
  
  if (!password) {
    return { errStatus: 400, errMsg: 'Password Required', id:{}, newUser:{} };
  }
  
  const hashedPassword = bcrypt.hashSync(input.password, 10);

  for (let id in obj) {
    const existingEmail = obj[id].email;
    if (existingEmail === email) {
      return { errStatus: 400, errMsg: 'Email already in use', id:{}, newUser:{} };
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