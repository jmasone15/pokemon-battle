const formEl = document.getElementById("form");

// Create Pokemon Function
formEl.addEventListener("submit", async function (event) {
    // Prevent the page from refreshing
    event.preventDefault();
    const pokemon = await buildPokemon(await callApi("pokemon/" + event.target.children[1].value));
    event.target.children[1].value = "";
    console.log(pokemon);
});

async function callApi(string, fullstring) {
    if (!fullstring) {
        return await (await fetch("https://pokeapi.co/api/v2/" + string)).json();
    } else {
        return await (await fetch(fullstring)).json();
    }
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