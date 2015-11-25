
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

/**
 * Defines routes for application
 *
 * @param {Express} app `Express` instance.
 * @api public
 */

function Routes (app, redisSessionClient) {
  
  /*
   * UI Routes
   */
  
  /*
  |--------------------------------------------------------------------------
  | Provide routes to render the UI
  |--------------------------------------------------------------------------
  */
  
  // home login route
  app.get('/', utils.authenticated, function(req, res) {

    console.log(req.user);

    // check if user
    if(req.user) {
      res.redirect('/chat');
    } else {
      res.render('home');
    }

  });
  
  // chat page route
  app.get('/chat', utils.authenticated, function(req, res) {

    // check if user
    if(req.user) {
      redisSessionClient.keys("users:*", function(err, users) {
        if(err) {
          console.log(err);
          return;
        }
        
        // delete the requesting user from users
        var index = users.indexOf("users:"+req.user.username);
        users.splice(index, 1);

        // turn redis response into objects
        var friends = users.map(function(user) {
          var theFriends = { username: user.split(':')[1] };
          console.log(theFriends);
          return theFriends;
        });
        
        // create obj for the template
        var chat = {
          username: req.user.username,
          friends: friends
        };

        res.render('chat', chat);
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
  | Provide a route for chat usernames
  |--------------------------------------------------------------------------
  */

  app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

  app.post('/api/login', function(req, res) {
    
    // check if username exists
    redisSessionClient.hget("users:"+req.body.attemtedUserName, "username:"+req.body.attemtedUserName, function(err, user) {
      if(err)
        return;

      if(user) {
        res.status(500).send('Sorry the username exists, pick another one please.');
      } else {
        
        // user does not exist lets save the user
        redisSessionClient.hmset("users:"+req.body.attemtedUserName, "username", req.body.attemtedUserName, function() {
          req.user = {};
          req.user.username = req.body.attemtedUserName;
          res.sendStatus(200);
        });

      }
    });
    
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
