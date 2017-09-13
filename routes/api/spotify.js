var express = require('express');
var fetch = require('node-fetch');
var querystring = require('querystring');
var router = express.Router();

var settings = require('../../config.js');

var generateState = (length) => {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

var authorization = async (redis, cb) => {
	auth = await redis.getAsync("tc::auth::spotify");
	if (auth == null) { cb({}, err || "Failed to location authorization token."); return; }

	auth = JSON.parse(auth);
	var request = await fetch('https://api.spotify.com/v1/me', {
		headers: {
			'Authorization': 'Bearer ' + auth.token
		}
	}).then((data) => { return data.json() });

	if (!request.error) {
		cb(auth, null);
	} else {
		var request = await fetch('https://accounts.spotify.com/api/token', {
			headers: { 'Authorization': 'Basic ' + (new Buffer(settings.spotify.client_id + ':' + settings.spotify.client_secret).toString('base64')) },
			form: {
				grant_type: 'refresh_token',
				refresh_token: auth.refresh
			}
		}).then((data) => { return data.json() });

		if (!request.error) {
			auth.token = request.access_token;
			redis.set("tc::auth::spotify", JSON.stringify(auth));
			cb(auth, null);
		} else {
			cb({}, request.error || "Failed to location authorization token.")
		}
	}
}

router.get('/spotify', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	var redis = req.app.get('redis');

	authorization(redis, async function(auth, err) {
		if (err) { res.status(401).json({ status: 401, errors: err }); return; }
		var request = await fetch(`https://api.spotify.com/v1/me`, {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + auth.token
			}
		}).then((data) => { return data.json() });

		if (!request.error) {
			delete request.email
			res.status(200).json({ status: 200, user: request });
		} else {
			res.status(403).json({ status: 403, errors: [ request.error.message || "Invalid Token." ] });
		}
	});
});

router.get('/spotify/playing', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', '*');
	var redis = req.app.get('redis');

	authorization(redis, async function(auth, err) {
		if (err) { res.status(401).json({status: 401, errors: err}); return; }
		var request = await fetch('https://api.spotify.com/v1/me/player', {
			headers: {
				'Authorization': 'Bearer ' + auth.token
			}
		}).then((data) => { return data.json() });

		if (!request.error) {
			delete request.device
			res.status(200).json({ status: 200, player: request });
		} else {
			res.status(403).json({ status: 403, errors: [ request.error || "Invalid Token." ] });
		}
	});
});

router.get('/spotify/queue', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	var redis = req.app.get('redis');

	authorization(redis, async function(auth, err) {
		if (err) { res.status(401).json({status: 401, errors: err}); return; }
		var request = await fetch ('https://api.spotify.com/v1/users/modesttim/playlists/4BkgdUx8qPzotGrdMVsMZc/tracks', {
			headers: {
				'Authorization': 'Bearer ' + auth.token
			}
		}).then((data) => { return data.json() });

		if (!request.error) {
			delete request.device
			res.status(200).json({ status: 200, queue: request.items });
		} else {
			res.status(403).json({ status: 403, errors: [ request.error || "Invalid Token." ] });
		}
	});
});

router.get('/spotify/auth', function(req, res, next) {
	var state = generateState(32);
	res.cookie("spotify_state", state);

	var scope = ["user-read-private", "user-read-email", "user-read-playback-state", "user-modify-playback-state", "playlist-modify-private"];
	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
		response_type: 'code',
		client_id: settings.spotify.client_id,
		scope: scope.splice(","),
		redirect_uri: settings.spotify.redirect_uri,
		state: state
	}));
});

router.get('/spotify/auth/callback', async function(req, res, next) {
	var redis = req.app.get('redis');
	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies["spotify_state"] : null;
	res.clearCookie("spotify_state");

	if (state === null || state !== storedState) {
		res.status(403).json({status: 403, errors: [ "State Mismatch." ]}); return;
	} else {
		var request = await fetch('https://accounts.spotify.com/api/token', {
			body: {
				code: code,
				redirect_uri: settings.spotify.redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer(settings.spotify.client_id + ':' + settings.spotify.client_secret).toString('base64'))
			}
		}).then((data) => { return data.json() });

		if (!request.error) {
			redis.set("tc::auth::spotify", JSON.stringify({ token: request.access_token, refresh: request.refresh_token }));
			res.redirect('/api/spotify');
		} else {
			res.status(403).json({status: 403, errors: [ request.error || "Invalid Token." ]});
		}
	}
});

module.exports = router;
