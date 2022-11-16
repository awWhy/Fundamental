export interface playerType {
    version: string
    fileName: string
    separator: string[]
    stage: {
        true: number
        current: number
        resets: number
        export: number
        input: number
    }
    discharge: { //Stage 1
        energyCur: number
        energyMax: number
        current: number
    }
    vaporization: { //Stage 2
        clouds: number
        input: number
    }
    accretion: { //Stage 3
        rank: number
    }
    collapse: { //Stage 4
        mass: number
        stars: [number, number, number]
        show: number
        inputM: number
        inputS: number
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
    strange: Array<{
        true: number
        total: number
    }>
    upgrades: number[]
    elements: number[]
    researches: number[]
    researchesExtra: number[]
    researchesAuto: number[]
    strangeness: number[][]
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
    tabList: Record<string, string[]>
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
        textColor: string[]
        borderColor: string[]
        priceName: string
        resourceName: string
        autoStage: number[]
    }
    automatization: {
        autoU: number[][]
        autoR: number[][]
        autoE: number[][]
    }
    theme: {
        stage: number
        default: boolean
    }
    dischargeInfo: {
        energyType: number[]
        base: number
        step: number
        next: number
    }
    vaporizationInfo: {
        get: number
    }
    accretionInfo: {
        rankU: number[]
        rankR: number[]
        rankE: number[]
        rankCost: number[]
        rankName: string[]
        rankImage: string[]
    }
    collapseInfo: {
        unlockB: number[]
        unlockU: number[]
        unlockR: number[]
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
    strangeInfo: {
        stageGain: number
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
        effect: [number, number, number, number, number, null]
        cost: number[]
        scaling: number[]
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
        scaling: number[]
        max: number[]
    }
    researchesExtraS2Info: {
        description: string[]
        effectText: string[][]
        effect: [null, ...number[]]
        cost: number[]
        scaling: number[]
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
        scaling: number[]
        max: number[]
    }
    researchesExtraS3Info: {
        description: string[]
        effectText: string[][]
        effect: [number, number, null, null]
        cost: number[]
        scaling: number[]
        max: number[]
    }
    upgradesS4Info: {
        description: string[]
        effectText: string[][]
        effect: [null, null, null, null]
        cost: number[]
    }
    elementsInfo: {
        description: string[]
        effectText: string[][]
        effect: [
            null, number, number, null, number, null, number, number, number, number,
            number, number, null, number, number, null, number, number, null, number,
            number, number, null, null, ...number[]
        ]
        cost: number[]
    }
    researchesS4Info: {
        description: string[]
        effectText: string[][]
        effect: number[]
        cost: number[]
        scaling: number[]
        max: number[]
    }
    researchesExtraS4Info: {
        description: string[]
        effectText: string[][]
        effect: [string, null]
        cost: number[]
        scaling: number[]
        max: number[]
    }
    researchesAutoInfo: {
        description: string[]
        effectText: string[][]
        effect: [null, string, number, null]
        cost: number[]
        scaling: number[]
        max: number[]
    }
    strangenessInfo: Array<{
        description: string[]
        effectText: string[][]
        effect: Array<number | string | null> //At some point will have to manually write every null/string...
        cost: number[]
        scaling: number[]
        max: number[]
    }>
    lastUpgrade: [number | null, 'upgrades', boolean]
    lastResearch: [number | null, 'researches' | 'researchesExtra' | 'researchesAuto', boolean]
}
