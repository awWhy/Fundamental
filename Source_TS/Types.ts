export interface playerType {
    stage: number
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
    lastSave: number
    energyType: number[]
    stageInfo: {
        word: string[]
        wordColor: string[]
    }
    theme: {
        stage: number
        default: boolean
    }
    dischargeInfo: {
        cost: number
    }
    intervals: Record<string, number>
    intervalsId: Record<string, number>
    buildingsInfo: {
        cost: number[]
        initial: number[]
        increase: number
        producing: number[]
    }
    upgradesInfo: {
        description: string[]
        effect: Array<number | ''>
        effectText: string[][]
        cost: number[]
    }
    researchesInfo: {
        description: string[]
        effect: Array<number | ''>
        effectText: string[][]
        cost: number[]
        max: number[]
    }
    researchesAutoInfo: {
        description: string[]
        effect: Array<number | ''>
        effectText: string[][]
        cost: number[]
        max: number[]
    }
}

export interface saveType {
    player: playerType
    global: globalType
}
