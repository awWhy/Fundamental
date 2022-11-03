import { global, player } from './Player';
import { checkTab } from './Check';
import { switchTab } from './Update';
import { buyBuilding } from './Stage';
import { getId } from './Main';

export const detectHotkey = (check: KeyboardEvent) => {
    if (getId('blocker').style.display === '') { return; } //Return if Alert is being shown
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
            if (index === -1) { return; } //Just in case

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
            if (index === -1) { return; } //Just in case

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
