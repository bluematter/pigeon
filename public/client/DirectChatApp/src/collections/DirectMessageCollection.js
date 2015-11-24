
var ChatParameters = require('../../../params');
var messageModel = require('../models/message');
var Backbone = require('backbone');

module.exports = DirectMessageCollection = Backbone.Collection.extend({
  model:  messageModel,
  initialize: function(models, options) {
  	this.chatID = options.chatID;
  },
  url: function() {

  	// get the proper chat id
  	return (ChatParameters.url_base + '/api/chat/' + this.chatID + '/messages');

  }
});