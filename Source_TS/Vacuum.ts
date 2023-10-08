import { getClass, getId, getQuery } from './Main';
import { cloneArray, global, player, playerStart } from './Player';
import { resetVacuum } from './Reset';
import { Alert, Confirm, specialHTML } from './Special';

export const prepareVacuum = () => {
    const { buildings } = playerStart;
    const { buildingsInfo, upgradesInfo, researchesInfo, researchesExtraInfo, strangenessInfo } = global;

    if (player.inflation.vacuum) {
        specialHTML.footerStatsHTML[1][0] = ['Energy%20mass.png', 'stage1borderImage cyanText', 'Mass'];
        buildingsInfo.hoverText[2][0] = 'Tritium';
        buildingsInfo.hoverText[3][0] = 'Preons';
        buildings[1][0].current = [5.476, -3];
        buildings[2][0].current = [0, 0];
        buildings[3][0].current = [9.76185667392, -36];
        const maxBuildings = [6, 7, 6, 6, 4];
        buildingsInfo.maxActive.splice(1, maxBuildings.length, ...maxBuildings);
        if (buildingsInfo.name[1][0] !== 'Mass') {
            specialHTML.buildingHTML[1].unshift('Preon.png', 'Quarks.png');
            buildingsInfo.name[1].unshift('Mass', 'Preons');
            buildingsInfo.hoverText[1].unshift('Mass', 'Preons');
        }
        buildingsInfo.startCost[1] = [0, 0.005476, 6, 3, 24, 3];
        buildingsInfo.firstCost[1] = [0, 0.005476, 6, 3, 24, 3];
        global.dischargeInfo.energyType[1] = [0, 1, 3, 5, 10, 20];
        buildingsInfo.type[2][1] = 'improving';
        buildingsInfo.type[3][1] = 'delaying';
        buildingsInfo.increase[5][1] = 4;
        buildingsInfo.increase[5][2] = 4;

        const upgrades1Cost = [36, 48, 60, 90, 150, 400, 2000, 4000, 20000, 70000];
        upgradesInfo[1].startCost.splice(0, upgrades1Cost.length, ...upgrades1Cost);
        upgradesInfo[5].startCost[2] = 1e200;
        //upgradesInfo[1].maxActive = 10;
        //upgradesInfo[2].maxActive = 8;
        //upgradesInfo[3].maxActive = 13;
        //upgradesInfo[4].maxActive = 4;
        //upgradesInfo[5].maxActive = 3;

        const researches1Cost = [2400, 6000, 24000, 30000, 24000, 30000];
        const researches1Scaling = [400, 2000, 6000, 24000, 12000, 12000];
        researchesInfo[1].startCost.splice(0, researches1Cost.length, ...researches1Cost);
        researchesInfo[1].scaling.splice(0, researches1Scaling.length, ...researches1Scaling);
        //researchesInfo[1].maxActive = 6;
        //researchesInfo[2].maxActive = 6;
        //researchesInfo[3].maxActive = 9;
        //researchesInfo[4].maxActive = 5;
        //researchesInfo[5].maxActive = 2;

        researchesExtraInfo[1].maxActive = 5;
        researchesExtraInfo[2].maxActive = 4;
        researchesExtraInfo[3].maxActive = 5;
        //researchesExtraInfo[4].maxActive = 3;
        //researchesExtraInfo[5].maxActive = 0;

        global.accretionInfo.rankCost[5] = 2.47e31;
        global.ASRInfo.costRange[1] = [4000, 10000, 16000, 24000, 32000];
        global.ASRInfo.costRange[3][3] = 2.47e31;

        const strangeness1Cost = [2, 1, 4, 20, 2, 1, 2, 4, 40];
        const strangeness1Scaling = [2.5, 3.5, 8, 300, 6, 2.8, 2, 4, 1];
        strangenessInfo[1].startCost.splice(0, strangeness1Cost.length, ...strangeness1Cost);
        strangenessInfo[1].scaling.splice(0, strangeness1Scaling.length, ...strangeness1Scaling);
        const strangeness2Cost = [1, 2, 3, 4, 20, 2, 1, 4, 40];
        const strangeness2Scaling = [1.8, 1.8, 3.4, 3.4, 500, 2, 2, 4, 1];
        strangenessInfo[2].startCost.splice(0, strangeness2Cost.length, ...strangeness2Cost);
        strangenessInfo[2].scaling.splice(0, strangeness2Scaling.length, ...strangeness2Scaling);
        const strangeness3Cost = [1, 2, 6, 18, 20, 3, 10, 40];
        const strangeness3Scaling = [1.8, 2.8, 2, 1, 200, 2.4, 3, 1];
        strangenessInfo[3].startCost.splice(0, strangeness3Cost.length, ...strangeness3Cost);
        strangenessInfo[3].scaling.splice(0, strangeness3Scaling.length, ...strangeness3Scaling);
        const strangeness4Cost = [1, 3, 5, 5, 18, 20, 3, 4, 4, 40];
        const strangeness4Scaling = [1.8, 2.8, 3, 4, 5, 400, 2.4, 4, 1, 1];
        strangenessInfo[4].startCost.splice(0, strangeness4Cost.length, ...strangeness4Cost);
        strangenessInfo[4].scaling.splice(0, strangeness4Scaling.length, ...strangeness4Scaling);
        const strangeness5Cost = [4, 12, 2000, 10, 10, 40, 1500, 60, 1500, 200];
        const strangeness5Scaling = [1, 1, 1, 1.7, 1.75, 1, 5, 2, 1, 1];
        strangenessInfo[5].startCost.splice(0, strangeness5Cost.length, ...strangeness5Cost);
        strangenessInfo[5].scaling.splice(0, strangeness5Scaling.length, ...strangeness5Scaling);
        strangenessInfo[1].maxActive = 12;
        strangenessInfo[2].maxActive = 12;
        strangenessInfo[3].maxActive = 11;
        strangenessInfo[4].maxActive = 12;
        strangenessInfo[5].maxActive = 11;

        getId('milestonesWelcome').innerHTML = 'Milestones, can only be done when inside the <span class="darkvioletText">Void</span>';
        const milestone1S2 = getQuery('#milestone1Stage2Div > img') as HTMLImageElement;
        global.milestonesInfo[2].name[0] = 'Distant Clouds';
        milestone1S2.src = milestone1S2.src.replace('Drop.png', 'Clouds.png');
        milestone1S2.alt = 'Clouds';
        global.milestonesInfo[3].name[0] = 'Center of gravity';

        getId('strange10Stage2').style.display = '';
        getId('strange9Stage3').style.display = '';
        getId('strange10Stage3').style.display = '';
        getId('strange11Stage4').style.display = '';

        getId('strangeBoostMain').style.display = '';
        getId('strange9Stage1').style.display = '';
        getId('strange8Stage2').style.display = '';
        getId('strange9Stage2').style.display = '';
        getId('strange8Stage3').style.display = '';
        getId('strange9Stage4').style.display = '';
        getId('strange10Stage4').style.display = '';
        getId('strange6Stage5').style.display = '';
        for (let s = 2; s <= 5; s++) {
            getId(`strangenessSection${s}`).style.display = '';
            getId(`milestone1Stage${s}Div`).style.display = '';
            getId(`milestone2Stage${s}Div`).style.display = '';
        }
        for (const element of getClass('vacuum')) { element.style.display = ''; }
        getId('vacuumBoost').style.display = 'none';
        getId('stageInstant').style.display = 'none';
        getId('unknownStructures').style.display = 'none';
    } else {
        specialHTML.footerStatsHTML[1][0] = ['Quarks.png', 'stage1borderImage cyanText', 'Quarks'];
        buildingsInfo.hoverText[2][0] = 'Moles';
        buildingsInfo.hoverText[3][0] = 'Mass';
        buildings[1][0].current = [3, 0];
        buildings[2][0].current = [2.8, -3];
        buildings[3][0].current = [1, -19];
        if (buildingsInfo.name[1][0] === 'Mass') {
            specialHTML.buildingHTML[1].splice(0, 2);
            buildingsInfo.name[1].splice(0, 2);
            buildingsInfo.hoverText[1].splice(0, 2);
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

        const upgrades1Cost = [0, 0, 9, 12, 36, 300, 800, 2000, 4000, 22000];
        upgradesInfo[1].startCost.splice(0, upgrades1Cost.length, ...upgrades1Cost);
        upgradesInfo[5].startCost[2] = 1e100;
        upgradesInfo[1].maxActive = 10;
        upgradesInfo[2].maxActive = 8;
        upgradesInfo[3].maxActive = 13;
        upgradesInfo[4].maxActive = 4;
        upgradesInfo[5].maxActive = 3;

        const researches1Cost = [1000, 2500, 6000, 8000, 8000, 6000];
        const researches1Scaling = [250, 500, 2000, 8000, 4000, 6000];
        researchesInfo[1].startCost.splice(0, researches1Cost.length, ...researches1Cost);
        researchesInfo[1].scaling.splice(0, researches1Scaling.length, ...researches1Scaling);
        researchesInfo[1].maxActive = 6;
        researchesInfo[2].maxActive = 6;
        researchesInfo[3].maxActive = 9;
        researchesInfo[4].maxActive = 5;
        researchesInfo[5].maxActive = 2;

        researchesExtraInfo[1].maxActive = 0;
        researchesExtraInfo[2].maxActive = 3;
        researchesExtraInfo[3].maxActive = 4;
        researchesExtraInfo[4].maxActive = 3;
        researchesExtraInfo[5].maxActive = 0;

        global.accretionInfo.rankCost[5] = 0;
        global.ASRInfo.costRange[1] = [6000, 12000, 18000];
        global.ASRInfo.costRange[3][3] = 2e30;

        const strangeness1Cost = [1, 1, 3, 6, 2, 1, 2, 2, 15];
        const strangeness1Scaling = [1.5, 1, 3.5, 0, 4, 0.75, 2, 4, 0];
        strangenessInfo[1].startCost.splice(0, strangeness1Cost.length, ...strangeness1Cost);
        strangenessInfo[1].scaling.splice(0, strangeness1Scaling.length, ...strangeness1Scaling);
        const strangeness2Cost = [1, 2, 2, 1, 6, 2, 1, 3, 15];
        const strangeness2Scaling = [0.4, 0.5, 2.5, 2, 0, 1, 0.5, 2, 0];
        strangenessInfo[2].startCost.splice(0, strangeness2Cost.length, ...strangeness2Cost);
        strangenessInfo[2].scaling.splice(0, strangeness2Scaling.length, ...strangeness2Scaling);
        const strangeness3Cost = [1, 1, 2, 12, 6, 2, 10, 15];
        const strangeness3Scaling = [0.75, 1.5, 2, 0, 0, 1, 15, 0];
        strangenessInfo[3].startCost.splice(0, strangeness3Cost.length, ...strangeness3Cost);
        strangenessInfo[3].scaling.splice(0, strangeness3Scaling.length, ...strangeness3Scaling);
        const strangeness4Cost = [1, 1, 3, 2, 8, 6, 3, 3, 3, 15];
        const strangeness4Scaling = [1, 2, 2.5, 3, 52, 0, 1, 6, 0, 0];
        strangenessInfo[4].startCost.splice(0, strangeness4Cost.length, ...strangeness4Cost);
        strangenessInfo[4].scaling.splice(0, strangeness4Scaling.length, ...strangeness4Scaling);
        const strangeness5Cost = [120, 20, 80, 10, 10, 40, 800, 20, 40, 60];
        const strangeness5Scaling = [60, 0, 0, 8, 10, 0, 400, 20, 0, 0];
        strangenessInfo[5].startCost.splice(0, strangeness5Cost.length, ...strangeness5Cost);
        strangenessInfo[5].scaling.splice(0, strangeness5Scaling.length, ...strangeness5Scaling);
        strangenessInfo[1].maxActive = 9;
        strangenessInfo[2].maxActive = 9;
        strangenessInfo[3].maxActive = 8;
        strangenessInfo[4].maxActive = 10;
        strangenessInfo[5].maxActive = 10;

        getId('milestonesWelcome').innerHTML = 'Any reached Milestone will award 1 <span class="greenText">Strange quark</span>';
        const milestone1S2 = getQuery('#milestone1Stage2Div > img') as HTMLImageElement;
        global.milestonesInfo[2].name[0] = 'A Nebula of Drops';
        milestone1S2.src = milestone1S2.src.replace('Clouds.png', 'Drop.png');
        milestone1S2.alt = 'Drop of water';
        global.milestonesInfo[3].name[0] = 'Cluster of Mass';

        getId('vacuumBoost').style.display = '';
        getId('strange9Stage5').style.display = '';
        getId('strange10Stage5').style.display = '';
        getId('stageInstant').style.display = '';
        getId('rankStat0').style.display = '';
        for (const element of getClass('vacuum')) { element.style.display = 'none'; }
        for (let i = 0; i < global.challengesInfo.name.length; i++) {
            getId(`challenge${i + 1}`).style.display = 'none';
        }
        for (let s = 1; s < strangenessInfo.length; s++) {
            for (let i = strangenessInfo[s].maxActive + 1; i <= strangenessInfo[s].startCost.length; i++) {
                getId(`strange${i}Stage${s}`).style.display = 'none';
            }
        }
    }

    for (let s = 1; s <= 3; s++) {
        const newValue = buildings[s][0].current;
        buildings[s][0].total = cloneArray(newValue);
        buildings[s][0].trueTotal = cloneArray(newValue);
        buildings[s][0].highest = cloneArray(newValue);
    }
};

export const switchVacuum = async() => {
    if (player.inflation.vacuum) { return void Alert('This cannot be undone'); }
    const count = global.strangeInfo.instability;
    if (count < 5) { return void Alert(`Universe is still stable. Vacuum state is false. ${5 - count} more`); }

    if (!(await Confirm('This will not be possible to undo. Confirm?'))) { return; }
    await Alert('Universe is too unstable. Vacuum instability is imminent');
    player.inflation.vacuum = true;
    if (player.stage.true < 6) { player.stage.true = 6; }
    player.stage.current = 1;
    player.stage.active = 1;
    prepareVacuum();
    resetVacuum();
};

export const updateUnknown = () => {
    const { milestones } = player;

    let text = '<h4 class="darkvioletText">Unknown Structures:</h4>';
    if (milestones[1][0] >= 6) { text += '<img src="Used_art/Preon.png" alt="Unknown Structure" loading="lazy">'; }
    if (milestones[2][1] >= 6) { text += '<img src="Used_art/Ocean.png" alt="Unknown Structure" loading="lazy">'; }
    if (milestones[3][1] >= 7) { text += '<img src="Used_art/Subsatellite.png" alt="Unknown Structure" loading="lazy">'; }
    if (milestones[4][1] >= 8) { text += '<img src="Used_art/Quasi%20star.png" alt="Unknown Structure" loading="lazy">'; }

    const div = getId('unknownStructures');
    div.style.display = global.strangeInfo.instability > 0 ? '' : 'none';
    if (div.innerHTML !== text) { div.innerHTML = text; }
};
