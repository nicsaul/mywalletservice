const mongoose = require('mongoose');
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const MongodbMemoryServer = require('mongodb-memory-server');


const Environments = { TEST: 'test', DEV: 'development', PROD: 'production'};
const APP_NAME = 'Wallet Service';
const ENV = process.env.NODE_ENV || Environments.DEV;
const PORT = process.env.PORT || 5000;
const PASSWORD = process.env.PASSWORD || '123456';

// auth0 configs
const auth0 = {
  baseUrl: process.env.AUTH0_BASEURL || '',
  apiId: process.env.AUTH0_APIID || '',
}

console.log(ENV);

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const jwtCheck = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and 
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${auth0.baseUrl}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: `${auth0.apiId}`,
  issuer: `${auth0.baseUrl}/`,
  algorithms: ['RS256']
});

function checkScopes(scopes) {
  jwtAuthz(scopes);
} 


// database configs

let MONGODB_URI = process.env.MONGODB_URI;
if (ENV === Environments.TEST) {
  MONGODB_URI = global.__MONGO_URI__;
}

mongoose.Promise = Promise;
if (ENV === Environments.DEV || ENV === Environments.TEST) {
  mongoose.set('debug', true);
}

/**
 * Connect to mongoose asynchronously or bail out if it fails
 */
async function connectToDatabase() {
  try {
    if (ENV === Environments.DEV) {
      const mongoServer = new MongodbMemoryServer.MongoMemoryServer();
      MONGODB_URI = await mongoServer.getConnectionString();
    }
    await mongoose.connect(
      MONGODB_URI,
      { autoIndex: false, useNewUrlParser: true }
    );
    console.log(`${APP_NAME} successfully connected to database: ${MONGODB_URI}.`);
    
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

/**
 * Configuration middleware to enable cors and set some other allowed headers.
 *  You can also just use the 'cors' package.
 */
function globalResponseHeaders(request, response, next) {
  response.header('Access-Control-Allow-Origin', '*');
  response.header(
    'Access-Control-Allow-Headers',
    'Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization'
  );
  response.header(
    'Access-Control-Allow-Methods',
    'POST,GET,PATCH,DELETE,OPTIONS'
  );
  response.header('Content-Type', 'application/json');
  return next();
}

module.exports = {
  APP_NAME,
  ENV,
  MONGODB_URI,
  PORT,
  PASSWORD,
  connectToDatabase,
  globalResponseHeaders,
  jwtCheck,
  checkScopes,
};
