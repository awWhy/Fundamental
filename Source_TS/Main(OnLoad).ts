import { quarks, particles, atoms, molecules, intervals, player, global } from './Player';
import { getUpgradeDescription, invisibleUpdate, switchTab, numbersUpdate, visualUpdate } from './Update';
import { buyBuilding, buyUpgrades, stageResetCheck } from './Stage';

/* There might be some problems with incorect build, imports being called in wrong order.
    One way to solve an error with arrow function being called before assigned, could be just turning it into function.
    Only time when not to convert arrow function ( => ) into normal function if it using this. inside another function*/

export const getId = (id: string) => { //To type less and check if ID exist
    const i = document.getElementById(id);
    if (i !== null) {
        return i;
    }
    throw new TypeError(`ID "${id}" not found.`); //New or not, wont change result
};

export const reLoad = () => {
    switchTab('first');
    visualUpdate();
    getId('stageReset').textContent = 'You are not ready';
    const word = ['Microworld', 'Submerged'];
    getId('stageWord').textContent = `${word[global.stage - 1]}`;
    //switchTheme(theme, boolean for initial);
    numbersUpdate();
    //Hide footer
};

reLoad();

/* Stage tab */
getId('particlesBtn').addEventListener('click', () => buyBuilding(quarks, particles));
getId('atomsBtn').addEventListener('click', () => buyBuilding(particles, atoms));
getId('moleculesBtn').addEventListener('click', () => buyBuilding(atoms, molecules));
for (let i = 1; i <= player.upgrades.length; i++) {
    getId(`upgrade${i}`).addEventListener('mouseover', () => getUpgradeDescription(i));
    getId(`upgrade${i}`).addEventListener('click', () => buyUpgrades(i));
    getId(`upgrade${i}`).addEventListener('focus', () => buyUpgrades(i)); //Atempt to give Screen Readers ability to buy upgrades
}
getId('stageReset').addEventListener('click', () => stageResetCheck());

/* Settings tab */

getId('save').addEventListener('click', /*async*/() => saveLoad('save'));
getId('file').addEventListener('change', /*async*/() => saveLoad('load'));
getId('export').addEventListener('click', /*async*/() => saveLoad('export'));
getId('delete').addEventListener('click', /*async*/() => saveLoad('delete'));

/* Footer */
getId('stageTabBtn').addEventListener('click', () => switchTab('stage'));
getId('settingsTabBtn').addEventListener('click', () => switchTab('settings'));

/* Intervals */
setInterval(invisibleUpdate, intervals.main);
setInterval(numbersUpdate, intervals.numbers);
setInterval(visualUpdate, intervals.visual);

/*async */function saveLoad(type: string) {
    switch (type) {
        /* case 'load': {
            const id = getId('file') as HTMLInputElement;
            const saveFile = id.files;
            if (saveFile === null) {
                return console.error('Loaded file was null');
            }
            const text = await saveFile[0].text();
            break;
        }*/
        case 'save':
            break;
        case 'export':
            break;
        case 'delete':
            break;
    }
}
