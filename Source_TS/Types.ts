export interface playerType {
    version: string
    stage: {
        true: number
        current: number
        resets: number
    }
    discharge: { //Stage 1
        energyCur: number
        energyMax: number
        current: number
    }
    vaporization: { //Stage 2
        clouds: number
    }
    accretion: { //Stage 3
        rank: number
    }
    collapse: { //Stage 4
        mass: number
        stars: [number, number, number]
        show: number
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
    }
    buildings: Array<Record<string, number>>
    /*buildings: [{
        current: number
        total: number
        trueTotal: number
    },
    ...{
        current: number
        true: number
        total: number
        trueTotal: number
    }[]]*/ //Why TS is so annoying - 'if (index !== 0) { buildings[index].true }': TS says: no you can't
    upgrades: number[]
    elements: number[]
    researches: number[]
    researchesExtra: number[]
    researchesAuto: number[]
    toggles: {
        normal: boolean[]
        buildings: boolean[]
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
        settingsCurrent: string
        researchCurrent: string
    }
    footer: boolean
    mobileDevice: boolean
    screenReader: boolean
    versionInfo: {
        changed: boolean
        log: string
    }
    timeSpecial: {
        lastSave: number
        maxOffline: number
    }
    stageInfo: {
        word: string[]
        priceName: string[]
        resourceName: string[]
    }
    theme: {
        stage: number
        default: boolean
    }
    dischargeInfo: {
        energyType: number[]
        next: number
    }
    vaporizationInfo: {
        get: number
    }
    accretionInfo: {
        rankCost: number[]
        rankName: string[]
        rankImage: string[]
    }
    collapseInfo: {
        unlockPriceB: number[]
        unlockPriceU: number[]
        unlockPriceR: number[]
        newMass: number
        starCheck: [number, number, number]
    }
    intervalsId: {
        main: number
        numbers: number
        visual: number
        autoSave: number
    }
    buildingsInfo: {
        name: string[]
        type: string[]
        cost: number[]
        startCost: number[]
        increase: number[]
        producing: number[]
    }
    upgradesInfo: {
        description: string[]
        effectText: string[][]
        effect: [number, number, number, number, number, number, number, null]
        cost: number[]
    }
    researchesInfo: {
        description: string[]
        effectText: string[][]
        effect: number[]
        cost: number[]
        scalling: number[]
        max: number[]
    }
    upgradesS2Info: {
        description: string[]
        effectText: string[][]
        effect: [null, null, ...number[]]
        cost: number[]
    }
    researchesS2Info: {
        description: string[]
        effectText: string[][]
        effect: [number, null, ...number[]]
        cost: number[]
        scalling: number[]
        max: number[]
    }
    researchesExtraS2Info: {
        description: string[]
        effectText: string[][]
        effect: [null, ...number[]]
        cost: number[]
        scalling: number[]
        max: number[]
    }
    upgradesS3Info: {
        description: string[]
        effectText: string[][]
        effect: [number, number, number, number, number, number, null, number, number, number, number, null]
        cost: number[]
    }
    researchesS3Info: {
        description: string[]
        effectText: string[][]
        effect: number[]
        cost: number[]
        scalling: number[]
        max: number[]
    }
    researchesExtraS3Info: {
        description: string[]
        effectText: string[][]
        effect: [number, number, null, null]
        cost: number[]
        scalling: number[]
        max: number[]
    }
    upgradesS4Info: {
        description: string[]
        effectText: string[][]
        effect: [null, null, null, ...number[]]
        cost: number[]
    }
    elementsInfo: {
        description: string[]
        effectText: string[][]
        effect: [
            null, number, number, null, number, null, number, number, number, number,
            number, number, null, number, number, null, number, number, null, number,
            number, number, null, null, number, number, null
        ]
        cost: number[]
    }
    researchesS4Info: {
        description: string[]
        effectText: string[][]
        effect: number[]
        cost: number[]
        scalling: number[]
        max: number[]
    }
    researchesExtraS4Info: {
        description: string[]
        effectText: string[][]
        effect: [string, ...number[]]
        cost: number[]
        scalling: number[]
        max: number[]
    }
    researchesAutoInfo: {
        description: string[]
        effectText: string[][]
        effect: [null, string, ...number[]]
        cost: number[]
        scalling: number[]
        max: number[]
    }
    lastUpgrade: [number | null, 'upgrades', boolean]
    lastResearch: [number | null, 'researches' | 'researchesExtra' | 'researchesAuto', boolean]
}
