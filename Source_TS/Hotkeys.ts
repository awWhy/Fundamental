import { global, player } from './Player';
import { checkTab } from './Check';
import { switchTab } from './Update';
import { buyBuilding, collapseResetUser, dischargeResetUser, enterExitChallengeUser, mergeResetUser, rankResetUser, stageResetUser, switchStage, toggleSwap, vaporizationResetUser } from './Stage';
import { buyAll, pauseGameUser } from './Main';
import { SRHotkeysInfo, globalSave, specialHTML } from './Special';
import type { hotkeysList } from './Types';

export const hotkeys = {} as Record<string, hotkeysList>;
const hotkeyFunction = {
    makeAll: () => buyAll(),
    stage: (event) => {
        if (event.repeat && (player.inflation.vacuum || player.stage.active >= 4)) { return; }
        void stageResetUser();
    },
    discharge: () => void dischargeResetUser(),
    vaporization: (event) => {
        if (event.repeat) { return; }
        void vaporizationResetUser();
    },
    rank: () => void rankResetUser(),
    collapse: (event) => {
        if (event.repeat) { return; }
        void collapseResetUser();
    },
    galaxy: () => buyBuilding(3, 5),
    pause: (event) => {
        if (event.repeat) { return; }
        pauseGameUser();
    },
    toggleAll: (event) => {
        if (event.repeat) { return; }
        toggleSwap(0, 'buildings', true);
    },
    merge: (event) => {
        if (event.repeat) { return; }
        void mergeResetUser();
    },
    universe: () => buyBuilding(1, 6),
    exitChallenge: () => enterExitChallengeUser(null),
    tabRight: (event) => {
        if (event.repeat) { return; }
        changeTab('right');
    },
    tabLeft: (event) => {
        if (event.repeat) { return; }
        changeTab('left');
    },
    subtabUp: (event) => {
        if (event.repeat) { return; }
        changeSubtab('up');
    },
    subtabDown: (event) => {
        if (event.repeat) { return; }
        changeSubtab('down');
    },
    stageRight: (event) => {
        if (event.repeat) { return; }
        changeStage('right');
    },
    stageLeft: (event) => {
        if (event.repeat) { return; }
        changeStage('left');
    }
} as Record<hotkeysList, (event: KeyboardEvent) => void>;

/** Will remove identical hotkeys from globalSave */
export const assignHotkeys = () => {
    for (const key in hotkeys) { delete hotkeys[key]; } //Don't know better way for now
    const index = globalSave.toggles[0] ? 0 : 1;
    for (const key in globalSave.hotkeys) {
        const hotkey = globalSave.hotkeys[key as hotkeysList][index];
        if (hotkey === '' || hotkey == null) { continue; }
        if (hotkeys[hotkey] !== undefined) {
            globalSave.hotkeys[key as hotkeysList] = [];
        } else { hotkeys[hotkey] = key as hotkeysList; }
    }
    if (globalSave.SRSettings[0]) { SRHotkeysInfo(); }
};

/** Removes hotkey if exist, returns name of removed hotkey */
export const removeHotkey = (remove: string): string | null => {
    const test = hotkeys[remove];
    if (test === undefined) { return null; }
    globalSave.hotkeys[test] = [];
    return test;
};

/** Returns true if only Shift is holded, false if nothing is holded, null if any of Ctrl/Alt/Meta is holded */
export const detectShift = (check: KeyboardEvent): boolean | null => {
    if (check.metaKey || check.ctrlKey || check.altKey) { return null; }
    return check.shiftKey;
};

export const detectHotkey = (check: KeyboardEvent) => {
    let { shiftKey } = check;
    const { key, code } = check;
    if (shiftKey) { global.hotkeys.shift = true; }
    if (check.ctrlKey) { global.hotkeys.ctrl = true; }
    if (code === 'Tab' || code === 'Enter' || code === 'Space') {
        if (detectShift(check) === null) { return; }
        if (code === 'Tab') { global.hotkeys.tab = true; }
        document.body.classList.remove('noFocusOutline');
        return;
    } else {
        const activeType = (document.activeElement as HTMLInputElement)?.type;
        if (activeType === 'text' || activeType === 'number') { return; }
        document.body.classList.add('noFocusOutline');
    }
    if (global.hotkeys.disabled) { return; }

    if (code === 'Escape') {
        if (detectShift(check) !== false || specialHTML.alert[0] !== null || specialHTML.bigWindow !== null) { return; }
        const notification = specialHTML.notifications[0];
        if (notification !== undefined) { notification[1](true); }
        return;
    }

    const numberKey = Number(code.replace('Digit', '').replace('Numpad', ''));
    if (!isNaN(numberKey) && code !== '') {
        if (detectShift(check) === null) { return; }
        if (isNaN(Number(key)) && !shiftKey) { shiftKey = true; } //Numpad
        check.preventDefault();

        if (shiftKey) {
            if (check.repeat) { return; }
            toggleSwap(numberKey, 'buildings', true);
        } else if (numberKey !== 0) {
            buyBuilding(numberKey, player.stage.active);
        } else { buyAll(); }
    } else {
        let name = check.metaKey ? 'Meta ' : '';
        if (check.ctrlKey) { name += 'Ctrl '; }
        if (shiftKey) { name += 'Shift '; }
        if (check.altKey) { name += 'Alt '; }
        name += globalSave.toggles[0] ?
            (key.length === 1 ? key.toUpperCase() : key.replace('Arrow', 'Arrow ')) :
            (key.length === 1 ? code.replace('Key', '') : code.replace('Arrow', 'Arrow '));
        const functionTest = hotkeyFunction[hotkeys[name]];
        if (functionTest !== undefined) {
            functionTest(check);
            check.preventDefault();
        }
    }
};

const changeTab = (direction: 'left' | 'right') => {
    const tabs = global.tabList.tabs;
    let index = tabs.indexOf(global.tab);

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
    const tab = global.tab;
    const subtabs = global.tabList[`${tab}Subtabs`] as string[];
    if (subtabs.length < 2) { return; } //To remove never[]
    let index = subtabs.indexOf(global.subtab[`${tab}Current`]);

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
