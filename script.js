const buttonEl = document.getElementById("pokeBtn");
const inputEl = document.getElementById("pokeInput");
const listEl = document.getElementById("listDiv");
let pokeTeam = [];

// Create Pokemon Function
buttonEl.addEventListener("click", async function (event) {
    // Prevent the page from refreshing
    event.preventDefault();

    // Grab value from HTML and existing poke names
    let value = inputEl.value;
    let existingPokeNames = pokeTeam.map(poke => poke.name.toLowerCase());

    // Validation
    if (existingPokeNames.includes(value)) {
        return alert("You already have that pokemon on your team!")
    };
    if (pokeTeam.length === 6) {
        return alert("Your team already has six Pokemon!");
    };

    // Data will not be returned if the api errors out
    const data = await callApi("pokemon/" + value.toLowerCase());
    if (data) {
        const pokemon = await buildPokemon(data);
        console.log(pokemon);
        pokeTeam.push(pokemon);
        updatePage();
        inputEl.value = "";
    };

    return;
});

async function callApi(string, fullstring) {
    if (!fullstring) {
        const response = await fetch("https://pokeapi.co/api/v2/" + string);

        if (response.ok) {
            return await response.json();
        };

    } else {
        const response = await fetch(fullstring);

        if (response.ok) {
            return await response.json();
        };
    };

    return alert("No Pokemon found.");
};

async function buildPokemon(apiData) {
    // Type Loop
    let typeArray = [];
    apiData.types.forEach(t => {
        typeArray.push(t.type.name)
    });

    // Ability Finder
    const pokeAbility = await callApi(null, apiData.abilities[0].ability.url);
    const abilityEffect = pokeAbility.effect_entries.filter(a => {
        return a.language.name === "en"
    });
    console.log(apiData);

    // Build the Pokemon
    const userPokemon = new Pokemon(
        apiData.id,
        apiData.name,
        50,
        typeArray,
        new Ability(pokeAbility.id, pokeAbility.name, abilityEffect[0].short_effect),
        new Stats(
            apiData.stats[0].base_stat,
            apiData.stats[1].base_stat,
            apiData.stats[2].base_stat,
            apiData.stats[3].base_stat,
            apiData.stats[4].base_stat,
            apiData.stats[5].base_stat
        ),
        await getPokeMoves(apiData.moves)
    )

    return userPokemon;
}

async function getPokeMoves(array) {
    let moves = [];

    // Some Pokemon (Like Ditto) only have a few possible moves
    if (array.length < 4) {
        for (let i = 0; i < array.length; i++) {
            let moveData = await callApi(null, array[Math.floor(Math.random() * array.length)].move.url);
            let moveEffect = moveData.effect_entries.filter(m => {
                return m.language.name === "en"
            });
            moves.push(
                new Move(
                    moveData.id,
                    moveData.name,
                    moveEffect[0].short_effect,
                    moveData.type.name,
                    moveData.damage_class.name,
                    moveData.accuracy,
                    moveData.power,
                    moveData.pp,
                    moveData.priority,
                    moveData.target.name,
                    new MoveMetaData(
                        moveData.meta.ailment.name,
                        moveData.meta.ailment_chance,
                        moveData.meta.category.name,
                        moveData.meta.crit_rate,
                        moveData.meta.drain,
                        moveData.meta.flinch_chance,
                        moveData.meta.healing,
                        moveData.meta.max_hits,
                        moveData.meta.max_turns,
                        moveData.meta.min_hits,
                        moveData.meta.min_turns,
                        moveData.meta.stat_chance
                    )
                )
            );
        }
    } else {
        // Prevent the while loop from going on forever by having a count
        let count = 0;

        while (moves.length < 4 && count < 20) {

            // Don't add duplicate moves
            let existingMoveIds = moves.map(x => x.id);
            let moveData = await callApi(null, array[Math.floor(Math.random() * array.length)].move.url);
            
            if (moveData.damage_class.name !== "physical" || existingMoveIds.includes(moveData.id)) {
                count++;
            } else {
                let moveEffect = moveData.effect_entries.filter(m => {
                    return m.language.name === "en"
                });
                moves.push(
                    new Move(
                        moveData.id,
                        moveData.name,
                        moveEffect[0].short_effect,
                        moveData.type.name,
                        moveData.damage_class.name,
                        moveData.accuracy,
                        moveData.power,
                        moveData.pp,
                        moveData.priority,
                        moveData.target.name,
                        new MoveMetaData(
                            moveData.meta.ailment.name,
                            moveData.meta.ailment_chance,
                            moveData.meta.category.name,
                            moveData.meta.crit_rate,
                            moveData.meta.drain,
                            moveData.meta.flinch_chance,
                            moveData.meta.healing,
                            moveData.meta.max_hits,
                            moveData.meta.max_turns,
                            moveData.meta.min_hits,
                            moveData.meta.min_turns,
                            moveData.meta.stat_chance
                        )
                    )
                );
            }
        }
    }
    return moves;
};

// Need to rework to only update new or removed values
function updatePage() {

    // Remove existing Pokemon from page
    while (listEl.firstChild) {
        listEl.removeChild(listEl.firstChild)
    };

    // Add Pokemon to page
    for (let i = 0; i < pokeTeam.length; i++) {
        const newRow = document.createElement("div");
        newRow.setAttribute("class", "row mb-3");
        listEl.appendChild(newRow);

        const newCol = document.createElement("div");
        newCol.setAttribute("class", "col");
        newRow.appendChild(newCol);

        const newBtn = document.createElement("button");
        newBtn.setAttribute("class", "closeBtn");
        newBtn.setAttribute("class", "btn btn-secondary button-width");
        newBtn.setAttribute("id", pokeTeam[i].id);
        newBtn.setAttribute("type", "button");
        newBtn.textContent = pokeTeam[i].name.charAt(0).toUpperCase() + pokeTeam[i].name.slice(1);
        newBtn.addEventListener("click", selectPokemon);
        newCol.appendChild(newBtn);
    }
};

function removePokemon(event) {

    // Remove the Pokemon from the HTML
    const deleteDiv = event.target.parentElement;
    deleteDiv.parentElement.removeChild(deleteDiv);

    // Remove the Pokemon from the pokeTeam array
    const pokeTeamIds = pokeTeam.map(poke => poke.id);
    pokeTeam.splice(pokeTeamIds.indexOf(Math.floor(event.target.getAttribute("id"))), 1);
};

function selectPokemon(event) {

    for (let i = 0; i < listEl.childNodes.length; i++) {
        listEl.childNodes[i].childNodes[0].childNodes[0].setAttribute("class", "btn btn-secondary button-width")
    };

    event.target.setAttribute("class", "btn btn-primary button-width")
}


// function init() {

    // Pokemon Creation


    // Create function to prompt the user to select their pokemon
    // Start with one and move on to select more pokemon

    // Build computer teams, maybe gym leaders?
    // Could start out with Brock

    // Fight functionality:
    // Looping function that continues to run while both teams are alive
    // User selects move | Computer selects move
    // Will eventually have a computer AI that chooses smart moves or increased stats
    // Determine turn based on speed or moves or abilities
    // Execute move function
    // Repeat until any pokemon faints.

    // End Game Functionality
    // Determine winner
    // Ask to play again

// };

// init();