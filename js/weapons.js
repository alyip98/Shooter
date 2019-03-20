Weapons.Bow = {
	name: "Wooden Bow",
	damage: 10,
	type: "bow",
	element: "none",
	specialProjectileEnabled: false,
	fire: function(player) {
		var proj = new Projectile(player.x, player.y, 100 * this.currCharge / 1000, player.shootDir + (-0.5 + Math.random()) * Math.PI / 100, player);
		proj.damage = (this.currCharge / 750 + 1) * this.damage;
		proj.v = 700 * this.currCharge/this.maxCharge;
		proj.fxn = 0.9;
		proj.knockbackCoeff = 0.5;
		if (this.currCharge >= this.maxCharge) {
			proj.penetrate = true;
			proj.hp = 3;
			if (this.specialProjectileEnabled) {
				proj.damage = 0.2;
				proj.knockbackCoeff = 1;
				proj.hp = 10000;
				proj.v = 25;
				proj.size = 150;
				proj.fxn = 1;
				proj.decayTime = 100000;
				this.specialProjectileEnabled = false;
			} else {
				var pi = proj.impact;
				proj.impact = function(thing) {
					pi.call(this, thing);
					this.v *= 0.5;
					/*this.hp -= 1;
					if (this.hp <= 0) {
						this.toRemove = true;
						this.penetrate = false;
					}
					this.knockback = this.v * this.knockbackCoeff;
					thing.knockback(this.knockback, this.dir);
					thing.damage(this.damage);*/
				}
			}
		}
		game.projectiles.push(proj)
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
			ss = setStrokeStyle("white");
			lw = setLineWidth(3);
			
			ctx.beginPath()
			ctx.arc(player.x, player.y, player.size / 2 * (1 - (this.currCharge / this.maxCharge)), 0, Math.PI * 2)
			ctx.closePath()
			ctx.stroke()
			
			setStrokeStyle(ss);
			setLineWidth(lw);
		}
	}

}

Weapons.MachineGun = {
	name: "Machine Gun",
	damage: 0.55,
	type: "gun",
	element: "none",
	rof: 1,
	heat: 0,
	maxHeat: 100,
	cooling: 40,
	overheatPenalty: 0.7,
	heating: 1.6,
	canFire: true,
	released: true,
	fire: function(player) {
		var proj = new Projectile(player.x, player.y, 30, player.shootDir + (-0.5 + Math.random()) * Math.PI / 100, player)
		proj.damage = this.damage
		proj.penetrate = false
		proj.hp = 1
		proj.v = 200
		proj.knockbackCoeff = 0.01
		proj.fxn = 0.99
		proj.render = function() {
			tmp = ctx.fillStyle
			ctx.fillStyle = "yellow"
			ctx.fillRect(this.x, this.y, 4, 4)
			ctx.fillStyle = tmp
		}
		game.projectiles.push(proj)
	},
	charge: function(player, dt) {
		if (!this.canFire) return;
		if (!this.released) return;
		for (var i = 0; i < this.rof; i++) {
			this.fire(player)
			this.heat += this.heating
		}
		if (this.heat > this.maxHeat) {
			this.released = false
			this.canFire = false
		}
	},
	release: function(dt) {
		this.released = true
	},
	render: function(player) {
		if (this.heat > 0) {
			tmp = ctx.fillStyle
			ctx.fillStyle = this.canFire ? "white" : "red"
			ctx.beginPath()
			ctx.arc(player.x, player.y, player.size / 2 * (this.heat / this.maxHeat), 0, Math.PI * 2)
			ctx.closePath()
			ctx.fill()
		}
	},
	tick: function(player, dt) {
		if (this.canFire && !keys["mouse"])
			this.heat = Math.max(this.heat - dt * this.cooling/1000, 0)
		else
			this.heat = Math.max(this.heat - dt * this.cooling/1000 * this.overheatPenalty, 0)

		if (this.heat == 0) {
			this.canFire = true
		}
	}

}

Weapons.Shotgun = {
	name: "Shotgun",
	damage: 1,
	type: "gun",
	element: "none",
	rof: 1,
	shots: 10,
	accuracy: 0.7,
	ammo: 3,
	maxAmmo: 3,
	reloadTime: 1500,
	cd: 0,
	maxCD: 0,
	canFire: true,
	reloading: false,
	released: true,
	fire: function(player) {
		for (var i = 0; i < this.shots; i++) {
			var proj = new Projectile(player.x, player.y, 100 * this.currCharge / 1000, player.shootDir + (-0.5 + Math.random()) * Math.PI * (1 - this.accuracy), player)
			proj.damage = 2
			proj.penetrate = false
			proj.hp = 1
			proj.v = 1000 * (0.5 + Math.random() / 2)
			proj.knockbackCoeff = 0.3
			proj.fxn = 0.8
			proj.render = function() {
				tmp = ctx.fillStyle
				ctx.fillStyle = "yellow"
				ctx.fillRect(this.x, this.y, 4, 4)
				ctx.fillStyle = tmp
			}
			game.projectiles.push(proj)
		}
	},
	charge: function(player, dt) {
		if (!this.canFire || this.reloading) return;
		if (this.cd <= 0) {
			this.ammo -= 1
			this.fire(player)
			this.cd = this.maxCD
			this.canFire = false;
			if (this.ammo <= 0) {
				this.special(player)
			}
		}
	},
	special: function(player) {
		this.reloading = true;
	},
	release: function(dt) {
		this.canFire = true;
	},
	render: function(player) {
		if (this.ammo > 0) {
			tmp = ctx.fillStyle
			ctx.fillStyle = this.reloading ? "red" : "white"
			ctx.beginPath()
			ctx.arc(player.x, player.y, player.size / 2 * (this.ammo / this.maxAmmo), 0, Math.PI * 2)
			ctx.closePath()
			ctx.fill()
		}
	},
	tick: function(player, dt) {
		this.cd = Math.max(this.cd - dt, 0)
		if (this.reloading) {
			//reloading
			this.ammo += dt * this.maxAmmo / this.reloadTime
			if (this.ammo >= this.maxAmmo) {
				this.ammo = this.maxAmmo
				this.reloading = false
			}
		}
	}

}

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
        /*if (this.damageAmp > 0) {
			ctx.beginPath()
			ctx.arc(player.x, player.y, player.size / 2 * Math.min(this.damageAmp, 50)/50, 0, Math.PI * 2);
			ctx.closePath()
			ctx.fill()
		}*/
		
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

Weapons.create = function() {
	var bowCopy = {}
	var mgCopy = {}
	var sgCopy = {}
	
	Object.assign(bowCopy, Weapons.Bow)
	Object.assign(mgCopy, Weapons.MachineGun)
	Object.assign(sgCopy, Weapons.Shotgun)
	return [bowCopy, mgCopy, sgCopy]
}