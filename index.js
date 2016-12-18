"use strict";
//WEBKIT ONLY
//IDEA: 週間ランキングとか
function GetElm(id) { return document.getElementById(id); }
function Onload() {
	GetElm("song").addEventListener("click", () => {
		UI.Fadeout(GetElm("detail"), () => UI.Fadein(GetElm("selectsong")));
		ReflushSongList();
	});
	GetElm("speed").addEventListener("click", () => {
		var tmp = Number.parseFloat((prompt("楽譜が落ちるスピードを指定できます(0.5~5.0倍)...") || "").replace(/[^0-9\.]+/g, ""));
		if (!Number.isNaN(tmp)) {
			GetElm("speed").innerText = "Speedx" + Math.min(5, Math.max(0.5, ((tmp * 10) << 0) / 10)).toFixed(1);
			GetElm("speed").setAttribute("speed", "" + Math.min(5, Math.max(0.5, ((tmp * 10) << 0) / 10)));
			VerifyMenu();
		}
	});
	GetElm("name").addEventListener("click", () => {
		var A = prompt("name...");
		if (A != null) {
			AddRanking();
			GetElm("name").innerText = A + " Ranking added!";
		}
	});
	Util.LoadScript("songs.js", () => {
		ReflushTagList();
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
	UI.Fadeout(GetElm("gameback"));
	UI.Fadeout(GetElm("fin"));
	UI.Fadein(GetElm("selectsong"), () => UI.Fadeout(GetElm("detail")));
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
var Selected_Next_Menu_Flag = true;
function VerifyMenu() {
	if (GetElm("song").getAttribute("song") != "_") {
		UI.ActiveBtn(GetElm("next"));
		if (Selected_Next_Menu_Flag) {
			UI.Blink(GetElm("next"));
			Selected_Next_Menu_Flag = false;
		}
		ReflushPreview();
	} else {
		UI.DeActiveBtn(GetElm("next"));
	}
}
var SongList = [{ Title: "", Folder: "", Level: 0, Detail: "" }];
function ReflushTagList() {
	GetElm("tags").innerHTML = "";
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
}
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
		SongList.forEach(AddToDOM);
	else
		SongList.forEach((v, i) => {
			if (ActiveTags.some(w => w == v.Level))
				AddToDOM(v, i);
		});

	function AddToDOM(v, i) {
		var LI = document.createElement("li");
		LI.innerText = v.Title;
		LI.addEventListener("click", () => {
			GetElm("song").innerText = v.Title;
			GetElm("song").setAttribute("song", i);
			DetailReflushWithSong();
			VerifyMenu();
			UI.Fadeout(GetElm("selectsong"), () => UI.Fadein(GetElm("detail")));
		});
		GetElm("songlist").appendChild(LI)
	}
}
function DetailReflushWithSong() {
	GetElm("detailtext").innerText = "縦に7本レーンがありまして、左から順に、[S] [D] [F] [Space] [J] [K] [L] のキーを押して、落ちてくる譜面を叩いてください。\n\n曲へのコメント\n" + SongList[Number.parseInt(GetElm("song").getAttribute("song"))].Detail;
}
function ShowGame() {
	var Count = 0;
	UI.ChangeTitle(GetElm("song").innerText);
	UI.Fadeout(GetElm("menu"), CountingAndStart);
	UI.Fadein(GetElm("game"), CountingAndStart);
	UI.Fadein(GetElm("gameback"), CountingAndStart);
	UI.Fadeout(GetElm("fin"), CountingAndStart);
	UI.ActiveBtn(GetElm("prev"));
	UI.DeActiveBtn(GetElm("next"));
	function CountingAndStart() {
		Count++;
		if (Count == 3) {
			StartGame();
			GetElm("prev").addEventListener("click", function listener() {
				GetElm("prev").removeEventListener("click", listener);
				Game.FinishTime = 0;
				ShowMenu();
			});
		}
	}
}

function StartGame() {
	Game.AutoMode = false;
	Game.Init();
}
function ReflushPreview() {
	Game.AutoMode = true;
	Game.Speed = 5000 / Number.parseFloat(GetElm("speed").getAttribute("speed"));//Speed Linked
	Game.Init();
}


function ShowFin() {
	UI.ChangeTitle("Result " + Game.Score + "pt");
	UI.Fadeout(GetElm("menu"));
	UI.Fadeout(GetElm("game"));
	UI.Fadeout(GetElm("gameback"));
	UI.Fadein(GetElm("fin"));
	UI.ActiveBtn(GetElm("prev"));
	UI.DeActiveBtn(GetElm("next"));
	GetElm("prev").addEventListener("click", function listener() {
		GetElm("prev").removeEventListener("click", listener);
		ShowMenu();
	});
	ReflushRanking();
}
function ReflushRanking() {
	//TODO
}
function AddRanking() {
	//TODO
}
class Drawing {
	constructor(canvas, parent) {
		this.Parent = parent;
		if (canvas.getContext) this.ctx = canvas.getContext('2d');
		else throw "Canvasが対応していないようです"
		this.Scalex = 1;
		this.Scaley = 1;
		var This = this;
		((Fn) => {
			var i;
			window.addEventListener('resize', () => {
				if (i !== false) { clearTimeout(i); }
				i = setTimeout(Fn, 100);
			});
		})(() => this.OnResize.call(This));
		this.OnResize();
	}
	static Color(r, g, b) {
		'rgb(' + (r << 0) + ',' + (g << 0) + ',' + (b << 0) + ')'
	}
	OnResize() {
		let Canvas = this.ctx.canvas;
		this.Scalex = (window.devicePixelRatio || 1) * this.Parent.clientWidth;
		this.Scaley = (window.devicePixelRatio || 1) * this.Parent.clientHeight;
		Canvas.width = this.Scalex << 0;
		Canvas.height = this.Scaley << 0;
		Canvas.style.width = this.Parent.clientWidth + "px";
		Canvas.style.height = this.Parent.clientHeight + "px";
		this.ctx.lineWidth = window.devicePixelRatio || 1;
	}
	Path(Fn) {
		this.ctx.beginPath();
		var Result = Fn();
		if ("Fill" in Result) {
			this.ctx.fillStyle = Result.Fill;
			this.ctx.fill();
		}
		if ("Stroke" in Result) {
			this.ctx.strokeStyle = Result.Stroke;
			this.ctx.stroke();
		}
	}
	Alpha(alpha) {
		this.ctx.globalAlpha = alpha;
	}
	Line(x1, y1, x2, y2) {
		this.ctx.moveTo((x1 * this.Scalex) << 0, (y1 * this.Scaley) << 0);
		this.ctx.lineTo((x2 * this.Scalex) << 0, (y2 * this.Scaley) << 0);
	}
	Rect(x, y, w, h) {
		this.ctx.rect(
			(x * this.Scalex) << 0, (y * this.Scaley) << 0,
			(w * this.Scalex) << 0, (h * this.Scaley) << 0
		);
	}
	Round(x, y, r) {
		this.ctx.arc((x * this.Scalex) << 0, (y * this.Scaley) << 0, (r * Math.min(this.Scalex, this.Scaley)) << 0, -0.5 * Math.PI, 2 * Math.PI);
	}
	LongRound(x, y, h, r) {
		this.ctx.arc((x * this.Scalex) << 0, (y * this.Scaley) << 0, (r * Math.min(this.Scalex, this.Scaley)) << 0, -Math.PI, 0);
		this.ctx.arc((x * this.Scalex) << 0, ((y + h) * this.Scaley) << 0, (r * Math.min(this.Scalex, this.Scaley)) << 0, 0, -Math.PI);
	}
	Fill(Style, globalCompositeOperation) {
		let Tmp = this.ctx.fillStyle;
		let Tmp2 = this.ctx.globalCompositeOperation;
		this.ctx.fillStyle = Style;
		this.ctx.globalCompositeOperation = Util.OptArg(globalCompositeOperation, 'source-over');
		this.ctx.fillRect(0, 0, this.Scalex << 0, this.Scaley << 0);
		this.ctx.fillStyle = Tmp;
		this.ctx.globalCompositeOperation = Tmp2;
	}
}
var Game = {
	_: { Keys: [83, 68, 70, 32, 74, 75, 76], MakingLongKeys: [87, 69, 82, 66, 85, 73, 79], ReadyTime: 1000, BorderY: 0.8, Radius: 1 / 2, MaxScoreLimitGOSA: 50, LimitGOSA: 100, MistakeScore: -100 },
	Audio: new Audio(),//Overwritten by Init
	Draw: undefined,//Overwritten by Game.OnLoad
	Lines: [{ Color: 0, Light: 0, Nodes: [{ Time: [], _: { Pressed: false } }] }],//Overwritten by Init Time.len==3=> _.KeyDowned:false/true
	MakingMode: false,//Trueのとき、Lines.Nodesがsortされているとは限らない
	AutoMode: false,
	MusicFile: "",//Overwritten by Init( プレビューへゲームから行くときに音楽が途切れないように)
	FinishTime: 0,//Overwritten by Init
	Speed: 5000,/////Overwritten by ReflushPreview
	_score: 0,//Overwritten by Init
	set Score(x) { this._score = x; GetElm("score").innerText = this._score; },
	get Score() { return this._score; },
	Combo: 0,//Overwritten by Init
	Init: () => {
		Game.Nodes = [];
		Game.Lines = [];
		Game._.Keys.forEach(() => Game.Lines.push({ Color: 0, Light: 0, Nodes: [] }));
		Util.LoadScript(SongList[Number.parseInt(GetElm("song").getAttribute("song"))].Folder + "/setting.js", () => {
			if (!Game.AutoMode || MusicFile != Game.MusicFile) {
				Game.MusicFile = MusicFile;
				Game.Audio.src = (SongList[Number.parseInt(GetElm("song").getAttribute("song"))].Folder + "/" + MusicFile);
			}
			Game.Audio.currentTime = 0;
			Game.Score = 0;
			Game.Combo = 0;
			Game.FinishTime = Infinity;
			NodeText.split(" ").forEach((word) => {
				var tmp = word.split(":").map(v => Number.parseInt(v));
				switch (tmp.length) {
					case 1:
						Game.FinishTime = tmp[0];
						break;
					case 2:
						Game.Lines[tmp[0]].Nodes.push({ Time: tmp.slice(1), _: { Pressed: false } });
						break;
					case 3:
						Game.Lines[tmp[0]].Nodes.push({ Time: tmp.slice(1), _: { Pressed: false, KeyDowned: false } });
						break;
				}
			});
			NodeText = "";
			Game.Lines.forEach((line) => { line.Nodes = line.Nodes.sort((a, b) => a.Time[0] - b.Time[0]); });
			Game.Audio.play();
			Game.Tick();
		});
	}, Tick: () => {
		if (Game.Audio.currentTime * 1000 > Game.FinishTime && GetElm("fin").classList.contains("fading2")) {
			Game.OnFin();
			return;
		}
		var now = Game.Audio.currentTime * 1000;
		Game.Draw.ctx.clearRect(0, 0, Game.Draw.Scalex, Game.Draw.Scaley);
		Game.Lines.forEach((line, i) => {
			line.Light *= 0.95;
			line.Color *= 0.95;
			var Color = `hsl(${line.Color * 60 + 60},${line.Light * 80 + 20}%,${Math.min(0.4, line.Light) * 25 + 50}%)`;
			var ColorOfNode = `hsla(${line.Color * 60 + 60},${line.Light * 80 + 20}%,${Math.min(0.4, line.Light) * 25 + 50}%,0.5)`;
			var Linex = 1 / Game.Lines.length * (i + 0.5);
			var Ry = Game._.Radius / Game.Lines.length * (Game.Draw.Scalex > Game.Draw.Scaley ? 1 : Game.Draw.Scalex / Game.Draw.Scaley);
			Game.Draw.Path(() => {
				Game.Draw.Line(Linex, 0, Linex, Game._.BorderY - Ry);
				Game.Draw.Round(Linex, Game._.BorderY, Game._.Radius / Game.Lines.length);
				return { Stroke: Color };
			});

			Game.Draw.ctx.globalCompositeOperation = "lighter";
			line.Nodes.some((node) => {
				switch (node.Time.length) {
					case 1:
						var y = Math.pow(1 - ((node.Time[0] - now) / Game.Speed), 5) * (Game._.BorderY + Ry) - Ry;
						if (y < -Ry) return Game.MakingMode;
						if (y > 1 + Ry) return false;
						if (y > Game._.BorderY && Game.AutoMode)
							node._.Pressed = true;
						Game.Draw.Path(() => {
							Game.Draw.Round(Linex, y, Game._.Radius / Game.Lines.length);
							if (node._.Pressed)
								return { Stroke: ColorOfNode };
							else
								return { Fill: ColorOfNode };
						});
						break;
					case 2:
						var y1 = Math.pow(1 - ((node.Time[0] - now) / Game.Speed), 5) * (Game._.BorderY + Ry) - Ry;//小さい
						var y2 = Math.pow(1 - ((node.Time[1] - now) / Game.Speed), 5) * (Game._.BorderY + Ry) - Ry;//大きい
						if (y1 < -Ry) return Game.MakingMode;
						if (y2 > 1 + Ry) return false;
						if (y2 > Game._.BorderY && Game.AutoMode)
							node._.Pressed = true;
						Game.Draw.Path(() => {
							Game.Draw.LongRound(Linex, y2, y1 - y2, Game._.Radius / Game.Lines.length);
							if (node._.Pressed)
								return { Stroke: ColorOfNode };
							else
								return { Fill: ColorOfNode };
						});
						break;
				}
				Game.Draw.ctx.globalCompositeOperation = "source-over";
				return false;
			})
		});
		requestAnimationFrame(Game.Tick);
	}, OnKey: (isUp, Key, Other) => {
		//TODO:Making-Assist
		if (Game.AutoMode) return;
		var now = Game.Audio.currentTime * 1000;
		if (Game.MakingMode && !isUp) {
			switch (Key) {
				case 13: //Enter: Finish
					Game.FinishTime = now;
					console.log("--DATA--");
					var NodeTexts = [];
					Game.Lines.forEach((v, i) => {
						var Texts = [];
						v.Nodes.sort((a, b) => a.Time[0] - b.Time[0]).forEach((v) => {
							Texts.push(i + ":" + v.Time.join(":"));
						});
						NodeTexts.push(Texts.join(" "));
					});
					NodeTexts.push(Game.FinishTime);
					console.log('NodeText = "' + NodeTexts.join(" ") + '";');
					return;
				case 67: //C: SpeedDown
					Game.Audio.playbackRate = Math.min(4, Math.max(0.2, Game.Audio.playbackRate - 0.05));
					console.log("Speed: " + Game.Audio.playbackRate);
					return;
				case 86: //V: SpeedUp
					Game.Audio.playbackRate = Math.min(4, Math.max(0.2, Game.Audio.playbackRate + 0.05));
					console.log("Speed: " + Game.Audio.playbackRate);
					return;
				case 90: //Z: 戻る
					Game.Audio.currentTime = Math.max(0, Game.Audio.currentTime - 0.5);
					console.log("Time: " + Game.Audio.currentTime);
					return;
				case 88: //X: 進む
					Game.Audio.currentTime = Math.max(0, Game.Audio.currentTime + 0.5);
					console.log("Time: " + Game.Audio.currentTime);
					return;
			}
		}
		if (Key == 78) {//N: Pause
			Game.Audio.pause();
			return;
		} if (Key == 77) {//M: Restart
			Game.Audio.play();
			return;
		}
		if (!Game.MakingMode && !Game.Audio.played) return;
		Game._.Keys.some((key, i) => {
			if (key == Key) {
				if (Game.MakingMode && !Other.Shift) {
					if (!isUp) {
						Game.Lines[i].Nodes.push({ Time: [now << 0], _: { Pressed: false } });
					}
					return true;
				}
				var This = { ID: -1, Timespan: Infinity };//Timespan: now-node[0]
				Game.Lines[i].Nodes.forEach((node, i) => {
					var span = Infinity;
					switch (node.Time.length) {
						case 1:
							if (!isUp && !node._.Pressed)
								span = now - node.Time[0];
							break;
						case 2:
							if (isUp && node._.KeyDowned) {
								span = now - node.Time[1];
							} else if (!isUp && !node._.KeyDowned) {
								span = now - node.Time[0];
							}
							break;
					}
					if (Math.abs(span) < Math.abs(This.Timespan))
						This = { ID: i, Timespan: span };
				});

				if (Game.MakingMode) {
					if (This.ID >= 0 && !isUp) Game.Lines[i].Nodes.splice(This.ID, 1);
				} else {
					if (This.ID >= 0 && Math.abs(This.Timespan) < Game._.LimitGOSA) {
						switch (Game.Lines[i].Nodes[This.ID].Time.length) {
							case 1:
								Game.Lines[i].Nodes[This.ID]._.Pressed = true;
							case 2:
								if (isUp)
									Game.Lines[i].Nodes[This.ID]._.Pressed = true;
								else
									Game.Lines[i].Nodes[This.ID]._.KeyDowned = true;
						}
						Game.Lines[i].Color = Math.sign(This.Timespan) * (Math.max(Math.abs(This.Timespan), Game._.MaxScoreLimitGOSA) - Game._.MaxScoreLimitGOSA) / (Game._.LimitGOSA - Game._.MaxScoreLimitGOSA);
						Game.Lines[i].Light = 1;
						Game.Combo = Math.min(Game.Combo + 1, 5);
						Game.Score += (Game.Combo / Math.pow((
							Math.max(Math.abs(This.Timespan), Game._.MaxScoreLimitGOSA) - Game._.MaxScoreLimitGOSA) / (Game._.LimitGOSA - Game._.MaxScoreLimitGOSA) //0:Good ~ 1:Bad
							* 0.9 + 0.1 //.1:Good ~ 1:Bad
							, 2) * 5.1 + 490) << 0;//1000*Combo:Good ~ 500*Combo:Bad
					} else if (!isUp) {
						Game.Combo = 0;
						Game.Score += Game._.MistakeScore;
					}
				}
				return true;
			}
			return false;
		});
		if (Game.MakingMode) {
			Game._.MakingLongKeys.some((key, i) => {
				if (key == Key) {
					if (!isUp) {
						Game.Lines[i].Nodes.push({ Time: [now << 0, (Game.Audio.duration * 1000) << 0], _: { Pressed: false, KeyDowned: false } });
						Game_Onkey_MakingLong[i] = Game.Lines[i].Nodes.length - 1;
					} else {
						Game.Lines[i].Nodes[Game_Onkey_MakingLong[i]].Time[1] = now << 0;
					}
				}
			});
		}
	}, OnFin: () => {
		if (!Game.AutoMode) {
			ShowFin();
		} else {
			Game.Init();
		}	
	}, OnLoad: () => {
		Game.Audio = new Audio();
		Game.Audio.preload = "auto";
		Game.Audio.onended = () => {
			Game.Audio.currentTime = 0;
			Game.OnFin();
		};
		//Game.Audio.loop = true;
		Game.Draw = new Drawing(GetElm("c1"), GetElm("game"));

		Game_Keyboard_.Pressed = [];
		Game_Onkey_MakingLong = new Array(Game._.MakingLongKeys.length);
		Game._.Keys.forEach((v) => Game_Keyboard_.Pressed[v] = false);
		document.onkeydown = (e) => {
			if (!e) e = window.event;
			if (Game_Keyboard_[e.keyCode]) return;
			Game_Keyboard_[e.keyCode] = true;
			Game.OnKey(false, e.keyCode, { Shift: e.shiftKey, });
		}
		document.onkeyup = (e) => {
			if (!e) e = window.event;
			if (!Game_Keyboard_[e.keyCode]) return;
			Game_Keyboard_[e.keyCode] = false;
			Game.OnKey(true, e.keyCode, { Shift: e.shiftKey });
		}
		Game.Draw.ctx.canvas.addEventListener('touchstart', function (e) {
			console.log(e.touches.item(0).clientX);
			console.log(Game.Draw.Scalex);
			if (!e) e = window.event;
			for (let i = 0; i < e.touches.length; i++)
				Game.OnKey(false, Game._.Keys[(e.touches.item(i).clientX / (Game.Draw.Parent.clientWidth/ Game._.Keys.length)) << 0] );
		});
		Game.Draw.ctx.canvas.addEventListener('touchend', function (e) {
			if (!e) e = window.event;
			for (let i = 0; i < e.touches.length; i++)
				Game.OnKey(true, Game._.Keys[(e.touches.item(i).clientX / (Game.Draw.Parent.clientWidth / Game._.Keys.length)) << 0]);
		});
	}//Document.onload
}
var Game_Keyboard_ = {
	Pressed: {}
};
var Game_Onkey_MakingLong = [];
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
	}, Blink: (DOM, Fn) => {
		Fn = Fn || (() => 0);
		if (!DOM.classList.contains("blink")) {
			DOM.addEventListener("webkitAnimationEnd", function listener() {
				DOM.classList.remove("blink");
				DOM.removeEventListener("webkitAnimationEnd", listener);
				Fn();
			});
			DOM.classList.add("blink");
		}
		Fn();
	}
};
var Util = {
	LoadScript: (src, callback) => {
		let done = false;
		let head = document.getElementsByTagName('head')[0];
		let script = document.createElement('script');
		script.src = src;
		head.appendChild(script);
		script.onload = script.onreadystatechange = () => {
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
		pair.forEach((V) => {
			let kv = V.split('=');
			arg[kv[0]] = kv[1];
		});
		return arg;
	}, Polyfill: () => {
		window.performance = window.performance || {};
		window.performance.now = window.performance.now || (() => new Date().getTime());

		var timer = null;
		window.requestAnimationFrame = window.requestAnimationFrame || ((callback) => {
			clearTimeout(timer);
			setTimeout(callback, 1000 / 60);
		});
	}
}
Util.Polyfill();
window.addEventListener("load", () => {
	UI.Onload();
	Game.OnLoad();
	Onload();
});