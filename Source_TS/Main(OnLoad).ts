import { player, global, playerStart, globalStart } from './Player';
import { getUpgradeDescription, invisibleUpdate, switchTab, numbersUpdate, visualUpdate, finalFormat } from './Update';
import { buyBuilding, buyUpgrades, calculateBuildingsCost, dischargeResetCheck, stageResetCheck, toggleSwap } from './Stage';
import { Alert, Confirm, Prompt, setTheme, switchTheme } from './Special';

/* There might be some problems with incorect build, imports being called in wrong order. */

export const getId = (id: string) => { //To type less and check if ID exist
    const i = document.getElementById(id);
    if (i !== null) {
        return i;
    }
    Alert('Some ID failed to load, game won\'t be working properly. Please refresh.');
    throw new TypeError(`ID "${id}" not found.`);
};

const updatePlayer = (load: any) => {
    if (Object.prototype.hasOwnProperty.call(load, 'player') && Object.prototype.hasOwnProperty.call(load, 'global')) {
        Object.assign(player, load.player);
        global.intervals = load.global.intervals;
    } else {
        Alert('Save file coudn\'t be loaded as its missing important info.');
    }
};

export const reLoad = async(type = 'normal') => {
    if (type === 'load') {
        const save = localStorage.getItem('save');
        const theme = localStorage.getItem('theme');
        if (save !== null) {
            const load = JSON.parse(atob(save));
            updatePlayer(load);
            if (player.toggles[0]) {
                Alert(`Welcome back, you were away for ${finalFormat((Date.now() - player.time.updated), 0, 'time')}.`);
            }
        } else {
            console.warn('Save file wasn\'t detected.');
        }
        if (theme !== null) {
            global.theme.default = false;
            global.theme.stage = Number(theme);
        }
    }
    const { stage, discharge, buildings, upgrades, time, toggles } = player;
    const { stageInfo, dischargeInfo } = global;

    for (let i = 1; i < buildings.length; i++) {
        calculateBuildingsCost(i);
    }
    dischargeInfo.cost = 10 ** discharge.current;
    switchTab();
    switchTheme();
    getId('stageReset').textContent = 'You are not ready';
    getId('stageWord').textContent = stageInfo.word[stage - 1];
    getId('stageWord').style.color = stageInfo.wordColor[stage - 1];
    for (let i = 0; i < playerStart.toggles.length; i++) {
        toggleSwap(i, false);
    }
    for (let i = 0; i < playerStart.upgrades.length; i++) {
        if (upgrades[i] === 1) {
            getId(`upgrade${[i + 1]}`).style.backgroundColor = 'forestgreen';
        } else {
            getId(`upgrade${[i + 1]}`).style.backgroundColor = '';
        }
    }
    if (type === 'load' && !toggles[0]) {
        const noOffline = await Confirm(`Welcome back, you were away for ${finalFormat((Date.now() - time.updated), 0, 'time')}. Game was set to have offline time disabled. Press confirm to NOT to gain offline time.`);
        if (noOffline) { time.updated = Date.now(); }
    }
    //Add function to hide footer here
    changeIntervals();
};

void reLoad('load');

/* Global */
for (let i = 0; i < playerStart.toggles.length; i++) {
    getId(`toggle${i}`).addEventListener('click', () => toggleSwap(i));
}

/* Stage tab */
for (let i = 1; i < playerStart.buildings.length; i++) {
    getId(`building${i}Btn`).addEventListener('click', () => buyBuilding(player.buildings, i));
}
for (let i = 0; i < playerStart.upgrades.length; i++) {
    getId(`upgrade${i + 1}`).addEventListener('mouseover', () => getUpgradeDescription(i));
    getId(`upgrade${i + 1}`).addEventListener('click', () => buyUpgrades(i));
    getId(`upgrade${i + 1}`).addEventListener('focus', () => buyUpgrades(i)); //Atempt to give Screen Readers ability to buy upgrades
}
getId('stageReset').addEventListener('click', async() => await stageResetCheck());
getId('dischargeReset').addEventListener('click', async() => await dischargeResetCheck());

/* Settings tab */
getId('save').addEventListener('click', async() => await saveLoad('save'));
getId('file').addEventListener('change', async() => await saveLoad('load'));
getId('export').addEventListener('click', async() => await saveLoad('export'));
getId('delete').addEventListener('click', async() => await saveLoad('delete'));
getId('switchTheme0').addEventListener('click', () => setTheme(0, true));
for (let i = 1; i <= global.stageInfo.word.length; i++) {
    getId(`switchTheme${i}`).addEventListener('click', () => setTheme(i));
}
getId('pauseGame').addEventListener('click', async() => await pauseGame());

/* Footer */
getId('stageTabBtn').addEventListener('click', () => switchTab('stage'));
getId('settingsTabBtn').addEventListener('click', () => switchTab('settings'));

/* Intervals */
function changeIntervals(pause = false) {
    const { intervals, intervalsId } = global;

    clearInterval(intervalsId.main);
    clearInterval(intervalsId.numbers);
    clearInterval(intervalsId.visual);
    clearInterval(intervalsId.autoSave);
    if (!pause) {
        intervalsId.main = setInterval(invisibleUpdate, intervals.main);
        intervalsId.numbers = setInterval(numbersUpdate, intervals.numbers);
        intervalsId.visual = setInterval(visualUpdate, intervals.visual);
        intervalsId.autoSave = setInterval(saveLoad, intervals.autoSave, 'save');
    }
}

/* Promise returned in function argument where a void return was expected. */
/* I have no idea what does that even mean... I have to use async since 'await saveFile[0].text()' must have await in it.*/
async function saveLoad(type: string) {
    switch (type) {
        case 'load': {
            const id = getId('file') as HTMLInputElement;
            const saveFile = id.files;
            if (saveFile === null) {
                return Alert('Loaded file wasn\'t found.');
            }
            const text = await saveFile[0].text();

            try {
                const load = JSON.parse(atob(text));
                changeIntervals(true);
                updatePlayer(load);
                const noOffline = await Confirm(`This save file was set to have offline progress disabled (currently ${finalFormat((Date.now() - player.time.updated), 0, 'time')}). Press confirm to NOT to gain offline time.`);
                if (noOffline) {
                    player.time.updated = Date.now();
                }
                void reLoad();
            } catch {
                Alert('Incorrect save file format.');
            } finally {
                id.value = ''; //Remove inputed file
            }
            break;
        }
        case 'save': {
            const save = btoa(`{"player":${JSON.stringify(player)},"global":{"intervals":${JSON.stringify(global.intervals)}}}`);
            localStorage.setItem('save', save);
            getId('isSaved').textContent = 'Saved';
            global.lastSave = 0;
            break;
        }
        case 'export': {
            await saveLoad('save');
            const save = localStorage.getItem('save');
            if (save === null) {
                return Alert('Save file wasn\'t found. Even though game was saved just now...');
            }
            const a = document.createElement('a');
            a.href = 'data:text/plain;charset=utf-8,' + save;
            a.download = 'test.txt'; //Add choice for a name, later
            a.click();
            break;
        }
        case 'delete': {
            const ok = await Prompt("This will truly delete your save file!\nType 'delete' to confirm.");
            if (ok !== false && ok.toLowerCase() === 'delete') {
                changeIntervals(true);
                localStorage.clear();
                const deletePlayer = structuredClone(playerStart);
                const deleteGlobal = structuredClone(globalStart);
                /* I'm pretty sure this method wont clear out save completely. But `for (let i in player) { if (player.hasOwnProperty(i)) { delete player[i]; } }` could work. (?) */
                Object.assign(player, deletePlayer);
                Object.assign(global, deleteGlobal);
                player.time.started = Date.now();
                player.time.updated = player.time.started;
                void reLoad();
            } else if (ok !== false) {
                Alert('Save file wasn\'t deleted.');
            }
            break;
        }
    }
}

const pauseGame = async() => {
    changeIntervals(true);
    const offline = await Prompt("Game is currently paused. Press any button bellow to unpause it. If you want you can enter 'NoOffline' to NOT to gain offline time.");
    if (offline !== false && offline.toLowerCase() === 'nooffline') {
        player.time.updated = Date.now();
    }
    changeIntervals();
};
