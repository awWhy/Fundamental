export interface playerType {
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
    }
    time: {
        updated: number
        started: number
    }
    buildings: Array<Record<string, number>>
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
        effect: number[]
        effectText: string[][]
        cost: number[]
    }
    researchesInfo: {
        description: string[]
        effect: number[]
        effectText: string[][]
        cost: number[]
        scalling: number[]
        max: number[]
    }
    researchesAutoInfo: {
        description: string[]
        effect: Array<number | string>
        effectText: string[][]
        cost: number[]
        scalling: number[]
        max: number[]
    }
}

export interface saveType {
    player: playerType
    global: globalType
}
