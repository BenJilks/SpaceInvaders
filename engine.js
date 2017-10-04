
// Define constants
const fps = 30;
const scale = 4;

// Define engine data
var display, ctx, screenWidth, screenHeight;
var gameClock;
var leftDown = false, rightDown = false, fireDown = false;

// On the page finished loading
function initGameEngine() {
	// Get display object
	display = document.getElementById("display");
	ctx = display.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	screenWidth = display.width / scale;
	screenHeight = display.height / scale;
	gameClock = 0;
}

function updateDisplay() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, screenWidth*scale, screenHeight*scale);
	gameClock++;
}

// Handle user input
function handleKey(event, isDown) {
	var key = String.fromCharCode(event.keyCode);
	if (key == 'A') leftDown = isDown;
	if (key == 'D') rightDown = isDown;
	if (key == 'W') fireDown = isDown;
}
window.onkeydown = function(event) { handleKey(event, true); }
window.onkeyup = function(event) { handleKey(event, false); }

// Loads a sprite from an image file
function loadSprite(filePath) {
	var img = new Image();
	img.src = "Sprites/" + filePath + ".png";
	return img;
}

// Draw a sprite to the screen
function drawSprite(sprite, x, y) {
	ctx.drawImage(sprite, Math.round(x) * scale, Math.round(y) * scale, 
		sprite.width * scale, sprite.height * scale);
}

function testCollition(spriteA, xA, yA, spriteB, xB, yB) {
	if (xA + spriteA.width > xB && xA < xB + spriteB.width &&
		yA + spriteA.height > yB && yA < yB + spriteB.height) 
	{
		return true;
	}
	return false;
}

window.onerror = function(msg, url, linenumber) {
    alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    return true;
}
