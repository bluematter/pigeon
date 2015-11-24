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

var _ = require('lodash');
var flash = require('express-flash');
var path = require('path');
var expressValidator = require('express-validator');
var exphbs = require('express-handlebars');
var connectAssets = require('connect-assets');
var path = require('path');
var fs = require('fs');
var https = require('https');
var mongoose = require('mongoose');
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
var sessionStore = new RedisStore({prefix: 'pigeon:', client: redisSessionClient});
redisSessionClient.on('connect', function () {
    logger.info('65:', 'Connected to redis successfully!');
});


/**
 * Connect to MongoDB.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('connected', function () {
    logger.info('75:', 'Connected to mongoDB successfully!');
});
mongoose.connection.on('error', function () {
    logger.error('78:', 'MongoDB Connection Error. Please make sure that MongoDB is running.');
});
mongoose.connection.on('disconnected', function () {
    logger.warn('81:', 'Mongoose default connection disconnected');
});


/**
 * Express configuration.
 */

var origins = ['localhost', 'localhost:8000', '10.15.137.14:2345'];
var protocols = ['http://', 'https://'];
var whitelist = [];
protocols.forEach(function(protocol) {
    origins.forEach(function(origin) {
        whitelist.push(protocol + origin);
    });
});

var corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    }
};

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 2345);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest: path.join(__dirname, 'uploads')}));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(session({
  secret: secrets.sessionSecret,
  resave: true,
  saveUninitialized: true
}))
//app.use(flash());
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
 * SSL Config
 */
// var certsPath = path.join(__dirname, 'ssl');
// var privateKey = fs.readFileSync('./ssl/xygaming.com.key').toString();
// var certificate = fs.readFileSync('./ssl/xygaming.com.crt').toString();
// var ca = fs.readFileSync('./ssl/gd_bundle-g2-g1.crt').toString();

// var express_options = {
//     key: privateKey,
//     cert: certificate,
//     ca: ca,
// };

/**
 * Start Express server.
 */

var server;

var is_https = false;

if (!is_https) {
    server = app.listen(app.get('port'), function () {
        logger.info('152:', 'Express server listening on port %d using HTTP in %s mode', app.get('port'), app.get('env'));
    });
} else {
    server = https.createServer(express_options);
    checkip.getExternalIp().then(function (ip) {

        var ip = '';
        var host = ip || 'symfony.xygaming.com';

        function listen(input_app) {
            logger.debug('Express server listening on port %d using HTTPS in %s mode', input_app.get('port'), input_app.get('env'));
            server.on('request', input_app);
            server.listen(input_app.get('port'), function () {
                port = server.address().port;
                logger.debug('Listening on https://127.0.0.1:' + port);
                logger.debug('Listening on https://symfony.xygaming.com:' + port);
                if (ip) {
                    logger.debug('Listening on https://' + ip + ':' + port);
                }
            });
        }

        listen(app);
    });
}

/*
 * Socket.io
 */

var socket_server = require('./sockets')(server, redis, redisSessionClient);

//console.log(socket_server);
//function setTestAuthentication() {
    //socket_server.setTestAuthentication();
//}
/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Exports
 */
module.exports = function(options) {
    if(options.test === true) {
        socket_server.setTestAuthentication();
    };
    return app;
}

exports.listen = function () {
    server.listen.apply(this.server, arguments);
};

exports.close = function (callback) {
    server.close(callback);
};