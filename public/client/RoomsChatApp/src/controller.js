
var ChatParameters = require('../../params');

var socket = io.connect(ChatParameters.url_base, {"connect timeout": 1000});

// app views
var RoomMessagesView = require('./views/roomMessagesView');

module.exports = Controller = Marionette.Controller.extend({

    initialize: function() {
        
      ChatApp.core.addRegions({
        roomMessagesRegion: '.xygaming-chat'
      });

    },

    chat: function() {

      // show room chat //TODO: Somehow determine what room we are in? Or let the server do that?
      var roomMessagesView = new RoomMessagesView({ collection: ChatApp.data.roomMessages });
      ChatApp.core.roomMessagesRegion.show(roomMessagesView);

    }


});
