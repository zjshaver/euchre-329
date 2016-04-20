var cardLib = require('./public/js/lib/playingCards/playingCards.js');

var Game = function (gameName, numPlayers) {
  cardLib.playingCards.defaults.jokers = 0;
  var name = gameName
    , players = []
    , numOfPlayers = numPlayers
    , full = false
    , turn = 0
    , trump = "none"
    , trumpSetBy = 0
    , team1Score = 0
    , team2Score = 0
    , playerCount = 0
    , cardLed = null
    , deck = new cardLib.playingCards()
    , bidRound = 0
    , cardsPlayed = []
    , tricks = 0
    , playerLed = 0;
  
  // Getters and setters  
  var getNumPlayers = function() {
		return numOfPlayers;
	};

	var getTurn = function() {
		return turn % numOfPlayers;
	};
  
  var getCount = function() {
		return playerCount;
	};
  
  var getName = function() {
		return name;
	};
  
  var isFull = function() {
		return full;
	};

  var addPlayer = function (player) {
      players.push(player);
      playerCount++;
      full = playerCount == numOfPlayers;
  };
  
  var nextTurn = function() {
      turn++;
	};
	
  var getTrump = function() {
      return trump;
      };
      
  var setTrump = function (suit, team) {
      trump = suit;
      trumpSetBy = team;
      };
      
  var whoSetTrump = function() {
      return trumpSetBy;
      };
      
  var getScore = function() {
      return "Team 1: " + pair1Score + " Team 2: " + pair2Score;
      };
      
  var team1Euchred = function() {
      team2Score += 2;
      };
      
  var team2Euchred = function() {
      team1Score += 2;
      };
      
  var team1Scores = function() {
      team1Score++;
      };
      
  var team2Scores = function() {
      team2Score++;
      };

  var getPlayerCount = function() {
      return playerCount;
     };

  var getBidRound = function() {
      return bidRound;
     };

  var dealHand = function() {
      var hand = [];
      for(var i = 0; i < 5; i++){
        hand.push(deck.draw());
      }
      return hand;
    };

  var getFlipped = function() {
      return deck.draw();
    };
  

  // Define which variables and methods can be accessed
  return {
    getTurn: getTurn
    , getCount: getCount
    , getName: getName
    , addPlayer: addPlayer
    , isFull: isFull
    , players: players
    , getNumPlayers: getNumPlayers
    , nextTurn: nextTurn
    , getTrump: getTrump
    , setTrump: setTrump
    , whoSetTrump: whoSetTrump
    , getScore: getScore
    , team1Euchred: team1Euchred
    , team2Euchred: team2Euchred
    , team1Scores: team1Scores
    , team2Scores: team2Scores
    , getPlayerCount: getPlayerCount
    , cardLed: cardLed
    , deck: deck
    , getBidRound: getBidRound
    , cardsPlayed: cardsPlayed
    , tricks: tricks
    , playerLed: playerLed
    , dealHand: dealHand
    , getFlipped: getFlipped
  }
};

exports.Game = Game;
