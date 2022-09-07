import { getId } from './Main(OnLoad)';
import { global, player } from './Player';
import { Confirm } from './Special';
import { format, getUpgradeDescription, invisibleUpdate, numbersUpdate } from './Update';

export const buyBuilding = (buy: Array<Record<string, number>>, index: number, auto = false) => {
    const { energy, researchesAuto, buyToggle } = player;
    const { screenReader, energyType, buildingsInfo } = global;

    if (buy[index - 1].current < buildingsInfo.cost[index]) {
        if (screenReader.isOn && !auto) {
            getId('invisibleBought').textContent = `Coudn't buy '${screenReader.building[index]}', because didn't had enough of '${screenReader.building[index - 1]}'`;
        }
        return;
    }

    if ((buyToggle.howMany !== 1 && researchesAuto[0] > 0) || auto) {
        let budget = buy[index - 1].current;
        let cost = buildingsInfo.cost[index];
        let total = 0;
        const howMany = auto ? -1 : buyToggle.howMany;
        /* I don't know better way... I looked everywhere for formula with geometric progression, haven't found it... */
        for (var canAfford = 0; budget >= cost; canAfford++) {
            if (canAfford === howMany) { break; }
            total += cost;
            budget -= cost;
            cost *= buildingsInfo.increase;
        }
        if (canAfford < howMany && howMany !== -1 && buyToggle.strict) { return; }
        buy[index - 1].current -= total;
        buy[index].current += canAfford;
        buy[index].true += canAfford;
        buy[index].total += canAfford;
        energy.current += energyType[index] * canAfford;
        energy.total += energyType[index] * canAfford;
        if (screenReader.isOn && !auto) {
            getId('invisibleBought').textContent = `Bought ${format(canAfford)} '${screenReader.building[index]}', gained ${format(energyType[index] * canAfford)} energy`;
        }
    } else if (buyToggle.howMany === 1 || researchesAuto[0] === 0) {
        buy[index - 1].current -= buildingsInfo.cost[index];
        buy[index].current++;
        buy[index].true++;
        buy[index].total++;
        energy.current += energyType[index];
        energy.total += energyType[index];
        if (screenReader.isOn) {
            getId('invisibleBought').textContent = `Bought 1 '${screenReader.building[index]}', gained ${energyType[index]} energy`;
        }
    }
    calculateBuildingsCost(index);
    invisibleUpdate();
    numbersUpdate();
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
    const { energy, upgrades, researches, researchesAuto } = player;
    const { upgradesInfo, researchesInfo, researchesAutoInfo } = global;

    switch (type) {
        case 'normal':
            if (upgrades[upgrade] === 1 || energy.current < upgradesInfo.cost[upgrade]) { return; }

            upgrades[upgrade] = 1;
            energy.current -= upgradesInfo.cost[upgrade];
            getId(`upgrade${upgrade + 1}`).style.backgroundColor = 'green';
            /* Some upgrades effects better to be done instanly */
            if (upgrade === 0) {
                calculateBuildingsCost(1);
            } else if (upgrade === 3) {
                getId('discharge').style.display = '';
            } else if (upgrade === 4) {
                for (let i = 1; i <= 3; i++) {
                    calculateBuildingsCost(i);
                }
            }
            if (global.screenReader.isOn) { getId('invisibleBought').textContent = `You have bought upgrade '${upgradesInfo.description[upgrade]}'`; }
            break;
        case 'research': {
            if (researches[upgrade] === researchesInfo.max[upgrade] || energy.current < researchesInfo.cost[upgrade]) { return; }

            const researchNumber = getId(`research${upgrade + 1}Stage1Level`);
            researches[upgrade]++;
            energy.current -= researchesInfo.cost[upgrade];
            researchNumber.textContent = String(researches[upgrade]);
            if (researches[upgrade] !== researchesInfo.max[upgrade]) {
                researchNumber.classList.replace('redText', 'orchidText');
            } else {
                researchNumber.classList.remove('redText', 'orchidText');
                researchNumber.classList.add('greenText');
            }
            if (upgrade === 0) {
                for (let i = 1; i <= 3; i++) {
                    calculateBuildingsCost(i);
                }
            }
            if (global.screenReader.isOn) { getId('invisibleBought').textContent = `You have researched '${researchesInfo.description[upgrade]}', level is now ${researches[upgrade]} ${researches[upgrade] === researchesInfo.max[upgrade] ? 'maxed' : ''}`; }
            break;
        }
        case 'researchAuto': {
            if (researchesAuto[upgrade] === researchesAutoInfo.max[upgrade] || energy.current < researchesAutoInfo.cost[upgrade]) { return; }

            const researchNumber = getId(`researchAuto${upgrade + 1}Level`);
            researchesAuto[upgrade]++;
            energy.current -= researchesAutoInfo.cost[upgrade];
            researchNumber.textContent = String(researchesAuto[upgrade]);
            if (researchesAuto[upgrade] !== researchesAutoInfo.max[upgrade]) {
                researchNumber.classList.replace('redText', 'orchidText');
            } else {
                researchNumber.classList.remove('redText', 'orchidText');
                researchNumber.classList.add('greenText');
            }
            if (global.screenReader.isOn) { getId('invisibleBought').textContent = `You have researched '${researchesAutoInfo.description[upgrade]}', level is now ${researchesAuto[upgrade]} ${researchesAuto[upgrade] === researchesAutoInfo.max[upgrade] ? 'maxed' : ''}`; }
            break;
        }
    }
    numbersUpdate();
    getUpgradeDescription(upgrade, type);
};

export const toggleSwap = (number: number, change = true) => {
    const { toggles } = player;
    const toggle = getId(`toggle${number}`);

    if (change) { toggles[number] = !toggles[number]; }

    if (toggle.classList.contains('auto')) {
        if (!toggles[number]) {
            toggle.textContent = 'Auto OFF';
            toggle.style.borderColor = 'crimson';
        } else {
            toggle.textContent = 'Auto ON';
            toggle.style.borderColor = '';
        }
    } else {
        if (!toggles[number]) {
            toggle.textContent = 'OFF';
            toggle.style.borderColor = 'crimson';
        } else {
            toggle.textContent = 'ON';
            toggle.style.borderColor = '';
        }
    }
};

export const toggleBuy = (type = 'none') => {
    const { buyToggle } = player;
    const input = getId('buyAnyInput') as HTMLInputElement;

    switch (type) {
        case '1':
            buyToggle.howMany = 1;
            break;
        case 'max':
            buyToggle.howMany = -1;
            break;
        case 'any':
            buyToggle.input = Math.max(Math.trunc(Number(input.value)), -1);
            if (buyToggle.input === 0) { buyToggle.input = 1; }
            buyToggle.howMany = buyToggle.input;
            //input.value = String(buyToggle.input); //See below
            break;
        case 'strict':
            buyToggle.strict = !buyToggle.strict;
            break;
        default:
            input.value = String(buyToggle.input);
            /* No idea how to deal with 1e1 being turned into 10... Also for big numbers '+e' instead of 'e' ...*/
    }
    getId('buyStrict').style.borderColor = buyToggle.strict ? '' : 'crimson';
    getId('buy1x').style.backgroundColor = buyToggle.howMany === 1 ? 'green' : '';
    getId('buyAny').style.backgroundColor = Math.abs(buyToggle.howMany) !== 1 ? 'green' : '';
    getId('buyMax').style.backgroundColor = buyToggle.howMany === -1 ? 'green' : '';
};

export const stageResetCheck = async() => {
    /*const { researchesAuto, toggles } = player;

    if () {
        let ok = true;
        if (toggles[2]) {
            ok = await Confirm('Ready to enter next stage?');
        }
        if (ok) {
            player.stage++;
            //Reuse buildings, upgrades, researches, (not toggles) if challenge's will be added, just add own category for them
            //Reset them all (not automatization), like with a new function reset(type: string);
            if (researchesAuto[0] === 0) {
                researchesAuto[0]++;
            }
            stageCheck();
            switchTheme();
        }
    }*/
};

export const dischargeResetCheck = async() => {
    const { energy, discharge, buildings, upgrades, toggles } = player;
    const { dischargeInfo } = global;

    if (upgrades[3] === 1 && buildings[1].true > 0) {
        let ok = true;
        if (toggles[1] && energy.current < dischargeInfo.next) {
            ok = await Confirm('This will reset all of your current buildings and energy. You will NOT gain production boost. Continue?');
        } else if (toggles[1] && energy.current >= dischargeInfo.next) {
            ok = await Confirm('You have enough energy to gain boost. Continue?');
        }
        if (ok) {
            if (energy.current >= dischargeInfo.next) {
                dischargeInfo.next *= 10;
                discharge.current++;
                if (global.screenReader.isOn) { getId('invisibleBought').textContent = 'Progress was reset for 4x boost'; }
            } else if (global.screenReader.isOn && energy.current < dischargeInfo.next) {
                getId('invisibleBought').textContent = 'Buildings and energy were reset, no boost';
            }
            /* Maybe move into new function reset(type: string); */
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
