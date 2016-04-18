angular.module('myApp')

.controller('HomeCtrl', function ($scope, $location, $http, gameData) {

  $scope.joinData = {
    options: {}
    , joinName: ""
  }

  gameData.resetInfo();
  $scope.createData = gameData.getInfo();

  $http.get('/options')
        .success(function(data) {
            $scope.joinData.options = data;
        })
        .error(function(data) {
            console.log('Error getting joinable game options from server');
        });


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
    $location.path( '/game' );
  }

});
