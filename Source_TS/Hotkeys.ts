import { global, player } from './Player';
import { checkTab } from './Check';
import { switchTab } from './Update';
import { buyBuilding, collapseAsyncReset, dischargeAsyncReset, rankAsyncReset, stageAsyncReset, switchStage, toggleSwap, vaporizationAsyncReset } from './Stage';
import { timeWarp } from './Main';

export const detectHotkey = (check: KeyboardEvent) => {
    if (check.code === 'Tab') {
        document.body.classList.add('outlineOnFocus');
        return;
    } else {
        const activeType = (document.activeElement as HTMLInputElement).type;
        if (activeType === 'text' || activeType === 'number') { return; }
        document.body.classList.remove('outlineOnFocus');
    }
    if (check.ctrlKey || check.altKey) { return; }
    const key = check.key;

    if (key.length === 1) {
        const numberKey = Number(check.code.slice(-1));

        if (!isNaN(numberKey)) { //Spacebar goes here as 0
            if (check.code[0] === 'F' || numberKey < 1) { return; }
            if (check.shiftKey) {
                toggleSwap(numberKey, 'buildings', true);
            } else { buyBuilding(numberKey); }
            return;
        }

        const stringKey = (player.toggles.normal[6] ? check.code.replace('Key', '') : key).toLowerCase();

        if (check.shiftKey) {
            if (stringKey === 'a') {
                toggleSwap(0, 'buildings', true);
            }
        } else {
            if (stringKey === 'o') {
                toggleSwap(0, 'normal', true);
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
            }
        }
        return;
    }

    if (!check.repeat) {
        if (check.shiftKey) {
            if (key === 'ArrowLeft' || key === 'ArrowRight') {
                const { activeAll } = global.stageInfo;
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
            }
        } else {
            if (key === 'ArrowLeft' || key === 'ArrowRight') {
                const { tabs } = global.tabList;
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
            } else if (key === 'ArrowDown' || key === 'ArrowUp') {
                if (!Object.hasOwn(global.subtab, `${global.tab}Current`)) { return; }
                const subtabs = global.tabList[`${global.tab as 'stage'}Subtabs`];
                let index = subtabs.indexOf(global.subtab[`${global.tab as 'stage'}Current`]);

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
        }
    }
};
