var express = require('express')
  , app = express()
  , http = require('http')
  , socketIo = require('socket.io')
  , Player = require('./Player').Player
  , Game = require('./Game').Game;

// start webserver on port 8080
var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(8080);
// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:8080");

var gameCount = 0;
var gameLimit = 10;
var games = [];

//REST API
app.get('/options', function (req, res) {
  console.log("getting options");
  var options = [];
  for (name in games) {

    options.push({
      name: name
      , number: games[name].getNumPlayers() - games[name].getCount()
    })
  }
  res.json(options)
});


// event-handler for new incoming connections
var setEventHandlers = function () {
  console.log("setEventHandlers");
  io.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(socket) {

  console.log("on connection");

  socket.on('createGame', createGame);

  socket.on('joinReq', joinRequest);
  
  //socket.on('ready', playerReady);

  // Not sure if we want this to handle play of all 5 cards in hand or make method handle for each 4 cards played (1 by each player)
  socket.on('playHand', guess);

  socket.on('disconnect', disconnect);

  socket.on('game_end', game_end);

}

function createGame(data) {
  console.log("create game " + data.info.createName);

  var isCreated = false;
  var nameTaken = false;
  var reason = "";

  for (name in games) {
    if (data.info.createName == name) {
      nameTaken = true;
      break;
    }
  }

  if (gameCount <= gameLimit && !nameTaken) {

    var newGame = new Game(data.info.createName, data.info.numberOfPlayers);

    newGame.addPlayer(new Player(0));

    games[data.info.createName] = newGame;

    this.gameName = data.info.createName;
    this.player = 0;

    isCreated = true;
  } else if (!nameTaken) {
    reason = "game limit reached";
    console.log(reason);
  } else {
    reason = "that name is taken";
    console.log(reason);
  }

  this.emit('joinReq', {
    status: isCreated
    , reason: reason
  });
}

function joinRequest(data) {
  console.log("join request " + data.name);

  game = games[data.name];

  if (game != undefined && game.isFull() == false) {
    this.emit('joinReq', {
      playing: true
      , id: game.getCount()
      , playerNum: game.getNumPlayers()
    });

    this.gameName = data.name;
    this.player = game.getCount();

    game.addPlayer(new Player(game.getCount()));

  } else {
    this.emit('joinReq', {
      playing: false
    , });
  }
}

// TODO: Decide if we need a ready function and if so uncomment line 50
function playerReady(data) {
  game = games[data.name];

  //check if valid game name
  if (game == undefined) {
    console.log("Invalid game name: " + data.name + " in playerReady");
  }

  if (data.id < game.getNumPlayers()) {
    console.log("Player " + data.id + " ready! " + data.coordinates.length + " tokens hidden");
    for (var i = 0; i < data.coordinates.length; i++) {
      var token = new Token(data.coordinates[i].lat, data.coordinates[i].lng);
      game.players[data.id].addToken(token);
    }
    waitingOn = game.incReady();
    if (waitingOn == 0) {
      this.broadcast.emit('turn', {
        name: data.name
        , turn: 0
      });
      this.emit('turn', {
        name: data.name
        , turn: 0
      });
    }
    this.broadcast.emit('waiting', {
      name: data.name
      , num: waitingOn
      , player: data.id
    });
    this.emit('waiting', {
      name: data.name
      , num: waitingOn
      , player: data.id
    });
  } else {
    console.log("Invalid player with ID: " + data.id + " tried to click ready button");
  }
}

function disconnect(data) {
  console.log("player disconnected");
  this.broadcast.emit('player_left', {
    name: this.gameName
    , player: this.player
    , info: "A player has disconnected"
  });
}

function game_end(data) {
  delete games[data.name];
  gameCount--;
}

// TODO: Implement some sort of playHand or playCard function. See lines 52 and 53

setEventHandlers();
