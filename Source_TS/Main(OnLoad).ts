import { quarks, particles } from './Player';
import { switchTab } from './Update';
import { eventBuyBuilding } from './Stage';

export const getId = (id: string) => { //To type less and check if ID exist
    const i = document.getElementById(id);
    if (i !== null) {
        return i;
    }
    throw new TypeError(`ID "${id}" not found.`); //New or not, wont change result
};

getId('building1').addEventListener('click', () => eventBuyBuilding(quarks, particles));
getId('stageTabBtn').addEventListener('click', () => switchTab('Stage'));
getId('settingsTabBtn').addEventListener('click', () => switchTab('Settings'));
