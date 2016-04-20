angular.module('myApp')

.controller('DeckCtrl', function ($scope, $location, gameData) {

    angular.element(document).ready(function () {





    });

    $(function () {
  playingCards.defaults.ranks = {
            "9": "Nine",
            "10": "Ten",
            "J": "Jack",
            "Q": "Queen",
            "K": "King",
            "A": "Ace"
        };
  playingCards.defaults.jokers = 0;
        var cardDeck = $("#cardDeck").playingCards();
        cardDeck.spread();
    });
});
