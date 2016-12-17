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
		//TODO
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

window.addEventListener("load", () => {
	UI.Onload();
	Onload();
});