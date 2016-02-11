(function(Pigeon, root, factory) {
    root[Pigeon] = factory();
} ('Pigeon', this, function() {

	var Pigeon = {};


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
	| Model, somehow needs to be passed into the Collection.
	|
	*/

	var Model = Pigeon.Model = function() {};


	/*
	|--------------------------------------------------------------------------
	| Pigeon Collection
	|--------------------------------------------------------------------------
	|
	| Collection of Models to be passed into a View.
	|
	*/

    var Collection = Pigeon.Collection = function(models) {};
    
    Collection.prototype.fetch = function(success, error) {
    	var collection = [];
    	$http.get('/api/players', function(res) {
    		res.forEach(function(model, i) {
    			collection.push(new Model());
    		});
    		success(collection);
    	}, function(res) {
    		error(res);
    	});
    };


	/*
	|--------------------------------------------------------------------------
	| Pigeon View
	|--------------------------------------------------------------------------
	|
	| View that is constructed based on the Models passed in.
	|
	*/

	var View = Pigeon.View = function(obj) {
		if (typeof obj.initialize === 'function') {
	        obj.initialize.call(this);
	    }
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