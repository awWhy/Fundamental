import { allowedToBeReset, checkTab } from './Check';
import { cloneArray, global, player, playerStart } from './Player';
import { autoResearchesSet, autoUpgradesSet, calculateMaxLevel, calculateResearchCost, assignBuildingInformation, autoElementsSet, assignMilestoneInformation, assignStrangeInfo, assignMaxRank, assignEnergyArray, assignPuddles } from './Stage';
import { numbersUpdate, setRemnants, stageUpdate, switchTab, visualUpdate, visualUpdateResearches, visualUpdateUpgrades } from './Update';

export const reset = (type: 'discharge' | 'vaporization' | 'rank' | 'collapse' | 'galaxy', stageIndex: number[]) => {
    const { dischargeInfo } = global;
    const { energyStage, energyType } = dischargeInfo;
    const { buildings, discharge } = player;

    if (type === 'galaxy') {
        const { elements } = player;

        for (let i = 1; i < playerStart.elements.length; i++) {
            if (!allowedToBeReset(i, 4, 'elements')) { continue; }

            elements[i] = 0;
            visualUpdateUpgrades(i, 4, 'elements');
        }
        autoElementsSet();

        global.collapseInfo.pointsLoop = 0;
        player.collapse.mass = 0.01235;
        player.collapse.stars = [0, 0, 0];
    }

    let energyRefund = 0;
    for (const s of stageIndex) {
        if (s === 2) {
            global.vaporizationInfo.trueResearch0 = 0;
            global.vaporizationInfo.trueResearch1 = 0;
            global.vaporizationInfo.trueResearchRain = 0;
        } else if (s === 4) {
            global.collapseInfo.trueStars = 0;
        }
        energyRefund += energyStage[s];
        energyStage[s] = 0;

        const building = buildings[s];
        building[0].current.setValue(playerStart.buildings[s][0].current);
        building[0].total.setValue(playerStart.buildings[s][0].current);
        for (let i = 1; i < global.buildingsInfo.maxActive[s]; i++) {
            if (!allowedToBeReset(i, s, 'structures')) {
                if (!player.inflation.vacuum) { continue; }
                const energy = energyType[s][i] * building[i as 1].true;
                energyStage[s] += energy;
                energyRefund -= energy;
                continue;
            }

            building[i as 1].true = 0;
            building[i].current.setValue('0');
            building[i].total.setValue('0');
        }

        if (type === 'discharge') { continue; }
        const upgrades = player.upgrades[s];

        for (let i = 0; i < global.upgradesInfo[s].maxActive; i++) {
            if (!allowedToBeReset(i, s, 'upgrades')) { continue; }

            upgrades[i] = 0;
            visualUpdateUpgrades(i, s, 'upgrades');
        }
        autoUpgradesSet(s);

        if (type === 'vaporization') { continue; }
        const researches = player.researches[s];

        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) {
            if (!allowedToBeReset(i, s, 'researches')) { continue; }

            researches[i] = 0;
            visualUpdateResearches(i, s, 'researches');
            calculateResearchCost(i, s, 'researches');
        }
        autoResearchesSet('researches', s);

        if (type === 'rank') { continue; }
        const researchesExtra = player.researchesExtra[s];

        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) {
            if (!allowedToBeReset(i, s, 'researchesExtra')) { continue; }

            researchesExtra[i] = 0;
            visualUpdateResearches(i, s, 'researchesExtra');
            calculateResearchCost(i, s, 'researchesExtra');
        }
        autoResearchesSet('researchesExtra', s);
        if (player.stage.active === 4) { setRemnants(); }
    }

    if (player.inflation.vacuum) {
        let deficit = dischargeInfo.energyTrue - discharge.energy - energyRefund;
        for (let s = 2; s <= 5; s++) {
            if (stageIndex.includes(s)) { continue; }
            const building = buildings[s];
            for (let i = global.buildingsInfo.maxActive[s] - 1; i >= 1; i--) {
                if (!allowedToBeReset(i, s, 'structures')) { continue; }

                if (deficit > 0) {
                    const max = Math.min(Math.ceil(deficit / energyType[s][i]), building[i as 1].true);
                    if (max > 0) {
                        building[i as 1].true -= max;
                        deficit -= max * energyType[s][i];
                        energyStage[s] -= max * energyType[s][i];
                        if (s === 4) { global.collapseInfo.trueStars -= max; }
                    }
                }
                building[i].current.setValue(building[i as 1].true);
                building[i].total.setValue(building[i as 1].true);
            }
            if (s !== 5) { //Stage 5 need to use trueStars (not included because its a fake stat)
                building[0].current.setValue(playerStart.buildings[s][0].current);
                building[0].total.setValue(playerStart.buildings[s][0].current);
            }
            if (s === 2) {
                global.vaporizationInfo.trueResearch0 = 0;
                global.vaporizationInfo.trueResearch1 = 0;
                global.vaporizationInfo.trueResearchRain = 0;
                assignPuddles();
            }
        }

        discharge.energy += deficit;
        dischargeInfo.energyTrue = discharge.energy;
    } else if (type === 'discharge') { //stageIndex.includes(1)
        discharge.energy = 0;
        dischargeInfo.energyTrue = 0;
    }

    assignBuildingInformation();
    if (!global.paused && stageIndex.includes(player.stage.active)) {
        visualUpdate();
        numbersUpdate();
    }
};

/** Default value for update is 'normal', default value for full is true and should be set to false only if Stage is permanent */
export const resetStage = (stageIndex: number[], update = 'normal' as false | 'normal' | 'soft', full = true) => {
    for (const s of stageIndex) {
        const buildings = player.buildings[s];
        const buildingResetValue = playerStart.buildings[s][0].current;
        buildings[0].current.setValue(buildingResetValue);
        buildings[0].total.setValue(buildingResetValue);
        buildings[0].trueTotal.setValue(buildingResetValue);
        if (s !== 6) {
            for (let i = 1; i < global.buildingsInfo.maxActive[s]; i++) {
                buildings[i as 1].true = 0;
                buildings[i].current.setValue('0');
                buildings[i].total.setValue('0');
                buildings[i].trueTotal.setValue('0');
            }
            global.dischargeInfo.energyStage[s] = 0;
        }

        player.upgrades[s] = cloneArray(playerStart.upgrades[s]);
        player.researches[s] = cloneArray(playerStart.researches[s]);
        player.researchesExtra[s] = cloneArray(playerStart.researchesExtra[s]);
        autoUpgradesSet(s);

        global.lastUpgrade[s][0] = null;
        if (s === 1) {
            if (player.strangeness[1][5] < 1) { player.ASR[1] = 0; }
            player.discharge.current = 0;
            player.discharge.energy = 0;
            global.dischargeInfo.energyTrue = 0;
        } else if (s === 2) {
            if (player.strangeness[2][5] < 1) { player.ASR[2] = 0; }
            player.vaporization.clouds.setValue('0');
        } else if (s === 3) {
            if (player.strangeness[3][5] < 1) { player.ASR[3] = 0; }
            if (player.inflation.vacuum) {
                player.accretion.rank = 1;
            } else {
                player.accretion.rank = 0;
                buildings[0].current.setValue('5.9722e27');
            }
        } else if (s === 4) {
            if (player.strangeness[4][5] < 1) { player.ASR[4] = 0; }
            global.collapseInfo.pointsLoop = 0;
            global.collapseInfo.trueStars = 0;
            player.collapse.mass = 0.01235;
            player.collapse.stars = [0, 0, 0];
            player.elements = cloneArray(playerStart.elements);
            player.elements[0] = player.strangeness[4][8] >= 1 ? 1 : 0;
            autoElementsSet();
            for (let i = 0; i < playerStart.elements.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
            global.lastElement = null;
        } else if (s === 5) {
            if (player.strangeness[5][5] < 1) { player.ASR[5] = 0; }
            player.merge.reward = [0];
            player.merge.resets = 0;
        }
    }
    if (player.stage.active === 4) { setRemnants(); }

    for (const s of stageIndex) { //Less errors if do it separatly
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researches'); }
        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }
        calculateMaxLevel(0, s, 'ASR');

        autoResearchesSet('researches', s);
        autoResearchesSet('researchesExtra', s);
    }
    if (full) {
        const { strangeness, researchesAuto } = player;
        player.time.stage = 0;
        player.stage.time = 0;
        player.stage.peak = 0;
        global.debug.timeLimit = false;
        researchesAuto[0] = strangeness[3][6];
        researchesAuto[1] = strangeness[4][6];
        if (player.inflation.vacuum) {
            researchesAuto[2] = strangeness[1][4] < 1 ? 0 : strangeness[3][4] < 1 ? 1 : strangeness[2][4] < 1 ? 2 : strangeness[4][4] < 1 ? 3 : 4;
            for (let i = 0; i < playerStart.researchesAuto.length; i++) { visualUpdateResearches(i, 0, 'researchesAuto'); }
        } else {
            researchesAuto[2] = strangeness[Math.min(player.stage.current, 4)][4] >= 1 ? 1 : 0;
            visualUpdateResearches(2, 0, 'researchesAuto');
        }
    }

    assignBuildingInformation();
    if (update !== false) {
        switchTab(checkTab(global.tab) ? global.tab : 'stage'); //Update subtab list
        stageUpdate(update, true);
        if (update === 'soft') {
            const active = player.stage.active;
            for (let i = 0; i < global.upgradesInfo[active].maxActive; i++) { visualUpdateUpgrades(i, active, 'upgrades'); }
        }
    }
};

export const resetVacuum = () => {
    const activeMilestone = global.milestonesInfoS6.active;
    for (let s = 1; s <= 6; s++) {
        const buildings = player.buildings[s];
        const buildingResetValue = playerStart.buildings[s][0].current;
        buildings[0].current.setValue(buildingResetValue);
        buildings[0].total.setValue(buildingResetValue);
        buildings[0].trueTotal.setValue(buildingResetValue);
        if (s !== 6) {
            for (let i = 1; i < playerStart.buildings[s].length; i++) {
                buildings[i as 1].true = 0;
                buildings[i].current.setValue('0');
                buildings[i].total.setValue('0');
                buildings[i].trueTotal.setValue('0');
            }
            global.dischargeInfo.energyStage[s] = 0;
            player.strangeness[s] = cloneArray(playerStart.strangeness[s]);
            player.milestones[s] = cloneArray(playerStart.milestones[s]);
            player.ASR[s] = 0;
        }

        player.upgrades[s] = cloneArray(playerStart.upgrades[s]);
        player.researches[s] = cloneArray(playerStart.researches[s]);
        player.researchesExtra[s] = cloneArray(playerStart.researchesExtra[s]);
    }
    player.researchesAuto = cloneArray(playerStart.researchesAuto);

    //Stage 1
    player.discharge.energy = 0;
    player.discharge.energyMax = 0;
    player.discharge.current = 0;
    global.dischargeInfo.energyTrue = 0;

    //Stage 2
    player.vaporization.clouds.setValue('0');
    player.vaporization.cloudsMax.setValue('0');

    //Stage 3
    if (player.inflation.vacuum) {
        player.accretion.rank = 1;
    } else {
        player.accretion.rank = 0;
        player.buildings[3][0].current.setValue('5.9722e27');
    }

    //Stage 4
    global.collapseInfo.pointsLoop = 0;
    global.collapseInfo.trueStars = 0;
    player.collapse.mass = 0.01235;
    player.collapse.massMax = 0.01235;
    player.collapse.stars = [0, 0, 0];
    player.elements = cloneArray(playerStart.elements);

    //Stage 5 and Strangeness
    player.merge.resets = 0;
    player.merge.reward = [0];
    player.challenges.void = cloneArray(playerStart.challenges.void);
    player.challenges.active = null;
    global.historyStorage.stage = [];
    player.history.stage.best = [3.1556952e16, 0, 0, 0];
    global.strangeInfo.bestHistoryRate = 0;
    player.stage.current = 1;
    player.stage.resets = 0;
    player.stage.peak = 0;
    player.stage.time = 0;
    player.time.stage = 0;
    for (let i = 0; i < playerStart.strange.length; i++) {
        player.time.export[i + 1] = 0;
        player.strange[i].current = 0;
        player.strange[i].total = 0;
    }

    if (activeMilestone[0]) {
        player.strange[0].current = player.buildings[6][1].true;
        player.strange[0].total = player.buildings[6][1].true;
        player.strangeness[1][8] = 2;
    }
    if (activeMilestone[1]) { player.strangeness[5][4] = 1; }
    if (activeMilestone[2]) {
        player.strangeness[3][6] = 3;
        player.strangeness[4][6] = 2;
        player.researchesAuto[0] = 3;
        player.researchesAuto[1] = 2;
    }

    assignBuildingInformation();
    assignStrangeInfo[1]();
    assignStrangeInfo[0]();
    assignMaxRank();
    assignEnergyArray();
    for (let s = 1; s <= 5; s++) {
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researches'); }
        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }
        calculateMaxLevel(0, s, 'ASR');
        if (activeMilestone[1]) {
            player.ASR[s] = global.ASRInfo.max[s];
            player.strangeness[s][5] = 1;
        }
        for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'strangeness'); }
        for (let i = 0; i < playerStart.milestones[s].length; i++) { assignMilestoneInformation(i, s); }
    }
    for (let i = 0; i < playerStart.researchesAuto.length; i++) { calculateMaxLevel(i, 0, 'researchesAuto'); }
    autoUpgradesSet('all');
    autoResearchesSet('researches', 'all');
    autoResearchesSet('researchesExtra', 'all');
    autoElementsSet();

    stageUpdate('reload', true);
};
