import { getId, reLoad } from './Main(OnLoad)';
import { global, player } from './Player';
import { Alert, Confirm } from './Special';
import { earlyRound, getUpgradeDescription, invisibleUpdate, numbersUpdate } from './Update';

export const buyBuilding = (buy: Array<Record<string, number>>, index: number) => {
    const { stage, energy } = player;

    if (stage !== 1 && (index === 1 || index === 2)) {
        return;
    }
    if (buy[index - 1].current >= buy[index].cost) {
        buy[index - 1].current -= buy[index].cost;
        buy[index].current++;
        buy[index].total++;
        buy[index].cost = earlyRound(buy[index].cost * 1.4); //Turn this into proper formula for testing
        const type = index === 1 ? 1 : index === 2 ? 5 : 20; //If too many type's will be added, might need to have better way to do it
        energy.current += type;
        energy.total += type;
        invisibleUpdate();
        numbersUpdate();
    }
};

export const buyUpgrades = (upgrade: number, type = 'normal') => {
    const { energy, buildings, upgrades, upgradesW } = player;
    const { upgradesInfo, upgradesWInfo } = global;

    switch (type) {
        case 'normal':
            if (upgrades[upgrade] === 0 && energy.current >= upgradesInfo.cost[upgrade]) {
                upgrades[upgrade] = 1;
                energy.current -= upgradesInfo.cost[upgrade];
                getId(`upgrade${upgrade + 1}`).style.backgroundColor = 'forestgreen';
                if (upgrade === 0) {
                    buildings[1].cost /= 10;
                }
            }
            break;
        case 'water':
            if (upgradesW[upgrade] === 0 && buildings[3].current >= upgradesWInfo.cost[upgrade]) {
                upgradesW[upgrade] = 1;
                buildings[3].current -= upgradesWInfo.cost[upgrade];
                getId(`upgradeW${upgrade + 1}`).style.backgroundColor = 'forestgreen';
            }
            break;
    }
    getUpgradeDescription(upgrade, type);
};

export const calculateGainedBuildings = (get: number | Record<string, number>, time: number) => {
    const { buildings } = player;
    const before = typeof get === 'number' ? buildings[get].current : get.current; //I think its fastest way (?)
    if (typeof get === 'number') {
        buildings[get].current = earlyRound(buildings[get].current + buildings[get + 1].producing * time);
        buildings[get].total = earlyRound(buildings[get].total + buildings[get].current - before);
    } else {
        get.current = earlyRound(get.current + 1 * time);
        get.total = earlyRound(get.total + get.current - before);
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
                void reLoad('reset');
            }
        } else {
            return Alert('You need more energy.');
        }
    } //else if (stage === 2) { }
};
