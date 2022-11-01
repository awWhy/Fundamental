import { global, player } from './Player';
import { checkTab } from './Check';
import { switchTab } from './Update';

export const detectHotkey = (check: KeyboardEvent) => {
    const key = player.toggles.normal[6] ? check.code.toLowerCase() : check.key.toLowerCase();

    if (!check.repeat) {
        if (key === 'arrowleft' || key === 'arrowright') {
            const { tabs } = global.tabList;
            let index = tabs.indexOf(global.tab);
            if (index === -1) { return; }

            if (key === 'arrowleft') {
                do {
                    if (index === 0) {
                        index = tabs.length - 1;
                    } else {
                        index--;
                    }
                } while (!checkTab(tabs[index]));
                switchTab(tabs[index]);
            } else {
                do {
                    if (index === tabs.length - 1) {
                        index = 0;
                    } else {
                        index++;
                    }
                } while (!checkTab(tabs[index]));
                switchTab(tabs[index]);
            }
        } else if (key === 'arrowdown' || key === 'arrowup') {
            if (!Object.hasOwn(global.subtab, global.tab + 'Current')) { return; }
            const subtabs = global.tabList[global.tab + 'Subtabs'];
            let index = subtabs.indexOf(global.subtab[global.tab + 'Current' as keyof typeof global.subtab]);
            if (index === -1) { return; }

            if (key === 'arrowdown') {
                do {
                    if (index === 0) {
                        index = subtabs.length - 1;
                    } else {
                        index--;
                    }
                } while (!checkTab(global.tab, subtabs[index]));
                switchTab(global.tab, subtabs[index]);
            } else {
                do {
                    if (index === subtabs.length - 1) {
                        index = 0;
                    } else {
                        index++;
                    }
                } while (!checkTab(global.tab, subtabs[index]));
                switchTab(global.tab, subtabs[index]);
            }
        }
    }
};
