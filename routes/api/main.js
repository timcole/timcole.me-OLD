var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

router.all('/spotify*', require('./spotify'));
router.all('/weetbot*', require('./weetbot'));

router.get('/stream', async function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	var settings = req.app.get('settings');

	var headers = {
		Accept: "application/vnd.twitchtv.v5+json",
		'Client-ID': settings.twitch.client_id
	}

	var stream = await fetch(`https://api.twitch.tv/kraken/streams/${settings.twitch.channel}`, { headers }).then((data) => { return data.json() });
	stream = (stream.stream ? stream.stream : { channel: null });
	stream.channel = (stream.channel ? stream.channel : await fetch(`https://api.twitch.tv/kraken/channels/${settings.twitch.channel}`, { headers }).then((data) => { return data.json() }));

	res.status(200).json({
		status: 200,
		stream: stream
	});
});

router.get('/stream/waitingMessage', async function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	var redis = req.app.get('redis');

	var message = await redis.getAsync("stream::message");

	res.status(200).json({
		status: 200,
		message
	});
});

router.post('/stream/waitingMessage', async function(req, res, next) {
	var settings = req.app.get('settings');
	if (typeof req.headers.authorization === 'undefined' || req.headers.authorization !== settings.website.pass) { next(); return; }
	if (typeof req.body.message === 'undefined') { next(); return; }

	res.setHeader('Content-Type', 'application/json');
	var redis = req.app.get('redis');

	var set = await redis.setAsync("stream::message", req.body.message);

	res.status(200).json({
		status: 200,
		set
	});
});

router.all('*', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.status(404).json({
		status: 404,
		error: "Invalid endpoint",
		path: req.url
	});
});

module.exports = router;
