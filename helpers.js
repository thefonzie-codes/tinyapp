const generateRandomString = () => Math.random().toString(36).slice(2, 8);
const createNewUser = (input) => {
  const id = generateRandomString();
  newUser = input[id] = {
    id,
    ...input
  }

  return newUser;
};

module.exports = { generateRandomString, createNewUser }