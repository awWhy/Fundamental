/* I hate, hate, hate ts horrible need for interface; every single function has proper type, but being ignored anyway */
export interface playerType { //This is only way, I will do it
    quarks: Record<string, number>
    energy: Record<string, number>
    time: Record<string, number>
    particles: Record<string, number>
    atoms: Record<string, number>
    molecules: Record<string, number>
}
