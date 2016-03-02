(function(Pigeon, root, factory) {

    // attaches the annonymous function below to the window (I think)
    root[Pigeon] = factory();

} ('Pigeon', this, function() {

    var Pigeon = {}; // coo coo
    var clientSocket = io.connect('localhost:2345', {'connect timeout': 10000});

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

    };

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
    };


    /*
    |--------------------------------------------------------------------------
    | $clientSocket socket
    |--------------------------------------------------------------------------
    |
    | $clientSocket object that makes socket communication to the server easier.
    | Whenever the app needs to emit a message that particular part of the app 
    | can use the $clientSocket service that has simple concise methods. 
    |
    */

    var $clientSocket = {

      sendMessgae: function() {
        clientSocket.emit('send oneOnOneMessage', {
          message: 'dummy message',
          timeStamp: 'dummyTimeStamp',
          chattingWith: 'dummyTo',
          chatID: 'dummyID'
        });
      },
      gotMessage: function() {}

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
        
        // TODO: Make sure only one k:v is supplied
        var key = Object.keys(object)[0];
        var val = object[key];
        this.attributes[key] = val; // set the new value
        console.log(this.attributes)

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

    // Collection of Models
    var Collection = Pigeon.Collection = function(object) {

      var self = this;

      // collection definition
      this.collection = object;

      // set collection remote url
      if (object.url) {
        this.url = object.url; // set collection url within constructor
      }

      // set collection data
      if(this.collection.data) {
        this.data = (function() {
          var collection = [];
          for(var i=0; i < self.data.length; i++) {
            collection.push(new Model(self.data[i]));
          }
          return collection;
        })();
      }

    };
    
    // fetch data... prototype method for newly created instances
    Collection.prototype.fetch = function(success, error) {
      var self = this;
        $http.get(this.url, function(res) {
            var collection = [];
            res.forEach(function(model) {
                collection.push(new Model(model));
            });
            self.data = collection;
            success(self.data); // returns an array of pigeon models
        }, function(res) {
            error(res);
        });
    };

    // add a new model to the collection
    Collection.prototype.add = function(model, view) {

      // TODO: I don't like this, I need a way to re-render the view anytime the 
      // collection associated with the view changes, not just in this method..
      //view.render();
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
      
      // define the view
      this.view = object; // the view constructor object
      this.targetEl = document.querySelector(this.view.element); // the view target el
      this.viewEl = document.createElement('div');
      
      // set view wrapper id or class
      if(this.view.id) {
        this.viewEl.id = this.view.id; // set a wrapping id
      }
      if(this.view.class) {
        this.viewEl.classList.add(this.view.class) // set a wrapping class
      }
      
      // create the main view element
      this.element = this.targetEl.appendChild(this.viewEl);
      
      // set the view model
      if (this.view.model) {
        this.model = this.view.model; // the view model
      }
      if (this.view.collection) {
        this.collection = this.view.collection; // a collection of models
      }
      
      // view listener
      this.listenTo = function(listener, data) {
        var arr = data || [];
        for(var i=0; i < arr.length; i++) {
          var item = arr[i];
          Object.observe(item.attributes, function(changes){
            self.render(); // changes re render
          });
        }
      }
      
      // TODO: Create an events class or something this.element should be the desired el inside view
      // handle view events
      var event = Object.keys(this.view.events)[0];
      var method = this.view.events[event];
      this.element.addEventListener(event, function(event) {
        self.view[method](self);
      }, false);

      // messaging
      this.view.send = function() {
        $clientSocket.sendMessgae();
      };

      
    };

    View.prototype.render = function() {
      this.view.render.call(this); // call render when needed
    }


    return Pigeon;

}));