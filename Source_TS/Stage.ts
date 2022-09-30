import { getId } from './Main';
import { global, globalStart, player } from './Player';
import { reset } from './Reset';
import { Alert, Confirm } from './Special';
import { format, getUpgradeDescription, invisibleUpdate, numbersUpdate, visualUpdateUpgrades } from './Update';

export const buyBuilding = (index: number, auto = false) => {
    const { stage, buildings } = player;
    const { buildingsInfo, screenReader } = global;

    //Auto will endlessly call function until hits return;
    if (!isFinite(buildingsInfo.cost[index])) {
        if (screenReader && !auto) {
            getId('invisibleBought').textContent = `Coudn't buy '${buildingsInfo.name[index]}', because cost is infinity`;
        }
        return;
    }

    let extra = index - 1;
    if (stage.current === 2 && index > 2) { extra = 1; }
    let keep = 2;
    if (buildings[index].true === 0) { keep = 1; }

    if (buildings[extra].current < buildingsInfo.cost[index] * (auto ? keep : 1)) {
        if (screenReader && !auto) {
            getId('invisibleBought').textContent = `Coudn't buy '${buildingsInfo.name[index]}', because didn't had enough of '${buildingsInfo.name[extra]}'`;
        }
        return;
    }

    const { researchesAuto, buyToggle } = player;
    if (stage.current === 1) { global.dischargeInfo.energyType[index] = globalStart.dischargeInfo.energyType[index] * 3 ** player.researches[4]; }

    if ((buyToggle.howMany !== 1 && researchesAuto[0] > 0) || auto) {
        let budget = buildings[extra].current;
        if (auto) { budget /= keep; }

        let cost = buildingsInfo.cost[index];
        let total = 0;
        const howMany = auto ? -1 : buyToggle.howMany;
        /* I don't know better way... I looked everywhere for formula with geometric progression, haven't found it... */
        for (var canAfford = 0; budget >= cost; canAfford++) {
            //Yes it's a 'var', yes it goes outside of a block, no I won't use 'let'
            if (canAfford === howMany) { break; }
            total += cost;
            budget -= cost;
            cost *= buildingsInfo.increase;
        }
        if (canAfford < howMany && howMany !== -1 && buyToggle.strict) { return; }
        buildings[extra].current -= total;
        buildings[index].current += canAfford;
        buildings[index].true += canAfford;
        buildings[index].total += canAfford;
        buildings[index].trueTotal += canAfford;

        if (stage.current === 1) { player.discharge.energyCur += global.dischargeInfo.energyType[index] * canAfford; }
        if (global.screenReader && !auto) {
            getId('invisibleBought').textContent = `Bought ${format(canAfford)} '${buildingsInfo.name[index]}'${stage.current === 1 ? `, gained ${format(global.dischargeInfo.energyType[index] * canAfford)} ${global.stageInfo.resourceName[stage.current - 1]}` : ''}`;
        }
    } else if (buyToggle.howMany === 1 || researchesAuto[0] === 0) {
        buildings[extra].current -= buildingsInfo.cost[index];
        buildings[index].current++;
        buildings[index].true++;
        buildings[index].total++;
        buildings[index].trueTotal++;

        if (stage.current === 1) { player.discharge.energyCur += global.dischargeInfo.energyType[index]; }
        if (global.screenReader) {
            getId('invisibleBought').textContent = `Bought 1 '${buildingsInfo.name[index]}'${stage.current === 1 ? `, gained ${global.dischargeInfo.energyType[index]} ${global.stageInfo.resourceName[stage.current - 1]}` : ''}`;
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
    }

    buildingsInfo.cost[index] = globalStart.buildingsInfo.cost[index] * buildingsInfo.increase ** buildings[index].true;
    if (stage.current === 1 && index === 1 && upgrades[0] === 1) { buildingsInfo.cost[1] /= 10; }
};

export const calculateResearchCost = (research: number, type: 'researches' | 'researchesExtra' | 'researchesAuto') => {
    const { stage } = player;
    let typeInfo = 'researchesAutoInfo' as 'researchesAutoInfo' | 'researchesS2Info';
    if (type !== 'researchesAuto') {
        typeInfo = `${type}${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'researchesS2Info';
    }

    if (player[type][research] === global[typeInfo].max[research]) { return; }
    if (stage.current === 1) {
        global[typeInfo].cost[research] = globalStart[typeInfo].cost[research] + global[typeInfo].scalling[research] * player[type][research];
    } else {
        global[typeInfo].cost[research] = Math.trunc(globalStart[typeInfo].cost[research] * global[typeInfo].scalling[research] ** player[type][research]);
        if (typeInfo === 'researchesAutoInfo' && stage.current === 2 && research === 1 && player.researchesAuto[1] >= 3) { global[typeInfo].cost[research] *= player.researchesAuto[1] >= 4 ? 1000 : 100; }
    }
};

export const calculateGainedBuildings = (get: number, time: number) => {
    const { stage, buildings } = player;
    const { buildingsInfo } = global;
    const before = buildings[get].current; //I think it's faster this way
    let add: number;

    if (stage.current === 1 && get === 3) {
        add = global.upgradesInfo.effect[6] * time;
    } else {
        add = buildingsInfo.producing[get + 1] * time;
        if (stage.current === 2 && get === 1 && player.researchesExtra[1] >= 1) { add += time * 10 ** (player.researchesExtra[1] - 1); }
    }

    if (add === 0) { return; }
    /* Still possible, though unlikely, to get infinity by buying buildings */
    let check = buildings[get].current + add;
    if (isFinite(check)) {
        buildings[get].current = check;
    } else { return; }

    check = buildings[get].total + (buildings[get].current - before);
    if (isFinite(check)) {
        buildings[get].total = check;
    } else { return; }

    check = buildings[get].trueTotal + (buildings[get].current - before);
    if (isFinite(check)) { buildings[get].trueTotal = check; }
};

export const buyUpgrades = (upgrade: number, type = 'upgrades' as 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto') => {
    const { stage } = player;

    let price: number;
    if (stage.current === 1) {
        price = player.discharge.energyCur;
    } else /*if (stage.current === 2)*/ {
        price = player.buildings[1].current;
    }

    if (type !== 'upgrades') {
        let typeInfo = 'researchesAutoInfo' as 'researchesAutoInfo' | 'researchesS2Info';
        if (type !== 'researchesAuto') {
            typeInfo = `${type}${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'researchesS2Info';
        }

        if (type === 'researchesAuto' && stage.current === 1 && upgrade > 1) { return; }
        if (player[type][upgrade] === global[typeInfo].max[upgrade] || price < global[typeInfo].cost[upgrade]) { return; }
        player[type][upgrade]++;
        price -= global[typeInfo].cost[upgrade];

        /* Special cases */
        if (stage.current === 1 && type === 'researches' && upgrade === 0) {
            for (let i = 1; i < global.buildingsInfo.name.length; i++) {
                calculateBuildingsCost(i);
            }
        }
        if (global.screenReader) { getId('invisibleBought').textContent = `You have researched '${global[typeInfo].description[upgrade]}', level is now ${player[type][upgrade]} ${player[type][upgrade] === global[typeInfo].max[upgrade] ? 'maxed' : ''}`; }

        calculateResearchCost(upgrade, type);
    } else {
        const typeInfo = `${type}${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'upgradesS2Info';

        if (player[type][upgrade] === 1 || price < global[typeInfo].cost[upgrade]) { return; }
        player[type][upgrade] = 1;
        price -= global[typeInfo].cost[upgrade];

        /* Special cases */
        if (stage.current === 1) {
            if (upgrade === 0) {
                calculateBuildingsCost(1);
            } else if (upgrade === 3) {
                getId('discharge').style.display = '';
            } else if (upgrade === 4) {
                for (let i = 1; i < global.buildingsInfo.name.length; i++) {
                    calculateBuildingsCost(i);
                }
            }
        }
        if (global.screenReader) { getId('invisibleBought').textContent = `You have bought upgrade '${global[typeInfo].description[upgrade]}'`; }
    }

    /* Because each price can use different property, so have to do it this way... */
    if (stage.current === 1) {
        player.discharge.energyCur = price;
    } else /*if (stage.current === 2)*/ {
        player.buildings[1].current = price;
    }

    numbersUpdate();
    getUpgradeDescription(upgrade, type);
    visualUpdateUpgrades(upgrade, type);
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
    const message = 'Ready to enter next stage? You might want to turn off all auto\'s first';

    if (stage.current === 1) {
        if (buildings[3].current >= 1.67e21) {
            let ok = true;
            if (toggles[2]) { ok = await Confirm(message); }
            if (ok) {
                if (researchesAuto[0] === 0) { researchesAuto[0]++; }
                reseted = true;
            }
        } else {
            Alert('You will need a single Drop of water for next one');
        }
    } else if (stage.current === 2) {
        if (buildings[1].current >= 2.68e26) {
            Alert('Not yet in game');
            /*let ok = true;
            if (toggles[2]) { ok = await Confirm(message); }
            if (ok) {
                if (researchesAuto[2] === 0) { researchesAuto[2]++; }
                reseted = true;
            }*/
        } else {
            Alert('Look\'s like, it, can still hold more Drops');
        }
    }
    if (reseted) {
        researchesAuto[1] = 0;
        stage.resets++;
        stage.current++;
        if (stage.true < stage.current) { stage.true++; }
        reset('stage');
    }
};

export const dischargeResetCheck = async() => {
    const { dischargeInfo } = global;

    if (player.upgrades[3] === 1 && player.buildings[1].true > 0 && player.stage.current === 1) {
        const { discharge } = player;

        let ok = true;
        if (player.toggles[1] && discharge.energyCur < dischargeInfo.next) {
            ok = await Confirm('This will reset all of your current buildings and energy. You will NOT gain production boost. Continue?');
        } else if (player.toggles[1] && discharge.energyCur >= dischargeInfo.next) {
            ok = await Confirm('You have enough energy to gain boost. Continue?');
        }
        if (ok) {
            if (discharge.energyCur >= dischargeInfo.next) {
                discharge.current++;
                dischargeInfo.next *= 10;
                if (global.screenReader) { getId('invisibleBought').textContent = 'Buildings and energy were reset for some boost'; }
            } else if (global.screenReader && discharge.energyCur < dischargeInfo.next) {
                getId('invisibleBought').textContent = 'Buildings and energy were reset, no boost';
            }
            reset('discharge');
        }
    }
};

export const vaporizationResetCheck = async() => {
    const { vaporizationInfo } = global;

    if (player.upgrades[1] === 1 && vaporizationInfo.get >= 1 && player.stage.current === 2) {
        const { vaporization } = player;

        let ok = true;
        if (player.toggles[3]) {
            ok = await Confirm(`Do you wish to reset buildings and upgrades for ${format(vaporizationInfo.get)} Clouds?`);
        }
        if (ok) {
            vaporization.current++;
            vaporization.clouds += vaporizationInfo.get;
            reset('vaporization');
            if (global.screenReader) { getId('invisibleBought').textContent = `Progress were reset for ${format(vaporizationInfo.get)} Clouds`; }
        }
    }
};
