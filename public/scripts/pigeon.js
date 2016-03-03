(function(Pigeon, root, factory) {

    // attaches the annonymous function below to the window (I think)
    root[Pigeon] = factory();

} ('Pigeon', this, function() {

    'use strict';

    var Pigeon = {}; // coo coo
    var clientSocket = io.connect('192.168.86.100:2345/', {'connect timeout': 10000});

    /*
    |--------------------------------------------------------------------------
    | $http ajax
    |--------------------------------------------------------------------------
    |
    | $http object that makes getting data from the server easier. This will
    | act as a service, call this whenever you need to make a network call.
    | There are two HTTP methods, GET and POST.
    |
    */

    var $http = {

        get: function(url, success, error) {
            httpHelper('GET', url, success, error);
        },

        post: function() {
            httpHelper('POST')
        }

    }

    function httpHelper(type, url, success, error) {
        var xmlhttp;
        xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if(xmlhttp.status == 200){
                    success(JSON.parse(xmlhttp.responseText));
                }
                else if(xmlhttp.status == 400) {
                    error(xmlhttp.status);
                }
                else {
                    error(xmlhttp.status);
                }
            }
        }

        xmlhttp.open(type, url, true);
        xmlhttp.send();
    }


    /*
    |--------------------------------------------------------------------------
    | $clientSocket sockets
    |--------------------------------------------------------------------------
    |
    | $clientSocket object that makes socket communication to the server easier.
    | Whenever the app needs to emit a message that particular part of the app 
    | can use the $clientSocket service that has simple concise methods. 
    |
    */

    var $clientSocket = {

      sendMessgae: function(message) {
        clientSocket.emit('send oneOnOneMessage', message);
      }

    }

    
    /*
    |--------------------------------------------------------------------------
    | Pigeon Model
    |--------------------------------------------------------------------------
    |
    | Model, this class needs a JSON object passed into the constructor it is 
    | the data that defines it's attributes. There are two methods, one to set
    | data on the model which will update the view. The other is to get data
    | on the model.
    |
    */

    var Model = Pigeon.Model = function(object) {
        this.attributes = object; // set model attributes within constructor
    };

    Model.prototype.set = function(object) {
        
        // TODO: Make sure only one k:v is supplied?
        var key = Object.keys(object)[0];
        var val = object[key];
        this.attributes[key] = val; // set the new value

    };

    Model.prototype.get = function(attribute) {
        return this.attributes[attribute]; // return desired attribute
    };


    /*
    |--------------------------------------------------------------------------
    | Pigeon Collection
    |--------------------------------------------------------------------------
    |
    | Collection of Models. Constructor takes a url to an array of objects, loops
    | through the objects, for each object a new model class is constructed and 
    | the object is passed into the constructor.
    |
    */

    var Collection = Pigeon.Collection = function(object) {

      var self = this;

      /*
      |--------------------------------------------------------------------------
      | set remote url
      |--------------------------------------------------------------------------
      |
      |
      */

      this.url = object.url;

      
      /*
      |--------------------------------------------------------------------------
      | set collection data
      |--------------------------------------------------------------------------
      |
      |
      */

      if(object.data) {
        this.data = (function() {
          var collection = [];
          for(var i=0; i < self.data.length; i++) {
            collection.push(new Model(self.data[i]));
          }
          return collection;
        })();
      }

    };
    
    // provides a way for collection instance can call fetch
    Collection.prototype.fetch = function(success, error) {
      var self = this;
      $http.get(this.url, function(res) {
        var collection = [];
        res.forEach(function(model) {
            collection.push(new Model(model));
        });
        self.data = collection;
        success(self); // returns an array of pigeon models
      }, function(res) {
        error(res);
      });
    };
    
    // adds a new model to the a collection instance
    Collection.prototype.add = function(model) {
      this.data.push(model);
    };


    /*
    |--------------------------------------------------------------------------
    | Pigeon View
    |--------------------------------------------------------------------------
    |
    | View forms to the data passed in. Constructor needs an element to render to
    | and rendering is done on initialization.
    |
    */

    var View = Pigeon.View = function(object) {
      
      // store this for scoping
      var self = this;
      this.socketMethods = {};
      

      /*
      |--------------------------------------------------------------------------
      | define view initialize/rendering methods
      |--------------------------------------------------------------------------
      |
      |
      */

      this.initialize = object.initialize;
      this.render = object.render;

      /*
      |--------------------------------------------------------------------------
      | define view elements
      |--------------------------------------------------------------------------
      |
      |
      */

      this.events = object.events;
      this.target = document.querySelector(object.target); // the view target el
      this.element = this.target.appendChild(document.createElement('div'));


      /*
      |--------------------------------------------------------------------------
      | associate some models to the view
      |--------------------------------------------------------------------------
      |
      |
      */

      if (object.model) {
        this.model = object.model; // the view model
      }
      if (object.collection) {
        this.collection = object.collection; // a collection of models
      }


      /*
      |--------------------------------------------------------------------------
      | create view events
      |--------------------------------------------------------------------------
      |
      |
      */

      object.events.forEach(function(eventHash) {

        // TODO: eventHash.el sketches me out since it's a general class not specific node
        document.querySelector(eventHash.el).addEventListener(eventHash.type, function(event) {
          event.preventDefault();
          object[eventHash.method](self); // trigger method
        }, false);
      });


      /*
      |--------------------------------------------------------------------------
      | create view event listener
      |--------------------------------------------------------------------------
      |
      |
      */

      this.listenTo = function(listener, collection) {
        Object.observe(collection.data, function(changes) {
            console.log("The array changed RENDER PLEASE. Changes:", changes);
            self.render();
        });
      }


      /*
      |--------------------------------------------------------------------------
      | create socket methods for view events
      |--------------------------------------------------------------------------
      |
      |
      */

      this.socketMethods.sendMessage = function(message) {
        $clientSocket.sendMessgae(message);
      }

      clientSocket.on('new oneOnOneMessage', function(data) {
        self.collection.add(new Pigeon.Model(data));
      })

      
    };

    /*
    |--------------------------------------------------------------------------
    | Initialize the view
    |--------------------------------------------------------------------------
    |
    | This gets called when ready to run the app
    |
    */

    View.prototype.initialize = function() {
      this.initialize.call(this)
    };

    View.prototype.render = function() {
      this.render.call(this)
    };


    return Pigeon;

}));