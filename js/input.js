var keys = {
	"up": false,
	"down": false,
	"left": false,
	"right": false,
	"space": false,
	"f": false,
	"v": false,
	"mouse": false,
	"spawn": false
}

var keyDefs = {
	"w": "up",
	"ArrowUp": "up",
	"a": "left",
	"ArrowLeft": "left",
	"s": "down",
	"ArrowDown": "down",
	"d": "right",
	"ArrowRight": "right",
	"f": "f",
	"v": "v",
	"e": "spawn",
	"p": "p"
}

function getKeyDefs(key) {
	if (keyDefs[key])
		return keyDefs[key]
	return key
}

function keyDownHandler(event) {
	keys[getKeyDefs(event.key)] = true
}

function keyUpHandler(event) {
	keys[getKeyDefs(event.key)] = false
		/*
		if(keyDefs[event.key])
		{
			keys[keyDefs[event.key]]=false
		}*/
}

function mouseMoveHandler(event) {
	mx = event.clientX
	my = event.clientY
}

function mouseDownHandler(event) {
	keys["mouse"] = true
}

function mouseUpHandler(event) {
	keys["mouse"] = false
}
