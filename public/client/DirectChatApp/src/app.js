/*
|--------------------------------------------------------------------------
| XYGaming direct messages app core
|--------------------------------------------------------------------------
|
|
*/
    
var ChatParameters = require('../../params');

var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
Backbone.$ = $;
var Marionette = require('backbone.marionette');

var socket = io.connect(ChatParameters.url_base, {'connect timeout': 10000});
var DirectMessageCollection = require('./collections/DirectMessageCollection');
var DirectMessagesView = require('./views/directMessagesView');

module.exports = DirectChatApp = function DirectChatApp() {};

// Extend Chatapp with a start method
DirectChatApp.prototype.start = function() {

  // Extend marionette
  DirectChatApp.core = new Marionette.Application();
  
  // Initialize app
  DirectChatApp.core.on('start', function () {
    DirectChatApp.core.vent.trigger('DirectChatApp:log', 'DirectChatApp: Initializing');
    DirectChatApp.core.addRegions({
      directMessagesRegion: '.xygaming-chat-docker-wrapper'
    });
    DirectChatApp.core.vent.trigger('DirectChatApp:start');
  });   
  
  // Start app logic
  DirectChatApp.core.vent.bind('DirectChatApp:start', function(options){
    DirectChatApp.core.vent.trigger('DirectChatApp:log', 'DirectChatApp: Starting');

    /*
    |--------------------------------------------------------------------------
    | Tell the server who my friends are and find out their status
    |--------------------------------------------------------------------------
    */
    socket.on('connect', function (){
      console.info('socket connected');
    });

    /*
    |--------------------------------------------------------------------------
    | TEMP: User created, need a way to add to DOM
    |--------------------------------------------------------------------------
    */
    
    // append new user connection to dom in a shitty way
    socket.on('new user connected', function(data) {
      $('.is--online ul').append('<li class="chat-with-friend-button" data-handle="'+data.whoConnected+'">'+data.whoConnected+'</li>');
    });

    /*
    |--------------------------------------------------------------------------
    | Initiate a chat with a friend
    |--------------------------------------------------------------------------
    */
    $(document).on('click', '.is--online .chat-with-friend-button', function(e) {
      e.preventDefault();
      
      function readCookie(name) {
          var nameEQ = name + "=";
          var ca = document.cookie.split(';');
          for(var i=0;i < ca.length;i++) {
              var c = ca[i];
              while (c.charAt(0)==' ') c = c.substring(1,c.length);
              if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
          }
          return null;
      }

      // identify the user we want to chat with, and let the server know we want to chat
      var user = $(this).data('handle');
      var me = readCookie('username'); // read cookie for username
      var uniqueChatID = [me, user].sort().join(''); // need a unique ChatID

      console.log(uniqueChatID);
      
      // pull in mongoDB data for a particular chat
      if($('#'+uniqueChatID).length == 0) {
        var messages = new DirectMessageCollection([], { chatID: uniqueChatID });
        messages.fetch({
          success: function(messages) {
            var directMessagesView = new DirectMessagesView({ collection: messages, chatID: uniqueChatID, talkingTo: user });
            $('.xygaming-chat-docker-wrapper').append(directMessagesView.render().el);
          },
          error: function() {
            // there is no data
            alert('No data handle this');
          }
        });
      } else {
        return false;
      }
    });

    /*
    |--------------------------------------------------------------------------
    | Notify the user when someone initiates a chat
    |--------------------------------------------------------------------------
    */
    socket.on('new oneOnOneMessage', function(data) {
      // pull in mongoDB data for an initated chat
      if($('#'+data.chatID).length == 0) {
        var messages = new DirectMessageCollection([], { chatID: data.chatID });
        messages.fetch({
          success: function(messages) {
            // this chat does not exist yet so we need to boot a new one
            var directMessagesView = new DirectMessagesView({ collection: messages, chatID: data.chatID, talkingTo: data.nickname });
            $('.xygaming-chat-docker-wrapper').append(directMessagesView.render().el);
          },
          error: function() {
            // there is no data
            alert('No data handle this');
          }
        });
      } else {
        return false;
      }
    });

  });
  
  // Fancy logger
  DirectChatApp.core.vent.bind('DirectChatApp:log', function(msg) {
    console.log(msg);
  });
  
  // Boot marionette
  DirectChatApp.core.start();

};

// parse the g_InitialData.friends_with_games object
function sendFriends(friendsObj) {
  
  var allFriends = [];
  var keys = Object.keys(friendsObj);

  for (var i = 0; i < keys.length; i++) {
    allFriends.push({
      handle: friendsObj[keys[i]].handle
    });
  }

  return allFriends;

}