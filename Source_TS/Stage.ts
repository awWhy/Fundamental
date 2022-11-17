import { checkBuilding, checkUpgrade } from './Check';
import { getId } from './Main';
import { getUpgradeType, global, globalStart, player } from './Player';
import { reset } from './Reset';
import { Alert, Confirm, switchTheme } from './Special';
import { format, getUpgradeDescription, invisibleUpdate, numbersUpdate, stageCheck, updateRankInfo, visualUpdateUpgrades } from './Update';

export const calculateStageInformation = () => {
    const { stage, buildings, upgrades, researches, researchesExtra, strangeness } = player;
    const { buildingsInfo } = global;

    if (stage.true >= 5) {
        global.strangeInfo.stageGain = 0;
        if (stage.current >= 4) {
            if (player.elements[27] === 1) { global.strangeInfo.stageGain += 1; }
            if (player.elements[28] === 1) { global.strangeInfo.stageGain += Math.trunc((Math.log10(player.buildings[0].current) - 55) / 2.5); }
        }
        //global.strangeInfo.producing[0] = 0;
    }
    if (stage.current === 1) {
        const { dischargeInfo, upgradesInfo, researchesInfo } = global;
        const { discharge } = player;

        dischargeInfo.base = 4 + strangeness[0][0];
        upgradesInfo.effect[3] = dischargeInfo.base * 2 ** researches[4];
        upgradesInfo.effect[5] = Math.round((1.02 + 0.01 * researches[1]) * 100) / 100;
        const totalMultiplier = upgradesInfo.effect[3] ** (discharge.current + strangeness[0][2]);

        buildingsInfo.producing[3] = 0.3 * buildings[3].current * totalMultiplier;
        if (upgrades[5] === 1) { buildingsInfo.producing[3] *= upgradesInfo.effect[5] ** buildings[3].true; }

        researchesInfo.effect[2] = 12 + strangeness[0][5] * 3 / 10;
        if (buildingsInfo.producing[3] > 1) { //Because Math.log(0) === -infinity and Math.log(1) === 0
            upgradesInfo.effect[6] = Math.log(buildingsInfo.producing[3]) * researchesInfo.effect[2] ** player.researches[2]; //Add Math.min if [3] === Infinity
            if (upgrades[7] === 1) { upgradesInfo.effect[6] *= discharge.energyCur; }
            if (researches[5] >= 1) { upgradesInfo.effect[6] *= (discharge.current + strangeness[0][2] + 1) * researches[5]; }
        } else { upgradesInfo.effect[6] = 0; }

        buildingsInfo.producing[2] = 0.4 * buildings[2].current * totalMultiplier;
        if (upgrades[2] === 1) { buildingsInfo.producing[2] *= 5; }
        if (upgrades[5] === 1) { buildingsInfo.producing[2] *= upgradesInfo.effect[5] ** buildings[2].true; }

        buildingsInfo.producing[1] = 0.5 * buildings[1].current * totalMultiplier;
        if (upgrades[1] === 1) { buildingsInfo.producing[1] *= 10; }
        if (upgrades[5] === 1) { buildingsInfo.producing[1] *= upgradesInfo.effect[5] ** buildings[1].true; }

        dischargeInfo.step = 10 - researches[3] - strangeness[0][1];
        dischargeInfo.next = Math.round(dischargeInfo.step ** player.discharge.current);
        if (discharge.energyMax < discharge.energyCur) { discharge.energyMax = discharge.energyCur; }
    } else if (stage.current === 2) {
        const { vaporizationInfo, upgradesS2Info, researchesExtraS2Info } = global;
        const { vaporization } = player;

        buildingsInfo.producing[5] = 2 * buildings[5].current;
        researchesExtraS2Info.effect[2] = vaporization.clouds ** 0.1;
        if (researchesExtra[2] >= 1) { buildingsInfo.producing[5] *= researchesExtraS2Info.effect[2]; }

        if (upgrades[6] === 1) { buildings[4].current = buildings[4].true + buildings[5].current; }

        buildingsInfo.producing[4] = 2 * buildings[4].current;
        if (buildingsInfo.producing[5] > 1) { buildingsInfo.producing[4] *= buildingsInfo.producing[5]; }

        upgradesS2Info.effect[5] = 1 + researches[5];
        if (upgrades[5] === 1) { buildings[3].current = buildings[3].true + buildings[4].current * upgradesS2Info.effect[5]; }

        buildingsInfo.producing[3] = 2 * buildings[3].current;
        if (buildingsInfo.producing[4] > 1) { buildingsInfo.producing[3] *= buildingsInfo.producing[4]; }

        upgradesS2Info.effect[4] = 1 + researches[4];
        if (upgrades[4] === 1) { buildings[2].current = buildings[2].true + buildings[3].current * upgradesS2Info.effect[4]; }

        buildingsInfo.producing[2] = 2 * buildings[2].current * vaporization.clouds;
        upgradesS2Info.effect[2] = 0.02 + researches[2] * 0.02;
        upgradesS2Info.effect[3] = 0.02 + researches[3] * 0.03;
        if (upgrades[2] === 1 && researches[1] >= 2) {
            buildingsInfo.producing[2] *= buildings[0].total ** upgradesS2Info.effect[2];
        } else if (upgrades[2] === 1) {
            buildingsInfo.producing[2] *= buildings[0].current ** upgradesS2Info.effect[2];
        }
        if (upgrades[3] === 1 && researches[1] >= 1) {
            buildingsInfo.producing[2] *= buildings[1].total ** upgradesS2Info.effect[3];
        } else if (upgrades[3] === 1) {
            buildingsInfo.producing[2] *= buildings[1].current ** upgradesS2Info.effect[3];
        }
        if (buildingsInfo.producing[3] > 1) { buildingsInfo.producing[2] *= buildingsInfo.producing[3]; }
        if (strangeness[1][1] >= 1) { buildingsInfo.producing[2] *= 2 ** strangeness[1][1]; }

        researchesExtraS2Info.effect[1] = 10 ** (player.researchesExtra[1] - 1);

        if (buildings[0].current < 0.0028 && buildings[1].current === 0) { buildings[0].current = 0.0028; }
        if (buildings[1].current < buildings[1].true) {
            buildings[1].true = Math.trunc(buildings[1].current);
            calculateBuildingsCost(1);
        }

        buildingsInfo.producing[1] = 0.0006 * buildings[1].current;
        if (researches[0] >= 1) { buildingsInfo.producing[1] *= 3 ** researches[0]; }
        if (upgrades[0] === 1) { buildingsInfo.producing[1] *= 1.1 ** buildings[1].true; }
        if (strangeness[1][0] >= 1) { buildingsInfo.producing[1] *= 2 ** strangeness[1][0]; }

        vaporizationInfo.get = (researchesExtra[0] === 0 ? buildings[1].current : buildings[1].total) / 1e10;
        if (strangeness[1][3] >= 1) { vaporizationInfo.get *= 5 ** strangeness[1][3]; }
        if (vaporizationInfo.get > 1) { //1e4 is softcap, game will force calculation as if you already at softcap if you reached 1e4 total clouds
            const check = vaporizationInfo.get ** 0.6 + vaporization.clouds;
            const calculate = (check - 1e4 > 0) ? Math.max(1e4 - vaporization.clouds, 1) : 1;
            vaporizationInfo.get = calculate + (vaporizationInfo.get - calculate) ** (check > 1e4 ? 0.36 : 0.6);
        }
    } else if (stage.current === 3) {
        const { upgradesS3Info, researchesS3Info, researchesExtraS3Info } = global;
        const { accretion } = player;

        buildingsInfo.producing[4] = (upgrades[11] === 1 ? 1.15 : 1.1) ** buildings[4].current;

        buildingsInfo.producing[3] = 0.1 * buildings[3].current;
        if (upgrades[4] === 1 && researchesExtra[2] > 0) { buildingsInfo.producing[3] *= 2; }
        if (buildingsInfo.producing[4] > 1) { buildingsInfo.producing[3] *= buildingsInfo.producing[4]; }
        if (strangeness[2][1] >= 1) { buildingsInfo.producing[3] *= 2 ** strangeness[2][1]; }

        buildingsInfo.producing[2] = 0.1 * buildings[2].current;
        researchesS3Info.effect[5] = buildings[0].current ** (0.025 * researches[5]);
        if (upgrades[3] === 1) { buildingsInfo.producing[2] *= 1.02 ** buildings[2].true; }
        if (upgrades[4] === 1) { buildingsInfo.producing[2] *= 4; }
        if (researches[2] >= 1) { buildingsInfo.producing[2] *= 3 ** researches[2]; }
        if (researches[4] >= 1) { buildingsInfo.producing[2] *= 5 ** researches[4]; }
        if (researches[5] >= 1) { buildingsInfo.producing[2] *= researchesS3Info.effect[5]; }
        if (strangeness[2][1] >= 1) { buildingsInfo.producing[2] *= 2 ** strangeness[2][1]; }
        if (strangeness[2][3] >= 1) { buildingsInfo.producing[2] *= buildingsInfo.producing[4]; }

        buildingsInfo.producing[1] = 5e-20 * buildings[1].current;
        upgradesS3Info.effect[0] = 1.01 + 0.01 * researches[1];
        upgradesS3Info.effect[1] = buildings[1].current ** (0.05 + 0.01 * researchesExtra[3]);
        upgradesS3Info.effect[7] = 2 * 1.5 ** researches[6];
        upgradesS3Info.effect[9] = 10 * 3 ** researches[7];
        researchesExtraS3Info.effect[0] = 1.1 ** researchesExtra[0];
        researchesExtraS3Info.effect[1] = (1 + 0.1 * researchesExtra[1]) ** accretion.rank;
        if (upgrades[0] === 1) { buildingsInfo.producing[1] *= upgradesS3Info.effect[0] ** buildings[1].true; }
        if (upgrades[1] === 1) { buildingsInfo.producing[1] *= upgradesS3Info.effect[1]; }
        if (upgrades[2] === 1) { buildingsInfo.producing[1] *= 2; }
        if (upgrades[5] === 1) { buildingsInfo.producing[1] *= 3; }
        if (upgrades[7] === 1) { buildingsInfo.producing[1] *= upgradesS3Info.effect[7]; }
        if (upgrades[8] === 1) { buildingsInfo.producing[1] *= 2; }
        if (upgrades[9] === 1) { buildingsInfo.producing[1] *= upgradesS3Info.effect[9]; }
        if (researches[0] >= 1) { buildingsInfo.producing[1] *= 3 ** researches[0]; }
        if (researches[3] >= 1) { buildingsInfo.producing[1] *= 2 ** researches[3]; }
        if (researchesExtra[0] >= 1) { buildingsInfo.producing[1] *= researchesExtraS3Info.effect[0]; }
        if (researchesExtra[1] >= 1) { buildingsInfo.producing[1] *= researchesExtraS3Info.effect[1]; }
        if (strangeness[2][0] >= 1) { buildingsInfo.producing[1] *= 2 ** strangeness[2][0]; }
        if (strangeness[2][3] >= 1) { buildingsInfo.producing[1] *= buildingsInfo.producing[4]; }
        if (accretion.rank >= 5) { //I know that close to 1, softcap is at weakest point
            buildingsInfo.producing[1] **= buildingsInfo.producing[1] < 1 ? 1.1 : 0.8;
        }
    } else if (stage.current >= 4) {
        const { collapse, elements } = player;
        const { collapseInfo, researchesS4Info } = global;

        researchesS4Info.effect[0] = (1.1 + 0.2 * researches[2]) ** researches[0];
        researchesS4Info.effect[1] = (1 + (0.01 * Math.min(researches[1], 5)) + (researches[1] > 5 ? 0.005 * (researches[1] - 5) : 0)) ** (buildings[1].true + buildings[2].true + buildings[3].true + buildings[4].true);
        if (researchesS4Info.effect[1] > 1e10) { researchesS4Info.effect[1] = 1e10 + (researchesS4Info.effect[1] - 1e10) ** 0.70; }
        let redGiantEffect = collapse.stars[0] + 1;
        if (elements[6] === 1) { redGiantEffect **= 1.5; }
        let neutronStarEffect = (collapse.stars[1] + (elements[22] === 1 ? collapse.stars[0] + 1 : 1)) ** 0.5;
        if (elements[12] === 1 && collapse.stars[1] > 10) { neutronStarEffect *= Math.log10(collapse.stars[1] + (elements[22] === 1 ? collapse.stars[0] : 0)); }
        const blackHoleEffect = collapse.stars[2] >= 1 ? (collapse.stars[2] + 1) / Math.log10(collapse.stars[2] + (elements[18] === 1 ? 9 : 99)) : 1;
        let totalMultiplier = (collapse.mass ** (elements[21] === 1 ? 1.1 : 1)) * researchesS4Info.effect[0] * researchesS4Info.effect[1] * neutronStarEffect;
        if (elements[4] === 1) { totalMultiplier *= 1.1; }
        if (elements[19] === 1) { totalMultiplier *= 3; }
        if (elements[23] === 1 && collapse.stars[2] > 10) { totalMultiplier *= Math.log10(collapse.stars[2]); }
        if (elements[24] === 1) { totalMultiplier *= buildings[0].current ** 0.01; }
        if (elements[26] === 1) { totalMultiplier *= 2; }
        if (strangeness[3][0] >= 1) { totalMultiplier *= 1.5 ** strangeness[3][0]; }

        buildingsInfo.producing[4] = 1.4e9 * buildings[4].current * totalMultiplier;

        buildingsInfo.producing[3] = 2e7 * buildings[3].current * totalMultiplier;

        buildingsInfo.producing[2] = 240 * buildings[2].current * redGiantEffect * totalMultiplier;
        if (researches[3] >= 1) { buildingsInfo.producing[2] *= 10; }
        if (researchesExtra[1] >= 1) { buildingsInfo.producing[2] *= collapse.stars[0] + 1; }

        buildingsInfo.producing[1] = 16 * buildings[1].current * totalMultiplier;
        if (elements[1] === 1) { buildingsInfo.producing[1] *= 2; }

        let massGain = 0.004;
        if (elements[3] === 1) { massGain += 0.001; }
        if (elements[5] === 1) { massGain += 0.00015 * buildings[1].true; }
        if (elements[10] === 1) { massGain *= 2; }
        if (elements[14] === 1) { massGain *= 1.4; }
        collapseInfo.newMass = (buildings[1].true + (elements[15] === 1 ? buildings[2].true + buildings[3].true + buildings[4].true : 0)) * massGain * blackHoleEffect;

        collapseInfo.starCheck[0] = Math.max(buildings[2].true + Math.trunc(buildings[1].true * strangeness[3][3] / 4) - collapse.stars[0], 0);
        collapseInfo.starCheck[1] = Math.max(buildings[3].true - collapse.stars[1], 0);
        collapseInfo.starCheck[2] = Math.max(buildings[4].true - collapse.stars[2], 0);
    }
};

export const buyBuilding = (index: number, auto = false) => {
    const { stage, buildings } = player;
    const { buildingsInfo, screenReader } = global;

    if (!checkBuilding(index)) { return; }

    if (!isFinite(buildingsInfo.cost[index])) {
        if (screenReader && !auto) {
            getId('invisibleBought').textContent = `Coudn't make '${buildingsInfo.name[index]}', because cost is infinity`;
        }
        return;
    }

    let extra = index - 1; //What you are paying
    if (stage.current === 2 && index !== 1) {
        extra = 1; //Drops
    } else if (stage.current >= 3) {
        extra = 0; //Mass || Elements
    }
    let keep = 2;
    if (buildings[index].true === 0 || buildings[extra].current > 1e300) { keep = 1; }

    if (buildings[extra].current / (auto ? keep : 1) < buildingsInfo.cost[index]) {
        if (screenReader && !auto) {
            getId('invisibleBought').textContent = `Coudn't make '${buildingsInfo.name[index]}', because didn't had enough of '${buildingsInfo.name[extra]}'`;
        }
        return;
    }

    const { researchesAuto } = player;
    const { shop } = player.toggles;
    const howMany = auto ? -1 : player.researchesAuto[0] === 0 ? 1 : shop.howMany;
    if (stage.current === 1 && index === 1) { global.dischargeInfo.energyType[index] = globalStart.dischargeInfo.energyType[index] + 1 * player.strangeness[0][4]; }

    if (howMany !== 1 && researchesAuto[0] > 0) {
        //Increase must be > 1 (if < 1, then use (1 - increase) and (1 - increase ** levels))
        let budget = buildings[extra].current / (auto ? keep : 1); //How much need to spend
        const totalBefore = buildingsInfo.startCost[index] * ((buildingsInfo.increase[index] ** buildings[index].true - 1) / (buildingsInfo.increase[index] - 1)); //How much already payed for
        const maxAfford = Math.trunc(Math.log((totalBefore + budget) * (buildingsInfo.increase[index] - 1) / buildingsInfo.startCost[index] + 1) / Math.log(buildingsInfo.increase[index])) - buildings[index].true; //Max amount that can be afforded
        if (shop.strict && maxAfford < howMany && howMany !== -1) { return; }
        let canAfford = howMany !== -1 ? Math.min(maxAfford, howMany) : maxAfford;
        let total = buildingsInfo.startCost[index] * ((buildingsInfo.increase[index] ** (canAfford + buildings[index].true) - 1) / (buildingsInfo.increase[index] - 1)) - totalBefore; //How much you need to pay

        if (!isFinite(total) || !isFinite(canAfford)) { /* Fallback */
            let cost = buildingsInfo.cost[index];
            for (canAfford = 0, total = 0; budget >= cost; canAfford++) {
                total += cost;
                budget -= cost;
                cost *= buildingsInfo.increase[index];
            }
        }

        buildings[extra].current -= total;
        buildings[index].current += canAfford;
        buildings[index].true += canAfford;
        buildings[index].total += canAfford;
        buildings[index].trueTotal += canAfford;

        if (stage.current === 1) { player.discharge.energyCur += global.dischargeInfo.energyType[index] * canAfford; }
        if (global.screenReader && !auto) {
            getId('invisibleBought').textContent = `Maded ${format(canAfford)} '${buildingsInfo.name[index]}'${stage.current === 1 ? `, gained ${format(global.dischargeInfo.energyType[index] * canAfford)} Energy` : ''}`;
        }
    } else {
        buildings[extra].current -= buildingsInfo.cost[index];
        buildings[index].current++;
        buildings[index].true++;
        buildings[index].total++;
        buildings[index].trueTotal++;

        if (stage.current === 1) { player.discharge.energyCur += global.dischargeInfo.energyType[index]; }
        if (global.screenReader) {
            getId('invisibleBought').textContent = `Made 1 '${buildingsInfo.name[index]}'${stage.current === 1 ? `, gained ${format(global.dischargeInfo.energyType[index])} Energy` : ''}`;
        }
    }
    calculateBuildingsCost(index);
    invisibleUpdate();
    numbersUpdate();
};

export const calculateBuildingsCost = (index: number) => {
    const { stage, buildings } = player;
    const { buildingsInfo } = global;

    if (stage.current === 1) {
        global.upgradesInfo.effect[4] = (20 + player.researches[0]) / 100; //(0.2 + 1 / 100) / 100
        buildingsInfo.increase[index] = Math.round((1.4 - (player.upgrades[4] === 1 ? global.upgradesInfo.effect[4] : 0)) * 100) / 100;
        if (index === 1) { buildingsInfo.startCost[1] = globalStart.buildingsInfo.startCost[1] / (player.upgrades[0] === 1 ? 10 : 1); }
    } else if (stage.current === 3 && index === 4) {
        buildingsInfo.increase[4] = player.upgrades[10] === 1 ? 5 : 10;
    } else if (stage.current >= 4) {
        buildingsInfo.increase[index] = Math.round(((1.4 + 0.15 * (index - 1)) - (player.elements[2] === 1 ? 0.1 : 0) - (player.elements[8] === 1 ? 0.05 : 0)) * 100) / 100;
        buildingsInfo.startCost[index] = globalStart.buildingsInfo.startCost[index] / (player.elements[13] === 1 ? 1e3 : 1) / 2 ** player.strangeness[3][1];
    }

    buildingsInfo.cost[index] = buildingsInfo.startCost[index] * buildingsInfo.increase[index] ** buildings[index].true;
};

export const calculateResearchCost = (research: number, type: 'researches' | 'researchesExtra' | 'researchesAuto' | 'strangeness', extra = 0) => {
    const { stage } = player;

    if (type !== 'strangeness') {
        let typeInfo = 'researchesAutoInfo' as 'researchesAutoInfo' | 'researchesS2Info';
        if (type !== 'researchesAuto') { typeInfo = getUpgradeType(type) as 'researchesS2Info'; }

        if (player[type][research] === global[typeInfo].max[research]) { return; }

        if (stage.current === 1) {
            global[typeInfo].cost[research] = globalStart[typeInfo].cost[research] + global[typeInfo].scaling[research] * player[type][research];
        } else {
            global[typeInfo].cost[research] = globalStart[typeInfo].cost[research] * global[typeInfo].scaling[research] ** player[type][research];
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
    } else {
        const typeInfo = 'strangenessInfo' as const;

        if (player[type][extra][research] === global[typeInfo][extra].max[research]) { return; }

        global[typeInfo][extra].cost[research] = Math.trunc(Math.round((globalStart[typeInfo][extra].cost[research] + global[typeInfo][extra].scaling[research] * player[type][extra][research]) * 100) / 100);
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
    if (stage.current >= 4) { get = 0; }
    if (stage.current === 3 && player.accretion.rank < 5 && buildings[0].current + add > 1e30) {
        buildings[0].current = 1e30;
        return;
    }

    if (buildings[get].current >= 1e308) { return; } //Just === would be better, but this allows to detect bugs
    let check = buildings[get].current + add;
    buildings[get].current = isFinite(check) ? check : 1e308;

    check = buildings[get].total + add;
    buildings[get].total = isFinite(check) ? check : 1e308;

    check = buildings[get].trueTotal + add;
    buildings[get].trueTotal = isFinite(check) ? check : 1e308;
};

export const buyUpgrades = (upgrade: number, type: 'upgrades' | 'elements' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'strangeness', check = 0) => {
    const { stage } = player;
    if (type !== 'strangeness') {
        if (check <= 3 && check !== 0) {
            if (check !== stage.current) { return; }
        } else if (check >= 4 && stage.current < 4) { return; }
        if (type !== 'elements' && !checkUpgrade(upgrade, type)) { return; }
    }

    let currency: number;
    if (type === 'strangeness') {
        currency = player.strange[0].true;
    } else if (stage.current === 1) {
        currency = player.discharge.energyCur;
    } else if (stage.current === 2) {
        currency = player.buildings[1].current;
    } else /*if (stage.current >= 3)*/ {
        currency = player.buildings[0].current;
    }

    if (type === 'researches' || type === 'researchesAuto' || type === 'researchesExtra') {
        let typeInfo = 'researchesAutoInfo' as 'researchesAutoInfo' | 'researchesS2Info';
        if (type !== 'researchesAuto') { typeInfo = getUpgradeType(type) as 'researchesS2Info'; }

        if (player[type][upgrade] === global[typeInfo].max[upgrade] || currency < global[typeInfo].cost[upgrade]) { return; }
        player[type][upgrade]++;
        currency -= global[typeInfo].cost[upgrade];

        /* Special cases */
        if (stage.current === 1 && type === 'researches' && upgrade === 0) {
            for (let i = 1; i < global.buildingsInfo.name.length; i++) {
                calculateBuildingsCost(i);
            }
        } else if (stage.current >= 4 && type === 'researches' && upgrade === 2) {
            calculateMaxLevel(0, 'researches');
        }
        if (global.screenReader) { getId('invisibleBought').textContent = `You have researched '${global[typeInfo].description[upgrade]}', level is now ${player[type][upgrade]} ${player[type][upgrade] === global[typeInfo].max[upgrade] ? 'maxed' : ''}`; }

        calculateResearchCost(upgrade, type);
    } else if (type === 'upgrades' || type === 'elements') {
        let typeInfo = 'elementsInfo' as 'elementsInfo' | 'upgradesS2Info';
        if (type !== 'elements') { typeInfo = getUpgradeType(type) as 'upgradesS2Info'; }

        if (player[type][upgrade] === 1 || currency < global[typeInfo].cost[upgrade]) { return; }
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
            } else if (upgrade === 26 && stage.current === 4) {
                manualEnterStage();
            }
        }
        if (global.screenReader) { getId('invisibleBought').textContent = `You have ${type !== 'elements' ? 'created upgrade' : 'obtained element'} '${global[typeInfo].description[upgrade]}'`; }
    } else {
        const typeInfo = 'strangenessInfo' as const;

        if (player[type][check][upgrade] === global[typeInfo][check].max[upgrade] || currency < global[typeInfo][check].cost[upgrade]) { return; }
        player[type][check][upgrade]++;
        currency -= global[typeInfo][check].cost[upgrade];

        /* Special cases */
        if (check === stage.current - 1 && (((check === 0 || check === 3) && upgrade === 6) || ((check === 1 || check === 2) && upgrade === 5))) { //Auto only to save space
            player.researchesAuto[1] = Math.max(player.strangeness[check][upgrade], player.researchesAuto[1]);
            calculateResearchCost(1, 'researchesAuto');
            visualUpdateUpgrades(1, 'researchesAuto');
        } else if (check === 0) {
            if (stage.current === 1) {
                if (upgrade === 4) {
                    for (let i = 1; i < global.buildingsInfo.name.length; i++) {
                        calculateBuildingsCost(i);
                    }
                }
            }
            if (upgrade === 7) {
                player.researchesAuto[0] = Math.max(1, player.researchesAuto[0]);
                calculateMaxLevel(0, 'researchesAuto');
            }
        } else if (check === 1) {
            if (stage.current === 2) {
                if (upgrade === 2) {
                    if (player.strangeness[1][2] < 3) { calculateMaxLevel(4, 'researches'); }
                    if (player.strangeness[1][2] === 2) { calculateMaxLevel(5, 'researches'); }
                }
            }
            if (upgrade === 6) {
                player.researchesAuto[2] = Math.max(1, player.researchesAuto[2]);
                calculateMaxLevel(2, 'researchesAuto');
            }
        } else if (check === 2) {
            if (stage.current === 3) {
                if (upgrade === 2) {
                    calculateMaxLevel(0, 'researchesExtra');
                    calculateMaxLevel(1, 'researchesExtra');
                }
            }
            if (upgrade === 6) {
                calculateMaxLevel(3, 'researchesAuto');
            }
        } else if (check === 3) {
            if (stage.current === 4) {
                if (upgrade === 1) {
                    for (let i = 1; i < global.buildingsInfo.name.length; i++) {
                        calculateBuildingsCost(i);
                    }
                }
            }
        }
        if (global.screenReader) { getId('invisibleBought').textContent = `You have researched ${global[typeInfo][check].description[upgrade]} for ${global.stageInfo.word[check]} stage, level is now ${player[type][check][upgrade]} ${player[type][check][upgrade] === global[typeInfo][check].max[upgrade] ? 'maxed' : ''}`; }

        calculateResearchCost(upgrade, type, check);
    }

    /* Because each price can use different property, so have to do it this way... */
    if (type === 'strangeness') {
        player.strange[0].true = currency;
    } else if (stage.current === 1) {
        player.discharge.energyCur = currency;
    } else if (stage.current === 2) {
        player.buildings[1].current = currency;
    } else /*if (stage.current >= 3)*/ {
        player.buildings[0].current = currency;
    }

    numbersUpdate();
    getUpgradeDescription(upgrade, type, check);
    visualUpdateUpgrades(upgrade, type, check);
    if (stage.current === 1 && player.toggles.auto[1] && type !== 'strangeness') { void dischargeResetCheck('upgrade'); }
};

export const calculateMaxLevel = (research: number, type: 'researches' | 'researchesExtra' | 'researchesAuto', extra = 0) => {
    const { stage } = player;

    if (type === 'researchesAuto') {
        if (research === 0) {
            global.researchesAutoInfo.max[0] = player.strangeness[0][7] + 1;
        } else if (research === 1) {
            global.researchesAutoInfo.max[1] = global.buildingsInfo.name.length - 1;
        } else if (research === 2) {
            global.researchesAutoInfo.max[2] = player.strangeness[1][6] + 1;
        } else if (research === 3) {
            global.researchesAutoInfo.max[3] = player.strangeness[2][6];
        }
    } else if (type === 'researches') {
        if (stage.current === 2) {
            if (research === 4) {
                global.researchesS2Info.max[4] = 2 + Math.min(player.strangeness[1][2], 2);
            } else if (research === 5) {
                global.researchesS2Info.max[5] = 2;
                if (player.strangeness[1][2] >= 2) { global.researchesS2Info.max[5] += 1; }
            }
        } else if (stage.current >= 4) {
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
    } else if (type === 'researchesExtra') {
        if (stage.current === 3) {
            if (research === 0) {
                global.researchesExtraS3Info.max[0] = 12;
                if (player.accretion.rank >= 3) { global.researchesExtraS3Info.max[0] += 17; }
                if (player.strangeness[2][2] >= 1) { global.researchesExtraS3Info.max[0] += 10 * player.strangeness[2][2]; }
            } else if (research === 1) {
                global.researchesExtraS3Info.max[1] = 5;
                if (player.strangeness[2][2] >= 1) { global.researchesExtraS3Info.max[1] += 1 * player.strangeness[2][2]; }
            }
        }
    }

    calculateResearchCost(research, type, extra);
    visualUpdateUpgrades(research, type, extra);
    if (type !== 'researchesAuto') { autoBuyUpgrades(type, true, research); }
};

export const autoBuyUpgrades = (type: 'upgrades' | 'researches' | 'researchesExtra', setArray = false, whichAdd = 'all' as 'all' | number) => {
    let auto: 'autoU' | 'autoR' | 'autoE';
    switch (type) {
        case 'upgrades':
            if (!player.toggles.auto[5] || player.researchesAuto[3] < 1) { return; }
            auto = 'autoU';
            break;
        case 'researches':
            if (!player.toggles.auto[6] || player.researchesAuto[3] < 2) { return; }
            auto = 'autoR';
            break;
        case 'researchesExtra':
            if (!player.toggles.auto[7] || player.researchesAuto[3] < 3) { return; }
            auto = 'autoE';
    }
    const { automatization } = global;
    const typeInfo = getUpgradeType(type) as 'researchesS2Info';
    let sort = false;
    if (setArray) {
        if (whichAdd === 'all') {
            automatization[auto] = [];
            for (let i = 0; i < global[typeInfo].cost.length; i++) {
                if (player[type][i] < (type === 'upgrades' ? 1 : global[typeInfo].max[i])) {
                    automatization[auto].push([i, global[typeInfo].cost[i]]);
                }
            }
            sort = true;
        } else { //type !== 'upgrades'
            if (!automatization[auto].some((a) => a[0] === whichAdd)) {
                automatization[auto].push([whichAdd, global[typeInfo].cost[whichAdd]]);
                sort = true;
            }
        }
    } else {
        for (let i = 0; i < automatization[auto].length; i++) {
            const index = automatization[auto][i][0]; //Faster this way

            if (!checkUpgrade(index, type)) { continue; }
            buyUpgrades(index, type); //Some upgrades inside can get inserted into old index spot
            if (index !== automatization[auto][i][0]) { continue; }

            if (player[type][index] === (type === 'upgrades' ? 1 : global[typeInfo].max[index])) {
                automatization[auto].splice(i, 1);
            } else {
                if (type === 'upgrades' || automatization[auto][i][1] === global[typeInfo].cost[index]) {
                    break;
                } else {
                    automatization[auto][i][1] = global[typeInfo].cost[index];
                    sort = true;
                }
            }
        }
    }
    if (sort) { automatization[auto].sort((a, b) => a[1] - b[1]); }
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

    if (change) {
        toggles[type][number] = !toggles[type][number];
        if (type === 'buildings') {
            if (number === 0) {
                for (let i = 1; i < toggles.buildings.length; i++) {
                    toggles.buildings[i] = toggles.buildings[0];
                    toggleSwap(i, 'buildings');
                }
            } else {
                toggles.buildings[0] = toggles.buildings.includes(true, 1);
                toggleSwap(0, 'buildings');
            }
        }
    }

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
            toggle.textContent = type === 'buildings' && number === 0 ? 'All OFF' : 'Auto OFF';
            toggle.style.color = 'var(--red-text-color)';
            toggle.style.borderColor = 'crimson';
        } else {
            toggle.textContent = type === 'buildings' && number === 0 ? 'All ON' : 'Auto ON';
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

export const stageResetCheck = async(auto = false) => {
    const { stage, buildings, researchesAuto, toggles } = player;
    let reseted = false;

    if (auto && stage.resets < 15) { return; }

    if (stage.current === 1) {
        if (buildings[3].current >= 1.67e21) {
            let ok = true;
            if (toggles.normal[1] && !auto) { ok = await Confirm('Ready to enter next stage? Next one will be harder than current.\nYou might want to turn off all auto\'s first'); }
            if (ok) {
                if (researchesAuto[0] === 0) { researchesAuto[0]++; }
                reseted = true;
            }
        } else {
            if (auto) { return; }
            return Alert('You will need a single Drop of water for next one');
        }
    } else if (stage.current === 2) {
        if (buildings[1].current >= 1.194e29) {
            let ok = true;
            if (toggles.normal[1] && !auto) { ok = await Confirm('Ready to enter next stage? Next one will be harder than current.\nYou might want to turn off all auto\'s first'); }
            if (ok) {
                if (researchesAuto[2] === 0) { researchesAuto[2]++; }
                player.accretion.rank = 0;
                reseted = true;
            }
        } else {
            if (auto) { return; }
            return Alert('Look\'s like, it, should have even more Drops');
        }
    } else if (stage.current === 3) {
        if (buildings[0].current >= 2.47e31 && !auto) {
            let ok = true;
            if (toggles.normal[1]) { ok = await Confirm('Ready to enter next stage? Next one will be harder than current.\nYou might want to turn off all auto\'s first'); }
            if (ok) {
                reseted = true;
            }
        } else {
            if (auto) { return; }
            return Alert('Self sustaining is not yet possible, need more Mass');
        }
    } else if (stage.current === 4) {
        if (auto) { return; }
        if (stage.true > 4) { return Alert('Let\'s reach the limit'); }
        return Alert('Let\'s see the limit');
    } else if (stage.current === 5) {
        if (auto && global.strangeInfo.stageGain + 1 < stage.input) { return; }
        let ok = true;
        if (!auto) {
            if (player.strange[0].total === 0) {
                ok = await Confirm('You will return to first stage. But maybe you will get something in return. Ready?');
            } else if (player.strange[0].total > 0 && toggles.normal[1]) {
                ok = await Confirm(`You will return to first stage. In return you will get ${format(global.strangeInfo.stageGain + 1, 0)} Strange quarks. Ready?`);
            }
        }
        if (ok) {
            player.strange[0].true += global.strangeInfo.stageGain;
            player.strange[0].total += global.strangeInfo.stageGain;
            if (player.strangeness[0][7] < 1) { researchesAuto[0] = 0; }
            if (player.strangeness[1][6] < 1) { researchesAuto[2] = 0; }
            reseted = true;
        }
    }

    if (reseted) {
        stage.resets++;
        if (stage.current < 4) {
            stage.current++;
        } else {
            stage.current = 1;
        }
        stage.true = Math.max(stage.true, stage.current);
        if (stage.true >= 5) {
            player.strange[0].true++;
            player.strange[0].total++;
        }
        researchesAuto[1] = player.strangeness[stage.current - 1][[6, 5, 5, 6][stage.current - 1]];
        reset('stage');
    }
};

/* Only for stage 4 */
const manualEnterStage = () => {
    const { stage } = player;

    stage.current++;
    if (stage.true === 4) {
        Alert('There doesn\'t seem to be anything left, so let\'s try going back instead');
        stage.true++;
    }
    calculateStageInformation();
    stageCheck('soft');
    switchTheme();
};

export const dischargeResetCheck = async(auto = 'false' as 'false' | 'interval' | 'upgrade') => {
    const { dischargeInfo } = global;
    const { discharge } = player;

    if (player.upgrades[3] === 1 && player.buildings[1].true > 0) {
        if (auto === 'interval' && discharge.energyCur < dischargeInfo.next) { return; }
        if (auto !== 'false' && player.strangeness[0][3] < 1) { return; }

        let ok = true;
        if (player.toggles.normal[2] && auto === 'false') {
            if (discharge.energyCur < dischargeInfo.next) {
                ok = await Confirm('This will reset all of your current buildings and Energy. You will NOT gain production boost. Continue?');
            } else {
                ok = await Confirm('You have enough Energy to gain boost. Continue?');
            }
        }
        if (ok) {
            if (discharge.energyCur >= dischargeInfo.next) {
                discharge.current++;
                if (global.screenReader && auto === 'false') { getId('invisibleBought').textContent = 'Buildings and Energy were reset for some boost'; }
            } else if (global.screenReader && auto === 'false') {
                getId('invisibleBought').textContent = 'Buildings and Energy were reset, no boost';
            }
            reset('discharge');
        }
    }
};

export const vaporizationResetCheck = async(auto = false) => {
    const { vaporizationInfo } = global;
    const { vaporization } = player;

    if (player.upgrades[1] === 1 && vaporizationInfo.get >= 1) {
        if (auto && (vaporizationInfo.get <= vaporization.clouds * vaporization.input || player.strangeness[1][4] < 1)) { return; }

        let ok = true;
        if (player.toggles.normal[3] && !auto) {
            ok = await Confirm(`Do you wish to reset buildings and upgrades for ${format(vaporizationInfo.get)} Clouds?`);
        }
        if (ok) {
            vaporization.clouds += vaporizationInfo.get;
            reset('vaporization');
            if (global.screenReader) { getId('invisibleBought').textContent = `Progress were reset for ${format(vaporizationInfo.get)} Clouds`; }
        }
    }
};

export const rankResetCheck = async(auto = false) => {
    const { accretionInfo } = global;
    const { accretion } = player;

    if (player.buildings[0].current >= accretionInfo.rankCost[accretion.rank] && accretionInfo.rankCost[accretion.rank] !== 0) {
        if (auto && player.strangeness[2][4] < 1) { return; }

        let ok = true;
        if (player.toggles.normal[4] && accretion.rank !== 0 && !auto) {
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

export const collapseResetCheck = async(auto = false) => {
    const { collapseInfo } = global;
    const { collapse } = player;

    if (player.upgrades[0] === 1 && collapseInfo.newMass >= collapse.mass) {
        const { researchesExtra } = player;
        if (auto) {
            const canIncrease = (researchesExtra[0] >= 1 ? collapse.stars[0] <= (collapse.stars[0] + collapseInfo.starCheck[0]) / collapse.inputS : false) ||
                (researchesExtra[0] >= 2 ? collapse.stars[1] <= (collapse.stars[1] + collapseInfo.starCheck[1]) / collapse.inputS : false) ||
                (researchesExtra[0] >= 3 ? collapse.stars[2] <= (collapse.stars[2] + collapseInfo.starCheck[2]) / collapse.inputS : false);
            if ((collapseInfo.newMass < collapse.mass * collapse.inputM && !canIncrease) || player.strangeness[3][5] < 1) { return; }
        }

        let ok = true;
        if (player.toggles.normal[5] && !auto) {
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
