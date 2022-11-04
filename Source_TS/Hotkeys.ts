import { global, player } from './Player';
import { checkTab } from './Check';
import { switchTab } from './Update';
import { buyBuilding } from './Stage';

export const detectHotkey = (check: KeyboardEvent) => {
    const checkEl = document.activeElement as HTMLInputElement;
    if (checkEl.type === 'text' || checkEl.type === 'number') { return; } //Return if any inputs are focused
    const key = player.toggles.normal[6] ? check.key.toLowerCase() : check.code.toLowerCase();

    //These one's can be holded down
    if (!isNaN(Number(key.replace('digit', '')))) {
        const numberKey = Number(key.replace('digit', ''));

        //Buildings
        if (numberKey === 0 || numberKey >= global.buildingsInfo.name.length) { return; }
        buyBuilding(numberKey); //Check is already inside
    } //else if (key.replace('key', '').length === 1) {} //Maybe this could work same as a-z regex

    if (!check.repeat) {
        if (key === 'arrowleft' || key === 'arrowright') {
            const { tabs } = global.tabList;
            let index = tabs.indexOf(global.tab);
            if (index === -1) { return console.error(`Tab '${global.tab}' wasn't found in the list`); }

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
            let index = subtabs.indexOf(global.subtab[global.tab + 'Current' as 'settingsCurrent']);
            if (index === -1) { return console.error(`Subtab '${global.subtab[global.tab + 'Current' as 'settingsCurrent']}' wasn't found in the list`); }

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
