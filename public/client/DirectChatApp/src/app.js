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

console.log(Marionette);

var socket = io.connect(ChatParameters.url_base, {'connect timeout': 10000});
var DirectMessageCollection = require('./collections/DirectMessageCollection');
var DirectMessagesView = require('./views/directMessagesView');

module.exports = DirectChatApp = function DirectChatApp() {};

// Extend Chatapp with a start method
DirectChatApp.prototype.start = function(server){
  
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
      // var friendsObj = g_InitialData.friends_with_games;
      // var myHandle = g_InitialData.user.handle;
      // var myFriends = sendFriends(friendsObj);
      
      // tell my friends im online
      //socket.emit('im online', {myHandle: myHandle, online: true, myFriends: myFriends});

      // figure out who is online
      // $.get(ChatParameters.url_base + '/api/friends/', {myFriends} ).done(function(data) {
      //   $.each(data, function(i,v) {
      //     if(data[i].online) {
      //       $('#my-friends-panel li.friend-item[data-handle="'+data[i].friend+'"] span.message-buttons').addClass('is--online');
      //     }
      //   });
      // });
    });

    // show a button for all logged in users on my friends list
    // socket.on('online notification', function(data) {
    //   console.log(data);
    //   $('#my-friends-panel li.friend-item[data-handle="'+data.myHandle+'"] span.message-buttons').addClass('is--online');
    // });
    
    // // remove a button for all logged out users on my friends list
    // socket.on('offline notification', function(data) {
    //   console.log(data);
    //   $('#my-friends-panel li.friend-item[data-handle="'+data.myHandle+'"] span.message-buttons').removeClass('is--online');
    // });

    /*
    |--------------------------------------------------------------------------
    | Initiate a chat with a friend
    |--------------------------------------------------------------------------
    */
    $(document).on('click', '.is--online .chat-with-friend-button', function(e) {
      e.preventDefault();
      // identify the user we want to chat with, and let the server know we want to chat
      var user = $(this).data('handle');
      var me = 'MikeBoy'; // needs a better way to get me
      var uniqueChatID = [me, user].sort().join(''); // need a unique ChatID
      
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