var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

var settings = require('express');

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

router.all('*', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.status(404).json({
		status: 404,
		error: "Invalid endpoint",
		path: req.url
	});
});

module.exports = router;
