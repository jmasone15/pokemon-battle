class BattlePokemon {
    constructor(id, name, hp, trainer, moves) {
        this.id = id;
        this.name = name;
        this.hp = hp;
        this.trainer = trainer;
        this.isAlive = true;
        this.status = null;
        this.moves = moves
    }

    checkFaint() {
        return this.hp <= 0;
    }
}

class Pokemon {
    constructor(id, name, frontSprite, backSprite, level, types, ability, stats, moves) {
        this.id = id;
        this.name = name;
        this.frontSprite = frontSprite;
        this.backSprite = backSprite;
        this.level = level;
        this.types = types;
        this.ability = ability;
        this.stats = stats;
        this.moves = moves;
    }

    getBattleMoves() {
        const battleMoves = this.moves.map(x => x.getBattleMove());
        return battleMoves;
    }
    
    getBattlePokemon(trainer) {
        // At level 50, the pokemon's HP is 60 plus it's base stat
        return new BattlePokemon(
            this.id, 
            this.name, 
            this.stats.hp + 60, 
            trainer,
            this.getBattleMoves()
        )
    }
}

class Stats {
    constructor(hp, attack, defense, special_attack, special_defense, speed) {
        this.hp = hp;
        this.attack = attack;
        this.defense = defense;
        this.special_attack = special_attack;
        this.special_defense = special_defense;
        this.speed = speed;
    }
}

class BattleMove {
    constructor(id, name, type, pp) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.pp = pp;
    }
}

class Move {
    constructor(id, name, description, type, damageClass, accuracy, power, pp, priority, target, metadata) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.damageClass = damageClass;
        this.accuracy = accuracy;
        this.power = power;
        this.pp = pp;
        this.priority = priority;
        this.target = target;
        this.metadata = metadata;
    }

    getBattleMove() {
        return new BattleMove(this.id, this.name, this.type, this.pp)
    }
}

class MoveMetaData {
    constructor(ailment, ailment_chance, category, crit_rate, drain, flinch_chance, healing, max_hits, max_turns, min_hits, min_turns, stat_chance) {
        this.ailment = ailment;
        this.ailment_chance = ailment_chance;
        this.category = category;
        this.crit_rate = crit_rate;
        this.drain = drain;
        this.flinch_chance = flinch_chance;
        this.healing = healing;
        this.max_hits = max_hits;
        this.max_turns = max_turns;
        this.min_hits = min_hits;
        this.min_turns = min_turns;
        this.stat_chance = stat_chance;
    }
}

class Ability {
    constructor(id, name, effect) {
        this.id = id;
        this.name = name;
        this.effect = effect;
    }
}