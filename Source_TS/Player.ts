import Overlimit from './Limit';
import { assignInnerHTML, cloneArray, deepClone, getId, getQuery, playerStart, toggleConfirm, toggleSwap } from './Main';
import { globalSave, specialHTML } from './Special';
import { calculateMaxLevel, assignMilestoneInformation, calculateEffects, assignBuildingsProduction, assignResetInformation, assignChallengeInformation, logAny, toggleChallengeType, prepareDarkness } from './Stage';
import type { globalType, playerType, vacuumStartType } from './Types';
import { format, switchTab, updateCollapsePoints, visualProgressUnlocks } from './Update';

export const player: playerType = {
    version: 'v0.2.8',
    fileName: 'Fundamental, [dateD.M.Y] [timeH-M-S], [stage]',
    stage: {
        current: 1,
        active: 1,
        resets: 0,
        time: 0,
        peak: [0, 0],
        input: [1, 0, 0, 0]
    },
    discharge: {
        energy: 0,
        current: 0
    },
    vaporization: {
        clouds: 0,
        input: [3, 0]
    },
    accretion: {
        rank: 0
    },
    collapse: {
        mass: 0.01235,
        stars: [0, 0, 0],
        highest: 0,
        input: [2, 1e6],
        points: []
    },
    merge: {
        rewards: [0, 0, 0, 0],
        claimed: [0, 0],
        resets: 0,
        input: [0, 0],
        since: 0
    },
    darkness: {
        active: false,
        tier: 0,
        energy: 0,
        fluid: 0,
        input: 1.5
    },
    inflation: {
        loadouts: [],
        vacuum: false,
        resets: 0,
        age: 0,
        ends: [0, 0, 0],
        time: 0,
        peak: [0, 0]
    },
    time: {
        updated: Date.now(),
        started: Date.now(),
        excess: 0,
        export: [0, 0, 0, 0],
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
            other: [0, 0, 0],
            current: 0,
            highest: 0,
            lowest: [255, 255, 255],
            total: 0
        }, {
            true: 0,
            current: 0,
            total: 0
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
        supervoid: false,
        shop: {
            input: 0,
            wait: [2]
        }
    },
    history: {
        stage: {
            best: [3.1556952e16, 0, 0, 0, 0],
            list: [],
            input: [20, 100]
        },
        end: {
            best: [3.1556952e16, 0, 0, 0, 0],
            list: [],
            input: [20, 100]
        }
    },
    progress: {
        main: 0,
        element: [0, 0],
        results: 0,
        universe: 0
    },
    clone: {}
};

/* All values must be from true Vacuum (doesn't include most of 'maxActive's) */
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
        challenge: null,
        rankUpdated: null,
        historyStage: null
    } as globalType['debug'],
    offline: {
        active: true,
        stage: [null, null],
        autosave: false,
        cacheUpdate: true
    },
    april: {
        active: false,
        light: false,
        ultravoid: null,
        quantum: false
    },
    paused: true,
    trueActive: 1,
    lastSave: 0,
    lastUpdate: null,
    hotkeys: {
        disabled: true,
        shift: false,
        ctrl: false,
        tab: false,
        last: ''
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
        element: 1,
        autoS: []
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
        scaling: 10,
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
        unlockU: [0.01235, 0.076, 1.3, 10, 40, 1000],
        unlockR: [0.18, 0.3, 0.8, 1.3, 40, 1000],
        newMass: 0,
        starCheck: [0, 0, 0],
        trueStars: 0,
        pointsLoop: 0, //Micro optimization
        solarCap: 0.01235
    },
    mergeInfo: {
        unlockU: [0, 0, 0, 0, 1, 1, 4],
        unlockR: [0, 0, 3, 3, 100],
        unlockE: [0, 2, 4, 4, 100, 100],
        S5Extra2: 0,
        checkReward: [0, 0, 0, 0],
        galaxies: 0
    },
    inflationInfo: {
        globalSpeed: 1,
        trueUniverses: 0,
        totalSuper: 0,
        newFluid: 0
    },
    intervalsId: {
        main: undefined,
        numbers: undefined,
        visual: undefined,
        autoSave: undefined,
        mouseRepeat: undefined
    },
    buildingsInfo: {
        maxActive: [0, 4, 6, 5, 5, 4, 2], //[5, 6] is required
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
            ['improving', 'producing', 'improving', 'improving', 'improving', 'improving'],
            ['delaying', 'producing', 'producing', 'improving', 'improving'],
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
        increaseStart: [[]],
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
                () => `Ability to regain spent Energy and if had enough Energy, it will also boost production of ${player.inflation.vacuum ? 'Microworld' : 'all'} Structures by ${format(global.dischargeInfo.base, { padding: true })}.${player.inflation.vacuum ? `\n(In true Vacuum it will also reset resources and all non-self-made Structures from all Stages${player.progress.main >= 18 ? ' before Abyss' : ''}, and enough self-made Structures to fully regain spent Energy)` : ''}`,
                () => `Decrease Structures cost scaling by -${format(calculateEffects.S1Upgrade6())}.`,
                () => `Make self-made Structures boost themselves by ${format(calculateEffects.S1Upgrade7())}.${player.inflation.vacuum ? `\n(Self-made Preons boost themselves by ${format(calculateEffects.S1Upgrade7(true), { padding: player.buildings[1][1].true < 1001 })} instead, softcaps instantly and gets completely disabled after ${format(1001)} Preons)` : ''}`,
                () => `Molecules will produce Molecules, at a reduced rate.\n(${format(new Overlimit(effectsCache.tritium).multiply(global.inflationInfo.globalSpeed), { padding: true })} Molecules per second)`,
                () => `Unspent Energy ${player.upgrades[1][10] === 1 ? '' : `^${format(0.5)}`} will boost '${global.upgradesInfo[1].name[8]}' production of Molecules.\n(Boost: ${format(calculateEffects.S1Upgrade9(), { padding: true })})`,
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
                () => `Drops will ${player.inflation.vacuum ? `improve ${global.upgradesInfo[1].name[8]}` : 'produce Moles'} ${format(player.inflation.vacuum ? 1.02 : 1.04)} times ${player.inflation.vacuum ? 'more' : 'faster'} for every self-made Drop.`,
                () => `Spread water faster with every Puddle, current formula is ${format(player.challenges.active === 0 && player.toggles.supervoid ? 1.01 : 1.02)} ^ effective Puddles.\nPuddles after 200 and non-self-made ones are raised to the power of ${format(0.7)}.\n(Total effect: ${format(calculateEffects.S2Upgrade1(), { padding: true })})`,
                () => `Gain ability to convert Drops into Clouds. Cloud gain formula: (Drops / ${format(calculateEffects.S2Upgrade2())}) ^${format(calculateEffects.cloudsGain())}, gain is reduced with Clouds.`,
                () => `Puddles will get a boost based on Moles ^${format(calculateEffects.S2Upgrade3_power())}.\n(Boost: ${format(calculateEffects.S2Upgrade3(), { padding: true })})`,
                () => `Puddles will get a boost based on Drops ^${format(calculateEffects.S2Upgrade4_power())}.\n(Boost: ${format(calculateEffects.S2Upgrade4(), { padding: true })})`,
                () => { //[5]
                    const effect = 1 + player.researches[2][4];
                    return `Ponds will increase current Puddle amount. (${effect} extra Puddle${effect !== 1 ? 's' : ''} per Pond)`;
                },
                () => { //[6]
                    const effect = 1 + player.researches[2][5];
                    return `Lakes will increase current Pond amount. (${effect} extra Pond${effect !== 1 ? 's' : ''} per Lake)`;
                },
                () => { //[7]
                    const effect = 1 + player.researches[2][6];
                    return `Spreads enough water to make Seas increase current Lake amount. (${effect} extra Lake${effect !== 1 ? 's' : ''} per Sea)`;
                },
                () => 'Spreads water too fast. 1 extra Sea per Ocean.\nIt will also improve Oceans effect scaling.'
            ],
            cost: [10, 1e6, 1e10, 1e3, 1e4, 2e9, 5e20, 1e28, 2e48] as unknown as Overlimit[],
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
                () => `Allow for Star clusters to be boosted by ('Gravity' / ${format(2e5)}) ^${format(0.8)} + 1.\n(Boost is equal to ${format(calculateEffects.S3Upgrade13(), { padding: true })})`
            ],
            cost: [1e-16, 1e-13, 1e-13, 1, 1e14, 1e17, 1e10, 1e22, 1e22, 1e23, 1e9, 1e26, 1e29, 1e86] as unknown as Overlimit[],
            maxActive: 13
        }, { //Stage 4
            name: [
                'Gravitational Collapse',
                'Proton-Proton chain',
                'Carbon-Nitrogen-Oxygen cycle',
                'Helium fusion',
                'Nucleosynthesis',
                'Proton capture'
            ],
            effectText: [
                () => `As fuel runs out, every Star will boost production in its own special way.\nSolar mass ${player.inflation.vacuum ? `on Collapse is Accretion Mass / ${format(1.98847e33)} and ` : ''}will not decrease if to reset below current. (Hover over Remnants effects to see what they boost)`,
                () => `Fuse with ${global.upgradesInfo[1].name[6]} instead of ${global.upgradesInfo[1].name[7]}. Unlocks 5 first Elements. ('Elements' subtab)`,
                () => `Unlock 5 more Elements through the CNO cycle, which is also is a better source of ${global.april.active ? 'Antihelium' : 'Helium'} and Energy.`,
                () => 'Through Triple-alpha and then Alpha process unlock 2 more Elements.',
                () => { //[4]
                    const effect = 1 + calculateEffects.trueUniverses();
                    return `Create new Atomic nuclei with ${global.april.active ? 'Antineutron' : 'Neutron'} capture (s-process and r-process).\nUnlocks ${effect} more Element${effect !== 1 ? 's' : ''} (+1 for every ${player.progress.main >= 18 ? `${universeName()} Universe` : '(unlocked with Abyss)'}).`;
                },
                () => { //[5]
                    const effect = 1 + player.verses[1].true;
                    return `Speed up the creation of new Elements by adding even more ${global.upgradesInfo[1].name[3]} (p-process and rp-process).\nUnlocks ${effect} more Element${effect !== 1 ? 's' : ''} (+1 for every self-made Multiverse).`;
                }
            ],
            cost: [100, 1000, 1e9, 1e48, 1e128, 1e256] as unknown as Overlimit[],
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
                () => `Boost per Galaxy will be increased by +${format(calculateEffects.S5Upgrade2(false, 1), { padding: true })}.\n(Effect will be increased by +${format(player.inflation.vacuum ? 0.25 : 0.5)} for every new digit of Solar mass past ${format(1e5)})`,
                () => `Unlock a new reset type that will bring Galaxies closer for potential Merging.${player.inflation.vacuum ? ' That reset behaves like a Galaxy reset, while also converting self-made Galaxies into bonus ones. Can only be done a limited amount of times per Stage reset.' : ''}`,
                () => `Region of space that is undergoing a larger amount of Star formations, it will boost Nebulas by ${format(1000 * 10 ** player.researches[5][4])}.`,
                () => `A spheroidal conglomeration of Stars that is even more dense than Super Star cluster, it will boost Star clusters by ${format(1000 * 10 ** player.researches[5][4])}.`,
                () => `An entire Galaxy that is undergoing higher rate of Star formations, it will boost Galaxies by ${format(100 * 10 ** player.researches[5][4])}.`
            ],
            cost: [1e56, 1e60, 1e120, 1e160, 1e200, 1e210, '1e360'] as unknown as Overlimit[],
            maxActive: 7 //Required
        }, { //Stage 6
            name: [
                'Dark nucleation',
                'Placeholder'
            ],
            effectText: [
                () => { //[0]
                    const Dark = global.april.light ? 'Light' : 'Dark';
                    return `Unlock a new ${Dark} reset, it will start the formation of the new ${Dark} resources by modifing existing physics.\n(Formula for ${Dark} fluid gain is (log2(${Dark} matter / ${format(1e8)}) + ${Dark} energy) ^${format(calculateEffects.S6Upgrade0())}, gain is reduced with more ${Dark} fluid. ${Dark} fluid boost ${Dark} matter production and effective ${Dark} energy)`;
                },
                () => 'Work in progress.'
            ],
            cost: [8e12, 2e20] as unknown as Overlimit[],
            maxActive: 2 //Required
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
                    return `Discharge production boost from reached Goals will be increased by +${format(newBase - global.dischargeInfo.base)}.\n(This is equal to ${format((newBase / global.dischargeInfo.base) ** global.dischargeInfo.total, { padding: true })}x boost improvement)`;
                },
                () => `Discharge goals will be able to boost '${global.upgradesInfo[1].name[8]}'.\n(Current effect: ${format(calculateEffects.S1Research5())} ^ level)`
            ],
            cost: [],
            firstCost: [1600, 4800, 16000, 32000, 16000, 24000],
            scaling: [400, 1200, 8000, 40000, 16000, 16000],
            max: [5, 4, 8, 2, 4, 3],
            maxActive: 6 //Required
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
                () => `Drops will ${player.inflation.vacuum ? `improve ${global.upgradesInfo[1].name[8]}` : 'produce Moles'} ${player.challenges.active === 0 && player.toggles.supervoid ? 2 : 3} times more.${player.upgrades[2][2] === 1 || player.inflation.vacuum ? `\nEffective level ${global.vaporizationInfo.S2Research0 !== player.researches[2][0] ? `is ${format(global.vaporizationInfo.S2Research0, { padding: true })}, will be restored with more Drops` : 'will be set to 0 after any reset'}.` : ''}`,
                () => `Puddles will produce ${player.challenges.active === 0 && player.toggles.supervoid ? format(1.4) : 2} times more Drops.${player.upgrades[2][2] === 1 || player.inflation.vacuum ? `\nEffective level ${global.vaporizationInfo.S2Research1 !== player.researches[2][1] ? `is ${format(global.vaporizationInfo.S2Research1, { padding: true })}, will be restored with more Drops` : 'will be set to 0 after any reset'}.` : ''}`,
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
            firstCost: [10, 400, 1e4, 1e5, 1e14, 1e22, 1e80] as unknown as Overlimit[],
            scaling: [1.366, 5, 1e2, 1e3, 1e3, 1e4, 1],
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
                    return `Planetesimals will attract other bodies and get a boost to their own production based on unspent Mass ^${format(new Overlimit(effect).log(player.buildings[3][0].current), { padding: true })}.\n(Boost: ${format(effect, { padding: true })} ⟶ ${format(calculateEffects.S3Research6(player.researches[3][6] + 1), { padding: true })}, weaker after ${format(1e21)} Mass)`;
                },
                () => `'Magma Ocean' will become stronger, by ${format(1.5)}.`,
                () => `Improve 'Pebble accretion' Accretion speed even more.\n${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will increased by 2.`
            ],
            cost: [],
            firstCost: [1e-16, 1e-15, 1e-5, 1e2, 1e10, 1e11, 1e15, 1e14, 1e12] as unknown as Overlimit[],
            scaling: [11, 111, 22, 10, 100, 100, 10, 1e4, 1e3],
            max: [9, 3, 8, 8, 2, 2, 6, 4, 4],
            maxActive: 9 //Required
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
                () => `From Planetesimals to Planets, will get ${format(calculateEffects.S4Research0_base())}x boost to Interstellar Stars with every level.\n(Total boost: ${format(calculateEffects.S4Research0(), { padding: true })})`,
                () => { //[1]
                    const base = calculateEffects.S4Research1();
                    return `All self-made Stars will boost each other by ${format(base, { padding: true })}.\n(Total boost: ${format(new Overlimit(base).power(global.collapseInfo.trueStars), { padding: true })} ⟶ ${format(new Overlimit(calculateEffects.S4Research1(player.researches[4][1] + 1)).power(global.collapseInfo.trueStars), { padding: true })})`;
                },
                () => `Improve effect scaling of 'Planetary system', as well increase its max level by +3.\n(Total boost from 'Planetary system' will be increased by ${format(calculateEffects.S4Research0(calculateEffects.S4Research0_base(player.researches[4][2] + 1) / calculateEffects.S4Research0_base()), { padding: true })})`,
                () => "Matter will be expelled from Red giants, this will boost Main-sequence Stars by 2, and also increase 'Planetary system' max level by +3.",
                () => `An immensely energetic explosion that will boost Interstellar Stars by ${format(calculateEffects.S4Research4(), { padding: true })}${player.researches[4][4] < 2 ? ` ⟶ ${format(calculateEffects.S4Research4(false, player.researches[4][4] + 1), { padding: true })}` : ''}.\n(Effect will be stronger with more Black holes${player.elements[23] >= 1 ? ' and Solar mass' : ''})`,
                () => 'Quasi-stars will Collapse into Intermediate-mass Black holes that are equivalent to +1 (Stellar) Black holes per level.'
            ],
            cost: [],
            firstCost: [1e3, 5e4, 1e8, 1e11, 1e28, 1e154] as unknown as Overlimit[],
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
                () => { //[0]
                    const names = global.buildingsInfo.name[4];
                    let unlocks = names[1];
                    for (let i = 2; i < player.researches[5][0] + 2; i++) { unlocks += `, ${names[i]}`; }
                    return `Higher density of Nebulas will allow them to produce Stars of higher tier, but each tier is 4 times slower than the previous one. It will also boost Nebulas by 2.\nNext tier will be ${names[Math.min(player.researches[5][0] + 2, player.inflation.vacuum ? 5 : 4)]}. Currently can produce: ${unlocks}.`;
                },
                () => { //[1]
                    const names = global.buildingsInfo.name[4];
                    const max = (player.inflation.vacuum ? 5 : 4);
                    let unlocks = names[max];
                    for (let i = 1; i < player.researches[5][1] + 1; i++) { unlocks += `, ${names[max - i]}`; }
                    return `More of the same Star type will be found within Star cluster. Star clusters and their minimum strength will be improved by 2. It will also boost Stars of lower tier, but 2 times less than the previous one.\nNext tier will be ${names[Math.max(max - player.researches[5][1] - 1, 1)]}. Currently can boost: ${unlocks}.`;
                },
                () => `Weaken internal gas pressure within Nebulas to cause even more gravitational Collapses.\nThis will make every self-made Nebula boost each other by ${format(calculateEffects.S5Research2(), { padding: true })}. (+${format(0.00625)} per level)${visualUniverseLevels(4, 5)}`,
                () => `Increase the Energy required for Star clusters to cease being in a gravitationally bound state.\nThis will make every self-made Star cluster boost each other by ${format(calculateEffects.S5Research3(), { padding: true })}. (+${format(0.00625)} per level)${visualUniverseLevels(4, 5)}`,
                () => "Produce even more stars and increase strength of 'Starburst region', 'Globular cluster' and 'Starburst Galaxy' effects by 10 per level."
            ],
            cost: [],
            firstCost: [1e54, 1e58, 1e280, 1e290, '1e550'] as unknown as Overlimit[],
            scaling: [1e8, 1e8, 1e30, 1e30, 1e30],
            max: [4, 4, 1, 1, 1],
            maxActive: 5 //Required
        }, { //Stage 6
            name: [
                'Dark aggregation',
                'Acceleration',
                'Self-interaction',
                'Composition'
            ],
            effectText: [
                () => `Boost production of ${global.buildingsInfo.name[6][0]} by 3 for the first ${6 + player.researchesExtra[6][0]} levels and by 2 for the rest.\n(First time reaching levels 6, 10, 12 and 20 also unlocks something new)`,
                () => `Boost global speed by ${format(1.1)}.\nAlso delays ${global.buildingsInfo.name[6][0]} softcap by 1 + level.`,
                () => `Make self-made ${global.buildingsInfo.name[6][1]} boost each other by 1 + ${format(0.01)} * level and scale in cost slower by -${format(0.05)} * level.`,
                () => `Have more ${global.april.light ? 'Light' : 'Dark'} energy by increasing its gain by 1 + level.`
            ],
            cost: [],
            firstCost: [2e6, 2e9, 8e9, 5e15] as unknown as Overlimit[],
            scaling: [2, 2, 3, 20],
            max: [20, 8, 5, 4],
            maxActive: 4 //Required
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
                    return `Improve '${global.upgradesInfo[1].name[8]}' formula, current formula is log${format(now)}${player.researchesExtra[1][1] < 4 ? ` ⟶ log${format(after)}.\n(Which is equal to ${format(logAny(now, after), { padding: true })}x improvement)` : '.'}`;
                },
                () => `First level is to begin the Accretion, second level is to Submerge it.\nAll Structures produce Energy on creation and all resets affect all lower Stages, while also doing Discharge reset.\nAccretion Mass is Microworld Mass * ${format(1.78266192e-33)} and Moles are Molecules / ${format(6.02214076e23)}.`,
                () => { //[3]
                    const power = calculateEffects.S1Extra3();
                    const energy = calculateEffects.effectiveEnergy();
                    return `Boost Preons and delay hardcap by current Energy ^${format(power)}.\n(Effect: ${format(energy ** power, { padding: true })} ⟶ ${format(energy ** calculateEffects.S1Extra3(player.researchesExtra[1][3] + 1), { padding: true })})`;
                },
                () => { //[4]
                    const base = calculateEffects.S1Extra4();
                    return `Discharge goals will be able to boost Interstellar Stars. Their strength is based on Energy and Discharge base.\nCurrent base is ${format(base, { padding: true })}, total boost is ${format(base ** global.dischargeInfo.total, { padding: true })}.`;
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
                    if (!player.inflation.vacuum || player.tree[1][5] < 2) { return 'When formed, Clouds will use Drops produced this reset instead of current ones.'; }
                    const level = player.researchesExtra[2][0];
                    const extra = player.strangeness[2][4] >= 2 ? 0.4 : 4;
                    return `Passively gain ${format((level + 3) * level / extra)}% ⟶ ${format((level + 4) * (level + 1) / extra)}% Clouds per second. (Not affected by global speed)`;
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
                    return `Submerge and boost Interstellar Stars with 'Surface tension'. Also with 'Surface stress' ^${format(0.5)} at level 2, full power at level 3.\n(Boost to Stars: ${level < 3 ? `${format(level < 1 ? 1 : effectsCache.S2Upgrade3 * (level > 1 ? effectsCache.S2Upgrade4 ** 0.5 : 1), { padding: true })} ⟶ ` : ''}${format(effectsCache.S2Upgrade3 * (level < 1 ? 1 : effectsCache.S2Upgrade4 ** (level > 1 ? 1 : 0.5)), { padding: true })})`;
                },
                () => { //[4]
                    const level = player.researchesExtra[2][4];
                    return `High density of Drops will end up boosting Nebulas with 'Surface tension'. Also with 'Surface stress' ^${format(0.5)} at level 2, full power at level 3.\n(Boost to Nebulas: ${level < 3 ? `${format(level < 1 ? 1 : effectsCache.S2Upgrade3 * (level > 1 ? effectsCache.S2Upgrade4 ** 0.5 : 1), { padding: true })} ⟶ ` : ''}${format(effectsCache.S2Upgrade3 * (level < 1 ? 1 : effectsCache.S2Upgrade4 ** (level > 1 ? 1 : 0.5)), { padding: true })})`;
                }
            ],
            cost: [],
            firstCost: [1e18, 1e12, 1e26, 1e14, 1e60] as unknown as Overlimit[],
            scaling: [1e4, 1e3, 1, 1e8, 1e8],
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
                () => `Increase strength of Cosmic dust by another ${format(1.11)} per level. Max level is based on Rank.\n(Total increase: ${format(1.11 ** player.researchesExtra[3][0], { padding: true })})`,
                () => { //[1]
                    const base = calculateEffects.S3Extra1();
                    return `${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be even bigger, current formula is ${format(base)} ^ Rank.\n(Total boost: ${format(base ** global.accretionInfo.effective, { padding: true })} ⟶ ${format(calculateEffects.S3Extra1(player.researchesExtra[3][1] + 1) ** global.accretionInfo.effective, { padding: true })})`;
                },
                () => "'Gravitational field' will be able to boost Protoplanets, but at reduced strength. (2x boost)",
                () => `'Gas' will be ${format(calculateEffects.S3Upgrade1(calculateEffects.S3Upgrade1_power(player.researchesExtra[3][3] + 1)) / calculateEffects.S3Upgrade1(), { padding: true })} times stronger with every level.`,
                () => `Submerge quicker by boosting Puddles, effect is based on Rank.\n(Current boost: ${format(calculateEffects.S3Extra4(), { padding: true })} ⟶ ${format(calculateEffects.S3Extra4(player.researchesExtra[3][4] + 1), { padding: true })})`,
                () => `Protect your Mass from being removed by removing Cosmic dust hardcap instead.\nSecond level will redirect delay to the hardcap as a boost to Cosmic dust that ignores softcap.\n(Current hardcap delay is ${format(calculateEffects.dustDelay(), { padding: true })})`
            ],
            cost: [],
            firstCost: [1e-18, 1e-7, 1e26, 1e9, 1e-10, 1.98847e40] as unknown as Overlimit[],
            scaling: [10, 100, 1, 1e5, 1e12, 5.024e59],
            max: [14, 6, 1, 5, 1, 2],
            maxActive: 4
        }, { //Stage 4
            name: [
                'Nova',
                'Mass transfer',
                'White dwarfs',
                'Quark-nova',
                'White holes'
            ],
            effectText: [
                () => `This violent stellar explosion is the main source of Elements, but also starts the formation of new Stars.\nUnlock a new Star type and even more, after Collapse of that Star type.\n(Will require at least ${format(global.collapseInfo.unlockB[Math.min(player.researchesExtra[4][0] + 2, 4)])} Solar mass to create that new Star type)`,
                () => `Star material will transfer from one Star to another, improving Solar mass gain${player.inflation.vacuum ? ' (also delaying Preons hardcap)' : ''} by ${format(calculateEffects.S4Extra1())} in the process.\nImproved by 'Star system' levels, but also improves their scaling (effect increase for 'Star system' is ${format(new Overlimit(calculateEffects.S4Research1(undefined, 1) / calculateEffects.S4Research1(undefined, 0)).power(global.collapseInfo.trueStars), { padding: true })}).`,
                () => `After matter were dispeled from Red giant, White dwarf was all that remained.\nImprove effect of '${global.elementsInfo.name[6]}' by +${format(0.5)} and increase max level of 'Star system' by +1.`,
                () => `As ${global.april.active ? 'Antineutron' : 'Neutron'} stars spin down, some of them may get converted into Quark stars.\nThis will add a new effect to ${global.april.active ? 'Antineutron' : 'Neutron'} stars ‒ Interstellar Stars are cheaper, and will also increase max level of 'Star system' by +1.`,
                () => 'Spawn White holes that will boost global speed with current Black holes effect.'
            ],
            cost: [],
            firstCost: [4e4, 2e9, 1e50, 1e136, '1e680'] as unknown as Overlimit[],
            scaling: [1e10, 1, 1, 1, 1],
            max: [3, 1, 1, 1, 1],
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
                () => `Unlock a new Result for the Merge resets, requires enough self-made Galaxies before Merging.${global.researchesExtraInfo[5].max[1] > 1 ? '\nSecond level will allow the use of the excess Galaxies from previous Merge resets when forming new Galaxy groups.' : ''}${visualUniverseLevels(4)}`,
                () => { //[2]
                    const maxLevel = player.researchesExtra[5][2] + player.merge.rewards[1];
                    const trueLevel = global.mergeInfo.S5Extra2;
                    return `An even bigger Galaxy to improve Stage reset reward and Galaxy groups effect with every Galaxy group.\nEffective level is ${format(trueLevel, { padding: trueLevel !== maxLevel })}, will be ${trueLevel !== maxLevel ? "restored with more Stardust, this doesn't" : "set to 0 after any reset, this won't"} affect Stage reset reward.\n(Total boost: ${format(calculateEffects.S5Extra2(trueLevel), { padding: true })} ⟶ ${format(calculateEffects.S5Extra2(maxLevel + (maxLevel === trueLevel ? 1 : 0)), { padding: true })})${visualUniverseLevels(Math.max(calculateEffects.trueUniverses() + 1, 5))}`;
                },
                () => `Increase max allowed Merge resets by +1 per level.${visualUniverseLevels(Math.max(calculateEffects.trueUniverses() + 1, 5))}`,
                () => `Decrease amount of Galaxies required for the creation of a Galaxy Group.\n(Effect: ${calculateEffects.S5Extra4()} ⟶ ${calculateEffects.S5Extra4(player.researchesExtra[5][4] + 1)})`,
                () => `Unlock the second Merge result${global.researchesExtraInfo[5].max[5] > 1 ? ' and make it able to use excess Galaxies at level 2' : ''}.`
            ],
            cost: [],
            firstCost: [1e80, 1e270, '1e360', '1e390', '1e510', '1e660'] as unknown as Overlimit[],
            scaling: [1, 1e120, 1e30, 1e90, 1e90, 1e270],
            max: [1, 1, 1, 1, 1, 1],
            maxActive: 6 //Required
        }, { //Stage 6
            name: [
                'Faster aggregation',
                'Time dilation',
                'Expansion',
                'Quintessence',
                'Stability'
            ],
            effectText: [
                () => `Increases how many levels of '${global.researchesInfo[6].name[0]}' boost production by 3 instead of 2 and max level by +1.`,
                () => "Delay 'Global boost' Inflaton Inflation softcap by (1 + level) ^2.\nAlso increase max level of 'Acceleration' by +2.",
                () => { //[2]
                    const energy = calculateEffects.effectiveDarkEnergy();
                    return `Delay ${global.buildingsInfo.name[6][0]} softcap by current ${global.april.light ? 'Light' : 'Dark'} energy ^(level / 5).\n(Current delay: ${format(energy ** (player.researchesExtra[6][2] / 5), { padding: true })} ⟶ ${format(energy ** ((player.researchesExtra[6][2] + 1) / 5), { padding: true })})`;
                },
                () => { //[3]
                    const delay = calculateEffects.darkSoftcap(true);
                    return `Buff Universes with ${global.buildingsInfo.name[6][0]} softcap delays ^(level / 40) by improving the ratio of kinetic and potential ${global.april.light ? 'Light' : 'Dark'} energy.\n(Current effect: ${format(delay ** (player.researchesExtra[6][3] / 40), { padding: true })} ⟶ ${format(delay ** ((player.researchesExtra[6][3] + 1) / 40), { padding: true })})`;
                },
                () => { //[4]
                    const Dark = global.april.light ? 'Light' : 'Dark';
                    return `Increase ${Dark} fluid gain by +^${format(0.05)} and starting effective ${Dark} energy by +${Dark} fluid effect * level / 4.`;
                }
            ],
            cost: [],
            firstCost: [25, 25, 50, 100, 100],
            scaling: [25, 25, 50, 100, 200],
            max: [4, 4, 5, 8, 4],
            maxActive: 5 //Required
        }
    ],
    researchesAutoInfo: {
        name: [
            'Upgrade automatization',
            'Element automatization',
            'Reset automatization'
        ],
        effectText: [
            () => { //[0]
                let unlocked = 'none';
                if (player.researchesAuto[0] >= 1) { unlocked = 'auto Upgrades'; }
                if (player.researchesAuto[0] >= 2) { unlocked += `, Stage${player.researchesAuto[0] >= 3 ? ' and Special' : ''} Researches`; }
                return `Automatically create all ${['Upgrades', 'Stage Researches', 'Special Researches'][Math.min(player.researchesAuto[0], 2)]} from any Stage.\n(Unlocked automatization: ${unlocked})`;
            },
            () => 'Elements will no longer require Collapse for activation.\nSecond level will unlock auto creation of Elements.',
            () => { //[2]
                const base = `Unlock auto ${['Discharge', player.inflation.vacuum ? 'Rank' : 'Vaporization', player.inflation.vacuum ? 'Vaporization' : 'Rank', 'Collapse'][Math.min(player.inflation.vacuum ? player.researchesAuto[2] : (player.stage.current - 1), 3)]} level 1.`;
                if (!player.inflation.vacuum) { return base; }
                const unlocks = [];
                if (player.researchesAuto[2] >= 1 || player.strangeness[1][4] >= 1) { unlocks.push('Discharge'); }
                if (player.researchesAuto[2] >= 2 || player.strangeness[3][4] >= 1) { unlocks.push('Rank'); }
                if (player.researchesAuto[2] >= 3 || player.strangeness[2][4] >= 1) { unlocks.push('Vaporization'); }
                if (player.researchesAuto[2] >= 4 || player.strangeness[4][4] >= 1) { unlocks.push('Collapse'); }
                return `${base}\nAuto resets unlocked through Strangeness will skip related levels and reduce cost by skipped levels.\n(Unlocked and skipped auto resets: ${unlocks.length === 0 ? 'none' : unlocks.join(', ')})`;
            }
        ],
        costRange: [
            [1e13, 2e34, 1e30],
            [136000, 272000],
            [1200, 1800, 2400, 3000, 3600]
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
            if (stageIndex === 3) {
                if (index === 2) {
                    unlocked = player.progress.main >= 11 || player.upgrades[3][2] === 1 || player.buildings[3][2].trueTotal.moreThan(0);
                } else if (index === 3) {
                    unlocked = player.progress.main >= 11 || player.upgrades[3][4] === 1 || player.buildings[3][3].trueTotal.moreThan(0);
                } else if (index === 5) {
                    unlocked = player.progress.main >= 16 || player.upgrades[3][11] === 1 || player.buildings[3][5].trueTotal.moreThan(0);
                }
            } else if (stageIndex === 4) {
                if (index === 5) {
                    unlocked = player.progress.main >= 16;
                }
            } else if (stageIndex === 5) {
                if (index === 1) {
                    unlocked = player.progress.main >= 15 || player.milestones[2][0] >= 7;
                } else if (index === 2) {
                    unlocked = player.progress.main >= 15 || player.milestones[3][0] >= 7;
                } else if (index === 3) {
                    unlocked = player.progress.main >= 15 || player.milestones[4][1] >= 8;
                }
            } else if (stageIndex === 6) {
                if (index === 1) {
                    unlocked = player.progress.main >= 23 || player.upgrades[6][0] === 1 || player.researches[6][0] >= 6;
                }
            }
            const names = global.buildingsInfo.name[stageIndex];
            let unlocks = '';
            for (let i = 1; i < player.ASR[stageIndex] + 1; i++) {
                if (i !== 1) { unlocks += ', '; }
                unlocks += names[i];
                if (
                    (stageIndex === 1 && (player.tree[1][8] >= 1 || (i === 1 && player.inflation.vacuum && player.strangeness[1][8] >= 1 && (player.challenges.supervoid[3] >= 5 || player.researchesExtra[1][2] >= 1)))) ||
                    (stageIndex === 2 && player.tree[1][8] >= 2) ||
                    (stageIndex === 3 && player.tree[1][8] >= 3) ||
                    (stageIndex === 4 && player.tree[1][8] >= 4) ||
                    (stageIndex === 5 && (player.tree[1][8] >= 4 || i === 3))
                ) { unlocks += '!'; }
            }
            return `Automatically make ${unlocked ? names[index] : '(Unknown)'} (counts as self-made) if cost is ${format(player.toggles.shop.wait[stageIndex])} times of the available resources.\n(Unlocked auto Structures: ${unlocks !== '' ? `${unlocks}${unlocks.includes('!') ? ". '!' means that it ignores wait value" : ''}` : 'none'})`;
        },
        costRange: [
            [],
            [2000, 8000, 16000, 32000, 56000],
            [1e10, 1e14, 1e18, 1e23, 1e28, 1e30],
            [1e-7, 1e10, 5e29, 2.45576045e31, 2e36],
            [1e6, 1e17, 1e28, 1e39, 1e52],
            [1e56, 1e60, 1e100],
            [8e12]
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
            () => {
                const random = Math.random();
                const base = `Element with no ${global.upgradesInfo[1].name[3]}, true head of this table.\n`;
                if (!global.april.active) { return `${base}This one is ${random < 0.01 ? 'an illusive Tetraneutron, or maybe even Pentaneutron. Wait where did it go? Was it even there?' : random < 0.1 ? 'a rare Dineutron and its already gone...' : 'just a simple Mononeutron, but it will stay with you for as long as it can.'}`; }
                const array = ['Ultravoid calls your name', "'Shift' is how you access it", "don't forget it", "it wasn't a dream", 'its truly gone', 'will you realize', 'there are others', 'Wormholes connect them', 'they will consume', "you can't stop it", 'it could all be inside', 'just one', 'Gravastars are bigger', 'Quantum Universes are real', 'if you wait long enough within', 'there is more to it', 'you have done it before', 'Antimatter always prevails', 'you have seen it', 'it has always been this way', 'it wont last long', 'it will be all undone', 'Light grows', 'it escaped', 'it should had stayed in the Dark', 'which one will prevail', 'there is only one way to stop it', 'toggle it', 'its just the beginning', 'there are Layers above', 'you only need six of them', 'create more of them', "don't stop yet", 'bring them closer', 'just for how much longer', "don't share it", 'look closer', 'proof is all you need', 'it hides in plain sight', "don't overthink it", 'how was your day'];
                return `${base}It has a message just for you: "${array[Math.ceil(random * array.length) - 1]}".`;
            },
            () => `The most basic Element, increases Brown dwarfs${player.inflation.vacuum ? ' and Puddles' : ''} production by 2.`,
            () => `Fusion reaction byproduct, makes Interstellar Stars cost scale -${format(0.1)} less.`,
            () => `First metal, base for Solar mass gain${player.inflation.vacuum ? ' and delay to the Cosmic dust hardcap' : ''} from Brown dwarfs will be lightly increased.\n(Additive, boost is equal to ${format(1.5)}x when nothing else boosting it)`,
            () => `Brittle earth metal and so is the brittle increase to the production.\n(${format(1.4)}x boost to Interstellar Stars${player.inflation.vacuum ? ' and Cosmic dust' : ''})`,
            () => `A new color and a new additive boost to the base of Solar mass gain base ${player.inflation.vacuum ? ' (and delay to the Cosmic dust hardcap)' : ''} that is based on self-made Brown dwarfs.`,
            () => `Base for organics, it will increase the boost from Red giants by ^${format(calculateEffects.element6())}.`,
            () => "The most abundant Element in the atmosphere of some Planets, it allows for 2 more levels of 'Star system'.",
            () => `An oxidizing agent that will make Interstellar Stars cost scale even slower. (-${format(0.05)} less)`,
            () => "Highly toxic and reactive, +12 to max level of 'Planetary system'.",
            () => `A noble 2x boost to the Solar mass gain${player.inflation.vacuum ? ' and delay to the Preons hardcap' : ''}.`,
            () => "Through leaching will increase max level of 'Protoplanetary disk' by +1.",
            () => `Stars are inside you, as well ${global.april.active ? 'Antineutron' : 'Neutron'} stars will improve themselves by log4 of their own amount.`,
            () => `Has a great affinity towards ${global.april.active ? 'Antioxygen' : 'Oxygen'} and to decrease cost of Interstellar Stars by 100.`,
            () => `Just another tetravalent metalloid, and so is another ${format(1.4)}x boost to Interstellar Stars${player.inflation.vacuum ? ' and Cosmic dust' : ''}.`,
            () => `One of the fundamentals for Life and to make all self-made Stars to boost Solar mass gain${player.inflation.vacuum ? ' and delay Cosmic dust hardcap' : ''}.`,
            () => "A burning rock that will increase max level of 'Star system' by 1.",
            () => "Extremely reactive to extend max level of 'Planetary system' by another 24 levels.",
            () => 'Less noble, but Black holes effect will be a little stronger.',
            () => "Don't forget about it and it will increase effective level of 'Planetary system' by +1.",
            () => "Get stronger by increasing max level of 'Star system' by +1.",
            () => `A new color and a rare bonus of ^${format(1.1)} to the Solar mass effect.`,
            () => `Part of a new alloy that will allow for Red giants to be added into an effective amount of ${global.april.active ? 'Antineutron' : 'Neutron'} stars.`,
            () => `Catalyst for production of Stardust. 'Gamma-ray burst' effect will be increased by Solar mass ^${format(0.1)}.\n(Effect increase: ${format(player.collapse.mass ** 0.1, { padding: true })})`,
            () => `No corrosion, only boost to Interstellar Stars that is based on unspent Stardust ^${format(calculateEffects.element24_power())}.\n(Boost to Stars: ${format(calculateEffects.element24(), { padding: true })})`,
            () => "Brittle Element, but not the bonus ‒ 1 more level in 'Star system'.",
            () => `Any further fusion will be an endothermic process, but will still ${player.inflation.vacuum ? `unlock a new Star type${player.strangeness[5][3] >= 1 ? ' and Intergalactic Stage' : ''}` : 'allow to enter Intergalactic space'}.\n${player.progress.main >= 11 ? `Current base increase for Stage reset reward is +${format(effectsCache.element26, { padding: true })}, which is equal to ${player.elements[29] >= 1 ? "'X + Step * (X^2 - X) / 2', X is " : ''}log10(Stardust produced this Stage) - 48.` : '(Can change active Stage from footer, new effect will be added after another Stage reset)'}`,
            () => `Combined and ready to make Red giants effect improve Brown dwarfs.\nAlso improves '${global.elementsInfo.name[24]}' Element by +^${format(0.01)}.`,
            () => `Slow to react, but it will increase effective amount of Red giants ${format(1.5)}.\nOh, and it also will increase max level of 'Star system' by +1.`,
            () => `Does not need to be prepared to increase Stage reset reward base by Arithmetic progression with Step of ${format(0.01)}.`,
            () => `First of new Elements to come, increases max allowed Merge resets by +1 for every new Element past '${global.elementsInfo.name[29]}'.\n(Currently highest created Element in the current Stage reset is '${global.elementsInfo.name[player.collapse.highest]}', equals to +${Math.max(player.collapse.highest - 29, 0)} allowed Merges)`,
            () => "Will melt in the palm of your hand to increase max level of 'Star system' by +1.",
            () => `Too late to appear, but it will make Galaxies scale in cost slower by ${format(-0.01)} anyway.`,
            () => 'Toxic enough to make Red giants effect improve Red supergiants.',
            () => "Capable of sensing an +1 increase to the max level of 'Star system'.",
            () => "The only liquid nonmetal to increase the max level of 'Inner Black hole' by +1.",
            () => `Nothing special, just an ${format(1.21)}x decrease to Galaxies cost.`
        ],
        cost: [ //New Element cost must be higher than previous one
            0, 1000, 4000, 2e4, 1e5, 1e8, 1e10, 4e11, 8e12, 6e13,
            1e15, 1e20, 1e22, 1e24, 1.4e26, 1e28, 1e30, 1e32, 2e36, 1e38,
            1e39, 1e41, 2e42, 3e43, 4e44, 5e45, 1e48, 1e54, 1e58, 1e140,
            1e220, 1e240, 1e260, '1e330', '1e450', '1e9000', '1e9000'
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
                () => `Boost Microworld Structures by ${format(player.inflation.vacuum ? 2 : 1.8)}.`,
                () => `Base for '${global.researchesInfo[1].name[2]}' Research will be bigger by +${format(player.inflation.vacuum ? (player.tree[1][5] >= 3 ? 2 : 1.5) : 1)}.\n(Boost from it at current Research level is ${format((calculateEffects.S1Research2(player.strangeness[1][1] + 1) / calculateEffects.S1Research2()) ** player.researches[1][2], { padding: true })})`,
                () => `Discharge goals requirement will scale slower. (-${format(0.5)})\n(Creating this Strangeness will make the next Discharge goal to be ${format(calculateEffects.dischargeCost(calculateEffects.dischargeScaling(undefined, player.strangeness[1][2] + 1)))} Energy)`,
                () => `Obtain +${format(0.5)} bonus Discharge goals.`,
                () => `Automatically Discharge upon reaching next Goal or spending Energy. (Needs to be enabled in Settings)${global.strangenessInfo[1].max[4] > 1 ? '\nSecond level will make Discharge goals to be based on true Energy and without needing to reset.' : ''}`,
                () => 'Make auto for all Microworld Structures permanent.',
                () => `${player.verses[0].current >= 13 ? 'Total' : 'Unspent'} Strange quarks will boost Microworld by improving its Structures${global.strangenessInfo[1].max[6] > 1 ? ` at level 1 and by improving ${global.upgradesInfo[1].name[8]}, reducing Discharge goals requirement at level 2` : ''}.\n(Formula: Strange quarks ^${format(player.inflation.vacuum ? 0.26 : 0.22)} | Effect: ${format(global.strangeInfo.stageBoost[1], { padding: true })})`,
                () => 'Increase Energy gain from creating Preons by +2.',
                () => { //[8]
                    const improved = player.challenges.supervoid[3] >= 5;
                    return `No Mass will be lost when creating Preons${improved ? '' : ', only works when Accretion Stage is unlocked'}.\nSecond level will disable auto Accretion Structures while Cosmic dust is hardcapped and don't have enough Mass for the highest Solar mass conversion${improved ? " or to increase current Rank, but only if Rank is below 'Protostar' and 'Automatic Rank' level is below 2" : ', only works if Interstellar Stage is unlocked'}.`;
                },
                () => `No Energy will be lost when creating Upgrades or Researches${player.challenges.supervoid[3] < 5 ? ', only works when Interstellar Stage is unlocked' : ''}.`
            ],
            cost: [],
            firstCost: [1, 1, 1, 2, 12, 2, 24, 2, 12, 15600],
            scaling: [2.46, 2, 6, 4, 400, 1, 2.5e13, 6, 10, 1e308],
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
                () => `Drops will ${player.inflation.vacuum ? `improve ${global.upgradesInfo[1].name[8]}` : 'produce'} ${format(player.inflation.vacuum && player.tree[1][5] >= 3 ? 2.2 : 2)} times more${player.inflation.vacuum ? '' : ' Moles'}.`,
                () => `Puddles will produce ${format(player.inflation.vacuum ? (player.tree[1][5] >= 3 ? 2 : 1.8) : 1.6)} times more Drops.`,
                () => `Increase max level for 'More streams' Stage Research by +1 at first level and 'Distributary channel' Stage Research by +1 at second level.\nFinal level will instead unlock a new Upgrade ‒ '${player.strangeness[2][2] >= 3 || player.progress.main >= 15 ? 'Tsunami' : '(Unknown)'}' that costs ${format(1e28)} Drops.`,
                () => `Decrease amount of Drops required to get a Cloud by ${format(player.inflation.vacuum ? 2.5 : 2)}.`,
                () => `Automatically Vaporize when reached enough boost from new Clouds. (Needs to be enabled in Settings)${global.strangenessInfo[2].max[4] > 1 ? `\nSecond level will unlock ${format(2.5)}% passive gain of Clouds per second${player.tree[1][5] >= 2 ? ' or will instead increase passive gain by 10 if its already unlocked' : ''}.${player.progress.main >= 19 ? ' (Not affected by global speed)' : ''}` : ''}`,
                () => 'Make auto for all Submerged Structures permanent.',
                () => `${player.verses[0].current >= 13 ? 'Total' : 'Unspent'} Strange quarks will boost Submerged by improving Puddles${global.strangenessInfo[2].max[6] > 1 ? ' at level 1 and by reducing Drops requirement for Clouds at level 2' : ''}.\n(Formula: Strange quarks ^${format(player.inflation.vacuum ? 0.22 : 0.18)} | Effect: ${format(global.strangeInfo.stageBoost[2], { padding: true })})`,
                () => `Submerged Structures that improve other Submerged Structures will do it ${format(player.tree[1][5] >= 3 ? 1.28 : 1.24)} times stronger.\n(Affected Structures are Ponds, Lakes, Seas and Oceans)`,
                () => `Increase max level for 'Stronger surface tension' Stage Research by +3 at first level and 'Stronger surface stress' Stage Research by +1 at second level.\nFinal level will instead unlock an even better new Upgrade ‒ '${player.strangeness[2][8] >= 3 || player.progress.main >= 19 ? 'Tide' : '(Unknown)'}' that costs ${format(2e48)} Drops.`,
                () => { //[9]
                    const improved = player.tree[1][5] >= 1;
                    return `Increase Stage reset reward based on current Cloud amount.\n(${improved ? 'Improves current formula' : 'Formula'}: log10(Clouds) / 80 + 1${improved ? ` > Clouds ^${format(0.01)}` : ''} | Effect: ${format(calculateEffects.S2Strange9(false), { padding: true })}${improved ? ` > ${format(calculateEffects.S2Strange9(true), { padding: true })}` : ''})`;
                }
            ],
            cost: [],
            firstCost: [1, 1, 2, 2, 12, 4, 24, 16, 800, 9600],
            scaling: [2.46, 2, 3, 4, 800, 1, 2.5e13, 3.4, 3, 1],
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
                () => `Increase max level for 'Rank boost' Rank Research by +6 at first level and 'Efficient growth' Rank Research by +2 at second level.\nFinal level will instead unlock a new Upgrade ‒ '${player.strangeness[3][2] >= 3 || player.progress.main >= 15 ? 'Hydrostatic equilibrium' : '(Unknown)'}' that costs ${format(1e22)} Mass.`,
                () => { //[3]
                    if (!global.stageInfo.activeAll.includes(3)) { assignBuildingsProduction.stage3Cache(); }
                    return `Satellites will be able to improve remaining ${player.inflation.vacuum ? 'Accretion ' : ''} Structures, but at reduced strength (^${format(player.inflation.vacuum ? 0.1 : 0.2)}).\n(Affected Structures are Cosmic dust and Planetesimals, boost is equal to ${format(effectsCache.S3Strange3, { padding: true })})`;
                },
                () => `Automatically increase Rank when possible. (Needs to be enabled in Settings)${global.strangenessInfo[3].max[4] > 1 ? `\nSecond level will make ${player.challenges.supervoid[3] >= 2 ? 'Ranks to be based on Mass produced this reset and without needing to reset' : 'Rank increase use Mass produced this reset instead of current'}.` : ''}`,
                () => 'Make auto for all Accretion Structures permanent.',
                () => { //[6]
                    let unlocked = 'none';
                    if (player.strangeness[3][6] >= 1) { unlocked = 'auto Upgrades'; }
                    if (player.strangeness[3][6] >= 2) { unlocked += `, Stage${player.strangeness[3][6] >= 3 ? ' and Special' : ''} Researches`; }
                    return `Always automatically create all ${['Upgrades', 'Stage Researches', 'Special Researches'][Math.min(player.strangeness[3][6], 2)]} from any Stage${!player.inflation.vacuum && player.strangeness[5][3] < 1 && player.verses[0].current < 3 ? ' before Intergalactic' : ''}.\n(Needs to be enabled in Settings, unlocked automatization: ${unlocked})`;
                },
                () => `${player.verses[0].current >= 13 ? 'Total' : 'Unspent'} Strange quarks will boost Accretion by reducing cost of its Structures${global.strangenessInfo[3].max[7] > 1 ? " at level 1 and by reducing Rank requirements above 'Protogalaxy', improving Satellites at level 2" : ''}.\n(Formula: Strange quarks ^${format(player.inflation.vacuum ? 0.68 : 0.76)} | Effect: ${format(global.strangeInfo.stageBoost[3], { padding: true })})`,
                () => `Delay Cosmic dust hardcap by ${format(1.4)} per level.`,
                () => `Unlock a new Accretion Rank to achieve.${global.strangenessInfo[3].max[9] > 1 ? '\nSecond level will allow Ranks to go above the max, but they will not unlock anything new.' : ''}`
            ],
            cost: [],
            firstCost: [1, 2, 2, 24, 12, 4, 4, 24, 18000, 2.16e6],
            scaling: [2, 3.4, 3, 1, 100, 1, 1.74, 2.5e13, 2.46, 1e7],
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
                () => `Interstellar Stars will produce ${format(1.6)} times more Stardust.`,
                () => 'Interstellar Stars will be 2 times cheaper.',
                () => `Unlock a new Upgrade, its pretty good:\n${format(1e11)} Stardust Stage Research ‒ '${player.strangeness[4][2] >= 1 || player.progress.main >= 15 ? 'Planetary nebula' : '(Unknown)'}', ${format(1e50)} Stardust Collapse Research ‒ '${player.strangeness[4][2] >= 2 || player.progress.main >= 15 ? 'White dwarfs' : '(Unknown)'}', ~${format(player.inflation.vacuum ? 1e54 : 1e52)} Stardust Upgrade ‒ '${player.strangeness[4][2] >= 3 || player.progress.main >= 15 ? global.upgradesInfo[4].name[3] : '(Unknown)'}'.`,
                () => '10% of Brown dwarfs per level will be able to turn into Red giants after Collapse.',
                () => `Automatically Collapse once reached enough boost or Solar mass. (Needs to be enabled in Settings)${global.strangenessInfo[4].max[4] > 1 ? `\nSecond level will auto claim Star remnants without needing to reset ${global.strangenessInfo[4].max[4] > 2 ? ', includes Solar mass at third level' : ''}.` : ''}`,
                () => 'Make auto for all Interstellar Structures permanent.',
                () => `Elements will no longer require Collapse for activation${player.inflation.vacuum ? ' and related automatization Research will cost as if its level is -1' : ''}.\nSecond level will unlock auto creation of Elements. (${global.strangenessInfo[4].max[6] > 1 ? 'Needs to be enabled in settings' : 'Not yet unlocked for Interstellar space'})`,
                () => `${player.verses[0].current >= 13 ? 'Total' : 'Unspent'} Strange quarks will boost Interstellar by improving its Structures${global.strangenessInfo[4].max[7] > 1 ? ' at level 1 and by reducing cost of Brown dwarfs at level 2' : ''}.\n(Formula: Strange quarks ^${format(player.elements[26] >= 1 ? 0.32 : 0.16)}, exponent is 2 times bigger with '${global.elementsInfo.name[26]}' | Effect: ${format(global.strangeInfo.stageBoost[4], { padding: true })})`,
                () => `Increase effective amount of ${global.april.active ? 'Antineutron' : 'Neutron'} stars (doesn't include ones from '${global.elementsInfo.name[22]}') by 1 + level and improve ${global.april.active ? 'Antineutron' : 'Neutron'} stars strength by +^${format(0.125)}.`,
                () => `Unlock yet another an even better new Upgrade: (all of them cost around ${format(1e140)} Stardust)\nUpgrade ‒ '${player.strangeness[4][9] >= 1 || player.progress.main >= 18 ? 'Nucleosynthesis' : '(Unknown)'}', Collapse Research ‒ '${player.strangeness[4][9] >= 2 || player.progress.main >= 18 ? 'Quark-nova' : '(Unknown)'}', Stage Research ‒ '${player.strangeness[4][9] >= 3 || player.progress.main >= 18 ? 'Inner Black hole' : '(Unknown)'}'.`
            ],
            cost: [],
            firstCost: [1, 2, 4, 2, 12, 6, 6, 24, 12000, 2.4e5],
            scaling: [2, 3.4, 3, 4, 1900, 1, 1.74, 2.5e13, 2, 3],
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
                () => `With higher density, first two Intergalactic Upgrades will be even stronger. Effects will be increased by ${format(player.inflation.vacuum ? 1.6 : 1.8)}.`,
                () => `Gain ${format(1.4)} times more Strange quarks from any Stage reset.`,
                () => player.inflation.vacuum ? 'Unlock Intergalactic Stage and increase Strange quarks from Stage resets by +1.' : `Make Intergalactic Stage immune to Collapse reset${player.verses[0].current < 3 ? " and allow 'Upgrade automatization' to work within the Intergalactic Stage" : ''}.`,
                () => 'Automatically Collapse if able to afford a new Galaxy and auto Galaxy is enabled.\n(Also unlocks permanent auto Galaxies and removes Solar mass limit for auto Collapse points)',
                () => `Make auto for ${player.strangeness[5][4] >= 1 ? 'all' : 'the first two'} Intergalactic Structures permanent${player.strangeness[5][4] < 1 ? ' and prevent higher levels from resetting' : ''}.`,
                () => `Automatically trigger Stage reset${player.inflation.vacuum ? ' and automatically exit Challenges if out of time' : ", doesn't work for the Interstellar Stage until second level"}. (Needs to be enabled in Settings)`,
                () => `${player.verses[0].current >= 13 ? 'Total' : 'Unspent'} Strange quarks will boost Intergalactic by increasing Solar mass gain${global.strangenessInfo[5].max[7] > 1 ? ' at level 1 and by improving first two Structures at level 2' : ''}.\n(Formula: Strange quarks ^${format(0.06)} | Effect: ${format(global.strangeInfo.stageBoost[5], { padding: true })})`,
                () => 'Unlock another Strange Structure.\n(Click on that Structure to see its effects)',
                () => `Automatically Merge Galaxies if can't get any more of them quickly. (Needs to be enabled in Settings)${global.strangenessInfo[5].max[9] > 1 ? '\nSecond level will auto claim Merge results without needing to reset.' : ''}`,
                () => { //[10]
                    let passive = 'none';
                    let upgrades = 'none';
                    if (player.strangeness[5][10] >= 1) {
                        passive = `increasing Energy gain from Galaxies by 5, decreasing Goals requirement by ${format(global.mergeInfo.galaxies ** 2 + 1, { padding: 'exponent' })}`;
                        upgrades = "'Nuclear fission' (Microworld Upgrade), 'Radioactive decay' (Energy Research)";
                    }
                    if (player.strangeness[5][10] >= 2) {
                        passive += `, boosting Puddles ${player.strangeness[5][10] >= 3 ? 'and Cosmic dust strength ' : ''}by ${format(global.mergeInfo.galaxies + 1, { padding: 'exponent' })}`;
                        upgrades += `${player.tree[1][5] >= 3 ? ", 'Megatsunami' (Submerged Research)" : ''}, 'Jeans Mass' (Clouds Research)`;
                    }
                    if (player.strangeness[5][10] >= 3) {
                        passive += `, delaying Cosmic dust hardcap by ${format(global.mergeInfo.galaxies / 100 + 1, { padding: true })}`;
                        upgrades += ", 'Self-gravity' (Accretion Upgrade), 'Ablative armor' (Rank Research)";
                    }
                    if (player.strangeness[5][10] >= 4) {
                        if (player.tree[1][7] >= 3) { passive += `, boosting Solar mass gain by ${format(global.mergeInfo.galaxies / 1000 + 1, { padding: true })}`; }
                        upgrades += `, '${global.upgradesInfo[4].name[5]}' (Interstellar Upgrade), 'White holes' (Collapse Research)`;
                    }
                    return `Boost lower Stages based on current Galaxies and unlock new Upgrades for them.\n(Passive effects: ${passive})\n(New Upgrades: ${upgrades})`;
                }
            ],
            cost: [],
            firstCost: [24, 36, 4, 24, 15600, 24, 480, 120, 6000, 6e6, 2e7],
            scaling: [2, 2, 4, 1, 1e308, 1, 1, 5e12, 1e308, 1e308, 3],
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
                () => "Increase max levels for a lot of Strangeness by +1, these include:\n'Fundamental boost', 'Bigger Puddles', 'Faster Accretion', 'Hotter Stars' and 'Bigger Structures'",
                () => `Unlock a new mini Stage '${global.challengesInfo[2].name}', activated in the 'Advanced' subtab.\n(This Strangeness persists through Vacuum resets)`
            ],
            cost: [],
            firstCost: [2e15, 4e15, 6e15, 4e14],
            scaling: [4, 4, 4, 1],
            max: [9, 9, 6, 1],
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
            'Stability',
            'Improved Offline'
        ],
        effectText: [
            () => `Boost global speed by 2, but reduce time limit for ${player.challenges.stability >= 1 ? 'Challenges' : 'on everything that has it'} by 4, if level is below 2.\nIf ${player.challenges.stability >= 1 ? 'not inside any Challenge' : 'there is no time limit'}, then 2nd level will instead boost global speed by ${player.challenges.stability >= 1 ? 2 : `${format(calculateEffects.T0Inflation0(), { padding: true })} (strength depletes over 1 hour of the Stage time)`}.`,
            () => { //[1]
                const effect = calculateEffects.T0Inflation1();
                return `Boost global speed by unspent ${global.buildingsInfo.name[6][0]} ^${format((effect > 1 ? logAny(effect, player.buildings[6][0].current.toNumber() + 1) : 0.04) * player.tree[0][1], { padding: true })}.\n(Boost per level: ${format(effect, { padding: true })}, softcaps after ${format(calculateEffects.TOInflation1_softcap())} ${global.buildingsInfo.name[6][0]}. Global speed doesn't speed up game ticks)`;
            },
            () => `Gain ${format(1.4)} times more Strange quarks from any Stage reset per level.${player.challenges.stability >= 1 ? `\nFirst ${player.challenges.stability} levels (1 per Vacuum stability completion) will also boost global speed by ${format(1.1)}, but only while inside any Challenge.` : ''}`,
            () => `Boost global speed and Stage reset reward by ${format(calculateEffects.T0Inflation3())}, strength is based on Supervoid progress${player.challenges.stability < 2 ? ' in the current End reset' : ''}.`,
            () => `For false Vacuum it will remove time limit from Milestones${player.tree[0][5] >= 1 ? ` and allow for ${global.challengesInfo[2].name} to be reset for Strangelets, ${global.challengesInfo[2].name} won't reset with other Stages` : ''}.\nFor true Vacuum it will unlock false Vacuum Milestones for Void. Their effects are active anywhere, but only if this Inflation is active.`,
            () => "Allow to go above max allowed Merges up to the current relevant self-made Universes without making next Universe requiring less.\nAlso stabilize false Vacuum, allow creation of false Universes and add new effect for false Vacuum 'Void Milestones'. Or make Strangelets produce themselves, if in true Vacuum.",
            () => { //[6]
                const level = player.tree[0][6];
                return `Unlock 1 minute Warps for the price of ${Math.min(7 - level, 6)}${level < 4 ? ` ⟶ ${6 - level}` : ''} minutes of stored Offline time.\nIncrease Export storage by +${(2 + 2 * level) * level}%${level < 4 ? ` ⟶ ${(4 + 2 * level) * (level + 1)}%` : ''} of the Stage reset value after any Stage reset.\nIf inside any Challenge, then it will boost global speed by ${format(5 / (5 - level))}${level < 4 ? ` ⟶ ${format(5 / (4 - level))}` : ''}, but decrease time limit by ${format(6 / (6 - level))}${level < 4 ? ` ⟶ ${format(6 / (5 - level))}` : ''}.\n(Offline time can be stored by rejecting it, max storage is 12 hours)`;
            }
        ],
        cost: [],
        firstCost: [0, 1, 1, 2, 4, 16, 1],
        scaling: [2, 0.75, 0.5, 2, 0, 0, 1],
        max: [2, 6, 8, 4, 1, 1, 4]
    }, { //Cosmon
        name: [
            'More global speed',
            'More Strange quarks',
            'More Cosmons',
            'Stranger gain',
            'Discharge improvement',
            'Vaporization improvement',
            'Rank improvement',
            'Collapse improvement',
            'Conservation of resources'
        ],
        effectText: [
            () => `Boost global speed again by ${format(1.4)}.`,
            () => `Boost Strange quarks gain from the Stage resets again by ${format(1.2)}.`,
            () => `Gain ${format(1.4)} times more Cosmons from End resets.\n(Max level will be increased after spending ${format((4 ** (global.treeInfo[1].max[2] + 2) - 4) / 3 - player.cosmon[1].total + player.cosmon[1].current, { padding: true })} more Cosmons)`,
            () => `Boost Strangelets gain from the Stage resets by ${format(1.4)} and increase max level of 'Strange gain' Inflation by +1.`,
            () => `True Vacuum only, gain +1 free Goal, improve Discharge base by +${format(0.1)} (immune to the softcap) and decrease requirement scaling by -${format(0.5)} with every level.`,
            () => `True Vacuum only, make 'Ocean world' Strangeness old effect always active and add new effect to improve related formula.\nSecond level will make 'Natural Vaporization' Cloud Research old effect of 'Clouds use total Drops this reset' always active and add new effect to unlock 1% > 10% passive Clouds gain over 5 levels, 10 times stronger with 'Automatic Vaporization' Strangeness level 2.\nThird level will improve a lot of Strangeness, also max level will be affected by Void for the first two in the list: +${format(0.5)} to 'Better improvement', +${format(0.2)} to 'More Moles' and 'Bigger Puddles', +${format(0.04)} to 'Improved flow' and finally new Upgrade from 'Galactic tide' level 2.\nFinal level will make most of Submerged immune to pre-Merge resets, Vaporization will still reset Submerged, but never higher Stages.`,
            () => `True Vacuum only, make effective Rank boost even more: (all effects are per Rank)\n+${format(0.5)} Discharge goals at level 1, +1 to max level of 'Planetary system' Interstellar Research at level 2, ${format(1.01)}x to the Solar mass gain at level 3 and finally ${format(1.02)}x to Stage reset reward at level 4.`,
            () => "True Vacuum only, reclaim up to 25% of Remnants once (doesn't affect Milestones).\nSecond level will increase max level of 'Galactic tide' Strangeness, but without passive effects until level 3.\nFinal level will increase max level of 'Automatic Collapse' Strangeness.",
            () => { //[8]
                let unlocks = 'none';
                if (player.tree[1][8] >= 1) { unlocks = 'Microworld'; }
                if (player.tree[1][8] >= 2) { unlocks += ', Submerged'; }
                if (player.tree[1][8] >= 3) { unlocks += ', Accretion'; }
                if (player.tree[1][8] >= 4) { unlocks += ', Interstellar, Intergalactic'; }
                const index = Math.min(player.tree[1][8] + 1, 4);
                return `Keep more of ${global.stageInfo.word[index]}${index === 4 ? ' and Intergalactic' : ''} Resources by making related Structures${index >= 4 ? " (doesn't include Galaxies)" : ''} not spend them on creation.\n(Affected Stages: ${unlocks})`;
            }
        ],
        cost: [],
        firstCost: [1, 1, 4, 400, 1.2, 1e100, 1, 600, 6],
        scaling: [0.5, 0.5, 4, 2, 0.8, 4.4, 2.8, 3.4, 3.4],
        max: [1e6, 1e6, 1, 8, 4, 4, 4, 4, 4]
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
                () => player.inflation.vacuum ? `Microworld Structures strength increased by ${format(global.milestonesInfo[1].reward[0], { padding: true })}.` : 'Increase base for the Stage reset reward by +1.',
                () => player.inflation.vacuum ? `Effective Energy increased by ${format(global.milestonesInfo[1].reward[1], { padding: true })}.` : 'Permanent Microworld Stage.'
            ],
            need: [],
            reward: [0, 0],
            scaling: [
                [1e152, 1e158, 1e164, 1e170, 1e178, 1e190],
                [23800, 24600, 25800, 27000, 28200, 29600]
            ],
            recent: [0, 0]
        }, { //Stage 2
            name: [
                'A Nebula of Drops',
                'Just a bigger Puddle'
            ],
            needText: [
                () => `Produce at least ${format(global.milestonesInfo[2].need[0])} Drops this reset.`,
                () => `${player.inflation.vacuum ? 'Vaporize to' : 'Have'} at least ${format(global.milestonesInfo[2].need[1])} ${player.inflation.vacuum ? 'Clouds' : 'Puddles at the same time'}.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `Puddles strength increased by ${format(global.milestonesInfo[2].reward[0], { padding: true })}.` : 'First Intergalactic Structure. (Nebula)',
                () => player.inflation.vacuum ? `Decrease Drops requirement to get a Cloud by ${format(global.milestonesInfo[2].reward[1], { padding: true })}.` : 'Permanent Submerged Stage.'
            ],
            need: [],
            reward: [0, 0],
            scaling: [
                [1e30, 1e32, 1e34, 1e36, 1e38, 1e40, 1e44],
                [1500, 2300, 3100, 3900, 4700, 5500, 6400]
            ],
            recent: [0, 0]
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
            ],
            recent: [0, 0]
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
                () => player.inflation.vacuum ? `Interstellar Stars strength increased by ${format(global.milestonesInfo[4].reward[0], { padding: true })}.` : `New Intergalactic themed Strangeness${player.verses[0].current >= 3 ? ' and a new Milestone' : ", Milestone and second level of 'Element automatization'"}.`,
                () => player.inflation.vacuum ? `Black holes effect increased by ${format(global.milestonesInfo[4].reward[1], { padding: true })}.` : `Unlocked Galaxy Researches and a new Milestone.${player.progress.main < 15 ? '\n(Also unlocked new toggle to automatically change active Stage to Intergalactic)' : ''}`
            ],
            need: [],
            reward: [0, 0],
            scaling: [
                [1e48, 1e49, 1e50, 1e52, 1e54, 1e56, 1e58, 1e60],
                [9000, 12000, 16000, 22000, 30000, 42000, 60000, 84000]
            ],
            recent: [0, 0]
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
            ],
            recent: [0, 0]
        }
    ],
    challengesInfo: [{ //Challenge [0]
        name: 'Void',
        description: () => `Result of Vacuum Instability, investigate at your own will\n(${global.april.ultravoid === false ? "Entering forces Hardreset, can't be reverted" : `${player.inflation.vacuum || player.toggles.supervoid ? `Entering will force a ${player.toggles.supervoid ? 'Vacuum' : 'Stage'} reset, will be reverted after exiting` : 'No reason to enter from false Vacuum, since all rewards are disabled'}`})`,
        effectText: () => {
            if (global.april.ultravoid === false) { return '<p class="darkorchidText">‒ More nerfs will be shown with more rewards</p>'; }
            const progress = player.challenges.voidCheck;
            const progress2 = player.challenges.supervoid;
            const supervoid = player.toggles.supervoid;
            let text = `<p class="cyanText">‒ Microworld Structures are 4 times weaker${progress[1] >= 1 ? `\n‒ Discharge base is raised to the root of 2 (^${format(0.5)})` : ''}${progress[1] >= 2 ? '\n‒ Energy gain from Submerged and Accretion Stages is divided by 2' : ''}\n${progress[3] >= 5 ? '‒ Energy gain from Interstellar and Intergalactic Stages is divided by 4' : 'More nerfs will be shown with more rewards'}</p>`;
            if (progress[1] >= 3) { text += `<p class="blueText">‒ Drops above 1 do not increase their own strength\n‒ Puddles are ${format(8e3)} times weaker\n${progress[2] >= 1 ? `‒ Clouds gain is decreased by ^${format(0.8)}` : 'More nerfs will be shown with more rewards'}${supervoid ? (progress2[1] >= 3 ? "\n‒ 'Water spread' and the first two Researches are weaker\n‒ Ponds, Lakes and Seas are 2 times weaker" : '\nMore nerfs will be shown with more rewards') : ''}</p>`; }
            if (progress[1] >= 2) { text += `<p class="grayText">‒ Cosmic dust is softcapped (^${format(0.9)})\n${progress[3] >= 4 ? `‒ Softcap is stronger after reaching 'Jovian planet' Rank (^${format(0.8)})` : 'More nerfs will be shown with more rewards'}${supervoid ? `${progress2[3] >= 1 ? "\n‒ Increasing Rank doesn't increase effective Rank" : ''}\n${progress2[3] >= 4 ? "‒ Effective Rank is reduced by -1 after reaching 'Jovian planet' Rank" : 'More nerfs will be shown with more rewards'}` : ''}</p>`; }
            if (progress[3] >= 5) { text += `<p class="orangeText">‒ Interstellar Stars are ${format(8e3)} times weaker${progress[4] >= 1 ? '\n‒ Solar mass gain is 2 times smaller' : ''}${progress[4] >= 2 ? `\n‒ Solar mass effect is softcapped ^${format(0.2)} after 1` : ''}\n${progress[4] >= 5 ? "‒ Can't create or gain Quasi-stars" : 'More nerfs will be shown with more rewards'}${supervoid ? (progress2[3] >= 5 ? '\n‒ Everything cost 100 times more Stardust, excludes Brown dwarfs' : '\nMore nerfs will be shown with more rewards') : ''}</p>`; }
            if (progress[3] >= 1) { text += `<p class="darkorchidText">‒ All resets affect all ${player.progress.main >= 18 ? 'pre-Abyss ' : ''}Stages\n${progress[5] >= 1 ? `‒ Galaxies cost scaling increased by +${format(0.05)}` : 'More nerfs will be shown with more rewards'}${supervoid ? `\n‒ 'Global boost' Inflation softcaps instantly\n${progress2[4] >= 5 ? '‒ Stage reset is disabled' : 'More nerfs will be shown with more rewards'}` : ''}</p>`; }
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
                () => player.progress.main >= 20 ? `Reach ${format(1e12)} Clouds without Rank resets` : null
            ], [
                () => "Reach 'Meteoroid' Rank",
                () => "Reach 'Asteroid' Rank",
                () => "Reach 'Planet' Rank",
                () => "Reach 'Jovian planet' Rank",
                () => "Reach 'Protostar' Rank",
                () => player.progress.main >= 18 ? "Reach 'Protogalaxy' Rank" : null
            ], [
                () => 'Cause the Collapse',
                () => 'Get the first Red giant',
                () => `Get the first ${global.april.active ? 'Antineutron' : 'Neutron'} star`,
                () => 'Get the first Black hole',
                () => 'Unlock Intergalactic Stage'
            ], [
                () => 'Create a Galaxy',
                () => player.progress.main >= 20 ? 'Force the Galactic Merge' : null,
                () => player.progress.results >= 1 ? 'Create a Galaxy group' : null,
                () => player.progress.results >= 2 ? 'Create a Galaxy cluster' : null
            ]
        ],
        rewardText: [[
            [],
            ["'Energy increase' (Microworld)", "'Conservation of Mass' (Microworld)", "'Improved flow' (Submerged)"],
            ["'Mechanical spread' (Submerged)", "'Ocean world' (Submerged)", "'Galactic tide' (Intergalactic)"],
            ['Multiple max level increases', 'Multiple max level increases', 'Multiple max level increases', 'Multiple max level increases', "'Strange growth' (Intergalactic)", "'Automatic Merge' (Intergalactic)"],
            ['Max level increased for auto resets', "'Conservation of Energy' (Microworld)", "'Neutronium' (Interstellar)", "'Mass delay' (Accretion)", "'Newer Upgrade' (Interstellar)"],
            ["'Rank raise' (Accretion)", 'New Abyss themed Strangeness', 'Max level increased for auto resets (WIP)', 'Work in progress']
        ], [
            [],
            ["'Discharge improvement' (Cosmons)", "'Indestructible matter' (Milestone)", "'Conservation of resources' (Cosmons)"],
            ["'Vaporization improvement' (Cosmons, WIP)", "'Better rewards' (Inflatons, WIP)", "'Work in progress"],
            ["'Rank improvement' (Cosmons)", "'Passive Ranks' (Milestone)", "'More Cosmons' (Cosmons)", "'Improved Offline' (Inflatons)", "'Improved conservation' (Milestone)", 'Work in progress'],
            ["'Collapse improvement' (Cosmons, WIP)", "'Stranger gain' (Cosmons, WIP)", "'Main Stars' (Milestone, WIP)", "'Limitless Mass' (Milestone, WIP)", "'Inflationary boost' (Inflatons, WIP)"],
            ['Work in progress', 'Work in progress', 'Work in progress', 'Work in progress']
        ]],
        resetType: 'stage',
        time: 3600,
        color: 'darkviolet'
    }, { //Challenge [1]
        name: 'Vacuum stability',
        description: () => !global.april.quantum ? 'A more stable, but still the false Vacuum state\n(Entering will force a Vacuum reset, will be reverted after exiting)' : 'Vacuum state with the lowest possible Energy\n(Entering will force a Quantum reset, will be reverted after exiting)',
        effectText: () => {
            if (global.april.quantum) { return '<p class="cyanText">‒ Global speed is set to 0\n‒ Stage resets are disabled\n‒ All Stages are removed from reset cycle</p>'; }
            const completions = player.challenges.stability;
            return `<p class="orchidText">‒ Global speed is decreased by ${format(4 * 8 ** completions, { padding: 'exponent' })}\n‒ Milestones time limit is 0 seconds\n‒ Permanent Stages are removed from reset cycle${player.tree[0][5] >= 1 ? `\n‒ ${global.challengesInfo[2].name} resets other Stages and reset by other Stages\n‒ On Stage reset will receive reward only for the selected Stage` : ''}</p>
            <p class="greenText">‒ Strange quarks from Stage resets are decreased by ${format(2 ** completions, { padding: 'exponent' })}\n‒ Strange quarks from non-Interstellar Stage resets are further decreased by ${format(4 * 2 ** completions, { padding: 'exponent' })}\n‒ Stage resets above ${8 - completions} decrease Strange quarks from the Stage resets by 2\n‒ Going above 10 minutes of the Stage time will force Stage reset</p>
            <p class="darkvioletText">‒ Galaxies scale in cost faster by +${format(0.01)}\n‒ Intergalactic Upgrade 'Galactic Merger' cost ${format(1e10)} times more\n‒ Merge requirement is set to ${22 + completions}${player.tree[0][5] >= 1 ? '\n‒ Creation of Universes is disabled' : ''}</p>`;
        },
        needText: ['1 Completion', '2 Completions', '3 Completions (WIP)', '4 Completions (WIP)', '5 Completions (WIP)', '6 Completions (WIP)', '7 Completions (WIP)', '8 Completions (WIP)', '9 Completions (WIP)'],
        rewardText: [
            "Improve 'Overboost' and 'Strange gain' Inflaton Inflations", //1
            "Make 'Instability' Inflation immune to End resets", //2
            'Start Vacuum resets with Void equal to Supervoid (WIP)', //3
            'Microworld Milestones no longer reset (WIP)', //4
            'Submerged Milestones no longer reset (WIP)', //5
            'Accretion Milestones no longer reset (WIP)', //6
            'Interstellar Milestones no longer reset (WIP)', //7
            'Intergalactic Milestones no longer reset (WIP)', //8
            'Start Universe resets with true Vacuum state (WIP)' //9
        ],
        resetType: 'vacuum',
        time: 5400,
        color: 'darkorchid'
    }, { //Challenge [2]
        name: 'Darkness',
        description: () => `Expansion for the Abyss Stage through ${global.buildingsInfo.name[6][0]} Upgrades\n(Activating doesn't reset anything, but ${player.strangeness[6][3] < 1 ? `requires '${global.strangenessInfo[6].name[3]}' Strangeness` : 'deactivating forces Stage reset'})`,
        effectText: () => {
            const name = global.challengesInfo[2].name;
            return `<p class="darkvioletText">‒ Doesn't count as a Challenge\n‒ Disables Big Crunches while active</p>
            <p class="orchidText">‒ ${name} uses separate automatizations\n‒ ${name} is ${player.tree[0][5] < 1 ? 'disabled' : 'enabled'} in false Vacuum\nMore information to be revealed (WIP)</p>
            <p class="cyanText">‒ Time limit is based on Universe age\n‒ Time limit is always active (WIP)\nMore information to be revealed (WIP)</p>`;
        },
        rewardText: [
            'Work in progress', //0
            'Darkness Tier can be increased to 2 (WIP)', //1
            'Auto Dark energy Researches', //2
            'Auto Nucleation', //3
            'Auto Abyss Upgrades', //4
            "Auto 'Dark planets'", //5
            'Auto Abyss Researches' //6
        ],
        resetType: 'universe',
        time: 3.1556952e16,
        color: 'gray'
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

/* Values for arrays are taken from global object */
export const vacuumStart: vacuumStartType = {
    true: {
        build0Start: [new Overlimit(0), new Overlimit(5.476e-3), new Overlimit(0), new Overlimit(9.76185667392e-36), new Overlimit(1)],
        buildS1Cost: [],
        upgradesS1: [],
        upgradesS4: [],
        upgradesS5: [],
        researchesS1Cost: [],
        researchesS1Scale: [],
        researchesS4: [],
        researchesS5: [],
        extrasS4: [],
        extrasS5: [],
        ASRS1: [],
        ASR3S3: global.ASRInfo.costRange[3][3],
        elements: [],
        strangenessS1Cost: [],
        strangenessS1Scale: [],
        strangenessS2Cost: [],
        strangenessS2Scale: [],
        strangenessS3Cost: [],
        strangenessS3Scale: [],
        strangenessS4Cost: [],
        strangenessS4Scale: [],
        strangenessS5Cost: [],
        strangenessS5Scale: [],
        rest: [new Overlimit(global.upgradesInfo[2].cost[0]), global.researchesInfo[2].scaling[2], global.researchesInfo[2].scaling[3]]
    },
    false: {
        build0Start: [new Overlimit(0), new Overlimit(3), new Overlimit(2.7753108348135e-3), new Overlimit(1e-19), new Overlimit(1)],
        buildS1Cost: [0, 3, 24, 3],
        upgradesS1: [0, 0, 12, 36, 120, 240, 480, 1600, 3200, 20800],
        upgradesS5: [new Overlimit(1e150)],
        researchesS1Cost: [600, 2000, 4000, 4000, 6000, 6000],
        researchesS1Scale: [200, 400, 2000, 12000, 4000, 6000],
        ASRS1: [2000, 8000, 16000],
        ASR3S3: 2e30,
        elements: [new Overlimit(1e52), new Overlimit(1e54)],
        strangenessS1Cost: [1.25, 1, 1.5, 2, 4, 2, 24],
        strangenessS1Scale: [0.75, 0.5, 0.5, 2, 0, 0, 0],
        strangenessS2Cost: [1, 1.2, 2, 2, 4, 2, 24],
        strangenessS2Scale: [0.5, 0.6, 1, 2, 0, 0, 0],
        strangenessS3Cost: [1.2, 1, 2, 4, 4, 2, 4, 24],
        strangenessS3Scale: [0.6, 1, 1, 0, 0, 0, 2, 0],
        strangenessS4Cost: [1.5, 1.5, 4, 2, 4, 2, 4, 24],
        strangenessS4Scale: [0.75, 1.5, 1, 2, 0, 0, 68, 0],
        strangenessS5Cost: [20, 24, 240, 24, 6000, 24, 20, 120],
        strangenessS5Scale: [20, 24, 240, 0, 0, 0, 220, 0],
        rest: [new Overlimit(1e4), 1e3, 1e2]
    }
};

export const universeName = () => player.challenges.active === 0 ? 'Void' : player.inflation.vacuum ? 'basic self-made' : 'false';
/** To make it easier to edit every case where it used at once, provided numbers need to be in ascending order */
const visualUniverseLevels = (...unlocks: number[]): string => {
    const universes = calculateEffects.trueUniverses();
    for (let i = 0; i < unlocks.length; i++) {
        if (universes >= unlocks[i]) { continue; }
        return `\n(Max level will be increased at ${unlocks[i]} ${universeName()} Universes)`;
    }
    return '';
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
    star: [0, 0, 0],
    galaxyBase: 0,
    strangeMiltipliers: 0,
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
    const info = vacuumStart[state ? 'true' : 'false'];
    const { buildingsInfo, upgradesInfo, researchesInfo, researchesExtraInfo, elementsInfo, strangenessInfo } = global;
    const buildings = playerStart.buildings;
    for (let s = 1; s <= 3; s++) {
        buildings[s][0].current.setValue(info.build0Start[s]);
        buildings[s][0].total.setValue(info.build0Start[s]);
        buildings[s][0].trueTotal.setValue(info.build0Start[s]);
    }
    buildingsInfo.firstCost[1] = cloneArray(info.buildS1Cost);
    upgradesInfo[1].cost = cloneArray(info.upgradesS1);
    upgradesInfo[2].cost[0] = new Overlimit(info.rest[0]);
    upgradesInfo[5].cost[3] = new Overlimit(info.upgradesS5[state ? 3 : 0]);
    researchesInfo[1].firstCost = cloneArray(info.researchesS1Cost);
    researchesInfo[1].scaling = cloneArray(info.researchesS1Scale);
    researchesInfo[2].scaling[2] = info.rest[1];
    researchesInfo[2].scaling[3] = info.rest[2];
    global.ASRInfo.costRange[1] = cloneArray(info.ASRS1);
    global.ASRInfo.costRange[3][3] = info.ASR3S3;
    elementsInfo.cost[27].setValue(info.elements[state ? 27 : 0]);
    elementsInfo.cost[28].setValue(info.elements[state ? 28 : 1]);
    strangenessInfo[1].firstCost = cloneArray(info.strangenessS1Cost);
    strangenessInfo[1].scaling = cloneArray(info.strangenessS1Scale);
    strangenessInfo[2].firstCost = cloneArray(info.strangenessS2Cost);
    strangenessInfo[2].scaling = cloneArray(info.strangenessS2Scale);
    strangenessInfo[3].firstCost = cloneArray(info.strangenessS3Cost);
    strangenessInfo[3].scaling = cloneArray(info.strangenessS3Scale);
    strangenessInfo[4].firstCost = cloneArray(info.strangenessS4Cost);
    strangenessInfo[4].scaling = cloneArray(info.strangenessS4Scale);
    strangenessInfo[5].firstCost = cloneArray(info.strangenessS5Cost);
    strangenessInfo[5].scaling = cloneArray(info.strangenessS5Scale);

    const milestone1S1 = getQuery('#milestone1Stage1Div > input') as HTMLImageElement;
    const milestone1S2 = getQuery('#milestone1Stage2Div > input') as HTMLImageElement;
    const milestone2S2 = getQuery('#milestone2Stage2Div > input') as HTMLImageElement;
    const milestone1S3 = getQuery('#milestone1Stage3Div > input') as HTMLImageElement;
    const milestone2S4 = getQuery('#milestone2Stage4Div > input') as HTMLImageElement;
    if (state) {
        specialHTML.footerStatsHTML[1][0] = ['Energy%20mass.png', 'stage1borderImage cyanText', 'Mass'];
        buildingsInfo.hoverText[2][0] = upgradesInfo[1].name[8];
        buildingsInfo.hoverText[3][0] = 'Preons hardcap';
        buildingsInfo.type[2][0] = 'improving';
        buildingsInfo.type[3][0] = 'delaying';
        if (buildingsInfo.name[1][0] !== 'Mass') {
            buildingsInfo.name[1].unshift('Mass', 'Preons');
            buildingsInfo.hoverText[1].unshift('Mass', 'Preons');
            specialHTML.buildingHTML[1].unshift('Preon.png', 'Quarks.png');
        }

        for (let s = 1; s < 7; s++) {
            if (s !== 5 && s !== 6) {
                buildingsInfo.maxActive[s] = buildingsInfo.firstCost[s].length;
                upgradesInfo[s].maxActive = upgradesInfo[s].cost.length;
                if (s !== 1 && s !== 3) { researchesInfo[s].maxActive = researchesInfo[s].firstCost.length; }
                researchesExtraInfo[s].maxActive = researchesExtraInfo[s].firstCost.length;
            }
            strangenessInfo[s].maxActive = strangenessInfo[s].firstCost.length;
        }
        elementsInfo.maxActive = elementsInfo.cost.length;

        getId('milestonesExtra').innerHTML = 'Requires <span class="darkvioletText">Void Milestones</span> Inflation to be active to enable effects';
        milestone1S1.src = 'Used_art/Preon.png';
        global.milestonesInfo[2].name[0] = 'Just a bigger Puddle';
        getQuery('#milestone1Stage2Main > span').textContent = 'Just a bigger Puddle';
        milestone1S2.alt = 'Just a bigger Puddle';
        global.milestonesInfo[2].name[1] = 'Distant Clouds';
        getQuery('#milestone2Stage2Main > span').textContent = 'Distant Clouds';
        milestone2S2.src = 'Used_art/Clouds.png';
        milestone2S2.alt = 'Distant Clouds';
        milestone1S3.alt = 'Center of gravity';
        global.milestonesInfo[3].name[0] = 'Center of gravity';
        getQuery('#milestone1Stage3Main > span').textContent = 'Center of gravity';
        milestone2S4.src = 'Used_art/Black%20hole.png';
        getQuery('#stageHistory > h3').textContent = 'Stage resets:';

        getId('mergeTrue').style.display = '';
        getId('preonCap').style.display = '';
        getId('molesProduction').style.display = '';
        getId('massProduction').style.display = '';
        getId('mainCapHardS5').style.display = '';
        getId('element0').style.display = '';
        getId('strange0Type').textContent = global.strangeInfo.name[0];
        getId('strangeRateType').textContent = global.strangeInfo.name[0];
        getId('strangePeak').style.display = '';
        getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}5`).style.display = '';
        getId('strange7Stage1').style.display = '';
        getId('strange7Stage2').style.display = '';
        getId('strange8Stage3').style.display = '';
        getId('strange8Stage4').style.display = '';
        getId('strange3Stage5').style.display = '';
        getId('strange4Stage5').style.display = '';
        getId('milestone1Stage5Div').style.display = '';
        getId('milestone2Stage5Div').style.display = '';
        getId('stageAutoInterstellar1').style.display = '';
        getId('stageAutoInterstellar2').style.display = '';
        getId('stageAutoMerge').style.display = '';
        getId('vaporizationLimit').style.display = '';
        getId('collapseCapped').style.display = '';

        getId('mergeFalse').style.display = 'none';
        getQuery('#stageAutoInterstellar1 span').style.display = 'none';
        getId('stageAutoFalse').style.display = 'none';
    } else {
        specialHTML.footerStatsHTML[1][0] = ['Quarks.png', 'stage1borderImage cyanText', 'Quarks'];
        buildingsInfo.hoverText[2][0] = 'Moles';
        buildingsInfo.hoverText[3][0] = 'Mass';
        buildingsInfo.type[2][0] = 'producing';
        buildingsInfo.type[3][0] = 'producing';
        if (buildingsInfo.name[1][0] === 'Mass') {
            buildingsInfo.name[1].splice(0, 2);
            buildingsInfo.hoverText[1].splice(0, 2);
            specialHTML.buildingHTML[1].splice(0, 2);
        }
        global.buildingsInfo.producing[4][5].setValue(0);
        getId('star3Effect').dataset.title = 'Boost to the Solar mass gain';

        buildingsInfo.maxActive[1] = 4;
        buildingsInfo.maxActive[2] = 6;
        buildingsInfo.maxActive[3] = 5;
        buildingsInfo.maxActive[4] = 5;
        upgradesInfo[1].maxActive = 10;
        upgradesInfo[2].maxActive = 8;
        upgradesInfo[3].maxActive = 13;
        upgradesInfo[4].maxActive = 4;
        researchesInfo[2].maxActive = 6;
        researchesInfo[4].maxActive = 5;
        researchesExtraInfo[1].maxActive = 0;
        researchesExtraInfo[2].maxActive = 3;
        researchesExtraInfo[3].maxActive = 4;
        researchesExtraInfo[4].maxActive = 3;
        elementsInfo.maxActive = 29;
        strangenessInfo[1].maxActive = 7;
        strangenessInfo[2].maxActive = 7;
        strangenessInfo[3].maxActive = 8;
        strangenessInfo[4].maxActive = 8;
        strangenessInfo[5].maxActive = 8;
        strangenessInfo[6].maxActive = 0;

        getId('milestonesExtra').innerHTML = 'Completing any tier will award 1 <span class="greenText">Strange quark</span>';
        milestone1S1.src = 'Used_art/Quarks.png';
        global.milestonesInfo[2].name[0] = 'A Nebula of Drops';
        getQuery('#milestone1Stage2Main > span').textContent = 'A Nebula of Drops';
        milestone1S2.alt = 'A Nebula of Drops';
        global.milestonesInfo[2].name[1] = 'Just a bigger Puddle';
        getQuery('#milestone2Stage2Main > span').textContent = 'Just a bigger Puddle';
        milestone2S2.src = 'Used_art/Puddle.png';
        milestone2S2.alt = 'Just a bigger Puddle';
        milestone1S3.alt = 'Cluster of Mass';
        global.milestonesInfo[3].name[0] = 'Cluster of Mass';
        getQuery('#milestone1Stage3Main > span').textContent = 'Cluster of Mass';
        milestone2S4.src = 'Used_art/Main_sequence%20mass.png';
        assignInnerHTML('#mergeFalse', 'Attempt to <span class="darkvioletText">Merge</span> <span class="grayText">Galaxies</span> together, which will result in <span class="orchidText">Vacuum</span> decaying into its true state');
        getQuery('#stageHistory > h3').textContent = 'Interstellar Stage resets:';

        getId('strange8Stage5').style.display = '';
        getId('milestonesProgressArea').style.display = '';
        getQuery('#stageAutoInterstellar1 span').style.display = '';
        getId('stageAutoFalse').style.display = '';
        getId('rankStat0').style.display = '';

        getId('preonCap').style.display = 'none';
        getId('molesProduction').style.display = 'none';
        getId('massProduction').style.display = 'none';
        getId('dustCap').style.display = 'none';
        getId('submersionBoost').style.display = 'none';
        getId('mainCap').style.display = 'none';
        getId('mainCapHardS5').style.display = 'none';
        getId('researchAuto1').style.display = 'none';
        getId('researchAuto2').style.display = 'none';
        getId('vaporizationLimit').style.display = 'none';
        getId('collapseCapped').style.display = 'none';
        getId('element0').style.display = 'none';
        getId('strange1Unlocked').style.display = 'none';
        getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}6`).style.display = 'none';
        for (let s = 1; s <= 5; s++) {
            for (let i = strangenessInfo[s].maxActive + 1; i <= strangenessInfo[s].cost.length; i++) {
                getId(`strange${i}Stage${s}`).style.display = 'none';
            }
            if (s === 1) { continue; }
            getId(`energyGainStage${s}`).style.display = 'none';
        }
        getId('energyGainStage1Build1').style.display = 'none';
        getId('energyGainStage1Build2').style.display = 'none';
    }
};
/** Handles special logic related to required data in and out of every Challenge (must be after prepareVacuum) */
export const prepareChallenge = () => {
    const challenge = player.challenges.active;
    const next = challenge === null ? null : challenge === 0 && !player.toggles.supervoid ? 0 : challenge + 1;
    const old = global.debug.challenge;

    const trueInfo = vacuumStart.true;
    const startEl = global.elementsInfo.cost;
    const startU4 = global.upgradesInfo[4].cost;
    const startU5 = global.upgradesInfo[5].cost;
    const startR4 = global.researchesInfo[4].firstCost;
    const startR5 = global.researchesInfo[5].firstCost;
    const startE4 = global.researchesExtraInfo[4].firstCost;
    const startE5 = global.researchesExtraInfo[5].firstCost;
    if (next === 0 || next === 1) {
        global.buildingsInfo.producing[4][5].setValue(0);
        global.buildingsInfo.maxActive[4] = 5;
        if (next === 1) {
            const offset = new Overlimit(100);
            if (startEl[1].equal(trueInfo.elements[1])) {
                for (let i = 1; i < startEl.length; i++) { startEl[i].multiply(offset); }
                for (let i = 0; i < startU4.length; i++) { startU4[i].multiply(offset); }
                for (let i = 0; i < startU5.length; i++) { startU5[i].multiply(offset); }
                for (let i = 0; i < startR4.length; i++) { startR4[i].multiply(offset); }
                for (let i = 0; i < startR5.length; i++) { startR5[i].multiply(offset); }
                for (let i = 0; i < startE4.length; i++) { startE4[i].multiply(offset); }
                for (let i = 0; i < startE5.length; i++) { startE5[i].multiply(offset); }
            } else if (startEl[27].equal(trueInfo.elements[27])) {
                startEl[27].multiply(offset);
                startEl[28].multiply(offset);
                startU5[3].multiply(offset);
            }
        }
    } else if (next === 2) {
        startU5[3].setValue(trueInfo.upgradesS5[3]);
    }
    if (next === old) { return; }
    global.debug.challenge = next;

    if (old === 0 || old === 1) {
        if (player.inflation.vacuum) { global.buildingsInfo.maxActive[4] = global.buildingsInfo.firstCost[4].length; }
        if (old === 1) {
            for (let i = 1; i < startEl.length; i++) { startEl[i].setValue(trueInfo.elements[i]); }
            for (let i = 0; i < startU4.length; i++) { startU4[i].setValue(trueInfo.upgradesS4[i]); }
            for (let i = 0; i < startU5.length; i++) { startU5[i].setValue(trueInfo.upgradesS5[i]); }
            for (let i = 0; i < startR4.length; i++) { startR4[i].setValue(trueInfo.researchesS4[i]); }
            for (let i = 0; i < startR5.length; i++) { startR5[i].setValue(trueInfo.researchesS5[i]); }
            for (let i = 0; i < startE4.length; i++) { startE4[i].setValue(trueInfo.extrasS4[i]); }
            for (let i = 0; i < startE5.length; i++) { startE5[i].setValue(trueInfo.extrasS5[i]); }
            if (!player.inflation.vacuum) {
                startU5[3].setValue(vacuumStart.false.upgradesS5[0]);
                startEl[27].setValue(vacuumStart.false.elements[0]);
                startEl[28].setValue(vacuumStart.false.elements[1]);
            }
        }
    } else if (old === 2) {
        if (!player.inflation.vacuum) { startU5[3].setValue(vacuumStart.false.upgradesS5[0]); }
    }
};

/** Removes excess data by default */
export const fillMissingValues = <ArrayType extends any[]>(test: ArrayType, start: ArrayType, removeExcess = true) => {
    if (test.length > start.length) {
        if (removeExcess) { test.length = start.length; }
        return;
    }
    for (let i = test.length; i < start.length; i++) { test[i] = deepClone(start[i]); }
};

export const updatePlayer = (load: playerType, decode = true): string => {
    if (load.inflation === undefined) { throw new ReferenceError('This save file is not from this game or too old'); }
    prepareVacuum(load.inflation.vacuum); //Only to set starting buildings values

    const oldVersion = load.version;
    if (oldVersion !== playerStart.version) {
        if (['v0.1.2', 'v0.1.3', 'v0.1.4', 'v0.1.5', 'v0.1.6', 'v0.1.7', 'v0.1.8'].includes(load.version)) {
            load.version = 'v0.1.9';
            load.researchesAuto = cloneArray(playerStart.researchesAuto);
            delete load.accretion['input' as keyof unknown];

            /* Can be shortened */
            load.discharge = deepClone(playerStart.discharge);
        }
        if (load.version === 'v0.1.9' || load.version === 'v0.2.0') {
            load.version = 'v0.2.1';
            load.inflation.resets = load.inflation.vacuum ? 1 : 0;
            load.buildings = deepClone(playerStart.buildings); //Moving this down will allow to reset load.inflation

            /* Can be shortened */
            load.stage = deepClone(playerStart.stage);
        }
        if (load.version === 'v0.2.1') {
            load.version = 'v0.2.2';
            load.elements = cloneArray(playerStart.elements);
            load.inflation.time = 0;

            /* Can be shortened */
            load.collapse = deepClone(playerStart.collapse);
        }
        if (['v0.2.2', 'v0.2.3', 'v0.2.4', 'v0.2.5'].includes(load.version)) {
            load.version = 'v0.2.6';
            load.inflation.loadouts = [];
            delete load.inflation['spent' as keyof unknown];
            delete load.inflation['tree' as keyof unknown];

            /* Can be shortened */
            load.vaporization = deepClone(playerStart.vaporization);
            load.time = deepClone(playerStart.time);
            load.toggles = deepClone(playerStart.toggles);
        }
        if (load.version === 'v0.2.6') {
            load.version = 'v0.2.7';
            load.merge = deepClone(playerStart.merge);
        }
        if (load.version === 'v0.2.7') {
            load.version = 'v0.2.8';
            load.progress = deepClone(playerStart.progress);
            const trueVerses = load.verses === undefined ? 0 : (load.verses[0]?.true ?? 0);
            const highestUniverse = Math.max(load.inflation.ends !== undefined ? (load.inflation.ends as number[])[2] : 0, trueVerses);
            load.verses = deepClone(playerStart.verses);
            load.inflation.age = 0;
            load.inflation.ends = cloneArray(playerStart.inflation.ends);
            load.inflation.peak = cloneArray(playerStart.inflation.peak);
            load.upgrades[6] = cloneArray(playerStart.upgrades[6]);
            load.researches[6] = cloneArray(playerStart.researches[6]);
            load.researchesExtra[6] = cloneArray(playerStart.researchesExtra[6]);
            load.strangeness[6] = cloneArray(playerStart.strangeness[6]);
            load.stage.peak = cloneArray(playerStart.stage.peak);
            load.stage.input = cloneArray(playerStart.stage.input);
            load.darkness = deepClone(playerStart.darkness);
            load.challenges = deepClone(playerStart.challenges);
            load.cosmon = deepClone(playerStart.cosmon);
            load.tree = deepClone(playerStart.tree);
            load.history = deepClone(playerStart.history);
            delete load.stage['true' as keyof unknown];
            const voidVerses = load.inflation['voidVerses' as keyof unknown] as number;
            delete load.inflation['voidVerses' as keyof unknown];
            for (const key in load) {
                if (playerStart[key as keyof unknown] === undefined) { delete load[key as keyof unknown]; }
            }

            /* Can be shortened */
            if (load.strange[0].current > 1e10) {
                load.strange[0].current = 1e10;
                load.strange[0].total = 1e10;
            }
            if (load.strange[1].current > 1e8) {
                load.strange[1].current = 1e8;
                load.strange[1].total = 1e8;
            }
            for (let i = 0; i < load.inflation.loadouts.length; i++) {
                const loadout = load.inflation.loadouts[i][1];
                for (let l = 0; l < loadout.length; l++) {
                    if (loadout[l] >= 5) { loadout[l]++; }
                }
            }
            load.collapse.highest = load.collapse['maxElement' as keyof unknown] ?? 0;
            load.buildings[6] = deepClone(playerStart.buildings[6]);
            load.time.export[3] = 0;
            if (highestUniverse > 2) {
                load.cosmon[1].current = highestUniverse - 2;
                if (voidVerses !== undefined) { load.cosmon[1].current += voidVerses; }
                load.cosmon[1].total = load.cosmon[1].current;
            }
            load.verses[0].true = Math.min(trueVerses, 2);
            load.verses[0].current = Math.min(highestUniverse, 2);
            load.verses[0].total = load.verses[0].current;
            load.verses[0].highest = load.verses[0].current;
            load.cosmon[0].current = trueVerses >= 2 ? 4 : trueVerses >= 1 ? 1 : 0;
            if (load.inflation.vacuum && trueVerses >= 1) { load.cosmon[0].current++; }
            load.cosmon[0].total = load.cosmon[0].current;
            load.toggles.confirm[6] = 'All';
            load.toggles.supervoid = false;
            delete load.discharge['energyMax' as keyof unknown];
            delete load.vaporization['cloudsMax' as keyof unknown];
            delete load.collapse['maxElement' as keyof unknown];
            delete load.collapse['massMax' as keyof unknown];
            delete load.collapse['show' as keyof unknown];
        }

        if (load.version !== playerStart.version) {
            throw new ReferenceError(`Save file version ${load.version} is not allowed`);
        }
    }
    load.cosmon[1].current = Math.round(load.cosmon[1].current * 1e14) / 1e14; //Remove

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

    if (load.time.export[0] < -3600_000) { load.time.export[0] = -3600_000; }
    if (load.time.offline < -3600_000) { load.time.offline = -3600_000; }
    if (load.time.excess < -1200_000) { load.time.excess = -1200_000; }
    if (load.accretion.rank === 0) { load.buildings[3][0].current = '5.9722e27' as unknown as Overlimit; } //Required

    if (load.challenges.active !== null) {
        const clone = load.clone;
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
    } else { load.clone = {}; }

    /* Restore data post JSON parse */
    if (decode) {
        const decoder = new TextDecoder();
        load.fileName = decoder.decode(Uint8Array.from(load.fileName, (c) => c.codePointAt(0) as number));
        for (let i = 0; i < load.inflation.loadouts.length; i++) {
            load.inflation.loadouts[i][0] = decoder.decode(Uint8Array.from(load.inflation.loadouts[i][0], (c) => c.codePointAt(0) as number));
        }
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

    /* Final preparations */
    prepareChallenge();
    prepareDarkness(false);
    global.trueActive = player.stage.active;
    global.debug.historyStage = null;
    global.debug.historyEnd = null;
    global.debug.timeLimit = false;

    const progress = player.challenges.supervoidMax;
    global.inflationInfo.totalSuper = progress[1] + progress[2] + progress[3] + progress[4] + progress[5];
    const stars = player.buildings[4];
    global.collapseInfo.trueStars = stars[1].true + stars[2].true + stars[3].true + stars[4].true + stars[5].true;
    global.collapseInfo.pointsLoop = 0;
    global.mergeInfo.galaxies = player.buildings[5][3].current.toNumber();
    global.inflationInfo.trueUniverses = calculateEffects.trueUniversesAll();
    global.historyStorage.stage = player.history.stage.list;
    global.historyStorage.end = player.history.end.list;

    for (let s = 1; s <= 5; s++) {
        for (let i = 0; i < playerStart.milestones[s].length; i++) {
            global.milestonesInfo[s].recent[i] = 0;
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
        global.automatization.autoU[s] = [];
        global.automatization.autoR[s] = [];
        global.automatization.autoE[s] = [];

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
    global.automatization.element = 1;
    global.automatization.autoS = [];

    if (global.april.ultravoid === false) { global.april.ultravoid = null; }
    toggleChallengeType();
    for (let i = 0; i < global.challengesInfo.length; i++) { assignChallengeInformation(i); }
    global.lastElement = null;
    global.lastStrangeness = [null, 0];
    global.lastMilestone = [null, 0];
    global.lastChallenge[0] = player.challenges.active !== null ? player.challenges.active : player.darkness.active ? 2 : 1;
    global.lastInflation = [null, 0];

    assignBuildingsProduction.strange1();
    assignBuildingsProduction.strange0();
    assignBuildingsProduction.S2Levels(true);
    assignBuildingsProduction.S4Levels(true);
    assignResetInformation.maxRank();
    assignResetInformation.trueEnergy();
    assignResetInformation.trueDarkEnergy();

    visualProgressUnlocks();
    switchTab(); //Order matters
    (getId('saveFileNameInput') as HTMLInputElement).value = player.fileName;
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
    for (let i = 0; i < playerStart.toggles.normal.length; i++) { toggleSwap(i, 'normal'); }
    for (let i = 0; i < playerStart.toggles.confirm.length; i++) { toggleConfirm(i); }
    for (let i = 0; i < playerStart.toggles.hover.length; i++) { toggleSwap(i, 'hover'); }
    for (let i = 0; i < playerStart.toggles.max.length; i++) { toggleSwap(i, 'max'); }
    for (let i = 0; i < playerStart.toggles.auto.length; i++) { toggleSwap(i, 'auto'); }
    (getId('buyAnyInput') as HTMLInputElement).value = format(player.toggles.shop.input, { type: 'input' });
    if (global.loadouts.open) {
        global.loadouts.open = false;
        getId('loadoutsMain').style.display = 'none';
        if (globalSave.SRSettings[0]) { getId('inflationLoadouts').ariaExpanded = 'false'; }
    }
    updateCollapsePoints();

    return oldVersion;
};
