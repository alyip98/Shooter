var COLORS = ["#001f3f", "#0074D9", "#7FDBFF", "#39CCCC", "#3D9970", "#2ECC40", "#01FF70", "#FFDC00", "#FF851B", "#FF4136", "#85144b", "#F012BE", "#B10DC9"];
function Player(id) {
	Entity.call(this);
	this.id = id;
	this.shootDir = 0
	this.attackCD = 1000
	this.attackCDcurr = 0
	this.weapon = Weapons.Bow
	this.controller = new Controller();
	this.skills={
		skill1: new MagicMissile(this),
		skill2: new Shockwave(this)
	};
	this.speed = 5;
	this.x = W/2;
	this.y = H/2;
	this.color = COLORS[Math.floor(Math.random() * COLORS.length)];

	this.init = function(x, y) {
		this.x = x || W / 2
		this.y = y || H / 2
	}
	
    this.etick = this.tick;
	this.tick = function(dt) {
		//Entity.tick.call(this, dt);
        this.etick(dt);
		dts = dt / 1000 * 16

		this.shootDir = this.dir;//Math.atan2(my - this.y, mx - this.x);

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
		
		this.force(this.speed * this.controller.getInput("stickMagnitude"), this.controller.getInput("stickAngle"));

		//shooting
		if (this.weapon.tick)
            this.weapon.tick(this, dt);

		if (this.controller.getInput("down")) {
			this.weapon.charge(this, dt)
		} else {
			this.weapon.release(this);
		}

		//weapon special
		if (this.weapon.special && keys["r"]) {
			this.weapon.special(this);
		}

		if(this.skills.skill1){
			this.skills.skill1.tick(dt);
			if(this.controller.getInput("left")){
				this.skills.skill1.channel(dt);
			} else {
				this.skills.skill1.cancelCast();
			}
		}

		if(this.skills.skill2){
			this.skills.skill2.tick(dt);
			if(this.controller.getInput("right")){
				this.skills.skill2.channel(dt);
			} else {
				this.skills.skill2.cancelCast();
			}

		}

	}

    this.erender = this.render;
	this.render = function() {
        this.erender();
		tmp = ctx.fillStyle
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, 1, 1)

		ctx.strokeStyle = this.color;
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
