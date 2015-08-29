var socket = io();
var isInitialized = false;

// start slingin' some d3 here.
var Enemy = function(x, y) {
  this.x = x;
  this.y = y;
  this.r = 10;
};
 
var Shuriken = function(x, y){
  Enemy.call(this, x, y);
  this.r = undefined;
  this.width = 30;
  this.height = 30;
  this.url = 'http://www.wpclipart.com/weapons/knife/throwing/Shuriken_T.png';
}

var Player = function() {
  this.x = window.board.width/2;
  this.y = window.board.height/2;
  this.r = 10;
  this.colliding = false;
};

socket.on('initialize', function(board){
  if (isInitialized){
    return;
  }

  window.board = {
    score: 0,
    collisions: 0,
    numPlayers: 1,
    players: [],
    enemies: []
  };

  extend(window.board, board);

  for (var i = 0; i < window.board.numEnemies; i++) {
    var x = board.enemiesCoords[i].x;
    var y = board.enemiesCoords[i].y;
    window.board.enemies.push(new Shuriken(x, y));
  }

  window.board.svg = d3.select('body').append('svg')
    .attr('width', window.board.width)
    .attr('height', window.board.height);

  updateEnemies();

  // for (var i = 0; i < window.board.numPlayers; i++) {
  //   window.board.players.push(new Player());
  // }
  // updatePlayers();
  
  isInitialized = true;
});

var resetScore = function(){
  if(window.board.score > window.board.highScore){
    window.board.highScore = window.board.score;
  }
  window.board.score = 0;
  window.board.collisions++;
  window.board.svg.transition().duration(250)
    .style('background-color', 'red')
    .transition().duration(250)
    .style('background-color', 'white');
  d3.select('.high span').text(Math.round(window.board.highScore));
  d3.select('.current span').text(Math.round(window.board.score));
  d3.select('.collisions span').text(window.board.collisions);
};

socket.on('enemy update', function(coords){
  for(var i = 0; i < window.board.enemies.length; i++){
    extend(window.board.enemies[i], coords[i]);
  }
  updateEnemies();
});

var updateEnemies = function(){
  // DATA JOIN
  var enemies = board.svg.selectAll('.enemy').data(board.enemies);

  // UPDATE
  enemies.transition().duration(1000)
    .attr('y', function(d) { 
      //d.y = randomBetween(1, window.board.height - d.height);
      return d.y;
    })
    .attr('x', function(d) { 
      //d.x = randomBetween(1, window.board.width - d.width);
      return d.x;
    });

  // ENTER
  enemies.enter().append('image')
    .attr('y', function(d) { return d.y })
    .attr('x', function(d) { return d.x })
    .attr('height', function(d) { return d.height })
    .attr('width', function(d) { return d.width })
    .attr('xlink:href', function(d) { return d.url })
    .attr('class', 'enemy');

  // ENTER + UPDATE

  // EXIT

  //setTimeout(updateEnemies, 1000);
};

var dragged = function(d) {
  
  if(d3.event.x < d.r){
    d.x = d.r;
  } else if (d3.event.x > window.board.width - d.r) {
    d.x = window.board.width - d.r;
  } else {
    d.x = d3.event.x
  }

  if(d3.event.y < d.r){
    d.y = d.r;
  } else if (d3.event.y > window.board.height - d.r) {
    d.y = window.board.height - d.r;
  } else {
    d.y = d3.event.y
  }

  d3.select(this)
    .attr('cx', d.x)
    .attr('cy', d.y);
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
    var bx = parseInt(d3.select(colliders[i]).attr('x')) + parseInt(d3.select(colliders[i]).attr('width'))/2;
    var by = parseInt(d3.select(colliders[i]).attr('y')) + parseInt(d3.select(colliders[i]).attr('height'))/2;
    var br = parseInt(d3.select(colliders[i]).attr('width'))/2;

    var dist = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
    if (dist < ar + br) {
      return true;
    }
  }

  return false;
};

var extend = function(obj) {
  var args = Array.prototype.slice.call(arguments, 1);
  args.forEach(function(argument){
    for(var key in argument){
      obj[key] = argument[key];
    }
  });
  return obj;
};
