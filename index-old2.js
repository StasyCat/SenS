"use strict";
//ロスタイムメモリ
//document.getElementById(id) を短く書きたかっただけです
function GetElm(id) { return document.getElementById(id); }
class Util {
	static OptArg(OptionalArg, Default) {
		if (OptionalArg === undefined) return Default;
		else return OptionalArg;
	}
	static LoadScript(src, callback) {
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
	static URLtoObject() {
		let arg = {};
		let pair = location.search.substring(1).split('&');
		pair.forEach(function (V) {
			let kv = V.split('=');
			arg[kv[0]] = kv[1];
		});
		return arg;
	}
	//いろんなブラウザに対応
	static Polyfill() {
		window.performance = window.performance || {};
		window.performance.now = window.performance.now || function () { return new Date().getTime(); };

		var timer = null;
		window.requestAnimationFrame = window.requestAnimationFrame || function (callback) {
			clearTimeout(timer);
			setTimeout(callback, 1000 / 60);
		};
	}
}
class Animation {
	constructor(Tick, Resize) {
		this.TickFn = Util.OptArg(Tick, () => { });
		this.ResizeFn = Util.OptArg(Resize, () => { });
		this.ResizeFn();
		(function (Fn) {
			var i;
			window.addEventListener('resize', () => {
				if (i !== false) { clearTimeout(i); }
				i = setTimeout(Fn, 100);
			});
		})(this.ResizeFn);
		this._loopingFn();
	}
	_loopingFn() {
		this.TickFn();
		var This = this;
		requestAnimationFrame(function () { This._loopingFn.call(This) });
	};
}
class Drawing {
	constructor(canvas, font) {
		if (canvas.getContext) this.ctx = canvas.getContext('2d');
		else throw "Canvasが対応していないようです"
		this.Scalex = 1;
		this.Scaley = 1;
		this.font = font;
	}
	Color(min, max) {
		return 'rgb(' + ((Math.random() * (max - min) + min) << 0) + ',' + ((Math.random() * (max - min) + min) << 0) + ',' + ((Math.random() * (max - min) + min) << 0) + ')';
	}
	OnResize() {
		let de = document.documentElement;
		let Canvas = this.ctx.canvas;
		this.Scalex = (window.devicePixelRatio || 1) * de.clientWidth;
		this.Scaley = (window.devicePixelRatio || 1) * de.clientHeight;
		Canvas.width = (this.Scalex) << 0;
		Canvas.height = (this.Scaley) << 0;
		Canvas.style.width = de.clientWidth + "px";
		Canvas.style.height = de.clientHeight + "px";
		this.ctx.lineWidth = (window.devicePixelRatio || 1);
	}
	//Fn(Drawing)=>{Fill:styleText,Stroke:text}
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
	Alpha(alpha) { this.ctx.globalAlpha = alpha; }
	StrokeStyle(style) { this.ctx.strokeStyle = style; }
	FillStyle(style) { this.ctx.fillStyle = style; }
	Line(x1, y1, x2, y2) {
		this.ctx.moveTo((x1 * this.Scalex) << 0, (y1 * this.Scaley) << 0);
		this.ctx.lineTo((x2 * this.Scalex) << 0, (y2 * this.Scaley) << 0);
	}
	Round(x, y, r) {
		this.ctx.arc((x * this.Scalex) << 0, (y * this.Scaley) << 0, (r * Math.min(this.Scalex, this.Scaley)) << 0, 0, 2 * Math.PI);
	}
	Fill(Style, globalCompositeOperation) {
		let Tmp = this.ctx.fillStyle;
		let Tmp2 = this.ctx.globalCompositeOperation;
		this.ctx.fillStyle = Style;
		this.ctx.globalCompositeOperation = Util.OptArg(globalCompositeOperation, 'source-over');
		this.ctx.fillRect(0, 0, (16 * this.Scalex) << 0, (9 * this.Scaley) << 0);
		this.ctx.fillStyle = Tmp;
		this.ctx.globalCompositeOperation = Tmp2;
	}
	FillText(text, x, y, w, size) {
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.font = size + " " + this.font;
		if (w === undefined) this.ctx.fillText(text, (x * this.Scalex) << 0, (y * this.Scaley) << 0);
		else this.ctx.fillText(text, (x * this.Scalex) << 0, (y * this.Scaley) << 0, (w * this.Scalex) << 0);
	}
}
//ここまで折りたため コードが見やすくなる
Util.Polyfill();

var LoadedScript = false;

var Game = Animation;
var Draw = Drawing;
function OnLoad() {
	let Params = Util.URLtoObject();
	Scene.Game._.Making = "making" in Params;
	if (Scene.Game._.Making)
		document.getElementById("splash").innerText = "Sens!\nMaking mode";
	Util.LoadScript(Util.OptArg(Params.Name, "Default.js"), () => {
		if (LoadedScript) OnLoadFile();
		else LoadedScript = true;
	});

	if (Scene.Game._.Making) console.log("タイミングを作成するモードです。作成中は SDF[Space]JKL のキーを使って作成し、終了時には[Enter]を押してください/nShift と同時に押すことで、 ノードを削除できます/nCとVで再生スピードを変えられます/nZとXで再生位置の移動ができます");
}
function OnLoadFile() {
	document.body.removeChild(document.getElementById("splash"));
	Draw = new Drawing(GetElm("c1"), '"Open Sans", "Noto Sans Japanese", Roboto, "Yu Gothic", "Meiryo UI", sans-serif');
	Scene.Game.SetKeyHandler();
	Scene.Game.Inited = false;
	Scene.Fading.Finished = false;
	Game = new Animation(Tick, () => { Draw.OnResize.call(Draw) });//これ即ち実行
}
function Tick() {
	Scene.Game.Tick();
}

//ここからこまごましたやつ
var Scene = {
	Game: {
		_: {
			Key: [83, 68, 70, 32, 74, 75, 76], KeyDefaultType: 0, MissTypeScore: -10,
			Speed: 1, File: "夜咄ディセイブ.mp3", Nodes: "0:0:120 0:1:630 0:2:5000", Border: 0.8, Making: false,
			Colors: [100, 200], HighColors: [200, 255], Radius: 0.5, Types: [
				{
					ToData: (text) => ({ Time: Number.parseInt(text) })
					, GoneOutScr: (data, now, MulY) => {
						var It = Scene.Game;
						var RadiusY = It._.Radius * (Draw.Scalex > Draw.Scaley ? 1 : Draw.Scalex / Draw.Scaley);
						var y = Math.pow(1 - ((data.Time - now) / 2500), 5) * (MulY + RadiusY) - RadiusY;
						return y > 1 + RadiusY;
					}, Path: (data, now, MulY, OffsetX) => {
						var It = Scene.Game;
						var RadiusY = It._.Radius * (Draw.Scalex > Draw.Scaley ? 1 : Draw.Scalex / Draw.Scaley);
						var y = Math.pow(1 - ((data.Time - now) / 2500), 5) * (MulY + RadiusY) - RadiusY;
						if (y > -RadiusY)
							Draw.Round(OffsetX, y, It._.Radius);
					}, KeyToData: (now) => ({ Time: now })
					, KeyToSpan: (data, now) => Math.abs(data.Time - now)
					, KeyToCanPress: (data, now) => {
						console.log(data.Time +":"+ now);
						return Math.abs(data.Time - now) < 1000;
					}
					, KeyToScore: (data, now) => 1 / Math.pow((Math.max(Math.abs(data.Time - now), 50) - 50) / (100 / Scene.Game.Audio.playbackRate) * 0.9 + 0.1, 2) //1~100 Point
				}
			]
		},
		Audio: new Audio(), Lines: [[{ Type: 0, Data: {}, Press: false, GoneOutScr: false }]],
		FinishTime: Infinity, Score: 0, Inited: false,
		Tick: () => {
			var It = Scene.Game;
			if (!It.Inited) {
				It.Inited = true;
				It.Audio = new Audio(It._.File);
				It.Audio.preload = "auto";
				It.Audio.playbackRate = It._.Speed;

				It.Lines = [];
				It._.Key.forEach(() => It.Lines.push([]));
				It._.Nodes.split(" ").forEach((v) => {
					var tmp = v.split(":");
					switch (tmp[0]) {
						case "END":
							It.FinishTime = Number.parseInt(tmp[1]);
							break;
						default:
							It.Lines[Number.parseInt(tmp[1])].push({
								Type: Number.parseInt(tmp[0]),
								Data: It._.Types[Number.parseInt(tmp[0])].ToData(tmp.slice(2).join(":")),
								Press: false,
								GoneOutScr: false
							});
							break;
					}
				});

				It.Score = 0;
				It.Audio.play();
			} else {
				var now = (It.Audio.currentTime * 1000) << 0;
				Draw.Path(() => {
					Draw.Line(0, It._.Border, 1, It._.Border);
					return { Stroke: Draw.Color(It._.HighColors[0], It._.HighColors[1]) };
				});//横線
				It.Lines.forEach((line, i) => {
					let x = 1 / It.Lines.length * (i + 0.5);
					let Color = "";
					if (i * 2 + 1 == It.Lines.length)
						Color = Draw.Color(It._.HighColors[0], It._.HighColors[1]);
					else
						Color = Draw.Color(It._.Colors[0], It._.Colors[1]);

					Draw.Path(() => {
						Draw.Line(x, 0, x, 1);
						return { Stroke: Color };
					});//縦線
					line.forEach((node) => {
						if (node.GoneOutScr) return false;
						node.GoneOutScr = It._.Making || It._.Types[node.Type].GoneOutScr(node.Data, now, It._.Border);
						if (node.GoneOutScr) return false;
						Draw.Path(() => {
							It._.Types[node.Type].Path(node.Data, now, It._.Border, x);
							if (node.Press) return { Stroke: Color, Fill: Color };
							else return { Stroke: Color };
						});
					});//Nodeを描く
				});
			}
		}, OnKey: (Key, Other) => {//Other{Shift:true}
			var It = Scene.Game;
			var now = (It.Audio.currentTime * 1000) << 0;
			if (It._.Making) {
				switch (Key) {
					case 13: //Enter: Finish
						Scene.Game.FinishTime = now;
						//OUTPUT
						return;
					case 67: //C: SpeedDown
						It.Audio.playbackRate = Math.min(4, Math.max(0.2, It.Audio.playbackRate - 0.05));
						console.log("Speed: " + It.Audio.playbackRate);
						return;
					case 86: //V: SpeedUp
						It.Audio.playbackRate = Math.min(4, Math.max(0.2, It.Audio.playbackRate + 0.05));
						console.log("Speed: " + It.Audio.playbackRate);
						return;
					case 90: //Z: 戻る
						It.Audio.currentTime = Math.max(0, It.Audio.currentTime - 0.5);
						console.log("Time: " + It.Audio.currentTime);
						return;
					case 88: //X: 進む
						It.Audio.currentTime = Math.max(0, It.Audio.currentTime + 0.5);
						console.log("Time: " + It.Audio.currentTime);
						return;
				}
			}
			if (Key == 78) {//N: Pause
				It.Audio.pause();
				return;
			} if (Key == 77) {//M: Restart
				It.Audio.play();
				return;
			}
			if (It.Audio.paused) return;
			for (var i = 0; i < It._.Key.length; i++) {
				if (It._.Key[i] == Key) {
					if (It._.Making && Other.Shift != true) {
						It.Lines[i] = {
							Type: It._.KeyDefaultType,
							Data: It._.Types[It._.KeyDefaultType].KeyToData(now),
							Press: false,
							GoneOutScr: false
						};
					} else {
						var This = { ID: -1, Timespan: Infinity };
						It.Lines[i].forEach((node, i) => {
							var span = It._.Types[node.Type].KeyToSpan(node.Data, now);
							if (span < This.Timespan) {
								This = { ID: i, Timespan: span };
							}
						});
						if (This.ID >= 0 && It._.Types[It.Lines[i][This.ID].Type].KeyToCanPress(It.Lines[i][This.ID].Data, now)) {
							It.Score += It._.Types[It.Lines[i][This.ID].Type].KeyToScore(It.Lines[i][This.ID].Data, now);
							if (It._.Making)
								It.Lines[i].splice(This.ID, 1);
							else
								It.Lines[i][This.ID].Press = true;
						} else {
							It.Score -= It._.MissTypeScore;
						}
					}
					return;
				}
			}
		}, SetKeyHandler: () => {
			document.onkeydown = (e) => {
				if (!e) e = window.event;
				Scene.Game.OnKey(e.keyCode, { Shift: e.shiftKey });
			}
		}//Call when document is loaded
	}
}