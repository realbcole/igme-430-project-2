const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  // GET
  app.get('/getPosts', mid.requiresLogin, controllers.Post.getPosts);
  app.get('/getUserPosts', mid.requiresLogin, controllers.Post.getUserPosts);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/home', mid.requiresLogin, controllers.Post.homePage);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/*', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  // POST
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/post', mid.requiresLogin, controllers.Post.makePost);
  app.post('/likePost', mid.requiresLogin, controllers.Post.likePost);

  // PUT
  app.put('/changePassword', mid.requiresLogin, controllers.Account.changePassword);

  // DELETE
  app.delete('/deletePost', mid.requiresLogin, controllers.Post.deletePost);
};

module.exports = router;
