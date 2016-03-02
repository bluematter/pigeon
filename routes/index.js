
/*
 * Module dependencies
 */

var utils = require('../utils');
var Message = require('../models/Message');
var Promise = require('promise');
var lupus = require('lupus');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var secrets = require('../config/secrets');
var passport = require('passport');
var User = require('../models/User');

/**
 * Defines routes for application
 *
 * @param {Express} app `Express` instance.
 * @api public
 */

function Routes(app, redisSessionClient) {
  
  /*
   * UI Routes
   */
  
  /*
  |--------------------------------------------------------------------------
  | Provide routes to render the UI
  |--------------------------------------------------------------------------
  */
  
  // home login route
  app.get('/', function(req, res) {

    // check if user
    if(req.user) {
      res.redirect('/app');
    } else {
      res.render('home');
    }

  });
  
  // chat page route
  app.get('/app', function(req, res) {

    // check if user
    if(req.user) {

      User.find({}, function(err, users) {
        if(err)
          res.send('There was an error fetching the users');

        var app = {
          me: req.user,
          friends: users
        };

        res.render('app', app);
      });

    } else {
      res.redirect('/');
    }

  });



  /*
   * API Routes
   */
  

  /*
  |--------------------------------------------------------------------------
  | Pigeon test collection
  |--------------------------------------------------------------------------
  */

  app.get('/api/messages/', function(req, res) {
    res.json([
      { message: 'Hey Mike' }, 
      { message: 'Good job with this project so far, keep making it better' }
    ]);
  });

  /*
  |--------------------------------------------------------------------------
  | Provide user login
  |--------------------------------------------------------------------------
  */

  app.post('/login', passport.authenticate('local', { 
    successRedirect: '/', 
    failureRedirect: '/login', 
    failureFlash: true })
  );
  
  /*
  |--------------------------------------------------------------------------
  | Provide user signup
  |--------------------------------------------------------------------------
  */

  app.post('/signup', function(req, res, next) {

    var user = new User({
      username: req.body.username,
      password: req.body.password
    });

    User.findOne({ username: req.body.username }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'Account with that username already exists.' });
        return res.redirect('/');
      }
      user.save(function(err) {
        if (err) return next(err);
        req.logIn(user, function(err) {
          if (err) return next(err);
          res.redirect('/');
        });
      });
    });
  });

  /*
  |--------------------------------------------------------------------------
  | Provide user logout
  |--------------------------------------------------------------------------
  */

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  
  /*
  |--------------------------------------------------------------------------
  | Provide data for game room messages
  |--------------------------------------------------------------------------
  */

  app.get('/api/games/:id/messages', function(req, res) {

    Message.find({ 'room_id': req.params.id }).sort({message_date: 1}).exec(function(err, messages) {
      if(err)
        res.send('There was an error fetching the messages');
      res.json(messages);
    });

  });


  /*
  |--------------------------------------------------------------------------
  | Provide data for direct messages
  |--------------------------------------------------------------------------
  */

  app.get('/api/chat/:id/messages', function(req, res) {

    Message.find({ 'chatID': req.params.id }).sort({message_date: 1}).exec(function(err, messages) {
      if(err)
        res.send('There was an error fetching the messages');
      res.json(messages);
    });

  });


  /*
  |--------------------------------------------------------------------------
  | Provide data for friends status
  |--------------------------------------------------------------------------
  */

  app.get('/api/friends/', function(req, res) {

      // store for my friends statuses
      var myFriendsStatus = [];
      
      // lupus module, push all users then finish
      lupus(0, req.query.myFriends.length, function(i) {
        
          // async call to redis, get friends status
          var redisRequest = new Promise(function(resolve, reject) {
              redisSessionClient.get("online:"+req.query.myFriends[i].handle, function(err, friends) {
                  if(friends != null) {
                      var friendsStatus = JSON.parse(friends);
                      resolve({
                          friend: req.query.myFriends[i].handle,
                          online: friendsStatus.online
                      });
                  } else {
                      reject({
                          error: 'user not found in redis'
                      });
                  }
              });
          });

          // return promise
          redisRequest.then(function(result) {
              myFriendsStatus.push(result);
          }).catch(function(error) {
              myFriendsStatus.push(error);
          });

      }, function() {
        console.log('All done!');
        res.json(myFriendsStatus);
      });

  });


  /*
  |--------------------------------------------------------------------------
  | Send api error
  |--------------------------------------------------------------------------
  */

  app.get('/api/error', function(req, res) {
    
    res.json({user: false});

  });

}

/**
 * Expose routes
 */

module.exports = Routes;
