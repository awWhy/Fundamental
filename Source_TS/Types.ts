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
        unlock: boolean
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
        show: number[]
        disabled: boolean
        inputM: number
        inputS: number
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
        },
        ...Array<{
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
    researchesAuto: number[]
    ASR: number[]
    elements: number[]
    strangeness: number[][]
    milestones: number[][]
    toggles: {
        normal: boolean[]
        buildings: boolean[][]
        auto: boolean[]
        shop: {
            howMany: number
            input: number
            strict: boolean
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
    footer: boolean
    mobileDevice: boolean
    screenReader: boolean
    versionInfo: {
        build: boolean
        changed: boolean
    }
    timeSpecial: {
        lastSave: number
    }
    automatization: {
        autoU: number[][]
        autoR: number[][]
        autoE: number[][]
        elements: number[]
    }
    theme: {
        stage: number
        default: boolean
    }
    dischargeInfo: {
        updateEnergy: () => void
        energyType: number[][]
        bonus: number
        next: number
    }
    vaporizationInfo: {
        effect2U1: () => number
        effect2RE3: () => number
        get: overlimit
    }
    accretionInfo: {
        extra: number
        rankU: number[]
        rankR: number[]
        rankE: number[]
        rankCost: number[]
        rankName: string[]
        rankImage: string[]
    }
    collapseInfo: {
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
    }
    intervalsId: {
        main: number
        numbers: number
        visual: number
        autoSave: number
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
        type: Array<Array<'producing' | 'improves'>>
        firstCost: number[][]
        startCost: number[][]
        increase: number[][]
        producing: overlimit[][]
    }
    strangeInfo: {
        Element28: () => number
        gain: (stage: number) => number
        stageBoost: Array<number | null>
    }
    upgradesInfo: Array<{
        description: string[]
        effectText: Array<() => string>
        effect: Array<number | overlimit | null>
        startCost: number[]
        maxActive: number
    }>
    researchesInfo: Array<{
        description: string[]
        effectText: Array<() => string>
        effect: Array<number | overlimit | null>
        cost: number[]
        startCost: number[]
        scaling: number[]
        max: number[]
        maxActive: number
    }>
    researchesExtraInfo: Array<{
        description: string[]
        effectText: Array<() => string>
        effect: Array<number | overlimit | null>
        cost: number[]
        startCost: number[]
        scaling: number[]
        max: number[]
        maxActive: number
    }>
    researchesAutoInfo: {
        description: string[]
        effectText: Array<() => string>
        cost: number[]
        startCost: number[]
        scaling: number[]
        max: number[]
        autoStage: number[]
    }
    ASRInfo: {
        cost: number[]
        costRange: number[][]
        max: number[]
    }
    elementsInfo: {
        description: string[]
        effectText: Array<() => string>
        effect: Array<number | overlimit | null>
        startCost: number[]
    }
    strangenessInfo: Array<{
        description: string[]
        effectText: Array<() => string>
        cost: number[]
        startCost: number[]
        scaling: number[]
        max: number[]
        maxActive: number
    }>
    lastUpgrade: [boolean, number]
    lastResearch: [boolean, number, 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR']
    lastElement: [boolean, number]
    milestonesInfo: Array<{
        description: string[]
        needText: string[][]
        need: Array<Array<number | overlimit>>
        rewardText: string[]
        quarks: number[][]
        unlock: number[]
    }>
}

export type overlimit = [number, number]; //Also possible as string (~21% slower) and number
