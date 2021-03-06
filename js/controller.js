/*
Controller compat layer
*/
class Controller {
  constructor() {
    this.inputs = {
      x: 0,
      y: 0,
      stickMagnitude: 0,
      stickAngle: 0,
      up: 0,
      down: 0,
      left: 0,
      right: 0,
      btn1: 0,
      btn2: 0,
      btn3: 0,
      btn4: 0
    };
  }

  getInput(name) {
    return this.inputs[name];
  }

  updateJoystick(msg) {
    var obj = JSON.parse(msg);
    this.inputs.x = Math.cos(obj.angle) * obj.magnitude;
    this.inputs.y = Math.sin(obj.angle) * obj.magnitude;
    this.inputs.stickMagnitude = obj.magnitude;
    this.inputs.stickAngle = obj.angle;
  }

  updateButton(msg) {
    var obj = JSON.parse(msg);
    this.inputs[obj.button] = obj.status;
  }
}
