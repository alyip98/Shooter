class GUI {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 10;
    this.height = 10;
    this.offsetX = 0;
    this.offsetY = 0;
    this.colour = "white";
    this.hidden = false;
  }

  tick() {}

  destroy() {}
}

class Bar extends GUI {
  constructor(obj) {
    super();
    this.boundObject = obj;
    this.position = "fixed";
  }

  tick() {}

  render() {
    if (this.position === "follow") {
      this.x = obj.x;
      this.y = obj.y;
    }
    var x1 = this.x - this.width / 2 + this.offsetX;
    var x2 = x1 + this.width;
    var y1 = this.y - this.height / 2 + this.offsetY;
    var y2 = y1 + this.height;
    ctx.fillStyle = this.colour;
    ctx.strokeStyle = this.colour;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x1, y2);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    ctx.stroke();
    ctx.fillRect(x1, y1, this.width * this.getPercentage(), this.height);
  }
}

function PPT(x, y, text) {
  game.registerMisc(new PopupText(x, y, text));
}

class PopupText {
  constructor(x, y, text) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.lifetime = 0;
    this.decayTime = 3000;
    this.fillStyle = "white";
  }

  tick(dt) {
    this.y -= (50 * dt) / this.decayTime;
    this.lifetime += dt;
    if (this.lifetime > this.decayTime) this.toRemove = true;
  }

  render() {
    tmp = ctx.fillStyle;
    ctx.fillStyle = this.fillStyle;
    ctx.globalAlpha = 1 - this.lifetime / this.decayTime;
    ctx.fillText(this.text, this.x, this.y);
    ctx.fillStyle = tmp;
    ctx.globalAlpha = 1;
  }
}

class Text extends GUI {
  constructor() {
    super();
    this.text = "";
  }

  render() {
    setFillStyle(this.colour);
    ctx.fillText(this.text, this.x, this.y);
  }
}

class DamageText extends Text {
  constructor(obj) {
    super();
    this.boundObject = obj;
    this.position = "follow";
    this.timeout = 1000;
    this.prevHP = -1;
    this.startHP = 0;
    this.hitHP = 0;
    this.size = 0;
    this.baseSize = 24;
  }

  tick(dt) {
    var dhp = this.boundObject.getHealth() - this.prevHP;
    //console.log(dhp);
    if (dhp < 0) {
      this.hidden = false;
      if (this.timeout < 0) {
        this.hitHP = dhp;
      } else {
        this.hitHP += dhp;
      }
      this.timeout = 1500;
      this.size =
        this.baseSize * (1 - this.hitHP / this.boundObject.getMaxHealth());
    } else {
      this.timeout -= dt;
      if (this.timeout <= 0) {
        this.hidden = true;
      }
    }
    this.offsetY = (this.timeout / 1500) * 50 - this.boundObject.size;
    this.prevHP = this.boundObject.getHealth();
  }

  render() {
    //console.log(this);
    if (!this.hidden) {
      ctx.fillStyle = "white";
      //console.log(this);
      var tmp = ctx.font;
      ctx.font = this.size.toFixed() + "px sans-serif";
      // console.log(ctx.font)
      var offX = ctx.measureText(this.getText()).width;
      ctx.fillText(
        this.getText(),
        this.boundObject.x + this.offsetX - offX / 2,
        this.boundObject.y + this.offsetY
      );
      ctx.font = tmp;
    }
  }

  getText() {
    return (-this.hitHP).toFixed(2);
  }
}

class HealthBar extends Bar {
  constructor(obj) {
    super(obj);
    this.position = "follow";
    this.getPercentage = function() {
      return obj.getHealth() / obj.getMaxHealth();
    };
  }
}

class ChannelBar extends Bar {
  constructor(obj) {
    super(obj);
    this.position = "absolute";
    this.width = 200;
    this.height = 20;
    this.x = W / 2;
    this.y = H - H / 6;
  }

  getPercentage() {
    return this.boundObject.channelDuration / this.boundObject.castTime;
  }
}

class FPSTracker extends Text {
  constructor() {
    super();
    this.x = 20;
    this.y = 20;
    this.pastFrameTimes = [];
    this.sumFrameTime = 0;
    this.lastTime = Date.now();
    this.maxFrameHistory = 60;
  }

  render() {
    var dt = Date.now() - this.lastTime;
    this.pastFrameTimes.push(dt);
    this.sumFrameTime += dt;
    if (this.pastFrameTimes.length > this.maxFrameHistory) {
      this.sumFrameTime -= this.pastFrameTimes.shift();
    }
    this.lastTime += dt;
    this.text = (
      1000 /
      (this.sumFrameTime / this.pastFrameTimes.length)
    ).toFixed(1);
    super.render();
  }
}
