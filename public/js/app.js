/**
 * Main AngularJS Web Application
 */
var app = angular.module('myApp', ['ngRoute']);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    .when("/", {templateUrl: "pages/home.html", controller: "HomeCtrl"})
    .when("/game", {templateUrl: "pages/game.html", controller: "GameCtrl"})
    .otherwise({redirectTo: "/"});
}]);


