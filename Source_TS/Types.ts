export interface playerType {
    stage: number
    discharge: Record<string, number>
    energy: Record<string, number>
    time: Record<string, number>
    buildings: Array<Record<string, number>>
    upgrades: number[]
    upgradesW: number[]
    toggles: boolean[]
}

export interface globalType {
    tab: string
    footer: boolean
    lastSave: number
    energyType: number[]
    stage: {
        word: string[]
        wordColor: string[]
    }
    theme: {
        stage: number
        default: boolean
    }
    dischargeInfo: {
        cost: number
        increase: number
    }
    intervals: Record<string, number>
    intervalsId: Record<string, number>
    buildingsCost: {
        initial: number[]
        current: number[]
        increase: number[]
    }
    upgradesInfo: {
        description: string[]
        effect: number[]
        effectText: string[][]
        cost: number[]
    }
    upgradesWInfo: {
        description: string[]
        effect: number[]
        effectText: string[][]
        cost: number[]
    }
}
