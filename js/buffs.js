// A buff can have multiple effects e.g. +10 speed, -5 armor
// an effect is the fundamental unit

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
    this.tag = "";
	this.duration = 0;
    this.effects=[];
}

function Effect(){
    this.name = name;
    this.type = "";
    this.tags = [];
    this.hasTag = function(tag){
        return tag in this.tags;
    }
}

function Slow(magnitude, duration){
	Effect.call(this, "Slow");
	this.magnitude = magnitude;
	this.duration = duration;
    this.tags = ["speed", "mult"];
}
