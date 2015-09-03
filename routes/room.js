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
});

module.exports = router;
