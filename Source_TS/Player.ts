import { reset } from './Reset';
import { Alert } from './Special';
import { globalType, saveType, playerType } from './Types';

export const player: playerType = { //Only for information that need to be saved (cannot be calculated)
    version: 'v0.0.2',
    stage: {
        true: 1,
        current: 1,
        resets: 0
    },
    discharge: { //Stage 1
        energyCur: 0,
        energyMax: 0,
        current: 0
    },
    vaporization: { //Stage 2
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
            total: 3,
            trueTotal: 3
        },
        { //Particles[1]
            current: 0, //On hands
            true: 0, //How many were bought
            total: 0, //How many were gained this reset
            trueTotal: 0 //How many were gained this stage, can be moved elsewhere for history if something
        },
        { //Atoms[2]
            current: 0,
            true: 0,
            total: 0,
            trueTotal: 0
        },
        { //Molecules[3]
            current: 0,
            true: 0,
            total: 0,
            trueTotal: 0
        },
        { //(First apears in stage 2)[4]
            current: 0,
            true: 0,
            total: 0,
            trueTotal: 0
        },
        { //(First apears in stage 2)[5]
            current: 0,
            true: 0,
            total: 0,
            trueTotal: 0
        }
    ],
    /* They are dynamicly changed in reset('stage'); Only 1 array used across all stage's */
    upgrades: [0, 0, 0, 0, 0, 0, 0, 0],
    researches: [0, 0, 0, 0, 0],
    researchesExtra: [0, 0, 0], //First appears in Stage 2
    researchesAuto: [0, 0, 0],
    toggles: [], //Auto added for every element with a class 'toggle', all toggle's are:
    /* Offline progress[0]; Stage confirm[1]; Discharge confirm[2]; Vaporization confirm[3]; Auto for building[1][4], [2][5], [3][6], [4][7], [5][8]; */
    buyToggle: {
        howMany: 1, //If more types will be added
        input: 10, //Then turn all of them
        strict: true //Into array
    }
};

export const global: globalType = { //For information that doesn't need to be saved
    tab: 'stage',
    subtab: {
        /* Tabs and subtab have to have same name as buttons (easier screen reader support this way) */
        settingsCurrent: 'settings'
    },
    footer: true,
    mobileDevice: false,
    screenReader: false,
    versionInfo: {
        changed: false,
        log: 'Change log:'
    },
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
        energyType: [0, 1, 5, 20],
        next: 1
    },
    vaporizationInfo: {
        get: 0
    },
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
    //Also effect text = '[0]', effect[n], '[1]'; Unless effect[n] === null, then text = '[0]'
    upgradesInfo: {
        description: [
            'Bigger electrons. Particles cost decreased.',
            'Stronger protons. Particles produce more.',
            'More neutrons. Increased gain of Particles.',
            'Superposition. Unlocks new reset tier.',
            'Protium. Basic.',
            'Deuterium. Heavy.',
            'Tritium. Radioactive.',
            'Nuclear fusion. More Energy.'
        ],
        effectText: [
            ['Particle cost is ', ' times cheaper.'],
            ['Particles produce ', ' times more Quarks.'],
            ['Atoms produce ', ' times more Particles.'],
            ['Ability to reset at any time, and if you had enough Energy, production for all buildings will be boosted by ', ' times.'],
            ['Cost scalling is decreased by ', '.'],
            ['Buildings (only bought one\'s) boost themselfs by ', ' times.'],
            ['Molecules produce Molecules. At a reduced rate. (', ' per second)'],
            ['Unspent Energy boost Molecules production of themselfs 1 to 1.']
        ],
        effect: [10, 10, 5, 4, 0.2, 1.01, 0, null],
        cost: [9, 12, 36, 300, 800, 5000, 15000, 36000]
    },
    researchesInfo: {
        description: [
            "Effect of 'Protium' upgrade is stronger.",
            "Effect of 'Deuterium' upgrade is bigger.",
            "Effect of 'Tritium' upgrade is better.",
            'Discharge bonus improved.',
            'Gain more Energy from buying a building.'
        ],
        effectText: [
            ['Cost scalling is ', ' smaller for each level.'],
            ['Each bought building, boost each other by additional ', '.'],
            ['Molecules now produce themselfs ', ' times quicker.'],
            ['Discharge is now gives extra +', ' bonus per reached goal.'],
            ['A single building now gives ', ' times more Energy.']
        ],
        effect: [0.01, 0.01, 12, 1, 3],
        cost: [2000, 6500, 20000, 12000, 42000],
        scalling: [300, 1500, 1800, 0, 81456],
        max: [9, 3, 9, 1, 2]
    },
    upgradesS2Info: {
        description: [
            'A single Mole is a 6.022e23 Molecules.',
            'Vaporization. Unlock new reset tier.',
            'Surface tension. Allows for bigger Puddles.',
            'Surface stress. Even bigger Puddles.',
            'Stream. Spreads water around.',
            'River. Spreads even more water.'
        ],
        effectText: [
            ['Drops produce Moles, based on how many Drops you have bought.\n(Bought amount automatically decreases if it\'s less than current amount)'],
            ['Gain ability to convert Drops into Clouds. (Puddles get boost equal to Cloud amount)'],
            ['Puddles get boost based on Moles. (Equal to Moles ^ ', ')'],
            ['Puddles get boost based on Drops. (Equal to Drops ^ ', ')'],
            ['Ponds do not produce Puddles, instead they give direct bonus to them.\nThis upgrade will give extra Puddles for every Pond you have. (', ' extra Puddles per Pond)'],
            ['Lakes now give extra Ponds. (', ' extra Ponds per Lake)']
        ],
        effect: [null, null, 0.02, 0.02, 1, 1],
        cost: [1e4, 1e10, 1000, 10000, 2e9, 5e20]
    },
    researchesS2Info: {
        description: [
            'Better Mole production.',
            'All of it, is still around.',
            'Stronger surface tension.',
            'Stronger surface stress.',
            'More streams.',
            'Distributary channel.'
        ],
        effectText: [
            ['Drops produce ', ' times more Moles.'],
            ['Bonus to buildings is now based on total produced, rather than on hands. Level 1 for Drops, level 2 for Moles.'],
            ['Surface tension upgrade is now +', ' stronger.'],
            ['Surface stress upgrade is now +', ' stronger.'],
            ['With more streams, you can have even more extra Puddles. (+', ' extra Puddles per Pond)'],
            ['Rivers can split now, that allows even more Ponds per Lake. (+', ' per)']
        ],
        effect: [3, null, 0.02, 0.03, 1, 1],
        cost: [20, 1e12, 1e5, 1e6, 1e14, 1e22],
        scalling: [1.2, 1000, 1000, 10000, 1000, 100],
        max: [9, 2, 3, 3, 2, 2]
    },
    researchesExtraS2Info: {
        description: [
            'Natural vaporization.',
            'Rain Clouds.',
            'Storm Clouds.'
        ],
        effectText: [
            ['Clouds will now use total produced Drops instead, when formed. (Weaker past 1e4 Clouds)'],
            ['Some Clouds will start pouring Drops themselfs. (1eX, x = research level - 1)'], //I feel a bit lazy to make it dynamic
            ['Seas get boost based on amount of Clouds. (Clouds ^ ', ')']
        ],
        effect: [null, null, 0.1],
        cost: [1e16, 1e13, 1e25],
        scalling: [0, 100, 0],
        max: [1, 4, 1]
    },
    researchesAutoInfo: { //If new one added, don't forget to add into player (only for this one)
        description: [
            'Buy toggles.',
            'Automatization for buying upgrades.', //Automatically changed every stage
            'Increased max offline time.'
        ],
        effectText: [
            ['Unlock abbility to buy multiple buildings at same time.'],
            ['Will automatically buy ', ' for you.'],
            ['Research this to make max offline timer +', ' hour longer.']
        ],
        effect: [null, 'Particles', 1],
        cost: [300, 3000, 1e9],
        scalling: [0, 5000, 0],
        max: [1, 3, 1]
    },
    lastUpgrade: [null, 'upgrades', false] //Allows to auto update last looked upgrade description
    //lastResearch: [null, 'researches', false] //Not needed right now
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
                if (i === 'version') {
                    load.player[i] = '0.0.0';
                } else {
                    load.player[i as keyof playerType] = playerCheck[i as keyof playerType];
                }
            }
        }
        //No idea if load.player = { ...load.player, ...playerCheck }; would had been better (or even works)

        /* Next one's will auto add missing part of already existing information */
        const upgradeType = `upgrades${load.player.stage.current > 1 ? `S${load.player.stage.current}` : ''}Info` as 'upgradesS2Info';
        const researchType = `researches${load.player.stage.current > 1 ? `S${load.player.stage.current}` : ''}Info` as 'researchesS2Info';
        //const researchExtraType = `researchesExtra${load.player.stage.current !== 1 ? `S${load.player.stage.current}` : ''}Info` as 'researchesExtraS2Info';
        //Not for stage 1 (?)

        if (playerStart.buildings.length > load.player.buildings.length) {
            for (let i = load.player.buildings.length; i < playerStart.buildings.length; i++) {
                load.player.buildings[i] = playerCheck.buildings[i];
            }
        }
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

        /* Version changes (and change log's) */
        const { versionInfo } = global;
        const oldVersion = player.version;
        versionInfo.changed = false;
        versionInfo.log = 'Change log:';
        if (player.version === '0.0.0') {
            player.version = 'v0.0.1';
            versionInfo.log += `\n${player.version} - Stage 2 has properly came out; Your Energy has been fully reset to prevent save file corruption, sorry`;
            if (player.stage.current === 2) {
                reset('stage');
                player.researchesAuto = [1, 0, 0];
            } else if (player.stage.current === 1) {
                if (player.upgrades[3] === 0) {
                    reset('discharge');
                } else { player.discharge.energyCur = 0; }
            }
            player.discharge.energyMax = 0;
        }
        if (player.version === 'v0.0.1') {
            player.version = 'v0.0.2';
            versionInfo.log += `\n${player.version} - Added dynamic descriptions for upgrades, stats subtab, early Mobile device support`;
            player.stage.resets = player.stage.current === 2 ? 1 : 0;
        }
        if (oldVersion !== player.version) { versionInfo.changed = true; }
    } else {
        Alert('Save file coudn\'t be loaded as its missing important info');
    }
};
