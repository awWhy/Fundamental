import { checkBuilding, checkUpgrade, milestoneCheck } from './Check';
import { getId } from './Main';
import { global, globalStart, player } from './Player';
import { reset } from './Reset';
import { Alert, Confirm, playEvent } from './Special';
import { format, getUpgradeDescription, numbersUpdate, stageCheck, updateRankInfo, visualUpdateUpgrades } from './Update';

export const calculateStageInformation = () => {
    const { stage, buildings, strange, upgrades, researches, researchesExtra, strangeness } = player;
    const { buildingsInfo, strangeInfo, upgradesInfo, researchesInfo, researchesExtraInfo } = global;
    const activeAll = global.stageInfo.activeAll;

    if (activeAll.includes(1)) {
        const { dischargeInfo } = global;
        const { discharge } = player;

        //dischargeInfo.bonus = strangeness[1][2];
        dischargeInfo.base = 4 + strangeness[1][0];
        upgradesInfo[1].effect[3] = dischargeInfo.base * 2 ** researches[1][4];
        upgradesInfo[1].effect[5] = Math.round((1.02 + 0.01 * researches[1][1]) * 100) / 100;
        const totalMultiplier = upgradesInfo[1].effect[3] ** (discharge.current + strangeness[1][2]);

        buildingsInfo.producing[1][3] = 0.3 * buildings[1][3].current * totalMultiplier;
        if (upgrades[1][5] === 1) { buildingsInfo.producing[1][3] *= upgradesInfo[1].effect[5] ** buildings[1][3].true; }

        researchesInfo[1].effect[2] = 12 + strangeness[1][5] * 3 / 10;
        strangeInfo.stageBoost[1] = strangeness[1][8] >= 1 ? (strange[0].true + 1) ** 0.32 : null;
        if (buildingsInfo.producing[1][3] > 1) { //Because Math.log(0) === -infinity and Math.log(1) === 0
            upgradesInfo[1].effect[6] = Math.log(buildingsInfo.producing[1][3]) * researchesInfo[1].effect[2] ** researches[1][2]; //Add Math.min if [3] === Infinity
            if (upgrades[1][7] === 1) { upgradesInfo[1].effect[6] *= discharge.energyCur; }
            if (researches[1][5] >= 1) { upgradesInfo[1].effect[6] *= (discharge.current + strangeness[1][2] + 1) * researches[1][5]; }
            if (strangeInfo.stageBoost[1] !== null) { upgradesInfo[1].effect[6] *= strangeInfo.stageBoost[1]; }
        } else { upgradesInfo[1].effect[6] = 0; }

        buildingsInfo.producing[1][2] = 0.4 * buildings[1][2].current * totalMultiplier;
        if (upgrades[1][2] === 1) { buildingsInfo.producing[1][2] *= 5; }
        if (upgrades[1][5] === 1) { buildingsInfo.producing[1][2] *= upgradesInfo[1].effect[5] ** buildings[1][2].true; }

        buildingsInfo.producing[1][1] = 0.5 * buildings[1][1].current * totalMultiplier;
        if (upgrades[1][1] === 1) { buildingsInfo.producing[1][1] *= 10; }
        if (upgrades[1][5] === 1) { buildingsInfo.producing[1][1] *= upgradesInfo[1].effect[5] ** buildings[1][1].true; }

        dischargeInfo.step = 10 - researches[1][3] - strangeness[1][1];
        dischargeInfo.next = Math.round(dischargeInfo.step ** player.discharge.current);
        if (discharge.energyMax < discharge.energyCur) {
            discharge.energyMax = discharge.energyCur;
            milestoneCheck(1, 1);
        }
    }
    if (activeAll.includes(2)) {
        const { vaporizationInfo } = global;
        const { vaporization } = player;

        buildingsInfo.producing[2][5] = 2 * buildings[2][5].current;
        researchesExtraInfo[2].effect[2] = vaporization.clouds ** 0.1;
        if (researchesExtra[2][2] >= 1) { buildingsInfo.producing[2][5] *= researchesExtraInfo[2].effect[2]; }

        if (upgrades[2][6] === 1) { buildings[2][4].current = buildings[2][4].true + buildings[2][5].current; }

        buildingsInfo.producing[2][4] = 2 * buildings[2][4].current;
        if (buildingsInfo.producing[2][5] > 1) { buildingsInfo.producing[2][4] *= buildingsInfo.producing[2][5]; }

        upgradesInfo[2].effect[5] = 1 + researches[2][5];
        if (upgrades[2][5] === 1) { buildings[2][3].current = buildings[2][3].true + buildings[2][4].current * upgradesInfo[2].effect[5]; }

        buildingsInfo.producing[2][3] = 2 * buildings[2][3].current;
        if (buildingsInfo.producing[2][4] > 1) { buildingsInfo.producing[2][3] *= buildingsInfo.producing[2][4]; }

        upgradesInfo[2].effect[4] = 1 + researches[2][4];
        if (upgrades[2][4] === 1) { buildings[2][2].current = buildings[2][2].true + buildings[2][3].current * upgradesInfo[2].effect[4]; }

        buildingsInfo.producing[2][2] = 3 * buildings[2][2].current * vaporization.clouds;
        upgradesInfo[2].effect[2] = 0.02 + researches[2][2] * 0.02;
        upgradesInfo[2].effect[3] = 0.02 + researches[2][3] * 0.03;
        strangeInfo.stageBoost[2] = strangeness[2][8] >= 1 ? (strange[0].true + 1) ** 0.4 : null;
        if (upgrades[2][2] === 1 && researches[2][1] >= 2) {
            buildingsInfo.producing[2][2] *= buildings[2][0].total ** upgradesInfo[2].effect[2];
        } else if (upgrades[2][2] === 1) {
            buildingsInfo.producing[2][2] *= buildings[2][0].current ** upgradesInfo[2].effect[2];
        }
        if (upgrades[2][3] === 1 && researches[2][1] >= 1) {
            buildingsInfo.producing[2][2] *= buildings[2][1].total ** upgradesInfo[2].effect[3];
        } else if (upgrades[2][3] === 1) {
            buildingsInfo.producing[2][2] *= buildings[2][1].current ** upgradesInfo[2].effect[3];
        }
        if (buildingsInfo.producing[2][3] > 1) { buildingsInfo.producing[2][2] *= buildingsInfo.producing[2][3]; }
        if (strangeness[2][1] >= 1) { buildingsInfo.producing[2][2] *= 2 ** strangeness[2][1]; }
        if (strangeInfo.stageBoost[2] !== null) { buildingsInfo.producing[2][2] *= strangeInfo.stageBoost[2]; }

        researchesExtraInfo[2].effect[1] = 10 ** (researchesExtra[2][1] - 1);

        if (buildings[2][0].current < 0.0028 && buildings[2][1].current === 0) { buildings[2][0].current = 0.0028; }
        if (buildings[2][1].current < buildings[2][1].true) {
            buildings[2][1].true = Math.trunc(buildings[2][1].current);
            calculateBuildingsCost(1, 2);
        }

        buildingsInfo.producing[2][1] = 0.0006 * buildings[2][1].current;
        if (researches[2][0] >= 1) { buildingsInfo.producing[2][1] *= 3 ** researches[2][0]; }
        if (upgrades[2][0] === 1) { buildingsInfo.producing[2][1] *= 1.1 ** buildings[2][1].true; }
        if (strangeness[2][0] >= 1) { buildingsInfo.producing[2][1] *= 2 ** strangeness[2][0]; }

        vaporizationInfo.get = (researchesExtra[2][0] === 0 ? buildings[2][1].current : buildings[2][1].total) / 1e10;
        if (strangeness[2][3] >= 1) { vaporizationInfo.get *= 3 ** strangeness[2][3]; }
        if (vaporizationInfo.get > 1) { //1e4 is softcap, game will force calculation as if you already at softcap if you reached 1e4 total clouds
            const check = vaporizationInfo.get ** 0.6 + vaporization.clouds;
            const calculate = (check - 1e4 > 0) ? Math.max(1e4 - vaporization.clouds, 1) : 1;
            vaporizationInfo.get = calculate + (vaporizationInfo.get - calculate) ** (check > 1e4 ? 0.36 : 0.6);
        }
    }
    if (activeAll.includes(3)) {
        const { accretion } = player;

        strangeInfo.stageBoost[3] = strangeness[3][7] >= 1 ? (strange[0].true + 1) ** 1.8 : null;

        buildingsInfo.producing[3][4] = 1.1 ** buildings[3][4].current;
        if (upgrades[3][11] === 1) { buildingsInfo.producing[3][4] *= 3; }

        buildingsInfo.producing[3][3] = 0.1 * buildings[3][3].current;
        if (upgrades[3][4] === 1 && researchesExtra[3][2] > 0) { buildingsInfo.producing[3][3] *= 2; }
        if (buildingsInfo.producing[3][4] > 1) { buildingsInfo.producing[3][3] *= buildingsInfo.producing[3][4]; }
        if (strangeness[3][1] >= 1) { buildingsInfo.producing[3][3] *= 2 ** strangeness[3][1]; }

        buildingsInfo.producing[3][2] = 0.1 * buildings[3][2].current;
        researchesInfo[3].effect[5] = buildings[3][0].current ** (0.025 * researches[3][5]);
        if (upgrades[3][3] === 1) { buildingsInfo.producing[3][2] *= 1.02 ** buildings[3][2].true; }
        if (upgrades[3][4] === 1) { buildingsInfo.producing[3][2] *= 4; }
        if (researches[3][2] >= 1) { buildingsInfo.producing[3][2] *= 3 ** researches[3][2]; }
        if (researches[3][4] >= 1) { buildingsInfo.producing[3][2] *= 5 ** researches[3][4]; }
        if (researches[3][5] >= 1) { buildingsInfo.producing[3][2] *= researchesInfo[3].effect[5]; }
        if (strangeness[3][1] >= 1) { buildingsInfo.producing[3][2] *= 2 ** strangeness[3][1]; }
        if (strangeness[3][3] >= 1) { buildingsInfo.producing[3][2] *= buildingsInfo.producing[3][4]; }

        buildingsInfo.producing[3][1] = 1e-19 * buildings[3][1].current;
        upgradesInfo[3].effect[0] = 1.01 + 0.01 * researches[3][1];
        upgradesInfo[3].effect[1] = buildings[3][1].current ** (0.05 + 0.01 * researchesExtra[3][3]);
        upgradesInfo[3].effect[7] = 2 * 1.5 ** researches[3][6];
        upgradesInfo[3].effect[9] = 10 * 3 ** researches[3][7];
        researchesExtraInfo[3].effect[0] = 1.1 ** researchesExtra[3][0];
        researchesExtraInfo[3].effect[1] = (1 + 0.1 * researchesExtra[3][1]) ** accretion.rank;
        if (upgrades[3][0] === 1) { buildingsInfo.producing[3][1] *= upgradesInfo[3].effect[0] ** buildings[3][1].true; }
        if (upgrades[3][1] === 1) { buildingsInfo.producing[3][1] *= upgradesInfo[3].effect[1]; }
        if (upgrades[3][2] === 1) { buildingsInfo.producing[3][1] *= 2; }
        if (upgrades[3][5] === 1) { buildingsInfo.producing[3][1] *= 3; }
        if (upgrades[3][7] === 1) { buildingsInfo.producing[3][1] *= upgradesInfo[3].effect[7]; }
        if (upgrades[3][8] === 1) { buildingsInfo.producing[3][1] *= 2; }
        if (upgrades[3][9] === 1) { buildingsInfo.producing[3][1] *= upgradesInfo[3].effect[9]; }
        if (researches[3][0] >= 1) { buildingsInfo.producing[3][1] *= 3 ** researches[3][0]; }
        if (researches[3][3] >= 1) { buildingsInfo.producing[3][1] *= 2 ** researches[3][3]; }
        if (researchesExtra[3][0] >= 1) { buildingsInfo.producing[3][1] *= researchesExtraInfo[3].effect[0]; }
        if (researchesExtra[3][1] >= 1) { buildingsInfo.producing[3][1] *= researchesExtraInfo[3].effect[1]; }
        if (strangeness[3][0] >= 1) { buildingsInfo.producing[3][1] *= 2 ** strangeness[3][0]; }
        if (strangeness[3][3] >= 1) { buildingsInfo.producing[3][1] *= buildingsInfo.producing[3][4]; }
        if (accretion.rank >= 5) { //I know that close to 1, softcap is at weakest point
            buildingsInfo.producing[3][1] **= buildingsInfo.producing[3][1] < 1 ? 1.1 : 0.8;
        }
    }
    if (activeAll.includes(4)) {
        const { collapse, elements } = player;
        const { collapseInfo } = global;

        researchesInfo[4].effect[0] = (1.1 + 0.2 * researches[4][2]) ** researches[4][0];
        researchesInfo[4].effect[1] = (1 + (0.01 * Math.min(researches[4][1], 5)) + (researches[4][1] > 5 ? 0.005 * (researches[4][1] - 5) : 0)) ** (buildings[4][1].true + buildings[4][2].true + buildings[4][3].true + buildings[4][4].true);
        strangeInfo.stageBoost[4] = strangeness[4][9] >= 1 ? (strange[0].true + 1) ** 0.3 : null;
        if (researchesInfo[4].effect[1] > 1e10) { researchesInfo[4].effect[1] = 1e10 + (researchesInfo[4].effect[1] - 1e10) ** 0.70; }
        let redGiantEffect = collapse.stars[0] + 1;
        if (elements[6] === 1) { redGiantEffect **= 1.5; }
        let neutronStarEffect = (collapse.stars[1] + (elements[22] === 1 ? collapse.stars[0] + 1 : 1)) ** 0.5;
        if (elements[12] === 1 && collapse.stars[1] > 10) { neutronStarEffect *= Math.log10(collapse.stars[1] + (elements[22] === 1 ? collapse.stars[0] : 0)); }
        const blackHoleEffect = collapse.stars[2] >= 1 ? (collapse.stars[2] + 1) / Math.log10(collapse.stars[2] + (elements[18] === 1 ? 9 : 99)) : 1;
        let totalMultiplier = (collapse.mass ** (elements[21] === 1 ? 1.1 : 1)) * researchesInfo[4].effect[0] * researchesInfo[4].effect[1] * neutronStarEffect;
        if (elements[4] === 1) { totalMultiplier *= 1.1; }
        if (elements[19] === 1) { totalMultiplier *= 3; }
        if (elements[23] === 1 && collapse.stars[2] > 10) { totalMultiplier *= Math.log10(collapse.stars[2]); }
        if (elements[24] === 1) { totalMultiplier *= buildings[4][0].current ** 0.01; }
        if (elements[26] === 1) { totalMultiplier *= 2; }
        if (strangeness[4][0] >= 1) { totalMultiplier *= 1.5 ** strangeness[4][0]; }
        if (player.milestones[1][1] >= 3) { totalMultiplier *= 1.5; }
        if (strangeInfo.stageBoost[4] !== null) { totalMultiplier *= strangeInfo.stageBoost[4]; }

        buildingsInfo.producing[4][4] = 2e9 * buildings[4][4].current * totalMultiplier;

        buildingsInfo.producing[4][3] = 2.5e7 * buildings[4][3].current * totalMultiplier;

        buildingsInfo.producing[4][2] = 300 * buildings[4][2].current * redGiantEffect * totalMultiplier;
        if (researches[4][3] >= 1) { buildingsInfo.producing[4][2] *= 10; }
        if (researchesExtra[4][1] >= 1) { buildingsInfo.producing[4][2] *= collapse.stars[0] + 1; }

        buildingsInfo.producing[4][1] = 22 * buildings[4][1].current * totalMultiplier;
        if (elements[1] === 1) { buildingsInfo.producing[4][1] *= 2; }

        let massGain = 0.004;
        if (elements[3] === 1) { massGain += 0.001; }
        if (elements[5] === 1) { massGain += 0.00015 * buildings[4][1].true; }
        if (elements[10] === 1) { massGain *= 2; }
        if (elements[14] === 1) { massGain *= 1.4; }
        collapseInfo.newMass = (buildings[4][1].true + (elements[15] === 1 ? buildings[4][2].true + buildings[4][3].true + buildings[4][4].true : 0)) * massGain * blackHoleEffect;

        collapseInfo.starCheck[0] = Math.max(buildings[4][2].true + Math.trunc(buildings[4][1].true * strangeness[4][3] / 4) - collapse.stars[0], 0);
        collapseInfo.starCheck[1] = Math.max(buildings[4][3].true - collapse.stars[1], 0);
        collapseInfo.starCheck[2] = Math.max(buildings[4][4].true - collapse.stars[2], 0);
    }
    if (activeAll.includes(5)) {
        buildings[5][0].current = buildings[4][1].current + buildings[4][2].current + buildings[4][3].current + buildings[4][4].current;
        buildings[5][0].total = buildings[4][1].total + buildings[4][2].total + buildings[4][3].total + buildings[4][4].total;
        buildings[5][0].trueTotal = buildings[4][1].trueTotal + buildings[4][2].trueTotal + buildings[4][3].trueTotal + buildings[4][4].trueTotal;
    }
    if (stage.true >= 5) {
        strangeInfo.stageGain = 1;
        if (strangeness[5][0] >= 1) { strangeInfo.stageGain *= 2; }

        strangeInfo.extraGain = 0;
        if (stage.current >= 5) {
            const { elementsInfo } = global;
            const { elements } = player;

            elementsInfo.effect[28] = Math.trunc((Math.log10(buildings[4][0].current) - 55) / 2.5);
            if (elements[27] === 1) { strangeInfo.extraGain += 1; }
            if (elements[28] === 1) { strangeInfo.extraGain += elementsInfo.effect[28]; }
            if (strangeness[5][0] >= 1) { strangeInfo.extraGain *= 2; }
        }
    }
};

export const buyBuilding = (index: number, stageIndex = player.stage.active, auto = false) => {
    if (!checkBuilding(index, stageIndex)) { return; }

    const { buildingsInfo } = global;

    if (!isFinite(buildingsInfo.cost[stageIndex][index])) {
        if (global.screenReader && !auto) {
            getId('invisibleBought').textContent = `Coudn't make '${buildingsInfo.name[stageIndex][index]}', because cost is infinity`;
        }
        return;
    }

    const { buildings } = player;

    let extra = index - 1; //What you are paying
    if (stageIndex === 2 && index !== 1) {
        extra = 1; //Drops
    } else if (stageIndex >= 3) {
        extra = 0; //Mass || Elements
    }
    const stageExtra = stageIndex === 5 ? 4 : stageIndex;

    let keep = 2;
    if (buildings[stageIndex][index].true === 0 || buildings[stageExtra][extra].current > 1e300) { keep = 1; }

    if (buildings[stageExtra][extra].current / (auto ? keep : 1) < buildingsInfo.cost[stageIndex][index]) {
        if (global.screenReader && !auto) {
            getId('invisibleBought').textContent = `Coudn't make '${buildingsInfo.name[stageIndex][index]}', because didn't had enough of '${buildingsInfo.name[stageExtra][extra]}'`;
        }
        return;
    }

    const { shop } = player.toggles;
    const howMany = auto ? -1 : player.researchesAuto[0] === 0 ? 1 : shop.howMany;
    const microworld = stageIndex === 1;
    if (microworld && index === 1) { global.dischargeInfo.energyType[index] = globalStart.dischargeInfo.energyType[index] + 1 * player.strangeness[1][4]; }

    if (howMany !== 1 && player.researchesAuto[0] > 0) {
        //Increase must be > 1 (if < 1, then use (1 - increase) and (1 - increase ** levels))
        let budget = buildings[stageExtra][extra].current / (auto ? keep : 1); //How much need to spend
        const totalBefore = buildingsInfo.startCost[stageIndex][index] * ((buildingsInfo.increase[stageIndex][index] ** buildings[stageIndex][index].true - 1) / (buildingsInfo.increase[stageIndex][index] - 1)); //How much already payed for
        const maxAfford = Math.trunc(Math.log((totalBefore + budget) * (buildingsInfo.increase[stageIndex][index] - 1) / buildingsInfo.startCost[stageIndex][index] + 1) / Math.log(buildingsInfo.increase[stageIndex][index])) - buildings[stageIndex][index].true; //Max amount that can be afforded
        if (shop.strict && maxAfford < howMany && howMany !== -1) { return; }
        let canAfford = howMany !== -1 ? Math.min(maxAfford, howMany) : maxAfford;
        let total = buildingsInfo.startCost[stageIndex][index] * ((buildingsInfo.increase[stageIndex][index] ** (canAfford + buildings[stageIndex][index].true) - 1) / (buildingsInfo.increase[stageIndex][index] - 1)) - totalBefore; //How much you need to pay

        if (!isFinite(total) || !isFinite(canAfford)) { /* Fallback */
            let cost = buildingsInfo.cost[stageIndex][index];
            for (canAfford = 0, total = 0; budget >= cost; canAfford++) {
                total += cost;
                budget -= cost;
                cost *= buildingsInfo.increase[stageIndex][index];
            }
        }

        buildings[stageExtra][extra].current -= total;
        buildings[stageIndex][index].current += canAfford;
        buildings[stageIndex][index].true += canAfford;
        buildings[stageIndex][index].total += canAfford;
        buildings[stageIndex][index].trueTotal += canAfford;

        if (microworld) { player.discharge.energyCur += global.dischargeInfo.energyType[index] * canAfford; }
        if (global.screenReader && !auto) {
            getId('invisibleBought').textContent = `Maded ${format(canAfford)} '${buildingsInfo.name[stageIndex][index]}'${microworld ? `, gained ${format(global.dischargeInfo.energyType[index] * canAfford)} Energy` : ''}`;
        }
    } else {
        buildings[stageExtra][extra].current -= buildingsInfo.cost[stageIndex][index];
        buildings[stageIndex][index].current++;
        buildings[stageIndex][index].true++;
        buildings[stageIndex][index].total++;
        buildings[stageIndex][index].trueTotal++;

        if (microworld) { player.discharge.energyCur += global.dischargeInfo.energyType[index]; }
        if (global.screenReader) {
            getId('invisibleBought').textContent = `Made 1 '${buildingsInfo.name[stageIndex][index]}'${microworld ? `, gained ${format(global.dischargeInfo.energyType[index])} Energy` : ''}`;
        }
    }
    calculateBuildingsCost(index, stageIndex);
    calculateStageInformation();
    numbersUpdate();

    //Milestones that are based on bought amount
    if (stageIndex === 2) {
        if (index !== 1) { milestoneCheck(1, 2); }
    } else if (stageIndex === 3) {
        if (index === 4) { milestoneCheck(1, 3); }
    }
};

export const calculateBuildingsCost = (index: number, stageIndex: number) => {
    const { buildings } = player;
    const { buildingsInfo } = global;

    if (stageIndex === 1) {
        global.upgradesInfo[1].effect[4] = (20 + player.researches[1][0]) / 100; //(0.2 + 1 / 100) / 100
        buildingsInfo.increase[1][index] = Math.round((1.4 - (player.upgrades[1][4] === 1 ? global.upgradesInfo[1].effect[4] : 0)) * 100) / 100;
        if (index === 1) { buildingsInfo.startCost[1][1] = globalStart.buildingsInfo.startCost[1][1] / (player.upgrades[1][0] === 1 ? 10 : 1); }
    } else if (stageIndex === 3) {
        buildingsInfo.startCost[3][index] = globalStart.buildingsInfo.startCost[3][index] / (global.strangeInfo.stageBoost[3] !== null ? global.strangeInfo.stageBoost[3] : 1);
        if (index === 4) { buildingsInfo.increase[3][4] = player.upgrades[3][10] === 1 ? 5 : 10; }
    } else if (stageIndex === 4) {
        buildingsInfo.increase[4][index] = Math.round(((1.4 + 0.15 * (index - 1)) - (player.elements[2] === 1 ? 0.1 : 0) - (player.elements[8] === 1 ? 0.05 : 0)) * 100) / 100;
        buildingsInfo.startCost[4][index] = globalStart.buildingsInfo.startCost[4][index] / (player.elements[13] === 1 ? 1e3 : 1) / (2 ** player.strangeness[4][1]);
    }

    buildingsInfo.cost[stageIndex][index] = buildingsInfo.startCost[stageIndex][index] * buildingsInfo.increase[stageIndex][index] ** buildings[stageIndex][index].true;
};

export const calculateGainedBuildings = (get: number, stageIndex: number, time: number) => {
    const { buildings } = player;
    const { buildingsInfo } = global;

    let add: number;
    if (stageIndex === 1 && get === 3) {
        add = (global.upgradesInfo[1].effect[6] as number) * time;
    } else {
        add = buildingsInfo.producing[stageIndex][get + 1] * time;

        if (stageIndex === 2 && get === 1 && player.researchesExtra[2][1] >= 1) {
            add += time * (global.researchesExtraInfo[2].effect[1] as number);
        }
    }

    if (add === 0) { return; }
    if (stageIndex === 4) { get = 0; }

    let check = buildings[stageIndex][get].current + add;
    buildings[stageIndex][get].current = isFinite(check) ? check : 1e308;

    check = buildings[stageIndex][get].total + add;
    buildings[stageIndex][get].total = isFinite(check) ? check : 1e308;

    check = buildings[stageIndex][get].trueTotal + add;
    buildings[stageIndex][get].trueTotal = isFinite(check) ? check : 1e308;

    //Milestones that are based on gained amount
    if (stageIndex === 3) {
        if (player.accretion.rank < 5 && buildings[3][0].current + add > 1e30) {
            buildings[3][0].current = 1e30;
        }
        if (get === 0) { milestoneCheck(0, 3); }
    }
};

export const buyUpgrades = (upgrade: number, stageIndex: 'auto' | number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements' | 'strangeness', auto = false) => {
    if (stageIndex === 'auto') { stageIndex = player.stage.active; }
    if (type === 'ASR') { upgrade = stageIndex; }
    if (!checkUpgrade(upgrade, stageIndex, type)) { return; }

    let currency: number;
    if (type === 'strangeness') {
        currency = player.strange[0].true;
    } else if (stageIndex === 1) {
        currency = player.discharge.energyCur;
    } else if (stageIndex === 2) {
        currency = player.buildings[2][1].current;
    } else if (stageIndex === 3) {
        currency = player.buildings[3][0].current;
    } else /* if (stageIndex === 4 || stageIndex === 5) */ {
        currency = player.buildings[4][0].current;
    }

    if (type === 'upgrades' || type === 'researches' || type === 'researchesExtra') {
        const typeInfo = type + 'Info' as 'researchesInfo';

        if (currency < global[typeInfo][stageIndex].cost[upgrade]) { return; }
        if (type === 'upgrades') {
            if (player[type][stageIndex][upgrade] === 1) { return; }
        } else {
            if (player[type][stageIndex][upgrade] === global[typeInfo][stageIndex].max[upgrade]) { return; }
        }
        player[type][stageIndex][upgrade]++;
        currency -= global[typeInfo][stageIndex].cost[upgrade];

        /* Special cases */
        if (type === 'upgrades') {
            if (stageIndex === 1) {
                if (upgrade === 0) {
                    calculateBuildingsCost(1, 1);
                } else if (upgrade === 4) {
                    for (let i = 1; i < global.buildingsInfo.name[1].length; i++) {
                        calculateBuildingsCost(i, 1);
                    }
                }
            } else if (stageIndex === 3 && upgrade === 10) {
                calculateBuildingsCost(4, 3);
            }
        } else if (type === 'researches') {
            if (stageIndex === 1 && upgrade === 0) {
                for (let i = 1; i < global.buildingsInfo.name[1].length; i++) {
                    calculateBuildingsCost(i, 1);
                }
            } else if (stageIndex === 4 && upgrade === 2) {
                calculateMaxLevel(0, 4, 'researches');
            }
        }
        if (global.screenReader && !auto) {
            if (type === 'upgrades') {
                getId('invisibleBought').textContent = `You have created upgrade '${global[typeInfo][stageIndex].description[upgrade]}'`;
            } else {
                getId('invisibleBought').textContent = `You have researched '${global[typeInfo][stageIndex].description[upgrade]}', level is now ${player[type][upgrade]} ${player[type][stageIndex][upgrade] === global[typeInfo][stageIndex].max[upgrade] ? 'maxed' : ''}`;
            }
        }

        if (type !== 'upgrades') { calculateResearchCost(upgrade, stageIndex, type); }
    } else if (type === 'researchesAuto' || type === 'ASR') {
        const typeInfo = type + 'Info' as 'researchesAutoInfo';

        if (player[type][upgrade] === global[typeInfo].max[upgrade] || currency < global[typeInfo].cost[upgrade]) { return; }
        player[type][upgrade]++;
        currency -= global[typeInfo].cost[upgrade];

        /* Special cases */
        if (global.screenReader && !auto) { getId('invisibleBought').textContent = `You have researched '${type === 'ASR' ? global[typeInfo].description : global[typeInfo].description[upgrade]}', level is now ${player[type][upgrade]} ${player[type][upgrade] === global[typeInfo].max[upgrade] ? 'maxed' : ''}`; }

        calculateResearchCost(upgrade, stageIndex, type);
    } else if (type === 'elements') {
        const typeInfo = 'elementsInfo' as const;

        if (player[type][upgrade] === 1 || currency < global[typeInfo].cost[upgrade]) { return; }
        player[type][upgrade] = 1;
        currency -= global[typeInfo].cost[upgrade];

        player.collapse.show = Math.max(player.collapse.show, upgrade); //Lazy way of remembering bought elements

        /* Special cases */
        if (upgrade === 2 || upgrade === 8 || upgrade === 13) {
            for (let i = 1; i < global.buildingsInfo.name[4].length; i++) {
                calculateBuildingsCost(i, 4);
            }
        } else if (upgrade === 7 || upgrade === 16 || upgrade === 20 || upgrade === 25) {
            calculateMaxLevel(1, 4, 'researches');
        } else if (upgrade === 9 || upgrade === 17) {
            calculateMaxLevel(0, 4, 'researches');
        } else if (upgrade === 11) {
            calculateMaxLevel(2, 4, 'researches');
        } else if (upgrade === 26 && player.stage.current === 4) {
            stageNoReset();
        }
        if (global.screenReader && !auto) { getId('invisibleBought').textContent = `You have obtained element '${global[typeInfo].description[upgrade]}'`; }
    } else {
        const typeInfo = 'strangenessInfo' as const;

        if (player[type][stageIndex][upgrade] === global[typeInfo][stageIndex].max[upgrade] || currency < global[typeInfo][stageIndex].cost[upgrade]) { return; }
        player[type][stageIndex][upgrade]++;
        currency -= global[typeInfo][stageIndex].cost[upgrade];

        /* Special cases */
        if (((stageIndex === 1 || stageIndex === 4) && upgrade === 6) || ((stageIndex === 2 || stageIndex === 3) && upgrade === 5)) { //Auto only to save space
            player.ASR[stageIndex] = Math.max(player.strangeness[stageIndex][upgrade], player.ASR[stageIndex]);
            calculateResearchCost(0, stageIndex, 'ASR');
            visualUpdateUpgrades(0, stageIndex, 'ASR');
        } else if (stageIndex === 1) {
            if (global.stageInfo.activeAll.includes(1)) {
                if (upgrade === 4) {
                    for (let i = 1; i < global.buildingsInfo.name[1].length; i++) {
                        calculateBuildingsCost(i, 1);
                    }
                }
            }
            if (upgrade === 7) {
                player.researchesAuto[0] = Math.max(1, player.researchesAuto[0]);
                calculateMaxLevel(0, 1, 'researchesAuto');
            }
        } else if (stageIndex === 2) {
            if (global.stageInfo.activeAll.includes(2)) {
                if (upgrade === 2) {
                    if (player.strangeness[2][2] < 3) { calculateMaxLevel(4, 2, 'researches'); }
                    if (player.strangeness[2][2] === 2) { calculateMaxLevel(5, 2, 'researches'); }
                }
            }
            if (upgrade === 6) {
                player.researchesAuto[1] = Math.max(1, player.researchesAuto[1]);
                calculateMaxLevel(1, 2, 'researchesAuto');
            }
        } else if (stageIndex === 3) {
            if (global.stageInfo.activeAll.includes(3)) {
                if (upgrade === 2) {
                    calculateMaxLevel(0, 3, 'researchesExtra');
                    calculateMaxLevel(1, 3, 'researchesExtra');
                }
            }
            if (upgrade === 6) {
                calculateMaxLevel(2, 3, 'researchesAuto');
            }
        } else if (stageIndex === 4) {
            if (global.stageInfo.activeAll.includes(4)) {
                if (upgrade === 1) {
                    for (let i = 1; i < global.buildingsInfo.name[4].length; i++) {
                        calculateBuildingsCost(i, 4);
                    }
                }
            }
        } else if (stageIndex === 5) {
            if (upgrade === 0) {
                player.stage.input *= 2;
            } else if (upgrade === 1) {
                if (!global.stageInfo.activeAll.includes(player.strangeness[5][1])) {
                    reset('stage', [player.strangeness[5][1]]);
                    stageCheck('soft');
                }
            }
        }
        if (global.screenReader) { getId('invisibleBought').textContent = `You have researched ${global[typeInfo][stageIndex].description[upgrade]} for ${global.stageInfo.word[stageIndex]} stage, level is now ${player[type][stageIndex][upgrade]}${player[type][stageIndex][upgrade] === global[typeInfo][stageIndex].max[upgrade] ? 'maxed' : ''}`; }

        calculateResearchCost(upgrade, stageIndex, type);
    }

    /* Because each price can use different property, so have to do it this way... */
    if (type === 'strangeness') {
        player.strange[0].true = currency;
    } else if (stageIndex === 1) {
        player.discharge.energyCur = currency;
    } else if (stageIndex === 2) {
        player.buildings[stageIndex][1].current = currency;
    } else if (stageIndex === 3) {
        player.buildings[3][0].current = currency;
    } else /*if (stageIndex === 4 || stageIndex === 5)*/ {
        player.buildings[4][0].current = currency;
    }

    numbersUpdate();
    //stageIndex only used for strangeness research, since no need to update what can't be seen
    if (!auto || (global.lastResearch[2] === type && global.lastResearch[0] === upgrade)) {
        getUpgradeDescription(upgrade, stageIndex, type);
    }
    visualUpdateUpgrades(upgrade, stageIndex, type);
    if (stageIndex === 1 && player.toggles.auto[1] && type !== 'strangeness' && type !== 'elements') {
        dischargeResetCheck('upgrade');
    }
};

export const calculateResearchCost = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'strangeness') => {
    if (type === 'researches' || type === 'researchesExtra') {
        const typeInfo = type + 'Info' as 'researchesInfo';

        if (player[type][stageIndex][research] === global[typeInfo][stageIndex].max[research]) { return; }

        if (stageIndex === 1) {
            global[typeInfo][stageIndex].cost[research] = globalStart[typeInfo][stageIndex].cost[research] + global[typeInfo][stageIndex].scaling[research] * player[type][stageIndex][research];
        } else {
            global[typeInfo][stageIndex].cost[research] = globalStart[typeInfo][stageIndex].cost[research] * global[typeInfo][stageIndex].scaling[research] ** player[type][stageIndex][research];
        }

        //Below will remove all but 2 digits past point
        if (global[typeInfo][stageIndex].cost[research] < 1) {
            const digits = -Math.floor(Math.log10(global[typeInfo][stageIndex].cost[research])); //Because of floats, -digits will be used
            global[typeInfo][stageIndex].cost[research] = Math.round(global[typeInfo][stageIndex].cost[research] * 10 ** (digits + 2)) / 10 ** (digits + 2);
        } else {
            global[typeInfo][stageIndex].cost[research] = Math.round(global[typeInfo][stageIndex].cost[research] * 100) / 100;
        }
    } else if (type === 'researchesAuto') {
        const typeInfo = 'researchesAutoInfo' as const;

        if (player[type][research] === global[typeInfo].max[research]) { return; }

        if (stageIndex === 1) {
            global[typeInfo].cost[research] = globalStart[typeInfo].cost[research] + global[typeInfo].scaling[research] * player[type][research];
        } else {
            global[typeInfo].cost[research] = globalStart[typeInfo].cost[research] * global[typeInfo].scaling[research] ** player[type][research];
        }

        if (global[typeInfo].cost[research] < 1) {
            const digits = -Math.floor(Math.log10(global[typeInfo].cost[research]));
            global[typeInfo].cost[research] = Math.round(global[typeInfo].cost[research] * 10 ** (digits + 2)) / 10 ** (digits + 2);
        } else {
            global[typeInfo].cost[research] = Math.round(global[typeInfo].cost[research] * 100) / 100;
        }
    } else if (type === 'ASR') {
        if (player.ASR[stageIndex] === global.ASRInfo.max[stageIndex]) { return; }

        global.ASRInfo.cost[stageIndex] = global.ASRInfo.costRange[stageIndex][player.ASR[stageIndex]];
    } else if (type === 'strangeness') {
        const typeInfo = 'strangenessInfo' as const;

        if (player[type][stageIndex][research] === global[typeInfo][stageIndex].max[research]) { return; }

        global[typeInfo][stageIndex].cost[research] = Math.trunc(Math.round((globalStart[typeInfo][stageIndex].cost[research] + global[typeInfo][stageIndex].scaling[research] * player[type][stageIndex][research]) * 100) / 100);
    }
};

export const calculateMaxLevel = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'researchesAuto') => {
    if (type === 'researchesAuto') {
        //Auto doesn't need stageIndex (sended as 0 here), but if something it can be easily added (global has autoStage for that reason)
        if (research === 0) {
            global.researchesAutoInfo.max[0] = player.strangeness[1][7] + 1;
        } else if (research === 1) {
            global.researchesAutoInfo.max[1] = player.strangeness[2][6] + 1;
        } else if (research === 2) {
            global.researchesAutoInfo.max[2] = player.strangeness[3][6];
        }
    } else if (type === 'researches') {
        if (stageIndex === 2) {
            if (research === 4) {
                global.researchesInfo[2].max[4] = 2 + Math.min(player.strangeness[2][2], 2);
            } else if (research === 5) {
                global.researchesInfo[2].max[5] = 2;
                if (player.strangeness[2][2] >= 2) { global.researchesInfo[2].max[5] += 1; }
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                global.researchesInfo[4].max[0] = 3 + (3 * player.researches[4][2]);
                if (player.elements[9] === 1) { global.researchesInfo[4].max[0] += 12; }
                if (player.elements[17] === 1) { global.researchesInfo[4].max[0] += 27; }
            } else if (research === 1) {
                global.researchesInfo[4].max[1] = 2;
                if (player.elements[7] === 1) { global.researchesInfo[4].max[1] += 2; }
                for (const i of [16, 20, 25]) {
                    if (player.elements[i] === 1) { global.researchesInfo[4].max[1] += 1; }
                }
            } else if (research === 2) {
                global.researchesInfo[4].max[2] = player.elements[11] === 1 ? 2 : 1;
            }
        }
    } else if (type === 'researchesExtra') {
        if (stageIndex === 3) {
            if (research === 0) {
                global.researchesExtraInfo[3].max[0] = 12;
                if (player.accretion.rank >= 3) { global.researchesExtraInfo[3].max[0] += 17; }
                if (player.strangeness[3][2] >= 1) { global.researchesExtraInfo[3].max[0] += 10 * player.strangeness[3][2]; }
            } else if (research === 1) {
                global.researchesExtraInfo[3].max[1] = 5;
                if (player.strangeness[3][2] >= 1) { global.researchesExtraInfo[3].max[1] += 1 * player.strangeness[3][2]; }
            }
        }
    }

    calculateResearchCost(research, stageIndex, type);
    visualUpdateUpgrades(research, stageIndex, type);
    if (type === 'researches' || type === 'researchesExtra') { autoUpgradesSet(type, [stageIndex, research]); }
};

const autoUpgradesType = (type: 'upgrades' | 'researches' | 'researchesExtra') => {
    switch (type) {
        case 'upgrades':
            if (!player.toggles.auto[5] || player.researchesAuto[2] < 1) {
                return null;
            }
            return 'autoU';
        case 'researches':
            if (!player.toggles.auto[6] || player.researchesAuto[2] < 2) {
                return null;
            }
            return 'autoR';
        case 'researchesExtra':
            if (!player.toggles.auto[7] || player.researchesAuto[2] < 3) {
                return null;
            }
            return 'autoE';
    }
};

//All = reset all of current active stages; As number means reset that stage only; As array means add [1] into stage [0] if it's not already inside
export const autoUpgradesSet = (type: 'upgrades' | 'researches' | 'researchesExtra', which = 'all' as 'all' | number | number[]) => {
    const auto = autoUpgradesType(type);
    if (auto === null) { return; }

    const { automatization } = global;
    const typeInfo = type + 'Info' as 'researchesInfo';

    if (which === 'all') {
        for (const s of global.stageInfo.activeAll) {
            automatization[auto][s] = [];
            for (let i = 0; i < global[typeInfo][s].cost.length; i++) {
                if (player[type][s][i] < (type === 'upgrades' ? 1 : global[typeInfo][s].max[i])) {
                    automatization[auto][s].push([i, global[typeInfo][s].cost[i]]);
                }
            }
            automatization[auto][s].sort((a, b) => a[1] - b[1]);
        }
    } else if (typeof which === 'number') {
        automatization[auto][which] = [];
        for (let i = 0; i < global[typeInfo][which].cost.length; i++) {
            if (player[type][which][i] < (type === 'upgrades' ? 1 : global[typeInfo][which].max[i])) {
                automatization[auto][which].push([i, global[typeInfo][which].cost[i]]);
            }
        }
        automatization[auto][which].sort((a, b) => a[1] - b[1]);
    } else { //type !== 'upgrades'
        if (!automatization[auto][which[0]].some((a) => a[0] === which[1])) {
            automatization[auto][which[0]].push([which[1], global[typeInfo][which[0]].cost[which[1]]]);
            automatization[auto][which[0]].sort((a, b) => a[1] - b[1]);
        }
    }
};

export const autoUpgradesBuy = (type: 'upgrades' | 'researches' | 'researchesExtra', stageIndex: number) => {
    const auto = autoUpgradesType(type);
    if (auto === null) { return; }

    const { automatization } = global;
    const typeInfo = type + 'Info' as 'researchesInfo';

    let sort = false;
    for (let i = 0; i < automatization[auto][stageIndex].length; i++) {
        const index = automatization[auto][stageIndex][i][0]; //Faster this way

        if (!checkUpgrade(index, stageIndex, type)) { continue; }
        buyUpgrades(index, stageIndex, type, true); //Some upgrades inside can get inserted into old index spot
        if (index !== automatization[auto][stageIndex][i][0]) { continue; }

        if (player[type][stageIndex][index] === (type === 'upgrades' ? 1 : global[typeInfo][stageIndex].max[index])) {
            automatization[auto][stageIndex].splice(i, 1);
        } else {
            if (type === 'upgrades' || automatization[auto][stageIndex][i][1] === global[typeInfo][stageIndex].cost[index]) {
                break;
            } else {
                automatization[auto][stageIndex][i][1] = global[typeInfo][stageIndex].cost[index];
                sort = true;
            }
        }
    }
    if (sort) { automatization[auto][stageIndex].sort((a, b) => a[1] - b[1]); }
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
        if (type === 'buildings') {
            const active = player.stage.active;
            toggles.buildings[active][number] = !toggles.buildings[active][number];
            if (number === 0) {
                for (let i = 1; i < toggles.buildings[active].length; i++) {
                    toggles.buildings[active][i] = toggles.buildings[active][0];
                    toggleSwap(i, 'buildings');
                }
            } else {
                toggles.buildings[active][0] = toggles.buildings[active].includes(true, 1);
                toggleSwap(0, 'buildings');
            }
        } else {
            toggles[type][number] = !toggles[type][number];
        }
    }
    const status = type === 'buildings' ? toggles.buildings[player.stage.active][number] : toggles[type][number];

    if (!status) {
        toggle.style.color = 'var(--red-text-color)';
        toggle.style.borderColor = 'crimson';
    } else {
        toggle.style.color = '';
        toggle.style.borderColor = '';
    }

    if (type === 'normal') {
        if (!status) {
            toggle.textContent = 'OFF';
            if (global.screenReader) { toggle.ariaLabel = toggle.ariaLabel?.replace(' ON', ' OFF') ?? ''; }
        } else {
            toggle.textContent = 'ON';
            if (global.screenReader) { toggle.ariaLabel = toggle.ariaLabel?.replace(' OFF', ' ON') ?? ''; }
        }
    } else {
        if (!status) {
            toggle.textContent = type === 'buildings' && number === 0 ? 'All OFF' : 'Auto OFF';
        } else {
            toggle.textContent = type === 'buildings' && number === 0 ? 'All ON' : 'Auto ON';
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
    const strict = getId('buyStrict') as HTMLButtonElement;
    strict.style.borderColor = shop.strict ? '' : 'crimson';
    strict.style.color = shop.strict ? '' : 'var(--red-text-color)';
    getId('buy1x').style.backgroundColor = shop.howMany === 1 ? 'green' : '';
    getId('buyAny').style.backgroundColor = Math.abs(shop.howMany) !== 1 ? 'green' : '';
    getId('buyMax').style.backgroundColor = shop.howMany === -1 ? 'green' : '';
    numbersUpdate();
};

export const stageResetCheck = (stageIndex: number, auto = false): boolean => {
    calculateStageInformation();
    const { stage } = player;

    let allowed = false;
    switch (stageIndex) {
        case 1:
            allowed = player.buildings[1][3].current >= 1.67e21;
            break;
        case 2:
            allowed = player.buildings[2][1].current >= 1.194e29;
            break;
        case 3:
            allowed = player.buildings[3][0].current >= 2.47e31;
            break;
        case 4:
            return false;
        case 5:
            allowed = true;
    }

    if (auto && allowed && stage.resets >= 16 &&
        global.strangeInfo.stageGain + (stageIndex >= 5 ? global.strangeInfo.extraGain : 0) >= stage.input) {
        stageReset(stageIndex);
    }

    return allowed;
};

export const stageAsyncReset = async() => {
    const { stage } = player;
    const active = stage.active === 4 && stage.current === 5 && player.events[1] ? 5 : stage.active;

    if (!stageResetCheck(active)) {
        switch (active) {
            case 1:
                return Alert(`You will need enough to form a single Drop of water for next one - ${format(1.67e21, 2)} Molecules`);
            case 2:
                return Alert(`Look's like more Mass expected, need even more Drops, around ${format(1.194e29 - player.buildings[2][1].current)}`);
            case 3:
                return Alert(`Self sustaining is not yet possible, obtain at least ${format(2.47e31, 2)} Mass`);
            case 4:
                return stage.true > 4 ?
                    Alert('Let\'s reach the limit') :
                    Alert('Let\'s see the limit');
        }
    } else {
        let ok = true;
        if (player.toggles.normal[1]) {
            if (active === stage.current) {
                switch (active) {
                    case 1:
                        ok = await Confirm('Ready to enter next stage? Next one will be harder than current');
                        break;
                    case 2:
                        ok = await Confirm('Ready to enter next stage? Next one will be harder than current');
                        break;
                    case 3:
                        ok = await Confirm('Ready to enter next stage? Next one will be harder than current');
                        break;
                    case 5:
                        ok = player.strange[0].total === 0 ?
                            await Confirm('You will return to first stage. But maybe you will get something in return. Ready?') :
                            await Confirm(`You will return to first stage. In return you will get ${format(global.strangeInfo.stageGain + global.strangeInfo.extraGain, 0)} Strange quarks. Ready?`);
                }
            } else {
                ok = await Confirm(`You will reset this stage. In return you will get ${format(global.strangeInfo.stageGain, 0)} Strange quarks. Ready?`);
            }
        }
        if (ok) {
            stageReset(active);
        }
    }
};

const stageReset = (stageIndex: number) => {
    const { stage, researchesAuto } = player;

    stage.resets++;
    const resetThese = [];
    const increased = stageIndex === stage.current;
    if (increased) {
        if (stage.current < 5) {
            stage.current++;
        } else {
            stage.current = 1 + player.strangeness[5][1];
        }
        stage.true = Math.max(stage.true, stage.current);
        stage.active = stage.current;
        resetThese.push(stage.current);
        if (stage.current === 4) { resetThese.push(5); }

        if (stageIndex === 5) {
            if (player.strangeness[1][7] < 1) {
                researchesAuto[0] = 0;
                calculateMaxLevel(0, 0, 'researchesAuto');
            }
            if (player.strangeness[2][6] < 1) {
                researchesAuto[1] = 0;
                calculateMaxLevel(1, 0, 'researchesAuto');
            }
        } else if (stageIndex === 2) {
            if (researchesAuto[1] === 0) {
                researchesAuto[1] = 1;
                calculateMaxLevel(1, 0, 'researchesAuto');
            }
        } else if (stageIndex === 1) {
            if (researchesAuto[0] === 0) {
                researchesAuto[0] = 1;
                calculateMaxLevel(0, 0, 'researchesAuto');
            }
        }
        player.events[0] = stage.true > stage.current;
    } else {
        resetThese.push(stageIndex);
    }

    if (stage.true >= 5) {
        let gain = global.strangeInfo.stageGain;
        if (stageIndex >= 5) { gain += global.strangeInfo.extraGain; }
        player.strange[0].true += gain;
        player.strange[0].total += gain;
    }

    reset('stage', resetThese);
    if (increased) { stageCheck(); }
};

/* Only for stage 4 right now */
const stageNoReset = () => {
    const { stage } = player;

    stage.current++;
    stage.true = Math.max(stage.current, stage.true);
    stageCheck('soft');
};

export const switchStage = (stage: number) => {
    if (player.stage.active === stage || !global.stageInfo.activeAll.includes(stage)) { return; }
    player.stage.active = stage;
    stageCheck();

    if (!player.events[1] && player.stage.active === 5) { playEvent(4, 1); }
};

export const dischargeResetCheck = (auto = 'false' as 'false' | 'interval' | 'upgrade'): boolean => {
    calculateStageInformation();

    if (player.upgrades[1][3] === 1 && player.buildings[1][1].true > 0) {
        if (auto !== 'false') {
            if ((auto === 'interval' && player.discharge.energyCur < global.dischargeInfo.next) || player.strangeness[1][3] < 1) {
                return false;
            }
            dischargeReset();
        }
        return true;
    }
    return false;
};

export const dischargeAsyncReset = async() => {
    if (!dischargeResetCheck()) { return; }

    let ok = true;
    if (player.toggles.normal[2]) {
        if (player.discharge.energyCur < global.dischargeInfo.next) {
            ok = await Confirm('This will reset all of your current structures and Energy. You will NOT gain production boost. Continue?');
        } else {
            ok = await Confirm('You have enough Energy to gain boost. Continue?');
        }
    }
    if (ok) {
        if (global.screenReader) {
            getId('invisibleBought').textContent = player.discharge.energyCur >= global.dischargeInfo.next ?
                'Structures and Energy were reset for some boost' :
                'Structures and Energy were reset, no boost';
        }
        dischargeReset();
    }
};

const dischargeReset = () => {
    if (player.discharge.energyCur >= global.dischargeInfo.next) {
        player.discharge.current++;
    }
    milestoneCheck(0, 1);
    reset('discharge', [1]);
};

export const vaporizationResetCheck = (auto = false): boolean => {
    calculateStageInformation();

    if (player.upgrades[2][1] === 1 && global.vaporizationInfo.get >= 1) {
        if (auto) {
            if (global.vaporizationInfo.get <= player.vaporization.clouds * player.vaporization.input || player.strangeness[2][4] < 1) {
                return false;
            }
            vaporizationReset();
        }
        return true;
    }
    return false;
};

export const vaporizationAsyncReset = async() => {
    if (!vaporizationResetCheck()) { return; }

    let ok = true;
    if (player.toggles.normal[3]) {
        ok = await Confirm(`Do you wish to reset structures and upgrades for ${format(global.vaporizationInfo.get)} Clouds?`);
    }
    if (ok) {
        if (global.screenReader) { getId('invisibleBought').textContent = `Progress were reset for ${format(global.vaporizationInfo.get)} Clouds`; }
        vaporizationReset();
    }
};

const vaporizationReset = () => {
    player.vaporization.clouds += global.vaporizationInfo.get;
    milestoneCheck(0, 2);
    reset('vaporization', [2]);
};

export const rankResetCheck = (auto = false): boolean => {
    const requirement = global.accretionInfo.rankCost[player.accretion.rank];

    if (player.buildings[3][0].current >= requirement && requirement !== 0) {
        if (auto) {
            if (player.strangeness[3][4] < 1) {
                return false;
            }
            rankReset();
        }
        return true;
    }
    return false;
};

export const rankAsyncReset = async() => {
    if (!rankResetCheck()) { return; }

    let ok = true;
    if (player.toggles.normal[4] && player.accretion.rank !== 0) {
        ok = await Confirm('Increasing Rank will reset structures, upgrades, stage researches. But you will get closer to your goal');
    }
    if (ok) {
        rankReset();
        if (global.screenReader) { getId('invisibleBought').textContent = `Rank is now ${global.accretionInfo.rankName[player.accretion.rank]}`; }
    }
};

const rankReset = () => {
    player.accretion.rank++;
    reset('rank', [3]);
    calculateMaxLevel(0, 3, 'researchesExtra');
    updateRankInfo();
};

export const collapseResetCheck = (auto = false): boolean => {
    calculateStageInformation();
    const { collapseInfo } = global;
    const { collapse } = player;

    if (player.upgrades[4][0] === 1 && collapseInfo.newMass >= collapse.mass) {
        if (auto) {
            const canIncrease =
                (player.researchesExtra[4][0] >= 1 ? collapse.stars[0] < (collapse.stars[0] + collapseInfo.starCheck[0]) / collapse.inputS : false) ||
                (player.researchesExtra[4][0] >= 2 ? collapse.stars[1] < (collapse.stars[1] + collapseInfo.starCheck[1]) / collapse.inputS : false) ||
                (player.researchesExtra[4][0] >= 3 ? collapse.stars[2] < (collapse.stars[2] + collapseInfo.starCheck[2]) / collapse.inputS : false);
            if ((collapseInfo.newMass < collapse.mass * collapse.inputM && !canIncrease) || player.strangeness[4][5] < 1) { return false; }
            collapseReset();
        }
        return true;
    }
    return false;
};

export const collapseAsyncReset = async() => {
    if (!collapseResetCheck()) { return; }
    const { collapse, researchesExtra } = player;

    let ok = true;
    if (player.toggles.normal[5]) {
        const { collapseInfo } = global;

        let message = `This will reset all non automization researches and upgrades. ${collapseInfo.newMass === collapse.mass ? 'Your total Mass won\'t change' : `But your total Mass will be now ${format(collapseInfo.newMass)}`}`;
        if (researchesExtra[4][0] >= 1) {
            message += `, also you will get ${format(collapseInfo.starCheck[0])} Red giants`;
            if (researchesExtra[4][0] >= 2) {
                message += `, ${format(collapseInfo.starCheck[1])} Neutron stars`;
                if (researchesExtra[4][0] >= 3) {
                    message += ` and ${format(collapseInfo.starCheck[2])} Black holes`;
                }
            }
        }
        ok = await Confirm(message);
    }
    if (ok) {
        collapseReset();
        if (global.screenReader) {
            let message = `Your Mass has increased to ${format(collapse.mass)}`;
            if (researchesExtra[4][0] >= 1) {
                message += `, Red giants to ${format(collapse.stars[0])}`;
                if (researchesExtra[4][0] >= 2) {
                    message += `, Neutron stars - ${format(collapse.stars[1])}`;
                    if (researchesExtra[4][0] >= 3) {
                        message += ` and Black holes - ${format(collapse.stars[2])}`;
                    }
                }
            }
            getId('invisibleBought').textContent = message;
        }
    }
};

const collapseReset = () => {
    const { collapseInfo } = global;
    const { collapse } = player;

    collapse.mass = collapseInfo.newMass;
    for (let i = 0; i < player.researchesExtra[4][0]; i++) {
        collapse.stars[i] += collapseInfo.starCheck[i];
    }
    milestoneCheck(0, 4);
    milestoneCheck(1, 4);
    reset('collapse', [4, 5]);
    calculateMaxLevel(0, 4, 'researches');
    calculateMaxLevel(1, 4, 'researches');
    calculateMaxLevel(2, 4, 'researches');
};
