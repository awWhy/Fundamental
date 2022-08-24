import { getId } from './Main(OnLoad)';
import { atoms, energy, global, molecules, particles, player, quarks, stage, upgrades } from './Player';
import { getPassedTime } from './Stage';

export const switchTab = (tab: string) => {
    if (global.tab !== tab) { //First hide all tabs, then show requested one
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

export const invisibleUpdate = () => {
    const passedTime = getPassedTime();
    particles.producing = earlyRound(0.5 * particles.current, 1); //1 for now, since its only max 1 number
    const beforeQuarks = quarks.current;
    quarks.current = earlyRound(quarks.current + particles.producing * passedTime);
    quarks.total = earlyRound(quarks.total + quarks.current - beforeQuarks); //I think its fastest way (?)
};

export const visualUpdate = () => {
    if (global.footer) {
        getId('quarks').textContent = `Quarks: ${finalFormat(quarks.current)}`;
        if (energy.total >= 9) {
            getId('energy').textContent = `Energy: ${energy.current}`;
            getId('energyStat').style.display = 'flex';
            getId('upgrades').style.display = 'flex';
        }
    }

    if (global.tab === 'stage') {
        getId('particlesCur').textContent = finalFormat(particles.current);
        getId('particlesProd').textContent = String(particles.producing);
        getId('particlesBtn').textContent = `Need: ${finalFormat(particles.cost)} Quarks`;
        if (particles.total >= 11) {
            getId('atomsMain').style.display = 'flex';
            getId('atomsCur').textContent = finalFormat(atoms.current);
            getId('atomsProd').textContent = String(atoms.producing);
            getId('atomsBtn').textContent = `Need: ${finalFormat(atoms.cost)} Particles`;
        }
        if (atoms.total >= 2) {
            getId('moleculesMain').style.display = 'flex';
            getId('moleculesCur').textContent = finalFormat(molecules.current);
            getId('moleculesProd').textContent = String(molecules.producing);
            getId('moleculesBtn').textContent = `Need: ${finalFormat(molecules.cost)} Atoms`;
        }
        if (molecules.total >= 2 && stage === 1) {
            getId('stageReset').textContent = 'Enter next stage';
        }
    }
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
/* aria-disable for maxed upgrades */
