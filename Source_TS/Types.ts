export interface playerType {
    //version: number
    stage: {
        true: number
        current: number
    }
    energy: {
        current: number
        total: number
    }
    discharge: {
        current: number
        bonus: number
    }
    time: {
        updated: number
        started: number
    }
    buildings: Array<Record<string, number>> //It will stay in this way because TS can't tell that index 0 is never being used with 'true'...
    upgrades: number[]
    researches: number[]
    researchesAuto: number[]
    toggles: boolean[]
    buyToggle: {
        howMany: number
        input: number
        strict: boolean
    }
}

export interface globalType {
    tab: string
    footer: boolean
    screenReader: boolean
    lastSave: number
    energyType: number[]
    stageInfo: {
        word: string[]
        resourceName: string[]
    }
    theme: {
        stage: number
        default: boolean
    }
    dischargeInfo: {
        next: number
    }
    intervals: {
        main: number
        numbers: number
        visual: number
        autoSave: number
    }
    intervalsId: {
        main: number
        numbers: number
        visual: number
        autoSave: number
    }
    buildingsInfo: {
        name: string[]
        cost: number[]
        increase: number
        producing: number[]
    }
    upgradesInfo: {
        description: string[]
        effectText: string[][]
        effect: number[]
        cost: number[]
    }
    upgradesS2Info: {
        description: string[]
        effectText: string[][]
        effect: number[]
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
    researchesS2Info: {
        description: string[]
        effectText: string[][]
        effect: number[]
        cost: number[]
        scalling: number[]
        max: number[]
    }
    researchesAutoInfo: {
        description: string[]
        effectText: string[][]
        effect: Array<number | string>
        cost: number[]
        scalling: number[]
        max: number[]
    }
}

export interface saveType {
    player: playerType
    global: globalType
}
