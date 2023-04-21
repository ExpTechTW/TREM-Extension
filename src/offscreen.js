/* eslint-disable no-undef */
setInterval(() => {
	chrome.runtime.sendMessage({ keepAlive: true });
}, 5000);