import { checkBuilding, checkUpgrade, milestoneCheck } from './Check';
import Limit from './Limit';
import { getId } from './Main';
import { cloneArray, global, logAny, player } from './Player';
import { reset, resetStage } from './Reset';
import { Alert, Confirm, Notify } from './Special';
import type { overlimit } from './Types';
import { format, getChallengeDescription, numbersUpdate, stageUpdate, switchTab, visualUpdateResearches, visualUpdateUpgrades } from './Update';

export const calculateEffects = {
    S1Upgrade6: (): number => 10 + 3 * player.researches[1][0], //Need to be divided by 100
    S1Upgrade7: (): number => (102 + player.researches[1][1]) / 100,
    S1Upgrade9: (): number => {
        const energy = Math.max(player.discharge.energy, 1);
        return energy > 4e4 ? (energy / 4e4) ** 0.4 * 4e4 : energy;
    },
    S1Research2: (): number => 20 + player.strangeness[1][5],
    S1Research5: (): number => 1.25 + player.researches[1][5] / 4,
    S1Extra1: (): number => {
        const level = player.researchesExtra[1][1];
        return level >= 4 ? 1.1 : level >= 3 ? 1.2 : (20 - 3 * level) / 10;
    },
    S1Extra3: (): number => player.researchesExtra[1][3] / 20,
    S1Extra4: (): number => 1 + global.dischargeInfo.base / 100,
    clouds: (post = false): overlimit => {
        let effect = Limit(player.vaporization.clouds).plus('1').toArray();
        if (post) { effect = Limit(effect).plus(global.vaporizationInfo.get).toArray(); }

        if (Limit(effect).moreThan('1e4')) { effect = Limit(effect).minus('1e4').power(0.7).plus('1e4').toArray(); }
        return effect;
    },
    S2Upgrade1: (): overlimit => {
        const puddles = player.buildings[2][2];
        if (player.challenges.active === 0) {
            return Limit('1.01').power((Limit(puddles.current).toNumber() - puddles.true) ** 0.7 + puddles.true).toArray();
        } else {
            let effect = Limit('1.02').power((Limit(puddles.current).toNumber() - puddles.true) ** 0.7 + Math.min(puddles.true, 200)).toArray();
            if (puddles.true > 200) { effect = Limit('1.01').power(puddles.true - 200).multiply(effect).toArray(); }
            return effect;
        }
    },
    S2Upgrade2: (): number => 1e10 / 2 ** player.strangeness[2][3],
    S2Upgrade3: (): number => (1 + player.researches[2][2] / 2) / 100,
    S2Upgrade4: (): number => (1 + player.researches[2][3] / 2) / 100,
    S2Upgrade5: (): number => 1 + player.researches[2][4],
    S2Upgrade6: (): number => 1 + player.researches[2][5],
    S2Extra1_2: (post = false): [number, number] => {
        if (player.researchesExtra[2][1] < 1) { return [1, 1]; }
        let effect = player.vaporization.clouds as number | overlimit;
        if (post) { effect = Limit(effect).plus(global.vaporizationInfo.get).toArray(); }
        if (player.researchesExtra[2][2] < 1) { return [Limit(effect).max('1').power(0.1).toNumber(), 1]; }
        effect = Limit(effect).max('1').power(0.11).toNumber();
        return [effect, (effect - 1) / 16 + 1]; //[Rain, Storm]
    },
    S3Upgrade0: (): number => (101 + player.researches[3][1]) / 100,
    S3Upgrade1: (): number => (5 + player.researchesExtra[3][3]) / 100,
    S3Upgrade3: (): number => (102 + player.researches[3][4] / 2) / 100,
    S3Research6: (): number => player.researches[3][6] / 40,
    S3Extra1: (): number => 1 + 0.1 * player.researchesExtra[3][1],
    S3Extra4: (growth: number): number => (growth - 1) / (32 / 2 ** player.researchesExtra[3][4]) + 1, //Growth is S3Extra1 ** true rank
    mass: (post = false): number => {
        let minValue = 1;

        let effect = player.collapse.mass;
        if (post) {
            minValue = 0.5;
            if (global.collapseInfo.newMass > effect) { effect = global.collapseInfo.newMass; }
        }

        let power = 1;
        if (player.challenges.active === 0) {
            effect /= 40;
            power -= 0.2;
        }

        if (player.elements[21] >= minValue) { power += 0.1; }
        return effect ** (effect > 1 ? power : 2 - power);
    },
    star: [
        (post = false): number => {
            let minValue = 1;

            let effect = player.collapse.stars[0] + 1;
            if (post) {
                minValue = 0.5;
                effect += global.collapseInfo.starCheck[0];
            }

            if (player.elements[6] >= minValue) { effect **= calculateEffects.element6(); }
            return effect;
        },
        (post = false): number => {
            let minValue = 1;

            let stars = player.collapse.stars[1];
            if (post) {
                minValue = 0.5;
                stars += global.collapseInfo.starCheck[1];
                if (player.elements[22] >= minValue) { stars += global.collapseInfo.starCheck[0]; }
            }
            if (player.elements[22] >= minValue) { stars += player.collapse.stars[0]; }

            let effect = (stars + 1) ** (0.5 + player.strangeness[4][10] / 40);
            if (player.elements[12] >= minValue) {
                const base = calculateEffects.element12();
                effect *= logAny(stars + base, base);
            }
            return effect;
        },
        (post = false): number => {
            let minValue = 1;

            let blackHoles = player.collapse.stars[2];
            if (post) {
                minValue = 0.5;
                blackHoles += global.collapseInfo.starCheck[2];
            }

            if (blackHoles < 1) { return 1; }
            return (blackHoles + 1) / logAny(blackHoles + 2, player.elements[18] >= minValue ? 3 : 2);
        }
    ],
    S4Research0: (): number => {
        let effect = 1.3 + 0.15 * player.researches[4][2];
        if (player.inflation.vacuum) { effect += global.milestonesInfo[3].reward[1]; }
        return effect;
    },
    S4Research1: (): number => {
        let base = player.challenges.active === 0 ? 0.004 : 0.005;
        if (player.researchesExtra[4][1] >= 1) { base += 0.001; }
        const level = player.researches[4][1];
        let effective = level > 0 ? 1 + Math.min(level, 4) : 0;
        if (level > 4) { effective += 0.5; }
        if (level > 5) { effective += level / 4 - 1.25; }
        return 1 + base * effective;
    },
    S4Research4: (post = false): number => {
        if (player.researches[4][4] < 1) { return 1; }
        let minValue = 1;

        let holes = player.collapse.stars[2];
        let mass = player.collapse.mass;
        if (post) {
            minValue = 0.5;
            if (player.strangeness[4][5] < 2) { holes += global.collapseInfo.starCheck[2]; } //Just in case to prevent early reset
            if (global.collapseInfo.newMass > mass) { mass = global.collapseInfo.newMass; }
        }

        let effect = logAny(holes + 3, player.researches[4][4] >= 2 ? 2 : 3);
        if (player.elements[23] >= minValue) { effect *= mass ** 0.1; }
        return effect;
    },
    S4Extra1: (): number => (10 + player.researches[4][1]) / 10,
    S5Upgrade0: (): number => 3 * (2 ** player.strangeness[5][3]),
    S5Upgrade1: (): number => 2 * (3 ** player.strangeness[5][4]),
    element6: (): number => player.researchesExtra[4][2] >= 1 ? 2 : 1.5,
    element12: (): number => 10 - player.strangeness[4][10],
    element24: (): number => player.inflation.vacuum || player.milestones[1][1] >= 6 ? 0.02 : 0.01,
    element27: (): number => {
        let effect = Limit(player.buildings[4][0].trueTotal).log(10).toNumber() - 48;
        if (!player.inflation.vacuum && player.upgrades[5][2] === 1) { effect **= 1.5; }
        return Math.max(Math.floor(effect), 0);
    },
    element28: (): number => player.researchesExtra[4][2] >= 1 ? 3 : 2,
    S2Strange9: (): number => {
        if (Limit(player.vaporization.clouds).lessOrEqual('1')) { return 1; }
        return Limit(player.vaporization.clouds).log(10).toNumber() / 50 + 1;
    }
};

export const assignBuildingInformation = () => {
    const { buildings, upgrades, researches, researchesExtra, elements, strangeness } = player;
    const { dischargeInfo, vaporizationInfo, collapseInfo, milestonesInfo } = global;
    const producing = global.buildingsInfo.producing;
    const stageBoost = global.strangeInfo.stageBoost;
    const activeAll = global.stageInfo.activeAll;
    const vacuum = player.inflation.vacuum;
    const inVoid = player.challenges.active === 0;

    if (activeAll.includes(1)) {
        const b3 = vacuum ? 3 : 1;
        const b4 = vacuum ? 4 : 2;
        const b5 = vacuum ? 5 : 3;

        dischargeInfo.total = player.discharge.current + (strangeness[1][2] / 2);
        if (stageBoost[1] !== null) { dischargeInfo.total += stageBoost[1]; }
        dischargeInfo.base = 4 + researches[1][4] + strangeness[1][0];
        if (inVoid) { dischargeInfo.base = (dischargeInfo.base - 1) / 2 + 1; }
        let totalMultiplier = (dischargeInfo.base ** dischargeInfo.total) * (1.3 ** strangeness[1][9]);
        if (vacuum) { totalMultiplier *= milestonesInfo[1].reward[0]; }
        const selfBoost = calculateEffects.S1Upgrade7();

        const listForMult5 = [buildings[1][b5].current];
        let prod5Number = 0.2 * totalMultiplier;
        if (vacuum && upgrades[1][4] === 1) { prod5Number *= 5; }
        if (upgrades[1][7] === 1) { listForMult5.push(Limit(selfBoost).power(buildings[1][b5].true).toArray()); }
        producing[1][b5] = Limit(prod5Number).multiply(...listForMult5).toArray();

        if (Limit(producing[1][b5]).moreThan('1')) {
            let radiation = calculateEffects.S1Research2() ** researches[1][2];
            if (upgrades[1][9] === 1) { radiation *= calculateEffects.S1Upgrade9(); }
            if (researches[1][5] >= 1) { radiation *= player.discharge.current ** calculateEffects.S1Research5(); }
            dischargeInfo.tritium = Limit(producing[1][b5]).log(calculateEffects.S1Extra1()).multiply(radiation).toArray();
        } else { dischargeInfo.tritium = [0, 0]; }

        const listForMult4 = [buildings[1][b4].current];
        let prod4Number = (vacuum ? 0.2 : 0.6) * totalMultiplier;
        if (vacuum) {
            if (upgrades[1][3] === 1) { prod4Number *= 5; }
        } else if (upgrades[1][4] === 1) { prod4Number *= 5; }
        if (upgrades[1][7] === 1) { listForMult4.push(Limit(selfBoost).power(buildings[1][b4].true).toArray()); }
        producing[1][b4] = Limit(prod4Number).multiply(...listForMult4).toArray();

        const listForMult3 = [buildings[1][b3].current];
        let prod3Number = (vacuum ? 0.2 : 0.4) * totalMultiplier;
        if (upgrades[1][0] === 1) { prod3Number *= 5; }
        if (!vacuum && upgrades[1][3] === 1) { prod3Number *= 5; }
        if (upgrades[1][7] === 1) { listForMult3.push(Limit(selfBoost).power(buildings[1][b3].true).toArray()); }
        producing[1][b3] = Limit(prod3Number).multiply(...listForMult3).toArray();

        if (vacuum) {
            const listForMult2 = [buildings[1][2].current];
            if (upgrades[1][7] === 1) { listForMult2.push(Limit(selfBoost).power(buildings[1][2].true).toArray()); }
            producing[1][2] = Limit(0.2 * totalMultiplier).multiply(...listForMult2).toArray();

            const listForMult1 = [buildings[1][1].current];
            if (upgrades[1][7] === 1) { listForMult1.push(Limit(selfBoost).power(buildings[1][1].true).toArray()); }
            producing[1][1] = Limit(0.001 * totalMultiplier).multiply(...listForMult1).toArray();
            if (Limit(producing[1][1]).moreThan('1')) { producing[1][1] = Limit(producing[1][1]).power(0.15).toArray(); }
        }
    }
    if (activeAll.includes(2)) {
        producing[2][6] = Limit(Math.max(2 * buildings[2][6].true, 1)).toArray();

        const rain = calculateEffects.S2Extra1_2();
        producing[2][5] = Limit(2 * rain[1]).multiply(buildings[2][5].current, producing[2][6]).max('1').toArray();

        producing[2][4] = Limit('2').multiply(buildings[2][4].current, producing[2][5]).max('1').toArray();

        producing[2][3] = Limit('2').multiply(buildings[2][3].current, producing[2][4]).max('1').toArray();

        vaporizationInfo.strength = calculateEffects.clouds();
        const listForMult2 = [producing[2][3], vaporizationInfo.strength];
        vaporizationInfo.tension = upgrades[2][3] === 1 ? Limit(buildings[2][0].current).max('1').power(calculateEffects.S2Upgrade3()).toNumber() : 1;
        vaporizationInfo.stress = upgrades[2][4] === 1 ? Limit(buildings[2][1].current).max('1').power(calculateEffects.S2Upgrade4()).toNumber() : 1;
        let prod2Number = (inVoid ? 0.01 : 2) * Limit(buildings[2][2].current).toNumber() * vaporizationInfo.tension * vaporizationInfo.stress * rain[0] * (1.5 ** strangeness[2][1]);
        if (upgrades[2][1] === 1) { listForMult2.push(calculateEffects.S2Upgrade1()); }
        if (researches[2][1] >= 1) {
            if (vaporizationInfo.research1 !== researches[2][1]) { vaporizationInfo.research1 = Math.min(researches[2][1], Math.max(Math.floor(Limit(buildings[2][1].total).divide('1e2').plus('1').log(5).toNumber()), 0)); }
            prod2Number *= 2 ** vaporizationInfo.research1;
        }
        if (vacuum) { prod2Number *= milestonesInfo[2].reward[1]; }
        if (stageBoost[2] !== null) { prod2Number *= stageBoost[2]; }
        producing[2][2] = Limit(prod2Number).multiply(...listForMult2).toArray();

        vaporizationInfo.dropsEff = buildings[2][1].current;
        if (inVoid) {
            if (Limit(vaporizationInfo.dropsEff).moreThan('1')) { vaporizationInfo.dropsEff = Limit(vaporizationInfo.dropsEff).power(0.1).toArray(); }
        } else if (vacuum) {
            const excess = Limit(vaporizationInfo.dropsEff).minus(buildings[2][1].true).toArray();
            if (Limit(excess).moreThan('1')) { vaporizationInfo.dropsEff = Limit(excess).power(0.2).plus(buildings[2][1].true).toArray(); }
        }
        const listForMult1 = [vaporizationInfo.dropsEff];
        if (upgrades[2][0] === 1) { listForMult1.push(Limit('1.04').power(buildings[2][1].true).toArray()); }
        let prod1Number = (vacuum ? 1 : 2e-4) * (1.5 ** strangeness[2][0]);
        if (researches[2][0] >= 1) {
            if (vaporizationInfo.research0 !== researches[2][0]) { vaporizationInfo.research0 = Math.min(researches[2][0], Math.max(Math.floor(Limit(buildings[2][1].total).divide('1e1').log(1.36).toNumber() + 1), 0)); }
            prod1Number *= 3 ** vaporizationInfo.research0;
        }
        producing[2][1] = Limit(prod1Number).multiply(...listForMult1).toArray();
        if (vacuum) {
            producing[2][1] = Limit(producing[2][1]).plus('1').toArray();
            dischargeInfo.tritium = Limit(dischargeInfo.tritium).multiply(producing[2][1]).toArray(); //Move to bottom if anything from further Stages will boost Drops
        }
    } //else if (vacuum) { producing[2][1] = [1, 0]; }
    if (activeAll.includes(3)) {
        const rank = player.accretion.rank;
        global.accretionInfo.effective = rank + strangeness[3][10];

        producing[3][5] = Limit('1.1').power(buildings[3][5].true).toArray();

        producing[3][4] = Limit((upgrades[3][12] === 1 ? '1.14' : '1.1')).power(buildings[3][4].true).multiply(producing[3][5]).toArray();
        const satellitesBoost: overlimit = strangeness[3][3] < 1 ? [1, 0] : Limit(producing[3][4]).power(vacuum ? 0.2 : 0.4).toArray();

        const listForMult3 = [buildings[3][3].current, producing[3][4]];
        let prod3Number = 0.2 * (1.5 ** strangeness[3][1]);
        if (researchesExtra[3][2] >= 1) { prod3Number *= 2; }
        if (upgrades[3][7] === 1) { listForMult3.push(Limit('1.02').power(buildings[3][3].true).toArray()); }
        producing[3][3] = Limit(prod3Number).multiply(...listForMult3).toArray();

        const listForMult2 = [buildings[3][2].current, satellitesBoost];
        let prod2Number = (3 ** researches[3][2]) * (1.5 ** strangeness[3][1]);
        if (upgrades[3][3] === 1) { listForMult2.push(Limit(calculateEffects.S3Upgrade3()).power(buildings[3][2].true).toArray()); }
        if (upgrades[3][4] === 1) { prod2Number *= 3; }
        if (researches[3][6] >= 1) { listForMult2.push(Limit(buildings[3][0].current).power(calculateEffects.S3Research6()).toArray()); }
        producing[3][2] = Limit(prod2Number).multiply(...listForMult2).toArray();

        const listForMult1 = [buildings[3][1].current, satellitesBoost];
        const growth = calculateEffects.S3Extra1();
        let prod1Number = (vacuum ? 1 : 8e-20) * (3 ** researches[3][0]) * (2 ** researches[3][3]) * (3 ** researches[3][5]) * (1.1 ** researchesExtra[3][0]) * (1.5 ** strangeness[3][0]);
        if (vacuum) { prod1Number *= milestonesInfo[3].reward[0]; }
        if (upgrades[3][0] === 1) { listForMult1.push(Limit(calculateEffects.S3Upgrade0()).power(buildings[3][1].true).toArray()); }
        if (upgrades[3][1] === 1) { prod1Number *= Limit(buildings[3][1].current).power(calculateEffects.S3Upgrade1()).toNumber(); }
        if (upgrades[3][2] === 1) { prod1Number *= 2; }
        if (upgrades[3][5] === 1) { prod1Number *= 3; }
        if (upgrades[3][6] === 1) { prod1Number *= 2 * 1.5 ** researches[3][7]; }
        if (upgrades[3][9] === 1) { prod1Number *= 2; }
        if (upgrades[3][10] === 1) { prod1Number *= 8 * 2 ** researches[3][8]; }
        if (researchesExtra[3][1] >= 1) { prod1Number *= growth ** global.accretionInfo.effective; }
        producing[3][1] = Limit(prod1Number).multiply(...listForMult1).toArray();
        if (vacuum) {
            producing[3][1] = Limit(producing[3][1]).plus('1').toArray();
            if (inVoid) {
                producing[3][1] = Limit(producing[3][1]).power(rank >= 5 ? 0.84 : 0.92).toArray();
            } else if (rank >= 5) { producing[3][1] = Limit(producing[3][1]).power(0.92).toArray(); }

            if (researchesExtra[3][4] >= 1) { producing[2][2] = Limit(producing[2][2]).multiply(calculateEffects.S3Extra4(growth ** rank)).toArray(); }
        } else if (rank >= 5) {
            producing[3][1] = Limit(producing[3][1]).power(Limit(producing[3][1]).lessThan('1') ? 1.1 : 0.9).toArray();
        }
    } else if (vacuum) { producing[3][1] = [1, 0]; }
    if (activeAll.includes(4)) {
        collapseInfo.massEffect = calculateEffects.mass();
        collapseInfo.starEffect = [calculateEffects.star[0](), calculateEffects.star[1](), calculateEffects.star[2]()];
        const listForTotal = [Limit(calculateEffects.S4Research1()).power(global.collapseInfo.trueStars).toArray()];
        let totalNumber = (calculateEffects.S4Research0() ** researches[4][0]) * collapseInfo.massEffect * collapseInfo.starEffect[1] * (1.25 ** researches[4][3]) * calculateEffects.S4Research4() * (1.5 ** strangeness[4][0]);
        if (elements[4] === 1) { totalNumber *= 1.2; }
        if (elements[14] === 1) { totalNumber *= 1.4; }
        if (elements[19] === 1) { totalNumber *= 2; }
        if (elements[24] === 1) { totalNumber *= Limit(buildings[4][0].current).max('1').power(calculateEffects.element24()).toNumber(); }
        if (elements[28] === 1) { totalNumber *= calculateEffects.element28(); }
        if (vacuum) {
            if (researchesExtra[1][4] >= 1) { totalNumber *= calculateEffects.S1Extra4() ** player.discharge.current; }
            if (researchesExtra[2][3] >= 1) { totalNumber *= vaporizationInfo.tension; }
            if (researchesExtra[2][3] >= 2) { totalNumber *= vaporizationInfo.stress; }
            totalNumber *= milestonesInfo[4].reward[0];
        }
        if (stageBoost[4] !== null) { totalNumber *= stageBoost[4]; }
        const totalMultiplier = Limit(totalNumber).multiply(...listForTotal).toArray();

        producing[4][5] = Limit('1e12').multiply(buildings[4][5].current, totalMultiplier).toArray();

        producing[4][4] = Limit('2e9').multiply(buildings[4][4].current, totalMultiplier).toArray();

        producing[4][3] = Limit('3e7').multiply(buildings[4][3].current, totalMultiplier).toArray();

        const prod2Number = 400 * collapseInfo.starEffect[0] * (4 ** researches[4][3]);
        producing[4][2] = Limit(prod2Number).multiply(buildings[4][2].current, totalMultiplier).toArray();

        let prod1Number = 50;
        if (elements[1] === 1) { prod1Number *= 2; }
        producing[4][1] = Limit(prod1Number).multiply(buildings[4][1].current, totalMultiplier).toArray();
    } else { collapseInfo.starEffect[2] = 1; }
    if (activeAll.includes(5)) {
        let prod3Number = vacuum ? 2 : 10;
        if (vacuum) {
            if (upgrades[5][2] === 1) { prod3Number += 1; }
            prod3Number += milestonesInfo[5].reward[1];
        }
        producing[5][3] = Limit(prod3Number).power(buildings[5][3].true).toArray();

        const listForMult2 = [buildings[5][2].current, producing[5][3]];
        let prod2Number = 1.5 * (3 ** researches[5][1]);
        if (upgrades[5][1] === 1) { prod2Number *= calculateEffects.S5Upgrade1(); }
        producing[5][2] = Limit(prod2Number).multiply(...listForMult2).max('1').toArray();

        const listForMult1 = [buildings[5][1].current, producing[5][3]];
        let prod1Number = 4 ** researches[5][0];
        if (upgrades[5][0] === 1) { prod1Number *= calculateEffects.S5Upgrade0(); }
        producing[5][1] = Limit(prod1Number).multiply(...listForMult1).toArray();

        producing[4][4] = Limit(producing[4][4]).multiply(producing[5][2]).toArray();
        if (researches[5][1] >= 1) { producing[4][3] = Limit(producing[4][3]).multiply(producing[5][2]).divide('3').toArray(); }
        if (researches[5][1] >= 2) { producing[4][2] = Limit(producing[4][2]).multiply(producing[5][2]).divide('9').toArray(); }
        if (researches[5][1] >= 3) { producing[4][1] = Limit(producing[4][1]).multiply(producing[5][2]).divide('27').toArray(); }
    }
    if (vacuum) {
        const inflationInfo = global.inflationInfo;
        inflationInfo.preonTrue = producing[1][1];
        inflationInfo.dustTrue = producing[3][1];

        inflationInfo.dustCap = Limit(8e46 * calculateMassGain()).toArray();
        if (Limit(producing[3][1]).moreThan(inflationInfo.dustCap)) {
            const multiplier = Math.min(Limit(producing[3][1]).divide(inflationInfo.dustCap).toNumber(), 1.4 ** player.strangeness[3][9]);
            inflationInfo.massCap = 60 / multiplier;
            inflationInfo.dustCap = Limit(inflationInfo.dustCap).multiply(multiplier).toArray();
            producing[3][1] = inflationInfo.dustCap;
        } else { inflationInfo.massCap = 60; }

        let preonsCap = 1e14 * (Math.max(player.discharge.energy, 1) ** calculateEffects.S1Extra3()) * collapseInfo.starEffect[2] * milestonesInfo[4].reward[1];
        if (elements[10] === 1) { preonsCap *= 2; }
        if (researchesExtra[4][1] >= 1) { preonsCap *= calculateEffects.S4Extra1(); }
        inflationInfo.preonCap = Limit(preonsCap).multiply(producing[3][1]).toArray();
        if (Limit(producing[1][1]).moreThan(inflationInfo.preonCap)) { producing[1][1] = inflationInfo.preonCap; }
    }
};

export const buyBuilding = (index: number, stageIndex = player.stage.active, auto = false) => {
    if (!checkBuilding(index, stageIndex)) { return; }
    const building = player.buildings[stageIndex][index as 1];

    let pointer; //For cost
    let currency;
    let special = '' as '' | 'Free' | 'Moles' | 'Mass' | 'Galaxy';
    if (stageIndex === 1) {
        pointer = player.buildings[1][index - 1];
        if (index === 1 && player.inflation.vacuum && player.strangeness[1][10] >= 1) { special = 'Free'; }
    } else if (stageIndex === 2) {
        if (index === 1 && player.inflation.vacuum) {
            special = 'Moles';
            pointer = player.buildings[1][5];
            currency = Limit(pointer.current).divide('6.02214076e23').toArray();
        } else { pointer = player.buildings[2][index === 1 ? 0 : 1]; }
    } else if (stageIndex === 3) {
        if (player.inflation.vacuum) {
            special = 'Mass';
            pointer = player.buildings[1][0];
            currency = Limit(pointer.current).multiply('1.78266192e-33').toArray();
        } else { pointer = player.buildings[3][0]; }
    } else /*if (stageIndex >= 4)*/ {
        pointer = player.buildings[4][0];
        if (stageIndex === 5 && index === 3) {
            special = 'Galaxy';
            currency = player.collapse.mass;
        }
    }
    if (currency === undefined) { currency = pointer.current; }

    let budget = currency;
    if (auto && building.true > 0 && special !== 'Free' && special !== 'Galaxy') {
        if (special === 'Mass' && player.strangeness[3][4] >= 2 && Limit(global.inflationInfo.dustTrue).moreOrEqual(global.inflationInfo.dustCap)) {
            budget = Limit(global.inflationInfo.preonCap).multiply(global.inflationInfo.massCap, '-1.78266192e-33').plus(currency).toArray();
        } else {
            budget = Limit(currency).divide(player.strangeness[1][7] >= 1 ? player.toggles.shop.wait[stageIndex] : '2').toArray();
        }
    }

    let total = calculateBuildingsCost(index, stageIndex); //This updates cost information
    if (Limit(total).moreThan(budget)) { return; }
    const howMany = auto ? -1 : (player.stage.resets < 1 && player.discharge.current < 1 ? 1 : player.toggles.shop.howMany);

    let canAfford = 1;
    if (howMany !== 1) {
        const increase = global.buildingsInfo.increase[stageIndex][index]; //Must be >1
        const firstCost = global.buildingsInfo.firstCost[stageIndex][index];
        if (special === 'Free') {
            canAfford = Math.floor(Limit(budget).divide(firstCost).log(increase).toNumber()) - building.true + 1;

            if (howMany !== -1) {
                if (canAfford < howMany) { return; }
                canAfford = howMany;
            }
        } else {
            /* Alternative formula */
            //max = floor(log((firstCost * increase ** building.true + increase * budget - budget) / firstCost) / log(increase)) - building.true;
            //total = firstCost * (increase ** (canAfford + building.true) - increase ** building.true) / (increase - 1);
            const totalBefore = Limit(increase).power(building.true).minus('1').divide(increase - 1).multiply(firstCost).toArray();
            canAfford = Math.floor(Limit(budget).plus(totalBefore).multiply(increase - 1).divide(firstCost).plus('1').log(increase).toNumber()) - building.true;

            if (howMany !== -1) {
                if (canAfford < howMany) { return; }
                canAfford = howMany;
            }
            total = Limit(increase).power(canAfford + building.true).minus('1').divide(increase - 1).multiply(firstCost).minus(totalBefore).toArray();
        }
    }
    if (!Limit(total).isFinite()) {
        if (global.debug.errorGain) {
            global.debug.errorGain = false;
            Notify(`Error inside Structure creation (${Limit(total).isNaN() ? 'NaN' : 'Infinity'} detected, debug ${stageIndex}-${index})`);
            setTimeout(() => { global.debug.errorGain = true; }, 6e4);
        }
        return;
    }

    building.true += canAfford;
    building.current = Limit(building.current).plus(canAfford).toArray();
    building.total = Limit(building.total).plus(canAfford).toArray();
    building.trueTotal = Limit(building.trueTotal).plus(canAfford).toArray();
    if (Limit(building.highest).lessThan(building.current)) { building.highest = cloneArray(building.current); }

    if (special === 'Galaxy') {
        reset('galaxy', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [4, 5]);
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(1, 4, 'researches');
        calculateMaxLevel(2, 4, 'researches');
        calculateMaxLevel(3, 4, 'researches');
        if (!auto && global.screenReader) { getId('SRMain').textContent = `Reseted progress for ${format(canAfford)} 'Galaxies'`; }
        awardMilestone(1, 5);
    } else {
        if (special !== 'Free') {
            currency = Limit(currency).minus(total).toArray();

            if (special === 'Moles') {
                pointer.current = Limit(currency).multiply('6.02214076e23').toArray();
                player.buildings[2][0].current = Limit(pointer.current).divide('6.02214076e23').toArray();
            } else if (special === 'Mass') {
                pointer.current = Limit(currency).divide('1.78266192e-33').toArray();
                player.buildings[3][0].current = Limit(pointer.current).multiply('1.78266192e-33').toArray();
            } else {
                pointer.current = currency;
            }
        }

        if (player.inflation.vacuum || stageIndex === 1) {
            assignEnergy(global.dischargeInfo.getEnergy(index, stageIndex) * canAfford);
            awardMilestone(1, 1);
        }

        if (stageIndex === 1) {
            if (index === 5 && player.upgrades[1][8] === 0 && player.inflation.vacuum) { player.buildings[2][0].current = Limit(building.current).divide('6.02214076e23').toArray(); }
        } else if (stageIndex === 2) {
            if (index !== 1) { assignPuddles(); }
        } else if (stageIndex === 3) {
            if (index >= 4) { awardMilestone(1, 3); }
        } else if (stageIndex === 4) {
            global.collapseInfo.trueStars += canAfford;
            awardMilestone(0, 5);
        }

        assignBuildingInformation();
        if (!auto) {
            numbersUpdate();
            if (global.screenReader) { getId('SRMain').textContent = `Made ${format(canAfford)} '${global.buildingsInfo.name[stageIndex][index]}'`; }
        }
    }
};

export const assignEnergy = (add = null as number | null) => {
    const discharge = player.discharge;

    if (add === null) {
        const { getEnergy, energyType } = global.dischargeInfo;

        add = 0;
        for (let s = 1; s < (player.inflation.vacuum ? energyType.length : 2); s++) {
            const buildings = player.buildings[s];
            for (let i = 1; i < energyType[s].length; i++) {
                add += getEnergy(i, s) * buildings[i as 1].true;
            }
        }

        global.dischargeInfo.energyTrue = add;
        if (player.strangeness[1][11] >= 1) { discharge.energy = add; }
    } else {
        global.dischargeInfo.energyTrue += add;
        discharge.energy += add;
        if (discharge.energyMax < discharge.energy) { discharge.energyMax = discharge.energy; }
    }
};

export const calculateBuildingsCost = (index: number, stageIndex: number): overlimit => {
    const buildingsInfo = global.buildingsInfo;

    if (stageIndex === 1) {
        let increase = 140;
        if (player.upgrades[1][6] === 1) { increase -= calculateEffects.S1Upgrade6(); }
        buildingsInfo.increase[1][index] = increase / 100;

        if (index === 1) {
            let cost = buildingsInfo.startCost[1][1];
            if (!player.inflation.vacuum && player.upgrades[1][2] === 1) { cost /= 10; }
            buildingsInfo.firstCost[1][1] = cost;
        } else if (index === 3) {
            let cost = buildingsInfo.startCost[1][3];
            if (player.upgrades[1][1] === 1) { cost /= 10; }
            buildingsInfo.firstCost[1][3] = cost;
        } else if (index === 4) {
            let cost = buildingsInfo.startCost[1][4];
            if (player.inflation.vacuum) {
                if (player.upgrades[1][2] === 1) { cost /= 10; }
                if (player.researchesExtra[1][0] >= 1) { cost /= 10; }
            }
            buildingsInfo.firstCost[1][4] = cost;
        }
    } else if (stageIndex === 3) {
        buildingsInfo.firstCost[3][index] = buildingsInfo.startCost[3][index];
        if (global.strangeInfo.stageBoost[3] !== null) { buildingsInfo.firstCost[3][index] /= global.strangeInfo.stageBoost[3]; }
        if (index === 4) {
            buildingsInfo.increase[3][4] = player.upgrades[3][11] === 1 ? 5 : 10;
        }
    } else if (stageIndex === 4) {
        let increase = 125 + 15 * index;
        if (player.elements[2] === 1) { increase -= 10; }
        if (player.elements[8] === 1) { increase -= 5; }
        buildingsInfo.increase[4][index] = increase / 100;

        let cost = buildingsInfo.startCost[4][index] / (2 ** player.strangeness[4][1]);
        if (player.inflation.vacuum) { cost /= global.milestonesInfo[5].reward[0]; }
        if (player.elements[13] === 1) { cost /= 1e3; }
        buildingsInfo.firstCost[4][index] = cost;
    }

    return Limit(buildingsInfo.increase[stageIndex][index]).power(player.buildings[stageIndex][index as 1].true).multiply(buildingsInfo.firstCost[stageIndex][index]).toArray();
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
    buildings[5].current = Limit(water5).toArray();
    buildings[4].current = Limit(water4).toArray();
    buildings[3].current = Limit(water3).toArray();
    buildings[2].current = Limit(water2).toArray();
    if (!reload) { awardMilestone(1, 2); }
};

export const gainBuildings = (get: number, stageIndex: number, time: number) => {
    let add: overlimit;
    let stageGet = stageIndex;
    if (stageIndex === 1 && get === 5) {
        add = Limit(global.dischargeInfo.tritium).multiply(time).toArray();
        if (!player.inflation.vacuum) { get = 3; }
    } else if (stageIndex === 5) {
        add = Limit(global.buildingsInfo.producing[5][1]).multiply(time).divide(4 ** get).toArray();
        stageGet = 4;
        get++;
    } else {
        add = Limit(global.buildingsInfo.producing[stageIndex][get + 1]).multiply(time).toArray();

        if (stageIndex === 4) {
            get = 0;
        } else if (stageIndex === 2 && get === 1 && player.buildings[2][2].current[0] <= 0 && player.researchesExtra[2][1] >= 1) {
            add = Limit(add).plus(time * (calculateEffects.S2Extra1_2()[0] - 1)).toArray();
        }
    }
    if (add[0] === 0) { return; }
    if (!Limit(add).isFinite()) {
        if (global.debug.errorGain) {
            global.debug.errorGain = false;
            Notify(`Error while gaining ${Limit(add).toString()} '${global.buildingsInfo.name[stageGet][get]}'`);
            setTimeout(() => { global.debug.errorGain = true; }, 6e4);
        }
        return;
    }

    const building = player.buildings[stageGet][get];
    building.current = Limit(building.current).plus(add).toArray();
    building.total = Limit(building.total).plus(add).toArray();
    building.trueTotal = Limit(building.trueTotal).plus(add).toArray();
    if (Limit(building.highest).lessThan(building.current)) { building.highest = cloneArray(building.current); }

    if (stageIndex === 1) {
        if (player.inflation.vacuum) {
            if (get === 0) {
                player.buildings[3][0].current = Limit(building.current).multiply('1.78266192e-33').toArray();
                awardMilestone(0, 3);
            } else if (get === 1) {
                awardMilestone(0, 1);
            } else if (get === 5) {
                player.buildings[2][0].current = Limit(building.current).divide('6.02214076e23').toArray();
            }
        } else if (get === 0) { awardMilestone(0, 1); }
    } else if (stageIndex === 3) {
        if (get === 0) { //Never 0 for true vacuum
            if (player.accretion.rank < 5 && Limit(building.current).moreThan('1e30')) { building.current = [1, 30]; }
            awardMilestone(0, 3);
        }
    }
};

export const assignStrangeBoost = () => {
    const strangeness = player.strangeness;
    const stageBoost = global.strangeInfo.stageBoost;
    const strangeQuarks = player.strange[0].current + 1;

    stageBoost[1] = strangeness[1][8] < 1 ? null : strangeQuarks ** 0.08 - 1;
    stageBoost[2] = strangeness[2][7] < 1 ? null : strangeQuarks ** 0.28;
    stageBoost[3] = strangeness[3][7] < 1 ? null : strangeQuarks ** (player.inflation.vacuum ? 0.44 : 0.66);
    stageBoost[4] = strangeness[4][8] < 1 ? null : strangeQuarks ** 0.32;
    stageBoost[5] = strangeness[5][9] < 1 ? null : strangeQuarks ** 0.06;
};

export const gainStrange = (get: number, time: number) => {
    const strange = player.strange[get];
    const max = Math.floor(player.strange[get + 1].current * 1e12);
    if (strange.current >= max) { return; }

    const add = max * time / 600;
    strange.current += add;
    strange.total += add;
    if (strange.current > max) {
        const old = strange.current;
        strange.current = max;
        strange.total = Math.round(strange.total - (old - strange.current));
    }

    if (get === 0) { assignStrangeBoost(); }
};

export const buyUpgrades = (upgrade: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'ASR' | 'elements' | 'strangeness', auto = false): boolean => {
    if (!auto && !checkUpgrade(upgrade, stageIndex, type)) { return false; } //Auto should already checked if allowed, also allows for delayed purchase of Elements

    let currency: number | overlimit;
    if (type === 'strangeness') {
        currency = player.strange[0].current;
    } else if (stageIndex === 1) {
        currency = player.discharge.energy;
    } else if (stageIndex === 2) {
        currency = player.buildings[2][1].current;
    } else if (stageIndex === 3) {
        currency = player.inflation.vacuum ? Limit(player.buildings[1][0].current).multiply('1.78266192e-33').toArray() : player.buildings[3][0].current;
    } else /* if (stageIndex === 4 || stageIndex === 5) */ {
        currency = player.buildings[4][0].current;
    }

    if (type === 'upgrades') {
        if (player.upgrades[stageIndex][upgrade] >= 1) { return false; }

        const pointer = global.upgradesInfo[stageIndex];
        if (Limit(currency).lessThan(pointer.startCost[upgrade])) { return false; }

        player.upgrades[stageIndex][upgrade]++;
        currency = Limit(currency).minus(pointer.startCost[upgrade]).toArray();

        /* Special cases */
        if (stageIndex === 2) {
            if (upgrade >= 5 /*&& upgrade < 9*/) { assignPuddles(); }
        } else if (stageIndex === 4 && upgrade === 1 && global.tab === 'upgrade') { switchTab('upgrade'); }
        if (!auto && global.screenReader) { getId('SRMain').textContent = `New upgrade '${pointer.name[upgrade]}', has been created`; }
    } else if (type === 'researches' || type === 'researchesExtra' || type === 'ASR') {
        const pointer = (type === 'researches' || type === 'researchesExtra' ? global[`${type}Info`][stageIndex] : global.ASRInfo) as typeof global.researchesInfo[0];
        const level = type === 'researches' || type === 'researchesExtra' ? player[type][stageIndex] : player.ASR;

        if (level[upgrade] >= pointer.max[upgrade]) { return false; }
        if (Limit(currency).lessThan(pointer.cost[upgrade])) { return false; }

        level[upgrade]++;
        currency = Limit(currency).minus(pointer.cost[upgrade]).toArray();

        /* Special cases */
        if (type === 'researches') {
            if (stageIndex === 2) {
                if (upgrade >= 4 /*&& upgrade < 6*/) {
                    assignPuddles();
                }
            } else if (stageIndex === 4) {
                if (upgrade === 2) {
                    calculateMaxLevel(0, 4, 'researches', true);
                }
            }
        } else if (type === 'researchesExtra') {
            if (stageIndex === 1) {
                if (upgrade === 2) {
                    if (player.stage.current < 4) { player.stage.current = player.researchesExtra[1][2] > 1 ? 2 : 3; }
                    stageUpdate('soft');
                    awardVoidReward(1);
                }
            } else if (stageIndex === 4) {
                if (upgrade === 2) {
                    calculateMaxLevel(3, 4, 'researches', true);
                }
            }
        }
        if (!auto && global.screenReader) { getId('SRMain').textContent = `Research '${type === 'ASR' ? 'Structure automation' : pointer.name[upgrade]}' level increased, it is now ${level[upgrade]} ${level[upgrade] >= pointer.max[upgrade] ? 'maxed' : ''}`; }
    } else if (type === 'elements') {
        let level = player.elements[upgrade];
        if (level >= 1) { return false; }

        if (level === 0) {
            const startCost = global.elementsInfo.startCost[upgrade];
            if (Limit(currency).lessThan(startCost)) { return false; }
            currency = Limit(currency).minus(startCost).toArray();
        } else if (!auto) { return false; }
        if (player.collapse.show < upgrade) { player.collapse.show = upgrade; }
        level = player.strangeness[4][4] >= 1 || level === 0.5 ? 1 : 0.5;
        player.elements[upgrade] = level;

        /* Special cases */
        if (level === 1) {
            if (upgrade === 7 || upgrade === 16 || upgrade === 20 || upgrade === 25) {
                calculateMaxLevel(1, 4, 'researches', true);
            } else if (upgrade === 9 || upgrade === 17) {
                calculateMaxLevel(0, 4, 'researches', true);
            } else if (upgrade === 11) {
                calculateMaxLevel(2, 4, 'researches', true);
            } else if (upgrade === 26) {
                if (player.stage.current < 5) {
                    player.stage.current = 5;
                    if (player.stage.true < 5) {
                        player.stage.true = 5;
                        player.event = false;
                    }
                }
                stageUpdate('soft');
            }
        }
        if (!auto && global.screenReader) { getId('SRMain').textContent = `New Element '${global.elementsInfo.name[upgrade]}' ${player.elements[upgrade] >= 1 ? 'obtained' : 'awaiting activation'}`; }
    } else if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        if (player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade]) { return false; }
        if ((currency as number) < global.strangenessInfo[stageIndex].cost[upgrade]) { return false; }

        player.strangeness[stageIndex][upgrade]++;
        (currency as number) -= pointer.cost[upgrade];

        /* Special cases */
        if (stageIndex === 1) {
            if (upgrade === 4) {
                assignEnergy();
            } else if (upgrade === 6) {
                player.ASR[1] = Math.max(player.strangeness[1][6], player.ASR[1]);
                calculateMaxLevel(0, 1, 'ASR', true);
            } else if (upgrade === 11) {
                assignEnergy();
                calculateMaxLevel(4, 2, 'strangeness', true);
                calculateMaxLevel(4, 3, 'strangeness', true);
                calculateMaxLevel(5, 4, 'strangeness', true);
            }
        } else if (stageIndex === 2) {
            if (upgrade === 2) {
                calculateMaxLevel(4, 2, 'researches', true);
                calculateMaxLevel(5, 2, 'researches', true);
            } else if (upgrade === 5) {
                player.ASR[2] = Math.max(player.strangeness[2][5], player.ASR[2]);
                calculateMaxLevel(0, 2, 'ASR', true);
            } else if (upgrade === 8) {
                calculateMaxLevel(0, 2, 'ASR', true);
                calculateMaxLevel(5, 2, 'strangeness', true);
            } else if (upgrade === 10) {
                calculateMaxLevel(2, 2, 'researches', true);
                calculateMaxLevel(3, 2, 'researches', true);
            }
        } else if (stageIndex === 3) {
            if (upgrade === 2) {
                calculateMaxLevel(0, 3, 'researchesExtra', true);
                calculateMaxLevel(1, 3, 'researchesExtra', true);
            } else if (upgrade === 5) {
                player.ASR[3] = Math.max(player.strangeness[3][5], player.ASR[3]);
                calculateMaxLevel(0, 3, 'ASR', true);
            } else if (upgrade === 8) {
                calculateMaxLevel(0, 3, 'ASR', true);
                calculateMaxLevel(5, 3, 'strangeness', true);
            }
        } else if (stageIndex === 4) {
            if (upgrade === 4) {
                for (let i = 1; i < player.elements.length; i++) {
                    if (player.elements[i] === 0.5) { buyUpgrades(i, 4, 'elements', true); }
                }
            } else if (upgrade === 6) {
                player.ASR[4] = Math.max(player.strangeness[4][6], player.ASR[4]);
                calculateMaxLevel(0, 4, 'ASR', true);
            } else if (upgrade === 9) {
                calculateMaxLevel(0, 4, 'ASR', true);
                calculateMaxLevel(6, 4, 'strangeness', true);
            } else if (upgrade === 10) {
                if (player.elements[0] !== 1) {
                    player.elements[0] = 1;
                    visualUpdateUpgrades(0, 4, 'elements');
                }
            }
        } else if (stageIndex === 5) {
            if (upgrade === 0) {
                if (!player.inflation.vacuum) { stageUpdate('soft'); }
            } else if (upgrade === 5) {
                if (player.inflation.vacuum) { stageUpdate('soft'); }
            } else if (upgrade === 6 || upgrade === 7) {
                player.ASR[5] = player.strangeness[5][7];
                if (player.strangeness[5][6] >= 2) { player.ASR[5]++; }
                calculateMaxLevel(0, 5, 'ASR', true);
            } else if (upgrade === 8) {
                if (player.inflation.vacuum && global.tab === 'strangeness') { switchTab('strangeness'); }
            } else if (upgrade === 10) {
                const strange = player.strange;
                const level = player.strangeness[5][10];
                strange[level - 1].total -= strange[level - 1].current;
                strange[level].current = strange[level - 1].current / 1e12;
                strange[level].total = strange[level].current;
                strange[level - 1].current = 0;
            }
        }
        if (!auto && global.screenReader) { getId('SRMain').textContent = `Strangeness of '${pointer.name[upgrade]}' for ${global.stageInfo.word[stageIndex]} Stage is increased, level is now ${player.strangeness[stageIndex][upgrade]}${player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade] ? 'maxed' : ''}`; }
    }

    if (type === 'strangeness') {
        player.strange[0].current = currency as number;
        assignStrangeBoost();
    } else if (stageIndex === 1) {
        if (player.strangeness[1][11] < 1) { player.discharge.energy = Limit(currency).toNumber(); }
    } else if (stageIndex === 2) {
        player.buildings[2][1].current = currency as overlimit;

        if (player.buildings[2][2].current[0] <= 0 && Limit(player.buildings[2][1].current).lessThan(player.buildings[2][1].true)) {
            const old = player.buildings[2][1].true;
            player.buildings[2][1].true = Math.floor(Limit(player.buildings[2][1].current).toNumber());
            if (player.inflation.vacuum) {
                const decreased = (old - player.buildings[2][1].true) * global.dischargeInfo.getEnergy(1, 2);
                global.dischargeInfo.energyTrue -= decreased;
                player.discharge.energy -= decreased;
            } else if (player.buildings[2][1].current[0] <= 0 && Limit(player.buildings[2][0].current).lessThan('2.8e-3')) {
                player.buildings[2][0].current = [2.8, -3];
            }
        }
    } else if (stageIndex === 3) {
        if (player.inflation.vacuum) {
            player.buildings[1][0].current = Limit(currency).divide('1.78266192e-33').toArray();
            player.buildings[3][0].current = Limit(player.buildings[1][0].current).multiply('1.78266192e-33').toArray(); //Currency can be assigned directly (but accuracy might end up lower, because of floating points)
        } else { player.buildings[3][0].current = currency as overlimit; }
    } else /*if (stageIndex === 4 || stageIndex === 5)*/ {
        player.buildings[4][0].current = currency as overlimit;
    }

    assignBuildingInformation();
    if (type === 'upgrades' || type === 'elements') {
        visualUpdateUpgrades(upgrade, stageIndex, type);
    } else {
        calculateResearchCost(upgrade, stageIndex, type);
        visualUpdateResearches(upgrade, stageIndex, type);
    }
    if (!auto) { numbersUpdate(); }
    return true;
};

//Currently can't allow price to be more than 2**1024. Because missing sorting function for numbers that big
export const calculateResearchCost = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'ASR' | 'strangeness') => {
    if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];

        pointer.cost[research] = stageIndex === 1 ?
            pointer.startCost[research] + pointer.scaling[research] * player[type][stageIndex][research] :
            pointer.startCost[research] * pointer.scaling[research] ** player[type][stageIndex][research];
    } else if (type === 'ASR') {
        global.ASRInfo.cost[stageIndex] = global.ASRInfo.costRange[stageIndex][player.ASR[stageIndex]];
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
            max = player.strangeness[2][8] >= 1 ? 6 : 5;
        } else if (stageIndex === 3) {
            max = player.strangeness[3][8] >= 1 ? 5 : 4;
        } else if (stageIndex === 4) {
            max = player.strangeness[4][9] >= 1 ? 5 : 4;
        } else if (stageIndex === 5) {
            max = player.strangeness[5][7];
            if (player.strangeness[5][6] >= 2) { max++; }
        }
    } else if (type === 'researches') {
        if (stageIndex === 2) {
            if (research === 2) {
                max = 4;
                if (player.strangeness[2][10] >= 1) { max++; }
            } else if (research === 3) {
                max = 4;
                if (player.strangeness[2][10] >= 2) { max++; }
            } else if (research === 4) {
                max = 2;
                if (player.strangeness[2][2] >= 1) { max++; }
            } else if (research === 5) {
                max = 1;
                if (player.strangeness[2][2] >= 2) { max++; }
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                max = 3 + (3 * player.researches[4][2]);
                if (player.elements[9] === 1) { max += 12; }
                if (player.elements[17] === 1) { max += 24; }
            } else if (research === 1) {
                max = 2;
                if (player.elements[7] === 1) { max += 2; }
                if (player.elements[16] === 1) { max++; }
                if (player.elements[20] === 1) { max++; }
                if (player.elements[25] === 1) { max++; }
            } else if (research === 2) {
                max = 1;
                if (player.elements[11] === 1) { max++; }
            } else if (research === 3) {
                max = 1 + player.researchesExtra[4][2];
            }
        }
    } else if (type === 'researchesExtra') {
        if (stageIndex === 3) {
            if (research === 0) {
                max = 12;
                if (player.accretion.rank >= 3) { max += 17; }
                if (player.strangeness[3][2] >= 1) { max += 7; }
            } else if (research === 1) {
                max = 5;
                if (player.strangeness[3][2] >= 2) { max += 2; }
            } else if (research === 4) {
                max = player.accretion.rank - 2;
            }
        }
    } else if (type === 'strangeness') {
        if (stageIndex === 1) {
            if (research === 0) {
                max = 4 + Math.min(player.challenges.void[3], 4);
            } else if (research === 2) {
                max = 2 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            } else if (research === 4) {
                max = player.inflation.vacuum ? 2 : 1;
            } else if (research === 6) {
                max = player.inflation.vacuum ? 5 : 3;
            } else if (research === 9) {
                max = 6 + Math.min(player.challenges.void[3], 4);
            }
        } else if (stageIndex === 2) {
            if (research === 0) {
                max = (player.inflation.vacuum ? 6 : 9) + Math.min(player.challenges.void[3], 4);
            } else if (research === 1) {
                max = 6 + Math.min(player.challenges.void[3], 4);
            } else if (research === 3) {
                max = 3 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            } else if (research === 4) {
                max = player.strangeness[1][11] >= 1 ? 2 : 1;
            } else if (research === 5) {
                max = player.strangeness[2][8] >= 1 ? 6 : 5;
            } else if (research === 6) {
                max = player.stage.true >= 6 ? 2 : 1;
            }
        } else if (stageIndex === 3) {
            if (research === 0) {
                max = 8 + Math.min(player.challenges.void[3], 4);
            } else if (research === 1) {
                max = 4 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            } else if (research === 4) {
                max = player.strangeness[1][11] >= 1 ? 2 : 1;
            } else if (research === 5) {
                max = player.strangeness[3][8] >= 1 ? 5 : 4;
            } else if (research === 10) {
                max = 2 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                max = 8 + Math.min(player.challenges.void[3], 4);
            } else if (research === 1) {
                max = 4 + Math.min(Math.floor(player.challenges.void[3] / 2), 2);
            } else if (research === 4) {
                max = player.stage.true >= 6 || (player.strange[0].total > 0 && player.event) ? 2 : 1;
            } else if (research === 5) {
                max = player.strangeness[1][11] >= 1 ? 2 : 1;
            } else if (research === 6) {
                max = player.strangeness[4][9] >= 1 ? 5 : 4;
            } else if (research === 7) {
                max = 3 + Math.min(player.challenges.void[3], 4);
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

    calculateResearchCost(research, stageIndex, type);
    visualUpdateResearches(research, stageIndex, type);
    if (addAuto && (type === 'researches' || type === 'researchesExtra')) { autoResearchesSet(type, [stageIndex, research]); }
};

export const autoUpgradesSet = (which: 'all' | number) => {
    if (!player.toggles.auto[5]) { return; }
    const auto = global.automatization.autoU;

    if (which === 'all') {
        for (let s = 1; s <= 5; s++) {
            auto[s] = [];
            for (let i = (s === 1 && !player.inflation.vacuum ? 2 : 0); i < global.upgradesInfo[s].maxActive; i++) {
                if (player.upgrades[s][i] < 1) {
                    auto[s].push(i);
                }
            }

            const startCost = global.upgradesInfo[s].startCost;
            auto[s].sort((a, b) => startCost[a] - startCost[b]);
        }
    } else if (typeof which === 'number') {
        auto[which] = [];
        for (let i = (which === 1 && !player.inflation.vacuum ? 2 : 0); i < global.upgradesInfo[which].maxActive; i++) {
            if (player.upgrades[which][i] < 1) {
                auto[which].push(i);
            }
        }

        const startCost = global.upgradesInfo[which].startCost;
        auto[which].sort((a, b) => startCost[a] - startCost[b]);
    }
};

export const autoUpgradesBuy = (stageIndex: number) => {
    if (player.strangeness[3][6] < 1 || !player.toggles.auto[5]) { return; }
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
    if (type === 'researches') {
        if (!player.toggles.auto[6]) { return; }
    } else if (type === 'researchesExtra') {
        if (!player.toggles.auto[7]) { return; }
    }

    const auto = global.automatization[type === 'researches' ? 'autoR' : 'autoE'];

    if (which === 'all') {
        for (let s = 1; s <= 5; s++) {
            const pointer = global[`${type}Info`][s];

            auto[s] = [];
            for (let i = 0; i < pointer.maxActive; i++) {
                if (player[type][s][i] < pointer.max[i]) {
                    auto[s].push(i);
                }
            }
            auto[s].sort((a, b) => pointer.cost[a] - pointer.cost[b]);
        }
    } else if (typeof which === 'number') {
        const pointer = global[`${type}Info`][which];

        auto[which] = [];
        for (let i = 0; i < pointer.maxActive; i++) {
            if (player[type][which][i] < pointer.max[i]) {
                auto[which].push(i);
            }
        }
        auto[which].sort((a, b) => pointer.cost[a] - pointer.cost[b]);
    } else { //Will get sorted automatically
        if (!auto[which[0]].some((a) => a === which[1])) { auto[which[0]].unshift(which[1]); }
    }
};

export const autoResearchesBuy = (type: 'researches' | 'researchesExtra', stageIndex: number) => {
    if (type === 'researches') {
        if (player.strangeness[3][6] < 2 || !player.toggles.auto[6]) { return; }
    } else if (type === 'researchesExtra') {
        if (player.strangeness[3][6] < 3 || !player.toggles.auto[7]) { return; }
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
        } else {
            if (!bought) {
                if (pointer.cost[auto[i]] > pointer.cost[auto[i + 1]]) {
                    sort = true;
                    continue;
                }
                break;
            } else { i--; }
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
        if (elements[i] === 0) { auto.push(i); }
    }

    auto.sort((a, b) => startCost[a] - startCost[b]);
};

export const autoElementsBuy = () => {
    if (player.strangeness[4][4] < 2 || !player.toggles.auto[8]) { return; }
    const auto = global.automatization.elements;
    const elements = player.elements;

    for (let i = 0; i < auto.length; i++) {
        const index = auto[i];

        if (!checkUpgrade(index, 4, 'elements')) { break; }
        buyUpgrades(index, 4, 'elements', true);

        if (elements[index] === 1) {
            auto.splice(i, 1);
            i--;
        } else { break; }
    }
};

export const toggleSwap = (number: number, type: 'normal' | 'buildings' | 'auto', change = false) => {
    const toggles = type === 'buildings' ? player.toggles.buildings[player.stage.active] : player.toggles[type];

    if (change) {
        if (type === 'buildings') {
            if (number === 0) {
                if (player.strangeness[1][7] < 1) { return; }

                toggles[0] = !toggles[0];
                for (let i = 1; i < toggles.length; i++) {
                    toggles[i] = toggles[0];
                    toggleSwap(i, 'buildings');
                }
            } else {
                const buildings = player.buildings[player.stage.active];
                if (number >= buildings.length) { return; }

                let anyOn = false;
                toggles[number] = !toggles[number];
                for (let i = 1; i < global.buildingsInfo.maxActive[player.stage.active]; i++) {
                    if (toggles[i] && buildings[i].highest[0] > 0) {
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

    let toggleHTML;
    if (type === 'normal') {
        toggleHTML = getId(`toggleNormal${number}`);
    } else if (type === 'buildings') {
        toggleHTML = getId(`toggleBuilding${number}`);
    } else {
        toggleHTML = getId(`toggleAuto${number}`);
    }

    const extraText = type === 'normal' ? '' : (type === 'buildings' && number === 0 ? 'All ' : 'Auto ');
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
    if (toggles[number] === 'All' || toggles[number] === 'Safe') {
        toggleHTML.style.color = '';
        toggleHTML.style.borderColor = '';
        toggleHTML.textContent = toggles[number];
    } else {
        toggleHTML.style.color = 'var(--red-text)';
        toggleHTML.style.borderColor = 'crimson';
        toggleHTML.textContent = 'None';
    }
};

export const toggleBuy = (type = 'none' as 'none' | '1' | 'max' | 'any') => {
    const input = getId('buyAnyInput') as HTMLInputElement;
    const shop = player.toggles.shop;

    switch (type) {
        case '1':
            shop.howMany = 1;
            break;
        case 'max':
            shop.howMany = -1;
            break;
        case 'any':
            shop.input = Math.max(Math.trunc(Number(input.value)), -1);
            if (shop.input === 0) { shop.input = 1; }
            shop.howMany = shop.input;
    }
    getId('buy1x').style.backgroundColor = shop.howMany === 1 ? 'green' : '';
    getId('buyAny').style.backgroundColor = Math.abs(shop.howMany) !== 1 ? 'green' : '';
    getId('buyMax').style.backgroundColor = shop.howMany === -1 ? 'green' : '';
    if (type === 'none' || type === 'any') { input.value = format(shop.input, { type: 'input' }); }
    if (type !== 'none') { numbersUpdate(); }
};

export const stageResetCheck = (stageIndex: number, auto = false): boolean => {
    let allowed = false;
    if (stageIndex >= 5) {
        allowed = player.stage.current >= 5; //player.elements[26] === 1;
    } else if (stageIndex === 4) {
        return false;
    } else if (stageIndex === 3) {
        allowed = Limit(player.buildings[3][0].current).moreOrEqual('2.45576045e31');
    } else if (stageIndex === 2) {
        allowed = Limit(player.buildings[2][1].current).moreOrEqual('1.19444e29');
    } else if (stageIndex === 1) {
        allowed = Limit(player.buildings[1][3].current).moreOrEqual('1.67133125e21');
    }

    if (auto && allowed) {
        if (player.strangeness[5][2] < 1 || (stageIndex >= 4 && global.strangeInfo.gain(stageIndex) / 1e12 ** player.strangeness[5][10] < player.stage.input)) { return false; }
        stageResetReward(stageIndex);
    }
    return allowed;
};

export const stageAsyncReset = async() => {
    const stage = player.stage;
    const active = player.inflation.vacuum ? 6 : (stage.active >= 4 && stage.current >= 5 && (stage.true >= 6 || player.strange[0].total > 0 || player.event) ? 5 : stage.active);

    if (!stageResetCheck(active)) {
        if (player.toggles.confirm[0] === 'None' || (stage.resets < 1 && (player.inflation.vacuum ? stage.current < 5 : player.upgrades[1][9] !== 1))) { return; }
        if (active >= 5) { return void Alert('Awaiting "Iron" Element'); }
        if (active === 4) { return void Alert('Enter Intergalactic space first'); }
        if (active === 3) { return void Alert(`Self sustaining is not yet possible, obtain at least ${format(2.45576045e31)} Mass`); }
        if (active === 2) { return void Alert(`Look's like more Mass expected, need even more Drops, around ${format(1.19444e29)} in total`); }
        if (active === 1) { return void Alert(`Not enough to form a single Drop of water, need at least ${format(1.67133125e21)} Molecules`); }
    } else {
        if (player.toggles.confirm[0] !== 'None') {
            const noCobalt = active >= 4 && player.strangeness[4][4] >= 1 && player.elements[27] < 1;
            const inChallenge = player.challenges.active !== -1;
            if (player.toggles.confirm[0] !== 'Safe' || inChallenge || noCobalt) {
                let text;
                if (active === 6) {
                    text = `Ready to reset progress for ${format(global.strangeInfo.gain(active) / 1e12 ** player.strangeness[5][10])} ${global.strangeInfo.name[player.strangeness[5][10]]}?`;
                    if (noCobalt) { text += '\n(Not all important Elements obtained)'; }
                    if (inChallenge) { text += `\n(${global.challengesInfo.name[player.challenges.active]} is active)`; }
                } else if (active === 5) {
                    text = `Return back to Microworld for ${format(global.strangeInfo.gain(active))} Strange quarks?`;
                    if (noCobalt) { text += '\n(Not all important Elements obtained)'; }
                } else if (active !== stage.current) {
                    text = `Reset this Stage for ${format(global.strangeInfo.gain(active))} Strange quarks?`;
                } else {
                    text = 'Ready to enter next Stage? Next one will be harder than current';
                }
                if (!await Confirm(text)) { return; }
                if (!stageResetCheck(active)) { return Notify('Stage reset canceled, requirements are no longer met'); }
            }
        }
        stageResetReward(active);
    }
};

const stageResetReward = (stageIndex: number) => {
    const { stage } = player;
    const time = player.time.stage;

    stage.resets++;
    let update: false | 'normal' | 'soft' = 'normal';
    const resetThese = player.inflation.vacuum ? [1, 2, 3, 4, 5] : [stageIndex];
    if (player.inflation.vacuum) {
        player.time.stage = 0;
        stage.time = 0;
        setActiveStage(1);
        stage.current = 1;
    } else if (stageIndex === stage.current) {
        player.time.stage = 0;
        stage.time = 0;
        if (stageIndex < 5) {
            stage.current++;
            if (stage.active === stage.current - 1) {
                setActiveStage(stage.current);
            } else { update = 'soft'; }
            if (stage.current > stage.true) {
                stage.true = stage.current;
                player.event = false;
            }
        } else {
            stage.current = 1 + player.strangeness[5][0];
            if (stage.true < 6 && player.strange[0].total <= 0) { player.event = false; }
            if ((stage.active === 4 && stage.current !== 4) || stage.active === 5) {
                setActiveStage(stage.current);
            } else { update = 'soft'; }
            resetThese.unshift(4);
        }
    } else { update = stageIndex === stage.active ? 'soft' : false; }

    if (stage.true >= 5) {
        const trueGain = global.strangeInfo.gain(stageIndex);
        if (trueGain > stage.best) { stage.best = trueGain; }

        const resetType = player.strangeness[5][10];
        const postGain = trueGain / 1e12 ** resetType;
        player.strange[resetType].current += postGain;
        player.strange[resetType].total += postGain;
        assignStrangeBoost();

        if (stageIndex >= 4) {
            const storage = global.historyStorage.stage;
            const history = player.history.stage;
            storage.unshift([trueGain, time, resetType]);
            if (storage.length > history.input[1]) { storage.length = history.input[1]; }
            if (trueGain / time > history.best[0] / history.best[1]) { history.best = [trueGain, time, resetType]; }
        }
    }

    resetStage(resetThese, update);
};

export const switchStage = (stage: number) => {
    if (!global.stageInfo.activeAll.includes(stage)) { return; }
    if (player.stage.active === stage) {
        if (global.trueActive !== stage) {
            global.trueActive = stage;
            getId(`${global.stageInfo.word[stage]}Switch`).style.textDecoration = 'underline';
        } else if (!global.screenReader) { getId('stageSelect').classList.remove('active'); }
        return;
    }

    if (stage !== 4 && stage !== 5 && ((global.tab === 'upgrade' && global.subtab.upgradeCurrent === 'Elements') || global.tab === 'Elements')) {
        switchTab('upgrade', global.tab === 'upgrade' ? 'Upgrades' : null);
    }
    setActiveStage(stage);
    stageUpdate();
};

export const setActiveStage = (stage: number, active = stage) => {
    getId(`${global.stageInfo.word[player.stage.active]}Switch`).style.textDecoration = '';
    player.stage.active = stage;
    global.trueActive = active;
    getId(`${global.stageInfo.word[stage]}Switch`).style.textDecoration = 'underline' + (global.trueActive !== stage ? ' dashed' : '');
};

export const assignDischargeInformation = () => {
    global.dischargeInfo.next = Math.round((10 - (2 * player.researches[1][3]) - (player.strangeness[1][1] / 2)) ** player.discharge.current);
};

export const dischargeResetCheck = (auto = false): boolean => {
    if (player.upgrades[1][5] < 1 || player.buildings[1][1].true <= 0) { return false; }
    assignDischargeInformation();
    const info = global.dischargeInfo;
    const energy = player.discharge.energy;

    if (auto) {
        if (player.strangeness[1][3] < 1) { return false; }
        if (energy >= info.next) {
            dischargeReset();
            return true;
        }

        if (player.strangeness[1][11] >= 1 || energy >= info.energyTrue) { return false; }
        dischargeReset();
        return true;
    }
    return energy < info.energyTrue || energy >= info.next;
};

export const dischargeAsyncReset = async() => {
    if (!dischargeResetCheck()) { return; }
    const info = global.dischargeInfo;
    const energy = player.discharge.energy;

    if (player.toggles.confirm[1] !== 'None') {
        const active = player.stage.active;
        if (player.toggles.confirm[1] !== 'Safe' || active !== 1) {
            if (!await Confirm(`Reset Structures and Energy to ${energy >= info.next ? 'gain boost from a new goal' : `regain ${format(info.energyTrue - energy)} spent Energy`}?`)) { return; }
            if (!dischargeResetCheck()) { return Notify('Discharge canceled, requirements are no longer met'); }
        }
    }

    if (global.screenReader) { getId('SRMain').textContent = `Structures and Energy were reset${energy >= info.next ? ', also gained boost from reaching new goal' : ''}`; }
    dischargeReset();
};

const dischargeReset = () => {
    if (player.discharge.energy >= global.dischargeInfo.next) {
        player.discharge.current++;
    }
    awardVoidReward(1);
    reset('discharge', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [1]);
};

export const assignVaporizationInformation = () => {
    let get = Limit(player.buildings[2][1][player.researchesExtra[2][0] >= 1 ? 'total' : 'current']).divide(calculateEffects.S2Upgrade2()).toArray();

    if (Limit(get).moreOrEqual('1')) {
        get = player.inflation.vacuum ?
            Limit(player.vaporization.clouds).power(2.5).plus(get).power(0.4).minus(player.vaporization.clouds).multiply(global.milestonesInfo[2].reward[0]).toArray() :
            Limit(player.vaporization.clouds).power(1 / 0.6).plus(get).power(0.6).minus(player.vaporization.clouds).toArray();
        global.vaporizationInfo.get = get;
    } else { global.vaporizationInfo.get = [0, 0]; }
};

export const vaporizationResetCheck = (auto = false, clouds = 0): boolean => {
    assignVaporizationInformation();
    const info = global.vaporizationInfo;
    if (player.upgrades[2][2] < 1 || info.get[0] <= 0) { return false; }

    if (auto) {
        if (player.strangeness[2][4] < 1) { return false; }
        const rainPost = calculateEffects.S2Extra1_2(true);
        const rainNow = calculateEffects.S2Extra1_2();
        if (Limit(calculateEffects.clouds(true)).divide(info.strength, rainNow[0], rainNow[1]).multiply(rainPost[0], rainPost[1]).moreOrEqual(player.vaporization.input)) {
            vaporizationReset();
            return true;
        } else if (clouds <= 0) { return false; }
    }
    if (clouds > 0) {
        if (player.strangeness[2][4] < 2) { return false; }
        vaporizationReset(clouds);
        return !auto;
    }
    return true;
};

export const vaporizationAsyncReset = async() => {
    if (!vaporizationResetCheck()) { return; }
    const info = global.vaporizationInfo;
    const increase = player.vaporization.clouds[0] > 0 ? Limit(info.get).divide(player.vaporization.clouds).multiply('1e2').toArray() : '1e2';

    if (player.toggles.confirm[2] !== 'None') {
        const active = player.stage.active;
        if (player.toggles.confirm[2] !== 'Safe' || active !== 2 || Limit(increase).lessThan('1e2')) {
            if (!await Confirm(`Reset Structures and Upgrades for ${Limit(info.get).format()} (+${Limit(increase).format()}%) Clouds?`)) { return; }
            if (!vaporizationResetCheck()) { return Notify('Vaporization canceled, requirements are no longer met'); }
        }
    }

    if (global.screenReader) { getId('SRMain').textContent = `Progress were reset for ${Limit(info.get).format()} (+${Limit(increase).format()}%) Clouds`; }
    vaporizationReset();
};

const vaporizationReset = (autoClouds = 0) => {
    const vaporization = player.vaporization;

    vaporization.clouds = Limit(global.vaporizationInfo.get).multiply(autoClouds > 0 ? autoClouds / 5 : '1').plus(vaporization.clouds).toArray();
    if (Limit(vaporization.cloudsMax).lessThan(vaporization.clouds)) { vaporization.cloudsMax = cloneArray(vaporization.clouds); }
    awardMilestone(0, 2);
    awardVoidReward(2);
    if (autoClouds <= 0) { reset('vaporization', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [2]); }
};

export const rankResetCheck = (auto = false): boolean => {
    const requirement = global.accretionInfo.rankCost[player.accretion.rank];
    if (requirement === 0) { return false; }

    if (player.inflation.vacuum) {
        if (Limit(player.buildings[1][0].current).multiply('1.78266192e-33').lessThan(requirement)) { return false; }
    } else if (Limit(player.buildings[3][0].current).lessThan(requirement)) { return false; }

    if (auto) {
        if (player.strangeness[3][4] < 1) { return false; }
        rankReset();
    }
    return true;
};

export const rankAsyncReset = async() => {
    if (!rankResetCheck()) { return; }

    if (player.toggles.confirm[3] !== 'None' && player.accretion.rank !== 0) {
        const active = player.stage.active;
        if (player.toggles.confirm[3] !== 'Safe' || active !== 3) {
            if (!await Confirm('Reset Structures, Upgrades and Stage Researches to increase current Rank?')) { return; }
            if (!rankResetCheck()) { return Notify('Rank increase canceled, requirements are no longer met'); }
        }
    }

    rankReset();
    if (global.screenReader) { getId('SRMain').textContent = `Rank is now '${global.accretionInfo.rankName[player.accretion.rank]}'`; }
};

const rankReset = () => {
    player.accretion.rank++;
    if (player.accretion.rank === 6) {
        player.stage.current = 4;
        stageUpdate('soft');
    }
    awardVoidReward(3);
    reset('rank', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [3]);
    calculateMaxLevel(0, 3, 'researchesExtra', true);
    calculateMaxLevel(4, 3, 'researchesExtra', true);
};

const calculateMassGain = (): number => {
    const elements = player.elements;

    let massGain = 0.004;
    if (elements[3] === 1) { massGain += 0.002; }
    if (elements[5] === 1) { massGain += 0.0002 * player.buildings[4][1].true; }
    massGain *= elements[15] === 1 ? global.collapseInfo.trueStars : player.buildings[4][1].true;
    if (player.inflation.vacuum) {
        massGain = (massGain * 80) + 1;
    } else {
        if (elements[10] === 1) { massGain *= 2; }
        if (player.researchesExtra[4][1] >= 1) { massGain *= calculateEffects.S4Extra1(); }
        massGain *= global.collapseInfo.starEffect[2];
    }

    if (global.strangeInfo.stageBoost[5] !== null && (player.inflation.vacuum || global.stageInfo.activeAll.includes(5))) { massGain *= global.strangeInfo.stageBoost[5]; }
    return massGain;
};

export const assignCollapseInformation = () => {
    const building = player.buildings[4];
    const starCheck = global.collapseInfo.starCheck;
    const stars = player.collapse.stars;
    global.collapseInfo.newMass = !player.inflation.vacuum ? calculateMassGain() :
        Limit(global.buildingsInfo.producing[1][1]).multiply(global.inflationInfo.massCap).min(player.buildings[1][0].current).multiply('8.96499278339628e-67').toNumber(); //1.78266192e-33 / 1.98847e33
    starCheck[0] = building[2].true > 0 ? Math.max(building[2].true + Math.floor(building[1].true * player.strangeness[4][3] / 10) - stars[0], 0) : 0;
    starCheck[1] = Math.max(building[3].true - stars[1], 0);
    starCheck[2] = Math.max(building[4].true - stars[2], 0);
};

export const collapseResetCheck = (auto = false, remnants = false): boolean => {
    if (player.upgrades[4][0] < 1) { return false; }
    assignCollapseInformation();
    const info = global.collapseInfo;

    if (auto) {
        if (player.strangeness[4][5] < 1) { return false; }
        /*if (player.toggles.buildings[5][3] && Limit(calculateBuildingsCost(3, 5)).lessOrEqual(info.newMass)) {
            collapseReset();
            return true;
        }*/

        const massBoostBase = (calculateEffects.mass(true) / info.massEffect) * (calculateEffects.S4Research4(true) / calculateEffects.S4Research4());
        if (player.strangeness[4][5] < 2) {
            if (massBoostBase * (calculateEffects.star[0](true) / info.starEffect[0]) * (calculateEffects.star[1](true) / info.starEffect[1]) * (calculateEffects.star[2](true) / info.starEffect[2]) < player.collapse.input) { return false; }
            collapseReset();
            return true;
        }

        if (massBoostBase >= player.collapse.input) {
            collapseReset();
            return true;
        } else if (!remnants) { return false; }
    }
    if (remnants) {
        if (player.strangeness[4][5] < 2 || (info.starCheck[0] <= 0 && info.starCheck[1] <= 0 && info.starCheck[2] <= 0)) { return false; }
        collapseReset(false);
        return !auto;
    }

    return info.newMass > player.collapse.mass || info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0 || player.elements.includes(0.5);
};

export const collapseAsyncReset = async() => {
    if (!collapseResetCheck()) { return; }
    const { newMass, starCheck: newStars } = global.collapseInfo;
    const mass = player.collapse.mass;

    if (player.toggles.confirm[4] !== 'None') {
        const active = player.stage.active;
        const unlockedG = mass >= 1e5 && player.strangeness[5][6] >= 1;
        const cantAfford = !unlockedG || Limit(calculateBuildingsCost(3, 5)).moreThan(newMass);
        const notMaxed = player.inflation.vacuum && newMass > mass && Limit(global.buildingsInfo.producing[1][1]).multiply(global.inflationInfo.massCap).moreThan(player.buildings[1][0].current);
        if (player.toggles.confirm[4] !== 'Safe' || active !== 4 || (cantAfford && ((notMaxed && player.buildings[5][3].true < 1) || unlockedG))) {
            let message = 'This will reset all Researches, Upgrades and Structures';
            if (newMass > mass) {
                message += `\nSolar mass will increase to ${format(newMass)}`;
                if (notMaxed) { message += '\n(Hardcap is not reached)'; }
                if (unlockedG) { message += `\n(${cantAfford ? 'Not enough for' : 'Will be able to make'} a new Galaxy)`; }
            } else { message += "\nSolar mass won't change"; }
            if (newStars[0] > 0 || newStars[1] > 0 || newStars[2] > 0) {
                message += '\nAlso will gain new Star remnants:';
                if (newStars[0] > 0) { message += `\n'Red giants' - ${format(newStars[0])}`; }
                if (newStars[1] > 0) { message += `\n'Neutron stars' - ${format(newStars[1])}`; }
                if (newStars[2] > 0) { message += `\n'Black holes' - ${format(newStars[2])}`; }
            }
            if (player.elements.includes(0.5)) {
                let count = 0;
                for (let i = 1; i < player.elements.length; i++) {
                    if (player.elements[i] === 0.5) { count++; }
                }
                message += `\n${format(count)} new Elements will activate`;
            }
            if (active !== 4) { message += '\nContinue?'; }

            if (!await Confirm(message)) { return; }
            if (!collapseResetCheck()) { return Notify('Collapse canceled, requirements are no longer met'); }
        }
    }

    if (global.screenReader) {
        let message = `Solar mass ${newMass > mass ? `is now ${format(newMass)}` : "haven't changed"}`;
        if (newStars[0] > 0 || newStars[1] > 0 || newStars[2] > 0) {
            message += ', also gained';
            if (newStars[0] > 0) { message += ` ${format(newStars[0])} Red giants`; }
            if (newStars[1] > 0) { message += `, ${format(newStars[1])} Neutron stars`; }
            if (newStars[2] > 0) { message += `, ${format(newStars[2])} Black holes`; }
        }
        getId('SRMain').textContent = message;
    }
    collapseReset();
};

const collapseReset = (toReset = true) => {
    const collapseInfo = global.collapseInfo;
    const collapse = player.collapse;

    collapse.stars[0] += collapseInfo.starCheck[0];
    collapse.stars[1] += collapseInfo.starCheck[1];
    collapse.stars[2] += collapseInfo.starCheck[2];
    awardMilestone(1, 4);
    if (toReset) {
        const elements = player.elements;

        if (elements.includes(0.5)) {
            for (let i = 1; i < elements.length; i++) {
                if (elements[i] === 0.5) { buyUpgrades(i, 4, 'elements', true); }
            }
        }
        if (collapseInfo.newMass > collapse.mass) {
            collapse.mass = collapseInfo.newMass;
            if (collapse.massMax < collapse.mass) { collapse.massMax = collapse.mass; }
        }

        awardMilestone(0, 4);
        reset('collapse', player.inflation.vacuum ? [1, 2, 3, 4, 5] : (player.strangeness[5][5] < 1 ? [4, 5] : [4]));
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(3, 4, 'researches');
    }
    awardVoidReward(4);
};

export const calculateInstability = () => {
    const milestones = player.milestones;
    let value = 0;
    if (milestones[1][0] >= 6) { value++; }
    if (milestones[2][1] >= 6) { value++; }
    if (milestones[3][1] >= 7) { value++; }
    if (milestones[4][1] >= 8) { value++; }
    if (milestones[5][1] >= 6) { value++; }
    global.strangeInfo.instability = value;
};

export const calculateMilestoneInformation = (index: number, stageIndex: number) => {
    const { need, reward } = global.milestonesInfo[stageIndex];
    const level = player.milestones[stageIndex][index];
    if (!player.inflation.vacuum) {
        const scaling = global.milestonesInfo[stageIndex].scalingOld[index];
        need[index] = level < scaling.length ? Limit(scaling[level]).toArray() : [0, 0];
    } else {
        if (stageIndex === 1) {
            if (index === 0) {
                need[0] = Limit('1e80').power(level).multiply('1e80').toArray();
                reward[0] = 1.04 ** level;
            } else if (index === 1) {
                need[1] = Limit(4e4 + 4e4 * level).toArray();
                reward[1] = 2 * level;
            }
        } else if (stageIndex === 2) {
            if (index === 0) {
                need[0] = Limit('1e1').power(level).multiply('1e1').toArray();
                reward[0] = 1.02 ** level;
            } else if (index === 1) {
                need[1] = Limit(80 + (80 + 8 * level) * level).toArray();
                reward[1] = 1.04 ** level;
            }
        } else if (stageIndex === 3) {
            if (index === 0) {
                need[0] = Limit('1e3').power(level).multiply('1e-15').toArray();
                reward[0] = 1.03 ** level;
            } else if (index === 1) {
                need[1] = Limit(4 + 4 * level).toArray();
                reward[1] = level / 400;
            }
        } else if (stageIndex === 4) {
            if (index === 0) {
                need[0] = Limit('1e4').power(level).multiply('1e4').toArray();
                reward[0] = 1.05 ** level;
            } else if (index === 1) {
                need[1] = Limit(40 + 40 * level).toArray();
                reward[1] = 1.03 ** level;
            }
        } else if (stageIndex === 5) {
            if (index === 0) {
                need[0] = Limit(160 + 160 * level).toArray();
                reward[0] = 1.14 ** level;
            } else if (index === 1) {
                need[1] = Limit(1 + level).toArray();
                reward[1] = level / 40;
            }
        }
    }
};

const awardMilestone = (index: number, stageIndex: number, count = 0) => {
    if (!milestoneCheck(index, stageIndex)) {
        if (count > 0) {
            Notify(`Milestone '${global.milestonesInfo[stageIndex].name[index]}' ${count > 1 ? `${format(count)} new tiers` : 'new tier'} reached\nTotal is now: ${format(player.milestones[stageIndex][index])}`);
            if (player.inflation.vacuum) {
                if (stageIndex === 1) {
                    if (index === 1) {
                        assignEnergy();
                        awardMilestone(1, 1);
                    }
                }
            } else {
                player.strange[0].current += count;
                player.strange[0].total += count;
                calculateInstability();
                assignStrangeBoost();
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
        if (Limit(player.vaporization.clouds).moreThan('1e4')) { progress++; }
    } else if (index === 3) {
        progress = player.accretion.rank - 1;
    } else if (index === 4) {
        if (player.collapse.stars[0] > 1) { progress++; }
        if (player.collapse.stars[1] > 1) { progress++; }
        if (player.collapse.stars[2] > 1) { progress++; }
    }
    if (old >= progress) { return; }

    player.challenges.void[index] = progress;
    for (let i = old; i < progress; i++) {
        Notify(`New Void reward achieved\nReward: ${global.challengesInfo.rewardText[0][index][i]}`);
    }
    if (index === 3 && old < 4) {
        calculateMaxLevel(0, 1, 'strangeness', true);
        calculateMaxLevel(2, 1, 'strangeness', true);
        calculateMaxLevel(9, 1, 'strangeness', true);
        calculateMaxLevel(0, 2, 'strangeness', true);
        calculateMaxLevel(1, 2, 'strangeness', true);
        calculateMaxLevel(3, 2, 'strangeness', true);
        calculateMaxLevel(0, 3, 'strangeness', true);
        calculateMaxLevel(1, 3, 'strangeness', true);
        calculateMaxLevel(10, 3, 'strangeness', true);
        calculateMaxLevel(0, 4, 'strangeness', true);
        calculateMaxLevel(1, 4, 'strangeness', true);
        calculateMaxLevel(7, 4, 'strangeness', true);
        calculateMaxLevel(1, 5, 'strangeness', true);
    }
};

export const enterExitChallenge = async(index: number) => {
    if (player.challenges.active === index) {
        if (!await Confirm(`Leave the '${global.challengesInfo.name[index]}'?`)) { return; }
        index = -1;
    } else {
        if (!player.inflation.vacuum) { return; }
        if (index === 0 && player.strangeness[5][0] < 1) { return; }
        if (!await Confirm(`Enter the '${global.challengesInfo.name[index]}'?\nStage reset will be forced`)) { return; }
    }

    const reward = stageResetCheck(5); //Just in case
    player.challenges.active = index;
    if (!reward) {
        setActiveStage(1);
        player.time.stage = 0;
        player.stage.time = 0;
        player.stage.current = 1;
        resetStage([1, 2, 3, 4, 5]);
    } else { stageResetReward(5); }

    getChallengeDescription(index);
    if (global.screenReader) { getId('SRStage').textContent = index === -1 ? 'Challenge is no longer active' : `'${global.challengesInfo.name[index]}' is now active`; }
};
