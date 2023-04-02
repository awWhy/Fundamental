import { player, global, playerStart, updatePlayer, buildVersionInfo, deepClone } from './Player';
import { getUpgradeDescription, timeUpdate, switchTab, numbersUpdate, visualUpdate, format, stageCheck, maxOfflineTime, exportMultiplier, maxExportTime } from './Update';
import { assignNewMassCap, autoElementsSet, autoResearchesSet, autoUpgradesSet, buyBuilding, buyUpgrades, collapseAsyncReset, dischargeAsyncReset, rankAsyncReset, stageAsyncReset, switchStage, toggleBuy, toggleSwap, vaporizationAsyncReset } from './Stage';
import { Alert, hideFooter, Prompt, setTheme, changeFontSize, screenReaderSupport, mobileDeviceSupport, changeFormat, specialHTML, AlertWait, replayEvent, Confirm, getInformationSR } from './Special';
import { detectHotkey } from './Hotkeys';
import { prepareVacuum, switchVacuum } from './Vacuum';

/* This is how much I like to non stop write that element is not null */
export const getId = (id: string) => document.getElementById(id) as HTMLElement;
export const getClass = (idCollection: string) => document.getElementsByClassName(idCollection) as HTMLCollectionOf<HTMLElement>;
export const getQuery = (query: string) => document.querySelector(query) as HTMLElement;

export const reLoad = (firstLoad = false) => {
    if (firstLoad) {
        const save = localStorage.getItem('save');
        if (save !== null) {
            const load = JSON.parse(atob(save));
            const versionCheck = updatePlayer(load);

            const { time } = player;
            const offlineTime = (Date.now() - time.updated) / 1000;
            const maxOffline = maxOfflineTime();
            time.updated = Date.now();
            global.lastSave += offlineTime;
            time.offline = Math.min(time.offline + offlineTime, maxOffline);
            player.stage.export = Math.min(player.stage.export + offlineTime, maxExportTime());
            Alert(`Welcome back, you were away for ${format(offlineTime, { type: 'time' })}.${time.offline >= maxOffline ? ' (Offline storage is full)' : ''}\n${versionCheck !== player.version ? `Game have been updated from ${versionCheck} to ${player.version}` : `Current version is ${player.version}`}`);
        } else {
            prepareVacuum();
            updatePlayer(deepClone(playerStart));
            Alert(`Welcome to 'Fundamental'.\nThis is a test-project made by awWhy. Should be supported by modern browsers, phones and screen readers (need to turn support ON in settings).\nWas inspired by 'Synergism', 'Antimatter Dimensions' and others.\nCurrent version is ${player.version}`);
        }

        mobileDeviceSupport();
        screenReaderSupport();
        changeFontSize();
    }

    const theme = localStorage.getItem('theme');
    setTheme(Number(theme), theme === null);

    stageCheck('reload');
    if (firstLoad) {
        getId('body').style.display = '';
        getId('loading').style.display = 'none';
    }

    (getId('saveFileNameInput') as HTMLInputElement).value = player.fileName;
    (getId('mainInterval') as HTMLInputElement).value = `${player.intervals.main}`;
    (getId('numbersInterval') as HTMLInputElement).value = `${player.intervals.numbers}`;
    (getId('visualInterval') as HTMLInputElement).value = `${player.intervals.visual}`;
    (getId('autoSaveInterval') as HTMLInputElement).value = `${player.intervals.autoSave}`;
    (getId('thousandSeparator') as HTMLInputElement).value = player.separator[0];
    (getId('decimalPoint') as HTMLInputElement).value = player.separator[1];
    (getId('stageInput') as HTMLInputElement).value = format(player.stage.input, { type: 'input' });
    (getId('vaporizationInput') as HTMLInputElement).value = format(player.vaporization.input, { type: 'input' });
    (getId('rankShiftInput') as HTMLInputElement).value = format(player.accretion.input, { type: 'input' });
    (getId('collapseMassInput') as HTMLInputElement).value = format(player.collapse.input[0], { type: 'input' });
    (getId('collapseStarsInput') as HTMLInputElement).value = format(player.collapse.input[1], { type: 'input' });
    (getId('stageResetsSave') as HTMLInputElement).value = `${player.history.stage.input[0]}`;
    (getId('stageResetsKeep') as HTMLInputElement).value = `${player.history.stage.input[1]}`;
    getId('stageSelect').classList.remove('active');
    for (let i = 0; i < playerStart.toggles.normal.length; i++) { toggleSwap(i, 'normal'); }
    for (let i = 0; i < playerStart.toggles.auto.length; i++) { toggleSwap(i, 'auto'); }
    toggleBuy();

    changeIntervals(); //Unpause game
};

reLoad(true); //This will start the game

{
    /* Global */
    const { mobileDevice: MD, screenReader: SR } = global;
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
        const image = getId(`upgrade${i + 1}`);
        if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(i, player.stage.active, 'upgrades')); }
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, player.stage.active, 'upgrades')); }
        image.addEventListener('mouseover', () => getUpgradeDescription(i, player.stage.active, 'upgrades'));
        image.addEventListener('click', () => buyUpgrades(i, player.stage.active, 'upgrades'));
    }
    getId('stageReset').addEventListener('click', () => { void stageAsyncReset(); });
    getId('reset1Button').addEventListener('click', () => {
        const { active } = player.stage;
        if (active === 1) {
            void dischargeAsyncReset();
        } else if (active === 2) {
            void vaporizationAsyncReset();
        } else if (active === 3) {
            void rankAsyncReset();
        } else if (active === 4) {
            void collapseAsyncReset();
        }
    });
    getId('buy1x').addEventListener('click', () => toggleBuy('1'));
    getId('buyAny').addEventListener('click', () => toggleBuy('any'));
    getId('buyAnyInput').addEventListener('blur', () => toggleBuy('any'));
    getId('buyMax').addEventListener('click', () => toggleBuy('max'));
    getId('buyStrict').addEventListener('click', () => toggleBuy('strict'));

    getId('vacuumSwitch').addEventListener('click', switchVacuum);

    /* Research tab */
    for (let i = 0; i < specialHTML.longestResearch; i++) {
        const image = getId(`research${i + 1}Image`);
        if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(i, player.stage.active, 'researches')); }
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, player.stage.active, 'researches')); }
        image.addEventListener('mouseover', () => getUpgradeDescription(i, player.stage.active, 'researches'));
        image.addEventListener('click', () => buyUpgrades(i, player.stage.active, 'researches'));
    }
    for (let i = 0; i < specialHTML.longestResearchExtra; i++) {
        const image = getId(`researchExtra${i + 1}Image`);
        if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(i, player.stage.active, 'researchesExtra')); }
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, player.stage.active, 'researchesExtra')); }
        image.addEventListener('mouseover', () => getUpgradeDescription(i, player.stage.active, 'researchesExtra'));
        image.addEventListener('click', () => buyUpgrades(i, player.stage.active, 'researchesExtra'));
    }
    for (let i = 0; i < global.researchesAutoInfo.startCost.length; i++) {
        const image = getId(`researchAuto${i + 1}Image`);
        if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(i, player.stage.active, 'researchesAuto')); }
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, player.stage.active, 'researchesAuto')); }
        image.addEventListener('mouseover', () => getUpgradeDescription(i, player.stage.active, 'researchesAuto'));
        image.addEventListener('click', () => buyUpgrades(i, player.stage.active, 'researchesAuto'));
    }
    {
        const image = getId('ASRImage');
        if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(0, player.stage.active, 'ASR')); }
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(0, player.stage.active, 'ASR')); }
        image.addEventListener('mouseover', () => getUpgradeDescription(0, player.stage.active, 'ASR'));
        image.addEventListener('click', () => buyUpgrades(0, player.stage.active, 'ASR'));
    }

    getId('toggleAuto8').addEventListener('click', () => autoElementsSet());
    for (let i = 1; i < global.elementsInfo.startCost.length; i++) {
        const image = getId(`element${i}`);
        if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(i, 4, 'elements')); }
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, 4, 'elements')); }
        image.addEventListener('mouseover', () => getUpgradeDescription(i, 4, 'elements'));
        image.addEventListener('click', () => buyUpgrades(i, 4, 'elements'));
    }

    /* Strangeness tab */
    for (let s = 1; s < global.strangenessInfo.length; s++) {
        for (let i = 0; i < global.strangenessInfo[s].startCost.length; i++) {
            const image = getId(`strange${i + 1}Stage${s}Image`);
            if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(i, s, 'strangeness')); }
            if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, s, 'strangeness')); }
            image.addEventListener('mouseover', () => getUpgradeDescription(i, s, 'strangeness'));
            image.addEventListener('click', () => buyUpgrades(i, s, 'strangeness'));
        }
    }
    for (let s = 1; s < global.milestonesInfo.length; s++) {
        for (let i = 0; i < global.milestonesInfo[s].need.length; i++) {
            const image = getId(`milestone${i + 1}Stage${s}`);
            if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(i, s, 'milestones')); }
            if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, s, 'milestones')); }
            image.addEventListener('mouseover', () => getUpgradeDescription(i, s, 'milestones'));
        }
    }

    /* Settings tab */
    getId('vaporizationInput').addEventListener('blur', () => {
        const input = getId('vaporizationInput') as HTMLInputElement;
        player.vaporization.input = Math.max(Number(input.value), 0);
        input.value = format(player.vaporization.input, { type: 'input' });
    });
    getId('rankShiftInput').addEventListener('blur', () => {
        const input = getId('rankShiftInput') as HTMLInputElement;
        player.accretion.input = Number(input.value);
        input.value = format(player.accretion.input, { type: 'input' });
        assignNewMassCap();
    });
    getId('collapseMassInput').addEventListener('blur', () => {
        const input = getId('collapseMassInput') as HTMLInputElement;
        player.collapse.input[0] = Math.max(Number(input.value), 1);
        input.value = format(player.collapse.input[0], { type: 'input' });
    });
    getId('collapseStarsInput').addEventListener('blur', () => {
        const input = getId('collapseStarsInput') as HTMLInputElement;
        player.collapse.input[1] = Math.max(Number(input.value), 1);
        input.value = format(player.collapse.input[1], { type: 'input' });
    });
    getId('stageInput').addEventListener('blur', () => {
        const input = getId('stageInput') as HTMLInputElement;
        player.stage.input = Math.max(Math.floor(Number(input.value)), 1);
        input.value = format(player.stage.input, { type: 'input' });
    });
    getId('versionButton').addEventListener('click', () => {
        buildVersionInfo();
        getId('versionInfo').style.display = '';
    });
    getId('save').addEventListener('click', () => { void saveLoad('save'); });
    getId('file').addEventListener('change', () => { void saveLoad('load'); });
    getId('export').addEventListener('click', () => { void saveLoad('export'); });
    getId('delete').addEventListener('click', () => { void saveLoad('delete'); });
    getId('switchTheme0').addEventListener('click', () => setTheme(0, true));
    for (let i = 1; i < global.stageInfo.word.length; i++) {
        getId(`switchTheme${i}`).addEventListener('click', () => setTheme(i));
    }
    getId('toggleAuto5').addEventListener('click', () => autoUpgradesSet('all'));
    getId('toggleAuto6').addEventListener('click', () => autoResearchesSet('researches', 'all'));
    getId('toggleAuto7').addEventListener('click', () => autoResearchesSet('researchesExtra', 'all'));
    getId('saveFileNameInput').addEventListener('blur', () => changeSaveFileName());
    {
        const image = getId('saveFileHoverButton');
        if (MD) { image.addEventListener('touchstart', () => (getId('saveFileNamePreview').textContent = replaceSaveFileSpecials())); }
        if (SR) { image.addEventListener('focus', () => (getId('saveFileNamePreview').textContent = replaceSaveFileSpecials())); }
        image.addEventListener('mouseover', () => (getId('saveFileNamePreview').textContent = replaceSaveFileSpecials()));
    }
    getId('mainInterval').addEventListener('blur', () => {
        const mainInput = getId('mainInterval') as HTMLInputElement;
        player.intervals.main = Math.min(Math.max(Math.trunc(Number(mainInput.value)), 20), 100);
        mainInput.value = `${player.intervals.main}`;
        changeIntervals();
    });
    getId('numbersInterval').addEventListener('blur', () => {
        const numberInput = getId('numbersInterval') as HTMLInputElement;
        player.intervals.numbers = Math.min(Math.max(Math.trunc(Number(numberInput.value)), 50), 200);
        numberInput.value = `${player.intervals.numbers}`;
        changeIntervals();
    });
    getId('visualInterval').addEventListener('blur', () => {
        const visualInput = getId('visualInterval') as HTMLInputElement;
        player.intervals.visual = Math.min(Math.max(Math.trunc(Number(visualInput.value) * 10) / 10, 0.2), 4);
        visualInput.value = `${player.intervals.visual}`;
        changeIntervals();
    });
    getId('autoSaveInterval').addEventListener('blur', () => {
        const autoSaveInput = getId('autoSaveInterval') as HTMLInputElement;
        player.intervals.autoSave = Math.min(Math.max(Math.trunc(Number(autoSaveInput.value)), 10), 1800);
        autoSaveInput.value = `${player.intervals.autoSave}`;
        changeIntervals();
    });
    getId('thousandSeparator').addEventListener('blur', () => changeFormat(false));
    getId('decimalPoint').addEventListener('blur', () => changeFormat(true));
    getId('pauseGame').addEventListener('click', () => { void pauseGame(); });
    getId('reviewEvents').addEventListener('click', () => { void replayEvent(); });
    getId('offlineWarp').addEventListener('click', () => { void timeWarp(); });
    getId('fontSizeToggle').addEventListener('click', () => changeFontSize(true));
    getId('customFontSize').addEventListener('blur', () => changeFontSize(false, true));

    getId('stageResetsSave').addEventListener('blur', () => {
        const inputID = getId('stageResetsSave') as HTMLInputElement;
        const { input } = player.history.stage;
        input[0] = Math.min(Math.max(Math.floor(Number(inputID.value)), 0), 20);
        inputID.value = `${input[0]}`;

        if (input[1] < input[0]) {
            (getId('stageResetsKeep') as HTMLInputElement).value = inputID.value;
            input[1] = input[0];
        }
    });
    getId('stageResetsKeep').addEventListener('blur', () => {
        const input = getId('stageResetsKeep') as HTMLInputElement;
        player.history.stage.input[1] = Math.min(Math.max(Math.floor(Number(input.value)), player.history.stage.input[0], 3), 100);
        input.value = `${player.history.stage.input[1]}`;
    });

    /* Only for phones */
    getId('mobileDeviceToggle').addEventListener('click', () => mobileDeviceSupport(true));

    /* Only for screen readers */
    getId('screenReaderToggle').addEventListener('click', () => screenReaderSupport(true));
    if (SR) {
        for (let i = 0; i < specialHTML.longestBuilding; i++) {
            getId(`SRBuild${i}`).addEventListener('click', () => getInformationSR(i, 'building'));
        }
        getId('SRExtra0').addEventListener('click', () => getInformationSR(0, 'resource'));
        getId('SRExtra1').addEventListener('click', () => getInformationSR(1, 'resource'));
        getId('SRInfo0').addEventListener('click', () => getInformationSR(0, 'information'));
    }

    /* Footer */
    getId('hideToggle').addEventListener('click', hideFooter);
    const tabList = global.tabList.tabs.slice(0, -1);
    for (const tabText of tabList) {
        getId(`${tabText}TabBtn`).addEventListener('click', () => switchTab(tabText));
        for (const subtabText of global.tabList[`${tabText as 'stage'}Subtabs`]) {
            getId(`${tabText}SubtabBtn${subtabText}`).addEventListener('click', () => switchTab(tabText, subtabText));
        }
    }
    for (let i = 1; i < global.stageInfo.word.length; i++) {
        getId(`${global.stageInfo.word[i]}Switch`).addEventListener('click', () => switchStage(i));
    }
    getId('currentSwitch').addEventListener('click', () => getId('stageSelect').classList.add('active'));
}

console.timeEnd('Game loaded in'); //Started in Player.ts

function changeIntervals(pause = false) {
    const { intervalsId } = global;

    clearInterval(intervalsId.main);
    clearInterval(intervalsId.numbers);
    clearInterval(intervalsId.visual);
    clearInterval(intervalsId.autoSave);
    if (!pause) {
        const { intervals } = player;

        intervalsId.main = setInterval(timeUpdate, intervals.main);
        intervalsId.numbers = setInterval(numbersUpdate, intervals.numbers);
        intervalsId.visual = setInterval(visualUpdate, intervals.visual * 1000);
        intervalsId.autoSave = setInterval(saveLoad, intervals.autoSave * 1000, 'save');
    }
}

async function saveLoad(type: string) {
    switch (type) {
        case 'load': {
            const id = getId('file') as HTMLInputElement;
            changeIntervals(true);

            try {
                const load = JSON.parse(atob(await (id.files as FileList)[0].text()));
                const versionCheck = updatePlayer(load);

                const { time } = player;
                const offlineTime = (Date.now() - time.updated) / 1000;
                const maxOffline = maxOfflineTime();
                time.updated = Date.now();
                time.offline = Math.min(time.offline + offlineTime, maxOffline);
                player.stage.export = Math.min(player.stage.export + offlineTime, maxExportTime());
                Alert(`This save is ${format(offlineTime, { type: 'time' })} old${time.offline >= maxOffline ? ', Offline storage is maxed' : ''}.\n${versionCheck !== player.version ? `Also save file version is ${versionCheck}, while game version is ${player.version}` : `Save file version is ${player.version}`}`);

                getId('isSaved').textContent = 'Imported';
                global.lastSave = 0;
                reLoad();
            } catch (error) {
                changeIntervals();
                Alert(`Incorrect save file format.\nFull error is: '${error}'`);
            } finally { id.value = ''; }
            return;
        }
        case 'save': {
            try {
                player.history.stage.list = global.historyStorage.stage.slice(0, player.history.stage.input[0]);

                const save = btoa(JSON.stringify(player));
                localStorage.setItem('save', save);
                clearInterval(global.intervalsId.autoSave);
                global.intervalsId.autoSave = setInterval(saveLoad, player.intervals.autoSave * 1000, 'save');
                getId('isSaved').textContent = 'Saved';
                global.lastSave = 0;
            } catch (error) {
                Alert(`Failed to save file.\nFull error is: '${error}'`);
            }
            return;
        }
        case 'export': {
            player.history.stage.list = global.historyStorage.stage.slice(0, player.history.stage.input[0]);

            if (player.strangeness[4][7] >= 1) {
                const multiplier = exportMultiplier();
                const strangeGain = Math.floor(player.stage.export * multiplier / 86400);
                player.strange[0].current += strangeGain;
                player.strange[0].total += strangeGain;
                player.stage.export -= strangeGain * 86400 / multiplier;
            }

            const save = btoa(JSON.stringify(player));
            const a = document.createElement('a');
            a.href = `data:text/plain;charset=utf-8,${save}`;
            a.download = replaceSaveFileSpecials();
            a.click();
            return;
        }
        case 'delete': {
            const ok = await Prompt("This will truly delete your save file and clear local storage!\nType 'delete' to confirm.");
            if (ok === null || ok === '') { return; }
            if (ok.toLowerCase() === 'delete') {
                changeIntervals(true);
                localStorage.clear();
                Alert('Game will auto refresh. If not then do it manually');
                window.location.reload();
            } else { Alert(`You wrote '${ok}', so save file wasn't deleted`); }
        }
    }
}

const changeSaveFileName = () => {
    const input = getId('saveFileNameInput') as HTMLInputElement;
    const newValue = input.value.length === 0 ? playerStart.fileName : input.value.replaceAll(/[\\/:*?"<>|]/g, '_');

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
        global.stageInfo.word[player.stage.active],
        global.stageInfo.word[player.stage.true],
        getDate('dateDMY'),
        getDate('timeHMS')
    ];
    for (let i = 0; i < special.length; i++) {
        realName = realName.replaceAll(special[i], replaceWith[i]);
    }
    return `${realName}.txt`;
};

const getDate = (type: 'dateDMY' | 'timeHMS'): string => {
    const current = new Date();
    switch (type) {
        case 'dateDMY': {
            const day = current.getDate();
            const month = current.getMonth() + 1;
            return `${day < 10 ? `0${day}` : day}.${month < 10 ? `0${month}` : month}.${current.getFullYear()}`;
        }
        case 'timeHMS': {
            const minutes = current.getMinutes();
            const seconds = current.getSeconds();
            return `${current.getHours()}-${minutes < 10 ? `0${minutes}` : minutes}-${seconds < 10 ? `0${seconds}` : seconds}`;
        }
    }
};

export const timeWarp = async() => {
    const { time } = player;
    const waste = (6 - (player.stage.true >= 6 ? player.strangeness[2][7] : 0)) / 2;
    if (time.offline < 600 * waste) { return Alert(`Need at least ${format(600 * waste, { type: 'time' })} (10 minutes effective) of Storaged Offline time to Warp`); }

    const warpTime = Math.min(player.researchesAuto[0] < 3 ? (await Confirm(`Do you wish to Warp forward? Current effective Offline time is ${format(time.offline / waste, { type: 'time' })}, will be consumed up to 1 hour (uses ${format(waste)} seconds per added second)\nCalculates a minute per tick`) ? 3600 : 0) :
        Number(await Prompt(`How many seconds do you wish to Warp forward? Current effective Offline time is ${format(time.offline / waste, { type: 'time' })} (uses ${format(waste)} seconds per added second, minimum value is 10 minutes)\nBigger number will result in more lag (calculates a minute per tick)`)), time.offline);
    if (warpTime < 600 || !isFinite(warpTime)) { return; }

    time.offline -= warpTime * waste;
    timeUpdate(warpTime);
};

const pauseGame = async() => {
    changeIntervals(true);
    await AlertWait("Game is currently paused. Press 'confirm' to unpause it. Time spend here will be moved into offline storage");

    const { time } = player;
    const offlineTime = (Date.now() - time.updated) / 1000;
    time.updated = Date.now();
    global.lastSave += offlineTime;
    time.offline = Math.min(time.offline + offlineTime, maxOfflineTime());
    player.stage.export = Math.min(player.stage.export + offlineTime, maxExportTime());

    changeIntervals();
    numbersUpdate();
    visualUpdate();
};
