import { quarks, particles, atoms, molecules, intervals, player, global } from './Player';
import { getUpgradeDescription, invisibleUpdate, switchTab, numbersUpdate, visualUpdate } from './Update';
import { buyBuilding, buyUpgrades, stageResetCheck } from './Stage';

/* There might be some problems with incorect build, imports being called in wrong order.
    One way to solve errors wth arrow function being called before assigned, could be just turning it into function.
    Only time when not to convert arrow function ( => ) into normal function if it using this. inside another function*/

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
    getId(`upgrade${i}`).addEventListener('click', () => buyUpgrades(i));
    getId(`upgrade${i}`).addEventListener('focus', () => getUpgradeDescription(i)); //Atempt to give Screen Readers ability to buy upgrades
    getId(`upgrade${i}`).addEventListener('focus', () => buyUpgrades(i));
}
getId('stageReset').addEventListener('click', () => stageResetCheck());

/* Footer */
getId('stageTabBtn').addEventListener('click', () => switchTab('stage'));
getId('settingsTabBtn').addEventListener('click', () => switchTab('settings'));

export const reLoad = () => {
    visualUpdate();
    getId('stageReset').textContent = 'You are not ready';
    const s = global.stage;
    if (s === 1) {
        getId('stageWord').textContent = 'Microworld';
    }
    if (s === 2) {
        getId('stageWord').textContent = 'Submerged';
    }
    //switchTheme(theme, boolean for initial)
    numbersUpdate();
};

reLoad();
setInterval(invisibleUpdate, intervals.main);
setInterval(numbersUpdate, intervals.numbers);
setInterval(visualUpdate, intervals.visual);
