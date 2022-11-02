import { checkBuilding } from './Check';
import { getId } from './Main';
import { global, globalStart, player } from './Player';
import { reset } from './Reset';
import { Alert, Confirm } from './Special';
import { format, getUpgradeDescription, invisibleUpdate, numbersUpdate, updateRankInfo, visualUpdateUpgrades } from './Update';

export const buyBuilding = (index: number, auto = false) => {
    const { stage, buildings } = player;
    const { buildingsInfo, screenReader } = global;

    if (!checkBuilding(index)) { return; }

    if (!isFinite(buildingsInfo.cost[index])) {
        if (screenReader && !auto) {
            getId('invisibleBought').textContent = `Coudn't buy '${buildingsInfo.name[index]}', because cost is infinity`;
        }
        return;
    }

    let extra = index - 1; //What you are paying
    if (stage.current === 2 && index !== 1) {
        extra = 1; //Drops
    } else if (stage.current === 3 || stage.current === 4) {
        extra = 0; //Mass || Elements
    }
    let keep = 2;
    if (buildings[index].true === 0) { keep = 1; }

    //Auto will endlessly call this function until hits return;
    if (buildings[extra].current / (auto ? keep : 1) < buildingsInfo.cost[index]) {
        if (screenReader && !auto) {
            getId('invisibleBought').textContent = `Coudn't buy '${buildingsInfo.name[index]}', because didn't had enough of '${buildingsInfo.name[extra]}'`;
        }
        return;
    }

    const { researchesAuto } = player;
    const { shop } = player.toggles;
    const howMany = auto ? -1 : shop.howMany;
    if (stage.current === 1) { global.dischargeInfo.energyType[index] = globalStart.dischargeInfo.energyType[index] * 3 ** player.researches[4]; }

    if (howMany !== 1 && researchesAuto[0] > 0) {
        //Increase must be > 1 (if < 1, then use (1 - increase) and (1 - increase ** levels))
        const budget = buildings[extra].current / (auto ? keep : 1); //How much need to spend
        const totalBefore = buildingsInfo.startCost[index] * ((buildingsInfo.increase[index] ** buildings[index].true - 1) / (buildingsInfo.increase[index] - 1)); //How much already payed for
        const maxAfford = Math.trunc(Math.log((totalBefore + budget) * (buildingsInfo.increase[index] - 1) / buildingsInfo.startCost[index] + 1) / Math.log(buildingsInfo.increase[index])) - buildings[index].true; //Max amount that can be afforded
        if (shop.strict && maxAfford < howMany && howMany !== -1) { return; }
        const canAfford = howMany !== -1 ? Math.min(maxAfford, howMany) : maxAfford;
        const total = buildingsInfo.startCost[index] * ((buildingsInfo.increase[index] ** (canAfford + buildings[index].true) - 1) / (buildingsInfo.increase[index] - 1)) - totalBefore; //How much you need to pay

        buildings[extra].current -= total;
        buildings[index].current += canAfford;
        buildings[index].true += canAfford;
        buildings[index].total += canAfford;
        buildings[index].trueTotal += canAfford;

        if (stage.current === 1) { player.discharge.energyCur += global.dischargeInfo.energyType[index] * canAfford; }
        if (global.screenReader && !auto) {
            getId('invisibleBought').textContent = `Bought ${format(canAfford)} '${buildingsInfo.name[index]}'${stage.current === 1 ? `, gained ${format(global.dischargeInfo.energyType[index] * canAfford)} ${global.stageInfo.resourceName[stage.current - 1]}` : ''}`;
        }
    } else {
        buildings[extra].current -= buildingsInfo.cost[index];
        buildings[index].current++;
        buildings[index].true++;
        buildings[index].total++;
        buildings[index].trueTotal++;

        if (stage.current === 1) { player.discharge.energyCur += global.dischargeInfo.energyType[index]; }
        if (global.screenReader) {
            getId('invisibleBought').textContent = `Bought 1 '${buildingsInfo.name[index]}'${stage.current === 1 ? `, gained ${format(global.dischargeInfo.energyType[index])} ${global.stageInfo.resourceName[stage.current - 1]}` : ''}`;
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
        /* I hate floats... I have to rework almost entire stage 1 because of them, I need to change Math.trunc to Math.round */
        global.upgradesInfo.effect[4] = Math.trunc((0.2 + researches[0] * 0.01) * 100) / 100;
        buildingsInfo.increase[index] = Math.trunc((1.4 - (upgrades[4] === 1 ? global.upgradesInfo.effect[4] : 0)) * 100) / 100;
        if (index === 1) { buildingsInfo.startCost[1] = globalStart.buildingsInfo.startCost[1] / (upgrades[0] === 1 ? 10 : 1); }
    } else if (stage.current === 3 && index === 4) {
        buildingsInfo.increase[4] = upgrades[10] === 1 ? 5 : 10;
    } else if (stage.current === 4) {
        buildingsInfo.increase[index] = Math.round(((1.4 + 0.15 * (index - 1)) - (player.elements[2] === 1 ? 0.1 : 0) - (player.elements[8] === 1 ? 0.05 : 0)) * 100) / 100;
        buildingsInfo.startCost[index] = globalStart.buildingsInfo.startCost[index] / (player.elements[13] === 1 ? 1e3 : 1);
    }

    buildingsInfo.cost[index] = buildingsInfo.startCost[index] * buildingsInfo.increase[index] ** buildings[index].true;
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
                global[typeInfo].cost[research] = player.researchesAuto[1] >= 3 ? 2e30 : 5e29;
            }
        }
    }

    //Below will remove all but 2 digits past point (until 1e3)
    if (global[typeInfo].cost[research] < 1) {
        const digits = -Math.floor(Math.log10(global[typeInfo].cost[research])); //Because of floats, -digits will be used
        global[typeInfo].cost[research] = Math.round(global[typeInfo].cost[research] * 10 ** (digits + 2)) / 10 ** (digits + 2);
    } else if (global[typeInfo].cost[research] < 1e3) {
        global[typeInfo].cost[research] = Math.round(global[typeInfo].cost[research] * 100) / 100;
    } else {
        global[typeInfo].cost[research] = Math.round(global[typeInfo].cost[research]);
    }
};

export const calculateGainedBuildings = (get: number, time: number) => {
    const { stage, buildings } = player;
    const { buildingsInfo } = global;

    let add: number;
    if (stage.current === 1 && get === 3) {
        add = global.upgradesInfo.effect[6] * time;
    } else {
        add = buildingsInfo.producing[get + 1] * time;
        if (stage.current === 2 && get === 1 && player.researchesExtra[1] >= 1) { add += time * global.researchesExtraS2Info.effect[1]; }
    }

    if (add === 0) { return; }
    if (stage.current === 4) { get = 0; }
    /* Still possible, though unlikely, to get infinity by buying buildings */
    let check = buildings[get].current + add;
    if (isFinite(check)) {
        buildings[get].current = check;
    } else { return; }

    check = buildings[get].total + add;
    if (isFinite(check)) {
        buildings[get].total = check;
    } else { return; }

    check = buildings[get].trueTotal + add;
    if (isFinite(check)) { buildings[get].trueTotal = check; }
};

export const buyUpgrades = (upgrade: number, type = 'upgrades' as 'upgrades' | 'elements' | 'researches' | 'researchesExtra' | 'researchesAuto', check = 0) => {
    const { stage } = player;
    if (check !== 0 && check !== stage.current) { return; }

    let currency: number;
    if (stage.current === 1) {
        currency = player.discharge.energyCur;
    } else if (stage.current === 2) {
        currency = player.buildings[1].current;
    } else /*if (stage.current === 3 || stage.current === 4)*/ {
        currency = player.buildings[0].current;
    }

    if (type !== 'upgrades' && type !== 'elements') {
        let typeInfo = 'researchesAutoInfo' as 'researchesAutoInfo' | 'researchesS2Info';
        if (type !== 'researchesAuto') {
            typeInfo = `${type}${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'researchesS2Info';
        }

        if (player[type][upgrade] === global[typeInfo].max[upgrade] || currency < global[typeInfo].cost[upgrade]) {
            return; //Must be on top
        } else if (type === 'researchesAuto') {
            if (upgrade === 2 && stage.current !== 2) {
                return;
            } //0 only for 1, 3 only for 3, 4 only for 4
        } else if (type === 'researches' && stage.current === 4 && global.collapseInfo.unlockPriceR[upgrade] > player.collapse.mass) {
            return;
        }
        player[type][upgrade]++;
        currency -= global[typeInfo].cost[upgrade];

        /* Special cases */
        if (stage.current === 1 && type === 'researches' && upgrade === 0) {
            for (let i = 1; i < global.buildingsInfo.name.length; i++) {
                calculateBuildingsCost(i);
            }
        } else if (stage.current === 4 && type === 'researches' && upgrade === 2) {
            calculateMaxLevel(0, 'researches');
        }
        if (global.screenReader) { getId('invisibleBought').textContent = `You have researched '${global[typeInfo].description[upgrade]}', level is now ${player[type][upgrade]} ${player[type][upgrade] === global[typeInfo].max[upgrade] ? 'maxed' : ''}`; }

        calculateResearchCost(upgrade, type);
    } else {
        let typeInfo = 'elementsInfo' as 'elementsInfo' | 'upgradesS2Info';
        if (type !== 'elements') { typeInfo = `${type}${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'upgradesS2Info'; }

        if (player[type][upgrade] === 1 || currency < global[typeInfo].cost[upgrade]) {
            return; //Must be on top
        } else if (type === 'upgrades' && stage.current === 4 && global.collapseInfo.unlockPriceU[upgrade] > player.collapse.mass) {
            return;
        }
        player[type][upgrade] = 1;
        currency -= global[typeInfo].cost[upgrade];

        /* Special cases */
        if (type === 'upgrades') {
            if (stage.current === 1) {
                if (upgrade === 0) {
                    calculateBuildingsCost(1);
                } else if (upgrade === 4) {
                    for (let i = 1; i < global.buildingsInfo.name.length; i++) {
                        calculateBuildingsCost(i);
                    }
                }
            } else if (stage.current === 3 && upgrade === 10) {
                calculateBuildingsCost(4);
            }
        } else if (type === 'elements') {
            if (player.collapse.show < upgrade) { player.collapse.show = upgrade; } //Lazy way of remembering bought elements
            if (upgrade === 2 || upgrade === 8 || upgrade === 13) {
                for (let i = 1; i < global.buildingsInfo.name.length; i++) {
                    calculateBuildingsCost(i);
                }
            } else if (upgrade === 7 || upgrade === 16 || upgrade === 20 || upgrade === 25) {
                calculateMaxLevel(1, 'researches');
            } else if (upgrade === 9 || upgrade === 17) {
                calculateMaxLevel(0, 'researches');
            } else if (upgrade === 11) {
                calculateMaxLevel(2, 'researches');
            }
        }
        if (global.screenReader) { getId('invisibleBought').textContent = `You have ${type !== 'elements' ? 'bought upgrade' : 'obtained element'} '${global[typeInfo].description[upgrade]}'`; }
    }

    /* Because each price can use different property, so have to do it this way... */
    if (stage.current === 1) {
        player.discharge.energyCur = currency;
    } else if (stage.current === 2) {
        player.buildings[1].current = currency;
    } else /*if (stage.current === 3 || stage.current === 4)*/ {
        player.buildings[0].current = currency;
    }

    numbersUpdate();
    getUpgradeDescription(upgrade, type);
    visualUpdateUpgrades(upgrade, type);
};

export const calculateMaxLevel = (research: number, type: 'researches' | 'researchesExtra' | 'researchesAuto') => {
    const { stage } = player;

    if (type === 'researchesAuto' && research === 1) {
        global.researchesAutoInfo.max[1] = global.buildingsInfo.name.length - 1;
    } else if (stage.current === 3 && type === 'researchesExtra' && research === 0) {
        global.researchesExtraS3Info.max[0] = player.accretion.rank <= 2 ? 12 : 29;
    } else if (stage.current === 4 && type === 'researches') {
        if (research === 0) {
            global.researchesS4Info.max[0] = 3 + (3 * player.researches[2]);
            if (player.elements[9] === 1) { global.researchesS4Info.max[0] += 12; }
            if (player.elements[17] === 1) { global.researchesS4Info.max[0] += 27; }
        } else if (research === 1) {
            global.researchesS4Info.max[1] = 2;
            if (player.elements[7] === 1) { global.researchesS4Info.max[1] += 2; }
            for (const i of [16, 20, 25]) {
                if (player.elements[i] === 1) { global.researchesS4Info.max[1] += 1; }
            }
        } else if (research === 2) {
            global.researchesS4Info.max[2] = player.elements[11] === 1 ? 2 : 1;
        }
    }

    calculateResearchCost(research, type);
    visualUpdateUpgrades(research, type);
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
            toggle.style.color = 'var(--red-text-color)';
            toggle.style.borderColor = 'crimson';
            if (global.screenReader) { toggle.ariaLabel = toggle.ariaLabel?.replace(' ON', ' OFF') ?? ''; } //I have no idea if textcontent will be read along with aria-label...
        } else {
            toggle.textContent = 'ON';
            toggle.style.color = '';
            toggle.style.borderColor = '';
            if (global.screenReader) { toggle.ariaLabel = toggle.ariaLabel?.replace(' OFF', ' ON') ?? ''; }
        }
    } else {
        if (!toggles[type][number]) {
            toggle.textContent = 'Auto OFF';
            toggle.style.color = 'var(--red-text-color)';
            toggle.style.borderColor = 'crimson';
        } else {
            toggle.textContent = 'Auto ON';
            toggle.style.color = '';
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
            input.value = format(shop.input, 0, 'input');
            break;
        case 'strict':
            shop.strict = !shop.strict;
            break;
        default:
            input.value = format(shop.input, 0, 'input');
    }
    getId('buyStrict').style.borderColor = shop.strict ? '' : 'crimson';
    getId('buyStrict').style.color = shop.strict ? '' : 'var(--red-text-color)';
    getId('buy1x').style.backgroundColor = shop.howMany === 1 ? 'green' : '';
    getId('buyAny').style.backgroundColor = Math.abs(shop.howMany) !== 1 ? 'green' : '';
    getId('buyMax').style.backgroundColor = shop.howMany === -1 ? 'green' : '';
    numbersUpdate();
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
            return Alert('You will need a single Drop of water for next one');
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
            return Alert('Look\'s like, it, should have even more Drops');
        }
    } else if (stage.current === 3) {
        if (buildings[0].current >= 2.47e31) {
            let ok = true;
            if (toggles.normal[1]) { ok = await Confirm(message); }
            if (ok) {
                reseted = true;
            }
        } else {
            return Alert('Self sustaining is not yet possible, need more Mass');
        }
    } else if (stage.current === 4) {
        return Alert('Let\'s see the limit');
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

    if (player.upgrades[3] === 1 && player.buildings[1].true > 0) {
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
                Math.round(dischargeInfo.next *= 10); //If discarge cost will change then move it elsewhere
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

    if (player.upgrades[1] === 1 && vaporizationInfo.get >= 1) {
        const { vaporization } = player;

        let ok = true;
        if (player.toggles.normal[3]) {
            ok = await Confirm(`Do you wish to reset buildings and upgrades for ${format(vaporizationInfo.get)} Clouds?`);
        }
        if (ok) {
            vaporization.clouds += vaporizationInfo.get;
            reset('vaporization');
            if (global.screenReader) { getId('invisibleBought').textContent = `Progress were reset for ${format(vaporizationInfo.get)} Clouds`; }
        }
    }
};

export const rankResetCheck = async() => {
    const { accretionInfo } = global;
    const { accretion } = player;

    if (player.buildings[0].current >= accretionInfo.rankCost[accretion.rank] && accretionInfo.rankCost[accretion.rank] !== 0) {
        let ok = true;
        if (player.toggles.normal[4] && accretion.rank !== 0) {
            ok = await Confirm('Increasing Rank will reset buildings, upgrades, stage researches. But you will get closer to your goal');
        }
        if (ok) {
            accretion.rank++;
            reset('rank');
            calculateMaxLevel(0, 'researchesExtra');
            updateRankInfo();
            if (global.screenReader) { getId('invisibleBought').textContent = `Rank is now ${accretionInfo.rankName[accretion.rank]}`; }
        }
    }
};

export const collapseResetCheck = async() => {
    const { collapseInfo } = global;
    const { collapse } = player;

    if (collapseInfo.newMass >= collapse.mass) {
        const { researchesExtra } = player;

        let ok = true;
        if (player.toggles.normal[5]) {
            let message = `This will reset all non automization researches and upgrades. ${collapseInfo.newMass === collapse.mass ? 'Your total Mass won\'t change' : `But your total Mass will be now ${format(collapseInfo.newMass)}`}`;
            if (researchesExtra[0] >= 1) { //This or really long message
                message += `, also you will get ${format(collapseInfo.starCheck[0])} Red giants`;
                if (researchesExtra[0] >= 2) {
                    message += `, ${format(collapseInfo.starCheck[1])} Neutron stars`;
                    if (researchesExtra[0] >= 3) {
                        message += ` and ${format(collapseInfo.starCheck[2])} Black holes`;
                    }
                }
            }
            ok = await Confirm(message);
        }
        if (ok) {
            collapse.mass = collapseInfo.newMass;
            for (let i = 0; i < researchesExtra[0]; i++) {
                collapse.stars[i] += collapseInfo.starCheck[i];
            }
            reset('collapse');
            calculateMaxLevel(0, 'researches');
            calculateMaxLevel(1, 'researches');
            calculateMaxLevel(2, 'researches');
            if (global.screenReader) {
                let message = `Your Mass has increased to ${format(collapse.mass)}`;
                if (researchesExtra[0] >= 1) {
                    message += `, Red giants to ${format(collapse.stars[0])}`;
                    if (researchesExtra[0] >= 2) {
                        message += `, Neutron stars - ${format(collapse.stars[1])}`;
                        if (researchesExtra[0] >= 3) {
                            message += ` and Black holes - ${format(collapse.stars[2])}`;
                        }
                    }
                }
                getId('invisibleBought').textContent = message;
            }
        }
    }
};
