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