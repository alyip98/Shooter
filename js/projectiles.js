
function Projectile(x, y, v, dir, owner) {
	//console.log(x,y,v,dir,owner)
	this.lifetime = 0
	this.size = 8
	this.x = x || W / 2
	this.y = y || H / 2
	this.v = v || 40
	this.dir = dir || Math.random() * 2 * Math.PI
	this.penetrate = false
	this.hp = 1
	this.owner = owner || 0 //0-neutral; 1-player; 2- enemy
	this.damage = 1
	this.fxn = 0.95
	this.decayTime = 3000
	this.knockbackCoeff = 1
}

Projectile.prototype.tick = function(dt){
	var dts = dt / 1000 * 16 || 1;

	if ((this.x < 0 || this.x > W || this.y < 0 || this.y > H) && this.lifetime > 500) {
		this.toRemove = true
		return;
	}

	this.lifetime += dt;
	if (this.lifetime > this.decayTime) {
		this.toRemove = true;
		return;
	}

	var collisions = this.checkCollisions(dt);
	for(var i=0;i<collisions.length;i++){
		this.collide(collisions[i]);
	}

	this.updatePosition(dt);
}

Projectile.prototype.collide= function(obj){
	if(this.hp<=0){
		this.toRemove = true;
	}

	if(!this.toRemove){
		this.impact(obj);
	}
}

Projectile.prototype.updatePosition = function(dt){
	var dts = dt / 1000 * 16 || 1;
	this.v *= this.fxn;
	if (Math.abs(this.v) < 4) {
		this.v = 0;
		this.toRemove = true;
	}

	//movement physics
	var vx = this.v * Math.cos(this.dir)
	var vy = this.v * Math.sin(this.dir)

	this.x += vx * dts
	this.y += vy * dts
}

Projectile.prototype.getNewPosition = function(dt){
	var vx = this.v * Math.cos(this.dir)
	var vy = this.v * Math.sin(this.dir)
	var dts = dt / 1000 * 16 || 1;
	var bx = this.x + vx * dts;
	var by = this.y + vy * dts;
	var distFrame = this.v * dts;
	return [bx, by, distFrame];
}

Projectile.prototype.checkCollisions = function(dt){
	var out=[];
	if (this.owner == 1) targets = game.enemies;
	if (this.owner == 2) targets = [game.player];

	//collision test
	for (var i = 0; i < targets.length; i++) {
		if(targets[i].toRemove){
			continue;
		}
		var rr = this.size / 2 + targets[i].size / 2;
		var dx = targets[i].x - this.x;
		var dy = targets[i].y - this.y;
		var distsq = dx * dx + dy * dy;
		var distFrame = this.v * dts;
		var np = this.getNewPosition(dt);
		var ax = this.x;
		var ay = this.y;
		var bx = np[0];
		var by = np[1];

		if (distsq < rr * rr) //basic distance test
		{
			out.push(targets[i]);
			/*
			this.impact(targets[i])
				//PPT(targets[i].x-5,targets[i].y,"!");
			if (!this.penetrate)
				return;
				*/
		} else if (distsq < Math.pow(distFrame, 2)) {//if within reasonable distance, check raycast
			var AB = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2)); //
			var x1 = ax;
			var y1 = ay;
			var x2 = bx;
			var y2 = by;
			var x3 = targets[i].x;
			var y3 = targets[i].y;
			var area = Math.abs(0.5 * (x1 * y2 - y1 * x2 + x2 * y3 - y2 * x3 + x3 * y1 - y3 * x1));
			var length = area / AB * 2; //use fancy math to figure out perpendicular distance from target to path
			console.log(x1, y1, x2, y2, x3, y3, area, length);
			//console.log("size", targets[i].size, "dist", distsq);
			if (length < rr) {
				dd = distsqLineSegment(V(ax, ay), V(bx, by), V(targets[i].x, targets[i].y));
					//console.log("dd",dd,"{",ax,ay,"}","{",bx,by,"}","{",targets[i].x,targets[i].y,"}")
				if (dd < rr * rr) //dist is less than sum of radii
				{
					out.push(targets[i]);
					//PPT(x3,y3-10,"~~~~~~~~~~~~~~~~~~~");
					/*this.impact(targets[i])
					if (!this.penetrate)
						return;*/
				}
			}
		}

	}

	if(out.length>0){
		console.log(out);
	}
	return out;
}

Projectile.prototype.impact = function(thing) {
	this.hp -= 1
	if (this.hp <= 0) {
		this.toRemove = true
		this.penetrate = false
	}
	this.knockback = Math.sqrt(this.v) * this.knockbackCoeff
	thing.knockback(this.knockback, this.dir)
	thing.damage(this.damage);
}

Projectile.prototype.render = function(){
	ctx.strokeStyle = "white"
	ctx.beginPath()
	ctx.moveTo(this.x, this.y)
	var projlength = Math.min(this.v, 20)
	if (this.v > 0) {
		nx = this.x + projlength * Math.cos(this.dir)
		ny = this.y + projlength * Math.sin(this.dir)
	} else {
		nx = this.x
		ny = this.y
	}
	ctx.lineTo(nx, ny)
		//ctx.arc(this.x,this.y,this.size/2,0,Math.PI*2)
	ctx.closePath()
	ctx.stroke()

	var x1 = this.x + this.size * Math.cos(this.dir)
	var x2 = -this.size * Math.cos(this.dir - Math.PI / 4)
	var x3 = -this.size * Math.cos(this.dir + Math.PI / 4)

	var y1 = this.y + this.size * Math.sin(this.dir)
	var y2 = -this.size * Math.sin(this.dir - Math.PI / 4)
	var y3 = -this.size * Math.sin(this.dir + Math.PI / 4)

	ctx.beginPath()
	ctx.moveTo(x1 + x2, y1 + y2)
	ctx.lineTo(x1, y1)
	ctx.lineTo(x1 + x3, y1 + y3)
	ctx.closePath()
	ctx.stroke()

	ctx.beginPath()
	ctx.moveTo(nx + x2 / 2, ny + y2 / 2)
	ctx.lineTo(nx, ny)
	ctx.lineTo(nx + x3 / 2, ny + y3 / 2)
	ctx.closePath()
	ctx.stroke()
}
