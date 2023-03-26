import { getClass, getId } from './Main';
import { cloneArray, global, player, playerStart } from './Player';
import { resetVacuum } from './Reset';
import { Alert, AlertWait, Confirm, specialHTML } from './Special';
import { stageCheck } from './Update';

export const prepareVacuum = () => {
    const { buildings } = playerStart;
    const { buildingsInfo, upgradesInfo, researchesInfo, researchesExtraInfo, strangenessInfo } = global;

    if (player.inflation.vacuum) {
        specialHTML.footerStatsHTML[1][0] = ['Energy%20mass.png', 'Energy mass', 'stage1borderImage cyanText', 'Mass'];
        buildings[1][0].current = [5.476, -3];
        buildings[2][0].current = [0, 0];
        buildings[3][0].current = [0, 0];
        const maxBuildings = [6, 7, 6, 6, 5];
        buildingsInfo.maxActive.splice(1, maxBuildings.length, ...maxBuildings);
        if (buildingsInfo.name[1][0] !== 'Mass') {
            specialHTML.buildingHTML[1].unshift(['Preon.png', 'Preon'], ['Quarks.png', 'Quarks']);
            buildingsInfo.name[1].unshift('Mass', 'Preons');
        }
        buildingsInfo.startCost[1] = [0, 0.005476, 6, 3, 24, 3];
        buildingsInfo.firstCost[1] = [0, 0.005476, 6, 3, 24, 3];
        global.dischargeInfo.energyType[1] = [0, 1, 3, 5, 10, 20];
        buildingsInfo.type[2][1] = 'improves';
        buildingsInfo.type[3][1] = 'improves';
        buildingsInfo.increase[5][1] = 4;
        buildingsInfo.increase[5][2] = 4;

        const upgrades1Cost = [32, 48, 60, 90, 150, 400, 1600, 4000, 32000, 100000];
        upgradesInfo[1].startCost.splice(0, upgrades1Cost.length, ...upgrades1Cost);
        upgradesInfo[2].startCost[0] = 10;
        //upgradesInfo[1].maxActive = 10;
        //upgradesInfo[2].maxActive = 7;
        //upgradesInfo[3].maxActive = 13;
        //upgradesInfo[4].maxActive = 4;
        //upgradesInfo[5].maxActive = 3;

        const researches1Cost = [2500, 8000, 40000, 8000, 58000, 36000];
        const researches1Scaling = [500, 4000, 6000, 38000, 0, 8000];
        researchesInfo[1].startCost.splice(0, researches1Cost.length, ...researches1Cost);
        researchesInfo[1].scaling.splice(0, researches1Scaling.length, ...researches1Scaling);
        //researchesInfo[1].maxActive = 6;
        //researchesInfo[2].maxActive = 6;
        //researchesInfo[3].maxActive = 8;
        //researchesInfo[4].maxActive = 4;
        //researchesInfo[5].maxActive = 2;

        researchesExtraInfo[3].scaling[3] = 1e14;
        researchesExtraInfo[1].maxActive = 5;
        researchesExtraInfo[2].maxActive = 4;
        researchesExtraInfo[3].maxActive = 5;
        //esearchesExtraInfo[4].maxActive = 2;
        //researchesExtraInfo[5].maxActive = 0;

        global.accretionInfo.rankCost[5] = 2.47e31;
        global.researchesAutoInfo.startCost[0] = 2000;
        global.ASRInfo.costRange[1] = [4000, 12000, 24000, 32000, 44000];

        const strangeness1Cost = [2, 1, 20, 40, 2, 1, 2, 4, 20];
        const strangeness1Scaling = [3, 3, 2, 1, 3, 1.4, 1.8, 3, 1];
        strangenessInfo[1].startCost.splice(0, strangeness1Cost.length, ...strangeness1Cost);
        strangenessInfo[1].scaling.splice(0, strangeness1Scaling.length, ...strangeness1Scaling);
        const strangeness2Cost = [1, 2, 3, 4, 20, 4, 1, 4, 30];
        const strangeness2Scaling = [1.5, 2, 3, 3, 1, 1.6, 1.6, 4, 1];
        strangenessInfo[2].startCost.splice(0, strangeness2Cost.length, ...strangeness2Cost);
        strangenessInfo[2].scaling.splice(0, strangeness2Scaling.length, ...strangeness2Scaling);
        const strangeness3Cost = [1, 2, 6, 18, 30, 3, 10, 20];
        const strangeness3Scaling = [1.46, 2.5, 2, 1, 1, 1.8, 3, 1];
        strangenessInfo[3].startCost.splice(0, strangeness3Cost.length, ...strangeness3Cost);
        strangenessInfo[3].scaling.splice(0, strangeness3Scaling.length, ...strangeness3Scaling);
        const strangeness4Cost = [1, 3, 5, 5, 90, 20, 4, 4, 24, 40];
        const strangeness4Scaling = [1.8, 2, 3, 4, 1, 1, 1.8, 1.8, 1, 1];
        strangenessInfo[4].startCost.splice(0, strangeness4Cost.length, ...strangeness4Cost);
        strangenessInfo[4].scaling.splice(0, strangeness4Scaling.length, ...strangeness4Scaling);
        const strangeness5Cost = [1e10, 12, 20, 5, 10, 40, 800, 60, 20];
        const strangeness5Scaling = [1, 1, 1, 1.8, 1.75, 1, 1.5, 1.5, 1];
        strangenessInfo[5].startCost.splice(0, strangeness5Cost.length, ...strangeness5Cost);
        strangenessInfo[5].scaling.splice(0, strangeness5Scaling.length, ...strangeness5Scaling);
        //strangenessInfo[1].maxActive = 10; //Re enable
        strangenessInfo[2].maxActive = 10;
        strangenessInfo[3].maxActive = 10;
        strangenessInfo[4].maxActive = 11;
        //strangenessInfo[5].maxActive = 9;

        getId('strange10Stage1').style.display = 'none'; //Re enable
        getId('strange10Stage2').style.display = '';
        getId('strange9Stage3').style.display = '';
        getId('strange10Stage3').style.display = '';
        getId('strange11Stage4').style.display = '';

        getId('strange9Stage1').style.display = '';
        getId('strange8Stage2').style.display = '';
        getId('strange9Stage2').style.display = '';
        getId('strange8Stage3').style.display = '';
        getId('strange9Stage4').style.display = '';
        getId('strange10Stage4').style.display = '';
        getId('strange6Stage5').style.display = '';
        getId('strangenessSection2').style.display = '';
        getId('strangenessSection3').style.display = '';
        getId('strangenessSection4').style.display = '';
        getId('strangenessSection5').style.display = '';
        getId('milestone1Stage5Div').style.display = '';
        getId('milestone2Stage5Div').style.display = '';
        getId('preonCap').style.display = '';
        getId('dustCap').style.display = '';
        getId('unknownStructures').style.display = 'none';

        const stageWord = getId('stageWord') as HTMLSpanElement;
        stageWord.textContent = global.stageInfo.word[6];
        stageWord.style.color = global.stageInfo.textColor[6];
        for (const element of getClass('vacuum')) { element.style.display = ''; }
    } else {
        specialHTML.footerStatsHTML[1][0] = ['Quarks.png', 'Quarks', 'stage1borderImage cyanText', 'Quarks'];
        buildings[1][0].current = [3, 0];
        buildings[2][0].current = [2.8, -3];
        buildings[3][0].current = [1, -19];
        if (buildingsInfo.name[1][0] === 'Mass') {
            specialHTML.buildingHTML[1].splice(0, 2);
            buildingsInfo.name[1].splice(0, 2);
        }
        const maxBuildings = [4, 6, 5, 5, 4];
        buildingsInfo.maxActive.splice(1, maxBuildings.length, ...maxBuildings);
        buildingsInfo.startCost[1] = [0, 3, 24, 3];
        buildingsInfo.firstCost[1] = [0, 3, 24, 3];
        global.dischargeInfo.energyType[1] = [0, 1, 5, 20];
        buildingsInfo.type[2][1] = 'producing';
        buildingsInfo.type[3][1] = 'producing';
        buildingsInfo.increase[5][1] = 2;
        buildingsInfo.increase[5][2] = 2;

        const upgrades1Cost = [0, 0, 9, 12, 36, 300, 800, 2000, 8000, 30000];
        upgradesInfo[1].startCost.splice(0, upgrades1Cost.length, ...upgrades1Cost);
        upgradesInfo[2].startCost[0] = 10000;
        upgradesInfo[1].maxActive = 10;
        upgradesInfo[2].maxActive = 7;
        upgradesInfo[3].maxActive = 13;
        upgradesInfo[4].maxActive = 4;
        upgradesInfo[5].maxActive = 3;

        const researches1Cost = [1000, 3000, 12000, 6000, 10000, 20000];
        const researches1Scaling = [500, 2000, 2000, 26000, 0, 5000];
        researchesInfo[1].startCost.splice(0, researches1Cost.length, ...researches1Cost);
        researchesInfo[1].scaling.splice(0, researches1Scaling.length, ...researches1Scaling);
        researchesInfo[1].maxActive = 6;
        researchesInfo[2].maxActive = 6;
        researchesInfo[3].maxActive = 8;
        researchesInfo[4].maxActive = 4;
        researchesInfo[5].maxActive = 2;

        researchesExtraInfo[3].scaling[3] = 100;
        researchesExtraInfo[1].maxActive = 0;
        researchesExtraInfo[2].maxActive = 3;
        researchesExtraInfo[3].maxActive = 4;
        researchesExtraInfo[4].maxActive = 2;
        researchesExtraInfo[5].maxActive = 0;

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
        strangenessInfo[1].maxActive = 9;
        strangenessInfo[2].maxActive = 9;
        strangenessInfo[3].maxActive = 8;
        strangenessInfo[4].maxActive = 10;
        strangenessInfo[5].maxActive = 9;

        for (const element of getClass('vacuum')) { element.style.display = 'none'; }
        for (let s = 1; s < strangenessInfo.length; s++) {
            for (let i = strangenessInfo[s].maxActive + 1; i <= strangenessInfo[s].startCost.length; i++) {
                getId(`strange${i}Stage${s}`).style.display = 'none';
            }
        }

        getId('rankStat0').style.display = '';
        getId('elementsExtra').style.display = 'none';
    }

    for (let s = 1; s <= 3; s++) {
        buildings[s][0].total = cloneArray(buildings[s][0].current);
        buildings[s][0].trueTotal = cloneArray(buildings[s][0].current);
        buildings[s][0].highest = cloneArray(buildings[s][0].current);
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
    resetVacuum();
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
