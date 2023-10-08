import { player, global, playerStart, updatePlayer, buildVersionInfo, deepClone } from './Player';
import { getUpgradeDescription, timeUpdate, switchTab, numbersUpdate, visualUpdate, format, maxOfflineTime, exportMultiplier, maxExportTime, getChallengeDescription, getChallengeReward, stageUpdate, getStrangenessDescription } from './Update';
import { assignNewMassCap, assignStrangeBoost, autoElementsSet, autoResearchesSet, autoUpgradesSet, buyBuilding, buyUpgrades, collapseAsyncReset, dischargeAsyncReset, enterChallenge, rankAsyncReset, stageAsyncReset, switchStage, toggleBuy, toggleConfirm, toggleSwap, vaporizationAsyncReset } from './Stage';
import { Alert, hideFooter, Prompt, setTheme, changeFontSize, screenReaderSupport, mobileDeviceSupport, changeFormat, specialHTML, replayEvent, Confirm, preventImageUnload, Notify } from './Special';
import { detectHotkey } from './Hotkeys';
import { prepareVacuum, switchVacuum } from './Vacuum';

/* This is how much I like to non stop write that element is not null */
export const getId = (id: string, cacheIn = true): HTMLElement => {
    if (!cacheIn) { return document.getElementById(id) as HTMLElement; }
    const test = specialHTML.cache.idMap.get(id);
    if (test === undefined) {
        const store = document.getElementById(id);
        if (store === null) {
            if (global.debug.errorID) {
                global.debug.errorID = false;
                Notify(`Error encountered, ID - '${id}' doesn't exist`);
                setTimeout(() => { global.debug.errorID = true; }, 6e4);
            }
            throw new ReferenceError(`ID - '${id}' doesn't exist`);
        }
        specialHTML.cache.idMap.set(id, store);
        return store;
    }
    return test;
};
export const getClass = (idCollection: string): HTMLCollectionOf<HTMLElement> => {
    //Might require to remove old values: 'specialHTML.cache.classMap.delete(oldValue)'
    const test = specialHTML.cache.classMap.get(idCollection);
    if (test === undefined) {
        const store = document.getElementsByClassName(idCollection) as HTMLCollectionOf<HTMLElement>;
        specialHTML.cache.classMap.set(idCollection, store);
        return store;
    }
    return test;
};
export const getQuery = (query: string): HTMLElement => {
    const test = specialHTML.cache.queryMap.get(query);
    if (test === undefined) {
        const store = document.querySelector(query) as HTMLElement;
        if (store === null) {
            if (global.debug.errorQuery) {
                global.debug.errorQuery = false;
                Notify(`Error encountered, Query - '${query}' failed to find anything`);
                setTimeout(() => { global.debug.errorQuery = true; }, 6e4);
            }
            throw new ReferenceError(`Query - '${query}' failed`);
        }
        specialHTML.cache.queryMap.set(query, store);
        return store;
    }
    return test;
};

const handleOfflineTime = (): number => {
    const { time } = player;
    const timeNow = Date.now();
    const offlineTime = (timeNow - time.updated) / 1000;
    time.updated = timeNow;
    time.offline = Math.min(time.offline + offlineTime, maxOfflineTime());
    player.stage.export = Math.min(player.stage.export + offlineTime, maxExportTime());
    return offlineTime;
};

const changeIntervals = (pause = false) => {
    const { intervalsId } = global;
    const { intervals } = player;

    clearInterval(intervalsId.main);
    clearInterval(intervalsId.numbers);
    clearInterval(intervalsId.visual);
    clearInterval(intervalsId.autoSave);
    intervalsId.main = pause ? undefined : setInterval(timeUpdate, intervals.main);
    intervalsId.numbers = pause ? undefined : setInterval(numbersUpdate, intervals.numbers);
    intervalsId.visual = pause ? undefined : setInterval(visualUpdate, intervals.visual * 1000);
    intervalsId.autoSave = pause ? undefined : setInterval(saveLoad, intervals.autoSave * 1000, 'save');
};

try { //Start everything
    preventImageUnload();

    const save = localStorage.getItem('save');
    if (save !== null) {
        const load = JSON.parse(atob(save));
        const versionCheck = updatePlayer(load);
        void Alert(`Welcome back, you were away for ${format(handleOfflineTime(), { type: 'time' })}\n${versionCheck !== player.version ? `Game have been updated from ${versionCheck} to ${player.version}` : `Current version is ${player.version}`}`);
    } else {
        prepareVacuum();
        updatePlayer(deepClone(playerStart));
        void Alert(`Welcome to 'Fundamental' ${player.version}, a test-project created by awWhy\n(This idle game is not meant to be fast)`);
    }

    if (!player.toggles.normal[2]) {
        const elementsArea = getId('researchSubtabElements', false);
        elementsArea.id = 'ElementsTab';
        getId('researchTab').after(elementsArea);

        const elementsButton = getId('researchSubtabBtnElements', false);
        elementsButton.id = 'ElementsTabBtn';
        elementsButton.classList.add('stage4Include');
        getId('researchTabBtn').after(elementsButton);

        const tabList = global.tabList;
        tabList.researchSubtabs.splice(tabList.researchSubtabs.indexOf('Elements'), 1);
        tabList.tabs.splice(tabList.tabs.indexOf('research') + 1, 0, 'Elements');
    }
    mobileDeviceSupport();
    screenReaderSupport();
    changeFontSize();

    /* Global */
    const SR = global.screenReader[0];
    const hover = global.mobileDevice ? 'touchstart' : 'mouseover';
    document.addEventListener('keydown', (key: KeyboardEvent) => detectHotkey(key));
    for (let i = 0; i < playerStart.toggles.normal.length; i++) {
        getId(`toggle${i}`).addEventListener('click', () => toggleSwap(i, 'normal', true));
    }
    for (let i = 0; i < playerStart.toggles.confirm.length; i++) {
        getId(`toggleConfirm${i}`).addEventListener('click', () => toggleConfirm(i, true));
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
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, 'upgrades')); }
        image.addEventListener(hover, () => getUpgradeDescription(i, 'upgrades'));
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
    getId('buyMax').addEventListener('click', () => toggleBuy('max'));
    getId('buyAnyInput').addEventListener('change', () => toggleBuy('any'));
    getId('autoWaitInput').addEventListener('change', () => {
        const input = getId('autoWaitInput') as HTMLInputElement;
        let value = Math.max(Number(input.value), 1);
        if (isNaN(value)) { value = 2; }
        player.toggles.shop.wait[player.stage.active] = value;
        input.value = format(value, { type: 'input' });
    });

    for (let i = -1; i < global.challengesInfo.name.length; i++) {
        const image = getId(`challenge${i + 1}`);
        if (SR) { image.addEventListener('focus', () => getChallengeDescription(i)); }
        image.addEventListener(hover, () => getChallengeDescription(i));
        image.addEventListener('click', i === -1 ? switchVacuum : () => { void enterChallenge(i); });
    }
    for (let i = 1; i < global.challengesInfo.rewardText[0].length; i++) {
        if (i === 5) { continue; } //Missing for now
        getId(`voidReward${global.stageInfo.word[i]}`).addEventListener('click', () => getChallengeReward(i/*, 'void'*/));
    }

    /* Research tab */
    for (let i = 0; i < specialHTML.longestResearch; i++) {
        const image = getId(`research${i + 1}Image`);
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, 'researches')); }
        image.addEventListener(hover, () => getUpgradeDescription(i, 'researches'));
        image.addEventListener('click', () => buyUpgrades(i, player.stage.active, 'researches'));
    }
    for (let i = 0; i < specialHTML.longestResearchExtra; i++) {
        const image = getId(`researchExtra${i + 1}Image`);
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, 'researchesExtra')); }
        image.addEventListener(hover, () => getUpgradeDescription(i, 'researchesExtra'));
        image.addEventListener('click', () => buyUpgrades(i, player.stage.active, 'researchesExtra'));
    }
    {
        const image = getId('ASRImage');
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(0, 'ASR')); }
        image.addEventListener(hover, () => getUpgradeDescription(0, 'ASR'));
        image.addEventListener('click', () => buyUpgrades(player.stage.active, player.stage.active, 'ASR'));
    }

    getId('element0').addEventListener('dblclick', () => getUpgradeDescription(0, 'elements'));
    for (let i = 1; i < global.elementsInfo.startCost.length; i++) {
        const image = getId(`element${i}`);
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, 'elements')); }
        image.addEventListener(hover, () => getUpgradeDescription(i, 'elements'));
        image.addEventListener('click', () => buyUpgrades(i, 4, 'elements'));
    }

    /* Strangeness tab */
    for (let s = 1; s < global.strangenessInfo.length; s++) {
        for (let i = 0; i < global.strangenessInfo[s].startCost.length; i++) {
            const image = getId(`strange${i + 1}Stage${s}Image`);
            if (SR) { image.addEventListener('focus', () => getStrangenessDescription(i, s, 'strangeness')); }
            image.addEventListener(hover, () => getStrangenessDescription(i, s, 'strangeness'));
            image.addEventListener('click', () => buyUpgrades(i, s, 'strangeness'));
        }
    }
    for (let s = 1; s < global.milestonesInfo.length; s++) {
        for (let i = 0; i < global.milestonesInfo[s].need.length; i++) {
            const image = getQuery(`#milestone${i + 1}Stage${s}Div > img`);
            if (SR) { image.addEventListener('focus', () => getStrangenessDescription(i, s, 'milestones')); }
            image.addEventListener(hover, () => getStrangenessDescription(i, s, 'milestones'));
        }
    }

    /* Settings tab */
    getId('vaporizationInput').addEventListener('change', () => {
        const input = getId('vaporizationInput') as HTMLInputElement;
        player.vaporization.input = Math.max(Number(input.value), 0);
        input.value = format(player.vaporization.input, { type: 'input' });
    });
    getId('rankShiftInput').addEventListener('change', () => {
        const input = getId('rankShiftInput') as HTMLInputElement;
        player.accretion.input = Number(input.value);
        input.value = format(player.accretion.input, { type: 'input' });
        assignNewMassCap();
    });
    getId('collapseStarsInput').addEventListener('change', () => {
        const input = getId('collapseStarsInput') as HTMLInputElement;
        player.collapse.input = Math.max(Number(input.value), 1);
        input.value = format(player.collapse.input, { type: 'input' });
    });
    getId('stageInput').addEventListener('change', () => {
        const input = getId('stageInput') as HTMLInputElement;
        player.stage.input = Math.max(Number(input.value), 0);
        input.value = format(player.stage.input, { type: 'input' });
    });
    getId('versionButton').addEventListener('click', () => {
        buildVersionInfo();
        getId('versionInfo').style.display = '';
    });
    getId('save').addEventListener('click', () => { void saveLoad('save'); });
    getId('file').addEventListener('change', () => { void saveLoad('import'); });
    getId('export').addEventListener('click', () => { void saveLoad('export'); });
    getId('delete').addEventListener('click', () => { void saveLoad('delete'); });
    getId('switchTheme0').addEventListener('click', () => setTheme(null));
    for (let i = 1; i < global.stageInfo.word.length; i++) {
        getId(`switchTheme${i}`).addEventListener('click', () => setTheme(i));
    }
    getId('toggleAuto8').addEventListener('click', () => autoElementsSet());
    getId('toggleAuto5').addEventListener('click', () => autoUpgradesSet('all'));
    getId('toggleAuto6').addEventListener('click', () => autoResearchesSet('researches', 'all'));
    getId('toggleAuto7').addEventListener('click', () => autoResearchesSet('researchesExtra', 'all'));
    getId('saveFileNameInput').addEventListener('change', () => changeSaveFileName());
    {
        const button = getId('saveFileHoverButton');
        if (SR) { button.addEventListener('focus', () => (getId('saveFileNamePreview').textContent = replaceSaveFileSpecials())); }
        button.addEventListener(hover, () => (getId('saveFileNamePreview').textContent = replaceSaveFileSpecials()));
    }
    getId('mainInterval').addEventListener('change', () => {
        const mainInput = getId('mainInterval') as HTMLInputElement;
        player.intervals.main = Math.min(Math.max(Math.trunc(Number(mainInput.value)), 20), 100);
        mainInput.value = `${player.intervals.main}`;
        changeIntervals();
    });
    getId('numbersInterval').addEventListener('change', () => {
        const numberInput = getId('numbersInterval') as HTMLInputElement;
        player.intervals.numbers = Math.min(Math.max(Math.trunc(Number(numberInput.value)), 40), 200);
        numberInput.value = `${player.intervals.numbers}`;
        changeIntervals();
    });
    getId('visualInterval').addEventListener('change', () => {
        const visualInput = getId('visualInterval') as HTMLInputElement;
        player.intervals.visual = Math.min(Math.max(Math.trunc(Number(visualInput.value) * 10) / 10, 0.2), 4);
        visualInput.value = `${player.intervals.visual}`;
        changeIntervals();
    });
    getId('autoSaveInterval').addEventListener('change', () => {
        const autoSaveInput = getId('autoSaveInterval') as HTMLInputElement;
        player.intervals.autoSave = Math.min(Math.max(Math.trunc(Number(autoSaveInput.value)), 10), 1800);
        autoSaveInput.value = `${player.intervals.autoSave}`;
        changeIntervals();
    });
    getId('thousandSeparator').addEventListener('change', () => changeFormat(false));
    getId('decimalPoint').addEventListener('change', () => changeFormat(true));
    getId('MDMainToggle').addEventListener('click', () => mobileDeviceSupport(true));
    getId('SRMainToggle').addEventListener('click', () => screenReaderSupport(true));
    getId('pauseGame').addEventListener('click', () => { void pauseGame(); });
    getId('reviewEvents').addEventListener('click', () => { void replayEvent(); });
    getId('offlineWarp').addEventListener('click', () => { void timeWarp(); });
    getId('customFontSize').addEventListener('change', () => changeFontSize(true));

    getId('stageResetsSave').addEventListener('change', () => {
        const inputID = getId('stageResetsSave') as HTMLInputElement;
        const { input } = player.history.stage;
        input[0] = Math.min(Math.max(Math.trunc(Number(inputID.value)), 0), 20);
        inputID.value = `${input[0]}`;

        if (input[1] < input[0]) {
            (getId('stageResetsKeep') as HTMLInputElement).value = inputID.value;
            input[1] = input[0];
        }
    });
    getId('stageResetsKeep').addEventListener('change', () => {
        const input = getId('stageResetsKeep') as HTMLInputElement;
        player.history.stage.input[1] = Math.min(Math.max(Math.trunc(Number(input.value)), player.history.stage.input[0], 3), 100);
        input.value = `${player.history.stage.input[1]}`;
    });

    /* Footer */
    getId('hideToggle').addEventListener('click', hideFooter);
    for (const tabText of global.tabList.tabs) {
        getId(`${tabText}TabBtn`).addEventListener('click', () => switchTab(tabText));
        if (!Object.hasOwn(global.tabList, `${tabText}Subtabs`)) { continue; }
        for (const subtabText of global.tabList[`${tabText as 'stage'}Subtabs`]) {
            getId(`${tabText}SubtabBtn${subtabText}`).addEventListener('click', () => switchTab(tabText, subtabText));
        }
    }
    for (let i = 1; i < global.stageInfo.word.length; i++) {
        getId(`${global.stageInfo.word[i]}Switch`).addEventListener('click', () => switchStage(i));
    }
    getId('currentSwitch').addEventListener('click', () => getId('stageSelect').classList.add('active'));

    /* Post */
    stageUpdate('reload');
    getId('body').style.display = '';
    getId('loading').style.display = 'none';
    Notify(`Game successfully loaded after ${Date.now() - playerStart.time.started} ms`);

    changeIntervals();
    document.title = `Fundamental ${playerStart.version}`;
} catch (error) {
    const buttonDiv = document.createElement('div');
    buttonDiv.innerHTML = '<button type="button" id="exportError" style="width: 7em;">Export save</button><button type="button" id="deleteError" style="width: 7em;">Delete save</button>';
    buttonDiv.style.cssText = 'display: flex; column-gap: 0.6em; margin-top: 0.4em;';
    getId('loading').append(buttonDiv);
    getId('exportError').addEventListener('click', () => {
        const save = localStorage.getItem('save');
        if (save === null) { return void Alert('No save file detected'); }
        const a = document.createElement('a');
        a.href = `data:text/plain,${save}`;
        a.download = 'Fundamental post error export';
        a.click();
    });
    getId('deleteError').addEventListener('click', async() => {
        if (!(await Confirm("Press 'Confirm' to delete your save file\nThis will not be possible to undo, so export save file first"))) { return; }
        if (!(await Confirm("Last warning, press 'Confirm' to delete your save file"))) { return; }
        localStorage.removeItem('save');
        window.location.reload();
        void Alert('Game will auto refresh. If not then do it manually');
    });
    void Alert(`Error detected during game loading:\n${error}`);
}

const saveLoad = async(type: 'import' | 'save' | 'export' | 'delete'): Promise<void> => {
    switch (type) {
        case 'import': {
            const id = getId('file') as HTMLInputElement;
            changeIntervals(true);

            try {
                const save = await (id.files as FileList)[0].text();
                const versionCheck = updatePlayer(JSON.parse(atob(save)));

                Notify(`This save is ${format(handleOfflineTime(), { type: 'time' })} old. Save file version is ${versionCheck}`);
                getId('isSaved').textContent = 'Imported';
                global.lastSave = 0;
                stageUpdate('reload');
            } catch (error) {
                void Alert(`Incorrect save file format\nFull error is: '${error}'`);
            } finally {
                changeIntervals();
                id.value = '';
            }
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
                void Alert(`Failed to save file\nFull error is: '${error}'`);
            }
            return;
        }
        case 'export': {
            player.history.stage.list = global.historyStorage.stage.slice(0, player.history.stage.input[0]);

            if (player.strange[0].total > 0 && player.stage.export > 0) {
                const rewardType = player.strangeness[5][10];
                const multiplier = exportMultiplier();

                let strangeGain;
                if (rewardType >= 1) {
                    strangeGain = player.stage.export * multiplier / 86400 / 1e12 ** rewardType;
                    player.stage.export = 0;
                } else {
                    strangeGain = Math.floor(player.stage.export * multiplier / 86400);
                    player.stage.export -= strangeGain * 86400 / multiplier;
                }
                player.strange[rewardType].current += strangeGain;
                player.strange[rewardType].total += strangeGain;
                if (rewardType === 0) { assignStrangeBoost(); }
            }

            const save = btoa(JSON.stringify(player));
            const a = document.createElement('a');
            a.href = `data:text/plain,${save}`;
            a.download = replaceSaveFileSpecials();
            a.click();
            return;
        }
        case 'delete': {
            const ok = await Prompt("Type 'delete' to confirm delete your save file (there is no reward for doing it)\nOr 'clear' to clear local storage (this will delete all data from domain, including other games)");
            if (ok === null || ok === '') { return; }
            const lower = ok.toLowerCase();
            if (lower !== 'delete' && lower !== 'clear') { return Notify(`Deletion canceled, wrong input '${ok}'`); }

            changeIntervals(true);
            if (lower === 'delete') {
                localStorage.removeItem('save');
            } else { localStorage.clear(); }
            window.location.reload();
            void Alert('Game will auto refresh. If not then do it manually');
        }
    }
};

const changeSaveFileName = () => {
    const input = getId('saveFileNameInput') as HTMLInputElement;
    const newValue = input.value.length === 0 ? playerStart.fileName : input.value.replaceAll(/[\\/:*?"<>|]/g, '_');

    try {
        btoa(newValue); //Test for any illegal characters
        player.fileName = newValue;
        input.value = newValue;
    } catch (error) {
        void Alert(`Save file name is not allowed\nFull error is: '${error}'`);
    }
};

const replaceSaveFileSpecials = (): string => {
    let realName = player.fileName;
    const special = [
        '[stage]',
        '[true]',
        '[strange]',
        '[matter]',
        '[vacuum]',
        '[date]',
        '[time]'
    ];
    const replaceWith = [
        global.stageInfo.word[player.stage.active],
        global.stageInfo.word[player.stage.true],
        `${global.strangeInfo.gain(player.stage.active)}`,
        `${global.strangeInfo.name[player.strangeness[5][10]]}`,
        `${player.inflation.vacuum}`,
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
    const waste = (8 - (player.stage.true >= 6 ? player.strangeness[2][7] : 0)) / 2;
    if (time.offline < 900 * waste) { return void Alert(`Need at least ${format(15 * waste)} minutes (effective is 15 minutes) of storaged Offline time to Warp`); }

    const warpTime = Math.min(player.strangeness[1][7] < 2 ? (await Confirm(`Do you wish to Warp forward? Current effective Offline time is ${format(time.offline / waste, { type: 'time' })}, will be consumed up to half an hour (uses ${format(waste)} seconds per added second)\nCalculates a minute per tick`) ? 1800 : 0) :
        Number(await Prompt(`How many seconds do you wish to Warp forward? Current effective Offline time is ${format(time.offline / waste, { type: 'time' })} (uses ${format(waste)} seconds per added second, minimum value is 15 minutes)\nBigger number will result in more lag (calculates a minute per tick)`, '900')), time.offline / waste);
    if (warpTime < 900 || !isFinite(warpTime)) { return warpTime === 0 ? undefined : Notify('Warp failed, input or storage is below minimum value or invalid'); }

    time.offline -= warpTime * waste;
    timeUpdate(warpTime);
};

const pauseGame = async() => {
    changeIntervals(true);
    await Alert("Game is currently paused. Press 'confirm' to unpause it. Time spend here will be moved into offline storage");

    Notify(`Game was paused for ${format(handleOfflineTime(), { type: 'time' })}`);
    changeIntervals();
    numbersUpdate();
    visualUpdate();
};
