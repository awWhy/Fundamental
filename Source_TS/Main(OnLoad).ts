import { quarks, particles, atoms, molecules, intervals, player } from './Player';
import { getUpgradeDescription, invisibleUpdate, switchTab, visualUpdate } from './Update';
import { buyBuilding } from './Stage';

export const getId = (id: string) => { //To type less and check if ID exist
    const i = document.getElementById(id);
    if (i !== null) {
        return i;
    }
    throw new TypeError(`ID "${id}" not found.`); //New or not, wont change result
};

/* Stage tab */
getId('particlesBtn').addEventListener('click', () => buyBuilding(quarks, particles));
getId('atomsBtn').addEventListener('click', () => buyBuilding(particles, atoms));
getId('moleculesBtn').addEventListener('click', () => buyBuilding(atoms, molecules));
for (let i = 1; i <= player.upgrades.length; i++) {
    getId(`upgrade${i}`).addEventListener('mouseover', () => getUpgradeDescription(i));
    //getId(`upgrade${i}`).addEventListener('click', () => buyUpgrade(i));
    getId(`upgrade${i}`).addEventListener('focus', () => getUpgradeDescription(i)); //Atempt to give Screen Readers ability to buy upgrades
    //getId(`upgrade${i}`).addEventListener('focus', () => buyUpgrade(i));
}
//getId('stageReset').addEventListener('click', () => stageResetCheck());

/* Footer */
getId('stageTabBtn').addEventListener('click', () => switchTab('stage'));
getId('settingsTabBtn').addEventListener('click', () => switchTab('settings'));

setInterval(invisibleUpdate, intervals.main);
setInterval(visualUpdate, intervals.numbers);
