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


    before(function () {
    });

    beforeEach(function () {
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
