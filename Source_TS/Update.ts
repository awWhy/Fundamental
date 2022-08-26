import { getId } from './Main(OnLoad)';
import { global, player } from './Player';
import { calculateGainedBuildings } from './Stage';

export const switchTab = (tab = 'none') => {
    if (global.tab !== tab) {
        getId('stageTab').style.display = 'none';
        getId('stageTabBtn').style.borderColor = 'darkcyan';
        getId('settingsTab').style.display = 'none';
        getId('settingsTabBtn').style.borderColor = 'darkcyan';
        if (tab !== 'none') {
            global.tab = tab;
        }
        visualUpdate();
        numbersUpdate();

        switch (tab) {
            case global.tab:
                getId(`${global.tab}Tab`).style.display = 'flex';
                getId(`${global.tab}TabBtn`).style.borderColor = 'white';
                break;
            default:
                global.tab = 'stage';
                getId(`${global.tab}Tab`).style.display = 'flex';
                getId(`${global.tab}TabBtn`).style.borderColor = 'white';
        }
    }
};

export const getUpgradeDescription = (upgradeNumber: number, type = 'normal') => {
    const { upgradesInfo, upgradesWInfo } = global;
    /* Move .style.color into custom color */
    switch (type) {
        case 'normal':
            getId('upgradeText').textContent = upgradesInfo.description[upgradeNumber - 1];
            getId('upgradeEffect').textContent = `${upgradesInfo.effectText[upgradeNumber - 1][0]}${upgradesInfo.effect[upgradeNumber - 1]}${upgradesInfo.effectText[upgradeNumber - 1][1]}`;
            getId('upgradeEffect').style.color = '';
            getId('upgradeCost').textContent = `${player.upgrades[upgradeNumber - 1] === 0 ? upgradesInfo.cost[upgradeNumber - 1] : 0} Energy`;
            getId('upgradeCost').style.color = '';
            break;
        case 'water':
            getId('upgradeText').textContent = upgradesWInfo.description[upgradeNumber - 1];
            getId('upgradeEffect').textContent = `${upgradesWInfo.effectText[upgradeNumber - 1][0]}${upgradesWInfo.effect[upgradeNumber - 1]}${upgradesWInfo.effectText[upgradeNumber - 1][1]}`;
            getId('upgradeEffect').style.color = '#82cb3b';
            getId('upgradeCost').textContent = `${player.upgradesW[upgradeNumber - 1] === 0 ? upgradesWInfo.cost[upgradeNumber - 1] : 0} Molecules`;
            getId('upgradeCost').style.color = '#03d3d3';
            break;
    }
};

export const invisibleUpdate = () => { //This is only for important or time based info
    const { time, quarks, particles, atoms, molecules, upgrades } = player;
    const { stage } = global;

    time.current = Date.now();
    const passedTime = (time.current - time.lastUpdate) / 1000;
    time.lastUpdate = Date.now();

    global.lastSave += passedTime;

    /*if (auto) { }*/ //Add auto's in here
    if (stage === 1) {
        particles.producing = earlyRound(0.5 * particles.current * (upgrades[1] === 1 ? 10 : 1), 1);
        calculateGainedBuildings(quarks, particles, passedTime);
        atoms.producing = earlyRound(0.4 * atoms.current * (upgrades[2] === 1 ? 5 : 1), 1);
        calculateGainedBuildings(particles, atoms, passedTime);
    }
    if (stage <= 2) {
        molecules.producing = earlyRound(0.3 * molecules.current, 1);
        calculateGainedBuildings(atoms, molecules, passedTime);
    }
    if (stage === 2) {
        //Placeholder for 2 more buildings for stage 2
    }
};

export const numbersUpdate = () => { //This is for relevant visual info
    const { quarks, energy, particles, atoms, molecules } = player;
    const { stage, tab } = global;

    if (global.footer) {
        if (stage === 1) {
            getId('quarks').textContent = `Quarks: ${finalFormat(quarks.current)}`;
        }
        if (stage === 2) {
            //Atoms
        }
        if (energy.total >= 9) {
            getId('energy').textContent = `Energy: ${energy.current}`;
        }
    }
    if (tab === 'stage') {
        if (stage === 1) {
            getId('particlesCur').textContent = finalFormat(particles.current);
            getId('particlesProd').textContent = String(particles.producing);
            getId('particlesBtn').textContent = `Need: ${finalFormat(particles.cost)} Quarks`;
            if (particles.total >= 11) {
                getId('atomsCur').textContent = finalFormat(atoms.current);
                getId('atomsProd').textContent = String(atoms.producing);
                getId('atomsBtn').textContent = `Need: ${finalFormat(atoms.cost)} Particles`;
            }
            if (energy.current >= 250) {
                getId('stageReset').textContent = 'Enter next stage';
            }
        }
        if (stage <= 2) {
            if (atoms.total >= 2) {
                getId('moleculesCur').textContent = finalFormat(molecules.current);
                getId('moleculesProd').textContent = String(molecules.producing);
                getId('moleculesBtn').textContent = `Need: ${finalFormat(molecules.cost)} Atoms`;
            }
        }
        if (stage === 2) {
            //Placeholder for 2 more buildings for stage 2
        }
    }
    if (tab === 'settings') {
        getId('isSaved').textContent = `${finalFormat(global.lastSave, 0)} seconds ago`;
    }
};

export const visualUpdate = () => { //This is everything that can be shown later
    const { energy, particles, atoms } = player;
    const { stage } = global;

    getId('energyStat').style.display = energy.total >= 9 ? 'flex' : 'none';
    getId('upgrades').style.display = energy.total >= 9 ? 'flex' : 'none';
    getId('atomsMain').style.display = particles.total >= 11 && stage === 1 ? 'flex' : 'none';
    getId('moleculesMain').style.display = atoms.total >= 2 && stage <= 2 ? 'flex' : 'none';
    getId('quarkStat').style.display = stage === 1 ? 'flex' : 'none';
    getId('particlesMain').style.display = stage === 1 ? 'flex' : 'none';
    getId('upgrade4').style.display = stage > 1 ? 'block' : 'none';
    getId('upgradeW1').style.display = stage > 1 ? 'block' : 'none';
};

export const earlyRound = (input: number, precision = (input < 1e6 ? 7 : 0)) => {
    if (precision > 0 && input < 1e6) {
        return Math.round(input * (10 ** precision)) / (10 ** precision);
    } else if (precision <= 0 && input < 1e6) {
        return Math.round(input);
    } else {
        return Math.trunc(input); //Math.trunc is quicker
    }
}; /* Cheap solution in order not to deal with floats, 7 because its max amount for 32 bit (15 max for 64 bit) */

const finalFormat = (input: number, precision = input < 1e3 ? 2 : 0) => {
    if (precision > 0 && input < 1e6) {
        return String(Math.trunc(input * (10 ** precision)) / (10 ** precision)); //For fake numbers
    } else if (precision <= 0 && input < 1e6) {
        return String(Math.trunc(input));
    } else { //Format instead if number is bigger than 1e6
        /* Mostly from here https://www.codeproject.com/Tips/1096544/Get-First-N-Digits-of-a-Number */
        const digits = Math.trunc(Math.log10(input));
        return `${Math.trunc((input / 10 ** (digits)) * 100) / 100}e${digits}`;
    }
};

/* Change aria-label for main buttons to "Buy (buidlingName), (cost Number and a Word), (if can afford), (how many owned), (how much being produced per/s of cost building)" */
/* Add hotkeys for switching tabs; Inside each tab add aria-life */
/* aria-disable for maxed upgrades */
