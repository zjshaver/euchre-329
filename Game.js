var Game = function (gameName, numPlayers) {
  var name = gameName
    , players = []
    , numOfPlayers = numPlayers
    , full = false
    , turn = 0
    , trump = "none"
    , trumpSetBy = 0
    , team1Score = 0
    , team2Score = 0
    , playerCount = 0;
  
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
      full = playerCount == numOfPlayers
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
  }
};

exports.Game = Game;
