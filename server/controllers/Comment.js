const models = require('../models');

const { Comment } = models;

const makeComment = async (req, res) => {
    if (!req.body.comment) {
        return res.status(400).json({ error: 'Comment required!' });
    }

    const commentData = {
        owner: req.session.account._id,
        content: req.body.comment,
        postId: req.body.postId,
    };

    try {
        const newComment = new Comment(commentData);
        await newComment.save();
        return res.status(201).json({ comment: newComment.content });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occurred making comment!' });
    }
}

const getComments = async (req, res) => {
    try {
        const query = { postId: req.query.postId };
        const docs = await Comment.find(query).select('content').lean().exec();

        return res.json({ comments: docs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving comments!' });
    }
};

module.exports = {
    makeComment,
    getComments,
};
