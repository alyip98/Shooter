/*
util.js - utility functions
*/

function rand(a, b) {
  if (!b) {
    b = a;
    a = 0;
  }
  return a + Math.random() * (b - a);
}

function cdfunc(func, cd) {
  var f = function(...args) {
    now = Date.now();
    if (now > f.lastTime + cd) {
      f.lastTime = now;
      return func.call(this, ...args);
    }
  };
  f.id = Math.floor(Math.random() * 1000);
  f.lastTime = 0;
  return f;
}

function stroke(style) {
  var tmp = ctx.strokeStyle;
  ctx.strokeStyle = style;
  return function() {
    stroke(tmp);
  };
}

function setStrokeStyle(style) {
  var tmp = ctx.strokeStyle;
  ctx.strokeStyle = style;
  return tmp;
}

function fill(style) {
  var tmp = ctx.fillStyle;
  ctx.fillStyle = style;
  return function() {
    fill(tmp);
  };
}

function setFillStyle(style) {
  var tmp = ctx.fillStyle;
  ctx.fillStyle = style;
  return tmp;
}

function lineWidth(width) {
  var tmp = ctx.lineWidth;
  ctx.lineWidth = width;
  return function() {
    lineWidth(tmp);
  };
}

function setLineWidth(width) {
  var tmp = ctx.lineWidth;
  ctx.lineWidth = width;
  return tmp;
}

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.stroke();
}

function dot(x, y, size = 4) {
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
}

function centeredText(text, x, y) {
  var width = ctx.measureText(text).width;
  ctx.fillText(text, x - width / 2, y);
}

class Timer {
  constructor(duration) {
    this.initialDuration = duration;
    this.startTime = Date.now();
    this.duration = duration;
    return this;
  }

  isReady() {
    return Date.now() - this.startTime > this.initialDuration;
  }

  ifReady(callback) {
    if (this.isReady()) {
      return callback();
    }
  }

  reset(duration) {
    if (duration) {
      this.initialDuration = duration;
    }
    this.duration = this.initialDuration;
    this.startTime = Date.now();
  }

  getRemainingTime() {
    return Math.max(0, this.initialDuration - Date.now() + this.startTime);
  }
}
