/*
util.js - utility functions
*/

function cdfunc(func, cd) {
	var f = function(...args) {
		now = Date.now()
		if (now > f.lastTime + cd) {
			f.lastTime = now
			return func.call(this, ...args)
		}
		return
	}
	f.id = Math.floor(Math.random() * 1000)
	f.lastTime = 0
	return f
}

function setStrokeStyle(style) {
	var tmp = ctx.strokeStyle
	ctx.strokeStyle = style;
	return tmp;
}

function setFillStyle(style) {
	var tmp = ctx.fillStyle
	ctx.fillStyle = style;
	return tmp;
}

function setLineWidth(width) {
	var tmp = ctx.lineWidth
	ctx.lineWidth = width;
	return tmp;
}
