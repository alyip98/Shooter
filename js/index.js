/*
Basic top down shooter with movement and firing. HP not added yet. 1, 2, 3 to change weapons, WASD to move, E to spawn a single enemy, hold P to spawn every frame. Press R while charging the bow to clear the map.

TODO:
Levels
GUI
Obstacles
Buff stacking
Talents
Loot/Items
Add new enemy type


*/
var game
var W, H
var mx, my
var socket


function init() {
	W = window.innerWidth
	H = window.innerHeight
	c = document.getElementById("Canvas")
	c.width = W
	c.height = H
	ctx = c.getContext('2d')
	ctx.fillRect(0, 0, W, H)
		//document.body.appendChild(c)

	mx = W / 2
	my = H / 2

	window.onkeydown = keyDownHandler
	window.onkeyup = keyUpHandler
	window.onmousemove = mouseMoveHandler
	window.onmousedown = mouseDownHandler
	window.onmouseup = mouseUpHandler
	
	setupSocket()

	game = newGame()
	game.init()
	game.tick()
}

function setupSocket() {
	socket = io();
	socket.emit("gameInit", "");
	
	socket.on("playerJoin", function(msg) {
		console.log("player joining: " + msg);
		game.addPlayer(msg);
	});
	
	socket.on("joystick", function(msg) {
		// update controller obj
		var obj = JSON.parse(msg);
		var playerId = obj.id;
		var player = game.getPlayerById(playerId);
		if (player) {
			player.controller.updateJoystick(msg);
		}
	});
	
	socket.on("button", function(msg) {
		// update controller obj
		var obj = JSON.parse(msg);
		var playerId = obj.id;
		var player = game.getPlayerById(playerId);
		if (player) {
			player.controller.updateButton(msg);
		}
	});
}

function newGame() {
	var toReturn = {
		init: function() {
			oldTime = Date.now()
			game.timeToNextSpawn = 0;
			game.isPaused = false;
			game.isOver = false;
			//spawnEnemy()
		},

		tick: function() {
			dt = Date.now() - oldTime
			if (game.isPaused) {
				game.render();
				return;
			}
			game.counter += 1

			//tick player
			var alive = 0;
			for (var i = 0; i < game.players.length; i++) {
				game.players[i].tick(dt)
				if (!game.players[i].toRemove) {
					alive++;
				}
			}
			if (alive == 0 && game.players.length > 0) {
				gameOver();
			}

			//tick projectiles
			for (var i = 0; i < game.projectiles.length; i++) {
				game.projectiles[i].tick(dt)
				if (game.projectiles[i].toRemove) {
					game.projectiles.splice(i, 1)
					i -= 1
				}
			}

			//tick enemy
			for (var i = 0; i < game.enemies.length; i++) {
				game.enemies[i].tick(dt);
				if (game.enemies[i].toRemove) {
					game.enemies.splice(i, 1)
					i -= 1
				}
			}

			//tick misc
			for (var i = 0; i < game.misc.length; i++) {
				game.misc[i].tick(dt)
				if (game.misc[i].toRemove) {
					game.misc.splice(i, 1)
					i -= 1
				}
			}

			if (game.counter % 100 == 0) {
				//spawn enemy
				spawnEnemy()
			}

			if (keys.spawn && Date.now() > game.timeToNextSpawn) {
				game.timeToNextSpawn = Date.now() + 1000;
				spawnEnemy();
			}

			if (keys.p) {
				spawnEnemy();
			}

			game.render()
			oldTime = Date.now()
				//setTimeout(game.tick,100)
			window.requestAnimationFrame(game.tick)
		},

		render: function() {
			//draw black bg
			ctx.fillStyle = "black"
			ctx.fillRect(0, 0, W, H)

			if (game.isOver) {
				ctx.fillStyle = "white";
				ctx.fillText("Game Over", W/2, H/2);
				return;
			}
			//draw player
			for (var i = 0; i < game.players.length; i++) {
				game.players[i].render();
			}

			//draw enemies
			for (var i = 0; i < game.enemies.length; i++) {
				game.enemies[i].render();
			}

			//draw other things
			for (var i = 0; i < game.projectiles.length; i++) {
				game.projectiles[i].render()
			}

			for (var i = 0; i < game.misc.length; i++) {
				game.misc[i].render()
			}
		},

		getPlayerById: function(id) {
			for (var i = 0; i < game.players.length; i++) {
				if (game.players[i].id == id) {
					return game.players[i];
				}
			}
			return null;
		},
		
		addPlayer: function(msg) {
			if (game.getPlayerById(msg) != null) {
				return;
			}
			var player = new Player(msg);
			game.players.push(player);	
		},
		
		players: [],
		name: "Game",
		stage: 1,
		counter: 1,
		enemies: [],
		projectiles: [],
		misc: []
	}
	return toReturn;
}

function gameOver() {
	game.isPaused = true;
	game.isOver = true;
	console.log("Game Over");
}

function spawnEnemy() {
	var e = new Enemy();
	e.init(Math.random() * W, -50) //Math.random()*H)
	game.enemies.push(e)
}

Weapons = {}



function resizeWindow(event) {
	W = window.innerWidth;
	H = window.innerHeight;
	c.width = W;
	c.height = H;
}

window.onload = init
window.onresize = resizeWindow
