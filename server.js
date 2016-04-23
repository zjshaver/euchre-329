var express = require('express')
    , app = express()
    , http = require('http')
    , socketIo = require('socket.io')
    , Player = require('./Player').Player
    , Game = require('./Game').Game
    , cardLib = require('./public/js/lib/playingCards/playingCards.js');

// start webserver on port 8080
var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(8080);
// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:8080");

var games = [];


//REST API
app.get('/options', function (req, res) {
    console.log("getting options");
    var options = [];
    for (name in games) {

        options.push({
            name: name
            , number: games[name].getNumPlayers() - games[name].getCount()
        })
    }
    res.json(options)
});


// event-handler for new incoming connections
var setEventHandlers = function () {
    console.log("setEventHandlers");
    io.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(socket) {

    console.log("on connection");

    socket.on('createGame', createGame);

    socket.on('joinReq', joinRequest);

    socket.on('turn', turn);

    socket.on("ready", playerReady);

    socket.on('disconnect', disconnect);

    socket.on('game_end', game_end);

}

function createGame(data) {
    console.log("create game " + data.info.createName);

    var isCreated = false;
    var nameTaken = false;
    var reason = "";

    for (name in games) {
        if (data.info.createName == name) {
            nameTaken = true;
            break;
        }
    }

    if (!nameTaken) {

        var newGame = new Game(data.info.createName, 4);

        newGame.addPlayer(new Player(0));

        games[data.info.createName] = newGame;

        this.gameName = data.info.createName;
        this.player = 0;

        isCreated = true;
    } else if (!nameTaken) {
        reason = "game limit reached";
        console.log(reason);
    } else {
        reason = "that name is taken";
        console.log(reason);
    }

    this.emit('joinReq', {
        status: isCreated
        , reason: reason
    });
}

function joinRequest(data) {
    console.log("join request " + data.name);

    game = games[data.name];

    if (game != undefined && game.isFull() == false) {
        this.emit('joinReq', {
            playing: true
            , id: game.getCount()
            , playerNum: game.getNumPlayers()
        });

        this.gameName = data.name;
        this.player = game.getCount();

        game.addPlayer(new Player(game.getCount()));

    } else {
        this.emit('joinReq', {
            playing: false
        , });
    }
}



// TODO: Decide if we need a ready function and if so uncomment line 50
function playerReady(data) {
    game = games[data.name];
    console.log(data);
    //check if valid game name
    if (game == undefined) {
        console.log("Invalid game name: " + data.name + " in playerReady");
    }

    if (data.id < game.getNumPlayers()) {
        numPlayers = game.getPlayerCount();
        if (numPlayers == 4) {

            game.dealHands();
            game.flipCard();

            this.broadcast.emit('turn', {
                name: game.getName()
                , turn: game.getTurn()
                , bidRound: game.getBidRound()
                , hands: game.getHands()
                , flippedCard: game.getFlipped()
            });

            this.emit('turn', {
                name: game.getName()
                , turn: game.getTurn()
                , bidRound: game.getBidRound()
                , hands: game.getHands()
                , flippedCard: game.getFlipped()
            });
        }

        this.broadcast.emit('waiting', {
            name: data.name
            , num: 4 - numPlayers
            , player: data.id
        });
        this.emit('waiting', {
            name: data.name
            , num: 4 - numPlayers
            , player: data.id
        });
    } else {
        console.log("Invalid player with ID: " + data.id + " tried to click ready button");
    }
}

function turn(data) {
    game = games[data.name];
    if (data.round == 0) {
        if (data.order == true) {
            game.setTrump(game.getFlipped().suitString, data.playerId % 2);
            game.setRound(1);
            game.setTurn(game.getDealer());
        } else {
            if (game.getTurn() % 4 == game.getDealer()) {
                //dealer passed the deal
                game.incDealer();
                game.dealHands();
                game.flipCard();
                game.nextTurn();
            } else {
                //Pass and not dealer -- do nothing
            }
        }
    } else if (data.round == 1) {
        game.playCard(data.cardPlayed);
        if (game.getCardsPlayed().length == 1) {
            game.setCardLed(data.cardPlayed);
        }
        if (game.getCardsPlayed().length == 4) {
            var cardsPlayed = game.getCardsPlayed();
            var topCard = cardsPlayed[0];
            for (var i = 1; i < 4; i++) {
                topCard = compareCard(topCard, cardsPlayed[i], game);
            }
            console.log(topCard);
            game.incTricks();
            //find owner of top card

            if (game.getTricks() == 5) {
                //end of hand
                //do scoring
                //pass deal
                //check if game over
            }
        }
    } else {
        //room for expansion if we add a second round of bidding
        console.log("An error occured");
    }
    game.nextTurn();
    this.broadcast.emit('turn', {
        name: game.getName()
        , turn: game.getTurn()
        , bidRound: game.getBidRound()
        , hands: game.getHands()
        , flippedCard: game.getFlipped()
        , trump: game.getTrump()
    });
    this.emit('turn', {
        name: game.getName()
        , turn: game.getTurn()
        , bidRound: game.getBidRound()
        , hands: game.getHands()
        , flippedCard: game.getFlipped()
        , trump: game.getTrump()
    });
}

function disconnect(data) {
    console.log("player disconnected");
    this.broadcast.emit('player_left', {
        name: this.gameName
        , player: this.player
        , info: "A player has disconnected"
    });
}

function game_end(data) {
    delete games[data.name];
}

function compareCard(top, compareTo, game) {
    //return the highest value of the two cards
    switch (game.getTrump()) {
    case "S":
        if (top.suit == "S" || (top.rank == "J" && top.suit == "C")) {
            if (compareTo == "S" || (compareTo.rank == "J" && compareTo.suit == "C")) {
                if ((top.rank == "J" && top.suit == "S")) {
                    //top is right bower
                    return top;
                } else if ((top.rank == "J" && top.suit == "C")) {
                    if ((compareTo.rank == "J" && compareTo.suit == "S")) {
                        //top is left bower other is right bower
                        return compareTo;
                    } else {
                        //top is left bower other is not right bower
                        return top;
                    }
                } else {
                    if (compareTo.rank == "J") {
                        //top is trump but not a bower other is a bower
                        return compareTo;
                    } else {
                        if (cardLib.playingCards.compareRank(top, compareTo) > 0) {
                            //both are trump neither are bowers and top is bigger
                            return top;
                        } else {
                            //both are trump neither are bowers and other is bigger
                            return compareTo;
                        }
                    }
                }
            } else {
                //top is trump other is not
                return top;
            }
        } else {
            if (compareTo == "S" || (compareTo.rank == "J" && compareTo.suit == "C")) {
                //other is trump top is not
                return compareTo;
            } else {
                if (compareTo.suit == top.suit) {
                    if (cardLib.playingCards.compareRank(top, compareTo) > 0) {
                        //neither are trump and top is bigger
                        return top;
                    } else {
                        //neither are trump and other is bigger
                        return compareTo;
                    }
                } else {
                    //neither are trump and other didn't follow suit
                    return top;
                }
            }
        }
        break;
    case "D":
        if (top.suit == "D" || (top.rank == "J" && top.suit == "H")) {
            if (compareTo == "D" || (compareTo.rank == "J" && compareTo.suit == "H")) {
                if ((top.rank == "J" && top.suit == "D")) {
                    //top is right bower
                    return top;
                } else if ((top.rank == "J" && top.suit == "H")) {
                    if ((compareTo.rank == "J" && compareTo.suit == "D")) {
                        //top is left bower other is right bower
                        return compareTo;
                    } else {
                        //top is left bower other is not right bower
                        return top;
                    }
                } else {
                    if (compareTo.rank == "J") {
                        //top is trump but not a bower other is a bower
                        return compareTo;
                    } else {
                        if (cardLib.playingCards.compareRank(top, compareTo) > 0) {
                            //both are trump neither are bowers and top is bigger
                            return top;
                        } else {
                            //both are trump neither are bowers and other is bigger
                            return compareTo;
                        }
                    }
                }
            } else {
                //top is trump other is not
                return top;
            }
        } else {
            if (compareTo == "D" || (compareTo.rank == "J" && compareTo.suit == "H")) {
                //other is trump top is not
                return compareTo;
            } else {
                if (compareTo.suit == top.suit) {
                    if (cardLib.playingCards.compareRank(top, compareTo) > 0) {
                        //neither are trump and top is bigger
                        return top;
                    } else {
                        //neither are trump and other is bigger
                        return compareTo;
                    }
                } else {
                    //neither are trump and other didn't follow suit
                    return top;
                }
            }
        }
        break;
    case "H":
        if (top.suit == "H" || (top.rank == "J" && top.suit == "D")) {
            if (compareTo == "H" || (compareTo.rank == "J" && compareTo.suit == "D")) {
                if ((top.rank == "J" && top.suit == "H")) {
                    //top is right bower
                    return top;
                } else if ((top.rank == "J" && top.suit == "D")) {
                    if ((compareTo.rank == "J" && compareTo.suit == "H")) {
                        //top is left bower other is right bower
                        return compareTo;
                    } else {
                        //top is left bower other is not right bower
                        return top;
                    }
                } else {
                    if (compareTo.rank == "J") {
                        //top is trump but not a bower other is a bower
                        return compareTo;
                    } else {
                        if (cardLib.playingCards.compareRank(top, compareTo) > 0) {
                            //both are trump neither are bowers and top is bigger
                            return top;
                        } else {
                            //both are trump neither are bowers and other is bigger
                            return compareTo;
                        }
                    }
                }
            } else {
                //top is trump other is not
                return top;
            }
        } else {
            if (compareTo == "H" || (compareTo.rank == "J" && compareTo.suit == "D")) {
                //other is trump top is not
                return compareTo;
            } else {
                if (compareTo.suit == top.suit) {
                    if (cardLib.playingCards.compareRank(top, compareTo) > 0) {
                        //neither are trump and top is bigger
                        return top;
                    } else {
                        //neither are trump and other is bigger
                        return compareTo;
                    }
                } else {
                    //neither are trump and other didn't follow suit
                    return top;
                }
            }
        }
        break;
    case "C":
        if (top.suit == "C" || (top.rank == "J" && top.suit == "S")) {
            if (compareTo == "C" || (compareTo.rank == "J" && compareTo.suit == "S")) {
                if ((top.rank == "J" && top.suit == "C")) {
                    //top is right bower
                    return top;
                } else if ((top.rank == "J" && top.suit == "S")) {
                    if ((compareTo.rank == "J" && compareTo.suit == "C")) {
                        //top is left bower other is right bower
                        return compareTo;
                    } else {
                        //top is left bower other is not right bower
                        return top;
                    }
                } else {
                    if (compareTo.rank == "J") {
                        //top is trump but not a bower other is a bower
                        return compareTo;
                    } else {
                        if (cardLib.playingCards.compareRank(top, compareTo) > 0) {
                            //both are trump neither are bowers and top is bigger
                            return top;
                        } else {
                            //both are trump neither are bowers and other is bigger
                            return compareTo;
                        }
                    }
                }
            } else {
                //top is trump other is not
                return top;
            }
        } else {
            if (compareTo == "C" || (compareTo.rank == "J" && compareTo.suit == "S")) {
                //other is trump top is not
                return compareTo;
            } else {
                if (compareTo.suit == top.suit) {
                    if (cardLib.playingCards.compareRank(top, compareTo) > 0) {
                        //neither are trump and top is bigger
                        return top;
                    } else {
                        //neither are trump and other is bigger
                        return compareTo;
                    }
                } else {
                    //neither are trump and other didn't follow suit
                    return top;
                }
            }
        }
        break;
    }
}

setEventHandlers();
