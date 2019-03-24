var W, H, ctx;
var line;
var ctrl = 0;
var linePos = [];
var lines = [];

var poly = new Circle(V(0, 0), 100)
function init() {
    var c = document.createElement("canvas");
    ctx = c.getContext("2d");
    document.body.appendChild(c);
    W = window.innerWidth;
    H = window.innerHeight;
    c.width = W;
    c.height = H;
    for (var i = 0; i < 10; i++) {
        lines.push(new Line(Vector.random(W, H), Vector.random(W, H)));
    }

    window.onmousemove = mouseMoveHandler

    render();
}

function render() {
    setFillStyle("black");
    ctx.fillRect(0, 0, W, H);

    setStrokeStyle("white");
    poly.render();

    for(var i in lines) {
        if(poly.hitTestLine(lines[i])) {
            setStrokeStyle("yellow");
        } else {
            setStrokeStyle("white");
        }
        lines[i].render();
    }
    window.requestAnimationFrame(render);
}

function mouseMoveHandler(event) {
    var mousePoint = V(event.clientX, event.clientY);
    poly.move(mousePoint.sub(poly.center));
}

function mouseDownHandler(event) {

}


window.onload = init;
