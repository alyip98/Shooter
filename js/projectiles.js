var CollisionLayer = {
	Player: 1,
	Enemies: 2,
	Projectiles: 4
}

class Projectile {
    constructor(x, y, v, dir, owner) {
        //console.log(x,y,v,dir,owner)
        this.lifetime = 0;
        this.size = 4;
        this.x = x || W / 2;
        this.y = y || H / 2;
        this.v = v || 40;
        this.dir = dir || Math.random() * 2 * Math.PI;
        this.penetrate = false;
        this.hp = 1;
        this.owner = owner;
        this.damage = 1;
        this.fxn = 0.95;
        this.decayTime = 3000;
        this.knockbackCoeff = 1;
        this.hitList = [];
    }
    tick(dt) {
        if ((this.x < 0 || this.x > W || this.y < 0 || this.y > H) && this.lifetime > 500) {
            this.toRemove = true;
            return;
        }
        this.lifetime += dt;
        if (this.lifetime > this.decayTime) {
            this.toRemove = true;
            return;
        }

        var collisions = this.checkCollisions(dt);
		collisions.sort((a, b) => a[1] - b[1]);
        for (var i = 0; i < collisions.length; i++) {
            if (this.hitList.indexOf(collisions[i]) == -1)
                this.collide(collisions[i][0]);
        }
        this.updatePosition(dt);
    }
    collide(obj) {
        this.hitList.push(obj);
        if (this.hp <= 0) {
            this.toRemove = true;
        }
        if (!this.toRemove) {
            this.impact(obj);
        }
    }
    updatePosition(dt) {
        var dts = dt / 1000 * 16 || 1;
        this.v *= this.fxn;
        if (Math.abs(this.v) < 4) {
            this.v = 0;
            this.toRemove = true;
        }
        //movement physics
        var vx = this.v * Math.cos(this.dir);
        var vy = this.v * Math.sin(this.dir);
        this.x += vx * dts;
        this.y += vy * dts;
    }
    getNewPosition(dt) {
        var vx = this.v * Math.cos(this.dir);
        var vy = this.v * Math.sin(this.dir);
        var dts = dt / 1000 * 16 || 1;
        var bx = this.x + vx * dts;
        var by = this.y + vy * dts;
        var distFrame = this.v * dts;
        return [bx, by, distFrame];
    }
    checkCollisions(dt) {
        var out = [];
        var targets = [];
        if (this.owner) {
            if (this.owner.constructor.name == "Player") {
                if (game.mode == Mode.PVP) {
                    targets = Array.from(game.players);
                    targets.splice(targets.indexOf(this.owner), 1);
                }
                else {
                    targets = game.enemies;
                }
            }
            else {
                targets = game.players;
            }
        }
        // if (this.owner == 1) targets = game.enemies;
        // if (this.owner == 2 || game.mode == Mode.PVP) targets = game.players;
        //collision test
        for (var i = 0; i < targets.length; i++) {
            if (targets[i].toRemove) {
                continue;
            }
			var rr = this.size / 2 + targets[i].size / 2;
			var dts = dt/1000;
			var dd = distsqLineSegment(V(this.x, this.y), V(this.x + this.v * Math.cos(this.dir) * dts, this.y + this.v * Math.sin(this.dir) * dts), V(targets[i].x, targets[i].y));
			if (dd < rr * rr) //dist is less than sum of radii
				out.push([targets[i], Math.sqrt(dd)]);
        }
        return out;
    }
    impact(thing) {
        this.hp -= 1;
        if (this.hp <= 0) {
            this.toRemove = true;
            this.penetrate = false;
        }
        this.knockback = Math.sqrt(this.v) * this.knockbackCoeff;
		if (thing.knockback)
        	thing.knockback(this.knockback, this.dir);
        thing.damage(this.damage);
    }
    render() {
		var fs = setFillStyle("yellow");
		ctx.fillRect(this.x, this.y, this.size, this.size);
		ctx.fillStyle = fs;
    }
}

class Arrow extends Projectile{
	constructor(x, y, v, dir, owner){
		super(x, y, v, dir, owner);
	}
    render(){
		ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        var projlength = Math.min(this.v, 20);
		var nx, ny;
        if (this.v > 0) {
            nx = this.x + projlength * Math.cos(this.dir);
            ny = this.y + projlength * Math.sin(this.dir);
        }
        else {
            nx = this.x;
            ny = this.y;
        }
        ctx.lineTo(nx, ny);
        //ctx.arc(this.x,this.y,this.size/2,0,Math.PI*2)
        ctx.closePath();
        ctx.stroke();
        var x1 = this.x + this.size * Math.cos(this.dir);
        var x2 = -this.size * Math.cos(this.dir - Math.PI / 4);
        var x3 = -this.size * Math.cos(this.dir + Math.PI / 4);
        var y1 = this.y + this.size * Math.sin(this.dir);
        var y2 = -this.size * Math.sin(this.dir - Math.PI / 4);
        var y3 = -this.size * Math.sin(this.dir + Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(x1 + x2, y1 + y2);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x1 + x3, y1 + y3);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(nx + x2 / 2, ny + y2 / 2);
        ctx.lineTo(nx, ny);
        ctx.lineTo(nx + x3 / 2, ny + y3 / 2);
        ctx.closePath();
        ctx.stroke();
	}
	impact(thing) {
		super.impact(thing);
		this.v *= 0.5;
	}
}
