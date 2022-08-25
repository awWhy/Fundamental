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
        main: 1000, //Don't forget to change to 50 as default (min 20 max 1000)
        numbers: 1000,
        visual: 1000 //Min 500 max 10000
    },
    upgrades: {
        description: {},
        cost: []
    }
};

/* All player additions has to be done here */
/* Maybe one day, I will convert it, into boring instant object */
AddResource('quarks', 3);
AddResource('energy');
AddResource('time', Date.now());
AddMainBuilding('particles', 3);
AddMainBuilding('atoms', 24);
AddMainBuilding('molecules', 3);
AddUpgradeArray('upgrades', 3, [9, 12, 20], [
    'Bigger electrons. Particles cost decreased.',
    'Stronger protons. Particles produce more.',
    'More neutrons. Increased particle gain.'
]);
Object.preventExtensions(player);
Object.preventExtensions(global);

export const { energy, quarks, time, particles, atoms, molecules } = player;
export const { intervals, upgrades } = global;
