import { getId } from './Main(OnLoad)';
import { global, player } from './Player';
import { calculateGainedBuildings } from './Stage';

export const switchTab = (tab = 'none') => {
    if (global.tab !== tab) {
        getId('stageTab').style.display = 'none';
        getId('stageTabBtn').style.borderColor = '';
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
    const { upgradesInfo, upgradesWInfo } = global;

    switch (type) {
        case 'normal':
            getId('upgradeText').textContent = upgradesInfo.description[upgradeNumber];
            getId('upgradeEffect').textContent = `${upgradesInfo.effectText[upgradeNumber][0]}${upgradesInfo.effect[upgradeNumber]}${upgradesInfo.effectText[upgradeNumber][1]}`;
            getId('upgradeCost').textContent = `${player.upgrades[upgradeNumber] === 1 ? 0 : upgradesInfo.cost[upgradeNumber]} Energy`;
            getId('upgradeCost').style.color = '';
            break;
        case 'water':
            getId('upgradeText').textContent = upgradesWInfo.description[upgradeNumber];
            getId('upgradeEffect').textContent = `${upgradesWInfo.effectText[upgradeNumber][0]}${upgradesWInfo.effect[upgradeNumber]}${upgradesWInfo.effectText[upgradeNumber][1]}`;
            getId('upgradeCost').textContent = `${player.upgradesW[upgradeNumber] === 1 ? 0 : upgradesWInfo.cost[upgradeNumber]} Molecules`;
            getId('upgradeCost').style.color = '#03d3d3';
            break;
    }
};

export const invisibleUpdate = () => { //This is only for important or time based info
    const { stage, time, upgrades, buildings, discharge } = player;

    time.current = Date.now();
    let passedTime = (time.current - time.lastUpdate) / 1000;
    time.lastUpdate = Date.now();
    if (passedTime < 0) {
        return console.warn('Negative passed time detected.');
    }
    global.lastSave += passedTime;
    if (stage === 1 && passedTime > 600) {
        passedTime = 600;
        console.log('Max offline progress is 10 minutes (stage 1).');
    } else if (stage === 2 && passedTime > 3600) {
        passedTime = 3600;
        console.log('Max offline progress is 1 hour (stage 2).');
    }

    /*if (auto) { }*/ //Add auto's in here
    switch (stage) {
        case 2:
            buildings[3].producing = earlyRound(0.3 * buildings[3].current * 4 ** discharge.current, 1);
            calculateGainedBuildings(2, passedTime);
            break;
        case 1:
            buildings[3].producing = earlyRound(0.3 * buildings[3].current, 1);
            calculateGainedBuildings(2, passedTime);
            buildings[2].producing = earlyRound(0.4 * buildings[2].current * (upgrades[2] === 1 ? 5 : 1), 1);
            calculateGainedBuildings(1, passedTime);
            buildings[1].producing = earlyRound(0.5 * buildings[1].current * (upgrades[1] === 1 ? 10 : 1), 1);
            calculateGainedBuildings(0, passedTime);
            break;
    }
};

export const numbersUpdate = () => { //This is for relevant visual info
    const { stage, energy, buildings } = player;
    const { tab, dischargeInfo, buildingsCost } = global;

    if (global.footer) {
        if (stage === 1) {
            getId('quarks').textContent = `Quarks: ${finalFormat(buildings[0].current)}`;
        }
        if (stage === 2) {
            getId('atoms').textContent = `Atoms: ${finalFormat(buildings[2].current)}`;
        }
        if (energy.total >= 9) {
            getId('energy').textContent = `Energy: ${finalFormat(energy.current, 0)}`;
        }
    }
    if (tab === 'stage') {
        if (stage === 1) {
            getId('building1Cur').textContent = finalFormat(buildings[1].current);
            getId('building1Prod').textContent = finalFormat(buildings[1].producing);
            if (buildingsCost.current[1] <= buildings[0].current) {
                getId('building1Btn').classList.add('availableBuilding');
                getId('building1Btn').textContent = `Buy for: ${finalFormat(buildingsCost.current[1])} Quarks`;
            } else {
                getId('building1Btn').classList.remove('availableBuilding');
                getId('building1Btn').textContent = `Need: ${finalFormat(buildingsCost.current[1])} Quarks`;
            }
            if (buildings[1].total >= 11) {
                getId('building2Cur').textContent = finalFormat(buildings[2].current);
                getId('building2Prod').textContent = finalFormat(buildings[2].producing);
                if (buildingsCost.current[2] <= buildings[1].current) {
                    getId('building2Btn').classList.add('availableBuilding');
                    getId('building2Btn').textContent = `Buy for: ${finalFormat(buildingsCost.current[2])} Particles`;
                } else {
                    getId('building2Btn').classList.remove('availableBuilding');
                    getId('building2Btn').textContent = `Need: ${finalFormat(buildingsCost.current[2])} Particles`;
                }
            }
            if (energy.current >= 250) {
                getId('stageReset').textContent = 'Enter next stage';
            }
        }
        if (stage <= 2) {
            if (buildings[2].total >= 2) {
                getId('building3Cur').textContent = finalFormat(buildings[3].current);
                getId('building3Prod').textContent = finalFormat(buildings[3].producing);
                if (buildingsCost.current[3] <= buildings[2].current) {
                    getId('building3Btn').classList.add('availableBuilding');
                    getId('building3Btn').textContent = `Buy for: ${finalFormat(buildingsCost.current[3])} Atoms`;
                } else {
                    getId('building3Btn').classList.remove('availableBuilding');
                    getId('building3Btn').textContent = `Need: ${finalFormat(buildingsCost.current[3])} Atoms`;
                }
            }
        }
        if (stage === 2) {
            getId('dischargeReset').textContent = `Next goal is ${finalFormat(dischargeInfo.cost, 0)} energy`;
        }
    }
    if (tab === 'settings') {
        getId('isSaved').textContent = `${finalFormat(global.lastSave, 0)} seconds ago`;
    }
};

export const visualUpdate = () => { //This is everything that can be shown later
    const { stage, energy, discharge, buildings, upgrades } = player;

    getId('energyStat').style.display = energy.total >= 9 ? 'flex' : 'none';
    getId('upgrades').style.display = energy.total >= 9 ? 'flex' : 'none';
    getId('atomsMain').style.display = buildings[1].total >= 11 && stage === 1 ? 'flex' : 'none';
    getId('moleculesMain').style.display = buildings[2].total >= 2 && stage <= 2 ? 'flex' : 'none';
    getId('discharge').style.display = upgrades[3] > 0 ? 'flex' : 'none';
    getId('quarkStat').style.display = stage === 1 ? 'flex' : 'none';
    getId('particlesMain').style.display = stage === 1 ? 'flex' : 'none';
    getId('atomStat').style.display = stage === 2 ? 'flex' : 'none';
    getId('researchTabBtn').style.display = discharge.current >= 4 ? 'block' : 'none';
    if (stage > 1) {
        getId('upgrade4').style.display = 'block';
        getId('upgradeW1').style.display = 'block';
        getId('resetToggles').style.display = 'flex';
        getId('themeArea').style.display = 'block';
    } else {
        getId('upgrade4').style.display = 'none';
        getId('upgradeW1').style.display = 'none';
        getId('resetToggles').style.display = 'none';
        getId('themeArea').style.display = 'none';
    }
    for (let i = 5; i <= 8; i++) {
        if (discharge.current >= 3) {
            getId(`upgrade${i}`).style.display = 'block';
        } else {
            getId(`upgrade${i}`).style.display = 'none';
        }
    }
};

export const earlyRound = (input: number, precision = input < 1e6 ? 7 : 0) => {
    if (precision > 0 && input < 1e6) {
        return Math.round(input * (10 ** precision)) / (10 ** precision);
    } else if (precision <= 0 && input < 1e6) {
        return Math.round(input);
    } else {
        return Math.trunc(input); //Math.trunc is quicker
    }
}; /* Cheap solution in order not to deal with floats, 7 because its max amount for 32 bit (15 max for 64 bit) */

export const finalFormat = (input: number, precision = input < 1e3 ? 2 : 0, type = 'number') => {
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
