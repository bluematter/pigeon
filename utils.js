var crypto = require('crypto');
var type = require('component-type');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var redis = require('redis');
var PHPUnserialize = require('php-unserialize');
var http = require('http');
var req = http.IncomingMessage.prototype;

var Promise = require('promise');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var PHPUnserialize = require('php-unserialize');
var redisSessionClient = redis.createClient({host:'redis://127.0.0.1/0'});

/*
|--------------------------------------------------------------------------
| Restriction Middleware
|--------------------------------------------------------------------------
|
| We can use this as middleware, pass this between the route and the callback.
| The function calls on our custom Authentication and if that returns true, we
| tell node to continue, but if it's false then we redirect the user to an error
|
*/

exports.authenticated = function (req, res, next) {
  
  var cookieParser = require('cookie-parser');
  var cookie = require('cookie');
  var PHPUnserialize = require('php-unserialize');
  var cookies;

  if(req.headers.cookie) {
    
    // if PHP generated a cookie
    var secrets = require('./config/secrets');
    cookies = cookie.parse(req.headers.cookie);
    if(cookies['PHPSESSID']) {
      
      // redis async call
      var sid = cookieParser.signedCookie(cookies['PHPSESSID'], secrets.sessionSecret);
      var redisRequest = new Promise(function(resolve, reject) {
        redisSessionClient.get('xy_gaming:'+sid, function(err, session) {
          if(err || !session) {
            reject('something went wrong, or there is no session');
          } else {
            var serializedSession = PHPUnserialize.unserializeSession(session); // turns PHP session into an object
            var username = serializedSession._sf2_attributes.username; // gets the username from the session
            if(serializedSession._sf2_attributes._security_main) {
              resolve({username: username});
            } else {
              reject('not logged into Symfony2');
            }
          }
        });
      });
      
      // return promise
      redisRequest.then(function(result) {
        req.user = {};
        req.user.username = result.username;
        console.log(req.user);
        return next();
      }).catch(function(error) {
        console.log(error);
        res.redirect('/api/error');
      });
      
    } else {
      // PHP did not generate a cookie
      console.log('PHP did not generate a cookie');
    }

  } else {
    // req does not have a cookie in header
    console.log('req does not have a cookie in header');
  }

};