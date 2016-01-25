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
	| Pigeon View
	|--------------------------------------------------------------------------
	|
	| View that is constructed based on the Models passed in.
	|
	*/

	var View = Pigeon.View = function(obj) {
		obj.initialize.call(this);
	};

	
	/*
	|--------------------------------------------------------------------------
	| Pigeon Collection
	|--------------------------------------------------------------------------
	|
	| Collection of Models to be passed into a View.
	|
	*/

    var Collection = Pigeon.Collection = function(models) {};

    Collection.prototype.fetch = function() {
    	$http.get('/api/players', function(res) {
    		console.log('Model Class', Model);
    		console.log('Server Response', res);
    		res.forEach(function(model) {
    			console.log('Array Item', model);
    		});
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