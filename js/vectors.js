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
	ab = b.sub(a)
	ac = c.sub(a)
	d = Math.max(0, Math.min(1, ac.dot(ab) / Math.pow(ab.len(), 2)))
	return distsqTo(a.add(ab.mul(d)), c)
}

class Polygon {
    constructor(...args) {
        this.numSides = args.length;
        this.vertices = [...args];
    }
}

class Line {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

function pointInRectangle(point, rect) {
    var AB = rect.vertices[1].sub(rect.vertices[0]);
    var AD = rect.vertices[3].sub(rect.vertices[0]);
    var AP = point.sub(rect.vertices[0]);
    var APxAB = AP.dot(AB);
    var APxAB = AP.dot(AD);
    return (0 <= APxAB && APxAB <= AB.dot(AB)) && (0 <= APxAD && APxAD <= AD.dot(AD))
}

function intersectCircle(circle, line) {
    return distsqLineSegment
}
