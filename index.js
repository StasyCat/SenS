"use strict";
//WEBKIT ONLY
/* CSS CLASSES
.activebtn
.deactivebtn
.fading1
.fading2
.fading3
*/
//IDEA: 週間ランキングとか
function GetElm(id) { return document.getElementById(id); }
function Onload() {
	GetElm("song").addEventListener("click", () => {
		UI.Fadeout(GetElm("detail"), () => UI.Fadein(GetElm("selectsong")));
		ReflushSongList();
	});
	GetElm("speed").addEventListener("click", () => {
		var tmp = Number.parseFloat(prompt("Speed(0.5~5.0)..."));
		if (!Number.isNaN(tmp)) {
			GetElm("speed").innerText = "x" + Math.min(5, Math.max(0.5, ((tmp * 10) << 0) / 10)).toFixed(1);
			GetElm("speed").setAttribute("speed", "" + Math.min(5, Math.max(0.5, ((tmp * 10) << 0) / 10)));
			VerifyMenu();
		}
	});
	GetElm("name").addEventListener("click", () => {
		GetElm("name").innerText = prompt("name...");
	});
	Util.LoadScript("songs.js", () => {
		var Tags = {};
		SongList.forEach((v) => {
			Tags[v.Level] = 1;
		});
		Object.keys(Tags).forEach((v) => {
			var LI = document.createElement("li");
			LI.innerText = v;
			LI.addEventListener("click", () => {
				if (LI.classList.contains("selbtn"))
					LI.classList.remove("selbtn");
				else
					LI.classList.add("selbtn");
				ReflushSongList();
			});
			GetElm("tags").appendChild(LI)
		});
		GetElm("tags-name").innerText = "Level";
		ReflushSongList();
	});
	setTimeout(() => {
		ShowMenu();
	}, 500);
}
function ShowMenu() {
	UI.ChangeTitle("Song/Speed", () => UI.Fadeout(GetElm("fin")));
	UI.Fadein(GetElm("menu"));
	UI.Fadein(GetElm("game"));
	UI.Fadeout(GetElm("fin"));
	UI.Fadeout(GetElm("selectsong"), () => GetElm("detail"));
	UI.DeActiveBtn(GetElm("prev"));
	UI.DeActiveBtn(GetElm("next"));
	GetElm("next").addEventListener("click", function listener() {
		if (GetElm("next").classList.contains("activebtn")) {
			GetElm("next").removeEventListener("click", listener);
			ShowGame();
		}
	});
	VerifyMenu();
}
function VerifyMenu() {
	if (GetElm("speed").getAttribute("speed") != "_" && GetElm("song").getAttribute("song") != "_") {
		UI.ActiveBtn(GetElm("next"));
	} else {
		UI.DeActiveBtn(GetElm("next"));
	}
	//ADD GAME UPDATE
}
var SongList = [{ Title: "", Folder: "", Level: 0 }];

function ReflushSongList() {
	var Tags = GetElm("tags").children;
	var ActiveTags = [];
	for (var i = 0; i < Tags.length; i++) {
		var elm = Tags.item(i);
		if (elm.classList.contains("selbtn"))
			ActiveTags.push(elm.innerText);
	}
	GetElm("songlist").innerHTML = "";
	if (ActiveTags.length == 0)
		SongList.forEach(AddSong);
	else
		SongList.filter((v) => ActiveTags.some(w => w == v.Level)).forEach(AddSong);
	
	function AddSong(v) {
		var LI = document.createElement("li");
		LI.innerText = v.Title;
		LI.addEventListener("click", () => {
			GetElm("song").innerText = v.Title;
			GetElm("song").setAttribute("song", v.Folder);
			DetailReflushWithSong();
			//ADD GAME UPDATE
			UI.Fadeout(GetElm("selectsong"), () => UI.Fadein(GetElm("detail")));
		});
		GetElm("songlist").appendChild(LI)
	}
}
function DetailReflushWithSong() {
	GetElm("detail").innerText = "えらんだよ～";
}
function ShowGame() {
	UI.ChangeTitle(GetElm("song").innerText);
	var Count = 0;
	function CountingAndStart() {
		Count++;
		if (Count == 3) StartGame();
	}
	UI.Fadeout(GetElm("menu"), CountingAndStart);
	UI.Fadein(GetElm("game"), CountingAndStart);
	UI.Fadeout(GetElm("fin"), CountingAndStart);
	UI.ActiveBtn(GetElm("prev"));
	UI.DeActiveBtn(GetElm("next"));
	GetElm("prev").addEventListener("click", function listener() {
		GetElm("prev").removeEventListener("click", listener);
		//GAME STOP
		ShowMenu();
	});
}
function StartGame() {

}
function ShowFin() {
	UI.ChangeTitle("Result");
	UI.Fadeout(GetElm("menu"));
	UI.Fadeout(GetElm("game"));
	UI.Fadein(GetElm("fin"));
	UI.ActiveBtn(GetElm("prev"));
	GetElm("prev").addEventListener("click", function listener() {
		GetElm("prev").removeEventListener("click", listener);
		ShowMenu();
	});
	UI.DeActiveBtn(GetElm("next"));
}
var UI = {
	DOMs: {
		Title: undefined
	}, Onload: () => {
		UI.DOMs.Title = GetElm("title");
	}, ChangeTitle: (text, Fn) => {//WEBKIT ONLY
		Fn = Fn || (() => 0);
		UI.DOMs.Title.addEventListener("webkitAnimationEnd", function listener() {
			if (UI.DOMs.Title.classList.contains("fading1")) {
				UI.DOMs.Title.innerText = text;
				UI.DOMs.Title.classList.remove("fading1");
				UI.DOMs.Title.classList.add("fading2");
				setTimeout(() => {
					UI.DOMs.Title.classList.remove("fading2");
					UI.DOMs.Title.classList.add("fading3");
				}, 0);
			} else {
				UI.DOMs.Title.classList.remove("fading3");
				UI.DOMs.Title.removeEventListener("webkitAnimationEnd", listener);
				Fn();
			}
		});
		UI.DOMs.Title.classList.add("fading1");
	}, Fadeout: (DOM, Fn) => {
		Fn = Fn || (() => 0);
		if (!DOM.classList.contains("fading2")) {
			DOM.addEventListener("webkitAnimationEnd", function listener() {
				DOM.classList.remove("fading1");
				DOM.classList.add("fading2");
				DOM.removeEventListener("webkitAnimationEnd", listener);
				Fn();
			});
			DOM.classList.add("fading1");
		} else Fn();
	}, Fadein: (DOM, Fn) => {
		Fn = Fn || (() => 0);
		if (DOM.classList.contains("fading2")) {
			DOM.addEventListener("webkitAnimationEnd", function listener() {
				DOM.classList.remove("fading3");
				DOM.removeEventListener("webkitAnimationEnd", listener);
				Fn();
			});
			DOM.classList.remove("fading2");
			DOM.classList.add("fading3");
		} else Fn();
	}, ActiveBtn: (DOM) => {
		DOM.classList.remove("deactivebtn");
		DOM.classList.add("activebtn");
	}, DeActiveBtn: (DOM) => {
		DOM.classList.remove("activebtn");
		DOM.classList.add("deactivebtn");
	}
};
var Util = {
	LoadScript: (src, callback) => {
		let done = false;
		let head = document.getElementsByTagName('head')[0];
		let script = document.createElement('script');
		script.src = src;
		head.appendChild(script);
		script.onload = script.onreadystatechange = function () {
			if (!done && (!script.readyState || script.readyState === "loaded" || script.readyState === "complete")) {
				done = true;
				callback();
				script.onload = script.onreadystatechange = null;
				if (head && script.parentNode) {
					head.removeChild(script);
				}
			}
		};
	}
	, URLtoObject: () => {
		let arg = {};
		let pair = location.search.substring(1).split('&');
		pair.forEach(function (V) {
			let kv = V.split('=');
			arg[kv[0]] = kv[1];
		});
		return arg;
	}, Polyfill: () => {
		window.performance = window.performance || {};
		window.performance.now = window.performance.now || function () { return new Date().getTime(); };

		var timer = null;
		window.requestAnimationFrame = window.requestAnimationFrame || function (callback) {
			clearTimeout(timer);
			setTimeout(callback, 1000 / 60);
		};
	}
}
Util.Polyfill();
window.addEventListener("load", () => {
	UI.Onload();
	Onload();
});