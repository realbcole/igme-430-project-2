const mongoose = require('mongoose');
const _ = require('underscore');

const setContent = (s) => _.escape(s).trim();

const CommentSchema = new mongoose.Schema({
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
    postId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Post',
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
});

CommentSchema.statics.toAPI = (doc) => ({
    owner: doc.owner,
    content: doc.content,
    likes: doc.likes,
    postId: doc.postId,
    createdDate: doc.createdDate,
});

const CommentModel = mongoose.model('Comment', CommentSchema);
module.exports = CommentModel;
