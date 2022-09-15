import { player, global, playerStart, updatePlayer, startValue } from './Player';
import { getUpgradeDescription, invisibleUpdate, switchTab, numbersUpdate, visualUpdate, format, stageCheck } from './Update';
import { buyBuilding, buyUpgrades, dischargeResetCheck, stageResetCheck, toggleBuy, toggleSwap } from './Stage';
import { Alert, Confirm, hideFooter, Prompt, setTheme, changeFontSize, switchTheme, screenReaderSupport } from './Special';

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
            Alert('Welcome. This is a test-project. Since I don\'t expect anyone to play this, save file can get corrupted with a new version.');
            //Alert("Welcome to 'Fundamental'. This is a test-project made by awWhy. Supported by modern browsers, also should have good suport for phones and screen readers (for screen readers need to turn support ON in settings). was inspired by 'Synergism', 'Antimatter Dimensions' and others.");
        }
        if (theme !== null) {
            global.theme.default = false;
            global.theme.stage = Number(theme);
        }
    }
    screenReaderSupport(false, 'toggle', 'reload'); //If screen reader support is ON, then it will change some stuff
    stageCheck(); //Visual and other stage information (like next reset goal)
    switchTab(); //Sets tab to Stage, also visual and number update
    changeFontSize(); //Changes font size
    //Upgrade hover text won't reset when reload, but no idea if it should
    for (let i = 0; i < playerStart.toggles.length; i++) {
        toggleSwap(i, false); //Gives toggles proper visual appearance
    }
    toggleBuy(); //Sets buy toggle's (for buildings) into saved number
    switchTheme(); //Changes theme

    if (loadSave && !player.toggles[0]) {
        const noOffline = await Confirm(`Welcome back, you were away for ${format((Date.now() - player.time.updated), 0, 'time')}. Game was set to have offline time disabled. Press confirm to NOT to gain offline time.`);
        if (noOffline) { player.time.updated = Date.now(); }
    }
    changeIntervals(false, 'all'); //Will 'unpause' game, also set all of inputs values
};

void reLoad(true);

/* Global */
const { screenReader } = global;
for (let i = 0; i < playerStart.toggles.length; i++) {
    getId(`toggle${i}`).addEventListener('click', () => toggleSwap(i));
}

/* Stage tab (stage 1) */
for (let i = 1; i < playerStart.buildings.length; i++) {
    getId(`building${i}Btn`).addEventListener('click', () => buyBuilding(player.buildings, i));
}
for (let i = 0; i < global.upgradesInfo.cost.length; i++) {
    getId(`upgrade${i + 1}`).addEventListener('mouseover', () => getUpgradeDescription(i));
    getId(`upgrade${i + 1}`).addEventListener('click', () => buyUpgrades(i));
    if (screenReader) { getId(`upgrade${i + 1}`).addEventListener('focus', () => buyUpgrades(i)); }
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
for (let i = 0; i < global.researchesInfo.cost.length; i++) {
    getId(`research${i + 1}Stage1Image`).addEventListener('mouseover', () => getUpgradeDescription(i, 'researches'));
    getId(`research${i + 1}Stage1Image`).addEventListener('click', () => buyUpgrades(i, 'researches'));
    if (screenReader) { getId(`research${i + 1}Stage1Image`).addEventListener('focus', () => buyUpgrades(i, 'researches')); }
}
for (let i = 0; i < global.researchesAutoInfo.cost.length; i++) {
    getId(`researchAuto${i + 1}Image`).addEventListener('mouseover', () => getUpgradeDescription(i, 'researchesAuto'));
    getId(`researchAuto${i + 1}Image`).addEventListener('click', () => buyUpgrades(i, 'researchesAuto'));
    if (screenReader) { getId(`researchAuto${i + 1}Image`).addEventListener('focus', () => buyUpgrades(i, 'researchesAuto')); }
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
getId('mainInterval').addEventListener('blur', () => changeIntervals(false, 'main'));
getId('numbersInterval').addEventListener('blur', () => changeIntervals(false, 'numbers'));
getId('visualInterval').addEventListener('blur', () => changeIntervals(false, 'visual'));
getId('autoSaveInterval').addEventListener('blur', () => changeIntervals(false, 'autoSave'));
getId('pauseGame').addEventListener('click', async() => await pauseGame());
getId('toggle3').addEventListener('click', () => changeFontSize());
getId('customFontSize').addEventListener('blur', () => changeFontSize(true));
/* Only for screen readers */
getId('screenReaderToggle').addEventListener('click', () => screenReaderSupport(true));
if (screenReader) {
    for (let i = 0; i < playerStart.buildings.length; i++) {
        getId(`invisibleGetBuilding${i}`).addEventListener('click', () => screenReaderSupport(i, 'button'));
    }
    getId('invisibleGetResource1').addEventListener('click', () => screenReaderSupport(0, 'button', 'resource'));
    getId('specialTabBtn').addEventListener('click', () => switchTab('special'));
} else {
    getId('specialTabBtn').style.display = 'none';
}

/* Footer */
getId('hideToggle').addEventListener('click', hideFooter);
getId('stageTabBtn').addEventListener('click', () => switchTab('stage'));
getId('researchTabBtn').addEventListener('click', () => switchTab('research'));
getId('settingsTabBtn').addEventListener('click', () => switchTab('settings'));

/* Intervals */
function changeIntervals(pause = false, input = '') {
    const { intervals, intervalsId } = global;
    if (input !== '') {
        const mainInput = getId('mainInterval') as HTMLInputElement;
        const numberInput = getId('numbersInterval') as HTMLInputElement;
        const visualInput = getId('visualInterval') as HTMLInputElement;
        const autoSaveInput = getId('autoSaveInterval') as HTMLInputElement;
        if (input === 'main') {
            intervals.main = Math.min(Math.max(Math.trunc(Number(mainInput.value)), 20), 1000);
            if (intervals.main > intervals.numbers) { intervals.numbers = intervals.main; }
        } else if (input === 'numbers') {
            const value = Math.min(Math.max(Math.trunc(Number(numberInput.value)), 20), 1000);
            intervals.numbers = Math.max(value, intervals.main);
        } else if (input === 'visual') {
            intervals.visual = Math.min(Math.max(Math.trunc(Number(visualInput.value) * 10) / 10, 0.5), 10);
        } else if (input === 'autoSave') {
            intervals.autoSave = Math.min(Math.max(Math.trunc(Number(autoSaveInput.value)), 60), 1800);
        }
        mainInput.value = String(intervals.main);
        numberInput.value = String(intervals.numbers);
        visualInput.value = String(intervals.visual);
        autoSaveInput.value = String(intervals.autoSave);
    }
    clearInterval(intervalsId.main);
    clearInterval(intervalsId.numbers);
    clearInterval(intervalsId.visual);
    clearInterval(intervalsId.autoSave);
    if (!pause) {
        intervalsId.main = setInterval(invisibleUpdate, intervals.main);
        intervalsId.numbers = setInterval(numbersUpdate, intervals.numbers);
        intervalsId.visual = setInterval(visualUpdate, intervals.visual * 1000);
        intervalsId.autoSave = setInterval(saveLoad, intervals.autoSave * 1000, 'save');
    }
}

/* Promise returned in function argument where a void return was expected.
   I have no idea what does that even mean... I have to use async since 'await saveFile[0].text()' must have await in it.*/
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
            a.download = 'Fundamental.txt'; //Add choice for a name, later
            a.click();
            break;
        }
        case 'delete': {
            const ok = await Prompt("This will truly delete your save file!\nType 'delete' to confirm.");
            if (ok?.toLowerCase() === 'delete') {
                changeIntervals(true);
                localStorage.clear();
                /* This wont remove unused properties, but bellow will work if needed (or just refresh page after deleting save file)
                for (let i in player) {
                    if (Object.prototype.hasOwnProperty.call(player, i)) {
                        delete player[i as keyof typeof player];
                    }
                } */
                Object.assign(player, startValue('p'));
                Object.assign(global, startValue('g'));
                player.time.started = Date.now();
                player.time.updated = player.time.started;
                void reLoad();
            } else if (ok !== null && ok !== '') {
                Alert(`You wrote '${ok}', so save file wasn't deleted.`);
            }
            break;
        }
    }
}

const pauseGame = async() => {
    changeIntervals(true);
    const offline = await Prompt("Game is currently paused. Press any button bellow to unpause it. If you want you can enter 'NoOffline' to NOT to gain offline time. Offline timer has a limit.");
    if (offline?.toLowerCase() === 'nooffline') {
        player.time.updated = Date.now();
    } else if (offline !== null && offline !== '') {
        Alert(`You wrote '${offline}', so you gained offline time.`);
    }
    changeIntervals();
};
