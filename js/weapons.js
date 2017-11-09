Weapons.Bow = {
	name: "Wooden Bow",
	damage: 1,
	type: "bow",
	element: "none",
	specialProjectileEnabled: false,
	fire: function(player) {
		var proj = new Projectile(player.x, player.y, 100 * this.currCharge / 1000, player.shootDir + (-0.5 + Math.random()) * Math.PI / 100, 1);
		proj.damage = this.currCharge / 750 + 1;
		if (this.currCharge >= this.maxCharge) {
			proj.penetrate = true;
			proj.hp = 3;
			proj.v = 250;
			proj.knockbackCoeff = 1;
			if (this.specialProjectileEnabled) {
				proj.hp = 10000;
				proj.v = 300;
				proj.size = 150;
				proj.fxn = 1;
				proj.decayTime = 100000;
				this.specialProjectileEnabled = false;
			} else {
				proj.impact = function(thing) {
					this.v *= 0.5;
					this.hp -= 1;
					if (this.hp <= 0) {
						this.toRemove = true;
						this.penetrate = false;
					}
					this.knockback = this.v * this.knockbackCoeff;
					thing.knockback(this.knockback, this.dir);
					thing.damage(this.damage);
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
		player.addBuff(new Slow(0.8, 1));
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

Weapons.MachineGun = {
	name: "Machine Gun",
	damage: 0.1,
	type: "gun",
	element: "none",
	rof: 1,
	heat: 10000,
	maxHeat: 10000,
	cooling: 0.5,
	heating: 30,
	canFire: true,
	released: true,
	fire: function(player) {
		var proj = new Projectile(player.x, player.y, 100 * this.currCharge / 1000, player.shootDir + (-0.5 + Math.random()) * Math.PI / 100, 1)
		proj.damage = this.damage
		proj.penetrate = false
		proj.hp = 1
		proj.v = 400
		proj.knockbackCoeff = 0.01
		proj.fxn = 0.99
		proj.render = function() {
			tmp = ctx.fillStyle
			ctx.fillStyle = "yellow"
			ctx.fillRect(this.x, this.y, 2, 2)
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
			this.heat = Math.max(this.heat * 0.95 - dt * this.cooling, 0)
		else
			this.heat = Math.max(this.heat - dt * this.cooling, 0)

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
	accuracy: 0.9,
	ammo: 5,
	maxAmmo: 5,
	reloadTime: 2000,
	cd: 0,
	maxCD: 500,
	canFire: true,
	released: true,
	fire: function(player) {
		for (var i = 0; i < this.shots; i++) {
			var proj = new Projectile(player.x, player.y, 100 * this.currCharge / 1000, player.shootDir + (-0.5 + Math.random()) * Math.PI * (1 - this.accuracy), 1)
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
		if (!this.canFire) return;
		if (this.cd <= 0) {
			this.ammo -= 1
			this.fire(player)
			this.cd = this.maxCD
			if (this.ammo == 0) {
				this.special(player)

			}
		}
	},
	special: function(player) {
		this.canFire = false
	},
	release: function(dt) {

	},
	render: function(player) {
		if (this.ammo > 0) {
			tmp = ctx.fillStyle
			ctx.fillStyle = this.canFire ? "white" : "red"
			ctx.beginPath()
			ctx.arc(player.x, player.y, player.size / 2 * (this.ammo / this.maxAmmo), 0, Math.PI * 2)
			ctx.closePath()
			ctx.fill()
		}
	},
	tick: function(player, dt) {
		this.cd = Math.max(this.cd - dt, 0)
		if (!this.canFire) {
			//reloading
			this.ammo += dt * this.maxAmmo / this.reloadTime
			if (this.ammo >= this.maxAmmo) {
				this.ammo = this.maxAmmo
				this.canFire = true
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
		var proj = this.createProjectile(player.x, player.y, 100 * this.currCharge / 1000, player.shootDir + (-0.5 + Math.random()) * Math.PI / 100, 1, this.currCharge / 750 + 1);
        proj.hp = Math.round(Math.random()*3)+2;
        proj.penetrate = true;

	},
	maxCharge: 1500,
	minCharge: 200,
	currCharge: 0,
	chargeMulti: 1,
	charge: function(player, dt) {
		player.addBuff(new Slow(0.8, 1));
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
