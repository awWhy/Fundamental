import { global, player } from './Player';

export const checkTab = (tab: string, subtab = 'none') => {
    let tabUnl = false;
    let subUnl = false;

    switch (tab) {
        case 'settings':
            subUnl = true; //Falls through, just for lint
        case 'stage':
            tabUnl = true;
            break;
        case 'research':
            if (player.stage.true > 1 || player.discharge.current >= 4) {
                tabUnl = true;
                if (subtab === 'researches' || (/*subtab === 'elements' &&*/ player.stage.current === 4 && player.upgrades[1] === 1)) {
                    subUnl = true;
                }
            }
            break;
        case 'special':
            tabUnl = global.screenReader;
            break;
    }

    return subtab !== 'none' ? subUnl : tabUnl;
};

export const checkBuilding = (index: number) => {
    let unlocked = false;

    //It won't stop if you try to buy building 0 or non existing one (but it shoudn't happen anyway)
    switch (player.stage.current) {
        case 1:
        case 2:
            unlocked = true;
            break;
        case 3:
            if (index === 1 || player.upgrades[(index - 1) * 2] === 1) { //Lazy
                unlocked = true;
            }
            break;
        case 4:
            if (player.collapse.mass < global.collapseInfo.unlockPriceB[index]) { return false; }
            if (index === 1 || index === 4 || player.upgrades[index - 1] === 1) { //Lazy
                unlocked = true;
            }
    }

    return unlocked;
};
