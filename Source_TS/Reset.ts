import { allowedToBeReset } from './Check';
import { cloneArray, global, player, playerStart } from './Player';
import { autoResearchesSet, autoUpgradesSet, calculateMaxLevel, calculateResearchCost, assignBuildingInformation, autoElementsSet, assignEnergy, calculateMilestoneInformation, assignStrangeBoost } from './Stage';
import { numbersUpdate, stageUpdate, visualUpdate, visualUpdateResearches, visualUpdateUpgrades } from './Update';

export const reset = (type: 'discharge' | 'vaporization' | 'rank' | 'collapse' | 'galaxy', stageIndex: number[]) => {
    if (type === 'galaxy') {
        const { elements } = player;

        for (let i = 1; i < elements.length; i++) {
            if (!allowedToBeReset(i, 4, 'elements')) { continue; }

            elements[i] = 0;
            visualUpdateUpgrades(i, 4, 'elements');
        }
        autoElementsSet();

        player.collapse.mass = 0.01235;
        player.collapse.stars = [0, 0, 0];
    }

    for (const s of stageIndex) {
        if (s === 2) {
            global.vaporizationInfo.research0 = 0;
            global.vaporizationInfo.research1 = 0;
        } else if (s === 4) {
            global.collapseInfo.trueStars = 0;
        }

        const buildings = player.buildings[s];
        buildings[0].current = cloneArray(playerStart.buildings[s][0].current);
        buildings[0].total = cloneArray(playerStart.buildings[s][0].total);
        for (let i = 1; i < global.buildingsInfo.maxActive[s]; i++) {
            if (!allowedToBeReset(i, s, 'structures')) { continue; }

            buildings[i as 1].true = 0;
            buildings[i].current = [0, 0];
            buildings[i].total = [0, 0];
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
    }

    if (player.inflation.vacuum || type === 'discharge') {
        if (player.strangeness[1][11] < 1) {
            const startEnergy = 0;
            player.discharge.energy = startEnergy;
            global.dischargeInfo.energyTrue = startEnergy;
        } else { assignEnergy(); }
    }

    assignBuildingInformation();
    if (stageIndex.includes(player.stage.active)) { numbersUpdate(); }
    visualUpdate();
};

export const resetStage = (stageIndex: number[], update = 'normal' as false | 'normal' | 'soft') => {
    for (const s of stageIndex) {
        const buildings = player.buildings[s];
        const buildingsStart = playerStart.buildings[s];

        for (let i = 1; i < global.buildingsInfo.maxActive[s]; i++) {
            buildings[i as 1].true = 0;
            buildings[i].current = [0, 0];
            buildings[i].total = [0, 0];
            buildings[i].trueTotal = [0, 0];
        }
        buildings[0].current = cloneArray(buildingsStart[0].current);
        buildings[0].total = cloneArray(buildingsStart[0].total);
        buildings[0].trueTotal = cloneArray(buildingsStart[0].trueTotal);

        player.upgrades[s] = cloneArray(playerStart.upgrades[s]);
        player.researches[s] = cloneArray(playerStart.researches[s]);
        player.researchesExtra[s] = cloneArray(playerStart.researchesExtra[s]);
        player.ASR[s] = player.strangeness[s][[6, 5, 5, 6, 7][s - 1]];
        autoUpgradesSet(s);

        global.lastUpgrade[s][0] = -1;
        if (s === 1) {
            player.discharge.current = 0;
            player.discharge.energy = 0;
            global.dischargeInfo.energyTrue = 0;
        } else if (s === 2) {
            player.vaporization.clouds = [0, 0];
            global.vaporizationInfo.research0 = 0;
            global.vaporizationInfo.research1 = 0;
        } else if (s === 3) {
            if (player.inflation.vacuum) {
                player.accretion.rank = 1;
            } else {
                player.accretion.rank = 0;
                buildings[0].current = [5.9722, 27];
            }
        } else if (s === 4) {
            global.collapseInfo.trueStars = 0;
            player.collapse.mass = 0.01235;
            player.collapse.stars = [0, 0, 0];
            player.elements = cloneArray(playerStart.elements);
            player.elements[0] = player.strangeness[4][10] >= 1 ? 1 : 0;
            autoElementsSet();
            for (let i = 0; i < player.elements.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
            global.lastElement = -1;
        } else if (s === 5) {
            if (player.strangeness[5][6] >= 2) { player.ASR[5]++; }
        }
    }
    player.researchesAuto[0] = player.strangeness[3][6];
    player.researchesAuto[1] = player.strangeness[1][7] >= 1 ? 1 : 0;

    for (let i = 0; i < playerStart.researchesAuto.length; i++) { calculateMaxLevel(i, 0, 'researchesAuto'); }
    for (const s of stageIndex) { //Less errors if do it separatly
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researches'); }
        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }
        calculateMaxLevel(0, s, 'ASR');

        autoResearchesSet('researches', s);
        autoResearchesSet('researchesExtra', s);
    }

    assignBuildingInformation();

    if (update !== false) {
        stageUpdate(update);
        if (update === 'soft') {
            const active = player.stage.active;
            for (let i = 0; i < global.upgradesInfo[active].maxActive; i++) { visualUpdateUpgrades(i, active, 'upgrades'); }
        }
    }
};

export const resetVacuum = () => {
    for (let s = 1; s <= 5; s++) {
        const buildings = player.buildings[s];
        const buildingsStart = playerStart.buildings[s];

        for (let i = 1; i < buildingsStart.length; i++) {
            buildings[i as 1].true = 0;
            buildings[i].current = [0, 0];
            buildings[i].total = [0, 0];
            buildings[i].trueTotal = [0, 0];
            buildings[i].highest = [0, 0];
        }
        buildings[0].current = cloneArray(buildingsStart[0].current);
        buildings[0].total = cloneArray(buildingsStart[0].total);
        buildings[0].trueTotal = cloneArray(buildingsStart[0].trueTotal);
        buildings[0].highest = cloneArray(buildingsStart[0].highest);

        player.upgrades[s] = cloneArray(playerStart.upgrades[s]);
        player.researches[s] = cloneArray(playerStart.researches[s]);
        player.researchesExtra[s] = cloneArray(playerStart.researchesExtra[s]);
        player.strangeness[s] = cloneArray(playerStart.strangeness[s]);
        player.milestones[s] = cloneArray(playerStart.milestones[s]);
        player.ASR[s] = 0;
    }
    for (let i = 0; i < playerStart.researchesAuto.length; i++) {
        player.researchesAuto[i] = 0;
        calculateMaxLevel(i, 0, 'researchesAuto');
    }

    //Stage 1
    player.discharge.energy = 0;
    player.discharge.energyMax = 0;
    player.discharge.current = 0;
    global.dischargeInfo.energyTrue = 0;

    //Stage 2
    player.vaporization.clouds = [0, 0];
    player.vaporization.cloudsMax = [0, 0];
    global.vaporizationInfo.research0 = 0;
    global.vaporizationInfo.research1 = 0;

    //Stage 3
    if (player.inflation.vacuum) {
        player.accretion.rank = 1;
    } else {
        player.accretion.rank = 0;
        player.buildings[3][0].current = [5.9722, 27];
    }

    //Stage 4
    global.collapseInfo.trueStars = 0;
    player.collapse.mass = 0.01235;
    player.collapse.massMax = 0.01235;
    player.collapse.stars = [0, 0, 0];
    player.collapse.show = 0;
    player.elements = cloneArray(playerStart.elements);

    //Stage 5 and rest
    global.historyStorage.stage = [];
    player.history.stage.best = [0, 1, 0];
    player.stage.resets = 0;
    player.stage.best = 0;
    player.stage.time = 0;
    player.time.stage = 0;
    for (let i = 0; i < player.strange.length; i++) {
        player.strange[i].current = 0;
        player.strange[i].total = 0;
    }

    assignStrangeBoost();
    for (let s = 1; s <= 5; s++) {
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researches'); }
        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }
        calculateMaxLevel(0, s, 'ASR');
    }
    for (let s = 1; s < playerStart.strangeness.length; s++) {
        for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) {
            calculateMaxLevel(i, s, 'strangeness');
        }
    }
    for (let s = 1; s < playerStart.milestones.length; s++) {
        for (let i = 0; i < playerStart.milestones[s].length; i++) {
            calculateMilestoneInformation(i, s);
        }
    }

    stageUpdate('reload');
};
