var CollisionLayer = {
	Player: 1,
	Enemies: 2,
	Projectiles: 4
}

class Projectile {
	constructor(x, y, v, dir, owner) {
		//console.log(x,y,v,dir,owner)
		this.lifetime = 0;
		this.size = 4;
		this.x = x || W / 2;
		this.y = y || H / 2;
		this.v = v || 40;
		this.dir = dir;
		this.penetrate = false;
		this.hp = 1;
		this.owner = owner;
		this.damage = 1;
		this.fxn = 0.95;
		this.decayTime = 3000;
		this.knockbackCoeff = 1;
		this.hitList = [];
		this.lastX = x
		this.lastY = y
	}
	tick(dt) {
		if ((this.x < 0 || this.x > W || this.y < 0 || this.y > H) && this.lifetime > 500) {
			this.toRemove = true;
			return;
		}

		this.lifetime += dt;
		if (this.lifetime > this.decayTime) {
			this.toRemove = true;
			return;
		}

		this.lastX = this.x
		this.lastY = this.y

		var collisions = this.checkCollisions(dt);
		collisions.sort((a, b) => a[1] - b[1]);
		// console.log("sorted collisions", collisions)
		for (var i = 0; i < collisions.length; i++) {
			if (this.hitList.indexOf(collisions[i][0]) == -1)
				this.collide(collisions[i][0]);
		}
		this.updatePosition(dt);
	}
	collide(obj) {
		this.hitList.push(obj);
		if (this.hp <= 0) {
			this.toRemove = true;
		}
		if (!this.toRemove) {
			this.impact(obj);
		}
	}
	updatePosition(dt) {
		var dts = dt / 1000;
		this.v *= this.fxn;
		if (Math.abs(this.v) < 4) {
			this.v = 0;
			this.toRemove = true;
		}
		//movement physics
		var vx = this.v * Math.cos(this.dir);
		var vy = this.v * Math.sin(this.dir);
		this.x += vx * dts;
		this.y += vy * dts;
	}
	getNewPosition(dt) {
		var vx = this.v * Math.cos(this.dir);
		var vy = this.v * Math.sin(this.dir);
		var dts = dt / 1000;
		var bx = this.x + vx * dts;
		var by = this.y + vy * dts;
		var distFrame = this.v * dts;
		return [bx, by, distFrame];
	}
	checkCollisions(dt) {
		var out = [];
		var targets = [];
		if (this.owner) {
			if (this.owner.constructor.name == "Player") {
				if (game.mode == Mode.PVP) {
					targets = Array.from(game.players);
					targets.splice(targets.indexOf(this.owner), 1);
				}
				else {
					targets = game.enemies;
				}
			}
			else {
				targets = game.players;
			}
		}
		// if (this.owner == 1) targets = game.enemies;
		// if (this.owner == 2 || game.mode == Mode.PVP) targets = game.players;
		//collision test
		var dts = dt / 1000;
		var currentPos = V(this.x, this.y);
		var nextPos = V(this.x + this.v * Math.cos(this.dir) * dts, this.y + this.v * Math.sin(this.dir) * dts)
		for (var i = 0; i < targets.length; i++) {
			if (targets[i].toRemove) {
				continue;
			}
			var rr = this.size / 2 + targets[i].size / 2;
			var targetPos = V(targets[i].x, targets[i].y)
			var dd = distsqLineSegment(currentPos, nextPos, targetPos);
			if (dd < rr * rr) //dist is less than sum of radii
				out.push([targets[i], Math.sqrt(dd)]);
		}

		var linearPath = new Line(currentPos, nextPos)
		for (var i = 0; i < game.walls.length; i++) {
			var sides = game.walls[i].sides;
			for (var j = 0; j < sides.length; j++) {
				var sideLine = new Line(sides[j].start, sides[j].end)
				var intersect = linearPath.findIntersect(sideLine)
				var ua = intersect[0]
				var ub = intersect[1]
				var d = currentPos.distTo(intersect[2])// distLineSegments(currentPos, nextPos, sides[j].start, sides[j].end);
				// console.log(currentPos, nextPos, sides[j][0], sides[j][1], d)
				if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
					out.push([game.walls[i], d]);
				}
			}
		}

		return out;
	}

	impact(thing) {
		this.hp -= 1;
		if (this.hp <= 0) {
			this.toRemove = true;
			this.penetrate = false;
		}
		this.knockback = Math.sqrt(this.v) * this.knockbackCoeff;
		thing.knockback(this.knockback, this.dir);
		thing.damage(this.damage);
	}
	render() {
		var fs = setFillStyle("yellow");
		ctx.fillRect(this.x, this.y, this.size, this.size);
		ctx.fillStyle = fs;
	}

	destroy() {

	}
}

class Arrow extends Projectile {
	constructor(x, y, v, dir, owner) {
		super(x, y, v, dir, owner);
	}
	render() {
		setLineWidth(2)
		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		var projlength = Math.min(this.v, 20);
		var nx, ny;
		if (this.v > 0) {
			nx = this.x + projlength * Math.cos(this.dir);
			ny = this.y + projlength * Math.sin(this.dir);
		}
		else {
			nx = this.x;
			ny = this.y;
		}
		ctx.lineTo(nx, ny);
		//ctx.arc(this.x,this.y,this.size/2,0,Math.PI*2)
		ctx.closePath();
		ctx.stroke();
		var x1 = this.x + this.size * Math.cos(this.dir);
		var x2 = -this.size * Math.cos(this.dir - Math.PI / 4);
		var x3 = -this.size * Math.cos(this.dir + Math.PI / 4);
		var y1 = this.y + this.size * Math.sin(this.dir);
		var y2 = -this.size * Math.sin(this.dir - Math.PI / 4);
		var y3 = -this.size * Math.sin(this.dir + Math.PI / 4);
		ctx.beginPath();
		ctx.moveTo(x1 + x2, y1 + y2);
		ctx.lineTo(x1, y1);
		ctx.lineTo(x1 + x3, y1 + y3);
		ctx.closePath();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(nx + x2 / 2, ny + y2 / 2);
		ctx.lineTo(nx, ny);
		ctx.lineTo(nx + x3 / 2, ny + y3 / 2);
		ctx.closePath();
		ctx.stroke();
	}
	impact(thing) {
		super.impact(thing);
		this.v *= 0.5;
	}
}

class PistolProjectile extends Projectile {
	constructor(x, y, v, dir, owner) {
		super(x, y, v, dir, owner);
		this.lineWidth = 2;
		this.trailLength = 0.3;
	}

	render() {
		setStrokeStyle("yellow")
		setLineWidth(this.lineWidth)
		ctx.beginPath()
		var last = V(this.lastX, this.lastY)
		last = last.mul(this.trailLength).add(V(this.x, this.y).mul(1 - this.trailLength))
		ctx.moveTo(last.x, last.y)
		ctx.lineTo(this.x, this.y)
		ctx.stroke()
		ctx.closePath()
	}
}
