/* eslint-disable no-undef */
let _window = null;
let req_lock = false;
let alert_show_window = false;

let audio_note = 0;
let audio_eew = false;

let audio_note_times = 0;

const _url = chrome.runtime.getURL("");
const myAudio_note = new Audio("https://github.com/ExpTechTW/TREM-Extension/blob/Release/resource/audios/note.mp3?raw=true");
const myAudio_eew = new Audio("https://github.com/ExpTechTW/TREM-Extension/blob/Release/resource/audios/warn.mp3?raw=true");

chrome.action.onClicked.addListener((tab) => ShowWindow());

main();
function main() {
	setInterval(async () => {
		if (req_lock) return;
		req_lock = true;
		const url = "https://exptech.com.tw/api/v1/trem/status";
		const controller = new AbortController();
		setTimeout(() => controller.abort(), 1500);
		let ans = await fetch(url, { signal: controller.signal }).catch((err) => void 0);
		if (controller.signal.aborted || ans == undefined) req_lock = false;
		else {
			ans = await ans.json();
			if (ans.alert) {
				if (!alert_show_window) {
					alert_show_window = true;
					ShowWindow();
				}
				if (ans.eew == "" && Date.now() - audio_note > 1500) {
					if (audio_note_times == 0)
						chrome.notifications.create("note", {
							type     : "basic",
							iconUrl  : "./resource/images/ic_launcher.png",
							title    : "地震檢知",
							message  : "偵測到較大晃動，注意安全，並留意 中央氣象局 是否發布 強震即時警報",
							priority : 2,
						});
					audio_note_times++;
					if (audio_note_times <= 5) {
						audio_note = Date.now();
						myAudio_note.play();
					}
				}
			} else {
				alert_show_window = false;
				audio_note_times = 0;
			}
			if (ans.eew != "") {
				if (!alert_show_window) {
					alert_show_window = true;
					ShowWindow();
				}
				if (!audio_eew) {
					audio_eew = true;
					myAudio_eew.play();
					chrome.notifications.create("eew", {
						type     : "basic",
						iconUrl  : "./resource/images/ic_launcher.png",
						title    : "強震即時警報",
						message  : "慎防強烈搖晃\n[臨震應變 趴下、掩護、穩住]",
						priority : 2,
					}, () => {
						console.log(1);
					});
				}
			} else audio_eew = false;
			req_lock = false;
		}
	}, 1000);
}

async function ShowWindow() {
	if (!await IsWindowOpen(_window))
		chrome.windows.create({
			url    : chrome.runtime.getURL("../index.html"),
			type   : "popup",
			height : 410,
			width  : 440,
		}, (win) => _window = win.id);
	else
		chrome.windows.get(_window, (w) => chrome.windows.update(w.id, { focused: true }));
}

async function IsWindowOpen(ID) {
	return await new Promise((c) => {
		if (!ID) c(false);
		else
			chrome.windows.getAll({}, (window_list) => {
				for (let index = 0; index < window_list.length; index++)
					if (window_list[index].id == ID) {
						c(true);
						break;
					}
				c(false);
			});
	});
}