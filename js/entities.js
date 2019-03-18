
function Entity(){
	this.buffs = [];
    this.speed = 5;
    this.size = 32
	this.v = 0
	this.dir = 0
	this.shootDir = 0
    this.hp = 100;
	this.mp=0;
    this.hpMax = 100;
	this.hpRegenRate = 0.1;
    this.HPBar = new HealthBar(this);
    this.HPBar.width = this.size;
    this.HPBar.height = this.size/16;
    this.HPBar.offsetY = this.size * -0.7;

    this.dmgText = new DamageText(this);

	this.addBuff = function(buff){
		this.buffs.push(buff);
		buff.owner = this;
		//buff.applyEffects(this);
	}

	this.removeBuff = function(buff){
		for(var i=0;i<this.buffs.length;i++){
			if(this.buffs[i] === buff){
				buff.removeEffects(this);
				this.buffs.splice(i, 1);
			}
		}
	}

    this.tick = function(dt){
        dts = dt / 1000 * 16
		
		this.hp = Math.min(this.hpMax, this.hp + this.hpRegenRate * dt/1000);
		
    	for(var i=0;i<this.buffs.length;i++){
    		this.buffs[i].tick(dt);
    	}

        this.v *= Math.pow(0.9, 1 + dts)
		if (Math.abs(this.v) < 0.1)
			this.v = 0

		//movement physics
		vx = this.v * Math.cos(this.dir)
		vy = this.v * Math.sin(this.dir)

		this.x += vx * dts
		this.y += vy * dts

        this.dmgText.tick(dt);
    }

    this.render = function(){
        this.HPBar.render();
        this.dmgText.render();
    }

    this.damage = function(damage) {
		this.hp -= damage
		//game.misc.push(new PopupText(this.x, this.y, damage.toFixed(2)))
		if (this.hp <= 0) {
			this.hp = 0;
			this.kill();
		}
	}
	
	this.kill = function() {
		this.toRemove = true;
	}

	this.knockback = function(force, direction) {
		var vx = this.v * Math.cos(this.dir);
		var vy = this.v * Math.sin(this.dir);

		var ax = force * Math.cos(direction);
		var ay = force * Math.sin(direction);
		vx += ax;
		vy += ay;

		this.dir = Math.atan2(vy, vx);
		this.v = Math.sqrt(vx * vx + vy * vy);
	}

    this.force = function(force, direction){
        vx = this.v * Math.cos(this.dir)
		vy = this.v * Math.sin(this.dir)

		ax = force * Math.cos(direction)
		ay = force * Math.sin(direction)
		vx += ax
		vy += ay

		this.dir = Math.atan2(vy, vx)
		this.v = Math.sqrt(vx * vx + vy * vy)
    }

    this.getSpeedAfterEffects = function(){
        var flatBonuses = [];
        var multBonuses = [];

        for(var i=0;i<this.buffs.length;i++){
            if(this.buffs[i].getTag("speed")){
                if(this.buffs[i]){

                }
            }
        }
    }

    this.getHealth = function(){
        return this.hp;
    }

    this.getMaxHealth = function(){
        return this.hpMax;
    }

    this.getCoords = function(){
        return V(this.x, this.y);
    }
}
