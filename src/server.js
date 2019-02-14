import App from './components/App';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import passport from 'passport';
import redis from 'redis';
import routes from './server/routes/api';

require('dotenv').config();

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);
const server = express();
const redisClient = redis.createClient();
const RedisStore = require('connect-redis')(session);
const flash = require('connect-flash');

server.set('trust proxy', 1)

redisClient.on('error', (err) =>{
  console.log(err)
});

redisClient.on('connect', () =>{
  console.log('REDIS CONNECTED!')
});

// Middlewares
server.use(morgan('dev'));
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());

// REVISIT
server.use(session({
  name: 'zoiyaa.sid',
  cookie: {secure: true, maxAge: 60000},
  store: new RedisStore({
    client: redisClient
  }),
  secret: process.env.RAZZLE_REDIS_SECRET,
  resave: false,
  saveUninitialized: false,
}));

server.use(passport.initialize());
server.use(passport.session());;

server.use(flash());
// Routes
server.use('/api', routes(server));

// REVISIT
server.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    const context = {};
    const markup = renderToString(
      <StaticRouter context={context} location={req.url}>
        <App />
      </StaticRouter>
    );

    if (context.url) {
      res.redirect(context.url);
    } else {
      res.status(200).send(
        `<!doctype html>
          <html lang="en">
            <head>
              <meta http-equiv="Content-Type" charset=utf-8" />
              <meta name="description" content="" />
              <meta name="keywords" content="" />
              <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
              <meta name="theme-color" content="#fc4c03" />
              <link rel="manifest" href="/manifest.json" />
              <link rel="shortcut icon" href="/favicon.ico" />
              <link href="https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i" rel="stylesheet">
              <link rel="stylesheet" type="text/css" href="/assets/css/page.css" />
              <link rel="stylesheet" type="text/css" href="/assets/css/style.css" />
              <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
              <script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js" integrity="sha384-kW+oWsYx3YpxvjtZjFXqazFpA7UP/MbiY4jvs+RWZo2+N94PFZ36T6TFkc9O3qoB" crossorigin="anonymous"></script>
              <title>Zoiyaa - Where Dream Homes Become Reality!</title>
              ${
                assets.client.css
                  ? `<link rel="stylesheet" href="${assets.client.css}">`
                  : ''
              }
              ${
                process.env.NODE_ENV === 'production'
                  ? `<script src="${assets.client.js}" defer></script>`
                  : `<script src="${assets.client.js}" defer crossorigin></script>`
              }
              <script src='https://www.google.com/recaptcha/api.js' async defer></script>
            </head>
              <body>
                  <div id="root" class="layout-centered">${markup}</div>
                  <script src="/assets/js/page.js" defer crossorigin></script>
              </body>
          </html>
        `
      );
    }
  });

export default server;
