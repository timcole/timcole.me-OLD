var express = require('express');
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
	var pointKeys = await redis.keysAsync(`${process.env.WEETBOT_POINTS_KEY}*`);
	var chatters = {};

	for (var i = 0; i < pointKeys.length; i++) {
		var points = await redis.getAsync(pointKeys[i]);
		if (points) chatters[pointKeys[i].replace(process.env.WEETBOT_POINTS_KEY, "")] = points;
		// if (points) chatters.push({'twitch_id': pointKeys[i].replace(process.env.WEETBOT_POINTS_KEY, ""), points});
	}

	res.status(200).json({ status: 200, chatters });
});

module.exports = router;
