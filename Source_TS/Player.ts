import { globalType, playerType } from './Types';

export const player: playerType = { //Only for information that need to be saved
    stage: 1,
    discharge: {},
    energy: {},
    time: {},
    buildings: [],
    upgrades: [],
    upgradesW: [],
    toggles: []
};

export const global: globalType = { //Only some information is saved across
    tab: 'stage',
    footer: true,
    lastSave: 0,
    energyType: [0, 1, 5, 20],
    stage: {
        word: ['Microworld', 'Submerged'],
        wordColor: ['#03d3d3', 'dodgerblue']
    },
    theme: {
        stage: 1,
        default: true
    },
    dischargeInfo: {
        cost: 1,
        increase: 10 //Not used anywhere
    },
    intervals: {
        main: 1000, //Min 20 max 1000, default 50
        numbers: 1000,
        visual: 1000, //Min 500 max 10000
        autoSave: 300000 //Min 120000 Max 1800000
    },
    intervalsId: {
        main: 0,
        numbers: 0,
        visual: 0,
        autoSave: 0
    },
    buildingsCost: {
        initial: [],
        current: [],
        increase: []
    },
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

function AddResource(name: string, type = 'normal', current = 0) {
    if (type === 'time') {
        Object.assign(player, { [name]: { current, lastUpdate: current, started: current } });
    } else if (type === 'reset') {
        Object.assign(player, { [name]: { current, max: current } });
    } else {
        Object.assign(player, { [name]: { current, total: current } });
    }
}

function AddMainBuilding(cost: number, type = 'building', increase = 1.4) {
    if (type === 'building') {
        player.buildings.push({ current: 0, true: 0, total: 0, producing: 0 });
        global.buildingsCost.initial.push(cost);
        global.buildingsCost.current.push(cost);
        global.buildingsCost.increase.push(increase);
    } else {
        player.buildings.push({ current: cost, total: cost });
        global.buildingsCost.initial.push(0); //To have same index
        global.buildingsCost.current.push(0);
        global.buildingsCost.increase.push(0);
    }
}

function AddUpgradeArray(name: keyof playerType, cost: number[], effect: number[], description: string[], effectText: string[][]) {
    Object.assign(player, { [name]: createArray(cost.length) });
    Object.assign(global, { [name + 'Info']: { description, cost, effect, effectText } });
}

const createArray = (amount: number, type = 'number') => {
    const array = [];
    for (let i = 1; i <= amount; i++) {
        if (type === 'number') {
            array.push(0);
        } else {
            array.push(true);
        }
    }
    return array;
};

const togglesL = document.getElementsByClassName('toggle').length;
/* Offline progress[0]; Stage confirm[1]; Discharge confirm[2] */
Object.assign(player, { toggles: createArray(togglesL, 'boolean') });
AddResource('energy');
AddResource('discharge', 'reset');
AddResource('time', 'time', Date.now());
/* Main buildings, first number is cost; Don't forget to add energyType for new building */
AddMainBuilding(3, 'Resource'); //Quarks[0]
AddMainBuilding(3); //Particles[1]
AddMainBuilding(24); //Atoms[2]
AddMainBuilding(3); //Molecules[3]
AddUpgradeArray('upgrades',
    [9, 12, 16, 300, 600, 9999, 99999], //Cost
    [10, 10, 5, 4, 0.2, 1.1, 0.1], //Effect
    [ //Description
        'Bigger electrons. Particles cost decreased.',
        'Stronger protons. Particles produce more.',
        'More neutrons. Increased particle gain.',
        'Superposition. Unlocks new reset tier.',
        'Protium. Basic.',
        'Deuterium. Heavy.',
        'Tritium. Radioactive.'
    ], [ //Effect text: '[0]', effect[n], '[1]'
        ['Particle cost is ', ' times cheaper.'],
        ['Particles produce ', ' times more quarks.'],
        ['Atoms produce ', ' times more particles.'],
        ['Each reset cost energy and can give ', ' times production for all buildings.'],
        ['Cost scalling for molecules is decreased by ', '.'],
        ['Molecules (only bought one\'s) boost each other by ', ' times.'],
        ['Molecules produce molecules. At a reduced rate (', ').']
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
