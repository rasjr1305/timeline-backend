/**
 * Post.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    userId: {model: 'user'},
    comments: {collection: 'comment', via: 'postId'},
    text: {required: true, type: 'string'}
  }
};

