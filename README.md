<html lang="en">

    <head>

        <meta charset="utf-8">
        <meta name="viewport" content="initial-scale=1, width=device-width">

        <link href="images/joker.png" rel="icon">

        <link href="styles.css" rel="stylesheet">

        <title>Deuces Wild: Game</title>

        <script src="script.js" type="module"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>

        <div class="heading"><h2>Welcome to Deuces Wild</h2></div>

    </head>

    <body>

        <div class="top_container">

            <div class="table_container" data-tooltip="Instructions to play here">

                <table>
                    <tbody>
                        <tr>
                            <td>NATURAL ROYAL FLUSH</td>
                            <td>800</td>
                            <td id="nat_rf">0</td>
                            <td id="inc_nat_rf" class="increment">0</td>
                        </tr>
                        <tr>
                            <td>FOUR DEUCES</td>
                            <td>200</td>
                            <td id="four_d">0</td>
                            <td id="inc_four_d" class="increment">0</td>
                        </tr>
                        <tr>
                            <td>WILD ROYAL FLUSH</td>
                            <td>25</td>
                            <td id="wild_rf">0</td>
                            <td id="inc_wild_rf" class="increment">0</td>
                        </tr>
                        <tr>
                            <td>FIVE OF A KIND</td>
                            <td>15</td>
                            <td id="fives">0</td>
                            <td id="inc_fives" class="increment">0</td>
                        </tr>
                        <tr>
                            <td>STRAIGHT FLUSH</td>
                            <td>9</td>
                            <td id="sf">0</td>
                            <td id="inc_sf" class="increment">0</td>
                        </tr>
                        <tr>
                            <td>FOUR OF A KIND</td>
                            <td>5</td>
                            <td id="quads">0</td>
                            <td id="inc_quads" class="increment">0</td>
                        </tr>
                        <tr>
                            <td>FULL HOUSE</td>
                            <td>3</td>
                            <td id="boat">0</td>
                            <td id="inc_boat" class="increment">0</td>
                        </tr>
                        <tr>
                            <td>FLUSH</td>
                            <td>2</td>
                            <td id="fl">0</td>
                            <td id="inc_fl" class="increment">0</td>
                        </tr>
                        <tr>
                            <td>STRAIGHT</td>
                            <td>2</td>
                            <td id="str">0</td>
                            <td id="inc_str" class="increment">0</td>
                        </tr>
                        <tr>
                            <td>THREE OF A KIND</td>
                            <td>1</td>
                            <td id="trips">0</td>
                            <td id="inc_trips" class="increment">0</td>
                        </tr>
                        <tr>
                            <td>TWO PAIRS</td>
                            <td>0</td>
                            <td id="two_p">0</td>
                            <td id="inc_two_p" class="increment">0</td>
                        </tr>
                        <tr>
                            <td>ONE PAIR</td>
                            <td>0</td>
                            <td id="one_p">0</td>
                            <td id="inc_one_p" class="increment">0</td>
                        </tr>
                        <tr>
                            <td>HIGH CARD</td>
                            <td>0</td>
                            <td id="hc">0</td>
                            <td id="inc_hc" class="increment">0</td>
                        </tr>
                    </tbody>
                </table>

            </div>

            <div class="swappable_section">

                <div id="solver_section" class="solver_section">
                    <div class="solver_hand0 solver_hand" id="solver_hand0"></div>
                    <div class="solver_hand1 solver_hand" id="solver_hand1"></div>
                    <div class="solver_hand2 solver_hand" id="solver_hand2"></div>
                    <div class="solver_hand3 solver_hand" id="solver_hand3"></div>
                    <div class="solver_hand4 solver_hand" id="solver_hand4"></div>
                </div>

                <div class="extra_hand_area" id="extra_hands">
                    <div class="extra_hand0 extra_hand"><div id="hand_type0" class="hand_type_extra"></div></div>
                    <div class="extra_hand1 extra_hand"><div id="hand_type1" class="hand_type_extra"></div></div>
                    <div class="extra_hand2 extra_hand"><div id="hand_type2" class="hand_type_extra"></div></div>
                    <div class="extra_hand3 extra_hand"><div id="hand_type3" class="hand_type_extra"></div></div>
                    <div class="extra_hand4 extra_hand"><div id="hand_type4" class="hand_type_extra"></div></div>
                    <div class="extra_hand5 extra_hand"><div id="hand_type5" class="hand_type_extra"></div></div>
                    <div class="extra_hand6 extra_hand"><div id="hand_type6" class="hand_type_extra"></div></div>
                    <div class="extra_hand7 extra_hand"><div id="hand_type7" class="hand_type_extra"></div></div>
                </div>

            </div>


            <div class="graph_container">

                <div id="chart_container" class="chart_container">
                    <canvas id="myChart" width="100" height="80"></canvas>
                    <script>
                        const ctx = document.getElementById('myChart').getContext('2d');
                        const myChart = new Chart(ctx, {
                            data: {
                                labels: [0],
                                datasets: [{
                                    label: 'Current Total',
                                    type: 'line',
                                    data: [0],
                                    borderColor: ['white'],
                                    borderWidth: 1
                                },
                                {
                                    label: 'Round Score',
                                    type: 'bar',
                                    data: [0],
                                    borderColor: ['rgba(255, 99, 132, 0.2)'],
                                    backgroundColor: ['rgb(255, 99, 132)'],
                                    borderWidth: 1,
                                    borderSkipped: false
                                },
                                {
                                    label: 'Expected Total',
                                    type: 'line',
                                    data: [0],
                                    borderColor: ['rgba(31, 234, 95, 1)'],
                                    borderWidth: 1
                                }
                                ]
                            },
                            options: {
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }
                        });
                    </script>

                </div>
            </div>


        </div>

        <div class="game_area" id="game_area">

            <div class="dead_space"></div>

            <div class="main_hand" id="main_hand">

                <div class="hand_type" id="hand_type"></div>
                <div class="player_slot0 slot"></div>
                <div class="player_slot1 slot"></div>
                <div class="player_slot2 slot"></div>
                <div class="player_slot3 slot"></div>
                <div class="player_slot4 slot"></div>
            
                <script>

                    document.addEventListener('keydown', keyfunction);

                    function clickfunction(id){
                        const x = document.getElementById(id);  
                        const card_elements = window.getComputedStyle(x);

                        if (x.classList.contains("unclickable")) {
                            return
                        } else if (card_elements.backgroundColor == "rgb(255, 255, 255)") {
                            x.style.backgroundColor = "gold";
                        } else {
                            x.style.backgroundColor = "white";
                        }
                    }

                    function keyfunction(event) {
                        var x = event.key;

                        for (let i = 0; i < 5; i++) {
                            var id_num = x-1;
                            var key_id = "card"+id_num;
                            if (key_id == "card"+i) {
                                clickfunction(key_id);
                            }
                        }
                    }  

                </script>

            </div>

            <div class="dead_space"></div>

        </div>

    </body>

</html>
