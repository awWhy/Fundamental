import { Alert } from './Special';
import { globalType, saveType, playerType } from './Types';

export const player: playerType = { //Only for information that need to be saved (cannot be calculated)
    //version: 0.0.1, //If someone will be playing, have a check for game version incase some save file changes or other
    stage: {
        true: 1,
        current: 1
    },
    energy: {
        current: 0,
        total: 0
    },
    discharge: {
        current: 0,
        bonus: 0
    },
    vaporization: {
        current: 0,
        clouds: 1
    },
    time: {
        updated: Date.now(),
        started: Date.now()
    },
    buildings: [ //If new building to be addded, then also add extra's to 'global.buildingsInfo.producing' (only visual importance)
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
        },
        { //(First apears in stage 2)[4]
            current: 0,
            true: 0,
            total: 0
        },
        { //(First apears in stage 2)[5]
            current: 0,
            true: 0,
            total: 0
        }
    ],
    /* They are dynamicly changed in reset('stage'); Only 1 array used across all stage's */
    upgrades: [0, 0, 0, 0, 0, 0, 0, 0],
    researches: [0, 0, 0, 0, 0],
    researchesAuto: [0, 0, 0],
    toggles: [], //Auto added for every element with a class 'toggle', all toggle's are:
    /* Offline progress[0]; Stage confirm[1]; Discharge confirm[2]; Custom font size[3]; Auto for building[1][4], [2][5], [3][6], [4][7], [5][8];
       Vaporization confirm[9]; */
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
    energyType: [0, 1, 5, 20],
    timeSpecial: {
        lastSave: 0,
        maxOffline: 3600
    },
    stageInfo: {
        word: ['Microworld', 'Submerged'],
        priceName: ['Energy', 'Drops'], //On what you buy upgrades and etc.
        resourceName: ['Energy', 'Clouds'] //Special stage resource
    },
    theme: {
        stage: 1,
        default: true
    },
    dischargeInfo: {
        next: 1
    },
    /*vaporizationInfo: {
        get: 0
    },*/
    intervals: {
        main: 50,
        numbers: 50,
        visual: 1,
        autoSave: 180
    },
    intervalsId: {
        main: 0,
        numbers: 0,
        visual: 0,
        autoSave: 0
    },
    buildingsInfo: { //stageCheck(); will automaticly change name and cost (globalStart)
        name: ['Quarks', 'Particles', 'Atoms', 'Molecules'],
        cost: [0, 3, 24, 3],
        increase: 1.4,
        producing: [0, 0, 0, 0, 0, 0] //2 extra here, only for visual on load (not having NaN)
    },
    /* Every stage using its own array (because I think its better this way) */
    //Also effect text = '[0]', effect[n], '[1]'; Unless effect[n] === 0, then text = '[0]'
    upgradesInfo: {
        description: [
            'Bigger electrons. Particles cost decreased.',
            'Stronger protons. Particles produce more.',
            'More neutrons. Increased gain of Particles.',
            'Superposition. Unlocks new reset tier.',
            'Protium. Basic.',
            'Deuterium. Heavy.',
            'Tritium. Radioactive.',
            'Nuclear fusion. More energy.'
        ],
        effectText: [
            ['Particle cost is ', ' times cheaper.'],
            ['Particles produce ', ' times more Quarks.'],
            ['Atoms produce ', ' times more Particles.'],
            ['Abbility to reset at any time and boost production for all buildings by ', ', if had enough energy.'],
            ['Cost scalling is decreased by ', '.'],
            ['Buildings (only bought one\'s) boost themselfs by ', ' times.'],
            ['Molecules produce Molecules. At a reduced rate.'],
            ['Unspent energy boost Molecules production of themselfs 1 to 1.']
        ],
        effect: [10, 10, 5, 4, 0.2, 1.01, 0, 0],
        cost: [9, 12, 36, 300, 800, 5000, 15000, 36000]
    },
    upgradesS2Info: {
        description: [
            'Surface tension. Allows for bigger Puddles.',
            'Streams. Spread quicker.',
            '',
            'Vaporization. Unlock new reset tier.',
            '',
            ''
        ],
        effectText: [
            ['Each Puddle boost Puddle production by ', '.'],
            ['Ponds boost to Puddles produtcion is now ', ' times bigger.'],
            ['', ''],
            ['Gain ability to convert Drops into Clouds. (', ' per 1)'],
            ['', ''],
            ['', '']
        ],
        effect: [1.03, 1.5, 0, 1e10, 0, 0],
        cost: [1000, 2e8, 0, 1e10, 0, 0]
    },
    researchesInfo: {
        description: [
            "Effect of 'Protium' upgrade is stronger.",
            "Effect of 'Deuterium' upgrade is bigger.",
            "Effect of 'Tritium' upgrade is better.",
            'Discharge bonus improved.',
            'Gain more energy from buying a building.'
        ],
        effectText: [
            ['Cost scalling is ', ' smaller for each level.'],
            ['Each bought building boost each other by additional ', '.'],
            ['Molecules now produce themselfs ', ' times quicker.'],
            ['Discharge is now gives extra +', ' bonus per reached goal.'],
            ['A single building now gives ', ' times more energy.']
        ],
        effect: [0.01, 0.01, 12, 1, 3],
        cost: [2000, 6500, 20000, 12000, 42000],
        scalling: [300, 1500, 1800, 0, 81456],
        max: [9, 3, 9, 1, 2]
    },
    researchesS2Info: {
        description: [
            'More moles.',
            'Production of Drops is boosted.',
            'Surface stress.'
        ],
        effectText: [
            ['Drops produce ', ' times more moles.'],
            ['Drops now give boost to what produces them based of bought amount, at a reduced rate.'],
            ['Surface tension upgrade is now +', ' stronger.']
        ],
        effect: [3, 0, 0.01],
        cost: [20, 1e9, 1e5],
        scalling: [1.2, 0, 10],
        max: [9, 1, 2]
    },
    researchesAutoInfo: { //If new one added, don't forget to add into player (only for this one)
        description: [
            'Buy toggles.',
            'Automatization for buying upgrades.', //Auto changed every stage
            'More max offline time.'
        ],
        effectText: [
            ['Unlock abbility to buy multiple buildings at same time.'],
            ['Will automatically buy ', ' for you.'],
            ['Research this to make max offline timer +', ' hours.']
        ],
        effect: [0, 'Particles', 1],
        cost: [300, 3000, 1e11],
        scalling: [0, 5000, 0],
        max: [1, 3, 1]
    }
};

const createArray = (amount: number) => {
    const array = [];
    for (let i = 0; i < amount; i++) {
        if (i >= 4 && i <= 8) {
            array.push(false);
        } else {
            array.push(true);
        }
    }
    return array;
};

const togglesL = document.getElementsByClassName('toggle').length;
Object.assign(player, { toggles: createArray(togglesL) });
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
        const upgradeType = `upgrades${load.player.stage.current > 1 ? `S${load.player.stage.current}` : ''}Info` as 'upgradesS2Info';
        const researchType = `researches${load.player.stage.current > 1 ? `S${load.player.stage.current}` : ''}Info` as 'researchesS2Info';

        if (global[upgradeType].cost.length > load.player.upgrades.length) {
            for (let i = load.player.upgrades.length; i < global[upgradeType].cost.length; i++) {
                load.player.upgrades[i] = 0;
            }
        }
        if (global[researchType].cost.length > load.player.researches.length) {
            for (let i = load.player.researches.length; i < global[researchType].cost.length; i++) {
                load.player.researches[i] = 0;
            }
        }
        if (playerStart.buildings.length > load.player.buildings.length) {
            for (let i = load.player.buildings.length; i < playerStart.buildings.length; i++) {
                load.player.buildings[i] = {
                    current: 0,
                    true: 0,
                    total: 0
                };
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
