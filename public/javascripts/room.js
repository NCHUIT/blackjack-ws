$(function () {
	$("#qr-code").attr("src","/qr/" + location.pathname);
	socket.emit('joinObserver');
});