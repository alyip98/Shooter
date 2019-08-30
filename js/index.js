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
var game;
var W, H;
var mx, my;
var socket;
var Mode = {
  PVE: 0,
  PVP: 1
};

function init() {
  W = window.innerWidth;
  H = window.innerHeight;
  c = document.getElementById("Canvas");
  c.width = W;
  c.height = H;
  ctx = c.getContext("2d");
  ctx.fillRect(0, 0, W, H);
  //document.body.appendChild(c)

  mx = W / 2;
  my = H / 2;

  window.onkeydown = keyDownHandler;
  window.onkeyup = keyUpHandler;
  window.onmousemove = keyDownHandler;
  window.onmousedown = mouseDownHandler;
  window.onmouseup = mouseUpHandler;

  setupSocket();

  game = newGame();
  game.init();
  game.tick();
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
    this.stage = 1;
    this.counter = 1;
    this.isPaused = false;
    this.isOver = false;
    this.mode = Mode.PVP;
    this.enemies = [];
    this.projectiles = [];
    this.misc = [];
    this.entities = [];
    this.walls = [];
    this.powerUps = [];
    this.oldTime = Date.now();
    this.doSpawn = false;
    this.autoRestart = true;
    this.autoRestartTimer = new Timer(3000);
  }

  init() {
    this.timeToNextSpawn = 0;

    this.misc.push(new FPSTracker());
    /*for (var i = 0; i < 5; i++) {
            var center = Vector.random(W, H)
            var sides = 3 + Math.floor(Math.random() * 3)
            var size = 50 + Math.random() * 100
        }*/

    var hpPos = Vector.random(W / 2, H / 2);
    this.misc.push(new HealthPackGenerator(hpPos.x, hpPos.y));
    this.registerWall(new NSidedWall(W / 4, (H * 3) / 4, 100, 4));
    this.registerWall(new NSidedWall(W / 4, (H * 1) / 4, 100, 4));
    this.registerWall(new NSidedWall((W * 3) / 4, (H * 3) / 4, 100, 4));
    this.registerWall(new NSidedWall((W * 3) / 4, (H * 1) / 4, 100, 4));
    //spawnEnemy()
  }

  restart() {
    for (var i in this.players) {
      this.players[i].respawn();
      var pos = Vector.random(W, H);
      this.players[i].x = pos.x;
      this.players[i].y = pos.y;
    }

    this.counter = 1;
    this.enemies = [];
    this.projectiles = [];
    this.entities = [];
    this.walls = [];
    this.powerUps = [];
    this.oldTime = Date.now();
    this.isPaused = false;
    this.isOver = false;
    this.registerWall(new NSidedWall(W / 2, H / 2, 200, 3));
  }

  tick() {
    var tmp = this;
    window.requestAnimationFrame(function() {
      tmp.tick();
    });
    var dt = (Date.now() - this.oldTime) * Settings.tickrate;
    if (this.isOver && this.autoRestart) {
      this.autoRestartTimer.ifReady(function() {
        game.restart();
      });
    }

    if (this.isPaused) {
      this.render();
      return;
    }
    this.counter += 1;

    //tick projectiles
    for (var i = 0; i < this.projectiles.length; i++) {
      if (this.projectiles[i].toRemove) {
        this.projectiles[i].destroy();
        this.projectiles.splice(i, 1);
        i -= 1;
      } else {
        this.projectiles[i].tick(dt);
      }
    }

    //tick player
    var alive = 0;
    var livingPlayers = [];
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].tick(dt);
      if (!this.players[i].toRemove) {
        alive++;
        livingPlayers.push(this.players[i]);
      }
    }
    if (this.mode == Mode.PVE && alive == 0 && this.players.length > 0) {
      gameOver();
    }

    if (this.mode == Mode.PVP && alive == 1 && this.players.length > 1) {
      this.winner = livingPlayers[0].name;
      gameOver();
    }

    //tick enemy
    for (var i = 0; i < this.enemies.length; i++) {
      this.enemies[i].tick(dt);
      if (this.enemies[i].toRemove) {
        this.enemies[i].destroy();
        this.enemies.splice(i, 1);
        i -= 1;
      }
    }

    //tick misc
    for (var i = 0; i < this.misc.length; i++) {
      this.misc[i].tick(dt);
      if (this.misc[i].toRemove) {
        this.misc[i].destroy();
        this.misc.splice(i, 1);
        i -= 1;
      }
    }

    //tick misc
    for (var i = 0; i < this.powerUps.length; i++) {
      this.powerUps[i].tick(dt);
      if (this.powerUps[i].toRemove) {
        this.powerUps[i].destroy();
        this.powerUps.splice(i, 1);
        i -= 1;
      }
    }

    // remove expired entities
    for (var i = 0; i < this.entities.length; i++) {
      if (this.entities[i].toRemove) {
        this.entities[i].destroy();
        this.entities.splice(i, 1);
        i -= 1;
      }
    }

    if (this.counter % 100 == 0 && this.mode == Mode.PVE && this.doSpawn) {
      //spawn enemy
      spawnEnemy();
    }

    if (keys.p) {
      spawnEnemy();
    }

    this.render();
    this.oldTime = Date.now();
    //setTimeout(this.tick,100)
  }

  render() {
    //draw black bg
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, W, H);

    if (this.isOver) {
      ctx.fillStyle = "white";
      ctx.font = "30px sans-serif";
      centeredText("Game Over", W / 2, H / 2);
      centeredText("Winner: " + this.winner, W / 2, H / 2 + 45);
      centeredText(
        "Restarting in " +
          Math.ceil(this.autoRestartTimer.getRemainingTime() / 1000),
        W / 2,
        H / 2 + 90
      );
      return;
    }

    //draw grid
    var gridSize = 60;
    var ss = setStrokeStyle("#333");
    var lw = setLineWidth(1);
    for (var i = 0; i < W / gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, H);
      ctx.closePath();
      ctx.stroke();
    }
    for (var j = 0; j < H / gridSize; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * gridSize);
      ctx.lineTo(W, j * gridSize);
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
      this.projectiles[i].render();
    }

    for (var i = 0; i < this.misc.length; i++) {
      this.misc[i].render();
    }

    for (var i = 0; i < this.powerUps.length; i++) {
      this.powerUps[i].render();
    }

    for (var i = 0; i < this.walls.length; i++) {
      this.walls[i].render();
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
    var id = msg.sessionId;
    if (this.getPlayerById(id) != null) {
      console.log("player already exists", id);
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

  registerMisc(e) {
    this.misc.push(e);
  }

  registerPowerUps(e) {
    this.powerUps.push(e);
  }

  registerWall(wall) {
    this.walls.push(wall);
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
  if (game.autoRestart) {
    game.autoRestartTimer.reset();
  }
  console.log("Game Over");
}

function spawnEnemy() {
  var e = new Enemy();
  e.init(Math.random() * W, -50); //Math.random()*H)
  game.enemies.push(e);
}

function debug() {
  console.log("DEBUG");
  var proj = new Projectile(1000, 150, 10000, Math.PI, game.players[0]);
  game.registerProjectile(proj);
}

function resizeWindow(event) {
  W = window.innerWidth;
  H = window.innerHeight;
  c.width = W;
  c.height = H;
}

window.onload = init;
window.onresize = resizeWindow;
