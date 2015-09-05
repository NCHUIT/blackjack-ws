var express = require('express');

var io = require('socket.io')();
var Room = require('../room');

// already define
// express.rooms = {};

io.on('connection', function(socket) {
  try{
    console.log(socket.id + ' connected');
    var roomId = socket.handshake.query.room;
    var rooms = express.rooms;
    if( !roomId in rooms )
      throw "room not exists";
    var room = rooms[roomId];
    var person = room.addObserver(socket);
  } catch (e) {
    socket.emit('outcome', {
      color: 'danger',
      msg: e.toString(),
    });
  }

  socket.on('gameJoin', function(data) {
    console.log(socket.id, 'join game', room.id);
    room.removeObserver(socket);
    room.addPlayer(socket);
  });

  socket.on('gameStart', function(data) {
    console.log(socket.id, 'start game', room.id);
    room.start();
  })

  socket.on('disconnect', function() {
    console.log(socket.id + ' disconnected');
    if(room == null)
      return;
    room.removePlayer(socket);
    room.removeObserver(socket);
  });
});

express.io = io;
