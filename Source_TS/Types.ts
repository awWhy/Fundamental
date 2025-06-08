import type Overlimit from './Limit';

export interface playerType {
    version: string
    fileName: string
    stage: {
        true: number
        current: number
        active: number
        resets: number
        time: number
        /** Interstellar only */
        peak: number
        /** Interstellar only */
        peakedAt: number
        input: [number, number]
    }
    discharge: {
        energy: number
        energyMax: number
        current: number
    }
    vaporization: {
        clouds: Overlimit
        cloudsMax: Overlimit
        /** [Boost, max] */
        input: [number, number]
    }
    accretion: {
        rank: number
    }
    collapse: {
        mass: number
        massMax: number
        stars: [number, number, number]
        show: number
        maxElement: number
        /** [Boost, wait] */
        input: [number, number]
        points: number[]
    }
    merge: {
        rewards: [number, number, number, number]
        resets: number
        /** [Min Galaxies, time since last Galaxy] */
        input: [number, number]
        /** How much real time passed since last Galaxy */
        since: number
    }
    inflation: {
        loadouts: Record<string, number[]>
        vacuum: boolean
        resets: number
        time: number
        age: number
    }
    time: {
        updated: number
        started: number
        /** [Milliseconds, Strange quarks, Strangelets] */
        export: [number, number, number]
        /** In milliseconds */
        offline: number
        /** In milliseconds */
        online: number
        stage: number
        vacuum: number
        universe: number
    }
    /** .true is how many are self-made \
     * .current is how many are right now \
     * .total is how many was produced this reset \
     * .trueTotal is how many was produced this Stage
     */
    buildings: Array<[
        {
            current: Overlimit
            total: Overlimit
            trueTotal: Overlimit
        }, ...Array<{
            true: number
            current: Overlimit
            total: Overlimit
            trueTotal: Overlimit
        }>
    ]>
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
        super: boolean
        void: number[]
        /** Highest Void reward ever unlocked */
        voidCheck: number[]
        supervoid: number[]
        /** Supervoid progress in the current Universe */
        supervoidMax: number[]
        stability: number
    }
    toggles: {
        /** Auto Stage switch[0], Auto disable Vaporization[1], Auto disable Stage[2], Automatic leave[3],
           Auto accept Offline[4] */
        normal: boolean[]
        /** Stage[0], Discharge[1], Vaporization[2], Rank[3], Collapse[4], Merge[5] */
        confirm: Array<'Safe' | 'None'>
        /** Toggle all[0], Toggle Structure[any] */
        buildings: boolean[][]
        /** Upgrades/Researches/Elements[0] */
        hover: boolean[]
        /** Researches[0] */
        max: boolean[]
        /** Stage[0], Discharge[1], Vaporization[2], Rank[3], Collapse[4],
           Upgrades[5], Researches[6], ResearchesExtra[7], Elements[8], Merge[9] */
        auto: boolean[]
        shop: {
            input: number
            wait: number[]
        }
    }
    history: {
        /** [time, quarks, strangelets] */
        stage: {
            best: [number, number, number]
            list: Array<[number, number, number]>
            input: [number, number]
        }
        /** [time, state, inflatons] */
        vacuum: {
            best: [number, boolean, number]
            list: Array<[number, boolean, number]>
            input: [number, number]
        }
    }
    event: boolean
    clone: {
        depth?: 'stage' | 'vacuum'
        [key: string]: any
    }
}

export type gameTab = 'stage' | 'upgrade' | 'Elements' | 'strangeness' | 'inflation' | 'settings';

export interface globalType {
    tab: gameTab
    subtab: {
        stageCurrent: string
        settingsCurrent: string
        upgradeCurrent: string
        ElementsCurrent: never
        strangenessCurrent: string
        inflationCurrent: string
    }
    tabList: {
        tabs: gameTab[]
        stageSubtabs: string[]
        settingsSubtabs: string[]
        upgradeSubtabs: string[]
        ElementsSubtabs: never[]
        strangenessSubtabs: string[]
        inflationSubtabs: string[]
    }
    debug: {
        /** Notify about reaching time limit */
        timeLimit: boolean
        /** Which Rank is displayed */
        rankUpdated: number | null
        /** How many resets on last update */
        historyStage: number | null
        /** How many resets on last update */
        historyVacuum: number | null
        /** (Phones only) What page for Strangeness is selected */
        MDStrangePage: number
    }
    trueActive: number
    /** In milliseconds */
    lastSave: number
    offline: {
        active: boolean
        speed: number
        start: number
        cacheUpdate: boolean
        stageUpdate: null | boolean
    }
    paused: boolean
    log: {
        /** ['Text', count, time] */
        add: Array<[string, number, number]>
        /** Last added HTML into list, ['Text', count, time, changed] */
        lastHTML: [string, number, number, boolean]
    }
    hotkeys: {
        disabled: boolean
        /** Used to test if focus was received through keyboard press */
        tab: boolean
        shift: boolean
        ctrl: boolean
    }
    lastUpgrade: Array<[number | null, 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR']>
    lastElement: number | null
    lastStrangeness: [number | null, number]
    lastInflation: [number | null, number]
    lastMilestone: [number | null, number]
    lastChallenge: [number, number]
    /** Void reward type[0], Strangeness shown[1] */
    sessionToggles: boolean[]
    /** Sorted cheapest first */
    automatization: {
        /** Upgrades */
        autoU: number[][]
        /** Researches */
        autoR: number[][]
        /** /Researches Extra */
        autoE: number[][]
        elements: number[]
    }
    dischargeInfo: {
        energyType: number[][]
        energyStage: number[]
        energyTrue: number
        next: number
        total: number
        base: number
    }
    vaporizationInfo: {
        S2Research0: number
        S2Research1: number
        S2Extra1: number
        get: Overlimit
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
        timeUntil: number
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
        /** In the current Universe */
        totalSuper: number
    }
    intervalsId: {
        main: number | undefined
        numbers: number | undefined
        visual: number | undefined
        autoSave: number | undefined
        mouseRepeat: number | undefined
    }
    stageInfo: {
        word: string[]
        textColor: string[]
        buttonBorder: string[]
        imageBorderColor: string[]
        costName: string[]
        activeAll: number[]
    }
    buildingsInfo: {
        /** Counts index [0] */
        maxActive: number[]
        name: string[][]
        hoverText: string[][]
        type: Array<Array<'producing' | 'improving' | 'delaying'>>
        startCost: number[][]
        increase: number[][]
        producing: Overlimit[][]
    }
    strangeInfo: {
        name: string[]
        stageBoost: number[]
        /** [Producing, Improving] */
        strangeletsInfo: [number, number]
        quarksGain: number
    }
    upgradesInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        /** Number for Stage 1, Overlimit for rest */
        startCost: number[] | Overlimit[]
        maxActive: number
    }>
    researchesInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        /** Number for Stage 1, Overlimit for rest */
        cost: number[] | Overlimit[]
        /** Number for Stage 1, Overlimit for rest */
        startCost: number[] | Overlimit[]
        /** Never string for Stage 1, for others should be saved as string only if above 1e308 (or at least 1e16) */
        scaling: Array<number | string>
        max: number[]
        maxActive: number
    }>
    researchesExtraInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        /** Number for Stage 1, Overlimit for rest */
        cost: number[] | Overlimit[]
        /** Number for Stage 1, Overlimit for rest */
        startCost: number[] | Overlimit[]
        /** Never string for Stage 1, for others should be saved as string only if above 1e308 (or at least 1e16) */
        scaling: Array<number | string>
        max: number[]
        maxActive: number
    }>
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
        startCost: Overlimit[]
    }
    strangenessInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        cost: number[]
        startCost: number[]
        scaling: number[]
        max: number[]
        maxActive: number
    }>
    /** Inflation tree */
    treeInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        cost: number[]
        startCost: number[]
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
    }]
    historyStorage: {
        stage: Array<[number, number, number]>
        vacuum: Array<[number, boolean, number]>
    }
    loadouts: {
        input: number[]
        buttons: Record<string, {
            html: HTMLElement
            event: () => void
        }>
    }
}

export interface globalSaveType {
    intervals: {
        offline: number
        numbers: number
        visual: number
        autoSave: number
    }
    /** hotkeyFunction: [key, code] */
    hotkeys: Record<hotkeysList, Array<string | undefined>>
    /** Hotkeys type[0], Elements as tab[1], Allow text selection[2], Footer on top[3], Hide global stats[4] */
    toggles: boolean[]
    /** Point[0], Separator[1] */
    format: [string, string]
    theme: null | number
    fontSize: number
    /** Status[0], Mouse events[1], Enable zoom[2] */
    MDSettings: boolean[]
    /** Status[0], Tabindex Upgrades[1], Tabindex primary[2] */
    SRSettings: boolean[]
    developerMode: boolean
}

export type hotkeysList = 'makeAll' | 'stage' | 'discharge' | 'vaporization' | 'rank' | 'collapse' | 'galaxy' | 'pause' | 'toggleAll' | 'merge' | 'universe' | 'exitChallenge' | 'tabRight' | 'tabLeft' | 'subtabUp' | 'subtabDown' | 'stageRight' | 'stageLeft';

export interface calculateEffectsType {
    effectiveEnergy: () => number
    effectiveGoals: () => number
    dischargeScaling: (S1Research3?: number, S1Strange2?: number) => number
    dischargeCost: (scaling?: number) => number
    dischargeBase: (S1research4?: number) => number
    /** Result need to be divided by 100 */
    S1Upgrade6: () => number
    S1Upgrade7: (preons?: boolean) => number
    S1Upgrade9: () => number
    S1Research2: (level?: number) => number
    S1Research5: () => number
    S1Extra1: (level?: number) => number
    S1Extra3: (level?: number) => number
    S1Extra4: (S1Research5?: number) => number
    /** laterPreons are calculateEffects.effectiveEnergy() ** calculateEffects.S1Extra3() */
    preonsHardcap: (laterPreons: number) => number
    clouds: (post?: boolean) => Overlimit
    cloudsGain: () => number
    S2Upgrade1: () => Overlimit
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
    effectiveRank: () => number
    S3Upgrade0: () => number
    S3Upgrade1_power: (S3Research3?: number) => number
    S3Upgrade1: (power?: number) => number
    S3Upgrade3: () => number
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
    mergeRequirement: (stability?: boolean) => number
    mergeMaxResets: () => number
    reward: Array<(post?: boolean) => number>
    mergeScore: (post?: boolean) => number
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
    S2Strange9: () => number
    S5Strange9_stage1: () => number
    S5Strange9_stage2: () => number
    S5Strange9_stage3: () => number
    T0Inflation0: () => number
    T0Inflation1_power: (level?: number) => number
    T0Inflation1: (power?: number) => number
    T0Inflation3: () => number
    T0Inflation5: (level?: number) => number
    /** Default value for type is 0 or Quarks; Use 1 for Strangelets */
    strangeGain: (interstellar: boolean, type?: 0 | 1) => number
}
