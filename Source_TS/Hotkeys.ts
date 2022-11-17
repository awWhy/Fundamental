import { global, player } from './Player';
import { checkTab } from './Check';
import { switchTab } from './Update';
import { buyBuilding, collapseResetCheck, dischargeResetCheck, rankResetCheck, stageResetCheck, vaporizationResetCheck } from './Stage';

export const detectHotkey = (check: KeyboardEvent) => {
    const checkEl = document.activeElement as HTMLInputElement;
    if (checkEl.type === 'text' || checkEl.type === 'number') {
        return; //Return if any inputs are focused
    } else {
        check.code === 'Tab' ? //I just want to remove outline when hitting buttons that is not a tab...
            document.body.classList.add('outlineOnFocus') :
            document.body.classList.remove('outlineOnFocus');
    }
    if (check.ctrlKey || check.altKey) { return; } //No buttons are using it

    const shift = check.shiftKey;
    const isNumber = !isNaN(Number(check.code.slice(-1)));
    const key = !player.toggles.normal[6] || (isNumber && shift) ?
        check.code : check.key;

    //These one's can be holded down
    if (isNumber) {
        const numberKey = Number(key.slice(-1));

        //Buildings
        if (numberKey > 0 && numberKey < global.buildingsInfo.name.length && !shift) {
            buyBuilding(numberKey); //Check is already inside
        }
    } else if (check.key.length === 1) { //Maybe this could work same as a-z regex
        const stringKey = key.slice(-1).toLowerCase();

        //Resets
        if (!shift) {
            if (stringKey === 's') {
                void stageResetCheck();
            } else if (stringKey === 'd') {
                void dischargeResetCheck();
            } else if (stringKey === 'v') {
                void vaporizationResetCheck();
            } else if (stringKey === 'r') {
                void rankResetCheck();
            } else if (stringKey === 'c') {
                void collapseResetCheck();
            }
        }
    }

    if (!check.repeat) {
        if (key === 'ArrowLeft' || key === 'ArrowRight') {
            const { tabs } = global.tabList;
            let index = tabs.indexOf(global.tab);
            if (index === -1) { return console.error(`Tab '${global.tab}' wasn't found in the list`); }

            if (key === 'ArrowLeft') {
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
        } else if (key === 'ArrowDown' || key === 'ArrowUp') {
            if (!Object.hasOwn(global.subtab, global.tab + 'Current')) { return; }
            const subtabs = global.tabList[global.tab + 'Subtabs'];
            let index = subtabs.indexOf(global.subtab[global.tab + 'Current' as 'settingsCurrent']);
            if (index === -1) { return console.error(`Subtab '${global.subtab[global.tab + 'Current' as 'settingsCurrent']}' wasn't found in the list`); }

            if (key === 'ArrowDown') {
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
