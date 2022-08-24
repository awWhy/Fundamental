import { atoms, energy, particles } from './Player';
import { earlyRound, visualUpdate } from './Update';

export const buyBuilding = (spend: Record<string, number>, buy: Record<string, number>) => {
    if (spend.current >= buy.cost) {
        spend.current -= buy.cost;
        buy.current++;
        buy.total++;
        buy.cost = earlyRound(buy.cost * 1.4);
        const type = buy === particles ? 1 : buy === atoms ? 5 : 20;
        energy.current += type;
        energy.total += type;
        visualUpdate();
    }
};
