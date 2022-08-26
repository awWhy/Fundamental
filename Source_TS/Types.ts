/* I hate, hate, hate TS horrible need for interface; every single function has proper type, but being ignored anyway */
export interface playerType { //This is only way, I will do it
    quarks: Record<string, number>
    energy: Record<string, number>
    time: Record<string, number>
    particles: Record<string, number>
    atoms: Record<string, number>
    molecules: Record<string, number>
    upgrades: number[]
    upgradesW: number[]
}

export interface globalType { //I hate TS, can't do 'Object[dynamicProperty]' without interface
    tab: string
    stage: number
    footer: boolean
    intervals: Record<string, number>
    lastSave: number
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
