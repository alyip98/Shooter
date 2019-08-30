class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  distTo(v) {
    return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
  }

  add(v) {
    return V(this.x + v.x, this.y + v.y);
  }

  mul(s) {
    return V(this.x * s, this.y * s);
  }

  sub(v) {
    return V(this.x - v.x, this.y - v.y);
  }

  len() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  getLength() {
    return this.len();
  }

  getAngle(v) {
    return Math.acos(this.dot(v) / (this.len() * v.len()));
  }

  getUnitVector() {
    return this.mul(1 / this.getLength());
  }

  getNormalVector() {
    return new Vector(this.y * -1, this.x);
  }

  toPolar() {
    this.length = this.getLength();
    this.angle = Math.atan2(this.y, this.x);
    return this;
  }

  static random(x = 1, y = 1) {
    return new Vector(Math.random() * x, Math.random() * y);
  }

  render(size = 4) {
    ctx.fillRect(this.x - size / 2, this.y - size / 2, size, size);
  }
}

class Polygon {
  constructor(...args) {
    this.numVertices = args.length;
    this.vertices = [...args];
    this.sides = [];
    this.center = V(0, 0);
    this.renderMode = "stroke";
    for (var i = 0; i < this.numVertices; i++) {
      this.sides.push(
        new Line(this.vertices[i], this.vertices[(i + 1) % this.numVertices])
      );
    }
  }

  hitTestLine(line, obj = { hits: [] }) {
    var hitCount = 0;
    for (var i in this.sides) {
      var hitResult = this.sides[i].hitTestLine(line, obj);
      if (hitResult) {
        obj.hits.push(hitResult);
        hitCount++;
      }
    }
    return hitCount == 0 ? false : obj;
  }

  hitTestPath(path) {
    var hitCount = 0;
    var obj = {
      hits: []
    };
    var pathVector = path.asVector();
    for (var i in this.sides) {
      // back face culling
      var side = this.sides[i];
      var normal = side.asVector().getNormalVector();
      if (normal.dot(pathVector) > 0) {
        continue;
      }
      var hitResult = path.hitTestPath(this.sides[i]);
      if (hitResult) {
        obj.hits.push(hitResult);
        hitCount++;
      }
    }
    return hitCount > 0 ? obj : false;
  }

  hitTestCircle(circle, obj = {}) {
    for (var i in this.sides) {
      if (this.sides[i].hitTestCircle(circle)) {
        obj.side = this.sides[i];
        return true;
      }
    }
    return false;
  }

  render() {
    if (this.renderMode == "fill") {
      ctx.beginPath();
      ctx.moveTo(this.sides[0].start.x, this.sides[0].start.y);
    }
    for (var i in this.sides) {
      var side = this.sides[i];
      if (this.renderMode == "stroke") {
        ctx.beginPath();
        ctx.moveTo(side.start.x, side.start.y);
        ctx.lineTo(side.end.x, side.end.y);
        ctx.stroke();
        ctx.closePath();
      } else {
        ctx.lineTo(side.end.x, side.end.y);
      }

      if (Settings.debug) {
        var mid = side.start.add(side.end).mul(0.5);
        var normal = mid.add(
          side.end
            .sub(side.start)
            .getNormalVector()
            .getUnitVector()
            .mul(50)
        );
        ctx.beginPath();
        ctx.moveTo(mid.x, mid.y);
        ctx.lineTo(normal.x, normal.y);
        ctx.stroke();
        ctx.closePath();
      }
    }

    if (this.renderMode == "fill") {
      ctx.closePath();
      ctx.fill();
    }
  }

  move(displacement) {
    this.center = this.center.add(displacement);
    for (var i in this.sides) {
      this.sides[i].move(displacement);
    }
  }
}

class Line {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  render() {
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.stroke();
    ctx.closePath();
  }

  findIntersect(line) {
    var x1 = this.start.x;
    var x2 = this.end.x;
    var x3 = line.start.x;
    var x4 = line.end.x;
    var y1 = this.start.y;
    var y2 = this.end.y;
    var y3 = line.start.y;
    var y4 = line.end.y;
    var ua =
      ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
      ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    var ub =
      ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
      ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    return [ua, ub, this.start.add(this.end.sub(this.start).mul(ua))];
  }

  hitTestLine(line) {
    var t = this.findIntersect(line);
    if (!t) return false;
    var ua = t[0];
    var ub = t[1];
    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
      var obj = {};
      obj.ua = ua;
      obj.ub = ub;
      obj.point = t[2];
      obj.obj1 = this;
      obj.obj2 = line;
      return obj;
    }
    return false;
  }

  getNormalVector() {
    return this.end.sub(this.start).getNormalVector();
  }

  hitTestCircle(circle) {
    return (
      distsqLineSegment(this.start, this.end, circle.center) <=
      circle.radius * circle.radius
    );
  }

  asVector() {
    return this.end.sub(this.start);
  }

  getAngle(line) {
    return this.asVector().getAngle(line.asVector());
  }

  distLineSegments(line) {
    var x1 = this.start.x;
    var x2 = this.end.x;
    var x3 = line.start.x;
    var x4 = line.end.x;
    var y1 = this.start.y;
    var y2 = this.end.y;
    var y3 = line.start.y;
    var y4 = line.end.y;
    var ua =
      ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
      ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    var ub =
      ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
      ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
      return 0;
    }

    return Math.sqrt(
      Math.min(
        distsqLineSegment(a, b, c),
        distsqLineSegment(a, b, d),
        distsqLineSegment(c, d, a),
        distsqLineSegment(c, d, b)
      )
    );
  }

  move(displacement) {
    this.start = this.start.add(displacement);
    this.end = this.end.add(displacement);
  }
}

class Circle {
  constructor(center, radius) {
    this.center = center;
    this.radius = radius;
  }

  hitTestLine(line) {
    return line.hitTestCircle(this);
  }

  render() {
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  }

  move(displacement) {
    this.center = this.center.add(displacement);
  }
}

class Path extends Line {
  constructor(p1, p2, size = 16) {
    super(p1, p2);
    this.size = size;
  }

  render() {
    super.render();
    setStrokeStyle("white");
    var normal = this.asVector()
      .getNormalVector()
      .getUnitVector()
      .mul(this.size);
    ctx.beginPath();
    ctx.moveTo(
      this.start.add(normal).x,
      this.start.add(normal).y,
      this.size,
      0,
      Math.PI * 2
    );
    ctx.lineTo(
      this.end.add(normal).x,
      this.end.add(normal).y,
      this.size,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(
      this.start.sub(normal).x,
      this.start.sub(normal).y,
      this.size,
      0,
      Math.PI * 2
    );
    ctx.lineTo(
      this.end.sub(normal).x,
      this.end.sub(normal).y,
      this.size,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.start.x, this.start.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.start.x, this.start.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.end.x, this.end.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
  }

  hitTestLine(line) {
    return this.checkPathCollision(line);
  }

  hitTestCircle(circle) {
    var rr = (this.size + circle.radius) / 2;
    var dist = distsqLineSegment(this.start, this.end, circle.center);
    return dist < rr * rr;
  }

  hitTestPath(line) {
    var a = this.start;
    var b = this.end;
    var c = line.start;
    var d = line.end;
    var r2 = this.size * this.size;
    var relaxedr2 = r2 * 0.9;
    // check end position
    var perpB = perp(c, d, b);
    var hitEnd = false;
    var normal = d
      .sub(c)
      .getNormalVector()
      .getUnitVector();
    var normalOverlapDist = Math.sqrt(perpB.distsq);
    var infront = b.sub(c).dot(normal) > 0;
    if (infront) {
      normalOverlapDist = this.size - normalOverlapDist;
    } else {
      normalOverlapDist += this.size;
    }
    var bprime = b.add(normal.mul(normalOverlapDist));
    if (perpB.distsqClamped <= r2 && 0 <= perpB.d && perpB.d <= 1) {
      hitEnd = true;

      return {
        case: 4,
        message: infront,
        point1: b,
        point2: bprime
      };
    }

    // case 5: initial colliding
    var perpA = perp(c, d, a);
    if (perpA.distsq <= r2 && 0 <= perpA.d && perpA.d <= 1) {
      var dist = Math.sqrt(perpA.distsq);
      if (infront) {
        normalOverlapDist = this.size - normalOverlapDist;
      } else {
        normalOverlapDist += this.size;
      }
      return {
        case: 5,
        message: infront,
        point1: a.add(normal.mul(-dist)),
        point2: bprime
      };
    }

    // case 1: intersect middle
    var hc = distsqLineSegment(a, b, c);
    var hd = distsqLineSegment(a, b, d);
    var x1 = this.start.x;
    var x2 = this.end.x;
    var x3 = line.start.x;
    var x4 = line.end.x;
    var y1 = this.start.y;
    var y2 = this.end.y;
    var y3 = line.start.y;
    var y4 = line.end.y;
    var ua =
      ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
      ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    var ub =
      ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
      ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    if ((hc > r2 || hd > r2) && 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
      var p1 = this.start.add(this.end.sub(this.start).mul(ua));
      var theta = p1.sub(a).getAngle(c.sub(p1));
      var l = this.size / Math.sin(theta);
      if (a.sub(b).dot(c.sub(d).getNormalVector()) >= 0) {
        l *= -1;
      }
      // var p2 = p1.sub(this.end.sub(this.start).getUnitVector().mul(l))
      if (infront) {
        normalOverlapDist = this.size - normalOverlapDist;
      } else {
        normalOverlapDist += this.size;
      }
      var p2 = b.add(normal.mul(normalOverlapDist));
      var perp1 = perp(c, d, p2);
      perp1.point.render();
      if (0 <= perp1.d && perp1.d <= 1)
        return {
          case: 1,
          message: ua.toFixed(2) + " - " + ub.toFixed(2),
          point1: p1,
          point2: bprime
        };
    }

    // check if it clips the sides
    var p1, p2;
    var h;
    var aux = a;
    var caseNum = 0;
    var perpHeight = -1;
    var ab = b.sub(a);
    var cd = d.sub(c);
    var perp2;

    if (hc <= relaxedr2 && hd <= relaxedr2) {
      if (ab.dot(cd) >= 0) {
        p1 = c;
        perp2 = perp(a, b, c);
        perpHeight = perp2.distsq;
        caseNum = 2;
      } else {
        p1 = d;
        perp2 = perp(a, b, d);
        perpHeight = perp2.distsq;
        caseNum = 3;
      }
    } else if (hc <= relaxedr2) {
      p1 = c;
      perp2 = perp(a, b, c);
      perpHeight = perp2.distsq;
      caseNum = 2;
    } else if (hd <= relaxedr2) {
      p1 = d;
      perp2 = perp(a, b, d);
      perpHeight = perp2.distsq;
      caseNum = 3;
    }

    if (perpHeight >= 0) {
      var msg = Math.sqrt(perpHeight).toFixed(2);
      var hypotenuse = p1.sub(a).getLength();
      var perpP1 = perp(a, b, p1);
      setFillStyle("magenta");
      perp2.point.render(8);
      // var perpP2 = perp(c, d, )
      var f = perpP1.point;
      setFillStyle("orange");
      f.render();
      var l2 = Math.sqrt(r2 - perpHeight);
      var aprime = f.sub(
        f
          .sub(a)
          .getUnitVector()
          .mul(l2)
      );
      var aprimeFoot = perp(c, d, aprime);
      if (0 <= aprimeFoot.d && aprimeFoot.d <= 1) {
        msg += " apf";
        var p2 = new Line(a, b).findIntersect(new Line(c, d))[2];
        var theta = ab.getAngle(cd);
        var l3 = this.size / Math.sin(theta);
        var p3 = p2.add(
          a
            .sub(p2)
            .getUnitVector()
            .mul(l3)
        );
        aprime = p3;
      }
      return {
        case: caseNum,
        message: msg,
        point1: p1,
        point2: bprime
      };
    }
  }
}

function VP(len, ang) {
  return new Vector(Math.cos(ang) * len, Math.sin(ang) * len);
}

function V(x, y) {
  return new Vector(x, y);
}

function distsqTo(a, b) {
  return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
}

function distsqLineSegment(a, b, c) {
  var ab = b.sub(a);
  var ac = c.sub(a);
  var d = Math.max(0, Math.min(1, ac.dot(ab) / Math.pow(ab.len(), 2)));
  return distsqTo(a.add(ab.mul(d)), c);
}

function perpFoot(a, b, c) {
  var ab = b.sub(a);
  var ac = c.sub(a);
  var d = ac.dot(ab) / Math.pow(ab.len(), 2);
  return a.add(ab.mul(d));
}

function perp(a, b, c) {
  var ab = b.sub(a);
  var ac = c.sub(a);
  var d = ac.dot(ab) / Math.pow(ab.len(), 2);
  var clamped = Math.max(0, Math.min(1, d));
  var pt = a.add(ab.mul(d));
  var ptClamped = a.add(ab.mul(clamped));
  return {
    distsq: distsqTo(pt, c),
    distsqClamped: distsqTo(ptClamped, c),
    d: d,
    point: pt,
    pointClamped: ptClamped
  };
}

function shortestDistPointOnLineSegment(a, b, c) {
  // line segment a, b and point c
  // find point d on ab such that dc is minimized
  var ab = b.sub(a);
  var ac = c.sub(a);
  var d = Math.max(0, Math.min(1, ac.dot(ab) / Math.pow(ab.len(), 2)));
  return a.add(ab.mul(d));
}

function distLineSegments(a, b, c, d) {
  var x1 = a.x;
  var x2 = b.x;
  var x3 = c.x;
  var x4 = d.x;
  var y1 = a.y;
  var y2 = b.y;
  var y3 = c.y;
  var y4 = d.y;
  var ua =
    ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  var ub =
    ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
    return 0;
  }

  return Math.sqrt(
    Math.min(
      distsqLineSegment(a, b, c),
      distsqLineSegment(a, b, d),
      distsqLineSegment(c, d, a),
      distsqLineSegment(c, d, b)
    )
  );
}

function pointInRectangle(point, rect) {
  var AB = rect.vertices[1].sub(rect.vertices[0]);
  var AD = rect.vertices[3].sub(rect.vertices[0]);
  var AP = point.sub(rect.vertices[0]);
  var APxAB = AP.dot(AB);
  var APxAD = AP.dot(AD);
  return (
    0 <= APxAB && APxAB <= AB.dot(AB) && (0 <= APxAD && APxAD <= AD.dot(AD))
  );
}

function intersectCircle(circle, line) {
  return (
    distsqLineSegment(line.start, line.end, circle.center) <
    circle.radius * circle.radius
  );
}
