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

function VP(len, ang){
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
    var ua = ((x4 - x3) * (y1 - y3) - (y4- y3) * (x1 - x3))/
        ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
    var ub = ((x2 - x1) * (y1 - y3) - (y2- y1) * (x1 - x3))/
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

class Polygon {
    constructor(...args) {
        this.numVertices = args.length;
        this.vertices = [...args];
        this.sides = [];
        this.center = V(0, 0);
        for (var i = 0; i < this.numVertices; i++) {
            this.sides.push(new Line(this.vertices[i], this.vertices[(i + 1)%this.numVertices]));
        }
    }

    render() {
        for (var i = 0; i < this.sides.length; i++) {
            this.sides[i].render();
        }
    }

    hitTestLine(line) {
        for(var i in this.sides) {
            if (this.sides[i].hitTestLine(line)) {
                return true;
            }
        }
        return false;
    }

    move(displacement) {
        this.center = this.center.add(displacement);
        for(var i in this.sides) {
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

    hitTestLine(line) {
        var x1 = this.start.x;
        var x2 = this.end.x;
        var x3 = line.start.x;
        var x4 = line.end.x;
        var y1 = this.start.y;
        var y2 = this.end.y;
        var y3 = line.start.y;
        var y4 = line.end.y;
        var ua = ((x4 - x3) * (y1 - y3) - (y4- y3) * (x1 - x3))/
            ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
        var ub = ((x2 - x1) * (y1 - y3) - (y2- y1) * (x1 - x3))/
            ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
        return (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1)
    }

    hitTestCircle(circle) {
        return distsqLineSegment(this.start, this.end, circle.center) <= circle.radius * circle.radius;
    }

    move(displacement) {
        this.start = this.start.add(displacement);
        this.end = this.end.add(displacement);
    }
}

class Circle {
    constructor (center, radius) {
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
