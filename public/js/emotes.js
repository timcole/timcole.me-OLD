var Emote = {
	emoteCheck($message)
	{
		let msgHTML = $message;

		const words = msgHTML.replace('/\xEF\xBB\xBF/', '').replace('﻿', '').split(' ');
		const uniqueWords = [];
		let emoteCount = 0;

		// Old
		// $.each(words, function (i, el) {
		// 	if ($.inArray(el, uniqueWords) === -1) uniqueWords.push(el);
		// });

		// Converted
		for (const word of words) {
			if (uniqueWords.indexOf(word) === -1) uniqueWords.push(word);
		}

		for (let i = 0; i < uniqueWords.length; i++) {
			const word = uniqueWords[i];

			if (typeof Emote.emotes[word] === 'undefined') {
				continue;
			}

			emoteCount++;

			const img = document.createElement('img');
			img.src = Emote.emotes[word]['url'];
			img.alt = word;
			img.style.display = 'inline';
			img.style.width = 'auto';
			img.style.overflow = 'hidden';

			msgHTML = msgHTML.replace(new RegExp(word, 'g'), img.outerHTML);
		}

		return msgHTML
	},

	loadEmotes(cb)
	{
		const xhr = new XMLHttpRequest();
		xhr.open('GET', '/api/stream/chat');
		xhr.send();
		const urlTemplate = 'https://static-cdn.jtvnw.net/emoticons/v1/';

		xhr.ontimeout = function () {
			Emote.states['sub'].loaded = true;
		};

		xhr.onload = function () {
			const emotes = JSON.parse(xhr.responseText)['emotes'];

			for (const i in emotes.self) {
				const code = emotes.self[i]['code'];

				Emote.emotes[code] = {
					url: urlTemplate + emotes.self[i]['id'] + '/' + '1.0'
				};
			}

			for (const i in emotes.global) {
				const code = emotes.global[i]['code'];

				Emote.emotes[code] = {
					url: urlTemplate + emotes.global[i]['id'] + '/' + '1.0'
				};
			}

			Emote.states['twitch'].loaded = true;
			cb(Emote.states['twitch'].loaded)
		};
	},

	containsDisallowedChar(word)
	{
		const DISALLOWED_CHARS = ['\\', ':', '/', '&', "'", '"', '?', '!', '#'];
		for (const c in DISALLOWED_CHARS) {
			if (word.indexOf(c) > -1) {
				return true;
			}
		}

		return false;
	}
};

Emote.states = {
	twitch: {
		loaded: false
	}
};

Emote.emotes = {};
Emote.messages = {};
