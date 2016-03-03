/**
 * Module dependencies.
 */

var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var cors = require('cors');
var sharedSession = require('express-socket.io-session')(session);
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var multer = require('multer');

var passport = require('passport');
var _ = require('lodash');
var flash = require('express-flash');
var expressValidator = require('express-validator');
var exphbs = require('express-handlebars');
var path = require('path');
var exphbs  = require('express-handlebars');

var checkip = require('check-ip-address');
var bunyan = require('bunyan');
var bformat = require('bunyan-format'); 
var formatOut = bformat({ outputMode: 'short' });
var logger = bunyan.createLogger({
    name: 'pigeon',
    stream: formatOut, 
    level: 'debug'
});


/**
 * API keys and Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');


/**
 * Create Express server.
 */

var app = express();


/**
 * Redis
 */

var redis = require('redis');
var connectRedis = require('connect-redis');
var RedisStore = connectRedis(session);

// redisSessionClient is used in socket.js
var redisSessionClient = redis.createClient(secrets.redisDb);
redisSessionClient.select(1);
var sessionStore = new RedisStore({prefix: 'pigeon:', client: redisSessionClient});
redisSessionClient.on('connect', function () {
    logger.info('Connected to redis successfully!');
});


/**
 * MongoDB.
 */

var mongoose = require('mongoose');
mongoose.connect(secrets.db);
mongoose.connection.on('connected', function () {
    logger.info('Connected to mongoDB successfully!');
});
mongoose.connection.on('error', function () {
    logger.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});
mongoose.connection.on('disconnected', function () {
    logger.warn('Mongoose default connection disconnected');
});


/**
 * Express configuration.
 */

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 2345);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest: path.join(__dirname, 'uploads')}));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(cors());
app.use(errorHandler());
app.use(session({
  secret: secrets.sessionSecret,
  resave: true,
  saveUninitialized: true,
  store: new RedisStore({
    prefix: 'pigeon:', 
    client: redisSessionClient
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});
app.use('/public', express.static(__dirname + '/public'));

/*
 * Routes
 */

require('./routes')(app, redisSessionClient);

/**
 * Start Express server.
 */

var server = app.listen(app.get('port'), function () {
    logger.info('Express server listening on port '+app.get('port'), app.get('env'));
});

/*
 * Socket.io
 */

var socket_server = require('./sockets')(server, redis, redisSessionClient);

/**
 * Exports
 */
module.exports = app;

exports.listen = function () {
    server.listen.apply(this.server, arguments);
};

exports.close = function (callback) {
    server.close(callback);
};