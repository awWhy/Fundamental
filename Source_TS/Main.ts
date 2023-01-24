import { player, global, playerStart, updatePlayer, checkPlayerValues } from './Player';
import { getUpgradeDescription, invisibleUpdate, switchTab, numbersUpdate, visualUpdate, format, stageCheck, maxOfflineTime, exportMultiplier } from './Update';
import { autoUpgradesSet, buyBuilding, buyUpgrades, collapseAsyncReset, dischargeAsyncReset, rankAsyncReset, stageAsyncReset, switchStage, switchVacuum, toggleBuy, toggleSwap, vaporizationAsyncReset } from './Stage';
import { Alert, Confirm, hideFooter, Prompt, setTheme, changeFontSize, screenReaderSupport, mobileDeviceSupport, removeTextMovement, changeFormat, specialHTML } from './Special';
import { detectHotkey } from './Hotkeys';
import { createCalculator } from './Limit';
/* There can be a problem with incorrect build, imports can be called in a wrong order */
/* Small notes for myself: (tested with many, many loops) */
//Optimizing visualUpdate() by using if...else... won't change anything (using a = b = c, will slow it down)
//Removing decostructing ({ a } = b), in most cases will slow down code

export const getId = (id: string): HTMLElement => { //To type less and check if ID exist
    const i = document.getElementById(id);
    if (i !== null) { return i; }
    Alert(`ID of HTML element (${id}), failed to load, game will not work properly, please refresh. If this happens more than once, then please report it`);
    throw new ReferenceError(`ID "${id}" not found.`);
};

export const getClass = (idCollection: string) => [...document.getElementsByClassName(idCollection) as HTMLCollectionOf<HTMLElement>];

export const reLoad = async(firstLoad = false) => {
    if (firstLoad) {
        const save = localStorage.getItem('save');
        const theme = localStorage.getItem('theme');
        if (save !== null) {
            const load = JSON.parse(atob(save));
            updatePlayer(load);
            if (player.toggles.normal[0]) {
                const offlineTime = Date.now() - player.time.updated;
                const maxOffline = maxOfflineTime();
                Alert(`Welcome back, you were away for ${format(offlineTime, 0, 'time')}.${offlineTime > maxOffline * 1000 ? ` (Max offline time is ${maxOffline / 3600} hours)` : ''}${global.versionInfo.changed ? ` Game has been updated to ${player.version}, ${global.versionInfo.log}` : `\nCurrent version is ${player.version}`}`);
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
        if (localStorage.getItem('textMove') !== null) { removeTextMovement(); }
    }

    stageCheck('reload'); //All related stage information and visualUpdate(), also calculateStageInformation();
    if (firstLoad) { //Prevent spoilers
        getId('body').style.display = '';
        getId('loading').style.display = 'none';
    }
    checkPlayerValues(); //Has to be done after stageCheck();

    (getId('saveFileNameInput') as HTMLInputElement).value = player.fileName;
    (getId('thousandSeparator') as HTMLInputElement).value = player.separator[0];
    (getId('decimalPoint') as HTMLInputElement).value = player.separator[1];
    (getId('stageInput') as HTMLInputElement).value = `${player.stage.input}`;
    (getId('vaporizationInput') as HTMLInputElement).value = `${player.vaporization.input}`;
    (getId('collapseMassInput') as HTMLInputElement).value = `${player.collapse.inputM}`;
    (getId('collapseStarsInput') as HTMLInputElement).value = `${player.collapse.inputS}`;
    for (let i = 0; i < playerStart.toggles.normal.length; i++) { toggleSwap(i, 'normal'); }
    for (let i = 0; i < playerStart.toggles.auto.length; i++) { toggleSwap(i, 'auto'); }
    toggleBuy(); //Also numbersUpdate();

    createCalculator(); //Remove once done

    if (firstLoad && !player.toggles.normal[0]) {
        const offlineTime = Date.now() - player.time.updated;
        const maxOffline = maxOfflineTime();
        const noOffline = await Confirm(`Welcome back, you were away for ${format(offlineTime, 0, 'time')}${offlineTime > maxOffline * 1000 ? ` (max offline time is ${maxOffline / 3600} hours)` : ''}. Game was set to have offline time disabled. Press confirm to NOT to gain offline time.${global.versionInfo.changed ? ` Also game has been updated to ${player.version}, ${global.versionInfo.log}` : `\nCurrent version is ${player.version}`}`);
        if (noOffline) {
            global.timeSpecial.lastSave += offlineTime;
            player.time.updated = Date.now();
        }
    }
    changeIntervals(false, 'all'); //Will 'unpause' game, also set all of inputs values
};

void reLoad(true); //This will start the game

/* Global */
{
    const { mobileDevice, screenReader } = global;
    document.addEventListener('keydown', (key: KeyboardEvent) => detectHotkey(key));
    for (let i = 0; i < playerStart.toggles.normal.length; i++) {
        getId(`toggle${i}`).addEventListener('click', () => toggleSwap(i, 'normal', true));
    }
    for (let i = 0; i < specialHTML.longestBuilding; i++) {
        getId(`toggleBuilding${i}`).addEventListener('click', () => toggleSwap(i, 'buildings', true));
    }
    for (let i = 0; i < playerStart.toggles.auto.length; i++) {
        getId(`toggleAuto${i}`).addEventListener('click', () => toggleSwap(i, 'auto', true));
    }

    /* Stage tab */
    for (let i = 1; i < specialHTML.longestBuilding; i++) {
        getId(`building${i}Btn`).addEventListener('click', () => buyBuilding(i));
    }
    for (let i = 0; i < specialHTML.longestUpgrade; i++) {
        const image = getId(`upgrade${i + 1}`) as HTMLInputElement;
        if (!mobileDevice) {
            image.addEventListener('mouseover', () => getUpgradeDescription(i, 'auto', 'upgrades'));
            image.addEventListener('click', () => buyUpgrades(i, 'auto', 'upgrades'));
        } else {
            image.addEventListener('touchstart', () => getUpgradeDescription(i, 'auto', 'upgrades'));
            image.addEventListener('touchend', () => buyUpgrades(i, 'auto', 'upgrades'));
        }
        if (screenReader) { image.addEventListener('focus', () => getUpgradeDescription(i, 'auto', 'upgrades')); }
    }
    getId('dischargeReset').addEventListener('click', () => { void dischargeAsyncReset(); });
    getId('vaporizationReset').addEventListener('click', () => { void vaporizationAsyncReset(); });
    getId('rankReset').addEventListener('click', () => { void rankAsyncReset(); });
    getId('stageReset').addEventListener('click', () => { void stageAsyncReset(); });
    getId('collapseReset').addEventListener('click', () => { void collapseAsyncReset(); });
    getId('buy1x').addEventListener('click', () => toggleBuy('1'));
    getId('buyAny').addEventListener('click', () => toggleBuy('any'));
    getId('buyAnyInput').addEventListener('blur', () => toggleBuy('any'));
    getId('buyMax').addEventListener('click', () => toggleBuy('max'));
    getId('buyStrict').addEventListener('click', () => toggleBuy('strict'));

    getId('vacuumSwitch').addEventListener('click', switchVacuum);

    /* Research tab */
    for (let i = 0; i < specialHTML.longestResearch; i++) {
        const image = getId(`research${i + 1}Image`) as HTMLInputElement;
        if (!mobileDevice) {
            image.addEventListener('mouseover', () => getUpgradeDescription(i, 'auto', 'researches'));
            image.addEventListener('click', () => buyUpgrades(i, 'auto', 'researches'));
        } else {
            image.addEventListener('touchstart', () => getUpgradeDescription(i, 'auto', 'researches'));
            image.addEventListener('touchend', () => buyUpgrades(i, 'auto', 'researches'));
        }
        if (screenReader) { image.addEventListener('focus', () => getUpgradeDescription(i, 'auto', 'researches')); }
    }
    for (let i = 0; i < specialHTML.longestResearchExtra; i++) {
        const image = getId(`researchExtra${i + 1}Image`) as HTMLInputElement;
        if (!mobileDevice) {
            image.addEventListener('mouseover', () => getUpgradeDescription(i, 'auto', 'researchesExtra'));
            image.addEventListener('click', () => buyUpgrades(i, 'auto', 'researchesExtra'));
        } else {
            image.addEventListener('touchstart', () => getUpgradeDescription(i, 'auto', 'researchesExtra'));
            image.addEventListener('touchend', () => buyUpgrades(i, 'auto', 'researchesExtra'));
        }
        if (screenReader) { image.addEventListener('focus', () => getUpgradeDescription(i, 'auto', 'researchesExtra')); }
    }
    for (let i = 0; i < global.researchesAutoInfo.cost.length; i++) {
        const image = getId(`researchAuto${i + 1}Image`) as HTMLInputElement;
        if (!mobileDevice) {
            image.addEventListener('mouseover', () => getUpgradeDescription(i, 'auto', 'researchesAuto'));
            image.addEventListener('click', () => buyUpgrades(i, 'auto', 'researchesAuto'));
        } else {
            image.addEventListener('touchstart', () => getUpgradeDescription(i, 'auto', 'researchesAuto'));
            image.addEventListener('touchend', () => buyUpgrades(i, 'auto', 'researchesAuto'));
        }
        if (screenReader) { image.addEventListener('focus', () => getUpgradeDescription(i, 'auto', 'researchesAuto')); }
    }
    { //Part of researchesAuto
        const image = getId('ASRImage') as HTMLInputElement;
        if (!mobileDevice) {
            image.addEventListener('mouseover', () => getUpgradeDescription(0, 'auto', 'ASR'));
            image.addEventListener('click', () => buyUpgrades(0, 'auto', 'ASR'));
        } else {
            image.addEventListener('touchstart', () => getUpgradeDescription(0, 'auto', 'ASR'));
            image.addEventListener('touchend', () => buyUpgrades(0, 'auto', 'ASR'));
        }
        if (screenReader) { image.addEventListener('focus', () => getUpgradeDescription(0, 'auto', 'ASR')); }
    }

    for (let i = 1; i < global.elementsInfo.cost.length; i++) {
        const image = getId(`element${i}`) as HTMLInputElement;
        if (!mobileDevice) {
            image.addEventListener('mouseover', () => getUpgradeDescription(i, 4, 'elements'));
            image.addEventListener('click', () => buyUpgrades(i, 4, 'elements'));
        } else {
            image.addEventListener('touchstart', () => getUpgradeDescription(i, 4, 'elements'));
            image.addEventListener('touchend', () => buyUpgrades(i, 4, 'elements'));
        }
        if (screenReader) { image.addEventListener('focus', () => getUpgradeDescription(i, 4, 'elements')); }
    }

    /* Strangeness tab */
    for (let s = 1; s < global.strangenessInfo.length; s++) {
        for (let i = 0; i < global.strangenessInfo[s].cost.length; i++) {
            const image = getId(`strange${i + 1}Stage${s}Image`) as HTMLInputElement;
            if (!mobileDevice) {
                image.addEventListener('mouseover', () => getUpgradeDescription(i, s, 'strangeness'));
                image.addEventListener('click', () => buyUpgrades(i, s, 'strangeness'));
            } else {
                image.addEventListener('touchstart', () => getUpgradeDescription(i, s, 'strangeness'));
                image.addEventListener('touchend', () => buyUpgrades(i, s, 'strangeness'));
            }
            if (screenReader) { image.addEventListener('focus', () => getUpgradeDescription(i, s, 'strangeness')); }
        }
    }
    for (let s = 1; s < global.milestonesInfo.length; s++) {
        for (let i = 0; i < global.milestonesInfo[s].need.length; i++) {
            getId(`milestone${i + 1}Stage${s}`).addEventListener('mouseover', () => getUpgradeDescription(i, s, 'milestones'));
            if (screenReader) { getId(`milestone${i + 1}Stage${s}`).addEventListener('focus', () => getUpgradeDescription(i, s, 'milestones')); }
        }
    }

    /* Settings tab */
    getId('vaporizationInput').addEventListener('blur', () => {
        const input = getId('vaporizationInput') as HTMLInputElement;
        input.value = format(Math.max(Number(input.value), 0), 'auto', 'input');
        player.vaporization.input = Number(input.value);
    });
    getId('collapseMassInput').addEventListener('blur', () => {
        const input = getId('collapseMassInput') as HTMLInputElement;
        input.value = format(Math.max(Number(input.value), 1), 'auto', 'input');
        player.collapse.inputM = Number(input.value);
    });
    getId('collapseStarsInput').addEventListener('blur', () => {
        const input = getId('collapseStarsInput') as HTMLInputElement;
        input.value = format(Math.max(Number(input.value), 0), 'auto', 'input');
        player.collapse.inputS = Number(input.value);
    });
    getId('stageInput').addEventListener('blur', () => {
        const input = getId('stageInput') as HTMLInputElement;
        input.value = format(Math.max(Number(input.value), 1), 'auto', 'input');
        player.stage.input = Number(input.value);
    });
    getId('save').addEventListener('click', () => { void saveLoad('save'); });
    getId('file').addEventListener('change', () => { void saveLoad('load'); });
    getId('export').addEventListener('click', () => { void saveLoad('export'); });
    getId('delete').addEventListener('click', () => { void saveLoad('delete'); });
    getId('switchTheme0').addEventListener('click', () => setTheme(0, true));
    for (let i = 1; i < global.stageInfo.word.length; i++) {
        getId(`switchTheme${i}`).addEventListener('click', () => setTheme(i));
    }
    getId('toggleAuto5').addEventListener('click', () => {
        if (player.toggles.auto[5]) { autoUpgradesSet('upgrades'); }
    });
    getId('toggleAuto6').addEventListener('click', () => {
        if (player.toggles.auto[6]) { autoUpgradesSet('researches'); }
    });
    getId('toggleAuto7').addEventListener('click', () => {
        if (player.toggles.auto[7]) { autoUpgradesSet('researchesExtra'); }
    });
    getId('saveFileNameInput').addEventListener('blur', () => changeSaveFileName());
    getId('saveFileHoverButton').addEventListener('mouseover', () => {
        getId('saveFileNamePreview').textContent = replaceSaveFileSpecials();
    });
    getId('saveFileHoverButton').addEventListener('focus', () => {
        getId('saveFileNamePreview').textContent = replaceSaveFileSpecials();
    });
    getId('mainInterval').addEventListener('blur', () => changeIntervals(false, 'main'));
    getId('numbersInterval').addEventListener('blur', () => changeIntervals(false, 'numbers'));
    getId('visualInterval').addEventListener('blur', () => changeIntervals(false, 'visual'));
    getId('autoSaveInterval').addEventListener('blur', () => changeIntervals(false, 'autoSave'));
    getId('thousandSeparator').addEventListener('blur', () => changeFormat(false));
    getId('decimalPoint').addEventListener('blur', () => changeFormat(true));
    getId('pauseGame').addEventListener('click', () => { void pauseGame(); });
    getId('noMovement').addEventListener('click', () => removeTextMovement(true));
    getId('fontSizeToggle').addEventListener('click', () => changeFontSize(true));
    getId('customFontSize').addEventListener('blur', () => changeFontSize(false, true));

    /* Only for phones */
    getId('mobileDeviceToggle').addEventListener('click', () => mobileDeviceSupport(true));

    /* Only for screen readers */
    getId('screenReaderToggle').addEventListener('click', () => screenReaderSupport(true));
    if (screenReader) {
        for (let i = 0; i < specialHTML.longestBuilding; i++) {
            getId(`invisibleGetBuilding${i}`).addEventListener('click', () => screenReaderSupport(i, 'button', 'building'));
        }
        getId('invisibleGetResource0').addEventListener('click', () => screenReaderSupport(0, 'button', 'resource'));
        getId('invisibleGetResource1').addEventListener('click', () => screenReaderSupport(1, 'button', 'resource'));
        getId('invisibleGetResource2').addEventListener('click', () => screenReaderSupport(2, 'button', 'resource'));
        getId('invisibleGetResource4').addEventListener('click', () => screenReaderSupport(4, 'button', 'resource'));
        getId('invisibleInformation0').addEventListener('click', () => screenReaderSupport(0, 'button', 'information'));
    }

    /* Footer */
    getId('hideToggle').addEventListener('click', hideFooter);
    const tabList = global.tabList.tabs.slice(0, -1);
    for (const tabText of tabList) {
        getId(`${tabText}TabBtn`).addEventListener('click', () => switchTab(tabText));
        for (const subtabText of global.tabList[tabText + 'Subtabs' as 'stageSubtabs']) {
            getId(`${tabText}SubtabBtn${subtabText}`).addEventListener('click', () => switchTab(tabText, subtabText));
        }
    }

    /* Stages */
    for (let i = 1; i < global.stageInfo.word.length; i++) {
        getId(`${global.stageInfo.word[i]}Switch`).addEventListener('click', () => switchStage(i));
    }
}

console.timeEnd('Game loaded in'); //Started in Player.ts

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
            intervals.main = Math.min(Math.max(Math.trunc(Number(mainInput.value)), 20), 1000);
            if (intervals.main > intervals.numbers) { intervals.numbers = intervals.main; }
        } else if (input === 'numbers') {
            intervals.numbers = Math.min(Math.max(Math.trunc(Number(numberInput.value)), 20), 1000);
            if (intervals.numbers < intervals.main) { intervals.main = intervals.numbers; }
        } else if (input === 'visual') {
            intervals.visual = Math.min(Math.max(Math.trunc(Number(visualInput.value) * 10) / 10, 0.2), 10);
        } else if (input === 'autoSave') {
            intervals.autoSave = Math.min(Math.max(Math.trunc(Number(autoSaveInput.value)), 10), 1800);
        }
        mainInput.value = `${intervals.main}`;
        numberInput.value = `${intervals.numbers}`;
        visualInput.value = `${intervals.visual}`;
        autoSaveInput.value = `${intervals.autoSave}`;
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
                const maxOffline = maxOfflineTime();
                getId('isSaved').textContent = 'Imported';
                global.timeSpecial.lastSave = 0;
                if (!player.toggles.normal[0]) {
                    const noOffline = await Confirm(`This save file was set to have offline progress disabled (currently ${format(offlineTime, 0, 'time')}${offlineTime > maxOffline * 1000 ? `, max is ${maxOffline / 3600} hours` : ''}). Press confirm to NOT to gain offline time.${versionCheck !== player.version ? `\nAlso save file version is ${versionCheck}, while game version is ${player.version}, ${global.versionInfo.log}` : `\nSave file version is ${player.version}`}`);
                    if (noOffline) {
                        global.timeSpecial.lastSave += offlineTime;
                        player.time.updated = Date.now();
                    }
                } else {
                    Alert(`This save is ${format(offlineTime, 0, 'time')} old${offlineTime > maxOffline * 1000 ? `, max offline time is ${maxOffline / 3600} hours` : ''}.${versionCheck !== player.version ? `\nAlso save file version is ${versionCheck}, while game version is ${player.version}, ${global.versionInfo.log}` : `\nSave file version is ${player.version}`}`);
                }
                void reLoad();
            } catch (error) {
                changeIntervals(); //Unpause game, in case there was an issue;
                Alert(`Incorrect save file format.\nFull error is: '${error}'`);
            } finally {
                id.value = ''; //Remove inputed file
            }
            return;
        }
        case 'save': {
            try {
                const save = btoa(JSON.stringify(player));
                //If Infinity will be needed inside, then can anything alike 'btoa(JSON.stringify(player), (k, v) => v === Infinity ? `${v}` : v)'
                localStorage.setItem('save', save);
                clearInterval(global.intervalsId.autoSave);
                global.intervalsId.autoSave = setInterval(saveLoad, player.intervals.autoSave * 1000, 'save');
                getId('isSaved').textContent = 'Saved';
                global.timeSpecial.lastSave = 0;
            } catch (error) {
                Alert(`Failed to save file.\nFull error is: '${error}'`);
            }
            return;
        }
        case 'export': {
            if (player.strangeness[4][7] >= 1) {
                const multiplier = exportMultiplier();
                const strangeGain = Math.trunc(player.stage.export * multiplier / 86400);
                player.strange[0].true += strangeGain;
                player.strange[0].total += strangeGain;
                player.stage.export -= strangeGain * 86400 / multiplier;
            }

            const save = btoa(JSON.stringify(player)); //It doesn't use one from localStorage in case of errors
            const a = document.createElement('a');
            a.href = 'data:text/plain;charset=utf-8,' + save;
            a.download = replaceSaveFileSpecials();
            a.click();
            return;
        }
        case 'delete': {
            const ok = await Prompt("This will truly delete your save file and clear local storage!\nType 'delete' to confirm.");
            if (ok?.toLowerCase() === 'delete') {
                changeIntervals(true);
                localStorage.clear();
                Alert('Game will auto refresh. If not then do it manually');
                window.location.reload();
            } else if (ok !== null && ok !== '') {
                Alert(`You wrote '${ok}', so save file wasn't deleted`);
            }
        }
    }
}

const changeSaveFileName = () => {
    const input = getId('saveFileNameInput') as HTMLInputElement;

    let newValue: string; //Max allowed string length is 255 (35) (?)
    if (input.value.length > 4) {
        newValue = input.value.replaceAll(/[\\/:*?"<>|]/g, '_');
    } else {
        const check = input.value.replace(/[1-9]/, '').toLowerCase(); //No idea if I should check for these
        if (input.value.length < 4 || (input.value.length === 4 && (check === 'com' || check === 'lpt'))) {
            newValue = playerStart.fileName;
        } else {
            newValue = input.value.replaceAll(/[\\/:*?"<>|]/g, '_');
        }
    }

    try {
        btoa(newValue); //Test for any illegal characters
        player.fileName = newValue;
        input.value = newValue;
    } catch (error) {
        Alert(`Save file name is not allowed.\nFull error is: '${error}'`);
    }
};

const replaceSaveFileSpecials = (): string => {
    let realName = player.fileName;
    const special = [
        '[stage]',
        '[true]',
        '[date]',
        '[time]'
    ];
    const replaceWith = [
        global.stageInfo.word[player.stage.current],
        global.stageInfo.word[player.stage.true],
        getDate('dateDMY'),
        getDate('timeHMS')
    ];
    for (let i = 0; i < special.length; i++) {
        realName = realName.replaceAll(special[i], replaceWith[i]);
    }
    return realName + '.txt';
};

const getDate = (type: 'dateDMY' | 'timeHMS'): string => {
    const current = new Date();
    let result: string;
    switch (type) {
        case 'dateDMY':
            result = `${current.getDate()}.${current.getMonth() + 1}.${current.getFullYear()}`;
            break;
        case 'timeHMS': {
            let minutes = `${current.getMinutes()}`;
            if (minutes.length === 1) { minutes = '0' + minutes; }
            let seconds = `${current.getSeconds()}`;
            if (seconds.length === 1) { seconds = '0' + seconds; }
            result = `${current.getHours()}-${minutes}-${seconds}`;
        }
    }
    return result;
};

const pauseGame = async() => {
    changeIntervals(true);
    const offline = await Prompt(`Game is currently paused. Press any button bellow to unpause it. Can enter 'NoOffline' to NOT to gain offline time. (Max offline time is ${maxOfflineTime() / 3600} hours)`);
    //Maybe to add when game was paused (if I can figure out how later)
    if (offline?.toLowerCase() === 'nooffline') {
        player.time.updated = Date.now();
    } else if (offline !== null && offline !== '') {
        Alert(`You wrote '${offline}', so offline time was gained`);
    }
    changeIntervals();
};
