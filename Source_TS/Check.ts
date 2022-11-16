import { global, player } from './Player';

//Only checks if Tab/Subtab is unlocked
export const checkTab = (tab: string, subtab = 'none'): boolean => {
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
                if (subtab === 'researches') {
                    subUnl = true;
                } else if (subtab === 'elements') {
                    if (player.stage.current >= 4 && player.upgrades[1] === 1) { subUnl = true; }
                }
            }
            break;
        case 'strangeness':
            if (player.strange[0].total > 0) {
                tabUnl = true;
            }
            break;
        case 'special':
            tabUnl = global.screenReader;
    }

    return subtab !== 'none' ? subUnl : tabUnl;
};

//Only checks if Building is unlocked
export const checkBuilding = (index: number): boolean => {
    const { stage } = player;

    if (index >= 1) {
        if (stage.current === 1 || stage.current === 2) {
            return true;
        } else if (stage.current === 3) {
            if (player.accretion.rank === 0) { return false; }
            if (index === 1 || player.upgrades[(index - 1) * 2] === 1) { //Lazy
                return true;
            }
        } else if (stage.current >= 4) {
            if (player.collapse.mass < global.collapseInfo.unlockB[index]) { return false; }
            if (index === 1 || index === 4 || player.upgrades[index - 1] === 1) { //Lazy
                return true;
            }
        }
    }

    return false;
};

//Only checks if Upgrade is unlocked
export const checkUpgrade = (upgrade: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto'): boolean => {
    const { stage } = player;

    if (stage.current === 1 && type !== 'researchesAuto') { return true; }
    if (stage.current === 3 && player.accretion.rank === 0) { return false; }

    switch (type) {
        case 'upgrades':
            if (stage.current === 2) {
                if (upgrade === 6 && player.strangeness[1][2] < 3) { return false; }
                return true;
            } else if (stage.current === 3) {
                if (player.accretion.rank >= global.accretionInfo.rankU[upgrade]) { return true; }
            } else if (stage.current >= 4) {
                if (upgrade === 3 && player.strangeness[3][2] < 2) { return false; }
                if (player.collapse.mass >= global.collapseInfo.unlockU[upgrade]) { return true; }
            }
            break;
        case 'researches':
            if (stage.current === 2) {
                return true;
            } else if (stage.current === 3) {
                if (player.accretion.rank >= global.accretionInfo.rankR[upgrade]) { return true; }
            } else if (stage.current >= 4) {
                if (upgrade === 3 && player.strangeness[3][2] < 1) { return false; }
                if (player.collapse.mass >= global.collapseInfo.unlockR[upgrade]) { return true; }
            }
            break;
        case 'researchesExtra':
            if (stage.current === 2) {
                return true;
            } else if (stage.current === 3) {
                if (player.accretion.rank >= global.accretionInfo.rankE[upgrade]) { return true; }
            } else if (stage.current >= 4) {
                if (upgrade === 1 && player.strangeness[3][2] < 3) { return false; }
                return true;
            }
            break;
        case 'researchesAuto': //Auto should never buy these
            if (upgrade === 1) { return true; }
            if (stage.current === global.stageInfo.autoStage[upgrade]) {
                return true;
            }
    }

    return false;
};
