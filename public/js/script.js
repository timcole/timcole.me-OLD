'use strict';

(function(){
	var tc = {
		props: {
			mobileSearch: false,
			mobileMenu: false,
			accountMenu: false,
			autoScroll: [ null, true, true ],
			stream: {
				templates: {
					follow: `<i class="icon">&#xE87D;</i>Follow <span class="meta-data">{{ followers }}</span>`,
					viewers: `<i class="icon">&#xE7FB;</i>{{ viewers }}`
				},
				music: [],
				commands: []
			}
		},
		load: () => {
			switch (window.location.pathname) {
				case "/stream":
				case "/stream/":
					tc.stream.index();
					break;
				case "/stream/music":
					tc.stream.music();
					break;
				case "/stream/commands":
					tc.stream.commands();
					break;
			}
			tc.header();
		},
		header: () => {
			var header = document.getElementsByTagName("tc-header")[0].getElementsByClassName("container");
			var search = header[0].getElementsByTagName("tc-search")[0];
			if (header[0].getElementsByClassName("logged-in")[0]) {
				var account = header[0].getElementsByClassName("logged-in")[0];
				var accountMenu = account.getElementsByTagName("tc-account")[0];
			}
			var input = search.getElementsByTagName("input")[0];
			var mobileSearch = document.getElementById('mobileSearch');
			var mobileMenu = document.getElementById('mobileMenu');

			if (input) {
				input.onfocus = function(e) {
					search.getElementsByTagName("i")[0].className = "icon focused";
				};

				input.onblur = function(e) {
					search.getElementsByTagName("i")[0].className = "icon";
				};

				mobileSearch.onclick = () => {
					tc.props.mobileSearch = !tc.props.mobileSearch;
				};
			}

			watch(tc.props, "mobileSearch", (prop, was, value) => {
				if (value) {
					header[0].classList.add("search-activated");
					mobileSearch.innerText = "clear";
				} else {
					header[0].classList.remove("search-activated");
					mobileSearch.innerText = "search";
				}
			});

			mobileMenu.onclick = () => {
				tc.props.mobileMenu = !tc.props.mobileMenu;
			};

			watch(tc.props, "mobileMenu", (prop, was, value) => {
				if (value) {
					header[1].classList.add("menu-activated");
					mobileMenu.innerText = "clear";
				} else {
					header[1].classList.remove("menu-activated");
					mobileMenu.innerText = "menu";
				}
			});

			if (account) {
				account.getElementsByTagName("img")[0].onclick = () => {
					tc.props.accountMenu = !tc.props.accountMenu;
				};

				watch(tc.props, "accountMenu", (prop, was, value) => {
					if (value) {
						accountMenu.classList.add("active");
					} else {
						accountMenu.classList.remove("active");
					}
				});
			}

			var menuItem = header[1].querySelector('a[href^="' + location.pathname + '"]');
			if (menuItem) menuItem.classList.add("active");
		},
		stream: {
			index: () => {
				var video = new Twitch.Player("video", {
					channel: (meta.channel ? meta.channel : "modesttim"),
					layout: "video",
					height: "100%",
					width: "100%"
				});

				var menu = document.getElementsByTagName('tc-menu')[0].getElementsByTagName('ul')[0];

				var viewers_btn = document.createElement('a');
				viewers_btn.classList.add("tooltip--bottom");
				viewers_btn.setAttribute("data-tooltip", "Viewers");
				viewers_btn.classList.add("meta-btn");
				viewers_btn.classList.add("normalize");
				var viewers = document.createElement('li');
				viewers.innerHTML = tc.props.stream.templates.viewers.replace("{{ viewers }}", meta.viewers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
				viewers.id = "meta--viewers";
				viewers_btn.appendChild(viewers);
				menu.appendChild(viewers_btn);

				var sub_btn = document.createElement('a');
				sub_btn.classList.add("meta-btn");
				sub_btn.target = "_blank";
				sub_btn.href = `https://twitch.tv/${meta.channel}/subscribe`;
				var sub = document.createElement('li');
				sub.innerHTML = `<i class="icon">&#xE838;</i>Subscribe</span>`;
				sub.id = "meta--subscribe";
				sub_btn.appendChild(sub);
				menu.appendChild(sub_btn);

				var follow_btn = document.createElement('a');
				follow_btn.classList.add("meta-btn");
				follow_btn.target = "_blank";
				follow_btn.href = `https://twitch.tv/${meta.channel}`;
				var follow = document.createElement('li');
				follow.innerHTML = tc.props.stream.templates.follow.replace("{{ followers }}", meta.followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
				follow.id = "meta--follow";
				follow_btn.appendChild(follow);
				menu.appendChild(follow_btn);

				setInterval(() => {
					fetch('/api/stream', { 'Cache-Control': 'no-cache' }).then(function(response) {
						return response.json();
					}).then(function(j) {
						meta.followers = j.stream.channel.followers;
						meta.viewers = j.stream.viewers ? j.stream.viewers : "Offline";

						viewers.innerHTML = tc.props.stream.templates.viewers.replace("{{ viewers }}", meta.viewers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
						follow.innerHTML = tc.props.stream.templates.follow.replace("{{ followers }}", meta.followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
						console.log(meta.viewers)
					});
				}, 10000)
			},
			music: () => {
				var body = document.getElementsByTagName("tc-body")[0];
				var table = body.getElementsByTagName("tbody")[0];
				var playing = body.getElementsByClassName("playing")[0];
				var progress = body.getElementsByClassName("progress-bar")[0];

				fetch('/api/spotify/playing').then(function(response) {
					return response.json();
				}).then(function(j) {
					if (j.player.is_playing) {
						playing.getElementsByTagName("img")[0].src = j.player.item.album.images[0].url;
						playing.getElementsByTagName("h1")[0].innerText = j.player.item.name;
						playing.getElementsByTagName("h2")[0].innerText = j.player.item.artists[0].name;

						var timeLeft = j.player.item.duration_ms-j.player.progress_ms;
						setTimeout(tc.stream.music, timeLeft)

						var progression = j.player.progress_ms
						var progessInt = setInterval(() => {
							progress.style.width = `${progression/j.player.item.duration_ms*100}%`;
							progression = progression + 500;
							if (progression/j.player.item.duration_ms*100 >= 100) {
								clearInterval(progessInt);
							}
						}, 500);

						playing.classList.remove("hide")
						progress.classList.remove("hide")
					}
				});

				// WIP: Coming soon. You didn't see this!
				// fetch('/api/spotify/queue').then(function(response) {
				// 	return response.json();
				// }).then(function(j) {
				// 	tc.props.stream.music = j.queue
				// });
				//
				// watch(tc.props.stream, "music", (prop, was, value) => {
				// 	table.innerHTML = "";
				// 	for (var i = 0; i < tc.props.stream.music.length; i++) {
				// 		var tr = document.createElement("tr");
				//
				// 		var art = document.createElement("td");
				// 		var img = document.createElement("img");
				// 		img.src = tc.props.stream.music[i].track.album.images[0].url;
				// 		art.appendChild(img)
				// 		art.width = "50"
				//
				// 		var name = document.createElement("td");
				// 		name.innerText = tc.props.stream.music[i].track.name;
				// 		var artist = document.createElement("span");
				// 		artist.innerText = tc.props.stream.music[i].track.artists[0].name;
				// 		artist.style.display = "block";
				// 		name.appendChild(artist);
				//
				// 		var requested = document.createElement("td");
				// 		requested.innerText = "Requested by";
				// 		var requester = document.createElement("span");
				// 		requester.innerText = "ModestTim";
				// 		requester.style.display = "block";
				// 		requested.appendChild(requester);
				//
				// 		tr.appendChild(art);
				// 		tr.appendChild(name);
				// 		tr.appendChild(requested);
				//
				// 		var track = tc.props.stream.music[i].track.id;
				// 		tr.onclick = () => {
				// 			window.open(`https://open.spotify.com/track/${track}`, '_blank');
				// 		};
				//
				// 		table.appendChild(tr);
				// 	}
				// });
			},
			commands: () => {
				Emote.loadEmotes(function () {
					var commandList = document.getElementById("commandList");

					fetch('/api/weetbot/commands').then(function (response) {
						return response.json();
					}).then(function (j) {
						for (var i = 0; i < j.commands.length; i++) {
							var commandDOM = document.createElement("tr");
							var command = document.createElement("td");
							var response = document.createElement("td");

							command.innerText = j.commands[i].command.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
							response.innerText = j.commands[i].response.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

							command.innerHTML = Emote.emoteCheck(command.innerText);
							response.innerHTML = Emote.emoteCheck(response.innerText);

							commandDOM.appendChild(command);
							commandDOM.appendChild(response);
							commandList.appendChild(commandDOM);
						}
					});
				});
			}
		}
	}

	tc.load()
})();

var isJSON=function(str){try{JSON.parse(str);}catch(e){return false;}return true;};

/*
/
/ PROP WATCHER
/
*/
function watch(target, prop, handler) {
	if (target.__lookupGetter__(prop) != null) {
		return true;
	}
	var oldval = target[prop],
		newval = oldval,
		self = this,
		getter = function () {
			return newval;
		},
		setter = function (val) {
			if (Object.prototype.toString.call(val) === '[object Array]') {
				val = _extendArray(val, handler, self);
			}
			oldval = newval;
			newval = val;
			handler.call(target, prop, oldval, val);
		};
	if (delete target[prop]) { // can't watch constants
		if (Object.defineProperty) { // ECMAScript 5
			Object.defineProperty(target, prop, {
				get: getter,
				set: setter,
				enumerable: false,
				configurable: true
			});
		} else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) { // legacy
			Object.prototype.__defineGetter__.call(target, prop, getter);
			Object.prototype.__defineSetter__.call(target, prop, setter);
		}
	}
	return this;
};

function unwatch(target, prop) {
	var val = target[prop];
	delete target[prop];
	target[prop] = val;
	return this;
};

var motive = true
function _extendArray(arr, callback, framework) {
	if (arr.__wasExtended === true) return;

	function generateOverloadedFunction(target, methodName, self) {
		return function () {
			var oldValue = Array.prototype.concat.apply(target);
			var newValue = Array.prototype[methodName].apply(target, arguments);
			target.updated(oldValue, motive);
			return newValue;
		};
	}
	arr.updated = function (oldValue, self) {
		callback.call(this, 'items', oldValue, this, motive);
	};
	arr.concat = generateOverloadedFunction(arr, 'concat', motive = true);
	arr.join = generateOverloadedFunction(arr, 'join', motive);
	arr.pop = generateOverloadedFunction(arr, 'pop', motive);
	arr.push = generateOverloadedFunction(arr, 'push', motive);
	arr.reverse = generateOverloadedFunction(arr, 'reverse', motive);
	arr.shift = generateOverloadedFunction(arr, 'shift', motive);
	arr.slice = generateOverloadedFunction(arr, 'slice', motive);
	arr.sort = generateOverloadedFunction(arr, 'sort', motive);
	arr.splice = generateOverloadedFunction(arr, 'splice', motive);
	arr.unshift = generateOverloadedFunction(arr, 'unshift', motive);
	arr.__wasExtended = true;

	return arr;
}
