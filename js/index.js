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
			if (keys["5"])
				game.player.weapon = Weapons.Tesla;
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
				//spawnEnemy()
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



function resizeWindow(event) {
	W = window.innerWidth;
	H = window.innerHeight;
	c.width = W;
	c.height = H;
}

window.onload = init
window.onresize = resizeWindow
