
var ChatParameters = require('../../../params');
var messageModel = require('../models/message');

module.exports = RoomMessageCollection = Backbone.Collection.extend({
  model:  messageModel,
  url: function() {

    // this gets the ID of the chat room
    var parser = document.createElement('a');
    var url = parser.href = window.location.href;
    var room_id = url.match('[^/]+$')[0];

    return (ChatParameters.url_base + '/api/games/' + room_id + '/messages');
  }
});
