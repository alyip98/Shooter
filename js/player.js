
function Player() {
	Entity.call(this);
	this.shootDir = 0
	this.attackCD = 1000
	this.attackCDcurr = 0
	this.weapon = Weapons.Bow
	this.speed = 5;

	this.init = function(x, y) {
		this.x = x || W / 2
		this.y = y || H / 2
	}

    this.etick = this.tick;
	this.tick = function(dt) {
		//Entity.tick.call(this, dt);
        this.etick(dt);
		dts = dt / 1000 * 16

		this.shootDir = Math.atan2(my - this.y, mx - this.x);

        //moving
		dvx = 0;
		dvy = 0;
		if (keys["up"])       dvy -= 1;
		if (keys["down"])     dvy += 1;
		if (keys["left"])     dvx -= 1;
		if (keys["right"])    dvx += 1;

		//normalize dvx/y
		if (dvx != 0 || dvy != 0) {
            this.force(this.speed, Math.atan2(dvy, dvx));
		}

		//shooting
		if (this.weapon.tick)
            this.weapon.tick(this, dt);

		if (keys["mouse"]) {
			this.weapon.charge(this, dt)
		} else {
			this.weapon.release(this);
		}

		//weapon special
		if (this.weapon.special && keys["r"]) {
			this.weapon.special(this);
		}
	}

    this.erender = this.render;
	this.render = function() {
        this.erender();
		tmp = ctx.fillStyle
		ctx.fillStyle = "white"
		ctx.fillRect(this.x, this.y, 1, 1)

		ctx.strokeStyle = "white"
			//ctx.moveTo(this.x-this.size/2,this.y)
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2)
		ctx.closePath()
		ctx.stroke()

		this.weapon.render(this)

		var x1 = this.x + this.size * 1 * Math.cos(this.shootDir)
		var x2 = x1 - this.size / 4 * Math.cos(this.shootDir - Math.PI / 4)
		var x3 = x1 - this.size / 4 * Math.cos(this.shootDir + Math.PI / 4)

		var y1 = this.y + this.size * 1 * Math.sin(this.shootDir)
		var y2 = y1 - this.size / 4 * Math.sin(this.shootDir - Math.PI / 4)
		var y3 = y1 - this.size / 4 * Math.sin(this.shootDir + Math.PI / 4)

		ctx.beginPath()
		ctx.moveTo(x2, y2)
		ctx.lineTo(x1, y1)
		ctx.lineTo(x3, y3)
		ctx.closePath()
		ctx.stroke()
		ctx.fillStyle = tmp
	}
}
