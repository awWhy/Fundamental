import { allowedToEnter, checkBuilding, checkUpgrade, checkVerse, milestoneCheck, stageResetType } from './Check';
import Overlimit, { compareFunc } from './Limit';
import { cloneArray, getId, loadoutsFinal, playerStart, simulateOffline } from './Main';
import { effectsCache, global, player, prepareChallenge, prepareVacuum } from './Player';
import { cloneBeforeReset, loadFromClone, reset, resetStage, resetVacuum } from './Reset';
import { Confirm, Notify, enterQuantum, enterUltravoid, errorNotify, globalSave, specialHTML } from './Special';
import type { calculateEffectsType } from './Types';
import { format, numbersUpdate, stageUpdate, switchTab, visualUpdate } from './Update';

/** Normal game tick, everything calculated in milliseconds */
export const timeUpdate = (tick: number, timeWarp: null | number = null) => {
    const { time, ASR } = player;
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
        if (timeWarp > tick * 600) { return void simulateOffline(timeWarp, player.toggles.normal[4] || (timeWarp < 600_000 && !globalSave.developerMode)); }
        timeWarp -= tick;
        time.online += tick;
    }
    const { auto, buildings: autoBuy } = player.toggles;
    const maxActive = global.buildingsInfo.maxActive;
    const activeAll = global.stageInfo.activeAll;
    const universes = player.verses[0];

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
    endResetCheck(true);
    if (player.inflation.vacuum) {
        stageResetCheck(5, trueSeconds);
    } else {
        if (activeAll.includes(4)) { stageResetCheck(5, trueSeconds); }
        if (activeAll.includes(3)) { stageResetCheck(3, 0); }
        if (activeAll.includes(2)) { stageResetCheck(2, 0); }
        if (activeAll.includes(1)) { stageResetCheck(1, 0); }
        if (player.challenges.active === 1 && time.stage > 600 && stageResetCheck(player.stage.current)) {
            stageResetReward(player.stage.current);
            Notify('Stage reset has been forced');
        }
    }
    const vacuum = player.inflation.vacuum;

    if (auto[11] && universes.current >= 13) { autoStrangeness(); }
    assignBuildingsProduction.globalCache();
    if (activeAll.includes(6)) {
        if (universes.lowest[0] <= 6) {
            if (universes.lowest[0] <= 4) { autoUpgrades(6); }
            autoResearches('researches', 6);
            if (universes.lowest[0] <= 2) { autoResearches('researchesExtra', 6); }
        }
        for (let i = maxActive[6] - 1; i >= 1; i--) {
            if (autoBuy[6][i] && ASR[6] >= i) { buyBuilding(i, 6, 0, true); }
        }
        if (auto[10]) { nucleationResetCheck(true); }
        assignBuildingsProduction.stage6Cache();
        gainBuildings(0, 6, passedSeconds); //Dark matter
    }
    if (activeAll.includes(4)) {
        if (auto[8]) { autoElements(); }
        if (activeAll.includes(5)) {
            if (player.strangeness[5][3] >= 1 || universes.current >= 3) {
                autoUpgrades(5);
                autoResearches('researches', 5);
                autoResearches('researchesExtra', 5);
            }
            for (let i = maxActive[5] - 1; i >= 1; i--) {
                if (autoBuy[5][i] && ASR[5] >= i) { buyBuilding(i, 5, 0, true); }
            }
            assignBuildingsProduction.stage5Cache();
            gainBuildings(0, 5, passedSeconds); //Brown dwarfs
            const research = player.researches[5][0];
            if (research >= 1) { gainBuildings(1, 5, passedSeconds); } //Main sequence
            if (research >= 2) { gainBuildings(2, 5, passedSeconds); } //Red supergiants
            if (research >= 3) { gainBuildings(3, 5, passedSeconds); } //Blue hypergiants
            if (research >= 4 && player.challenges.active !== 0) { gainBuildings(4, 5, passedSeconds); } //Quasi-stars
        } else { assignBuildingsProduction.stage5Cache(); }
        autoUpgrades(4);
        autoResearches('researches', 4);
        autoResearches('researchesExtra', 4);
        assignBuildingsProduction.stage4Cache();
        for (let i = maxActive[4] - 1; i >= 1; i--) {
            if (autoBuy[4][i] && ASR[4] >= i) { buyBuilding(i, 4, 0, true); }
            gainBuildings(i - 1, 4, passedSeconds); //Stardust
        }
        assignBuildingsProduction.S4Levels();
        awardMilestone(0, 5);
        awardMilestone(0, 4);
        const failed = !collapseResetCheck(true);
        awardMilestone(1, 4); //Must be before Merge
        if ((vacuum || player.tree[0][5] >= 1) && failed) { mergeResetCheck(true); }
    } else if (vacuum) {
        effectsCache.star[2] = 1; //Lazy fix
        assignResetInformation.solarHardcap();
    }
    if (activeAll.includes(3)) {
        autoUpgrades(3);
        autoResearches('researches', 3);
        autoResearches('researchesExtra', 3);
        rankResetCheck(true);
        assignBuildingsProduction.stage3Cache();
        global.accretionInfo.disableAuto = vacuum && player.researchesExtra[3][5] < 1 && player.strangeness[1][8] >= 2 && assignBuildingsProduction.S3Build1(true).moreOrEqual(calculateEffects.dustHardcap());
        for (let i = 1; i < maxActive[3]; i++) {
            if (autoBuy[3][i] && ASR[3] >= i) { buyBuilding(i, 3, 0, true); }
        }
        gainBuildings(2, 3, passedSeconds); //Planetesimals
        gainBuildings(1, 3, passedSeconds); //Cosmic dust
        if (!vacuum) { gainBuildings(0, 3, passedSeconds); } //Mass
    }
    if (activeAll.includes(2)) {
        autoUpgrades(2);
        autoResearches('researches', 2);
        autoResearches('researchesExtra', 2);
        vaporizationResetCheck(trueSeconds);
        for (let i = maxActive[2] - 1; i >= 1; i--) {
            if (autoBuy[2][i] && ASR[2] >= i) { buyBuilding(i, 2, 0, true); }
        }
        gainBuildings(1, 2, passedSeconds); //Drops
        if (!vacuum) { gainBuildings(0, 2, passedSeconds); } //Moles
        awardMilestone(1, 2);
        awardMilestone(0, 2);
    }
    if (activeAll.includes(1)) {
        autoUpgrades(1);
        autoResearches('researches', 1);
        autoResearches('researchesExtra', 1);
        dischargeResetCheck(true);
        assignBuildingsProduction.stage1Cache();
        gainBuildings(5, 1, passedSeconds); //Molecules
        for (let i = maxActive[1] - 1; i >= 1; i--) {
            if (autoBuy[1][i] && ASR[1] >= i) { buyBuilding(i, 1, 0, true); }
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
    dischargeCost: (scaling = global.dischargeInfo.scaling) => {
        let next = scaling ** player.discharge.current;
        if (player.inflation.vacuum && player.strangeness[5][10] >= 1) { next /= global.mergeInfo.galaxies ** 2 + 1; }
        if (player.strangeness[1][6] >= 2) { next /= global.strangeInfo.stageBoost[1]; }
        return next;
    },
    dischargeBase: (research = player.researches[1][4]) => {
        let base = (4 + research) / 2;
        if (player.challenges.active === 0) { base **= 0.5; }
        if (player.inflation.vacuum) { base += player.tree[1][4] / 10; }
        return base;
    },
    S1Upgrade6: () => 0.1 + 0.03 * player.researches[1][0],
    S1Upgrade7: (preons = false) => {
        let base = 2 + player.researches[1][1];
        const selfBoost = (base + 100) / 100;
        if (!preons || player.buildings[1][1].true >= 1001) { return selfBoost; }

        base = base * 0.016 + 1; //Formula is '(selfPreons * step ** ((true - 1) / 2)) ** true'; Step is '(selfBoost / selfPreons) ** (1 / 500)'
        return (selfBoost / base) ** ((player.buildings[1][1].true - 1) / 1000) * base;
    },
    S1Upgrade9: () => {
        let effect = calculateEffects.effectiveEnergy();
        if (player.upgrades[1][10] !== 1) { effect **= 0.5; }
        return effect;
    },
    S1Research2: (level = player.strangeness[1][1]) => 20 + (level * (player.inflation.vacuum ? (player.tree[1][5] >= 3 ? 2 : 1.5) : 1)),
    S1Research5: () => {
        const discharges = global.dischargeInfo.total;
        if (!player.inflation.vacuum) { return discharges > 5 ? discharges + 15 : discharges * 4; }
        return discharges > 7 ? discharges + 14 : discharges * 3;
    },
    S1Extra1: (level = player.researchesExtra[1][1]) => level >= 4 ? 1.1 : level >= 3 ? 1.2 : 2 - 0.3 * level,
    S1Extra3: (level = player.researchesExtra[1][3]) => level / 20,
    S1Extra4: (research = player.researchesExtra[1][5]) => (global.dischargeInfo.base + calculateEffects.effectiveEnergy() ** 0.1) * (research + 1) / 100 + 1,
    preonsHardcap: (laterPreons = calculateEffects.effectiveEnergy() ** calculateEffects.S1Extra3()) => new Overlimit(assignBuildingsProduction.S3Build1()).multiply(1e14 * laterPreons * effectsCache.S1SolarDelay),
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
        return (player.challenges.active === 0 && player.toggles.supervoid ? 1.01 : 1.02) ** ((puddles.current.toNumber() - maxTrue) ** 0.7 + maxTrue);
    },
    S2Upgrade2: () => {
        let effect = 1e10 / (player.inflation.vacuum ? 2.5 : 2) ** player.strangeness[2][3];
        if (player.inflation.vacuum && player.tree[0][4] >= 1) { effect /= global.milestonesInfo[2].reward[1]; }
        if (player.strangeness[2][6] >= 2) { effect /= global.strangeInfo.stageBoost[2]; }
        return effect;
    },
    S2Upgrade3_power: (research = player.researches[2][2]) => (2 + research) / 200,
    S2Upgrade3: (power = calculateEffects.S2Upgrade3_power()) => Math.max(player.buildings[2][0].current.toNumber(), 1) ** power,
    S2Upgrade4_power: (research = player.researches[2][3]) => (2 + research) / 200,
    S2Upgrade4: (power = calculateEffects.S2Upgrade4_power()) => Math.max(player.buildings[2][1].current.toNumber(), 1) ** power,
    S2Extra1: (level, post = false) => { //+^0.05 per level; Drops up to +^(0.05 / 3) after softcap
        if (level <= 0) { return 1; }
        let effect = player.vaporization.clouds;
        if (post) { effect += global.vaporizationInfo.get; }
        return Math.max(effect ** (level / 60) * Math.min(effect, 1e6) ** (level / 30), 1);
    },
    S2Extra2: (rain, level = player.researchesExtra[2][2]) => level >= 1 ? (rain + 31) / 32 : 1,
    submersion: () => {
        const drops = player.buildings[2][1].current.toNumber() + 1;
        return Math.log2(drops ** 0.6 / Math.min(drops, 1e10) ** 0.4 + 1); //^0.2 before softcap, ^0.6 after
    },
    rankCost: () => {
        const rank = player.accretion.rank;
        if (rank < 7) { return global.accretionInfo.rankCost[rank]; }
        const requirement = new Overlimit(1e24).power(rank - 6).multiply(global.accretionInfo.rankCost[6]);
        if (player.strangeness[3][7] >= 2) { requirement.divide(global.strangeInfo.stageBoost[3]); }
        return requirement;
    },
    effectiveRank: () => {
        let rank = player.challenges.active === 0 && player.toggles.supervoid ? (player.accretion.rank < 5 ? 1 : 0) : player.accretion.rank;
        if (player.inflation.vacuum) {
            if (player.researchesExtra[1][2] < 1) { return 0; }
            if (player.tree[0][4] >= 1) { rank += global.milestonesInfo[3].reward[1]; }
        }
        return rank;
    },
    S3Upgrade0: () => (101 + player.researches[3][1]) / 100,
    S3Upgrade1_power: (research = player.researchesExtra[3][3]) => (11 + research) / 100,
    S3Upgrade1: (power = calculateEffects.S3Upgrade1_power()) => Math.max((player.buildings[3][1].current.toNumber() * (player.buildings[3][1].true + 1)) ** power, 1),
    S3Upgrade3: () => (204 + player.researches[3][4]) / 200, //1.02 + 0.005
    S3Upgrade13: () => ((calculateEffects.S3Research6() - 1) / 2e5) ** 0.8 + 1,
    S3Research6: (level = player.researches[3][6]) => { //+^0.025 per level; Drops up to +^(0.025 / 3) after softcap
        if (level === 0) { return 1; }
        const mass = new Overlimit(player.buildings[3][0].current);
        return Math.max(Math.min(mass.toNumber(), 1e21) ** (level / 60) * mass.power(level / 120).toNumber(), 1);
    },
    S3Extra1: (level = player.researchesExtra[3][1]) => 1 + 0.11 * level,
    S3Extra4: (level = player.researchesExtra[3][4]) => level > 0 ? 8 ** ((global.accretionInfo.effective + level) / 8) : 1,
    dustDelay: () => {
        let delay = effectsCache.S3SolarDelay * (1.4 ** player.strangeness[3][8]);
        if (player.strangeness[5][10] >= 3) { delay *= global.mergeInfo.galaxies / 100 + 1; }
        return delay;
    },
    dustHardcap: () => (player.accretion.rank >= 5 ? 1e48 : 8e46) * calculateEffects.dustDelay(),
    mass: (post = false) => {
        let effect = player.collapse.mass;
        if (post && global.collapseInfo.newMass > effect) { effect = global.collapseInfo.newMass; }

        if (effect > 1) {
            if (player.elements[21] >= 1) { effect **= 1.1; }
            if (player.challenges.active === 0) { effect **= 0.2; }
        }
        return effect;
    },
    star: [
        (post = false) => {
            let effect = player.collapse.stars[0];
            if (post) { effect += global.collapseInfo.starCheck[0]; }
            if (player.elements[28] >= 1) { effect *= 1.5; }
            effect += 1;

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
            if (post) { blackHoles += global.collapseInfo.starCheck[2]; }
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
            massGain *= effectsCache.star[2];
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
            level >= 11 ? (level + 92) / 16 :
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
        if (mass > 1 && player.elements[23] >= 1) { effect *= mass ** 0.1; }
        return effect;
    },
    S4Extra1: () => (10 + player.researches[4][1]) / 10,
    mergeRequirement: () => 22 + (player.challenges.active === 1 ? player.challenges.stability : global.inflationInfo.trueUniverses),
    mergeMaxResets: (safe = false) => {
        if (player.upgrades[5][3] !== 1) { return 0; }
        let max = 2 + player.researchesExtra[5][3];
        if (player.elements[30] >= 1) { max += player.collapse.highest - 29; }
        if (safe) { return max; }
        if (player.tree[0][5] >= 1) { max += calculateEffects.trueUniverses(); }
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
    groupsCost: () => 50 - calculateEffects.S5Extra4(),
    mergeScore: () => global.mergeInfo.galaxies + (player.merge.rewards[0] * 2) + (player.merge.rewards[1] * 4),
    S5Upgrade0: () => 3 * ((player.inflation.vacuum ? 1.6 : 1.8) ** player.strangeness[5][1]),
    S5Upgrade1: () => 2 * ((player.inflation.vacuum ? 1.6 : 1.8) ** player.strangeness[5][1]),
    S5Upgrade2: (post = false, level = player.upgrades[5][2]) => {
        if (level < 1) { return 0; }
        let effect = player.collapse.mass;
        if (post && global.collapseInfo.newMass > effect) { effect = global.collapseInfo.newMass; }

        return Math.log10(Math.max(effect / 1e4, 10)) / (player.inflation.vacuum ? 4 : 2);
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
    darkSoftcap: (delayOnly = false) => {
        const delay = global.buildingsInfo.producing[6][1] * (1 + player.researches[6][1]) * (calculateEffects.effectiveDarkEnergy() ** (player.researchesExtra[6][2] / 5));
        return delayOnly ? delay : delay * 1e6;
    },
    effectiveDarkEnergy: (fluid = effectsCache.fluid) => player.darkness.energy * fluid + (fluid - 1) * player.researchesExtra[6][4] / 4 + 1,
    darkFluid: (post = false) => {
        let effect = player.darkness.fluid + 1;
        if (post) { effect += global.inflationInfo.newFluid; }
        return effect;
    },
    S6Upgrade0: () => (4 + player.researchesExtra[6][4]) / 20,
    S2Strange9: (unlocked = player.strangeness[2][9] >= 1) => unlocked && player.tree[1][5] >= 1 ?
        (player.vaporization.clouds + 1) ** 0.01 :
        Math.log10(player.vaporization.clouds + 1) / 80 + 1,
    trueUniversesAll: () => {
        let total = player.verses[0].true;
        for (let i = 0; i < player.verses[0].other.length; i++) {
            total += player.verses[0].other[i];
        }
        return total;
    },
    trueUniverses: () => {
        if (!player.inflation.vacuum) { return player.verses[0].other[2]; }
        const challenge = player.challenges.active;
        return challenge === null ? player.verses[0].true : player.verses[0].other[challenge === 0 && !player.toggles.supervoid ? 0 : 1];
    },
    T0Inflation0: () => player.challenges.stability >= 1 ? 2 : Math.max(2 ** (1 - player.time.stage / 3600), 1),
    TOInflation1_softcap: () => (player.challenges.active === 0 && player.toggles.supervoid ? 1 : 1e6) * ((1 + player.researchesExtra[6][1]) ** 2),
    T0Inflation1: () => {
        const mass = player.buildings[6][0].current.toNumber() + 1;
        return mass ** 0.01 * Math.min(mass, calculateEffects.TOInflation1_softcap()) ** 0.03;
    },
    T0Inflation3: () => (10 + global.inflationInfo.totalSuper) / 10,
    strangeGain: (interstellar, quarks = true) => {
        let base = player.inflation.vacuum ?
            (!quarks ? 0 : player.strangeness[5][3] >= 1 ? 5 : 4) :
            (player.milestones[1][0] >= 6 ? 2 : 1);
        if (interstellar) { base = (base + effectsCache.element26) * effectsCache.strangeMiltipliers; }
        if (quarks) {
            base *= (1.4 ** player.strangeness[5][2]) * (1.4 ** player.tree[0][2]) * (1.2 ** player.tree[1][1]);
            if (player.challenges.active === 1) {
                const completions = player.challenges.stability;
                base /= 2 ** Math.max(player.stage.resets + completions - 7, 0) * 2 ** completions;
                if (!interstellar) { base /= 2 ** completions * 4; }
            }
        } else { base *= (1.4 ** player.strangeness[6][1]) * (1.4 ** player.tree[1][3]); }
        return base * global.strangeInfo.strangeletsInfo[1] * effectsCache.T0Inflation3;
    },
    cosmonGain: () => {
        const trueVerses = global.inflationInfo.trueUniverses;
        let base = player.darkness.energy >= 1000 ? player.verses[0].current : trueVerses;
        if (player.inflation.ends[1] >= 1) { base += (trueVerses - 1) * trueVerses / 10; } //10 is equal to 2 / step
        if (player.clone.inflation?.vacuum as boolean ?? player.inflation.vacuum) { base++; }
        return base * 1.4 ** player.tree[1][2];
    }
};

export const assignBuildingsProduction = {
    globalSpeed: (): number => {
        const tree = player.tree;
        const challenge = player.challenges.active;
        let speed = (1.1 ** player.researches[6][1]) * (1.4 ** player.strangeness[6][0]) * (calculateEffects.T0Inflation1() ** tree[0][1]) * effectsCache.T0Inflation3 * (1.4 ** tree[1][0]);
        if (player.researchesExtra[4][4] >= 1) { speed *= calculateEffects.star[2](); }
        if (tree[0][0] >= 1) { speed *= 2; }
        if (tree[0][0] >= 2 && challenge === null && (player.inflation.vacuum || player.challenges.stability >= 1 || tree[0][4] >= 1)) { speed *= calculateEffects.T0Inflation0(); }
        if (challenge !== null) {
            speed *= 1.1 ** Math.min(tree[0][2], player.challenges.stability) * 5 / (5 - tree[0][6]);
            if (challenge === 1) {
                speed /= 8 ** player.challenges.stability * 4;
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
    /** Preons, true vacuum only */
    S1Build1: (noHardcap = false): Overlimit => {
        const structure = player.buildings[1][1];

        const laterPreons = calculateEffects.effectiveEnergy() ** calculateEffects.S1Extra3();
        let multiplierList;
        let multiplier = 6e-4 * effectsCache.microworld * laterPreons;
        const preonsExcess = new Overlimit(structure.current).minus(structure.true);
        if (preonsExcess.moreThan(1)) {
            multiplierList = preonsExcess.power(0.11).plus(structure.true);
        } else { multiplierList = structure.current; }
        if (player.upgrades[1][7] === 1) {
            multiplier *= calculateEffects.S1Upgrade7(true) ** Math.min(structure.true, 1001);
        }

        if (noHardcap) { return new Overlimit(multiplier).multiply(multiplierList); }
        return global.buildingsInfo.producing[1][1].setValue(multiplier).multiply(multiplierList).min(calculateEffects.preonsHardcap(laterPreons));
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

        let multiplier = (vacuum ? 0.8 : 0.4) * effectsCache.microworld;
        if (player.upgrades[1][3] === 1) { multiplier *= vacuum ? 6 : 4; }
        return global.buildingsInfo.producing[1][index].setValue(effectsCache.S1Upgrade7).power(player.buildings[1][index].true).allMultiply(multiplier, player.buildings[1][index].current);
    },
    /** Molecules */
    S1Build5: (): Overlimit => {
        const index = player.inflation.vacuum ? 5 : 3;

        let multiplier = 0.2 * effectsCache.microworld;
        if (player.upgrades[1][4] === 1) { multiplier *= 4; }
        return global.buildingsInfo.producing[1][index].setValue(effectsCache.S1Upgrade7).power(player.buildings[1][index].true).allMultiply(multiplier, player.buildings[1][index].current);
    },
    /* Tritium */
    S1Build6: (): number => {
        let multiplier = assignBuildingsProduction.S1Build5().log(calculateEffects.S1Extra1()).toNumber();
        if (multiplier < 0) { multiplier = 0; }
        multiplier *= (calculateEffects.S1Research2() ** player.researches[1][2]) * (calculateEffects.S1Research5() ** player.researches[1][5]);
        if (player.upgrades[1][9] === 1) { multiplier *= calculateEffects.S1Upgrade9(); }
        if (player.inflation.vacuum) { multiplier *= assignBuildingsProduction.S2Build1(); }
        if (player.strangeness[1][6] >= 2) { multiplier *= global.strangeInfo.stageBoost[1]; }
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
        if (info.S2Research0 !== player.researches[2][0]) { info.S2Research0 = Math.min(player.researches[2][0], (totalDrops >= 10 ? logAny(totalDrops / 10, 1.366) + 1 : logAny(totalDrops * 0.0366 + 1, 1.366))); }
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
        multiplier *= (vacuum ? 2 : 8e-4) * ((player.challenges.active === 0 && player.toggles.supervoid ? 2 : 3) ** global.vaporizationInfo.S2Research0) * ((vacuum && player.tree[1][5] >= 3 ? 2.2 : 2) ** player.strangeness[2][0]);
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
        const flow = (player.tree[1][5] >= 3 ? 1.28 : 1.24) ** player.strangeness[2][7]; //True vacuum

        const inVoid = player.challenges.active === 0;
        const start = inVoid && player.toggles.supervoid ? 1 : 2;
        producings[6] = structures[6].true < 1 ? 1 : (player.upgrades[2][8] === 1 ? 1.1 : 1.08) ** structures[6].true * flow;
        producings[5] = Math.max(start * structures[5].current.toNumber() * calculateEffects.S2Extra2(rain) * flow, 1);
        producings[4] = Math.max(start * structures[4].current.toNumber() * flow, 1);
        producings[3] = Math.max(start * structures[3].current.toNumber() * flow, 1);
        if (visual) { return 0; }

        let multiplier = (inVoid ? 6e-4 : 4.8) * structures[2].current.toNumber() * calculateEffects.clouds() * producings[3] * producings[4] * producings[5] * producings[6] * effectsCache.S2Upgrade3 * effectsCache.S2Upgrade4 * ((inVoid && player.toggles.supervoid ? 1.4 : 2) ** global.vaporizationInfo.S2Research1) * rain * ((player.inflation.vacuum ? (player.tree[1][5] >= 3 ? 2 : 1.8) : 1.6) ** player.strangeness[2][1]);
        if (player.upgrades[2][1] === 1) { multiplier *= calculateEffects.S2Upgrade1(); }
        if (player.inflation.vacuum) {
            multiplier *= calculateEffects.S3Extra4();
            if (player.elements[1] >= 1) { multiplier *= 2; }
            if (player.tree[0][4] >= 1) { multiplier *= global.milestonesInfo[2].reward[0]; }
            if (player.strangeness[5][10] >= 2) { multiplier *= global.mergeInfo.galaxies + 1; }
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
        if (player.strangeness[3][7] >= 2 && player.buildings[3][4].true >= 1) { producings[4] *= global.strangeInfo.stageBoost[3]; }
        effectsCache.S3Strange3 = producings[4] ** (player.inflation.vacuum ? 0.1 : 0.2);
    },
    /** Cosmic dust and related softcap */
    S3Build1: (noHardcap = false): Overlimit => {
        const researchesS3 = player.researches[3];
        const upgradesS3 = player.upgrades[3];
        const vacuum = player.inflation.vacuum;

        let multiplier = (vacuum ? 2 : 8e-20) * (3 ** researchesS3[0]) * (2 ** researchesS3[3]) * (3 ** researchesS3[5]) * (1.11 ** player.researchesExtra[3][0]) * (calculateEffects.S3Extra1() ** global.accretionInfo.effective) * (1.8 ** player.strangeness[3][0]);
        if (vacuum) {
            multiplier *= calculateEffects.submersion();
            if (player.elements[4] >= 1) { multiplier *= 1.4; }
            if (player.elements[14] >= 1) { multiplier *= 1.4; }
            if (player.strangeness[5][10] >= 3) { multiplier *= global.mergeInfo.galaxies + 1; }
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
        const producing = (noHardcap ? new Overlimit(multiplier) : global.buildingsInfo.producing[3][1].setValue(multiplier)).multiply(player.buildings[3][1].current).power(global.accretionInfo.dustSoft);
        if (vacuum) {
            if (player.researchesExtra[3][5] >= 2) {
                producing.multiply(calculateEffects.dustDelay());
            } else if (!noHardcap && player.researchesExtra[3][5] < 1) {
                producing.min(calculateEffects.dustHardcap());
            }
            producing.max(1);
        }
        return producing;
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
        effectsCache.star[0] = calculateEffects.star[0]();
        effectsCache.star[1] = calculateEffects.star[1]();
        effectsCache.star[2] = calculateEffects.star[2]();

        let multiplier = calculateEffects.S4Research0() * calculateEffects.mass() * effectsCache.star[1] * calculateEffects.S4Research4() * (1.6 ** player.strangeness[4][0]);
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
        const S5Extra2Max = player.researchesExtra[5][2] + player.merge.rewards[1];
        if (global.mergeInfo.S5Extra2 !== S5Extra2Max) { global.mergeInfo.S5Extra2 = Math.min(S5Extra2Max, new Overlimit(player.buildings[4][0].total).divide('1e330').plus(1).log(1e30).toNumber()); }
    },
    /** Brown dwarfs */
    S4Build1: (): Overlimit => {
        const multiplierList = [player.buildings[4][1].current, calculateEffects.S4Shared()];
        let multiplier = 40 * effectsCache.interstellar;
        if (player.elements[1] >= 1) { multiplier *= 2; }
        if (player.elements[27] >= 1) { multiplier *= effectsCache.star[0]; }
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
        let multiplier = 1200 * effectsCache.interstellar * effectsCache.star[0] * (2 ** player.researches[4][3]);
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
        if (player.elements[33] >= 1) { multiplier *= effectsCache.star[0]; }
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
        return global.buildingsInfo.producing[4][5].setValue(2e11 * effectsCache.interstellar).allMultiply(player.buildings[4][5].current, calculateEffects.S4Shared(), global.buildingsInfo.producing[5][2]);
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
        if (player.strangeness[5][7] >= 2) { globalMult *= global.strangeInfo.stageBoost[5]; }
        if (vacuum && player.tree[0][4] >= 1) { globalMult *= global.milestonesInfo[5].reward[0]; }

        const min = 2 ** player.researches[5][1];
        let multiplier2 = 2 * min * globalMult;
        if (player.upgrades[5][1] === 1) { multiplier2 *= calculateEffects.S5Upgrade1(); }
        if (player.upgrades[5][5] === 1) { multiplier2 *= 1000 * moreStars; }
        if (vacuum && player.upgrades[3][13] === 1) { multiplier2 *= calculateEffects.S3Upgrade13(); }
        global.buildingsInfo.producing[5][2].setValue(multiplier2).allMultiply(player.buildings[5][2].current, production, calculateEffects.S5Research3() ** player.buildings[5][2].true).max(min);

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
    S6Build1: (): number => (global.buildingsInfo.producing[6][1] = (1 + player.buildings[6][1].true) * ((1 + player.researches[6][2] / 100) ** player.buildings[6][1].true)),
    verse0: (): number => {
        const first = 6 + player.researchesExtra[6][0];
        const self = global.inflationInfo.trueUniverses;
        let multiplier = self <= 0 ? 0 : self ** (self / 4);
        multiplier = Math.max(multiplier * (player.verses[0].current + 1) / (self + 1), multiplier + (player.verses[0].current - self) / 2) * effectsCache.fluid * (3 ** Math.min(player.researches[6][0], first)) * (calculateEffects.darkSoftcap(true) ** (player.researchesExtra[6][3] / 40));
        if (player.researches[6][0] > first) { multiplier *= 2 ** (player.researches[6][0] - first); }
        return multiplier;
    },
    /** Quarks */
    strange0: (iron = player.elements[26] >= 1) => {
        const vacuum = player.inflation.vacuum;
        const stageBoost = global.strangeInfo.stageBoost;
        const strangeQuarks = player.strange[0][player.verses[0].current >= 13 ? 'total' : 'current'] + 1;

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
    },
    trueDarkEnergy: (reset = false) => {
        global.dischargeInfo.energyType[6] = [0, 1];
        global.dischargeInfo.energyStage[6] = 0;
        const energyType = global.dischargeInfo.energyType[6];
        for (let i = 1; i < energyType.length; i++) {
            energyType[i] *= 1 + player.researches[6][3];
            if (!reset) { global.dischargeInfo.energyStage[6] += energyType[i] * player.buildings[6][i as 1].true; }
        }
    },
    newClouds: (): number => {
        const softcap = calculateEffects.cloudsGain();
        return (global.vaporizationInfo.get = (player.vaporization.clouds ** (1 / softcap) + player.buildings[2][1][player.researchesExtra[2][0] >= 1 || (player.inflation.vacuum && player.tree[1][5] >= 2) ? 'total' : 'current'].toNumber() / calculateEffects.S2Upgrade2()) ** softcap - player.vaporization.clouds);
    },
    maxRank: () => {
        global.accretionInfo.maxRank = player.inflation.vacuum ? (player.strangeness[3][9] >= 2 ? 1e15 : player.strangeness[3][9] >= 1 ? 7 : 6) : (player.progress.main >= 6 ? 5 : 4);
    },
    solarHardcap: () => {
        effectsCache.S3SolarDelay = calculateEffects.massGain();
        let effectS1 = effectsCache.star[2];
        if (player.elements[10] >= 1) { effectS1 *= 2; }
        if (player.researchesExtra[4][1] >= 1) { effectS1 *= calculateEffects.S4Extra1(); }
        effectsCache.S1SolarDelay = effectS1;

        global.collapseInfo.solarCap = 0.01235 * effectsCache.S3SolarDelay * effectS1;
        if (player.strangeness[5][7] >= 1) { global.collapseInfo.solarCap *= global.strangeInfo.stageBoost[5]; }
        if (player.tree[1][6] >= 3) { global.collapseInfo.solarCap *= 1.01 ** global.accretionInfo.effective; }
        if (player.strangeness[5][10] >= 4 && player.tree[1][7] >= 3) { global.collapseInfo.solarCap *= global.mergeInfo.galaxies / 1000 + 1; }
    },
    /** Doesn't assign, have to be after assignResetInformation.newMass() */
    timeUntil: (): number => {
        if (player.inflation.vacuum) {
            assignBuildingsProduction.stage3Cache();
            assignBuildingsProduction.stage1Cache();
            return new Overlimit(global.collapseInfo.solarCap / 8.96499278339628e-67).minus(player.buildings[1][0].current).allDivide(assignBuildingsProduction.S1Build1(), global.inflationInfo.globalSpeed).replaceNaN(Infinity).toNumber();
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
        starCheck[0] = building[2].trueTotal.moreThan(0) ? building[2].true + building[1].true * player.strangeness[4][3] / 10 : 0;
        starCheck[1] = building[3].true;
        starCheck[2] = building[4].true + (building[5].true * player.researches[4][5]);
        if (player.inflation.vacuum && player.tree[1][7] >= 1) {
            starCheck[0] += Math.min(starCheck[0], stars[0]) / 4;
            starCheck[1] += Math.min(starCheck[1], stars[1]) / 4;
            starCheck[2] += Math.min(starCheck[2], stars[2]) / 4;
        }
        starCheck[0] = Math.max(Math.floor(starCheck[0]) - stars[0], 0);
        starCheck[1] = Math.max(Math.floor(starCheck[1]) - stars[1], 0);
        starCheck[2] = Math.max(Math.floor(starCheck[2]) - stars[2], 0);
    },
    mergeReward: (reset = false) => {
        const rewardCheck = global.mergeInfo.checkReward;
        if (reset) {
            rewardCheck[0] = 0;
            rewardCheck[1] = 0;
            return;
        }
        const researchesExtra = player.researchesExtra[5];
        const requirement = calculateEffects.groupsCost();

        rewardCheck[0] = researchesExtra[1] >= 2 ?
            Math.floor(global.mergeInfo.galaxies / requirement) - player.merge.rewards[0] :
            researchesExtra[1] >= 1 ? Math.floor(player.buildings[5][3].true / requirement) - player.merge.claimed[0] : 0;
        rewardCheck[1] = researchesExtra[5] >= 2 ?
            Math.floor(global.mergeInfo.galaxies / 100) - player.merge.rewards[1] :
            researchesExtra[5] >= 1 ? Math.floor(player.buildings[5][3].true / 100) - player.merge.claimed[1] : 0;
    },
    newFluid: (): number => {
        const effective = player.darkness.fluid + 1;
        const soft = calculateEffects.S6Upgrade0();
        return (global.inflationInfo.newFluid = (Math.log2(Math.max(player.buildings[6][0].current.toNumber() / 1e8, 1)) + player.darkness.energy +
            effective ** (1 / soft)) ** soft - effective);
    },
    /** Interstellar only, also assigns related cache */
    quarksGain: () => {
        let multiplier = global.mergeInfo.galaxies + 1;
        if (player.inflation.vacuum) {
            multiplier *= calculateEffects.S5Extra2(player.researchesExtra[5][2] + player.merge.rewards[1]);
            if (player.strangeness[2][9] >= 1 || player.tree[1][5] >= 1) { multiplier *= calculateEffects.S2Strange9(); }
            if (player.tree[1][6] >= 4) { multiplier *= 1.02 ** calculateEffects.effectiveRank(); }
        }
        effectsCache.strangeMiltipliers = multiplier;

        effectsCache.element26 = calculateEffects.element26();
        global.strangeInfo.strange0Gain = player.progress.main >= 11 ? calculateEffects.strangeGain(true) : 1;
        global.strangeInfo.strange1Gain = player.strangeness[5][8] >= 1 && player.inflation.vacuum ? calculateEffects.strangeGain(true, false) : 0;
    }
};

export const buyBuilding = (index: number, stageIndex: number, howMany = player.toggles.shop.input, auto = false) => {
    if (!checkBuilding(index, stageIndex)) { return; }
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
            free = player.strangeness[1][8] >= 1 && (player.challenges.supervoid[3] >= 5 || player.researchesExtra[1][2] >= 1);
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
            } else if (player.strangeness[3][4] < 2 && player.challenges.supervoid[3] >= 5) {
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
        const divide = player.toggles.shop.wait[stageIndex];
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

        if (player.inflation.vacuum || stageIndex === 1 || stageIndex === 6) { addEnergy(afford, index, stageIndex); }
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
        global.mergeInfo.galaxies += afford;
        reset('galaxy', player.inflation.vacuum ? (player.tree[1][5] >= 4 ? [1, 3, 4, 5] : [1, 2, 3, 4, 5]) : [4, 5]);
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(1, 4, 'researches');
        calculateMaxLevel(2, 4, 'researches');
        calculateMaxLevel(5, 4, 'researches');
        awardVoidReward(5);
        awardMilestone(1, 5);
        if (!auto) {
            numbersUpdate();
            if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Galaxy reset'; }
        }
    }
};

/** Increase is how many new Structures have been gained */
export const addEnergy = (increase: number, index: number, stage: number) => {
    const info = global.dischargeInfo;

    const add = info.energyType[stage][index] * increase;
    info.energyStage[stage] += add;
    if (stage === 6) {
        if (player.upgrades[6][0] !== 1) { return; }
        player.darkness.energy += add;
        return;
    }
    info.energyTrue += add;
    player.discharge.energy += add;
};

export const calculateBuildingsCost = (index: number, stageIndex: number): Overlimit => {
    let increase = global.buildingsInfo.increaseStart[stageIndex][index];
    let firstCost = global.buildingsInfo.firstCost[stageIndex][index];
    if (stageIndex === 1) {
        increase -= effectsCache.S1Upgrade6;
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
            if (player.upgrades[3][11] === 1) { increase /= 2; }
        }
    } else if (stageIndex === 4) {
        if (player.elements[2] >= 1) { increase -= 0.1; }
        if (player.elements[8] >= 1) { increase -= 0.05; }
        firstCost /= 2 ** player.strangeness[4][1];
        if (player.researchesExtra[4][3] >= 1) { firstCost /= effectsCache.star[1]; }
        if (player.elements[13] >= 1) { firstCost /= 100; }
        if (index === 1) {
            if (player.strangeness[4][7] >= 2) { firstCost /= global.strangeInfo.stageBoost[4]; }
        } else if (player.challenges.active === 0 && player.toggles.supervoid) { firstCost *= 100; }
    } else if (stageIndex === 5) {
        if (index === 3) {
            if (player.elements[32] >= 1) { increase -= 0.01; }
            if (player.challenges.active === 0) {
                increase += 0.05;
            } else if (player.challenges.active === 1) {
                increase += 0.01;
            }
            if (player.elements[36] >= 1) { firstCost /= 1.21; }
        } else if (player.challenges.active === 0 && player.toggles.supervoid) {
            firstCost *= 100;
        }
    } else if (stageIndex === 6) {
        if (index === 1) {
            increase -= player.researches[6][2] / 20;
        }
    }

    global.buildingsInfo.increase[stageIndex][index] = increase;
    return new Overlimit(increase).power(player.buildings[stageIndex][index as 1].true).multiply(firstCost);
};

export const buyVerse = () => {
    if (!checkVerse() || calculateVerseCost() > calculateEffects.mergeScore()) { return; }
    const challenge = player.challenges.active;

    const verse = player.verses[0];
    if (!player.inflation.vacuum) {
        verse.other[2]++;
    } else if (challenge !== null) {
        if (player.toggles.supervoid) { return Notify('Not implemented'); }
        verse.other[0]++;
    } else { verse.true++; }
    verse.current++;
    verse.total++;

    global.inflationInfo.trueUniverses = calculateEffects.trueUniversesAll();
    const income = global.inflationInfo.trueUniverses;
    player.cosmon[0].current += income;
    player.cosmon[0].total += income;
    player.inflation.resets++;
    player.time.export[1] = 0;
    player.time.export[2] = 0;
    if (player.inflation.vacuum) {
        player.inflation.vacuum = false;
        prepareVacuum(false);
    }
    if (challenge !== null) {
        player.challenges.active = null;
        player.clone = {};
        prepareChallenge();
    }
    if ((player.stage.active !== 1 && player.toggles.normal[0]) || player.stage.active < 6) { setActiveStage(1); }
    resetVacuum(1);
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Universe reset'; }
};

export const calculateVerseCost = (): number => {
    let base = 120 * 1.5 ** calculateEffects.trueUniverses();
    const maxSafe = calculateEffects.mergeMaxResets(true);
    if (player.merge.resets > maxSafe) { base *= (player.merge.resets + 1) / (maxSafe + 1); }
    return Math.ceil(base);
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
    } else if (stageIndex === 6) {
        assignBuildingsProduction.S6Build1(); //Sets hardcap delay
        add.multiply(assignBuildingsProduction.verse0());

        /* //Non simplified formula is:
        const s = 4 / 3;
        const cur = (((1 - s / 2) ** 2 + 2 * s * true / soft) ** 0.5 + s / 2 - 1) / s * soft;
        const true = cur * (2 * cur / soft + 1) / 3;*/
        const current = player.buildings[6][0].current.toNumber();
        const softcap = calculateEffects.darkSoftcap();
        if (current > softcap) {
            add.setValue(((softcap * (softcap + 24 * add.toNumber()) + 8 * current * (2 * current + softcap)) ** 0.5 - softcap) / 4 - current);
        } else {
            const trueValue = current + add.toNumber();
            if (trueValue > softcap) { add.setValue(((softcap * (softcap + 24 * trueValue)) ** 0.5 - softcap) / 4 - current); }
        }
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
    if (!auto && !checkUpgrade(upgrade, stageIndex, type)) { return false; } //Auto should had already checked

    let free = false;
    let currency: Overlimit; //Readonly
    if (stageIndex === 1) {
        currency = new Overlimit(player.discharge.energy);
        if (player.inflation.vacuum) { free = (player.challenges.supervoid[3] >= 5 || player.accretion.rank >= 6) && player.strangeness[1][9] >= 1; }
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
            } else if (upgrade >= 5) { assignBuildingsProduction.S2FreeBuilds(); }
        } else if (stageIndex === 4 && upgrade === 1 && global.tabs.current === 'upgrade') { switchTab(); }
        if (!auto) {
            global.automatization.autoU[stageIndex] = [];
            if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `New Upgrade '${pointer.name[upgrade]}', has been created`; }
        }
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
                    calculateMaxLevel(0, 4, 'researches', true);
                }
            } else if (stageIndex === 6) {
                if (upgrade === 3) {
                    assignResetInformation.trueDarkEnergy();
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
                    calculateMaxLevel(0, 6, 'researches', true);
                } else if (upgrade === 1) {
                    calculateMaxLevel(1, 6, 'researches', true);
                }
            }
        }
        assignResearchCost(upgrade, stageIndex, type);
        if (!auto) {
            global.automatization[type === 'researches' ? 'autoR' : 'autoE'][stageIndex] = [];
            if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${level[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(level[upgrade])} for the '${pointer.name[upgrade]}' ${type === 'researches' ? 'Stage' : specialHTML.researchExtraDivHTML[player.stage.active]} Research`; }
        }
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
                if (player.inflation.vacuum) { effective++; }
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
        if (level === 1) {
            if (player.collapse.highest < upgrade) { player.collapse.highest = upgrade; }

            if ([7, 16, 20, 25, 28, 31, 34].includes(upgrade)) {
                calculateMaxLevel(1, 4, 'researches', true);
            } else if (upgrade === 9 || upgrade === 17) {
                calculateMaxLevel(0, 4, 'researches', true);
            } else if (upgrade === 11) {
                calculateMaxLevel(2, 4, 'researches', true);
            } else if (upgrade === 26) {
                player.stage.current = 5;
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
    if (!auto && !checkUpgrade(upgrade, stageIndex, type)) { return false; }

    if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];
        const strangeness = player.strangeness[stageIndex];
        const currency = player.strange[0];

        if (strangeness[upgrade] >= pointer.max[upgrade] || currency.current < pointer.cost[upgrade]) { return false; }
        strangeness[upgrade]++;
        currency.current -= pointer.cost[upgrade];

        /* Special cases */
        if (stageIndex === 1) {
            if (upgrade === 4) {
                if (player.inflation.vacuum) {
                    const maxLevel = player.strangeness[3][4] < 1 ? 1 : player.strangeness[2][4] < 1 ? 2 : player.strangeness[4][4] < 1 ? 3 : 4;
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
                    const maxLevel = player.strangeness[4][4] < 1 ? 3 : 4;
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
                    const maxLevel = player.strangeness[2][4] < 1 ? 2 : player.strangeness[4][4] < 1 ? 3 : 4;
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
                global.debug.rankUpdated = null;
                assignResetInformation.maxRank();
            }
        } else if (stageIndex === 4) {
            if (upgrade === 4) {
                if (player.inflation.vacuum) {
                    if (player.clone.depth === 'stage' && player.clone.researchesAuto[2] === 3) { player.clone.researchesAuto[2] = 4; }
                    if (player.researchesAuto[2] === 3) { player.researchesAuto[2] = 4; }
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
            } else if (upgrade === 7) {
                if (player.verses[0].current >= 13) { assignBuildingsProduction.strange0(); }
            } else if (upgrade === 8) {
                if (player.clone.depth === 'stage') { player.clone.elements[0] = 1; }
                if (player.elements[0] < 1) { player.elements[0] = 1; }
            }
        } else if (stageIndex === 5) {
            if (upgrade === 3) {
                if (player.inflation.vacuum) {
                    stageUpdate(false);
                    if (player.elements[26] >= 1) { awardVoidReward(4); }
                }
            } else if (upgrade === 4) {
                if (strangeness[5] >= 1) {
                    if (player.clone.depth === 'stage') { player.clone.ASR[5] = global.ASRInfo.max[5]; }
                    player.ASR[5] = global.ASRInfo.max[5];
                }
            } else if (upgrade === 5) {
                const newLevel = strangeness[4] >= 1 ? global.ASRInfo.max[5] : 2;
                if (player.clone.depth === 'stage') { player.clone.ASR[5] = newLevel; }
                player.ASR[5] = newLevel;
            } else if (upgrade === 10) {
                assignResetInformation.trueEnergy();
            }
        } else if (stageIndex === 6) {
            if (upgrade === 2) {
                calculateMaxLevel(0, 1, 'strangeness', true);
                calculateMaxLevel(1, 2, 'strangeness', true);
                calculateMaxLevel(0, 3, 'strangeness', true);
                calculateMaxLevel(0, 4, 'strangeness', true);
                calculateMaxLevel(0, 5, 'strangeness', true);
            }
        }
        assignResearchCost(upgrade, stageIndex, 'strangeness');
        if (player.verses[0].current < 13) { assignBuildingsProduction.strange0(); }
        if (!auto) {
            global.automatization.autoS = [];
            if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${strangeness[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(strangeness[upgrade])} for the '${pointer.name[upgrade]}' ${global.stageInfo.word[stageIndex]} Strangeness`; }
        }
    } else if (type === 'inflations') {
        const pointer = global.treeInfo[stageIndex];
        const tree = player.tree[stageIndex];
        const currency = player.cosmon[stageIndex];

        if (tree[upgrade] >= pointer.max[upgrade] || currency.current < pointer.cost[upgrade]) { return false; }
        tree[upgrade]++;
        currency.current -= pointer.cost[upgrade];

        /* Special cases */
        if (stageIndex === 1) {
            calculateMaxLevel(2, 1, 'inflations', !auto || upgrade !== 1);
        } else if (!auto && global.loadouts.open) {
            global.loadouts.input.push(upgrade);
            loadoutsFinal(global.loadouts.input);
        }
        if (stageIndex === 0) {
            if (upgrade === 0) {
                for (let i = 0; i < global.challengesInfo.length; i++) {
                    assignChallengeInformation(i);
                }
                for (let s = 1; s < playerStart.milestones.length; s++) {
                    for (let i = 0; i < playerStart.milestones[s].length; i++) {
                        assignMilestoneInformation(i, s);
                    }
                }
            } else if (upgrade === 4) {
                if (player.challenges.active === 1) {
                    for (let i = 0; i < global.challengesInfo.length; i++) {
                        assignChallengeInformation(i);
                    }
                }
            } else if (upgrade === 5) {
                if (!player.inflation.vacuum && player.darkness.active) {
                    prepareDarkness(true, true);
                    stageUpdate();
                }
            } else if (upgrade === 6) {
                for (let i = 0; i < global.challengesInfo.length; i++) {
                    assignChallengeInformation(i);
                }
            }
        } else if (stageIndex === 1) {
            if (upgrade === 3) {
                calculateMaxLevel(2, 0, 'inflations', true);
            } else if (upgrade === 5) {
                calculateMaxLevel(0, 2, 'researchesExtra', true);
                calculateMaxLevel(1, 1, 'strangeness', true);
                calculateMaxLevel(0, 2, 'strangeness', true);
            } else if (upgrade === 6) {
                calculateMaxLevel(0, 4, 'researches', true);
            } else if (upgrade === 7) {
                calculateMaxLevel(10, 5, 'strangeness', true);
                assignMilestoneInformation(1, 4);
            }
        }
        assignResearchCost(upgrade, stageIndex, 'inflations');
        if (!auto) {
            if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${tree[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(tree[upgrade])} for the '${pointer.name[upgrade]}' Inflation`; }
        }
    }

    if (!auto) { numbersUpdate(); }
    return true;
};

/** User only, lazy way to remove extra checks from auto */
export const buyStrangenessMax = (upgrade: number, stageIndex: number, type: 'strangeness' | 'inflations') => {
    const max = player.toggles.max[type === 'strangeness' ? 1 : 2] !== global.hotkeys.shift;
    while (buyStrangeness(upgrade, stageIndex, type) && max) { continue; }
};

/** Returns true if refund successfull or nothing to refund */
export const inflationRefund = async(noConfirmation = false, loadout = false): Promise<boolean> => {
    const inflaton = player.cosmon[0];
    if (inflaton.current === inflaton.total && player.tree[0][0] < 1) { return true; }
    const challenge = player.challenges.active;
    if (!noConfirmation && !await Confirm(`This will force a Stage reset${challenge !== null ? ' and restart current Challenge' : ''} to refund Inflations${loadout ? ' and load this loadout' : ''}, continue?\n(Holding shift will automatically accept this)`)) { return false; }

    if (challenge !== null) { challengeReset(); }
    stageFullReset();
    if (challenge !== null) { challengeReset(challenge); }

    inflaton.current = inflaton.total;
    for (let i = 0; i < playerStart.tree[0].length; i++) {
        player.tree[0][i] = 0;
        assignResearchCost(i, 0, 'inflations');
    }

    /* Special cases */
    for (let i = 0; i < global.challengesInfo.length; i++) {
        assignChallengeInformation(i);
    }
    for (let s = 1; s < playerStart.milestones.length; s++) {
        for (let i = 0; i < playerStart.milestones[s].length; i++) {
            assignMilestoneInformation(i, s);
        }
    }
    if (!player.inflation.vacuum && player.darkness.active) { prepareDarkness(); }
    if (!loadout) {
        numbersUpdate();
        loadoutsFinal([]);
        if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Inflations have been refunded'; }
    }
    return true;
};

export const assignResearchCost = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'strangeness' | 'inflations') => {
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
        global.treeInfo[stageIndex].cost[research] = calculateTreeCost(research, stageIndex);
    }
};

export const calculateTreeCost = (index: number, stageIndex: number, level = player.tree[stageIndex][index]): number => {
    let scaling = global.treeInfo[stageIndex].scaling[index];
    let firstCost = global.treeInfo[stageIndex].firstCost[index];
    if (stageIndex === 1) {
        if (index === 0 || index === 1) {
            const base = Math.floor(level / 4);
            const steps = (base + 1) * base / 2;
            firstCost += index === 0 ? steps : -steps;
            scaling *= steps + 1;
        } else if (index === 2) {
            return Math.floor(Math.round((firstCost * scaling ** level) * 100) / 100);
        }
    }

    return Math.floor(Math.round((firstCost + scaling * level) * 100) / 100);
};

export const calculateMaxLevel = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'strangeness' | 'inflations', addAuto = false) => {
    let max = null as number | null;
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
                if (player.inflation.vacuum && player.tree[1][6] >= 2) { max += Math.floor(calculateEffects.effectiveRank()); }
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
                const universes = calculateEffects.trueUniverses();
                max = universes >= 5 ? 4 : universes >= 4 ? 2 : 1;
            }
        } else if (stageIndex === 6) {
            if (research === 0) {
                max = 20 + player.researchesExtra[6][0];
            } else if (research === 1) {
                max = 8 + 2 * player.researchesExtra[6][1];
            }
        }
    } else if (type === 'researchesExtra') {
        if (stageIndex === 2) {
            if (research === 0) {
                max = player.inflation.vacuum && player.tree[1][5] >= 2 ? 5 : 1;
            }
        } else if (stageIndex === 3) {
            if (research === 0) {
                max = (player.strangeness[3][2] >= 1 ? 20 : 14) + Math.floor(2 * calculateEffects.effectiveRank());
            } else if (research === 1) {
                max = player.strangeness[3][2] >= 2 ? 8 : 6;
            } else if (research === 4) {
                max = Math.min(player.accretion.rank - 2, 5);
            }
        } else if (stageIndex === 5) {
            if (research === 1) {
                max = calculateEffects.trueUniverses() >= 4 ? 2 : 1;
            } else if (research === 2) {
                max = Math.max((calculateEffects.trueUniverses() - 4) * 2, 1);
            } else if (research === 3) {
                max = Math.max(calculateEffects.trueUniverses() - 3, 1);
            }
        }
    } else if (type === 'researchesAuto') {
        if (research === 2) {
            max = player.inflation.vacuum ? 4 : 1;
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
            max = player.darkness.active && (player.inflation.vacuum || player.tree[0][5] >= 1) ? 1 : 0;
        }
    } else if (type === 'strangeness') {
        if (stageIndex === 1) {
            if (research === 0) {
                max = 6 + player.strangeness[6][2];
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 1) {
                max = 4;
                if (player.inflation.vacuum && player.tree[1][5] >= 3) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 3) {
                max = 2;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = player.inflation.vacuum && player.challenges.void[4] >= 1 ? 2 : 1;
            } else if (research === 6) {
                max = player.inflation.vacuum && player.challenges.void[5] >= 2 ? 2 : 1;
            }
        } else if (stageIndex === 2) {
            if (research === 0) {
                max = 4;
                if (player.inflation.vacuum && player.tree[1][5] >= 3) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 1) {
                max = 8 + player.strangeness[6][2];
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 3) {
                max = 2;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = player.inflation.vacuum && player.challenges.void[4] >= 1 ? 2 : 1;
            } else if (research === 6) {
                max = player.inflation.vacuum && player.challenges.void[5] >= 2 ? 2 : 1;
            }
        } else if (stageIndex === 3) {
            if (research === 0) {
                max = 8 + player.strangeness[6][2];
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 1) {
                max = 4;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = player.inflation.vacuum && player.challenges.void[4] >= 1 ? 2 : 1;
            } else if (research === 7) {
                max = player.inflation.vacuum && player.challenges.void[5] >= 2 ? 2 : 1;
            } else if (research === 9) {
                max = player.inflation.vacuum && player.challenges.void[5] >= 2 ? 2 : 1;
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                max = 8 + player.strangeness[6][2];
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 1) {
                max = 4;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = 1;
                if (player.inflation.vacuum) {
                    if (player.challenges.void[4] >= 1) { max++; }
                    if (player.tree[1][7] >= 4) { max++; }
                }
            } else if (research === 6) {
                max = player.inflation.vacuum || player.milestones[4][0] >= 8 || player.verses[0].current >= 3 ? 2 : 1;
            } else if (research === 7) {
                max = player.inflation.vacuum && player.challenges.void[5] >= 2 ? 2 : 1;
            }
        } else if (stageIndex === 5) {
            if (research === 0) {
                max = 8 + player.strangeness[6][2];
            } else if (research === 2) {
                max = 2;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 6) {
                max = !player.inflation.vacuum && (player.milestones[5][0] >= 8 || player.verses[0].current >= 8) ? 2 : 1;
            } else if (research === 7) {
                max = player.inflation.vacuum && player.challenges.void[5] >= 2 ? 2 : 1;
            } else if (research === 8) {
                max = player.inflation.vacuum && player.challenges.void[5] >= 2 ? 2 : 1;
            } else if (research === 10) {
                max = player.tree[1][7] >= 2 ? 4 : 3;
            }
        }
    } else if (type === 'inflations') {
        if (stageIndex === 0) {
            if (research === 2) {
                max = 8 + player.tree[1][3];
            }
        } else if (stageIndex === 1) {
            if (research === 2) {
                max = Math.floor(logAny(3 * (player.cosmon[1].total - player.cosmon[1].current) / 4 + 1, 4));
            }
        }
    }
    if (max !== null) {
        if (max < 0) {
            max = 0;
        } else if (max > 1e6) {
            max = 1e6;
        }
        if (type === 'inflations') {
            global.treeInfo[stageIndex].max[research] = max;
        } else if (type === 'researchesAuto' || type === 'ASR') {
            global[`${type}Info`].max[type === 'ASR' ? stageIndex : research] = max;
        } else {
            global[`${type}Info`][stageIndex].max[research] = max;
        }
    }

    if (type !== 'researchesAuto' && type !== 'ASR') { assignResearchCost(research, stageIndex, type); }
    if (addAuto) {
        if (type === 'researches' || type === 'researchesExtra') {
            autoResearchesAdd(type, stageIndex, research);
        } else if (type === 'strangeness') {
            autoStrangenessAdd(stageIndex, research);
        }
    }
};

const autoUpgrades = (stageIndex: number) => {
    const auto = global.automatization.autoU[stageIndex];
    if (auto[0] === -1 || player.researchesAuto[0] < 1 || !player.toggles.auto[5]) { return; }

    const level = player.upgrades[stageIndex];
    if (auto.length === 0) {
        for (let i = 0; i < global.upgradesInfo[stageIndex].maxActive; i++) {
            if (level[i] < 1) { auto.push(i); }
        }

        const startCost = global.upgradesInfo[stageIndex].cost;
        auto.sort(typeof startCost[0] === 'number' ?
            (a, b) => (startCost[a] as number) - (startCost[b] as number) :
            (a, b) => compareFunc(startCost[a] as Overlimit, startCost[b])
        );
    }

    for (let i = 0; i < auto.length; i++) {
        const index = auto[i];
        if (!checkUpgrade(index, stageIndex, 'upgrades')) { continue; }
        if (!buyUpgrades(index, stageIndex, 'upgrades', true)) { return; }
        auto.splice(i, 1);
        i--;
    }
    if (auto.length === 0) { auto[0] = -1; }
};

const autoResearchesAdd = (type: 'researches' | 'researchesExtra', stageIndex: number, which: number) => {
    const auto = global.automatization[type === 'researches' ? 'autoR' : 'autoE'][stageIndex];
    const pointer = global[`${type}Info`][stageIndex];
    if (pointer.max[which] <= player[type][stageIndex][which] || auto.includes(which) || auto.length === 0) { return; }
    if (auto[0] === -1) {
        auto[0] = which;
        return;
    }

    const current = pointer.cost[which];
    let index = 0;
    if (typeof current === 'number') {
        while (current > (pointer.cost[auto[index]] as number)) { index++; }
    } else {
        while (current.moreThan(pointer.cost[auto[index]])) { index++; }
    }
    auto.splice(index, 0, which);
};

const autoResearches = (type: 'researches' | 'researchesExtra', stageIndex: number) => {
    const auto = global.automatization[type === 'researches' ? 'autoR' : 'autoE'][stageIndex];
    if (auto[0] === -1 || player.researchesAuto[0] < (type === 'researches' ? 2 : 3) || !player.toggles.auto[type === 'researches' ? 6 : 7]) { return; }
    const pointer = global[`${type}Info`][stageIndex];
    const cost = pointer.cost;

    const level = player[type][stageIndex];
    if (auto.length === 0) {
        for (let i = 0; i < pointer.maxActive; i++) {
            if (level[i] < pointer.max[i]) { auto.push(i); }
        }

        auto.sort(typeof cost[0] === 'number' ?
            (a, b) => (cost[a] as number) - (cost[b] as number) :
            (a, b) => compareFunc(cost[a] as Overlimit, cost[b])
        );
    }

    for (let i = 0; i < auto.length; i++) {
        const index = auto[i];
        if (!checkUpgrade(index, stageIndex, type)) { continue; }
        if (!buyUpgrades(index, stageIndex, type, true)) { return; }

        const nextIndex = i - 1;
        while (index !== auto[i]) { i++; }
        if (level[index] >= pointer.max[index]) {
            auto.splice(i, 1);
        } else {
            const old = i;
            const current = cost[index];
            i++;
            if (typeof current === 'number') {
                while (current > (cost[auto[i]] as number)) { i++; }
            } else {
                while (current.moreThan(cost[auto[i]])) { i++; }
            }
            if (old !== i - 1) { auto.splice(i - 1, 0, auto.splice(old, 1)[0]); }
        }
        i = nextIndex;
    }
    if (auto.length === 0) { auto[0] = -1; }
};

const autoElements = () => {
    if (player.researchesAuto[1] < 2) { return; }

    const auto = global.automatization;
    while (auto.element < global.elementsInfo.maxActive) {
        if (!checkUpgrade(auto.element, 4, 'elements')) { break; }
        buyUpgrades(auto.element, 4, 'elements', true);
        if (player.elements[auto.element] === 0) { break; }
        auto.element++;
    }
};

const autoStrangenessAdd = (stageIndex: number, which: number) => {
    const auto = global.automatization.autoS;
    const pointer = global.strangenessInfo;
    if (pointer[stageIndex].max[which] <= player.strangeness[stageIndex][which] || auto.length === 0) { return; }
    if (auto[0][0] === -1) {
        auto[0] = [which, stageIndex];
        return;
    }
    let index = 0;
    const current = pointer[stageIndex].cost[which];
    while (index < auto.length && current > pointer[auto[index][1]].cost[auto[index][0]]) { index++; }
    while (index < auto.length) {
        const check = auto[index];
        if (current !== pointer[check[1]].cost[check[0]] || stageIndex < check[1] || (stageIndex === check[1] && which < check[0])) { break; }
        index++;
    }

    if (index === 0) {
        auto.unshift([which, stageIndex]);
    } else {
        if (auto[index - 1][1] === stageIndex && auto[index - 1][0] === which) { return; }
        auto.splice(index, 0, [which, stageIndex]);
    }
};

const autoStrangeness = () => {
    const auto = global.automatization.autoS;
    if (auto.length !== 0 && auto[0][0] === -1) { return; }
    const pointer = global.strangenessInfo;

    const level = player.strangeness;
    if (auto.length === 0) {
        for (let s = 1; s < pointer.length; s++) {
            for (let i = 0; i < pointer[s].maxActive; i++) {
                if (level[s][i] < pointer[s].max[i]) { auto.push([i, s]); }
            }
        }

        auto.sort((a, b) => pointer[a[1]].cost[a[0]] - pointer[b[1]].cost[b[0]]);
    }

    for (let i = 0; i < auto.length; i++) {
        const main = auto[i];
        const index = main[0];
        const stageIndex = main[1];
        if (!checkUpgrade(index, stageIndex, 'strangeness')) { continue; }
        if (!buyStrangeness(index, stageIndex, 'strangeness', true)) { return; }

        const nextIndex = i - 1;
        while (main !== auto[i]) { i++; }
        if (level[stageIndex][index] >= pointer[stageIndex].max[index]) {
            auto.splice(i, 1);
        } else {
            const old = i;
            const current = pointer[stageIndex].cost[index];
            i++;
            while (i < auto.length && current > pointer[auto[i][1]].cost[auto[i][0]]) { i++; }
            while (i < auto.length) {
                const check = auto[i];
                if (current !== pointer[check[1]].cost[check[0]] || stageIndex < check[1] || (stageIndex === check[1] && index < check[0])) { break; }
                i++;
            }
            if (old !== i - 1) { auto.splice(i - 1, 0, auto.splice(old, 1)[0]); }
        }
        i = nextIndex;
    }
    if (auto.length === 0) { auto[0] = [-1, 0]; }
};

const endResetCheck = (peak = false): boolean => {
    if (global.inflationInfo.trueUniverses < 1 && player.darkness.energy < 1000) { return false; }

    if (peak) {
        const peakCheck = calculateEffects.cosmonGain() / player.time.end;
        if (player.inflation.peak[0] < peakCheck) {
            player.inflation.peak[0] = peakCheck;
            player.inflation.peak[1] = player.time.end;
        }
    }
    return player.darkness.energy >= 1000 || !player.darkness.active;
};
export const endResetUser = async() => {
    if (!endResetCheck() || player.progress.main < 20) { return; }

    if (player.toggles.confirm[6] !== 'None') {
        const array = [];
        if ((player.inflation.vacuum || player.challenges.active !== null) && calculateVerseCost() <= calculateEffects.mergeScore()) {
            array.push('can create the Universe');
        }
        if (!(player.clone.inflation?.vacuum as boolean ?? player.inflation.vacuum)) {
            array.push(`current Vacuum state ${player.challenges.active !== null ? ' outside of the Challenge' : ''} is false`);
        }
        if (player.toggles.confirm[6] === 'All' && array.length === 0) {
            array.push('confirmation is enabled');
        }
        if (array.length !== 0) {
            if (!await Confirm(`Prevented End reset because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!endResetCheck()) { return Notify('End reset canceled, requirements are no longer met'); }
        }
    }

    endReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused End reset'; }
};

const endReset = () => {
    const income = calculateEffects.cosmonGain();
    player.cosmon[1].current += income;
    player.cosmon[1].total += income;
    if (player.cosmon[1].current < 1e6) { //Attempt to fix floats
        player.cosmon[1].current = Math.round(player.cosmon[1].current * 1e14) / 1e14;
    }

    const history = player.history.end;
    const storage = global.historyStorage.end;
    const type = player.darkness.energy >= 1000 ? 1 : 0;
    storage.unshift([player.time.end, income, type, player.inflation.peak[0], player.inflation.peak[1]]);
    if (income / player.time.end > history.best[1] / history.best[0]) { history.best = cloneArray(storage[0]); }
    if (storage.length > 100) { storage.length = 100; }

    if (type === 1) {
        player.inflation.ends[1]++;
        if (global.inflationInfo.trueUniverses < player.verses[0].lowest[0]) { player.verses[0].lowest[0] = global.inflationInfo.trueUniverses; }
    } else {
        player.inflation.ends[0]++;
        if (global.inflationInfo.trueUniverses > player.verses[0].highest) { player.verses[0].highest = global.inflationInfo.trueUniverses; }
    }
    player.time.export[1] = 0;
    player.time.export[2] = 0;
    if (player.time.export[3] < income) { player.time.export[3] = income; }
    if (player.inflation.vacuum) {
        player.inflation.vacuum = false;
        prepareVacuum(false);
    }
    if (player.challenges.active !== null) {
        player.challenges.active = null;
        player.clone = {};
        prepareChallenge();
    }
    if ((player.stage.active !== 1 && player.toggles.normal[0]) || player.stage.active < 6) { setActiveStage(1); }
    resetVacuum(2);
};

/** Returns true for Auto, only if reset happened */
export const stageResetCheck = (stageIndex: number, quarks = null as number | null): boolean => {
    if (stageIndex === 5) {
        if (quarks !== null) {
            if (player.elements[26] < 0.5) { return false; }
            assignResetInformation.quarksGain();

            const stage = player.stage;
            const peakCheck = global.strangeInfo.strange0Gain / player.time.stage;
            if (stage.peak[0] < peakCheck) {
                stage.peak[0] = peakCheck;
                stage.peak[1] = player.time.stage;
            }

            if (player.elements[26] < 1) { return false; }
            if (player.inflation.vacuum && player.tree[0][5] >= 1) { gainStrange(1, quarks); }
            gainStrange(0, quarks);

            if (!player.toggles.auto[0] || player.strangeness[5][6] < (player.inflation.vacuum ? 1 : 2) || player.challenges.active !== null ||
                (player.toggles.normal[5] && player.toggles.auto[9] && player.strangeness[5][9] >= 1 && player.merge.input[0] <= 0 && player.merge.resets < calculateEffects.mergeMaxResets())) { return false; }
            const which = stageResetType();
            if (stage.input[which] <= 0 || stage.input[which] > (which === 3 ? player.time.stage - stage.peak[1] : which === 2 ? player.time.stage : global.strangeInfo.strange0Gain)) { return false; }
            stageResetReward(stageIndex);
            return true;
        }
        if (player.elements[26] < 1 || (player.challenges.active === 0 && player.toggles.supervoid)) { return false; }
        assignResetInformation.quarksGain();
        return true;
    } else if (player.inflation.vacuum) { return false; }
    if (stageIndex === 6) { //player.darkness.active
        if (player.tree[0][5] < 1 || player.tree[0][4] < 1 || player.darkness.energy < 1000) { return false; }
    } else if (stageIndex === 3) {
        if (player.buildings[3][0].current.lessThan(2.45576045e31)) { return false; }
    } else if (stageIndex === 2) {
        if (player.buildings[2][1].current.lessThan(1.19444e29)) { return false; }
    } else if (stageIndex === 1) {
        if (player.buildings[1][3].current.lessThan(1.67133125e21)) { return false; }
    } else { return false; }

    if (quarks !== null) { //Just checks if auto
        const stage = player.stage;
        if (stageIndex === Math.min(stage.current, 5)) {
            const peakCheck = calculateEffects.strangeGain(false) / player.time.stage;
            if (stage.peak[0] < peakCheck) {
                stage.peak[0] = peakCheck;
                stage.peak[1] = player.time.stage;
            }
        }

        if (!player.toggles.auto[0] || player.strangeness[5][6] < 1) { return false; }
        if (stageIndex === 6) {
            if (player.challenges.active === 1) { return false; }
        } else if (player.toggles.normal[2]) {
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
    const active = player.inflation.vacuum || (player.stage.active === 4 && player.progress.main >= 10) ? 5 : player.stage.active;
    if (!stageResetCheck(active)) { return; }

    if (player.toggles.confirm[0] !== 'None') {
        const array = [];
        if (active === 5) {
            if (player.inflation.vacuum || (player.tree[0][5] >= 1 && player.challenges.active !== 1)) {
                if (calculateVerseCost() <= calculateEffects.mergeScore()) {
                    array.push('can create the Universe');
                }
                if (player.merge.resets < calculateEffects.mergeMaxResets()) {
                    array.push('still capable to do more Merge resets');
                }
            } else if (player.upgrades[5][3] === 1 && player.buildings[5][3].true >= calculateEffects.mergeRequirement()) {
                array.push('can Collapse Vacuum into its true state');
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
        }
        if (player.toggles.confirm[0] === 'All' && array.length === 0) {
            array.push('confirmation is enabled');
        }
        if (array.length !== 0) {
            if (!await Confirm(`Prevented ${!player.inflation.vacuum ? `${global.stageInfo.word[active === 5 ? 4 : active]} ` : ''}Stage reset because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!stageResetCheck(active)) { return Notify('Stage reset canceled, requirements are no longer met'); }
        }
    }
    stageResetReward(active);
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Stage reset'; }
};

/** Requires call of stageResetCheck or assignResetInformation.quarksGain */
const stageResetReward = (stageIndex: number) => {
    const stage = player.stage;
    const challenge = player.challenges.active;

    let fullReset = true;
    let update: null | boolean = true;
    const resetThese = player.inflation.vacuum ? [1, 2, 3, 4, 5, 6] : [stageIndex];
    if (player.inflation.vacuum) {
        if (stage.active === 1 || stage.active >= 6) {
            update = false;
        } else { setActiveStage(1); }
        stage.current = 1;
    } else if (stageIndex === Math.min(stage.current, 5)) {
        if (stageIndex < 4) {
            const check = stage.current === stage.active;
            stage.current++;
            if (stage.current === 2 && player.milestones[2][1] >= 7) { stage.current++; }
            if (stage.current === 3 && player.milestones[3][1] >= 7) { stage.current++; }
            if (check) {
                setActiveStage(stage.current);
            } else { update = false; }
        } else {
            stage.current = player.milestones[1][1] < 6 ? 1 : player.milestones[2][1] < 7 ? 2 : player.milestones[3][1] < 7 ? 3 : 4;
            if ((stage.active === 4 && stage.current !== 4) || stage.active === 5) {
                setActiveStage(stage.current);
            } else { update = false; }
            resetThese.unshift(4);
        }
        if (challenge === null) { global.debug.timeLimit = false; }
        global.milestonesInfo[stage.current].recent = cloneArray(playerStart.milestones[stage.current]);
        if (stage.current === 4) { global.milestonesInfo[5].recent = cloneArray(playerStart.milestones[5]); }
        if (player.tree[0][5] < 1 || player.tree[0][4] < 1 || challenge === 1) { resetThese.push(6); }
    } else {
        if (challenge === 1) { //stageIndex === 6
            if (stage.current >= 4) {
                stage.current = 4;
                resetThese.unshift(4, 5);
            } else { resetThese.unshift(stage.current); }
            update = false;
        } else {
            if (stageIndex < 6) { global.milestonesInfo[stageIndex].recent = cloneArray(playerStart.milestones[stageIndex]); }
            update = stageIndex === stage.active ? false : null;
            fullReset = false;
        }
    }

    if (player.progress.main >= 9) {
        const exportReward = player.time.export;
        const conversion = (1 + player.tree[0][6]) * player.tree[0][6] / 50;
        if (stageIndex === 6) {
            const strangelets = calculateEffects.strangeGain(false, false);
            player.strange[1].current += strangelets;
            player.strange[1].total += strangelets;
            assignBuildingsProduction.strange1();
            if (challenge === null) {
                exportReward[2] = Math.max(exportReward[2], strangelets) + strangelets * conversion;
            } else if (challenge === 1) { assignBuildingsProduction.strange0(false); }
        } else {
            const quarks = stageIndex >= 4 ? global.strangeInfo.strange0Gain : calculateEffects.strangeGain(false);
            const strangelets = stageIndex >= 4 ? global.strangeInfo.strange1Gain : 0;
            player.strange[0].current += quarks;
            player.strange[0].total += quarks;
            if (strangelets > 0) {
                player.strange[1].current += strangelets;
                player.strange[1].total += strangelets;
                assignBuildingsProduction.strange1();
                if (challenge === null) { exportReward[2] = Math.max(exportReward[2], strangelets) + strangelets * conversion; }
            }
            assignBuildingsProduction.strange0(stageIndex >= 4 ? false : undefined);
            if (challenge === null) { exportReward[1] = Math.max(exportReward[1], quarks) + quarks * conversion; }
            if (stageIndex >= 4) {
                const history = player.history.stage;
                const storage = global.historyStorage.stage;
                storage.unshift([player.time.stage, quarks, strangelets, stage.peak[0], stage.peak[1]]);
                if (quarks / player.time.stage > history.best[1] / history.best[0]) { history.best = cloneArray(storage[0]); }
                if (storage.length > 100) { storage.length = 100; }
            }
        }
    }

    stage.resets++;
    resetStage(resetThese, update, fullReset);
};
const stageFullReset = (noReward = false) => {
    const vacuum = player.inflation.vacuum;
    const current = vacuum ? 5 : Math.min(player.stage.current, 5);
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
        if (!noReward && stageResetCheck(6)) {
            stageResetReward(6);
        } else {
            resetStage([6], false, false);
        }
    }

    if (!noReward && stageResetCheck(current)) {
        stageResetReward(current);
    } else {
        const resetThese = vacuum ? [1, 2, 3, 4, 5, 6] : [current];
        let update = false;
        if (vacuum) {
            if (player.stage.active !== 1 && player.stage.active < 6) {
                setActiveStage(1);
                update = true;
            }
            player.stage.current = 1;
        } else if (player.stage.current >= 5) {
            if (player.stage.active === 5) {
                setActiveStage(4);
                update = true;
            }
            player.stage.current = 4;
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

    if (global.tabs.current === 'upgrade') {
        if (global.tabs.upgrade.current === 'Elements' && stage !== 4 && stage !== 5) { switchTab('upgrade', 'Upgrades'); }
    } else if (global.tabs.current === 'Elements') {
        if (stage !== 4 && stage !== 5) { switchTab('upgrade'); }
    }
};

/** Returns true for Auto, only if reset happened */
const dischargeResetCheck = (goals = false): boolean => {
    if (player.upgrades[1][5] !== 1) { return false; }
    const info = global.dischargeInfo;
    const energy = player.discharge.energy;
    const level = player.strangeness[1][4];

    info.scaling = calculateEffects.dischargeScaling();
    info.next = calculateEffects.dischargeCost();
    if (goals) {
        if (level >= 2) {
            if (info.energyTrue >= info.next) {
                const increase = Math.floor(logAny(info.energyTrue / info.next, info.scaling)) + 1;
                player.discharge.current += increase;
                info.total = calculateEffects.effectiveGoals();
                awardVoidReward(1);
            }
        } else if (level < 1 && (player.researchesAuto[2] < 1 || (!player.inflation.vacuum && player.stage.current !== 1))) { return false; }
        if (!player.toggles.auto[1] || (energy >= info.energyTrue && (level >= 2 || energy < info.next))) { return false; }
        dischargeReset();
        return true;
    }
    return energy < info.energyTrue || (level < 2 && energy >= info.next);
};
export const dischargeResetUser = async() => {
    if (!dischargeResetCheck()) { return; }

    if (player.toggles.confirm[1] !== 'None') {
        const array = [];
        if (player.stage.active !== 1) {
            array.push("current active Stage isn't Microworld");
        }
        if (player.toggles.confirm[1] === 'All' && array.length === 0) {
            array.push('confirmation is enabled');
        }
        if (array.length !== 0) {
            if (!await Confirm(`Prevented Discharge because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!dischargeResetCheck()) { return Notify('Discharge canceled, requirements are no longer met'); }
        }
    }

    dischargeReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Discharge reset'; }
};

const dischargeReset = () => {
    if (player.strangeness[1][4] < 2 && player.discharge.energy >= global.dischargeInfo.next && player.discharge.energy >= global.dischargeInfo.energyTrue) {
        player.discharge.energy -= Math.ceil(global.dischargeInfo.next);
        player.discharge.current++;
    }
    awardVoidReward(1);
    reset('discharge', player.challenges.active === 0 ? (player.tree[1][5] >= 4 ? [1, 3, 4, 5] : [1, 2, 3, 4, 5]) : [1]);
};

/** Returns true for Auto, only if reset happened */
const vaporizationResetCheck = (clouds = null as number | null): boolean => {
    if (player.upgrades[2][2] !== 1 || assignResetInformation.newClouds() <= 0) { return false; }

    if (clouds !== null) {
        const level = player.strangeness[2][4];
        if (level >= 2 || (player.inflation.vacuum && player.researchesExtra[2][0] >= 1 && player.tree[1][5] >= 2)) {
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
    if (!vaporizationResetCheck()) { return; }

    if (player.toggles.confirm[2] !== 'None') {
        const array = [];
        if (player.strangeness[2][4] >= 2 || (player.inflation.vacuum && player.researchesExtra[2][0] >= 1 && player.tree[1][5] >= 2)) {
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
        if (player.toggles.confirm[2] === 'All' && array.length === 0) {
            array.push('confirmation is enabled');
        }
        if (array.length !== 0) {
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
        if (level >= 1 && player.tree[1][5] >= 2) {
            autoClouds /= (player.strangeness[2][4] >= 2 ? 40 : 400) / ((level + 3) * level);
        } else { autoClouds /= 40; }
        vaporization.clouds += global.vaporizationInfo.get * autoClouds;
    } else {
        vaporization.clouds += global.vaporizationInfo.get;
        reset('vaporization', player.challenges.active === 0 && player.tree[1][5] < 4 ? [1, 2, 3, 4, 5] : player.inflation.vacuum ? [1, 2] : [2]);
    }
    awardVoidReward(2);
};

/** Returns true for Auto, only if reset happened */
const rankResetCheck = (ranks = false): boolean => {
    if (player.accretion.rank >= global.accretionInfo.maxRank || player.buildings[3][0][player.strangeness[3][4] >= 2 ? 'total' : 'current'].lessThan(calculateEffects.rankCost())) { return false; }

    const improved = player.strangeness[3][4] >= 2 && player.challenges.supervoid[3] >= 2;
    if (ranks) {
        if (improved) {
            rankReset(true);
            return true;
        } else if (!player.toggles.auto[3] || (player.strangeness[3][4] < 1 && (player.inflation.vacuum ? player.researchesAuto[2] < 2 : (player.researchesAuto[2] < 1 || player.stage.current !== 3)))) { return false; }
        rankReset();
        return true;
    }
    return !improved;
};
export const rankResetUser = async() => {
    if (!rankResetCheck()) { return; }

    if (player.toggles.confirm[3] !== 'None' && player.accretion.rank !== 0) {
        const array = [];
        if (player.inflation.vacuum && (player.researchesExtra[2][1] <= 0 || player.vaporization.clouds <= 0) && player.accretion.rank >= 4) {
            array.push(`current ${player.researchesExtra[2][1] <= 0 ? "level for Clouds Research 'Rain Clouds'" : 'Cloud amount'} is 0, which could make next Rank slow`);
        }
        if (player.stage.active !== 3) {
            array.push("current active Stage isn't Accretion");
        }
        if (player.toggles.confirm[3] === 'All' && array.length === 0) {
            array.push('confirmation is enabled');
        }
        if (array.length !== 0) {
            if (!await Confirm(`Prevented Rank increase because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!rankResetCheck()) { return Notify('Rank increase canceled, requirements are no longer met'); }
        }
    }

    rankReset();
    numbersUpdate();
    if (player.stage.active === 3) { visualUpdate(); }
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Increased Rank to '${global.accretionInfo.rankName[player.accretion.rank]}'`; }
};

const rankReset = (noReset = false) => {
    player.accretion.rank++;
    awardVoidReward(3);
    assignResetInformation.maxRank();
    if (!noReset) {
        const resetThese = [3];
        if (player.inflation.vacuum) {
            player.tree[1][5] < 4 ? resetThese.unshift(1, 2) : resetThese.unshift(1);
            if (player.challenges.active === 0) { resetThese.push(4, 5); }
        }
        reset('rank', resetThese);
    } else {
        global.accretionInfo.effective = calculateEffects.effectiveRank();
        global.dischargeInfo.total = calculateEffects.effectiveGoals();
    }
    calculateMaxLevel(0, 3, 'researchesExtra', true);
    calculateMaxLevel(4, 3, 'researchesExtra', true);
    calculateMaxLevel(0, 4, 'researches', true);
    if (player.accretion.rank === 5) {
        if (player.researchesExtra[3][0] > global.researchesExtraInfo[3].max[0]) { player.researchesExtra[3][0] = global.researchesExtraInfo[3].max[0]; }
    } else if (player.accretion.rank === 6) {
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
                effectsCache.star[0] = calculateEffects.star[0]();
                effectsCache.star[1] = calculateEffects.star[1]();
                effectsCache.star[2] = calculateEffects.star[2]();
                assignResetInformation.newStars(true);
                assignResetInformation.newMass();
                awardVoidReward(4);
            }
            if (level >= 3) {
                if (info.newMass > collapse.mass) {
                    collapse.mass = info.newMass;
                    awardVoidReward(4);
                }
                return false;
            }
        } else if (level < 1 && (player.inflation.vacuum ? player.researchesAuto[2] < 4 : (player.researchesAuto[2] < 1 || player.stage.current < 4))) { return false; }
        if (!player.toggles.auto[4]) { return false; }

        if (player.strangeness[5][4] >= 1 && player.toggles.buildings[5][3] && player.researchesExtra[5][0] >= 1) {
            let newMass = info.newMass;
            if (level < 2 && player.verses[0].current >= 2) { newMass *= calculateEffects.star[2](true) / effectsCache.star[2]; }
            if (calculateBuildingsCost(3, 5).toNumber() <= newMass) {
                collapseReset();
                return true;
            }
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
        const massBoost = (calculateEffects.mass(true) / calculateEffects.mass()) * (calculateEffects.S4Research4(true) / calculateEffects.S4Research4()) * ((1 + (calculateEffects.S5Upgrade2(true) - calculateEffects.S5Upgrade2()) / effectsCache.galaxyBase) ** (player.buildings[5][3].true * 2));
        if (massBoost >= collapse.input[0]) {
            collapseReset();
            return true;
        } else if (level >= 2) { return false; }
        const starProd = global.buildingsInfo.producing[4];
        const restProd = new Overlimit(starProd[1]).allPlus(starProd[3], starProd[4], starProd[5]);
        if (!(massBoost * new Overlimit(starProd[2]).multiply(calculateEffects.star[0](true) / effectsCache.star[0]).plus(restProd).divide(restProd.plus(starProd[2])).toNumber() * (calculateEffects.star[1](true) / effectsCache.star[1]) * (calculateEffects.star[2](true) / effectsCache.star[2]) >= collapse.input[0])) { return false; } //Done this way to remove NaN
        collapseReset();
        return true;
    }
    return (level < 3 && info.newMass > collapse.mass) || (level < 2 && (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0)) || player.elements.includes(0.5, 1);
};
export const collapseResetUser = async() => {
    if (!collapseResetCheck()) { return; }

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
        if (player.toggles.confirm[4] === 'All' && array.length === 0) {
            array.push('confirmation is enabled');
        }
        if (array.length !== 0) {
            if (!await Confirm(`Prevented Collapse because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!collapseResetCheck()) { return Notify('Collapse canceled, requirements are no longer met'); }
        }
    }

    collapseReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Collapse reset'; }
};

const collapseReset = () => {
    const collapseInfo = global.collapseInfo;
    const collapse = player.collapse;

    collapse.stars[0] += collapseInfo.starCheck[0];
    collapse.stars[1] += collapseInfo.starCheck[1];
    collapse.stars[2] += collapseInfo.starCheck[2];
    if (collapseInfo.newMass > collapse.mass) {
        collapse.mass = collapseInfo.newMass;
    }
    for (let i = 1; i < global.elementsInfo.maxActive; i++) { //Must be below mass and star checks
        i = player.elements.indexOf(0.5, i);
        if (i < 1) { break; }
        buyUpgrades(i, 4, 'elements', true);
    }

    const resetThese = [4];
    if (player.inflation.vacuum) {
        player.tree[1][5] < 4 ? resetThese.unshift(1, 2, 3) : resetThese.unshift(1, 3);
        if (player.challenges.active === 0) { resetThese.push(5); }
    } else if (player.strangeness[5][3] < 1) { resetThese.push(5); }
    reset('collapse', resetThese);
    calculateMaxLevel(0, 4, 'researches');
    calculateMaxLevel(1, 4, 'researches');
    awardVoidReward(4);
};

/** Returns true for Auto, only if reset happened */
const mergeResetCheck = (rewards = false): boolean => {
    if (player.upgrades[5][3] !== 1) { return false; }
    const galaxies = player.buildings[5][3].true;
    if (!player.inflation.vacuum && (player.tree[0][5] < 1 || player.challenges.active === 1)) {
        if (galaxies < calculateEffects.mergeRequirement()) { return false; }
        if (rewards) {
            if (player.strangeness[5][9] < 1) { return false; }
            mergeReset();
        }
        return true;
    }
    assignResetInformation.mergeReward();
    const merge = player.merge;

    if (rewards) {
        const info = global.mergeInfo;
        if (player.strangeness[5][9] >= 2 && (info.checkReward[0] > 0 || info.checkReward[1] > 0)) {
            merge.claimed[0] += info.checkReward[0];
            merge.claimed[1] += info.checkReward[1];
            merge.rewards[0] += info.checkReward[0];
            merge.rewards[1] += info.checkReward[1];
            assignResetInformation.mergeReward(true);
            awardVoidReward(5);
        }
        if (merge.resets >= calculateEffects.mergeMaxResets() || !player.toggles.auto[9] || player.strangeness[5][9] < 1 || (merge.input[1] !== 0 ? merge.since < merge.input[1] : assignResetInformation.timeUntil() > 0) || galaxies < Math.max(merge.input[0], 1)) { return false; }
        mergeReset();
    }
    return galaxies >= 1 && merge.resets < calculateEffects.mergeMaxResets();
};
export const mergeResetUser = async() => {
    if (!mergeResetCheck()) { return; }

    const stable = player.inflation.vacuum || (player.tree[0][5] >= 1 && player.challenges.active !== 1);
    if (player.toggles.confirm[5] !== 'None' && stable) {
        const array = [];
        const galaxyCost = calculateBuildingsCost(3, 5).toNumber();
        if (galaxyCost <= Math.max(player.collapse.mass, global.collapseInfo.newMass)) {
            array.push(`can afford a Galaxy${galaxyCost > player.collapse.mass ? ' after Collapse' : ''}`);
        }
        if (player.stage.active !== 5 && player.stage.active !== 6) {
            array.push("current active Stage isn't Intergalactic");
        }
        if (player.toggles.confirm[5] === 'All' && array.length === 0) {
            array.push('confirmation is enabled');
        }
        if (array.length !== 0) {
            if (!await Confirm(`Prevented Merging because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!mergeResetCheck()) { return Notify('Merge canceled, requirements are no longer met'); }
        }
    }

    mergeReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = stable ? 'Merged Galaxies' : 'Decayed Vacuum'; }
};

const mergeReset = () => {
    if (!player.inflation.vacuum && (player.tree[0][5] < 1 || player.challenges.active === 1)) {
        if (player.challenges.active === 1) { return awardStabilityReward(); }
        if (player.progress.main >= 15) {
            player.cosmon[0].current++;
            player.cosmon[0].total++;
            if (player.challenges.supervoid[1] < 1 && player.cosmon[0].total >= 2) {
                Notify("Click the 'Void' button in the 'Advanced' subtab to toggle the 'Supervoid'");
            }
        }
        if (player.stage.active < 6) { setActiveStage(1); }
        player.inflation.vacuum = true;
        player.inflation.resets++;
        player.time.export[1] = 0;
        player.time.export[2] = 0;
        prepareVacuum(true);
        resetVacuum();
        return;
    }

    player.merge.resets++;
    player.merge.rewards[0] += global.mergeInfo.checkReward[0];
    player.merge.rewards[1] += global.mergeInfo.checkReward[1];
    player.buildings[5][3].true = 0;
    player.merge.claimed = [0, 0];
    reset('galaxy', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [4, 5]);
    calculateMaxLevel(0, 4, 'researches');
    calculateMaxLevel(1, 4, 'researches');
    calculateMaxLevel(2, 4, 'researches');
    calculateMaxLevel(5, 4, 'researches');
    if (player.stage.current < 6) {
        player.stage.current = 6;
        stageUpdate(false);
    }
    awardVoidReward(5);
};

/** Returns true for Auto, only if reset happened */
const nucleationResetCheck = (auto = false): boolean => {
    if (player.upgrades[6][0] !== 1) { return false; }
    assignResetInformation.newFluid();
    if (auto) {
        if (player.verses[0].lowest[0] > 3) { return false; }
        if (global.dischargeInfo.energyStage[6] <= player.darkness.energy) {
            const post = calculateEffects.darkFluid(true);
            if ((post / effectsCache.fluid) * (calculateEffects.effectiveDarkEnergy(post) / calculateEffects.effectiveDarkEnergy()) ** (player.researchesExtra[6][3] / 40) < player.darkness.input) { return false; }
        }
        nucleationReset();
        return true;
    }
    return global.dischargeInfo.energyStage[6] > player.darkness.energy || global.inflationInfo.newFluid > 0;
};
export const nucleationResetUser = async() => {
    if (!nucleationResetCheck()) { return; }

    if (player.toggles.confirm[7] !== 'None') {
        const array = [];
        const post = calculateEffects.darkFluid(true);
        if (player.darkness.energy >= global.dischargeInfo.energyStage[6] && (post / effectsCache.fluid) * (calculateEffects.effectiveDarkEnergy(post) / calculateEffects.effectiveDarkEnergy()) ** (player.researchesExtra[6][3] / 40) < 1.1) {
            array.push(`boost from doing it is below ${format(1.1)}x`);
        }
        if (player.stage.active !== 6) {
            array.push("current active Stage isn't Abyss");
        }
        if (player.toggles.confirm[7] === 'All' && array.length === 0) {
            array.push('confirmation is enabled');
        }
        if (array.length !== 0) {
            if (!await Confirm(`Prevented Nucleation because ${array.join(',\nAlso ')}\nReset anyway?`)) { return; }
            if (!nucleationResetCheck()) { return Notify('Nucleation canceled, requirements are no longer met'); }
        }
    }

    nucleationReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Caused Nucleation reset'; }
};

const nucleationReset = () => {
    if (global.inflationInfo.newFluid > 0) { player.darkness.fluid += global.inflationInfo.newFluid; }
    player.challenges.active === 0 ? reset('collapse', [1, 2, 3, 4, 5, 6]) : reset('rank', [6]);
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
                pointer.need[0].setValue(1e3).power(level).multiply(1e3);
                pointer.reward[0] = 1.08 ** level;
            } else if (index === 1) {
                pointer.need[1].setValue(1e1).power(level).multiply(1e1);
                pointer.reward[1] = 1.12 ** level;
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
                const base = player.tree[1][7] >= 1 ? 35 : 28;
                pointer.need[1].setValue(base + base * level);
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
            if (player.tree[0][0] === 1) { time /= 4; }
        } else if (player.tree[0][4] >= 1) { time = 600; }
        pointer.reward[index] = time;
        pointer.need[index].setValue(pointer.scaling[index][level]);
    }
};

const awardMilestone = (index: number, stageIndex: number) => {
    if (!milestoneCheck(index, stageIndex)) { return; }
    const pointer = global.milestonesInfo[stageIndex];

    pointer.recent[index]++;
    player.milestones[stageIndex][index]++;
    assignMilestoneInformation(index, stageIndex);

    const maxed = !player.inflation.vacuum && player.milestones[stageIndex][index] >= pointer.scaling[index].length;
    if (globalSave.toggles[6]) { Notify(`Milestone '${pointer.name[index]}' new tier completed${maxed ? ', Maxed' : ''}`); }
    if (!player.inflation.vacuum) {
        player.strange[0].current++;
        player.strange[0].total++;
        assignBuildingsProduction.strange0();
        if (maxed && (stageIndex === 4 || stageIndex === 5) && index === 0) { calculateMaxLevel(6, stageIndex, 'strangeness', true); }
    } else if (stageIndex === 3 && index === 1) {
        global.accretionInfo.effective = calculateEffects.effectiveRank();
        global.dischargeInfo.total = calculateEffects.effectiveGoals();
        calculateMaxLevel(0, 3, 'researchesExtra', true);
        calculateMaxLevel(0, 4, 'researches', true);
    }
    awardMilestone(index, stageIndex);
};

/** Also updates related information */
export const toggleChallengeType = (change = false): boolean => {
    const reEnter = player.challenges.active === 0;
    if (change) {
        if (player.progress.main < 20) { return false; }
        if (reEnter) { challengeReset(); }
        if (global.april.ultravoid === false) {
            global.april.ultravoid = null;
        } else {
            player.toggles.supervoid = !player.toggles.supervoid;
            global.sessionToggles[0] = player.toggles.supervoid;
        }
    }

    const info = global.challengesInfo[0];
    info.name = player.toggles.supervoid ? 'Supervoid' : 'Void';
    info.resetType = player.toggles.supervoid ? 'vacuum' : 'stage';
    if (change) {
        assignChallengeInformation(0);
        if (reEnter) {
            enterExitChallengeUser(0);
            if (player.challenges.active !== 0) { Notify(`Failed to re-enter '${info.name}'`); }
        }
        numbersUpdate();
        visualUpdate();
    }
    return true;
};

export const assignChallengeInformation = (index: number) => {
    if (index === 2) { return; }
    let time = index === 1 ? 5400 :
        (player.toggles.supervoid ? 1200 : 3600) / (6 / (6 - player.tree[0][6]));
    if (player.tree[0][0] === 1) { time /= 4; }
    global.challengesInfo[index].time = time;
};

/** Challenge 0, automatically checked for being inside */
const awardVoidReward = (index: number): void => {
    const challenges = player.challenges;
    if (challenges.active !== 0) { return; }
    const info = global.challengesInfo[0];

    let progress = 1;
    if (index === 1) {
        progress += player.researchesExtra[1][2];
    } else if (index === 2) {
        if (player.vaporization.clouds > 1e4) { progress++; }
        if (player.vaporization.clouds > 1e12 && ((player.challenges.supervoid[3] >= 2 && player.strangeness[3][4] >= 2) || player.accretion.rank === 1)) { progress++; }
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
        if (player.merge.rewards[1] >= 1) { progress++; }
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

        Notify(`New Void reward unlocked:\n${info.rewardText[0][index][progress - 1]}`);
        if (index === 3) {
            if (progress <= 4) {
                calculateMaxLevel(0, 1, 'strangeness', true);
                calculateMaxLevel(1, 1, 'strangeness', true);
                calculateMaxLevel(3, 1, 'strangeness', true);
                calculateMaxLevel(0, 2, 'strangeness', true);
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
        } else if (index === 5) {
            if (progress === 2) {
                calculateMaxLevel(6, 1, 'strangeness', true);
                calculateMaxLevel(6, 2, 'strangeness', true);
                calculateMaxLevel(7, 3, 'strangeness', true);
                calculateMaxLevel(9, 3, 'strangeness', true);
                calculateMaxLevel(7, 4, 'strangeness', true);
                calculateMaxLevel(7, 5, 'strangeness', true);
                calculateMaxLevel(8, 5, 'strangeness', true);
            }
        }
        if (excess) { return awardVoidReward(index); }
    }

    if (!player.toggles.supervoid) { return; }
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

        if (excess) { return awardVoidReward(index); }
    }
};
/** Challenge 1, requires checking for being inside */
const awardStabilityReward = () => {
    const old = player.challenges.stability;
    const info = global.challengesInfo[1];
    if (player.time.vacuum <= info.time) {
        player.challenges.stability++;
        player.cosmon[0].current++;
        player.cosmon[0].total++;

        const rewardText = info.rewardText[old];
        Notify(`New Vacuum stability completion${rewardText !== undefined ? ` and a new reward:\n${rewardText}` : ''}`);

        if (player.stage.active < 6) { setActiveStage(1); }
        resetVacuum();
    }
};

/** Requires calling update stageUpdate call */
export const prepareDarkness = (full = true, entering = false) => {
    const enabled = player.darkness.active && (player.inflation.vacuum || player.tree[0][5] >= 1);
    const infoB = global.buildingsInfo;
    const infoU = global.upgradesInfo[6];
    const infoR = global.researchesInfo[6];
    const infoE = global.researchesExtraInfo[6];

    calculateMaxLevel(0, 6, 'ASR');
    if (enabled) {
        if (full && player.verses[0].lowest[0] <= 5) { player.ASR[6] = 1; }
        infoB.maxActive[6] = infoB.firstCost[6].length;
        infoU.maxActive = infoU.cost.length;
        infoR.maxActive = infoR.firstCost.length;
        infoE.maxActive = infoE.firstCost.length;
        if (entering) {
            for (let i = 0; i < infoR.maxActive; i++) { calculateMaxLevel(i, 6, 'researches'); }
            for (let i = 0; i < infoE.maxActive; i++) { calculateMaxLevel(i, 6, 'researchesExtra'); }
        }
        global.automatization.autoU[6] = [];
        global.automatization.autoR[6] = [];
        global.automatization.autoE[6] = [];
    } else {
        if (full) { player.ASR[6] = 0; }
        infoB.maxActive[6] = 1;
        infoU.maxActive = 0;
        infoR.maxActive = 0;
        infoE.maxActive = 0;
    }
};

/** Null means exit if possible, nothing if isn't. Entering same challenge will exit out of it */
export const enterExitChallengeUser = (index: number | null) => {
    const old = index === 2 && player.darkness.active ? 2 : player.challenges.active;
    if (old === index || index === null) {
        if (old === null) { return; }

        if (index === 2) {
            player.darkness.active = false;
            prepareDarkness();
            stageFullReset();
            Notify(`Deactivated the ${global.challengesInfo[2].name}`);
        } else {
            challengeReset();
            Notify(`Exited the ${global.challengesInfo[old].name}`);
        }
    } else {
        if (index === 0 && global.april.ultravoid === false) { return enterUltravoid(); }
        if (index === 1 && global.april.quantum) { return enterQuantum(); }
        if (!allowedToEnter(index)) { return; }
        if (index === 2) {
            player.darkness.active = true;
            prepareDarkness(true, true);
            stageUpdate();
            Notify(`Activated the ${global.challengesInfo[2].name}`);
        } else {
            challengeReset(index);
            Notify(`Entered the ${global.challengesInfo[index].name}`);
        }
    }
};
const exitChallengeAuto = () => {
    const old = player.challenges.active;
    if (old === null) { return; }
    const info = global.challengesInfo[old];
    if (player.time[info.resetType] <= info.time || player.strangeness[5][6] < (player.inflation.vacuum ? 1 : 2)) { return; }

    challengeReset();
    Notify(`Automatically exited the ${info.name}`);
};
/** Automatically exits out of challenge and then enters new one if specified */
const challengeReset = (next = null as number | null) => {
    const old = player.challenges.active;
    if (old !== null) {
        player.challenges.active = null;
        if (player.stage.active < 6) { setActiveStage(Math.min(player.clone.stage.current, (player.clone.depth !== 'stage' ? player.clone : player).strangeness[5][3] >= 1 ? 5 : 4)); }
        const currentState = player.clone.inflation?.vacuum as boolean | undefined;
        if (currentState !== undefined && currentState !== player.inflation.vacuum) {
            player.inflation.vacuum = currentState;
            prepareVacuum(currentState);
        }
        prepareChallenge();
        loadFromClone();
    }

    if (next !== null) {
        player.challenges.active = next;
        const resetType = global.challengesInfo[next].resetType;
        cloneBeforeReset(resetType as Exclude<typeof resetType, 'universe'>);
        if (resetType !== 'stage') {
            if (player.stage.active < 6) { setActiveStage(1); }
            const requiredState = next !== 1;
            if (player.inflation.vacuum !== requiredState) {
                player.inflation.vacuum = requiredState;
                prepareVacuum(requiredState);
            }
        }

        prepareChallenge();
        if (resetType === 'vacuum') {
            resetVacuum();
        } else { stageFullReset(true); }
    }
};
