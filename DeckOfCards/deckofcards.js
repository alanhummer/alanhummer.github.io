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
// TO DO: HOW KNOW GAME STARTED> OR GAME ENDED? PASS OT EACH PLAYER
//ADD HANDLERS FOR HOLD EM CARD _ Start, show 3 opsion, done with river, shop next dealer btton
//
//get rank to show on otable cards - debug in chrome
//
//X Dealer BG= Blue
//X You = Marker?
//NO Double size of cards
//X 3 players per row, 2 rows

var cardappButtonReady = false;
var socket = null;
var myName = "";
var dontSave = "";
var cardCount = 0;
var tableCardCount = 0;
var myPlayerCards = [];
var myTableCards = [];
var cardCover = "BOGUS";
var handStatus = "READY_TO_START"; //READY_TO_DEAL, READY_FOR_FLOP, READY_FOR_RIVER, READY_FOR_TURN, READY_NEXT_DEALER

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

myName = getStorage("userName");
dontSave = urlParams.get('dontsave');
if (dontSave == "true") {
    myName = urlParams.get('name');
}
if (!myName) {
    //No name, see if we have it stored
    myName = urlParams.get('name');
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
        //document.getElementById('playerName').innerHTML = document.getElementById('playerName').innerHTML.replace("_NAME_", myName);
        runTheCardGame();
    });
}

document.getElementById('status').innerHTML = "v2025.05.19.1";

//***************************
//This handle all of the card game app presentation and logic
//***************************
async function runTheCardGame() {

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
                        document.getElementById('play-message').innerHTML = "You are " + myName + ". " + messageObject.message;
                        break;
                    case "version":
                        document.getElementById('play-message').innerHTML = "Version info: " + messageObject.appVersion + " " + messageObject.appRegion;
                        break;
                    case "card":
                         if (messageObject.table) {

                            //A to do here, if card is up, show it up...if down show it down
                            var cardClass = "cardTable-" + messageObject.color + " table" + messageObject.suit;
                            var myCard = "<div data-rank='" + messageObject.rank + "' class='" + cardClass + "' style='position:absolute;top:" + 0 + "px;left:_LEFTPOSITION_px;'></div>";
                            var myCardBack = "<div class='cardTable' style='position:absolute;top:" + 0 + "px;left:_LEFTPOSITION_px;'><img src='" + messageObject.cover + "' class='cardTable-cover'></div>";

                            const leftPosition = (window.innerWidth / 2) - 150 + (tableCardCount * 50);

                            tableCardCount = tableCardCount + 1;
                            document.getElementById('play-message').innerHTML = "You are " + myName + ". " + "Table card played...";
                            myTableCards.push(messageObject); 
                            myCard = myCard.replace("_LEFTPOSITION_", leftPosition);
                            myCardBack = myCardBack.replace("_LEFTPOSITION_", leftPosition);
                            document.getElementById('table-cards-front').innerHTML = document.getElementById('table-cards-front').innerHTML + myCard;
                            document.getElementById('table-cards-back').innerHTML = document.getElementById('table-cards-back').innerHTML + myCardBack;
        
                        }
                        else {

                            //A to do here, if card is up, show it up...if down show it down
                            var cardClass = "card-" + messageObject.color + " " + messageObject.suit;
                            var myCard = "<div data-rank='" + messageObject.rank + "' class='" + cardClass + "' style='position:absolute;top:" + 0 + "px;left:_LEFTPOSITION_px;'></div>";
                            var myCardBack = "<div class='card' style='position:absolute;top:" + 0 + "px;left:_LEFTPOSITION_px;'><img src='" + messageObject.cover + "' class='card-cover'></div>";
                            
                            const leftPosition = (window.innerWidth / 2) - 120 + (cardCount * 90);

                            cardCount = cardCount + 1;
                            document.getElementById('play-message').innerHTML = "You are " + myName + ". " + "Got a card...";
                            myPlayerCards.push(messageObject); 
                            myCard = myCard.replace("_LEFTPOSITION_", leftPosition);
                            myCardBack = myCardBack.replace("_LEFTPOSITION_", leftPosition);
                            document.getElementById('player-cards-front').innerHTML = document.getElementById('player-cards-front').innerHTML + myCard;
                            document.getElementById('player-cards-back').innerHTML = document.getElementById('player-cards-back').innerHTML + myCardBack;
                            if (!messageObject.faceUp) {
                                document.getElementById('player-cards-front').style.display = "none";
                                document.getElementById('player-cards-back').style.display = "block";
                            }
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
                        
                        let youIndicator = "";
                        if (messageObject.name == myName) {
                           youIndicator = "**YOU**";
                        }

                        let playerCards = "";
                        let playerCardsBack = "";
                        let lCardCount = 0;
                        for (const cardObject of  messageObject.cards) {
                            var cardClass = "cardTable-" + cardObject.color + " table" + cardObject.suit;
                            var myCard = "<span data-rank='" + cardObject.rank + "' class='" + cardClass + "' style='position:absolute;top:" + 0 + "px;left:_LEFTPOSITION_px;'></span>";
                            var myCardBack = "<span class='cardTable' style='position:absolute;top:" + 0 + "px;left:_LEFTPOSITION_px;'><img src='" + cardObject.cover + "' class='cardTable-cover'></span>";
                            var lLeftPosition = (lCardCount * 50) + 5;
                            myCard = myCard.replace("_LEFTPOSITION_", lLeftPosition);
                            myCardBack = myCardBack.replace("_LEFTPOSITION_", lLeftPosition);
                            playerCards = playerCards + myCard;
                            playerCardsBack = playerCardsBack + myCardBack;
                            lCardCount = lCardCount + 1;
                            console.log("PLAYER CARD ", cardObject);
                        };
                       
                        //let playerDisplay = "<div id='players-cards-" + messageObject.name + "' style='display:relative;'>" +
                        let playerDisplay = "<td width='100px' align='center'>" +
                            "<div id='players-cards-front-" + messageObject.name + "' style='position:relative;height:60px;display:none;'>" + playerCards + "</div>" +
                            "<div id='players-cards-back-" + messageObject.name + "' style='position:relative;height:60px;display:relative;'>" + playerCardsBack + "</div>" +
                            "<div class='" + playerType + "'>" + messageObject.name + "<br>" + messageObject.cardCount + " Cards<br>" + youIndicator + "<br>" + actionIndicator + "<br>" + dealerIndicator + "</div>" + 
                            "</td>";

                        let startPlayerDisplay = "<table cellpadding='0' cellspacing='0' border='0'><tbody><tr>";
                        let endPlayerDisplay = "</tr></tbody></table>";
                        if (playerCount == 1) {
                            //Wipe clean and start fresh
                            document.getElementById('players').innerHTML = startPlayerDisplay + playerDisplay + endPlayerDisplay;
                        }
                        else if (playerCount == 4) {
                            document.getElementById('players').innerHTML = document.getElementById('players').innerHTML.replace(endPlayerDisplay, "</tr><tr>" + playerDisplay + endPlayerDisplay);
                            console.log("INNER HTML IS: " + document.getElementById('players').innerHTML );
                        }
                        else {
                            document.getElementById('players').innerHTML = document.getElementById('players').innerHTML.replace(endPlayerDisplay, playerDisplay + endPlayerDisplay);
                            console.log("INNER HTML IS: " + document.getElementById('players').innerHTML );
                        }
                        break;
                    case "game":

                        //Reset everything
                        document.getElementById('cardapp-startGame').style.display = "none";
                        document.getElementById('cardapp-dealAllDown2').style.display = "none";
                        document.getElementById('cardapp-tablePlayUp3').style.display = "none";
                        document.getElementById('cardapp-tablePlayUp1').style.display = "none";
                        document.getElementById('cardapp-tablePlayUp1Final').style.display = "none";
                        document.getElementById('cardapp-showCards').style.display = "none";
                        document.getElementById('cardapp-nextDealer').style.display = "none";

                        document.getElementById('cardapp-startGame').disabled = true;
                        document.getElementById('cardapp-dealAllDown2').disabled = true;
                        document.getElementById('cardapp-tablePlayUp3').disabled = true;
                        document.getElementById('cardapp-tablePlayUp1').disabled = true;
                        document.getElementById('cardapp-tablePlayUp1Final').disabled = true;
                        document.getElementById('cardapp-showCards').disabled = true;
                        document.getElementById('cardapp-nextDealer').disabled = true;

                        switch (messageObject.status) {
                            case "READY_TO_START":
                            case "READY_TO_DEAL":

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

                                //Show appropriate button
                                if (messageObject.status == "READY_TO_DEAL") {
                                    document.getElementById('cardapp-dealAllDown2').style.display = "inline-block";
                                }
                                else {
                                    document.getElementById('cardapp-startGame').style.display = "inline-block";
                                }     
                                document.getElementById('play-message').innerHTML = "You are " + myName + ". " + "Here we go!";                           
                                break;
                            case "READY_NEXT_DEALER":
                                document.getElementById('cardapp-nextDealer').style.display = "inline-block";
                                document.getElementById('play-message').innerHTML = "Hand is over. Passing the deal...";
 
                                //And Show all the cards
                                const element = document.getElementById('players');
                                const divs = element.querySelectorAll('div');
                                for (const div of divs) {
                                    if (div.id.includes("players-cards-back")) {
                                        div.innerHTML =  document.getElementById("players-cards-front" + div.id.replace("players-cards-back", "")).innerHTML;
                                    }
                                }

                                break;
                            case "READY_FOR_FLOP":
                                document.getElementById('cardapp-tablePlayUp3').style.display = "inline-block";
                                document.getElementById('play-message').innerHTML = "You are " + myName + ". " + "Place your bets...";
                                break;
                            case "READY_FOR_RIVER":
                                document.getElementById('cardapp-tablePlayUp1').style.display = "inline-block";
                                document.getElementById('play-message').innerHTML = "You are " + myName + ". " + "Nice flop!";
                                break;
                            case "READY_FOR_TURN":
                                document.getElementById('cardapp-tablePlayUp1Final').style.display = "inline-block";
                                document.getElementById('play-message').innerHTML = "You are " + myName + ". " + "Still anybody's game!";
                                break;
                            case "READY_TO_SHOW":
                                document.getElementById('cardapp-showCards').style.display = "inline-block";
                                document.getElementById('play-message').innerHTML = "You are " + myName + ". " + "Last call....!";
                                break;
                           default: 
                                break;

                        }
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
                document.getElementById('cardapp-startGame').disabled = true;
                sendCardCommand("start-game");
                myPlayerCards = [];
                myTableCards = [];
            });     
            document.getElementById('cardapp-nextDealer').addEventListener('click', async () => {
                document.getElementById('cardapp-nextDealer').disabled = true;
                sendCardCommand("next-deal");
            });  
            document.getElementById('cardapp-dealAllUp').addEventListener('click', async () => {
                sendCardCommand("deal-all-up");
            });
            document.getElementById('cardapp-dealAllDown').addEventListener('click', async () => {
                sendCardCommand("deal-all-down");
            });
            document.getElementById('cardapp-dealAllDown2').addEventListener('click', async () => {
                document.getElementById('cardapp-dealAllDown2').disabled = true;
                //And Game status
                sendCardCommand("game:READY_FOR_FLOP");
                //Send 2 cards
                sendCardCommand("deal-all-down");
                //Brief pause
                await sleep(250); // Pause for 2 seconds
                 //Send Another
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
            document.getElementById('cardapp-tablePlayUp3').addEventListener('click', async () => {
                document.getElementById('cardapp-tablePlayUp3').disabled = true;
                 //And Game status
                 sendCardCommand("game:READY_FOR_RIVER");
                //3 cards for the flop
                sendCardCommand("table-play-up");
                await sleep(250); // Pause for 2 seconds
                sendCardCommand("table-play-up");
                await sleep(250); // Pause for 2 seconds
                sendCardCommand("table-play-up");
            });
            document.getElementById('cardapp-tablePlayUp1').addEventListener('click', async () => {
                document.getElementById('cardapp-tablePlayUp1').disabled = true;
                //And Game status
                sendCardCommand("game:READY_FOR_TURN");
                //1 cards for the river
                sendCardCommand("table-play-up");
            });
            document.getElementById('cardapp-tablePlayUp1Final').addEventListener('click', async () => {
                document.getElementById('cardapp-tablePlayUp1Final').disabled = true;
                //And Game status
                sendCardCommand("game:READY_TO_SHOW");
                //1 cards for the turn
                sendCardCommand("table-play-up");
            });
            document.getElementById('cardapp-showCards').addEventListener('click', async () => {
                document.getElementById('cardapp-showCards').disabled = true;
                //And Game status everyone show
                sendCardCommand("game:READY_NEXT_DEALER");

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
            runTheCardGame();
            //socket = new WebSocket('wss://i-saw-your-cards.deno.dev?name=' + myName);
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
  
  //Good ol' sleep
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
