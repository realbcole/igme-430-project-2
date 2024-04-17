const mongoose = require('mongoose');
const _ = require('underscore');

const setContent = (name) => _.escape(name).trim();

const PostSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  content: {
    type: String,
    required: true,
    set: setContent,
  },
  // need to add likes and comments
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  age: doc.age,
  level: doc.level,
});

const PostModel = mongoose.model('Post', PostSchema);
module.exports = PostModel;
