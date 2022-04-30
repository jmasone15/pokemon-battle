class Pokemon {
    constructor(id, name, level, types, ability, stats, moves) {
        this.id = id;
        this.name = name;
        this.level = level;
        this.types = types;
        this.ability = ability;
        this.stats = stats;
        this.moves = moves;
    }
}

class Stat {
    constructor(name, value) {
        this.name = name;
        this.value = value
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