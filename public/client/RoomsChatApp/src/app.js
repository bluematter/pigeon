/*
|--------------------------------------------------------------------------
| XYGaming rooms messages app core
|--------------------------------------------------------------------------
|
|
*/

var ChatParameters = require('../../params');

var socket = io.connect(ChatParameters.url_base, {"connect timeout": 1000});
var RoomMessageCollection = require('./collections/RoomMessageCollection');
var RoomMessagesView = require('./views/roomMessagesView');

module.exports = RoomsChatApp = function RoomsChatApp() {};

// start
RoomsChatApp.prototype.start = function(){
  
  // bacbone sync override sends xhr with credentials
  (function() {
    var proxiedSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
      options || (options = {});
      if (!options.crossDomain) {
        options.crossDomain = true;
      }
      if (!options.xhrFields) {
        options.xhrFields = {withCredentials:true};
      }
      return proxiedSync(method, model, options);
    };
  })();

  // marionette awesomeness available inside RoomsChatApp.core
  RoomsChatApp.core = new Marionette.Application();

  RoomsChatApp.core.on('start', function () {
    RoomsChatApp.core.vent.trigger('RoomsChatApp:log', 'RoomsChatApp: Initializing');
    
    // define useful objects
    RoomsChatApp.views = {};
    RoomsChatApp.data  = {};
    
    // pull in mongoDB data 
    var messages = new RoomMessageCollection();
    messages.fetch({
      success: function(messages) {
        RoomsChatApp.data.roomMessages = messages;
        
        // add chat region
        RoomsChatApp.core.addRegions({
          roomMessagesRegion: '.xygaming-chat'
        });

        // start the RoomsChatApp
        RoomsChatApp.core.vent.trigger('RoomsChatApp:start'); 

      },
      error: function() {
        // games data
        var Messages = Backbone.Model.extend();
        RoomsChatApp.data.roomMessages = new RoomMessageCollection([
          {message: 'There was an error fetching the messages from the database.', nickname: 'BoBThaBuilder'},
          {message: 'Well isn\'t that unfortunate', nickname: 'Al'}
        ]);

        // start the RoomsChatApp anyways
        RoomsChatApp.core.vent.trigger('RoomsChatApp:start'); 
        
      }
    });

  });   

  RoomsChatApp.core.vent.bind('RoomsChatApp:start', function(options){
    RoomsChatApp.core.vent.trigger('RoomsChatApp:log', 'RoomsChatApp: Starting');
    
    var roomMessagesView = new RoomMessagesView({ collection: RoomsChatApp.data.roomMessages });
    RoomsChatApp.core.roomMessagesRegion.show(roomMessagesView);

  });
  
  // log
  RoomsChatApp.core.vent.bind('RoomsChatApp:log', function(msg) {
    console.log(msg);
  });
  
  // start the marionette RoomsChatApp
  RoomsChatApp.core.start();

};