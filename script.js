const buttonEl = document.getElementById("pokeBtn");
const inputEl = document.getElementById("pokeInput");
const listEl = document.getElementById("listDiv");
const teamEl = document.getElementById("pokeTeam");
const selectedPokeEl = document.getElementById("selectedPoke");
const selectedPokeNameEl = document.getElementById("pokeName");
const selectedPokeType1 = document.getElementById("pokeType1");
const selectedPokeType2 = document.getElementById("pokeType2");
const pokeFrontEl = document.getElementById("pokeFront");
const pokeBackEl = document.getElementById("pokeBack");
const moveGroupEl = document.getElementById("moveGroup");
const selectedMoveName = document.getElementById("selectedMoveName");
const selectedMoveCard = document.getElementById("selectedMoveCard");
const selectedMoveType = document.getElementById("moveType");
const selectedMovePower = document.getElementById("movePower");
const selectedMovePP = document.getElementById("movePP");
const selectedMoveDesc = document.getElementById("moveDesc");
const startBtnEl = document.getElementById("startBtn");
const battleBoxEl = document.getElementById("battleBox");
const middleDivEl = document.getElementById("middleDiv");
const testTeam = document.getElementById("testTeam");
const userBattleDivEl = document.getElementById("userBattleDiv");
const oppBattleDivEl = document.getElementById("oppBattleDiv");
const oppPokeNameEl = document.getElementById("opp-poke-name");
const oppPokeLevelEl = document.getElementById("opp-poke-level");
const oppPokeHealthDivEl = document.getElementById("opp-health-div");
const oppPokeHealthBarEl = document.getElementById("opp-health-bar");
const oppPokeSpriteEl = document.getElementById("opp-poke-sprite");
const userPokeNameEl = document.getElementById("user-poke-name");
const userPokeLevelEl = document.getElementById("user-poke-level");
const userPokeHealthDivEl = document.getElementById("user-health-div");
const userPokeHealthBarEl = document.getElementById("user-health-bar");
const userPokeSpriteEl = document.getElementById("user-poke-sprite");
const battleTextBoxEl = document.getElementById("battle-text-box");
const textRowEl = document.getElementById("text-box-row");
const battleTextRowEl = document.getElementById("text-box-row-battle");
const battleTextRowTwoEl = document.getElementById("text-box-row-battle-two");
const fightButtonEl = document.getElementById("fight");
const bagButtonEl = document.getElementById("bag");
const pokeButtonEl = document.getElementById("pokemon");
const runButtonEl = document.getElementById("run");
const battleMoveOneEl = document.getElementById("battle-move-one");
const battleMoveTwoEl = document.getElementById("battle-move-two");
const battleMoveThreeEl = document.getElementById("battle-move-three");
const battleMoveFourEl = document.getElementById("battle-move-four");
let pokeTeam = [];
let pokeBattleTeam = [];
let targetPokemon;
let pokeBattleIdx = 0;
let trainerRedTeam = [];
let trainerBattleTeam = [];
let trainerBattleIdx = 0;

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
        pokeTeam.push(pokemon);
        updatePage();
        inputEl.value = "";
    };

    return;
});

// Test Team Function
testTeam.addEventListener("click", async function () {
    const array = ["torterra", "empoleon", "infernape", "togekiss", "rhyperior", "garchomp"];
    for (let i = 0; i < array.length; i++) {
        const data = await callApi("pokemon/" + array[i]);
        const pokemon = await buildPokemon(data);
        pokeTeam.push(pokemon);
        updatePage();
    }
});

// Start Battle Function
startBtnEl.addEventListener("click", async function (event) {
    event.preventDefault();

    // Build the enemy team
    trainerRedTeam = await getTrainer();

    for (let i = 0; i < pokeTeam.length; i++) {
        pokeBattleTeam.push(pokeTeam[i].getBattlePokemon("user"));
    };

    for (let i = 0; i < trainerRedTeam.length; i++) {
        trainerBattleTeam.push(trainerRedTeam[i].getBattlePokemon("opp"))
    };

    updateBattlePage();
    battleMenu();
});

// Fight Button Function
fightButtonEl.addEventListener("click", fight);

async function getTrainer() {
    const array = ["pikachu", "venusaur", "charizard", "blastoise", "snorlax", "lapras"];
    let trainerTeam = [];
    for (let i = 0; i < array.length; i++) {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon/" + array[i]);
        if (response.ok) {
            const data = await response.json();
            const newPokemon = await buildPokemon(data);
            trainerTeam.push(newPokemon);
        }
    }
    return trainerTeam;
};

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

    // Build the Pokemon
    const userPokemon = new Pokemon(
        apiData.id,
        apiData.name,
        apiData.sprites.front_default,
        apiData.sprites.back_default,
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
    let filteredArray = [];

    // Filter out moves that aren't learned by level-up
    for (let i = 0; i < array.length; i++) {
        if (array[i].version_group_details.map(x => x.move_learn_method.name).includes("level-up")) {
            filteredArray.push(array[i]);
        }
    };

    // Some Pokemon (Like Ditto) only have a few possible moves
    if (filteredArray.length < 4) {
        for (let i = 0; i < filteredArray.length; i++) {
            let moveData = await callApi(null, filteredArray[Math.floor(Math.random() * filteredArray.length)].move.url);
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

        while (moves.length < 4 && count < 50) {

            // Don't add duplicate moves
            let existingMoveIds = moves.map(x => x.id);
            let moveData = await callApi(null, filteredArray[Math.floor(Math.random() * filteredArray.length)].move.url);
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
                        moveEffect[0].effect,
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

function populatePokemonList(div, array, eventListener) {
    for (let i = 0; i < array.length; i++) {
        const newRow = document.createElement("div");
        newRow.setAttribute("class", "row mb-3");
        div.appendChild(newRow);

        const newCol = document.createElement("div");
        newCol.setAttribute("class", "col");
        newRow.appendChild(newCol);

        const newBtn = document.createElement("button");
        newBtn.setAttribute("class", "closeBtn");
        newBtn.setAttribute("class", "btn btn-secondary button-width");
        newBtn.setAttribute("id", array[i].id);
        newBtn.setAttribute("type", "button");
        newBtn.textContent = capitlizeFirstLetter(array[i].name);
        if (eventListener) {
            newBtn.addEventListener("click", eventListener);
        }
        newCol.appendChild(newBtn);
    }
};

// Need to rework to only update new or removed values
function updatePage() {

    // Remove existing Pokemon from page
    while (listEl.firstChild) {
        listEl.removeChild(listEl.firstChild)
    };

    // Un-hide the Team Div.
    teamEl.setAttribute("class", "col-2 text-center");
    middleDivEl.setAttribute("class", "col-1");

    // Add Pokemon to page
    populatePokemonList(listEl, pokeTeam, selectPokemon);

    if (pokeTeam.length === 6) {
        startBtnEl.setAttribute("class", "btn btn-primary btn-lg ")
    }
};

function updateBattlePage() {
    populatePokemonList(userBattleDivEl, pokeBattleTeam);
    populatePokemonList(oppBattleDivEl, trainerBattleTeam);

    document.getElementById("header").setAttribute("class", "row justify-content-center mb-5 display-none");
    document.getElementById("pokeSelect").setAttribute("class", "row justify-content-center display-none");
    startBtnEl.setAttribute("class", "display-none");
    document.getElementById("battleDiv").setAttribute("class", "row justify-content-center");
};

function updateBattleText() {

    const user = pokeBattleTeam[pokeBattleIdx];
    const opp = trainerBattleTeam[trainerBattleIdx];

    const userData = pokeTeam[pokeBattleIdx];
    const oppData = trainerRedTeam[trainerBattleIdx];

    userPokeNameEl.setAttribute("pokeId", userData.id);
    oppPokeNameEl.setAttribute("pokeId", oppData.id);
    userPokeNameEl.textContent = capitlizeFirstLetter(userData.name);
    oppPokeNameEl.textContent = capitlizeFirstLetter(oppData.name);
    userPokeLevelEl.textContent = `Level: ${userData.level}`;
    oppPokeLevelEl.textContent = `Level: ${oppData.level}`;
    userPokeHealthDivEl.setAttribute("style", `width: ${getPokemonHealthPercent(user.hp, userData)}%`);
    oppPokeHealthDivEl.setAttribute("style", `width: ${getPokemonHealthPercent(opp.hp, oppData)}%`);
    userPokeHealthBarEl.setAttribute("style", `width: ${getPokemonHealthPercent(user.hp, userData)}%`);
    oppPokeHealthBarEl.setAttribute("style", `width: ${getPokemonHealthPercent(opp.hp, oppData)}%`);
    userPokeHealthBarEl.setAttribute("aria-valuenow", getPokemonHealthPercent(user.hp, userData));
    oppPokeHealthBarEl.setAttribute("aria-valuenow", getPokemonHealthPercent(opp.hp, oppData));
    oppPokeSpriteEl.setAttribute("src", oppData.frontSprite);
    userPokeSpriteEl.setAttribute("src", userData.backSprite);
    battleTextBoxEl.textContent = `What will ${capitlizeFirstLetter(userData.name)} do?`;
};

function getPokemonHealthPercent(current, pokemon) {
    const baseHealth = pokemon.stats.hp + 60;
    const remainingNum = (current / baseHealth) * 100;
    return remainingNum;
};

function removePokemon(event) {

    // Remove the Pokemon from the HTML
    const deleteDiv = event.target.parentElement;
    deleteDiv.parentElement.removeChild(deleteDiv);

    // Remove the Pokemon from the pokeTeam array
    const pokeTeamIds = pokeTeam.map(poke => poke.id);
    pokeTeam.splice(pokeTeamIds.indexOf(Math.floor(event.target.getAttribute("id"))), 1);

    // Hide the poke team div if no pokemon remain
    if (!pokeTeam.length) {
        teamEl.setAttribute("class", "col-2 text-center display-none")
    };
};

function resetSelectedPoke() {
    targetPokemon = "";
    selectedPokeNameEl.textContent = "";
    selectedPokeType1.textContent = "";
    selectedPokeType2.textContent = "";
    selectedPokeType1.removeAttribute("style");
    selectedPokeType2.removeAttribute("style");
    pokeFrontEl.removeAttribute("src");
    pokeBackEl.removeAttribute("src");
    selectedMoveCard.setAttribute("class", "card bg-secondary display-none");

    // Remove existing Moves from page
    while (moveGroupEl.firstChild) {
        moveGroupEl.removeChild(moveGroupEl.firstChild)
    };
};

function selectPokemon(event) {

    resetSelectedPoke();

    const pokeTeamIds = pokeTeam.map(poke => poke.id);
    targetPokemon = pokeTeam[pokeTeamIds.indexOf(Math.floor(event.target.getAttribute("id")))];

    // De-select other buttons
    for (let i = 0; i < listEl.childNodes.length; i++) {
        listEl.childNodes[i].childNodes[0].childNodes[0].setAttribute("class", "btn btn-secondary button-width")
    };
    // Select the clicked button
    event.target.setAttribute("class", "btn btn-primary button-width");

    // Update Selected Poke El
    selectedPokeNameEl.textContent = capitlizeFirstLetter(targetPokemon.name);
    selectedPokeType1.textContent = capitlizeFirstLetter(targetPokemon.types[0]);
    selectedPokeType1.setAttribute("class", "badge");
    selectedPokeType1.setAttribute("style", `background-color: #${getHexCodeByType(targetPokemon.types[0])};`);
    if (targetPokemon.types[1]) {
        selectedPokeType2.setAttribute("class", "badge");
        selectedPokeType2.setAttribute("style", `background-color: #${getHexCodeByType(targetPokemon.types[1])};`);
        selectedPokeType2.textContent = capitlizeFirstLetter(targetPokemon.types[1]);
    };
    pokeFrontEl.setAttribute("src", targetPokemon.frontSprite);
    pokeBackEl.setAttribute("src", targetPokemon.backSprite);

    // Update Move Button Group
    for (let i = 0; i < targetPokemon.moves.length; i++) {
        let move = targetPokemon.moves[i];

        // Move Button
        let moveBtn = document.createElement("input");
        moveBtn.setAttribute("type", "checkbox");
        moveBtn.setAttribute("class", "btn-check");
        moveBtn.setAttribute("autocomplete", "off");
        moveBtn.setAttribute("id", move.id);
        moveBtn.addEventListener("click", selectMove);
        moveGroupEl.appendChild(moveBtn);

        // Move Label
        let moveLabel = document.createElement("label");
        moveLabel.setAttribute("class", "btn btn-outline-info");
        moveLabel.setAttribute("for", move.id);
        moveLabel.textContent = capitlizeFirstLetter(move.name);
        moveGroupEl.appendChild(moveLabel);
    };

    // Remove display-none tag from Selected Pokemon container
    selectedPokeEl.setAttribute("class", "col-9")
};

function selectMove(event) {
    const moveIds = targetPokemon.moves.map(move => move.id);
    const targetMove = targetPokemon.moves[moveIds.indexOf(Math.floor(event.target.getAttribute("id")))];

    selectedMoveCard.setAttribute("class", "card bg-secondary");

    selectedMoveName.innerHTML = `${capitlizeFirstLetter(targetMove.name)}<span class="badge">${capitlizeFirstLetter(targetMove.type)}</span>`;
    selectedMoveName.setAttribute("style", `display: flex; justify-content: space-between; background-color: #${getHexCodeByType(targetMove.type)};`);

    selectedMoveType.textContent = `Type: ${capitlizeFirstLetter(targetMove.damageClass)}`;
    selectedMovePower.textContent = `Power: ${targetMove.power}`;
    selectedMovePP.textContent = `PP: ${targetMove.pp}`;
    selectedMoveDesc.textContent = targetMove.description;
};

function getHexCodeByType(type) {
    switch (type) {
        case "normal":
            return "A8A77A";
        case "fire":
            return "EE8130";
        case "water":
            return "6390F0";
        case "electric":
            return "F7D02C";
        case "grass":
            return "7AC74C";
        case "ice":
            return "96D9D6";
        case "fighting":
            return "C22E28";
        case "poison":
            return "A33EA1";
        case "ground":
            return "E2BF65";
        case "flying":
            return "A98FF3";
        case "pyschic":
            return "F95587";
        case "bug":
            return "A6B91A";
        case "rock":
            return "B6A136";
        case "ghost":
            return "735797";
        case "dragon":
            return "6F35FC";
        case "dark":
            return "705746";
        case "steel":
            return "B7B7CE";
        default:
            return "D685AD";
    }
};

function capitlizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

function battleMenu() {
    let userCanBattle = pokeBattleTeam.filter(x => x.isAlive);
    let oppCanBattle = trainerBattleTeam.filter(x => x.isAlive);

    if (!userCanBattle || !oppCanBattle) {
        endBattle();
    } else {
        updateBattleText();
    };
};

function fight() {
    textRowEl.setAttribute("class", "row display-none");
    battleTextRowEl.setAttribute("class", "row");
    battleTextRowTwoEl.setAttribute("class", "row");

    const userPoke = pokeTeam[pokeBattleIdx];

    for (let i = 0; i < userPoke.moves.length; i++) {
        const move = userPoke.moves[i]
        switch (i) {
            case 3:
                battleMoveFourEl.textContent = capitlizeFirstLetter(move.name);
                battleMoveFourEl.setAttribute("pokeId", userPoke.id);
                battleMoveFourEl.setAttribute("moveId", move.id);
                battleMoveFourEl.parentElement.addEventListener("click", selectMove);
                break;
            case 2:
                battleMoveThreeEl.textContent = capitlizeFirstLetter(move.name);
                battleMoveThreeEl.setAttribute("pokeId", userPoke.id);
                battleMoveThreeEl.setAttribute("moveId", move.id);
                battleMoveThreeEl.parentElement.addEventListener("click", selectMove);
                break;
            case 1:
                battleMoveTwoEl.textContent = capitlizeFirstLetter(move.name);
                battleMoveTwoEl.setAttribute("pokeId", userPoke.id);
                battleMoveTwoEl.setAttribute("moveId", move.id);
                battleMoveTwoEl.parentElement.addEventListener("click", selectMove);
                break;
            default:
                battleMoveOneEl.textContent = capitlizeFirstLetter(move.name);
                battleMoveOneEl.setAttribute("pokeId", userPoke.id);
                battleMoveOneEl.setAttribute("moveId", move.id);
                battleMoveOneEl.parentElement.addEventListener("click", selectMove);
                break;
        }
    }
};

function selectMove({ target }) {
    let moveId;

    if (target.tagName === "H1") {
        moveId = Math.floor(target.getAttribute("moveId"));
    } else {
        for (let i = 0; i < target.childNodes.length; i++) {
            if (target.childNodes[i].tagName === "H1") {
                moveId = Math.floor(target.childNodes[i].getAttribute("moveId"));
            }
        }
    }

    const userPoke = pokeTeam[pokeBattleIdx];
    const userMove = userPoke.moves.filter(x => x.id === moveId)[0];

    // Right now, random move selection.
    const oppPoke = trainerRedTeam[trainerBattleIdx];
    const randomNum = Math.floor(Math.random() * 4);
    const oppMove = oppPoke.moves[randomNum];

    console.log(oppMove);
    console.log(userPoke);
    attack(userMove, oppMove);
};

function attack(userMove, oppMove) {
    const userPoke = pokeTeam[pokeBattleIdx];
    const oppPoke = trainerRedTeam[trainerBattleIdx];

    if (userPoke.stats.speed >= oppPoke.stats.speed) {
        executeMove(userPoke, oppPoke, userMove);
        executeMove(oppPoke, userPoke, oppMove);
    } else {
        executeMove(oppPoke, userPoke, oppMove);
        executeMove(userPoke, oppPoke, userMove);
    }
};

function executeMove(attacker, defender, move) {
    const power = move.power;
    let attack;
    let defense;
    if (move.damageClass === "physical") {
        attack = attacker.stats.attack;
        defense = defender.stats.defense;
    } else {
        attack = attacker.stats.special_attack;
        defense = defender.stats.special_defense;
    }
    const level = attacker.level;
    const moveType = move.type;
    const attackTypes = attacker.types;
    const defendTypes = defender.types;

    let isCritical = 1;
    let isSTAB = 1;
    let typeMod = 1;
    const critChance = Math.floor(Math.random() * 11);
    const typeMatching = getTypeMatchingByType(moveType);

    if (critChance >= 9) {
        isCritical = 2;
    }
    if (attackTypes.includes(moveType)) {
        isSTAB = 1.5;
    }
    for (let i = 0; i < defendTypes.length; i++) {
        const type = defendTypes[i];
        if (typeMatching.strong.includes(type)) {
            typeMod = typeMod * 2;
        } else if (typeMatching.weak.includes(type)) {
            typeMod = typeMod * 0.5;
        } else if (typeMatching.noEffect.includes(type)) {
            typeMod = 0;
        }
    }

    const modifier = isCritical * isSTAB * typeMod;
    const baseDamage = ((((((level * 2) / 5) + 2) * power * (attack / defense)) / 50) + 2);

    const damage = {
        num: Math.round(baseDamage * modifier),
        messages: []
    }

    if (isCritical === 2 && typeMod !== 0) {
        damage.messages.push("Critical Hit!");
    }
    if (typeMod === 0.5) {
        damage.messages.push("It's not very effective...")
    }
    if (typeMod === 0) {
        damage.messages.push("It had no effect on " + capitlizeFirstLetter(defender.name))
    }
    if (typeMod >= 2) {
        damage.messages.push("It's super effective!")
    }
    
    move.pp--;
    defender.stats.hp = defender.stats.hp - damage.num;
    console.log(defender);
    battleMenu();
};

function getTypeMatchingByType(type) {
    switch (type) {
        case "normal":
            return {
                strong: [],
                weak: ["rock", "steel"],
                noEffect: ["ghost"]
            };
        case "fighting":
            return {
                strong: ["normal", "rock", "steel", "ice", "dark"],
                weak: ["flying", "poison", "bug", "pyschic"],
                noEffect: ["ghost"]
            };
        case "flying":
            return {
                strong: ["fight", "bug", "grass"],
                weak: ["rock", "steel", "electric"],
                noEffect: []
            };
        case "poison":
            return {
                strong: ["grass"],
                weak: ["poison", "ground", "rock", "ghsot"],
                noEffect: ["steel"]
            };
        case "ground":
            return {
                strong: ["poison", "rock", "steel", "fire", "electric"],
                weak: ["bug", "grass"],
                noEffect: ["flying"]
            };
        case "rock":
            return {
                strong: ["flying", "bug", "fire", "ice"],
                weak: ["fight", "ground", "steel"],
                noEffect: []
            };
        case "bug":
            return {
                strong: ["grass", "psychic", "dark"],
                weak: ["fight", "flying", "poison", "ghost", "steel", "fire"],
                noEffect: []
            };
        case "ghost":
            return {
                strong: ["ghost", "psychic"],
                weak: ["steel", "dark"],
                noEffect: ["normal"]
            };
        case "steel":
            return {
                strong: ["rock", "ice"],
                weak: ["steel", "fire", "water", "electric"],
                noEffect: []
            };
        case "fire":
            return {
                strong: ["bug", "steel", "grass", "ice"],
                weak: ["rock", "fire", "water", "dragon"],
                noEffect: []
            };
        case "water":
            return {
                strong: ["ground", "rock", "fire"],
                weak: ["water", "grass", "dragon"],
                noEffect: []
            };
        case "grass":
            return {
                strong: ["ground", "rock", "water"],
                weak: ["flying", "poison", "bug", "steel", "fire", "grass", "dragon"],
                noEffect: []
            };
        case "electric":
            return {
                strong: ["flying", "water"],
                weak: ["grass", "electric", "dragon"],
                noEffect: ["ground"]
            };
        case "psychic":
            return {
                strong: ["fight", "poison"],
                weak: ["steel", "psychic"],
                noEffect: ["dark"]
            };
        case "ice":
            return {
                strong: ["flying", "ground", "grass", "dragon"],
                weak: ["steel", "fire", "water", "ice"],
                noEffect: []
            };
        case "dragon":
            return {
                strong: ["dragon"],
                weak: ["steel"],
                noEffect: []
            };
        case "dark":
            return {
                strong: ["ghost", "psychic"],
                weak: ["fight", "steel", "dark"],
                noEffect: []
            };
        case "fairy":
            return {
                strong: ["fighting", "dragon", "dark"],
                weak: ["fire", "ground", "steel"],
                noEffect: []
            };
        default:
            break;
    }
};

function endBattle(user, opp) {
    console.log("Battle Ended");
};