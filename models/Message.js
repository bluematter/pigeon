var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
  
  message_date: Date,
  nickname: String,
  message: String,
  timeStamp: String,
  room_id: String,
  chatID: String

});

module.exports = mongoose.model('Message', messageSchema);