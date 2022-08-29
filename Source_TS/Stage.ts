import { getId, reLoad } from './Main(OnLoad)';
import { global, player } from './Player';
import { Alert, Confirm } from './Special';
import { earlyRound, getUpgradeDescription, invisibleUpdate, numbersUpdate } from './Update';

export const buyBuilding = (spend: Record<string, number>, buy: Record<string, number>) => {
    const { stage, energy, particles, atoms } = player;

    if (stage !== 1 && (buy === particles || buy === atoms)) {
        return;
    }
    if (spend.current >= buy.cost) {
        spend.current -= buy.cost;
        buy.current++;
        buy.total++;
        buy.cost = earlyRound(buy.cost * 1.4); //Turn this into proper formula for testing
        const type = buy === particles ? 1 : buy === atoms ? 5 : 20; //If too many type's will be added, might need to have better way to do it
        energy.current += type;
        energy.total += type;
        invisibleUpdate();
        numbersUpdate();
    }
};

export const buyUpgrades = (upgrade: number, type = 'normal') => {
    const { energy, particles, molecules, upgrades, upgradesW } = player;
    const { upgradesInfo, upgradesWInfo } = global;

    switch (type) {
        case 'normal':
            if (upgrades[upgrade - 1] === 0 && energy.current >= upgradesInfo.cost[upgrade - 1]) {
                upgrades[upgrade - 1] = 1;
                energy.current -= upgradesInfo.cost[upgrade - 1];
                getId(`upgrade${upgrade}`).style.backgroundColor = 'forestgreen';
                if (upgrade - 1 === 0) {
                    particles.cost /= 10;
                }
            }
            break;
        case 'water':
            if (upgradesW[upgrade - 1] === 0 && molecules.current >= upgradesWInfo.cost[upgrade - 1]) {
                upgradesW[upgrade - 1] = 1;
                molecules.current -= upgradesWInfo.cost[upgrade - 1];
                getId(`upgradeW${upgrade}`).style.backgroundColor = 'forestgreen';
            }
            break;
    }
    getUpgradeDescription(upgrade, type);
};

export const calculateGainedBuildings = (type: Record<string, number>, higherType: Record<string, number>, time = 0) => {
    const before = type.current; //I think its fastest way (?)
    if (type !== higherType) {
        type.current = earlyRound(type.current + higherType.producing * time);
        type.total = earlyRound(type.total + type.current - before);
    } else {
        type.current = earlyRound(type.current + 1 * time);
        type.total = earlyRound(type.total + type.current - before);
    }
};

export const toggleSwap = (number: number, change = true) => {
    if (change) {
        player.toggles[number] = !player.toggles[number];
    }
    if (player.toggles[number]) {
        getId(`toggle${number}`).textContent = 'ON';
        getId(`toggle${number}`).style.borderColor = '';
    } else {
        getId(`toggle${number}`).textContent = 'OFF';
        getId(`toggle${number}`).style.borderColor = 'crimson';
    }
};

export const stageResetCheck = async() => {
    const { stage, energy } = player;

    if (stage === 1) {
        if (energy.current >= 250) {
            const ok = await Confirm('You\'r current progress will be reset, but you will progress further into a game. Are you sure you want to reset?');
            if (ok) {
                energy.current -= 250;
                player.stage = 2;
                void reLoad();
            }
        } else {
            return Alert('You need more energy.');
        }
    } //else if (stage === 2) { }
};
