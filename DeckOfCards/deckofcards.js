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
var dontSave = "";
var cardCount = 0;
var tableCardCount = 0;
var myPlayerCards = [];
var myTableCards = [];
var cardCover = "BOGUS";

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
dontSave = urlParams.get('dontSave');
if (!myName) {
    //No name, see if we have it stored
    myName = getStorage("userName");
}
if (!myName) {
    myName = "Nobody";
    document.getElementById('cardbutton').innerHTML = document.getElementById('cardbutton').innerHTML.replace("_WELCOMEMESSAGE_", "Hello, Stranger");
    document.getElementById('cardbutton').innerHTML = document.getElementById('cardbutton').innerHTML.replace("_WELCOMEINSTRUCTIONS_", "Nothing to see here...");
}
else {

    //Store name fo 
    if (dontSave) {
        //Dont save
    }
    else {
        setStorage("userName", myName);
    }

    document.getElementById('cardbutton').innerHTML = document.getElementById('cardbutton').innerHTML.replace("_WELCOMEMESSAGE_", "Hello " + myName + ". Would you like to play a game?");
    document.getElementById('cardbutton').innerHTML = document.getElementById('cardbutton').innerHTML.replace("_WELCOMEINSTRUCTIONS_", "Touch the Deck to Play");

    document.getElementById('cardgamestart').addEventListener('click', async () => {
        document.getElementById('playerName').innerHTML = document.getElementById('playerName').innerHTML.replace("_NAME_", myName);
        runTheCardGame();
    });
}

document.getElementById('status').innerHTML = "v2025.04.29.1";

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

            //Server message are json objects of message, version, card, player types
            //Could be array of objects also

            let messageObjects = JSON.parse(event.data);
            if (Array.isArray(messageObjects)) {
                //All good, we have an array of objects
            }
            else {
                //Rebuild as 1 entry array for simplicity of handling - always arrays
                let messageObject = JSON.parse(event.data);
                messageObjects = [];
                messageObjects.push(messageObject);
            }

            //OK, we have array of messages to process
            let playerCount = 0;
            for (const messageObject of messageObjects) {
                switch (messageObject.type) {
                    case "message":
                        document.getElementById('play-message').innerHTML = messageObject.message;
                        break;
                    case "version":
                        document.getElementById('play-message').innerHTML = "Version info: " + messageObject.appVersion + " " + messageObject.appRegion;
                        break;
                    case "card":
                        //A to do here, if card is up, show it up...if down show it down
                        var cardClass = "card-" + messageObject.color + " " + messageObject.suit;
                        var myCard = "<span data-rank='" + messageObject.rank + "' class='" + cardClass + "' style='position:absolute;top:" + 0 + "px;left:_LEFTPOSITION_px;'></span>";
                        var myCardBack = "<span class='card' style='position:absolute;top:" + 0 + "px;left:_LEFTPOSITION_px;'><img src='" + messageObject.cover + "' class='card-cover'></span>";

                        if (messageObject.table) {
                            tableCardCount = tableCardCount + 1;
                            const leftPosition = tableCardCount * 60;
                            document.getElementById('play-message').innerHTML = "Table card played...";
                            myTableCards.push(messageObject); 
                            myCard = myCard.replace("_LEFTPOSITION_", leftPosition);
                            myCardBack = myCardBack.replace("_LEFTPOSITION_", leftPosition);
                            document.getElementById('table-cards-front').innerHTML = document.getElementById('table-cards-front').innerHTML + myCard;
                            document.getElementById('table-cards-back').innerHTML = document.getElementById('table-cards-back').innerHTML + myCardBack;
        
                        }
                        else {
                            cardCount = cardCount + 1;
                            const leftPosition = cardCount * 60;
                            document.getElementById('play-message').innerHTML = "Got a card...";
                            myPlayerCards.push(messageObject); 
                            myCard = myCard.replace("_LEFTPOSITION_", leftPosition);
                            myCardBack = myCardBack.replace("_LEFTPOSITION_", leftPosition);
                            document.getElementById('player-cards-front').innerHTML = document.getElementById('player-cards-front').innerHTML + myCard;
                            document.getElementById('player-cards-back').innerHTML = document.getElementById('player-cards-back').innerHTML + myCardBack;
                        }
                        break;
                    case "player":
                        //Our player set
                        playerCount = playerCount + 1;
                        let playerType = "player";

                        let actionIndicator = "";
                        if (messageObject.blnActionOn) {
                            actionIndicator = "**Action**";
                            playerType = "actionPlayer";
                        }
 
                        let dealerIndicator = "";
                        if (messageObject.blnDealer) {
                            document.getElementById('controls').style.display = "none";
                            if (messageObject.name == myName) {
                                document.getElementById('controls').style.display = "block";
                            }
                            dealerIndicator = "**Dealer**";
                        }
  
                        let playerDisplay = "<div class='" + playerType + "'>" + messageObject.name + "<br>" + messageObject.cardCount + " Cards<br>" + actionIndicator + "<br>" + dealerIndicator + "</div>";
                         
                        if (playerCount == 1) {
                            //Wipe clean and start fresh
                            document.getElementById('players').innerHTML = playerDisplay
                        }
                        else {
                            document.getElementById('players').innerHTML = document.getElementById('players').innerHTML + playerDisplay;
                        }
                        break;
                    case "new-game":

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

                        break;    
                    default:
                        document.getElementById('play-message').innerHTML = JSON.stringify(messageObject);
                        break;
                }
            }
        });

        //Send message to the server
        if (!cardappButtonReady) {
            cardappButtonReady = true;
            //document.getElementById('cardapp-shuffle').addEventListener('click', async () => {
            //    sendCardCommand("shuffle");
            //});
            document.getElementById('cardapp-players').addEventListener('click', async () => {
                sendCardCommand("players");
            });
            document.getElementById('cardapp-startGame').addEventListener('click', async () => {
                sendCardCommand("start-game");
                myPlayerCards = [];
                myTableCards = [];
            });     
            document.getElementById('cardapp-nextDealer').addEventListener('click', async () => {
                sendCardCommand("next-deal");
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


// Helper function to save to local storage
function setStorage(inputKey, inputValue) {
    localStorage.setItem(inputKey, inputValue);
  }
  
  // Helper function to get from loca storage
  function getStorage(inputKey) {
    var outputValue = localStorage.getItem(inputKey);
    return outputValue;
  }
  
  // Helper function to delete from loca storage
  function deleteStorage(inputKey) {
    localStorage.removeItem(inputKey);
    return;
  }
  