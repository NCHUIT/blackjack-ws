var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('player/index');
});

router.get('/room-1', function(req, res, next) {
	res.render('player/nick');
});

router.get('/room-2', function(req, res, next) {
	res.render('player/room');
});

router.get('/result', function(req, res, next) {
	res.render('player/result');
});

module.exports = router;
