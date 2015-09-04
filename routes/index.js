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
    res.render('player/index'); 
  }
  else {
    res.render('observer/index', { title: 'Observer'});
  }
});

router.post('/', function(req, res, next) {
  console.log('On router /'.blue);
  if (this.mobile) {
    var gameCode = req.param.gameCode;
    res.redirect('/'+gameCode);
  }
  else {
    // create game
    var r = new Room();
    while (!(r.id in express.rooms))
      r.newId();
    express.rooms[r.id] = r;
  }
});

router.get('/:roomId/', function(req, res, next) {
  console.log('On router /:roomId/'.blue); 
  if (this.mobile) {
    // mobile game
    res.render('player/room');
  }
  else {
    // observer game
    res.render('observer/room');
  }
});

/***
 * Router under this is for testing 
 * It will be merge to /:roomId
 *
 */

// router.get('/:roomId/pokertable', function(req, res, next) {
//  console.log('On router /:roomId/pokertable/'.blue); 
//  if (this.mobile) {
//    res.render('player/room');
//  }
//  else {
//    res.render('observer/poker_table');
//  }
// });

// router.get('/:roomId/result', function(req, res, next) {
//  console.log('On router /:roomId/result/'.blue);
//  if (this.mobile) {
//    res.render('player/result');
//  }
//  else {
//    res.render('observer/result');
//  }
// });

router.get('/test/test',function(req,res) {
  console.log('On router /test/test/'.blue);  
  res.render('test', {title: 'Test file'});
});

module.exports = router;
