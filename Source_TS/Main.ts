import { player, global, playerStart, updatePlayer, deepClone, cloneArray } from './Player';
import { getUpgradeDescription, switchTab, numbersUpdate, visualUpdate, format, getChallengeDescription, getChallengeReward, stageUpdate, getStrangenessDescription, visualUpdateResearches, visualUpdateUpgrades } from './Update';
import { assignBuildingsProduction, autoElementsSet, autoResearchesSet, autoUpgradesSet, buyBuilding, buyStrangeness, buyUpgrades, collapseResetUser, dischargeResetUser, enterExitChallengeUser, inflationRefund, loadoutsLoadAuto, mergeResetUser, rankResetUser, stageResetUser, switchStage, timeUpdate, toggleConfirm, toggleSupervoid, toggleSwap, vaporizationResetUser } from './Stage';
import { Alert, hideFooter, Prompt, setTheme, changeFontSize, changeFormat, specialHTML, replayEvent, Confirm, preventImageUnload, Notify, MDStrangenessPage, globalSave, toggleSpecial, saveGlobalSettings, getHotkeysHTML, getVersionInfoHTML } from './Special';
import { assignHotkeys, detectHotkey, handleTouchHotkeys } from './Hotkeys';
import { prepareVacuum } from './Vacuum';
import { checkUpgrade } from './Check';
import type { hotkeysList } from './Types';

/** Only for static HTML, by default (false) throws error if id is null */
export const getId = (id: string, noError = false): HTMLElement => {
    const test = specialHTML.cache.idMap.get(id);
    if (test !== undefined) { return test; }

    const store = document.getElementById(id);
    if (store !== null) {
        specialHTML.cache.idMap.set(id, store);
        return store;
    }

    if (noError) { return null as unknown as HTMLElement; }
    if (global.debug.errorID) {
        global.debug.errorID = false;
        Notify(`Error encountered, ID ‒ '${id}' doesn't exist`);
        setTimeout(() => { global.debug.errorID = true; }, 6e4);
    }
    throw new ReferenceError(`ID ‒ '${id}' doesn't exist`);
};

/** Id collection will be auto updated by browser */
export const getClass = (idCollection: string): HTMLCollectionOf<HTMLElement> => {
    const test = specialHTML.cache.classMap.get(idCollection);
    if (test !== undefined) { return test; }
    const store = document.getElementsByClassName(idCollection) as HTMLCollectionOf<HTMLElement>;
    specialHTML.cache.classMap.set(idCollection, store);
    return store;
};

/** Only for static HTML */
export const getQuery = (query: string): HTMLElement => {
    const test = specialHTML.cache.queryMap.get(query);
    if (test !== undefined) { return test; }

    const store = document.querySelector(query) as HTMLElement; //Can't add null type due to eslint being buggy
    if (store !== null) {
        specialHTML.cache.queryMap.set(query, store);
        return store;
    }

    if (global.debug.errorQuery) {
        global.debug.errorQuery = false;
        Notify(`Error encountered, Query ‒ '${query}' failed to find anything`);
        setTimeout(() => { global.debug.errorQuery = true; }, 6e4);
    }
    throw new ReferenceError(`Query ‒ '${query}' failed`);
};

/** Returns offline time in milliseconds */
const handleOfflineTime = (): number => {
    const timeNow = Date.now();
    const offlineTime = timeNow - player.time.updated;
    player.time.updated = timeNow;
    player.time.export[0] += offlineTime;
    return offlineTime;
};
export const simulateOffline = async(offline: number) => {
    if (!global.offline.active) { pauseGame(); }
    offline += player.time.offline;
    player.time.offline = 0;

    let decline = false;
    if (offline >= 20 && !player.toggles.normal[4]) {
        decline = !await Confirm(`Claim ${format(Math.min(offline / 1000, 43200), { type: 'time', padding: false })} worth of Offline time?\n(Includes time spent to click any of the buttons)`, 2) &&
            (globalSave.developerMode || !await Confirm("Press 'Cancel' again to confirm losing Offline time, 'Confirm' to keep it"));
        const extra = handleOfflineTime();
        global.lastSave += extra;
        offline += extra;
    }
    if (decline || offline < 20) {
        if (offline < 0) { player.time.offline = offline - 20; }
        timeUpdate(20, 20); //Just in case
        return offlineEnd(true);
    } else if (offline > 43200_000) { offline = 43200_000; }
    global.offline.stageUpdate = null;
    global.offline.speed = globalSave.intervals.offline;

    const accelerate = getId('offlineAccelerate');
    accelerate.addEventListener('click', offlineAccelerate);
    getId('offlineCancel').addEventListener('click', offlineCancel);
    document.body.addEventListener('keydown', offlineKey);
    getId('offlineMain').style.display = '';
    accelerate.focus();
    calculateOffline(offline);
};
const calculateOffline = (warpTime: number, start = warpTime) => {
    const rate = global.offline.speed;
    const time = rate <= 0 ? warpTime : Math.min(600 * rate, warpTime);
    warpTime -= time;
    try {
        timeUpdate(Math.max(time / 600, rate), time);
    } catch (error) {
        offlineEnd();
        const stack = (error as { stack: string }).stack;
        void Alert(`Offline calculation failed due to error:\n${typeof stack === 'string' ? stack.replaceAll(`${window.location.origin}/`, '') : error}`, 1);
        throw error;
    }
    if (warpTime > 0) {
        setTimeout(calculateOffline, 0, warpTime, start);
        getId('offlineTick').textContent = format(rate / 1000);
        getId('offlineRemains').textContent = format(warpTime / 1000, { type: 'time' });
        getId('offlinePercentage').textContent = format(100 - warpTime / start * 100, { padding: true });
        if (globalSave.SRSettings[0]) { getQuery('#offlineMain > div').ariaValueText = `${format(100 - warpTime / start * 100)}% done`; }
    } else { offlineEnd(); }
};
const offlineEnd = (early = false) => {
    if (global.offline.stageUpdate !== null) {
        stageUpdate(global.offline.stageUpdate);
    } else {
        visualUpdate();
        numbersUpdate();
    }
    pauseGame(false);
    if (early) { return; } //Just in case?
    getId('offlineMain').style.display = 'none';

    getId('offlineAccelerate').removeEventListener('click', offlineAccelerate);
    getId('offlineCancel').removeEventListener('click', offlineCancel);
    document.body.removeEventListener('keydown', offlineKey);
};
const offlineKey = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) { return; }
    const code = event.code;
    if (code === 'Escape') {
        if (event.shiftKey) { return; }
        event.preventDefault();
        offlineCancel();
    } else if (code === 'Enter' || code === 'Space') {
        if (event.shiftKey || document.activeElement === getId('offlineCancel')) { return; }
        event.preventDefault();
        offlineAccelerate();
    } else if (code === 'Tab') {
        event.preventDefault();
        const cancel = getId('offlineCancel');
        (document.activeElement === cancel ? getId('offlineAccelerate') : cancel).focus();
    }
};
const offlineCancel = () => (global.offline.speed = 0);
const offlineAccelerate = () => (global.offline.speed *= 2);

const changeIntervals = () => {
    const intervalsId = global.intervalsId;
    const intervals = globalSave.intervals;
    const paused = global.offline.active || global.paused;

    clearInterval(intervalsId.main);
    clearInterval(intervalsId.numbers);
    clearInterval(intervalsId.visual);
    clearInterval(intervalsId.autoSave);
    intervalsId.main = paused ? undefined : setInterval(timeUpdate, intervals.main, intervals.main);
    intervalsId.numbers = paused ? undefined : setInterval(numbersUpdate, intervals.numbers);
    intervalsId.visual = paused ? undefined : setInterval(visualUpdate, intervals.visual);
    intervalsId.autoSave = paused ? undefined : setInterval(saveGame, intervals.autoSave);
};
/** Pauses and unpauses game based on 'pause' value */
export const pauseGame = (pause = true) => {
    if (!pause && global.paused) {
        const button = getId('pauseButton');
        button.style.borderColor = '';
        button.style.color = '';
        getId('gamePaused').style.display = 'none';
        global.paused = false;
    }
    global.hotkeys.disabled = pause;
    global.offline.active = pause;
    changeIntervals();
};
export const pauseGameUser = () => {
    if (global.offline.active) { return; }
    if (!global.paused) {
        const button = getId('pauseButton');
        button.style.borderColor = 'forestgreen';
        button.style.color = 'var(--green-text)';
        getId('gamePaused').style.display = '';
        global.paused = true;
        changeIntervals();
        return;
    }
    const offline = handleOfflineTime();
    global.lastSave += offline;
    void simulateOffline(offline);
};

const saveGame = (noSaving = false): string | null => {
    if (global.offline.active) { return null; }
    try {
        player.history.stage.list = global.historyStorage.stage.slice(0, player.history.stage.input[0]);
        player.history.vacuum.list = global.historyStorage.vacuum.slice(0, player.history.vacuum.input[0]);

        const clone = { ...player };
        clone.fileName = String.fromCharCode(...new TextEncoder().encode(clone.fileName));
        const loadouts = {} as typeof clone.inflation.loadouts;
        for (const name in clone.inflation.loadouts) {
            loadouts[String.fromCharCode(...new TextEncoder().encode(name))] = clone.inflation.loadouts[name];
        }
        clone.inflation = { ...clone.inflation };
        clone.inflation.loadouts = loadouts;
        const save = btoa(JSON.stringify(clone));
        if (!noSaving) {
            localStorage.setItem(specialHTML.localStorage.main, save);
            clearInterval(global.intervalsId.autoSave);
            if (!global.paused) { global.intervalsId.autoSave = setInterval(saveGame, globalSave.intervals.autoSave); }
            getId('isSaved').textContent = 'Saved';
            global.lastSave = 0;
        }
        return save;
    } catch (error) {
        const stack = (error as { stack: string }).stack;
        void Alert(`Failed to save game\n${typeof stack === 'string' ? stack.replaceAll(`${window.location.origin}/`, '') : error}`, 1);
        throw error;
    }
};
const loadGame = (save: string) => {
    if (global.offline.active) { return; }
    pauseGame();
    try {
        const versionCheck = updatePlayer(JSON.parse(atob(save)));

        global.lastSave = handleOfflineTime();
        Notify(`This save is ${format(global.lastSave / 1000, { type: 'time', padding: false })} old${versionCheck !== player.version ? `\nSave file version is ${versionCheck}` : ''}`);
        stageUpdate();

        void simulateOffline(global.lastSave);
    } catch (error) {
        prepareVacuum(Boolean(player.inflation.vacuum)); //Fix vacuum state
        pauseGame(false);

        void Alert(`Incorrect save file format\n${error}`);
        throw error;
    }
};
const exportFileGame = () => {
    if ((player.stage.true >= 7 || player.strange[0].total > 0) && (player.challenges.active === null || global.challengesInfo[player.challenges.active].resetType === 'stage')) {
        awardExport();
        numbersUpdate();
    }

    const save = saveGame(globalSave.developerMode);
    if (save === null) { return; }
    const a = document.createElement('a');
    a.href = `data:text/plain,${save}`;
    a.download = replaceSaveFileSpecials();
    a.click();
};
const awardExport = () => {
    const exportReward = player.time.export;
    if (exportReward[0] <= 0) { return; }
    const { strange } = player;
    const conversion = Math.min(exportReward[0] / 86400_000, 1);
    const quarks = (exportReward[1] / 2.5 + 1) * conversion;

    strange[0].current += quarks;
    strange[0].total += quarks;
    exportReward[1] = Math.max(exportReward[1] - quarks, 0);
    if (player.strangeness[5][8] >= 1) {
        const strangelets = exportReward[2] / 2.5 * conversion;
        strange[1].current += strangelets;
        strange[1].total += strangelets;
        exportReward[2] -= strangelets;
        assignBuildingsProduction.strange1();
    }
    assignBuildingsProduction.strange0();
    exportReward[0] = 0;
};

const saveConsole = async() => {
    let value = await Prompt("Available options:\n'Copy' ‒ copy save file to clipboard\n'Delete' ‒ delete your save file\n'Clear' ‒ clear all domain data\n'Global' ‒ open options for global settings\n(Adding '_' will skip options menu)\nOr insert save file string here to load it");
    if (value === null || value === '') { return; }
    let lower = value.toLowerCase();
    if (lower === 'global') {
        value = await Prompt("Available options:\n'Reset' ‒ reset global settings\n'Copy' ‒ copy global settings to clipboard\nOr insert global settings string here to load it\n(this will overwrite current ones and require page reload)");
        if (value === null || value === '') { return; }
        lower = `global_${value.toLowerCase()}`;
    }

    if (lower === 'copy' || lower === 'global_copy') {
        const save = lower === 'global_copy' ? saveGlobalSettings(true) : saveGame(true);
        if (save !== null) {
            try {
                await navigator.clipboard.writeText(save);
            } catch (error) {
                console.warn(`Full error for being unable to write to clipboard:\n${error}`);
                if (await Confirm("Could not copy text into clipboard, press 'Confrim' to save it as file instead")) {
                    const a = document.createElement('a');
                    a.href = `data:text/plain,${save}`;
                    a.download = `${lower === 'global_copy' ? 'Settings' : 'Save'} clipboard`;
                    a.click();
                }
            }
        }
    } else if (lower === 'delete' || lower === 'clear' || lower === 'global_reset') {
        pauseGame();
        if (lower === 'delete') {
            localStorage.removeItem(specialHTML.localStorage.main);
        } else if (lower === 'global_reset') {
            localStorage.removeItem(specialHTML.localStorage.settings);
        } else { localStorage.clear(); }
        window.location.reload();
        void Alert('Awaiting game reload');
    } else if (value === 'devMode') {
        globalSave.developerMode = !globalSave.developerMode;
        Notify(`Developer mode is ${globalSave.developerMode ? 'now' : 'no longer'} active`);
        saveGlobalSettings();
    } else if (lower === 'achievement') {
        Notify('Unlocked a new Achievement! (If there were any)');
    } else if (lower === 'slow' || lower === 'free' || lower === 'boost') {
        Notify('Game speed was increased by 1x');
    } else if (lower === 'secret' || lower === 'global_secret' || lower === 'secret_secret') {
        Notify(`Found a ${lower === 'secret_secret' ? "ultra rare secret, but it doesn't proof anything" : `${lower === 'global_secret' ? 'global' : 'rare'} secret, don't share it with anybody`}`);
    } else if (lower === 'secret_proof') {
        Notify('Found a proof that you were looking for!');
    } else {
        if (value.length < 20) { return void Alert(`Input '${value}' doesn't match anything`); }
        if (lower.includes('global_')) {
            if (!await Confirm("Press 'Confirm' to load input as a new global settings, this will reload page\n(Input is too long to be displayed)")) { return; }
            localStorage.setItem(specialHTML.localStorage.settings, value[6] === '_' ? value.substring(7) : value);
            window.location.reload();
            void Alert('Awaiting game reload');
        } else {
            if (!await Confirm("Press 'Confirm' to load input as a save file\n(Input is too long to be displayed)")) { return; }
            loadGame(value);
        }
    }
};

const replaceSaveFileSpecials = (): string => {
    let realName = player.fileName;

    const date = new Date();
    const dateIndex = realName.indexOf('[date');
    if (dateIndex >= 0) {
        const endIndex = realName.indexOf(']', dateIndex + 5);
        if (endIndex >= 0) {
            let replaced = realName.substring(dateIndex + 5, endIndex);
            const special = [
                'Y',
                'M',
                'D'
            ];
            const replaceWith = [
                `${date.getFullYear()}`,
                `${date.getMonth() + 1}`.padStart(2, '0'),
                `${date.getDate()}`.padStart(2, '0')
            ];
            for (let i = 0; i < special.length; i++) {
                replaced = replaced.replace(special[i], replaceWith[i]);
            }
            realName = realName.replace(realName.substring(dateIndex, endIndex + 1), replaced);
        }
    }
    const timeIndex = realName.indexOf('[time');
    if (timeIndex >= 0) {
        const endIndex = realName.indexOf(']', timeIndex + 5);
        if (endIndex >= 0) {
            let replaced = realName.substring(timeIndex + 5, endIndex);
            const special = [
                'H',
                'M',
                'S'
            ];
            const replaceWith = [
                `${date.getHours()}`.padStart(2, '0'),
                `${date.getMinutes()}`.padStart(2, '0'),
                `${date.getSeconds()}`.padStart(2, '0')
            ];
            for (let i = 0; i < special.length; i++) {
                replaced = replaced.replace(special[i], replaceWith[i]);
            }
            realName = realName.replace(realName.substring(timeIndex, endIndex + 1), replaced);
        }
    }

    const special = [
        '[version]',
        '[stage]',
        '[strange]',
        '[cosmon]',
        '[vacuum]',
        '[galaxy]',
        '[universe]'
    ];
    const replaceWith = [
        player.version,
        global.stageInfo.word[player.stage.current],
        `${player.strange[0].total}`,
        `${player.cosmon.total}`,
        `${player.inflation.vacuum}`,
        `${player.buildings[5][3].current}`,
        `${player.buildings[6][1].current}`
    ];
    for (let i = 0; i < special.length; i++) {
        realName = realName.replace(special[i], replaceWith[i]);
    }
    return `${realName}.txt`;
};

/* Arguments are not done as '(...data: any) => any, ...data: any' because TS won't do type safety */
/** If onceInstanly is true, then it will instanly call function once and then try to repeat it after delay */
const repeatFunction = (repeat: () => any, onceInstanly = false) => {
    if (onceInstanly) { repeat(); }
    if (global.intervalsId.mouseRepeat !== undefined) { return; }
    global.intervalsId.mouseRepeat = setTimeout(() => {
        global.intervalsId.mouseRepeat = setInterval(repeat, 50);
    }, 200);
};
const cancelRepeat = () => {
    clearInterval(global.intervalsId.mouseRepeat);
    global.intervalsId.mouseRepeat = undefined;
};

const hoverUpgrades = (index: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements' | 'inflation') => {
    if (type === 'inflation') {
        global.lastInflation = index;
    } else {
        if (player.toggles.hover[0]) { buyUpgrades(index, player.stage.active, type); }
        if (type === 'elements') {
            global.lastElement = index;
        } else { global.lastUpgrade[player.stage.active] = [index, type]; }
    }
    getUpgradeDescription(index, type);
};
const hoverStrangeness = (index: number, stageIndex: number, type: 'strangeness' | 'milestones') => {
    if (type === 'strangeness') {
        global.lastStrangeness = [index, stageIndex];
    } else { global.lastMilestone = [index, stageIndex]; }
    getStrangenessDescription(index, stageIndex, type);
};
const hoverChallenge = (index: number) => {
    global.lastChallenge[0] = index;
    getChallengeDescription(index);
    if (index === 0) { getChallengeReward(global.lastChallenge[1]); }
    visualUpdate();
};
export const changeRewardType = (state = !global.sessionToggles[0]) => {
    global.sessionToggles[0] = state;
    getId('rewardsType').textContent = `${state ? 'Supervoid' : 'Void'} rewards:`;
};
/** Handles requirement to switch Stage, returns true if can safely return early */
const handleAutoSwitch = (index: number, type = 'researchesAuto'): boolean => {
    const stageIndex = player.stage.active;
    if (type === 'researchesAuto' && !checkUpgrade(index, stageIndex, type)) {
        const autoStage = global.researchesAutoInfo.autoStage[index][player.researchesAuto[index]];
        if (autoStage !== undefined && !(autoStage === stageIndex || (autoStage === 4 && stageIndex === 5))) { switchStage(autoStage, stageIndex); }
        return true;
    }
    return false;
};

export const buyAll = () => {
    const active = player.stage.active;
    for (let i = 1; i < specialHTML.longestBuilding; i++) {
        buyBuilding(i, active, 0);
    }
};

export const updateCollapsePointsText = () => {
    const array = [];
    const points = player.collapse.points;
    for (let i = 0; i < points.length; i++) {
        array.push(format(points[i], { type: 'input' }));
    }
    getId('collapsePoints').textContent = array.length > 0 ? `${array.join(', ')} or ` : '';
};

export const loadoutsVisual = (loadout: number[]) => {
    if (getId('loadoutsMain').dataset.open !== 'true') { return; }
    let string = '';
    for (let i = 0, dupes = 1; i < loadout.length; i += dupes, dupes = 1) {
        const current = loadout[i];
        while (loadout[i + dupes] === current) { dupes++; }
        if (i > 0) { string += ', '; }
        string += `${current + 1}`;
        if (dupes > 1) { string += `x${dupes}`; }
    }
    (getId('loadoutsEdit') as HTMLInputElement).value = string;
};
export const loadoutsRecreate = () => {
    const old = global.loadouts.buttons;
    for (const button in old) { //Just in case to prevent memory leak
        old[button].html.removeEventListener('click', old[button].event);
    }
    const newOld = {} as typeof old;
    const listHTML = getQuery('#loadoutsList > span');
    const load = player.inflation.loadouts;
    listHTML.textContent = '';
    for (const key in load) {
        const button = document.createElement('button');
        button.textContent = key;
        button.className = 'selectBtn redText';
        button.type = 'button';
        const event = () => {
            (getId('loadoutsName') as HTMLInputElement).value = key;
            global.loadouts.input = player.inflation.loadouts[key];
            loadoutsVisual(player.inflation.loadouts[key]);
        };
        newOld[key] = {
            html: button,
            event: event
        };
        listHTML.append(button, ', ');
        button.addEventListener('click', event);
    }
    global.loadouts.buttons = newOld;
};

export const globalSaveStart = deepClone(globalSave);
try { //Start everything
    preventImageUnload();
    const body = document.body;

    const globalSettings = localStorage.getItem(specialHTML.localStorage.settings);
    if (globalSettings !== null) {
        try {
            Object.assign(globalSave, JSON.parse(atob(globalSettings)));
            const decoder = new TextDecoder();
            for (const key in globalSave.hotkeys) { //Restore decoded data
                const array = globalSave.hotkeys[key as hotkeysList] as string[];
                for (let i = 0; i < array.length; i++) {
                    array[i] = decoder.decode(Uint8Array.from(array[i], (c) => c.codePointAt(0) as number));
                }
            }
            if (!(globalSave.intervals.main >= 20)) { globalSave.intervals.main = 20; } //Fix NaN and undefined
            if (!(globalSave.intervals.offline >= 20)) { globalSave.intervals.offline = 20; } //Fix NaN and undefined
            for (let i = globalSave.toggles.length; i < globalSaveStart.toggles.length; i++) {
                globalSave.toggles[i] = false;
            }
            for (let i = globalSave.MDSettings.length; i < globalSaveStart.MDSettings.length; i++) {
                globalSave.MDSettings[i] = false;
            }
            for (let i = globalSave.SRSettings.length; i < globalSaveStart.SRSettings.length; i++) {
                globalSave.SRSettings[i] = false;
            }
            for (const key in globalSaveStart.hotkeys) {
                if (globalSave.hotkeys[key as hotkeysList] === undefined) {
                    globalSave.hotkeys[key as hotkeysList] = cloneArray(globalSaveStart.hotkeys[key as hotkeysList]);
                }
            }
        } catch (error) {
            Notify('Global settings failed to parse, default ones will be used instead');
            console.log(`(Full parse error) ${error}`);
        }
        (getId('decimalPoint') as HTMLInputElement).value = globalSave.format[0];
        (getId('thousandSeparator') as HTMLInputElement).value = globalSave.format[1];
        (getId('mainInterval') as HTMLInputElement).value = `${globalSave.intervals.main}`;
        (getId('offlineInterval') as HTMLInputElement).value = `${globalSave.intervals.offline}`;
        (getId('numbersInterval') as HTMLInputElement).value = `${globalSave.intervals.numbers}`;
        (getId('visualInterval') as HTMLInputElement).value = `${globalSave.intervals.visual}`;
        (getId('autoSaveInterval') as HTMLInputElement).value = `${globalSave.intervals.autoSave / 1000}`;
        for (let i = 0; i < globalSaveStart.toggles.length; i++) { toggleSpecial(i, 'global'); }
        if (globalSave.fontSize !== 16) { changeFontSize(true); } //Also sets breakpoints for screen size
        if (globalSave.toggles[3]) {
            getId('hideToggle').style.display = 'none';
            getId('currentSwitch').style.display = 'none';
            getQuery('#footer > div:first-child').style.display = 'none';
            getId('body').prepend(getId('footer'));
            getId('fakeFooter').after(getId('phoneHotkeys'));
            getId('footerMain').append(getId('subtabs'), getId('stageSelect'));
            specialHTML.styleSheet.textContent += `.insideTab { margin-top: 0.6rem; } #footer { position: unset; } #footerMain { padding: 0.6em; row-gap: 0.6em; }
            #footerMain button, #phoneHotkeys button { width: min-content; min-width: 4em; height: 2em; border-radius: 10px; font-size: 0.92em; } #footerMain > * { margin: 0 auto; gap: 0.4em; } #footerStats { gap: 0.6em; }
            #stageSelect { position: unset; justify-content: unset; pointer-events: unset; } #stageSelect > div { position: unset; justify-content: unset; flex-wrap: unset; gap: 0.4em; margin: 0 auto; max-width: unset; } #subtabs { flex-direction: row; }
            #phoneHotkeys { flex-direction: row-reverse; gap: 0.4em; justify-content: center; position: fixed; width: 100%; bottom: 0.6em; margin: 0; } #fakeFooter { height: 3.04em; }`;
        }
        if (globalSave.toggles[2]) { body.classList.remove('noTextSelection'); }
        if (globalSave.toggles[1]) {
            const elementsArea = getId('upgradeSubtabElements');
            elementsArea.id = 'ElementsTab';
            getId('upgradeTab').after(elementsArea);
            specialHTML.cache.idMap.delete('upgradeSubtabElements');

            const elementsButton = getId('upgradeSubtabBtnElements');
            elementsButton.id = 'ElementsTabBtn';
            elementsButton.classList.add('stage4Include');
            getId('upgradeTabBtn').after(elementsButton);
            specialHTML.cache.idMap.delete('upgradeSubtabBtnElements');

            const tabList = global.tabList;
            tabList.ElementsSubtabs = [];
            tabList.upgradeSubtabs.splice(tabList.upgradeSubtabs.indexOf('Elements'), 1);
            tabList.tabs.splice(tabList.tabs.indexOf('upgrade') + 1, 0, 'Elements');
        }

        if (globalSave.MDSettings[0]) {
            (document.getElementById('MDMessage1') as HTMLElement).remove();
            specialHTML.styleSheet.textContent += 'body.noTextSelection, img, input[type = "image"], button, #load, a, #notifications > p, #hideToggle { -webkit-user-select: none; -webkit-touch-callout: none; }'; //Safari junk to disable image hold menu and text selection
            specialHTML.styleSheet.textContent += '#themeArea > div > div { position: unset; display: flex; width: 15em; } #themeArea > div > button { display: none; }'; //More Safari junk to make windows work without focus
            (getId('file') as HTMLInputElement).accept = ''; //Accept for unknown reason not properly supported on phones

            const arrowStage = document.createElement('button');
            arrowStage.innerHTML = '<div class="downArrow"></div>';
            arrowStage.type = 'button';
            const arrowReset1 = document.createElement('button');
            arrowReset1.innerHTML = '<div class="downArrow"></div>';
            arrowReset1.type = 'button';
            getId('resetStage').append(arrowStage);
            arrowStage.addEventListener('click', () => getId('resetStage').classList.toggle('open'));
            arrowStage.addEventListener('blur', () => getId('resetStage').classList.remove('open'));
            getId('reset1Main').append(arrowReset1);
            arrowReset1.addEventListener('click', () => getId('reset1Main').classList.toggle('open'));
            arrowReset1.addEventListener('blur', () => getId('reset1Main').classList.remove('open'));
            specialHTML.styleSheet.textContent += '#resets { row-gap: 1em; } #resets > section { position: relative; flex-direction: row; justify-content: center; width: unset; padding: unset; row-gap: unset; background-color: unset; border: unset; } #resets > section:not(.open) > p { display: none !important; }';
            specialHTML.styleSheet.textContent += '#resets > section > button:last-of-type { width: 2.2em !important; margin-left: -2px; } #resets .downArrow { width: 1.24em; height: 1.24em; margin: auto; } #resets p { position: absolute; width: 17.4em; padding: 0.5em 0.6em 0.6em; background-color: var(--window-color); border: 2px solid var(--window-border); top: calc(100% - 2px); z-index: 1; box-sizing: content-box; }';

            const structuresButton = document.createElement('button');
            structuresButton.textContent = 'Structures';
            structuresButton.id = 'structuresFooter';
            structuresButton.type = 'button';
            const stageButton = document.createElement('button');
            stageButton.textContent = 'Stage';
            stageButton.id = 'stageFooter';
            stageButton.type = 'button';
            const reset1Button = document.createElement('button');
            reset1Button.id = 'reset1Footer';
            reset1Button.type = 'button';
            const resetCollapse = document.createElement('button');
            resetCollapse.textContent = 'Collapse';
            resetCollapse.id = 'resetCollapseFooter';
            resetCollapse.type = 'button';
            resetCollapse.className = 'stage5Only';
            const resetGalaxy = document.createElement('button');
            resetGalaxy.textContent = 'Galaxy';
            resetGalaxy.id = 'resetGalaxyFooter';
            resetGalaxy.type = 'button';
            resetGalaxy.className = 'stage4Only';
            getId('phoneHotkeys').prepend(resetGalaxy, reset1Button, resetCollapse, stageButton, structuresButton);

            const createUpgButton = document.createElement('button');
            createUpgButton.className = 'hollowButton';
            createUpgButton.textContent = 'Create';
            createUpgButton.id = 'upgradeCreate';
            createUpgButton.type = 'button';
            getId('toggleHover0').after(createUpgButton);

            const createInfButton = document.createElement('button');
            createInfButton.className = 'hollowButton';
            createInfButton.textContent = 'Activate';
            createInfButton.id = 'inflationActivate';
            createInfButton.type = 'button';
            getId('inflationRefund').before(createInfButton);

            const pages = document.createElement('div');
            pages.id = 'strangenessPages';
            pages.innerHTML = '<button type="button" id="strangenessPage1" class="stage1borderImage hollowButton">1</button><button type="button" id="strangenessPage2" class="stage2borderImage hollowButton">2</button><button type="button" id="strangenessPage3" class="stage3borderImage hollowButton">3</button><button type="button" id="strangenessPage4" class="stage4borderImage hollowButton">4</button><button type="button" id="strangenessPage5" class="stage5borderImage hollowButton">5</button><button type="button" id="strangenessCreate" class="hollowButton">Create</button>';
            specialHTML.styleSheet.textContent += '#strangenessPages { display: flex; justify-content: center; column-gap: 0.3em; } #strangenessPages button { width: 2.08em; height: calc(2.08em - 2px); border-top: none; border-radius: 0 0 4px 4px; } #strangenessCreate { width: unset !important; padding: 0 0.4em; }';
            getId('strangenessResearch').append(pages);

            const mainLi = getId('MDLi');
            const MDToggle1 = document.createElement('li');
            MDToggle1.innerHTML = '<label>Keep mouse events<button type="button" id="MDToggle1" class="specialToggle">OFF</button></label>';
            mainLi.after(MDToggle1);
            const refreshButton = document.createElement('button');
            refreshButton.className = 'hollowButton';
            refreshButton.textContent = 'Reload';
            refreshButton.type = 'button';
            mainLi.append(refreshButton);
            refreshButton.addEventListener('click', async() => {
                if (await Confirm('Reload page?\n(Game will not autosave)')) { window.location.reload(); }
            });

            getId('MDToggle1').addEventListener('click', () => toggleSpecial(1, 'mobile', true, true));
            for (let i = 0; i < globalSaveStart.MDSettings.length; i++) { toggleSpecial(i, 'mobile'); }
            MDStrangenessPage(1);
        }
        if (globalSave.SRSettings[0]) {
            const message = getId('SRMessage1');
            message.textContent = 'Screen reader support is enabled, disable it if its not required';
            message.className = 'greenText';
            message.ariaHidden = 'true';
            getId('inflationLoadouts').ariaExpanded = 'false';
            for (let i = 0; i <= 3; i++) {
                const effectID = getQuery(`#${i === 0 ? 'solarMass' : `star${i}`}Effect > span.info`);
                effectID.textContent = ` (${effectID.textContent})`;
                effectID.classList.remove('greenText');
            }
            for (let i = 1; i <= 1; i++) {
                const effectID = getQuery(`#merge${i}Effect > span.info`);
                effectID.textContent = ` (${effectID.textContent})`;
                effectID.classList.remove('greenText');
            }
            specialHTML.styleSheet.textContent += '#starEffects > p > span, #mergeEffects > p > span { display: unset !important; }';

            const SRMainDiv = document.createElement('article');
            SRMainDiv.innerHTML = '<h5>Information for Screen reader</h5><p id="SRTab" aria-live="polite"></p><p id="SRStage" aria-live="polite"></p><p id="SRMain" aria-live="assertive"></p>';
            SRMainDiv.className = 'reader';
            getId('fakeFooter').before(SRMainDiv);

            const SRToggle1 = document.createElement('li');
            SRToggle1.innerHTML = '<label>Keep tab index on created Upgrades<button type="button" id="SRToggle1" class="specialToggle">OFF</button></label>';
            const SRToggle2 = document.createElement('li');
            SRToggle2.innerHTML = '<label>Keep tab index on primary buttons<button type="button" id="SRToggle2" class="specialToggle">OFF</button></label>';
            getId('SRLi').after(SRToggle1, SRToggle2);

            getId('SRToggle1').addEventListener('click', () => {
                toggleSpecial(1, 'reader', true);
                const active = player.stage.active;
                for (let i = 0; i < global.upgradesInfo[active].maxActive; i++) { visualUpdateUpgrades(i, active, 'upgrades'); }
                for (let i = 0; i < global.researchesInfo[active].maxActive; i++) { visualUpdateResearches(i, active, 'researches'); }
                for (let i = 0; i < global.researchesExtraInfo[active].maxActive; i++) { visualUpdateResearches(i, active, 'researchesExtra'); }
                for (let i = 0; i < playerStart.researchesAuto.length; i++) { visualUpdateResearches(i, 0, 'researchesAuto'); }
                visualUpdateResearches(0, active, 'ASR');
                for (let i = 0; i < playerStart.elements.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
                for (let s = 1; s < playerStart.strangeness.length; s++) {
                    for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) {
                        visualUpdateResearches(i, s, 'strangeness');
                    }
                }
                for (let i = 0; i < playerStart.inflation.tree.length; i++) {
                    visualUpdateResearches(i, 0, 'inflations');
                }
            });

            const primaryIndex = (reload = false) => {
                if (!reload) { toggleSpecial(2, 'reader', true); }
                const newTab = globalSave.SRSettings[2] ? 0 : -1;
                getId('stageReset').tabIndex = newTab;
                getId('reset1Button').tabIndex = newTab;
                for (let i = 1; i < specialHTML.longestBuilding; i++) {
                    getId(`building${i}Btn`).tabIndex = newTab;
                    getId(`toggleBuilding${i}`).tabIndex = newTab;
                }
                getId('toggleBuilding0').tabIndex = newTab;
                for (const tabText of global.tabList.tabs) {
                    getId(`${tabText}TabBtn`).tabIndex = newTab;
                    for (const subtabText of global.tabList[`${tabText}Subtabs`]) {
                        getId(`${tabText}SubtabBtn${subtabText}`).tabIndex = newTab;
                    }
                }
                for (let i = 1; i < global.stageInfo.word.length; i++) {
                    getId(`stageSwitch${i}`).tabIndex = newTab;
                }
            };
            getId('SRToggle2').addEventListener('click', () => { primaryIndex(); });

            if (globalSave.SRSettings[2]) { primaryIndex(true); }
            for (let i = 0; i < globalSaveStart.SRSettings.length; i++) { toggleSpecial(i, 'reader'); }
        } else {
            const index = globalSave.toggles[0] ? 0 : 1;
            const list = [globalSave.hotkeys.tabLeft[index], globalSave.hotkeys.tabRight[index], globalSave.hotkeys.subtabDown[index], globalSave.hotkeys.subtabUp[index]];
            for (let i = 0; i < list.length; i++) {
                if (list[i] == null || list[i] === '') { list[i] = 'None'; }
            }
            getQuery('#SRMessage1 span').textContent = `${list[0]} and ${list[1]}`;
            getQuery('#SRMessage1 span:last-of-type').textContent = `${list[2]} and ${list[3]}`;
        }
    }

    let oldVersion = player.version;
    const save = localStorage.getItem(specialHTML.localStorage.main);
    if (save !== null) {
        oldVersion = updatePlayer(JSON.parse(atob(save)));
    } else {
        prepareVacuum(false); //Set buildings values
        updatePlayer(deepClone(playerStart));
    }

    /* Global */
    assignHotkeys();
    const MD = globalSave.MDSettings[0];
    const SR = globalSave.SRSettings[0];
    const PC = !MD || globalSave.MDSettings[1];
    const releaseHotkey = (event: KeyboardEvent | MouseEvent) => {
        if (global.hotkeys.shift && !event.shiftKey) { global.hotkeys.shift = false; }
        if (global.hotkeys.ctrl && !event.ctrlKey) { global.hotkeys.ctrl = false; }
        global.hotkeys.tab = false;
    };
    body.addEventListener('contextmenu', (event) => {
        const activeType = (document.activeElement as HTMLInputElement)?.type;
        if (activeType !== 'text' && activeType !== 'number' && !globalSave.developerMode) { event.preventDefault(); }
    });
    body.addEventListener('keydown', (key) => detectHotkey(key));
    body.addEventListener('keyup', releaseHotkey);
    if (PC) {
        body.addEventListener('mouseup', (event) => {
            cancelRepeat();
            releaseHotkey(event);
        });
        body.addEventListener('mouseleave', cancelRepeat);
    }
    if (MD) {
        body.addEventListener('touchstart', (event) => {
            specialHTML.mobileDevice.start = [event.touches[0].clientX, event.touches[0].clientY];
        }, { passive: true }); //Passive just in case to prevent issues with scrolling
        body.addEventListener('touchend', (event) => {
            cancelRepeat();
            handleTouchHotkeys(event);
        });
        body.addEventListener('touchcancel', cancelRepeat);
    }

    /* Toggles */
    for (let i = 0; i < globalSaveStart.toggles.length; i++) {
        getId(`globalToggle${i}`).addEventListener('click', () => {
            toggleSpecial(i, 'global', true, i === 1 || i === 3);
            if (i === 0) {
                assignHotkeys();
                const index = globalSave.toggles[0] ? 0 : 1;
                for (const key in globalSaveStart.hotkeys) {
                    const hotkeyTest = globalSave.hotkeys[key as hotkeysList][index];
                    getQuery(`#${key}Hotkey > button`).textContent = hotkeyTest == null || hotkeyTest === '' ? 'None' : hotkeyTest;
                }
            } else if (i === 2) {
                body.classList[globalSave.toggles[2] ? 'remove' : 'add']('noTextSelection');
            }
        });
    }
    for (let i = 0; i < playerStart.toggles.normal.length; i++) {
        getId(`toggleNormal${i}`).addEventListener('click', () => toggleSwap(i, 'normal', true));
    }
    for (let i = 0; i < playerStart.toggles.confirm.length; i++) {
        getId(`toggleConfirm${i}`).addEventListener('click', () => toggleConfirm(i, true));
    }
    for (let i = 0; i < specialHTML.longestBuilding; i++) {
        getId(`toggleBuilding${i}`).addEventListener('click', () => toggleSwap(i, 'buildings', true));
    }
    for (let i = 0; i < playerStart.toggles.hover.length; i++) {
        getId(`toggleHover${i}`).addEventListener('click', () => toggleSwap(i, 'hover', true));
    }
    for (let i = 0; i < playerStart.toggles.max.length; i++) {
        getId(`toggleMax${i}`).addEventListener('click', () => toggleSwap(i, 'max', true));
    }
    for (let i = 0; i < playerStart.toggles.auto.length; i++) {
        getId(`toggleAuto${i}`).addEventListener('click', () => {
            toggleSwap(i, 'auto', true);
            if (i === 5) {
                for (let s = 1; s <= 6; s++) { autoUpgradesSet(s); }
            } else if (i === 6) {
                for (let s = 1; s <= 6; s++) { autoResearchesSet('researches', s); }
            } else if (i === 7) {
                for (let s = 1; s <= 6; s++) { autoResearchesSet('researchesExtra', s); }
            } else if (i === 8) {
                autoElementsSet();
            }
        });
    }

    /* Stage tab */
    {
        const clickHoldFunc = () => {
            if (player.inflation.vacuum || player.stage.active >= 4) { return; }
            void stageResetUser();
        };
        const stageButton = getId('stageReset');
        stageButton.addEventListener('click', stageResetUser);
        if (PC) { stageButton.addEventListener('mousedown', () => repeatFunction(clickHoldFunc)); }
        if (MD) {
            stageButton.addEventListener('touchstart', () => repeatFunction(clickHoldFunc));
            const footerButton = getId('stageFooter');
            footerButton.addEventListener('click', stageResetUser);
            footerButton.addEventListener('touchstart', () => repeatFunction(clickHoldFunc));
            if (PC) { footerButton.addEventListener('mousedown', () => repeatFunction(clickHoldFunc)); }
        }
    }
    {
        const clickFunc = () => {
            const active = player.stage.active;
            if (active === 1) {
                void dischargeResetUser();
            } else if (active === 2) {
                void vaporizationResetUser();
            } else if (active === 3) {
                void rankResetUser();
            } else if (active === 4) {
                void collapseResetUser();
            } else if (active === 5) {
                void mergeResetUser();
            }
        };
        const clickHoldFunc = () => {
            if (player.stage.active !== 1 && player.stage.active !== 3) { return; }
            clickFunc();
        };
        const resetButton = getId('reset1Button');
        resetButton.addEventListener('click', clickFunc);
        if (PC) { resetButton.addEventListener('mousedown', () => repeatFunction(clickHoldFunc)); }
        if (MD) {
            resetButton.addEventListener('touchstart', () => repeatFunction(clickHoldFunc));
            const footerButton = getId('reset1Footer');
            footerButton.addEventListener('click', clickFunc);
            footerButton.addEventListener('touchstart', () => repeatFunction(clickHoldFunc));
            if (PC) { footerButton.addEventListener('mousedown', () => repeatFunction(clickHoldFunc)); }
            getId('resetCollapseFooter').addEventListener('click', collapseResetUser);

            const clickGalaxy = () => buyBuilding(3, 5);
            const galaxyButton = getId('resetGalaxyFooter');
            galaxyButton.addEventListener('click', clickGalaxy);
            galaxyButton.addEventListener('touchstart', () => repeatFunction(clickGalaxy));
            if (PC) { galaxyButton.addEventListener('mousedown', () => repeatFunction(clickGalaxy)); }
        }
    }
    const getMakeCount = () => global.hotkeys.shift ? (global.hotkeys.ctrl ? 100 : 1) : global.hotkeys.ctrl ? 10 : undefined;
    for (let i = 1; i < specialHTML.longestBuilding; i++) {
        const button = getId(`building${i}Btn`);
        const clickFunc = () => buyBuilding(i, player.stage.active, getMakeCount());
        button.addEventListener('click', clickFunc);
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(clickFunc)); }
        if (MD) { button.addEventListener('touchstart', () => repeatFunction(clickFunc)); }
    }
    {
        const button = getId('makeAllStructures');
        button.addEventListener('click', buyAll);
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(buyAll)); }
        if (MD) {
            button.addEventListener('touchstart', () => repeatFunction(buyAll));
            const footer = getId('structuresFooter');
            footer.addEventListener('click', buyAll);
            footer.addEventListener('touchstart', () => repeatFunction(buyAll));
            if (PC) { footer.addEventListener('mousedown', () => repeatFunction(buyAll)); }
        }
    }
    getId('buyAnyInput').addEventListener('change', () => {
        const input = getId('buyAnyInput') as HTMLInputElement;
        player.toggles.shop.input = Math.max(Math.trunc(Number(input.value)), 0);
        input.value = format(player.toggles.shop.input, { type: 'input' });
        numbersUpdate();
    });
    getId('autoWaitInput').addEventListener('change', () => {
        if (global.offline.active) { return; }
        const input = getId('autoWaitInput') as HTMLInputElement;
        let value = Math.max(Number(input.value), 1);
        if (isNaN(value)) { value = 2; }
        player.toggles.shop.wait[player.stage.active] = value;
        input.value = format(value, { type: 'input' });
    });

    for (let i = 0; i < global.challengesInfo.length; i++) {
        const image = getId(`challenge${i + 1}`);
        if (!MD) { image.addEventListener('mouseover', () => hoverChallenge(i)); }
        image.addEventListener('click', () => { global.lastChallenge[0] === i ? enterExitChallengeUser(i) : hoverChallenge(i); });
    }
    getId('challengeName').addEventListener('click', () => { toggleSupervoid(true); });
    getId('rewardsType').addEventListener('click', () => {
        changeRewardType();
        getChallengeReward(global.lastChallenge[1]);
    });
    for (let s = 1; s <= 5; s++) {
        const image = getId(`voidReward${s}`);
        const clickFunc = () => {
            global.lastChallenge[1] = s;
            getChallengeReward(s);
        };
        image.addEventListener('mouseover', clickFunc);
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                clickFunc();
            });
        }
    }

    /* Upgrade tab */
    for (let i = 0; i < specialHTML.longestUpgrade; i++) {
        const image = getId(`upgrade${i + 1}`);
        const hoverFunc = () => hoverUpgrades(i, 'upgrades');
        if (PC) { image.addEventListener('mouseover', hoverFunc); }
        if (MD) {
            image.addEventListener('touchstart', () => repeatFunction(hoverFunc, true));
        } else {
            const clickFunc = () => buyUpgrades(i, player.stage.active, 'upgrades');
            image.addEventListener('click', clickFunc);
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    }
    for (let i = 0; i < specialHTML.longestResearch; i++) {
        const image = getId(`research${i + 1}Image`);
        const hoverFunc = () => hoverUpgrades(i, 'researches');
        if (PC) { image.addEventListener('mouseover', hoverFunc); }
        if (MD) {
            image.addEventListener('touchstart', () => repeatFunction(hoverFunc, true));
        } else {
            const clickFunc = () => buyUpgrades(i, player.stage.active, 'researches');
            image.addEventListener('click', clickFunc);
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    }
    for (let i = 0; i < specialHTML.longestResearchExtra; i++) {
        const image = getId(`researchExtra${i + 1}Image`);
        const hoverFunc = () => hoverUpgrades(i, 'researchesExtra');
        if (PC) { image.addEventListener('mouseover', hoverFunc); }
        if (MD) {
            image.addEventListener('touchstart', () => repeatFunction(hoverFunc, true));
        } else {
            const clickFunc = () => buyUpgrades(i, player.stage.active, 'researchesExtra');
            image.addEventListener('click', clickFunc);
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    }
    for (let i = 0; i < playerStart.researchesAuto.length; i++) {
        const image = getId(`researchAuto${i + 1}Image`);
        const hoverFunc = () => hoverUpgrades(i, 'researchesAuto');
        if (PC) { image.addEventListener('mouseover', hoverFunc); }
        if (MD) {
            image.addEventListener('touchstart', () => repeatFunction(hoverFunc, true));
        } else {
            const clickFunc = () => buyUpgrades(i, player.stage.active, 'researchesAuto');
            image.addEventListener('click', () => {
                if (handleAutoSwitch(i)) { return; }
                clickFunc();
            });
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    }
    {
        const image = getId('ASRImage');
        const hoverFunc = () => hoverUpgrades(0, 'ASR');
        if (PC) { image.addEventListener('mouseover', hoverFunc); }
        if (MD) {
            image.addEventListener('touchstart', () => repeatFunction(hoverFunc, true));
        } else {
            const clickFunc = () => buyUpgrades(0, player.stage.active, 'ASR');
            image.addEventListener('click', clickFunc);
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    }
    if (MD) {
        const button = getId('upgradeCreate');
        const clickFunc = () => {
            const active = player.stage.active;
            const last = global.lastUpgrade[active];
            if (last[0] !== null) {
                if (handleAutoSwitch(last[0], last[1])) { return; }
                buyUpgrades(last[0], active, last[1]);
            }
        };
        button.addEventListener('click', clickFunc);
        button.addEventListener('touchstart', () => repeatFunction(clickFunc));
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(clickFunc)); }
    }

    {
        const button = getId('element0');
        const dblclickFunc = () => {
            global.lastElement = 0;
            getUpgradeDescription(0, 'elements');
        };
        if (SR) {
            getId('element1').addEventListener('keydown', (event) => {
                if (event.code !== 'Tab' || !event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) { return; }
                const element = getId('element0');
                element.tabIndex = 0;
                element.ariaHidden = 'false';
            });
            button.addEventListener('keydown', (event) => {
                if (event.code === 'Enter' && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { dblclickFunc(); }
            });
            button.addEventListener('blur', () => {
                const element = getId('element0');
                element.tabIndex = -1;
                element.ariaHidden = 'true';
            });
        }
        if (PC) { button.addEventListener('dblclick', dblclickFunc); }
        if (MD) {
            button.addEventListener('touchstart', () => {
                if (global.intervalsId.mouseRepeat !== undefined) { return; }
                global.intervalsId.mouseRepeat = setTimeout(dblclickFunc, 3000);
            });
        }
    }
    for (let i = 1; i < playerStart.elements.length; i++) {
        const image = getId(`element${i}`);
        const clickFunc = () => buyUpgrades(i, 4, 'elements');
        const hoverFunc = () => hoverUpgrades(i, 'elements');
        if (PC) {
            image.addEventListener('mouseover', hoverFunc);
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (MD) {
            image.addEventListener('touchstart', () => {
                hoverFunc();
                repeatFunction(clickFunc);
            });
        }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
        if (!MD || SR) { image.addEventListener('click', clickFunc); }
    }

    /* Strangeness tab */
    for (let i = 0; i < 2; i++) {
        const strange = getId(`strange${i}`);
        const openFunction = () => {
            if (i === 0 && player.stage.true < 6 && player.milestones[4][0] < 8) { return; }
            const html = getId(`strange${i}EffectsMain`);
            html.dataset.open = 'true';
            html.style.display = '';
            numbersUpdate();
        };
        const closeFunc = () => {
            const html = getId(`strange${i}EffectsMain`);
            html.dataset.open = 'false';
            html.style.display = 'none';
        };
        strange.addEventListener('click', openFunction, { capture: true }); //Clicking on window does unnessary call, before closing
        if (PC || SR) {
            strange.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                openFunction();
            });
        }
        strange.addEventListener('blur', closeFunc);
        getId(`strange${i}EffectsMain`).addEventListener('click', closeFunc);
    }
    for (let s = 1; s < playerStart.strangeness.length; s++) {
        if (MD) { getId(`strangenessPage${s}`).addEventListener('click', () => MDStrangenessPage(s)); }
        for (let i = 0; i < playerStart.strangeness[s].length; i++) {
            const image = getId(`strange${i + 1}Stage${s}Image`);
            const hoverFunc = () => hoverStrangeness(i, s, 'strangeness');
            if (PC) { image.addEventListener('mouseover', hoverFunc); }
            if (MD) {
                image.addEventListener('touchstart', () => { /*repeatFunction(*/hoverFunc(); /*, true);*/ });
            } else {
                const clickFunc = () => buyStrangeness(i, s, 'strangeness');
                image.addEventListener('click', clickFunc);
                image.addEventListener('mousedown', () => repeatFunction(clickFunc));
            }
            if (PC || SR) {
                image.addEventListener('focus', () => {
                    if (!global.hotkeys.tab) { return; }
                    hoverFunc();
                });
            }
        }
    }
    if (MD) {
        const button = getId('strangenessCreate');
        const clickFunc = () => {
            const last = global.lastStrangeness;
            if (last[0] !== null) { buyStrangeness(last[0], last[1], 'strangeness'); }
        };
        button.addEventListener('click', clickFunc);
        button.addEventListener('touchstart', () => repeatFunction(clickFunc));
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(clickFunc)); }
    }
    getId('strangenessVisibility').addEventListener('click', () => {
        global.sessionToggles[1] = !global.sessionToggles[1];
        getId('strangenessVisibility').textContent = `Permanent ones are ${global.sessionToggles[1] ? 'shown' : 'hidden'}`;
        visualUpdate();
    });

    for (let s = 1; s < playerStart.milestones.length; s++) {
        for (let i = 0; i < playerStart.milestones[s].length; i++) {
            const image = getQuery(`#milestone${i + 1}Stage${s}Div > img`);
            const hoverFunc = () => hoverStrangeness(i, s, 'milestones');
            if (PC) { image.addEventListener('mouseover', hoverFunc); }
            if (MD) { image.addEventListener('touchstart', hoverFunc); }
            if (PC || SR) {
                image.addEventListener('focus', () => {
                    if (!global.hotkeys.tab) { return; }
                    hoverFunc();
                });
            }
        }
    }

    /* Inflation tab */
    for (let i = 0; i < playerStart.inflation.tree.length; i++) {
        const image = getId(`inflation${i + 1}Image`);
        const hoverFunc = () => hoverUpgrades(i, 'inflation');
        if (PC) { image.addEventListener('mouseover', hoverFunc); }
        if (MD) {
            image.addEventListener('touchstart', () => { /*repeatFunction(*/hoverFunc(); /*, true);*/ });
        } else {
            const clickFunc = () => buyStrangeness(i, 0, 'inflations');
            image.addEventListener('click', clickFunc);
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    }
    getId('inflationRefund').addEventListener('click', () => void inflationRefund());
    getId('inflationLoadouts').addEventListener('click', () => {
        const windowHTML = getId('loadoutsMain');
        const status = windowHTML.dataset.open !== 'true';
        if (status) {
            windowHTML.style.display = '';
            windowHTML.dataset.open = 'true';
            loadoutsVisual(global.loadouts.input);
        } else {
            windowHTML.style.display = 'none';
            windowHTML.dataset.open = 'false';
        }
        if (globalSave.SRSettings[0]) { getId('inflationLoadouts').ariaExpanded = `${status}`; }
    });
    getId('loadoutsEdit').addEventListener('change', () => {
        const first = (getId('loadoutsEdit') as HTMLInputElement).value.split(',');
        const final = [];
        for (let i = 0; i < first.length; i++) {
            const index = first[i].indexOf('x');
            let repeat = 1;
            if (index >= 0) {
                repeat = Number(first[i].slice(index + 1));
                first[i] = first[i].slice(0, index);
            }
            const number = Math.trunc(Number(first[i]) - 1);
            if (isNaN(number) || number < 0) { continue; }
            if (isNaN(repeat)) { repeat = 1; }
            if (repeat > 8) { repeat = 8; }
            for (let r = 0; r < repeat; r++) { final.push(number); }
        }
        global.loadouts.input = final;
        loadoutsVisual(final);
    });
    getId('loadoutsLoadAuto').addEventListener('click', () => {
        (getId('loadoutsName') as HTMLInputElement).value = 'Auto-generate';
        loadoutsLoadAuto();
    });
    getId('loadoutsSave').addEventListener('click', () => {
        const name = (getId('loadoutsName') as HTMLInputElement).value;
        const check = Number(name); //Lazy check for all types of only having spacebars
        if ((!isNaN(check) && `${check}` !== name) || name === 'Auto-generate') { return Notify(`Loadout name: '${name}' is not allowed`); }
        player.inflation.loadouts[name] = global.loadouts.input;
        loadoutsRecreate();
    });
    getId('loadoutsLoad').addEventListener('click', async() => {
        if (!await inflationRefund(true)) { return; }
        const loadout = global.loadouts.input;
        for (let i = 0; i < loadout.length; i++) {
            buyStrangeness(loadout[i], 0, 'inflations', true);
        }
        if ((getId('loadoutsName') as HTMLInputElement).value === 'Auto-generate') { loadoutsLoadAuto(); }
        numbersUpdate();
    });
    getId('loadoutsDelete').addEventListener('click', () => {
        const name = (getId('loadoutsName') as HTMLInputElement).value;
        if (player.inflation.loadouts[name] === undefined) { return; }
        delete player.inflation.loadouts[name];
        loadoutsRecreate();
    });
    if (MD) {
        const button = getId('inflationActivate');
        const clickFunc = () => {
            if (global.lastInflation !== null) { buyStrangeness(global.lastInflation, 0, 'inflations'); }
        };
        button.addEventListener('click', clickFunc);
        button.addEventListener('touchstart', () => repeatFunction(clickFunc));
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(clickFunc)); }
    }

    /* Settings tab */
    getId('vaporizationInput').addEventListener('change', () => {
        if (global.offline.active) { return; }
        const input = getId('vaporizationInput') as HTMLInputElement;
        player.vaporization.input[0] = Math.max(Number(input.value), 0);
        input.value = format(player.vaporization.input[0], { type: 'input' });
    });
    getId('vaporizationInputMax').addEventListener('change', () => {
        if (global.offline.active) { return; }
        const input = getId('vaporizationInputMax') as HTMLInputElement;
        player.vaporization.input[1] = Math.max(Number(input.value), 0);
        input.value = format(player.vaporization.input[1], { type: 'input' });
    });
    getId('collapseInput').addEventListener('change', () => {
        if (global.offline.active) { return; }
        const input = getId('collapseInput') as HTMLInputElement;
        player.collapse.input[0] = Math.max(Number(input.value), 1);
        input.value = format(player.collapse.input[0], { type: 'input' });
    });
    getId('collapseInputWait').addEventListener('change', () => {
        if (global.offline.active) { return; }
        const input = getId('collapseInputWait') as HTMLInputElement;
        player.collapse.input[1] = Number(input.value);
        input.value = format(player.collapse.input[1], { type: 'input' });
    });
    getId('collapseAddNewPoint').addEventListener('change', () => {
        if (global.offline.active) { return; }
        const input = getId('collapseAddNewPoint') as HTMLInputElement;
        const value = Number(input.value);
        const points = player.collapse.points;
        if (isFinite(value)) {
            if (value === 0) {
                points.length = 0;
            } else if (value > 0) {
                if (!points.includes(value)) {
                    points.push(value);
                    points.sort((a, b) => a - b);
                }
            } else {
                const index = points.indexOf(Math.abs(value));
                if (index >= 0) {
                    points.splice(index, 1);
                    points.sort((a, b) => a - b);
                }
            }
        }
        input.value = '';
        global.collapseInfo.pointsLoop = 0;
        updateCollapsePointsText();
    });
    getId('mergeInput').addEventListener('change', () => {
        if (global.offline.active) { return; }
        const input = getId('mergeInput') as HTMLInputElement;
        player.merge.input[0] = Math.max(Math.trunc(Number(input.value)), 0);
        input.value = format(player.merge.input[0], { type: 'input' });
    });
    getId('mergeInputSince').addEventListener('change', () => {
        if (global.offline.active) { return; }
        const input = getId('mergeInputSince') as HTMLInputElement;
        player.merge.input[1] = Number(input.value);
        input.value = format(player.merge.input[1], { type: 'input' });
    });
    getId('stageInput').addEventListener('change', () => {
        if (global.offline.active) { return; }
        const input = getId('stageInput') as HTMLInputElement;
        player.stage.input[0] = Math.max(Number(input.value), 0);
        input.value = format(player.stage.input[0], { type: 'input' });
    });
    getId('stageInputTime').addEventListener('change', () => {
        if (global.offline.active) { return; }
        const input = getId('stageInputTime') as HTMLInputElement;
        player.stage.input[1] = Math.max(Number(input.value), 0);
        input.value = format(player.stage.input[1], { type: 'input' });
    });
    getId('versionButton').addEventListener('click', getVersionInfoHTML);
    getId('hotkeysButton').addEventListener('click', getHotkeysHTML);
    getId('save').addEventListener('click', () => { saveGame(); });
    getId('file').addEventListener('change', async() => {
        const id = getId('file') as HTMLInputElement;
        try {
            loadGame(await (id.files as FileList)[0].text());
        } finally { id.value = ''; }
    });
    getId('export').addEventListener('click', exportFileGame);
    getId('saveConsole').addEventListener('click', saveConsole);
    getId('switchTheme0').addEventListener('click', () => setTheme(null));
    for (let i = 1; i < global.stageInfo.word.length; i++) {
        getId(`switchTheme${i}`).addEventListener('click', () => setTheme(i));
    }
    getId('saveFileNameInput').addEventListener('change', () => {
        const input = getId('saveFileNameInput') as HTMLInputElement;
        const testValue = input.value;
        if (testValue.length < 1) { return void (input.value = playerStart.fileName); }
        player.fileName = testValue;
    });
    {
        const button = getId('saveFileHoverButton');
        const hoverFunc = () => (getId('saveFileNamePreview').textContent = replaceSaveFileSpecials());
        button.addEventListener('mouseover', hoverFunc);
        if (PC || SR) {
            button.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    }
    getId('mainInterval').addEventListener('change', () => {
        const input = getId('mainInterval') as HTMLInputElement;
        globalSave.intervals.main = Math.min(Math.max(Math.trunc(Number(input.value)), 20), 200);
        input.value = `${globalSave.intervals.main}`;
        saveGlobalSettings();
        changeIntervals();
    });
    getId('offlineInterval').addEventListener('change', () => {
        const input = getId('offlineInterval') as HTMLInputElement;
        globalSave.intervals.offline = Math.min(Math.max(Math.trunc(Number(input.value)), 20), 6000);
        input.value = `${globalSave.intervals.offline}`;
        saveGlobalSettings();
    });
    getId('numbersInterval').addEventListener('change', () => {
        const input = getId('numbersInterval') as HTMLInputElement;
        globalSave.intervals.numbers = Math.min(Math.max(Math.trunc(Number(input.value)), 40), 200);
        input.value = `${globalSave.intervals.numbers}`;
        saveGlobalSettings();
        changeIntervals();
    });
    getId('visualInterval').addEventListener('change', () => {
        const input = getId('visualInterval') as HTMLInputElement;
        globalSave.intervals.visual = Math.min(Math.max(Math.trunc(Number(input.value)), 200), 2000);
        input.value = `${globalSave.intervals.visual}`;
        saveGlobalSettings();
        changeIntervals();
    });
    getId('autoSaveInterval').addEventListener('change', () => {
        const input = getId('autoSaveInterval') as HTMLInputElement;
        globalSave.intervals.autoSave = Math.min(Math.max(Math.trunc(Number(input.value)), 4), 1800) * 1000;
        input.value = `${globalSave.intervals.autoSave / 1000}`;
        saveGlobalSettings();
        changeIntervals();
    });
    getId('thousandSeparator').addEventListener('change', () => changeFormat(false));
    getId('decimalPoint').addEventListener('change', () => changeFormat(true));
    getId('MDToggle0').addEventListener('click', () => toggleSpecial(0, 'mobile', true, true));
    getId('SRToggle0').addEventListener('click', () => toggleSpecial(0, 'reader', true, true));
    getId('pauseButton').addEventListener('click', pauseGameUser);
    getId('reviewEvents').addEventListener('click', replayEvent);
    getId('customFontSize').addEventListener('change', () => changeFontSize());

    getId('stageHistorySave').addEventListener('change', () => {
        const inputID = getId('stageHistorySave') as HTMLInputElement;
        player.history.stage.input[0] = Math.min(Math.max(Math.trunc(Number(inputID.value)), 0), 100);
        inputID.value = `${player.history.stage.input[0]}`;
    });
    getId('stageHistoryShow').addEventListener('change', () => {
        const input = getId('stageHistoryShow') as HTMLInputElement;
        player.history.stage.input[1] = Math.min(Math.max(Math.trunc(Number(input.value)), 10), 100);
        input.value = `${player.history.stage.input[1]}`;
        global.debug.historyStage = null;
        visualUpdate();
    });
    getId('vacuumHistorySave').addEventListener('change', () => {
        const inputID = getId('vacuumHistorySave') as HTMLInputElement;
        player.history.vacuum.input[0] = Math.min(Math.max(Math.trunc(Number(inputID.value)), 0), 100);
        inputID.value = `${player.history.vacuum.input[0]}`;
    });
    getId('vacuumHistoryShow').addEventListener('change', () => {
        const input = getId('vacuumHistoryShow') as HTMLInputElement;
        player.history.vacuum.input[1] = Math.min(Math.max(Math.trunc(Number(input.value)), 10), 100);
        input.value = `${player.history.vacuum.input[1]}`;
        global.debug.historyVacuum = null;
        visualUpdate();
    });

    /* Footer */
    if (!globalSave.toggles[3]) {
        const toggle = getId('hideToggle');
        if (MD) {
            const timeoutFunc = () => {
                if (!global.footer) { return hideFooter(); }
                if (global.intervalsId.mouseRepeat !== undefined) { return; }
                global.intervalsId.mouseRepeat = setTimeout(hideFooter, 400);
            };
            toggle.addEventListener('touchstart', timeoutFunc);
            if (PC) { toggle.addEventListener('mousedown', timeoutFunc); }
        } else { toggle.addEventListener('click', hideFooter); }
    }
    for (const tabText of global.tabList.tabs) {
        getId(`${tabText}TabBtn`).addEventListener('click', () => switchTab(tabText));
        for (const subtabText of global.tabList[`${tabText}Subtabs`]) {
            getId(`${tabText}SubtabBtn${subtabText}`).addEventListener('click', () => switchTab(tabText, subtabText));
        }
    }
    for (let i = 1; i < global.stageInfo.word.length; i++) {
        getId(`stageSwitch${i}`).addEventListener('click', () => switchStage(i));
    }

    /* Post */
    document.head.append(specialHTML.styleSheet);
    stageUpdate();
    if (globalSave.theme !== null) {
        getId('currentTheme').textContent = global.stageInfo.word[globalSave.theme];
        getId(`switchTheme${globalSave.theme}`).style.textDecoration = 'underline';
        getId('switchTheme0').style.textDecoration = '';
        setTheme();
    }
    if (save !== null) {
        global.lastSave = handleOfflineTime();
        Notify(`Welcome back, you were away for ${format(global.lastSave / 1000, { type: 'time', padding: false })}${oldVersion !== player.version ? `\nGame has been updated from ${oldVersion} to ${player.version}` : ''}${globalSave.developerMode ?
            `\nGame loaded after ${format((Date.now() - playerStart.time.started) / 1000, { type: 'time', padding: false })}` : ''}
        `);
        void simulateOffline(global.lastSave);
    } else {
        pauseGame(false);
    }
    getId('body').style.display = '';
    getId('loading').style.display = 'none';
    document.title = `Fundamental ${playerStart.version}`;
} catch (error) {
    const stack = (error as { stack: string }).stack;
    void Alert(`Game failed to load\n${typeof stack === 'string' ? stack.replaceAll(`${window.location.origin}/`, '') : error}`, 2);
    const buttonDiv = document.createElement('div');
    buttonDiv.innerHTML = '<button type="button" id="exportError" style="width: 7em;">Export save</button><button type="button" id="deleteError" style="width: 7em;">Delete save</button>';
    buttonDiv.style.cssText = 'display: flex; column-gap: 0.6em; margin-top: 0.4em;';
    getId('loading').append(buttonDiv);
    let exported = false;
    getId('exportError').addEventListener('click', () => {
        exported = true;
        const save = localStorage.getItem(specialHTML.localStorage.main);
        if (save === null) { return void Alert('No save file detected'); }
        const a = document.createElement('a');
        a.href = `data:text/plain,${save}`;
        a.download = 'Fundamental post error export';
        a.click();
    });
    getId('deleteError').addEventListener('click', async() => {
        if (!exported && !await Confirm("Recommended to export save file first\nPress 'Confirm' to confirm and delete your save file")) { return; }
        localStorage.removeItem(specialHTML.localStorage.main);
        window.location.reload();
        void Alert('Awaiting game reload');
    });
    throw error;
}
