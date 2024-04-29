require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Connect to the database
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/Twitter-Clone';
mongoose.connect(dbURI).catch((err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

// Connect to the Redis server
const redisClient = redis.createClient({
  url: process.env.REDISCLOUD_URL,
});

// Log Redis errors
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect to the Redis server
redisClient.connect().then(() => {
  // Create the Express app
  const app = express();

  // Set up the Express app
  app.use(helmet());
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Set up the session
  app.use(session({
    key: 'sessionid',
    store: new RedisStore({
      client: redisClient,
    }),
    secret: 'Twitter Clone by Bcole',
    resave: false,
    saveUninitialized: false,
  }));

  // Set up the view engine
  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/../views`);

  // Set up the router
  router(app);

  // Start the server
  app.listen(port, (err) => {
    if (err) throw err;

    console.log(`Listening on port ${port}`);
  });
});
