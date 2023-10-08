import Limit from './Limit';
import { getId } from './Main';
import { setTheme } from './Special';
import { assignEnergy, assignNewMassCap, assignStrangeBoost, calculateInstability, calculateMaxLevel, calculateMilestoneInformation, toggleBuy, toggleConfirm, toggleSwap } from './Stage';
import { globalType, overlimit, playerType } from './Types';
import { format, visualUpdateResearches } from './Update';
import { prepareVacuum } from './Vacuum';

export const player: playerType = { //Only for information that need to be saved (cannot be calculated)
    version: 'v0.1.6',
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
        input: 20
    },
    discharge: { //Stage 1
        energy: 0,
        energyMax: 0,
        current: 0
    },
    vaporization: { //Stage 2
        clouds: [0, 0],
        cloudsMax: [0, 0],
        input: 3
    },
    accretion: { //Stage 3
        rank: 0,
        input: 0
    },
    collapse: { //Stage 4, 5
        mass: 0.01235,
        massMax: 0.01235,
        elementsMax: [1, 0],
        stars: [0, 0, 0],
        show: 0,
        input: 2
    },
    inflation: { //Stage 6
        vacuum: false,
        age: 0
    },
    intervals: {
        main: 20,
        numbers: 80,
        visual: 1,
        autoSave: 60
    },
    time: {
        updated: Date.now(),
        started: Date.now(),
        offline: 0
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
        }, {
            current: 0,
            total: 0
        }
    ],
    /* Because I'm lazy to write 50+ 0's, all empty [] auto added */
    upgrades: [],
    researches: [],
    researchesExtra: [],
    ASR: [], //Auto Structures Research
    elements: [],
    strangeness: [],
    milestones: [],
    challenges: {
        active: -1,
        void: [0, 0, 0, 0, 0, 0]
    },
    toggles: {
        normal: [], //Auto added for every element with a class 'toggle'
        /* Offline auto use[0]; Hotkeys type[1]; Elements as tab[2] */
        confirm: [], //Class 'toggleConfirm'
        /* Stage[0]; Discharge[1]; Vaporization[2]; Rank[3]; Collapse[4] */
        buildings: [], //Class 'toggleBuilding' ([0] everywhere, is toggle all)
        auto: [], //Class 'toggleAuto'
        /* Stage[0], Discharge[1], Vaporization[2], Rank[3], Collapse[4],
           Upgrades[5], Researches[6], ResearchesExtra[7], Elements[8] */
        shop: {
            howMany: 1,
            input: 10,
            wait: [2]
        }
    },
    history: {
        stage: {
            best: [0, 1, 0],
            list: [],
            input: [5, 10]
        }
    },
    events: [false, false, false] //One time events, set in playEvent
};

export const global: globalType = { //For information that doesn't need to be saved
    tab: 'stage',
    subtab: {
        stageCurrent: 'Structures',
        settingsCurrent: 'Settings',
        researchCurrent: 'Researches',
        strangenessCurrent: 'Matter'
    },
    tabList: { //Order comes from footer
        tabs: ['stage', 'research', 'strangeness', 'settings'],
        stageSubtabs: ['Structures', 'Advanced'],
        settingsSubtabs: ['Settings', 'History', 'Stats'],
        researchSubtabs: ['Researches', 'Elements'],
        strangenessSubtabs: ['Matter', 'Milestones']
    },
    debug: {
        versionBuild: false,
        errorID: true, //Notify about missing ID
        errorQuery: true, //About incorect Query
        errorGain: true //About NaN or Infinity
    },
    lastActive: null,
    lastSave: 0,
    footer: true,
    mobileDevice: false,
    screenReader: [false, true], //[0] Enabled; No tabindex [1] on bought upgrades, [2] on main buttons
    automatization: { //Sorted cheapest first
        autoU: [ //Upgrades
            [],
            [],
            [],
            [],
            [],
            []
        ],
        autoR: [ //Researches
            [],
            [],
            [],
            [],
            [],
            []
        ],
        autoE: [ //Researches Extra
            [],
            [],
            [],
            [],
            [],
            []
        ],
        elements: []
    },
    theme: null,
    dischargeInfo: {
        getEnergy: (index: number, stageIndex: number) => {
            let value = global.dischargeInfo.energyType[stageIndex][index];
            if (stageIndex === 1 && index === 1) { value += player.strangeness[1][4] * (player.inflation.vacuum ? 2 : 1); }
            if (player.inflation.vacuum) {
                value += Math.floor(value / 100 * global.milestonesInfo[1].reward[1]);
                if (player.challenges.active === 0) { value -= Math.ceil(value / 5); }
            }
            return value;
        },
        energyType: [
            [],
            [0, 1, 3, 5, 10, 20],
            [0, 10, 20, 30, 40, 50, 60],
            [0, 10, 20, 40, 80, 100],
            [0, 100, 200, 300, 400, 500],
            [0, 500, 500, 2000]
        ],
        energyTrue: 0,
        bonus: 0,
        next: 1
    },
    vaporizationInfo: {
        effect2U2: () => 1e10 / 2 ** player.strangeness[2][3],
        oceanWorld: () => {
            if (Limit(player.vaporization.clouds).lessOrEqual('1')) { return 1; }
            return 1.02 ** (1 + Limit(player.vaporization.clouds).log(10).toNumber());
        },
        cloudEffect: (post = false) => {
            let effect = Limit(player.vaporization.clouds).plus('1').toArray();
            if (post) { effect = Limit(effect).plus(global.vaporizationInfo.get).toArray(); }

            if (Limit(effect).moreThan('1e4')) { effect = Limit(effect).minus('1e4').power(0.7).plus('1e4').toArray(); }
            return effect;
        },
        tension: 1,
        stress: 1,
        get: [0, 0]
    },
    accretionInfo: {
        effective: 0,
        rankU: [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 5], //Upgrades
        rankR: [1, 1, 2, 2, 3, 3, 3, 4, 5], //Researches
        rankE: [2, 3, 4, 5, 3], //Researches Extra
        rankCost: [5.97e27, 1e-7, 1e10, 1e24, 5e29, 2.47e31, 0],
        rankName: ['Ocean world', 'Cosmic dust', 'Meteoroid', 'Asteroid', 'Planet', 'Jovian planet', 'Protostar'],
        rankImage: ['Ocean%20world.png', 'Dust.png', 'Meteoroids.png', 'Asteroid.png', 'Planet.png', 'Giant.png', 'Protostar.png']
    },
    collapseInfo: {
        effect4RE1: () => (10 + player.researches[4][1]) / 10,
        unlockB: [0, 0.01235, 0.23, 10, 40, 1000], //Buildings (stage 4)
        unlockG: [0, 100, 1000], //Buildings (stage 5, first two)
        unlockU: [0.01235, 0.076, 1.3, 10], //Upgrades
        unlockR: [0.18, 0.3, 0.8, 1.3], //Researches
        newMass: 0,
        massEffect: (post = false) => {
            let minValue = 1;

            let effect = player.collapse.mass;
            if (post) {
                minValue = 0.5;
                if (global.collapseInfo.newMass > effect) { effect = global.collapseInfo.newMass; }
            }

            let power = 1;
            if (player.challenges.active === 0) {
                effect /= 10;
                power -= 0.2;
            }

            if (player.elements[21] >= minValue) { power += 0.1; }
            return effect ** (effect > 1 ? power : 2 - power);
        },
        starCheck: [0, 0, 0],
        starEffect: [
            (post = false) => {
                let minValue = 1;

                let effect = player.collapse.stars[0] + 1;
                if (post) {
                    minValue = 0.5;
                    effect += global.collapseInfo.starCheck[0];
                }

                if (player.elements[6] >= minValue) { effect **= global.elementsInfo.effect[6] as number; }
                return effect;
            },
            (post = false) => {
                let minValue = 1;

                let stars = player.collapse.stars[1];
                if (post) {
                    minValue = 0.5;
                    stars += global.collapseInfo.starCheck[1];
                    if (player.elements[22] >= minValue) { stars += global.collapseInfo.starCheck[0]; }
                }
                if (player.elements[22] >= minValue) { stars += player.collapse.stars[0]; }

                let effect = (stars + 1) ** (0.5 + player.strangeness[4][11] / 40);
                if (player.elements[12] >= minValue) { effect *= logAny(stars + (global.elementsInfo.effect[12] as number), global.elementsInfo.effect[12] as number); }
                return effect;
            },
            (post = false) => {
                let minValue = 1;

                let blackHoles = player.collapse.stars[2];
                if (post) {
                    minValue = 0.5;
                    blackHoles += global.collapseInfo.starCheck[2];
                }

                if (blackHoles < 1) { return 1; }
                return (blackHoles + 1) / logAny(blackHoles + 2, player.elements[18] >= minValue ? 3 : 2);
            }
        ],
        trueStars: 0
    },
    inflationInfo: {
        preonCap: [1, 14],
        dustCap: [8, 46],
        massCap: 60, //Seconds
        preonTrue: [0, 0],
        dustTrue: [0, 0]
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
            ['Stars', 'Nebulas', 'Star clusters', 'Galaxies']
        ],
        hoverText: [
            [],
            ['Mass', 'Preons', 'Quarks', 'Particles', 'Atoms'],
            ['Tritium', 'Drops', 'Puddles', 'Ponds', 'Lakes', 'Seas'],
            ['Preons hardcap', 'Cosmic dust', 'Planetesimals', 'Protoplanets', 'Satellites'],
            ['Elements', 'Elements', 'Elements', 'Elements', 'Elements'],
            ['Interstellar Stars', 'Interstellar Stars', 'Nebulas and Star clusters']
        ],
        type: [ //'Not allowed index x', means that this index is reserved for gain calculation
            [] as unknown as [''],
            ['', 'producing', 'producing', 'producing', 'producing', 'producing'], //Not allowed index 6 (for 'producing')
            ['', 'producing', 'producing', 'improving', 'improving', 'improving', 'improving'],
            ['', 'producing', 'producing', 'producing', 'improving', 'improving'],
            ['', 'producing', 'producing', 'producing', 'producing', 'producing'],
            ['', 'producing', 'improving', 'improving'] //Not allowed index 2, 3, 4 (for 'producing')
        ],
        firstCost: [],
        startCost: [
            [],
            [0, 0.005476, 6, 3, 24, 3],
            [0, 0.0028, 100, 1e7, 1e18, 1e23, 2.676e25],
            [0, 1e-19, 1e-9, 1e21, 1e17, 1e22],
            [0, 1, 1e5, 1e15, 1e28, 1e60],
            [0, 1e30, 1e40, 1e5]
        ],
        increase: [
            [],
            [0, 1.4, 1.4, 1.4, 1.4, 1.4],
            [0, 1.15, 1.2, 1.25, 1.35, 1.4, 1.45],
            [0, 1.15, 1.25, 1.35, 10, 10],
            [0, 1.4, 1.55, 1.70, 1.85, 2],
            [0, 4, 4, 1.11]
        ],
        producing: []
    },
    strangeInfo: {
        Element27: () => {
            let effect = Math.floor(Limit(player.collapse.elementsMax).max('1e50').log(10).toNumber() - 50);
            if (!player.inflation.vacuum && player.upgrades[5][2] === 1) { effect = Math.floor(effect ** 1.5); }
            return effect;
        },
        gain: (stage: number) => {
            const interstellar = stage >= 4 || player.inflation.vacuum;

            let gain = 1;
            if (interstellar && player.elements[27] === 1) { gain += global.strangeInfo.Element27(); }
            if (player.inflation.vacuum) {
                gain += player.strangeness[5][5] > 0 ? 4 : 3;
                gain *= global.milestonesInfo[5].reward[0];
                if (player.strangeness[2][10] >= 1) { gain *= global.vaporizationInfo.oceanWorld(); }
            } else { gain += global.strangeInfo.instability; }
            if (interstellar && player.strangeness[5][1] >= 1) { gain *= 2; }
            return Math.floor(gain);
        },
        name: ['Strange quarks', 'Strangelets'],
        stageBoost: [],
        instability: 0
    },
    upgradesInfo: [
        {} as globalType['upgradesInfo'][0], { //Stage 1
            name: [
                'Weak force',
                'Strong force',
                'Bigger electrons',
                'Stronger protons',
                'More neutrons',
                'Superposition',
                'Protium',
                'Deuterium',
                'Tritium',
                'Nuclear fusion'
            ],
            effectText: [
                () => 'Particles produce 5 times more Quarks.',
                () => 'Gluons now bind Quarks into Particles, which makes Particles 10 times cheaper.',
                () => `${player.inflation.vacuum ? 'Atoms' : 'Particle'} cost is 10 times cheaper.`,
                () => `${player.inflation.vacuum ? 'Atoms' : 'Particle'} produce 5 times more ${player.inflation.vacuum ? 'Particles' : 'Quarks'}.`,
                () => `${player.inflation.vacuum ? 'Molecules' : 'Atoms'} produce 5 times more ${player.inflation.vacuum ? 'Atoms' : 'Particles'}.`,
                () => `Ability to reset at any time, and if had enough Energy, then also will boost production for all Structures by ${format(global.upgradesInfo[1].effect[5] as number)}.\nTotal boost from goals: ${Limit(global.upgradesInfo[1].effect[5] as number).power(player.discharge.current + global.dischargeInfo.bonus).format()}.`,
                () => `Cost scaling is decreased by ${format(global.upgradesInfo[1].effect[6] as number)}.`,
                () => `Self-made structures boost themselves by ${format(global.upgradesInfo[1].effect[7] as number)} times.`,
                () => `Molecules produce Molecules. At a reduced rate.\n(${Limit(global.upgradesInfo[1].effect[8] as overlimit).format({ padding: true })} per second)`,
                () => `Unspent Energy boost Molecules production of themselves ${player.discharge.energy !== global.upgradesInfo[1].effect[9] ? `${format(player.discharge.energy / (global.upgradesInfo[1].effect[9] as number), { padding: true })} to 1. (Softcapped)\n(Actual boost is ${format(global.upgradesInfo[1].effect[9] as number, { padding: true })})` : '1 to 1.'}`
            ],
            effect: [],
            startCost: [36, 48, 60, 90, 150, 400, 2000, 4000, 20000, 70000],
            maxActive: 10
        }, { //Stage 2
            name: [
                'Molecules to Moles',
                'Water spread',
                'Vaporization',
                'Surface tension',
                'Surface stress',
                'Stream',
                'River',
                'Tsunami',
                'Tide'
            ],
            effectText: [
                () => `Drops will produce Moles ${format(1.04)} times faster for every self-made Drop.`,
                () => 'Spread water faster with every Puddle, weaker for non self-made ones.',
                () => `Gain ability to convert Drops into Clouds. (Puddles get a boost from Clouds)\nCurrent Cloud gain is (Drops / ${format(global.vaporizationInfo.effect2U2())})^${player.inflation.vacuum ? 0.4 : 0.6}.`,
                () => `Puddles get boost based on Moles ^${format(global.upgradesInfo[2].effect[3] as number)}.\n(Boost is equal to ${format(global.vaporizationInfo.tension, { padding: true })})`,
                () => `Puddles get boost based on Drops ^${format(global.upgradesInfo[2].effect[4] as number)}.\n(Boost is equal to ${format(global.vaporizationInfo.stress, { padding: true })})`,
                () => `Ponds now create extra Puddles. (${format(global.upgradesInfo[2].effect[5] as number)} extra Puddles per Pond)`,
                () => `Lakes now create extra Ponds. (${format(global.upgradesInfo[2].effect[6] as number)} extra Ponds per Lake)`,
                () => 'Spreads enough water to make each Sea create 1 extra Lake.',
                () => 'Spreads water too fast. 1 extra Sea per Ocean.'
            ],
            effect: [],
            startCost: [1e4, 1e6, 1e10, 1e3, 1e4, 2e9, 5e20, 1e28, 1e44],
            maxActive: 8
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
                () => `New substance for Accretion, will provide boost to Accretion speed based on current Dust quantity. (${format(global.upgradesInfo[3].effect[1] as number, { padding: true })} boost)`,
                () => 'Just a small meteoroid, but it will be a good base for what to come. (Unlock a new Structure and get 2x boost to Dust)',
                () => `Small bodies spontaneously concentrate into clumps. (Self-made Planetesimals boost each other by ${format(global.upgradesInfo[3].effect[3] as number, { digits: 3 })})`,
                () => 'Bodies are now massive enough to affect each other with gravity. (Unlock a new Structure and get 3x boost to Planetesimals)',
                () => 'Shattered pieces fall back together. Accretion speed increased by 3.',
                () => 'Unlock yet another Structure.',
                () => `Core melted, Accretion speed increased. (Mass production increased by ${format(global.upgradesInfo[3].effect[7] as number)})`,
                () => 'After reaching equilibrium, Protoplanets will boost themselfs, more with each self-made one.',
                () => 'Accretion speed increased again (because of drag and escape velocity), by 2.',
                () => `Accretion speed greatly increased by ${format(global.upgradesInfo[3].effect[10] as number)}.`,
                () => `Satellites scaling cost is now 2 times smaller.${player.strangeness[3][8] >= 1 ? '\nAlso unlock a new Structure.' : ''}`,
                () => 'Satellites effect scales better.'
            ],
            effect: [],
            startCost: [1e-16, 1e-13, 1e-13, 1, 1e14, 1e17, 1e22, 1e10, 1e22, 1e23, 1e9, 1e26, 1e29],
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
                () => `Fuse with Protium instead of Deuterium. Unlock ${player.stage.true >= 5 ? '5 first Elements' : 'a new upgrade type (Research tab)'}.`,
                () => `CNO cycle is now a better source of Helium and Energy. Unlock ${player.stage.true >= 5 ? '5 more Elements' : 'even more of that upgrade type'}.`,
                () => 'Through Triple-alpha and then Alpha process, unlock a few more Elements.'
            ],
            effect: [],
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
                () => player.inflation.vacuum ? `Boost per Galaxy increased by +1\nRequires ${format(1e6)} Solar mass` : `'[27] Cobalt' Element receives super boost of ^${format(1.5)}.`
            ],
            effect: [],
            startCost: [1e50, 1e60, 1e100],
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
                () => `Cost scaling is ${format(0.03)} smaller with each level.`,
                () => `Each self-made Structure, boost each other by additional ${format(0.01)}.`,
                () => `Molecules now produce themselves ${format(global.researchesInfo[1].effect[2] as number)} times quicker.`,
                () => 'Next goal for Discharge bonus scales by -2 less.',
                () => 'Discharge production boost from reached goals is now +1.',
                () => `Discharge will boost 'Tritium' upgrade for every reached goal. (Effect: ${format(global.researchesInfo[1].effect[5] as number)})`
            ],
            effect: [],
            cost: [],
            startCost: [2400, 6000, 24000, 30000, 24000, 30000],
            scaling: [400, 2000, 6000, 24000, 12000, 12000],
            max: [5, 4, 8, 2, 4, 3],
            maxActive: 6
        }, { //Stage 2
            name: [
                'Better Mole production',
                'Better Drop production',
                'Stronger surface tension',
                'Stronger surface stress',
                'More streams',
                'Distributary channel'
            ],
            effectText: [
                () => `Drops produce 3 times more Moles.${global.researchesInfo[2].effect[0] !== player.researches[2][0] ? `\nWeakened by recent ${player.inflation.vacuum ? 'reset' : 'Vaporization'}, effective level is ${format(global.researchesInfo[2].effect[0] as number)} (will be restored with more Drops)` : ''}`,
                () => `Puddles produce 2 times more Drops.${global.researchesInfo[2].effect[1] !== player.researches[2][1] ? `\nWeakened by recent ${player.inflation.vacuum ? 'reset' : 'Vaporization'}, effective level is ${format(global.researchesInfo[2].effect[1] as number)} (will be restored with more Drops)` : ''}`,
                () => `Surface tension upgrade is now +${format(0.005)} stronger.`,
                () => `Surface stress upgrade is now +${format(0.005)} stronger.`,
                () => 'With more streams, can have even more extra Puddles. (+1 extra Puddles per Pond)',
                () => 'Rivers can split now, that allows even more Ponds per Lake. (+1 per)'
            ],
            effect: [],
            cost: [],
            startCost: [10, 400, 1e4, 1e5, 1e14, 1e22],
            scaling: [1.36, 5, 1e3, 1e2, 1e3, 1e4],
            max: [8, 8, 4, 4, 2, 1],
            maxActive: 6
        }, { //Stage 3
            name: [
                'More massive bodies',
                'Adhesion',
                'Space weathering',
                'Inelastic collisions',
                'Destructive collisions',
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
                () => `Planetesimals when shatter replenish small grains quantity. 'Streaming instability' effect increased by +${format(0.005)}.`,
                () => 'Some Planetesimals instead of shattering form a contact binary or even trinary. Mass production increased by 3.',
                () => `Planetesimals attract other bodies with own gravity. Planetesimals get boost to production based on unspent Mass.\n(Total boost: ${Limit(global.researchesInfo[3].effect[6] as overlimit).format({ padding: true })})`,
                () => `'Magma Ocean' upgrade is stronger now. (${format(1.5)}x times)`,
                () => "Accretion speed for 'Pebble accretion' increased again, by 2."
            ],
            effect: [],
            cost: [],
            startCost: [1e-16, 1e-15, 1e-5, 1e2, 1e10, 1e11, 1e15, 1e14, 1e12],
            scaling: [11, 111, 22, 10, 100, 100, 10, 1e4, 1e3],
            max: [9, 3, 8, 8, 2, 2, 5, 4, 4],
            maxActive: 9
        }, { //Stage 4
            name: [
                'Planetary system',
                'Star system',
                'Protoplanetary disk',
                'Planetary nebula',
                'Gamma-ray burst'
            ],
            effectText: [
                () => `From Planetesimals to Planets, will get ${format(global.researchesInfo[4].effect[0] as number)}x boost to all Stars.`,
                () => `Each Star boost another Star. (Total to each Star is ${Limit(global.researchesInfo[4].effect[1] as overlimit).format({ padding: true })}x)`,
                () => "Improve effect of 'Planetary system', as well increases its max level by +3.",
                () => `Matter expelled from Red giants, this will boost Main-sequence stars by 4, as well boost all Stars by ${format(1.25)}.`,
                () => `An immensely energetic explosion that will boost all Stars by ${format(global.researchesInfo[4].effect[4] as number, { padding: true })}. (Effect is stronger with more Black holes)`
            ],
            effect: [],
            cost: [],
            startCost: [1e3, 5e4, 1e8, 2e10, 1e28],
            scaling: [10, 200, 1e12, 1, 2e8],
            max: [3, 2, 1, 1, 2],
            maxActive: 5
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
            effect: [],
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
                'Improved formula',
                'Accretion',
                'Later Preons',
                'Impulse'
            ],
            effectText: [
                () => "Mesons now binds Particles to form Atoms as well. Atoms are now affected by 'Strong force'.",
                () => `Improve scaling for 'Tritium' formula, current formula is log${format(global.researchesExtraInfo[1].effect[1] as number)}.`,
                () => 'First level is to begin the Accretion, second level is to Submerge it.\nAll Structures produce Energy on creation, as well Mass from all Stages is connected.',
                () => `Delay Preons hardcap by current Energy ^${format(global.researchesExtraInfo[1].effect[3] as number)}.\n(Effect is equal to ${format(player.discharge.energy ** (global.researchesExtraInfo[1].effect[3] as number), { padding: true })})`,
                () => `Discharge goals will now boost all Interstellar Stars, but at reduced base.\nCurrent base is ${format(global.researchesExtraInfo[1].effect[4] as number)}, total boost is ${Limit(global.researchesExtraInfo[1].effect[4] as number).power(player.discharge.current + global.dischargeInfo.bonus).format()}.`
            ],
            effect: [],
            cost: [],
            startCost: [12000, 54000, 16000, 24000, 140000],
            scaling: [0, 12000, 62000, 18000, 0],
            max: [1, 4, 2, 6, 1],
            maxActive: 0
        }, { //Stage 2
            name: [
                'Natural Vaporization',
                'Rain Clouds',
                'Storm Clouds',
                'Water Accretion'
                //'Jeans Mass'
            ],
            effectText: [
                () => 'When formed Clouds will use this reset produced Drops instead of current.',
                () => `Some Clouds will start pouring Drops themselves. This will produce Drops until a Puddle, afterwards it will boost Puddles.\n(Effect: ${format((global.researchesExtraInfo[2].effect[1] as number) - (player.buildings[2][2].current[0] === 0 ? 1 : 0), { padding: true })})`,
                () => `Improve 'Rain Clouds', and also boost Seas at a reduced rate. (Boost for Seas: ${format(global.researchesExtraInfo[2].effect[2] as number, { padding: true })})`,
                () => "Submerge and boost Stars with 'Surface tension' upgrade, also with 'Surface stress' at level 2."
                //() => "High density of Drops resulted in gravitational Collapse. 'Water Accretion' will now boost Nebulas."
            ],
            effect: [],
            cost: [],
            startCost: [1e18, 1e13, 1e26, 1e13],
            scaling: [1, 1, 1, 1e5],
            max: [1, 1, 1, 2],
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
                () => `Accretion speed is even quicker. Improved by effective Rank. (Total boost: ${format(global.researchesExtraInfo[3].effect[1] as number)})`,
                () => "'Gravitational field' upgrade will now boost Protoplanets at reduced strength. (2x boost)",
                () => "'Gas' upgrade is now a little stronger.",
                () => `'Efficient growth' will now boost Drops at reduced rate. (Current boost: ${format(global.researchesExtraInfo[3].effect[4] as number)})\nLevel 3 will also boost Puddles.`
            ],
            effect: [],
            cost: [],
            startCost: [1e-18, 1e-16, 1e26, 1e-6, 1e25],
            scaling: [10, 100, 1, 1e5, 1e3],
            max: [12, 5, 1, 8, 1],
            maxActive: 4
        }, { //Stage 4
            name: [
                'Nova',
                'Mass transfer',
                'White dwarfs'
            ],
            effectText: [
                () => 'This violent stellar explosion is main source of Elements, also starts new Star formations.\nUnlock new Structure and even more, after Collapse of that Structure.',
                () => `Star material transfers from one Star to another, ${player.inflation.vacuum ? 'delaying Preons hardcap' : 'improving Solar mass gain'} by ${format(global.collapseInfo.effect4RE1())}.\nAlso makes 'Star system' levels scale better.`,
                () => `Matter were dispeled from Red giant and White dwarf is all that remained, improves effects of '[6] Carbon' by +${format(0.5)} and '[28] Titanium' by ${format(1.5)}.`
            ],
            effect: [],
            cost: [],
            startCost: [4e4, 2e9, 1e50],
            scaling: [1e10, 1, 1],
            max: [3, 1, 1],
            maxActive: 3
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
    ASRInfo: { //Auto Structures Research
        cost: [0, 4000, 1e10, 1e-7, 1e6, 1],
        costRange: [ //Random scaling
            [],
            [4000, 10000, 16000, 24000, 32000],
            [1e10, 1e14, 1e18, 1e23, 1e29, 1e36],
            [1e-7, 1e10, 5e29, 2e30, 1e36],
            [1e6, 1e17, 1e28, 1e39, 1e72],
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
            () => `First metal, ${player.inflation.vacuum ? 'hardcap for Cosmic dust' : 'Solar mass gain'} per Brown dwarf lightly ${player.inflation.vacuum ? 'delayed' : 'increased'}.`,
            () => `Brittle earth metal, so is brittle increase to production. (${format(1.2)}x to all Stars)`,
            () => `A new color, and a new ${player.inflation.vacuum ? 'delay to Cosmic dust hardcap' : 'boost to Solar mass gain'} that is based on current Dwarf Stars.`,
            () => `Base for organics, boost from Red giants is now increased to the power of ${format(global.elementsInfo.effect[6] as number)}.\nRed giants effect is now known - boost to all Main-sequence stars.`,
            () => "Most abundant uncombined Element in atmosphere of some Planets, also allows to have 2 extra levels of 'Star system'.",
            () => `An oxidizing agent, that will make everything Interstellar scale even slower. (${format(0.05)} less)`,
            () => "Highly toxic and reactive, +12 to max level of 'Planetary system'.",
            () => `A noble 2x ${player.inflation.vacuum ? 'delay to Preons hardcap' : 'boost to Solar mass gain'}.`,
            () => "Through leaching, get 1 extra level of 'Protoplanetary disk'.",
            () => `Stars are inside you, as well Neutrons stars strength is now increased by log${format(global.elementsInfo.effect[12] as number)}.\nNeutron stars effect is now known - boost to all Stars.`,
            () => `Has a great affinity towards Oxygen and to decrease cost for all Stars by ${format(1e3)}.`,
            () => `Just another tetravalent metalloid, and so is another ${format(1.4)}x boost to all Stars.`,
            () => `One of the Fundamentals of Life and to make all Stars ${player.inflation.vacuum ? 'delay Cosmic dust hardcap' : 'boost Solar mass gain'}.`,
            () => "From hot area, to increase max level of 'Star system' by 1.",
            () => "Extremely reactive to extend max level of 'Planetary system', by another 24 levels.",
            () => `Less noble, but Black holes effect scales better.\nBlack holes effect is now known - ${player.inflation.vacuum ? 'delay for Preon hardcap' : 'boost to Solar mass gain'}.`,
            () => "Don't forget about it and get a 2x boost to all Stars.",
            () => "Get stronger with 1 extra level of 'Star system'.",
            () => `A new color and a rare bonus of +^${format(0.1)} to Solar mass effect.`,
            () => 'New alloy allowing Red giants to be added into effective amount of Neutron stars.',
            () => `Catalyst for production of Elements. 'Gamma-ray burst' effect increased by Solar mass ^${format(0.1)}.\n(Effect is equal to ${format(player.collapse.mass ** 0.1, { padding: true })})`,
            () => `No corrosion, only boost to all Stars that is based on unspent Elements ^${format(global.elementsInfo.effect[24] as number)}.\n(Boost is equal to ${Limit(player.buildings[4][0].current).power(global.elementsInfo.effect[24] as number).format({ padding: true })})`,
            () => "Brittle Element, but not the bonus - 1 more level in 'Star system'.",
            () => `Any further fusion will be an endothermic process${player.inflation.vacuum ? '. Unlock a Stage reset.' : ', but what next?\nEnter Intergalactic space. (Can change active Stage from footer)'}`,
            () => `Combined and ready to increase Stage reset reward with every new reached digit of Elements past 50.\n(+${format(global.strangeInfo.Element27())} ${player.strangeness[5][10] >= 1 ? 'of a Strange value' : 'extra Strange quarks'})`,
            () => `Slow to react, but will still boost all Stars by ${format(global.elementsInfo.effect[28] as number)}.`
        ],
        effect: [],
        startCost: [
            0, 1000, 4000, 2e4, 1e5, 1e8, 1e10, 4e11, 8e12, 6e13,
            1e15, 1e20, 1e22, 1e24, 1.4e26, 1e28, 1e30, 1e32, 1e35, 2e36,
            1e39, 1e41, 2e42, 3e43, 4e44, 5e45, 1e48, 1e50, 1e52
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
                'Fundamental boost',
                'Conservation of Mass',
                'Conservation of Energy'
            ],
            effectText: [
                () => 'Base Discharge effect is now +1.',
                () => `Discharge goal scales slower. (-${format(0.5)})`,
                () => `Obtain +${format(0.5)} bonus Discharge goals.`,
                () => `Automatically Discharge upon creating an upgrade or reaching next goal.${player.strangeness[1][11] >= 1 ? "\nSecond level - reaching new goal with auto Discharge doesn't cause reset." : ''}`,
                () => `Gain more Energy from creating ${player.inflation.vacuum ? 'Preons, +2' : 'Particles, +1'}.`,
                () => "Research 'Improved Tritium' is now better. (+1)",
                () => `Always have auto for ${global.buildingsInfo.name[1][Math.min(player.strangeness[1][6] + 1, global.ASRInfo.max[1])]}.`,
                () => 'First level - improve control over auto Structures toggles.\nSecond level - improve control over consumption of Offline storage.',
                () => 'Unspend Strange quarks will boost this Stage. (Bonus goals)',
                () => `Minor boost of ${format(1.2)}x per level to all Microworld structures.`,
                () => 'No Mass will be lost when Creating Preons.',
                () => 'Energy is now directly based on current self-made amount of Structures.\nThis will also unlock better Reset automatization. (Also improve auto Discharge to not cause reset from upgrades)'
            ],
            cost: [],
            startCost: [2, 1, 4, 20, 2, 1, 2, 4, 40, 2, 18, 3000],
            scaling: [2.5, 3.5, 8, 300, 6, 2.8, 2, 4, 1, 1.8, 1, 1],
            max: [4, 4, 2, 1, 2, 4, 3, 2, 1, 6, 1, 1],
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
                'New Structure',
                'Ocean world',
                'Isolation'
            ],
            effectText: [
                () => `Mole production increased by ${format(1.5)}.`,
                () => `Puddles produce ${format(1.5)} times more.`,
                () => 'Increase max level for one of researches by +1.\nFinal level will instead unlock a new upgrade.',
                () => 'Decrease requirement per Cloud.',
                () => `Automatically Vaporize when reach enough boost from new Clouds.${player.strangeness[1][11] >= 1 ? '\nSecond level - auto Vaporization no longer resets anything. (Also improved to reset instanly)' : ''}`,
                () => `Always have auto for ${global.buildingsInfo.name[2][Math.min(player.strangeness[2][5] + 1, global.ASRInfo.max[2])]}.`,
                () => `Increase Offline storage capacity, +${player.stage.true >= 6 ? 8 : 4} hours per level.`,
                () => player.stage.true < 6 ? 'Offline storage is now 50% bigger. (Additive)' : 'Offline time being wasted less, -1 second per level.',
                () => 'Unspend Strange quarks will boost this Stage. (Puddle production)',
                () => 'Current Universe state allows for another Submerged Structure.', //'\nSecond level will improve spread of that Structure with a new upgrade.'
                () => `Increase ${global.strangeInfo.name[player.strangeness[5][10]]} gained from this Stage reset based on current Cloud amount.\n(Effect can be seen in stats)`,
                () => "Submerged is no longer affected by or affects non Microworld Stage reset types. (Requires level 1 of 'Conservation of Energy')"
            ],
            cost: [],
            startCost: [1, 2, 3, 4, 20, 2, 1, 4, 40, 40, 200, 4000],
            scaling: [1.8, 1.8, 3.4, 3.4, 500, 2, 2, 4, 1, 10, 1, 1],
            max: [6, 6, 3, 3, 1, 5, 4, 2, 1, 1, 1, 1],
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
                'Mass shift',
                'Massive Ranks'
            ],
            effectText: [
                () => `Accretion speed is ${format(1.5)} times faster.`,
                () => `Accretion Structures that produce another Structures now do it ${format(1.5)} times faster.`,
                () => 'Some Rank researches receive extra Max level.\nFinal level will instead unlock a new upgrade.',
                () => `Satellites now improve all Accretion Structures${player.inflation.vacuum ? ' with reduced strength' : ''}.`,
                () => `Automatically increase Rank when available.${player.strangeness[1][11] >= 1 ? '\nSecond level - will allow to reach Solar mass hardcap easier by making Accretion Structures only when cost is times of Solar mass hardcap. (If Cosmic dust is hardcapped)' : ''}`,
                () => `Always have auto for ${global.buildingsInfo.name[3][Math.min(player.strangeness[3][5] + 1, global.ASRInfo.max[3])]}.`,
                () => 'All upgrades/researches from any Stage will be created automatically.\n(Need to be enabled in settings, order of automatization is upgrades > researches > special researches)',
                () => `Unspend Strange quarks will boost this Stage. (${player.inflation.vacuum ? 'Effective Rank' : 'Cheaper Accretion'})`,
                () => 'Current Universe state allows for another Accretion Structure.',
                () => `Reduce amount of time required to reach Solar mass harcap by shifting Cosmic dust and Solar mass hardcaps.\nEffect is ${format(1.5)} times bigger per level (additive). (Can be reverted in Rank settings)`,
                () => `Increase effective Rank by +${format(0.8)} with each level.`
            ],
            cost: [],
            startCost: [1, 2, 6, 18, 20, 3, 10, 40, 20, 1800, 40],
            scaling: [1.8, 2.8, 2, 1, 200, 2.4, 3, 1, 1, 2, 4],
            max: [8, 4, 3, 1, 1, 4, 3, 1, 1, 4, 2],
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
                'New Structure',
                'Neutronium'
            ],
            effectText: [
                () => `All Stars produce ${format(1.5)} times more Elements.`,
                () => 'Stars are 2 times cheaper.',
                () => 'Unlock a new Upgrade.\nFirst one is extra good.',
                () => '10% of Brown dwarfs will turn into Red giants now.',
                () => `Elements will not require Collapse for activation.\n${player.stage.true >= 6 || player.events[2] ? 'Second level will unlock auto creation of Elements.' : '(Auto creation of Elements is not yet possible in Interstellar space)'}`,
                () => `Automatically Collapse once reached enough boost.${player.strangeness[1][11] >= 1 ? '\nSecond level - auto Collapse will not cause reset for Star remnants. (Also improved to check boost only from Solar mass)' : ''}`,
                () => `Always have auto for ${global.buildingsInfo.name[4][Math.min(player.strangeness[4][6] + 1, global.ASRInfo.max[4])]}.`,
                () => `Increase multiplier of ${global.strangeInfo.name[player.strangeness[5][10]]} gained from export per day by +1.${player.strangeness[5][10] >= 1 ? '' : " (Can claim only full one's)"}`,
                () => player.stage.true >= 6 ? 'Reward from Export is now increased by 5% of the best true Stage reset value.' : 'Export reward max storage is now 1 day longer.',
                () => 'Unspend Strange quarks will boost this Stage. (All Stars production)',
                () => 'Current Universe state allows for another Interstellar Structure.',
                () => "Improve Neutron Stars strength and improve scaling of '[12] Magnesium' effect."
            ],
            cost: [],
            startCost: [1, 3, 5, 5, 18, 20, 3, 4, 4, 40, 60, 1800],
            scaling: [1.8, 2.8, 3, 4, 5, 400, 2.4, 4, 1, 1, 1, 1.4],
            max: [8, 4, 3, 2, 1, 1, 4, 3, 1, 1, 1, 8],
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
                'New Milestones',
                'Strange boost',
                'Strange growth'
            ],
            effectText: [
                () => player.inflation.vacuum ? 'Unlock the Void. (Advanced subtab)\nAlso a new color theme.' : `Gain ability to be inside multiple Stages at once. (Next one to always be inside is ${global.stageInfo.word[player.strangeness[5][0] + 1]})\nPermanent Stages do not appear in history or reset timer.`,
                () => `Gain 2 times more ${global.strangeInfo.name[player.strangeness[5][10]]} from ${player.inflation.vacuum ? '' : 'Interstellar'} Stage resets.`,
                () => 'Allows to auto reset Stage, has some special settings.',
                () => "Bigger Nebulas, more matter for Accretion. 'Jeans instability' upgrade is 2 times stronger.",
                () => "'Super star cluster' is now even bigger. Effect increased by 3.",
                () => player.inflation.vacuum ? 'Unlock Intergalactic Stage.' : 'Intergalactic is no longer affected by Collapse reset.',
                () => `With this a new Structure can be created.${player.stage.true >= 6 ? '' : " (Also will increase max level of 'Remnants of past' after creating that Structure)"}\nSecond level unlocks auto for it and improves auto Collapse.`,
                () => "Increase permanent level of auto Structures. It's the only way to do it.",
                () => `Unlock ${player.inflation.vacuum ? 'Void' : 'Intergalactic'} Milestones.`,
                () => `Unspend Strange quarks will boost this Stage. (${player.inflation.vacuum ? 'Cosmic dust hardcap delay' : 'Solar mass gain'})`,
                () => `Unlock a new Strange structure and replace Stage reset reward, it will produce ${global.strangeInfo.name[player.strangeness[5][10]]}, but hardcaps easily.\n(Hardcap delayed by quantity of a higher tier Structure)`
            ],
            cost: [],
            startCost: [4, 12, 2000, 10, 10, 40, 1500, 60, 1500, 200, 800],
            scaling: [1, 1, 1, 1.7, 1.75, 1, 5, 2, 1, 1, 1],
            max: [3, 1, 1, 9, 9, 1, 2, 2, 1, 1, 1],
            maxActive: 10
        }
    ],
    lastUpgrade: [-1, -1, -1, -1, -1, -1], //One per subtab
    lastResearch: [[-1, 'researches'], [-1, 'researches'], [-1, 'researches'], [-1, 'researches'], [-1, 'researches'], [-1, 'researches']],
    lastElement: -1,
    milestonesInfo: [
        {} as globalType['milestonesInfo'][0], { //Stage 1
            name: [
                'Fundamental Matter',
                'Energized'
            ],
            needText: [
                () => `Discharge at least ${Limit(global.milestonesInfo[1].need[0]).format()} ${player.inflation.vacuum ? 'Preons' : 'Quarks'} at once.`,
                () => `Have current Energy reach ${Limit(global.milestonesInfo[1].need[1]).format()}.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `All Microworld Structures receive ${format(global.milestonesInfo[1].reward[0])}x boost.` : "Unknown Structure, it doesn't belong to this Universe, instability increased.",
                () => player.inflation.vacuum ? `Energy from creating Stuctures increased by ${format(global.milestonesInfo[1].reward[1])}%. (Rounds down)` : `Improve effect of '[24] Chromium' by +${format(0.01)}.`
            ],
            need: [[1, 200], [4, 4]],
            reward: [1, 1],
            scalingOld: [
                [1e160, 1e170, 1e180, 1e190, 1e200, 1e220],
                [24000, 26000, 28000, 30000, 32000, 34000]
            ]
        }, { //Stage 2
            name: [
                'A Nebula of Drops',
                'Just a bigger Puddle'
            ],
            needText: [
                () => `Vaporize ${player.inflation.vacuum ? 'to at least' : ''} ${Limit(global.milestonesInfo[2].need[0]).format()} ${player.inflation.vacuum ? 'Clouds' : 'Drops at once'}.`,
                () => `Have at least ${Limit(global.milestonesInfo[2].need[1]).format()} Puddles at same time.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `Clouds gain increased by ${format(global.milestonesInfo[2].reward[0])}.` : 'A new Intergalactic Structure.',
                () => player.inflation.vacuum ? `Puddles are now stronger by ${format(global.milestonesInfo[2].reward[1])}.` : "Unknown Structure, it doesn't belong to this Universe, instability increased."
            ],
            need: [[1, 30], [1.5, 3]],
            reward: [1, 1],
            scalingOld: [
                [1e30, 1e33, 1e36, 1e39, 1e42, 1e45],
                [1500, 3000, 4500, 6000, 7500, 9000]
            ]
        }, { //Stage 3
            name: [
                'Cluster of Mass',
                'Satellites of Satellites'
            ],
            needText: [
                () => `Have at least ${Limit(global.milestonesInfo[3].need[0]).format()} Mass at once.`,
                () => `Have more Satellites ${player.inflation.vacuum ? 'and Subsatellites' : ''} than ${Limit(global.milestonesInfo[3].need[1]).format()}.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `Accretion speed increased by ${format(global.milestonesInfo[3].reward[0])}.` : 'A new Intergalactic Structure.',
                () => player.inflation.vacuum ? `Improve effect of 'Planetary system' base by +${format(global.milestonesInfo[3].reward[1])}.` : "Unknown Structure, it doesn't belong to this Universe, instability increased."
            ],
            need: [[1, 30], [2.5, 1]],
            reward: [1, 1],
            scalingOld: [
                [1e30, 1e33, 1e36, 1e39, 1e42, 1e45, 1e48],
                [25, 35, 45, 55, 65, 75, 85]
            ]
        }, { //Stage 4
            name: [
                'Supermassive',
                'Biggest of all'
            ],
            needText: [
                () => `Collapse ${player.inflation.vacuum ? '' : 'to'} at least ${Limit(global.milestonesInfo[4].need[0]).format()} ${player.inflation.vacuum ? 'Elements' : 'Solar mass'}.`,
                () => `Collapse to ${Limit(global.milestonesInfo[4].need[1]).format()} Black holes or more.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `Stars produce ${format(global.milestonesInfo[4].reward[0])} times more Elements.` : 'New Intergalactic themed Strangenesses.',
                () => player.inflation.vacuum ? `Preons hardcap delayed by ${format(global.milestonesInfo[4].reward[1])}.` : "Unknown Structure, it doesn't belong to this Universe, instability increased."
            ],
            need: [[8, 3], [1, 2]],
            reward: [1, 1],
            scalingOld: [
                [8000, 10000, 12000, 14000, 16000, 18000, 20000, 22000],
                [100, 120, 140, 160, 180, 200, 220, 240]
            ]
        }, { //Stage 5
            name: [
                'Light in the dark',
                'End of Greatness'
            ],
            needText: [
                () => `Have self-made Stars count reach at least ${Limit(global.milestonesInfo[5].need[0]).format()}.`,
                () => `Have ${Limit(global.milestonesInfo[5].need[1]).format()} Galaxies or more.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `Increase ${global.strangeInfo.name[player.strangeness[5][10]]} income from Stage reset by ${format(global.milestonesInfo[5].reward[0])}.` : 'Intergalactic is always unlocked with Interstellar.',
                () => player.inflation.vacuum ? `Boost per Galaxy is now +${format(global.milestonesInfo[5].reward[1])} bigger.` : "Unknown Structure, it can't exist in false Vacuum, instability increased."
            ],
            need: [[1.5, 3], [2, 0]],
            reward: [5, 25],
            scalingOld: [
                [1500, 1600, 1700, 1800, 1900, 2000],
                [2, 4, 8, 12, 16, 20]
            ]
        }
    ],
    challengesInfo: {
        name: [
            'Void'
        ],
        description: [
            'Result of Vacuum Instabillity, investigate at your own will'
        ],
        effectText: [
            () => {
                const progress = player.challenges.void;
                if (progress[1] === 0) { return '<span class="orangeText">- Unknown, but maybe with more Energy</span>'; }
                let text = '<span class="orangeText">- Energy gain is decreased by 20%\n- Discharge base reduced</span>';
                if (progress[1] >= 3) { text += `\n\n<span class="blueText">- ${progress[2] > 0 ? `Effective Drops production count softcap no longer delayed by self-made amount and is stronger (^${format(0.2)} > ^${format(0.1)})\n- Puddles are 100 times weaker\n- 'Water spread' upgrade is weaker` : 'Unknown, but maybe if deeper'}</span>`; }
                if (progress[1] >= 2) { text += `\n\n<span class="grayText">- ${progress[3] > 0 ? `'Jovian planet' Rank softcap starts immediately (^${format(0.92)})\n- Softcap is stronger after reaching that Rank (^${format(0.84)})\n- Increasing Rank doesn't increase effective Rank` : 'Unknown, but maybe if more Mass'}</span>`; }
                if (progress[3] >= 5) { text += `\n\n<span class="darkorchidText">- ${progress[4] > 0 ? "Solar mass effect is 10 times weaker and scales slower\n- 'Star system' is weaker\n- Intergalactic Stage unlocked later" : 'Unknown, but maybe if long enough'}</span>`; }
                //if (progress[4] >= 5) { text += '\n\n<span class="cyanText">- Unknown, but maybe if far enough</span>'; }
                return text;
            }
        ],
        needText: [
            [
                [],
                ['Perform Discharge', "Get first level of 'Accretion'", "Get second level of 'Accretion'"],
                ['Have more than 1 Cloud', 'Have more than 1e4 Clouds'],
                ["Reach 'Meteoroid' Rank", "Reach 'Asteroid' Rank", "Reach 'Planet' Rank", "Reach 'Jovian planet' Rank", "Reach 'Protostar' Rank"],
                ['Cause the Collapse', 'Get first Red giant', 'Get first Neutron star', 'Get first Black hole'],
                []
            ]
        ],
        rewardText: [
            [
                [],
                ["'Fundamental boost' (Microworld)", "'Conservation of Mass' (Microworld)", "'Massive Ranks' (Accretion)"],
                ["'Ocean world' (Submerged)", "'Isolation' (Submerged)"],
                ['Multiple max level increases', 'Multiple max level increases', 'Multiple max level increases', 'Multiple max level increases', "'Strange growth' (Intergalactic)"],
                ["'New Milestones' (Intergalactic)", "'Conservation of Energy' (Microworld)", "'Neutronium' (Interstellar)", "'Mass shift' (Accretion)"],
                []
            ]
        ],
        color: [
            'darkviolet'
        ]
    },
    historyStorage: {
        stage: []
    }
};

//Math.log extension for any base
export const logAny = (number: number, base: number) => Math.log(number) / Math.log(base);

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

const createArray = (amount: number, type: 'toggle' | 'toggleAuto' | 'toggleConfirm' | 'upgrade') => {
    const array = [];
    for (let i = 0; i < amount; i++) {
        if (type === 'toggle') {
            array.push(true);
        } else if (type === 'toggleAuto') {
            array.push(false);
        } else if (type === 'toggleConfirm') {
            array.push('All');
        } else if (type === 'upgrade') {
            array.push(0);
        }
    }
    return array;
};

for (let s = 0; s < global.buildingsInfo.startCost.length; s++) {
    global.buildingsInfo.firstCost[s] = cloneArray(global.buildingsInfo.startCost[s]);
    global.buildingsInfo.producing[s] = [];
    for (let i = 0; i < global.buildingsInfo.startCost[s].length; i++) {
        global.buildingsInfo.producing[s].push([0, 0]);
    }
}
for (const upgradeType of ['researches', 'researchesExtra', 'strangeness'] as const) {
    const pointer = global[`${upgradeType}Info`];
    for (let s = 1; s < pointer.length; s++) {
        pointer[s].cost = cloneArray(pointer[s].startCost);
    }
}
for (const upgradeType of ['upgrades', 'researches', 'researchesExtra'] as const) {
    const pointer = global[`${upgradeType}Info`];
    for (let s = 1; s < pointer.length; s++) {
        for (let i = 0; i < pointer[s].name.length; i++) {
            pointer[s].effect[i] = null;
        }
    }
}
for (let i = 0; i < global.elementsInfo.name.length; i++) {
    global.elementsInfo.effect[i] = null;
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
    confirm: createArray(document.getElementsByClassName('toggleConfirm').length, 'toggleConfirm'),
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
player.toggles.normal[0] = false;

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
            load.researchesExtra = [];
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
            load.vaporization.input = 3;
            load.stage.input = 20;
        }
        if (load.version === 'v0.0.7') {
            load.version = 'v0.0.8';
            load.stage.export = 86400;
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
        }
        if (load.version === 'v0.0.9') {
            load.version = 'v0.1.0';
            if (load.upgrades[3].length < 13) { load.upgrades[3].splice(8, 0, 0); }
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
                const buildings = load.buildings[s];
                for (let i = 0; i < buildings.length; i++) {
                    buildings[i].current = Limit(buildings[i].current).toArray();
                    buildings[i].total = Limit(buildings[i].total).toArray();
                    buildings[i].trueTotal = Limit(buildings[i].total).toArray(); //Intentional
                    buildings[i].highest = [0, 0];
                }
            }
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
            load.accretion.input = 0;
            load.discharge.energyMax = load.discharge.energy;
            load.vaporization.cloudsMax = cloneArray(load.vaporization.clouds);
        }
        if (load.version === 'v0.1.3') {
            load.version = 'v0.1.4';
            delete load.collapse['disabled' as keyof unknown];
            delete load.collapse['inputM' as keyof unknown];
            delete load.collapse['inputS' as keyof unknown];
        }
        if (load.version === 'v0.1.4') {
            load.version = 'v0.1.5';
            delete load.toggles.shop['strict' as keyof unknown];
        }
        if (load.version === 'v0.1.5') {
            load.version = 'v0.1.6';
            load.collapse.show = 0;
            load.collapse.input = 2;
            load.toggles.shop.wait = [2];
            load.toggles.normal = cloneArray(playerStart.toggles.normal);
            load.toggles.confirm = cloneArray(playerStart.toggles.confirm);
            for (let s = 1; s < load.toggles.buildings.length; s++) {
                const newLength = playerStart.toggles.buildings[s].length;
                if (load.toggles.buildings[s].length > newLength) { load.toggles.buildings[s].length = newLength; }
            }
            load.history.stage.best[2] = 0;
            for (let i = 0; i < load.history.stage.list.length; i++) {
                load.history.stage.list[i][2] = 0;
            }
            delete load.time['disabled' as keyof unknown];
            delete load['researchesAuto' as keyof unknown];
            delete load.discharge['unlock' as keyof unknown];

            /* Can be removed eventually */
            load.vaporization.clouds = Limit(load.vaporization.clouds).minus('1').toArray();
            if (load.inflation.vacuum) {
                if (load.strangeness[3][9] > 0) {
                    load.strange[0].current += (4 ** load.strangeness[3][9] - 1) * 8;
                    load.strangeness[3][9] = 0;
                }
                if (load.strangeness[5][2] > 0) {
                    load.strange[0].current += 50;
                    load.strangeness[5][2] = 0;
                }
            }
            load.accretion.input = 0;
        }

        if (load.version !== playerStart.version) {
            throw new ReferenceError('Save file version is higher than game version');
        }
    }

    for (let s = 1; s < playerStart.buildings.length; s++) {
        if (isNaN(load.toggles.shop.wait[s])) { load.toggles.shop.wait[s] = 2; }
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
        }
    }
    for (let i = load.toggles.confirm.length; i < playerStart.toggles.confirm.length; i++) {
        load.toggles.confirm[i] = playerStart.toggles.confirm[i];
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

    global.debug.errorID = true;
    global.debug.errorQuery = true;
    global.debug.errorGain = true;

    global.researchesInfo[2].effect[0] = 0;
    global.researchesInfo[2].effect[1] = 0;
    global.accretionInfo.rankCost[4] = player.stage.true > 3 || (player.stage.true === 3 && player.events[0]) ? 5e29 : 0;
    const stars = player.buildings[4];
    global.collapseInfo.trueStars = stars[1].true + stars[2].true + stars[3].true + stars[4].true + stars[5].true;
    global.historyStorage.stage = player.history.stage.list;
    if (player.inflation.vacuum) {
        player.buildings[2][0].current = Limit(player.buildings[1][5].current).divide('6.02214076e23').toArray();
        player.buildings[3][0].current = Limit(player.buildings[1][0].current).multiply('1.78266192e-33').toArray();
    } else if (player.accretion.rank === 0) { player.buildings[3][0].current = [5.97, 27]; }

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
            }
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
            }
        }
        const researches = player.researches[s];
        const researchesMax = global.researchesInfo[s].max;
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) {
            calculateMaxLevel(i, s, 'researches');
            if (researches[i] > researchesMax[i]) {
                researches[i] = researchesMax[i];
            }
        }
    }

    assignStrangeBoost();
    assignEnergy();
    assignNewMassCap();
    if (!player.inflation.vacuum) { calculateInstability(); }

    /* Finish visuals */
    const theme = localStorage.getItem('theme');
    setTheme(theme === null ? null : Number(theme));

    (getId('saveFileNameInput') as HTMLInputElement).value = player.fileName;
    (getId('mainInterval') as HTMLInputElement).value = `${player.intervals.main}`;
    (getId('numbersInterval') as HTMLInputElement).value = `${player.intervals.numbers}`;
    (getId('visualInterval') as HTMLInputElement).value = `${player.intervals.visual}`;
    (getId('autoSaveInterval') as HTMLInputElement).value = `${player.intervals.autoSave}`;
    (getId('thousandSeparator') as HTMLInputElement).value = player.separator[0];
    (getId('decimalPoint') as HTMLInputElement).value = player.separator[1];
    (getId('stageInput') as HTMLInputElement).value = format(player.stage.input, { type: 'input' });
    (getId('vaporizationInput') as HTMLInputElement).value = format(player.vaporization.input, { type: 'input' });
    (getId('rankShiftInput') as HTMLInputElement).value = format(player.accretion.input, { type: 'input' });
    (getId('collapseStarsInput') as HTMLInputElement).value = format(player.collapse.input, { type: 'input' });
    (getId('stageResetsSave') as HTMLInputElement).value = `${player.history.stage.input[0]}`;
    (getId('stageResetsKeep') as HTMLInputElement).value = `${player.history.stage.input[1]}`;
    for (let i = 0; i < playerStart.toggles.normal.length; i++) { toggleSwap(i, 'normal'); }
    for (let i = 0; i < playerStart.toggles.confirm.length; i++) { toggleConfirm(i); }
    for (let i = 0; i < playerStart.toggles.auto.length; i++) { toggleSwap(i, 'auto'); }
    toggleBuy();

    return oldVersion;
};

export const buildVersionInfo = () => {
    if (global.debug.versionBuild) { return; }

    const changeVersion = (version: string) => {
        let text = '';
        switch (version) {
            case 'v0.0.1':
                text = '- Stage 2 full rework\n- Introduced automatic changelog\n- Auto Structures do not wait for 2x cost if making the 1st one\n\n';
                text += '- Mobile device support\n\n';
                text += "- 'Tritium' now shows how much Molecules being produced per second\n- Upgrades auto update description";
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
                text = '- New content (Vacuum)\n- Some descriptions have been expanded\n- Added self-made break infinity\n- Offline time been reworked\n- Added version window (removed automatic change log)\n- Removed option to remove text movement (always on now)\n\n';
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
                text = "- Stage 6 minor balance changes\n- Images should no longer unload on Stage change\n- Footer now affects page height\n- Many small changes to improve quality of life\n- 'Any' make toggle is now always Strict, related button removed\n- More information for save files\n- New hotkeys\n- Screen reader support rework (also removed special tab)";
                break;
            case 'v0.1.6':
                text = '- New content (Void)\n- Massive rebalance and reworks for all Stages\n- Auto Collapse reworked (also its settings reset)\n- Small changes to auto Vaporization\n- New input for Auto Structures wait value\n- New stats for Stage 1, 2 and 3\n- New notifications\n- Removed almost all Automatization researches (effects are unlocked in more direct ways now)\n- Export reward unlocked automatically for free\n- More quality of life improvements\n- Descriptions no longer reset when changing active Stage\n- More work on Mobile device and Screen reader supports\n- Some toggles were reset due to confirmation toggles rework';
        }
        getId('versionText').textContent = text;
        getId('currentVesion').textContent = version;
    };

    const max = 16; //v0.2.4 -> 24
    let autoText = '';
    for (let i = 1; i <= max; i++) {
        const index = `${i}`.padStart(2, '0');
        const version = `v0.${index[0]}.${index[1]}`;
        autoText += `<button type="button" id="${version}">${version}</button>`;
    }

    getId('versionInfo').innerHTML = `<div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; width: clamp(42vw, 36em, 80vw); height: clamp(26vh, 36em, 90vh); background-color: var(--window-color); border: 3px solid var(--window-border); border-radius: 12px; padding: 1em 1em 0.8em; row-gap: 1em;">
        <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 0.06em;">${autoText}</div>
        <div style="width: 100%; overflow-y: auto;">
            <label id="currentVesion" class="bigWord"></label>
            <p id="versionText" class="whiteText" style="white-space: pre-line; line-height: 1.3em; margin-top: 0.4em;"></p>
        </div>
        <button type="button" id="closeVersionInfo" style="width: 6em; border-radius: 4px; font-size: 0.92em;">Close</button>
    </div>`;
    document.head.appendChild(document.createElement('style')).textContent = '#versionInfo > div > div:first-of-type > button { width: 3.8em; height: 2em; font-size: 0.88em; }';
    getId('closeVersionInfo').addEventListener('click', () => { getId('versionInfo').style.display = 'none'; });
    for (let i = 1; i <= max; i++) {
        const index = `${i}`.padStart(2, '0');
        const version = `v0.${index[0]}.${index[1]}`;
        getId(version).addEventListener('click', () => changeVersion(version));
    }
    changeVersion(playerStart.version);

    global.debug.versionBuild = true;
};
