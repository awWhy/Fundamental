import { checkBuilding, checkUpgrade, milestoneCheck } from './Check';
import Limit from './Limit';
import { getId } from './Main';
import { cloneArray, global, player } from './Player';
import { reset, resetStage } from './Reset';
import { Alert, Confirm, playEvent } from './Special';
import { overlimit } from './Types';
import { format, getUpgradeDescription, numbersUpdate, stageCheck, updateRankInfo, visualUpdateUpgrades } from './Update';

export const assignBuildingInformation = () => { //Sets buildingInfo.producing for all active buildings, also related upgrade effects
    const { strangeInfo, upgradesInfo, researchesInfo, researchesExtraInfo, inflationInfo } = global;
    const { buildings, upgrades, researches, researchesExtra, strangeness } = player;
    const { producing } = global.buildingsInfo;
    const strangeQuarks = player.strange[0].current;
    const activeAll = global.stageInfo.activeAll;
    const vacuum = player.inflation.vacuum;

    if (activeAll.includes(1)) {
        const { discharge } = player;
        const v = vacuum ? 0 : 2;

        strangeInfo.stageBoost[1] = strangeness[1][8] >= 1 ? (strangeQuarks + 1) ** (vacuum ? 0.4 : 0.26) : null;
        global.dischargeInfo.bonus = strangeness[1][2];
        upgradesInfo[1].effect[5] = (4 + strangeness[1][0]) * 2 ** researches[1][4];
        upgradesInfo[1].effect[7] = Math.round((1.02 + 0.01 * researches[1][1]) * 100) / 100;
        researchesExtraInfo[1].effect[4] = 1 + upgradesInfo[1].effect[5] / 100;
        const totalMultiplier = upgradesInfo[1].effect[5] ** (discharge.current + global.dischargeInfo.bonus);

        const listForMult5 = [totalMultiplier] as Array<number | overlimit>;
        let prod5Number = vacuum ? 0.2 : 0.3;
        if (vacuum && upgrades[1][4] === 1) { prod5Number *= 5; }
        if (upgrades[1][7] === 1) { listForMult5.push(Limit(upgradesInfo[1].effect[7]).power(buildings[1][(5 - v) as 3 | 5].true).toArray()); }
        listForMult5.push(prod5Number);
        producing[1][5 - v] = Limit(buildings[1][5 - v].current).multiply(...listForMult5).toArray();

        researchesInfo[1].effect[2] = 12 + strangeness[1][5] * (vacuum ? 4 : 3) / 10;
        researchesExtraInfo[1].effect[1] = researchesExtra[1][1] >= 1 ? (21 - researchesExtra[1][1]) / 10 : Math.E;
        if (Limit(producing[1][5 - v]).moreThan([1, 0])) {
            const listForRadiation = [Limit(researchesInfo[1].effect[2]).power(researches[1][2]).toArray()] as Array<number | overlimit>;
            let radiationProd = 1;
            if (upgrades[1][9] === 1 && discharge.energy > 1) { radiationProd *= discharge.energy; }
            if (researches[1][5] >= 1) { radiationProd *= (discharge.current + global.dischargeInfo.bonus + 1) * researches[1][5]; }
            if (!vacuum && strangeInfo.stageBoost[1] !== null) { listForRadiation.push(strangeInfo.stageBoost[1]); }
            listForRadiation.push(radiationProd);
            upgradesInfo[1].effect[8] = Limit(producing[1][5 - v]).log(researchesExtraInfo[1].effect[1]).multiply(...listForRadiation).toArray();
        } else { upgradesInfo[1].effect[8] = [0, 0]; }

        const listForMult4 = [totalMultiplier] as Array<number | overlimit>;
        let prod4Number = vacuum ? 0.2 : 0.4;
        if (vacuum) {
            if (upgrades[1][3] === 1) { prod4Number *= 10; }
        } else if (upgrades[1][4] === 1) { prod4Number *= 5; }
        if (upgrades[1][7] === 1) { listForMult4.push(Limit(upgradesInfo[1].effect[7]).power(buildings[1][(4 - v) as 2 | 4].true).toArray()); }
        listForMult4.push(prod4Number);
        producing[1][4 - v] = Limit(buildings[1][4 - v].current).multiply(...listForMult4).toArray();

        const listForMult3 = [totalMultiplier] as Array<number | overlimit>;
        let prod3Number = vacuum ? 0.2 : 0.5;
        if (upgrades[1][0] === 1) { prod3Number *= 5; }
        if (!vacuum && upgrades[1][3] === 1) { prod3Number *= 10; }
        if (upgrades[1][7] === 1) { listForMult3.push(Limit(upgradesInfo[1].effect[7]).power(buildings[1][(3 - v) as 1 | 3].true).toArray()); }
        listForMult3.push(prod3Number);
        producing[1][3 - v] = Limit(buildings[1][3 - v].current).multiply(...listForMult3).toArray();

        if (vacuum) {
            const listForMult2 = [buildings[1][2].current, totalMultiplier];
            if (upgrades[1][7] === 1) { listForMult2.push(Limit(upgradesInfo[1].effect[7]).power(buildings[1][2].true).toArray()); }
            producing[1][2] = Limit([2, -1]).multiply(...listForMult2).toArray();

            const listForMult1 = [buildings[1][1].current, totalMultiplier];
            if (upgrades[1][7] === 1) { listForMult1.push(Limit(upgradesInfo[1].effect[7]).power(buildings[1][1].true).toArray()); }
            producing[1][1] = Limit([1, -3]).multiply(...listForMult1).toArray();

            producing[1][1] = Limit(producing[1][1]).power(Limit(producing[1][1]).lessThan([1, 0]) ? 1.1 : 0.1).toArray();
            researchesExtraInfo[1].effect[3] = researchesExtra[1][3] >= 1 ? (20 + 5 * researchesExtra[1][3]) / 100 : 0;
            inflationInfo.preonCap = Limit(2e13 * Math.max(discharge.energy, 1) ** researchesExtraInfo[1].effect[3]).toArray();
            if (player.collapse.stars[2] >= 1) { inflationInfo.preonCap = Limit(inflationInfo.preonCap).multiply(global.collapseInfo.starEffect[2]()).toArray(); }
            if (Limit(producing[1][1]).moreOrEqual(inflationInfo.preonCap)) { producing[1][1] = inflationInfo.preonCap; }
        }
    }
    const dischargeBoost = researchesExtra[1][4] >= 1 ? (researchesExtraInfo[1].effect[4] as number) ** (player.discharge.current + global.dischargeInfo.bonus) : 1;

    if (activeAll.includes(2)) {
        if (vacuum) {
            buildings[2][0].current = Limit(buildings[1][5].current).divide([6.02214076, 23]).toArray();
            buildings[2][0].total = Limit(buildings[1][5].total).divide([6.02214076, 23]).toArray();
        }
        const current5 = buildings[2][5].true;
        let current4 = buildings[2][4].true;
        let current3 = buildings[2][3].true;
        let current2 = buildings[2][2].true;
        if (upgrades[2][6] === 1) { current4 += current5; }
        upgradesInfo[2].effect[5] = 1 + researches[2][5];
        if (upgrades[2][5] === 1) { current3 += current4 * upgradesInfo[2].effect[5]; }
        upgradesInfo[2].effect[4] = 1 + researches[2][4];
        if (upgrades[2][4] === 1) { current2 += current3 * upgradesInfo[2].effect[4]; }
        //buildings[2][5].current = Limit(current5).toArray();
        buildings[2][4].current = Limit(current4).toArray();
        buildings[2][3].current = Limit(current3).toArray();
        buildings[2][2].current = Limit(current2).toArray();

        producing[2][6] = Limit([2, 0]).multiply(dischargeBoost, buildings[2][6].current).toArray();

        const listForMult5 = [dischargeBoost] as Array<number | overlimit>;
        researchesExtraInfo[2].effect[2] = Limit(player.vaporization.clouds).power(0.1).toArray();
        if (researchesExtra[2][2] >= 1) { listForMult5.push(researchesExtraInfo[2].effect[2]); }
        if (Limit(producing[2][6]).moreThan([1, 0])) { listForMult5.push(producing[2][6]); }
        producing[2][5] = Limit(2 * current5).multiply(...listForMult5).toArray();

        const listForMult4 = [dischargeBoost] as Array<number | overlimit>;
        if (Limit(producing[2][5]).moreThan([1, 0])) { listForMult4.push(producing[2][5]); }
        producing[2][4] = Limit(2 * current4).multiply(...listForMult4).toArray();

        const listForMult3 = [dischargeBoost] as Array<number | overlimit>;
        if (Limit(producing[2][4]).moreThan([1, 0])) { listForMult3.push(producing[2][4]); }
        producing[2][3] = Limit(2 * current3).multiply(...listForMult3).toArray();

        const listForMult2 = [player.vaporization.clouds, dischargeBoost] as Array<number | overlimit>;
        upgradesInfo[2].effect[2] = 0.02 + researches[2][2] * (vacuum ? 0.03 : 0.02);
        upgradesInfo[2].effect[3] = 0.02 + researches[2][3] * (vacuum ? 0.02 : 0.03);
        researchesExtraInfo[2].effect[1] = vacuum ? 1.5 ** researchesExtra[2][1] : 10 ** (researchesExtra[2][1] - 1); //Clouds production of Drops (pre Vacuum)
        strangeInfo.stageBoost[2] = strangeness[2][8] >= 1 ? (strangeQuarks + 1) ** (vacuum ? 0.22 : 0.32) : null;
        let prod2Number = 4 * current2;
        if (upgrades[2][2] === 1) { listForMult2.push(Limit(buildings[2][0][researches[2][1] >= 2 ? 'total' : 'current']).power(upgradesInfo[2].effect[2]).toArray()); }
        if (upgrades[2][3] === 1) { listForMult2.push(Limit(buildings[2][1][researches[2][1] >= 1 ? 'total' : 'current']).max([1, 0]).power(upgradesInfo[2].effect[3]).toArray()); }
        if (vacuum && researchesExtra[2][1] >= 1) { prod2Number *= researchesExtraInfo[2].effect[1]; }
        if (Limit(producing[2][3]).moreThan([1, 0])) { listForMult2.push(producing[2][3]); }
        if (strangeness[2][1] >= 1) { prod2Number *= 2 ** strangeness[2][1]; }
        if (strangeInfo.stageBoost[2] !== null) { listForMult2.push(strangeInfo.stageBoost[2]); }
        producing[2][2] = Limit(prod2Number).multiply(...listForMult2).toArray();

        let effective: overlimit;
        if (vacuum) {
            const excess = Limit(buildings[2][1].current).minus(buildings[2][1].true).toArray();
            effective = Limit(excess).moreThan([1, 0]) ? Limit(excess).power(0.5).plus(buildings[2][1].true).toArray() : buildings[2][1].current;
        } else { effective = buildings[2][1].current; }
        const listForMult1 = [dischargeBoost, effective] as Array<number | overlimit>;
        if (researches[2][0] >= 1) { listForMult1.push(3 ** researches[2][0]); }
        if (upgrades[2][0] === 1) { listForMult1.push(Limit([vacuum ? 1.05 : 1.1, 0]).power(buildings[2][1].true).toArray()); }
        if (strangeness[2][0] >= 1) { listForMult1.push(2 ** strangeness[2][0]); }
        producing[2][1] = Limit(vacuum ? [1, 0] : [6, -4]).multiply(...listForMult1).toArray();
        if (vacuum) {
            producing[2][1] = Limit(producing[2][1]).plus([1, 0]).toArray();
            upgradesInfo[1].effect[8] = Limit(upgradesInfo[1].effect[8] as overlimit).multiply(producing[2][1]).toArray();
        }

        if (current2 < 1) { //Hardlock prevention
            if (!vacuum && Limit(buildings[2][1].current).equal([0, 0]) && Limit(buildings[2][0].current).lessThan([2.8, -3])) { buildings[2][0].current = [2.8, -3]; }
            if (Limit(buildings[2][1].current).lessThan(buildings[2][1].true)) {
                const old = buildings[2][1].true;
                buildings[2][1].true = Math.floor(Limit(buildings[2][1].current).toNumber());
                if (vacuum) { player.discharge.energy -= (old - buildings[2][1].true) * global.dischargeInfo.energyType[2][1]; }
            }
        }
    }
    if (activeAll.includes(3)) {
        if (vacuum) {
            buildings[3][0].current = Limit(buildings[1][0].current).multiply([1.78266192, -33]).toArray();
            global.strangeInfo.stageBoost[3] = player.strangeness[3][7] >= 1 ? (strangeQuarks + 1) ** 0.14 - 1 : null;
            global.accretionInfo.extra = global.strangeInfo.stageBoost[3] ?? 0;
        } else { global.accretionInfo.extra = 0; }

        producing[3][5] = Limit([1.1, 0]).power(buildings[3][5].true).toArray();
        if (buildings[3][5].true > 0) {
            producing[3][5] = Limit(producing[3][5]).multiply(dischargeBoost).toArray();
        }

        producing[3][4] = Limit((upgrades[3][12] === 1 ? [1.14, 0] : [1.1, 0])).power(buildings[3][4].true).toArray();
        if (buildings[3][4].true > 0) {
            producing[3][4] = Limit(producing[3][4]).multiply(dischargeBoost, producing[3][5]).toArray();
        }

        const listForMult3 = [producing[3][4], dischargeBoost] as Array<number | overlimit>;
        let prod3Number = 0.1;
        if (upgrades[3][4] === 1 && researchesExtra[3][2] > 0) { prod3Number *= 2; }
        if (upgrades[3][8] === 1) { listForMult3.push(Limit([1.005, 0]).power(buildings[3][3].true).toArray()); }
        if (strangeness[3][1] >= 1) { prod3Number *= 2 ** strangeness[3][1]; }
        listForMult3.push(prod3Number);
        producing[3][3] = Limit(buildings[3][3].current).multiply(...listForMult3).toArray();

        const listForMult2 = [dischargeBoost] as Array<number | overlimit>;
        researchesInfo[3].effect[5] = Limit(buildings[3][0].current).power(0.025 * researches[3][5]).toNumber();
        if (vacuum && researchesInfo[3].effect[5] > 4000) { researchesInfo[3].effect[5] = 4000; }
        let prod2Number = 0.1;
        if (upgrades[3][3] === 1) { listForMult2.push(Limit([1.02, 0]).power(buildings[3][2].true).toArray()); }
        if (upgrades[3][4] === 1) { prod2Number *= 4; }
        if (researches[3][2] >= 1) { prod2Number *= 3 ** researches[3][2]; }
        if (researches[3][4] >= 1) { prod2Number *= 5 ** researches[3][4]; }
        if (researches[3][5] >= 1) { prod2Number *= researchesInfo[3].effect[5]; }
        if (strangeness[3][1] >= 1) { prod2Number *= 2 ** strangeness[3][1]; }
        if (strangeness[3][3] >= 1) { listForMult2.push(producing[3][4]); }
        listForMult2.push(prod2Number);
        producing[3][2] = Limit(buildings[3][2].current).multiply(...listForMult2).toArray();

        const listForMult1 = [dischargeBoost] as Array<number | overlimit>;
        upgradesInfo[3].effect[0] = 1.01 + 0.01 * researches[3][1];
        upgradesInfo[3].effect[1] = Limit(buildings[3][1].current).power(0.05 + 0.01 * researchesExtra[3][3]).toArray();
        upgradesInfo[3].effect[7] = 2 * 1.5 ** researches[3][6];
        upgradesInfo[3].effect[10] = vacuum ? (3 * 2 ** researches[3][7]) : (10 * 3 ** researches[3][7]);
        researchesExtraInfo[3].effect[0] = 1.1 ** researchesExtra[3][0];
        researchesExtraInfo[3].effect[1] = (1 + 0.1 * researchesExtra[3][1]) ** (player.accretion.rank + global.accretionInfo.extra);
        let prod1Number = vacuum ? 1 : 1e-19;
        if (upgrades[3][0] === 1) { listForMult1.push(Limit(upgradesInfo[3].effect[0]).power(buildings[3][1].true).toArray()); }
        if (upgrades[3][1] === 1) { listForMult1.push(upgradesInfo[3].effect[1]); }
        if (upgrades[3][2] === 1) { prod1Number *= 2; }
        if (upgrades[3][5] === 1) { prod1Number *= 3; }
        if (upgrades[3][7] === 1) { prod1Number *= upgradesInfo[3].effect[7]; }
        if (upgrades[3][9] === 1) { prod1Number *= 2; }
        if (upgrades[3][10] === 1) { prod1Number *= upgradesInfo[3].effect[10]; }
        if (researches[3][0] >= 1) { prod1Number *= 3 ** researches[3][0]; }
        if (researches[3][3] >= 1) { prod1Number *= 2 ** researches[3][3]; }
        if (researchesExtra[3][0] >= 1) { prod1Number *= researchesExtraInfo[3].effect[0]; }
        if (researchesExtra[3][1] >= 1) { prod1Number *= researchesExtraInfo[3].effect[1]; }
        if (strangeness[3][0] >= 1) { prod1Number *= 2 ** strangeness[3][0]; }
        if (strangeness[3][3] >= 1) { listForMult1.push(producing[3][4]); }
        listForMult1.push(prod1Number);
        producing[3][1] = Limit(buildings[3][1].current).multiply(...listForMult1).toArray();
        if (vacuum) {
            const { elements } = player;

            let capGain = 1;
            if (elements[3] === 1) { capGain += 0.25; }
            if (elements[5] === 1) { capGain += 0.0375 * buildings[4][1].true; }
            if (elements[10] === 1) { capGain *= 2; }
            if (elements[14] === 1) { capGain *= 1.4; }
            capGain *= 1 + buildings[4][1].true + (elements[15] === 1 ? buildings[4][2].true + buildings[4][3].true + buildings[4][4].true + buildings[4][5].true : 0);
            inflationInfo.dustCap = Limit(5e45 * (600 / inflationInfo.massCap)).multiply(capGain).toArray();

            producing[3][1] = Limit(producing[3][1]).plus([1, 0]).toArray();
            if (Limit(producing[3][1]).moreOrEqual(inflationInfo.dustCap)) { producing[3][1] = inflationInfo.dustCap; }
            producing[1][1] = Limit(producing[1][1]).multiply(producing[3][1]).toArray();

            researchesExtraInfo[3].effect[4] = researchesExtraInfo[3].effect[1] * researchesExtra[3][4];
            if (researchesExtra[3][4] >= 1) { producing[2][2] = Limit(producing[2][2]).multiply(researchesExtraInfo[3].effect[4]).toArray(); }
        } else if (player.accretion.rank >= 5) {
            producing[3][1] = Limit(producing[3][1]).power(Limit(producing[3][1]).lessThan([1, 0]) ? 1.1 : 0.8).toArray();
        }
    }
    if (activeAll.includes(4)) {
        const { elements } = player;
        const { stars } = player.collapse;
        const { starEffect } = global.collapseInfo;

        researchesInfo[4].effect[1] = Limit(1 + (0.01 * Math.min(researches[4][1], 5)) + (researches[4][1] > 5 ? 0.005 * (researches[4][1] - 5) : 0)).power(buildings[4][1].true + buildings[4][2].true + buildings[4][3].true + buildings[4][4].true + buildings[4][5].true).toArray();
        if (Limit(researchesInfo[4].effect[1]).moreThan([1, 10])) { researchesInfo[4].effect[1] = Limit(researchesInfo[4].effect[1]).minus([1, 10]).power(0.7).plus([1, 10]).toArray(); }

        const listForTotal = [researchesInfo[4].effect[1]] as Array<number | overlimit>;
        strangeInfo.stageBoost[4] = strangeness[4][9] >= 1 ? (strangeQuarks + 1) ** (vacuum ? 0.2 : 0.36) : null;
        researchesInfo[4].effect[0] = (1.1 + 0.2 * researches[4][2]) ** researches[4][0];
        let totalNumber = researchesInfo[4].effect[0] * dischargeBoost * starEffect[1]();
        if (elements[4] === 1) { totalNumber *= 1.1; }
        if (elements[19] === 1) { totalNumber *= 3; }
        if (elements[23] === 1 && stars[2] > 10) { totalNumber *= Math.log10(stars[2]); }
        if (elements[24] === 1) { listForTotal.push(Limit(buildings[4][0].current).max([1, 0]).power(0.01).toArray()); }
        if (elements[26] === 1) { totalNumber *= 2; }
        if (strangeness[4][0] >= 1) { totalNumber *= 1.5 ** strangeness[4][0]; }
        if (vacuum || player.milestones[1][1] >= 3) { totalNumber *= 4; }
        if (strangeInfo.stageBoost[4] !== null) { listForTotal.push(strangeInfo.stageBoost[4]); }
        listForTotal.push(totalNumber);
        const totalMultiplier = Limit(global.collapseInfo.massEffect()).multiply(...listForTotal).toArray();

        producing[4][5] = Limit([1, 11]).multiply(buildings[4][5].current, totalMultiplier).toArray();

        producing[4][4] = Limit([2, 9]).multiply(buildings[4][4].current, totalMultiplier).toArray();

        producing[4][3] = Limit([2.5, 7]).multiply(buildings[4][3].current, totalMultiplier).toArray();

        const listForMult2 = [totalMultiplier] as Array<number | overlimit>;
        let prod2Number = 300 * starEffect[0]();
        if (researches[4][3] >= 1) { prod2Number *= 10; }
        listForMult2.push(prod2Number);
        producing[4][2] = Limit(buildings[4][2].current).multiply(...listForMult2).toArray();

        const listForMult1 = [totalMultiplier] as Array<number | overlimit>;
        let prod1Number = 22;
        if (elements[1] === 1) { prod1Number *= 2; }
        listForMult1.push(prod1Number);
        producing[4][1] = Limit(buildings[4][1].current).multiply(...listForMult1).toArray();
    }
    if (activeAll.includes(5)) {
        producing[5][3] = Limit(vacuum ? [upgrades[5][2] === 1 ? 3 : 2, 0] : [1, 1]).power(buildings[5][3].true).toArray();

        const listForMult2 = [producing[5][3]] as Array<number | overlimit>;
        let prod2Number = 1.5;
        upgradesInfo[5].effect[1] = 6 * (4 ** strangeness[5][4]);
        if (upgrades[5][1] === 1) { prod2Number *= upgradesInfo[5].effect[1]; }
        if (researches[5][1] >= 1) { prod2Number *= 3 ** researches[5][1]; }
        listForMult2.push(prod2Number);
        producing[5][2] = Limit(buildings[5][2].current).multiply(...listForMult2).toArray();

        const listForMult1 = [producing[5][3]] as Array<number | overlimit>;
        let prod1Number = 1;
        upgradesInfo[5].effect[0] = 4 * (3 ** strangeness[5][3]);
        if (upgrades[5][0] === 1) { prod1Number *= upgradesInfo[5].effect[0]; }
        if (researches[5][0] >= 1) { prod1Number *= 4 ** researches[5][0]; }
        listForMult1.push(prod1Number);
        producing[5][1] = Limit(buildings[5][1].current).multiply(...listForMult1).toArray();

        const clusterBoost = producing[5][2];
        if (Limit(clusterBoost).moreThan([1, 0])) {
            producing[4][4] = Limit(producing[4][4]).multiply(clusterBoost).toArray();
            if (researches[5][1] >= 2) { producing[4][3] = Limit(producing[4][3]).multiply(clusterBoost).divide([3, 0]).toArray(); }
            if (researches[5][1] >= 3) { producing[4][2] = Limit(producing[4][2]).multiply(clusterBoost).divide([9, 0]).toArray(); }
            if (researches[5][1] >= 4) { producing[4][1] = Limit(producing[4][1]).multiply(clusterBoost).divide([2.7, 1]).toArray(); }
        }
    }
};

export const buyBuilding = (index: number, stageIndex = player.stage.active, auto = false) => {
    if (!checkBuilding(index, stageIndex)) { return; }

    const { buildingsInfo } = global;
    const building = player.buildings[stageIndex][index as 1];

    const galaxy = stageIndex === 5 && index === 3;
    const convert = ((stageIndex === 2 && index === 1) || stageIndex === 3) && player.inflation.vacuum;

    let extra = index - 1; //What you are paying
    let stageExtra = stageIndex;
    if (stageIndex === 2) {
        if (index !== 1) { extra = 1; } //Drops
    } else if (stageIndex >= 3) {
        extra = 0; //Mass || Elements
        if (stageIndex === 5) { stageExtra = 4; }
    }

    let currency: number | overlimit;
    if (galaxy) {
        currency = player.collapse.mass;
    } else if (convert) {
        currency = stageIndex === 2 ?
            Limit(player.buildings[1][5].current).divide([6.02214076, 23]).toArray() :
            Limit(player.buildings[1][0].current).multiply([1.78266192, -33]).toArray();
    } else {
        currency = cloneArray(player.buildings[stageExtra][extra].current); //Cloning is not necessary
    }

    let budget = currency;
    if (auto) {
        /*if ((stageIndex === 3 || (stageIndex === 1 && index === 1)) && player.strangeness[3][4] >= 2 && Limit(buildingsInfo.producing[3][1]).moreOrEqual(global.inflationInfo.dustCap)) {
            budget = Limit(currency).divide(global.inflationInfo.massCap * 2).toArray();
        } else*/ if (building.true > 0 && !galaxy) {
            budget = Limit(currency).divide([2, 0]).toArray();
        }
    }

    if (Limit(calculateBuildingsCost(index, stageIndex)).moreThan(budget)) {
        if (global.screenReader && !auto) { getId('SRMain').textContent = `Coudn't make '${buildingsInfo.name[stageIndex][index]}', because didn't had enough of '${galaxy ? 'Mass' : convert && stageIndex === 2 ? 'Moles' : buildingsInfo.name[stageExtra][extra]}'`; }
        return;
    }
    const howMany = player.researchesAuto[0] === 0 ? 1 : auto ? -1 : player.toggles.shop.howMany;

    let canAfford: number;
    let total: overlimit;
    if (howMany !== 1) {
        const increase = buildingsInfo.increase[stageIndex][index]; //Must be >1; for <1, formulas are '1 - increase', '1 - increase ** levels'
        const firstCost = buildingsInfo.firstCost[stageIndex][index];
        const alreadyBought = building.true;
        const totalBefore = Limit(increase).power(alreadyBought).minus([1, 0]).divide(increase - 1).multiply(firstCost).toArray();
        const maxAfford = Math.floor(Limit(budget).plus(totalBefore).multiply(increase - 1).divide(firstCost).plus([1, 0]).log(10).divide(Math.log10(increase)).toNumber()) - alreadyBought;

        if (maxAfford < howMany && howMany !== -1 && player.toggles.shop.strict) { return; }
        canAfford = howMany !== -1 ? Math.min(maxAfford, howMany) : maxAfford;
        total = Limit(increase).power(canAfford + alreadyBought).minus([1, 0]).divide(increase - 1).multiply(firstCost).minus(totalBefore).toArray();
    } else {
        canAfford = 1;
        total = calculateBuildingsCost(index, stageIndex);
    }

    currency = Limit(currency).minus(total).toArray();
    building.true += canAfford;
    building.current = Limit(building.current).plus(canAfford).toArray();
    building.total = Limit(building.total).plus(canAfford).toArray();
    building.trueTotal = Limit(building.trueTotal).plus(canAfford).toArray();
    if (Limit(building.highest).lessThan(building.current)) { building.highest = cloneArray(building.current); }

    if (galaxy) {
        //player.collapse.mass = Math.max(Limit(currency).toNumber(), 0.01235);
        reset('galaxy', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [4, 5]);
    } else {
        if (convert) {
            stageIndex === 2 ?
                player.buildings[1][5].current = Limit(currency).multiply([6.02214076, 23]).toArray() :
                player.buildings[1][0].current = Limit(currency).divide([1.78266192, -33]).toArray();
        } else { player.buildings[stageExtra][extra].current = currency; }

        assignBuildingInformation();
        if (stageIndex === player.stage.active) { numbersUpdate(); }
    }

    //Milestones that are based on bought amount
    if (player.inflation.vacuum || stageIndex === 1) {
        if (!galaxy || player.strangeness[1][9] < 1) {
            global.dischargeInfo.updateEnergy();
            assignEnergy(global.dischargeInfo.energyType[stageIndex][index] * canAfford);
        }
        milestoneCheck(1, 1);
    }
    if (stageIndex === 2) {
        if (index !== 1) { milestoneCheck(1, 2); }
    } else if (stageIndex === 3) {
        if (index === 4) { milestoneCheck(1, 3); }
    } else if (stageIndex === 4) {
        global.collapseInfo.trueStars += canAfford;
        milestoneCheck(0, 5);
    } else if (stageIndex === 5) {
        if (index === 3) {
            milestoneCheck(1, 5);
            if (!player.events[2]) { playEvent(5, 2); }
        }
    }
    if (!auto && global.screenReader) { getId('SRMain').textContent = `Maded ${format(canAfford)} '${buildingsInfo.name[stageIndex][index]}'`; }
};

export const assignEnergy = (add = 0) => {
    const { discharge } = player;

    if (add === 0 && player.strangeness[1][9] >= 1) {
        const { dischargeInfo } = global;
        dischargeInfo.updateEnergy();

        add = 0;
        for (let s = 1; s < dischargeInfo.energyType.length; s++) {
            const energyType = dischargeInfo.energyType[s];
            const buildings = player.buildings[s];

            for (let i = 1; i < energyType.length; i++) {
                add += energyType[i] * buildings[i as 1].true;
            }
        }
        discharge.energy = add;
    } else { discharge.energy += add; }
    if (!discharge.unlock) { discharge.unlock = discharge.energy >= (player.inflation.vacuum ? 32 : 9); }
    if (discharge.energyMax < discharge.energy) { discharge.energyMax = discharge.energy; }
};

export const calculateBuildingsCost = (index: number, stageIndex: number): overlimit => {
    const { buildingsInfo } = global;

    if (stageIndex === 1) {
        global.upgradesInfo[1].effect[6] = (20 + player.researches[1][0]) / 100; //(0.2 + 1 / 100) / 100
        buildingsInfo.increase[1][index] = Math.round((1.4 - (player.upgrades[1][6] === 1 ? global.upgradesInfo[1].effect[6] : 0)) * 100) / 100;
        if (index === 1) {
            buildingsInfo.firstCost[1][1] = buildingsInfo.startCost[1][1] / (!player.inflation.vacuum && player.upgrades[1][2] === 1 ? 10 : 1);
        } else if (index === 3) {
            buildingsInfo.firstCost[1][3] = buildingsInfo.startCost[1][3] / (player.upgrades[1][1] === 1 ? 10 : 1);
        } else if (index === 4) {
            buildingsInfo.firstCost[1][4] = buildingsInfo.startCost[1][4];
            if (player.inflation.vacuum) {
                if (player.upgrades[1][2] === 1) { buildingsInfo.firstCost[1][4] /= 10; }
                if (player.researchesExtra[1][0] >= 1 && player.upgrades[1][1] === 1) { buildingsInfo.firstCost[1][4] /= 10; }
            }
        }
    } else if (stageIndex === 3) {
        buildingsInfo.firstCost[3][index] = buildingsInfo.startCost[3][index];
        if (!player.inflation.vacuum) {
            global.strangeInfo.stageBoost[3] = player.strangeness[3][7] < 1 ? null : player.strange[0].current < 800 ? (player.strange[0].current + 1) ** 1.66 : (player.strange[0].current + 1) ** 0.66 * 800;
            if (global.strangeInfo.stageBoost[3] !== null) { buildingsInfo.firstCost[3][index] /= global.strangeInfo.stageBoost[3]; }
        }
        if (index === 4) {
            buildingsInfo.increase[3][4] = player.upgrades[3][11] === 1 ? 5 : 10;
        }
    } else if (stageIndex === 4) {
        buildingsInfo.increase[4][index] = Math.round(((1.4 + 0.15 * (index - 1)) - (player.elements[2] === 1 ? 0.1 : 0) - (player.elements[8] === 1 ? 0.05 : 0)) * 100) / 100;
        buildingsInfo.firstCost[4][index] = buildingsInfo.startCost[4][index] / (player.elements[13] === 1 ? 1e3 : 1) / (2 ** player.strangeness[4][1]);
    }

    return Limit(buildingsInfo.increase[stageIndex][index]).power(player.buildings[stageIndex][index as 1].true).multiply(buildingsInfo.firstCost[stageIndex][index]).toArray();
};

export const calculateGainedBuildings = (get: number, stageIndex: number, time: number) => {
    let add: overlimit;
    if (stageIndex === 1 && get === (player.inflation.vacuum ? 5 : 3)) {
        add = Limit(global.upgradesInfo[1].effect[8] as overlimit).multiply(time).toArray();
    } else if (stageIndex === 5) {
        add = Limit(global.buildingsInfo.producing[5][1]).multiply(time).toArray();
    } else {
        add = Limit(global.buildingsInfo.producing[stageIndex][get + 1]).multiply(time).toArray();

        if (stageIndex === 2 && get === 1 && !player.inflation.vacuum && player.researchesExtra[2][1] >= 1) {
            add = Limit(add).plus(time * (global.researchesExtraInfo[2].effect[1] as number)).toArray();
        }
    }
    if (Limit(add).equal([0, 0])) { return; }
    if (!Limit(add).isFinite()) { return console.warn('NaN or Infinity detected'); }

    let stageGet = stageIndex;
    if (stageIndex === 4) {
        get = 0;
    } else if (stageIndex === 5) {
        if (get > 0) { add = Limit(add).divide(4 ** get).toArray(); }
        stageGet = 4;
        get++;
    }
    const building = player.buildings[stageGet][get];

    building.current = Limit(building.current).plus(add).toArray();
    building.total = Limit(building.total).plus(add).toArray();
    building.trueTotal = Limit(building.trueTotal).plus(add).toArray();
    if (Limit(building.highest).lessThan(building.current)) { building.highest = cloneArray(building.current); }

    if (!player.inflation.vacuum) {
        if (Limit(building.current).moreThan([1, 300])) { building.current = [1, 300]; }
        if (Limit(building.total).moreThan([1, 300])) { building.total = [1, 300]; }
        if (Limit(building.trueTotal).moreThan([1, 300])) { building.trueTotal = [1, 300]; }
        if (Limit(building.highest).moreThan([1, 300])) { building.highest = [1, 300]; }
    }

    //Milestones that are based on gained amount
    if (stageIndex === 3) {
        if (get === 0) { //It's never 0 after vacuum
            if (player.accretion.rank < 5 && Limit(building.current).moreThan([1, 30])) { building.current = [1, 30]; }
            milestoneCheck(0, 3);
        }
    } else if (stageIndex === 4) {
        if (Limit(player.collapse.elementsMax).lessThan(building.current)) { player.collapse.elementsMax = cloneArray(building.current); }
    }
};

export const buyUpgrades = (upgrade: number, stageIndex: 'auto' | number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements' | 'strangeness', auto = false): boolean => {
    if (stageIndex === 'auto') { stageIndex = player.stage.active; }
    if (type === 'ASR') { upgrade = stageIndex; }
    if (!auto && !checkUpgrade(upgrade, stageIndex, type)) { return false; } //Auto already checked if allowed

    let currency: number | overlimit;
    if (type === 'strangeness') {
        currency = player.strange[0].current;
    } else if (stageIndex === 1) {
        currency = player.discharge.energy;
    } else if (stageIndex === 2) {
        currency = cloneArray(player.buildings[2][1].current);
    } else if (stageIndex === 3) {
        currency = player.inflation.vacuum ?
            Limit(player.buildings[1][0].current).multiply([1.78266192, -33]).toArray() :
            cloneArray(player.buildings[3][0].current);
    } else /* if (stageIndex === 4 || stageIndex === 5) */ {
        currency = cloneArray(player.buildings[4][0].current);
    }

    if (type === 'upgrades') {
        if (player.upgrades[stageIndex][upgrade] >= 1) { return false; }

        const pointer = global.upgradesInfo[stageIndex];
        if (Limit(currency).lessThan(pointer.startCost[upgrade])) { return false; }

        player.upgrades[stageIndex][upgrade]++;
        currency = Limit(currency).minus(pointer.startCost[upgrade]).toArray();

        if (global.screenReader && !auto) { getId('SRMain').textContent = `You have created upgrade '${pointer.description[upgrade]}'`; }
    } else if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[type + 'Info' as 'researchesInfo'][stageIndex];

        if (player[type][stageIndex][upgrade] >= pointer.max[upgrade]) { return false; }
        if (Limit(currency).lessThan(pointer.cost[upgrade])) { return false; }

        player[type][stageIndex][upgrade]++;
        currency = Limit(currency).minus(pointer.cost[upgrade]).toArray();

        /* Special cases */
        if (type === 'researches') {
            if (stageIndex === 4 && upgrade === 2) {
                calculateMaxLevel(0, 4, 'researches');
            }
        } else if (type === 'researchesExtra') {
            if (stageIndex === 1 && upgrade === 2) {
                player.stage.current++;
                stageCheck('soft');
            }
        }
        if (global.screenReader && !auto) { getId('SRMain').textContent = `You have researched '${pointer.description[upgrade]}', level is now ${player[type][upgrade]} ${player[type][stageIndex][upgrade] >= pointer.max[upgrade] ? 'maxed' : ''}`; }
        calculateResearchCost(upgrade, stageIndex, type);
    } else if (type === 'researchesAuto' || type === 'ASR') {
        const pointer = global[type + 'Info' as 'researchesAutoInfo'];

        if (player[type][upgrade] >= pointer.max[upgrade]) { return false; }
        if (Limit(currency).lessThan(pointer.cost[upgrade])) { return false; }

        player[type][upgrade]++;
        currency = Limit(currency).minus(pointer.cost[upgrade]).toArray();

        /* Special cases */
        if (global.screenReader && !auto) { getId('SRMain').textContent = `You have researched '${type === 'ASR' ? 'Automatization for making Structures.' : pointer.description[upgrade]}', level is now ${player[type][upgrade]} ${player[type][upgrade] >= pointer.max[upgrade] ? 'maxed' : ''}`; }
        calculateResearchCost(upgrade, stageIndex, type);
    } else if (type === 'elements') {
        if (player.elements[upgrade] >= 1) { return false; }

        const { elementsInfo } = global;
        if (Limit(currency).lessThan(elementsInfo.startCost[upgrade])) { return false; }

        player.elements[upgrade] = 1;
        currency = Limit(currency).minus(elementsInfo.startCost[upgrade]).toArray();
        if (!player.collapse.show.includes(upgrade)) { player.collapse.show.push(upgrade); }

        /* Special cases */
        if (upgrade === 7 || upgrade === 16 || upgrade === 20 || upgrade === 25) {
            calculateMaxLevel(1, 4, 'researches');
        } else if (upgrade === 9 || upgrade === 17) {
            calculateMaxLevel(0, 4, 'researches');
        } else if (upgrade === 11) {
            calculateMaxLevel(2, 4, 'researches');
        } else if (upgrade === 26 && player.stage.current === 4) {
            stageNoReset();
        }
        if (global.screenReader && !auto) { getId('SRMain').textContent = `You have obtained Element '${elementsInfo.description[upgrade]}'`; }
    } else if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        if (player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade]) { return false; }
        if (currency < global.strangenessInfo[stageIndex].cost[upgrade]) { return false; }

        player.strangeness[stageIndex][upgrade]++;
        (currency as number) -= pointer.cost[upgrade];

        /* Special cases */
        if (stageIndex === 1) {
            if (upgrade === 6) {
                player.ASR[1] = Math.max(player.strangeness[1][6], player.ASR[1]);
                calculateMaxLevel(0, 1, 'ASR');
            } else if (upgrade === 7) {
                player.researchesAuto[0] = Math.max(1, player.researchesAuto[0]);
                calculateMaxLevel(0, 1, 'researchesAuto');
            } else if (upgrade === 9) {
                assignEnergy();
                //calculateMaxLevel(3, 1, 'strangeness');
                //calculateMaxLevel(4, 2, 'strangeness');
                //calculateMaxLevel(4, 3, 'strangeness');
                //calculateMaxLevel(5, 4, 'strangeness');
            }
        } else if (stageIndex === 2) {
            if (upgrade === 2) {
                if (player.strangeness[2][2] < 3) { calculateMaxLevel(4, 2, 'researches'); }
                if (player.strangeness[2][2] === 2) { calculateMaxLevel(5, 2, 'researches'); }
            } else if (upgrade === 5) {
                player.ASR[2] = Math.max(player.strangeness[2][5], player.ASR[2]);
                calculateMaxLevel(0, 2, 'ASR');
            } else if (upgrade === 6) {
                player.researchesAuto[1] = Math.max(1, player.researchesAuto[1]);
                calculateMaxLevel(1, 2, 'researchesAuto');
            } else if (upgrade === 9) {
                calculateMaxLevel(0, 2, 'ASR');
                calculateMaxLevel(5, 2, 'strangeness');
            }
        } else if (stageIndex === 3) {
            if (upgrade === 2) {
                calculateMaxLevel(0, 3, 'researchesExtra');
                calculateMaxLevel(1, 3, 'researchesExtra');
            } else if (upgrade === 5) {
                player.ASR[3] = Math.max(player.strangeness[3][5], player.ASR[3]);
                calculateMaxLevel(0, 3, 'ASR');
            } else if (upgrade === 6) {
                calculateMaxLevel(2, 3, 'researchesAuto');
            } else if (upgrade === 8) {
                calculateMaxLevel(0, 3, 'ASR');
                calculateMaxLevel(5, 3, 'strangeness');
            } else if (upgrade === 9) {
                assignNewMassCap(player.accretion.input);
            }
        } else if (stageIndex === 4) {
            if (upgrade === 6) {
                player.ASR[4] = Math.max(player.strangeness[4][6], player.ASR[4]);
                calculateMaxLevel(0, 4, 'ASR');
            } else if (upgrade === 10) {
                calculateMaxLevel(0, 4, 'ASR');
                calculateMaxLevel(6, 4, 'strangeness');
            }
        } else if (stageIndex === 5) {
            if (upgrade === 0) {
                if (!player.inflation.vacuum && !global.stageInfo.activeAll.includes(player.strangeness[5][0])) {
                    resetStage([player.strangeness[5][0]]);
                    stageCheck('soft');
                }
            } else if (upgrade === 5) {
                if (player.inflation.vacuum) { stageCheck('soft'); }
            } else if (upgrade === 6 || upgrade === 7) {
                player.ASR[5] = player.strangeness[5][7];
                if (player.strangeness[5][6] >= 2) { player.ASR[5]++; }
                calculateMaxLevel(0, 5, 'ASR');
            }
        }
        if (global.screenReader) { getId('SRMain').textContent = `You have increased strangeness of ${pointer.description[upgrade]} for ${global.stageInfo.word[stageIndex]} stage, level is now ${player.strangeness[stageIndex][upgrade]}${player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade] ? 'maxed' : ''}`; }
        calculateResearchCost(upgrade, stageIndex, type);
    }

    if (type === 'strangeness') {
        player.strange[0].current = currency as number;
    } else if (stageIndex === 1) {
        if (player.strangeness[1][9] < 1) {
            player.discharge.energy = Limit(currency).toNumber();
            if (player.toggles.auto[1]) { dischargeResetCheck('upgrade'); }
        }
    } else if (stageIndex === 2) {
        player.buildings[stageIndex][1].current = currency as overlimit;
    } else if (stageIndex === 3) {
        player.inflation.vacuum ?
            player.buildings[1][0].current = Limit(currency).divide([1.78266192, -33]).toArray() :
            player.buildings[3][0].current = currency as overlimit;
    } else /*if (stageIndex === 4 || stageIndex === 5)*/ {
        player.buildings[4][0].current = currency as overlimit;
    }

    visualUpdateUpgrades(upgrade, stageIndex, type);
    if (!auto) { getUpgradeDescription(upgrade, stageIndex, type); }
    if (!auto || stageIndex === player.stage.active || (type === 'elements' && player.stage.active === 5) || type === 'strangeness') { numbersUpdate(); }
    return true;
};

//Currently can't allow price to be more than 2**1024. Because missing sorting function for numbers that big
export const calculateResearchCost = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'strangeness') => {
    if (type === 'researches' || type === 'researchesExtra' || type === 'researchesAuto') {
        const pointer = type === 'researchesAuto' ? global.researchesAutoInfo : global[type + 'Info' as 'researchesInfo'][stageIndex];

        pointer.cost[research] = stageIndex === 1 ?
            pointer.startCost[research] + pointer.scaling[research] * (type === 'researchesAuto' ? player.researchesAuto[research] : player[type][stageIndex][research]) :
            pointer.startCost[research] * pointer.scaling[research] ** (type === 'researchesAuto' ? player.researchesAuto[research] : player[type][stageIndex][research]);

        if (pointer.cost[research] < 1) { //Remove all but 2 digits
            const digits = 10 ** (-Math.floor(Math.log10(pointer.cost[research])) + 2);
            pointer.cost[research] = Math.round(pointer.cost[research] * digits) / digits;
        } else {
            pointer.cost[research] = Math.round(pointer.cost[research] * 100) / 100;
        }
    } else if (type === 'ASR') { //Cost will be undefined if above max
        global.ASRInfo.cost[stageIndex] = global.ASRInfo.costRange[stageIndex][player.ASR[stageIndex]];
    } else if (type === 'strangeness') {
        global.strangenessInfo[stageIndex].cost[research] = player.inflation.vacuum ?
            Math.floor(Math.round((global.strangenessInfo[stageIndex].startCost[research] * global.strangenessInfo[stageIndex].scaling[research] ** player.strangeness[stageIndex][research]) * 100) / 100) :
            Math.floor(Math.round((global.strangenessInfo[stageIndex].startCost[research] + global.strangenessInfo[stageIndex].scaling[research] * player.strangeness[stageIndex][research]) * 100) / 100);
    }
};

export const calculateMaxLevel = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'strangeness') => {
    if (type === 'researchesAuto') {
        if (research === 0) {
            global.researchesAutoInfo.max[0] = player.strangeness[1][7] + 1;
            if (player.inflation.vacuum) { global.researchesAutoInfo.max[0]++; }
        } else if (research === 1) {
            global.researchesAutoInfo.max[1] = player.strangeness[2][6] + 1;
        } else if (research === 2) {
            global.researchesAutoInfo.max[2] = player.strangeness[3][6];
        }
    } else if (type === 'ASR') {
        if (stageIndex === 1) {
            global.ASRInfo.max[1] = player.inflation.vacuum ? 5 : 3;
        } else if (stageIndex === 2) {
            global.ASRInfo.max[2] = player.strangeness[2][9] >= 1 ? 6 : 5;
        } else if (stageIndex === 3) {
            global.ASRInfo.max[3] = player.strangeness[3][8] >= 1 ? 5 : 4;
        } else if (stageIndex === 4) {
            global.ASRInfo.max[4] = player.strangeness[4][10] >= 1 ? 5 : 4;
        } else if (stageIndex === 5) {
            global.ASRInfo.max[5] = player.strangeness[5][7];
            if (player.strangeness[5][6] >= 2) { global.ASRInfo.max[5]++; }
        }
    } else if (type === 'researches') {
        if (stageIndex === 2) {
            if (research === 4) {
                global.researchesInfo[2].max[4] = (player.inflation.vacuum ? 1 : 2) + Math.min(player.strangeness[2][2], 2);
            } else if (research === 5) {
                global.researchesInfo[2].max[5] = player.inflation.vacuum ? 1 : 2;
                if (player.strangeness[2][2] >= 2) { global.researchesInfo[2].max[5]++; }
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
                if (player.strangeness[3][2] >= 1) { global.researchesExtraInfo[3].max[0] += player.inflation.vacuum ? 11 : 10 * Math.min(player.strangeness[3][2], 2); }
            } else if (research === 1) {
                global.researchesExtraInfo[3].max[1] = 5;
                if (player.inflation.vacuum) {
                    if (player.strangeness[3][2] >= 2) { global.researchesExtraInfo[3].max[1] += 1; }
                } else {
                    if (player.strangeness[3][2] >= 1) { global.researchesExtraInfo[3].max[1] += 1 * Math.min(player.strangeness[3][2], 2); }
                }
            } else if (research === 3) {
                global.researchesExtraInfo[3].max[3] = player.inflation.vacuum ? 2 : 20;
            } else if (research === 4) {
                global.researchesExtraInfo[3].max[4] = 1;
                if (player.accretion.rank >= 4) { global.researchesExtraInfo[3].max[4] += Math.min(player.accretion.rank - 3, 2); }
            }
        }
    } else if (type === 'strangeness') {
        if (stageIndex === 1) {
            if (research === 3) {
                //global.strangenessInfo[1].max[3] = player.strangeness[1][9] >= 1 ? 2 : 1;
            } else if (research === 5) {
                global.strangenessInfo[1].max[5] = player.inflation.vacuum ? 5 : 10;
            } else if (research === 6) {
                global.strangenessInfo[1].max[6] = player.inflation.vacuum ? 5 : 3;
            } else if (research === 7) {
                global.strangenessInfo[1].max[7] = player.inflation.vacuum ? 1 : 2;
            }
        } else if (stageIndex === 2) {
            if (research === 0) {
                global.strangenessInfo[2].max[0] = player.inflation.vacuum ? 6 : 9;
            } else if (research === 4) {
                //global.strangenessInfo[2].max[4] = player.strangeness[1][9] >= 1 ? 2 : 1;
            } else if (research === 5) {
                global.strangenessInfo[2].max[5] = player.strangeness[2][9] >= 1 ? 6 : 5;
            } else if (research === 6) {
                global.strangenessInfo[2].max[6] = player.inflation.vacuum ? 7 : 4;
            }
        } else if (stageIndex === 3) {
            if (research === 4) {
                //global.strangenessInfo[3].max[4] = player.strangeness[1][9] >= 1 ? 2 : 1;
            } else if (research === 5) {
                global.strangenessInfo[3].max[5] = player.strangeness[3][8] >= 1 ? 5 : 4;
            }
        } else if (stageIndex === 4) {
            if (research === 5) {
                //global.strangenessInfo[4].max[5] = player.strangeness[1][9] >= 1 ? 3 : 1;
            } else if (research === 6) {
                global.strangenessInfo[4].max[6] = player.strangeness[4][10] >= 1 ? 5 : 4;
            }
        } else if (stageIndex === 5) {
            if (research === 0) {
                global.strangenessInfo[5].max[0] = player.inflation.vacuum ? 0 : 3;
            } else if (research === 6) {
                global.strangenessInfo[5].max[6] = player.inflation.vacuum ? 0 : 2;
            } else if (research === 8) {
                global.strangenessInfo[5].max[8] = player.inflation.vacuum ? 0 : 1;
            }
        }
    }

    calculateResearchCost(research, stageIndex, type);
    visualUpdateUpgrades(research, stageIndex, type);
    if (type === 'researches' || type === 'researchesExtra') { autoResearchesSet(type, [stageIndex, research]); }
};

export const autoUpgradesSet = (which: 'all' | number) => {
    if (!player.toggles.auto[5]) { return; }
    const { autoU: auto } = global.automatization;

    if (which === 'all') {
        for (const s of player.inflation.vacuum ? [1, 2, 3, 4, 5] : global.stageInfo.activeAll) {
            auto[s] = [];
            for (let i = 0; i < global.upgradesInfo[s].maxActive; i++) {
                if (player.upgrades[s][i] < 1) {
                    auto[s].push(i);
                }
            }

            const { startCost } = global.upgradesInfo[s];
            auto[s].sort((a, b) => startCost[a] - startCost[b]);
        }
    } else if (typeof which === 'number') {
        auto[which] = [];
        for (let i = 0; i < global.upgradesInfo[which].maxActive; i++) {
            if (player.upgrades[which][i] < 1) {
                auto[which].push(i);
            }
        }

        const { startCost } = global.upgradesInfo[which];
        auto[which].sort((a, b) => startCost[a] - startCost[b]);
    }
};

export const autoUpgradesBuy = (stageIndex: number) => {
    if (player.researchesAuto[2] < 1 || !player.toggles.auto[5]) { return; }
    const auto = global.automatization.autoU[stageIndex];

    for (let i = 0; i < auto.length; i++) {
        const index = auto[i];

        if (!checkUpgrade(index, stageIndex, 'upgrades')) { continue; }
        buyUpgrades(index, stageIndex, 'upgrades', true);

        if (player.upgrades[stageIndex][index] >= 1) {
            auto.splice(i, 1);
            i--;
        } else { break; }
    }
};

//All = reset all of current active stages; As number means reset that stage only; As array means add [1] into stage [0] if it's not already inside
export const autoResearchesSet = (type: 'researches' | 'researchesExtra', which: 'all' | number | number[]) => {
    if (type === 'researches') {
        if (!player.toggles.auto[6]) { return; }
    } else if (type === 'researchesExtra') {
        if (!player.toggles.auto[7]) { return; }
    }

    const { [type === 'researches' ? 'autoR' : 'autoE']: auto } = global.automatization;

    if (which === 'all') {
        for (const s of player.inflation.vacuum ? [1, 2, 3, 4, 5] : global.stageInfo.activeAll) {
            const pointer = global[type + 'Info' as 'researchesInfo'][s];

            auto[s] = [];
            for (let i = 0; i < pointer.maxActive; i++) {
                if (player[type][s][i] < pointer.max[i]) {
                    auto[s].push(i);
                }
            }
            auto[s].sort((a, b) => pointer.cost[a] - pointer.cost[b]);
        }
    } else if (typeof which === 'number') {
        const pointer = global[type + 'Info' as 'researchesInfo'][which];

        auto[which] = [];
        for (let i = 0; i < pointer.maxActive; i++) {
            if (player[type][which][i] < pointer.max[i]) {
                auto[which].push(i);
            }
        }
        auto[which].sort((a, b) => pointer.cost[a] - pointer.cost[b]);
    } else { //Will get sorted automatically
        if (!auto[which[0]].some((a) => a === which[1])) { auto[which[0]].unshift(which[1]); }
    }
};

export const autoResearchesBuy = (type: 'researches' | 'researchesExtra', stageIndex: number) => {
    if (type === 'researches') {
        if (player.researchesAuto[2] < 2 || !player.toggles.auto[6]) { return; }
    } else if (type === 'researchesExtra') {
        if (player.researchesAuto[2] < 3 || !player.toggles.auto[7]) { return; }
    }

    const auto = global.automatization[type === 'researches' ? 'autoR' : 'autoE'][stageIndex];
    const pointer = global[type + 'Info' as 'researchesInfo'][stageIndex];

    let sort = false;
    for (let i = 0; i < auto.length; i++) {
        if (!checkUpgrade(auto[i], stageIndex, type)) { continue; }
        const bought = buyUpgrades(auto[i], stageIndex, type, true);

        if (player[type][stageIndex][auto[i]] >= pointer.max[auto[i]]) {
            auto.splice(i, 1);
            i--;
        } else {
            if (!bought) {
                if (pointer.cost[auto[i]] > pointer.cost[auto[i + 1]]) {
                    sort = true;
                    continue;
                }
                break;
            } else { i--; }
        }
    }
    if (sort) { auto.sort((a, b) => pointer.cost[a] - pointer.cost[b]); }
};

export const autoElementsSet = () => {
    if (player.inflation.vacuum ? !player.toggles.auto[8] : player.buildings[5][3].true < 1) { return; }
    const { elements: auto } = global.automatization;
    const { elements } = player;

    if (player.inflation.vacuum) {
        for (let i = 1; i < global.elementsInfo.startCost.length; i++) {
            if (elements[i] === 0) { auto.push(i); }
        }
    } else {
        for (const add of player.collapse.show) {
            if (elements[add] === 0) { auto.push(add); }
        }
    }

    const { startCost } = global.elementsInfo;
    auto.sort((a, b) => startCost[a] - startCost[b]);
};

export const autoElementsBuy = () => {
    if (player.strangeness[4][4] < 1 || (player.inflation.vacuum ? !player.toggles.auto[8] : player.buildings[5][3].true < 1)) { return; }
    const { elements: auto } = global.automatization;
    const { elements } = player;

    for (let i = 0; i < auto.length; i++) {
        const index = auto[i];

        if (!checkUpgrade(index, 4, 'elements')) { break; }
        buyUpgrades(index, 4, 'elements', true);

        if (elements[index] === 1) {
            auto.splice(i, 1);
            i--;
        } else { break; }
    }
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
                if (player.researchesAuto[0] < 2) { return; }
                for (let i = 1; i < toggles.buildings[active].length; i++) {
                    toggles.buildings[active][i] = toggles.buildings[active][0];
                    toggleSwap(i, 'buildings');
                }
            } else {
                let anyOn = false;
                for (let i = 1; i < global.buildingsInfo.maxActive[active]; i++) {
                    if (Limit(player.buildings[active][i].highest).lessOrEqual([0, 0])) { continue; }
                    if (toggles.buildings[active][i]) {
                        anyOn = true;
                        break;
                    }
                }
                toggles.buildings[active][0] = anyOn;
                toggleSwap(0, 'buildings');
            }
        } else {
            toggles[type][number] = !toggles[type][number];
        }
    }
    const status = type === 'buildings' ? toggles.buildings[player.stage.active][number] : toggles[type][number];

    let extraText = '';
    if (type === 'buildings' && number === 0) {
        extraText = 'All ';
    } else if (type !== 'normal') {
        extraText = 'Auto ';
    }

    if (!status) {
        toggle.style.color = 'var(--red-text-color)';
        toggle.style.borderColor = 'crimson';
        toggle.textContent = extraText + 'OFF';
        if (global.screenReader) { toggle.ariaLabel = toggle.ariaLabel?.replace(' ON', ' OFF') ?? ''; }
    } else {
        toggle.style.color = '';
        toggle.style.borderColor = '';
        toggle.textContent = extraText + 'ON';
        if (global.screenReader) { toggle.ariaLabel = toggle.ariaLabel?.replace(' OFF', ' ON') ?? ''; }
    }
};

export const toggleBuy = (type = null as string | null) => {
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
            input.value = format(shop.input, { digits: 0, type: 'input' });
            break;
        case 'strict':
            shop.strict = !shop.strict;
            break;
        default:
            input.value = format(shop.input, { digits: 0, type: 'input' });
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
    let allowed = false;
    if (stageIndex === 5) {
        allowed = player.stage.current >= 5; //player.elements[26] === 1;
    } else if (stageIndex === 4) {
        return false;
    } else if (stageIndex === 3) {
        allowed = Limit(player.buildings[3][0].current).moreOrEqual([2.47, 31]);
    } else if (stageIndex === 2) {
        allowed = Limit(player.buildings[2][1].current).moreOrEqual([1.194, 29]);
    } else if (stageIndex === 1) {
        allowed = Limit(player.buildings[1][3].current).moreOrEqual([1.67, 21]);
    }

    if (auto && allowed) {
        if (player.strangeness[5][2] < 1 || (stageIndex >= 4 && global.strangeInfo.gain(stageIndex) < player.stage.input)) { return false; }
        stageReset(stageIndex);
    }
    return allowed;
};

export const stageAsyncReset = async() => {
    const { stage } = player;
    const active = player.inflation.vacuum ? 5 : (stage.active === 4 && stage.current === 5 && player.events[1] ? 5 : stage.active);

    if (!stageResetCheck(active)) {
        if (player.strange[0].total <= 0 && stage.current < 5 && player.inflation.vacuum) { return; }
        if (active === 5) {
            return Alert('"Iron" wasn\'t obtained yet');
        } else if (active === 4) {
            return Alert('Reach Intergalactic first');
        } else if (active === 3) {
            return Alert(`Self sustaining is not yet possible, obtain at least ${format(2.47e31)} Mass`);
        } else if (active === 2) {
            return Alert(`Look's like more Mass expected, need even more Drops, around ${Limit([1.194, 29]).minus(player.buildings[2][1].current).format()}`);
        } else if (active === 1) {
            return Alert(`You will need enough to form a single Drop of water for next one - ${format(1.67e21)} Molecules`);
        }
    } else {
        let ok = true;
        if (player.toggles.normal[1]) {
            ok = active >= 5 ? await Confirm(`You will return to first stage. ${player.strange[0].total === 0 ? 'But maybe you will get something in return' : `In return you will get ${format(global.strangeInfo.gain(active))} Strange quarks`}. Ready?`) :
                active === stage.current ? await Confirm('Ready to enter next stage? Next one will be harder than current') : await Confirm(`You will reset this stage. In return you will get ${format(global.strangeInfo.gain(active))} Strange quarks. Ready?`);
        }
        if (ok) { stageReset(active); }
    }
};

const stageReset = (stageIndex: number) => {
    const { stage, researchesAuto } = player;

    stage.resets++;
    const resetThese = [];
    const increased = player.inflation.vacuum || stageIndex === stage.current;
    if (increased) {
        if (player.inflation.vacuum) {
            stage.current = 1;
            resetThese.push(1, 2, 3, 4, 5);
        } else {
            stage.current = stage.current < 5 ? stage.current + 1 : 1 + player.strangeness[5][0];
            resetThese.push(stage.current);
            if (player.milestones[5][0] >= 4) { resetThese.push(5); }

            if (stageIndex === 5) {
                if (player.strangeness[1][7] < 1) {
                    researchesAuto[0] = 0;
                    calculateMaxLevel(0, 1, 'researchesAuto');
                }
                if (player.strangeness[2][6] < 1) {
                    researchesAuto[1] = 0;
                    calculateMaxLevel(1, 2, 'researchesAuto');
                }
            } else if (stageIndex === 2) {
                if (researchesAuto[1] === 0) {
                    researchesAuto[1] = 1;
                    calculateMaxLevel(1, 2, 'researchesAuto');
                }
            } else if (stageIndex === 1) {
                if (researchesAuto[0] === 0) {
                    researchesAuto[0] = 1;
                    calculateMaxLevel(0, 1, 'researchesAuto');
                }
            }
            stage.true = Math.max(stage.true, stage.current);
            player.events[0] = stage.true > stage.current;
        }
        stage.active = stage.current;
    } else { resetThese.push(stageIndex); }

    if (stage.true >= 5) {
        const gain = global.strangeInfo.gain(stageIndex);
        player.strange[0].current += gain;
        player.strange[0].total += gain;
        if (gain > stage.best) { stage.best = gain; }

        if (stageIndex >= 4) {
            const history = global.historyStorage.stage;
            const sizeLimit = player.history.stage.input[1];
            const bestReset = player.history.stage.best;
            history.unshift([gain, player.stage.time]);
            if (history.length > sizeLimit) { history.length = sizeLimit; }
            if (gain / player.stage.time > bestReset[0] / bestReset[1]) { player.history.stage.best = [gain, player.stage.time]; }
        }
    }

    resetStage(resetThese);
    if (resetThese.includes(stage.active)) { stageCheck(increased ? '' as 'soft' : 'soft'); }
};

const stageNoReset = () => {
    const { stage } = player;

    stage.current++;
    if (!player.inflation.vacuum) {
        stage.true = Math.max(stage.current, stage.true);
        if (!global.stageInfo.activeAll.includes(stage.current)) { resetStage([stage.current]); }
    }
    stageCheck('soft');
};

export const switchStage = (stage: number) => {
    if (player.stage.active === stage) {
        getId('stageSelect').classList.remove('active');
        return;
    }
    if (!global.stageInfo.activeAll.includes(stage)) { return; }

    player.stage.active = stage;
    stageCheck();

    if (!player.events[1] && player.stage.active === 5) { playEvent(4, 1); }
};

export const assignDischargeInformation = () => {
    let next = Math.round((10 - player.researches[1][3] - player.strangeness[1][1]) ** player.discharge.current);
    if (player.inflation.vacuum && global.strangeInfo.stageBoost[1] !== null) { next = Math.ceil(next / global.strangeInfo.stageBoost[1]); }
    global.dischargeInfo.next = next;
};

export const dischargeResetCheck = (auto = false as false | 'interval' | 'upgrade'): boolean => {
    if (player.upgrades[1][5] < 1 || player.buildings[1][1].true <= 0) { return false; }
    assignDischargeInformation();

    if (auto !== false) {
        if (player.strangeness[1][3] < 1 || (auto === 'interval' && player.discharge.energy < global.dischargeInfo.next)) { return false; }
        dischargeReset();
    }
    return true;
};

export const dischargeAsyncReset = async() => {
    if (!dischargeResetCheck()) { return; }

    let ok = true;
    if (player.toggles.normal[2]) {
        ok = player.discharge.energy >= global.dischargeInfo.next ? await Confirm('You have enough Energy to gain boost. Continue?') :
            await Confirm('This will reset all of your current Structures and Energy. You will NOT gain production boost. Continue?');
    } else if (player.stage.active !== 1) {
        ok = await Confirm(`You are trying to Discarge while inside '${global.stageInfo.word[player.stage.active]}'.\n${player.discharge.energy < global.dischargeInfo.next ? "You haven't reached next goal" : 'You will gain boost'}, continue?`);
    }
    if (ok) {
        if (global.screenReader) { getId('SRMain').textContent = player.discharge.energy >= global.dischargeInfo.next ? 'Structures and Energy were reset for some boost' : 'Structures and Energy were reset, no boost'; }
        assignDischargeInformation(); //Just in case
        dischargeReset();
    }
};

const dischargeReset = () => {
    if (player.discharge.energy >= global.dischargeInfo.next) {
        player.discharge.current++;
    }
    milestoneCheck(0, 1);
    reset('discharge', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [1]);
};

export const assignVaporizationInformation = () => {
    let get = Limit(player.buildings[2][1][player.researchesExtra[2][0] >= 1 ? 'total' : 'current']).divide(global.vaporizationInfo.effect2U1()).toArray();
    if (Limit(get).moreThan([1, 0])) {
        const base = player.inflation.vacuum ? 0.4 : 0.6;
        const check = Limit(get).power(base).plus(player.vaporization.clouds).moreThan([1, 4]);
        const calculate = check ? Limit([1, 4]).minus(player.vaporization.clouds).max([0, 0]).toArray() : [0, 0] as overlimit;
        get = Limit(get).minus(calculate).power(check ? (player.inflation.vacuum ? 0.2 : 0.36) : base).plus(calculate).toArray();
    }
    global.vaporizationInfo.get = get;
};

export const vaporizationResetCheck = (auto = false): boolean => {
    assignVaporizationInformation();
    if (player.upgrades[2][1] < 1 || Limit(global.vaporizationInfo.get).lessThan([1, 0])) { return false; }

    if (auto) {
        if (player.strangeness[2][4] < 1 || Limit(player.vaporization.clouds).multiply(player.vaporization.input).moreOrEqual(global.vaporizationInfo.get)) { return false; }
        vaporizationReset();
    }
    return true;
};

export const vaporizationAsyncReset = async() => {
    if (!vaporizationResetCheck()) { return; }

    let ok = true;
    if (player.toggles.normal[3]) {
        ok = await Confirm(`Do you wish to reset structures and upgrades for ${Limit(global.vaporizationInfo.get).format()} Clouds?`);
    } else if (player.stage.active !== 2) {
        ok = await Confirm(`You are trying to cause Vaporization while inside '${global.stageInfo.word[player.stage.active]}'.\nYou will get ${Limit(global.vaporizationInfo.get).format()} Clouds, continue?`);
    }
    if (ok) {
        assignVaporizationInformation(); //Just in case
        if (global.screenReader) { getId('SRMain').textContent = `Progress were reset for ${Limit(global.vaporizationInfo.get).format()} Clouds`; }
        vaporizationReset();
    }
};

const vaporizationReset = () => {
    const { vaporization } = player;

    vaporization.clouds = Limit(vaporization.clouds).plus(global.vaporizationInfo.get).toArray();
    if (Limit(vaporization.cloudsMax).lessThan(vaporization.clouds)) { vaporization.cloudsMax = cloneArray(vaporization.clouds); }
    milestoneCheck(0, 2);
    reset('vaporization', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [2]);
};

export const rankResetCheck = (auto = false): boolean => {
    const requirement = global.accretionInfo.rankCost[player.accretion.rank];
    if (requirement === 0 ||
        (!player.inflation.vacuum ? Limit(player.buildings[3][0].current).lessThan(requirement) :
        Limit(player.buildings[1][0].current).multiply([1.78266192, -33]).lessThan(requirement))
    ) { return false; }

    if (auto) {
        if (player.strangeness[3][4] < 1) { return false; }
        rankReset();
    }
    return true;
};

export const rankAsyncReset = async() => {
    if (!rankResetCheck()) { return; }

    let ok = true;
    if (player.toggles.normal[4] && player.accretion.rank !== 0) {
        ok = await Confirm('Increasing Rank will reset structures, upgrades, stage researches. But you will get closer to your goal');
    } else if (player.stage.active !== 3) {
        ok = await Confirm(`You are trying increase Rank while inside '${global.stageInfo.word[player.stage.active]}'. Continue?`);
    }
    if (ok) {
        rankReset();
        if (global.screenReader) { getId('SRMain').textContent = `Rank is now ${global.accretionInfo.rankName[player.accretion.rank]}`; }
    }
};

const rankReset = () => {
    player.accretion.rank++;
    if (player.accretion.rank === 6) {
        player.stage.current++;
        stageCheck('soft');
    }
    reset('rank', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [3]);
    calculateMaxLevel(0, 3, 'researchesExtra');
    calculateMaxLevel(4, 3, 'researchesExtra');
    updateRankInfo();
};

export const assignNewMassCap = (value: number) => {
    const min = 600 / 2 ** player.strangeness[3][9];
    if (!isFinite(value) || value > 600) {
        value = 600;
    } else if (value < min) { value = min; }

    global.inflationInfo.massCap = value;
};

export const assignCollapseInformation = () => {
    const building = player.buildings[4];

    if (!player.inflation.vacuum) {
        const { elements } = player;

        let massGain = 0.004;
        if (elements[3] === 1) { massGain += 0.001; }
        if (elements[5] === 1) { massGain += 0.00015 * building[1].true; }
        if (elements[10] === 1) { massGain *= 2; }
        if (elements[14] === 1) { massGain *= 1.4; }
        global.collapseInfo.newMass = (building[1].true + (elements[15] === 1 ? building[2].true + building[3].true + building[4].true : 0)) * massGain * global.collapseInfo.starEffect[2]();
    } else { global.collapseInfo.newMass = Limit(global.buildingsInfo.producing[1][1]).multiply(global.inflationInfo.massCap).min(player.buildings[1][0].current).multiply([8.96499278339628, -67]).toNumber(); } //1.78266192e-33 / 1.98847e33

    const { starCheck } = global.collapseInfo;
    const { stars } = player.collapse;
    const nova = player.researchesExtra[4][0];
    starCheck[0] = nova >= 1 ? Math.max(building[2].true + Math.floor(building[1].true * player.strangeness[4][3] / 4) - stars[0], 0) : 0;
    starCheck[1] = nova >= 2 ? Math.max(building[3].true - stars[1], 0) : 0;
    starCheck[2] = nova >= 3 ? Math.max(building[4].true - stars[2], 0) : 0;
};

export const collapseResetCheck = (auto = false): boolean => {
    if (player.upgrades[4][0] < 1) { return false; }
    const { collapseInfo } = global;
    const { collapse } = player;
    assignCollapseInformation();

    if (auto) {
        const { starEffect } = global.collapseInfo;
        const starBoost = (starEffect[0](true) / starEffect[0]()) * (starEffect[1](true) / starEffect[1]()) * (starEffect[2](true) / starEffect[2]()) >= collapse.inputS;
        if ((collapseInfo.newMass < collapse.mass * collapse.inputM && !starBoost) || player.strangeness[4][5] < 1) { return false; }
        collapseReset();
        return true;
    }

    return collapseInfo.newMass > collapse.mass || collapseInfo.starCheck[0] > 0 || collapseInfo.starCheck[1] > 0 || collapseInfo.starCheck[2] > 0;
};

export const collapseAsyncReset = async() => {
    if (!collapseResetCheck()) { return; }
    const { collapse } = player;
    const nova = player.researchesExtra[4][0];

    let ok = true;
    if (player.toggles.normal[5] || player.stage.active !== 4) {
        const { collapseInfo } = global;

        let message = player.stage.active === 4 ?
            `This will reset all non automization researches and upgrades. ${collapseInfo.newMass < collapse.mass ? "Your total Mass won't change" : `But your total Mass will be now ${format(collapseInfo.newMass)}`}` :
            `You are trying to Collapse Stars while inside '${global.stageInfo.word[player.stage.active]}'.\nSolar mass will increase by +${format(collapseInfo.newMass - collapse.mass)}`;
        starMessage:
        if (nova >= 1) {
            message += `, also you will get ${format(collapseInfo.starCheck[0])} Red giants`;
            if (nova < 2) { break starMessage; }
            message += `, ${format(collapseInfo.starCheck[1])} Neutron stars`;
            if (nova < 3) { break starMessage; }
            message += ` and ${format(collapseInfo.starCheck[2])} Black holes`;
        }
        if (player.stage.active !== 4) { message += '.\nContinue?'; }
        ok = await Confirm(message);
    }
    if (ok) {
        assignCollapseInformation(); //Just in case
        collapseReset();
        if (global.screenReader) {
            let message = `Your Mass has increased to ${format(collapse.mass)}`;
            starMessage:
            if (nova >= 1) {
                message += `, Red giants to ${format(collapse.stars[0])}`;
                if (nova < 2) { break starMessage; }
                message += `, Neutron stars - ${format(collapse.stars[1])}`;
                if (nova < 3) { break starMessage; }
                message += ` and Black holes - ${format(collapse.stars[2])}`;
            }
            getId('SRMain').textContent = message;
        }
    }
};

const collapseReset = () => {
    const { collapseInfo } = global;
    const { collapse } = player;
    const resetThese = player.inflation.vacuum ?
        ([1, 2, 3, 4, 5]) :
        (player.strangeness[5][5] < 1 ? [4, 5] : [4]);

    if (collapseInfo.newMass > collapse.mass) { collapse.mass = collapseInfo.newMass; }
    collapse.stars[0] += collapseInfo.starCheck[0];
    collapse.stars[1] += collapseInfo.starCheck[1];
    collapse.stars[2] += collapseInfo.starCheck[2];
    if (collapse.massMax < collapse.mass) { collapse.massMax = collapse.mass; }
    milestoneCheck(0, 4);
    milestoneCheck(1, 4);
    reset('collapse', resetThese);
    calculateMaxLevel(0, 4, 'researches');
    calculateMaxLevel(1, 4, 'researches');
    calculateMaxLevel(2, 4, 'researches');
};
