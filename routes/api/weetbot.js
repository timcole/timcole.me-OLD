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

module.exports = router;
