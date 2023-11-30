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
        input: number
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
        input: [number, boolean]
    }
    inflation: {
        vacuum: boolean
        age: number
    }
    time: {
        updated: number
        started: number
        offline: number
        export: [number, number, number, number]
        online: number
        stage: number
        universe: number
    }
    buildings: Array<[
        {
            current: Overlimit
            total: Overlimit
            trueTotal: Overlimit
            highest: Overlimit
        }, ...Array<{
            true: number
            current: Overlimit
            total: Overlimit
            trueTotal: Overlimit
            highest: Overlimit
        }>
    ]>
    strange: Array<{
        current: number
        total: number
    }>
    upgrades: number[][]
    researches: number[][]
    researchesExtra: number[][]
    researchesAuto: number[]
    ASR: number[]
    elements: number[]
    strangeness: number[][]
    milestones: number[][]
    challenges: {
        active: number
        void: number[]
    }
    toggles: {
        confirm: Array<'All' | 'Safe' | 'None'>
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
    }
    events: boolean[]
}

export type gameTab = 'stage' | 'upgrade' | 'strangeness' | 'settings' | 'Elements';

export interface globalType {
    tab: gameTab
    subtab: {
        stageCurrent: string
        settingsCurrent: string
        upgradeCurrent: string
        strangenessCurrent: string
    }
    tabList: {
        tabs: gameTab[]
        stageSubtabs: string[]
        settingsSubtabs: string[]
        upgradeSubtabs: string[]
        strangenessSubtabs: string[]
    }
    debug: {
        errorID: boolean
        errorQuery: boolean
        errorGain: boolean
        rankUpdated: number
        historyStage: number
    }
    trueActive: number
    lastSave: number
    paused: boolean
    footer: boolean
    hotkeys: {
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
        energyTrue: number
        tritium: Overlimit
        base: number
        total: number
        next: number
    }
    vaporizationInfo: {
        strength: Overlimit
        research0: number
        research1: number
        get: Overlimit
    }
    accretionInfo: {
        unlockA: number[]
        rankU: number[]
        rankR: number[]
        rankE: number[]
        maxRank: number
        rankCost: number[]
        rankColor: string[]
        rankName: string[]
        rankImage: string[]
    }
    collapseInfo: {
        massEffect: number
        starEffect: [number, number, number]
        unlockB: number[]
        unlockU: number[]
        unlockR: number[]
        newMass: number
        starCheck: [number, number, number]
        trueStars: number
    }
    inflationInfo: {
        globalSpeed: number
        preonCap: Overlimit
        dustCap: Overlimit
        massCap: number
        preonTrue: Overlimit
        dustTrue: Overlimit
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
        activeAll: number[]
    }
    buildingsInfo: {
        maxActive: number[]
        name: string[][]
        hoverText: string[][]
        type: Array<['', ...Array<'producing' | 'improving' | 'delaying'>]>
        startCost: number[][]
        increase: number[][]
        producing: Overlimit[][]
    }
    strangeInfo: {
        name: string[]
        stageBoost: number[]
        instability: number
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
    lastUpgrade: Array<[number, 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR']>
    lastElement: number
    lastStrangeness: [number, number]
    lastMilestone: [number, number]
    lastChallenge: [number, number]
    milestonesInfo: Array<{
        name: string[]
        need: Overlimit[]
        scaling: number[][]
        needText: Array<() => string>
        rewardText: Array<() => string>
    }>
    challengesInfo: {
        name: string[]
        description: string[]
        effectText: Array<() => string>
        needText: string[][][]
        rewardText: string[][][]
        color: string[]
    }
    historyStorage: {
        stage: Array<[number, number, number, number]>
    }
}

/* Because I am lazy to deal with missing types right now */
export type nullableBoolean = boolean | undefined | null;
export interface globalSaveType {
    intervals: {
        main: number
        numbers: number
        visual: number
        autoSave: number
    }
    toggles: [boolean, boolean, ...nullableBoolean[]]
    format: [string, string]
    theme: null | number
    fontSize: number
    MDSettings: [boolean, boolean, ...nullableBoolean[]]
    SRSettings: [boolean, boolean, boolean, ...nullableBoolean[]]
    developerMode: boolean
}
