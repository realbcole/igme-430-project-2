// Middleware to check if user is logged in or not
const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/');
  }
  return next();
};

// Middleware to check if user is logged out or not
const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/home');
  }
  return next();
};

// Middleware to check if the connection is secure
const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
};

// Bypass the secure check
const bypassSecure = (req, res, next) => next();

module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;

// Only require secure connection in production
if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
