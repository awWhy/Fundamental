import { getId } from './Main(OnLoad)';
import { global, player } from './Player';
import { Confirm } from './Special';
import { getUpgradeDescription, invisibleUpdate, numbersUpdate } from './Update';

export const buyBuilding = (buy: Array<Record<string, number>>, index: number) => {
    const { energy } = player;
    const { energyType, buildingsInfo, buyToggle } = global;

    if (buy[index - 1].current >= buildingsInfo.cost[index] && buyToggle.howMany !== 1) {
        let budget = buy[index - 1].current;
        let cost = buildingsInfo.cost[index];
        let total = 0;
        /* I don't know better way... I looked everywhere for formula with geometric progression, haven't found it... */
        for (var canAfford = 0; budget >= cost; canAfford++) {
            if (canAfford === buyToggle.howMany) {
                break;
            }
            total += cost;
            budget -= cost;
            cost *= buildingsInfo.increase;
        }
        if (canAfford < buyToggle.howMany && buyToggle.howMany !== -1 && buyToggle.strict) { return; }
        buy[index - 1].current -= total;
        buy[index].current += canAfford;
        buy[index].true += canAfford;
        buy[index].total += canAfford;
        energy.current += energyType[index] * canAfford;
        energy.total += energyType[index] * canAfford;
        calculateBuildingsCost(index);
        invisibleUpdate();
        numbersUpdate();
    }

    if (buy[index - 1].current >= buildingsInfo.cost[index] && buyToggle.howMany === 1) {
        buy[index - 1].current -= buildingsInfo.cost[index];
        buy[index].current++;
        buy[index].true++;
        buy[index].total++;
        energy.current += energyType[index];
        energy.total += energyType[index];
        calculateBuildingsCost(index);
        invisibleUpdate();
        numbersUpdate();
    }
};

export const calculateBuildingsCost = (index: number) => {
    const { buildings, upgrades } = player;
    const { buildingsInfo } = global;

    //if (stage === 1) {
    buildingsInfo.increase = upgrades[4] === 1 ? 1.2 : 1.4;
    //}
    buildingsInfo.cost[index] = buildingsInfo.initial[index] * buildingsInfo.increase ** buildings[index].true;
    if (index === 1 && upgrades[0] === 1) { buildingsInfo.cost[1] /= 10; }
};

export const calculateGainedBuildings = (get: number, time: number) => {
    const { buildings } = player;
    const { buildingsInfo } = global;
    const before = buildings[get].current; //I think it's faster this way (?)

    buildings[get].current += buildingsInfo.producing[get + 1] * time;
    buildings[get].total += buildings[get].current - before;
};

export const buyUpgrades = (upgrade: number, type = 'normal') => {
    const { energy, upgrades } = player;
    const { upgradesInfo } = global;

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
    }
    getUpgradeDescription(upgrade, type);
};

export const toggleSwap = (number: number, change = true) => {
    const { toggles } = player;

    if (change) {
        toggles[number] = !toggles[number];
    }
    if (toggles[number]) {
        getId(`toggle${number}`).textContent = 'ON';
        getId(`toggle${number}`).style.borderColor = '';
    } else {
        getId(`toggle${number}`).textContent = 'OFF';
        getId(`toggle${number}`).style.borderColor = 'crimson';
    }
};

export const toggleBuy = (type = 'none') => {
    const { buyToggle } = global;
    const input = getId('buyAnyInput') as HTMLInputElement;

    switch (type) {
        case '1':
            buyToggle.howMany = 1;
            break;
        case 'max':
            buyToggle.howMany = -1;
            break;
        case 'any':
            buyToggle.input = Math.max(Math.trunc(Number(input.value)), 1);
            buyToggle.howMany = buyToggle.input;
            break;
        case 'strict':
            buyToggle.strict = !buyToggle.strict;
            break;
        default:
            input.value = String(buyToggle.input);
    }
    getId('buyStrict').style.borderColor = buyToggle.strict ? '' : 'crimson';
    getId('buy1x').style.backgroundColor = buyToggle.howMany === 1 ? 'forestgreen' : '';
    getId('buyAny').style.backgroundColor = Math.abs(buyToggle.howMany) !== 1 ? 'forestgreen' : '';
    getId('buyMax').style.backgroundColor = buyToggle.howMany === -1 ? 'forestgreen' : '';
};

export const stageResetCheck = async() => {
    /*if () {
        let ok = true;
        if (player.toggles[2]) {
            ok = await Confirm('Ready to move on to the next stage?');
        }
        if (ok) {
            //No idea, for now
            player.stage++;
            getId('stageReset').textContent = 'You are not ready';
            getId('stageWord').textContent = global.stageInfo.word[player.stage - 1];
            getId('stageWord').style.color = global.stageInfo.wordColor[player.stage - 1];
            visualUpdate();
            numbersUpdate();
            switchTheme();
        }
    }*/
};

export const dischargeResetCheck = async() => {
    const { energy, discharge, buildings, upgrades } = player;
    const { dischargeInfo } = global;

    if (upgrades[3] === 1 && buildings[1].true > 0) {
        let ok = true;
        if (player.toggles[1] && energy.current < dischargeInfo.cost) {
            ok = await Confirm('This will reset all of your current buildings and energy. You will NOT gain production boost. Continue?');
        } else if (player.toggles[1] && energy.current >= dischargeInfo.cost) {
            ok = await Confirm('You have enough energy to gain boost. Continue?');
        }
        if (ok) {
            if (energy.current >= dischargeInfo.cost) {
                dischargeInfo.cost *= 10;
                discharge.current++;
            }
            energy.current = 0;
            for (let i = 0; i <= 3; i++) {
                if (i === 0) {
                    buildings[i].current = 3;
                } else {
                    buildings[i].current = 0;
                    buildings[i].true = 0;
                    calculateBuildingsCost(i);
                }
            }
            numbersUpdate();
        }
    }
};
