const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
let gameSocket = null;
const players = {};
/*
 * players id:socketId
 */

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/controller.html");
});

app.get("/game", function(req, res) {
  res.sendFile(__dirname + "/game.html");
});

app.get("/game.js", function(req, res) {
  res.sendFile(__dirname + "/game.js");
});

app.get("/js/:url", function(req, res) {
  res.sendFile(__dirname + "/js/" + req.params.url);
});

app.get("/css/:url", function(req, res) {
  res.sendFile(__dirname + "/css/" + req.params.url);
});

io.on("connection", function(socket) {
  socket.on("joystick", function(msg) {
    console.log("joystick: " + msg);

    if (gameSocket) {
      gameSocket.emit("joystick", msg);
    }
  });

  socket.on("button", function(msg) {
    // io.emit('chat message', msg);
    console.log("button: " + msg);

    if (gameSocket) {
      gameSocket.emit("button", msg);
    }
  });

  socket.on("gameInit", function(msg) {
    console.log("game session opened");
    gameSocket = socket;
    for (var i in Object.keys(players)) {
      gameSocket.emit("playerJoin", Object.keys(players)[i]);
    }
  });

  socket.on("clientNew", function(msg) {
    players[msg] = socket.id;
    console.log("player joining: " + msg);
    if (gameSocket) {
      gameSocket.emit("playerJoin", msg);
      socket.emit("joinSuccess");
    }
  });

  socket.on("clientRejoin", function(msg) {
    players[msg] = socket.id;
    console.log("player rejoining: " + msg);
    if (gameSocket) {
      gameSocket.emit("playerRejoin", msg);
      socket.emit("joinSuccess", "");
    }
  });
  // console.log("user connected");
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});
