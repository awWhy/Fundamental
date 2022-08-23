import { getId } from './Main(OnLoad)';
import { atoms, energy, global, molecules, particles, quarks } from './Player';

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

export const invisibleUpdate = () => {
    //
};

let atomsUnlocked = false;
let moleculesUnlocked = false;

export const visualUpdate = () => {
    if (global.footer) {
        getId('quarks').textContent = `Quarks: ${quarks.current}`;
        if (energy.total >= 12) {
            getId('energy').textContent = `Energy: ${energy.current}`;
            getId('energyStat').style.display = 'block';
        }
    }

    if (global.tab === 'stage') {
        getId('particlesCur').textContent = particles.current;
        getId('particlesProd').textContent = particles.producing;
        getId('particlesBtn').textContent = `Need: ${particles.cost} Quarks`;
        if (particles.current >= 2 || atomsUnlocked) {
            atomsUnlocked = true;
            getId('atomsMain').style.display = 'flex';
            getId('atomsCur').textContent = atoms.current;
            getId('atomsProd').textContent = atoms.producing;
            getId('atomsBtn').textContent = `Need: ${atoms.cost} Particles`;
        }
        if (atoms.current >= 11 || moleculesUnlocked) {
            moleculesUnlocked = true;
            getId('moleculesMain').style.display = 'flex';
            getId('moleculesCur').textContent = molecules.current;
            getId('moleculesProd').textContent = molecules.producing;
            getId('moleculesBtn').textContent = `Need: ${molecules.cost} Atoms`;
        }
    }
};

/* Dont forget to change aria-label to stuff like "Buy (buidlingName), (cost Number and a Word), (if can afford), (how many owned), (how much being produced per/s of cost building)" */
