import Deck from "./deck.js"

var timesDealt = 0;
var show_payout = 1;
var play_music = 1;
var bg_type = 0;
var stats_setting = 0;
var deck, max_val, min_val, hand_strength, final_score, numHeld, luck_position
var num_hands = 1;
var starting_hand_values = []
var starting_hand_suits = []
var final_hand_values = []
var final_hand_suits = []
var final_hand_signal = []
var unique_cards = []
var count_unique_cards = []
var count_unique_cards_2 = []
var final_deuces = 0;
var round = 0
var agg_score = 0;
var round_score = 0;
var best_decision_streak = 0;
var best_decision_total = 0;
var best_decision_perc = 0;
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
var solverTopSolutions = []

// Modal related variables
const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')

// Sidebar variables
const sidebar_open = document.getElementById('open_button')
const sidebar_close = document.getElementById('close_button')
const overlay = document.getElementById('overlay')

// Settings variables
const settings_menu = document.getElementById('settings')
const overlay_settings = document.getElementById('overlay_settings')
const settings_close = document.getElementById('settings_close')

// Color Schemes for Game: 

// Classic: 
var color_bg = "rgb(30,30,84)"
var color_icon = "white"
var color_switch = "rgb(30,30,84)" // button switch for type
var color_text = "white"
var color_table_start = "rgb(66,126,96)"
var color_start_switch = color_table_start
var color_button = "silver"
var color_button_text = color_text
var color_bar_green = "rgba(0,255,128,0.2)"
var color_bar_green_border = "rgb(0,255,128)"
var color_bar_red = "rgba(239,64,46, 0.2)"
var color_bar_red_border = "rgb(239,64,46)"
var color_button_best = "gold" // gold
var color_button_top5 = "rgb(227,151,116)" // orange cream
var color_button_bad = color_bar_red_border // red
var color_line_total = "white"
var color_line_EV = "gold" // gold
var color_dot_luck = color_line_EV
var color_solver_title_bg = "grey"
var color_solver_title_text = "gold"

startGame()

const luck_vector = [800, 200, 25, 19.575, 15.059, 15.057, 15, 11.83, 9, 5.851, 4.617, 3.404, 3.34, 3.273, 3.128, 3, 2.213, 2.018, 2, 1.978, 1.702, 1.66, 1.399, 1.383, 1.272, 1.142, 1.095, 1.046, 1.033, 1.029, 1.017, 1, 0.56, 0.511, 0.505, 0.396, 0.388, 0.355, 0.34, 0.339, 0.328, 0.326,0]

const score_chart = {
    "natural_royal_flush": 800,
    "four_deuces": 200,
    "wild_royal_flush": 25,
    "five_kind": 15,
    "straight_flush": 9,
    "quads": 5,
    "boat": 3,
    "flush": 2.1, // flush score gets converted to 2 later on. need distinct scores for searchability of hand names
    "straight": 2,
    "trips": 1,
    "two_pair": 0,
    "one_pair": -1,
    "high_card": -2
}

function startGame() {

    // 1. LOAD PRIMARY ITEMS

    // Layout the graph 
    var graph = document.getElementById("myChart");
    var graph_container = document.getElementById("chart_container")
    graph.style.display = "block"
    graph_container.style.width = "400px"

    // Display for Poker Hands
    pokerHands()

    // Display for Deuces Hands
    deucesHands()

    // Display for Basic Info
    all_hearts()

    // Display for Brain Food
    brain_food()

    // 2. LISTEN TO SETTINGS MENU

    // Open the settings menu
    settings_menu.addEventListener('click', () => {
        overlay_settings.classList.add('active')
    })

    // Close settings option #1: clicking the overlay closes everything
    overlay_settings.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal.active')
        modals.forEach(modal => {
            closeModal(modal)
        })
        overlay_settings.classList.remove('active')
    })

    // Close settings option #2: clicking the close button closes everything
    settings_close.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal.active')
        modals.forEach(modal => {
            closeModal(modal)
        })
        overlay_settings.classList.remove('active')
    })

    // 3. LISTEN TO SIDEBAR MENU

    // Open & close the sidebar menu
    sidebar_open.addEventListener('click', () => {
        overlay.classList.add('active')
    })

    sidebar_close.addEventListener('click', () => {
        overlay.classList.remove('active')
    })

    // Close modals option #1: through the close button on the modal
    closeModalButtons.forEach(sidebar_element => {
        sidebar_element.addEventListener('click', () => {
            const modal = sidebar_element.closest(".modal")
            closeModal(modal)
        })
    })

    // Close modals option #2: clicking the overlay closes everything
    overlay.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal.active')
        modals.forEach(modal => {
            closeModal(modal)
        })
    })

    // Close modals option #3: closing the sidebar menu close button
    closeModalButtons.forEach(sidebar_element => {
        sidebar_close.addEventListener('click', () => {
            const modal = sidebar_element.closest(".modal")
            closeModal(modal)
        })
    })

    // Open modals on the Sidebar Menu
    openModalButtons.forEach(sidebar_element => {
        sidebar_element.addEventListener('click', () => {
            const modal_clicked = document.querySelector(sidebar_element.dataset.modalTarget)

            // If new modal clicked = the current open one, just close current modal
            if(modal_clicked.classList.contains('active')) {
                closeModal(modal_clicked)
            } else {
                // Close current modal when a new one is selected
                closeModalButtons.forEach(sidebar_element => {
                    const modal_delete = sidebar_element.closest(".modal")
                    closeModal(modal_delete)
                })            

                // Open the selected modal last
                openModal(modal_clicked)
            }
        })
    })

    // 4. GAME START OPTIONS

    // A. Enter key
    document.addEventListener('keydown', (e) => {
        if (e.key == "Enter") {
            gameFlow()
            document.querySelector("audio").play()
        }
    });

    // B. Click button
    document.getElementById("game_start_switch").addEventListener('click', (e) => {
        gameFlow()
        document.querySelector("audio").play()
    })

    // 5. SETTINGS FOR THE GAME

    // Activate Solver
    document.addEventListener('keydown', (e) => {
        if (e.key == "s") {

            for(let i = 0; i < 5; i++) {
                var id = "solver_hand"+i
                document.getElementById(id).style.padding = "5px"
            }
            
            var extrahandarea = document.getElementById("solver_section")

            if (timesDealt == 2) {
                return
            } else if (show_solver == 0) {
                extrahandarea.style.width = 0
                extrahandarea.style.height = 0
                displayEV()
                show_solver = 1;
            } else {
                removeSolver();
                show_solver = 0;
            }
        }
    })

    // Extra Hands Option 1
    document.getElementById("extra_hands_switch").addEventListener('click', (e) => {

        if (timesDealt != 1) {

            const extra_switch = document.getElementById("extra_hands_switch")

            if (num_hands == 1) {
                num_hands = 9;
                extra_switch.style.backgroundColor = "rgb(66,126,96)"
                extra_switch.innerHTML = "Extra Hands Enabled"
            } else {
                num_hands = 1;
                extra_switch.style.backgroundColor = "grey"
                extra_switch.innerHTML = "Extra Hands Disabled"
            }
        }
        
    })

    // Extra Hands Option 2
    document.addEventListener("keydown", (e) => {
        if (e.key == 'e') {

            if (timesDealt != 1) {

                const extra_switch = document.getElementById("extra_hands_switch")
    
                if (num_hands == 1) {
                    num_hands = 9;
                    extra_switch.style.backgroundColor = "rgb(66,126,96)"
                    extra_switch.innerHTML = "Extra Hands Enabled"
                } else {
                    num_hands = 1;
                    extra_switch.style.backgroundColor = "grey"
                    extra_switch.innerHTML = "Extra Hands Disabled"
                }
            }
        }
    })

    // Music
    document.getElementById("music_volume_switch").addEventListener('click', (e) => {

        const music_button = document.getElementById("music_volume_switch")
        const music_player = document.getElementById("music_player")

        if(play_music == 1)  {
            music_button.style.backgroundColor = "grey"
            music_button.innerHTML = "Music Disabled"
            music_player.muted = true;
            play_music = 0
        } else {
            music_button.style.backgroundColor = "rgb(66,126,96)"
            music_button.innerHTML = "Music Enabled"
            music_player.muted = false;
            play_music = 1
        }
    })

    // Statistics Option 1
    document.getElementById("stats_switch").addEventListener('click', (e) => {

        const stats_button = document.getElementById("stats_switch")
        const stats_setting_none = document.getElementById("stats_setting_none")
        const stats_setting_basic = document.getElementById("stats_setting_basic")
        const stats_setting_pro = document.getElementById("stats_setting_pro")

        if(stats_setting == 0)  {
            stats_button.style.backgroundColor = "rgb(66,126,96)"
            stats_button.innerHTML = "Statistics - BASIC Mode"
            stats_setting_none.style.display = "none"
            stats_setting_basic.style.display = "inline"
            document.getElementById("graph_container").style.visibility = "visible"
            myChart.data.datasets[2].hidden = true
            myChart.data.datasets[3].hidden = true
            myChart.update()
            stats_setting = 1
        } else if (stats_setting == 1) {
            stats_button.style.backgroundColor = "rgb(30,30,84)"
            stats_button.innerHTML = "Statistics - PRO Mode"
            stats_setting_basic.style.display = "none"
            stats_setting_pro.style.display = "inline"
            myChart.data.datasets[2].hidden = false
            myChart.data.datasets[3].hidden = false
            myChart.update()
            stats_setting = 2
        } else {
            stats_button.style.backgroundColor = "grey"
            stats_button.innerHTML = "Statistics - NONE Mode"
            stats_setting_pro.style.display = "none"
            stats_setting_none.style.display = "inline"
            document.getElementById("graph_container").style.visibility = "hidden"
            stats_setting = 0
        }
    })

    // Statistics Option 2
    document.addEventListener('keydown', (e) => {
        if (e.key == "g") {

            const stats_button = document.getElementById("stats_switch")
            const stats_setting_none = document.getElementById("stats_setting_none")
            const stats_setting_basic = document.getElementById("stats_setting_basic")
            const stats_setting_pro = document.getElementById("stats_setting_pro")
            
            if(stats_setting == 0)  {
                stats_button.style.backgroundColor = "rgb(66,126,96)"
                stats_button.innerHTML = "Statistics - BASIC Mode"
                stats_setting_none.style.display = "none"
                stats_setting_basic.style.display = "inline"
                document.getElementById("graph_container").style.visibility = "visible"
                myChart.data.datasets[2].hidden = true
                myChart.data.datasets[3].hidden = true
                myChart.update()
                stats_setting = 1
            } else if (stats_setting == 1) {
                stats_button.style.backgroundColor = "rgb(30,30,84)"
                stats_button.innerHTML = "Statistics - PRO Mode"
                stats_setting_basic.style.display = "none"
                stats_setting_pro.style.display = "inline"
                myChart.data.datasets[2].hidden = false
                myChart.data.datasets[3].hidden = false
                myChart.update()
                stats_setting = 2
            } else {
                stats_button.style.backgroundColor = "grey"
                stats_button.innerHTML = "Statistics - NONE Mode"
                stats_setting_pro.style.display = "none"
                stats_setting_none.style.display = "inline"
                document.getElementById("graph_container").style.visibility = "hidden"
                stats_setting = 0
            }
        }
    })

    // Payout Table
    document.getElementById('table_switch').addEventListener('click', (e) => {

        const payout_table = document.getElementById('table_container')
        const table_switch = document.getElementById('table_switch')

        if(show_payout == 1) {
            payout_table.style.visibility = "hidden"
            table_switch.style.backgroundColor = "grey"
            table_switch.innerHTML = "Payout Table Disabled"
            show_payout = 0
        } else {
            payout_table.style.visibility = "visible"
            table_switch.style.backgroundColor = "rgb(66,126,96)"
            table_switch.innerHTML = "Payout Table Enabled"
            show_payout = 1
        }

    })

    // Different Background Modes Option 1
    document.getElementById('bg_mode').addEventListener('click', (e) => {

        const bg_switch = document.getElementById('bg_mode')

        if(bg_type == 0) {

            bg_switch.innerHTML = "Retro Mode"
            colorChange(bg_type)
            bg_type = 1

        } else if(bg_type == 1) {

            bg_switch.innerHTML = "Beach Mode"
            colorChange(bg_type)
            bg_type = 2

        } else if(bg_type == 2) {

            bg_switch.innerHTML = "Vintage Mode"
            colorChange(bg_type)
            bg_type = 3

        } else if (bg_type == 3) {

            bg_switch.innerHTML = "Zen Mode"
            colorChange(bg_type)
            bg_type = 4

        } else {

            bg_switch.innerHTML = "Classic Mode"
            colorChange(bg_type)
            bg_type = 0

        }
    })

    // Different Background Modes Option 2
    document.addEventListener('keydown', (e) => {
        if(e.key == 't') {

            const bg_switch = document.getElementById('bg_mode')

            if(bg_type == 0) {

                bg_switch.innerHTML = "Retro Mode"
                colorChange(bg_type)
                bg_type = 1

            } else if(bg_type == 1) {

                bg_switch.innerHTML = "Beach Mode"
                colorChange(bg_type)
                bg_type = 2

            } else if(bg_type == 2) {

                bg_switch.innerHTML = "Vintage Mode"
                colorChange(bg_type)
                bg_type = 3

            } else if (bg_type == 3) {

                bg_switch.innerHTML = "Zen Mode"
                colorChange(bg_type)
                bg_type = 4

            } else {

                bg_switch.innerHTML = "Classic Mode"
                colorChange(bg_type)
                bg_type = 0

            }

        }
    })

    // 6. START BUTTON 
    document.getElementById("game_start_switch").addEventListener('mouseover', (e) => {
        document.getElementById("game_start_switch").style.backgroundColor = color_start_switch
        document.getElementById("game_start_switch").style.fontSize = "40px"
    })

    document.getElementById("game_start_switch").addEventListener('mouseout', (e) => {
        document.getElementById("game_start_switch").style.backgroundColor = "silver"
        document.getElementById("game_start_switch").style.fontSize = "25px"
    })
    
}

function colorChange(type) {

    const bg_switch = document.getElementById('bg_mode')
    const main_table = document.getElementById("main_hand")
    const payout_table = document.getElementById('table_container')
    const header = document.getElementById('heading')
    const solver_section = document.getElementById('solver_section')
    const extra_hands = document.getElementById('extra_hands')
    var visual_decision = document.getElementById("best_decision_indicator_button")

    
    if(type == 0) {
        // Retro: 
        color_bg = "#7A04EB"
        color_text = "#FE75FE"
        color_icon = color_text
        color_switch = color_bg // button switch for type
        color_table_start = "rgb(234,0,217)"
        color_start_switch = color_table_start
        color_button = "silver"
        color_button_text = color_text
        color_bar_green = "rgb(135,207,161,0.2)"
        color_bar_green_border = "rgb(135,207,161)"
        color_bar_red = "rgba(255, 0, 240, 0.2)"
        color_bar_red_border = "rgb(255, 0, 240)"
        color_button_best = "gold" // gold
        color_button_top5 = "rgb(227,151,116)" // orange cream
        color_button_bad = color_bar_red_border // red suit
        color_line_total = "black"
        color_line_EV = "rgb(244,153,128)" // gold
        color_dot_luck = color_line_EV
        color_solver_title_bg = "grey"
        color_solver_title_text = "gold"
    }

    if(type == 1) {
        // Beach: 
        color_bg = "rgb(244,236,214)"
        color_text = "rgb(136,183,181)"
        color_icon = color_text
        color_switch = color_bg // button switch for type
        color_table_start = "rgb(167,202,177)"
        color_start_switch = color_table_start
        color_button = "silver"
        color_button_text = color_text
        color_bar_green = "rgba(135,207,161,0.2)" //"rgba(99,83,91,0.2)"
        color_bar_green_border = "rgb(135,207,161)"
        color_bar_red = "rgba(223,146,142,0.2)"
        color_bar_red_border = "rgb(223,146,142)"
        color_button_best = "gold" // gold
        color_button_top5 = "rgb(227,151,116)" // orange cream
        color_button_bad = color_bar_red_border // red suit
        color_line_total = "rgb(56,29,42)"
        color_line_EV = "rgb(238,66,102)" // gold
        color_dot_luck = color_line_EV
        color_solver_title_bg = "rgb(242, 218, 206)"
        color_solver_title_text = "black"
    }

    if(type == 2) {
        // Vintage: 
        color_bg = "rgb(126,150,128)"
        color_text = "rgb(234,181,149)"
        color_icon = color_text
        color_switch = color_bg // button switch for type
        color_table_start = "rgb(127,97,111)"
        color_start_switch = color_table_start
        color_button = "silver"
        color_button_text = color_text
        color_bar_green = "rgba(17, 75, 95, 0.2)"
        color_bar_green_border = "rgb(17, 75, 95)"
        color_bar_red = "rgba(25,18,8, 0.2)"
        color_bar_red_border = "rgb(25,18,8)"
        color_button_best = "gold" // gold
        color_button_top5 = "rgb(227,151,116)" // orange cream
        color_button_bad = color_bar_red // red suit
        color_line_total = "silver"
        color_line_EV = "rgb(234,181,149)" // gold
        color_dot_luck = color_line_EV
        color_solver_title_bg = "grey"
        color_solver_title_text = "gold"
    }

    if(type == 3) {
        // Zen: 
        color_bg = "rgb(206,229,242)"
        color_text = "rgb(124,152,179)"
        color_icon = color_text
        color_switch = color_bg // button switch for type
        color_table_start = "rgb(172,203,225)"
        color_start_switch = color_table_start
        color_button = "silver"
        color_button_text = color_text
        color_bar_green = "rgba(252, 171, 100, 0.2)"
        color_bar_green_border = "rgb(252, 171, 100)"
        color_bar_red = "rgba(118,97,83, 0.2)"
        color_bar_red_border = "rgba(118,97,83)"
        color_button_best = "gold" // gold
        color_button_top5 = "rgb(227,151,116)" // orange cream
        color_button_bad = color_bar_red_border // red suit
        color_line_total = "grey"
        color_line_EV = "rgb(200,173,85)" // gold
        color_dot_luck = color_line_EV
        color_solver_title_bg = "rgb(242, 218, 206)"
        color_solver_title_text = "black"
    }

    if(type == 4) {
        // Return to Classic: 
        color_bg = "rgb(30,30,84)" // entire backdrop
        color_text = "white"
        color_icon = color_text
        color_switch = color_bg // button switch for type
        color_table_start = "rgb(66,126,96)"
        color_start_switch = color_table_start
        color_button = "silver"
        color_button_text = color_text
        color_bar_green = "rgba(0, 255, 128, 0.2)"
        color_bar_green_border = "rgb(0, 255, 128)"
        color_bar_red = "rgba(215, 38, 56, 0.2)"
        color_bar_red_border = "rgba(215, 37, 56)"
        color_button_best = "gold" // gold
        color_button_top5 = "rgb(227,151,116)" // orange cream
        color_button_bad = color_bar_red_border // red suit
        color_line_total = "white"
        color_line_EV = "gold" // gold
        color_dot_luck = color_line_EV
        color_solver_title_bg = "grey"
        color_solver_title_text = "gold"
    }

    bg_switch.style.backgroundColor = color_bg
    bg_switch.style.color = color_text
    if(timesDealt == 1 || timesDealt == 0) {main_table.style.backgroundColor = color_table_start}
    document.body.style.backgroundColor = color_switch
    payout_table.style.color = color_text
    header.style.color = color_text
    sidebar_open.style.color = color_icon
    settings_menu.style.color = color_icon
    solver_section.style.color = color_text
    extra_hands.style.color = color_text

    // Update the Best Decision button
    if(visual_decision.innerHTML == "BEST DECISION") {visual_decision.style.backgroundColor = color_button_best}
    if(visual_decision.innerHTML == "CLOSE") {visual_decision.style.backgroundColor = color_button_top5}
    if(visual_decision.innerHTML == "BE BETTER") {visual_decision.style.backgroundColor = color_button_bad}
    if(visual_decision.innerHTML == "Best Decision: Pending..."){visual_decision.style.backgroundColor = color_button}

    // Update the Extra Hand backgrounds, different depending on mode
    for(let k = 0; k < 8; k++) {
        var extra_hand = document.getElementById("hand_type"+k)

        if(extra_hand.style.backgroundColor != "grey" && 
            extra_hand.style.backgroundColor != "rgb(242, 218, 206)" && 
            extra_hand.style.backgroundColor != "silver") {
            extra_hand.style.backgroundColor = color_bg
        } else {
            extra_hand.style.backgroundColor = color_solver_title_bg
        }
        
        if(extra_hand.style.color != "gold" &&
            extra_hand.style.color != "black" &&
            extra_hand.style.color != "rgb(123,30,122)") {
            extra_hand.style.color = color_text
        } else {
            extra_hand.style.color = color_solver_title_text
        }
    }

    // Update the graphs
    var chart_actual_line = myChart.data.datasets[0].borderColor // current total
    var chart_bars = myChart.data.datasets[1] // bars
    var chart_EV_line = myChart.data.datasets[2].borderColor // EV total
    var chart_luck = myChart.data.datasets[3].borderColor // luck indicator

    for (let i = 0; i <= round; i++) {
        chart_actual_line[i] = color_line_total;
        chart_EV_line[i] = color_line_EV;
        chart_luck[i] = color_dot_luck;

        if(chart_bars.data[i] >= 0) {
            chart_bars.backgroundColor[i] = color_bar_green
            chart_bars.borderColor[i] = color_bar_green_border
        } else {
            chart_bars.backgroundColor[i] = color_bar_red
            chart_bars.borderColor[i] = color_bar_red_border
        }

    }

    myChart.update()
    
}

function gameFlow() {

    const game_button = document.getElementById("game_start_switch")

    // Change Start Button Depending on Game Phase
    if(game_button.innerText == "START GAME" || game_button.innerText == "START ROUND") {
        game_button.innerText = "LOCK IN"
    } else {
        game_button.innerText = "START ROUND"
    }

    if(timesDealt != 1) {

        // Beginning of the Game. Increment Round
        round += 1;
        document.getElementById("round_indicator").innerHTML = "Round: " + round;

        // Create new deck
        deck = new Deck();
        deck.shuffle();

        // Empty Old Hands used for Processing
        starting_hand_suits = []
        starting_hand_values = []
        final_hand_suits = []
        final_hand_values = []

        // Empty top solver solution
        solverTopSolutions = []

        // Start New Round
        newRound(deck)

        // Run Solver
        EVcalculator()

        // Run solver display once for the best decision calcs
        displayEV()
        removeSolver()

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

    // Change poker table from locked-in grey to original table by mode
    document.getElementById("main_hand").style.backgroundColor = color_table_start

    // Update the text in Round Score
    document.getElementById("round_score").innerHTML = "Round Score: TBD";

    removeSolver()

    // Delete old extra card slots and hand strength slots
    // if(num_hands > 1) {
        for (let k = 1; k < 9; k++) {

            var hand_num = k - 1;

            // Remove extra visuals for premium and paying hands
            document.getElementById("hand_type"+hand_num).style.backgroundColor = color_bg
            document.getElementById("hand_type"+hand_num).style.color = color_text

            for (let i = 0; i < 5; i++) {
                var oldCards = document.getElementById('extrahand'+hand_num+'_slot'+i);
                var oldStrength = document.getElementById('hand_type'+hand_num);
                if (oldCards != null) {
                    oldCards.remove()
                    oldStrength.innerHTML = " "
                }
            }
        }
    // }

    // Delete old cards and solver variables in HTML
    for (let i = 0; i < 5; i++) {
        if (timesDealt != 0) {
            const oldCards = document.getElementById("card"+i);
            const oldStrength = document.getElementById("hand_type")
            const actualCards = document.getElementById("actual_"+i);
            const personalCards = document.getElementById("personal_"+i);
            const topCards = document.getElementById("top_"+i);

            oldCards.remove()
            oldStrength.innerHTML = " "
            actualCards.remove()
            personalCards.remove()
            topCards.remove()

            solverTopSolutions.pop()
        }

        // Create new cards
        var playerHand = document.querySelector('.player_slot'+i);
        var dealt_card = deck.cards.pop();

        // Variables for the best decision pop-up
        const actual_hand_body = document.getElementById('actual_hand_body')
        const person_hand_body = document.getElementById('person_hand_body')
        const top_body = document.getElementById('top_body')

        playerHand.appendChild(dealt_card.getHTMLfirstRound(i));

        // Add the 5 cards to the: actual hand, player decision, top decision sections of the tooltip
        actual_hand_body.appendChild(dealt_card.getHTML_actual(i));
        person_hand_body.appendChild(dealt_card.getHTML_personal(i));
        top_body.appendChild(dealt_card.getHTML_top(i));

        // Convert characters to numeric values before entering the analysis arrays
        if (dealt_card.value == "T") {dealt_card.value = "10"}
        if (dealt_card.value == "J") {dealt_card.value = "11"}
        if (dealt_card.value == "Q") {dealt_card.value = "12"}
        if (dealt_card.value == "K") {dealt_card.value = "13"}
        if (dealt_card.value == "A") {dealt_card.value = "14"}

        starting_hand_values.push(dealt_card.value);
        starting_hand_suits.push(dealt_card.suit);

    }

    // Reset best decision indicator
    var visual_decision_evaluator = document.getElementById('best_decision_indicator_button')
    visual_decision_evaluator.style.backgroundColor = "silver"
    visual_decision_evaluator.innerHTML = "Best Decision: Pending..."
    visual_decision_evaluator.style.textAlign =  "center"

    var visual_decision_tooltip = document.getElementById('best_decision_tooltip')
    visual_decision_tooltip.style.opacity = "0"

    timesDealt = 1;
    return deck, starting_hand_suits, starting_hand_values, num_hands;
}

function finalRound(deck) {

    // Set Final Hand to begin with Starting Hand
    for (let i = 0; i < 5; i++) {
        final_hand_values[i] = starting_hand_values[i];
        final_hand_suits[i] = starting_hand_suits[i];
    }

    // Reset final hand signals
    final_hand_signal = []

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

                var personalCards = document.getElementById("personal_"+i);
                var topCards = document.getElementById("top_"+i);

                // **For cards to be replaced
                if(replace_card.style.backgroundColor == "white" || replace_card.style.backgroundColor == "rbg(255, 255, 255)" || replace_card.style.backgroundColor == "" ) {
                    
                    // Push a '1' signal for fold
                    final_hand_signal.push(1)

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

                    // Make the discarded card grey for decision comparison
                    personalCards.style.backgroundColor = "grey"
                    topCards.style.backgroundColor = solverTopSolutions[i]

                } else {
                    // Push a '0' signal for hold
                    final_hand_signal.push(0)

                    // Make the held cards gold for decision comparison
                    personalCards.style.backgroundColor = "gold"
                    topCards.style.backgroundColor = solverTopSolutions[i]
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

            // For extra hands
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

        // Initialize for the Classic variant.
        document.getElementById('extra_hands').style.color = color_text;

        // Change the color of the main table
        document.getElementById("main_hand").style.backgroundColor = "grey"

        // Hand score processing
        handProcessing();
        handScore();

        // Extra hand visual processing
        if (k == 0) {document.getElementById("hand_type").innerHTML = hand_strength}

        if (extra_hand_num >= 0) {

            document.getElementById("hand_type"+extra_hand_num).style.backgroundColor = color_bg
            document.getElementById("hand_type"+extra_hand_num).innerHTML = hand_strength

            if(final_score > 0) {
                document.getElementById("hand_type"+extra_hand_num).style.backgroundColor = color_solver_title_bg
            }
            if(final_score >= 5) {
                document.getElementById("hand_type"+extra_hand_num).style.color = color_solver_title_text
                document.getElementById("hand_type"+extra_hand_num).style.fontWeight = 'bold'
            }


        }
        
        round_score += final_score - 1;
        
        // All hands processed, time for final changes
        if (k == num_hands - 1) {
            agg_score += round_score;
            expected_total += Math.max(...top5_EV_hand)*num_hands - num_hands;


            // Check for Best Decision + Streak
            var array_check = 0

            for(let i = 0; i < 5; i++) {
                if(final_hand_signal[i] == top5_EV_configuration[0][i]) {
                    array_check += 1;
                }
            }

            if(array_check == 5) {
                best_decision_streak += 1;
                best_decision_total += 1;
            } else {
                best_decision_streak = 0;
            }

            best_decision_perc = Math.round(best_decision_total*100/round)

            document.getElementById("best_decision_streak").innerHTML = "Streak of #1 Option: " + best_decision_streak;
            document.getElementById("perc_best_decision_1").innerHTML = "Best Decision: " + best_decision_perc + "%";
            document.getElementById("perc_best_decision_2").innerHTML = "Best Decision: " + best_decision_perc + "%"; 
             
            document.getElementById("round_score").innerHTML = "Round Score: " + round_score;
            document.getElementById("total_score").innerHTML = "Total Score: " + agg_score;

            // Check for Actual Decision Luck
            var actual_decision;

            for(let i = 0; i < 32; i++) {

                var actual_array_check = 0;

                for(let k = 0; k < 5; k++) {
                    if(final_hand_signal[k] == EV_configuration[i][k]) {
                        actual_array_check += 1;
                    }
                }

                if(actual_array_check == 5) {actual_decision = i}
            }

            var actual_decision_EV = EV_hand[actual_decision]

            var actual_luck = round_score - (actual_decision_EV-1)*num_hands;

            var final_luck_text;

            // Display if lucky or not. Benchmark is 0.5 * num_hands
            if(actual_luck > 0.5*num_hands) {final_luck_text = "LUCKY"}
            if(actual_luck <= 0.5*num_hands && actual_luck >= -0.5*num_hands) {final_luck_text = "FAIR"}
            if(actual_luck < -0.5*num_hands) {final_luck_text = "UNLUCKY"}

            document.getElementById("final_luck").innerHTML = "Last Outcome: " + final_luck_text;

            // Figure out if decision was best, top 5, or outside it

            var max_value_lost = Math.max(...top5_EV_hand) - actual_decision_EV;
            var top5_value_lost = actual_decision_EV - Math.min(...top5_EV_hand);
            var visual_decision = document.getElementById("best_decision_indicator_button")
            var visual_decision_tooltip = document.getElementById("best_decision_tooltip")

            visual_decision_tooltip.style.opacity = "1"

            if(max_value_lost == 0) {
                visual_decision.style.backgroundColor = color_button_best
                visual_decision.innerHTML = "BEST DECISION"
            } else if(top5_value_lost > 0 ) {
                visual_decision.style.backgroundColor = color_button_top5
                visual_decision.innerHTML = "CLOSE"
            } else {
                visual_decision.style.backgroundColor = color_button_bad
                visual_decision.innerHTML = "BE BETTER"
            }

            visual_decision.style.textAlign =  "center"

            // Update Graph
            addData(myChart, round, agg_score, round_score, expected_total, actual_luck)

            // Reset Round Score
            round_score = 0
        }

        removeSolver()
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

    // Generate All Combinations of Hands. 0 = Hold, 1 = Fold
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

                            //console.time("Hold 5")

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

                            //console.timeEnd("Hold 5")
                        }

                        // Hold cards if 0, new card if 1
                        if(numHeld == 4) {

                            //console.time("Hold 4")

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

                            //console.timeEnd("Hold 4")
                        }

                        if(numHeld == 3) {

                            //console.time("Hold 3")
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

                            //console.timeEnd("Hold 3")
                        }

                        if(numHeld == 2) {

                            //console.time("Hold 2")
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

                            //console.timeEnd("Hold 2")
                        }

                        if(numHeld == 1) {

                            //console.time("Hold 1")

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

                            //console.timeEnd("Hold 1")
                        }

                        if(numHeld == 0) {

                            //console.time("Hold 0")

                            // Hardcoded option:

                            nat_rf_count = 0
                            four_d_count = 0.0017
                            wild_rf_count = 0.0983
                            five_count = 0
                            sf_count = 0
                            quad_count = 1.4
                            boat_count = 0.9
                            flush_count = 0
                            str_count = 2.6
                            trips_count = 15
                            two_pair_count = 80
                            one_pair_count = 0
                            highcard_count = 0


                            // for(let a = 0; a < 47; a++) {
                            //     for(let b = a + 1; b < 47; b++) {
                            //         for(let c = b + 1; c < 47; c++) {
                            //             for(let d = c + 1; d < 47; d++) {
                            //                 for(let e = d + 1; e < 47; e++) {

                            //                     cardReplaced = 0;

                            //                     final_hand_suits = []
                            //                     final_hand_values = []

                            //                     for(let n = 0; n < 5; n++) {
                            //                         if(heldCards[n] == 0) {
                                                        
                            //                             next_card_suit = starting_hand_suits[n]
                            //                             next_card_value = starting_hand_values[n]

                            //                             // Convert Broadway to Numeric
                            //                             next_card_value = convertBroadtoNum(next_card_value)
                                                        
                            //                             final_hand_values.push(next_card_value)
                            //                             final_hand_suits.push(next_card_suit)
                            //                         }  
                            //                         else if(heldCards[n] == 1 && cardReplaced == 0) {
                            //                             next_card_suit = deck_holder[a].suit
                            //                             next_card_value = deck_holder[a].value

                            //                             // Convert Broadway to Numeric
                            //                             next_card_value = convertBroadtoNum(next_card_value)
                                                        
                            //                             final_hand_values.push(next_card_value)
                            //                             final_hand_suits.push(next_card_suit)
                            //                             cardReplaced += 1;
                            //                         }
                            //                         else if(heldCards[n] == 1 && cardReplaced == 1) {
                            //                             next_card_suit = deck_holder[b].suit
                            //                             next_card_value = deck_holder[b].value

                            //                             // Convert Broadway to Numeric
                            //                             next_card_value = convertBroadtoNum(next_card_value)
                                                        
                            //                             final_hand_values.push(next_card_value)
                            //                             final_hand_suits.push(next_card_suit)
                            //                             cardReplaced += 1;
                            //                         }
                            //                         else if(heldCards[n] == 1 && cardReplaced == 2) {
                            //                             next_card_suit = deck_holder[c].suit
                            //                             next_card_value = deck_holder[c].value

                            //                             // Convert Broadway to Numeric
                            //                             next_card_value = convertBroadtoNum(next_card_value)
                                                        
                            //                             final_hand_values.push(next_card_value)
                            //                             final_hand_suits.push(next_card_suit)
                            //                             cardReplaced += 1;
                            //                         }
                            //                         else if(heldCards[n] == 1 && cardReplaced == 3) {
                            //                             next_card_suit = deck_holder[d].suit
                            //                             next_card_value = deck_holder[d].value

                            //                             // Convert Broadway to Numeric
                            //                             next_card_value = convertBroadtoNum(next_card_value)
                                                        
                            //                             final_hand_values.push(next_card_value)
                            //                             final_hand_suits.push(next_card_suit)
                            //                             cardReplaced += 1;
                            //                         }
                            //                         else {
                            //                             next_card_suit = deck_holder[e].suit
                            //                             next_card_value = deck_holder[e].value

                            //                             // Convert Broadway to Numeric
                            //                             next_card_value = convertBroadtoNum(next_card_value)
                                                        
                            //                             final_hand_values.push(next_card_value)
                            //                             final_hand_suits.push(next_card_suit)
                            //                         }
                            //                     }

                            //                     handProcessingEV()
                            //                     handCount()
                            //                 }
                            //             }
                            //         }
                            //     }
                            // }

                            //console.timeEnd("Hold 0")
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

    luck_position = luck_order(top5_EV_hand[0]) + 1

    //console.log(luck_position)

    document.getElementById("initial_luck").innerHTML = "Starting Hand Rank: " + luck_position + "/" +luck_vector.length


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

function luck_order(top_EV_value) {
    for (let z = 0; z < luck_vector.length; z++) {
        if(top_EV_value >= luck_vector[z]) {
            return z
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

            if(i == 0 && top5_EV_configuration[i][j] == 1){
                solverTopSolutions.push("grey")
            }
            if(i == 0 && top5_EV_configuration[i][j] == 0){
                solverTopSolutions.push("gold")
            }

        }

        // Introduce the Stats to each hand
        for(let k = 0; k < 6; k++) {

            topN_handStrength(top5_EV_combinations[i])

            if (k == 0) {solverHand.appendChild(getHTML_solverStats("EV", top5_EV_hand[i]))}
            if (k == 1) {solverHand.appendChild(getHTML_solverStats("P(Win)", Math.round(top5_EV_combinations[i][1]/top5_EV_combinations[i][0]*1000)/10))}
            if (k == 2) {solverHand.appendChild(getHTML_solverStats("P(Prem.)", Math.round(top5_EV_combinations[i][2]/top5_EV_combinations[i][0]*1000)/10))}
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

// GRAPH

function addData(chart, label, data1, data2, data3, data4) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(data1);
    chart.data.datasets[1].data.push(data2);
    chart.data.datasets[2].data.push(data3);
    if(data4 > 0) {
        chart.data.datasets[3].data.push(10)
    }
    if(data4 < 0) {
        chart.data.datasets[3].data.push(-10)
    }

    if(data2 >= 0) {
        chart.data.datasets[1].backgroundColor.push(color_bar_green);
        chart.data.datasets[1].borderColor.push(color_bar_green_border)
    }
    if(data2 < 0) {
        chart.data.datasets[1].backgroundColor.push(color_bar_red);
        chart.data.datasets[1].borderColor.push(color_bar_red_border)
    }
    //console.log(chart.data.datasets[1].backgroundColor)
    //console.log(chart.data.datasets[1].data)
    chart.update();
}

// MODALS

function openModal(modal) {
    if(modal == null) return
    modal.classList.add('active')
}

function closeModal(modal) {
    if(modal == null) return
    modal.classList.remove('active')
}

// POKER HANDS DISPLAY

function pokerHands() {

    // 1. Store a Straight

    var pokerHandsView = document.getElementById("poker_hand_type0")
    var pokerLabel = document.getElementById("poker_label0")
    var pokerDescription = document.getElementById("poker_desc0")

    pokerLabel.innerHTML = "Straight"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "heart_extra")
    pokerCard1.innerText = "3"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "heart_extra")
    pokerCard2.innerText = "4"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "club_extra")
    pokerCard3.innerText = "5"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "spade_extra")
    pokerCard4.innerText = "6"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "diamond_extra")
    pokerCard5.innerText = "7"
    pokerHandsView.appendChild(pokerCard5)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "Contains 5 cards of sequential rank. All of the cards must not have the exact same suit"
    pokerDescription.appendChild(pokerHand_description)

    // 2. Store a Flush

    var pokerHandsView = document.getElementById("poker_hand_type1")
    var pokerLabel = document.getElementById("poker_label1")
    var pokerDescription = document.getElementById("poker_desc1")

    pokerLabel.innerHTML = "Flush"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "8"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "diamond_extra")
    pokerCard2.innerText = "3"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "diamond_extra")
    pokerCard3.innerText = "A"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "diamond_extra")
    pokerCard4.innerText = "K"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "diamond_extra")
    pokerCard5.innerText = "J"
    pokerHandsView.appendChild(pokerCard5)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "All 5 cards have the exact same suit. The cards must also not form a straight"
    pokerDescription.appendChild(pokerHand_description)

    // 3. Store a Pair

    var pokerHandsView = document.getElementById("poker_hand_type2")
    var pokerLabel = document.getElementById("poker_label2")
    var pokerDescription = document.getElementById("poker_desc2")

    pokerLabel.innerHTML = "One Pair"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "spade_extra")
    pokerCard1.innerText = "5"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "diamond_extra")
    pokerCard2.innerText = "3"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "club_extra")
    pokerCard3.innerText = "5"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "club_extra")
    pokerCard4.innerText = "T"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "club_extra")
    pokerCard5.innerText = "9"
    pokerHandsView.appendChild(pokerCard5)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "Contains two cards of the same rank, and three other cards containing three other ranks"
    pokerDescription.appendChild(pokerHand_description)

    // 4. Store a Triple

    var pokerHandsView = document.getElementById("poker_hand_type3")
    var pokerLabel = document.getElementById("poker_label3")
    var pokerDescription = document.getElementById("poker_desc3")

    pokerLabel.innerHTML = "Three of a Kind"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "8"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "club_extra")
    pokerCard2.innerText = "8"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "diamond_extra")
    pokerCard3.innerText = "A"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "spade_extra")
    pokerCard4.innerText = "8"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "club_extra")
    pokerCard5.innerText = "7"
    pokerHandsView.appendChild(pokerCard5)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "Contains three cards of the same rank, and two other cards containing two other ranks"
    pokerDescription.appendChild(pokerHand_description)

    // 5. Store a Quad

    var pokerHandsView = document.getElementById("poker_hand_type4")
    var pokerLabel = document.getElementById("poker_label4")
    var pokerDescription = document.getElementById("poker_desc4")

    pokerLabel.innerHTML = "Four of a Kind"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "3"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "club_extra")
    pokerCard2.innerText = "3"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "heart_extra")
    pokerCard3.innerText = "3"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "spade_extra")
    pokerCard4.innerText = "3"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "heart_extra")
    pokerCard5.innerText = "5"
    pokerHandsView.appendChild(pokerCard5)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "Contains all four cards of the same rank, and one other card"
    pokerDescription.appendChild(pokerHand_description)

    // 6. Store a High Card

    // var pokerHandsView = document.getElementById("poker_hand_type5")
    // var pokerLabel = document.getElementById("poker_label5")
    // var pokerDescription = document.getElementById("poker_desc5")

    // pokerLabel.innerHTML = "High Card"

    // var pokerCard1 = document.createElement("div");
    // pokerCard1.classList.add("poker_card", "spade_extra")
    // pokerCard1.innerText = "3"
    // pokerHandsView.appendChild(pokerCard1)

    // var pokerCard2 = document.createElement("div");
    // pokerCard2.classList.add("poker_card", "heart_extra")
    // pokerCard2.innerText = "A"
    // pokerHandsView.appendChild(pokerCard2)

    // var pokerCard3 = document.createElement("div");
    // pokerCard3.classList.add("poker_card", "heart_extra")
    // pokerCard3.innerText = "K"
    // pokerHandsView.appendChild(pokerCard3)

    // var pokerCard4 = document.createElement("div");
    // pokerCard4.classList.add("poker_card", "club_extra")
    // pokerCard4.innerText = "Q"
    // pokerHandsView.appendChild(pokerCard4)

    // var pokerCard5 = document.createElement("div");
    // pokerCard5.classList.add("poker_card", "diamond_extra")
    // pokerCard5.innerText = "9"
    // pokerHandsView.appendChild(pokerCard5)

    // var pokerHand_description = document.createElement("div")
    // pokerHand_description.innerHTML = "A hand that doesn't contain a flush, straight, pair, three of a kind nor four of a kind."
    // pokerDescription.appendChild(pokerHand_description)

    // 7. Store a Two Pair

    var pokerHandsView = document.getElementById("poker_hand_type6")
    var pokerLabel = document.getElementById("poker_label6")
    var pokerDescription = document.getElementById("poker_desc6")

    pokerLabel.innerHTML = "Two Pair"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "spade_extra")
    pokerCard1.innerText = "4"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "heart_extra")
    pokerCard2.innerText = "5"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "club_extra")
    pokerCard3.innerText = "5"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "club_extra")
    pokerCard4.innerText = "4"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "diamond_extra")
    pokerCard5.innerText = "9"
    pokerHandsView.appendChild(pokerCard5)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "Contains two different pairs of cards"
    pokerDescription.appendChild(pokerHand_description)

    // 8. Store a Full House

    var pokerHandsView = document.getElementById("poker_hand_type7")
    var pokerLabel = document.getElementById("poker_label7")
    var pokerDescription = document.getElementById("poker_desc7")

    pokerLabel.innerHTML = "Full House"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "Q"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "heart_extra")
    pokerCard2.innerText = "Q"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "club_extra")
    pokerCard3.innerText = "J"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "heart_extra")
    pokerCard4.innerText = "J"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "spade_extra")
    pokerCard5.innerText = "Q"
    pokerHandsView.appendChild(pokerCard5)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "A combination of a three of a kind and a pair"
    pokerDescription.appendChild(pokerHand_description)

    // 9. Store a Straight Flush

    var pokerHandsView = document.getElementById("poker_hand_type8")
    var pokerLabel = document.getElementById("poker_label8")
    var pokerDescription = document.getElementById("poker_desc8")

    pokerLabel.innerHTML = "Straight Flush"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "heart_extra")
    pokerCard1.innerText = "Q"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "heart_extra")
    pokerCard2.innerText = "J"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "heart_extra")
    pokerCard3.innerText = "8"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "heart_extra")
    pokerCard4.innerText = "T"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "heart_extra")
    pokerCard5.innerText = "9"
    pokerHandsView.appendChild(pokerCard5)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "A combination of a straight and flush, but cannot specifically be the T-J-Q-K-A sequence."
    pokerDescription.appendChild(pokerHand_description)

    // 9. Store a Natural Royal Flush

    var pokerHandsView = document.getElementById("poker_hand_type9")
    var pokerLabel = document.getElementById("poker_label9")
    var pokerDescription = document.getElementById("poker_desc9")

    pokerLabel.innerHTML = "Natural Royal Flush"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "spade_extra")
    pokerCard1.innerText = "Q"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "spade_extra")
    pokerCard2.innerText = "K"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "spade_extra")
    pokerCard3.innerText = "T"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "spade_extra")
    pokerCard4.innerText = "J"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "spade_extra")
    pokerCard5.innerText = "A"
    pokerHandsView.appendChild(pokerCard5)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "A hand containing A, K, Q, J and T that is also a flush & contains no deuces."
    pokerDescription.appendChild(pokerHand_description)

    // 10. Store a Wild Royal Flush

    var pokerHandsView = document.getElementById("poker_hand_type10")
    var pokerLabel = document.getElementById("poker_label10")
    var pokerDescription = document.getElementById("poker_desc10")

    pokerLabel.innerHTML = "Special Hand #1: Wild Royal Flush"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "club_extra")
    pokerCard1.innerText = "A"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "heart_extra")
    pokerCard2.innerText = "2"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "club_extra")
    pokerCard3.innerText = "Q"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "spade_extra")
    pokerCard4.innerText = "2"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "club_extra")
    pokerCard5.innerText = "K"
    pokerHandsView.appendChild(pokerCard5)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "A hand containing A, K, Q, J and T that is also a flush & contains 1+ deuces."
    pokerDescription.appendChild(pokerHand_description)

    // 11. Store 4 Deuces

    var pokerHandsView = document.getElementById("poker_hand_type11")
    var pokerLabel = document.getElementById("poker_label11")
    var pokerDescription = document.getElementById("poker_desc11")

    pokerLabel.innerHTML = "Special Hand #2: Four Deuces"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "2"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "club_extra")
    pokerCard2.innerText = "2"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "heart_extra")
    pokerCard3.innerText = "2"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "spade_extra")
    pokerCard4.innerText = "2"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "club_extra")
    pokerCard5.innerText = "K"
    pokerHandsView.appendChild(pokerCard5)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "A four of a kind hand that specifically contains all four deuces."
    pokerDescription.appendChild(pokerHand_description)

    // 12. Store Five of a kind

    var pokerHandsView = document.getElementById("poker_hand_type12")
    var pokerLabel = document.getElementById("poker_label12")
    var pokerDescription = document.getElementById("poker_desc12")

    pokerLabel.innerHTML = "Special Hand #3: Five of a Kind"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "2"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "club_extra")
    pokerCard2.innerText = "T"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "spade_extra")
    pokerCard3.innerText = "T"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "club_extra")
    pokerCard4.innerText = "2"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "heart_extra")
    pokerCard5.innerText = "2"
    pokerHandsView.appendChild(pokerCard5)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "Contains between 1 and 3 deuces, where the other cards all have the same rank."
    pokerDescription.appendChild(pokerHand_description)


}

function deucesHands() {

    // 1. TWO PAIR to TRIPS

    var beforeHand = document.getElementById("deuces_before0")
    var afterHand = document.getElementById("deuces_after0")
    var pokerDescription = document.getElementById("deuces_text0")
    var pokerLabel_before = document.getElementById("deuces_before_label0")
    var pokerLabel_after = document.getElementById("deuces_after_label0")

    pokerLabel_before.innerHTML = "BEFORE: Two Pair"
    pokerLabel_after.innerHTML = "AFTER: Three of a Kind"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "heart_extra")
    pokerCard1.innerText = "8"
    beforeHand.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "spade_extra")
    pokerCard2.innerText = "3"
    beforeHand.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "club_extra")
    pokerCard3.innerText = "3"
    beforeHand.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "spade_extra")
    pokerCard4.innerText = "7"
    beforeHand.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "diamond_extra")
    pokerCard5.innerText = "8"
    beforeHand.appendChild(pokerCard5)

    var pokerCard6 = document.createElement("div");
    pokerCard6.classList.add("poker_card", "heart_extra")
    pokerCard6.innerText = "8"
    afterHand.appendChild(pokerCard6)

    var pokerCard7 = document.createElement("div");
    pokerCard7.classList.add("poker_card", "spade_extra")
    pokerCard7.innerText = "3"
    afterHand.appendChild(pokerCard7)

    var pokerCard8 = document.createElement("div");
    pokerCard8.classList.add("poker_card", "club_extra")
    pokerCard8.innerText = "3"
    afterHand.appendChild(pokerCard8)

    var pokerCard9 = document.createElement("div");
    pokerCard9.classList.add("poker_card", "spade_extra")
    pokerCard9.innerText = "7"
    afterHand.appendChild(pokerCard9)

    var pokerCard10 = document.createElement("div");
    pokerCard10.classList.add("poker_card", "diamond_extra")
    pokerCard10.style.backgroundColor = 'gold'
    pokerCard10.innerText = "2"
    afterHand.appendChild(pokerCard10)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "<span style='color:white'>EXAMPLE ONE</span> In the before hand we have 'Two Pair' of 8's and 3's. In the after hand, we replace the 8 of diamonds, leaving us with one pair of 3's and a wild card. The best rank that the wild card can take on is another 3, turning our hand into 'Three of a Kind'. The suit that the wild card takes on doesn't matter."
    pokerDescription.appendChild(pokerHand_description)

    // 2. TWO PAIR to BOAT

    var beforeHand = document.getElementById("deuces_before1")
    var afterHand = document.getElementById("deuces_after1")
    var pokerDescription = document.getElementById("deuces_text1")
    var pokerLabel_before = document.getElementById("deuces_before_label1")
    var pokerLabel_after = document.getElementById("deuces_after_label1")

    pokerLabel_before.innerHTML = "BEFORE: Two Pair"
    pokerLabel_after.innerHTML = "AFTER: Full House"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "heart_extra")
    pokerCard1.innerText = "8"
    beforeHand.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "spade_extra")
    pokerCard2.innerText = "3"
    beforeHand.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "club_extra")
    pokerCard3.innerText = "3"
    beforeHand.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "spade_extra")
    pokerCard4.innerText = "7"
    beforeHand.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "diamond_extra")
    pokerCard5.innerText = "8"
    beforeHand.appendChild(pokerCard5)

    var pokerCard6 = document.createElement("div");
    pokerCard6.classList.add("poker_card", "heart_extra")
    pokerCard6.innerText = "8"
    afterHand.appendChild(pokerCard6)

    var pokerCard7 = document.createElement("div");
    pokerCard7.classList.add("poker_card", "spade_extra")
    pokerCard7.innerText = "3"
    afterHand.appendChild(pokerCard7)

    var pokerCard8 = document.createElement("div");
    pokerCard8.classList.add("poker_card", "club_extra")
    pokerCard8.innerText = "3"
    afterHand.appendChild(pokerCard8)

    var pokerCard9 = document.createElement("div");
    pokerCard9.classList.add("poker_card", "spade_extra")
    pokerCard9.innerText = "2"
    pokerCard9.style.backgroundColor = 'gold'
    afterHand.appendChild(pokerCard9)

    var pokerCard10 = document.createElement("div");
    pokerCard10.classList.add("poker_card", "diamond_extra")
    pokerCard10.innerText = "8"
    afterHand.appendChild(pokerCard10)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "<span style='color:white'>EXAMPLE TWO</span> This is the same starting hand as before, except this time we replace the non-paired card. The best rank that the wild card can now take on is either another 3 or 8, turning our hand into 'Full House'. There is no extra payout for having 8-8-8-3-3 over 3-3-3-8-8. Again, the suit of the wild card doesn't matter."
    pokerDescription.appendChild(pokerHand_description)

    // 3. TRIPS + DEUCE to FOUR OF A KIND

    var beforeHand = document.getElementById("deuces_before2")
    var afterHand = document.getElementById("deuces_after2")
    var pokerDescription = document.getElementById("deuces_text2")
    var pokerLabel_before = document.getElementById("deuces_before_label2")
    var pokerLabel_after = document.getElementById("deuces_after_label2")

    pokerLabel_before.innerHTML = "BEFORE: Three of a Kind"
    pokerLabel_after.innerHTML = "AFTER: Four of a Kind"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "heart_extra")
    pokerCard1.innerText = "8"
    beforeHand.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "spade_extra")
    pokerCard2.innerText = "3"
    beforeHand.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "club_extra")
    pokerCard3.innerText = "3"
    beforeHand.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "spade_extra")
    pokerCard4.innerText = "7"
    beforeHand.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "diamond_extra")
    pokerCard5.innerText = "2"
    beforeHand.appendChild(pokerCard5)

    var pokerCard6 = document.createElement("div");
    pokerCard6.classList.add("poker_card", "heart_extra")
    pokerCard6.innerText = "8"
    afterHand.appendChild(pokerCard6)

    var pokerCard7 = document.createElement("div");
    pokerCard7.classList.add("poker_card", "spade_extra")
    pokerCard7.innerText = "3"
    afterHand.appendChild(pokerCard7)

    var pokerCard8 = document.createElement("div");
    pokerCard8.classList.add("poker_card", "club_extra")
    pokerCard8.innerText = "3"
    afterHand.appendChild(pokerCard8)

    var pokerCard9 = document.createElement("div");
    pokerCard9.classList.add("poker_card", "spade_extra")
    pokerCard9.innerText = "2"
    pokerCard9.style.backgroundColor = 'gold'
    afterHand.appendChild(pokerCard9)

    var pokerCard10 = document.createElement("div");
    pokerCard10.classList.add("poker_card", "diamond_extra")
    pokerCard10.innerText = "2"
    afterHand.appendChild(pokerCard10)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "<span style='color:white'>EXAMPLE THREE</span> Our starting hand contains a pair of 3's and a deuce. From EX 1, we know this is 'Three of a Kind'. When we replace a non-paired card with another deuce, the rank of this new deuce becomes a 3 as well. We now have 'Four of a Kind'."
    pokerDescription.appendChild(pokerHand_description)

    // 4. 4 TO A STRAIGHT to STRAIGHT

    var beforeHand = document.getElementById("deuces_before3")
    var afterHand = document.getElementById("deuces_after3")
    var pokerDescription = document.getElementById("deuces_text3")
    var pokerLabel_before = document.getElementById("deuces_before_label3")
    var pokerLabel_after = document.getElementById("deuces_after_label3")

    pokerLabel_before.innerHTML = "BEFORE: One Pair"
    pokerLabel_after.innerHTML = "AFTER: Straight"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "heart_extra")
    pokerCard1.innerText = "7"
    beforeHand.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "club_extra")
    pokerCard2.innerText = "8"
    beforeHand.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "club_extra")
    pokerCard3.innerText = "9"
    beforeHand.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "club_extra")
    pokerCard4.innerText = "2"
    beforeHand.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "spade_extra")
    pokerCard5.innerText = "K"
    beforeHand.appendChild(pokerCard5)

    var pokerCard6 = document.createElement("div");
    pokerCard6.classList.add("poker_card", "heart_extra")
    pokerCard6.innerText = "7"
    afterHand.appendChild(pokerCard6)

    var pokerCard7 = document.createElement("div");
    pokerCard7.classList.add("poker_card", "club_extra")
    pokerCard7.innerText = "8"
    afterHand.appendChild(pokerCard7)

    var pokerCard8 = document.createElement("div");
    pokerCard8.classList.add("poker_card", "club_extra")
    pokerCard8.innerText = "9"
    afterHand.appendChild(pokerCard8)

    var pokerCard9 = document.createElement("div");
    pokerCard9.classList.add("poker_card", "club_extra")
    pokerCard9.innerText = "2"
    afterHand.appendChild(pokerCard9)

    var pokerCard10 = document.createElement("div");
    pokerCard10.classList.add("poker_card", "spade_extra")
    pokerCard10.innerText = "2"
    pokerCard10.style.backgroundColor = 'gold'
    afterHand.appendChild(pokerCard10)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "<span style='color:white'>EXAMPLE FOUR</span> Our starting hand is close to a straight. The best the deuce can do is copy a rank we have and make us 'One Pair'. Still no payout. Replacing the K with a 2, our deuces can either make 'Three of a Kind' by copying the rank of a card we already have, or by making a straight, acting as a 9 & T. A straight pays more."
    pokerDescription.appendChild(pokerHand_description)

    // 5. 4 TO A STRAIGHT FLUSH to STRAIGHT FLUSH

    var beforeHand = document.getElementById("deuces_before4")
    var afterHand = document.getElementById("deuces_after4")
    var pokerDescription = document.getElementById("deuces_text4")
    var pokerLabel_before = document.getElementById("deuces_before_label4")
    var pokerLabel_after = document.getElementById("deuces_after_label4")

    pokerLabel_before.innerHTML = "BEFORE: One Pair"
    pokerLabel_after.innerHTML = "AFTER: Straight Flush"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "club_extra")
    pokerCard1.innerText = "7"
    beforeHand.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "club_extra")
    pokerCard2.innerText = "8"
    beforeHand.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "club_extra")
    pokerCard3.innerText = "9"
    beforeHand.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "club_extra")
    pokerCard4.innerText = "2"
    beforeHand.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "spade_extra")
    pokerCard5.innerText = "K"
    beforeHand.appendChild(pokerCard5)

    var pokerCard6 = document.createElement("div");
    pokerCard6.classList.add("poker_card", "club_extra")
    pokerCard6.innerText = "7"
    afterHand.appendChild(pokerCard6)

    var pokerCard7 = document.createElement("div");
    pokerCard7.classList.add("poker_card", "club_extra")
    pokerCard7.innerText = "8"
    afterHand.appendChild(pokerCard7)

    var pokerCard8 = document.createElement("div");
    pokerCard8.classList.add("poker_card", "club_extra")
    pokerCard8.innerText = "9"
    afterHand.appendChild(pokerCard8)

    var pokerCard9 = document.createElement("div");
    pokerCard9.classList.add("poker_card", "club_extra")
    pokerCard9.innerText = "2"
    afterHand.appendChild(pokerCard9)

    var pokerCard10 = document.createElement("div");
    pokerCard10.classList.add("poker_card", "spade_extra")
    pokerCard10.innerText = "2"
    pokerCard10.style.backgroundColor = 'gold'
    afterHand.appendChild(pokerCard10)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "<span style='color:white'>EXAMPLE FIVE</span> This is similar to EX 4 except that the suits that the deuces take on will matter. Since the non-deuce cards (except the K that gets replaced) are all suited, the 2 deuces will specifically take on ranks that complete the straight but also be clubs ie. 9 & T of clubs. We made a 'Straight Flush'."
    pokerDescription.appendChild(pokerHand_description)

    // 6. 4 TO A FLUSH to FLUSH

    var beforeHand = document.getElementById("deuces_before5")
    var afterHand = document.getElementById("deuces_after5")
    var pokerDescription = document.getElementById("deuces_text5")
    var pokerLabel_before = document.getElementById("deuces_before_label5")
    var pokerLabel_after = document.getElementById("deuces_after_label5")

    pokerLabel_before.innerHTML = "BEFORE: One Pair"
    pokerLabel_after.innerHTML = "AFTER: Flush"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "club_extra")
    pokerCard1.innerText = "3"
    beforeHand.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "club_extra")
    pokerCard2.innerText = "8"
    beforeHand.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "club_extra")
    pokerCard3.innerText = "9"
    beforeHand.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "club_extra")
    pokerCard4.innerText = "2"
    beforeHand.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "spade_extra")
    pokerCard5.innerText = "K"
    beforeHand.appendChild(pokerCard5)

    var pokerCard6 = document.createElement("div");
    pokerCard6.classList.add("poker_card", "club_extra")
    pokerCard6.innerText = "3"
    afterHand.appendChild(pokerCard6)

    var pokerCard7 = document.createElement("div");
    pokerCard7.classList.add("poker_card", "club_extra")
    pokerCard7.innerText = "8"
    afterHand.appendChild(pokerCard7)

    var pokerCard8 = document.createElement("div");
    pokerCard8.classList.add("poker_card", "club_extra")
    pokerCard8.innerText = "9"
    afterHand.appendChild(pokerCard8)

    var pokerCard9 = document.createElement("div");
    pokerCard9.classList.add("poker_card", "club_extra")
    pokerCard9.innerText = "2"
    afterHand.appendChild(pokerCard9)

    var pokerCard10 = document.createElement("div");
    pokerCard10.classList.add("poker_card", "spade_extra")
    pokerCard10.innerText = "2"
    pokerCard10.style.backgroundColor = 'gold'
    afterHand.appendChild(pokerCard10)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "<span style='color:white'>EXAMPLE SIX</span> This is similar to EX 5 in that the non-deuce cards (except the K) are all suited, however this time the first card is too far away to make a straight flush with the 2 deuces. That makes this closer to EX 4 in the choices that the deuces have, except it's 'Three of a Kind' vs a 'Flush'. A flush pays more."
    pokerDescription.appendChild(pokerHand_description)

    // 7. 3 DEUCES + NO PAIR to 5 of a KIND

    var beforeHand = document.getElementById("deuces_before6")
    var afterHand = document.getElementById("deuces_after6")
    var pokerDescription = document.getElementById("deuces_text6")
    var pokerLabel_before = document.getElementById("deuces_before_label6")
    var pokerLabel_after = document.getElementById("deuces_after_label6")

    pokerLabel_before.innerHTML = "BEFORE: Four of a Kind"
    pokerLabel_after.innerHTML = "AFTER: Five of a Kind"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "2"
    beforeHand.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "spade_extra")
    pokerCard2.innerText = "2"
    beforeHand.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "heart_extra")
    pokerCard3.innerText = "2"
    beforeHand.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "heart_extra")
    pokerCard4.innerText = "Q"
    beforeHand.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "heart_extra")
    pokerCard5.innerText = "5"
    beforeHand.appendChild(pokerCard5)

    var pokerCard6 = document.createElement("div");
    pokerCard6.classList.add("poker_card", "diamond_extra")
    pokerCard6.innerText = "2"
    afterHand.appendChild(pokerCard6)

    var pokerCard7 = document.createElement("div");
    pokerCard7.classList.add("poker_card", "spade_extra")
    pokerCard7.innerText = "2"
    afterHand.appendChild(pokerCard7)

    var pokerCard8 = document.createElement("div");
    pokerCard8.classList.add("poker_card", "heart_extra")
    pokerCard8.innerText = "2"
    afterHand.appendChild(pokerCard8)

    var pokerCard9 = document.createElement("div");
    pokerCard9.classList.add("poker_card", "heart_extra")
    pokerCard9.innerText = "Q"
    afterHand.appendChild(pokerCard9)

    var pokerCard10 = document.createElement("div");
    pokerCard10.classList.add("poker_card", "diamond_extra")
    pokerCard10.innerText = "Q"
    pokerCard10.style.backgroundColor = 'gold'
    afterHand.appendChild(pokerCard10)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "<span style='color:white'>EXAMPLE SEVEN</span> Here we unveil a new poker hand that a wild card allows us to unlock. In our initial hand, all 3 deuces will copy either the Q or 5 to give us 'Four of a Kind'. When the 5 gets replaced by another Q, all deuces copy the Q and we now have 5 of them! Final hand is 'Five of a Kind'."
    pokerDescription.appendChild(pokerHand_description)

    // 8. 3 DEUCES + NO PAIR to 4 DEUCES

    var beforeHand = document.getElementById("deuces_before7")
    var afterHand = document.getElementById("deuces_after7")
    var pokerDescription = document.getElementById("deuces_text7")
    var pokerLabel_before = document.getElementById("deuces_before_label7")
    var pokerLabel_after = document.getElementById("deuces_after_label7")

    pokerLabel_before.innerHTML = "BEFORE: Four of a Kind"
    pokerLabel_after.innerHTML = "AFTER: Four Deuces"

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "2"
    beforeHand.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "spade_extra")
    pokerCard2.innerText = "2"
    beforeHand.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "heart_extra")
    pokerCard3.innerText = "2"
    beforeHand.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "heart_extra")
    pokerCard4.innerText = "Q"
    beforeHand.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "heart_extra")
    pokerCard5.innerText = "5"
    beforeHand.appendChild(pokerCard5)

    var pokerCard6 = document.createElement("div");
    pokerCard6.classList.add("poker_card", "diamond_extra")
    pokerCard6.innerText = "2"
    afterHand.appendChild(pokerCard6)

    var pokerCard7 = document.createElement("div");
    pokerCard7.classList.add("poker_card", "spade_extra")
    pokerCard7.innerText = "2"
    afterHand.appendChild(pokerCard7)

    var pokerCard8 = document.createElement("div");
    pokerCard8.classList.add("poker_card", "heart_extra")
    pokerCard8.innerText = "2"
    afterHand.appendChild(pokerCard8)

    var pokerCard9 = document.createElement("div");
    pokerCard9.classList.add("poker_card", "heart_extra")
    pokerCard9.innerText = "Q"
    afterHand.appendChild(pokerCard9)

    var pokerCard10 = document.createElement("div");
    pokerCard10.classList.add("poker_card", "club_extra")
    pokerCard10.innerText = "2"
    pokerCard10.style.backgroundColor = 'gold'
    afterHand.appendChild(pokerCard10)

    var pokerHand_description = document.createElement("div")
    pokerHand_description.innerHTML = "<span style='color:white'>EXAMPLE EIGHT</span> Lastly, we unveil a special poker hand unique to this game. Instead of replacing the 5 with another Q, we replace it with the last deuce. EX 7 says we still have five of a kind, but instead a bonus is paid out when you get all four deuces in one hand!"
    pokerDescription.appendChild(pokerHand_description)

}

function all_hearts() {

        // 1. Store all Hearts

        var pokerHandsView = document.getElementById("heart_suit_all")

    
        var pokerCard1 = document.createElement("div");
        pokerCard1.classList.add("poker_card", "heart_extra")
        pokerCard1.innerText = "A"
        pokerHandsView.appendChild(pokerCard1)
    
        var pokerCard2 = document.createElement("div");
        pokerCard2.classList.add("poker_card", "heart_extra")
        pokerCard2.innerText = "2"
        pokerHandsView.appendChild(pokerCard2)
    
        var pokerCard3 = document.createElement("div");
        pokerCard3.classList.add("poker_card", "heart_extra")
        pokerCard3.innerText = "3"
        pokerHandsView.appendChild(pokerCard3)
    
        var pokerCard4 = document.createElement("div");
        pokerCard4.classList.add("poker_card", "heart_extra")
        pokerCard4.innerText = "4"
        pokerHandsView.appendChild(pokerCard4)
    
        var pokerCard5 = document.createElement("div");
        pokerCard5.classList.add("poker_card", "heart_extra")
        pokerCard5.innerText = "5"
        pokerHandsView.appendChild(pokerCard5)

        var pokerCard6 = document.createElement("div");
        pokerCard6.classList.add("poker_card", "heart_extra")
        pokerCard6.innerText = "6"
        pokerHandsView.appendChild(pokerCard6)
    
        var pokerCard7 = document.createElement("div");
        pokerCard7.classList.add("poker_card", "heart_extra")
        pokerCard7.innerText = "7"
        pokerHandsView.appendChild(pokerCard7)
    
        var pokerCard8 = document.createElement("div");
        pokerCard8.classList.add("poker_card", "heart_extra")
        pokerCard8.innerText = "8"
        pokerHandsView.appendChild(pokerCard8)
    
        var pokerCard9 = document.createElement("div");
        pokerCard9.classList.add("poker_card", "heart_extra")
        pokerCard9.innerText = "9"
        pokerHandsView.appendChild(pokerCard9)
    
        var pokerCard10 = document.createElement("div");
        pokerCard10.classList.add("poker_card", "heart_extra")
        pokerCard10.innerText = "T"
        pokerHandsView.appendChild(pokerCard10)

        var pokerCard11 = document.createElement("div");
        pokerCard11.classList.add("poker_card", "heart_extra")
        pokerCard11.innerText = "J"
        pokerHandsView.appendChild(pokerCard11)
    
        var pokerCard12 = document.createElement("div");
        pokerCard12.classList.add("poker_card", "heart_extra")
        pokerCard12.innerText = "Q"
        pokerHandsView.appendChild(pokerCard12)
    
        var pokerCard13 = document.createElement("div");
        pokerCard13.classList.add("poker_card", "heart_extra")
        pokerCard13.innerText = "K"
        pokerHandsView.appendChild(pokerCard13)


}

function brain_food() {

    // 1. Example Hand

    var pokerHandsView = document.getElementById("example_hand")

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "4"
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "diamond_extra")
    pokerCard2.innerText = "K"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "diamond_extra")
    pokerCard3.innerText = "7"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "diamond_extra")
    pokerCard4.innerText = "A"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "club_extra")
    pokerCard5.innerText = "4"
    pokerHandsView.appendChild(pokerCard5)

    // 1. Combination #1 - Flush

    var pokerHandsView = document.getElementById("example_hand1")

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "4"
    pokerCard1.style.backgroundColor = 'gold'
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "diamond_extra")
    pokerCard2.innerText = "K"
    pokerCard2.style.backgroundColor = 'gold'
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "diamond_extra")
    pokerCard3.innerText = "7"
    pokerCard3.style.backgroundColor = 'gold'
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "diamond_extra")
    pokerCard4.innerText = "A"
    pokerCard4.style.backgroundColor = 'gold'
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "club_extra")
    pokerCard5.innerText = "4"
    pokerHandsView.appendChild(pokerCard5)

    // 2. Combination #2 - Trips

    var pokerHandsView = document.getElementById("example_hand2")

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "4"
    pokerCard1.style.backgroundColor = 'gold'
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "diamond_extra")
    pokerCard2.innerText = "K"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "diamond_extra")
    pokerCard3.innerText = "7"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "diamond_extra")
    pokerCard4.innerText = "A"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "club_extra")
    pokerCard5.innerText = "4"
    pokerCard5.style.backgroundColor = 'gold'
    pokerHandsView.appendChild(pokerCard5)

    // 3. Combination #3 - Quads

    var pokerHandsView = document.getElementById("example_hand3")

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "4"
    pokerCard1.style.backgroundColor = 'gold'
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "diamond_extra")
    pokerCard2.innerText = "K"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "diamond_extra")
    pokerCard3.innerText = "7"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "diamond_extra")
    pokerCard4.innerText = "A"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "club_extra")
    pokerCard5.innerText = "4"
    pokerCard5.style.backgroundColor = 'gold'
    pokerHandsView.appendChild(pokerCard5)

    // 4. Combination #4 - Boat

    var pokerHandsView = document.getElementById("example_hand4")

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "4"
    pokerCard1.style.backgroundColor = 'gold'
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "diamond_extra")
    pokerCard2.innerText = "K"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "diamond_extra")
    pokerCard3.innerText = "7"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "diamond_extra")
    pokerCard4.innerText = "A"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "club_extra")
    pokerCard5.innerText = "4"
    pokerCard5.style.backgroundColor = 'gold'
    pokerHandsView.appendChild(pokerCard5)

    // 5. Combination #5 - Fives

    var pokerHandsView = document.getElementById("example_hand5")

    var pokerCard1 = document.createElement("div");
    pokerCard1.classList.add("poker_card", "diamond_extra")
    pokerCard1.innerText = "4"
    pokerCard1.style.backgroundColor = 'gold'
    pokerHandsView.appendChild(pokerCard1)

    var pokerCard2 = document.createElement("div");
    pokerCard2.classList.add("poker_card", "diamond_extra")
    pokerCard2.innerText = "K"
    pokerHandsView.appendChild(pokerCard2)

    var pokerCard3 = document.createElement("div");
    pokerCard3.classList.add("poker_card", "diamond_extra")
    pokerCard3.innerText = "7"
    pokerHandsView.appendChild(pokerCard3)

    var pokerCard4 = document.createElement("div");
    pokerCard4.classList.add("poker_card", "diamond_extra")
    pokerCard4.innerText = "A"
    pokerHandsView.appendChild(pokerCard4)

    var pokerCard5 = document.createElement("div");
    pokerCard5.classList.add("poker_card", "club_extra")
    pokerCard5.innerText = "4"
    pokerCard5.style.backgroundColor = 'gold'
    pokerHandsView.appendChild(pokerCard5)

    
}
