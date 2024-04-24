const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getPosts', mid.requiresLogin, controllers.Post.getPosts);
  app.get('/getUserPosts', mid.requiresLogin, controllers.Post.getUserPosts);
  app.delete('/deletePost', mid.requiresLogin, controllers.Post.deletePost);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/home', mid.requiresLogin, controllers.Post.homePage);
  app.post('/post', mid.requiresLogin, controllers.Post.makePost);
  app.post('/likePost', mid.requiresLogin, controllers.Post.likePost);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
