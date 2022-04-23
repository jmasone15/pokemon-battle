const formEl = document.getElementById("form");

formEl.addEventListener("submit", async function(event) {
    event.preventDefault();
    const data = await (await fetch("https://pokeapi.co/api/v2/pokemon/" + event.target.children[1].value)).json();
    console.log(data);
});


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