import { global, player } from './Player';

export const checkTab = (tab: string, subtab = 'none') => {
    let tabUnl = false;
    let subUnl = false;

    switch (tab) {
        case 'settings':
            tabUnl = true;
            switch (subtab) {
                case 'stats':
                case 'settings':
                    subUnl = true;
            }
            break;
        case 'stage':
            tabUnl = true;
            break;
        case 'research':
            if (player.stage.true > 1 || player.discharge.current >= 4) {
                tabUnl = true;
                switch (subtab) {
                    case 'researches':
                        subUnl = true;
                        break;
                    case 'elements':
                        if (player.stage.current === 4 && player.upgrades[1] === 1) { subUnl = true; }
                }
            }
            break;
        case 'special':
            tabUnl = global.screenReader;
            break;
    }

    if (subtab !== 'none') {
        return subUnl;
    } else {
        return tabUnl;
    }
};
