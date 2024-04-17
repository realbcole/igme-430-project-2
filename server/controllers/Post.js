const models = require('../models');

const { Post } = models;

const homePage = async (req, res) => res.render('app');

const makePost = async (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.level) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const postData = {
    name: req.body.name,
    age: req.body.age,
    level: req.body.level,
    owner: req.session.account._id,
  };

  try {
    const newPost = new Post(postData);
    await newPost.save();
    return res.status(201).json({ name: newPost.name, age: newPost.age, level: newPost.level });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Post already exists!' });
    }

    return res.status(400).json({ error: 'An error occurred making post!' });
  }
};

const getPosts = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Post.find(query).select('name age level').lean().exec();

    return res.json({ posts: docs });
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
  getPosts,
  deletePost,
};
