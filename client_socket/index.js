// INITIALIZE SOCKET.IO
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');

app.use('/',  express.static(__dirname + '/'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// FIND RANDOM NUMBERS
var randomBetween = function(min, max) {
  return Math.floor(Math.random()*(max-min) + min);
};

// BOARD SETTINGS
var board = {
  width: 700,
  height: 500,
  maxPlayers: 4,
  numEnemies: 10,
  playerCoords: [],
  enemyCoords: []
};  

// GENERATE ENEMY COORDINATES
var enemyCoords = function() {
  board.enemyCoords = []
  for (var i = 0; i < board.numEnemies; i++) {
    board.enemyCoords.push({
      x: randomBetween(0, board.width),
      y: randomBetween(0, board.height)
    });
  }
};

// SEND ENEMY INFO
var updateEnemies = function() {
  enemyCoords();
  io.emit('enemy update', board.enemyCoords);
};
updateEnemies();
setInterval(updateEnemies, 1000);

// SEND PLAYER INFO
var updatePlayers = function() {
  io.emit('player move', board.playerCoords);
}
setInterval(updatePlayers, 50);

// EVENT LISTENERS
io.on('connection', function(socket){
  io.emit('initialize', board);
  socket.on('new player', function(playerCoords){
    board.playerCoords = playerCoords;
    io.emit('new player', board.playerCoords);
  });
  socket.on('player move', function(playerCoords){
    board.playerCoords = playerCoords;
  });
  socket.on('collision', function(player){
    io.emit('collision', player);
  })
});

// START SERVER
http.listen(3000, function(){
  console.log('listening on *:3000');
});