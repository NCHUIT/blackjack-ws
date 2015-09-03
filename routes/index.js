var express = require('express');
var colors = require('colors');
var router = express.Router();
var Room = require('../room');

// already define
// express.rooms = {};
// express.people = {};

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('On router /'.blue);
  if (this.mobile) {
    // let player enter room id or scan qrcode
    res.render('player/index', {title: 'Player/index'});
  }
  else {
    var r = new Room();
    while (!(r.id in express.rooms))
      r.newId();
    express.rooms[r.id] = r;
    res.render('observer/index', { title: 'Oberser/index' }); 
  }
});

router.post('/', function(req, res, next) {
  console.log('On router /'.blue);
  if (this.mobile) {
    var gameCode = req.param.gameCode;
    if (express.rooms.indexOf(gameCode) != -1) {// if gameCode in rooms
      res.redirect('/'+gameCode);
    }
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
  else {
    // create game
  }
});

router.get('/:roomId/', function(req, res, next) {
  console.log('On router /:roomId/'.blue); 
  if (this.mobile) {
    // mobile game
  }
  else {
    // observer game
  }
});


router.get('/test/test',function(req,res) {
  console.log('On router /test/test/'.blue);  
  res.render('test', {title: 'Test file'});
});

module.exports = router;
