import { globalType, playerType } from './Types';

export const player = {} as playerType;

function AddResource(name: string, current = 0) { //Not a class, because no
    name === 'time' ?
        Object.assign(player, { [name]: { current, lastUpdate: current, started: current } }) :
        Object.assign(player, { [name]: { current, total: current } });
}

function AddMainBuilding(name: string, cost: number, current = 0, producing = 0) {
    Object.assign(player, { [name]: { cost, producing, current, total: current } });
}

function AddUpgradeArray(name: keyof playerType, amount: number, cost: number[], description: string[]) {
    Object.assign(player, { [name]: createArray(amount) });
    for (let i = 1; i <= amount; i++) {
        global.upgrades.description[i] = description[i - 1]; //Because Object.assign will overwrite
        global.upgrades.cost = cost;
    }
}

const createArray = (amount: number) => { //I hate TS
    const array = [];
    for (let i = 1; i <= amount; i++) {
        array.push(0);
    }
    return array;
};

export const global: globalType = {
    tab: 'stage',
    stage: 1,
    footer: true,
    intervals: {
        main: 1000, //Only for invisible important information
        numbers: 1000 //Don't forget to change to 30 as default
        //visual: 1000 //If extra will be needed
    },
    upgrades: {
        description: {},
        cost: []
    }
};

/* All player additions has to be done here */
AddResource('quarks', 3);
AddResource('energy');
AddResource('time', Date.now());
AddMainBuilding('particles', 3);
AddMainBuilding('atoms', 24);
AddMainBuilding('molecules', 3);
AddUpgradeArray('upgrades', 3, [9, 11, 99], [
    'Bigger electrons. Particles cost decreased.',
    'Stronger protons. Particles produce more.',
    'More neutrons. Increased particle gain.'
]);
Object.preventExtensions(player); //This way, because I want more freedom on when to add them in

/* Don't know how to export them better */
export const { energy, quarks, time, particles, atoms, molecules } = player;
export const { intervals, stage, upgrades } = global;
