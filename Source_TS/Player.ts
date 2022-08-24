import { playerType } from './Types';

export const player = {} as playerType;

function AddResource(name: string, current = 0, total = current, lastUpdate = current, started = current) { //Not a class, because no
    name === 'time' ?
        Object.assign(player, { [name]: { current, lastUpdate, started } }) :
        Object.assign(player, { [name]: { current, total } });
}

function AddMainBuilding(name: string, cost: number, producing = 0, current = 0, total = current) {
    Object.assign(player, { [name]: { cost, producing, current, total } });
}

/* All player additions has to be done here */
AddResource('quarks', 3);
AddResource('energy');
AddResource('time', Date.now());
AddMainBuilding('particles', 3);
AddMainBuilding('atoms', 24);
AddMainBuilding('molecules', 3);
Object.preventExtensions(player); //This way, because I want more freedom on when to add them in

/* Don't know how to export them better */
export const { energy, quarks, time, particles, atoms, molecules } = player;

export const global = {
    tab: 'stage',
    stage: 1,
    footer: true,
    intervals: { //Numbers in ms
        main: 1000, //Only for important info (invisible one)
        numbers: 1000 /* Don't forget to change to 30 as default */
        //visual: 1000 //If will be needed
    }
};

export const { intervals, stage } = global;
