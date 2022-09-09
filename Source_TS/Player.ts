import { Alert } from './Special';
import { globalType, saveType, playerType } from './Types';

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
    researches: [],
    researchesAuto: [],
    toggles: [],
    buyToggle: {
        howMany: 1, //If more types will be added
        input: 10, //Then turn all of them
        strict: true //Into array
    }
};

export const global: globalType = { //For information that doesn't need to be saved
    tab: 'stage',
    footer: true,
    screenReader: false,
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
        next: 1
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
        name: ['Quarks', 'Particles', 'Atoms', 'Molecules'],
        cost: [0, 3, 24, 3],
        increase: 1.4,
        producing: [0, 0, 0, 0]
    },
    upgradesInfo: {
        description: [],
        effect: [],
        effectText: [],
        cost: []
    },
    researchesInfo: {
        description: [],
        effect: [],
        effectText: [],
        cost: [],
        scalling: [],
        max: []
    },
    researchesAutoInfo: {
        description: [],
        effect: [],
        effectText: [],
        cost: [],
        scalling: [],
        max: []
    }
};

function AddUpgradeArray(name: keyof playerType, cost: number[], effect: Array<number | string>, description: string[], effectText: string[][], scalling = [] as number[], max = [] as number[]) {
    Object.assign(player, { [name]: createArray(cost.length) });
    if (String(name).includes('researches')) {
        Object.assign(global, { [name + 'Info']: { description, effect, effectText, cost, scalling, max } });
    } else {
        Object.assign(global, { [name + 'Info']: { description, effect, effectText, cost } });
    }
}

const createArray = (amount: number, type = 'number') => {
    const array = [];
    for (let i = 0; i < amount; i++) {
        if (type === 'number') {
            array.push(0);
        } else {
            if (i === 4 || i === 5 || i === 6) {
                array.push(false);
            } else {
                array.push(true);
            }
        }
    }
    return array;
};

const togglesL = document.getElementsByClassName('toggle').length;
/* Offline progress[0]; Stage confirm[1]; Discharge confirm[2]; Custom font size[3]; Auto for building[1][4], [2][5], [3][6] */
Object.assign(player, { toggles: createArray(togglesL, 'toggles') });
AddUpgradeArray('upgrades',
    [9, 12, 36, 300, 800, 5000, 15000, 36000], //Cost
    [10, 10, 5, 4, 0.2, 1.01, '', ''], //Effect
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
        ['Abbility to reset at any time and boost production for all buildings ', ' times, if had enough energy.'],
        ['Cost scalling is decreased by ', '.'],
        ['Buildings (only bought one\'s) boost themselfs by ', ' times.'],
        ['Molecules produce molecules. At a reduced rate.', ''],
        ['Unspent energy boost molecules production of themselfs 1 to 1.', '']
    ]);
AddUpgradeArray('researches',
    [2000, 6500, 20000, 12000, 42000], //Cost
    [0.01, 0.01, 12, 1, 2], //Effect
    [ //Description
        "Effect of 'Protium' upgrade is stronger.",
        "Effect of 'Deuterium' upgrade is bigger.",
        "Effect of 'Tritium' upgrade is better.",
        'Discharge bonus improved.',
        'Gain more energy from buying a building.'
    ], [ //Effect text: '[0]', effect[n], '[1]'
        ['Cost scalling is ', ' smaller for each level.'],
        ['Each bought building boost each other by additional ', '.'],
        ['Molecules now produce themselfs ', ' times quicker.'],
        ['Discharge is now gives extra +', ' bonus per reached goal.'],
        ['A single building now gives ', ' times more energy.']
    ], [300, 1500, 1800, 0, 38000], //Cost scalling
    [9, 3, 9, 1, 2]); //Max level
AddUpgradeArray('researchesAuto',
    [300, 3000], //Cost
    ['', 'Particles'], //Effect
    [ //Description
        'Buy toggles.',
        'Automatization for buying upgrades.'
    ], [ //Effect text: '[0]', effect[n], '[1]'
        ['Unlock abbility to buy multiple buildings at same time.', ''],
        ['Will automatically buy ', ' for you.']
    ], [0, 5000], //Cost scalling
    [1, 3]); //Max level
export const playerStart = structuredClone(player) as playerType;
export const globalStart = structuredClone(global) as globalType;
/* For cases when ID of starting values can get changed */
export const startValue = (which: 'p' | 'g') => {
    let value;
    if (which === 'p') {
        value = structuredClone(playerStart);
    } else {
        value = structuredClone(globalStart);
    }
    /* Not adding type, because TS can't give to a function that has only 2 possible outcomes proper type, and NOT type1 | type2 */
    return value;
};

export const updatePlayer = (load: saveType) => {
    if (Object.prototype.hasOwnProperty.call(load, 'player') && Object.prototype.hasOwnProperty.call(load, 'global')) {
        const playerCheck = startValue('p'); //If to add 'as playerType', TS will lose its mind
        for (const i in playerStart) { //This should auto add missing information
            if (!Object.prototype.hasOwnProperty.call(load.player, i)) {
                load.player[i as keyof playerType] = playerCheck[i as keyof playerType];
            }
        }
        /* Next one's will auto add missing part of already existing information */
        if (playerStart.upgrades.length > load.player.upgrades.length) {
            for (let i = load.player.upgrades.length; i < playerStart.upgrades.length; i++) {
                load.player.upgrades[i] = 0;
            }
        }
        if (playerStart.researches.length > load.player.researches.length) {
            for (let i = load.player.researches.length; i < playerStart.researches.length; i++) {
                load.player.researches[i] = 0;
            }
        }
        if (playerStart.researchesAuto.length > load.player.researchesAuto.length) {
            for (let i = load.player.researchesAuto.length; i < playerStart.researchesAuto.length; i++) {
                load.player.researchesAuto[i] = 0;
            }
        }
        if (playerStart.toggles.length > load.player.toggles.length) {
            for (let i = load.player.toggles.length; i < playerStart.toggles.length; i++) {
                load.player.toggles[i] = playerCheck.toggles[i];
            }
        }
        Object.assign(player, load.player);
        global.intervals = load.global.intervals;
    } else {
        Alert('Save file coudn\'t be loaded as its missing important info.');
    }
};
