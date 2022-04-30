const formEl = document.getElementById("form");

// Create Pokemon Function
formEl.addEventListener("submit", async function(event) {
    // Prevent the page from refreshing
    event.preventDefault();

    // Both the api fetch and the to json are promises, need to do two awaits.
    const apiData = await callApi("pokemon/" + event.target.children[1].value);
    
    console.log(apiData);

    let typeArray = [];
    let moveArray = [];

    apiData.types.forEach(t => {
        typeArray.push(t.type.name)
    });

    const pokeAbility = await callApi(null, apiData.abilities[0].ability.url);
    const abilityEffect = pokeAbility.effect_entries.filter(a => {
        return a.language.name === "en"
    });

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
        )
    )

    console.log(userPokemon);

});

async function callApi(string, fullstring) {
    if(!fullstring) {
        return await (await fetch("https://pokeapi.co/api/v2/" + string)).json();
    } else {
        return await (await fetch(fullstring)).json();
    }
};


function init() {

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

};

init();

// Bracket Keys, semicolon, Up Down arrow