
var ChatParameters = require('../../../params');
var socket = io.connect(ChatParameters.url_base, {"connect timeout": 1000});
var Marionette = require('backbone.marionette');
var $ = require('jquery');

// Chat Message
var chatMessage = Marionette.ItemView.extend({
	tagName: 'li',
	className: 'message',
  template: require('../../templates/views/directMessage.hbs')
});

// Chat View (Timestamp and data can be cleaned up)
module.exports = chatView = Marionette.CompositeView.extend({

	className: 'directMessage--view',
  template: require('../../templates/views/directMessagesView.hbs'),

  events: {
    'submit .submit-message': 'sendMessage',
    'click .minimize-chat': 'minimizeChat',
    'click .minimize-chat.minimized': 'maximumChat',
    'click .close-chat': 'closeChat'
  },

  initialize: function() {
    this.clientSocketStatus();
    this.incomingSocketMessages();
    this.on('render', this.rendered);
  },

  rendered: function() {
    setTimeout(function() {
      $('.direct-message-body').scrollTop($('.direct-message-body').prop('scrollHeight'));
    }, 0);
    
  },

  clientSocketStatus: function() {

    socket.on('error', function (reason){
      console.error('Unable to connect Socket.IO', reason);
    });

    socket.on('connect', function (){
      console.info('successfully established a working connection');
    });

  },

  incomingSocketMessages: function() {

    var self = this;
    socket.on('new oneOnOneMessage', function(data) {
      
      // make sure this element is the right element to add the message to, since the socket will trigger regardless
      if(self.$el.find('#'+data.chatID).length) {
        console.log('new oneOnOneMessage Triggered');

        // check if it's minimized so we can notify
        if(self.$el.hasClass('minimized')) {
          self.$el.find('.direct-message-header').addClass('blink-notify');
        }
        
        // generate a timestamp
        var time = new Date();
        var timeStamp = self.timeParser(time).hours +':'+ self.timeParser(time).minutes;
        self.collection.add({'nickname': data.nickname, 'message': data.message, 'timeStamp': timeStamp});
        self.$el.find('.direct-message-body').scrollTop(self.$el.find('.direct-message-body').prop('scrollHeight'));
      }

    });

    // spam notification
    socket.on('direct suspension message', function(data) {
      if(self.$el.find('#'+data.chatID).length) {
        self.collection.add({'message': data.message, 'class': data.class});
        self.$el.find('.direct-message-body').scrollTop(self.$el.find('.direct-message-body').prop('scrollHeight'));
      }
    });

  },

  sendMessage: function(e) {
    e.preventDefault();
    
    var self = this;
    var messageInput = this.$el.find('input.message');
    var inputText = messageInput.val().trim();

    if(inputText != '') {
      
      // Check update time
      var time = new Date();
      var timeStamp = this.timeParser(time).hours +':'+ this.timeParser(time).minutes;
      
      socket.emit('send oneOnOneMessage', {
        message: inputText,
        timeStamp: timeStamp,
        chattingWith: self.options.talkingTo,
        chatID: self.options.chatID
      });
      
      // need to get who I am
      var me = $('li.last.dropdown span').html(); // need a better way to get me
      messageInput.val('');
      $('.direct-message-body').scrollTop($('.direct-message-body').prop('scrollHeight'));
    }

  },

  minimizeChat: function(e) {
    $(e.currentTarget).addClass('minimized');
    this.$el.addClass('minimized');
  },

  maximumChat: function(e) {
    $(e.currentTarget).removeClass('minimized');
    this.$el.removeClass('minimized blink-notify');
    this.$el.find('.direct-message-header').removeClass('minimized blink-notify');
  },

  closeChat: function() {
    this.destroy();
  },

  timeParser: function(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    return {
      hours: hours > 12 ? hours - 12 : hours,
      minutes: minutes > 10 ? minutes : '0' + minutes,
      seconds: seconds > 10 ? seconds : '0' + seconds,
      meridiem: hours > 12 ? 'PM' : 'AM'
    }
  },

  templateHelpers: function() {

    return {
      talkingTo: this.options.talkingTo, 
      chatID: this.options.chatID, 
      altChatID: this.options.altChatID
    }

  },

  childViewContainer: ".direct-message-body ul",
  childView: chatMessage

});
