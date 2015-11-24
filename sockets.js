/*
 * Sockets.js 
 * handles all the socket.io logic and redis pub/sub
 *
 * inspired by https://github.com/rajaraodv/redispubsub and https://github.com/tamaspiros/advanced-chat among others
 */

// SocketIO libs
var sio = require('socket.io');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var redisIo = require('socket.io-redis');

// Chat models
var Message = require('./models/Message');
var Room = require('./models/Room');

// Other libs
var url = require('url');
var swearjar = require('swearjar');
var _ = require('underscore')._;

var bunyan = require('bunyan');
var bformat = require('bunyan-format'); 
var formatOut = bformat({ outputMode: 'short' });
var logger = bunyan.createLogger({
    name: 'pigeon sockets',
    stream: formatOut
});

// Rate limit algorithm vars
var rate = 4.0; // unit: messages
var per = 5.0; // unit: seconds
var allowance = rate; // unit: messages
var last_check = new Date().getTime() / 1000;
var timeout;

// Censor, perhaps move to dif file
var PROFANEWORDS = ["4r5e", "5h1t", "5hit", "a55", "anal", "anus", "ar5e", "arrse", "arse", "ass", "ass-fucker", "asses", "assfucker", "assfukka", "asshole", "assholes", "asswhole", "a_s_s", "b!tch", "b00bs", "b17ch", "b1tch", "ballbag", "balls", "ballsack", "bastard", "beastial", "beastiality", "bellend", "bestial", "bestiality", "bi+ch", "biatch", "bitch", "bitcher", "bitchers", "bitches", "bitchin", "bitching", "bloody", "blow job", "blowjob", "blowjobs", "boiolas", "bollock", "bollok", "boner", "boob", "boobs", "booobs", "boooobs", "booooobs", "booooooobs", "breasts", "buceta", "bugger", "bum", "bunny fucker", "butt", "butthole", "buttmuch", "buttplug", "c0ck", "c0cksucker", "carpet muncher", "cawk", "chink", "cipa", "cl1t", "clit", "clitoris", "clits", "cnut", "cock", "cock-sucker", "cockface", "cockhead", "cockmunch", "cockmuncher", "cocks", "cocksuck", "cocksucked", "cocksucker", "cocksucking", "cocksucks", "cocksuka", "cocksukka", "cok", "cokmuncher", "coksucka", "coon", "cox", "crap", "cum", "cummer", "cumming", "cums", "cumshot", "cunilingus", "cunillingus", "cunnilingus", "cunt", "cuntlick", "cuntlicker", "cuntlicking", "cunts", "cyalis", "cyberfuc", "cyberfuck", "cyberfucked", "cyberfucker", "cyberfuckers", "cyberfucking", "d1ck", "damn", "dick", "dickhead", "dildo", "dildos", "dink", "dinks", "dirsa", "dlck", "dog-fucker", "doggin", "dogging", "donkeyribber", "doosh", "duche", "dyke", "ejaculate", "ejaculated", "ejaculates", "ejaculating", "ejaculatings", "ejaculation", "ejakulate", "f u c k", "f u c k e r", "f4nny", "fag", "fagging", "faggitt", "faggot", "faggs", "fagot", "fagots", "fags", "fanny", "fannyflaps", "fannyfucker", "fanyy", "fatass", "fcuk", "fcuker", "fcuking", "feck", "fecker", "felching", "fellate", "fellatio", "fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking", "fingerfucks", "fistfuck", "fistfucked", "fistfucker", "fistfuckers", "fistfucking", "fistfuckings", "fistfucks", "flange", "fook", "fooker", "fuck", "fucka", "fucked", "fucker", "fuckers", "fuckhead", "fuckheads", "fuckin", "fucking", "fuckings", "fuckingshitmotherfucker", "fuckme", "fucks", "fuckwhit", "fuckwit", "fudge packer", "fudgepacker", "fuk", "fuker", "fukker", "fukkin", "fuks", "fukwhit", "fukwit", "fux", "fux0r", "f_u_c_k", "gangbang", "gangbanged", "gangbangs", "gaylord", "gaysex", "goatse", "God", "god-dam", "god-damned", "goddamn", "goddamned", "hardcoresex", "hell", "heshe", "hoar", "hoare", "hoer", "homo", "hore", "horniest", "horny", "hotsex", "jack-off", "jackoff", "jap", "jerk-off", "jism", "jiz", "jizm", "jizz", "kawk", "knob", "knobead", "knobed", "knobend", "knobhead", "knobjocky", "knobjokey", "kock", "kondum", "kondums", "kum", "kummer", "kumming", "kums", "kunilingus", "l3i+ch", "l3itch", "labia", "lust", "lusting", "m0f0", "m0fo", "m45terbate", "ma5terb8", "ma5terbate", "masochist", "master-bate", "masterb8", "masterbat*", "masterbat3", "masterbate", "masterbation", "masterbations", "masturbate", "mo-fo", "mof0", "mofo", "mothafuck", "mothafucka", "mothafuckas", "mothafuckaz", "mothafucked", "mothafucker", "mothafuckers", "mothafuckin", "mothafucking", "mothafuckings", "mothafucks", "mother fucker", "motherfuck", "motherfucked", "motherfucker", "motherfuckers", "motherfuckin", "motherfucking", "motherfuckings", "motherfuckka", "motherfucks", "muff", "mutha", "muthafecker", "muthafuckker", "muther", "mutherfucker", "n1gga", "n1gger", "nazi", "nigg3r", "nigg4h", "nigga", "niggah", "niggas", "niggaz", "nigger", "niggers", "nob", "nob jokey", "nobhead", "nobjocky", "nobjokey", "numbnuts", "nutsack", "orgasim", "orgasims", "orgasm", "orgasms", "p0rn", "pawn", "pecker", "penis", "penisfucker", "phonesex", "phuck", "phuk", "phuked", "phuking", "phukked", "phukking", "phuks", "phuq", "pigfucker", "pimpis", "piss", "pissed", "pisser", "pissers", "pisses", "pissflaps", "pissin", "pissing", "pissoff", "poop", "porn", "porno", "pornography", "pornos", "prick", "pricks", "pron", "pube", "pusse", "pussi", "pussies", "pussy", "pussys", "rectum", "retard", "rimjaw", "rimming", "s hit", "s.o.b.", "sadist", "schlong", "screwing", "scroat", "scrote", "scrotum", "semen", "sex", "sh!+", "sh!t", "sh1t", "shag", "shagger", "shaggin", "shagging", "shemale", "shi+", "shit", "shitdick", "shite", "shited", "shitey", "shitfuck", "shitfull", "shithead", "shiting", "shitings", "shits", "shitted", "shitter", "shitters", "shitting", "shittings", "shitty", "skank", "slut", "sluts", "smegma", "smut", "snatch", "son-of-a-bitch", "spac", "spunk", "s_h_i_t", "t1tt1e5", "t1tties", "teets", "teez", "testical", "testicle", "tit", "titfuck", "tits", "titt", "tittie5", "tittiefucker", "titties", "tittyfuck", "tittywank", "titwank", "tosser", "turd", "tw4t", "twat", "twathead", "twatty", "twunt", "twunter", "v14gra", "v1gra", "vagina", "viagra", "vulva", "w00se", "wang", "wank", "wanker", "wanky", "whoar", "whore", "willies", "willy", "xrated", "xxx"];
var CENSOR = ("********").split("").join("*");
PROFANEWORDS = new RegExp(PROFANEWORDS.join("|"), "gi");

/**
 * /**
 * Socket.io
 *
 * @param app {Express} app `Express` instance.
 * @param server {HTTPServer} server `http` server instance.
 * @param redis {redis} publish
 * @param redisSessionClient
 * @constructor
 */

function Sockets(server, redis, redisSessionClient) {

    var socket_server_obj = {};

    var secrets = require('./config/secrets');
    var pub = redis.createClient({'return_buffers': true});
    var sub = redis.createClient({'return_buffers': true});
    var io = sio.listen(server);
    var users = {};
    var connected = {};
    var people = {};
    var rooms = {};
    var sockets = [];
    var functions = {};

    var room_names = ['users', 'warriors'];

    _.each(room_names, function (room_name) {
        var room = new Room(room_name);
        rooms[room_name] = room;
    });

    // authorize to see who the user is, relies on proper cookies
    var authentication = function (handshake, callback) {
        
        var cookies = cookie.parse(handshake.headers.cookie);
        handshake.headers.pigeon = {
            user: {username: cookies.username}
        };

        return callback(null, {});

    };

    var testAuthentication = function (handshake, callback) {

        logger.debug('IO test authentication, setting headers.');
        var session = '_sf2_attributes|a:4:{s:18:"_csrf/authenticate";s:43:"kE_njB_G-iDsjp200suLN1TI52EqeCwGegpn_pKUGPA";s:8:"username";s:5:"UserD";s:14:"_security_main";s:832:"C:74:"Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken":744:{a:3:{i:0;N;i:1;s:4:"main";i:2;s:704:"a:4:{i:0;C:31:"XYGaming\UserBundle\Entity\User":357:{a:13:{i:0;s:88:"bNPcFC1Q+JSGc4nX6DvpqnxSd36NLqOdi+rjTbn2k25Ndzdzn0mD2XDFzRMPhRVBAn+SxS2jgknL+lqGd0tNHw==";i:1;s:31:"cg9h4kqvdr4gk880w44g4kcg4gckwwg";i:2;s:16:"bob@xygaming.com";i:3;s:16:"bob@xygaming.com";i:4;b:0;i:5;b:0;i:6;b:0;i:7;b:1;i:8;s:36:"a430b61d-5826-11e5-8c37-0a0027000000";i:9;N;i:10;N;i:11;s:16:"bob@xygaming.com";i:12;s:16:"bob@xygaming.com";}}i:1;b:1;i:2;a:2:{i:0;O:41:"Symfony\Component\Security\Core\Role\Role":1:{s:47:"';
        handshake.headers.xygaming = {
            user: {username: 'UserD'}
        };
        return callback(null, session);
    };

    functions.authentication = authentication;
    //functions.authentication = testAuthentication;
    io.set('authorization', function(handshake, callback) {
        functions.authentication(handshake, callback);
    });

    socket_server_obj.setTestAuthentication = function() {
        logger.info('Setting test authentication');
        functions.authentication = testAuthentication;
    };

    // pub/sub adapter
    io.adapter(redisIo({
        host: 'localhost',
        port: 6379,
        pubClient: pub,
        subClient: sub
    }));
    
    io.sockets.on('connection', function (socket) {
        
        logger.info('119:', 'Username via cookie: ', socket.handshake.headers.pigeon.user.username);
        
        // online tracking with redis
        var userStatus = JSON.stringify({"online": true, "socketId": socket.id});
        redisSessionClient.set("online:"+socket.handshake.headers.pigeon.user.username, userStatus);

        // when a user connects announce to friends
        socket.on("im online", function (data) {
            if(data.myFriends != undefined) {
                for(i=0;i<data.myFriends.length;i++) {
                    io.to(users[data.myFriends[i].handle]).emit('online notification', data);
                }
            }
        });
        
        // Temporary way to update the users list
        io.emit("new user connected", {whoConnected: socket.handshake.headers.pigeon.user.username})

        // store the users & socket.id into objects
        users[socket.handshake.headers.pigeon.user.username] = socket.id;

        // track connected
        connected[socket.handshake.headers.pigeon.user.username] = true;
        people[socket.id] = {"name": socket.handshake.headers.pigeon.user.username, "inroom": null};

        var nickname = socket.handshake.headers.pigeon.user.username;
        var messageStack = [];

        socket.on("joinRoom", function (id) {
            if (typeof people[socket.id] !== "undefined") {
                if (typeof rooms[id] === 'undefined') {
                    logger.debug("Invalid room name:" + id);
                    socket.emit("update", "Invalid room name.");
                } else {
                    var room = rooms[id];
                    logger.debug("Socket:" + socket.id + " trying to connect to roomID:" + id);
                    logger.debug("Inroom is:");
                    logger.debug(people[socket.id].inroom);

                    if (_.contains((room.people), socket.id)) {
                        socket.emit("update", "You have already joined this room.");
                    } else {
                        if (typeof(people[socket.id].inroom) !== 'undefined' && people[socket.id].inroom !== null) {
                            socket.emit("update", "You are already in a room (" + rooms[people[socket.id].inroom].id + "), please leave it first to join another room.");
                        } else {
                            room.addPerson(socket.id);
                            people[socket.id].inroom = id;
                            socket.room = room.name;
                            logger.debug("Adding user to roomID:" + id + ", joining socket:" + socket.room);
                            socket.join(socket.room);
                            user = people[socket.id];

                            logger.debug("Emitting 'new user' message for room_id:" + room.id);
                            io.sockets.in(socket.room).emit("update", nickname + " has connected to " + room.id + " room.");
                            socket.emit("update", "Welcome to " + room.id + " room.");
                            socket.emit("sendRoomID", {id: id});
                        }
                    }
                }

            } else {
                socket.emit("update", "Please enter a valid name first.");
            }
        });

        socket.on("leaveRoom", function (id) {
            var room = rooms[id];
            if (room)
                purge(socket, "leaveRoom");
        });


        // listen for the client to send a message
        socket.on('send roomMessage', function (data) {
            logger.debug("Received roomMessage");
            logger.debug(data.message);
            var no_empty = data.message.replace("\n", "");
            if (no_empty.length > 0) {

                // generate a message object
                var message = {
                    message_date: Date.now(),
                    nickname: nickname,
                    message: clearProfanity(data.message),
                    timeStamp: data.timeStamp,
                    room_id: data.room_id
                };

                // check if messages are being spammed (must disable socket from specific chat module room)
                if(socket.roomDisabled) {
                    socket.emit('room suspension message', {message: 'You are suspended for a short time...', class: 'color--red'});
                    clearTimeout(timeout);
                    timeout = setTimeout(function () {
                        socket.roomDisabled = false;
                        socket.emit('room suspension message', {message: 'It\'s been 10 seconds you may continue...', class: 'color--green'});
                    }, 10000);
                } else {
                    if (rateLimit()) {
                        logger.info('Message OK');
                        // save the message inside mongodb
                        var newMessage = new Message(message);
                        newMessage.save(function(err, messageDocument) {
                            if(err)
                                logger.warn('failed to insert the message');
                            logger.info('successfully saved message: ' + messageDocument._id);
                            // emit the message to the room
                            io.sockets.in(socket.room).emit('new roomMessage', message);
                        });
                    } else {
                        if (socket.roomDisabled) {
                        } else {
                            logger.warn('Message Fail');
                            socket.roomDisabled = true;
                            socket.emit('room suspension message', {message: 'You are suspended for a short time...', class: 'color--red'});
                            timeout = setTimeout(function () {
                                socket.roomDisabled = false;
                                socket.emit('room suspension message', {message: 'It\'s been 10 seconds you may continue...', class: 'color--green'});
                            }, 10000);
                        }
                    }
                }

            }

        });

        // listen for the client to send a message
        socket.on('send oneOnOneMessage', function (data) {

            var chattingWith = data.chattingWith;
            var chatID = data.chatID;

            var no_empty = data.message.replace("\n", "");
            if (no_empty.length > 0) {

                // generate a message object
                var message = {
                    message_date: Date.now(),
                    nickname: data.myName,
                    message: clearProfanity(data.message),
                    timeStamp: data.timeStamp,
                    chatID: chatID
                };

                // check if messages are being spammed
                if(socket.directDisabled) {
                    socket.emit('direct suspension message', {message: 'You are suspended for a short time...', class: 'color--red', chatID: chatID});
                    clearTimeout(timeout);
                    timeout = setTimeout(function () {
                    socket.directDisabled = false;
                    socket.emit('direct suspension message', {message: 'It\'s been 10 seconds you may continue...', class: 'color--green', chatID: chatID});
                    }, 10000);
                } else {
                    if (rateLimit()) {
                        logger.info('Message OK');
                        // check if the intended user exists TODO: need this to go both ways
                        logger.info('(User name): '+nickname+' (User ID): '+socket.id+' chatting with (User name): '+chattingWith+' (User ID): '+ users[chattingWith]); 
                        // save the message inside mongodb
                        var newMessage = new Message(message);
                        newMessage.save(function(err, messageDocument) {
                            if(err)
                                logger.info('failed to insert the message');
                                logger.info('successfully saved message: ' + messageDocument._id);
                            if(users[chattingWith]) {
                                logger.info('The message is about to emit to '+ users[chattingWith]);
                                io.to(users[chattingWith]).emit('new oneOnOneMessage', {message: clearProfanity(data.message), nickname: nickname, chatID: chatID });
                            }
                            socket.emit('new oneOnOneMessage', {message: clearProfanity(data.message), nickname: nickname, chatID: chatID });
                        });
                    } else {
                        if (socket.directDisabled) {
                        } else {
                            socket.directDisabled = true;
                            socket.emit('direct suspension message', {message: 'You are suspended for a short time...', class: 'color--red', chatID: chatID});
                            timeout = setTimeout(function () {
                                socket.directDisabled = false;
                                socket.emit('direct suspension message', {message: 'It\'s been 10 seconds you may continue...', class: 'color--green', chatID: chatID});
                            }, 10000);
                        }
                    }
                }

            }
        });

        socket.on('set status', function (data) {
            var status = data.status;
            io.sockets.emit('user-info update', {
                username: nickname,
                status: status
            });
        });

        socket.on('disconnect', function () {
            logger.debug("Disconnecting from room, user:" + nickname + ", room_id:" + socket.room);
            
            // so when the user refreshes or goes to another page we dont disconnect
            connected[socket.handshake.headers.username] = false;
            setTimeout(function () {
                if(connected[socket.handshake.headers.username] === false) {
                    logger.info('its been 10 seconds user is disconnected');
                    redisSessionClient.set('online:'+socket.handshake.headers.username, '{"online": false}');
                    socket.broadcast.emit('offline notification', {myHandle: socket.handshake.headers.username, online: false}); // announce who disconnected currently announces to ALL
                    delete users[socket.handshake.headers.username];
                }
            }, 10000);

            io.sockets.in(socket.room).emit('user leave', {nickname: nickname});
 
            if (typeof people[socket.id] !== "undefined") { //this handles the refresh of the screen
                purge(socket, "disconnect");
            }

            logger.debug("Disconnected, users now:");
            logger.debug(users);
        });

    });

    function purge(s, action) {
        /*
         The action will determine how we deal with the room/user removal.
         These are the following scenarios:

         if the user is in a room:
         1) disconnects
         - delete user from people object
         - remove user from room.people object
         2) leaves the room
         - same as point 1 except not removing user from the people object

         if the user is not in a room:
         1) disconnects
         - same as above except not removing user from room.people object
         2) leaves the room
         - n/a
         */

        if (people[s.id].inroom) { //user is in a room
            logger.debug("Purge called - user is in the room");
            var room = rooms[people[s.id].inroom]; //check which room user is in.

            if (action === "disconnect") {
                io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
                if (_.contains((room.people), s.id)) {
                    var personIndex = room.people.indexOf(s.id);
                    room.people.splice(personIndex, 1);
                    s.leave(room.name);
                }
                delete people[s.id];
                //sizePeople = _.size(people);
                //io.sockets.emit("update-people", {people: people, count: sizePeople});
                var o = _.findWhere(sockets, {'id': s.id});
                sockets = _.without(sockets, o);
            } else if (action === "leaveRoom") {
                if (_.contains((room.people), s.id)) {
                    var personIndex = room.people.indexOf(s.id);
                    room.people.splice(personIndex, 1);
                    people[s.id].inroom = null;
                    io.sockets.emit("update", people[s.id].name + " has left the room.");
                    s.leave(room.name);
                }
            }

        } else {
            logger.debug("Purge called - user is NOT in the room");
            //The user isn't in a room, but maybe he just disconnected, handle the scenario:
            if (action === "disconnect") {
                io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
                delete people[s.id];
                sizePeople = _.size(people);
                io.sockets.emit("update-people", {people: people, count: sizePeople});
                var o = _.findWhere(sockets, {'id': s.id});
                sockets = _.without(sockets, o);
            }
        }
    }

    return socket_server_obj;
};

// parses the time
function timeParser(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    return {
        hours: hours > 12 ? hours - 12 : hours,
        minutes: minutes > 10 ? minutes : '0' + minutes,
        seconds: seconds > 10 ? seconds : '0' + seconds,
        meridiem: hours > 12 ? 'PM' : 'AM'
    }
}

// rate limit algorithm
function rateLimit() {
    current = new Date().getTime() / 1000;
    time_passed = current - last_check;
    last_check = current;
    allowance = allowance + time_passed * (rate / per);

    if (allowance > rate) {
        allowance = rate;
    }
    if (allowance < 1.0) {
        logger.info('discard message');
        return false;
    } else {
        allowance = allowance - 1.0;
        logger.info('forward message');
        return true;
    }
}

// clean up profane words
function clearProfanity(word) {
    return word.replace(PROFANEWORDS, function (m) {
        return CENSOR.substr(0, m.length)
    });
}

/**
 * Expose Sockets initialization
 */

module.exports = Sockets;