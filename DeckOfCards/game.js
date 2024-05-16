const suits = ['♠', '♥', '♣', '♦'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCards(deck) {
    const players = ["player-left", "player-right", "player-top", "player-bottom"];
    players.forEach(player => {
        const playerDiv = document.getElementById(player);
        for (let i = 0; i < 2; i++) {
            let card = deck.pop();
            let cardDiv = document.createElement('div');
            cardDiv.textContent = `${card.value} ${card.suit}`;
            cardDiv.draggable = true;
            cardDiv.addEventListener('click', () => {
                cardDiv.classList.toggle('face-up'); // Toggle class to show or hide card value
            });
            playerDiv.appendChild(cardDiv);
        }
    });
}

function setupTable() {
    const table = document.getElementById('table');
    table.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow the drop
    });
    table.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text');
        let playedCard = document.createElement('div');
        playedCard.textContent = data;
        playedCard.className = 'card face-up'; // Ensure the card is face up when played
        table.appendChild(playedCard); // Add the card to the table
    });
}

document.addEventListener('DOMContentLoaded', function() {
    let deck = createDeck();
    shuffleDeck(deck);
    dealCards(deck);
    setupTable();
});
