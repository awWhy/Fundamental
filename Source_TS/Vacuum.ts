import type Overlimit from './Limit';
import { getId, getQuery } from './Main';
import { global, player, playerStart } from './Player';
import { resetVacuum } from './Reset';
import { globalSave, playEvent, specialHTML } from './Special';
import { setActiveStage } from './Stage';
import { addIntoLog, visualTrueStageUnlocks } from './Update';

/** Sets playerStart, global and HTML values */
export const prepareVacuum = (state: boolean) => { //Must not use direct player values, globalSave is fine probably
    const { buildings } = playerStart;
    const { buildingsInfo, upgradesInfo, researchesInfo, researchesExtraInfo, strangenessInfo } = global;
    const milestone1S1 = getQuery('#milestone1Stage1Div > img') as HTMLImageElement;
    const milestone1S2 = getQuery('#milestone1Stage2Div > img') as HTMLImageElement;
    const milestone2S2 = getQuery('#milestone2Stage2Div > img') as HTMLImageElement;
    const milestone1S3 = getQuery('#milestone1Stage3Div > img') as HTMLImageElement;
    const milestone1S4 = getQuery('#milestone1Stage4Div > img') as HTMLImageElement;
    let upgrades1Cost, researches1Cost, researches1Scaling, strangeness1Cost, strangeness1Scaling, strangeness2Cost, strangeness2Scaling, strangeness3Cost, strangeness3Scaling, strangeness4Cost, strangeness4Scaling, strangeness5Cost, strangeness5Scaling;

    if (state) {
        specialHTML.footerStatsHTML[1][0] = ['Energy%20mass.png', 'stage1borderImage cyanText', 'Mass'];
        buildingsInfo.hoverText[2][0] = 'Tritium';
        buildingsInfo.hoverText[3][0] = 'Preons hardcap';
        buildings[1][0].current.setValue('5.476e-3');
        buildings[2][0].current.setValue('0');
        buildings[3][0].current.setValue('9.76185667392e-36');
        buildingsInfo.maxActive[1] = 6;
        buildingsInfo.maxActive[2] = 7;
        buildingsInfo.maxActive[3] = 6;
        buildingsInfo.maxActive[4] = 6;
        if (buildingsInfo.name[1][0] !== 'Mass') {
            specialHTML.buildingHTML[1].unshift('Preon.png', 'Quarks.png');
            buildingsInfo.name[1].unshift('Mass', 'Preons');
            buildingsInfo.hoverText[1].unshift('Mass', 'Preons');
        }
        buildingsInfo.startCost[1] = [0, 0.005476, 6, 3, 24, 3];
        buildingsInfo.type[2][0] = 'improving';
        buildingsInfo.type[3][0] = 'delaying';

        upgrades1Cost = [40, 60, 100, 120, 180, 360, 1200, 3600, 12000, 80000];
        (upgradesInfo[2].startCost[0] as Overlimit).setValue('10');
        (upgradesInfo[5].startCost[3] as Overlimit).setValue('1e160');
        upgradesInfo[1].maxActive = 11;
        upgradesInfo[2].maxActive = 9;
        upgradesInfo[3].maxActive = 14;
        upgradesInfo[4].maxActive = 5;
        upgradesInfo[5].maxActive = 7;

        researches1Cost = [1600, 4800, 16000, 32000, 16000, 24000];
        researches1Scaling = [400, 1200, 8000, 40000, 16000, 16000];
        researchesInfo[2].scaling[2] = 1e2;
        researchesInfo[2].scaling[3] = 1e3;
        //researchesInfo[1].maxActive = 6;
        //researchesInfo[2].maxActive = 6;
        //researchesInfo[3].maxActive = 9;
        researchesInfo[4].maxActive = 6;
        researchesInfo[5].maxActive = 5;

        researchesExtraInfo[1].maxActive = 6;
        researchesExtraInfo[2].maxActive = 5;
        researchesExtraInfo[3].maxActive = 6;
        researchesExtraInfo[4].maxActive = 4;
        researchesExtraInfo[5].maxActive = 6;

        global.elementsInfo.startCost[27].setValue('1e54');
        global.elementsInfo.startCost[28].setValue('1e58');

        global.ASRInfo.costRange[1] = [2000, 8000, 16000, 32000, 56000];
        global.ASRInfo.costRange[3][3] = 2.45576045e31;

        strangeness1Cost = [1, 1, 1, 2, 12, 2, 24];
        strangeness1Scaling = [2.46, 2, 6, 4, 400, 1, 1];
        strangeness2Cost = [1, 1, 2, 2, 12, 4, 24];
        strangeness2Scaling = [2.46, 2, 3, 4, 800, 1, 1];
        strangeness3Cost = [1, 2, 2, 24, 12, 4, 4, 24];
        strangeness3Scaling = [2, 3.4, 3, 1, 100, 1, 1.74, 1];
        strangeness4Cost = [1, 2, 4, 2, 12, 6, 6, 24];
        strangeness4Scaling = [2, 3.4, 3, 4, 1900, 1, 1.74, 1];
        strangeness5Cost = [24, 36, 4, 24, 15600, 24, 480, 120];
        strangeness5Scaling = [2, 2, 4, 1, 1, 1, 1, 1];
        strangenessInfo[1].maxActive = 10;
        strangenessInfo[2].maxActive = 10;
        strangenessInfo[3].maxActive = 10;
        strangenessInfo[4].maxActive = 10;
        strangenessInfo[5].maxActive = 11;

        getId('milestonesExtra').innerHTML = 'Requires <span class="darkvioletText">\'Void Milestones\'</span> Inflation to be active to enable effects';
        milestone1S1.src = 'Used_art/Preon.png';
        global.milestonesInfo[2].name[0] = 'Distant Clouds';
        getQuery('#milestone1Stage2Main > span').textContent = 'Distant Clouds';
        milestone1S2.src = 'Used_art/Clouds.png';
        milestone1S2.alt = 'Distant Clouds';
        milestone2S2.src = 'Used_art/Drop.png';
        milestone1S3.alt = 'Center of gravity';
        global.milestonesInfo[3].name[0] = 'Center of gravity';
        getQuery('#milestone1Stage3Main > span').textContent = 'Center of gravity';
        milestone1S4.src = 'Used_art/Black%20hole.png';
        getId('mergeResetText').innerHTML = '<span class="darkvioletText">Merge</span> does a <span class="grayText">Galaxy</span> reset, while also converting all self-made <span class="grayText">Galaxies</span> into bonus ones.';
        getQuery('#stageAutoInterstellar span').textContent = 'Stage';
        getQuery('#stageHistory > h3').textContent = 'Stage resets:';

        getId('preonCap').style.display = '';
        getId('molesProduction').style.display = '';
        getId('massProduction').style.display = '';
        getId('mainCapHardS5').style.display = '';
        getId('element0').style.display = '';
        getId('strangePeak').style.display = '';
        getId('stageTimeBestReset').style.display = '';
        getId('strange1Effect1Allowed').style.display = '';
        getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}5`).style.display = '';
        getId('strange7Stage1').style.display = '';
        getId('strange7Stage2').style.display = '';
        getId('strange8Stage3').style.display = '';
        getId('strange8Stage4').style.display = '';
        getId('strange3Stage5').style.display = '';
        getId('strange4Stage5').style.display = '';
        getId('milestone1Stage5Div').style.display = '';
        getId('milestone2Stage5Div').style.display = '';
        getId('stageAutoInterstellar').style.display = '';
        getId('vaporizationLimit').style.display = '';
        getId('collapseCapped').style.display = '';
        getId('mergeToggleReset').style.display = '';

        getId('strange1Effect1Disabled').style.display = 'none';
        getId('stageAutoElse').style.display = 'none';
    } else {
        specialHTML.footerStatsHTML[1][0] = ['Quarks.png', 'stage1borderImage cyanText', 'Quarks'];
        buildingsInfo.hoverText[2][0] = 'Moles';
        buildingsInfo.hoverText[3][0] = 'Mass';
        buildings[1][0].current.setValue('3');
        buildings[2][0].current.setValue('2.7753108348135e-3');
        buildings[3][0].current.setValue('1e-19');
        if (buildingsInfo.name[1][0] === 'Mass') {
            specialHTML.buildingHTML[1].splice(0, 2);
            buildingsInfo.name[1].splice(0, 2);
            buildingsInfo.hoverText[1].splice(0, 2);
        }
        buildingsInfo.maxActive[1] = 4;
        buildingsInfo.maxActive[2] = 6;
        buildingsInfo.maxActive[3] = 5;
        buildingsInfo.maxActive[4] = 5;
        buildingsInfo.startCost[1] = [0, 3, 24, 3];
        buildingsInfo.type[2][0] = 'producing';
        buildingsInfo.type[3][0] = 'producing';
        global.buildingsInfo.producing[4][5].setValue('0');
        getQuery('#star3Effect > span.info').textContent = 'Boost to the Solar mass gain';

        upgrades1Cost = [0, 0, 12, 36, 120, 240, 480, 1600, 3200, 20800];
        (upgradesInfo[2].startCost[0] as Overlimit).setValue('1e4');
        (upgradesInfo[5].startCost[3] as Overlimit).setValue('1e150');
        upgradesInfo[1].maxActive = 10;
        upgradesInfo[2].maxActive = 8;
        upgradesInfo[3].maxActive = 13;
        upgradesInfo[4].maxActive = 4;
        upgradesInfo[5].maxActive = 4;

        researches1Cost = [600, 2000, 4000, 4000, 6000, 6000];
        researches1Scaling = [200, 400, 2000, 12000, 4000, 6000];
        researchesInfo[2].scaling[2] = 1e3;
        researchesInfo[2].scaling[3] = 1e2;
        researchesInfo[1].maxActive = 6;
        researchesInfo[2].maxActive = 6;
        researchesInfo[3].maxActive = 9;
        researchesInfo[4].maxActive = 5;
        researchesInfo[5].maxActive = 2;

        researchesExtraInfo[1].maxActive = 0;
        researchesExtraInfo[2].maxActive = 3;
        researchesExtraInfo[3].maxActive = 4;
        researchesExtraInfo[4].maxActive = 3;
        researchesExtraInfo[5].maxActive = 1;

        global.elementsInfo.startCost[27].setValue('1e52');
        global.elementsInfo.startCost[28].setValue('1e54');

        global.ASRInfo.costRange[1] = [2000, 8000, 16000];
        global.ASRInfo.costRange[3][3] = 2e30;

        strangeness1Cost = [1, 1, 1, 2, 4, 2, 24];
        strangeness1Scaling = [1, 0.5, 1, 2, 0, 0, 0];
        strangeness2Cost = [1, 1, 2, 2, 4, 2, 24];
        strangeness2Scaling = [0.5, 0.75, 1, 2, 0, 0, 0];
        strangeness3Cost = [1, 1, 2, 6, 4, 2, 4, 24];
        strangeness3Scaling = [0.75, 1.5, 1, 0, 0, 0, 2.5, 0];
        strangeness4Cost = [1, 1, 3, 2, 4, 2, 4, 24];
        strangeness4Scaling = [1, 2, 1.5, 2, 0, 0, 68, 0];
        strangeness5Cost = [20, 24, 240, 24, 6000, 24, 20, 120];
        strangeness5Scaling = [20, 24, 240, 0, 0, 0, 220, 0];
        strangenessInfo[1].maxActive = 7;
        strangenessInfo[2].maxActive = 7;
        strangenessInfo[3].maxActive = 8;
        strangenessInfo[4].maxActive = 8;
        strangenessInfo[5].maxActive = 10;

        getId('milestonesExtra').innerHTML = 'Completing any tier will award 1 <span class="greenText">Strange quark</span>';
        milestone1S1.src = 'Used_art/Quarks.png';
        global.milestonesInfo[2].name[0] = 'A Nebula of Drops';
        getQuery('#milestone1Stage2Main > span').textContent = 'A Nebula of Drops';
        milestone1S2.src = 'Used_art/Drop.png';
        milestone1S2.alt = 'A Nebula of Drops';
        milestone2S2.src = 'Used_art/Puddle.png';
        milestone1S3.alt = 'Cluster of Mass';
        global.milestonesInfo[3].name[0] = 'Cluster of Mass';
        getQuery('#milestone1Stage3Main > span').textContent = 'Cluster of Mass';
        milestone1S4.src = 'Used_art/Main_sequence%20mass.png';
        getId('mergeResetText').innerHTML = 'Attempt to <span class="darkvioletText">Merge</span> <span class="grayText">Galaxies</span> together, which will result in <span class="orchidText">Vacuum</span> decaying into its true state.';
        getQuery('#stageAutoInterstellar span').textContent = 'Interstellar Stage';
        getQuery('#stageHistory > h3').textContent = 'Interstellar Stage resets:';

        getId('strange8Stage5').style.display = '';
        getId('milestonesProgressArea').style.display = '';
        getId('stageAutoElse').style.display = '';
        getId('rankStat0').style.display = '';

        getId('preonCap').style.display = 'none';
        getId('molesProduction').style.display = 'none';
        getId('massProduction').style.display = 'none';
        getId('dustCap').style.display = 'none';
        getId('submersionBoost').style.display = 'none';
        getId('mainCap').style.display = 'none';
        getId('mainCapHardS5').style.display = 'none';
        getId('mergeBoost').style.display = 'none';
        getId('mergeEffects').style.display = 'none';
        getId('mergeBoostTotal').style.display = 'none';
        getId('researchAuto1').style.display = 'none';
        getId('researchAuto2').style.display = 'none';
        getId('vaporizationLimit').style.display = 'none';
        getId('collapseCapped').style.display = 'none';
        getId('element0').style.display = 'none';
        for (let s = 1; s < strangenessInfo.length; s++) {
            for (let i = strangenessInfo[s].maxActive + 1; i <= strangenessInfo[s].startCost.length; i++) {
                getId(`strange${i}Stage${s}`).style.display = 'none';
            }
        }
        getId('strange9Stage5').style.display = 'none';
        getId('toggleAuto9Main').style.display = 'none';
        getId('energyGainStage1Build1').style.display = 'none';
        getId('energyGainStage1Build2').style.display = 'none';
        for (let s = 2; s <= 5; s++) {
            getId(`energyGainStage${s}`).style.display = 'none';
        }
        getId('mergeResets').style.display = 'none';
        getId('mergeScore').style.display = 'none';
        getId('mergeResetsS6').style.display = 'none';
    }

    upgradesInfo[1].startCost.splice(0, upgrades1Cost.length, ...upgrades1Cost);
    researchesInfo[1].startCost.splice(0, researches1Cost.length, ...researches1Cost);
    researchesInfo[1].scaling.splice(0, researches1Scaling.length, ...researches1Scaling);
    strangenessInfo[1].startCost.splice(0, strangeness1Cost.length, ...strangeness1Cost);
    strangenessInfo[1].scaling.splice(0, strangeness1Scaling.length, ...strangeness1Scaling);
    strangenessInfo[2].startCost.splice(0, strangeness2Cost.length, ...strangeness2Cost);
    strangenessInfo[2].scaling.splice(0, strangeness2Scaling.length, ...strangeness2Scaling);
    strangenessInfo[3].startCost.splice(0, strangeness3Cost.length, ...strangeness3Cost);
    strangenessInfo[3].scaling.splice(0, strangeness3Scaling.length, ...strangeness3Scaling);
    strangenessInfo[4].startCost.splice(0, strangeness4Cost.length, ...strangeness4Cost);
    strangenessInfo[4].scaling.splice(0, strangeness4Scaling.length, ...strangeness4Scaling);
    strangenessInfo[5].startCost.splice(0, strangeness5Cost.length, ...strangeness5Cost);
    strangenessInfo[5].scaling.splice(0, strangeness5Scaling.length, ...strangeness5Scaling);
    for (let s = 1; s <= 3; s++) {
        const newValue = buildings[s][0].current;
        buildings[s][0].total.setValue(newValue);
        buildings[s][0].trueTotal.setValue(newValue);
    }
};

export const switchVacuum = () => {
    if (player.inflation.vacuum) { return; }
    let income = 0;
    if (player.stage.true >= 7) {
        income = 1;
        player.cosmon[0].current += income;
        player.cosmon[0].total += income;
    } else {
        player.stage.true = 6;
        player.collapse.show = 0;
        player.event = false;
        visualTrueStageUnlocks();
        playEvent(6);
    }

    const history = player.history.vacuum;
    const storage = global.historyStorage.vacuum;
    const realTime = player.time.vacuum;
    storage.unshift([realTime, false, income]);
    if (storage.length > 100) { storage.length = 100; }
    if (income / realTime > history.best[2] / history.best[0]) {
        history.best = [realTime, false, income];
    }

    if ((player.toggles.normal[0] && global.tab !== 'inflation') || player.stage.active < 6) { setActiveStage(1); }
    player.inflation.vacuum = true;
    player.inflation.resets++;
    player.challenges.active = null;
    player.clone = {};
    prepareVacuum(true);
    resetVacuum();
    addIntoLog('Vacuum reset');
};
