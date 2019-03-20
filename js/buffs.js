// A buff can have multiple effects e.g. +10 speed, -5 armor
// an effect is the fundamental unit
class Buff {
    constructor(name) {
        this.name = name
        this.duration = 0;
        this.type = "generic";
        this.tag = "";
        this.duration = 0;
        this.effects = [];
    }

	tick(dt) {
		this.duration -= dt;
		if (this.duration <= 0) {
			this.owner.removeBuff(this);
		}
	}
}

class Effect {
    constructor(name) {
        this.name = name;
        this.type = "";
        this.tags = [];
        this.hasTag = function(tag) {
            return tag in this.tags;
        };
    }
}

class Slow extends Effect{
	constructor(magnitude, duration) {
		super("Slow");
		this.magnitude = magnitude;
		this.duration = duration;
	    this.tags = ["speed", "mult"];
	}
}
