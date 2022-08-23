export const player: any = {};

function AddResource(name: string, current = 0, total = current, started = current) { //Not a class, because no
    name === 'time' ?
        Object.assign(player, { [name]: { current, started } }) :
        Object.assign(player, { [name]: { current, total } });
}

function AddMainBuilding(name: string, cost: number, producing: number, amount = 0) {
    Object.assign(player, { [name]: { cost, producing, amount } });
}

/* All player additions has to be done here */
AddResource('quarks', 3);
AddResource('energy');
AddResource('time', Date.now());
AddMainBuilding('particles', 3, 0.1);
AddMainBuilding('atoms', 24, 0.1);
AddMainBuilding('molecules', 3, 0.1);
Object.preventExtensions(player);
/* Don't know how to export them better */
export const { energy, quarks, time, particles, atoms, molecules } = player;

export const global = {
    tab: 'Stage',
    intervals: { //Numbers in ms
        visual: 100
    }
};

export const { intervals } = global;
