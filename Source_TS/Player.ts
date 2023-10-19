import Limit from './Limit';
import { getId } from './Main';
import { setTheme } from './Special';
import { assignEnergy, assignStrangeBoost, calculateInstability, calculateMaxLevel, calculateMilestoneInformation, assignPuddles, toggleBuy, toggleConfirm, toggleSwap, calculateEffects } from './Stage';
import type { globalType, playerType } from './Types';
import { format, visualUpdateResearches } from './Update';
import { prepareVacuum } from './Vacuum';

export const player: playerType = { //Only for information that need to be saved (cannot be calculated)
    version: 'v0.1.8',
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
        rank: 0
    },
    collapse: { //Stage 4, 5
        mass: 0.01235,
        massMax: 0.01235,
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
        visual: 1000,
        autoSave: 20000
    },
    time: {
        updated: Date.now(),
        started: Date.now(),
        offline: 0,
        online: 0,
        stage: 0,
        universe: 0
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
            { //Should be instead '2.77675342812811e-3'
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
    event: false
};

export const global: globalType = { //For information that doesn't need to be saved
    tab: 'stage',
    subtab: {
        stageCurrent: 'Structures',
        settingsCurrent: 'Settings',
        upgradeCurrent: 'Upgrades',
        strangenessCurrent: 'Matter'
    },
    tabList: { //Order comes from footer
        tabs: ['stage', 'upgrade', 'strangeness', 'settings'],
        stageSubtabs: ['Structures', 'Advanced'],
        settingsSubtabs: ['Settings', 'History', 'Stats'],
        upgradeSubtabs: ['Upgrades', 'Elements'],
        strangenessSubtabs: ['Matter', 'Milestones']
    },
    debug: {
        errorID: true, //Notify about missing ID
        errorQuery: true, //About incorect Query
        errorGain: true, //About NaN or Infinity
        rankUpdated: -1, //Rank number
        historyUpdatedS: false //History
    },
    trueActive: 1,
    lastSave: 0,
    footer: true,
    mobileDevice: false,
    screenReader: false,
    supportSettings: [true], //No tabindex on bought upgrades[0]
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
            [0, 400, 400, 1000]
        ],
        energyTrue: 0,
        tritium: [0, 0],
        base: 4,
        total: 0,
        next: 1
    },
    vaporizationInfo: {
        strength: [1, 0],
        dropsEff: [0, 0],
        tension: 1,
        stress: 1,
        research0: 0,
        research1: 0,
        get: [0, 0]
    },
    accretionInfo: {
        effective: 0,
        rankU: [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 5], //Upgrades
        rankR: [1, 1, 2, 2, 3, 3, 3, 4, 5], //Researches
        rankE: [2, 3, 4, 5, 3], //Researches Extra
        rankCost: [5.9722e27, 1e-7, 1e10, 1e24, 5e29, 2.45576045e31, 0],
        rankColor: ['blue', 'cyan', 'gray', 'gray', 'gray', 'darkviolet', 'orange'],
        rankName: ['Ocean world', 'Cosmic dust', 'Meteoroid', 'Asteroid', 'Planet', 'Jovian planet', 'Protostar'],
        rankImage: ['Ocean%20world.png', 'Dust.png', 'Meteoroids.png', 'Asteroid.png', 'Planet.png', 'Giant.png', 'Protostar.png']
    },
    collapseInfo: {
        massEffect: 1,
        starEffect: [1, 1, 1],
        unlockB: [0, 0.01235, 0.23, 10, 40, 1000], //Buildings (stage 4)
        unlockG: [0, 100, 1000, 1e5], //Buildings (stage 5)
        unlockU: [0.01235, 0.076, 1.3, 10], //Upgrades
        unlockR: [0.18, 0.3, 0.8, 1.3], //Researches
        newMass: 0,
        starCheck: [0, 0, 0],
        trueStars: 0
    },
    inflationInfo: {
        globalSpeed: 1,
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
        textColor: ['', 'cyan', 'blue', 'gray', 'orange', 'darkorchid', 'darkviolet'],
        buttonBorder: ['', 'darkcyan', '#386cc7', '#424242', '#a35700', '#8f004c', '#6c1ad1'],
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
        type: [
            [] as unknown as [''],
            ['', 'producing', 'producing', 'producing', 'producing', 'producing'], //Index 6 must not be 'producing'
            ['', 'producing', 'producing', 'improving', 'improving', 'improving', 'improving'],
            ['', 'producing', 'producing', 'producing', 'improving', 'improving'],
            ['', 'producing', 'producing', 'producing', 'producing', 'producing'],
            ['', 'producing', 'improving', 'improving'] //Index 2, 3, 4 must not be 'producing'
        ],
        firstCost: [],
        startCost: [
            [],
            [0, 0.005476, 6, 3, 24, 3],
            [0, 0.0028, 100, 1e7, 1e18, 1e23, 2.676e25],
            [0, 1e-19, 1e-9, 1e21, 1e17, 1e22],
            [0, 1, 1e5, 1e15, 1e28, 1e56],
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
        gain: (stage: number) => {
            const interstellar = stage >= 4 || player.inflation.vacuum;

            let gain = 1;
            if (interstellar && player.elements[27] === 1) { gain += calculateEffects.element27(); }
            if (player.inflation.vacuum) {
                gain += player.strangeness[5][5] >= 1 ? 4 : 3;
                if (player.strangeness[2][9] >= 1) { gain *= calculateEffects.S2Strange9(); }
            } else { gain += global.strangeInfo.instability; }
            if (interstellar) { gain *= 1.5 ** player.strangeness[5][1]; }
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
                () => `Ability to regain spent Energy and if had enough Energy will also boost production for all Structures by ${format(global.dischargeInfo.base)}.`,
                () => `Cost scaling is decreased by ${format(calculateEffects.S1Upgrade6() / 100)}.`,
                () => `Self-made Structures boost themselves by ${format(calculateEffects.S1Upgrade7())} times.`,
                () => 'Molecules produce Molecules. At a reduced rate.',
                () => { //[9]
                    const effect = calculateEffects.S1Upgrade9();
                    return `Unspent Energy boost Molecules production of themselves ${player.discharge.energy !== effect ? `${format(player.discharge.energy / effect, { padding: true })} to 1. (Softcapped)\n(Actual boost is ${format(effect, { padding: true })})` : '1 to 1.'}`;
                }
            ],
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
                () => `Spread water faster with every Puddle, weaker for non self-made ones.\n(Total effect is ${Limit(calculateEffects.S2Upgrade1()).format({ padding: true })})`,
                () => `Gain ability to convert Drops into Clouds. (Clouds boost Puddles, effect can be seen in Stats)\nCurrent Cloud gain is (Drops / ${format(calculateEffects.S2Upgrade2())})^${format(player.inflation.vacuum ? 0.4 : 0.6)}.`,
                () => `Puddles get boost based on Moles ^${format(calculateEffects.S2Upgrade3())}.\n(Boost is equal to ${format(global.vaporizationInfo.tension, { padding: true })})`,
                () => `Puddles get boost based on Drops ^${format(calculateEffects.S2Upgrade4())}.\n(Boost is equal to ${format(global.vaporizationInfo.stress, { padding: true })})`,
                () => `Ponds now create extra Puddles. (${format(calculateEffects.S2Upgrade5())} extra Puddles per Pond)`,
                () => `Lakes now create extra Ponds. (${format(calculateEffects.S2Upgrade6())} extra Ponds per Lake)`,
                () => 'Spreads enough water to make each Sea create 1 extra Lake.',
                () => 'Spreads water too fast. 1 extra Sea per Ocean.'
            ],
            startCost: [1e4, 1e6, 1e10, 1e3, 1e4, 2e9, 5e20, 1e28, 4e40],
            maxActive: 8
        }, { //Stage 3
            name: [
                'Brownian motion',
                'Gas',
                'Micrometeoroid',
                'Streaming instability',
                'Gravitational field',
                'Rubble pile',
                'Magma ocean',
                'Hydrostatic equilibrium',
                'Satellite system',
                'Atmosphere',
                'Pebble accretion',
                'Tidal force',
                'Ring system'
            ],
            effectText: [
                () => `Through random collisions every self-made Cosmic dust ${player.inflation.vacuum ? 'delays Preons hardcap even more' : 'speeds up Accretion speed'}. (By ${format(calculateEffects.S3Upgrade0())})`,
                () => { //[1]
                    const power = calculateEffects.S3Upgrade1();
                    return `New substance for Accretion, will provide ${player.inflation.vacuum ? 'delay to Preons hardcap' : 'boost to Accretion speed'} based on current Cosmic dust quantity ^${format(power)}.\n(Boost is equal to ${Limit(player.buildings[3][1].current).power(power).format({ padding: true })})`;
                },
                () => 'Just a small meteoroid, but it will be a good base for what to come. (Unlock a new Structure and get 2x boost to Cosmic dust)',
                () => `Small bodies spontaneously concentrate into clumps. (Self-made Planetesimals boost each other by ${format(calculateEffects.S3Upgrade3())})`,
                () => 'Bodies are now massive enough to affect each other with gravity. (Unlock a new Structure and get 3x boost to Planetesimals)',
                () => `Shattered pieces fall back together. ${player.inflation.vacuum ? 'Preons hardcap delay from Cosmic dust' : 'Accretion speed'} increased by 3.`,
                () => `Core melted, Accretion speed increased. (${player.inflation.vacuum ? 'Preons hardcap delay from Cosmic dust' : 'Mass production'} increased by ${format(2 * 1.5 ** player.researches[3][7])})`,
                () => `After reaching equilibrium self-made Protoplanets will boost each other by ${format(1.02)}.`,
                () => 'Unlock yet another Structure.',
                () => `${player.inflation.vacuum ? 'Preons hardcap delay from Cosmic dust' : 'Accretion speed'} increased again (because of drag and escape velocity), by 2.`,
                () => `${player.inflation.vacuum ? 'Preons hardcap delay from Cosmic dust' : 'Accretion speed'} greatly increased by ${8 * 2 ** player.researches[3][8]}.`,
                () => `Satellites cost scaling is now 2 times smaller.${player.strangeness[3][8] >= 1 ? '\nAlso unlock a new Structure.' : ''}`,
                () => 'Satellites effect scales better.'
            ],
            startCost: [1e-16, 1e-13, 1e-13, 1, 1e14, 1e17, 1e10, 1e22, 1e22, 1e23, 1e9, 1e26, 1e29],
            maxActive: 13
        }, { //Stage 4
            name: [
                'Gravitational Collapse',
                'Proton-proton chain',
                'Carbon-Nitrogen-Oxygen cycle',
                'Helium fusion'
            ],
            effectText: [
                () => 'As fuel runs out, every Star will boost production in its own special way.',
                () => `Fuse with Protium instead of Deuterium. Unlock ${player.stage.true >= 5 ? '5 first Elements' : 'a new Upgrade type (Upgrade tab)'}.`,
                () => `CNO cycle is now a better source of Helium and Energy. Unlock ${player.stage.true >= 5 ? '5 more Elements' : 'even more of that Upgrade type'}.`,
                () => 'Through Triple-alpha and then Alpha process will unlock 2 more Elements.'
            ],
            startCost: [100, 1000, 1e9, 1e48],
            maxActive: 4
        }, { //Stage 5
            name: [
                'Jeans instability',
                'Super Star cluster',
                'Quasar'
            ],
            effectText: [
                () => `Gravitational Collapse within Nebulas will increase speed for production of Stars by ${format(calculateEffects.S5Upgrade0())} times.`,
                () => `A very massive Star clusters, that will boost Stars by ${format(calculateEffects.S5Upgrade1())}.`,
                () => player.inflation.vacuum ? `Boost per Galaxy increased by +1.\nRequires ${format(1e6)} Solar mass.` : `'[27] Cobalt' Element receives super boost of ^${format(1.5)}.`
            ],
            startCost: [1e50, 1e60, 1e120],
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
                () => `Self-made Structures boost each other by additional ${format(0.01)}.`,
                () => `Molecules now produce themselves ${format(calculateEffects.S1Research2())} times quicker.`,
                () => 'Next goal for Discharge bonus scales by -2 less.',
                () => 'Discharge production boost from reached goals is now +1.',
                () => { //[5]
                    const power = calculateEffects.S1Research5();
                    return `Discharge will boost 'Tritium' Upgrade for every non bonus goal ^${format(power)}.\n(Total boost: ${format(player.discharge.current ** power)})`;
                }
            ],
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
                () => `Drops produce 3 times more Moles.${global.vaporizationInfo.research0 !== player.researches[2][0] ? `\nWeakened by recent ${player.inflation.vacuum ? 'reset' : 'Vaporization'}, effective level is ${format(global.vaporizationInfo.research0)} (will be increased after ${Limit(10 * 1.36 ** global.vaporizationInfo.research0).minus(player.buildings[2][1].total).format({ padding: true })} more Drops).` : ''}`,
                () => `Puddles produce 2 times more Drops.${global.vaporizationInfo.research1 !== player.researches[2][1] ? `\nWeakened by recent ${player.inflation.vacuum ? 'reset' : 'Vaporization'}, effective level is ${format(global.vaporizationInfo.research1)} (will be increased after ${Limit((5 ** (global.vaporizationInfo.research1 + 1) - 1) * 100).minus(player.buildings[2][1].total).format({ padding: true })} more Drops).` : ''}`,
                () => `Surface tension Upgrade is now +${format(0.005)} stronger.`,
                () => `Surface stress Upgrade is now +${format(0.005)} stronger.`,
                () => 'With more streams, can have even more extra Puddles. (+1 extra Puddles per Pond)',
                () => 'Rivers can split now, that allows even more Ponds per Lake. (+1 per)'
            ],
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
                () => `Cosmic dust ${player.inflation.vacuum ? 'will delay Preons hardcap' : 'production is increased'} by 3.`,
                () => `Cosmic dust particles cling to each other. (+${format(0.01)} to 'Brownian motion')`,
                () => 'Planetesimals produce more Cosmic dust. (3 times more)',
                () => `Slow encounter velocities will result in a more efficient growth, so this Research will make bodies lose more Energy from each deflection. ${player.inflation.vacuum ? 'Preons hardcap delay from Cosmic dust' : 'Mass production'} increased by 2.`,
                () => `Planetesimals when shatter replenish small grains quantity. 'Streaming instability' effect increased by +${format(0.005)}.`,
                () => `Some Planetesimals instead of shattering form a contact binary or even trinary. ${player.inflation.vacuum ? 'Preons hardcap delay from Cosmic dust' : 'Mass production'} increased by 3.`,
                () => { //[6]
                    const power = calculateEffects.S3Research6();
                    return `Planetesimals attract other bodies with own gravity. Planetesimals get boost to production based on unspent Mass ^${format(power)}.\n(Total boost: ${Limit(player.buildings[3][0].current).power(power).format({ padding: true })})`;
                },
                () => `'Magma Ocean' Upgrade is stronger now. (${format(1.5)}x times)`,
                () => `${player.inflation.vacuum ? 'Preons hardcap delay' : 'Accretion speed'} from 'Pebble accretion' increased again, by 2.`
            ],
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
                () => { //[0]
                    const base = calculateEffects.S4Research0();
                    return `From Planetesimals to Planets, will get ${format(base)}x boost to all Stars per level.\n(Total boost: ${format(base ** player.researches[4][0], { padding: true })})`;
                },
                () => { //[1]
                    const base = calculateEffects.S4Research1();
                    return `All Stars boost each other by ${format(base)}.\n(Total boost: ${Limit(base).power(global.collapseInfo.trueStars).format({ padding: true })})`;
                },
                () => "Improve effect scaling of 'Planetary system', as well increase its max level by +3.",
                () => `Matter expelled from Red giants, this will boost Main-sequence stars by 4, as well boost all Stars by ${format(1.25)}.`,
                () => `An immensely energetic explosion that will boost all Stars by ${format(calculateEffects.S4Research4(), { padding: true })}.\n(Effect is stronger with more Black holes${player.elements[23] === 1 ? ' and Solar mass' : ''})`
            ],
            cost: [],
            startCost: [1e3, 5e4, 1e8, 2e10, 1e28],
            scaling: [10, 200, 1e12, 5e44, 2e8],
            max: [3, 2, 1, 1, 2],
            maxActive: 5
        }, { //Stage 5
            name: [
                'Higher density',
                'Type frequency'
            ],
            effectText: [
                () => `Higher density of Nebulas, will allow them to produce higher tier of Stars, but each tier is 4 times slower than previous one. Also will boost Nebulas by 4.\nNext tier will be ${global.buildingsInfo.name[4][Math.min(player.researches[5][0] + 2, 4)]}.`,
                () => `More types of Stars are found within Star cluster. Increasing effect by 3, but also boosting lower tier of Stars. (3 times less than higher one)\nNext tier will be ${global.buildingsInfo.name[4][Math.max(3 - player.researches[5][1], 1)]}.`
            ],
            cost: [],
            startCost: [1e45, 1e50],
            scaling: [1e15, 1e15],
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
                () => "Mesons now binds Particles to form Atoms, which makes Atoms to be affected by 'Strong force'.\n(Atoms are 10 times cheaper)",
                () => `Improve scaling for 'Tritium' formula, current formula is log${format(calculateEffects.S1Extra1())}.`,
                () => 'First level is to begin the Accretion, second level is to Submerge it.\nAll Structures produce Energy on creation, as well Mass from all Stages is connected.',
                () => { //[3]
                    const power = calculateEffects.S1Extra3();
                    return `Delay Preons hardcap by current Energy ^${format(power)}.\n(Effect is equal to ${format(player.discharge.energy ** power, { padding: true })})`;
                },
                () => { //[4]
                    const base = calculateEffects.S1Extra4();
                    return `Discharge goals will now boost all Interstellar Stars, but at reduced base and without bonus Goals.\nCurrent base is ${format(base)}, total boost is ${Limit(base).power(player.discharge.current).format()}.`;
                }
            ],
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
            ],
            effectText: [
                () => 'When formed Clouds will use Drops produced this reset instead of current ones.',
                () => `Some Clouds will start pouring Drops themselves. This will produce Drops until a Puddle, afterwards it will boost Puddles.\n(Effect: ${format(calculateEffects.S2Extra1_2()[0] - (player.buildings[2][2].current[0] <= 0 ? 1 : 0), { padding: true })})`,
                () => `Improve 'Rain Clouds', and also boost Seas at a reduced rate. (Boost for Seas: ${format(calculateEffects.S2Extra1_2()[1], { padding: true })})`,
                () => `Submerge and boost Stars with 'Surface tension' Upgrade, also with 'Surface stress' at level 2.\n(Boost to Stars: ${format(global.vaporizationInfo.tension * (player.researchesExtra[2][3] >= 2 ? global.vaporizationInfo.stress : 1), { padding: true })})`
            ],
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
                () => `Cosmic dust ${player.inflation.vacuum ? 'will delay Preons hardcap' : 'production is increased'} by another ${format(1.1)}x per level.\n(Total increase: ${format(1.1 ** player.researchesExtra[3][0], { padding: true })})`,
                () => `${player.inflation.vacuum ? 'Preons hardcap delay from Cosmic dust is even bigger' : 'Accretion speed is even quicker'}. Improved by effective Rank. (Total boost: ${format(calculateEffects.S3Extra1() ** global.accretionInfo.effective)})`,
                () => "'Gravitational field' Upgrade will now boost Protoplanets at reduced strength. (2x boost)",
                () => "'Gas' Upgrade is now a little stronger.",
                () => `'Efficient growth' will now boost Puddles at reduced rate and without bonus Ranks. (Current boost: ${format(calculateEffects.S3Extra4(calculateEffects.S3Extra1() ** player.accretion.rank))})`
            ],
            cost: [],
            startCost: [1e-18, 1e-16, 1e26, 1e-6, 1e23],
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
                () => `Star material transfers from one Star to another, ${player.inflation.vacuum ? 'delaying Preons hardcap' : 'improving Solar mass gain'} by ${format(calculateEffects.S4Extra1())}.\nAlso makes 'Star system' levels scale better.`,
                () => `Matter were dispeled from Red giant and White dwarf is all that remained, improves effect of '[6] Carbon' by +${format(0.5)} and '[28] Nickel' by ${format(1.5)}. Also increase max level of 'Planetary nebula' by +1.`
            ],
            cost: [],
            startCost: [4e4, 2e9, 1e50],
            scaling: [1e10, 1, 1],
            max: [3, 1, 1],
            maxActive: 3
        }, { //Stage 5
            name: [],
            effectText: [],
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
            [1e10, 1e14, 1e18, 1e23, 1e28, 1e34],
            [1e-7, 1e10, 5e29, 2e30, 1e36],
            [1e6, 1e17, 1e28, 1e39, 1e61],
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
            () => `Base for organics, boost from Red giants is now increased to the power of ${format(calculateEffects.element6())}.\nRed giants effect is now known - boost to all Main-sequence stars.`,
            () => "Most abundant uncombined Element in atmosphere of some Planets, also allows to have 2 extra levels of 'Star system'.",
            () => `An oxidizing agent, that will make everything Interstellar scale even slower. (${format(0.05)} less)`,
            () => "Highly toxic and reactive, +12 to max level of 'Planetary system'.",
            () => `A noble 2x ${player.inflation.vacuum ? 'delay to Preons hardcap' : 'boost to Solar mass gain'}.`,
            () => "Through leaching, get 1 extra level of 'Protoplanetary disk'.",
            () => `Stars are inside you, as well Neutrons stars strength is now increased by log${format(calculateEffects.element12())}.\nNeutron stars effect is now known - boost to all Stars.`,
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
            () => { //[24]
                const power = calculateEffects.element24();
                return `No corrosion, only boost to all Stars that is based on unspent Elements ^${format(power)}.\n(Boost is equal to ${Limit(player.buildings[4][0].current).power(power).format({ padding: true })})`;
            },
            () => "Brittle Element, but not the bonus - 1 more level in 'Star system'.",
            () => `Any further fusion will be an endothermic process${player.inflation.vacuum ? `. Unlock a Stage reset${player.challenges.active === 0 ? ' and Intergalactic Stage' : ''}.` : ', but what next?\nEnter Intergalactic space. (Can change active Stage from footer)'}`,
            () => `Combined and ready to increase Stage reset reward with every new reached digit of total produced Elements past 48.\n(+${format(calculateEffects.element27())} ${player.strangeness[5][10] >= 1 ? 'to the Strange base' : 'extra Strange quarks'})`,
            () => `Slow to react, but will still boost all Stars by ${format(calculateEffects.element28())}.`
        ],
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
                'Automatic Discharge',
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
                () => 'Automatically Discharge upon reaching next goal or spending Energy. (Need to be enabled in Settings)',
                () => `Gain more Energy from creating ${player.inflation.vacuum ? 'Preons, +2' : 'Particles, +1'}.`,
                () => "Research 'Improved Tritium' is now better. (+1)",
                () => `Always have auto for ${global.buildingsInfo.name[1][Math.min(player.strangeness[1][6] + 1, global.ASRInfo.max[1])]}.`,
                () => 'First level - improve control over auto Structures toggles.\nSecond level - improve control over consumption of Offline storage.',
                () => `Unspent Strange quarks will boost Microworld with bonus Discharge goals.\n(Current effect: ${global.strangeInfo.stageBoost[1] !== null ? `+${format(global.strangeInfo.stageBoost[1], { padding: true })}` : 'none'})`,
                () => `Minor boost of ${format(1.3)}x per level to all Microworld Structures.`,
                () => 'No Mass will be lost when Creating Preons.',
                () => 'Energy is now directly based on current self-made amount of Structures.\nThis will also increase max levels for Reset automatization.'
            ],
            cost: [],
            startCost: [2, 1, 4, 24, 2, 1, 2, 4, 36, 2, 16, 4000],
            scaling: [2.4, 4, 6, 1, 4, 2.2, 2, 2, 1, 1.8, 1, 1],
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
                'Longer Offline',
                'Strange boost',
                'New Structure',
                'Ocean world',
                'Mechanical spread'
            ],
            effectText: [
                () => `Mole production increased by ${format(1.5)}.`,
                () => `Puddles produce ${format(1.5)} times more.`,
                () => `Increase max level for one of Researches by +1.\nFinal level will instead unlock a new Upgrade.\n(Current effect: ${player.strangeness[2][2] >= 1 ? `max level increased for 'More streams'${player.strangeness[2][2] >= 2 ? " and 'Distributary channel'" : ''}${player.strangeness[2][2] >= 3 ? ", a new Upgrade - 'Tsunami'" : ''}` : 'none'})`,
                () => 'Decrease requirement per Cloud.',
                () => `Automatically Vaporize when reached enough boost from new Clouds. (Need to be enabled in Settings)${player.strangeness[1][11] >= 1 ? '\nSecond level - Automatically gain 20% of Clouds per second.' : ''}`,
                () => `Always have auto for ${global.buildingsInfo.name[2][Math.min(player.strangeness[2][5] + 1, global.ASRInfo.max[2])]}.`,
                () => 'Decrease Offline time waste by -1 second per level.\n(Effect is weaker for Warps)',
                () => `Unspent Strange quarks will boost Submerged by improving Puddles.\n(Current effect: ${global.strangeInfo.stageBoost[2] !== null ? format(global.strangeInfo.stageBoost[2], { padding: true }) : 'none'})`,
                () => 'Current Vacuum state allows for another Submerged Structure.',
                () => `Increase ${global.strangeInfo.name[player.strangeness[5][10]]} gained from this Stage reset based on current Cloud amount.\n(Current effect: ${format(calculateEffects.S2Strange9(), { padding: true })})`,
                () => `Increase max level for one of Researches again by +1.\nFinal level will instead unlock an even better new Upgrade.\n(Current effect: ${player.strangeness[2][10] >= 1 ? `max level increased for 'Stronger surface tension'${player.strangeness[2][10] >= 2 ? " and 'Stronger surface stress'" : ''}${player.strangeness[2][10] >= 3 ? ", a new Upgrade - 'Tide'" : ''}` : 'none'})`
            ],
            cost: [],
            startCost: [1, 2, 16, 2, 24, 2, 4, 36, 40, 800, 6000],
            scaling: [1.8, 1.8, 2, 4, 650, 2, 2, 1, 1, 1, 2],
            max: [6, 6, 3, 3, 1, 5, 1, 1, 1, 1, 3],
            maxActive: 8
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
                () => `Accretion Structures that produce other Structures now do it ${format(1.5)} times faster.`,
                () => `Some Rank Researches receive extra Max level.\nFinal level will instead unlock a new Upgrade.\n(Current effect: ${player.strangeness[3][2] >= 1 ? `max level increased for 'Rank boost' (+7)${player.strangeness[3][2] >= 2 ? " and 'Efficient growth' (+2)" : ''}${player.strangeness[3][2] >= 3 ? ", a new Upgrade - 'Hydrostatic equilibrium'" : ''}` : 'none'})`,
                () => `Satellites now improve all Accretion Structures with reduced strength (^${format(player.inflation.vacuum ? 0.2 : 0.4)}).`,
                () => `Automatically increase Rank when available. (Need to be enabled in Settings)${player.strangeness[1][11] >= 1 ? '\nSecond level - auto creation of Accretion Structures after reaching cosmic dust hardcap will always keep enough for highest Solar mass conversion.' : ''}`,
                () => `Always have auto for ${global.buildingsInfo.name[3][Math.min(player.strangeness[3][5] + 1, global.ASRInfo.max[3])]}.`,
                () => 'Will automatically create all Upgrades and Researches from any Stage.\n(Need to be enabled in Settings, order of automatization is Upgrades > Stage Researches > Special Researches)',
                () => `Unspent Strange quarks will boost Accretion by making its Structures cheaper.\n(Current effect: ${global.strangeInfo.stageBoost[3] !== null ? format(global.strangeInfo.stageBoost[3], { padding: true }) : 'none'})`,
                () => 'Current Vacuum state allows for another Accretion Structure.\n(Not recommended until cheap)',
                () => `Reduce amount of time required to reach Solar mass hardcap by shifting Cosmic dust and Solar mass hardcaps.\nEach level allows for ${format(1.4)} times bigger shift. (Automatic)`,
                () => 'Increase effective Rank by +1.'
            ],
            cost: [],
            startCost: [1, 2, 3, 9, 24, 3, 12, 36, 20, 2400, 6],
            scaling: [1.8, 2.8, 2, 1, 400, 2.22, 2, 1, 1, 2, 6],
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
                'Strange boost',
                'New Structure',
                'Neutronium'
            ],
            effectText: [
                () => `All Stars produce ${format(1.5)} times more Elements.`,
                () => 'Stars are 2 times cheaper.',
                () => `Unlock a new Upgrade.\nFirst one is extra good and recommended early.\n(Current unlocks: ${player.strangeness[4][2] >= 1 ? `'Helium fusion' (Upgrade)${player.strangeness[4][2] >= 2 ? ", 'Planetary nebula' (Stage Research)" : ''}${player.strangeness[4][2] >= 3 ? ", 'White dwarfs' (Collapse Research)" : ''}` : 'none'})`,
                () => '10% of Brown dwarfs will turn into Red giants now.',
                () => `Elements will not require Collapse for activation.\n${player.stage.true >= 6 || (player.strange[0].total > 0 && player.event) ? 'Second level will unlock auto creation of Elements. (Need to be enabled in settings)' : '(Auto creation of Elements is not yet possible in Interstellar space)'}`,
                () => `Automatically Collapse once reached enough boost. (Need to be enabled in Settings)${player.strangeness[1][11] >= 1 ? '\nSecond level - Star remnants will now be gained automatically.' : ''}`,
                () => `Always have auto for ${global.buildingsInfo.name[4][Math.min(player.strangeness[4][6] + 1, global.ASRInfo.max[4])]}.`,
                () => `Increase multiplier of ${global.strangeInfo.name[player.strangeness[5][10]]} gained from export per day by +1.${player.strangeness[5][10] >= 1 ? '' : ' (Can claim only full ones)'}\n(Export base is increased by +10% of highest Stage reset reward even without this Strangeness)`,
                () => `Unspent Strange quarks will boost Interstellar by improving all Stars.\n(Current effect: ${global.strangeInfo.stageBoost[4] !== null ? format(global.strangeInfo.stageBoost[4], { padding: true }) : 'none'})`,
                () => 'Current Vacuum state allows for another Interstellar Structure.',
                () => "Improve Neutron Stars strength and improve scaling of '[12] Magnesium' effect."
            ],
            cost: [],
            startCost: [1, 3, 5, 5, 6, 24, 3, 4, 36, 20, 1600],
            scaling: [1.8, 2.8, 2.4, 4, 8, 250, 2.22, 2, 1, 1, 1.4],
            max: [8, 4, 3, 2, 1, 1, 4, 3, 1, 1, 8],
            maxActive: 9
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
                () => player.inflation.vacuum ? 'Unlock the Void. (Advanced subtab)\nAlso a new color theme and 20% global speed bonus outside of Void.' : `${global.stageInfo.word[player.strangeness[5][0] + 1]} will now be permanent and removed from Stage reset cycle.\nPermanent Stages do not affect timer.`,
                () => `Gain ${format(1.5)} times more ${global.strangeInfo.name[player.strangeness[5][10]]} from ${player.inflation.vacuum ? '' : 'Interstellar'} Stage resets.`,
                () => 'Allows to auto reset Stage, has some special settings. (Need to be enabled in Settings)',
                () => "Bigger Nebulas, more matter for Accretion. 'Jeans instability' Upgrade is 2 times stronger.",
                () => "'Super star cluster' is now even bigger. Effect increased by 3.",
                () => player.inflation.vacuum ? 'Unlock Intergalactic Stage.' : 'Intergalactic is no longer affected by Collapse reset.',
                () => `With this a new Intergalactic Structure can be created.${player.stage.true >= 6 ? " (Can't be Created in current version)" : " (Also will increase max level of 'Remnants of past' after creation of that Structure)"}\nSecond level will increase permanent level of auto Structures.`,
                () => { //[7]
                    const autoIndex = Math.min(player.strangeness[5][7] + (player.strangeness[5][6] >= 2 ? 2 : 1), 3);
                    return `Increase permanent level of auto Structures. Next auto is for ${player.buildings[5][autoIndex].highest[0] > 0 ? global.buildingsInfo.name[5][autoIndex] : '(unknown)'}.`;
                },
                () => `Unlock ${player.inflation.vacuum ? 'Void' : 'Intergalactic'} Milestones.`,
                () => `Unspent Strange quarks will boost Intergalactic by ${player.inflation.vacuum ? 'delaying Cosmic dust hardcap' : 'increasing Solar mass gain'}.\n(Current effect: ${global.strangeInfo.stageBoost[5] !== null ? (player.inflation.vacuum || global.stageInfo.activeAll.includes(5) ? format(global.strangeInfo.stageBoost[5], { padding: true }) : 'awaiting Intergalactic Stage') : 'none'})`,
                () => `Unlock a new Strange Structure that will replace current Stage reset reward, also convert all ${global.strangeInfo.name[Math.min(player.strangeness[5][10], global.strangenessInfo[5].max[10] - 1)]} and then produce them, but hardcaps quickly.\n(Hardcap delayed by quantity of a higher tier Structure, can be seen in Stats)`
            ],
            cost: [],
            startCost: [4, 16, 2400, 8, 10, 64, 21600, 60, 1600, 180, 800],
            scaling: [1, 5, 1, 1.8, 1.8, 1, 3, 2, 1, 1, 1],
            max: [3, 1, 1, 9, 9, 1, 2, 2, 1, 1, 1],
            maxActive: 10
        }
    ],
    lastUpgrade: [[-1, 'upgrades'], [-1, 'upgrades'], [-1, 'upgrades'], [-1, 'upgrades'], [-1, 'upgrades'], [-1, 'researches']],
    lastElement: -1,
    lastStrangeness: [-1, -1],
    milestonesInfo: [
        {} as globalType['milestonesInfo'][0], { //Stage 1
            name: [
                'Fundamental Matter',
                'Energized'
            ],
            needText: [
                () => `Have at least ${Limit(global.milestonesInfo[1].need[0]).format()} ${player.inflation.vacuum ? 'Preons' : 'Quarks'} at once.`,
                () => `Have current Energy reach ${Limit(global.milestonesInfo[1].need[1]).format()}.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `All Microworld Structures receive ${format(global.milestonesInfo[1].reward[0], { padding: true })}x boost.` : "Unknown Structure, it doesn't belong to this Universe.\nVacuum instability increased.",
                () => player.inflation.vacuum ? `Energy from creating Structures increased by ${format(global.milestonesInfo[1].reward[1])}%. (Rounds down)` : `Improve effect of '[24] Chromium' by +${format(0.01)}.`
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
                () => player.inflation.vacuum ? `Clouds gain increased by ${format(global.milestonesInfo[2].reward[0], { padding: true })}.` : 'A new Intergalactic Structure. (Nebula)',
                () => player.inflation.vacuum ? `Puddles are now stronger by ${format(global.milestonesInfo[2].reward[1], { padding: true })}.` : "Unknown Structure, it doesn't belong to this Universe.\nVacuum instability increased."
            ],
            need: [[1, 30], [1.5, 3]],
            reward: [1, 1],
            scalingOld: [
                [1e30, 1e33, 1e36, 1e39, 1e42, 1e45],
                [1000, 2500, 4000, 5500, 7000, 9000]
            ]
        }, { //Stage 3
            name: [
                'Cluster of Mass',
                'Satellites of Satellites'
            ],
            needText: [
                () => `Have at least ${Limit(global.milestonesInfo[3].need[0]).format()} Mass at once.`,
                () => `Have more or equal to ${Limit(global.milestonesInfo[3].need[1]).format()} Satellites${player.inflation.vacuum ? ' and Subsatellites' : ''}.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `Accretion speed increased by ${format(global.milestonesInfo[3].reward[0], { padding: true })}.` : 'A new Intergalactic Structure. (Star cluster)',
                () => player.inflation.vacuum ? `Improve effect of 'Planetary system' base by +${format(global.milestonesInfo[3].reward[1])}.` : "Unknown Structure, it doesn't belong to this Universe.\nVacuum instability increased."
            ],
            need: [[1, 30], [2.5, 1]],
            reward: [1, 1],
            scalingOld: [
                [1e32, 1e34, 1e36, 1e38, 1e40, 1e43, 1e46],
                [20, 25, 30, 35, 40, 45, 50]
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
                () => player.inflation.vacuum ? `Stars produce ${format(global.milestonesInfo[4].reward[0], { padding: true })} times more Elements.` : 'New Intergalactic themed Strangeness.',
                () => player.inflation.vacuum ? `Preons hardcap delayed by ${format(global.milestonesInfo[4].reward[1], { padding: true })}.` : "Unknown Structure, it doesn't belong to this Universe.\nVacuum instability increased."
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
                () => player.inflation.vacuum ? `Decrease cost for all Stars by ${format(global.milestonesInfo[5].reward[0], { padding: true })}.` : 'Intergalactic Stage is unlocked with Intestellar, Strange boost is always active now.',
                () => player.inflation.vacuum ? `Boost per Galaxy is now +${format(global.milestonesInfo[5].reward[1])} bigger.` : 'Unknown Structure, it cannot exist in false Vacuum.\nVacuum instability increased.'
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
                if (progress[1] < 1) { return '<span class="orangeText">- Unknown, but maybe with more Energy</span>'; }
                let text = '<span class="orangeText">- Energy gain is decreased by 20%\n- Discharge base reduced</span>';
                if (progress[1] >= 3) { text += `\n\n<span class="blueText">- ${progress[2] >= 1 ? `Effective Drops softcap is stronger (^${format(0.2)} > ^${format(0.1)})\n- Self-made Drops are no longer immune to effective Drops softcap\n- Puddles are 200 times weaker\n- 'Water spread' scales slower` : 'Unknown, but maybe if deeper'}</span>`; }
                if (progress[1] >= 2) { text += `\n\n<span class="grayText">- ${progress[3] >= 1 ? `'Jovian planet' Rank softcap starts immediately (^${format(0.92)})\n- Softcap is stronger after reaching that Rank (^${format(0.84)})` : 'Unknown, but maybe if more Mass'}</span>`; }
                if (progress[3] >= 5) { text += `\n\n<span class="darkorchidText">- ${progress[4] >= 1 ? `Solar mass is 40 times weaker\n- Solar mass effect scales slower (-^${format(0.2)})\n- 'Star system' is weaker` : 'Unknown, but maybe if long enough'}</span>`; }
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
                ["'Ocean world' (Submerged)", "'Mechanical spread' (Submerged)"],
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
Object.assign(player.toggles, {
    normal: createArray(document.getElementsByClassName('toggleNormal').length, 'toggle'),
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

    prepareVacuum(Boolean(load.inflation?.vacuum)); //Only to set starting buildings values
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
            load.researchesExtra = []; //Required for v0.0.9
        }
        if (load.version === 'v0.0.1') {
            load.version = 'v0.0.2';
            load.stage.resets = load.stage.current - 1;
        }
        if (load.version === 'v0.0.2' || load.version === 'v0.0.3') {
            load.version = 'v0.0.4';
            delete load['energy' as keyof unknown];
            delete load['buyToggle' as keyof unknown];
        }
        if (load.version === 'v0.0.4' || load.version === 'v0.0.5' || load.version === 'v0.0.6') {
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
        if (load.version === 'v0.0.9' || load.version === 'v0.1.0') {
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
            if (Object.hasOwn(load.strange[0], 'true')) { load.strange[0].current = load.strange[0]['true' as 'current']; }
            delete load.vaporization['current' as keyof unknown];
            delete load.strange[0]['true' as keyof unknown];
            load.time.offline = 0;
        }
        if (load.version === 'v0.1.2') {
            load.version = 'v0.1.3';
            load.stage.best = 0;
            load.stage.time = 0;
            load.inflation.age = 0;
            load.discharge.energyMax = load.discharge.energy;
            load.vaporization.cloudsMax = cloneArray(load.vaporization.clouds);
        }
        if (load.version === 'v0.1.3') {
            load.version = 'v0.1.4';
            delete load.collapse['disabled' as keyof unknown];
            delete load.collapse['inputM' as keyof unknown];
            delete load.collapse['inputS' as keyof unknown];
        }
        if (load.version === 'v0.1.4' || load.version === 'v0.1.5') {
            load.version = 'v0.1.6';
            load.collapse.show = 0;
            load.collapse.input = 2;
            load.toggles = deepClone(playerStart.toggles);
            load.history.stage.best[2] = 0;
            for (let i = 0; i < load.history.stage.list.length; i++) {
                load.history.stage.list[i][2] = 0;
            }
            delete load.time['disabled' as keyof unknown];
            delete load['researchesAuto' as keyof unknown];
            delete load.discharge['unlock' as keyof unknown];

            /* Can be removed eventually */
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
        }
        if (load.version === 'v0.1.6') {
            load.version = 'v0.1.7';
            if (load.buildings[5].length > 4) { load.buildings[5].length = 4; }
            if (!Object.hasOwn(load, 'saveUpdate016')) {
                load.strangeness[2].splice(6, 1);
                load.strangeness[4].splice(8, 1);
                load.intervals = deepClone(playerStart.intervals);
            }
            delete load['saveUpdate016' as keyof unknown];
            delete load.accretion['input' as keyof unknown];
            delete load.collapse['elementsMax' as keyof unknown];
        }
        if (load.version === 'v0.1.7') {
            load.version = 'v0.1.8';
            load.time.online = load.inflation.age;
            load.time.universe = load.inflation.age;
            load.time.stage = load.stage.time;
            delete load['events' as keyof unknown];

            //Can be removed eventually
            if (load.inflation.vacuum) {
                load.milestones[2][1] = 0;
                load.milestones[4][1] = 0;
            }
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

    if (load.accretion.rank > global.accretionInfo.rankCost.length - 1) { load.accretion.rank = global.accretionInfo.rankCost.length - 1; }
    if (load.intervals.main < 20) { load.intervals.main = 20; }

    Object.assign(player, load);

    /* Prepare fake save file data */
    global.debug.errorID = true;
    global.debug.errorQuery = true;
    global.debug.errorGain = true;
    global.debug.historyUpdatedS = false;

    global.vaporizationInfo.research0 = 0;
    global.vaporizationInfo.research1 = 0;
    global.accretionInfo.rankCost[4] = player.stage.true >= 4 || (player.stage.true === 3 && player.event) ? 5e29 : 0;
    const stars = player.buildings[4];
    global.collapseInfo.trueStars = stars[1].true + stars[2].true + stars[3].true + stars[4].true + stars[5].true;
    global.historyStorage.stage = player.history.stage.list;
    if (player.inflation.vacuum) {
        player.buildings[2][0].current = Limit(player.buildings[1][5].current).divide('6.02214076e23').toArray();
        player.buildings[3][0].current = Limit(player.buildings[1][0].current).multiply('1.78266192e-33').toArray();
    } else if (player.accretion.rank === 0) { player.buildings[3][0].current = [5.9722, 27]; }

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
    assignPuddles(true);
    assignEnergy();
    if (!player.inflation.vacuum) { calculateInstability(); }

    /* Finish visuals */
    const theme = localStorage.getItem('theme');
    setTheme(theme === null ? null : Number(theme));

    (getId('saveFileNameInput') as HTMLInputElement).value = player.fileName;
    (getId('mainInterval') as HTMLInputElement).value = `${player.intervals.main}`;
    (getId('numbersInterval') as HTMLInputElement).value = `${player.intervals.numbers}`;
    (getId('visualInterval') as HTMLInputElement).value = `${player.intervals.visual / 1000}`;
    (getId('autoSaveInterval') as HTMLInputElement).value = `${player.intervals.autoSave / 1000}`;
    (getId('thousandSeparator') as HTMLInputElement).value = player.separator[0];
    (getId('decimalPoint') as HTMLInputElement).value = player.separator[1];
    (getId('stageInput') as HTMLInputElement).value = format(player.stage.input, { type: 'input' });
    (getId('vaporizationInput') as HTMLInputElement).value = format(player.vaporization.input, { type: 'input' });
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
    if (getId('versionText', false) !== null) { return; }

    getId('versionInfo').innerHTML = `<div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; width: clamp(42vw, 36em, 80vw); height: clamp(26vh, 36em, 90vh); background-color: var(--window-color); border: 3px solid var(--window-border); border-radius: 12px; padding: 1em 1em 0.8em; row-gap: 1em;">
        <div id="versionText" style="width: 100%; overflow-y: auto;">
            <label>v0.1.8</label><p>- Stage 5 and 6 small balance changes\n- Solar mass requirement is removed if own a Galaxy\n- Upgrades and Researches merged (tab renamed)\n- Strangeness auto update description\n- Effects for all Upgrade types are expanded\n- Some stats moved into Stage tab\n- New stats for Stages 1, 3, 6\n- Added new save options (copy to clipboard, load from string)\n- Small visual changes\n- Added option to keep mouse events for Mobile device support\n- Support settings are now saved on page reload</p>
            <label>v0.1.7</label><p>- New content (Void)\n- Further balance and quality of life changes\n- Removed some Strangeness\n- Max Offline is now based on Stage resets\n- Offline storage no longer decreases\n- Export base is now improved by best Stage reset\n- Updated logic for entering and leaving Elements subtab\n- Warp minimum value is smaller and calculated better\n- Discharge now needs an actual reason\n- Fixed import not working on some Mobile devices\n- Art, themes and overall small visual updates\n- Updated numbers to move less, also to use new format</p>
            <label>v0.1.6</label><p>- Massive rebalance and reworks for all Stages\n- Auto Collapse reworked\n- Small changes to auto Vaporization\n- New stats for Stages 1, 2 and 3\n- New notifications\n- Removed almost all Automatization Researches\n- Export reward now unlocked for free\n- Elements will show effects after Stage reset\n- Descriptions no longer reset when changing active Stage\n- More quality of life improvements\n- More work on Mobile device and Screen reader supports</p>
            <label>v0.1.5</label><p>- Stage 6 minor balance changes\n- Images no longer unload when active Stage changes\n- Elements subtab can be entered from any Stage now or turned into a tab\n- Footer now affects page height\n- Many small changes to improve quality of life\n- 'Any' make toggle is now always strict, related button removed\n- More stats for save files\n- New hotkeys\n- Screen reader support rework, related tab removed</p>
            <label>v0.1.4</label><p>- Warps now waste Offline\n- Max Offline from Upgrades decreased\n- Custom scrolls\n- Notifications\n- Fixed and updated Mobile device and Screen reader supports</p>
            <label>v0.1.3</label><p>- Stage 6 balance changes\n- Stage 2 minor balance\n- New stats for Stages 3, 4 and 5\n- Replay event button\n\n- History for Stage resets\n- 2 new hotkeys for unlockable toggles\n\n- Warp nerfed and now has a minimum value\n- Automatically made Structures/Upgrades no longer visually update numbers</p>
            <label>v0.1.2</label><p>- New content (Vacuum)\n- Offline time reworked\n- Added version window (removed automatic change log)\n- Removed option to remove text movement (always on now)\n\n- New color theme\n- Offline warp unlocked instantly now\n- New stats for Stage 4\n\n- Auto Structures correctly spends currency now</p>
            <label>v0.1.1</label><p>- More balance changes for Stage 5\n- New stats for Stages 2 and 4\n- New hotkeys to change active Stage</p>
            <label>v0.1.0</label><p>- New content and balance changes for the end of Stage 5\n- New stats for Stage 5</p>
            <label>v0.0.9</label><p>- New content (Milestones)\n- Stage 4 speed up\n- Fixed export reward not being saved into exported file\n\n- Fixed F1 - F12 buttons working as digits\n- New event\n\n- Max Offline is increased by 2 times\n\n- Some quick balance changes for Stages 3 and 5</p>
            <label>v0.0.8</label><p>- Minor speed up to all Stages past first one</p>
            <label>v0.0.7</label><p>- New content (Stage 5)\n- Stage 1 rework\n- Self-made Structures stat moved into Stage tab\n- Hotkeys for resets\n- Keyboard no longer highlights anything\n- New faster number format\n\n- Numpad can now be used as hotkeys\n\n- Save file name can display stats now</p>
            <label>v0.0.6</label><p>- Hotkeys can be seen now\n\n- Option to remove text movement\n- Ability to rename save file</p>
            <label>v0.0.5</label><p>- New content (Stage 4)\n- Basic loading screen\n- Full visual update\n- New formula for multi creation of Structures\n- Visual display to show how many Structures can be made\n\n- Elements will still show effects after Collapse\n- Improved transition when changing themes\n- Fixed creating automatization Research when can't afford it\n\n- Added hotkeys</p>
            <label>v0.0.4</label><p>- Buffed all Stages\n- Added events for early Stages\n- Visual update to stats\n- Intervals have been reset\n\n- Numbers are now formated\n\n- New stat for Stage 3</p>
            <label>v0.0.3</label><p>- New content (Stage 3)\n- Stage 2 extended\n- Max Offline time is now 2 times longer\n- Offline time calculated better\n- Researches auto update description\n- Some new stats</p>
            <label>v0.0.2</label><p>- Stats subtab\n- Stage resets stat</p>
            <label>v0.0.1</label><p>- Stage 2 full rework\n- Introduced automatic changelog\n- Auto Structures no longer wait before making first one\n\n- Mobile device support\n\n- Upgrades auto update description</p>
        </div>
        <button type="button" id="closeVersionInfo" style="flex-shrink: 0; width: 6em; border-radius: 4px; font-size: 0.92em;">Close</button>
    </div>`;

    document.head.appendChild(document.createElement('style')).textContent = '#versionText label { font-size: 1.18em; } #versionText p { line-height: 1.3em; white-space: pre-line; color: var(--white-text); margin-top: 0.2em; margin-bottom: 1.4em; } #versionText p:last-of-type { margin-bottom: 0; }';
    getId('closeVersionInfo').addEventListener('click', () => { getId('versionInfo').style.display = 'none'; });
};
