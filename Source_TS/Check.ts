import { global, player } from './Player';
import { getUpgradeDescription } from './Update';

//Only checks if Tab/Subtab is unlocked
export const checkTab = (tab: string, subtab = 'none'): boolean => {
    let tabUnl = false;
    let subUnl = false;

    switch (tab) {
        case 'settings':
            subUnl = true; //'Settings' || 'Stats'
            //Falls through, just for lint
        case 'stage':
            tabUnl = true;
            break;
        case 'research':
            if (player.stage.true > 1 || player.discharge.current >= 4) {
                tabUnl = true;
                if (subtab === 'Researches') {
                    subUnl = true;
                } else if (subtab === 'Elements') {
                    subUnl = (player.stage.active === 4 || player.stage.active === 5) && player.upgrades[4][1] === 1;
                }
            }
            break;
        case 'strangeness':
            if (player.strange[0].total > 0) {
                tabUnl = true;
                if (subtab === 'Matter') {
                    subUnl = true;
                } else if (subtab === 'Milestones') {
                    subUnl = player.stage.resets >= 6;
                }
            }
            break;
        case 'special':
            tabUnl = global.screenReader;
    }

    return subtab !== 'none' ? subUnl : tabUnl;
};

//Only checks if Building is unlocked
export const checkBuilding = (index: number, stageIndex: number): boolean => {
    if (index >= 1) {
        if (stageIndex === 1 || stageIndex === 2) {
            return true;
        } else if (stageIndex === 3) {
            if (player.accretion.rank === 0) { return false; }
            if (index === 1 || player.upgrades[3][(index - 1) * 2] === 1) { //Lazy
                return true;
            }
        } else if (stageIndex === 4) {
            if (player.collapse.mass < global.collapseInfo.unlockB[index]) { return false; }
            if (index === 1 || index === 4 || player.upgrades[4][index - 1] === 1) { //Lazy
                return true;
            }
        } else if (stageIndex === 5) {
            if (index === 1) {
                return false; //player.milestones[2][0] >= 3;
            } else if (index === 2) {
                return false; //player.milestones[3][0] >= 3;
            } else if (index === 3) {
                return false;
            }
        }
    }

    return false;
};

//Only checks if Upgrade is unlocked
export const checkUpgrade = (upgrade: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'elements' | 'strangeness'): boolean => {
    if (type !== 'strangeness') {
        if (stageIndex === 1 && type !== 'researchesAuto') { return true; }
        if (stageIndex === 3 && player.accretion.rank === 0) { return false; }
    }

    switch (type) {
        case 'upgrades':
            if (stageIndex === 2) {
                if (upgrade === 6 && player.strangeness[2][2] < 3) { return false; }
                return true;
            } else if (stageIndex === 3) {
                return player.accretion.rank >= global.accretionInfo.rankU[upgrade];
            } else if (stageIndex === 4) {
                if (upgrade === 3 && player.strangeness[4][2] < 2) { return false; }
                return player.collapse.mass >= global.collapseInfo.unlockU[upgrade];
            }
            break;
        case 'researches':
            if (stageIndex === 2) {
                return true;
            } else if (stageIndex === 3) {
                return player.accretion.rank >= global.accretionInfo.rankR[upgrade];
            } else if (stageIndex === 4) {
                if (upgrade === 3 && player.strangeness[4][2] < 1) { return false; }
                return player.collapse.mass >= global.collapseInfo.unlockR[upgrade];
            }
            break;
        case 'researchesExtra':
            if (stageIndex === 2) {
                return true;
            } else if (stageIndex === 3) {
                return player.accretion.rank >= global.accretionInfo.rankE[upgrade];
            } else if (stageIndex === 4) {
                if (upgrade === 1 && player.strangeness[4][2] < 3) { return false; }
                return true;
            }
            break;
        case 'researchesAuto': //Other cases are handled by max level being 0
            return stageIndex === global.researchesAutoInfo.autoStage[upgrade];
        case 'elements':
            if (player.stage.current < 4) { return false; }
            if (upgrade >= 27) {
                return player.upgrades[4][3] === 1;
            } else if (upgrade >= 11) {
                return player.collapse.mass >= 10;
            } else if (upgrade >= 6) {
                return player.upgrades[4][2] === 1;
            } else if (upgrade >= 1) {
                return player.upgrades[4][1] === 1;
            }
            break;
        case 'strangeness':
            if (((stageIndex === 1 || stageIndex === 4) && upgrade < 8) ||
                ((stageIndex === 2 || stageIndex === 3) && upgrade < 7)) { return true; }
            return player.milestones[4][0] >= 3;
    }

    return false;
};

//Only checks if upgrades is allowed to be reset
export const checkUpgradeReset = (upgrade: number, stageIndex: number, type: 'upgrades' /*| 'researches'*/ | 'researchesExtra'): boolean => {
    switch (type) {
        case 'upgrades':
            if (stageIndex === 2) {
                if (upgrade === 1) { return false; }
            } else if (stageIndex === 4) {
                if (upgrade === 0 || player.collapse.mass >= 10) { return false; }
            }
            break;
        case 'researchesExtra':
            if (stageIndex === 4 && upgrade === 0) { return false; }
    }

    return true;
};

//Check and award Milestone reward
export const milestoneCheck = (index: number, stageIndex: number) => {
    const need = global.milestonesInfo[stageIndex].need[index][player.milestones[stageIndex][index]];
    if (need === undefined || player.stage.resets < 6) { return; }
    let award = false;

    if (stageIndex === 1) {
        if (index === 0) {
            award = player.buildings[1][0].current >= need;
        } else if (index === 1) {
            award = player.discharge.energyMax >= need;
        }
    } else if (stageIndex === 2) {
        if (index === 0) {
            award = player.buildings[2][1].current >= need;
        } else if (index === 1) {
            award = player.buildings[2][2].current >= need;
        }
    } else if (stageIndex === 3) {
        if (index === 0) {
            award = player.buildings[3][0].current >= need;
        } else if (index === 1) {
            award = player.buildings[3][4].current > need;
        }
    } else if (stageIndex === 4) {
        if (index === 0) {
            award = player.collapse.mass >= need;
        } else if (index === 1) {
            award = player.collapse.stars[2] >= need;
        }
    }

    if (award) {
        player.strange[0].true += global.milestonesInfo[stageIndex].quarks[index][player.milestones[stageIndex][index]];
        player.milestones[stageIndex][index]++;
        getUpgradeDescription(index, stageIndex, 'milestones');
    }
};
