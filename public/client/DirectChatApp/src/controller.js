
var ChatParameters = require('../../params');

var socket = io.connect(ChatParameters.url_base, {"connect timeout": 1000});

// app collections
var DirectMessageCollection = require('./collections/DirectMessageCollection');

// app views
var DirectMessagesView = require('./views/directMessagesView');

module.exports = Controller = Marionette.Controller.extend({

    initialize: function() {
        
      ChatApp.core.addRegions({
        directMessagesRegion: '.xygaming-chat-docker-wrapper'
      });

    },

    chat: function() {
      
      // always listen to one on one
      this.one_on_one();

    },

    one_on_one: function() {
      
      // TODO: fire the view then pull the data?

      // I want to chat with users as a client
      $('.chat-with-friend-button').on('click', function(e) {
        e.preventDefault();
        // identify the user we want to chat with, and let the server know we want to chat
        var user = $(this).data('handle');
        var me = $('li.last.dropdown span').html(); // needs a better way to get me
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

      // another user client wants to chat with me listen for it
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

    }


});
