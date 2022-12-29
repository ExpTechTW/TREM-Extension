/* eslint-disable no-undef */
let _window = null;
let req_lock = false;
let alert_show_window = false;

let audio_note = 0;
let audio_eew = false;

chrome.browserAction.onClicked.addListener((tab) => ShowWindow());

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
					audio_note = Date.now();
					const myAudio = new Audio(chrome.runtime.getURL("./resource/audios/note.mp3"));
					myAudio.play();
				}
			} else alert_show_window = false;
			if (ans.eew != "") {
				if (!alert_show_window) {
					alert_show_window = true;
					ShowWindow();
				}
				if (!audio_eew) {
					audio_eew = true;
					const myAudio = new Audio(chrome.runtime.getURL("./resource/audios/warn.mp3"));
					myAudio.play();
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