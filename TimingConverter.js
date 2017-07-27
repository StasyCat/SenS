var a = document.createElement("textarea");
a.value = `var NodeText = "${Timings.sort((a, b) => a.Time - b.Time).filter((a) => a.Key != -1).map((v) => v.Key + ":" + v.Time).join(" ")} ${FinishTime}";
var MusicFile = "${Scenes.NodeAndAudio.Setting.MusicFileName}";`;
a.rows = 50;
document.body.appendChild(a);
//(古いバージョンの方のゲームを開いたときに)上のコードをコンソールに貼る => 新しい形式が生成される


console.log("--DATA--");
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
	var NodeTexts = [];
	Game.Lines.forEach((v, i) => {
		var Texts = [];
		v.Nodes.sort((a, b) => a.Time[0] - b.Time[0]).forEach((v) => {
			if (!v._.Pressed)
				Texts.push(i + ":" + v.Time.join(":"));
		});
		NodeTexts.push(Texts.join(" "));
	});
	NodeTexts.push(Game.FinishTime);
	console.log('NodeText = "' + NodeTexts.join(" ") + '";');
})();



// BPM2Fit
function Fit2BPM(text) {
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

	var [secPerBeat, offset] = text.split(" ").map((v) => parseFloat(v));
	console.log("BPM measured.", "BPM:" + (1 / secPerBeat) * 60, "Offset: " + offset);
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
	console.log("Fit");
	for (let i = 0; i < Game.Lines.length; i++) {
		for (let j = 0; j < Game.Lines[i].Nodes.length; j++) {
			Game.Lines[i].Nodes[j].Time = Game.Lines[i].Nodes[j].Time.map((v) =>
				(Math.round((v - offset * 1000) / (secPerBeat * 1000)) * secPerBeat * 1000 + offset * 1000) << 0);
		}
	}

	var NodeTexts = [];
	Game.Lines.forEach((v, i) => {
		var Texts = [];
		v.Nodes.sort((a, b) => a.Time[0] - b.Time[0]).forEach((v) => {
			if (!v._.Pressed)
				Texts.push(i + ":" + v.Time.join(":"));
		});
		NodeTexts.push(Texts.join(" "));
	});
	NodeTexts.push(Game.FinishTime);
	console.log('NodeText = "' + NodeTexts.join(" ") + '";');
}