var express = require('express');

var io = require('socket.io')();
var Room = require('../room');

// already define
// express.rooms = {};
// express.people = {};

io.on('connection', function(socket) {
  var roomId = socket.handshake.query.room;
  var rooms = express.rooms;
  var people = express.people;
  var room = rooms[roomId];
  if ( roomId in rooms) {
    var person = room.addObserver(socket.id);
    people[socket.id] = person;
    console.log(socket.id + ' connected as observer'); 
  }

  socket.on('gameJoin', function(data) {
    console.log('On gameJoin');
    room.addPlayer('GOODMORNING');
    room.addPlayer('GOODAFTERNOON');
    room.addPlayer('GOODNIGHT');   
  });

  socket.on('gameStart', function(data) {
    console.log('On gameStart');
    people[socket.id].room.start();
  })

  socket.on('chat message', function(msg) {
    console.log(msg);
  });
  socket.on('disconnect', function() {
    room.removePlayer(socket.id);
    room.removeObserver(socket.id);
    delete people[socket.id];
    console.log(socket.id + ' disconnected');
  });
});

express.io = io;
