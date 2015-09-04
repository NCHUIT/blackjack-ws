var express = require('express');
var colors = require('colors');
var router = express.Router();
var Room = require('../room');

// setup route middlewares

// already define
// express.rooms = {};
// express.people = {};

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('On router /'.blue);
  if (this.mobile) { 
    // let player enter room id or scan qrcode
    res.render('player/index'); 
  }
  else {
    res.render('observer/index', 
      { 
        title: 'Observer',
        csrfToken: req.csrfToken(),
      });
  }
});

router.post('/', function(req, res, next) {
  console.log('On router /'.blue);
  if (this.mobile) {
    console.log('On post mobile');
    var gameCode = req.param.gameCode;
    res.redirect('/'+gameCode);
  }
  else {
    // create game
    console.log('On post PC');
    var r = new Room();
    if (express.rooms.length >= r.maxIdCnt) {
      res.status(404);
      res.render('error', {
        message: 'Room overflow',
        stack: 'Room overflow',
      })
    }
    while (r.id in express.rooms)
      r.newId();
    express.rooms[r.id] = r;
    console.log(express.rooms);
    res.redirect('/'+r.id);
  }
});

router.get('/:roomId/', function(req, res, next) {
  console.log('On router /:roomId/'.blue); 
  var
  /*
  res.status(404);
    res.render('error', {
      message: 'Room not exist',
      error : {
        status : res.statusCode,
        stack:  'The ID of room you entered doen\'t exist try again!',
      },
    });
  */
  if (this.mobile) {
    // mobile game
    res.render('player/nick');
  }
  else {
    // observer game
    res.render('observer/roomId');
  }
});

/***
 * Router under this is for testing 
 * It will be merge to /:roomId
 *
 */

 router.get('/:roomId/pokertable', function(req, res, next) {
  console.log('On router /:roomId/pokertable/'.blue); 
  if (this.mobile) {
    res.render('player/room');
  }
  else {
    res.render('observer/poker_table');
  }
 });

 router.get('/:roomId/result', function(req, res, next) {
  console.log('On router /:roomId/result/'.blue);
  if (this.mobile) {
    res.render('player/result');
  }
  else {
    res.render('observer/result');
  }
 });

router.get('/test/test',function(req,res) {
  console.log('On router /test/test/'.blue);  
  res.render('test', {title: 'Test file'});
});

module.exports = router;
