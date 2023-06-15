import Limit from './Limit';
import { getId } from './Main';
import { notify } from './Special';
import { assignNewMassCap, calculateMaxLevel, calculateMilestoneInformation } from './Stage';
import { globalType, overlimit, playerType } from './Types';
import { format, visualUpdateResearches } from './Update';
import { prepareVacuum } from './Vacuum';
console.time('Game loaded in'); //Just for fun (end is in Main.ts file)

export const player: playerType = { //Only for information that need to be saved (cannot be calculated)
    version: 'v0.1.5',
    fileName: 'Fundamental, [date] [time], [stage]',
    separator: ['', '.'], //[0] separator, [1] point
    stage: {
        true: 1,
        current: 1,
        active: 1,
        resets: 0,
        export: 86400,
        best: 0,
        time: 0,
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
        rank: 0,
        input: 600
    },
    collapse: { //Stage 4, 5
        mass: 0.01235,
        massMax: 0.01235,
        elementsMax: [1, 0],
        stars: [0, 0, 0],
        show: [],
        input: [4, 2]
    },
    inflation: { //Stage 6
        vacuum: false,
        age: 0
    },
    intervals: {
        main: 20,
        numbers: 100,
        visual: 1,
        autoSave: 60
    },
    time: {
        updated: Date.now(),
        started: Date.now(),
        offline: 0,
        disabled: 0
    },
    buildings: [
        [] as unknown as playerType['buildings'][0], [ //Stage 1
            {
                current: [3, 0],
                total: [3, 0],
                trueTotal: [3, 0],
                highest: [3, 0]
            }, {
                true: 0, //Bought
                current: [0, 0], //On hands
                total: [0, 0], //This reset
                trueTotal: [0, 0], //This stage
                highest: [0, 0] //Highest 'current' in any stage
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
           Hotkeys type[6]; Elements as tab[7] */
        buildings: [], //Class 'toggleBuilding' ([0] everywhere, is toggle all)
        auto: [], //Class 'toggleAuto'
        /* Stage[0], Discharge[1], Vaporization[2], Rank[3], Collapse[4],
           Upgrades[5], Researches[6], ResearchesExtra[7], Elements[8] */
        shop: {
            howMany: 1,
            input: 10
        }
    },
    history: {
        stage: {
            best: [0, 1],
            list: [],
            input: [5, 10]
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
        tabs: ['stage', 'research', 'strangeness', 'settings'],
        stageSubtabs: ['Structures', 'Advanced'],
        settingsSubtabs: ['Settings', 'History', 'Stats'],
        researchSubtabs: ['Researches', 'Elements'],
        strangenessSubtabs: ['Matter', 'Milestones']
    },
    lastActive: null,
    versionBuild: false,
    lastSave: 0,
    timeMode: true,
    footer: true,
    mobileDevice: false,
    screenReader: [false, true], //[0] Enabled; No tabindex [1] on bought upgrades, [2] on main buttons
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
        getEnergy: (index: number, stageIndex: number) => {
            let value = global.dischargeInfo.energyType[stageIndex][index];
            if (stageIndex === 1 && index === 1) { value += player.strangeness[1][4] * (player.inflation.vacuum ? 2 : 1); }
            return value;
        },
        energyType: [
            [],
            [0, 1, 3, 5, 10, 20],
            [0, 40, 60, 80, 100, 125, 150],
            [0, 5, 15, 30, 50, 80],
            [0, 100, 200, 300, 400, 500],
            [0, 600, 600, 4000, 10000]
        ],
        bonus: 0,
        next: 1
    },
    vaporizationInfo: {
        effect2U1: () => (global.upgradesInfo[2].effect[1] = 1e10 / 3 ** player.strangeness[2][3]),
        effect2RE3: () => (global.researchesExtraInfo[2].effect[3] = 1 + Math.floor(Limit(player.vaporization.clouds).log(10).toNumber())),
        get: [0, 0]
    },
    accretionInfo: {
        effective: 0,
        rankU: [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 5], //Upgrades
        rankR: [1, 1, 2, 2, 3, 3, 4, 5], //Researches
        rankE: [2, 3, 4, 5, 3], //Researches Extra
        rankCost: [5.97e27, 1e-7, 1e10, 1e24, 5e29, 2.47e31, 0],
        rankName: ['Ocean world', 'Cosmic dust', 'Meteoroid', 'Asteroid', 'Planet', 'Jovian planet', 'Protostar'],
        rankImage: ['Ocean%20world.png', 'Dust.png', 'Meteoroids.png', 'Asteroid.png', 'Planet.png', 'Giant.png', 'Protostar.png']
    },
    collapseInfo: {
        unlockB: [0, 0.01235, 0.23, 10, 40, 1000], //Buildings (stage 4)
        unlockG: [0, 100, 1000, 1e5], //Buildings (stage 5)
        unlockU: [0.01235, 0.076, 1.3, 10], //Upgrades
        unlockR: [0.18, 0.3, 0.8, 1.3], //Researches
        newMass: 0,
        massEffect: (post = false) => {
            let effect = player.collapse.mass;
            if (post && global.collapseInfo.newMass > effect) { effect = global.collapseInfo.newMass; }

            if (player.elements[21] === 1) { effect **= 1.1; }
            return effect;
        },
        starCheck: [0, 0, 0],
        starEffect: [
            (post = false) => {
                let effect = player.collapse.stars[0] + 1;
                if (post) { effect += global.collapseInfo.starCheck[0]; }
                if (player.elements[6] === 1) { effect **= global.elementsInfo.effect[6] as number; }
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
        dustCap: [5, 45],
        massCap: 600 //Seconds
    },
    intervalsId: {
        main: undefined,
        numbers: undefined,
        visual: undefined,
        autoSave: undefined
    },
    stageInfo: {
        word: ['', 'Microworld', 'Submerged', 'Accretion', 'Interstellar', 'Intergalactic', 'Void'],
        textColor: ['', 'var(--cyan-text-color)', 'var(--blue-text-color)', 'var(--gray-text-color)', 'var(--orange-text-color)', 'var(--darkorchid-text-color)', 'var(--darkviolet-text-color)'],
        buttonBackgroundColor: ['', 'mediumblue', 'blue', '#291344', '#6a3700', '#4a008f', '#2b0095'],
        buttonBorderColor: ['', 'darkcyan', '#427be1', '#404040', '#9f6700', '#8a0049', '#711bda'],
        imageBorderColor: ['', '#008b8b', '#1460a8', '#5b5b75', '#e87400', '#b324e2', '#5300c1'],
        priceName: 'Energy',
        activeAll: [1]
    },
    buildingsInfo: {
        maxActive: [0, 4, 6, 5, 5, 4], //Pre vacuum ([1] > [5])
        name: [
            [],
            ['Mass', 'Preons', 'Quarks', 'Particles', 'Atoms', 'Molecules'], //[0] Must be 'Mass'
            ['Moles', 'Drops', 'Puddles', 'Ponds', 'Lakes', 'Seas', 'Oceans'],
            ['Mass', 'Cosmic dust', 'Planetesimals', 'Protoplanets', 'Satellites', 'Subsatellites'],
            ['Elements', 'Brown dwarfs', 'Main sequence', 'Red supergiants', 'Blue hypergiants', 'Quasi stars'],
            ['Stars', 'Nebulas', 'Clusters', 'Galaxies', 'Filaments']
        ],
        type: [ //'Not allowed index x', means that this index is reserved for gain calculation
            [] as unknown as [''],
            ['', 'producing', 'producing', 'producing', 'producing', 'producing'], //Not allowed index 6 (for 'producing')
            ['', 'producing', 'producing', 'improves', 'improves', 'improves', 'improves'],
            ['', 'producing', 'producing', 'producing', 'improves', 'improves'],
            ['', 'producing', 'producing', 'producing', 'producing', 'producing'],
            ['', 'producing', 'improves', 'improves', 'improves'] //Not allowed index 2, 3, 4 (for 'producing')
        ],
        firstCost: [],
        startCost: [
            [],
            [0, 0.005476, 6, 3, 24, 3],
            [0, 0.0028, 100, 1e7, 1e18, 1e23, 2.676e25],
            [0, 1e-19, 1e-9, 1e21, 1e17, 1e22],
            [0, 1, 1e5, 1e16, 1e31, 1e58],
            [0, 1e30, 1e40, 1e5, 100]
        ],
        increase: [
            [],
            [0, 1.4, 1.4, 1.4, 1.4, 1.4],
            [0, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2],
            [0, 1.15, 1.15, 1.15, 10, 10],
            [0, 1.4, 1.55, 1.70, 1.85, 2],
            [0, 4, 4, 1.11, 1.11]
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
            if (!player.inflation.vacuum && player.upgrades[5][2] === 1) { effect **= 1.5; }
            return (global.elementsInfo.effect[28] = Math.max(Math.floor(effect), 0));
        },
        gain: (stage: number) => {
            let gain = 1;
            if (stage >= 4 || player.inflation.vacuum) {
                if (player.elements[27] === 1) { gain += 2; }
                if (player.elements[28] === 1) { gain += global.strangeInfo.Element28(); }
            }
            if (player.inflation.vacuum) {
                gain += 3;
                if (player.researchesExtra[2][3] >= 1) { gain += global.vaporizationInfo.effect2RE3(); }
            }
            if (player.strangeness[5][1] >= 1) { gain *= 2; }
            return Math.floor(gain);
        },
        stageBoost: [null, null, null, null, null, null]
    },
    upgradesInfo: [ //Effect is null if it can't change
        {} as globalType['upgradesInfo'][0], { //Stage 1
            name: [
                'Weak force',
                'Strong force',
                'Bigger electrons',
                'Stronger protons',
                'More neutrons',
                'Superposition',
                'Protium. Basic',
                'Deuterium. Heavy',
                'Tritium. Radioactive',
                'Nuclear fusion'
            ],
            effectText: [
                () => 'Particles produce 5 times more Quarks.',
                () => 'Gluons now bind Quarks into Particles, which makes Particles 10 times cheaper.',
                () => `${player.inflation.vacuum ? 'Atoms' : 'Particle'} cost is 10 times cheaper.`,
                () => `${player.inflation.vacuum ? 'Atoms' : 'Particle'} produce 10 times more ${player.inflation.vacuum ? 'Particles' : 'Quarks'}.`,
                () => `${player.inflation.vacuum ? 'Molecules' : 'Atoms'} produce 5 times more ${player.inflation.vacuum ? 'Atoms' : 'Particles'}.`,
                () => `Ability to reset at any time, and if had enough Energy, then production for all Structures will also be boosted by ${format(global.upgradesInfo[1].effect[5] as number)} times.\nTotal boost from reached goals is: ${Limit(global.upgradesInfo[1].effect[5] as number).power(player.discharge.current + global.dischargeInfo.bonus).format()}.`,
                () => `Cost scaling is decreased by ${format(global.upgradesInfo[1].effect[6] as number)}.`,
                () => `Structures (only self-made one's) boost themselves by ${format(global.upgradesInfo[1].effect[7] as number)} times.`,
                () => `Molecules produce Molecules. At a reduced rate. (${Limit(global.upgradesInfo[1].effect[8] as overlimit).format({ padding: true })} per second)`,
                () => 'Unspent Energy boost Molecules production of themselves 1 to 1.'
            ],
            effect: [null, null, null, null, null, 4, 0.2, 1.01, 0, null],
            startCost: [32, 48, 60, 90, 150, 400, 1600, 4000, 32000, 100000],
            maxActive: 10
        }, { //Stage 2
            name: [
                'Molecules to Moles',
                'Vaporization',
                'Surface tension',
                'Surface stress',
                'Stream',
                'River',
                'Tsunami'
            ],
            effectText: [
                () => 'Drops will produce Moles even more for every self-made Drops.',
                () => `Gain ability to convert Drops into Clouds. (Puddles get a boost equal to Cloud amount)\nCurrent Cloud gain is (Drops / ${format(global.vaporizationInfo.effect2U1())})^${Limit(player.vaporization.clouds).moreOrEqual('1e4') ? `${format(player.inflation.vacuum ? 0.3 : 0.36)}. (Softcapped)` : `${format(player.inflation.vacuum ? 0.4 : 0.6)}.`}`,
                () => `Puddles get boost based on Moles. (Equal to Moles ^${format(global.upgradesInfo[2].effect[2] as number)})`,
                () => `Puddles get boost based on Drops. (Equal to Drops ^${format(global.upgradesInfo[2].effect[3] as number)})`,
                () => `Ponds now create extra Puddles. (${format(global.upgradesInfo[2].effect[4] as number)} extra Puddles per Pond)`,
                () => `Lakes now create extra Ponds. (${format(global.upgradesInfo[2].effect[5] as number)} extra Ponds per Lake)`,
                () => 'Spreads enough water to make each Sea create 1 extra Lake.'
            ],
            effect: [null, 1e10, 0.02, 0.02, 1, 1, null],
            startCost: [10, 1e10, 1000, 10000, 2e9, 5e20, 1e28],
            maxActive: 7
        }, { //Stage 3
            name: [
                'Brownian motion',
                'Gas',
                'Micrometeoroid',
                'Streaming instability',
                'Gravitational field',
                'Rubble pile',
                'Satellite system',
                'Magma ocean',
                'Hydrostatic equilibrium',
                'Atmosphere',
                'Pebble accretion',
                'Tidal force',
                'Ring system'
            ],
            effectText: [
                () => `Through random collisions every self-made Dust speeds up Accretion speed. (By ${format(global.upgradesInfo[3].effect[0] as number)})`,
                () => `New substance for Accretion, will provide boost to Accretion speed based on current Dust amount. (${Limit(global.upgradesInfo[3].effect[1] as overlimit).format()} boost)`,
                () => 'Just a small meteoroid, but it will be a good base for what to come. (Unlock a new Structure and get 2x boost to Dust)',
                () => `Small bodies spontaneously concentrate into clumps. (Self-made Planetesimals boost each other by ${format(1.02)})`,
                () => 'Bodies are now massive enough to affect each other with gravity. (Unlock a new Structure and get 4x boost to Planetesimals)',
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
            startCost: [1e-16, 1e-13, 1e-13, 1, 1e14, 1e17, 1e22, 1e11, 1e22, 1e23, 1e9, 1e26, 1e29],
            maxActive: 13
        }, { //Stage 4
            name: [
                'Gravitational collapse',
                'Proton-proton chain',
                'Carbon-Nitrogen-Oxygen cycle',
                'Helium fusion'
            ],
            effectText: [
                () => 'As fuel runs out, each star will boost production in its own special way.',
                () => `Fuse with Protium instead of Deuterium. ${player.inflation.vacuum ? 'Unlock 5 first Elements.' : 'Unlock a new Structure and something else.\n(Somewhere in Research tab)'}`,
                () => `CNO cycle is now a better source of Helium and Energy. ${player.inflation.vacuum ? 'Unlock 5 more Elements' : 'Unlock a new Structure and more of something else'}.`,
                () => 'Through Triple-alpha and then Alpha process, unlock a few more Elements.'
            ],
            effect: [null, null, null, null],
            startCost: [100, 1000, 1e9, 1e50],
            maxActive: 4
        }, { //Stage 5
            name: [
                'Jeans instability',
                'Super star cluster',
                'Quasar'
            ],
            effectText: [
                () => `Gravitational collapse within Nebulas will increase speed for production of Stars by ${format(global.upgradesInfo[5].effect[0] as number)} times.`,
                () => `A very massive Star clusters, that will boost Stars by ${format(global.upgradesInfo[5].effect[1] as number)}.`,
                () => player.inflation.vacuum ? `Boost per Galaxy increased by +${format(0.2)}` : `'[28] Nickel' Element receives super boost of ^${format(1.5)}.`
            ],
            effect: [4, 6, null],
            startCost: [1e50, 1e60, 1e140],
            maxActive: 3
        }
    ],
    researchesInfo: [
        {} as globalType['researchesInfo'][0], { //Stage 1
            name: [
                'Stronger Protium',
                'Better Deuterium',
                'Improved Tritium',
                'Requirement decrease',
                'Discharge improvement',
                'Radioactive Discharge'
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
            max: [9, 3, 9, 2, 1, 3],
            maxActive: 6
        }, { //Stage 2
            name: [
                'Better Mole production',
                'Condensation',
                'Stronger surface tension',
                'Stronger surface stress',
                'More streams',
                'Distributary channel'
            ],
            effectText: [
                () => 'Drops produce 3 times more Moles.',
                () => 'Through condensation bonus to Structure production is now based on total produced, instead of current amount.\nLevel 1 for Drops, level 2 for Moles.',
                () => `Surface tension upgrade is now +${format(player.inflation.vacuum ? 0.03 : 0.02)} stronger.`,
                () => `Surface stress upgrade is now +${format(player.inflation.vacuum ? 0.02 : 0.03)} stronger.`,
                () => 'With more streams, can have even more extra Puddles. (+1 extra Puddles per Pond)',
                () => 'Rivers can split now, that allows even more Ponds per Lake. (+1 per)'
            ],
            effect: [null, null, null, null, null, null],
            cost: [],
            startCost: [20, 1e12, 1e5, 1e6, 1e14, 1e22],
            scaling: [1.2, 1000, 1000, 10000, 1000, 100],
            max: [9, 2, 3, 3, 2, 2],
            maxActive: 6
        }, { //Stage 3
            name: [
                'More massive bodies',
                'Adhesion',
                'Space weathering',
                'Inelastic collisions',
                'Contact binary',
                'Gravity',
                'Planetary differentiation',
                'Aerodynamic drag'
            ],
            effectText: [
                () => 'Dust production is increased by 3.',
                () => `Dust particles cling to each other. (+${format(0.01)} to 'Brownian motion')`,
                () => 'Planetesimals produce more Dust. (3 times more)',
                () => 'Slow encounter velocities will result in a more efficient growth, so this research will make bodies lose more energy with each deflection. Mass production increased by 2.',
                () => 'Some Planetesimals instead of shattering form a contact binary or even trinary. Planetesimals production boosted by 5x.',
                () => `Planetesimals attract other bodies with own gravity. Planetesimals get boost to production based on unspent Mass.\n(Total boost: ${format(global.researchesInfo[3].effect[5] as number, { padding: true })}${player.inflation.vacuum && global.researchesInfo[3].effect[5] as number >= 4000 ? ', hardcapped' : ''})`,
                () => `'Magma Ocean' upgrade is stronger now. (${format(1.5)}x times)`,
                () => `Accretion speed for 'Pebble accretion' increased again, by ${player.inflation.vacuum ? 2 : 3}.`
            ],
            effect: [null, null, null, null, null, 0, null, null],
            cost: [],
            startCost: [1e-14, 1e-15, 1e-5, 1e5, 1e10, 1e15, 1e13, 1e12],
            scaling: [11, 111, 22, 10, 100, 10, 100000, 1000],
            max: [7, 3, 9, 4, 2, 5, 3, 3],
            maxActive: 8
        }, { //Stage 4
            name: [
                'Planetary system',
                'Star system',
                'Protoplanetary disk',
                'Planetary nebula'
            ],
            effectText: [
                () => `From Planetesimals to Planets, will get ${format(global.researchesInfo[4].effect[0] as number)}x boost to all Stars.`,
                () => `Each Star boost another Star. (Total to each Star is ${Limit(global.researchesInfo[4].effect[1] as overlimit).format({ padding: true })}x${(global.researchesInfo[4].effect[1] as overlimit)[1] >= 10 ? ', softcapped' : ''})`,
                () => "Improve effect of 'Planetary system', as well increases its max level by +3.",
                () => 'Matter expelled from Red giants, but get 10x boost to Main-sequence stars anyway.'
            ],
            effect: [1.1, 1, null, null],
            cost: [],
            startCost: [1000, 50000, 1e8, 1e12],
            scaling: [10, 200, 1e12, 0],
            max: [3, 2, 1, 1],
            maxActive: 4
        }, { //Stage 5
            name: [
                'Higher density',
                'Type frequency'
            ],
            effectText: [
                () => {
                    const index = Math.min(player.researches[5][0] + 2, 4);
                    return `Higher density of Nebulas, will allow them to produce higher tier of Stars, but each tier is 4 times slower than previous one. Also will boost Nebulas by 4.\nNext tier will be ${player.buildings[4][index].trueTotal[0] === 0 ? '(unknown)' : global.buildingsInfo.name[4][index]}.`;
                },
                () => {
                    const index = Math.max(3 - player.researches[5][1], 1);
                    return `More types of Stars are found within Star cluster. Increasing effect by 3, but also boosting lower tier of Stars. (3 times less than higher one)\nNext tier will be ${player.buildings[4][index].trueTotal[0] === 0 ? '(unknown)' : global.buildingsInfo.name[4][index]}.`;
                }
            ],
            effect: [null, null],
            cost: [],
            startCost: [1e40, 1e55],
            scaling: [1e20, 1e15],
            max: [3, 3],
            maxActive: 2
        }
    ],
    researchesExtraInfo: [
        {} as globalType['researchesExtraInfo'][0], { //Stage 1
            name: [
                'Extra strong force',
                'Better radiation base',
                'Accretion',
                'Later Preons',
                'Impulse'
            ],
            effectText: [
                () => 'Mesons now binds Particles to form Atoms as well. Atoms are affected by strong force.',
                () => `Improve formula for Radiation, ${player.researchesExtra[1][1] < 1 ? 'logE > log2' : `log${format(global.researchesExtraInfo[1].effect[1] as number)}${player.researchesExtra[1][1] < 10 ? ` > log${format(global.researchesExtraInfo[1].effect[1] as number - 0.1)}` : ''}`}.`,
                () => 'First level is to begin the Accretion, second level is to Submerge it.\nEverything is connected. All Structures produce Energy on creation.',
                () => `Hardcap for Mass production from Preons is delayed by current Energy ^${format(global.researchesExtraInfo[1].effect[3] as number)}.`,
                () => `Discharge goals can now boost all Structures from Submerged, Accretion and Interstellar Stages, but at reduced base.\nCurrent base is ${format(global.researchesExtraInfo[1].effect[4] as number)}, total boost is ${Limit(global.researchesExtraInfo[1].effect[4] as number).power(player.discharge.current + global.dischargeInfo.bonus).format()}.`
            ],
            effect: [null, 2, null, 1e13, 1.04],
            cost: [],
            startCost: [12000, 42000, 24000, 46000, 200000],
            scaling: [0, 8000, 72000, 36000, 0],
            max: [1, 10, 2, 4, 1],
            maxActive: 0
        }, { //Stage 2
            name: [
                'Natural Vaporization',
                'Rain Clouds',
                'Storm Clouds',
                'Ocean world'
            ],
            effectText: [
                () => 'Clouds will now use total produced Drops instead, when formed.',
                () => `Some Clouds will start pouring Drops themselves. (${player.inflation.vacuum ? `Improves Puddles by ${format(global.researchesExtraInfo[2].effect[1] as number)} in total` : `${format(global.researchesExtraInfo[2].effect[1] as number)} per second`})`,
                () => `Seas get a boost based on amount of Clouds. (Equal to ${Limit(global.researchesExtraInfo[2].effect[2] as overlimit).format({ padding: true })})`,
                () => `On Stage reset gain extra Strange reward for every new digit of Clouds, as well +1. (Currently +${format(global.vaporizationInfo.effect2RE3())})`
            ],
            effect: [null, 0, 0, 1],
            cost: [],
            startCost: [1e16, 1e13, 1e26, 1e10],
            scaling: [0, 100, 0, 0],
            max: [1, 4, 1, 1],
            maxActive: 3
        }, { //Stage 3
            name: [
                'Rank boost',
                'Efficient growth',
                'Weight',
                'Viscosity',
                'Efficient submersion'
            ],
            effectText: [
                () => `Dust production is increased by another ${format(global.researchesExtraInfo[3].effect[0] as number)}.`,
                () => `Accretion speed is even quicker. Multiplied by effective Rank. (Total boost to Dust: ${format(global.researchesExtraInfo[3].effect[1] as number)})`,
                () => "'Gravitational field' upgrade will boost Protoplanets now as well. (Only half of effect)",
                () => "'Gas' upgrade is now stronger.",
                () => `'Efficient growth' now boost Puddles as well. (Current boost is: ${format(global.researchesExtraInfo[3].effect[4] as number)})`
            ],
            effect: [0, 0, null, null, 0],
            cost: [],
            startCost: [1e-18, 1e-16, 1e26, 1e-12, 1e21],
            scaling: [10, 100, 0, 1e14, 1e5],
            max: [12, 5, 1, 2, 1],
            maxActive: 4
        }, { //Stage 4
            name: [
                'Nova',
                'White dwarfs'
            ],
            effectText: [
                () => {
                    const index = Math.min(player.researchesExtra[4][0] + 2, 4);
                    return `${player.buildings[4][index].trueTotal[0] === 0 ? '(Unknown)' : global.buildingsInfo.name[4][index]} Stars are now creating something new, upon collapse reset.`;
                },
                () => "Red giants are turning into White dwarfs, this will improve effect of '[6] Carbon' Element."
            ],
            effect: [null, null],
            cost: [],
            startCost: [1e6, 1e50],
            scaling: [1e12, 0],
            max: [3, 1],
            maxActive: 2
        }, { //Stage 5
            name: [],
            effectText: [],
            effect: [],
            cost: [],
            startCost: [],
            scaling: [],
            max: [],
            maxActive: 0
        }
    ],
    researchesAutoInfo: {
        name: [
            'New toggles',
            'Offline storage capacity',
            'Automatic upgrades'
        ],
        effectText: [
            () => !player.inflation.vacuum && player.strange[0].total === 0 ? 'Unlock ability to make multiple Structures at same time.' :
            /**/'First level is for making multiple Structures at same time.\nSecond level is to turn OFF/ON all auto toggles at once.\nThird level improves control over consumption of Offline storage.',
            () => `Research this to increase capacity of Offline storage by +${player.stage.true >= 6 ? 8 : 4} hours.`,
            () => 'This is going to create all upgrades automatically. Each level increases highest type of upgrades to create.\n(Enable in settings, order of unlocks is upgrades > researches > special researches)'
        ],
        cost: [],
        startCost: [2000, 1e9, 1],
        scaling: [29000, 2e4, 1e10],
        max: [1, 1, 0],
        autoStage: [1, 2, 3] //Stage to buy from
    },
    ASRInfo: { //Auto Structures Research
        cost: [0, 4000, 1e10, 1e-7, 1e6, 1],
        costRange: [ //Random scaling
            [],
            [4000, 12000, 24000, 32000, 44000],
            [1e10, 1e13, 1e16, 1e24, 1e28, 1e40],
            [1e-7, 1e10, 5e29, 2e30, 1e36],
            [1e6, 1e17, 1e28, 1e39, 1e70],
            [1, 1, 1, 1]
        ],
        max: [0, 5, 5, 4, 4, 0]
    },
    elementsInfo: {
        name: [
            '[0] Neutronium',
            '[1] Hydrogen',
            '[2] Helium',
            '[3] Lithium',
            '[4] Beryllium',
            '[5] Boron',
            '[6] Carbon',
            '[7] Nitrogen',
            '[8] Oxygen',
            '[9] Fluorine',
            '[10] Neon',
            '[11] Sodium',
            '[12] Magnesium',
            '[13] Aluminium',
            '[14] Silicon',
            '[15] Phosphorus',
            '[16] Sulfur',
            '[17] Chlorine',
            '[18] Argon',
            '[19] Potassium',
            '[20] Calcium',
            '[21] Scandium',
            '[22] Titanium',
            '[23] Vanadium',
            '[24] Chromium',
            '[25] Manganese',
            '[26] Iron',
            '[27] Cobalt',
            '[28] Nickel'
        ],
        effectText: [
            () => `Element with no protons, true head of this table.\nThis one is ${Math.random() < 0.1 ? (Math.random() < 0.1 ? 'an illusive Tetraneutron, or maybe even Pentaneutron, wait where did it go? Was it even there?' : 'a rare Dineutron, but it is already gone...') : 'a simple Mononeutron, it will stay with you for as long as it can.'}`,
            () => 'Most basic Element, increases Brown dwarf production by 2.\nAlso Solar mass effect is now known - boost to all Stars.',
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
            () => 'Stars are inside you, as well Neutrons stars strength is now increased by the decimal logarithm.\nNeutron stars effect is now known - boost to all Stars.',
            () => `Has a great affinity towards Oxygen and to decrease cost of all Stars by ${format(1e3)}.`,
            () => `Number is 14, group is 14, melts at ${format(1414)}°C and so is Mass ${player.inflation.vacuum ? 'hardcap for Cosmic dust delayed' : 'gain increased'} by ${format(1.4)}.`,
            () => `One of the Fundamentals of Life and to make all of Stars ${player.inflation.vacuum ? 'delay Mass hardcap (Cosmic dust)' : 'boost Mass'}.`,
            () => "From hot area, to increase max level of 'Star system' by 1.",
            () => "Extremely reactive to extend max level of 'Planetary system', by another 27 levels.",
            () => `Less noble boost, but Black holes effect scales a little better.\nBlack holes effect is now known - ${player.inflation.vacuum ? 'delay for Preon Mass hardcap' : 'boost to Solar mass gain'}.`,
            () => "Don't forget about it and get a 3x boost to all Stars.",
            () => "Get stronger with 1 extra level of 'Star system'.",
            () => `A new color and a rare bonus of ^${format(1.1)} to Mass effect.`,
            () => 'New alloy allowing Red giants to be added into effective amount of Neutron stars.',
            () => 'Catalyst for production of Elements. Black holes boost all Stars by the decimal logarithm.',
            () => `No corrosion, only boost to all Stars that is based on unspent Elements^${format(0.01)}.`,
            () => "Brittle Element, but not the bonus - 1 more level in 'Star system'.",
            () => `Any further fusion will be an endothermic process. Gain 2x boost to all Stars, ${player.inflation.vacuum ? 'unlock Stage reset.' : 'but what next?\nUnlock ability to switch between active Stages, also enter new Stage.'}`,
            () => "While new Elements won't produce much Energy, this one can create 2 extra Strange quark for this Stage reset.",
            () => `Slow to react, but gain extra Strange quarks for every new reached digit past 52 anyway.\n(+${format(global.strangeInfo.Element28())} for this Stage reset)`
        ],
        effect: [
            null, null, null, null, null, null, 1.5, null, null, null,
            null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, 0
        ],
        startCost: [
            0, 1000, 4000, 2e4, 1e5, 1e8, 1e10, 4e11, 2e13, 1e14,
            1e16, 1e20, 1e24, 1e25, 1.4e27, 1e30, 1e31, 5e31, 5e33, 1e35,
            1e36, 1e38, 2e39, 3e41, 4e42, 1e45, 1e50, 1e52, 1e55
        ]
    },
    strangenessInfo: [
        {} as globalType['strangenessInfo'][0], { //Stage 1
            name: [
                'Stronger Discharge',
                'Cheaper Discharge',
                'Free Discharge',
                'Automatic Discarge',
                'Increased Energy',
                'Better improvement',
                'Keep auto Structures',
                'More toggles',
                'Strange boost',
                'Energy recycling'
            ],
            effectText: [
                () => 'Base Discharge effect is now +1.',
                () => 'Discharge goal scales slower. (-1)',
                () => 'Obtain +1 bonus Discharge goal.',
                () => `Automatically Discharge upon creating an upgrade or reaching next goal.${player.strangeness[1][9] >= 1 ? "\nSecond level - auto Discharge when reaching next goal doesn't cause an reset." : ''}`,
                () => `Gain more Energy from creating ${player.inflation.vacuum ? 'Preons, +2' : 'Particles, +1'}.`,
                () => `Research 'Improved Tritium' is now better. (+${format(player.inflation.vacuum ? 0.4 : 0.3)})`,
                () => `Always have auto for ${global.buildingsInfo.name[1][Math.min(player.strangeness[1][6] + 1, global.ASRInfo.max[1])]}.`,
                () => `Increase max level of 'New toggles'.${player.inflation.vacuum ? '' : ' Also keep them on Stage reset.'}`,
                () => `Unspend Strange quarks will boost this Stage. (${player.inflation.vacuum ? 'Bonus goals' : 'Stronger radiation'})`,
                () => "Energy is no longer gained on Structure creation, but instead it's based on current self-made amount of Structures.\nFirst step towards something more."
            ],
            cost: [],
            startCost: [2, 1, 20, 40, 2, 1, 2, 4, 20, 10000],
            scaling: [3, 3, 2, 1, 3, 1.4, 1.8, 3, 1, 1],
            max: [4, 4, 2, 1, 2, 5, 3, 1, 1, 1],
            maxActive: 9
        }, { //Stage 2
            name: [
                'More Moles',
                'Bigger Puddles',
                'More spread',
                'Cloud density',
                'Automatic Vaporization',
                'Keep auto Structures',
                'Longer offline',
                'Longest offline',
                'Strange boost',
                'New Structure'
            ],
            effectText: [
                () => 'Mole production increased by 2x.',
                () => 'Puddles produce 2 times more.',
                () => 'Increase max level of some researches by +1.\nFinal level will instead unlock a new upgrade.',
                () => 'Decrease requirement per Cloud.',
                () => `Automatically Vaporize when reach certain amount.${player.strangeness[1][9] >= 1 ? '\nSecond level - gain 1% of Clouds per second.' : ''}`,
                () => `Always have auto for ${global.buildingsInfo.name[2][Math.min(player.strangeness[2][5] + 1, global.ASRInfo.max[2])]}.`,
                () => `Increase max offline time research level.${player.inflation.vacuum ? '' : ' Also keep them on Stage reset.'}`,
                () => player.stage.true < 6 ? 'Max offline time is now 50% longer. (Additive)' : 'Offline time being wasted less, -1 second per level.',
                () => 'Unspend Strange quarks will boost this Stage. (Puddle production)',
                () => "Unlock a new Structure. (Requires level 5 of 'Keep auto Structures')"
            ],
            cost: [],
            startCost: [1, 2, 3, 4, 20, 4, 1, 4, 30, 32],
            scaling: [1.5, 2, 3, 3, 1, 1.6, 2, 4, 1, 1],
            max: [6, 6, 3, 3, 1, 5, 4, 2, 1, 1],
            maxActive: 9
        }, { //Stage 3
            name: [
                'Faster Accretion',
                'Intense weathering',
                'More levels',
                'Improved Satellites',
                'Automatic Rank',
                'Keep auto Structures',
                'Automatization for Upgrades',
                'Strange boost',
                'New Structure',
                'Mass shift'
            ],
            effectText: [
                () => `Accretion speed is 2 times faster. (Affected by ${player.inflation.vacuum ? 'hard' : 'soft'}cap)`,
                () => 'All Accretion Structures that produce another Structure now do it 2 times faster.',
                () => 'Some Rank researches receive extra Max level.\nFinal level will instead unlock a new upgrade.',
                () => `Satellites now improve all Accretion Structures${player.inflation.vacuum ? ' with reduced strength' : ''}.`,
                () => `Automatically increase Rank when available.${player.strangeness[1][9] >= 1 ? '\nSecond level - once hardcap for Cosmic dust is reached, all Mass related Structures will be made only when 2 times of Main-sequence hardcap.' : ''}`,
                () => `Always have auto for ${global.buildingsInfo.name[3][Math.min(player.strangeness[3][5] + 1, global.ASRInfo.max[3])]}.`,
                () => `Unlock automatization for Upgrades / Researches.${player.inflation.vacuum ? '' : ' (Not affected by Stage reset)'}`,
                () => `Unspend Strange quarks will boost this Stage. (${player.inflation.vacuum ? 'Effective Rank' : 'Cheaper Accretion)\n(Scales slower past 800 Strange quarks'})`,
                () => "Unlock a new Structure. (Requires level 4 of 'Keep auto Structures')",
                () => 'Allows to shift Cosmic dust and Solar mass hardcaps (in Rank settings). Extra levels allow for 2 times bigger shift.'
            ],
            cost: [],
            startCost: [1, 2, 6, 18, 30, 3, 10, 20, 24, 36],
            scaling: [1.46, 2.5, 2, 1, 1, 1.8, 3, 1, 1, 4],
            max: [8, 4, 3, 1, 1, 4, 3, 1, 1, 3],
            maxActive: 8
        }, { //Stage 4
            name: [
                'Hotter Stars',
                'Cheaper Stars',
                'New Upgrade',
                'Main giants',
                'Remnants of past',
                'Automatic Collapse',
                'Keep auto Structures',
                'Daily gain',
                'Max gain',
                'Strange boost',
                'New Structure'
            ],
            effectText: [
                () => `All Stars produce ${format(1.5)} times more Elements.`,
                () => 'Stars are 2 times cheaper.',
                () => 'Unlock a new Upgrade.\nFirst one is extra good.',
                () => '25% of Brown dwarfs will turn into Red giants now.',
                () => `Elements in Research tab will be ${player.inflation.vacuum ? 'auto created' : 'preserved through Collapse reset'}.`,
                () => `Stars will Collapse automatically.${player.strangeness[1][9] >= 1 ? '\nSecond level - Solar mass is slowly gained without Reset.\nThird level - Stars from Collapse slowly gained without Reset.' : ''}`,
                () => `Always have auto for ${global.buildingsInfo.name[4][Math.min(player.strangeness[4][6] + 1, global.ASRInfo.max[4])]}.`,
                () => `Creates +${player.inflation.vacuum ? 2 : 1} Strange quarks per day, can claim only full one's only with export.`,
                () => player.stage.true >= 6 ? "Reward from Export is now increased by 20% of best Stage reset.\nRequires level 3 of 'Daily gain'." : 'Unclaimed Strange quarks max storage is now 1 day longer.',
                () => 'Unspend Strange quarks will boost this Stage. (All Stars production)',
                () => "Unlock a new Structure. (Requires level 4 of 'Keep auto Structures')"
            ],
            cost: [],
            startCost: [1, 3, 5, 5, 90, 20, 4, 4, 24, 40, 32],
            scaling: [1.8, 2, 3, 4, 1, 1, 1.8, 1.8, 1, 1, 1],
            max: [8, 4, 3, 2, 1, 1, 4, 3, 1, 1, 1],
            maxActive: 10
        }, { //Stage 5
            name: [
                'Omnipresent reality',
                'Strange gain',
                'Auto Stage',
                'Bigger Nebulas',
                'Denser Clusters',
                'Gravitational bound',
                'Hypercompact stellar system',
                'Auto Structures',
                'New Milestones'
            ],
            effectText: [
                () => player.inflation.vacuum ? 'Unlock the Void. (Not in the game, but can be bought for new theme)\nAlso a new color theme.' : `Gain ability to be inside multiple Stages at once. (Next one to always be inside is ${global.stageInfo.word[player.strangeness[5][0] + 1]})\nPermanent Stages do not appear in history or reset timer.`,
                () => 'Gain 2 times more Strange quarks from Stage resets.',
                () => 'Allows to auto reset Stage, has some special settings.',
                () => "Bigger Nebulas, more matter for Accretion. 'Jeans instability' upgrade is 3 times stronger.",
                () => "'Super star cluster' is now even bigger. Effect increased by 4.",
                () => player.inflation.vacuum ? 'Unlock Intergalactic Stage.' : 'Intergalactic is no longer affected by Collapse reset.',
                () => 'With this, a new Structure, can be created. Second level unlocks auto for it.',
                () => "Increase permanent level of auto Structures. It's the only way to do it.",
                () => `Unlock ${player.inflation.vacuum ? 'Void' : 'Intergalactic'} Milestones.`
            ],
            cost: [],
            startCost: [4, 12, 50, 5, 10, 40, 1500, 60, 1500],
            scaling: [1, 1, 1, 1.8, 1.75, 1, 1.5, 1.5, 1],
            max: [3, 1, 1, 9, 9, 1, 2, 2, 1],
            maxActive: 9
        }
    ],
    lastUpgrade: [false, -1], //One per subtab
    lastResearch: [false, -1, 'researches'],
    lastElement: [false, -1],
    milestonesInfo: [
        {} as globalType['milestonesInfo'][0], { //Stage 1
            name: [
                'Endless Matter',
                'Energized'
            ],
            needText: [
                () => `Discharge at least ${Limit(global.milestonesInfo[1].need[0]).format()} Quarks at once.`,
                () => `Have max Energy reach ${Limit(global.milestonesInfo[1].need[1]).format()}.`
            ],
            rewardText: [
                "Unknown Structure, it doesn't belong to this Universe.\nYou can view it in stats.",
                'Stars produce 4 times more Elements.'
            ],
            need: [[1, 220], [4, 4]],
            reward: [1, 1],
            scalingOld: [
                [[1e220, 1e240, 1e260, 1e280, 1e300], [1, 1, 1, 1, 2]],
                [[40000, 46000, 52000, 58000], [1, 1, 1, 2]]
            ],
            unlock: [5, 3]
        }, { //Stage 2
            name: [
                'A Nebula of Drops',
                'Just a bigger Puddle'
            ],
            needText: [
                () => `Vaporize ${Limit(global.milestonesInfo[2].need[0]).format()} Drops at once.`,
                () => `Have at least ${Limit(global.milestonesInfo[2].need[1]).format()} Puddles at same time.`
            ],
            rewardText: [
                'A new Intergalactic Structure.',
                "Unknown Structure, it doesn't belong to this Universe.\nYou can view it in stats."
            ],
            need: [[1, 30], [3, 3]],
            reward: [1, 1],
            scalingOld: [
                [[1e30, 1e35, 1e40, 1e45, 1e50], [1, 1, 1, 2, 3]],
                [[3000, 5000, 9000, 18000], [1, 2, 2, 3]]
            ],
            unlock: [3, 4]
        }, { //Stage 3
            name: [
                'Cluster of Mass',
                'Satellites of Satellites'
            ],
            needText: [
                () => `Have at least ${Limit(global.milestonesInfo[3].need[0]).format()} Mass at once.`,
                () => `Have more Satellites than ${Limit(global.milestonesInfo[3].need[1]).format()}.`
            ],
            rewardText: [
                'A new Intergalactic Structure.',
                "Unknown Structure, it doesn't belong to this Universe.\nYou can view it in stats."
            ],
            need: [[1, 30], [2.5, 1]],
            reward: [1, 1],
            scalingOld: [
                [[1e30, 1e35, 1e40, 1e46, 1e52, 1e58], [1, 1, 1, 2, 2, 3]],
                [[25, 40, 55, 70, 85], [1, 2, 2, 3, 3]]
            ],
            unlock: [3, 5]
        }, { //Stage 4
            name: [
                'Supermassive',
                'Biggest of all'
            ],
            needText: [
                () => `Collapse to at least ${Limit(global.milestonesInfo[4].need[0]).format()} Solar mass.`,
                () => `Collapse to ${Limit(global.milestonesInfo[4].need[1]).format()} Black holes or more.`
            ],
            rewardText: [
                'New Intergalactic themed Strangenesses.',
                "Unknown Structure, it doesn't belong to this Universe.\nYou can view it in stats."
            ],
            need: [[9, 3], [1, 2]],
            reward: [1, 1],
            scalingOld: [
                [[9000, 15000, 22000, 30000, 40000, 60000, 80000], [1, 2, 3, 4, 5, 6, 8]],
                [[100, 150, 200, 250, 300], [1, 2, 3, 4, 5]]
            ],
            unlock: [3, 5]
        }, { //Stage 5
            name: [
                'Light in the dark',
                'Greatest of the walls'
            ],
            needText: [
                () => `Have self-made Stars count reach at least ${Limit(global.milestonesInfo[5].need[0]).format()}.`,
                () => `Have ${Limit(global.milestonesInfo[5].need[1]).format()} Galaxies or more.`
            ],
            rewardText: [
                'Intergalactic is always unlocked with Interstellar.',
                "Unknown Structure, it doesn't belong to this Universe.\nYou can view it in stats."
            ],
            need: [[1.2, 3], [1, 0]],
            reward: [5, 25],
            scalingOld: [
                [[1200, 1400, 1600, 1800, 2000, 2200, 2400], [5, 5, 10, 10, 20, 20, 50]],
                [[1, 2, 4, 8, 12, 16, 20, 24], [25, 25, 50, 50, 100, 100, 200, 0]]
            ],
            unlock: [4, 8]
        }
    ],
    historyStorage: {
        stage: []
    }
};

//Not for deep copy. Actual type is any[], it's because TS is dumb
export const cloneArray = <ArrayClone extends Array<number | string | boolean | null | undefined>>(array: ArrayClone) => array.slice(0) as ArrayClone; //[...array] is better when >10000 keys

//For non deep clone use { ...object } or cloneArray when possible
export const deepClone = <CloneType>(toClone: CloneType): CloneType => {
    if (typeof toClone !== 'object' || toClone === null) { return toClone; }

    let value: any;
    if (Array.isArray(toClone)) {
        value = []; //Faster this way
        for (let i = 0; i < toClone.length; i++) { value.push(deepClone(toClone[i])); }
    } else {
        value = {};
        for (const check in toClone) { value[check] = deepClone(toClone[check]); }
    }
    return value;
};

const createArray = (amount: number, type: 'toggle' | 'toggleAuto' | 'upgrade') => {
    const array = [];
    for (let i = 0; i < amount; i++) {
        if (type === 'toggle') {
            array.push(true);
        } else if (type === 'toggleAuto') {
            array.push(false);
        } else if (type === 'upgrade') {
            array.push(0);
        }
    }
    return array;
};

for (let s = 0; s < global.buildingsInfo.startCost.length; s++) {
    global.buildingsInfo.firstCost[s] = cloneArray(global.buildingsInfo.startCost[s]);
}
global.researchesAutoInfo.cost = cloneArray(global.researchesAutoInfo.startCost);
for (const upgradeType of ['researches', 'researchesExtra', 'strangeness'] as const) {
    const pointer = global[`${upgradeType}Info`];
    for (let s = 1; s < pointer.length; s++) {
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
Object.assign(player.toggles, { //Done separately to keep 'shop'
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

export const updatePlayer = (load: playerType): string => {
    if (Object.hasOwn(load, 'player')) { load = load['player' as keyof unknown]; } //Old save had it

    for (const key in playerStart) {
        if (!Object.hasOwn(load, key)) {
            if (key === 'discharge') {
                throw new ReferenceError('This save file is missing important information and is most likely not from this game');
            } else if (key !== 'version') {
                load[key as 'ASR'] = deepClone(playerStart[key as 'ASR']);
            } else { load.version = '0.0.0'; }
        }
    }

    const oldVersion = load.version;
    if (oldVersion !== playerStart.version) {
        if (load.version === '0.0.0') {
            load.version = 'v0.0.1';
            if (Object.hasOwn(load, 'energy')) { load.discharge.energy = load['energy' as 'discharge']['current' as 'energy']; }
        }
        if (load.version === 'v0.0.1') {
            load.version = 'v0.0.2';
            load.stage.resets = load.stage.current - 1;
        }
        if (load.version === 'v0.0.2') {
            load.version = 'v0.0.3';
            load.toggles = deepClone(playerStart.toggles);
        }
        if (load.version === 'v0.0.3') {
            load.version = 'v0.0.4';
            delete load['energy' as keyof unknown];
            delete load['buyToggle' as keyof unknown];
        }
        if (load.version === 'v0.0.4' || load.version === 'v0.0.5') {
            load.version = 'v0.0.6';
            load.events = [false];
        }
        if (load.version === 'v0.0.6') {
            load.version = 'v0.0.7';
            load.vaporization.input = 10;
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
            const oldB = load.buildings as unknown as playerType['buildings'][0];
            load.buildings = deepClone(playerStart.buildings);
            load.buildings[a] = oldB;
            const oldU = load.upgrades as unknown as playerType['upgrades'][0];
            load.upgrades = deepClone(playerStart.upgrades);
            load.upgrades[a] = oldU;
            const oldR = load.researches as unknown as playerType['researches'][0];
            load.researches = deepClone(playerStart.researches);
            load.researches[a] = oldR;
            const oldE = load.researchesExtra as unknown as playerType['researchesExtra'][0];
            load.researchesExtra = deepClone(playerStart.researchesExtra);
            load.researchesExtra[a] = oldE;
            if (load.strangeness.length < 5) { load.strangeness.unshift([]); }
            load.stage.export *= 86400;
            load.ASR[a] = load.researchesAuto.splice(1, 1)[0];
        }
        if (load.version === 'v0.0.9') {
            load.version = 'v0.1.0';
            if (load.upgrades[3].length < 13) { load.upgrades[3].splice(8, 0, 0); }
            load.collapse.show = [];
        }
        if (load.version === 'v0.1.0') {
            load.version = 'v0.1.1';
            if (Object.hasOwn(load.discharge, 'energyCur')) { load.discharge.energy = load.discharge['energyCur' as 'energy']; }
            delete load.discharge['energyCur' as keyof unknown];
            load.collapse.massMax = load.collapse.mass;
        }
        if (load.version === 'v0.1.1') {
            load.version = 'v0.1.2';
            for (let s = 1; s < load.buildings.length; s++) {
                for (let i = 0; i < load.buildings[s].length; i++) {
                    load.buildings[s][i].current = Limit(load.buildings[s][i].current).toArray();
                    load.buildings[s][i].total = Limit(load.buildings[s][i].total).toArray();
                    load.buildings[s][i].trueTotal = Limit(load.buildings[s][i].total).toArray(); //Intentional
                    load.buildings[s][i].highest = [0, 0];
                }
            }
            load.discharge.unlock = load.stage.current === 1 && load.discharge.energy >= 9;
            load.vaporization.clouds = Limit(load.vaporization.clouds).toArray();
            load.collapse.elementsMax = cloneArray(load.buildings[4][0].current);
            if (Object.hasOwn(load.strange[0], 'true')) { load.strange[0].current = load.strange[0]['true' as 'current']; }
            if (load.upgrades[1].length < 10) { load.upgrades[1].unshift(0, 0); }
            delete load.vaporization['current' as keyof unknown];
            delete load.strange[0]['true' as keyof unknown];
            load.time.offline = 0;
        }
        if (load.version === 'v0.1.2') {
            load.version = 'v0.1.3';
            load.stage.best = 0;
            load.stage.time = 0;
            load.inflation.age = 0;
            load.accretion.input = 600;
            load.discharge.energyMax = load.discharge.energy;
            load.vaporization.cloudsMax = cloneArray(load.vaporization.clouds);
        }
        if (load.version === 'v0.1.3') {
            load.version = 'v0.1.4';
            load.collapse.input = [4, 2];
            delete load.collapse['disabled' as keyof unknown];
            delete load.collapse['inputM' as keyof unknown];
            delete load.collapse['inputS' as keyof unknown];
            if (!load.inflation.vacuum) { //After enough time or versions can be removed
                if (load.strangeness[5] === undefined) { load.strangeness[5] = [0]; }
                for (let s = 1 + load.strangeness[5][0]; s <= (load.stage.current === 5 ? 4 : 5); s++) {
                    if (Math.min(load.stage.current, 4) === s) { continue; }
                    load.buildings[s] = deepClone(playerStart.buildings[s]);
                    load.upgrades[s] = cloneArray(playerStart.upgrades[s]);
                    load.researches[s] = cloneArray(playerStart.researches[s]);
                    load.researchesExtra[s] = cloneArray(playerStart.researchesExtra[s]);
                    if (s !== 5) { load.ASR[s] = 0; }

                    if (s === 1) {
                        load.buildings[1][0].current = [3, 0];
                        load.discharge.energy = 0;
                        load.discharge.current = 0;
                    } else if (s === 2) {
                        load.buildings[2][0].current = [2.8, -3];
                        load.vaporization.clouds = [1, 0];
                    } else if (s === 3) {
                        load.buildings[3][0].current = [1, -19];
                        load.accretion.rank = 1;
                    } else if (s === 4) {
                        load.buildings[4][0].current = [1, 0];
                        load.collapse.mass = 0.01235;
                        load.collapse.stars = [0, 0, 0];
                        load.elements = cloneArray(playerStart.elements);
                    }
                }
            }
        }
        if (load.version === 'v0.1.4') {
            load.version = 'v0.1.5';
            load.time.disabled = 0;
            delete load.toggles.shop['strict' as keyof unknown];
        }

        if (load.version !== playerStart.version) {
            throw new ReferenceError('Save file version is higher than game version');
        }
    }

    for (let s = 1; s < playerStart.buildings.length; s++) {
        if (!Array.isArray(load.buildings[s])) {
            load.buildings[s] = deepClone(playerStart.buildings[s]);
        } else {
            for (let i = load.buildings[s].length; i < playerStart.buildings[s].length; i++) {
                load.buildings[s][i] = deepClone(playerStart.buildings[s][i]);
            }
        }
    }
    for (let i = load.strange.length; i < playerStart.strange.length; i++) {
        load.strange[i] = deepClone(playerStart.strange[i]);
    }

    for (let s = 1; s < playerStart.upgrades.length; s++) {
        if (!Array.isArray(load.upgrades[s])) {
            load.upgrades[s] = cloneArray(playerStart.upgrades[s]);
        } else {
            for (let i = load.upgrades[s].length; i < playerStart.upgrades[s].length; i++) {
                load.upgrades[s][i] = 0;
            }
        }
    }
    for (let s = 1; s < playerStart.researches.length; s++) {
        if (!Array.isArray(load.researches[s])) {
            load.researches[s] = cloneArray(playerStart.researches[s]);
        } else {
            for (let i = load.researches[s].length; i < playerStart.researches[s].length; i++) {
                load.researches[s][i] = 0;
            }
        }
    }
    for (let s = 1; s < playerStart.researchesExtra.length; s++) {
        if (!Array.isArray(load.researchesExtra[s])) {
            load.researchesExtra[s] = cloneArray(playerStart.researchesExtra[s]);
        } else {
            for (let i = load.researchesExtra[s].length; i < playerStart.researchesExtra[s].length; i++) {
                load.researchesExtra[s][i] = 0;
            }
        }
    }
    for (let i = load.researchesAuto.length; i < playerStart.researchesAuto.length; i++) {
        load.researchesAuto[i] = 0;
    }
    for (let i = load.ASR.length; i < playerStart.ASR.length; i++) {
        load.ASR[i] = 0;
    }
    for (let i = load.elements.length; i < playerStart.elements.length; i++) {
        load.elements[i] = 0;
    }
    for (let s = 0; s < playerStart.strangeness.length; s++) {
        if (!Array.isArray(load.strangeness[s])) {
            load.strangeness[s] = cloneArray(playerStart.strangeness[s]);
        } else {
            for (let i = load.strangeness[s].length; i < playerStart.strangeness[s].length; i++) {
                load.strangeness[s][i] = 0;
            }
        }
    }
    for (let s = 0; s < playerStart.milestones.length; s++) {
        if (!Array.isArray(load.milestones[s])) {
            load.milestones[s] = cloneArray(playerStart.milestones[s]);
        } else {
            for (let i = load.milestones[s].length; i < playerStart.milestones[s].length; i++) {
                load.milestones[s][i] = 0;
            }
        }
    }

    for (let s = 1; s < playerStart.toggles.buildings.length; s++) {
        if (!Array.isArray(load.toggles.buildings[s])) {
            load.toggles.buildings[s] = cloneArray(playerStart.toggles.buildings[s]);
        } else {
            for (let i = load.toggles.buildings[s].length; i < playerStart.toggles.buildings[s].length; i++) {
                load.toggles.buildings[s][i] = false;
            }

            /* Temporary */
            if (load.toggles.buildings[s].length > playerStart.toggles.buildings[s].length) {
                notify(`Bug in save file detected and fixed:\n${global.stageInfo.word[s]} Stage had ${load.toggles.buildings[s].length - playerStart.toggles.buildings[s].length} extra toggles\nDo not press Shift + Number that is bigger than Structure count for current Active Stage\n(will be properly fixed way later)`);
                load.toggles.buildings[s].length = playerStart.toggles.buildings[s].length;
            }
        }
    }
    for (let i = load.toggles.normal.length; i < playerStart.toggles.normal.length; i++) {
        load.toggles.normal[i] = playerStart.toggles.normal[i];
    }
    for (let i = load.toggles.auto.length; i < playerStart.toggles.auto.length; i++) {
        load.toggles.auto[i] = false;
    }

    for (let i = load.events.length; i < playerStart.events.length; i++) {
        load.events[i] = false;
    }

    Object.assign(player, load);

    /* Prepare fake save file data */
    prepareVacuum();

    const stars = player.buildings[4];
    global.collapseInfo.trueStars = stars[1].true + stars[2].true + stars[3].true + stars[4].true + stars[5].true;
    global.accretionInfo.rankCost[4] = player.stage.true < 3 || (player.stage.true === 3 && !player.events[0]) ? 0 : 5e29;
    global.historyStorage.stage = player.history.stage.list;

    for (let s = 1; s < playerStart.milestones.length; s++) {
        for (let i = 0; i < playerStart.milestones[s].length; i++) {
            calculateMilestoneInformation(i, s);
        }
    }
    for (let s = 1; s < playerStart.strangeness.length; s++) {
        const strangeness = player.strangeness[s];
        const strangenessMax = global.strangenessInfo[s].max;
        for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) {
            calculateMaxLevel(i, s, 'strangeness');
            if (strangeness[i] > strangenessMax[i]) {
                strangeness[i] = strangenessMax[i];
                visualUpdateResearches(i, s, 'strangeness');
                console.warn(`Strangeness (${i + 1} of ${s}) level reduced`);
            }
        }
    }
    const auto = player.researchesAuto;
    const { max: autoMax, autoStage } = global.researchesAutoInfo;
    for (let i = 0; i < playerStart.researchesAuto.length; i++) {
        calculateMaxLevel(i, autoStage[i], 'researchesAuto');
        if (auto[i] > autoMax[i]) {
            auto[i] = autoMax[i];
            visualUpdateResearches(i, autoStage[i], 'researchesAuto');
            console.warn(`Automatization research (${i + 1}) level reduced`);
        }
    }
    for (let s = 1; s <= 5; s++) {
        calculateMaxLevel(0, s, 'ASR');
        const extra = player.researchesExtra[s];
        const extraMax = global.researchesExtraInfo[s].max;
        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) {
            calculateMaxLevel(i, s, 'researchesExtra');
            if (extra[i] > extraMax[i]) {
                extra[i] = extraMax[i];
                console.warn(`Special research (${i + 1} of ${s}) level reduced`);
            }
        }
        const researches = player.researches[s];
        const researchesMax = global.researchesInfo[s].max;
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) {
            calculateMaxLevel(i, s, 'researches');
            if (researches[i] > researchesMax[i]) {
                researches[i] = researchesMax[i];
                console.warn(`Stage research (${i + 1} of ${s}) level reduced`);
            }
        }
    }

    assignNewMassCap();
    return oldVersion;
};

export const buildVersionInfo = () => {
    if (global.versionBuild) { return; }

    const changeVersion = (version: string) => {
        let text = '';
        switch (version) {
            case 'v0.0.1':
                text = '- Stage 2 full rework\n- Introduced automatic changelog\n- Auto Structures do not wait for 2x cost if making the 1st one\n\n';
                text += '- Mobile device support\n\n';
                text += '- Tritium now shows how much Molecules being produced per second\n- Upgrades auto update description';
                break;
            case 'v0.0.2':
                text = '- Added stats subtab\n- Added Stage resets into save file';
                break;
            case 'v0.0.3':
                text = '- Added new content (Stage 3)\n- Stage 2 extended\n- Max offline time base and from research is now 2 times longer\n- Offline time calculated better\n- Toggles have been reset due to change in the way they are saved\n- Researches auto update description\n- Some new stats';
                break;
            case 'v0.0.4':
                text = '- Buffed all Stages\n- Added events for early Stages\n- Update to stats visuals\n- Intervals have been reset due to change in save file saving\n\n';
                text += '- Numbers are now formated\n\n';
                text += '- New stat for Stage 3';
                break;
            case 'v0.0.5':
                text = '- New content (Stage 4)\n- Basic loading screen\n- Full visual update\n- New formula for multi making Structures\n- Visual indication for how many Structures can be made\n\n';
                text += '- Created Elements will show effects, even after Collapse\n- Improved transition when changing themes\n- Fixed being able to create automatization research when can\'t afford them\n\n';
                text += '- Added hotkeys\n- Stage event reset due to small changes';
                break;
            case 'v0.0.6':
                text = '- List of hotkeys can be seen now\n\n';
                text += '- Option to remove text movement\n- Ability to rename save file';
                break;
            case 'v0.0.7':
                text = '- New content (Stage 5)\n- Stage 1 rework\n- Self-made Structures stat moved into Stage tab\n- Hotkeys for Resets\n- Pressing keyboard (unless tab) no longer highlights buttons\n- Removed old number format (it was painfully slow) in favor of self-made one\n\n';
                text += '- Numpad can now be used as digits for hotkeys\n\n';
                text += '- Save file name can now display in game stats';
                break;
            case 'v0.0.8':
                text = '- Minor speed up to almost all Stages (not first one)';
                break;
            case 'v0.0.9':
                text = '- New content (Milestones)\n- Stage 4 speed up\n- Fixed export reward not being saved into exported file\n- Auto Structures toggles have been reset\n\n';
                text += '- Fixed F1 - F12 buttons working as digits\n- Milestones are now unlocked instanly (with Stage 5)\n- New event that must be triggered to progress, for changing Active Stage for the first time\n\n';
                text += '- Max offline base and research is increased by 2 times, related Strangeness cost and max level have been balanced\n\n';
                text += '- Some quick balance changes for Stage 3 and 5';
                break;
            case 'v0.1.0':
                text = '- New content and balance for end of Stage 5\n- New stats for Stage 5';
                break;
            case 'v0.1.1':
                text = '- More balance for Stage 5\n- New stats for Stage 2 and 4, max energy no longer resets\n- New hotkeys to change Active Stage';
                break;
            case 'v0.1.2':
                text = '- New content (Vacuum)\n- Some descriptions have been expanded\n- Added self-made break infinity\n- Heavy optimization\n- Offline time been reworked\n- Added version window (removed automatic change log)\n- Removed option to remove text movement (always on now)\n\n';
                text += '- New color theme\n- Offline warp now unlocked instantly\n- New stats for Stage 4\n\n';
                text += '- Auto Structures now correctly spend currency';
                break;
            case 'v0.1.3':
                text = '- Puddles production base increased from 3 to 4, Clouds gain decreased by -1 (formula fix)\n- New stats for Stage 3, 4 and 5\n- More Stage 6 balance (Strangeness, reduced max level and adjusted cost; Submerged proper balance; Strange boost new effects)\n- Replay event button\n\n';
                text += '- History for Stage resets\n- New hotkeys (A - toggle all Structures, O - toggle Offline)\n\n';
                text += '- Added requirement to unlock better control over Warp (also Warp now has a minimum value)\n- Automatically made Structures/Upgrades no longer visually update numbers';
                break;
            case 'v0.1.4':
                text = '- Warps now waste offline (half of normal); Max offline from upgrades decreased, cost adjusted\n- Custom scrolls\n- Notifications\n- Fixed and updated special supports\n- Auto Collapse settings reset';
                break;
            case 'v0.1.5':
                text = "- Stage 6 minor balance changes\n-Images should no longer unload on Stage change\n- Footer now affects page height\n- Many small changes to improve quality of life\n- 'Any' make toggle is now always Strict, related button removed\n- More information for save files\n- New hotkeys\n- Small visual update\n- Screen reader support rework (also removed special tab)";
                text += '\n\nNew content is delayed due to planned rework for all Stages (because of endless complains about an idle game being slow)';
        }
        getId('versionText').textContent = text;
        getId('currentVesion').textContent = version;
    };

    const max = 15; //v0.2.4 -> 24
    let autoText = '';
    for (let i = 1; i <= max; i++) {
        const index = i < 10 ? `0${i}` : `${i}`;
        const version = `v0.${index[0]}.${index[1]}`;
        autoText += `<button id="${version}">${version}</button>`;
    }

    /* All related CSS is here, because I don't want it to be part of main HTML; also inserted rules with insertRule() gets auto deleted after some time... */
    getId('versionInfo').innerHTML = `<div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; width: clamp(42vw, 36em, 80vw); height: clamp(26vh, 36em, 90vh); background-color: var(--window-color); border: 3px solid var(--window-border); border-radius: 12px; padding: 1em 1em 0.8em; row-gap: 1em;">
        <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 0.06em;">${autoText}</div>
        <div style="width: 100%; overflow-y: auto;">
            <label id="currentVesion" class="bigWord"></label>
            <p id="versionText" class="whiteText" style="white-space: pre-line; line-height: 1.3em; margin-top: 0.4em;"></p>
        </div>
        <button id="closeVersionInfo" style="width: 6em; border-radius: 4px; font-size: 0.92em;">Close</button>
    </div>`;
    document.head.appendChild(document.createElement('style')).textContent = '#versionInfo > div > div:first-of-type > button { width: 3.8em; height: 2em; font-size: 0.88em; }';
    getId('closeVersionInfo').addEventListener('click', () => { getId('versionInfo').style.display = 'none'; });
    for (let i = 1; i <= max; i++) {
        const index = i < 10 ? `0${i}` : `${i}`;
        const version = `v0.${index[0]}.${index[1]}`;
        getId(version).addEventListener('click', () => changeVersion(version));
    }
    changeVersion(playerStart.version);

    global.versionBuild = true;
};
