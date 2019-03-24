class Wall extends Polygon {
    constructor(...args) {
        super(...args);
        this.color = "white";
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

    knockback() {

    }

    damage() {}

    render() {
        setStrokeStyle(this.color);
        super.render();
    }
}

class SquareWall extends Wall {
    constructor(x, y, w, h) {
        super(
            V(x - w/2, y + h/2),
            V(x + w/2, y + h/2),
            V(x + w/2, y - h/2),
            V(x - w/2, y - h/2))
    }
}

class NSidedWall extends Wall {
    constructor(cx, cy, r, n) {
        var vertices = [];
        for (var i = n; i > 0; i--) {
            var px = cx + r * Math.cos(Math.PI * 2 * i/n)
            var py = cy + r * Math.sin(Math.PI * 2 * i/n)
            vertices.push(V(px, py))
        }
        super(...vertices)
    }
}
