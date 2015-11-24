var chai = require('chai');
var should = chai.should()
    ,expect = chai.expect
    ,assert = chai.assert;

//var models = require('../models');
var Message = require('../models/Message');

var schema = Message.schema.paths;

describe('Message Model', function() {

  it('should have nickname string field', function() {
    schema.nickname.should.exist;
    schema.nickname.instance.should.equal('String');
  });
  it('should have message string field', function() {
    schema.message.should.exist;
    schema.message.instance.should.equal('String');
  });
  it('should have timeStamp string field', function() {
    schema.timeStamp.should.exist;
    schema.timeStamp.instance.should.equal('String');
  });
  it('should have room_id string field', function() {
    schema.room_id.should.exist;
    schema.room_id.instance.should.equal('String');
  });
  it('should have chatID string field', function() {
    schema.chatID.should.exist;
    schema.chatID.instance.should.equal('String');
  });

  it('should create a new message', function(done) {
    var message = new Message({
      nickname: 'MikeMurder33',
      message: 'I am art...tificial',
      timeStamp: '8:01',
      room_id: 'MikeMurder33KiwiRaz',
      chatID: 'MikeMurder33KiwiRaz'
    });
    message.save(function(err, message) {
      should.not.exist(err);
      message.should.exist;
      message.nickname.should.equal('MikeMurder33');
      message.message.should.equal('I am art...tificial');
      message.timeStamp.should.equal('8:01');
      message.room_id.should.equal('MikeMurder33KiwiRaz');
      message.chatID.should.equal('MikeMurder33KiwiRaz');
      done();
    })
  });

});