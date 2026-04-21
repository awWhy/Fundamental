import type Overlimit from './Limit';

type building = {
    /** Self-made */
    true: number
    current: Overlimit
    /** This pre-Stage reset */
    total: Overlimit
    /** This Stage */
    trueTotal: Overlimit
};
type verse = {
    true: number
    current: number
    total: number
};
type upgrade = {
    name: string[]
    effectText: Array<() => string>
    cost: Overlimit[]
    maxActive: number
};
/** Upgrades that do not use numbers */
type upgrageAlt = {
    cost: number[]
} & Omit<upgrade, 'cost'>;
type research = {
    name: string[]
    effectText: Array<() => string>
    cost: Overlimit[]
    firstCost: Overlimit[]
    scaling: number[]
    max: number[]
    maxActive: number
};
/** Researches that do not use numbers */
type researchAlt = {
    cost: number[]
    firstCost: number[]
} & Omit<research, 'cost' | 'firstCost'>;

export interface playerType {
    version: string
    fileName: string
    stage: {
        current: number
        active: number
        resets: number
        time: number
        /** Interstellar only, [Strange quarks peak, peaked at] */
        peak: [number, number]
        /** [type, quarks, time, peak] */
        input: [number, number, number, number]
    }
    discharge: {
        energy: number
        current: number
    }
    vaporization: {
        clouds: number
        /** [Boost, max] */
        input: [number, number]
    }
    accretion: {
        rank: number
    }
    collapse: {
        mass: number
        stars: [number, number, number]
        /** Highest Element in current Stage */
        highest: number
        /** [Boost, wait] */
        input: [number, number]
        points: number[]
    }
    merge: {
        rewards: [number, number, number, number]
        /** Prevents auto Merge level 2 from breaking */
        claimed: [number, number]
        resets: number
        /** [Min Galaxies, time since last Galaxy] */
        input: [number, number]
        /** How much real time passed since last Galaxy */
        since: number
    }
    darkness: {
        active: boolean
        /** [tier, ...lowest Universes on Big Rip[]] \
         * Tier 1: 0 - 6
         */
        tier: number
        energy: number
        fluid: number
        input: number
    }
    inflation: {
        loadouts: Array<[string, number[]]>
        vacuum: boolean
        resets: number
        age: number
        ends: [number, number, number]
        time: number
        /** [Cosmons peak, peaked at] */
        peak: [number, number]
    }
    time: {
        updated: number
        started: number
        /** Tick excess, in milliseconds */
        excess: number
        /** [Milliseconds, Strange quarks, Strangelets, Cosmons] */
        export: [number, number, number, number]
        /** Offline storage, in milliseconds */
        offline: number
        /** In milliseconds */
        online: number
        end: number
        universe: number
        vacuum: number
        stage: number
    }
    buildings: Array<[Omit<building, 'true'>, ...building[]]>
    verses: [verse & {
        /** [void, supervoid, false] */
        other: [number, number, number]
        /** After Big Crunch */
        highest: number
        /** After Big Rip [Darkness tier] */
        lowest: number[]
    }, ...verse[]]
    strange: Array<{
        current: number
        total: number
    }>
    cosmon: Array<{
        current: number
        total: number
    }>
    upgrades: number[][]
    researches: number[][]
    researchesExtra: number[][]
    researchesAuto: number[]
    /** Auto Structures Research */
    ASR: number[]
    elements: number[]
    strangeness: number[][]
    milestones: number[][]
    /** Inflation tree */
    tree: number[][]
    challenges: {
        active: number | null
        void: number[]
        voidCheck: number[]
        supervoid: number[]
        supervoidMax: number[]
        stability: number
    }
    toggles: {
        /** Stay till time out[0], Auto disable Vaporization[1], Auto disable Stage[2], Automatic leave[3],
         * Auto accept Offline[4], Stay till no Merges[5] */
        normal: boolean[]
        /** Stage[0], Discharge[1], Vaporization[2], Rank[3], Collapse[4], Merge[5], End[6], Nucleation[7] */
        confirm: Array<'All' | 'Safe' | 'None'>
        /** Upgrades/Researches/Elements[0], Strangeness[1], Inflations[2] */
        hover: boolean[]
        /** Researches[0], Strangeness[1], Inflations[2] */
        max: boolean[]
        /** Stage[0], Discharge[1], Vaporization[2], Rank[3], Collapse[4], Upgrades[5], Researches[6],
         * ResearchesExtra[7], Elements[8], Merge[9], Nucleation[10], Strangeness[11] */
        auto: boolean[]
        /** [0] is not used */
        buildings: boolean[][]
        verses: boolean[]
        supervoid: boolean
        shop: {
            input: number
            wait: number[]
        }
    }
    history: {
        stage: {
            best: [number, number, number, number, number]
            list: Array<playerType['history']['stage']['best']>
            input: [number, number]
        }
        end: {
            best: [number, number, number, number, number]
            list: Array<playerType['history']['end']['best']>
            input: [number, number]
        }
    }
    progress: {
        main: number
        /** Highest reached Element for visuals [false, true Vacuum] */
        element: [number, number]
        /** Used for showing Merge results related Void rewards */
        results: number
        /** Highest reached basic self-made Universes for visuals */
        universe: number
        quantum?: number
    }
    clone: {
        depth?: 'stage' | 'vacuum'
        [key: string]: any
    }
}

export type gameTab = 'stage' | 'upgrade' | 'Elements' | 'strangeness' | 'inflation' | 'settings';
export type gameSubtab = 'Structures' | 'Advanced' | //Stage tab
    'Upgrades' | 'Elements' | //Upgrade tab
    'Matter' | 'Milestones' | //Strangeness tab
    'Inflations' | 'Milestones' | //Inflation tab
    'Settings' | 'Stats' | 'History'; //Settings tab

export interface globalType {
    tabs: {
        current: gameTab
        list: gameTab[]
    } & {
        [subtab in gameTab]: {
            current: gameSubtab
            list: gameSubtab[]
        }
    }
    debug: {
        /** Notified about reaching time limit */
        timeLimit: boolean
        /** To which Challenge game was adjusted\
         * 0 ‒ Void;
         * 1 ‒ Supervoid;
         * 2 ‒ Stability;
         */
        challenge: number | null
        /** Which Rank is displayed */
        rankUpdated: number | null
        /** How many resets on last update */
        historyStage: number | null
        /** How many resets on last update */
        historyEnd: number | null
        /** (Phones only) What page for Strangeness is selected */
        MDStrangePage: number
    }
    trueActive: number
    /** In milliseconds */
    lastSave: number
    /** Game update, in milliseconds */
    lastUpdate: number | null
    offline: {
        active: boolean
        /** [Change into, update type] */
        stage: [number | null, boolean | null]
        autosave: boolean
        cacheUpdate: boolean
    }
    april: {
        active: boolean
        light: boolean
        ultravoid: boolean | null
        quantum: boolean
    }
    paused: boolean
    hotkeys: {
        disabled: boolean
        shift: boolean
        ctrl: boolean
        tab: boolean
        /** Only for non-repeatable hotkeys */
        last: string
    }
    lastUpgrade: Array<[number | null, 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR']>
    lastElement: number | null
    lastStrangeness: [number | null, number]
    lastInflation: [number | null, number]
    lastMilestone: [number | null, number]
    lastChallenge: [number, number]
    /** Void reward type[0], Strangeness shown[1] */
    sessionToggles: boolean[]
    /** Sorted cheapest first, -1 inserted to the start if auto is done */
    automatization: {
        /** Upgrades */
        autoU: number[][]
        /** Researches */
        autoR: number[][]
        /** Researches Extra */
        autoE: number[][]
        /** Points to last created Element */
        element: number
        /** Strangeness, [index, stageindex] */
        autoS: Array<[number, number]>
    }
    stageInfo: {
        word: string[]
        textColor: string[]
        buttonBorder: string[]
        imageBorderColor: string[]
        costName: string[]
        activeAll: number[]
    }
    dischargeInfo: {
        energyType: number[][]
        energyStage: number[]
        energyTrue: number
        scaling: number
        next: number
        total: number
        base: number
    }
    vaporizationInfo: {
        S2Research0: number
        S2Research1: number
        S2Extra1: number
        get: number
    }
    accretionInfo: {
        /** Upgrade required to unlock Structure */
        unlockA: number[]
        /** Rank required to unlock Upgrade */
        rankU: number[]
        /** Rank required to unlock Research */
        rankR: number[]
        /** Rank required to unlock Research Extra */
        rankE: number[]
        rankCost: number[]
        rankColor: string[]
        rankName: string[]
        rankImage: string[]
        maxRank: number
        effective: number
        disableAuto: boolean
        dustSoft: number
    }
    collapseInfo: {
        /** Solar mass required to unlock Star */
        unlockB: number[]
        /** Solar mass required to unlock Upgrade */
        unlockU: number[]
        /** Solar mass required to unlock Research */
        unlockR: number[]
        newMass: number
        starCheck: [number, number, number]
        trueStars: number
        pointsLoop: number
        solarCap: number
    }
    mergeInfo: {
        /** Self-made Universes to unlock Upgrade */
        unlockU: number[]
        /** Self-made Universes to unlock Research */
        unlockR: number[]
        /** Self-made Universes to unlock Special Research */
        unlockE: number[]
        S5Extra2: number
        checkReward: [number, number, number, number]
        galaxies: number
    }
    inflationInfo: {
        globalSpeed: number
        trueUniverses: number
        /** In the current Universe */
        totalSuper: number
        newFluid: number
    }
    intervalsId: {
        main: number | undefined
        numbers: number | undefined
        visual: number | undefined
        autoSave: number | undefined
        mouseRepeat: number | undefined
    }
    buildingsInfo: {
        /** Counts index [0] */
        maxActive: number[]
        name: string[][]
        hoverText: string[][]
        type: Array<Array<'producing' | 'improving' | 'delaying'>>
        firstCost: number[][]
        increase: number[][]
        increaseStart: number[][]
        /** Visual only, [0] type is never[] */
        producing: [
            Array<number | Overlimit>,
            Overlimit[],
            number[],
            [Overlimit, Overlimit, ...number[]],
            Overlimit[],
            Overlimit[],
            number[]
        ]
    }
    strangeInfo: {
        name: string[]
        stageBoost: number[]
        /** [Producing, Improving] */
        strangeletsInfo: [number, number]
        strange0Gain: number
        strange1Gain: number
    }
    upgradesInfo: [upgrade, upgrageAlt, ...upgrade[]]
    researchesInfo: [research, researchAlt, ...research[]]
    researchesExtraInfo: [research, researchAlt, research, research, research, research, researchAlt]
    researchesAutoInfo: {
        name: string[]
        effectText: Array<() => string>
        costRange: number[][]
        max: number[]
        /** Stage to create from (1 per level) */
        autoStage: number[][]
    }
    /** Auto Structures Research */
    ASRInfo: {
        name: string
        effectText: () => string
        costRange: number[][]
        max: number[]
    }
    elementsInfo: {
        name: string[]
        effectText: Array<() => string>
        cost: Overlimit[]
        /** Counts index [0] */
        maxActive: number
    }
    strangenessInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        cost: number[]
        firstCost: number[]
        scaling: number[]
        max: number[]
        maxActive: number
    }>
    /** Inflation tree */
    treeInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        cost: number[]
        firstCost: number[]
        scaling: number[]
        max: number[]
    }>
    milestonesInfo: Array<{
        name: string[]
        needText: Array<() => string>
        rewardText: Array<() => string>
        need: Overlimit[]
        /** In the false Vacuum used as time */
        reward: number[]
        /** False Vacuum only */
        scaling: number[][]
        recent: number[]
    }>
    challengesInfo: [{
        name: string
        description: () => string
        effectText: () => string
        needText: Array<Array<() => string | null>>
        /** [Void, Supervoid] */
        rewardText: string[][][]
        resetType: 'stage' | 'vacuum'
        time: number
        color: string
    }, {
        name: string
        description: () => string
        effectText: () => string
        needText: string[]
        rewardText: string[]
        resetType: 'vacuum'
        time: number
        color: string
    }, {
        name: string
        description: () => string
        effectText: () => string
        /** Unlocks are in reverse */
        rewardText: string[]
        resetType: 'universe'
        time: number
        color: string
    }]
    historyStorage: {
        /** [time, quarks, strangelets, peak, peaked at] */
        stage: playerType['history']['stage']['list']
        /** [time, cosmon, type, peak, peaked at] */
        end: playerType['history']['end']['list']
    }
    loadouts: {
        input: number[]
        open: boolean
        /** Only used to remove events */
        buttons: Array<[HTMLElement, () => void]>
    }
}
/** Important starting values for Vacuum states */
export interface vacuumStartType {
    true: {
        upgradesS4: Overlimit[]
        researchesS4: Overlimit[]
        researchesS5: Overlimit[]
        extrasS4: Overlimit[]
        extrasS5: Overlimit[]
    } & vacuumTemplate
    false: vacuumTemplate
}
interface vacuumTemplate {
    /** First 4 Stages */
    build0Start: Overlimit[]
    buildS1Cost: number[]
    upgradesS1: number[]
    /** For false Vacuum this is only cost for [5][3] (true Vacuum version is reused for Vacuum stability) */
    upgradesS5: Overlimit[]
    researchesS1Cost: number[]
    researchesS1Scale: number[]
    ASRS1: number[]
    ASR3S3: number
    /** For false Vacuum its cost only for some of Elements:\
     * [0] ‒ [27];
     * [1] ‒ [28];
     */
    elements: Overlimit[]
    strangenessS1Cost: number[]
    strangenessS1Scale: number[]
    strangenessS2Cost: number[]
    strangenessS2Scale: number[]
    strangenessS3Cost: number[]
    strangenessS3Scale: number[]
    strangenessS4Cost: number[]
    strangenessS4Scale: number[]
    strangenessS5Cost: number[]
    strangenessS5Scale: number[]
    /** Cost for other Upgrades\
     * [0] ‒ Upgrade cost [2][0];
     * [1] ‒ Research scale [2][2];
     * [2] ‒ Research scale [2][3];
     */
    rest: [Overlimit, ...number[]]
}

export interface globalSaveType {
    intervals: {
        numbers: number
        visual: number
        autoSave: number
    }
    /** hotkeyFunction: [key, code] */
    hotkeys: Record<hotkeysList, string[]>
    numbers: Record<numbersList, string>
    /** Hotkeys type[0], Elements as tab[1], Allow text selection[2], Footer on top[3], Hide global stats[4],
     * Hide main scrollbar[5], Milestone notifications[6], Autosave on blur[7], Swap alert buttons[8] */
    toggles: boolean[]
    /** Point[0], Separator[1] */
    format: [string, string]
    theme: null | number
    fontSize: number
    /** Status[0], Mouse events[1], Enable zoom[2] */
    MDSettings: boolean[]
    /** Status[0], Keep tabindex on Upgrades[1] */
    SRSettings: boolean[]
    developerMode: boolean
}

export interface Quantum {
    active: null | Quantum['sliderTypes'][0]
    /** Must have same order as appear in HTML */
    sliderTypes: Array<'foam' | 'particles' | 'quasiparts' | 'gravitons' | 'chronons'>
    /** 1 per Slider, plus 1 for Upgrades */
    widthCache: number[]
    lastTick: number
    offline: number
    upgradesInfo: {
        totalLevels: number
        name: string[]
        effect: string[]
        cost: number[]
        scaling: number[]
        max: Array<() => number>
    }
    requirement: number[]
    upgrades: number[]
    quantization: number
    foam: number
    particles: number
    quasiparts: number
    gravitons: number
    chronons: number
    /** [Particles, Quasiparticles] */
    auto: boolean[]
}

export type hotkeysList = 'makeAll' | 'galaxy' | 'verses' | 'createAll' | 'strangeness' |
    'toggleAll' | 'toggleUpgrades' | 'toggleStrangeness' |
    'discharge' | 'vaporization' | 'rank' | 'collapse' | 'nucleation' | 'merge' | 'stage' | 'end' |
    'toggleDischarge' | 'toggleVaporization' | 'toggleRank' | 'toggleCollapse' | 'toggleMerge' | 'toggleNucleation' | 'toggleStage' |
    'exitChallenge' | 'supervoid' | 'warp' | 'pause' |
    'tabRight' | 'tabLeft' | 'subtabUp' | 'subtabDown' | 'stageRight' | 'stageLeft';

export type numbersList = 'makeStructure' | 'toggleStructure' | 'enterChallenge';

export interface calculateEffectsType {
    effectiveEnergy: () => number
    effectiveGoals: () => number
    dischargeScaling: (S1Research3?: number, S1Strange2?: number) => number
    /** Requires for global.dischargeInfo.scaling to be assigned */
    dischargeCost: (scaling?: number) => number
    dischargeBase: (S1research4?: number) => number
    S1Upgrade6: () => number
    S1Upgrade7: (preons?: boolean) => number
    S1Upgrade9: () => number
    S1Research2: (level?: number) => number
    S1Research5: () => number
    S1Extra1: (level?: number) => number
    S1Extra3: (level?: number) => number
    S1Extra4: (S1Research5?: number) => number
    /** laterPreons are effectiveEnergy ** S1Extra3 */
    preonsHardcap: (laterPreons?: number) => Overlimit
    clouds: (post?: boolean) => number
    cloudsGain: () => number
    S2Upgrade1: () => number
    S2Upgrade2: () => number
    S2Upgrade3_power: (S2Research2?: number) => number
    S2Upgrade3: (power?: number) => number
    S2Upgrade4_power: (S2Research3?: number) => number
    S2Upgrade4: (power?: number) => number
    /** Level is global.vaporizationInfo.S2Extra1 if used for production and player.researchesExtra[2][1] if for automatization */
    S2Extra1: (level: number, post?: boolean) => number
    /** Rain is calculateEffects.S2Extra1() */
    S2Extra2: (rain: number, level?: number) => number
    submersion: () => number
    rankCost: () => Overlimit | number
    effectiveRank: () => number
    S3Upgrade0: () => number
    S3Upgrade1_power: (S3Research3?: number) => number
    S3Upgrade1: (power?: number) => number
    S3Upgrade3: () => number
    S3Upgrade13: () => number
    S3Research6: (level?: number) => number
    S3Extra1: (level?: number) => number
    S3Extra4: (level?: number) => number
    dustDelay: () => number
    dustHardcap: () => number
    mass: (post?: boolean) => number
    star: Array<(post?: boolean) => number>
    massGain: () => number
    S4Shared: () => Overlimit
    S4Research0_base: (S4Research2?: number) => number
    S4Research0: (base?: number) => number
    S4Research1: (level?: number, S4Extra1?: number) => number
    S4Research4: (post?: boolean, level?: number) => number
    S4Extra1: () => number
    mergeRequirement: () => number
    /** Returns 0 if Merge isn't unlocked */
    mergeMaxResets: (safe?: boolean) => number
    reward: Array<(post?: boolean) => number>
    groupsCost: () => number
    mergeScore: () => number
    S5Upgrade0: () => number
    S5Upgrade1: () => number
    S5Upgrade2: (post?: boolean, level?: number) => number
    S5Research2: () => number
    S5Research3: () => number
    /** Level is global.mergeInfo.S5Extra2 if used for production and player.researchesExtra[5][2] + player.merge.rewards[1] if for Stage reset */
    S5Extra2: (level: number, post?: boolean) => number
    S5Extra4: (level?: number) => number
    element6: () => number
    element24_power: () => number
    element24: () => Overlimit
    element26: () => number
    darkSoftcap: (delayOnly?: boolean) => number
    effectiveDarkEnergy: (fluid?: number) => number
    darkFluid: (post?: boolean) => number
    S6Upgrade0: () => number
    S2Strange9: (unlocked?: boolean) => number
    trueUniversesAll: () => number
    /** Self-made Universes, but only for the current Challenge */
    trueUniverses: () => number
    T0Inflation0: () => number
    TOInflation1_softcap: () => number
    T0Inflation1: () => number
    T0Inflation3: () => number
    strangeGain: (interstellar: boolean, quarks?: boolean) => number
    cosmonGain: () => number
}
