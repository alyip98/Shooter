
function Entity(){
	this.buffs = [];
    this.speed = 5;

	this.addBuff = function(buff){
		this.buffs.push(buff);
		buff.owner = this;
		buff.applyEffects(this);
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
    	for(var i=0;i<this.buffs.length;i++){
    		this.buffs[i].tick(dt);
    	}
    }

}
