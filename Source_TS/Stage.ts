import { checkBuilding, checkUpgrade, milestoneCheck } from './Check';
import Limit from './Limit';
import { getId } from './Main';
import { cloneArray, global, logAny, player } from './Player';
import { reset, resetStage } from './Reset';
import { Alert, Confirm, Notify, playEvent } from './Special';
import { overlimit } from './Types';
import { format, getChallengeDescription, getStrangenessDescription, numbersUpdate, stageUpdate, switchTab, updateRankInfo, visualUpdateResearches, visualUpdateUpgrades } from './Update';

export const assignBuildingInformation = () => { //Sets buildingInfo.producing for all active buildings, also most of effects
    const { upgradesInfo, researchesInfo, researchesExtraInfo, dischargeInfo, vaporizationInfo, milestonesInfo } = global;
    const { buildings, upgrades, researches, researchesExtra, strangeness, discharge } = player;
    const producing = global.buildingsInfo.producing;
    const stageBoost = global.strangeInfo.stageBoost;
    const activeAll = global.stageInfo.activeAll;
    const vacuum = player.inflation.vacuum;
    const inVoid = player.challenges.active === 0;
    const energyMin = Math.max(discharge.energy, 1);

    if (activeAll.includes(1)) {
        const b3 = vacuum ? 3 : 1;
        const b4 = vacuum ? 4 : 2;
        const b5 = vacuum ? 5 : 3;

        dischargeInfo.bonus = strangeness[1][2] / 2;
        if (stageBoost[1] !== null) { dischargeInfo.bonus += stageBoost[1]; }
        const dischargeBase = 4 + researches[1][4] + strangeness[1][0];
        upgradesInfo[1].effect[5] = inVoid ? (dischargeBase - 1) / 2 + 1 : dischargeBase;
        upgradesInfo[1].effect[7] = (102 + researches[1][1]) / 100;
        researchesExtraInfo[1].effect[4] = 1 + upgradesInfo[1].effect[5] / 100;
        let totalMultiplier = (upgradesInfo[1].effect[5] ** (discharge.current + dischargeInfo.bonus)) * (1.2 ** strangeness[1][9]);
        if (vacuum) { totalMultiplier *= milestonesInfo[1].reward[0]; }

        const listForMult5 = [buildings[1][b5].current];
        let prod5Number = 0.2 * totalMultiplier;
        if (vacuum && upgrades[1][4] === 1) { prod5Number *= 5; }
        if (upgrades[1][7] === 1) { listForMult5.push(Limit(upgradesInfo[1].effect[7]).power(buildings[1][b5].true).toArray()); }
        producing[1][b5] = Limit(prod5Number).multiply(...listForMult5).toArray();

        upgradesInfo[1].effect[9] = energyMin > 4e4 ? (energyMin / 4e4) ** 0.4 * 4e4 : energyMin;
        researchesInfo[1].effect[2] = 20 + strangeness[1][5];
        researchesInfo[1].effect[5] = (discharge.current + dischargeInfo.bonus) ** (1.25 + researches[1][5] / 4);
        researchesExtraInfo[1].effect[1] = researchesExtra[1][1] >= 4 ? 1.1 : researchesExtra[1][1] >= 3 ? 1.2 : (20 - 3 * researchesExtra[1][1]) / 10;
        if (Limit(producing[1][b5]).moreThan('1')) {
            let radiation = researchesInfo[1].effect[2] ** researches[1][2];
            if (upgrades[1][9] === 1) { radiation *= upgradesInfo[1].effect[9]; }
            if (researches[1][5] >= 1) { radiation *= researchesInfo[1].effect[5]; }
            upgradesInfo[1].effect[8] = Limit(producing[1][b5]).log(researchesExtraInfo[1].effect[1]).multiply(radiation).toArray();
        } else { upgradesInfo[1].effect[8] = [0, 0]; }

        const listForMult4 = [buildings[1][b4].current];
        let prod4Number = (vacuum ? 0.2 : 0.6) * totalMultiplier;
        if (vacuum) {
            if (upgrades[1][3] === 1) { prod4Number *= 5; }
        } else if (upgrades[1][4] === 1) { prod4Number *= 5; }
        if (upgrades[1][7] === 1) { listForMult4.push(Limit(upgradesInfo[1].effect[7]).power(buildings[1][b4].true).toArray()); }
        producing[1][b4] = Limit(prod4Number).multiply(...listForMult4).toArray();

        const listForMult3 = [buildings[1][b3].current];
        let prod3Number = (vacuum ? 0.2 : 0.4) * totalMultiplier;
        if (upgrades[1][0] === 1) { prod3Number *= 5; }
        if (!vacuum && upgrades[1][3] === 1) { prod3Number *= 5; }
        if (upgrades[1][7] === 1) { listForMult3.push(Limit(upgradesInfo[1].effect[7]).power(buildings[1][b3].true).toArray()); }
        producing[1][b3] = Limit(prod3Number).multiply(...listForMult3).toArray();

        if (vacuum) {
            const listForMult2 = [buildings[1][2].current];
            if (upgrades[1][7] === 1) { listForMult2.push(Limit(upgradesInfo[1].effect[7]).power(buildings[1][2].true).toArray()); }
            producing[1][2] = Limit(0.2 * totalMultiplier).multiply(...listForMult2).toArray();

            const listForMult1 = [buildings[1][1].current];
            if (upgrades[1][7] === 1) { listForMult1.push(Limit(upgradesInfo[1].effect[7]).power(buildings[1][1].true).toArray()); }
            producing[1][1] = Limit(0.001 * totalMultiplier).multiply(...listForMult1).toArray();
            if (Limit(producing[1][1]).moreThan('1')) { producing[1][1] = Limit(producing[1][1]).power(0.15).toArray(); }
        }
    }
    if (activeAll.includes(2)) {
        let current5 = buildings[2][5].true;
        let current4 = buildings[2][4].true;
        let current3 = buildings[2][3].true;
        let current2 = buildings[2][2].true;
        if (upgrades[2][8] === 1) { current5 += buildings[2][6].true; }
        if (upgrades[2][7] === 1) { current4 += current5; }
        upgradesInfo[2].effect[6] = 1 + researches[2][5];
        if (upgrades[2][6] === 1) { current3 += current4 * upgradesInfo[2].effect[6]; }
        upgradesInfo[2].effect[5] = 1 + researches[2][4];
        if (upgrades[2][5] === 1) { current2 += current3 * upgradesInfo[2].effect[5]; }
        buildings[2][5].current = Limit(current5).toArray();
        buildings[2][4].current = Limit(current4).toArray();
        buildings[2][3].current = Limit(current3).toArray();
        buildings[2][2].current = Limit(current2).toArray();

        producing[2][6] = Limit(Math.max(2 * buildings[2][6].true, 1)).toArray();

        const listForMult5 = [producing[2][6]];
        researchesExtraInfo[2].effect[1] = Limit(player.vaporization.clouds).power(researchesExtra[2][2] >= 1 ? 0.11 : 0.1).toNumber();
        researchesExtraInfo[2].effect[2] = (researchesExtraInfo[2].effect[1] - 1) / 16 + 1;
        let prod5Number = 2 * current5;
        if (researchesExtra[2][2] >= 1) { prod5Number *= researchesExtraInfo[2].effect[2]; }
        producing[2][5] = Limit(prod5Number).multiply(...listForMult5).max('1').toArray();

        producing[2][4] = Limit(2 * current4).multiply(producing[2][5]).max('1').toArray();

        producing[2][3] = Limit(2 * current3).multiply(producing[2][4]).max('1').toArray();

        const listForMult2 = [producing[2][3], vaporizationInfo.cloudEffect()];
        upgradesInfo[2].effect[3] = (1 + researches[2][2] / 2) / 100;
        upgradesInfo[2].effect[4] = (1 + researches[2][3] / 2) / 100;
        vaporizationInfo.tension = upgrades[2][3] === 1 ? Limit(buildings[2][0].current).max('1').power(upgradesInfo[2].effect[3]).toNumber() : 1;
        vaporizationInfo.stress = upgrades[2][4] === 1 ? Limit(buildings[2][1].current).max('1').power(upgradesInfo[2].effect[4]).toNumber() : 1;
        let prod2Number = (inVoid ? 0.02 : 2) * current2 * vaporizationInfo.tension * vaporizationInfo.stress * (1.5 ** strangeness[2][1]);
        if (upgrades[2][1] === 1) {
            if (inVoid) {
                listForMult2.push(Limit('1.01').power((current2 - buildings[2][2].true) ** 0.7 + buildings[2][2].true).toArray());
            } else {
                listForMult2.push(Limit('1.02').power((current2 - buildings[2][2].true) ** 0.7 + Math.min(buildings[2][2].true, 200)).toArray());
                if (buildings[2][2].true > 200) { listForMult2.push(Limit('1.01').power(buildings[2][2].true - 200).toArray()); }
            }
        }
        if (researches[2][1] >= 1) {
            if (researchesInfo[2].effect[1] !== researches[2][1]) {
                const scaling = researchesInfo[2].scaling[1];
                researchesInfo[2].effect[1] = Math.min(researches[2][1], Math.max(Math.floor(Limit(buildings[2][1].total).multiply(scaling - 1).divide(researchesInfo[2].startCost[1]).plus('1').log(scaling).toNumber()), 0));
            }
            prod2Number *= 2 ** researchesInfo[2].effect[1];
        }
        if (researchesExtra[2][1] >= 1) { prod2Number *= researchesExtraInfo[2].effect[1]; }
        if (vacuum) { prod2Number *= milestonesInfo[2].reward[1]; }
        if (stageBoost[2] !== null) { prod2Number *= stageBoost[2]; }
        producing[2][2] = Limit(prod2Number).multiply(...listForMult2).toArray();

        const listForMult1 = [];
        if (inVoid) {
            listForMult1.push(Limit(buildings[2][1].current).moreThan('1') ? Limit(buildings[2][1].current).power(0.1).toArray() : buildings[2][1].current);
        } else if (vacuum) {
            const excess = Limit(buildings[2][1].current).minus(buildings[2][1].true).toArray();
            listForMult1.push(Limit(excess).moreThan('1') ? Limit(excess).power(0.2).plus(buildings[2][1].true).toArray() : buildings[2][1].current);
        } else { listForMult1.push(buildings[2][1].current); }
        if (upgrades[2][0] === 1) { listForMult1.push(Limit('1.04').power(buildings[2][1].true).toArray()); }
        let prod1Number = (vacuum ? 1 : 2e-4) * (1.5 ** strangeness[2][0]);
        if (researches[2][0] >= 1) {
            if (researchesInfo[2].effect[0] !== researches[2][0]) { researchesInfo[2].effect[0] = Math.min(researches[2][0], Math.max(Math.floor(Limit(buildings[2][1].total).divide(researchesInfo[2].startCost[0]).log(researchesInfo[2].scaling[0]).toNumber() + 1), 0)); }
            prod1Number *= 3 ** researchesInfo[2].effect[0];
        }
        producing[2][1] = Limit(prod1Number).multiply(...listForMult1).toArray();
        if (vacuum) {
            producing[2][1] = Limit(producing[2][1]).plus('1').toArray();
            upgradesInfo[1].effect[8] = Limit(upgradesInfo[1].effect[8] as overlimit).multiply(producing[2][1]).toArray();
        }
    }
    if (activeAll.includes(3)) {
        global.accretionInfo.effective = (inVoid ? 1 : player.accretion.rank) + (strangeness[3][10] / 1.25);
        if (vacuum && stageBoost[3] !== null) {
            global.accretionInfo.effective += stageBoost[3];
        }

        producing[3][5] = Limit('1.1').power(buildings[3][5].true).toArray();

        producing[3][4] = Limit((upgrades[3][12] === 1 ? '1.14' : '1.1')).power(buildings[3][4].true).multiply(producing[3][5]).toArray();
        const satellitesBoost: overlimit = strangeness[3][3] < 1 ? [1, 0] : vacuum ? Limit(producing[3][4]).power(0.2).toArray() : producing[3][4];

        const listForMult3 = [buildings[3][3].current, producing[3][4]];
        let prod3Number = 0.2 * (1.5 ** strangeness[3][1]);
        if (researchesExtra[3][2] >= 1) { prod3Number *= 2; }
        if (upgrades[3][8] === 1) { listForMult3.push(Limit('1.02').power(buildings[3][3].true).toArray()); }
        producing[3][3] = Limit(prod3Number).multiply(...listForMult3).toArray();

        const listForMult2 = [buildings[3][2].current, satellitesBoost];
        upgradesInfo[3].effect[3] = (102 + researches[3][4] / 2) / 100;
        researchesInfo[3].effect[6] = Limit(buildings[3][0].current).power(researches[3][6] / 40).toArray();
        let prod2Number = (3 ** researches[3][2]) * (1.5 ** strangeness[3][1]);
        if (upgrades[3][3] === 1) { listForMult2.push(Limit(upgradesInfo[3].effect[3]).power(buildings[3][2].true).toArray()); }
        if (upgrades[3][4] === 1) { prod2Number *= 3; }
        if (researches[3][6] >= 1) { listForMult2.push(researchesInfo[3].effect[6]); }
        producing[3][2] = Limit(prod2Number).multiply(...listForMult2).toArray();

        const listForMult1 = [buildings[3][1].current, satellitesBoost];
        upgradesInfo[3].effect[0] = (101 + researches[3][1]) / 100;
        upgradesInfo[3].effect[1] = Limit(buildings[3][1].current).power((5 + researchesExtra[3][3]) / 100).toNumber();
        upgradesInfo[3].effect[7] = 2 * 1.5 ** researches[3][7];
        upgradesInfo[3].effect[10] = 8 * 2 ** researches[3][8];
        researchesExtraInfo[3].effect[0] = 1.1 ** researchesExtra[3][0];
        researchesExtraInfo[3].effect[1] = (1 + 0.1 * researchesExtra[3][1]) ** global.accretionInfo.effective;
        let prod1Number = (vacuum ? 1 : 8e-20) * (3 ** researches[3][0]) * (2 ** researches[3][3]) * (3 ** researches[3][5]) * researchesExtraInfo[3].effect[0] * (1.5 ** strangeness[3][0]);
        if (vacuum) { prod1Number *= milestonesInfo[3].reward[0]; }
        if (upgrades[3][0] === 1) { listForMult1.push(Limit(upgradesInfo[3].effect[0]).power(buildings[3][1].true).toArray()); }
        if (upgrades[3][1] === 1) { prod1Number *= upgradesInfo[3].effect[1]; }
        if (upgrades[3][2] === 1) { prod1Number *= 2; }
        if (upgrades[3][5] === 1) { prod1Number *= 3; }
        if (upgrades[3][7] === 1) { prod1Number *= upgradesInfo[3].effect[7]; }
        if (upgrades[3][9] === 1) { prod1Number *= 2; }
        if (upgrades[3][10] === 1) { prod1Number *= upgradesInfo[3].effect[10]; }
        if (researchesExtra[3][1] >= 1) { prod1Number *= researchesExtraInfo[3].effect[1]; }
        producing[3][1] = Limit(prod1Number).multiply(...listForMult1).toArray();
        if (vacuum) {
            producing[3][1] = Limit(producing[3][1]).plus('1').toArray();
            if (inVoid) {
                producing[3][1] = Limit(producing[3][1]).power(player.accretion.rank >= 5 ? 0.84 : 0.92).toArray();
            } else if (player.accretion.rank >= 5) { producing[3][1] = Limit(producing[3][1]).power(0.92).toArray(); }

            researchesExtraInfo[3].effect[4] = (researchesExtraInfo[3].effect[1] - 1) / 8 * researchesExtra[3][4] + 1;
            if (researchesExtra[3][4] >= 1) { producing[2][1] = Limit(producing[2][1]).multiply(researchesExtraInfo[3].effect[4]).toArray(); }
            if (researchesExtra[3][4] >= 3) { producing[2][2] = Limit(producing[2][2]).multiply(researchesExtraInfo[3].effect[4]).toArray(); }
        } else if (player.accretion.rank >= 5) {
            producing[3][1] = Limit(producing[3][1]).power(Limit(producing[3][1]).lessThan('1') ? 1.1 : 0.9).toArray();
        }
    }
    if (activeAll.includes(4)) {
        const { elements } = player;
        const { starEffect } = global.collapseInfo;
        const elementsEffects = global.elementsInfo.effect;

        let systemBase = inVoid ? 0.004 : 0.005;
        if (researchesExtra[4][1] >= 1) { systemBase += 0.001; }
        let effectiveLevel = researches[4][1] === 0 ? 0 : 1 + Math.min(researches[4][1], 4);
        if (researches[4][1] > 4) { effectiveLevel += 0.5; }
        if (researches[4][1] > 5) { effectiveLevel += researches[4][1] / 4 - 1.25; }
        researchesInfo[4].effect[1] = Limit(1 + systemBase * effectiveLevel).power(global.collapseInfo.trueStars).toArray();
        const listForTotal = [researchesInfo[4].effect[1]];
        let planetBase = 1.3 + 0.15 * researches[4][2];
        if (vacuum) { planetBase += milestonesInfo[3].reward[1]; }
        researchesInfo[4].effect[0] = planetBase ** researches[4][0];
        researchesInfo[4].effect[4] = logAny(player.collapse.stars[2] + 3, researches[4][4] >= 2 ? 2 : 3);
        if (elements[23] === 1) { researchesInfo[4].effect[4] *= player.collapse.mass ** 0.1; }
        elementsEffects[12] = 10 - strangeness[4][11];
        elementsEffects[24] = vacuum || player.milestones[1][1] >= 6 ? 0.02 : 0.01;
        elementsEffects[28] = researchesExtra[4][2] >= 1 ? 3 : 2;
        let totalNumber = researchesInfo[4].effect[0] * global.collapseInfo.massEffect() * starEffect[1]() * (1.25 ** researches[4][3]) * (1.5 ** strangeness[4][0]);
        if (researches[4][4] >= 1) { totalNumber *= researchesInfo[4].effect[4]; }
        if (elements[4] === 1) { totalNumber *= 1.2; }
        if (elements[14] === 1) { totalNumber *= 1.4; }
        if (elements[19] === 1) { totalNumber *= 2; }
        if (elements[24] === 1) { totalNumber *= Limit(buildings[4][0].current).max('1').power(elementsEffects[24]).toNumber(); }
        if (elements[28] === 1) { totalNumber *= elementsEffects[28]; }
        if (vacuum) {
            if (researchesExtra[1][4] >= 1) { totalNumber *= (researchesExtraInfo[1].effect[4] as number) ** (discharge.current + dischargeInfo.bonus); }
            if (researchesExtra[2][3] >= 1) { totalNumber *= vaporizationInfo.tension; }
            if (researchesExtra[2][3] >= 2) { totalNumber *= vaporizationInfo.stress; }
            totalNumber *= milestonesInfo[4].reward[0];
        }
        if (stageBoost[4] !== null) { totalNumber *= stageBoost[4]; }
        const totalMultiplier = Limit(totalNumber).multiply(...listForTotal).toArray();

        producing[4][5] = Limit('1e11').multiply(buildings[4][5].current, totalMultiplier).toArray();

        producing[4][4] = Limit('2e9').multiply(buildings[4][4].current, totalMultiplier).toArray();

        producing[4][3] = Limit('3e7').multiply(buildings[4][3].current, totalMultiplier).toArray();

        elementsEffects[6] = researchesExtra[4][2] >= 1 ? 2 : 1.5;
        const prod2Number = 400 * starEffect[0]() * (4 ** researches[4][3]);
        producing[4][2] = Limit(prod2Number).multiply(buildings[4][2].current, totalMultiplier).toArray();

        let prod1Number = 50;
        if (elements[1] === 1) { prod1Number *= 2; }
        producing[4][1] = Limit(prod1Number).multiply(buildings[4][1].current, totalMultiplier).toArray();
    }
    if (activeAll.includes(5)) {
        let prod3Number = vacuum ? 2 : 10;
        if (vacuum) {
            if (upgrades[5][2] === 1) { prod3Number += 1; }
            prod3Number += milestonesInfo[5].reward[1];
        }
        producing[5][3] = Limit(prod3Number).power(buildings[5][3].true).toArray();

        const listForMult2 = [buildings[5][2].current, producing[5][3]];
        let prod2Number = 1.5 * (3 ** researches[5][1]);
        upgradesInfo[5].effect[1] = 6 * (3 ** strangeness[5][4]);
        if (upgrades[5][1] === 1) { prod2Number *= upgradesInfo[5].effect[1]; }
        producing[5][2] = Limit(prod2Number).multiply(...listForMult2).toArray();

        const listForMult1 = [buildings[5][1].current, producing[5][3]];
        let prod1Number = 4 ** researches[5][0];
        upgradesInfo[5].effect[0] = 4 * (2 ** strangeness[5][3]);
        if (upgrades[5][0] === 1) { prod1Number *= upgradesInfo[5].effect[0]; }
        producing[5][1] = Limit(prod1Number).multiply(...listForMult1).toArray();

        const clusterBoost = producing[5][2];
        if (clusterBoost[0] > 0) {
            producing[4][4] = Limit(producing[4][4]).multiply(clusterBoost).toArray();
            if (researches[5][1] >= 1) { producing[4][3] = Limit(producing[4][3]).multiply(clusterBoost).divide('3').toArray(); }
            if (researches[5][1] >= 2) { producing[4][2] = Limit(producing[4][2]).multiply(clusterBoost).divide('9').toArray(); }
            if (researches[5][1] >= 3) { producing[4][1] = Limit(producing[4][1]).multiply(clusterBoost).divide('27').toArray(); }
        }
    }
    if (vacuum) {
        const { inflationInfo } = global;
        if (!activeAll.includes(3)) { producing[3][1] = [1, 0]; }
        inflationInfo.preonTrue = producing[1][1];
        inflationInfo.dustTrue = producing[3][1];

        inflationInfo.dustCap = Limit(8e46 * (shiftRange() / inflationInfo.massCap) * calculateMassGain()).toArray();
        if (Limit(producing[3][1]).moreThan(inflationInfo.dustCap)) { producing[3][1] = inflationInfo.dustCap; }

        researchesExtraInfo[1].effect[3] = researchesExtra[1][3] / 20;
        let preonsCap = 1e14 * (energyMin ** researchesExtraInfo[1].effect[3]) * global.collapseInfo.starEffect[2]() * milestonesInfo[4].reward[1];
        if (player.elements[10] === 1) { preonsCap *= 2; }
        if (researchesExtra[4][1] >= 1) { preonsCap *= global.collapseInfo.effect4RE1(); }
        inflationInfo.preonCap = Limit(preonsCap).multiply(producing[3][1]).toArray();
        if (Limit(producing[1][1]).moreThan(inflationInfo.preonCap)) { producing[1][1] = inflationInfo.preonCap; }
    }
};

export const buyBuilding = (index: number, stageIndex = player.stage.active, auto = false) => {
    if (!checkBuilding(index, stageIndex)) { return; }
    const building = player.buildings[stageIndex][index as 1];

    let pointer; //For cost
    let currency;
    let special = '' as '' | 'Free' | 'Moles' | 'Mass' | 'Galaxy';
    if (stageIndex === 1) {
        pointer = player.buildings[1][index - 1];
        if (index === 1 && player.inflation.vacuum && player.strangeness[1][10] >= 1) { special = 'Free'; }
    } else if (stageIndex === 2) {
        if (index === 1 && player.inflation.vacuum) {
            special = 'Moles';
            pointer = player.buildings[1][5];
            currency = Limit(pointer.current).divide('6.02214076e23').toArray();
        } else { pointer = player.buildings[2][index === 1 ? 0 : 1]; }
    } else if (stageIndex === 3) {
        if (player.inflation.vacuum) {
            special = 'Mass';
            pointer = player.buildings[1][0];
            currency = Limit(pointer.current).multiply('1.78266192e-33').toArray();
        } else { pointer = player.buildings[3][0]; }
    } else /*if (stageIndex >= 4)*/ {
        pointer = player.buildings[4][0];
        if (stageIndex === 5 && index === 3) {
            special = 'Galaxy';
            currency = player.collapse.mass;
        }
    }
    if (currency === undefined) { currency = pointer.current; }

    let budget = currency;
    if (auto && building.true > 0 && special !== 'Free' && special !== 'Galaxy') {
        let save = '2' as number | string;
        if (special === 'Mass' && player.strangeness[3][4] >= 2 && Limit(global.inflationInfo.dustTrue).moreOrEqual(global.inflationInfo.dustCap)) {
            save = global.inflationInfo.massCap;
        } else if (player.strangeness[1][7] >= 1) { save = player.toggles.shop.wait[stageIndex]; }

        budget = Limit(currency).divide(save).toArray();
    }

    let total = calculateBuildingsCost(index, stageIndex); //This updates cost information
    if (Limit(total).moreThan(budget)) { return; }
    const howMany = auto ? -1 : (player.stage.resets < 1 && player.discharge.current < 1 ? 1 : player.toggles.shop.howMany);

    let canAfford = 1;
    if (howMany !== 1) {
        const increase = global.buildingsInfo.increase[stageIndex][index]; //Must be >1
        const firstCost = global.buildingsInfo.firstCost[stageIndex][index];
        if (special === 'Free') {
            canAfford = Math.floor(Limit(budget).divide(firstCost).log(increase).toNumber()) - building.true + 1;

            if (howMany !== -1) {
                if (canAfford < howMany) { return; }
                canAfford = howMany;
            }
        } else {
            /* Alternative formula */
            //max = floor(log((firstCost * increase ** building.true + increase * budget - budget) / firstCost) / log(increase)) - building.true;
            //total = firstCost * (increase ** (canAfford + building.true) - increase ** building.true) / (increase - 1);
            const totalBefore = Limit(increase).power(building.true).minus('1').divide(increase - 1).multiply(firstCost).toArray();
            canAfford = Math.floor(Limit(budget).plus(totalBefore).multiply(increase - 1).divide(firstCost).plus('1').log(increase).toNumber()) - building.true;

            if (howMany !== -1) {
                if (canAfford < howMany) { return; }
                canAfford = howMany;
            }
            total = Limit(increase).power(canAfford + building.true).minus('1').divide(increase - 1).multiply(firstCost).minus(totalBefore).toArray();
        }
    }
    if (!Limit(total).isFinite()) {
        if (global.debug.errorGain) {
            global.debug.errorGain = false;
            Notify(`Error inside Structure creation (${Limit(total).isNaN() ? 'NaN' : 'Infinity'} detected, debug ${stageIndex}-${index})`);
            setTimeout(() => { global.debug.errorGain = true; }, 6e4);
        }
        return;
    }

    building.true += canAfford;
    building.current = Limit(building.current).plus(canAfford).toArray();
    building.total = Limit(building.total).plus(canAfford).toArray();
    building.trueTotal = Limit(building.trueTotal).plus(canAfford).toArray();
    if (Limit(building.highest).lessThan(building.current)) { building.highest = cloneArray(building.current); }

    if (special === 'Galaxy') { //&& allowedToReset
        reset('galaxy', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [4, 5]);
    } else {
        if (special !== 'Free') {
            currency = Limit(currency).minus(total).toArray();

            /*if (special === 'Galaxy') {
                player.collapse.mass = Math.max(currency, 0.01235);
            } else*/ if (special === 'Moles') {
                pointer.current = Limit(currency).multiply('6.02214076e23').toArray();
                player.buildings[2][0].current = Limit(pointer.current).divide('6.02214076e23').toArray();
            } else if (special === 'Mass') {
                pointer.current = Limit(currency).divide('1.78266192e-33').toArray();
                player.buildings[3][0].current = Limit(pointer.current).multiply('1.78266192e-33').toArray();
            } else {
                pointer.current = currency;
            }
        }

        if (player.inflation.vacuum || stageIndex === 1) {
            assignEnergy(global.dischargeInfo.getEnergy(index, stageIndex) * canAfford);
            awardMilestone(1, 1);
        }
    }

    //Milestones that are based on bought amount
    if (stageIndex === 1) {
        if (index === 5 && player.upgrades[1][8] === 0 && player.inflation.vacuum) { player.buildings[2][0].current = Limit(building.current).divide('6.02214076e23').toArray(); }
    } else if (stageIndex === 2) {
        if (index !== 1) { awardMilestone(1, 2); }
    } else if (stageIndex === 3) {
        if (index >= 4) { awardMilestone(1, 3); }
    } else if (stageIndex === 4) {
        global.collapseInfo.trueStars += canAfford;
        awardMilestone(0, 5);
    } else if (stageIndex === 5) {
        if (index === 3) {
            awardMilestone(1, 5);
            if (!player.events[2]) { playEvent(5, 2); }
        }
    }

    assignBuildingInformation();
    if (!auto) {
        numbersUpdate();
        if (global.screenReader[0]) { getId('SRMain').textContent = `Made ${format(canAfford)} '${global.buildingsInfo.name[stageIndex][index]}'`; }
    }
};

export const assignEnergy = (add = null as number | null) => {
    const { discharge } = player;

    if (add === null) {
        const { getEnergy, energyType } = global.dischargeInfo;

        add = 0;
        for (let s = 1; s < (player.inflation.vacuum ? energyType.length : 2); s++) {
            const buildings = player.buildings[s];
            for (let i = 1; i < energyType[s].length; i++) {
                add += getEnergy(i, s) * buildings[i as 1].true;
            }
        }

        global.dischargeInfo.energyTrue = add;
        if (player.strangeness[1][11] >= 1) { discharge.energy = add; }
    } else {
        global.dischargeInfo.energyTrue += add;
        discharge.energy += add;
    }
    if (discharge.energyMax < discharge.energy) { discharge.energyMax = discharge.energy; }
};

export const calculateBuildingsCost = (index: number, stageIndex: number): overlimit => {
    const { buildingsInfo } = global;

    if (stageIndex === 1) {
        const effect = 10 + 3 * player.researches[1][0];
        global.upgradesInfo[1].effect[6] = effect / 100;

        let increase = 140;
        if (player.upgrades[1][6] === 1) { increase -= effect; }
        buildingsInfo.increase[1][index] = increase / 100;

        if (index === 1) {
            let cost = buildingsInfo.startCost[1][1];
            if (!player.inflation.vacuum && player.upgrades[1][2] === 1) { cost /= 10; }
            buildingsInfo.firstCost[1][1] = cost;
        } else if (index === 3) {
            let cost = buildingsInfo.startCost[1][3];
            if (player.upgrades[1][1] === 1) { cost /= 10; }
            buildingsInfo.firstCost[1][3] = cost;
        } else if (index === 4) {
            let cost = buildingsInfo.startCost[1][4];
            if (player.inflation.vacuum) {
                if (player.upgrades[1][2] === 1) { cost /= 10; }
                if (player.researchesExtra[1][0] >= 1) { cost /= 10; }
            }
            buildingsInfo.firstCost[1][4] = cost;
        }
    } else if (stageIndex === 3) {
        buildingsInfo.firstCost[3][index] = buildingsInfo.startCost[3][index];
        if (!player.inflation.vacuum && global.strangeInfo.stageBoost[3] !== null) { buildingsInfo.firstCost[3][index] /= global.strangeInfo.stageBoost[3]; }
        if (index === 4) {
            buildingsInfo.increase[3][4] = player.upgrades[3][11] === 1 ? 5 : 10;
        }
    } else if (stageIndex === 4) {
        let increase = 125 + 15 * index;
        if (player.elements[2] === 1) { increase -= 10; }
        if (player.elements[8] === 1) { increase -= 5; }
        buildingsInfo.increase[4][index] = increase / 100;

        let cost = buildingsInfo.startCost[4][index] / (2 ** player.strangeness[4][1]);
        if (player.elements[13] === 1) { cost /= 1e3; }
        buildingsInfo.firstCost[4][index] = cost;
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

        if (stageIndex === 2 && get === 1 && player.buildings[2][2].current[0] === 0 && player.researchesExtra[2][1] >= 1) {
            add = Limit(add).plus(time * ((global.researchesExtraInfo[2].effect[1] as number) - 1)).toArray();
        }
    }
    if (add[0] === 0) { return; }
    if (!Limit(add).isFinite()) {
        if (global.debug.errorGain) {
            global.debug.errorGain = false;
            Notify(`Error inside income calculation (${Limit(add).isNaN() ? 'NaN' : 'Infinity'} detected, debug ${stageIndex}-${get})`);
            setTimeout(() => { global.debug.errorGain = true; }, 6e4);
        }
        return;
    }

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

    //Milestones that are based on gained amount
    if (stageIndex === 1) {
        if (player.inflation.vacuum) {
            if (get === 0) {
                player.buildings[3][0].current = Limit(building.current).multiply('1.78266192e-33').toArray();
                awardMilestone(0, 3);
            } else if (get === 5) {
                player.buildings[2][0].current = Limit(building.current).divide('6.02214076e23').toArray();
            }
        }
    } else if (stageIndex === 3) {
        if (get === 0) { //Never 0 for true vacuum
            if (player.accretion.rank < 5 && Limit(building.current).moreThan('1e30')) { building.current = [1, 30]; }
            awardMilestone(0, 3);
        }
    } else if (stageIndex === 4) {
        if (Limit(player.collapse.elementsMax).lessThan(building.current)) { player.collapse.elementsMax = cloneArray(building.current); }
    }
};

export const assignStrangeBoost = () => {
    const { strangeness } = player;
    const stageBoost = global.strangeInfo.stageBoost;
    const strangeQuarks = player.strange[0].current + 1;

    stageBoost[1] = strangeness[1][8] < 1 ? null : strangeQuarks ** 0.12 - 1;
    stageBoost[2] = strangeness[2][8] < 1 ? null : strangeQuarks ** 0.24;
    stageBoost[3] = strangeness[3][7] < 1 ? null : player.inflation.vacuum ?
        strangeQuarks ** 0.16 - 1 : strangeQuarks ** 0.8;
    stageBoost[4] = strangeness[4][9] < 1 ? null : strangeQuarks ** 0.28;
    stageBoost[5] = strangeness[5][9] < 1 ? null : strangeQuarks ** 0.06;
};

export const calculateGainedStrangeness = (get: number, time: number) => {
    const strange = player.strange[get];
    const max = Math.floor(player.strange[get + 1].current * 1e12);
    if (strange.current >= max) { return; }

    const add = Math.max(time, (max - strange.current) * time / 600);
    strange.current += add;
    strange.total += add;
    if (strange.current > max) {
        const old = strange.current;
        strange.current = max;
        strange.total = Math.round(strange.total - (old - strange.current));
    }

    if (get === 0) { assignStrangeBoost(); }
};

export const buyUpgrades = (upgrade: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'ASR' | 'elements' | 'strangeness', auto = false): boolean => {
    if (!auto && !checkUpgrade(upgrade, stageIndex, type)) { return false; } //Auto should already checked if allowed, also allows for delayed purchase of Elements

    let currency: number | overlimit;
    if (type === 'strangeness') {
        currency = player.strange[0].current;
    } else if (stageIndex === 1) {
        currency = player.discharge.energy;
    } else if (stageIndex === 2) {
        currency = player.buildings[2][1].current;
    } else if (stageIndex === 3) {
        currency = player.inflation.vacuum ? Limit(player.buildings[1][0].current).multiply('1.78266192e-33').toArray() : player.buildings[3][0].current;
    } else /* if (stageIndex === 4 || stageIndex === 5) */ {
        currency = player.buildings[4][0].current;
    }

    if (type === 'upgrades') {
        if (player.upgrades[stageIndex][upgrade] >= 1) { return false; }

        const pointer = global.upgradesInfo[stageIndex];
        if (Limit(currency).lessThan(pointer.startCost[upgrade])) { return false; }

        player.upgrades[stageIndex][upgrade]++;
        currency = Limit(currency).minus(pointer.startCost[upgrade]).toArray();

        /* Special cases */
        if (stageIndex === 4 && upgrade === 1 && global.tab === 'research' && player.toggles.normal[2]) { switchTab('research'); }
        if (!auto && global.screenReader[0]) { getId('SRMain').textContent = `New upgrade '${pointer.name[upgrade]}', has been created`; }
    } else if (type === 'researches' || type === 'researchesExtra' || type === 'ASR') {
        const pointer = type === 'researches' || type === 'researchesExtra' ? global[`${type}Info`][stageIndex] : global.ASRInfo;
        const level = type === 'researches' || type === 'researchesExtra' ? player[type][stageIndex] : player.ASR;

        if (level[upgrade] >= pointer.max[upgrade]) { return false; }
        if (Limit(currency).lessThan(pointer.cost[upgrade])) { return false; }

        level[upgrade]++;
        currency = Limit(currency).minus(pointer.cost[upgrade]).toArray();

        /* Special cases */
        if (type === 'researches') {
            if (stageIndex === 4 && upgrade === 2) {
                calculateMaxLevel(0, 4, 'researches', true);
            }
        } else if (type === 'researchesExtra') {
            if (stageIndex === 1) {
                if (upgrade === 2) {
                    if (player.stage.current < 4) { player.stage.current = player.researchesExtra[1][2] > 1 ? 2 : 3; }
                    stageUpdate('soft');
                    awardVoidReward(1);
                }
            }
        }
        if (!auto && global.screenReader[0]) { getId('SRMain').textContent = `Research '${type === 'ASR' ? 'Structure Automation' : (pointer as { name: string[] }).name[upgrade]}' level increased, it is now ${level[upgrade]} ${level[upgrade] >= pointer.max[upgrade] ? 'maxed' : ''}`; }
    } else if (type === 'elements') {
        let level = player.elements[upgrade];
        if (level >= 1) { return false; }

        if (level === 0) {
            const startCost = global.elementsInfo.startCost[upgrade];
            if (Limit(currency).lessThan(startCost)) { return false; }
            currency = Limit(currency).minus(startCost).toArray();
        } else if (!auto) { return false; }
        if (player.collapse.show < upgrade) { player.collapse.show = upgrade; }
        level = player.strangeness[4][4] >= 1 || level === 0.5 ? 1 : 0.5;
        player.elements[upgrade] = level;

        /* Special cases */
        if (level === 1) {
            if (upgrade === 7 || upgrade === 16 || upgrade === 20 || upgrade === 25) {
                calculateMaxLevel(1, 4, 'researches', true);
            } else if (upgrade === 9 || upgrade === 17) {
                calculateMaxLevel(0, 4, 'researches', true);
            } else if (upgrade === 11) {
                calculateMaxLevel(2, 4, 'researches', true);
            } else if (upgrade === 26) {
                //awardVoidReward(4);
                if (player.stage.current < 5) {
                    player.stage.current = 5;
                    if (player.stage.true === 4) { player.stage.true = 5; }
                    stageUpdate('soft');
                }
            }
        }
        if (!auto && global.screenReader[0]) { getId('SRMain').textContent = `New Element '${global.elementsInfo.name[upgrade]}' ${player.elements[upgrade] >= 1 ? 'obtained' : 'awaiting activation'}`; }
    } else if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        if (player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade]) { return false; }
        if ((currency as number) < global.strangenessInfo[stageIndex].cost[upgrade]) { return false; }

        player.strangeness[stageIndex][upgrade]++;
        (currency as number) -= pointer.cost[upgrade];

        /* Special cases */
        if (stageIndex === 1) {
            if (upgrade === 4) {
                assignEnergy();
            } else if (upgrade === 6) {
                player.ASR[1] = Math.max(player.strangeness[1][6], player.ASR[1]);
                calculateMaxLevel(0, 1, 'ASR', true);
            } else if (upgrade === 11) {
                assignEnergy();
                calculateMaxLevel(3, 1, 'strangeness', true);
                calculateMaxLevel(4, 2, 'strangeness', true);
                calculateMaxLevel(4, 3, 'strangeness', true);
                calculateMaxLevel(5, 4, 'strangeness', true);
            }
        } else if (stageIndex === 2) {
            if (upgrade === 2) {
                if (player.strangeness[2][2] < 3) { calculateMaxLevel(4, 2, 'researches', true); }
                if (player.strangeness[2][2] === 2) { calculateMaxLevel(5, 2, 'researches', true); }
            } else if (upgrade === 5) {
                player.ASR[2] = Math.max(player.strangeness[2][5], player.ASR[2]);
                calculateMaxLevel(0, 2, 'ASR', true);
            } else if (upgrade === 9) {
                calculateMaxLevel(0, 2, 'ASR', true);
                calculateMaxLevel(5, 2, 'strangeness', true);
            }
        } else if (stageIndex === 3) {
            if (upgrade === 2) {
                calculateMaxLevel(0, 3, 'researchesExtra', true);
                calculateMaxLevel(1, 3, 'researchesExtra', true);
            } else if (upgrade === 5) {
                player.ASR[3] = Math.max(player.strangeness[3][5], player.ASR[3]);
                calculateMaxLevel(0, 3, 'ASR', true);
            } else if (upgrade === 8) {
                calculateMaxLevel(0, 3, 'ASR', true);
                calculateMaxLevel(5, 3, 'strangeness', true);
            } else if (upgrade === 9) {
                assignNewMassCap();
            }
        } else if (stageIndex === 4) {
            if (upgrade === 6) {
                player.ASR[4] = Math.max(player.strangeness[4][6], player.ASR[4]);
                calculateMaxLevel(0, 4, 'ASR', true);
            } else if (upgrade === 10) {
                calculateMaxLevel(0, 4, 'ASR', true);
                calculateMaxLevel(6, 4, 'strangeness', true);
            } else if (upgrade === 11) {
                if (player.elements[0] !== 1) {
                    player.elements[0] = 1;
                    visualUpdateUpgrades(0, 4, 'elements');
                }
            }
        } else if (stageIndex === 5) {
            if (upgrade === 0) {
                if (!player.inflation.vacuum) { stageUpdate('soft'); }
            } else if (upgrade === 1) {
                player.stage.input *= 2;
            } else if (upgrade === 5) {
                if (player.inflation.vacuum) { stageUpdate('soft'); }
            } else if (upgrade === 6 || upgrade === 7) {
                player.ASR[5] = player.strangeness[5][7];
                if (player.strangeness[5][6] >= 2) { player.ASR[5]++; }
                calculateMaxLevel(0, 5, 'ASR', true);
            } else if (upgrade === 8) {
                if (player.inflation.vacuum && global.tab === 'strangeness') { switchTab('strangeness'); }
            } else if (upgrade === 10) {
                player.stage.input /= 1e12;
            }
        }
        if (!auto && global.screenReader[0]) { getId('SRMain').textContent = `Strangeness of '${pointer.name[upgrade]}' for ${global.stageInfo.word[stageIndex]} Stage is increased, level is now ${player.strangeness[stageIndex][upgrade]}${player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade] ? 'maxed' : ''}`; }
    }

    if (type === 'strangeness') {
        player.strange[0].current = currency as number;
        assignStrangeBoost();
    } else if (stageIndex === 1) {
        if (player.strangeness[1][11] < 1) {
            player.discharge.energy = Limit(currency).toNumber();
            if (player.toggles.auto[1]) { dischargeResetCheck('upgrade'); }
        }
    } else if (stageIndex === 2) {
        player.buildings[2][1].current = currency as overlimit;

        if (player.buildings[2][2].current[0] === 0 && Limit(player.buildings[2][1].current).lessThan(player.buildings[2][1].true)) {
            const old = player.buildings[2][1].true;
            player.buildings[2][1].true = Math.floor(Limit(player.buildings[2][1].current).toNumber());
            if (player.inflation.vacuum) {
                const decreased = (old - player.buildings[2][1].true) * global.dischargeInfo.getEnergy(1, 2);
                global.dischargeInfo.energyTrue -= decreased;
                player.discharge.energy -= decreased;
            } else if (player.buildings[2][1].current[0] === 0 && Limit(player.buildings[2][0].current).lessThan('2.8e-3')) {
                player.buildings[2][0].current = [2.8, -3];
            }
        }
    } else if (stageIndex === 3) {
        if (player.inflation.vacuum) {
            player.buildings[1][0].current = Limit(currency).divide('1.78266192e-33').toArray();
            player.buildings[3][0].current = Limit(player.buildings[1][0].current).multiply('1.78266192e-33').toArray();
            //Currency can be assigned directly, but due to floating points accuracy will reduce a little
        } else { player.buildings[3][0].current = currency as overlimit; }
    } else /*if (stageIndex === 4 || stageIndex === 5)*/ {
        player.buildings[4][0].current = currency as overlimit;
    }

    assignBuildingInformation();
    if (type === 'upgrades' || type === 'elements') {
        visualUpdateUpgrades(upgrade, stageIndex, type);
    } else {
        calculateResearchCost(upgrade, stageIndex, type);
        visualUpdateResearches(upgrade, stageIndex, type);
    }
    if (!auto) {
        if (type === 'strangeness') { getStrangenessDescription(upgrade, stageIndex, type); } //Remove if auto description will be added
        numbersUpdate();
    }
    return true;
};

//Currently can't allow price to be more than 2**1024. Because missing sorting function for numbers that big
export const calculateResearchCost = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'ASR' | 'strangeness') => {
    if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];

        pointer.cost[research] = stageIndex === 1 ?
            pointer.startCost[research] + pointer.scaling[research] * player[type][stageIndex][research] :
            pointer.startCost[research] * pointer.scaling[research] ** player[type][stageIndex][research];

        if (pointer.cost[research] < 1) { //Remove all but 2 digits
            const digits = 10 ** (-Math.floor(Math.log10(pointer.cost[research])) + 2);
            pointer.cost[research] = Math.round(pointer.cost[research] * digits) / digits;
        } else {
            pointer.cost[research] = Math.round(pointer.cost[research] * 100) / 100;
        }
    } else if (type === 'ASR') {
        global.ASRInfo.cost[stageIndex] = global.ASRInfo.costRange[stageIndex][player.ASR[stageIndex]];
    } else if (type === 'strangeness') {
        global.strangenessInfo[stageIndex].cost[research] = player.inflation.vacuum ?
            Math.floor(Math.round((global.strangenessInfo[stageIndex].startCost[research] * global.strangenessInfo[stageIndex].scaling[research] ** player.strangeness[stageIndex][research]) * 100) / 100) :
            Math.floor(Math.round((global.strangenessInfo[stageIndex].startCost[research] + global.strangenessInfo[stageIndex].scaling[research] * player.strangeness[stageIndex][research]) * 100) / 100);
    }
};

export const calculateMaxLevel = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'ASR' | 'strangeness', addAuto = false) => {
    let max = null;
    if (type === 'ASR') {
        if (stageIndex === 1) {
            max = player.inflation.vacuum ? 5 : 3;
        } else if (stageIndex === 2) {
            max = player.strangeness[2][9] >= 1 ? 6 : 5;
        } else if (stageIndex === 3) {
            max = player.strangeness[3][8] >= 1 ? 5 : 4;
        } else if (stageIndex === 4) {
            max = player.strangeness[4][10] >= 1 ? 5 : 4;
        } else if (stageIndex === 5) {
            max = player.strangeness[5][7];
            if (player.strangeness[5][6] >= 2) { max++; }
        }
    } else if (type === 'researches') {
        if (stageIndex === 2) {
            if (research === 4) {
                max = 2;
                if (player.strangeness[2][2] >= 1) { max++; }
            } else if (research === 5) {
                max = 1;
                if (player.strangeness[2][2] >= 2) { max++; }
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                max = 3 + (3 * player.researches[4][2]);
                if (player.elements[9] === 1) { max += 12; }
                if (player.elements[17] === 1) { max += 24; }
            } else if (research === 1) {
                max = 2;
                if (player.elements[7] === 1) { max += 2; }
                if (player.elements[16] === 1) { max++; }
                if (player.elements[20] === 1) { max++; }
                if (player.elements[25] === 1) { max++; }
            } else if (research === 2) {
                max = 1;
                if (player.elements[11] === 1) { max++; }
            }
        }
    } else if (type === 'researchesExtra') {
        if (stageIndex === 3) {
            if (research === 0) {
                max = 12;
                if (player.accretion.rank >= 3) { max += 17; }
                if (player.strangeness[3][2] >= 1) { max += 7; }
            } else if (research === 1) {
                max = 5;
                if (player.strangeness[3][2] >= 2) { max += 2; }
            } else if (research === 4) {
                max = Math.min(player.accretion.rank - 2, 4);
            }
        }
    } else if (type === 'strangeness') {
        if (stageIndex === 1) {
            if (research === 0) {
                max = 4 + Math.min(player.challenges.void[3], 4);
            } else if (research === 2) {
                max = 2 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            } else if (research === 3) {
                max = player.strangeness[1][11] >= 1 ? 2 : 1;
            } else if (research === 6) {
                max = player.inflation.vacuum ? 5 : 3;
            } else if (research === 9) {
                max = 6 + Math.min(player.challenges.void[3], 4);
            }
        } else if (stageIndex === 2) {
            if (research === 1) {
                max = 6 + Math.min(player.challenges.void[3], 4);
            } else if (research === 3) {
                max = 3 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            } else if (research === 4) {
                max = player.strangeness[1][11] >= 1 ? 2 : 1;
            } else if (research === 5) {
                max = player.strangeness[2][9] >= 1 ? 6 : 5;
            }
        } else if (stageIndex === 3) {
            if (research === 0) {
                max = 8 + Math.min(player.challenges.void[3], 4);
            } else if (research === 1) {
                max = 4 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            } else if (research === 4) {
                max = player.strangeness[1][11] >= 1 ? 2 : 1;
            } else if (research === 5) {
                max = player.strangeness[3][8] >= 1 ? 5 : 4;
            } else if (research === 10) {
                max = 2 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                max = 8 + Math.min(player.challenges.void[3], 4);
            } else if (research === 1) {
                max = 4 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            } else if (research === 4) {
                max = player.stage.true >= 6 || player.events[2] ? 2 : 1;
            } else if (research === 5) {
                max = player.strangeness[1][11] >= 1 ? 2 : 1;
            } else if (research === 6) {
                max = player.strangeness[4][10] >= 1 ? 5 : 4;
            }
        } else if (stageIndex === 5) {
            if (research === 0) {
                max = player.inflation.vacuum ? 1 : 3;
            }
        }
    }
    if (max !== null) {
        if (max < 0) { max = 0; }
        if (type === 'ASR') {
            global.ASRInfo.max[stageIndex] = max;
        } else {
            global[`${type}Info`][stageIndex].max[research] = max;
        }
    }

    calculateResearchCost(research, stageIndex, type);
    visualUpdateResearches(research, stageIndex, type);
    if (addAuto && (type === 'researches' || type === 'researchesExtra')) { autoResearchesSet(type, [stageIndex, research]); }
};

export const autoUpgradesSet = (which: 'all' | number) => {
    if (!player.toggles.auto[5]) { return; }
    const { autoU: auto } = global.automatization;

    if (which === 'all') {
        for (let s = 0; s <= 5; s++) {
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
    if (player.strangeness[3][6] < 1 || !player.toggles.auto[5]) { return; }
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
        for (let s = 0; s <= 5; s++) {
            const pointer = global[`${type}Info`][s];

            auto[s] = [];
            for (let i = 0; i < pointer.maxActive; i++) {
                if (player[type][s][i] < pointer.max[i]) {
                    auto[s].push(i);
                }
            }
            auto[s].sort((a, b) => pointer.cost[a] - pointer.cost[b]);
        }
    } else if (typeof which === 'number') {
        const pointer = global[`${type}Info`][which];

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
        if (player.strangeness[3][6] < 2 || !player.toggles.auto[6]) { return; }
    } else if (type === 'researchesExtra') {
        if (player.strangeness[3][6] < 3 || !player.toggles.auto[7]) { return; }
    }

    const auto = global.automatization[type === 'researches' ? 'autoR' : 'autoE'][stageIndex];
    const pointer = global[`${type}Info`][stageIndex];

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
    if (!player.toggles.auto[8]) { return; }
    const { elements: auto } = global.automatization;
    const { elements } = player;

    for (let i = 1; i < global.elementsInfo.startCost.length; i++) {
        if (elements[i] === 0) { auto.push(i); }
    }

    const { startCost } = global.elementsInfo;
    auto.sort((a, b) => startCost[a] - startCost[b]);
};

export const autoElementsBuy = () => {
    if (player.strangeness[4][4] < 2 || !player.toggles.auto[8]) { return; }
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
    const toggles = type === 'buildings' ? player.toggles.buildings[player.stage.active] : player.toggles[type];

    if (change) {
        if (type === 'buildings') {
            if (number === 0) {
                if (player.strangeness[1][7] < 1) { return; }

                toggles[0] = !toggles[0];
                for (let i = 1; i < toggles.length; i++) {
                    toggles[i] = toggles[0];
                    toggleSwap(i, 'buildings');
                }
            } else {
                const buildings = player.buildings[player.stage.active];
                if (number >= buildings.length) { return; }

                let anyOn = false;
                toggles[number] = !toggles[number];
                for (let i = 1; i < global.buildingsInfo.maxActive[player.stage.active]; i++) {
                    if (toggles[i] && buildings[i].highest[0] > 0) {
                        anyOn = true;
                        break;
                    }
                }
                if (toggles[0] !== anyOn) {
                    toggles[0] = anyOn;
                    toggleSwap(0, 'buildings');
                }
            }
        } else { toggles[number] = !toggles[number]; }
    }

    let toggleHTML;
    if (type === 'normal') {
        toggleHTML = getId(`toggle${number}`);
    } else if (type === 'buildings') {
        toggleHTML = getId(`toggleBuilding${number}`);
    } else {
        toggleHTML = getId(`toggleAuto${number}`);
    }

    const extraText = type === 'normal' ? '' : (type === 'buildings' && number === 0 ? 'All ' : 'Auto ');
    if (!toggles[number]) {
        toggleHTML.style.color = 'var(--red-text-color)';
        toggleHTML.style.borderColor = 'crimson';
        toggleHTML.textContent = `${extraText}OFF`;
    } else {
        toggleHTML.style.color = '';
        toggleHTML.style.borderColor = '';
        toggleHTML.textContent = `${extraText}ON`;
    }
};

export const toggleConfirm = (number: number, change = false) => {
    const toggles = player.toggles.confirm;
    if (change) { toggles[number] = toggles[number] === 'All' ? 'Safe' : toggles[number] === 'Safe' ? 'None' : 'All'; }

    const toggleHTML = getId(`toggleConfirm${number}`);
    if (toggles[number] === 'All' || toggles[number] === 'Safe') {
        toggleHTML.style.color = '';
        toggleHTML.style.borderColor = '';
        toggleHTML.textContent = toggles[number];
    } else {
        toggleHTML.style.color = 'var(--red-text-color)';
        toggleHTML.style.borderColor = 'crimson';
        toggleHTML.textContent = 'None';
    }
};

export const toggleBuy = (type = '' as '1' | 'max' | 'any') => {
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
    }
    getId('buy1x').style.backgroundColor = shop.howMany === 1 ? 'green' : '';
    getId('buyAny').style.backgroundColor = Math.abs(shop.howMany) !== 1 ? 'green' : '';
    getId('buyMax').style.backgroundColor = shop.howMany === -1 ? 'green' : '';
    if (type !== '1' && type !== 'max') { input.value = format(shop.input, { digits: 0, type: 'input' }); }
    numbersUpdate();
};

export const stageResetCheck = (stageIndex: number, auto = false): boolean => {
    let allowed = false;
    if (stageIndex >= 5) {
        allowed = player.stage.current >= 5; //player.elements[26] === 1;
    } else if (stageIndex === 4) {
        return false;
    } else if (stageIndex === 3) {
        allowed = Limit(player.buildings[3][0].current).moreOrEqual('2.47e31');
    } else if (stageIndex === 2) {
        allowed = Limit(player.buildings[2][1].current).moreOrEqual('1.194e29');
    } else if (stageIndex === 1) {
        allowed = Limit(player.buildings[1][3].current).moreOrEqual('1.67e21');
    }

    if (auto && allowed) {
        if (player.strangeness[5][2] < 1 || (stageIndex >= 4 && global.strangeInfo.gain(stageIndex) / 1e12 ** player.strangeness[5][10] < player.stage.input)) { return false; }
        stageResetReward(stageIndex);
    }
    return allowed;
};

export const stageAsyncReset = async() => {
    const { stage } = player;
    const active = player.inflation.vacuum ? 6 : (stage.active === 4 && stage.current === 5 && player.events[1] ? 5 : stage.active);

    if (!stageResetCheck(active)) {
        if (stage.resets < 1 && (player.inflation.vacuum ? stage.current < 5 : player.discharge.current < 6)) { return; }
        if (active >= 5) { return void Alert('Awaiting "Iron" Element'); }
        if (active === 4) { return void Alert('Reach Intergalactic space first'); }
        if (active === 3) { return void Alert(`Self sustaining is not yet possible, obtain at least ${format(2.47e31)} Mass`); }
        if (active === 2) { return void Alert(`Look's like more Mass expected, need even more Drops, around ${format(1.194e29)} in total`); }
        if (active === 1) { return void Alert(`Not enough to form a single Drop of water, need at least ${format(1.67e21)} Molecules`); }
    } else {
        if (player.toggles.confirm[0] !== 'None') {
            if (player.toggles.confirm[0] !== 'Safe' || player.challenges.active !== -1) {
                if (!(await Confirm(active === 6 ? `Ready to reset progress for ${format(global.strangeInfo.gain(active) / 1e12 ** player.strangeness[5][10])} ${global.strangeInfo.name[player.strangeness[5][10]]}?${player.challenges.active !== -1 ? `\n(${global.challengesInfo.name[player.challenges.active]} is active)` : ''}` :
                    active === 5 ? `Return back to Microworld for ${format(global.strangeInfo.gain(active))} Strange quarks?` :
                    active === stage.current ? 'Ready to enter next Stage? Next one will be harder than current' : `Reset this Stage for ${format(global.strangeInfo.gain(active))} Strange quarks?`))) { return; }
                if (!stageResetCheck(active)) { return Notify('Stage reset canceled, requirements are no longer met'); }
            }
        }
        stageResetReward(active);
    }
};

const stageResetReward = (stageIndex: number) => {
    const { stage } = player;
    const time = stage.time;

    stage.resets++;
    let update: false | 'normal' | 'soft' = 'normal';
    const resetThese = player.inflation.vacuum ? [1, 2, 3, 4, 5] : [stageIndex];
    if (player.inflation.vacuum) {
        stage.active = 1;
        stage.current = 1;
        stage.time = 0;
    } else if (stageIndex === stage.current) {
        if (stageIndex < 5) {
            stage.current++;
            if (stage.active === stage.current - 1) {
                stage.active = stage.current;
            } else { update = 'soft'; }
            if (stage.current > stage.true) {
                stage.true = stage.current;
                player.events[0] = false;
            }
        } else {
            stage.current = 1 + player.strangeness[5][0];
            if ((stage.active === 4 && stage.current !== 4) || stage.active === 5) {
                stage.active = stage.current;
            } else { update = 'soft'; }
            resetThese.unshift(4);
        }
        stage.time = 0;
    } else { update = stageIndex === stage.active ? 'soft' : false; }

    if (stage.true >= 5) {
        const trueGain = global.strangeInfo.gain(stageIndex);
        if (trueGain > stage.best) { stage.best = trueGain; }

        const resetType = player.strangeness[5][10];
        const postGain = trueGain / 1e12 ** resetType;
        player.strange[resetType].current += postGain;
        player.strange[resetType].total += postGain;
        assignStrangeBoost();

        if (stageIndex >= 4) {
            const storage = global.historyStorage.stage;
            const history = player.history.stage;
            storage.unshift([trueGain, time, resetType]);
            if (storage.length > history.input[1]) { storage.length = history.input[1]; }
            if (trueGain / time > history.best[0] / history.best[1]) { history.best = [trueGain, time, resetType]; }
        }
    }

    resetStage(resetThese, update);
};

export const switchStage = (stage: number) => {
    if (player.stage.active === stage) {
        if (global.lastActive !== null) {
            global.lastActive = null;
        } else if (!global.screenReader[0]) { getId('stageSelect').classList.remove('active'); }
        return;
    }
    if (!global.stageInfo.activeAll.includes(stage)) { return; }
    if ((global.tab === 'Elements' || (global.tab === 'research' && global.subtab.researchCurrent === 'Elements')) && stage !== 4 && stage !== 5) {
        global.lastActive = stage;
        return;
    }

    player.stage.active = stage;
    stageUpdate();

    if (!player.events[1] && player.stage.active === 5) { playEvent(4, 1); }
};

export const assignDischargeInformation = () => {
    global.dischargeInfo.next = Math.round((10 - (2 * player.researches[1][3]) - (player.strangeness[1][1] / 2)) ** player.discharge.current);
};

export const dischargeResetCheck = (auto = false as false | 'interval' | 'upgrade'): boolean => {
    if (player.upgrades[1][5] < 1 || player.buildings[1][1].true <= 0) { return false; }
    assignDischargeInformation();

    if (auto !== false) {
        if (player.strangeness[1][3] < 1 || (auto === 'interval' && player.discharge.energy < global.dischargeInfo.next)) { return false; }
        dischargeReset(true);
    }
    return true;
};

export const dischargeAsyncReset = async() => {
    if (!dischargeResetCheck()) { return; }
    const info = global.dischargeInfo;
    const energy = player.discharge.energy;

    if (player.toggles.confirm[1] !== 'None') {
        const active = player.stage.active;
        const goalReached = energy >= info.next;
        const energyRegain = energy < info.energyTrue;
        if (player.toggles.confirm[1] !== 'Safe' || active !== 1 || (!goalReached && !energyRegain)) {
            if (!(await Confirm(`${active === 1 ? 'This will reset all current Structures and Energy. ' : `Discarge attempt while inside '${global.stageInfo.word[active]}'.\n`}${goalReached ? 'Enough Energy to gain boost from new goal' : energyRegain ? `Can regain at least ${format(info.energyTrue - energy)} Energy` : 'There is no real reason'}, continue?`))) { return; }
            if (!dischargeResetCheck()) { return Notify('Discharge canceled, requirements are no longer met'); }
        }
    }

    if (global.screenReader[0]) { getId('SRMain').textContent = `Structures and Energy were reset${energy >= info.next ? ', gained boost from reaching new goal' : ''}`; }
    dischargeReset();
};

const dischargeReset = (auto = false) => {
    if (player.discharge.energy >= global.dischargeInfo.next) {
        player.discharge.current++;
    }
    awardMilestone(0, 1);
    awardVoidReward(1);
    if (!auto || player.strangeness[1][3] < 2) { reset('discharge', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [1]); }
};

export const assignVaporizationInformation = () => {
    let get = Limit(player.buildings[2][1][player.researchesExtra[2][0] >= 1 ? 'total' : 'current']).divide(global.vaporizationInfo.effect2U2()).toArray();

    if (Limit(get).moreOrEqual('1')) {
        get = player.inflation.vacuum ?
            Limit(player.vaporization.clouds).power(2.5).plus(get).power(0.4).minus(player.vaporization.clouds).multiply(global.milestonesInfo[2].reward[0]).toArray() :
            Limit(player.vaporization.clouds).power(1 / 0.6).plus(get).power(0.6).minus(player.vaporization.clouds).toArray();
        global.vaporizationInfo.get = get;
    } else { global.vaporizationInfo.get = [0, 0]; }
};

export const vaporizationResetCheck = (auto = false): boolean => {
    assignVaporizationInformation();
    if (player.upgrades[2][2] < 1 || global.vaporizationInfo.get[0] === 0) { return false; }

    if (auto) {
        const toReset = player.strangeness[2][4] < 2;
        if (toReset && (player.strangeness[2][4] < 1 || Limit(global.vaporizationInfo.cloudEffect(true)).divide(global.vaporizationInfo.cloudEffect()).lessThan(player.vaporization.input))) { return false; }
        vaporizationReset(toReset);
    }
    return true;
};

export const vaporizationAsyncReset = async() => {
    if (!vaporizationResetCheck()) { return; }
    const info = global.vaporizationInfo;
    const clouds = player.vaporization.clouds;

    if (player.toggles.confirm[2] !== 'None') {
        const active = player.stage.active;
        const increase = clouds[0] > 0 ? Limit(info.get).divide(clouds).multiply('1e2').toArray() : '1e2';
        if (player.toggles.confirm[2] !== 'Safe' || active !== 2 || Limit(increase).lessThan('1e2')) {
            if (!(await Confirm(`${active === 2 ? 'Reset structures and upgrades' : `Vaporization attempt while inside '${global.stageInfo.word[active]}'.\nConfirm`} for ${Limit(info.get).format()} (+${Limit(increase).format()}%) Clouds?`))) { return; }
            if (!vaporizationResetCheck()) { return Notify('Vaporization canceled, requirements are no longer met'); }
        }
    }

    if (global.screenReader[0]) { getId('SRMain').textContent = `Progress were reset for ${Limit(info.get).format()} (+${clouds[0] > 0 ? Limit(info.get).divide(clouds).multiply('1e2').format() : 100}%) Clouds`; }
    vaporizationReset();
};

const vaporizationReset = (toReset = true) => {
    const { vaporization } = player;

    vaporization.clouds = Limit(vaporization.clouds).plus(global.vaporizationInfo.get).toArray();
    if (Limit(vaporization.cloudsMax).lessThan(vaporization.clouds)) { vaporization.cloudsMax = cloneArray(vaporization.clouds); }
    awardMilestone(0, 2);
    awardVoidReward(2);
    if (toReset) { reset('vaporization', player.inflation.vacuum ? (player.strangeness[2][11] >= 1 ? [1, 2] : [1, 2, 3, 4, 5]) : [2]); }
};

export const rankResetCheck = (auto = false): boolean => {
    const requirement = global.accretionInfo.rankCost[player.accretion.rank];
    if (requirement === 0) { return false; }

    if (player.inflation.vacuum) {
        if (Limit(player.buildings[1][0].current).multiply('1.78266192e-33').lessThan(requirement)) { return false; }
    } else if (Limit(player.buildings[3][0].current).lessThan(requirement)) { return false; }

    if (auto) {
        if (player.strangeness[3][4] < 1) { return false; }
        rankReset();
    }
    return true;
};

export const rankAsyncReset = async() => {
    if (!rankResetCheck()) { return; }

    if (player.toggles.confirm[3] !== 'None' && player.accretion.rank !== 0) {
        const active = player.stage.active;
        if (player.toggles.confirm[3] !== 'Safe' || active !== 3) {
            if (!(await Confirm(active === 3 ?
                'Increasing Rank will reset structures, upgrades and Stage researches. But unlock something new' :
                `Rank increase attempt while inside '${global.stageInfo.word[active]}'. Continue anyway?`))) { return; }
            if (!rankResetCheck()) { return Notify('Rank increase canceled, requirements are no longer met'); }
        }
    }

    rankReset();
    if (global.screenReader[0]) { getId('SRMain').textContent = `Rank is now '${global.accretionInfo.rankName[player.accretion.rank]}'`; }
};

const rankReset = () => {
    player.accretion.rank++;
    if (player.accretion.rank === 6) {
        player.stage.current = 4;
        stageUpdate('soft');
    }
    awardVoidReward(3);
    reset('rank', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [3]);
    calculateMaxLevel(0, 3, 'researchesExtra', true);
    calculateMaxLevel(4, 3, 'researchesExtra', true);
    if (player.stage.active === 3) { updateRankInfo(); }
};

export const shiftRange = (max = true) => {
    let value = 60;
    if (max) { return value; }

    if (player.strangeness[3][9] >= 1) { value /= 1.5 * player.strangeness[3][9]; }
    return value;
};

export const assignNewMassCap = () => {
    let value = player.accretion.input;
    const min = shiftRange(false);
    if (value < min || !isFinite(value)) {
        value = min;
    } else {
        const max = shiftRange();
        if (value > max) { value = max; }
    }

    global.inflationInfo.massCap = value;
};

const calculateMassGain = (): number => {
    const { elements } = player;

    let massGain = 0.004;
    if (elements[3] === 1) { massGain += 0.002; }
    if (elements[5] === 1) { massGain += 0.0002 * player.buildings[4][1].true; }
    if (global.strangeInfo.stageBoost[5] !== null && global.stageInfo.activeAll.includes(5)) { massGain *= global.strangeInfo.stageBoost[5]; }
    massGain *= elements[15] === 1 ? global.collapseInfo.trueStars : player.buildings[4][1].true;
    if (player.inflation.vacuum) {
        massGain = (massGain * 80) + 1;
    } else {
        if (elements[10] === 1) { massGain *= 2; }
        if (player.researchesExtra[4][1] >= 1) { massGain *= global.collapseInfo.effect4RE1(); }
        massGain *= global.collapseInfo.starEffect[2]();
    }
    return massGain;
};

export const assignCollapseInformation = () => {
    const building = player.buildings[4];
    const { starCheck } = global.collapseInfo;
    const { stars } = player.collapse;
    global.collapseInfo.newMass = !player.inflation.vacuum ? calculateMassGain() :
        Limit(global.buildingsInfo.producing[1][1]).multiply(global.inflationInfo.massCap).min(player.buildings[1][0].current).multiply('8.96499278339628e-67').toNumber(); //1.78266192e-33 / 1.98847e33
    starCheck[0] = building[2].true > 0 ? Math.max(building[2].true + Math.floor(building[1].true * player.strangeness[4][3] / 10) - stars[0], 0) : 0;
    starCheck[1] = Math.max(building[3].true - stars[1], 0);
    starCheck[2] = Math.max(building[4].true - stars[2], 0);
};

export const collapseResetCheck = (auto = false): boolean => {
    if (player.upgrades[4][0] < 1) { return false; }
    const info = global.collapseInfo;
    assignCollapseInformation();

    if (auto) {
        let enoughBoost;
        let toReset = true;
        if (player.strangeness[4][5] >= 2) {
            toReset = info.massEffect(true) / info.massEffect() >= player.collapse.input;
            enoughBoost = toReset || info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0;
        } else {
            if (player.strangeness[4][5] < 1) { return false; }
            const { starEffect } = info;
            enoughBoost = (info.massEffect(true) / info.massEffect()) * (starEffect[0](true) / starEffect[0]()) * (starEffect[1](true) / starEffect[1]()) * (starEffect[2](true) / starEffect[2]()) >= player.collapse.input;
        }
        let galaxyAfford = player.toggles.buildings[5][3] && player.strangeness[5][6] >= 2;
        if (galaxyAfford) {
            const galaxyCost = calculateBuildingsCost(3, 5);
            galaxyAfford = Limit(galaxyCost).moreThan(player.collapse.mass) && Limit(galaxyCost).lessOrEqual(info.newMass);
        }
        if (!galaxyAfford && !enoughBoost) { return false; }
        collapseReset(toReset);
        return true;
    }

    return info.newMass > player.collapse.mass || info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0 || player.elements.includes(0.5);
};

export const collapseAsyncReset = async() => {
    if (!collapseResetCheck()) { return; }
    const info = global.collapseInfo;

    if (player.toggles.confirm[4] !== 'None') {
        const active = player.stage.active;
        const unlockedG = info.newMass > player.collapse.mass && player.collapse.mass >= 1e5 && player.buildings[5][3].true > 0;
        const cantAfford = unlockedG ? Limit(calculateBuildingsCost(3, 5)).lessOrEqual(info.newMass) : true;
        if (player.toggles.confirm[4] !== 'Safe' || active !== 4 || (unlockedG && cantAfford)) {
            let message = active === 4 ? 'This will reset all researches and upgrades' : `Collapse attempt while inside '${global.stageInfo.word[active]}'`;
            if (info.newMass > player.collapse.mass) {
                message += `\nSolar mass will increase to ${format(info.newMass)}`;
                if (unlockedG) { message += `\n(${cantAfford ? 'Not enough for' : 'Will be able to make'} a new Galaxy)`; }
            } else { message += "\nTotal Solar mass won't change"; }
            if (player.elements.includes(0.5)) {
                let count = 0;
                for (let i = 1; i < player.elements.length; i++) {
                    if (player.elements[i] === 0.5) { count++; }
                }
                message += `\n${format(count)} new Elements will become active`;
            }
            if (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0) {
                message += '\nAlso will gain new Star remnants:';
                if (info.starCheck[0] > 0) { message += `\n'Red giants' - ${format(info.starCheck[0])}`; }
                if (info.starCheck[1] > 0) { message += `\n'Neutron stars' - ${format(info.starCheck[1])}`; }
                if (info.starCheck[2] > 0) { message += `\n'Black holes' - ${format(info.starCheck[2])}`; }
            }
            if (active !== 4) { message += '\nContinue?'; }

            if (!(await Confirm(message))) { return; }
            if (!collapseResetCheck()) { return Notify('Collapse canceled, requirements are no longer met'); }
        }
    }

    if (global.screenReader[0]) {
        let message = `Solar mass ${info.newMass > player.collapse.mass ? `is now ${format(info.newMass)}` : "haven't changed"}`;
        if (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0) {
            message += ', also gained';
            if (info.starCheck[0] > 0) { message += ` ${format(info.starCheck[0])} Red giants`; }
            if (info.starCheck[1] > 0) { message += `, ${format(info.starCheck[1])} Neutron stars`; }
            if (info.starCheck[2] > 0) { message += `, ${format(info.starCheck[2])} Black holes`; }
        }
        getId('SRMain').textContent = message;
    }
    collapseReset();
};

const collapseReset = (toReset = true) => {
    const { collapseInfo } = global;
    const { collapse } = player;

    if (player.elements.includes(0.5)) {
        for (let i = 1; i < player.elements.length; i++) {
            if (player.elements[i] === 0.5) { buyUpgrades(i, 4, 'elements', true); }
        }
    }

    if (collapseInfo.newMass > collapse.mass && toReset) {
        collapse.mass = collapseInfo.newMass;
        if (collapse.massMax < collapse.mass) { collapse.massMax = collapse.mass; }
    }
    collapse.stars[0] += collapseInfo.starCheck[0];
    collapse.stars[1] += collapseInfo.starCheck[1];
    collapse.stars[2] += collapseInfo.starCheck[2];
    awardMilestone(0, 4);
    awardMilestone(1, 4);
    awardVoidReward(4);
    if (toReset) {
        const resetThese = player.inflation.vacuum ? [1, 2, 3, 4, 5] : (player.strangeness[5][5] < 1 ? [4, 5] : [4]);
        reset('collapse', resetThese);
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(1, 4, 'researches');
        calculateMaxLevel(2, 4, 'researches');
    }
};

export const calculateInstability = () => {
    const { milestones } = player;
    let value = 0;
    if (milestones[1][0] >= 6) { value++; }
    if (milestones[2][1] >= 6) { value++; }
    if (milestones[3][1] >= 7) { value++; }
    if (milestones[4][1] >= 8) { value++; }
    if (milestones[5][1] >= 6) { value++; }
    global.strangeInfo.instability = value;
};

export const calculateMilestoneInformation = (index: number, stageIndex: number) => {
    const { need, reward } = global.milestonesInfo[stageIndex];
    const level = player.milestones[stageIndex][index];
    if (!player.inflation.vacuum) {
        const scaling = global.milestonesInfo[stageIndex].scalingOld[index];
        need[index] = level < scaling.length ? Limit(scaling[level]).toArray() : [0, 0];
    } else {
        if (stageIndex === 1) {
            if (index === 0) {
                need[0] = Limit('1e80').power(level).multiply('1e80').toArray();
                reward[0] = 1.04 ** level;
            } else if (index === 1) {
                need[1] = Limit(4e4 + 4e4 * level).toArray();
                reward[1] = 2 * level;
            }
        } else if (stageIndex === 2) {
            if (index === 0) {
                need[0] = Limit('1e1').power(level).multiply('1e1').toArray();
                reward[0] = 1.05 ** level;
            } else if (index === 1) {
                need[1] = Limit(80 + 80 * level).toArray();
                reward[1] = 1.02 ** level;
            }
        } else if (stageIndex === 3) {
            if (index === 0) {
                need[0] = Limit('1e3').power(level).multiply('1e-15').toArray();
                reward[0] = 1.04 ** level;
            } else if (index === 1) {
                need[1] = Limit(4 + 4 * level).toArray();
                reward[1] = level / 400;
            }
        } else if (stageIndex === 4) {
            if (index === 0) {
                need[0] = Limit('1e4').power(level).multiply('1e4').toArray();
                reward[0] = 1.06 ** level;
            } else if (index === 1) {
                need[1] = Limit(20 + 20 * level).toArray();
                reward[1] = 1.03 ** level;
            }
        } else if (stageIndex === 5) {
            if (index === 0) {
                need[0] = Limit(120 + 120 * level).toArray();
                reward[0] = 1.04 ** level;
            } else if (index === 1) {
                need[1] = Limit(2 + 2 * level).toArray();
                reward[1] = level / 40;
            }
        }
    }
};

const awardMilestone = (index: number, stageIndex: number, count = 0) => {
    if (!milestoneCheck(index, stageIndex)) {
        if (count > 0) {
            Notify(`Milestone '${global.milestonesInfo[stageIndex].name[index]}' ${count > 1 ? `${format(count)} new tiers` : 'new tier'} reached\nTotal is now: ${format(player.milestones[stageIndex][index])}`);
            if (player.inflation.vacuum) {
                if (stageIndex === 1) {
                    if (index === 1) {
                        assignEnergy();
                        awardMilestone(1, 1);
                    }
                }
            } else {
                player.strange[0].current += count;
                player.strange[0].total += count;
                calculateInstability();
                assignStrangeBoost();
            }
        }
        return;
    }

    player.milestones[stageIndex][index]++;
    calculateMilestoneInformation(index, stageIndex);
    awardMilestone(index, stageIndex, count + 1);
};

const awardVoidReward = (index: number) => {
    if (player.challenges.active !== 0) { return; }
    const old = player.challenges.void[index];

    let progress = 1;
    if (index === 1) {
        progress += player.researchesExtra[1][2];
    } else if (index === 2) {
        if (Limit(player.vaporization.clouds).moreThan('1e4')) { progress++; }
    } else if (index === 3) {
        progress = player.accretion.rank - 1;
    } else if (index === 4) {
        if (player.collapse.stars[0] > 1) { progress++; }
        if (player.collapse.stars[1] > 1) { progress++; }
        if (player.collapse.stars[2] > 1) { progress++; }
        //if (player.elements[26] === 1) { progress++; }
    }
    if (old >= progress) { return; }

    player.challenges.void[index] = progress;
    for (let i = old; i < progress; i++) {
        Notify(`New Void reward achieved\nReward: ${global.challengesInfo.rewardText[0][index][i]}`);
    }
    if (index === 3 && old < 4) {
        calculateMaxLevel(0, 1, 'strangeness', true);
        calculateMaxLevel(2, 1, 'strangeness', true);
        calculateMaxLevel(9, 1, 'strangeness', true);
        calculateMaxLevel(1, 2, 'strangeness', true);
        calculateMaxLevel(3, 2, 'strangeness', true);
        calculateMaxLevel(0, 3, 'strangeness', true);
        calculateMaxLevel(1, 3, 'strangeness', true);
        calculateMaxLevel(10, 3, 'strangeness', true);
        calculateMaxLevel(0, 4, 'strangeness', true);
        calculateMaxLevel(1, 4, 'strangeness', true);
    }
};

export const enterChallenge = async(index: number) => {
    if (player.challenges.active === index) {
        if (await Confirm(`Leave the '${global.challengesInfo.name[index]}'?`)) { exitChallenge(); }
        getChallengeDescription(index);
        return;
    }
    if (!player.inflation.vacuum) { return; }
    if (index === 0 && player.strangeness[5][0] < 1) { return; }
    if (!(await Confirm(`Enter the '${global.challengesInfo.name[index]}'?\nStage reset will be forced`))) { return; }
    const reward = stageResetCheck(5);

    player.challenges.active = index;
    if (!reward) {
        player.stage.time = 0;
        player.stage.active = 1;
        player.stage.current = 1;
        resetStage([1, 2, 3, 4, 5]);
    } else { stageResetReward(5); }

    getChallengeDescription(index);
    if (global.screenReader[0]) { getId('SRStage').textContent = `'${global.challengesInfo.name[index]}' is now active`; }
};

const exitChallenge = () => {
    player.challenges.active = -1;
    player.stage.time = 0;
    player.stage.active = 1;
    player.stage.current = 1;
    resetStage([1, 2, 3, 4, 5]);

    if (global.screenReader[0]) { getId('SRStage').textContent = 'Challenge is no longer active'; }
};
