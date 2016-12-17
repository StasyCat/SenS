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
	GetElm("song").addEventListener("click", () => console.log("soong"));
	GetElm("speed").addEventListener("click",() => console.log("speed"));
	GetElm("name").addEventListener("click", () => console.log("name"));
	ShowMenu();
}
function ShowMenu() {
	setTimeout(() => {
		UI.ChangeTitle("Song/Speed", () => UI.Fadeout(GetElm("fin")));
		UI.Fadein(GetElm("menu"));
		UI.Fadein(GetElm("game"));
		UI.Fadeout(GetElm("fin"));
	}, 500);
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
}
function StartGame() {

}
function ShowFin() {
	UI.ChangeTitle("Result");
	UI.Fadeout(GetElm("menu"));
	UI.Fadeout(GetElm("game"));
	UI.Fadein(GetElm("fin"));
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
	},
};

window.addEventListener("load", () => {
	UI.Onload();
	Onload();
});