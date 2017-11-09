
function Enemy() {
    Entity.call(this);
	this.size = 32
	this.v = 0
	this.dir = 0
	this.facingDir = 0
	this.hp = 10;
    this.hpMax = 10;
	this.turnrate = 1
	this.init = function(x, y) {
		this.x = x || W / 2
		this.y = y || H / 2
	}
    this.etick = this.tick;
	this.tick = function(dt) {
        this.etick(dt);
		dts = dt / 1000 * 16 || 1
		//var acc = 5
			//friction

		//turning
		targetDir = Math.atan2(-this.y + game.player.y, -this.x + game.player.x)
		ddir = this.facingDir - targetDir
		if (ddir < -Math.PI) ddir += 2 * Math.PI
		if (ddir > Math.PI) ddir -= 2 * Math.PI
		if (Math.abs(ddir) < this.turnrate) this.facingDir = targetDir
		else if (ddir > 0) {
			this.facingDir -= this.turnrate * dts
		} else {
			this.facingDir += this.turnrate * dts
		}
		if (this.facingDir < -Math.PI) {
			this.facingDir += Math.PI * 2
		}

		//walking

		//acc = 2
		accCoeff = 2/5;
		ax = this.speed * accCoeff * Math.cos(this.facingDir) * dts
		ay = this.speed * accCoeff * Math.sin(this.facingDir) * dts
		vx += ax
		vy += ay

		this.x += vx * dts
		this.y += vy * dts

		this.dir = Math.atan2(vy, vx)
		this.v = Math.sqrt(vx * vx + vy * vy)
	}

    this.erender = this.render;
	this.render = function() {
        this.erender();
		ctx.strokeStyle = "red";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
		ctx.closePath();
		ctx.stroke();

		var x1 = this.x + this.size * 1 * Math.cos(this.facingDir);
		var x2 = x1 - this.size / 4 * Math.cos(this.facingDir - Math.PI / 4);
		var x3 = x1 - this.size / 4 * Math.cos(this.facingDir + Math.PI / 4);

		var y1 = this.y + this.size * 1 * Math.sin(this.facingDir);
		var y2 = y1 - this.size / 4 * Math.sin(this.facingDir - Math.PI / 4);
		var y3 = y1 - this.size / 4 * Math.sin(this.facingDir + Math.PI / 4);

		ctx.beginPath()
		ctx.moveTo(x2, y2)
		ctx.lineTo(x1, y1)
		ctx.lineTo(x3, y3)
		ctx.closePath()
		ctx.stroke()
	}
}
