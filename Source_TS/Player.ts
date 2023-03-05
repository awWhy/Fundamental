import Limit from './Limit';
import { getId } from './Main';
import { globalType, overlimit, playerType } from './Types';
import { format } from './Update';
console.time('Game loaded in'); //Just for fun (end is in Main.ts file)

export const player: playerType = { //Only for information that need to be saved (cannot be calculated)
    version: 'v0.1.2',
    fileName: 'Fundamental, [date] [time], [stage]',
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
        unlock: false, //Energy
        energy: 0,
        energyMax: 0,
        current: 0
    },
    vaporization: { //Stage 2
        clouds: [1, 0],
        cloudsMax: [1, 0],
        input: 10
    },
    accretion: { //Stage 3
        rank: 0
    },
    collapse: { //Stage 4, 5
        mass: 0.01235,
        massMax: 0.01235,
        elementsMax: [1, 0], //Used for Nickel (reset on Stage)
        stars: [0, 0, 0],
        show: [], //What Elements have been bought this Stage reset
        disabled: false, //Elements
        inputM: 4,
        inputS: 2
    },
    inflation: { //Stage 6
        vacuum: false
    },
    intervals: {
        main: 100,
        numbers: 100,
        visual: 1,
        autoSave: 60
    },
    time: {
        updated: Date.now(),
        started: Date.now(),
        offline: 0 //Seconds
    },
    buildings: [
        [] as unknown as [{ current: overlimit, total: overlimit, trueTotal: overlimit, highest: overlimit }, ...Array<{ true: number, current: overlimit, total: overlimit, trueTotal: overlimit, highest: overlimit }>], //Placeholder
        [ //Stage 1
            {
                current: [3, 0],
                total: [3, 0],
                trueTotal: [3, 0],
                highest: [3, 0]
            }, {
                true: 0, //How many were bought
                current: [0, 0], //On hands
                total: [0, 0], //How many were gained this reset
                trueTotal: [0, 0], //How many were gained this stage
                highest: [0, 0] //Highest 'current' that was reached in any stage
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }
        ], [ //Stage 2
            {
                current: [2.8, -3],
                total: [2.8, -3],
                trueTotal: [2.8, -3],
                highest: [2.8, -3]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }
        ], [ //Stage 3
            {
                current: [1, -19],
                total: [1, -19],
                trueTotal: [1, -19],
                highest: [1, -19]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }
        ], [ //Stage 4
            {
                current: [1, 0],
                total: [1, 0],
                trueTotal: [1, 0],
                highest: [1, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }
        ], [ //Stage 5
            {
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }, {
                true: 0,
                current: [0, 0],
                total: [0, 0],
                trueTotal: [0, 0],
                highest: [0, 0]
            }
        ]
    ],
    strange: [ //Stage 5
        {
            current: 0,
            total: 0
        }
    ],
    /* Because I'm lazy to write 50+ 0's, all empty [] auto added */
    upgrades: [],
    researches: [],
    researchesExtra: [],
    researchesAuto: [],
    ASR: [], //Auto Structures Research
    elements: [],
    strangeness: [],
    milestones: [],
    toggles: {
        normal: [], //Auto added for every element with a class 'toggle'
        /* Offline auto use[0]; Stage confirm[1]; Discharge confirm[2]; Vaporization confirm[3]; Rank confirm[4]; Collapse confirm[5]
           Hotkeys type[6] */
        buildings: [], //Class 'toggleBuilding' ([0] everywhere, is toggle all)
        auto: [], //Class 'toggleAuto'
        /* Stage[0], Discharge[1], Vaporization[2], Rank[3], Collapse[4],
           Upgrades[5], Researches[6], ResearchesExtra[7], Elements[8] */
        shop: {
            howMany: 1,
            input: 10,
            strict: true
        }
    },
    events: [false, false, false] //One time events, set in playEvent
};

export const global: globalType = { //For information that doesn't need to be saved
    tab: 'stage', //Tabs and subtabs have same name as buttons
    subtab: {
        /* Subtab format must be: [subtabName] + 'Current' */
        stageCurrent: 'Structures',
        settingsCurrent: 'Settings',
        researchCurrent: 'Researches',
        strangenessCurrent: 'Matter'
        //Starting subtab must be unlocked at same time as tab and have index 0 in proper tabList
    },
    tabList: { //Tabs and subtab must be in same order as in footer
        /* Subtabs format must be: [subtabName] + 'Subtabs' */
        tabs: ['stage', 'research', 'strangeness', 'settings', 'special'], //'special' must be last
        stageSubtabs: ['Structures', 'Advanced'],
        settingsSubtabs: ['Settings', 'Stats'],
        researchSubtabs: ['Researches', 'Elements'],
        strangenessSubtabs: ['Matter', 'Milestones']
    },
    footer: true,
    mobileDevice: false,
    screenReader: false,
    versionInfo: {
        build: false,
        changed: false
    },
    timeSpecial: {
        lastSave: 0
    },
    automatization: { //Sorted cheapest first
        autoU: [ //Upgrades
            [], //Empty
            [],
            [],
            [],
            [],
            []
        ],
        autoR: [ //Researches
            [], //Empty
            [],
            [],
            [],
            [],
            []
        ],
        autoE: [ //Researches Extra
            [], //Empty
            [],
            [],
            [],
            [],
            []
        ],
        elements: []
    },
    theme: {
        stage: 1,
        default: true
    },
    dischargeInfo: {
        energyType: [
            [],
            [0, 1, 3, 5, 10, 20],
            [0, 40, 60, 80, 100, 125, 150],
            [0, 5, 15, 30, 50, 80],
            [0, 100, 200, 300, 400, 1000],
            [0, 600, 600, 4000, 10000]
        ],
        bonus: 0,
        next: 1
    },
    vaporizationInfo: {
        effect2U1: () => (global.upgradesInfo[2].effect[1] = 1e10 / 3 ** player.strangeness[2][3]),
        effect2RE3: () => (global.researchesExtraInfo[2].effect[3] = 1 + Math.floor(Limit(player.vaporization.clouds).log(10).min([2, 0]).toNumber())),
        get: [0, 0]
    },
    accretionInfo: {
        rankU: [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 5], //Upgrades
        rankR: [1, 1, 2, 2, 3, 3, 4, 5], //Researches
        rankE: [2, 3, 4, 5, 3], //Researches Extra
        rankCost: [5.97e27, 1e-7, 1e10, 1e24, 5e29, 2.47e31, 0],
        rankName: ['Ocean world', 'Cosmic dust', 'Meteoroid', 'Asteroid', 'Planet', 'Jovian planet', 'Protostar'], //Also alt attribute
        rankImage: ['Ocean%20world.png', 'Dust.png', 'Meteoroids.png', 'Asteroid.png', 'Planet.png', 'Giant.png', 'Protostar.png']
    },
    collapseInfo: {
        unlockB: [0, 0.01235, 0.23, 10, 40, 1000], //Buildings (stage 4)
        unlockG: [0, 100, 1000, 1e5], //Buildings (stage 5)
        unlockU: [0.01235, 0.076, 1.3, 10], //Upgrades
        unlockR: [0.18, 0.3, 0.8, 1.3], //Researches
        newMass: 0,
        starCheck: [0, 0, 0],
        starEffect: [
            (post = false) => {
                global.elementsInfo.effect[6] = player.researchesExtra[4][1] >= 1 ? 2 : 1.5;

                let effect = player.collapse.stars[0] + 1;
                if (post) { effect += global.collapseInfo.starCheck[0]; }
                if (player.elements[6] === 1) { effect **= global.elementsInfo.effect[6]; }
                return effect;
            },
            (post = false) => {
                let stars = player.collapse.stars[1] + 1;
                if (post) { stars += global.collapseInfo.starCheck[1]; }
                if (player.elements[22] === 1) {
                    stars += player.collapse.stars[0];
                    if (post) { stars += global.collapseInfo.starCheck[0]; }
                }

                let effect = stars ** 0.5;
                if (player.elements[12] === 1 && stars > 10) { effect *= Math.log10(stars); }
                return effect;
            },
            (post = false) => {
                let blackHoles = player.collapse.stars[2];
                if (post) { blackHoles += global.collapseInfo.starCheck[2]; }
                if (blackHoles < 1) { return 1; }
                //let stars = blackHoles + 1;

                return (blackHoles + 1) / Math.log10(blackHoles + (player.elements[18] === 1 ? 9 : 99));
            }
        ],
        trueStars: 0
    },
    inflationInfo: {
        preonCap: [2, 13],
        dustCap: [5, 45]
    },
    intervalsId: {
        main: 0,
        numbers: 0,
        visual: 0,
        autoSave: 0
    },
    stageInfo: {
        word: ['', 'Microworld', 'Submerged', 'Accretion', 'Interstellar', 'Intergalactic', 'Void'],
        textColor: ['', 'var(--cyan-text-color)', 'var(--blue-text-color)', 'var(--gray-text-color)', 'var(--orange-text-color)', 'var(--darkorchid-text-color)', 'var(--darkviolet-text-color)'],
        buttonBackgroundColor: ['', 'mediumblue', 'blue', '#291344', '#6a3700', '#4a008f', '#2b0095'],
        buttonBorderColor: ['', 'darkcyan', '#427be1', '#404040', '#9f6700', '#8a0049', '#711bda'],
        imageBorderColor: ['', '#008b8b', '#1460a8', '#5b5b75', '#e87400', '#b324e2', '#5300c1'],
        priceName: 'Energy',
        activeAll: [1],
        maxUpgrades: [0, 10, 7, 13, 4, 3], //Up to which calculate (managed by Vacuum)
        maxResearches: [0, 6, 6, 8, 4, 2],
        maxResearchesExtra: [0, 5, 4, 5, 2, 0]
    },
    buildingsInfo: {
        maxActive: [0, 4, 6, 5, 5, 4],
        name: [
            [],
            ['Mass', 'Preons', 'Quarks', 'Particles', 'Atoms', 'Molecules'], //[2] Must be 'Quarks'
            ['Moles', 'Drops', 'Puddles', 'Ponds', 'Lakes', 'Seas', 'Oceans'],
            ['Mass', 'Cosmic dust', 'Planetesimals', 'Protoplanets', 'Satellites', 'Subsatellites'],
            ['Elements', 'Brown dwarfs', 'Main sequence', 'Red supergiants', 'Blue hypergiants', 'Quasi stars'],
            ['Stars', 'Nebulas', 'Clusters', 'Galaxies', 'Filaments']
        ],
        type: [ //'Not allowed index x', means that this index is reserved for gain calculation
            [],
            ['' as 'improves', 'producing', 'producing', 'producing', 'producing', 'producing'], //Not allowed index 6 (for 'producing')
            ['' as 'improves', 'producing', 'producing', 'improves', 'improves', 'improves', 'improves'],
            ['' as 'improves', 'producing', 'producing', 'producing', 'improves', 'improves'],
            ['' as 'improves', 'producing', 'producing', 'producing', 'producing', 'producing'],
            ['' as 'improves', 'producing', 'improves', 'improves', 'improves'] //Not allowed index 2, 3, 4 (for 'producing')
        ],
        firstCost: [],
        startCost: [
            [],
            [0, 0.005476, 6, 3, 24, 3],
            [0, 0.0028, 100, 1e7, 1e18, 1e23, 2.676e25],
            [0, 1e-19, 1e-9, 1e21, 1e17, 1e22],
            [0, 1, 1e5, 1e16, 1e31, 1e50],
            [0, 1e30, 1e40, 1e5, 100]
        ],
        increase: [
            [],
            [0, 1.4, 1.4, 1.4, 1.4, 1.4],
            [0, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2],
            [0, 1.15, 1.15, 1.15, 10, 10],
            [0, 1.4, 1.55, 1.70, 1.85, 2],
            [0, 2, 2, 1.11, 1.11]
        ],
        producing: [
            [],
            [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
            [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
            [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
            [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
            [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
        ]
    },
    strangeInfo: {
        Element28: () => {
            let effect = Limit(player.collapse.elementsMax).log(10).toNumber() - 52;
            if (player.upgrades[5][2] === 1) { effect **= 1.5; }
            return (global.elementsInfo.effect[28] = Math.floor(effect));
        },
        gain: (stage: number) => {
            let gain = 1;
            if (player.inflation.vacuum) {
                gain += 3;
                if (player.researchesExtra[2][3] >= 1) { gain += global.vaporizationInfo.effect2RE3(); }

                if (stage < 4) { stage = 4; }
            }
            if (stage >= 4) {
                if (player.elements[27] === 1) { gain += 2; }
                if (player.elements[28] === 1) { gain += global.strangeInfo.Element28(); }
            }
            if (player.strangeness[5][1] >= 1) { gain *= 2; }
            return gain;
        },
        stageBoost: [null, null, null, null, null, null]
    },
    upgradesInfo: [ //Effect is null if it can't change
        {
            description: [],
            effectText: [],
            effect: [],
            startCost: []
        }, { //Stage 1
            description: [
                'Weak force.',
                'Strong force.',
                'Bigger electrons.',
                'Stronger protons.',
                'More neutrons.',
                'Superposition. Unlock a new reset tier.',
                'Protium. Basic.',
                'Deuterium. Heavy.',
                'Tritium. Radioactive.',
                'Nuclear fusion. More Energy.'
            ],
            effectText: [
                () => 'Particles produce 5 times more Quarks.',
                () => 'Qluons now bind Quarks into Particles, which makes Particles 10 times cheaper.',
                () => `${player.inflation.vacuum ? 'Atoms' : 'Particle'} cost is 10 times cheaper.`,
                () => `${player.inflation.vacuum ? 'Atoms' : 'Particle'} produce 10 times more ${player.inflation.vacuum ? 'Particles' : 'Quarks'}.`,
                () => `${player.inflation.vacuum ? 'Molecules' : 'Atoms'} produce 5 times more ${player.inflation.vacuum ? 'Atoms' : 'Particles'}.`,
                () => `Ability to reset at any time, and if had enough Energy, then production for all Structures will also be boosted by ${format(global.upgradesInfo[1].effect[5] as number)} times.\nTotal boost from reached goals is: ${Limit(global.upgradesInfo[1].effect[5] as number).power(player.discharge.current + global.dischargeInfo.bonus).format()}.`,
                () => `Cost scaling is decreased by ${format(global.upgradesInfo[1].effect[6] as number)}.`,
                () => `Structures (only self-made one's) boost themselves by ${format(global.upgradesInfo[1].effect[7] as number)} times.`,
                () => `Molecules produce Molecules. At a reduced rate. (${Limit(global.upgradesInfo[1].effect[8] as overlimit).format()} per second)`,
                () => 'Unspent Energy boost Molecules production of themselves 1 to 1.'
            ],
            effect: [null, null, null, null, null, 4, 0.2, 1.01, 0, null],
            startCost: [32, 48, 60, 90, 150, 400, 1600, 4000, 32000, 100000]
        }, { //Stage 2
            description: [
                'Molecules to Moles. Even more Moles.',
                'Vaporization. Unlock a new reset tier.',
                'Surface tension. Bigger Puddles.',
                'Surface stress. Biggest Puddles.',
                'Stream. Spreads water around.',
                'River. Spreads even more water.',
                'Tsunami. Spreads water too fast.'
            ],
            effectText: [
                () => 'Drops will produce Moles even more for every self-made Drops.',
                () => `Gain ability to convert Drops into Clouds. (Puddles get a boost equal to Cloud amount)\nCurrent Cloud gain is (Drops / ${format(global.vaporizationInfo.effect2U1())})^${player.inflation.vacuum ? `${format(0.4)}.` : Limit(player.vaporization.clouds).moreOrEqual([1, 4]) ? `${format(0.36)}. (Softcapped)` : `${format(0.6)}.`}`,
                () => `Puddles get boost based on Moles. (Equal to Moles ^ ${format(global.upgradesInfo[2].effect[2] as number)})`,
                () => `Puddles get boost based on Drops. (Equal to Drops ^ ${format(global.upgradesInfo[2].effect[3] as number)})`,
                () => `Ponds do not produce Puddles, instead they only improve them.\nThis upgrade will create extra Puddles for every Pond. (${format(global.upgradesInfo[2].effect[4] as number)} extra Puddles per Pond)`,
                () => `Lakes now create extra Ponds. (${format(global.upgradesInfo[2].effect[5] as number)} extra Ponds per Lake)`,
                () => 'Each Sea creates 1 extra Lake.'
            ],
            effect: [null, 1e10, 0.02, 0.02, 1, 1, null],
            startCost: [10, 1e10, 1000, 10000, 2e9, 5e20, 1e28]
        }, { //Stage 3
            description: [
                'Brownian motion.',
                'Gas. New substance for Accretion.',
                'Micrometeoroid. Unlock a new Structure.',
                'Streaming instability.',
                'Gravitational field. Unlock a new Structure.',
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
                () => `Through random collisions every self-made Dust speeds up Accretion speed. (By ${format(global.upgradesInfo[3].effect[0] as number)})`,
                () => `Accretion speed is now quicker based on current Dust amount. (${Limit(global.upgradesInfo[3].effect[1] as overlimit).format()} boost)`,
                () => 'Just a small meteoroid, but it will be a good base for what to come. (Also 2x boost to Dust)',
                () => `Small bodies spontaneously concentrate into clumps. (Self-made Planetesimals boost each other by ${format(1.02)})`,
                () => 'Bodies are now massive enough to affect each other with gravity. (4x boost to Planetesimals)',
                () => 'Shattered pieces fall back together. Mass production is now even bigger. (By 3x)',
                () => 'Unlock yet another Structure.',
                () => `Core melted, Accretion speed increased. (Mass production increased by ${format(global.upgradesInfo[3].effect[7] as number)})`,
                () => 'After reaching equilibrium, Protoplanets will boost themselfs, more with each self-made one.',
                () => 'Accretion speed increased again (because of drag and escape velocity), by 2.',
                () => `Accretion speed greatly increased by ${format(global.upgradesInfo[3].effect[10] as number)}.`,
                () => 'Satellites scaling cost is now 2 times smaller.',
                () => 'Satellites effect scales better.'
            ],
            effect: [1.01, 0, null, null, null, null, null, 2, null, null, 10, null, null],
            startCost: [1e-16, 1e-13, 1e-13, 1, 1e14, 1e17, 1e22, 1e11, 1e22, 1e23, 1e9, 1e26, 1e29]
        }, { //Stage 4
            description: [
                'Gravitational collapse.',
                'Proton-proton chain.',
                'Carbon-Nitrogen-Oxygen cycle.',
                'Helium fusion.'
            ],
            effectText: [
                () => 'As fuel runs out, each star will boost production in its own special way.',
                () => `Fuse with Protium instead of Deuterium. ${player.inflation.vacuum ? 'Unlock 5 first Elements.' : 'Unlock a new Structure and something else.\n(Somewhere in Research tab)'}`,
                () => `CNO cycle is now a better source of Helium and Energy. ${player.inflation.vacuum ? 'Unlock 5 more Elements' : 'Unlock a new Structure and more of something else'}.`,
                () => 'Through Triple-alpha and then Alpha process, unlock a few more Elements.'
            ],
            effect: [null, null, null, null],
            startCost: [100, 1000, 1e9, 1e50]
        }, { //Stage 5
            description: [
                'Jeans instability.',
                'Super star cluster.',
                'Quasar'
            ],
            effectText: [
                () => `Gravitational collapse within Nebulas will increase speed for production of Stars by ${format(global.upgradesInfo[5].effect[0] as number)} times.`,
                () => `A very massive Star clusters, that will boost Stars by ${format(global.upgradesInfo[5].effect[1] as number)}.`,
                () => `Nickel Element receives super boost of ^${format(1.5)}.`
            ],
            effect: [4, 6, null],
            startCost: [1e50, 1e60, 1e100]
        }
    ],
    researchesInfo: [ //Max 2 digits after a dot
        {
            description: [],
            effectText: [],
            effect: [],
            cost: [],
            startCost: [],
            scaling: [],
            max: []
        }, { //Stage 1
            description: [
                "Effect of 'Protium' upgrade is stronger.",
                "Effect of 'Deuterium' upgrade is bigger.",
                "Effect of 'Tritium' upgrade is better.",
                'Discharge goal requirements decreased.',
                'Discharge bonus improved.',
                'Radioactive Discharge.'
            ],
            effectText: [
                () => `Cost scaling is ${format(0.01)} smaller for each level.`,
                () => `Each self-made Structure, boost each other by additional ${format(0.01)}.`,
                () => `Molecules now produce themselves ${format(global.researchesInfo[1].effect[2] as number)} times quicker.`,
                () => 'Next goal for Discharge bonus scales by -1 less.',
                () => 'Discharge is now provides 2 times bigger bonus per reached goal.',
                () => "Discharge will boost 'Tritium' upgrade for every reached goal + 1."
            ],
            effect: [null, null, 12, null, null, null],
            cost: [],
            startCost: [2500, 8000, 40000, 8000, 58000, 36000],
            scaling: [500, 4000, 6000, 38000, 0, 8000],
            max: [9, 3, 9, 2, 1, 3]
        }, { //Stage 2
            description: [
                'Better Mole production.',
                'Condensation.',
                'Stronger surface tension.',
                'Stronger surface stress.',
                'More streams.',
                'Distributary channel.'
            ],
            effectText: [
                () => 'Drops produce 3 times more Moles.',
                () => 'Through condensation bonus to Structure production is now based on total produced, instead of current amount.\nLevel 1 for Drops, level 2 for Moles.',
                () => `Surface tension upgrade is now +${format(0.02)} stronger.`,
                () => `Surface stress upgrade is now +${format(0.03)} stronger.`,
                () => 'With more streams, can have even more extra Puddles. (+1 extra Puddles per Pond)',
                () => 'Rivers can split now, that allows even more Ponds per Lake. (+1 per)'
            ],
            effect: [null, null, null, null, null, null],
            cost: [],
            startCost: [20, 1e12, 1e5, 1e6, 1e14, 1e22],
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
                () => 'Dust production is increased by 3.',
                () => `Dust particles cling to each other. (+${format(0.01)} to 'Brownian motion')`,
                () => 'Planetesimals produce more Dust. (3 times more)',
                () => 'Slow encounter velocities will result in a more efficient growth, so this research will make bodies lose more energy with each deflection. Mass production increased by 2.',
                () => 'Some Planetesimals instead of shattering form a contact binary or even trinary. Planetesimals production boosted by 5x.',
                () => `Planetesimals attract other bodies with own gravity. Planetesimals get boost to production based on unspent Mass.\n(Total boost: ${format(global.researchesInfo[3].effect[5] as number)}${player.inflation.vacuum && global.researchesInfo[3].effect[5] as number >= 4000 ? ', hardcapped' : ''})`,
                () => `'Magma Ocean' upgrade is stronger now. (${format(1.5)}x times)`,
                () => `Accretion speed for 'Pebble accretion' increased again, by ${player.inflation.vacuum ? 2 : 3}.`
            ],
            effect: [null, null, null, null, null, 0, null, null],
            cost: [],
            startCost: [1e-14, 1e-15, 1e-5, 1e5, 1e10, 1e15, 1e13, 1e12],
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
                () => `From Planetesimals to Planets, will get ${format(global.researchesInfo[4].effect[0] as number)}x boost to all Stars.`,
                () => `Each Star boost another Star. (Total to each Star is ${Limit(global.researchesInfo[4].effect[1] as overlimit).format()}x${Limit(global.researchesInfo[4].effect[1] as overlimit).moreOrEqual([1, 10]) ? ', softcapped' : ''})`,
                () => "Improve effect of 'Planetary system', as well increases its max level by +3.",
                () => 'Matter expelled from Red giants, but get 10x boost to Main-sequence stars anyway.'
            ],
            effect: [1.1, 1, null, null],
            cost: [],
            startCost: [1000, 50000, 1e8, 1e12],
            scaling: [10, 200, 1e12, 0],
            max: [3, 2, 1, 1]
        }, { //Stage 5
            description: [
                'Higher density.',
                'Type frequency.'
            ],
            effectText: [
                () => {
                    const index = Math.min(player.researches[5][0] + 2, 4);
                    return `Higher density of Nebulas, will allow them to produce higher tier of Stars, but each tier is 4 times slower than previous one. Also will boost Nebulas by 4.\nNext tier will be ${Limit(player.buildings[4][index].trueTotal).notEqual([0, 0]) ? global.buildingsInfo.name[4][index] : '(unknown)'}.`;
                },
                () => {
                    const index = Math.max(3 - player.researches[5][1], 1);
                    return `More types of Stars are found within Star cluster. Increasing effect by 3, but also boosting lower tier of Stars. (3 times less than higher one)\nNext tier will be ${Limit(player.buildings[4][index].trueTotal).notEqual([0, 0]) ? global.buildingsInfo.name[4][index] : '(unknown)'}.`;
                }
            ],
            effect: [null, null],
            cost: [],
            startCost: [1e40, 1e55],
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
            startCost: [],
            scaling: [],
            max: []
        }, {
            description: [
                'Extra strong force.',
                'Better radiation base.',
                'Accretion.',
                'Later Preons.',
                'Impulse.'
            ],
            effectText: [
                () => 'Mesons now binds Particles to form Atoms as well. Atoms are affected by strong force.',
                () => `Improve formula for Radiation, ${player.researchesExtra[1][1] < 1 ? 'logE > log2' : `log${format(global.researchesExtraInfo[1].effect[1] as number)}${player.researchesExtra[1][1] < 10 ? ` > log${format(global.researchesExtraInfo[1].effect[1] as number - 0.1)}` : ''}`}.`,
                () => 'First level is to begin the Accretion, second level is to Submerge it.\nEverything is connected. All Structures produce Energy on creation.',
                () => `Hardcap for Mass production from Preons is delayed by current Energy ^ ${format(global.researchesExtraInfo[1].effect[3] as number)}.`,
                () => `Discharge goals can now boost all Structures from Submerged, Accretion and Interstellar Stages, but at reduced base.\nCurrent base is ${format(global.researchesExtraInfo[1].effect[4] as number)}, total boost is ${Limit(global.researchesExtraInfo[1].effect[4] as number).power(player.discharge.current + global.dischargeInfo.bonus).format()}.`
            ],
            effect: [null, 2, null, 1e13, 1.04],
            cost: [],
            startCost: [12000, 42000, 24000, 46000, 200000],
            scaling: [0, 8000, 72000, 36000, 0],
            max: [1, 10, 2, 4, 1]
        }, { //Stage 2
            description: [
                'Natural Vaporization.',
                'Rain Clouds.',
                'Storm Clouds.',
                'Ocean world.'
            ],
            effectText: [
                () => 'Clouds will now use total produced Drops instead, when formed.',
                () => `Some Clouds will start pouring Drops themselves. (${player.inflation.vacuum ? `Improves Puddles by ${format(global.researchesExtraInfo[2].effect[1] as number)} in total` : `${format(global.researchesExtraInfo[2].effect[1] as number)} per second`})`,
                () => `Seas get a boost based on amount of Clouds. (Equal to ${Limit(global.researchesExtraInfo[2].effect[2] as overlimit).format()})`,
                () => `On Stage reset gain extra reward for every new digit in Clouds, as well +1. (Currently +${format(global.vaporizationInfo.effect2RE3())})\nDue to some balance issues, currenly hardcapped at +3.`
            ],
            effect: [null, 0, 0, 1],
            cost: [],
            startCost: [1e16, 1e13, 1e26, 1e10],
            scaling: [0, 100, 0, 0],
            max: [1, 4, 1, 1]
        }, { //Stage 3
            description: [
                'Rank boost.',
                'Efficient growth.',
                'Weight.',
                'Viscosity.',
                'Efficient submersion.'
            ],
            effectText: [
                () => `Dust production is increased by another ${format(global.researchesExtraInfo[3].effect[0] as number)}.`,
                () => `Accretion speed is even quicker. Multiplied by current rank. (Total boost to Dust: ${format(global.researchesExtraInfo[3].effect[1] as number)})`,
                () => "'Gravitational field' upgrade will boost Protoplanets now as well. (Only half of effect)",
                () => "'Gas' upgrade is now stronger.",
                () => `'Efficient growth' now boost Puddles as well. (Current boost is: ${format(global.researchesExtraInfo[3].effect[4] as number)})`
            ],
            effect: [0, 0, null, null, 0],
            cost: [],
            startCost: [1e-18, 1e-16, 1e26, 1e-12, 1e21],
            scaling: [10, 100, 0, 1e14, 1e5],
            max: [12, 5, 1, 2, 1]
        }, { //Stage 4
            description: [
                'Nova.',
                'White dwarfs.'
            ],
            effectText: [
                () => {
                    const index = Math.min(player.researchesExtra[4][0] + 2, 4);
                    return `${Limit(player.buildings[4][index].trueTotal).notEqual([0, 0]) ? global.buildingsInfo.name[4][index] : '(Unknown)'} Stars are now creating something new, upon collapse reset.`;
                },
                () => 'Red giants are turning into White dwarfs, this will improve effect of Carbon element.'
            ],
            effect: [null, null],
            cost: [],
            startCost: [1e6, 1e50],
            scaling: [1e12, 0],
            max: [3, 1]
        }, { //Stage 5
            description: [],
            effectText: [],
            effect: [],
            cost: [],
            startCost: [],
            scaling: [],
            max: []
        }
    ],
    researchesAutoInfo: {
        description: [
            'New toggles.',
            'Increased max offline time.',
            'Automatic upgrades.'
        ],
        effectText: [
            () => !player.inflation.vacuum && player.strange[0].total <= 0 ? 'Unlock ability to make multiple Structures at same time.' :
            /**/'First level is for making multiple Structures at same time.\nSecond level is to turn OFF/ON all auto toggles at once.\nThird level is to turn OFF/ON auto consumption of Offline storage.',
            () => `Research this to make max offline timer +${player.inflation.vacuum ? 8 : 4} hours longer.`,
            () => 'This is going to create all upgrades automatically. Each level increases highest type of upgrades to create.\n(Upgrades > Researches > Special researches)'
        ],
        cost: [],
        startCost: [2000, 1e9, 1],
        scaling: [28000, 2e4, 1e10],
        max: [1, 1, 0],
        autoStage: [1, 2, 3] //Stage to buy from
    },
    ASRInfo: { //Auto Structures Research
        cost: [0, 4000, 1e10, 1e-7, 1e6, 1],
        costRange: [ //Random scaling
            [],
            [4000, 12000, 24000, 32000, 44000],
            [1e10, 1e13, 1e16, 1e24, 1e28, 1e99],
            [1e-7, 1e10, 5e29, 2e30, 1e99],
            [1e6, 1e17, 1e28, 1e39, 1e99],
            [1, 1, 1, 1]
        ],
        max: [0, 5, 5, 4, 4, 0]
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
            () => 'Placeholder.',
            () => 'Most basic Element, increases Brown dwarf production by 2.\nAlso Main-sequence mass effect is now known - boost to all Stars.',
            () => `Fusion reaction by product, makes everything Interstellar scale ${format(0.1)} less.`,
            () => `First metal, Mass ${player.inflation.vacuum ? 'hardcap for Cosmic dust' : ''} per Brown dwarf lightly ${player.inflation.vacuum ? 'delayed' : 'increased'}.`,
            () => `Brittle earth metal, so is brittle increase to production. (${format(1.1)}x to all Stars)`,
            () => `A new color, and a new ${player.inflation.vacuum ? 'delay to Mass hardcap for Cosmic dust' : 'boost to Mass gain'} that is based on current Dwarf Stars.`,
            () => `Base for organics, boost from Red giants is now increased to the power of ${format(global.elementsInfo.effect[6] as number)}.\nRed giants effect is now known - boost to all Main-sequence stars.`,
            () => "Most abundant uncombined Element in atmosphere of some Planets, also allows to have 2 extra levels of 'Star system'.",
            () => `An oxidizing agent, that will make everything Interstellar scale even slower. (${format(0.05)} less)`,
            () => "Highly toxic and reactive, +12 to max level of 'Planetary system'.",
            () => `A noble 2x ${player.inflation.vacuum ? 'delay to Cosmic dust hardcap' : 'boost to Mass gain'}.`,
            () => "Through leaching, get 1 extra level of 'Protoplanetary disk'.",
            () => 'Stars are inside you, as well Neutrons stars strength is now increased to the decimal logarithm.\nNeutron stars effect is now known - boost to all Stars.',
            () => `Has a great affinity towards Oxygen and to decrease cost of all Stars by ${format(1e3)}.`,
            () => `Number is 14, group is 14, melts at 1414°C and so is Mass ${player.inflation.vacuum ? 'hardcap for Cosmic dust delayed' : 'gain increased'} by ${format(1.4)}.`,
            () => `One of the Fundamentals of Life and to make all of Stars ${player.inflation.vacuum ? 'delay Mass hardcap (Cosmic dust)' : 'boost Mass'}.`,
            () => "From hot area, to increase max level of 'Star system' by 1.",
            () => "Extremely reactive to extend max level of 'Planetary system', by another 27 levels.",
            () => `Less noble boost, but Black holes effect scales a little better.\nBlack holes effect is now known - ${player.inflation.vacuum ? 'delay for Preon Mass hardcap' : 'boost to Main-sequence mass gain'}.`,
            () => "Don't forget about it and get a 3x boost to all Stars.",
            () => "Get stronger with 1 extra level of 'Star system'.",
            () => `A new color and a rare bonus of ^${format(1.1)} to Mass effect.`,
            () => 'New alloy allowing Red giants to be added into effective amount of Neutron stars.',
            () => 'Catalyst for production of Elements. Black holes boost all Stars to the decimal logarithm.',
            () => `No corrosion, only ^${format(0.01)} boost to all Stars based on unspent Elements.`,
            () => "Brittle Element, but not the bonus - 1 more level in 'Star system'.",
            () => `Any further fusion will be an endothermic process. Gain 2x boost to all Stars, ${player.inflation.vacuum ? 'unlock Stage reset.' : 'but what next?\nUnlock ability to switch beetwin Stages. (Also enter a new Stage)'}`,
            () => "While new Elements won't produce much Energy, this one can create 2 extra Strange quark for this Stage reset.",
            () => `Slow to react, but gain extra Strange quarks for every new reached digit past 52 anyway.\n(+${format(global.strangeInfo.Element28())} for this Stage reset)`
        ],
        effect: [
            null, null, null, null, null, null, 1.5, null, null, null,
            null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, 0
        ],
        startCost: [ //If index 0 to be added, then it should have cost higher than last unlocked before it (or add continue for autoElements)
            1e308, 1000, 4000, 2e4, 1e5, 1e8, 1e10, 4e11, 2e13, 1e14,
            1e16, 1e20, 1e24, 1e25, 1.4e27, 1e30, 1e31, 5e31, 5e33, 1e35,
            1e36, 1e38, 2e39, 3e41, 4e42, 1e45, 1e50, 1e52, 1e55
        ]
    },
    strangenessInfo: [ //Right now only 2 digits allowed past point for scaling
        {
            description: [],
            effectText: [],
            cost: [],
            startCost: [],
            scaling: [],
            max: []
        }, { //Stage 1
            description: [
                'Stronger Discharge.',
                'Cheaper Discharge.',
                'Free Discharge.',
                'Automatic Discarge.',
                'Increased Energy.',
                "Better 'Tritium' effect.",
                'Keep auto Structures.',
                'More toggles.',
                'Strange boost.'
            ],
            effectText: [
                () => 'Base Discharge effect is now +1.',
                () => 'Discharge goal scales slower. (-1)',
                () => 'Always have +1 bonus Discharge.',
                () => 'Automatically Discharge upon creating an upgrade or reaching next goal.',
                () => `Gain more Energy from creating ${player.inflation.vacuum ? 'Preons' : 'Particles'}, +1.`,
                () => `Research for improved 'Tritium' upgrade is now better. (+${format(0.3)})`,
                () => `Start with auto for ${global.buildingsInfo.name[1][Math.min(player.strangeness[1][6] + 1, global.ASRInfo.max[1])]}.`,
                () => `Increase max level of 'New toggles'.${player.inflation.vacuum ? '' : 'Also keep them on Stage reset.'}`,
                () => 'Unspend Strange quarks will boost this stage. (Stronger radiation)'
            ],
            cost: [],
            startCost: [2, 1, 20, 40, 6, 1, 4, 8, 10],
            scaling: [4, 3, 2, 1, 2, 1.5, 2, 2.5, 1],
            max: [4, 4, 2, 1, 2, 10, 3, 1, 1]
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
                () => 'Mole production increased by 2x.',
                () => 'Puddles produce 2 times more.',
                () => 'Increase max level of some researches by +1.\nFinal level will instead unlock a new upgrade.',
                () => 'Gain more Clouds from Vaporization. (Affected by softcap)',
                () => 'Automatically Vaporize when reach certain amount.',
                () => `Start with auto for ${global.buildingsInfo.name[2][Math.min(player.strangeness[2][5] + 1, global.ASRInfo.max[5])]}.`,
                () => `Increase max offline time research level.${player.inflation.vacuum ? '' : 'Also keep them on Stage reset.'}`,
                () => !player.inflation.vacuum ? 'Max offline time is now 2 times longer. (Additive)' :
                /**/`Offline time being wasted ${format(1.5)} times less. (Additive)`,
                () => 'Unspend Strange quarks will boost this stage. (Puddle production)'
            ],
            cost: [],
            startCost: [1, 2, 4, 6, 20, 3, 1, 5, 20],
            scaling: [1.6, 2.5, 3, 3.5, 1, 2.5, 1.8, 10, 1],
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
                () => 'Accretion speed is 2 times faster. (Affected by softcap)',
                () => 'All Accretion Structures that produce another Structure now do it 2 times faster.',
                () => 'Some Rank researches receive extra Max level.\nFinal level will instead unlock a new upgrade.',
                () => 'Satellites now improve all Accretion Structures.',
                () => 'Automatically increase Rank when available.',
                () => `Start with auto for ${global.buildingsInfo.name[3][Math.min(player.strangeness[3][5] + 1, global.ASRInfo.max[3])]}.`,
                () => `Unlock automatization for Upgrades / Researches.${player.inflation.vacuum ? '' : 'Also keep them on Stage reset.'}`,
                () => 'Unspend Strange quarks will boost this stage. (Cheaper Accretion)\n(Scales slower past 800 Strange quarks)'
            ],
            cost: [],
            startCost: [1, 1, 5, 20, 30, 4, 12, 30],
            scaling: [1.46, 3, 2.5, 1, 1, 1.8, 3, 1],
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
                () => `All Stars produce ${format(1.5)} times more Elements.`,
                () => 'Stars are 2 times cheaper.',
                () => 'Unlock a new Upgrade.\nFirst one is extra good.',
                () => '25% of Brown dwarfs will turn into Red giants now.',
                () => `Elements in Research tab will be ${player.inflation.vacuum ? 'auto created' : 'preserved through Collapse reset'}.`,
                () => 'Stars will Collapse automatically.',
                () => `Start with auto for ${global.buildingsInfo.name[4][Math.min(player.strangeness[4][6] + 1, global.ASRInfo.max[4])]}.`,
                () => `Creates +${player.inflation.vacuum ? 2 : 1} Strange quarks per day, can claim only full one's only with export.`,
                () => player.inflation.vacuum ? 'Reward from Export is now at least 10% of best Stage reset.' :
                /**/'Unclaimed Strange quarks max storage is now 1 day longer.',
                () => 'Unspend Strange quarks will boost this stage. (All Stars production)'
            ],
            cost: [],
            startCost: [1, 3, 5, 5, 108, 20, 5, 4, 80, 40],
            scaling: [1.9, 2, 3, 4, 1, 1, 1.8, 1.8, 1, 1],
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
                () => player.inflation.vacuum ? 'Gain abbility to be inside multiple (not yet) at once.' :
                /**/`Gain abbility to be inside multiple Stages at once. (Next one to always be inside is ${global.stageInfo.word[Math.min(player.strangeness[5][0] + 1, global.stageInfo.word.length - 1)]})`,
                () => 'Gain 2 times more Strange quarks from Stage resets.',
                () => 'Allows to auto switch Stage, has some special settings.',
                () => "Bigger Nebulas, more matter for Accretion. 'Jeans instability' upgrade is 3 times stronger.",
                () => "'Super star cluster' is now even bigger. Effect increased by 4.",
                () => player.inflation.vacuum ? 'Unlock Intergalactic Stage.' :
                /**/'Intergalactic is no longer affected by lower Stage reset types.',
                () => 'With this, a new Structure, can be created. Second level unlocks auto for it.',
                () => "Increase current level of auto Structures. It's the only way to do it.",
                () => `Unlock${player.inflation.vacuum ? '' : ' Intergalactic'} Milestones.`
            ],
            cost: [],
            startCost: [1e10, 10, 20, 5, 10, 40, 800, 40, 20],
            scaling: [1, 1, 1, 1.9, 1.85, 1, 1.5, 2, 1],
            max: [3, 1, 1, 9, 9, 1, 2, 2, 1]
        }
    ],
    lastUpgrade: [false, -1], //One per subtab (to auto update description)
    lastResearch: [false, -1, 'researches'],
    lastElement: [false, -1],
    milestonesInfo: [
        {
            description: [],
            needText: [],
            need: [],
            rewardText: [],
            quarks: [],
            unlock: []
        }, { //Stage 1
            description: [
                'Endless Quarks.',
                'Energized.'
            ],
            needText: [
                ['Discharge with at least ', ' Quarks at once.'],
                ['Have max Energy reach ', '.']
            ],
            need: [ //Length = max
                [1e220, 1e240, 1e260, 1e280, 1e300],
                [40000, 46000, 52000, 58000]
            ],
            rewardText: [ //Only null reward, right now
                "Unknown Structure, it doesn't belong to this Universe.\nYou can view it in stats.",
                'Stars produce 4 times more Elements.'
            ],
            quarks: [
                [1, 1, 1, 1, 2],
                [1, 1, 1, 2]
            ],
            unlock: [5, 3] //Reward unlocked at (index + 1)
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
                'Unlock a new Structure.',
                "Unknown Structure, it doesn't belong to this Universe.\nYou can view it in stats."
            ],
            quarks: [
                [1, 1, 1, 2, 3],
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
                'Unlock a new Structure.',
                "Unknown Structure, it doesn't belong to this Universe.\nYou can view it in stats."
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
                [9000, 15000, 22000, 30000, 40000, 60000, 80000],
                [100, 150, 200, 250, 300]
            ],
            rewardText: [
                'Unlock a new Strangeness.',
                "Unknown Structure, it doesn't belong to this Universe.\nYou can view it in stats."
            ],
            quarks: [
                [1, 2, 3, 4, 5, 6, 8],
                [1, 2, 3, 4, 5]
            ],
            unlock: [3, 5]
        }, { //Stage 5
            description: [
                'Light in the dark.',
                'Greatest of the walls.'
            ],
            needText: [
                ['Have self-made Stars count reach at least ', '.'],
                ['Have ', ' Galaxies or more.']
            ],
            need: [
                [1200, 1400, 1600, 1800, 2000, 2200, 2400],
                [1, 2, 4, 8, 12, 16, 20, 24]
            ],
            rewardText: [
                'Intergalactic is always unlocked with Interstellar.',
                "Unknown Structure, it doesn't belong to this Universe.\nYou can view it in stats."
            ],
            quarks: [
                [5, 5, 10, 10, 20, 20, 50],
                [25, 25, 50, 50, 100, 100, 200, 0]
            ],
            unlock: [4, 8]
        }
    ]
};

//Extension for Math.log for any base
//export const logAny = (number: number, base: number) => Math.log(number) / Math.log(base);

//Not for deep copy. Actual type is any[], it's because TS is dumb
export const cloneArray = <ArrayClone extends Array<number | string | boolean | null | undefined>>(array: ArrayClone) => array.slice(0) as ArrayClone; //[...array] is better when >10000 keys

//For non deep clone use {...object} or cloneArray when possible; Allows functions inside
export const deepClone = <CloneType>(toClone: CloneType): CloneType => {
    if (typeof toClone !== 'object' || toClone === null) { return toClone; }
    const isArray = Array.isArray(toClone);

    //Just like null check (without it null will turn into {})
    //Add extra checks if they are required (toClone instanceof Date)

    const value = isArray ? [] : {} as any;
    if (isArray) { //Faster this way
        for (let i = 0; i < toClone.length; i++) { value.push(deepClone(toClone[i])); }
    } else {
        for (const check in toClone) { value[check] = deepClone(toClone[check]); }
    }

    return value;
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

for (let s = 0; s < global.buildingsInfo.startCost.length; s++) {
    global.buildingsInfo.firstCost[s] = cloneArray(global.buildingsInfo.startCost[s]);
}
global.researchesAutoInfo.cost = cloneArray(global.researchesAutoInfo.startCost);
for (const upgradeType of ['researches', 'researchesExtra', 'strangeness']) {
    const pointer = global[upgradeType + 'Info' as 'researchesInfo'];
    for (let s = 0; s < pointer.length; s++) {
        pointer[s].cost = cloneArray(pointer[s].startCost);
    }
}

Object.assign(player, {
    upgrades: [
        [],
        createArray(global.upgradesInfo[1].startCost.length, 'upgrade'),
        createArray(global.upgradesInfo[2].startCost.length, 'upgrade'),
        createArray(global.upgradesInfo[3].startCost.length, 'upgrade'),
        createArray(global.upgradesInfo[4].startCost.length, 'upgrade'),
        createArray(global.upgradesInfo[5].startCost.length, 'upgrade')
    ],
    researches: [
        [],
        createArray(global.researchesInfo[1].startCost.length, 'upgrade'),
        createArray(global.researchesInfo[2].startCost.length, 'upgrade'),
        createArray(global.researchesInfo[3].startCost.length, 'upgrade'),
        createArray(global.researchesInfo[4].startCost.length, 'upgrade'),
        createArray(global.researchesInfo[5].startCost.length, 'upgrade')
    ],
    researchesExtra: [
        [],
        createArray(global.researchesExtraInfo[1].startCost.length, 'upgrade'),
        createArray(global.researchesExtraInfo[2].startCost.length, 'upgrade'),
        createArray(global.researchesExtraInfo[3].startCost.length, 'upgrade'),
        createArray(global.researchesExtraInfo[4].startCost.length, 'upgrade'),
        createArray(global.researchesExtraInfo[5].startCost.length, 'upgrade')
    ],
    researchesAuto: createArray(global.researchesAutoInfo.startCost.length, 'upgrade'),
    ASR: createArray(global.ASRInfo.costRange.length, 'upgrade'),
    elements: createArray(global.elementsInfo.startCost.length, 'upgrade'),
    strangeness: [
        [],
        createArray(global.strangenessInfo[1].startCost.length, 'upgrade'),
        createArray(global.strangenessInfo[2].startCost.length, 'upgrade'),
        createArray(global.strangenessInfo[3].startCost.length, 'upgrade'),
        createArray(global.strangenessInfo[4].startCost.length, 'upgrade'),
        createArray(global.strangenessInfo[5].startCost.length, 'upgrade')
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
Object.assign(player.toggles, { //Done separately just in case
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

//player.example = playerStart.example; Is not allowed (if example is an array or object), instead iterate or create clone
export const playerStart = deepClone(player);

export const checkPlayerValues = () => {
    for (const s of global.stageInfo.activeAll) { //No visual update (lazy)
        const upgrades = player.upgrades[s];
        for (let i = 0; i < global.upgradesInfo[s].startCost.length; i++) {
            if (upgrades[i] > 1) {
                upgrades[i] = 1;
                console.warn(`Upgrade (${i + 1} of ${s}) had an illegal value`);
            }
        }
        const researches = player.researches[s];
        const researchesMax = global.researchesInfo[s].max;
        for (let i = 0; i < global.researchesInfo[s].startCost.length; i++) {
            if (researches[i] > researchesMax[i]) {
                researches[i] = researchesMax[i];
                console.warn(`Research (${i + 1} of ${s}) had level above maxium`);
            }
        }
        const researchesExtra = player.researchesExtra[s];
        const researchesExtraMax = global.researchesExtraInfo[s].max;
        for (let i = 0; i < global.researchesExtraInfo[s].startCost.length; i++) {
            if (researchesExtra[i] > researchesExtraMax[i]) {
                researchesExtra[i] = researchesExtraMax[i];
                console.warn(`Extra research (${i + 1} of ${s}) had level above maxium`);
            }
        }
    }
    const researchesAuto = player.researchesAuto;
    const researchesAutoMax = global.researchesAutoInfo.max;
    for (let i = 0; i < global.researchesAutoInfo.startCost.length; i++) {
        if (researchesAuto[i] > researchesAutoMax[i]) {
            researchesAuto[i] = researchesAutoMax[i];
            console.warn(`Research (${i + 1}) for automatization had level above maxium`);
        }
    } //No need to check ASR max level
    if (player.stage.true >= 4) {
        const elements = player.elements;
        for (let i = 1; i < global.elementsInfo.startCost.length; i++) {
            if (elements[i] > 1) {
                elements[i] = 1;
                console.warn(`Element (${i}) had an illegal value`);
            }
        }
    }
    if (player.stage.true >= 5) {
        for (let s = 1; s < global.strangenessInfo.length; s++) {
            const strangeness = player.strangeness[s];
            const strangenessMax = global.strangenessInfo[s].max;
            for (let i = 0; i < global.strangenessInfo[s].startCost.length; i++) {
                if (strangeness[i] > strangenessMax[i]) {
                    strangeness[i] = strangenessMax[i];
                    console.warn(`Strangeness research (${i + 1} of ${s + 1}) had level above maxium`);
                }
            }
        }
    }
};

export const updatePlayer = (load: playerType) => {
    if (Object.hasOwn(load, 'player')) { load = load['player' as keyof unknown]; } //Old save had it
    if (!Object.hasOwn(load, 'discharge')) { throw new ReferenceError('This save file is missing important information and is most likely not from this game'); }

    for (const i in playerStart) {
        if (!Object.hasOwn(load, i)) {
            if (i === 'version') {
                load.version = '0.0.0';
            } else {
                load[i as 'version'] = deepClone(playerStart[i as 'version']);
            }
        }
    }

    if (load.version !== playerStart.version) {
        if (load.version === '0.0.0') {
            load.version = 'v0.0.1';
            for (let i = 0; i <= 3; i++) { (load.buildings[i] as unknown as typeof load.buildings[1][1]).trueTotal = [0, 0]; }
            load.discharge.energy = load['energy' as 'discharge']['current' as 'energy']; //Auto deleted
            load.discharge.energyMax = load.discharge.energy;
        }
        if (load.version === 'v0.0.1') {
            load.version = 'v0.0.2';
            load.stage.resets = load.stage.current - 1;
        }
        if (load.version === 'v0.0.2') {
            load.version = 'v0.0.3';
            load.toggles = deepClone(playerStart.toggles);
        }
        if (load.version === 'v0.0.3' || load.version === 'v0.0.4' || load.version === 'v0.0.5') {
            load.version = 'v0.0.6';
            load.events = [false];
        }
        if (load.version === 'v0.0.6') {
            load.version = 'v0.0.7';
            if (load.stage.current === 4) { load.elements[26] = 0; }
            load.vaporization.input = 10;
            load.collapse.inputM = 4;
            load.collapse.inputS = 2;
            load.stage.input = 1;
        }
        if (load.version === 'v0.0.7') {
            load.version = 'v0.0.8';
            load.stage.export = 1;
        }
        if (load.version === 'v0.0.8') {
            load.version = 'v0.0.9';
            load.stage.active = Math.min(load.stage.current, 4);
            const a = load.stage.active;
            const oldB = load.buildings as unknown as typeof player.buildings[0];
            load.buildings = deepClone(playerStart.buildings);
            load.buildings[a] = oldB;
            if (load.buildings[a].length > playerStart.buildings[a].length) {
                for (let i = load.buildings[a].length; i > playerStart.buildings[a].length; i--) {
                    load.buildings[a].splice(i - 1, 1);
                }
            }
            const oldU = load.upgrades as unknown as typeof player.upgrades[0];
            load.upgrades = deepClone(playerStart.upgrades);
            load.upgrades[a] = oldU;
            const oldR = load.researches as unknown as typeof player.researches[0];
            load.researches = deepClone(playerStart.researches);
            load.researches[a] = oldR;
            if (a !== 1) {
                const oldE = load.researchesExtra as unknown as typeof player.researchesExtra[0];
                load.researchesExtra = deepClone(playerStart.researchesExtra);
                load.researchesExtra[a] = oldE;
            }
            if (load.strangeness.length < 5) { load.strangeness.unshift([]); }
            load.stage.export *= 86400;
            load.ASR[a] = load.researchesAuto.splice(1, 1)[0];
        }
        if (load.version === 'v0.0.9') {
            load.version = 'v0.1.0';
            if (load.upgrades[3].length === 12) { load.upgrades[3].splice(8, 0, 0); }
            if (load.strangeness[5] === undefined) { load.strangeness[5] = []; }
            load.strangeness[5][0] = 0;
            load.strangeness[5][1] = 0;
            if (load.strange[0]['true' as 'current'] > 24) {
                load.strange[0].total -= (load.strange[0]['true' as 'current'] - 24);
                load.strange[0]['true' as 'current'] = 24;
            }
            load.stage.active = load.stage.current;
            for (let s = 1; s < load.buildings.length; s++) {
                for (let i = 0; i < load.buildings[s].length; i++) {
                    load.buildings[s][i].highest = [0, 0];
                }
            }
            load.collapse.show = [];
            for (let i = 1; i < load.elements.length; i++) {
                if (load.elements[i] === 1) { load.collapse.show.push(i); }
            }
            load.collapse.disabled = false;
        }
        if (load.version === 'v0.1.0') {
            load.version = 'v0.1.1';
            if (Object.hasOwn(load.discharge, 'energyCur')) {
                load.discharge.energy = load.discharge['energyCur' as 'energy'];
                delete load.discharge['energyCur' as keyof unknown];
            }
            load.collapse.massMax = load.collapse.mass;
        }
        if (load.version === 'v0.1.1') {
            load.version = 'v0.1.2';
            for (let s = 1; s < load.buildings.length; s++) {
                for (let i = 0; i < load.buildings[s].length; i++) {
                    load.buildings[s][i].current = Limit(load.buildings[s][i].current).toArray();
                    load.buildings[s][i].total = Limit(load.buildings[s][i].total).toArray();
                    load.buildings[s][i].trueTotal = Limit(load.buildings[s][i].trueTotal).toArray();
                    load.buildings[s][i].highest = Limit(load.buildings[s][i].highest).toArray();
                }
            }
            load.discharge.unlock = load.stage.current === 1 && load.discharge.energy >= 9;
            load.vaporization.clouds = Limit(load.vaporization.clouds).toArray();
            load.vaporization.cloudsMax = cloneArray(load.vaporization.clouds);
            load.collapse.elementsMax = cloneArray(load.buildings[4][0].current);
            load.strange[0].current = load.strange[0]['true' as 'current'] ?? 0;
            if (load.upgrades[1].length < 10) { load.upgrades[1].unshift(0, 0); }
            delete load.vaporization['current' as keyof unknown];
            delete load.strange[0]['true' as keyof unknown];
            load.time.offline = 0;
        }

        if (load.version !== playerStart.version) {
            throw new ReferenceError('Save file version is higher than game version');
        }
        for (const i in load) {
            if (!Object.hasOwn(playerStart, i)) {
                delete load[i as keyof playerType];
            }
        }

        global.versionInfo.changed = true;
    } else { global.versionInfo.changed = false; }

    for (let s = 1; s < playerStart.buildings.length; s++) {
        if (!Array.isArray(load.buildings[s])) {
            load.buildings[s] = deepClone(playerStart.buildings[s]);
        } else if (playerStart.buildings[s].length > load.buildings[s].length) {
            for (let i = load.buildings[s].length; i < playerStart.buildings[s].length; i++) {
                load.buildings[s][i] = deepClone(playerStart.buildings[s][i]);
            }
        }
    }

    for (let s = 1; s < playerStart.upgrades.length; s++) {
        if (!Array.isArray(load.upgrades[s])) {
            load.upgrades[s] = cloneArray(playerStart.upgrades[s]);
        } else if (playerStart.upgrades[s].length > load.upgrades[s].length) {
            for (let i = load.upgrades[s].length; i < playerStart.upgrades[s].length; i++) {
                load.upgrades[s][i] = 0;
            }
        }
    }
    for (let s = 1; s < playerStart.researches.length; s++) {
        if (!Array.isArray(load.researches[s])) {
            load.researches[s] = cloneArray(playerStart.researches[s]);
        } else if (playerStart.researches[s].length > load.researches[s].length) {
            for (let i = load.researches[s].length; i < playerStart.researches[s].length; i++) {
                load.researches[s][i] = 0;
            }
        }
    }
    for (let s = 1; s < playerStart.researchesExtra.length; s++) {
        if (!Array.isArray(load.researchesExtra[s])) {
            load.researchesExtra[s] = cloneArray(playerStart.researchesExtra[s]);
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
            load.strangeness[s] = cloneArray(playerStart.strangeness[s]);
        } else if (playerStart.strangeness[s].length > load.strangeness[s].length) {
            for (let i = load.strangeness[s].length; i < playerStart.strangeness[s].length; i++) {
                load.strangeness[s][i] = 0;
            }
        }
    }
    for (let s = 0; s < playerStart.milestones.length; s++) {
        if (!Array.isArray(load.milestones[s])) {
            load.milestones[s] = cloneArray(playerStart.milestones[s]);
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
            load.toggles.buildings[s] = cloneArray(playerStart.toggles.buildings[s]);
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

    /* Fake save file data (not saved) */
    global.accretionInfo.rankCost[4] = load.stage.true < 3 || (load.stage.true === 3 && !load.events[0]) ? 0 : 5e29;
    global.collapseInfo.trueStars = load.buildings[4][1].true + load.buildings[4][2].true + load.buildings[4][3].true + load.buildings[4][4].true;

    Object.assign(player, load);
};

export const buildVersionInfo = () => {
    if (global.versionInfo.build) { return; }

    const changeVersion = (version: string) => {
        let text = '';
        switch (version) {
            case 'v0.0.1':
                text = '- Stage 2 full rework\n- Introduced automatic changelog\n- Auto Structures now auto make 1st one without waiting for 2 times the cost\n- Fixed v0.0.0 save file corruption\n\n';
                text += '- Mobile device support\n\n';
                text += '- Tritium now shows how much Molecules being produced per second\n- Upgrades auto update description';
                break;
            case 'v0.0.2':
                text = '- Added stats subtab\n- Added Stage resets into save file';
                break;
            case 'v0.0.3':
                text = '- Added new content (Stage 3)\n- Stage 2 is extended\n- Max offline time base and from research is now 2 times longer\n- Offline time is now calculated better\n- Toggles have been reset due to change in the way they are saved\n- Researches auto update description\n- Some new stats';
                break;
            case 'v0.0.4':
                text = '- Buffed all Stages\n- Added events for early Stages\n- Update to stats visuals\n- Intervals have been reset due to change in save file saving\n\n';
                text += '- Numbers are now formated\n\n';
                text += '- New stat for Stage 3';
                break;
            case 'v0.0.5':
                text = '- New content (Stage 4)\n- Basic loading screen\n- Full visual update\n- Optimization for bulk making Structures due to change in cost calculation formula\n- That also allowed to add visual indication for how many can be afforded\n\n';
                text += "- Elements now always show effect, after being created at least once\n- Improved transition when changing themes\n- Fixed being able to create Research for automatization when can't afford it (and get negative resources)\n\n";
                text += '- Added hotkeys\n- Stage event have been reset\n\n';
                text += '- Stage 1 is fixed, but rework is coming';
                break;
            case 'v0.0.6':
                text = '- List of hotkeys can be seen now\n\n';
                text += '- Option to remove text movement from footer resources\n- Abbility to rename save file';
                break;
            case 'v0.0.7':
                text = '- New content (Stage 5)\n- Stage 1 rework\nSelf-made Structures are moved into Stage tab (displayed when current is not equal self-made amount)\n- Hotkeys for Resets\n- Pressing non tab key on keyboard no longer highlights last selected button\n- Due to built in function for formating numbers being painfully slow, added self-made formating with custom settings\n\n';
                text += '- Numpad can now be used as digits for hotkeys\n\n';
                text += '- Save file name can now display in game stats';
                break;
            case 'v0.0.8':
                text = '- Minor speed up to Stages 2 to 5\n- Fixed [true] being [stage] and other way around';
                break;
            case 'v0.0.9':
                text = '- New content (Milestones)\n- Stage 4 speed up\n- Fixed export reward not being saved into exported file\n- Optimization\n- Auto Structures toggles have been reset\n\n';
                text += '- Fix being unable to start game, if playing for first time\n\n';
                text += '- Fixed F1 - F12, keyboard buttons working as digits\n- Milestones are now unlocked instanly (at Stage 5)\n- Added new event for changing Active Stage for first time (must be triggered to progress)\n\n';
                text += '- Max offline base and research is increased by 2 times, also related Strangeness cost and max level have been better balanced\n\n';
                text += '- Some Stage 3 and Stage 5 quick balance changes';
                break;
            case 'v0.1.0':
                text = '- New content and balance of old Stage 5 late content\n- New stats for Stage 5\n- Due to balance changes, Strangeness for Stage 5 and Strange quarks had been reset';
                break;
            case 'v0.1.1':
                text = '- More balance for Stage 5\n- New stats for Stage 2 and 4, max energy no longer resets\n- New hotkey for changing Active Stage';
                break;
            case 'v0.1.2':
                text = '- New content (Vacuum)\n- Some descriptions have been expanded\n- Added self-made break infinity\n- Heavy optimization\n- Offline time been reworked\n- Removed automatic change log in favor of version window\n- Removed text movement and related option from settings\n\n';
                text += '- New color theme (Stage 6 related)\n- Offline warp unlock condition is now switched with Offline storage consumption toggle\n- Offline time is being wasted less (from 9 to 6)\n- Balance changes for Stage 6\n- New stats for Stage 4\n- Other minor stuff';
        }
        getId('versionText').textContent = text;
        getId('currentVesion').textContent = version;
    };

    getId('versionInfo').innerHTML = `<div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; width: clamp(42vw, 36em, 80vw); height: clamp(26vh, 36em, 90vh); background-color: var(--window-color); border: 3px solid var(--window-border); border-radius: 12px; padding: 1em 1em 0.8em; row-gap: 1em;">
        <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 0.06em;">
            <button id="v0.0.1" style="width: 3.8em; height: 2em; font-size: 0.88em;">v0.0.1</button>
            <button id="v0.0.2" style="width: 3.8em; height: 2em; font-size: 0.88em;">v0.0.2</button>
            <button id="v0.0.3" style="width: 3.8em; height: 2em; font-size: 0.88em;">v0.0.3</button>
            <button id="v0.0.4" style="width: 3.8em; height: 2em; font-size: 0.88em;">v0.0.4</button>
            <button id="v0.0.5" style="width: 3.8em; height: 2em; font-size: 0.88em;">v0.0.5</button>
            <button id="v0.0.6" style="width: 3.8em; height: 2em; font-size: 0.88em;">v0.0.6</button>
            <button id="v0.0.7" style="width: 3.8em; height: 2em; font-size: 0.88em;">v0.0.7</button>
            <button id="v0.0.8" style="width: 3.8em; height: 2em; font-size: 0.88em;">v0.0.8</button>
            <button id="v0.0.9" style="width: 3.8em; height: 2em; font-size: 0.88em;">v0.0.9</button>
            <button id="v0.1.0" style="width: 3.8em; height: 2em; font-size: 0.88em;">v0.1.0</button>
            <button id="v0.1.1" style="width: 3.8em; height: 2em; font-size: 0.88em;">v0.1.1</button>
            <button id="v0.1.2" style="width: 3.8em; height: 2em; font-size: 0.88em;">v0.1.2</button>
        </div>
        <div style="width: 100%; overflow-y: auto;">
            <label id="currentVesion" class="bigWord"></label>
            <p id="versionText" class="whiteText" style="white-space: pre-wrap; line-height: 1.3em; margin-top: 0.4em;"></p>
        </div>
        <button id="closeVersionInfo" style="width: 6em; border-radius: 4px; font-size: 0.92em;">Close</button>
    </div>`;
    getId('closeVersionInfo').addEventListener('click', () => { getId('versionInfo').style.display = 'none'; });
    getId('v0.0.1').addEventListener('click', () => changeVersion('v0.0.1'));
    getId('v0.0.2').addEventListener('click', () => changeVersion('v0.0.2'));
    getId('v0.0.3').addEventListener('click', () => changeVersion('v0.0.3'));
    getId('v0.0.4').addEventListener('click', () => changeVersion('v0.0.4'));
    getId('v0.0.5').addEventListener('click', () => changeVersion('v0.0.5'));
    getId('v0.0.6').addEventListener('click', () => changeVersion('v0.0.6'));
    getId('v0.0.7').addEventListener('click', () => changeVersion('v0.0.7'));
    getId('v0.0.8').addEventListener('click', () => changeVersion('v0.0.8'));
    getId('v0.0.9').addEventListener('click', () => changeVersion('v0.0.9'));
    getId('v0.1.0').addEventListener('click', () => changeVersion('v0.1.0'));
    getId('v0.1.1').addEventListener('click', () => changeVersion('v0.1.1'));
    getId('v0.1.2').addEventListener('click', () => changeVersion('v0.1.2'));
    changeVersion(playerStart.version);

    global.versionInfo.build = true;
};
