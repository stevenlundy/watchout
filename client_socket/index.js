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
  highScore: 0,
  numEnemies: 20,
  enemiesCoords: []
};  


app.use('/',  express.static(__dirname + '/'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var enemyCoords = function() {
  board.enemiesCoords = []
  for (var i = 0; i < board.numEnemies; i++) {
    board.enemiesCoords.push({
      x: randomBetween(0, board.width),
      y: randomBetween(0, board.height)
    });
  }
};

var updateEnemies = function() {
  enemyCoords();
  io.emit('enemy update', board.enemiesCoords);
};
updateEnemies();
setInterval(updateEnemies, 1000);

io.on('connection', function(socket){
  io.emit('initialize', board);


});



http.listen(3000, function(){
  console.log('listening on *:3000');
});