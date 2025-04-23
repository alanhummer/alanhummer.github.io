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
            switch (eventCommand) {
                case "CARD":
                    document.getElementById('play-message').innerHTML = "Hare are your cards..";
                    cardCount = cardCount + 1;
                    leftPosition = cardCount * 60;
                    var cardNumber = "";
                    var cardSuit = "";
                    var cardColor = "";
                    getCard(eventData, cardNumber, cardSuit, cardColor);
                    myPlayerCards.push(eventData);

                    var cardClass = "card-" + cardColor + " " + cardSuit;
                    var myCard = "<span data-rank='" + cardNumber + "' class='" + cardClass + "' style='position:absolute;top:" + 0 + "px;left:" + leftPosition + "px;'></span>";
                    var myCardBack = "<span class='card' style='position:absolute;top:" + 0 + "px;left:" + leftPosition + "px;'><img src='" + cardCover + "' class='card-cover'></span>";
    
                    document.getElementById('player-cards-front').innerHTML = document.getElementById('player-cards-front').innerHTML + myCard;
                    document.getElementById('player-cards-back').innerHTML = document.getElementById('player-cards-back').innerHTML + myCardBack;

                    break;
                case "TABLE CARD":
                    document.getElementById('play-message').innerHTML = "Table played a card...";
                    tableCardCount = tableCardCount + 1;
                    leftPosition = tableCardCount * 60;
                    var cardNumber = "";
                    var cardSuit = "";
                    var cardColor = "";
                    getCard(eventData, cardNumber, cardSuit, cardColor);
                    myTableCards.push(eventData);

                    var cardClass = "card-" + cardColor + " " + cardSuit;
                    var myCard = "<span data-rank='" + cardNumber + "' class='" + cardClass + "' style='position:absolute;top:" + 0 + "px;left:" + leftPosition + "px;'></span>";
                    var myCardBack = "<span class='card' style='position:absolute;top:" + 0 + "px;left:" + leftPosition + "px;'><img src='" + cardCover + "' class='card-cover'></span>";
    
                    document.getElementById('table-cards-front').innerHTML = document.getElementById('table-cards-front').innerHTML + myCard;
                    document.getElementById('table-cards-back').innerHTML = document.getElementById('table-cards-back').innerHTML + myCardBack;

                    break;
                
                case "Dealer is now:":
                    if (eventData == myName) {
                        //I am the dealers, show controls
                        document.getElementById('controls').style.display = "block";
                        document.getElementById('play-message').innerHTML = "You are the dealer!";
                    }
                    else {
                        //I am not the dealers, show controls
                        document.getElementById('controls').style.display = "none";
                        document.getElementById('play-message').innerHTML = eventData + " is the dealer"; 
                    }

                default:
                    document.getElementById('play-message').innerHTML = "Playing Cards:" + eventCommand + " Data:" + eventData;
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
            //document.getElementById('cardapp-log').innerHTML = document.getElementById('cardapp-log').innerHTML + "<li>**************</li>";
            document.getElementById('cardapp-log').innerHTML = "<li>Disconnected from server" + "</li>";
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
        var tableCardsFront = document.getElementById('table-cards=front');
        var tableCardsBack = document.getElementById('table-cards-back');
        if (tableCardsFront.style.display === "none") {
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
        if (playerCardsFront.style.display === "none") {
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

function getCard(inputCardData, cardNumber, cardSuit, cardColor) {

    cardNumber = inputCardData.charAt(0);
    if (cardNumber == "1") {
        cardNumber = "A";
    }
    cardSuit = inputCardData.charAt(1);
    cardColor = "black";

    console.log("CARD DATA IS: " + inputCardData  + " NUM: " + cardNumber + " SUIT: " + cardSuit);
    switch (cardSuit) {
        case "S":
            cardSuit = "spades";
            cardColor = "black";
            break;
        case "H":
            cardSuit = "hearts";
            cardColor = "red";
            break;
        case "C":
            cardSuit = "clubs";
            cardColor = "black";
            break;
        case "D":
            cardSuit = "diamonds";
            cardColor = "red";
            break;
        default:
            cardSuit = "spades";
            break;
    }
}
