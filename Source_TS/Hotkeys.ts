import { global, player } from './Player';
import { checkTab } from './Check';
import { numbersUpdate, switchTab } from './Update';
import { buyBuilding, buyUpgrades, buyVerse, collapseResetUser, dischargeResetUser, endResetUser, enterExitChallengeUser, mergeResetUser, nucleationResetUser, rankResetUser, stageResetUser, switchStage, toggleSupervoid, vaporizationResetUser } from './Stage';
import { pauseGameUser, playerStart, simulateOffline, toggleSwap } from './Main';
import { Notify, globalSave, specialHTML } from './Special';
import type { hotkeysList, numbersList } from './Types';

const hotkeys = {} as Record<string, hotkeysList | numbersList>;
const basicFunctions: Record<hotkeysList, () => boolean> = {
    makeAll: () => {
        buyAll();
        return false;
    },
    createAll: () => {
        createAll();
        return false;
    },
    stage: () => {
        if (global.hotkeys.repeat && (player.inflation.vacuum || player.stage.active >= 4)) { return false; }
        void stageResetUser();
        return true;
    },
    discharge: () => {
        void dischargeResetUser();
        return false;
    },
    vaporization: () => {
        if (global.hotkeys.repeat) { return false; }
        void vaporizationResetUser();
        return true;
    },
    rank: () => {
        void rankResetUser();
        return false;
    },
    collapse: () => {
        if (global.hotkeys.repeat) { return false; }
        void collapseResetUser();
        return true;
    },
    galaxy: () => {
        buyBuilding(3, 5);
        return false;
    },
    nucleation: () => {
        if (global.hotkeys.repeat) { return false; }
        void nucleationResetUser();
        return true;
    },
    warp: () => {
        if (global.hotkeys.repeat) { return false; }
        offlineWarp();
        return true;
    },
    pause: () => {
        if (global.hotkeys.repeat) { return false; }
        pauseGameUser();
        return true;
    },
    toggleAll: () => {
        if (global.hotkeys.repeat) { return false; }
        toggleSwap(0, 'buildings', true);
        return true;
    },
    merge: () => {
        if (global.hotkeys.repeat) { return false; }
        void mergeResetUser();
        return true;
    },
    universe: () => {
        buyVerse(0);
        return false;
    },
    end: () => {
        void endResetUser();
        return false;
    },
    supervoid: () => {
        if (global.hotkeys.repeat) { return false; }
        const old = player.challenges.super;
        toggleSupervoid(true);
        if (old === player.challenges.super) { return true; }
        Notify(`Toggled into the ${player.challenges.super ? 'Supervoid' : 'Void'}`);
        return true;
    },
    exitChallenge: () => {
        if (global.hotkeys.repeat) { return false; }
        enterExitChallengeUser(null);
        return true;
    },
    tabRight: () => {
        if (global.hotkeys.repeat) { return false; }
        changeTab('right');
        return true;
    },
    tabLeft: () => {
        if (global.hotkeys.repeat) { return false; }
        changeTab('left');
        return true;
    },
    subtabUp: () => {
        if (global.hotkeys.repeat) { return false; }
        changeSubtab('up');
        return true;
    },
    subtabDown: () => {
        if (global.hotkeys.repeat) { return false; }
        changeSubtab('down');
        return true;
    },
    stageRight: () => {
        if (global.hotkeys.repeat) { return false; }
        changeStage('right');
        return true;
    },
    stageLeft: () => {
        if (global.hotkeys.repeat) { return false; }
        changeStage('left');
        return true;
    }
};
const numberFunctions: Record<numbersList, (number: number) => boolean> = {
    makeStructure: (number) => {
        if (number !== 0) {
            if (player.stage.active === 6 && player.strangeness[6][3] < 1) {
                buyVerse(number - 1);
            } else { buyBuilding(number, player.stage.active); }
        } else { buyAll(); }
        return false;
    },
    toggleStructure: (number) => {
        if (global.hotkeys.repeat) { return false; }
        toggleSwap(number, 'buildings', true);
        return true;
    },
    enterChallenge: (number) => {
        if (global.hotkeys.repeat) { return false; }
        if (number !== 0) {
            enterExitChallengeUser(number - 1);
        } else { enterExitChallengeUser(null); }
        return true;
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
        if (detectShift(check) !== false || specialHTML.alert[0] !== null || specialHTML.bigWindow !== null) { return; }
        const notification = specialHTML.notifications[0];
        if (notification !== undefined) { notification[1](true); }
        check.preventDefault();
        return;
    } else if (check.metaKey) { return; }

    let name = check.ctrlKey ? 'Ctrl ' : '';
    if (check.shiftKey) { name += 'Shift '; }
    if (check.altKey) { name += 'Alt '; }
    const numberKey = Number(code.replace('Digit', '').replace('Numpad', ''));
    if (!isNaN(numberKey) && code !== '') {
        name += code.includes('Numpad') ? 'Numpad' : 'Numbers';
        const functionTest = numberFunctions[hotkeys[name] as numbersList];
        if (functionTest !== undefined) {
            if (functionTest(numberKey)) { info.repeat = true; }
            check.preventDefault();
        }
    } else {
        name += globalSave.toggles[0] ?
            (key.length === 1 ? key.toUpperCase() : key.replaceAll(/([A-Z]+)/g, ' $1').trimStart()) :
            (key.length === 1 ? code.replace('Key', '') : code.replaceAll(/([A-Z]+)/g, ' $1').trimStart());
        const functionTest = basicFunctions[hotkeys[name] as hotkeysList];
        if (functionTest !== undefined) {
            if (functionTest()) { info.repeat = true; }
            check.preventDefault();
        }
    }
};

export const buyAll = () => {
    const active = player.stage.active;
    const max = global.buildingsInfo.maxActive[active];
    if (active === 3) {
        for (let i = 1; i < max; i++) { buyBuilding(i, active, 0); }
    } else {
        for (let i = max - 1; i >= 1; i--) { buyBuilding(i, active, 0); }
    }
    if (active === 6 && player.strangeness[6][3] < 1) {
        for (let i = 0; i < playerStart.verses.length; i++) { buyVerse(i); }
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
export const offlineWarp = () => {
    const required = player.tree[0][5] >= 1 && player.challenges.active !== null ? 360_000 : 720_000;
    if (global.offline.active || player.time.offline < required) { return; }
    player.time.offline -= required;
    void simulateOffline(300_000, true);
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
