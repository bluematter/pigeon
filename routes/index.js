
/*
 * Module dependencies
 */

var utils = require('../utils');
var Message = require('../models/Message');
var Promise = require('promise');
var lupus = require('lupus');

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
  | Provide a home route
  |--------------------------------------------------------------------------
  */
  app.get('/', function(req, res) {
    res.render('home');
  });


  /*
   * API Routes
   */
  
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
