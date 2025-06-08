import Overlimit from './Limit';
import { global, player } from './Player';
import type { gameTab } from './Types';

export const checkTab = (tab: gameTab, subtab = null as null | string): boolean => {
    switch (tab) {
        case 'stage':
            if (subtab === 'Advanced') { return player.stage.true >= 6; }
            return subtab === 'Structures' || subtab === null;
        case 'Elements':
        case 'upgrade':
            if (player.stage.true < 2 && player.discharge.energyMax < 12) { return false; }
            if (subtab === 'Elements' || tab === 'Elements') { return global.stageInfo.activeAll.includes(4) && player.upgrades[4][1] === 1; }
            return subtab === 'Upgrades' || subtab === null;
        case 'strangeness':
            if (player.stage.true < 7 && player.strange[0].total <= 0 && (!player.inflation.vacuum || player.stage.current < 5)) { return false; }
            if (subtab === 'Milestones') { return player.stage.true >= 8 || (player.stage.true === 7 && player.event) || !player.inflation.vacuum; }
            return subtab === 'Matter' || subtab === null;
        case 'inflation':
            if (player.stage.true < 7) { return false; }
            return subtab === 'Researches' || subtab === 'Milestones' || subtab === null;
        case 'settings':
            if (subtab === 'History') { return player.stage.true >= 7 || player.strange[0].total > 0; }
            return subtab === 'Settings' || subtab === 'Stats' || subtab === null;
        default:
            return false;
    }
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
        if (player.collapse.mass < global.collapseInfo.unlockB[index] && player.researchesExtra[5][0] < 1) { return false; }
        if (index === 1) { return true; }
        if (index === 2) { return player.researchesExtra[4][0] >= 1; }
        if (index === 3) { return player.researchesExtra[4][0] >= 2; }
        if (index === 4) { return player.researchesExtra[4][0] >= 3; }
        if (index === 5) { return player.elements[26] >= 1 && player.challenges.active !== 0; }
    } else if (stageIndex === 5) {
        if (index === 1) { return player.inflation.vacuum || player.milestones[2][0] >= 7; }
        if (index === 2) { return player.inflation.vacuum || player.milestones[3][0] >= 7; }
        if (index === 3) { return player.researchesExtra[5][0] >= 1; }
    } else if (stageIndex === 6) {
        return player.inflation.vacuum;
    }

    return false;
};

export const checkUpgrade = (upgrade: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements' | 'strangeness' | 'inflations'): boolean => {
    switch (type) { //Some cases are handled by max level being 0
        case 'upgrades':
            if (global.upgradesInfo[stageIndex].maxActive < upgrade + 1) { return false; }
            if (stageIndex === 1) {
                if (upgrade === 0 || upgrade === 1) { return player.inflation.vacuum; }
                if (upgrade === 3) { return player.upgrades[1][5] === 1 || player.buildings[1][player.inflation.vacuum ? 4 : 2].total.moreThan('0'); }
                if (upgrade === 4) { return player.upgrades[1][5] === 1 || player.buildings[1][player.inflation.vacuum ? 5 : 3].total.moreThan('0'); }
                if (upgrade > 5) {
                    if (player.upgrades[1][5] !== 1) { return false; }
                    if (upgrade === 10) { return player.strangeness[5][10] >= 1; }
                }
                return true;
            } else if (stageIndex === 2) {
                if (upgrade === 0) { return player.buildings[2][1].true >= 1 || player.buildings[2][2].true >= 1; }
                if (upgrade === 7) { return player.strangeness[2][2] >= 3; }
                if (upgrade === 8) { return player.strangeness[2][8] >= 3; }
                return true;
            } else if (stageIndex === 3) {
                if (player.accretion.rank < global.accretionInfo.rankU[upgrade] || player.accretion.rank === 0) { return false; }
                if (upgrade === 7) { return player.strangeness[3][2] >= 3; }
                if (upgrade === 13) { return player.strangeness[5][10] >= 3; }
                return true;
            } else if (stageIndex === 4) {
                const galaxy = player.researchesExtra[5][0] >= 1;
                if (!galaxy && player.collapse.mass < global.collapseInfo.unlockU[upgrade]) { return false; }
                if (upgrade === 2) { return player.upgrades[4][1] === 1; }
                if (upgrade === 3) { return player.strangeness[4][2] >= 3 && player.upgrades[4][2] === 1 && (galaxy || player.collapse.stars[1] > 0); }
                if (upgrade === 4) { return player.strangeness[4][9] >= 1 && player.upgrades[4][3] === 1; }
                return true;
            } else if (stageIndex === 5) {
                if (player.buildings[6][1].true < global.mergeInfo.unlockU[upgrade]) { return false; }
                if (upgrade === 0) { return player.inflation.vacuum || player.milestones[2][0] >= 7; }
                if (upgrade === 1) { return player.inflation.vacuum || player.milestones[3][0] >= 7; }
                if (upgrade === 2) { return player.buildings[5][3].true >= 1; }
                if (upgrade === 3) { return player.inflation.vacuum ? player.accretion.rank >= 7 : player.milestones[5][1] >= 8; }
                return player.accretion.rank >= 7;
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
                const galaxy = player.researchesExtra[5][0] >= 1;
                if (!galaxy && player.collapse.mass < global.collapseInfo.unlockR[upgrade]) { return false; }
                if (upgrade === 3) { return (galaxy || player.collapse.stars[0] > 0) && player.strangeness[4][2] >= 1; }
                if (upgrade === 4) { return galaxy || player.collapse.stars[2] > 0; }
                if (upgrade === 5) { return (galaxy || player.collapse.stars[2] > 0) && player.strangeness[4][9] >= 3; }
                return true;
            } else if (stageIndex === 5) {
                if (player.buildings[6][1].true < global.mergeInfo.unlockR[upgrade]) { return false; }
                if (upgrade === 0) { return player.inflation.vacuum || player.milestones[2][0] >= 7; }
                if (upgrade === 1) { return player.inflation.vacuum || player.milestones[3][0] >= 7; }
                return player.accretion.rank >= 7;
            }
            break;
        case 'researchesExtra':
            if (global.researchesExtraInfo[stageIndex].maxActive < upgrade + 1) { return false; }
            if (stageIndex === 1) {
                if (upgrade === 1) { return player.researchesExtra[1][2] >= 2; }
                if (upgrade === 3) { return player.researchesExtra[1][2] >= 1; }
                if (upgrade === 4) { return player.accretion.rank >= 6; }
                if (upgrade === 5) { return player.accretion.rank >= 6 && player.strangeness[5][10] >= 1; }
                return player.upgrades[1][5] === 1;
            } else if (stageIndex === 2) {
                if (upgrade === 3) { return player.accretion.rank >= 6; }
                if (upgrade === 4) { return player.accretion.rank >= 7 && player.strangeness[5][10] >= 2; }
                return player.upgrades[2][2] === 1;
            } else if (stageIndex === 3) {
                if (player.accretion.rank < global.accretionInfo.rankE[upgrade] || player.accretion.rank === 0) { return false; }
                if (upgrade === 4) { return player.researchesExtra[1][2] >= 2; }
                if (upgrade === 5) { return player.strangeness[5][10] >= 3; }
                return true;
            } else if (stageIndex === 4) {
                if (upgrade === 1) { return player.collapse.stars[0] > 0 || player.researchesExtra[5][0] >= 1; }
                if (upgrade === 2) { return (player.collapse.stars[0] > 0 || player.researchesExtra[5][0] >= 1) && player.strangeness[4][2] >= 2; }
                if (upgrade === 3) { return (player.collapse.stars[1] > 0 || player.researchesExtra[5][0] >= 1) && player.strangeness[4][9] >= 2; }
                return true;
            } else if (stageIndex === 5) {
                if (player.buildings[6][1].true < global.mergeInfo.unlockE[upgrade]) { return false; }
                if (upgrade === 0) { return (player.inflation.vacuum || player.milestones[4][1] >= 8) && player.strangeness[5][3] >= 1; }
                return player.accretion.rank >= 7;
            }
            break;
        case 'researchesAuto': {
            const autoStage = global.researchesAutoInfo.autoStage[upgrade][player.researchesAuto[upgrade]]; //Can be undefined
            if (!(autoStage === stageIndex || (autoStage === 4 && stageIndex === 5))) { return false; }
            if (upgrade === 0) { return player.inflation.vacuum; }
            if (upgrade === 1) { return player.inflation.vacuum && player.accretion.rank >= 6; }
            return true;
        }
        case 'ASR':
            if (stageIndex === 1) { return player.upgrades[1][5] >= 1; }
            if (stageIndex === 3) { return player.accretion.rank >= 1; }
            return true;
        case 'elements':
            if (upgrade >= 29) { return player.upgrades[4][4] === 1 && player.buildings[6][1].true >= upgrade - 29; }
            if (upgrade >= 27) { return player.upgrades[4][3] === 1; }
            if (upgrade >= 11) { return player.upgrades[4][2] === 1 && (player.collapse.stars[1] > 0 || player.researchesExtra[5][0] >= 1); }
            if (upgrade >= 6) { return player.upgrades[4][2] === 1; }
            return player.upgrades[4][1] === 1 && upgrade > 0;
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
                    if (upgrade === 9) { return player.challenges.void[5] >= 1; }
                } else if (stageIndex === 4) {
                    if (upgrade === 8) { return player.challenges.void[4] >= 3; }
                    if (upgrade === 9) { return player.challenges.void[4] >= 5; }
                } else if (stageIndex === 5) {
                    if (upgrade === 4) { return player.challenges.void[4] >= 1; }
                    if (upgrade === 8) { return player.challenges.void[3] >= 5; }
                    if (upgrade === 9) { return player.challenges.void[3] >= 6; }
                    if (upgrade === 10) { return player.challenges.void[2] >= 3; }
                    if ([0, 1, 5, 7].includes(upgrade)) { return player.strangeness[5][3] >= 1; }
                }
            } else {
                if (player.challenges.active === 1) {
                    if (stageIndex === 1) {
                        if (player.milestones[1][1] >= 6) { return false; }
                    } else if (stageIndex === 2) {
                        if (player.milestones[2][1] >= 7) { return false; }
                    } else if (stageIndex === 3) {
                        if (player.milestones[3][1] >= 7) { return false; }
                    }
                }
                if (((stageIndex === 1 || stageIndex === 2) && upgrade < 6) || ((stageIndex === 3 || stageIndex === 4) && upgrade < 7)) { return true; }
                if (player.milestones[4][0] < 8) { return false; }
                if (stageIndex === 5) {
                    if (upgrade === 2) { return player.milestones[5][0] >= 8; }
                    if (upgrade === 4) { return player.milestones[4][1] >= 8; }
                    if ([0, 1, 3, 5].includes(upgrade)) { return player.milestones[2][0] >= 7 || player.milestones[3][0] >= 7; }
                }
            }
            return true;
        case 'inflations':
            if (stageIndex === 0) {
                if (upgrade === 0) { return player.stage.true >= 7; }
                if (upgrade === 3 || upgrade === 4) { return player.stage.true >= 8 || player.event; }
                if (upgrade === 5) { return player.challenges.supervoid[3] >= 3; }
            } else {
                if (upgrade === 0) { return player.challenges.supervoid[1] >= 1; }
            }
            return true;
    }

    return false;
};

export const allowedToBeReset = (check: number, stageIndex: number, type: 'structures' | 'upgrades' | 'researches' | 'researchesExtra' | 'elements'): boolean => {
    switch (type) {
        case 'structures':
            if (stageIndex === 1) { return check !== 1 || !player.inflation.vacuum || player.challenges.supervoid[3] < 1; }
            if (stageIndex === 5) { return check !== 3; }
            if (stageIndex === 6) { return check < 1; }
            break;
        case 'upgrades':
            if (stageIndex === 1) { return check !== 5; }
            if (stageIndex === 2) { return check !== 2; }
            if (stageIndex === 4) { return false; }
            if (stageIndex === 5) { return check !== 3; }
            break;
        case 'researches':
            if (stageIndex === 1) { return check !== 3; }
            break;
        case 'researchesExtra':
            if (stageIndex === 1) { return check !== 2; }
            if (stageIndex === 2) { return check > 2; }
            if (stageIndex === 4) { return check !== 0; }
            if (stageIndex === 5) { return false; }
            break;
        case 'elements':
            return ![26, 29, 30].includes(check);
    }

    return true;
};

export const milestoneGetValue = (index: number, stageIndex: number): number | Overlimit => {
    if (stageIndex === 1) {
        if (index === 0) { return player.buildings[1][player.inflation.vacuum ? 1 : 0].total; }
        if (index === 1) { return player.discharge.energy; }
    } else if (stageIndex === 2) {
        if (index === 0) { return player.inflation.vacuum ? player.vaporization.clouds : player.buildings[2][1].total; }
        if (index === 1) { return player.inflation.vacuum ? player.buildings[2][1].total : player.buildings[2][2].current; }
    } else if (stageIndex === 3) {
        if (index === 0) { return player.buildings[3][0].total; }
        if (index === 1) { return player.buildings[3][4].true + player.buildings[3][5].true; }
    } else if (stageIndex === 4) {
        if (index === 0) { return player.buildings[4][0].total; }
        if (index === 1) { return player.inflation.vacuum ? player.collapse.stars[2] : global.collapseInfo.newMass; }
    } else if (stageIndex === 5) {
        if (index === 0) {
            if (!player.inflation.vacuum) { return global.collapseInfo.trueStars; }
            const stars = player.buildings[4];
            return new Overlimit(stars[1].total).plus(stars[2].total, stars[3].total, stars[4].total, stars[5].total);
        }
        if (index === 1) { return player.buildings[5][3].true; }
    }
    return 0;
};
export const milestoneCheck = (index: number, stageIndex: number): boolean => {
    const pointer = global.milestonesInfo[stageIndex];
    if (player.inflation.vacuum) {
        if (player.challenges.active !== 0 || player.tree[0][4] < 1 ||
            global.challengesInfo[0].time < player.time[player.challenges.super ? 'vacuum' : 'stage']) { return false; }
    } else if (pointer.scaling[index].length <= player.milestones[stageIndex][index] ||
        (player.stage.true < 7 && player.stage.resets < 4) ||
        (stageIndex === 5 && player.milestones[4][index] < 8) ||
        (player.tree[0][4] < 1 && pointer.reward[index] < player.time.stage)
    ) { return false; }
    return pointer.need[index].lessOrEqual(milestoneGetValue(index, stageIndex));
};
