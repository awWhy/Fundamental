import { player, global, playerStart, globalStart } from './Player';
import { getUpgradeDescription, invisibleUpdate, switchTab, numbersUpdate, visualUpdate, finalFormat } from './Update';
import { buyBuilding, buyUpgrades, stageResetCheck } from './Stage';
import { alert } from './Special';

/* There might be some problems with incorect build, imports being called in wrong order. */

export const getId = (id: string) => { //To type less and check if ID exist
    const i = document.getElementById(id);
    if (i !== null) {
        return i;
    }
    throw new TypeError(`ID "${id}" not found.`); //New or not, wont change result
};

const updatePlayer = (load: any) => {
/*  if (player.upgrades.length > load.player.upgrades.length) {
        for (let i = load.player.upgrades.length; i < player.upgrades.length; i++) {
            load.player.upgrades[i] = 0;
        }
    } //I'm sad, I wrote it to auto add missing upgrades, but then instanly found better way to check for missing id... (by just using playerStart) */
    if (Object.prototype.hasOwnProperty.call(load, 'player') && Object.prototype.hasOwnProperty.call(load, 'global')) {
        Object.assign(player, load.player);
        global.intervals = load.global.intervals;
        global.stage = load.global.stage;
    } else {
        console.warn('Save coudn\'t be loaded as its missing important info');
    }
};

export const reLoad = (loadSave = false) => {
    if (loadSave) {
        const save = localStorage.getItem('save');
        if (save !== null) {
            const load = JSON.parse(atob(save));
            /* No try... catch, because I don't think it's possible to get wrong item from localStorage */
            updatePlayer(load);
            alert(`Welcome back, you were away for ${finalFormat((Date.now() - player.time.lastUpdate) / 3600000)} hours`);
        } else {
            console.warn('Save file wasn\'t detected');
        }
    }
    switchTab();
    //switchTheme(theme, boolean for initial);
    //Hide footer

    getId('stageReset').textContent = 'You are not ready';
    const word = ['Microworld', 'Submerged'];
    getId('stageWord').textContent = word[global.stage - 1];
    if (player.energy.total >= 9) {
        for (let i = 0; i < player.upgrades.length; i++) {
            if (player.upgrades[i] === 1) {
                getId(`upgrade${[i + 1]}`).style.backgroundColor = 'forestgreen';
            }
        }
    }
    if (global.stage > 1) {
        for (let i = 0; i < player.upgradesW.length; i++) {
            if (player.upgradesW[i] === 1) {
                getId(`upgradeW${[i + 1]}`).style.backgroundColor = 'forestgreen';
            }
        }
    }
};

reLoad(true);

/* Stage tab */
getId('particlesBtn').addEventListener('click', () => buyBuilding(player.quarks, player.particles));
getId('atomsBtn').addEventListener('click', () => buyBuilding(player.particles, player.atoms));
getId('moleculesBtn').addEventListener('click', () => buyBuilding(player.atoms, player.molecules));
for (let i = 1; i <= playerStart.upgrades.length; i++) {
    getId(`upgrade${i}`).addEventListener('mouseover', () => getUpgradeDescription(i));
    getId(`upgrade${i}`).addEventListener('click', () => buyUpgrades(i));
    getId(`upgrade${i}`).addEventListener('focus', () => buyUpgrades(i)); //Atempt to give Screen Readers ability to buy upgrades
}
for (let i = 1; i <= playerStart.upgradesW.length; i++) {
    getId(`upgradeW${i}`).addEventListener('mouseover', () => getUpgradeDescription(i, 'water'));
    getId(`upgradeW${i}`).addEventListener('click', () => buyUpgrades(i, 'water'));
    getId(`upgradeW${i}`).addEventListener('focus', () => buyUpgrades(i, 'water'));
}
getId('stageReset').addEventListener('click', () => stageResetCheck());

/* Settings tab */
getId('save').addEventListener('click', async() => await saveLoad('save'));
getId('file').addEventListener('change', async() => await saveLoad('load'));
getId('export').addEventListener('click', async() => await saveLoad('export'));
getId('delete').addEventListener('click', async() => await saveLoad('delete'));

/* Footer */
getId('stageTabBtn').addEventListener('click', () => switchTab('stage'));
getId('settingsTabBtn').addEventListener('click', () => switchTab('settings'));

/* Intervals */
setInterval(invisibleUpdate, global.intervals.main);
setInterval(numbersUpdate, global.intervals.numbers);
setInterval(visualUpdate, global.intervals.visual);
//setInterval(saveLoad, global.intervals.autoSave, 'save'); //Easier to test when its off

/* Promise returned in function argument where a void return was expected. */
/* I have no idea what does that even mean... I have to use async since 'await saveFile[0].text()' must have await in it.*/
async function saveLoad(type: string) {
    switch (type) {
        case 'load': {
            const id = getId('file') as HTMLInputElement;
            const saveFile = id.files;
            if (saveFile === null) {
                return console.error('Loaded file wasn\'t found');
            }
            const text = await saveFile[0].text();

            try {
                const load = JSON.parse(atob(text));
                updatePlayer(load);
                reLoad();
            } catch {
                console.warn('Incorrect save file format');
            } finally {
                id.value = ''; //Remove inputed file
            }
            break;
        }
        case 'save': {
            const save = btoa(`{"player":${JSON.stringify(player)},"global":{"intervals":${JSON.stringify(global.intervals)},"stage":${JSON.stringify(global.stage)}}}`);
            localStorage.setItem('save', save);
            getId('isSaved').textContent = 'Saved';
            global.lastSave = 0;
            break;
        }
        case 'export': {
            await saveLoad('save');
            const save = localStorage.getItem('save');
            if (save === null) {
                return console.warn('Save file wasn\'t found. Even though game was saved just now...');
            }
            const a = document.createElement('a');
            a.href = 'data:text/plain;charset=utf-8,' + save;
            a.download = 'test.txt'; //Add choice for a name, later
            a.click();
            break;
        }
        case 'delete': {
            localStorage.clear();
            const deletePlayer = structuredClone(playerStart);
            const deleteGlobal = structuredClone(globalStart);
            Object.assign(player, deletePlayer);
            Object.assign(global, deleteGlobal);
            player.time.started = Date.now();
            player.time.lastUpdate = player.time.started;
            reLoad();
            break;
        }
    }
}
