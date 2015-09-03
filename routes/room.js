var express = require('express');
var router = express.Router();

router.get('/', function(req, res ,next) {
  if (this.mobile) {

  }
  else {
    res.render('index', { title: 'Observer'});
  }
});

router.get('/:roomId/', function(req, res, next) {
  return res.send('Hello');
/*
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
*/
});

module.exports = router;
