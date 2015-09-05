$(function () {
  var ws_url = location.origin+location.pathname;
  ws_url = ws_url.replace(/\/$/, '');
  window.socket = io( {
    query: $.param({
      room: location.pathname.match(/[nchuit]{6}/)[0],
    }),
  });
  socket.on('drawObserver', function(data){
    console.log('drawObserver', data);
  });
  socket.on('drawPlayer', function(data){
    console.log('drawPlayer', data);
  });
  socket.on('outcome', function(data){
    console.log('outcome', data);
  });
  socket.on('hitOrStand', function(data){
    console.log('hitOrStand', data);
  });
});
