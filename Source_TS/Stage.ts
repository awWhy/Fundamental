import { getId } from './Main(OnLoad)';
import { global, player } from './Player';
import { Alert, Confirm, switchTheme } from './Special';
import { earlyRound, getUpgradeDescription, invisibleUpdate, numbersUpdate, visualUpdate } from './Update';

export const buyBuilding = (buy: Array<Record<string, number>>, index: number) => {
    const { stage, energy } = player;
    const { buildingsCost } = global;

    if (stage !== 1 && (index === 1 || index === 2)) {
        return;
    }
    if (buy[index - 1].current >= buildingsCost.current[index]) {
        buy[index - 1].current -= buildingsCost.current[index];
        buy[index].current++;
        buy[index].true++;
        buy[index].total++;
        energy.current += global.energyType[index];
        energy.total += global.energyType[index];
        calculateBuildingsCost(index);
        invisibleUpdate();
        numbersUpdate();
    }
};

export const calculateBuildingsCost = (index: number) => {
    const { buildings, upgrades } = player;
    const { buildingsCost } = global;

    if (index === 3) {
        buildingsCost.increase[3] = upgrades[4] === 1 ? 1.2 : 1.4;
    }

    if (index === 1 && upgrades[0] === 1) {
        buildingsCost.current[index] = earlyRound(buildingsCost.initial[index] / 10 * buildingsCost.increase[index] ** buildings[index].true);
    } else {
        buildingsCost.current[index] = earlyRound(buildingsCost.initial[index] * buildingsCost.increase[index] ** buildings[index].true);
    }
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

export const buyUpgrades = (upgrade: number, type = 'normal') => {
    const { energy, buildings, upgrades, upgradesW } = player;
    const { upgradesInfo, upgradesWInfo } = global;

    switch (type) {
        case 'normal':
            if (upgrades[upgrade] !== 1 && energy.current >= upgradesInfo.cost[upgrade]) {
                upgrades[upgrade] = 1;
                energy.current -= upgradesInfo.cost[upgrade];
                getId(`upgrade${upgrade + 1}`).style.backgroundColor = 'forestgreen';
                if (upgrade === 0) {
                    calculateBuildingsCost(1);
                } else if (upgrade === 3) {
                    getId('discharge').style.display = 'flex';
                } else if (upgrade === 4) {
                    calculateBuildingsCost(3);
                }
            }
            break;
        case 'water':
            if (upgradesW[upgrade] !== 1 && buildings[3].current >= upgradesWInfo.cost[upgrade]) {
                upgradesW[upgrade] = 1;
                buildings[3].current -= upgradesWInfo.cost[upgrade];
                getId(`upgradeW${upgrade + 1}`).style.backgroundColor = 'forestgreen';
            }
            break;
    }
    getUpgradeDescription(upgrade, type);
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
    const { stage, energy, buildings } = player;

    if ((energy.current >= 250 && stage === 1) || (energy.current === -1 /* Just so lint would leave me alone */ && stage === 2)) {
        let ok = true;
        if (player.toggles[1]) {
            ok = await Confirm('You\'r current progress will be reset, but you will progress further into a game. Are you sure you want to reset?');
        }
        if (ok) {
            energy.current = 0;
            if (stage === 1) {
                buildings[2].current = 3;
                buildings[3].current = 0;
                buildings[3].true = 0;
                calculateBuildingsCost(3);
            }
            player.stage++;
            getId('stageReset').textContent = 'You are not ready';
            getId('stageWord').textContent = global.stage.word[player.stage - 1];
            getId('stageWord').style.color = global.stage.wordColor[player.stage - 1];
            visualUpdate();
            numbersUpdate();
            switchTheme();
        }
    } else {
        if (stage === 1) {
            return Alert('You need more energy.');
        } else if (stage === 2) {
            return Alert('You will know when.');
        }
    }
};

export const dischargeResetCheck = async() => {
    const { energy, discharge, buildings, upgrades } = player;
    const { dischargeInfo } = global;

    if (upgrades[3] === 1) {
        let ok = true;
        if (player.toggles[2] && energy.current < dischargeInfo.cost) {
            ok = await Confirm('This will reset all of your current buildings and energy. You will NOT gain production boost. Continue?');
        }
        if (ok) {
            if (energy.current >= dischargeInfo.cost) {
                dischargeInfo.cost *= 10;
                discharge.current++;
                discharge.max++;
            }
            energy.current = 0;
            buildings[2].current = 3;
            buildings[3].current = 0;
            buildings[3].true = 0;
            calculateBuildingsCost(3);
            numbersUpdate();
        }
    }
};
