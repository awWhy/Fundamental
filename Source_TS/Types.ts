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
        peak: number
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
        input: [number, number]
        points: number[]
    }
    merge: {
        reward: [number, number, number, number]
        resets: number
        input: number
    }
    inflation: {
        tree: number[]
        vacuum: boolean
        resets: number
        time: number
        age: number
    }
    time: {
        updated: number
        started: number
        export: [number, number, number, number]
        offline: number
        online: number
        stage: number
        vacuum: number
        universe: number
    }
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
    cosmon: {
        current: number
        total: number
    }
    upgrades: number[][]
    researches: number[][]
    researchesExtra: number[][]
    researchesAuto: number[]
    ASR: number[]
    elements: number[]
    strangeness: number[][]
    milestones: number[][]
    challenges: {
        active: number | null
        super: boolean
        void: number[]
        supervoid: number[]
        voidCheck: number[]
    }
    toggles: {
        normal: boolean[]
        confirm: Array<'Safe' | 'None'>
        buildings: boolean[][]
        hover: boolean[]
        max: boolean[]
        auto: boolean[]
        shop: {
            input: number
            wait: number[]
        }
    }
    history: {
        stage: {
            best: [number, number, number, number]
            list: Array<[number, number, number, number]>
            input: [number, number]
        }
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
        errorID: boolean
        errorQuery: boolean
        errorGain: boolean
        timeLimit: boolean
        rankUpdated: number | null
        historyStage: number | null
        historyVacuum: number | null
    }
    trueActive: number
    lastSave: number
    offline: {
        active: boolean
        speed: number
        stageUpdate: null | boolean
    }
    paused: boolean
    footer: boolean
    hotkeys: {
        disabled: boolean
        shift: boolean
        ctrl: boolean
    }
    automatization: {
        autoU: number[][]
        autoR: number[][]
        autoE: number[][]
        elements: number[]
    }
    dischargeInfo: {
        energyType: number[][]
        energyStage: number[]
        energyTrue: number
        total: number
        next: number
        scaling: number
    }
    vaporizationInfo: {
        S2Research0: number
        S2Research1: number
        S2Extra1: number
        get: Overlimit
    }
    accretionInfo: {
        unlockA: number[]
        rankU: number[]
        rankR: number[]
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
        unlockB: number[]
        unlockU: number[]
        unlockR: number[]
        newMass: number
        starCheck: [number, number, number]
        trueStars: number
        pointsLoop: number
        solarCap: number
        timeUntil: number
    }
    mergeInfo: {
        unlockR: number[]
        unlockE: number[]
        checkReward: [number, number, number, number]
        galaxies: number
    }
    inflationInfo: {
        globalSpeed: number
        totalSuper: number
        instability: number
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
        strangeletsInfo: [number, number]
        quarksGain: number
    }
    upgradesInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        startCost: number[]
        maxActive: number
    }>
    researchesInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        cost: number[]
        startCost: number[]
        scaling: number[]
        max: number[]
        maxActive: number
    }>
    researchesExtraInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        cost: number[]
        startCost: number[]
        scaling: number[]
        max: number[]
        maxActive: number
    }>
    researchesAutoInfo: {
        name: string[]
        effectText: Array<() => string>
        costRange: number[][]
        max: number[]
        autoStage: number[][]
    }
    ASRInfo: {
        name: string
        effectText: () => string
        costRange: number[][]
        max: number[]
    }
    elementsInfo: {
        name: string[]
        effectText: Array<() => string>
        startCost: number[]
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
    inflationTreeInfo: {
        name: string[]
        effectText: Array<() => string>
        cost: number[]
        startCost: number[]
        scaling: number[]
        max: number[]
    }
    lastUpgrade: Array<[number | null, 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR']>
    lastElement: number | null
    lastStrangeness: [number | null, number]
    lastInflation: number | null
    lastMilestone: [number | null, number]
    lastChallenge: [number | null, number | null]
    milestonesInfo: Array<{
        name: string[]
        needText: Array<() => string>
        rewardText: Array<() => string>
        need: Overlimit[]
        time: number[]
        reward: number[]
        scaling: number[][]
        max: number[]
    }>
    milestonesInfoS6: {
        requirement: number[]
        active: boolean[]
    }
    challengesInfo: {
        name: string[]
        description: Array<() => string>
        effectText: Array<() => string>
        needText: Array<Array<Array<() => string>>>
        rewardText: string[][][]
        resetType: Array<'stage' | 'vacuum'>
        time: number[]
        color: string[]
    }
    voidRewards: [string[][], string[][]]
    historyStorage: {
        stage: Array<[number, number, number, number]>
        vacuum: Array<[number, boolean, number]>
    }
}

/* Because I am lazy to deal with missing types right now */
export interface globalSaveType {
    intervals: {
        main: number
        offline: number
        numbers: number
        visual: number
        autoSave: number
    }
    hotkeys: Record<hotkeysList, Array<string | undefined>>
    toggles: boolean[]
    format: [string, string]
    theme: null | number
    fontSize: number
    MDSettings: boolean[]
    SRSettings: boolean[]
    developerMode: boolean
}

export type hotkeysList = 'makeAll' | 'stage' | 'discharge' | 'vaporization' | 'rank' | 'collapse' | 'galaxy' | 'pause' | 'toggleAll' | 'merge' | 'universe' | 'exitChallenge' | 'tabRight' | 'tabLeft' | 'subtabUp' | 'subtabDown' | 'stageRight' | 'stageLeft';
