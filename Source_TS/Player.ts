import { globalType, playerType } from './Types';
console.time('Game loaded in'); //Just for fun (end is in Main.ts file)

export const player: playerType = { //Only for information that need to be saved (cannot be calculated)
    version: 'v0.1.0',
    fileName: 'Fundamental, [stage], [date] [time]',
    separator: ['', '.'], //[0] every 3 numbers, [1] point
    stage: {
        true: 1,
        current: 1,
        active: 1,
        resets: 0,
        export: 86400, //Seconds
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
        show: [], //Used for showing effects and auto rebuy
        disabled: false, //Switch for auto to rebuy
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
    buildings: [ //No extra layers is allowed without changing reset logics
        [], //Placeholder
        [
            { //Quarks[0]
                current: 3,
                total: 3,
                trueTotal: 3,
                highest: 3
            },
            { //Particles[1]
                current: 0, //On hands
                true: 0, //How many were bought
                total: 0, //How many were gained this reset
                trueTotal: 0, //How many were gained this stage, can be moved elsewhere for history if something
                highest: 0 //Highest 'current' that was reached in any stage
            },
            { //Atoms[2]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //Molecules[3]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            }
        ], [
            { //[0] Stage 2
                current: 0.0028,
                total: 0.0028,
                trueTotal: 0.0028,
                highest: 0.0028
            },
            { //[1]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[2]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[3]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[4]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[5]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            }
        ], [
            { //[0] Stage 3
                current: 1e-19,
                total: 1e-19,
                trueTotal: 1e-19,
                highest: 1e-19
            },
            { //[1]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[2]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[3]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[4]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            }
        ], [
            { //[0] Stage 4
                current: 1,
                total: 1,
                trueTotal: 1,
                highest: 1
            },
            { //[1]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[2]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[3]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[4]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            }
        ],
        [
            { //[0] Stage 5
                current: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[1]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[2]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            },
            { //[3]
                current: 0,
                true: 0,
                total: 0,
                trueTotal: 0,
                highest: 0
            }
        ]
    ],
    strange: [ //Stage 5 special
        { //[0]
            true: 0, //Stage reset
            total: 0
        }
    ],
    /* Because I'm lazy to write 50+ 0's, all empty [] auto added */
    upgrades: [],
    researches: [],
    researchesExtra: [], //First appears in Stage 2
    researchesAuto: [],
    ASR: [], //Part of researchesAuto for buildings (Auto Structures Research)
    elements: [], //Stage 4 special
    strangeness: [], //Stage 5 special
    milestones: [], //Stage 5 unlock
    toggles: { //Not all toggles are here, some are saved in local storage instead (support type and font size)
        normal: [], //Auto added for every element with a class 'toggle'
        /* Offline progress[0]; Stage confirm[1]; Discharge confirm[2]; Vaporization confirm[3]; Rank confirm[4]; Collapse confirm[5]
           Hotkeys type[6] */
        buildings: [], //Class 'toggleBuilding' ([0] everywhere, is toggle all)
        auto: [], //Class 'toggleAuto'
        /* Stage[0], Discharge[1], Vaporization[2], Rank[3], Collapse[4],
           Upgrades[5], Researches[6], ResearchesExtra[7] */
        shop: {
            howMany: 1,
            input: 10,
            strict: true
        }
    },
    events: [false, false, false] //One time events, can be seen in playEvent();
};

export const global: globalType = { //For information that doesn't need to be saved
    tab: 'stage', //Tabs and subtabs have same name as buttons (for easier screen reader support)
    subtab: {
        /* Subtab format must be: [subtabName] + 'Current' */
        stageCurrent: 'Structures',
        settingsCurrent: 'Settings',
        researchCurrent: 'Researches',
        strangenessCurrent: 'Matter'
        //Starting subtab name must be unlocked at same time as tab its part of (or change switchTab() logic)
    },
    tabList: { //Tabs and subtab need to be in same order as in footer
        /* Subtabs format must be: [subtabName] + 'Subtabs' */
        tabs: ['stage', 'research', 'strangeness', 'settings', 'special'],
        stageSubtabs: ['Structures', 'Advanced'],
        settingsSubtabs: ['Settings', 'Stats'],
        researchSubtabs: ['Researches', 'Elements'],
        strangenessSubtabs: ['Matter', 'Milestones']
    },
    footer: true,
    mobileDevice: false,
    screenReader: false,
    versionInfo: {
        changed: false,
        log: 'Change log:'
    },
    timeSpecial: {
        lastSave: 0
    },
    stageInfo: {
        word: ['', 'Microworld', 'Submerged', 'Accretion', 'Interstellar', 'Intergalactic'], //Stage amount is based on lenght
        textColor: ['', 'var(--cyan-text-color)', 'var(--blue-text-color)', 'var(--gray-text-color)', 'var(--orange-text-color)', 'var(--darkorchid-text-color)'],
        buttonBackgroundColor: ['', 'mediumblue', 'blue', '#291344', '#6a3700', '#4a008f'],
        buttonBorderColor: ['', 'darkcyan', '#427be1', '#404040', '#9f6700', '#9d0054'],
        imageBorderColor: ['', '#008b8b', '#1460a8', '#5b5b75', '#e87400', '#b324e2'],
        priceName: 'Energy', //On what you buy upgrades and etc.
        activeAll: [1] //All stages that should be calculated
    },
    automatization: { //Sorted cheapest first
        autoU: [
            [], //Empty
            [],
            [],
            [],
            [],
            []
        ], //Upgrades
        autoR: [
            [], //Empty
            [],
            [],
            [],
            [],
            []
        ], //Researches
        autoE: [
            [], //Empty
            [], //Empty
            [],
            [],
            [],
            [] //Empty
        ], //Researches Extra
        elements: []
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
        rankU: [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 5], //Upgrades
        rankR: [1, 1, 2, 2, 3, 3, 4, 5], //Researches
        rankE: [2, 3, 4, 5], //Researches Extra
        rankCost: [5.97e27, 1e-7, 1e10, 1e24, 0, 0], //[4] is 5e29
        rankName: ['Ocean world', 'Cosmic dust', 'Meteoroid', 'Asteroid', 'Planet', 'Jovian planet'], //Name of rank (also alt attribute)
        rankImage: ['Ocean%20world', 'Dust', 'Meteoroids', 'Asteroid', 'Planet', 'Giant'] //Source of image (file name and .png auto added)
    },
    collapseInfo: {
        unlockB: [0, 0.01235, 0.23, 10, 40], //Buildings (stage 4)
        unlockG: [0, 100, 1000, 1e5], //Buildings (stage 5)
        unlockU: [0.01235, 0.076, 1.3, 10], //Upgrades
        unlockR: [0.18, 0.3, 0.8, 2], //Researches
        newMass: 0,
        starCheck: [0, 0, 0],
        trueStars: 0 //Stage 5 special (can be removed)
    },
    intervalsId: {
        main: 0,
        numbers: 0,
        visual: 0,
        autoSave: 0
    },
    buildingsInfo: { //stageCheck(); will automatically change name and startCost
        name: [
            [],
            ['Quarks', 'Particles', 'Atoms', 'Molecules'],
            ['Moles', 'Drops', 'Puddles', 'Ponds', 'Lakes', 'Seas'],
            ['Mass', 'Cosmic dust', 'Planetesimals', 'Protoplanets', 'Satellites'],
            ['Elements', 'Brown dwarfs', 'Main sequence', 'Red supergiants', 'Blue hypergiants'],
            ['Stars', 'Nebulas', 'Star clusters', 'Galaxies']
        ],
        type: [ //'Not allowed index x', means that this index is reserved for gain calculation (code need to be changed to allow)
            [],
            ['', 'producing', 'producing', 'producing'], //Not allowed index 4 (for 'producing')
            ['', 'producing', 'producing', 'improves', 'improves', 'improves'],
            ['', 'producing', 'producing', 'producing', 'improves'],
            ['', 'producing', 'producing', 'producing', 'producing'],
            ['', 'producing', 'improves', 'improves'] //Not allowed index 2, 3, 4 (for 'producing')
        ],
        cost: [
            [],
            [0, 3, 24, 3],
            [0, 0.0028, 100, 1e7, 1e18, 1e23],
            [0, 1e-19, 1e-9, 1e21, 1e17],
            [0, 1, 1e5, 1e16, 1e31],
            [0, 1e30, 1e40, 1e60]
        ],
        startCost: [
            [],
            [0, 3, 24, 3],
            [0, 0.0028, 100, 1e7, 1e18, 1e23],
            [0, 1e-19, 1e-9, 1e21, 1e17],
            [0, 1, 1e5, 1e16, 1e31],
            [0, 1e30, 1e40, 1e5]
        ],
        increase: [
            [],
            [0, 1.4, 1.4, 1.4],
            [0, 1.2, 1.2, 1.2, 1.2, 1.2],
            [0, 1.15, 1.15, 1.15, 10],
            [0, 1.4, 1.55, 1.70, 1.85],
            [0, 2, 2, 1.1]
        ],
        producing: [
            [],
            [0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    },
    strangeInfo: {
        stageGain: 0,
        extraGain: 0,
        stageBoost: [null, null, null, null, null, null]
    },
    HTMLSpecial: { //Have to be manually added
        longestBuilding: 6, //Including [0] with is not here
        buildingHTML: [ //No idea if it's good idea (outerHTML is 20+ times slower)
            [],
            [
                ['Particle', 'Particle'],
                ['Atom', 'Atom'],
                ['Molecule', 'Molecule']
            ],
            [
                ['Drop', 'Drop of water'],
                ['Puddle', 'Puddle'],
                ['Pond', 'Pond'],
                ['Lake', 'Lake'],
                ['Sea', 'Sea']
            ],
            [
                ['Cosmic%20dust', 'Cosmic dust'],
                ['Planetesimal', 'Planetesimal'],
                ['Protoplanet', 'Protoplanet'],
                ['Natural%20satellite', 'Moon']
            ],
            [
                ['Brown%20dwarf', 'Brown dwarf'],
                ['Orange%20dwarf', 'Orange dwarf'],
                ['Red%20supergiant', 'Red supergiant'],
                ['Blue%20hypergiant', 'Blue hypergiant']
            ],
            [
                ['Nebula', 'Nebula'],
                ['Star%20cluster', 'Star cluster'],
                ['Galaxy', 'Galaxy']
            ]
        ],
        longestUpgrade: 13,
        upgradeHTML: [
            [],
            [
                ['Upgrade1', 'Electron'],
                ['Upgrade2', 'Proton'],
                ['Upgrade3', 'Neutron'],
                ['Upgrade4', 'Superposition'],
                ['Upgrade5', 'Protium'],
                ['Upgrade6', 'Deuterium'],
                ['Upgrade7', 'Tritium'],
                ['Upgrade8', 'Fusion']
            ],
            [
                ['UpgradeW1', 'Mole'],
                ['UpgradeW2', 'Vaporization'],
                ['UpgradeW3', 'Tension'],
                ['UpgradeW4', 'Stress'],
                ['UpgradeW5', 'Stream'],
                ['UpgradeW6', 'River'],
                ['UpgradeW7', 'Tsunami']
            ],
            [
                ['UpgradeA1', 'Motion'],
                ['UpgradeA2', 'Gas'],
                ['UpgradeA3', 'Micrometeoroid'],
                ['UpgradeA4', 'Instability'],
                ['UpgradeA5', 'Gravity'],
                ['UpgradeA6', 'Pile'],
                ['UpgradeA7', 'Orbit'],
                ['UpgradeA8', 'Magma'],
                ['UpgradeA9', 'Equilibrium'],
                ['UpgradeA10', 'Atmosphere'],
                ['UpgradeA11', 'Pebble'],
                ['UpgradeA12', 'Tidal force'],
                ['UpgradeA13', 'Ring']
            ],
            [
                ['UpgradeS1', 'Collapse'],
                ['UpgradeS2', 'Reaction'],
                ['UpgradeS3', 'CNO'],
                ['UpgradeS4', 'Helium fusion']
            ],
            [
                ['UpgradeG1', 'Instability'],
                ['UpgradeG2', 'Super cluster'],
                ['UpgradeG3', 'Quasar']
            ]
        ],
        longestResearch: 8,
        researchHTML: [
            [],
            [
                ['Research1', 'Protium+', 'stage1borderImage'],
                ['Research2', 'Deuterium+', 'stage1borderImage'],
                ['Research3', 'Tritium+', 'stage1borderImage'],
                ['Research4', 'Discharge-', 'stage4borderImage'],
                ['Research5', 'Discharge+', 'stage4borderImage'],
                ['Research6', 'Discharge++', 'stage4borderImage']
            ],
            [
                ['ResearchW1', 'Moles+', 'stage2borderImage'],
                ['ResearchW2', 'Moles++', 'stage2borderImage'],
                ['ResearchW3', 'Tension+', 'stage2borderImage'],
                ['ResearchW4', 'Stress+', 'stage2borderImage'],
                ['ResearchW5', 'Streams+', 'stage2borderImage'],
                ['ResearchW6', 'Channel', 'stage2borderImage']
            ],
            [
                ['ResearchA1', 'Mass+', 'stage3borderImage'],
                ['ResearchA2', 'Adhesion', 'stage2borderImage'],
                ['ResearchA3', 'Weathering', 'stage3borderImage'],
                ['ResearchA4', 'Collision', 'stage3borderImage'],
                ['ResearchA5', 'Binary', 'stage3borderImage'],
                ['ResearchA6', 'Gravity+', 'stage1borderImage'],
                ['ResearchA7', 'Layers', 'stage7borderImage'],
                ['ResearchA8', 'Drag', 'stage1borderImage']
            ],
            [
                ['ResearchS1', 'Orbit', 'stage5borderImage'],
                ['ResearchS2', '2 stars', 'stage5borderImage'],
                ['ResearchS3', 'Protodisc', 'stage7borderImage'],
                ['ResearchS4', 'Planetary nebula', 'stage5borderImage']
            ],
            [
                ['ResearchG1', 'Density', 'stage1borderImage'],
                ['ResearchG2', 'Frequency', 'stage6borderImage']
            ]
        ],
        longestResearchExtra: 4,
        researchExtraDivHTML: [
            [],
            [],
            ['Cloud%20Researches', 'Cloud researches', 'stage2borderImage'],
            ['Rank%20Researches', 'Rank researches', 'stage6borderImage'],
            ['Star%20Researches', 'Star researches', 'stage6borderImage'],
            []
        ],
        researchExtraHTML: [
            [],
            [],
            [
                ['ResearchClouds1', 'Vaporization+', 'stage3borderImage'],
                ['ResearchClouds2', 'Rain', 'stage2borderImage'],
                ['ResearchClouds3', 'Storm', 'stage4borderImage']
            ],
            [
                ['ResearchRank1', 'Ocean', 'stage3borderImage'],
                ['ResearchRank2', 'Rank', 'stage3borderImage'],
                ['ResearchRank3', 'Weight', 'stage3borderImage'],
                ['ResearchRank4', 'Viscosity', 'stage2borderImage']
            ],
            [
                ['ResearchStar1', 'Supernova', 'stage6borderImage'],
                ['ResearchStar2', 'White dwarf', 'stage1borderImage']
            ],
            []
        ]
    },
    //Effect text = '[0]' + effect[n] + '[1]'; Unless effect[n] === null, then text = '[0]' (effect is not null only if can change)
    //Research cost, only allows 2 digits after a dot (example: 0.123 = 0.12)
    //Stage 3 / 4 need extra information in rankInfo / collapseInfo
    upgradesInfo: [
        {
            description: [],
            effectText: [],
            effect: [],
            cost: []
        },
        { //Stage 1
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
                ['Particle cost is 10 times cheaper.'],
                ['Particles produce 10 times more Quarks.'],
                ['Atoms produce 5 times more Particles.'],
                ['Ability to reset at any time, and if had enough Energy, then production for all structures will also be boosted by ', ' times.'],
                ['Cost scaling is decreased by ', '.'],
                ['Structures (only self-made one\'s) boost themselves by ', ' times.'],
                ['Molecules produce Molecules. At a reduced rate. (', ' per second)'],
                ['Unspent Energy boost Molecules production of themselves 1 to 1.']
            ],
            effect: [null, null, null, 4, 0.2, 1.01, 0, null],
            cost: [9, 12, 36, 300, 800, 2000, 8000, 30000]
        }, { //Stage 2
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
                ['Drops will produce Moles even more for every self-made Drops.\n(Self-made amount will decrease, if less than overall amount)'],
                ['Gain ability to convert Drops into Clouds. (Puddles get a boost equal to Cloud amount)'],
                ['Puddles get boost based on Moles. (Equal to Moles ^ ', ')'],
                ['Puddles get boost based on Drops. (Equal to Drops ^ ', ')'],
                ['Ponds do not produce Puddles, instead they only improve them.\nThis upgrade will create extra Puddles for every Pond. (', ' extra Puddles per Pond)'],
                ['Lakes now create extra Ponds. (', ' extra Ponds per Lake)'],
                ['Each Sea creates 1 extra Lake.']
            ],
            effect: [null, null, 0.02, 0.02, 1, 1, null],
            cost: [1e4, 1e10, 1000, 10000, 2e9, 5e20, 1e28]
        }, { //Stage 3
            description: [
                'Brownian motion.',
                'Gas. New substance for Accretion.',
                'Micrometeoroid. Unlock a new structure.',
                'Streaming instability.',
                'Gravitational field. Unlock a new structure.',
                'Rubble pile.',
                'Satellite system.',
                'Magma ocean.',
                'Hydrostatic equilibrium',
                'Atmosphere.',
                'Pebble accretion.',
                'Tidal force.',
                'Ring system.'
            ],
            effectText: [
                ['Through random collisions every self-made Dust speeds up Accretion speed. (By ', ')'],
                ['Accretion speed is now quicker based on current Dust amount. (', ' boost)'],
                ['Just a small meteoroid, but it will be a good base for what to come. (Also 2x boost to Dust)'],
                ['Small bodies spontaneously concentrate into clumps. (Self-made Planetesimals boost each other by ', ')'], //Effect here only needs format
                ['Bodies are now massive enough to affect each other with gravity. (4x boost to Planetesimals)'],
                ['Shattered pieces fall back together. Mass production is now even bigger. (By 3x)'],
                ['Unlocks yet another structure.'],
                ['Core melted, Accretion speed increased. (Mass production increased by ', ')'],
                ['After reaching equilibrium, Protoplanets will boost themselfs, more with each self-made one.'],
                ['Accretion speed increased again (because of drag and escape velocity), by 2.'],
                ['Accretion speed greatly increased by ', '.'],
                ['Satellites scaling cost is now 2 times smaller.'],
                ['Satellites effect scales better.']
            ],
            effect: [1.01, 0, null, 1.02, null, null, null, 2, null, null, 10, null, null],
            cost: [1e-16, 1e-13, 1e-13, 1, 1e14, 1e17, 1e22, 1e11, 1e22, 1e23, 1e9, 1e26, 1e29]
        }, { //Stage 4
            description: [
                'Gravitational collapse.',
                'Proton-proton chain.',
                'Carbon-Nitrogen-Oxygen cycle.',
                'Helium fusion.'
            ],
            effectText: [
                ['As fuel runs out, each star will boost production in its own special way.'],
                ['Fuse with Protium instead of Deuterium. Unlocks a new structure and something else.'],
                ['CNO cycle is now a better source of Helium and Energy. Unlocks a new structure and more of something else.'],
                ['Through Triple-alpha and then Alpha process, unlock a few more elements.']
            ],
            effect: [null, null, null, null],
            cost: [100, 1000, 1e9, 1e50]
        }, { //Stage 5
            description: [
                'Jeans instability.',
                'Super star cluster.',
                'Quasar'
            ],
            effectText: [
                ['Gravitational collapse within Nebulas will increase speed for production of Stars by ', ' times.'],
                ['A very massive Star clusters, that will boost Stars by ', '.'],
                ['Nickel Element receives super boost of ^', '.'] //Effect here only needs format
            ],
            effect: [4, 6, 1.5],
            cost: [1e50, 1e60, 1e100]
        }
    ],
    researchesInfo: [
        {
            description: [],
            effectText: [],
            effect: [],
            cost: [],
            scaling: [],
            max: []
        },
        { //Stage 1
            description: [
                "Effect of 'Protium' upgrade is stronger.",
                "Effect of 'Deuterium' upgrade is bigger.",
                "Effect of 'Tritium' upgrade is better.",
                'Discharge goal requirements decreased.',
                'Discharge bonus improved.',
                'Radioactive Discharge.'
            ],
            effectText: [
                ['Cost scaling is ', ' smaller for each level.'], //Effect here only needs format
                ['Each self-made structure, boost each other by additional ', '.'], //Effect here only needs format
                ['Molecules now produce themselves ', ' times quicker.'],
                ['Next goal for Discharge bonus scales by -1 less'],
                ['Discharge is now provides 2 times bigger bonus per reached goal.'],
                ["Discharge will boost 'Tritium' upgrade for every reached goal + 1."]
            ],
            effect: [0.01, 0.01, 12, null, null, null],
            cost: [1000, 3000, 12000, 6000, 10000, 20000],
            scaling: [500, 2000, 2000, 26000, 0, 5000],
            max: [9, 3, 9, 2, 1, 3]
        }, { //Stage 2
            description: [
                'Better Mole production.',
                'All of it, is still around.',
                'Stronger surface tension.',
                'Stronger surface stress.',
                'More streams.',
                'Distributary channel.'
            ],
            effectText: [
                ['Drops produce 3 times more Moles.'],
                ['Bonus to structures is now based on total produced, rather than on hands. Level 1 for Drops, level 2 for Moles.'],
                ['Surface tension upgrade is now +', ' stronger.'], //Effect here only needs format
                ['Surface stress upgrade is now +', ' stronger.'], //Effect here only needs format
                ['With more streams, can have even more extra Puddles. (+1 extra Puddles per Pond)'],
                ['Rivers can split now, that allows even more Ponds per Lake. (+1 per)']
            ],
            effect: [null, null, 0.02, 0.03, null, null],
            cost: [20, 1e12, 1e5, 1e6, 1e14, 1e22],
            scaling: [1.2, 1000, 1000, 10000, 1000, 100],
            max: [9, 2, 3, 3, 2, 2]
        }, { //Stage 3
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
                ['Dust production is increased by 3.'],
                ['Dust particles cling to each other. (+', " to 'Brownian motion')"], //Effect here only needs format
                ['Planetesimals produce more Dust. (3 times more)'],
                ['Slow encounter velocities will result in a more efficient growth, so this research will make bodies lose more energy with each deflection. Mass production increased by 2.'],
                ['Some Planetesimals instead of shattering form a contact binary or even trinary. Planetesimals production boosted by 5x.'],
                ['Planetesimals attract other bodies with own gravity. Planetesimals get boost to production based on unspent Mass.\n(Total boost: ', ')'],
                ["'Magma Ocean' upgrade is stronger now. (", 'x times)'], //Effect here only needs format
                ["Accretion speed for 'Pebble accretion' increased again, by 3."]
            ],
            effect: [null, 0.01, null, null, null, 0, 1.5, null],
            cost: [1e-14, 1e-15, 1e-5, 1e5, 1e10, 1e15, 1e13, 1e12],
            scaling: [11, 111, 22, 10, 100, 10, 100000, 1000],
            max: [7, 3, 9, 4, 2, 5, 3, 3]
        }, { //Stage 4
            description: [
                'Planetary system.',
                'Star system.',
                'Protoplanetary disk.',
                'Planetary nebula.'
            ],
            effectText: [
                ['From Planetesimals to Planets, will get ', 'x boost to all Stars.'],
                ['Each Star boost another Star. (Total to each Star is ', 'x)'],
                ["Improve effect of 'Planetary system', as well increases its max level by +3."],
                ['Matter expelled from Red giants, but get 10x boost to Main-sequence stars anyway.']
            ],
            effect: [1.1, 1, null, null],
            cost: [1000, 50000, 1e8, 1e12],
            scaling: [10, 200, 1e12, 0],
            max: [3, 2, 1, 1]
        }, { //Stage 5
            description: [
                'Higher density.',
                'Type frequency.'
            ],
            effectText: [
                ['Higher density of Nebulas, will allow them to produce higher tier of Stars, but each tier is 4 times slower than previous one.\nNext tier will be ', '.'],
                ['More types of Stars are found within Star cluster. Increasing effect by 3, but also boosting lower tier of Stars. (3 times less than higher one)\nNext tier will be ', '.']
            ],
            effect: ['Main sequence', 'Red supergiants'],
            cost: [1e40, 1e55],
            scaling: [1e20, 1e15],
            max: [3, 3]
        }
    ],
    researchesExtraInfo: [
        {
            description: [],
            effectText: [],
            effect: [],
            cost: [],
            scaling: [],
            max: []
        },
        {
            description: [],
            effectText: [],
            effect: [],
            cost: [],
            scaling: [],
            max: []
        },
        { //Stage 2
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
        }, { //Stage 3
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
        }, { //Stage 4
            description: [
                'At the end of Star life.',
                'White dwarfs.'
            ],
            effectText: [
                ['', ' Stars are now creating something new, upon collapse reset.'],
                ['Red giants are turning into White dwarfs, which caused Main-sequence to produce quicker. (Times square root of Red giants)']
            ],
            effect: ['Main sequence', null],
            cost: [1e6, 1e50],
            scaling: [1e12, 0],
            max: [3, 1]
        }, { //Stage 5
            description: [],
            effectText: [],
            effect: [],
            cost: [],
            scaling: [],
            max: []
        }
    ],
    researchesAutoInfo: {
        description: [
            'Make toggles.',
            'Increased max offline time.',
            'Automatic upgrades.'
        ],
        effectText: [
            ['Unlock ability to make multiple structures at same time.'],
            ['Research this to make max offline timer +4 hours longer.'],
            ['This is going to create all upgrades automatically. Each level increases highest type of upgrades to create.']
        ],
        effect: [null, null, null],
        cost: [300, 1e9, 1],
        scaling: [30000, 2e4, 1e10],
        max: [1, 1, 0],
        autoStage: [1, 2, 3] //Stage at which you can buy auto research
    },
    ASRInfo: { //Part of researchesAutoInfo for buildings (Auto Structures Research)
        cost: [0, 4000, 1e10, 1e-7, 1e6, 1],
        costRange: [ //Easier this way to make non standart scaling
            [],
            [4000, 12000, 20000],
            [1e10, 1e13, 1e16, 1e24, 1e28],
            [1e-7, 1e10, 5e29, 2e30],
            [1e6, 1e17, 1e28, 1e39],
            [1, 1, 1]
        ],
        max: [0, 3, 5, 4, 4, 0]
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
            ['Most basic element, increases Brown dwarf production by 2.'],
            ['Fusion reaction by product, makes everything scale ', ' less.'], //Effect here only needs format
            ['First metal, Mass per Brown dwarf lightly increased.'],
            ['Brittle earth metal, so is brittle increase to production. (', 'x to all Stars)'], //Effect here only needs format
            ['A new color, and a new boost to Mass gain that is based on current Dwarf Stars.'],
            ['Base for organics, boost from Red giants is now increased to the power of ', '.\nDid you knew that Red giants are boosting Main-sequence Stars?'], //Effect here only needs format
            ["Most abundant uncombined Element in atmosphere of some Planets, also allows to have 2 extra levels of 'Star system'."],
            ['An oxidizing agent, that will make everything scale even slower. (', ' less)'], //Effect here only needs format
            ["Highly toxic and reactive, +12 to max level of 'Planetary system'."],
            ['A noble 2x boost to Mass gain.'],
            ["Through leaching, get 1 extra level of 'Protoplanetary disk'."],
            ['Stars are inside you, as well Neutrons stars strength is now increased to the decimal logarithm.\nThat will make Neutron stars boost all Stars even better.'],
            ['Has a great affinity towards oxygen and to decrease cost of all Stars by ', '.'], //Effect here only needs format
            ['Number is 14, group is 14, melts at 1414°C and so is Mass gain increased by ', '.'], //Effect here only needs format
            ['One of the fundamentals of life and to make all of Stars boost Mass.'],
            ["From hot area, to increase max level of 'Star system' by 1.\nResearch softcapped past 1e10."],
            ["Extremely reactive to extend max level of 'Planetary system', by another 27 levels."],
            ['Less noble boost, but Black holes effect scales a little better.\nThat will surely increase Main-sequence mass gain.'],
            ['Don\'t forget about it and get a 3x boost to all Stars.'],
            ["Get stronger with 1 extra level of 'Star system'.\nEffect is weaker, after 5 levels."],
            ['A new color and a rare bonus of ^', ' to Mass effect.'], //Effect here only needs format
            ['New alloy allowing Red giants to be added into effective amount of Neutron stars.'],
            ['Catalyst for production of Elements. Black holes boost all Stars to the decimal logarithm.'],
            ['No corrosion, only ^', ' boost to all Stars based on unspent Elements.'], //Effect here only needs format
            ["Brittle element, but not the bonus - 1 more level in 'Star system'."],
            ['Any further fusion will be an endothermic process. Gain 2x boost to all Stars, but what next?'],
            ['While new Elements won\'t produce much Energy, this one can create 2 extra Strange quark for this Stage reset.'],
            ['Slow to react, but gain extra Strange quarks for every new digit anyway.\n(+', ' for this reset)']
        ],
        effect: [
            null, null, 0.1, null, 1.1, null, 1.5, null, 0.05, null,
            null, null, null, 1e3, 1.4, null, null, null, null, null,
            null, 1.1, null, null, 0.01, null, null, null, 0
        ],
        cost: [ //If index 0 to be added, then it should have cost higher than last unlocked before it (or add continue for autoElements)
            1e308, 1000, 4000, 2e4, 1e5, 1e8, 1e10, 4e11, 2e13, 1e14,
            1e16, 1e20, 1e24, 1e25, 1.4e27, 1e30, 1e31, 5e31, 5e33, 1e35,
            1e36, 1e38, 2e39, 3e41, 4e42, 1e45, 1e50, 1e52, 1e55
        ]
    },
    strangenessInfo: [
        {
            description: [],
            effectText: [],
            effect: [],
            cost: [],
            scaling: [],
            max: []
        },
        { //Stage 1
            description: [
                'Stronger Discharge.',
                'Cheaper Discharge.',
                'Free Discharge.',
                'Automatic Discarge.',
                'More Particle Energy.',
                "Better 'Tritium' effect.",
                'Keep auto Structures.',
                'More toggles.',
                'Strange boost.'
            ],
            effectText: [
                ['Base Discharge effect is now +1.'],
                ['Discharge goal scales slower. (-1)'],
                ['Always have +1 bonus Discharge.'],
                ['Automatically Discharge upon spending upgrades or if reached next goal.'],
                ['Gain more Energy from creating Particles, +1.'],
                ["Research for improved 'Tritium' upgrade is now better. (+", ')'], //Effect here only needs format
                ['Start with auto for ', '.'],
                ['Unlock a new toggle. Also keep them on Stage reset.'],
                ['Unspend Strange quarks will boost this stage. (Stronger radiation)']
            ],
            effect: [null, null, null, null, null, 0.3, 'Particles', null, null],
            cost: [1, 1, 2, 3, 4, 1, 2, 2, 8],
            scaling: [1.5, 1, 3, 0, 2, 0.25, 2, 3, 0], //Right now only 2 digits allowed past point
            max: [6, 4, 2, 1, 2, 10, 3, 1, 1]
        }, { //Stage 2
            description: [
                'More Moles.',
                'Bigger Puddles.',
                'More spread.',
                'Cloud density.',
                'Automatic Vaporization.',
                'Keep auto Structures.',
                'Longer max offline.',
                'Longest max offline.',
                'Strange boost.'
            ],
            effectText: [
                ['Mole production increased by 2x.'],
                ['Puddles produce 2 times more.'],
                ['Increase max level of some researches by +1.\nFinal level will instead unlock a new upgrade.'],
                ['Gain more Clouds from Vaporization. (Affected by softcap)'],
                ['Automatically Vaporize when reach certain amount.'],
                ['Start with auto for ', '.'],
                ['Increase max offline time research level. Also keep them on Stage reset.'],
                ['Max offline time is now 2 times longer. (Additive)'],
                ['Unspend Strange quarks will boost this stage. (Puddle production)']
            ],
            effect: [null, null, null, null, null, 'Drops', null, null, null],
            cost: [1, 2, 2, 1, 3, 2, 1, 8, 6],
            scaling: [0.2, 0.5, 1.5, 2, 0, 1, 1.75, 4, 0],
            max: [9, 6, 3, 3, 1, 5, 4, 2, 1]
        }, { //Stage 3
            description: [
                'Accretion speed increase.',
                'Intense weathering.',
                'More levels.',
                'Improved Satellites.',
                'Automatic Rank.',
                'Keep auto Structures.',
                'Automatization for Upgrades.',
                'Strange boost.'
            ],
            effectText: [
                ['Accretion speed is 2 times faster. (Affected by softcap)'],
                ['All Accretion structures that produce another structure now do it 2 times faster.'],
                ['Some Rank researches receive extra Max level.\nFinal level will instead unlock a new upgrade.'],
                ['Satellites now improve all Accretion structures.'],
                ['Automatically increase Rank when available.'],
                ['Start with auto for ', '.'],
                ['Unlock automatization for Upgrades / Researches. Also keep them on Stage reset.'],
                ['Unspend Strange quarks will boost this stage. (Cheaper Accretion)']
            ],
            effect: [null, null, null, null, null, 'Cosmic dust', null, null],
            cost: [1, 1, 3, 4, 3, 2, 5, 6],
            scaling: [0.75, 1.5, 2.5, 0, 0, 1, 3.5, 0],
            max: [8, 4, 3, 1, 1, 4, 3, 1]
        }, { //Stage 4
            description: [
                'Hotter Stars.',
                'Cheaper Stars.',
                'New Upgrade.',
                'Main giants.',
                'Remnants of past.',
                'Automatic Collapse.',
                'Keep auto Structures.',
                'Daily gain.',
                'Max gain.',
                'Strange boost.'
            ],
            effectText: [
                ['All Stars produce ', ' times more Elements.'], //Effect here only needs format
                ['Stars are 2 times cheaper.'],
                ['Unlock a new Upgrade.\nFirst one is extra good.'],
                ['25% of Brown dwarfs will turn into Red giants now.'],
                ['Elements will be preserved through Collapse reset.'],
                ['Stars will Collapse automatically.'],
                ['Start with auto for ', '.'],
                ['Creates +1 Strange quarks per day, can claim only full one\'s only with export.'],
                ['Unclaimed Strange quarks max storage is now 1 day longer.'],
                ['Unspend Strange quarks will boost this stage. (All Stars production)']
            ],
            effect: [1.5, null, null, null, null, null, 'Brown dwarfs', null, null, null],
            cost: [1, 1, 3, 2, 4, 3, 3, 2, 4, 8],
            scaling: [1, 1.5, 1.5, 2, 0, 0, 1, 2.5, 0, 0],
            max: [8, 4, 3, 2, 1, 1, 4, 3, 1, 1]
        }, { //Stage 5
            description: [
                'Omnipresent reality.',
                'Strange gain.',
                'Auto Stage.',
                'Bigger Nebulas.',
                'Denser Clusters.',
                'Gravitational bound.',
                'Hypercompact stellar system.',
                'Auto Structures.',
                'New Milestones.'
            ],
            effectText: [
                ['Gain abbility to be inside multiple stages at once. (Next one to always be inside is ', ')'],
                ['Gain 2 times more Strange quarks from Stage resets.'],
                ['Allows to auto switch Stage, has some special settings.'],
                ["Bigger Nebulas, more matter for Accretion. 'Jeans instability' upgrade is 3 times stronger."],
                ["'Super star cluster' is now even bigger. Effect increased by 4."],
                ['Intergalactic is no longer affected by lower Stage reset types.'],
                ['With this, a new Structure, can be created. Second level unlocks auto for it.'],
                ['Increase current level of auto Structures. It\'s the only way to do it.'],
                ['Unlock intergalactic Milestones.']
            ],
            effect: ['Microworld', null, null, null, null, null, null, null, null],
            cost: [33, 10, 100, 5, 10, 50, 1000, 75, 20],
            scaling: [33, 0, 0, 5, 10, 0, 200, 75, 0],
            max: [3, 1, 1, 9, 9, 1, 2, 2, 1]
        }
    ],
    lastUpgrade: [0, false], //Allows to auto update last looked upgrade description
    lastResearch: [0, false, 'researches'],
    lastElement: [0, false],
    milestonesInfo: [
        {
            description: [],
            needText: [],
            need: [],
            rewardText: [],
            quarks: [],
            unlock: []
        },
        { //Stage 1
            description: [
                'Endless Quarks.',
                'Energized.'
            ],
            needText: [
                ['Discharge with at least ', ' Quarks at once.'],
                ['Have max Energy reach ', '.']
            ],
            need: [ //Length = max
                [1e220, 1e240, 1e260, 1e280, 1e308],
                [40000, 46000, 52000, 58000]
            ],
            rewardText: [ //Only null reward, right now
                'Unknown structure, it doesn\'t belong to this Universe.\nYou can view it in stats.',
                'Stars produce 1.5 times more Elements.'
            ],
            quarks: [ //How many Strange quarks will get
                [1, 1, 1, 1, 2],
                [1, 1, 1, 2]
            ],
            unlock: [5, 3] //When extra reward is unlocked (index + 1)
        }, { //Stage 2
            description: [
                'A Nebula of Drops.',
                'Just a bigger Puddle.'
            ],
            needText: [
                ['Vaporize ', ' Drops at once.'],
                ['Have at least ', ' Puddles at same time.']
            ],
            need: [
                [1e30, 1e35, 1e40, 1e45, 1e50],
                [3000, 5000, 9000, 18000]
            ],
            rewardText: [
                'Unlock a new building.',
                'Unknown structure, it doesn\'t belong to this Universe.\nYou can view it in stats.'
            ],
            quarks: [
                [1, 1, 1, 1, 2],
                [1, 2, 2, 3]
            ],
            unlock: [3, 4]
        }, { //Stage 3
            description: [
                'Cluster of Mass.',
                'Satellites of Satellites.'
            ],
            needText: [
                ['Have at least ', ' Mass at once.'],
                ['Have more Satellites than ', '.']
            ],
            need: [
                [1e30, 1e35, 1e40, 1e46, 1e52, 1e58],
                [25, 40, 55, 70, 85]
            ],
            rewardText: [
                'Unlock a new building.',
                'Unknown structure, it doesn\'t belong to this Universe.\nYou can view it in stats.'
            ],
            quarks: [
                [1, 1, 1, 2, 2, 3],
                [1, 2, 2, 3, 3]
            ],
            unlock: [3, 5]
        }, { //Stage 4
            description: [
                'Just more Mass.',
                'Biggest of all.'
            ],
            needText: [
                ['Collapse to at least ', ' Main-sequence mass.'],
                ['Collapse to ', ' Black holes or more.']
            ],
            need: [
                [9000, 15000, 22000, 30000, 40000, 60000, 100000],
                [100, 150, 200, 250, 300]
            ],
            rewardText: [
                'Unlock a new Strangeness.',
                'Unknown structure, it doesn\'t belong to this Universe.\nYou can view it in stats.'
            ],
            quarks: [
                [1, 2, 3, 4, 5, 6, 10],
                [1, 2, 3, 4, 5]
            ],
            unlock: [3, 5]
        }, {
            description: [
                'Light in the dark.',
                'Greatest of the walls.'
            ],
            needText: [
                ['Have self-made Stars count reach at least ', '.'],
                ['Have ', ' Galaxies or more.']
            ],
            need: [
                [1000, 1200, 1400, 1600, 1800, 2000, 2500],
                [1, 2, 5, 10, 15, 20, 25]
            ],
            rewardText: [
                'Intergalactic is always unlocked with Interstellar.',
                'Unknown structure, it doesn\'t belong to this Universe.\nYou can view it in stats.'
            ],
            quarks: [
                [10, 10, 20, 20, 20, 50, 100],
                [100, 100, 200, 400, 400, 1000, 1000]
            ],
            unlock: [4, 7]
        }
    ]
};

const createArray = (amount: number, special: 'toggle' | 'toggleAuto' | 'upgrade') => {
    const array = [];
    for (let i = 0; i < amount; i++) {
        if (special === 'toggle') {
            array.push(true);
        } else if (special === 'toggleAuto') {
            array.push(false);
        } else if (special === 'upgrade') {
            array.push(0);
        }
    }
    return array;
};

Object.assign(player, {
    upgrades: [
        [],
        createArray(global.upgradesInfo[1].cost.length, 'upgrade'),
        createArray(global.upgradesInfo[2].cost.length, 'upgrade'),
        createArray(global.upgradesInfo[3].cost.length, 'upgrade'),
        createArray(global.upgradesInfo[4].cost.length, 'upgrade'),
        createArray(global.upgradesInfo[5].cost.length, 'upgrade')
    ],
    researches: [
        [],
        createArray(global.researchesInfo[1].cost.length, 'upgrade'),
        createArray(global.researchesInfo[2].cost.length, 'upgrade'),
        createArray(global.researchesInfo[3].cost.length, 'upgrade'),
        createArray(global.researchesInfo[4].cost.length, 'upgrade'),
        createArray(global.researchesInfo[5].cost.length, 'upgrade')
    ],
    researchesExtra: [
        [],
        [],
        createArray(global.researchesExtraInfo[2].cost.length, 'upgrade'),
        createArray(global.researchesExtraInfo[3].cost.length, 'upgrade'),
        createArray(global.researchesExtraInfo[4].cost.length, 'upgrade'),
        createArray(global.researchesExtraInfo[5].cost.length, 'upgrade')
    ],
    researchesAuto: createArray(global.researchesAutoInfo.cost.length, 'upgrade'),
    ASR: createArray(global.ASRInfo.cost.length, 'upgrade'),
    elements: createArray(global.elementsInfo.cost.length, 'upgrade'),
    strangeness: [
        [],
        createArray(global.strangenessInfo[1].cost.length, 'upgrade'),
        createArray(global.strangenessInfo[2].cost.length, 'upgrade'),
        createArray(global.strangenessInfo[3].cost.length, 'upgrade'),
        createArray(global.strangenessInfo[4].cost.length, 'upgrade'),
        createArray(global.strangenessInfo[5].cost.length, 'upgrade')
    ],
    milestones: [
        [],
        createArray(global.milestonesInfo[1].need.length, 'upgrade'),
        createArray(global.milestonesInfo[2].need.length, 'upgrade'),
        createArray(global.milestonesInfo[3].need.length, 'upgrade'),
        createArray(global.milestonesInfo[4].need.length, 'upgrade'),
        createArray(global.milestonesInfo[5].need.length, 'upgrade')
    ]
});
Object.assign(player.toggles, { //To prevent properties from being removed, it will be done separatly
    normal: createArray(document.getElementsByClassName('toggle').length, 'toggle'),
    buildings: [
        [],
        createArray(player.buildings[1].length, 'toggleAuto'),
        createArray(player.buildings[2].length, 'toggleAuto'),
        createArray(player.buildings[3].length, 'toggleAuto'),
        createArray(player.buildings[4].length, 'toggleAuto'),
        createArray(player.buildings[5].length, 'toggleAuto')
    ],
    auto: createArray(document.getElementsByClassName('toggleAuto').length, 'toggleAuto')
});

//player.example = playerStart.example; not allowed, instead iterate or create clone
export const playerStart = structuredClone(player) as playerType;
export const globalStart = structuredClone(global) as globalType;

export const checkPlayerValues = () => {
    const { stageInfo } = global;

    //No visual update
    for (const s of stageInfo.activeAll) {
        for (let i = 0; i < global.upgradesInfo[s].cost.length; i++) {
            if (player.upgrades[s][i] > 1) {
                player.upgrades[s][i] = 1;
                console.warn(`Upgrade (${i + 1} of ${s}) had an illegal value`);
            }
        }
        for (let i = 0; i < global.researchesInfo[s].cost.length; i++) {
            if (player.researches[s][i] > global.researchesInfo[s].max[i]) {
                player.researches[s][i] = global.researchesInfo[s].max[i];
                console.warn(`Research (${i + 1} of ${s}) had level above maxium`);
            }
        }
        if (s === 1) { continue; }
        for (let i = 0; i < global.researchesExtraInfo[s].cost.length; i++) {
            if (player.researchesExtra[s][i] > global.researchesExtraInfo[s].max[i]) {
                player.researchesExtra[s][i] = global.researchesExtraInfo[s].max[i];
                console.warn(`Extra research (${i + 1} of ${s}) had level above maxium`);
            }
        }
    }
    for (let i = 0; i < global.researchesAutoInfo.cost.length; i++) {
        if (player.researchesAuto[i] > global.researchesAutoInfo.max[i]) {
            player.researchesAuto[i] = global.researchesAutoInfo.max[i];
            console.warn(`Research (${i + 1}) for automatization had level above maxium`);
        }
    } //No need to check ASR max level
    if (player.stage.true >= 4) {
        for (let i = 1; i < global.elementsInfo.cost.length; i++) {
            if (player.elements[i] > 1) {
                player.elements[i] = 1;
                console.warn(`Element (${i}) had an illegal value`);
            }
        }
    }
    if (player.stage.true >= 5) {
        for (let s = 1; s < global.strangenessInfo.length; s++) {
            for (let i = 0; i < global.strangenessInfo[s].cost.length; i++) {
                if (player.strangeness[s][i] > global.strangenessInfo[s].max[i]) {
                    player.strangeness[s][i] = global.strangenessInfo[s].max[i];
                    console.warn(`Strangeness research (${i + 1} of ${s + 1}) had level above maxium`);
                }
            }
        }
    }
};

export const updatePlayer = (load: playerType) => {
    if (Object.hasOwn(load, 'player')) { load = load['player' as keyof unknown]; } //Old save had it

    if (!Object.hasOwn(load, 'discharge')) {
        throw new ReferenceError('This save file is missing important information and is most likely not from this game');
    }

    const check = structuredClone(playerStart) as playerType; //Reference issues
    for (const i in playerStart) { //This should auto add missing information
        if (!Object.hasOwn(load, i)) {
            if (i === 'version') {
                load.version = '0.0.0';
            } else {
                load[i as 'version'] = check[i as 'version']; //No words
            }
        }
    }
    for (const i in load) { //This should remove old save file's object properties
        if (!Object.hasOwn(playerStart, i)) {
            delete load[i as keyof playerType];
        }
    }

    /* Version changes (and change log's) */
    if (load.version !== playerStart.version) {
        const { versionInfo } = global;
        versionInfo.log = 'Change log:';

        if (load.version === '0.0.0') {
            load.version = 'v0.0.1';
            versionInfo.log += `\n${load.version} - Stage 2 has properly came out; Structures and Energy has been reset to prevent save file corruption, sorry`;
            for (let i = 1; i <= 3; i++) { (load.buildings[i] as unknown as typeof load.buildings[1][1]).true = 0; }
            load.discharge.energyCur = 0;
            load.discharge.energyMax = 0;
        }
        if (load.version === 'v0.0.1') {
            load.version = 'v0.0.2';
            versionInfo.log += `\n${load.version} - Added dynamic descriptions for upgrades, stats subtab, early Mobile device support`;
            load.stage.resets = load.stage.current === 2 ? 1 : 0;
        }
        if (load.version === 'v0.0.2') {
            load.version = 'v0.0.3';
            versionInfo.log += `\n${load.version} - Stage 3 is out, Stage 2 extended. Dynamic update for researches, new stats, full reset of toggles (sorry). Also max offline time is now 2 times bigger...`;
            load.toggles = check.toggles;
        }
        if (load.version === 'v0.0.3') {
            load.version = 'v0.0.4';
            versionInfo.log += `\n${load.version} - All Stage's are now quicker (because too many people complain, but there isn't much of a content currently...), save file size decreased, small visual changes`;
        }
        if (load.version === 'v0.0.4') {
            load.version = 'v0.0.5';
            versionInfo.log += `\n${load.version} - First part of Stage 4 is out, also small visual changes. Screen reader support updated (I forgot about it since stage 2...). Also testing new formula for making structures and other minor stuff`;
        }
        if (load.version === 'v0.0.5') {
            load.version = 'v0.0.6';
            versionInfo.log += `\n${load.version} - Minor bug fixes, also transition for theme change fixed. Minor QoL, hotkeys, event system reworked, save file names and others`;
            load.events = [false];
        }
        if (load.version === 'v0.0.6') {
            load.version = 'v0.0.7';
            versionInfo.log += `\n${load.version} - Stage 1 full rework, Stage 4 finished and early Stage 5 (it will be really slow, until next versions). Mobile device support updated. More hotkeys. Self-made structures are now displayed outside of stat subtab`;
            if (load.stage.current === 4) { load.elements[26] = 0; }
            load.vaporization.input = 10;
            load.collapse.inputM = 4;
            load.collapse.inputS = 2;
            load.stage.input = 1;
        }
        if (load.version === 'v0.0.7') {
            load.version = 'v0.0.8';
            versionInfo.log += `\n${load.version} - Minor speed up to other Stage's, also new save file name options (I would recommend 'Fundamental, [stage], [date] [time]')`;
        }
        if (load.version === 'v0.0.8') {
            load.version = 'v0.0.9';
            versionInfo.log += `\n${load.version} - Stage 4 and 5 speed up, second part of Stage 5. Auto toggles reset. Some inside logic changes, also save file size increased... This version might be buggy`;
            load.stage.active = Math.min(load.stage.current, 4);
            const a = load.stage.active;
            const oldB = load.buildings as unknown as typeof player.buildings[0];
            load.buildings = check.buildings;
            load.buildings[a] = oldB;
            if (load.buildings[a].length > playerStart.buildings[a].length) {
                for (let i = load.buildings[a].length; i > playerStart.buildings[a].length; i--) {
                    load.buildings[a].splice(i - 1, 1); //Just saves some save file space
                }
            }
            const oldU = load.upgrades as unknown as typeof player.upgrades[0];
            load.upgrades = check.upgrades;
            load.upgrades[a] = oldU;
            const oldR = load.researches as unknown as typeof player.researches[0];
            load.researches = check.researches;
            load.researches[a] = oldR;
            if (a !== 1) {
                const oldE = load.researchesExtra as unknown as typeof player.researchesExtra[0];
                load.researchesExtra = check.researchesExtra;
                load.researchesExtra[a] = oldE;
            }
            if (load.strangeness.length < 5) { load.strangeness.unshift([]); }
            if (load.stage.export === undefined) {
                load.stage.export = 86400;
            } else {
                load.stage.export *= 86400;
            }
            load.ASR[a] = load.researchesAuto.splice(1, 1)[0];
        }
        if (load.version === 'v0.0.9') {
            load.version = 'v0.1.0';
            versionInfo.log += `\n${load.version} - Stage 5 finished. As well some small bug fixes\\optimizations\\balances. More in a Discord. Due to balance some endgame upgrades/resources were reset`;
            if (load.upgrades[3].length === 12) { load.upgrades[3].splice(8, 0, 0); }
            if (load.strangeness[5][0] > 0) {
                load.strangeness[5][0] = 0;
                load.strange[0].true += 3;
            }
            if (load.strangeness[5][1] > 0) {
                load.strangeness[5][1] = 0;
                load.strange[0].true += 24;
                load.stage.active = load.stage.current;
            }
            if (load.strange[0].true > 33) {
                load.strange[0].total -= (load.strange[0].true - 33);
                load.strange[0].true = 33;
            }
            for (let s = 1; s < load.buildings.length; s++) {
                for (let i = 0; i < load.buildings[s].length; i++) {
                    load.buildings[s][i].highest = load.buildings[s][i].current;
                }
            }
            load.collapse.show = [];
            for (let i = 1; i < load.elements.length; i++) {
                if (load.elements[i] === 1) { load.collapse.show.push(i); }
            }
            load.collapse.disabled = false;
        }

        if (load.version !== playerStart.version) {
            throw new ReferenceError('Save file version is higher than game version');
        }
        versionInfo.changed = true;
    } else { global.versionInfo.changed = false; }

    /* Next one's will auto add missing part of already existing information */
    for (let s = 1; s < playerStart.buildings.length; s++) {
        if (!Array.isArray(load.buildings[s])) {
            load.buildings[s] = check.buildings[s];
        } else if (playerStart.buildings[s].length > load.buildings[s].length) {
            for (let i = load.buildings[s].length; i < playerStart.buildings[s].length; i++) {
                load.buildings[s][i] = { ...playerStart.buildings[s][i] };
            }
        }
    }

    for (let s = 1; s < playerStart.upgrades.length; s++) {
        if (!Array.isArray(load.upgrades[s])) {
            load.upgrades[s] = check.upgrades[s];
        } else if (playerStart.upgrades[s].length > load.upgrades[s].length) {
            for (let i = load.upgrades[s].length; i < playerStart.upgrades[s].length; i++) {
                load.upgrades[s][i] = 0;
            }
        }
    }
    for (let s = 1; s < playerStart.researches.length; s++) {
        if (!Array.isArray(load.researches[s])) {
            load.researches[s] = check.researches[s];
        } else if (playerStart.researches[s].length > load.researches[s].length) {
            for (let i = load.researches[s].length; i < playerStart.researches[s].length; i++) {
                load.researches[s][i] = 0;
            }
        }
    }
    for (let s = 2; s < playerStart.researchesExtra.length; s++) {
        if (!Array.isArray(load.researchesExtra[s])) {
            load.researchesExtra[s] = check.researchesExtra[s];
        } else if (playerStart.researchesExtra[s].length > load.researchesExtra[s].length) {
            for (let i = load.researchesExtra[s].length; i < playerStart.researchesExtra[s].length; i++) {
                load.researchesExtra[s][i] = 0;
            }
        }
    }
    if (playerStart.researchesAuto.length > load.researchesAuto.length) {
        for (let i = load.researchesAuto.length; i < playerStart.researchesAuto.length; i++) {
            load.researchesAuto[i] = 0;
        }
    }
    if (playerStart.ASR.length > load.ASR.length) {
        for (let i = load.ASR.length; i < playerStart.ASR.length; i++) {
            load.ASR[i] = 0;
        }
    }
    if (playerStart.elements.length > load.elements.length) {
        for (let i = load.elements.length; i < playerStart.elements.length; i++) {
            load.elements[i] = 0;
        }
    }
    for (let s = 0; s < playerStart.strangeness.length; s++) {
        if (!Array.isArray(load.strangeness[s])) {
            load.strangeness[s] = check.strangeness[s];
        } else if (playerStart.strangeness[s].length > load.strangeness[s].length) {
            for (let i = load.strangeness[s].length; i < playerStart.strangeness[s].length; i++) {
                load.strangeness[s][i] = 0;
            }
        }
    }
    for (let s = 0; s < playerStart.milestones.length; s++) {
        if (!Array.isArray(load.milestones[s])) {
            load.milestones[s] = check.milestones[s];
        } else if (playerStart.milestones[s].length > load.milestones[s].length) {
            for (let i = load.milestones[s].length; i < playerStart.milestones[s].length; i++) {
                load.milestones[s][i] = 0;
            }
        }
    }

    if (playerStart.toggles.normal.length > load.toggles.normal.length) {
        for (let i = load.toggles.normal.length; i < playerStart.toggles.normal.length; i++) {
            load.toggles.normal[i] = playerStart.toggles.normal[i];
        }
    }
    for (let s = 1; s < playerStart.toggles.buildings.length; s++) {
        if (!Array.isArray(load.toggles.buildings[s])) {
            load.toggles.buildings[s] = check.toggles.buildings[s];
        } else if (playerStart.toggles.buildings[s].length > load.toggles.buildings[s].length) {
            for (let i = load.toggles.buildings[s].length; i < playerStart.toggles.buildings[s].length; i++) {
                load.toggles.buildings[s][i] = false;
            }
        }
    }
    if (playerStart.toggles.auto.length > load.toggles.auto.length) {
        for (let i = load.toggles.auto.length; i < playerStart.toggles.auto.length; i++) {
            load.toggles.auto[i] = false;
        }
    }

    if (playerStart.events.length > load.events.length) {
        for (let i = load.events.length; i < playerStart.events.length; i++) {
            load.events[i] = false;
        }
    }

    Object.assign(player, load);
};
