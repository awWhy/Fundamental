import { getId } from './Main(OnLoad)';
import { atoms, energy, particles, player, time, upgrades } from './Player';
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

export const buyUpgrades = (upgrade: number) => {
    if (player.upgrades[upgrade - 1] === 0 && energy.current >= upgrades.cost[upgrade - 1]) {
        player.upgrades[upgrade - 1] = 1;
        energy.current -= upgrades.cost[upgrade - 1];
        getId(`upgrade${upgrade}`).style.backgroundColor = 'forestgreen';
        if (upgrade - 1 === 0) {
            particles.cost /= 10;
        }
    }
};

export const getPassedTime = () => {
    time.current = Date.now();
    const passedTime = (time.current - time.lastUpdate) / 1000;
    time.lastUpdate = Date.now();
    return passedTime;
};

export const stageResetCheck = () => {
    //Later
};
