var express = require('express');
var router = express.Router();

router.get('/', function(req, res ,next) {
    res.render('observer/index', { title: 'Observer'});
});

module.exports = router;
