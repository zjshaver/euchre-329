angular.module('myApp')

.controller('HomeCtrl', function ($scope, $location, $http, gameData, mapData) {

  $scope.joinData = {
    options: {}
    , joinName: ""
  }
  
  gameData.resetInfo();
  $scope.createData = gameData.getInfo();

  var customMap = L.map('customMap').setView([38, -100], 4);
  
  $http.get('/options')
        .success(function(data) {
            $scope.joinData.options = data;
        })
        .error(function(data) {
            console.log('Error getting joinable game options from server');
        });

  //Sets appropriate default precision based on
  $scope.changeMapSelection = function (map) {
      map == "USA" ? $scope.createData.precision = 100 : $scope.createData.precision = 1;
      $scope.vis = false;
      if (map == "Custom") {
        $scope.createData.precision = 5;
        setupHomeMap();
      }
  }

  function setupHomeMap() {

    /*var NElat = 50;
    var NElng = -66;
    var SWlat = 26;
    var SWlng = -124;*/
    var minZoom = 2;
    var maxZoom = 18;

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2VubmlzIiwiYSI6ImNpbTUwbmZ2ZjAxZzZ0a20zM3lpZzdtMWsifQ.4gt6lV5KwYEyzRXItJxHHQ', {
      maxZoom: maxZoom
      , minZoom: minZoom
      , id: 'mapbox.streets'
    , }).addTo(customMap);

    /*customMap.setMaxBounds([
      [NElat, NElng]
          , [SWlat, SWlng]
    ]);*/

    $scope.vis = true;
  }

  $scope.getGameOptions = function(){
    $http.get('/options')
        .success(function(data) {
            $scope.joinData.options = data;
        })
        .error(function(data) {
            console.log('Error getting joinable game options from server');
        });
  }
  

  $scope.joinGame = function () {
    gameData.setJoin($scope.joinData.joinName);
    $location.path( '/game' );
  }

  $scope.createGame = function () {
    gameData.setInfo($scope.createData);
    mapData.setCustom(customMap);
    $location.path( '/game' );
  }

});
