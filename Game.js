var cardLib = require('./public/js/lib/playingCards/playingCards.js');

var Game = function (gameName, numPlayers) {
    cardLib.playingCards.defaults.jokers = 0;
    var name = gameName
        , players = []
        , numOfPlayers = numPlayers
        , full = false
        , turn = 1
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
        , playerLed = 0
        , dealer = 0
        , hands = []
        , fc = null;

    // Getters and setters
    var getNumPlayers = function () {
        return numOfPlayers;
    };

    var getTurn = function () {
        return turn % numOfPlayers;
    };

    var getCount = function () {
        return playerCount;
    };

    var getName = function () {
        return name;
    };

    var isFull = function () {
        return full;
    };

    var addPlayer = function (player) {
        players.push(player);
        playerCount++;
        full = playerCount == numOfPlayers;
    };

    var getPlayer = function (id) {
      return players[id];
    }

    var nextTurn = function () {
        turn++;
    };

    var getTrump = function () {
        return trump;
    };

    var setTrump = function (suit, team) {
        trump = suit;
        trumpSetBy = team;
    };

    var whoSetTrump = function () {
        return trumpSetBy;
    };

    var getScore = function () {
        return "Team 1: " + pair1Score + " Team 2: " + pair2Score;
    };

    var team1Euchred = function () {
        team2Score += 2;
    };

    var team2Euchred = function () {
        team1Score += 2;
    };

    var team1Scores = function () {
        team1Score++;
    };

    var team2Scores = function () {
        team2Score++;
    };

    var getPlayerCount = function () {
        return playerCount;
    };

    var getBidRound = function () {
        return bidRound;
    };

    var dealHands = function () {
        for (var i = 0; i < 4; i++) {
            var hand = [];
            for (var j = 0; j < 5; j++) {
                hand.push(deck.draw());
            }
            hands.push(hand);
        }
    };

    var getHands = function () {
        return hands;
    };

    var flipCard = function () {
        fc = deck.draw();
    };

    var getFlipped = function () {
        return fc;
    };

    var getDealer = function () {
        return dealer;
    };

    var incDealer = function () {
        dealer = (dealer + 1) % 4;
    };

    var setRound = function (r) {
        bidRound = r;
    };

    var setTurn = function (t) {
        turn = t;
    };

    var getCardLed = function () {
        return cardLed;
    };

    var setCardLed = function (c) {
        cardLed = c;
    };

    var getCardsPlayed = function () {
        return cardsPlayed;
    };

    var cardPlayed = function (c) {
        cardsPlayed.push(c);
    };

    var clearCardsPlayed = function () {
        cardsPlayed = [];
    };

    var incTricks = function () {
        tricks++;
    };

    var getTricks = function () {
        return tricks;
    };



    // Define which variables and methods can be accessed
    return {
        getTurn: getTurn
        , getCount: getCount
        , getName: getName
        , addPlayer: addPlayer
        , getPlayer: getPlayer
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
        , setCardLed: setCardLed
        , getCardLed: getCardLed
        , deck: deck
        , getBidRound: getBidRound
        , getCardsPlayed: getCardsPlayed
        , incTricks: incTricks
        , playerLed: playerLed
        , dealHands: dealHands
        , getFlipped: getFlipped
        , getDealer: getDealer
        , incDealer: incDealer
        , setRound: setRound
        , setTurn: setTurn
        , cardPlayed: cardPlayed
        , clearCardsPlayed: clearCardsPlayed
        , getTricks: getTricks
        , flipCard: flipCard
        , getHands: getHands
    }
};

exports.Game = Game;
