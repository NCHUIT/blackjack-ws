var express = require('express');
var router = express.Router();

router.get('/', function(req, res ,next) {
    res.render('observer/index', { title: 'Observer'});
});

router.get('/roomId', function(req, res, next) {
	res.render('observer/roomId');
});

router.get('/pokertable', function(req, res ,next) {
    res.render('observer/poker_table');
});

router.get('/result', function(req, res ,next) {
    res.render('observer/result');
});

module.exports = router;
