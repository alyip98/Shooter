
function Buff(name){
	this.name=name;
	this.tick = function(dt){
		this.duration -= dt;
		if(this.duration<=0){
			this.owner.removeBuff(this);
		}
	}
	this.duration = 0;
	this.type = "generic";
	this.duration = 0;
}

function Slow(magnitude, duration){
	Buff.call(this, "Slow");
	this.magnitude = magnitude;
	this.duration = duration;

	this.applyEffects = function(ent){
		ent.speed*=(1-magnitude);
	}

	this.removeEffects = function(ent){
		ent.speed*=1/(1-magnitude);
	}

}
