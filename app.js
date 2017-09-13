var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swig = require('swig');
var session = require('express-session');
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var settings = require('./config.js');
var app = express();
var client  = redis.createClient();

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.set('view cache', false);
swig.setDefaults({
	cache: false,
	varControls: ['[[', ']]']
});

app.use(favicon(path.join(__dirname, 'public', '/images/logo.png')));
app.enable('trust proxy');
app.use(logger('combined', {
	skip: function (req, res) {
		return (req.headers['x-real-ip'] == "162.208.49.199" || typeof req.headers['x-real-ip'] == "undefined");
	}
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('redis', client);
app.set('settings', settings);

app.use('/', require('./routes/main'));
app.use('/api', require('./routes/api/main'));
app.use('/stream', require('./routes/stream'));

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: err.status || 500
	});
});

module.exports = app;
