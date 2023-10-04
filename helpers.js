const generateRandomString = () => Math.random().toString(36).slice(2, 8);

const createNewUser = (input) => {
  const id = generateRandomString();
  newUser = input[id] = {
    id,
    ...input
  }

  return { id: id, newUser }
};

const returnIdFromEmail = (users, email) => {
  for (let id of users) {
    if (id.email === email){
      return id;
    }
  }
}

module.exports = { generateRandomString, createNewUser, returnIdFromEmail }