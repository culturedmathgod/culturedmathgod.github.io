import Deck from "./deck.js"
// const fs = import ('fs');
// const csv = import ('csv-parser')
// const createCsvWriter = import ('csv-writer').createObjectCsvWriter;

var timesDealt = 0;
var deck, max_val, min_val, hand_strength, final_score, numHeld
var num_hands = 9;
var starting_hand_values = []
var starting_hand_suits = []
var final_hand_values = []
var final_hand_suits = []
var unique_cards = []
var count_unique_cards = []
var count_unique_cards_2 = []
var final_deuces = 0;
var round = 0
var agg_score = 0;
var round_score = 0;
var nat_rf_count, four_d_count, wild_rf_count, five_count, sf_count, quad_count, boat_count, flush_count, str_count, trips_count, two_pair_count, one_pair_count, highcard_count;

// Solver related variables
var EV_hand = []
var EV_configuration = []
var EV_order = [] 
var EV_combinations = []
var top5_EV_hand = []
var top5_EV_configuration = []
var top5_EV_combinations = []
var first_value, second_value, third_value
var first_text, second_text, third_text
var show_solver = 0;
var expected_total = 0;

startGame()

var score_chart = {
    "natural_royal_flush": 800,
    "four_deuces": 200,
    "wild_royal_flush": 25,
    "five_kind": 15,
    "straight_flush": 9,
    "quads": 5,
    "boat": 4,
    "flush": 2.1, // flush score gets converted to 2 later on. need distinct scores for searchability of hand names
    "straight": 2,
    "trips": 1,
    "two_pair": 0,
    "one_pair": -1,
    "high_card": -2
}

function startGame() {

    var graph = document.getElementById("myChart");
    var graph_container = document.getElementById("chart_container")
    graph.style.display = "block"
    graph_container.style.width = "400px"

    // Only option to start the game
    document.addEventListener('keydown', (e) => {
        if (e.key == "Enter") {
            gameFlow()
        }
    });

    // Listen for Solver
    // document.addEventListener('keydown', (e) => {
    //     if (e.key == "s") {

    //         if (show_solver == 0) {
    //             graph.style.display = "none"
    //             graph_container.style.height = "0px"
    //             graph_container.style.width = "0px"
    //             console.log("Hide graph, show solver")
    //             //displayEV();
    //             show_solver = 1;
    //         } else {
    //             removeSolver();
    //             console.log("Show graph, hide solver")
    //         }
    //     }
    // })

}

function gameFlow() {

    if(timesDealt != 1) {

        // Beginning of the Game. Increment Round
        round += 1;
        //document.getElementById("roundNum").innerHTML = "Round: "+ round;
        console.log("Beginning of Round: "+round);

        // Clear increments
        clearRoundIncrement();

        // Create new deck
        deck = new Deck();
        deck.shuffle();

        // Empty Old Hands used for Processing
        starting_hand_suits = []
        starting_hand_values = []
        final_hand_suits = []
        final_hand_values = []

        // Start New Round
        newRound(deck)
        //EVcalculator()

        return num_hands;
    } else {
        // Execute Final Round
        finalRound(deck)
    }
}

function removeSolver() {
    // Delete solver hands
    for (let i = 0; i < 5; i++) {
        for(let j = 0; j < 6; j++) {
            var oldSolver = document.getElementById('solver_hand'+i+"_slot"+j)
            if(oldSolver != null) {
                oldSolver.remove()
            }

            var solverStat = document.getElementById('EVstat')
            if(solverStat != null) {
                solverStat.remove()
            }
        }
    }

    show_solver = 0;
}

function newRound(deck) {

    // old blue: rgb(30,30,84)
    document.getElementById("main_hand").style.backgroundColor = "rgb(66,126,96)"

    //if(num_hands == null) {console.log("Number of hands not yet initialized")}
    //if(num_hands != null) {console.log("Number of hands selected: "+num_hands)}

    // Delete old extra card slots and hand strength slots
    if(num_hands > 1) {
        for (let k = 1; k < num_hands; k++) {
            var hand_num = k - 1;
            for (let i = 0; i < 5; i++) {
                var oldCards = document.getElementById('extrahand'+hand_num+'_slot'+i);
                var oldStrength = document.getElementById('hand_type'+hand_num);
                if (oldCards != null) {
                    oldCards.remove()
                    oldStrength.innerHTML = " "
                }
            }
        }
    }

    removeSolver()

    // Delete old cards in HTML and create new cards
    for (let i = 0; i < 5; i++) {
        if (timesDealt != 0) {
            var oldCards = document.getElementById("card"+i);
            var oldStrength = document.getElementById("hand_type")
            oldCards.remove()
            oldStrength.innerHTML = " "
        }
        var playerHand = document.querySelector('.player_slot'+i);
        var dealt_card = deck.cards.pop();

        playerHand.appendChild(dealt_card.getHTMLfirstRound(i));

        // Convert characters to numeric values before entering the analysis arrays
        if (dealt_card.value == "T") {dealt_card.value = "10"}
        if (dealt_card.value == "J") {dealt_card.value = "11"}
        if (dealt_card.value == "Q") {dealt_card.value = "12"}
        if (dealt_card.value == "K") {dealt_card.value = "13"}
        if (dealt_card.value == "A") {dealt_card.value = "14"}

        starting_hand_values.push(dealt_card.value);
        starting_hand_suits.push(dealt_card.suit);

    }

    timesDealt = 1;
    return deck, starting_hand_suits, starting_hand_values, num_hands;
}

function finalRound(deck) {

    // Set Final Hand to begin with Starting Hand
    for (let i = 0; i < 5; i++) {
        final_hand_values[i] = starting_hand_values[i];
        final_hand_suits[i] = starting_hand_suits[i];
    }

    // Create all the final hands with replacement + display them afterwards in their own divs
    for (let k = 0; k < num_hands; k++) {

        // Store all extra cards dealt so we can add it back for all final hands > 1
        var add_back = []

        // Actual Increment for Extra hands i.e. 0th extra hand up to 8th extra hand (9 max)
        var extra_hand_num = k - 1;

        // For the first new hand, replace the main area
        if(k == 0) {

            for (let i = 0; i < 5; i++) {

                var replace_card = document.getElementById('card'+i);

                // **For cards to be replaced
                if(replace_card.style.backgroundColor == "white" || replace_card.style.backgroundColor == "rbg(255, 255, 255)" || replace_card.style.backgroundColor == "" ) {
                    
                    // Remove Prior Card
                    var oldCards = document.getElementById("card"+i);
                    oldCards.remove()

                    // Add New Card
                    var playerHand = document.querySelector('.player_slot'+i);
                    var dealt_card = deck.cards.pop();
                    playerHand.appendChild(dealt_card.getHTMLfinalRound(i));

                    // Convert characters to numeric values before entering the analysis arrays
                    if (dealt_card.value == "T") {dealt_card.value = "10"}
                    if (dealt_card.value == "J") {dealt_card.value = "11"}
                    if (dealt_card.value == "Q") {dealt_card.value = "12"}
                    if (dealt_card.value == "K") {dealt_card.value = "13"}
                    if (dealt_card.value == "A") {dealt_card.value = "14"}

                    // For Post Processing
                    final_hand_values[i] = dealt_card.value;
                    final_hand_suits[i] = dealt_card.suit;

                    // Reverse the conversion
                    if (dealt_card.value == "10") {dealt_card.value = "T"}
                    if (dealt_card.value == "11") {dealt_card.value = "J"}
                    if (dealt_card.value == "12") {dealt_card.value = "Q"}
                    if (dealt_card.value == "13") {dealt_card.value = "K"}
                    if (dealt_card.value == "14") {dealt_card.value = "A"}

                    // For Extra Hands
                    add_back.push(dealt_card);
                }

                if(replace_card.style.backgroundColor == "gold") {replace_card.classList.add("unclickable")}


                // After all non-held cards have been replaced, add them back to the original deck post first round deal
                if(i == 4) {
                    for (let j = 0; j < add_back.length; j++) {
                        deck.push(add_back[j])
                    }

                    // Reset deck to post Round 1 state, but with a new configuration
                    deck.shuffle()
                }
            }

        }

        if (k > 0) {

            // For extra hands, populate the bottom area area
            for (let i = 0; i < 5; i++) {

                var replace_card = document.getElementById('card'+i);

                // **For cards to be replaced
                if(replace_card.style.backgroundColor == "white" || replace_card.style.backgroundColor == "rbg(255, 255, 255)" || replace_card.style.backgroundColor == "" ) {

                    // Add New Card to the Extra Hand slots 0 to 8 (max)
                    var playerHand = document.querySelector('.extra_hand'+extra_hand_num);
                    var dealt_card = deck.cards.pop();

                    playerHand.appendChild(dealt_card.getHTML_extra(extra_hand_num, i));

                    // Convert characters to numeric values before entering the analysis arrays
                    if (dealt_card.value == "T") {dealt_card.value = "10"}
                    if (dealt_card.value == "J") {dealt_card.value = "11"}
                    if (dealt_card.value == "Q") {dealt_card.value = "12"}
                    if (dealt_card.value == "K") {dealt_card.value = "13"}
                    if (dealt_card.value == "A") {dealt_card.value = "14"}

                    // For Post Processing
                    final_hand_values[i] = dealt_card.value;
                    final_hand_suits[i] = dealt_card.suit;

                    // Reverse the conversion
                    if (dealt_card.value == "10") {dealt_card.value = "T"}
                    if (dealt_card.value == "11") {dealt_card.value = "J"}
                    if (dealt_card.value == "12") {dealt_card.value = "Q"}
                    if (dealt_card.value == "13") {dealt_card.value = "K"}
                    if (dealt_card.value == "14") {dealt_card.value = "A"}

                    // For Extra Hands
                    add_back.push(dealt_card);

                } else {
                    // **For cards that were held
                    var playerHand = document.querySelector('.extra_hand'+extra_hand_num);
                    var extraSuit = final_hand_suits[i]
                    var extraValue = final_hand_values[i]

                    if (final_hand_values[i] == "10") {extraValue = "T"}
                    if (final_hand_values[i] == "11") {extraValue = "J"}
                    if (final_hand_values[i] == "12") {extraValue = "Q"}
                    if (final_hand_values[i] == "13") {extraValue = "K"}
                    if (final_hand_values[i] == "14") {extraValue = "A"}
                    
                    playerHand.appendChild(getHTML_extra2(extraSuit, extraValue, extra_hand_num, i));
                }

                if(i == 4) {
                    for (let j = 0; j < add_back.length; j++) {
                        deck.push(add_back[j]);
                    }

                    // Reset deck to post Round 1 state, but with a new configuration
                    deck.shuffle()
                }
            }
        }

        handProcessing();
        handScore();

        document.getElementById("main_hand").style.backgroundColor = "grey"

        if (k == 0) {document.getElementById("hand_type").innerHTML = hand_strength}
        if (extra_hand_num >= 0) {document.getElementById("hand_type"+extra_hand_num).innerHTML = hand_strength}

        roundHandIncrement(hand_strength);
        
        round_score += final_score - 1;
        
        if (k == num_hands - 1) {
            agg_score += round_score;
            expected_total += Math.max(...top5_EV_hand)*num_hands - num_hands;
            // document.getElementById("currScore").innerHTML = "Previous Total Round Payout: "+round_score;
            // document.getElementById("cumScore").innerHTML = "Total Aggeregate Score is: "+ agg_score;
            addData(myChart, round, agg_score, round_score, expected_total)
            round_score = 0
        }

        timesDealt = 2;

    }

}

function getHTML_extra2(suit, value, hand, slot) {
    const cardDiv = document.createElement("div");
    cardDiv.innerText = value;
    cardDiv.classList.add("extracard", suit+"_extra");
    cardDiv.id = "extrahand"+hand+"_slot"+slot;
    cardDiv.setAttribute("style", "background-color: gold");
    return cardDiv;
}

function handProcessing() {

    // Reset the processing arrays and variables
    unique_cards = []
    count_unique_cards = []
    final_deuces = 0

    // List of unique values in final hand
    for (let i = 0; i < 5; i++) {
        if (unique_cards.includes(final_hand_values[i]) == false) {
            unique_cards.push(final_hand_values[i])
        }
    }

    var unique_length = unique_cards.length;

    // List of count of unique values in final hand
    for (let i = 0; i < unique_length; i++) {
        count_unique_cards[i] = 0;
        for (let j = 0; j < 5; j++) {
            if (unique_cards[i] == final_hand_values[j]) {
                count_unique_cards[i] += 1;
            }
        }
    }
    // Count number of deuces
    for (let i = 0; i < unique_length; i++) {
        if (unique_cards[i] == 2) {
            final_deuces = count_unique_cards[i];
        }
    }

    max_val = Math.max(...count_unique_cards);
    min_val = Math.min(...count_unique_cards);

    // console.log("List of unique cards: "+unique_cards)
    // console.log("List of the count of unique cards: "+count_unique_cards)
    // console.log("Number of final deuces: "+final_deuces)

    return unique_cards, count_unique_cards, final_deuces, max_val, min_val;
}

function handScore() {

    // need to reset the high score
    final_score = -2

    // Straight Flush+
    if (flush() == true && straight() == true) {

        // Assume there is going to be a Royal Flush
        var only_broadway = true
        for (let i = 0; i < 5; i++) {
            if (final_hand_values[i] < 10 && final_hand_values[i] != 2) {only_broadway = false}
        }

        if (Math.min(...final_hand_values) == 10 && final_deuces == 0) {
            final_score = score_chart.natural_royal_flush
        } else if (only_broadway == false) {
            final_score = score_chart.straight_flush
        } else {
            final_score = score_chart.wild_royal_flush
        }
    }

    // Five of a Kind
    if (five_kind() == true) {
        if (final_deuces == 4 ) {
            final_score = Math.max(final_score, score_chart.four_deuces)
        } else {
            final_score = Math.max(final_score, score_chart.five_kind)
        }
    }

    // Quads
    if (quads() == true) {
        final_score = Math.max(final_score, score_chart.quads)
    }

    // Full House
    if (boat() == true) {
        final_score = Math.max(final_score, score_chart.boat)
    }

    // Flush
    if (flush() == true) {
        final_score = Math.max(final_score, score_chart.flush)
    }

    // Straight
    if (straight() == true) {
        final_score = Math.max(final_score, score_chart.straight)
    }

    // Trips
    if (trips() == true) {
        final_score = Math.max(final_score, score_chart.trips)
    }

    // Two Pair
    if (two_pair() == true) {
        final_score = Math.max(final_score, score_chart.two_pair)
    }

    // One Pair
    if (one_pair() == true) {
        final_score = Math.max(final_score, score_chart.one_pair)
    }

    // High Card
    if (highcard() == true) {
        final_score = Math.max(final_score, score_chart.high_card)
    }

    if (final_score == score_chart.natural_royal_flush) {hand_strength = "Natural Royal Flush"}
    if (final_score == score_chart.four_deuces) {hand_strength = "Four Deuces"}
    if (final_score == score_chart.wild_royal_flush) {hand_strength = "Wild Royal Flush"}
    if (final_score == score_chart.five_kind) {hand_strength = "Five of a Kind"}
    if (final_score == score_chart.straight_flush) {hand_strength = "Straight Flush"}
    if (final_score == score_chart.quads) {hand_strength = "Four of a Kind"}
    if (final_score == score_chart.boat) {hand_strength = "Full House"}
    if (final_score == score_chart.flush) {hand_strength = "Flush"}
    if (final_score == score_chart.straight) {hand_strength = "Straight"}
    if (final_score == score_chart.trips) {hand_strength = "Three of a Kind"}
    if (final_score == score_chart.two_pair) {hand_strength = "Two Pair"}
    if (final_score == score_chart.one_pair) {hand_strength = "One Pair"}
    if (final_score == score_chart.high_card) {hand_strength = "High Card"}

    final_score = Math.max(final_score, 0)

    if(final_score == 2.1) {final_score = 2}
    
    return final_score, hand_strength;

}

// HAND STRENGTH FUNCTIONS

function five_kind() {
    if (final_deuces == 0) {return false} 
    if (max_val == 4 && min_val == 1 && unique_cards.length == 2 && final_deuces == 1) {return true} 
    if (max_val == 3 && min_val == 2 && unique_cards.length == 2 && final_deuces == 2) {return true}  
    if (max_val == 3 && min_val == 2 && unique_cards.length == 2 && final_deuces == 3) {return true}  
    if (max_val == 4 && min_val == 1 && unique_cards.length == 2 && final_deuces == 4) {return true}  
    return false 
}

function quads() {
    if (final_deuces == 4) {return false}
    if (max_val == 3 && min_val == 1 && unique_cards.length == 3 && final_deuces == 3) {return true}
    if (max_val == 2 && min_val == 1 && unique_cards.length == 3 && final_deuces == 2) {return true}
    if (max_val == 3 && min_val == 1 && unique_cards.length == 3 && final_deuces == 1) {return true}
    if (max_val == 4 && min_val == 1 && unique_cards.length == 2 && final_deuces == 0) {return true}
    return false
}

function boat() {
    var count_unique_cards_2 = []
    for (let i = 0; i < unique_cards.length; i++) {
        count_unique_cards_2.push(count_unique_cards[i])
    }
    count_unique_cards_2.sort(function(a, b){return a - b});

    if (unique_cards.length == 3 && count_unique_cards_2[2] == 2 && count_unique_cards_2[1] == 2 && final_deuces == 1) {return true}
    if (unique_cards.length == 2 && Math.max(...count_unique_cards_2) == 3 && Math.min(...count_unique_cards_2) == 2 && final_deuces == 0) {return true}
    return false
}

function trips() {
    if (max_val == 2 && unique_cards.length == 4 && final_deuces == 2) {return true}
    if (unique_cards.length == 4 && final_deuces == 1) {return true}
    if (max_val == 3 && unique_cards.length == 3 && final_deuces == 0) {return true}
    return false
}

function two_pair() {
    var count_unique_cards_2 = []
    for (let i = 0; i < unique_cards.length; i++) {
        count_unique_cards_2.push(count_unique_cards[i])
    }
    count_unique_cards_2.sort(function(a, b){return a - b});

    if (unique_cards.length == 3 && count_unique_cards_2[2] == 2 && count_unique_cards_2[1] == 2 && final_deuces == 0) {return true}
    return false
}

function one_pair() {
    if (unique_cards.length == 5 && final_deuces == 1) {return true}
    if (unique_cards.length == 4 && final_deuces == 0) {return true}
    return false
}

function highcard() {
    if (max_val == 1 && final_deuces == 0) {return true}
    return false
}

function flush() {

    var unique_suits = []

    for (let i = 0; i < 5; i++) {
        if (final_hand_values[i] != "2") {
            if (unique_suits.includes(final_hand_suits[i]) == false) {
                unique_suits.push(final_hand_suits[i])
            }
        }
    }

    if (unique_suits.length == 1) {return true}
    return false
}

function straight() {

    // Straight is automatically possible with 4 deuces
    if (final_deuces == 4) {return true}

    // 1. If there are duplicates of ranks that are non-deuces, then no straight will be achieved

    // Create duplicates of the unique count array
    count_unique_cards_2 = []

    // Do not copy the deuces into the new unique cards/count arrays
    for (let i = 0; i < unique_cards.length; i++) {
        if (final_hand_values[i] != "2") {
            count_unique_cards_2.push(count_unique_cards[i])
        }
    }

    // Any non-deuce duplicate means no straight is possible
    if (Math.max(...count_unique_cards_2) > 1) {return false}

    // 2. Now check that the number of deuces we have can cover the gaps between our other cards
    var gaps = 0;
    var final_hand_values_2 = []

    // Duplicate the original hand without deuces
    for ( let i = 0; i < 5; i++) {
        if (final_hand_values[i] != "2") {
            final_hand_values_2.push(final_hand_values[i])
        }
    }

    // Sort the new hand and convert to numbers
    final_hand_values_2.sort(function(a, b){return a - b})

    // Decide if the A, if any, will remain at the top-end or bottom-end, then move the A to the front of the list and make A = -1
    // Check the last card in the array if we have an A
    if (final_hand_values_2[4-final_deuces] == "14") {
        // This determines the furthest allowable gap for A to be used in the front end or backend
        if (parseInt(final_hand_values_2[4-final_deuces]) - parseInt(final_hand_values_2[3-final_deuces]) - 1 > final_deuces) {
            final_hand_values_2.pop()
            final_hand_values_2.splice(0, 0, "-1")
        }
    }

    for (let i = 0; i < final_hand_values_2.length-1; i++) {
        gaps = gaps + parseInt(final_hand_values_2[i+1]) - (parseInt(final_hand_values_2[i]) + 1);
    }

    if (final_deuces >= gaps) {return true}

    return false
}

// ROUND SCORE INCREMENT FUNCTIONS

function roundHandIncrement(hand) {

    if (hand == "Natural Royal Flush") {innerTextIncrement("nat_rf")}
    if (hand == "Four Deuces") {innerTextIncrement("four_d")}
    if (hand == "Wild Royal Flush") {innerTextIncrement("wild_rf")}
    if (hand == "Five of a Kind") {innerTextIncrement("fives")}
    if (hand == "Straight Flush") {innerTextIncrement("sf")}
    if (hand == "Four of a Kind") {innerTextIncrement("quads")}
    if (hand == "Full House") {innerTextIncrement("boat")}
    if (hand == "Flush") {innerTextIncrement("fl")}
    if (hand == "Straight") {innerTextIncrement("str")}
    if (hand == "Three of a Kind") {innerTextIncrement("trips")}
    if (hand == "Two Pair") {innerTextIncrement("two_p")}
    if (hand == "One Pair") {innerTextIncrement("one_p")}
    if (hand == "High Card") {innerTextIncrement("hc")}

}

function innerTextIncrement(id_hand) {
    var total_hand = document.getElementById(id_hand).innerText;
    var value_total = parseInt(total_hand);

    var round_id_inc = "inc_"+ id_hand;
    var round_hand = document.getElementById(round_id_inc).innerHTML;
    var value_round = parseInt(round_hand);
    
    value_total += 1;
    value_round += 1;

    // For the aggregate hand count
    document.getElementById(id_hand).innerText = value_total;

    // For the round increment count
    document.getElementById(round_id_inc).innerText = "+"+value_round;
    document.getElementById(round_id_inc).style.color = "gold";
    document.getElementById(round_id_inc).style.visibility = "visible";

}

function clearRoundIncrement () {
    clearIncrement("inc_nat_rf")
    clearIncrement("inc_four_d")
    clearIncrement("inc_wild_rf")
    clearIncrement("inc_fives")
    clearIncrement("inc_sf")
    clearIncrement("inc_quads")
    clearIncrement("inc_boat")
    clearIncrement("inc_fl")
    clearIncrement("inc_str")
    clearIncrement("inc_trips")
    clearIncrement("inc_two_p")
    clearIncrement("inc_one_p")
    clearIncrement("inc_hc")
}

function clearIncrement(inc_id) {
    document.getElementById(inc_id).innerText = 0;
    document.getElementById(inc_id).style.visibility = "hidden";
}

// EV CALCULATOR FUNCTIONS

function convertBroadtoNum(value) {
    
    if (value == "T") {value = "10"}
    if (value == "J") {value = "11"}
    if (value == "Q") {value = "12"}
    if (value == "K") {value = "13"}
    if (value == "A") {value = "14"}

    return value;
}

function EVcalculator() {

    // Clear the EV hands and configurations from the prior run
    EV_configuration = []
    EV_hand = []
    EV_combinations = []

    // Create a copy of the deck
    var deck_holder = []

    for(let i = 0; i < 47; i++){
        var new_card = deck.cards.shift()

        deck_holder.push(new_card)
        deck.push(new_card)
    }

    // Create slots for the value and suit of the cards to be drawn
    var next_card_suit, next_card_value

    // Generate All Combinations of Hands
    for(let i = 0; i < 2; i++) {
        for(let j = 0; j < 2; j++) {
            for(let k = 0; k < 2; k++) {
                for(let l = 0; l < 2; l++) {
                    for(let m = 0; m < 2; m++) {

                        numHeld = 5 - (i + j + k + l + m);
                        var heldCards = [i, j, k, l, m]
                        var cardReplaced = 0

                        nat_rf_count = 0
                        four_d_count = 0
                        wild_rf_count = 0
                        five_count = 0
                        sf_count = 0
                        quad_count = 0
                        boat_count = 0
                        flush_count = 0
                        str_count = 0
                        trips_count = 0
                        two_pair_count = 0
                        one_pair_count = 0
                        highcard_count = 0

                        if(numHeld == 5) {

                            final_hand_suits = []
                            final_hand_values = []

                            for(let n = 0; n < 5; n++) {

                                next_card_suit = starting_hand_suits[n]
                                next_card_value = starting_hand_values[n]

                                // Convert Broadway to Numeric
                                next_card_value = convertBroadtoNum(next_card_value)
                                
                                final_hand_values.push(next_card_value)
                                final_hand_suits.push(next_card_suit)
                                
                            }

                            handProcessingEV()
                            handCount()
                        }

                        // Hold cards if 0, new card if 1
                        if(numHeld == 4) {
                            for(let a = 0; a < 47; a++) {

                                final_hand_suits = []
                                final_hand_values = []

                                for(let n = 0; n < 5; n++) {
                                    if(heldCards[n] == 0) {
                                        next_card_suit = starting_hand_suits[n]
                                        next_card_value = starting_hand_values[n]

                                        // Convert Broadway to Numeric
                                        next_card_value = convertBroadtoNum(next_card_value)
                                        
                                        final_hand_values.push(next_card_value)
                                        final_hand_suits.push(next_card_suit)
                                    } else {
                                        next_card_suit = deck_holder[a].suit
                                        next_card_value = deck_holder[a].value

                                        // Convert Broadway to Numeric
                                        next_card_value = convertBroadtoNum(next_card_value)
                                        
                                        final_hand_values.push(next_card_value)
                                        final_hand_suits.push(next_card_suit)
                                    }
                                }
                                handProcessingEV()
                                handCount()
                            }
                        }

                        if(numHeld == 3) {
                            for(let a = 0; a < 47; a++) {
                                for(let b = a + 1; b < 47; b++) {

                                    cardReplaced = 0;

                                    final_hand_suits = []
                                    final_hand_values = []

                                    for(let n = 0; n < 5; n++) {
                                        if(heldCards[n] == 0) {
                                            
                                            next_card_suit = starting_hand_suits[n]
                                            next_card_value = starting_hand_values[n]

                                            // Convert Broadway to Numeric
                                            next_card_value = convertBroadtoNum(next_card_value)
                                            
                                            final_hand_values.push(next_card_value)
                                            final_hand_suits.push(next_card_suit)
                                        }  
                                        else if(heldCards[n] == 1 && cardReplaced == 0) {
                                            next_card_suit = deck_holder[a].suit
                                            next_card_value = deck_holder[a].value

                                            // Convert Broadway to Numeric
                                            next_card_value = convertBroadtoNum(next_card_value)
                                            
                                            final_hand_values.push(next_card_value)
                                            final_hand_suits.push(next_card_suit)
                                            cardReplaced += 1;  
                                        }
                                        else {
                                            next_card_suit = deck_holder[b].suit
                                            next_card_value = deck_holder[b].value

                                            // Convert Broadway to Numeric
                                            next_card_value = convertBroadtoNum(next_card_value)
                                            
                                            final_hand_values.push(next_card_value)
                                            final_hand_suits.push(next_card_suit)
                                        }
                                        
                                    }
                                    
                                    handProcessingEV()
                                    handCount()
                                }
                            }
                        }

                        if(numHeld == 2) {
                            for(let a = 0; a < 47; a++) {
                                for(let b = a + 1; b < 47; b++) {
                                    for(let c = b + 1; c < 47; c++) {

                                        cardReplaced = 0;

                                        final_hand_suits = []
                                        final_hand_values = []

                                        for(let n = 0; n < 5; n++) {
                                            if(heldCards[n] == 0) {
                                                
                                                next_card_suit = starting_hand_suits[n]
                                                next_card_value = starting_hand_values[n]

                                                // Convert Broadway to Numeric
                                                next_card_value = convertBroadtoNum(next_card_value)
                                                
                                                final_hand_values.push(next_card_value)
                                                final_hand_suits.push(next_card_suit)
                                            }  
                                            else if(heldCards[n] == 1 && cardReplaced == 0) {
                                                next_card_suit = deck_holder[a].suit
                                                next_card_value = deck_holder[a].value

                                                // Convert Broadway to Numeric
                                                next_card_value = convertBroadtoNum(next_card_value)
                                                
                                                final_hand_values.push(next_card_value)
                                                final_hand_suits.push(next_card_suit)
                                                cardReplaced += 1;
                                            }
                                            else if(heldCards[n] == 1 && cardReplaced == 1) {
                                                next_card_suit = deck_holder[b].suit
                                                next_card_value = deck_holder[b].value

                                                // Convert Broadway to Numeric
                                                next_card_value = convertBroadtoNum(next_card_value)
                                                
                                                final_hand_values.push(next_card_value)
                                                final_hand_suits.push(next_card_suit)
                                                cardReplaced += 1;
                                            }
                                            else {
                                                next_card_suit = deck_holder[c].suit
                                                next_card_value = deck_holder[c].value

                                                // Convert Broadway to Numeric
                                                next_card_value = convertBroadtoNum(next_card_value)
                                                
                                                final_hand_values.push(next_card_value)
                                                final_hand_suits.push(next_card_suit)
                                            }
                                        }

                                        handProcessingEV()
                                        handCount()
                                    }
                                }
                            }
                        }

                        if(numHeld == 1) {
                            for(let a = 0; a < 47; a++) {
                                for(let b = a + 1; b < 47; b++) {
                                    for(let c = b + 1; c < 47; c++) {
                                        for(let d = c + 1; d < 47; d++) {

                                            cardReplaced = 0;

                                            final_hand_suits = []
                                            final_hand_values = []

                                            for(let n = 0; n < 5; n++) {
                                                if(heldCards[n] == 0) {
                                                    
                                                    next_card_suit = starting_hand_suits[n]
                                                    next_card_value = starting_hand_values[n]

                                                    // Convert Broadway to Numeric
                                                    next_card_value = convertBroadtoNum(next_card_value)
                                                    
                                                    final_hand_values.push(next_card_value)
                                                    final_hand_suits.push(next_card_suit)
                                                }  
                                                else if(heldCards[n] == 1 && cardReplaced == 0) {
                                                    next_card_suit = deck_holder[a].suit
                                                    next_card_value = deck_holder[a].value

                                                    // Convert Broadway to Numeric
                                                    next_card_value = convertBroadtoNum(next_card_value)
                                                    
                                                    final_hand_values.push(next_card_value)
                                                    final_hand_suits.push(next_card_suit)
                                                    cardReplaced += 1;
                                                }
                                                else if(heldCards[n] == 1 && cardReplaced == 1) {
                                                    next_card_suit = deck_holder[b].suit
                                                    next_card_value = deck_holder[b].value

                                                    // Convert Broadway to Numeric
                                                    next_card_value = convertBroadtoNum(next_card_value)
                                                    
                                                    final_hand_values.push(next_card_value)
                                                    final_hand_suits.push(next_card_suit)
                                                    cardReplaced += 1;
                                                }
                                                else if(heldCards[n] == 1 && cardReplaced == 2) {
                                                    next_card_suit = deck_holder[c].suit
                                                    next_card_value = deck_holder[c].value

                                                    // Convert Broadway to Numeric
                                                    next_card_value = convertBroadtoNum(next_card_value)
                                                    
                                                    final_hand_values.push(next_card_value)
                                                    final_hand_suits.push(next_card_suit)
                                                    cardReplaced += 1;
                                                }
                                                else {
                                                    next_card_suit = deck_holder[d].suit
                                                    next_card_value = deck_holder[d].value

                                                    // Convert Broadway to Numeric
                                                    next_card_value = convertBroadtoNum(next_card_value)
                                                    
                                                    final_hand_values.push(next_card_value)
                                                    final_hand_suits.push(next_card_suit)
                                                }
                                            }

                                            handProcessingEV()
                                            handCount()
                                        }
                                    }
                                }
                            }
                        }

                        if(numHeld == 0) {
                            for(let a = 0; a < 47; a++) {
                                for(let b = a + 1; b < 47; b++) {
                                    for(let c = b + 1; c < 47; c++) {
                                        for(let d = c + 1; d < 47; d++) {
                                            for(let e = d + 1; e < 47; e++) {

                                                cardReplaced = 0;

                                                final_hand_suits = []
                                                final_hand_values = []

                                                for(let n = 0; n < 5; n++) {
                                                    if(heldCards[n] == 0) {
                                                        
                                                        next_card_suit = starting_hand_suits[n]
                                                        next_card_value = starting_hand_values[n]

                                                        // Convert Broadway to Numeric
                                                        next_card_value = convertBroadtoNum(next_card_value)
                                                        
                                                        final_hand_values.push(next_card_value)
                                                        final_hand_suits.push(next_card_suit)
                                                    }  
                                                    else if(heldCards[n] == 1 && cardReplaced == 0) {
                                                        next_card_suit = deck_holder[a].suit
                                                        next_card_value = deck_holder[a].value

                                                        // Convert Broadway to Numeric
                                                        next_card_value = convertBroadtoNum(next_card_value)
                                                        
                                                        final_hand_values.push(next_card_value)
                                                        final_hand_suits.push(next_card_suit)
                                                        cardReplaced += 1;
                                                    }
                                                    else if(heldCards[n] == 1 && cardReplaced == 1) {
                                                        next_card_suit = deck_holder[b].suit
                                                        next_card_value = deck_holder[b].value

                                                        // Convert Broadway to Numeric
                                                        next_card_value = convertBroadtoNum(next_card_value)
                                                        
                                                        final_hand_values.push(next_card_value)
                                                        final_hand_suits.push(next_card_suit)
                                                        cardReplaced += 1;
                                                    }
                                                    else if(heldCards[n] == 1 && cardReplaced == 2) {
                                                        next_card_suit = deck_holder[c].suit
                                                        next_card_value = deck_holder[c].value

                                                        // Convert Broadway to Numeric
                                                        next_card_value = convertBroadtoNum(next_card_value)
                                                        
                                                        final_hand_values.push(next_card_value)
                                                        final_hand_suits.push(next_card_suit)
                                                        cardReplaced += 1;
                                                    }
                                                    else if(heldCards[n] == 1 && cardReplaced == 3) {
                                                        next_card_suit = deck_holder[d].suit
                                                        next_card_value = deck_holder[d].value

                                                        // Convert Broadway to Numeric
                                                        next_card_value = convertBroadtoNum(next_card_value)
                                                        
                                                        final_hand_values.push(next_card_value)
                                                        final_hand_suits.push(next_card_suit)
                                                        cardReplaced += 1;
                                                    }
                                                    else {
                                                        next_card_suit = deck_holder[e].suit
                                                        next_card_value = deck_holder[e].value

                                                        // Convert Broadway to Numeric
                                                        next_card_value = convertBroadtoNum(next_card_value)
                                                        
                                                        final_hand_values.push(next_card_value)
                                                        final_hand_suits.push(next_card_suit)
                                                    }
                                                }

                                                handProcessingEV()
                                                handCount()
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Summary per configuration
                        var total_options = nat_rf_count + four_d_count + wild_rf_count + five_count + sf_count + quad_count + boat_count + flush_count + str_count + trips_count + two_pair_count + one_pair_count + highcard_count;
                        var losing_options = two_pair_count + one_pair_count + highcard_count;
                        var winning_options = total_options - losing_options;
                        var sfBetter_options = nat_rf_count + four_d_count + wild_rf_count + five_count + sf_count;
                        var EV_option = nat_rf_count*score_chart.natural_royal_flush + four_d_count*score_chart.four_deuces + wild_rf_count*score_chart.wild_royal_flush + five_count*score_chart.five_kind + sf_count*score_chart.straight_flush + quad_count*score_chart.quads + boat_count*score_chart.boat + flush_count*score_chart.flush + str_count*score_chart.straight + trips_count*score_chart.trips;
                        var configuration = heldCards
                        var combinations = [total_options, winning_options, sfBetter_options, nat_rf_count, four_d_count, wild_rf_count, five_count, sf_count, quad_count, boat_count, flush_count, str_count, trips_count, two_pair_count, one_pair_count, highcard_count]

                        EV_option = Math.round(EV_option/total_options*1000)/1000

                        EV_hand.push(EV_option)
                        EV_configuration.push(configuration)
                        EV_combinations.push(combinations)

                        // console.log(heldCards)
                        // summaryEV()

                    }
                }
            }
        }
    }

    sortEV()

}

function handProcessingEV() {

    // Reset the processing arrays and variables
    unique_cards = []
    count_unique_cards = []
    final_deuces = 0

    // List of unique values in final hand
    for (let i = 0; i < 5; i++) {
        if (unique_cards.includes(final_hand_values[i]) == false) {
            unique_cards.push(final_hand_values[i])
        }
    }

    var unique_length = unique_cards.length;

    // List of count of unique values in final hand
    for (let i = 0; i < unique_length; i++) {
        count_unique_cards[i] = 0;
        for (let j = 0; j < 5; j++) {
            if (unique_cards[i] == final_hand_values[j]) {
                count_unique_cards[i] += 1;
            }
        }
    }
    // Count number of deuces
    for (let i = 0; i < unique_length; i++) {
        if (unique_cards[i] == 2) {
            final_deuces = count_unique_cards[i];
        }
    }

    max_val = Math.max(...count_unique_cards);
    min_val = Math.min(...count_unique_cards);

    return unique_cards, count_unique_cards, final_deuces, max_val, min_val;
}

function handCount() {

    // Straight Flush+
    if ((flush() == true && straight() == true) || five_kind() == true) {

        // Assume there is going to be a Royal Flush
        var only_broadway = true

        for (let i = 0; i < 5; i++) {
            if (final_hand_values[i] < 10 && final_hand_values[i] != 2) {only_broadway = false}
        }

        if (Math.min(...final_hand_values) == 10 && flush() == true && straight() == true) {
            // if(numHeld == 4) {console.log("Nat RF")}
            nat_rf_count += 1;
        } else if (final_deuces == 4) {
            // if(numHeld == 4) {console.log("Four D")}
            four_d_count += 1;
        } else if (only_broadway == true && flush() == true && straight() == true) {
            // if(numHeld == 4) {console.log("Wild RF")}
            wild_rf_count += 1;
        } else if (five_kind() == true) {
            // if(numHeld == 4) {console.log("Fives")}
            five_count += 1;
        } else {
            // if(numHeld == 4) {console.log("SF")}
            sf_count += 1;
        }
        return;
    }

    // Five of a Kind
    // if (five_kind() == true) {
    //     if (final_deuces == 4) {
    //         four_d_count += 1;
    //     } else {
    //         five_count += 1;
    //     }
    //     return
    // }

    // Quads
    if (quads() == true) {
        // if(numHeld == 4) {console.log("Quads")}
        quad_count += 1;
        return;
    }

    // Full House
    if (boat() == true) {
        // if(numHeld == 4) {console.log("Boat")}
        boat_count += 1;
        return;
    }

    // Flush
    if (flush() == true) {
        // if(numHeld == 4) {console.log("Flush")}
        flush_count += 1;
        return;
    }

    // Straight
    if (straight() == true) {
        // if(numHeld == 4) {console.log("Straight")}
        str_count += 1;
        return;
    }

    // Trips
    if (trips() == true) {
        // if(numHeld == 4) {console.log("Trips")}
        trips_count += 1;
        return;
    }

    // Two Pair
    if (two_pair() == true) {
        // if(numHeld == 4) {console.log("TP")}
        two_pair_count += 1;
        return;
    }

    // One Pair
    if (one_pair() == true) {
        // if(numHeld == 4) {console.log("OP")}
        one_pair_count += 1;
        return;
    }

    // High Card
    if (highcard() == true) {
        // if(numHeld == 4) {console.log("HC")}
        highcard_count += 1;
        return;
    }

}

function summaryEV() {
    console.log("Total number of Natural RF chances: "+ nat_rf_count)
    console.log("Total number of Four Deuces chances: "+ four_d_count)
    console.log("Total number of Wild RF chances: "+ wild_rf_count)
    console.log("Total number of Fives chances: "+ five_count)
    console.log("Total number of Straight Flush chances: "+ sf_count)
    console.log("Total number of Quads chances: "+ quad_count)
    console.log("Total number of Full House chances: "+ boat_count)
    console.log("Total number of Flush chances: "+ flush_count)
    console.log("Total number of Straight chances: "+ str_count)
    console.log("Total number of Trips chances: "+ trips_count)
    console.log("Total number of Two Pair chances: "+ two_pair_count)
    console.log("Total number of One Pair chances: "+ one_pair_count)
    console.log("Total number of High Card chances: "+ highcard_count)
}

function sortEV() {

    // Reset order and top5 arrays from prior run
    for(let i = 0; i < 32; i++) {EV_order[i] = 0}
    top5_EV_configuration = []
    top5_EV_hand = []
    top5_EV_combinations = []

    // Sort EV options; calculate how many configurations beat all the others through comparison
    for(let i = 0; i < 31; i++){
        for(let j = i + 1; j < 32; j++){
            if(EV_hand[i] >= EV_hand[j]) {EV_order[i] += 1}
            if(EV_hand[j] >= EV_hand[i]) {EV_order[j] += 1}
        }
    }

    // Obtain the top N options
    var num_options = 0;

    for(let k = 31; k >= 0; k--){

        if(EV_order.includes(k) == true) {

            var counter = 0;
            for(let l = 0; l < 32; l++){
                if(EV_order[l] == k) {
                    counter += 1;
                }
            }

            var start_index = 0
            for (let m = 0; m < counter; m++){
                top5_EV_configuration.push(EV_configuration[EV_order.indexOf(k, start_index)])
                top5_EV_hand.push(EV_hand[EV_order.indexOf(k, start_index)])
                top5_EV_combinations.push(EV_combinations[EV_order.indexOf(k, start_index)])
                start_index = EV_order.indexOf(k, start_index) + 1;
                num_options += 1;

                // Top N options decided here
                if(num_options == 5) {return}
            }
        }
    }
    
}

function getHTML_solverCards(suit, value, slot, held, hand) {
    const cardDiv = document.createElement("div");
    cardDiv.innerText = value;
    cardDiv.classList.add("extracard", suit+"_extra");
    cardDiv.id = "solver_hand"+hand+"_slot"+slot;
    if(held == 1) {cardDiv.setAttribute("style", "background-color: grey")}
    return cardDiv;
}

function getHTML_solverStats(label, value){
    const statDiv = document.createElement("div");
    const titleDiv = document.createElement("div");
    const valueDiv = document.createElement("div");

    statDiv.id = "EVstat"
    titleDiv.id = "EVtitle"
    valueDiv.id = "EVvalue"

    titleDiv.classList.add("EVtitle")
    valueDiv.classList.add("EVvalue")

    titleDiv.innerText = label
    valueDiv.innerText = value

    statDiv.appendChild(titleDiv)
    statDiv.appendChild(valueDiv)

    return statDiv;
}

function displayEV() {

    // Iterate over the 5 cards in the top 5 combinations for display. i = combination, j = slot in the combination
    for(let i = 0; i < 5; i++) {

        var solverHand = document.querySelector('.solver_hand'+i);

        for(let j = 0; j < 5; j++) {

            var temp_value = [];

            if (starting_hand_values[j] == "10") {temp_value.push("T")}
            if (starting_hand_values[j] == "11") {temp_value.push("J")}
            if (starting_hand_values[j] == "12") {temp_value.push("Q")}
            if (starting_hand_values[j] == "13") {temp_value.push("K")}
            if (starting_hand_values[j] == "14") {temp_value.push("A")}

            if(temp_value[0] == null) {
                temp_value.push(starting_hand_values[j])
            }

            solverHand.appendChild(getHTML_solverCards(starting_hand_suits[j],temp_value[0],j,top5_EV_configuration[i][j],i));

        }

        // Introduce the Stats to each hand
        for(let k = 0; k < 6; k++) {

            topN_handStrength(top5_EV_combinations[i])

            if (k == 0) {solverHand.appendChild(getHTML_solverStats("EV", top5_EV_hand[i]))}
            if (k == 1) {solverHand.appendChild(getHTML_solverStats("P(win)", Math.round(top5_EV_combinations[i][1]/top5_EV_combinations[i][0]*1000)/10))}
            if (k == 2) {solverHand.appendChild(getHTML_solverStats("P(SF+)", Math.round(top5_EV_combinations[i][2]/top5_EV_combinations[i][0]*1000)/10))}
            if (k == 3) {solverHand.appendChild(getHTML_solverStats(first_text, Math.round(first_value/top5_EV_combinations[i][0]*1000)/10))}
            if (k == 4) {solverHand.appendChild(getHTML_solverStats(second_text, Math.round(second_value/top5_EV_combinations[i][0]*1000)/10))}
            if (k == 5) {solverHand.appendChild(getHTML_solverStats(third_text, Math.round(third_value/top5_EV_combinations[i][0]*1000)/10))}
        }
    }
}

function solverTextTopN(rank) {

    var solverText;

    if(rank == 0) {solverText = "P(Nat.RF)"}
    if(rank == 1) {solverText = "P(FourD)"}
    if(rank == 2) {solverText = "P(WildRF)"}
    if(rank == 3) {solverText = "P(Fives)"}
    if(rank == 4) {solverText = "P(Str.Fl)"}
    if(rank == 5) {solverText = "P(Quads)"}
    if(rank == 6) {solverText = "P(House)"}
    if(rank == 7) {solverText = "P(Flush)"}
    if(rank == 8) {solverText = "P(Str.)"}
    if(rank == 9) {solverText = "P(Trips)"}

    return solverText
}

function topN_handStrength(combinations) {

    var handCombo = []
    var fixedCombo = []

    for(let i = 3; i < combinations.length-3; i++) {
        fixedCombo.push(combinations[i])
        handCombo.push(combinations[i])
    }

    var index;

    first_value = Math.max(...handCombo)
    index = fixedCombo.indexOf(first_value)
    handCombo.splice(index, 1)
    first_text = solverTextTopN(index)

    second_value = Math.max(...handCombo)
    index = fixedCombo.indexOf(second_value)
    handCombo.splice(index, 1)
    if(second_value == 0) {second_text = "N/A"}
    if(second_value != 0) {second_text = solverTextTopN(index)}

    third_value = Math.max(...handCombo)
    index = fixedCombo.indexOf(third_value)
    handCombo.splice(index, 1)
    if(third_value == 0) {third_text = "N/A"}
    if(third_value != 0) {third_text = solverTextTopN(index)}

    //console.log(first_value + first_text + second_value + second_text + third_value + third_text)
    return first_value, second_value, third_value, first_text, second_text, third_text

}

function luckCalc() {

    var newDeck = new Deck()

    // Create a copy of the deck
    var deck_holder = []

    for(let i = 0; i < 52; i++){
        deck_holder.push(newDeck.cards.pop())
    }

    // Create slots for the value and suit of the cards to be drawn
    var next_card_suit, next_card_value

    // Create maxEV slot
    var allEV = []
    var allEV_hand = []
    var maxEV_hand, maxEV;

    // Deal Starting Hand

    var max_deal = 5;

    for(let v = 0; v < max_deal; v++){
        for(let w = v + 1; w < max_deal; w++) {
            for(let x = w + 1; x < max_deal; x++) {
                for(let y = x + 1; y < max_deal; y++) {
                    for(let z = y + 1; z < max_deal; z++) {
                        starting_hand_suits = [deck_holder[v].suit, deck_holder[w].suit, deck_holder[x].suit, deck_holder[y].suit, deck_holder[z].suit]
                        starting_hand_values = [deck_holder[v].value, deck_holder[w].value, deck_holder[x].value, deck_holder[y].value, deck_holder[z].value]

                        console.log(starting_hand_values)
                        // console.log(starting_hand_suits)

                        allEV_hand = []

                        // Generate All Combinations of Hands
                        for(let i = 0; i < 2; i++) {
                            for(let j = 0; j < 2; j++) {
                                for(let k = 0; k < 2; k++) {
                                    for(let l = 0; l < 2; l++) {
                                        for(let m = 0; m < 2; m++) {

                                            numHeld = 5 - (i + j + k + l + m);
                                            var heldCards = [i, j, k, l, m]
                                            var cardReplaced = 0;

                                            nat_rf_count = 0
                                            four_d_count = 0
                                            wild_rf_count = 0
                                            five_count = 0
                                            sf_count = 0
                                            quad_count = 0
                                            boat_count = 0
                                            flush_count = 0
                                            str_count = 0
                                            trips_count = 0
                                            two_pair_count = 0
                                            one_pair_count = 0
                                            highcard_count = 0

                                            if(numHeld == 5) {

                                                final_hand_suits = []
                                                final_hand_values = []

                                                for(let n = 0; n < 5; n++) {

                                                    next_card_suit = starting_hand_suits[n]
                                                    next_card_value = starting_hand_values[n]

                                                    // Convert Broadway to Numeric
                                                    next_card_value = convertBroadtoNum(next_card_value)
                                                    
                                                    final_hand_values.push(next_card_value)
                                                    final_hand_suits.push(next_card_suit)
                                                    
                                                }

                                                handProcessingEV()
                                                handCount()
                                            }

                                            // Hold cards if 0, new card if 1
                                            if(numHeld == 4) {
                                                for(let a = 0; a < 47; a++) {

                                                    final_hand_suits = []
                                                    final_hand_values = []

                                                    for(let n = 0; n < 5; n++) {
                                                        if(heldCards[n] == 0) {
                                                            next_card_suit = starting_hand_suits[n]
                                                            next_card_value = starting_hand_values[n]

                                                            // Convert Broadway to Numeric
                                                            next_card_value = convertBroadtoNum(next_card_value)
                                                            
                                                            final_hand_values.push(next_card_value)
                                                            final_hand_suits.push(next_card_suit)
                                                        } else {
                                                            next_card_suit = deck_holder[a].suit
                                                            next_card_value = deck_holder[a].value

                                                            // Convert Broadway to Numeric
                                                            next_card_value = convertBroadtoNum(next_card_value)
                                                            
                                                            final_hand_values.push(next_card_value)
                                                            final_hand_suits.push(next_card_suit)
                                                        }
                                                    }
                                                    handProcessingEV()
                                                    handCount()
                                                }
                                            }

                                            if(numHeld == 3) {
                                                for(let a = 0; a < 47; a++) {
                                                    for(let b = a + 1; b < 47; b++) {

                                                        cardReplaced = 0;

                                                        final_hand_suits = []
                                                        final_hand_values = []

                                                        for(let n = 0; n < 5; n++) {
                                                            if(heldCards[n] == 0) {
                                                                
                                                                next_card_suit = starting_hand_suits[n]
                                                                next_card_value = starting_hand_values[n]

                                                                // Convert Broadway to Numeric
                                                                next_card_value = convertBroadtoNum(next_card_value)
                                                                
                                                                final_hand_values.push(next_card_value)
                                                                final_hand_suits.push(next_card_suit)
                                                            }  
                                                            else if(heldCards[n] == 1 && cardReplaced == 0) {
                                                                next_card_suit = deck_holder[a].suit
                                                                next_card_value = deck_holder[a].value

                                                                // Convert Broadway to Numeric
                                                                next_card_value = convertBroadtoNum(next_card_value)
                                                                
                                                                final_hand_values.push(next_card_value)
                                                                final_hand_suits.push(next_card_suit)
                                                                cardReplaced += 1;  
                                                            }
                                                            else {
                                                                next_card_suit = deck_holder[b].suit
                                                                next_card_value = deck_holder[b].value

                                                                // Convert Broadway to Numeric
                                                                next_card_value = convertBroadtoNum(next_card_value)
                                                                
                                                                final_hand_values.push(next_card_value)
                                                                final_hand_suits.push(next_card_suit)
                                                            }
                                                            
                                                        }
                                                        
                                                        handProcessingEV()
                                                        handCount()
                                                    }
                                                }
                                            }

                                            if(numHeld == 2) {
                                                for(let a = 0; a < 47; a++) {
                                                    for(let b = a + 1; b < 47; b++) {
                                                        for(let c = b + 1; c < 47; c++) {

                                                            cardReplaced = 0;

                                                            final_hand_suits = []
                                                            final_hand_values = []

                                                            for(let n = 0; n < 5; n++) {
                                                                if(heldCards[n] == 0) {
                                                                    
                                                                    next_card_suit = starting_hand_suits[n]
                                                                    next_card_value = starting_hand_values[n]

                                                                    // Convert Broadway to Numeric
                                                                    next_card_value = convertBroadtoNum(next_card_value)
                                                                    
                                                                    final_hand_values.push(next_card_value)
                                                                    final_hand_suits.push(next_card_suit)
                                                                }  
                                                                else if(heldCards[n] == 1 && cardReplaced == 0) {
                                                                    next_card_suit = deck_holder[a].suit
                                                                    next_card_value = deck_holder[a].value

                                                                    // Convert Broadway to Numeric
                                                                    next_card_value = convertBroadtoNum(next_card_value)
                                                                    
                                                                    final_hand_values.push(next_card_value)
                                                                    final_hand_suits.push(next_card_suit)
                                                                    cardReplaced += 1;
                                                                }
                                                                else if(heldCards[n] == 1 && cardReplaced == 1) {
                                                                    next_card_suit = deck_holder[b].suit
                                                                    next_card_value = deck_holder[b].value

                                                                    // Convert Broadway to Numeric
                                                                    next_card_value = convertBroadtoNum(next_card_value)
                                                                    
                                                                    final_hand_values.push(next_card_value)
                                                                    final_hand_suits.push(next_card_suit)
                                                                    cardReplaced += 1;
                                                                }
                                                                else {
                                                                    next_card_suit = deck_holder[c].suit
                                                                    next_card_value = deck_holder[c].value

                                                                    // Convert Broadway to Numeric
                                                                    next_card_value = convertBroadtoNum(next_card_value)
                                                                    
                                                                    final_hand_values.push(next_card_value)
                                                                    final_hand_suits.push(next_card_suit)
                                                                }
                                                            }

                                                            handProcessingEV()
                                                            handCount()
                                                        }
                                                    }
                                                }
                                            }

                                            if(numHeld == 10) {
                                                for(let a = 0; a < 47; a++) {
                                                    for(let b = a + 1; b < 47; b++) {
                                                        for(let c = b + 1; c < 47; c++) {
                                                            for(let d = c + 1; d < 47; d++) {

                                                                cardReplaced = 0;

                                                                final_hand_suits = []
                                                                final_hand_values = []

                                                                for(let n = 0; n < 5; n++) {
                                                                    if(heldCards[n] == 0) {
                                                                        
                                                                        next_card_suit = starting_hand_suits[n]
                                                                        next_card_value = starting_hand_values[n]

                                                                        // Convert Broadway to Numeric
                                                                        next_card_value = convertBroadtoNum(next_card_value)
                                                                        
                                                                        final_hand_values.push(next_card_value)
                                                                        final_hand_suits.push(next_card_suit)
                                                                    }  
                                                                    else if(heldCards[n] == 1 && cardReplaced == 0) {
                                                                        next_card_suit = deck_holder[a].suit
                                                                        next_card_value = deck_holder[a].value

                                                                        // Convert Broadway to Numeric
                                                                        next_card_value = convertBroadtoNum(next_card_value)
                                                                        
                                                                        final_hand_values.push(next_card_value)
                                                                        final_hand_suits.push(next_card_suit)
                                                                        cardReplaced += 1;
                                                                    }
                                                                    else if(heldCards[n] == 1 && cardReplaced == 1) {
                                                                        next_card_suit = deck_holder[b].suit
                                                                        next_card_value = deck_holder[b].value

                                                                        // Convert Broadway to Numeric
                                                                        next_card_value = convertBroadtoNum(next_card_value)
                                                                        
                                                                        final_hand_values.push(next_card_value)
                                                                        final_hand_suits.push(next_card_suit)
                                                                        cardReplaced += 1;
                                                                    }
                                                                    else if(heldCards[n] == 1 && cardReplaced == 2) {
                                                                        next_card_suit = deck_holder[c].suit
                                                                        next_card_value = deck_holder[c].value

                                                                        // Convert Broadway to Numeric
                                                                        next_card_value = convertBroadtoNum(next_card_value)
                                                                        
                                                                        final_hand_values.push(next_card_value)
                                                                        final_hand_suits.push(next_card_suit)
                                                                        cardReplaced += 1;
                                                                    }
                                                                    else {
                                                                        next_card_suit = deck_holder[d].suit
                                                                        next_card_value = deck_holder[d].value

                                                                        // Convert Broadway to Numeric
                                                                        next_card_value = convertBroadtoNum(next_card_value)
                                                                        
                                                                        final_hand_values.push(next_card_value)
                                                                        final_hand_suits.push(next_card_suit)
                                                                    }
                                                                }

                                                                handProcessingEV()
                                                                handCount()
                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                            if(numHeld == 10) {
                                                for(let a = 0; a < 47; a++) {
                                                    for(let b = a + 1; b < 47; b++) {
                                                        for(let c = b + 1; c < 47; c++) {
                                                            for(let d = c + 1; d < 47; d++) {
                                                                for(let e = d + 1; e < 47; e++) {

                                                                    cardReplaced = 0;

                                                                    final_hand_suits = []
                                                                    final_hand_values = []

                                                                    for(let n = 0; n < 5; n++) {
                                                                        if(heldCards[n] == 0) {
                                                                            
                                                                            next_card_suit = starting_hand_suits[n]
                                                                            next_card_value = starting_hand_values[n]

                                                                            // Convert Broadway to Numeric
                                                                            next_card_value = convertBroadtoNum(next_card_value)
                                                                            
                                                                            final_hand_values.push(next_card_value)
                                                                            final_hand_suits.push(next_card_suit)
                                                                        }  
                                                                        else if(heldCards[n] == 1 && cardReplaced == 0) {
                                                                            next_card_suit = deck_holder[a].suit
                                                                            next_card_value = deck_holder[a].value

                                                                            // Convert Broadway to Numeric
                                                                            next_card_value = convertBroadtoNum(next_card_value)
                                                                            
                                                                            final_hand_values.push(next_card_value)
                                                                            final_hand_suits.push(next_card_suit)
                                                                            cardReplaced += 1;
                                                                        }
                                                                        else if(heldCards[n] == 1 && cardReplaced == 1) {
                                                                            next_card_suit = deck_holder[b].suit
                                                                            next_card_value = deck_holder[b].value

                                                                            // Convert Broadway to Numeric
                                                                            next_card_value = convertBroadtoNum(next_card_value)
                                                                            
                                                                            final_hand_values.push(next_card_value)
                                                                            final_hand_suits.push(next_card_suit)
                                                                            cardReplaced += 1;
                                                                        }
                                                                        else if(heldCards[n] == 1 && cardReplaced == 2) {
                                                                            next_card_suit = deck_holder[c].suit
                                                                            next_card_value = deck_holder[c].value

                                                                            // Convert Broadway to Numeric
                                                                            next_card_value = convertBroadtoNum(next_card_value)
                                                                            
                                                                            final_hand_values.push(next_card_value)
                                                                            final_hand_suits.push(next_card_suit)
                                                                            cardReplaced += 1;
                                                                        }
                                                                        else if(heldCards[n] == 1 && cardReplaced == 3) {
                                                                            next_card_suit = deck_holder[d].suit
                                                                            next_card_value = deck_holder[d].value

                                                                            // Convert Broadway to Numeric
                                                                            next_card_value = convertBroadtoNum(next_card_value)
                                                                            
                                                                            final_hand_values.push(next_card_value)
                                                                            final_hand_suits.push(next_card_suit)
                                                                            cardReplaced += 1;
                                                                        }
                                                                        else {
                                                                            next_card_suit = deck_holder[e].suit
                                                                            next_card_value = deck_holder[e].value

                                                                            // Convert Broadway to Numeric
                                                                            next_card_value = convertBroadtoNum(next_card_value)
                                                                            
                                                                            final_hand_values.push(next_card_value)
                                                                            final_hand_suits.push(next_card_suit)
                                                                        }
                                                                    }

                                                                    handProcessingEV()
                                                                    handCount()
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            
                                            // Summary per configuration
                                            var total_options = nat_rf_count + four_d_count + wild_rf_count + five_count + sf_count + quad_count + boat_count + flush_count + str_count + trips_count + two_pair_count + one_pair_count + highcard_count;
                                            var EV_option = nat_rf_count*score_chart.natural_royal_flush + four_d_count*score_chart.four_deuces + wild_rf_count*score_chart.wild_royal_flush + five_count*score_chart.five_kind + sf_count*score_chart.straight_flush + quad_count*score_chart.quads + boat_count*score_chart.boat + flush_count*score_chart.flush + str_count*score_chart.straight + trips_count*score_chart.trips;
                                            
                                            if(total_options != 0) {
                                                maxEV_hand = Math.round(EV_option/total_options*1000)/1000;
                                                allEV_hand.push(maxEV_hand)
                                            }
                                            
                                        }
                                    }
                                }
                            }
                        }

                        console.log(allEV_hand)
                        maxEV = Math.max(...allEV_hand)
                        // console.log(maxEV)
                        allEV.push(maxEV)

                    }
                }
            }
        }
    }

    return allEV
}

// how to minimize run time?
// need to prevent the numHeld = 0 or 1 to run at all costs and predict it's value when it does run

// var data = luckCalc()
// console.log(data)

// const csvWriter = createCsvWriter({
//     path: 'luck.csv',
//   });

// csvWriter.writeRecords(data)

// GRAPH

function addData(chart, label, data1, data2, data3) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(data1);
    chart.data.datasets[1].data.push(data2);
    chart.data.datasets[2].data.push(data3);
    if(data2 > 0) {
        chart.data.datasets[1].backgroundColor.push('rgba(0, 255, 128, 0.2)');
        chart.data.datasets[1].borderColor.push('rgb(0, 255, 128)')
    }
    if(data2 < 0) {
        chart.data.datasets[1].backgroundColor.push('rgba(255, 99, 132, 0.2)');
        chart.data.datasets[1].borderColor.push('rgb(255, 99, 132)')
    }
    console.log(chart.data.datasets[1].backgroundColor)
    console.log(chart.data.datasets[1].data)
    chart.update();
}
