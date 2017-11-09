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

function HealthBar(obj){
    Bar.call(this, obj);

    this.position = "follow";
    this.getPercentage = function(){
        return obj.getHealth()/obj.getMaxHealth();
    }
}
