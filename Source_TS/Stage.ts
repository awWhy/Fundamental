import { getId } from './Main';
import { global, globalStart, player } from './Player';
import { Alert, Confirm } from './Special';
import { format, getUpgradeDescription, invisibleUpdate, numbersUpdate } from './Update';

export const buyBuilding = (buy: Array<Record<string, number>>, index: number, auto = false) => {
    const { stage, energy, researchesAuto, buyToggle } = player;
    const { energyType, buildingsInfo } = global;

    if (buy[index - 1].current < buildingsInfo.cost[index] * (auto ? 2 : 1)) {
        if (global.screenReader && !auto) {
            getId('invisibleBought').textContent = `Coudn't buy '${buildingsInfo.name[index]}', because didn't had enough of '${buildingsInfo.name[index - 1]}'`;
        }
        return;
    }

    if (stage === 1) { energyType[index] = globalStart.energyType[index] * 2 ** player.researches[4]; }
    if ((buyToggle.howMany !== 1 && researchesAuto[0] > 0) || auto) {
        let budget = buy[index - 1].current / (auto ? 2 : 1);
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
        if (stage === 1) {
            energy.current += energyType[index] * canAfford;
            energy.total += energyType[index] * canAfford;
            if (global.screenReader && !auto) {
                getId('invisibleBought').textContent = `Bought ${format(canAfford)} '${buildingsInfo.name[index]}', gained ${format(energyType[index] * canAfford)} energy`;
            }
        }
    } else if (buyToggle.howMany === 1 || researchesAuto[0] === 0) {
        buy[index - 1].current -= buildingsInfo.cost[index];
        buy[index].current++;
        buy[index].true++;
        buy[index].total++;
        if (stage === 1) {
            energy.current += energyType[index];
            energy.total += energyType[index];
            if (global.screenReader) {
                getId('invisibleBought').textContent = `Bought 1 '${buildingsInfo.name[index]}', gained ${energyType[index]} energy`;
            }
        }
    }
    calculateBuildingsCost(index);
    invisibleUpdate();
    numbersUpdate();
};

export const calculateBuildingsCost = (index: number) => {
    const { stage, buildings, upgrades, researches } = player;
    const { buildingsInfo, upgradesInfo } = global;

    if (stage === 1) {
        upgradesInfo.effect[4] = Math.trunc((0.2 + researches[0] * 0.01) * 100) / 100;
        buildingsInfo.increase = Math.trunc((1.4 - (upgrades[4] === 1 ? upgradesInfo.effect[4] : 0)) * 100) / 100;
        /* I feel like i'm losing my mind 1.4 - 0.3 = 0... But 1.4 - (0.3) = 1.1 */
    }

    buildingsInfo.cost[index] = globalStart.buildingsInfo.cost[index] * buildingsInfo.increase ** buildings[index].true;
    if (index === 1 && upgrades[0] === 1) { buildingsInfo.cost[1] /= 10; }
};

export const calculateResearchCost = (research: number, type: string) => {
    //@ts-expect-error //Not dealing with it, not my fault TS hates dynamic objects, also have no idea what type it even meant to be...
    if (player[type][research] === global[type + 'Info'].max[research]) { return; }
    //@ts-expect-error
    global[type + 'Info'].cost[research] = globalStart[type + 'Info'].cost[research] + global[type + 'Info'].scalling[research] * player[type][research];
};

export const calculateGainedBuildings = (get: number, time: number) => {
    const { stage, buildings } = player;
    const { buildingsInfo } = global;
    const before = buildings[get].current; //I think it's faster this way (?)

    if (stage === 1 && get === 3) {
        if (buildingsInfo.producing[3] <= 1) { return; } // 0 would give -infinity and 1 would give 0, so quicker to exclude
        buildings[get].current += Math.log(buildingsInfo.producing[get]) * time * 12 ** player.researches[2] * (player.upgrades[7] === 1 ? player.energy.current : 1);
    } else {
        buildings[get].current += buildingsInfo.producing[get + 1] * time;
    }

    buildings[get].total += buildings[get].current - before;
};

export const buyUpgrades = (upgrade: number, type = 'normal') => {
    const { energy, upgrades, researches, researchesAuto } = player;
    const { upgradesInfo, researchesInfo, researchesAutoInfo } = global;
    if (global.screenReader) { getUpgradeDescription(upgrade, type); }

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
            if (global.screenReader) { getId('invisibleBought').textContent = `You have bought upgrade '${upgradesInfo.description[upgrade]}'`; }
            break;
        case 'researches': {
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
            if (global.screenReader) { getId('invisibleBought').textContent = `You have researched '${researchesInfo.description[upgrade]}', level is now ${researches[upgrade]} ${researches[upgrade] === researchesInfo.max[upgrade] ? 'maxed' : ''}`; }
            break;
        }
        case 'researchesAuto': {
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
            if (global.screenReader) { getId('invisibleBought').textContent = `You have researched '${researchesAutoInfo.description[upgrade]}', level is now ${researchesAuto[upgrade]} ${researchesAuto[upgrade] === researchesAutoInfo.max[upgrade] ? 'maxed' : ''}`; }
            break;
        }
    }
    numbersUpdate();
    /* Don't know what easier to do: send precise string name or object key for each case */
    if (type.includes('researches')) { calculateResearchCost(upgrade, type); }
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
            if (global.screenReader) { toggle.ariaLabel = toggle.ariaLabel?.replace(' ON', ' OFF') ?? ''; } //I have no idea if textcontent will be read along with aria-label...
        } else {
            toggle.textContent = 'ON';
            toggle.style.borderColor = '';
            if (global.screenReader) { toggle.ariaLabel = toggle.ariaLabel?.replace(' OFF', ' ON') ?? ''; }
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
    const { stage, buildings/*, researchesAuto, toggles*/ } = player;

    if (stage === 1) {
        if (buildings[3].current >= 1e21) {
            Alert('There is nothing past stage 1 for now');
        } else {
            Alert('There are more molecules in a single drop than that you know');
        }
        /*let ok = true;
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
        }*/
    }
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
                if (global.screenReader) { getId('invisibleBought').textContent = 'Progress was reset for 4x boost'; }
            } else if (global.screenReader && energy.current < dischargeInfo.next) {
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
