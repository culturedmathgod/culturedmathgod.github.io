const SUITS = ["heart", "spade", "club", "diamond"]
const VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]

export default class Deck {
    constructor(cards = freshDeck()) {
        this.cards = cards
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const newIndex = Math.floor(Math.random() * (i + 1));
            const oldValue = this.cards[newIndex];
            this.cards[newIndex] = this.cards[i];
            this.cards[i] = oldValue;
        }
    }

    length() {
        return this.cards.length;
    }

    push(new_card) {
        return this.cards.push(new_card)
    }
}

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    } 

    getHTMLfirstRound(x) {
        const cardDiv = document.createElement("div");
        cardDiv.innerText = `${this.value}`;
        if(this.value == 2) {cardDiv.classList.add("card", `wild_${this.suit}`, "cardFront")}
        if(this.value != 2) {cardDiv.classList.add("card", `${this.suit}`, "cardFront")}
        cardDiv.setAttribute("onclick", "clickfunction(id)");
        cardDiv.id = "card"+x;
        return cardDiv;
    }

    getHTMLfinalRound(x) {
        const cardDiv = document.createElement("div");
        cardDiv.innerText = `${this.value}`;
        if(this.value == 2) {cardDiv.classList.add("card", `wild_${this.suit}`, "unclickable", "cardBack")}
        if(this.value != 2) {cardDiv.classList.add("card", `${this.suit}`, "unclickable", "cardBack")}
        cardDiv.setAttribute("onclick", "clickfunction(id)");
        cardDiv.id = "card"+x;
        return cardDiv;
    }

    getHTML_extra(hand, slot) {
        const cardDiv = document.createElement("div");
        cardDiv.innerText = `${this.value}`;
        cardDiv.classList.add("extracard", `${this.suit}_extra`);
        cardDiv.id = "extrahand"+hand+"_slot"+slot;
        return cardDiv;
    }

    getHTML_actual(x) {
        const cardDiv = document.createElement("div");
        cardDiv.innerText = `${this.value}`;
        cardDiv.classList.add("extracard", `${this.suit}_extra`);
        cardDiv.id = "actual_"+x;
        return cardDiv;
    }

    getHTML_personal(x) {
        const cardDiv = document.createElement("div");
        cardDiv.innerText = `${this.value}`;
        cardDiv.classList.add("extracard", `${this.suit}_extra`);
        cardDiv.id = "personal_"+x;
        return cardDiv;
    }

    getHTML_top(x) {
        const cardDiv = document.createElement("div");
        cardDiv.innerText = `${this.value}`;
        cardDiv.classList.add("extracard", `${this.suit}_extra`);
        cardDiv.id = "top_"+x;
        return cardDiv;
    }
}

function freshDeck() {

    var newDeck = []

    for (let i = 0; i < 13; i++){
        for (let j = 0; j < 4; j++){
            const newCard = new Card(SUITS[j], VALUES[i])
            newDeck.push(newCard);
        }
    }

    return newDeck;
}