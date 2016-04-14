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
        , map: mapInfo
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
      if (placedTokens < gameInfo.numberOfTokens) {
        alert('You need to place ' + gameInfo.numberOfTokens + ' Tokens on the bottom map!')
      } else {
        var i = 0;
        while (i < mymarkers.length) {
          mymarkers[i].dragging.disable();
          i++;
        }
        socket.emit('ready', {
          id: playerId
          , coordinates: mycoordinates
          , name: gameName
        });

        $scope.ready = true;
      }
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

    socket.on('guessed', function (data) {
      if (data.name == gameName) {
        //console.log("guess by " + data.player + " " + data.distance + " miles from your closest token");

        //Determine which map the markers should be added to
        var mapToAddMarkersTo;
        data.player == playerId ? mapToAddMarkersTo = offenseMap : mapToAddMarkersTo = defenseMap;

        console.log("Add tokens to: " + mapToAddMarkersTo);

        if (data.hit) { //there was at least one hit

          console.log("HIT!");
          //Circle around found tokens
          L.circle(data.latlng, searchRadius, {
            opacity: .5
            , weight: 1
            , fillOpacity: 0.2
            , color: '#f44336'
          }).addTo(mapToAddMarkersTo);

          // Mark every found token with a red marker
          for (var i = 0; i < data.foundTokens.length; i++) {
            var hLatlng = L.latLng(data.foundTokens[i].lat, data.foundTokens[i].lng);

            //console.log("Hit lat long is: " + hLatlng);

            var h = L.marker(hLatlng, {
              icon: L.icon({
                iconUrl: 'img/marker-red.png'
                , iconSize: [25, 41], // size of the icon
                iconAnchor: [12, 40], // point of the icon which will correspond to marker's location
                popupAnchor: [2, -30]
              })
            });

            //Add popup description of the found token
            var tokenOwner = data.foundTokens[i].owner;
            var guesser = data.player;

            h.bindPopup("<b>" + ((tokenOwner == playerId) ? "Your " : "player" + tokenOwner + "'s ") + "</b>token found by <b>" + ((guesser == playerId) ? "you" : "player" + guesser) + "</b>");

            h.on('mouseover', function (e) {
              this.openPopup();
            });
            h.on('mouseout', function (e) {
              this.closePopup();
            });

            h.addTo(mapToAddMarkersTo);
          }

          var numHit = data.foundTokens.length;
          numHit == 1 ? $.snackbar({
            content: "TOKEN FOUND!"
          }) : $.snackbar({
            content: numHit + " TOKENS FOUND!"
          });

        } else {

          var g = L.marker(data.latlng);
          g.bindPopup("<b>Closest Token:</b><br>" + Math.round(data.distance * 100) / 100 + " mi.");

          g.on('mouseover', function (e) {
            this.openPopup();
          });
          g.on('mouseout', function (e) {
            this.closePopup();
          });

          g.addTo(mapToAddMarkersTo);

          $.snackbar({
            content: "Miss..."
          });
        }


        if (data.player == playerId) {
          if (data.game_status) {
            // Set turn so that you can't place any more markers on either map
            turn = -2;
            $scope.won = 1;
          }
        } else {
          if (data.game_status) {
            $scope.won = 0;
          }
        }
        console.log(data.stats);
        $scope.stats = data.stats;
        $scope.$apply();
      }
    });




    function setupMap() {

      console.log(mapInfo);

      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2VubmlzIiwiYSI6ImNpbTUwbmZ2ZjAxZzZ0a20zM3lpZzdtMWsifQ.4gt6lV5KwYEyzRXItJxHHQ', {
        maxZoom: mapInfo.maxZoom
        , minZoom: mapInfo.minZoom
        , id: 'mapbox.streets'
      , }).addTo(offenseMap);

      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2VubmlzIiwiYSI6ImNpbTUwbmZ2ZjAxZzZ0a20zM3lpZzdtMWsifQ.4gt6lV5KwYEyzRXItJxHHQ', {
        maxZoom: mapInfo.maxZoom
        , minZoom: mapInfo.minZoom
        , id: 'mapbox.streets'
      , }).addTo(defenseMap);

      offenseMap.setMaxBounds([
        [mapInfo.NElat, mapInfo.NElng]









        
        , [mapInfo.SWlat, mapInfo.SWlng]
      ]);

      defenseMap.setMaxBounds([
        [mapInfo.NElat, mapInfo.NElng]









        
        , [mapInfo.SWlat, mapInfo.SWlng]
      ]);

      offenseMap.setZoom(mapInfo.minZoom);
      defenseMap.setZoom(mapInfo.minZoom);


      //Search radius circle
      searchRadius = gameInfo.precision * 1609.34; //Convert from miles to meters

      var filterCircle = L.circle(L.latLng(mapInfo.NElat, mapInfo.NElng), 0, {
        opacity: 1
        , weight: 1
        , fillOpacity: 0.4
      }).addTo(offenseMap);


      offenseMap.on('mousemove', function (e) {
        filterCircle.setRadius(searchRadius);
        filterCircle.setLatLng(e.latlng);
      });

      offenseMap.on('mouseout', function (e) {
        filterCircle.setRadius(0);
      });

    }

  });

});
