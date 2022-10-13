import { reset } from './Reset';
import { globalType, playerType } from './Types';

export const player: playerType = { //Only for information that need to be saved (cannot be calculated)
    version: 'v0.0.4',
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
    accretion: { //Stage 3
        rank: 0
    },
    intervals: {
        main: 50,
        numbers: 50,
        visual: 1,
        autoSave: 180
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
    toggles: { //Not all toggles are here, some are saved in local storage instead (support type and font size)
        normal: [], //Auto added for every element with a class 'toggle'
        /* Offline progress[0]; Stage confirm[1]; Discharge confirm[2]; Vaporization confirm[3]; Rank confirm[4] */
        buildings: [], //class 'toggleBuilding' ([0] is only a placeholder)
        auto: [], //class 'toggleAuto'
        shop: {
            howMany: 1,
            input: 10,
            strict: true
        }
    },
    events: [false, false, false] //One time events:
    /* [0] - Discharge explanation, [1] - Accretion new rank unlocked */
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
        maxOffline: 7200
    },
    stageInfo: {
        word: ['Microworld', 'Submerged', 'Accretion'],
        priceName: ['Energy', 'Drops', 'Mass'], //On what you buy upgrades and etc.
        resourceName: ['Energy', 'Clouds', 'Rank'] //Special stage resource
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
    accretionInfo: {
        rankCost: [5.97e27, 1e-7, 1e10, 1e24, 0, 0], //[4] is 5e29
        rankName: ['Ocean world', 'Cosmic dust', 'Meteoroid', 'Asteroid', 'Planet', 'Jovian planet'], //Name of rank (also alt attribute)
        rankImage: ['Ocean%20world', 'Dust', 'Meteoroids', 'Asteroid', 'Planet', 'Giant'] //Source of image (file name and .png auto added)
    },
    intervalsId: {
        main: 0,
        numbers: 0,
        visual: 0,
        autoSave: 0
    },
    buildingsInfo: { //stageCheck(); will automaticly change name and cost (globalStart)
        name: ['Quarks', 'Particles', 'Atoms', 'Molecules'],
        type: ['producing', 'producing', 'producing', 'producing'],
        cost: [0, 3, 24, 3],
        increase: [1.4, 1.4, 1.4, 1.4],
        producing: [0, 0, 0, 0, 0, 0] //Extra's here, only for visual on load (not having NaN)
    },
    /* Every stage using its own array (because I think its better this way) */
    //Also effect text = '[0]', effect[n], '[1]'; Unless effect[n] === null, then text = '[0]'
    //Research cost below 1 is rounded to first 2 digits after a dot (example: 0.123 = 0.12)
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
        cost: [9, 12, 36, 300, 800, 4000, 13000, 36000]
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
        cost: [2000, 6000, 18000, 10000, 42000],
        scalling: [250, 1000, 2000, 0, 88000],
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
            ['Clouds will now use total produced Drops instead, when formed.'],
            ['Some Clouds will start pouring Drops themselfs. (', ' per second)'],
            ['Seas get boost based on amount of Clouds. (Equal to ', ')']
        ],
        effect: [null, 0, 0],
        cost: [1e16, 1e13, 1e26],
        scalling: [0, 100, 0],
        max: [1, 4, 1]
    },
    upgradesS3Info: {
        description: [
            'Brownian motion.',
            'Gas. New substance for Accretion.',
            'Micrometeoroid. Unlock a new building.',
            'Streaming instability.',
            'Gravitational field. Unlock a new building.',
            'Rubble pile.',
            'Satellite system.',
            'Magma ocean.',
            'Atmospehere.',
            'Pebble accretion.',
            'Tidal force.',
            'Ring system.'
        ],
        effectText: [
            ['Through random collisions every bought Dust speeds up Accretion speed. (By ', ')'],
            ['Accretion speed is now quicker based on current Dust amount. (', ' boost)'],
            ['Just a small meteoroid, but it will be a good base for what to come. (Also ', 'x boost to Dust)'],
            ['Small bodies spontaneously concentrate into clumps. (Bought Planetesimals boost each other by ', ')'],
            ['Bodies are now massive enough to affect each other with gravity. (', 'x boost to Planetesimals)'],
            ['Shattered pieces fall back together. Mass producion is now even bigger. (By ', 'x)'],
            ['Unlocks yet another building.'],
            ['Core melted, Accretion speed increased. (Mass production increased by ', ')'],
            ['Accretion speed increased again (because of drag and escape velocity), by ', '.'],
            ['Accretion speed greatly increased by ', '.'],
            ['Satellites scalling cost is now ', ' times smaller.'],
            ['Satellites effect is increased.']
        ],
        effect: [1.01, 0, 2, 1.1, 4, 3, null, 2, 2, 10, 2, null],
        cost: [1e-16, 1e-13, 1e-13, 1, 1e14, 1e17, 1e22, 1e11, 1e23, 1e9, 1e26, 1e29]
    },
    researchesS3Info: {
        description: [
            'More massive bodies.',
            'Adhesion.',
            'Space weathering.',
            'Inelastic collisions.',
            'Contact binary.',
            'Gravity.',
            'Planetary differentiation.',
            'Aerodynamic drag.'
        ],
        effectText: [
            ['Dust production is increased by ', '.'],
            ['Dust particles cling to each other. (+', " to 'Brownian motion')"],
            ['Planetesimals produce more Dust. (', ' times more)'],
            ['Slow encounter velocities will result in a more efficient growth, so this research will make bodies lose more energy with each deflection. Mass production increased by ', '.'],
            ['Some Planetesimals instead of shattering forming contact binary or even trinary. Planetesimals production boosted by ', 'x.'],
            ['Planetesimals attract other bodies with own gravity. Planetesimals get boost to production based on unspent Mass.\n(Total boost: ', ')'],
            ["'Magma Ocean' upgrade is stronger now. (", 'x times)'],
            ["Accretion speed for 'Pebble accretion' increased again, by ", '.']
        ],
        effect: [3, 0.01, 3, 2, 5, 0, 1.5, 3],
        cost: [1e-14, 1e-15, 1e-5, 1e5, 1e10, 1e15, 1e13, 1e12],
        scalling: [11, 111, 22, 10, 100, 10, 100000, 1000],
        max: [7, 3, 9, 4, 2, 5, 3, 3]
    },
    researchesExtraS3Info: {
        description: [
            'Rank, can now boost Dust production.',
            'Efficient growth.',
            'Weight.',
            'Viscosity.'
        ],
        effectText: [
            ['Dust production is increased by another ', '.'],
            ['Accretion speed is even quicker. Multiplied by current rank. (Total boost to Dust: ', ')'],
            ["'Gravitational field' upgrade will boost Protoplanets now as well. (Only half of effect)"],
            ["'Gas' upgrade is now stronger."]
        ],
        effect: [0, 0, null, null],
        cost: [1e-18, 1e-16, 1e26, 1e-12],
        scalling: [10, 100, 0, 100],
        max: [0, 5, 1, 20]
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
        effect: [null, 'Particles', 2],
        cost: [300, 3000, 1e9],
        scalling: [0, 5000, 0],
        max: [1, 3, 1]
    },
    lastUpgrade: [null, 'upgrades', false], //Allows to auto update last looked upgrade description
    lastResearch: [null, 'researches', false] //Not needed right now
};

const createArray = (amount: number, special: 'toggle' | 'toggleAuto') => {
    const array = [];
    for (let i = 0; i < amount; i++) {
        if (special === 'toggle') {
            array.push(true);
        } else if (special === 'toggleAuto') {
            array.push(false);
        }
    }
    return array;
};

const togglesNL = document.getElementsByClassName('toggle').length;
const togglesBL = document.getElementsByClassName('toggleBuilding').length;
const togglesAL = document.getElementsByClassName('toggleAuto').length;
Object.assign(player.toggles, { normal: createArray(togglesNL, 'toggle') });
Object.assign(player.toggles, { buildings: createArray(togglesBL + 1, 'toggleAuto') });
Object.assign(player.toggles, { auto: createArray(togglesAL, 'toggleAuto') });
export const playerStart = structuredClone(player) as playerType;
export const globalStart = structuredClone(global) as globalType;
/* For cases when ID of starting values can get changed */
export const startValue = (which: 'p' | 'g') => {
    if (which === 'p') {
        return structuredClone(playerStart);
    } else { //Because TS can't see that "startValue('p') type !== globalType", there will be no return types
        return structuredClone(globalStart);
    }
};

export const updatePlayer = (load: playerType) => {
    const playerCheck = startValue('p') as playerType;
    //@ts-expect-error //Old save file format had player in it
    if (Object.hasOwn(load, 'player')) { load = load.player; }
    for (const i in playerStart) { //This should auto add missing information
        if (!Object.hasOwn(load, i)) {
            if (i === 'version') {
                load.version = '0.0.0';
            } else {
                load[i as 'version'] = playerCheck[i as 'version']; //TS can't tell that player[i] of same type as player[i]
            }
        }
    }
    for (const i in load) { //This should remove old save file's object properties
        if (!Object.hasOwn(playerStart, i)) {
            delete load[i as keyof playerType];
        }
    }
    /* Next one's will auto add missing part of already existing information */
    const upgradeType = `upgrades${load.stage.current > 1 ? `S${load.stage.current}` : ''}Info` as 'upgradesS2Info';
    const researchType = `researches${load.stage.current > 1 ? `S${load.stage.current}` : ''}Info` as 'researchesS2Info';
    const researchExtraType = `researchesExtraS${load.stage.current}Info` as 'researchesExtraS2Info';

    if (playerStart.buildings.length > load.buildings.length) {
        for (let i = load.buildings.length; i < playerStart.buildings.length; i++) {
            load.buildings[i] = playerCheck.buildings[i];
        }
    }
    if (global[upgradeType].cost.length > load.upgrades.length) {
        for (let i = load.upgrades.length; i < global[upgradeType].cost.length; i++) {
            load.upgrades[i] = 0;
        }
    }
    if (global[researchType].cost.length > load.researches.length) {
        for (let i = load.researches.length; i < global[researchType].cost.length; i++) {
            load.researches[i] = 0;
        }
    }
    if (load.stage.current !== 1) {
        if (global[researchExtraType].cost.length > load.researchesExtra.length) {
            for (let i = load.researchesExtra.length; i < global[researchExtraType].cost.length; i++) {
                load.researchesExtra[i] = 0;
            }
        }
    }
    if (playerStart.researchesAuto.length > load.researchesAuto.length) {
        for (let i = load.researchesAuto.length; i < playerStart.researchesAuto.length; i++) {
            load.researchesAuto[i] = 0;
        }
    }
    if (Object.hasOwn(load.toggles, 'normal')) {
        if (playerStart.toggles.normal.length > load.toggles.normal.length) {
            for (let i = load.toggles.normal.length; i < playerStart.toggles.normal.length; i++) {
                load.toggles.normal[i] = playerCheck.toggles.normal[i];
            }
        }
        if (playerStart.toggles.buildings.length > load.toggles.buildings.length) {
            for (let i = load.toggles.buildings.length; i < playerStart.toggles.buildings.length; i++) {
                load.toggles.buildings[i] = playerCheck.toggles.buildings[i];
            }
        }
        if (playerStart.toggles.auto.length > load.toggles.auto.length) {
            for (let i = load.toggles.auto.length; i < playerStart.toggles.auto.length; i++) {
                load.toggles.auto[i] = playerCheck.toggles.auto[i];
            }
        }
    }
    if (playerStart.events.length > load.events.length) {
        for (let i = load.events.length; i < playerStart.events.length; i++) {
            load.events[i] = playerCheck.events[i];
        }
    }

    Object.assign(player, load);
    /* Version changes (and change log's) */
    const { versionInfo } = global;
    const oldVersion = player.version;
    versionInfo.changed = false;
    versionInfo.log = 'Change log:';
    if (player.version === '0.0.0') {
        player.version = 'v0.0.1';
        versionInfo.log += `\n${player.version} - Stage 2 has properly came out; Buildings and Energy has been reset to prevent save file corruption, sorry`;
        if (player.stage.current === 2) {
            reset('stage');
            player.researchesAuto = [1, 0, 0];
        } else if (player.stage.current === 1) {
            reset('discharge');
            player.discharge.energyMax = 0;
        }
    }
    if (player.version === 'v0.0.1') {
        player.version = 'v0.0.2';
        versionInfo.log += `\n${player.version} - Added dynamic descriptions for upgrades, stats subtab, early Mobile device support`;
        player.stage.resets = player.stage.current === 2 ? 1 : 0;
    }
    if (player.version === 'v0.0.2') {
        player.version = 'v0.0.3';
        versionInfo.log += `\n${player.version} - Stage 3 is out, stage 2 extended. Dynamic update for researches, new stats, full reset of toggles (sorry). Also max offline time is now 2 times bigger...`;
        player.toggles = playerCheck.toggles;
    }
    if (player.version === 'v0.0.3') {
        player.version = 'v0.0.4';
        versionInfo.log += `\n${player.version} - All stage's are now quicker (because too many people complain, but there isn't much of a content currently...), save file size decreased, small visual changes`;
        if (player.stage.current !== 1 || player.discharge.current > 4) { player.events[0] = true; }
    }
    if (oldVersion !== player.version) { versionInfo.changed = true; }
};
