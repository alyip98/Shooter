class PowerUp extends Entity {
    constructor(x, y, generator) {
        super();
        this.x = x;
        this.y = y;
        this.generator = generator;
    }

    destroy() {
        this.generator.powerUpCount--;
    }

    apply(player) {
        if (this.toRemove) return false;
        this.toRemove = true;
        return true;
    }
}

class HealthPack extends PowerUp {
    constructor(x, y, generator) {
        super(x, y, generator);
        this.size = 16;
        this.healAmount = 20;
    }

    render() {
        var fs = setFillStyle("#f66");
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        setFillStyle(fs);
    }

    apply(player) {
        if(super.apply(player)) {
            player.heal(this.healAmount)
        }
    }
}

class PowerUpGenerator extends Entity {
    constructor(x, y, base, cd, maxCount) {
        super();
        this.x = x;
        this.y = y;
        this.cd = cd;
        this.powerUpBase = base
        this.maxPowerUps = maxCount;
        this.powerUpCount = 0;
        this.cdTimer = new Timer(this.cd);
    }

    tick(dt) {
        if (this.powerUpCount < this.maxPowerUps)
            this.cdTimer.ifReady(() => {
                var powerUp = new this.powerUpBase(this.x, this.y, this);
                powerUp.v = 0; //Math.random() * 50;
                powerUp.dir = Math.random() * Math.PI * 2;
                game.registerPowerUps(powerUp);
                this.powerUpCount++;
                this.cdTimer.reset(this.cd);
            })
    }

    render() {
        var fs = setFillStyle("#f33");
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        setFillStyle(fs);
    }
}

class HealthPackGenerator extends PowerUpGenerator {
    constructor(x, y) {
        super(x, y, HealthPack, 10000, 1);
    }
}
