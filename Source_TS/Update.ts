import { getId } from './Main(OnLoad)';
import { global, player } from './Player';
import { calculateGainedBuildings } from './Stage';

export const switchTab = (tab = 'none') => {
    if (global.tab !== tab) {
        getId('stageTab').style.display = 'none';
        getId('stageTabBtn').style.borderColor = '';
        getId('researchTab').style.display = 'none';
        getId('researchTabBtn').style.borderColor = '';
        getId('settingsTab').style.display = 'none';
        getId('settingsTabBtn').style.borderColor = '';
        const color = ['#e3e3e3', '#a10000'][global.theme.stage - 1];

        if (tab !== 'none') {
            global.tab = tab;
        }

        switch (tab) {
            case global.tab:
                getId(`${global.tab}Tab`).style.display = 'flex';
                getId(`${global.tab}TabBtn`).style.borderColor = color;
                break;
            default:
                global.tab = 'stage';
                getId(`${global.tab}Tab`).style.display = 'flex';
                getId(`${global.tab}TabBtn`).style.borderColor = color;
        }
        visualUpdate();
        numbersUpdate();
    }
};

export const getUpgradeDescription = (upgradeNumber: number, type = 'normal') => {
    const { upgrades } = player;
    const { upgradesInfo } = global;

    switch (type) {
        case 'normal':
            getId('upgradeText').textContent = upgradesInfo.description[upgradeNumber];
            getId('upgradeEffect').textContent = `${upgradesInfo.effectText[upgradeNumber][0]}${upgradesInfo.effect[upgradeNumber]}${upgradesInfo.effectText[upgradeNumber][1]}`;
            getId('upgradeCost').textContent = `${upgrades[upgradeNumber] === 1 ? 0 : upgradesInfo.cost[upgradeNumber]} Energy`;
            getId('upgradeCost').style.color = '';
            break;
    }
};

export const invisibleUpdate = () => { //This is only for important or time based info
    const { stage, time, upgrades, buildings, discharge } = player;
    const { buildingsInfo } = global;

    time.current = Date.now();
    let passedTime = (time.current - time.updated) / 1000;
    time.updated = Date.now();
    if (passedTime < 0) {
        return console.warn('Negative passed time detected.');
    }
    global.lastSave += passedTime;
    if (passedTime > 3600) {
        passedTime = 3600;
        console.log('Max offline progress is 1 hour.');
    }

    switch (stage) {
        case 1:
            buildingsInfo.producing[3] = 0.3 * buildings[3].current * 4 ** discharge.current;
            calculateGainedBuildings(2, passedTime);
            /*if (auto) { }*/ //Add auto's in here
            buildingsInfo.producing[2] = 0.4 * buildings[2].current * 4 ** discharge.current;
            if (upgrades[2] === 1) { buildingsInfo.producing[2] *= 5; }
            calculateGainedBuildings(1, passedTime);
            buildingsInfo.producing[1] = 0.5 * buildings[1].current * 4 ** discharge.current;
            if (upgrades[1] === 1) { buildingsInfo.producing[1] *= 10; }
            calculateGainedBuildings(0, passedTime);
            break;
    }
};

export const numbersUpdate = () => { //This is for relevant visual info
    const { stage, energy, buildings, upgrades } = player;
    const { tab, lastSave, dischargeInfo, buildingsInfo } = global;

    if (global.footer) {
        if (stage === 1) {
            getId('quarks').textContent = `Quarks: ${format(buildings[0].current)}`;
        }
        if (energy.total >= 9 && stage !== 2) {
            getId('energy').textContent = `Energy: ${format(energy.current, 0)}`;
        }
    }
    if (tab === 'stage') {
        if (stage === 1) {
            getId('building1Cur').textContent = format(buildings[1].current);
            getId('building1Prod').textContent = format(buildingsInfo.producing[1]);
            if (buildingsInfo.cost[1] <= buildings[0].current) {
                getId('building1Btn').classList.add('availableBuilding');
                getId('building1Btn').textContent = `Buy for: ${format(buildingsInfo.cost[1])} Quarks`;
            } else {
                getId('building1Btn').classList.remove('availableBuilding');
                getId('building1Btn').textContent = `Need: ${format(buildingsInfo.cost[1])} Quarks`;
            }
            if (buildings[1].total >= 11) {
                getId('building2Cur').textContent = format(buildings[2].current);
                getId('building2Prod').textContent = format(buildingsInfo.producing[2]);
                if (buildingsInfo.cost[2] <= buildings[1].current) {
                    getId('building2Btn').classList.add('availableBuilding');
                    getId('building2Btn').textContent = `Buy for: ${format(buildingsInfo.cost[2])} Particles`;
                } else {
                    getId('building2Btn').classList.remove('availableBuilding');
                    getId('building2Btn').textContent = `Need: ${format(buildingsInfo.cost[2])} Particles`;
                }
            }
            if (buildings[2].total >= 2) {
                getId('building3Cur').textContent = format(buildings[3].current);
                getId('building3Prod').textContent = format(buildingsInfo.producing[3]);
                if (buildingsInfo.cost[3] <= buildings[2].current) {
                    getId('building3Btn').classList.add('availableBuilding');
                    getId('building3Btn').textContent = `Buy for: ${format(buildingsInfo.cost[3])} Atoms`;
                } else {
                    getId('building3Btn').classList.remove('availableBuilding');
                    getId('building3Btn').textContent = `Need: ${format(buildingsInfo.cost[3])} Atoms`;
                }
            }
            if (upgrades[3] === 1) {
                getId('dischargeReset').textContent = `Next goal is ${format(dischargeInfo.cost, 0)} energy`;
            }
            //if () { getId('stageReset').textContent = 'Enter next stage'; }
        }
    }
    if (tab === 'settings') {
        getId('isSaved').textContent = `${format(lastSave, 0)} seconds ago`;
    }
};

export const visualUpdate = () => { //This is everything that can be shown later
    const { stage, energy, discharge, buildings, upgrades } = player;

    getId('energyStat').style.display = energy.total >= 9 && stage !== 2 ? 'flex' : 'none';
    getId('upgrades').style.display = energy.total >= 9 ? 'flex' : 'none';
    getId('atomsMain').style.display = buildings[1].total >= 11 && stage === 1 ? 'flex' : 'none';
    getId('moleculesMain').style.display = buildings[2].total >= 2 && stage === 1 ? 'flex' : 'none';
    getId('discharge').style.display = upgrades[3] > 0 ? 'flex' : 'none';
    getId('quarkStat').style.display = stage === 1 ? 'flex' : 'none';
    getId('particlesMain').style.display = stage === 1 ? 'flex' : 'none';
    getId('resetToggles').style.display = discharge.current >= 1 ? 'flex' : 'none';
    for (let i = 5; i <= 8; i++) {
        if (discharge.current >= 3) {
            getId(`upgrade${i}`).style.display = 'block';
        } else {
            getId(`upgrade${i}`).style.display = 'none';
        }
    }
    getId('researchTabBtn').style.display = discharge.current >= 4 ? 'block' : 'none';
    getId('stageToggleReset').style.display = stage > 1 ? 'flex' : 'none';
    getId('themeArea').style.display = stage > 1 ? 'block' : 'none';
    getId('stage').style.display = 'none';
};

export const format = (input: number, precision = input < 1e3 ? 2 : 0, type = 'number') => {
    switch (type) {
        case 'time':
            if (input > 7200000) {
                return `${Math.trunc(input / 3600000)} hours`;
            } else {
                return `${Math.trunc(input / 60000)} minutes`;
            }
        default:
            if (precision > 0 && input < 1e6) {
                return String(Math.trunc(input * (10 ** precision)) / (10 ** precision)); //For fake numbers
            } else if (precision <= 0 && input < 1e6) {
                return String(Math.trunc(input));
            } else { //Format instead if number is bigger than 1e6
                /* Mostly from here https://www.codeproject.com/Tips/1096544/Get-First-N-Digits-of-a-Number */
                const digits = Math.trunc(Math.log10(input));
                return `${Math.trunc((input / 10 ** (digits)) * 100) / 100}e${digits}`;
            }
    }
};
