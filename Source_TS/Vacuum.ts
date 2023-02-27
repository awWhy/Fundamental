import { getId } from './Main';
import { cloneArray, global, player, playerStart } from './Player';
import { reset } from './Reset';
import { Alert, AlertWait, Confirm, specialHTML } from './Special';
import { stageCheck } from './Update';

export const prepareVacuum = () => {
    if (player.inflation.vacuum) {
        const { buildings } = playerStart;
        const { buildingsInfo, stageInfo, strangenessInfo } = global;

        buildings[1][0].current = [5.476, -3];
        buildings[2][0].current = [0, 0];
        buildings[3][0].current = [0, 0];
        for (let s = 1; s <= 3; s++) {
            buildings[s][0].total = cloneArray(buildings[s][0].current);
            buildings[s][0].trueTotal = cloneArray(buildings[s][0].current);
            buildings[s][0].highest = cloneArray(buildings[s][0].current);
        }
        specialHTML.footerStatsHTML[1][0] = ['Energy%20mass.png', 'Energy mass', 'stage1borderImage cyanText', 'Mass'];
        buildingsInfo.maxActive = [0, 6, 7, 6, 6, 5];
        if (buildingsInfo.name[1][0] === 'Quarks') {
            specialHTML.buildingHTML[1].unshift(['Preon.png', 'Preon'], ['Quarks.png', 'Quarks']);
            buildingsInfo.name[1].unshift('Mass', 'Preons');
        }
        buildingsInfo.startCost[1] = [0, 0.005476, 6, 3, 24, 3];
        buildingsInfo.firstCost[1] = [0, 0.005476, 6, 3, 24, 3];
        global.dischargeInfo.energyType[1] = [0, 1, 3, 5, 10, 20];
        buildingsInfo.type[2][1] = 'improves';
        buildingsInfo.type[3][1] = 'improves';

        stageInfo.maxUpgrades = [0, 10, 7, 13, 4, 3];
        const upgrades1Cost = [32, 48, 60, 90, 150, 400, 1600, 4000, 32000, 100000];
        global.upgradesInfo[1].startCost.splice(0, upgrades1Cost.length, ...upgrades1Cost);
        global.upgradesInfo[2].startCost[0] = 10;

        stageInfo.maxResearches = [0, 6, 6, 8, 4, 2];
        const researches1Cost = [2500, 8000, 40000, 8000, 58000, 36000];
        const researches1Scaling = [500, 4000, 6000, 38000, 0, 8000];
        global.researchesInfo[1].startCost.splice(0, researches1Cost.length, ...researches1Cost);
        global.researchesInfo[1].scaling.splice(0, researches1Scaling.length, ...researches1Scaling);

        global.stageInfo.maxResearchesExtra = [0, 5, 4, 5, 2, 0];
        global.researchesExtraInfo[3].scaling[3] = 1e14;
        global.accretionInfo.rankCost[5] = 2.47e31;

        global.researchesAutoInfo.startCost[0] = 2000;
        global.ASRInfo.costRange[1] = [4000, 12000, 24000, 32000, 44000];

        const strangeness1Cost = [2, 1, 20, 40, 6, 1, 4, 8, 10];
        const strangeness1Scaling = [4, 3, 2, 1, 2, 1.5, 2, 2.5, 1];
        strangenessInfo[1].startCost.splice(0, strangeness1Cost.length, ...strangeness1Cost);
        strangenessInfo[1].scaling.splice(0, strangeness1Scaling.length, ...strangeness1Scaling);
        const strangeness2Cost = [1, 2, 4, 6, 20, 3, 1, 5, 20];
        const strangeness2Scaling = [1.6, 2.5, 3, 3.5, 1, 2.5, 1.8, 10, 1];
        strangenessInfo[2].startCost.splice(0, strangeness2Cost.length, ...strangeness2Cost);
        strangenessInfo[2].scaling.splice(0, strangeness2Scaling.length, ...strangeness2Scaling);
        const strangeness3Cost = [1, 1, 5, 20, 30, 4, 12, 30];
        const strangeness3Scaling = [1.46, 3, 2.5, 1, 1, 1.8, 3, 1];
        strangenessInfo[3].startCost.splice(0, strangeness3Cost.length, ...strangeness3Cost);
        strangenessInfo[3].scaling.splice(0, strangeness3Scaling.length, ...strangeness3Scaling);
        const strangeness4Cost = [1, 3, 5, 5, 108, 20, 5, 4, 80, 40];
        const strangeness4Scaling = [1.9, 2, 3, 4, 1, 1, 1.8, 1.6, 1, 1];
        strangenessInfo[4].startCost.splice(0, strangeness4Cost.length, ...strangeness4Cost);
        strangenessInfo[4].scaling.splice(0, strangeness4Scaling.length, ...strangeness4Scaling);
        const strangeness5Cost = [1e10, 10, 20, 5, 10, 40, 800, 40, 20];
        const strangeness5Scaling = [1, 1, 1, 1.9, 1.85, 1, 1.5, 2, 1];
        strangenessInfo[5].startCost.splice(0, strangeness5Cost.length, ...strangeness5Cost);
        strangenessInfo[5].scaling.splice(0, strangeness5Scaling.length, ...strangeness5Scaling);

        const stageWord = getId('stageWord') as HTMLSpanElement;
        stageWord.textContent = stageInfo.word[6];
        stageWord.style.color = stageInfo.textColor[6];
        getId('unknownStructures').style.display = 'none';
    } else {
        const { buildings } = playerStart;
        const { buildingsInfo, stageInfo, strangenessInfo } = global;

        specialHTML.footerStatsHTML[1][0] = ['Quarks.png', 'Quarks', 'stage1borderImage cyanText', 'Quarks'];
        buildings[1][0].current = [3, 0];
        buildings[2][0].current = [2.8, -3];
        buildings[3][0].current = [1, -19];
        for (let s = 1; s <= 3; s++) {
            buildings[s][0].total = cloneArray(buildings[s][0].current);
            buildings[s][0].trueTotal = cloneArray(buildings[s][0].current);
            buildings[s][0].highest = cloneArray(buildings[s][0].current);
        }
        if (buildingsInfo.name[1][0] !== 'Quarks') {
            specialHTML.buildingHTML[1].splice(0, 2);
            buildingsInfo.name[1].splice(0, 2);
        }
        buildingsInfo.maxActive = [0, 4, 6, 5, 5, 4];
        buildingsInfo.startCost[1] = [0, 3, 24, 3];
        buildingsInfo.firstCost[1] = [0, 3, 24, 3];
        global.dischargeInfo.energyType[1] = [0, 1, 5, 20];
        buildingsInfo.type[2][1] = 'producing';
        buildingsInfo.type[3][1] = 'producing';

        stageInfo.maxUpgrades = [0, 10, 7, 13, 4, 3];
        const upgrades1Cost = [0, 0, 9, 12, 36, 300, 800, 2000, 8000, 30000];
        global.upgradesInfo[1].startCost.splice(0, upgrades1Cost.length, ...upgrades1Cost);
        global.upgradesInfo[2].startCost[0] = 10000;

        stageInfo.maxResearches = [0, 6, 6, 8, 4, 2];
        const researches1Cost = [1000, 3000, 12000, 6000, 10000, 20000];
        const researches1Scaling = [500, 2000, 2000, 26000, 0, 5000];
        global.researchesInfo[1].startCost.splice(0, researches1Cost.length, ...researches1Cost);
        global.researchesInfo[1].scaling.splice(0, researches1Scaling.length, ...researches1Scaling);

        stageInfo.maxResearchesExtra = [0, 0, 3, 4, 2, 0];
        global.researchesExtraInfo[3].scaling[3] = 100;
        global.accretionInfo.rankCost[5] = 0;

        global.researchesAutoInfo.startCost[0] = 300;
        global.ASRInfo.costRange[1] = [4000, 12000, 20000];

        const strangeness1Cost = [1, 1, 2, 4, 4, 1, 2, 2, 10];
        const strangeness1Scaling = [1.5, 1, 3, 0, 2, 0.25, 2, 1.5, 0];
        strangenessInfo[1].startCost.splice(0, strangeness1Cost.length, ...strangeness1Cost);
        strangenessInfo[1].scaling.splice(0, strangeness1Scaling.length, ...strangeness1Scaling);
        const strangeness2Cost = [1, 2, 2, 1, 3, 2, 1, 3, 8];
        const strangeness2Scaling = [0.2, 0.5, 1.5, 2, 0, 1, 1.34, 2.5, 0];
        strangenessInfo[2].startCost.splice(0, strangeness2Cost.length, ...strangeness2Cost);
        strangenessInfo[2].scaling.splice(0, strangeness2Scaling.length, ...strangeness2Scaling);
        const strangeness3Cost = [1, 1, 3, 4, 3, 2, 5, 6];
        const strangeness3Scaling = [0.75, 1.5, 2.5, 0, 0, 1, 3.5, 0];
        strangenessInfo[3].startCost.splice(0, strangeness3Cost.length, ...strangeness3Cost);
        strangenessInfo[3].scaling.splice(0, strangeness3Scaling.length, ...strangeness3Scaling);
        const strangeness4Cost = [1, 1, 3, 2, 4, 3, 3, 2, 4, 4];
        const strangeness4Scaling = [1, 1.5, 1.5, 2, 0, 0, 1, 2.5, 0, 0];
        strangenessInfo[4].startCost.splice(0, strangeness4Cost.length, ...strangeness4Cost);
        strangenessInfo[4].scaling.splice(0, strangeness4Scaling.length, ...strangeness4Scaling);
        const strangeness5Cost = [120, 10, 20, 5, 10, 20, 800, 20, 40];
        const strangeness5Scaling = [60, 0, 0, 5, 10, 0, 400, 20, 0];
        strangenessInfo[5].startCost.splice(0, strangeness5Cost.length, ...strangeness5Cost);
        strangenessInfo[5].scaling.splice(0, strangeness5Scaling.length, ...strangeness5Scaling);
    }
};

export const switchVacuum = async() => {
    if (player.inflation.vacuum) { return Alert('This cannot be undone'); }
    const { milestones } = player;
    let count = 0;

    if (milestones[1][0] >= 5) { count++; }
    if (milestones[2][1] >= 4) { count++; }
    if (milestones[3][1] >= 5) { count++; }
    if (milestones[4][1] >= 5) { count++; }
    if (milestones[5][1] >= 8) { count++; }

    if (count < 5) { return Alert(`Universe is still stable. Vacuum state is false. ${5 - count} more`); }

    const ready = await Confirm('This will not be possible to undo. Are you ready?');
    if (!ready) { return; }

    await AlertWait('Universe is too unstable. Vacuum instability is imminent');
    getId('vacuumState').textContent = 'true';
    player.inflation.vacuum = true;
    player.stage.true = 6;
    player.stage.current = 1;
    player.stage.active = 1;
    prepareVacuum();
    reset('vacuum', []);
    stageCheck('reload');
};

export const updateUnknown = () => {
    const { milestones } = player;
    const div = getId('unknownStructures') as HTMLDivElement;

    div.style.display = milestones[1][0] >= 5 || milestones[2][1] >= 4 || milestones[3][1] >= 5 || milestones[4][1] >= 5 || milestones[5][1] >= 8 ? '' : 'none';

    let text = '<h4 class="darkvioletText">Unknown Structures:</h4>';
    if (milestones[1][0] >= 5) { text += '\n<img src="Used_art/Preon.png" alt="Unknown Structure" loading="lazy">'; }
    if (milestones[2][1] >= 4) { text += '\n<img src="Used_art/Ocean.png" alt="Unknown Structure" loading="lazy">'; }
    if (milestones[3][1] >= 5) { text += '\n<img src="Used_art/Subsatellite.png" alt="Unknown Structure" loading="lazy">'; }
    if (milestones[4][1] >= 5) { text += '\n<img src="Used_art/Quasi%20star.png" alt="Unknown Structure" loading="lazy">'; }
    if (milestones[5][1] >= 8) { text += '\n<img src="Used_art/Galaxy%20filament.png" alt="Unknown Structure" loading="lazy">'; }

    if (div.innerHTML === text) { return; }
    div.innerHTML = text;
};
