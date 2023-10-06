const { assert } = require('chai');

const { returnIdFromEmail } = require('../helpers.js');

const testUsers = {
  xlt42x: {
    id: "xlt42x",
    email: "123@123.com",
    password: "3046",
  },
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  }
};

describe('returnIdFromEmail', function() {
  it('should return a user with valid email', function() {
    const user = returnIdFromEmail(testUsers, "123@123.com");
    const expectedUserID = "xlt42x";
    assert.strictEqual(user, expectedUserID);
  });

  it('should return undefined if provided email is incorrect', function() {
    const user = returnIdFromEmail(testUsers, "user123@example.com");
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID);
  });
});


