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
  } catch (e) {
    socket.emit('outcome', {
      color: 'danger',
      msg: e.toString(),
    });
  }

  socket.on('joinObserver', function(data){
    var person = room.addObserver(socket);
    room.drawWait();
  });

  socket.on('joinPlayer', function(data) {
    console.log(socket.id, 'join room ID="' + room.id + '"');
    if (room.players[socket.id]) {
      console.log('The player.socket.id ="'+socket.id+'" is already in player');
      console.log('I happend proccess this error just return');
      return;
    }
    var person = room.addPlayer(socket);
    person.nick = data.nick || person.nick;
    room.drawWait();
  });

  socket.on('gameStart', function(data) {
    console.log(socket.id, 'start game', room.id);
    room.start();
  });

  socket.on('hit', function(data){
    var person = room.players[socket.id];
    console.log(socket.id, 'hit');
    person.hit();
  });

  socket.on('stand', function(data){
    var person = room.players[socket.id];
    console.log(socket.id, 'stand');
    person.stand();
  });

  socket.on('test', function(onEvent) {
    socket.emit(onEvent.event, onEvent.data);
  })

  socket.on('disconnect', function() {
    console.log(socket.id + ' disconnected');
    if(room == null)
      return;
    room.removePlayer(socket);
    room.removeObserver(socket);
    room.drawWait();
  });
});

express.io = io;
