
// Define constants
const speed = 4;

// Game sprites
var playerSprite = loadSprite("player");
var shieldSprite = loadSprite("shield");
var alienSprite = loadSprite("al1");
var bulletSprite = loadSprite("bullet");

// Define game variables
var player = [], hasFired = false, shields = [], bullets = [];
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

// Generate a row of shields
function createShields(count, gap) {
	// Calculate the starting point for the shields to gen from
	var width = shieldSprite.width;
	var totalWidth = count * (width + gap) - gap;
	var start = (screenWidth / 2) - (totalWidth / 2);
	
	// Start at 'start', place a shield and move foward on width plus gap
	var x = start;
	for (var i = 0; i < count; i++) {
		var shield = new Object();
		shield.x = x;
		shield.y = screenHeight - 50;
		shield.health = 5;
		shields.push(shield);
		x += width + gap;
	}
}

// Generate the grid of aliens
function createAleins(rows, count, gap) {
	// Generate a 2d array of aliens
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
	
	// Calculate the center point for all the aliens
	var totalWidth = count * (alienSprite.width + gap);
	alienCenter = (screenWidth / 2) - (totalWidth / 2);
}

// Called every frame
function update() {
	updateDisplay();
	updatePlayer();
	updateAliens();
	updateShields();
	updateBullets();
}

// Test to see if a bullet has collided with a sprite
function testBullets(sprite, x, y, look) {
	for (var i = 0; i < bullets.length; i++) {
		var bullet = bullets[i];
		if (testCollition(sprite, x, y, bulletSprite, bullet.x, bullet.y)) {
			/* If there is a collition and it's the type of bullet you're 
			looking for, then remove the bullet and return true */
			if (bullet.sender == look || look == "any") {
				bullets.splice(i, 1);
				if (bullet.sender == "player")
					hasFired = false;
				return bullet.sender;
			}
		}
	}
	return null;
}

// Draws the player to the screen
function updatePlayer() {
    drawSprite(playerSprite, 
    	player.position, screenHeight - playerSprite.height - 15);
	
	// Move the player based on the buttons pressed
	if (leftDown) player.position -= speed;
	if (rightDown) player.position += speed;
	if (fireDown && !hasFired) {
		var bullet = new Object();
		bullet.x = player.position + (playerSprite.width / 2);
		bullet.y = screenHeight - playerSprite.height - 15;
		bullet.sender = "player";
		bullet.velocity = -2;
		bullets.push(bullet);
		fireDown = false;
		hasFired = true;
	}
}

// Draw and test shields collition
function updateShields() {
	for (var i = 0; i < shields.length; i++) {
		var shield = shields[i];
		drawSprite(shieldSprite, shield.x, shield.y);
		
		// Test collition with bullet
		if (testBullets(shieldSprite, shield.x, shield.y, "any")) {
			shield.health--;
			if (shield.health <= 0)
				shields.splice(i, 1);
		}
	}
}

// Draw, drop random bombs and test bullet collition
function updateAliens() {
	for (var y = 0; y < aliens.length; y++) {
		var row = aliens[y];
		for (var x = 0; x < row.length; x++) {
			var alien = row[x];
			drawSprite(alienSprite, alien.x + alienX, alien.y + alienY);
			if (Math.random() < 0.001) {
				dropBomb(alien);
			}
			
			// Test collition with bullet
			if (testBullets(alienSprite, alien.x + alienX, alien.y + alienY, "player")) {
				row.splice(x, 1);
			}
		}
	}
	
	alienX = alienCenter + Math.sin(gameClock / 20.0) * 18.0;
	alienY += 0.05;
}

// Drop a bomb from an alien
function dropBomb(alien) {
	var bullet = new Object();
	bullet.x = alien.x + alienX + (alienSprite.width / 2);
	bullet.y = alien.y + alienY;
	bullet.sender = "alien";
	bullet.velocity = 2;
	bullets.push(bullet);
}

// Draw and test if a bullet has gone out of bounds
function updateBullets() {
	for (var i = 0; i < bullets.length; i++) {
		var bullet = bullets[i];
		drawSprite(bulletSprite, bullet.x, bullet.y);
		
		// If the bullet is out of bounds, then remove it
		bullet.y += bullet.velocity;
		if (bullet.y > screenHeight || bullet.y <= 0) {
			bullets.splice(i, 1);
			if (bullet.sender == "player")
				hasFired = false;
		}
	}
}

