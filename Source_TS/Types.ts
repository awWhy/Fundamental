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
        input: number
    }
    collapse: {
        mass: number
        massMax: number
        elementsMax: overlimit
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
    events: boolean[]
}

export interface globalType {
    tab: string
    subtab: {
        stageCurrent: string
        settingsCurrent: string
        researchCurrent: string
        strangenessCurrent: string
    }
    tabList: {
        tabs: string[]
        stageSubtabs: string[]
        settingsSubtabs: string[]
        researchSubtabs: string[]
        strangenessSubtabs: string[]
    }
    debug: {
        versionBuild: boolean
        errorID: boolean
        errorQuery: boolean
        errorGain: boolean
    }
    lastActive: null | number
    lastSave: number
    footer: boolean
    mobileDevice: boolean
    screenReader: boolean[]
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
        bonus: number
        next: number
    }
    vaporizationInfo: {
        effect2U2: () => number
        oceanWorld: () => number
        cloudEffect: (post?: boolean) => overlimit
        tension: number
        stress: number
        get: overlimit
    }
    accretionInfo: {
        effective: number
        rankU: number[]
        rankR: number[]
        rankE: number[]
        rankCost: number[]
        rankName: string[]
        rankImage: string[]
    }
    collapseInfo: {
        effect4RE1: () => number
        unlockB: number[]
        unlockG: number[]
        unlockU: number[]
        unlockR: number[]
        newMass: number
        massEffect: (post?: boolean) => number
        starCheck: [number, number, number]
        starEffect: [(post?: boolean) => number, (post?: boolean) => number, (post?: boolean) => number]
        trueStars: number
    }
    inflationInfo: {
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
        buttonBackgroundColor: string[]
        buttonBorderColor: string[]
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
        Element27: () => number
        gain: (stage: number) => number
        name: string[]
        stageBoost: Array<number | null>
        instability: number
    }
    upgradesInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        effect: Array<number | overlimit | null>
        startCost: number[]
        maxActive: number
    }>
    researchesInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        effect: Array<number | overlimit | null>
        cost: number[]
        startCost: number[]
        scaling: number[]
        max: number[]
        maxActive: number
    }>
    researchesExtraInfo: Array<{
        name: string[]
        effectText: Array<() => string>
        effect: Array<number | overlimit | null>
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
        effect: Array<number | overlimit | null>
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
    lastUpgrade: number[]
    lastResearch: Array<[number, 'researches' | 'researchesExtra' | 'ASR']>
    lastElement: number
    milestonesInfo: Array<{
        name: string[]
        need: overlimit[]
        reward: number[]
        scalingOld: number[][]
        needText: Array<() => string>
        rewardText: Array<() => string>
    }>
    challengesInfo: { //Each challenge is allowed to have individual types
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

export type overlimit = [number, number]; //Also possible as String or Number
