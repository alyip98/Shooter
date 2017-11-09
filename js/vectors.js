function Vector(x, y) {
	this.x = x
	this.y = y
	this.dot = function(v) {
		return this.x * v.x + this.y * v.y
	}

	this.distTo = function(v) {
		return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2))
	}

	this.add = function(v) {
		return V(this.x + v.x, this.y + v.y)
	}

	this.mul = function(s) {
		return V(this.x * s, this.y * s)
	}

	this.sub = function(v) {
		return V(this.x - v.x, this.y - v.y)
	}

	this.len = function() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
	}
}

function V(x, y) {
	return new Vector(x, y)
}

function distsqTo(a, b) {
	return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
}

function distsqLineSegment(a, b, c) {
	//line:r=a+(b-a)d
	//ab dot ac^ = (b-a).(c-a)/len(ac)
	ab = b.sub(a)
	ac = c.sub(a)
	d = Math.max(0, Math.min(1, ac.dot(ab) / Math.pow(ab.len(), 2)))
	dd = distsqTo(a.add(ab.mul(d)), c)
		//console.log("!",a,b,c,ab.mul(d),a.add(ab.mul(d)),dd)
		//console.log("!!",ac,ab,ac.dot(ab)/ab.len())
	return dd
}
