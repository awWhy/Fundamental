import Overlimit from './Limit';
import { getId } from './Main';
import { specialHTML } from './Special';
import { assignStrangeBoost, calculateInstability, calculateMaxLevel, calculateMilestoneInformation, assignPuddles, toggleConfirm, toggleSwap, calculateEffects, getDischargeScale, assignBuildingInformation, assignMaxRank, calculateTrueEnergy } from './Stage';
import type { globalType, playerType } from './Types';
import { format, visualUpdateResearches } from './Update';
import { prepareVacuum } from './Vacuum';

export const player: playerType = { //Only for information that need to be saved (cannot be calculated)
    version: 'v0.2.0',
    fileName: 'Fundamental, [dateD.M.Y] [timeH-M-S], [stage]',
    stage: {
        true: 1,
        current: 1,
        active: 1,
        resets: 0,
        time: 0,
        peak: 0,
        input: 0
    },
    discharge: { //Stage 1
        energy: 0,
        energyMax: 0,
        current: 0
    },
    vaporization: { //Stage 2
        clouds: new Overlimit('0'),
        cloudsMax: new Overlimit('0'),
        input: [3, 0] //[Boost, max]
    },
    accretion: { //Stage 3
        rank: 0
    },
    collapse: { //Stage 4, 5
        mass: 0.01235,
        massMax: 0.01235,
        stars: [0, 0, 0],
        show: 0,
        input: [2, false] //[Boost, wait]
    },
    inflation: { //Stage 6
        vacuum: false,
        age: 0
    },
    time: {
        updated: Date.now(),
        started: Date.now(),
        offline: 0,
        export: [0, 0, 0, 0],
        online: 0,
        stage: 0,
        universe: 0
    },
    buildings: [
        [] as unknown as playerType['buildings'][0], [ //Stage 1
            {
                current: new Overlimit('3'),
                total: new Overlimit('3'),
                trueTotal: new Overlimit('3'),
                highest: new Overlimit('3')
            }, {
                true: 0, //Bought
                current: new Overlimit('0'), //On hands
                total: new Overlimit('0'), //This reset
                trueTotal: new Overlimit('0'), //This stage
                highest: new Overlimit('0') //Highest 'current' in any stage
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }
        ], [ //Stage 2
            { //Should be instead '2.77675342812811e-3'
                current: new Overlimit('2.8e-3'),
                total: new Overlimit('2.8e-3'),
                trueTotal: new Overlimit('2.8e-3'),
                highest: new Overlimit('2.8e-3')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }
        ], [ //Stage 3
            {
                current: new Overlimit('1e-19'),
                total: new Overlimit('1e-19'),
                trueTotal: new Overlimit('1e-19'),
                highest: new Overlimit('1e-19')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }
        ], [ //Stage 4
            {
                current: new Overlimit('1'),
                total: new Overlimit('1'),
                trueTotal: new Overlimit('1'),
                highest: new Overlimit('1')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }
        ], [ //Stage 5
            {
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0'),
                highest: new Overlimit('0')
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
    researchesAuto: [],
    ASR: [], //Auto Structures Research
    elements: [],
    strangeness: [],
    milestones: [],
    challenges: {
        active: -1,
        void: [0, 0, 0, 0, 0, 0]
    },
    toggles: {
        confirm: [], //Class 'toggleConfirm'
        /* Stage[0]; Discharge[1]; Vaporization[2]; Rank[3]; Collapse[4] */
        buildings: [], //Class 'toggleBuilding' ([0] everywhere, is toggle all)
        hover: [], //Class 'toggleHover'
        /* Upgrades/Researches/Elements[0] */
        max: [], //Class 'toggleMax'
        /* Researches[0] */
        auto: [], //Class 'toggleAuto'
        /* Stage[0], Discharge[1], Vaporization[2], Rank[3], Collapse[4],
           Upgrades[5], Researches[6], ResearchesExtra[7], Elements[8] */
        shop: {
            input: 1,
            wait: [2]
        }
    },
    history: {
        stage: { //[time, quarks, strangelets, reserve]
            best: [1, 0, 0, 0],
            list: [],
            input: [5, 10]
        }
    },
    events: [false] //Used as progress check
    /* Intergalactic Stage reset[0] */
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
        historyStage: -1 //Stage resets
    },
    trueActive: 1,
    lastSave: 0,
    paused: true,
    footer: true,
    hotkeys: {
        shift: false,
        ctrl: false
    },
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
    dischargeInfo: {
        energyType: [[]],
        energyTrue: 0,
        tritium: new Overlimit('0'),
        base: 4,
        total: 0,
        next: 1
    },
    vaporizationInfo: {
        strength: new Overlimit('1'),
        research0: 0,
        research1: 0,
        get: new Overlimit('0')
    },
    accretionInfo: {
        unlockA: [2, 4, 8, 11], //Quick look up for required Upgrades
        rankU: [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 5], //Upgrades
        rankR: [1, 1, 2, 2, 3, 3, 3, 4, 5], //Researches
        rankE: [2, 3, 4, 5, 3], //Researches Extra
        maxRank: 4,
        rankCost: [5.9722e27, 1e-7, 1e10, 1e24, 5e29, 2.45576045e31],
        rankColor: ['blue', 'cyan', 'gray', 'gray', 'gray', 'darkviolet', 'orange'],
        rankName: ['Ocean world', 'Cosmic dust', 'Meteoroid', 'Asteroid', 'Planet', 'Jovian planet', 'Protostar'],
        rankImage: ['Ocean%20world.png', 'Dust.png', 'Meteoroids.png', 'Asteroid.png', 'Planet.png', 'Giant.png', 'Protostar.png']
    },
    collapseInfo: {
        massEffect: 1,
        starEffect: [1, 1, 1],
        unlockB: [0, 0.01235, 0.23, 10, 40, 1000], //Buildings
        unlockU: [0.01235, 0.076, 1.3, 10], //Upgrades
        unlockR: [0.18, 0.3, 0.8, 1.3], //Researches
        newMass: 0,
        starCheck: [0, 0, 0],
        trueStars: 0
    },
    inflationInfo: {
        globalSpeed: 1,
        preonCap: new Overlimit('1e14'),
        dustCap: new Overlimit('1e48'),
        massCap: 0.01235,
        preonTrue: new Overlimit('0'),
        dustTrue: new Overlimit('0')
    },
    intervalsId: {
        main: undefined,
        numbers: undefined,
        visual: undefined,
        autoSave: undefined,
        mouseRepeat: undefined
    },
    stageInfo: {
        word: ['', 'Microworld', 'Submerged', 'Accretion', 'Interstellar', 'Intergalactic', 'Void'],
        textColor: ['', 'cyan', 'blue', 'gray', 'orange', 'darkorchid', 'darkviolet'],
        buttonBorder: ['', 'darkcyan', '#386cc7', '#424242', '#a35700', '#8f004c', '#6c1ad1'],
        imageBorderColor: ['', '#008b8b', '#1460a8', '#5b5b75', '#e87400', '#b324e2', '#5300c1'],
        activeAll: [1]
    },
    buildingsInfo: {
        maxActive: [0, 4, 6, 5, 5, 4], //Need to also count index [0]
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
        startCost: [
            [],
            [0, 0.005476, 6, 3, 24, 3],
            [0, 0.0028, 100, 1e7, 1e18, 1e23, 2.676e25],
            [0, 1e-19, 1e-9, 1e21, 1e17, 1e22],
            [0, 1, 1e5, 1e15, 1e28, 1e51],
            [0, 1e50, 1e54, 1e5]
        ],
        increase: [
            [],
            [0, 1.4, 1.4, 1.4, 1.4, 1.4],
            [0, 1.15, 1.2, 1.25, 1.35, 1.4, 4],
            [0, 1.15, 1.25, 1.35, 10, 10],
            [0, 1.4, 1.55, 1.70, 1.85, 2],
            [0, 4, 4, 1.11]
        ],
        producing: []
    },
    strangeInfo: {
        name: ['Strange quarks', 'Strangelets'],
        stageBoost: [1, 1, 1, 1, 1, 1],
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
                () => 'Particles will produce 5 times more Quarks.',
                () => 'Gluons will now bind Quarks into Particles, which will make Particles 10 times cheaper.',
                () => `${player.inflation.vacuum ? 'Atoms' : 'Particles'} will be 10 times cheaper.`,
                () => `${player.inflation.vacuum ? 'Atoms' : 'Particles'} will produce 5 times more ${player.inflation.vacuum ? 'Particles' : 'Quarks'}.`,
                () => `${player.inflation.vacuum ? 'Molecules' : 'Atoms'} will produce 5 times more ${player.inflation.vacuum ? 'Atoms' : 'Particles'}.`,
                () => `Ability to regain spent Energy and if had enough Energy will also boost production for all Structures by ${format(global.dischargeInfo.base)}.`,
                () => `Decrease Structures cost scaling by -${format(calculateEffects.S1Upgrade6() / 100)}.`,
                () => `Make self-made Structures boost themselves by ${format(calculateEffects.S1Upgrade7())}.`,
                () => 'Molecules will produce Molecules. At a reduced rate.',
                () => `Unspent Energy${player.inflation.vacuum ? ` ^${format(0.5)}` : ''} will boost 'Tritium' production of Molecules${player.inflation.vacuum ? '' : ' 1 to 1'}.\n(Boost: ${format(Math.max(player.discharge.energy, 1) ** (player.inflation.vacuum ? 0.5 : 1), { padding: true })})`
            ],
            startCost: [40, 60, 120, 140, 200, 400, 2000, 4000, 16000, 84000],
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
                () => `Drops will ${player.inflation.vacuum ? 'improve Tritium' : 'produce Moles'} ${format(player.inflation.vacuum ? 1.02 : 1.04)} times ${player.inflation.vacuum ? 'more' : 'faster'} for every self-made Drop.`,
                () => `Spread water faster with every Puddle, weaker for non self-made ones.\n(Total effect: ${format(calculateEffects.S2Upgrade1(), { padding: true })})`,
                () => `Gain ability to convert Drops into Clouds. (Boost after Vaporization can be seen in Stats subtab)\nCurrent Cloud gain is (Drops / ${format(calculateEffects.S2Upgrade2())}) ^${format(player.challenges.active === 0 ? 0.4 : player.inflation.vacuum ? 0.5 : 0.6)}.`,
                () => { //[3]
                    const power = calculateEffects.S2Upgrade3();
                    return `Puddles will get a boost based on Moles ^${format(power)}.\n(Boost: ${format(new Overlimit(player.buildings[2][0].current).max('1').power(power), { padding: true })})`;
                },
                () => { //[4]
                    const power = calculateEffects.S2Upgrade4();
                    return `Puddles will get a boost based on Drops ^${format(power)}.\n(Boost: ${format(new Overlimit(player.buildings[2][1].current).max('1').power(power), { padding: true })})`;
                },
                () => `Ponds will now create extra Puddles. (${format(calculateEffects.S2Upgrade5())} extra Puddles per Pond)`,
                () => `Lakes will now create extra Ponds. (${format(calculateEffects.S2Upgrade6())} extra Ponds per Lake)`,
                () => 'Spreads enough water to make each Sea create 1 extra Lake.',
                () => 'Spreads water too fast. 1 extra Sea per Ocean.\nAlso will improve Oceans effect scaling.'
            ],
            startCost: [10, 1e6, 1e10, 1e3, 1e4, 2e9, 5e20, 1e30, 4e48],
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
                () => `Through random collisions every self-made Cosmic dust will ${player.inflation.vacuum ? 'delay Preons hardcap even more' : 'produce even more Mass'}.\n(By ${format(calculateEffects.S3Upgrade0())} per self-made Cosmic dust)`,
                () => { //[1]
                    const power = calculateEffects.S3Upgrade1();
                    return `New substance for Accretion, will provide boost to Cosmic dust based on its current quantity ^${format(power)}.\n(Boost: ${format(new Overlimit(player.buildings[3][1].current).power(power), { padding: true })})`;
                },
                () => 'Just a small meteoroid, but it will be a good base for what to come.\n(Unlock a new Structure and get 2x boost to Cosmic dust)',
                () => `Small bodies will spontaneously concentrate into clumps.\n(Self-made Planetesimals will boost each other by ${format(calculateEffects.S3Upgrade3())})`,
                () => 'Bodies will now be massive enough to affect each other with gravity.\n(Unlock a new Structure and get 3x boost to Planetesimals)',
                () => `Shattered pieces will fall back together. ${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be increased by 3.`,
                () => `Melt the core to increase Accretion speed.\n(Cosmic dust strength will be increased by ${format(2 * 1.5 ** player.researches[3][7])})`,
                () => `After reaching equilibrium self-made Protoplanets will boost each other by ${format(1.02)}.`,
                () => 'Unlock yet another Structure.',
                () => `${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be increased again (because of drag and escape velocity), by 2.`,
                () => `${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be greatly increased by ${8 * 2 ** player.researches[3][8]}.`,
                () => `Satellites cost scaling will now be 2 times smaller.${player.inflation.vacuum ? '\nAlso unlock a new Structure.' : ''}`,
                () => 'Satellites effect will scale better.'
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
                () => `As fuel runs out, every Star will boost production in its own special way. (Hover over effect to see what it boosts)\n(Boost after Collapse can be seen in Stats subtab${player.inflation.vacuum ? ', also Solar mass gain is based on Mass from other Stages' : ''})`,
                () => 'Fuse with Protium instead of Deuterium. Unlock 5 first Elements (Elements subtab).',
                () => 'Unlock CNO cycle which is a better source of Helium and Energy. Unlock 5 more Elements.',
                () => 'Through Triple-alpha and then Alpha process unlock 2 more Elements.'
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
                () => `Boost per Galaxy will be increased by +${format(calculateEffects.S5Upgrade2(), { padding: true })}.\n(Effect will be stronger with more Solar mass past ${format(1e5)}, maxed at +1)`
            ],
            startCost: [1e56, 1e60, 1e120],
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
                () => `Cost scaling will be -${format(0.03)} smaller with each level.`,
                () => `Self-made Structures will boost each other by additional +${format(0.01)}.`,
                () => `Molecules will produce themselves ${format(calculateEffects.S1Research2())} times quicker.`,
                () => `Next goal for Discharge bonus will scale by -2 less.\n(Creating this Research will make next Discharge goal to be ${format((getDischargeScale() - 2) ** player.discharge.current)} Energy)`,
                () => { //[4]
                    const newBase = calculateEffects.dischargeBase(player.researches[1][4] + 1);
                    return `Discharge production boost from reached goals will now be +${format(newBase - global.dischargeInfo.base)}.\n(Boost increase: ${format((newBase / global.dischargeInfo.base) ** global.dischargeInfo.total, { padding: true })})`;
                },
                () => `Discharge goals will now be able to boost 'Tritium'.\n(Current effect: ${player.inflation.vacuum ? `${format(calculateEffects.S1Research5())} ^ level` : `${player.researches[1][5] >= 1 ? format(global.dischargeInfo.total ** calculateEffects.S1Research5()) : 1} ⟶ ${format(global.dischargeInfo.total ** calculateEffects.S1Research5(1))}`})`
            ],
            cost: [],
            startCost: [2400, 6000, 20000, 36000, 20000, 28000],
            scaling: [400, 2000, 8000, 48000, 16000, 16000],
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
                () => `Drops will ${player.inflation.vacuum ? 'improve Tritium' : 'produce Moles'} 3 times more.${global.vaporizationInfo.research0 !== player.researches[2][0] ? `\nWeakened by recent ${player.inflation.vacuum ? 'reset' : 'Vaporization'}, effective level is ${format(global.vaporizationInfo.research0)} (will be increased after ${format(new Overlimit(10 * 1.36 ** global.vaporizationInfo.research0).minus(player.buildings[2][1].total), { padding: true })} more Drops).` : ''}`,
                () => `Puddles will produce Drops 2 times more.${global.vaporizationInfo.research1 !== player.researches[2][1] ? `\nWeakened by recent ${player.inflation.vacuum ? 'reset' : 'Vaporization'}, effective level is ${format(global.vaporizationInfo.research1)} (will be increased after ${format(new Overlimit((5 ** (global.vaporizationInfo.research1 + 1) - 1) * 100).minus(player.buildings[2][1].total), { padding: true })} more Drops).` : ''}`,
                () => `'Surface tension' base will be +${format(0.005)} stronger.\n(Effect increase: ${format(new Overlimit(player.buildings[2][0].current).max('1').power(calculateEffects.S2Upgrade3(player.researches[2][2] + 1) - calculateEffects.S2Upgrade3()).toNumber(), { padding: true })})`,
                () => `'Surface stress' base will be +${format(0.005)} stronger.\n(Effect increase: ${format(new Overlimit(player.buildings[2][1].current).max('1').power(calculateEffects.S2Upgrade4(player.researches[2][3] + 1) - calculateEffects.S2Upgrade4()).toNumber(), { padding: true })})`,
                () => 'With more streams, will be able to have even more extra Puddles. (+1 extra Puddles per Pond)',
                () => 'Rivers will be able to split now, which will allow even more Ponds per Lake. (+1 per)'
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
                () => 'Increase strength of Cosmic dust by 3.',
                () => `Cosmic dust particles will cling to each other. (+${format(0.01)} to 'Brownian motion')`,
                () => 'Planetesimals will produce more Cosmic dust. (3 times more)',
                () => `Slow encounter velocities will result in a more efficient growth.\n${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be increased by 2.`,
                () => `Planetesimals when shatter will replenish small grains quantity.\n'Streaming instability' effect will be increased by +${format(0.005)}.`,
                () => `Some Planetesimals instead of shattering will form a contact binary or even trinary.\n${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be increased by 3.`,
                () => { //[6]
                    const power = calculateEffects.S3Research6();
                    const mass = new Overlimit(player.buildings[3][0].current).max('1');
                    return `Planetesimals will attract other bodies and get a boost to own production based on unspent Mass ^${format(power)}.\n(Boost: ${format(new Overlimit(mass).power(power), { padding: true })} ⟶ ${format(mass.power(calculateEffects.S3Research6(player.researches[3][6] + 1)), { padding: true })})`;
                },
                () => `'Magma Ocean' will become stronger, by ${format(1.5)}.`,
                () => `Improve 'Pebble accretion' Accretion speed even more.\n${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will increased by 2.`
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
                    return `All self-made Stars will boost each other by ${format(base)}.\n(Total boost: ${format(new Overlimit(base).power(global.collapseInfo.trueStars), { padding: true })} ⟶ ${format(new Overlimit(calculateEffects.S4Research1(player.researches[4][1] + 1)).power(global.collapseInfo.trueStars), { padding: true })})`;
                },
                () => `Improve effect scaling of 'Planetary system', as well increase its max level by +3.\n(Total boost from 'Planetary system' will be increased by ${format((calculateEffects.S4Research0(player.researches[4][2] + 1) / calculateEffects.S4Research0()) ** player.researches[4][0], { padding: true })})`,
                () => "Matter expelled from Red giants, this will boost Main-sequence stars by 2, as well increase 'Planetary system' max level by +3.",
                () => `An immensely energetic explosion that will boost all Stars by ${format(calculateEffects.S4Research4(), { padding: true })}${player.researches[4][4] < 2 ? ` ⟶ ${format(calculateEffects.S4Research4(false, player.researches[4][4] + 1), { padding: true })}` : ''}.\n(Effect will be stronger with more Black holes${player.elements[23] >= 1 ? ' and Solar mass' : ''})`
            ],
            cost: [],
            startCost: [1e3, 5e4, 1e8, 1e11, 1e28],
            scaling: [10, 200, 1e12, 1, 2e8],
            max: [3, 2, 1, 1, 2],
            maxActive: 5
        }, { //Stage 5
            name: [
                'Higher density',
                'Type frequency'
            ],
            effectText: [
                () => `Higher density of Nebulas, will allow them to produce higher tier of Stars, but each tier is 3 times slower than previous one. Also will boost Nebulas by 3.\nNext tier will be ${global.buildingsInfo.name[4][Math.min(player.researches[5][0] + 2, 4)]}.`,
                () => `More of same Star type will be found within Star cluster. Will increase effect by 2 and also boost lower tier of Stars. (2 times less than higher one)\nNext tier will be ${global.buildingsInfo.name[4][Math.max(3 - player.researches[5][1], 1)]}.`
            ],
            cost: [],
            startCost: [1e54, 1e58],
            scaling: [1e8, 1e8],
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
                () => "Mesons will now bind Particles to form Atoms, which will make Atoms to be affected by 'Strong force'.\n(Atoms will be 10 times cheaper)",
                () => `Improve scaling for 'Tritium' formula, current formula is log${format(calculateEffects.S1Extra1())}${player.researchesExtra[1][1] < 4 ? ` ⟶ log${format(calculateEffects.S1Extra1(player.researchesExtra[1][1] + 1))}` : ''}.`,
                () => 'First level is to begin the Accretion, second level is to Submerge it.\nAll Structures produce Energy on creation, as well Mass from all Stages is connected.',
                () => { //[3]
                    const power = calculateEffects.S1Extra3();
                    return `Delay Preons hardcap by current Energy ^${format(power)}.\n(Effect: ${format(Math.max(player.discharge.energy, 1) ** power, { padding: true })} ⟶ ${format(Math.max(player.discharge.energy, 1) ** calculateEffects.S1Extra3(player.researchesExtra[1][3] + 1), { padding: true })})`;
                },
                () => { //[4]
                    const base = calculateEffects.S1Extra4();
                    return `Discharge goals will now be able to boost all Interstellar Stars, but at reduced base.\nCurrent base is ${format(base)}, total boost is ${format(new Overlimit(base).power(global.dischargeInfo.total))}.`;
                }
            ],
            cost: [],
            startCost: [8000, 76000, 16000, 20000, 140000],
            scaling: [0, 16000, 76000, 16000, 0],
            max: [1, 4, 2, 4, 1],
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
                () => `Some Clouds will start pouring Drops themselves. This will produce Drops until a Puddle, afterwards it will boost Puddles.\n(Effect: ${format(calculateEffects.S2Extra1_2(false, 1)[0] - (player.buildings[2][2].current.lessOrEqual('0') ? 1 : 0), { padding: true })})`,
                () => `Improve 'Rain Clouds', and also boost Seas at a reduced rate.\n(Boost to Seas: ${format(calculateEffects.S2Extra1_2(false, undefined, 1)[1], { padding: true })})`,
                () => { //[3]
                    const level = player.researchesExtra[2][3];
                    const tension = player.upgrades[2][3] === 1 ? new Overlimit(player.buildings[2][0].current).max('1').power(calculateEffects.S2Upgrade3()).toNumber() : 1;
                    const stress = player.upgrades[2][4] === 1 ? new Overlimit(player.buildings[2][1].current).max('1').power(calculateEffects.S2Upgrade4()).toNumber() : 1;
                    return `Submerge and boost Stars with 'Surface tension'. Also with 'Surface stress' ^${format(0.5)} at level 2, full power at level 3.\n(Boost to Stars: ${level < 3 ? `${format(level < 1 ? 1 : tension * (level > 1 ? stress ** 0.5 : 1), { padding: true })} ⟶ ` : ''}${format(tension * (level < 1 ? 1 : stress ** (level > 1 ? 1 : 0.5)), { padding: true })})`;
                }
            ],
            cost: [],
            startCost: [1e18, 1e13, 1e28, 1e14],
            scaling: [1, 1, 1, 1e8],
            max: [1, 1, 1, 3],
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
                () => `Increase strength of Cosmic dust by another ${format(1.1)}x per level.\n(Total increase: ${format(1.1 ** player.researchesExtra[3][0], { padding: true })})`,
                () => `${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will now be even bigger, improved by current Rank.\n(Total boost: ${format(calculateEffects.S3Extra1())} ⟶ ${format(calculateEffects.S3Extra1(player.researchesExtra[3][1] + 1))})`,
                () => "'Gravitational field' will now be able to boost Protoplanets, but at reduced strength. (2x boost)",
                () => `'Gas' will be a little stronger.\n(Boost: ${format(new Overlimit(player.buildings[3][1].current).power(calculateEffects.S3Upgrade1(player.researchesExtra[3][3] + 1) - calculateEffects.S3Upgrade1()).toNumber(), { padding: true })})`,
                () => `Submerge quicker by boosting Puddles, improved by current Rank.\n(Current boost: ${format(calculateEffects.S3Extra4())} ⟶ ${format(calculateEffects.S3Extra4(player.researchesExtra[3][4] + 1))})`
            ],
            cost: [],
            startCost: [1e-18, 1e-16, 1e26, 1e-6, 1e-10],
            scaling: [10, 100, 1, 1e5, 1e12],
            max: [12, 5, 1, 8, 1],
            maxActive: 4
        }, { //Stage 4
            name: [
                'Nova',
                'Mass transfer',
                'White dwarfs'
            ],
            effectText: [
                () => 'This violent stellar explosion is main source of Elements, but will also start new Star formation.\nUnlock new Structure and even more, after Collapse of that Structure.',
                () => `Star material will transfer from one Star to another, improving Solar mass gain${player.inflation.vacuum ? ' (also delaying Preons hardcap)' : ''} by ${format(calculateEffects.S4Extra1())}.\nImproved by 'Star system' levels and also improves its scaling (effect increase for 'Star system' is ${format(new Overlimit(calculateEffects.S4Research1(undefined, 1) / calculateEffects.S4Research1(undefined, 0)).power(global.collapseInfo.trueStars), { padding: true })}).`,
                () => `After matter were dispeled from Red giant, White dwarf was all that remained. Will improve effect of '[6] Carbon' by +${format(0.5)} and increase max level of 'Star system' by +1.`
            ],
            cost: [],
            startCost: [4e4, 2e9, 1e54],
            scaling: [1e10, 1, 1],
            max: [3, 1, 1],
            maxActive: 3
        }, { //Stage 5
            name: [
                'Hypercompact stellar system'
            ],
            effectText: [
                () => `Super dense core which will allow creation of a new Structure. That Structure will increase Stage reset reward, boost Nebulas and Star clusters, but creating it fully resets ${player.inflation.vacuum ? 'all' : 'Interstellar and Intergalactic'} Stages${player.inflation.vacuum ? ", Energy from creating it won't reset on this or any lower Reset tiers" : ''}.`
            ],
            cost: [],
            startCost: [1e80],
            scaling: [1],
            max: [1],
            maxActive: 1
        }
    ],
    researchesAutoInfo: {
        name: [
            'Upgrade automatization'
        ],
        effectText: [
            () => `Automatically create all ${['Upgrades', 'Stage Researches', 'Special Researches'][Math.min(player.researchesAuto[0], 2)]} from any Stage. (Need to be enabled in Settings)`
        ],
        costRange: [
            [1e13, 8e34, 1e30]
        ],
        autoStage: [ //Stage to buy from (1 per level)
            [2, 3, 4]
        ],
        max: [3]
    },
    ASRInfo: { //Auto Structures Research
        name: 'Auto Structures',
        effectText: () => {
            const stageIndex = player.stage.active;
            const autoIndex = Math.min(player.ASR[stageIndex] + 1, global.ASRInfo.max[stageIndex]);
            return `Automatically make ${player.buildings[stageIndex][autoIndex].highest.moreThan('0') ? global.buildingsInfo.name[stageIndex][autoIndex] : '(unknown)'} (counts as self-made).\n(Auto will wait until ${format(player.stage.true >= 3 ? player.toggles.shop.wait[stageIndex] : 2)} times of the Structure cost)`;
        },
        costRange: [ //Random scaling
            [],
            [4000, 12000, 20000, 36000, 60000],
            [1e10, 1e14, 1e18, 1e23, 1e28, 1e30],
            [1e-7, 1e10, 5e29, 2e30, 2e36],
            [1e6, 1e17, 1e28, 1e39, 1e54],
            [1e58, 1e62, 1e100]
        ],
        max: [0, 3, 5, 4, 4, 2]
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
            () => 'Most basic Element, increases Brown dwarf production by 2.',
            () => `Fusion reaction by product, makes Interstellar Stars cost scale -${format(0.1)} less.`,
            () => `First metal, Solar mass gain${player.inflation.vacuum ? ' (and hardcap for Cosmic dust)' : ''} per Brown dwarf will be lightly increased.`,
            () => `Brittle earth metal, so is brittle increase to production. (${format(1.2)}x to all Stars)`,
            () => `A new color, and a new boost to Solar mass gain${player.inflation.vacuum ? ' (and delay to Cosmic dust hardcap)' : ''} that is based on current Dwarf Stars.`,
            () => `Base for organics, boost from Red giants will now be increased by ^${format(calculateEffects.element6())}.`,
            () => "Most abundant uncombined Element in atmosphere of some Planets that allows to have 2 extra levels of 'Star system'.",
            () => `An oxidizing agent that will make Interstellar Stars cost scale even slower. (-${format(0.05)} less)`,
            () => "Highly toxic and reactive, +12 to max level of 'Planetary system'.",
            () => `A noble 2x boost to Solar mass gain${player.inflation.vacuum ? ' and delay to Preons hardcap' : ''}.`,
            () => "Through leaching will get 1 extra level of 'Protoplanetary disk'.",
            () => `Stars are inside you, as well Neutrons stars strength will be increased by log${format(calculateEffects.element12())}.`,
            () => `Has a great affinity towards Oxygen and to decrease cost for all Stars by ${format(1e3)}.`,
            () => `Just another tetravalent metalloid, and so is another ${format(1.4)}x boost to all Stars.`,
            () => `One of the Fundamentals of Life and to make all Stars boost Solar mass gain${player.inflation.vacuum ? ' and also delay Cosmic dust hardcap' : ''}.`,
            () => "From hot area to increase max level of 'Star system' by 1.",
            () => "Extremely reactive to extend max level of 'Planetary system', by another 24 levels.",
            () => 'Less noble, but Black holes effect will scale better.',
            () => "Don't forget about it and will get a 2x boost to all Stars.",
            () => "Get stronger with 1 extra level of 'Star system'.",
            () => `A new color and a rare bonus of ^${format(1.1)} to effective Solar mass amount, but only affects Solar mass effect.`,
            () => 'New alloy that allows Red giants to be added into effective amount of Neutron stars.',
            () => `Catalyst for production of Elements. 'Gamma-ray burst' effect will be increased by Solar mass ^${format(0.1)}.\n(Effect increase: ${format(player.collapse.mass ** 0.1, { padding: true })})`,
            () => { //[24]
                const power = calculateEffects.element24();
                return `No corrosion, only boost to all Stars that is based on unspent Elements ^${format(power)}.\n(Boost to Stars: ${format(new Overlimit(player.buildings[4][0].current).power(power), { padding: true })})`;
            },
            () => "Brittle Element, but not the bonus - 1 more level in 'Star system'.",
            () => { //[26]
                const base = calculateEffects.element26();
                return `Any further fusion will be an endothermic process. ${player.inflation.vacuum ? `Unlock Stage reset and a new Star type${player.strangeness[5][5] >= 1 ? ', as well Intergalactic Stage' : ''}` : 'Enter Intergalactic space'}.\n(${player.inflation.vacuum || player.strange[0].total >= 1 ? `Current base increase for Stage reset reward is ${format(base, { padding: base >= 1e6 })}, improve it further with every new digit of Elements produced this Stage` : 'Can change active Stage from footer'})`;
            },
            () => 'Combined and ready to make all self-made Red supergiants count as Red giants, and boost all Stars by 3.',
            () => `Slow to react, but will improve '[24] Chromium' Element by +${player.inflation.vacuum || player.milestones[1][1] >= 6 ? format(0.2) : `${format(0.05)}, not yet at full power, requires more Energy`}.`
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
                'Fundamental boost',
                'Better improvement',
                'Cheaper Discharge',
                'Free Discharge',
                'Automatic Discharge',
                'Auto Structures',
                'Strange boost',
                'Energy increase',
                'Conservation of Mass',
                'Conservation of Energy'
            ],
            effectText: [
                () => 'Boost all Microworld Structures by 2.',
                () => "Base for 'Improved Tritium' Research will be bigger by +2.",
                () => `Discharge goals requirement will scale slower. (-${format(0.5)})`,
                () => `Obtain +${format(0.5)} bonus Discharge goals.`,
                () => `Automatically Discharge upon reaching next goal or spending Energy. (Need to be enabled in Settings)${global.strangenessInfo[1].max[4] > 1 ? '\nSecond level will allow to gain Discharge goals based on current Energy instead of needing to reset.' : ''}`,
                () => 'Make auto for all Microworld Structures permanent.',
                () => `Unspent Strange quarks will boost Microworld by improving its Structures.\n(Current effect: ${format(global.strangeInfo.stageBoost[1], { padding: true })})`,
                () => 'Increase Energy gain from creating Preons by +2.',
                () => 'No Mass will be lost when creating Preons, only works when Accretion Stage is unlocked.',
                () => 'No Energy will be lost when creating any Upgrades or Researches, only works when Interstellar Stage is unlocked.'
            ],
            cost: [],
            startCost: [1, 2, 1, 4, 12, 2, 24, 2, 16, 15600],
            scaling: [2.46, 4, 6, 8, 100, 1, 1, 6, 1, 1],
            max: [6, 2, 4, 2, 1, 1, 1, 2, 1, 1],
            maxActive: 7
        }, { //Stage 2
            name: [
                'More Moles',
                'Bigger Puddles',
                'More spread',
                'Cloud density',
                'Automatic Vaporization',
                'Auto Structures',
                'Strange boost',
                'Better water flow',
                'Mechanical spread',
                'Ocean world'
            ],
            effectText: [
                () => `Moles will ${player.inflation.vacuum ? 'improve' : 'produce'} 2 times more.`,
                () => `Puddles will produce ${format(1.8)} times more.`,
                () => { //[2]
                    let extraText = 'none';
                    if (player.strangeness[2][2] >= 1) { extraText = "max level increased for 'More streams' (+1)"; }
                    if (player.strangeness[2][2] >= 2) { extraText += " and 'Distributary channel' (+1)"; }
                    if (player.strangeness[2][2] >= 3) { extraText += ", a new Upgrade - 'Tsunami'"; }
                    return `Increase max level for one of Researches.\nFinal level will instead unlock a new Upgrade.\n(Current effect: ${extraText})`;
                },
                () => 'Decrease required Drops quantity for a Cloud by 2 times.',
                () => `Automatically Vaporize when reached enough boost from new Clouds. (Need to be enabled in Settings)${global.strangenessInfo[2].max[4] > 1 ? `\nSecond level will allow to automatically gain ${format(2.5)}% of Clouds per second. (Not affected by global speed)` : ''}`,
                () => 'Make auto for all Submerged Structures permanent.',
                () => `Unspent Strange quarks will boost Submerged by improving Puddles.\n(Current effect: ${format(global.strangeInfo.stageBoost[2], { padding: true })})`,
                () => `With improved flow all Submerged Structures that improve other Submerged Structures will do it ${format(1.4)} times stonger.`,
                () => { //[8]
                    let extraText = 'none';
                    if (player.strangeness[2][8] >= 1) { extraText = "max level increased for 'Stronger surface tension' (+3)"; }
                    if (player.strangeness[2][8] >= 2) { extraText += " and 'Stronger surface stress' (+1)"; }
                    if (player.strangeness[2][8] >= 3) { extraText += ", a new Upgrade - 'Tide'"; }
                    return `Increase max level for one of Researches.\nFinal level will instead unlock an even better new Upgrade.\n(Current effect: ${extraText})`;
                },
                () => `Increase Stage reset reward based on current Cloud amount.\n(Current effect: ${format(calculateEffects.S2Strange9(), { padding: true })})`
            ],
            cost: [],
            startCost: [1, 1, 2, 4, 12, 4, 24, 80, 1200, 9600],
            scaling: [2.46, 2, 3, 6, 800, 1, 1, 3.4, 3, 1],
            max: [6, 8, 3, 2, 1, 1, 1, 4, 3, 1],
            maxActive: 7
        }, { //Stage 3
            name: [
                'Faster Accretion',
                'Intense weathering',
                'More levels',
                'Improved Satellites',
                'Automatic Rank',
                'Auto Structures',
                'Upgrade automatization',
                'Strange boost',
                'Mass delay',
                'Rank raise'
            ],
            effectText: [
                () => 'Increase strength of Cosmic dust by 2.',
                () => `Accretion Structures that produce other Structures now do it ${format(1.8)} times faster.`,
                () => { //[2]
                    let extraText = 'none';
                    if (player.strangeness[3][2] >= 1) { extraText = "max level increased for 'Rank boost' (+9)"; }
                    if (player.strangeness[3][2] >= 2) { extraText += " and 'Efficient growth' (+3)"; }
                    if (player.strangeness[3][2] >= 3) { extraText += ", a new Upgrade - 'Hydrostatic equilibrium'"; }
                    return `Increase max level for one of the Rank Researches.\nFinal level will instead unlock a new Upgrade.\n(Current effect: ${extraText})`;
                },
                () => `Satellites will now be able to improve all${player.inflation.vacuum ? ' lower tier' : ''} Accretion Structures with reduced strength (^${format(player.inflation.vacuum ? 0.2 : 0.3)}).`,
                () => `Automatically increase Rank when possible. (Need to be enabled in Settings)${global.strangenessInfo[3].max[4] > 1 ? '\nSecond level will make auto Rank to always keep enough Mass for highest Solar mass conversion from Collapse by disabling Accretion auto Structures if Cosmic dust is hardcapped' : ''}`,
                () => 'Make auto for all Accretion Structures permanent.',
                () => `Always automatically create all ${['Upgrades', 'Stage Researches', 'Special Researches'][Math.min(player.strangeness[3][6], 2)]} from any Stage. (Need to be enabled in Settings)`,
                () => `Unspent Strange quarks will boost Accretion by making its Structures cheaper.\n(Current effect: ${format(global.strangeInfo.stageBoost[3], { padding: true })})`,
                () => `Delay Cosmic dust hardcap by ${format(1.4)} per level.\n(Will delay Preons hardcap instead if inside the Void)`,
                () => 'Unlock a new Accretion Rank to achieve.'
            ],
            cost: [],
            startCost: [1, 2, 4, 16, 12, 4, 4, 24, 9600, Infinity],
            scaling: [2, 3.4, 2, 1, 400, 1, 1.74, 1, 2.46, 1],
            max: [8, 4, 3, 1, 1, 1, 3, 1, 6, 1],
            maxActive: 8
        }, { //Stage 4
            name: [
                'Hotter Stars',
                'Cheaper Stars',
                'New Upgrade',
                'Main giants',
                'Automatic Collapse',
                'Auto Structures',
                'Element automatization',
                'Strange boost',
                'Neutronium',
                'Newer Upgrade'
            ],
            effectText: [
                () => `All Stars will produce ${format(1.8)} times more Elements.`,
                () => 'Stars will be 2 times cheaper.',
                () => { //[2]
                    let extraText = 'none';
                    if (player.strangeness[4][2] >= 1) { extraText = "'Planetary nebula' (Stage Research)"; }
                    if (player.strangeness[4][2] >= 2) { extraText += ", 'Helium fusion' (Upgrade)"; }
                    if (player.strangeness[4][2] >= 3) { extraText += ", 'White dwarfs' (Collapse Research)"; }
                    return `Unlock a new Upgrade.\n(Current unlocks: ${extraText})`;
                },
                () => '10% of Brown dwarfs will turn into Red giants.',
                () => `Automatically Collapse once reached enough boost. (Need to be enabled in Settings)${global.strangenessInfo[4].max[4] > 1 ? '\nSecond level will allow to automatically gain Star remnants without needing to reset.' : ''}`,
                () => 'Make auto for all Interstellar Structures permanent.',
                () => `Elements will not require Collapse for activation.\nSecond level will unlock auto creation of Elements. (${global.strangenessInfo[4].max[6] > 1 ? 'Need to be enabled in settings' : 'Not yet unlocked for Interstellar space'})`,
                () => `Unspent Strange quarks will boost Interstellar by improving all Stars.\n(Current effect: ${format(global.strangeInfo.stageBoost[4], { padding: true })})`,
                () => `Increase effective amount of Neutron stars (doesn't include ones from '[22] Titanium') by 1 + level, improve Neutron Stars strength by +^${format(0.125)} and '[12] Magnesium' log base by -1.`,
                () => 'Unlock yet another new Upgrade.\n(Current unlocks: none)'
            ],
            cost: [],
            startCost: [1, 2, 4, 4, 12, 6, 6, 24, 6400, Infinity],
            scaling: [2, 3.4, 3, 4, 1300, 1, 2, 1, 2, 3],
            max: [8, 4, 3, 2, 1, 1, 1, 1, 8, 3],
            maxActive: 8
        }, { //Stage 5
            name: [
                'Omnipresent reality',
                'Strange gain',
                'Automatic Stage',
                'Bigger Nebulas',
                'Denser Clusters',
                'Gravitational bound',
                'Auto Structures',
                'Strange boost',
                'Strange growth'
            ],
            effectText: [
                () => player.inflation.vacuum ? 'Unlock the Void (advanced subtab).\nAlso 20% global speed bonus while outside of Void.' : `${global.stageInfo.word[player.strangeness[5][0] + 1]} will now be permanent and removed from Stage reset cycle.\nPermanent Stages do not affect Stage time.`,
                () => `Gain 2 times more Strange quarks from${player.inflation.vacuum ? '' : ' Interstellar'} Stage resets.`,
                () => 'Automatically trigger Stage reset. (Need to be enabled in Settings)',
                () => "Bigger Nebulas, more matter for Accretion. (Flavor text)\n'Jeans instability' will be 2 times stronger.",
                () => "'Super star cluster' will be even bigger. Increase effect by 3.",
                () => player.inflation.vacuum ? 'Unlock Intergalactic Stage.' : 'Intergalactic Stage will no longer be affected by Collapse reset.\nAlso unlock first Intergalactic Milestone which as a reward will unlock better auto for Elements and more.',
                () => `Make auto for first two Intergalactic Structures permanent${player.stage.true >= 6 || player.buildings[5][3].highest.moreThan('0') ? ' and also prevent rest from resetting' : ''}.`,
                () => `Unspent Strange quarks will boost Intergalactic by increasing Solar mass gain.\n(Current effect: ${format(global.strangeInfo.stageBoost[5], { padding: true })})`,
                () => 'Unlock another Strange Structure.\n(Click on Structure to see its effects)'
            ],
            cost: [],
            startCost: [4, 24, 360, 24, 36, 36, 40, 120, 6000],
            scaling: [1, 10, 1, 2, 2, 1, 1, 1, 1],
            max: [3, 1, 1, 8, 8, 1, 1, 1, 1],
            maxActive: 8
        }
    ],
    lastUpgrade: [[-1, 'upgrades'], [-1, 'upgrades'], [-1, 'upgrades'], [-1, 'upgrades'], [-1, 'upgrades'], [-1, 'researches']],
    lastElement: -1,
    lastStrangeness: [-1, -1],
    lastMilestone: [-1, -1],
    lastChallenge: [-1, -1],
    milestonesInfo: [
        {} as globalType['milestonesInfo'][0], { //Stage 1
            name: [
                'Fundamental Matter',
                'Energized'
            ],
            needText: [
                () => `Produce at least ${format(global.milestonesInfo[1].need[0])} Quarks this reset.`,
                () => `Have current Energy reach ${format(global.milestonesInfo[1].need[1])}.`
            ],
            rewardText: [
                () => "Unknown Structure, it doesn't belong to this Universe.\nVacuum instability increased.",
                () => "Unlock full strength of '[28] Nickel'."
            ],
            need: [new Overlimit('1e160'), new Overlimit('2.4e4')],
            scaling: [
                [1e160, 1e170, 1e180, 1e190, 1e205, 1e220],
                [24000, 25000, 26000, 27000, 28500, 30000]
            ]
        }, { //Stage 2
            name: [
                'A Nebula of Drops',
                'Just a bigger Puddle'
            ],
            needText: [
                () => `Vaporize with at least ${format(global.milestonesInfo[2].need[0])} Drops this reset.`,
                () => `Have at least ${format(global.milestonesInfo[2].need[1])} Puddles at same time.`
            ],
            rewardText: [
                () => 'A new Intergalactic Structure. (Nebula)',
                () => "Unknown Structure, it doesn't belong to this Universe.\nVacuum instability increased."
            ],
            need: [new Overlimit('1e30'), new Overlimit('1.5e3')],
            scaling: [
                [1e30, 1e34, 1e38, 1e42, 1e47, 1e52, 1e58],
                [1500, 2500, 3500, 5000, 6500, 8000, 10000]
            ]
        }, { //Stage 3
            name: [
                'Cluster of Mass',
                'Satellites of Satellites'
            ],
            needText: [
                () => `Produce at least ${format(global.milestonesInfo[3].need[0])} Mass this reset.`,
                () => `Have more or equal to ${format(global.milestonesInfo[3].need[1])} Satellites.`
            ],
            rewardText: [
                () => 'A new Intergalactic Structure. (Star cluster)',
                () => "Unknown Structure, it doesn't belong to this Universe.\nVacuum instability increased."
            ],
            need: [new Overlimit('1e32'), new Overlimit('24')],
            scaling: [
                [1e32, 1e35, 1e38, 1e41, 1e44, 1e47, 1e50],
                [24, 28, 32, 36, 42, 48, 54]
            ]
        }, { //Stage 4
            name: [
                'Supermassive',
                'Biggest of all'
            ],
            needText: [
                () => `Collapse to at least ${format(global.milestonesInfo[4].need[0])} Solar mass.`,
                () => `Collapse to ${format(global.milestonesInfo[4].need[1])} Black holes or more.`
            ],
            rewardText: [
                () => 'New Intergalactic themed Strangeness.',
                () => "Unknown Structure, it doesn't belong to this Universe.\nVacuum instability increased."
            ],
            need: [new Overlimit('9e3'), new Overlimit('1e2')],
            scaling: [
                [9000, 11000, 13000, 15000, 17000, 19000, 21500, 24000],
                [100, 115, 130, 145, 160, 180, 200, 220]
            ]
        }, { //Stage 5
            name: [
                'Light in the dark',
                'End of Greatness'
            ],
            needText: [
                () => `Have self-made Stars count reach at least ${format(global.milestonesInfo[5].need[0])}.`,
                () => `Have ${format(global.milestonesInfo[5].need[1])} self-made Galaxies or more.`
            ],
            rewardText: [
                () => "Unlock last Milestone and new Intergalactic Research.\nAlso increase max level of 'Element automatization'.",
                () => 'Unknown Structure, it cannot exist in false Vacuum.\nVacuum instability increased.'
            ],
            need: [new Overlimit('1.5e3'), new Overlimit('2')],
            scaling: [
                [1500, 1550, 1600, 1650, 1700, 1750, 1850, 2000],
                [2, 4, 6, 8, 10, 13, 16, 20]
            ]
        }
    ],
    challengesInfo: {
        name: [
            'Void'
        ],
        description: [
            'Result of Vacuum Instabillity, investigate at your own will\n(Entering will force a Stage reset)'
        ],
        effectText: [
            () => {
                const progress = player.challenges.void;
                let text = `<span class="orangeText">- Discharge base is divided by 2${progress[1] >= 2 ? '\n- Energy gain from creating non Microworld Structures is decreased by 50%' : ''}</span>`;
                if (progress[1] >= 3) { text += `\n\n<span class="blueText">- Effective Drops amount is capped at 1\n- Puddles are ${format(2000)} times weaker\n- Clouds gain is decreased by ^${format(0.8)}</span>`; }
                if (progress[1] >= 2) { text += `\n\n<span class="grayText">- Cosmic dust is softcapped (^${format(0.9)})${progress[3] >= 4 ? `\n- Softcap is stronger after reaching 'Jovian planet' Rank (^${format(0.8)})` : ''}</span>`; }
                if (progress[3] >= 5) { text += `\n\n<span class="orchidText">- Solar mass effect is ${format(2e4)} times weaker\n- Effective Solar mass amount above 1 is ^${format(0.4)}\n- Solar mass gain from Stars is decreased by ${format(1.6)}</span>`; }
                if (progress[5] >= 1) { text += '\n\n<span class="cyanText">- First 2 Intergalactic Upgrades are weaker</span>'; }
                const left = progress[1] < 2 ? 'orange' : progress[3] < 5 ? 'gray' : progress[5] < 1 ? 'orchid' : null;
                if (left !== null) { text += `\n<span class="${left}Text">More will be shown after getting further into Void</span>`; }
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
                ['Unlock Intergalactic', 'Create a Galaxy']
            ]
        ],
        rewardText: [
            [
                [],
                ["'Energy increase' (Microworld)", "'Conservation of Mass' (Microworld)", "'Better water flow' (Submerged)"],
                ["'Mechanical spread' (Submerged)", "'Ocean world' (Submerged)"],
                ['Multiple max level increases', 'Multiple max level increases', 'Multiple max level increases', 'Multiple max level increases', "'Strange growth' (Intergalactic)"],
                ['Max level increased for Auto resets', "'Conservation of Energy' (Microworld)", "'Neutronium' (Interstellar)", "'Mass delay' (Accretion)"],
                ["'Newer Upgrade' (Interstellar)", "'Rank raise' (Accretion)"]
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

/** Not for deep copy, works on Overlimit, but not prefered */
export const cloneArray = <ArrayClone extends Array<number | string | boolean | null | undefined>>(array: ArrayClone) => array.slice(0) as ArrayClone;
//Actual type is any[], it's because TS is dumb; [...array] will be better after ~>10000 keys

/** For non deep clone use { ...object } or cloneArray when possible */
export const deepClone = <CloneType>(toClone: CloneType): CloneType => {
    if (typeof toClone !== 'object' || toClone === null) { return toClone; }

    let value: any;
    if (Array.isArray(toClone)) {
        if (toClone instanceof Overlimit) { return new Overlimit(toClone) as CloneType; }

        value = []; //Faster this way
        for (let i = 0; i < toClone.length; i++) { value.push(deepClone(toClone[i])); }
    } else {
        value = {};
        for (const check in toClone) { value[check] = deepClone(toClone[check]); }
    }
    return value;
};

/** Does not clone given value */
export const createArray = <startValue extends number | string | boolean | null | undefined>(length: number, value: startValue) => {
    const array = [];
    for (let i = 0; i < length; i++) {
        array.push(value);
    }
    return array;
};

for (let s = 0; s < global.buildingsInfo.startCost.length; s++) {
    global.buildingsInfo.producing[s] = [];
    for (let i = 0; i < global.buildingsInfo.startCost[s].length; i++) {
        global.buildingsInfo.producing[s].push(new Overlimit('0'));
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
        createArray(global.upgradesInfo[1].startCost.length, 0),
        createArray(global.upgradesInfo[2].startCost.length, 0),
        createArray(global.upgradesInfo[3].startCost.length, 0),
        createArray(global.upgradesInfo[4].startCost.length, 0),
        createArray(global.upgradesInfo[5].startCost.length, 0)
    ],
    researches: [
        [],
        createArray(global.researchesInfo[1].startCost.length, 0),
        createArray(global.researchesInfo[2].startCost.length, 0),
        createArray(global.researchesInfo[3].startCost.length, 0),
        createArray(global.researchesInfo[4].startCost.length, 0),
        createArray(global.researchesInfo[5].startCost.length, 0)
    ],
    researchesExtra: [
        [],
        createArray(global.researchesExtraInfo[1].startCost.length, 0),
        createArray(global.researchesExtraInfo[2].startCost.length, 0),
        createArray(global.researchesExtraInfo[3].startCost.length, 0),
        createArray(global.researchesExtraInfo[4].startCost.length, 0),
        createArray(global.researchesExtraInfo[5].startCost.length, 0)
    ],
    researchesAuto: createArray(global.researchesAutoInfo.costRange.length, 0),
    ASR: createArray(global.ASRInfo.costRange.length, 0),
    maxASR: createArray(global.ASRInfo.costRange.length, 0),
    elements: createArray(global.elementsInfo.startCost.length, 0),
    strangeness: [
        [],
        createArray(global.strangenessInfo[1].startCost.length, 0),
        createArray(global.strangenessInfo[2].startCost.length, 0),
        createArray(global.strangenessInfo[3].startCost.length, 0),
        createArray(global.strangenessInfo[4].startCost.length, 0),
        createArray(global.strangenessInfo[5].startCost.length, 0)
    ],
    milestones: [
        [],
        createArray(global.milestonesInfo[1].need.length, 0),
        createArray(global.milestonesInfo[2].need.length, 0),
        createArray(global.milestonesInfo[3].need.length, 0),
        createArray(global.milestonesInfo[4].need.length, 0),
        createArray(global.milestonesInfo[5].need.length, 0)
    ]
});
Object.assign(player.toggles, {
    confirm: createArray(document.getElementsByClassName('toggleConfirm').length, 'All'),
    buildings: [
        [],
        createArray(player.buildings[1].length, false),
        createArray(player.buildings[2].length, false),
        createArray(player.buildings[3].length, false),
        createArray(player.buildings[4].length, false),
        createArray(player.buildings[5].length, false)
    ],
    hover: createArray(document.getElementsByClassName('toggleHover').length, false),
    max: createArray(document.getElementsByClassName('toggleMax').length, false),
    auto: createArray(document.getElementsByClassName('toggleAuto').length, false)
});

//player.example = playerStart.example; Is not allowed (if example is an array or object), instead iterate or create clone
export const playerStart = deepClone(player);

export const updatePlayer = (load: playerType): string => {
    if (load['player' as keyof unknown] !== undefined) { load = load['player' as keyof unknown]; }
    if (load.vaporization === undefined) { throw new ReferenceError('This save file is not from this game or too old'); }
    if (load.version === undefined) { load.version = '0.0.0'; }
    prepareVacuum(Boolean(load.inflation?.vacuum)); //Only to set starting buildings values

    const oldVersion = load.version;
    if (oldVersion !== playerStart.version) {
        if (load.version === '0.0.0') {
            load.version = 'v0.0.1';
            load.researchesExtra = []; //Required for v0.0.9
        }
        if (load.version === 'v0.0.1') {
            load.version = 'v0.0.2';
            load.stage.resets = load.stage.current - 1;
        }
        if (load.version === 'v0.0.2') {
            load.version = 'v0.0.3';
            load.accretion = deepClone(playerStart.accretion);
        }
        if (load.version === 'v0.0.3') {
            load.version = 'v0.0.4';
            delete load['energy' as keyof unknown];
            delete load['buyToggle' as keyof unknown];
        }
        if (load.version === 'v0.0.4') {
            load.version = 'v0.0.5';
            load.elements = cloneArray(playerStart.elements);
            load.collapse = deepClone(playerStart.collapse);
        }
        if (load.version === 'v0.0.5' || load.version === 'v0.0.6') {
            load.version = 'v0.0.7';
            load.fileName = playerStart.fileName; //Can be moved into v0.2.0 eventually
            load.strange = deepClone(playerStart.strange);
            load.strangeness = deepClone(playerStart.strangeness);
        }
        if (load.version === 'v0.0.7' || load.version === 'v0.0.8') {
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
            load.ASR = cloneArray(playerStart.ASR);
            load.milestones = deepClone(playerStart.milestones);
        }
        if (load.version === 'v0.0.9' || load.version === 'v0.1.0') {
            load.version = 'v0.1.1';
            load.discharge.energy = 0;
            load.collapse.massMax = load.collapse.mass;
            delete load.discharge['energyCur' as keyof unknown];
        }
        if (load.version === 'v0.1.1') {
            load.version = 'v0.1.2';
            for (let s = 1; s < load.buildings.length; s++) {
                for (let i = 0; i < load.buildings[s].length; i++) {
                    const building = load.buildings[s][i];
                    building.current = new Overlimit(building.current);
                    building.total = new Overlimit(building.total);
                    building.trueTotal = new Overlimit(building.total); //Intentional
                    building.highest = new Overlimit(building.current);
                }
            }
            if (load.strange[0]['true' as keyof unknown] !== undefined) { load.strange[0].current = load.strange[0]['true' as 'current']; }
            load.strange[0].total = load.strange[0].current;
            load.inflation = deepClone(playerStart.inflation);
            delete load.vaporization['current' as keyof unknown];
            delete load.strange[0]['true' as keyof unknown];
            load.time.offline = 0;
        }
        if (load.version === 'v0.1.2') {
            load.version = 'v0.1.3';
            load.stage.time = 0;
            load.inflation.age = 0;
            load.discharge.energyMax = load.discharge.energy;
            load.vaporization.cloudsMax = new Overlimit(load.vaporization.clouds);
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
            load.history = deepClone(playerStart.history); //Can be moved into v0.2.0 eventually
            load.challenges = deepClone(playerStart.challenges);
            delete load.time['disabled' as keyof unknown];
            delete load.discharge['unlock' as keyof unknown];
        }
        if (load.version === 'v0.1.6') {
            load.version = 'v0.1.7';
            if (load.buildings[5].length > 4) { load.buildings[5].length = 4; }
            delete load['saveUpdate016' as keyof unknown];
            delete load.accretion['input' as keyof unknown];
            delete load.collapse['elementsMax' as keyof unknown];
        }
        if (load.version === 'v0.1.7') {
            load.version = 'v0.1.8';
            load.time.online = load.inflation.age;
            load.time.universe = load.inflation.age;
            load.time.stage = load.stage.time;
        }
        if (load.version === 'v0.1.8') {
            load.version = 'v0.1.9';
            load.toggles = deepClone(playerStart.toggles);
            load.researchesAuto = cloneArray(playerStart.researchesAuto);
            delete load.discharge['bonus' as keyof unknown];
        }
        if (load.version === 'v0.1.9') {
            load.version = 'v0.2.0';
            load.stage.peak = 0;
            load.stage.input = 0;
            load.vaporization.input = cloneArray(playerStart.vaporization.input);
            load.collapse.input = cloneArray(playerStart.collapse.input);
            load.time.export = cloneArray(playerStart.time.export);
            //load.history = deepClone(playerStart.history);
            load.events = cloneArray(playerStart.events);
            //load.fileName = playerStart.fileName;
            delete load['event' as keyof unknown];
            delete load['separator' as keyof unknown];
            delete load['intervals' as keyof unknown];
            delete load.stage['best' as keyof unknown];
            delete load.stage['export' as keyof unknown];
            delete load.toggles['normal' as keyof unknown];
            delete load.toggles.shop['howMany' as keyof unknown];

            /* Can be removed eventually */
            load.strangeness[1].splice(1, 0, load.strangeness[1].splice(5, 1)[0]);
            load.strangeness[1].splice(7, 1);
            load.strangeness[1].splice(4, 1);
            load.strangeness[2].splice(8, 1);
            load.strangeness[2].splice(6, 1);
            load.strangeness[3].splice(10, 1);
            load.strangeness[3].splice(8, 1);
            load.strangeness[4].splice(6, 0, load.strangeness[4].splice(4, 1)[0]);
            load.strangeness[4].splice(9, 1);
            load.strangeness[4].splice(7, 1);
            load.strangeness[5].splice(8, 1);
            load.strangeness[5].splice(6, 1);
            load.fileName = load.fileName.replace('[date]', '[dateD.M.Y]').replace('[time]', '[timeH-M-S]');
            if (load.researchesAuto.length > 1) { load.researchesAuto.length = 1; }
            if (load.inflation.vacuum) { load.milestones = deepClone(playerStart.milestones); }
            const stageHistory = load.history.stage;
            if (stageHistory.best.length < 4) {
                const old = cloneArray(stageHistory.best);
                stageHistory.best = [old[1], old[0], 0, 0];
                for (let i = 0; i < stageHistory.list.length; i++) {
                    const old = stageHistory.list[i];
                    stageHistory.list[i] = [old[1], old[0], 0, 0];
                }
            }
        }

        if (load.version !== playerStart.version) {
            throw new ReferenceError('Save file version is higher than game version');
        }
    }

    for (let s = 1; s <= 5; s++) {
        for (let i = load.buildings[s].length; i < playerStart.buildings[s].length; i++) {
            load.buildings[s][i] = deepClone(playerStart.buildings[s][i]);
        }
        for (let i = load.toggles.buildings[s].length; i < playerStart.toggles.buildings[s].length; i++) {
            load.toggles.buildings[s][i] = false;
        }
        if (isNaN(load.toggles.shop.wait[s])) { load.toggles.shop.wait[s] = 2; }

        for (let i = load.upgrades[s].length; i < playerStart.upgrades[s].length; i++) {
            load.upgrades[s][i] = 0;
        }
        for (let i = load.researches[s].length; i < playerStart.researches[s].length; i++) {
            load.researches[s][i] = 0;
        }
        for (let i = load.researchesExtra[s].length; i < playerStart.researchesExtra[s].length; i++) {
            load.researchesExtra[s][i] = 0;
        }
        if (load.ASR[s] === undefined) {
            load.ASR[s] = 0;
        }

        for (let i = load.strangeness[s].length; i < playerStart.strangeness[s].length; i++) {
            load.strangeness[s][i] = 0;
        }
        for (let i = load.milestones[s].length; i < playerStart.milestones[s].length; i++) {
            load.milestones[s][i] = 0;
        }
    }
    for (let i = load.strange.length; i < playerStart.strange.length; i++) {
        load.strange[i] = deepClone(playerStart.strange[i]);
    }

    for (let i = load.researchesAuto.length; i < playerStart.researchesAuto.length; i++) {
        load.researchesAuto[i] = 0;
    }
    for (let i = load.elements.length; i < playerStart.elements.length; i++) {
        load.elements[i] = 0;
    }

    for (let i = load.toggles.confirm.length; i < playerStart.toggles.confirm.length; i++) {
        load.toggles.confirm[i] = 'All';
    }
    for (let i = load.toggles.hover.length; i < playerStart.toggles.hover.length; i++) {
        load.toggles.hover[i] = false;
    }
    for (let i = load.toggles.max.length; i < playerStart.toggles.max.length; i++) {
        load.toggles.max[i] = false;
    }
    for (let i = load.toggles.auto.length; i < playerStart.toggles.auto.length; i++) {
        load.toggles.auto[i] = false;
    }

    for (let i = load.events.length; i < playerStart.events.length; i++) {
        load.events[i] = false;
    }

    /* Restore data post JSON parse */
    load.vaporization.clouds = new Overlimit(load.vaporization.clouds);
    load.vaporization.cloudsMax = new Overlimit(load.vaporization.cloudsMax);
    for (let s = 1; s < load.buildings.length; s++) {
        for (let i = 0; i < load.buildings[s].length; i++) {
            const building = load.buildings[s][i];
            building.current = new Overlimit(building.current);
            building.total = new Overlimit(building.total);
            building.trueTotal = new Overlimit(building.trueTotal);
            building.highest = new Overlimit(building.highest);
        }
    }
    Object.assign(player, load);

    /* Final preparations and fixes */
    global.debug.errorID = true;
    global.debug.errorQuery = true;
    global.debug.errorGain = true;

    global.vaporizationInfo.research0 = 0;
    global.vaporizationInfo.research1 = 0;
    const stars = player.buildings[4];
    global.collapseInfo.trueStars = stars[1].true + stars[2].true + stars[3].true + stars[4].true + stars[5].true;
    global.historyStorage.stage = player.history.stage.list;
    if (player.inflation.vacuum) {
        player.buildings[2][0].current.setValue(player.buildings[1][5].current).divide('6.02214076e23');
        player.buildings[3][0].current.setValue(player.buildings[1][0].current).multiply('1.78266192e-33');
        player.events[0] = true;
    } else {
        player.researchesAuto[0] = player.strangeness[3][6];
        if (player.accretion.rank === 0) { player.buildings[3][0].current.setValue('5.9722e27'); }
        calculateInstability();
    }
    if (player.stage.current < 5 && player.elements[26] >= 1) { player.elements[26] = 0; }

    for (let s = 1; s <= 5; s++) {
        const strangeness = player.strangeness[s];
        const strangenessMax = global.strangenessInfo[s].max;
        for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) {
            calculateMaxLevel(i, s, 'strangeness');
            if (strangeness[i] > strangenessMax[i]) {
                strangeness[i] = strangenessMax[i];
                visualUpdateResearches(i, s, 'strangeness');
            }
        }
        for (let i = 0; i < playerStart.milestones[s].length; i++) {
            calculateMilestoneInformation(i, s);
        }

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
        calculateMaxLevel(0, s, 'ASR');
    }
    for (let i = 0; i < playerStart.researchesAuto.length; i++) {
        visualUpdateResearches(i, 0, 'researchesAuto');
    }

    assignBuildingInformation();
    assignStrangeBoost();
    assignPuddles(true);
    assignMaxRank();
    calculateTrueEnergy(); //Also assignEnergyArray();

    /* Finish visuals */
    (getId('saveFileNameInput') as HTMLInputElement).value = player.fileName;
    (getId('stageInput') as HTMLInputElement).value = format(player.stage.input, { type: 'input' });
    (getId('vaporizationInput') as HTMLInputElement).value = format(player.vaporization.input[0], { type: 'input' });
    (getId('vaporizationInputMax') as HTMLInputElement).value = format(player.vaporization.input[1], { type: 'input' });
    (getId('collapseStarsInput') as HTMLInputElement).value = `${format(player.collapse.input[0], { type: 'input' })}${player.collapse.input[1] ? '!' : ''}`;
    (getId('stageResetsSave') as HTMLInputElement).value = `${player.history.stage.input[0]}`;
    (getId('stageResetsShow') as HTMLInputElement).value = `${player.history.stage.input[1]}`;
    for (let i = 0; i < playerStart.toggles.confirm.length; i++) { toggleConfirm(i); }
    for (let i = 0; i < playerStart.toggles.hover.length; i++) { toggleSwap(i, 'hover'); }
    for (let i = 0; i < playerStart.toggles.max.length; i++) { toggleSwap(i, 'max'); }
    for (let i = 0; i < playerStart.toggles.auto.length; i++) { toggleSwap(i, 'auto'); }
    (getId('buyAnyInput') as HTMLInputElement).value = format(player.toggles.shop.input, { type: 'input' });

    return oldVersion;
};

export const buildVersionInfo = () => {
    if (getId('closeVersionInfo', true) !== null) { return; }

    getId('versionInfo').innerHTML = `<div>
        <div id="versionText">
            <label>v0.2.0</label><p>- Reworked balance for all Stages\n- Many quality of life additions\n- Most of settings are now saved separate from save file\n- Some more work on Mobile device support\n\n- <a href="https://docs.google.com/document/d/1Kwy-NhKUx3cnfv04I5wwbr-WKyg3yZAZ4t-GA2AAm0k/edit?usp=sharing" target="_blank" rel="noopener noreferrer">Full changelog</a></p>
            <label>v0.1.9</label><p>- More true Vacuum balance\n- Reworked time related formats\n- Warp and Offline time usage reworked</p>
            <label>v0.1.8</label><p>- True Vacuum small balance changes\n- Upgrades and Researches merged\n- Added copy to clipboard, load from string save file options</p>
            <label>v0.1.7</label><p>- New content (Void)\n- Further balance changes</p>
            <label>v0.1.6</label><p>- Massive rebalance and reworks for all Stages</p>
            <label>v0.1.5</label><p>- True Vacuum minor balance\n- Images no longer unload\n- Screen reader support reworked</p>
            <label>v0.1.4</label><p>- Custom scrolls\n- Notifications</p>
            <label>v0.1.3</label><p>- True Vacuum balance changes\n- Submerged Stage minor balance\n- Replay event button\n\n- History for Stage resets</p>
            <label>v0.1.2</label><p>- New content (Vacuum)\n- Offline time reworked\n- Added version window (removed change log on game load)\n- Permanently removed text movement</p>
            <label>v0.1.1</label><p>- More balance changes for late game</p>
            <label>v0.1.0</label><p>- New content (Intergalactic)\n- Balance changes for late game</p>
            <label>v0.0.9</label><p>- New content (Milestones)\n- More Interstellar and late game balance</p>
            <label>v0.0.8</label><p>- Minor speed up to all Stages past Microworld</p>
            <label>v0.0.7</label><p>- New content (Strangeness)\n- Microworld Stage rework\n\n- Added stats for Save file name</p>
            <label>v0.0.6</label><p>- Added hotkeys list\n\n- Option to remove text movement\n- Ability to rename save file</p>
            <label>v0.0.5</label><p>- New content (Interstellar)\n- Basic loading screen\n\n- Added hotkeys</p>
            <label>v0.0.4</label><p>- Speed up to all Stages\n- Added events\n\n- Added numbers format</p>
            <label>v0.0.3</label><p>- New content (Accretion)\n- Submerged Stage extended\n- Offline time calculated better</p>
            <label>v0.0.2</label><p>- Stats subtab</p>
            <label>v0.0.1</label><p>- Submerged Stage rework\n- Added change log on game load\n\n- Mobile device support</p>
            <label>v0.0.0</label><p>- First published version\n\n- Submerged Stage placeholder</p>
        </div>
        <button type="button" id="closeVersionInfo">Close</button>
    </div>`;

    specialHTML.styleSheet.textContent += '#versionInfo > div { display: flex; flex-direction: column; justify-content: space-between; align-items: center; width: clamp(42vw, 36em, 80vw); height: clamp(26vh, 36em, 90vh); background-color: var(--window-color); border: 3px solid var(--window-border); border-radius: 12px; padding: 1em 1em 0.8em; row-gap: 1em; } #versionInfo button { flex-shrink: 0; width: 6em; border-radius: 4px; font-size: 0.92em; } #versionText { width: 100%; overflow-y: auto; } #versionText label { font-size: 1.18em; } #versionText p { line-height: 1.3em; white-space: pre-line; color: var(--white-text); margin-top: 0.2em; margin-bottom: 1.4em; } #versionText p:last-of-type { margin-bottom: 0; }';
    getId('closeVersionInfo').addEventListener('click', () => { getId('versionInfo').style.display = 'none'; });
};
