
// Define constants
const speed = 4;

// Game sprites
var playerSprite = loadSprite("player");
var shieldSprite = loadSprite("shield");
var alienSprite = loadSprite("al1");
var bulletSprite = loadSprite("bullet");

// Define game variables
var player = [], shields = [], bullets = [];
var aliens = [], alienCenter = 0, alienX = 0, alienY = 0;

// On the page finished loading
window.onload = function() {
	initGameEngine();

	// Create player
	player = new Object();
	player.position = screenWidth / 2;
	player.lives = 3;
	
	// Create objects
	createShields(4, 15);
	createAleins(5, 8, 5);
	
	// Start game loop
	setInterval(update, 1000/fps);
}

function createShields(count, gap) {
	const width = shieldSprite.width;
	const totalWidth = count * (width + gap) - gap;
	const start = (screenWidth / 2) - (totalWidth / 2);
	var x = start;
	for (var i = 0; i < count; i++) {
		var shield = new Object();
		shield.x = x;
		shield.y = screenHeight - 50;
		shield.health = 5;
		shields.push(shield);
		x += width + gap;
	}
	alienCenter = (screenWidth / 2) - (totalWidth / 2);
}

function createAleins(rows, count, gap) {
	for (var y = 0; y < rows; y++) {
		var row = [];
		for (var x = 0; x < count; x++) {
			var alien = new Object();
			alien.x = x * (alienSprite.width + gap);
			alien.y = y * (alienSprite.height + gap);
			row.push(alien);
		}
		aliens.push(row);
	}
}

// Called every frame
function update() {
	updateDisplay();
	drawPlayer();
	drawAliens();
	drawShields();
	drawBullets();

	if (leftDown) player.position -= speed;
	if (rightDown) player.position += speed;
	if (fireDown) {
		var bullet = new Object();
		bullet.x = player.position + (playerSprite.width / 2);
		bullet.y = screenHeight - playerSprite.height - 15;
		bullet.isAlien = false;
		bullets.push(bullet);
		fireDown = false;
	}
	
	alienX = alienCenter + Math.sin(gameClock / 20.0) * 18.0;
	alienY += 0.05;
}

// Draws the player to the screen
function drawPlayer() {
    drawSprite(playerSprite, 
    	player.position, screenHeight - playerSprite.height - 15);
}

function drawShields() {
	for (var i = 0; i < shields.length; i++) {
		var shield = shields[i];
		drawSprite(shieldSprite, shield.x, shield.y);
	}
}

function drawAliens() {
	for (var y = 0; y < aliens.length; y++) {
		var row = aliens[y];
		for (var x = 0; x < row.length; x++) {
			var alien = row[x];
			drawSprite(alienSprite, alien.x + alienX, alien.y + alienY);
			
			// Drop bullet
			if (Math.random() < 0.005) {
				var bullet = new Object();
				bullet.x = alien.x + alienX + (alienSprite.width / 2);
				bullet.y = alien.y + alienY;
				bullet.isAlien = true;
				bullets.push(bullet);
			}
		}
	}
}

function drawBullets() {
	for (var i = 0; i < bullets.length; i++) {
		var bullet = bullets[i];
		drawSprite(bulletSprite, bullet.x, bullet.y);
		
		if (bullet.isAlien) {
			bullet.y += 2;
			if (bullet.y > screenHeight || testAlienBullet(bullet)) {
				bullets.splice(i, 1);
			}
		}else {
			bullet.y -= 2;
			if (bullet.y < 0 || testPlayerBullet(bullet)) {
				bullets.splice(i, 1);
			}
		}
	}
}

function testPlayerBullet(bullet) {
	for (var y = 0; y < aliens.length; y++) {
		for (var x = 0; x < aliens[y].length; x++) {
			var alien = aliens[y][x];
			if (testCollition(bulletSprite, bullet.x, bullet.y, 
				alienSprite, alien.x + alienX, alien.y + alienY)) 
			{
				aliens[y].splice(x, 1);
				return true;
			}
		}
	}
	return false;
}

function testAlienBullet(bullet) {
	var x = bullet.x, y = bullet.y;
	var playerY = screenHeight - playerSprite.height - 15;
	if (testCollition(bulletSprite, x, y, playerSprite, player.position, playerY)) {
		alert("Game Over!");
		return true;
	}
	
	for (var i = 0; i < shields.length; i++) {
		var shield = shields[i];
		if (testCollition(bulletSprite, x, y, 
			shieldSprite, shield.x, shield.y)) 
		{
			shield.health--;
			if (shield.health <= 0)
				shields.splice(i, 1);
			return true;
		}
	}
}

