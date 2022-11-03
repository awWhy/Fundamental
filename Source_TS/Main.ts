import { player, global, playerStart, updatePlayer, startValue, checkPlayerValues } from './Player';
import { getUpgradeDescription, invisibleUpdate, switchTab, numbersUpdate, visualUpdate, format, stageCheck, maxOfflineTime } from './Update';
import { buyBuilding, buyUpgrades, collapseResetCheck, dischargeResetCheck, rankResetCheck, stageResetCheck, toggleBuy, toggleSwap, vaporizationResetCheck } from './Stage';
import { Alert, Confirm, hideFooter, Prompt, setTheme, changeFontSize, switchTheme, screenReaderSupport, mobileDeviceSupport } from './Special';
import { detectHotkey } from './Hotkeys';
/* There might be some problems with incorect build, imports being called in wrong order. */

export const getId = (id: string) => { //To type less and check if ID exist
    const i = document.getElementById(id);
    if (i !== null) { return i; }
    Alert(`ID of HTML element (${id}), failed to load, game will not work properly, please refresh. If this happens more than once, then please report it`);
    throw new ReferenceError(`ID "${id}" not found.`);
};

export const getClass = (idCollection: string) => Array.from(document.getElementsByClassName(idCollection) as HTMLCollectionOf<HTMLElement>);

export const reLoad = async(firstLoad = false) => {
    if (firstLoad) {
        console.time('Game loaded in'); //Just for fun
        const save = localStorage.getItem('save');
        const theme = localStorage.getItem('theme');
        if (save !== null) {
            const load = JSON.parse(atob(save));
            updatePlayer(load);
            if (player.toggles.normal[0]) {
                const offlineTime = Date.now() - player.time.updated;
                Alert(`Welcome back, you were away for ${format(offlineTime, 0, 'time')}.${offlineTime > maxOfflineTime() * 1000 ? ` (Max offline time is ${global.timeSpecial.maxOffline / 3600} hours)` : ''}${global.versionInfo.changed ? `\nGame has been updated to ${player.version}, ${global.versionInfo.log}` : `\nCurrent version is ${player.version}`}`);
            }
        } else {
            Alert(`Welcome to 'Fundamental'.\nThis is a test-project made by awWhy. Should be supported by modern browsers, phones and screen readers (need to turn support ON in settings).\nWas inspired by 'Synergism', 'Antimatter Dimensions' and others.\nCurrent version is ${player.version}`);
        }
        if (theme !== null) {
            global.theme.default = false;
            global.theme.stage = Number(theme);
        }

        /* These one's better to do only on page reload */
        mobileDeviceSupport();
        screenReaderSupport(false, 'toggle', 'reload');
        changeFontSize();
    }
    stageCheck(); //All related stage information and visualUpdate();
    checkPlayerValues(); //Has to be done after stageCheck();
    if (firstLoad) { //Prevent spoilers
        getId('body').style.display = '';
        getId('loading').style.display = 'none';
        console.timeEnd('Game loaded in');
    }
    //Visual appearence of toggles
    for (let i = 0; i < playerStart.toggles.normal.length; i++) { toggleSwap(i, 'normal'); }
    for (let i = 1; i < playerStart.toggles.buildings.length; i++) { toggleSwap(i, 'buildings'); }
    for (let i = 0; i < playerStart.toggles.auto.length; i++) { toggleSwap(i, 'auto'); }
    toggleBuy(); //Also numbersUpdate();
    switchTheme();

    if (firstLoad && !player.toggles.normal[0]) {
        const offlineTime = Date.now() - player.time.updated;
        const noOffline = await Confirm(`Welcome back, you were away for ${format(offlineTime, 0, 'time')}${offlineTime > maxOfflineTime() * 1000 ? ` (max offline time is ${global.timeSpecial.maxOffline / 3600} hours)` : ''}. Game was set to have offline time disabled. Press confirm to NOT to gain offline time.${global.versionInfo.changed ? `\nAlso game has been updated to ${player.version}, ${global.versionInfo.log}` : `\nCurrent version is ${player.version}`}`);
        if (noOffline) {
            global.timeSpecial.lastSave += offlineTime;
            player.time.updated = Date.now();
        }
    }
    changeIntervals(false, 'all'); //Will 'unpause' game, also set all of inputs values
    invisibleUpdate(); //Just in case
};

void reLoad(true); //This will start the game

/* Global */
const { mobileDevice, screenReader } = global;
document.addEventListener('keydown', (key: KeyboardEvent) => detectHotkey(key));
for (let i = 0; i < playerStart.toggles.normal.length; i++) {
    getId(`toggle${i}`).addEventListener('click', () => toggleSwap(i, 'normal', true));
}
for (let i = 1; i < playerStart.toggles.buildings.length; i++) {
    getId(`toggleBuilding${i}`).addEventListener('click', () => toggleSwap(i, 'buildings', true));
}
for (let i = 0; i < playerStart.toggles.auto.length; i++) {
    getId(`toggleAuto${i}`).addEventListener('click', () => toggleSwap(i, 'auto', true));
}

/* Stage tab */
for (let i = 1; i < playerStart.buildings.length; i++) {
    getId(`building${i}Btn`).addEventListener('click', () => buyBuilding(i));
}
for (let i = 0; i < global.upgradesInfo.cost.length; i++) {
    getId(`upgrade${i + 1}`).addEventListener('mouseover', () => getUpgradeDescription(i, 'upgrades', 1));
    getId(`upgrade${i + 1}`).addEventListener('click', () => buyUpgrades(i, 'upgrades', 1));
    if (screenReader || mobileDevice) { getId(`upgrade${i + 1}`).addEventListener('focus', () => getUpgradeDescription(i, 'upgrades', 1)); }
}
//Number at the end, is a prevention for impossible event (HTML element is hidden). No number (or 0) means it allowed to be called from any stage
for (let i = 0; i < global.upgradesS2Info.cost.length; i++) {
    getId(`upgradeW${i + 1}`).addEventListener('mouseover', () => getUpgradeDescription(i, 'upgrades', 2));
    getId(`upgradeW${i + 1}`).addEventListener('click', () => buyUpgrades(i, 'upgrades', 2));
    if (screenReader || mobileDevice) { getId(`upgradeW${i + 1}`).addEventListener('focus', () => getUpgradeDescription(i, 'upgrades', 2)); }
}
for (let i = 0; i < global.upgradesS3Info.cost.length; i++) {
    getId(`upgradeA${i + 1}`).addEventListener('mouseover', () => getUpgradeDescription(i, 'upgrades', 3));
    getId(`upgradeA${i + 1}`).addEventListener('click', () => buyUpgrades(i, 'upgrades', 3));
    if (screenReader || mobileDevice) { getId(`upgradeA${i + 1}`).addEventListener('focus', () => getUpgradeDescription(i, 'upgrades', 3)); }
}
for (let i = 0; i < global.upgradesS4Info.cost.length; i++) {
    getId(`upgradeS${i + 1}`).addEventListener('mouseover', () => getUpgradeDescription(i, 'upgrades', 4));
    getId(`upgradeS${i + 1}`).addEventListener('click', () => buyUpgrades(i, 'upgrades', 4));
    if (screenReader || mobileDevice) { getId(`upgradeS${i + 1}`).addEventListener('focus', () => getUpgradeDescription(i, 'upgrades', 4)); }
}
getId('dischargeReset').addEventListener('click', async() => await dischargeResetCheck());
getId('vaporizationReset').addEventListener('click', async() => await vaporizationResetCheck());
getId('rankReset').addEventListener('click', async() => await rankResetCheck());
getId('stageReset').addEventListener('click', async() => await stageResetCheck());
getId('collapseReset').addEventListener('click', async() => await collapseResetCheck());
getId('buy1x').addEventListener('click', () => toggleBuy('1'));
getId('buyAny').addEventListener('click', () => toggleBuy('any'));
getId('buyAnyInput').addEventListener('blur', () => toggleBuy('any'));
getId('buyMax').addEventListener('click', () => toggleBuy('max'));
getId('buyStrict').addEventListener('click', () => toggleBuy('strict'));

/* Research tab */
for (let i = 0; i < global.researchesInfo.cost.length; i++) {
    getId(`research${i + 1}Image`).addEventListener('mouseover', () => getUpgradeDescription(i, 'researches', 1));
    getId(`research${i + 1}Image`).addEventListener('click', () => buyUpgrades(i, 'researches', 1));
    if (screenReader || mobileDevice) { getId(`research${i + 1}Image`).addEventListener('focus', () => getUpgradeDescription(i, 'researches', 1)); }
}
for (let i = 0; i < global.researchesS2Info.cost.length; i++) {
    getId(`researchW${i + 1}Image`).addEventListener('mouseover', () => getUpgradeDescription(i, 'researches', 2));
    getId(`researchW${i + 1}Image`).addEventListener('click', () => buyUpgrades(i, 'researches', 2));
    if (screenReader || mobileDevice) { getId(`researchW${i + 1}Image`).addEventListener('focus', () => getUpgradeDescription(i, 'researches', 2)); }
}
for (let i = 0; i < global.researchesExtraS2Info.cost.length; i++) {
    getId(`researchClouds${i + 1}Image`).addEventListener('mouseover', () => getUpgradeDescription(i, 'researchesExtra', 2));
    getId(`researchClouds${i + 1}Image`).addEventListener('click', () => buyUpgrades(i, 'researchesExtra', 2));
    if (screenReader || mobileDevice) { getId(`researchClouds${i + 1}Image`).addEventListener('focus', () => getUpgradeDescription(i, 'researchesExtra', 2)); }
}
for (let i = 0; i < global.researchesS3Info.cost.length; i++) {
    getId(`researchA${i + 1}Image`).addEventListener('mouseover', () => getUpgradeDescription(i, 'researches', 3));
    getId(`researchA${i + 1}Image`).addEventListener('click', () => buyUpgrades(i, 'researches', 3));
    if (screenReader || mobileDevice) { getId(`researchA${i + 1}Image`).addEventListener('focus', () => getUpgradeDescription(i, 'researches', 3)); }
}
for (let i = 0; i < global.researchesExtraS3Info.cost.length; i++) {
    getId(`researchRank${i + 1}Image`).addEventListener('mouseover', () => getUpgradeDescription(i, 'researchesExtra', 3));
    getId(`researchRank${i + 1}Image`).addEventListener('click', () => buyUpgrades(i, 'researchesExtra', 3));
    if (screenReader || mobileDevice) { getId(`researchRank${i + 1}Image`).addEventListener('focus', () => getUpgradeDescription(i, 'researchesExtra', 3)); }
}
for (let i = 0; i < global.researchesS4Info.cost.length; i++) {
    getId(`researchS${i + 1}Image`).addEventListener('mouseover', () => getUpgradeDescription(i, 'researches', 4));
    getId(`researchS${i + 1}Image`).addEventListener('click', () => buyUpgrades(i, 'researches', 4));
    if (screenReader || mobileDevice) { getId(`researchS${i + 1}Image`).addEventListener('focus', () => getUpgradeDescription(i, 'researches', 4)); }
}
for (let i = 0; i < global.researchesExtraS4Info.cost.length; i++) {
    getId(`researchStar${i + 1}Image`).addEventListener('mouseover', () => getUpgradeDescription(i, 'researchesExtra', 4));
    getId(`researchStar${i + 1}Image`).addEventListener('click', () => buyUpgrades(i, 'researchesExtra', 4));
    if (screenReader || mobileDevice) { getId(`researchStar${i + 1}Image`).addEventListener('focus', () => getUpgradeDescription(i, 'researchesExtra', 4)); }
}
for (let i = 0; i < global.researchesAutoInfo.cost.length; i++) {
    getId(`researchAuto${i + 1}Image`).addEventListener('mouseover', () => getUpgradeDescription(i, 'researchesAuto'));
    getId(`researchAuto${i + 1}Image`).addEventListener('click', () => buyUpgrades(i, 'researchesAuto'));
    if (screenReader || mobileDevice) { getId(`researchAuto${i + 1}Image`).addEventListener('focus', () => getUpgradeDescription(i, 'researchesAuto')); }
}
for (let i = 1; i < global.elementsInfo.cost.length; i++) {
    getId(`element${i}`).addEventListener('mouseover', () => getUpgradeDescription(i, 'elements', 4));
    getId(`element${i}`).addEventListener('click', () => buyUpgrades(i, 'elements', 4));
    if (screenReader || mobileDevice) { getId(`element${i}`).addEventListener('focus', () => getUpgradeDescription(i, 'elements', 4)); }
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
getId('fontSizeToggle').addEventListener('click', () => changeFontSize(true));
getId('customFontSize').addEventListener('blur', () => changeFontSize(false, true));

/* Only for phones */
getId('mobileDeviceToggle').addEventListener('click', () => mobileDeviceSupport(true));

/* Only for screen readers */
getId('screenReaderToggle').addEventListener('click', () => screenReaderSupport(true));
if (screenReader) {
    for (let i = 0; i < playerStart.buildings.length; i++) {
        getId(`invisibleGetBuilding${i}`).addEventListener('click', () => screenReaderSupport(i, 'button'));
    }
    getId('invisibleGetResource1').addEventListener('click', () => screenReaderSupport(0, 'button', 'resource'));
    getId('specialTabBtn').addEventListener('click', () => switchTab('special'));
    getId('specialTabBtn').style.display = '';
}

/* Footer */
getId('hideToggle').addEventListener('click', hideFooter);
getId('stageTabBtn').addEventListener('click', () => switchTab('stage'));
getId('researchTabBtn').addEventListener('click', () => switchTab('research'));
getId('settingsTabBtn').addEventListener('click', () => switchTab('settings'));

/* Subtabs */
getId('researchSubtabBtnresearches').addEventListener('click', () => switchTab('research', 'researches'));
getId('researchSubtabBtnelements').addEventListener('click', () => switchTab('research', 'elements'));
getId('settingsSubtabBtnsettings').addEventListener('click', () => switchTab('settings', 'settings'));
getId('settingsSubtabBtnstats').addEventListener('click', () => switchTab('settings', 'stats'));

/* Intervals */
function changeIntervals(pause = false, input = '') {
    const { intervals } = player;
    const { intervalsId } = global;
    if (input !== '') {
        const mainInput = getId('mainInterval') as HTMLInputElement;
        const numberInput = getId('numbersInterval') as HTMLInputElement;
        const visualInput = getId('visualInterval') as HTMLInputElement;
        const autoSaveInput = getId('autoSaveInterval') as HTMLInputElement;
        if (input === 'main') {
            intervals.main = Math.min(Math.max(Math.trunc(Number(mainInput.value)), 10), 1000);
            if (intervals.main > intervals.numbers) { intervals.numbers = intervals.main; }
        } else if (input === 'numbers') {
            intervals.numbers = Math.min(Math.max(Math.trunc(Number(numberInput.value)), 10), 1000);
            if (intervals.numbers < intervals.main) { intervals.main = intervals.numbers; }
        } else if (input === 'visual') {
            intervals.visual = Math.min(Math.max(Math.trunc(Number(visualInput.value) * 10) / 10, 0.2), 10);
        } else if (input === 'autoSave') {
            intervals.autoSave = Math.min(Math.max(Math.trunc(Number(autoSaveInput.value)), 10), 1800);
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
            if (saveFile === null) { return Alert('Loaded file wasn\'t found, somehow'); }
            const text = await saveFile[0].text();

            try {
                const load = JSON.parse(atob(text));
                const versionCheck = Object.hasOwn(load, 'player') ? load.player.version : load.version;
                changeIntervals(true);
                updatePlayer(load);
                const offlineTime = Date.now() - player.time.updated;
                getId('isSaved').textContent = 'Imported';
                global.timeSpecial.lastSave = 0;
                if (!player.toggles.normal[0]) {
                    const noOffline = await Confirm(`This save file was set to have offline progress disabled (currently ${format(offlineTime, 0, 'time')}${offlineTime > maxOfflineTime() * 1000 ? `, max is ${global.timeSpecial.maxOffline / 3600} hours` : ''}). Press confirm to NOT to gain offline time.${versionCheck !== player.version ? `\nAlso save file version is ${versionCheck}, while game version is ${player.version}, ${global.versionInfo.log}` : `\nSave file version is ${player.version}`}`);
                    if (noOffline) {
                        global.timeSpecial.lastSave += offlineTime;
                        player.time.updated = Date.now();
                    }
                } else {
                    Alert(`This save is ${format(offlineTime, 0, 'time')} old${offlineTime > maxOfflineTime() * 1000 ? `, max offline time is ${global.timeSpecial.maxOffline / 3600} hours` : ''}.${versionCheck !== player.version ? `\nAlso save file version is ${versionCheck}, while game version is ${player.version}, ${global.versionInfo.log}` : `\nSave file version is ${player.version}`}`);
                }
                void reLoad();
            } catch (error) {
                changeIntervals(); //Unpause game, in case it there was an issue before reLoad();
                Alert(`Incorrect save file format.\nFull error is: '${error}'`);
            } finally {
                id.value = ''; //Remove inputed file
            }
            return;
        }
        case 'save': {
            try {
                const save = btoa(JSON.stringify(player));
                localStorage.setItem('save', save);
                getId('isSaved').textContent = 'Saved';
                global.timeSpecial.lastSave = 0;
            } catch (error) {
                Alert(`Failed to save file.\nFull error is: '${error}'`);
            }
            return;
        }
        case 'export': {
            await saveLoad('save');
            const save = btoa(JSON.stringify(player)); //In case localStorage will fail
            if (save !== localStorage.getItem('save')) { Alert('For some reason save file in a browser and exported one are different...'); }
            getId('isSaved').textContent = 'Exported';
            const a = document.createElement('a');
            a.href = 'data:text/plain;charset=utf-8,' + save;
            a.download = 'Fundamental.txt'; //Add choice for a name, later
            a.click();
            return;
        }
        case 'delete': {
            const ok = await Prompt("This will truly delete your save file and clear local storage!\nType 'delete' to confirm.");
            if (ok?.toLowerCase() === 'delete') {
                changeIntervals(true);
                localStorage.clear();
                /* These one's only updated on page reload */
                mobileDeviceSupport();
                screenReaderSupport(false, 'toggle', 'reload');
                changeFontSize();
                /* Reset subtabs (it will do useless number and visual update), and tab */
                switchTab('settings', 'settings');
                //switchTab('research', 'researches'); //Done in stageCheck();
                switchTab('stage');
                /* No need to remove non existing properties, because it's done on save load anyway */
                Object.assign(player, startValue('p'));
                Object.assign(global, startValue('g'));
                player.time.started = Date.now();
                player.time.updated = player.time.started;
                void reLoad();
            } else if (ok !== null && ok !== '') {
                Alert(`You wrote '${ok}', so save file wasn't deleted`);
            }
            break;
        }
    }
}

const pauseGame = async() => {
    changeIntervals(true);
    const offline = await Prompt(`Game is currently paused. Press any button bellow to unpause it. If you want you can enter 'NoOffline' to NOT to gain offline time. (Max offline time is ${maxOfflineTime() / 3600} hours)`);
    //Maybe to add when game was paused (if I can figure out how later)
    if (offline?.toLowerCase() === 'nooffline') {
        player.time.updated = Date.now();
    } else if (offline !== null && offline !== '') {
        Alert(`You wrote '${offline}', so you gained offline time`);
    }
    changeIntervals();
};
