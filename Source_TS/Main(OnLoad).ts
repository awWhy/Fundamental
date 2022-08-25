import { player, global, playerStart, globalStart } from './Player';
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

export const reLoad = (loadSave = false, deleteSave = false) => {
    if (deleteSave) {
        const deletePlayer = structuredClone(playerStart);
        const deleteGlobal = structuredClone(globalStart);
        Object.assign(player, deletePlayer);
        Object.assign(global, deleteGlobal);
    }
    if (loadSave) {
        const save = localStorage.getItem('save');
        if (save !== null) {
            const load = JSON.parse(save);
            Object.assign(player, load.player);
            global.intervals = load.global.intervals;
            global.stage = load.global.stage;
        } else {
            console.warn('Save file wasn\'t detected');
        }
    }
    switchTab('first');
    visualUpdate();
    numbersUpdate();
    //switchTheme(theme, boolean for initial);
    //Hide footer

    const { stage } = global;
    const { energy, upgrades } = player;

    getId('stageReset').textContent = 'You are not ready';
    const word = ['Microworld', 'Submerged'];
    getId('stageWord').textContent = `${word[stage - 1]}`;
    if (energy.total >= 9) {
        for (let i = 0; i < upgrades.length; i++) {
            if (upgrades[i] === 1) {
                getId(`upgrade${[i + 1]}`).style.backgroundColor = 'forestgreen';
            }
        }
    }
};

reLoad(true);

/* Stage tab */
getId('particlesBtn').addEventListener('click', () => buyBuilding(player.quarks, player.particles));
getId('atomsBtn').addEventListener('click', () => buyBuilding(player.particles, player.atoms));
getId('moleculesBtn').addEventListener('click', () => buyBuilding(player.atoms, player.molecules));
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
setInterval(invisibleUpdate, global.intervals.main);
setInterval(numbersUpdate, global.intervals.numbers);
setInterval(visualUpdate, global.intervals.visual);
//setInterval(saveLoad, global.intervals.autoSave, 'save'); //Easier to test when its off

/*async */function saveLoad(type: string) {
    switch (type) {
        /* case 'load': {
            const id = getId('file') as HTMLInputElement;
            const saveFile = id.files;
            if (saveFile === null) {
                return console.error('Loaded file was null');
            }
            const text = await saveFile[0].text();

            //Should work, will test later
            const load = JSON.parse(text);
            break;
        }*/
        case 'save': {
            /* Turn into 64 bit to save space and make it not easy to cheat */
            const save = `{"player":${JSON.stringify(player)},"global":{"intervals":${JSON.stringify(global.intervals)},"stage":${JSON.stringify(global.stage)}}}`;
            localStorage.setItem('save', save);
            break;
        }
        case 'export':
            break;
        case 'delete':
            localStorage.clear();
            reLoad(false, true);
            break;
    }
}
