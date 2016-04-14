/**
 * Main AngularJS Web Application
 */
var app = angular.module('myApp', ['ngRoute']);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "pages/home.html"
            , controller: "HomeCtrl"
        })
        .when("/game", {
            templateUrl: "pages/game.html"
            , controller: "GameCtrl"
        })
        .when("/deck", {
            templateUrl: "pages/deck.html"
            , controller: "DeckCtrl"
        })
        .otherwise({
            redirectTo: "/"
        });
}]);