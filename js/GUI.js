function GUI(){
    this.x = 0;
    this.y = 0;
    this.width = 10;
    this.height = 10;
    this.offsetX = 0;
    this.offsetY = 0;
    this.colour = "white";
}

function Bar(obj){
    GUI.call(this);
    this.boundObject = obj;
    this.position = "fixed";

    this.render = function(){
        if(this.position === "follow"){
            this.x = obj.x;
            this.y = obj.y;
        }
        var x1 = this.x - this.width/2 + this.offsetX;
        var x2 = x1 + this.width;
        var y1 = this.y - this.height/2 + this.offsetY;
        var y2 = y1 + this.height;
        ctx.fillStyle = this.colour;
        ctx.strokeStyle = this.colour;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x1, y2);
        ctx.lineTo(x1, y1);
        ctx.closePath();
        ctx.stroke();

        ctx.fillRect(x1,y1,this.width * this.getPercentage(), this.height);
    }
}

function PPT(x, y, text) {
	game.misc.push(new PopupText(x, y, text));
}

function PopupText(x, y, text) {
	this.x = x
	this.y = y
	this.text = text
	this.lifetime = 0
	this.decayTime = 3000
	this.fillStyle = "white"
	this.tick = function(dt) {
		this.y -= 50 * dt / this.decayTime
		this.lifetime += dt
		if (this.lifetime > this.decayTime)
			this.toRemove = true
	}

	this.render = function() {
		tmp = ctx.fillStyle
		ctx.fillStyle = this.fillStyle
		ctx.globalAlpha = 1 - (this.lifetime / this.decayTime)
		ctx.fillText(this.text, this.x, this.y)
		ctx.fillStyle = tmp
		ctx.globalAlpha = 1
	}
}

function Text(){

}

function DamageText(obj){
    GUI.call(this);
    this.boundObject = obj;
    this.hidden = true;
    this.position = "follow";
    this.timeout = 1000;
    this.prevHP = -1;
    this.startHP = 0;
    this.text = "";

    this.tick = function(dt){
        var dhp = obj.getHealth() - this.prevHP;
        if(dhp<0){
            this.hidden = false;
            this.timeout = 1000;
            this.startHP = this.prevHP;
            this.text = this.startHP - obj.getHealth();
        }
    }

    this.render = function(){
        if(!this.hidden){
            ctx.fillText(this.getText(), this.x, this.y);
        }
    }

    this.getText = function(){
        return this.startHP - obj.getHealth();
    }
}

function HealthBar(obj){
    Bar.call(this, obj);

    this.position = "follow";
    this.getPercentage = function(){
        return obj.getHealth()/obj.getMaxHealth();
    }
}
