const models = require('../models');

const { Post } = models;

const homePage = async (req, res) => res.render('app');

const makePost = async (req, res) => {
  if (!req.body.content) {
    return res.status(400).json({ error: 'Content is required!' });
  }

  const postData = {
    content: req.body.content,
    owner: req.session.account._id,
  };

  try {
    const newPost = new Post(postData);
    await newPost.save();
    return res.status(201).json({ content: newPost.content });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Post already exists!' });
    }

    return res.status(400).json({ error: 'An error occurred making post!' });
  }
};

const likePost = async (req, res) => {
  try {
    const postId = req.body.postId;
    const userId = req.session.account._id;

    const post = await Post.findById(postId);
    const likesIndex = post.likes.indexOf(userId);

    if (likesIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likesIndex, 1);
    }

    await post.save();

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error liking post!' });
  }
};

const getPosts = async (req, res) => {
  try {
    const docs = await Post.find().populate('owner', 'username').select('content likes createdDate').sort('-createdDate').lean().exec();

    return res.json({ posts: docs, user: req.session.account });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving posts!' });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Post.find(query).populate('owner', 'username').select('content likes createdDate').sort('-createdDate').lean().exec();

    return res.json({ posts: docs, user: req.session.account });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving posts!' });
  }
};

const deletePost = async (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ error: 'An ID is required!' });
  }

  try {
    await Post.deleteOne({ _id: req.body.id });
    return res.status(204).end();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error deleting post!' });
  }
};

module.exports = {
  homePage,
  makePost,
  likePost,
  getPosts,
  getUserPosts,
  deletePost,
};
