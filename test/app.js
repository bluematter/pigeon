// Test the app, executed from command line 'mocha'

var app = require('../pigeon.js')({ test: true });


var request = require('supertest')
    , expect = require("expect")
    , fs = require('fs')
    , assert = require('assert')
    , http = require('http')
    , chai = require('chai');
;
var should = chai.should
    , expect = chai.expect
    , assert = chai.assert;


// Set the cookie and only then set up ioclient
//newXhr.setCookies('PHPSESSID=l6nsudcfpomngafq1efsbais52');
var ioclient = require('socket.io-client');

var io_options = {
    //transports: ['websocket'],
    'force new connection': true,
    "connect timeout": 4000
};

var socketURL = 'http://localhost:3000';

describe("Chat Server", function () {
    //var server = http.createServer().listen(0),
        //redisSessionClient = fakeRedis.createClient('testSession'),
        //redis = fakeRedis.createClient('testPubSub');


    before(function () {
        //socketio(server, redis, redisSessionClient);
    });

    beforeEach(function () {
        //redisSessionClient.set('xy_gaming:80l9vo0jch8h1uq8lraagcv077',
        // '_sf2_attributes|a:4:{s:18:"_csrf/authenticate";s:43:"kE_njB_G-iDsjp200suLN1TI52EqeCwGegpn_pKUGPA";s:8:"username";s:5:"UserD";s:14:"_security_main";s:832:"C:74:"Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken":744:{a:3:{i:0;N;i:1;s:4:"main";i:2;s:704:"a:4:{i:0;C:31:"XYGaming\UserBundle\Entity\User":357:{a:13:{i:0;s:88:"bNPcFC1Q+JSGc4nX6DvpqnxSd36NLqOdi+rjTbn2k25Ndzdzn0mD2XDFzRMPhRVBAn+SxS2jgknL+lqGd0tNHw==";i:1;s:31:"cg9h4kqvdr4gk880w44g4kcg4gckwwg";i:2;s:16:"bob@xygaming.com";i:3;s:16:"bob@xygaming.com";i:4;b:0;i:5;b:0;i:6;b:0;i:7;b:1;i:8;s:36:"a430b61d-5826-11e5-8c37-0a0027000000";i:9;N;i:10;N;i:11;s:16:"bob@xygaming.com";i:12;s:16:"bob@xygaming.com";}}i:1;b:1;i:2;a:2:{i:0;O:41:"Symfony\Component\Security\Core\Role\Role":1:{s:47:"');
        //redisSessionClient.set('xy_gaming:l6nsudcfpomngafq1efsbais52',
        // '_sf2_attributes|a:4:{s:18:"_csrf/authenticate";s:43:"orXljaJVaHs8aC6gnJe5bEuBhME0xGW6FafVZ1mxeuY";s:8:"username";s:7:"KiwiRaz";s:14:"_security_main";s:860:"C:74:"Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken":772:{a:3:{i:0;N;i:1;s:4:"main";i:2;s:732:"a:4:{i:0;C:31:"XYGaming\UserBundle\Entity\User":385:{a:13:{i:0;s:88:"agYuIiPMGaQsN9aO/HNEGbsV3A7/i7i4XgFOO31vnvKpwwGXymUl2btymC5lXI9OlTQlaBNpSldsTIAH40ZS7Q==";i:1;s:31:"burqi1j9npk4w8cswckk8og4s4sggo8";i:2;s:23:"james@beamish-white.com";i:3;s:23:"james@beamish-white.com";i:4;b:0;i:5;b:0;i:6;b:0;i:7;b:1;i:8;s:36:"a423ba4d-5826-11e5-8c37-0a0027000000";i:9;N;i:10;N;i:11;s:23:"james@beamish-white.com";i:12;s:23:"james@beamish-white.com";}}i:1;b:1;i:2;a:2:{i:0;O:41:"Symfony\Component\Security\Core\Role\Role":1:{s:47:"');

    });

    afterEach(function () {
    });


    /* Test 1 - Connect */
    it('Should successfully connect to socket', function (done) {
        this.timeout(5000);

        var client = ioclient.connect(socketURL, io_options);

        client.on('connect', function (data) {
            client.disconnect();
            done();
        });

    });

    /*
        currently this test fails for https. disabling the first test lets it avoid the "headers already sent" error.
        even if you reduce the second test to a replica of the first, this still happens.
        this suggests that there is a problem with the connects or routes or something not being terminated or sent properly.
    */
    it('Should be able to connect to a room and broadcast new user to all users', function (done) {
        this.timeout(5000);

        var roomID = 'pc-starcraft_2';

        var client1 = ioclient.connect(socketURL, io_options);
        client1.on('connect', function (data) {
            client1.emit("joinRoom", roomID);
        });

        i = 0;
        client1.on('update', function (message) {
            if (i == 0) {
                message.should.be.a('string');
                message.should.equal("UserD has connected to pc-starcraft_2 room.");
            } else if (i == 1) {
                message.should.be.a('string');
                message.should.equal("Welcome to pc-starcraft_2 room.");
                client1.disconnect();
                done();
            }
            i++;

        });

    });


    // Test 2 - A Single User joins and leaves a room 
    it('Should be able to leave a room', function (done) {

        var roomID = 'pc-starcraft_2';

        var client1 = ioclient.connect(socketURL, io_options);
        client1.on('connect', function (data) {
            client1.emit("joinRoom", roomID);
        });

        var client2 = ioclient.connect(socketURL, io_options);
        client2.on('connect', function (data) {
            client2.emit("joinRoom", roomID);
        });

        i = 0;
        client1.on('update', function (message) {
            if (i == 0) {
                message.should.be.a('string');
                message.should.equal("UserD has connected to pc-starcraft_2 room.");
            } else if (i == 1) {
                message.should.be.a('string');
                message.should.equal("Welcome to pc-starcraft_2 room.");
                client1.emit("leaveRoom", roomID);
            }
            i++;

        });


        j = 0;
        client2.on('update', function (message) {
            if (j == 0) {
                message.should.be.a('string');
                message.should.equal("UserD has connected to pc-starcraft_2 room.");
            } else if (j == 1) {
                message.should.be.a('string');
                message.should.equal("Welcome to pc-starcraft_2 room.");
            } else if (j == 2) {
                message.should.be.a('string');
                message.should.equal("UserD has left the room.");
                client1.disconnect();
                client2.disconnect();
                done();
            }
            j++;

        });


    });

    it('Should be able to send messages to other room users', function (done) {
        done();
    });

    it('Should throw and error message if the room does not exist', function (done) {
        var client = ioclient.connect(socketURL, io_options);
        client.on('connect', function (data) {
            client.emit("joinRoom", 'random_room');

            client.on('update', function (message) {
                message.should.be.a('string');
                message.should.equal("Invalid room name.");
                client.disconnect();
                done();

            });
        });

    });

    it('Should be able to join 1v1 chat', function (done) {
        done();
    });

    it('Should be able to leave 1v1 chat', function (done) {
        done();
    });


});
