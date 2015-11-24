
var ChatParameters = require('../../../params');

var socket = io.connect(ChatParameters.url_base, {"connect timeout": 1000});

// Chat Message
var chatMessage = Marionette.ItemView.extend({
	tagName: 'li',
	className: 'message',
  template: require('../../templates/views/chatMessage.hbs')

});

// Chat View (Timestamp and data can be cleaned up)
module.exports = chatView = Marionette.CompositeView.extend({

	className: 'chat--view',
  template: require('../../templates/views/chatView.hbs'),

  events: {
    'submit .submit-message': 'sendMessage'
  },

  initialize: function() {
    this.clientSocketStatus();
    this.incomingSocketMessages();
    this.newUserConnected();
  },

  onShow: function() {
    $('.chat').scrollTop($('.chat').prop('scrollHeight'));

  },

  clientSocketStatus: function() {

    socket.on('error', function (reason){
      console.error('Unable to connect Socket.IO', reason);
    });

    socket.on('connect', function (){
      console.info('this client established a chat connection');
      socket.emit('joinRoom', g_InitialData.game.game_key);
    });

  },

  incomingSocketMessages: function() {

    var self = this;
    socket.on('new roomMessage', function(data) {
      var time = new Date();
      var timeStamp = self.timeParser(time).hours +':'+ self.timeParser(time).minutes;
      self.collection.add({'nickname': data.nickname, 'message': data.message, 'timeStamp': timeStamp});
      $('.chat').scrollTop($('.chat').prop('scrollHeight'));
    });

    // spam notification
    socket.on('room suspension message', function(data) {
      self.collection.add({'message': data.message, 'class': data.class});
      $('.chat').scrollTop($('.chat').prop('scrollHeight'));
    });

  },

  newUserConnected: function() {
    
    var self = this;
    socket.on('new user', function(data) {
      
      var message = ' has joined the room.';

      // Check update time
      var time = new Date();
      var timeStamp = self.timeParser(time).hours +':'+ self.timeParser(time).minutes;

      var noticeBoxData = {
        user: data.nickname,
        noticeMsg: message,
        time: timeStamp
      };

      self.collection.add({'nickname': data.nickname, 'message': message, 'timeStamp': timeStamp, 'class': 'color--red'});
      $('.chat').scrollTop($('.chat').prop('scrollHeight'));

    }); 

  },

  sendMessage: function(e) {
    e.preventDefault();
    
    var messageInput = this.$el.find('input');
    var inputText = messageInput.val().trim();
    
    if(inputText != '') {
      // Check update time
      var time = new Date();
      var timeStamp = this.timeParser(time).hours +':'+ this.timeParser(time).minutes;
      
      socket.emit('send roomMessage', {
        message: inputText,
        timeStamp: timeStamp,
        room_id: g_InitialData.game.game_key
      });

      messageInput.val('');
    }

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

  childViewContainer: ".chat ul",
  childView: chatMessage

});
