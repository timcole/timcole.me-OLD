require('dotenv').config()

module.exports = {
	cdn: 'https://tcole.me/s/',
	spotify: {
		client_id: process.env.SPOTIFY_CLIENT_ID,
		client_secret: process.env.SPOTIFY_CLIENT_SECRET,
		redirect_uri: process.env.SPOTIFY_REDIRECT_URI
	},
	twitch: {
		client_id: process.env.TWITCH_CLIENT_ID,
		channel: process.env.TWITCH_CHANNEL
	}
}
