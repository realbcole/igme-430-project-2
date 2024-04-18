const mongoose = require('mongoose');
const _ = require('underscore');

const setContent = (s) => _.escape(s).trim();

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
  likes: {
    type: Number,
    default: 0,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.statics.toAPI = (doc) => ({
  owner: doc.owner,
  content: doc.content,
  likes: doc.likes,
  createdDate: doc.createdDate,
});

const PostModel = mongoose.model('Post', PostSchema);
module.exports = PostModel;
