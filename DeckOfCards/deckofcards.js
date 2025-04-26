//For card game app, we are setting up web sockets for 2 way communicaiton.
//WSS prototol, server in Deno has enable this and setup handlers for activities
//WSS protocol client here has enabled this and setup handlers for activities
//Activities include: connectiong, sending, receieve, closing and error handling
//
//Things you can do with a deck of cards:
//- X Shuffle the deck (shuffle)
//- X Get palyers
//- X Start Game (start-game)
//- X Deal a card to players..face up or face down (deale-all-up, deal-all-down, deal-one-up, deal-one-down)
//- X Move deal pointer one more (next-player)
//- X Play a card on the table...face up or face down (table-play-up, table-play-down)
//
//Things you can do as a player with cards:
//- Look at cards 
//- Hide so cant be seen (tap to see)
//- Play a card on the table, face up or face down (play-card-up, play-card-down)
//  
//Make like cards in your hand...tap to see/hide, drag to play face up or down, check/pass to other player, fold
//- "table" where you setuff plaid - like TV or common screen, ipad - so a "table" veiw who is not a player
//    - Optionally with no table view, show cards in hand
//- Dealer has controls, others dont...pass the dealer, they get controls

var cardappButtonReady = false;
var socket = null;
var myName = "";
var cardCount = 0;
var tableCardCount = 0;
var myPlayerCards = [];
var myTableCards = [];
var handCount = 0;
var cardCover = "card-cover-blue.png";

if ('serviceWorker' in navigator) {
    window.addEventListener('load' , () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('Service Worker registered with scope:' , registration.scope);
        }).catch(error => {
            console.log('Service Worker registration failed:' , error);
        });
    });
}

const urlParams = new URLSearchParams(window.location.search);
myName = urlParams.get('name');
if (!myName) {
    myName = "Nobody";
    document.getElementById('cardbutton').innerHTML = document.getElementById('cardbutton').innerHTML.replace("_WELCOMEMESSAGE_", "Hello, Stranger");
    document.getElementById('cardbutton').innerHTML = document.getElementById('cardbutton').innerHTML.replace("_WELCOMEINSTRUCTIONS_", "Nothing to see here...");
}
else {
    document.getElementById('cardbutton').innerHTML = document.getElementById('cardbutton').innerHTML.replace("_WELCOMEMESSAGE_", "Hello " + myName + ". Would you like to play a game?");
    document.getElementById('cardbutton').innerHTML = document.getElementById('cardbutton').innerHTML.replace("_WELCOMEINSTRUCTIONS_", "Touch the Deck to Play");

    document.getElementById('cardgamestart').addEventListener('click', async () => {
        document.getElementById('playerName').innerHTML = document.getElementById('playerName').innerHTML.replace("_NAME_", myName);
        runTheCardGame();
    });
}

document.getElementById('status').innerHTML = "v2025.04.19.04";

//***************************
//This handle all of the card game app presentation and logic
//***************************
function runTheCardGame() {

    document.getElementById('cardbutton').style.display = "none";
    document.getElementById('cardapp').style.display = "block";

    //start web socket, add listeners for the events we want
    socket = new WebSocket('wss://i-saw-your-cards.deno.dev?name=' + myName);

    //When it connects successfully, off we go
    socket.addEventListener('open', (event) => {
        console.log('Connected to server');

        //Recieve message from server handler
        socket.addEventListener('message', (event) => {
            console.log('Message from server:', event.data);
            var leftPosition = 0;

            const parts = event.data.split(":");
            const eventCommand = parts[0].trim();
            var eventData = "";
            if (parts.length > 1) {
                eventData = parts[1].trim();
            }
  
            //Start list of possible messages and handlers
            switch (true) {
                case (eventCommand == "CARD"):
                    document.getElementById('play-message').innerHTML = "Hare are your cards..";
                    cardCount = cardCount + 1;
                    leftPosition = cardCount * 60;
                    var cardData = {rawData: eventData, cardNumber: "", cardSuit: "", cardColor: ""};
                    getCardData(cardData);
                     myPlayerCards.push(eventData);

                    var cardClass = "card-" + cardData.cardColor + " " + cardData.cardSuit;
                    var myCard = "<span data-rank='" + cardData.cardNumber + "' class='" + cardClass + "' style='position:absolute;top:" + 0 + "px;left:" + leftPosition + "px;'></span>";
                    var myCardBack = "<span class='card' style='position:absolute;top:" + 0 + "px;left:" + leftPosition + "px;'><img src='" + cardCover + "' class='card-cover'></span>";
    
                    document.getElementById('player-cards-front').innerHTML = document.getElementById('player-cards-front').innerHTML + myCard;
                    document.getElementById('player-cards-back').innerHTML = document.getElementById('player-cards-back').innerHTML + myCardBack;

                    break;
                case (eventCommand == "TABLE CARD"):
                    document.getElementById('play-message').innerHTML = "Table played a card...";
                    tableCardCount = tableCardCount + 1;
                    leftPosition = tableCardCount * 60;
                    var cardData = {rawData: eventData, cardNumber: "", cardSuit: "", cardColor: ""};
                    getCardData(cardData);
                    myTableCards.push(eventData);

                    var cardClass = "card-" + cardData.cardColor + " " + cardData.cardSuit;
                    var myCard = "<span data-rank='" + cardData.cardNumber + "' class='" + cardClass + "' style='position:absolute;top:" + 0 + "px;left:" + leftPosition + "px;'></span>";
                    var myCardBack = "<span class='card' style='position:absolute;top:" + 0 + "px;left:" + leftPosition + "px;'><img src='" + cardCover + "' class='card-cover'></span>";
    
                    document.getElementById('table-cards-front').innerHTML = document.getElementById('table-cards-front').innerHTML + myCard;
                    document.getElementById('table-cards-back').innerHTML = document.getElementById('table-cards-back').innerHTML + myCardBack;

                    break;
                
                case eventCommand.includes("Dealer is "):
                    if (eventCommand.includes("Dealer is " + myName)) {
                        document.getElementById('controls').style.display = "block";
                    }
                    else {
                        document.getElementById('controls').style.display = "none";
                    }
                    if (eventCommand.includes("Game Started")) {

                        //Clear out and reset players
                        document.getElementById('players').innerHTML = "";
                        var workString = eventCommand.replace("Players are ", "|").replace(" ACTION ON PLAYER", "|");
                        var myTempArray = workString.split("|");
                        var myTempPlayers = myTempArray[1];
                        var myTempPlayerArray = myTempPlayers.split(",")
    
                        for (let index = 0; index < myTempPlayerArray.length;index++) {
                            console.log("PLAYER IS:" + myTempPlayerArray[index].trim());
                            document.getElementById('players').innerHTML = document.getElementById('players').innerHTML + "<div class='player'>" + myTempPlayerArray[index].trim() + "</div>";
                        }    
  
                        //Game Started, Shuffled, All set. Dealer is Orson Players are Monger, Wap, Orson ACTION ON PLAYER[0]] = Monger

                        //Clear out and reseet player cards
                        cardCount = 0;
                        myPlayerCards = [];
                        document.getElementById('player-cards-front').innerHTML = "";
                        document.getElementById('player-cards-back').innerHTML = "";
    
                        //Clear out and reset table cards
                        tableCardCount = 0;
                        myTableCards = [];
                        document.getElementById('table-cards-front').innerHTML = "";
                        document.getElementById('table-cards-back').innerHTML = "";
    
                    }
                    document.getElementById('play-message').innerHTML = eventCommand;

                default:

                    if (eventData.length > 0) {
                        document.getElementById('play-message').innerHTML = eventCommand + " Data:" + eventData;
                    }
                    else {
                        document.getElementById('play-message').innerHTML = eventCommand;
                    }
                    
                    break;
            }
                  
        });

        //Send message to the server
        if (!cardappButtonReady) {
            cardappButtonReady = true;
            document.getElementById('cardapp-shuffle').addEventListener('click', async () => {
                sendCardCommand("shuffle");
                myPlayerCards = [];
                myTableCards = [];
            });
            document.getElementById('cardapp-players').addEventListener('click', async () => {
                sendCardCommand("players");
            });
            document.getElementById('cardapp-startGame').addEventListener('click', async () => {
                sendCardCommand("start-game");
                myPlayerCards = [];
                myTableCards = [];
                handCount = handCount + 1;
                if (isEven(handCount)) {
                    cardCover = "card-cover-blue.png";
                }
                else {
                    cardCover = "card-cover-red.png";        
                }
            });           
            document.getElementById('cardapp-dealAllUp').addEventListener('click', async () => {
                sendCardCommand("deal-all-up");
            });
            document.getElementById('cardapp-dealAllDown').addEventListener('click', async () => {
                sendCardCommand("deal-all-down");
            });
            document.getElementById('cardapp-dealOneUp').addEventListener('click', async () => {
                sendCardCommand("deal-one-up");
            });
            document.getElementById('cardapp-dealOneDown').addEventListener('click', async () => {
                sendCardCommand("deal-one-down");
            });
            document.getElementById('cardapp-nextPlayer').addEventListener('click', async () => {
                sendCardCommand("next-player");
            });
            document.getElementById('cardapp-burnCard').addEventListener('click', async () => {
                sendCardCommand("burn-card");
            });
            document.getElementById('cardapp-tablePlayUp').addEventListener('click', async () => {
                sendCardCommand("table-play-up");
            });
            document.getElementById('cardapp-tablePlayDown').addEventListener('click', async () => {
                sendCardCommand("table-play-down");
            });
            document.getElementById('cardapp-actionPlayer').addEventListener('click', async () => {
                sendCardCommand("action-player");
            });
            document.getElementById('cardapp-flushLog').addEventListener('click', async () => {
                document.getElementById('cardapp-log').innerHTML = "All clear - Stat Fresh"
            });

            //And for showing/hiding cards
            document.getElementById('player-cards-front').addEventListener('click', async () => {
                toggleShowCards("player-cards");    
            });
            document.getElementById('player-cards-back').addEventListener('click', async () => {
                toggleShowCards("player-cards");    
            });
            document.getElementById('table-cards-front').addEventListener('click', async () => {
                toggleShowCards("table-cards");    
            });
            document.getElementById('table-cards-back').addEventListener('click', async () => {
                toggleShowCards("table-cards");    
            });
            
        }

        //When socket is closed handler
        socket.addEventListener('close', (event) => {
            console.log('Disconnected from server');
            document.getElementById('play-message').innerHTML = "Disconnected from server. Trying to reconnect...";
            //document.getElementById('cardapp-log').innerHTML = document.getElementById('cardapp-log').innerHTML + "<li>**************</li>";
            document.getElementById('cardapp-log').innerHTML = "<li>Disconnected from server" + "</li>";
            socket = new WebSocket('wss://i-saw-your-cards.deno.dev?name=' + myName);
        });

        //Error in socket handler
        socket.addEventListener('error', (event) => {
            console.error('WebSocket error:', event);

            //Close it, we are done
            socket.close();
            console.log('Closed the socket');

            document.getElementById('cardapp-log').innerHTML = "<li>Closed from Error: " + event.data + "</li>";

        });
    });

}

//Sendin stuff off toe the mother ship
function sendCardCommand(inputCommand) {

    if (socket.readyState === WebSocket.CLOSED) {

        //Re-open connection
        socket = new WebSocket('wss://i-saw-your-cards.deno.dev?name=' + myName);
    }

    socket.send(inputCommand);
    //document.getElementById('cardapp-log').innerHTML = document.getElementById('cardapp-log').innerHTML + "<li>Client --> Server: " + inputCommand + "</li>";
}


function toggleShowCards(inputCardType) {

    if (inputCardType == "table-cards") {
        var tableCardsFront = document.getElementById('table-cards-front');
        var tableCardsBack = document.getElementById('table-cards-back');
        if (tableCardsFront.style.display == "none") {
            tableCardsFront.style.display = "block";
            tableCardsBack.style.display = "none";
        } else {
            tableCardsFront.style.display = "none";
            tableCardsBack.style.display = "block";
        }
    }
    else {
        var playerCardsFront = document.getElementById('player-cards-front');
        var playerCardsBack = document.getElementById('player-cards-back');
        if (playerCardsFront.style.display == "none") {
            playerCardsFront.style.display = "block";
            playerCardsBack.style.display = "none";
        } else {
            playerCardsFront.style.display = "none";
            playerCardsBack.style.display = "block";
        }
    }

}

function isEven(n) {
    return n % 2 == 0;
 }

function getCardData(inputCardData) {

    inputCardData.cardNumber = inputCardData.rawData.charAt(0);
    if (inputCardData.cardNumber == "1") {
        inputCardData.cardNumber = "A";
    }
    inputCardData.cardSuit = inputCardData.rawData.charAt(1);
    inputCardData.cardColor = "black";

    console.log("CARD DATA IS: " + inputCardData.rawData  + " NUM: " + inputCardData.cardNumber + " SUIT: " + inputCardData.cardSuit);
    switch (inputCardData.cardSuit) {
        case "S":
            inputCardData.cardSuit = "spades";
            inputCardData.cardColor = "black";
            break;
        case "H":
            inputCardData.cardSuit = "hearts";
            inputCardData.cardColor = "red";
            break;
        case "C":
            inputCardData.cardSuit = "clubs";
            inputCardData.cardColor = "black";
            break;
        case "D":
            inputCardData.cardSuit = "diamonds";
            inputCardData.cardColor = "red";
            break;
        default:
            inputCardData.cardSuit = "spades";
            break;
    }
}
