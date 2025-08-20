import Overlimit from './Limit';
import { cloneArray, deepClone, getId, getQuery, loadoutsLoadAuto, loadoutsRecreate, playerStart, toggleConfirm, toggleSwap } from './Main';
import { globalSave, specialHTML } from './Special';
import { calculateMaxLevel, assignMilestoneInformation, calculateEffects, autoUpgradesSet, autoResearchesSet, autoElementsSet, toggleSupervoid, assignBuildingsProduction, assignResetInformation, assignChallengeInformation, logAny } from './Stage';
import type { globalType, playerType } from './Types';
import { format, switchTab, updateCollapsePoints, visualTrueStageUnlocks } from './Update';

export const player: playerType = {
    version: 'v0.2.6',
    fileName: 'Fundamental, [dateD.M.Y] [timeH-M-S], [stage]',
    stage: {
        true: 1,
        current: 1,
        active: 1,
        resets: 0,
        time: 0,
        peak: 0,
        peakedAt: 0,
        input: 0
    },
    discharge: {
        energy: 0,
        energyMax: 0,
        current: 0
    },
    vaporization: {
        clouds: 0,
        cloudsMax: 0,
        input: [3, 0]
    },
    accretion: {
        rank: 0
    },
    collapse: {
        mass: 0.01235,
        massMax: 0.01235,
        stars: [0, 0, 0],
        show: 0,
        maxElement: 0,
        input: [2, 1e6],
        points: []
    },
    merge: {
        rewards: [0, 0, 0, 0],
        resets: 0,
        input: [0, 0],
        since: 0
    },
    darkness: {
        energy: 0,
        fluid: 0,
        input: 1.5
    },
    inflation: {
        loadouts: [],
        vacuum: false,
        voidVerses: 0,
        resets: 0,
        ends: [0, 9, 0],
        time: 0,
        age: 0
    },
    time: {
        updated: Date.now(),
        started: Date.now(),
        excess: 0,
        export: [0, 0, 0],
        offline: 0,
        online: 0,
        end: 0,
        universe: 0,
        vacuum: 0,
        stage: 0
    },
    buildings: [[] as unknown as playerType['buildings'][0]],
    verses: [
        {
            true: 0,
            current: 0
        }
    ],
    strange: [
        {
            current: 0,
            total: 0
        }, {
            current: 0,
            total: 0
        }
    ],
    cosmon: [{
        current: 0,
        total: 0
    }, {
        current: 0,
        total: 0
    }],
    upgrades: [[]],
    researches: [[]],
    researchesExtra: [[]],
    researchesAuto: [],
    ASR: [],
    elements: [],
    strangeness: [[]],
    milestones: [[]],
    tree: [],
    challenges: {
        active: null,
        super: false,
        void: [0, 0, 0, 0, 0, 0],
        voidCheck: [0, 0, 0, 0, 0, 0],
        supervoid: [0, 0, 0, 0, 0, 0],
        supervoidMax: [0, 0, 0, 0, 0, 0],
        stability: 0
    },
    toggles: {
        normal: [], //class 'toggleNormal'
        confirm: [], //Class 'toggleConfirm'
        hover: [], //Class 'toggleHover'
        max: [], //Class 'toggleMax'
        auto: [], //Class 'toggleAuto'
        buildings: [[]],
        verses: [],
        shop: {
            input: 0,
            wait: [2]
        }
    },
    history: {
        stage: {
            best: [3.1556952e16, 0, 0],
            list: [],
            input: [20, 100]
        },
        end: {
            best: [3.1556952e16, 0],
            list: [],
            input: [20, 100]
        }
    },
    event: false,
    clone: {}
};

export const global: globalType = {
    tabs: {
        current: 'stage',
        list: ['stage', 'upgrade', 'strangeness', 'inflation', 'settings'],
        stage: {
            current: 'Structures',
            list: ['Structures', 'Advanced']
        },
        upgrade: {
            current: 'Upgrades',
            list: ['Upgrades', 'Elements']
        },
        strangeness: {
            current: 'Matter',
            list: ['Matter', 'Milestones']
        },
        inflation: {
            current: 'Inflations',
            list: ['Inflations', 'Milestones']
        },
        settings: {
            current: 'Settings',
            list: ['Settings', 'Stats', 'History']
        }
    } as globalType['tabs'],
    debug: {
        timeLimit: false,
        rankUpdated: null,
        historyStage: null,
        historyEnd: null
    } as globalType['debug'],
    offline: {
        active: true,
        stage: [null, null],
        cacheUpdate: true
    },
    paused: false,
    trueActive: 1,
    lastSave: 0,
    log: {
        add: [],
        lastHTML: ['Start of the log', 1, 0, true]
    },
    hotkeys: {
        disabled: true,
        repeat: false,
        shift: false,
        ctrl: false,
        tab: false
    },
    lastUpgrade: [[null, 'upgrades']],
    lastElement: null,
    lastStrangeness: [null, 0],
    lastInflation: [null, 0],
    lastMilestone: [null, 0],
    lastChallenge: [1, 1],
    sessionToggles: [false, false],
    automatization: {
        autoU: [[]],
        autoR: [[]],
        autoE: [[]],
        elements: []
    },
    stageInfo: {
        word: ['', 'Microworld', 'Submerged', 'Accretion', 'Interstellar', 'Intergalactic', 'Abyss'],
        textColor: ['', 'cyan', 'blue', 'gray', 'orange', 'darkorchid', 'darkviolet'],
        buttonBorder: ['', 'darkcyan', '#386cc7', '#424242', '#a35700', '#8f004c', '#6c1ad1'],
        imageBorderColor: ['', '#008b8b', '#1460a8', '#5b5b75', '#e87400', '#b324e2', '#5300c1'],
        costName: ['', 'Energy', 'Drops', 'Mass', 'Stardust', 'Stardust', 'Dark matter'],
        activeAll: []
    },
    dischargeInfo: {
        energyType: [[], [], [], [], [], [], []],
        energyStage: [0, 0, 0, 0, 0, 0, 0],
        energyTrue: 0,
        next: 1,
        total: 0,
        base: 1
    },
    vaporizationInfo: {
        S2Research0: 0,
        S2Research1: 0,
        S2Extra1: 0,
        get: 0
    },
    accretionInfo: {
        unlockA: [2, 4, 8, 11],
        rankU: [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 5, 7],
        rankR: [1, 1, 2, 2, 3, 3, 3, 4, 5],
        rankE: [2, 3, 4, 5, 3, 6],
        rankCost: [5.9722e27, 1e-7, 1e10, 1e24, 5e29, 2.45576045e31, 1.98847e40],
        rankColor: ['blue', 'cyan', 'gray', 'gray', 'gray', 'darkviolet', 'orange', 'gray'],
        rankName: ['Ocean world', 'Cosmic dust', 'Meteoroid', 'Asteroid', 'Planet', 'Jovian planet', 'Protostar', 'Protogalaxy'],
        rankImage: ['Ocean%20world.png', 'Dust.png', 'Meteoroids.png', 'Asteroid.png', 'Planet.png', 'Giant.png', 'Protostar.png', 'Protogalaxy.png'],
        maxRank: 4,
        effective: 1,
        disableAuto: false,
        dustSoft: 1
    },
    collapseInfo: {
        unlockB: [0, 0.01235, 0.23, 10, 40, 1000],
        unlockU: [0.01235, 0.076, 1.3, 10, 40],
        unlockR: [0.18, 0.3, 0.8, 1.3, 40, 1000],
        supervoid: false,
        newMass: 0,
        starCheck: [0, 0, 0],
        trueStars: 0,
        pointsLoop: 0, //Micro optimization
        solarCap: 0.01235
    },
    mergeInfo: {
        unlockU: [0, 0, 0, 0, 1, 1, 3],
        unlockR: [0, 0, 3, 3, 6],
        unlockE: [0, 2, 4, 4, 6, 6],
        S5Extra2: 0,
        checkReward: [0, 0, 0, 0],
        galaxies: 0
    },
    inflationInfo: {
        globalSpeed: 1,
        totalSuper: 0,
        newFluid: 0,
        disableAuto: false
    },
    intervalsId: {
        main: undefined,
        numbers: undefined,
        visual: undefined,
        autoSave: undefined,
        mouseRepeat: undefined
    },
    buildingsInfo: {
        maxActive: [0, 4, 6, 5, 5, 4, 1],
        name: [
            [],
            ['Mass', 'Preons', 'Quarks', 'Particles', 'Atoms', 'Molecules'], //[0] Must be 'Mass'
            ['Moles', 'Drops', 'Puddles', 'Ponds', 'Lakes', 'Seas', 'Oceans'],
            ['Mass', 'Cosmic dust', 'Planetesimals', 'Protoplanets', 'Satellites', 'Subsatellites'],
            ['Stardust', 'Brown dwarfs', 'Main sequence', 'Red supergiants', 'Blue hypergiants', 'Quasi-stars'],
            ['Stars', 'Nebulas', 'Star clusters', 'Galaxies'],
            ['Dark matter', 'Dark planets']
        ],
        hoverText: [
            [],
            ['Mass', 'Preons', 'Quarks', 'Particles', 'Atoms'],
            ['Tritium', 'Drops', 'Puddles', 'Puddles', 'Puddles', 'Puddles'],
            ['Preons hardcap', 'Cosmic dust', 'Planetesimals', 'Protoplanets', 'Satellites'],
            ['Stardust', 'Stardust', 'Stardust', 'Stardust', 'Stardust'],
            ['Interstellar Stars', 'Interstellar Stars', 'Nebulas and Star clusters'],
            ['Dark matter softcap']
        ],
        type: [
            [],
            ['producing', 'producing', 'producing', 'producing', 'producing'],
            ['producing', 'producing', 'improving', 'improving', 'improving', 'improving'],
            ['producing', 'producing', 'producing', 'improving', 'improving'],
            ['producing', 'producing', 'producing', 'producing', 'producing'],
            ['producing', 'improving', 'improving'],
            ['delaying']
        ],
        firstCost: [
            [],
            [0, 0.005476, 6, 3, 24, 3],
            [0, 2.7753108348135e-3, 100, 1e7, 1e18, 1e23, 2.676e25],
            [0, 1e-19, 1e-9, 1e21, 1e17, 1e22],
            [0, 1, 1e5, 1e15, 1e27, 1e50],
            [0, 1e50, 1e54, 1e5],
            [0, 1e8]
        ],
        increase: [
            [],
            [0, 1.4, 1.4, 1.4, 1.4, 1.4],
            [0, 1.15, 1.2, 1.25, 1.35, 1.4, 4],
            [0, 1.15, 1.25, 1.35, 10, 10],
            [0, 1.4, 1.55, 1.70, 1.85, 2],
            [0, 2, 2, 1.11],
            [0, 1.4]
        ],
        producing: [[]] as unknown as globalType['buildingsInfo']['producing']
    },
    versesInfo: {
        firstCost: [120],
        increase: [1.5],
        producing: [0]
    },
    strangeInfo: {
        name: ['Strange quarks', 'Strangelets'],
        stageBoost: [1, 1, 1, 1, 1, 1],
        strangeletsInfo: [0, 1],
        strange0Gain: 0,
        strange1Gain: 0
    },
    upgradesInfo: [
        {} as globalType['upgradesInfo'][0], { //Stage 1
            name: [
                'Weak force',
                'Strong force',
                'Electrons',
                'Protons',
                'Neutrons',
                'Superposition',
                'Protium',
                'Deuterium',
                'Tritium',
                'Nuclear fusion',
                'Nuclear fission'
            ],
            effectText: [
                () => 'Particles will produce 8 times more Quarks.',
                () => 'Gluons will be able to bind Quarks into Particles, which will make Particles 16 times cheaper.',
                () => `${player.inflation.vacuum ? 'Atoms' : 'Particles'} will be 8 times cheaper.`,
                () => `Atoms will produce ${player.inflation.vacuum ? 6 : 4} times more Particles.`,
                () => 'Molecules will produce 4 times more Atoms.',
                () => `Ability to regain spent Energy and if had enough Energy, it will also boost production of all ${player.inflation.vacuum ? 'Microworld ' : ''}Structures by ${format(global.dischargeInfo.base, { padding: true })}.${player.inflation.vacuum ? `\n(In true Vacuum it will also reset resources and all non-self-made Structures from all Stages${player.stage.true >= 7 ? ' before Abyss' : ''}, and enough self-made Structures to fully regain spent Energy)` : ''}`,
                () => `Decrease Structures cost scaling by -${format(calculateEffects.S1Upgrade6() / 100)}.`,
                () => `Make self-made Structures boost themselves by ${format(calculateEffects.S1Upgrade7())}.${player.inflation.vacuum ? `\n(Self-made Preons boost themselves by ${format(calculateEffects.S1Upgrade7(true), { padding: true })} instead, softcaps instantly and gets completely disabled after ${format(1001)} Preons)` : ''}`,
                () => `Molecules will produce Molecules, at a reduced rate.\n(${format(new Overlimit(effectsCache.tritium).multiply(global.inflationInfo.globalSpeed), { padding: true })} Molecules per second)`,
                () => `Unspent Energy ${player.upgrades[1][10] === 1 ? '' : `^${format(0.5)}`} will boost 'Tritium' production of Molecules.\n(Boost: ${format(calculateEffects.S1Upgrade9(), { padding: true })})`,
                () => "Unlock the full strength of 'Nuclear fusion' and increase effective Energy by 2."
            ],
            cost: [40, 60, 100, 120, 180, 360, 1200, 3600, 12000, 80000, 2.4e6],
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
                () => `Spread water faster with every Puddle, current formula is ${format(player.challenges.active === 0 && player.challenges.super ? 1.01 : 1.02)} ^ effective Puddles.\nPuddles after 200 and non-self-made ones are raised to the power of ${format(0.7)}.\n(Total effect: ${format(calculateEffects.S2Upgrade1(), { padding: true })})`,
                () => `Gain ability to convert Drops into Clouds. Cloud gain formula: (Drops / ${format(calculateEffects.S2Upgrade2())})) ^${format(calculateEffects.cloudsGain())}, gain is reduced with Clouds.`,
                () => `Puddles will get a boost based on Moles ^${format(calculateEffects.S2Upgrade3_power())}.\n(Boost: ${format(calculateEffects.S2Upgrade3(), { padding: true })})`,
                () => `Puddles will get a boost based on Drops ^${format(calculateEffects.S2Upgrade4_power())}.\n(Boost: ${format(calculateEffects.S2Upgrade4(), { padding: true })})`,
                () => `Ponds will increase current Puddle amount. (${1 + player.researches[2][4]} extra Puddles per Pond)`,
                () => `Lakes will increase current Pond amount. (${1 + player.researches[2][5]} extra Ponds per Lake)`,
                () => `Spreads enough water to make Seas increase current Lake amount. (${1 + player.researches[2][6]} extra Lakes per Sea)`,
                () => 'Spreads water too fast. 1 extra Seas per Ocean.\nIt will also improve Oceans effect scaling.'
            ],
            cost: [10, 1e6, 1e10, 1e3, 1e4, 2e9, 5e20, 1e28, 2e48],
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
                'Ring system',
                'Self-gravity'
            ],
            effectText: [
                () => `Through random collisions every self-made Cosmic dust will ${player.inflation.vacuum ? 'delay Preons hardcap even more' : 'produce even more Mass'}.\n(By ${format(calculateEffects.S3Upgrade0())} per self-made Cosmic dust)`,
                () => `A new substance for the Accretion, it will provide boost to Cosmic dust based on its quantity.\n(Formula: (self-made * current) ^${format(calculateEffects.S3Upgrade1_power())} | Boost: ${format(calculateEffects.S3Upgrade1(), { padding: true })})`,
                () => 'Just a small meteoroid, but it will be a good base for what to come.\n(Unlock a new Structure and get 2x boost to Cosmic dust)',
                () => `Small bodies will spontaneously concentrate into clumps.\n(Self-made Planetesimals will boost each other by ${format(calculateEffects.S3Upgrade3())})`,
                () => 'Bodies will become massive enough to affect each other with their own gravity.\n(Unlock a new Structure and get 3x boost to Planetesimals)',
                () => `Shattered pieces will fall back together. ${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be increased by 3.`,
                () => `Melt the core to increase Accretion speed.\n(Cosmic dust strength will be increased by ${format(2 * 1.5 ** player.researches[3][7])})`,
                () => `After reaching equilibrium, self-made Protoplanets will boost each other by ${format(1.02)}.`,
                () => 'Unlock yet another Structure.',
                () => `${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be increased again (because of drag and escape velocity), by 2.`,
                () => `${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be greatly increased by ${8 * 2 ** player.researches[3][8]}.`,
                () => `Satellites cost scaling will be 2 times smaller.${player.inflation.vacuum ? '\nAlso unlock a new Structure.' : ''}`,
                () => 'Satellites effect will scale better.',
                () => `Allow for Star clusters to be boosted by ('Gravity' / ${format(2e5)}) ^${format(0.5)} + 1.\n(Boost is equal to ${format((calculateEffects.S3Research6() / 2e5) ** 0.5 + 1, { padding: true })})`
            ],
            cost: [1e-16, 1e-13, 1e-13, 1, 1e14, 1e17, 1e10, 1e22, 1e22, 1e23, 1e9, 1e26, 1e29, 1e86],
            maxActive: 13
        }, { //Stage 4
            name: [
                'Gravitational Collapse',
                'Proton-proton chain',
                'Carbon-Nitrogen-Oxygen cycle',
                'Helium fusion',
                'Nucleosynthesis'
            ],
            effectText: [
                () => `As fuel runs out, every Star will boost production in its own special way.\nSolar mass ${player.inflation.vacuum ? `on Collapse is Accretion Mass / ${format(1.98847e33)} and ` : ''}will not decrease if to reset below current. (Hover over Remnants effects to see what they boost)`,
                () => "Fuse with Protium instead of Deuterium. Unlock 5 first Elements. ('Elements' subtab)",
                () => 'Unlock the CNO cycle, which is a better source of Helium and Energy. Unlock 5 more Elements.',
                () => 'Through Triple-alpha and then Alpha process unlock 2 more Elements.',
                () => { //[4]
                    const max = Math.max(player.verses[0].true + player.inflation.voidVerses, player.inflation.ends[2]);
                    return `Create new Atomic nuclei with Neutron capture (s-process and p-process).\nUnlock ${Math.min(max, player.verses[0].current) + 1} more Element${player.stage.true >= 7 ? `s (+1 for every Universe${player.stage.true >= 8 ? ` until ${max}` : ''})` : ''}.`;
                }
            ],
            cost: [100, 1000, 1e9, 1e48, 1e128],
            maxActive: 4
        }, { //Stage 5
            name: [
                'Molecular cloud',
                'Super Star cluster',
                'Quasar',
                'Galactic Merger',
                'Starburst region',
                'Globular cluster',
                'Starburst Galaxy'
            ],
            effectText: [
                () => `Nebula that is dense enough to block the light, it will boost Nebulas by ${format(calculateEffects.S5Upgrade0())}.`,
                () => `A very massive Star cluster that will boost Star clusters by ${format(calculateEffects.S5Upgrade1())}.`,
                () => `Boost per Galaxy will be increased by +${format(calculateEffects.S5Upgrade2(false, 1), { padding: true })}.\n(Effect will be stronger with more Solar mass past ${format(1e5)})`,
                () => `Unlock a new reset type that will bring Galaxies closer for potential Merging.${player.inflation.vacuum ? ' That reset behaves like a Galaxy reset, while also converting self-made Galaxies into bonus ones. Can only be done a limited amount of times per Stage reset.' : ''}`,
                () => `Region of space that is undergoing a larger amount of Star formations, it will boost Nebulas by ${format(1000 * 10 ** player.researches[5][4])}.`,
                () => `A spheroidal conglomeration of Stars that is even more dense than Super Star cluster, it will boost Star clusters by ${format(1000 * 10 ** player.researches[5][4])}.`,
                () => `An entire Galaxy that is undergoing higher rate of Star formations, it will boost Galaxies by ${format(100 * 10 ** player.researches[5][4])}.`
            ],
            cost: [1e56, 1e60, 1e120, 1e160, 1e200, 1e210, 1e290] as unknown as Overlimit[],
            maxActive: 4
        }, { //Stage 6
            name: [
                'Dark nucleation',
                'Galactic boost'
            ],
            effectText: [
                () => `Unlock a new Dark reset, it will start the formation of the new Dark resources by modifing existing physics.\n(Formula for Dark fluid gain is (log10(Dark matter / ${format(1e8)}) + Dark energy) ^${format(calculateEffects.S6Upgrade0())} - 1, gain is reduced with more Dark fluid. Dark fluid boost Dark matter production and effective Dark energy)`,
                () => `Boost Dark matter production by current Galaxies.\n(Boost is equal to ${format(global.mergeInfo.galaxies / 125 + 1, { padding: true })})`
            ],
            cost: [8e12, 2e16],
            maxActive: 0
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
                () => `Cost scaling will be -${format(0.03)} smaller with every level.`,
                () => `Self-made Structures will boost each other by an additional +${format(0.01)}.`,
                () => `Molecules will produce themselves ${format(calculateEffects.S1Research2())} times quicker.`,
                () => `Discharge goals requirement will scale slower. (-2)\n(Creating this Research will make the next Discharge goal to be ${format(calculateEffects.dischargeCost(calculateEffects.dischargeScaling(player.researches[1][3] + 1)))} Energy)`,
                () => { //[4]
                    const newBase = calculateEffects.dischargeBase(player.researches[1][4] + 1);
                    return `Discharge production boost from reached goals will be increased by +${format(newBase - global.dischargeInfo.base)}.\n(This is equal to ${format((newBase / global.dischargeInfo.base) ** global.dischargeInfo.total, { padding: true })}x boost improvement)`;
                },
                () => `Discharge goals will be able to boost 'Tritium'.\n(Current effect: ${format(calculateEffects.S1Research5())} ^ level)`
            ],
            cost: [],
            firstCost: [1600, 4800, 16000, 32000, 16000, 24000],
            scaling: [400, 1200, 8000, 40000, 16000, 16000],
            max: [5, 4, 8, 2, 4, 3],
            maxActive: 6
        }, { //Stage 2
            name: [
                'Better Mole production',
                'Better Drop production',
                'Stronger surface tension',
                'Stronger surface stress',
                'More streams',
                'Distributary channel',
                'Megatsunami'
            ],
            effectText: [
                () => `Drops will ${player.inflation.vacuum ? 'improve Tritium' : 'produce Moles'} ${player.challenges.active === 0 && player.challenges.super ? 2 : 3} times more.${player.upgrades[2][2] === 1 || player.inflation.vacuum ? `\nEffective level ${global.vaporizationInfo.S2Research0 !== player.researches[2][0] ? `is ${format(global.vaporizationInfo.S2Research0, { padding: true })}, will be restored with more Drops` : 'will be set to 0 after any reset'}.` : ''}`,
                () => `Puddles will produce ${player.challenges.active === 0 && player.challenges.super ? format(1.4) : 2} times more Drops.${player.upgrades[2][2] === 1 || player.inflation.vacuum ? `\nEffective level ${global.vaporizationInfo.S2Research1 !== player.researches[2][1] ? `is ${format(global.vaporizationInfo.S2Research1, { padding: true })}, will be restored with more Drops` : 'will be set to 0 after any reset'}.` : ''}`,
                () => { //[2]
                    const power = calculateEffects.S2Upgrade3_power(player.researches[2][2] + 1) - calculateEffects.S2Upgrade3_power();
                    return `'Surface tension' base will be +${format(power)} stronger.\n(This is equal to ${format(calculateEffects.S2Upgrade3(power), { padding: true })}x boost improvement)`;
                },
                () => { //[3]
                    const power = calculateEffects.S2Upgrade4_power(player.researches[2][3] + 1) - calculateEffects.S2Upgrade4_power();
                    return `'Surface stress' base will be +${format(power)} stronger.\n(This is equal to ${format(calculateEffects.S2Upgrade4(power), { padding: true })}x boost improvement)`;
                },
                () => 'With more streams, will be able to have even more extra Puddles. (+1 extra Puddles per Pond)',
                () => 'Rivers will be able to split, which will allow even more Ponds per Lake. (+1 per)',
                () => 'Big enough to allow even more Lakes per Sea. (+1)'
            ],
            cost: [],
            firstCost: [10, 400, 1e4, 1e5, 1e14, 1e22, 1e80],
            scaling: [1.366, 5, 1e3, 1e2, 1e3, 1e4, 1],
            max: [8, 8, 4, 4, 2, 1, 1],
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
                () => `When shattered, Planetesimals will replenish small grains quantity.\n'Streaming instability' effect will be increased by +${format(0.005)}.`,
                () => `Instead of shattering, some Planetesimals will form a contact binary or even trinary.\n${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be increased by 3.`,
                () => { //[6]
                    const effect = calculateEffects.S3Research6();
                    return `Planetesimals will attract other bodies and get a boost to their own production based on unspent Mass ^${format(effect > 1 ? logAny(effect, player.buildings[3][0].current.toNumber()) : 0, { padding: true })}.\n(Boost: ${format(effect, { padding: true })} ⟶ ${format(calculateEffects.S3Research6(player.researches[3][6] + 1), { padding: true })}, weaker after ${format(1e21)} Mass)`;
                },
                () => `'Magma Ocean' will become stronger, by ${format(1.5)}.`,
                () => `Improve 'Pebble accretion' Accretion speed even more.\n${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will increased by 2.`
            ],
            cost: [],
            firstCost: [1e-16, 1e-15, 1e-5, 1e2, 1e10, 1e11, 1e15, 1e14, 1e12],
            scaling: [11, 111, 22, 10, 100, 100, 10, 1e4, 1e3],
            max: [9, 3, 8, 8, 2, 2, 6, 4, 4],
            maxActive: 9
        }, { //Stage 4
            name: [
                'Planetary system',
                'Star system',
                'Protoplanetary disk',
                'Planetary nebula',
                'Gamma-ray burst',
                'Inner Black hole'
            ],
            effectText: [
                () => `From Planetesimals to Planets, will get ${format(calculateEffects.S4Research0_base())}x boost to all Stars with every level.\n(Total boost: ${format(calculateEffects.S4Research0(), { padding: true })})`,
                () => { //[1]
                    const base = calculateEffects.S4Research1();
                    return `All self-made Stars will boost each other by ${format(base, { padding: true })}.\n(Total boost: ${format(new Overlimit(base).power(global.collapseInfo.trueStars), { padding: true })} ⟶ ${format(new Overlimit(calculateEffects.S4Research1(player.researches[4][1] + 1)).power(global.collapseInfo.trueStars), { padding: true })})`;
                },
                () => `Improve effect scaling of 'Planetary system', as well increase its max level by +3.\n(Total boost from 'Planetary system' will be increased by ${format(calculateEffects.S4Research0(calculateEffects.S4Research0_base(player.researches[4][2] + 1) / calculateEffects.S4Research0_base()), { padding: true })})`,
                () => "Matter will be expelled from Red giants, this will boost Main-sequence Stars by 2, and also increase 'Planetary system' max level by +3.",
                () => `An immensely energetic explosion that will boost all Stars by ${format(calculateEffects.S4Research4(), { padding: true })}${player.researches[4][4] < 2 ? ` ⟶ ${format(calculateEffects.S4Research4(false, player.researches[4][4] + 1), { padding: true })}` : ''}.\n(Effect will be stronger with more Black holes${player.elements[23] >= 1 ? ' and Solar mass' : ''})`,
                () => 'Quasi-stars will Collapse into Intermediate-mass Black holes that are equivalent to +1 (Stellar) Black holes per level.'
            ],
            cost: [],
            firstCost: [1e3, 5e4, 1e8, 1e11, 1e28, 1e154],
            scaling: [10, 200, 1e12, 1, 2e8, 1e306],
            max: [3, 2, 1, 1, 2, 1],
            maxActive: 5
        }, { //Stage 5
            name: [
                'Higher density',
                'Type frequency',
                'Jeans instability',
                'Gravitational binding Energy',
                'Star formation'
            ],
            effectText: [
                () => `Higher density of Nebulas will allow them to produce Stars of higher tier, but each tier is 4 times slower than the previous one. It will also boost Nebulas by 2.\nNext tier will be ${global.buildingsInfo.name[4][Math.min(player.researches[5][0] + 2, player.inflation.vacuum ? 5 : 4)]}.`,
                () => `More of the same Star type will be found within Star cluster. Star clusters and their minimum strength will be improved by 2. It will also boost Stars of lower tier, but 2 times less than the previous one.\nNext tier will be ${global.buildingsInfo.name[4][Math.max((player.inflation.vacuum ? 4 : 3) - player.researches[5][1], 1)]}.`,
                () => `Weaken internal gas pressure within Nebulas to cause even more gravitational Collapses.\nThis will make every self-made Nebula boost each other by ${format(calculateEffects.S5Research2(), { padding: true })}. (+${format(0.00625)} per level)${player.verses[0].current < 5 ? `\n(Max level will be increased at ${player.verses[0].current < 4 ? 4 : 5} Universes)` : ''}`,
                () => `Increase the Energy required for Star clusters to cease being in a gravitationally bound state.\nThis will make every self-made Star cluster boost each other by ${format(calculateEffects.S5Research3(), { padding: true })}. (+${format(0.00625)} per level)${player.verses[0].current < 5 ? `\n(Max level will be increased at ${player.verses[0].current < 4 ? 4 : 5} Universes)` : ''}`,
                () => `Produce even more stars and increase strength of 'Starburst region', 'Globular cluster' and 'Starburst Galaxy' effects by 10 per level.${player.verses[0].current < 7 ? '\n(Max level will be increased at 7 Universes)' : ''}`
            ],
            cost: [],
            firstCost: [1e54, 1e58, 1e270, 1e280, '1e550'] as unknown as Overlimit[],
            scaling: [1e8, 1e8, 1e30, 1e30, 1e30],
            max: [4, 4, 2, 2, 4],
            maxActive: 2
        }, { //Stage 6
            name: [
                'Dark aggregation',
                'Faster aggregation',
                'Time dilation',
                'Self-interaction',
                'Composition'
            ],
            effectText: [
                () => `Boost production of Dark matter by 2.\nFinal level will also unlock a new minor Dark Structure.${player.upgrades[6][0] === 1 ? ' (Already unlocked)' : ''}`,
                () => 'Boost production of Dark matter again by 2.',
                () => `Boost global speed by ${format(1.1)}.\nAlso delays Dark matter softcap by 1 + level.`,
                () => `Make self-made Dark planets boost each other by 1 + ${format(0.01)} * level and scale in cost slower by -${format(0.05)} * level.`,
                () => 'Have more Dark energy by increasing its gain by 1 + level.'
            ],
            cost: [],
            firstCost: [4e5, 2e8, 1e9, 4e9, 1e16],
            scaling: [2, 2, 2, 3, 16],
            max: [8, 14, 9, 5, 4],
            maxActive: 0
        }
    ],
    researchesExtraInfo: [
        {} as globalType['researchesExtraInfo'][0], { //Stage 1
            name: [
                'Extra strong force',
                'Improved formula',
                'Accretion',
                'Later Preons',
                'Impulse',
                'Radioactive decay'
            ],
            effectText: [
                () => "Mesons will be able to bind Particles to form Atoms, which will make Atoms to be affected by 'Strong force'.\n(Atoms will be 16 times cheaper)",
                () => { //[1]
                    const now = calculateEffects.S1Extra1();
                    const after = calculateEffects.S1Extra1(player.researchesExtra[1][1] + 1);
                    return `Improve 'Tritium' formula, current formula is log${format(now)}${player.researchesExtra[1][1] < 4 ? ` ⟶ log${format(after)}.\n(Which is equal to ${format(logAny(now, after), { padding: true })}x improvement)` : '.'}`;
                },
                () => `First level is to begin the Accretion, second level is to Submerge it.\nAll Structures produce Energy on creation and all resets affect all lower Stages, while also doing Discharge reset.\nAccretion Mass is Microworld Mass * ${format(1.78266192e-33)} and Moles are Molecules / ${format(6.02214076e23)}.`,
                () => { //[3]
                    const power = calculateEffects.S1Extra3();
                    const energy = calculateEffects.effectiveEnergy();
                    return `Boost Preons and delay hardcap by current Energy ^${format(power)}.\n(Effect: ${format(energy ** power, { padding: true })} ⟶ ${format(energy ** calculateEffects.S1Extra3(player.researchesExtra[1][3] + 1), { padding: true })})`;
                },
                () => { //[4]
                    const base = calculateEffects.S1Extra4();
                    return `Discharge goals will be able to boost all Interstellar Stars. Their strength is based on Energy and Discharge base.\nCurrent base is ${format(base, { padding: true })}, total boost is ${format(base ** global.dischargeInfo.total, { padding: true })}.`;
                },
                () => `Improve 'Impulse' base strength even more.\n(This will increase total boost by ${format((calculateEffects.S1Extra4(player.researchesExtra[1][5] + 1) / calculateEffects.S1Extra4()) ** global.dischargeInfo.total, { padding: true })})`
            ],
            cost: [],
            firstCost: [2000, 40000, 12000, 16000, 160000, 1.6e6],
            scaling: [0, 16000, 68000, 16000, 0, 1.6e6],
            max: [1, 4, 2, 4, 1, 2],
            maxActive: 0
        }, { //Stage 2
            name: [
                'Natural Vaporization',
                'Rain Clouds',
                'Storm Clouds',
                'Water Accretion',
                'Jeans Mass'
            ],
            effectText: [
                () => {
                    if (!player.inflation.vacuum || player.tree[1][5] < 1) { return 'When formed, Clouds will use Drops produced this reset instead of current ones.'; }
                    const level = player.researchesExtra[2][0];
                    const extra = player.strangeness[2][4] >= 2 ? 1 : 4;
                    return `Passively gain ${format(level * (5 + 5 * level) / extra)}% ⟶ ${format((level + 1) * (10 + 5 * level) / extra)}% Clouds per second. (Not affected by global speed)`;
                },
                () => { //[1]
                    const maxLevel = player.researchesExtra[2][1];
                    const trueLevel = global.vaporizationInfo.S2Extra1;
                    const penalty = player.buildings[2][2].true < 1;
                    const effect = calculateEffects.S2Extra1;
                    return `Some Clouds will start pouring Drops themselves. This will boost Puddles, even if there are none, based on current Clouds.\nEffective level ${trueLevel !== maxLevel ? `is ${format(trueLevel, { padding: true })}, will be restored with more Drops, this doesn't` : "will be set to 0 after any reset, this won't"} affect pre-Puddles boost.\n(Effect: ${format(penalty ? (effect(maxLevel) - 1) * global.inflationInfo.globalSpeed : effect(trueLevel), { padding: true })} ⟶ ${format(penalty ? (effect(maxLevel + 1) - 1) * global.inflationInfo.globalSpeed : effect(maxLevel + (trueLevel === maxLevel ? 1 : 0)), { padding: true })}, weaker after ${format(1e6)} Clouds)`;
                },
                () => `Make 'Rain Clouds' boost Seas and their own pre-Puddles effect, at a reduced rate.\n(Effect: ${format(calculateEffects.S2Extra2(calculateEffects.S2Extra1(player.buildings[2][2].true < 1 ? player.researchesExtra[2][1] : global.vaporizationInfo.S2Extra1), 1), { padding: true })})`,
                () => { //[3]
                    const level = player.researchesExtra[2][3];
                    return `Submerge and boost Stars with 'Surface tension'. Also with 'Surface stress' ^${format(0.5)} at level 2, full power at level 3.\n(Boost to Stars: ${level < 3 ? `${format(level < 1 ? 1 : effectsCache.S2Upgrade3 * (level > 1 ? effectsCache.S2Upgrade4 ** 0.5 : 1), { padding: true })} ⟶ ` : ''}${format(effectsCache.S2Upgrade3 * (level < 1 ? 1 : effectsCache.S2Upgrade4 ** (level > 1 ? 1 : 0.5)), { padding: true })})`;
                },
                () => { //[4]
                    const level = player.researchesExtra[2][4];
                    return `High density of Drops will end up boosting Nebulas with 'Surface tension'. Also with 'Surface stress' ^${format(0.5)} at level 2, full power at level 3.\n(Boost to Nebulas: ${level < 3 ? `${format(level < 1 ? 1 : effectsCache.S2Upgrade3 * (level > 1 ? effectsCache.S2Upgrade4 ** 0.5 : 1), { padding: true })} ⟶ ` : ''}${format(effectsCache.S2Upgrade3 * (level < 1 ? 1 : effectsCache.S2Upgrade4 ** (level > 1 ? 1 : 0.5)), { padding: true })})`;
                }
            ],
            cost: [],
            firstCost: [1e18, 1e12, 1e26, 1e14, 1e60],
            scaling: [1e8, 1e3, 1, 1e8, 1e8],
            max: [1, 3, 1, 3, 3],
            maxActive: 3
        }, { //Stage 3
            name: [
                'Rank boost',
                'Efficient growth',
                'Weight',
                'Viscosity',
                'Efficient submersion',
                'Ablative armor'
            ],
            effectText: [
                () => `Increase strength of Cosmic dust by another ${format(1.11)} per level. Max level is based on current Rank.\n(Total increase: ${format(1.11 ** player.researchesExtra[3][0], { padding: true })})`,
                () => { //[1]
                    const base = calculateEffects.S3Extra1();
                    return `${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be even bigger, current formula is ${format(base)} ^ current Rank.\n(Total boost: ${format(base ** global.accretionInfo.effective, { padding: true })} ⟶ ${format(calculateEffects.S3Extra1(player.researchesExtra[3][1] + 1) ** global.accretionInfo.effective, { padding: true })})`;
                },
                () => "'Gravitational field' will be able to boost Protoplanets, but at reduced strength. (2x boost)",
                () => `'Gas' will be ${format(calculateEffects.S3Upgrade1(calculateEffects.S3Upgrade1_power(player.researchesExtra[3][3] + 1)) / calculateEffects.S3Upgrade1(), { padding: true })} times stronger with every level.`,
                () => `Submerge quicker by boosting Puddles, improved by current Rank.\n(Current boost: ${format(calculateEffects.S3Extra4(), { padding: true })} ⟶ ${format(calculateEffects.S3Extra4(player.researchesExtra[3][4] + 1), { padding: true })})`,
                () => `Protect your Mass from being removed by removing Cosmic dust hardcap instead.\nSecond level will redirect delay to the hardcap as a boost to Cosmic dust that ignores softcap.\n(Current hardcap delay is ${format(calculateEffects.dustDelay(), { padding: true })})`
            ],
            cost: [],
            firstCost: [1e-18, 1e-7, 1e26, 1e9, 1e-10, 1.98847e40],
            scaling: [10, 100, 1, 1e5, 1e12, 5.024e59],
            max: [14, 6, 1, 5, 1, 2],
            maxActive: 4
        }, { //Stage 4
            name: [
                'Nova',
                'Mass transfer',
                'White dwarfs',
                'Quark-nova'
            ],
            effectText: [
                () => `This violent stellar explosion is the main source of Elements, but also starts the formation of new Stars.\nUnlock a new Star type and even more, after Collapse of that Star type.\n(Will require at least ${format(global.collapseInfo.unlockB[Math.min(player.researchesExtra[4][0] + 2, 4)])} Solar mass to create that new Star type)`,
                () => `Star material will transfer from one Star to another, improving Solar mass gain${player.inflation.vacuum ? ' (also delaying Preons hardcap)' : ''} by ${format(calculateEffects.S4Extra1())} in the process.\nImproved by 'Star system' levels, but also improves their scaling (effect increase for 'Star system' is ${format(new Overlimit(calculateEffects.S4Research1(undefined, 1) / calculateEffects.S4Research1(undefined, 0)).power(global.collapseInfo.trueStars), { padding: true })}).`,
                () => `After matter were dispeled from Red giant, White dwarf was all that remained.\nImprove effect of '[6] Carbon' by +${format(0.5)} and increase max level of 'Star system' by +1.`,
                () => "As Neutron stars spin down, some of them may get converted into Quark stars.\nThis will add a new effect to Neutron stars ‒ all Stars are cheaper, and will also increase max level of 'Star system' by +1."
            ],
            cost: [],
            firstCost: [4e4, 2e9, 1e50, 1e136],
            scaling: [1e10, 1, 1, 1],
            max: [3, 1, 1, 1],
            maxActive: 3
        }, { //Stage 5
            name: [
                'Hypercompact stellar system',
                'Interacting Galaxies',
                'Central dominant Galaxy',
                'More Merges',
                'Compact Group',
                'Interacting Groups'
            ],
            effectText: [
                () => `Super dense core which will allow creation of a new Structure. That Structure will increase Stage reset reward${player.inflation.vacuum ? ', starting Energy after any Reset' : ''}, boost Nebulas and Star clusters. But creating it will fully reset ${player.inflation.vacuum ? 'all' : 'Interstellar and Intergalactic'} Stages.\nThis Research also removes Solar mass and other Remnant requirements from everything in the Interstellar Stage.`,
                () => `Unlock a new Result for the Merge resets, if to reset with enough self-made Galaxies.${global.researchesExtraInfo[5].max[1] > 1 ? '\nSecond level will allow the use of the excess Galaxies from previous Merge resets when forming new Galaxy groups.' : ''}${player.verses[0].current < 4 ? '\n(Max level will be increased at 4 Universes)' : ''}`,
                () => { //[2]
                    const maxLevel = player.researchesExtra[5][2] + player.merge.rewards[1];
                    const trueLevel = global.mergeInfo.S5Extra2;
                    return `An even bigger Galaxy to improve Stage reset reward and Galaxy groups effect with every Galaxy group.\nEffective level is ${format(trueLevel, { padding: trueLevel !== maxLevel })}, will be ${trueLevel !== maxLevel ? "restored with more Stardust, this doesn't" : "set to 0 after any reset, this won't"} affect Stage reset reward.\n(Total boost: ${format(calculateEffects.S5Extra2(trueLevel), { padding: true })} ⟶ ${format(calculateEffects.S5Extra2(maxLevel + (maxLevel === trueLevel ? 1 : 0)), { padding: true })})${player.verses[0].current < 5 ? '\n(Max level will be increased at 5 Universes)' : ''}`;
                },
                () => `Increase max allowed Merge resets by +1 per level.${player.verses[0].current < 5 ? '\n(Max level will be increased at 5 Universes)' : ''}`,
                () => `Decrease amount of Galaxies required for the creation of a Galaxy Group.\n(Effect: ${calculateEffects.S5Extra4()} ⟶ ${calculateEffects.S5Extra4(player.researchesExtra[5][4] + 1)}, effect increase per level decreases with more level)${player.verses[0].current < 13 ? `\n(Max level will be increased at ${player.verses[0].current < 7 ? 7 : player.verses[0].current < 10 ? 10 : 13} Universes)` : ''}`,
                () => `Unlock the second Merge result${global.researchesExtraInfo[5].max[5] > 1 ? ' and it make able to use excess Galaxies at level 2' : ''}.${player.verses[0].current < 12 ? '\n(Max level will be increased at 12 Universes)' : ''}`
            ],
            cost: [],
            firstCost: [1e80, 1e260, '1e320', '1e350', '1e560', '1e660'] as unknown as Overlimit,
            scaling: [1, 1e150, 1e30, 1e210, 1e90, 1e180],
            max: [1, 1, 2, 1, 2, 1],
            maxActive: 1
        }, { //Stage 6
            name: [
                'Acceleration',
                'Expansion',
                'Quintessence',
                'Stability'
            ],
            effectText: [
                () => `Boost global speed by ${format(1.2)}.\nAlso increases max level of 'Faster aggregation' by +1.`,
                () => { //[1]
                    const energy = calculateEffects.effectiveDarkEnergy();
                    return `Delay Dark matter softcap by current Dark energy ^(${format(0.5)} * level).\n(Current delay: ${format(energy ** (player.researchesExtra[6][1] / 2), { padding: true })} ⟶ ${format(energy ** ((player.researchesExtra[6][1] + 1) / 2), { padding: true })})`;
                },
                () => { //[2]
                    const delay = calculateEffects.darkHardcap(true);
                    return `Buff Universes by Dark matter softcap ^(${format(0.03125)} * level) by changing the ratio of kinetic and potential Dark energy.\n(Current effect: ${format(delay ** (player.researchesExtra[6][2] / 32), { padding: true })} ⟶ ${format(delay ** ((player.researchesExtra[6][2] + 1) / 32), { padding: true })})`;
                },
                () => `Increase Dark fluid gain by +^${format(0.05)} and weaken Dark matter softcap by +^${format(0.04)}.`
            ],
            cost: [],
            firstCost: [25, 50, 100, 100],
            scaling: [25, 50, 100, 200],
            max: [4, 2, 8, 4],
            maxActive: 0
        }
    ],
    researchesAutoInfo: {
        name: [
            'Upgrade automatization',
            'Element automatization',
            'Reset automatization'
        ],
        effectText: [
            () => `Automatically create all ${['Upgrades', 'Stage Researches', 'Special Researches'][Math.min(player.researchesAuto[0], 2)]} from any Stage.`,
            () => 'Elements will no longer require Collapse for activation.\nSecond level will unlock auto creation of Elements.',
            () => { //[2]
                const index = player.researchesAuto[2] >= 4 ? 4 : Math.min(player.inflation.vacuum ? player.researchesAuto[2] : player.stage.current - 1, 3);
                return `Unlock auto ${['Discharge', 'Vaporization', 'Rank', 'Collapse', 'Merge'][player.inflation.vacuum ? (index === 1 ? 2 : index === 2 ? 1 : index) : index]} level 1.${player.inflation.vacuum ? '\nCost will decrease by -1 level per related level 1 Strangeness.' : ''}`;
            }
        ],
        costRange: [
            [1e13, 2e34, 1e30],
            [136000, 272000],
            [1200, 2400, 4800, 8400, 13200]
        ],
        autoStage: [
            [2, 3, 4],
            [1, 1],
            [6, 6, 6, 6, 6]
        ],
        max: [3, 2, 1]
    },
    ASRInfo: {
        name: 'Auto Structures',
        effectText: () => {
            const stageIndex = player.stage.active;
            const index = Math.min(player.ASR[stageIndex] + 1, Math.max(global.ASRInfo.max[stageIndex], 1));
            let unlocked = true;
            if (player.stage.true < 6) {
                if (stageIndex === 3 && player.stage.resets < 5) {
                    if (index === 2) {
                        unlocked = player.upgrades[3][2] === 1 || player.buildings[3][2].trueTotal.moreThan(0);
                    } else if (index === 3) {
                        unlocked = player.upgrades[3][4] === 1 || player.buildings[3][3].trueTotal.moreThan(0);
                    }
                } else if (stageIndex === 5) {
                    if (index === 1) {
                        unlocked = player.milestones[2][0] >= 7;
                    } else if (index === 2) {
                        unlocked = player.milestones[3][0] >= 7;
                    } else if (index === 3) {
                        unlocked = player.milestones[4][1] >= 8;
                    }
                }
            } else if (player.stage.true < 7) {
                if (player.stage.resets < 2 && index === 5) {
                    if (stageIndex === 3) {
                        unlocked = player.upgrades[3][11] === 1 || player.buildings[3][5].trueTotal.moreThan(0);
                    } else if (stageIndex === 4) {
                        unlocked = player.elements[26] >= 1;
                    }
                }
            } else if (player.stage.true < 8) {
                if (stageIndex === 6) {
                    unlocked = index === 1 && (player.upgrades[6][0] === 1 || player.researches[6][0] >= 8);
                }
            }
            return `Automatically make ${unlocked ? global.buildingsInfo.name[stageIndex][index] : '(Not unlocked)'} (counts as self-made).\n(Auto ${stageIndex === 5 && index === 3 ? "for this Structure doesn't wait and ignores related settings" : `will wait until ${format(player.toggles.shop.wait[stageIndex])} times of the Structure cost`})`;
        },
        costRange: [
            [],
            [2000, 8000, 16000, 32000, 56000],
            [1e10, 1e14, 1e18, 1e23, 1e28, 1e30],
            [1e-7, 1e10, 5e29, 2e30, 2e36],
            [1e6, 1e17, 1e28, 1e39, 1e52],
            [1e56, 1e60, 1e100],
            [1e16]
        ],
        max: [0, 3, 5, 4, 4, 3, 0]
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
            '[28] Nickel',
            '[29] Copper',
            '[30] Zinc',
            '[31] Gallium',
            '[32] Germanium',
            '[33] Arsenic',
            '[34] Selenium',
            '[35] Bromine',
            '[36] Krypton'
        ],
        effectText: [
            () => `Element with no protons, true head of this table.\nThis one is ${Math.random() < 0.1 ? (Math.random() < 0.1 ? 'an illusive Tetraneutron, or maybe even Pentaneutron. Wait where did it go? Was it even there?' : 'a rare Dineutron, but it is already gone...') : 'a simple Mononeutron, it will stay with you for as long as it can.'}`,
            () => `The most basic Element, increases Brown dwarfs${player.inflation.vacuum ? ' and Puddles' : ''} production by 2.`,
            () => `Fusion reaction byproduct, makes Interstellar Stars cost scale -${format(0.1)} less.`,
            () => `First metal, Solar mass gain${player.inflation.vacuum ? ' and hardcap delay for Cosmic dust' : ''} per Brown dwarf will be lightly increased.`,
            () => `Brittle earth metal and so is the brittle increase to the production.\n(${format(1.4)}x boost to all Stars${player.inflation.vacuum ? ' and Cosmic dust' : ''})`,
            () => `A new color, and a new boost to the Solar mass gain${player.inflation.vacuum ? ' and delay to the Cosmic dust hardcap' : ''} that is based on current Brown dwarfs.`,
            () => `Base for organics, it will increase the boost from Red giants by ^${format(calculateEffects.element6())}.`,
            () => "The most abundant Element in the atmosphere of some Planets, it allows for 2 more levels of 'Star system'.",
            () => `An oxidizing agent that will make Interstellar Stars cost scale even slower. (-${format(0.05)} less)`,
            () => "Highly toxic and reactive, +12 to max level of 'Planetary system'.",
            () => `A noble 2x boost to the Solar mass gain${player.inflation.vacuum ? ' and delay to the Preons hardcap' : ''}.`,
            () => "Through leaching will get 1 extra level of 'Protoplanetary disk'.",
            () => 'Stars are inside you, as well Neutron stars strength will be increased by log4.',
            () => 'Has a great affinity towards Oxygen and to decrease cost of all Stars by 100.',
            () => `Just another tetravalent metalloid, and so is another ${format(1.4)}x boost to all Stars${player.inflation.vacuum ? ' and Cosmic dust' : ''}.`,
            () => `One of the Fundamentals for Life and to make all Stars boost Solar mass gain${player.inflation.vacuum ? ' and delay Cosmic dust hardcap' : ''}.`,
            () => "A burning rock that will increase max level of 'Star system' by 1.",
            () => "Extremely reactive to extend max level of 'Planetary system' by another 24 levels.",
            () => 'Less noble, but Black holes effect will be a little stronger.',
            () => "Don't forget about it and will get 1 free level of 'Planetary system'.\n(It will also make Solar mass effect apply twice to Brown dwarfs)",
            () => "Get stronger with 1 extra level of 'Star system'.",
            () => `A new color and a rare bonus of ^${format(1.1)} to the Solar mass effect.`,
            () => 'Part of a new alloy that will allow for Red giants to be added into an effective amount of Neutron stars.',
            () => `Catalyst for production of Stardust. 'Gamma-ray burst' effect will be increased by Solar mass ^${format(0.1)}.\n(Effect increase: ${format(player.collapse.mass ** 0.1, { padding: true })})`,
            () => `No corrosion, only boost to all Stars that is based on unspent Stardust ^${format(calculateEffects.element24_power())}.\n(Boost to Stars: ${format(calculateEffects.element24(), { padding: true })})`,
            () => "Brittle Element, but not the bonus ‒ 1 more level in 'Star system'.",
            () => `Any further fusion will be an endothermic process. ${player.inflation.vacuum ? `Unlock a new Star type${player.strangeness[5][3] >= 1 ? ' and Intergalactic Stage' : ''}` : 'Enter Intergalactic space'}.\n${player.stage.true >= 6 || player.strange[0].total >= 1 ? `Current base increase for Stage reset reward is +${format(effectsCache.element26, { padding: true })}, which is equal to log10(Stardust produced this Stage) - 48.${player.elements[29] >= 1 ? "\n(Formula doesn't show improvement from '[29] Copper', but base increase does)" : ''}` : '(Can change active Stage from footer, new effect will be added after another Stage reset)'}`,
            () => `Combined and ready to make all self-made Red supergiants count as Red giants and improve '[24] Chromium' Element by +^${format(0.01)}.`,
            () => "Slow to react, but will increase max level of 'Star system' by +1.",
            () => `Does not need to be prepared to increase Stage reset reward base by Arithmetic progression with step of ${format(0.01)}.`,
            () => `First of new Elements to come, increases max allowed Merge resets by +1 for every new Element past '[29] Copper'.\n(Currently highest created Element in the current Stage reset is '${global.elementsInfo.name[player.collapse.maxElement]}', equals to +${Math.max(player.collapse.maxElement - 29, 0)} allowed Merges)`,
            () => "Will melt in the palm of your hand to increase max level of 'Star system' by +1.",
            () => `Too late to appear, but it will make all Galaxies cost scale slower by ${format(-0.01)} anyway.`,
            () => 'Toxic enough to buff only Quasi-stars with Black holes effect.',
            () => "Capable of sensing an +1 increase to the max level of 'Star system'.",
            () => "The only liquid nonmetal to increase the max level of 'Inner Black hole' by +1.",
            () => 'Nothing special, just an 2x decrease to Galaxies cost.'
        ],
        cost: [ //New Element cost must be higher than previous one
            0, 1000, 4000, 2e4, 1e5, 1e8, 1e10, 4e11, 8e12, 6e13,
            1e15, 1e20, 1e22, 1e24, 1.4e26, 1e28, 1e30, 1e32, 2e36, 1e38,
            1e39, 1e41, 2e42, 3e43, 4e44, 5e45, 1e48, 1e54, 1e58, 1e140,
            1e220, 1e240, 1e260, '1e380', '1e520', '1e600', '1e850'
        ] as unknown as Overlimit[],
        maxActive: 29
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
                () => `Boost all Microworld Structures by ${format(player.inflation.vacuum ? 2 : 1.8)}.`,
                () => `Base for 'Improved Tritium' Research will be bigger by +${format(player.inflation.vacuum ? 1.5 : 1)}.\n(Boost from it at current Research level is ${format((calculateEffects.S1Research2(player.strangeness[1][1] + 1) / calculateEffects.S1Research2()) ** player.researches[1][2], { padding: true })})`,
                () => `Discharge goals requirement will scale slower. (-${format(0.5)})\n(Creating this Strangeness will make next Discharge goal to be ${format(calculateEffects.dischargeCost(calculateEffects.dischargeScaling(undefined, player.strangeness[1][2] + 1)))} Energy)`,
                () => `Obtain +${format(0.5)} bonus Discharge goals.`,
                () => `Automatically Discharge upon reaching next goal or spending Energy. (Needs to be enabled in Settings)${global.strangenessInfo[1].max[4] > 1 ? '\nSecond level will make Discharge goals to be based on true Energy and without needing to reset.' : ''}`,
                () => 'Make auto for all Microworld Structures permanent.',
                () => `Unspent Strange quarks will boost Microworld by improving its Structures.\n(Formula: Strange quarks ^${format(player.inflation.vacuum ? 0.26 : 0.22)} | Effect: ${format(global.strangeInfo.stageBoost[1], { padding: true })})`,
                () => 'Increase Energy gain from creating Preons by +2.',
                () => { //[8]
                    const improved = player.challenges.supervoid[1] >= 2;
                    return `No Mass will be lost when creating Preons${improved ? '' : ', only works when Accretion Stage is unlocked'}.\nSecond level will disable auto Accretion Structures, if Cosmic dust is hardcapped, until will have enough Mass for the highest Solar mass conversion${improved ? " or to increase current Rank, if its below 'Protostar' and 'Automatic Rank' level is below 2" : ', only works if Interstellar Stage is unlocked'}.${global.strangenessInfo[1].max[8] > 2 ? '\nThird level will make auto Structures ignore wait value for Dark Structures if Dark matter is hardcapped.' : ''}`;
                },
                () => `No Energy will be lost when creating Upgrades or Researches${player.challenges.supervoid[4] < 1 ? ', only works when Interstellar Stage is unlocked' : ''}.`
            ],
            cost: [],
            firstCost: [1, 1, 1, 2, 12, 2, 24, 2, 12, 15600],
            scaling: [2.46, 2, 6, 4, 400, 1, 1, 6, 10, 1],
            max: [6, 4, 4, 2, 1, 1, 1, 2, 2, 1],
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
                'Improved flow',
                'Mechanical spread',
                'Ocean world'
            ],
            effectText: [
                () => `Drops will ${player.inflation.vacuum ? 'improve Tritium' : 'produce'} 2 times more${player.inflation.vacuum ? '' : ' Moles'}.`,
                () => `Puddles will produce ${format(player.inflation.vacuum ? 1.8 : 1.6)} times more Drops.`,
                () => { //[2]
                    let extraText = 'none';
                    if (player.strangeness[2][2] >= 1) { extraText = "max level increased for 'More streams' (+1)"; }
                    if (player.strangeness[2][2] >= 2) { extraText += " and 'Distributary channel' (+1)"; }
                    if (player.strangeness[2][2] >= 3) { extraText += ", a new Upgrade ‒ 'Tsunami'"; }
                    return `Increase max level for one of the Researches. Final level will instead unlock a new Upgrade.\n(Current effect: ${extraText})`;
                },
                () => `Decrease amount of Drops required to get a Cloud by ${format(player.inflation.vacuum ? 2.5 : 2)}.`,
                () => `Automatically Vaporize when reached enough boost from new Clouds. (Needs to be enabled in Settings)${global.strangenessInfo[2].max[4] > 1 ? `\nSecond level will unlock an automatic ${format(2.5)}% gain of Clouds per second${player.tree[1][5] >= 1 ? ' or if its already unlocked, then increase gain by 4' : ''}.${player.stage.true >= 7 ? ' (Not affected by global speed)' : ''}` : ''}`,
                () => 'Make auto for all Submerged Structures permanent.',
                () => `Unspent Strange quarks will boost Submerged by improving Puddles.\n(Formula: Strange quarks ^${format(player.inflation.vacuum ? 0.22 : 0.18)} | Effect: ${format(global.strangeInfo.stageBoost[2], { padding: true })})`,
                () => `Submerged Structures that improve other Submerged Structures will do it ${format(1.24)} times stronger.\n(Affected Structures are Ponds, Lakes, Seas and Oceans)`,
                () => { //[8]
                    let extraText = 'none';
                    if (player.strangeness[2][8] >= 1) { extraText = "max level increased for 'Stronger surface tension' (+3)"; }
                    if (player.strangeness[2][8] >= 2) { extraText += " and 'Stronger surface stress' (+1)"; }
                    if (player.strangeness[2][8] >= 3) { extraText += ", a new Upgrade ‒ 'Tide'"; }
                    return `Increase max level for one of the Researches. Final level will instead unlock an even better new Upgrade.\n(Current effect: ${extraText})`;
                },
                () => `Increase Stage reset reward based on current Cloud amount.\n(Formula: log10(Clouds) / 80 + 1 | Effect: ${format(calculateEffects.S2Strange9(), { padding: true })}${global.strangenessInfo[2].max[9] > 1 ? ' ^level' : ''})`
            ],
            cost: [],
            firstCost: [1, 1, 2, 2, 12, 4, 24, 18, 800, 9600],
            scaling: [2.46, 2, 3, 4, 800, 1, 1, 3.4, 3, 5e12],
            max: [4, 8, 3, 2, 1, 1, 1, 6, 3, 1],
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
                () => `Increase strength of Cosmic dust by ${format(1.8)}.`,
                () => `Accretion Structures that produce other Accretion Structures will do it ${format(player.inflation.vacuum ? 1.48 : 1.6)} times faster.\n(Affected Structures are Planetesimals and Protoplanets)`,
                () => { //[2]
                    let extraText = 'none';
                    if (player.strangeness[3][2] >= 1) { extraText = "max level increased for 'Rank boost' (+6)"; }
                    if (player.strangeness[3][2] >= 2) { extraText += " and 'Efficient growth' (+2)"; }
                    if (player.strangeness[3][2] >= 3) { extraText += ", a new Upgrade ‒ 'Hydrostatic equilibrium'"; }
                    return `Increase max level for one of the Rank Researches. Final level will instead unlock a new Upgrade.\n(Current effect: ${extraText})`;
                },
                () => { //[3]
                    if (!global.stageInfo.activeAll.includes(3)) { assignBuildingsProduction.stage3Cache(); }
                    return `Satellites will be able to improve remaining ${player.inflation.vacuum ? 'Accretion ' : ''} Structures, but at reduced strength (^${format(player.inflation.vacuum ? 0.1 : 0.2)}).\n(Affected Structures are Cosmic dust and Planetesimals, boost is equal to ${format(effectsCache.S3Strange3, { padding: true })})`;
                },
                () => `Automatically increase Rank when possible. (Needs to be enabled in Settings)${global.strangenessInfo[3].max[4] > 1 ? '\nSecond level will make Rank increase use Mass produced this reset instead of current.' : ''}`,
                () => 'Make auto for all Accretion Structures permanent.',
                () => `Always automatically create all ${['Upgrades', 'Stage Researches', 'Special Researches'][Math.min(player.strangeness[3][6], 2)]} from any Stage${!player.inflation.vacuum && player.strangeness[5][3] < 1 && player.verses[0].current < 3 ? ' before Intergalactic' : ''}. (Needs to be enabled in Settings)`,
                () => `Unspent Strange quarks will boost Accretion by making its Structures cheaper.\n(Formula: Strange quarks ^${format(player.inflation.vacuum ? 0.68 : 0.76)} | Effect: ${format(global.strangeInfo.stageBoost[3], { padding: true })})`,
                () => `Delay Cosmic dust hardcap by ${format(1.4)} per level.`,
                () => { //[9]
                    const max2 = global.strangenessInfo[3].max[9] > 1;
                    return `Unlock a new Accretion Rank to achieve.${player.stage.true >= 7 ? `${max2 ? ' ' : '\n'}(Also increase max level of 'Reset automatization')` : ''}${max2 ? '\nSecond level will remove the limit for new Ranks, but they will not unlock anything new.' : ''}`;
                }
            ],
            cost: [],
            firstCost: [1, 2, 2, 24, 12, 4, 4, 24, 18000, 2.16e6],
            scaling: [2, 3.4, 3, 1, 100, 1, 1.74, 1, 2.46, 1e308],
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
                () => `All Stars will produce ${format(1.6)} times more Stardust.`,
                () => 'Stars will be 2 times cheaper.',
                () => { //[2]
                    let extraText = 'none';
                    if (player.strangeness[4][2] >= 1) { extraText = "'Planetary nebula' (Stage Research)"; }
                    if (player.strangeness[4][2] >= 2) { extraText += ", 'White dwarfs' (Collapse Research)"; }
                    if (player.strangeness[4][2] >= 3) { extraText += ", 'Helium fusion' (Upgrade)"; }
                    return `Unlock a new Upgrade, its pretty good.\n(Current unlocks: ${extraText})`;
                },
                () => '10% of Brown dwarfs will be able to turn into Red giants after Collapse.',
                () => `Automatically Collapse once reached enough boost or Solar mass. (Needs to be enabled in Settings)${global.strangenessInfo[4].max[4] > 1 ? `\nSecond level will unlock an automatic Star remnants${global.strangenessInfo[4].max[4] > 2 ? ' (and Solar mass with third level)' : ''} gain without needing to reset.` : ''}`,
                () => 'Make auto for all Interstellar Structures permanent.',
                () => `Elements will no longer require Collapse for activation${player.inflation.vacuum ? ' and related automatization Research will cost as if its level is -1' : ''}.\nSecond level will unlock auto creation of Elements. (${global.strangenessInfo[4].max[6] > 1 ? 'Needs to be enabled in settings' : 'Not yet unlocked for Interstellar space'})`,
                () => `Unspent Strange quarks will boost Interstellar by improving all Stars.\n(Formula: Strange quarks ^(${format(0.16)} or ${format(0.32)}, if '[26] Iron' is created) | Effect: ${format(global.strangeInfo.stageBoost[4], { padding: true })})`,
                () => `Increase effective amount of Neutron stars (doesn't include ones from '[22] Titanium') by 1 + level and improve Neutron stars strength by +^${format(0.125)}.`,
                () => { //[9]
                    let extraText = 'none';
                    if (player.strangeness[4][9] >= 1) { extraText = "'Nucleosynthesis' (Upgrade)"; }
                    if (player.strangeness[4][9] >= 2) { extraText += ", 'Quark-nova' (Collapse Research)"; }
                    if (player.strangeness[4][9] >= 3) { extraText += ", 'Inner Black hole' (Stage Research)"; }
                    return `Unlock yet another an even better new Upgrade.\n(Current unlocks: ${extraText})`;
                }
            ],
            cost: [],
            firstCost: [1, 2, 4, 2, 12, 6, 6, 24, 12000, 2.4e5],
            scaling: [2, 3.4, 3, 4, 1900, 1, 1.74, 1, 2, 3],
            max: [8, 4, 3, 2, 1, 1, 1, 1, 8, 3],
            maxActive: 8
        }, { //Stage 5
            name: [
                'Bigger Structures',
                'Higher density',
                'Strange gain',
                'Gravitational bound',
                'Automatic Galaxy',
                'Auto Structures',
                'Automatic Stage',
                'Strange boost',
                'Strange growth',
                'Automatic Merge',
                'Galactic tide'
            ],
            effectText: [
                () => `More matter for the Accretion (flavor text), first two Intergalactic Structures will be ${format(player.inflation.vacuum ? 1.4 : 1.6)} times stronger.`,
                () => `With higher density, first two Intergalactic upgrades will be even stronger. Effects will be increased by ${format(player.inflation.vacuum ? 1.6 : 1.8)}.`,
                () => `Gain ${format(1.4)} times more Strange quarks from any Stage reset.`,
                () => player.inflation.vacuum ? 'Unlock Intergalactic Stage and increase Strange quarks from Stage resets by +1.' : `Make Intergalactic Stage immune to Collapse reset${player.verses[0].current < 3 ? " and allow 'Upgrade automatization' to work within the Intergalactic Stage" : ''}.`,
                () => 'Automatically Collapse if able to afford a new Galaxy and auto Galaxy is enabled.\n(Also unlocks permanent auto Galaxies for free and removes Mass limit for auto Collapse points)',
                () => `Make auto for ${player.strangeness[5][4] >= 1 ? 'all' : 'the first two'} Intergalactic Structures permanent${player.strangeness[5][4] < 1 ? ' and prevent the rest from resetting' : ''}.`,
                () => `Automatically trigger Stage reset${player.inflation.vacuum ? ' (disabled while inside the Void) or leave current Challenge if time limit is reached' : `, doesn't work for the Interstellar Stage until second level${player.stage.true >= 8 || player.verses[0].true >= 6 ? ' (disabled while inside Vacuum stability)' : ''}`}. (Needs to be enabled in Settings)`,
                () => `Unspent Strange quarks will boost Intergalactic by increasing Solar mass gain.\n(Formula: Strange quarks ^${format(0.06)} | Effect: ${format(global.strangeInfo.stageBoost[5], { padding: true })})`,
                () => 'Unlock another Strange Structure.\n(Click on that Structure to see its effects)',
                () => `Automatically Merge Galaxies ${player.inflation.vacuum ? "if can't get any more of them quickly" : 'as soon as its possible'}. (Needs to be enabled in Settings)`,
                () => { //[10]
                    let passive = 'none';
                    let upgrades = 'none';
                    if (player.strangeness[5][10] >= 1) {
                        passive = `increase Energy gain from Galaxies by 5, decrease Discharge goal requirement by ${format(calculateEffects.S5Strange9_stage1(), { padding: 'exponent' })}`;
                        upgrades = "'Nuclear fission' (Microworld Upgrade), 'Radioactive decay' (Energy Research)";
                    }
                    if (player.strangeness[5][10] >= 2) {
                        passive += `, boost Puddles ${player.strangeness[5][10] >= 3 ? 'and Cosmic dust strength ' : ''}by ${format(calculateEffects.S5Strange9_stage2(), { padding: 'exponent' })}`;
                        upgrades += `${player.tree[1][5] >= 3 ? ", 'Megatsunami' (Submerged Research)" : ''}, 'Jeans Mass' (Clouds Research)`;
                    }
                    if (player.strangeness[5][10] >= 3) {
                        passive += `, delay Cosmic dust hardcap by ${format(calculateEffects.S5Strange9_stage3(), { padding: true })}`;
                        upgrades += ", 'Self-gravity' (Accretion Upgrade), 'Ablative armor' (Rank Research)";
                    }
                    return `Boost lower Stages based on current Galaxies and unlock new Upgrades for them.\n(Passive effects: ${passive})\n(New Upgrades: ${upgrades})`;
                }
            ],
            cost: [],
            firstCost: [24, 36, 4, 24, 15600, 24, 480, 120, 6000, 6e6, 1.2e7],
            scaling: [2, 2, 4, 1, 1, 1, 1, 1, 1e308, 1, 3],
            max: [8, 8, 2, 1, 1, 1, 1, 1, 1, 1, 3],
            maxActive: 8
        }, { //Stage 6
            name: [
                'Global boost',
                'Stranger gain',
                'More Strangeness',
                'Darkness'
            ],
            effectText: [
                () => `Boost global speed by ${format(1.4)}.`,
                () => `Gain ${format(1.4)} times more Strangelets from the Stage resets.`,
                () => { //[2]
                    let extraText = 'none';
                    if (player.strangeness[6][2] >= 1) { extraText = "'Automatic Collapse' (+1)"; }
                    if (player.strangeness[6][2] >= 2) { extraText += ", 'Bigger Puddles' (+6)"; }
                    if (player.strangeness[6][2] >= 3) { extraText += ", 'Main giants' (+4)"; }
                    if (player.strangeness[6][2] >= 4) { extraText += ", 'Improved flow' (+3)"; }
                    if (player.strangeness[6][2] >= 5) { extraText += ", 'Hotter Stars' (+4)"; }
                    return `Increase max level for the Strangeness or unlock new one.\n(Current unlocks: ${extraText})`;
                },
                () => { //[3]
                    let extraText = 'none';
                    if (player.strangeness[6][3] >= 2) { extraText = "increase max level of 'Conservation of Mass' (+1), keep Auto Structures"; }
                    if (player.strangeness[6][3] >= 3) { extraText += `, auto Upgrades and ${player.strangeness[6][3] >= 5 ? 'all' : 'Stage'} Researches`; }
                    if (player.strangeness[6][3] >= 4) { extraText += ', auto Nucleation'; }
                    return `Expand Darkness Stage by unlocking Dark matter Upgrades. (And disable basic hotkeys for Universes)\nFurther levels unlock more automatizations for Dark matter.\n(Unlocked automatization: ${extraText})`;
                }
            ],
            cost: [],
            firstCost: [2.4e17, 1.6e17, 8e16, 5e15],
            scaling: [3, 3, 4, 16],
            max: [8, 8, 5, 5],
            maxActive: 0
        }
    ],
    treeInfo: [{ //Inflatons
        name: [
            'Overboost',
            'Global boost',
            'Strange gain',
            'Instability',
            'Void Milestones',
            'Improved offline'
        ],
        effectText: [
            () => `Boost global speed by 2${player.tree[1][2] < 1 ? `, but reduce time limit on everything that has it by 4, if level is below 2.\nIf there is no time limit, then 2nd level will instead boost global speed by ${format(calculateEffects.T0Inflation0(), { padding: true })} (strength depletes over 1 hour of the Stage time)` : ''}.`,
            () => { //[1]
                const effect = calculateEffects.T0Inflation1();
                return `Boost global speed by unspent Dark matter ^${format((effect > 1 ? logAny(effect, player.buildings[6][0].current.toNumber() + 1) : 0.04) * player.tree[0][1], { padding: true })}.\n(Boost per level: ${format(effect, { padding: true })}, softcaps after ${format(1e8)} Dark matter)`;
            },
            () => `Gain ${format(1.4)} times more Strange quarks from any Stage reset per level.${player.tree[0][3] >= 1 ? `\nFirst ${player.tree[0][3] * 2} levels will also boost global speed by ${format(1.2)}, but only while inside any Void.` : ''}`,
            () => `Boost global speed and Stage reset reward by ${format(calculateEffects.T0Inflation3())}, strength is based on Supervoid progress${player.challenges.stability < 4 ? ' in the current Universe' : ''}.\nEvery level will also improve 2 levels of 'Strange gain' Inflation to boost global speed while inside any Void.`,
            () => 'For false Vacuum it will remove time limit from Milestones.\nFor true Vacuum it will unlock Void Milestones. Their effects are active, only when this Inflation is active.',
            () => {
                const level = player.tree[0][5];
                return `Store ${25 * level}%${level < 4 ? ` ⟶ ${25 * (level + 1)}%` : ''} of rejected offline time, which can be used in 5 minute Warps for the price of ${12 / (player.challenges.active !== null ? 2 : 1)} minutes of offline storage.\nIncrease Export storage by +${(2 + 2 * level) * level}%${level < 4 ? ` ⟶ ${(4 + 2 * level) * (level + 1)}%` : ''} of the Stage reset value after any Stage reset.\nIf inside any Challenge, then it will also reduce Warp cost by 2 and boost global speed, but decrease time limit by ${format(6 / (6 - level))}${level < 4 ? ` ⟶ ${format(6 / (5 - level))}` : ''}.`;
            }
        ],
        cost: [],
        firstCost: [0, 1, 1, 2, 4, 1],
        scaling: [2, 0.75, 0.5, 2, 0, 1],
        max: [2, 6, 8, 4, 1, 4]
    }, { //Cosmon
        name: [
            'More speed',
            'More Strange quarks',
            'Stability',
            'Stranger gain',
            'Discharge improvement',
            'Vaporization improvement',
            'Rank improvement',
            'Collapse improvement',
            'Conservation of Resources'
        ],
        effectText: [
            () => `Boost global speed again by ${format(1.4)}.`,
            () => `Boost Strange quarks gain from the Stage resets again by ${format(1.2)}.`,
            () => "First level removes all negative effects and time limit from 'Overboost' Inflation.\nFurther levels will instead increase its max level by +1.",
            () => `Boost Strangelets gain from the Stage resets by ${format(1.4)} and increase max level of 'Strange gain' Inflation by +1.`,
            () => `True Vacuum only, gain +1 free Goals and decrease requirement scaling by -${format(0.5)} with every level.\nAlso improve Discharge base by +${format(0.5)} (before the softcap), but only inside any Void.`,
            () => "True Vacuum only, make 'Natural Vaporization' Clouds Research old effect permanent and replace it with auto Vaporization level 2 (it itself will now increase strength by 4), second level will increase its max level by +3 and remove the 'no Rank resets' condition from the Void rewards.\nThird level will unlock a new Research for 'Galactic tide' Strangeness, final level will increase max level of 'Ocean world' Strangeness by +1.\nAlso decrease required Drops for a Cloud by 8 per level if inside any Void.",
            () => `True Vacuum only, make effective Rank boost even more: (all effects are per Rank)\n+${format(0.5)} Discharge goals at level 1, +1 extra level of 'Planetary system' Interstellar Research at level 2 and ${format(1.01)}x to the Solar mass gain at level 3.\nFinal level will instead increase max level of 'Rank raise' Strangeness by +1 (doesn't do anything yet).\nAlso increase effective Rank by +1 per level if inside any Void.`,
            () => 'Placeholder.',
            () => { //[8]
                const level = Math.min(player.tree[1][8] + 1, 4);
                return `Keep more of ${global.stageInfo.word[level]}${level === 4 ? ' and Intergalactic' : ''} Resources by making all of its Structures${level === 4 ? "(doesn't include Galaxies)" : ''} not spend them on creation.`;
            }
        ],
        cost: [],
        firstCost: [1, 1, 2, 2, 0, 1, 1, 2, 2],
        scaling: [1, 1, 2, 2, 1, 1.4, 2.5, 2.5, 1.4],
        max: [9, 9, 3, 4, 4, 4, 4, 4, 4]
    }],
    milestonesInfo: [
        {} as globalType['milestonesInfo'][0], { //Stage 1
            name: [
                'Fundamental Matter',
                'Energized'
            ],
            needText: [
                () => `Produce at least ${format(global.milestonesInfo[1].need[0])} ${player.inflation.vacuum ? 'Preons' : 'Quarks'} this reset.`,
                () => `Have current Energy reach ${format(global.milestonesInfo[1].need[1])}.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `All Microworld Structures strength increased by ${format(global.milestonesInfo[1].reward[0], { padding: true })}.` : 'Increase base for Strange quarks from any Stage reset by +1.',
                () => player.inflation.vacuum ? `Effective Energy increased by ${format(global.milestonesInfo[1].reward[1], { padding: true })}.` : 'Permanent Microworld Stage.'
            ],
            need: [],
            reward: [0, 0],
            scaling: [
                [1e152, 1e158, 1e164, 1e170, 1e178, 1e190],
                [23800, 24600, 25800, 27000, 28200, 29600]
            ]
        }, { //Stage 2
            name: [
                'A Nebula of Drops',
                'Just a bigger Puddle'
            ],
            needText: [
                () => `${player.inflation.vacuum ? 'Vaporize to' : 'Produce'} at least ${format(global.milestonesInfo[2].need[0])} ${player.inflation.vacuum ? 'Clouds' : 'Drops this reset'}.`,
                () => `${player.inflation.vacuum ? 'Produce' : 'Have'} at least ${format(global.milestonesInfo[2].need[1])} ${player.inflation.vacuum ? 'Drops this reset' : 'Puddles at the same time'}.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `Decrease Drops requirement to get a Cloud by ${format(global.milestonesInfo[2].reward[0], { padding: true })}.` : 'First Intergalactic Structure. (Nebula)',
                () => player.inflation.vacuum ? `Puddles strength increased by ${format(global.milestonesInfo[2].reward[1], { padding: true })}.` : 'Permanent Submerged Stage.'
            ],
            need: [],
            reward: [0, 0],
            scaling: [
                [1e30, 1e32, 1e34, 1e36, 1e38, 1e40, 1e44],
                [1500, 2300, 3100, 3900, 4700, 5500, 6400]
            ]
        }, { //Stage 3
            name: [
                'Cluster of Mass',
                'Satellites of Satellites'
            ],
            needText: [
                () => `Produce at least ${format(global.milestonesInfo[3].need[0])} Mass this reset.`,
                () => `Have more or equal to ${format(global.milestonesInfo[3].need[1])} Satellites${player.inflation.vacuum ? ' and Subsatellites' : ''}.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `Cosmic dust strength increased by ${format(global.milestonesInfo[3].reward[0], { padding: true })}.` : 'Second Intergalactic Structure. (Star cluster)',
                () => player.inflation.vacuum ? `Increase effective Rank by +${format(global.milestonesInfo[3].reward[1])}.` : 'Permanent Accretion Stage.'
            ],
            need: [],
            reward: [0, 0],
            scaling: [
                [1e32, 1e34, 1e36, 1e38, 1e40, 1e42, 1e45],
                [24, 28, 32, 36, 40, 44, 50]
            ]
        }, { //Stage 4
            name: [
                'Remnants of past',
                'Supermassive'
            ],
            needText: [
                () => `Produce at least ${format(global.milestonesInfo[4].need[0])} Stardust this reset.`,
                () => `Have ${player.inflation.vacuum ? 'current Black holes' : 'Solar mass after Collapse'} reach ${format(global.milestonesInfo[4].need[1])} or more.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `All Stars strength increased by ${format(global.milestonesInfo[4].reward[0], { padding: true })}.` : "New Intergalactic themed Strangeness, Milestone and second level of 'Element automatization'.",
                () => player.inflation.vacuum ? `Black holes effect increased by ${format(global.milestonesInfo[4].reward[1], { padding: true })}.` : 'Research to make third Intergalactic Structure and the final Milestone. (Galaxy)'
            ],
            need: [],
            reward: [0, 0],
            scaling: [
                [1e48, 1e49, 1e50, 1e52, 1e54, 1e56, 1e58, 1e60],
                [9000, 12000, 16000, 22000, 30000, 42000, 60000, 84000]
            ]
        }, { //Stage 5
            name: [
                'Light in the dark',
                'End of Greatness'
            ],
            needText: [
                () => `Have ${player.inflation.vacuum ? 'total produced' : 'self-made'} Stars ${player.inflation.vacuum ? 'this reset' : 'count'} reach at least ${format(global.milestonesInfo[5].need[0])}.`,
                () => `Have ${format(global.milestonesInfo[5].need[1])} ${player.inflation.vacuum ? 'self-made ' : ''}Galaxies or more.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `First two Intergalactic Structures strength increased by ${format(global.milestonesInfo[5].reward[0], { padding: true })}.` : "Unlock a new Intergalactic Strangeness 'Strange gain' and second level of 'Automatic Stage'.",
                () => player.inflation.vacuum ? `Boost per Galaxy is increased by +${format(global.milestonesInfo[5].reward[1])}.` : "Unlock a new Intergalactic Upgrade 'Galactic Merger'."
            ],
            need: [],
            reward: [0, 0],
            scaling: [
                [1460, 1540, 1620, 1700, 1780, 1860, 1940, 2020],
                [1, 2, 4, 6, 10, 14, 18, 22]
            ]
        }
    ],
    challengesInfo: [{
        name: 'Void',
        description: () => `Result of Vacuum Instability, investigate at your own will\n(${player.inflation.vacuum || player.challenges.super ? `Entering will force a ${player.challenges.super ? 'Vacuum' : 'Stage'} reset, will be reverted after exiting` : 'No reason to enter from false Vacuum, since all rewards are disabled'})`,
        effectText: () => {
            const progress = player.challenges.voidCheck;
            let text = `<p class="orangeText">‒ Microworld Structures are 4 times weaker${progress[1] >= 1 ? `\n‒ Discharge base is raised to the root of 2 (^${format(0.5)})` : ''}${progress[1] >= 2 ? '\n‒ Energy gain from Submerged and Accretion Stages is divided by 2' : ''}\n${progress[3] >= 5 ? '‒ Energy gain from Interstellar and Intergalactic Stages is divided by 4' : 'More nerfs will be shown with more rewards'}</p>`;
            if (progress[1] >= 3) { text += `<p class="blueText">‒ Drops above 1 do not increase their own production\n‒ Puddles are ${format(8e3)} times weaker\n${progress[2] >= 1 ? `‒ Clouds gain is decreased by ^${format(0.8)}` : 'More nerfs will be shown with more rewards'}${player.challenges.super ? (player.challenges.supervoid[1] >= 3 ? "\n‒ 'Water spread' and the first 2 Researches are weaker\n‒ Ponds, Lakes and Seas are 2 times weaker " : '\nMore nerfs will be shown with more rewards') : ''}</p>`; }
            if (progress[1] >= 2) { text += `<p class="grayText">‒ Cosmic dust is softcapped (^${format(0.9)})\n${progress[3] >= 4 ? `‒ Softcap is stronger after reaching 'Jovian planet' Rank (^${format(0.8)})` : 'More nerfs will be shown with more rewards'}${player.challenges.super ? (player.challenges.supervoid[3] >= 1 ? "\n‒ Increasing Rank doesn't increase effective Rank" : '\nMore nerfs will be shown with more rewards') : ''}</p>`; }
            if (progress[3] >= 5) { text += `<p class="orchidText">‒ Stars are ${format(8e3)} times weaker${progress[4] >= 1 ? '\n‒ Solar mass gain is 2 times smaller' : ''}${progress[4] >= 2 ? `\n‒ Solar mass effect is softcapped ^${format(0.2)} after 1` : ''}\n${progress[4] >= 5 ? (player.verses[0].current >= 7 ? '‒ Quasi-stars do not produce anything and scale in cost faster' : "‒ Can't create or gain Quasi-stars") : 'More nerfs will be shown with more rewards'}${player.challenges.super ? (player.challenges.supervoid[3] >= 5 ? '\n‒ Everything cost 100 times more Stardust (excluding Brown dwarfs)' : '\nMore nerfs will be shown with more rewards') : ''}</p>`; }
            if (progress[3] >= 1) { text += `<p class="cyanText">${player.challenges.super ? '‒ Global speed is decreased by 5\n' : ''}‒ All resets affect all ${player.stage.true >= 7 ? 'pre-Abyss ' : ''}Stages\n${progress[5] >= 1 ? `‒ Galaxies cost scaling increased by +${format(0.05)}` : 'More nerfs will be shown with more rewards'}</p>`; }
            return text;
        },
        needText: [
            [], [
                () => 'Perform the Discharge',
                () => 'Unlock Accretion Stage',
                () => 'Unlock Submerged Stage'
            ], [
                () => 'Vaporize the Drops',
                () => `Have more than ${format(1e4)} Clouds`,
                () => player.tree[1][5] >= 2 ? `Have more than ${format(1e12)} Clouds` : player.stage.true >= 7 ? `Reach ${format(1e12)} Clouds with no Rank resets` : null
            ], [
                () => "Reach 'Meteoroid' Rank",
                () => "Reach 'Asteroid' Rank",
                () => "Reach 'Planet' Rank",
                () => "Reach 'Jovian planet' Rank",
                () => "Reach 'Protostar' Rank",
                () => player.stage.true >= 7 ? "Reach 'Protogalaxy' Rank" : null
            ], [
                () => 'Cause the Collapse',
                () => 'Get the first Red giant',
                () => 'Get the first Neutron star',
                () => 'Get the first Black hole',
                () => 'Unlock Intergalactic Stage'
            ], [
                () => 'Create a Galaxy',
                () => player.stage.true >= 7 ? 'Force the Galactic Merge' : null,
                () => player.stage.true >= 8 ? 'Create a Galaxy group' : null,
                () => player.stage.true >= 8 ? 'Create a Galaxy cluster' : null
            ]
        ],
        rewardText: [[
            [],
            ["'Energy increase' (Microworld)", "'Conservation of Mass' (Microworld)", "'Improved flow' (Submerged)"],
            ["'Mechanical spread' (Submerged)", "'Ocean world' (Submerged)", "'Galactic tide' (Intergalactic)"],
            ['Multiple max level increases', 'Multiple max level increases', 'Multiple max level increases', 'Multiple max level increases', "'Strange growth' (Intergalactic)", "'Automatic Merge' (Intergalactic)"],
            ['Max level increased for Auto resets', "'Conservation of Energy' (Microworld)", "'Neutronium' (Interstellar)", "'Mass delay' (Accretion)", "'Newer Upgrade' (Interstellar)"],
            ["'Rank raise' (Accretion)", 'New Abyss themed Strangeness', 'Work in progress', 'Work in progress']
        ], [
            [],
            ["'Discharge improvement' (Advanced)", "'Improved conservation' (Milestone)", "'Conservation of Resources' (Advanced)"],
            ["'Vaporization improvement' (Advanced)", '"Strange Ocean" (Milestone, WIP)', 'Work in progress'],
            ["'Indestructible matter' (Milestone)", "'Latest Preons' (Milestone)", "'Improved offline' (Basic)", "'Rank improvement' (Advanced)", "'Stranger gain' (Advanced)", 'Work in progress'],
            ["Improved the 'Improved conservation'", "'Collapse improvement' (Advanced, WIP)", "'Main Stars' (Milestone, WIP)", 'Work in progress', "'Auto Strangeness' (Basic, WIP)"],
            ['Work in progress', 'Work in progress', 'Work in progress', 'Work in progress']
        ]],
        resetType: 'stage',
        time: 3600,
        color: 'darkviolet'
    }, {
        name: 'Vacuum stability',
        description: () => 'A more stable, but still the false Vacuum state\n(Entering will force a Vacuum reset, will be reverted after exiting)',
        effectText: () => {
            const completions = player.challenges.stability;
            return `<p class="orchidText">‒ Global speed is decreased by ${format(8 ** completions, { padding: 'exponent' })}\n‒ Milestones time limit is 0 seconds\n‒ Permanent Stages are removed from reset cycle</p>
            <p class="greenText">‒ Strange quarks from Stage resets are decreased by ${format(2 ** Math.max((player.challenges.active === 1 ? player.stage.resets : 0) - 7, 0) * 2 ** completions, { padding: 'exponent' })}\n‒ Strange quarks from non-Interstellar Stage resets are further decreased by ${format(2 ** (completions + 2), { padding: 'exponent' })}\n‒ Stage resets above 8 decrease Strange quarks from the Stage resets by 2\n‒ Going above 10 minutes of the Stage time will force Stage reset</p>
            <p class="darkvioletText">‒ Galaxies scale in cost faster by +${format(0.01)}\n‒ Merge requirement is increased by +${completions}, which is equal to ${calculateEffects.mergeRequirement(true)}</p>`;
        },
        needText: ['1 Completion', '2 Completions', '3 Completions', '4 Completions'],
        rewardText: [
            "'Stability' (Advanced Inflation)", //1
            'Start Vacuum resets with Void equal to the Supervoid', //2
            'Start Universe resets with true Vacuum state', //3
            "Make 'Instability' Inflation immune to all resets" //4
        ],
        resetType: 'vacuum',
        time: 7200,
        color: 'darkorchid'
    }],
    historyStorage: {
        stage: [],
        end: []
    },
    loadouts: {
        input: [],
        open: false,
        buttons: []
    }
};

/** Only for effects that are calculated multiple times per tick */
export const effectsCache = { //Cannot be in Stage.ts due to esbuild file ordering
    microworld: 0,
    S1Upgrade6: 0,
    S1Upgrade7: 0,
    /** Alternative names are S1Upgrade8 and S1Build6 */
    tritium: 0,
    S2Upgrade3: 0,
    S2Upgrade4: 0,
    interstellar: 0,
    mass: 0,
    star1: 0,
    star2: 0,
    galaxyBase: 0,
    interstellarQuarks: 0,
    element26: 0,
    S1SolarDelay: 0,
    S3SolarDelay: 0,
    fluid: 0,
    S3Strange1: 0,
    S3Strange3: 0,
    /** Total effect */
    T0Inflation3: 0
};

/** Sets playerStart, global and HTML values */
export const prepareVacuum = (state: boolean) => { //Must not use direct player values
    const { buildings } = playerStart;
    const { buildingsInfo, upgradesInfo, researchesInfo, researchesExtraInfo, elementsInfo, strangenessInfo } = global;
    const milestone1S1 = getQuery('#milestone1Stage1Div > input') as HTMLImageElement;
    const milestone1S2 = getQuery('#milestone1Stage2Div > input') as HTMLImageElement;
    const milestone2S2 = getQuery('#milestone2Stage2Div > input') as HTMLImageElement;
    const milestone1S3 = getQuery('#milestone1Stage3Div > input') as HTMLImageElement;
    const milestone2S4 = getQuery('#milestone2Stage4Div > input') as HTMLImageElement;
    let upgrades1Cost, researches1Cost, researches1Scaling, strangeness1Cost, strangeness1Scaling, strangeness2Cost, strangeness2Scaling, strangeness3Cost, strangeness3Scaling, strangeness4Cost, strangeness4Scaling, strangeness5Cost, strangeness5Scaling;

    if (state) {
        specialHTML.footerStatsHTML[1][0] = ['Energy%20mass.png', 'stage1borderImage cyanText', 'Mass'];
        buildingsInfo.hoverText[2][0] = 'Tritium';
        buildingsInfo.hoverText[3][0] = 'Preons hardcap';
        buildingsInfo.type[2][0] = 'improving';
        buildingsInfo.type[3][0] = 'delaying';
        buildings[1][0].current.setValue(5.476e-3);
        buildings[2][0].current.setValue(0);
        buildings[3][0].current.setValue(9.76185667392e-36);
        if (buildingsInfo.name[1][0] !== 'Mass') {
            specialHTML.buildingHTML[1].unshift('Preon.png', 'Quarks.png');
            buildingsInfo.name[1].unshift('Mass', 'Preons');
            buildingsInfo.hoverText[1].unshift('Mass', 'Preons');
        }
        buildingsInfo.firstCost[1] = [0, 0.005476, 6, 3, 24, 3];
        buildingsInfo.maxActive[1] = buildingsInfo.firstCost[1].length;
        buildingsInfo.maxActive[2] = buildingsInfo.firstCost[2].length;
        buildingsInfo.maxActive[3] = buildingsInfo.firstCost[3].length;
        buildingsInfo.maxActive[4] = buildingsInfo.firstCost[4].length;
        buildingsInfo.maxActive[6] = buildingsInfo.firstCost[6].length;

        upgrades1Cost = [40, 60, 100, 120, 180, 360, 1200, 3600, 12000, 80000];
        (upgradesInfo[2].cost[0] as Overlimit).setValue(10);
        (upgradesInfo[5].cost[3] as Overlimit).setValue(1e160);
        upgradesInfo[1].maxActive = upgradesInfo[1].cost.length;
        upgradesInfo[2].maxActive = upgradesInfo[2].cost.length;
        upgradesInfo[3].maxActive = upgradesInfo[3].cost.length;
        upgradesInfo[4].maxActive = upgradesInfo[4].cost.length;
        upgradesInfo[5].maxActive = upgradesInfo[5].cost.length;
        upgradesInfo[6].maxActive = upgradesInfo[6].cost.length;

        researches1Cost = [1600, 4800, 16000, 32000, 16000, 24000];
        researches1Scaling = [400, 1200, 8000, 40000, 16000, 16000];
        researchesInfo[2].scaling[2] = 1e2;
        researchesInfo[2].scaling[3] = 1e3;
        researchesInfo[2].maxActive = researchesInfo[2].firstCost.length;
        researchesInfo[4].maxActive = researchesInfo[4].firstCost.length;
        researchesInfo[5].maxActive = researchesInfo[5].firstCost.length;
        researchesInfo[6].maxActive = researchesInfo[6].firstCost.length;

        researchesExtraInfo[1].maxActive = researchesExtraInfo[1].firstCost.length;
        researchesExtraInfo[2].maxActive = researchesExtraInfo[2].firstCost.length;
        researchesExtraInfo[3].maxActive = researchesExtraInfo[3].firstCost.length;
        researchesExtraInfo[4].maxActive = researchesExtraInfo[4].firstCost.length;
        researchesExtraInfo[5].maxActive = researchesExtraInfo[5].firstCost.length;
        researchesExtraInfo[6].maxActive = researchesExtraInfo[6].firstCost.length;

        elementsInfo.cost[27].setValue(1e54);
        elementsInfo.cost[28].setValue(1e58);
        elementsInfo.maxActive = elementsInfo.cost.length;

        global.ASRInfo.costRange[1] = [2000, 8000, 16000, 32000, 56000];
        global.ASRInfo.costRange[3][3] = 2.45576045e31;

        strangeness1Cost = [1, 1, 1, 2, 12, 2, 24];
        strangeness1Scaling = [2.46, 2, 6, 4, 400, 1, 1];
        strangeness2Cost = [1, 1, 2, 2, 12, 4, 24];
        strangeness2Scaling = [2.46, 2, 3, 4, 800, 1, 1];
        strangeness3Cost = [1, 2, 2, 24, 12, 4, 4, 24];
        strangeness3Scaling = [2, 3.4, 3, 1, 100, 1, 1.74, 1];
        strangeness4Cost = [1, 2, 4, 2, 12, 6, 6, 24];
        strangeness4Scaling = [2, 3.4, 3, 4, 1900, 1, 1.74, 1];
        strangeness5Cost = [24, 36, 4, 24, 15600, 24, 480, 120];
        strangeness5Scaling = [2, 2, 4, 1, 1, 1, 1, 1];
        strangenessInfo[1].maxActive = strangenessInfo[1].firstCost.length;
        strangenessInfo[2].maxActive = strangenessInfo[2].firstCost.length;
        strangenessInfo[3].maxActive = strangenessInfo[3].firstCost.length;
        strangenessInfo[4].maxActive = strangenessInfo[4].firstCost.length;
        strangenessInfo[5].maxActive = strangenessInfo[5].firstCost.length;
        strangenessInfo[6].maxActive = strangenessInfo[6].firstCost.length;

        getId('milestonesExtra').innerHTML = 'Requires <span class="darkvioletText">Void Milestones</span> Inflation to be active to enable effects';
        milestone1S1.src = 'Used_art/Preon.png';
        global.milestonesInfo[2].name[0] = 'Distant Clouds';
        getQuery('#milestone1Stage2Main > span').textContent = 'Distant Clouds';
        milestone1S2.src = 'Used_art/Clouds.png';
        milestone1S2.alt = 'Distant Clouds';
        milestone2S2.src = 'Used_art/Drop.png';
        milestone1S3.alt = 'Center of gravity';
        global.milestonesInfo[3].name[0] = 'Center of gravity';
        getQuery('#milestone1Stage3Main > span').textContent = 'Center of gravity';
        milestone2S4.src = 'Used_art/Black%20hole.png';
        getId('mergeResetText').innerHTML = '<span class="darkvioletText">Merge</span> does a <span class="grayText">Galaxy</span> reset, while also converting all self-made <span class="grayText">Galaxies</span> into bonus ones.';
        getQuery('#stageAutoInterstellar span').textContent = 'Stage';
        getQuery('#stageHistory > h3').textContent = 'Stage resets:';

        getId('preonCap').style.display = '';
        getId('molesProduction').style.display = '';
        getId('massProduction').style.display = '';
        getId('mainCapHardS5').style.display = '';
        getId('element0').style.display = '';
        getId('strangePeak').style.display = '';
        getId('stageTimeBestReset').style.display = '';
        getId('strange1Effect1Allowed').style.display = '';
        getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}5`).style.display = '';
        getId('strange7Stage1').style.display = '';
        getId('strange7Stage2').style.display = '';
        getId('strange8Stage3').style.display = '';
        getId('strange8Stage4').style.display = '';
        getId('strange3Stage5').style.display = '';
        getId('strange4Stage5').style.display = '';
        getId('milestone1Stage5Div').style.display = '';
        getId('milestone2Stage5Div').style.display = '';
        getId('stageAutoInterstellar').style.display = '';
        getId('vaporizationLimit').style.display = '';
        getId('collapseCapped').style.display = '';

        getId('strange1Effect1Disabled').style.display = 'none';
        getQuery('#stageAutoElse > span').textContent = 'Auto disable if still capable to do more Merges';
        getQuery('#stageAutoElse > span:last-of-type').style.display = 'none';
    } else {
        specialHTML.footerStatsHTML[1][0] = ['Quarks.png', 'stage1borderImage cyanText', 'Quarks'];
        buildingsInfo.hoverText[2][0] = 'Moles';
        buildingsInfo.hoverText[3][0] = 'Mass';
        buildingsInfo.type[2][0] = 'producing';
        buildingsInfo.type[3][0] = 'producing';
        buildings[1][0].current.setValue(3);
        buildings[2][0].current.setValue(2.7753108348135e-3);
        buildings[3][0].current.setValue(1e-19);
        if (buildingsInfo.name[1][0] === 'Mass') {
            specialHTML.buildingHTML[1].splice(0, 2);
            buildingsInfo.name[1].splice(0, 2);
            buildingsInfo.hoverText[1].splice(0, 2);
        }
        buildingsInfo.firstCost[1] = [0, 3, 24, 3];
        buildingsInfo.maxActive[1] = 4;
        buildingsInfo.maxActive[2] = 6;
        buildingsInfo.maxActive[3] = 5;
        buildingsInfo.maxActive[4] = 5;
        buildingsInfo.maxActive[6] = 1;
        global.buildingsInfo.producing[4][5].setValue(0);
        getQuery('#star3Effect > span.info').textContent = 'Boost to the Solar mass gain';

        upgrades1Cost = [0, 0, 12, 36, 120, 240, 480, 1600, 3200, 20800];
        (upgradesInfo[2].cost[0] as Overlimit).setValue(1e4);
        (upgradesInfo[5].cost[3] as Overlimit).setValue(1e150);
        upgradesInfo[1].maxActive = 10;
        upgradesInfo[2].maxActive = 8;
        upgradesInfo[3].maxActive = 13;
        upgradesInfo[4].maxActive = 4;
        upgradesInfo[5].maxActive = 4;
        upgradesInfo[6].maxActive = 0;

        researches1Cost = [600, 2000, 4000, 4000, 6000, 6000];
        researches1Scaling = [200, 400, 2000, 12000, 4000, 6000];
        researchesInfo[2].scaling[2] = 1e3;
        researchesInfo[2].scaling[3] = 1e2;
        researchesInfo[2].maxActive = 6;
        researchesInfo[4].maxActive = 5;
        researchesInfo[5].maxActive = 2;
        researchesInfo[6].maxActive = 0;

        researchesExtraInfo[1].maxActive = 0;
        researchesExtraInfo[2].maxActive = 3;
        researchesExtraInfo[3].maxActive = 4;
        researchesExtraInfo[4].maxActive = 3;
        researchesExtraInfo[5].maxActive = 1;
        researchesExtraInfo[6].maxActive = 0;

        elementsInfo.cost[27].setValue(1e52);
        elementsInfo.cost[28].setValue(1e54);
        elementsInfo.maxActive = 29;

        global.ASRInfo.costRange[1] = [2000, 8000, 16000];
        global.ASRInfo.costRange[3][3] = 2e30;

        strangeness1Cost = [1, 1, 1, 2, 4, 2, 24];
        strangeness1Scaling = [1, 0.5, 1, 2, 0, 0, 0];
        strangeness2Cost = [1, 1, 2, 2, 4, 2, 24];
        strangeness2Scaling = [0.5, 0.75, 1, 2, 0, 0, 0];
        strangeness3Cost = [1, 1, 2, 6, 4, 2, 4, 24];
        strangeness3Scaling = [0.75, 1.5, 1, 0, 0, 0, 2.5, 0];
        strangeness4Cost = [1, 1, 3, 2, 4, 2, 4, 24];
        strangeness4Scaling = [1, 2, 1.5, 2, 0, 0, 68, 0];
        strangeness5Cost = [20, 24, 240, 24, 6000, 24, 20, 120];
        strangeness5Scaling = [20, 24, 240, 0, 0, 0, 220, 0];
        strangenessInfo[1].maxActive = 7;
        strangenessInfo[2].maxActive = 7;
        strangenessInfo[3].maxActive = 8;
        strangenessInfo[4].maxActive = 8;
        strangenessInfo[5].maxActive = 10;
        strangenessInfo[6].maxActive = 0;

        getId('milestonesExtra').innerHTML = 'Completing any tier will award 1 <span class="greenText">Strange quark</span>';
        milestone1S1.src = 'Used_art/Quarks.png';
        global.milestonesInfo[2].name[0] = 'A Nebula of Drops';
        getQuery('#milestone1Stage2Main > span').textContent = 'A Nebula of Drops';
        milestone1S2.src = 'Used_art/Drop.png';
        milestone1S2.alt = 'A Nebula of Drops';
        milestone2S2.src = 'Used_art/Puddle.png';
        milestone1S3.alt = 'Cluster of Mass';
        global.milestonesInfo[3].name[0] = 'Cluster of Mass';
        getQuery('#milestone1Stage3Main > span').textContent = 'Cluster of Mass';
        milestone2S4.src = 'Used_art/Main_sequence%20mass.png';
        getId('mergeResetText').innerHTML = 'Attempt to <span class="darkvioletText">Merge</span> <span class="grayText">Galaxies</span> together, which will result in <span class="orchidText">Vacuum</span> decaying into its true state.';
        getQuery('#stageAutoInterstellar span').textContent = 'Interstellar Stage';
        getQuery('#stageHistory > h3').textContent = 'Interstellar Stage resets:';

        getId('strange8Stage5').style.display = '';
        getId('milestonesProgressArea').style.display = '';
        getQuery('#stageAutoElse > span').textContent = 'Reset pre-Interstellar Stages only if all Milestones are maxed';
        getQuery('#stageAutoElse > span:last-of-type').style.display = '';
        getId('rankStat0').style.display = '';

        getId('preonCap').style.display = 'none';
        getId('molesProduction').style.display = 'none';
        getId('massProduction').style.display = 'none';
        getId('dustCap').style.display = 'none';
        getId('submersionBoost').style.display = 'none';
        getId('mainCap').style.display = 'none';
        getId('mainCapHardS5').style.display = 'none';
        getId('mergeBoost').style.display = 'none';
        getId('mergeEffects').style.display = 'none';
        getId('mergeBoostTotal').style.display = 'none';
        getId('darkEnergySpent').style.display = 'none';
        getId('nucleationBoostTotal').style.display = 'none';
        getId('researchAuto1').style.display = 'none';
        getId('researchAuto2').style.display = 'none';
        getId('vaporizationLimit').style.display = 'none';
        getId('collapseCapped').style.display = 'none';
        getId('element0').style.display = 'none';
        getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}6`).style.display = 'none';
        for (let s = 1; s <= 5; s++) {
            for (let i = strangenessInfo[s].maxActive + 1; i <= strangenessInfo[s].firstCost.length; i++) {
                getId(`strange${i}Stage${s}`).style.display = 'none';
            }
        }
        getId('strange9Stage5').style.display = 'none';
        getId('toggleAuto9Info').style.display = 'none';
        getId('energyGainStage1Build1').style.display = 'none';
        getId('energyGainStage1Build2').style.display = 'none';
        for (let s = 2; s <= 5; s++) {
            getId(`energyGainStage${s}`).style.display = 'none';
        }
        getId('mergeResets').style.display = 'none';
        getId('mergeScore').style.display = 'none';
        getId('mergeResetsS6').style.display = 'none';
    }

    if (global.collapseInfo.supervoid) {
        (upgradesInfo[5].cost[3] as Overlimit).multiply(1e2);
        elementsInfo.cost[27].multiply(1e2);
        elementsInfo.cost[28].multiply(1e2);
    }
    upgradesInfo[1].cost.splice(0, upgrades1Cost.length, ...upgrades1Cost);
    researchesInfo[1].firstCost.splice(0, researches1Cost.length, ...researches1Cost);
    researchesInfo[1].scaling.splice(0, researches1Scaling.length, ...researches1Scaling);
    strangenessInfo[1].firstCost.splice(0, strangeness1Cost.length, ...strangeness1Cost);
    strangenessInfo[1].scaling.splice(0, strangeness1Scaling.length, ...strangeness1Scaling);
    strangenessInfo[2].firstCost.splice(0, strangeness2Cost.length, ...strangeness2Cost);
    strangenessInfo[2].scaling.splice(0, strangeness2Scaling.length, ...strangeness2Scaling);
    strangenessInfo[3].firstCost.splice(0, strangeness3Cost.length, ...strangeness3Cost);
    strangenessInfo[3].scaling.splice(0, strangeness3Scaling.length, ...strangeness3Scaling);
    strangenessInfo[4].firstCost.splice(0, strangeness4Cost.length, ...strangeness4Cost);
    strangenessInfo[4].scaling.splice(0, strangeness4Scaling.length, ...strangeness4Scaling);
    strangenessInfo[5].firstCost.splice(0, strangeness5Cost.length, ...strangeness5Cost);
    strangenessInfo[5].scaling.splice(0, strangeness5Scaling.length, ...strangeness5Scaling);
    for (let s = 1; s <= 3; s++) {
        const newValue = buildings[s][0].current;
        buildings[s][0].total.setValue(newValue);
        buildings[s][0].trueTotal.setValue(newValue);
    }
};

const fillMissingValues = <ArrayType extends any[]>(test: ArrayType, start: ArrayType) => {
    for (let i = test.length; i < start.length; i++) { test[i] = deepClone(start[i]); }
};

export const updatePlayer = (load: playerType): string => {
    if (load.inflation === undefined) { throw new ReferenceError('This save file is not from this game or too old'); }
    prepareVacuum(load.inflation.vacuum); //Only to set starting buildings values

    const oldVersion = load.version;
    if (oldVersion !== playerStart.version) {
        if (load.version === 'v0.1.2') {
            load.version = 'v0.1.3';
            load.stage.time = 0;
            load.inflation.age = 0;
        }
        if (['v0.1.3', 'v0.1.4', 'v0.1.5', 'v0.1.6', 'v0.1.7', 'v0.1.8'].includes(load.version)) {
            load.version = 'v0.1.9';
            load.discharge = deepClone(playerStart.discharge);
            load.researchesAuto = cloneArray(playerStart.researchesAuto);
            delete load['saveUpdate016' as keyof unknown];
            delete load.accretion['input' as keyof unknown];
        }
        if (load.version === 'v0.1.9') {
            load.version = 'v0.2.0';
            load.stage.peak = 0;
            load.vaporization.input = cloneArray(playerStart.vaporization.input);
            delete load['separator' as keyof unknown];
            delete load['intervals' as keyof unknown];
            delete load.stage['best' as keyof unknown];
            delete load.stage['export' as keyof unknown];
        }
        if (load.version === 'v0.2.0') {
            load.version = 'v0.2.1';
            load.time = deepClone(playerStart.time);
            load.toggles = deepClone(playerStart.toggles);
            load.inflation.resets = load.inflation.vacuum ? 1 : 0;
            load.buildings = deepClone(playerStart.buildings);
            load.upgrades[6] = cloneArray(playerStart.upgrades[6]);
            load.researches[6] = cloneArray(playerStart.researches[6]);
            load.researchesExtra[6] = cloneArray(playerStart.researchesExtra[6]);
            load.history = deepClone(playerStart.history);
        }
        if (load.version === 'v0.2.1') {
            load.version = 'v0.2.2';
            load.elements = cloneArray(playerStart.elements);
            load.collapse = deepClone(playerStart.collapse);
            load.inflation.time = load.inflation.age;
            load.clone = {};
            delete load['events' as keyof unknown];

            /* Can be removed eventually */
            load.time.vacuum = load.time.universe;
        }
        if (load.version === 'v0.2.2') {
            load.version = 'v0.2.3';
            const old = load.challenges?.active;
            load.challenges = deepClone(playerStart.challenges);
            if (old !== undefined && old !== -1) { load.challenges.active = old; }
        }
        if (load.version === 'v0.2.3') {
            load.version = 'v0.2.4';
            load.merge = deepClone(playerStart.merge);
            if (load.clone.depth !== undefined) { load.clone.merge = deepClone(playerStart.merge); }
        }
        if (load.version === 'v0.2.4') {
            load.version = 'v0.2.5';
            load.stage.peakedAt = 0;
            const old = (load.cosmon as unknown as playerType['cosmon'][0])?.total;
            load.cosmon = deepClone(playerStart.cosmon);
            if (old !== undefined) {
                load.cosmon[0].current = old;
                load.cosmon[0].total = old;
            }
            load.event = false;
            delete load.inflation['spent' as keyof unknown];
            delete load.inflation['tree' as keyof unknown];
            delete load['maxASR' as keyof unknown];

            /* Can be removed eventually */
            load.challenges.stability = 0; //DeepClone
            load.challenges.supervoidMax = cloneArray(load.challenges.supervoid);
            load.merge.rewards = cloneArray(playerStart.merge.rewards); //DeepClone
            if (load.clone.depth !== undefined) { load.clone.merge.rewards = cloneArray(playerStart.merge.rewards); }
            delete load.merge['reward' as keyof unknown];
        }
        if (load.version === 'v0.2.5') {
            load.version = 'v0.2.6';
            load.stage.input ??= 0; //Shorten
            load.darkness = deepClone(playerStart.darkness);
            load.inflation.loadouts ??= []; //Shorten
            load.inflation.voidVerses = 0;
            load.inflation.ends = cloneArray(playerStart.inflation.ends);
            load.verses = deepClone(playerStart.verses);
            load.verses[0].true = load.buildings[6][1].true;
            load.verses[0].current = load.buildings[6][1].true;
            load.strangeness[6] = cloneArray(playerStart.strangeness[6]);
            load.tree = deepClone(playerStart.tree);
            if (load.clone.depth !== undefined) {
                load.clone.darkness = {
                    energy: 0,
                    fluid: 0
                };
                load.clone.vaporization.clouds = new Overlimit(load.clone.vaporization.clouds).toNumber(); //Can be shortened
                load.clone.vaporization.cloudsMax = load.clone.vaporization.clouds;
                if (load.clone.depth !== 'stage') { load.clone.strangeness[6] = cloneArray(playerStart.strangeness[6]); }
            }

            /* Can be removed eventually */
            if (typeof load.stage.input === 'object') { load.stage.input = (load.stage.input as number[])[1]; }
            if (!Array.isArray(load.inflation.loadouts)) {
                const old = load.inflation.loadouts as unknown as Record<string, number[]>;
                load.inflation.loadouts = [];
                for (const key in old) { load.inflation.loadouts.push([key, old[key]]); }
            }
            load.buildings[6][1] = deepClone(playerStart.buildings[6][1]);
            load.toggles.verses = cloneArray(playerStart.toggles.verses);
            if (load.challenges.stability === 2) {
                load.challenges.stability = 1;
                load.cosmon[0].total--;
            }
            load.cosmon[0].current = load.cosmon[0].total;
            load.history.end = deepClone(playerStart.history.end);
            load.vaporization.clouds = new Overlimit(load.vaporization.clouds).toNumber();
            load.vaporization.cloudsMax = load.vaporization.clouds;
            load.time.excess = 0;
            load.time.end = load.time.online / 1000;
            delete load.history['vacuum' as keyof unknown];
        }
        if (load.version === 'v0.2.6_beta1') { //Move into testing website
            load.version = 'v0.2.6';
            load.time.excess = 0;
            if (load.challenges.supervoid[4] > 1) {
                load.cosmon[0].total -= load.challenges.supervoid[4] - 1;
                load.challenges.supervoid[4] = 1;
                load.challenges.supervoidMax[4] = Math.min(load.challenges.supervoidMax[4], 1);
            }
            if (load.challenges.supervoid[3] > 5) {
                load.cosmon[0].total--;
                load.challenges.supervoid[3] = 5;
                load.challenges.supervoidMax[3] = Math.min(load.challenges.supervoidMax[3], 5);
            }
            if (load.challenges.super && load.challenges.active === 0) { load.strangeness[3][9] = 0; }
            load.cosmon[0].current = load.cosmon[0].total;
            load.tree[0] = cloneArray(playerStart.tree[0]);
            load.tree[1].splice(7, 0, 0);
        }

        if (load.version !== playerStart.version) {
            throw new ReferenceError(`Save file version ${load.version} is not allowed`);
        }
    }
    if (load.vaporization.clouds === null) { //Remove
        load.vaporization.clouds = 0;
        load.vaporization.cloudsMax = 0;
    }
    if (load.clone.depth !== undefined && load.clone.vaporization.clouds === null) { //Remove
        load.clone.vaporization.clouds = 0;
        load.clone.vaporization.cloudsMax = 0;
    }

    for (let s = 1; s <= 6; s++) {
        fillMissingValues(load.buildings[s], playerStart.buildings[s]);
        fillMissingValues(load.toggles.buildings[s], playerStart.toggles.buildings[s]);
        if (!(load.toggles.shop.wait[s] >= 1)) { load.toggles.shop.wait[s] = 2; }

        fillMissingValues(load.upgrades[s], playerStart.upgrades[s]);
        fillMissingValues(load.researches[s], playerStart.researches[s]);
        fillMissingValues(load.researchesExtra[s], playerStart.researchesExtra[s]);
        load.ASR[s] ??= 0;
        fillMissingValues(load.strangeness[s], playerStart.strangeness[s]);

        if (s >= 6) { continue; }
        fillMissingValues(load.milestones[s], playerStart.milestones[s]);
    }
    fillMissingValues(load.strange, playerStart.strange);
    fillMissingValues(load.verses, playerStart.verses);
    fillMissingValues(load.cosmon, playerStart.cosmon);

    fillMissingValues(load.researchesAuto, playerStart.researchesAuto);
    fillMissingValues(load.elements, playerStart.elements);
    for (let s = 0; s < playerStart.tree.length; s++) { fillMissingValues(load.tree[s], playerStart.tree[s]); }

    fillMissingValues(load.toggles.verses, playerStart.toggles.verses);
    fillMissingValues(load.toggles.normal, playerStart.toggles.normal);
    fillMissingValues(load.toggles.confirm, playerStart.toggles.confirm);
    fillMissingValues(load.toggles.hover, playerStart.toggles.hover);
    fillMissingValues(load.toggles.max, playerStart.toggles.max);
    fillMissingValues(load.toggles.auto, playerStart.toggles.auto);

    const { clone } = load;
    if (clone.depth !== undefined) {
        for (let s = 1; s <= 6; s++) {
            fillMissingValues(clone.upgrades[s], playerStart.upgrades[s]);
            fillMissingValues(clone.researches[s], playerStart.researches[s]);
            fillMissingValues(clone.researchesExtra[s], playerStart.researchesExtra[s]);
            clone.ASR[s] ??= 0;

            if (clone.depth === 'stage') { continue; }
            fillMissingValues(clone.strangeness[s], playerStart.strangeness[s]);

            if (s >= 6) { continue; }
            fillMissingValues(clone.milestones[s], playerStart.milestones[s]);
        }
        fillMissingValues(clone.researchesAuto, playerStart.researchesAuto);
        fillMissingValues(clone.elements, playerStart.elements);
    }

    /* Restore data post JSON parse */
    load.fileName = new TextDecoder().decode(Uint8Array.from(load.fileName, (c) => c.codePointAt(0) as number));
    for (let i = 0; i < load.inflation.loadouts.length; i++) {
        load.inflation.loadouts[i][0] = new TextDecoder().decode(Uint8Array.from(load.inflation.loadouts[i][0], (c) => c.codePointAt(0) as number));
    }
    for (let s = 1; s < load.buildings.length; s++) {
        for (let i = 0; i < load.buildings[s].length; i++) {
            const building = load.buildings[s][i];
            building.current = new Overlimit(building.current);
            building.total = new Overlimit(building.total);
            building.trueTotal = new Overlimit(building.trueTotal);
        }
    }
    Object.assign(player, load);

    /* Final preparations and fixes */
    global.trueActive = player.stage.active;
    global.debug.historyStage = null;
    global.debug.historyEnd = null;
    global.debug.timeLimit = false;
    if (player.time.export[0] < -3600_000) { player.time.export[0] = -3600_000; }
    if (player.time.offline < -3600_000) { player.time.offline = -3600_000; }
    if (player.time.excess < -1200_000) { player.time.excess = -1200_000; }
    if (player.accretion.rank === 0) { player.buildings[3][0].current.setValue(5.9722e27); } //There are way too many save files with incorrect starting values...

    const progress = player.challenges.supervoidMax;
    global.inflationInfo.totalSuper = progress[1] + progress[2] + progress[3] + progress[4] + progress[5];
    const stars = player.buildings[4];
    global.collapseInfo.trueStars = stars[1].true + stars[2].true + stars[3].true + stars[4].true + stars[5].true;
    global.collapseInfo.pointsLoop = 0;
    global.historyStorage.stage = player.history.stage.list;
    global.historyStorage.end = player.history.end.list;
    assignResetInformation.supervoid();

    for (let s = 1; s <= 5; s++) {
        for (let i = 0; i < playerStart.milestones[s].length; i++) {
            assignMilestoneInformation(i, s);
        }
    }
    for (let s = 1; s <= 6; s++) {
        const strangeness = player.strangeness[s];
        const strangenessMax = global.strangenessInfo[s].max;
        for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) {
            calculateMaxLevel(i, s, 'strangeness');
            if (strangeness[i] > strangenessMax[i]) { strangeness[i] = strangenessMax[i]; }
        }
        const extra = player.researchesExtra[s];
        const extraMax = global.researchesExtraInfo[s].max;
        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) {
            calculateMaxLevel(i, s, 'researchesExtra');
            if (extra[i] > extraMax[i]) { extra[i] = extraMax[i]; }
        }
        const researches = player.researches[s];
        const researchesMax = global.researchesInfo[s].max;
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) {
            calculateMaxLevel(i, s, 'researches');
            if (researches[i] > researchesMax[i]) { researches[i] = researchesMax[i]; }
        }
        calculateMaxLevel(0, s, 'ASR');
        autoUpgradesSet(s);
        autoResearchesSet('researches', s);
        autoResearchesSet('researchesExtra', s);

        getId(`stageSwitch${s}`).style.textDecoration = global.trueActive === s ? 'underline' : '';
        global.lastUpgrade[s][0] = null;
    }
    for (let i = 0; i < playerStart.researchesAuto.length; i++) { calculateMaxLevel(i, 0, 'researchesAuto'); }
    for (let s = 0; s < playerStart.tree.length; s++) {
        const tree = player.tree[s];
        const treeMax = global.treeInfo[s].max;
        for (let i = 0; i < playerStart.tree[s].length; i++) {
            calculateMaxLevel(i, s, 'inflations');
            if (tree[i] > treeMax[i]) { tree[i] = treeMax[i]; }
        }
    }
    autoElementsSet();

    toggleSupervoid();
    for (let i = 0; i < global.challengesInfo.length; i++) { assignChallengeInformation(i); }
    global.lastElement = null;
    global.lastStrangeness = [null, 0];
    global.lastMilestone = [null, 0];
    global.lastChallenge[0] = player.challenges.active === null ? 1 : player.challenges.active;
    global.lastInflation = [null, 0];

    const logHTML = getId('logMain', true);
    if (logHTML !== null) {
        logHTML.innerHTML = '<li></li>';
        global.log.lastHTML[0] = 'Start of the log';
        global.log.lastHTML[1] = 1;
        global.log.lastHTML[3] = true;
    }
    global.log.lastHTML[2] = player.time.stage;
    global.log.add = [];

    assignBuildingsProduction.strange1();
    assignBuildingsProduction.strange0();
    assignBuildingsProduction.S2Levels(true);
    assignBuildingsProduction.S4Levels(true);
    assignResetInformation.maxRank();
    assignResetInformation.trueEnergy();
    if (global.loadouts.open) {
        (getId('loadoutsName') as HTMLInputElement).value = 'Auto-generate';
        loadoutsLoadAuto();
    }

    visualTrueStageUnlocks();
    switchTab(); //Order matters
    (getId('saveFileNameInput') as HTMLInputElement).value = player.fileName;
    (getId('stageInput') as HTMLInputElement).value = format(player.stage.input, { type: 'input' });
    (getId('vaporizationInput') as HTMLInputElement).value = format(player.vaporization.input[0], { type: 'input' });
    (getId('vaporizationInputMax') as HTMLInputElement).value = format(player.vaporization.input[1], { type: 'input' });
    (getId('collapseInput') as HTMLInputElement).value = format(player.collapse.input[0], { type: 'input' });
    (getId('collapseInputWait') as HTMLInputElement).value = format(player.collapse.input[1], { type: 'input' });
    (getId('mergeInput') as HTMLInputElement).value = format(player.merge.input[0], { type: 'input' });
    (getId('mergeInputSince') as HTMLInputElement).value = format(player.merge.input[1], { type: 'input' });
    (getId('nucleationInput') as HTMLInputElement).value = format(player.darkness.input, { type: 'input' });
    (getId('stageHistorySave') as HTMLInputElement).value = `${player.history.stage.input[0]}`;
    (getId('stageHistoryShow') as HTMLInputElement).value = `${player.history.stage.input[1]}`;
    (getId('endHistorySave') as HTMLInputElement).value = `${player.history.end.input[0]}`;
    (getId('endHistoryShow') as HTMLInputElement).value = `${player.history.end.input[1]}`;
    for (let i = 0; i < playerStart.toggles.verses.length; i++) { toggleSwap(i, 'verses'); }
    for (let i = 0; i < playerStart.toggles.normal.length; i++) { toggleSwap(i, 'normal'); }
    for (let i = 0; i < playerStart.toggles.confirm.length; i++) { toggleConfirm(i); }
    for (let i = 0; i < playerStart.toggles.hover.length; i++) { toggleSwap(i, 'hover'); }
    for (let i = 0; i < playerStart.toggles.max.length; i++) { toggleSwap(i, 'max'); }
    for (let i = 0; i < playerStart.toggles.auto.length; i++) { toggleSwap(i, 'auto'); }
    (getId('buyAnyInput') as HTMLInputElement).value = format(player.toggles.shop.input, { type: 'input' });
    updateCollapsePoints();
    loadoutsRecreate();

    return oldVersion;
};
