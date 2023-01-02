/* eslint-disable no-undef */
const image = document.getElementById("img");
function updateImage() {
	image.src = image.src.split("?")[0] + "?v=" + Date.now();
}
setInterval(() => updateImage(), 1000);

chrome.runtime.onMessage.addListener(msg => {
	if ("play" in msg) playAudio(msg.play);
});

function playAudio(source) {
	const audio = new Audio(`../resource/audios/${source}.mp3`);
	audio.volume = 1;
	audio.play();
}