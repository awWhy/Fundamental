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

    const shift = check.shiftKey;
    const isNumber = !isNaN(Number(check.code.slice(-1)));
    const key = !player.toggles.normal[6] || (isNumber && shift) ? check.code : check.key;

    if (isNumber) {
        if (check.code[0] === 'F') { return; }
        const numberKey = Number(key.slice(-1));

        if (!shift && numberKey >= 1) { buyBuilding(numberKey); }
        return;
    } else if (check.key.length === 1) {
        const stringKey = key.replace('Key', '').toLowerCase();

        if (!shift) {
            if (stringKey === 'a') {
                toggleSwap(0, 'buildings', true);
            } else if (stringKey === 'o') {
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
        if (shift) {
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
