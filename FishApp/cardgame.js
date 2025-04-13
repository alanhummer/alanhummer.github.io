//For card game app, we are setting up web sockets for 2 way communicaiton.
//WSS prototol, server in Deno has enable this and setup handlers for activities
//WSS protocol client here has enabled this and setup handlers for activities
//Activities include: connectiong, sending, receieve, closing and error handling


var cardappButtonReady = false;

//***************************
//This handle all of the card game app presentation and logic
//***************************
function runTheCardGame() {

    document.getElementById('fishapp').style.display = "none";
    document.getElementById('cardapp').style.display = "block";

    const urlParams = new URLSearchParams(window.location.search);
    const myName = urlParams.get('name');
    if (!myName) {
        myName = "Nobody";
    }

    //start web socket, add listeners for the events we want
    const socket = new WebSocket('wss://i-saw-your-cards.deno.dev?name=' + myName);

    //When it connects successfully, off we go
    socket.addEventListener('open', (event) => {
        console.log('Connected to server');
        document.getElementById('cardapp-log').innerHTML = document.getElementById('cardapp-log').innerHTML + "<li>Connected to server" + "</li>";
        document.getElementById('cardapp-log').innerHTML = document.getElementById('cardapp-log').innerHTML + "<li>**************</li>";
        var sendMessage = 'Hello Server!';
        socket.send(sendMessage);
        document.getElementById('cardapp-log').innerHTML = document.getElementById('cardapp-log').innerHTML + "<li>Client --> Server: " + sendMessage + "</li>";


        //Recieve message from server handler
        socket.addEventListener('message', (event) => {
            console.log('Message from server:', event.data);
            document.getElementById('cardapp-log').innerHTML = document.getElementById('cardapp-log').innerHTML + "<li>Server --> Client(me): " + event.data + "</li>";
        });

        //Send message to the server
        if (!cardappButtonReady) {
            cardappButtonReady = true;
            document.getElementById('cardapp-send').addEventListener('click', async () => {
                socket.send(document.getElementById('cardapp-message').value);
                document.getElementById('cardapp-log').innerHTML = document.getElementById('cardapp-log').innerHTML + "<li>Client --> Server: " + document.getElementById('carapp-message').value + "</li>";
            });
        }

        //When socket is closed handler
        socket.addEventListener('close', (event) => {
            console.log('Disconnected from server');
            document.getElementById('cardapp-log').innerHTML = document.getElementById('cardapp-log').innerHTML + "<li>**************</li>";
            document.getElementById('cardapp-log').innerHTML = document.getElementById('cardapp-log').innerHTML + "<li>Disconnected from server" + "</li>";
        });

        //Error in socket handler
        socket.addEventListener('error', (event) => {
            console.error('WebSocket error:', event);

            //Close it, we are done
            socket.close();
            console.log('Closed the socket');

            document.getElementById('cardapp-log').innerHTML = document.getElementById('cardapp-log').innerHTML + "<li>Closed from Error: " + event.data + "</li>";

        });
    });

}
