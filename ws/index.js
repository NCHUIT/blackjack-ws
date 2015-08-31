var io = require('socket.io')();

io.of('/test').on('connection', function(socket) {
    console.log('a user connected');
    socket.on('chat message', function(msg) {
      console.log(msg);
    });
    socket.on('disconnect', function() {
      console.log('user disconnected');
    });
});

module.exports = io;