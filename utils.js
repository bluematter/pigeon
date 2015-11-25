var crypto = require('crypto');
var type = require('component-type');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var redis = require('redis');

var Promise = require('promise');
var redisSessionClient = redis.createClient({host:'redis://127.0.0.1/'});
redisSessionClient.select(1);
var secrets = require('./config/secrets');

var bunyan = require('bunyan');
var bformat = require('bunyan-format'); 
var formatOut = bformat({ outputMode: 'short' });
var logger = bunyan.createLogger({
    name: 'pigeon utils',
    stream: formatOut
});

/*
|--------------------------------------------------------------------------
| Restriction Middleware
|--------------------------------------------------------------------------
|
| Right now the authentication needs work. It allows us to quickly add
| a user via cookies, store them in redis and ID them
|
*/

// TODO: Needs work!
exports.authenticated = function (req, res, next) {

  if(req.headers.cookie) {
    
    // check the cookie
    cookies = cookie.parse(req.headers.cookie);

    // redis async call
    var sid = cookieParser.signedCookie(cookies['connect.sid'], secrets.sessionSecret);
    var redisRequest = new Promise(function(resolve, reject) {
      redisSessionClient.hget('users:'+cookies.username, 'username', function(err, user) {
        logger.info('User From Redis Auth', user);
        if(err || !user) {
          logger.error(err);
          reject('something went wrong, or there is no user');
        } else {
          if(user) {
            resolve({username: user});
          } else {
            reject('not in my house!');
          }
        }
      });
    });
    
    // return promise
    redisRequest.then(function(result) {
      req.user = {};
      req.user.username = result.username;
      return next();
    }).catch(function(error) {
      console.log(error);
      return next();
    });
      

  } else {
    // req does not have a cookie in header
    console.log('req does not have a cookie in header');
    return next();
  }

};