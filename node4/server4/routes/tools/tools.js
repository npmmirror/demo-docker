var express = require('express');
var router = express.Router();

//图片下载
router.get('/getTobaccoImg', function(req, res, next) {
	var id = req.query.id;
	var realpath = __dirname + '/../../public/images/tobacco/' + id + '.png';
	var filename = id + '.png';
	res.download(realpath,filename);
});

module.exports = router;