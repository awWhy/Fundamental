import { globalType, playerType } from './Types';

export const player = {} as playerType; //Only for information that need to be saved

export const global: globalType = { //Only some information is saved across
    tab: 'stage',
    stage: {
        word: ['Microworld', 'Submerged'],
        wordColor: ['#03d3d3', 'dodgerblue']
    },
    theme: {
        stage: 1,
        default: true
    },
    footer: true,
    /* Add buildings cost into global, add true levels into player */
    intervals: { //Move into player (?)
        main: 1000, //Min 20 max 1000, default 50
        numbers: 1000,
        visual: 1000, //Min 500 max 10000
        autoSave: 300000 //Min 120000 Max 1800000
    },
    lastSave: 0,
    upgradesInfo: {
        description: [],
        effect: [],
        effectText: [],
        cost: []
    },
    upgradesWInfo: {
        description: [],
        effect: [],
        effectText: [],
        cost: []
    }
};

function AddResource(name: string, current = 0) { //Not a class, because no
    name === 'time' ?
        Object.assign(player, { [name]: { current, lastUpdate: current, started: current } }) :
        Object.assign(player, { [name]: { current, total: current } });
}

function AddMainBuilding(name: string, cost: number, current = 0, producing = 0) {
    Object.assign(player, { [name]: { cost, producing, current, trueLvls: current, total: current } });
}

function AddUpgradeArray(name: keyof playerType, cost: number[], effect: number[], description: string[], effectText: string[][]) {
    Object.assign(player, { [name]: createArray(cost.length) });
    Object.assign(global, { [name + 'Info']: { description, cost, effect, effectText } });
}

const createArray = (amount: number) => { //I hate TS
    const array = [];
    for (let i = 1; i <= amount; i++) {
        array.push(0);
    }
    return array;
};

/* All player additions has to be done here */
/* Maybe one day, I will convert it, into boring instant object */
Object.assign(player, { stage: 1 });
AddResource('quarks', 3);
AddResource('energy');
AddResource('time', Date.now());
AddMainBuilding('particles', 3);
AddMainBuilding('atoms', 24);
AddMainBuilding('molecules', 3);
AddUpgradeArray('upgrades',
    [9, 12, 16, 300], //Cost
    [10, 10, 5, 2], //Effect, for now only visual
    [
        'Bigger electrons. Particles cost decreased.',
        'Stronger protons. Particles produce more.',
        'More neutrons. Increased particle gain.',
        'Superposition. Allows to spend energy to boost.'
    ], [ //For now this will be [0] + effect + [1]
        ['Particle cost is ', ' times cheaper.'],
        ['Particles produce ', ' times more quarks.'],
        ['Atoms produce ', ' times more particles.'],
        ['Each boost gives ', ' times production for all buildings.']
    ]);
AddUpgradeArray('upgradesW',
    [1e21],
    [4],
    [
        'A single drop of water. Unlocks new building.'
    ], [
        ['Unlocks new building and ', ' new upgrades.']
    ]);
export const playerStart = structuredClone(player);
export const globalStart = structuredClone(global);
