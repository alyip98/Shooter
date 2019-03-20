class Wall {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.poly = new Polygon(
            V(this.x - this.width/2, this.y - this.height/2),
            V(this.x + this.width/2, this.y - this.height/2),
            V(this.x + this.width/2, this.y + this.height/2),
            V(this.x - this.width/2, this.y + this.height/2))
    }

    collides(entity) {
        // Assume entity is a circle
        var sides = this.poly.sides;
        var circle = {
            center: V(entity.x, entity.y),
            radius: entity.size
        }
        for (var i = 0; i < sides.length; i++) {
            if (intersectCircle(circle, {start: sides[i][0], end: sides[i][1]})) {
                return true;
            }
        }
        return pointInRectangle(V(entity.x, entity.y), this.poly)
    }

    render() {
        /*var fs = setFillStyle("#eee")
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        setFillStyle(fs);*/
        var ss = setStrokeStyle("#eee")
        for (var i in this.poly.sides) {
            var side = this.poly.sides[i];
            ctx.beginPath()
            ctx.moveTo(side[0].x, side[0].y);
            ctx.lineTo(side[1].x, side[1].y);
            ctx.stroke();
            ctx.closePath();
        }
    }

    knockback() {

    }

    damage() {}
}
