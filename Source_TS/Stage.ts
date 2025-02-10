import { checkBuilding, checkUpgrade, milestoneCheck } from './Check';
import Overlimit, { compareFunc } from './Limit';
import { changeRewardType, getId, simulateOffline } from './Main';
import { effectsCache, global, logAny, player, playerStart } from './Player';
import { cloneBeforeReset, loadFromClone, reset, resetStage, resetVacuum } from './Reset';
import { Confirm, Notify, globalSave, playEvent } from './Special';
import type { calculateEffectsType } from './Types';
import { format, numbersUpdate, setRemnants, stageUpdate, switchTab, visualTrueStageUnlocks, visualUpdate, visualUpdateResearches, visualUpdateUpgrades } from './Update';
import { prepareVacuum, switchVacuum } from './Vacuum';

/** Normal game tick */
export const timeUpdate = (tick: number, timeWarp = 0) => {
    const { time } = player;
    const { auto, buildings: autoBuy } = player.toggles;
    const { maxActive } = global.buildingsInfo;
    const activeAll = global.stageInfo.activeAll;

    let passedSeconds: number;
    if (timeWarp > 0) {
        const extraTime = Math.min(tick, timeWarp);
        passedSeconds = extraTime;
        timeWarp -= extraTime;
    } else {
        const currentTime = Date.now();
        passedSeconds = (currentTime - time.updated) / 1000;
        time.updated = currentTime;
        time.export[0] += passedSeconds;
        global.lastSave += passedSeconds;
        if (passedSeconds > tick) {
            if (passedSeconds > tick * 600) { return void simulateOffline(passedSeconds); }
            timeWarp = passedSeconds - tick;
            passedSeconds = tick;
        } else if (passedSeconds <= 0) {
            time.offline += passedSeconds;
            return;
        }
        time.online += passedSeconds;
    }
    const trueSeconds = passedSeconds;
    time.stage += trueSeconds;
    time.vacuum += trueSeconds;
    time.universe += trueSeconds;

    global.inflationInfo.instability = calculateEffects.inflation3() ** player.inflation.tree[3];
    passedSeconds *= assignBuildingsProduction.globalSpeed();
    player.stage.time += passedSeconds;
    player.inflation.time += passedSeconds;
    player.inflation.age += passedSeconds;

    if (player.toggles.normal[3]) { exitChallengeAuto(); }
    if (!player.inflation.vacuum) {
        if (activeAll.includes(4)) { stageResetCheck(5, trueSeconds); }
        if (auto[0]) {
            if (activeAll.includes(3)) { stageResetCheck(3, 0); }
            if (activeAll.includes(2)) { stageResetCheck(2, 0); }
            if (activeAll.includes(1)) { stageResetCheck(1, 0); }
        }
    } else { stageResetCheck(5, trueSeconds); }

    const vacuum = player.inflation.vacuum;
    assignBuildingsProduction.globalCache();
    if (activeAll.includes(6)) {
        gainBuildings(0, 6, passedSeconds); //Dark matter
    }
    if (activeAll.includes(4)) {
        if (auto[8]) { autoElementsBuy(); }
        if (activeAll.includes(5)) {
            if (player.strangeness[5][3] >= 1 || player.buildings[6][1].current.moreOrEqual('3')) {
                if (auto[5]) { autoUpgradesBuy(5); }
                if (auto[6]) { autoResearchesBuy('researches', 5); }
                if (auto[7]) { autoResearchesBuy('researchesExtra', 5); }
            }
            for (let i = maxActive[5] - 1; i >= 1; i--) {
                if (autoBuy[5][i]) { buyBuilding(i, 5, 0, true); }
            }
            assignBuildingsProduction.stage5Cache();
            gainBuildings(0, 5, passedSeconds); //Brown dwarfs
            const research = player.researches[5][0];
            if (research >= 1) { gainBuildings(1, 5, passedSeconds); } //Main sequence
            if (research >= 2) { gainBuildings(2, 5, passedSeconds); } //Red supergiants
            if (research >= 3) { gainBuildings(3, 5, passedSeconds); } //Blue hypergiants
            if (research >= 4 && player.challenges.active !== 0) { gainBuildings(4, 5, passedSeconds); } //Quasi-stars
        } else { assignBuildingsProduction.stage5Cache(); }
        if (auto[5]) { autoUpgradesBuy(4); }
        if (auto[6]) { autoResearchesBuy('researches', 4); }
        if (auto[7]) { autoResearchesBuy('researchesExtra', 4); }
        assignBuildingsProduction.stage4Cache();
        for (let i = maxActive[4] - 1; i >= 1; i--) {
            if (autoBuy[4][i]) { buyBuilding(i, 4, 0, true); }
            gainBuildings(i - 1, 4, passedSeconds); //Elements
        }
        assignBuildingsProduction.S4Levels();
        awardMilestone(0, 5);
        awardMilestone(0, 4);
        if (!collapseResetCheck(true) && vacuum && auto[9]) { mergeResetCheck(true); }
        awardMilestone(1, 4);
    } else if (vacuum) { assignResetInformation.solarHardcap(); }
    if (activeAll.includes(3)) {
        if (auto[3]) { rankResetCheck(true); }
        if (auto[5]) { autoUpgradesBuy(3); }
        if (auto[6]) { autoResearchesBuy('researches', 3); }
        if (auto[7]) { autoResearchesBuy('researchesExtra', 3); }
        assignBuildingsProduction.stage3Cache();
        if (vacuum) { global.accretionInfo.disableAuto = player.researchesExtra[3][5] < 1 && player.strangeness[1][8] >= 2 && assignBuildingsProduction.S3Build1(true) >= calculateEffects.dustHardcap(); }
        for (let i = 1; i < maxActive[3]; i++) {
            if (autoBuy[3][i]) { buyBuilding(i, 3, 0, true); }
        }
        gainBuildings(2, 3, passedSeconds); //Planetesimals
        gainBuildings(1, 3, passedSeconds); //Cosmic dust
        if (!vacuum) { gainBuildings(0, 3, passedSeconds); } //Mass
    }
    if (activeAll.includes(2)) {
        vaporizationResetCheck(trueSeconds);
        if (auto[5]) { autoUpgradesBuy(2); }
        if (auto[6]) { autoResearchesBuy('researches', 2); }
        if (auto[7]) { autoResearchesBuy('researchesExtra', 2); }
        for (let i = maxActive[2] - 1; i >= 1; i--) {
            if (autoBuy[2][i]) { buyBuilding(i, 2, 0, true); }
        }
        gainBuildings(1, 2, passedSeconds); //Drops
        if (!vacuum) { gainBuildings(0, 2, passedSeconds); } //Moles
        awardMilestone(1, 2);
        awardMilestone(0, 2);
    }
    if (activeAll.includes(1)) {
        if (auto[5]) { autoUpgradesBuy(1); }
        if (auto[6]) { autoResearchesBuy('researches', 1); }
        if (auto[7]) { autoResearchesBuy('researchesExtra', 1); }
        assignBuildingsProduction.stage1Cache();
        gainBuildings(5, 1, passedSeconds); //Molecules
        for (let i = maxActive[1] - 1; i >= 1; i--) {
            if (autoBuy[1][i]) { buyBuilding(i, 1, 0, true); }
            gainBuildings(i - 1, 1, passedSeconds); //Rest of Microworld
        }
        awardMilestone(1, 1);
        awardMilestone(0, 1);
        dischargeResetCheck(true);
    }

    if (timeWarp > 0) { timeUpdate(tick, timeWarp); }
};

export const calculateEffects: calculateEffectsType = {
    effectiveEnergy: () => {
        let energy = player.discharge.energy;
        if (player.upgrades[1][10] === 1) { energy *= 2; }
        if (player.inflation.vacuum && player.inflation.tree[4] >= 1) { energy *= global.milestonesInfo[1].reward[1]; }
        return Math.max(energy, 1);
    },
    effectiveGoals: () => {
        let goals = player.discharge.current + (player.strangeness[1][3] / 2);
        if (player.inflation.vacuum) { goals += player.inflation.tree[5]; }
        return goals;
    },
    dischargeScaling: (research = player.researches[1][3], strangeness = player.strangeness[1][2], inflation = player.inflation.tree[5]) => {
        let scale = (2 * research) + (strangeness / 2);
        if (player.inflation.vacuum) { scale += inflation; }
        return 10 - scale;
    },
    dischargeCost: (scaling = calculateEffects.dischargeScaling()) => {
        let next = scaling ** player.discharge.current;
        if (player.inflation.vacuum && player.strangeness[5][10] >= 1) { next /= calculateEffects.S5Strange9_stage1(); }
        return next;
    },
    dischargeBase: (research = player.researches[1][4]) => {
        let base = (4 + research) / 2;
        if (player.inflation.vacuum) { base += player.inflation.tree[5] / 2; }
        if (player.challenges.active === 0) { base **= 0.5; }
        return base;
    },
    S1Upgrade6: () => 10 + 3 * player.researches[1][0],
    S1Upgrade7: (preons = false) => {
        let base = 2 + player.researches[1][1];
        const selfBoost = (base + 100) / 100;
        if (!preons || player.buildings[1][1].true >= 1001) { return selfBoost; }

        base = (base * 1.6 + 100) / 100; //Formula is '(selfPreons * step ** ((true - 1) / 2)) ** true'; Step is '(selfBoost / selfPreons) ** (1 / 500)'
        return (selfBoost / base) ** ((player.buildings[1][1].true - 1) / 1000) * base;
    },
    S1Upgrade9: () => {
        let effect = calculateEffects.effectiveEnergy();
        if (player.upgrades[1][10] !== 1) { effect **= 0.5; }
        return effect;
    },
    S1Research2: (level = player.strangeness[1][1]) => 20 + (level * (player.inflation.vacuum ? 1.5 : 1)),
    S1Research5: () => {
        const discharges = global.dischargeInfo.total;
        if (!player.inflation.vacuum) { return discharges > 5 ? discharges + 15 : discharges * 4; }
        return discharges > 7 ? discharges + 14 : discharges * 3;
    },
    S1Extra1: (level = player.researchesExtra[1][1]) => level >= 4 ? 1.1 : level >= 3 ? 1.2 : (20 - 3 * level) / 10,
    S1Extra3: (level = player.researchesExtra[1][3]) => level / 20,
    S1Extra4: (research = player.researchesExtra[1][5]) => (global.dischargeInfo.base + calculateEffects.effectiveEnergy() ** 0.1) * (research + 1) / 100 + 1,
    preonsHardcap: (laterPreons) => 1e14 * laterPreons * effectsCache.S1SolarDelay * assignBuildingsProduction.S3Build1(),
    clouds: (post = false) => {
        const effect = new Overlimit(player.vaporization.clouds).plus('1');
        if (post) { effect.plus(global.vaporizationInfo.get); }

        if (effect.moreThan('1e4')) { effect.minus('1e4').power(0.7).plus('1e4'); }
        return effect;
    },
    cloudsGain: () => player.challenges.active === 0 ? 0.4 : player.inflation.vacuum ? 0.5 : 0.6,
    S2Upgrade1: () => {
        const puddles = player.buildings[2][2];
        const maxTrue = Math.min(puddles.true, 200);
        return new Overlimit('1.02').power((puddles.current.toNumber() - maxTrue) ** 0.7 + maxTrue);
    },
    S2Upgrade2: () => {
        let effect = 1e10 / (player.inflation.vacuum ? 2.5 : 2) ** player.strangeness[2][3];
        if (player.inflation.vacuum && player.inflation.tree[4] >= 1) { effect /= global.milestonesInfo[2].reward[0]; }
        return effect;
    },
    S2Upgrade3_power: (research = player.researches[2][2]) => (1 + research / 2) / 100,
    S2Upgrade3: (power = calculateEffects.S2Upgrade3_power()) => new Overlimit(player.buildings[2][0].current).max('1').power(power).toNumber(),
    S2Upgrade4_power: (research = player.researches[2][3]) => (1 + research / 2) / 100,
    S2Upgrade4: (power = calculateEffects.S2Upgrade4_power()) => new Overlimit(player.buildings[2][1].current).max('1').power(power).toNumber(),
    S2Extra1: (level, post = false) => { //+^0.05 per level; Drops up to +^(0.05 / 3) after softcap
        if (level <= 0) { return 1; }
        const effect = new Overlimit(player.vaporization.clouds);
        if (post) { effect.plus(global.vaporizationInfo.get); }
        return Math.max(new Overlimit(effect).power(level / 60).multiply(effect.min('1e6').power(level / 30)).toNumber(), 1);
    },
    S2Extra2: (rain, level = player.researchesExtra[2][2]) => level >= 1 ? (rain - 1) / 32 + 1 : 1,
    submersion: () => {
        const drops = new Overlimit(player.buildings[2][1].current).plus('1');
        return new Overlimit(drops).power(0.6).divide(drops.min('1e10').power(0.4)).plus('1').log(2).toNumber(); //^0.2 before softcap, ^0.6 after
    },
    effectiveRank: () => {
        let rank = player.accretion.rank;
        if (player.inflation.vacuum && player.inflation.tree[4] >= 1) { rank += global.milestonesInfo[3].reward[1]; }
        return rank;
    },
    S3Upgrade0: () => (101 + player.researches[3][1]) / 100,
    S3Upgrade1_power: (research = player.researchesExtra[3][3]) => (11 + research) / 100, //Two times stronger for self-made ones
    S3Upgrade1: (power = calculateEffects.S3Upgrade1_power()) => Math.max(new Overlimit(player.buildings[3][1].current).multiply(player.buildings[3][1].true + 1).power(power).toNumber(), 1),
    S3Upgrade3: () => (204 + player.researches[3][4]) / 200, //1.02 + 0.005
    S3Research6: (level = player.researches[3][6]) => { //+^0.025 per level; Drops up to +^(0.025 / 3) after softcap
        const mass = Math.max(player.buildings[3][0].current.toNumber(), 1);
        return mass ** (level / 120) * Math.min(mass, 1e21) ** (level / 60);
    },
    S3Extra1: (level = player.researchesExtra[3][1]) => (100 + 11 * level) / 100,
    S3Extra4: (level = player.researchesExtra[3][4]) => level > 0 ? 8 ** ((global.accretionInfo.effective + level) / 8) : 1,
    dustDelay: () => {
        let delay = effectsCache.S3SolarDelay * (1.4 ** player.strangeness[3][8]);
        if (player.strangeness[5][10] >= 3) { delay *= calculateEffects.S5Strange9_stage3(); }
        return delay;
    },
    dustHardcap: () => (player.accretion.rank >= 5 ? 1e48 : 8e46) * calculateEffects.dustDelay(),
    mass: (post = false) => {
        let effect = player.collapse.mass;
        if (post) {
            if (global.collapseInfo.newMass > effect) { effect = global.collapseInfo.newMass; }
        }

        if (effect > 1) {
            if (player.elements[21] >= 1) { effect **= 1.1; }
            if (player.challenges.active === 0) { effect **= 0.2; }
        }
        return effect;
    },
    star: [
        (post = false) => {
            let effect = player.collapse.stars[0] + 1;
            if (post) {
                effect += global.collapseInfo.starCheck[0];
            }
            if (player.elements[27] >= 1) { effect += player.buildings[4][3].true; }

            if (player.elements[6] >= 1) { effect **= calculateEffects.element6(); }
            return effect;
        },
        (post = false) => {
            let stars = player.collapse.stars[1] * (1 + player.strangeness[4][8]);
            if (post) {
                stars += global.collapseInfo.starCheck[1] * (1 + player.strangeness[4][8]);
                if (player.elements[22] >= 1) { stars += global.collapseInfo.starCheck[0]; }
            }
            if (player.elements[22] >= 1) { stars += player.collapse.stars[0]; }

            let effect = (stars + 1) ** (0.5 + player.strangeness[4][8] / 8);
            if (player.elements[12] >= 1) { effect *= logAny(stars + 4, 4); }
            return effect;
        },
        (post = false) => {
            let blackHoles = player.collapse.stars[2];
            if (post) {
                blackHoles += global.collapseInfo.starCheck[2];
            }
            if (blackHoles <= 0) { return 1; }

            const base = player.elements[18] >= 1 ? 3 : 2;
            let effect = (blackHoles + 1) / logAny(blackHoles + base, base);
            if (player.inflation.vacuum && player.inflation.tree[4] >= 1) { effect *= global.milestonesInfo[4].reward[1]; }
            return effect;
        }
    ],
    massGain: () => {
        const elements = player.elements;

        let massGain = 0.004;
        if (elements[3] >= 1) { massGain += 0.002; }
        if (elements[5] >= 1) { massGain += 0.0002 * player.buildings[4][1].true; }
        massGain *= elements[15] >= 1 ? global.collapseInfo.trueStars : player.buildings[4][1].true;
        if (player.inflation.vacuum) {
            massGain = (massGain * (player.challenges.active === 0 ? 48 : 96)) + 1;
        } else {
            if (elements[10] >= 1) { massGain *= 2; }
            if (player.researchesExtra[4][1] >= 1) { massGain *= calculateEffects.S4Extra1(); }
            massGain *= calculateEffects.star[2]();
            if (player.strangeness[5][7] >= 1) { massGain *= global.strangeInfo.stageBoost[5]; }
        }
        return massGain;
    },
    S4Shared: () => {
        const multiplier = new Overlimit(calculateEffects.S4Research1()).power(global.collapseInfo.trueStars);
        if (player.elements[24] >= 1) { multiplier.multiply(calculateEffects.element24()); }
        if (player.inflation.vacuum) {
            if (player.researchesExtra[1][4] >= 1) { multiplier.multiply(calculateEffects.S1Extra4() ** global.dischargeInfo.total); }
        }
        return multiplier;
    },
    S4Research0_base: (disc = player.researches[4][2]) => (14 + disc) / 10,
    S4Research0: (base = calculateEffects.S4Research0_base()) => {
        let levels = player.researches[4][0];
        if (player.elements[19] >= 1) { levels++; }
        return base ** levels;
    },
    S4Research1: (level = player.researches[4][1], transfer = player.researchesExtra[4][1]) => {
        let effective = level > 0 ? 1 + Math.min(level, 4) : 0;
        if (level > 4) { effective += 0.5; }
        if (level > 5) { effective += Math.min(level - 5, 2) / 4; }
        if (level > 7) { effective += (level - 7) / 8; }
        return 1 + (transfer >= 1 ? 0.006 : 0.005) * effective;
    },
    S4Research4: (post = false, level = player.researches[4][4]) => {
        if (level < 1) { return 1; }

        let blackHoles = player.collapse.stars[2];
        let mass = player.collapse.mass;
        if (post) {
            blackHoles += global.collapseInfo.starCheck[2];
            if (global.collapseInfo.newMass > mass) { mass = global.collapseInfo.newMass; }
        }

        const base = level >= 2 ? 2 : 3;
        let effect = logAny(blackHoles + base, base);
        if (player.elements[23] >= 1 && mass > 1) { effect *= mass ** 0.1; }
        return effect;
    },
    S4Extra1: () => (10 + player.researches[4][1]) / 10,
    mergeMaxResets: () => {
        let max = 1;
        if (player.elements[30] >= 1) { max += player.collapse.maxElement - 29; }
        return max;
    },
    reward: [
        (post = false) => {
            let effect = player.merge.reward[0] + 1;
            if (post) { effect += global.mergeInfo.checkReward[0]; }
            return effect * calculateEffects.S5Extra2(global.mergeInfo.S5Extra2, post);
        }
    ],
    S5Upgrade0: () => 3 * ((player.inflation.vacuum ? 1.6 : 1.8) ** player.strangeness[5][1]),
    S5Upgrade1: () => 2 * ((player.inflation.vacuum ? 1.6 : 1.8) ** player.strangeness[5][1]),
    S5Upgrade2: (post = false, level = player.upgrades[5][2]) => {
        if (level < 1) { return 0; }
        let effect = player.collapse.mass;
        if (post) {
            if (global.collapseInfo.newMass > effect) { effect = global.collapseInfo.newMass; }
        }

        effect = Math.log10(Math.max(effect / 1e5, 1)) / 4 + 0.25;
        if (!player.inflation.vacuum) { effect *= 2; }
        return effect;
    },
    S5Research2: () => 1 + player.researches[5][2] * 0.0075,
    S5Research3: () => 1 + player.researches[5][3] * 0.0075,
    S5Extra2: (level, post = false) => {
        let groups = player.merge.reward[0];
        if (post) { groups += global.mergeInfo.checkReward[0]; }
        return (10 + level * groups) / 10;
    },
    element6: () => player.researchesExtra[4][2] >= 1 ? 2 : 1.5,
    element24_power: () => player.elements[27] >= 1 ? 0.02 : 0.01,
    element24: () => new Overlimit(player.buildings[4][0].current).max('1').power(calculateEffects.element24_power()),
    element26: () => {
        let effect = new Overlimit(player.buildings[4][0].trueTotal).log(10).toNumber() - 48;
        if (player.elements[29] >= 1) { effect = (199 + effect) * effect / 200; }
        return Math.max(effect, 0);
    },
    S2Strange9: () => new Overlimit(player.vaporization.clouds).plus('1').log(10).toNumber() / 80 + 1,
    S5Strange9_stage1: () => global.mergeInfo.galaxies ** 2 + 1,
    S5Strange9_stage2: () => global.mergeInfo.galaxies + 1,
    S5Strange9_stage3: () => global.mergeInfo.galaxies / 100 + 1,
    inflation0: () => Math.max(2 ** (1 - player.time.stage / 1200), 1),
    inflation1_power: (level = player.inflation.tree[1]) => level / 32,
    inflation1: (power = calculateEffects.inflation1_power()) => new Overlimit(player.buildings[6][0].current).plus('1').power(power).toNumber(),
    inflation3: () => (1 + global.inflationInfo.totalSuper) / 10 + 1,
    strangeGain: (interstellar: boolean, type = 0) => {
        let base = type === 1 ? 0 : player.inflation.vacuum ?
            (player.strangeness[5][3] >= 1 ? 5 : 4) :
            (player.milestones[1][0] >= 6 ? 2 : 1);
        if (interstellar) {
            base = (base + effectsCache.element26) * (global.mergeInfo.galaxies + 1);
            if (player.inflation.vacuum) {
                base *= effectsCache.S2Strange9 * calculateEffects.S5Extra2(player.researchesExtra[5][2]);
            }
        }
        if (type === 0) {
            base *= (1.4 ** player.strangeness[5][2]) * (1.4 ** player.inflation.tree[2]);
        }
        return base * global.strangeInfo.strangeletsInfo[1] * global.inflationInfo.instability;
    }
};

export const assignBuildingsProduction = {
    /* Can be moved into calculateEffects */
    globalSpeed: (): number => {
        const { tree } = player.inflation;
        const challenge = player.challenges.active;
        let speed = calculateEffects.inflation1() * global.inflationInfo.instability;
        if (tree[0] >= 1) { speed *= 2; }
        if (tree[0] >= 2 && (player.inflation.vacuum ? challenge === null : tree[4] >= 1)) { speed *= calculateEffects.inflation0(); }
        if (challenge === 0) {
            speed *= 1.2 ** Math.min(tree[2], tree[3] * 2);
            if (tree[4] >= 1 && !player.challenges.super) { speed *= 3; }
            if (player.challenges.super) { speed /= 5; }
        }
        return (global.inflationInfo.globalSpeed = speed);
    },
    /** Have to be after auto Strangeness, Inflation and interstellar Stage */
    globalCache: () => {
        global.dischargeInfo.total = calculateEffects.effectiveGoals();
        global.dischargeInfo.base = calculateEffects.dischargeBase();
        effectsCache.S2Upgrade3 = player.upgrades[2][3] === 1 ? calculateEffects.S2Upgrade3() : 1;
        effectsCache.S2Upgrade4 = player.upgrades[2][4] === 1 ? calculateEffects.S2Upgrade4() : 1;
        global.accretionInfo.effective = calculateEffects.effectiveRank();
        global.mergeInfo.galaxies = player.buildings[5][3].current.toNumber();
    },
    /** Have to be after auto Upgrades */
    stage1Cache: () => {
        effectsCache.S1Upgrade6 = player.upgrades[1][6] === 1 ? calculateEffects.S1Upgrade6() : 0;
        effectsCache.S1Upgrade7 = player.upgrades[1][7] === 1 ? calculateEffects.S1Upgrade7() : 1;
        let multiplier = (player.inflation.vacuum ? 2 : 1.8) ** player.strangeness[1][0];
        if (player.upgrades[1][5] === 1) { multiplier *= global.dischargeInfo.base ** global.dischargeInfo.total; }
        if (player.strangeness[1][6] >= 1) { multiplier *= global.strangeInfo.stageBoost[1]; }
        if (player.inflation.vacuum && player.inflation.tree[4] >= 1) { multiplier *= global.milestonesInfo[1].reward[0]; }
        if (player.challenges.active === 0) { multiplier /= 4; }
        effectsCache.microworld = multiplier;
    },
    /** Preons, true vacuum only, visual will assign effect */
    S1Build1: (noHardcap = false, visual = false): number => {
        const structure = player.buildings[1][1];

        const laterPreons = calculateEffects.effectiveEnergy() ** calculateEffects.S1Extra3();
        let multiplier = 6e-4 * effectsCache.microworld * laterPreons;
        const preonsExcess = new Overlimit(structure.current).minus(structure.true);
        if (preonsExcess.moreThan('1')) {
            multiplier *= preonsExcess.power(0.11).toNumber() + structure.true;
        } else { multiplier *= structure.current.toNumber(); }
        if (player.upgrades[1][7] === 1) { multiplier *= calculateEffects.S1Upgrade7(true) ** Math.min(structure.true, 1001); }
        if (!noHardcap) {
            const preonCap = calculateEffects.preonsHardcap(laterPreons);
            if (multiplier > preonCap) { multiplier = preonCap; }
        }
        if (visual) { global.buildingsInfo.producing[1][1].setValue(multiplier); }
        return multiplier;
    },
    /** Quarks, true vacuum only */
    S1Build2: (): Overlimit => global.buildingsInfo.producing[1][2].setValue(0.4 * effectsCache.microworld).multiply(player.buildings[1][2].current, new Overlimit(effectsCache.S1Upgrade7).power(player.buildings[1][2].true)),
    /** Particles */
    S1Build3: (): Overlimit => {
        const index = player.inflation.vacuum ? 3 : 1;

        let multiplier = (player.inflation.vacuum ? 0.2 : 1.6) * effectsCache.microworld;
        if (player.upgrades[1][0] === 1) { multiplier *= 8; }
        return global.buildingsInfo.producing[1][index].setValue(multiplier).multiply(player.buildings[1][index].current, new Overlimit(effectsCache.S1Upgrade7).power(player.buildings[1][index].true));
    },
    /** Atoms */
    S1Build4: (): Overlimit => {
        const vacuum = player.inflation.vacuum;
        const index = vacuum ? 4 : 2;

        let multiplier = (vacuum ? 0.8 : 0.4) * effectsCache.microworld;
        if (player.upgrades[1][3] === 1) { multiplier *= vacuum ? 6 : 4; }
        return global.buildingsInfo.producing[1][index].setValue(multiplier).multiply(player.buildings[1][index].current, new Overlimit(effectsCache.S1Upgrade7).power(player.buildings[1][index].true));
    },
    /** Molecules */
    S1Build5: (): Overlimit => {
        const b5 = player.inflation.vacuum ? 5 : 3;

        let multiplier = 0.2 * effectsCache.microworld;
        if (player.upgrades[1][4] === 1) { multiplier *= 4; }
        return global.buildingsInfo.producing[1][b5].setValue(multiplier).multiply(player.buildings[1][b5].current, new Overlimit(effectsCache.S1Upgrade7).power(player.buildings[1][b5].true));
    },
    /* Tritium */
    S1Build6: (): Overlimit => {
        let multiplier = (calculateEffects.S1Research2() ** player.researches[1][2]) * (calculateEffects.S1Research5() ** player.researches[1][5]);
        if (player.upgrades[1][9] === 1) { multiplier *= calculateEffects.S1Upgrade9(); }
        effectsCache.tritium.setValue(assignBuildingsProduction.S1Build5()).plus('1').log(calculateEffects.S1Extra1()).multiply(multiplier);
        if (player.inflation.vacuum) { return effectsCache.tritium.multiply(assignBuildingsProduction.S2Build1()); }
        return effectsCache.tritium;
    },
    /** Reset being false will set all levels to 0, true will recalculate them afterwards */
    S2Levels: (reset = null as boolean | null) => {
        const info = global.vaporizationInfo;
        if (reset !== null) {
            info.S2Extra1 = 0;
            info.S2Research1 = 0;
            info.S2Research0 = 0;
            if (!reset) { return; }
        }
        const totalDrops = player.buildings[2][1].total.toNumber(); //Infinity is fine here
        if (info.S2Extra1 !== player.researchesExtra[2][1]) { info.S2Extra1 = player.researchesExtra[2][2] >= 1 ? player.researchesExtra[2][1] : Math.min(player.researchesExtra[2][1], logAny(totalDrops * 9.99e-10 + 1, 1e3)); }
        if (info.S2Research1 !== player.researches[2][1]) { info.S2Research1 = Math.min(player.researches[2][1], logAny(totalDrops / 100 + 1, 5)); } //Formula is: logAny(totalDrops * (scaling - 1) / startCost + 1, scaling)'
        if (info.S2Research0 !== player.researches[2][0]) { info.S2Research0 = Math.min(player.researches[2][0], Math.max(logAny(totalDrops / 10, 1.366) + 1, logAny(totalDrops * 0.0366 + 1, 1.366))); }
    },
    S2FreeBuilds: () => {
        const buildings = player.buildings[2];
        const upgrades = player.upgrades[2];

        let water5 = buildings[5].true;
        let water4 = buildings[4].true;
        let water3 = buildings[3].true;
        let water2 = buildings[2].true;
        if (upgrades[8] === 1) { water5 += buildings[6].true; }
        if (upgrades[7] === 1) { water4 += water5; }
        if (upgrades[6] === 1) { water3 += water4 * (1 + player.researches[2][5]); }
        if (upgrades[5] === 1) { water2 += water3 * (1 + player.researches[2][4]); }
        buildings[5].current.setValue(water5);
        buildings[4].current.setValue(water4);
        buildings[3].current.setValue(water3);
        buildings[2].current.setValue(water2);
    },
    /** Drops */
    S2Build1: (): Overlimit => {
        const vacuum = player.inflation.vacuum;
        const structure = player.buildings[2][1];

        const multiplierList = [structure.current];
        if (player.challenges.active === 0) {
            multiplierList[0] = new Overlimit(structure.current).min(1);
        } else if (vacuum) {
            const excess = new Overlimit(structure.current).minus(structure.true);
            if (excess.moreThan('1')) { multiplierList[0] = excess.power(0.2).plus(structure.true); }
        }
        if (player.upgrades[2][0] === 1) { multiplierList.push(new Overlimit(vacuum ? '1.02' : '1.04').power(structure.true)); }
        global.buildingsInfo.producing[2][1].setValue((vacuum ? 2 : 8e-4) * (3 ** global.vaporizationInfo.S2Research0) * (2 ** player.strangeness[2][0])).multiply(...multiplierList);
        if (vacuum) { return global.buildingsInfo.producing[2][1].max('1'); }
        return global.buildingsInfo.producing[2][1];
    },
    /** Puddles, visual will only assign Ponds and above */
    S2Build2: (visual = false): Overlimit => {
        const producings = global.buildingsInfo.producing[2];
        const structures = player.buildings[2];
        if (!visual && structures[2].true < 1) {
            let multiplier = calculateEffects.S2Extra1(player.researchesExtra[2][1]) - 1;
            if (player.inflation.vacuum && player.strangeness[5][10] >= 2) { multiplier *= calculateEffects.S5Strange9_stage2(); }
            return producings[2].setValue(multiplier);
        }
        const rain = calculateEffects.S2Extra1(global.vaporizationInfo.S2Extra1);
        const flow = 1.24 ** player.strangeness[2][7];

        const producing6 = structures[6].true < 1 ? 1 : (player.upgrades[2][8] === 1 ? 1.1 : 1.08) ** structures[6].true * flow;
        if (visual) { producings[6].setValue(producing6); }

        const producing5 = Math.max(2 * structures[5].current.toNumber() * calculateEffects.S2Extra2(rain) * flow, 1);
        if (visual) { producings[5].setValue(producing5); }

        const producing4 = Math.max(2 * structures[4].current.toNumber() * flow, 1);
        if (visual) { producings[4].setValue(producing4); }

        const producing3 = Math.max(2 * structures[3].current.toNumber() * flow, 1);
        if (visual) { return producings[3].setValue(producing3); }

        const multiplierList = [structures[2].current, calculateEffects.clouds()];
        let multiplier = (player.challenges.active === 0 ? 6e-4 : 4.8) * producing3 * producing4 * producing5 * producing6 * effectsCache.S2Upgrade3 * effectsCache.S2Upgrade4 * (2 ** global.vaporizationInfo.S2Research1) * rain * ((player.inflation.vacuum ? 1.8 : 1.6) ** player.strangeness[2][1]);
        if (player.upgrades[2][1] === 1) { multiplierList.push(calculateEffects.S2Upgrade1()); }
        if (player.inflation.vacuum) {
            multiplier *= calculateEffects.S3Extra4();
            if (player.elements[1] >= 1) { multiplier *= 2; }
            if (player.inflation.tree[4] >= 1) { multiplier *= global.milestonesInfo[2].reward[1]; }
            if (player.strangeness[5][10] >= 2) { multiplier *= calculateEffects.S5Strange9_stage2(); }
        }
        if (player.strangeness[2][6] >= 1) { multiplier *= global.strangeInfo.stageBoost[2]; }
        return producings[2].setValue(multiplier).multiply(...multiplierList);
    },
    /** Have to be after auto Upgrades, visual will only assign subsatellites */
    stage3Cache: (visual = false) => {
        const producing5 = 1.1 ** player.buildings[3][5].true;
        if (visual) {
            global.buildingsInfo.producing[3][5].setValue(producing5);
            return;
        }
        effectsCache.S3Strange1 = (player.inflation.vacuum ? 1.48 : 1.6) ** player.strangeness[3][1];

        const producing4 = (player.upgrades[3][12] === 1 ? 1.14 : 1.1) ** player.buildings[3][4].true * producing5;
        global.buildingsInfo.producing[3][4].setValue(producing4);
        effectsCache.S3Strange3 = producing4 ** (player.inflation.vacuum ? 0.1 : 0.2);
    },
    /** Cosmic dust and related softcap, visual will assign effect */
    S3Build1: (noHardcap = false, visual = false): number => {
        const researchesS3 = player.researches[3];
        const upgradesS3 = player.upgrades[3];
        const vacuum = player.inflation.vacuum;

        let multiplier = (vacuum ? 2 : 8e-20) * player.buildings[3][1].current.toNumber() * (3 ** researchesS3[0]) * (2 ** researchesS3[3]) * (3 ** researchesS3[5]) * (1.11 ** player.researchesExtra[3][0]) * (calculateEffects.S3Extra1() ** global.accretionInfo.effective) * (1.8 ** player.strangeness[3][0]);
        if (vacuum) {
            multiplier *= calculateEffects.submersion();
            if (player.elements[4] >= 1) { multiplier *= 1.4; }
            if (player.elements[14] >= 1) { multiplier *= 1.4; }
            if (player.strangeness[5][10] >= 3) { multiplier *= calculateEffects.S5Strange9_stage2(); }
            if (player.inflation.tree[4] >= 1) { multiplier *= global.milestonesInfo[3].reward[0]; }
        }
        if (upgradesS3[0] === 1) { multiplier *= calculateEffects.S3Upgrade0() ** player.buildings[3][1].true; }
        if (upgradesS3[1] === 1) { multiplier *= calculateEffects.S3Upgrade1(); }
        if (upgradesS3[2] === 1) { multiplier *= 2; }
        if (upgradesS3[5] === 1) { multiplier *= 3; }
        if (upgradesS3[6] === 1) { multiplier *= 2 * 1.5 ** researchesS3[7]; }
        if (upgradesS3[9] === 1) { multiplier *= 2; }
        if (upgradesS3[10] === 1) { multiplier *= 8 * 2 ** researchesS3[8]; }
        if (player.strangeness[3][3] >= 1) { multiplier *= effectsCache.S3Strange3; }
        if (player.challenges.active === 0) {
            global.accretionInfo.dustSoft = player.accretion.rank >= 5 ? 0.8 : 0.9;
        } else if (player.accretion.rank >= 5) {
            global.accretionInfo.dustSoft = vacuum || multiplier > 1 ? 0.9 : 1.1;
        } else { global.accretionInfo.dustSoft = 1; }
        multiplier **= global.accretionInfo.dustSoft;
        if (vacuum) {
            if (player.researchesExtra[3][5] >= 2) {
                multiplier *= calculateEffects.dustDelay();
            } else if (!noHardcap && player.researchesExtra[3][5] < 1) {
                const dustCap = calculateEffects.dustHardcap();
                if (multiplier > dustCap) { multiplier = dustCap; }
            }
            if (multiplier < 1) { multiplier = 1; }
        }
        if (visual) { global.buildingsInfo.producing[3][1].setValue(multiplier); }
        return multiplier;
    },
    /** Planetesimals, visual will assign effect */
    S3Build2: (visual = false): number => {
        let multiplier = player.buildings[3][2].current.toNumber() * (3 ** player.researches[3][2]) * calculateEffects.S3Research6() * effectsCache.S3Strange1;
        if (player.upgrades[3][3] === 1) { multiplier *= calculateEffects.S3Upgrade3() ** player.buildings[3][2].true; }
        if (player.upgrades[3][4] === 1) { multiplier *= 3; }
        if (player.strangeness[3][3] >= 1) { multiplier *= effectsCache.S3Strange3; }
        if (visual) { global.buildingsInfo.producing[3][2].setValue(multiplier); }
        return multiplier;
    },
    /** Protoplanets, visual will assign effect */
    S3Build3: (visual = false): number => {
        let multiplier = 0.4 * player.buildings[3][3].current.toNumber() * global.buildingsInfo.producing[3][4].toNumber() * effectsCache.S3Strange1;
        if (player.researchesExtra[3][2] >= 1) { multiplier *= 2; }
        if (player.upgrades[3][7] === 1) { multiplier *= 1.02 ** player.buildings[3][3].true; }
        if (visual) { global.buildingsInfo.producing[3][3].setValue(multiplier); }
        return multiplier;
    },
    /** Have to be after auto Upgrades */
    stage4Cache: () => {
        effectsCache.mass = calculateEffects.mass();
        effectsCache.star1 = calculateEffects.star[1]();

        let multiplier = calculateEffects.S4Research0() * effectsCache.mass * effectsCache.star1 * calculateEffects.S4Research4() * (1.6 ** player.strangeness[4][0]);
        if (player.elements[4] >= 1) { multiplier *= 1.4; }
        if (player.elements[14] >= 1) { multiplier *= 1.4; }
        if (player.inflation.vacuum) {
            if (player.researchesExtra[2][3] >= 1) { multiplier *= effectsCache.S2Upgrade3; }
            if (player.researchesExtra[2][3] >= 3) {
                multiplier *= effectsCache.S2Upgrade4;
            } else if (player.researchesExtra[2][3] === 2) { multiplier *= effectsCache.S2Upgrade4 ** 0.5; }
            if (player.inflation.tree[4] >= 1) { multiplier *= global.milestonesInfo[4].reward[0]; }
        }
        if (player.strangeness[4][7] >= 1) { multiplier *= global.strangeInfo.stageBoost[4]; }
        if (player.challenges.active === 0) { multiplier /= 8000; }
        effectsCache.interstellar = multiplier;
    },
    /** Reset being false will set all levels to 0, true will recalculate them afterwards */
    S4Levels: (reset = null as boolean | null) => {
        if (reset !== null) {
            global.mergeInfo.S5Extra2 = 0;
            if (!reset) { return; }
        }
        if (global.mergeInfo.S5Extra2 !== player.researchesExtra[5][2]) { global.mergeInfo.S5Extra2 = Math.min(player.researchesExtra[5][2], Math.max(new Overlimit(player.buildings[4][0].total).divide('1e280').log(1e30).toNumber(), 0)); }
    },
    /** Brown dwarfs */
    S4Build1: (): Overlimit => {
        const multiplierList = [player.buildings[4][1].current, calculateEffects.S4Shared()];
        let multiplier = 40 * effectsCache.interstellar;
        if (player.elements[1] >= 1) { multiplier *= 2; }
        if (player.elements[19] >= 1 && effectsCache.mass > 1) { multiplier *= effectsCache.mass; }
        const level = player.inflation.vacuum ? 4 : 3;
        if (player.researches[5][1] >= level) {
            multiplierList.push(global.buildingsInfo.producing[5][2]);
            multiplier /= 2 ** level;
        }
        return global.buildingsInfo.producing[4][1].setValue(multiplier).multiply(...multiplierList);
    },
    /** Main sequence */
    S4Build2: (): Overlimit => {
        const multiplierList = [player.buildings[4][2].current, calculateEffects.S4Shared()];
        let multiplier = 1200 * effectsCache.interstellar * calculateEffects.star[0]() * (2 ** player.researches[4][3]);
        const level = player.inflation.vacuum ? 3 : 2;
        if (player.researches[5][1] >= level) {
            multiplierList.push(global.buildingsInfo.producing[5][2]);
            multiplier /= 2 ** level;
        }
        return global.buildingsInfo.producing[4][2].setValue(multiplier).multiply(...multiplierList);
    },
    /** Red supergiants */
    S4Build3: (): Overlimit => {
        const multiplierList = [player.buildings[4][3].current, calculateEffects.S4Shared()];
        let multiplier = 6e7 * effectsCache.interstellar;
        const level = player.inflation.vacuum ? 2 : 1;
        if (player.researches[5][1] >= level) {
            multiplierList.push(global.buildingsInfo.producing[5][2]);
            multiplier /= 2 ** level;
        }
        return global.buildingsInfo.producing[4][3].setValue(multiplier).multiply(...multiplierList);
    },
    /** Blue hypergiants */
    S4Build4: (): Overlimit => {
        const multiplierList = [player.buildings[4][4].current, calculateEffects.S4Shared()];
        let multiplier = 6e9 * effectsCache.interstellar;
        const level = player.inflation.vacuum ? 1 : 0;
        if (player.researches[5][1] >= level) {
            multiplierList.push(global.buildingsInfo.producing[5][2]);
            multiplier /= 2 ** level;
        }
        return global.buildingsInfo.producing[4][4].setValue(multiplier).multiply(...multiplierList);
    },
    /** Quasi-stars */
    S4Build5: (): Overlimit => {
        if (player.challenges.active === 0) { return global.buildingsInfo.producing[4][5].setValue('0'); }
        return global.buildingsInfo.producing[4][5].setValue(2e11 * effectsCache.interstellar).multiply(player.buildings[4][5].current, calculateEffects.S4Shared(), global.buildingsInfo.producing[5][2]);
    },
    /** All Intergalactic Structures productions, have to be after auto Galaxies */
    stage5Cache: () => {
        const vacuum = player.inflation.vacuum;
        const production = global.buildingsInfo.producing[5][3];

        effectsCache.S5Upgrade2 = calculateEffects.S5Upgrade2();
        let base = (vacuum ? 2 : 6) + effectsCache.S5Upgrade2;
        if (vacuum && player.inflation.tree[4] >= 1) { base += global.milestonesInfo[5].reward[1]; }
        effectsCache.galaxyBase = base;

        production.setValue(base).power(player.buildings[5][3].true);
        if (vacuum && global.mergeInfo.galaxies > 0) { production.multiply(((global.mergeInfo.galaxies + 1) / (player.buildings[5][3].true + 1)) * calculateEffects.reward[0]()); }

        let globalMult = (vacuum ? 1.4 : 1.6) ** player.strangeness[5][0];
        if (vacuum && player.inflation.tree[4] >= 1) { globalMult *= global.milestonesInfo[5].reward[0]; }

        let multiplier2 = 2 * (2 ** player.researches[5][1]) * globalMult;
        if (player.upgrades[5][1] === 1) { multiplier2 *= calculateEffects.S5Upgrade1(); }
        if (vacuum && player.upgrades[3][13] === 1) { multiplier2 *= (calculateEffects.S3Research6() / 2e5) ** 0.5 + 1; }
        global.buildingsInfo.producing[5][2].setValue(multiplier2).multiply(player.buildings[5][2].current, production, new Overlimit(calculateEffects.S5Research3()).power(player.buildings[5][2].true)).max(2 ** player.researches[5][1]);

        let multiplier1 = 6 * (2 ** player.researches[5][0]) * globalMult;
        if (player.upgrades[5][0] === 1) { multiplier1 *= calculateEffects.S5Upgrade0(); }
        if (vacuum) {
            if (player.researchesExtra[2][4] >= 1) { multiplier1 *= effectsCache.S2Upgrade3; }
            if (player.researchesExtra[2][4] >= 3) {
                multiplier1 *= effectsCache.S2Upgrade4;
            } else if (player.researchesExtra[2][4] === 2) { multiplier1 *= effectsCache.S2Upgrade4 ** 0.5; }
        }
        global.buildingsInfo.producing[5][1].setValue(multiplier1).multiply(player.buildings[5][1].current, production, new Overlimit(calculateEffects.S5Research2()).power(player.buildings[5][1].true));
    },
    /** Universes */
    S6Build1: (): Overlimit => global.buildingsInfo.producing[6][1].setValue(player.buildings[6][1].current).power(player.buildings[6][1].true / 4 + 1),
    /** Quarks */
    strange0: () => {
        const vacuum = player.inflation.vacuum;
        const stageBoost = global.strangeInfo.stageBoost;
        const strangeQuarks = player.strange[0].current + 1;

        stageBoost[1] = strangeQuarks ** (vacuum ? 0.26 : 0.22);
        stageBoost[2] = strangeQuarks ** (vacuum ? 0.22 : 0.18);
        stageBoost[3] = strangeQuarks ** (vacuum ? 0.68 : 0.76);
        stageBoost[4] = strangeQuarks ** (player.elements[26] >= 1 ? 0.32 : 0.16);
        stageBoost[5] = strangeQuarks ** 0.06;
    },
    /** Strangelets */
    strange1: () => {
        const information = global.strangeInfo.strangeletsInfo;
        const strangelets = player.strange[1].current;

        information[0] = (Math.log2(strangelets + 2) - 1) / 100;
        information[1] = strangelets ** 0.4 / 80 + 1;
    }
};

export const assignResetInformation = {
    /** And energyType, energyStage */
    trueEnergy: () => {
        const energyType = player.inflation.vacuum ? [[],
            [0, 1, 3, 5, 10, 20],
            [0, 20, 30, 40, 50, 60, 120],
            [0, 20, 40, 60, 120, 160],
            [0, 80, 160, 240, 320, 400],
            [0, 400, 400, 2000]
        ] : [[], [0, 1, 5, 20], [], [], [], []];
        if (player.inflation.vacuum) {
            energyType[1][1] += player.strangeness[1][7] * 2;
            if (player.strangeness[5][10] >= 1) { energyType[5][3] *= 5; }
            if (player.challenges.active === 0) {
                for (let s = 2; s < energyType.length; s++) {
                    for (let i = 1; i < energyType[s].length; i++) {
                        energyType[s][i] /= (s >= 4 ? 4 : 2);
                    }
                }
            }
        }

        let energyTrue = 0;
        for (let s = 1; s < energyType.length; s++) {
            let add = 0;
            for (let i = 1; i < energyType[s].length; i++) {
                add += energyType[s][i] * player.buildings[s][i as 1].true;
            }
            global.dischargeInfo.energyStage[s] = add;
            energyTrue += add;
        }
        global.dischargeInfo.energyType = energyType;
        global.dischargeInfo.energyTrue = energyTrue;
    },
    newClouds: (): Overlimit => {
        const softcap = calculateEffects.cloudsGain();
        return global.vaporizationInfo.get.setValue(player.vaporization.clouds).power(1 / softcap).plus(
            new Overlimit(player.buildings[2][1][player.researchesExtra[2][0] >= 1 ? 'total' : 'current']).divide(calculateEffects.S2Upgrade2())
        ).power(softcap).minus(player.vaporization.clouds);
    },
    maxRank: () => {
        if (player.inflation.vacuum) {
            global.accretionInfo.maxRank = player.strangeness[3][9] >= 1 ? 7 : 6;
        } else {
            global.accretionInfo.maxRank = player.stage.true >= 4 || (player.stage.true === 3 && player.event) ? 5 : 4;
        }
    },
    solarHardcap: () => {
        effectsCache.S3SolarDelay = calculateEffects.massGain();
        let effectS1 = calculateEffects.star[2]();
        if (player.elements[10] >= 1) { effectS1 *= 2; }
        if (player.researchesExtra[4][1] >= 1) { effectS1 *= calculateEffects.S4Extra1(); }
        effectsCache.S1SolarDelay = effectS1;

        global.collapseInfo.solarCap = 0.01235 * effectsCache.S3SolarDelay * effectS1;
        if (player.strangeness[5][7] >= 1) { global.collapseInfo.solarCap *= global.strangeInfo.stageBoost[5]; }
    },
    /** Have to be after assignResetInformation.newMass() */
    timeUntil: (firstCall = true) => {
        if (player.inflation.vacuum) {
            if (firstCall) {
                assignBuildingsProduction.stage3Cache();
                assignBuildingsProduction.stage1Cache();
            }
            global.collapseInfo.timeUntil = (global.collapseInfo.solarCap / 8.96499278339628e-67 - player.buildings[1][0].current.toNumber()) / assignBuildingsProduction.S1Build1() / global.inflationInfo.globalSpeed;
            if (isNaN(global.collapseInfo.timeUntil)) { global.collapseInfo.timeUntil = Infinity; }
        } else { global.collapseInfo.timeUntil = 0; }
    },
    newMass: () => {
        if (player.inflation.vacuum) {
            assignResetInformation.solarHardcap();
            global.collapseInfo.newMass = Math.min(player.buildings[1][0].current.toNumber() * 8.96499278339628e-67, global.collapseInfo.solarCap); //1.78266192e-33 / 1.98847e33
        } else { global.collapseInfo.newMass = calculateEffects.massGain(); }
    },
    newStars: (reset = false) => {
        const starCheck = global.collapseInfo.starCheck;
        if (reset) {
            starCheck[0] = 0;
            starCheck[1] = 0;
            starCheck[2] = 0;
            return;
        }
        const building = player.buildings[4];
        const stars = player.collapse.stars;
        starCheck[0] = building[2].trueTotal.moreThan('0') ? Math.max(building[2].true + Math.floor(building[1].true * player.strangeness[4][3] / 10) - stars[0], 0) : 0;
        starCheck[1] = Math.max(building[3].true - stars[1], 0);
        starCheck[2] = Math.max(building[4].true + (building[5].true * player.researches[4][5]) - stars[2], 0);
    },
    /** Returns Groups Galaxy requirement, because I was lazy */
    mergeReward: (): number => {
        let requirement = 40;
        if (player.researchesExtra[5][1] >= 2) { requirement -= 4 * (player.researchesExtra[5][1] - 1); }

        global.mergeInfo.checkReward[0] = player.researchesExtra[5][1] < 1 ? Math.floor(player.buildings[5][3].true / requirement) :
            Math.max(Math.floor(global.mergeInfo.galaxies / requirement) - player.merge.reward[0], 0);
        return requirement;
    },
    /** Interstellar only, also assigns related cache */
    quarksGain: () => {
        global.mergeInfo.galaxies = player.buildings[5][3].current.toNumber();
        effectsCache.element26 = calculateEffects.element26();
        effectsCache.S2Strange9 = player.inflation.vacuum && player.strangeness[2][9] >= 1 ? calculateEffects.S2Strange9() : 1;
        global.strangeInfo.quarksGain = player.stage.true >= 6 || player.strange[0].total >= 1 ? calculateEffects.strangeGain(true) : 1;
    }
};

export const buyBuilding = (index: number, stageIndex: number, howMany = player.toggles.shop.input, auto = false) => {
    if (!checkBuilding(index, stageIndex) || (auto ? player.ASR[stageIndex] < index : global.offline.active)) { return; }
    const building = player.buildings[stageIndex][index as 1];

    let currency; //Readonly
    let free = false;
    let multi = true;
    let special = '' as '' | 'Mass' | 'Galaxy' | 'Universe';
    if (stageIndex === 1) {
        currency = player.buildings[1][index - 1].current;
        if (index === 1 && player.inflation.vacuum) {
            free = player.strangeness[1][8] >= 1 && (player.researchesExtra[1][2] >= 1 || player.challenges.supervoid[1] >= 2);
        }
    } else if (stageIndex === 2) {
        currency = player.buildings[2][index === 1 ? 0 : 1].current;
    } else if (stageIndex === 3) {
        if (player.inflation.vacuum) { special = 'Mass'; }
        currency = player.buildings[3][0].current;
    } else if (stageIndex === 6) {
        currency = player.merge.reward[0];
        special = 'Universe';
        multi = false;
    } else {
        if (stageIndex === 5 && index === 3) {
            special = 'Galaxy';
            currency = player.collapse.mass;
            multi = false;
        } else { currency = player.buildings[4][0].current; }
    }

    const budget = new Overlimit(currency);
    if (auto && building.true >= 1 && !free && multi) {
        if (special === 'Mass' && global.accretionInfo.disableAuto) {
            if (player.accretion.rank >= 6) {
                budget.minus(global.collapseInfo.solarCap * 1.98847e33);
            } else if (player.strangeness[3][4] < 2 && player.challenges.supervoid[1] >= 2) {
                budget.minus(global.accretionInfo.rankCost[player.accretion.rank]);
            } else {
                budget.divide(player.toggles.shop.wait[stageIndex]);
            }
        } else {
            budget.divide(player.toggles.shop.wait[stageIndex]);
        }
    }

    const total = calculateBuildingsCost(index, stageIndex);
    if (total.moreThan(budget)) { return; }

    let afford = 1;
    if (howMany !== 1 && multi) {
        const scaling = global.buildingsInfo.increase[stageIndex][index]; //Must be >1
        if (free) {
            afford = Math.floor(budget.divide(total).log(scaling).toNumber()) + 1;

            if (howMany > 0) {
                if (afford < howMany) { return; }
                afford = howMany;
            }
        } else {
            afford = Math.floor(budget.multiply(scaling - 1).divide(total).plus('1').log(scaling).toNumber());

            if (howMany > 0) {
                if (afford < howMany) { return; }
                afford = howMany;
            }
            if (afford > 1) { total.multiply(new Overlimit(scaling).power(afford).minus('1').divide(scaling - 1)); }
        }
    }

    building.true += afford;
    building.current.plus(afford);
    building.total.plus(afford);
    building.trueTotal.plus(afford);

    if (typeof currency === 'object') {
        if (!free) {
            currency.minus(total);
            if (special === 'Mass') {
                player.buildings[1][0].current.setValue(currency).divide('1.78266192e-33');
            } else if (player.inflation.vacuum && index === 1) {
                if (stageIndex === 1) {
                    player.buildings[3][0].current.setValue(currency).multiply('1.78266192e-33');
                } else if (stageIndex === 2) {
                    player.buildings[1][5].current.setValue(currency).multiply('6.02214076e23');
                }
            }
        }

        if (player.inflation.vacuum || stageIndex === 1) { addEnergy(afford, index, stageIndex); }
        if (stageIndex === 1) { //True vacuum only
            if (index === 5 && player.upgrades[1][8] === 0) { player.buildings[2][0].current.setValue(building.current).divide('6.02214076e23'); }
        } else if (stageIndex === 2) {
            if (index === 1) {
                if (player.buildings[2][2].true < 1) { assignBuildingsProduction.S2Levels(); }
            } else { assignBuildingsProduction.S2FreeBuilds(); }
        } else if (stageIndex === 3) {
            if (index >= 4) {
                assignBuildingsProduction.stage3Cache();
                awardMilestone(1, 3);
            }
        } else if (stageIndex === 4) {
            global.collapseInfo.trueStars += afford;
        }

        if (!auto) {
            numbersUpdate();
            if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Made ${format(afford)} '${global.buildingsInfo.name[stageIndex][index]}'`; }
        }
    } else if (special === 'Galaxy') {
        //global.mergeInfo.galaxies = player.buildings[5][3].current.toNumber();
        reset('galaxy', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [4, 5]);
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(1, 4, 'researches');
        calculateMaxLevel(2, 4, 'researches');
        calculateMaxLevel(5, 4, 'researches');
        awardVoidReward(5);
        awardMilestone(1, 5);
        if (!auto) {
            numbersUpdate();
            if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Caused Galaxy reset to gain ${format(afford)} new 'Galaxies'`; }
        }
    } else if (special === 'Universe') {
        if (player.stage.true < 7) {
            player.stage.true = 7;
            //player.event = false;
            visualTrueStageUnlocks();
        }
        if ((player.toggles.normal[0] && global.tab !== 'inflation') || player.stage.active < 6) { setActiveStage(1); }
        const realTime = player.time.vacuum;
        const income = building.true;
        player.cosmon.current += income;
        player.cosmon.total += income;
        player.inflation.vacuum = false;
        player.inflation.resets++;
        player.inflation.age = 0;
        player.time.universe = 0;
        player.clone = {};
        player.challenges.active = null;
        prepareVacuum(false);
        resetVacuum();

        const history = player.history.vacuum;
        const storage = global.historyStorage.vacuum;
        storage.unshift([realTime, true, income]);
        if (storage.length > 100) { storage.length = 100; }
        if (income / realTime > history.best[2] / history.best[0]) {
            history.best = [realTime, true, income];
        }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Caused Universe reset to gain ${format(afford)} new 'Universes'`; }
    }
};

/** Increase is how many new Structures have been gained */
export const addEnergy = (increase: number, index: number, stage: number) => {
    const { discharge } = player;
    const { dischargeInfo } = global;

    const add = dischargeInfo.energyType[stage][index] * increase;
    dischargeInfo.energyStage[stage] += add;
    dischargeInfo.energyTrue += add;
    discharge.energy += add;
    if (discharge.energyMax < discharge.energy) { discharge.energyMax = discharge.energy; }
};

export const calculateBuildingsCost = (index: number, stageIndex: number): Overlimit => {
    const scaling = global.buildingsInfo.increase[stageIndex];
    let firstCost = global.buildingsInfo.startCost[stageIndex][index];
    if (stageIndex === 1) {
        scaling[index] = (140 - effectsCache.S1Upgrade6) / 100;
        if (index === 1) {
            if (!player.inflation.vacuum && player.upgrades[1][2] === 1) { firstCost /= 8; }
        } else if (index === 3) {
            if (player.upgrades[1][1] === 1) { firstCost /= 16; }
        } else if (index === 4) {
            if (player.upgrades[1][2] === 1) { firstCost /= 8; }
            if (player.researchesExtra[1][0] >= 1) { firstCost /= 16; }
        }
    } else if (stageIndex === 3) {
        if (player.strangeness[3][7] >= 1) { firstCost /= global.strangeInfo.stageBoost[3]; }
        if (index === 4) {
            scaling[4] = player.upgrades[3][11] === 1 ? 5 : 10;
        }
    } else if (stageIndex === 4) {
        let increase = 125 + 15 * index;
        if (player.elements[2] >= 1) { increase -= 10; }
        if (player.elements[8] >= 1) { increase -= 5; }
        scaling[index] = increase / 100;

        firstCost /= 2 ** player.strangeness[4][1];
        if (player.researchesExtra[4][3] >= 1) { firstCost /= effectsCache.star1; }
        if (player.elements[13] >= 1) { firstCost /= 100; }
    } else if (stageIndex === 5) {
        if (index === 3) {
            scaling[3] = player.elements[31] >= 1 ? 1.1 : 1.11;
            if (player.challenges.active === 0) { scaling[3] += 0.05; }
        }
    }

    return new Overlimit(scaling[index]).power(player.buildings[stageIndex][index as 1].true).multiply(firstCost);
};

const gainBuildings = (get: number, stageIndex: number, time: number) => {
    let stageGet = stageIndex;
    const add = new Overlimit(time);
    if (stageIndex === 1) {
        if (!player.inflation.vacuum && get < 5) { get += 2; }
        add.multiply(assignBuildingsProduction[`S1Build${get + 1}` as 'S1Build1']());
        if (get === 5 && player.upgrades[1][8] !== 1) { return; }
        if (!player.inflation.vacuum) { get -= 2; }
    } else if (stageIndex === 5) {
        add.multiply(global.buildingsInfo.producing[5][1]).divide(4 ** get);
        stageGet = 4;
        get++;
    } else {
        add.multiply(assignBuildingsProduction[`S${stageIndex}Build${get + 1}` as 'S2Build1']());
        if (stageIndex === 4) { get = 0; }
    }
    if (add.lessOrEqual('0')) { return; }
    if (!add.isFinite()) {
        if (global.debug.errorGain) {
            global.debug.errorGain = false;
            Notify(`Error while gaining ${add} '${global.buildingsInfo.name[stageGet][get]}'`);
            setTimeout(() => { global.debug.errorGain = true; }, 6e4);
        }
        return;
    }

    const building = player.buildings[stageGet][get];
    building.current.plus(add);
    building.total.plus(add);
    building.trueTotal.plus(add);

    if (stageIndex === 1) {
        if (player.inflation.vacuum) {
            if (get === 0) {
                player.buildings[3][0].current.setValue(building.current).multiply('1.78266192e-33');
                player.buildings[3][0].total.setValue(building.total).multiply('1.78266192e-33');
                awardMilestone(0, 3);
            } else if (get === 5) {
                player.buildings[2][0].current.setValue(building.current).divide('6.02214076e23');
            }
        }
    } else if (stageIndex === 2) {
        if (get === 1) {
            assignBuildingsProduction.S2Levels();
        }
    } else if (stageIndex === 3) {
        if (get === 0) { //False vacuum only
            if (player.accretion.rank < 5 && building.current.moreThan('1e30')) { building.current.setValue('1e30'); }
            awardMilestone(0, 3);
        }
    }
};

const gainStrange = (time: number) => {
    const strange = player.strange[0];
    const add = global.strangeInfo.strangeletsInfo[0] * (global.strangeInfo.quarksGain / player.time.stage) * time;
    if (add <= 0) { return; }
    if (!isFinite(add)) {
        if (global.debug.errorGain) {
            global.debug.errorGain = false;
            Notify(`Error while gaining ${add} '${global.strangeInfo.name[0]}'`);
            setTimeout(() => { global.debug.errorGain = true; }, 6e4);
        }
        return;
    }
    strange.current += add;
    strange.total += add;
    assignBuildingsProduction.strange0();
};

export const buyUpgrades = (upgrade: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements', auto = false): boolean => {
    if (!auto && (!checkUpgrade(upgrade, stageIndex, type) || global.offline.active)) { return false; } //Auto should had already checked

    let free = false;
    let currency: Overlimit; //Readonly
    if (stageIndex === 1) {
        currency = new Overlimit(player.discharge.energy);
        if (player.inflation.vacuum) { free = player.accretion.rank >= 6 && player.strangeness[1][9] >= 1; }
    } else if (stageIndex === 2) {
        currency = player.buildings[2][1].current;
    } else if (stageIndex === 3) {
        currency = player.buildings[3][0].current;
    } else if (stageIndex === 6) {
        currency = player.buildings[6][0].current;
    } else {
        currency = player.buildings[4][0].current;
    }

    if (type === 'upgrades') {
        if (player.upgrades[stageIndex][upgrade] >= 1) { return false; }

        const pointer = global.upgradesInfo[stageIndex];
        const cost = pointer.startCost[upgrade];
        if (currency.lessThan(cost)) { return false; }

        player.upgrades[stageIndex][upgrade]++;
        if (!free) { currency.minus(cost); }

        /* Special cases */
        if (stageIndex === 2) {
            if (upgrade === 3) {
                effectsCache.S2Upgrade3 = calculateEffects.S2Upgrade3();
            } else if (upgrade === 4) {
                effectsCache.S2Upgrade4 = calculateEffects.S2Upgrade4();
            } else if (upgrade >= 5 /*&& upgrade < 9*/) { assignBuildingsProduction.S2FreeBuilds(); }
        } else if (stageIndex === 4 && upgrade === 1 && global.tab === 'upgrade') { switchTab('upgrade'); }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `New upgrade '${pointer.name[upgrade]}', has been created`; }
    } else if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];
        const level = player[type][stageIndex];

        if (level[upgrade] >= pointer.max[upgrade]) { return false; }
        let cost: number | Overlimit = pointer.cost[upgrade] as number;
        if (currency.lessThan(cost)) { return false; }

        let newLevels = 1;
        if ((auto || player.toggles.max[0]) && pointer.max[upgrade] > 1) {
            const scaling = pointer.scaling[upgrade]; //Must be >1 (>0 for Stage 1)
            if (stageIndex === 1) {
                if (free) {
                    newLevels = Math.min(Math.floor((currency.toNumber() - cost) / scaling + 1), pointer.max[upgrade] - level[upgrade]);
                } else {
                    const simplify = cost - scaling / 2;
                    newLevels = Math.min(Math.floor(((simplify ** 2 + 2 * scaling * currency.toNumber()) ** 0.5 - simplify) / scaling), pointer.max[upgrade] - level[upgrade]);
                    if (newLevels > 1) { cost = newLevels * (newLevels * scaling / 2 + simplify); }
                }
            } else {
                newLevels = Math.min(Math.floor(new Overlimit(currency).multiply(scaling - 1).divide(cost).plus('1').log(scaling).toNumber()), pointer.max[upgrade] - level[upgrade]);
                if (newLevels > 1) { cost = new Overlimit(scaling).power(newLevels).minus('1').divide(scaling - 1).multiply(cost); }
            }
        }

        level[upgrade] += newLevels;
        if (!free) { currency.minus(cost); }

        /* Special cases */
        if (type === 'researches') {
            if (stageIndex === 1) {
                if (upgrade === 4) {
                    global.dischargeInfo.base = calculateEffects.dischargeBase();
                }
            } else if (stageIndex === 2) {
                if (upgrade === 0 || upgrade === 1) {
                    assignBuildingsProduction.S2Levels();
                } else if (upgrade === 2) {
                    if (player.upgrades[2][3] === 1) { effectsCache.S2Upgrade3 = calculateEffects.S2Upgrade3(); }
                } else if (upgrade === 3) {
                    if (player.upgrades[2][4] === 1) { effectsCache.S2Upgrade4 = calculateEffects.S2Upgrade4(); }
                } else if (upgrade >= 4 /*&& upgrade < 7*/) {
                    assignBuildingsProduction.S2FreeBuilds();
                }
            } else if (stageIndex === 4) {
                if (upgrade === 2 || upgrade === 3) {
                    calculateMaxLevel(0, 4, 'researches');
                    if (auto) { buyUpgrades(0, 4, 'researches'); }
                    autoResearchesAddOne('researches', 4, 0);
                }
            }
        } else if (type === 'researchesExtra') {
            if (stageIndex === 1) {
                if (upgrade === 2) {
                    let update = false;
                    if (player.stage.current < 4) {
                        player.stage.current = player.researchesExtra[1][2] > 1 ? 2 : 3;
                        if (player.toggles.normal[0] && player.stage.active < 4) {
                            setActiveStage(player.stage.current);
                            update = true;
                        }
                    }
                    stageUpdate(update, true);
                    awardVoidReward(1);
                }
            } else if (stageIndex === 2) {
                if (upgrade === 1) {
                    assignBuildingsProduction.S2Levels();
                }
            } else if (stageIndex === 4) {
                if (upgrade === 2 || upgrade === 3) {
                    calculateMaxLevel(1, 4, 'researches', true);
                    if (player.stage.active === 4) { setRemnants(); }
                }
            }
        }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${level[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(level[upgrade])} for '${pointer.name[upgrade]}' ${type === 'researches' ? 'Stage' : ['', 'Energy', 'Cloud', 'Rank', 'Collapse', 'Galaxy'][player.stage.active]} Research`; }
    } else if (type === 'researchesAuto' || type === 'ASR') {
        if (type === 'ASR') { upgrade = stageIndex; }
        const pointer = global[`${type}Info`];
        const level = player[type];

        let effective = level[upgrade];
        if (effective >= pointer.max[upgrade]) { return false; }
        if (type === 'researchesAuto') {
            if (upgrade === 1) {
                if (player.strangeness[4][6] >= 1) { effective--; }
            } else if (upgrade === 2) {
                if (player.strangeness[1][4] >= 1) { effective--; }
                if (player.strangeness[2][4] >= 1) { effective--; }
                if (player.strangeness[3][4] >= 1) { effective--; }
                if (player.strangeness[4][4] >= 1) { effective--; }
                if (player.strangeness[5][9] >= 1) { effective--; }
            }
        }
        const cost = pointer.costRange[upgrade][Math.max(effective, 0)];
        if (currency.lessThan(cost)) { return false; }

        level[upgrade]++;
        if (!free) { currency.minus(cost); }

        /* Special cases */
        if (type === 'researchesAuto') {
            if (upgrade === 1) {
                for (let i = 1; i < playerStart.elements.length; i++) {
                    i = player.elements.indexOf(0.5, i);
                    if (i < 1) { break; }
                    buyUpgrades(i, 4, 'elements', true);
                }
            } else if (upgrade === 2) {
                if (player.inflation.vacuum) {
                    if (level[upgrade] === 1 && player.strangeness[3][4] >= 1) { level[upgrade] = 2; }
                    if (level[upgrade] === 2 && player.strangeness[2][4] >= 1) { level[upgrade] = 3; }
                    if (level[upgrade] === 3 && player.strangeness[4][4] >= 1) { level[upgrade] = 4; }
                    if (level[upgrade] === 4 && player.strangeness[5][9] >= 1) { level[upgrade] = 5; }
                }
            }
        }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${level[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(level[upgrade])} for '${type === 'ASR' ? pointer.name : pointer.name[upgrade]}' automatization Research`; }
    } else if (type === 'elements') {
        let level = player.elements[upgrade];
        if (level >= 1) { return false; }

        if (level === 0) {
            const cost = global.elementsInfo.startCost[upgrade];
            if (currency.lessThan(cost)) { return false; }
            /*if (!free) {*/ currency.minus(cost); //}
        } else if (!auto) { return false; }
        level = player.researchesAuto[1] >= 1 || level > 0 ? 1 : 0.5;
        player.elements[upgrade] = level;

        /* Special cases */
        if (player.collapse.show < upgrade) { player.collapse.show = upgrade; }
        if (level === 1) {
            if (player.collapse.maxElement < upgrade) { player.collapse.maxElement = upgrade; }

            if (upgrade === 7 || upgrade === 16 || upgrade === 20 || upgrade === 25 || upgrade === 28) {
                calculateMaxLevel(1, 4, 'researches', true);
            } else if (upgrade === 9 || upgrade === 17) {
                calculateMaxLevel(0, 4, 'researches', true);
            } else if (upgrade === 11) {
                calculateMaxLevel(2, 4, 'researches', true);
            } else if (upgrade === 26) {
                player.stage.current = 5;
                if (player.stage.true < 5) {
                    player.stage.true = 5;
                    player.event = false;
                    visualTrueStageUnlocks();
                }
                if (player.toggles.normal[0] && player.stage.active === 4 && (!player.inflation.vacuum || player.strangeness[5][3] >= 1)) {
                    setActiveStage(5);
                    stageUpdate(true, true);
                } else { stageUpdate(false, true); }
                assignBuildingsProduction.strange0();
                awardVoidReward(4);
            } else if (upgrade === 32) {
                calculateMaxLevel(5, 4, 'researches', true);
            }
        }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `New Element '${global.elementsInfo.name[upgrade]}' ${player.elements[upgrade] >= 1 ? 'obtained' : 'awaiting activation'}`; }
    }

    if (!free) {
        if (stageIndex === 1) {
            player.discharge.energy = Math.round(currency.toNumber());
        } else if (stageIndex === 2) {
            const drops = player.buildings[2][1];
            const old = drops.true;
            if (player.buildings[2][2].true < 1 && currency.lessThan(old)) {
                drops.true = Math.floor(currency.toNumber());
                if (player.inflation.vacuum) {
                    addEnergy(drops.true - old, 1, 2);
                } else if (currency.lessOrEqual('0')) {
                    player.buildings[2][0].current.max('2.7753108348135e-3');
                }
            }
        } else if (stageIndex === 3) {
            if (player.inflation.vacuum) { player.buildings[1][0].current.setValue(currency).divide('1.78266192e-33'); }
        }
    }

    if (type === 'upgrades' || type === 'elements') {
        visualUpdateUpgrades(upgrade, stageIndex, type);
    } else {
        if (type !== 'researchesAuto' && type !== 'ASR') { calculateResearchCost(upgrade, stageIndex, type); }
        visualUpdateResearches(upgrade, stageIndex, type);
    }
    if (!auto) { numbersUpdate(); }
    return true;
};

export const buyStrangeness = (upgrade: number, stageIndex: number, type: 'strangeness' | 'inflations', auto = false): boolean => {
    if (!auto && (!checkUpgrade(upgrade, stageIndex, type) || global.offline.active)) { return false; }

    if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        if (player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade]) { return false; }
        if (player.strange[0].current < pointer.cost[upgrade]) { return false; }

        player.strangeness[stageIndex][upgrade]++;
        player.strange[0].current -= pointer.cost[upgrade];

        /* Special cases */
        if (stageIndex === 1) {
            if (upgrade === 4) {
                if (player.inflation.vacuum) {
                    const maxLevel = player.strangeness[3][4] < 1 ? 1 : player.strangeness[2][4] < 1 ? 2 : player.strangeness[4][4] < 1 ? 3 : player.strangeness[5][9] < 1 ? 4 : 5;
                    if (player.clone.depth === 'stage' && player.clone.researchesAuto[2] < 1) { player.clone.researchesAuto[2] = maxLevel; }
                    if (player.researchesAuto[2] < 1) { player.researchesAuto[2] = maxLevel; }
                } else if (player.stage.current === 1 && player.researchesAuto[2] < 1) { player.researchesAuto[2] = 1; }
                visualUpdateResearches(2, 0, 'researchesAuto');
            } else if (upgrade === 5) {
                if (player.clone.depth === 'stage') { player.clone.ASR[1] = global.ASRInfo.max[1]; }
                player.ASR[1] = global.ASRInfo.max[1];
                visualUpdateResearches(0, 1, 'ASR');
            } else if (upgrade === 7) {
                assignResetInformation.trueEnergy();
            }
        } else if (stageIndex === 2) {
            if (upgrade === 2) {
                calculateMaxLevel(4, 2, 'researches', true);
                calculateMaxLevel(5, 2, 'researches', true);
            } else if (upgrade === 4) {
                if (player.inflation.vacuum) {
                    const maxLevel = player.strangeness[4][4] < 1 ? 3 : player.strangeness[5][9] < 1 ? 4 : 5;
                    if (player.clone.depth === 'stage' && player.clone.researchesAuto[2] === 2) { player.clone.researchesAuto[2] = maxLevel; }
                    if (player.researchesAuto[2] === 2) { player.researchesAuto[2] = maxLevel; }
                } else if (player.stage.current === 2 && player.researchesAuto[2] < 1) { player.researchesAuto[2] = 1; }
                visualUpdateResearches(2, 0, 'researchesAuto');
            } else if (upgrade === 5) {
                if (player.clone.depth === 'stage') { player.clone.ASR[2] = global.ASRInfo.max[2]; }
                player.ASR[2] = global.ASRInfo.max[2];
                visualUpdateResearches(0, 2, 'ASR');
            } else if (upgrade === 8) {
                calculateMaxLevel(2, 2, 'researches', true);
                calculateMaxLevel(3, 2, 'researches', true);
            }
        } else if (stageIndex === 3) {
            if (upgrade === 2) {
                calculateMaxLevel(0, 3, 'researchesExtra', true);
                calculateMaxLevel(1, 3, 'researchesExtra', true);
            } else if (upgrade === 4) {
                if (player.inflation.vacuum) {
                    const maxLevel = player.strangeness[2][4] < 1 ? 2 : player.strangeness[4][4] < 1 ? 3 : player.strangeness[5][9] < 1 ? 4 : 5;
                    if (player.clone.depth === 'stage' && player.clone.researchesAuto[2] === 1) { player.clone.researchesAuto[2] = maxLevel; }
                    if (player.researchesAuto[2] === 1) { player.researchesAuto[2] = maxLevel; }
                } else if (player.stage.current === 3 && player.researchesAuto[2] < 1) { player.researchesAuto[2] = 1; }
                visualUpdateResearches(2, 0, 'researchesAuto');
            } else if (upgrade === 5) {
                if (player.clone.depth === 'stage') { player.clone.ASR[3] = global.ASRInfo.max[3]; }
                player.ASR[3] = global.ASRInfo.max[3];
                visualUpdateResearches(0, 3, 'ASR');
            } else if (upgrade === 6) {
                if (player.clone.depth === 'stage') { player.clone.researchesAuto[0] = Math.max(player.strangeness[3][6], player.clone.researchesAuto[0]); }
                player.researchesAuto[0] = Math.max(player.strangeness[3][6], player.researchesAuto[0]);
                visualUpdateResearches(0, 0, 'researchesAuto');
            } else if (upgrade === 9) {
                calculateMaxLevel(2, 0, 'researchesAuto', true);
                global.debug.rankUpdated = null;
                assignResetInformation.maxRank();
            }
        } else if (stageIndex === 4) {
            if (upgrade === 4) {
                if (player.inflation.vacuum) {
                    const maxLevel = player.strangeness[5][9] < 1 ? 4 : 5;
                    if (player.clone.depth === 'stage' && player.clone.researchesAuto[2] === 3) { player.clone.researchesAuto[2] = maxLevel; }
                    if (player.researchesAuto[2] === 3) { player.researchesAuto[2] = maxLevel; }
                } else if (player.stage.current === 4 && player.researchesAuto[2] < 1) { player.researchesAuto[2] = 1; }
                visualUpdateResearches(2, 0, 'researchesAuto');
            } else if (upgrade === 5) {
                if (player.clone.depth === 'stage') { player.clone.ASR[4] = global.ASRInfo.max[4]; }
                player.ASR[4] = global.ASRInfo.max[4];
                visualUpdateResearches(0, 4, 'ASR');
            } else if (upgrade === 6) {
                if (player.clone.depth === 'stage') { player.clone.researchesAuto[1] = Math.max(player.strangeness[4][6], player.clone.researchesAuto[1]); }
                player.researchesAuto[1] = Math.max(player.strangeness[4][6], player.researchesAuto[1]);
                visualUpdateResearches(1, 0, 'researchesAuto');
                for (let i = 1; i < playerStart.elements.length; i++) {
                    i = player.elements.indexOf(0.5, i);
                    if (i < 1) { break; }
                    buyUpgrades(i, 4, 'elements', true);
                }
            } else if (upgrade === 8) {
                if (player.clone.depth === 'stage') { player.clone.elements[0] = 1; }
                if (player.elements[0] < 1) {
                    player.elements[0] = 1;
                    visualUpdateUpgrades(0, 4, 'elements');
                }
            }
        } else if (stageIndex === 5) {
            if (upgrade === 3) {
                if (player.inflation.vacuum) { stageUpdate(false, true); }
            } else if (upgrade === 4) {
                if (player.strangeness[5][5] >= 1) {
                    if (player.clone.depth === 'stage') { player.clone.ASR[5] = global.ASRInfo.max[5]; }
                    player.ASR[5] = global.ASRInfo.max[5];
                    visualUpdateResearches(0, 5, 'ASR');
                }
            } else if (upgrade === 5) {
                const newLevel = player.strangeness[5][4] >= 1 ? global.ASRInfo.max[5] : 2;
                if (player.clone.depth === 'stage') { player.clone.ASR[5] = newLevel; }
                player.ASR[5] = newLevel;
                visualUpdateResearches(0, 5, 'ASR');
            } else if (upgrade === 9) {
                if (player.clone.depth === 'stage' && player.clone.researchesAuto[2] === 4) { player.clone.researchesAuto[2] = 5; }
                if (player.researchesAuto[2] === 4) {
                    player.researchesAuto[2] = 5;
                    visualUpdateResearches(2, 0, 'researchesAuto');
                }
            } else if (upgrade === 10) {
                assignResetInformation.trueEnergy();
            }
        }
        assignBuildingsProduction.strange0();
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(player.strangeness[stageIndex][upgrade])} for '${pointer.name[upgrade]}' Strangeness from ${global.stageInfo.word[stageIndex]} section`; }
    } else if (type === 'inflations') {
        const pointer = global.inflationTreeInfo;

        if (player.inflation.tree[upgrade] >= pointer.max[upgrade]) { return false; }
        const cost = pointer.cost[upgrade];
        if (player.cosmon.current < cost) { return false; }

        if (pointer.refundable[upgrade]) {
            player.inflation.spent += cost;
        } else if (cost !== 0) { return false; }
        player.inflation.tree[upgrade]++;
        player.cosmon.current -= cost;

        /* Special cases */
        if (upgrade === 0) {
            assignChallengeInformation();
            for (let s = 1; s < 6; s++) {
                for (let i = 0; i < playerStart.milestones[s].length; i++) {
                    assignMilestoneInformation(i, s);
                }
            }
        } else if (upgrade === 4) {
            if (!player.challenges.super) { assignChallengeInformation(); }
        }
        if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Strength of Inflation Research '${pointer.name[upgrade]}' increased ${player.inflation.tree[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(player.inflation.tree[upgrade])}`; }
    }

    calculateResearchCost(upgrade, stageIndex, type);
    visualUpdateResearches(upgrade, stageIndex, type);
    if (!auto) { numbersUpdate(); }
    return true;
};

export const inflationRefund = async() => {
    const { tree } = player.inflation;
    const challenge = player.challenges.active;
    if (global.offline.active || (player.inflation.spent === 0 && tree[0] < 1) || !await Confirm(`This will cause Stage reset to refund spent Cosmon${challenge !== null ? ' and restart current Challenge' : ''}, continue?`)) { return; }

    if (challenge !== null) {
        player.challenges.active = null;
        challengeReset(null, challenge);
    }
    stageFullReset();
    if (challenge !== null) {
        player.challenges.active = challenge;
        challengeReset(challenge, null);
    }

    player.cosmon.current += player.inflation.spent;
    player.inflation.spent = 0;
    const refundable = global.inflationTreeInfo.refundable;
    for (let i = 0; i < refundable.length; i++) {
        if (!refundable[i]) { continue; }

        tree[i] = 0;
        visualUpdateResearches(i, 0, 'inflations');
        calculateResearchCost(i, 0, 'inflations');
    }

    /* Special cases */
    assignChallengeInformation();
    for (let s = 1; s < 6; s++) {
        for (let i = 0; i < playerStart.milestones[s].length; i++) {
            assignMilestoneInformation(i, s);
        }
    }
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Cosmon has been refunded'; }
};

export const calculateResearchCost = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'strangeness' | 'inflations') => {
    if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];

        if (stageIndex === 1) {
            pointer.cost[research] = (pointer.startCost[research] as number) + pointer.scaling[research] * player[type][stageIndex][research];
        } else {
            (pointer.cost[research] as Overlimit).setValue(pointer.scaling[research]).power(player[type][stageIndex][research]).multiply(pointer.startCost[research]);
        }
    } else if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        pointer.cost[research] = player.inflation.vacuum ?
            Math.floor(Math.round((pointer.startCost[research] * pointer.scaling[research] ** player.strangeness[stageIndex][research]) * 100) / 100) :
            Math.floor(Math.round((pointer.startCost[research] + pointer.scaling[research] * player.strangeness[stageIndex][research]) * 100) / 100);
    } else if (type === 'inflations') {
        const pointer = global.inflationTreeInfo;

        pointer.cost[research] = Math.floor(Math.round((pointer.startCost[research] + pointer.scaling[research] * player.inflation.tree[research]) * 100) / 100);
    }
};

export const calculateMaxLevel = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'strangeness' | 'inflations', addAuto = false) => {
    let max = null;
    if (type === 'researches') {
        if (stageIndex === 2) {
            if (research === 2) {
                max = 4;
                if (player.strangeness[2][8] >= 1) { max += 3; }
            } else if (research === 3) {
                max = 4;
                if (player.strangeness[2][8] >= 2) { max++; }
            } else if (research === 4) {
                max = 2;
                if (player.strangeness[2][2] >= 1) { max++; }
            } else if (research === 5) {
                max = 1;
                if (player.strangeness[2][2] >= 2) { max++; }
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                max = 3 + (3 * player.researches[4][2]) + (3 * player.researches[4][3]);
                if (player.elements[9] >= 1) { max += 12; }
                if (player.elements[17] >= 1) { max += 24; }
            } else if (research === 1) {
                max = 2 + player.researchesExtra[4][2] + player.researchesExtra[4][3];
                if (player.elements[7] >= 1) { max += 2; }
                if (player.elements[16] >= 1) { max++; }
                if (player.elements[20] >= 1) { max++; }
                if (player.elements[25] >= 1) { max++; }
                if (player.elements[28] >= 1) { max++; }
            } else if (research === 2) {
                max = 1;
                if (player.elements[11] >= 1) { max++; }
            } else if (research === 5) {
                max = 1;
                if (player.elements[32] >= 1) { max++; }
            }
        } else if (stageIndex === 5) {
            if (research === 0) {
                max = player.inflation.vacuum ? 4 : 3;
            } else if (research === 1) {
                max = player.inflation.vacuum ? 4 : 3;
            } else if (research === 2) {
                max = player.buildings[6][1].true >= 3 ? 6 : 2;
            } else if (research === 3) {
                max = player.buildings[6][1].true >= 3 ? 6 : 2;
            }
        }
    } else if (type === 'researchesExtra') {
        if (stageIndex === 3) {
            if (research === 0) {
                max = Math.floor(14 + (2 * calculateEffects.effectiveRank()));
                if (player.strangeness[3][2] >= 1) { max += 6; }
            } else if (research === 1) {
                max = 6;
                if (player.strangeness[3][2] >= 2) { max += 2; }
            } else if (research === 4) {
                max = player.accretion.rank - 2;
            }
        } else if (stageIndex === 5) {
            if (research === 1) {
                max = player.buildings[6][1].true >= 3 ? 2 : 1;
            }
        }
    } else if (type === 'researchesAuto') {
        if (research === 2) {
            max = player.inflation.vacuum ? (player.strangeness[3][9] >= 1 ? 5 : 4) : 1;
        }
    } else if (type === 'ASR') {
        if (stageIndex === 1) {
            max = player.inflation.vacuum ? 5 : 3;
        } else if (stageIndex === 2) {
            max = player.inflation.vacuum ? 6 : 5;
        } else if (stageIndex === 3) {
            max = player.inflation.vacuum ? 5 : 4;
        } else if (stageIndex === 4) {
            max = player.inflation.vacuum ? 5 : 4;
        }
    } else if (type === 'strangeness') {
        if (stageIndex === 1) {
            if (research === 0) {
                max = 6;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 3) {
                max = 2;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = player.inflation.vacuum && player.challenges.void[4] >= 1 ? 2 : 1;
            }
        } else if (stageIndex === 2) {
            if (research === 1) {
                max = 8;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 3) {
                max = 2;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = player.inflation.vacuum && player.challenges.void[4] >= 1 ? 2 : 1;
            }
        } else if (stageIndex === 3) {
            if (research === 0) {
                max = 8;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 1) {
                max = 4;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = player.inflation.vacuum && player.challenges.void[4] >= 1 ? 2 : 1;
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                max = 8;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 1) {
                max = 4;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = player.inflation.vacuum && player.challenges.void[4] >= 1 ? 2 : 1;
            } else if (research === 6) {
                max = player.inflation.vacuum || player.milestones[4][0] >= 8 || player.buildings[6][1].current.moreOrEqual('3') ? 2 : 1;
            }
        } else if (stageIndex === 5) {
            if (research === 2) {
                max = 2;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 6) {
                max = !player.inflation.vacuum && (player.milestones[5][0] >= 8 || player.buildings[6][1].current.lessThan('5')) ? 2 : 1;
            }
        }
    }
    if (max !== null) {
        if (max < 0) { max = 0; }
        if (type === 'inflations') {
            global.inflationTreeInfo.max[research] = max;
        } else if (type === 'researchesAuto' || type === 'ASR') {
            global[`${type}Info`].max[type === 'ASR' ? stageIndex : research] = max;
        } else {
            global[`${type}Info`][stageIndex].max[research] = max;
        }
    }

    if (type !== 'researchesAuto' && type !== 'ASR') { calculateResearchCost(research, stageIndex, type); }
    visualUpdateResearches(research, stageIndex, type);
    if (addAuto && (type === 'researches' || type === 'researchesExtra')) { autoResearchesAddOne(type, stageIndex, research); }
};

export const autoUpgradesSet = (which: number) => {
    if (!player.toggles.auto[5]) { return; }
    const array = [];
    const level = player.upgrades[which];
    for (let i = 0; i < global.upgradesInfo[which].maxActive; i++) {
        if (level[i] < 1) { array.push(i); }
    }
    if (which === 1) {
        const startCost = global.upgradesInfo[which].startCost as number[];
        array.sort((a, b) => startCost[a] - startCost[b]);
    } else {
        const startCost = global.upgradesInfo[which].startCost as Overlimit[];
        array.sort((a, b) => compareFunc(startCost[a], startCost[b]));
    }
    global.automatization.autoU[which] = array;
};

const autoUpgradesBuy = (stageIndex: number) => {
    const auto = global.automatization.autoU[stageIndex];
    if (auto.length < 1 || player.researchesAuto[0] < 1) { return; }

    for (let i = 0; i < auto.length; i++) {
        const index = auto[i];

        if (!checkUpgrade(index, stageIndex, 'upgrades')) { continue; }
        buyUpgrades(index, stageIndex, 'upgrades', true);

        if (player.upgrades[stageIndex][index] >= 1) {
            auto.splice(i, 1);
            i--;
        } else { break; }
    }
};

export const autoResearchesSet = (type: 'researches' | 'researchesExtra', which: number) => {
    if (!player.toggles.auto[type === 'researches' ? 6 : 7]) { return; }
    const array = [];
    const level = player[type][which];
    const pointer = global[`${type}Info`][which];
    for (let i = 0; i < pointer.maxActive; i++) {
        if (level[i] < pointer.max[i]) { array.push(i); }
    }
    if (which === 1) {
        const cost = pointer.cost as number[];
        array.sort((a, b) => cost[a] - cost[b]);
    } else {
        const cost = pointer.cost as Overlimit[];
        array.sort((a, b) => compareFunc(cost[a], cost[b]));
    }
    global.automatization[type === 'researches' ? 'autoR' : 'autoE'][which] = array;
};
/** Add Research if it isn't already present */
const autoResearchesAddOne = (type: 'researches' | 'researchesExtra', stageIndex: number, which: number) => {
    const pointer = global[`${type}Info`][stageIndex];
    if (player[type][stageIndex][which] >= pointer.max[which] || !player.toggles.auto[type === 'researches' ? 6 : 7]) { return; }

    const auto = global.automatization[type === 'researches' ? 'autoR' : 'autoE'][stageIndex];
    if (auto.includes(which)) { return; }
    const cost = pointer.cost[which] as Overlimit;
    for (let i = 0; i < auto.length; i++) {
        if (stageIndex === 1 ? cost < pointer.cost[auto[i]] : cost.lessThan(pointer.cost[auto[i]])) {
            auto.splice(i, 0, which);
            return;
        }
    }
    auto.push(which);
};

const autoResearchesBuy = (type: 'researches' | 'researchesExtra', stageIndex: number) => {
    const auto = global.automatization[type === 'researches' ? 'autoR' : 'autoE'][stageIndex];
    if (auto.length < 1 || player.researchesAuto[0] < (type === 'researches' ? 2 : 3)) { return; }
    const pointer = global[`${type}Info`][stageIndex];

    for (let i = 0; i < auto.length; i++) {
        if (!checkUpgrade(auto[i], stageIndex, type)) { continue; }
        const bought = buyUpgrades(auto[i], stageIndex, type, true);

        if (player[type][stageIndex][auto[i]] >= pointer.max[auto[i]]) {
            auto.splice(i, 1);
            i--;
        } else if (bought) {
            const index = i;
            if (stageIndex === 1) {
                while (pointer.cost[auto[index]] > pointer.cost[auto[i + 1]]) { i++; }
            } else {
                while ((pointer.cost[auto[index]] as Overlimit).moreThan(pointer.cost[auto[i + 1]])) { i++; }
            }
            if (index === i) { break; }
            auto.splice(i, 0, auto.splice(index, 1)[0]);
            i = index - 1;
        } else { break; }
    }
};

export const autoElementsSet = () => {
    if (!player.toggles.auto[8]) { return; }

    const array = [];
    const elements = player.elements;
    for (let i = 1; i < (player.inflation.vacuum ? playerStart.elements.length : 29); i++) {
        if (elements[i] < 1) { array.push(i); }
    }
    global.automatization.elements = array;
};

const autoElementsBuy = () => {
    const auto = global.automatization.elements;
    if (auto.length < 1 || player.researchesAuto[1] < 2) { return; }
    const elements = player.elements;

    for (let i = 0; i < auto.length; i++) {
        const index = auto[i];

        if (!checkUpgrade(index, 4, 'elements')) { break; }
        buyUpgrades(index, 4, 'elements', true);

        if (elements[index] > 0) {
            auto.splice(i, 1);
            i--;
        } else { break; }
    }
};

export const toggleSwap = (number: number, type: 'buildings' | 'normal' | 'hover' | 'max' | 'auto', change = false) => {
    const toggles = type === 'buildings' ? player.toggles.buildings[player.stage.active] : player.toggles[type];

    if (change) {
        if (global.offline.active) { return; }
        if (type === 'buildings') {
            const maxLength = playerStart.buildings[player.stage.active].length;
            if (number === 0) {
                toggles[0] = !toggles[0];
                for (let i = 1; i < maxLength; i++) {
                    toggles[i] = toggles[0];
                    toggleSwap(i, 'buildings');
                }
            } else {
                if (number >= maxLength) { return; }

                let anyOn = false;
                toggles[number] = !toggles[number];
                for (let i = 1; i <= player.ASR[player.stage.active]; i++) {
                    if (toggles[i]) {
                        anyOn = true;
                        break;
                    }
                }
                if (toggles[0] !== anyOn) {
                    toggles[0] = anyOn;
                    toggleSwap(0, 'buildings');
                }
            }
        } else { toggles[number] = !toggles[number]; }
    }

    let extraText;
    let toggleHTML;
    if (type === 'buildings') {
        toggleHTML = getId(`toggleBuilding${number}`);
        extraText = number === 0 ? 'All ' : 'Auto ';
    } else if (type === 'hover') {
        toggleHTML = getId(`toggleHover${number}`);
        extraText = 'Hover to create ';
    } else if (type === 'max') {
        toggleHTML = getId(`toggleMax${number}`);
        extraText = 'Max create ';
    } else if (type === 'auto') {
        toggleHTML = getId(`toggleAuto${number}`);
        extraText = 'Auto ';
    } else {
        toggleHTML = getId(`toggleNormal${number}`);
        extraText = '';
    }

    if (!toggles[number]) {
        toggleHTML.style.color = 'var(--red-text)';
        toggleHTML.style.borderColor = 'crimson';
        toggleHTML.textContent = `${extraText}OFF`;
    } else {
        toggleHTML.style.color = '';
        toggleHTML.style.borderColor = '';
        toggleHTML.textContent = `${extraText}ON`;
    }
};

export const toggleConfirm = (number: number, change = false) => {
    const toggles = player.toggles.confirm;
    if (change) { toggles[number] = toggles[number] === 'Safe' ? 'None' : 'Safe'; }

    const toggleHTML = getId(`toggleConfirm${number}`);
    toggleHTML.textContent = toggles[number];
    if (toggles[number] === 'Safe') {
        toggleHTML.style.color = '';
        toggleHTML.style.borderColor = '';
    } else {
        toggleHTML.style.color = 'var(--red-text)';
        toggleHTML.style.borderColor = 'crimson';
    }
};

/** Returns true for Auto only if reset happened */
export const stageResetCheck = (stageIndex: number, quarks = null as number | null): boolean => {
    const allowedChallenge = player.challenges.active === null || global.challengesInfo[player.challenges.active].resetType !== 'stage';
    if (stageIndex === 5) {
        assignResetInformation.quarksGain(); //Also visually updates numbers
        if (quarks !== null) {
            if (player.elements[26] < 0.5) { return false; }

            const { stage } = player;
            const peakCheck = global.strangeInfo.quarksGain / player.time.stage;
            if (stage.peak < peakCheck) { stage.peak = peakCheck; }

            if (player.elements[26] < 1 || !allowedChallenge) { return false; }
            if (player.strangeness[5][8] >= 1) { gainStrange(quarks); }

            if (!player.toggles.auto[0] || player.strangeness[5][6] < (player.inflation.vacuum ? 1 : 2) ||
                (stage.input[0] <= 0 && stage.input[1] <= 0) || stage.input[0] > global.strangeInfo.quarksGain || stage.input[1] > player.time.stage) { return false; }
            stageResetReward(stageIndex);
            return true;
        }
        return allowedChallenge && player.elements[26] >= 1;
    } else if (stageIndex === 3) {
        if (player.buildings[3][0].current.lessThan('2.45576045e31')) { return false; }
    } else if (stageIndex === 2) {
        if (player.buildings[2][1].current.lessThan('1.19444e29')) { return false; }
    } else if (stageIndex === 1) {
        if (player.buildings[1][3].current.lessThan('1.67133125e21')) { return false; }
    } else { return false; }

    if (!allowedChallenge) { return false; }
    if (quarks !== null) { //Just checks if auto
        if (player.strangeness[5][6] < 1) { return false; }
        if (player.toggles.normal[2]) { //False vacuum only
            const info = global.milestonesInfo[stageIndex];
            const unlimitedTime = player.inflation.tree[4] >= 1;
            for (let i = 0; i < info.max.length; i++) {
                if (player.milestones[stageIndex][i] < info.max[i] && (unlimitedTime || info.time[i] >= player.time.stage)) { return false; }
            }
        }
        stageResetReward(stageIndex);
    }
    return true;
};
export const stageResetUser = async() => {
    if (global.offline.active) { return; }
    const active = player.inflation.vacuum || (player.stage.active === 4 && (player.stage.true >= 7 || player.event)) ? 5 : player.stage.active;
    if (!stageResetCheck(active)) { return; }

    if (player.toggles.confirm[0] !== 'None' && active === 5) {
        const array = [];
        if (player.upgrades[5][3] === 1) {
            if (player.inflation.vacuum) {
                assignResetInformation.mergeReward();
                const universeCost = calculateBuildingsCost(1, 6).toNumber();
                const maxResets = calculateEffects.mergeMaxResets();
                if (universeCost <= player.merge.reward[0] + (player.merge.resets < maxResets ? global.mergeInfo.checkReward[0] : 0)) {
                    array.push(`can create an Universe${universeCost > player.merge.reward[0] ? ' after Merge' : ''}`);
                } else if (player.merge.resets < maxResets) {
                    array.push('still capable to do more Merge resets');
                }
            } else if (player.buildings[5][3].true >= 22) {
                array.push('can Collapse Vacuum into its true state');
            }
        }
        if (player.researchesExtra[5][0] >= 1) {
            const galaxyCost = calculateBuildingsCost(3, 5).toNumber();
            if (galaxyCost <= Math.max(player.collapse.mass, global.collapseInfo.newMass)) {
                array.push(`can afford a Galaxy${galaxyCost > player.collapse.mass ? ' after Collapse' : ''}`);
            }
        }
        if (array.length > 0) {
            if (!await Confirm(`Prevented Stage reset because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!stageResetCheck(active)) { return Notify('Stage reset canceled, requirements are no longer met'); }
        }
    }
    if (globalSave.SRSettings[0]) {
        let message;
        if (player.stage.true >= 5) {
            message = `Caused Stage reset for ${format(active >= 4 ? global.strangeInfo.quarksGain : calculateEffects.strangeGain(false))} Strange quarks`;
            const strangelets = player.strangeness[5][8] >= 1 ? calculateEffects.strangeGain(active >= 4, 1) : 0;
            if (strangelets > 0) { message += ` and ${format(strangelets)} Strangelets`; }
        } else { message = `${global.stageInfo.word[player.stage.true]} Stage ended, but new one started`; }
        getId('SRMain').textContent = message;
    }
    stageResetReward(active);
};

const stageResetReward = (stageIndex: number) => {
    const { stage } = player;

    stage.resets++;
    let fullReset = true;
    let update: null | boolean = true;
    const resetThese = player.inflation.vacuum ? [1, 2, 3, 4, 5] : [stageIndex];
    if (player.inflation.vacuum) {
        if (stage.active === 1 || stage.active >= 6) {
            update = false;
        } else { setActiveStage(1); }
        stage.current = 1;
        if (stage.true >= 7) {
            resetThese.push(6);
        } else if (stage.resets < 2) { playEvent(7); }
    } else if (stageIndex === stage.current) {
        if (stageIndex < 4) {
            const check = stage.current === stage.active;
            stage.current++;
            if (stage.current === 2 && player.milestones[2][1] >= 7) { stage.current++; }
            if (stage.current === 3 && player.milestones[3][1] >= 7) { stage.current++; }
            if (check) {
                setActiveStage(stage.current);
            } else { update = false; }
            if (stage.current > stage.true) {
                stage.true = stage.current;
                player.event = false;
                visualTrueStageUnlocks();
            }
        } else {
            stage.current = player.milestones[1][1] < 6 ? 1 : player.milestones[2][1] < 7 ? 2 : player.milestones[3][1] < 7 ? 3 : 4;
            if ((stage.active === 4 && stage.current !== 4) || stage.active === 5) {
                setActiveStage(stage.current);
            } else { update = false; }
            resetThese.unshift(4);
        }
        if (stage.true >= 7) { resetThese.push(6); }
    } else {
        update = stageIndex === stage.active ? false : null;
        fullReset = false;
    }

    if (stage.true >= 5) {
        const { strange } = player;
        const exportReward = player.time.export;
        const quarks = stageIndex >= 4 ? global.strangeInfo.quarksGain : calculateEffects.strangeGain(false);
        const strangelets = player.strangeness[5][8] >= 1 ? calculateEffects.strangeGain(stageIndex >= 4, 1) : 0;
        strange[0].current += quarks;
        strange[0].total += quarks;
        if (strangelets > 0) {
            strange[1].current += strangelets;
            strange[1].total += strangelets;
            if (strangelets > exportReward[2]) { exportReward[2] = strangelets; }
            assignBuildingsProduction.strange1();
        }
        if (quarks > exportReward[1]) { exportReward[1] = quarks; }
        if (resetThese.includes(4)) { player.elements[26] = 0; } //Lazy fix for Strange boost
        assignBuildingsProduction.strange0();

        if (stageIndex >= 4) {
            const history = player.history.stage;
            const storage = global.historyStorage.stage;
            const realTime = player.time.stage;
            storage.unshift([realTime, quarks, strangelets, 0]);
            if (storage.length > 100) { storage.length = 100; }
            if (quarks / realTime > history.best[1] / history.best[0]) {
                history.best = [realTime, quarks, strangelets, 0];
            }
        }
    }

    resetStage(resetThese, update, fullReset);
};
/* Export if required */
const stageFullReset = () => {
    const vacuum = player.inflation.vacuum;
    const current = vacuum ? 5 : player.stage.current;
    if (!vacuum) {
        if (current !== 1 && player.milestones[1][1] >= 6) {
            if (stageResetCheck(1)) {
                stageResetReward(1);
            } else { resetStage([1], false, false); }
        }
        if (current !== 2 && player.milestones[2][1] >= 7) {
            if (stageResetCheck(2)) {
                stageResetReward(2);
            } else { resetStage([2], false, false); }
        }
        if (current !== 3 && player.milestones[3][1] >= 7) {
            if (stageResetCheck(3)) {
                stageResetReward(3);
            } else { resetStage([3], false, false); }
        }
    }

    if (stageResetCheck(current)) {
        stageResetReward(current);
    } else {
        const resetThese = vacuum ? [1, 2, 3, 4, 5] : [current];
        if (player.stage.true >= 7) { resetThese.push(6); }
        let update = false;
        if (vacuum) {
            if (player.stage.active !== 1 && player.stage.active < 6) {
                setActiveStage(1);
                update = true;
            }
            player.stage.current = 1;
        }
        resetStage(resetThese, update);
    }
};

export const switchStage = (stage: number, active = stage) => {
    if (!global.stageInfo.activeAll.includes(stage) || player.stage.active === stage) {
        if (player.stage.active === stage && global.trueActive !== stage) {
            global.trueActive = stage;
            getId(`stageSwitch${stage}`).style.textDecoration = 'underline';
        }
        if (!global.offline.active) {
            visualUpdate();
            numbersUpdate();
        }
        return;
    }

    setActiveStage(stage, active);
    stageUpdate();
};

/** Doesn't check for Stage being unlocked, requires stageUpdate() call afterwards */
export const setActiveStage = (stage: number, active = stage) => {
    getId(`stageSwitch${player.stage.active}`).style.textDecoration = '';
    player.stage.active = stage;
    global.trueActive = active;
    getId(`stageSwitch${stage}`).style.textDecoration = 'underline' + (global.trueActive !== stage ? ' dashed' : '');

    if (global.tab === 'inflation') {
        if (stage !== 6) { switchTab('upgrade'); }
    } else if (global.tab === 'Elements') {
        if (stage !== 4 && stage !== 5) { switchTab('upgrade'); }
    }
    if (global.tab === 'upgrade') {
        if (global.subtab.upgradeCurrent === 'Elements' && stage !== 4 && stage !== 5) { switchTab('upgrade', 'Upgrades'); }
    }
};

/** Returns true for Auto only if reset happened */
const dischargeResetCheck = (goals = false): boolean => {
    if (player.upgrades[1][5] !== 1) { return false; }
    const info = global.dischargeInfo;
    const energy = player.discharge.energy;
    const level = player.strangeness[1][4];

    global.dischargeInfo.next = calculateEffects.dischargeCost();
    if (goals) {
        if (level >= 2 && energy >= info.next) {
            dischargeReset(true);
            if (!player.toggles.auto[1]) { return false; }
        } else if (!player.toggles.auto[1] || (level < 1 && (player.researchesAuto[2] < 1 || (!player.inflation.vacuum && player.stage.current !== 1)))) { return false; }

        if (energy >= info.energyTrue && (level >= 2 || energy < info.next)) { return false; }
        dischargeReset();
        return true;
    }
    return energy < info.energyTrue || (level < 2 && energy >= info.next);
};
export const dischargeResetUser = async() => {
    if (global.offline.active || !dischargeResetCheck()) { return; }

    if (player.toggles.confirm[1] !== 'None') {
        if (player.stage.active !== 1) {
            if (!await Confirm("Prevented Discharge because current active Stage isn't Microworld\nReset anyway?")) { return; }
            if (!dischargeResetCheck()) { return Notify('Discharge canceled, requirements are no longer met'); }
        }
    }

    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Caused Discharge to reset spent Energy${player.discharge.energy >= global.dischargeInfo.next ? ', also reached new goal' : ''}`; }
    dischargeReset();
    numbersUpdate();
};

const dischargeReset = (noReset = false) => {
    if (player.discharge.energy >= global.dischargeInfo.next && (noReset || player.strangeness[1][4] < 2)) {
        player.discharge.current++;
        if (!noReset) {
            player.discharge.energy -= global.dischargeInfo.next;
        } else { global.dischargeInfo.total = calculateEffects.effectiveGoals(); }
    }
    awardVoidReward(1);
    if (!noReset) { reset('discharge', player.challenges.active === 0 ? [1, 2, 3, 4, 5] : [1]); }
};

/** Returns true for Auto only if reset happened */
const vaporizationResetCheck = (clouds = null as number | null): boolean => {
    assignResetInformation.newClouds(); //Also visually updates numbers
    if (player.upgrades[2][2] < 1 || global.vaporizationInfo.get.lessOrEqual('0')) { return false; } //Can be negative

    if (clouds !== null) {
        const level = player.strangeness[2][4];
        if (level >= 2) {
            vaporizationReset(clouds);
            if (!player.toggles.auto[2] || player.toggles.normal[1]) { return false; }
            assignResetInformation.newClouds();
        } else if (!player.toggles.auto[2] || (level < 1 && (player.inflation.vacuum ? player.researchesAuto[2] < 3 : (player.researchesAuto[2] < 1 || player.stage.current !== 2)))) { return false; }

        const vaporization = player.vaporization;
        if (player.inflation.vacuum && vaporization.input[1] > 0 && vaporization.clouds.moreOrEqual(vaporization.input[1])) { return false; }
        const rainNow = calculateEffects.S2Extra1(player.researchesExtra[2][1]);
        const rainAfter = calculateEffects.S2Extra1(player.researchesExtra[2][1], true);
        const storm = calculateEffects.S2Extra2(rainAfter) / calculateEffects.S2Extra2(rainNow);
        if (calculateEffects.clouds(true).divide(calculateEffects.clouds()).multiply((rainAfter / rainNow) * storm).lessThan(vaporization.input[0])) { return false; }
        vaporizationReset();
    }
    return true;
};
export const vaporizationResetUser = async() => {
    if (global.offline.active || !vaporizationResetCheck()) { return; }

    if (player.toggles.confirm[2] !== 'None') {
        const array = [];
        if (player.strangeness[2][4] >= 2) {
            array.push('already gaining Clouds without needing to reset');
        }
        const rainNow = calculateEffects.S2Extra1(player.researchesExtra[2][1]);
        const rainAfter = calculateEffects.S2Extra1(player.researchesExtra[2][1], true);
        const storm = calculateEffects.S2Extra2(rainAfter) / calculateEffects.S2Extra2(rainNow);
        if (calculateEffects.clouds(true).divide(calculateEffects.clouds()).multiply((rainAfter / rainNow) * storm).lessThan('2')) {
            array.push('boost from doing it is below 2x');
        }
        if (player.stage.active !== 2) {
            array.push("current active Stage isn't Submerged");
        }
        if (array.length > 0) {
            if (!await Confirm(`Prevented Vaporization because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!vaporizationResetCheck()) { return Notify('Vaporization canceled, requirements are no longer met'); }
        }
    }

    if (globalSave.SRSettings[0]) {
        getId('SRMain').textContent = `Caused Vaporization for ${format(global.vaporizationInfo.get)} Clouds, +${format(player.vaporization.clouds.moreThan('0') ? new Overlimit(global.vaporizationInfo.get).divide(player.vaporization.clouds).multiply('1e2') : 100)}%`;
    }
    vaporizationReset();
    numbersUpdate();
};

const vaporizationReset = (autoClouds = null as number | null) => {
    const vaporization = player.vaporization;

    if (autoClouds !== null) {
        vaporization.clouds.plus(new Overlimit(global.vaporizationInfo.get).multiply(autoClouds / 40));
    } else { vaporization.clouds.plus(global.vaporizationInfo.get); }
    if (vaporization.cloudsMax.lessThan(vaporization.clouds)) { vaporization.cloudsMax.setValue(vaporization.clouds); }
    awardVoidReward(2);
    if (autoClouds === null) { reset('vaporization', player.challenges.active === 0 ? [1, 2, 3, 4, 5] : player.inflation.vacuum ? [1, 2] : [2]); }
};

/** Returns true for Auto only if reset happened */
const rankResetCheck = (auto = false): boolean => {
    if (player.accretion.rank >= global.accretionInfo.maxRank || (player.buildings[3][0][player.strangeness[3][4] >= 2 ? 'total' : 'current']).lessThan(global.accretionInfo.rankCost[player.accretion.rank])) { return false; }

    if (auto) {
        if (player.strangeness[3][4] < 1 && (player.inflation.vacuum ? player.researchesAuto[2] < 2 : (player.researchesAuto[2] < 1 || player.stage.current !== 3))) { return false; }
        rankReset();
    }
    return true;
};
export const rankResetUser = async() => {
    if (global.offline.active || !rankResetCheck()) { return; }

    if (player.toggles.confirm[3] !== 'None' && player.accretion.rank !== 0) {
        const array = [];
        if (player.inflation.vacuum && (player.researchesExtra[2][1] <= 0 || player.vaporization.clouds.lessOrEqual('0')) && player.accretion.rank >= 4) {
            array.push(`current ${player.researchesExtra[2][1] <= 0 ? "level for Clouds Research 'Rain Clouds'" : 'Cloud amount'} is 0, which could make next Rank slow`);
        }
        if (player.stage.active !== 3) {
            array.push("current active Stage isn't Accretion");
        }
        if (array.length > 0) {
            if (!await Confirm(`Prevented Rank increase because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!rankResetCheck()) { return Notify('Rank increase canceled, requirements are no longer met'); }
        }
    }

    rankReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Rank increased to '${global.accretionInfo.rankName[player.accretion.rank]}' (Rank number is ${player.accretion.rank})`; }
};

const rankReset = () => {
    player.accretion.rank++;
    if (player.accretion.rank === 6) {
        player.stage.current = 4;
        if (player.toggles.normal[0] && player.stage.active < 4) {
            setActiveStage(4);
            stageUpdate(true, true);
        } else { stageUpdate(false, true); }
    }
    awardVoidReward(3);
    //global.accretionInfo.effective = calculateEffects.effectiveRank();
    reset('rank', player.challenges.active === 0 ? [1, 2, 3, 4, 5] : player.inflation.vacuum ? [1, 2, 3] : [3]);
    calculateMaxLevel(0, 3, 'researchesExtra', true);
    calculateMaxLevel(4, 3, 'researchesExtra', true);
    if (player.stage.active === 3 && !global.offline.active) { visualUpdate(); }
};

/** Returns true for Auto only if reset happened */
const collapseResetCheck = (remnants = false): boolean => {
    assignResetInformation.newStars(); //Also visually updates numbers
    assignResetInformation.newMass();
    if (player.upgrades[4][0] < 1) { return false; }
    const info = global.collapseInfo;
    const collapse = player.collapse;
    const level = player.strangeness[4][4];

    assignResetInformation.timeUntil();
    if (remnants) {
        if (level >= 2 && (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0)) {
            collapseReset(true);
            if (!player.toggles.auto[4]) { return false; }
            //assignBuildingsProduction.S5Build3_base();
            //effectsCache.mass = calculateEffects.mass();
            effectsCache.star1 = calculateEffects.star[1]();
            assignResetInformation.newStars(true);
            assignResetInformation.newMass();
            assignResetInformation.timeUntil(false);
        } else if (!player.toggles.auto[4] || (level < 1 && (player.inflation.vacuum ? player.researchesAuto[2] < 4 : (player.researchesAuto[2] < 1 || player.stage.current < 4)))) { return false; }

        if (player.strangeness[5][4] >= 1 && player.toggles.buildings[5][3] && player.ASR[5] >= 3 && player.researchesExtra[5][0] >= 1 && calculateBuildingsCost(3, 5).toNumber() <= info.newMass) {
            collapseReset();
            return true;
        }
        if (info.timeUntil > 0 && info.timeUntil < collapse.input[1]) { return false; }
        while (info.pointsLoop < collapse.points.length) {
            const point = collapse.points[info.pointsLoop];
            if (point > info.newMass || (point > 40 && player.strangeness[5][4] < 1)) { break; }
            if (point > collapse.mass) {
                info.pointsLoop++;
                collapseReset();
                return true;
            }
            info.pointsLoop++;
        }
        const massBoost = (calculateEffects.mass(true) / effectsCache.mass) * (calculateEffects.S4Research4(true) / calculateEffects.S4Research4()) * ((1 + (calculateEffects.S5Upgrade2(true) - effectsCache.S5Upgrade2) / effectsCache.galaxyBase) ** (player.buildings[5][3].true * 2));
        if (massBoost >= collapse.input[0]) {
            collapseReset();
            return true;
        } else if (level >= 2) { return false; }
        const calculateStar = calculateEffects.star;
        const starProd = global.buildingsInfo.producing[4];
        const restProd = new Overlimit(starProd[1]).plus(starProd[3], starProd[4], starProd[5]);
        if (!(massBoost * new Overlimit(starProd[2]).multiply(calculateStar[0](true) / calculateStar[0]()).plus(restProd).divide(restProd.plus(starProd[2])).toNumber() * (calculateStar[1](true) / effectsCache.star1) * (calculateStar[2](true) / calculateStar[2]()) >= collapse.input[0])) { return false; } //Done this way to remove NaN
        collapseReset();
        return true;
    }
    return info.newMass > collapse.mass || (level < 2 && (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0)) || player.elements.includes(0.5, 1);
};
export const collapseResetUser = async() => {
    if (global.offline.active || !collapseResetCheck()) { return; }

    if (player.toggles.confirm[4] !== 'None') {
        const array = [];
        if (player.inflation.vacuum) {
            const unlockedG = player.researchesExtra[5][0] >= 1;
            const cantAffordG = !unlockedG || calculateBuildingsCost(3, 5).toNumber() > global.collapseInfo.newMass;
            if (global.collapseInfo.timeUntil > 0 && global.collapseInfo.timeUntil < 1e6 && cantAffordG) {
                array.push(`${unlockedG ? 'will not be able to afford new Galaxy and ' : ''}Solar mass isn't hardcapped, but can be hardcapped soon`);
            }
            if (player.researchesExtra[2][1] <= 0 || player.vaporization.clouds.lessOrEqual('0')) {
                array.push(`current ${player.researchesExtra[2][1] <= 0 ? "level for Clouds Research 'Rain Clouds'" : 'Cloud amount'} is 0, which could make recovering from Collapse really slow`);
            }
        }
        if (player.stage.active !== 4 && player.stage.active !== 5) {
            array.push("current active Stage isn't Interstellar");
        }
        if (array.length > 0) {
            if (!await Confirm(`Prevented Collapse because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!collapseResetCheck()) { return Notify('Collapse canceled, requirements are no longer met'); }
        }
    }

    if (globalSave.SRSettings[0]) {
        const { starCheck: newStars, newMass } = global.collapseInfo;
        let count = 0;
        for (let i = 1; i < playerStart.elements.length; i++) {
            i = player.elements.indexOf(0.5, i);
            if (i < 1) { break; }
            count++;
        }
        let message = `Caused Collapse to${count > 0 ? ` activate ${format(count)} new Elements and` : ''} ${newMass > player.collapse.mass ? `increase Solar mass to ${format(newMass)}` : ''}`;
        if (newStars[0] > 0 || newStars[1] > 0 || newStars[2] > 0) {
            message += newMass > player.collapse.mass ? ', also gained' : 'gain';
            if (newStars[0] > 0) { message += ` ${format(newStars[0])} Red giants`; }
            if (newStars[1] > 0) { message += `, ${format(newStars[1])} Neutron stars`; }
            if (newStars[2] > 0) { message += `, ${format(newStars[2])} Black holes`; }
        }
        getId('SRMain').textContent = message;
    }
    collapseReset();
    numbersUpdate();
};

const collapseReset = (noReset = false) => {
    const collapseInfo = global.collapseInfo;
    const collapse = player.collapse;

    collapse.stars[0] += collapseInfo.starCheck[0];
    collapse.stars[1] += collapseInfo.starCheck[1];
    collapse.stars[2] += collapseInfo.starCheck[2];
    if (!noReset) {
        if (collapseInfo.newMass > collapse.mass) {
            collapse.mass = collapseInfo.newMass;
            if (collapse.massMax < collapse.mass) { collapse.massMax = collapse.mass; }
        }
        for (let i = 1; i < playerStart.elements.length; i++) { //Must be below mass and star checks
            i = player.elements.indexOf(0.5, i);
            if (i < 1) { break; }
            buyUpgrades(i, 4, 'elements', true);
        }

        reset('collapse', player.challenges.active === 0 ? [1, 2, 3, 4, 5] : player.inflation.vacuum ? [1, 2, 3, 4] : (player.strangeness[5][3] < 1 ? [4, 5] : [4]));
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(1, 4, 'researches');
    }
    awardVoidReward(4);
};

const mergeResetCheck = (auto = false): boolean => {
    if (player.upgrades[5][3] !== 1) { return false; }
    const galaxies = player.buildings[5][3].true;
    if (!player.inflation.vacuum) { return galaxies >= 22; }
    if (player.merge.resets >= calculateEffects.mergeMaxResets() || galaxies < 1) { return false; }

    if (auto) {
        if ((player.strangeness[5][9] < 1 && player.researchesAuto[2] < 5) || (!player.toggles.normal[5] && global.collapseInfo.timeUntil > 0) || galaxies < player.merge.input) { return false; }
        mergeReset();
        return true;
    }
    return true;
};
export const mergeResetUser = async() => {
    if (global.offline.active || !mergeResetCheck()) { return; }

    if (player.toggles.confirm[5] !== 'None' && player.inflation.vacuum) {
        const array = [];
        const galaxyCost = calculateBuildingsCost(3, 5).toNumber();
        if (galaxyCost <= Math.max(player.collapse.mass, global.collapseInfo.newMass)) {
            array.push(`can afford a Galaxy${galaxyCost > player.collapse.mass ? ' after Collapse' : ''}`);
        }
        if (player.stage.active !== 5) {
            array.push("current active Stage isn't Intergalactic");
        }
        if (array.length > 0) {
            if (!await Confirm(`Prevented Merging because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!mergeResetCheck()) { return Notify('Merge canceled, requirements are no longer met'); }
        }
    }

    mergeReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) {
        const { checkReward } = global.mergeInfo;
        getId('SRMain').textContent = player.inflation.vacuum ? `Merged Galaxies${checkReward[0] > 0 ? `, which resulted in +${format(checkReward[0])} new Groups` : ''}` : 'Vacuum decayed into its true state';
    }
};

const mergeReset = () => {
    if (!player.inflation.vacuum) { return switchVacuum(); }
    assignResetInformation.mergeReward();

    player.merge.resets++;
    player.buildings[5][3].true = 0;
    player.merge.reward[0] += global.mergeInfo.checkReward[0];
    reset('galaxy', [1, 2, 3, 4, 5]);
    calculateMaxLevel(0, 4, 'researches');
    calculateMaxLevel(1, 4, 'researches');
    calculateMaxLevel(2, 4, 'researches');
    calculateMaxLevel(5, 4, 'researches');
    if (player.stage.current < 6) {
        player.stage.current = 6;
        stageUpdate(false, true);
    }
};

export const assignMilestoneInformation = (index: number, stageIndex: number) => {
    const pointer = global.milestonesInfo[stageIndex];
    const level = player.milestones[stageIndex][index];
    if (player.inflation.vacuum) {
        pointer.time[index] = 1200;
        if (stageIndex === 1) {
            if (index === 0) {
                pointer.need[0].setValue('1e32').power(level).multiply('1e32');
                pointer.reward[0] = 1.05 ** level;
            } else if (index === 1) {
                pointer.need[1].setValue(24000 + 24000 * level);
                pointer.reward[1] = 1.03 ** level;
            }
        } else if (stageIndex === 2) {
            if (index === 0) {
                pointer.need[0].setValue('1e1').power(level).multiply('1e1');
                pointer.reward[0] = 1.12 ** level;
            } else if (index === 1) {
                pointer.need[1].setValue('1e3').power(level).multiply('1e3');
                pointer.reward[1] = 1.08 ** level;
            }
        } else if (stageIndex === 3) {
            if (index === 0) {
                pointer.need[0].setValue(1e-12 * 1e4 ** level);
                pointer.reward[0] = 1.08 ** level;
            } else if (index === 1) {
                pointer.need[1].setValue(6 + 6 * level);
                pointer.reward[1] = level / 4;
            }
        } else if (stageIndex === 4) {
            if (index === 0) {
                pointer.need[0].setValue('1e6').power(level).multiply('1e6');
                pointer.reward[0] = 1.06 ** level;
            } else if (index === 1) {
                pointer.need[1].setValue(28 + 28 * level);
                pointer.reward[1] = 1.01 ** level;
            }
        } else if (stageIndex === 5) {
            if (index === 0) {
                pointer.need[0].setValue('1e1').power(level).multiply('1e1');
                pointer.reward[0] = 1.04 ** level;
            } else if (index === 1) {
                pointer.need[1].setValue(1 + level);
                pointer.reward[1] = level / 100;
            }
        }
    } else {
        const percentage = level / (pointer.max[index] - 1);
        if (stageIndex === 1) {
            pointer.time[index] = 14400 / (percentage * (index === 1 ? 11 : 3) + 1) ** percentage;
        } else if (stageIndex === 2) {
            pointer.time[index] = 28800 / (percentage * (index === 1 ? 23 : 7) + 1) ** percentage;
        } else if (stageIndex === 3) {
            pointer.time[index] = 43200 / (percentage * (index === 1 ? 35 : 11) + 1) ** percentage;
        } else if (stageIndex === 4) {
            pointer.time[index] = 57600 / (percentage * (index === 1 ? 47 : 15) + 1) ** percentage;
        } else if (stageIndex === 5) {
            pointer.time[index] = index === 0 ? (3600 / (percentage * 2 + 1)) : 1200;
        }
        pointer.need[index].setValue(pointer.scaling[index][level]);
    }
    if (player.inflation.tree[0] === 1) { pointer.time[index] /= 4; }
};

const awardMilestone = (index: number, stageIndex: number, count = 0) => {
    if (!milestoneCheck(index, stageIndex)) {
        if (count > 0) {
            Notify(`Milestone '${global.milestonesInfo[stageIndex].name[index]}' new tier completed${!player.inflation.vacuum && player.milestones[stageIndex][index] >= global.milestonesInfo[stageIndex].max[index] ? ', maxed' : ''}`, count - 1);
            if (!player.inflation.vacuum) {
                player.strange[0].current += count;
                player.strange[0].total += count;
                assignBuildingsProduction.strange0();
                if (stageIndex === 4) {
                    if (index === 0 && player.milestones[4][0] >= 8) { calculateMaxLevel(6, 4, 'strangeness', true); }
                } else if (stageIndex === 5) {
                    if (index === 0 && player.milestones[5][0] >= 8) { calculateMaxLevel(6, 5, 'strangeness', true); }
                }
            } else if (stageIndex === 3 && index === 1) {
                global.accretionInfo.effective = calculateEffects.effectiveRank();
                calculateMaxLevel(0, 3, 'researchesExtra', true);
            }
        }
        return;
    }

    player.milestones[stageIndex][index]++;
    assignMilestoneInformation(index, stageIndex);
    awardMilestone(index, stageIndex, count + 1);
};

/** Also updates related information */
export const toggleSupervoid = (change = false) => {
    const info = global.challengesInfo[0];
    if (change) {
        if (player.challenges.active === 0) { return Notify(`Can't be toggled while inside ${info.name}`); }
        player.challenges.super = !player.challenges.super;
    }

    if (player.challenges.super) {
        info.name = 'Supervoid';
        info.resetType = 'vacuum';
        changeRewardType(true);
    } else {
        info.name = 'Void';
        info.resetType = 'stage';
        changeRewardType(false);
    }
    assignChallengeInformation();
    if (change) { numbersUpdate(); }
};

/* For now just index 0 */
export const assignChallengeInformation = () => {
    let time = player.challenges.super || player.inflation.tree[4] >= 1 ? 1200 : 3600;
    if (player.inflation.tree[0] === 1) { time /= 4; }
    global.challengesInfo[0].time = time;
};

const awardVoidReward = (index: number): void => {
    if (player.challenges.active !== 0) { return; }

    let progress = 1;
    if (index === 1) {
        progress += player.researchesExtra[1][2];
    } else if (index === 2) {
        if (player.vaporization.clouds.moreThan('1e4')) { progress++; }
        if (player.vaporization.clouds.moreThan('1e12') && player.accretion.rank <= 1) { progress++; }
    } else if (index === 3) {
        progress = Math.min(player.accretion.rank - 1, 6);
    } else if (index === 4) {
        if (player.collapse.stars[0] >= 1) { progress++; }
        if (player.collapse.stars[1] >= 1) { progress++; }
        if (player.collapse.stars[2] >= 1) { progress++; }
        if (player.elements[26] >= 1) { progress++; }
    } else if (index === 5) {
        if (player.merge.resets >= 1) { progress++; }
        if (player.merge.reward[0] >= 1) { progress++; }
    }

    const pointer = player.challenges.void;
    if (pointer[index] < progress && player.time.stage <= global.challengesInfo[0].time) {
        pointer[index]++;
        const excess = progress !== pointer[index];
        if (excess) { progress = pointer[index]; }
        if (player.challenges.voidCheck[index] < progress) { player.challenges.voidCheck[index] = progress; }
        const totalProgress = pointer[1] + pointer[2] + pointer[3] + pointer[4] + pointer[5];
        player.strange[0].current += totalProgress;
        player.strange[0].total += totalProgress;
        assignBuildingsProduction.strange0();

        Notify(`New Void reward unlocked:\n${global.challengesInfo[0].rewardText[0][index][progress - 1]}`);
        if (index === 3) {
            if (progress <= 4) {
                calculateMaxLevel(0, 1, 'strangeness', true);
                calculateMaxLevel(3, 1, 'strangeness', true);
                calculateMaxLevel(1, 2, 'strangeness', true);
                calculateMaxLevel(3, 2, 'strangeness', true);
                calculateMaxLevel(0, 3, 'strangeness', true);
                calculateMaxLevel(1, 3, 'strangeness', true);
                calculateMaxLevel(0, 4, 'strangeness', true);
                calculateMaxLevel(1, 4, 'strangeness', true);
                calculateMaxLevel(2, 5, 'strangeness', true);
            }
        } else if (index === 4) {
            if (progress === 1) {
                calculateMaxLevel(4, 1, 'strangeness', true);
                calculateMaxLevel(4, 2, 'strangeness', true);
                calculateMaxLevel(4, 3, 'strangeness', true);
                calculateMaxLevel(4, 4, 'strangeness', true);
            }
        }
        if (excess) { return awardVoidReward(index); }
    }

    if (!player.challenges.super) { return; }
    const pointer2 = player.challenges.supervoid;
    if (pointer2[index] < progress && player.time.vacuum <= global.challengesInfo[0].time) {
        pointer2[index]++;
        const excess = progress !== pointer2[index];
        if (excess) { progress = pointer2[index]; }
        player.cosmon.current++;
        player.cosmon.total++;

        Notify(`New Supervoid reward unlocked:\n${global.challengesInfo[0].rewardText[1][index][progress - 1]}`);
        if (excess) { return awardVoidReward(index); }
        global.inflationInfo.totalSuper = pointer2[1] + pointer2[2] + pointer2[3] + pointer2[4] + pointer2[5];
    }
};

/** Null means exit if possible, nothing if isn't. Entering same challenge will exit out of it */
export const enterExitChallengeUser = (index: number | null) => {
    if (global.offline.active) { return; }
    const old = player.challenges.active;
    if (old === index || index === null) {
        if (old === null) { return; }
        player.challenges.active = null;

        challengeReset(null, old);
        Notify(`Left the '${global.challengesInfo[old].name}'`);
    } else {
        if (index === 0) {
            if (player.challenges.super ? player.buildings[6][1].current.lessThan('2') : !player.inflation.vacuum) { return; }
        } else if (index === 1) { return; }
        player.challenges.active = index;

        challengeReset(index, old);
        Notify(`'${global.challengesInfo[index].name}' is now active`);
    }
};
const exitChallengeAuto = () => {
    const old = player.challenges.active;
    if (old === null) { return; }
    const info = global.challengesInfo[old];
    if (player.time[info.resetType] <= info.time) { return; }

    player.challenges.active = null;
    challengeReset(null, old);
    Notify(`Automatically left the '${info.name}'`);
};
/** Handles all required resets related to challenges */
const challengeReset = (next: number | null, old: number | null) => {
    if (next !== null) {
        const resetType = global.challengesInfo[next].resetType;
        if (old !== null) { challengeReset(null, old); }
        cloneBeforeReset(resetType);
        if (resetType === 'vacuum') {
            if (player.stage.active < 6) { setActiveStage(1); }
            if (!player.inflation.vacuum) {
                player.inflation.vacuum = true;
                prepareVacuum(true);
            }
            resetVacuum();
        } else {
            stageFullReset();
            if (next === 0) { assignResetInformation.trueEnergy(); }
        }
    } else if (old !== null) {
        if (player.stage.active < 6) { setActiveStage(Math.min(player.clone.stage.current, (player.clone.depth !== 'stage' ? player.clone : player).strangeness[5][3] >= 1 ? 5 : 4)); }
        if (player.clone.inflation?.vacuum === false) {
            global.buildingsInfo.producing[4][5].setValue('0');
            player.inflation.vacuum = false;
            prepareVacuum(false);
        }
        loadFromClone();
    }
};
