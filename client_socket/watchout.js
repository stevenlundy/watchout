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

var Player = function(x, y, local, hue) {
  this.x = x;
  this.y = y;
  this.r = 10;
  this.colliding = false;
  this.local = local;
  this.hue = hue;
};

socket.on('initialize', function(board){
  if (isInitialized){
    return;
  }

  window.board = {
    highScore: 0,
    score: 0,
    collisions: 0,
    numPlayers: 1,
    players: [],
    enemies: []
  };

  extend(window.board, board);

  for (var i = 0; i < window.board.numEnemies; i++) {
    var x = board.enemyCoords[i].x;
    var y = board.enemyCoords[i].y;
    window.board.enemies.push(new Shuriken(x, y));
  }

  window.board.svg = d3.select('body').append('svg')
    .attr('width', window.board.width)
    .attr('height', window.board.height);

  updateEnemies();

  var steps = d3.scale.ordinal()
   .domain(d3.range(window.board.maxPlayers))
   .rangePoints([0, window.board.width], 1)
  window.color = d3.scale.category10();

  for (var i = 0; i < board.playerCoords.length; i++) {
    var x = board.playerCoords[i].x;
    var y = board.playerCoords[i].y;
    var hue = color(i);
    window.board.players.push(new Player(x, y, false, hue));
  };

  if(window.board.players.length < window.board.maxPlayers){
    var x = steps(i);
    var y = board.height/2;
    var hue = color(i)
    window.board.players.push(new Player(x, y, true, hue));

    socket.emit('new player', getCoords(window.board.players));
  }
  updatePlayers();
  d3.select('.local').call(window.drag);
  
  isInitialized = true;
});

socket.on('new player', function(playerCoords){
  window.board.score = 0;
  window.board.collisions = 0;
  if(playerCoords.length > window.board.players.length){
    var i = window.board.players.length;
    var x = playerCoords[i].x;
    var y = playerCoords[i].y;
    var hue = color(i);
    window.board.players.push(new Player(x, y, false, hue));
  }
  updatePlayers(); //remove later
});

socket.on('collision', function(player){
  if(window.board.score > window.board.highScore){
    window.board.highScore = window.board.score;
  }
  window.board.score = 0;
  window.board.collisions++;
  window.board.svg.transition().duration(250)
    .style('background-color', window.board.players[player].hue)
    .transition().duration(250)
    .style('background-color', 'white');
  d3.select('.high span').text(Math.round(window.board.highScore));
  d3.select('.current span').text(Math.round(window.board.score));
  d3.select('.collisions span').text(window.board.collisions);
});

socket.on('enemy update', function(coords){
  for(var i = 0; i < window.board.enemies.length; i++){
    extend(window.board.enemies[i], coords[i]);
  }
  updateEnemies();
});

socket.on('player move', function(playerCoords){
  for (var i = 0; i < window.board.players.length; i++) {
    if(window.board.players[i].local === false){
      extend(window.board.players[i], playerCoords[i]);
    }
  };
  updatePlayers();
})

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

  socket.emit('player move', getCoords(board.players));
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
  players.filter(function(d){ return !d.local })
    .transition().duration(50)
    .attr('cy', function(d) { return d.y })
    .attr('cx', function(d) { return d.x });

  // ENTER
  players.enter().append('circle')
    .attr('cy', function(d) { return d.y })
    .attr('cx', function(d) { return d.x })
    .attr('r', function(d) { return d.r })
    .attr('fill', function(d) { return d.hue; })
    .attr('class', function(d) {
      if(d.local){
        return 'player local';
      } 
      return 'player'
    })
    //.call(window.drag);

  // ENTER + UPDATE

  // EXIT

  for (var i = 0; i < players[0].length; i++) {
    if(window.board.players[i].local){
      if(checkCollision(players[0][i], enemies[0])){
        if (!window.board.players[i].colliding) {
          console.log('YOU LOSE!!!!!');
          window.board.players[i].colliding = true;
          // resetScore();
          socket.emit('collision', i);
        }
      } else {
        window.board.players[i].colliding = false;
      }
    }
  }
};
var updateScore = function(){
  window.board.score++;
  d3.select('.current span').text(window.board.score);
}
setInterval(updateScore, 100);

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

var getCoords = function(objects) {
  var objCoords = [];
  for (var i = 0; i < objects.length; i++) {
    var coords = {
      x: objects[i].x,
      y: objects[i].y
    };
    objCoords.push(coords);
  }
  return objCoords;
}

var extend = function(obj) {
  var args = Array.prototype.slice.call(arguments, 1);
  args.forEach(function(argument){
    for(var key in argument){
      obj[key] = argument[key];
    }
  });
  return obj;
};
