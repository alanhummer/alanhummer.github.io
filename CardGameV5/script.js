// script.js
document.addEventListener('DOMContentLoaded', function () {
    const cardTypes = ['Feature', 'Bug', 'Tech Debt'];
    const costs = [1, 2, 3, 4, 5, 6];
    const benefits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const featureDiscounts = [1, 2];
    const expenses = [1, 2];
    let totalAmount = 20;
    let featureDiscountsTotal = 0;
    let expenseSaved = 0;
    let costSaved = 0;
  
    function updateTotal(amount) {
      totalAmount -= amount;
      document.getElementById('total-amount').textContent = totalAmount;
    }
  
    function updateFeatureDiscounts(amount) {
      featureDiscountsTotal += amount;
      console.log("Feature Discounts Total is now " + amount);
      document.getElementById('feature-discounts').textContent = featureDiscountsTotal;
    }
  
    function updateExpenseSaved(amount) {
      expenseSaved += amount;
      document.getElementById('expense-saved').textContent = expenseSaved;
    }
  
    function updateCostSaved(amount) {
      costSaved += amount;
      document.getElementById('cost-saved').textContent = costSaved;
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
      var cardElement = document.getElementById(data);
      ev.target.appendChild(cardElement);
      const cost = parseInt(cardElement.getAttribute('data-cost'));
      const type = cardElement.getAttribute('data-type');
      const featureDiscount = parseInt(cardElement.getAttribute('data-feature-discount') || 0);
      const expense = parseInt(cardElement.getAttribute('data-expense') || 0);
  
      updateTotal(cost);
  
      console.log("Dropped card is ", cardElement);
      if (type === 'Tech Debt') {
        updateFeatureDiscounts(featureDiscount);
        updateCostSaved(featureDiscount);
      } else if (type === 'Bug') {
        updateExpenseSaved(expense);
      }
    }
  
    document.getElementById('deal-button').addEventListener('click', function() {
      let newDeck = createDeck();
      displayCards(newDeck.slice(0, 4)); // Deal new cards
    });
  
    const playedCards = document.getElementById('played-cards');
    playedCards.addEventListener('dragover', allowDrop);
    playedCards.addEventListener('drop', function(event) {
      drop(event);
      // Resize the played cards container if necessary
      this.style.height = 'auto';  // Reset height to grow as needed
    });
  
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
        cardElement.className = 'card ' + card.type.toLowerCase().replace(/\s+/g, '-');
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
    }
  
    let deck = createDeck();
    displayCards(deck.slice(0, 4)); // Display initial 4 cards
  });
  
  