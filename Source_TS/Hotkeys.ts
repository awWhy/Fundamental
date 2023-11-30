import { global, player } from './Player';
import { checkTab } from './Check';
import { switchTab } from './Update';
import { buyBuilding, collapseAsyncReset, dischargeAsyncReset, rankAsyncReset, stageAsyncReset, switchStage, toggleSwap, vaporizationAsyncReset } from './Stage';
import { globalSave } from './Special';
import { buyAll, pauseGame, timeWarp } from './Main';

export const detectHotkey = (check: KeyboardEvent) => {
    if (check.code === 'Tab') {
        document.body.classList.remove('noFocusOutline');
        return;
    } else {
        const activeType = (document.activeElement as HTMLInputElement)?.type;
        if (activeType === 'text' || activeType === 'number') { return; }
        document.body.classList.add('noFocusOutline');
    }
    if (global.paused) { return; }
    const { key, code } = check;
    let { shiftKey } = check;

    //Can be undefined on Safari
    if (shiftKey) { global.hotkeys.shift = true; }
    if (check.ctrlKey) { return void (global.hotkeys.ctrl = true); }
    if (check.altKey) { return; }

    const numberKey = Number(code.slice(-1));
    if (!isNaN(numberKey)) {
        if (isNaN(Number(key))) {
            if (code === '' || code[0] === 'F') { return; }
            if (!shiftKey) { //Numpad
                shiftKey = true;
                check.preventDefault();
            }
        }

        if (shiftKey) {
            if (check.repeat) { return; }
            toggleSwap(numberKey, 'buildings', true);
        } else { buyBuilding(numberKey); }
    } else if (key.length === 1) {
        const stringKey = (globalSave.toggles[0] ? key : code.replace('Key', '')).toLowerCase();
        if (shiftKey) {
            if (stringKey === 'a') {
                toggleSwap(0, 'buildings', true);
            }
        } else {
            if (stringKey === 'm') {
                buyAll();
            } else if (stringKey === 'w') {
                check.preventDefault();
                void timeWarp();
            } else if (stringKey === 's') {
                void stageAsyncReset();
            } else if (stringKey === 'd') {
                if (global.stageInfo.activeAll.includes(1)) { void dischargeAsyncReset(); }
            } else if (stringKey === 'v') {
                if (global.stageInfo.activeAll.includes(2)) { void vaporizationAsyncReset(); }
            } else if (stringKey === 'r') {
                if (global.stageInfo.activeAll.includes(3)) { void rankAsyncReset(); }
            } else if (stringKey === 'c') {
                if (global.stageInfo.activeAll.includes(4)) { void collapseAsyncReset(); }
            } else if (stringKey === 'p') {
                if (globalSave.developerMode) { void pauseGame(); }
            }
        }
    } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
        if (check.repeat) { return; }
        if (shiftKey) {
            const activeAll = global.stageInfo.activeAll;
            if (activeAll.length === 1) { return; }
            let index = activeAll.indexOf(player.stage.active);

            if (key === 'ArrowLeft') {
                if (index <= 0) {
                    index = activeAll.length - 1;
                } else { index--; }
                switchStage(activeAll[index]);
            } else {
                if (index >= activeAll.length - 1) {
                    index = 0;
                } else { index++; }
                switchStage(activeAll[index]);
            }
        } else {
            const tabs = global.tabList.tabs;
            let index = tabs.indexOf(global.tab);

            if (key === 'ArrowLeft') {
                do {
                    if (index <= 0) {
                        index = tabs.length - 1;
                    } else { index--; }
                } while (!checkTab(tabs[index]));
                switchTab(tabs[index]);
            } else {
                do {
                    if (index >= tabs.length - 1) {
                        index = 0;
                    } else { index++; }
                } while (!checkTab(tabs[index]));
                switchTab(tabs[index]);
            }
        }
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
        const subtab = global.subtab[`${global.tab}Current` as keyof unknown] as string | undefined;
        if (shiftKey || check.repeat || subtab === undefined) { return; }
        const subtabs = global.tabList[`${global.tab as 'stage'}Subtabs`];
        let index = subtabs.indexOf(subtab);

        if (key === 'ArrowDown') {
            do {
                if (index <= 0) {
                    index = subtabs.length - 1;
                } else { index--; }
            } while (!checkTab(global.tab, subtabs[index]));
            switchTab(global.tab, subtabs[index]);
        } else {
            do {
                if (index >= subtabs.length - 1) {
                    index = 0;
                } else { index++; }
            } while (!checkTab(global.tab, subtabs[index]));
            switchTab(global.tab, subtabs[index]);
        }
    }
};
