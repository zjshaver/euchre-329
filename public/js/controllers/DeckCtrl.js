angular.module('myApp')

.controller('DeckCtrl', function ($scope, $location, gameData) {

    angular.element(document).ready(function () {





    });

    $(function () {
        var cardDeck = $("#cardDeck").playingCards();
        cardDeck.spread();
    });
});