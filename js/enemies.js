class Enemy extends Entity {
  constructor() {
    super();
    this.size = 32;
    this.hp = 10;
    this.hpMax = 10;
    this.turnrate = 1;
    this.attack = 0.1;
    this.target = -1;
  }

  init(x, y) {
    this.x = x || W / 2;
    this.y = y || H / 2;
  }

  tick(dt) {
    super.tick(dt);
    var dts = (dt / 1000) * 16 || 1;

    if (this.target == -1) {
      this.target = Math.floor(Math.random() * game.players.length);
    }
    var player = game.players[this.target];
    if (!player) return;
    var targetDir = Math.atan2(-this.y + player.y, -this.x + player.x);
    var ddir = this.facingDir - targetDir;
    if (ddir < -Math.PI) ddir += 2 * Math.PI;
    if (ddir > Math.PI) ddir -= 2 * Math.PI;
    if (Math.abs(ddir) < this.turnrate) this.facingDir = targetDir;
    else if (ddir > 0) {
      this.facingDir -= this.turnrate * dts;
    } else {
      this.facingDir += this.turnrate * dts;
    }
    if (this.facingDir < -Math.PI) {
      this.facingDir += Math.PI * 2;
    }

    //walking

    //acc = 2
    var accCoeff = 2 / 5;
    var ax = this.speed * accCoeff * Math.cos(this.facingDir) * dts;
    var ay = this.speed * accCoeff * Math.sin(this.facingDir) * dts;
    var vx = ax;
    var vy = ay;

    this.x += vx * dts;
    this.y += vy * dts;

    this.dir = Math.atan2(vy, vx);
    this.v = Math.sqrt(vx * vx + vy * vy);

    // dmg
    if (
      this.getCoords().distTo(player.getCoords()) <=
      this.size + player.size
    ) {
      player.damage(this.attack);
    }
  }

  render() {
    super.render();
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();

    var x1 = this.x + this.size * 1 * Math.cos(this.facingDir);
    var x2 = x1 - (this.size / 4) * Math.cos(this.facingDir - Math.PI / 4);
    var x3 = x1 - (this.size / 4) * Math.cos(this.facingDir + Math.PI / 4);

    var y1 = this.y + this.size * 1 * Math.sin(this.facingDir);
    var y2 = y1 - (this.size / 4) * Math.sin(this.facingDir - Math.PI / 4);
    var y3 = y1 - (this.size / 4) * Math.sin(this.facingDir + Math.PI / 4);

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.stroke();
  }
}
