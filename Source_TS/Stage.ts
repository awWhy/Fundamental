import { checkBuilding, checkUpgrade, checkVerse, milestoneCheck } from './Check';
import Overlimit, { compareFunc } from './Limit';
import { changeRewardType, getId, loadoutsVisual, playerStart, simulateOffline } from './Main';
import { effectsCache, global, player, prepareVacuum } from './Player';
import { cloneBeforeReset, loadFromClone, reset, resetStage, resetVacuum } from './Reset';
import { Confirm, Notify, errorNotify, globalSave, playEvent, specialHTML } from './Special';
import type { calculateEffectsType } from './Types';
import { addIntoLog, format, numbersUpdate, stageUpdate, switchTab, visualTrueStageUnlocks, visualUpdate } from './Update';

/** Normal game tick, everything calculated in milliseconds */
export const timeUpdate = (tick: number, timeWarp: null | number = null) => {
    const { time } = player;
    if (timeWarp !== null) {
        timeWarp -= tick;
    } else {
        const currentTime = Date.now();
        const passedTime = currentTime - time.updated;
        time.updated = currentTime;
        time.export[0] += passedTime;
        global.lastSave += passedTime;
        timeWarp = time.excess + passedTime;
        if (timeWarp < tick) {
            time.excess = timeWarp;
            return;
        } else { time.excess = 0; } //Must be before potential warp
        if (timeWarp > tick * 600) { return void simulateOffline(timeWarp); }
        timeWarp -= tick;
        time.online += tick;
    }
    const { auto, buildings: autoBuy } = player.toggles;
    const { maxActive } = global.buildingsInfo;
    const activeAll = global.stageInfo.activeAll;

    const trueSeconds = tick / 1000;
    if (player.inflation.vacuum || activeAll.includes(4)) { player.merge.since += trueSeconds; }
    time.stage += trueSeconds;
    time.vacuum += trueSeconds;
    time.universe += trueSeconds;
    time.end += trueSeconds;

    effectsCache.T0Inflation3 = calculateEffects.T0Inflation3() ** player.tree[0][3];
    const passedSeconds = trueSeconds * assignBuildingsProduction.globalSpeed();
    player.stage.time += passedSeconds;
    player.inflation.time += passedSeconds;
    player.inflation.age += passedSeconds;

    if (player.toggles.normal[3]) { exitChallengeAuto(); }
    if (player.inflation.vacuum) {
        if (player.toggles.verses[0] && player.verses[0].current >= 9) { buyVerse(0, true); }
        stageResetCheck(5, trueSeconds);
    } else {
        if (auto[9] && activeAll.includes(5)) { mergeResetCheck(true); }
        if (activeAll.includes(4)) { stageResetCheck(5, trueSeconds); }
        if (auto[0]) {
            if (activeAll.includes(3)) { stageResetCheck(3, 0); }
            if (activeAll.includes(2)) { stageResetCheck(2, 0); }
            if (activeAll.includes(1)) { stageResetCheck(1, 0); }
        }
        if (player.challenges.active === 1 && time.stage > 600 && stageResetCheck(player.stage.current)) {
            stageResetReward(player.stage.current);
            Notify('Stage reset has been forced');
        }
    }
    const vacuum = player.inflation.vacuum;

    assignBuildingsProduction.globalCache();
    if (activeAll.includes(6)) {
        if (player.strangeness[6][3] >= 3) {
            if (auto[5]) { autoUpgradesBuy(6); }
            if (auto[6]) { autoResearchesBuy('researches', 6); }
        }
        if (player.strangeness[6][3] >= 5 && auto[7]) { autoResearchesBuy('researchesExtra', 6); }
        if (auto[10]) { nucleationResetCheck(true); }
        assignBuildingsProduction.stage6Cache();
        if (player.strangeness[1][8] >= 3) {
            assignBuildingsProduction.S6Build1();
            global.inflationInfo.disableAuto = player.buildings[6][0].current.moreOrEqual(calculateEffects.darkHardcap());
        } else { global.inflationInfo.disableAuto = false; }
        for (let i = maxActive[6] - 1; i >= 1; i--) {
            if (autoBuy[6][i]) { buyBuilding(i, 6, 0, true); }
        }
        gainBuildings(0, 6, passedSeconds); //Dark matter
    }
    if (activeAll.includes(4)) {
        if (auto[8]) { autoElementsBuy(); }
        if (activeAll.includes(5)) {
            if (player.strangeness[5][3] >= 1 || player.verses[0].current >= 3) {
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
            if (research >= 4 && (player.challenges.active !== 0 || player.verses[0].current >= 7)) { gainBuildings(4, 5, passedSeconds); } //Quasi-stars
        } else { assignBuildingsProduction.stage5Cache(); }
        if (auto[5]) { autoUpgradesBuy(4); }
        if (auto[6]) { autoResearchesBuy('researches', 4); }
        if (auto[7]) { autoResearchesBuy('researchesExtra', 4); }
        assignBuildingsProduction.stage4Cache();
        for (let i = maxActive[4] - 1; i >= 1; i--) {
            if (autoBuy[4][i]) { buyBuilding(i, 4, 0, true); }
            gainBuildings(i - 1, 4, passedSeconds); //Stardust
        }
        assignBuildingsProduction.S4Levels();
        awardMilestone(0, 5);
        awardMilestone(0, 4);
        const failed = !collapseResetCheck(true);
        awardMilestone(1, 4); //Must be before Merge
        if (vacuum && failed && auto[9]) { mergeResetCheck(true); }
    } else if (vacuum) {
        effectsCache.star2 = 1; //Lazy fix
        assignResetInformation.solarHardcap();
    }
    if (activeAll.includes(3)) {
        if (auto[5]) { autoUpgradesBuy(3); }
        if (auto[6]) { autoResearchesBuy('researches', 3); }
        if (auto[7]) { autoResearchesBuy('researchesExtra', 3); }
        if (auto[3]) { rankResetCheck(true); }
        assignBuildingsProduction.stage3Cache();
        global.accretionInfo.disableAuto = vacuum && player.researchesExtra[3][5] < 1 && player.strangeness[1][8] >= 2 && assignBuildingsProduction.S3Build1(true) >= calculateEffects.dustHardcap();
        for (let i = 1; i < maxActive[3]; i++) {
            if (autoBuy[3][i]) { buyBuilding(i, 3, 0, true); }
        }
        gainBuildings(2, 3, passedSeconds); //Planetesimals
        gainBuildings(1, 3, passedSeconds); //Cosmic dust
        if (!vacuum) { gainBuildings(0, 3, passedSeconds); } //Mass
    }
    if (activeAll.includes(2)) {
        if (auto[5]) { autoUpgradesBuy(2); }
        if (auto[6]) { autoResearchesBuy('researches', 2); }
        if (auto[7]) { autoResearchesBuy('researchesExtra', 2); }
        vaporizationResetCheck(trueSeconds);
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
        dischargeResetCheck(true);
        assignBuildingsProduction.stage1Cache();
        gainBuildings(5, 1, passedSeconds); //Molecules
        for (let i = maxActive[1] - 1; i >= 1; i--) {
            if (autoBuy[1][i]) { buyBuilding(i, 1, 0, true); }
            gainBuildings(i - 1, 1, passedSeconds); //Rest of Microworld
        }
        awardMilestone(1, 1);
        awardMilestone(0, 1);
    }

    if (timeWarp >= tick) {
        timeUpdate(tick, timeWarp);
    } else { time.excess += timeWarp; }
};

export const logAny = (number: number, base: number) => Math.log(number) / Math.log(base);

export const calculateEffects: calculateEffectsType = {
    effectiveEnergy: () => {
        let energy = player.discharge.energy;
        if (player.upgrades[1][10] === 1) { energy *= 2; }
        if (player.inflation.vacuum && player.tree[0][4] >= 1) { energy *= global.milestonesInfo[1].reward[1]; }
        return energy + 1;
    },
    effectiveGoals: () => {
        let goals = player.discharge.current + (player.strangeness[1][3] / 2);
        if (player.inflation.vacuum) {
            goals += player.tree[1][4];
            if (player.tree[1][6] >= 1) { goals += global.accretionInfo.effective / 2; }
        }
        return goals;
    },
    dischargeScaling: (research = player.researches[1][3], strangeness = player.strangeness[1][2]) => {
        let scale = (2 * research) + (strangeness / 2);
        if (player.inflation.vacuum) { scale += player.tree[1][4] / 2; }
        return 10 - scale;
    },
    dischargeCost: (scaling = calculateEffects.dischargeScaling()) => {
        let next = scaling ** player.discharge.current;
        if (player.inflation.vacuum && player.strangeness[5][10] >= 1) { next /= calculateEffects.S5Strange9_stage1(); }
        return next;
    },
    dischargeBase: (research = player.researches[1][4]) => {
        let base = (4 + research) / 2;
        if (player.challenges.active === 0) { base = (base + player.tree[1][4] / 2) ** 0.5; }
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
    S1Extra3: (level = player.researchesExtra[1][3]) => (level * (player.challenges.supervoid[3] >= 2 ? 6 : 5)) / 100,
    S1Extra4: (research = player.researchesExtra[1][5]) => (global.dischargeInfo.base + calculateEffects.effectiveEnergy() ** 0.1) * (research + 1) / 100 + 1,
    preonsHardcap: (laterPreons) => 1e14 * laterPreons * effectsCache.S1SolarDelay * assignBuildingsProduction.S3Build1(),
    clouds: (post = false) => {
        let effect = player.vaporization.clouds + 1;
        if (post) { effect += global.vaporizationInfo.get; }

        if (effect > 1e4) { effect = (effect - 1e4) ** 0.7 + 1e4; }
        return effect;
    },
    cloudsGain: () => player.challenges.active === 0 ? 0.4 : player.inflation.vacuum ? 0.5 : 0.6,
    S2Upgrade1: () => {
        const puddles = player.buildings[2][2];
        const maxTrue = Math.min(puddles.true, 200);
        return (player.challenges.active === 0 && player.challenges.super ? 1.01 : 1.02) ** ((puddles.current.toNumber() - maxTrue) ** 0.7 + maxTrue);
    },
    S2Upgrade2: () => {
        let effect = 1e10 / (player.inflation.vacuum ? 2.5 : 2) ** player.strangeness[2][3];
        if (player.inflation.vacuum) {
            if (player.tree[0][4] >= 1) { effect /= global.milestonesInfo[2].reward[0]; }
            if (player.challenges.active === 0) { effect /= 8 ** player.tree[1][5]; }
        }
        return effect;
    },
    S2Upgrade3_power: (research = player.researches[2][2]) => (1 + research / 2) / 100,
    S2Upgrade3: (power = calculateEffects.S2Upgrade3_power()) => Math.max(player.buildings[2][0].current.toNumber(), 1) ** power,
    S2Upgrade4_power: (research = player.researches[2][3]) => (1 + research / 2) / 100,
    S2Upgrade4: (power = calculateEffects.S2Upgrade4_power()) => Math.max(player.buildings[2][1].current.toNumber(), 1) ** power,
    S2Extra1: (level, post = false) => { //+^0.05 per level; Drops up to +^(0.05 / 3) after softcap
        if (level <= 0) { return 1; }
        let effect = player.vaporization.clouds;
        if (post) { effect += global.vaporizationInfo.get; }
        return Math.max(effect ** (level / 60) * Math.min(effect, 1e6) ** (level / 30), 1);
    },
    S2Extra2: (rain, level = player.researchesExtra[2][2]) => level >= 1 ? (rain - 1) / 32 + 1 : 1,
    submersion: () => {
        const drops = player.buildings[2][1].current.toNumber() + 1;
        return Math.log2(drops ** 0.6 / Math.min(drops, 1e10) ** 0.4 + 1); //^0.2 before softcap, ^0.6 after
    },
    effectiveRank: () => {
        let rank = player.challenges.active === 0 && player.challenges.super ? 1 : player.accretion.rank;
        if (player.inflation.vacuum) {
            if (player.researchesExtra[1][2] < 1) { return 0; }
            if (player.tree[0][4] >= 1) { rank += global.milestonesInfo[3].reward[1]; }
            if (player.challenges.active === 0) { rank += player.tree[1][6]; }
        }
        return rank;
    },
    S3Upgrade0: () => (101 + player.researches[3][1]) / 100,
    S3Upgrade1_power: (research = player.researchesExtra[3][3]) => (11 + research) / 100,
    S3Upgrade1: (power = calculateEffects.S3Upgrade1_power()) => Math.max((player.buildings[3][1].current.toNumber() * (player.buildings[3][1].true + 1)) ** power, 1),
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
            if (player.inflation.vacuum && player.tree[0][4] >= 1) { effect *= global.milestonesInfo[4].reward[1]; }
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
        if (level <= 0) { return 1; }
        return 1 + (transfer >= 1 ? 0.006 : 0.005) * (
            level >= 12 ? (level + 93) / 16 :
            level >= 8 ? (level + 41) / 8 :
            level >= 6 ? (level + 17) / 4 :
            level >= 5 ? 5.5 : 1 + level
        );
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
    mergeRequirement: (stability = player.challenges.active === 1) => {
        let base = 22;
        if (stability) { base += player.challenges.stability; }
        return base;
    },
    mergeMaxResets: () => {
        let max = 2 + player.researchesExtra[5][3];
        if (player.elements[30] >= 1) { max += player.collapse.maxElement - 29; }
        return max;
    },
    reward: [
        (post = false) => {
            let effect = player.merge.rewards[0] + 1;
            if (post) { effect += global.mergeInfo.checkReward[0]; }
            return effect * calculateEffects.S5Extra2(global.mergeInfo.S5Extra2, post); //Just in case doesn't count boost from Clusters
        }, (post = false) => {
            let level = player.researchesExtra[5][2] + player.merge.rewards[1];
            if (post) { level += global.mergeInfo.checkReward[1]; }
            return calculateEffects.S5Extra2(level, post) / calculateEffects.S5Extra2(player.researchesExtra[5][2], post);
        }
    ],
    mergeScore: () => global.mergeInfo.galaxies + (player.merge.rewards[0] * 2) + (player.merge.rewards[1] * 4),
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
    S5Research2: () => 1 + player.researches[5][2] / 160,
    S5Research3: () => 1 + player.researches[5][3] / 160,
    S5Extra2: (level, post = false) => {
        let groups = player.merge.rewards[0];
        if (post) { groups += global.mergeInfo.checkReward[0]; }
        return (8 + level * groups) / 8;
    },
    S5Extra4: (level = player.researchesExtra[5][4]) => (19 - level) * level / 2, //Starts at 9 and -1 is the step
    element6: () => player.researchesExtra[4][2] >= 1 ? 2 : 1.5,
    element24_power: () => player.elements[27] >= 1 ? 0.02 : 0.01,
    element24: () => new Overlimit(player.buildings[4][0].current).max(1).power(calculateEffects.element24_power()),
    element26: () => {
        let effect = new Overlimit(player.buildings[4][0].trueTotal).log(10).toNumber() - 48;
        if (player.elements[29] >= 1) { effect = (199 + effect) * effect / 200; }
        return Math.max(effect, 0);
    },
    darkSoftcap: () => (1 + player.researchesExtra[6][3]) / 25,
    darkHardcap: (delayOnly = false) => {
        const delay = global.buildingsInfo.producing[6][1] * (1 + player.researches[6][2]) * (calculateEffects.effectiveDarkEnergy() ** (player.researchesExtra[6][1] / 2));
        return delayOnly ? delay : delay * 1e8;
    },
    effectiveDarkEnergy: (fluid = effectsCache.fluid) => player.darkness.energy * fluid + 1,
    darkFluid: (post = false) => {
        let effect = player.darkness.fluid + 1;
        if (post) { effect += global.inflationInfo.newFluid; }
        return effect;
    },
    S6Upgrade0: () => (4 + player.researchesExtra[6][3]) / 20,
    S2Strange9: () => Math.log10(player.vaporization.clouds + 1) / 80 + 1,
    S5Strange9_stage1: () => global.mergeInfo.galaxies ** 2 + 1,
    S5Strange9_stage2: () => global.mergeInfo.galaxies + 1,
    S5Strange9_stage3: () => global.mergeInfo.galaxies / 100 + 1,
    T0Inflation0: () => Math.max(2 ** (1 - player.time.stage / 3600), 1),
    T0Inflation1: () => {
        const mass = player.buildings[6][0].current.toNumber() + 1;
        return mass ** 0.01 * Math.min(mass, 1e8) ** 0.03;
    },
    T0Inflation3: () => (1 + global.inflationInfo.totalSuper) / 10 + 1,
    strangeGain: (interstellar, quarks = true) => {
        let base = !quarks ? 0 : player.inflation.vacuum ?
            (player.strangeness[5][3] >= 1 ? 5 : 4) :
            (player.milestones[1][0] >= 6 ? 2 : 1);
        if (interstellar) {
            base = (base + effectsCache.element26) * effectsCache.interstellarQuarks;
        }
        if (quarks) {
            base *= (1.4 ** player.strangeness[5][2]) * (1.4 ** player.tree[0][2]) * (1.2 ** player.tree[1][1]);
            if (player.challenges.active === 1) {
                base /= 2 ** Math.max(player.stage.resets - 7, 0) * 2 ** player.challenges.stability;
                if (!interstellar) { base /= 2 ** (player.challenges.stability + 2); }
            } else if (player.challenges.active === 0 && player.challenges.super) { return 1; }
        } else { base *= (1.4 ** player.strangeness[6][1]) * (1.4 ** player.tree[1][3]); }
        return base * global.strangeInfo.strangeletsInfo[1] * effectsCache.T0Inflation3;
    }
};

export const assignBuildingsProduction = {
    globalSpeed: (): number => {
        const tree = player.tree;
        const challenge = player.challenges.active;
        let speed = (1.1 ** player.researches[6][2]) * (1.2 ** player.researchesExtra[6][0]) * (1.4 ** player.strangeness[6][0]) * (calculateEffects.T0Inflation1() ** tree[0][1]) * effectsCache.T0Inflation3 * (1.4 ** tree[1][0]);
        if (tree[1][2] >= 1) {
            speed *= 2 ** tree[0][0];
        } else {
            if (tree[0][0] >= 1) { speed *= 2; }
            if (tree[0][0] >= 2 && challenge === null && (player.inflation.vacuum || tree[0][4] >= 1)) { speed *= calculateEffects.T0Inflation0(); }
        }
        if (challenge !== null) {
            speed *= 6 / (6 - tree[0][5]);
            if (challenge === 0) {
                speed *= 1.2 ** Math.min(tree[0][2], tree[0][3] * 2);
                if (player.challenges.super) { speed /= 5; }
            } else if (challenge === 1) {
                speed /= 8 ** player.challenges.stability;
            }
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
        if (player.inflation.vacuum) {
            if (player.tree[0][4] >= 1) { multiplier *= global.milestonesInfo[1].reward[0]; }
            if (player.challenges.active === 0) { multiplier /= 4; }
        }
        effectsCache.microworld = multiplier;
    },
    /** Preons, true vacuum only, visual will assign effect */
    S1Build1: (noHardcap = false, visual = false): number => {
        const structure = player.buildings[1][1];

        const laterPreons = calculateEffects.effectiveEnergy() ** calculateEffects.S1Extra3();
        let multiplier = 6e-4 * effectsCache.microworld * laterPreons;
        const preonsExcess = new Overlimit(structure.current).minus(structure.true);
        if (preonsExcess.moreThan(1)) {
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
    S1Build2: (): Overlimit => global.buildingsInfo.producing[1][2].setValue(effectsCache.S1Upgrade7).power(player.buildings[1][2].true).allMultiply(0.4 * effectsCache.microworld, player.buildings[1][2].current),
    /** Particles */
    S1Build3: (): Overlimit => {
        const index = player.inflation.vacuum ? 3 : 1;

        let multiplier = (player.inflation.vacuum ? 0.2 : 1.6) * effectsCache.microworld;
        if (player.upgrades[1][0] === 1) { multiplier *= 8; }
        return global.buildingsInfo.producing[1][index].setValue(effectsCache.S1Upgrade7).power(player.buildings[1][index].true).allMultiply(multiplier, player.buildings[1][index].current);
    },
    /** Atoms */
    S1Build4: (): Overlimit => {
        const vacuum = player.inflation.vacuum;
        const index = vacuum ? 4 : 2;

        let multiplier = (vacuum ? 0.8 : 0.4) * effectsCache.microworld * (effectsCache.S1Upgrade7 ** player.buildings[1][index].true);
        if (player.upgrades[1][3] === 1) { multiplier *= vacuum ? 6 : 4; }
        return global.buildingsInfo.producing[1][index].setValue(multiplier).multiply(player.buildings[1][index].current);
    },
    /** Molecules, visual will assign effect */
    S1Build5: (visual = false): number => {
        const index = player.inflation.vacuum ? 5 : 3;

        let multiplier = 0.2 * effectsCache.microworld * player.buildings[1][index].current.toNumber() * (effectsCache.S1Upgrade7 ** player.buildings[1][index].true);
        if (player.upgrades[1][4] === 1) { multiplier *= 4; }
        if (visual) { global.buildingsInfo.producing[1][index].setValue(multiplier); }
        return multiplier;
    },
    /* Tritium */
    S1Build6: (): number => {
        let multiplier = assignBuildingsProduction.S1Build5();
        if (multiplier < 1) { multiplier = 1; }
        multiplier = logAny(multiplier, calculateEffects.S1Extra1()) * (calculateEffects.S1Research2() ** player.researches[1][2]) * (calculateEffects.S1Research5() ** player.researches[1][5]);
        if (player.upgrades[1][9] === 1) { multiplier *= calculateEffects.S1Upgrade9(); }
        if (player.inflation.vacuum) { multiplier *= assignBuildingsProduction.S2Build1(); }
        return (effectsCache.tritium = multiplier);
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
        if (info.S2Extra1 !== player.researchesExtra[2][1]) { info.S2Extra1 = Math.min(player.researchesExtra[2][1], logAny(totalDrops * 9.99e-10 + 1, 1e3)); }
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
        if (upgrades[7] === 1) { water4 += water5 * (1 + player.researches[2][6]); }
        if (upgrades[6] === 1) { water3 += water4 * (1 + player.researches[2][5]); }
        if (upgrades[5] === 1) { water2 += water3 * (1 + player.researches[2][4]); }
        buildings[5].current.setValue(water5);
        buildings[4].current.setValue(water4);
        buildings[3].current.setValue(water3);
        buildings[2].current.setValue(water2);
    },
    /** Drops */
    S2Build1: (): number => {
        const vacuum = player.inflation.vacuum;
        const structure = player.buildings[2][1];

        let multiplier = structure.current.toNumber();
        if (player.challenges.active === 0) {
            if (multiplier > 1) { multiplier = 1; }
        } else if (vacuum) {
            const excess = multiplier - structure.true;
            if (excess > 1) { multiplier = excess ** 0.2 + structure.true; }
        }
        multiplier *= (vacuum ? 2 : 8e-4) * ((player.challenges.active === 0 && player.challenges.super ? 2 : 3) ** global.vaporizationInfo.S2Research0) * (2 ** player.strangeness[2][0]);
        if (player.upgrades[2][0] === 1) { multiplier *= (vacuum ? 1.02 : 1.04) ** structure.true; }
        if (vacuum && multiplier < 1) { multiplier = 1; }
        return (global.buildingsInfo.producing[2][1] = multiplier);
    },
    /** Puddles, visuals only assigns Structures past Puddles and has no return value */
    S2Build2: (visual = false): number => {
        const producings = global.buildingsInfo.producing[2];
        const structures = player.buildings[2];
        if (structures[2].true < 1 && !visual) {
            const rain = calculateEffects.S2Extra1(player.researchesExtra[2][1]);
            return (producings[2] = (rain - 1) * calculateEffects.S2Extra2(rain));
        }
        const rain = calculateEffects.S2Extra1(global.vaporizationInfo.S2Extra1);
        const flow = 1.24 ** player.strangeness[2][7];

        const inVoid = player.challenges.active === 0;
        const start = inVoid && player.challenges.super ? 1 : 2;
        producings[6] = structures[6].true < 1 ? 1 : (player.upgrades[2][8] === 1 ? 1.1 : 1.08) ** structures[6].true * flow;
        producings[5] = Math.max(start * structures[5].current.toNumber() * calculateEffects.S2Extra2(rain) * flow, 1);
        producings[4] = Math.max(start * structures[4].current.toNumber() * flow, 1);
        producings[3] = Math.max(start * structures[3].current.toNumber() * flow, 1);
        if (visual) { return 0; }

        let multiplier = (inVoid ? 6e-4 : 4.8) * structures[2].current.toNumber() * calculateEffects.clouds() * producings[3] * producings[4] * producings[5] * producings[6] * effectsCache.S2Upgrade3 * effectsCache.S2Upgrade4 * ((inVoid && player.challenges.super ? 1.4 : 2) ** global.vaporizationInfo.S2Research1) * rain * ((player.inflation.vacuum ? 1.8 : 1.6) ** player.strangeness[2][1]);
        if (player.upgrades[2][1] === 1) { multiplier *= calculateEffects.S2Upgrade1(); }
        if (player.inflation.vacuum) {
            multiplier *= calculateEffects.S3Extra4();
            if (player.elements[1] >= 1) { multiplier *= 2; }
            if (player.tree[0][4] >= 1) { multiplier *= global.milestonesInfo[2].reward[1]; }
            if (player.strangeness[5][10] >= 2) { multiplier *= calculateEffects.S5Strange9_stage2(); }
        }
        if (player.strangeness[2][6] >= 1) { multiplier *= global.strangeInfo.stageBoost[2]; }
        return (producings[2] = multiplier);
    },
    /** Have to be after auto Upgrades */
    stage3Cache: () => {
        const producings = global.buildingsInfo.producing[3];
        producings[5] = 1.1 ** player.buildings[3][5].true;
        effectsCache.S3Strange1 = (player.inflation.vacuum ? 1.48 : 1.6) ** player.strangeness[3][1];

        producings[4] = (player.upgrades[3][12] === 1 ? 1.14 : 1.1) ** player.buildings[3][4].true * producings[5];
        effectsCache.S3Strange3 = producings[4] ** (player.inflation.vacuum ? 0.1 : 0.2);
    },
    /** Cosmic dust and related softcap */
    S3Build1: (noHardcap = false): number => {
        const researchesS3 = player.researches[3];
        const upgradesS3 = player.upgrades[3];
        const vacuum = player.inflation.vacuum;

        let multiplier = (vacuum ? 2 : 8e-20) * player.buildings[3][1].current.toNumber() * (3 ** researchesS3[0]) * (2 ** researchesS3[3]) * (3 ** researchesS3[5]) * (1.11 ** player.researchesExtra[3][0]) * (calculateEffects.S3Extra1() ** global.accretionInfo.effective) * (1.8 ** player.strangeness[3][0]);
        if (vacuum) {
            multiplier *= calculateEffects.submersion();
            if (player.elements[4] >= 1) { multiplier *= 1.4; }
            if (player.elements[14] >= 1) { multiplier *= 1.4; }
            if (player.strangeness[5][10] >= 3) { multiplier *= calculateEffects.S5Strange9_stage2(); }
            if (player.tree[0][4] >= 1) { multiplier *= global.milestonesInfo[3].reward[0]; }
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
        return (global.buildingsInfo.producing[3][1] = multiplier);
    },
    /** Planetesimals */
    S3Build2: (): number => {
        let multiplier = player.buildings[3][2].current.toNumber() * (3 ** player.researches[3][2]) * calculateEffects.S3Research6() * effectsCache.S3Strange1;
        if (player.upgrades[3][3] === 1) { multiplier *= calculateEffects.S3Upgrade3() ** player.buildings[3][2].true; }
        if (player.upgrades[3][4] === 1) { multiplier *= 3; }
        if (player.strangeness[3][3] >= 1) { multiplier *= effectsCache.S3Strange3; }
        return (global.buildingsInfo.producing[3][2] = multiplier);
    },
    /** Protoplanets */
    S3Build3: (): number => {
        let multiplier = 0.4 * player.buildings[3][3].current.toNumber() * global.buildingsInfo.producing[3][4] * effectsCache.S3Strange1;
        if (player.researchesExtra[3][2] >= 1) { multiplier *= 2; }
        if (player.upgrades[3][7] === 1) { multiplier *= 1.02 ** player.buildings[3][3].true; }
        return (global.buildingsInfo.producing[3][3] = multiplier);
    },
    /** Have to be after auto Upgrades */
    stage4Cache: () => {
        effectsCache.mass = calculateEffects.mass();
        effectsCache.star1 = calculateEffects.star[1]();
        effectsCache.star2 = calculateEffects.star[2]();

        let multiplier = calculateEffects.S4Research0() * effectsCache.mass * effectsCache.star1 * calculateEffects.S4Research4() * (1.6 ** player.strangeness[4][0]);
        if (player.elements[4] >= 1) { multiplier *= 1.4; }
        if (player.elements[14] >= 1) { multiplier *= 1.4; }
        if (player.inflation.vacuum) {
            if (player.researchesExtra[2][3] >= 1) { multiplier *= effectsCache.S2Upgrade3; }
            if (player.researchesExtra[2][3] >= 3) {
                multiplier *= effectsCache.S2Upgrade4;
            } else if (player.researchesExtra[2][3] === 2) { multiplier *= effectsCache.S2Upgrade4 ** 0.5; }
            if (player.tree[0][4] >= 1) { multiplier *= global.milestonesInfo[4].reward[0]; }
            if (player.challenges.active === 0) { multiplier /= 8000; }
        }
        if (player.strangeness[4][7] >= 1) { multiplier *= global.strangeInfo.stageBoost[4]; }
        effectsCache.interstellar = multiplier;
    },
    /** Reset being false will set all levels to 0, true will recalculate them afterwards */
    S4Levels: (reset = null as boolean | null) => {
        if (reset !== null) {
            global.mergeInfo.S5Extra2 = 0;
            if (!reset) { return; }
        }
        const extra2s5Max = player.researchesExtra[5][2] + player.merge.rewards[1];
        if (global.mergeInfo.S5Extra2 !== extra2s5Max) { global.mergeInfo.S5Extra2 = Math.min(extra2s5Max, Math.max(new Overlimit(player.buildings[4][0].total).divide(1e280).log(1e30).toNumber(), 0)); }
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
        return global.buildingsInfo.producing[4][1].setValue(multiplier).allMultiply(...multiplierList);
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
        return global.buildingsInfo.producing[4][2].setValue(multiplier).allMultiply(...multiplierList);
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
        return global.buildingsInfo.producing[4][3].setValue(multiplier).allMultiply(...multiplierList);
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
        return global.buildingsInfo.producing[4][4].setValue(multiplier).allMultiply(...multiplierList);
    },
    /** Quasi-stars */
    S4Build5: (): Overlimit => {
        if (player.challenges.active === 0) { return global.buildingsInfo.producing[4][5].setValue(0); }
        let multiplier = 2e11 * effectsCache.interstellar;
        if (player.elements[33] >= 1) { multiplier *= effectsCache.star2; }
        return global.buildingsInfo.producing[4][5].setValue(multiplier).allMultiply(player.buildings[4][5].current, calculateEffects.S4Shared(), global.buildingsInfo.producing[5][2]);
    },
    /** All Intergalactic Structures productions, have to be after auto Galaxies */
    stage5Cache: () => {
        const vacuum = player.inflation.vacuum;
        const production = global.buildingsInfo.producing[5][3];
        const moreStars = 10 ** player.researches[5][4];

        let base = (vacuum ? 2 : 6) + calculateEffects.S5Upgrade2();
        if (vacuum && player.tree[0][4] >= 1) { base += global.milestonesInfo[5].reward[1]; }
        effectsCache.galaxyBase = base;

        production.setValue(base).power(player.buildings[5][3].true);
        if (global.mergeInfo.galaxies > 0) {
            let multiplier3 = (global.mergeInfo.galaxies + 1) / (player.buildings[5][3].true + 1);
            if (vacuum) { multiplier3 *= calculateEffects.reward[0](); }
            if (player.upgrades[5][6] === 1) { multiplier3 *= 100 * moreStars; }
            production.multiply(multiplier3);
        }

        let globalMult = (vacuum ? 1.4 : 1.6) ** player.strangeness[5][0];
        if (vacuum && player.tree[0][4] >= 1) { globalMult *= global.milestonesInfo[5].reward[0]; }

        let multiplier2 = 2 * (2 ** player.researches[5][1]) * globalMult;
        if (player.upgrades[5][1] === 1) { multiplier2 *= calculateEffects.S5Upgrade1(); }
        if (player.upgrades[5][5] === 1) { multiplier2 *= 1000 * moreStars; }
        if (vacuum && player.upgrades[3][13] === 1) { multiplier2 *= (calculateEffects.S3Research6() / 2e5) ** 0.5 + 1; }
        global.buildingsInfo.producing[5][2].setValue(multiplier2).allMultiply(player.buildings[5][2].current, production, calculateEffects.S5Research3() ** player.buildings[5][2].true).max(2 ** player.researches[5][1]);

        let multiplier1 = 6 * (2 ** player.researches[5][0]) * globalMult;
        if (player.upgrades[5][0] === 1) { multiplier1 *= calculateEffects.S5Upgrade0(); }
        if (player.upgrades[5][4] === 1) { multiplier1 *= 1000 * moreStars; }
        if (vacuum) {
            if (player.researchesExtra[2][4] >= 1) { multiplier1 *= effectsCache.S2Upgrade3; }
            if (player.researchesExtra[2][4] >= 3) {
                multiplier1 *= effectsCache.S2Upgrade4;
            } else if (player.researchesExtra[2][4] === 2) { multiplier1 *= effectsCache.S2Upgrade4 ** 0.5; }
        }
        global.buildingsInfo.producing[5][1].setValue(multiplier1).allMultiply(player.buildings[5][1].current, production, calculateEffects.S5Research2() ** player.buildings[5][1].true);
    },
    stage6Cache: () => {
        effectsCache.fluid = calculateEffects.darkFluid();
    },
    S6Build1: (): number => {
        let multiplier = 2 * player.buildings[6][1].true * ((1 + player.researches[6][3] / 100) ** player.buildings[6][1].true);
        if (multiplier < 1) { multiplier = 1; }
        return (global.buildingsInfo.producing[6][1] = multiplier);
    },
    verse0: (): number => {
        const universes = player.verses[0];
        let multiplier = (universes.true < 1 ? universes.current : (universes.true ** (universes.true / 4) * (universes.current + 1) / (universes.true + 1))) * effectsCache.fluid * (2 ** (player.researches[6][0] + player.researches[6][1])) * (calculateEffects.darkHardcap(true) ** (player.researchesExtra[6][2] / 32));
        if (player.upgrades[6][1] === 1) { multiplier *= global.mergeInfo.galaxies / 125 + 1; }
        return (global.versesInfo.producing[0] = multiplier);
    },
    /** Quarks */
    strange0: (iron = player.elements[26] >= 1) => {
        const vacuum = player.inflation.vacuum;
        const stageBoost = global.strangeInfo.stageBoost;
        const strangeQuarks = player.strange[0].current + 1;

        stageBoost[1] = strangeQuarks ** (vacuum ? 0.26 : 0.22);
        stageBoost[2] = strangeQuarks ** (vacuum ? 0.22 : 0.18);
        stageBoost[3] = strangeQuarks ** (vacuum ? 0.68 : 0.76);
        stageBoost[4] = strangeQuarks ** (iron ? 0.32 : 0.16);
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
    /** And energyType, energyStage, darkEnergy */
    trueEnergy: (reset = false) => {
        const energyType = global.dischargeInfo.energyType;
        if (player.inflation.vacuum) {
            energyType[1] = [0, 1, 3, 5, 10, 20];
            energyType[2] = [0, 20, 30, 40, 50, 60, 120];
            energyType[3] = [0, 20, 40, 60, 120, 160];
            energyType[4] = [0, 80, 160, 240, 320, 400];
            energyType[5] = [0, 400, 400, 2000];

            energyType[1][1] += player.strangeness[1][7] * 2;
            if (player.strangeness[5][10] >= 1) { energyType[5][3] *= 5; }
        } else { energyType[1] = [0, 1, 5, 20]; }

        let energyTrue = 0;
        for (let s = 1; s < (player.inflation.vacuum ? 6 : 2); s++) {
            let add = 0;
            for (let i = 1; i < energyType[s].length; i++) {
                if (player.challenges.active === 0 && s !== 1) { energyType[s][i] /= (s >= 4 ? 4 : 2); }
                if (!reset) { add += energyType[s][i] * player.buildings[s][i as 1].true; }
            }
            global.dischargeInfo.energyStage[s] = add;
            if (!reset) { energyTrue += add; }
        }
        global.dischargeInfo.energyTrue = energyTrue;

        //Dark energy
        energyType[6] = [0, 1];
        global.dischargeInfo.energyStage[6] = 0;
        for (let i = 1; i < energyType[6].length; i++) {
            energyType[6][i] *= 1 + player.researches[6][4];
            if (!reset) { global.dischargeInfo.energyStage[6] += energyType[6][i] * player.buildings[6][i as 1].true; }
        }
    },
    newClouds: (): number => {
        const softcap = calculateEffects.cloudsGain();
        return (global.vaporizationInfo.get = (player.vaporization.clouds ** (1 / softcap) + player.buildings[2][1][player.researchesExtra[2][0] >= 1 || (player.inflation.vacuum && player.tree[1][5] >= 1) ? 'total' : 'current'].toNumber() / calculateEffects.S2Upgrade2()) ** softcap - player.vaporization.clouds);
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
        let effectS1 = effectsCache.star2;
        if (player.elements[10] >= 1) { effectS1 *= 2; }
        if (player.researchesExtra[4][1] >= 1) { effectS1 *= calculateEffects.S4Extra1(); }
        effectsCache.S1SolarDelay = effectS1;

        global.collapseInfo.solarCap = 0.01235 * effectsCache.S3SolarDelay * effectS1;
        if (player.strangeness[5][7] >= 1) { global.collapseInfo.solarCap *= global.strangeInfo.stageBoost[5]; }
        if (player.tree[1][6] >= 3) { global.collapseInfo.solarCap *= 1.01 ** global.accretionInfo.effective; }
    },
    /** Doesn't assign, have to be after assignResetInformation.newMass() */
    timeUntil: (): number => {
        if (player.inflation.vacuum) {
            assignBuildingsProduction.stage3Cache();
            assignBuildingsProduction.stage1Cache();
            const time = (global.collapseInfo.solarCap / 8.96499278339628e-67 - player.buildings[1][0].current.toNumber()) / assignBuildingsProduction.S1Build1() / global.inflationInfo.globalSpeed;
            return isNaN(time) ? Infinity : time;
        } else { return 0; }
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
        starCheck[0] = building[2].trueTotal.moreThan(0) ? Math.max(building[2].true + Math.floor(building[1].true * player.strangeness[4][3] / 10) - stars[0], 0) : 0;
        starCheck[1] = Math.max(building[3].true - stars[1], 0);
        starCheck[2] = Math.max(building[4].true + (building[5].true * player.researches[4][5]) - stars[2], 0);
    },
    /** Returns Groups Galaxy requirement */
    mergeReward: (): number => {
        const researchesExtra = player.researchesExtra[5];
        const requirement = 50 - calculateEffects.S5Extra4();

        global.mergeInfo.checkReward[0] = researchesExtra[1] >= 2 ?
            Math.max(Math.floor(global.mergeInfo.galaxies / requirement) - player.merge.rewards[0], 0) :
            researchesExtra[1] >= 1 ? Math.floor(player.buildings[5][3].true / requirement) : 0;
        global.mergeInfo.checkReward[1] = researchesExtra[5] >= 2 ?
            Math.max(Math.floor(global.mergeInfo.galaxies / 100) - player.merge.rewards[1], 0) :
            researchesExtra[5] >= 1 ? Math.floor(player.buildings[5][3].true / 100) : 0;
        return requirement;
    },
    newFluid: (): number => {
        const points = Math.log10(Math.max(player.buildings[6][0].current.toNumber(), 1e8)) + player.darkness.energy - 8;
        if (points <= 0) { return (global.inflationInfo.newFluid = 0); }
        const effective = player.darkness.fluid + 1;
        const soft = calculateEffects.S6Upgrade0();
        return (global.inflationInfo.newFluid = (effective ** (1 / soft) + points) ** soft - effective);
    },
    /** Interstellar only, also assigns related cache */
    quarksGain: () => {
        let multiplier = player.buildings[5][3].current.toNumber() + 1;
        if (player.inflation.vacuum) { multiplier *= calculateEffects.S5Extra2(player.researchesExtra[5][2] + player.merge.rewards[1]) * (calculateEffects.S2Strange9() ** player.strangeness[2][9]); }
        effectsCache.interstellarQuarks = multiplier;

        effectsCache.element26 = calculateEffects.element26();
        global.strangeInfo.strange0Gain = player.stage.true >= 6 || player.strange[0].total >= 1 ? calculateEffects.strangeGain(true) : 1;
        global.strangeInfo.strange1Gain = player.strangeness[5][8] >= 1 ? calculateEffects.strangeGain(true, false) : 0;
    },
    supervoid: (supervoid = player.challenges.active === 0 && player.challenges.super) => {
        if (global.collapseInfo.supervoid === supervoid) { return; }
        global.collapseInfo.supervoid = supervoid;
        const offset = new Overlimit(10 ** (supervoid ? 2 : -2));
        const startEl = global.elementsInfo.cost;
        const startU4 = global.upgradesInfo[4].cost as Overlimit[];
        const startU5 = global.upgradesInfo[5].cost as Overlimit[];
        const startR4 = global.researchesInfo[4].firstCost as Overlimit[];
        const startR5 = global.researchesInfo[5].firstCost as Overlimit[];
        const startE4 = global.researchesExtraInfo[4].firstCost as Overlimit[];
        const startE5 = global.researchesExtraInfo[5].firstCost as Overlimit[];
        for (let i = 1; i < startEl.length; i++) { startEl[i].multiply(offset); }
        for (let i = 0; i < startU4.length; i++) { startU4[i].multiply(offset); }
        for (let i = 0; i < startU5.length; i++) { startU5[i].multiply(offset); }
        for (let i = 0; i < startR4.length; i++) { startR4[i].multiply(offset); }
        for (let i = 0; i < startR5.length; i++) { startR5[i].multiply(offset); }
        for (let i = 0; i < startE4.length; i++) { startE4[i].multiply(offset); }
        for (let i = 0; i < startE5.length; i++) { startE5[i].multiply(offset); }
    }
};

export const buyBuilding = (index: number, stageIndex: number, howMany = player.toggles.shop.input, auto = false) => {
    if (!checkBuilding(index, stageIndex) || (auto ? player.ASR[stageIndex] < index : global.offline.active)) { return; }
    const building = player.buildings[stageIndex][index as 1];

    let currency; //Readonly
    let minus;
    let free = false;
    let multi = true;
    if (stageIndex === 1) {
        currency = player.buildings[1][index - 1].current;
        if (player.tree[1][8] >= 1) {
            free = true;
        } else if (index === 1 && player.inflation.vacuum) {
            free = player.strangeness[1][8] >= 1 && (player.challenges.supervoid[1] >= 2 || player.researchesExtra[1][2] >= 1);
        }
    } else if (stageIndex === 2) {
        currency = player.buildings[2][index === 1 ? 0 : 1].current;
        free = player.tree[1][8] >= 2;
    } else if (stageIndex === 3) {
        currency = player.buildings[3][0].current;
        free = player.tree[1][8] >= 3;
        if (global.accretionInfo.disableAuto) {
            if (player.accretion.rank >= 6) {
                minus = global.collapseInfo.solarCap * 1.98847e33;
            } else if (player.strangeness[3][4] < 2 && player.challenges.supervoid[1] >= 2) {
                minus = global.accretionInfo.rankCost[player.accretion.rank];
            }
        }
    } else if (stageIndex === 5 && index === 3) {
        currency = player.collapse.mass;
        multi = false;
    } else if (stageIndex === 6) {
        currency = player.buildings[6][0].current;
    } else {
        currency = player.buildings[4][0].current;
        free = player.tree[1][8] >= 4;
    }

    const budget = new Overlimit(currency);
    if (auto && !free && multi && building.true >= 1) {
        if (minus !== undefined) { budget.minus(minus); }
        const divide = stageIndex === 6 && global.inflationInfo.disableAuto ? 1 : player.toggles.shop.wait[stageIndex];
        if (divide > 1) { budget.divide(player.toggles.shop.wait[stageIndex]); }
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
            afford = Math.floor(budget.multiply(scaling - 1).divide(total).plus(1).log(scaling).toNumber());

            if (howMany > 0) {
                if (afford < howMany) { return; }
                afford = howMany;
            }
            if (afford > 1) { total.multiply(new Overlimit(scaling).power(afford).minus(1).divide(scaling - 1)); }
        }

        if (!isFinite(afford)) {
            errorNotify(`Error encountered, couldn't create ${afford} of ${global.buildingsInfo.name[stageIndex][index]}`);
            return;
        }
    }
    building.true += afford;
    building.current.plus(afford);
    building.total.plus(afford);
    building.trueTotal.plus(afford);

    if (typeof currency === 'object') {
        if (!free) {
            currency.minus(total);
            if (player.inflation.vacuum) {
                if (stageIndex === 1) {
                    if (index === 1) { player.buildings[3][0].current.setValue(currency).multiply(1.78266192e-33); }
                } else if (stageIndex === 2) {
                    if (index === 1) { player.buildings[1][5].current.setValue(currency).multiply(6.02214076e23); }
                } else if (stageIndex === 3) {
                    player.buildings[1][0].current.setValue(currency).divide(1.78266192e-33);
                }
            }
        }

        if (player.inflation.vacuum || stageIndex === 1) { addEnergy(afford, index, stageIndex); }
        if (stageIndex === 1) { //True vacuum only
            if (index === 5 && player.upgrades[1][8] === 0) { player.buildings[2][0].current.setValue(building.current).divide(6.02214076e23); }
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
    } else if (stageIndex === 5 && index === 3) {
        //global.mergeInfo.galaxies = player.buildings[5][3].current.toNumber();
        reset('galaxy', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [4, 5]);
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(1, 4, 'researches');
        calculateMaxLevel(2, 4, 'researches');
        calculateMaxLevel(5, 4, 'researches');
        awardVoidReward(5);
        awardMilestone(1, 5);
        addIntoLog('Galaxy reset');
        if (!auto) {
            numbersUpdate();
            if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Galaxy reset'; }
        }
    }
};

/** Increase is how many new Structures have been gained */
export const addEnergy = (increase: number, index: number, stage: number) => {
    const { discharge } = player;
    const { dischargeInfo } = global;

    const add = dischargeInfo.energyType[stage][index] * increase;
    dischargeInfo.energyStage[stage] += add;
    if (stage === 6) {
        if (player.upgrades[6][0] !== 1) { return; }
        player.darkness.energy += add;
        return;
    }
    dischargeInfo.energyTrue += add;
    discharge.energy += add;
    if (discharge.energyMax < discharge.energy) { discharge.energyMax = discharge.energy; }
};

export const calculateBuildingsCost = (index: number, stageIndex: number): Overlimit => {
    const scaling = global.buildingsInfo.increase[stageIndex];
    let firstCost = global.buildingsInfo.firstCost[stageIndex][index];
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
        if (index === 5 && player.challenges.active === 0) {
            scaling[index] = 10;
        } else {
            let increase = 125 + 15 * index;
            if (player.elements[2] >= 1) { increase -= 10; }
            if (player.elements[8] >= 1) { increase -= 5; }
            scaling[index] = increase / 100;
        }
        firstCost /= 2 ** player.strangeness[4][1];
        if (player.researchesExtra[4][3] >= 1) { firstCost /= effectsCache.star1; }
        if (player.elements[13] >= 1) { firstCost /= 100; }
        if (index !== 1 && player.challenges.active === 0 && player.challenges.super) {
            firstCost *= 100;
        }
    } else if (stageIndex === 5) {
        if (index === 3) {
            scaling[3] = player.elements[32] >= 1 ? 110 : 111;
            if (player.challenges.active === 0) {
                scaling[3] += 5;
            } else if (player.challenges.active === 1) {
                scaling[3] += 1;
            }
            scaling[3] /= 100;
            if (player.elements[36] >= 1) { firstCost /= 2; }
        } else if (player.challenges.active === 0 && player.challenges.super) {
            firstCost *= 100;
        }
    } else if (stageIndex === 6) {
        if (index === 1) {
            scaling[1] = (140 - 5 * player.researches[6][3]) / 100;
        }
    }

    return new Overlimit(scaling[index]).power(player.buildings[stageIndex][index as 1].true).multiply(firstCost);
};

export const buyVerse = (index: number, auto = false) => {
    if (!checkVerse(index) || (!auto && global.offline.active) || calculateVerseCost(index) > calculateEffects.mergeScore()) { return; }

    if (player.challenges.active === 0) {
        player.inflation.voidVerses++;
    } else { player.verses[index].true++; }
    player.verses[index].current++;
    if (index === 0) {
        if (player.stage.true < 8) {
            if (player.verses[0].true === 6) {
                playEvent(11);
            } else if (player.stage.true < 7) {
                player.stage.true = 7;
                player.event = false;
                visualTrueStageUnlocks();
                playEvent(9);
            }
        }
        if (player.stage.active < 6) { setActiveStage(1); }
        let income = player.verses[0].true + player.inflation.voidVerses;
        const state = player.challenges.stability >= 3;
        if (state) { income++; }
        player.cosmon[0].current += income;
        player.cosmon[0].total += income;
        player.inflation.resets++;
        player.time.export[1] = 0;
        player.time.export[2] = 0;
        player.challenges.active = null;
        player.clone = {};
        player.inflation.vacuum = state;
        if (!state) { prepareVacuum(false); }
        resetVacuum(1);
        addIntoLog('Universe reset');
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Universe reset'; }
    }
};

export const calculateVerseCost = (index: number): number => global.versesInfo.firstCost[index] * global.versesInfo.increase[index] ** (index === 0 && player.challenges.active === 0 ? player.inflation.voidVerses : player.verses[index].true);

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
    } else if (stageIndex === 6) {
        assignBuildingsProduction.S6Build1(); //Sets hardcap delay
        add.multiply(assignBuildingsProduction.verse0());
    } else {
        add.multiply(assignBuildingsProduction[`S${stageIndex}Build${get + 1}` as 'S2Build1']());
        if (stageIndex === 4) { get = 0; }
    }
    if (add.equal(0)) { return; }
    if (!add.isFinite()) {
        errorNotify(`Error encountered, couldn't gain ${add} of ${global.buildingsInfo.name[stageGet][get]}`);
        return;
    }

    const building = player.buildings[stageGet][get];
    if (stageIndex === 6) {
        const current = building.current.toNumber();
        const hardcap = calculateEffects.darkHardcap();
        const left = hardcap - current;
        const gain = add.toNumber();
        if (gain >= left) {
            const soft = calculateEffects.darkSoftcap();
            add.setValue((left < 0 ?
                (current / hardcap) ** (1 / soft) + gain / hardcap :
                (gain - left) / hardcap + 1) ** soft * hardcap - current
            );
        }
    }
    building.current.plus(add);
    building.total.plus(add);
    building.trueTotal.plus(add);

    if (stageIndex === 1) {
        if (player.inflation.vacuum) {
            if (get === 0) {
                player.buildings[3][0].current.setValue(building.current).multiply(1.78266192e-33);
                player.buildings[3][0].total.setValue(building.total).multiply(1.78266192e-33);
                awardMilestone(0, 3);
            } else if (get === 5) {
                player.buildings[2][0].current.setValue(building.current).divide(6.02214076e23);
            }
        }
    } else if (stageIndex === 2) {
        if (get === 1) {
            assignBuildingsProduction.S2Levels();
        }
    } else if (stageIndex === 3) {
        if (get === 0) { //False vacuum only
            if (player.accretion.rank < 5 && building.current.moreThan(1e30)) { building.current.setValue(1e30); }
            awardMilestone(0, 3);
        }
    }
};

const gainStrange = (get: 0 | 1, time: number) => {
    const strange = player.strange[get];
    const add = global.strangeInfo.strangeletsInfo[0] * (global.strangeInfo[`strange${get}Gain`] / player.time.stage) * time;
    if (add === 0) { return; }
    if (!isFinite(add)) {
        errorNotify(`Error encountered, couldn't gain ${add} of ${global.strangeInfo.name[get]}`);
        return;
    }
    strange.current += add;
    strange.total += add;
    assignBuildingsProduction[`strange${get}`]();
};

export const buyUpgrades = (upgrade: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements', auto = false): boolean => {
    if (!auto && (!checkUpgrade(upgrade, stageIndex, type) || global.offline.active)) { return false; } //Auto should had already checked

    let free = false;
    let currency: Overlimit; //Readonly
    if (stageIndex === 1) {
        currency = new Overlimit(player.discharge.energy);
        if (player.inflation.vacuum) { free = (player.challenges.supervoid[4] >= 1 || player.accretion.rank >= 6) && player.strangeness[1][9] >= 1; }
    } else if (stageIndex === 2) {
        currency = player.buildings[2][1].current;
    } else if (stageIndex === 3) {
        currency = player.buildings[3][0].current;
    } else if (stageIndex === 6) {
        currency = type === 'researchesExtra' ? new Overlimit(player.darkness.energy) : player.buildings[6][0].current;
    } else {
        currency = player.buildings[4][0].current;
    }
    if (currency.isNaN()) {
        errorNotify(`Error encountered, prevented spending of NaN ${global.stageInfo.costName[stageIndex]}`);
        return false;
    }

    if (type === 'upgrades') {
        const pointer = global.upgradesInfo[stageIndex];

        if (player.upgrades[stageIndex][upgrade] >= 1 || currency.lessThan(pointer.cost[upgrade])) { return false; }
        player.upgrades[stageIndex][upgrade]++;
        if (!free) { currency.minus(pointer.cost[upgrade]); }

        /* Special cases */
        if (stageIndex === 2) {
            if (upgrade === 3) {
                effectsCache.S2Upgrade3 = calculateEffects.S2Upgrade3();
            } else if (upgrade === 4) {
                effectsCache.S2Upgrade4 = calculateEffects.S2Upgrade4();
            } else if (upgrade >= 5 /*&& upgrade < 9*/) { assignBuildingsProduction.S2FreeBuilds(); }
        } else if (stageIndex === 4 && upgrade === 1 && global.tabs.current === 'upgrade') { switchTab(); }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `New upgrade '${pointer.name[upgrade]}', has been created`; }
    } else if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];
        const level = player[type][stageIndex];

        const tillMax = pointer.max[upgrade] - level[upgrade];
        if (tillMax <= 0) { return false; }
        let cost = pointer.cost[upgrade];
        if (currency.lessThan(cost)) { return false; }

        let newLevels = 1;
        if (tillMax > 1 && (auto || (player.toggles.max[0] !== global.hotkeys.shift))) {
            const scaling = pointer.scaling[upgrade]; //Must be >1 (>0 for Stage 1)
            if (typeof cost === 'number') {
                if (free) {
                    newLevels = Math.min(Math.floor((currency.toNumber() - cost) / scaling + 1), tillMax);
                } else {
                    const simplify = cost - scaling / 2;
                    newLevels = Math.min(Math.floor(((simplify ** 2 + 2 * scaling * currency.toNumber()) ** 0.5 - simplify) / scaling), tillMax);
                    if (newLevels > 1) { cost = newLevels * (newLevels * scaling / 2 + simplify); }
                }
            } else {
                newLevels = Math.min(Math.floor(new Overlimit(currency).multiply(scaling - 1).divide(cost).plus(1).log(scaling).toNumber()), tillMax);
                if (newLevels > 1) { cost = new Overlimit(scaling).power(newLevels).minus(1).divide(scaling - 1).multiply(cost); }
            }
        }

        level[upgrade] += newLevels;
        if (!free) { currency.minus(cost); }

        /* Special cases */
        calculateResearchCost(upgrade, stageIndex, type);
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
                } else if (upgrade >= 4) {
                    assignBuildingsProduction.S2FreeBuilds();
                }
            } else if (stageIndex === 4) {
                if (upgrade === 2 || upgrade === 3) {
                    calculateMaxLevel(0, 4, 'researches');
                    if (auto) { buyUpgrades(0, 4, 'researches', true); }
                    autoResearchesAddOne('researches', 4, 0);
                }
            } else if (stageIndex === 6) {
                if (upgrade === 4) {
                    assignResetInformation.trueEnergy();
                    if (player.stage.true < 8 && level[4] >= 4) {
                        player.stage.true = 8;
                        player.event = false;
                        visualTrueStageUnlocks();
                        playEvent(12);
                    }
                }
            }
        } else if (type === 'researchesExtra') {
            if (stageIndex === 1) {
                if (upgrade === 2) {
                    global.accretionInfo.effective = calculateEffects.effectiveRank();
                    let update = false;
                    if (player.stage.current < 4) {
                        player.stage.current = level[2] > 1 ? 2 : 3;
                        if (player.toggles.normal[0]) {
                            if (player.stage.active < 4) {
                                setActiveStage(player.stage.current);
                                update = true;
                            } else if (global.trueActive < 4) {
                                global.trueActive = player.stage.current;
                            }
                        }
                    }
                    stageUpdate(update);
                    awardVoidReward(1);
                }
            } else if (stageIndex === 2) {
                if (upgrade === 1) {
                    assignBuildingsProduction.S2Levels();
                }
            } else if (stageIndex === 4) {
                if (upgrade === 2 || upgrade === 3) {
                    calculateMaxLevel(1, 4, 'researches', true);
                }
            } else if (stageIndex === 6) {
                if (upgrade === 0) {
                    calculateMaxLevel(1, 6, 'researches', true);
                }
            }
        }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${level[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(level[upgrade])} for the '${pointer.name[upgrade]}' ${type === 'researches' ? 'Stage' : specialHTML.researchExtraDivHTML[player.stage.active]} Research`; }
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
                for (let i = 1; i < global.elementsInfo.maxActive; i++) {
                    i = player.elements.indexOf(0.5, i);
                    if (i < 1) { break; }
                    buyUpgrades(i, 4, 'elements', true);
                }
            } else if (upgrade === 2) {
                if (player.inflation.vacuum) {
                    if (level[2] === 1 && player.strangeness[3][4] >= 1) { level[2] = 2; }
                    if (level[2] === 2 && player.strangeness[2][4] >= 1) { level[2] = 3; }
                    if (level[2] === 3 && player.strangeness[4][4] >= 1) { level[2] = 4; }
                    if (level[2] === 4 && player.strangeness[5][9] >= 1) { level[2] = 5; }
                }
            }
        }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${level[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(level[upgrade])} for the '${type === 'ASR' ? pointer.name : pointer.name[upgrade]}' automatization Research`; }
    } else if (type === 'elements') {
        let level = player.elements[upgrade];
        if (level >= 1) { return false; }

        if (level === 0) {
            if (currency.lessThan(global.elementsInfo.cost[upgrade])) { return false; }
            currency.minus(global.elementsInfo.cost[upgrade]);
        } else if (!auto) { return false; }
        level = player.researchesAuto[1] >= 1 || level > 0 ? 1 : 0.5;
        player.elements[upgrade] = level;

        /* Special cases */
        if (player.collapse.show < upgrade) { player.collapse.show = upgrade; }
        if (level === 1) {
            if (player.collapse.maxElement < upgrade) { player.collapse.maxElement = upgrade; }

            if ([7, 16, 20, 25, 28, 31, 34].includes(upgrade)) {
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
                let update = false;
                if (player.toggles.normal[0] && (player.strangeness[5][3] >= 1 || !player.inflation.vacuum)) {
                    if (player.stage.active === 4) {
                        setActiveStage(5);
                        update = true;
                    } else if (global.trueActive === 4) {
                        global.trueActive = 5;
                    }
                }
                stageUpdate(update);
                assignBuildingsProduction.strange0();
                awardVoidReward(4);
            } else if (upgrade === 35) {
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
                } else if (currency.lessOrEqual(0)) {
                    player.buildings[2][0].current.max(2.7753108348135e-3);
                }
            }
        } else if (stageIndex === 3) {
            if (player.inflation.vacuum) { player.buildings[1][0].current.setValue(currency).divide(1.78266192e-33); }
        } else if (stageIndex === 6) {
            if (type === 'researchesExtra') { player.darkness.energy = Math.round(currency.toNumber()); }
        }
    }

    if (!auto) { numbersUpdate(); }
    return true;
};

export const buyStrangeness = (upgrade: number, stageIndex: number, type: 'strangeness' | 'inflations', auto = false): boolean => {
    if (!auto && (!checkUpgrade(upgrade, stageIndex, type) || global.offline.active)) { return false; }

    if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];
        const strangeness = player.strangeness[stageIndex];
        const currency = player.strange[0];

        if (strangeness[upgrade] >= pointer.max[upgrade] || currency.current < pointer.cost[upgrade]) { return false; }
        const max = !auto && (player.toggles.max[1] !== global.hotkeys.shift);
        do {
            strangeness[upgrade]++;
            currency.current -= pointer.cost[upgrade];
            calculateResearchCost(upgrade, stageIndex, 'strangeness');
        } while (max && currency.current >= pointer.cost[upgrade] && strangeness[upgrade] < pointer.max[upgrade]);

        /* Special cases */
        if (stageIndex === 1) {
            if (upgrade === 4) {
                if (player.inflation.vacuum) {
                    const maxLevel = player.strangeness[3][4] < 1 ? 1 : player.strangeness[2][4] < 1 ? 2 : player.strangeness[4][4] < 1 ? 3 : player.strangeness[5][9] < 1 ? 4 : 5;
                    if (player.clone.depth === 'stage' && player.clone.researchesAuto[2] === 0) { player.clone.researchesAuto[2] = maxLevel; }
                    if (player.researchesAuto[2] < 1) { player.researchesAuto[2] = maxLevel; }
                } else if (player.stage.current === 1 && player.researchesAuto[2] < 1) { player.researchesAuto[2] = 1; }
            } else if (upgrade === 5) {
                if (player.clone.depth === 'stage') { player.clone.ASR[1] = global.ASRInfo.max[1]; }
                player.ASR[1] = global.ASRInfo.max[1];
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
            } else if (upgrade === 5) {
                if (player.clone.depth === 'stage') { player.clone.ASR[2] = global.ASRInfo.max[2]; }
                player.ASR[2] = global.ASRInfo.max[2];
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
            } else if (upgrade === 5) {
                if (player.clone.depth === 'stage') { player.clone.ASR[3] = global.ASRInfo.max[3]; }
                player.ASR[3] = global.ASRInfo.max[3];
            } else if (upgrade === 6) {
                if (player.clone.depth === 'stage') { player.clone.researchesAuto[0] = Math.max(strangeness[6], player.clone.researchesAuto[0]); }
                player.researchesAuto[0] = Math.max(strangeness[6], player.researchesAuto[0]);
            } else if (upgrade === 9) {
                calculateMaxLevel(2, 0, 'researchesAuto', true);
                global.debug.rankUpdated = null;
                assignResetInformation.maxRank();
                if (player.strangeness[5][9] >= 1) {
                    if (player.clone.depth === 'stage' && player.clone.researchesAuto[2] === 4) { player.clone.researchesAuto[2] = 5; }
                    if (player.researchesAuto[2] === 4) { player.researchesAuto[2] = 5; }
                }
            }
        } else if (stageIndex === 4) {
            if (upgrade === 4) {
                if (player.inflation.vacuum) {
                    const maxLevel = player.strangeness[5][9] < 1 ? 4 : 5;
                    if (player.clone.depth === 'stage' && player.clone.researchesAuto[2] === 3) { player.clone.researchesAuto[2] = maxLevel; }
                    if (player.researchesAuto[2] === 3) { player.researchesAuto[2] = maxLevel; }
                } else if (player.stage.current === 4 && player.researchesAuto[2] < 1) { player.researchesAuto[2] = 1; }
            } else if (upgrade === 5) {
                if (player.clone.depth === 'stage') { player.clone.ASR[4] = global.ASRInfo.max[4]; }
                player.ASR[4] = global.ASRInfo.max[4];
            } else if (upgrade === 6) {
                if (player.clone.depth === 'stage') { player.clone.researchesAuto[1] = Math.max(strangeness[6], player.clone.researchesAuto[1]); }
                player.researchesAuto[1] = Math.max(strangeness[6], player.researchesAuto[1]);
                for (let i = 1; i < global.elementsInfo.maxActive; i++) {
                    i = player.elements.indexOf(0.5, i);
                    if (i < 1) { break; }
                    buyUpgrades(i, 4, 'elements', true);
                }
            } else if (upgrade === 8) {
                if (player.clone.depth === 'stage') { player.clone.elements[0] = 1; }
                if (player.elements[0] < 1) { player.elements[0] = 1; }
            }
        } else if (stageIndex === 5) {
            if (upgrade === 3) {
                if (player.inflation.vacuum) { stageUpdate(false); }
            } else if (upgrade === 4) {
                if (strangeness[5] >= 1) {
                    if (player.clone.depth === 'stage') { player.clone.ASR[5] = global.ASRInfo.max[5]; }
                    player.ASR[5] = global.ASRInfo.max[5];
                }
            } else if (upgrade === 5) {
                const newLevel = strangeness[4] >= 1 ? global.ASRInfo.max[5] : 2;
                if (player.clone.depth === 'stage') { player.clone.ASR[5] = newLevel; }
                player.ASR[5] = newLevel;
            } else if (upgrade === 9) {
                if (player.clone.depth === 'stage' && player.clone.researchesAuto[2] === 4) { player.clone.researchesAuto[2] = 5; }
                if (player.researchesAuto[2] === 4) { player.researchesAuto[2] = 5; }
            } else if (upgrade === 10) {
                assignResetInformation.trueEnergy();
            }
        } else if (stageIndex === 6) {
            if (upgrade === 2) {
                calculateMaxLevel(1, 2, 'strangeness', true);
                calculateMaxLevel(7, 2, 'strangeness', true);
                calculateMaxLevel(0, 4, 'strangeness', true);
                calculateMaxLevel(3, 4, 'strangeness', true);
                calculateMaxLevel(4, 4, 'strangeness', true);
            } else if (upgrade === 3) {
                if (player.ASR[6] < 1 && strangeness[3] >= 2) {
                    player.ASR[6] = 1;
                    if (player.clone.depth === 'stage') { player.clone.ASR[6] = 1; }
                }
                calculateMaxLevel(0, 6, 'ASR', true);
                calculateMaxLevel(8, 1, 'strangeness', true);
            }
        }
        assignBuildingsProduction.strange0();
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${strangeness[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(strangeness[upgrade])} for the '${pointer.name[upgrade]}' ${global.stageInfo.word[stageIndex]} Strangeness`; }
    } else if (type === 'inflations') {
        const pointer = global.treeInfo[stageIndex];
        const tree = player.tree[stageIndex];
        const currency = player.cosmon[stageIndex];

        if (tree[upgrade] >= pointer.max[upgrade] || currency.current < pointer.cost[upgrade]) { return false; }
        const max = !auto && (player.toggles.max[2] !== global.hotkeys.shift);
        do {
            tree[upgrade]++;
            currency.current -= pointer.cost[upgrade];
            calculateResearchCost(upgrade, stageIndex, 'inflations');
        } while (max && currency.current >= pointer.cost[upgrade] && tree[upgrade] < pointer.max[upgrade]);

        /* Special cases */
        if (!auto && stageIndex === 0) { loadoutsVisual(upgrade); }
        if (stageIndex === 0) {
            if (upgrade === 0) {
                if (player.tree[1][2] < 1) {
                    for (let i = 0; i < global.challengesInfo.length; i++) {
                        assignChallengeInformation(i);
                    }
                    for (let s = 1; s < playerStart.milestones.length; s++) {
                        for (let i = 0; i < playerStart.milestones[s].length; i++) {
                            assignMilestoneInformation(i, s);
                        }
                    }
                }
            } else if (upgrade === 5) {
                for (let i = 0; i < global.challengesInfo.length; i++) {
                    assignChallengeInformation(i);
                }
            }
        } else if (stageIndex === 1) {
            if (upgrade === 2) {
                calculateMaxLevel(0, 0, 'inflations', true);
                for (let i = 0; i < global.challengesInfo.length; i++) {
                    assignChallengeInformation(i);
                }
                for (let s = 1; s < playerStart.milestones.length; s++) {
                    for (let i = 0; i < playerStart.milestones[s].length; i++) {
                        assignMilestoneInformation(i, s);
                    }
                }
            } else if (upgrade === 3) {
                calculateMaxLevel(2, 0, 'inflations', true);
            } else if (upgrade === 5) {
                calculateMaxLevel(0, 2, 'researchesExtra', true);
                calculateMaxLevel(9, 2, 'strangeness', true);
            } else if (upgrade === 6) {
                calculateMaxLevel(0, 4, 'researches', true);
                calculateMaxLevel(9, 3, 'strangeness', true);
            }
        }
        if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${tree[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(tree[upgrade])} for the '${pointer.name[upgrade]}' Inflation`; }
    }

    if (!auto) { numbersUpdate(); }
    return true;
};

/** Returns true if refund successfull or nothing to refund */
export const inflationRefund = async(noConfirmation = false, loadout = false): Promise<boolean> => {
    if (global.offline.active) { return false; }
    const inflaton = player.cosmon[0];
    if (inflaton.current === inflaton.total && player.tree[0][0] < 1) { return true; }
    const challenge = player.challenges.active;
    if (!noConfirmation && !await Confirm(loadout ? 'Refund basic Inflations before loading this loadout?' :
        `This will force a Stage reset${challenge !== null ? ' and restart current Challenge' : ''}, continue?`)) { return loadout; }

    if (challenge !== null) { challengeReset(); }
    stageFullReset();
    if (challenge !== null) { challengeReset(challenge); }

    inflaton.current = inflaton.total;
    for (let i = 0; i < playerStart.tree[0].length; i++) {
        player.tree[0][i] = 0;
        calculateResearchCost(i, 0, 'inflations');
    }

    /* Special cases */
    addIntoLog('Inflations refunded');
    for (let i = 0; i < global.challengesInfo.length; i++) {
        assignChallengeInformation(i);
    }
    for (let s = 1; s < playerStart.milestones.length; s++) {
        for (let i = 0; i < playerStart.milestones[s].length; i++) {
            assignMilestoneInformation(i, s);
        }
    }
    if (!loadout) {
        numbersUpdate();
        if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Inflations have been refunded'; }
    }
    return true;
};

export const calculateResearchCost = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'strangeness' | 'inflations') => {
    if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];

        if (typeof pointer.cost[research] === 'number') {
            pointer.cost[research] = (pointer.firstCost[research] as number) + pointer.scaling[research] * player[type][stageIndex][research];
        } else {
            (pointer.cost[research] as Overlimit).setValue(pointer.scaling[research]).power(player[type][stageIndex][research]).multiply(pointer.firstCost[research]);
        }
    } else if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        pointer.cost[research] = player.inflation.vacuum ?
            Math.floor(Math.round((pointer.firstCost[research] * pointer.scaling[research] ** player.strangeness[stageIndex][research]) * 100) / 100) :
            Math.floor(Math.round((pointer.firstCost[research] + pointer.scaling[research] * player.strangeness[stageIndex][research]) * 100) / 100);
    } else if (type === 'inflations') {
        const pointer = global.treeInfo[stageIndex];

        pointer.cost[research] = Math.floor(Math.round((pointer.firstCost[research] + pointer.scaling[research] * player.tree[stageIndex][research]) * 100) / 100);
    }
};

export const calculateMaxLevel = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'strangeness' | 'inflations', addAuto = false) => {
    let max = null as unknown as number;
    if (type === 'researches') {
        if (stageIndex === 2) {
            if (research === 2) {
                max = player.strangeness[2][8] >= 1 ? 7 : 4;
            } else if (research === 3) {
                max = player.strangeness[2][8] >= 2 ? 5 : 4;
            } else if (research === 4) {
                max = player.strangeness[2][2] >= 1 ? 3 : 2;
            } else if (research === 5) {
                max = player.strangeness[2][2] >= 2 ? 2 : 1;
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                max = (player.elements[9] >= 1 ? 15 : 3) + (3 * player.researches[4][2]) + (3 * player.researches[4][3]);
                if (player.elements[17] >= 1) { max += 24; }
                if (player.inflation.vacuum && player.tree[1][6] >= 2) { max += Math.floor(global.accretionInfo.effective); }
            } else if (research === 1) {
                max = (player.elements[7] >= 1 ? 4 : 2) + player.researchesExtra[4][2] + player.researchesExtra[4][3];
                if (player.elements[16] >= 1) { max++; }
                if (player.elements[20] >= 1) { max++; }
                if (player.elements[25] >= 1) { max++; }
                if (player.elements[28] >= 1) { max++; }
                if (player.elements[31] >= 1) { max++; }
                if (player.elements[34] >= 1) { max++; }
            } else if (research === 2) {
                max = player.elements[11] >= 1 ? 2 : 1;
            } else if (research === 5) {
                max = player.elements[35] >= 1 ? 2 : 1;
            }
        } else if (stageIndex === 5) {
            if (research === 0 || research === 1) {
                max = player.inflation.vacuum ? 4 : 3;
            } else if (research === 2 || research === 3) {
                max = player.verses[0].current >= 5 ? 8 : player.verses[0].current >= 4 ? 4 : 2;
            } else if (research === 4) {
                max = player.verses[0].current >= 7 ? 6 : 4;
            }
        } else if (stageIndex === 6) {
            if (research === 1) {
                max = 14 + player.researchesExtra[6][0];
            }
        }
    } else if (type === 'researchesExtra') {
        if (stageIndex === 2) {
            if (research === 0) {
                max = player.inflation.vacuum && player.tree[1][5] >= 2 ? 4 : 1;
            }
        } else if (stageIndex === 3) {
            if (research === 0) {
                max = (player.strangeness[3][2] >= 1 ? 20 : 14) + Math.floor(2 * calculateEffects.effectiveRank());
            } else if (research === 1) {
                max = player.strangeness[3][2] >= 2 ? 8 : 6;
            } else if (research === 4) {
                max = player.accretion.rank - 2;
            }
        } else if (stageIndex === 5) {
            if (research === 1) {
                max = player.verses[0].current >= 4 ? 2 : 1;
            } else if (research === 2) {
                max = player.verses[0].current >= 5 ? 8 : 2;
            } else if (research === 3) {
                max = player.verses[0].current >= 5 ? 2 : 1;
            } else if (research === 4) {
                max = player.verses[0].current >= 13 ? 5 : player.verses[0].current >= 10 ? 4 : player.verses[0].current >= 7 ? 3 : 2;
            } else if (research === 5) {
                max = player.verses[0].current >= 12 ? 2 : 1;
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
        } else if (stageIndex === 6) {
            max = player.strangeness[6][3] >= 1 ? 1 : 0;
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
            } else if (research === 8) {
                max = player.strangeness[6][3] >= 2 ? 3 : 2;
            }
        } else if (stageIndex === 2) {
            if (research === 1) {
                max = player.strangeness[6][2] >= 2 ? 14 : 8;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 3) {
                max = 2;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = player.inflation.vacuum && player.challenges.void[4] >= 1 ? 2 : 1;
            } else if (research === 7) {
                max = player.strangeness[6][2] >= 4 ? 9 : 6;
            } else if (research === 9) {
                max = player.tree[1][5] >= 4 ? 2 : 1;
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
            } else if (research === 9) {
                max = player.tree[1][6] >= 4 ? 2 : 1;
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                max = player.strangeness[6][2] >= 5 ? 12 : 8;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 1) {
                max = 4;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 3) {
                max = player.strangeness[6][2] >= 3 ? 6 : 2;
            } else if (research === 4) {
                max = player.strangeness[6][2] >= 1 ? 2 : 1;
                if (player.inflation.vacuum && player.challenges.void[4] >= 1) { max++; }
            } else if (research === 6) {
                max = player.inflation.vacuum || player.milestones[4][0] >= 8 || player.verses[0].current >= 3 ? 2 : 1;
            }
        } else if (stageIndex === 5) {
            if (research === 2) {
                max = 2;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 6) {
                max = !player.inflation.vacuum && (player.milestones[5][0] >= 8 || player.verses[0].current >= 5) ? 2 : 1;
            }
        }
    } else if (type === 'inflations') {
        if (stageIndex === 0) {
            if (research === 0) {
                max = 2;
                if (player.tree[1][2] >= 2) { max += player.tree[1][2] - 1; }
            } else if (research === 2) {
                max = 8 + player.tree[1][3];
            }
        }
    }
    if (max !== null) {
        if (max < 0) { max = 0; }
        if (type === 'inflations') {
            global.treeInfo[stageIndex].max[research] = max;
        } else if (type === 'researchesAuto' || type === 'ASR') {
            global[`${type}Info`].max[type === 'ASR' ? stageIndex : research] = max;
        } else {
            global[`${type}Info`][stageIndex].max[research] = max;
        }
    }

    if (type !== 'researchesAuto' && type !== 'ASR') { calculateResearchCost(research, stageIndex, type); }
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
        const startCost = global.upgradesInfo[which].cost as number[];
        array.sort((a, b) => startCost[a] - startCost[b]);
    } else {
        const startCost = global.upgradesInfo[which].cost as Overlimit[];
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

    const cost = pointer.cost;
    if (typeof pointer.cost[0] === 'number') {
        array.sort((a, b) => (cost[a] as number) - (cost[b] as number));
    } else {
        array.sort((a, b) => compareFunc(cost[a] as Overlimit, cost[b]));
    }
    global.automatization[type === 'researches' ? 'autoR' : 'autoE'][which] = array;
};
/** Add Research if it isn't already present */
const autoResearchesAddOne = (type: 'researches' | 'researchesExtra', stageIndex: number, which: number) => {
    const pointer = global[`${type}Info`][stageIndex];
    if (player[type][stageIndex][which] >= pointer.max[which] || !player.toggles.auto[type === 'researches' ? 6 : 7]) { return; }

    const auto = global.automatization[type === 'researches' ? 'autoR' : 'autoE'][stageIndex];
    if (auto.includes(which)) { return; }
    const cost = pointer.cost[which];
    for (let i = 0; i < auto.length; i++) {
        if (typeof cost === 'number' ? cost < (pointer.cost[auto[i]] as number) : cost.lessThan(pointer.cost[auto[i]])) {
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
            const current = pointer.cost[auto[index]];
            if (typeof current === 'number') {
                while (current > (pointer.cost[auto[i + 1]] as number)) { i++; }
            } else {
                while (current.moreThan(pointer.cost[auto[i + 1]])) { i++; }
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
    for (let i = 1; i < global.elementsInfo.maxActive; i++) {
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

/** Returns true for Auto, only if reset happened */
export const stageResetCheck = (stageIndex: number, quarks = null as number | null): boolean => {
    if (stageIndex === 5) {
        if (quarks !== null) {
            if (player.elements[26] < 0.5) { return false; }
            assignResetInformation.quarksGain();

            const { stage } = player;
            const peakCheck = global.strangeInfo.strange0Gain / player.time.stage;
            if (stage.peak < peakCheck) {
                stage.peak = peakCheck;
                stage.peakedAt = player.time.stage;
            }

            if (player.elements[26] < 1) { return false; }
            if (player.verses[0].current >= 8) { gainStrange(1, quarks); }
            gainStrange(0, quarks);

            if (!player.toggles.auto[0] || player.strangeness[5][6] < (player.inflation.vacuum ? 1 : 2) || player.challenges.active !== null ||
                stage.input <= 0 || stage.input > player.time.stage || (player.toggles.normal[2] && player.inflation.vacuum && player.upgrades[5][3] === 1 && player.merge.resets < calculateEffects.mergeMaxResets())) { return false; }
            stageResetReward(stageIndex);
            return true;
        }
        assignResetInformation.quarksGain();
        return player.elements[26] >= 1;
    } else if (stageIndex === 3) {
        if (player.buildings[3][0].current.lessThan(2.45576045e31)) { return false; }
    } else if (stageIndex === 2) {
        if (player.buildings[2][1].current.lessThan(1.19444e29)) { return false; }
    } else if (stageIndex === 1) {
        if (player.buildings[1][3].current.lessThan(1.67133125e21)) { return false; }
    } else { return false; }

    if (quarks !== null) { //Just checks if auto
        if (player.strangeness[5][6] < 1) { return false; }
        if (player.toggles.normal[2]) { //False vacuum only
            const info = global.milestonesInfo[stageIndex];
            const unlimitedTime = player.tree[0][4] >= 1;
            for (let i = 0; i < info.scaling.length; i++) {
                if (player.milestones[stageIndex][i] < info.scaling[i].length && (unlimitedTime || info.reward[i] >= player.time.stage)) { return false; }
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
                if (calculateVerseCost(0) <= calculateEffects.mergeScore()) {
                    array.push('can create an Universe');
                }
                if (player.merge.resets < calculateEffects.mergeMaxResets()) {
                    array.push('still capable to do more Merge resets');
                }
            } else if (player.buildings[5][3].true >= calculateEffects.mergeRequirement()) {
                array.push('can Collapse Vacuum into its true state');
            }
        }
        if (player.researchesExtra[5][0] >= 1) {
            const galaxyCost = calculateBuildingsCost(3, 5).toNumber();
            if (galaxyCost <= Math.max(player.collapse.mass, global.collapseInfo.newMass)) {
                array.push(`can afford a Galaxy${galaxyCost > player.collapse.mass ? ' after Collapse' : ''}`);
            }
        }
        if (player.challenges.active === 0) {
            array.push('currently inside the Void');
        }
        if (array.length > 0) {
            if (!await Confirm(`Prevented Stage reset because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!stageResetCheck(active)) { return Notify('Stage reset canceled, requirements are no longer met'); }
        }
    }
    stageResetReward(active);
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Stage reset'; }
};

/** Requires call of stageResetCheck or assignResetInformation.quarksGain */
const stageResetReward = (stageIndex: number) => {
    const { stage } = player;

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
        } else if (stage.resets < 1) { playEvent(7); }
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
        const conversion = (1 + player.tree[0][5]) * player.tree[0][5] / 50;
        const quarks = stageIndex >= 4 ? global.strangeInfo.strange0Gain : calculateEffects.strangeGain(false);
        const strangelets = stageIndex >= 4 ? global.strangeInfo.strange1Gain : 0;
        strange[0].current += quarks;
        strange[0].total += quarks;
        if (strangelets > 0) {
            strange[1].current += strangelets;
            strange[1].total += strangelets;
            assignBuildingsProduction.strange1();
            exportReward[2] = Math.max(exportReward[2], strangelets) + strangelets * conversion;
        }
        assignBuildingsProduction.strange0(false);
        exportReward[1] = Math.max(exportReward[1], quarks) + quarks * conversion;
        if (stageIndex >= 4) {
            const history = player.history.stage;
            const storage = global.historyStorage.stage;
            const realTime = player.time.stage;
            storage.unshift([realTime, quarks, strangelets]);
            if (storage.length > 100) { storage.length = 100; }
            if (quarks / realTime > history.best[1] / history.best[0]) {
                history.best = [realTime, quarks, strangelets];
            }
        }
        addIntoLog(`${player.inflation.vacuum ? '' : `${global.stageInfo.word[stageIndex === 5 ? 4 : stageIndex]} `}Stage reset, new Strange quarks are ${format(strange[0].current, { padding: true })}${stageIndex === 5 ? `\nPeak was ${format(player.stage.peak, { type: 'income' })}, reached at ${format(player.stage.peakedAt, { type: 'time' })}` : ''}`);
    } else { addIntoLog(`${global.stageInfo.word[stageIndex]} Stage ended`); }

    stage.resets++;
    resetStage(resetThese, update, fullReset);
};
const stageFullReset = (noReward = false) => {
    const vacuum = player.inflation.vacuum;
    const current = vacuum ? 5 : player.stage.current;
    if (!vacuum) {
        if (current !== 1 && player.milestones[1][1] >= 6) {
            if (!noReward && stageResetCheck(1)) {
                stageResetReward(1);
            } else {
                resetStage([1], false, false);
            }
        }
        if (current !== 2 && player.milestones[2][1] >= 7) {
            if (!noReward && stageResetCheck(2)) {
                stageResetReward(2);
            } else {
                resetStage([2], false, false);
            }
        }
        if (current !== 3 && player.milestones[3][1] >= 7) {
            if (!noReward && stageResetCheck(3)) {
                stageResetReward(3);
            } else {
                resetStage([3], false, false);
            }
        }
    }

    if (!noReward && stageResetCheck(current)) {
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
        visualUpdate();
        numbersUpdate();
        return;
    }

    setActiveStage(stage, active);
    stageUpdate();
};

/** Doesn't check for Stage being unlocked, requires stageUpdate() call afterwards */
export const setActiveStage = (stage: number, active = stage) => {
    if (!global.offline.active) { getId(`stageSwitch${player.stage.active}`).style.textDecoration = ''; }
    player.stage.active = stage;
    global.trueActive = active;
    if (global.offline.active) {
        global.offline.stage[0] = stage;
        return;
    }
    getId(`stageSwitch${stage}`).style.textDecoration = 'underline' + (global.trueActive !== stage ? ' dashed' : '');

    if (global.tabs.current === 'Elements') {
        if (stage !== 4 && stage !== 5) { switchTab('upgrade'); }
    }
    if (global.tabs.current === 'upgrade') {
        if (global.tabs.upgrade.current === 'Elements' && stage !== 4 && stage !== 5) { switchTab('upgrade', 'Upgrades'); }
    }
};

/** Returns true for Auto, only if reset happened */
const dischargeResetCheck = (goals = false): boolean => {
    if (player.upgrades[1][5] !== 1) { return false; }
    const info = global.dischargeInfo;
    const energy = player.discharge.energy;
    const level = player.strangeness[1][4];

    info.next = calculateEffects.dischargeCost();
    if (goals) {
        if (level >= 2) {
            while (info.energyTrue >= info.next) {
                dischargeReset(true);
                info.total = calculateEffects.effectiveGoals();
                info.next = calculateEffects.dischargeCost();
            }
        } else if (level < 1 && (player.researchesAuto[2] < 1 || (!player.inflation.vacuum && player.stage.current !== 1))) { return false; }
        if (!player.toggles.auto[1] || (energy >= info.energyTrue && (level >= 2 || energy < info.next))) { return false; }
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

    dischargeReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Discharge reset'; }
};

const dischargeReset = (freeGoals = false) => {
    const increased = freeGoals || (player.strangeness[1][4] < 2 && player.discharge.energy >= global.dischargeInfo.next);
    if (increased) {
        player.discharge.current++;
        if (!freeGoals) { player.discharge.energy -= global.dischargeInfo.next; }
    }
    awardVoidReward(1);
    if (!freeGoals) {
        addIntoLog(`Discharge reset${increased ? ', Goal reached' : ''}`);
        reset('discharge', player.challenges.active === 0 ? [1, 2, 3, 4, 5] : [1]);
    }
};

/** Returns true for Auto, only if reset happened */
const vaporizationResetCheck = (clouds = null as number | null): boolean => {
    if (player.upgrades[2][2] !== 1 || assignResetInformation.newClouds() <= 0) { return false; }

    if (clouds !== null) {
        const level = player.strangeness[2][4];
        if (level >= 2 || (player.inflation.vacuum && player.researchesExtra[2][0] >= 1 && player.tree[1][5] >= 1)) {
            vaporizationReset(clouds);
            if (player.toggles.normal[1] || !player.toggles.auto[2]) { return false; }
            assignResetInformation.newClouds();
        } else if (!player.toggles.auto[2]) { return false; }
        if (level < 1 && (player.inflation.vacuum ? player.researchesAuto[2] < 3 : (player.researchesAuto[2] < 1 || player.stage.current !== 2))) { return false; }

        const vaporization = player.vaporization;
        if (player.inflation.vacuum && vaporization.input[1] > 0 && vaporization.clouds >= vaporization.input[1]) { return false; }
        const rainNow = calculateEffects.S2Extra1(player.researchesExtra[2][1]);
        const rainAfter = calculateEffects.S2Extra1(player.researchesExtra[2][1], true);
        if ((calculateEffects.clouds(true) / calculateEffects.clouds()) * (rainAfter / rainNow) * (calculateEffects.S2Extra2(rainAfter) / calculateEffects.S2Extra2(rainNow)) < vaporization.input[0]) { return false; }
        vaporizationReset();
    }
    return true;
};
export const vaporizationResetUser = async() => {
    if (global.offline.active || !vaporizationResetCheck()) { return; }

    if (player.toggles.confirm[2] !== 'None') {
        const array = [];
        if (player.strangeness[2][4] >= 2 || (player.inflation.vacuum && player.researchesExtra[2][0] >= 1 && player.tree[1][5] >= 1)) {
            array.push('already gaining Clouds without needing to reset');
        }
        const rainNow = calculateEffects.S2Extra1(player.researchesExtra[2][1]);
        const rainAfter = calculateEffects.S2Extra1(player.researchesExtra[2][1], true);
        if ((calculateEffects.clouds(true) / calculateEffects.clouds()) * (rainAfter / rainNow) * (calculateEffects.S2Extra2(rainAfter) / calculateEffects.S2Extra2(rainNow)) < 2) {
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

    vaporizationReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Vaporization reset'; }
};

const vaporizationReset = (autoClouds = null as number | null) => {
    const vaporization = player.vaporization;

    if (autoClouds !== null) {
        const level = player.researchesExtra[2][0];
        if (level >= 1 && player.tree[1][5] >= 1) {
            autoClouds /= 20 / (level + level ** 2);
            if (player.strangeness[2][4] < 2) { autoClouds /= 4; }
        } else { autoClouds /= 40; }
        vaporization.clouds += global.vaporizationInfo.get * autoClouds;
    } else {
        vaporization.clouds += global.vaporizationInfo.get;
        addIntoLog(`Vaporization reset, new Clouds are ${format(player.vaporization.clouds, { padding: true })}`);
        reset('vaporization', player.challenges.active === 0 ? [1, 2, 3, 4, 5] : player.inflation.vacuum ? [1, 2] : [2]);
    }
    if (vaporization.cloudsMax < vaporization.clouds) { vaporization.cloudsMax = vaporization.clouds; }
    awardVoidReward(2);
};

/** Returns true for Auto, only if reset happened */
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
        if (player.inflation.vacuum && (player.researchesExtra[2][1] <= 0 || player.vaporization.clouds <= 0) && player.accretion.rank >= 4) {
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
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Increased Rank to '${global.accretionInfo.rankName[player.accretion.rank]}'`; }
};

const rankReset = () => {
    player.accretion.rank++;
    if (player.accretion.rank === 6) {
        player.stage.current = 4;
        let update = false;
        if (player.toggles.normal[0]) {
            if (player.stage.active < 4) {
                setActiveStage(4);
                update = true;
            } else if (global.trueActive < 4) {
                global.trueActive = 4;
            }
        }
        stageUpdate(update);
    }
    awardVoidReward(3);
    //global.accretionInfo.effective = calculateEffects.effectiveRank();
    //global.dischargeInfo.total = calculateEffects.effectiveGoals();
    if (player.accretion.rank > 1) { addIntoLog(`Rank reset, new Rank is "${global.accretionInfo.rankName[player.accretion.rank]}"`); }
    reset('rank', player.challenges.active === 0 ? [1, 2, 3, 4, 5] : player.inflation.vacuum ? [1, 2, 3] : [3]);
    calculateMaxLevel(0, 3, 'researchesExtra', true);
    calculateMaxLevel(4, 3, 'researchesExtra', true);
    calculateMaxLevel(0, 4, 'researches', true);
    if (player.stage.active === 3) { visualUpdate(); }
};

/** Returns true for Auto, only if reset happened */
const collapseResetCheck = (remnants = false): boolean => {
    assignResetInformation.newMass(); //Required
    if (player.upgrades[4][0] !== 1) { return false; }
    assignResetInformation.newStars();
    const info = global.collapseInfo;
    const collapse = player.collapse;
    const level = player.strangeness[4][4];

    if (remnants) {
        if (level >= 2) {
            if (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0) {
                collapse.stars[0] += info.starCheck[0];
                collapse.stars[1] += info.starCheck[1];
                collapse.stars[2] += info.starCheck[2];
                effectsCache.star1 = calculateEffects.star[1]();
                effectsCache.star2 = calculateEffects.star[2]();
                assignResetInformation.newStars(true);
                assignResetInformation.newMass();
                awardVoidReward(4);
            }
            if (level >= 3) {
                if (info.newMass > collapse.mass) {
                    collapse.mass = info.newMass;
                    if (collapse.massMax < collapse.mass) { collapse.massMax = collapse.mass; }
                    awardVoidReward(4);
                }
                return false;
            }
        } else if (level < 1 && (player.inflation.vacuum ? player.researchesAuto[2] < 4 : (player.researchesAuto[2] < 1 || player.stage.current < 4))) { return false; }
        if (!player.toggles.auto[4]) { return false; }

        if (player.strangeness[5][4] >= 1 && player.toggles.buildings[5][3] && player.ASR[5] >= 3 && player.researchesExtra[5][0] >= 1 && calculateBuildingsCost(3, 5).toNumber() <= info.newMass) {
            collapseReset(false);
            return true;
        }
        const timeUntil = assignResetInformation.timeUntil();
        if (timeUntil > 0 && timeUntil < collapse.input[1]) { return false; }
        while (info.pointsLoop < collapse.points.length) {
            const point = collapse.points[info.pointsLoop];
            if (point > info.newMass || (point > 40 && player.strangeness[5][4] < 1)) { break; }
            info.pointsLoop++;
            if (point > collapse.mass) {
                collapseReset();
                return true;
            }
        }
        const massBoost = (calculateEffects.mass(true) / effectsCache.mass) * (calculateEffects.S4Research4(true) / calculateEffects.S4Research4()) * ((1 + (calculateEffects.S5Upgrade2(true) - calculateEffects.S5Upgrade2()) / effectsCache.galaxyBase) ** (player.buildings[5][3].true * 2));
        if (massBoost >= collapse.input[0]) {
            collapseReset();
            return true;
        } else if (level >= 2) { return false; }
        const calculateStar = calculateEffects.star;
        const starProd = global.buildingsInfo.producing[4];
        const restProd = new Overlimit(starProd[1]).allPlus(starProd[3], starProd[4], starProd[5]);
        if (!(massBoost * new Overlimit(starProd[2]).multiply(calculateStar[0](true) / calculateStar[0]()).plus(restProd).divide(restProd.plus(starProd[2])).toNumber() * (calculateStar[1](true) / effectsCache.star1) * (calculateStar[2](true) / effectsCache.star2) >= collapse.input[0])) { return false; } //Done this way to remove NaN
        collapseReset();
        return true;
    }
    return (level < 3 && info.newMass > collapse.mass) || (level < 2 && (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0)) || player.elements.includes(0.5, 1);
};
export const collapseResetUser = async() => {
    if (global.offline.active || !collapseResetCheck()) { return; }

    if (player.toggles.confirm[4] !== 'None') {
        const array = [];
        if (player.inflation.vacuum) {
            const timeUntil = assignResetInformation.timeUntil();
            const unlockedG = player.researchesExtra[5][0] >= 1;
            const cantAffordG = !unlockedG || calculateBuildingsCost(3, 5).toNumber() > global.collapseInfo.newMass;
            if (timeUntil > 0 && timeUntil < 1e6 && cantAffordG) {
                array.push(`${unlockedG ? 'will not be able to afford new Galaxy and ' : ''}Solar mass isn't hardcapped, but can be hardcapped soon`);
            }
            if (player.researchesExtra[2][1] <= 0 || player.vaporization.clouds <= 0) {
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

    collapseReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Collapse reset'; }
};

const collapseReset = (log = true) => {
    const collapseInfo = global.collapseInfo;
    const collapse = player.collapse;

    collapse.stars[0] += collapseInfo.starCheck[0];
    collapse.stars[1] += collapseInfo.starCheck[1];
    collapse.stars[2] += collapseInfo.starCheck[2];
    if (collapseInfo.newMass > collapse.mass) {
        collapse.mass = collapseInfo.newMass;
        if (collapse.massMax < collapse.mass) { collapse.massMax = collapse.mass; }
    }
    for (let i = 1; i < global.elementsInfo.maxActive; i++) { //Must be below mass and star checks
        i = player.elements.indexOf(0.5, i);
        if (i < 1) { break; }
        buyUpgrades(i, 4, 'elements', true);
    }

    if (log) { addIntoLog(`Collapse reset, Solar mass is at ${format(collapse.mass, { padding: true })}`); }
    reset('collapse', player.challenges.active === 0 ? [1, 2, 3, 4, 5] : player.inflation.vacuum ? [1, 2, 3, 4] : (player.strangeness[5][3] < 1 ? [4, 5] : [4]));
    calculateMaxLevel(0, 4, 'researches');
    calculateMaxLevel(1, 4, 'researches');
    awardVoidReward(4);
};

/** Returns true for Auto, only if reset happened */
const mergeResetCheck = (auto = false): boolean => {
    if (player.upgrades[5][3] !== 1) { return false; }
    const galaxies = player.buildings[5][3].true;
    if (!player.inflation.vacuum) {
        if (galaxies < calculateEffects.mergeRequirement()) { return false; }
        if (auto) {
            if (player.strangeness[5][9] < 1) { return false; }
            mergeReset();
        }
        return true;
    }
    const merge = player.merge;
    if (merge.resets >= calculateEffects.mergeMaxResets() || galaxies < 1) { return false; }

    if (auto) {
        if ((player.strangeness[5][9] < 1 && player.researchesAuto[2] < 5) || (merge.input[1] !== 0 ? merge.since < merge.input[1] : assignResetInformation.timeUntil() > 0) || galaxies < merge.input[0]) { return false; }
        mergeReset();
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
        if (player.stage.active !== 5 && player.stage.active !== 6) {
            array.push("current active Stage isn't Intergalactic");
        }
        if (array.length > 0) {
            if (!await Confirm(`Prevented Merging because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!mergeResetCheck()) { return Notify('Merge canceled, requirements are no longer met'); }
        }
    }

    mergeReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = player.inflation.vacuum ? 'Merged Galaxies' : 'Decayed Vacuum'; }
};

const mergeReset = () => {
    if (!player.inflation.vacuum) {
        if (awardStabilityReward()) { return; }
        if (player.stage.true >= 7) {
            player.cosmon[0].current++;
            player.cosmon[0].total++;
        } else {
            player.stage.true = 6;
            player.collapse.show = 0;
            player.event = false;
            visualTrueStageUnlocks();
            playEvent(6);
        }

        if (player.stage.active < 6) { setActiveStage(1); }
        player.inflation.vacuum = true;
        player.inflation.resets++;
        player.time.export[1] = 0;
        player.time.export[2] = 0;
        prepareVacuum(true);
        resetVacuum();
        addIntoLog('Vacuum reset');
        return;
    }
    assignResetInformation.mergeReward();

    player.merge.resets++;
    player.merge.rewards[0] += global.mergeInfo.checkReward[0];
    player.merge.rewards[1] += global.mergeInfo.checkReward[1];
    addIntoLog(`Merge reset, Galaxies before reset ${format(player.buildings[5][3].current, { padding: 'exponent' })} [${format(player.buildings[5][3].true)}]`);
    player.buildings[5][3].true = 0;
    reset('galaxy', [1, 2, 3, 4, 5]);
    calculateMaxLevel(0, 4, 'researches');
    calculateMaxLevel(1, 4, 'researches');
    calculateMaxLevel(2, 4, 'researches');
    calculateMaxLevel(5, 4, 'researches');
    if (player.stage.current < 6) {
        player.stage.current = 6;
        stageUpdate(false);
    }
    awardMilestone(1, 5);
};

/** Returns true for Auto, only if reset happened */
const nucleationResetCheck = (auto = false): boolean => {
    if (player.upgrades[6][0] !== 1) { return false; }
    assignResetInformation.newFluid();
    if (auto) {
        if (player.strangeness[6][3] < 4) { return false; }
        if (global.dischargeInfo.energyStage[6] <= player.darkness.energy) {
            effectsCache.fluid = calculateEffects.darkFluid();
            const post = calculateEffects.darkFluid(true);
            if ((post / effectsCache.fluid) * (calculateEffects.effectiveDarkEnergy(post) / calculateEffects.effectiveDarkEnergy()) ** (player.researchesExtra[6][2] / 32) < player.darkness.input) { return false; }
        }
        nucleationReset();
        return true;
    }
    return global.dischargeInfo.energyStage[6] > player.darkness.energy || global.inflationInfo.newFluid > 0;
};
export const nucleationResetUser = async() => {
    if (global.offline.active || !nucleationResetCheck()) { return; }

    if (player.toggles.confirm[7] !== 'None') {
        const array = [];
        const post = calculateEffects.darkFluid(true);
        if (player.darkness.energy >= global.dischargeInfo.energyStage[6] && (post / effectsCache.fluid) * (calculateEffects.effectiveDarkEnergy(post) / calculateEffects.effectiveDarkEnergy()) ** (player.researchesExtra[6][2] / 32) < 1.2) {
            array.push(`boost from doing it is below ${format(1.2)}x`);
        }
        if (player.stage.active !== 6) {
            array.push("current active Stage isn't Abyss");
        }
        if (array.length > 0) {
            if (!await Confirm(`Prevented Nucleation because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!nucleationResetCheck()) { return Notify('Nucleation canceled, requirements are no longer met'); }
        }
    }

    nucleationReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Nucleation reset'; }
};

const nucleationReset = () => {
    player.darkness.fluid += global.inflationInfo.newFluid;
    addIntoLog(`Nucleation reset, Dark fluid is at ${format(player.darkness.fluid, { padding: true })}`);
    reset('collapse', player.challenges.active === 0 ? [1, 2, 3, 4, 5, 6] : [6]);
};

const endResetCheck = (): boolean => player.darkness.energy >= 1000;
export const endResetUser = async() => {
    if (global.offline.active || !endResetCheck()) { return; }

    if (player.toggles.confirm[6] !== 'None') {
        if ((player.inflation.ends[0] === 0 || player.inflation.ends[1] <= player.verses[0].true) && player.inflation.vacuum && calculateVerseCost(0) <= calculateEffects.mergeScore()) {
            if (!await Confirm('Prevented End reset because can create an Universe\nReset anyway?')) { return; }
            if (!endResetCheck()) { return Notify('End reset canceled, requirements are no longer met'); }
        }
    }

    endReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused End reset'; }
};

const endReset = () => {
    if (player.stage.active < 6) { setActiveStage(1); }
    const resets = player.inflation.ends;
    const realTime = player.time.end;
    const selfMade = player.verses[0].true;
    const income = player.verses[0].current;
    player.cosmon[1].current += income;
    player.cosmon[1].total += income;
    resets[0]++;
    if (selfMade < resets[1]) { resets[1] = selfMade; }
    if (selfMade > resets[2]) { resets[2] = selfMade; }
    player.time.export[1] = 0;
    player.time.export[2] = 0;
    player.challenges.active = null;
    player.clone = {};
    const state = player.challenges.stability >= 3;
    player.inflation.vacuum = state;
    if (!state) { prepareVacuum(false); }
    resetVacuum(2);
    addIntoLog(`End reset, new Cosmons are ${format(player.cosmon[1].current, { padding: 'exponent' })}`);

    const history = player.history.end;
    const storage = global.historyStorage.end;
    storage.unshift([realTime, income]);
    if (storage.length > 100) { storage.length = 100; }
    if (income / realTime > history.best[1] / history.best[0]) {
        history.best = [realTime, income];
    }
};

export const assignMilestoneInformation = (index: number, stageIndex: number) => {
    const pointer = global.milestonesInfo[stageIndex];
    const level = player.milestones[stageIndex][index];
    if (player.inflation.vacuum) {
        if (stageIndex === 1) {
            if (index === 0) {
                pointer.need[0].setValue(1e24).power(level).multiply(1e24);
                pointer.reward[0] = 1.05 ** level;
            } else if (index === 1) {
                pointer.need[1].setValue(24000 + 24000 * level);
                pointer.reward[1] = 1.03 ** level;
            }
        } else if (stageIndex === 2) {
            if (index === 0) {
                pointer.need[0].setValue(1e1).power(level).multiply(1e1);
                pointer.reward[0] = 1.12 ** level;
            } else if (index === 1) {
                pointer.need[1].setValue(1e3).power(level).multiply(1e3);
                pointer.reward[1] = 1.08 ** level;
            }
        } else if (stageIndex === 3) {
            if (index === 0) {
                pointer.need[0].setValue(1e-12 * 1e4 ** level);
                pointer.reward[0] = 1.08 ** level;
            } else if (index === 1) {
                pointer.need[1].setValue(8 + 8 * level);
                pointer.reward[1] = level / 4;
            }
        } else if (stageIndex === 4) {
            if (index === 0) {
                pointer.need[0].setValue(1e6).power(level).multiply(1e6);
                pointer.reward[0] = 1.06 ** level;
            } else if (index === 1) {
                pointer.need[1].setValue(28 + 28 * level);
                pointer.reward[1] = 1.01 ** level;
            }
        } else if (stageIndex === 5) {
            if (index === 0) {
                pointer.need[0].setValue(1e1).power(level).multiply(1e1);
                pointer.reward[0] = 1.04 ** level;
            } else if (index === 1) {
                pointer.need[1].setValue(1 + level);
                pointer.reward[1] = level / 100;
            }
        }
    } else {
        let time = 0;
        if (player.challenges.active !== 1) {
            const percentage = level / (pointer.scaling[index].length - 1);
            if (stageIndex === 1) {
                time = 14400 / (percentage * (index === 1 ? 11 : 3) + 1) ** percentage;
            } else if (stageIndex === 2) {
                time = 28800 / (percentage * (index === 1 ? 23 : 7) + 1) ** percentage;
            } else if (stageIndex === 3) {
                time = 43200 / (percentage * (index === 1 ? 35 : 11) + 1) ** percentage;
            } else if (stageIndex === 4) {
                time = 57600 / (percentage * (index === 1 ? 47 : 15) + 1) ** percentage;
            } else if (stageIndex === 5) {
                time = index === 0 ? (3600 / (percentage * 2 + 1)) : 1200;
            }
            if (player.tree[1][2] < 1 && player.tree[0][0] === 1) { time /= 4; }
        }
        pointer.reward[index] = time;
        pointer.need[index].setValue(pointer.scaling[index][level]);
    }
};

const awardMilestone = (index: number, stageIndex: number) => {
    if (!milestoneCheck(index, stageIndex)) { return; }

    player.milestones[stageIndex][index]++;
    assignMilestoneInformation(index, stageIndex);

    const name = global.milestonesInfo[stageIndex].name[index];
    const maxed = !player.inflation.vacuum && player.milestones[stageIndex][index] >= global.milestonesInfo[stageIndex].scaling[index].length;
    addIntoLog(`Milestone "${name}" new tier completed${maxed ? ', Maxed' : ''}`);
    Notify(`Milestone '${name}' new tier completed${maxed ? ', Maxed' : ''}`);
    if (!player.inflation.vacuum) {
        player.strange[0].current++;
        player.strange[0].total++;
        assignBuildingsProduction.strange0();
        if (maxed && index === 0) { calculateMaxLevel(6, stageIndex, 'strangeness', true); }
    } else if (stageIndex === 3 && index === 1) {
        global.accretionInfo.effective = calculateEffects.effectiveRank();
        global.dischargeInfo.total = calculateEffects.effectiveGoals();
        calculateMaxLevel(0, 3, 'researchesExtra', true);
        calculateMaxLevel(0, 4, 'researches', true);
    }
    awardMilestone(index, stageIndex);
};

/** Also updates related information */
export const toggleSupervoid = (change = false) => {
    const info = global.challengesInfo[0];
    if (change) {
        if (player.challenges.active === 0) { return Notify(`Can't be toggled while inside the '${info.name}'`); }
        player.challenges.super = !player.challenges.super && (player.stage.true >= 8 || (player.stage.true === 7 && player.event));
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
    if (change) {
        assignChallengeInformation(0);
        numbersUpdate();
    }
};

export const assignChallengeInformation = (index: number) => {
    let time = (index === 1 ? 7200 : //[1]
        player.challenges.super ? 1200 : 3600) / (6 / (6 - player.tree[0][5])); //[0]
    if (player.tree[1][2] < 1 && player.tree[0][0] === 1) { time /= 4; }
    global.challengesInfo[index].time = time;
};

const awardVoidReward = (index: number): void => {
    const challenges = player.challenges;
    if (challenges.active !== 0) { return; }
    const info = global.challengesInfo[0];

    let progress = 1;
    if (index === 1) {
        progress += player.researchesExtra[1][2];
    } else if (index === 2) {
        if (player.vaporization.clouds > 1e4) { progress++; }
        if (player.vaporization.clouds > 1e12 && (player.tree[1][5] >= 2 || player.accretion.rank <= 1)) { progress++; }
    } else if (index === 3) {
        progress = Math.min(player.accretion.rank - 1, 6);
    } else if (index === 4) {
        if (player.collapse.stars[0] >= 1) { progress++; }
        if (player.collapse.stars[1] >= 1) { progress++; }
        if (player.collapse.stars[2] >= 1) { progress++; }
        if (player.elements[26] >= 1 && player.strangeness[5][3] >= 1) { progress++; }
    } else if (index === 5) {
        if (player.merge.resets >= 1) { progress++; }
        if (player.merge.rewards[0] >= 1) { progress++; }
    }

    const pointer = challenges.void;
    if (pointer[index] < progress && player.time.stage <= info.time) {
        pointer[index]++;
        const excess = progress !== pointer[index];
        if (excess) { progress = pointer[index]; }
        if (challenges.voidCheck[index] < progress) { challenges.voidCheck[index] = progress; }
        const totalProgress = pointer[1] + pointer[2] + pointer[3] + pointer[4] + pointer[5];
        player.strange[0].current += totalProgress;
        player.strange[0].total += totalProgress;
        assignBuildingsProduction.strange0();

        addIntoLog(`Completed new Void reward, new total is ${totalProgress}`);
        Notify(`New Void reward unlocked:\n${info.rewardText[0][index][progress - 1]}`);
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

    if (!challenges.super) { return; }
    const pointer2 = challenges.supervoidMax;
    if (pointer2[index] < progress && player.time.vacuum <= info.time) {
        pointer2[index]++;
        const excess = progress !== pointer2[index];
        if (excess) { progress = pointer2[index]; }
        if (challenges.supervoid[index] < progress) {
            challenges.supervoid[index]++;
            player.cosmon[0].current++;
            player.cosmon[0].total++;
            Notify(`New Supervoid reward unlocked:\n${info.rewardText[1][index][progress - 1]}`);
        } else { Notify("Strength of the 'Instability' increased"); }
        global.inflationInfo.totalSuper = pointer2[1] + pointer2[2] + pointer2[3] + pointer2[4] + pointer2[5];

        addIntoLog(`Completed new Supervoid reward, new total is ${global.inflationInfo.totalSuper}`);
        if (excess) { return awardVoidReward(index); }
    }
};
const awardStabilityReward = (): boolean => {
    const challenges = player.challenges;
    if (challenges.active !== 1) { return false; }

    const info = global.challengesInfo[1];
    if (player.time.vacuum <= info.time) {
        challenges.stability++;
        player.cosmon[0].current++;
        player.cosmon[0].total++;

        const rewardText = info.rewardText[challenges.stability - 1];
        addIntoLog(`New Vacuum stability completion, new value is ${challenges.stability}`);
        Notify(`New Vacuum stability completion${rewardText !== undefined ? ` and a new reward:\n${rewardText}` : ''}`);

        if (player.stage.active < 6) { setActiveStage(1); }
        resetVacuum();
    }
    return true;
};

/** Null means exit if possible, nothing if isn't. Entering same challenge will exit out of it */
export const enterExitChallengeUser = (index: number | null) => {
    if (global.offline.active) { return; }
    const old = player.challenges.active;
    if (old === index || index === null) {
        if (old === null) { return; }

        challengeReset();
        addIntoLog(`Exited the ${global.challengesInfo[old].name}`);
        Notify(`Exited the ${global.challengesInfo[old].name}`);
    } else {
        if (index === 0) {
            if (!player.challenges.super && !player.inflation.vacuum) { return; }
        } else if (index === 1) {
            if (player.stage.true < 8 && player.verses[0].true < 6) { return; }
        } else { return; }

        challengeReset(index);
        addIntoLog(`Entered the ${global.challengesInfo[index].name}`);
        Notify(`Entered the ${global.challengesInfo[index].name}`);
    }
};
const exitChallengeAuto = () => {
    const old = player.challenges.active;
    if (old === null) { return; }
    const info = global.challengesInfo[old];
    if (player.time[info.resetType] <= info.time || player.strangeness[5][6] < (player.inflation.vacuum ? 1 : 2)) { return; }

    challengeReset();
    addIntoLog(`Exited the ${info.name}`);
    Notify(`Automatically exited the ${info.name}`);
};
/** Automatically exits out of challenge and then enters new one if specified */
const challengeReset = (next = null as number | null) => {
    const challenges = player.challenges;
    if (challenges.active !== null) {
        if (challenges.active === 0) {
            if (challenges.super) {
                assignResetInformation.supervoid(false);
            } else if (stageResetCheck(5)) { stageResetReward(5); }
        }
        challenges.active = null;
        if (player.stage.active < 6) { setActiveStage(Math.min(player.clone.stage.current, (player.clone.depth !== 'stage' ? player.clone : player).strangeness[5][3] >= 1 ? 5 : 4)); }
        const currentState = player.clone.inflation?.vacuum as boolean | undefined;
        if (currentState !== undefined && currentState !== player.inflation.vacuum) {
            player.inflation.vacuum = currentState;
            prepareVacuum(currentState);
        }
        loadFromClone();
    }

    if (next !== null) {
        challenges.active = next;
        const resetType = global.challengesInfo[next].resetType;
        cloneBeforeReset(resetType);
        if (resetType === 'vacuum') {
            if (player.stage.active < 6) { setActiveStage(1); }
            const requiredState = next !== 1;
            if (player.inflation.vacuum !== requiredState) {
                player.inflation.vacuum = requiredState;
                prepareVacuum(requiredState);
            }
            if (next === 0) { assignResetInformation.supervoid(true); }
            resetVacuum();
        } else {
            stageFullReset(true);
        }
    }
};
