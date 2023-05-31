const image = document.getElementById("img");
function updateImage() {
	image.src = image.src.split("?")[0] + "?v=" + Date.now();
}
setInterval(() => updateImage(), 1000);