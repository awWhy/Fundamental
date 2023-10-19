import { player, global, playerStart, updatePlayer, buildVersionInfo, deepClone } from './Player';
import { getUpgradeDescription, timeUpdate, switchTab, numbersUpdate, visualUpdate, format, maxOfflineTime, exportMultiplier, maxExportTime, getChallengeDescription, getChallengeReward, stageUpdate, getStrangenessDescription, offlineWaste, visualUpdateResearches } from './Update';
import { assignStrangeBoost, autoElementsSet, autoResearchesSet, autoUpgradesSet, buyBuilding, buyUpgrades, collapseAsyncReset, dischargeAsyncReset, enterExitChallenge, rankAsyncReset, stageAsyncReset, switchStage, toggleBuy, toggleConfirm, toggleSwap, vaporizationAsyncReset } from './Stage';
import { Alert, hideFooter, Prompt, setTheme, changeFontSize, changeFormat, specialHTML, replayEvent, Confirm, preventImageUnload, Notify, MDStrangenessPage } from './Special';
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
    const time = player.time;
    const timeNow = Date.now();
    const offlineTime = (timeNow - time.updated) / 1000;
    time.updated = timeNow;
    time.offline = Math.min(time.offline + offlineTime, maxOfflineTime());
    player.stage.export = Math.min(player.stage.export + offlineTime, maxExportTime());
    return offlineTime;
};

const changeIntervals = (pause = false) => {
    const intervalsId = global.intervalsId;
    const intervals = player.intervals;

    clearInterval(intervalsId.main);
    clearInterval(intervalsId.numbers);
    clearInterval(intervalsId.visual);
    clearInterval(intervalsId.autoSave);
    intervalsId.main = pause ? undefined : setInterval(timeUpdate, intervals.main);
    intervalsId.numbers = pause ? undefined : setInterval(numbersUpdate, intervals.numbers);
    intervalsId.visual = pause ? undefined : setInterval(visualUpdate, intervals.visual);
    intervalsId.autoSave = pause ? undefined : setInterval(saveGame, intervals.autoSave);
};

const saveGame = async() => {
    try {
        player.history.stage.list = global.historyStorage.stage.slice(0, player.history.stage.input[0]);

        const save = btoa(JSON.stringify(player));
        localStorage.setItem('save', save);
        clearInterval(global.intervalsId.autoSave);
        global.intervalsId.autoSave = setInterval(saveGame, player.intervals.autoSave);
        getId('isSaved').textContent = 'Saved';
        global.lastSave = 0;
    } catch (error) {
        void Alert(`Failed to save game\nFull error: '${error}'`);
    }
};
const loadGame = (save: string) => {
    changeIntervals(true);
    try {
        const versionCheck = updatePlayer(JSON.parse(atob(save)));

        global.lastSave = handleOfflineTime();
        Notify(`This save is ${format(global.lastSave, { type: 'time' })} old. Save file version is ${versionCheck}`);
        stageUpdate('reload');
    } catch (error) { void Alert(`Incorrect save file format\nFull error: '${error}'`); }
    changeIntervals();
};
const exportFileGame = async() => {
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
};
const saveConsole = async() => {
    const value = await Prompt("Available options:\n'Copy' - copy save file to clipboard\n'Delete' - delete your save file\n'Clear' - clear all domain data\nOr insert save file string here to load it");
    if (value === null || value === '') { return; }
    const lower = value.toLowerCase();

    if (lower === 'copy') {
        void navigator.clipboard.writeText(btoa(JSON.stringify(player))).catch((error) => Notify(`Copy to clipboard failed\nFull error: '${error}'`));
    } else if (lower === 'delete' || lower === 'clear') {
        changeIntervals(true);
        if (lower === 'delete') {
            localStorage.removeItem('save');
        } else { localStorage.clear(); }
        window.location.reload();
        void Alert('Awaiting page refresh');
    } else if (lower === 'achievement') {
        Notify('Unlocked a new Achievement');
    } else if (lower === 'slow' || lower === 'free') {
        Notify('Game speed was increased by 1x');
    } else if (lower === 'neutronium' || lower === 'element0') {
        Notify(`${global.elementsInfo.effectText[0]().replace('this', 'Elements')}`);
    } else {
        if (value.length < 20) { return void Alert(`Input '${value}' doesn't match anything`); }
        if (!await Confirm("Press 'Confirm' to load input as a save file\n(Input is too long to be displayed)")) { return; }
        loadGame(value);
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
        void Alert(`Save file name is not allowed\nFull error: '${error}'`);
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
            const day = `${current.getDate()}`.padStart(2, '0');
            const month = `${current.getMonth() + 1}`.padStart(2, '0');
            return `${day}.${month}.${current.getFullYear()}`;
        }
        case 'timeHMS': {
            const minutes = `${current.getMinutes()}`.padStart(2, '0');
            const seconds = `${current.getSeconds()}`.padStart(2, '0');
            return `${current.getHours()}-${minutes}-${seconds}`;
        }
    }
};

export const timeWarp = async() => {
    const time = player.time;
    const waste = offlineWaste() / 1.5;
    if (time.offline < 600 * waste) { return void Alert(`Need at least ${format(10 * waste)} minutes of storaged Offline time to Warp`); }

    let warpTime: number;
    const improved = player.strangeness[1][7] >= 2;
    if (improved) {
        warpTime = Math.min(Number(await Prompt(`How many seconds do you wish to Warp forward? (Minimum value is 10 minutes)\nCurrent Offline time is ${format(time.offline, { type: 'time' })} (${format(time.offline / waste, { type: 'time' })} effective, ${format(waste)} seconds per added second)\n(One tick will be equal to warp time / 1000)`, '600')), time.offline / waste);
        if (!isFinite(warpTime)) { return Notify('Warp failed, input is invalid'); }
    } else {
        const minimum = Math.min(1200, time.offline / waste);
        warpTime = await Confirm(`Do you wish to Warp ${format(minimum, { type: 'time' })} forward? Current Offline time is ${format(time.offline, { type: 'time' })} (${format(time.offline / waste, { type: 'time' })} effective), will consume ${format(minimum * waste, { type: 'time' })}\n(One tick is 20 seconds)`) ? minimum : 0;
    }
    if (warpTime < 600) { return warpTime === 0 ? undefined : Notify('Warp failed, storage or input is below minimum value'); }

    time.offline -= warpTime * waste;
    try {
        timeUpdate(warpTime, improved ? warpTime / 1000 : 20);
    } catch (error) { Notify(`Warp failed due to Error:\n${error}`); }
};

const pauseGame = async() => {
    changeIntervals(true);
    await Alert("Game is currently paused. Press 'confirm' to unpause it. Time spent here will be moved into Offline storage");

    const offline = handleOfflineTime();
    Notify(`Game was paused for ${format(offline, { type: 'time' })}`);
    global.lastSave += offline;
    changeIntervals();
    numbersUpdate();
    visualUpdate();
};

try { //Start everything
    preventImageUnload();

    const supportType = localStorage.getItem('support');
    if (supportType !== null) {
        const hangleToggle = (number: number, type: 'MD' | 'SR', reload = false) => {
            let state;
            if (reload) {
                state = false;
            } else {
                const support = localStorage.getItem('support') as string;
                state = support[number + 1] === 'F';
                localStorage.setItem('support', `${support.slice(0, number + 1)}${state ? 'T' : 'F'}${support.slice(number + 2, support.length)}`);
            }
            if (type === 'SR' && number === 0) { global.supportSettings[0] = state; }

            const toggleHTML = getId(`${type}Toggle${number}`);
            if (state) {
                toggleHTML.style.color = '';
                toggleHTML.style.borderColor = '';
                toggleHTML.textContent = 'ON';
            } else {
                toggleHTML.style.color = 'var(--red-text)';
                toggleHTML.style.borderColor = 'crimson';
                toggleHTML.textContent = 'OFF';
            }
            return state;
        };

        if (supportType[0] === 'M') {
            const MDToggle = getId('MDMainToggle');
            MDToggle.textContent = 'ON';
            MDToggle.style.color = 'var(--red-text)';
            MDToggle.style.borderColor = 'crimson';
            global.mobileDevice = true;
            const styleSheet = 'input[type = "image"], img { -webkit-touch-callout: none; }'; //Safari junk to disable image hold menu

            getId('MDMessage1', false).remove();
            (getId('file') as HTMLInputElement).accept = ''; //Accept for unknown reason not properly supported on phones

            const pages = document.createElement('div');
            pages.innerHTML = '<button type="button" id="strangenessPage1" class="stage1borderImage hollowButton">1</button><button type="button" id="strangenessPage2" class="stage2borderImage hollowButton">2</button><button type="button" id="strangenessPage3" class="stage3borderImage hollowButton">3</button><button type="button" id="strangenessPage4" class="stage4borderImage hollowButton">4</button><button type="button" id="strangenessPage5" class="stage5borderImage hollowButton">5</button><button type="button" id="strangenessCreate" class="hollowButton" style="width: unset; padding: 0 0.4em;">Create</button>';
            getId('strangenessResearch').append(pages);
            document.head.appendChild(document.createElement('style')).textContent = styleSheet + '#strangenessResearch > div { display: flex; justify-content: center; column-gap: 0.3em; } #strangenessResearch > div > button { width: 2.08em; height: calc(2.08em - 2px); border-top: none; border-radius: 0 0 4px 4px; }';

            const MDToggle0 = document.createElement('li');
            MDToggle0.innerHTML = '<label>Remove mouse hover events<button type="button" id="MDToggle0" class="specialToggle">ON</button></label>';
            getId('MDLi').after(MDToggle0);

            getId('MDToggle0').addEventListener('click', async() => {
                if (!await Confirm('Changing this setting will reload the page, confirm?\n(Game will not autosave)')) { return; }
                hangleToggle(0, 'MD');
                window.location.reload();
            });
            if (supportType[1] === 'F') { hangleToggle(0, 'MD', true); }
        } else if (supportType[0] === 'S') {
            const SRToggle = getId('SRMainToggle');
            SRToggle.textContent = 'ON';
            SRToggle.style.color = 'var(--red-text)';
            SRToggle.style.borderColor = 'crimson';
            global.screenReader = true;

            getId('SRMessage1', false).remove();

            const SRMainDiv = document.createElement('article');
            SRMainDiv.innerHTML = '<h3>Information for Screen reader</h3><p id="SRTab" aria-live="polite"></p><p id="SRStage" aria-live="polite"></p><p id="SRMain" aria-live="assertive"></p>';
            SRMainDiv.classList.add('reader');
            getId('fakeFooter').before(SRMainDiv);

            const SRToggle0 = document.createElement('li');
            SRToggle0.innerHTML = '<label>No tab index on created Upgrades<button type="button" id="SRToggle0" class="specialToggle">ON</button></label>';
            const SRToggle1 = document.createElement('li');
            SRToggle1.innerHTML = '<label>No tab index on primary buttons<button type="button" id="SRToggle1" class="specialToggle">ON</button></label>';
            getId('SRLi').after(SRToggle0, SRToggle1);

            getId('SRToggle0').addEventListener('click', () => {
                hangleToggle(0, 'SR');
                stageUpdate('reload');
                for (let s = 1; s < player.strangeness.length; s++) {
                    for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) {
                        visualUpdateResearches(i, s, 'strangeness');
                    }
                }
            });
            if (supportType[1] === 'F') { hangleToggle(0, 'SR', true); }

            const primaryIndex = (state: boolean) => {
                const newTab = state ? -1 : 0;
                getId('stageReset').tabIndex = newTab;
                getId('reset1Button').tabIndex = newTab;
                for (let i = 1; i < specialHTML.longestBuilding; i++) {
                    getId(`building${i}Btn`).tabIndex = newTab;
                    getId(`toggleBuilding${i}`).tabIndex = newTab;
                }
                getId('toggleBuilding0').tabIndex = newTab;
                for (const tabText of global.tabList.tabs) {
                    getId(`${tabText}TabBtn`).tabIndex = newTab;
                    if (!Object.hasOwn(global.tabList, `${tabText}Subtabs`)) { continue; }
                    for (const subtabText of global.tabList[`${tabText as 'stage'}Subtabs`]) {
                        getId(`${tabText}SubtabBtn${subtabText}`).tabIndex = newTab;
                    }
                }
                for (let i = 1; i < global.stageInfo.word.length; i++) {
                    getId(`${global.stageInfo.word[i]}Switch`).tabIndex = newTab;
                }
            };
            getId('SRToggle1').addEventListener('click', () => { primaryIndex(hangleToggle(1, 'SR')); });
            if (supportType[2] === 'F') { primaryIndex(hangleToggle(1, 'SR', true)); }
        }
    }

    let alertText;
    const save = localStorage.getItem('save');
    if (save !== null) {
        const load = JSON.parse(atob(save));
        const versionCheck = updatePlayer(load);
        global.lastSave = handleOfflineTime();
        alertText = `Welcome back, you were away for ${format(global.lastSave, { type: 'time' })}\n${versionCheck !== player.version ? `Game have been updated from ${versionCheck} to ${player.version}` : `Current version is ${player.version}`}`;
    } else {
        prepareVacuum(false); //Set buildings values
        updatePlayer(deepClone(playerStart));
        alertText = `Welcome to 'Fundamental' ${player.version}, a test-project created by awWhy\n(This idle game is not meant to be fast)`;
    }

    if (!player.toggles.normal[2]) {
        const elementsArea = getId('upgradeSubtabElements', false);
        elementsArea.id = 'ElementsTab';
        getId('upgradeTab').after(elementsArea);

        const elementsButton = getId('upgradeSubtabBtnElements', false);
        elementsButton.id = 'ElementsTabBtn';
        elementsButton.classList.add('stage4Include');
        getId('upgradeTabBtn').after(elementsButton);

        const tabList = global.tabList;
        tabList.upgradeSubtabs.splice(tabList.upgradeSubtabs.indexOf('Elements'), 1);
        tabList.tabs.splice(tabList.tabs.indexOf('upgrade') + 1, 0, 'Elements');
    }
    changeFontSize();

    /* Global */
    const { mobileDevice: MD, screenReader: SR } = global;
    const PC = !MD || (supportType as string)[1] === 'F';
    document.addEventListener('keydown', (key: KeyboardEvent) => detectHotkey(key));
    for (let i = 0; i < playerStart.toggles.normal.length; i++) {
        getId(`toggleNormal${i}`).addEventListener('click', () => {
            toggleSwap(i, 'normal', true);
            if (i === 2) { void Alert('Changes will come into effect after page reload'); }
        });
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
    getId('stageReset').addEventListener('click', () => { void stageAsyncReset(); });
    getId('reset1Button').addEventListener('click', () => {
        const active = player.stage.active;
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
        if (PC) { image.addEventListener('mouseover', () => getChallengeDescription(i)); }
        if (MD) { image.addEventListener('touchstart', () => getChallengeDescription(i)); }
        if (SR) { image.addEventListener('focus', () => getChallengeDescription(i)); }
        image.addEventListener('click', i === -1 ? switchVacuum : () => { void enterExitChallenge(i); });
    }
    for (let i = 1; i < global.challengesInfo.rewardText[0].length; i++) {
        if (i === 5) { continue; } //Missing for now
        const image = getId(`voidReward${global.stageInfo.word[i]}`);
        image.addEventListener('click', () => getChallengeReward(i/*, 'void'*/));
        if (MD) { //Safari bugs with no focus events
            image.addEventListener('click', () => { getId('voidRewardsDiv').style.display = 'block'; });
        }
    }
    if (MD) {
        getId('voidRewardsDiv').addEventListener('click', () => { getId('voidRewardsDiv').style.display = ''; });
    }

    /* Upgrade tab */
    for (let i = 0; i < specialHTML.longestUpgrade; i++) {
        const image = getId(`upgrade${i + 1}`);
        if (PC) { image.addEventListener('mouseover', () => getUpgradeDescription(i, 'upgrades')); }
        if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(i, 'upgrades')); }
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, 'upgrades')); }
        image.addEventListener('click', () => buyUpgrades(i, player.stage.active, 'upgrades'));
    }
    for (let i = 0; i < specialHTML.longestResearch; i++) {
        const image = getId(`research${i + 1}Image`);
        if (PC) { image.addEventListener('mouseover', () => getUpgradeDescription(i, 'researches')); }
        if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(i, 'researches')); }
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, 'researches')); }
        image.addEventListener('click', () => buyUpgrades(i, player.stage.active, 'researches'));
    }
    for (let i = 0; i < specialHTML.longestResearchExtra; i++) {
        const image = getId(`researchExtra${i + 1}Image`);
        if (PC) { image.addEventListener('mouseover', () => getUpgradeDescription(i, 'researchesExtra')); }
        if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(i, 'researchesExtra')); }
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, 'researchesExtra')); }
        image.addEventListener('click', () => buyUpgrades(i, player.stage.active, 'researchesExtra'));
    }
    {
        const image = getId('ASRImage');
        if (PC) { image.addEventListener('mouseover', () => getUpgradeDescription(0, 'ASR')); }
        if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(0, 'ASR')); }
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(0, 'ASR')); }
        image.addEventListener('click', () => buyUpgrades(player.stage.active, player.stage.active, 'ASR'));
    }

    if (PC) { getId('element0').addEventListener('dblclick', () => getUpgradeDescription(0, 'elements')); }
    for (let i = 1; i < global.elementsInfo.startCost.length; i++) {
        const image = getId(`element${i}`);
        if (PC) { image.addEventListener('mouseover', () => getUpgradeDescription(i, 'elements')); }
        if (MD) { image.addEventListener('touchstart', () => getUpgradeDescription(i, 'elements')); }
        if (SR) { image.addEventListener('focus', () => getUpgradeDescription(i, 'elements')); }
        image.addEventListener('click', () => buyUpgrades(i, 4, 'elements'));
    }

    /* Strangeness tab */
    for (let s = 1; s < global.strangenessInfo.length; s++) {
        if (MD) { getId(`strangenessPage${s}`).addEventListener('click', () => MDStrangenessPage(s)); }
        for (let i = 0; i < global.strangenessInfo[s].startCost.length; i++) {
            const image = getId(`strange${i + 1}Stage${s}Image`);
            if (PC) { image.addEventListener('mouseover', () => getStrangenessDescription(i, s, 'strangeness')); }
            if (MD) {
                image.addEventListener('touchstart', () => getStrangenessDescription(i, s, 'strangeness'));
            } else { image.addEventListener('click', () => buyUpgrades(i, s, 'strangeness')); }
            if (SR) { image.addEventListener('focus', () => getStrangenessDescription(i, s, 'strangeness')); }
        }
    }
    if (MD) { getId('strangenessCreate').addEventListener('click', () => buyUpgrades(global.lastStrangeness[0], global.lastStrangeness[1], 'strangeness')); }
    for (let s = 1; s < global.milestonesInfo.length; s++) {
        for (let i = 0; i < global.milestonesInfo[s].need.length; i++) {
            const image = getQuery(`#milestone${i + 1}Stage${s}Div > img`);
            if (PC) { image.addEventListener('mouseover', () => getStrangenessDescription(i, s, 'milestones')); }
            if (MD) { image.addEventListener('touchstart', () => getStrangenessDescription(i, s, 'milestones')); }
            if (SR) { image.addEventListener('focus', () => getStrangenessDescription(i, s, 'milestones')); }
        }
    }

    /* Settings tab */
    getId('vaporizationInput').addEventListener('change', () => {
        const input = getId('vaporizationInput') as HTMLInputElement;
        player.vaporization.input = Math.max(Number(input.value), 0);
        input.value = format(player.vaporization.input, { type: 'input' });
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
    getId('save').addEventListener('click', () => { void saveGame(); });
    getId('file').addEventListener('change', async() => {
        const id = getId('file') as HTMLInputElement;
        loadGame(await (id.files as FileList)[0].text());
        id.value = '';
    });
    getId('export').addEventListener('click', () => { void exportFileGame(); });
    getId('saveConsole').addEventListener('click', () => { void saveConsole(); });
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
        button.addEventListener('mouseover', () => (getId('saveFileNamePreview').textContent = replaceSaveFileSpecials()));
        if (SR) { button.addEventListener('focus', () => (getId('saveFileNamePreview').textContent = replaceSaveFileSpecials())); }
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
        player.intervals.visual = Math.min(Math.max(Math.trunc(Number(visualInput.value) * 100), 20), 400) * 10;
        visualInput.value = `${player.intervals.visual / 1000}`;
        changeIntervals();
    });
    getId('autoSaveInterval').addEventListener('change', () => {
        const autoSaveInput = getId('autoSaveInterval') as HTMLInputElement;
        player.intervals.autoSave = Math.min(Math.max(Math.trunc(Number(autoSaveInput.value) * 100), 400), 180000) * 10;
        autoSaveInput.value = `${player.intervals.autoSave / 1000}`;
        changeIntervals();
    });
    getId('thousandSeparator').addEventListener('change', () => changeFormat(false));
    getId('decimalPoint').addEventListener('change', () => changeFormat(true));
    getId('MDMainToggle').addEventListener('click', async() => {
        if (!await Confirm('Changing this setting will reload the page, confirm?\n(Game will not autosave)')) { return; }
        const support = localStorage.getItem('support');
        support !== null && support[0] === 'M' ? localStorage.removeItem('support') : localStorage.setItem('support', 'MT');
        window.location.reload();
    });
    getId('SRMainToggle').addEventListener('click', async() => {
        if (!await Confirm('Changing this setting will reload the page, confirm?\n(Game will not autosave)')) { return; }
        const support = localStorage.getItem('support');
        support !== null && support[0] === 'S' ? localStorage.removeItem('support') : localStorage.setItem('support', 'STT');
        window.location.reload();
    });
    getId('pauseGame').addEventListener('click', () => { void pauseGame(); });
    getId('reviewEvents').addEventListener('click', () => { void replayEvent(); });
    getId('offlineWarp').addEventListener('click', () => { void timeWarp(); });
    getId('customFontSize').addEventListener('change', () => changeFontSize(true));

    getId('stageResetsSave').addEventListener('change', () => {
        const inputID = getId('stageResetsSave') as HTMLInputElement;
        const input = player.history.stage.input;
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

    changeIntervals();
    document.title = `Fundamental ${playerStart.version}`;
    void Alert(alertText + `\n(Game successfully loaded after ${Date.now() - playerStart.time.started} ms)`);
} catch (error) {
    void Alert(`Game failed to load\nFull error: '${error}'`);
    const buttonDiv = document.createElement('div');
    buttonDiv.innerHTML = '<button type="button" id="exportError" style="width: 7em;">Export save</button><button type="button" id="deleteError" style="width: 7em;">Delete save</button>';
    buttonDiv.style.cssText = 'display: flex; column-gap: 0.6em; margin-top: 0.4em;';
    getId('loading').append(buttonDiv);
    let exported = false;
    getId('exportError').addEventListener('click', () => {
        exported = true;
        const save = localStorage.getItem('save');
        if (save === null) { return void Alert('No save file detected'); }
        const a = document.createElement('a');
        a.href = `data:text/plain,${save}`;
        a.download = 'Fundamental post error export';
        a.click();
    });
    getId('deleteError').addEventListener('click', async() => {
        if (!exported && !await Confirm("Recommended to export save file first\nPress 'Confirm' to confirm and delete your save file")) { return; }
        localStorage.removeItem('save');
        window.location.reload();
        void Alert('Awaiting page refresh');
    });
}
