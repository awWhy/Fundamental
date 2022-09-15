import { getId } from './Main';
import { global, globalStart, player } from './Player';
import { reset } from './Reset';
import { Alert, Confirm } from './Special';
import { format, getUpgradeDescription, invisibleUpdate, numbersUpdate } from './Update';

export const buyBuilding = (buy: Array<Record<string, number>>, index: number, auto = false) => {
    if (buy[index - 1].current < global.buildingsInfo.cost[index] * (auto ? 2 : 1) || !isFinite(global.buildingsInfo.cost[index])) {
        if (global.screenReader && !auto) {
            getId('invisibleBought').textContent = `Coudn't buy '${global.buildingsInfo.name[index]}', because didn't had enough of '${global.buildingsInfo.name[index - 1]}'`;
        }
        return; //This is the only thing that stop's endless auto buying
    }
    const { stage, researchesAuto, buyToggle } = player;
    const { stageInfo, buildingsInfo } = global;
    if (stage.current === 1) { global.energyType[index] = globalStart.energyType[index] * 3 ** player.researches[4]; }

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
        /* No idea what is better (performance wise) bonus + true or just current++ and true++ */
        buy[index].current += canAfford;
        buy[index].true += canAfford;
        buy[index].total += canAfford;
        if (stage.current === 1) {
            player.energy.current += global.energyType[index] * canAfford;
            player.energy.total += global.energyType[index] * canAfford;
        }
        if (global.screenReader && !auto) {
            getId('invisibleBought').textContent = `Bought ${format(canAfford)} '${buildingsInfo.name[index]}'${stage.current === 1 ? `, gained ${format(global.energyType[index] * canAfford)} ${stageInfo.resourceName[stage.current]}` : ''}`;
        }
    } else if (buyToggle.howMany === 1 || researchesAuto[0] === 0) {
        buy[index - 1].current -= buildingsInfo.cost[index];
        buy[index].current++;
        buy[index].true++;
        buy[index].total++;
        if (stage.current === 1) {
            player.energy.current += global.energyType[index];
            player.energy.total += global.energyType[index];
        }
        if (global.screenReader) {
            getId('invisibleBought').textContent = `Bought 1 '${buildingsInfo.name[index]}'${stage.current === 1 ? `, gained ${global.energyType[index]} ${stageInfo.resourceName[stage.current]}` : ''}`;
        }
    }
    calculateBuildingsCost(index);
    invisibleUpdate();
    numbersUpdate();
};

export const calculateBuildingsCost = (index: number) => {
    const { stage, buildings, upgrades, researches } = player;
    const { buildingsInfo } = global;

    if (stage.current === 1) {
        global.upgradesInfo.effect[4] = Math.trunc((0.2 + researches[0] * 0.01) * 100) / 100;
        buildingsInfo.increase = Math.trunc((1.4 - (upgrades[4] === 1 ? global.upgradesInfo.effect[4] : 0)) * 100) / 100;
        /* I feel like i'm losing my mind 1.4 - 0.3 = 0... But 1.4 - (0.3) = 1.1 */
    }

    buildingsInfo.cost[index] = globalStart.buildingsInfo.cost[index] * buildingsInfo.increase ** buildings[index].true;
    if (index === 1 && upgrades[0] === 1 && stage.current === 1) { buildingsInfo.cost[1] /= 10; }
};

export const calculateResearchCost = (research: number, playerOne: 'researches' | 'researchesAuto', globalOne = playerOne + 'Info' as 'researchesS2Info') => {
    if (player[playerOne][research] === global[globalOne].max[research]) { return; }
    global[globalOne].cost[research] = globalStart[globalOne].cost[research] + global[globalOne].scalling[research] * player[playerOne][research];
};

export const calculateGainedBuildings = (get: number, time: number) => {
    const { buildings } = player; //Add stage, researches and\or upgrades, if more will be added into here
    const { buildingsInfo } = global;
    const before = buildings[get].current; //I think it's faster this way
    let add: number;

    if (player.stage.current === 1 && get === 3) {
        if (buildingsInfo.producing[3] <= 1) { return; } // 0 would give -infinity and 1 would give 0, so quicker to exclude
        add = Math.log(buildingsInfo.producing[get]) * time * 12 ** player.researches[2];
        if (player.upgrades[7] === 1) { add *= player.energy.current; }
    } else {
        add = buildingsInfo.producing[get + 1] * time;
    }

    let check = buildings[get].current + add;
    if (isFinite(check)) {
        buildings[get].current = check;
    } else { return; }

    check = buildings[get].total + (buildings[get].current - before);
    if (isFinite(check)) { buildings[get].total = check; }
};

export const buyUpgrades = (upgrade: number, type = 'upgrades' as 'upgrades' | 'researches' | 'researchesAuto') => {
    const { stage } = player;

    switch (type) {
        case 'upgrades': {
            const { upgrades } = player;

            if (stage.current === 1) {
                const { energy } = player;
                const { upgradesInfo } = global;

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
                    for (let i = 1; i < global.buildingsInfo.name.length; i++) {
                        calculateBuildingsCost(i);
                    }
                }
                if (global.screenReader) { getId('invisibleBought').textContent = `You have bought upgrade '${upgradesInfo.description[upgrade]}'`; }
            }
            break;
        }
        case 'researches': {
            const { researches } = player;

            if (stage.current === 1) {
                const { energy } = player;
                const { researchesInfo } = global;

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
                    for (let i = 1; i < global.buildingsInfo.name.length; i++) {
                        calculateBuildingsCost(i);
                    }
                }
                if (global.screenReader) { getId('invisibleBought').textContent = `You have researched '${researchesInfo.description[upgrade]}', level is now ${researches[upgrade]} ${researches[upgrade] === researchesInfo.max[upgrade] ? 'maxed' : ''}`; }
                calculateResearchCost(upgrade, 'researches');
            }
            break;
        }
        case 'researchesAuto': {
            const { researchesAuto } = player;
            const { researchesAutoInfo } = global;
            const researchNumber = getId(`researchAuto${upgrade + 1}Level`);

            if (stage.current === 1) {
                const { energy } = player;

                if (researchesAuto[upgrade] === researchesAutoInfo.max[upgrade] || energy.current < researchesAutoInfo.cost[upgrade] || upgrade > 1) { return; }
                researchesAuto[upgrade]++;
                energy.current -= researchesAutoInfo.cost[upgrade];
            } else if (stage.current === 2) {
                return;
            }

            researchNumber.textContent = String(researchesAuto[upgrade]);
            if (researchesAuto[upgrade] !== researchesAutoInfo.max[upgrade]) {
                researchNumber.classList.replace('redText', 'orchidText');
            } else {
                researchNumber.classList.remove('redText', 'orchidText');
                researchNumber.classList.add('greenText');
            }
            if (global.screenReader) { getId('invisibleBought').textContent = `You have researched '${researchesAutoInfo.description[upgrade]}', level is now ${researchesAuto[upgrade]} ${researchesAuto[upgrade] === researchesAutoInfo.max[upgrade] ? 'maxed' : ''}`; }
            calculateResearchCost(upgrade, 'researchesAuto');
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
            /* No idea how to deal with 1e1 being turned into 10... Also numbers bigger than input width and '+e' instead of 'e'... */
    }
    getId('buyStrict').style.borderColor = buyToggle.strict ? '' : 'crimson';
    getId('buy1x').style.backgroundColor = buyToggle.howMany === 1 ? 'green' : '';
    getId('buyAny').style.backgroundColor = Math.abs(buyToggle.howMany) !== 1 ? 'green' : '';
    getId('buyMax').style.backgroundColor = buyToggle.howMany === -1 ? 'green' : '';
};

export const stageResetCheck = async() => {
    const { stage, buildings, researchesAuto, toggles } = player;
    let reseted = false;

    if (stage.current === 1) {
        if (buildings[3].current >= 1.67e21) {
            let ok = true;
            if (toggles[2]) {
                ok = await Confirm('Ready to enter next stage?');
            }
            if (ok) {
                if (researchesAuto[0] === 0) { researchesAuto[0]++; }
                reseted = true;
            }
        } else {
            Alert('There are more molecules in a single drop than that you know.');
        }
    } else {
        Alert('Not yet in game');
    }
    if (reseted) {
        Alert('There is nothing past stage 1 for now');
        //Reuse player.upgrades; player.researches, but keep global part of them
        //As example global.upgradesW, but player.upgrades
        /*researchesAuto[1] = 0;
        stage.current++;
        if (stage.true < stage.current) { stage.true++; }
        reset('stage');*/
    }
};

export const dischargeResetCheck = async() => {
    const { energy } = player;
    const { dischargeInfo } = global;

    if (player.upgrades[3] === 1 && player.buildings[1].true > 0 && player.stage.current === 1) {
        let ok = true;
        if (player.toggles[1] && energy.current < dischargeInfo.next) {
            ok = await Confirm('This will reset all of your current buildings and energy. You will NOT gain production boost. Continue?');
        } else if (player.toggles[1] && energy.current >= dischargeInfo.next) {
            ok = await Confirm('You have enough energy to gain boost. Continue?');
        }
        if (ok) {
            if (energy.current >= dischargeInfo.next) {
                dischargeInfo.next *= 10;
                player.discharge.current++;
                if (global.screenReader) { getId('invisibleBought').textContent = 'Buildings and energy were reset for some boost'; }
            } else if (global.screenReader && energy.current < dischargeInfo.next) {
                getId('invisibleBought').textContent = 'Buildings and energy were reset, no boost';
            }
            reset('discharge');
        }
    }
};
