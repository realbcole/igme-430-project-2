const models = require('../models');

const { Account } = models;

// Render the login page
const loginPage = (req, res) => res.render('login');

// Destroy the session and redirect to the home page
const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

// Authenticate the user and redirect to the home page
const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  // Check if the username and password are present
  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  // Authenticate the user
  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    // Redirect to the home page
    return res.json({ redirect: '/home' });
  });
};

// Create a new account and redirect to the home page
const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  // Check if all fields are present
  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  // Check if the passwords match
  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  // Create a new account
  try {
    // Generate a hash for the password
    const hash = await Account.generateHash(pass);

    // Save the account
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);

    // Redirect to the home page
    return res.json({ redirect: '/home' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(400).json({ error: 'An error occurred!' });
  }
};

// Change the password of the account
const changePassword = async (req, res) => {
  const { account } = req.session;
  const { newPass, oldPass } = req.body;

  // Check if all fields are present
  if (!newPass || !oldPass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  // Authenticate the old password
  return Account.authenticate(account.username, oldPass, async (err, accountModel) => {
    if (err || !accountModel) {
      return res.status(401).json({ error: 'Wrong password!' });
    }

    // Generate a new hash for the new password
    const hash = await Account.generateHash(newPass);

    // Update the account with the new password
    try {
      await Account.updateOne({ _id: account._id }, { password: hash });
      return res.status(204).send();
    } catch (err2) {
      return res.status(400).json({ error: 'An error occurred!' });
    }
  });
}

module.exports = {
  loginPage,
  logout,
  login,
  signup,
  changePassword,
};
