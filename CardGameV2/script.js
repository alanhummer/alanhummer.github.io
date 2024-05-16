// script.js
document.addEventListener('DOMContentLoaded', function () {
    const cardTypes = ['Feature', 'Bug', 'Tech Debt'];
    const costs = [1, 2, 3, 4, 5, 6];
    const benefits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const featureDiscounts = [1, 2];
    const expenses = [1, 2];
    let totalAmount = 20;
  
    function updateTotal(amount) {
      totalAmount -= amount;
      document.getElementById('player-total').textContent = `Total Amount: ${totalAmount}`;
    }
  
    function allowDrop(ev) {
      ev.preventDefault();
    }
  
    function drag(ev) {
      ev.dataTransfer.setData("text", ev.target.id);
    }
  
    function drop(ev) {
      ev.preventDefault();
      var data = ev.dataTransfer.getData("text");
      ev.target.appendChild(document.getElementById(data));
      const cost = parseInt(document.getElementById(data).getAttribute('data-cost'));
      updateTotal(cost);
    }
  
    function createDeck() {
      let deck = [];
      for (let i = 0; i < 48; i++) {
        let type = cardTypes[Math.floor(Math.random() * cardTypes.length)];
        let cost = costs[Math.floor(Math.random() * costs.length)];
        let card = { type, cost, id: i };
  
        switch (type) {
          case 'Feature':
            card.benefit = benefits[Math.floor(Math.random() * benefits.length)];
            break;
          case 'Tech Debt':
            card.featureDiscount = featureDiscounts[Math.floor(Math.random() * featureDiscounts.length)];
            break;
          case 'Bug':
            card.expense = expenses[Math.floor(Math.random() * expenses.length)];
            break;
        }
  
        deck.push(card);
      }
      return deck;
    }
  
    function displayCards(cards) {
      const container = document.getElementById('card-deck');
      container.innerHTML = '';
      cards.forEach(card => {
        let cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.id = `card-${card.id}`;
        cardElement.setAttribute('data-cost', card.cost);
        cardElement.draggable = true;
        cardElement.addEventListener('dragstart', drag);
        cardElement.innerHTML = `<h4>${card.type}</h4><p>Cost: ${card.cost}</p>` +
          (card.benefit ? `<p>Benefit: ${card.benefit}</p>` : '') +
          (card.featureDiscount ? `<p>Feature Discount: ${card.featureDiscount}</p>` : '') +
          (card.expense ? `<p>Expense: ${card.expense}</p>` : '');
        container.appendChild(cardElement);
      });
  
      const playedCards = document.getElementById('played-cards');
      playedCards.addEventListener('dragover', allowDrop);
      playedCards.addEventListener('drop', drop);
    }
  
    let deck = createDeck();
    displayCards(deck.slice(0, 4)); // Display only 4 cards initially
  });
  