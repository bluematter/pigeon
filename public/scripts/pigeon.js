(function(Pigeon, root, factory) {

    // attaches the annonymous function below to the window (I think)
    root[Pigeon] = factory();

} ('Pigeon', this, function() {

    var Pigeon = {}; // coo coo
    //var socket = io.connect(ChatParameters.url_base, {'connect timeout': 10000});

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

    };

    Model.prototype.get = function(object) {
        return this.attributes[object]; // return desired attribute
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
      this.collection = object;
      this.data = (function() {
        var collection = [];
        for(var i=0; i < self.collection.data.length; i++) {
          collection.push(new Model(self.collection.data[i]));
        }
        return collection;
      })();
      if (object.url) {
        this.url = object.url; // set collection url within constructor
      }
    };
    
    // fetch data... prototype method for newly created instances
    Collection.prototype.fetch = function(success, error) {
        $http.get(this.url, function(res) {
            var collection = [];
            res.forEach(function(model) {
                collection.push(new Model(model));
            });
            success(collection); // returns an array of pigeon models
        }, function(res) {
            error(res);
        });
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
      this.listenTo = function(listener, model) {
        Object.observe(model.attributes, function(changes) {
          self.render(); // change detected re-render
        });
      }
      
      // TODO: Create an events class or something this.element should be the desired el inside view
      // handle view events
      var event = Object.keys(this.view.events)[0];
      var method = this.view.events[event];
      this.element.addEventListener(event, function(event) {
        self.view[method](self);
      }, false);

      
    };

    View.prototype.render = function() {
      this.view.render.call(this); // call render when needed
    }

    
    /*
    |--------------------------------------------------------------------------
    | Pigeon Controller
    |--------------------------------------------------------------------------
    |
    | Controller, not sure how to use yet.
    |
    */

    var Controller = Pigeon.Controller = function() {};


    return Pigeon;

}));