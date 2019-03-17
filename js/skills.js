
function Skill(owner) {
	this.mpCost = 0;
	this.hpCost = 0;
	this.cd = 1000;
	this.cdTime = 1000;
	this.owner = owner;
	this.name = "base skill";
	this.castTime = 0; //0 for instant cast
	this.channeling = false;
}

Skill.prototype.channel = function(dt){
	if(this.channeling){
		this.channelDuration += dt;
	} else {
		console.log(this.owner.hp, this.hpCost, this.owner.mp, this.mpCost);
		if(this.owner.hp > this.hpCost && this.owner.mp >= this.mpCost && this.cdTime>this.cd){
			this.owner.hp-=this.hpCost;
			this.owner.hp-=this.mpCost;
			this.cdTime = 0;
			this.channelDuration = 0;
			this.channeling = true;
			this.channelBar = new ChannelBar(this);
			game.misc.push(this.channelBar);
			console.log("Begin channeling "+this.name);
		}
	}

	if(this.castTime-this.channelDuration<=0 && this.channeling){
		console.log("Done channeling")
		game.misc.splice(this.channelBar, 1);
		this.cast();
	}
};

Skill.prototype.cancelCast = function () {
	if(this.channeling){
		this.reset();
	}
};

Skill.prototype.cast = function(){
	console.log("Casting "+this.name);
	this.reset();
};

Skill.prototype.reset = function(){
	this.channeling = false;
	this.channelDuration = 0;
	game.misc.splice(this.channelBar, 1);
};

Skill.prototype.tick = function (dt) {
	if(!this.channeling){
		this.cdTime += dt;
	}
};


function MagicMissile(owner){
	Skill.call(this, owner);
	this.name="Magic Missile";
	this.castTime = 1000;
	this.projectiles=5;
	this.firedProjectiles = 0;
}

MagicMissile.prototype = Object.create(Skill.prototype);
MagicMissile.prototype.constructor = MagicMissile;

MagicMissile.prototype.channel = function(dt){
	Skill.prototype.channel.call(this, dt);

	//0, 250, 500, 750, 1000
	if(Math.pow(this.channelDuration/this.castTime,1)>(this.firedProjectiles+1)/this.projectiles){
		this.firedProjectiles++;
		this.launchMissile();
	}
}

MagicMissile.prototype.reset = function(){
	Skill.prototype.reset.call(this);
	this.firedProjectiles = 0;
}

MagicMissile.prototype.launchMissile = function(){
	var proj = new MagicMissileProjectile(this.owner.x, this.owner.y, 500, this.owner.shootDir + (-0.5 + Math.random()) * Math.PI / 100, 1);
	game.projectiles.push(proj);
}

MagicMissile.prototype.cast = function () {
	Skill.prototype.cast.call(this);
	this.launchMissile();
	this.reset();
	//var p = new MagicMissileProjectile();
};

function MagicMissileProjectile(x, y, v, dir, owner){
	Projectile.call(this, x, y, v, dir, owner);

	this.render = function(){
		ctx.fillStyle = "white";
		ctx.beginPath();
		ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}
}
MagicMissileProjectile.prototype = Projectile.prototype;

function Shockwave(owner){
	Skill.call(this, owner);
	this.name="Showckwave";
	this.castTime = 500;
}

Shockwave.prototype = Object.create(Skill.prototype);
Shockwave.prototype.constructor = Shockwave;

Shockwave.prototype.cast = function(){
	Skill.prototype.cast.call(this);
	var proj = new ShockwaveProjectile(this.owner.x, this.owner.y, 100, this.owner.shootDir, 1);
	game.projectiles.push(proj);
	this.reset();
}

var ShockwaveProjectile = function(x, y, v, dir, owner){
	Projectile.call(this, x, y, v, dir, owner);
}

var proto = new Projectile;
Object.setPrototypeOf(ShockwaveProjectile, Projectile.prototype);

ShockwaveProjectile.prototype.render = function(){
	ctx.fillStyle = "white";
	ctx.beginPath();
	ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fill();
}
