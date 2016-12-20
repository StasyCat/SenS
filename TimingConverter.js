var a = document.createElement("textarea"); a.value = `var NodeText = "${Timings.sort((a, b) => a.Time - b.Time).filter((a) => a.Key != -1).map((v) => v.Key + ":" + v.Time).join(" ")} ${FinishTime}";
var MusicFile = "${Scenes.NodeAndAudio.Setting.MusicFileName}";`; a.rows = 50; document.body.appendChild(a);
//(古いバージョンの方のゲームを開いたときに)上のコードをコンソールに貼る => 新しい形式が生成される


console.log("--DATA--");
(function() {
	var NodeTexts = [];
	var ii = 0;
	Game.Lines.forEach((v, iii) => {
		ii = 0;
		var Texts = [];
		var tmp = v.Nodes.sort((a, b) => a.Time[0] - b.Time[0]);
		tmp.forEach((v, i) => {
			if (i == 0 || v.Time.length != 1 || Math.abs(tmp[i - 1].Time[0] - v.Time[0]) > 50) {
				Texts.push(iii + ":" + v.Time.join(":"));
				if (i!=0 && Math.abs(tmp[i - 1].Time[0] - v.Time[0]) < 100) console.log("?: " + tmp[i - 1].Time[0] + ":" + v.Time[0]);
			} else {
				console.warn(tmp[i-1].Time[0]+":"+v.Time[0]);
			}
		});
		NodeTexts.push(Texts.join(" "));
	});
	NodeTexts.push(Game.FinishTime);
	console.info('NodeText = "' + NodeTexts.join(" ") + '";');
})();