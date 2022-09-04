import { globalType, playerType } from './Types';

export const player: playerType = { //Only for information that need to be saved (cannot be calculated)
    stage: 1,
    energy: {
        current: 0,
        total: 0
    },
    discharge: {
        current: 0
    },
    time: {
        current: Date.now(),
        updated: Date.now(),
        started: Date.now()
    },
    buildings: [
        { //Quarks[0]
            current: 3,
            total: 3
        },
        { //Particles[1]
            current: 0,
            true: 0,
            total: 0
        },
        { //Atoms[2]
            current: 0,
            true: 0,
            total: 0
        },
        { //Molecules[3]
            current: 0,
            true: 0,
            total: 0
        }
    ],
    upgrades: [],
    toggles: []
};

export const global: globalType = { //Only intervals (for small reasons) is saved
    tab: 'stage',
    footer: true,
    lastSave: 0,
    energyType: [0, 1, 5, 20],
    stageInfo: {
        word: ['Microworld', 'Submerged'],
        wordColor: ['#03d3d3', 'dodgerblue']
    },
    theme: {
        stage: 1,
        default: true
    },
    dischargeInfo: {
        cost: 1
    },
    intervals: {
        main: 1000, //Min 20 max 1000, default 50
        numbers: 1000,
        visual: 1000, //Min 500 max 10000, default 1000
        autoSave: 300000 //Min 60000 Max 1800000, default 180000
    },
    intervalsId: {
        main: 0,
        numbers: 0,
        visual: 0,
        autoSave: 0
    },
    buildingsInfo: {
        cost: [0, 3, 24, 3],
        initial: [0, 3, 24, 3],
        increase: 1.4,
        producing: [0, 0, 0, 0]
    },
    buyToggle: {
        howMany: 1, //If more types will be added
        input: 10, //Then turn all of them
        strict: true //Into array
    },
    upgradesInfo: {
        description: [],
        effect: [],
        effectText: [],
        cost: []
    }
};

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
/* Offline progress[0]; Stage confirm[1]; Discharge confirm[2]; Custom font size[3] */
Object.assign(player, { toggles: createArray(togglesL, 'boolean') });
AddUpgradeArray('upgrades',
    [9, 12, 36, 300, 800, 9999, 99999, 999999], //Cost
    [10, 10, 5, 4, 0.2, 1.1, 0.1, 0], //Effect
    [ //Description
        'Bigger electrons. Particles cost decreased.',
        'Stronger protons. Particles produce more.',
        'More neutrons. Increased particle gain.',
        'Superposition. Unlocks new reset tier.',
        'Protium. Basic.',
        'Deuterium. Heavy.',
        'Tritium. Radioactive.',
        'Nuclear fusion. More energy.'
    ], [ //Effect text: '[0]', effect[n], '[1]'
        ['Particle cost is ', ' times cheaper.'],
        ['Particles produce ', ' times more quarks.'],
        ['Atoms produce ', ' times more particles.'],
        ['Each reset cost energy and can give ', ' times production for all buildings.'],
        ['Cost scalling is decreased by ', '.'],
        ['Molecules (only bought one\'s) boost each other by ', ' times.'],
        ['Particles produce molecules. At a reduced rate (', ').'],
        ['Placeholder ', '.']
    ]);
export const playerStart = structuredClone(player) as playerType;
export const globalStart = structuredClone(global) as globalType;
