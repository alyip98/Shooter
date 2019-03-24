var W, H, ctx;
var line;
var ctrl = 0;
var linePos = [];
var lines = [];
var fpsTracker

var walls = [];

var controlling = false;

var thing = new Path(V(0, 0), Vector.random().sub(Vector.random().mul(0.5)).mul(100), 100)

function init() {
    var c = document.createElement("canvas");
    ctx = c.getContext("2d");
    document.body.appendChild(c);
    W = window.innerWidth;
    H = window.innerHeight;
    c.width = W;
    c.height = H;
    for (var i = 0; i < 1; i++) {
        var c = Vector.random(W, H);
        // var hv = V(100, 0);
        // var vv = V(0, 100);
        /*walls.push(new Wall(
            c.sub(hv).sub(vv),
            c.add(hv).sub(vv),
            c.add(hv).add(vv),
            c.sub(hv).add(vv)))*/
        // lines.push(new Line(Vector.random(W, H), Vector.random(W, H)));
    }

    var size = 500;
    walls.push(new NSidedWall(W/2, H/2, 200, 12))
    // walls.push(new SquareWall(W / 2, H / 2, 100, 100));

    window.onmousedown = e => controlling = true;
    window.onmouseup = e => controlling = false;
    window.onmousemove = mouseMoveHandler

    fpsTracker = new FPSTracker()
    render();
}

function render() {
    setFillStyle("black");
    ctx.fillRect(0, 0, W, H);

    setStrokeStyle("white");
    thing.render();
    fpsTracker.render()

    for (var i in walls) {
        var hitResult = walls[i].hitTestPath(thing);
        if (hitResult) {
            // console.log(hitSide);
            setFillStyle("white");
            var size = 4;
            var arr = hitResult.hits;
            arr.sort()
            for (var j in hitResult.hits) {
                var hitSide = hitResult.hits[j];
                // setStrokeStyle("green")
                setFillStyle("white")
                ctx.font = "20px sans-serif"
                // ctx.fillText(hitSide.ua.toFixed(2) + ":" + hitSide.ub.toFixed(2), hitSide.point1.x, hitSide.point1.y);
                var suggested = hitSide.point2;
                setStrokeStyle("yellow")
                console.log(hitSide)
                ctx.beginPath();
                ctx.arc(suggested.x, suggested.y, thing.size, 0, Math.PI * 2);
                ctx.fillText(hitSide.case + ": " + hitSide.message, suggested.x, suggested.y)
                ctx.stroke();
                ctx.closePath();

                setFillStyle("green")
                ctx.fillRect(hitSide.point1.x - size / 2, hitSide.point1.y - size / 2, size, size);
                setFillStyle("blue")
                ctx.fillRect(hitSide.point2.x - size / 2, hitSide.point2.y - size / 2, size, size);
            }
            setStrokeStyle("yellow");
        } else {
            setStrokeStyle("white");
        }
        walls[i].render();
    }
    window.requestAnimationFrame(render);
}

function mouseMoveHandler(event) {
    var mousePoint = V(event.clientX, event.clientY);
    if (controlling) {
        thing.start = mousePoint
    } else {
        thing.move(mousePoint.sub(thing.start))
    }
}

function mouseDownHandler(event) {

}


window.onload = init;
