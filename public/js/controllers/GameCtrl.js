angular.module('myApp')

.controller('GameCtrl', function ($scope, $location, gameData) {

  angular.element(document).ready(function () {
    var socket = io.connect();

    var gameInfo = {};

    $scope.stats = [];
    var gameName = "";
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

    var turn = -1;

    //if game wasn't created or joined go to game menu
    if (gameData.getJoinName() == "" && !gameData.isCreated()) {
      $location.path('/');
    } else if (gameData.isCreated()) {
      gameInfo = gameData.getInfo();
      gameName = gameInfo.createName;

      //create game
      socket.emit('createGame', {
        info: gameInfo
      });

    } else {
      gameName = gameData.getJoinName();

      //request to join game
      socket.emit('joinReq', {
        name: gameData.getJoinName()
      });

    }

    $scope.playerReady = function () {
      console.log("ready click");
        socket.emit('ready', {
          id: playerId
          , name: gameName
        });

        $scope.ready = true;
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
      } else {
        playerId = -1;
        $scope.gameFull = true;
        console.log("This game is already full!");
      }

      $scope.$apply();
    });

    socket.on('turn', function (data) {
      if (data.name == gameName) {
        console.log("turn " + data.turn + " id " + playerId);
        turn = data.turn;
        if (turn == playerId) {
          $scope.yourturn = true;
        } else {
          $scope.yourturn = false;
        }
        $scope.$apply();
      }
    });

    socket.on('waiting', function (data) {
      if (data.name == gameName) {
        if (data.player == playerId) {
          $scope.status.waiting = true;
        }
        $scope.status.waitingOn = data.num;
        $scope.$apply();
      }
    });

    socket.on('player_left', function (data) {
      if (data.name == gameName) {
        $scope.won = 3;
        $scope.leavingPlayer = data.player;
        $scope.$apply();
        socket.emit('game_end', {
          name: gameName
        });
      }
    });
  });
});
