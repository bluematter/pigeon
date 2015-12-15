/*
|--------------------------------------------------------------------------
| Pigeon direct messages app
|--------------------------------------------------------------------------
|
|
*/

"use strict";

// params
let ChatParameters = require('../../params');

// libs
let $ = require('jquery');
let Backbone = require('backbone');
let _ = require('underscore');
Backbone.$ = $;
let Marionette = require('backbone.marionette');
let socket = io.connect(ChatParameters.url_base, {'connect timeout': 10000});

// collection & view
let DirectMessageCollection = require('./collections/DirectMessageCollection');
let DirectMessagesView = require('./views/directMessagesView');

// chat class
class PigeonChat {
  
  constructor() {
    
    // initialize marionette
    this.core = new Marionette.Application();
    
    // define the app regions
    this.core.addRegions({
      directMessagesRegion: '.pigeon-chat-docker-wrapper'
    });

  }

  start() {

    // start main stuff
    this.core.vent.trigger('DirectChatApp:log', 'DirectChatApp: Starting');
    
    // on socket connection
    socket.on('connect', function (){
      console.info('socket connected');
    });
    
    // chat methods
    this.sendMessage();
    this.retriveMessage();
    
    // boot marionette
    this.core.start();

    // fancy logger
    this.core.vent.bind('DirectChatApp:log', function(msg) {
      console.log(msg);
    });

  }

  sendMessage() {
    
    // when I message someone
    $(document).on('click', '.is--online .chat-with-friend-button', function(e) {
      e.preventDefault();

      // understand who is talking
      let user = $(this).data('handle');
      let me = $('.my-username').data('username'); // grab my username from HTML
      let uniqueChatID = [me, user].sort().join(''); // need a unique ChatID
      
      // check if box exists, grab proper messages
      if($('#'+uniqueChatID).length == 0) {
        let messages = new DirectMessageCollection([], { chatID: uniqueChatID });
        messages.fetch({
          success: function(messages) {
            // pass the messages into the view
            let directMessagesView = new DirectMessagesView({ collection: messages, chatID: uniqueChatID, talkingTo: user });
            $('.pigeon-chat-docker-wrapper').append(directMessagesView.render().el);
          },
          error: function() {
            // TODO: Handle this better
            alert('No data handle this');
          }
        });
      } else {
        // the chat exists
        return false;
      }

    });

  }

  retriveMessage() {
    
    // when someone messages me
    socket.on('new oneOnOneMessage', function(data) {

      // pull in mongoDB data for an initated chat
      if($('#'+data.chatID).length == 0) {
        let messages = new DirectMessageCollection([], { chatID: data.chatID });
        messages.fetch({
          success: function(messages) {
            // this chat does not exist yet so we need to boot a new one
            let directMessagesView = new DirectMessagesView({ collection: messages, chatID: data.chatID, talkingTo: data.nickname });
            $('.pigeon-chat-docker-wrapper').append(directMessagesView.render().el);
          },
          error: function() {
            // TODO: Handle this better
            alert('No data handle this');
          }
        });
      } else {
        // the chat exists
        return false;
      }

    });

  }

};

module.exports = PigeonChat;