function Lightning(start, end, resolution){
	this.start = start;
	this.end = end;
	this.resolution = resolution||10;
	this.colour = "white";

	this.sub = [];

	this.draw=function(){
		if(this.sub.length===0){
			//draw this
			//ctx.beginPath();
			ctx.strokeStyle = this.colour;
			ctx.moveTo(this.start.x, this.start.y);
			ctx.lineTo(this.end.x, this.end.y);
			//ctx.stroke();
			//ctx.closePath();
		} else {
			this.sub.forEach(function(item){
				item.draw();
			})
		}
	}

	this.generate=function(){
		var length = this.start.sub(this.end).len()
		if(length>this.resolution){
			//pick a random point in between, split sub
			var dv = this.end.sub(this.start).mul(Math.random()*0.5+0.25);
			//console.log("dv", dv);
			var normal = dv.getNormalVector().getUnitVector().mul((Math.random()-0.5)*length*0.1);
			//console.log("normal", normal);
			var np = dv.add(normal).add(this.start);
			//console.log("np", np);
			//console.log(this.start.y, np.y, this.end.y);
			this.sub.push(new Lightning(this.start, np, resolution));
			this.sub.push(new Lightning(np, this.end, resolution));
			if(Math.random()>this.resolution/(length+1)+0.75){
				this.sub.push(new Lightning(this.start, dv.add(normal.mul(5)).add(this.start), this.resolution));
			}
		}
	}

	this.generate();
}
/*
var lightnings=[];
var lightningCount = 1;
var lightningInterval = 50;
var counter = 0;
var c,ctx;
var W,H;

function init(){
	c=document.getElementById("Canvas");
	ctx=c.getContext("2d");
	W=window.innerWidth;
	H=window.innerHeight;
	c.width=W;
	c.height=H;


	ctx.lineWidth = 4;
	ctx.globalCompositeOperation = "lighten";

	var y1 = H/8
	var y2 = H-y1;
	var p1 = V2(W/2,y1);
	var p2 = V2(W/2,y2);

	render();
}

function render(){
	counter++;
	ctx.globalAlpha = 1;
	ctx.clearRect(0, 0, W, H);
	ctx.fillRect(0,0,W,H);
	if(counter%lightningInterval===0){
		var y1 = H/8
		var y2 = H-y1;
		var p1 = V2(W/2,y1);
		var p2 = V2(W/2,y2);

		lightnings = [];
		for(var i=0;i<lightningCount;i++)
		lightnings.push(new Lightning(p1, p2.add(V2(W/8*(Math.random()-0.5), 0))));
	} else {
		ctx.globalAlpha = 1-(counter%lightningInterval)/lightningInterval;
	}

	ctx.beginPath();
	lightnings.forEach(function(item){item.draw()});
	ctx.stroke();
	ctx.closePath();
	ctx.strokeStyle="white";




	window.requestAnimationFrame(render);
}

function resizeHandler(event){
	W=window.innerWidth;
	H=window.innerHeight;
	c.width=W;
	c.height=H;
}

window.onload=init;
window.onresize=resizeHandler;
*/
