var COLORS = [
  "#001f3f",
  "#0074D9",
  "#7FDBFF",
  "#39CCCC",
  "#3D9970",
  "#2ECC40",
  "#01FF70",
  "#FFDC00",
  "#FF851B",
  "#FF4136",
  "#85144b",
  "#F012BE",
  "#B10DC9"
];

class Player extends Entity {
  constructor(params) {
    super();
    this.id = params.sessionId;
    this.name = params.savedName;
    this.shootDir = 0;
    this.attackCD = 1000;
    this.attackCDcurr = 0;
    this.hpRegenRate = 1;
    this.weapons = [
      new Bow(this),
      new Pistol(this),
      new Shotgun(this),
      new SubMachineGun(this)
    ];
    this.currentWeapon = 0;
    this.weapon = this.weapons[this.currentWeapon];
    this.controller = new Controller();
    this.skills = {
      skill1: new Dash(this)
    };
    this.speed = 5;
    this.x = W * Math.random();
    this.y = H * Math.random();
    this.size = 64;
    this.dmgText.offsetY = -40;
    this.dmgText.offsetW = -40;
    this.score = 0;

    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];

    this.switchWeapon = cdfunc(function(n) {
      this.currentWeapon += n;
      if (this.currentWeapon < 0) this.currentWeapon += this.weapons.length;
      this.currentWeapon = this.currentWeapon % this.weapons.length;
      this.weapon = this.weapons[this.currentWeapon];
    }, 500);
  }

  init(x, y) {
    this.x = x || W / 2;
    this.y = y || H / 2;
  }

  respawn() {
    this.toRemove = false;
    this.hp = this.hpMax;
  }

  tick(dt) {
    super.tick(dt);
    if (this.toRemove) {
      return;
    }

    var currentPos = V(this.x, this.y);
    for (var i in game.powerUps) {
      var point = V(game.powerUps[i].x, game.powerUps[i].y);
      if (point.distTo(currentPos) * 2 < game.powerUps[i].size + this.size) {
        game.powerUps[i].apply(this);
      }
    }
    /*
        Temporary border code
        */
    if (this.x - this.size / 2 < 0) {
      this.x = this.size / 2;
    }
    if (this.y - this.size / 2 < 0) {
      this.y = this.size / 2;
    }
    if (this.x + this.size / 2 > W) {
      this.x = W - this.size / 2;
    }
    if (this.y + this.size / 2 > H) {
      this.y = H - this.size / 2;
    }

    var magnitude = this.controller.getInput("stickMagnitude");
    var angle = this.controller.getInput("stickAngle");

    var effectiveSpeed = this.speed * this.weapon.speedPenalty;
    this.force(effectiveSpeed * magnitude, angle);
    if (magnitude > 0) {
      this.shootDir = this.dir; //Math.atan2(my - this.y, mx - this.x);
      this.lookDir = angle;
    }

    if (this.controller.getInput("lt")) {
      this.switchWeapon(-1);
    } else if (
      this.controller.getInput("rt") ||
      this.controller.getInput("btn4")
    ) {
      this.switchWeapon(1);
    } else {
      this.switchWeapon.lastTime = 0;
    }

    //shooting
    if (this.weapon.tick) this.weapon.tick(dt);

    if (this.controller.getInput("btn2")) {
      this.weapon.charge(dt);
    } else {
      this.weapon.release();
    }

    if (this.skills.skill1) {
      this.skills.skill1.tick(dt);
      if (this.controller.getInput("btn3")) {
        this.skills.skill1.channel(dt);
      } else {
        this.skills.skill1.cancelCast();
      }
    }

    if (this.skills.skill2) {
      this.skills.skill2.tick(dt);
      if (this.controller.getInput("btn6")) {
        this.skills.skill2.channel(dt);
      } else {
        this.skills.skill2.cancelCast();
      }
    }
  }

  render() {
    super.render();
    if (this.toRemove) {
      var fs = setFillStyle("grey");
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      setFillStyle(fs);
      return;
    }
    var fs = setFillStyle("white");

    ctx.font = "24px sans-serif";
    var textWidth = ctx.measureText(this.name).width;
    ctx.fillText(
      this.name,
      this.x - textWidth / 2,
      this.y - this.size / 2 - 10
    );

    setFillStyle(this.color);
    var ss = setStrokeStyle(this.color);
    var lw = setLineWidth(2);

    // outline
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();

    // fill
    ctx.beginPath();
    var degToPi = Math.PI / 180;
    var t = this.hp / this.hpMax; // Math.sin(Date.now()/1000)/2 + 0.5
    ctx.arc(
      this.x,
      this.y,
      this.size / 2,
      (90 - 180 * t) * degToPi,
      (90 + 180 * t) * degToPi
    );
    ctx.closePath();
    ctx.fill();

    // heading arrow
    var x1 = this.x + this.size * 1 * Math.cos(this.shootDir);
    var x2 = x1 - (this.size / 4) * Math.cos(this.shootDir - Math.PI / 4);
    var x3 = x1 - (this.size / 4) * Math.cos(this.shootDir + Math.PI / 4);

    var y1 = this.y + this.size * 1 * Math.sin(this.shootDir);
    var y2 = y1 - (this.size / 4) * Math.sin(this.shootDir - Math.PI / 4);
    var y3 = y1 - (this.size / 4) * Math.sin(this.shootDir + Math.PI / 4);

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.stroke();

    setFillStyle(fs);
    setStrokeStyle(ss);
    setLineWidth(lw);

    this.weapon.render(this);

    this.skills.skill1.render();
  }
}
