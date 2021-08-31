const Passwords = require('machinepack-passwords');

/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

function passwordCheck(user, cb) {
  Passwords
    .encryptPassword({password: user.password})
    .exec({
      error: (err) => {
        return cb(err);
      },
      success: async (encryptedPassword) => {
        user.password = encryptedPassword;
        cb();
      }
    });
}

module.exports = {
  attributes: {
    posts: {collection: 'post', via: 'userId'},
    comments: {collection: 'comment', via: 'userId'},
    username: {required: true, unique: true, type: 'string'},
    password: {required: true, type: 'string'}
  },
  customToJSON: function () {
    return _.omit(this, ['password']);
  },
  beforeCreate: function (user, cb) {
    passwordCheck(user, cb);
  },
  beforeUpdate: function (user, cb) {
    passwordCheck(user, cb);
  }
};