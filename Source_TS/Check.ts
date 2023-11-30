import type Overlimit from './Limit';
import { global, player } from './Player';

export const checkTab = (tab: string, subtab = null as null | string): boolean => {
    switch (tab) {
        case 'stage':
            if (subtab === 'Advanced') { return player.stage.true >= 6 || global.strangeInfo.instability > 0; }
            return subtab === 'Structures' || subtab === null;
        case 'Elements':
        case 'upgrade':
            if (player.stage.true < 2 && player.discharge.energyMax < 9) { return false; }
            if (subtab === 'Elements' || tab === 'Elements') { return global.stageInfo.activeAll.includes(4) && player.upgrades[4][1] === 1; }
            return subtab === 'Upgrades' || subtab === null;
        case 'strangeness':
            if (player.strange[0].total <= 0 && (!player.inflation.vacuum || player.stage.current < 5)) { return false; }
            if (subtab === 'Milestones') { return !player.inflation.vacuum; }
            return subtab === 'Matter' || subtab === null;
        case 'settings':
            if (subtab === 'History') { return player.strange[0].total > 0; }
            return subtab === 'Settings' || subtab === 'Stats' || subtab === null;
    }

    return false;
};

export const checkBuilding = (index: number, stageIndex: number): boolean => {
    if (index < 1 || global.buildingsInfo.maxActive[stageIndex] < index + 1) { return false; }

    if (stageIndex === 1) {
        return true;
    } else if (stageIndex === 2) {
        return true;
    } else if (stageIndex === 3) {
        if (player.accretion.rank === 0) { return false; }
        if (index === 1) { return true; }
        if (index === 2) { return player.upgrades[3][2] === 1; }
        if (index === 3) { return player.upgrades[3][4] === 1; }
        if (index === 4) { return player.upgrades[3][8] === 1; }
        if (index === 5) { return player.upgrades[3][11] === 1; }
    } else if (stageIndex === 4) {
        if (player.collapse.mass < global.collapseInfo.unlockB[index] && player.buildings[5][3].true < 1) { return false; }
        if (index === 1) { return true; }
        if (index === 2) { return player.researchesExtra[4][0] >= 1; }
        if (index === 3) { return player.researchesExtra[4][0] >= 2; }
        if (index === 4) { return player.researchesExtra[4][0] >= 3; }
        if (index === 5) { return player.elements[26] >= 1; }
    } else if (stageIndex === 5) {
        if (index === 1) { return player.inflation.vacuum || player.milestones[2][0] >= 7; }
        if (index === 2) { return player.inflation.vacuum || player.milestones[3][0] >= 7; }
        if (index === 3) { return player.researchesExtra[5][0] >= 1; }
    }

    return false;
};

export const checkUpgrade = (upgrade: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements' | 'strangeness'): boolean => {
    if (upgrade < 0) { return false; }
    switch (type) { //Some cases are handled by max level being 0
        case 'upgrades':
            if (global.upgradesInfo[stageIndex].maxActive < upgrade + 1) { return false; }
            if (stageIndex === 1) {
                if (upgrade === 0 || upgrade === 1) { return player.inflation.vacuum; }
                if (upgrade > 5) { return player.upgrades[1][5] === 1; }
                return true;
            } else if (stageIndex === 2) {
                if (upgrade === 7) { return player.strangeness[2][2] >= 3; }
                if (upgrade === 8) { return player.strangeness[2][8] >= 3; }
                return true;
            } else if (stageIndex === 3) {
                if (player.accretion.rank < global.accretionInfo.rankU[upgrade] || player.accretion.rank === 0) { return false; }
                if (upgrade === 7) { return player.strangeness[3][2] >= 3; }
                return true;
            } else if (stageIndex === 4) {
                if (player.collapse.mass < global.collapseInfo.unlockU[upgrade] && player.buildings[5][3].true < 1) { return false; }
                if (upgrade === 2) { return player.upgrades[4][1] === 1; }
                if (upgrade === 3) { return player.strangeness[4][2] >= 2 && player.upgrades[4][2] === 1 && player.collapse.stars[1] > 0; }
                return true;
            } else if (stageIndex === 5) {
                if (upgrade === 0) { return player.inflation.vacuum || player.milestones[2][0] >= 7; }
                if (upgrade === 1) { return player.inflation.vacuum || player.milestones[3][0] >= 7; }
                if (upgrade === 2) { return player.buildings[5][3].true >= 1; }
            }
            break;
        case 'researches':
            if (global.researchesInfo[stageIndex].maxActive < upgrade + 1) { return false; }
            if (stageIndex === 1) {
                return player.upgrades[1][5] === 1;
            } else if (stageIndex === 2) {
                return true;
            } else if (stageIndex === 3) {
                return player.accretion.rank >= global.accretionInfo.rankR[upgrade] && player.accretion.rank !== 0;
            } else if (stageIndex === 4) {
                if (player.collapse.mass < global.collapseInfo.unlockR[upgrade] && player.buildings[5][3].true < 1) { return false; }
                if (upgrade === 3) { return (player.collapse.stars[0] > 0 || player.buildings[5][3].true >= 1) && player.strangeness[4][2] >= 1; }
                if (upgrade === 4) { return player.collapse.stars[2] > 0 || player.buildings[5][3].true >= 1; }
                return true;
            } else if (stageIndex === 5) {
                if (upgrade === 0) { return player.inflation.vacuum || player.milestones[2][0] >= 7; }
                if (upgrade === 1) { return player.inflation.vacuum || player.milestones[3][0] >= 7; }
            }
            break;
        case 'researchesExtra':
            if (global.researchesExtraInfo[stageIndex].maxActive < upgrade + 1) { return false; }
            if (stageIndex === 1) {
                if (upgrade === 1) { return player.researchesExtra[1][2] >= 2; }
                if (upgrade === 3) { return player.researchesExtra[1][2] >= 1; }
                if (upgrade === 4) { return player.accretion.rank >= 6; }
                return player.upgrades[1][5] === 1;
            } else if (stageIndex === 2) {
                if (upgrade === 3) { return player.accretion.rank >= 6; }
                return player.upgrades[2][2] === 1;
            } else if (stageIndex === 3) {
                if (player.accretion.rank < global.accretionInfo.rankE[upgrade] || player.accretion.rank === 0) { return false; }
                if (upgrade === 4) { return player.researchesExtra[1][2] >= 2; }
                return true;
            } else if (stageIndex === 4) {
                if (upgrade === 1) { return player.collapse.stars[0] > 0 || player.buildings[5][3].true >= 1; }
                if (upgrade === 2) { return (player.collapse.stars[0] > 0 || player.buildings[5][3].true >= 1) && player.strangeness[4][2] >= 3; }
                return true;
            } else if (stageIndex === 5) {
                if (upgrade === 0) { return player.inflation.vacuum || player.milestones[5][0] >= 8; }
            }
            break;
        case 'researchesAuto': {
            if (!player.inflation.vacuum) { return false; }
            const autoStage = global.researchesAutoInfo.autoStage[upgrade][player.researchesAuto[upgrade]]; //Can be undefined
            return autoStage === stageIndex || (stageIndex === 5 && autoStage === 4);
        }
        case 'ASR':
            if (stageIndex === 1) { return player.upgrades[1][5] >= 1; }
            if (stageIndex === 3) { return player.accretion.rank !== 0; }
            return true;
        case 'elements':
            if (upgrade >= 27) { return player.upgrades[4][3] === 1; }
            if (upgrade >= 11) { return player.upgrades[4][2] === 1 && (player.collapse.stars[1] > 0 || player.buildings[5][3].true >= 1); }
            if (upgrade >= 6) { return player.upgrades[4][2] === 1; }
            return player.upgrades[4][1] === 1; //&& upgrade !== 0;
        case 'strangeness':
            if (global.strangenessInfo[stageIndex].maxActive < upgrade + 1) { return false; }
            if (player.inflation.vacuum) {
                if (stageIndex === 1) {
                    if (upgrade === 7) { return player.challenges.void[1] >= 1; }
                    if (upgrade === 8) { return player.challenges.void[1] >= 2; }
                    if (upgrade === 9) { return player.challenges.void[4] >= 2; }
                } else if (stageIndex === 2) {
                    if (upgrade === 7) { return player.challenges.void[1] >= 3; }
                    if (upgrade === 8) { return player.challenges.void[2] >= 1; }
                    if (upgrade === 9) { return player.challenges.void[2] >= 2; }
                } else if (stageIndex === 3) {
                    if (upgrade === 8) { return player.challenges.void[4] >= 4; }
                    if (upgrade === 9) { return player.challenges.void[5] >= 2; }
                } else if (stageIndex === 4) {
                    if (upgrade === 8) { return player.challenges.void[4] >= 3; }
                    if (upgrade === 9) { return player.challenges.void[5] >= 1; }
                } else if (stageIndex === 5) {
                    if (upgrade === 8) { return player.challenges.void[3] >= 5; }
                    if ([3, 4, 6, 7].includes(upgrade)) { return player.strangeness[5][5] >= 1; }
                }
                return true;
            }
            if (((stageIndex === 1 || stageIndex === 2) && upgrade < 6) || ((stageIndex === 3 || stageIndex === 4) && upgrade < 7)) { return true; }
            if (player.milestones[4][0] < 8) { return false; }
            if (stageIndex === 5) {
                if (upgrade === 3) { return player.milestones[2][0] >= 7; }
                if (upgrade === 4) { return player.milestones[3][0] >= 7; }
                if (upgrade === 5 || upgrade === 6) { return player.milestones[2][0] >= 7 || player.milestones[3][0] >= 7; }
            }
            return true;
    }

    return false;
};

export const allowedToBeReset = (check: number, stageIndex: number, type: 'structures' | 'upgrades' | 'researches' | 'researchesExtra' | 'elements'): boolean => {
    switch (type) {
        case 'structures':
            if (stageIndex === 5 && check === 3) { return false; }
            break;
        case 'upgrades':
            if (stageIndex === 1) {
                return check !== 5;
            } else if (stageIndex === 2) {
                return check !== 2;
            } else if (stageIndex === 4) {
                return false;
            }
            break;
        case 'researches':
            if (stageIndex === 1) {
                return check !== 3;
            }
            break;
        case 'researchesExtra':
            if (stageIndex === 1) {
                return check !== 2;
            } else if (stageIndex === 2) {
                return check > 2;
            } else if (stageIndex === 4) {
                return check !== 0;
            } else if (stageIndex === 5) {
                return check !== 0;
            }
            break;
        case 'elements':
            return check !== 26;
    }

    return true;
};

export const milestoneGetValue = (index: number, stageIndex: number): number | Overlimit => {
    if (stageIndex === 1) {
        if (index === 0) { return player.buildings[1][0].total; }
        if (index === 1) { return player.discharge.energy; }
    } else if (stageIndex === 2) {
        if (index === 0) { return player.buildings[2][1].total; }
        if (index === 1) { return player.buildings[2][2].current; }
    } else if (stageIndex === 3) {
        if (index === 0) { return player.buildings[3][0].total; }
        if (index === 1) { return player.buildings[3][4].true; }
    } else if (stageIndex === 4) {
        if (index === 0) { return player.collapse.mass; }
        if (index === 1) { return player.collapse.stars[2]; }
    } else if (stageIndex === 5) {
        if (index === 0) { return global.collapseInfo.trueStars; }
        if (index === 1) { return player.buildings[5][3].true; }
    }
    throw new TypeError(`Milestone s${stageIndex}-i${index} doesn't exist`);
};
export const milestoneCheck = (index: number, stageIndex: number): boolean => {
    if (player.inflation.vacuum) {
        return false;
    } else if (player.stage.resets < 4 || (stageIndex === 5 && player.strangeness[5][5] < 1)) { return false; }
    const need = global.milestonesInfo[stageIndex].need[index];
    if (!need.notEqual('0')) { return false; }

    return need.lessOrEqual(milestoneGetValue(index, stageIndex));
};
