(function(Pigeon, root, factory) {

    // attaches the annonymous function to the window
    root[Pigeon] = factory();

} ('Pigeon', this, function() {

	var Pigeon = {}; // coo coo

    /*
    |--------------------------------------------------------------------------
    | $http ajax
    |--------------------------------------------------------------------------
    |
    | $http object that makes getting data from the server easier.
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
	| the data that defines it's attributes.
	|
	*/

	var Model = Pigeon.Model = function(model) {
		this.attributes = model; // set model attributes within constructor
	};

	// get attribute... prototype method to get data from a model directly
	Model.prototype.get = function(attribute) {
		return this.attributes[attribute];
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
    	this.url = object.url; // set collection url within constructor
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
		var self = this;
		if (typeof object.initialize === 'function') {
	        object.initialize.call(this); // trigger initialize method when instantiated
	    }
	    this.element = document.querySelector(object.element); // define main uiEl within constructor
	    object.models.forEach(function(model) {
	    	var listItem = document.createElement('li');
	    	listItem.appendChild(document.createTextNode(model.get('name')));
	    	self.render = self.element.appendChild(listItem); // render data inside the uiEL
	    });
	};

	
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