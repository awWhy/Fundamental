import { quarks, particles, atoms, molecules, player, global } from './Player';
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
getId('building2').addEventListener('click', () => eventBuyBuilding(particles, atoms));
getId('building3').addEventListener('click', () => eventBuyBuilding(atoms, molecules));
//getId('stageReset').addEventListener('click', () => stageRestCheck());
getId('stageTabBtn').addEventListener('click', () => switchTab('Stage'));
getId('settingsTabBtn').addEventListener('click', () => switchTab('Settings'));

//setInterval(updateVisual, intervals.visual) //Later
console.log(player);
console.log(global);
/* I tryed to make numbers increment based on setInteval, but I think that would a bad idea, so trying Date.now() instead */
