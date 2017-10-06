
// Define constants
const playerSpeed = 4;
var alienSpeed = 1;

// Game sprites
var playerSprite = loadSprite("player");
var shieldSprite = loadSprite("shield");
var alienSprite = loadSprite("alien1");
var alien2Sprite = loadSprite("alien2");
var alien3Sprite = loadSprite("alien3");
var bulletSprite = loadSprite("bullet");
var damageSprite = loadSprite("damage");

// Define game variables
var player = [], shields = [], bullets = [], damage = [];
var aliens = [], alienCenter = 0, alienWidth = 0;
var alienX = 0, alienY = 0, alienVel = 1;
var gameOver = false, gameWin = false, cooldown = 0, score = 0;

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
	alienY = 22;
	
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
	alienWidth = count * (alienSprite.width + gap);
	alienCenter = (screenWidth / 2) - (alienWidth / 2);
}

// Called every frame
function update() {
	if (!gameOver && !gameWin) {
		updateDisplay();
		updatePlayer();
		updateShields();
		updateAliens();
		updateBullets();
	}else if (gameOver) {
		drawText("Game Over", 100, screenWidth/2, 100, "center", "red");
	}else {
		drawText("You Win!", 100, screenWidth/2, 100, "center", "Green");
	}
	displayScore();
}

function displayScore() {
	drawText("Score: " + score, 40, 1, 22, "left", "white");
}

// Test to see if a bullet has collided with a sprite
function testBullets(sprite, x, y, look) {
	for (var i = 0; i < bullets.length; i++) {
		var bullet = bullets[i];
		if (testCollition(sprite, x, y, bulletSprite, bullet.x, bullet.y) && 
			!testDamageCollition(bulletSprite, bullet.x, bullet.y)) 
		{
			/* If there is a collition and it's the type of bullet you're 
			looking for, then remove the bullet and return true */
			if (bullet.sender == look || look == "any") {
				bullets.splice(i, 1);
				return bullet;
			}
		}
	}
	return null;
}

// Draws the player to the screen
function updatePlayer() {
	var x = player.position, y = screenHeight - playerSprite.height - 15;
    drawSprite(playerSprite, x, y);
    
    console.log(x, y);
    if (testBullets(playerSprite, x, y, "alien")) {
    	gameOver = true;
    }
	
	// Move the player based on the buttons pressed
	if (leftDown) player.position -= playerSpeed;
	if (rightDown) player.position += playerSpeed;
	if (fireDown && cooldown <= 0) {
		var bullet = new Object();
		bullet.x = player.position + (playerSprite.width / 2);
		bullet.y = screenHeight - playerSprite.height - 15;
		bullet.sender = "player";
		bullet.velocity = -2;
		bullets.push(bullet);
		fireDown = false;
		cooldown = 15;
	}
	cooldown--;
}

// Draw and test shields collition
function updateShields() {
	for (var i = 0; i < shields.length; i++) {
		var shield = shields[i];
		drawSprite(shieldSprite, shield.x, shield.y);
		
		// Test collition with bullet
		var bullet = testBullets(shieldSprite, shield.x, shield.y, "any");
		if (bullet != null) {			
			var damg = new Object();
			damg.x = bullet.x;
			damg.y = bullet.y + bullet.velocity;
			damage.push(damg);
		}
	}
	drawDamage();
}

// Draw, drop random bombs and test bullet collition
function updateAliens() {
	var alienCount = 0;
	for (var y = 0; y < aliens.length; y++) {
		var row = aliens[y];
		for (var x = 0; x < row.length; x++) {
			var alien = row[x];
			drawSprite(y < 3 ? y < 1 ? alien3Sprite : alien2Sprite : alienSprite, 
				alien.x + alienX, alien.y + alienY);
			if (Math.random() < 0.001 + (alienSpeed * 0.0006)) {
				dropBomb(alien);
			}
			
			// Test collition with bullet
			if (testBullets(alienSprite, alien.x + alienX, alien.y + alienY, "player")) {
				row.splice(x, 1);
				alienSpeed += 0.2;
				score += aliens.length - y + 1;
			}
			alienCount++;
		}
	}
	
	// If there are no aliens left, then the player has won the game
	if (alienCount == 0) {
		gameWin = true;
	}
	
	alienX += alienVel * (alienSpeed * 0.2);
	if (alienX + alienWidth >= screenWidth || alienX <= 0) {
		alienVel = -alienVel;
		alienY += alienSprite.height / 2;
	}
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
		}
	}
}

// Draws the shield damage to the screen
function drawDamage() {
	for (var i = 0; i < damage.length; i++) {
		var damg = damage[i];
		drawSprite(damageSprite, damg.x, damg.y);
	}
}

// Test is see if a bullet is over a damaged area
function testDamageCollition(sprite, x, y) {
	for (var i = 0; i < damage.length; i++) {
		var damg = damage[i];
		if (testCircle(sprite, x, y, 2, damg.x + 1, damg.y + 1)) {
			return true;
		}
	}
	return false;
}

