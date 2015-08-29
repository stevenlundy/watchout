var randomBetween = function(min, max) {
  return Math.floor(Math.random()*(max-min) + min);
};
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');

var board = {
  width: 700,
  height: 500,
  maxPlayers: 4,
  numEnemies: 10,
  playerCoords: [],
  enemyCoords: []
};  


app.use('/',  express.static(__dirname + '/'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var enemyCoords = function() {
  board.enemyCoords = []
  for (var i = 0; i < board.numEnemies; i++) {
    board.enemyCoords.push({
      x: randomBetween(0, board.width),
      y: randomBetween(0, board.height)
    });
  }
};

var updateEnemies = function() {
  enemyCoords();
  io.emit('enemy update', board.enemyCoords);
};
var updatePlayers = function() {
  io.emit('player move', board.playerCoords);
}

updateEnemies();
setInterval(updateEnemies, 1000);
setInterval(updatePlayers, 50);
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


http.listen(3000, function(){
  console.log('listening on *:3000');
});