import { player } from './Player';

export const eventBuyBuilding = (spend: typeof player, buy: typeof player) => {
    if (spend.current >= buy.cost) {
        spend.current -= Number(buy.cost);
        buy.amount++;
    } /* Just testing, for later */
    console.log(spend);
    console.log(buy);
};
