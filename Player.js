var Player = function (playerId) {
  var id = playerId
    , team = (playerId % 2) + 1;
    , cards = []
    , numberOfCards = 0
    , tricks = 0;

  // Getters and setters
  var getId = function () {
    return id;
  };
  
  var getTeam = function() {
    return team;
  };
  
  var receiveCard = function(card) {
    cards.push(card);
    numberOfCards++;
  };
  
  var playCard = function(card) {
    cards.splice(cards.indexOf(card),1);
    numberOfCards--;
  };
  
  var getNumCards = function() {
    return numberOfCards;
  };
  
  var winTrick = function() {
    tricks++;
  };
  
  var getTricks = function() {
    return tricks;
  };


  // Define which variables and methods can be accessed
  return {
    getId: getId
    , getTeam: getTeam
    , getLost: getLost
    , receiveCard: receiveCard
    , playCard: playCard
    , getNumCards: getNumCards
    , winTrick: winTrick
    , getTricks: getTricks
    , cards: cards
  }
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;
