var express = require('express');

var io = require('socket.io')();
var Room = require('../room');

// already define
// express.rooms = {};
// express.people = {};

io.on('connection', function(socket) {
  var roomId = null;
  console.log("Query: ", socket.handshake.query);
    console.log('On all');
    console.log('a user connected');
    socket.on('chat message', function(msg) {
      console.log(msg);
    });
    socket.on('disconnect', function() {
      console.log('user disconnected');
    });
});

express.io = io;
