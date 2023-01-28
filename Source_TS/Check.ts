import { global, player } from './Player';
import { getUpgradeDescription } from './Update';

//Only checks if Tab/Subtab is unlocked
export const checkTab = (tab: string, subtab = null as null | string): boolean => {
    let tabUnl = false;
    let subUnl = false;

    switch (tab) {
        case 'stage':
            tabUnl = true;
            if (subtab === 'Structures') {
                subUnl = true;
            } else if (subtab === 'Advanced') {
                subUnl = player.milestones[1][0] >= 5 || player.milestones[2][1] >= 4 ||
                    player.milestones[3][1] >= 5 || player.milestones[4][1] >= 5 || player.milestones[5][1] >= 8;
            }
            break;
        case 'settings':
            tabUnl = true;
            subUnl = true; //'Settings' || 'Stats'
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
                subUnl = true; //'Matter' || 'Milestones'
            }
            break;
        case 'special':
            tabUnl = global.screenReader;
    }

    return subtab !== null ? subUnl : tabUnl;
};

//Only checks if Building is unlocked
export const checkBuilding = (index: number, stageIndex: number): boolean => {
    if (index >= 1) {
        if (stageIndex === 1 || stageIndex === 2) {
            return true;
        } else if (stageIndex === 3) {
            if (player.accretion.rank === 0) { return false; }
            if (index === 1) { return true; }
            if (index === 2) { return player.upgrades[3][2] === 1; }
            if (index === 3) { return player.upgrades[3][4] === 1; }
            if (index === 4) { return player.upgrades[3][6] === 1; }
        } else if (stageIndex === 4) {
            if (player.collapse.mass < global.collapseInfo.unlockB[index]) { return false; }
            if (index === 1 || index === 4) { return true; }
            if (index === 2) { return player.upgrades[4][1] === 1; }
            if (index === 3) { return player.upgrades[4][2] === 1; }
        } else if (stageIndex === 5) {
            if (player.collapse.mass < global.collapseInfo.unlockG[index]) { return false; }
            if (index === 1) {
                return player.milestones[2][0] >= 3;
            } else if (index === 2) {
                return player.milestones[3][0] >= 3;
            } else if (index === 3) {
                return player.strangeness[5][6] >= 1;
            }
        }
    }

    return false;
};

//Only checks if Upgrade is unlocked
export const checkUpgrade = (upgrade: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements' | 'strangeness'): boolean => {
    if (stageIndex === 3 && player.accretion.rank === 0 && type !== 'strangeness') { return false; }

    switch (type) {
        case 'upgrades':
            if (stageIndex === 1) {
                if (upgrade > 3) { return player.discharge.current >= 3; }
                return true;
            } else if (stageIndex === 2) {
                if (upgrade === 6 && player.strangeness[2][2] < 3) { return false; }
                return true;
            } else if (stageIndex === 3) {
                if (upgrade === 8 && player.strangeness[3][2] < 3) { return false; }
                return player.accretion.rank >= global.accretionInfo.rankU[upgrade];
            } else if (stageIndex === 4) {
                if (upgrade === 3 && player.strangeness[4][2] < 1) { return false; }
                if (upgrade >= 2 && player.upgrades[4][upgrade - 1] !== 1) { return false; } //Just in case
                return player.collapse.mass >= global.collapseInfo.unlockU[upgrade];
            } else if (stageIndex === 5) {
                if (upgrade === 2) { return player.buildings[5][3].current >= 1; }
                return true;
            }
            break;
        case 'researches':
            if (stageIndex === 1) {
                return player.upgrades[1][3] === 1;
            } else if (stageIndex === 2) {
                return true;
            } else if (stageIndex === 3) {
                return player.accretion.rank >= global.accretionInfo.rankR[upgrade];
            } else if (stageIndex === 4) {
                if (upgrade === 3 && player.strangeness[4][2] < 2) { return false; }
                return player.collapse.mass >= global.collapseInfo.unlockR[upgrade];
            } else if (stageIndex === 5) {
                return true;
            }
            break;
        case 'researchesExtra':
            /*if (stageIndex === 1) {
                return false;
            } else*/ if (stageIndex === 2) {
                return player.vaporization.clouds > 1;
            } else if (stageIndex === 3) {
                return player.accretion.rank >= global.accretionInfo.rankE[upgrade];
            } else if (stageIndex === 4) {
                if (upgrade === 1 && player.strangeness[4][2] < 3) { return false; }
                return true;
            }
            break;
        case 'researchesAuto': //Other cases are handled by max level being 0
            if (stageIndex === 1 && player.upgrades[1][3] < 1) { return false; }
            return stageIndex === global.researchesAutoInfo.autoStage[upgrade];
        case 'ASR':
            if (stageIndex === 1 && player.upgrades[1][3] < 1) { return false; }
            return true;
        case 'elements':
            if (!global.stageInfo.activeAll.includes(4)) { return false; }
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
            if (stageIndex === 5 && upgrade === 6 && player.strangeness[5][5] < 1) { return false; }
            return player.milestones[4][0] >= 3;
    }

    return false;
};

//Checks if upgrade/building is allowed to be reset (later can be added up to which amount if needed)
export const allowedToBeReset = (check: number, stageIndex: number, type: 'structures' | 'upgrades' | 'researchesExtra'): boolean => {
    switch (type) {
        case 'structures':
            if (stageIndex === 5 && check === 3) { return false; }
            break;
        case 'upgrades':
            if (stageIndex === 2) {
                if (check === 1) { return false; }
            } else if (stageIndex === 4) {
                if (player.strangeness[4][4] >= 1 || player.collapse.mass >= 10 || check === 0) { return false; }
            } else if (stageIndex === 5) {
                if (check === 2) { return false; }
            }
            break;
        case 'researchesExtra':
            if (stageIndex === 4 && check === 0) { return false; }
    }

    return true;
};

//Check and award Milestone reward
export const milestoneCheck = (index: number, stageIndex: number) => {
    const need = global.milestonesInfo[stageIndex].need[index][player.milestones[stageIndex][index]];
    if (need === undefined || player.strange[0].total < 1) { return; }
    if (stageIndex === 5 && player.strangeness[5][8] < 1) { return; }
    let award = false;

    if (stageIndex === 1) {
        if (index === 0) {
            award = player.buildings[1][0].current >= need;
        } else if (index === 1) {
            award = player.discharge.energy >= need;
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
    } else if (stageIndex === 5) {
        if (index === 0) {
            award = global.collapseInfo.trueStars >= need;
        } else if (index === 1) {
            award = player.buildings[5][3].current >= need;
        }
    }

    if (award) {
        const reward = global.milestonesInfo[stageIndex].quarks[index][player.milestones[stageIndex][index]];
        player.strange[0].true += reward;
        player.strange[0].total += reward;
        player.milestones[stageIndex][index]++;
        getUpgradeDescription(index, stageIndex, 'milestones');
    }
};
