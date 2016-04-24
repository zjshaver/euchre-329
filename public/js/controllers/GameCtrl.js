angular.module('myApp')

.controller('GameCtrl', function ($scope, $location, gameData) {

  var hand = [];

  var showHand = function (hand) {
    var e1 = $('#yourHand');
    e1.html('');
    for (var i = 0; i < hand.length; i++) {
      console.log(hand[i]);
      e1.append(hand[i].getHTML());
    }
  };

  playCard = function (card) {
    //TODO validate card choice and send to server
    console.log("playingCard");

    var res = (card.id).split(',');
    for (var i = 0; i < hand.length; i++) {
      if (hand[i].rank == res[0] && hand[i].suit == res[1]) {
        console.log(i);
        var temp = hand[i];
        for (var j = i; j < hand.length-1; j++) {
          hand[j] = hand[j+1];
        }
        hand[hand.length-1] = temp;
        hand.pop()
        break;
      }
    }
    showHand(hand);
    //TODO: Set up the following emit of turn
    /*socket.emit("turn", {
      name: $scope.gameName
      , round: 1
      , order: false
      , playerId: playerId
      , cardPlayed: null //CHANGE THIS
    });*/

  };

  angular.element(document).ready(function () {
    var socket = io.connect();

    var gameInfo = {};

    $scope.stats = [];
    $scope.gameName = "";
    var playerId = -1;

    $scope.status = {
      waiting: false
      , waitingOn: -1
    };
    $scope.yourturn = -1;
    $scope.won = -1;
    $scope.gameFull = false;
    $scope.ready = false;
    $scope.leavingPlayer = -1;
    $scope.bidding = 0;

    var turn = -1;

    //if game wasn't created or joined go to game menu
    if (gameData.getJoinName() == "" && !gameData.isCreated()) {
      $location.path('/');
    } else if (gameData.isCreated()) {
      gameInfo = gameData.getInfo();
      $scope.gameName = gameInfo.createName;

      //create game
      socket.emit('createGame', {
        info: gameInfo
      });

    } else {
      $scope.gameName = gameData.getJoinName();

      //request to join game
      socket.emit('joinReq', {
        name: gameData.getJoinName()
      });

    }

    $scope.playAgain = function () {
      console.log("playing again");
      $location.path('/');
    }

    // draw line received from server
    socket.on('joinReq', function (data) {
      console.log("req");
      if (data.status != undefined) {
        if (data.status) {
          console.log("successfully created game");
          playerId = 0;
          socket.emit("ready", {
            name: $scope.gameName
            , id: playerId
          });
          //gameInfo should already be set, just needed playerID
        } else {
          console.log("failed to create game");
          playerId = -1;
          $location.path('/');
          $.snackbar({
            content: "Failed to create game - " + data.reason
          });
        }
      } else if (data.playing) {
        console.log("playing");
        playerId = data.id;
        gameInfo.numberOfPlayers = data.playerNum;
        console.log(data);
        socket.emit("ready", {
          name: $scope.gameName
          , id: playerId
        });
      } else {
        playerId = -1;
        $scope.gameFull = true;
        console.log("This game is already full!");
      }

      $scope.$apply();
    });

    socket.on('turn', function (data) {
      if (data.name == $scope.gameName) {
        console.log("turn " + data.turn + " id " + playerId);
        turn = data.turn;

        if (data.trump != "none") {
          $scope.currentTrump = data.trump;
        } else {
          $scope.currentTrump = "";
        }

        // Display hand
        if (data.bidRound == 0) {
          console.log(data.hands);
          hand = [];
          for (var i = 0; i < data.hands[playerId].length; i++) {
            hand.push($.extend(new playingCards.card(), data.hands[playerId][i]));
          }
          console.log(hand);
          showHand(hand);
          var fc = $.extend(new playingCards.card(), data.flippedCard);
          showFC(fc);
        }

        if (turn == playerId) {
          $scope.yourturn = true;
          $scope.round = data.bidRound;
          if (data.bidRound == 0) {
            console.log("bidding");
            $scope.bidding = 1;
          } else {
            console.log("playing hand");
            $scope.bidding = 0;
            //Display play options
          }
        } else {
          $scope.yourturn = false;
        }
        $scope.$apply();
      }
    });

    socket.on('waiting', function (data) {
      if (data.name == $scope.gameName) {
        if (data.player == playerId) {
          $scope.status.waiting = true;
        }
        $scope.status.waitingOn = data.num;
        $scope.$apply();
      }
    });

    socket.on('player_left', function (data) {
      if (data.name == $scope.gameName) {
        $scope.won = 3;
        $scope.leavingPlayer = data.player;
        $scope.$apply();
        socket.emit('game_end', {
          name: $scope.gameName
        });
      }
    });

    /*var showHand = function (hand) {
      var e1 = $('#yourHand');
      e1.html('');
      for (var i = 0; i < hand.length; i++) {
        console.log(hand[i]);
        e1.append(hand[i].getHTML());
      }
    };*/

    var showFC = function (fc) {
      var e1 = $('#drawCard');
      e1.html('');
      console.log(fc);
      e1.append(fc.getHTML());
    };


    $scope.pass = function () {
      socket.emit("turn", {
        name: $scope.gameName
        , round: 0
        , order: false
        , playerId: playerId
      });
      $scope.bidding = 0;
    };

    $scope.order = function () {
      socket.emit("turn", {
        name: $scope.gameName
        , round: 0
        , order: true
        , playerId: playerId
      });
      $scope.bidding = 0;
    };

  });
});
