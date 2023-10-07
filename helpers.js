const bcrypt = require('bcryptjs');

// Generates a random 6 digit string

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

// Returns the user ID.
// @param obj should be the users object
// @param email should be the login email

const returnIdFromEmail = (obj, email) => {
  
  for (let id in obj) {
    if (obj[id].email === email) {
      return id;
    }
  }
};

// Generates a new user and adds them to the database.
// It will also hash the password to store.  Also checks to see if the user is already in the database.
// Error messages are part of the output. 
// @param obj should be the users object
// @param input should be req.body or an object that contains an email and password

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

// Checks against the database if the short URL already exists.  If it does not exist, sends an error message and status.
// @param obj should be the users object
// @param input should be req.params.id

const shortUrlExists = (obj, input) => {

  for (let each in obj) {
    if (each === input) {
      return { errStatus: null, errMsg: null, id: input };
    }
  }
  return { errStatus: 403, errMsg: 'Short URL does not exist.', id: input };
};

// Checks if the user has been logged in.  If they have not, will return an error message and status.
// @param input should be req.session.user_id

const authenticated = (input) => {
  if (input) {
    return { errStatus: null, errMsg: null, id: input };
  }

  return { errStatus: 403, errMsg: 'Only registered users can perform this action. Please log in.', id: input };
};

// Checks if the short URL is owned by currently logged in user.
// @param obj should be the urlDatabase
// @param obj should be req.params.id(displayed short URL ID)
// @param obj should be req.session.user_id(current user login ID)

const ownedBy = (obj ,urlId, loginId) => {
  if (obj[urlId].userID === loginId) {
    return { errStatus: null, errMsg: null, id: loginId };
  }
  return { errStatus: 403, errMsg: 'Only the owner can edit the URL', id: loginId };
};

// Returns an object that contains the short URLs the logged in user currently owns.
// @param urlDatabase should be the urlDatabase
// @param userId should be req.session.user_id(current user login ID)

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