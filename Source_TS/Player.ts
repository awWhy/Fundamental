export const player = [{}/*Energy: {
    current: 0,
    total: 0
},*/
];

class MainBuilding {
    cost: number; //I don't like TS
    producing: number;
    amount: number;
    constructor(cost: number, producing: number, amount = 0) {
        this.cost = cost;
        this.producing = producing;
        this.amount = amount;
    }
}
const Atoms = new MainBuilding(2, 1)
player.push(Atoms, );

export const global = {
    
}
console.log(player)