import { getId } from './Main';
import { global, globalStart, player } from './Player';
import { reset } from './Reset';
import { Alert, Confirm } from './Special';
import { format, getUpgradeDescription, invisibleUpdate, numbersUpdate, updateRankInfo, visualUpdateUpgrades } from './Update';

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

    let extra = index - 1; //What you are paying
    if (stage.current === 2 && index !== 1) {
        extra = 1; //Drops
    } else if (stage.current === 3) {
        extra = 0; //Mass
    }
    let keep = 2;
    if (buildings[index].true === 0) { keep = 1; }

    if (buildings[extra].current < buildingsInfo.cost[index] * (auto ? keep : 1)) {
        if (screenReader && !auto) {
            getId('invisibleBought').textContent = `Coudn't buy '${buildingsInfo.name[index]}', because didn't had enough of '${buildingsInfo.name[extra]}'`;
        }
        return;
    }

    const { researchesAuto } = player;
    const { shop } = player.toggles;
    if (stage.current === 1) { global.dischargeInfo.energyType[index] = globalStart.dischargeInfo.energyType[index] * 3 ** player.researches[4]; }

    if ((shop.howMany !== 1 && researchesAuto[0] > 0) || auto) {
        let budget = buildings[extra].current;
        if (auto) { budget /= keep; }

        let cost = buildingsInfo.cost[index];
        let total = 0;
        const howMany = auto ? -1 : shop.howMany;
        /* I don't know better way... I looked everywhere for a formula with geometric progression, haven't found it... */
        for (var canAfford = 0; budget >= cost; canAfford++) {
            if (canAfford === howMany) { break; }
            total += cost;
            budget -= cost;
            cost *= buildingsInfo.increase[index];
        }
        if (canAfford < howMany && howMany !== -1 && shop.strict) { return; }
        buildings[extra].current -= total;
        buildings[index].current += canAfford;
        buildings[index].true += canAfford;
        buildings[index].total += canAfford;
        buildings[index].trueTotal += canAfford;

        if (stage.current === 1) { player.discharge.energyCur += global.dischargeInfo.energyType[index] * canAfford; }
        if (global.screenReader && !auto) {
            getId('invisibleBought').textContent = `Bought ${format(canAfford)} '${buildingsInfo.name[index]}'${stage.current === 1 ? `, gained ${format(global.dischargeInfo.energyType[index] * canAfford)} ${global.stageInfo.resourceName[stage.current - 1]}` : ''}`;
        }
    } else if (shop.howMany === 1 || researchesAuto[0] === 0) {
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
        buildingsInfo.increase[index] = Math.trunc((1.4 - (upgrades[4] === 1 ? global.upgradesInfo.effect[4] : 0)) * 100) / 100;
    } else if (stage.current === 3 && index === 4) {
        buildingsInfo.increase[4] = upgrades[10] === 1 ? 5 : 10;
    }

    buildingsInfo.cost[index] = globalStart.buildingsInfo.cost[index] * buildingsInfo.increase[index] ** buildings[index].true;

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
        global[typeInfo].cost[research] = globalStart[typeInfo].cost[research] * global[typeInfo].scalling[research] ** player[type][research];
        if (typeInfo === 'researchesAutoInfo' && research === 1) {
            if (stage.current === 2 && player.researchesAuto[1] >= 3) {
                global[typeInfo].cost[research] *= player.researchesAuto[1] >= 4 ? 1e4 : 1e2;
            } else if (stage.current === 3 && player.researchesAuto[1] >= 2) {
                global[typeInfo].cost[research] = player.researchesAuto[1] >= 3 ? 1e31 : 5e29;
            }
        }
    }

    //Below just makes price look nice
    if (global[typeInfo].cost[research] < 1) {
        const digits = -Math.floor(Math.log10(global[typeInfo].cost[research])); //Because of floats, -digits will be used
        global[typeInfo].cost[research] = Math.trunc(global[typeInfo].cost[research] * 10 ** (digits + 2)) / 10 ** (digits + 2);
    } else {
        global[typeInfo].cost[research] = Math.trunc(global[typeInfo].cost[research]);
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
        if (stage.current === 2 && get === 1 && player.researchesExtra[1] >= 1) { add += time * global.researchesExtraS2Info.effect[1]; }
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

export const buyUpgrades = (upgrade: number, type = 'upgrades' as 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto', check = 0) => {
    const { stage } = player;
    if (check !== 0 && check !== stage.current) { return; }

    let price: number;
    if (stage.current === 1) {
        price = player.discharge.energyCur;
    } else if (stage.current === 2) {
        price = player.buildings[1].current;
    } else /*if (stage.current === 3)*/ {
        price = player.buildings[0].current;
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
        if (type === 'upgrades') {
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
            } else if (stage.current === 3 && upgrade === 10) {
                calculateBuildingsCost(4);
            }
        }
        if (global.screenReader) { getId('invisibleBought').textContent = `You have bought upgrade '${global[typeInfo].description[upgrade]}'`; }
    }

    /* Because each price can use different property, so have to do it this way... */
    if (stage.current === 1) {
        player.discharge.energyCur = price;
    } else if (stage.current === 2) {
        player.buildings[1].current = price;
    } else /*if (stage.current === 3)*/ {
        player.buildings[0].current = price;
    }

    numbersUpdate();
    getUpgradeDescription(upgrade, type);
    visualUpdateUpgrades(upgrade, type);
};

export const toggleSwap = (number: number, type: 'normal' | 'buildings' | 'auto', change = false) => {
    const { toggles } = player;

    let toggle: HTMLButtonElement;
    if (type === 'normal') {
        toggle = getId(`toggle${number}`) as HTMLButtonElement;
    } else if (type === 'buildings') {
        toggle = getId(`toggleBuilding${number}`) as HTMLButtonElement;
    } else {
        toggle = getId(`toggleAuto${number}`) as HTMLButtonElement;
    }

    if (change) { toggles[type][number] = !toggles[type][number]; }

    if (type === 'normal') {
        if (!toggles[type][number]) {
            toggle.textContent = 'OFF';
            toggle.style.borderColor = 'crimson';
            if (global.screenReader) { toggle.ariaLabel = toggle.ariaLabel?.replace(' ON', ' OFF') ?? ''; } //I have no idea if textcontent will be read along with aria-label...
        } else {
            toggle.textContent = 'ON';
            toggle.style.borderColor = '';
            if (global.screenReader) { toggle.ariaLabel = toggle.ariaLabel?.replace(' OFF', ' ON') ?? ''; }
        }
    } else {
        if (!toggles[type][number]) {
            toggle.textContent = 'Auto OFF';
            toggle.style.borderColor = 'crimson';
        } else {
            toggle.textContent = 'Auto ON';
            toggle.style.borderColor = '';
        }
    }
};

export const toggleBuy = (type = 'none') => {
    const { shop } = player.toggles;
    const input = getId('buyAnyInput') as HTMLInputElement;

    switch (type) {
        case '1':
            shop.howMany = 1;
            break;
        case 'max':
            shop.howMany = -1;
            break;
        case 'any':
            shop.input = Math.max(Math.trunc(Number(input.value)), -1);
            if (shop.input === 0) { shop.input = 1; }
            shop.howMany = shop.input;
            input.value = format(shop.input, 0);
            break;
        case 'strict':
            shop.strict = !shop.strict;
            break;
        default:
            input.value = format(shop.input, 0);
    }
    getId('buyStrict').style.borderColor = shop.strict ? '' : 'crimson';
    getId('buy1x').style.backgroundColor = shop.howMany === 1 ? 'green' : '';
    getId('buyAny').style.backgroundColor = Math.abs(shop.howMany) !== 1 ? 'green' : '';
    getId('buyMax').style.backgroundColor = shop.howMany === -1 ? 'green' : '';
};

export const stageResetCheck = async() => {
    const { stage, buildings, researchesAuto, toggles } = player;
    let reseted = false;
    const message = 'Ready to enter next stage? Next one will be harder than current.\nYou might want to turn off all auto\'s first';

    if (stage.current === 1) {
        if (buildings[3].current >= 1.67e21) {
            let ok = true;
            if (toggles.normal[1]) { ok = await Confirm(message); }
            if (ok) {
                if (researchesAuto[0] === 0) { researchesAuto[0]++; }
                reseted = true;
            }
        } else {
            Alert('You will need a single Drop of water for next one');
        }
    } else if (stage.current === 2) {
        if (buildings[1].current >= 1.194e29) {
            let ok = true;
            if (toggles.normal[1]) { ok = await Confirm(message); }
            if (ok) {
                if (researchesAuto[2] === 0) { researchesAuto[2]++; }
                player.accretion.rank = 0;
                reseted = true;
            }
        } else {
            Alert('Look\'s like, it, should have even more Drops');
        }
    } else if (stage.current === 3) {
        if (buildings[0].current >= 1e32) {
            Alert('Not yet in game');
            /*let ok = true;
            if (toggles.normal[1]) { ok = await Confirm(message); }
            if (ok) {
                reseted = true;
            }*/
        } else {
            Alert('Self sustaining is not yet possible, need more Mass');
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
        if (player.toggles.normal[2]) {
            if (discharge.energyCur < dischargeInfo.next) {
                ok = await Confirm('This will reset all of your current buildings and energy. You will NOT gain production boost. Continue?');
            } else {
                ok = await Confirm('You have enough energy to gain boost. Continue?');
            }
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
        if (player.toggles.normal[3]) {
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

export const rankResetCheck = async() => {
    const { accretionInfo } = global;
    const { accretion } = player;

    if (player.buildings[0].current >= accretionInfo.rankCost[accretion.rank] && accretionInfo.rankCost[accretion.rank] !== 0 && player.stage.current === 3) {
        let ok = true;
        if (player.toggles.normal[4] && accretion.rank !== 0) {
            ok = await Confirm('Increasing Rank will reset buildings, upgrades, stage researches. But you will get closer to your goal');
        }
        if (ok) {
            accretion.rank++;
            reset('rank');
            updateRankInfo();
            if (global.screenReader) { getId('invisibleBought').textContent = `Rank is now ${accretionInfo.rankName[accretion.rank]}`; }
        }
    }
};
