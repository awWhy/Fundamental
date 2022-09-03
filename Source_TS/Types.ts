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
        current: number
        updated: number
        started: number
    }
    buildings: Array<Record<string, number>>
    upgrades: number[]
    toggles: boolean[]
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
    buyToggle: {
        howMany: number
        input: number
        strict: boolean
    }
    upgradesInfo: {
        description: string[]
        effect: number[]
        effectText: string[][]
        cost: number[]
    }
}
