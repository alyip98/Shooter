class Weapon {
	constructor(owner) {
		this.owner = owner;
		this.damage = 1;
		this.cd = 0;
		this.cdTime = 1000;
		this.projectileSpeed = 10000;
		this.speedPenalty = 0.75;
	}

	fire() {

	}

	charge(dt) {

	}

	release() {

	}

	tick(dt) {
		this.cd = Math.max(this.cd - dt, 0);
	}

	render() {

	}
}

class ChargeBasedWeapon extends Weapon {
	constructor(owner) {
		super(owner);
		this.currCharge = 0;
		this.minCharge = 100;
		this.maxCharge = 1000;
	}

	fire() {
		this.currCharge = 0;
	}

	charge(dt) {
		this.currCharge = Math.min(this.currCharge + dt, this.maxCharge);
	}

	release() {
		if (this.currCharge >= this.minCharge)
			this.fire();
	}
}

class AmmoBasedWeapon extends Weapon {
	constructor(owner) {
		super(owner);
		this.ammo = 0;
		this.maxAmmo = 10;
		this.reloadTime = 1500;
		this.isReloading = false;
	}

	fire() {
		this.ammo--;
		if (this.ammo <= 0) {
			this.isReloading = true;
		}
	}

	charge(dt) {
		if (this.ammo <= 0 && !this.isReloading) {
			this.isReloading = true;
		}

		if (this.isReloading || this.ammo <= 0 || this.cd > 0) {
			return;
		}

		this.fire();
	}

	tick(dt) {
		super.tick(dt);
		if (this.isReloading) {
			this.ammo = Math.min(this.ammo + dt * this.maxAmmo / this.reloadTime, this.maxAmmo);
			if (this.ammo == this.maxAmmo) {
				this.isReloading = false;
			}
		}
	}

	render() {
		if (this.ammo > 0) {
			var player = this.owner;
			var ss = setStrokeStyle(this.isReloading ? "red" : "white")
			var lw = setLineWidth(3);
			ctx.beginPath()
			var percentageAmmo = this.ammo / this.maxAmmo;
			var width = 10;
			// ctx.fillRect(player.x - player.size/2 - width- 10, player.y + player.size/2 - height, width, height)
			ctx.arc(player.x, player.y, player.size / 2 + width, 0, Math.PI * 2 * percentageAmmo);
			ctx.stroke()
			ctx.closePath()
			setStrokeStyle(ss);
			setLineWidth(lw);
		}
	}
}

class Bow extends ChargeBasedWeapon {
	constructor(owner) {
		super(owner);
		this.damage = 10;
		this.speedPenalty = 0.9;
		this.projectileSpeed = 11000;
	}

	fire() {
		var player = this.owner;
		var proj = new Arrow(player.x, player.y, this.projectileSpeed * this.currCharge/this.maxCharge, player.shootDir + (-0.5 + Math.random()) * Math.PI / 100, player);
		proj.damage = (this.currCharge / 750 + 1) * this.damage;
		proj.fxn = 0.9;
		proj.knockbackCoeff = 0.5;
		if (this.currCharge >= this.maxCharge) {
			proj.penetrate = true;
			proj.hp = 3;
		}
		game.registerProjectile(proj);
		super.fire();
	}

	render() {
		var player = this.owner;
		var jitterX = 0;
		var jitterY = 0;
		if (this.currCharge == this.maxCharge) {
			jitterX = (Math.random() - 0.5) * 3
			jitterY = (Math.random() - 0.5) * 3
		}
		this.drawBow(player.x + jitterX, player.y + jitterY, player.shootDir, player.size * 0.4, this.currCharge/this.maxCharge);
	}

	drawBow(x, y, dir, size, t) {
		var fs = setFillStyle("white");
		var lw = setLineWidth(2);
		var ss = setStrokeStyle("white");

		var arcDeg = 145;
		var degToRad = Math.PI / 180;
		var a1 = dir - degToRad * arcDeg/2;
		var a2 = dir + degToRad * arcDeg/2;
		var t2 = Math.pow(t + 0.1, 1);
		var k = 0.5;
		if (t2 > k) t2 = k + (t2 - k)/t2;
		var stringDrawDist = size * (0.5 - t2);
		var arrowLength = size * 1.6;

		// Bow arc
		ctx.beginPath();
		ctx.arc(x, y, size, a1, a2);
		ctx.stroke();
		ctx.closePath();

		// Bow string
		ctx.beginPath();
		ctx.moveTo(x + size * Math.cos(a1), y + size * Math.sin(a1));
		ctx.lineTo(x + stringDrawDist * Math.cos(dir), y + stringDrawDist * Math.sin(dir));
		ctx.lineTo(x + size * Math.cos(a2), y + size * Math.sin(a2));
		ctx.stroke();
		ctx.closePath();

		// Arrow
		ctx.beginPath();
		ctx.moveTo(x + stringDrawDist * Math.cos(dir), y + stringDrawDist * Math.sin(dir));
		ctx.lineTo(x + (stringDrawDist + arrowLength) * Math.cos(dir), y + (stringDrawDist + arrowLength) * Math.sin(dir));
		ctx.stroke();
		ctx.closePath();

		setFillStyle(fs);
		setLineWidth(lw);
		setStrokeStyle(ss);
	}
}

class Shotgun extends AmmoBasedWeapon {
	constructor(owner) {
		super(owner);
		this.damage = 2;
		this.shots = 10;
		this.accuracy = 0.7;
		this.speedPenalty = 0.7;
		this.maxAmmo = 3;
		this.ammo = 3;
		this.reloadTime = 1500;
		this.isCocked = true;
	}

	fire() {
		var player = this.owner;
		for (var i = 0; i < this.shots; i++) {
			var proj = new Projectile(player.x, player.y, 15000 * (0.5 + Math.random() / 2), player.shootDir + (-0.5 + Math.random()) * Math.PI * (1 - this.accuracy), player)
			proj.damage = this.damage;
			proj.knockbackCoeff = 0.3
			proj.fxn = 0.8
			game.registerProjectile(proj)
		}
		this.isCocked = false;
		super.fire();
	}

	charge(dt) {
		if (!this.isCocked) {
			return;
		}

		super.charge(dt);
	}

	release(dt) {
		this.isCocked = true;
	}
}

class SubMachineGun extends AmmoBasedWeapon {
	constructor(owner) {
		super(owner);
		this.damage = 0.55;
		this.maxAmmo = 100;
		this.ammo = 200;
		this.rof = 2;
		this.reloadTime = 5000;
		this.accuracy = 0.95;
	}

	fire() {
		for (var i = 0; i < this.rof; i++) {
			var player = this.owner;
			var offsetX = i * player.size / this.rof * Math.cos(player.shootDir);
			var offsetY = i * player.size / this.rof * Math.sin(player.shootDir);
			var proj = new Projectile(player.x + offsetX, player.y + offsetY, 10000 * (0.5 + Math.random() / 2), player.shootDir + (-0.5 + Math.random()) * Math.PI * (1 - this.accuracy), player)
			proj.damage = this.damage
			proj.knockbackCoeff = 0.01
			proj.fxn = 0.99
			game.registerProjectile(proj)
			super.fire();
		}

	}

	charge(dt) {
		super.charge(dt);
	}
}

/*
Weapons.SplitBow = {
	name: "Split Bow",
	damage: 1,
	type: "bow",
	element: "none",
	specialProjectileEnabled: false,
    createProjectile: function(x, y, v, dir, owner, dmg){
        console.log(arguments);
        var proj = new Projectile(x, y, v, dir, owner);
        proj.damage = dmg;
        proj.source = this;
        proj.impact = function(thing){
            this.hp -= 1
    		if (this.hp <= 0) {
    			this.toRemove = true
    			this.penetrate = false
    		} else {
                this.toRemove = true;
                var n = this.hp;
                var angle = Math.PI*2/n;
                for(var i=0;i<this.hp;i++){
                    var p =this.source.createProjectile(this.x, this.y, this.v*0.9, angle*(i+1)+this.dir, this.owner, this.damage/2);
                    p.hp = Math.floor(this.hp/2);
                }
            }
    		this.knockback = this.v * this.knockbackCoeff
    		thing.knockback(this.knockback, this.dir)
    		thing.damage(this.damage);
        }

		game.projectiles.push(proj)
        return proj;
    },

	fire: function(player) {
		var proj = this.createProjectile(player.x, player.y, 100 * this.currCharge / 1000, player.shootDir + (-0.5 + Math.random()) * Math.PI / 100, player, this.currCharge / 750 + 1);
        proj.hp = Math.round(Math.random()*3)+2;
        proj.penetrate = true;

	},
	maxCharge: 1500,
	minCharge: 200,
	currCharge: 0,
	chargeMulti: 1,
	charge: function(player, dt) {
		//player.addBuff(new Slow(0.8, 1));
		if (this.specialProjectileEnabled)
			this.currCharge += dt / 2 * this.chargeMulti
		else
			this.currCharge += dt * this.chargeMulti
		if (this.currCharge > this.maxCharge) {
			this.release(player)
		}
	},
	release: function(player) {
		if (this.currCharge > this.minCharge)
			this.fire(player)
		this.currCharge = 0
	},
	special: function(player) {
		this.specialProjectileEnabled = true
	},
	render: function(player) {
		if (this.currCharge > 0) {
			ctx.beginPath()
			ctx.arc(player.x, player.y, player.size / 2 * (this.currCharge / this.maxCharge), 0, Math.PI * 2)
			ctx.closePath()
			ctx.fill()
		}
	}

}

Weapons.Tesla = {
    name: "Tesla Gun",
    damage: 0.01,
    type: "gun",
    element: "lightning",
    range: 400,
    angle: Math.PI/8,
    bolts:[],
    cd:0,
    maxCD: 0,
    knockbackCoeff:1,
    hitLastTick:0,
    damageAmp:0,
	maxDamageAmp: 5,
	damageAmpDecayRate: 1,
    maxTargets: 3,
	mana: 1000,
	manaRate: 1000,
	manaCost: 30,
	maxMana: 1000,
    tick: function(player, dt){
        this.cd-=dt;
		this.mana = Math.min(this.mana + this.manaRate * dt/1000, this.maxMana);
        if(this.cd<=0){
            this.bolts = [];
        }

        if(this.cd<-100){
            this.hitLastTick = 0;
        }

        if(this.hitLastTick === 0){
            this.damageAmp = Math.max(this.damageAmp * 0.98 - this.damageAmpDecayRate * dt/1000, 0);
        }
    },

    charge: function(player){
		if (this.mana < this.manaCost) {return;}
        if(this.cd>0){return;} else {
            this.cd = this.maxCD;
        }
		this.mana -= this.manaCost;
        var targets = game.enemies;
        var hitEnemies = [];
        var aimVector = VP(this.range, player.shootDir);
        var pv = V(player.x, player.y);
        var candidates = [];
        this.hitLastTick = 0;
        for(var i = 0;i<enemies.length;i++){
            var enemy = enemies[i];
            var ev = V(enemy.x, enemy.y);
            var angle = ev.sub(pv).getAngle(aimVector);
            var dist = ev.sub(pv).len();
            //console.log(angle, dist);
            if(angle<this.angle && dist <= this.range){
                candidates.push(enemy);
                //this.fire(player, enemy);
                this.hitLastTick++;
            }
        }

        if(candidates.length>0){
			console.log("DA", this.damageAmp);
            for(var i=0;i<this.maxTargets;i++){
                var index = Math.floor(Math.random()*candidates.length);
                this.fire(player, candidates[index]);
            }
        }

        if(this.hitLastTick>0){
            this.damageAmp += 0.1;
        }
    },

    fire: function(player, enemy){
        this.bolts.push(new Lightning(player.getCoords(), enemy.getCoords(), 10, 0.2, this.damageAmp));
        enemy.damage(this.damage * (1 + this.damageAmp));
        enemy.knockback(this.knockbackCoeff, Math.random()*Math.PI*2);
    },

    release: function(player){

    },

    render: function(player){

		ctx.beginPath()
		ctx.arc(player.x, player.y, player.size / 2 * Math.min(this.mana/1000, 1), 0, Math.PI * 2);
		ctx.closePath()
		ctx.fill()

        if(this.bolts.length>0){
            ctx.beginPath();
            for(var i=0;i<this.bolts.length;i++){
                //console.log(this.bolts[i]);
                this.bolts[i].draw();
            }
            ctx.closePath();
            ctx.stroke();
        } else {
            var length = 50;
            var sd = VP(length, player.shootDir);
            var nd = sd.getNormalVector().mul((Math.random()-0.5)/4);
            var b = new Lightning(player.getCoords(), player.getCoords().add(sd.mul(Math.random())).add(nd), 10, 10);
            ctx.beginPath();
            b.draw();
            ctx.stroke();
        }
    }
}
*/
Weapons.create = function() {
	var bowCopy = {}
	var mgCopy = {}
	var sgCopy = {}

	Object.assign(bowCopy, Weapons.Bow)
	Object.assign(mgCopy, Weapons.MachineGun)
	Object.assign(sgCopy, Weapons.Shotgun)
	return [bowCopy, mgCopy, sgCopy]
}
