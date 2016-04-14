angular.module('myApp')

.factory('gameData', function () {
  
  var service = {};
  
  var joinName = "";
  
  var created = false;
  
  var info = {
      createName: ""
      , numberOfTokens: 3
      , numberOfPlayers: 2
      , precision: 100
      , map: "USA"
  };

  service.setInfo = function (data) {
    created = true;
    info = data;
  }
  
  service.setJoin = function (name) {
    joinName = name;
  }
  
  service.getInfo = function () {
    return info;
  }
  
  service.getJoinName = function () {
    return joinName;
  }
  
  service.isCreated = function () {
    return created;
  }
  
  service.resetInfo = function () {
    created = false;
    joinName = "";
    info = {
      createName: ""
      , numberOfTokens: 3
      , numberOfPlayers: 2
      , precision: 100
      , map: ""
    };
    return info;
  }

  return service;

});