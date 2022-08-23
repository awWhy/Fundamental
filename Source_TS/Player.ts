export const player: any = {};

function AddResource(name: string, current = 0, total = current) { //Not a class, because no
    Object.assign(player, { [name]: { current, total } });
}

function AddMainBuilding(name: string, cost: number, producing: number, amount = 0) {
    Object.assign(player, { [name]: { cost, producing, amount } });
}

/* All player additions has to be done here */
AddResource('quarks', 3);
AddResource('energy');
AddMainBuilding('particles', 3, 0.1);
AddMainBuilding('atoms', 2, 0.1);
AddMainBuilding('molecules', 3, 0.1);
Object.preventExtensions(player);
/* Don't know how to export them better */
export const { energy, quarks, particles, atoms, molecules } = player;

quarks.current = 111 ** 2; //Just a test

export const global = {
    tab: 'Stage'
};
