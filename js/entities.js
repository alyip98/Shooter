
class Entity {
	constructor() {
		this.buffs = [];
		this.speed = 5;
		this.size = 32
		this.v = 0
		this.dir = 0
		this.shootDir = 0
		this.hp = 100;
		this.mp = 0;
		this.hpMax = 100;
		this.hpRegenRate = 0.1;
	    /*this.HPBar = new HealthBar(this);
	    this.HPBar.width = this.size;
	    this.HPBar.height = this.size/16;
	    this.HPBar.offsetY = this.size * -0.7;*/
		this.path = new Path(V(0, 0), V(0, 0), this.size);
		this.dmgText = new DamageText(this);
		this.lastX = 0
		this.lastY = 0
	}

	addBuff(buff) {
		this.buffs.push(buff);
		buff.owner = this;
		//buff.applyEffects(this);
	}

	removeBuff(buff) {
		for (var i = 0; i < this.buffs.length; i++) {
			if (this.buffs[i] === buff) {
				buff.removeEffects(this);
				this.buffs.splice(i, 1);
			}
		}
	}

	tick(dt) {
		var dts = dt / 1000 * 16
		this.lastX = this.x
		this.lastY = this.y

		this.hp = Math.min(this.hpMax, this.hp + this.hpRegenRate * dt / 1000);

		for (var i = 0; i < this.buffs.length; i++) {
			this.buffs[i].tick(dt);
		}

		this.v *= Math.pow(0.9, 1 + dts)
		if (Math.abs(this.v) < 0.1)
			this.v = 0

		//movement physics
		var vx = this.v * Math.cos(this.dir)
		var vy = this.v * Math.sin(this.dir)

		this.path.start = V(this.x, this.y);
		this.path.end = V(this.x + vx * dts, this.y + vy * dts);

		var pathLength = this.path.asVector().getLength();
		// console.log(pathLength)
		var chg
		if ((chg = this.checkWallCollisions())) {
			var dv = chg.getLength()
			var a = Math.atan2(chg.y, chg.x)
			this.force(dv * -0.3, a)
		} else {
			this.x += vx * dts
			this.y += vy * dts
		}

		this.dmgText.tick(dt);
	}

	render() {
		// this.HPBar.render();
		this.dmgText.render();
	}

	physicsCollision(other) {
		var v1 = this.v;
		var v2 = other.v;
		var m1 = this.size;
		var m2 = other.size;
		var theta1 = this.dir;
		var theta2 = other.dir;
		var phi = Math.atan2(other.y - this.y, other.x - this.x);
		var cr = -(this.getCoords().distTo(other.getCoords()) - this.size - other.size);
		var temp1 = (v1 * Math.cos(theta1 - phi) * (m1 - m2) + 2 * m2 * v2 * Math.cos(theta2 - phi)) / (m1 + m2);
		var temp2 = (v2 * Math.cos(theta2 - phi) * (m2 - m1) + 2 * m1 * v1 * Math.cos(theta1 - phi)) / (m1 + m2);
		var vx1 = temp1 * Math.cos(phi) + v1 * Math.sin(theta1 - phi) * Math.sin(phi);
		var vy1 = temp1 * Math.sin(phi) + v1 * Math.sin(theta1 - phi) * Math.cos(phi);

		var vx2 = temp2 * Math.cos(phi) + v2 * Math.sin(theta2 - phi) * Math.sin(phi);
		var vy2 = temp2 * Math.sin(phi) + v2 * Math.sin(theta2 - phi) * Math.cos(phi);
		this.setSpeed(vx1, vy1);
		other.setSpeed(vx2, vy2);

		this.x -= cr * Math.cos(phi);
		this.y -= cr * Math.sin(phi);

		other.x += cr * Math.cos(phi);
		other.y += cr * Math.sin(phi);
	}

	checkWallCollisions() {
		var hits = [];
		for (var i = 0; i < game.walls.length; i++) {
			var wall = game.walls[i];
			var hitData;
			if ((hitData = wall.hitTestPath(this.path))) {
				hits = hits.concat(hitData.hits)
			}
		}


		var sortedHits = hits.map(hit => [hit.point2, hit.point2.distTo(this.path.start)]).sort((a, b) => a[1] - b[1])
		if (sortedHits.length > 0) {
			if (Settings.debug) console.log(sortedHits);
			var change = V(this.x, this.y).sub(sortedHits[0][0])
			this.x = sortedHits[0][0].x;
			this.y = sortedHits[0][0].y;
			return change;
		}
		// sort by distance?
		// hits.sort();
		return false;
	}

	hitTestPath(line, nextPos) {
		/*var d = this.currentPos;
		var c = nextPos;
		var a = line.start;
		var b = line.end;
		var cd = d.sub(c);
		var ab = b.sub(a);

		var theta = cd.angle(ab);
		if (theta == 0) return false;
		var intersect = ab.findIntersect(cd);
		if (!intersect) return false;
		var e = intersect[2];
		var h = this.size / Math.sin(theta); // hypotenuse
		var p = e.add(cd.getUnitVector().mul(h));
		return p;*/
	}

	setSpeed(vx, vy) {
		this.dir = Math.atan2(vy, vx);
		this.v = Math.sqrt(vx * vx + vy * vy);
	}

	damage(damage) {
		this.hp -= damage
		//game.misc.push(new PopupText(this.x, this.y, damage.toFixed(2)))
		if (this.hp <= 0) {
			this.hp = 0;
			this.kill();
		}
	}

	kill() {
		this.toRemove = true;
	}

	knockback(force, direction) {
		var vx = this.v * Math.cos(this.dir);
		var vy = this.v * Math.sin(this.dir);

		var ax = force * Math.cos(direction);
		var ay = force * Math.sin(direction);
		vx += ax;
		vy += ay;

		this.dir = Math.atan2(vy, vx);
		this.v = Math.sqrt(vx * vx + vy * vy);
	}

	force(force, direction) {
		var vx = this.v * Math.cos(this.dir)
		var vy = this.v * Math.sin(this.dir)

		var ax = force * Math.cos(direction)
		var ay = force * Math.sin(direction)
		vx += ax
		vy += ay

		this.dir = Math.atan2(vy, vx)
		this.v = Math.sqrt(vx * vx + vy * vy)
	}

	getSpeedAfterEffects() {
		var flatBonuses = [];
		var multBonuses = [];

		for (var i = 0; i < this.buffs.length; i++) {
			if (this.buffs[i].getTag("speed")) {
				if (this.buffs[i]) {

				}
			}
		}
	}

	getHealth() {
		return this.hp;
	}

	getMaxHealth() {
		return this.hpMax;
	}

	getCoords() {
		return V(this.x, this.y);
	}
}
