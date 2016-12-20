var a = document.createElement("textarea"); a.value = `var NodeText = "${Timings.sort((a, b) => a.Time - b.Time).filter((a)=>a.Key != -1).map((v) => v.Key + ":" + v.Time).join(" ")} ${FinishTime}";
var MusicFile = "${Scenes.NodeAndAudio.Setting.MusicFileName}";`; a.rows=50;document.body.appendChild(a);
//上のコードをコンソールに貼る