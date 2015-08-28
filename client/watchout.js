// start slingin' some d3 here.
var Enemy = function(x, y) {
  this.x = x;
  this.y = y;
  this.r = 10;
};

var Player = function() {
  this.x = window.board.width/2;
  this.y = window.board.height/2;
  this.r = 10;
};

var init = function(){
  window.board = {
    width: 700,
    height: 500,
    numPlayers: 1,
    numEnemies: 20,
    enemies: [],
    players: []
  };  

  window.board.svg = d3.select('body').append('svg')
    .attr('width', window.board.width)
    .attr('height', window.board.height);

  for (var i = 0; i < window.board.numEnemies; i++) {
    var x = randomBetween(1, board.width);
    var y = randomBetween(1, board.height);
    window.board.enemies.push(new Enemy(x, y));
  }
  updateEnemies();

  for (var i = 0; i < window.board.numPlayers; i++) {
    window.board.players.push(new Player());
  }
  updatePlayers();
};

var updateEnemies = function(){
  // DATA JOIN
  var enemies = board.svg.selectAll('.enemy').data(board.enemies);

  // UPDATE
  enemies.transition().duration(1000)
    .attr('cy', function(d) { 
      d.y = randomBetween(1, window.board.height);
      return d.y;
    })
    .attr('cx', function(d) { 
      d.x = randomBetween(1, window.board.width);
      return d.x;
    });

  // ENTER
  enemies.enter().append('circle')
    .attr('cy', function(d) { return d.y })
    .attr('cx', function(d) { return d.x })
    .attr('r', function(d) { return d.r })
    .attr('class', 'enemy');

  // ENTER + UPDATE

  // EXIT

  setTimeout(updateEnemies, 1000);
};

var updatePlayers = function(){
  // DATA JOIN
  var players = board.svg.selectAll('.player').data(board.players);

  // UPDATE


  // ENTER
  players.enter().append('circle')
    .attr('cy', function(d) { return d.y })
    .attr('cx', function(d) { return d.x })
    .attr('r', function(d) { return d.r })
    .attr('fill', 'red')
    .attr('class', 'player');

  // ENTER + UPDATE

  // EXIT

  setTimeout(updatePlayers, 10);
};

var randomBetween = function(min, max) {
  return Math.floor(Math.random()*(max-min) + min);
};

init();