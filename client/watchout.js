// start slingin' some d3 here.


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
    window.board.enemies.push(new Enemy());
  }
  for (var i = 0; i < window.board.numPlayers; i++) {
    window.board.players.push(new Player());
  }
};