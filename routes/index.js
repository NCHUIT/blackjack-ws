var express = require('express');
var router = express.Router();
var qr = require('qr-image');

var mobileDetect = require('../mobiledetect');

router.use(function(req, res, next) {
    this.isMobile = true;
    next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  if (this.isMobile) {
    res.redirect('room/');
  }
  res.render('index', { title: 'Express' });
});

router.get('/test',function(req,res) { 
    var code = qr.image('http://www.facebook.com', { type: 'svg'});
    res.type('svg');
    code.pipe(res);
  //res.render('test', { title: 'Test Route'})
 });

router.get('/test2', function(req, res) { 
    res.render('test');
});

module.exports = router;
