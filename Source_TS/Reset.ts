import { allowedToBeReset } from './Check';
import { cloneArray, global, player, playerStart } from './Player';
import { autoResearchesSet, autoUpgradesSet, calculateMaxLevel, calculateResearchCost, assignBuildingInformation, autoElementsSet, assignEnergy, assignNewMassCap } from './Stage';
import { numbersUpdate, updateRankInfo, visualUpdate, visualUpdateUpgrades } from './Update';

export const reset = (type: 'discharge' | 'vaporization' | 'rank' | 'collapse' | 'galaxy', stageIndex: number[]) => {
    if (type === 'discharge' || player.inflation.vacuum) { player.discharge.energy = 0; }
    if (stageIndex.includes(4)) { global.collapseInfo.trueStars = 0; }
    if (type === 'galaxy') {
        if (!player.inflation.vacuum) { player.collapse.disabled = true; }
        player.collapse.mass = 0.01235;
        player.collapse.stars = [0, 0, 0];
    }

    if ((type === 'collapse' && !player.inflation.vacuum && player.strangeness[4][4] < 1) || type === 'galaxy') {
        const { elements } = player;

        for (let i = 1; i < elements.length; i++) {
            elements[i] = 0;
            visualUpdateUpgrades(i, 4, 'elements');
        }
        autoElementsSet();
    }

    for (const s of stageIndex) {
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
        autoUpgradesSet(s); //As of now upgrades/researches cost is always same

        if (type === 'vaporization') { continue; }
        const researches = player.researches[s];

        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) {
            if (!allowedToBeReset(i, s, 'researches')) { continue; }

            researches[i] = 0;
            visualUpdateUpgrades(i, s, 'researches');
            calculateResearchCost(i, s, 'researches');
        }
        autoResearchesSet('researches', s);

        if (type === 'rank') { continue; }
        const researchesExtra = player.researchesExtra[s];

        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) {
            if (!allowedToBeReset(i, s, 'researchesExtra')) { continue; }

            researchesExtra[i] = 0;
            visualUpdateUpgrades(i, s, 'researchesExtra');
            calculateResearchCost(i, s, 'researchesExtra');
        }
        autoResearchesSet('researchesExtra', s);
    }

    assignEnergy();
    assignBuildingInformation();
    if (stageIndex.includes(player.stage.active)) { numbersUpdate(); }
    visualUpdate();
};

export const resetStage = (stageIndex: number[]) => {
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

        if (s === 1) {
            player.discharge.unlock = false;
            player.discharge.energy = 0;
            player.discharge.current = 0;
        } else if (s === 2) {
            player.vaporization.clouds = [1, 0];
        } else if (s === 3) {
            if (!player.inflation.vacuum) {
                player.accretion.rank = 0;
                buildings[0].current = [5.97, 27];
            } else {
                player.accretion.rank = 1;
            }
            updateRankInfo();
        } else if (s === 4) {
            const { collapse } = player;

            player.stage.time = 0;
            global.collapseInfo.trueStars = 0;
            collapse.elementsMax = [1, 0];
            collapse.mass = 0.01235;
            collapse.stars = [0, 0, 0];
            if (!player.inflation.vacuum) {
                collapse.disabled = false;
                collapse.show = [];
            }
            player.elements = cloneArray(playerStart.elements);
            autoElementsSet();
            if (player.stage.active === 4) {
                for (let i = 1; i < playerStart.elements.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
            }
        }

        player.ASR[s] = player.strangeness[s][[6, 5, 5, 6, 7][s - 1]];
        if (s === 5 && player.strangeness[5][6] >= 2) { player.ASR[5]++; }
        calculateMaxLevel(0, s, 'ASR');

        autoUpgradesSet(s);
        autoResearchesSet('researches', s);
        autoResearchesSet('researchesExtra', s);

        if (player.stage.active === s) {
            for (let i = 0; i < global.upgradesInfo[s].maxActive; i++) { visualUpdateUpgrades(i, s, 'upgrades'); }
        }
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researches'); }
        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }
    }

    assignEnergy();
    assignBuildingInformation();
};

export const resetVacuum = () => {
    const { collapse } = player;

    //Stage 1
    player.discharge.unlock = false;
    player.discharge.energy = 0;
    player.discharge.energyMax = 0;
    player.discharge.current = 0;

    //Stage 2
    player.vaporization.clouds = [1, 0];
    player.vaporization.cloudsMax = [1, 0];

    //Stage 3
    player.accretion.rank = 1;
    assignNewMassCap(player.accretion.input);

    //Stage 4
    global.collapseInfo.trueStars = 0;
    collapse.elementsMax = [0, 0];
    collapse.mass = 0.01235;
    collapse.massMax = 0.01235;
    collapse.stars = [0, 0, 0];
    collapse.show = [];
    collapse.disabled = false;
    player.elements = cloneArray(playerStart.elements);

    //Stage 5 and rest
    player.researchesAuto = cloneArray(playerStart.researchesAuto);
    player.strange[0].current = 0;
    player.strange[0].total = 0;
    player.time.offline = Math.min(player.time.offline, 28800);
    player.stage.resets = 0;
    player.stage.best = 0;
    player.stage.time = 0;

    for (const s of [1, 2, 3, 4, 5]) {
        const buildings = player.buildings[s];

        for (let i = 0; i < playerStart.buildings[s].length; i++) {
            if (i >= 1) { buildings[i as 1].true = 0; }
            buildings[i].current = [0, 0];
            buildings[i].total = [0, 0];
            buildings[i].trueTotal = [0, 0];
            buildings[i].highest = [0, 0];
        }

        player.upgrades[s] = cloneArray(playerStart.upgrades[s]);
        player.researches[s] = cloneArray(playerStart.researches[s]);
        player.researchesExtra[s] = cloneArray(playerStart.researchesExtra[s]);
        player.strangeness[s] = cloneArray(playerStart.strangeness[s]);
        player.milestones[s] = cloneArray(playerStart.milestones[s]);
        player.ASR[s] = 0;

        if (s !== 1) { //stageCheck('reload') will only do it for Stage 1
            calculateMaxLevel(0, s, 'ASR');
            for (let i = 0; i < global.researchesInfo[s].startCost.length; i++) { calculateMaxLevel(i, s, 'researches'); }
            for (let i = 0; i < global.researchesExtraInfo[s].startCost.length; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }
        }
    }

    //Post
    const building = player.buildings[1][0];

    building.current = [5.476, -3];
    building.total = [5.476, -3];
    building.trueTotal = [5.476, -3];
    building.highest = [5.476, -3];
};
