import { checkTab, milestoneGetValue } from './Check';
import Overlimit from './Limit';
import { getClass, getId, getQuery, simulateOffline } from './Main';
import { global, player } from './Player';
import { MDStrangenessPage, Notify, SRHotkeysInfo, globalSave, playEvent, specialHTML, switchTheme } from './Special';
import { autoElementsBuy, autoResearchesBuy, autoUpgradesBuy, buyBuilding, calculateBuildingsCost, gainBuildings, assignBuildingInformation, collapseResetCheck, dischargeResetCheck, rankResetCheck, stageResetCheck, toggleSwap, vaporizationResetCheck, switchStage, setActiveStage, calculateEffects, awardMilestone, assignMergeReward, assignGlobalSpeed, calculateMergeMaxResets, getChallengeTimeLimit, exitChallengeAuto } from './Stage';
import type { gameTab } from './Types';

export const switchTab = (tab: gameTab, subtab = null as null | string) => {
    if (subtab === null) {
        const oldTab = global.tab;
        getId(`${oldTab}Tab`).style.display = 'none';
        getId(`${oldTab}TabBtn`).classList.remove('tabActive');
        for (const inside of global.tabList[`${oldTab}Subtabs`]) {
            getId(`${oldTab}SubtabBtn${inside}`).style.display = 'none';
        }

        global.tab = tab;
        let subtabAmount = 0;
        getId(`${tab}Tab`).style.display = '';
        getId(`${tab}TabBtn`).classList.add('tabActive');
        for (const inside of global.tabList[`${tab}Subtabs`]) {
            if (checkTab(tab, inside)) {
                getId(`${tab}SubtabBtn${inside}`).style.display = '';
                subtabAmount++;
            } else if (global.subtab[`${tab}Current`] === inside) {
                switchTab(tab, global.tabList[`${tab}Subtabs`][0]);
            }
        }
        getId('subtabs').style.display = subtabAmount > 1 ? '' : 'none';
        if (globalSave.SRSettings[0]) { getId('SRTab').textContent = `Current tab is '${tab}'${subtabAmount > 1 ? ` and subtab is '${global.subtab[`${tab}Current`]}'` : ''}`; }
    } else {
        const oldSubtab = global.subtab[`${tab}Current`];
        getId(`${tab}Subtab${oldSubtab}`).style.display = 'none';
        getId(`${tab}SubtabBtn${oldSubtab}`).classList.remove('tabActive');

        global.subtab[`${tab as Exclude<gameTab, 'Elements'>}Current`] = subtab;
        getId(`${tab}Subtab${subtab}`).style.display = '';
        getId(`${tab}SubtabBtn${subtab}`).classList.add('tabActive');
        if (global.tab !== tab) { return; }
        if (globalSave.SRSettings[0]) { getId('SRTab').textContent = `Current subtab is '${subtab}', part of '${tab}' tab`; }
    }

    const active = player.stage.active;
    if ((tab === 'upgrade' && global.subtab.upgradeCurrent === 'Elements') || tab === 'Elements') {
        if (active !== 4 && active !== 5) {
            if (tab === 'upgrade' && subtab === null) {
                switchTab('upgrade', 'Upgrades');
            } else {
                setActiveStage(global.trueActive === 5 ? 5 : 4, global.trueActive);
                stageUpdate();
            }
            return;
        }
    } else if (tab === 'inflation') {
        if (active !== 6) {
            setActiveStage(6, global.trueActive);
            stageUpdate();
            return;
        }
    } else if (global.trueActive !== active) {
        switchStage(global.trueActive);
        return;
    }
    if (!global.paused) {
        visualUpdate();
        numbersUpdate();
    }
};

/** Normal game tick */
export const timeUpdate = (timeWarp = 0, tick = 0.2) => {
    const { time, ASR } = player;
    const { auto, buildings: autoBuy } = player.toggles;
    const { maxActive } = global.buildingsInfo;
    const { autoU, autoR, autoE } = global.automatization;
    const activeAll = global.stageInfo.activeAll;
    const vacuum = player.inflation.vacuum;

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
        if (passedSeconds > 0.2) {
            if (passedSeconds > 600) { return void simulateOffline(passedSeconds); }
            timeWarp = passedSeconds - 0.2;
            passedSeconds = 0.2;
        } else if (passedSeconds <= 0) {
            time.offline += passedSeconds;
            return;
        }
        time.online += passedSeconds;
    }
    const trueSeconds = passedSeconds;
    time.stage += trueSeconds;
    time.universe += trueSeconds;

    assignGlobalSpeed();
    passedSeconds *= global.inflationInfo.globalSpeed;

    player.stage.time += passedSeconds;
    player.inflation.age += passedSeconds;

    if (player.toggles.normal[3]) { exitChallengeAuto(); }
    if (vacuum || activeAll.includes(4)) { stageResetCheck(5, trueSeconds); }
    assignBuildingInformation();
    if (activeAll.includes(6)) {
        gainBuildings(0, 6, passedSeconds); //Dark matter
    }
    if (activeAll.includes(5)) {
        if (player.strangeness[5][3] >= 1 || global.milestonesInfoS6.active[2]) {
            if (autoU[5].length !== 0) { autoUpgradesBuy(5); }
            if (autoR[5].length !== 0) { autoResearchesBuy('researches', 5); }
            if (autoE[5].length !== 0) { autoResearchesBuy('researchesExtra', 5); }
        }
        for (let i = maxActive[5] - 1; i >= 1; i--) {
            if (autoBuy[5][i] && ASR[5] >= i) { buyBuilding(i, 5, 0, true); }
        }
        gainBuildings(0, 5, passedSeconds); //Brown dwarfs
        const research = player.researches[5][0];
        if (research >= 1) { gainBuildings(1, 5, passedSeconds); } //Main sequence
        if (research >= 2) { gainBuildings(2, 5, passedSeconds); } //Red supergiants
        if (research >= 3) { gainBuildings(3, 5, passedSeconds); } //Blue hypergiants
        if (research >= 4 && player.challenges.active !== 0) { gainBuildings(4, 5, passedSeconds); } //Quasi-stars
        assignBuildingInformation();
    }
    if (activeAll.includes(4)) {
        if (global.automatization.elements.length !== 0) { autoElementsBuy(); }
        if (autoU[4].length !== 0) { autoUpgradesBuy(4); }
        if (autoR[4].length !== 0) { autoResearchesBuy('researches', 4); }
        if (autoE[4].length !== 0) { autoResearchesBuy('researchesExtra', 4); }
        for (let i = maxActive[4] - 1; i >= 1; i--) {
            if (autoBuy[4][i] && ASR[4] >= i) { buyBuilding(i, 4, 0, true); }
            gainBuildings(i - 1, 4, passedSeconds); //Elements
        }
        awardMilestone(0, 5);
        awardMilestone(0, 4);
        collapseResetCheck(true);
        awardMilestone(1, 4);
    }
    if (activeAll.includes(3)) {
        if (!vacuum && auto[0]) { stageResetCheck(3, 0); }
        if (auto[3]) { rankResetCheck(true); }
        if (autoU[3].length !== 0) { autoUpgradesBuy(3); }
        if (autoR[3].length !== 0) { autoResearchesBuy('researches', 3); }
        if (autoE[3].length !== 0) { autoResearchesBuy('researchesExtra', 3); }
        for (let i = 1; i < maxActive[3]; i++) {
            if (autoBuy[3][i] && ASR[3] >= i) { buyBuilding(i, 3, 0, true); }
        }
        gainBuildings(2, 3, passedSeconds); //Planetesimals
        assignBuildingInformation();
        gainBuildings(1, 3, passedSeconds); //Cosmic dust
        assignBuildingInformation();
        if (!vacuum) {
            gainBuildings(0, 3, passedSeconds); //Mass
            assignBuildingInformation();
        }
    }
    if (activeAll.includes(2)) {
        if (!vacuum && auto[0]) { stageResetCheck(2, 0); }
        vaporizationResetCheck(trueSeconds);
        if (autoU[2].length !== 0) { autoUpgradesBuy(2); }
        if (autoR[2].length !== 0) { autoResearchesBuy('researches', 2); }
        if (autoE[2].length !== 0) { autoResearchesBuy('researchesExtra', 2); }
        for (let i = maxActive[2] - 1; i >= 1; i--) {
            if (autoBuy[2][i] && ASR[2] >= i) { buyBuilding(i, 2, 0, true); }
        }
        gainBuildings(1, 2, passedSeconds); //Drops
        assignBuildingInformation();
        if (!vacuum) {
            gainBuildings(0, 2, passedSeconds); //Moles
            assignBuildingInformation();
        }
        awardMilestone(1, 2);
        awardMilestone(0, 2);
    }
    if (activeAll.includes(1)) {
        if (!vacuum && auto[0]) { stageResetCheck(1, 0); }
        if (autoU[1].length !== 0) { autoUpgradesBuy(1); }
        if (autoR[1].length !== 0) { autoResearchesBuy('researches', 1); }
        if (autoE[1].length !== 0) { autoResearchesBuy('researchesExtra', 1); }
        if (player.upgrades[1][8] === 1) {
            gainBuildings(5, 1, passedSeconds);
            assignBuildingInformation(); //Molecules
        }
        for (let i = maxActive[1] - 1; i >= 1; i--) {
            if (autoBuy[1][i] && ASR[1] >= i) { buyBuilding(i, 1, 0, true); }
            gainBuildings(i - 1, 1, passedSeconds); //Rest of Microworld
            assignBuildingInformation();
        }
        awardMilestone(1, 1);
        awardMilestone(0, 1);
        dischargeResetCheck(true);
    }

    if (timeWarp > 0) { timeUpdate(timeWarp, tick); }
};

export const numbersUpdate = () => {
    const { tab, subtab } = global;
    const active = player.stage.active;
    const buildings = player.buildings[active];
    const vacuum = player.inflation.vacuum;

    if (!global.debug.timeLimit) {
        let timeLimit = 0;
        if (vacuum) {
            if (player.challenges.active === 0) { timeLimit = 3600; }
        } else if (player.inflation.tree[4] < 1 && (player.stage.true >= 7 || player.stage.resets >= 4)) {
            const s = Math.min(player.stage.current, 4);
            const info = global.milestonesInfo;
            for (let i = 0; i < info[s].need.length; i++) {
                if (player.milestones[s][i] >= info[s].max[i]) {
                    if (s === 4 && player.milestones[5][i] < info[5].max[i]) {
                        timeLimit = Math.max(info[5].time[i], timeLimit);
                    }
                    continue;
                }
                timeLimit = Math.max(info[s].time[i], timeLimit);
            }
        }

        if (timeLimit > 0) {
            if (player.inflation.tree[0] >= 1 && player.inflation.tree[4] < 1) { timeLimit /= 4; }
            if (player.time.stage > timeLimit) {
                Notify(`Time limit had been reached for ${vacuum ? global.challengesInfo.name[player.challenges.active as number] : 'all Milestones'}`);
                global.debug.timeLimit = true;
            }
        } else { global.debug.timeLimit = true; }
    }

    if (global.footer) {
        if (active === 1) {
            getId('footerStat1Span').textContent = format(buildings[0].current, { padding: true });
            getId('footerStat2Span').textContent = format(player.discharge.energy, { padding: 'exponent' });
        } else if (active === 2) {
            getId('footerStat1Span').textContent = format(buildings[0].current, { padding: true });
            getId('footerStat2Span').textContent = format(buildings[1].current, { padding: true });
            getId('footerStat3Span').textContent = format(player.vaporization.clouds, { padding: true });
        } else if (active === 3) {
            getId('footerStat1Span').textContent = format(buildings[0].current, { padding: true });
        } else if (active === 4 || active === 5) {
            const stars = player.buildings[4];

            getId('footerStat1Span').textContent = format(player.collapse.mass, { padding: true });
            getId('footerStat2Span').textContent = format(stars[0].current, { padding: true });
            if (active === 5) {
                getId('footerStat3Span').textContent = format(new Overlimit(stars[1].current).plus(stars[2].current, stars[3].current, stars[4].current, stars[5].current), { padding: true });
            }
        } else if (active === 6) {
            getId('footerStat1Span').textContent = format(buildings[0].current, { padding: true });
            getId('footerStat2Span').textContent = format(player.cosmon.current, { padding: 'exponent' });
        }
    }
    if (tab === 'stage') {
        if (subtab.stageCurrent === 'Structures') {
            const { buildingsInfo } = global;
            const howMany = global.hotkeys.shift ? (global.hotkeys.ctrl ? 100 : 1) : global.hotkeys.ctrl ? 10 : player.toggles.shop.input;

            for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
                const trueCountID = getId(`building${i}True`);
                getId(`building${i}Cur`).textContent = format(buildings[i].current, { padding: trueCountID.style.display !== 'none' });
                getId(`building${i}Prod`).textContent = format(buildingsInfo.producing[active][i], { padding: true });
                trueCountID.textContent = `[${format(buildings[i as 1].true)}]`;

                let lockText;
                if (active === 3) {
                    if (i > 1 && player.upgrades[3][global.accretionInfo.unlockA[i - 2]] !== 1) {
                        lockText = 'Unlocked with Upgrade';
                    }
                } else if (active === 4) {
                    if (i === 5 && player.challenges.active === 0) {
                        lockText = "Can't be created inside Void";
                    } else if (player.researchesExtra[5][0] < 1 && player.collapse.mass < global.collapseInfo.unlockB[i]) {
                        lockText = `Unlocked at ${format(global.collapseInfo.unlockB[i])} Mass`;
                    }
                }
                if (lockText !== undefined) {
                    getId(`building${i}`).classList.remove('availableBuilding');
                    getId(`building${i}Btn`).textContent = lockText;
                    getId(`building${i}BuyX`).textContent = 'Locked';
                    continue;
                }

                let costName: string;
                let currency: number | Overlimit;
                let free = false;
                let multi = true;
                if (active === 6) { //Universe
                    costName = 'Groups';
                    currency = player.merge.reward[0];
                    multi = false;
                } else if (active === 5 && i === 3) { //Galaxy
                    costName = 'Mass';
                    currency = player.collapse.mass;
                    multi = false;
                } else {
                    let e = i - 1;
                    let extra = active;
                    if (active === 1) {
                        if (i === 1 && vacuum) { free = player.researchesExtra[1][2] >= 1 && player.strangeness[1][8] >= 1; }
                    } else if (active === 2) {
                        if (i !== 1) { e = 1; }
                    } else if (active >= 3) {
                        e = 0;
                        if (active === 5) { extra = 4; }
                    }

                    costName = buildingsInfo.name[extra][e];
                    currency = player.buildings[extra][e].current;
                }

                let buy = 1;
                const cost = calculateBuildingsCost(i, active);
                if (howMany !== 1 && multi) {
                    const scaling = buildingsInfo.increase[active][i];
                    if (free) {
                        buy = howMany <= 0 ? Math.max(Math.floor(new Overlimit(currency).divide(cost).log(scaling).toNumber()) + 1, 1) : howMany;
                        if (buy > 1) { cost.multiply(new Overlimit(scaling).power(buy - 1)); }
                    } else {
                        buy = howMany <= 0 ? Math.max(Math.floor(new Overlimit(currency).multiply(scaling - 1).divide(cost).plus('1').log(scaling).toNumber()), 1) : howMany;
                        if (buy > 1) { cost.multiply(new Overlimit(scaling).power(buy).minus('1').divide(scaling - 1)); }
                    }
                }

                getId(`building${i}`).classList[cost.lessOrEqual(currency) ? 'add' : 'remove']('availableBuilding');
                getId(`building${i}Btn`).textContent = `Need: ${format(cost, { padding: true })} ${costName}`;
                getId(`building${i}BuyX`).textContent = format(buy, { padding: 'exponent' });
            }
            if (active === 1) {
                getId('reset1Button').textContent = `Next goal is ${format(global.dischargeInfo.next, { padding: 'exponent' })} Energy`;
                getQuery('#tritiumEffect > span').textContent = format(global.dischargeInfo.tritium, { padding: true });
                getQuery('#dischargeEffect > span').textContent = format(new Overlimit(global.dischargeInfo.base).power(global.dischargeInfo.total), { padding: true });
                getQuery('#energySpent > span').textContent = format(global.dischargeInfo.energyTrue - player.discharge.energy, { padding: 'exponent' });
                if (vacuum) {
                    getQuery('#preonCap > span').textContent = format(global.inflationInfo.preonCap, { padding: true });
                    getId('preonCapRatio').textContent = format(new Overlimit(global.inflationInfo.preonTrue).divide(global.inflationInfo.preonCap), { padding: true });
                }
            } else if (active === 2) {
                getId('reset1Button').textContent = `Reset for ${format(global.vaporizationInfo.get, { padding: true })} Clouds`;
                getQuery('#cloudEffect > span').textContent = format(calculateEffects.clouds(), { padding: true });
                if (vacuum) {
                    getQuery('#molesProduction > span').textContent = format(new Overlimit(global.dischargeInfo.tritium).divide('6.02214076e23'), { padding: true });
                }

                const rainNow = calculateEffects.S2Extra1(player.researchesExtra[2][1]);
                const rainAfter = calculateEffects.S2Extra1(player.researchesExtra[2][1], true);
                const storm = calculateEffects.S2Extra2(rainAfter) / calculateEffects.S2Extra2(rainNow);
                getQuery('#vaporizationBoostTotal > span').textContent = format(new Overlimit(calculateEffects.clouds(true)).divide(calculateEffects.clouds()).toNumber() * (rainAfter / rainNow) * storm, { padding: true });
            } else if (active === 3) {
                getQuery('#dustSoftcap > span').textContent = format(global.accretionInfo.dustSoft);
                if (player.accretion.rank < global.accretionInfo.maxRank && player.strangeness[3][4] >= 2) {
                    if (vacuum) { buildings[0].total.setValue(player.buildings[1][0].total).multiply('1.78266192e-33'); }
                    getId('reset1Button').textContent = `Next Rank after ${format(Math.max(global.accretionInfo.rankCost[player.accretion.rank] - buildings[0].total.toNumber(), 0), { padding: true })} Mass`;
                }
                if (vacuum) {
                    getQuery('#massProduction > span').textContent = format(new Overlimit(buildingsInfo.producing[1][1]).multiply('1.78266192e-33'), { padding: true });
                    getQuery('#dustCap > span').textContent = format(global.inflationInfo.dustCap, { padding: true });
                    getId('dustCapRatio').textContent = format(new Overlimit(global.inflationInfo.dustTrue).divide(global.inflationInfo.dustCap), { padding: true });
                    getQuery('#submersionBoost > span').textContent = format(calculateEffects.submersion(), { padding: true });
                }
            } else if (active === 4 || active === 5) {
                const { collapseInfo } = global;
                const massEffect = calculateEffects.mass();
                const starEffect = [calculateEffects.star[0](), collapseInfo.neutronEffect, calculateEffects.star[2]()];
                let total = (calculateEffects.mass(true) / massEffect) * (calculateEffects.S4Research4(true) / calculateEffects.S4Research4()) * ((1 + (calculateEffects.S5Upgrade2(true) - calculateEffects.S5Upgrade2()) / global.mergeInfo.galaxyBase) ** (player.buildings[5][3].true * 2));
                if (player.strangeness[4][4] < 2) {
                    const starProd = global.buildingsInfo.producing[4];
                    const restProd = new Overlimit(starProd[1]).plus(starProd[3], starProd[4], starProd[5]);
                    total *= new Overlimit(starProd[2]).multiply(calculateEffects.star[0](true) / calculateEffects.star[0]()).plus(restProd).divide(restProd.plus(starProd[2])).replaceNaN('1').toNumber() * (calculateEffects.star[1](true) / starEffect[1]) * (calculateEffects.star[2](true) / starEffect[2]);
                }

                if (active === 4) {
                    getId('reset1Button').textContent = `Collapse is at ${format(collapseInfo.newMass, { padding: true })} Mass`;
                    getQuery('#solarMassEffect > span').textContent = format(massEffect, { padding: true });
                    for (let i = 0; i < 3; i++) {
                        getId(`special${i + 1}Cur`).textContent = format(player.collapse.stars[i], { padding: 'exponent' });
                        getId(`special${i + 1}Get`).textContent = format(collapseInfo.starCheck[i], { padding: 'exponent' });
                        getQuery(`#star${i + 1}Effect > span`).textContent = format(starEffect[i], { padding: true });
                    }
                    getQuery('#collapseBoostTotal > span').textContent = format(total, { padding: true });
                    if (vacuum) {
                        getQuery('#mainCap > span').textContent = format(global.inflationInfo.massCap, { padding: true });
                        getId('mainCapTill').textContent = format(new Overlimit(global.inflationInfo.massCap / 8.96499278339628e-67).minus(player.buildings[1][0].current).divide(buildingsInfo.producing[1][1]).replaceNaN('Infinity').toNumber() / global.inflationInfo.globalSpeed, { padding: true });
                    }
                } else if (active === 5) {
                    assignMergeReward();
                    if (vacuum) {
                        const remaining = calculateMergeMaxResets() - player.merge.resets;
                        getId('reset1Button').textContent = `Can reset ${format(remaining, { padding: 'exponent' })} more time${remaining !== 1 ? 's' : ''}`;
                        for (let i = 0; i < 1; i++) {
                            getId(`special${i + 1}Cur`).textContent = format(player.merge.reward[i], { padding: 'exponent' });
                            getId(`special${i + 1}Get`).textContent = format(global.mergeInfo.checkReward[i], { padding: 'exponent' });
                            getQuery(`#merge${i + 1}Effect > span`).textContent = format(calculateEffects.reward[i](), { padding: true });
                        }
                        getQuery('#mainCapS5 > span').textContent = format(global.inflationInfo.massCap, { padding: true });
                    } else {
                        getId('reset1Button').textContent = `Requires ${format(22 + 2 * player.buildings[6][1].true, { padding: 'exponent' })} Galaxies`;
                    }
                    const starProd = global.buildingsInfo.producing[4];
                    getQuery('#elementsProductionS5 > span').textContent = format(new Overlimit(starProd[1]).plus(starProd[2], starProd[3], starProd[4], starProd[5]), { padding: true });
                    getQuery('#collapseBoostTotalS5 > span').textContent = format(total, { padding: true });
                    getQuery('#mainCapCurrentS5 > span').textContent = format(collapseInfo.newMass, { padding: true });
                }
            } else if (active === 6) {
                getQuery('#cosmonGain > span').textContent = format(vacuum ? buildings[1].true + 1 : 1, { padding: 'exponent' });
            }

            if (!vacuum && (active >= 6 ? player.stage.current : active) < 4) {
                getId('stageReward').textContent = format(calculateEffects.strangeGain(false), { padding: true });
                if (active < 4) { getId('stageReset').textContent = stageResetCheck(active) ? 'Requirements are met' : `Requires ${active === 3 ? `${format(2.45576045e31)} Mass` : active === 2 ? `${format(1.19444e29)} Drops` : `${format(1.67133125e21)} Molecules`}`; }
            } else { getId('stageReward').textContent = format(global.strangeInfo.quarksGain, { padding: true }); }
            getQuery('#stageTime > span').textContent = format(player.stage.time, { type: 'time' });
            getQuery('#stageTimeReal > span').textContent = format(player.time.stage, { type: 'time' });
        } else if (subtab.stageCurrent === 'Advanced') {
            getQuery('#globalSpeed > span').textContent = format(global.inflationInfo.globalSpeed, { padding: true });
            getQuery('#universeTime > span').textContent = format(player.inflation.age, { type: 'time' });
            getQuery('#universeTimeReal > span').textContent = format(player.time.universe, { type: 'time' });

            const timeId = getId('challengeTime', true);
            if (timeId !== null) { timeId.textContent = format(getChallengeTimeLimit(/*player.challenges.active as number*/) - player.time.stage, { type: 'time' }); }
        }
    } else if (tab === 'upgrade' || tab === 'Elements') {
        const trueSubtab = tab === 'Elements' ? tab : subtab.upgradeCurrent;
        if (trueSubtab === 'Upgrades') {
            const last = global.lastUpgrade[active];
            if (last[0] !== null) { getUpgradeDescription(last[0], last[1]); }
        } else if (trueSubtab === 'Elements') {
            if (global.lastElement !== null) { getUpgradeDescription(global.lastElement, 'elements'); }
        }
    } else if (tab === 'strangeness') {
        if (subtab.strangenessCurrent === 'Matter') {
            const interstellar = vacuum || (active >= 6 ? player.stage.current : active) >= 4;
            const quarksGain = interstellar ? global.strangeInfo.quarksGain : calculateEffects.strangeGain(false);
            getId('strange0Gain').textContent = format(quarksGain, { padding: true });
            getId('strange1Gain').textContent = format(calculateEffects.strangeGain(interstellar, 1), { padding: true });
            getId('strangeRate').textContent = format(quarksGain / player.time.stage, { type: 'income' });
            getId('strangePeak').textContent = interstellar ? format(player.stage.peak, { type: 'income' }) : 'Interstellar Stage only';
            getId('strange0Cur').textContent = format(player.strange[0].current, { padding: true });
            getId('strange1Cur').textContent = format(player.strange[1].current, { padding: true });
            getId('stageTimeStrangeness').textContent = format(player.time.stage, { type: 'time' });
            getId('stageTimeBestReset').textContent = format(player.history.stage.best[0], { type: 'time' });
            if (getId('strangeletsEffectsMain').style.display === '') { //Slow, but probably better than nothing
                const information = global.strangeInfo.strangeletsInfo;
                getId('strangeletsEffect1Stat0').textContent = format(information[0] * 100, { padding: true });
                if (interstellar) { getId('strangeletsEffect1Stat1').textContent = format(stageResetCheck(5) ? information[0] * quarksGain / player.time.stage : 0, { type: 'income' }); }
                getId('strangeletsEffect2Stat').textContent = format(information[1], { padding: true });
            }
            if (getId('quarksEffectsMain').style.display === '') {
                const { stageBoost } = global.strangeInfo;
                const { strangeness } = player;

                getId('quarksEffect1Stat').textContent = format(strangeness[1][6] >= 1 ? stageBoost[1] : 1, { padding: true });
                getId('quarksEffect2Stat').textContent = format(strangeness[2][6] >= 1 ? stageBoost[2] : 1, { padding: true });
                getId('quarksEffect3Stat').textContent = format(strangeness[3][7] >= 1 ? stageBoost[3] : 1, { padding: true });
                getId('quarksEffect4Stat').textContent = format(strangeness[4][7] >= 1 ? stageBoost[4] : 1, { padding: true });
                getId('quarksEffect5Stat').textContent = format(strangeness[5][7] >= 1 ? stageBoost[5] : 1, { padding: true });
            }

            const last = global.lastStrangeness;
            if (last[0] !== null) { getStrangenessDescription(last[0], last[1], 'strangeness'); }
        } else if (subtab.strangenessCurrent === 'Milestones') {
            const { milestonesInfo: info, lastMilestone: last } = global;
            const tree = player.inflation.tree;
            const time = player.time.stage;
            for (let s = 1; s < info.length; s++) {
                for (let i = 0; i < info[s].need.length; i++) {
                    getId(`milestone${i + 1}Stage${s}Current`).textContent = format(milestoneGetValue(i, s), { padding: true });
                    getId(`milestone${i + 1}Stage${s}Required`).textContent = player.milestones[s][i] >= info[s].max[i] ? 'Maxed' :
                        tree[4] < 1 && time > info[s].time[i] / (tree[0] >= 1 ? 4 : 1) ? 'No time' :
                        format(info[s].need[i], { padding: true });
                }
            }
            if (last[0] !== null) { getStrangenessDescription(last[0], last[1], 'milestones'); }
        }
    } else if (tab === 'inflation') {
        if (subtab.inflationCurrent === 'Researches') {
            if (global.lastInflation !== null) { getUpgradeDescription(global.lastInflation, 'inflation'); }
        }
    } else if (tab === 'settings') {
        if (subtab.settingsCurrent === 'Settings') {
            const exportReward = player.time.export;
            const conversion = Math.min(exportReward[0] / 86400, 1);
            getId('exportQuarks').textContent = format((exportReward[1] / 2.5 + 1) * conversion, { padding: true });
            getId('exportStrangelets').textContent = format(exportReward[2] / 2.5 * conversion, { padding: true });
            if (global.lastSave >= 1) { getId('isSaved').textContent = `${format(global.lastSave, { type: 'time' })} ago`; }
        } else if (subtab.settingsCurrent === 'Stats') {
            getId('firstPlayAgo').textContent = format((Date.now() - player.time.started) / 1000, { type: 'time' });
            getId('onlineTotal').textContent = format(player.time.online, { type: 'time' });
            getQuery('#stageResets > span').textContent = format(player.stage.resets, { padding: 'exponent' });

            const exportReward = player.time.export;
            getId('exportQuarksMax').textContent = format(exportReward[1] / 2.5 + 1, { padding: true });
            getId('exportStrangeletsMax').textContent = format(exportReward[2] / 2.5, { padding: true });
            getId('exportTimeToMax').textContent = format(86400 - exportReward[0], { type: 'time' });
            getId('exportQuarksStorage').textContent = format(exportReward[1], { padding: true });
            getId('exportStrangeletsStorage').textContent = format(exportReward[2], { padding: true });
            if (active === 1) {
                getQuery('#dischargeStat > span').textContent = format(global.dischargeInfo.total, { padding: 'exponent' });
                getId('dischargeStatTrue').textContent = ` [${format(player.discharge.current, { padding: 'exponent' })}]`;
                for (let s = 1; s <= (vacuum ? 5 : 1); s++) {
                    const buildings = player.buildings[s];
                    const energyType = global.dischargeInfo.energyType[s];
                    for (let i = 1; i < global.buildingsInfo.maxActive[s]; i++) {
                        getQuery(`#energyGainStage${s}Build${i + (vacuum ? 0 : 2)} > span`).textContent = format(energyType[i] * buildings[i as 1].true, { padding: 'exponent' });
                        getId(`energyGainStage${s}Build${i + (vacuum ? 0 : 2)}Per`).textContent = format(energyType[i]);
                    }
                }
                getQuery('#maxEnergyStat > span').textContent = format(player.discharge.energyMax, { padding: 'exponent' });
            } else if (active === 2) {
                const clouds = new Overlimit(calculateEffects.clouds(true)).divide(calculateEffects.clouds()).toNumber();
                getQuery('#cloudStat > span').textContent = format(clouds, { padding: true });
                const rainNow = calculateEffects.S2Extra1(player.researchesExtra[2][1]);
                const rainAfter = calculateEffects.S2Extra1(player.researchesExtra[2][1], true);
                const rain = rainAfter / rainNow;
                const storm = calculateEffects.S2Extra2(rainAfter) / calculateEffects.S2Extra2(rainNow);
                getQuery('#rainStat > span').textContent = format(rain, { padding: true });
                getQuery('#stormStat > span').textContent = format(storm, { padding: true });
                getId('cloudEffectTotal').textContent = format(clouds * rain * storm, { padding: true });
                getQuery('#maxCloudStat > span').textContent = format(player.vaporization.cloudsMax, { padding: true });

                if (vacuum) {
                    const moles = player.buildings[1][5];
                    buildings[0].total.setValue(moles.total).divide('6.02214076e23');
                    buildings[0].trueTotal.setValue(moles.trueTotal).divide('6.02214076e23');
                }
            } else if (active === 3) {
                getId('currentRank').textContent = `${player.accretion.rank}`;
                if (vacuum) {
                    const mass = player.buildings[1][0];
                    buildings[0].total.setValue(mass.total).multiply('1.78266192e-33');
                    buildings[0].trueTotal.setValue(mass.trueTotal).multiply('1.78266192e-33');
                }
            } else if (active === 4 || active === 5) {
                getQuery('#maxSolarMassStat > span').textContent = format(player.collapse.massMax, { padding: true });
                if (active === 4) {
                    const auto2 = player.strangeness[4][4] >= 2;
                    const mass = calculateEffects.mass(true) / calculateEffects.mass();
                    getQuery('#solarMassStat > span').textContent = format(mass, { padding: true });
                    let star0 = 1;
                    if (!auto2) {
                        const starProd = global.buildingsInfo.producing[4];
                        const restProd = new Overlimit(starProd[1]).plus(starProd[3], starProd[4], starProd[5]);
                        star0 = new Overlimit(starProd[2]).multiply(calculateEffects.star[0](true) / calculateEffects.star[0]()).plus(restProd).divide(restProd.plus(starProd[2])).replaceNaN('1').toNumber();
                    }
                    const star1 = auto2 ? 1 : calculateEffects.star[1](true) / global.collapseInfo.neutronEffect;
                    const star2 = auto2 ? 1 : calculateEffects.star[2](true) / calculateEffects.star[2]();
                    if (!auto2) {
                        getQuery('#star1Stat > span').textContent = format(star0, { padding: true });
                        getQuery('#star2Stat > span').textContent = format(star1, { padding: true });
                        getQuery('#star3Stat > span').textContent = format(star2, { padding: true });
                    }
                    const gamma = calculateEffects.S4Research4(true) / calculateEffects.S4Research4();
                    getQuery('#gammaRayStat > span').textContent = format(gamma, { padding: true });
                    const quasar = (1 + (calculateEffects.S5Upgrade2(true) - calculateEffects.S5Upgrade2()) / global.mergeInfo.galaxyBase) ** player.buildings[5][3].true;
                    getQuery('#quasarStat > span').textContent = format(quasar, { padding: true });
                    getId('starTotal').textContent = format(mass * star0 * star1 * star2 * gamma * (quasar ** 2), { padding: true });
                } else if (active === 5) {
                    getId('trueStarsStat').textContent = format(global.collapseInfo.trueStars, { padding: 'exponent' });
                    const stars = player.buildings[4];
                    buildings[0].current.setValue(stars[1].current).plus(stars[2].current, stars[3].current, stars[4].current, stars[5].current);
                    buildings[0].total.setValue(stars[1].total).plus(stars[2].total, stars[3].total, stars[4].total, stars[5].total);
                    buildings[0].trueTotal.setValue(stars[1].trueTotal).plus(stars[2].trueTotal, stars[3].trueTotal, stars[4].trueTotal, stars[5].trueTotal);
                }
            } else if (active === 6) {
                getId('vacuumResets').textContent = format(player.inflation.resets, { padding: 'exponent' });
            }
            for (let i = 0; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}StatTotal`).textContent = format(buildings[i].total, { padding: true });
                getId(`building${i}StatTrueTotal`).textContent = format(buildings[i].trueTotal, { padding: true });
            }

            getId('strange0StatTotal').textContent = format(player.strange[0].total, { padding: true });
            getId('strange1StatTotal').textContent = format(player.strange[1].total, { padding: true });
            getId('cosmonStatTotal').textContent = format(player.cosmon.total, { padding: 'exponent' });
        }
    }
};

export const visualUpdate = () => {
    const { tab, subtab } = global;
    const { active, true: highest } = player.stage;
    const vacuum = player.inflation.vacuum;

    if (!player.events[0]) {
        if (highest === 5) {
            if (active === 5) { playEvent(5, 0); }
        } else if (highest === 4) {
            if (player.collapse.stars[1] >= 1) { playEvent(4, 0); }
        } else if (highest === 3) {
            if (player.buildings[3][0].current.moreOrEqual('5e29')) { playEvent(3, 0); }
        } else if (highest === 2) {
            if (new Overlimit(global.vaporizationInfo.get).plus(player.vaporization.clouds).moreThan('1e4')) { playEvent(2, 0); }
        } else if (highest === 1) {
            if (player.upgrades[1][9] === 1) { playEvent(1, 0); }
        }
    }

    if (global.footer) {
        if (globalSave.toggles[1]) { getId('ElementsTabBtn').style.display = player.upgrades[4][1] === 1 ? '' : 'none'; }
        if (active === 1) {
            if (highest < 2) {
                getId('footerStat2').style.display = player.discharge.energyMax >= 12 ? '' : 'none';
                getId('upgradeTabBtn').style.display = player.discharge.energyMax >= 12 ? '' : 'none';
            }
        } else if (active === 2) {
            getId('footerStat3').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
        }
    }
    if (globalSave.MDSettings[0]) {
        let showReset1 = tab === 'stage' || tab === 'upgrade' || tab === 'Elements' || tab === 'inflation';
        getId('structuresFooter').style.display = showReset1 ? '' : 'none';
        if (active === 4) {
            getId('resetGalaxyFooter').style.display = showReset1 && player.researchesExtra[5][0] >= 1 ? '' : 'none';
        } else if (active === 5) {
            getId('resetCollapseFooter').style.display = showReset1 ? '' : 'none';
        }
        if (showReset1) {
            if (active === 1) {
                showReset1 = player.upgrades[1][5] === 1;
            } else if (active === 2) {
                showReset1 = player.upgrades[2][2] === 1;
            } else if (active === 4) {
                showReset1 = player.upgrades[4][0] === 1;
            } else if (active === 5) {
                showReset1 = player.upgrades[5][3] === 1;
            } else if (active === 6) {
                showReset1 = false;
            }
        }
        getId('reset1Footer').style.display = showReset1 ? '' : 'none';
        getId('stageFooter').style.display = (tab === 'stage' && (highest >= 2 || player.upgrades[1][9] === 1)) || tab === 'strangeness' ? '' : 'none';
    }

    if (tab === 'stage') {
        if (subtab.stageCurrent === 'Structures') {
            const buildings = player.buildings[active];
            const ASR = player.ASR[active];

            getId('stageTimeReal').style.display = player.stage.time !== player.time.stage ? '' : 'none';
            getId('exportMaxed').style.display = player.time.export[0] >= 86400 && (player.stage.true >= 7 || player.strange[0].total > 0) ? '' : 'none';
            if (highest < 7) {
                if (highest < 2) { getId('toggleBuilding0').style.display = ASR >= 1 ? '' : 'none'; }
                getId('resetStage').style.display = player.stage.resets >= 1 || (vacuum ? player.elements[26] >= 1 : player.upgrades[1][9] === 1) ? '' : 'none';
            }
            for (let i = 1; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}True`).style.display = buildings[i].current.notEqual(buildings[i as 1].true) ? '' : 'none';
                getId(`toggleBuilding${i}`).style.display = ASR >= i ? '' : 'none';
            }
            if (active === 1) {
                getId('reset1Main').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('building2').style.display = buildings[1].trueTotal.moreOrEqual(vacuum ? '5' : '18') ? '' : 'none';
                getId('building3').style.display = buildings[2].trueTotal.moreOrEqual('2') ? '' : 'none';
                if (vacuum) {
                    getId('building4').style.display = buildings[3].trueTotal.moreOrEqual('18') ? '' : 'none';
                    getId('building5').style.display = buildings[4].trueTotal.moreOrEqual('2') ? '' : 'none';
                }
                getId('stageInfo').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('tritiumEffect').style.display = player.upgrades[1][8] === 1 ? '' : 'none';
                if (highest < 7) { getId('resets').style.display = player.stage.resets >= 1 || player.upgrades[1][5] === 1 ? '' : 'none'; }
            } else if (active === 2) {
                getId('reset1Main').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('building2').style.display = buildings[1].trueTotal.moreOrEqual('4e2') ? '' : 'none';
                getId('building3').style.display = buildings[1].trueTotal.moreOrEqual('8e6') ? '' : 'none';
                getId('building4').style.display = buildings[1].trueTotal.moreOrEqual('8e17') ? '' : 'none';
                getId('building5').style.display = buildings[1].trueTotal.moreOrEqual('8e22') ? '' : 'none';
                getId('cloudEffect').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('vaporizationBoostTotal').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                if (vacuum) {
                    getId('building6').style.display = buildings[1].trueTotal.moreOrEqual('2e25') ? '' : 'none';
                    if (highest < 7) { getId('resets').style.display = player.stage.resets >= 1 || player.upgrades[2][2] === 1 ? '' : 'none'; }
                } else { getId('stageInfo').style.display = player.upgrades[2][2] === 1 ? '' : 'none'; }
            } else if (active === 3) {
                const upgrades = player.upgrades[3];

                getId('buildings').style.display = player.accretion.rank >= 1 ? '' : 'none';
                getId('building2').style.display = upgrades[2] === 1 || buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('building3').style.display = upgrades[4] === 1 || buildings[3].trueTotal.moreThan('0') ? '' : 'none';
                getId('building4').style.display = upgrades[8] === 1 || buildings[4].trueTotal.moreThan('0') ? '' : 'none';
                getId('dustSoftcap').style.display = global.accretionInfo.dustSoft !== 1 ? '' : 'none';
                if (vacuum) {
                    getId('building5').style.display = upgrades[11] === 1 || buildings[5].trueTotal.moreThan('0') ? '' : 'none';
                    getId('submersionBoost').style.display = player.researchesExtra[1][2] >= 2 ? '' : 'none';
                } else { getId('stageInfo').style.display = global.accretionInfo.dustSoft !== 1 ? '' : 'none'; }
                updateRankInfo();
            } else if (active === 4) {
                const nova = player.researchesExtra[4][0];

                getId('reset1Main').style.display = player.upgrades[4][0] === 1 ? '' : 'none';
                getId('specials').style.display = buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('special2').style.display = buildings[3].trueTotal.moreThan('0') ? '' : 'none';
                getId('special3').style.display = buildings[4].trueTotal.moreThan('0') ? '' : 'none';
                getId('building2').style.display = nova >= 1 ? '' : 'none';
                getId('building3').style.display = nova >= 2 ? '' : 'none';
                getId('building4').style.display = nova >= 3 ? '' : 'none';
                getId('star1Effect').style.display = buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('star2Effect').style.display = buildings[3].trueTotal.moreThan('0') ? '' : 'none';
                getId('star3Effect').style.display = buildings[4].trueTotal.moreThan('0') ? '' : 'none';
                getId('collapseBoostTotal').style.display = player.upgrades[4][0] === 1 ? '' : 'none';
                if (vacuum) {
                    getId('building5').style.display = player.elements[26] >= 1 ? '' : 'none';
                    getId('mainCap').style.display = player.upgrades[4][0] === 1 ? '' : 'none';
                    if (highest < 7) { getId('resets').style.display = player.stage.resets >= 1 || player.upgrades[4][0] === 1 ? '' : 'none'; }
                }
            } else if (active === 5) {
                getId('reset1Main').style.display = player.upgrades[5][3] === 1 ? '' : 'none';
                if (!vacuum) {
                    getId('buildings').style.display = player.milestones[2][0] >= 7 || player.milestones[3][0] >= 7 ? '' : 'none';
                    getId('building1').style.display = player.milestones[2][0] >= 7 ? '' : 'none';
                    getId('building2').style.display = player.milestones[3][0] >= 7 ? '' : 'none';
                } else {
                    getId('specials').style.display = player.upgrades[5][3] === 1 ? '' : 'none';
                    getId('mergeEffects').style.display = player.upgrades[5][3] === 1 ? '' : 'none';
                }
                getId('building3').style.display = player.researchesExtra[5][0] >= 1 ? '' : 'none';
            }
        } else if (subtab.stageCurrent === 'Advanced') {
            getId('globalSpeed').style.display = global.inflationInfo.globalSpeed !== 1 ? '' : 'none';
            getId('universeTimeReal').style.display = player.inflation.age !== player.time.universe ? '' : 'none';
        }
    } else if (tab === 'upgrade' || tab === 'Elements') {
        const trueSubtab = tab === 'Elements' ? tab : subtab.upgradeCurrent;
        if (trueSubtab === 'Upgrades') {
            if (vacuum) {
                getId('researchAuto1').style.display = player.researchesExtra[1][2] >= 2 ? '' : 'none';
                getId('researchAuto2').style.display = player.accretion.rank >= 6 ? '' : 'none';
            }
            if (active === 1) {
                const superposition = player.upgrades[1][5] === 1;

                getId('upgrade7').style.display = superposition ? '' : 'none';
                getId('upgrade8').style.display = superposition ? '' : 'none';
                getId('upgrade9').style.display = superposition ? '' : 'none';
                getId('upgrade10').style.display = superposition ? '' : 'none';
                getId('stageResearches').style.display = superposition ? '' : 'none';
                if (vacuum) {
                    getId('extraResearches').style.display = superposition ? '' : 'none';
                    getId('researchExtra2').style.display = player.researchesExtra[1][2] >= 2 ? '' : 'none';
                    getId('researchExtra4').style.display = player.researchesExtra[1][2] >= 1 ? '' : 'none';
                    getId('researchExtra5').style.display = player.accretion.rank >= 6 ? '' : 'none';
                }
                if (highest < 7) { getId('researches').style.display = superposition ? '' : 'none'; }
            } else if (active === 2) {
                const buildings = player.buildings[2];

                getId('upgrade2').style.display = buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('upgrade3').style.display = buildings[3].trueTotal.moreThan('0') ? '' : 'none';
                getId('upgrade4').style.display = buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('upgrade5').style.display = buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('upgrade6').style.display = buildings[3].trueTotal.moreThan('0') ? '' : 'none';
                getId('upgrade7').style.display = buildings[4].trueTotal.moreThan('0') ? '' : 'none';
                getId('upgrade8').style.display = player.strangeness[2][2] >= 3 && buildings[5].trueTotal.moreThan('0') ? '' : 'none';
                if (vacuum) {
                    getId('upgrade9').style.display = player.strangeness[2][8] >= 3 && buildings[6].trueTotal.moreThan('0') ? '' : 'none';
                    getId('researchExtra4').style.display = player.accretion.rank >= 6 ? '' : 'none';
                }
                getId('research2').style.display = buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('research3').style.display = buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('research4').style.display = buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('research5').style.display = buildings[3].trueTotal.moreThan('0') ? '' : 'none';
                getId('research6').style.display = buildings[4].trueTotal.moreThan('0') ? '' : 'none';
                getId('extraResearches').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('researchExtra3').style.display = buildings[5].trueTotal.moreThan('0') ? '' : 'none';
            } else if (active === 3) {
                const rank = player.accretion.rank;
                const planetesimal = player.buildings[3][2].trueTotal.moreThan('0');

                getId('upgrade3').style.display = rank >= 2 ? '' : 'none';
                getId('upgrade4').style.display = planetesimal ? '' : 'none';
                getId('upgrade5').style.display = rank >= 3 ? '' : 'none';
                getId('upgrade6').style.display = rank >= 4 || player.upgrades[3][4] === 1 ? '' : 'none';
                getId('upgrade7').style.display = rank >= 4 ? '' : 'none';
                getId('upgrade8').style.display = rank >= 4 && player.strangeness[3][2] >= 3 ? '' : 'none';
                getId('upgrade9').style.display = rank >= 4 ? '' : 'none';
                getId('upgrade10').style.display = rank >= 4 ? '' : 'none';
                getId('upgrade11').style.display = rank >= 5 ? '' : 'none';
                getId('upgrade12').style.display = rank >= 5 ? '' : 'none';
                getId('upgrade13').style.display = rank >= 5 ? '' : 'none';
                getId('research3').style.display = planetesimal ? '' : 'none';
                getId('research4').style.display = planetesimal ? '' : 'none';
                getId('research5').style.display = rank >= 3 ? '' : 'none';
                getId('research6').style.display = rank >= 3 ? '' : 'none';
                getId('research7').style.display = rank >= 4 || player.upgrades[3][4] === 1 ? '' : 'none';
                getId('research8').style.display = rank >= 4 ? '' : 'none';
                getId('research9').style.display = rank >= 5 ? '' : 'none';
                getId('extraResearches').style.display = rank >= 2 ? '' : 'none';
                getId('researchExtra2').style.display = rank >= 3 ? '' : 'none';
                getId('researchExtra3').style.display = rank >= 4 ? '' : 'none';
                getId('researchExtra4').style.display = rank >= 5 ? '' : 'none';
                if (vacuum) {
                    getId('researchExtra5').style.display = rank >= 3 && player.researchesExtra[1][2] >= 2 ? '' : 'none';
                } else {
                    getId('upgrades').style.display = rank >= 1 ? '' : 'none';
                    getId('stageResearches').style.display = rank >= 1 ? '' : 'none';
                }
            } else if (active === 4) {
                const { strangeness } = player;
                const stars = player.collapse.stars;
                const galaxy = player.researchesExtra[5][0] >= 1;

                getId('upgrade4').style.display = strangeness[4][2] >= 3 ? '' : 'none';
                getId('upgrade5').style.display = strangeness[4][9] >= 1 ? '' : 'none';
                getId('research4').style.display = (galaxy || stars[0] > 0) && strangeness[4][2] >= 1 ? '' : 'none';
                getId('research5').style.display = galaxy || stars[2] > 0 ? '' : 'none';
                getId('research6').style.display = (galaxy || stars[2] > 0) && strangeness[4][9] >= 3 ? '' : 'none';
                getId('researchExtra2').style.display = galaxy || stars[0] > 0 ? '' : 'none';
                getId('researchExtra3').style.display = (galaxy || stars[0] > 0) && strangeness[4][2] >= 2 ? '' : 'none';
                getId('researchExtra4').style.display = (galaxy || stars[1] > 0) && strangeness[4][9] >= 2 ? '' : 'none';
            } else if (active === 5) {
                if (!vacuum) {
                    const nebula = player.milestones[2][0] >= 7;
                    const cluster = player.milestones[3][0] >= 7;

                    getId('upgrades').style.display = nebula || cluster ? '' : 'none';
                    getId('upgrade1').style.display = nebula ? '' : 'none';
                    getId('upgrade2').style.display = cluster ? '' : 'none';
                    getId('stageResearches').style.display = nebula || cluster ? '' : 'none';
                    getId('research1').style.display = nebula ? '' : 'none';
                    getId('research2').style.display = cluster ? '' : 'none';
                    getId('extraResearches').style.display = player.milestones[4][1] >= 8 ? '' : 'none';
                }
                getId('upgrade3').style.display = player.researchesExtra[5][0] >= 1 ? '' : 'none';
                getId('upgrade4').style.display = player.researchesExtra[5][0] >= 1 && (vacuum ? player.accretion.rank >= 7 : player.milestones[5][1] >= 8) ? '' : 'none';
            } else if (active === 6) {
                getId('upgrades').style.display = 'none';
                getId('stageResearches').style.display = 'none';
            }
        } else if (trueSubtab === 'Elements') {
            const upgrades = player.upgrades[4];
            const neutron = player.upgrades[4][2] === 1 && (player.collapse.stars[1] > 0 || player.researchesExtra[5][0] >= 1);

            let columns = 17 - (upgrades[3] === 1 ? 0 : 2) - (upgrades[4] === 1 ? 0 : 1); //18
            getId('elementsGrid').style.display = upgrades[2] === 1 ? '' : 'flex';
            for (let i = 6; i <= 10; i++) { getId(`element${i}`).style.display = upgrades[2] === 1 ? '' : 'none'; }
            for (let i = 11; i <= 26; i++) { getId(`element${i}`).style.display = neutron ? '' : 'none'; }
            if (!neutron) {
                columns = 8;
            } else if (player.collapse.show < 23) { //26 - showAhead
                for (let i = 26; i > Math.max(player.collapse.show + 3, 10); i--) { getId(`element${i}`).style.display = 'none'; }
                columns = Math.max(player.collapse.show - 9, 8); //min + show + showAhead - 20
            }
            getId('element27').style.display = upgrades[3] === 1 ? '' : 'none';
            getId('element28').style.display = upgrades[3] === 1 ? '' : 'none';
            for (let i = 29; i < global.elementsInfo.name.length; i++) {
                getId(`element${i}`).style.display = upgrades[4] === 1 && player.buildings[6][1].true >= i - 29 ? '' : 'none';
            }
            document.documentElement.style.setProperty('--elements-columns', `${columns}`);
        }
    } else if (tab === 'strangeness') {
        if (subtab.strangenessCurrent === 'Matter') {
            getId('strange1').style.display = player.strangeness[5][8] >= 1 || player.cosmon.total >= 2 ? '' : 'none';
            getId('strange1Unlocked').style.display = player.strangeness[5][8] >= 1 || player.inflation.tree[3] >= 1 ? '' : 'none';
            if (vacuum) {
                const bound = player.strangeness[5][3] >= 1;
                const voidProgress = player.challenges.void;

                getId('strange8Stage1').style.display = voidProgress[1] >= 1 ? '' : 'none';
                getId('strange9Stage1').style.display = (voidProgress[1] >= 2 || global.milestonesInfoS6.active[0]) ? '' : 'none';
                getId('strange10Stage1').style.display = voidProgress[4] >= 2 ? '' : 'none';
                getId('strange8Stage2').style.display = voidProgress[1] >= 3 ? '' : 'none';
                getId('strange9Stage2').style.display = voidProgress[2] >= 1 ? '' : 'none';
                getId('strange10Stage2').style.display = voidProgress[2] >= 2 ? '' : 'none';
                getId('strange9Stage3').style.display = voidProgress[4] >= 4 ? '' : 'none';
                getId('strange10Stage3').style.display = voidProgress[5] >= 2 ? '' : 'none';
                getId('strange9Stage4').style.display = voidProgress[4] >= 3 ? '' : 'none';
                getId('strange10Stage4').style.display = voidProgress[5] >= 1 ? '' : 'none';
                getId('strange1Stage5').style.display = bound ? '' : 'none';
                getId('strange2Stage5').style.display = bound ? '' : 'none';
                getId('strange5Stage5').style.display = bound && (voidProgress[4] >= 1 || global.milestonesInfoS6.active[1]) ? '' : 'none';
                getId('strange6Stage5').style.display = bound ? '' : 'none';
                getId('strange8Stage5').style.display = bound ? '' : 'none';
                getId('strange9Stage5').style.display = voidProgress[3] >= 5 ? '' : 'none';
            } else {
                const { milestones } = player;
                const strange5 = milestones[4][0] >= 8;
                const firstTwo = milestones[2][0] >= 7 || milestones[3][0] >= 7;

                getId('strange7Stage1').style.display = strange5 ? '' : 'none';
                getId('strange7Stage2').style.display = strange5 ? '' : 'none';
                getId('strange8Stage3').style.display = strange5 ? '' : 'none';
                getId('strange8Stage4').style.display = strange5 ? '' : 'none';
                getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}5`).style.display = strange5 ? '' : 'none';
                getId('strange1Stage5').style.display = firstTwo ? '' : 'none';
                getId('strange2Stage5').style.display = firstTwo ? '' : 'none';
                getId('strange3Stage5').style.display = milestones[5][0] >= 8 ? '' : 'none';
                getId('strange4Stage5').style.display = firstTwo ? '' : 'none';
                getId('strange5Stage5').style.display = milestones[4][1] >= 8 ? '' : 'none';
                getId('strange6Stage5').style.display = firstTwo ? '' : 'none';
            }
        } else if (subtab.strangenessCurrent === 'Milestones') {
            if (!vacuum) {
                const milestonesS4 = player.milestones[4];
                getId('milestone1Stage5Div').style.display = milestonesS4[0] >= 8 ? '' : 'none';
                getId('milestone2Stage5Div').style.display = milestonesS4[1] >= 8 ? '' : 'none';
                if (global.stageInfo.activeAll.includes(4)) { getId('milestonesStage5Progress').style.display = milestonesS4[0] >= 8 ? '' : 'none'; }
                if (global.stageInfo.activeAll.includes(5)) { getId('milestone2Stage5Progress').style.display = milestonesS4[1] >= 8 ? '' : 'none'; }
            }
        }
    } else if (tab === 'inflation') {
        if (subtab.inflationCurrent === 'Milestones') {
            const activated = global.milestonesInfoS6.active;
            for (let i = 0; i < activated.length; i++) {
                getId(`inflationMilestone${i + 1}`).classList[activated[i] ? 'add' : 'remove']('completed');
            }
        }
    } else if (tab === 'settings') {
        if (subtab.settingsCurrent === 'Settings') {
            const { researchesAuto, strangeness } = player;

            getId('exportStrangeletsUnlocked').style.display = strangeness[5][8] >= 1 || player.inflation.tree[3] >= 1 ? '' : 'none';
            getId('toggleAuto0').style.display = strangeness[5][6] >= 1 ? '' : 'none';
            getId('toggleAuto0Main').style.display = strangeness[5][6] >= 1 ? '' : 'none';
            if (!vacuum) { getId('stageAutoInterstellar').style.display = strangeness[5][6] >= 2 ? '' : 'none'; }
            getId('autoTogglesUpgrades').style.display = researchesAuto[0] >= 1 || researchesAuto[1] >= 2 ? '' : 'none';
            getId('autoToggle5').style.display = researchesAuto[0] >= 1 ? '' : 'none';
            getId('autoToggle6').style.display = researchesAuto[0] >= 2 ? '' : 'none';
            getId('autoToggle7').style.display = researchesAuto[0] >= 3 ? '' : 'none';
            getId('autoToggle8').style.display = researchesAuto[1] >= 2 ? '' : 'none';
            getId('toggleAuto1').style.display = strangeness[1][4] >= 1 || (researchesAuto[2] >= 1 && (vacuum || player.stage.current === 1)) ? '' : 'none';
            const showAuto2 = strangeness[2][4] >= 1 || (vacuum ? researchesAuto[2] >= 3 : (researchesAuto[2] >= 1 && player.stage.current === 2));
            getId('toggleAuto2').style.display = showAuto2 ? '' : 'none';
            getId('toggleAuto2Main').style.display = showAuto2 ? '' : 'none';
            getId('toggleAuto3').style.display = strangeness[3][4] >= 1 || (vacuum ? researchesAuto[2] >= 2 : (researchesAuto[2] >= 1 && player.stage.current === 3)) ? '' : 'none';
            const showAuto4 = strangeness[4][4] >= 1 || (vacuum ? researchesAuto[2] >= 4 : (researchesAuto[2] >= 1 && player.stage.current >= 4));
            getId('toggleAuto4').style.display = showAuto4 ? '' : 'none';
            getId('toggleAuto4Main').style.display = showAuto4 ? '' : 'none';
            if (highest < 7) {
                const hotkeyTest = getId('stageHotkey', true);
                if (highest < 2) {
                    getId('resetToggles').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                    if (hotkeyTest !== null) {
                        hotkeyTest.style.display = player.upgrades[1][9] === 1 ? '' : 'none';
                        getId('dischargeHotkey').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                    }
                }
                if (highest < 3) {
                    getId('vaporizationToggleReset').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                    if (hotkeyTest !== null) { getId('vaporizationHotkey').style.display = player.upgrades[2][2] === 1 ? '' : 'none'; }
                }
                if (highest < 5) {
                    getId('collapseToggleReset').style.display = player.upgrades[4][0] === 1 ? '' : 'none';
                    getId('elementsAsTab').style.display = player.upgrades[4][1] === 1 ? '' : 'none';
                    if (hotkeyTest !== null) { getId('collapseHotkey').style.display = player.upgrades[4][0] === 1 ? '' : 'none'; }
                }
                if (highest < 6) {
                    getId('saveFileNameGalaxy').style.display = player.milestones[4][1] >= 8 ? '' : 'none';
                    if (hotkeyTest !== null) { getId('galaxyHotkey').style.display = player.milestones[4][1] >= 8 ? '' : 'none'; }
                }
                getId('stageToggleReset').style.display = player.stage.resets >= 1 || (vacuum ? player.elements[26] >= 1 : player.upgrades[1][9] === 1) ? '' : 'none';
                getId('vaporizationExtra').style.display = player.challenges.void[4] >= 1 ? '' : 'none';
                getId('exportReward').style.display = player.strange[0].total > 0 ? '' : 'none';
                getId('mergeToggleReset').style.display = vacuum && player.upgrades[5][3] === 1 ? '' : 'none';
                if (hotkeyTest !== null) { getId('mergeHotkey').style.display = player.upgrades[5][3] === 1 ? '' : 'none'; }
            }
        } else if (subtab.settingsCurrent === 'History') {
            updateStageHistory();
            updateVacuumHistory();
        } else if (subtab.settingsCurrent === 'Stats') {
            const { strangeness } = player;
            const buildings = player.buildings[active];

            getId('firstPlay').textContent = new Date(player.time.started).toLocaleString();
            getId('exportStatsStrangeletsUnlocked').style.display = strangeness[5][8] >= 1 || player.cosmon.total >= 2 ? '' : 'none';
            if (highest < 7) {
                getId('stageResets').style.display = player.stage.resets >= 1 ? '' : 'none';
                getId('exportStats').style.display = player.strange[0].total > 0 ? '' : 'none';
            }
            for (let i = 1; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}Stats`).style.display = buildings[i].trueTotal.moreThan('0') ? '' : 'none';
            }
            getId('strangeAllStats').style.display = player.strange[0].total > 0 ? '' : 'none';
            getId('strange1Stats').style.display = player.strange[1].total > 0 ? '' : 'none';

            getId('maxSolarMassStat').style.display = active === 4 || active === 5 ? '' : 'none';
            if (active === 1) {
                getId('dischargeStat').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('dischargeStatTrue').style.display = player.discharge.current !== global.dischargeInfo.total ? '' : 'none';
                for (let s = 1; s <= (vacuum ? 5 : 1); s++) {
                    let anyUnlocked = false;
                    for (let i = 1; i < global.buildingsInfo.maxActive[s]; i++) {
                        const unlocked = player.buildings[s][i].trueTotal.moreThan('0');
                        if (!anyUnlocked) { anyUnlocked = unlocked; }
                        getId(`energyGainStage${s}Build${i + (vacuum ? 0 : 2)}Name`).style.display = unlocked ? '' : 'none';
                        getId(`energyGainStage${s}Build${i + (vacuum ? 0 : 2)}`).style.display = unlocked ? '' : 'none';
                    }
                    getId(s === 1 ? 'energyGainStats' : `energyGainStage${s}`).style.display = anyUnlocked ? '' : 'none';
                }
                if (highest < 2) { getId('maxEnergyStat').style.display = player.discharge.energyMax >= 12 ? '' : 'none'; }
            } else if (active === 2) {
                getId('vaporizationBoost').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('rainStat').style.display = player.researchesExtra[2][1] >= 1 ? '' : 'none';
                getId('stormStat').style.display = player.researchesExtra[2][2] >= 1 ? '' : 'none';
                getId('maxCloudStat').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
            } else if (active === 3) {
                if (vacuum) {
                    getId('rankStat0').style.display = strangeness[2][9] >= 1 ? '' : 'none';
                }
                for (let i = 1; i < global.accretionInfo.rankImage.length; i++) { getId(`rankStat${i}`).style.display = player.accretion.rank >= i ? '' : 'none'; }
            } else if (active === 4) {
                const auto2 = strangeness[4][4] >= 2;
                getId('star1Stat').style.display = !auto2 && buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('star2Stat').style.display = !auto2 && buildings[3].trueTotal.moreThan('0') ? '' : 'none';
                getId('star3Stat').style.display = !auto2 && buildings[4].trueTotal.moreThan('0') ? '' : 'none';
                getId('gammaRayStat').style.display = player.elements[26] >= 1 || player.researches[4][4] >= 1 ? '' : 'none';
                getId('quasarStat').style.display = player.researchesExtra[5][0] >= 1 ? '' : 'none';
            }
        }
    }
};
export const visualTrueStageUnlocks = () => {
    const highest = player.stage.true;
    const hotkeyTest = getId('stageHotkey', true);

    if (!player.inflation.vacuum) { getId('mergeResetText').innerHTML = `Attempt to <span class="darkvioletText">Merge</span> <span class="grayText">Galaxies</span> together${highest >= 7 ? ', which will result in <span class="orchidText">Vacuum</span> decaying into its true state' : ' to create even bigger Structures. Might have severe consequences'}.`; }
    getId('stageRewardOld').style.display = highest < 5 ? '' : 'none';
    getId('stageRewardNew').style.display = highest >= 5 ? '' : 'none';
    getId('autoWaitMain').style.display = highest >= 3 ? '' : 'none';
    getId('autoChallengeLeave').style.display = highest >= 7 ? '' : 'none';
    getId('researchAuto3').style.display = highest >= 7 ? '' : 'none';
    getId(globalSave.MDSettings[0] ? 'toggleHover0' : 'researchToggles').style.display = highest >= 2 ? '' : 'none';
    getId('toggleMax0').style.display = highest >= 4 ? '' : 'none';
    getId('strangeletsGlobalSpeedInfo').style.display = highest >= 7 ? '' : 'none';
    getId('themeArea').style.display = highest >= 2 ? '' : 'none';
    getId('switchTheme3').style.display = highest >= 3 ? '' : 'none';
    getId('switchTheme4').style.display = highest >= 4 ? '' : 'none';
    getId('switchTheme5').style.display = highest >= 5 ? '' : 'none';
    getId('switchTheme6').style.display = highest >= 7 ? '' : 'none';
    getId('saveFileNameStrange').style.display = highest >= 5 ? '' : 'none';
    getId('saveFileNameVacuum').style.display = highest >= 6 ? '' : 'none';
    getId('saveFileNameUniverse').style.display = highest >= 7 ? '' : 'none';
    getId('saveFileNameCosmon').style.display = highest >= 7 ? '' : 'none';
    getId('autoStageSwitch').style.display = highest >= 5 ? '' : 'none';
    getId('cosmonStat').style.display = highest >= 7 ? '' : 'none';
    getId('vacuumHistory').style.display = highest >= 7 ? '' : 'none';
    if (hotkeyTest !== null) {
        getId('stageRightHotkey').style.display = highest >= 5 ? '' : 'none';
        getId('stageLeftHotkey').style.display = highest >= 5 ? '' : 'none';
    }
    if (highest >= 2) {
        getId('toggleBuilding0').style.display = '';
        getId('resetToggles').style.display = '';
        getId('maxEnergyStat').style.display = '';
        getId('upgradeTabBtn').style.display = '';
        if (hotkeyTest !== null) { hotkeyTest.style.display = ''; }
    }
    if (highest >= 5) {
        getId('elementsAsTab').style.display = '';
    }
    if (highest >= 6) {
        getId('dischargeToggleReset').style.display = '';
        getId('saveFileNameGalaxy').style.display = '';
        for (let s = 2; s <= 5; s++) {
            getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}${s}`).style.display = '';
            getId(`milestone1Stage${s}Div`).style.display = '';
            getId(`milestone2Stage${s}Div`).style.display = '';
        }
    }
    if (highest >= 7) {
        getId('resets').style.display = '';
        getId('resetStage').style.display = '';
        getId('researches').style.display = '';
        getId('vaporizationExtra').style.display = '';
        getId('stageToggleReset').style.display = '';
        getId('vaporizationToggleReset').style.display = '';
        getId('rankToggleReset').style.display = '';
        getId('collapseToggleReset').style.display = '';
        getId('mergeToggleReset').style.display = player.inflation.vacuum ? '' : 'none';
        getId('strangenessTabBtn').style.display = '';
        getId('stageResets').style.display = '';
        getId('exportReward').style.display = '';
        getId('exportStats').style.display = '';
    }
};

export const getUpgradeDescription = (index: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements' | 'inflation') => {
    if (type === 'inflation') {
        const pointer = global.inflationTreeInfo;

        getId('inflationText').textContent = `${pointer.name[index]}. (Level ${format(player.inflation.tree[index])} out of ${format(pointer.max[index])})`;
        getId('inflationEffect').textContent = pointer.effectText[index]();
        getId('inflationCost').textContent = player.inflation.tree[index] >= pointer.max[index] ? 'Fully activated.' : `${format(pointer.cost[index])} Cosmon.`;
        return;
    }
    if (type === 'elements') {
        const pointer = global.elementsInfo;

        getId('elementText').textContent = `${pointer.name[index]}.`;
        getId('elementEffect').textContent = player.elements[index] >= 1 || (player.collapse.show >= index && index !== 0) ? pointer.effectText[index]() : 'Effect is not yet known.';
        getId('elementCost').textContent = player.elements[index] >= 1 ? 'Obtained.' :
            player.elements[index] > 0 ? 'Awaiting Collapse.' :
            index === 0 ? 'Unknown.' : `${format(pointer.startCost[index])} Elements.`;
        return;
    }

    const stageIndex = player.stage.active;
    const costName = stageIndex === 1 ? 'Energy' : stageIndex === 2 ? 'Drops' : stageIndex === 3 ? 'Mass' : stageIndex === 6 ? 'Dark matter' : 'Elements';
    if (type === 'upgrades') {
        const pointer = global[`${type}Info`][stageIndex];

        getId('upgradeText').textContent = `${pointer.name[index]}.`;
        getId('upgradeEffect').textContent = pointer.effectText[index]();
        getId('upgradeCost').textContent = player.upgrades[stageIndex][index] === 1 ? 'Created.' :
            stageIndex === 4 && global.collapseInfo.unlockU[index] > player.collapse.mass && player.researchesExtra[5][0] < 1 ? `Unlocked at ${format(global.collapseInfo.unlockU[index])} Mass.` :
            `${format(pointer.startCost[index])} ${costName}.`;
    } else if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];
        const level = player[type][stageIndex][index];
        if (type === 'researchesExtra' && stageIndex === 4 && index === 0) { pointer.name[0] = ['Nova', 'Supernova', 'Hypernova'][Math.min(level, 2)]; }

        getId('upgradeText').textContent = `${pointer.name[index]}.`;
        getId('upgradeEffect').textContent = pointer.effectText[index]();
        if (level >= pointer.max[index]) {
            getId('upgradeCost').textContent = 'Maxed.';
        } else if (stageIndex === 4 && type === 'researches' && global.collapseInfo.unlockR[index] > player.collapse.mass && player.researchesExtra[5][0] < 1) {
            getId('upgradeCost').textContent = `Unlocked at ${format(global.collapseInfo.unlockR[index])} Mass.`;
        } else {
            let newLevels = 1;
            let cost = pointer.cost[index];
            if (player.toggles.max[0] && player.stage.true >= 4 && pointer.max[index] > 1) {
                const scaling = pointer.scaling[index];
                if (stageIndex === 1) {
                    if (player.accretion.rank >= 6 && player.strangeness[1][9] >= 1) {
                        newLevels = Math.min(Math.max(Math.floor((player.discharge.energy - cost) / scaling + 1), 1), pointer.max[index] - level);
                        if (newLevels > 1) { cost += (newLevels - 1) * scaling; }
                    } else {
                        const simplify = cost - scaling / 2;
                        newLevels = Math.min(Math.max(Math.floor(((simplify ** 2 + 2 * scaling * player.discharge.energy) ** 0.5 - simplify) / scaling), 1), pointer.max[index] - level);
                        if (newLevels > 1) { cost = newLevels * (newLevels * scaling / 2 + simplify); }
                    }
                } else {
                    const currency = stageIndex === 2 ? player.buildings[2][1].current : stageIndex === 3 ? player.buildings[3][0].current : player.buildings[4][0].current;
                    newLevels = Math.min(Math.max(Math.floor(new Overlimit(currency).multiply(scaling - 1).divide(cost).plus('1').log(scaling).toNumber()), 1), pointer.max[index] - level);
                    if (newLevels > 1) { cost = new Overlimit(scaling).power(newLevels).minus('1').divide(scaling - 1).multiply(cost).toNumber(); }
                }
            }

            getId('upgradeCost').textContent = `${format(cost)} ${costName}.${newLevels > 1 ? ` [x${format(newLevels)}]` : ''}`;
        }
    } else if (type === 'researchesAuto') {
        const pointer = global.researchesAutoInfo;
        let level = player.researchesAuto[index];

        getId('upgradeText').textContent = `${pointer.name[index]}.`;
        getId('upgradeEffect').textContent = pointer.effectText[index]();
        if (level >= pointer.max[index]) {
            getId('upgradeCost').textContent = 'Maxed.';
        } else {
            const autoStage = pointer.autoStage[index][level];
            if (index === 1 && player.strangeness[4][6] >= 1) { level = Math.max(level - 1, 0); }
            getId('upgradeCost').textContent = !(autoStage === stageIndex || (stageIndex === 5 && autoStage === 4)) ? `This level can only be created while inside '${global.stageInfo.word[autoStage]}'.` :
                `${format(pointer.costRange[index][level])} ${costName}.`;
        }
    } else if (type === 'ASR') {
        const pointer = global.ASRInfo;
        const level = player.ASR[stageIndex];

        getId('upgradeText').textContent = `${pointer.name}.`;
        getId('upgradeEffect').textContent = pointer.effectText();
        getId('upgradeCost').textContent = level >= pointer.max[stageIndex] ? 'Maxed.' :
            stageIndex === 1 && player.upgrades[1][5] !== 1 ? "Cannot be created without 'Superposition' Upgrade" :
            stageIndex === 3 && player.accretion.rank < 1 ? "Cannot be created at 'Ocean world' Rank." :
            `${format(pointer.costRange[stageIndex][level])} ${costName}.`;
    }
};

export const getStrangenessDescription = (index: number, stageIndex: number, type: 'strangeness' | 'milestones') => {
    const stageText = getId(`${type}Stage`);
    stageText.style.color = `var(--${global.stageInfo.textColor[stageIndex]}-text)`;
    stageText.textContent = `${global.stageInfo.word[stageIndex]}. `;
    if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        getId('strangenessText').textContent = `${pointer.name[index]}.`;
        getId('strangenessEffect').textContent = pointer.effectText[index]();
        getId('strangenessCost').textContent = player.strangeness[stageIndex][index] >= pointer.max[index] ? 'Maxed.' : `${format(pointer.cost[index])} Strange quarks.`;
    } else {
        const pointer = global.milestonesInfo[stageIndex];
        const level = player.milestones[stageIndex][index];
        const multilineID = getId('milestonesMultiline');
        let text;

        getId('milestonesText').textContent = `${pointer.name[index]}. (${format(level)})`;
        if (level < pointer.max[index]) {
            const isActive = global.stageInfo.activeAll.includes(Math.min(stageIndex, 4));
            text = `<p class="orchidText">Requirement: <span class="greenText">${pointer.needText[index]()}</span></p>
            <p class="blueText">Time limit: <span class="greenText">${format(pointer.time[index] / (player.inflation.tree[0] >= 1 ? 4 : 1) - (isActive && player.inflation.tree[4] < 1 ? player.time.stage : 0), { type: 'time' })} ${isActive ? 'remains ' : ''}to complete this tier within ${isActive ? 'current' : global.stageInfo.word[index === 0 && stageIndex === 5 ? 4 : stageIndex]} Stage.</span></p>
            <p class="darkvioletText">Unlock: <span class="greenText">Main reward unlocked after ${pointer.max[index] - level} more completions.</span></p>`;
        } else { text = `<p class="darkvioletText">Reward: <span class="greenText">${pointer.rewardText[index]()}</span></p>`; }

        if (multilineID.innerHTML !== text) { multilineID.innerHTML = text; }
        const container = multilineID.parentElement as HTMLElement;
        container.style.minHeight = `${container.offsetHeight}px`;
    }
};

export const getChallengeDescription = (index: number | null) => {
    let text;
    if (index === null) {
        text = '<p class="whiteText">Hover to see</p>';
    } else {
        const isActive = player.challenges.active === index;
        const info = global.challengesInfo;
        const color = `${info.color[index]}Text`;
        text = `<h3 class="${color} bigWord">${info.name[index]}${isActive ? ', <span class="greenText">active</span>' : ''}</h3>
        <p class="whiteText">${info.description[index]()}</p>
        <div><h4 class="${color} bigWord">Effect:</h4>
        <p>${info.effectText[index]()}</p>
        <p class="blueText">${isActive ? 'Remaining time' : 'Time limit'} is <span${isActive ? ' id="challengeTime"' : ''} class="cyanText">${format(getChallengeTimeLimit(/*index*/) - (isActive ? player.time.stage : 0), { type: 'time' })}</span></p></div>`;
        specialHTML.cache.idMap.delete('challengeTime');
    }

    if (index === 0) {
        const progress = player.challenges.voidCheck;

        getId('voidRewards').style.display = '';
        getId('voidRewardSubmerged').style.display = progress[1] >= 3 ? '' : 'none';
        getId('voidRewardAccretion').style.display = progress[1] >= 2 ? '' : 'none';
        getId('voidRewardInterstellar').style.display = progress[3] >= 5 ? '' : 'none';
        getId('voidRewardIntergalactic').style.display = progress[4] >= 4 ? '' : 'none';
    } else { getId('voidRewards').style.display = 'none'; }

    getId('challengeMultiline').innerHTML = text;
};

export const getChallengeReward = (index: number) => {
    const need = global.challengesInfo.needText[0][index];
    const best = player.challenges.voidCheck[index];
    let text = '';
    for (let i = 0; i < need.length; i++) {
        const unlocked = player.challenges.void[index] > i;
        text += `<div><p><span class="${unlocked ? 'greenText' : 'redText'}">→</span> ${need[i]()}${!unlocked && ((!(best > i && player.inflation.tree[4] >= 1) && player.time.stage > getChallengeTimeLimit(/*0*/))) && player.challenges.active === 0 ? ' <span class="redText">(Failed)</span>' : ''}</p>
        <p><span class="${unlocked ? 'greenText' : 'redText'}">Reward:</span> ${best > i ? `${global.challengesInfo.rewardText[0][index][i]}${!unlocked && globalSave.SRSettings[0] ? ' (not unlocked)' : ''}` : 'Not yet unlocked'}</p></div>`;
    }

    getId('voidRewardsDivText').innerHTML = text;
};

export const visualUpdateUpgrades = (index: number, stageIndex: number, type: 'upgrades' | 'elements') => {
    if (type === 'upgrades') {
        if (stageIndex !== player.stage.active) { return; }

        let color = '';
        const image = getId(`upgrade${index + 1}`);
        if (player.upgrades[stageIndex][index] === 1) {
            if (stageIndex === 1) {
                color = 'green';
            } else if (stageIndex === 2) {
                color = 'darkgreen';
            } else if (stageIndex === 3) {
                color = '#0000b1'; //Darker blue
            } else if (stageIndex === 4) {
                color = '#1f1f8f'; //Brigher midnightblue
            } else if (stageIndex === 5) {
                color = '#990000'; //Brigher maroon
            } else if (stageIndex === 6) {
                color = 'white'; //Placeholder
            }
            image.tabIndex = globalSave.SRSettings[0] && globalSave.SRSettings[1] ? 0 : -1;
        } else { image.tabIndex = 0; }
        image.style.backgroundColor = color;
    } else if (type === 'elements') {
        const image = getId(`element${index}`);
        if (player.elements[index] >= 1) {
            image.classList.remove('awaiting');
            image.classList.add('created');
            image.tabIndex = globalSave.SRSettings[0] && globalSave.SRSettings[1] ? 0 : -1;
        } else if (player.elements[index] > 0) {
            image.classList.add('awaiting');
            image.classList.remove('created');
            image.tabIndex = 0;
        } else {
            image.classList.remove('awaiting');
            image.classList.remove('created');
            image.tabIndex = 0;
        }
    }
};

export const visualUpdateResearches = (index: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'strangeness') => {
    let max: number;
    let level: number;
    let upgradeHTML: HTMLElement;
    let image: HTMLElement;
    if (type === 'researches' || type === 'researchesExtra') {
        if (stageIndex !== player.stage.active) { return; }
        max = global[`${type}Info`][stageIndex].max[index];
        level = player[type][stageIndex][index];

        const extra = type === 'researches' ? '' : 'Extra';
        upgradeHTML = getId(`research${extra}${index + 1}Level`);
        getId(`research${extra}${index + 1}Max`).textContent = `${max}`;
        image = getId(`research${extra}${index + 1}Image`);
    } else if (type === 'researchesAuto') {
        max = global.researchesAutoInfo.max[index];
        level = player.researchesAuto[index];

        upgradeHTML = getId(`researchAuto${index + 1}Level`);
        getId(`researchAuto${index + 1}Max`).textContent = `${max}`;
        image = getId(`researchAuto${index + 1}Image`);
    } else if (type === 'ASR') {
        if (stageIndex !== player.stage.active) { return; }
        max = global.ASRInfo.max[stageIndex];
        level = player.ASR[stageIndex];

        upgradeHTML = getId('ASRLevel');
        getId('ASRMax').textContent = `${max}`;
        image = getId('ASRImage');
    } else /*if (type === 'strangeness')*/ {
        max = global.strangenessInfo[stageIndex].max[index];
        level = player.strangeness[stageIndex][index];

        upgradeHTML = getId(`strange${index + 1}Stage${stageIndex}Level`);
        getId(`strange${index + 1}Stage${stageIndex}Max`).textContent = `${max}`;
        image = getId(`strange${index + 1}Stage${stageIndex}Image`);
    }

    upgradeHTML.textContent = `${level}`;
    if (level >= max) {
        upgradeHTML.style.color = 'var(--green-text)';
        image.tabIndex = globalSave.SRSettings[0] && globalSave.SRSettings[1] ? 0 : -1;
    } else if (level === 0) {
        upgradeHTML.style.color = ''; //Red
        image.tabIndex = 0;
    } else {
        upgradeHTML.style.color = 'var(--orchid-text)';
        image.tabIndex = 0;
    }
};

/* If check is number, then it will sort only if that Research is maxed */
export const visualUpdateInflation = (check = null as number | null) => {
    const { max, startCost } = global.inflationTreeInfo;
    const tree = player.inflation.tree;
    if (check !== null && tree[check] < max[check]) { return; }
    const total = player.cosmon.total;
    const keepIndex = globalSave.SRSettings[0] && globalSave.SRSettings[1];
    for (let i = 0; i < startCost.length; i++) {
        const image = getId(`inflation${i + 1}`);
        image.style.display = total >= startCost[i] ? '' : 'none';
        if (tree[i] >= max[i]) {
            getId('inflationCreated').append(image);
            image.tabIndex = keepIndex ? 0 : -1;
        } else {
            getId('inflationAvailable').append(image);
            image.tabIndex = 0;
        }
    }
};

const updateRankInfo = () => {
    const rank = player.accretion.rank;
    if (global.debug.rankUpdated === rank) { return; }
    const rankInfo = global.accretionInfo;
    const name = getId('rankName');

    getId('reset1Button').textContent = rank >= rankInfo.maxRank ? 'Max Rank achieved' : `Next Rank is ${format(rankInfo.rankCost[rank])} Mass`;
    (getId('rankImage') as HTMLImageElement).src = `Used_art/${rankInfo.rankImage[rank]}`;
    name.textContent = rankInfo.rankName[rank];
    name.style.color = `var(--${rankInfo.rankColor[rank]}-text)`;
    global.debug.rankUpdated = rank;
};

export const setRemnants = () => {
    if (player.stage.active === 4) {
        const whiteDwarf = player.researchesExtra[4][2] >= 1;
        getId('special1').title = whiteDwarf ? 'White dwarfs (Red giants)' : 'Red giants';
        (getQuery('#special1 > img') as HTMLImageElement).src = `Used_art/${whiteDwarf ? 'White%20dwarf' : 'Red%20giant'}.png`;
        getId('special1Cur').className = whiteDwarf ? 'cyanText' : 'redText';

        const quarkStar = player.researchesExtra[4][3] >= 1;
        getId('special2').title = quarkStar ? 'Quark stars (Neutron stars)' : 'Neutron stars';
        const text2 = `Boost${quarkStar ? ' and cost decrease' : ''} to all Stars`;
        getQuery('#star2Effect > span:last-of-type').textContent = globalSave.SRSettings[0] ? ` (${text2})` : text2;
        if (globalSave.SRSettings[0]) { getId('specials').ariaLabel = 'Stars remnants'; }
    } else if (player.stage.active === 5) {
        getId('special1').title = 'Galaxy groups';
        (getQuery('#special1 > img') as HTMLImageElement).src = 'Used_art/Galaxy%20group.png';
        getId('special1Cur').className = 'grayText';
        if (globalSave.SRSettings[0]) { getId('specials').ariaLabel = 'Merge rewards'; }
    }
};

const updateStageHistory = () => {
    if (global.debug.historyStage === player.stage.resets) { return; }
    const list = global.historyStorage.stage;
    const length = Math.min(list.length, player.history.stage.input[1]);

    let text = '';
    if (length > 0) {
        for (let i = 0; i < length; i++) {
            text += `<li class="whiteText"><span class="greenText">${format(list[i][1], { padding: true })} Strange quarks</span>${list[i][2] > 0 ? `, <span class="greenText">${format(list[i][2], { padding: true })} Strangelets</span>` : ''}, <span class="blueText">${format(list[i][0], { type: 'time' })}</span>, <span class="darkorchidText">${format(list[i][1] / list[i][0], { type: 'income' })}</span></li>`;
        }
    } else { text = '<li class="redText">Reference list is empty</li>'; }
    getId('stageHistoryList').innerHTML = text;

    const best = player.history.stage.best;
    getId('stageHistoryBest').innerHTML = `<span class="greenText">${format(best[1], { padding: true })} Strange quarks</span>${best[2] > 0 ? `, <span class="greenText">${format(best[2], { padding: true })} Strangelets</span>` : ''}, <span class="blueText">${format(best[0], { type: 'time' })}</span>, <span class="darkorchidText">${format(global.strangeInfo.bestHistoryRate, { type: 'income' })}</span>`;
    global.debug.historyStage = player.stage.resets;
};
const updateVacuumHistory = () => {
    if (global.debug.historyVacuum === player.inflation.resets) { return; }
    const list = global.historyStorage.vacuum;
    const length = Math.min(list.length, player.history.vacuum.input[1]);

    let text = '';
    if (length > 0) {
        for (let i = 0; i < length; i++) {
            text += `<li class="whiteText"><span class="darkvioletText">${format(list[i][2], { padding: true })} Cosmon</span>, <span class="blueText">${format(list[i][0], { type: 'time' })}</span>, <span class="darkorchidText">${format(list[i][2] / list[i][0], { type: 'income' })}</span>, <span class="${list[i][1] ? 'greenText">true' : 'redText">false'} Vacuum</span></li>`;
        }
    } else { text = '<li class="redText">Reference list is empty</li>'; }
    getId('vacuumHistoryList').innerHTML = text;

    const best = player.history.vacuum.best;
    getId('vacuumHistoryBest').innerHTML = `<span class="darkvioletText">${format(best[2], { padding: true })} Cosmon</span>, <span class="blueText">${format(best[0], { type: 'time' })}</span>, <span class="darkorchidText">${format(best[2] / best[0], { type: 'income' })}</span>, <span class="${best[1] ? 'greenText">true' : 'redText">false'} Vacuum</span>`;
    global.debug.historyVacuum = player.inflation.resets;
};

/** @param padding 'exponent' value will behave as true, but only after number turns into its shorter version */
export const format = (input: number | Overlimit, settings = {} as { type?: 'number' | 'input' | 'time' | 'income', padding?: boolean | 'exponent' }): string => {
    if (typeof input === 'object') { return input?.format(settings as any); }
    const type = settings.type ?? 'number';
    let padding = settings.padding;

    let extra;
    if (type === 'income') {
        const inputAbs = Math.abs(input);
        if (inputAbs >= 1) {
            extra = 'per second';
        } else if (inputAbs >= 1 / 60) {
            input *= 60;
            extra = 'per minute';
        } else if (inputAbs >= 1 / 3600) {
            input *= 3600;
            extra = 'per hour';
        } else if (inputAbs >= 1 / 86400) {
            input *= 86400;
            extra = 'per day';
        } else if (inputAbs >= 1 / 31556952) {
            input *= 31556952;
            extra = 'per year';
        } else if (inputAbs >= 1 / 3.1556952e10) {
            input *= 3.1556952e10;
            extra = 'per millennium';
        } else if (inputAbs >= 1 / 3.1556952e13) {
            input *= 3.1556952e13;
            extra = 'per megaannum';
        } else {
            input *= 3.1556952e16;
            extra = 'per eon';
        }

        if (padding === undefined) { padding = true; }
    } else if (type === 'time') {
        const inputAbs = Math.abs(input);
        if (inputAbs < 60) {
            extra = 'seconds';
        } else if (inputAbs < 3600) {
            const minutes = Math.trunc(input / 60);
            const seconds = Math.trunc(input - minutes * 60);
            if (padding === false && seconds === 0) { return `${minutes} minutes`; }
            return `${minutes} minutes ${seconds} seconds`;
        } else if (inputAbs < 86400) {
            const hours = Math.trunc(input / 3600);
            const minutes = Math.trunc(input / 60 - hours * 60);
            if (padding === false && minutes === 0) { return `${hours} hours`; }
            return `${hours} hours ${minutes} minutes`;
        } else if (inputAbs < 31556952) {
            const days = Math.trunc(input / 86400);
            const hours = Math.trunc(input / 3600 - days * 24);
            if (padding === false && hours === 0) { return `${days} days`; }
            return `${days} days ${hours} hours`;
        } else if (inputAbs < 3.1556952e10) {
            const years = Math.trunc(input / 31556952);
            const days = Math.trunc(input / 86400 - years * 365.2425);
            if (padding === false && days === 0) { return `${years} years`; }
            return `${years} years ${days} days`;
        } else if (inputAbs < 3.1556952e13) {
            input /= 3.1556952e10;
            extra = 'millenniums';
        } else if (inputAbs < 3.1556952e16) {
            input /= 3.1556952e13;
            extra = 'megaannums';
        } else {
            input /= 3.1556952e16;
            extra = 'eons';
        }

        padding = !(padding === false && Math.trunc(input) === input);
    }
    if (!isFinite(input)) { return extra !== undefined ? `${input} ${extra}` : `${input}`; }

    const inputAbs = Math.abs(input);
    if (inputAbs >= 1e6 || (inputAbs < 1e-3 && inputAbs > 0)) {
        let digits = Math.floor(Math.log10(inputAbs));
        let result = Math.round(input / 10 ** (digits - 2)) / 100;
        if (Math.abs(result) === 10) {
            result /= 10;
            digits++;
        }

        if (padding === 'exponent') { padding = true; }
        let formated = padding ? result.toFixed(2) : `${result}`;
        if (type === 'input') { return `${formated}e${digits}`; }
        formated = `${formated.replace('.', globalSave.format[0])}e${digits}`;
        return extra !== undefined ? `${formated} ${extra}` : formated;
    }

    const precision = Math.max(4 - Math.floor(Math.log10(Math.max(inputAbs, 1))), 0);
    const result = Math.round(input * 10 ** precision) / 10 ** precision;

    if (padding === 'exponent') { padding = false; }
    let formated = padding ? result.toFixed(precision) : `${result}`;
    if (type === 'input') { return formated; }
    formated = formated.replace('.', globalSave.format[0]);
    if (result >= 1e3) { formated = formated.replace(/\B(?=(\d{3})+(?!\d))/, globalSave.format[1]); }
    return extra !== undefined ? `${formated} ${extra}` : formated;
};

/** Default value for extra is 'normal'. Use 'soft' when Stage remained same and 'reload' after full reset
 * @param offline used to return early if game is paused due to calculating offline, requires another call after calculations are done
 */
export const stageUpdate = (extra = 'normal' as 'normal' | 'soft' | 'reload', offline = false) => {
    const { stageInfo, buildingsInfo } = global;
    const { active, current, true: highest } = player.stage;
    const vacuum = player.inflation.vacuum;
    const challenge = player.challenges.active;

    stageInfo.activeAll = [];
    const activeAll = stageInfo.activeAll;
    if (vacuum) {
        activeAll.push(1);
        if (player.researchesExtra[1][2] >= 2) { activeAll.push(2); }
        if (current >= 2) { activeAll.push(3); } //player.researchesExtra[1][2] >= 1
        if (current >= 4) { activeAll.push(4); } //player.accretion.rank >= 6
        if (current >= 5 && player.strangeness[5][3] >= 1) { activeAll.push(5); } //player.elements[26] >= 1
    } else {
        if (current === 1 || player.milestones[1][1] >= 6) { stageInfo.activeAll.push(1); }
        if (current === 2 || player.milestones[2][1] >= 7) { stageInfo.activeAll.push(2); }
        if (current === 3 || player.milestones[3][1] >= 7) { stageInfo.activeAll.push(3); }
        if (current >= 4) { activeAll.push(4); }
        if (current >= 5) { activeAll.push(5); } //player.elements[26] >= 1
    }
    if (highest >= 7 || player.events[1]) { activeAll.push(6); }
    if (offline && global.paused) {
        const offlineExtra = global.debug.offlineUpdate;
        if (offlineExtra === false || offlineExtra === 'soft' ||
            (offlineExtra === 'normal' && extra === 'reload')) { global.debug.offlineUpdate = extra; }
        return;
    }

    for (let s = 1; s <= 6; s++) {
        for (const element of getClass(`stage${s}Only`)) { element.style.display = active === s ? '' : 'none'; }
        for (const element of getClass(`stage${s}Include`)) { element.style.display = activeAll.includes(s) ? '' : 'none'; }
    }

    const stageWord = getId('stageWord');
    stageWord.textContent = stageInfo.word[current];
    stageWord.style.color = `var(--${stageInfo.textColor[current]}-text)`;
    if (vacuum || active >= 4) { getId('stageReset').textContent = vacuum || (player.events[0] && highest >= 5) ? (current >= 5 ? 'Requirements are met' : "Requires '[26] Iron' Element") : 'Requirements are unknown'; }

    getId('stageSelect').style.display = activeAll.length > 1 ? '' : 'none';
    if (highest < 7) {
        const showAll = vacuum && player.stage.resets >= 1;
        if (highest < 6) { getId('dischargeToggleReset').style.display = activeAll.includes(1) ? '' : 'none'; }
        getId('vaporizationToggleReset').style.display = showAll || activeAll.includes(2) ? '' : 'none';
        getId('rankToggleReset').style.display = showAll || activeAll.includes(3) ? '' : 'none';
        getId('collapseToggleReset').style.display = showAll || activeAll.includes(4) ? '' : 'none';
        getId('strangenessTabBtn').style.display = player.strange[0].total > 0 || (vacuum && current >= 5) ? '' : 'none';
        getId('inflationTabBtn').style.display = 'none';
        if (extra !== 'soft') {
            getId('resets').style.display = '';
            getId('researches').style.display = '';
        }
    }
    if (!vacuum) {
        const interstellar = (active >= 6 ? current : active) >= 4;
        getId('strangeletsEffect1Allowed').style.display = interstellar ? '' : 'none';
        getId('strangeletsEffect1Disabled').style.display = !interstellar ? '' : 'none';
        if (active >= 6) { getId('stageReset').textContent = 'No Stage resets available'; }
        if (highest < 6) {
            for (let s = 2; s <= 4; s++) {
                const unlocked = player.stage.resets >= s + 3;
                getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}${s}`).style.display = unlocked ? '' : 'none';
                getId(`milestone1Stage${s}Div`).style.display = unlocked ? '' : 'none';
                getId(`milestone2Stage${s}Div`).style.display = unlocked ? '' : 'none';
            }
        }
    }

    if (extra === 'soft') {
        visualUpdate();
        numbersUpdate();
        return;
    }
    if (globalSave.MDSettings[0]) {
        getId('reset1Footer').textContent = specialHTML.resetHTML[active];
        if (extra === 'reload') { MDStrangenessPage(1); }
    }
    if (globalSave.SRSettings[0]) {
        SRHotkeysInfo(true);
        for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
            getId(`building${i}`).ariaLabel = `${buildingsInfo.name[active][i]}, hotkeys are ${i} and Shift ${i})`;
        }
        getId('extraResearches').ariaLabel = `${['Energy', 'Cloud', 'Rank', 'Collapse', 'Galaxy', ''][active - 1]} Researches`;
        getId('SRStage').textContent = `Current active Stage is '${stageInfo.word[active]}'`;
    }

    for (const text of ['upgrade', 'element']) {
        getId(`${text}Text`).textContent = 'Hover to see.';
        getId(`${text}Effect`).textContent = 'Hover to see.';
        getId(`${text}Cost`).textContent = 'Resource.';
    }
    if (extra === 'reload') {
        global.trueActive = active;
        global.debug.timeLimit = false;

        for (let s = 1; s <= 6; s++) {
            getId(`${stageInfo.word[s]}Switch`).style.textDecoration = active === s ? 'underline' : '';
            global.lastUpgrade[s][0] = null;
        }
        global.lastElement = null;
        for (let i = 0; i < global.elementsInfo.startCost.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }

        global.lastStrangeness = [null, 0];
        global.lastMilestone = [null, 0];
        for (const text of ['strangeness', 'milestones']) {
            getId(`${text}Stage`).textContent = '';
            getId(`${text}Text`).textContent = 'Hover to see.';
        }
        getId('strangenessEffect').textContent = 'Hover to see.';
        getId('strangenessCost').textContent = 'Strange quarks.';
        getId('milestonesMultiline').innerHTML = `<p class="orchidText">Requirement: <span class="greenText">Hover to see.</span></p><p class="blueText">Time limit: <span class="greenText">Hover to see.</span></p><p class="darkvioletText">${vacuum ? 'Effect' : 'Unlock'}: <span class="greenText">Hover to see.</span></p>`;

        if (challenge !== null) {
            getId('currentChallenge').style.display = '';
            const currentID = getQuery('#currentChallenge > span');
            currentID.textContent = global.challengesInfo.name[challenge];
            currentID.style.color = `var(--${global.challengesInfo.color[challenge]}-text)`;
        } else { getId('currentChallenge').style.display = 'none'; }
        getChallengeDescription(challenge);

        visualTrueStageUnlocks();
        visualUpdateInflation();
        switchTab(checkTab(global.tab) ? global.tab : 'stage'); //Update subtab list
    }

    const upgradesInfo = global.upgradesInfo[active];
    const researchesInfo = global.researchesInfo[active];
    const researchesExtraInfo = global.researchesExtraInfo[active];
    const footerStatsHTML = specialHTML.footerStatsHTML[active];
    for (let i = buildingsInfo.maxActive[active]; i < specialHTML.longestBuilding; i++) {
        getId(`building${i}Stats`).style.display = 'none';
        getId(`building${i}`).style.display = 'none';
    }
    for (let i = upgradesInfo.maxActive; i < specialHTML.longestUpgrade; i++) {
        getId(`upgrade${i + 1}`).style.display = 'none';
    }
    for (let i = researchesInfo.maxActive; i < specialHTML.longestResearch; i++) {
        getId(`research${i + 1}`).style.display = 'none';
    }
    for (let i = researchesExtraInfo.maxActive; i < specialHTML.longestResearchExtra; i++) {
        getId(`researchExtra${i + 1}`).style.display = 'none';
    }
    for (let i = footerStatsHTML.length; i < specialHTML.longestFooterStats; i++) {
        getId(`footerStat${i + 1}`).style.display = 'none';
    }

    const showU: number[] = []; //Upgrades
    const showR: number[] = []; //Researches
    const showRE: number[] = []; //ResearchesExtra
    const showF: number[] = []; //Footer stats
    if (active === 1) {
        showU.push(2, 3, 4, 5);
        showR.push(0, 1, 2, 3, 4, 5);
        showF.push(0, 1, 2);
        getId('specials').style.display = 'none';
        if (vacuum) {
            showU.push(0, 1);
            showRE.push(0, 2);
        } else {
            getId('upgrade1').style.display = 'none';
            getId('upgrade2').style.display = 'none';
            getId('extraResearches').style.display = 'none';
        }
    } else if (active === 2) {
        showU.push(0);
        showR.push(0, 1);
        showRE.push(0, 1);
        showF.push(0, 1);
        getId('specials').style.display = 'none';
        if (vacuum) { getId('stageInfo').style.display = ''; }
    } else if (active === 3) {
        showU.push(0, 1);
        showR.push(0, 1);
        showRE.push(0);
        showF.push(0);
        global.debug.rankUpdated = null;
        getId('specials').style.display = 'none';
        getId('reset1Main').style.display = '';
        if (vacuum) { getId('stageInfo').style.display = ''; }
    } else if (active === 4) {
        showU.push(0, 1, 2);
        showR.push(0, 1, 2);
        showRE.push(0);
        showF.push(0, 1);
        getId('stageInfo').style.display = '';
        getId('extraResearches').style.display = '';
        setRemnants();
    } else if (active === 5) {
        showRE.push(0);
        showF.push(0, 1, 2);
        getId('stageInfo').style.display = '';
        if (vacuum) {
            getId('building2').style.display = '';
            showU.push(0, 1);
            showR.push(0, 1);
            getId('extraResearches').style.display = '';
            getId('special2').style.display = 'none';
            getId('special3').style.display = 'none';
        } else {
            getId('specials').style.display = 'none';
        }
        setRemnants();
    } else if (active === 6) {
        showF.push(0, 1);
        getId('stageInfo').style.display = '';
        getId('reset1Main').style.display = 'none';
        getId('specials').style.display = 'none';
        getId('extraResearches').style.display = 'none';
    }
    getId('buildings').style.display = '';
    getId('building1').style.display = '';
    getId('upgrades').style.display = '';
    getId('stageResearches').style.display = '';
    (getId('autoWaitInput') as HTMLInputElement).value = format(player.toggles.shop.wait[active], { type: 'input' });

    const buildingHTML = specialHTML.buildingHTML[active];
    const buildingName = buildingsInfo.name[active];
    const buildingType = buildingsInfo.type[active];
    const buildingHoverText = buildingsInfo.hoverText[active];
    for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
        (getQuery(`#building${i} > img`) as HTMLImageElement).src = `Used_art/${buildingHTML[i - 1]}`;
        getQuery(`#building${i}Stats > h4`).textContent = buildingName[i];
        getId(`building${i}Name`).textContent = buildingName[i];
        getQuery(`#building${i}ProdDiv > span`).textContent = buildingType[i - 1];
        getId(`building${i}ProdDiv`).title = buildingHoverText[i - 1];
        toggleSwap(i, 'buildings');
    }
    getQuery('#building0Stats > h4').textContent = buildingName[0];
    toggleSwap(0, 'buildings');

    const upgradeHTML = specialHTML.upgradeHTML[active];
    for (let i = 0; i < upgradesInfo.maxActive; i++) {
        const image = getId(`upgrade${i + 1}`) as HTMLInputElement;
        if (showU.includes(i)) { image.style.display = ''; }
        image.src = `Used_art/${upgradeHTML[i]}`;
        image.alt = upgradesInfo.name[i];
        visualUpdateUpgrades(i, active, 'upgrades');
    }

    const researchHTML = specialHTML.researchHTML[active];
    for (let i = 0; i < researchesInfo.maxActive; i++) {
        const main = getId(`research${i + 1}`);
        if (showR.includes(i)) { main.style.display = ''; }
        main.className = researchHTML[i][1];
        const image = getId(`research${i + 1}Image`) as HTMLInputElement;
        image.src = `Used_art/${researchHTML[i][0]}`;
        image.alt = researchesInfo.name[i];
        visualUpdateResearches(i, active, 'researches');
    }

    const researchExtraHTML = specialHTML.researchExtraHTML[active];
    for (let i = 0; i < researchesExtraInfo.maxActive; i++) {
        const main = getId(`researchExtra${i + 1}`);
        if (showRE.includes(i)) { main.style.display = ''; }
        main.className = researchExtraHTML[i][1];
        const image = getId(`researchExtra${i + 1}Image`) as HTMLInputElement;
        image.src = `Used_art/${researchExtraHTML[i][0]}`;
        image.alt = researchesExtraInfo.name[i];
        visualUpdateResearches(i, active, 'researchesExtra');
    }
    getQuery('#extraResearches > div').className = specialHTML.researchExtraDivHTML[active][1];
    (getQuery('#extraResearches > img') as HTMLImageElement).src = `Used_art/${specialHTML.researchExtraDivHTML[active][0]}`;
    visualUpdateResearches(0, active, 'ASR');

    for (let i = 0; i < footerStatsHTML.length; i++) {
        if (showF.includes(i)) { getId(`footerStat${i + 1}`).style.display = ''; }
        (getQuery(`#footerStat${i + 1} > img`) as HTMLImageElement).src = `Used_art/${footerStatsHTML[i][0]}`;
        getQuery(`#footerStat${i + 1} > p`).className = footerStatsHTML[i][1];
        getQuery(`#footerStat${i + 1} span`).textContent = footerStatsHTML[i][2];
    }

    const body = document.documentElement.style;
    body.setProperty('--stage-text', `var(--${stageInfo.textColor[active]}-text)`);
    body.setProperty('--stage-button-border', stageInfo.buttonBorder[active]);
    body.setProperty('--stage-image-borderColor', stageInfo.imageBorderColor[active]);
    body.setProperty('--image-border', `url("Used_art/Stage${active} border.png")`);
    getId('currentSwitch').textContent = stageInfo.word[active];

    visualUpdate();
    numbersUpdate();
    if (globalSave.theme === null) { switchTheme(); }
};
