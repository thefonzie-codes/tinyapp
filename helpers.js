// TEST OBJ

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  }
};

//

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

const returnIdFromEmail = (obj, email) => {
  
  for (let id in obj) {
    if (obj[id].email === email){
      return obj[id].id;
    }
  }
}

const createNewUser = (obj, input) => {

  const inputEmail = input.email;
  const inputPassword = input.password;


  if (!inputEmail) {
    return { errStatus: 403, errMsg: 'Email required', id:{}, newUser:{} }
  };
  
  if (!inputPassword) {
    return { errStatus: 403, errMsg: 'Password Required', id:{}, newUser:{} }
  };

  for (let id in obj) {
    const existingEmail = obj[id].email;
    console.log(inputEmail)
    if (existingEmail === inputEmail) {
    return { errStatus: 403, errMsg: 'Email already in use', id:{}, newUser:{} }
    }
  }

  const newId = generateRandomString();
  newUser = input[newId] = {
    newId,
    ...input
  }

  return { errStatus: null, errMsg: null, id: newId, newUser }
};




const login = (obj, input) => {

  const id = returnIdFromEmail(obj, input.email);
  
  if (!id) {
    return { errStatus: 403, errMsg: 'Email does not match any current user', id}
  }

  const userPassword = obj[id].password;
  const inputPassword = input.password;

  if (!inputPassword) {
    return { errStatus: 403, errMsg: 'Password required', id}
  }

  if (userPassword !== inputPassword) {
    return { errStatus: 403, errMsg: 'Username/password incorrect', id}
  }

  return { errStatus: null, errMsg: null, id }
}

console.log(createNewUser(users, {email: "123@example.com",
password: "purple-monkey-dinosaur"}));

module.exports = { generateRandomString, createNewUser, returnIdFromEmail, login }