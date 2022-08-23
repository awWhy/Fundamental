import { energy, player } from './Player';

export const eventBuyBuilding = (spend: typeof player, buy: typeof player) => {
    if (spend.current >= buy.cost) {
        spend.current -= Number(buy.cost);
        buy.amount++;
        energy.current += 1;
        energy.total += 1;
    } /* Just testing, for later, will figure out good numbers later */
    console.log(spend);
    console.log(buy);
    console.log(energy);
};
