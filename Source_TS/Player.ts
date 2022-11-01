import { reset } from './Reset';
import { globalType, playerType } from './Types';

export const player: playerType = { //Only for information that need to be saved (cannot be calculated)
    version: 'v0.0.5', //'v0.0.6',
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
        clouds: 1
    },
    accretion: { //Stage 3
        rank: 0
    },
    collapse: { //Stage 4
        mass: 0.01235,
        stars: [0, 0, 0],
        show: -1
    },
    intervals: {
        main: 100,
        numbers: 100,
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
    elements: [], //Stage 4 special
    researches: [0, 0, 0, 0, 0],
    researchesExtra: [0, 0, 0], //First appears in Stage 2
    researchesAuto: [0, 0, 0],
    toggles: { //Not all toggles are here, some are saved in local storage instead (support type and font size)
        normal: [], //Auto added for every element with a class 'toggle'
        /* Offline progress[0]; Stage confirm[1]; Discharge confirm[2]; Vaporization confirm[3]; Rank confirm[4]; Collapse confirm[5] */
        buildings: [], //class 'toggleBuilding' ([0] is only a placeholder, and 'undefined' is a longer word)
        auto: [], //class 'toggleAuto'
        shop: {
            howMany: 1,
            input: 10,
            strict: true
        }
    },
    events: [false] //One time events, being set on stage reset
};

export const global: globalType = { //For information that doesn't need to be saved
    tab: 'stage', //Tabs and subtab have same name as buttons (for easier screen reader support)
    subtab: {
        /* Subtab format must be: [subtabName] + 'Current' */
        settingsCurrent: 'settings',
        researchCurrent: 'researches'
        //Starting subtab name must be unlocked at same time as tab its part of (or change switchTab() logic)
    },
    tabList: { //Tabs and subtab need to be in same order as in footer
        /* Subtabs format must be: [subtabName] + 'Subtabs' */
        tabs: ['stage', 'research', 'settings', 'special'],
        settingsSubtabs: ['settings', 'stats'],
        researchSubtabs: ['researches', 'elements']
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
        word: ['Microworld', 'Submerged', 'Accretion', 'Interstellar'],
        priceName: ['Energy', 'Drops', 'Mass', 'Elements'], //On what you buy upgrades and etc.
        resourceName: ['Energy', 'Clouds', 'Rank', 'Stars'] //Special stage resource
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
    collapseInfo: {
        unlockPriceB: [0, 0.01235, 0.23, 10, 40], //Buildings
        unlockPriceU: [0.01235, 0.076, 1.3], //Upgrades
        unlockPriceR: [0.18, 0.3, 0.8], //Researches
        newMass: 0,
        starCheck: [0, 0, 0]
    },
    intervalsId: {
        main: 0,
        numbers: 0,
        visual: 0,
        autoSave: 0
    },
    buildingsInfo: { //stageCheck(); will automaticly change name and startCost
        name: ['Quarks', 'Particles', 'Atoms', 'Molecules'],
        type: ['producing', 'producing', 'producing', 'producing'],
        cost: [0, 3, 24, 3],
        startCost: [0, 3, 24, 3],
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
            ['Buildings (only self-made one\'s) boost themselfs by ', ' times.'],
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
            ['Each self-made building, boost each other by additional ', '.'],
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
            ['Drops produce Moles, based on how many Drops you have made.\n(You lose self-made one\'s automatically, if they are less than current amount)'],
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
            'Atmosphere.',
            'Pebble accretion.',
            'Tidal force.',
            'Ring system.'
        ],
        effectText: [
            ['Through random collisions every self-made Dust speeds up Accretion speed. (By ', ')'],
            ['Accretion speed is now quicker based on current Dust amount. (', ' boost)'],
            ['Just a small meteoroid, but it will be a good base for what to come. (Also ', 'x boost to Dust)'],
            ['Small bodies spontaneously concentrate into clumps. (Self-made Planetesimals boost each other by ', ')'],
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
        max: [12, 5, 1, 20]
    },
    upgradesS4Info: {
        description: [
            'Gravitational collapse.',
            'Proton-proton chain.',
            'Carbon–Nitrogen–Oxygen cycle.'
        ],
        effectText: [
            ['As fuel runs out, each star will boost production in its own special way.'],
            ['Fuse with Protium instead of Deuterium. Unlocks a new building and something else.'],
            ['CNO cycle is now a better source of Helium and Energy. Unlocks a new building and more of something else.']
        ],
        effect: [null, null, null],
        cost: [100, 1000, 1e9]
    },
    elementsInfo: {
        description: [
            '[0] Placeholder.',
            '[1] Hydrogen.',
            '[2] Helium.',
            '[3] Lithium.',
            '[4] Beryllium.',
            '[5] Boron.',
            '[6] Carbon.',
            '[7] Nitrogen.',
            '[8] Oxygen.',
            '[9] Fluorine.',
            '[10] Neon.',
            '[11] Sodium.',
            '[12] Magnesium.',
            '[13] Aluminium.',
            '[14] Silicon.',
            '[15] Phosphorus.',
            '[16] Sulfur.',
            '[17] Chlorine.',
            '[18] Argon.',
            '[19] Potassium.',
            '[20] Calcium.',
            '[21] Scandium.',
            '[22] Titanium.',
            '[23] Vanadium.',
            '[24] Chromium.',
            '[25] Manganese.',
            '[26] Iron.'
        ],
        effectText: [
            ['Placeholder'],
            ['Most basic element, increases Brown dwarf production by ', '.'],
            ['Fusion reaction by product, makes everything scale ', ' less.'],
            ['First metal, Mass per Brown dwarf lightly increased.'],
            ['Brittle earth metal, so is brittle increase to production. (', 'x to all Stars)'],
            ['A new color, and a new boost to Mass gain that is based on current Dwarf Stars.'],
            ['Base for organics, boost to Main-sequence stars through Red giants is now increases to power of ', '.'],
            ['Most abundant uncombined Element in atmospehere of some Planets, also gives you ', " extra levels to 'Star system'."],
            ['An oxidizing agent, that will make everything scale even slower. (', ' less)'],
            ['Highly toxic and reactive, +', " to max level of 'Planetary system'."],
            ['A noble ', 'x boost to Mass gain.'],
            ['Through leaching, you can get ', " extra level of 'Protoplanetary disk'."],
            ['Star is inside you, as well Neutrons stars boost to all Stars is now increased to the decimal logarithm.'],
            ['Has a great affinity towards oxygen and to decrease cost of all Stars by ', '.'],
            ['Number is 14, group is 14, also 1414°C and Mass gain increased by ', '.'],
            ['One of the fundamentals for life and to make all of your Stars boost Mass.'],
            ['From hot area, to give you +', " max level to 'Star system'.\nResearch softcapped past 1e10."],
            ["Extremely reactive to extend max level of 'Planetary system', by another ", ' levels.'],
            ['Less noble boost, but bonus to Mass gain from Black holes scales a little better.'],
            ['Don\'t forget about it and get a ', 'x boost to all Stars.'],
            ['Make yourself stronger with ', " extra level of 'Star system'.\nEffect is weaker, after 5 levels."],
            ['A new color and a rare bonus of ^', ' to Mass effect.'],
            ['New alloy allowing Red giants to be added into effective amount of Neutron stars.'],
            ['Catalyst for your production of Elements. Black holes boost all Stars to the decimal logarithm.'],
            ['No corrosion, only ^', ' boost to all Stars based on unspent Elements.'],
            ['Brittle element, but not the bonus - ', " more level in 'Star system'."],
            ['Work in progress, sorry, that is the end for now...'] //Nuclear fusion no longer efficient
        ],
        effect: [
            null, 2, 0.1, null, 1.1, null, 1.5, 2, 0.05, 12,
            2, 1, null, 1e3, 1.4, null, 1, 27, null, 3,
            1, 1.1, null, null, 0.01, 1, null
        ],
        cost: [ //player.collapse.show uses highest bought element to tell if you ever had it (so cost of all next one's has to be higher)
            1e308, 1000, 4000, 2e4, 1e5, 1e8, 1e10, 4e11, 2e13, 1e14,
            1e16, 1e20, 1e24, 1e25, 1.4e27, 1e30, 1e31, 5e31, 5e33, 1e35,
            1e36, 1e38, 2e39, 3e41, 4e42, 1e45, 1e50
        ]
    },
    researchesS4Info: {
        description: [
            'Planetary system.',
            'Star system.',
            'Protoplanetary disk.'
        ],
        effectText: [
            ['From Planetesimals to Planets, you get ', 'x boost to all Stars.'],
            ['Each Star boost another Star. (Total to each Star is ', 'x).'],
            ["Improve effect of 'Planetary system', as well increases its max level by +", '.']
        ],
        effect: [1.1, 1, 3],
        cost: [1000, 50000, 1e8],
        scalling: [10, 200, 1e12],
        max: [3, 2, 1]
    },
    researchesExtraS4Info: {
        description: [
            'At the end of Star life.'
        ],
        effectText: [
            ['', ' building now gives something new, upon collapse reset.']
        ],
        effect: ['Main sequence'],
        cost: [1e6],
        scalling: [1e12],
        max: [3]
    },
    researchesAutoInfo: { //If new one added, don't forget to add into player (only for this one)
        description: [
            'Buy toggles.',
            'Automatization for buying buildings.', //Automatically changed every stage
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

export const checkPlayerValues = () => {
    const { stage } = player;
    const upgradeType = `upgrades${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'upgradesS2Info';
    const researchType = `researches${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'researchesS2Info';
    const researchExtraType = `researchesExtraS${stage.current}Info` as 'researchesExtraS2Info';

    //No visual update, until it can happen naturally
    for (let i = 0; i < global[upgradeType].cost.length; i++) {
        if (player.upgrades[i] > 1) {
            player.upgrades[i] = 1;
            console.error(`Upgrade (${i + 1}) had an illegal value`);
        }
    }
    if (stage.current === 4) {
        for (let i = 1; i < global.elementsInfo.cost.length; i++) {
            if (player.elements[i] > 1) {
                player.elements[i] = 1;
                console.error(`Element (${i}) had an illegal value`);
            }
        }
    }
    for (let i = 0; i < global[researchType].cost.length; i++) {
        if (player.researches[i] > global[researchType].max[i]) {
            player.researches[i] = global[researchType].max[i];
            console.error(`Research (${i + 1}) had level above maxium`);
        }
    }
    if (stage.current !== 1) {
        for (let i = 0; i < global[researchExtraType].cost.length; i++) {
            if (player.researchesExtra[i] > global[researchExtraType].max[i]) {
                player.researchesExtra[i] = global[researchExtraType].max[i];
                console.error(`Extra research (${i + 1}) had level above maxium`);
            }
        }
    }
    for (let i = 0; i < global.researchesAutoInfo.cost.length; i++) {
        if (player.researchesAuto[i] > global.researchesAutoInfo.max[i]) {
            player.researchesAuto[i] = global.researchesAutoInfo.max[i];
            console.error(`Research (${i + 1}) for automatization had level above maxium`);
        }
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
    if (load.stage.current !== 1) { //It's possible to put inside next one, but just want to be safe (against reference error's)
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
    if (load.stage.current === 4 && global.elementsInfo.cost.length > load.elements.length) {
        for (let i = load.elements.length; i < global.elementsInfo.cost.length; i++) {
            load.elements[i] = 0;
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
    } else {
        load.toggles = playerCheck.toggles;
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
    }
    if (player.version === 'v0.0.3') {
        player.version = 'v0.0.4';
        versionInfo.log += `\n${player.version} - All stage's are now quicker (because too many people complain, but there isn't much of a content currently...), save file size decreased, small visual changes`;
        if (player.stage.current !== 1 || player.discharge.current > 4) { player.events = [true]; } //Remove later
    }
    if (player.version === 'v0.0.4') {
        player.version = 'v0.0.5';
        versionInfo.log += `\n${player.version} - First part of Stage 4 is out, also small visual changes. Screen readers support updated (I forgot about it since stage 2...). Also testing new formula for buying buildings and other minor stuff`;
    }
    /*if (player.version === 'v0.0.5') {
        player.version = 'v0.0.6';
        versionInfo.log += `\n${player.version} - Minor bug fixes, also transition for theme change fixed. Minor QoL, hotkeys, event system reworked`;*/
    if (player.collapse.show === undefined) { //Temprorary until I finish update
        player.collapse.show = -1;
    }
    if (player.events.length > 1) {
        player.events = [false];
    }
    //}
    if (oldVersion !== player.version) { versionInfo.changed = true; }
};
