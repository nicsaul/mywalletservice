// npm packages
const express = require('express');
Promise = require('bluebird'); // eslint-disable-line

// app imports
const { connectToDatabase, jwtCheck, globalResponseHeaders, ENV } = require('./config');
const { errorHandler } = require('./handlers');
const { WalletService } = require('./services');
const jwtAuthz = require('express-jwt-authz');

// global constants

const app = express();
const {
  bodyParserHandler,
  globalErrorHandler,
  fourOhFourHandler,
  fourOhFiveHandler
} = errorHandler;

// database
connectToDatabase();

// body parser setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ type: '*/*' }));
app.use(bodyParserHandler); // error handling specific to body parser only

// response headers setup; CORS
app.use(globalResponseHeaders);

if(ENV !== 'test') {
  // check user authenticated for all requests
  app.use('/api', jwtCheck);
}

app.get('/api/wallets/:alias', async function(req, res) {
  const walletService = new WalletService();
  const wallet = await walletService.getWallet(req.params.alias);
  res.json(wallet);
});

app.get('/api/wallets/:alias/balance', async function(req, res) {
  console.log(req.params);
  const walletService = new WalletService();
  const balance = await walletService.getBalance(req.params.alias);
  res.json(balance);
});
app.post('/api/wallets', async function(req, res) {
  const { alias } = req.body;
  console.log(alias);
  const walletService = new WalletService();
  const created = await walletService.createWallet(alias, 'BTC');
  res.json(created);
});

// alias
app.get('/api/aliases', function(req, res) {
  res.json({
    message: 'GET Aliases'
  });
});
app.get('/api/aliases/:name', function(req, res) {
  res.json({
    message: `GET Alias ${req.name}`
  });
});
app.post('/api/aliases', function(req, res) {
  res.json({
    message: 'POST Alias'
  });
});


const checkScopes = jwtAuthz([ 'read:contacts' ]);

app.get('/api/private-scoped', jwtCheck, checkScopes, function(req, res) {
  res.json({
    message: 'Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this.'
  });
});

// catch-all for 404 "Not Found" errors
app.get('*', fourOhFourHandler);
// catch-all for 405 "Method Not Allowed" errors
app.all('*', fourOhFiveHandler);

app.use(globalErrorHandler);

/**
 * This file does NOT run the app. It merely builds and configures it then exports it.config
 *  This is for integration tests with supertest (see __tests__).
 */
module.exports = app;
