var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

router.get('/', async function(req, res, next) {
	var api = await fetch(`http://0.0.0.0:${req.app.get("port")}/api/stream`).then((data) => { return data.json() });

	res.render('stream/index', {
		title: "Stream",
		api
	});
});

router.get('/music', function(req, res, next) {
	res.render('stream/music', {
		title: "Music Queue + Song Requests - WeetBot"
	});
});

module.exports = router;
