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
        input: number
    }
    discharge: { //Stage 1
        energy: number
        energyMax: number
        current: number
    }
    vaporization: { //Stage 2
        clouds: number
        cloudsMax: number
        input: number
    }
    accretion: { //Stage 3
        rank: number
    }
    collapse: { //Stage 4
        mass: number
        massMax: number
        elementsMax: number
        stars: [number, number, number]
        show: number[]
        disabled: boolean
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
    buildings: Array<Array<Record<string, number>>>
    strange: Array<{
        true: number
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
        changed: boolean
        log: string
    }
    timeSpecial: {
        lastSave: number
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
        unlockG: number[]
        unlockU: number[]
        unlockR: number[]
        newMass: number
        starCheck: [number, number, number]
        trueStars: number
    }
    intervalsId: {
        main: number
        numbers: number
        visual: number
        autoSave: number
    }
    buildingsInfo: {
        name: string[][]
        type: Array<Array<'producing' | 'improves' | ''>>
        firstCost: number[][]
        startCost: number[][]
        increase: number[][]
        producing: number[][]
        cost: number[][]
    }
    strangeInfo: {
        stageGain: number
        extraGain: number
        stageBoost: Array<number | null>
    }
    upgradesInfo: Array<{
        description: string[]
        effectText: string[][]
        effect: Array<number | null>
        startCost: number[]
        cost: number[]
    }>
    researchesInfo: Array<{
        description: string[]
        effectText: string[][]
        effect: Array<number | null | string>
        startCost: number[]
        scaling: number[]
        max: number[]
        cost: number[]
    }>
    researchesExtraInfo: Array<{
        description: string[]
        effectText: string[][]
        effect: Array<number | null | string>
        startCost: number[]
        scaling: number[]
        max: number[]
        cost: number[]
    }>
    researchesAutoInfo: {
        description: string[]
        effectText: string[][]
        effect: null[]
        startCost: number[]
        scaling: number[]
        max: number[]
        autoStage: number[]
        cost: number[]
    }
    ASRInfo: {
        cost: number[]
        costRange: number[][]
        max: number[]
    }
    elementsInfo: {
        description: string[]
        effectText: string[][]
        effect: Array<number | null>
        startCost: number[]
        cost: number[]
    }
    strangenessInfo: Array<{
        description: string[]
        effectText: string[][]
        effect: Array<number | string | null>
        startCost: number[]
        scaling: number[]
        max: number[]
        cost: number[]
    }>
    lastUpgrade: [number, boolean]
    lastResearch: [number, boolean, 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR']
    lastElement: [number, boolean]
    milestonesInfo: Array<{
        description: string[]
        needText: string[][]
        need: number[][]
        rewardText: string[]
        quarks: number[][]
        unlock: number[]
    }>
}

export interface ListOfHTML {
    longestBuilding: number
    buildingHTML: string[][][]
    longestUpgrade: number
    upgradeHTML: string[][][]
    longestResearch: number
    researchHTML: string[][][]
    longestResearchExtra: number
    researchExtraDivHTML: string[][]
    researchExtraHTML: string[][][]
}
