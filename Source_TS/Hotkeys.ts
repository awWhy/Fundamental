import { global, player } from './Player';
import { checkTab } from './Check';
import { numbersUpdate, switchTab, visualUpdate } from './Update';
import { buyBuilding, buyUpgrades, buyVerse, collapseResetUser, dischargeResetUser, endResetUser, enterExitChallengeUser, mergeResetUser, nucleationResetUser, rankResetUser, stageResetUser, switchStage, toggleChallengeType, vaporizationResetUser } from './Stage';
import { pauseGameUser, simulateOffline, toggleSwap } from './Main';
import { Notify, globalSave, specialHTML } from './Special';
import type { hotkeysList, numbersList } from './Types';

const hotkeys = {} as Record<string, hotkeysList | numbersList>;
const basicFunctions: Record<hotkeysList, () => void> = {
    makeAll: () => buyAll(),
    toggleAll: () => {
        if (global.hotkeys.last === 'toggleAll') { return; }
        global.hotkeys.last = 'toggleAll';
        toggleAll();
    },
    createAll: () => createAll(),
    toggleUpgrades: () => {
        if (global.hotkeys.last === 'toggleU') { return; }
        global.hotkeys.last = 'toggleU';
        let anyOn = false;
        for (let i = 5; i <= 8; i++) {
            if (player.toggles.auto[i]) {
                anyOn = true;
                break;
            }
        }
        for (let i = 5; i <= 8; i++) {
            player.toggles.auto[i] = !anyOn;
            toggleSwap(i, 'auto');
        }
    },
    discharge: () => void dischargeResetUser(),
    toggleDischarge: () => {
        if (global.hotkeys.last === 'toggle1') { return; }
        global.hotkeys.last = 'toggle1';
        toggleSwap(1, 'auto', true);
    },
    vaporization: () => {
        if (global.hotkeys.last === 'reset2') { return; }
        global.hotkeys.last = 'reset2';
        void vaporizationResetUser();
    },
    toggleVaporization: () => {
        if (global.hotkeys.last === 'toggle2') { return; }
        global.hotkeys.last = 'toggle2';
        toggleSwap(2, 'auto', true);
    },
    rank: () => void rankResetUser(),
    toggleRank: () => {
        if (global.hotkeys.last === 'toggle3') { return; }
        global.hotkeys.last = 'toggle3';
        toggleSwap(3, 'auto', true);
    },
    collapse: () => {
        if (global.hotkeys.last === 'reset4') { return; }
        global.hotkeys.last = 'reset4';
        void collapseResetUser();
    },
    toggleCollapse: () => {
        if (global.hotkeys.last === 'toggle4') { return; }
        global.hotkeys.last = 'toggle4';
        toggleSwap(4, 'auto', true);
    },
    galaxy: () => buyBuilding(3, 5),
    merge: () => {
        if (global.hotkeys.last === 'reset5') { return; }
        global.hotkeys.last = 'reset5';
        void mergeResetUser();
    },
    toggleMerge: () => {
        if (global.hotkeys.last === 'toggle9') { return; }
        global.hotkeys.last = 'toggle9';
        toggleSwap(9, 'auto', true);
    },
    nucleation: () => {
        if (global.hotkeys.last === 'reset6') { return; }
        global.hotkeys.last = 'reset6';
        void nucleationResetUser();
    },
    toggleNucleation: () => {
        if (global.hotkeys.last === 'toggle10') { return; }
        global.hotkeys.last = 'toggle10';
        toggleSwap(10, 'auto', true);
    },
    stage: () => {
        if (player.inflation.vacuum || player.stage.active >= 4) {
            if (global.hotkeys.last === 'reset0') { return; }
            global.hotkeys.last = 'reset0';
        }
        void stageResetUser();
    },
    toggleStage: () => {
        if (global.hotkeys.last === 'toggle0') { return; }
        global.hotkeys.last = 'toggle0';
        toggleSwap(0, 'auto', true);
    },
    verses: () => buyVerse(),
    end: () => void endResetUser(),
    exitChallenge: () => {
        if (global.hotkeys.last === 'exit') { return; }
        global.hotkeys.last = 'exit';
        enterExitChallengeUser(null);
    },
    supervoid: () => {
        if (global.hotkeys.last === 'super') { return; }
        global.hotkeys.last = 'super';
        if (toggleChallengeType(true)) { Notify(`Toggled into the ${global.challengesInfo[0].name}`); }
    },
    warp: () => offlineWarp(),
    pause: () => {
        if (global.hotkeys.last === 'pause') { return; }
        global.hotkeys.last = 'pause';
        pauseGameUser();
    },
    tabRight: () => {
        if (global.hotkeys.last === 'tabRight') { return; }
        global.hotkeys.last = 'tabRight';
        changeTab('right');
    },
    tabLeft: () => {
        if (global.hotkeys.last === 'tabLeft') { return; }
        global.hotkeys.last = 'tabLeft';
        changeTab('left');
    },
    subtabUp: () => {
        if (global.hotkeys.last === 'subtabUp') { return; }
        global.hotkeys.last = 'subtabUp';
        changeSubtab('up');
    },
    subtabDown: () => {
        if (global.hotkeys.last === 'subtabDown') { return; }
        global.hotkeys.last = 'subtabDown';
        changeSubtab('down');
    },
    stageRight: () => {
        if (global.hotkeys.last === 'stageRight') { return; }
        global.hotkeys.last = 'stageRight';
        changeStage('right');
    },
    stageLeft: () => {
        if (global.hotkeys.last === 'stageLeft') { return; }
        global.hotkeys.last = 'stageLeft';
        changeStage('left');
    }
};
const numberFunctions: Record<numbersList, (number: number) => void> = {
    makeStructure: (number) => {
        if (number !== 0) {
            buyBuilding(number, player.stage.active);
        } else { buyAll(); }
    },
    toggleStructure: (number) => {
        const repeat = `build${number}`;
        if (global.hotkeys.last === repeat) { return; }
        global.hotkeys.last = repeat;
        if (number === 0) {
            toggleAll();
        } else {
            toggleSwap(number, 'buildings', true);
        }
    },
    enterChallenge: (number) => {
        const repeat = `chal${number}`;
        if (global.hotkeys.last === repeat) { return; }
        global.hotkeys.last = repeat;
        if (number !== 0) {
            enterExitChallengeUser(number - 1);
        } else { enterExitChallengeUser(null); }
    }
};

/** Will remove identical hotkeys from globalSave */
export const assignHotkeys = () => {
    for (const key in hotkeys) { delete hotkeys[key]; } //Don't know better way for now
    const index = globalSave.toggles[0] ? 0 : 1;
    for (const key in globalSave.hotkeys) {
        const hotkey = globalSave.hotkeys[key as hotkeysList][index];
        if (hotkey === 'None') { continue; }
        if (hotkeys[hotkey] !== undefined) {
            globalSave.hotkeys[key as hotkeysList] = ['None', 'None'];
        } else { hotkeys[hotkey] = key as hotkeysList; }
    }
    for (const key in globalSave.numbers) {
        const hotkey = globalSave.numbers[key as numbersList];
        if (hotkey === 'None') { continue; }
        if (hotkeys[hotkey] !== undefined) {
            globalSave.numbers[key as numbersList] = 'None';
        } else { hotkeys[hotkey] = key as numbersList; }
    }
};

/** Removes hotkey if exist, returns name of removed hotkey */
export const removeHotkey = (remove: string, number = false): string | null => {
    const test = hotkeys[remove];
    if (test === undefined) { return null; }
    if (number) {
        globalSave.numbers[test as numbersList] = 'None';
    } else {
        globalSave.hotkeys[test as hotkeysList] = ['None', 'None'];
    }
    return test;
};

/** Returns true if only Shift is holded, false if nothing is holded, null if any of Ctrl/Alt/Meta is holded */
export const detectShift = (check: KeyboardEvent): boolean | null => {
    if (check.metaKey || check.ctrlKey || check.altKey) { return null; }
    return check.shiftKey;
};

export const detectHotkey = (check: KeyboardEvent) => {
    const { key, code } = check;
    const info = global.hotkeys;
    if (check.shiftKey && !info.shift) {
        info.shift = true;
        numbersUpdate();
    }
    if (check.ctrlKey && !info.ctrl) {
        info.ctrl = true;
        numbersUpdate();
    }
    if (code === 'Tab' || code === 'Enter' || code === 'Space') {
        if (detectShift(check) === null) { return; }
        if (code === 'Tab') { info.tab = true; }
        document.documentElement.classList.remove('noFocusOutline');
        return;
    } else {
        const activeType = (document.activeElement as HTMLInputElement)?.type;
        if (activeType === 'text' || activeType === 'number') { return; }
        document.documentElement.classList.add('noFocusOutline');
    }
    if (info.disabled) { return; }

    if (code === 'Escape') {
        if (detectShift(check) === null || specialHTML.alert[0] !== null || specialHTML.bigWindow !== null) { return; }
        const notifications = specialHTML.notifications;
        if (check.shiftKey) {
            if (globalSave.developerMode || notifications[0] === undefined) { return; }
            notifications[0][1](true);
        } else {
            for (let i = notifications.length - 1; i >= 0; i--) { notifications[i][1](true); }
        }
        check.preventDefault();
        return;
    } else if (check.metaKey) { return; }

    const number = code.includes('Digit') || code.includes('Numpad');
    let prefix = check.ctrlKey ? 'Ctrl ' : '';
    if (check.shiftKey) { prefix += 'Shift '; }
    if (check.altKey) { prefix += 'Alt '; }
    const functionTest = basicFunctions[hotkeys[prefix + (number ?
        code.replace('Digit', '').replace('Numpad', 'Num ') : globalSave.toggles[0] ?
            (key.length === 1 ? key.toUpperCase() : key.replaceAll(/([A-Z]+)/g, ' $1').trimStart()) :
            (key.length === 1 ? code.replace('Key', '') : code.replaceAll(/([A-Z]+)/g, ' $1').trimStart()))
    ] as hotkeysList];
    if (functionTest !== undefined) {
        functionTest();
        check.preventDefault();
    } else if (number) {
        const functionTest = numberFunctions[hotkeys[prefix + (code.includes('Numpad') ? 'Numpad' : 'Numbers')] as numbersList];
        if (functionTest !== undefined) {
            const test = Number(code.replace('Digit', '').replace('Numpad', ''));
            if (isNaN(test)) { return; }
            functionTest(test);
            check.preventDefault();
        }
    }
};

export const buyAll = () => {
    const active = player.stage.active;
    const max = global.buildingsInfo.maxActive[active];
    const howMany = global.hotkeys.shift ? (global.hotkeys.ctrl ? 100 : 1) : global.hotkeys.ctrl ? 10 : 0;
    if (active === 3) {
        for (let i = 1; i < max; i++) { buyBuilding(i, active, howMany); }
    } else {
        for (let i = max - 1; i >= 1; i--) { buyBuilding(i, active, howMany); }
    }
};
export const createAll = () => {
    const active = player.stage.active;
    for (let i = 0; i < global.upgradesInfo[active].maxActive; i++) { buyUpgrades(i, active, 'upgrades'); }
    for (let i = 0; i < global.researchesInfo[active].maxActive; i++) { buyUpgrades(i, active, 'researches'); }
    for (let i = 0; i < global.researchesExtraInfo[active].maxActive; i++) { buyUpgrades(i, active, 'researchesExtra'); }
    if (active === 4 || active === 5) {
        for (let i = 1; i < global.elementsInfo.maxActive; i++) { buyUpgrades(i, 4, 'elements'); }
    }
};
export const toggleAll = () => {
    const active = player.stage.active;
    const toggles = player.toggles.buildings[active];
    const maxActive = Math.max(global.buildingsInfo.maxActive[active], 2);

    let anyOn = toggles[1];
    for (let i = 2; !anyOn && i < Math.min(player.ASR[active] + 1, maxActive); i++) {
        if (toggles[i]) { anyOn = true; }
    }
    for (let i = 1; i < maxActive; i++) {
        toggles[i] = !anyOn;
        toggleSwap(i, 'buildings');
    }
    visualUpdate();
};

export const offlineWarp = () => {
    const required = 60_000 * (7 - player.tree[0][6]);
    if (global.offline.active || player.time.offline < required) { return; }
    if (player.tree[0][6] < 1) { return Notify("'Improved Offline' has to be at least level 1"); }
    player.time.offline -= required;
    void simulateOffline(60_000, true);
};

const changeTab = (direction: 'left' | 'right') => {
    const tabs = global.tabs.list;
    let index = tabs.indexOf(global.tabs.current);

    if (direction === 'left') {
        do {
            if (index <= 0) {
                index = tabs.length - 1;
            } else { index--; }
        } while (!checkTab(tabs[index]));
    } else {
        do {
            if (index >= tabs.length - 1) {
                index = 0;
            } else { index++; }
        } while (!checkTab(tabs[index]));
    }
    switchTab(tabs[index]);
};

/** Through a hotkey */
export const changeSubtab = (direction: 'down' | 'up') => {
    const tab = global.tabs.current;
    const subtabs = global.tabs[tab].list;
    if (subtabs.length < 2) { return; } //Required
    let index = subtabs.indexOf(global.tabs[tab].current);

    if (direction === 'down') {
        do {
            if (index <= 0) {
                index = subtabs.length - 1;
            } else { index--; }
        } while (!checkTab(tab, subtabs[index]));
    } else {
        do {
            if (index >= subtabs.length - 1) {
                index = 0;
            } else { index++; }
        } while (!checkTab(tab, subtabs[index]));
    }
    switchTab(tab, subtabs[index]);
};

const changeStage = (direction: 'left' | 'right') => {
    const activeAll = global.stageInfo.activeAll;
    if (activeAll.length === 1) { return; }
    let index = activeAll.indexOf(player.stage.active);

    if (direction === 'left') {
        if (index <= 0) {
            index = activeAll.length - 1;
        } else { index--; }
    } else {
        if (index >= activeAll.length - 1) {
            index = 0;
        } else { index++; }
    }
    switchStage(activeAll[index]);
};

/* preventDefault should not be used here */
export const handleTouchHotkeys = (event: TouchEvent) => {
    if (global.hotkeys.disabled) { return; }
    const horizontal = event.changedTouches[0].clientX - specialHTML.mobileDevice.start[0];
    const vertical = event.changedTouches[0].clientY - specialHTML.mobileDevice.start[1];

    const horizontalAbs = Math.abs(horizontal);
    if (horizontalAbs < 100) { return; }
    if (Math.abs(vertical) >= 100) {
        changeSubtab(vertical > 0 ? 'up' : 'down');
    } else if (horizontalAbs >= 250) {
        changeStage(horizontal > 0 ? 'left' : 'right');
    } else {
        changeTab(horizontal > 0 ? 'left' : 'right');
    }
};
