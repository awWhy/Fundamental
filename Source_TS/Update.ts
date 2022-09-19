import { getId } from './Main';
import { global, globalStart, player, playerStart } from './Player';
import { buyBuilding, calculateBuildingsCost, calculateGainedBuildings, calculateResearchCost } from './Stage';

export const switchTab = (tab = 'none') => {
    if (global.tab !== tab) {
        getId('stageTab').style.display = 'none';
        getId('stageTabBtn').style.borderColor = '';
        getId('researchTab').style.display = 'none';
        getId('researchTabBtn').style.borderColor = '';
        getId('settingsTab').style.display = 'none';
        getId('settingsTabBtn').style.borderColor = '';
        const color = ['#e3e3e3', '#a10000'][global.theme.stage - 1];
        const invText = getId('invisibleTab'); //For screen readers, always turned on, to let screen reader user get to settings tab easier
        getId('specialTab').style.display = 'none';

        if (tab !== 'none') {
            global.tab = tab;
        } else {
            global.tab = 'stage';
        }

        getId(`${global.tab}Tab`).style.display = '';
        getId(`${global.tab}TabBtn`).style.borderColor = color;
        invText.textContent = `Current tab: ${global.tab} tab`;
        visualUpdate();
        numbersUpdate();
    }
};

export const invisibleUpdate = () => { //This is only for important or time based info
    const { stage, time, buildings, upgrades, researches, researchesAuto, toggles } = player;
    const { buildingsInfo } = global;

    const passedTime = Date.now() - time.updated;
    let passedSeconds = passedTime / 1000;
    time.updated = Date.now();
    if (passedTime < 0) {
        return console.warn('Negative passed time detected.');
    }
    global.lastSave += passedTime;
    if (passedSeconds > 3600) {
        passedSeconds = 3600;
        console.log('Max offline progress is 1 hour.');
    }

    if (stage.current === 1) {
        const { discharge } = player;
        const { upgradesInfo } = global;

        if (toggles[6] && researchesAuto[1] >= 3) { buyBuilding(3, true); }
        buildingsInfo.producing[3] = 0.3 * buildings[3].current * upgradesInfo.effect[3] ** discharge.current;
        if (upgrades[5] === 1) { buildingsInfo.producing[3] *= upgradesInfo.effect[5] ** buildings[3].true; }
        calculateGainedBuildings(2, passedSeconds);

        upgradesInfo.effect[5] = Math.trunc((1.02 + 0.01 * researches[1]) * 100) / 100;
        upgradesInfo.effect[3] = 4 + 1 * researches[3];
        if (upgrades[6] === 1) { calculateGainedBuildings(3, passedSeconds); }

        if (toggles[5] && researchesAuto[1] >= 2) { buyBuilding(2, true); }
        buildingsInfo.producing[2] = 0.4 * buildings[2].current * upgradesInfo.effect[3] ** discharge.current;
        if (upgrades[2] === 1) { buildingsInfo.producing[2] *= 5; }
        if (upgrades[5] === 1) { buildingsInfo.producing[2] *= upgradesInfo.effect[5] ** buildings[2].true; }
        calculateGainedBuildings(1, passedSeconds);

        if (toggles[4] && researchesAuto[1] >= 1) { buyBuilding(1, true); }
        buildingsInfo.producing[1] = 0.5 * buildings[1].current * upgradesInfo.effect[3] ** discharge.current;
        if (upgrades[1] === 1) { buildingsInfo.producing[1] *= 10; }
        if (upgrades[5] === 1) { buildingsInfo.producing[1] *= upgradesInfo.effect[5] ** buildings[1].true; }
        calculateGainedBuildings(0, passedSeconds);
    } else if (stage.current === 2) {
        const { upgradesS2Info } = global;

        buildingsInfo.producing[3] = 2 * buildings[3].current;
        if (upgrades[1] === 1) { buildingsInfo.producing[3] *= 1.5; }

        buildingsInfo.producing[2] = 2 * buildings[2].current;
        upgradesS2Info.effect[0] = 1.03 + researches[2] * 0.01;
        if (upgrades[0] === 1) { buildingsInfo.producing[2] *= upgradesS2Info.effect[0] ** buildings[2].true; }
        if (buildings[3].current >= 1) { buildingsInfo.producing[2] *= buildingsInfo.producing[3]; }
        if (researches[1] >= 1 && buildings[1].true > 1) { buildingsInfo.producing[2] *= Math.log10(buildings[1].true); }
        calculateGainedBuildings(1, passedSeconds);

        if (buildings[0].current < 0.0028 && buildings[1].current === 0) { buildings[0].current = 0.0028; }
        if (buildings[1].current < buildings[1].true) {
            buildings[1].true = Math.trunc(buildings[1].current);
            calculateBuildingsCost(1);
        }

        buildingsInfo.producing[1] = 0.0004 * buildings[1].current;
        if (researches[0] > 0) { buildingsInfo.producing[1] *= 3 ** researches[0]; }
        calculateGainedBuildings(0, passedSeconds);
    }
};

export const numbersUpdate = () => { //This is for relevant visual info
    const { stage, buildings, upgrades } = player;
    const { tab, buildingsInfo } = global;

    if (global.footer) {
        if (stage.current === 1) {
            getId('quarks').textContent = `Quarks: ${format(buildings[0].current)}`;
            if (player.energy.total >= 9) { getId('energy').textContent = `Energy: ${format(player.energy.current, 0)}`; }
        } else if (stage.current === 2) {
            getId('water').textContent = `Moles: ${format(buildings[0].current)}`;
            if (tab !== 'stage') { getId('dropExtra').textContent = `Drops: ${format(buildings[1].current)}`; }
        }
    }
    if (tab === 'stage') {
        for (let i = 1; i < buildingsInfo.name.length; i++) {
            getId(`building${i}Cur`).textContent = format(buildings[i].current);
            getId(`building${i}Prod`).textContent = format(buildingsInfo.producing[i]);
            let e = i - 1;
            if (stage.current === 2 && i > 2) { e = 1; }
            if (buildingsInfo.cost[i] <= buildings[e].current) {
                getId(`building${i}Btn`).classList.add('availableBuilding');
                getId(`building${i}Btn`).textContent = `Buy for: ${format(buildingsInfo.cost[i])} ${buildingsInfo.name[e]}`;
            } else {
                getId(`building${i}Btn`).classList.remove('availableBuilding');
                getId(`building${i}Btn`).textContent = `Need: ${format(buildingsInfo.cost[i])} ${buildingsInfo.name[e]}`;
            }
        }
        if (stage.current === 1) {
            if (upgrades[3] === 1) {
                getId('dischargeReset').textContent = `Next goal is ${format(global.dischargeInfo.next, 0)} Energy`;
                getId('dischargeEffect').textContent = String(global.upgradesInfo.effect[3]);
            }
        }
    } else if (tab === 'settings') {
        if (global.lastSave >= 1000) { getId('isSaved').textContent = `${format(global.lastSave, 0, 'time')} ago`; }
    }
};

export const visualUpdate = () => { //This is everything that can be shown later
    const { stage, buildings, upgrades, researchesAuto } = player;

    /* They are going to be hidden with stageCheck(); */
    if (stage.current === 1) {
        const { energy, discharge } = player;

        getId('energyStat').style.display = energy.total >= 9 ? '' : 'none';
        getId('discharge').style.display = upgrades[3] > 0 ? '' : 'none';
        if (buildings[1].total >= 11) { getId('building2').style.display = ''; }
        if (buildings[2].total >= 2) { getId('building3').style.display = ''; }
        if (energy.total >= 9) { getId('upgrades').style.display = ''; }
        if (discharge.current >= 1) { getId('resetToggles').style.display = ''; }
        for (let i = 5; i <= 8; i++) {
            getId(`upgrade${i}`).style.display = discharge.current >= 3 ? '' : 'none';
        }
        if (discharge.current >= 4) { getId('researchTabBtn').style.display = ''; }
        if (upgrades[7] === 1) { getId('stage').style.display = ''; }
        if (buildings[3].current >= 1.67e21) { getId('stageReset').textContent = 'Enter next stage'; }
    } else if (stage.current === 2) {
        getId('dropStat').style.display = global.tab !== 'stage' ? '' : 'none';
        if (buildings[1].total >= 400) { getId('building2').style.display = ''; }
        if (buildings[1].total >= 1e7) { getId('building3').style.display = ''; }
        //if (buildings[3].total >= 9e99) { getId('building4').style.display = ''; }
        //if (buildings[4].total >= 9e99) { getId('building5').style.display = ''; }
    }

    for (let i = 1; i < playerStart.buildings.length; i++) {
        getId(`toggle${i + 3}`).style.display = researchesAuto[1] >= i ? '' : 'none';
    }
    getId('toggleBuy').style.display = researchesAuto[0] > 0 ? '' : 'none';
    if (global.screenReader) {
        getId('invisibleGetBuilding2').style.display = buildings[2].total > 0 ? '' : 'none';
        getId('invisibleGetBuilding3').style.display = buildings[3].total > 0 ? '' : 'none';
        getId('invisibleGetBuilding4').style.display = buildings[4].total > 0 ? '' : 'none';
        getId('invisibleGetBuilding5').style.display = buildings[5].total > 0 ? '' : 'none';
    }
};

export const getUpgradeDescription = (index: number, type = 'upgrades' as 'upgrades' | 'researches' | 'researchesAuto') => {
    const { stage } = player;

    if (type !== 'upgrades') {
        let typeInfo = 'researchesAutoInfo' as 'researchesAutoInfo' | 'researchesS2Info';
        if (type !== 'researchesAuto') {
            typeInfo = `${type}${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'researchesS2Info';
        }

        getId('researchText').textContent = global[typeInfo].description[index];

        /* Special cases */
        if (type === 'researchesAuto' && index === 1) {
            global.researchesAutoInfo.effect[1] = global.buildingsInfo.name[Math.min(player.researchesAuto[1] + 1, global.buildingsInfo.name.length - 1)];
        }

        if (global[typeInfo].effect[index] !== 0) {
            getId('researchEffect').textContent = `${global[typeInfo].effectText[index][0]}${global[typeInfo].effect[index]}${global[typeInfo].effectText[index][1]}`;
        } else {
            getId('researchEffect').textContent = global[typeInfo].effectText[index][0];
        }
        getId('researchCost').textContent = `${player[type][index] === global[typeInfo].max[index] ? 0 : format(global[typeInfo].cost[index])} ${global.stageInfo.resourceName[player.stage.current - 1]}.`;
    } else {
        const typeInfo = `${type}${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'upgradesS2Info';

        getId('upgradeText').textContent = global[typeInfo].description[index];

        if (global[typeInfo].effect[index] !== 0) {
            getId('upgradeEffect').textContent = `${global[typeInfo].effectText[index][0]}${global[typeInfo].effect[index]}${global[typeInfo].effectText[index][1]}`;
        } else {
            getId('upgradeEffect').textContent = global[typeInfo].effectText[index][0];
        }
        getId('upgradeCost').textContent = `${player[type][index] === 1 ? 0 : format(global[typeInfo].cost[index])} ${global.stageInfo.resourceName[player.stage.current - 1]}.`;
    }
};

export const visualUpdateUpgrades = (index: number, type = 'upgrades' as 'upgrades' | 'researches' | 'researchesAuto') => {
    const { stage } = player;

    let typeInfo = 'researchesAutoInfo' as 'researchesAutoInfo' | 'researchesS2Info';
    if (type !== 'researchesAuto') {
        typeInfo = `${type}${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'researchesS2Info';
    }

    let extra = '';
    if (stage.current === 2) {
        extra = 'W';
    }

    let upgradeHTML: HTMLElement;
    if (type === 'researchesAuto') {
        upgradeHTML = getId(`researchAuto${index + 1}Level`);
    } else if (type === 'researches') {
        upgradeHTML = getId(`research${extra}${index + 1}Level`);
    } else {
        upgradeHTML = getId(`upgrade${extra}${index + 1}`);
    }

    if (Object.prototype.hasOwnProperty.call(global[typeInfo], 'max')) {
        upgradeHTML.textContent = String(player[type][index]);
        upgradeHTML.classList.remove('redText', 'orchidText', 'greenText');
        if (player[type][index] === global[typeInfo].max[index]) { //If I add as 'upgradesS2Info', TS won't realize that this code will never be done if object doesn't have property 'max'...
            upgradeHTML.classList.add('greenText');
        } else if (player[type][index] === 0) {
            upgradeHTML.classList.add('redText');
        } else {
            upgradeHTML.classList.add('orchidText');
        }
    } else {
        let color = 'green';
        if (stage.current === 2) { color = 'darkgreen'; } //No idea if more expected
        getId(`upgrade${extra}${index + 1}`).style.backgroundColor = player[type][index] === 1 ? color : '';
    }
};

export const format = (input: number, precision = input < 1e3 ? (input < 1 ? 4 : 2) : 0, type = 'number' as 'number' | 'time') => {
    switch (type) {
        case 'number':
            if (precision > 0 && input < 1e6) {
                return String(Math.trunc(input * (10 ** precision)) / (10 ** precision)); //For fake numbers
            } else if (precision <= 0 && input < 1e6) {
                return String(Math.trunc(input));
            } else { //Format instead if number is bigger than 1e6
                const digits = Math.trunc(Math.log10(input));
                return `${Math.trunc((input / 10 ** (digits)) * 100) / 100}e${digits}`;
            }
        case 'time': //I don't fully know how to make hours:minutes:seconds, or if even needed
            if (input >= 172800000) {
                return `${Math.trunc(input / 86400000)} days`;
            } else if (input >= 7200000) {
                return `${Math.trunc(input / 3600000)} hours`;
            } else if (input >= 600000) {
                return `${Math.trunc(input / 60000)} minutes`;
            } else {
                return `${Math.trunc(input / 1000)} seconds`;
            }
    }
};

export const stageCheck = () => {
    const { stage } = player; //Can be added upgrades, researches, researchesAuto
    const { stageInfo, buildingsInfo, researchesAutoInfo } = global;

    //First remove (hide) all information that might be missing in a new stage
    getId('upgradeCost').classList.remove('orangeText', 'cyanText');
    getId('researchCost').classList.remove('orangeText', 'cyanText');
    for (let i = 2; i < playerStart.buildings.length; i++) {
        getId(`building${i}`).style.display = 'none';
    }
    getId('upgradeText').textContent = 'Hover to see.';
    getId('upgradeEffect').textContent = 'Hover to see.';
    getId('upgradeCost').textContent = 'Resource.';
    getId('researchText').textContent = 'Hover to see.';
    getId('researchEffect').textContent = 'Hover to see.';
    getId('researchCost').textContent = 'Resource.';

    //Hide | show stage specific information
    getId('quarkStat').style.display = stage.current === 1 ? '' : 'none';
    getId('particles').style.display = stage.current === 1 ? '' : 'none';
    getId('atoms').style.display = stage.current === 1 ? '' : 'none';
    getId('molecules').style.display = stage.current === 1 ? '' : 'none';
    getId('dischargeToggleReset').style.display = stage.current === 1 ? '' : 'none';

    getId('waterStat').style.display = stage.current === 2 ? '' : 'none';
    getId('drops').style.display = stage.current === 2 ? '' : 'none';
    getId('puddles').style.display = stage.current === 2 ? '' : 'none';
    getId('ponds').style.display = stage.current === 2 ? '' : 'none';
    getId('lakes').style.display = stage.current === 2 ? '' : 'none';
    getId('seas').style.display = stage.current === 2 ? '' : 'none';

    getId('upgrades').style.display = stage.true > 1 ? '' : 'none';
    getId('resetToggles').style.display = stage.true > 1 ? '' : 'none';
    getId('researchTabBtn').style.display = stage.true > 1 ? '' : 'none';
    getId('stage').style.display = stage.true > 1 ? '' : 'none';
    getId('stageToggleReset').style.display = stage.true > 1 ? '' : 'none';
    getId('themeArea').style.display = stage.true > 1 ? '' : 'none';

    //Researches (upgrades) when ALL are shown or hidden based of stage
    for (let i = 1; i <= global.researchesInfo.cost.length; i++) {
        getId(`research${i}`).style.display = stage.current === 1 ? '' : 'none';
    }

    //Add (change) unique information
    if (stage.current === 1) {
        buildingsInfo.name = ['Quarks', 'Particles', 'Atoms', 'Molecules']; //Assign new constants
        globalStart.buildingsInfo.cost = [0, 3, 24, 3];
        globalStart.researchesAutoInfo.cost[1] = 3000;
        researchesAutoInfo.scalling[1] = 5000;
        global.dischargeInfo.next = 10 ** player.discharge.current; //Calculate stage specific part's
        getId('upgradeCost').classList.add('orangeText'); //Add colors
        getId('researchCost').classList.add('orangeText');
        for (let i = 1; i <= 4; i++) { //Rest handled in visualUpdate();
            getId(`upgrade${i}`).style.display = '';
        }
    } else if (stage.current === 2) {
        buildingsInfo.name = ['Moles', 'Drops', 'Puddles', 'Ponds', 'Lakes', 'Seas'];
        buildingsInfo.increase = 1.2;
        globalStart.buildingsInfo.cost = [0, 0.0028, 100, 1e7, 9e99, 9e99]; //When cost is decided on, add into index just incase as well (building 4 and 5)
        globalStart.researchesAutoInfo.cost[1] = 1e10;
        researchesAutoInfo.scalling[1] = 1000;
        getId('upgradeCost').classList.add('cyanText');
        getId('researchCost').classList.add('cyanText');
        for (let i = 1; i <= global.upgradesS2Info.cost.length; i++) { //When done, show only when reached goal one's
            getId(`upgradeW${i}`).style.display = '';
        }
        for (let i = 1; i <= global.researchesS2Info.cost.length; i++) {
            getId(`researchW${i}`).style.display = '';
        }
    }

    //Buildings special information that was assigned above
    for (let i = 1; i < buildingsInfo.name.length; i++) {
        getId(`building${i}Name`).textContent = buildingsInfo.name[i];
        calculateBuildingsCost(i);
    }
    //Researches and upgrades
    const upgradeType = `upgrades${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'upgradesS2Info'; //If something can be moved higher in code
    const researchType = `researches${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'researchesS2Info';

    for (let i = 0; i < global[upgradeType].cost.length; i++) {
        if (player.upgrades[i] > 1) {
            player.upgrades[i] = 1;
            console.error(`Upgrade (${i + 1}) had an illegal value`); //Just in case, can't be done in updatePlayer(); because max level can and will change
        }
        visualUpdateUpgrades(i, 'upgrades'); //If new stage added, then need to add new 'extra' value inside
    }
    for (let i = 0; i < global[researchType].cost.length; i++) {
        if (player.researches[i] > global[researchType].max[i]) {
            player.researches[i] = global[researchType].max[i];
            console.error(`Research (${i + 1}) had level above maxium`);
        }
        calculateResearchCost(i, 'researches');
        visualUpdateUpgrades(i, 'researches');
    }
    researchesAutoInfo.max[1] = buildingsInfo.name.length - 1; //Same across all stages, cannot be moved above stage.current check
    for (let i = 0; i < researchesAutoInfo.cost.length; i++) {
        if (player.researchesAuto[i] > global.researchesAutoInfo.max[i]) {
            player.researchesAuto[i] = global.researchesAutoInfo.max[i];
            console.error(`Research (${i + 1}) for automatization had level above maxium`);
        }
        calculateResearchCost(i, 'researchesAuto');
        visualUpdateUpgrades(i, 'researchesAuto');
    }
    getId('researchAuto2Max').textContent = String(researchesAutoInfo.max[1]);

    //Unique cases that are better to be handled here (most of them are handled in visualUpdate();)
    if (stage.current !== 1) {
        getId('energyStat').style.display = 'none';
        getId('discharge').style.display = 'none';
        for (let i = 1; i <= global.upgradesInfo.cost.length; i++) {
            getId(`upgrade${i}`).style.display = 'none';
        }
    }
    if (stage.current !== 2) {
        getId('dropStat').style.display = 'none';
        for (let i = 1; i <= global.upgradesS2Info.cost.length; i++) {
            getId(`upgradeW${i}`).style.display = 'none';
        }
        for (let i = 1; i <= global.researchesS2Info.cost.length; i++) {
            getId(`researchW${i}`).style.display = 'none';
        }
    }

    //Special information
    const body = document.body.style;
    getId('stageReset').textContent = 'You are not ready';
    getId('stageWord').textContent = stageInfo.word[stage.current - 1];
    if (stage.current === 1) {
        body.removeProperty('--border-image');
        body.removeProperty('--border-stage');
        body.removeProperty('--stage-text-color');
    } else {
        body.setProperty('--border-image', `url(Used_art/Stage${stage.current}%20border.png)`);
        if (stage.current === 2) {
            body.setProperty('--border-stage', '#1460a8');
            body.setProperty('--stage-text-color', 'dodgerblue');
        }
    }
    if (global.screenReader) {
        getId('invisibleBought').textContent = `Current stage is '${stageInfo.word[stage.current - 1]}'`;
        getId('invisibleGetResource1').style.display = stage.current === 1 ? '' : 'none'; //As of now only stage 1 need that button
        for (let i = 0; i < buildingsInfo.name.length; i++) {
            getId(`invisibleGetBuilding${i}`).textContent = `Get information for ${buildingsInfo.name[i]}`;
        }
    }
};
