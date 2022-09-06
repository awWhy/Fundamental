import { player, global, playerStart, globalStart, updatePlayer } from './Player';
import { getUpgradeDescription, invisibleUpdate, switchTab, numbersUpdate, visualUpdate, format, stageCheck } from './Update';
import { buyBuilding, buyUpgrades, dischargeResetCheck, stageResetCheck, toggleBuy, toggleSwap } from './Stage';
import { Alert, Confirm, hideFooter, Prompt, setTheme, changeFontSize, switchTheme } from './Special';

/* There might be some problems with incorect build, imports being called in wrong order. */

export const getId = (id: string) => { //To type less and check if ID exist
    const i = document.getElementById(id);
    if (i !== null) {
        return i;
    }
    Alert('Some ID failed to load, game won\'t be working properly. Please refresh.');
    throw new TypeError(`ID "${id}" not found.`);
};

export const reLoad = async(loadSave = false) => {
    if (loadSave) {
        const save = localStorage.getItem('save');
        const theme = localStorage.getItem('theme');
        if (save !== null) {
            const load = JSON.parse(atob(save));
            updatePlayer(load);
            if (player.toggles[0]) {
                Alert(`Welcome back, you were away for ${format((Date.now() - player.time.updated), 0, 'time')}.`);
            }
        } else {
            console.warn('Save file wasn\'t detected.');
        }
        if (theme !== null) {
            global.theme.default = false;
            global.theme.stage = Number(theme);
        }
    }
    const { time, toggles } = player;

    switchTab(); //Sets tab to Stage, also visual and number update
    changeFontSize(); //Changes font size
    stageCheck(); //Visual and other stage information (like next reset goal)
    /* I'm pretty sure upgrade hover text is not reset when loading, but no idea if it should be added */

    for (let i = 0; i < playerStart.toggles.length; i++) {
        toggleSwap(i, false); //Gives toggles proper visual appearance
    }
    toggleBuy(); //Sets buy toggle's (for buildings) into saved number
    switchTheme(); //Changes theme

    if (loadSave && !toggles[0]) {
        const noOffline = await Confirm(`Welcome back, you were away for ${format((Date.now() - time.updated), 0, 'time')}. Game was set to have offline time disabled. Press confirm to NOT to gain offline time.`);
        if (noOffline) { time.updated = Date.now(); }
    }
    changeIntervals(); //Will 'unpause' game
};

void reLoad(true);

/* Global */
for (let i = 0; i < playerStart.toggles.length; i++) {
    getId(`toggle${i}`).addEventListener('click', () => toggleSwap(i));
}

/* Stage tab (stage 1) */
for (let i = 1; i < playerStart.buildings.length; i++) {
    getId(`building${i}Btn`).addEventListener('click', () => buyBuilding(player.buildings, i));
}
for (let i = 0; i < playerStart.upgrades.length; i++) {
    getId(`upgrade${i + 1}`).addEventListener('mouseover', () => getUpgradeDescription(i));
    getId(`upgrade${i + 1}`).addEventListener('click', () => buyUpgrades(i));
    //getId(`upgrade${i + 1}`).addEventListener('focus', () => buyUpgrades(i)); //For Screen readers
    /* Fix focus double buying upgrades, maybe by adding a toggle to switch beetwin click and focus (?) */
}
getId('dischargeReset').addEventListener('click', async() => await dischargeResetCheck());
/* Don't know if there any need to load above one's, if stage !== 1 */
getId('stageReset').addEventListener('click', async() => await stageResetCheck());
getId('buy1x').addEventListener('click', () => toggleBuy('1'));
getId('buyAny').addEventListener('click', () => toggleBuy('any'));
getId('buyAnyInput').addEventListener('blur', () => toggleBuy('any'));
getId('buyMax').addEventListener('click', () => toggleBuy('max'));
getId('buyStrict').addEventListener('click', () => toggleBuy('strict'));

/* Research tab */
for (let i = 0; i < playerStart.researches.length; i++) {
    getId(`research${i + 1}Stage1Image`).addEventListener('mouseover', () => getUpgradeDescription(i, 'research'));
    getId(`research${i + 1}Stage1Image`).addEventListener('click', () => buyUpgrades(i, 'research'));
    //getId(`research${i + 1}Stage1Image`).addEventListener('focus', () => buyUpgrades(i, 'research'));
}
for (let i = 0; i < playerStart.researchesAuto.length; i++) {
    getId(`researchAuto${i + 1}Image`).addEventListener('mouseover', () => getUpgradeDescription(i, 'researchAuto'));
    getId(`researchAuto${i + 1}Image`).addEventListener('click', () => buyUpgrades(i, 'researchAuto'));
    //getId(`researchAuto${i + 1}Image`).addEventListener('focus', () => buyUpgrades(i, 'researchAuto'));
}

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
getId('toggle3').addEventListener('click', () => changeFontSize());
getId('customFontSize').addEventListener('blur', () => changeFontSize(true));

/* Footer */
getId('hideToggle').addEventListener('click', hideFooter);
getId('stageTabBtn').addEventListener('click', () => switchTab('stage'));
getId('researchTabBtn').addEventListener('click', () => switchTab('research'));
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
                const noOffline = await Confirm(`This save file was set to have offline progress disabled (currently ${format((Date.now() - player.time.updated), 0, 'time')}). Press confirm to NOT to gain offline time.`);
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
