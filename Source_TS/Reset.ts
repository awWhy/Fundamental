import { allowedToBeReset } from './Check';
import { cloneArray, global, player, playerStart } from './Player';
import { autoResearchesSet, autoUpgradesSet, calculateMaxLevel, calculateResearchCost, assignBuildingInformation, autoElementsSet, calculateMilestoneInformation, assignStrangeBoost, assignMaxRank, assignEnergyArray } from './Stage';
import { numbersUpdate, setRemnants, stageUpdate, visualUpdate, visualUpdateResearches, visualUpdateUpgrades } from './Update';

export const reset = (type: 'discharge' | 'vaporization' | 'rank' | 'collapse' | 'galaxy', stageIndex: number[]) => {
    if (type === 'galaxy') {
        const { elements } = player;

        for (let i = 1; i < playerStart.elements.length; i++) {
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
        buildings[0].current.setValue(playerStart.buildings[s][0].current);
        buildings[0].total.setValue(playerStart.buildings[s][0].current);
        for (let i = 1; i < global.buildingsInfo.maxActive[s]; i++) {
            if (!allowedToBeReset(i, s, 'structures')) { continue; }

            buildings[i as 1].true = 0;
            buildings[i].current.setValue('0');
            buildings[i].total.setValue('0');
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
        setRemnants();
    }

    if (player.inflation.vacuum) {
        const startEnergy = global.dischargeInfo.energyType[5][3] * player.buildings[5][3].true;
        player.discharge.energy = startEnergy;
        global.dischargeInfo.energyTrue = startEnergy;
    } else if (type === 'discharge') {
        player.discharge.energy = 0;
        global.dischargeInfo.energyTrue = 0;
    }

    assignBuildingInformation();
    if (stageIndex.includes(player.stage.active)) { numbersUpdate(); }
    visualUpdate();
};

export const resetStage = (stageIndex: number[], update = 'normal' as false | 'normal' | 'soft') => {
    for (const s of stageIndex) {
        const buildings = player.buildings[s];
        const buildingResetValue = playerStart.buildings[s][0].current;

        for (let i = 1; i < global.buildingsInfo.maxActive[s]; i++) {
            buildings[i as 1].true = 0;
            buildings[i].current.setValue('0');
            buildings[i].total.setValue('0');
            buildings[i].trueTotal.setValue('0');
        }
        buildings[0].current.setValue(buildingResetValue);
        buildings[0].total.setValue(buildingResetValue);
        buildings[0].trueTotal.setValue(buildingResetValue);

        player.upgrades[s] = cloneArray(playerStart.upgrades[s]);
        player.researches[s] = cloneArray(playerStart.researches[s]);
        player.researchesExtra[s] = cloneArray(playerStart.researchesExtra[s]);
        autoUpgradesSet(s);

        global.lastUpgrade[s][0] = -1;
        if (s === 1) {
            if (player.strangeness[1][5] < 1) { player.ASR[1] = 0; }
            player.discharge.current = 0;
            player.discharge.energy = 0;
            global.dischargeInfo.energyTrue = 0;
        } else if (s === 2) {
            if (player.strangeness[2][5] < 1) { player.ASR[2] = 0; }
            player.vaporization.clouds.setValue('0');
            global.vaporizationInfo.research0 = 0;
            global.vaporizationInfo.research1 = 0;
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
            global.collapseInfo.trueStars = 0;
            player.collapse.mass = 0.01235;
            player.collapse.stars = [0, 0, 0];
            player.elements = cloneArray(playerStart.elements);
            player.elements[0] = player.strangeness[4][8] >= 1 ? 1 : 0;
            autoElementsSet();
            for (let i = 0; i < playerStart.elements.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
            global.lastElement = -1;
        } else if (s === 5) {
            if (player.strangeness[5][6] < 1) { player.ASR[5] = 0; }
        }
    }
    player.researchesAuto[0] = player.strangeness[3][6];
    for (let i = 0; i < playerStart.researchesAuto.length; i++) { visualUpdateResearches(i, 0, 'researchesAuto'); }
    setRemnants();

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
        const buildingResetValue = playerStart.buildings[s][0].current;

        for (let i = 1; i < playerStart.buildings[s].length; i++) {
            buildings[i as 1].true = 0;
            buildings[i].current.setValue('0');
            buildings[i].total.setValue('0');
            buildings[i].trueTotal.setValue('0');
            buildings[i].highest.setValue('0');
        }
        buildings[0].current.setValue(buildingResetValue);
        buildings[0].total.setValue(buildingResetValue);
        buildings[0].trueTotal.setValue(buildingResetValue);
        buildings[0].highest.setValue(buildingResetValue);

        player.upgrades[s] = cloneArray(playerStart.upgrades[s]);
        player.researches[s] = cloneArray(playerStart.researches[s]);
        player.researchesExtra[s] = cloneArray(playerStart.researchesExtra[s]);
        player.strangeness[s] = cloneArray(playerStart.strangeness[s]);
        player.milestones[s] = cloneArray(playerStart.milestones[s]);
        player.ASR[s] = 0;
    }
    for (let i = 0; i < playerStart.researchesAuto.length; i++) {
        player.researchesAuto[i] = 0;
        visualUpdateResearches(i, 0, 'researchesAuto');
    }

    //Stage 1
    player.discharge.energy = 0;
    player.discharge.energyMax = 0;
    player.discharge.current = 0;
    global.dischargeInfo.energyTrue = 0;

    //Stage 2
    player.vaporization.clouds.setValue('0');
    player.vaporization.cloudsMax.setValue('0');
    global.vaporizationInfo.research0 = 0;
    global.vaporizationInfo.research1 = 0;

    //Stage 3
    if (player.inflation.vacuum) {
        player.accretion.rank = 1;
    } else {
        player.accretion.rank = 0;
        player.buildings[3][0].current.setValue('5.9722e27');
    }

    //Stage 4
    global.collapseInfo.trueStars = 0;
    player.collapse.mass = 0.01235;
    player.collapse.massMax = 0.01235;
    player.collapse.stars = [0, 0, 0];
    player.elements = cloneArray(playerStart.elements);

    //Stage 5 and rest
    global.historyStorage.stage = [];
    player.history.stage.best = [1, 0, 0, 0];
    player.stage.resets = 0;
    player.stage.peak = 0;
    player.stage.time = 0;
    player.time.stage = 0;
    for (let i = 0; i < playerStart.strange.length; i++) {
        player.time.export[i + 1] = 0;
        player.strange[i].current = 0;
        player.strange[i].total = 0;
    }

    assignBuildingInformation();
    assignStrangeBoost();
    assignMaxRank();
    assignEnergyArray();
    for (let s = 1; s <= 5; s++) {
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researches'); }
        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }
        calculateMaxLevel(0, s, 'ASR');
        for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'strangeness'); }
        for (let i = 0; i < playerStart.milestones[s].length; i++) { calculateMilestoneInformation(i, s); }
    }

    stageUpdate('reload');
};
