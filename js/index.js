/*
Basic top down shooter with movement and firing. HP not added yet. 1, 2, 3 to change weapons, WASD to move, E to spawn a single enemy, hold P to spawn every frame. Press R while charging the bow to clear the map.

TODO:
Levels
GUI
Obstacles
Buff stacking
Talents
Loot/Items


*/
var game
var W, H
var mx, my
var keys = {
	"up": false,
	"down": false,
	"left": false,
	"right": false,
	"space": false,
	"f": false,
	"v": false,
	"mouse": false,
	"spawn": false
}

var keyDefs = {
	"w": "up",
	"ArrowUp": "up",
	"a": "left",
	"ArrowLeft": "left",
	"s": "down",
	"ArrowDown": "down",
	"d": "right",
	"ArrowRight": "right",
	"f": "f",
	"v": "v",
	"e": "spawn",
	"p": "p"
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

	game = newGame()
	game.init()
	game.tick()
}

function newGame() {
	var toReturn = {
		init: function() {
			oldTime = Date.now()
			game.player.init()
			game.timeToNextSpawn = 0;
			//spawnEnemy()
		},

		tick: function() {
			dt = Date.now() - oldTime
			game.counter += 1

			if (keys["1"])
				game.player.weapon = Weapons.Bow;
			if (keys["2"])
				game.player.weapon = Weapons.MachineGun;
			if (keys["3"])
				game.player.weapon = Weapons.Shotgun;
			if (keys["4"])
				game.player.weapon = Weapons.SplitBow;

			//tick player
			game.player.tick(dt)

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

			//draw player
			game.player.render()

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

		player: new Player(),
		name: "Game",
		stage: 1,
		counter: 1,
		enemies: [],
		projectiles: [],
		misc: []
	}
	return toReturn;
}

function spawnEnemy() {
	var e = new Enemy();
	e.init(Math.random() * W, -50) //Math.random()*H)
	game.enemies.push(e)
}

Weapons = {}

function PPT(x, y, text) {
	game.misc.push(new PopupText(x, y, text));
}

function PopupText(x, y, text) {
	this.x = x
	this.y = y
	this.text = text
	this.lifetime = 0
	this.decayTime = 3000
	this.fillStyle = "white"
	this.tick = function(dt) {
		this.y -= 50 * dt / this.decayTime
		this.lifetime += dt
		if (this.lifetime > this.decayTime)
			this.toRemove = true
	}

	this.render = function() {
		tmp = ctx.fillStyle
		ctx.fillStyle = this.fillStyle
		ctx.globalAlpha = 1 - (this.lifetime / this.decayTime)
		ctx.fillText(this.text, this.x, this.y)
		ctx.fillStyle = tmp
		ctx.globalAlpha = 1
	}
}

function getKeyDefs(key) {
	if (keyDefs[key])
		return keyDefs[key]
	return key
}

function keyDownHandler(event) {
	keys[getKeyDefs(event.key)] = true
}

function keyUpHandler(event) {
	keys[getKeyDefs(event.key)] = false
		/*
		if(keyDefs[event.key])
		{
			keys[keyDefs[event.key]]=false
		}*/
}

function mouseMoveHandler(event) {
	mx = event.clientX
	my = event.clientY
}

function mouseDownHandler(event) {
	keys["mouse"] = true
}

function mouseUpHandler(event) {
	keys["mouse"] = false
}

function resizeWindow(event) {
	W = window.innerWidth;
	H = window.innerHeight;
	c.width = W;
	c.height = H;
}

window.onload = init
window.onkeydown = keyDownHandler
window.onkeyup = keyUpHandler
window.onmousemove = mouseMoveHandler
window.onmousedown = mouseDownHandler
window.onmouseup = mouseUpHandler
window.onresize = resizeWindow
