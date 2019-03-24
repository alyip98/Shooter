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
}

class Polygon {
    constructor(...args) {
        this.numVertices = args.length;
        this.vertices = [...args];
        this.sides = [];
        this.center = V(0, 0);
        for (var i = 0; i < this.numVertices; i++) {
            this.sides.push(new Line(this.vertices[i], this.vertices[(i + 1) % this.numVertices]));
        }
    }

    render() {
        for (var i = 0; i < this.sides.length; i++) {
            this.sides[i].render();
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
        for (var i in this.sides) {
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
        for (var i in this.sides) {
            var side = this.sides[i];
            ctx.beginPath()
            ctx.moveTo(side.start.x, side.start.y);
            ctx.lineTo(side.end.x, side.end.y);
            ctx.stroke();
            ctx.closePath();
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
        var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
            ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
        var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
            ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

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

    hitTestCircle(circle) {
        return distsqLineSegment(this.start, this.end, circle.center) <= circle.radius * circle.radius;
    }

    asVector() {
        return this.end.sub(this.start);
    }

    getAngle(line) {
        return this.asVector().getAngle(line.asVector())
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
        var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
            ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
        var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
            ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
        if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
            return 0;
        }

        return Math.sqrt(Math.min(distsqLineSegment(a, b, c),
            distsqLineSegment(a, b, d),
            distsqLineSegment(c, d, a),
            distsqLineSegment(c, d, b)
        ));
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
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2)
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
        return this.checkPathCollision(line)
    }

    hitTestPath(line) {
        var a = this.start;
        var b = this.end;
        var c = line.start;
        var d = line.end;
        var x1 = this.start.x;
        var x2 = this.end.x;
        var x3 = line.start.x;
        var x4 = line.end.x;
        var y1 = this.start.y;
        var y2 = this.end.y;
        var y3 = line.start.y;
        var y4 = line.end.y;
        var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
            ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
        var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
            ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
        if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
            var p1 = this.start.add(this.end.sub(this.start).mul(ua))
            var theta = p1.sub(a).getAngle(c.sub(p1));
            var l = this.size / Math.sin(theta)
            console.log("case 1")
            return {
                ua: ua,
                ub: ub,
                point1: p1,
                point2: p1.sub(this.end.sub(this.start).getUnitVector().mul(l))
            }
        }

        var p1, p2;
        var found = true;
        var r2 = this.size * this.size;
        var h;
        var aux = a;
        if ((h = distsqLineSegment(c, d, a)) <= r2) {
            p1 = a;
            var dist = Math.sqrt(h)
            console.log("case 5")
            return {
                ua: ua,
                ub: ub,
                point1: a.add(b.sub(a).getUnitVector().mul(dist)),
                point2: a.add(c.sub(d).getNormalVector().getUnitVector().mul(dist - this.size))
            }
        } else if ((h = distsqLineSegment(a, b, c)) <= r2) {
            p1 = d;
            console.log("case 2", a, b, c)
        } else if ((h = distsqLineSegment(a, b, d)) <= r2) {
            p1 = d;
            console.log("case 3", a, b, d)
        } else if ((h = distsqLineSegment(c, d, b)) <= r2) {
            
            console.log("case 4", c, d, b)
        } else {
            found = false;
        }
        if (!found) return false;

        var dist = p1.sub(aux).getLength();
        var l1 = Math.sqrt(dist * dist - h);
        var l2 = Math.sqrt(r2 - h);
        /*
        var theta = Math.cos(h/r);
        var beta = p.sub(a).getAngle(b.sub(a));
        var alpha = Math.PI/2 - theta - beta*/
        var p2 = a.add(b.sub(a).getUnitVector().mul(l1 - l2));
        console.log(dist, h, l1, l2, p2)
        // var f =
        return {
            ua: ua,
            ub: ub,
            point1: p1,
            point2: p2
        }

    }
}

function VP(len, ang) {
    return new Vector(Math.cos(ang) * len, Math.sin(ang) * len);
}

function V(x, y) {
    return new Vector(x, y)
}

function distsqTo(a, b) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
}

function distsqLineSegment(a, b, c) {
    var ab = b.sub(a)
    var ac = c.sub(a)
    var d = Math.max(0, Math.min(1, ac.dot(ab) / Math.pow(ab.len(), 2)))
    return distsqTo(a.add(ab.mul(d)), c)
}

function shortestDistPointOnLineSegment(a, b, c) {
    // line segment a, b and point c
    // find point d on ab such that dc is minimized
    var ab = b.sub(a)
    var ac = c.sub(a)
    var d = Math.max(0, Math.min(1, ac.dot(ab) / Math.pow(ab.len(), 2)))
    return a.add(ab.mul(d))
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
    var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
        ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
    var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
        ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
        return 0;
    }

    return Math.sqrt(Math.min(distsqLineSegment(a, b, c),
        distsqLineSegment(a, b, d),
        distsqLineSegment(c, d, a),
        distsqLineSegment(c, d, b)
    ));
}

function pointInRectangle(point, rect) {
    var AB = rect.vertices[1].sub(rect.vertices[0]);
    var AD = rect.vertices[3].sub(rect.vertices[0]);
    var AP = point.sub(rect.vertices[0]);
    var APxAB = AP.dot(AB);
    var APxAD = AP.dot(AD);
    return (0 <= APxAB && APxAB <= AB.dot(AB)) && (0 <= APxAD && APxAD <= AD.dot(AD))
}

function intersectCircle(circle, line) {
    return distsqLineSegment(line.start, line.end, circle.center) < circle.radius * circle.radius;
}
