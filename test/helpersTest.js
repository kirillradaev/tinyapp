const { assert } = require('chai');

const checkEmail  = require('../helpers.js');

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

describe('checkEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user.id, expectedOutput);
  }),
  it('should return undefined when the user does not exist', function() {
    const user = checkEmail(testUsers, "user@exmple.com");
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.isUndefined(user, expectedOutput);
  });
});