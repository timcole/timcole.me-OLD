var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

router.get('/', async function(req, res, next) {
	var api = await fetch(`http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/api/stream`).then((data) => { return data.json() });

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

router.get('/commands', function(req, res, next) {
	res.render('stream/commands', {
		title: "WeetBot Stream Commands"
	});
});

module.exports = router;
