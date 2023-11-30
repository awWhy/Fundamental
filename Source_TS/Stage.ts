import { checkBuilding, checkUpgrade, milestoneCheck } from './Check';
import Overlimit from './Limit';
import { getId } from './Main';
import { global, logAny, player, playerStart } from './Player';
import { reset, resetStage } from './Reset';
import { Alert, Confirm, Notify, globalSave } from './Special';
import { format, getChallengeDescription, getChallengeReward, getStrangenessDescription, numbersUpdate, setRemnants, stageUpdate, switchTab, visualUpdateResearches, visualUpdateUpgrades } from './Update';

export const calculateEffects = {
    /** Research is player.researches[1][4] */
    dischargeBase: (research = player.researches[1][4]): number => {
        let base = 4 + research;
        if (player.challenges.active === 0) { base /= 2; }
        return base;
    },
    /** Result need to be divided by 10 */
    S1Upgrade6: (): number => 10 + 3 * player.researches[1][0],
    S1Upgrade7: (): number => (102 + player.researches[1][1]) / 100,
    S1Research2: (): number => 20 + (player.strangeness[1][1] * 2),
    /** Level offset only for false vacuum */
    S1Research5: (offset = 0): number => {
        if (!player.inflation.vacuum) { return 1.25 + (player.researches[1][5] + offset) / 4; }
        const discharges = global.dischargeInfo.total;
        return discharges > 7 ? discharges + 14 : discharges * 3;
    },
    S1Extra1: (level = player.researchesExtra[1][1]): number => level >= 4 ? 1.1 : level >= 3 ? 1.2 : (20 - 3 * level) / 10,
    S1Extra3: (level = player.researchesExtra[1][3]): number => level / 20,
    S1Extra4: (): number => 1 + global.dischargeInfo.base / 100,
    /* Submerged Stage */
    clouds: (post = false): Overlimit => {
        const effect = new Overlimit(player.vaporization.clouds).plus('1');
        if (post) { effect.plus(global.vaporizationInfo.get); }

        if (effect.moreThan('1e4')) { effect.minus('1e4').power(0.7).plus('1e4'); }
        return effect;
    },
    S2Upgrade1: (): Overlimit => {
        const puddles = player.buildings[2][2];
        const effect = new Overlimit('1.02').power((puddles.current.toNumber() - puddles.true) ** 0.7 + Math.min(puddles.true, 200));
        if (puddles.true > 200) { effect.multiply(new Overlimit('1.01').power(puddles.true - 200)); }
        return effect;
    },
    S2Upgrade2: (): number => 1e10 / 2 ** player.strangeness[2][3],
    /** Research is player.researches[2][2] */
    S2Upgrade3: (research = player.researches[2][2]): number => (1 + research / 2) / 100,
    /** Research is player.researches[2][3] */
    S2Upgrade4: (research = player.researches[2][3]): number => (1 + research / 2) / 100,
    S2Upgrade5: (): number => 1 + player.researches[2][4],
    S2Upgrade6: (): number => 1 + player.researches[2][5],
    /** Rain is player.researchesExtra[2][1]; Storm is player.researchesExtra[2][2] */
    S2Extra1_2: (post = false, rain = player.researchesExtra[2][1], storm = player.researchesExtra[2][2]): [number, number] => {
        if (rain < 1) { return [1, 1]; }
        const effect = new Overlimit(player.vaporization.clouds);
        if (post) { effect.plus(global.vaporizationInfo.get); }
        if (storm < 1) { return [Math.max(effect.power(0.1).toNumber(), 1), 1]; }
        const rainEffect = Math.max(effect.power(0.11).toNumber(), 1);
        return [rainEffect, (rainEffect - 1) / 16 + 1]; //[Rain, Storm]
    },
    /* Accretion Stage */
    submersion: (): number => {
        const drops = new Overlimit(player.buildings[2][1].current);
        return (drops.moreThan('1e10') ?
            drops.power(0.6).divide('1e4').plus('1.000000002') : //(Drops / 1e10) ** softcap * 1e2 + 2e-9 + 1
            drops.plus('1').power(0.2).plus('1')
        ).log(2).toNumber();
    },
    S3Upgrade0: (): number => (101 + player.researches[3][1]) / 100,
    /** Research is player.researchesExtra[3][3] */
    S3Upgrade1: (research = player.researchesExtra[3][3]): number => (5 + research) / 100,
    S3Upgrade3: (): number => (102 + player.researches[3][4] / 2) / 100,
    S3Research6: (level = player.researches[3][6]): number => level / 40,
    S3Extra1: (level = player.researchesExtra[3][1]): number => (1 + level / 10) ** player.accretion.rank,
    S3Extra4: (level = player.researchesExtra[3][4]): number => level > 0 ? 8 ** ((player.accretion.rank + level) / 8) : 1,
    /* Interstellar Stage */
    mass: (post = false): number => {
        let effect = player.collapse.mass;
        if (post) {
            if (global.collapseInfo.newMass > effect) { effect = global.collapseInfo.newMass; }
        }

        if (player.elements[21] >= 1) { effect **= 1.1; } //Must be >1, but shoudn't even be unlocked before it
        if (player.challenges.active === 0) {
            if (effect > 1) { effect **= 0.4; }
            effect /= 2e4;
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
            if (player.elements[12] >= 1) {
                const base = calculateEffects.element12();
                effect *= logAny(stars + base, base);
            }
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
    S4Research0: (disc = player.researches[4][2]): number => 1.3 + 0.15 * disc,
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
            if (player.strangeness[4][4] < 2) { blackHoles += global.collapseInfo.starCheck[2]; } //To prevent early reset
            if (global.collapseInfo.newMass > mass) { mass = global.collapseInfo.newMass; }
        }
        if (player.challenges.active === 0) { mass **= 0.4; } //Must be >1, but shoudn't even be unlocked before it

        const base = level >= 2 ? 2 : 3;
        let effect = logAny(blackHoles + base, base);
        if (player.elements[23] >= 1) { effect *= mass ** 0.1; }
        return effect;
    },
    S4Extra1: (): number => (10 + player.researches[4][1]) / 10,
    /* Intergalactic Stage */
    S5Upgrade0: (): number => {
        let effect = 12 * (2 ** player.strangeness[5][3]);
        if (player.challenges.active === 0) { effect = (effect / 32) + 4; }
        return effect;
    },
    S5Upgrade1: (): number => {
        let effect = 4 * (3 ** player.strangeness[5][4]);
        if (player.challenges.active === 0) { effect = (effect / 486) + 1; }
        return effect;
    },
    S5Upgrade2: (): number => {
        let effect = Math.log10(Math.max(player.collapse.mass / 1e5, 1)) / 4 + 0.25;
        if (!player.inflation.vacuum) { effect *= 2; }
        return Math.min(effect, 1);
    },
    /* Rest */
    element6: (): number => player.researchesExtra[4][2] >= 1 ? 2 : 1.5,
    element12: (): number => 10 - player.strangeness[4][8],
    element24: (): number => player.elements[28] >= 1 ? (player.inflation.vacuum || player.milestones[1][1] >= 6 ? 0.03 : 0.015) : 0.01,
    element26: (): number => {
        if (!player.inflation.vacuum && player.strange[0].total < 1) { return 0; }
        const effect = new Overlimit(player.buildings[4][0].trueTotal).log(10).toNumber() - 48;
        return Math.max(Math.floor(effect), 0);
    },
    /** Default value for type is 0 or Quarks; Use 1 for Strangelets */
    strangeGain: (stage: number, type = 0 as 0 | 1) => {
        if (type === 1 && stage < 4) { return 0; }

        let base = type === 1 ? 0 : player.inflation.vacuum ?
            (player.strangeness[5][5] >= 1 ? 5 : 4) :
            (global.strangeInfo.instability + 1);
        if (stage >= 4) {
            base = (base + calculateEffects.element26()) * (player.buildings[5][3].true + 1);
            if (type === 0) { base *= 2 ** player.strangeness[5][1]; }
            if (player.inflation.vacuum && player.strangeness[2][9] >= 1) { base *= calculateEffects.S2Strange9(); }
        }
        return Math.floor(base * calculateEffects.strangeletsBuff());
    },
    strangeletsBuff: (): number => player.strange[1].current ** 0.4 / 80 + 1,
    strangeletsProd: (): number => Math.log2(player.strange[1].current + 2) / 800 * (player.history.stage.best[1] / player.history.stage.best[0]),
    S2Strange9: (): number => new Overlimit(player.vaporization.clouds).plus('1').log(10).toNumber() / 100 + 1
};

export const assignBuildingInformation = () => {
    const { buildings, upgrades, researches, researchesExtra, elements, strangeness } = player;
    const { dischargeInfo, collapseInfo } = global;
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
        let totalMultiplier = 2 ** strangeness[1][0];
        if (upgrades[1][5] === 1) { totalMultiplier *= dischargeInfo.base ** dischargeInfo.total; }
        if (strangeness[1][6] >= 1) { totalMultiplier *= stageBoost[1]; }
        const selfBoost = calculateEffects.S1Upgrade7();

        const listForMult5 = [buildings[1][b5].current];
        let prod5Number = 0.2 * totalMultiplier;
        if (vacuum && upgrades[1][4] === 1) { prod5Number *= 5; }
        if (upgrades[1][7] === 1) { listForMult5.push(new Overlimit(selfBoost).power(buildings[1][b5].true)); }
        producing[1][b5].setValue(prod5Number).multiply(...listForMult5);

        if (upgrades[1][8] === 1) {
            let radiation = calculateEffects.S1Research2() ** researches[1][2];
            if (upgrades[1][9] === 1) { radiation *= energy ** (vacuum ? 0.5 : 1); }
            if (vacuum) {
                radiation *= calculateEffects.S1Research5() ** researches[1][5];
            } else if (researches[1][5] >= 1) { radiation *= dischargeInfo.total ** calculateEffects.S1Research5(); }
            dischargeInfo.tritium.setValue(producing[1][b5]).plus('1').log(calculateEffects.S1Extra1()).multiply(radiation);
        } else { dischargeInfo.tritium.setValue('0'); }

        const listForMult4 = [buildings[1][b4].current];
        let prod4Number = (vacuum ? 0.4 : 0.6) * totalMultiplier;
        if (vacuum) {
            if (upgrades[1][3] === 1) { prod4Number *= 5; }
        } else if (upgrades[1][4] === 1) { prod4Number *= 5; }
        if (upgrades[1][7] === 1) { listForMult4.push(new Overlimit(selfBoost).power(buildings[1][b4].true)); }
        producing[1][b4].setValue(prod4Number).multiply(...listForMult4);

        const listForMult3 = [buildings[1][b3].current];
        let prod3Number = (vacuum ? 0.2 : 0.4) * totalMultiplier;
        if (upgrades[1][0] === 1) { prod3Number *= 5; }
        if (!vacuum && upgrades[1][3] === 1) { prod3Number *= 5; }
        if (upgrades[1][7] === 1) { listForMult3.push(new Overlimit(selfBoost).power(buildings[1][b3].true)); }
        producing[1][b3].setValue(prod3Number).multiply(...listForMult3);

        if (vacuum) {
            const listForMult2 = [buildings[1][2].current];
            if (upgrades[1][7] === 1) { listForMult2.push(new Overlimit(selfBoost).power(buildings[1][2].true)); }
            producing[1][2].setValue(0.3 * totalMultiplier).multiply(...listForMult2);

            const listForMult1 = [];
            const preonsExcess = new Overlimit(buildings[1][1].current).minus(buildings[1][1].true);
            if (preonsExcess.moreThan('1')) {
                listForMult1.push(preonsExcess.power(0.1).plus(buildings[1][1].true));
            } else { listForMult1.push(buildings[1][1].current); }
            if (upgrades[1][7] === 1) { listForMult1.push(new Overlimit(selfBoost).power(buildings[1][1].true)); }
            producing[1][1].setValue(4e-4 * (totalMultiplier ** 0.8)).multiply(...listForMult1);
        }
    }
    if (activeAll.includes(2)) {
        const { vaporizationInfo } = global;
        const rain = calculateEffects.S2Extra1_2();
        const flow = 1.4 ** strangeness[2][7];
        vaporizationInfo.strength = calculateEffects.clouds();

        if (buildings[2][6].true > 0) {
            producing[2][6].setValue(upgrades[2][8] === 1 ? '1.1' : '1.08').power(buildings[2][6].true).multiply(flow);
        } else { producing[2][6].setValue('1'); }

        producing[2][5].setValue(2 * rain[1] * flow).multiply(buildings[2][5].current, producing[2][6]).max('1');

        producing[2][4].setValue(2 * flow).multiply(buildings[2][4].current, producing[2][5]).max('1');

        producing[2][3].setValue(2 * flow).multiply(buildings[2][3].current, producing[2][4]).max('1');

        const listForMult2 = [buildings[2][2].current, producing[2][3], vaporizationInfo.strength];
        let prod2Number = (inVoid ? 1e-3 : 2) * tension * stress * rain[0] * (1.8 ** strangeness[2][1]);
        if (upgrades[2][1] === 1) { listForMult2.push(calculateEffects.S2Upgrade1()); }
        if (researches[2][1] >= 1) {
            if (vaporizationInfo.research1 !== researches[2][1]) { vaporizationInfo.research1 = Math.min(researches[2][1], Math.max(Math.floor(new Overlimit(buildings[2][1].total).divide('1e2').plus('1').log(5).toNumber()), 0)); }
            prod2Number *= 2 ** vaporizationInfo.research1;
        }
        if (vacuum) { prod2Number *= calculateEffects.S3Extra4(); }
        if (strangeness[2][6] >= 1) { prod2Number *= stageBoost[2]; }
        producing[2][2].setValue(prod2Number).multiply(...listForMult2);

        const dropsEffective = new Overlimit(buildings[2][1].current);
        if (inVoid) {
            dropsEffective.min(1);
        } else if (vacuum) {
            const excess = new Overlimit(dropsEffective).minus(buildings[2][1].true);
            if (excess.moreThan('1')) { dropsEffective.setValue(excess.power(0.2).plus(buildings[2][1].true)); }
        }
        const listForMult1 = [dropsEffective];
        if (upgrades[2][0] === 1) { listForMult1.push(new Overlimit(vacuum ? '1.02' : '1.04').power(buildings[2][1].true)); }
        let prod1Number = (vacuum ? 2 : 2e-4) * (2 ** strangeness[2][0]);
        if (researches[2][0] >= 1) {
            if (vaporizationInfo.research0 !== researches[2][0]) { vaporizationInfo.research0 = Math.min(researches[2][0], Math.max(Math.floor(new Overlimit(buildings[2][1].total).divide('1e1').log(1.36).toNumber() + 1), 0)); }
            prod1Number *= 3 ** vaporizationInfo.research0;
        }
        producing[2][1].setValue(prod1Number).multiply(...listForMult1);
    } else if (vacuum) { producing[2][1].setValue('1'); }
    if (activeAll.includes(3)) {
        const weathering = 1.8 ** strangeness[3][1];
        producing[3][5].setValue('1.1').power(buildings[3][5].true);

        producing[3][4].setValue(upgrades[3][12] === 1 ? '1.14' : '1.1').power(buildings[3][4].true).multiply(producing[3][5]);
        const satellitesBoost = strangeness[3][3] < 1 ? new Overlimit('1') : new Overlimit(producing[3][4]).power(vacuum ? 0.2 : 0.3);

        const listForMult3 = [buildings[3][3].current, producing[3][4]];
        let prod3Number = 0.2 * weathering;
        if (researchesExtra[3][2] >= 1) { prod3Number *= 2; }
        if (upgrades[3][7] === 1) { listForMult3.push(new Overlimit('1.02').power(buildings[3][3].true)); }
        producing[3][3].setValue(prod3Number).multiply(...listForMult3);

        const listForMult2 = [buildings[3][2].current, satellitesBoost];
        let prod2Number = (3 ** researches[3][2]) * weathering;
        if (upgrades[3][3] === 1) { listForMult2.push(new Overlimit(calculateEffects.S3Upgrade3()).power(buildings[3][2].true)); }
        if (upgrades[3][4] === 1) { prod2Number *= 3; }
        if (researches[3][6] >= 1) { listForMult2.push(new Overlimit(buildings[3][0].current).max('1').power(calculateEffects.S3Research6())); }
        producing[3][2].setValue(prod2Number).multiply(...listForMult2);

        const listForMult1 = [buildings[3][1].current, satellitesBoost];
        let prod1Number = (vacuum ? 2 : 8e-20) * (3 ** researches[3][0]) * (2 ** researches[3][3]) * (3 ** researches[3][5]) * (1.1 ** researchesExtra[3][0]) * (2 ** strangeness[3][0]);
        if (vacuum) { prod1Number *= calculateEffects.submersion(); }
        if (upgrades[3][0] === 1) { listForMult1.push(new Overlimit(calculateEffects.S3Upgrade0()).power(buildings[3][1].true)); }
        if (upgrades[3][1] === 1) { prod1Number *= new Overlimit(buildings[3][1].current).power(calculateEffects.S3Upgrade1()).toNumber(); }
        if (upgrades[3][2] === 1) { prod1Number *= 2; }
        if (upgrades[3][5] === 1) { prod1Number *= 3; }
        if (upgrades[3][6] === 1) { prod1Number *= 2 * 1.5 ** researches[3][7]; }
        if (upgrades[3][9] === 1) { prod1Number *= 2; }
        if (upgrades[3][10] === 1) { prod1Number *= 8 * 2 ** researches[3][8]; }
        if (researchesExtra[3][1] >= 1) { prod1Number *= calculateEffects.S3Extra1(); }
        producing[3][1].setValue(prod1Number).multiply(...listForMult1);
        if (vacuum) {
            if (inVoid) {
                producing[3][1].power(player.accretion.rank >= 5 ? 0.8 : 0.9);
            } else if (player.accretion.rank >= 5) { producing[3][1].power(0.92); }
        } else if (player.accretion.rank >= 5) { producing[3][1].power(producing[3][1].lessThan('1') ? 1.1 : 0.9); }
    } else if (vacuum) { producing[3][1].setValue('1'); }
    if (activeAll.includes(4)) {
        collapseInfo.massEffect = calculateEffects.mass();
        collapseInfo.starEffect = [calculateEffects.star[0](), calculateEffects.star[1](), calculateEffects.star[2]()];
        const listForTotal = [new Overlimit(calculateEffects.S4Research1()).power(global.collapseInfo.trueStars)];
        let totalNumber = (calculateEffects.S4Research0() ** researches[4][0]) * collapseInfo.massEffect * collapseInfo.starEffect[1] * calculateEffects.S4Research4() * (1.8 ** strangeness[4][0]);
        if (elements[4] >= 1) { totalNumber *= 1.2; }
        if (elements[14] >= 1) { totalNumber *= 1.4; }
        if (elements[19] >= 1) { totalNumber *= 2; }
        if (elements[24] >= 1) { totalNumber *= new Overlimit(buildings[4][0].current).max('1').power(calculateEffects.element24()).toNumber(); }
        if (elements[27] >= 1) { totalNumber *= 3; }
        if (vacuum) {
            if (researchesExtra[1][4] >= 1) { totalNumber *= calculateEffects.S1Extra4() ** dischargeInfo.total; }
            if (researchesExtra[2][3] >= 1) { totalNumber *= tension; }
            if (researchesExtra[2][3] >= 3) {
                totalNumber *= stress;
            } else if (researchesExtra[2][3] >= 2) { totalNumber *= stress ** 0.5; }
        }
        if (strangeness[4][7] >= 1) { totalNumber *= stageBoost[4]; }
        const totalMultiplier = new Overlimit(totalNumber).multiply(...listForTotal);

        producing[4][5].setValue('1e11').multiply(buildings[4][5].current, totalMultiplier);

        producing[4][4].setValue('2e9').multiply(buildings[4][4].current, totalMultiplier);

        producing[4][3].setValue('3e7').multiply(buildings[4][3].current, totalMultiplier);

        producing[4][2].setValue(400 * collapseInfo.starEffect[0] * (2 ** researches[4][3])).multiply(buildings[4][2].current, totalMultiplier);

        let prod1Number = 50;
        if (elements[1] >= 1) { prod1Number *= 2; }
        producing[4][1].setValue(prod1Number).multiply(buildings[4][1].current, totalMultiplier);
    } else { collapseInfo.starEffect[2] = 1; }
    if (activeAll.includes(5)) {
        let prod3Number = vacuum ? 2 : 6;
        if (upgrades[5][2] === 1) { prod3Number += calculateEffects.S5Upgrade2(); }
        producing[5][3].setValue(prod3Number).power(buildings[5][3].true);

        const listForMult2 = [buildings[5][2].current, producing[5][3]];
        let prod2Number = 1.5 * (2 ** researches[5][1]);
        if (upgrades[5][1] === 1) { prod2Number *= calculateEffects.S5Upgrade1(); }
        producing[5][2].setValue(prod2Number).multiply(...listForMult2).max('1');

        const listForMult1 = [buildings[5][1].current, producing[5][3]];
        let prod1Number = 3 ** researches[5][0];
        if (upgrades[5][0] === 1) { prod1Number *= calculateEffects.S5Upgrade0(); }
        //if (researchesExtra[2][4] >= 1) { prod1Number *= tension * stress; }
        producing[5][1].setValue(prod1Number).multiply(...listForMult1);

        producing[4][4].multiply(producing[5][2]);
        if (researches[5][1] >= 1) { producing[4][3].multiply(producing[5][2]).divide('2'); }
        if (researches[5][1] >= 2) { producing[4][2].multiply(producing[5][2]).divide('4'); }
        if (researches[5][1] >= 3) { producing[4][1].multiply(producing[5][2]).divide('8'); }
    }
    if (vacuum) {
        const inflationInfo = global.inflationInfo;
        inflationInfo.preonTrue.setValue(producing[1][1]);
        inflationInfo.dustTrue.setValue(producing[3][1].max('1'));
        dischargeInfo.tritium.multiply(producing[2][1].max('1'));

        const massDelay = 1.4 ** strangeness[3][8];
        const accretionMass = calculateMassGain();
        inflationInfo.dustCap.setValue(1e48 * accretionMass * (inVoid ? 1 : massDelay));
        if (producing[3][1].moreThan(inflationInfo.dustCap)) { producing[3][1].setValue(inflationInfo.dustCap); }

        let microworldMass = collapseInfo.starEffect[2];
        if (elements[10] >= 1) { microworldMass *= 2; }
        if (researchesExtra[4][1] >= 1) { microworldMass *= calculateEffects.S4Extra1(); }
        inflationInfo.preonCap.setValue(1e14 * (energy ** calculateEffects.S1Extra3()) * microworldMass * (inVoid ? massDelay : 1)).multiply(producing[3][1]);
        if (producing[1][1].moreThan(inflationInfo.preonCap)) { producing[1][1].setValue(inflationInfo.preonCap); }

        inflationInfo.massCap = 0.01235 * accretionMass * microworldMass;
        if (strangeness[5][7] >= 1) { inflationInfo.massCap *= stageBoost[5]; }
    }
};

export const buyBuilding = (index: number, stageIndex = player.stage.active, howMany: number | null = null, auto = false) => {
    if (!checkBuilding(index, stageIndex)) { return; }
    const building = player.buildings[stageIndex][index as 1];

    let pointer; //For cost
    let currency;
    let free = false;
    let special = '' as '' | 'Moles' | 'Mass' | 'Galaxy';
    if (stageIndex === 1) {
        pointer = player.buildings[1][index - 1];
        if (index === 1) { free = player.researchesExtra[1][2] >= 1 && player.strangeness[1][8] >= 1; }
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
    } else /*if (stageIndex >= 4)*/ {
        pointer = player.buildings[4][0];
        if (stageIndex === 5 && index === 3) {
            special = 'Galaxy';
            currency = new Overlimit(player.collapse.mass);
        }
    }
    if (currency === undefined) { currency = new Overlimit(pointer.current); }

    const budget = new Overlimit(currency);
    if (auto && building.true > 0 && !free && special !== 'Galaxy') {
        if (special === 'Mass' && player.toggles.auto[3] && player.strangeness[3][4] >= 2 && global.inflationInfo.dustTrue.moreOrEqual(global.inflationInfo.dustCap)) {
            budget.minus(global.inflationInfo.massCap * 1.98847e33);
        } else {
            budget.divide(player.stage.true >= 3 ? player.toggles.shop.wait[stageIndex] : '2');
        }
    }

    const total = calculateBuildingsCost(index, stageIndex);
    if (total.moreThan(budget)) { return; }

    let afford = 1;
    if (howMany === null) { howMany = global.hotkeys.shift ? 1 : global.hotkeys.ctrl ? 10 : player.toggles.shop.input; }
    if (howMany !== 1 && special !== 'Galaxy') {
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
    if (building.highest.lessThan(building.current)) { building.highest.setValue(building.current); }

    if (special === 'Galaxy') {
        reset('galaxy', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [4, 5]);
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(1, 4, 'researches');
        calculateMaxLevel(2, 4, 'researches');
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Caused Galaxy reset to gain ${format(afford)} new 'Galaxies'`; }
        awardVoidReward(5);
        awardMilestone(1, 5);
    } else {
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

        if (player.inflation.vacuum || stageIndex === 1) {
            addEnergy(global.dischargeInfo.energyType[stageIndex][index] * afford);
            awardMilestone(1, 1);
        }

        if (stageIndex === 1) {
            if (index === 5 && player.upgrades[1][8] === 0 && player.inflation.vacuum) { player.buildings[2][0].current.setValue(building.current).divide('6.02214076e23'); }
        } else if (stageIndex === 2) {
            if (index !== 1) { assignPuddles(); }
        } else if (stageIndex === 3) {
            if (index >= 4) { awardMilestone(1, 3); }
        } else if (stageIndex === 4) {
            global.collapseInfo.trueStars += afford;
            awardMilestone(0, 5);
        }

        assignBuildingInformation();
        if (!auto) {
            numbersUpdate();
            if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Made ${format(afford)} '${global.buildingsInfo.name[stageIndex][index]}'`; }
        }
    }
};

export const addEnergy = (add: number) => {
    const { discharge } = player;

    global.dischargeInfo.energyTrue += add;
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
            if (!player.inflation.vacuum && player.upgrades[1][2] === 1) { firstCost /= 10; }
        } else if (index === 3) {
            if (player.upgrades[1][1] === 1) { firstCost /= 10; }
        } else if (index === 4) {
            if (player.inflation.vacuum) {
                if (player.upgrades[1][2] === 1) { firstCost /= 10; }
                if (player.researchesExtra[1][0] >= 1) { firstCost /= 10; }
            }
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
        if (player.elements[13] >= 1) { firstCost /= 1e3; }
    }

    return new Overlimit(buildingsInfo.increase[stageIndex][index]).power(player.buildings[stageIndex][index as 1].true).multiply(firstCost);
};

export const assignPuddles = (reload = false) => {
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
    if (!reload) { awardMilestone(1, 2); }
};

export const gainBuildings = (get: number, stageIndex: number, time: number) => {
    let add: Overlimit;
    let stageGet = stageIndex;
    if (stageIndex === 1 && get === 5) {
        add = new Overlimit(global.dischargeInfo.tritium).multiply(time);
        if (!player.inflation.vacuum) { get = 3; }
    } else if (stageIndex === 5) {
        add = new Overlimit(global.buildingsInfo.producing[5][1]).multiply(time).divide(3 ** get);
        stageGet = 4;
        get++;
    } else {
        add = new Overlimit(global.buildingsInfo.producing[stageIndex][get + 1]).multiply(time);

        if (stageIndex === 4) {
            get = 0;
        } else if (stageIndex === 2 && get === 1 && player.buildings[2][2].current.lessOrEqual('0') && player.researchesExtra[2][1] >= 1) {
            add.plus(time * (calculateEffects.S2Extra1_2()[0] - 1));
        }
    }
    if (add[0] === 0) { return; }
    if (!add.isFinite()) {
        if (global.debug.errorGain) {
            global.debug.errorGain = false;
            Notify(`Error while gaining ${add.toString()} '${global.buildingsInfo.name[stageGet][get]}'`);
            setTimeout(() => { global.debug.errorGain = true; }, 6e4);
        }
        return;
    }

    const building = player.buildings[stageGet][get];
    building.current.plus(add);
    building.total.plus(add);
    building.trueTotal.plus(add);
    if (building.highest.lessThan(building.current)) { building.highest.setValue(building.current); }

    if (stageIndex === 1) {
        if (player.inflation.vacuum) {
            if (get === 0) {
                player.buildings[3][0].current.setValue(building.current).multiply('1.78266192e-33');
                awardMilestone(0, 3);
            } else if (get === 1) {
                awardMilestone(0, 1);
            } else if (get === 5) {
                player.buildings[2][0].current.setValue(building.current).divide('6.02214076e23');
            }
        } else if (get === 0) { awardMilestone(0, 1); }
    } else if (stageIndex === 3) {
        if (get === 0) { //Never 0 for true vacuum
            if (player.accretion.rank < 5 && building.current.moreThan('1e30')) { building.current.setValue('1e30'); }
            awardMilestone(0, 3);
        }
    }
};

export const assignStrangeBoost = () => {
    const stageBoost = global.strangeInfo.stageBoost;
    const strangeQuarks = player.strange[0].current + 1;

    stageBoost[1] = strangeQuarks ** 0.16;
    stageBoost[2] = strangeQuarks ** 0.22;
    stageBoost[3] = strangeQuarks ** 0.44;
    stageBoost[4] = strangeQuarks ** 0.28;
    stageBoost[5] = strangeQuarks ** 0.06;
};

export const gainStrange = (get: number, time: number) => {
    const strange = player.strange[get];
    const add = calculateEffects.strangeletsProd() * time;
    strange.current += add;
    strange.total += add;
    assignStrangeBoost();
};

export const buyUpgrades = (upgrade: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements', auto = false): boolean => {
    if (!auto && !checkUpgrade(upgrade, stageIndex, type)) { return false; } //Auto should already checked if allowed, also allows for delayed purchase of Elements

    let free = false;
    let currency: Overlimit;
    if (stageIndex === 1) {
        currency = new Overlimit(player.discharge.energy);
        free = player.accretion.rank >= 6 && player.strangeness[1][9] >= 1;
    } else if (stageIndex === 2) {
        currency = new Overlimit(player.buildings[2][1].current);
    } else if (stageIndex === 3) {
        currency = player.inflation.vacuum ? new Overlimit(player.buildings[1][0].current).multiply('1.78266192e-33') : new Overlimit(player.buildings[3][0].current);
    } else /* if (stageIndex === 4 || stageIndex === 5) */ {
        currency = new Overlimit(player.buildings[4][0].current);
    }

    if (type === 'upgrades') {
        if (player.upgrades[stageIndex][upgrade] >= 1) { return false; }

        const pointer = global.upgradesInfo[stageIndex];
        if (currency.lessThan(pointer.startCost[upgrade])) { return false; }

        player.upgrades[stageIndex][upgrade]++;
        if (!free) { currency.minus(pointer.startCost[upgrade]); }

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
        if ((auto || (player.toggles.max[0] && player.stage.true >= 2)) && pointer.max[upgrade] > 1) {
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
                    if (player.stage.current < 4) { player.stage.current = player.researchesExtra[1][2] > 1 ? 2 : 3; }
                    if (!global.stageInfo.activeAll.includes(3) && globalSave.toggles[2]) {
                        setActiveStage(3);
                        stageUpdate();
                    } else { stageUpdate('soft'); }
                    awardVoidReward(1);
                }
            } else if (stageIndex === 4) {
                if (upgrade === 2) {
                    calculateMaxLevel(1, 4, 'researches', true);
                    setRemnants();
                }
            }
        }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${level[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(level[upgrade])} for '${pointer.name[upgrade]}' ${type === 'researches' ? 'Stage' : ['', 'Energy', 'Cloud', 'Rank', 'Collapse', 'Galaxy'][player.stage.active]} Research`; }
    } else if (type === 'researchesAuto' || type === 'ASR') {
        if (type === 'ASR') { upgrade = stageIndex; }
        const pointer = global[`${type}Info`];
        const level = player[type];

        if (level[upgrade] >= pointer.max[upgrade]) { return false; }
        const cost = pointer.costRange[upgrade][level[upgrade]];
        if (currency.lessThan(cost)) { return false; }

        level[upgrade]++;
        if (!free) { currency.minus(cost); }

        /* Special cases */
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${level[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(level[upgrade])} for '${type === 'ASR' ? pointer.name : pointer.name[upgrade]}' automatization Research`; }
    } else if (type === 'elements') {
        let level = player.elements[upgrade];
        if (level >= 1) { return false; }

        if (level === 0) {
            const startCost = global.elementsInfo.startCost[upgrade];
            if (currency.lessThan(startCost)) { return false; }
            currency.minus(startCost);
        } else if (!auto) { return false; }
        level = player.strangeness[4][6] >= 1 || level === 0.5 ? 1 : 0.5;
        player.elements[upgrade] = level;

        /* Special cases */
        if (player.collapse.show < upgrade) { player.collapse.show = upgrade; }
        if (level === 1) {
            if (upgrade === 7 || upgrade === 16 || upgrade === 20 || upgrade === 25) {
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
                }
                if (globalSave.toggles[2]) {
                    setActiveStage(5);
                    stageUpdate();
                } else { stageUpdate('soft'); }
                awardVoidReward(5);
            }
        }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `New Element '${global.elementsInfo.name[upgrade]}' ${player.elements[upgrade] >= 1 ? 'obtained' : 'awaiting activation'}`; }
    }

    if (stageIndex === 1) {
        if (!free) { player.discharge.energy = currency.toNumber(); }
    } else if (stageIndex === 2) {
        player.buildings[2][1].current = currency;

        if (player.buildings[2][2].current.lessOrEqual('0') && player.buildings[2][1].current.lessThan(player.buildings[2][1].true)) {
            const old = player.buildings[2][1].true;
            player.buildings[2][1].true = Math.floor(player.buildings[2][1].current.toNumber());
            if (player.inflation.vacuum) {
                addEnergy(-(old - player.buildings[2][1].true) * global.dischargeInfo.energyType[2][1]);
            } else if (player.buildings[2][1].current.lessOrEqual('0') && player.buildings[2][0].current.lessThan('2.8e-3')) {
                player.buildings[2][0].current.setValue('2.8e-3');
            }
        }
    } else if (stageIndex === 3) {
        if (player.inflation.vacuum) {
            player.buildings[1][0].current = currency.divide('1.78266192e-33');
            player.buildings[3][0].current.setValue(player.buildings[1][0].current).multiply('1.78266192e-33');
        } else { player.buildings[3][0].current = currency; }
    } else /*if (stageIndex === 4 || stageIndex === 5)*/ {
        player.buildings[4][0].current = currency;
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

export const buyStrangeness = (upgrade: number, stageIndex: number, type: 'strangeness', auto = false): boolean => {
    if (!auto && !checkUpgrade(upgrade, stageIndex, type)) { return false; }

    if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        if (player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade]) { return false; }
        if (player.strange[0].current < global.strangenessInfo[stageIndex].cost[upgrade]) { return false; }

        player.strangeness[stageIndex][upgrade]++;
        player.strange[0].current -= pointer.cost[upgrade];

        /* Special cases */
        if (stageIndex === 1) {
            if (upgrade === 5) {
                player.ASR[1] = global.ASRInfo.max[1];
                visualUpdateResearches(0, 1, 'ASR');
            } else if (upgrade === 7) {
                calculateTrueEnergy();
            }
        } else if (stageIndex === 2) {
            if (upgrade === 2) {
                calculateMaxLevel(4, 2, 'researches', true);
                calculateMaxLevel(5, 2, 'researches', true);
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
            } else if (upgrade === 5) {
                player.ASR[3] = global.ASRInfo.max[3];
                visualUpdateResearches(0, 3, 'ASR');
            } else if (upgrade === 6) {
                if (player.researchesAuto[0] < player.strangeness[3][6]) {
                    player.researchesAuto[0] = player.strangeness[3][6];
                    visualUpdateResearches(0, 0, 'researchesAuto');
                }
            }
        } else if (stageIndex === 4) {
            if (upgrade === 5) {
                player.ASR[4] = global.ASRInfo.max[4];
                visualUpdateResearches(0, 4, 'ASR');
            } else if (upgrade === 6) {
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
            if (upgrade === 0) {
                if (!player.inflation.vacuum && player.stage.current === player.strangeness[5][0]) {
                    player.stage.current++;
                    player.time.stage = 0;
                    player.stage.time = 0;
                    player.stage.peak = 0;
                    if (player.stage.active === player.stage.current - 1) {
                        setActiveStage(player.stage.current);
                        stageUpdate();
                    } else { stageUpdate('soft'); }
                } else { stageUpdate('soft'); }
            } else if (upgrade === 5) {
                if (player.inflation.vacuum) { stageUpdate('soft'); }
            } else if (upgrade === 6) {
                player.ASR[5] = 2;
                visualUpdateResearches(0, 5, 'ASR');
            }
        }
        assignStrangeBoost();
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(player.strangeness[stageIndex][upgrade])} for '${pointer.name[upgrade]}' Strangeness from ${global.stageInfo.word[stageIndex]} section`; }
    }

    assignBuildingInformation();
    calculateResearchCost(upgrade, stageIndex, type);
    visualUpdateResearches(upgrade, stageIndex, type);
    if (!auto) { numbersUpdate(); }
    return true;
};

//Currently can't allow price to be more than 2**1024. Because missing sorting function for numbers that big
export const calculateResearchCost = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'strangeness') => {
    if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];

        pointer.cost[research] = stageIndex === 1 ?
            pointer.startCost[research] + pointer.scaling[research] * player[type][stageIndex][research] :
            pointer.startCost[research] * pointer.scaling[research] ** player[type][stageIndex][research];
    } else if (type === 'strangeness') {
        global.strangenessInfo[stageIndex].cost[research] = player.inflation.vacuum ?
            Math.floor(Math.round((global.strangenessInfo[stageIndex].startCost[research] * global.strangenessInfo[stageIndex].scaling[research] ** player.strangeness[stageIndex][research]) * 100) / 100) :
            Math.floor(Math.round((global.strangenessInfo[stageIndex].startCost[research] + global.strangenessInfo[stageIndex].scaling[research] * player.strangeness[stageIndex][research]) * 100) / 100);
    }
};

export const calculateMaxLevel = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'ASR' | 'strangeness', addAuto = false) => {
    let max = null;
    if (type === 'ASR') {
        if (stageIndex === 1) {
            max = player.inflation.vacuum ? 5 : 3;
        } else if (stageIndex === 2) {
            max = player.inflation.vacuum ? 6 : 5;
        } else if (stageIndex === 3) {
            max = player.inflation.vacuum ? 5 : 4;
        } else if (stageIndex === 4) {
            max = player.inflation.vacuum ? 5 : 4;
        } else if (stageIndex === 5) {
            max = player.stage.true >= 6 || player.milestones[5][0] >= 8 ? 3 : 2;
        }
    } else if (type === 'researches') {
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
                max = 2 + player.researchesExtra[4][2];
                if (player.elements[7] >= 1) { max += 2; }
                if (player.elements[16] >= 1) { max++; }
                if (player.elements[20] >= 1) { max++; }
                if (player.elements[25] >= 1) { max++; }
            } else if (research === 2) {
                max = 1;
                if (player.elements[11] >= 1) { max++; }
            }
        }
    } else if (type === 'researchesExtra') {
        if (stageIndex === 3) {
            if (research === 0) {
                max = 12;
                if (player.accretion.rank >= 3) { max += 17; }
                if (player.strangeness[3][2] >= 1) { max += 9; }
            } else if (research === 1) {
                max = 5;
                if (player.strangeness[3][2] >= 2) { max += 3; }
            } else if (research === 4) {
                max = player.accretion.rank - 2;
            }
        }
    } else if (type === 'strangeness') {
        if (stageIndex === 1) {
            if (research === 0) {
                max = 6 + Math.min(player.challenges.void[3], 4);
            } else if (research === 3) {
                max = 2 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            } else if (research === 4) {
                max = player.challenges.void[4] >= 1 ? 2 : 1;
            }
        } else if (stageIndex === 2) {
            if (research === 1) {
                max = 8 + Math.min(player.challenges.void[3], 4);
            } else if (research === 3) {
                max = 2 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            } else if (research === 4) {
                max = player.challenges.void[4] >= 1 ? 2 : 1;
            }
        } else if (stageIndex === 3) {
            if (research === 0) {
                max = 8 + Math.min(player.challenges.void[3], 4);
            } else if (research === 1) {
                max = 4 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            } else if (research === 4) {
                max = player.challenges.void[4] >= 1 ? 2 : 1;
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                max = 8 + Math.min(player.challenges.void[3], 4);
            } else if (research === 1) {
                max = 4 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            } else if (research === 4) {
                max = player.challenges.void[4] >= 1 ? 2 : 1;
            } else if (research === 6) {
                max = player.inflation.vacuum || player.milestones[5][0] >= 8 ? 2 : 1;
            }
        } else if (stageIndex === 5) {
            if (research === 0) {
                max = player.inflation.vacuum ? 1 : 3;
            } else if (research === 1) {
                max = 1 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            }
        }
    }
    if (max !== null) {
        if (max < 0) { max = 0; }
        if (type === 'ASR') {
            global.ASRInfo.max[stageIndex] = max;
        } else {
            global[`${type}Info`][stageIndex].max[research] = max;
        }
    }

    if (type !== 'ASR') { calculateResearchCost(research, stageIndex, type); }
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
    const auto = global.automatization.elements;
    const startCost = global.elementsInfo.startCost;
    const elements = player.elements;

    for (let i = 1; i < (player.inflation.vacuum ? startCost.length : 29); i++) {
        if (elements[i] < 1) { auto.push(i); }
    }

    auto.sort((a, b) => startCost[a] - startCost[b]);
};

export const autoElementsBuy = () => {
    if (!player.toggles.auto[8] || player.strangeness[4][6] < 2) { return; }
    const auto = global.automatization.elements;
    const elements = player.elements;

    for (let i = 0; i < auto.length; i++) {
        const index = auto[i];

        if (!checkUpgrade(index, 4, 'elements')) { break; }
        buyUpgrades(index, 4, 'elements', true);

        if (elements[index] >= 1) {
            auto.splice(i, 1);
            i--;
        } else { break; }
    }
};

export const toggleSwap = (number: number, type: 'buildings' | 'hover' | 'max' | 'auto', change = false) => {
    const toggles = type === 'buildings' ? player.toggles.buildings[player.stage.active] : player.toggles[type];

    if (change) {
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
                const buildings = player.buildings[player.stage.active];

                let anyOn = false;
                toggles[number] = !toggles[number];
                for (let i = 1; i < global.buildingsInfo.maxActive[player.stage.active]; i++) {
                    if (toggles[i] && buildings[i].highest.moreThan('0')) {
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
    } else {
        toggleHTML = getId(`toggleAuto${number}`);
        extraText = 'Auto ';
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
    if (change) { toggles[number] = toggles[number] === 'All' ? 'Safe' : toggles[number] === 'Safe' ? 'None' : 'All'; }

    const toggleHTML = getId(`toggleConfirm${number}`);
    toggleHTML.textContent = toggles[number];
    if (toggles[number] === 'All' || toggles[number] === 'Safe') {
        toggleHTML.style.color = '';
        toggleHTML.style.borderColor = '';
    } else {
        toggleHTML.style.color = 'var(--red-text)';
        toggleHTML.style.borderColor = 'crimson';
    }
};

export const stageResetCheck = (stageIndex: number, auto = false): boolean => {
    let allowed = false;
    if (stageIndex >= 5) {
        allowed = player.elements[26] >= 1;
    } else if (stageIndex === 4) {
        return false;
    } else if (stageIndex === 3) {
        allowed = player.buildings[3][0].current.moreOrEqual('2.45576045e31');
    } else if (stageIndex === 2) {
        allowed = player.buildings[2][1].current.moreOrEqual('1.19444e29');
    } else if (stageIndex === 1) {
        allowed = player.buildings[1][3].current.moreOrEqual('1.67133125e21');
    }

    if (auto && allowed) {
        if (player.strangeness[5][2] < 1 || (stageIndex >= 4 && (player.stage.input <= 0 || player.stage.input > calculateEffects.strangeGain(stageIndex)))) { return false; }
        stageResetReward(stageIndex);
    }
    return allowed;
};

export const stageAsyncReset = async() => {
    const stage = player.stage;
    const active = player.inflation.vacuum || (stage.active >= 4 && player.events[0]) ? 5 : stage.active;

    if (!stageResetCheck(active)) {
        if (player.toggles.confirm[0] === 'None' || (stage.true < 2 && player.upgrades[1][9] < 1)) { return; }
        if (active >= 5) { return void Alert('Awaiting "[26] Iron" Element'); }
        if (active === 4) { return void Alert('Enter Intergalactic space first'); }
        if (active === 3) { return void Alert(`Self sustaining is not yet possible, obtain at least ${format(2.45576045e31)} Mass`); }
        if (active === 2) { return void Alert(`Look's like more Mass expected, need even more Drops, around ${format(1.19444e29)} in total`); }
        if (active === 1) { return void Alert(`Not enough to form a single Drop of water, need at least ${format(1.67133125e21)} Molecules`); }
    } else {
        if (player.toggles.confirm[0] !== 'None') {
            const challenge = player.challenges.active;
            if (player.toggles.confirm[0] !== 'Safe' || challenge !== -1) {
                let text;
                if (active >= 5) {
                    text = `${!player.inflation.vacuum ? 'Return back to Microworld' : 'Ready to reset progress'} for ${format(calculateEffects.strangeGain(5))} Strange quarks${player.strangeness[5][8] >= 1 ? ` and ${format(calculateEffects.strangeGain(5, 1))} Strangelets` : ''}?`;
                    if (challenge !== -1) { text += `\n(${global.challengesInfo.name[challenge]} is active)`; }
                } else if (stage.true >= 5) {
                    text = `${active === stage.current ? 'Move to next Stage and gain' : 'Reset this Stage for'} ${format(calculateEffects.strangeGain(active))} Strange quarks?`;
                } else {
                    text = 'Ready to enter next Stage? Next one will be harder than current';
                }
                if (!await Confirm(text)) { return; }
                if (!stageResetCheck(active)) { return Notify('Stage reset canceled, requirements are no longer met'); }
            }
        }
        stageResetReward(active, globalSave.SRSettings[0]);
    }
};

const stageResetReward = (stageIndex: number, readerMessage = false) => {
    const { stage, time } = player;
    const realTime = time.stage;

    stage.resets++;
    let update: false | 'normal' | 'soft' = 'normal';
    const resetThese = player.inflation.vacuum ? [1, 2, 3, 4, 5] : [stageIndex];
    if (player.inflation.vacuum) {
        setActiveStage(1);
        time.stage = 0;
        stage.time = 0;
        stage.peak = 0;
        stage.current = 1;
    } else if (stageIndex === stage.current) {
        time.stage = 0;
        stage.time = 0;
        stage.peak = 0;
        if (stageIndex < 5) {
            stage.current++;
            if (stage.active === stage.current - 1) {
                setActiveStage(stage.current);
            } else { update = 'soft'; }
            if (stage.current > stage.true) {
                stage.true = stage.current;
                player.events[0] = false;
            }
        } else {
            stage.current = 1 + player.strangeness[5][0];
            if ((stage.active === 4 && stage.current !== 4) || stage.active === 5) {
                setActiveStage(stage.current);
            } else { update = 'soft'; }
            resetThese.unshift(4);
        }
    } else { update = stageIndex === stage.active ? 'soft' : false; }

    if (stage.true >= 5) {
        const { strange } = player;
        const quarks = calculateEffects.strangeGain(stageIndex);
        const strangelets = player.strangeness[5][8] >= 1 ? calculateEffects.strangeGain(stageIndex, 1) : 0;
        strange[0].current += quarks;
        strange[0].total += quarks;
        strange[1].current += strangelets;
        strange[1].total += strangelets;
        if (quarks > time.export[1]) { time.export[1] = quarks; }
        if (strangelets > time.export[2]) { time.export[2] = strangelets; }
        assignStrangeBoost();

        if (stageIndex >= 4) {
            const storage = global.historyStorage.stage;
            const history = player.history.stage;
            storage.unshift([realTime, quarks, strangelets, 0]);
            if (storage.length > 100) { storage.length = 100; }
            if (quarks / realTime > history.best[1] / history.best[0]) { history.best = [realTime, quarks, strangelets, 0]; }
        }
        if (readerMessage) { getId('SRMain').textContent = `Caused Stage reset for ${format(quarks)} Strange quarks${player.strangeness[5][8] >= 1 ? ` and ${format(strangelets)} Strangelets` : ''}`; }
    } else if (readerMessage) { getId('SRMain').textContent = `${global.stageInfo.word[stage.true - 1]} Stage ended, but new one started`; }

    resetStage(resetThese, update);
};
/** True vacuum only */
const stageResetNoReward = () => {
    setActiveStage(1);
    player.time.stage = 0;
    player.stage.time = 0;
    player.stage.peak = 0;
    player.stage.current = 1;
    resetStage([1, 2, 3, 4, 5]);
};

export const switchStage = (stage: number) => {
    if (!global.stageInfo.activeAll.includes(stage)) { return; }
    if (player.stage.active === stage) {
        if (global.trueActive !== stage) {
            global.trueActive = stage;
            getId(`${global.stageInfo.word[stage]}Switch`).style.textDecoration = 'underline';
        }
        return;
    }

    if (stage !== 4 && stage !== 5 && ((global.tab === 'upgrade' && global.subtab.upgradeCurrent === 'Elements') || global.tab === 'Elements')) {
        switchTab('upgrade', global.tab === 'upgrade' ? 'Upgrades' : null);
    }
    setActiveStage(stage);
    stageUpdate();
};

/** Doesn't check for Stage being unlocked, requires stageUpdate() call afterwards */
export const setActiveStage = (stage: number, active = stage) => {
    getId(`${global.stageInfo.word[player.stage.active]}Switch`).style.textDecoration = '';
    player.stage.active = stage;
    global.trueActive = active;
    getId(`${global.stageInfo.word[stage]}Switch`).style.textDecoration = 'underline' + (global.trueActive !== stage ? ' dashed' : '');
};

export const getDischargeScale = (): number => (20 - (4 * player.researches[1][3]) - player.strangeness[1][2]) / 2;
export const assignDischargeCost = () => {
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
        [0, 20, 30, 40, 50, 60, 100],
        [0, 20, 40, 60, 100, 120],
        [0, 80, 160, 240, 320, 400],
        [0, 400, 400, 2000]
    ];

    for (let s = 1; s < energyArray.length; s++) {
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
export const calculateTrueEnergy = () => {
    assignEnergyArray();
    const { energyType } = global.dischargeInfo;

    let add = 0;
    for (let s = 1; s < (player.inflation.vacuum ? energyType.length : 2); s++) {
        const buildings = player.buildings[s];
        for (let i = 1; i < energyType[s].length; i++) {
            add += energyType[s][i] * buildings[i as 1].true;
        }
    }

    /* Uncomment, in case of floating errors */
    //add = Math.round(add * 1e4) / 1e4;
    global.dischargeInfo.energyTrue = add;
    //if (Math.abs(add - player.discharge.energy) < 1e-4) { player.discharge.energy = add; }
};

export const dischargeResetCheck = (auto = false, goals = false): boolean => {
    if (player.upgrades[1][5] < 1) { return false; }
    assignDischargeCost();
    const info = global.dischargeInfo;
    const energy = player.discharge.energy;

    if (goals) {
        if (player.strangeness[1][4] >= 2 && energy >= info.next) {
            dischargeReset(true);
            if (!auto) { return true; }
        } else if (!auto) { return false; }
    }
    if (auto) {
        if (player.strangeness[1][4] < 1 || (energy >= info.energyTrue && (player.strangeness[1][4] >= 2 || energy < info.next))) { return false; }
        dischargeReset();
        return true;
    }
    return energy < info.energyTrue || (player.strangeness[1][4] < 2 && energy >= info.next);
};

export const dischargeAsyncReset = async() => {
    if (!dischargeResetCheck()) { return; }
    const info = global.dischargeInfo;
    const energy = player.discharge.energy;

    if (player.toggles.confirm[1] !== 'None') {
        if (player.toggles.confirm[1] !== 'Safe' || player.stage.active !== 1) {
            if (!await Confirm(`Reset Structures and Energy to ${energy >= info.next ? 'gain boost from a new goal' : `regain ${format(info.energyTrue - energy)} spent Energy`}?`)) { return; }
            if (!dischargeResetCheck()) { return Notify('Discharge canceled, requirements are no longer met'); }
        }
    }

    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Caused Discharge to reset spent Energy${energy >= info.next ? ', also reached new goal' : ''}`; }
    dischargeReset();
};

const dischargeReset = (noReset = false) => {
    if (player.discharge.energy >= global.dischargeInfo.next) { player.discharge.current++; }
    awardVoidReward(1);
    if (!noReset) { reset('discharge', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [1]); }
};

export const assignNewClouds = () => {
    const get = new Overlimit(player.buildings[2][1][player.researchesExtra[2][0] >= 1 ? 'total' : 'current']).divide(calculateEffects.S2Upgrade2());

    if (get.moreOrEqual('1')) {
        const softcap = player.challenges.active === 0 ? 0.4 : player.inflation.vacuum ? 0.5 : 0.6;
        global.vaporizationInfo.get.setValue(player.vaporization.clouds).power(1 / softcap).plus(get).power(softcap).minus(player.vaporization.clouds);
    } else { global.vaporizationInfo.get.setValue('0'); }
};

export const vaporizationResetCheck = (auto = false, clouds = null as number | null): boolean => {
    assignNewClouds();
    const info = global.vaporizationInfo;
    if (player.upgrades[2][2] < 1 || info.get.lessOrEqual('0')) { return false; }

    if (clouds !== null) {
        if (player.strangeness[2][4] >= 2) {
            vaporizationReset(clouds);
            if (!auto) { return true; }
            assignNewClouds();
            if (info.get.lessOrEqual('0')) { return false; }
        } else if (!auto) { return false; }
    }
    if (auto) {
        if (player.strangeness[2][4] < 1 || (player.vaporization.clouds.moreOrEqual(player.vaporization.input[1]) && player.vaporization.input[1] > 0)) { return false; }
        const rainPost = calculateEffects.S2Extra1_2(true);
        const rainNow = calculateEffects.S2Extra1_2();
        if (calculateEffects.clouds(true).divide(info.strength).multiply((rainPost[0] / rainNow[0]) * (rainPost[1] / rainNow[1])).lessThan(player.vaporization.input[0])) { return false; }
        vaporizationReset();
    }
    return true;
};

export const vaporizationAsyncReset = async() => {
    if (!vaporizationResetCheck()) { return; }
    const info = global.vaporizationInfo;
    const increase = player.vaporization.clouds.moreThan('0') ? new Overlimit(info.get).divide(player.vaporization.clouds).multiply('1e2') : 100;

    if (player.toggles.confirm[2] !== 'None') {
        const rainPost = calculateEffects.S2Extra1_2(true);
        const rainNow = calculateEffects.S2Extra1_2();
        if (player.toggles.confirm[2] !== 'Safe' || player.stage.active !== 2 || player.strangeness[2][4] >= 2 || calculateEffects.clouds(true).divide(info.strength).multiply((rainPost[0] / rainNow[0]) * (rainPost[1] / rainNow[1])).lessThan('2')) {
            if (!await Confirm(`Reset Structures and Upgrades for ${format(info.get)} (+${format(increase)}%) Clouds?`)) { return; }
            if (!vaporizationResetCheck()) { return Notify('Vaporization canceled, requirements are no longer met'); }
        }
    }

    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Caused Vaporization for ${format(info.get)} Clouds, +${format(increase)}%`; }
    vaporizationReset();
};

const vaporizationReset = (autoClouds = null as number | null) => {
    const vaporization = player.vaporization;

    if (autoClouds !== null) {
        vaporization.clouds.plus(new Overlimit(global.vaporizationInfo.get).multiply(autoClouds / 40));
    } else { vaporization.clouds.plus(global.vaporizationInfo.get); }
    if (vaporization.cloudsMax.lessThan(vaporization.clouds)) { vaporization.cloudsMax.setValue(vaporization.clouds); }
    awardMilestone(0, 2);
    awardVoidReward(2);
    if (autoClouds === null) { reset('vaporization', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [2]); }
};

export const assignMaxRank = () => {
    if (player.inflation.vacuum) {
        global.accretionInfo.maxRank = 6;
    } else {
        global.accretionInfo.maxRank = player.stage.true >= 4 || (player.stage.true === 3 && player.events[0]) ? 5 : 4;
    }
};

export const rankResetCheck = (auto = false): boolean => {
    const rank = player.accretion.rank;
    if (rank >= global.accretionInfo.maxRank) { return false; }

    if (player.inflation.vacuum) {
        if (new Overlimit(player.buildings[1][0].current).multiply('1.78266192e-33').lessThan(global.accretionInfo.rankCost[rank])) { return false; }
    } else if (player.buildings[3][0].current.lessThan(global.accretionInfo.rankCost[rank])) { return false; }

    if (auto) {
        if (player.strangeness[3][4] < 1) { return false; }
        rankReset();
    }
    return true;
};

export const rankAsyncReset = async() => {
    if (!rankResetCheck()) { return; }

    if (player.toggles.confirm[3] !== 'None' && player.accretion.rank !== 0) {
        if (player.toggles.confirm[3] !== 'Safe' || player.stage.active !== 3) {
            if (!await Confirm('Reset Structures, Upgrades and Stage Researches to increase current Rank?')) { return; }
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
        if (globalSave.toggles[2]) {
            setActiveStage(4);
            stageUpdate();
        } else { stageUpdate('soft'); }
    }
    awardVoidReward(3);
    reset('rank', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [3]);
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
        massGain = (massGain * (player.challenges.active === 0 ? 60 : 96)) + 1;
    } else {
        if (elements[10] >= 1) { massGain *= 2; }
        if (player.researchesExtra[4][1] >= 1) { massGain *= calculateEffects.S4Extra1(); }
        massGain *= global.collapseInfo.starEffect[2];
        if (player.strangeness[5][7] >= 1) { massGain *= global.strangeInfo.stageBoost[5]; }
    }
    return massGain;
};

export const assignNewMass = () => {
    global.collapseInfo.newMass = !player.inflation.vacuum ? calculateMassGain() :
        Math.min(new Overlimit(player.buildings[1][0].current).multiply('8.96499278339628e-67').toNumber(), global.inflationInfo.massCap); //1.78266192e-33 / 1.98847e33
};
export const assignNewRemnants = () => {
    const building = player.buildings[4];
    const starCheck = global.collapseInfo.starCheck;
    const stars = player.collapse.stars;
    starCheck[0] = building[2].trueTotal.moreThan('0') ? Math.max(building[2].true + Math.floor(building[1].true * player.strangeness[4][3] / 10) - stars[0], 0) : 0;
    starCheck[1] = Math.max(building[3].true - stars[1], 0);
    starCheck[2] = Math.max(building[4].true - stars[2], 0);
};

export const collapseResetCheck = (auto = false, remnants = false): boolean => {
    if (player.upgrades[4][0] < 1) { return false; }
    assignNewRemnants();
    const info = global.collapseInfo;

    if (remnants) {
        if (player.strangeness[4][4] >= 2 && (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0)) {
            collapseReset(true);
            if (!auto) { return true; }
            assignNewRemnants();
        } else if (!auto) { return false; }
    }
    assignNewMass();

    if (auto) {
        if (player.strangeness[4][4] < 1 || (player.inflation.vacuum && player.collapse.input[1] && new Overlimit(player.buildings[1][0].current).multiply('8.96499278339628e-67').toNumber() < global.inflationInfo.massCap && player.collapse.mass < info.newMass)) { return false; }
        const massBoostBase = (calculateEffects.mass(true) / info.massEffect) * (calculateEffects.S4Research4(true) / calculateEffects.S4Research4());
        if (massBoostBase >= player.collapse.input[0]) {
            collapseReset();
            return true;
        }
        /*if (player.toggles.buildings[5][3] && calculateBuildingsCost(3, 5).lessOrEqual(info.newMass)) {
            collapseReset();
            return true;
        }*/
        if (player.strangeness[4][4] >= 2 || (massBoostBase * (calculateEffects.star[0](true) / info.starEffect[0]) * (calculateEffects.star[1](true) / info.starEffect[1]) * (calculateEffects.star[2](true) / info.starEffect[2]) < player.collapse.input[0])) { return false; }
        collapseReset();
        return true;
    }

    return info.newMass > player.collapse.mass || (player.strangeness[4][4] < 2 && (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0)) || player.elements.includes(0.5, 1);
};

export const collapseAsyncReset = async() => {
    if (!collapseResetCheck()) { return; }
    const { newMass, starCheck: newStars } = global.collapseInfo;
    const mass = player.collapse.mass;
    let count = 0;
    for (let i = 1; i < playerStart.elements.length; i++) {
        i = player.elements.indexOf(0.5, i);
        if (i < 1) { break; }
        count++;
    }

    if (player.toggles.confirm[4] !== 'None') {
        const unlockedG = player.researchesExtra[5][0] >= 1;
        const cantAffordG = calculateBuildingsCost(3, 5).moreThan(newMass);
        const notMaxed = player.inflation.vacuum && new Overlimit(player.buildings[1][0].current).multiply('8.96499278339628e-67').toNumber() < global.inflationInfo.massCap;
        if (player.toggles.confirm[4] !== 'Safe' || (player.stage.active !== 4 && player.stage.active !== 5) || (newMass > mass && notMaxed && (!unlockedG || cantAffordG))) {
            let message = 'This will reset all special and Stage Researches, Upgrades and Structures';
            if (newMass > mass) {
                message += `\nSolar mass will increase to ${format(newMass)}`;
                if (notMaxed) { message += '\n(Hardcap is not reached)'; }
                if (unlockedG && cantAffordG) { message += '\n(Not enough for a new Galaxy)'; }
            } else { message += "\nSolar mass won't change"; }
            if (newStars[0] > 0 || newStars[1] > 0 || newStars[2] > 0) {
                message += '\nAlso will gain new Star remnants:';
                if (newStars[0] > 0) { message += `\n'Red giants' - ${format(newStars[0])}`; }
                if (newStars[1] > 0) { message += `\n'Neutron stars' - ${format(newStars[1])}`; }
                if (newStars[2] > 0) { message += `\n'Black holes' - ${format(newStars[2])}`; }
            }

            if (count > 0) { message += `\n${format(count)} new Elements will activate`; }

            if (!await Confirm(message + '\nContinue?')) { return; }
            if (!collapseResetCheck()) { return Notify('Collapse canceled, requirements are no longer met'); }
        }
    }

    if (globalSave.SRSettings[0]) {
        let message = `Caused Collapse to${count > 0 ? ` activate ${format(count)} new Elements and` : ''} ${newMass > mass ? `increase Solar mass to ${format(newMass)}` : ''}`;
        if (newStars[0] > 0 || newStars[1] > 0 || newStars[2] > 0) {
            message += newMass > mass ? ', also gained' : 'gain';
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
    awardMilestone(1, 4);
    if (!noReset) {
        for (let i = 1; i < playerStart.elements.length; i++) {
            i = player.elements.indexOf(0.5, i);
            if (i < 1) { break; }
            buyUpgrades(i, 4, 'elements', true);
        }
        if (collapseInfo.newMass > collapse.mass) {
            collapse.mass = collapseInfo.newMass;
            if (collapse.massMax < collapse.mass) { collapse.massMax = collapse.mass; }
        }

        awardMilestone(0, 4);
        reset('collapse', player.inflation.vacuum ? [1, 2, 3, 4, 5] : (player.strangeness[5][5] < 1 ? [4, 5] : [4]));
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(1, 4, 'researches');
    }
    awardVoidReward(4);
};

export const calculateInstability = () => {
    const milestones = player.milestones;
    let value = 0;
    if (milestones[1][0] >= 6) { value++; }
    if (milestones[2][1] >= 7) { value++; }
    if (milestones[3][1] >= 7) { value++; }
    if (milestones[4][1] >= 8) { value++; }
    if (milestones[5][1] >= 8) { value++; }
    global.strangeInfo.instability = value;
};

export const calculateMilestoneInformation = (index: number, stageIndex: number) => {
    if (player.inflation.vacuum) { return; }
    const level = player.milestones[stageIndex][index];
    const scaling = global.milestonesInfo[stageIndex].scaling[index];
    global.milestonesInfo[stageIndex].need[index].setValue(level < scaling.length ? scaling[level] : '0');
};

const awardMilestone = (index: number, stageIndex: number, count = 0) => {
    if (!milestoneCheck(index, stageIndex)) {
        if (count > 0) {
            Notify(`Milestone '${global.milestonesInfo[stageIndex].name[index]}' ${count > 1 ? `${format(count)} new tiers` : 'new tier'} reached\nTotal is now: ${format(player.milestones[stageIndex][index])}`);
            if (!player.inflation.vacuum) {
                if (stageIndex === 5 && index === 0 && player.milestones[5][0] >= 8) {
                    calculateMaxLevel(6, 4, 'strangeness', true);
                    calculateMaxLevel(0, 5, 'ASR', true);
                }
                player.strange[0].current += count;
                player.strange[0].total += count;
                calculateInstability();
                assignStrangeBoost();
            }
            if (global.lastMilestone[1] === stageIndex && global.lastMilestone[0] === index) {
                getStrangenessDescription(index, stageIndex, 'milestones');
            }
        }
        return;
    }

    player.milestones[stageIndex][index]++;
    calculateMilestoneInformation(index, stageIndex);
    awardMilestone(index, stageIndex, count + 1);
};

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
        if (player.collapse.stars[0] > 1) { progress++; }
        if (player.collapse.stars[1] > 1) { progress++; }
        if (player.collapse.stars[2] > 1) { progress++; }
    } else if (index === 5) {
        if (player.buildings[5][3].true >= 1) { progress++; }
    }
    if (old >= progress) { return; }

    player.challenges.void[index] = progress;
    for (let i = old; i < progress; i++) {
        Notify(`New Void reward achieved\nReward: ${global.challengesInfo.rewardText[0][index][i]}`);
    }
    if (index === 3) {
        calculateMaxLevel(0, 1, 'strangeness', true);
        calculateMaxLevel(3, 1, 'strangeness', true);
        calculateMaxLevel(1, 2, 'strangeness', true);
        calculateMaxLevel(3, 2, 'strangeness', true);
        calculateMaxLevel(0, 3, 'strangeness', true);
        calculateMaxLevel(1, 3, 'strangeness', true);
        calculateMaxLevel(0, 4, 'strangeness', true);
        calculateMaxLevel(1, 4, 'strangeness', true);
        calculateMaxLevel(1, 5, 'strangeness', true);
    } else if (index === 4) {
        calculateMaxLevel(4, 1, 'strangeness', true);
        calculateMaxLevel(4, 2, 'strangeness', true);
        calculateMaxLevel(4, 3, 'strangeness', true);
        calculateMaxLevel(4, 4, 'strangeness', true);
    }
    if (global.lastChallenge[0] === 0) {
        getChallengeDescription(0);
        if (global.lastChallenge[1] === index) { getChallengeReward(index); }
    }
};

export const enterExitChallenge = async(index: number) => {
    const old = index;
    if (player.challenges.active === index) {
        if (!await Confirm(`Leave the '${global.challengesInfo.name[index]}'?`)) { return; }
        index = -1;
    } else {
        if (!player.inflation.vacuum) { return; }
        if (index === 0 && player.strangeness[5][0] < 1) { return; }
        if (!await Confirm(`Enter the '${global.challengesInfo.name[index]}'?`)) { return; }
    }

    const reward = stageResetCheck(5);
    player.challenges.active = index;
    if (!reward) {
        stageResetNoReward();
    } else { stageResetReward(5); }
    if (old === 0) { assignEnergyArray(); }

    getChallengeDescription(old);
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = index === -1 ? `You left the '${global.challengesInfo.name[old]}'` : `'${global.challengesInfo.name[index]}' is now active`; }
};
