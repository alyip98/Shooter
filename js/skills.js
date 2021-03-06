class Skill {
  constructor(owner) {
    this.mpCost = 0;
    this.hpCost = 0;
    this.cd = 1000;
    this.cdTime = 1000;
    this.owner = owner;
    this.name = "base skill";
    this.castTime = 0; //0 for instant cast
    this.channeling = false;
  }

  channel(dt) {
    if (this.channeling) {
      this.channelDuration += dt;
    } else {
      console.log(this.owner.hp, this.hpCost, this.owner.mp, this.mpCost);
      if (
        this.owner.hp > this.hpCost &&
        this.owner.mp >= this.mpCost &&
        this.cdTime > this.cd
      ) {
        this.owner.hp -= this.hpCost;
        this.owner.hp -= this.mpCost;
        this.cdTime = 0;
        this.channelDuration = 0;
        this.channeling = true;
        this.channelBar = new ChannelBar(this);
        game.registerMisc(this.channelBar);
        console.log("Begin channeling " + this.name);
      }
    }
    if (this.castTime - this.channelDuration <= 0 && this.channeling) {
      console.log("Done channeling");
      this.channelBar.toRemove = true;
      // game.misc.splice(this.channelBar, 1);
      this.cast();
    }
  }

  channelEnd() {}

  cancelCast() {
    if (this.channeling) {
      this.reset();
    }
  }

  cast() {
    console.log("Casting " + this.name);
    this.reset();
  }

  reset() {
    this.channeling = false;
    this.channelDuration = 0;
    this.channelBar.toRemove = true;
  }

  tick(dt) {
    if (!this.channeling) {
      this.cdTime += dt;
    }
  }

  render() {}
}

class ChargedSkill extends Skill {
  // charges like shrapnel
}

class MagicMissile extends Skill {
  constructor(owner) {
    super(owner);
    this.name = "Magic Missile";
    this.castTime = 1000;
    this.projectiles = 5;
    this.firedProjectiles = 0;
  }

  channel(dt) {
    Skill.prototype.channel.call(this, dt);
    //0, 250, 500, 750, 1000
    if (
      Math.pow(this.channelDuration / this.castTime, 1) >
      (this.firedProjectiles + 1) / this.projectiles
    ) {
      this.firedProjectiles++;
      this.launchMissile();
    }
  }

  reset() {
    Skill.prototype.reset.call(this);
    this.firedProjectiles = 0;
  }

  launchMissile() {
    var proj = new MagicMissileProjectile(
      this.owner.x,
      this.owner.y,
      500,
      this.owner.shootDir + ((-0.5 + Math.random()) * Math.PI) / 100,
      1
    );
    game.projectiles.push(proj);
  }

  cast() {
    Skill.prototype.cast.call(this);
    this.launchMissile();
    this.reset();
    //var p = new MagicMissileProjectile();
  }
}

class MagicMissileProjectile extends Projectile {
  constructor(x, y, v, dir, owner) {
    super(x, y, v, dir, owner);
  }

  render() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

class Shockwave extends Skill {
  constructor(owner) {
    super(owner);
    this.name = "Showckwave";
    this.castTime = 500;
  }

  cast() {
    Skill.prototype.cast.call(this);
    var proj = new ShockwaveProjectile(
      this.owner.x,
      this.owner.y,
      100,
      this.owner.shootDir,
      1
    );
    game.projectiles.push(proj);
    this.reset();
  }
}

class ShockwaveProjectile extends Projectile {
  constructor(x, y, v, dir, owner) {
    super(x, y, v, dir, owner);
  }

  render() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

class Dash extends Skill {
  constructor(owner) {
    super(owner);
    this.name = "Dash";
    this.travelDistance = 100;
    this.cd = 3000;
    this.effectTime = 0;
    this.effectDuration = 200;
    this.force = 1000;
    this.dir = 0;
  }

  cast() {
    super.cast();

    this.effectTime = this.effectDuration;
    this.dir = this.owner.lookDir;
  }

  render() {
    var player = this.owner;
    if (this.cdTime >= this.cd) {
      var fs = setFillStyle("white");
      ctx.fillRect(player.x - 5, player.y + player.size / 2 + 5, 10, 10);
      setFillStyle(fs);
    }
  }

  tick(dt) {
    super.tick(dt);
    this.effectTime -= dt;

    if (this.effectTime > 0) {
      var effectiveForce =
        this.force * Math.pow(this.effectTime / this.effectDuration + 0.5, 5);
      this.owner.force((effectiveForce * dt) / 1000, this.dir);
    }
  }
}
