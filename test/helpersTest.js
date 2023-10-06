const { assert } = require('chai');

const { returnIdFromEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('returnIdFromEmail', function() {
  it('should return a user with valid email', function() {
    const user = returnIdFromEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });

  it('should return undefined if provided email is incorrect', function() {
    const user = returnIdFromEmail(testUsers, "user123@example.com");
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID);
  });
});


