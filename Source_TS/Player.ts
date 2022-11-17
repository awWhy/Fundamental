import { globalType, playerType } from './Types';

export const player: playerType = { //Only for information that need to be saved (cannot be calculated)
    version: 'v0.0.8',
    fileName: 'Fundamental, [stage], [date] [time]',
    separator: ['', '.'], //[0] every 3 numbers, [1] point
    stage: {
        true: 1,
        current: 1,
        resets: 0,
        export: 1,
        input: 1
    },
    discharge: { //Stage 1
        energyCur: 0,
        energyMax: 0,
        current: 0
    },
    vaporization: { //Stage 2
        clouds: 1,
        input: 10
    },
    accretion: { //Stage 3
        rank: 0
    },
    collapse: { //Stage 4
        mass: 0.01235,
        stars: [0, 0, 0],
        show: -1,
        inputM: 4,
        inputS: 2
    },
    intervals: {
        main: 100,
        numbers: 100,
        visual: 1,
        autoSave: 60
    },
    time: {
        updated: Date.now(),
        started: Date.now()
    },
    buildings: [ //If new building to be added, then also add extra's to 'global.buildingsInfo.producing' (only visual importance)
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
        { //(First appears in stage 2)[4]
            current: 0,
            true: 0,
            total: 0,
            trueTotal: 0
        },
        { //(First appears in stage 2)[5]
            current: 0,
            true: 0,
            total: 0,
            trueTotal: 0
        }
    ],
    strange: [ //Stage 5 special
        { //Quarks[0]
            true: 0, //For [0] its gained through reset
            total: 0
        }
    ],
    /* They are dynamically changed in reset('stage'); Only 1 array used across all stage's */
    upgrades: [0, 0, 0, 0, 0, 0, 0, 0],
    elements: [], //Stage 4 special
    researches: [0, 0, 0, 0, 0, 0],
    researchesExtra: [], //First appears in Stage 2
    researchesAuto: [0, 0, 0, 0],
    strangeness: [ //Stage 5 special
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    toggles: { //Not all toggles are here, some are saved in local storage instead (support type and font size)
        normal: [], //Auto added for every element with a class 'toggle'
        /* Offline progress[0]; Stage confirm[1]; Discharge confirm[2]; Vaporization confirm[3]; Rank confirm[4]; Collapse confirm[5]
           Hotkeys type[6] */
        buildings: [], //Class 'toggleBuilding' ([0] is toggle all)
        auto: [], //Class 'toggleAuto'
        /* Stage[0], Discharge[1], Vaporization[2], Rank[3], Collapse[4],
           Upgrades[5], Researches[6], ResearchesExtra[7] */
        shop: {
            howMany: 1,
            input: 10,
            strict: true
        }
    },
    events: [false] //One time events, can be seen in playEvent();
};

export const global: globalType = { //For information that doesn't need to be saved
    tab: 'stage', //Tabs and subtabs have same name as buttons (for easier screen reader support)
    subtab: {
        /* Subtab format must be: [subtabName] + 'Current' */
        settingsCurrent: 'settings',
        researchCurrent: 'researches'
        //Starting subtab name must be unlocked at same time as tab its part of (or change switchTab() logic)
    },
    tabList: { //Tabs and subtab need to be in same order as in footer
        /* Subtabs format must be: [subtabName] + 'Subtabs' */
        tabs: ['stage', 'research', 'strangeness', 'settings', 'special'],
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
        word: ['Microworld', 'Submerged', 'Accretion', 'Interstellar', 'Intergalactic'], //Stage amount is based on lenght
        textColor: ['var(--cyan-text-color)', 'var(--blue-text-color)', 'var(--gray-text-color)', 'var(--orange-text-color)', 'var(--darkorchid-text-color)'],
        borderColor: ['#008b8b', '#1460a8', '#5b5b75', '#e87400', '#b324e2'],
        priceName: 'Energy', //On what you buy upgrades and etc.
        resourceName: 'Energy', //Special stage resource (only used for SR, as of now)
        autoStage: [1, 0, 2, 3] //Stage at which you can buy auto research (All 0's need to be manually added into checkUpgrade)
    },
    automatization: { //It's [[upgradeIndex, upgradeCost]] sorted cheapest first
        autoU: [], //Upgrades
        autoR: [], //Researches
        autoE: [] //Researches Extra
    },
    theme: {
        stage: 1,
        default: true
    },
    dischargeInfo: {
        energyType: [0, 1, 5, 20],
        base: 4,
        step: 10,
        next: 1
    },
    vaporizationInfo: {
        get: 0
    },
    accretionInfo: {
        rankU: [1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5], //Upgrades
        rankR: [1, 1, 2, 2, 3, 3, 4, 5], //Researches
        rankE: [2, 3, 4, 5], //Researches Extra
        rankCost: [5.97e27, 1e-7, 1e10, 1e24, 0, 0], //[4] is 5e29
        rankName: ['Ocean world', 'Cosmic dust', 'Meteoroid', 'Asteroid', 'Planet', 'Jovian planet'], //Name of rank (also alt attribute)
        rankImage: ['Ocean%20world', 'Dust', 'Meteoroids', 'Asteroid', 'Planet', 'Giant'] //Source of image (file name and .png auto added)
    },
    collapseInfo: {
        unlockB: [0, 0.01235, 0.23, 10, 40], //Buildings
        unlockU: [0.01235, 0.076, 1.3, 10], //Upgrades
        unlockR: [0.18, 0.3, 0.8, 2], //Researches
        newMass: 0,
        starCheck: [0, 0, 0]
    },
    intervalsId: {
        main: 0,
        numbers: 0,
        visual: 0,
        autoSave: 0
    },
    buildingsInfo: { //stageCheck(); will automatically change name and startCost
        name: ['Quarks', 'Particles', 'Atoms', 'Molecules'],
        type: ['producing', 'producing', 'producing', 'producing'],
        cost: [0, 3, 24, 3],
        startCost: [0, 3, 24, 3],
        increase: [1.4, 1.4, 1.4, 1.4],
        producing: [0, 0, 0, 0, 0, 0] //Extra's here, only for visual on load (not having NaN)
    },
    strangeInfo: {
        stageGain: 0,
        producing: [0, 0, 0]
    },
    /* Every stage using its own array (because I think its better this way) */
    //Also effect text = '[0]', effect[n], '[1]'; Unless effect[n] === null, then text = '[0]'
    //Research cost below 1 is rounded to first 2 digits after a dot (example: 0.123 = 0.12)
    //Also effective upgrade amount is based on cost length
    upgradesInfo: {
        description: [
            'Bigger electrons. Particles cost decreased.',
            'Stronger protons. Particles produce more.',
            'More neutrons. Increased gain of Particles.',
            'Superposition. Unlocks a new reset tier.',
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
            ['Cost scaling is decreased by ', '.'],
            ['Buildings (only self-made one\'s) boost themselves by ', ' times.'],
            ['Molecules produce Molecules. At a reduced rate. (', ' per second)'],
            ['Unspent Energy boost Molecules production of themselves 1 to 1.']
        ],
        effect: [10, 10, 5, 4, 0.2, 1.01, 0, null],
        cost: [9, 12, 36, 300, 800, 2000, 8000, 30000]
    },
    researchesInfo: {
        description: [
            "Effect of 'Protium' upgrade is stronger.",
            "Effect of 'Deuterium' upgrade is bigger.",
            "Effect of 'Tritium' upgrade is better.",
            'Discharge goal requirements decreased.',
            'Discharge bonus improved.',
            'Radioactive Discharge.'
        ],
        effectText: [
            ['Cost scaling is ', ' smaller for each level.'],
            ['Each self-made building, boost each other by additional ', '.'],
            ['Molecules now produce themselves ', ' times quicker.'],
            ['Next goal for Discharge bonus scales by -', ' less'],
            ['Discharge is now gives ', ' times bigger bonus per reached goal.'],
            ["Discharge will boost 'Tritium' upgrade for every reached goal + 1."]
        ],
        effect: [0.01, 0.01, 12, 1, 2, null],
        cost: [1000, 3000, 12000, 6000, 10000, 20000],
        scaling: [500, 2000, 2000, 26000, 0, 5000],
        max: [9, 3, 9, 2, 1, 3]
    },
    upgradesS2Info: {
        description: [
            'Molecules to Moles. Even more Moles.',
            'Vaporization. Unlock a new reset tier.',
            'Surface tension. Allows for bigger Puddles.',
            'Surface stress. Even bigger Puddles.',
            'Stream. Spreads water around.',
            'River. Spreads even more water.',
            'Tsunami. Spreads water too fast.'
        ],
        effectText: [
            ['Drops produce Moles, based on how many self-made Drops you have.\n(Self-made amount will decrease, if less than overall amount)'],
            ['Gain ability to convert Drops into Clouds. (Puddles get a boost equal to Cloud amount)'],
            ['Puddles get boost based on Moles. (Equal to Moles ^ ', ')'],
            ['Puddles get boost based on Drops. (Equal to Drops ^ ', ')'],
            ['Ponds do not produce Puddles, instead they give direct bonus to them.\nThis upgrade will give extra Puddles for every Pond you have. (', ' extra Puddles per Pond)'],
            ['Lakes now give extra Ponds. (', ' extra Ponds per Lake)'],
            ['Each Sea gives ', ' extra Lake.']
        ],
        effect: [null, null, 0.02, 0.02, 1, 1, 1],
        cost: [1e4, 1e10, 1000, 10000, 2e9, 5e20, 1e28]
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
        scaling: [1.2, 1000, 1000, 10000, 1000, 100],
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
            ['Some Clouds will start pouring Drops themselves. (', ' per second)'],
            ['Seas get a boost based on amount of Clouds. (Equal to ', ')']
        ],
        effect: [null, 0, 0],
        cost: [1e16, 1e13, 1e26],
        scaling: [0, 100, 0],
        max: [1, 4, 1]
    },
    upgradesS3Info: { //Stage 3 upgrades also need to be added into accretionInfo.rankU
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
            ['Shattered pieces fall back together. Mass production is now even bigger. (By ', 'x)'],
            ['Unlocks yet another building.'],
            ['Core melted, Accretion speed increased. (Mass production increased by ', ')'],
            ['Accretion speed increased again (because of drag and escape velocity), by ', '.'],
            ['Accretion speed greatly increased by ', '.'],
            ['Satellites scaling cost is now ', ' times smaller.'],
            ['Satellites effect is increased.']
        ],
        effect: [1.01, 0, 2, 1.02, 4, 3, null, 2, 2, 10, 2, null],
        cost: [1e-16, 1e-13, 1e-13, 1, 1e14, 1e17, 1e22, 1e11, 1e23, 1e9, 1e26, 1e29]
    },
    researchesS3Info: { //Stage 3 researches also need to be added into accretionInfo.rankR
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
            ['Some Planetesimals instead of shattering form a contact binary or even trinary. Planetesimals production boosted by ', 'x.'],
            ['Planetesimals attract other bodies with own gravity. Planetesimals get boost to production based on unspent Mass.\n(Total boost: ', ')'],
            ["'Magma Ocean' upgrade is stronger now. (", 'x times)'],
            ["Accretion speed for 'Pebble accretion' increased again, by ", '.']
        ],
        effect: [3, 0.01, 3, 2, 5, 0, 1.5, 3],
        cost: [1e-14, 1e-15, 1e-5, 1e5, 1e10, 1e15, 1e13, 1e12],
        scaling: [11, 111, 22, 10, 100, 10, 100000, 1000],
        max: [7, 3, 9, 4, 2, 5, 3, 3]
    },
    researchesExtraS3Info: { //Stage 3 researches also need to be added into accretionInfo.rankE
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
        scaling: [10, 100, 0, 100],
        max: [12, 5, 1, 20]
    },
    upgradesS4Info: { //Stage 4 upgrades also need to be added into collapseInfo.unlockU
        description: [
            'Gravitational collapse.',
            'Proton-proton chain.',
            'Carbon–Nitrogen–Oxygen cycle.',
            'Helium fusion.'
        ],
        effectText: [
            ['As fuel runs out, each star will boost production in its own special way.'],
            ['Fuse with Protium instead of Deuterium. Unlocks a new building and something else.'],
            ['CNO cycle is now a better source of Helium and Energy. Unlocks a new building and more of something else.'],
            ['Through Triple-alpha and then Alpha process, unlock a few more elements.']
        ],
        effect: [null, null, null, null],
        cost: [100, 1000, 1e9, 1e50]
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
            '[26] Iron.',
            '[27] Cobalt.',
            '[28] Nickel.'
        ],
        effectText: [
            ['Placeholder'],
            ['Most basic element, increases Brown dwarf production by ', '.'],
            ['Fusion reaction by product, makes everything scale ', ' less.'],
            ['First metal, Mass per Brown dwarf lightly increased.'],
            ['Brittle earth metal, so is brittle increase to production. (', 'x to all Stars)'],
            ['A new color, and a new boost to Mass gain that is based on current Dwarf Stars.'],
            ['Base for organics, boost to Main-sequence stars through Red giants is now increased to power of ', '.'],
            ['Most abundant uncombined Element in atmosphere of some Planets, also gives you ', " extra levels to 'Star system'."],
            ['An oxidizing agent, that will make everything scale even slower. (', ' less)'],
            ['Highly toxic and reactive, +', " to max level of 'Planetary system'."],
            ['A noble ', 'x boost to Mass gain.'],
            ['Through leaching, you can get ', " extra level of 'Protoplanetary disk'."],
            ['Stars are inside you, as well Neutrons stars boost to all Stars is now increased to the decimal logarithm.'],
            ['Has a great affinity towards oxygen and to decrease cost of all Stars by ', '.'],
            ['Number is 14, group is 14, also 1414°C and so is Mass gain increased by ', '.'],
            ['One of the fundamentals of life and to make all of your Stars boost Mass.'],
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
            ['Any further fusion will be an endothermic process. Gain ', 'x boost to all Stars, but what next?'],
            ['While new Elements do not give much Energy, they still can give ', ' Strange quark during this Stage reset.'],
            ['Slow to react, but gain +', ' Strange quarks for every 5 new digits anyway.']
        ],
        effect: [
            null, 2, 0.1, null, 1.1, null, 1.5, 2, 0.05, 12,
            2, 1, null, 1e3, 1.4, null, 1, 27, null, 3,
            1, 1.1, null, null, 0.01, 1, 2, 1, 2
        ],
        cost: [ //player.collapse.show uses highest bought element to tell if you ever had it (so cost of all next one's has to be higher)
            1e308, 1000, 4000, 2e4, 1e5, 1e8, 1e10, 4e11, 2e13, 1e14,
            1e16, 1e20, 1e24, 1e25, 1.4e27, 1e30, 1e31, 5e31, 5e33, 1e35,
            1e36, 1e38, 2e39, 3e41, 4e42, 1e45, 1e50, 1e55, 1e60
        ]
    },
    researchesS4Info: { //Stage 4 researches also need to be added into collapseInfo.unlockR
        description: [
            'Planetary system.',
            'Star system.',
            'Protoplanetary disk.',
            'Planetary nebula.'
        ],
        effectText: [
            ['From Planetesimals to Planets, you get ', 'x boost to all Stars.'],
            ['Each Star boost another Star. (Total to each Star is ', 'x)'],
            ["Improve effect of 'Planetary system', as well increases its max level by +", '.'],
            ['Matter expelled from Red giants, but you get ', 'x boost to Main-sequence stars anyway.']
        ],
        effect: [1.1, 1, 3, 10],
        cost: [1000, 50000, 1e8, 1e12],
        scaling: [10, 200, 1e12, 0],
        max: [3, 2, 1, 1]
    },
    researchesExtraS4Info: {
        description: [
            'At the end of Star life.',
            'White dwarfs.'
        ],
        effectText: [
            ['', ' building now gives something new, upon collapse reset.'],
            ['Red giants started to turn into White dwarfs. Main-sequence stars production increased based on amount of Red giants again.']
        ],
        effect: ['Main sequence', null],
        cost: [1e6, 1e30],
        scaling: [1e12, 0],
        max: [3, 1]
    },
    researchesAutoInfo: { //If new one added, need to add it into player.researchesAuto and stageInfo.autoStage
        description: [
            'Make toggles.',
            'Automatization for making buildings.',
            'Increased max offline time.',
            'Automatic upgrades.'
        ],
        effectText: [
            ['Unlock ability to make multiple buildings at same time.'],
            ['Will automatically make ', ' for you.'],
            ['Research this to make max offline timer +', ' hours longer.'],
            ['This is going to create all upgrades for you automatically. Each level increases highest type of upgrades to create.']
        ],
        effect: [null, 'Particles', 2, null],
        cost: [300, 4000, 1e9, 1], //Price and scalling for [1] is auto changed in stageCheck();
        scaling: [29700, 8000, 2e6, 1e10],
        max: [1, 3, 1, 0]
    },
    strangenessInfo: [{ //If new one's added then better, just in case, add them into player.strangeness
        description: [
            'Stronger Discharge.',
            'Cheaper Discharge.',
            'Free Discharge.',
            'Automatic Discarge.',
            'More Particle Energy.',
            "Better 'Tritium' effect.",
            'Keep auto buildings on Stage reset.',
            'More toggles.'
        ],
        effectText: [
            ['Base Discharge effect is now +', '.'],
            ['Discharge goal scales slower. (-', ')'],
            ['You always have +', ' Discharge.'],
            ['Automatically Discharge upon spending upgrades or if reached next goal.'],
            ['Gain more Energy from creating Particles, +', '.'],
            ["Research for improved 'Tritium' upgrade is now better. (+", ')'],
            ['You start with auto for ', '.'],
            ['Unlock a new toggle. Also keep them on Stage reset.']
        ],
        effect: [1, 1, 1, null, 1, 0.3, 'Particles', null],
        cost: [1, 1, 2, 3, 4, 1, 2, 2],
        scaling: [1.5, 1, 3, 0, 2, 0.25, 2, 3], //Right now only 2 digits allowed past point
        max: [6, 4, 2, 1, 2, 10, 3, 1]
    }, {
        description: [
            'More Moles.',
            'Bigger Puddles.',
            'More spread.',
            'Cloud density.',
            'Automatic Vaporization.',
            'Keep auto buildings on Stage reset.',
            'Longer max offline.'
        ],
        effectText: [
            ['Mole production increased by ', 'x.'],
            ['Puddles produce ', ' times more.'],
            ['Increase max level of some researches by +', '.'],
            ['Gain more Clouds from Vaporization. (Affected by softcap)'],
            ['Automatically Vaporize when reach certain amount.'],
            ['You start with auto for ', '.'],
            ['Increase max offline time research level. Also keep them on Stage reset.']
        ],
        effect: [2, 2, 1, null, null, 'Drops', null],
        cost: [1, 2, 2, 1, 3, 2, 1],
        scaling: [0.2, 0.5, 1.5, 2, 0, 1, 1.25],
        max: [9, 6, 3, 3, 1, 5, 10]
    }, {
        description: [
            'Accretion speed increase.',
            'Intense weathering.',
            'More levels for Rank researches.',
            'Improved Satellites.',
            'Automatic Rank.',
            'Keep auto buildings on Stage reset.',
            'Automatization for Upgrades.'
        ],
        effectText: [
            ['Accretion speed is ', ' times faster. (Affected by softcap)'],
            ['All Accretion buildings that produce another buildings now do it ', ' times faster.'],
            ['Some Rank researches receive extra Max level.'],
            ['Satellites now improve all Accretion buildings.'],
            ['Automatically increase Rank when available.'],
            ['You start with auto for ', '.'],
            ['Unlock automatization for Upgrades / Researches. Also keep them on Stage reset.']
        ],
        effect: [2, 2, null, null, null, 'Cosmic dust', null],
        cost: [1, 1, 3, 5, 3, 2, 5],
        scaling: [0.75, 1.5, 1, 0, 0, 1, 1.5],
        max: [8, 4, 2, 1, 1, 4, 3]
    }, {
        description: [
            'Hotter Stars.',
            'Cheaper Stars.',
            'New Upgrade.',
            'Main giants.',
            'Remnants of past.',
            'Automatic Collapse.',
            'Keep auto buildings on Stage reset.',
            'Daily gain.'
        ],
        effectText: [
            ['All stars produce more Elements ', ' times that is.'],
            ['Stars are ', ' times cheaper.'],
            ['Unlock a new Upgrade.'],
            ['', '% of Brown dwarf will turn into Red giants now.'],
            ['Elements will be preserved through Collapse reset.'],
            ['Stars will Collapse automatically.'],
            ['You start with auto for ', '.'],
            ['You get ', ' Strange quarks per day if you export save file.\n(Can only claim full numbers)']
        ],
        effect: [1.5, 2, null, 25, null, null, 'Brown dwarfs', 1],
        cost: [1, 1, 2, 2, 5, 3, 3, 4],
        scaling: [1, 1.5, 1.5, 2, 0, 0, 1, 2.5],
        max: [8, 4, 3, 2, 1, 1, 4, 1]
    }],
    lastUpgrade: [null, 'upgrades', false], //Allows to auto update last looked upgrade description
    lastResearch: [null, 'researches', false]
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
Object.assign(player.toggles, { buildings: createArray(togglesBL, 'toggleAuto') });
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

/* Easier to change this way */
export const getUpgradeType = (type: 'upgrades' | 'researches' | 'researchesExtra', stageCur = player.stage.current) => {
    if (stageCur === 1) {
        //Stage 1 doesn't have researchesExtra
        //Strangeness isn't allowed here, because it's array of array
        return type + 'Info' as 'upgradesInfo' | 'researchesInfo';
    } else {
        return `${type}S${Math.min(stageCur, 4)}Info` as 'upgradesS2Info' | 'researchesS2Info' | 'researchesExtraS2Info';
    }
};

export const checkPlayerValues = () => {
    const { stage } = player;
    const upgradeType = getUpgradeType('upgrades') as 'upgradesS2Info';
    const researchType = getUpgradeType('researches') as 'researchesS2Info';
    const researchExtraType = getUpgradeType('researchesExtra') as 'researchesExtraS2Info';

    //No visual update, until it can happen naturally
    for (let i = 0; i < global[upgradeType].cost.length; i++) {
        if (player.upgrades[i] > 1) {
            player.upgrades[i] = 1;
            console.warn(`Upgrade (${i + 1}) had an illegal value`);
        }
    }
    if (stage.current >= 4) {
        for (let i = 1; i < global.elementsInfo.cost.length; i++) {
            if (player.elements[i] > 1) {
                player.elements[i] = 1;
                console.warn(`Element (${i}) had an illegal value`);
            }
        }
    }
    for (let i = 0; i < global[researchType].cost.length; i++) {
        if (player.researches[i] > global[researchType].max[i]) {
            player.researches[i] = global[researchType].max[i];
            console.warn(`Research (${i + 1}) had level above maxium`);
        }
    }
    if (stage.current !== 1) {
        for (let i = 0; i < global[researchExtraType].cost.length; i++) {
            if (player.researchesExtra[i] > global[researchExtraType].max[i]) {
                player.researchesExtra[i] = global[researchExtraType].max[i];
                console.warn(`Extra research (${i + 1}) had level above maxium`);
            }
        }
    }
    for (let i = 0; i < global.researchesAutoInfo.cost.length; i++) {
        if (player.researchesAuto[i] > global.researchesAutoInfo.max[i]) {
            player.researchesAuto[i] = global.researchesAutoInfo.max[i];
            console.warn(`Research (${i + 1}) for automatization had level above maxium`);
        }
    }
    if (stage.true >= 5) {
        for (let s = 0; s < global.strangenessInfo.length; s++) {
            for (let i = 0; i < global.strangenessInfo[s].cost.length; i++) {
                if (player.strangeness[s][i] > global.strangenessInfo[s].max[i]) {
                    player.strangeness[s][i] = global.strangenessInfo[s].max[i];
                    console.warn(`Strangeness research (${i + 1}) had level above maxium`);
                }
            }
        }
    }
};

export const updatePlayer = (load: playerType) => {
    const playerCheck = startValue('p') as playerType;

    //@ts-expect-error //Old save file format had player in it
    if (Object.hasOwn(load, 'player')) { load = load.player; }
    if (!Object.hasOwn(load, 'discharge')) {
        throw new ReferenceError('This save file is missing important information and is most likely not from this game');
    }

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
    const stageCur = load.stage.current;
    const upgradeType = getUpgradeType('upgrades', stageCur) as 'upgradesS2Info';
    const researchType = getUpgradeType('researches', stageCur) as 'researchesS2Info';
    const researchExtraType = getUpgradeType('researchesExtra', stageCur) as 'researchesExtraS2Info';

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
    if (stageCur !== 1) { //It's possible to put inside next one, but just want to be safe (against reference error's)
        if (global[researchExtraType].cost.length > load.researchesExtra.length) {
            for (let i = load.researchesExtra.length; i < global[researchExtraType].cost.length; i++) {
                load.researchesExtra[i] = 0;
            }
        }
    }
    if (global.researchesAutoInfo.cost.length > load.researchesAuto.length) {
        for (let i = load.researchesAuto.length; i < global.researchesAutoInfo.cost.length; i++) {
            load.researchesAuto[i] = 0;
        }
    }
    if (global.elementsInfo.cost.length > load.elements.length) {
        for (let i = load.elements.length; i < global.elementsInfo.cost.length; i++) {
            load.elements[i] = 0;
        }
    }
    for (let s = 0; s < global.strangenessInfo.length; s++) {
        if (!Array.isArray(load.strangeness[s])) {
            load.strangeness[s] = [];
        }
        for (let i = load.strangeness[s]?.length; i < global.strangenessInfo[s].cost.length; i++) {
            load.strangeness[s][i] = 0;
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
    } else { load.toggles = playerCheck.toggles; } //At some point all toggles were split

    Object.assign(player, load);
    /* Version changes (and change log's) */
    const { versionInfo } = global;
    const oldVersion = player.version;
    versionInfo.changed = false;
    versionInfo.log = 'Change log:';
    if (player.version === '0.0.0') {
        player.version = 'v0.0.1';
        versionInfo.log += `\n${player.version} - Stage 2 has properly came out; Buildings and Energy has been reset to prevent save file corruption, sorry`;
        for (let i = 1; i <= 3; i++) { player.buildings[i].true = 0; }
        player.discharge.energyCur = 0;
        player.discharge.energyMax = 0;
    }
    if (player.version === 'v0.0.1') {
        player.version = 'v0.0.2';
        versionInfo.log += `\n${player.version} - Added dynamic descriptions for upgrades, stats subtab, early Mobile device support`;
        player.stage.resets = stageCur === 2 ? 1 : 0;
    }
    if (player.version === 'v0.0.2') {
        player.version = 'v0.0.3';
        versionInfo.log += `\n${player.version} - Stage 3 is out, Stage 2 extended. Dynamic update for researches, new stats, full reset of toggles (sorry). Also max offline time is now 2 times bigger...`;
    }
    if (player.version === 'v0.0.3') {
        player.version = 'v0.0.4';
        versionInfo.log += `\n${player.version} - All Stage's are now quicker (because too many people complain, but there isn't much of a content currently...), save file size decreased, small visual changes`;
    }
    if (player.version === 'v0.0.4') {
        player.version = 'v0.0.5';
        versionInfo.log += `\n${player.version} - First part of Stage 4 is out, also small visual changes. Screen reader support updated (I forgot about it since stage 2...). Also testing new formula for making buildings and other minor stuff`;
    }
    if (player.version === 'v0.0.5') {
        player.version = 'v0.0.6';
        versionInfo.log += `\n${player.version} - Minor bug fixes, also transition for theme change fixed. Minor QoL, hotkeys, event system reworked, save file names and others`;
        player.events = stageCur === 1 && player.discharge.current > 4 ? [true] : [false];
        player.collapse.show = -1;
    }
    if (player.version === 'v0.0.6') {
        player.version = 'v0.0.7';
        versionInfo.log += `\n${player.version} - Stage 1 full rework, Stage 4 finished and early Stage 5 (it will be really slow, until next versions). Mobile device support updated. More hotkeys. Self-made buildings are now displayed outside of stat subtab`;
        if (stageCur === 4) { player.elements[26] = 0; }
        player.vaporization.input = 10;
        player.collapse.inputM = 4;
        player.collapse.inputS = 2;
        player.stage.input = 1;
    }
    if (player.version === 'v0.0.7') {
        player.version = 'v0.0.8';
        versionInfo.log += `\n${player.version} - Minor speed up to other Stage's, also new save file name options (I would recommend 'Fundamental, [stage], [date] [time]')`;
    }
    if (player.strangeness[3][7] === 0) { player.stage.export = 1; }
    if (oldVersion !== player.version) { versionInfo.changed = true; }
};
