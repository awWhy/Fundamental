export const player: any = {};

function AddResource(name: string, current = 0, total = current, started = current) { //Not a class, because no
    name === 'time' ?
        Object.assign(player, { [name]: { current, started } }) :
        Object.assign(player, { [name]: { current, total } });
}

function AddMainBuilding(name: string, cost: number, producing = 0, current = 0) {
    Object.assign(player, { [name]: { cost, producing, current } });
}

/* All player additions has to be done here */
AddResource('quarks', 3);
AddResource('energy');
AddResource('time', Date.now());
AddMainBuilding('particles', 3);
AddMainBuilding('atoms', 24);
AddMainBuilding('molecules', 3);
Object.preventExtensions(player);
/* Don't know how to export them better */
export const { energy, quarks, time, particles, atoms, molecules } = player;

export const global = {
    tab: 'stage',
    footer: true,
    intervals: { //Numbers in ms
        main: 200, //Only for important info (invisible one)
        visual: 2000
    }
};

export const { intervals } = global;

console.log(player);
console.log(global);
console.log(time);
