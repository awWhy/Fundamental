export interface playerType {
    version: string
    fileName: string
    separator: string[]
    stage: {
        true: number
        current: number
        active: number
        resets: number
        export: number
        best: number
        time: number
        input: number
    }
    discharge: {
        energy: number
        energyMax: number
        current: number
    }
    vaporization: {
        clouds: overlimit
        cloudsMax: overlimit
        input: number
    }
    accretion: {
        rank: number
    }
    collapse: {
        mass: number
        massMax: number
        stars: [number, number, number]
        show: number
        input: number
    }
    inflation: {
        vacuum: boolean
        age: number
    }
    intervals: {
        main: number
        numbers: number
        visual: number
        autoSave: number
    }
    time: {
        updated: number
        started: number
        offline: number
        online: number
        stage: number
        universe: number
    }
    buildings: Array<[
        {
            current: overlimit
            total: overlimit
            trueTotal: overlimit
            highest: overlimit
        }, ...Array<{
            true: number
            current: overlimit
            total: overlimit
            trueTotal: overlimit
            highest: overlimit
        }>
    ]>
    strange: Array<{
        current: number
        total: number
    }>
    upgrades: number[][]
    researches: number[][]
    researchesExtra: number[][]
    ASR: number[]
    elements: number[]
    strangeness: number[][]
    milestones: number[][]
    challenges: {
        active: number
        void: number[]
    }
    toggles: {
        normal: boolean[]
        confirm: Array<'All' | 'Safe' | 'None'>
        buildings: boolean[][]
        auto: boolean[]
        shop: {
            howMany: number
            input: number
            wait: number[]
        }
    }
    history: {
        stage: {
            best: number[]
            list: number[][]
            input: [number, number]
        }
    }
    event: boolean
}

export interface globalType {
    tab: string
    subtab: {
        stageCurrent: string
        settingsCurrent: string
        upgradeCurrent: string
        strangenessCurrent: string
    }
    tabList: {
        tabs: string[]
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
        historyUpdatedS: boolean
    }
    trueActive: number
    lastSave: number
    footer: boolean
    mobileDevice: boolean
    screenReader: boolean
    supportSettings: boolean[]
    automatization: {
        autoU: number[][]
        autoR: number[][]
        autoE: number[][]
        elements: number[]
    }
    theme: number | null
    dischargeInfo: {
        getEnergy: (index: number, stageIndex: number) => number
        energyType: number[][]
        energyTrue: number
        tritium: overlimit
        base: number
        total: number
        next: number
    }
    vaporizationInfo: {
        strength: overlimit
        dropsEff: overlimit
        tension: number
        stress: number
        research0: number
        research1: number
        get: overlimit
    }
    accretionInfo: {
        effective: number
        rankU: number[]
        rankR: number[]
        rankE: number[]
        rankCost: number[]
        rankColor: string[]
        rankName: string[]
        rankImage: string[]
    }
    collapseInfo: {
        massEffect: number
        starEffect: [number, number, number]
        unlockB: number[]
        unlockG: number[]
        unlockU: number[]
        unlockR: number[]
        newMass: number
        starCheck: [number, number, number]
        trueStars: number
    }
    inflationInfo: {
        globalSpeed: number
        preonCap: overlimit
        dustCap: overlimit
        massCap: number
        preonTrue: overlimit
        dustTrue: overlimit
    }
    intervalsId: {
        main: number | undefined
        numbers: number | undefined
        visual: number | undefined
        autoSave: number | undefined
    }
    stageInfo: {
        word: string[]
        textColor: string[]
        buttonBorder: string[]
        imageBorderColor: string[]
        priceName: string
        activeAll: number[]
    }
    buildingsInfo: {
        maxActive: number[]
        name: string[][]
        hoverText: string[][]
        type: Array<['', ...Array<'producing' | 'improving' | 'delaying'>]>
        firstCost: number[][]
        startCost: number[][]
        increase: number[][]
        producing: overlimit[][]
    }
    strangeInfo: {
        gain: (stage: number) => number
        name: string[]
        stageBoost: Array<number | null>
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
    ASRInfo: {
        cost: number[]
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
    lastUpgrade: Array<[number, 'upgrades' | 'researches' | 'researchesExtra' | 'ASR']>
    lastElement: number
    lastStrangeness: [number, number]
    milestonesInfo: Array<{
        name: string[]
        need: overlimit[]
        reward: number[]
        scalingOld: number[][]
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
        stage: number[][]
    }
}

export type overlimit = [number, number];
