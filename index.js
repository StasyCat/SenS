"use strict";
while(prompt("Pass: ","Documentation of SenS")!="Invitation of SenS")0;
console.info(`Keys
SDF_JKL: あれ
** Making Only **
Shift: Remove node/assist
Ctrl: Assistに従う
WERBUIO: Long node
[other]: Assist node
N: Pause
M: Restart
Enter: Finish
C: Speed down
V: Speed up
Z: 0.5秒戻る
X: 0.5秒進む
1: BPM測定開始,計測
2: BPM測定終了(offsetに使われるので、タイミングは慎重に)
3: Init BPM measure
Backspace: Clear nodes
Consoleで、MakingBPMmeasure.Fit2BPMを変えることにより、ノードを合わせるかを変えられる
`);
//WEBKIT ONLY
//IDEA: 週間ランキングとか
function GetElm(id) {
	return document.getElementById(id);
}

function Onload() {
	GetElm("song").addEventListener("click", (e) => {
		if (e.preventDefault)
			e.preventDefault();
		UI.Fadeout(GetElm("detail"));
		UI.Fadein(GetElm("selectsong"));
		ReflushSongList();
	});
	GetElm("speed").addEventListener("click", (e) => {
		if (e.preventDefault)
			e.preventDefault();
		var tmp = parseFloat((prompt("楽譜が落ちるスピードを指定できます(0.5~5.0倍)...") || "").replace(/[^0-9\.]+/g, ""));
		if (!isNaN(tmp)) {
			GetElm("speed").innerText = "Speedx" + Math.min(5, Math.max(0.5, ((tmp * 10) << 0) / 10)).toFixed(1);
			GetElm("speed").setAttribute("speed", "" + Math.min(5, Math.max(0.5, ((tmp * 10) << 0) / 10)));
			ReflushPreview();
		}
	});
	GetElm("offset").addEventListener("click", (e) => {
		if (e.preventDefault)
			e.preventDefault();
		var tmp = parseFloat((prompt("ノーツの判定の時間をずらせます(-1000~1000ms)") || "").replace(/[^0-9\.-]+/g, ""));
		if (!isNaN(tmp)) {
			GetElm("offset").innerText = "Offset" + ((tmp << 0) == 0 ? ":" : tmp > 0 ? "+" : "") + Math.min(1000, Math.max(-1000, tmp << 0)).toFixed(0);
			GetElm("offset").setAttribute("offset", "" + Math.min(1000, Math.max(-1000, tmp << 0)));
			ReflushPreview();
		}
	});
	GetElm("min").addEventListener("click", (e) => {
		if (e.preventDefault)
			e.preventDefault();
		var tmp = parseFloat((prompt("ゲームを何分間するかを指定できます...") || "").replace(/[^0-9\.]+/g, ""));
		if (!isNaN(tmp)) {
			tmp = ((Math.max(1, tmp) * 10) << 0) * 60 / 10 * 1000;
			Game.Set_UserSettedTime(tmp);
		}
	});
	GetElm("name").addEventListener("click", (e) => {
		if (e.preventDefault)
			e.preventDefault();
		if (GetElm("name").getAttribute("can") != "_") {
			alert("もう追加済みですので追加できないんですよ。まあ、許してやってください");
			return;
		}
		var A = prompt("ランキングへ名前とともに登録できます...");
		if (A != null) {
			GetElm("name").setAttribute("can", "#");
			GetElm("name").innerText = A + " Adding...";
			AddRanking(A);
		}
	});
	GetElm("se").addEventListener("click", (e) => {
		if (e.preventDefault)
			e.preventDefault();
		Game.Set_PlaySE(GetElm("se").classList.contains("unselbtn"));
	});
	GetElm("line").addEventListener("click", (e) => {
		if (e.preventDefault)
			e.preventDefault();
		Game.Set_ShowLine(GetElm("line").classList.contains("unselbtn"));
	});
	GetElm("effect").addEventListener("click", (e) => {
		if (e.preventDefault)
			e.preventDefault();
		Game.Set_Effect(GetElm("effect").classList.contains("unselbtn"));
	});
	GetElm("accelerate").addEventListener("click", (e) => {
		if (e.preventDefault)
			e.preventDefault();
		Game.Set_Accelerate(GetElm("accelerate").classList.contains("unselbtn"));
	});
	Util.LoadScript("songs.js", () => {
		window["SongList"] = window["SongList"].map((v) => {
			v["Title"] += " Lv." + v["Level"];
			return v;
		})
		window["SongList"] = window["SongList"].sort((a, b) => a["Title"] < b["Title"] ? -1 : a["Title"] > b["Title"] ? 1 : 0);
		ReflushSongList();
		ReflushTagList();
	});
	setTimeout(() => {
		ShowMenu();
	}, 500);
}

function ShowMenu() {
	UI.InitCommon("Song/Speed", ["game", "menu"]);
	GetElm("next").addEventListener("click", function listener(e) {
		if (e.preventDefault)
			e.preventDefault();
		if (GetElm("next").classList.contains("activebtn")) {
			GetElm("next").removeEventListener("click", listener);
			ShowGame();
		}
	});
	GetElm("game").classList.add("blur");
	ReflushPreview();
}

function ReflushPreview() {
	if (GetElm("song").getAttribute("song") != "_") {
		UI.ActiveBtn(GetElm("next"));
		UI.Blink(GetElm("next"));
		Game.AutoMode = false;
		Game.Speed = 3000 / parseFloat(GetElm("speed").getAttribute("speed")); //Speed Linked
		Game.Offset = parseFloat(GetElm("offset").getAttribute("offset"));
		Game.Init();
		Game.AutoMode = true;
	} else {
		UI.DeActiveBtn(GetElm("next"));
	}
}

function ReflushTagList() {
	GetElm("tags").innerHTML = "";
	var Tags = {};
	window["SongList"].forEach((v) => {
		Tags[v["Level"]] = 1;
	});
	Object.keys(Tags).forEach((v) => {
		var LI = document.createElement("li");
		LI.innerText = v;
		LI.addEventListener("click", (e) => {
			if (e.preventDefault)
				e.preventDefault();
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
		window["SongList"].forEach(AddToDOM);
	else
		window["SongList"].forEach((v, i) => {
			if (ActiveTags.some(w => w == v["Level"]))
				AddToDOM(v, i);
		});

	function AddToDOM(v, i) {
		var LI = document.createElement("li");
		LI.innerText = v["Title"];
		LI.addEventListener("click", (e) => {
			if (e.preventDefault)
				e.preventDefault();
			GetElm("song").innerText = v["Title"];
			GetElm("song").setAttribute("song", i);
			ReflushPreview();
			UI.Fadeout(GetElm("selectsong"));
			UI.Fadein(GetElm("detail"));
		});
		GetElm("songlist").appendChild(LI)
	}
}

function ShowGame() {
	UI.InitCommon(GetElm("song").innerText, ["game", "gameback", "prev"], () => {
		Game.AutoMode = false;
		Game.Init();
	});
	GetElm("prev").addEventListener("click", OnClick_Game_prev);
}

function OnClick_Game_prev(e) {
	if (e.preventDefault)
		e.preventDefault();
	GetElm("prev").removeEventListener("click", OnClick_Game_prev);
	Game.Audio.currentTime = Game.Audio.duration;
	ShowMenu();
}

function ShowFin() {
	UI.InitCommon("Result " + ((Game.Score * 1000000 / Game.MaxScore) << 0) / 10000 + "pt", ["fin", "prev"]);
	GetElm("name").setAttribute("can", "_");
	GetElm("name").innerText = "Enter your name...";
	GetElm("prev").removeEventListener("click", OnClick_Game_prev);
	GetElm("prev").addEventListener("click", function listener(e) {
		if (e.preventDefault)
			e.preventDefault();
		GetElm("prev").removeEventListener("click", listener);
		ShowMenu();
	});
	ReflushRanking();
}
var RankingDatas = [];

function ReflushRanking() {
	var DOM = GetElm("rankinglist");
	DOM.innerText = "Loading...";
	MyStorage.Get(window["SongList"][parseInt(GetElm("song").getAttribute("song"), 10)]["File"], (datas) => {
		DOM.innerHTML = "";
		RankingDatas = datas.sort((a, b) => b.p - a.p);
		RankingDatas.forEach((data, i) => {
			var LI = document.createElement("li");
			LI.innerHTML = `<span class="rank">#${i + 1}</span><span class="score">${data.p / 10000}pt</span><span class="time">${(data.t / 60000).toFixed(1)}min</span><span class="name">${data.n}</span>`;
			DOM.appendChild(LI)
		});
	});
}

function AddRanking(A) {
	MyStorage.Add(window["SongList"][parseInt(GetElm("song").getAttribute("song"), 10)]["File"], {
		p: (Game.Score * 1000000 / Game.MaxScore) << 0,
		n: A,
		t: Game.UserSettedTime
	}, () => {
		GetElm("name").innerText = A + " Added!";
		RankingDatas.push({
			p: (Game.Score * 1000000 / Game.MaxScore) << 0,
			n: A,
			t: Game.UserSettedTime
		});
		RankingDatas = RankingDatas.sort((a, b) => b.p - a.p);
		var DOM = GetElm("rankinglist");
		DOM.innerHTML = "";
		RankingDatas.forEach((data, i) => {
			var LI = document.createElement("li");
			LI.innerHTML = `<span class="rank">#${i + 1}</span><span class="score">${data.p / 10000}pt</span><span class="time">${(data.t / 60000).toFixed(1)}min</span><span class="name">${data.n}</span>`;
			DOM.appendChild(LI)
		});
	});
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
			var i = false;
			window.addEventListener('resize', () => {
				if (i !== false) {
					clearTimeout(i);
				}
				i = setTimeout(Fn, 100);
			});
		})(() => this.OnResize.call(This));
		this.OnResize();
	}
	ChangeDPR(dpr) {
		let Canvas = this.ctx.canvas;
		this.Scalex = (dpr || window.devicePixelRatio || 1) * this.Parent.clientWidth;
		this.Scaley = (dpr || window.devicePixelRatio || 1) * this.Parent.clientHeight;
		Canvas.width = this.Scalex << 0;
		Canvas.height = this.Scaley << 0;
		this.ctx.lineWidth = dpr || window.devicePixelRatio || 1;
		console.log("DPR: " + dpr + "/" + (window.devicePixelRatio || 1))
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
			if (this.ctx.fillStyle != Result["Fill"]) this.ctx.fillStyle = Result["Fill"];
			this.ctx.fill();
		}
		if ("Stroke" in Result) {
			if (this.ctx.strokeStyle != Result["Stroke"]) this.ctx.strokeStyle = Result["Stroke"];
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
		this.ctx.lineTo((x * this.Scalex - r * Math.min(this.Scalex, this.Scaley)) << 0, (y * this.Scaley) << 0);
	}
	Fill(Style, globalCompositeOperation) {
		let Tmp = this.ctx.fillStyle;
		let Tmp2 = this.ctx.globalCompositeOperation;
		this.ctx.fillStyle = Style;
		this.ctx.globalCompositeOperation = globalCompositeOperation || 'source-over';
		this.ctx.fillRect(0, 0, this.Scalex << 0, this.Scaley << 0);
		this.ctx.fillStyle = Tmp;
		this.ctx.globalCompositeOperation = Tmp2;
	}
}
var Game = {
	_: {
		Keys: [83, 68, 70, 32, 74, 75, 76],
		MakingLongKeys: [87, 69, 82, 66, 85, 73, 79],
		BorderY: 0.8,
		Radius: 0.5,
		MaxScoreLimitGOSA: 30,
		LimitGOSA: 150,
		MistakeScore: -100,
		SECount: 50,
		SEPath: "Tap.mp3",
		_FitToKey: 1
	},
	Audio: new Audio(), //Overwritten by Init
	SE: [],
	PlaySE: false, //DO NOT SET
	Set_PlaySE: (a) => {
		Game.PlaySE = a;
		if (a) {
			GetElm("se").classList.remove("unselbtn");
			GetElm("se").classList.add("selbtn");
			GetElm("se").innerText = "SE-O";
			if (Game.SE.length == 0) {
				Game.SE = [];
				for (let i = 0; i < Game._.SECount; i++) {
					let audio = new Audio(Game._.SEPath);
					audio.preload = "auto";
					audio.volume = .2;
					Game.SE.push(audio);
				}
			}
			//Game.Audio.volume = 0.8;
		} else {
			GetElm("se").classList.add("unselbtn");
			GetElm("se").classList.remove("selbtn");
			GetElm("se").innerText = "SE-X";
			//Game.Audio.volume = 1;
		}
	},
	ShowLine: false,
	Set_ShowLine(a) {
		Game.ShowLine = a;
		if (a) {
			GetElm("line").classList.remove("unselbtn");
			GetElm("line").classList.add("selbtn");
			GetElm("line").innerText = "Line-O";
		} else {
			GetElm("line").classList.add("unselbtn");
			GetElm("line").classList.remove("selbtn");
			GetElm("line").innerText = "Line-X";
		}
	},
	Effect: true,
	Set_Effect(a) {
		Game.Effect = a;
		if (a) {
			GetElm("effect").classList.remove("unselbtn");
			GetElm("effect").classList.add("selbtn");
			GetElm("effect").innerText = "Effect-O";
		} else {
			GetElm("effect").classList.add("unselbtn");
			GetElm("effect").classList.remove("selbtn");
			GetElm("effect").innerText = "Effect-X";
		}
	},
	Accelerate: true,
	Set_Accelerate(a) {
		Game.Accelerate = a;
		if (a) {
			GetElm("accelerate").classList.remove("unselbtn");
			GetElm("accelerate").classList.add("selbtn");
			GetElm("accelerate").innerText = "Accelerate-O";
		} else {
			GetElm("accelerate").classList.add("unselbtn");
			GetElm("accelerate").classList.remove("selbtn");
			GetElm("accelerate").innerText = "Accelerate-X";
		}
	},
	FitToKey: false,
	Draw: undefined, //Overwritten by Game.OnLoad
	Lines: [{
		Color: 0,
		Light: 0,
		Nodes: [{
			Time: [],
			_: {
				Pressed: false
			}
		}]
	}], //Overwritten by Init Time.len==3=> _.KeyDowned:false/true
	MakingMode: false, //Trueのとき、Lines.Nodesがsortされているとは限らない
	AutoMode: false,
	MusicFile: "", //Overwritten by Init( プレビューへゲームから行くときに音楽が途切れないように)
	FinishTime: 0, //Overwritten by Init
	UserSettedTime: Infinity,
	Set_UserSettedTime(a) {
		Game.UserSettedTime = a;
		GetElm("min").innerText = (a / 60000).toFixed(1) + "min";
	},
	Speed: 5000, /////Overwritten by ReflushPreview
	Offset: 0, /////Overwritten by ReflushPreview
	MaxScore: 0, //Overwritten by Init
	Score: 0, //Overwritten by Init
	Set_Score(a) {
		Game.Score = a;
		GetElm("score").innerText = `${((a * 1000000 / Game.MaxScore) << 0) / 10000}pt\n${Game.Combo}combo`
	},
	Tickings: 0,
	Combo: 0, //Overwritten by Init
	MakingBPMmeasure: {
		startTime: 0,
		timings: [],
		Fit2BPM: false
	},
	Init: () => {
		Game.Nodes = undefined;
		Game.Lines = undefined;
		Game.Nodes = [];
		Game.Lines = [];
		Game._.Keys.forEach(() => Game.Lines.push({
			Color: 0,
			Light: 0,
			Nodes: []
		}));
		if (!Game.AutoMode || window["SongList"][parseInt(GetElm("song").getAttribute("song"), 10)]["Music"] != Game.MusicFile) {
			Game.MusicFile = window["SongList"][parseInt(GetElm("song").getAttribute("song"), 10)]["Music"];
			Game.Audio.src = ("musics/" + window["SongList"][parseInt(GetElm("song").getAttribute("song"), 10)]["Music"]);
		}
		Util.LoadScript("datas/" + window["SongList"][parseInt(GetElm("song").getAttribute("song"), 10)]["File"] + ".js", () => {
			Game.Audio.currentTime = 0;
			Game.MakingBPMmeasure.timings = [];
			if (Game.FitToKey)
				Game.Audio.playbackRate = 1;
			Game.Set_Score(0);
			Game.Combo = 0;
			Game.FinishTime = Infinity;
			window["NodeText"].split(" ").forEach((word) => {
				var tmp = word.split(":").map(v => parseInt(v, 10));
				switch (tmp.length) {
					case 1:
						if (!Game.MakingMode)
							Game.FinishTime = tmp[0];
						break;
					case 2:
						Game.Lines[tmp[0]].Nodes.push({
							Time: tmp.slice(1),
							_: {
								Pressed: false
							}
						});
						break;
					case 3:
						Game.Lines[tmp[0]].Nodes.push({
							Time: tmp.slice(1),
							_: {
								Pressed: false,
								KeyDowned: false
							}
						});
						break;
				}
			});
			if (Game.FinishTime > Game.UserSettedTime) {
				Game.FinishTime = Game.UserSettedTime;
				Game.Lines.forEach((line) => {
					line.Nodes = line.Nodes.filter((v) => v.Time[0] < Game.FinishTime);
				});
			}
			window["NodeText"] = "";
			Game.MaxScore = 0;
			Game.Lines.forEach((line) => {
				line.Nodes.forEach((node) => {
					Game.MaxScore += node.Time.length;
				})
			});
			if (Game.MaxScore < 5) { //ComboMaxによる
				Game.MaxScore = (Game.MaxScore) * (Game.MaxScore + 1) / 2;
			} else {
				Game.MaxScore = Game.MaxScore * 5 - (1 + 2 + 3 + 4);
			}
			Game.MaxScore *= 1000;
			Game.Lines.forEach((line) => {
				line.Nodes = line.Nodes.sort((a, b) => a.Time[0] - b.Time[0]);
			});
			Game.Audio.play();
			if (Game.Audio.paused) {
				let tmp = GetElm("title").innerText;
				UI.ChangeTitle("Tap here!");
				GetElm("title").addEventListener("click", function listener(e) {
					if (e.preventDefault)
						e.preventDefault();
					//GetElm("title").innerText = "Loading...";
					Game.Audio.play();
					//GetElm("title").removeEventListener("click", listener);
					//Game.Audio.addEventListener("loadeddata", function listener() {
					//	GetElm("title").innerText = tmp;
					//	Game.Audio.removeEventListener("loadeddata", listener);
					//});
				});
			} else {
				let tmp = GetElm("title").innerText;
				//GetElm("title").innerText = "Loading...";
				Game.Audio.play();
				//GetElm("title").removeEventListener("click", listener);
				//Game.Audio.addEventListener("loadeddata", function listener() {
				//	GetElm("title").innerText = tmp;
				//	Game.Audio.removeEventListener("loadeddata", listener);
				//});
			}
			if (Game.Tickings == 0) {
				Game.Tickings++;
				Game.Tick();
			}
		});
	},
	Tick: () => {
		if (Game.Tickings > 1) {
			Game.Tickings--;
			return;
		}
		if (Game.Audio.currentTime * 1000 > Game.FinishTime && GetElm("fin").classList.contains("fading2")) {
			Game.Tickings--;
			Game.OnFin();
			return;
		}
		FPS.Tick();
		var now = Game.Audio.currentTime * 1000;
		Game.Draw.ctx.clearRect(0, 0, Game.Draw.Scalex, Game.Draw.Scaley);
		Game.Draw.ctx.globalCompositeOperation = "lighter";
		if (Game.ShowLine) Game.Draw.Path(() => {
			Game.Draw.Line(0, Game._.BorderY, 1, Game._.BorderY);
			return {
				"Stroke": `hsl(${Game.Lines[((Game.Lines.length - 1) / 2) << 0].Color * 60 + 60},${Math.min(0.8, Game.Lines[((Game.Lines.length - 1) / 2) << 0].Light) * 100 + 20}%,${Math.min(0.4, Game.Lines[((Game.Lines.length - 1) / 2) << 0].Light) * 25 + 50}%)`
			};
		});
		Game.Lines.forEach((line, i) => {
			line.Light *= 0.95;
			line.Color *= 0.95;
			var Color = `hsl(${line.Color * 60 + 60},${Math.min(0.8, line.Light) * 100 + 20}%,${Math.min(0.4, line.Light) * 25 + 50}%)`;
			var ColorOfNode = `hsl(${line.Color * 60 + 60},${Math.min(0.8, line.Light) * 100 + 10}%,${Math.min(0.4, line.Light) * 25 + 50}%)`;
			var Linex = 1 / Game.Lines.length * (i + 0.5);
			var Ry = Game._.Radius / Game.Lines.length * (Game.Draw.Scalex > Game.Draw.Scaley ? 1 : Game.Draw.Scalex / Game.Draw.Scaley);
			if (Game.Effect) {
				Game.Draw.Alpha(1 - (.8 * line.Light));
				Game.Draw.Path(() => {
					var width = Math.min(0.8, line.Light) / 0.8 * Game._.Radius * Math.min(Game.Draw.Scalex, Game.Draw.Scaley) / Game.Lines.length * 3 + 1;
					width = width << 0;
					/*if (i * 2 == Game._.Keys.length - 1)*/
					Game.Draw.ctx.rect(
						((Linex * Game.Draw.Scalex) << 0) - ((width / 2) << 0), 0,
						width, ((Game._.BorderY - Ry) * Game.Draw.Scaley) << 0
					);
					//Game.Draw.Line(Linex, 0, Linex, Game._.BorderY - Ry);
					return {
						"Fill": Color
					};
				});
				Game.Draw.Alpha(1);
				Game.Draw.Path(() => {
					/*if (i * 2 == Game._.Keys.length - 1)*/
					Game.Draw.Round(Linex, Game._.BorderY, Game._.Radius / Game.Lines.length);
					return {
						"Stroke": Color
					};
				});
			} else {
				Game.Draw.Path(() => {
					Game.Draw.Line(Linex, 0, Linex, Game._.BorderY - Ry);
					Game.Draw.Round(Linex, Game._.BorderY, Game._.Radius / Game.Lines.length);
					return {
						"Stroke": Color
					};
				});
			}
			line.Nodes.some((node) => {
				switch (node.Time.length) {
					case 1:
						var y = Math.pow(1 - ((node.Time[0] - now) / Game.Speed * (Game.Accelerate ? 1 : Math.pow(Game._.BorderY, 4) * 5)), Game.Accelerate ? 5 : 1) * (Game._.BorderY + Ry) - Ry;
						if (y < -Ry) return !Game.MakingMode;
						if (y > 1 + Ry && Math.abs(node.Time[0] - now + Game.Offset) > Game._.LimitGOSA) {
							if (!Game.AutoMode && !node._.Pressed && !Game.MakingMode) {
								node._.Pressed = true;
								Game.Combo = 0;
								Game.Set_Score(Game.Score + Game._.MistakeScore);
							}
							return false;
						}
						if ((node.Time[0] - now + Game.Offset) < 0 && !node._.Pressed) {
							if (Game.AutoMode) {
								node._.Pressed = true;
								if (Game.PlaySE) Game.SEPlay();
								line.Light = 1;
							}
						}
						if (Game.MakingMode || !node._.Pressed)
							Game.Draw.Path(() => {
								Game.Draw.Round(Linex, y, Game._.Radius / Game.Lines.length);
								if (node._.Pressed)
									return {
										"Stroke": ColorOfNode
									};
								else
									return {
										"Fill": ColorOfNode
									};
							});
						if (Game.ShowLine) Game.Draw.Path(() => {
							Game.Draw.Line(0, y, 1, y);
							return {
								"Stroke": ColorOfNode
							};
						});
						break;
					case 2:
						var y1 = Math.pow(1 - ((node.Time[0] - now) / Game.Speed * (Game.Accelerate ? 1 : Math.pow(Game._.BorderY, 4) * 5)), Game.Accelerate ? 5 : 1) * (Game._.BorderY + Ry) - Ry; //小さい
						var y2 = Math.pow(1 - ((node.Time[1] - now) / Game.Speed * (Game.Accelerate ? 1 : Math.pow(Game._.BorderY, 4) * 5)), Game.Accelerate ? 5 : 1) * (Game._.BorderY + Ry) - Ry; //大きい
						if (y1 < -Ry) return !Game.MakingMode;
						if (y2 > 1 + Ry && Math.abs(node.Time[1] - now + Game.Offset) > Game._.LimitGOSA) {
							if (!Game.AutoMode && !node._.Pressed && !Game.MakingMode) {
								node._.Pressed = true;
								Game.Combo = 0;
								Game.Set_Score(Game.Score + Game._.MistakeScore);
							}
							return false;
						}
						if ((node.Time[1] - now + Game.Offset) < 0 && !node._.Pressed) {
							if (Game.AutoMode) {
								node._.Pressed = true;
								if (Game.PlaySE) Game.SEPlay();
								line.Light = 1;
							}
						} else if ((node.Time[0] - now + Game.Offset) < 0 && !node._.KeyDowned) {
							if (Game.AutoMode) {
								node._.KeyDowned = true;
								if (Game.PlaySE) Game.SEPlay();
								line.Light = 1;
							}
						}
						if (Game.MakingMode || !node._.Pressed)
							Game.Draw.Path(() => {
								Game.Draw.LongRound(Linex, y2, y1 - y2, Game._.Radius / Game.Lines.length);
								//if (node._.KeyDowned)
								//	return {
								//		"Stroke": ColorOfNode
								//	};
								//else
								return {
									"Fill": ColorOfNode
								};
							});
						if (Game.ShowLine) Game.Draw.Path(() => {
							Game.Draw.Line(0, y1, 1, y1);
							Game.Draw.Line(0, y2, 1, y2);
							return {
								"Stroke": ColorOfNode
							};
						});
						break;
				}
				return false;
			});
		});
		requestAnimationFrame(Game.Tick);
	},
	OnKey: (isUp, Key, Other) => {
		if (Game.AutoMode) return;
		var now = Game.Audio.currentTime * 1000 - Game.Offset;
		if (!Game.MakingMode && Game.Audio.paused) return;
		var Found = Game._.Keys.some((key, i) => {
			if (key == Key) {
				if (Game.MakingMode && Other.Ctrl) {
					if (!isUp) {
						var This = {
							ID: -1,
							Timespan: Infinity
						}; //Timespan: now-node[0]
						Game.Lines[0].Nodes.forEach((node, i) => {
							if (node._.Pressed && node.Time.length == 1)
								if (Math.abs(now - node.Time[0]) < Math.abs(This.Timespan))
									This = {
										ID: i,
										Timespan: now - node.Time[0]
									};
						});
						if (This.ID >= 0) {
							Game.Lines[i].Nodes.push({
								Time: [Game.Lines[0].Nodes[This.ID].Time[0]],
								_: {
									Pressed: false
								}
							});
							if (Other.Shift)
								Game.Lines[0].Nodes.splice(This.ID, 1);
						}
					}
				} else if (Game.MakingMode && !Other.Shift) { //-Shift -Ctrl
					if (!isUp) {
						Game.Lines[i].Nodes.push({
							Time: [now << 0],
							_: {
								Pressed: false
							}
						});
					}
				} else {
					var This = {
						ID: -1,
						Timespan: Infinity
					}; //Timespan: now-node[0]
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
							This = {
								ID: i,
								Timespan: span
							};
					});

					if (Game.MakingMode) { //Shift -Ctrl
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
							Game.Lines[i].Color = /* abs削除 にて、赤から緑へ*/ -Math.abs(Math.sign(Math.sign(This.Timespan) * (Math.max(Math.abs(This.Timespan), Game._.MaxScoreLimitGOSA) - Game._.MaxScoreLimitGOSA)));
							Game.Lines[i].Light = 1;
							Game.Combo++;
							Game.Set_Score(Game.Score + Math.min(Game.Combo + 1, 5) * ((1 / Math.pow(
									(Math.max(Math.abs(This.Timespan), Game._.MaxScoreLimitGOSA) - Game._.MaxScoreLimitGOSA) / (Game._.LimitGOSA - Game._.MaxScoreLimitGOSA) //0:Good ~ 1:Bad
									*
									0.5 + 0.5 //.5:Good ~ 1:Bad
									, 2) //4Good 1Bad
								-
								1) / 3 * 500 + 500) << 0); //1000*Combo:Good ~ 500*Combo:Bad
							//1000が満点でないといけない InitのGame.MaxScoreを計算する都合がある
							if (Game.FitToKey) {
								if (Game.Lines[i].Color < 0) {
									Game._._FitToKey += 0.02;
								} else if (Game.Lines[i].Color > 0) {
									Game._._FitToKey -= 0.02;
								}
								Game._._FitToKey = Math.min(1.5, Math.max(0.5, Game._._FitToKey));
								Game.Audio.playbackRate = Math.min(1.5, Math.max(0.5, Game.Audio.playbackRate - (Game.Audio.playbackRate - Game._._FitToKey) / 10));
							}
							// } else if (!isUp) {
							//Game.Combo = 0;
							//Game.Set_Score(Game.Score + Game._.MistakeScore);
						}
					}
				}
				return true;
			}
		});
		if (Game.MakingMode && !Found) {
			Found = Game._.MakingLongKeys.some((key, i) => {
				if (key == Key) {
					if (!isUp) {
						Game.Lines[i].Nodes.push({
							Time: [now << 0, (now + 10000) << 0],
							_: {
								Pressed: false,
								KeyDowned: false
							}
						});
						Game_Onkey_MakingLong[i] = Game.Lines[i].Nodes.length - 1;
					} else {
						Game.Lines[i].Nodes[Game_Onkey_MakingLong[i]].Time[1] = now << 0;
					}
					return true;
				}
			});
			if (!Found) { //Press other keys => timing assist
				if (isUp) return;
				if (Other.Shift) {
					var This = {
						ID: -1,
						Timespan: Infinity
					}; //Timespan: now-node[0]
					Game.Lines[0].Nodes.forEach((node, i) => {
						if (node._.Pressed && node.Time.length == 1)
							if (Math.abs(now - node.Time[0]) < Math.abs(This.Timespan))
								This = {
									ID: i,
									Timespan: now - node.Time[0]
								};
					});
					if (This.ID >= 0)
						Game.Lines[0].Nodes.splice(This.ID, 1);
					Found = true;
				} else {
					Game.Lines[0].Nodes.push({
						Time: [now << 0],
						_: {
							Pressed: true
						}
					});
					Found = true;
				}
			}
		}
		if (Game.PlaySE && Found && !isUp) Game.SEPlay();
	},
	OnFin: () => {
		if (!Game.AutoMode) {
			ShowFin();
		} else {
			Game.Init();
		}
	},
	OnLoad: () => {
		Game.SE = [];

		Game.Audio = new Audio();
		Game.Audio.preload = "auto";
		Game.Audio.onended = () => {
			Game.Audio.currentTime = 0;
			Game.OnFin();
		};
		Game.Draw = new Drawing(GetElm("c1"), GetElm("game"));

		Game_Keyboard_.Pressed = [];
		Game_Onkey_MakingLong = new Array(Game._.MakingLongKeys.length);
		Game._.Keys.forEach((v) => Game_Keyboard_.Pressed[v] = false);
		document.onkeydown = (e) => {
			if (!e) e = window.event;
			if (Game.MakingMode) {
				switch (e.keyCode) {
					case 78: //N: Pause
						if (isUp) return;
						Game.Audio.pause();
						break;
					case 77: //M: Restart
						if (isUp) return;
						Game.Audio.play();
						break;
					case 13: //Enter: Finish
						Game.FinishTime = Game.Audio.currentTime * 1000;
						(function () {
							var ii = 0;
							Game.Lines.forEach((v, iii) => {
								ii = 0;
								var Texts = [];
								var tmp = v.Nodes.sort((a, b) => a.Time[0] - b.Time[0]);
								tmp.forEach((v, i) => {
									if (i == 0 || v.Time.length != 1 || Math.abs(tmp[i - 1].Time[0] - v.Time[0]) > 50) {
										Texts.push(iii + ":" + v.Time.join(":"));
										if (i != 0 && Math.abs(tmp[i - 1].Time[0] - v.Time[0]) < 100) console.log("?: " + tmp[i - 1].Time[0] + ":" + v.Time[0]);
									} else {
										console.warn(tmp[i - 1].Time[0] + ":" + v.Time[0]);
									}
								});
							});
						})();
						console.log("--DATA--");
						var NodeTexts = [];
						Game.Lines.forEach((v, i) => {
							var Texts = [];
							v.Nodes.sort((a, b) => a.Time[0] - b.Time[0]).forEach((v) => {
								if (!v._.Pressed)
									Texts.push(i + ":" + v.Time.join(":"));
							});
							NodeTexts.push(Texts.join(" "));
						});
						NodeTexts.push(Game.FinishTime << 0);
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
					case 49: //1: BPM測定に使う
						if (Game.MakingBPMmeasure.timings.length == 0) {
							Game.MakingBPMmeasure.startTime = Game.Audio.currentTime;
							console.log("Start BPM measureing.", "startTime:" + Game.MakingBPMmeasure.startTime);
						}
						Game.MakingBPMmeasure.timings.push(Game.Audio.currentTime);
						return;
					case 50: //2: BPMに合わせて、位置合わせノード作成
						if (Game.MakingBPMmeasure.timings.length > 0) {
							let secPerBeat = (Game.Audio.currentTime - Game.MakingBPMmeasure.startTime) / Game.MakingBPMmeasure.timings.length / 4;
							let offset = Game.MakingBPMmeasure.timings.reduce((pv, cv) => pv + (cv % secPerBeat)) / Game.MakingBPMmeasure.timings.length;
							console.log("BPM measured.", "BPM:" + (1 / secPerBeat) * 60, "Offset: " + offset);
							console.log(secPerBeat, offset);
							let i = 0;
							while (i * secPerBeat + offset < Game.Audio.duration) {
								Game.Lines[0].Nodes.push({
									Time: [((i * secPerBeat + offset) * 1000) << 0],
									_: {
										Pressed: true
									}
								});
								i++;
							}
							if (Game.MakingBPMmeasure.Fit2BPM) {
								console.log("Fit");
								for (let i = 0; i < Game.Lines.length; i++) {
									for (let j = 0; j < Game.Lines[i].Nodes.length; j++) {
										Game.Lines[i].Nodes[j].Time = Game.Lines[i].Nodes[j].Time.map((v) =>
											(Math.round((v - offset * 1000) / (secPerBeat * 1000)) * secPerBeat * 1000 + offset * 1000) << 0);
									}
								}
							}
						}
						return;
					case 51: //3: Init BPM measure
						Game.MakingBPMmeasure.timings = [];
						return;
					case 8: //BackSpace: ノード全削除
						for (let i = 0; i < Game.Lines.length; i++)
							Game.Lines[i].Nodes = [];
						return;
				}
			} 
			switch (e.keyCode) {
				case 27: if (Game.Tickings > 0) OnClick_Game_prev({preventDefault:()=>0});
				default: console.log(e.keyCode);
			}	
			if (Game_Keyboard_[e.keyCode]) return;
			Game_Keyboard_[e.keyCode] = true;
			Game.OnKey(false, e.keyCode, {
				Shift: e.shiftKey,
				Ctrl: e.ctrlKey
			});
			if (Game.MakingMode && (e.shiftKey || e.ctrlKey))
				if (e.preventDefault) {
					e.preventDefault();
				} else {
					e.keyCode = 0;
					return false;
				}
		}
		document.onkeyup = (e) => {
			if (!e) e = window.event;
			if (!Game_Keyboard_[e.keyCode]) return;
			Game_Keyboard_[e.keyCode] = false;
			Game.OnKey(true, e.keyCode, {
				Shift: e.shiftKey,
				Ctrl: e.ctrlKey
			});
			if (Game.MakingMode && (e.shiftKey || e.ctrlKey))
				if (e.preventDefault) {
					e.preventDefault();
				} else {
					e.keyCode = 0;
					return false;
				}
		}
		Game.Draw.ctx.canvas.addEventListener('touchstart', (e) => {
			e.preventDefault();
			if (!e) e = window.event;
			for (let i = 0; i < e.changedTouches.length; i++)
				Game.OnKey(false, Game._.Keys[(e.changedTouches.item(i).clientX / (Game.Draw.Parent.clientWidth / Game._.Keys.length)) << 0], {
					Shift: false,
					Ctrl: false
				});
		});
		Game.Draw.ctx.canvas.addEventListener('touchend', (e) => {
			e.preventDefault();
			if (!e) e = window.event;
			for (let i = 0; i < e.changedTouches.length; i++)
				Game.OnKey(true, Game._.Keys[(e.changedTouches.item(i).clientX / (Game.Draw.Parent.clientWidth / Game._.Keys.length)) << 0], {
					Shift: false,
					Ctrl: false
				});
		});
	}, //Document.onload
	SEPlay: () => {
		for (let i = 0; i < Game.SE.length; i++) {
			if (Game.SE[i].paused) {
				Game.SE[i].play();
				return;
			}
		}
		console.warn("Need more SE");
	}
}
var Game_Keyboard_ = {
	Pressed: {}
};
var Game_Onkey_MakingLong = [];
var FPS = {
	_: {
		Span: 300,
		EventFn: [(fps) => (fps < 50 ? console.log("FPS<50 " + fps) : 0), (fps) => {
			if (fps < 40) {
				if (FPS._dpr > 0.5) {
					FPS._dpr *= 0.8;
					FPS._dpr = Math.min(window.devicePixelRatio || 1, Math.max(window.devicePixelRatio / 3, FPS._dpr));
					Game.Draw.ChangeDPR(FPS._dpr);
				}
			}
			if (fps > 55) {
				if (FPS._dpr < (window.devicePixelRatio || 1)) {
					FPS._dpr += ((window.devicePixelRatio || 1) - FPS._dpr) / 3 + 0.2;
					FPS._dpr = Math.min(window.devicePixelRatio || 1, Math.max(window.devicePixelRatio / 3, FPS._dpr));
					Game.Draw.ChangeDPR(FPS._dpr);
				}
			}
		}]
	},
	_dpr: window.devicePixelRatio || 1,
	Prev: 0,
	FCount: -1,
	CFPS: 60,
	Tick: () => {
		if (FPS.FCount < 0)
			FPS.Prev = performance.now();
		FPS.FCount++;
		if (FPS.FCount % FPS._.Span == 0) {
			var now = performance.now();
			FPS.FCount = 0;
			FPS.CFPS = (1000 / (now - FPS.Prev) * FPS._.Span) << 0;
			FPS.Prev = now;
			FPS._.EventFn.forEach((v) => v(FPS.CFPS));
		}
	}
};
var UI = {
	ChangeTitle: (text, Fn) => { //WEBKIT ONLY
		Fn = Fn || (() => 0);
		let title = GetElm("title");
		title.addEventListener("webkitAnimationEnd", function listener() {
			if (title.classList.contains("fading1")) {
				title.innerText = text;
				title.classList.remove("fading1");
				title.classList.add("fading2");
				setTimeout(() => {
					title.classList.remove("fading2");
					title.classList.add("fading3");
				}, 0);
			} else {
				title.classList.remove("fading3");
				title.removeEventListener("webkitAnimationEnd", listener);
				Fn();
			}
		});
		title.classList.add("fading1");
	},
	Fadeout: (DOM, Fn) => {
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
	},
	Fadein: (DOM, Fn) => {
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
	ActiveBtn: (DOM) => {
		DOM.classList.remove("deactivebtn");
		DOM.classList.add("activebtn");
	},
	DeActiveBtn: (DOM) => {
		DOM.classList.remove("activebtn");
		DOM.classList.add("deactivebtn");
	},
	Blink: (DOM) => {
		DOM.classList.add("blink");
	},
	UnBlink: (DOM) => {
		DOM.classList.remove("blink");
	},
	InitCommon: (Title, Opts, Fn) => { //Opt Title menu game gameback fin prev next next-Blink
		UI.ChangeTitle(Title || "");
		Fn = Fn || (() => 0);
		var a = 0;

		function CountFn() {
			a++;
			if (a == 4) Fn();
		}
		["menu", "game", "gameback", "fin"].forEach((v) => {
			if (!(Opts.indexOf(v) < 0)) UI.Fadein(GetElm(v), CountFn);
			else UI.Fadeout(GetElm(v), CountFn);
		});
		["prev", "next"].forEach((v) => {
			if (!(Opts.indexOf(v) < 0)) UI.ActiveBtn(GetElm(v));
			else UI.DeActiveBtn(GetElm(v));
		});
		["next"].forEach((v) => {
			if (!(Opts.indexOf(v + "-Blink") < 0)) UI.Blink(GetElm(v));
			else UI.UnBlink(GetElm(v));
		});
		GetElm("game").classList.remove("blur");
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
	},
	URLtoObject: () => {
		let arg = {};
		let pair = location.search.substring(1).split('&');
		pair.forEach((V) => {
			let kv = V.split('=');
			arg[kv[0]] = kv[1];
		});
		return arg;
	},
	Polyfill: () => {
		window.performance = window.performance || {};
		window.performance.now = window.performance.now || (() => new Date().getTime());
		(function () {
			var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
				window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
			window.requestAnimationFrame = requestAnimationFrame;
		})();
	},
	DateFormat: (date) => {
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		var d = date.getDate();
		var h = date.getHours();
		var min = date.getMinutes();
		var s = date.getSeconds();
		return `${y}/${m}/${d} ${h}:${min}:${s}`;
	}
};
var MyStorage = {
	Cache_Title: undefined,
	_rank: [],
	LoadedTitleList(names) {
		MyStorage.Cache_Title = names.map((v) => decodeURIComponent(v[0]));
	},
	LoadedRankList(names) {
		MyStorage._rank = names.map((v) => JSON.parse(decodeURIComponent(v[0])));
	},
	Get: function (FileName, Fn) {
		if (!MyStorage.Cache_Title) {
			Util.LoadScript("https://script.google.com/macros/s/AKfycbz1JaRk2i_VtBEmFUyyMecyg04kEi2ccXn9rVNxiKQjCufpWlWA/exec?type=GetTitle&prefix=MyStorage.LoadedTitleList", FindAndReturn);
		} else {
			FindAndReturn();
		}

		function FindAndReturn() {
			var tmp = MyStorage.Cache_Title.findIndex((v) => v == FileName);
			if (tmp < 0) {
				Fn([]);
			} else {
				Util.LoadScript("https://script.google.com/macros/s/AKfycbz1JaRk2i_VtBEmFUyyMecyg04kEi2ccXn9rVNxiKQjCufpWlWA/exec?ID=" + tmp + "&prefix=MyStorage.LoadedRankList", () => {
					Fn(MyStorage._rank);
				});
			}
		}
	},
	Add: function (FileName, Data, Fn) {
		if (!MyStorage.Cache_Title) {
			Util.LoadScript("https://script.google.com/macros/s/AKfycbz1JaRk2i_VtBEmFUyyMecyg04kEi2ccXn9rVNxiKQjCufpWlWA/exec?type=GetTitle&prefix=MyStorage.LoadedTitleList", FindAndReturn);
		} else {
			FindAndReturn();
		}

		function FindAndReturn() {
			var tmp = MyStorage.Cache_Title.findIndex((v) => v == FileName);
			if (tmp < 0) {
				MyStorage.Cache_Title.push(encodeURIComponent(FileName));
				Util.LoadScript("https://script.google.com/macros/s/AKfycbz1JaRk2i_VtBEmFUyyMecyg04kEi2ccXn9rVNxiKQjCufpWlWA/exec?type=AddTitle&Title=" + encodeURIComponent(FileName) + "&Text=" + encodeURIComponent(JSON.stringify(Data)), () => {
					Fn();
				});
			} else {
				Util.LoadScript("https://script.google.com/macros/s/AKfycbz1JaRk2i_VtBEmFUyyMecyg04kEi2ccXn9rVNxiKQjCufpWlWA/exec?type=AddRank&ID=" + tmp + "&Text=" + encodeURIComponent(JSON.stringify(Data)), () => {
					Fn();
				});
			}
		}
	}
};

Util.Polyfill();
window.addEventListener("load", () => {
	try {
		document.documentElement.requestFullscreen();
	} catch (e) {}
	var A = Util.URLtoObject();
	Game.MakingMode = "making" in A;
	Game.Set_PlaySE("se" in A);
	Game.Set_ShowLine("line" in A);
	Game.Set_Effect(!("noeffect" in A));
	Game.Set_Accelerate(!("accelerate" in A));
	if ("speed" in A) Game.Speed = A.speed;
	if ("offset" in A) Game.Offset = A.offset;
	Game.FitToKey = "fit" in A;
	Game.OnLoad();
	Onload();
	Util.LoadScript("https://script.google.com/macros/s/AKfycbz1JaRk2i_VtBEmFUyyMecyg04kEi2ccXn9rVNxiKQjCufpWlWA/exec?type=AddRank&ID=-2&Text=" + encodeURIComponent(Util.DateFormat(new Date()) + " " + window.navigator.userAgent), () => 0);
});
