import { energy, player } from './Player';
import { visualUpdate } from './Update';

export const buyBuilding = (spend: typeof player, buy: typeof player) => {
    if (spend.current >= buy.cost) {
        spend.current -= Number(buy.cost);
        buy.current++;
        energy.current += 1;
        energy.total += 1;
        visualUpdate();
        console.log('Success purchase');
    } else { /* Just testing, for later, will figure out good numbers later */
        console.log('Not enough');
    }
};
