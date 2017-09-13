var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('index', {
		title: "Full Stack Developer"
	});
});

router.get('/setup', function(req, res, next) {
	var err = new Error(`Don't worry you didn't break anything. I'm just to lazy to remake this page at the moment.`);
	err.status = 200;
	next(err);
});

router.get('/ss/:file', async function(req, res, next) {
	var file = req.params.file;
	var fileType = file.substring(file.length - 4);
	var cdn = req.app.get("settings").cdn;

	var cdnCheck = await fetch(`${cdn}${file}`).then((data) => { return data.status; });

	if (cdnCheck != 404) {
		res.render('screenshot', {
			file: file,
			cdn,
			video: (fileType == '.mp4' || fileType == '.wmv' ? true : false)
		});
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	}
});

router.get('/ref/:site', function(req, res, next) {
	var name = req.params.site;

	switch(name) {
		case "twitter":
			res.redirect('https://twitter.com/modesttim');
			break;
		case "twitch":
			res.redirect('https://twitch.tv/modesttim');
			break;
		case "youtube":
			res.redirect('https://youtube.com/eattim');
			break;
		case "instagram":
			res.redirect('https://instagram.com/modesttim');
			break;
		case "github":
			res.redirect('https://github.com/timothycole');
			break;
		case "linkedin":
			res.redirect('https://www.linkedin.com/in/modesttim/');
			break;
		case "snapchat":
			res.redirect('https://www.snapchat.com/add/itstcole');
			break;
		case "reddit":
			res.redirect('https://reddit.com/u/timothycole');
			break;
		default:
		    var err = new Error('Not Found');
		    err.status = 404;
		    next(err);
	}
});

module.exports = router;
