const generateRandomString = () => Math.random().toString(36).slice(2, 8);

module.exports = { generateRandomString }