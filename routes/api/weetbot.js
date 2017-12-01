var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

router.get('/weetbot/commands', async function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');

	var redis = req.app.get('redis');
	var commandKeys = await redis.keysAsync(`${process.env.WEETBOT_COMMAND_KEY}*`);
	var commands = [];

	for (var i = 0; i < commandKeys.length; i++) {
		var command = await redis.getAsync(commandKeys[i]);
		if (command) commands.push({ "command": commandKeys[i].replace(process.env.WEETBOT_COMMAND_KEY, ""), "response": command });
	}

	res.status(200).json({ status: 200, commands });
});

router.get('/weetbot/points', async function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');

	var redis = req.app.get('redis');
	var settings = req.app.get('settings');

	var pointKeys = await redis.keysAsync(`${process.env.WEETBOT_POINTS_KEY}*`);
	var chatters = [];

	for (var i = 0; i < pointKeys.length; i++) {
		var points = await redis.getAsync(pointKeys[i]);
		if (points) chatters.push({'twitch_id': pointKeys[i].replace(process.env.WEETBOT_POINTS_KEY, ""), points});
	}

	res.status(200).json({ status: 200, chatters });
});

router.get('/weetbot/points/:id', async function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	var id = req.params.id;

	var redis = req.app.get('redis');
	var settings = req.app.get('settings');
	
	try {
		var points = await redis.getAsync(`${process.env.WEETBOT_POINTS_KEY}${id}`);

		if (points === null) {
			var headers = { 'Client-ID': settings.twitch.client_id }
			var twitchReply = await fetch(`https://api.twitch.tv/helix/users?id=${id}`, { headers }).then((data) => { return data.json() });

			if (twitchReply.data.length !== 0) {
				redis.setAsync(`${process.env.WEETBOT_POINTS_KEY}${id}`, 50);
				points = 50;
			}
		}

		res.status(200).json({ status: 200, points: Number(points) || 0 });
	} catch (err) {
		res.status(500).json({ status: 500, message: "Internal Server Error" })
		console.error(err);
	}
});

router.get('/weetbot/events', async function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');

	try {
		var redis = req.app.get('redis');
		var events = await redis.getAsync("WeetBot::events");

		res.status(200).json({ status: 200, events: JSON.parse(events) });
	} catch (err) {
		res.status(500).json({ status: 500, message: "Internal Server Error" })
		console.error(err);
	}
});

module.exports = router;
