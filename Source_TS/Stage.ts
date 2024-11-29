import { checkBuilding, checkUpgrade, milestoneCheck } from './Check';
import Overlimit from './Limit';
import { getId, getQuery } from './Main';
import { global, logAny, player, playerStart } from './Player';
import { reset, resetStage, resetVacuum } from './Reset';
import { Confirm, Notify, globalSave, playEvent } from './Special';
import { format, getChallengeDescription, getChallengeReward, numbersUpdate, setRemnants, stageUpdate, switchTab, visualTrueStageUnlocks, visualUpdate, visualUpdateInflation, visualUpdateResearches, visualUpdateUpgrades } from './Update';
import { prepareVacuum, switchVacuum } from './Vacuum';

export const calculateEffects = {
    /** Research is player.researches[1][4] */
    dischargeBase: (research = player.researches[1][4]): number => {
        let base = (4 + research) / 2;
        if (player.challenges.active === 0) { base **= 0.5; }
        return base;
    },
    /** Result need to be divided by 10 */
    S1Upgrade6: (): number => 10 + 3 * player.researches[1][0],
    /** Preons default value is false */
    S1Upgrade7: (preons = false): number => {
        let base = 2 + player.researches[1][1];
        if (preons) { base *= 1.6; }
        return (base + 100) / 100;
    },
    S1Research2: (level = player.strangeness[1][1]): number => 20 + (level * (player.inflation.vacuum ? 1.5 : 1)),
    S1Research5: (): number => {
        const discharges = global.dischargeInfo.total;
        if (!player.inflation.vacuum) { return discharges > 5 ? discharges + 15 : discharges * 4; }
        return discharges > 7 ? discharges + 14 : discharges * 3;
    },
    S1Extra1: (level = player.researchesExtra[1][1]): number => level >= 4 ? 1.1 : level >= 3 ? 1.2 : (20 - 3 * level) / 10,
    S1Extra3: (level = player.researchesExtra[1][3]): number => level / 20,
    S1Extra4: (): number => (100 + global.dischargeInfo.base + Math.max(player.discharge.energy, 1) ** 0.1) / 100,
    /* Submerged Stage */
    clouds: (post = false): Overlimit => {
        const effect = new Overlimit(player.vaporization.clouds).plus('1');
        if (post) { effect.plus(global.vaporizationInfo.get); }

        if (effect.moreThan('1e4')) { effect.minus('1e4').power(0.7).plus('1e4'); }
        return effect;
    },
    S2Upgrade1: (): Overlimit => {
        const puddles = player.buildings[2][2];
        const maxTrue = Math.min(puddles.true, 200);
        return new Overlimit('1.02').power((puddles.current.toNumber() - maxTrue) ** 0.7 + maxTrue);
    },
    S2Upgrade2: (): number => 1e10 / (player.inflation.vacuum ? 2.5 : 2) ** player.strangeness[2][3],
    /** Research is player.researches[2][2] */
    S2Upgrade3: (research = player.researches[2][2]): number => (1 + research / 2) / 100,
    /** Research is player.researches[2][3] */
    S2Upgrade4: (research = player.researches[2][3]): number => (1 + research / 2) / 100,
    S2Upgrade5: (): number => 1 + player.researches[2][4],
    S2Upgrade6: (): number => 1 + player.researches[2][5],
    /** Level is global.vaporizationInfo.trueResearchRain if used for production and player.researchesExtra[2][1] if for automatization */
    S2Extra1: (level: number, post = false): number => { //+^0.05 per level; Drops up to +^(0.05 / 3) after softcap
        if (level <= 0) { return 1; }
        const effect = new Overlimit(player.vaporization.clouds);
        if (post) { effect.plus(global.vaporizationInfo.get); }
        return Math.max(new Overlimit(effect).power(level / 60).multiply(effect.min('1e6').power(level / 30)).toNumber(), 1);
    },
    /** Rain is calculateEffects.S2Extra1() */
    S2Extra2: (rain: number, level = player.researchesExtra[2][2]): number => level >= 1 ? (rain - 1) / 32 + 1 : 1,
    /* Accretion Stage */
    submersion: (): number => {
        const drops = new Overlimit(player.buildings[2][1].current).plus('1');
        return new Overlimit(drops).power(0.6).divide(drops.min('1e10').power(0.4)).plus('1').log(2).toNumber(); //^0.2 before softcap, ^0.6 after
    },
    S3Upgrade0: (): number => (101 + player.researches[3][1]) / 100,
    /** Research is player.researchesExtra[3][3] */
    S3Upgrade1: (research = player.researchesExtra[3][3]): number => {
        const power = (11 + research) / 100; //2 times stronger for self-made dust
        return Math.max(new Overlimit(player.buildings[3][1].current).power(power).multiply((player.buildings[3][1].true + 1) ** power).toNumber(), 1);
    },
    S3Upgrade3: (): number => (204 + player.researches[3][4]) / 200, //1.02 + 0.005
    S3Research6: (level = player.researches[3][6]): number => { //+^0.025 per level; Drops up to +^(0.025 / 3) after softcap
        const mass = new Overlimit(player.buildings[3][0].current).max('1');
        return new Overlimit(mass).power(level / 120).multiply(mass.min('1e21').power(level / 60)).toNumber();
    },
    S3Extra1: (level = player.researchesExtra[3][1]): number => (100 + 11 * level) / 100,
    S3Extra4: (level = player.researchesExtra[3][4]): number => level > 0 ? 8 ** ((player.accretion.rank + level) / 8) : 1,
    /* Interstellar Stage */
    mass: (post = false): number => {
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
        (post = false): number => {
            let effect = player.collapse.stars[0] + 1;
            if (post) {
                effect += global.collapseInfo.starCheck[0];
            }
            if (player.elements[27] >= 1) { effect += player.buildings[4][3].true; }

            if (player.elements[6] >= 1) { effect **= calculateEffects.element6(); }
            return effect;
        },
        (post = false): number => {
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
        (post = false): number => {
            let blackHoles = player.collapse.stars[2];
            if (post) {
                blackHoles += global.collapseInfo.starCheck[2];
            }

            const base = player.elements[18] >= 1 ? 3 : 2;
            return (blackHoles + 1) / logAny(blackHoles + base, base);
        }
    ],
    /** Disc is player.researches[4][2] */
    S4Research0_base: (disc = player.researches[4][2]): number => (14 + disc) / 10,
    /** Base is calculateEffects.S4Research0_base() */
    S4Research0: (base: number): number => {
        let levels = player.researches[4][0];
        if (player.elements[19] >= 1) { levels++; }
        return base ** levels;
    },
    /** Transfer is player.researchesExtra[4][1] */
    S4Research1: (level = player.researches[4][1], transfer = player.researchesExtra[4][1]): number => {
        let effective = level > 0 ? 1 + Math.min(level, 4) : 0;
        if (level > 4) { effective += 0.5; }
        if (level > 5) { effective += Math.min(level - 5, 2) / 4; }
        if (level > 7) { effective += (level - 7) / 8; }
        return 1 + (transfer >= 1 ? 0.006 : 0.005) * effective;
    },
    S4Research4: (post = false, level = player.researches[4][4]): number => {
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
    S4Extra1: (): number => (10 + player.researches[4][1]) / 10,
    /* Intergalactic Stage */
    reward: [
        () => player.merge.reward[0] + 1
    ],
    S5Upgrade0: (): number => 3 * ((player.inflation.vacuum ? 1.6 : 1.8) ** player.strangeness[5][1]),
    S5Upgrade1: (): number => 2 * ((player.inflation.vacuum ? 1.6 : 1.8) ** player.strangeness[5][1]),
    S5Upgrade2: (post = false, level = player.upgrades[5][2]): number => {
        if (level < 1) { return 0; }
        let effect = player.collapse.mass;
        if (post) {
            if (global.collapseInfo.newMass > effect) { effect = global.collapseInfo.newMass; }
        }

        effect = Math.log10(Math.max(effect / 1e5, 1)) / 4 + 0.25;
        if (!player.inflation.vacuum) { effect *= 2; }
        return Math.min(effect, 1);
    },
    /* Rest */
    element6: (): number => player.researchesExtra[4][2] >= 1 ? 2 : 1.5,
    element24: (): number => player.elements[27] >= 1 ? 0.02 : 0.01,
    element26: (): number => {
        if (player.stage.true < 6 && player.strange[0].total < 1) { return 0; }
        let effect = new Overlimit(player.buildings[4][0].trueTotal).log(10).toNumber() - 48;
        if (player.elements[29] >= 1) { effect = (199 + effect) * effect / 200; }
        return Math.max(effect, 0);
    },
    S2Strange9: (): number => new Overlimit(player.vaporization.clouds).plus('1').log(10).toNumber() / 80 + 1,
    inflation1: (level = player.inflation.tree[1]): number => new Overlimit(player.buildings[6][0].current).plus('1').power(level / 32).toNumber(),
    /** Default value for type is 0 or Quarks; Use 1 for Strangelets */
    strangeGain: (interstellar: boolean, type = 0 as 0 | 1): number => {
        let base = type === 1 ? 0 : player.inflation.vacuum ?
            (player.strangeness[5][3] >= 1 ? 5 : 4) :
            (player.milestones[1][0] >= 6 ? 2 : 1);
        if (interstellar) {
            base = (base + calculateEffects.element26()) * (player.buildings[5][3].current.toNumber() + 1);
            if (player.inflation.vacuum && player.strangeness[2][9] >= 1) { base *= calculateEffects.S2Strange9(); }
        } else if (type === 1) { return 0; }
        if (type === 0) {
            base *= (1.4 ** player.strangeness[5][2]) * (1.4 ** player.inflation.tree[2]);
        } else if (type === 1) {
            if (player.inflation.tree[3] >= 1 && player.strangeness[5][8] >= 1) { base *= 1.4 ** player.strangeness[5][2]; }
            if (player.inflation.tree[3] >= 2) { base *= 1.4 ** player.inflation.tree[2]; }
        }
        return base * global.strangeInfo.strangeletsInfo[1];
    }
};

export const assignBuildingInformation = () => {
    const { buildings, upgrades, researches, researchesExtra, elements, strangeness } = player;
    const { dischargeInfo } = global;
    const producing = global.buildingsInfo.producing;
    const stageBoost = global.strangeInfo.stageBoost;
    const activeAll = global.stageInfo.activeAll;
    const vacuum = player.inflation.vacuum;
    const inVoid = player.challenges.active === 0;

    const energy = Math.max(player.discharge.energy, 1);
    const tension = upgrades[2][3] === 1 ? new Overlimit(buildings[2][0].current).max('1').power(calculateEffects.S2Upgrade3()).toNumber() : 1;
    const stress = upgrades[2][4] === 1 ? new Overlimit(buildings[2][1].current).max('1').power(calculateEffects.S2Upgrade4()).toNumber() : 1;

    if (activeAll.includes(1)) {
        const b3 = vacuum ? 3 : 1;
        const b4 = vacuum ? 4 : 2;
        const b5 = vacuum ? 5 : 3;

        dischargeInfo.total = player.discharge.current + (strangeness[1][3] / 2);
        dischargeInfo.base = calculateEffects.dischargeBase();
        let totalMultiplier = (vacuum ? 2 : 1.8) ** strangeness[1][0];
        if (upgrades[1][5] === 1) { totalMultiplier *= dischargeInfo.base ** dischargeInfo.total; }
        if (strangeness[1][6] >= 1) { totalMultiplier *= stageBoost[1]; }
        if (inVoid) { totalMultiplier /= 4; }
        const selfBoost = calculateEffects.S1Upgrade7();

        const listForMult5 = [buildings[1][b5].current];
        let prod5Number = 0.2 * totalMultiplier;
        if (upgrades[1][4] === 1) { prod5Number *= 4; }
        if (upgrades[1][7] === 1) { listForMult5.push(new Overlimit(selfBoost).power(buildings[1][b5].true)); }
        producing[1][b5].setValue(prod5Number).multiply(...listForMult5);

        let radiation = (calculateEffects.S1Research2() ** researches[1][2]) * (calculateEffects.S1Research5() ** researches[1][5]);
        if (upgrades[1][9] === 1) { radiation *= energy ** 0.5; }
        dischargeInfo.tritium.setValue(producing[1][b5]).plus('1').log(calculateEffects.S1Extra1()).multiply(radiation);

        const listForMult4 = [buildings[1][b4].current];
        let prod4Number = (vacuum ? 0.8 : 0.4) * totalMultiplier;
        if (upgrades[1][3] === 1) { prod4Number *= vacuum ? 6 : 4; }
        if (upgrades[1][7] === 1) { listForMult4.push(new Overlimit(selfBoost).power(buildings[1][b4].true)); }
        producing[1][b4].setValue(prod4Number).multiply(...listForMult4);

        const listForMult3 = [buildings[1][b3].current];
        let prod3Number = (vacuum ? 0.2 : 1.6) * totalMultiplier;
        if (upgrades[1][0] === 1) { prod3Number *= 8; }
        if (upgrades[1][7] === 1) { listForMult3.push(new Overlimit(selfBoost).power(buildings[1][b3].true)); }
        producing[1][b3].setValue(prod3Number).multiply(...listForMult3);

        if (vacuum) {
            const listForMult2 = [buildings[1][2].current];
            if (upgrades[1][7] === 1) { listForMult2.push(new Overlimit(selfBoost).power(buildings[1][2].true)); }
            producing[1][2].setValue(0.4 * totalMultiplier).multiply(...listForMult2);

            const listForMult1 = [];
            const preonsExcess = new Overlimit(buildings[1][1].current).minus(buildings[1][1].true);
            if (preonsExcess.moreThan('1')) {
                listForMult1.push(preonsExcess.power(0.11).plus(buildings[1][1].true));
            } else { listForMult1.push(buildings[1][1].current); }
            if (upgrades[1][7] === 1) { //Formula is '(selfPreons * step ** ((true - 1) / 2)) ** true'; Step is '(selfBoost / selfPreons) ** (1 / 500)'
                const selfPreons = calculateEffects.S1Upgrade7(true);
                listForMult1.push(new Overlimit(selfBoost / selfPreons).power((buildings[1][1].true - 1) / 1000).multiply(selfPreons).power(buildings[1][1].true));
            }
            producing[1][1].setValue(6e-4 * totalMultiplier).multiply(...listForMult1);
        }
    }
    if (activeAll.includes(2)) {
        const { vaporizationInfo } = global;
        if (vaporizationInfo.trueResearchRain !== researchesExtra[2][1]) { vaporizationInfo.trueResearchRain = researchesExtra[2][2] >= 1 ? researchesExtra[2][1] : Math.min(researchesExtra[2][1], new Overlimit(buildings[2][1].total).divide(1e12 / 999).plus('1').log(1e3).toNumber()); }
        const rain = calculateEffects.S2Extra1(vaporizationInfo.trueResearchRain);
        const flow = 1.24 ** strangeness[2][7];

        if (buildings[2][6].true >= 1) {
            producing[2][6].setValue(upgrades[2][8] === 1 ? '1.1' : '1.08').power(buildings[2][6].true).multiply(flow);
        } else { producing[2][6].setValue('1'); }

        producing[2][5].setValue(2 * calculateEffects.S2Extra2(rain) * flow).multiply(buildings[2][5].current, producing[2][6]).max('1');

        producing[2][4].setValue(2 * flow).multiply(buildings[2][4].current, producing[2][5]).max('1');

        producing[2][3].setValue(2 * flow).multiply(buildings[2][3].current, producing[2][4]).max('1');

        if (vaporizationInfo.trueResearch1 !== researches[2][1]) { vaporizationInfo.trueResearch1 = Math.min(researches[2][1], new Overlimit(buildings[2][1].total).divide('1e2').plus('1').log(5).toNumber()); }
        if (buildings[2][2].current.lessThan('1')) {
            producing[2][2].setValue(calculateEffects.S2Extra1(researchesExtra[2][1]) - 1);
        } else {
            const listForMult2 = [buildings[2][2].current, producing[2][3], calculateEffects.clouds()];
            let prod2Number = (inVoid ? 6e-4 : 4.8) * tension * stress * (2 ** vaporizationInfo.trueResearch1) * rain * ((vacuum ? 1.8 : 1.6) ** strangeness[2][1]);
            if (upgrades[2][1] === 1) { listForMult2.push(calculateEffects.S2Upgrade1()); }
            if (vacuum) {
                prod2Number *= calculateEffects.S3Extra4();
                if (elements[1] >= 1) { prod2Number *= 2; }
            }
            if (strangeness[2][6] >= 1) { prod2Number *= stageBoost[2]; }
            producing[2][2].setValue(prod2Number).multiply(...listForMult2);
        }

        const dropsEffective = new Overlimit(buildings[2][1].current);
        if (inVoid) {
            dropsEffective.min(1);
        } else if (vacuum) {
            const excess = new Overlimit(dropsEffective).minus(buildings[2][1].true);
            if (excess.moreThan('1')) { dropsEffective.setValue(excess.power(0.2).plus(buildings[2][1].true)); }
        }
        const listForMult1 = [dropsEffective];
        if (upgrades[2][0] === 1) { listForMult1.push(new Overlimit(vacuum ? '1.02' : '1.04').power(buildings[2][1].true)); }
        if (vaporizationInfo.trueResearch0 !== researches[2][0]) {
            vaporizationInfo.trueResearch0 = Math.min(researches[2][0], Math.max(
                new Overlimit(buildings[2][1].total).divide('1e1').log(1.366).toNumber() + 1, //To make getting first level faster
                new Overlimit(buildings[2][1].total).divide(10 / 0.366).plus('1').log(1.366).toNumber() //Can be negative
            ));
        }
        producing[2][1].setValue((vacuum ? 2 : 8e-4) * (3 ** vaporizationInfo.trueResearch0) * (2 ** strangeness[2][0])).multiply(...listForMult1);
    } else if (vacuum) { producing[2][1].setValue('1'); }
    if (activeAll.includes(3)) {
        const { accretionInfo } = global;
        const weathering = (vacuum ? 1.48 : 1.6) ** strangeness[3][1];
        producing[3][5].setValue('1.1').power(buildings[3][5].true);

        producing[3][4].setValue(upgrades[3][12] === 1 ? '1.14' : '1.1').power(buildings[3][4].true).multiply(producing[3][5]);
        const satellitesBoost = strangeness[3][3] < 1 ? new Overlimit('1') : new Overlimit(producing[3][4]).power(vacuum ? 0.1 : 0.2);

        const listForMult3 = [buildings[3][3].current, producing[3][4]];
        let prod3Number = 0.4 * weathering;
        if (researchesExtra[3][2] >= 1) { prod3Number *= 2; }
        if (upgrades[3][7] === 1) { listForMult3.push(new Overlimit('1.02').power(buildings[3][3].true)); }
        producing[3][3].setValue(prod3Number).multiply(...listForMult3);

        const listForMult2 = [buildings[3][2].current, satellitesBoost];
        let prod2Number = (3 ** researches[3][2]) * weathering;
        if (upgrades[3][3] === 1) { listForMult2.push(new Overlimit(calculateEffects.S3Upgrade3()).power(buildings[3][2].true)); }
        if (upgrades[3][4] === 1) { prod2Number *= 3; }
        if (researches[3][6] >= 1) { prod2Number *= calculateEffects.S3Research6(); }
        producing[3][2].setValue(prod2Number).multiply(...listForMult2);

        const listForMult1 = [buildings[3][1].current, satellitesBoost];
        let prod1Number = (vacuum ? 2 : 8e-20) * (3 ** researches[3][0]) * (2 ** researches[3][3]) * (3 ** researches[3][5]) * (1.11 ** researchesExtra[3][0]) * (calculateEffects.S3Extra1() ** player.accretion.rank) * (1.8 ** strangeness[3][0]);
        if (vacuum) {
            prod1Number *= calculateEffects.submersion();
            if (elements[4] >= 1) { prod1Number *= 1.4; }
            if (elements[14] >= 1) { prod1Number *= 1.4; }
        }
        if (upgrades[3][0] === 1) { listForMult1.push(new Overlimit(calculateEffects.S3Upgrade0()).power(buildings[3][1].true)); }
        if (upgrades[3][1] === 1) { prod1Number *= calculateEffects.S3Upgrade1(); }
        if (upgrades[3][2] === 1) { prod1Number *= 2; }
        if (upgrades[3][5] === 1) { prod1Number *= 3; }
        if (upgrades[3][6] === 1) { prod1Number *= 2 * 1.5 ** researches[3][7]; }
        if (upgrades[3][9] === 1) { prod1Number *= 2; }
        if (upgrades[3][10] === 1) { prod1Number *= 8 * 2 ** researches[3][8]; }
        producing[3][1].setValue(prod1Number).multiply(...listForMult1);
        if (inVoid) {
            accretionInfo.dustSoft = player.accretion.rank >= 5 ? 0.8 : 0.9;
        } else if (player.accretion.rank >= 5) {
            accretionInfo.dustSoft = vacuum || producing[3][1].moreThan('1') ? 0.9 : 1.1;
        } else { accretionInfo.dustSoft = 1; }
        producing[3][1].power(accretionInfo.dustSoft);
    } else if (vacuum) { producing[3][1].setValue('1'); }
    if (activeAll.includes(4)) {
        const { collapseInfo } = global;
        collapseInfo.neutronEffect = calculateEffects.star[1]();
        const massEffect = calculateEffects.mass();
        const listForTotal = [new Overlimit(calculateEffects.S4Research1()).power(collapseInfo.trueStars)];
        let totalNumber = calculateEffects.S4Research0(calculateEffects.S4Research0_base()) * massEffect * collapseInfo.neutronEffect * calculateEffects.S4Research4() * (1.6 ** strangeness[4][0]);
        if (elements[4] >= 1) { totalNumber *= 1.4; }
        if (elements[14] >= 1) { totalNumber *= 1.4; }
        if (elements[24] >= 1) { totalNumber *= new Overlimit(buildings[4][0].current).max('1').power(calculateEffects.element24()).toNumber(); }
        if (vacuum) {
            if (researchesExtra[1][4] >= 1) { totalNumber *= calculateEffects.S1Extra4() ** dischargeInfo.total; }
            if (researchesExtra[2][3] >= 1) { totalNumber *= tension; }
            if (researchesExtra[2][3] >= 3) {
                totalNumber *= stress;
            } else if (researchesExtra[2][3] >= 2) { totalNumber *= stress ** 0.5; }
        }
        if (strangeness[4][7] >= 1) { totalNumber *= stageBoost[4]; }
        if (inVoid) { totalNumber /= 8000; }
        const totalMultiplier = new Overlimit(totalNumber).multiply(...listForTotal);

        producing[4][5].setValue(inVoid ? '0' : '2e11').multiply(buildings[4][5].current, totalMultiplier);

        producing[4][4].setValue('6e9').multiply(buildings[4][4].current, totalMultiplier);

        producing[4][3].setValue('6e7').multiply(buildings[4][3].current, totalMultiplier);

        producing[4][2].setValue(1200 * calculateEffects.star[0]() * (2 ** researches[4][3])).multiply(buildings[4][2].current, totalMultiplier);

        let prod1Number = 40;
        if (elements[1] >= 1) { prod1Number *= 2; }
        if (elements[19] >= 1 && massEffect > 1) { prod1Number *= massEffect; }
        producing[4][1].setValue(prod1Number).multiply(buildings[4][1].current, totalMultiplier);
    }
    if (activeAll.includes(5)) {
        const clusterProd = producing[5][2];

        const prod3Number = (vacuum ? 2 : 6) + calculateEffects.S5Upgrade2();
        producing[5][3].setValue(prod3Number).power(buildings[5][3].true);
        const currentGalaxies = buildings[5][3].current.toNumber();
        if (currentGalaxies > 0) { producing[5][3].multiply(((currentGalaxies + 1) / (buildings[5][3].true + 1)) * calculateEffects.reward[0]()); }
        global.mergeInfo.galaxyBase = prod3Number;

        const biggerStructures = (vacuum ? 1.4 : 1.6) ** player.strangeness[5][0];
        const listForMult2 = [buildings[5][2].current, producing[5][3]];
        let prod2Number = 2 * (2 ** researches[5][1]) * biggerStructures;
        if (upgrades[5][1] === 1) { prod2Number *= calculateEffects.S5Upgrade1(); }
        clusterProd.setValue(prod2Number).multiply(...listForMult2).max('1');

        const listForMult1 = [buildings[5][1].current, producing[5][3]];
        let prod1Number = 6 * (2 ** researches[5][0]) * biggerStructures;
        if (upgrades[5][0] === 1) { prod1Number *= calculateEffects.S5Upgrade0(); }
        producing[5][1].setValue(prod1Number).multiply(...listForMult1);

        if (vacuum) {
            producing[4][5].multiply(clusterProd);
            if (researches[5][1] >= 1 && clusterProd.moreThan('2')) { producing[4][4].multiply(clusterProd).divide('2'); }
            if (researches[5][1] >= 2 && clusterProd.moreThan('4')) { producing[4][3].multiply(clusterProd).divide('4'); }
            if (researches[5][1] >= 3 && clusterProd.moreThan('8')) { producing[4][2].multiply(clusterProd).divide('8'); }
            if (researches[5][1] >= 4 && clusterProd.moreThan('16')) { producing[4][1].multiply(clusterProd).divide('16'); }
        } else {
            producing[4][4].multiply(clusterProd);
            if (researches[5][1] >= 1 && clusterProd.moreThan('2')) { producing[4][3].multiply(clusterProd).divide('2'); }
            if (researches[5][1] >= 2 && clusterProd.moreThan('4')) { producing[4][2].multiply(clusterProd).divide('4'); }
            if (researches[5][1] >= 3 && clusterProd.moreThan('8')) { producing[4][1].multiply(clusterProd).divide('8'); }
        }
    }
    if (activeAll.includes(6)) {
        if (buildings[6][1].current.moreThan('0')) {
            producing[6][1].setValue(buildings[6][1].current).power(buildings[6][1].true);
        } else { producing[6][1].setValue('0'); }
    }
    if (vacuum) {
        const inflationInfo = global.inflationInfo;
        const laterPreons = energy ** calculateEffects.S1Extra3();
        inflationInfo.preonTrue.setValue(producing[1][1].multiply(laterPreons));
        inflationInfo.dustTrue.setValue(producing[3][1].max('1'));
        dischargeInfo.tritium.multiply(producing[2][1].max('1'));

        const accretionMass = calculateMassGain();
        inflationInfo.dustCap.setValue((player.accretion.rank >= 5 ? 1e48 : 8e46) * accretionMass * (1.4 ** strangeness[3][8]));
        if (producing[3][1].moreThan(inflationInfo.dustCap)) { producing[3][1].setValue(inflationInfo.dustCap); }

        let microworldMass = calculateEffects.star[2](); //Should be fine even without Interstellar
        if (elements[10] >= 1) { microworldMass *= 2; }
        if (researchesExtra[4][1] >= 1) { microworldMass *= calculateEffects.S4Extra1(); }
        inflationInfo.preonCap.setValue(1e14 * laterPreons * microworldMass).multiply(producing[3][1]);
        if (producing[1][1].moreThan(inflationInfo.preonCap)) { producing[1][1].setValue(inflationInfo.preonCap); }

        inflationInfo.massCap = 0.01235 * accretionMass * microworldMass;
        if (strangeness[5][7] >= 1) { inflationInfo.massCap *= stageBoost[5]; }
    }
};

export const buyBuilding = (index: number, stageIndex: number, howMany = player.toggles.shop.input, auto = false) => {
    if (!checkBuilding(index, stageIndex) || (!auto && global.paused)) { return; }
    const building = player.buildings[stageIndex][index as 1];

    let pointer; //For cost
    let currency;
    let free = false;
    let multi = true;
    let special = '' as '' | 'Moles' | 'Mass' | 'Galaxy' | 'Universe';
    if (stageIndex === 1) {
        pointer = player.buildings[1][index - 1];
        if (index === 1 && player.inflation.vacuum) { free = player.researchesExtra[1][2] >= 1 && player.strangeness[1][8] >= 1; }
    } else if (stageIndex === 2) {
        if (index === 1 && player.inflation.vacuum) {
            special = 'Moles';
            pointer = player.buildings[1][5];
            currency = new Overlimit(pointer.current).divide('6.02214076e23');
        } else { pointer = player.buildings[2][index === 1 ? 0 : 1]; }
    } else if (stageIndex === 3) {
        if (player.inflation.vacuum) {
            special = 'Mass';
            pointer = player.buildings[1][0];
            currency = new Overlimit(pointer.current).multiply('1.78266192e-33');
        } else { pointer = player.buildings[3][0]; }
    } else if (stageIndex === 6) {
        pointer = player.buildings[6][index - 1]; //Placeholder
        currency = player.merge.reward[0];
        special = 'Universe';
        multi = false;
    } else {
        pointer = player.buildings[4][0];
        if (stageIndex === 5 && index === 3) {
            special = 'Galaxy';
            currency = player.collapse.mass;
            multi = false;
        }
    }
    if (currency === undefined) { currency = new Overlimit(pointer.current); }

    const budget = new Overlimit(currency);
    if (auto && building.true >= 1 && !free && multi) {
        if (special === 'Mass' && player.strangeness[1][8] >= 2 && player.accretion.rank >= 6 && global.inflationInfo.dustTrue.moreOrEqual(global.inflationInfo.dustCap)) {
            budget.minus(global.inflationInfo.massCap * 1.98847e33);
        } else {
            budget.divide(player.stage.true >= 3 ? player.toggles.shop.wait[stageIndex] : '2');
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

            if (special === 'Moles') {
                pointer.current = currency.multiply('6.02214076e23');
                player.buildings[2][0].current.setValue(pointer.current).divide('6.02214076e23');
            } else if (special === 'Mass') {
                pointer.current = currency.divide('1.78266192e-33');
                player.buildings[3][0].current.setValue(pointer.current).multiply('1.78266192e-33');
            } else {
                pointer.current = currency;
            }
        }

        if (player.inflation.vacuum || stageIndex === 1) { addEnergy(afford, index, stageIndex); }
        if (stageIndex === 1) { //True vacuum only
            if (index === 5 && player.upgrades[1][8] === 0) { player.buildings[2][0].current.setValue(building.current).divide('6.02214076e23'); }
        } else if (stageIndex === 2) {
            if (index !== 1) { assignPuddles(); }
        } else if (stageIndex === 3) {
            if (index >= 4) { awardMilestone(1, 3); }
        } else if (stageIndex === 4) {
            global.collapseInfo.trueStars += afford;
        }

        assignBuildingInformation();
        if (!auto) {
            numbersUpdate();
            if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Made ${format(afford)} '${global.buildingsInfo.name[stageIndex][index]}'`; }
        }
    } else if (special === 'Galaxy') {
        reset('galaxy', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [4, 5]);
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(1, 4, 'researches');
        calculateMaxLevel(2, 4, 'researches');
        awardVoidReward(5);
        awardMilestone(1, 5);
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Caused Galaxy reset to gain ${format(afford)} new 'Galaxies'`; }
    } else if (special === 'Universe') {
        if (player.stage.true < 7) { player.stage.true = 7; }
        if ((player.toggles.normal[0] && global.tab !== 'inflation') || player.stage.active !== 6) { setActiveStage(1); }
        const time = player.time.universe;
        const income = building.true;
        player.cosmon.current += income;
        player.cosmon.total += income;
        player.inflation.vacuum = false;
        player.inflation.age = 0;
        player.time.universe = 0;
        player.inflation.resets++;
        const info = global.milestonesInfoS6;
        const start = info.active.indexOf(false);
        if (start >= 0) {
            for (let i = start; i < info.requirement.length; i++) {
                info.active[i] = building.current.moreOrEqual(info.requirement[i]);
            }
        }
        prepareVacuum(false);
        resetVacuum();

        const history = player.history.vacuum;
        const storage = global.historyStorage.vacuum;
        storage.unshift([time, true, income]);
        if (storage.length > 100) { storage.length = 100; }
        if (income / time > history.best[2] / history.best[0]) {
            history.best = [time, true, income];
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
    const buildingsInfo = global.buildingsInfo;

    let firstCost = buildingsInfo.startCost[stageIndex][index];
    if (stageIndex === 1) {
        let increase = 140;
        if (player.upgrades[1][6] === 1) { increase -= calculateEffects.S1Upgrade6(); }
        buildingsInfo.increase[1][index] = increase / 100;

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
            buildingsInfo.increase[3][4] = player.upgrades[3][11] === 1 ? 5 : 10;
        }
    } else if (stageIndex === 4) {
        let increase = 125 + 15 * index;
        if (player.elements[2] >= 1) { increase -= 10; }
        if (player.elements[8] >= 1) { increase -= 5; }
        buildingsInfo.increase[4][index] = increase / 100;

        firstCost /= 2 ** player.strangeness[4][1];
        if (player.researchesExtra[4][3] >= 1) { firstCost /= global.collapseInfo.neutronEffect; }
        if (player.elements[13] >= 1) { firstCost /= 100; }
    }

    return new Overlimit(buildingsInfo.increase[stageIndex][index]).power(player.buildings[stageIndex][index as 1].true).multiply(firstCost);
};

export const assignPuddles = () => {
    const buildings = player.buildings[2];
    const upgrades = player.upgrades[2];

    let water5 = buildings[5].true;
    let water4 = buildings[4].true;
    let water3 = buildings[3].true;
    let water2 = buildings[2].true;
    if (upgrades[8] === 1) { water5 += buildings[6].true; }
    if (upgrades[7] === 1) { water4 += water5; }
    if (upgrades[6] === 1) { water3 += water4 * calculateEffects.S2Upgrade6(); }
    if (upgrades[5] === 1) { water2 += water3 * calculateEffects.S2Upgrade5(); }
    buildings[5].current.setValue(water5);
    buildings[4].current.setValue(water4);
    buildings[3].current.setValue(water3);
    buildings[2].current.setValue(water2);
};

export const gainBuildings = (get: number, stageIndex: number, time: number) => {
    let stageGet = stageIndex;
    const add = new Overlimit(time);
    if (stageIndex === 1 && get === 5) {
        add.multiply(global.dischargeInfo.tritium);
        if (!player.inflation.vacuum) { get = 3; }
    } else if (stageIndex === 5) {
        add.multiply(global.buildingsInfo.producing[5][1]).divide(4 ** get);
        stageGet = 4;
        get++;
    } else {
        add.multiply(global.buildingsInfo.producing[stageIndex][get + 1]);
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
                awardMilestone(0, 3);
            } else if (get === 5) {
                player.buildings[2][0].current.setValue(building.current).divide('6.02214076e23');
            }
        }
    } else if (stageIndex === 3) {
        if (get === 0) { //False vacuum only
            if (player.accretion.rank < 5 && building.current.moreThan('1e30')) { building.current.setValue('1e30'); }
            awardMilestone(0, 3);
        }
    }
};

export const assignStrangeInfo = [
    () => { //[0] Quarks
        const vacuum = player.inflation.vacuum;
        const stageBoost = global.strangeInfo.stageBoost;
        const strangeQuarks = player.strange[0].current + 1;

        stageBoost[1] = strangeQuarks ** (vacuum ? 0.26 : 0.22);
        stageBoost[2] = strangeQuarks ** (vacuum ? 0.22 : 0.18);
        stageBoost[3] = strangeQuarks ** (vacuum ? 0.68 : 0.76);
        stageBoost[4] = strangeQuarks ** (player.elements[26] >= 1 ? 0.32 : 0.16);
        stageBoost[5] = strangeQuarks ** 0.06;
    }, () => { //[1] Strangelets
        const information = global.strangeInfo.strangeletsInfo;
        const strangelets = player.strange[1].current;

        information[0] = (Math.log2(strangelets + 2) - 1) / 100;
        information[1] = strangelets ** 0.4 / 80 + 1;
    }
];

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
    assignStrangeInfo[0]();
};

export const assignGlobalSpeed = () => {
    let speed = calculateEffects.inflation1();
    if (player.inflation.tree[0] >= 1) { speed *= 2; }
    global.inflationInfo.globalSpeed = speed;
};

export const buyUpgrades = (upgrade: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements', auto = false): boolean => {
    if (!auto && (!checkUpgrade(upgrade, stageIndex, type) || global.paused)) { //Auto should had already checked
        if (type === 'researchesAuto' && player.researchesAuto[upgrade] < global.researchesAutoInfo.max[upgrade]) {
            const autoStage = global.researchesAutoInfo.autoStage[upgrade][player.researchesAuto[upgrade]];
            if (!(autoStage === stageIndex || (autoStage === 4 && stageIndex === 5))) { switchStage(autoStage, stageIndex); }
        }
        return false;
    }

    let free = false;
    let currency: Overlimit;
    if (stageIndex === 1) {
        currency = new Overlimit(player.discharge.energy);
        if (player.inflation.vacuum) { free = player.accretion.rank >= 6 && player.strangeness[1][9] >= 1; }
    } else if (stageIndex === 2) {
        currency = new Overlimit(player.buildings[2][1].current);
    } else if (stageIndex === 3) {
        currency = player.inflation.vacuum ? new Overlimit(player.buildings[1][0].current).multiply('1.78266192e-33') : new Overlimit(player.buildings[3][0].current);
    } else if (stageIndex === 6) {
        currency = new Overlimit(player.buildings[6][0].current);
    } else {
        currency = new Overlimit(player.buildings[4][0].current);
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
            if (upgrade >= 5 /*&& upgrade < 9*/) { assignPuddles(); }
        } else if (stageIndex === 4 && upgrade === 1 && global.tab === 'upgrade') { switchTab('upgrade'); }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `New upgrade '${pointer.name[upgrade]}', has been created`; }
    } else if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];
        const level = player[type][stageIndex];

        if (level[upgrade] >= pointer.max[upgrade]) { return false; }
        let cost = pointer.cost[upgrade];
        if (currency.lessThan(cost)) { return false; }

        let newLevels = 1;
        if ((auto || (player.toggles.max[0] && player.stage.true >= 4)) && pointer.max[upgrade] > 1) {
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
                if (newLevels > 1) { cost = new Overlimit(scaling).power(newLevels).minus('1').divide(scaling - 1).multiply(cost).toNumber(); }
            }
        }

        level[upgrade] += newLevels;
        if (!free) { currency.minus(cost); }

        /* Special cases */
        if (type === 'researches') {
            if (stageIndex === 2) {
                if (upgrade >= 4 /*&& upgrade < 6*/) {
                    assignPuddles();
                }
            } else if (stageIndex === 4) {
                if (upgrade === 2 || upgrade === 3) {
                    calculateMaxLevel(0, 4, 'researches', true);
                }
            }
        } else if (type === 'researchesExtra') {
            if (stageIndex === 1) {
                if (upgrade === 2) {
                    let update: 'soft' | 'normal' = 'soft';
                    if (player.stage.current < 4) {
                        player.stage.current = player.researchesExtra[1][2] > 1 ? 2 : 3;
                        if (player.toggles.normal[0] && player.stage.active < 4) {
                            setActiveStage(player.stage.current);
                            update = 'normal';
                        }
                    }
                    stageUpdate(update, true);
                    awardVoidReward(1);
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
        if (type === 'researchesAuto' && upgrade === 1 && player.strangeness[4][6] >= 1) { effective = Math.max(effective - 1, 0); }
        const cost = pointer.costRange[upgrade][effective];
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
                    level[upgrade] = Math.max(level[upgrade] <= 1 && player.strangeness[3][4] < 1 ? 1 : level[upgrade] <= 2 && player.strangeness[2][4] < 1 ? 2 : level[upgrade] <= 3 && player.strangeness[4][4] < 1 ? 3 : 4, level[upgrade]);
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
        level = player.researchesAuto[1] >= 1 || level === 0.5 ? 1 : 0.5;
        player.elements[upgrade] = level;

        /* Special cases */
        if (player.collapse.show < upgrade) { player.collapse.show = upgrade; }
        if (level === 1) {
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
                    player.events[0] = false;
                    visualTrueStageUnlocks();
                }
                if (player.toggles.normal[0] && player.stage.active === 4 && (!player.inflation.vacuum || player.strangeness[5][3] >= 1)) {
                    setActiveStage(5);
                    stageUpdate('normal', true);
                } else { stageUpdate('soft', true); }
                assignStrangeInfo[0]();
                awardVoidReward(5);
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
            drops.current = currency;

            if (drops.current.lessThan(old) && player.buildings[2][2].current.lessThan('1')) {
                drops.true = Math.floor(drops.current.toNumber());
                if (player.inflation.vacuum) {
                    addEnergy(drops.true - old, 1, 2);
                } else if (drops.current.lessOrEqual('0')) {
                    player.buildings[2][0].current.max('2.7753108348135e-3');
                }
            }
        } else if (stageIndex === 3) {
            if (player.inflation.vacuum) {
                player.buildings[1][0].current = currency.divide('1.78266192e-33');
                player.buildings[3][0].current.setValue(player.buildings[1][0].current).multiply('1.78266192e-33');
            } else { player.buildings[3][0].current = currency; }
        } else if (stageIndex === 6) {
            player.buildings[6][0].current = currency;
        } else {
            player.buildings[4][0].current = currency;
        }
    }

    assignBuildingInformation();
    if (type === 'upgrades' || type === 'elements') {
        visualUpdateUpgrades(upgrade, stageIndex, type);
    } else {
        if (type !== 'researchesAuto' && type !== 'ASR') { calculateResearchCost(upgrade, stageIndex, type); }
        visualUpdateResearches(upgrade, stageIndex, type);
    }
    if (!auto) { numbersUpdate(); }
    return true;
};

export const buyStrangeness = (upgrade: number, stageIndex: number, type: 'strangeness' | 'inflation', auto = false): boolean => {
    if (!auto && (!checkUpgrade(upgrade, stageIndex, type) || global.paused)) { return false; }

    if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        if (player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade]) { return false; }
        if (player.strange[0].current < pointer.cost[upgrade]) { return false; }

        player.strangeness[stageIndex][upgrade]++;
        player.strange[0].current -= pointer.cost[upgrade];

        /* Special cases */
        if (stageIndex === 1) {
            if (upgrade === 4) {
                if (player.researchesAuto[2] < 1 && (player.inflation.vacuum || player.stage.current === 1)) {
                    player.researchesAuto[2] = player.inflation.vacuum ? (player.strangeness[3][4] < 1 ? 1 : player.strangeness[2][4] < 1 ? 2 : player.strangeness[4][4] < 1 ? 3 : 4) : 1;
                    visualUpdateResearches(2, 0, 'researchesAuto');
                }
            } else if (upgrade === 5) {
                player.ASR[1] = global.ASRInfo.max[1];
                visualUpdateResearches(0, 1, 'ASR');
            } else if (upgrade === 7) {
                assignTrueEnergy();
            }
        } else if (stageIndex === 2) {
            if (upgrade === 2) {
                calculateMaxLevel(4, 2, 'researches', true);
                calculateMaxLevel(5, 2, 'researches', true);
            } else if (upgrade === 4) {
                if (player.inflation.vacuum ? player.researchesAuto[2] === 2 : (player.researchesAuto[2] < 1 && player.stage.current === 2)) {
                    player.researchesAuto[2] = player.inflation.vacuum ? (player.strangeness[4][4] < 1 ? 3 : 4) : 1;
                    visualUpdateResearches(2, 0, 'researchesAuto');
                }
            } else if (upgrade === 5) {
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
                if (player.inflation.vacuum ? player.researchesAuto[2] === 1 : (player.researchesAuto[2] < 1 && player.stage.current === 3)) {
                    player.researchesAuto[2] = player.inflation.vacuum ? (player.strangeness[2][4] < 1 ? 2 : player.strangeness[4][4] < 1 ? 3 : 4) : 1;
                    visualUpdateResearches(2, 0, 'researchesAuto');
                }
            } else if (upgrade === 5) {
                player.ASR[3] = global.ASRInfo.max[3];
                visualUpdateResearches(0, 3, 'ASR');
            } else if (upgrade === 6) {
                if (player.researchesAuto[0] < player.strangeness[3][6]) {
                    player.researchesAuto[0] = player.strangeness[3][6];
                    visualUpdateResearches(0, 0, 'researchesAuto');
                }
            } else if (upgrade === 9) {
                global.debug.rankUpdated = null;
                assignMaxRank();
            }
        } else if (stageIndex === 4) {
            if (upgrade === 4) {
                if (player.inflation.vacuum ? player.researchesAuto[2] === 3 : (player.researchesAuto[2] < 1 && player.stage.current >= 4)) {
                    player.researchesAuto[2] = player.inflation.vacuum ? 4 : 1;
                    visualUpdateResearches(2, 0, 'researchesAuto');
                }
            } else if (upgrade === 5) {
                player.ASR[4] = global.ASRInfo.max[4];
                visualUpdateResearches(0, 4, 'ASR');
            } else if (upgrade === 6) {
                if (player.researchesAuto[1] < player.strangeness[4][6]) {
                    player.researchesAuto[1] = player.strangeness[4][6];
                    visualUpdateResearches(1, 0, 'researchesAuto');
                }
                for (let i = 1; i < playerStart.elements.length; i++) {
                    i = player.elements.indexOf(0.5, i);
                    if (i < 1) { break; }
                    buyUpgrades(i, 4, 'elements', true);
                }
            } else if (upgrade === 8) {
                if (player.elements[0] < 1) {
                    player.elements[0] = 1;
                    visualUpdateUpgrades(0, 4, 'elements');
                }
            }
        } else if (stageIndex === 5) {
            if (upgrade === 3) {
                if (player.inflation.vacuum) { stageUpdate('soft', true); }
            } else if (upgrade === 4) {
                if (player.strangeness[5][5] >= 1) {
                    player.ASR[5] = global.ASRInfo.max[5];
                    visualUpdateResearches(0, 5, 'ASR');
                }
            } else if (upgrade === 5) {
                player.ASR[5] = player.strangeness[5][4] >= 1 ? global.ASRInfo.max[5] : 2;
                visualUpdateResearches(0, 5, 'ASR');
            }
        }
        assignStrangeInfo[0]();
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(player.strangeness[stageIndex][upgrade])} for '${pointer.name[upgrade]}' Strangeness from ${global.stageInfo.word[stageIndex]} section`; }
    } else if (type === 'inflation') {
        const pointer = global.inflationTreeInfo;

        if (player.inflation.tree[upgrade] >= pointer.max[upgrade]) { return false; }
        if (player.cosmon.current < pointer.cost[upgrade]) { return false; }

        player.inflation.tree[upgrade]++;
        player.cosmon.current -= pointer.cost[upgrade];

        /* Special cases */
        if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Strength of Inflation Research '${pointer.name[upgrade]}' increased ${player.inflation.tree[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(player.inflation.tree[upgrade])}`; }
    }

    assignBuildingInformation();
    calculateResearchCost(upgrade, stageIndex, type);
    if (type === 'inflation') {
        visualUpdateInflation(upgrade);
    } else {
        visualUpdateResearches(upgrade, stageIndex, type);
    }
    if (!auto) { numbersUpdate(); }
    return true;
};

export const inflationRefund = async() => {
    const { tree } = player.inflation;
    const cosmon = player.cosmon;
    if ((cosmon.current === cosmon.total && tree[0] < 1) || !await Confirm('This will cause Stage reset to refund spended Cosmon\nContinue?')) { return; }
    stageFullReset();

    cosmon.current = cosmon.total;
    for (let i = 0; i < playerStart.inflation.tree.length; i++) {
        tree[i] = 0;
        calculateResearchCost(i, 0, 'inflation');
    }
    visualUpdateInflation();

    /* Special cases */
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Cosmon has been refunded'; }
};

//Currently can't allow price to be more than 2**1024. Because missing sorting function for numbers that big
export const calculateResearchCost = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'strangeness' | 'inflation') => {
    if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];

        pointer.cost[research] = stageIndex === 1 ?
            pointer.startCost[research] + pointer.scaling[research] * player[type][stageIndex][research] :
            pointer.startCost[research] * pointer.scaling[research] ** player[type][stageIndex][research];
    } else if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        pointer.cost[research] = player.inflation.vacuum ?
            Math.floor(Math.round((pointer.startCost[research] * pointer.scaling[research] ** player.strangeness[stageIndex][research]) * 100) / 100) :
            Math.floor(Math.round((pointer.startCost[research] + pointer.scaling[research] * player.strangeness[stageIndex][research]) * 100) / 100);
    } else if (type === 'inflation') {
        const pointer = global.inflationTreeInfo;

        pointer.cost[research] = Math.floor(Math.round((pointer.startCost[research] + pointer.scaling[research] * player.inflation.tree[research]) * 100) / 100);
    }
};

export const calculateMaxLevel = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'strangeness', addAuto = false) => {
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
            }
        } else if (stageIndex === 5) {
            if (research === 0) {
                max = player.inflation.vacuum ? 4 : 3;
            } else if (research === 1) {
                max = player.inflation.vacuum ? 4 : 3;
            }
        }
    } else if (type === 'researchesExtra') {
        if (stageIndex === 3) {
            if (research === 0) {
                max = 14 + (2 * player.accretion.rank);
                if (player.strangeness[3][2] >= 1) { max += 6; }
            } else if (research === 1) {
                max = 6;
                if (player.strangeness[3][2] >= 2) { max += 2; }
            } else if (research === 4) {
                max = player.accretion.rank - 2;
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
                max = player.inflation.vacuum || global.milestonesInfoS6.active[2] || player.milestones[4][0] >= 8 ? 2 : 1;
            }
        } else if (stageIndex === 5) {
            if (research === 2) {
                max = 2;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 6) {
                max = !player.inflation.vacuum && player.milestones[5][0] >= 8 ? 2 : 1;
            }
        }
    }
    if (max !== null) {
        if (max < 0) { max = 0; }
        if (type === 'researchesAuto' || type === 'ASR') {
            global[`${type}Info`].max[type === 'ASR' ? stageIndex : research] = max;
        } else {
            global[`${type}Info`][stageIndex].max[research] = max;
        }
    }

    if (type !== 'researchesAuto' && type !== 'ASR') { calculateResearchCost(research, stageIndex, type); }
    visualUpdateResearches(research, stageIndex, type);
    if (addAuto && (type === 'researches' || type === 'researchesExtra')) { autoResearchesSet(type, [stageIndex, research]); }
};

export const autoUpgradesSet = (which: 'all' | number) => {
    if (!player.toggles.auto[5]) { return; }
    const auto = global.automatization.autoU;
    const level = player.upgrades;
    const pointer = global.upgradesInfo;

    if (which === 'all') {
        for (let s = 1; s <= 5; s++) {
            auto[s] = [];
            for (let i = 0; i < pointer[s].maxActive; i++) {
                if (level[s][i] < 1) {
                    auto[s].push(i);
                }
            }
            const startCost = pointer[s].startCost;
            auto[s].sort((a, b) => startCost[a] - startCost[b]);
        }
    } else if (typeof which === 'number') {
        auto[which] = [];
        for (let i = 0; i < pointer[which].maxActive; i++) {
            if (level[which][i] < 1) {
                auto[which].push(i);
            }
        }
        const startCost = pointer[which].startCost;
        auto[which].sort((a, b) => startCost[a] - startCost[b]);
    }
};

export const autoUpgradesBuy = (stageIndex: number) => {
    if (!player.toggles.auto[5] || player.researchesAuto[0] < 1) { return; }
    const auto = global.automatization.autoU[stageIndex];

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

//All = reset all of current active stages; As number means reset that stage only; As array means add [1] into stage [0] if it's not already inside
export const autoResearchesSet = (type: 'researches' | 'researchesExtra', which: 'all' | number | number[]) => {
    if (!player.toggles.auto[type === 'researches' ? 6 : 7]) { return; }
    const auto = global.automatization[type === 'researches' ? 'autoR' : 'autoE'];
    const level = player[type];
    const pointer = global[`${type}Info`];

    if (which === 'all') {
        for (let s = 1; s <= 5; s++) {
            auto[s] = [];
            const { max, cost } = pointer[s];
            for (let i = 0; i < pointer[s].maxActive; i++) {
                if (level[s][i] < max[i]) {
                    auto[s].push(i);
                }
            }
            auto[s].sort((a, b) => cost[a] - cost[b]);
        }
    } else if (typeof which === 'number') {
        auto[which] = [];
        const { max, cost } = pointer[which];
        for (let i = 0; i < pointer[which].maxActive; i++) {
            if (level[which][i] < max[i]) {
                auto[which].push(i);
            }
        }
        auto[which].sort((a, b) => cost[a] - cost[b]);
    } else {
        const [s, a] = which;
        if (pointer[s].max[a] > level[s][a]) {
            const { cost } = pointer[s];
            let newIndex;
            for (let i = 0; i < auto[s].length; i++) {
                if (auto[s][i] === a) { return; }
                if (newIndex === undefined && cost[a] < cost[auto[s][i]]) {
                    newIndex = i;
                }
            }
            if (newIndex !== undefined) {
                auto[s].splice(newIndex, 0, a);
            } else { auto[s].push(a); }
        }
    }
};

export const autoResearchesBuy = (type: 'researches' | 'researchesExtra', stageIndex: number) => {
    if (type === 'researches') {
        if (!player.toggles.auto[6] || player.researchesAuto[0] < 2) { return; }
    } else /*if (type === 'researchesExtra')*/ {
        if (!player.toggles.auto[7] || player.researchesAuto[0] < 3) { return; }
    }
    const auto = global.automatization[type === 'researches' ? 'autoR' : 'autoE'][stageIndex];
    const pointer = global[`${type}Info`][stageIndex];

    let sort = false;
    for (let i = 0; i < auto.length; i++) {
        if (!checkUpgrade(auto[i], stageIndex, type)) { continue; }
        const bought = buyUpgrades(auto[i], stageIndex, type, true);

        if (player[type][stageIndex][auto[i]] >= pointer.max[auto[i]]) {
            auto.splice(i, 1);
            i--;
        } else if (!bought) {
            if (pointer.cost[auto[i]] > pointer.cost[auto[i + 1]]) {
                sort = true;
                continue;
            }
            break;
        }
    }
    if (sort) { auto.sort((a, b) => pointer.cost[a] - pointer.cost[b]); }
};

export const autoElementsSet = () => {
    if (!player.toggles.auto[8]) { return; }

    const array = [];
    const elements = player.elements;
    for (let i = 1; i < (player.inflation.vacuum ? global.elementsInfo.startCost.length : 29); i++) {
        if (elements[i] < 1) { array.push(i); }
    }
    global.automatization.elements = array;
};

export const autoElementsBuy = () => {
    if (!player.toggles.auto[8] || player.researchesAuto[1] < 2) { return; }
    const auto = global.automatization.elements;
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
        if (global.paused) { return; }
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

const assignQuarksGain = () => {
    global.strangeInfo.quarksGain = calculateEffects.strangeGain(true);
};

export const stageResetCheck = (stageIndex: number, quarks = null as number | null): boolean => {
    if (stageIndex === 5) {
        assignQuarksGain(); //Also visually updates numbers
        if (quarks !== null) {
            if (player.elements[26] < 0.5) { return false; }

            const { stage } = player;
            const peakCheck = global.strangeInfo.quarksGain / player.time.stage;
            if (stage.peak < peakCheck) { stage.peak = peakCheck; }

            if (player.elements[26] < 1) { return false; }
            if (player.strange[1].current > 0) { gainStrange(quarks); }

            if (!player.toggles.auto[0] || player.strangeness[5][6] < (player.inflation.vacuum ? 1 : 2) || player.challenges.active !== null ||
                (stage.input[0] <= 0 && stage.input[1] <= 0) || stage.input[0] > global.strangeInfo.quarksGain || stage.input[1] > player.time.stage) { return false; }
            stageResetReward(stageIndex);
            return true;
        }
        return player.elements[26] >= 1;
    } else if (stageIndex === 3) {
        if (player.buildings[3][0].current.lessThan('2.45576045e31')) { return false; }
    } else if (stageIndex === 2) {
        if (player.buildings[2][1].current.lessThan('1.19444e29')) { return false; }
    } else if (stageIndex === 1) {
        if (player.buildings[1][3].current.lessThan('1.67133125e21')) { return false; }
    } else { return false; }

    if (quarks !== null) { //Just checks if auto
        if (player.strangeness[5][6] < 1) { return false; }
        if (player.toggles.normal[2]) { //False vacuum only
            const milestones = player.milestones[stageIndex];
            const max = global.milestonesInfo[stageIndex].max;
            for (let i = 0; i < max.length; i++) {
                if (milestones[i] < max[i]) { return false; }
            }
        }
        stageResetReward(stageIndex);
    }
    return true;
};
export const stageResetUser = async() => {
    if (global.paused) { return; }
    const active = player.inflation.vacuum || (player.stage.active === 4 && player.events[0]) ? 5 : player.stage.active;
    if (!stageResetCheck(active)) { return; }

    if (player.toggles.confirm[0] !== 'None') {
        let errorText = '';
        if (player.upgrades[5][3] === 1) {
            assignMergeReward();
            const universeCost = calculateBuildingsCost(1, 6);
            if (universeCost.lessOrEqual(player.merge.reward[0] + (calculateMergeMaxResets() < player.merge.resets ? global.mergeInfo.checkReward[0] : 0))) {
                errorText += `can create an Universe${universeCost.moreThan(player.merge.reward[0]) ? ' after Merge' : ''}`;
            }
        }
        if (player.researchesExtra[5][0] >= 1) {
            assignNewMass();
            const galaxyCost = calculateBuildingsCost(3, 5);
            if (galaxyCost.lessOrEqual(Math.max(player.collapse.mass, global.collapseInfo.newMass))) {
                if (errorText !== '') { errorText += '\nAlso '; }
                errorText += `can afford a Galaxy${galaxyCost.moreThan(player.collapse.mass) ? ' after Collapse' : ''}`;
            }
        }
        if (player.challenges.active !== null) {
            if (errorText !== '') { errorText += '\nAlso '; }
            errorText += `currently inside the ${global.challengesInfo.name[player.challenges.active]}`;
        }
        if (errorText !== '') {
            if (!await Confirm(`Prevented Stage reset because ${errorText}\nReset anyway?`)) { return; }
            if (!stageResetCheck(active)) { return Notify('Stage reset canceled, requirements are no longer met'); }
        }
    }
    if (globalSave.SRSettings[0]) {
        let message;
        if (player.stage.true >= 5) {
            message = `Caused Stage reset for ${format(active >= 4 ? global.strangeInfo.quarksGain : calculateEffects.strangeGain(false))} Strange quarks`;
            const strangelets = player.strangeness[5][8] >= 1 || player.inflation.tree[3] >= 1 ? calculateEffects.strangeGain(active >= 4, 1) : 0;
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
    let update: false | 'normal' | 'soft' = 'normal';
    const resetThese = player.inflation.vacuum ? [1, 2, 3, 4, 5] : [stageIndex];
    if (player.inflation.vacuum) {
        if (stage.active === 1 || stage.active >= 6) {
            update = 'soft';
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
            } else { update = 'soft'; }
            if (stage.current > stage.true) {
                stage.true = stage.current;
                player.events[0] = false;
                visualTrueStageUnlocks();
            }
        } else {
            stage.current = player.milestones[1][1] < 6 ? 1 : player.milestones[2][1] < 7 ? 2 : player.milestones[3][1] < 7 ? 3 : 4;
            if ((stage.active === 4 && stage.current !== 4) || stage.active === 5) {
                setActiveStage(stage.current);
            } else { update = 'soft'; }
            resetThese.unshift(4);
        }
        if (stage.true >= 7) { resetThese.push(6); }
    } else {
        update = stageIndex === stage.active ? 'soft' : false;
        fullReset = false;
    }

    if (stage.true >= 5) {
        const { strange } = player;
        const exportReward = player.time.export;
        const quarks = stageIndex >= 4 ? global.strangeInfo.quarksGain : calculateEffects.strangeGain(false);
        const strangelets = player.strangeness[5][8] >= 1 || player.inflation.tree[3] >= 1 ? calculateEffects.strangeGain(stageIndex >= 4, 1) : 0;
        strange[0].current += quarks;
        strange[0].total += quarks;
        if (strangelets > 0) {
            strange[1].current += strangelets;
            strange[1].total += strangelets;
            if (strangelets > exportReward[2]) { exportReward[2] = strangelets; }
            assignStrangeInfo[1]();
        }
        if (quarks > exportReward[1]) { exportReward[1] = quarks; }
        if (resetThese.includes(4)) { player.elements[26] = 0; } //Lazy fix for Strange boost
        assignStrangeInfo[0]();

        if (stageIndex >= 4) {
            const storage = global.historyStorage.stage;
            const realTime = player.time.stage;
            storage.unshift([realTime, quarks, strangelets, 0]);
            if (storage.length > 100) { storage.length = 100; }
            if (quarks / realTime > global.strangeInfo.bestHistoryRate) {
                player.history.stage.best = [realTime, quarks, strangelets, 0];
                global.strangeInfo.bestHistoryRate = quarks / realTime;
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
        let update = 'soft' as 'soft' | 'normal';
        if (vacuum) {
            if (player.stage.active !== 1 && player.stage.active < 6) {
                setActiveStage(1);
                update = 'normal';
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
            getId(`${global.stageInfo.word[stage]}Switch`).style.textDecoration = 'underline';
        }
        if (!global.paused) {
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
    getId(`${global.stageInfo.word[player.stage.active]}Switch`).style.textDecoration = '';
    player.stage.active = stage;
    global.trueActive = active;
    getId(`${global.stageInfo.word[stage]}Switch`).style.textDecoration = 'underline' + (global.trueActive !== stage ? ' dashed' : '');

    if (global.tab === 'inflation') {
        if (stage !== 6) { switchTab('upgrade'); }
    } else if (global.tab === 'Elements') {
        if (stage !== 4 && stage !== 5) { switchTab('upgrade'); }
    }
    if (global.tab === 'upgrade') {
        if (global.subtab.upgradeCurrent === 'Elements' && stage !== 4 && stage !== 5) { switchTab('upgrade', 'Upgrades'); }
    }
};

export const getDischargeScale = (): number => (20 - (4 * player.researches[1][3]) - player.strangeness[1][2]) / 2;
const assignDischargeCost = () => {
    global.dischargeInfo.next = Math.round(getDischargeScale() ** player.discharge.current);
};
export const assignEnergyArray = () => {
    if (!player.inflation.vacuum) {
        global.dischargeInfo.energyType[1] = [0, 1, 5, 20];
        return;
    }

    const energyArray = [
        [],
        [0, 1, 3, 5, 10, 20],
        [0, 20, 30, 40, 50, 60, 120],
        [0, 20, 40, 60, 120, 160],
        [0, 80, 160, 240, 320, 400],
        [0, 400, 400, 2000]
    ];

    for (let s = 1; s <= 5; s++) {
        for (let i = 1; i < energyArray[s].length; i++) {
            let value = energyArray[s][i];
            if (s === 1) {
                if (i === 1) { value += player.strangeness[1][7] * 2; }
            } else if (player.challenges.active === 0) { value /= 2; }
            energyArray[s][i] = value;
        }
    }
    global.dischargeInfo.energyType = energyArray;
};
export const assignTrueEnergy = () => {
    assignEnergyArray();
    const { dischargeInfo } = global;

    dischargeInfo.energyTrue = 0;
    for (let s = 1; s <= (player.inflation.vacuum ? 5 : 1); s++) {
        let add = 0;
        const buildings = player.buildings[s];
        const energyType = dischargeInfo.energyType[s];
        for (let i = 1; i < energyType.length; i++) {
            add += energyType[i] * buildings[i as 1].true;
        }
        dischargeInfo.energyStage[s] = add;
        dischargeInfo.energyTrue += add;
    }
};

export const dischargeResetCheck = (goals = false): boolean => {
    assignDischargeCost(); //Also visually updates numbers
    if (player.upgrades[1][5] !== 1) { return false; }
    const info = global.dischargeInfo;
    const energy = player.discharge.energy;
    const level = player.strangeness[1][4];

    if (goals) {
        if (level >= 2 && energy >= info.next) {
            dischargeReset(true);
            if (!player.toggles.auto[1]) { return false; }
            assignDischargeCost();
        } else if (!player.toggles.auto[1] || (level < 1 && (player.researchesAuto[2] < 1 || (!player.inflation.vacuum && player.stage.current !== 1)))) { return false; }

        if (energy >= info.energyTrue && (level >= 2 || energy < info.next)) { return false; }
        dischargeReset();
        return true;
    }
    return energy < info.energyTrue || (level < 2 && energy >= info.next);
};
export const dischargeResetUser = async() => {
    if (global.paused || !dischargeResetCheck()) { return; }

    if (player.toggles.confirm[1] !== 'None') {
        if (player.stage.active !== 1) {
            if (!await Confirm("Prevented Discharge because current active Stage isn't Microworld\nReset anyway?")) { return; }
            if (!dischargeResetCheck()) { return Notify('Discharge canceled, requirements are no longer met'); }
        }
    }

    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Caused Discharge to reset spent Energy${player.discharge.energy >= global.dischargeInfo.next ? ', also reached new goal' : ''}`; }
    dischargeReset();
};

const dischargeReset = (noReset = false) => {
    if (player.discharge.energy >= global.dischargeInfo.next) {
        player.discharge.current++;
        if (!noReset) { player.discharge.energy -= global.dischargeInfo.next; }
    }
    awardVoidReward(1);
    if (!noReset) { reset('discharge', [1]); }
};

const assignNewClouds = () => {
    const softcap = player.challenges.active === 0 ? 0.4 : player.inflation.vacuum ? 0.5 : 0.6;
    global.vaporizationInfo.get.setValue(player.vaporization.clouds).power(1 / softcap).plus(
        new Overlimit(player.buildings[2][1][player.researchesExtra[2][0] >= 1 ? 'total' : 'current']).divide(calculateEffects.S2Upgrade2())
    ).power(softcap).minus(player.vaporization.clouds);
};

export const vaporizationResetCheck = (clouds = null as number | null): boolean => {
    assignNewClouds(); //Also visually updates numbers
    if (player.upgrades[2][2] < 1 || global.vaporizationInfo.get.lessOrEqual('0')) { return false; } //Can be negative

    if (clouds !== null) {
        const level = player.strangeness[2][4];
        if (level >= 2) {
            vaporizationReset(clouds);
            if (!player.toggles.auto[2] || player.toggles.normal[1]) { return false; }
            assignNewClouds();
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
    if (global.paused || !vaporizationResetCheck()) { return; }

    if (player.toggles.confirm[2] !== 'None') {
        let errorText = '';
        if (player.strangeness[2][4] >= 2) {
            errorText += 'already gaining Clouds without needing to reset';
        }
        const rainNow = calculateEffects.S2Extra1(player.researchesExtra[2][1]);
        const rainAfter = calculateEffects.S2Extra1(player.researchesExtra[2][1], true);
        const storm = calculateEffects.S2Extra2(rainAfter) / calculateEffects.S2Extra2(rainNow);
        if (calculateEffects.clouds(true).divide(calculateEffects.clouds()).multiply((rainAfter / rainNow) * storm).lessThan('2')) {
            if (errorText !== '') { errorText += '\nAlso '; }
            errorText += 'boost from doing it is bellow 2x';
        }
        if (player.stage.active !== 2) {
            if (errorText !== '') { errorText += '\nAlso '; }
            errorText += "current active Stage isn't Submerged";
        }
        if (errorText !== '') {
            if (!await Confirm(`Prevented Vaporization because ${errorText}\nReset anyway?`)) { return; }
            if (!vaporizationResetCheck()) { return Notify('Vaporization canceled, requirements are no longer met'); }
        }
    }

    if (globalSave.SRSettings[0]) {
        getId('SRMain').textContent = `Caused Vaporization for ${format(global.vaporizationInfo.get)} Clouds, +${format(player.vaporization.clouds.moreThan('0') ? new Overlimit(global.vaporizationInfo.get).divide(player.vaporization.clouds).multiply('1e2') : 100)}%`;
    }
    vaporizationReset();
};

const vaporizationReset = (autoClouds = null as number | null) => {
    const vaporization = player.vaporization;

    if (autoClouds !== null) {
        vaporization.clouds.plus(new Overlimit(global.vaporizationInfo.get).multiply(autoClouds / 40));
    } else {
        vaporization.clouds.plus(global.vaporizationInfo.get);
        if (player.stage.true === 2) { global.vaporizationInfo.get.setValue('0'); }
    }
    if (vaporization.cloudsMax.lessThan(vaporization.clouds)) { vaporization.cloudsMax.setValue(vaporization.clouds); }
    awardVoidReward(2);
    if (autoClouds === null) { reset('vaporization', player.inflation.vacuum ? [1, 2] : [2]); }
};

export const assignMaxRank = () => {
    if (player.inflation.vacuum) {
        global.accretionInfo.maxRank = player.strangeness[3][9] >= 1 ? 7 : 6;
    } else {
        global.accretionInfo.maxRank = player.stage.true >= 4 || (player.stage.true === 3 && player.events[0]) ? 5 : 4;
    }
};

export const rankResetCheck = (auto = false): boolean => {
    const rank = player.accretion.rank;
    if (rank >= global.accretionInfo.maxRank) { return false; }
    const level = player.strangeness[3][4];

    if ((player.inflation.vacuum ? new Overlimit(player.buildings[1][0][level >= 2 ? 'total' : 'current']).multiply('1.78266192e-33') :
        player.buildings[3][0][level >= 2 ? 'total' : 'current']).lessThan(global.accretionInfo.rankCost[rank])) { return false; }

    if (auto) {
        if (level < 1 && (player.inflation.vacuum ? player.researchesAuto[2] < 2 : (player.researchesAuto[2] < 1 || player.stage.current !== 3))) { return false; }
        rankReset();
    }
    return true;
};
export const rankResetUser = async() => {
    if (global.paused || !rankResetCheck()) { return; }

    if (player.toggles.confirm[3] !== 'None' && player.accretion.rank !== 0) {
        let errorText = '';
        if (player.inflation.vacuum && (player.researchesExtra[2][1] <= 0 || player.vaporization.clouds.lessOrEqual('0')) && player.accretion.rank >= 4) {
            errorText += `current ${player.researchesExtra[2][1] <= 0 ? "level for Cloud Research 'Rain Clouds'" : 'Cloud amount'} is 0, which could make next Rank slow`;
        }
        if (player.stage.active !== 3) {
            if (errorText !== '') { errorText += '\nAlso '; }
            errorText += "current active Stage isn't Accretion";
        }
        if (errorText !== '') {
            if (!await Confirm(`Prevented Rank increase because ${errorText}\nReset anyway?`)) { return; }
            if (!rankResetCheck()) { return Notify('Rank increase canceled, requirements are no longer met'); }
        }
    }

    rankReset();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Rank increased to '${global.accretionInfo.rankName[player.accretion.rank]}' (Rank number is ${player.accretion.rank})`; }
};

const rankReset = () => {
    player.accretion.rank++;
    if (player.accretion.rank === 6) {
        player.stage.current = 4;
        if (player.toggles.normal[0] && player.stage.active < 4) {
            setActiveStage(4);
            stageUpdate('normal', true);
        } else { stageUpdate('soft', true); }
    }
    awardVoidReward(3);
    reset('rank', player.inflation.vacuum ? [1, 2, 3] : [3]);
    calculateMaxLevel(0, 3, 'researchesExtra', true);
    calculateMaxLevel(4, 3, 'researchesExtra', true);
};

const calculateMassGain = (): number => {
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
};

const assignNewMass = () => {
    global.collapseInfo.newMass = !player.inflation.vacuum ? calculateMassGain() :
        Math.min(new Overlimit(player.buildings[1][0].current).multiply('8.96499278339628e-67').toNumber(), global.inflationInfo.massCap); //1.78266192e-33 / 1.98847e33
};
const assignNewRemnants = () => {
    const building = player.buildings[4];
    const starCheck = global.collapseInfo.starCheck;
    const stars = player.collapse.stars;
    starCheck[0] = building[2].trueTotal.moreThan('0') ? Math.max(building[2].true + Math.floor(building[1].true * player.strangeness[4][3] / 10) - stars[0], 0) : 0;
    starCheck[1] = Math.max(building[3].true - stars[1], 0);
    starCheck[2] = Math.max(building[4].true + (building[5].true * player.researches[4][5]) - stars[2], 0);
};

export const collapseResetCheck = (remnants = false): boolean => {
    assignNewRemnants(); //Also visually updates numbers
    assignNewMass(); //Required for Milestones
    if (player.upgrades[4][0] < 1) { return false; }
    const info = global.collapseInfo;
    const collapse = player.collapse;
    const level = player.strangeness[4][4];

    if (remnants) {
        if (level >= 2 && (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0)) {
            collapseReset(true);
            if (!player.toggles.auto[4]) { return false; }
            info.starCheck[0] = 0;
            info.starCheck[1] = 0;
            info.starCheck[2] = 0;
            assignNewMass();
        } else if (!player.toggles.auto[4] || (level < 1 && (player.inflation.vacuum ? player.researchesAuto[2] < 4 : (player.researchesAuto[2] < 1 || player.stage.current < 4)))) { return false; }

        if (player.strangeness[5][4] >= 1 && player.toggles.buildings[5][3] && player.ASR[5] >= 3 && player.researchesExtra[5][0] >= 1 && calculateBuildingsCost(3, 5).lessOrEqual(info.newMass)) {
            collapseReset();
            return true;
        }
        if (player.inflation.vacuum) {
            const timeUntil = new Overlimit(global.inflationInfo.massCap / 8.96499278339628e-67).minus(player.buildings[1][0].current).divide(global.buildingsInfo.producing[1][1]).toNumber() / global.inflationInfo.globalSpeed;
            if (timeUntil < collapse.input[1] && timeUntil > 0) { return false; }
        }
        while (info.pointsLoop < collapse.points.length) {
            if (collapse.points[info.pointsLoop] > info.newMass) { break; }
            if (collapse.points[info.pointsLoop] > collapse.mass) {
                info.pointsLoop++;
                collapseReset();
                return true;
            }
            info.pointsLoop++;
        }
        const massBoost = (calculateEffects.mass(true) / calculateEffects.mass()) * (calculateEffects.S4Research4(true) / calculateEffects.S4Research4()) * ((1 + (calculateEffects.S5Upgrade2(true) - calculateEffects.S5Upgrade2()) / global.mergeInfo.galaxyBase) ** (player.buildings[5][3].true * 2));
        if (massBoost >= collapse.input[0]) {
            collapseReset();
            return true;
        } else if (level >= 2) { return false; }
        const calculateStar = calculateEffects.star;
        const starProd = global.buildingsInfo.producing[4];
        const restProd = new Overlimit(starProd[1]).plus(starProd[3], starProd[4], starProd[5]);
        if (massBoost * new Overlimit(starProd[2]).multiply(calculateStar[0](true) / calculateStar[0]()).plus(restProd).divide(restProd.plus(starProd[2])).replaceNaN('1').toNumber() * (calculateStar[1](true) / calculateStar[1]()) * (calculateStar[2](true) / calculateStar[2]()) < collapse.input[0]) { return false; }
        collapseReset();
        return true;
    }
    return info.newMass > collapse.mass || (level < 2 && (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0)) || player.elements.includes(0.5, 1);
};
export const collapseResetUser = async() => {
    if (global.paused || !collapseResetCheck()) { return; }

    if (player.toggles.confirm[4] !== 'None') {
        let errorText = '';
        if (player.inflation.vacuum) {
            const unlockedG = player.researchesExtra[5][0] >= 1;
            const cantAffordG = !unlockedG || calculateBuildingsCost(3, 5).moreThan(global.collapseInfo.newMass);
            const timeUntil = new Overlimit(global.inflationInfo.massCap / 8.96499278339628e-67).minus(player.buildings[1][0].current).divide(global.buildingsInfo.producing[1][1]).toNumber();
            if (timeUntil > 0 && timeUntil < 1e6 && cantAffordG) {
                errorText += `Solar mass isn't hardcapped, but can be soon hardcapped${unlockedG ? ", also can't afford new Galaxy" : ''}`;
            }
            if (player.researchesExtra[2][1] <= 0 || player.vaporization.clouds.lessOrEqual('0')) {
                if (errorText !== '') { errorText += '\nAlso '; }
                errorText += `current ${player.researchesExtra[2][1] <= 0 ? "level for Cloud Research 'Rain Clouds'" : 'Cloud amount'} is 0, which could make recovering from Collapse really slow`;
            }
        }
        if (player.stage.active !== 4 && player.stage.active !== 5) {
            if (errorText !== '') { errorText += '\nAlso '; }
            errorText += "current active Stage isn't Interstellar";
        }
        if (errorText !== '') {
            if (!await Confirm(`Prevented Collapse because ${errorText}\nReset anyway?`)) { return; }
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
        for (let i = 1; i < playerStart.elements.length; i++) { //Must be bellow mass and star checks
            i = player.elements.indexOf(0.5, i);
            if (i < 1) { break; }
            buyUpgrades(i, 4, 'elements', true);
        }

        reset('collapse', player.inflation.vacuum ? [1, 2, 3, 4] : (player.strangeness[5][3] < 1 ? [4, 5] : [4]));
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(1, 4, 'researches');
    }
    awardVoidReward(4);
};

export const assignMergeReward = () => {
    global.mergeInfo.checkReward[0] = Math.max(Math.floor(player.buildings[5][3].current.toNumber() / 40) - player.merge.reward[0], 0);
};
export const calculateMergeMaxResets = (): number => {
    let max = 1;
    if (player.elements[30] >= 1) { max += player.buildings[6][1].true; }
    return max;
};

export const mergeResetCheck = (): boolean => {
    if (player.upgrades[5][3] !== 1) { return false; }
    if (!player.inflation.vacuum) { return player.buildings[5][3].true >= 22 + 2 * player.buildings[6][1].true; }
    if (player.merge.resets >= calculateMergeMaxResets() || player.buildings[5][3].true < 1) { return false; }
    assignMergeReward();

    return true;
};
export const mergeResetUser = async() => {
    if (global.paused || !mergeResetCheck()) { return; }

    if (player.toggles.confirm[5] !== 'None') {
        if (player.stage.active !== 5) {
            if (!await Confirm("Prevented Merge because current active Stage isn't Intergalactic\nReset anyway?")) { return; }
            if (!mergeResetCheck()) { return Notify('Merge canceled, requirements are no longer met'); }
        }
    }

    mergeReset();
    if (globalSave.SRSettings[0]) {
        const { checkReward } = global.mergeInfo;
        getId('SRMain').textContent = player.inflation.vacuum ? `Tryed to Merge Galaxies and ${checkReward[0] > 0 ? `created ${format(checkReward[0])} Galaxy Groups` : 'resetted self-made Galaxies'}` : 'Vacuum decayed into its true state';
    }
};

const mergeReset = () => {
    if (!player.inflation.vacuum) { return switchVacuum(); }
    if (!player.events[1]) { playEvent(8, 1); }

    player.merge.resets++;
    player.buildings[5][3].true = 0;
    player.merge.reward[0] += global.mergeInfo.checkReward[0];
    reset('galaxy', [1, 2, 3, 4, 5]);
    calculateMaxLevel(0, 4, 'researches');
    calculateMaxLevel(1, 4, 'researches');
    calculateMaxLevel(2, 4, 'researches');

    if (player.stage.current < 6) {
        player.stage.current = 6;
        stageUpdate('soft', true);
    }

    if (player.toggles.normal[0] && player.stage.active >= 5 && calculateBuildingsCost(1, 6).lessOrEqual(player.merge.reward[0])) {
        setActiveStage(6);
        stageUpdate('normal', true);
    }
};

export const assignMilestoneInformation = (index: number, stageIndex: number) => {
    const pointer = global.milestonesInfo[stageIndex];
    const level = player.milestones[stageIndex][index];
    if (!player.inflation.vacuum) {
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
            if (index === 0) { pointer.time[index] = 3600 / (percentage * 2 + 1); }
        }
        pointer.need[index].setValue(pointer.scaling[index][level]); //Can be undefined
    }
};

export const awardMilestone = (index: number, stageIndex: number, count = 0) => {
    if (!milestoneCheck(index, stageIndex)) {
        if (count > 0) {
            player.strange[0].current += count;
            player.strange[0].total += count;
            assignStrangeInfo[0]();

            Notify(`Milestone '${global.milestonesInfo[stageIndex].name[index]}' new tier completed${!player.inflation.vacuum && player.milestones[stageIndex][index] >= global.milestonesInfo[stageIndex].max[index] ? ', maxed' : ''}`);
            if (!player.inflation.vacuum) {
                if (stageIndex === 4) {
                    if (index === 0 && player.milestones[4][0] >= 8) { calculateMaxLevel(6, 4, 'strangeness', true); }
                } else if (stageIndex === 5) {
                    if (index === 0 && player.milestones[5][0] >= 8) { calculateMaxLevel(6, 5, 'strangeness', true); }
                }
            }
        }
        return;
    }

    player.milestones[stageIndex][index]++;
    assignMilestoneInformation(index, stageIndex);
    awardMilestone(index, stageIndex, count + 1);
};

export const getChallengeTimeLimit = (/*index: number*/): number => player.inflation.tree[0] >= 1 && player.inflation.tree[4] < 1 ? 900 : 3600;

const awardVoidReward = (index: number) => {
    if (player.challenges.active !== 0) { return; }
    const old = player.challenges.void[index];

    let progress = 1;
    if (index === 1) {
        progress += player.researchesExtra[1][2];
    } else if (index === 2) {
        if (player.vaporization.clouds.moreThan('1e4')) { progress++; }
    } else if (index === 3) {
        progress = Math.min(player.accretion.rank - 1, 5);
    } else if (index === 4) {
        if (player.collapse.stars[0] >= 1) { progress++; }
        if (player.collapse.stars[1] >= 1) { progress++; }
        if (player.collapse.stars[2] >= 1) { progress++; }
    } else if (index === 5) {
        if (player.buildings[5][3].true >= 1) { progress++; }
    }
    if (old >= progress) { return; }
    const noTime = player.time.stage > getChallengeTimeLimit(/*0*/);
    if (player.challenges.voidCheck[index] < progress) {
        if (noTime) { return; }
        player.challenges.voidCheck[index] = progress;
    } else if (noTime && player.inflation.tree[4] < 1) { return; }

    player.challenges.void[index] = progress;
    for (let i = old; i < progress; i++) {
        Notify(`New Void reward achieved\nReward: ${global.challengesInfo.rewardText[0][index][i]}`);
    }
    if (index === 3) {
        if (old < 4) {
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
        if (old < 1) {
            calculateMaxLevel(4, 1, 'strangeness', true);
            calculateMaxLevel(4, 2, 'strangeness', true);
            calculateMaxLevel(4, 3, 'strangeness', true);
            calculateMaxLevel(4, 4, 'strangeness', true);
        }
    }
    if (global.lastChallenge[0] === 0) {
        getChallengeDescription(0);
        if (global.lastChallenge[1] === index) { getChallengeReward(index); }
    }
};

export const enterExitChallengeUser = async(index: number) => {
    if (global.paused) { return; }
    const old = player.challenges.active;
    if (old === index) {
        if (!await Confirm(`Leave the '${global.challengesInfo.name[old]}'?`)) { return; }
        player.challenges.active = null;

        getId('currentChallenge').style.display = 'none';
        if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `You left the '${global.challengesInfo.name[old]}'`; }
    } else {
        if (!player.inflation.vacuum || !await Confirm(`Enter the '${global.challengesInfo.name[index]}'?`)) { return; }
        player.challenges.active = index;

        getId('currentChallenge').style.display = '';
        const currentID = getQuery('#currentChallenge > span');
        currentID.textContent = global.challengesInfo.name[index];
        currentID.style.color = `var(--${global.challengesInfo.color[index]}-text)`;
        if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `'${global.challengesInfo.name[index]}' is now active`; }
    }
    stageFullReset();
    if (old === 0 || index === 0) { assignTrueEnergy(); }

    getChallengeDescription(index);
};
export const exitChallengeAuto = () => {
    const old = player.challenges.active;
    if (old === null || player.stage.true < 7 || player.time.stage <= getChallengeTimeLimit(/*old*/)) { return; }

    player.challenges.active = null;
    stageFullReset();
    if (old === 0) { assignTrueEnergy(); }

    getId('currentChallenge').style.display = 'none';
    Notify(`Automatically left the '${global.challengesInfo.name[old]}'`);
    getChallengeDescription(old);
};
