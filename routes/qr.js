var router = require('express').Router();
var qr = require('qr-image');

router.get('/:roomId/', function(req, res, next) {
    var url = req.protocol + "://" + req.get('host') + '/' + req.params.roomId;
    var code = qr.image(url, {type:'svg'});
    res.type('svg');
    code.pipe(res);
});

module.exports = router;
