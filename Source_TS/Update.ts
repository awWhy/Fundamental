import { getId } from './Main(OnLoad)';
import { atoms, energy, global, molecules, particles, player, quarks, time, upgrades } from './Player';
import { calculateGainedBuildings } from './Stage';

export const switchTab = (tab: string) => {
    if (global.tab !== tab) {
        getId('stageTab').style.display = 'none';
        getId('settingsTab').style.display = 'none';

        switch (tab) {
            case 'stage':
                getId('stageTab').style.display = 'flex';
                global.tab = 'stage';
                break;
            case 'settings':
                getId('settingsTab').style.display = 'flex';
                global.tab = 'settings';
                break;
        }
    }
};

export const getUpgradeDescription = (upgradeNumber: number) => {
    getId('upgradeText').textContent = upgrades.description[upgradeNumber];
    getId('upgradeCost').textContent = `${player.upgrades[upgradeNumber - 1] === 0 ? upgrades.cost[upgradeNumber - 1] : 0} Energy`;
};

const s = global.stage;
export const invisibleUpdate = () => { //This is only for important or time based info
    time.current = Date.now();
    const passedTime = (time.current - time.lastUpdate) / 1000;
    time.lastUpdate = Date.now();
    /*if (auto) { }*/ //Add auto's in here
    if (s === 1) {
        particles.producing = earlyRound(0.5 * particles.current * (player.upgrades[1] === 1 ? 10 : 1), 1);
        calculateGainedBuildings(quarks, particles, passedTime);
        atoms.producing = earlyRound(0.4 * atoms.current * (player.upgrades[2] === 1 ? 5 : 1), 1);
        calculateGainedBuildings(particles, atoms, passedTime);
    }
    if (s <= 2) {
        molecules.producing = earlyRound(0.3 * molecules.current, 1);
        calculateGainedBuildings(atoms, molecules, passedTime);
    }
    if (s === 2) {
        //Placeholder for 2 more buildings for stage 2
    }
};

export const numbersUpdate = () => { //This is for relevant visual info
    if (global.footer) {
        if (s === 1) {
            getId('quarks').textContent = `Quarks: ${finalFormat(quarks.current)}`;
        }
        if (s === 2) {
            //Atoms
        }
        if (energy.total >= 9) {
            getId('energy').textContent = `Energy: ${energy.current}`;
        }
    }
    if (global.tab === 'stage') {
        if (s === 1) {
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
        if (s <= 2) {
            if (atoms.total >= 2) {
                getId('moleculesCur').textContent = finalFormat(molecules.current);
                getId('moleculesProd').textContent = String(molecules.producing);
                getId('moleculesBtn').textContent = `Need: ${finalFormat(molecules.cost)} Atoms`;
            }
        }
        if (s === 2) {
            //Placeholder for 2 more buildings for stage 2
        }
    }
};

export const visualUpdate = () => { //This is everything that can be shown later
    getId('energyStat').style.display = energy.total >= 9 ? 'flex' : 'none';
    getId('upgrades').style.display = energy.total >= 9 ? 'flex' : 'none';
    getId('atomsMain').style.display = particles.total >= 11 && s === 1 ? 'flex' : 'none';
    getId('moleculesMain').style.display = atoms.total >= 2 && s <= 2 ? 'flex' : 'none';
    getId('quarkStat').style.display = s === 1 ? 'flex' : 'none';
    getId('particlesMain').style.display = s === 1 ? 'flex' : 'none';
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
