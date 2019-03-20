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
var Mode = {
	PVE: 0,
	PVP: 1
}


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
		game.addPlayer(JSON.parse(msg));
	});

	socket.on("playerRejoin", function(msg) {
		console.log("player rejoining: " + msg);
		game.addPlayer(JSON.parse(msg));
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

class Game {
	constructor() {
		this.players = [];
		this.name = "Game";
		this.stage = 1
		this.counter = 1
		this.enemies = []
		this.projectiles = []
		this.misc = []
		this.entities = []
		this.oldTime = Date.now()
	}
	init() {
		this.timeToNextSpawn = 0;
		this.isPaused = false;
		this.isOver = false;
		this.mode = Mode.PVP;
		//spawnEnemy()
	}

	tick() {
		var dt = Date.now() - this.oldTime
		if (this.isPaused) {
			this.render();
			return;
		}
		this.counter += 1

		//tick player
		var alive = 0;
		var livingPlayers = [];
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].tick(dt)
			if (!this.players[i].toRemove) {
				alive++;
			}
		}
		if (this.mode == Mode.PVE && alive == 0 && this.players.length > 0) {
			gameOver();
		}

		if (this.mode == Mode.PVP && alive == 1) {
			gameOver();
		}

		//tick projectiles
		for (var i = 0; i < this.projectiles.length; i++) {
			this.projectiles[i].tick(dt)
			if (this.projectiles[i].toRemove) {
				this.projectiles.splice(i, 1)
				i -= 1
			}
		}

		//tick enemy
		for (var i = 0; i < this.enemies.length; i++) {
			this.enemies[i].tick(dt);
			if (this.enemies[i].toRemove) {
				this.enemies.splice(i, 1)
				i -= 1
			}
		}

		//tick misc
		for (var i = 0; i < this.misc.length; i++) {
			this.misc[i].tick(dt)
			if (this.misc[i].toRemove) {
				this.misc.splice(i, 1)
				i -= 1
			}
		}

		// remove expired entities
		for (var i = 0; i < this.entities.length; i++) {
			if (this.entities[i].toRemove) {
				this.entities.splice(i, 1)
				i -= 1
			}
		}

		if (this.counter % 100 == 0 && this.mode == Mode.PVE) {
			//spawn enemy
			spawnEnemy()
		}

		if (keys.p) {
			spawnEnemy();
		}

		this.render()
		this.oldTime = Date.now()
			//setTimeout(this.tick,100)
		var tmp = this;
		window.requestAnimationFrame(function(){tmp.tick()})
	}

	render() {
		//draw black bg
		ctx.fillStyle = "black"
		ctx.fillRect(0, 0, W, H)


		if (this.isOver) {
			ctx.fillStyle = "white";
			ctx.fillText("Game Over", W/2, H/2);
			return;
		}

		//draw grid
		var gridSize = 60;
		var ss = setStrokeStyle("#333");
		var lw = setLineWidth(1);
		for (var i = 0; i < W/gridSize; i++) {
			ctx.beginPath()
			ctx.moveTo(i * gridSize, 0);
			ctx.lineTo(i * gridSize, H);
			ctx.closePath();
			ctx.stroke();
		}
		for (var j = 0; j < H/gridSize; j++) {
			ctx.beginPath()
			ctx.moveTo(0, j * gridSize,);
			ctx.lineTo(W, j * gridSize,);
			ctx.closePath();
			ctx.stroke();
		}

		setStrokeStyle(ss);
		setLineWidth(lw);

		//draw player
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].render();
		}

		//draw enemies
		for (var i = 0; i < this.enemies.length; i++) {
			this.enemies[i].render();
		}

		//draw other things
		for (var i = 0; i < this.projectiles.length; i++) {
			this.projectiles[i].render()
		}

		for (var i = 0; i < this.misc.length; i++) {
			this.misc[i].render()
		}
	}

	getPlayerById(id) {
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].id == id) {
				return this.players[i];
			}
		}
		return null;
	}

	addPlayer(msg) {
		console.log("adding player", msg);
		var id = msg.sessionId
		if (this.getPlayerById(id) != null) {
			console.log("player already exists", id)
			return;
		}
		var player = new Player(msg);
		this.players.push(player);
		this.registerEntity(player);
	}

	registerProjectile(p) {
		this.projectiles.push(p);
		this.registerEntity(p);
	}

	registerEntity(e) {
		this.entities.push(e);
	}

	registerEnemy(e) {
		this.enemies.push(e);
		this.registerEntity(e);
	}

	removeEntity(e) {
		var index = this.entities.indexOf(e);
		if (index != -1) {
			return this.entities.splice(index, 1);
		}
		return null;
	}
}

function newGame() {
	return new Game();
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
