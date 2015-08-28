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
  this.colliding = false;
};

var init = function(){
  window.board = {
    width: 700,
    height: 500,
    score: 0,
    highScore: 0,
    collisions: 0,
    numPlayers: 1,
    numEnemies: 2,
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

var resetScore = function(){
  if(window.board.score > window.board.highScore){
    window.board.highScore = window.board.score;
  }
  window.board.score = 0;
  window.board.collisions++;
  d3.select('.high span').text(Math.round(window.board.highScore));
  d3.select('.current span').text(Math.round(window.board.score));
  d3.select('.collisions span').text(window.board.collisions);
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

var dragged = function(d) {
  d3.select(this)
    .attr('cx', d.x = d3.event.x)
    .attr('cy', d.y = d3.event.y);
}
window.drag = d3.behavior.drag()
  // .on('dragstart', dragstarted)
  .on('drag', dragged);
  // .on('dragend', dragended)


var updatePlayers = function(){
  // DATA JOIN
  var players = board.svg.selectAll('.player').data(board.players);
  var enemies = board.svg.selectAll('.enemy');


  // UPDATE


  // ENTER
  players.enter().append('circle')
    .attr('cy', function(d) { return d.y })
    .attr('cx', function(d) { return d.x })
    .attr('r', function(d) { return d.r })
    .attr('fill', 'red')
    .attr('class', 'player')
    .call(window.drag);

  // ENTER + UPDATE

  // EXIT

  for (var i = 0; i < players[0].length; i++) {
    if(checkCollision(players[0][i], enemies[0])){
      if (!window.board.players[i].colliding) {
        console.log('YOU LOSE!!!!!');
        window.board.players[i].colliding = true;
        resetScore();
      }
    } else {
      window.board.players[i].colliding = false;
    }
  }
  window.board.score += 0.1;
  d3.select('.current span').text(Math.round(window.board.score));
  setTimeout(updatePlayers, 10);
};

var randomBetween = function(min, max) {
  return Math.floor(Math.random()*(max-min) + min);
};

var checkCollision = function(obj, colliders) {
  var ax = parseInt(d3.select(obj).attr('cx'));
  var ay = parseInt(d3.select(obj).attr('cy'));
  var ar = parseInt(d3.select(obj).attr('r'));

  for (var i = 0; i < colliders.length; i++) {
    var bx = parseInt(d3.select(colliders[i]).attr('cx'));
    var by = parseInt(d3.select(colliders[i]).attr('cy'));
    var br = parseInt(d3.select(colliders[i]).attr('r'));

    var dist = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
    if (dist < ar + br) {
      return true;
    }
  }

  return false;
};

init();