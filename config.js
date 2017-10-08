require('dotenv').config()

module.exports = {
	website: {
		cdn: process.env.WEBSITE_CDN,
		pass: process.env.WEBSITE_PASS
	},
	spotify: {
		client_id: process.env.SPOTIFY_CLIENT_ID,
		client_secret: process.env.SPOTIFY_CLIENT_SECRET,
		redirect_uri: process.env.SPOTIFY_REDIRECT_URI
	},
	twitch: {
		client_id: process.env.TWITCH_CLIENT_ID,
		channel: process.env.TWITCH_CHANNEL,
		emotesets: process.env.TWITCH_EMOTESETS
	},
	cloudflare: {
		zone: process.env.CLOUDFLARE_ZONE,
		key: process.env.CLOUDFLARE_KEY,
		email: process.env.CLOUDFLARE_EMAIL
	}
}
