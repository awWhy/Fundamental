import { quarks, particles, atoms, molecules, intervals } from './Player';
import { invisibleUpdate, switchTab, visualUpdate } from './Update';
import { buyBuilding } from './Stage';

export const getId = (id: string) => { //To type less and check if ID exist
    const i = document.getElementById(id);
    if (i !== null) {
        return i;
    }
    throw new TypeError(`ID "${id}" not found.`); //New or not, wont change result
};

getId('particlesBtn').addEventListener('click', () => buyBuilding(quarks, particles));
getId('atomsBtn').addEventListener('click', () => buyBuilding(particles, atoms));
getId('moleculesBtn').addEventListener('click', () => buyBuilding(atoms, molecules));
//getId('stageReset').addEventListener('click', () => stageRestCheck());
getId('stageTabBtn').addEventListener('click', () => switchTab('stage'));
getId('settingsTabBtn').addEventListener('click', () => switchTab('settings'));

setInterval(invisibleUpdate, intervals.main);
setInterval(visualUpdate, intervals.numbers);
