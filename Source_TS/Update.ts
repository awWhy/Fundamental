import { checkTab, milestoneGetValue } from './Check';
import Overlimit from './Limit';
import { getClass, getId, getQuery } from './Main';
import { global, player } from './Player';
import { MDStrangenessPage, globalSave, playEvent, specialHTML, switchTheme } from './Special';
import { autoElementsBuy, autoElementsSet, autoResearchesBuy, autoResearchesSet, autoUpgradesBuy, autoUpgradesSet, buyBuilding, calculateBuildingsCost, gainBuildings, assignBuildingInformation, collapseResetCheck, dischargeResetCheck, rankResetCheck, stageResetCheck, toggleSwap, vaporizationResetCheck, assignNewMass, gainStrange, switchStage, setActiveStage, calculateEffects } from './Stage';
import type { gameTab } from './Types';
import { updateUnknown } from './Vacuum';

export const switchTab = (tab: gameTab, subtab = null as null | string) => {
    if (subtab === null) {
        const oldTab = global.tab;
        getId(`${oldTab}Tab`).style.display = 'none';
        getId(`${oldTab}TabBtn`).classList.remove('tabActive');
        const oldSubtabs = global.tabList[`${oldTab as 'stage'}Subtabs`] as string[] | undefined;
        if (oldSubtabs !== undefined) {
            for (const inside of oldSubtabs) {
                getId(`${oldTab}SubtabBtn${inside}`).style.display = 'none';
            }
        }

        global.tab = tab;
        let subtabAmount = 0;
        getId(`${tab}Tab`).style.display = '';
        getId(`${tab}TabBtn`).classList.add('tabActive');
        const newSubtabs = global.tabList[`${tab as 'stage'}Subtabs`] as string[] | undefined;
        if (newSubtabs !== undefined) {
            for (const inside of newSubtabs) {
                if (checkTab(tab, inside)) {
                    getId(`${tab}SubtabBtn${inside}`).style.display = '';
                    subtabAmount++;
                } else if (global.subtab[`${tab as 'stage'}Current`] === inside) {
                    switchTab(tab, newSubtabs[0]);
                }
            }
        }
        getId('subtabs').style.display = subtabAmount > 1 ? '' : 'none';
        if (globalSave.SRSettings[0]) { getId('SRTab').textContent = `Current tab is '${tab}'${subtabAmount > 1 ? ` and subtab is '${global.subtab[`${tab as 'stage'}Current`]}'` : ''}`; }
    } else {
        const oldSubtab = global.subtab[`${tab as 'stage'}Current`];
        getId(`${tab}Subtab${oldSubtab}`).style.display = 'none';
        getId(`${tab}SubtabBtn${oldSubtab}`).classList.remove('tabActive');

        global.subtab[`${tab as 'stage'}Current`] = subtab;
        getId(`${tab}Subtab${subtab}`).style.display = '';
        getId(`${tab}SubtabBtn${subtab}`).classList.add('tabActive');
        if (globalSave.SRSettings[0]) { getId('SRTab').textContent = `Current subtab is '${subtab}', part of '${tab}' tab`; }
    }

    const active = player.stage.active;
    if (global.trueActive !== active) {
        switchStage(global.trueActive);
    } else if (active !== 4 && active !== 5 && ((global.tab === 'upgrade' && global.subtab.upgradeCurrent === 'Elements') || tab === 'Elements')) {
        if ((tab === 'upgrade' && subtab === null) || !global.stageInfo.activeAll.includes(4)) {
            switchTab('upgrade', 'Upgrades');
        } else {
            setActiveStage(4, active);
            stageUpdate();
        }
    } else {
        visualUpdate();
        numbersUpdate();
    }
};

export const maxOfflineTime = (): number => player.stage.true >= 6 ? 43200 : Math.min(3600 * Math.min(player.stage.true, 4) + Math.max(player.stage.resets - 3, 0) * 1800, 43200);

export const timeUpdate = (timeWarp = 0) => { //Time based information
    const { time } = player;
    const { auto, buildings: autoBuy } = player.toggles;
    const { maxActive, type } = global.buildingsInfo;
    const { autoU, autoR, autoE, elements: autoElements } = global.automatization;
    const vacuum = player.inflation.vacuum;

    let passedSeconds: number;
    if (timeWarp > 0) {
        const extraTime = Math.min(1, timeWarp);
        passedSeconds = extraTime;
        timeWarp -= extraTime;
    } else {
        const currentTime = Date.now();
        passedSeconds = (currentTime - time.updated) / 1000;
        time.updated = currentTime;
        time.online += passedSeconds;
        time.export[0] += passedSeconds;
        global.lastSave += passedSeconds;
        if (passedSeconds < 0) {
            time.offline += passedSeconds;
            return;
        } else if (passedSeconds > 60) {
            time.offline = Math.min(time.offline + passedSeconds - 60, maxOfflineTime());
            passedSeconds = 60;
        }
    }
    const trueSeconds = passedSeconds;
    time.stage += trueSeconds;
    time.universe += trueSeconds;

    let globalSpeed = 1;
    if (vacuum && player.strangeness[5][0] >= 1 && player.challenges.active !== 0) { globalSpeed *= 1.2; }
    global.inflationInfo.globalSpeed = globalSpeed;
    passedSeconds *= globalSpeed;

    player.stage.time += passedSeconds;
    player.inflation.age += passedSeconds;

    if (vacuum && auto[0]) { stageResetCheck(5, true); }
    if (player.strangeness[5][8] >= 1) { gainStrange(0, trueSeconds); }
    assignBuildingInformation();
    for (const s of global.stageInfo.activeAll) {
        if (!vacuum && auto[0]) { stageResetCheck(s, true); }
        if (s === 4) {
            collapseResetCheck(auto[4], true);
            if (autoElements.length !== 0) { autoElementsBuy(); }
        } else if (s === 3) {
            if (auto[3]) { rankResetCheck(true); }
        } else if (s === 2) {
            vaporizationResetCheck(auto[2], trueSeconds);
        } else if (s === 1) {
            dischargeResetCheck(auto[1], true);
        }

        if (autoU[s].length !== 0) { autoUpgradesBuy(s); }
        if (autoR[s].length !== 0) { autoResearchesBuy('researches', s); }
        if (autoE[s].length !== 0) { autoResearchesBuy('researchesExtra', s); }

        for (let i = maxActive[s] - 1; i >= 1; i--) {
            if (autoBuy[s][i] && player.ASR[s] >= i) { buyBuilding(i, s, 0, true); }
            if (type[s][i] === 'producing') {
                gainBuildings(i - 1, s, passedSeconds);
                assignBuildingInformation();
            }
        }
        if (s === 1) { //Molecules from Radiation
            gainBuildings(5, 1, passedSeconds);
        } else if (s === 5) { //Stars from Nebulas
            const research = player.researches[5][0];

            if (research >= 1) { gainBuildings(1, 5, passedSeconds); }
            if (research >= 2) { gainBuildings(2, 5, passedSeconds); }
            if (research >= 3) { gainBuildings(3, 5, passedSeconds); }
        }
    }

    if (timeWarp > 0) { timeUpdate(timeWarp); }
};

export const numbersUpdate = () => {
    const { tab, subtab } = global;
    const { stage } = player;
    const active = stage.active;
    const buildings = player.buildings[active];

    const highestGainStage = player.inflation.vacuum ? 5 : stage.current;
    if (stageResetCheck(highestGainStage)) {
        const peakCheck = calculateEffects.strangeGain(highestGainStage) / player.time.stage;
        if (stage.peak < peakCheck) { stage.peak = peakCheck; }
    }

    if (global.footer) {
        if (active === 1) {
            getId('footerStat1Span').textContent = format(buildings[0].current, { padding: true });
            getId('footerStat2Span').textContent = format(player.discharge.energy, { padding: player.discharge.energy >= 1e6 });
        } else if (active === 2) {
            getId('footerStat1Span').textContent = format(player.vaporization.clouds, { padding: true });
            getId('footerStat2Span').textContent = format(buildings[0].current, { padding: true });
            getId('footerStat3Span').textContent = format(buildings[1].current, { padding: true });
        } else if (active === 3) {
            getId('footerStat1Span').textContent = format(buildings[0].current, { padding: true });
        } else if (active === 4 || active === 5) {
            const stars = player.buildings[4];

            getId('footerStat1Span').textContent = format(player.collapse.mass, { padding: true });
            getId('footerStat2Span').textContent = format(stars[0].current, { padding: true });
            if (active === 5) {
                getId('footerStat3Span').textContent = format(new Overlimit(stars[1].current).plus(stars[2].current, stars[3].current, stars[4].current, stars[5].current), { padding: true });
            }
        }
    }
    if (tab === 'stage') {
        if (subtab.stageCurrent === 'Structures') {
            const { buildingsInfo } = global;
            const howMany = global.hotkeys.shift ? 1 : global.hotkeys.ctrl ? 10 : player.toggles.shop.input;

            for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
                const trueCountID = getId(`building${i}True`);
                getId(`building${i}Cur`).textContent = format(buildings[i].current, { padding: trueCountID.style.display !== 'none' });
                getId(`building${i}Prod`).textContent = format(buildingsInfo.producing[active][i], { padding: true });
                trueCountID.textContent = `[${format(buildings[i as 1].true)}]`;

                if (active === 3) {
                    if (i > 1 && player.upgrades[3][global.accretionInfo.unlockA[i - 2]] !== 1) {
                        getId(`building${i}`).classList.remove('availableBuilding');
                        getId(`building${i}Btn`).textContent = 'Unlocked with Upgrade';
                        getId(`building${i}BuyX`).textContent = 'Locked';
                        continue;
                    }
                } else if (active === 4) {
                    const unlock = global.collapseInfo.unlockB[i];
                    if (player.collapse.mass < unlock && player.buildings[5][3].true < 1) {
                        getId(`building${i}`).classList.remove('availableBuilding');
                        getId(`building${i}Btn`).textContent = `Unlocked at ${format(unlock)} Mass`;
                        getId(`building${i}BuyX`).textContent = 'Locked';
                        continue;
                    }
                }

                let costName: string;
                let currency: number | Overlimit;
                let free = false;
                if (active === 5 && i === 3) { //Galaxy
                    costName = 'Mass';
                    currency = player.collapse.mass;
                } else {
                    let e = i - 1;
                    let extra = active;
                    if (active === 1) {
                        if (i === 1) { free = player.researchesExtra[1][2] >= 1 && player.strangeness[1][8] >= 1; }
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
                if (howMany !== 1 && (active !== 5 || i !== 3)) {
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
                getId(`building${i}BuyX`).textContent = format(buy);
            }
            if (active === 1) {
                getId('dischargeBase').textContent = format(global.dischargeInfo.base);
                getId('reset1Button').textContent = `Next goal is ${format(global.dischargeInfo.next)} Energy`;
                getId('tritiumEffect').textContent = format(global.dischargeInfo.tritium, { padding: true });
                getId('dischargeEffectStat').textContent = format(new Overlimit(global.dischargeInfo.base).power(global.dischargeInfo.total), { padding: true });
                getId('energySpent').textContent = format(global.dischargeInfo.energyTrue - player.discharge.energy);
                if (player.inflation.vacuum) {
                    getId('preonCapStat').textContent = format(global.inflationInfo.preonCap, { padding: true });
                    getId('preonCapRatio').textContent = format(new Overlimit(global.inflationInfo.preonTrue).divide(global.inflationInfo.preonCap), { padding: true });
                }
            } else if (active === 2) {
                getId('reset1Button').textContent = global.vaporizationInfo.get.moreThan('0') ? `Reset for ${format(global.vaporizationInfo.get, { padding: true })} Clouds` : `Waiting for ${format(calculateEffects.S2Upgrade2(), { padding: true })} Drops`;
                getId('cloudEffectStat').textContent = format(global.vaporizationInfo.strength, { padding: true });
                if (player.inflation.vacuum) {
                    getId('molesProductionStat').textContent = format(new Overlimit(global.dischargeInfo.tritium).divide('6.02214076e23'), { padding: true });
                }
            } else if (active === 3) {
                if (player.inflation.vacuum) {
                    getId('massProductionStat').textContent = format(new Overlimit(buildingsInfo.producing[1][1]).multiply('1.78266192e-33'), { padding: true });
                    getId('dustCapStat').textContent = format(global.inflationInfo.dustCap, { padding: true });
                    getId('dustCapRatio').textContent = format(new Overlimit(global.inflationInfo.dustTrue).divide(global.inflationInfo.dustCap), { padding: true });
                    getId('submersionBoostStat').textContent = format(calculateEffects.submersion(), { padding: true });
                }
            } else if (active === 4) {
                const { collapse } = player;
                const { collapseInfo } = global;
                assignNewMass();

                getId('reset1Button').textContent = `Collapse to ${format(collapseInfo.newMass, { padding: true })} Mass`;
                getId('solarMassCurrent').textContent = format(collapseInfo.massEffect, { padding: true });
                for (let i = 1; i <= 3; i++) {
                    getId(`special${i}Cur`).textContent = format(collapse.stars[i - 1]);
                    getId(`special${i}Get`).textContent = format(collapseInfo.starCheck[i - 1]);
                    getId(`star${i}Current`).textContent = format(collapseInfo.starEffect[i - 1], { padding: true });
                }
                if (player.inflation.vacuum) {
                    const timeUntil = new Overlimit(global.inflationInfo.massCap / 8.96499278339628e-67).minus(player.buildings[1][0].current).divide(buildingsInfo.producing[1][1]).toNumber() / global.inflationInfo.globalSpeed;
                    getId('mainCapStat').textContent = format(global.inflationInfo.massCap, { padding: true });
                    getId('mainCapTill').textContent = isFinite(timeUntil) ? format(timeUntil, { padding: true }) : 'Infinity';
                }
            } else if (active === 5) {
                assignNewMass();
                getId('solarMassOnCollapse').textContent = format(global.collapseInfo.newMass, { padding: true });
            }

            if (!player.inflation.vacuum) {
                const resetMessage = active >= 4 ? 'Return back to start' : active === stage.current ? 'Enter next Stage' : 'Reset this Stage';
                const failMessage = (active >= 4 ? player.strange[0].total <= 0 : active === stage.current) ? 'Not ready for more' : 'Not ready for reset';
                getId('stageReset').textContent = (active >= 4 ? stage.current >= 5 && player.events[0] : stageResetCheck(active)) ? resetMessage : failMessage;
            }

            getId('stageTime').textContent = format(stage.time, { type: 'time' });
            getId('stageTimeRealStat').textContent = format(player.time.stage, { type: 'time' });
        } else if (subtab.stageCurrent === 'Advanced') {
            if (!player.inflation.vacuum) { getId('vacuumEffect').textContent = format(global.strangeInfo.instability); }
            getId('globalSpeedStat').textContent = format(global.inflationInfo.globalSpeed, { padding: true });
            getId('universeAge').textContent = format(player.inflation.age, { type: 'time' });
            getId('universeAgeTime').textContent = format(player.time.universe, { type: 'time' });
        }
    } else if (tab === 'upgrade' || tab === 'Elements') {
        const trueSubtab = tab === 'Elements' ? tab : subtab.upgradeCurrent;
        if (trueSubtab === 'Upgrades') {
            const last = global.lastUpgrade[active];
            if (last[0] >= 0) { getUpgradeDescription(last[0], last[1]); }
        } else if (trueSubtab === 'Elements') {
            if (global.lastElement >= 1) { getUpgradeDescription(global.lastElement, 'elements'); }
        }
    } else if (tab === 'strangeness') {
        if (subtab.strangenessCurrent === 'Matter') {
            const properStage = player.inflation.vacuum ? 5 : active;
            const quarksGain = calculateEffects.strangeGain(properStage);
            getId('strange0Inc').textContent = format(quarksGain);
            getId('strange1Inc').textContent = format(calculateEffects.strangeGain(properStage, 1));
            getId('strangeRate').textContent = format(quarksGain / player.time.stage, { type: 'income', padding: true });
            getId('strangePeak').textContent = format(stage.peak, { type: 'income', padding: true });
            getId('strange0Cur').textContent = format(player.strange[0].current);
            getId('strange1Cur').textContent = format(player.strange[1].current);
            getId('stageTimeStrangeness').textContent = format(player.time.stage, { type: 'time' });
            getId('stageTimeBestReset').textContent = format(player.history.stage.best[0], { type: 'time' });
            if (getId('strangeletsEffectsMain').style.display === '') {
                getId('strangeletsEffect1Stat').textContent = format(calculateEffects.strangeletsProd(), { padding: true });
                getId('strangeletsEffect2Stat').textContent = format(calculateEffects.strangeletsBuff(), { padding: true });
            } else if (getId('quarksEffectsMain').style.display === '') { //Slow, but probably better than nothing
                const { stageBoost } = global.strangeInfo;
                const { strangeness } = player;

                getId('quarksEffect1Stat').textContent = strangeness[1][6] >= 1 ? format(stageBoost[1], { padding: true }) : '1';
                getId('quarksEffect2Stat').textContent = strangeness[2][6] >= 1 ? format(stageBoost[2], { padding: true }) : '1';
                getId('quarksEffect3Stat').textContent = strangeness[3][7] >= 1 ? format(stageBoost[3], { padding: true }) : '1';
                getId('quarksEffect4Stat').textContent = strangeness[4][7] >= 1 ? format(stageBoost[4], { padding: true }) : '1';
                getId('quarksEffect5Stat').textContent = strangeness[5][7] >= 1 ? format(stageBoost[5], { padding: true }) : '1';
            }
            if (global.lastStrangeness[0] >= 0) { getStrangenessDescription(global.lastStrangeness[0], global.lastStrangeness[1], 'strangeness'); }
        } else if (subtab.strangenessCurrent === 'Milestones') {
            const info = global.milestonesInfo;
            for (let s = 1; s < info.length; s++) {
                const need = info[s].need;
                for (let i = 0; i < need.length; i++) {
                    const current = milestoneGetValue(i, s);
                    getId(`milestone${i + 1}Stage${s}Current`).textContent = format(current, { padding: true });
                    getId(`milestone${i + 1}Stage${s}Required`).textContent = need[i].notEqual('0') ?
                        need[i].lessOrEqual(current) ? 'Reached' :
                        format(need[i], { padding: true }) : 'Maxed';
                }
            }
        }
    } else if (tab === 'settings') {
        if (subtab.settingsCurrent === 'Settings') {
            const exportReward = player.time.export;
            const conversion = Math.min(exportReward[0] / 86400, 1);
            for (let i = 0; i < 2; i++) {
                const name = ['Quarks', 'Strangelets'][i];
                const base = exportReward[i + 1] / 2.5 + (i === 0 ? 1 : 0);
                const max = Math.floor(base);
                const cur = Math.min(base * conversion, max);
                const time = (max - cur) / base * 86400; //NaN if base is 0
                getId(`export${name}Max`).textContent = format(max, { padding: true });
                getId(`export${name}Cur`).textContent = format(cur, { padding: true });
                getId(`export${name}Time`).textContent = time > 0 ? format(time, { type: 'time' }) : 'maxed';
            }
            if (global.lastSave >= 1) { getId('isSaved').textContent = `${format(global.lastSave, { type: 'time' })} ago`; }
        } else if (subtab.settingsCurrent === 'Stats') {
            getId('firstPlayStat').textContent = `${new Date(player.time.started).toLocaleString()} (${format((Date.now() - player.time.started) / 1000, { type: 'time' })} ago)`;
            getId('firstPlay').title = `Total online time is ${format(player.time.online, { type: 'time' })}`;
            getId('stageResetsCount').textContent = format(stage.resets);
            getId('offlineStat').textContent = format(player.time.offline, { type: 'time', padding: false });
            getId('maxOfflineStat').textContent = format(maxOfflineTime(), { type: 'time', padding: false });
            if (active === 1) {
                getId('maxEnergyStat').textContent = format(player.discharge.energyMax);
                getId('dischargeStat').textContent = format(global.dischargeInfo.total);
                getId('dischargeStatTrue').textContent = ` [${player.discharge.current}]`;
            } else if (active === 2) {
                const clouds = new Overlimit(calculateEffects.clouds(true)).divide(global.vaporizationInfo.strength).toNumber();
                getId('cloudEffectAfter').textContent = `x${format(clouds, { padding: true })}`;
                const before = calculateEffects.S2Extra1_2();
                const after = calculateEffects.S2Extra1_2(true);
                const rain = after[0] / before[0];
                const storm = after[1] / before[1];
                getId('rainEffectAfter').textContent = `x${format(rain, { padding: true })}`;
                getId('stormEffectAfter').textContent = `x${format(storm, { padding: true })}`;
                getId('cloudEffectTotal').textContent = `x${format(clouds * rain * storm, { padding: true })}`;
                getId('maxCloudStat').textContent = format(player.vaporization.cloudsMax);

                if (player.inflation.vacuum) {
                    const moles = player.buildings[1][5];

                    buildings[0].total.setValue(moles.total).divide('6.02214076e23');
                    buildings[0].trueTotal.setValue(moles.trueTotal).divide('6.02214076e23');
                    buildings[0].highest.setValue(moles.highest).divide('6.02214076e23');
                }
            } else if (active === 3) {
                getId('currentRank').textContent = `${player.accretion.rank}`;
                if (player.inflation.vacuum) {
                    const mass = player.buildings[1][0];

                    buildings[0].total.setValue(mass.total).multiply('1.78266192e-33');
                    buildings[0].trueTotal.setValue(mass.trueTotal).multiply('1.78266192e-33');
                    buildings[0].highest.setValue(mass.highest).multiply('1.78266192e-33');
                }
            } else if (active === 4 || active === 5) {
                const collapseInfo = global.collapseInfo;
                getId('maxSolarMassStat').textContent = format(player.collapse.massMax);
                if (active === 4) {
                    const auto2 = player.strangeness[4][4] >= 2;
                    assignNewMass();

                    const mass = calculateEffects.mass(true) / collapseInfo.massEffect;
                    getId('massEffectAfter').textContent = `x${format(mass, { padding: true })}`;
                    const star0 = auto2 ? 1 : calculateEffects.star[0](true) / collapseInfo.starEffect[0];
                    const star1 = auto2 ? 1 : calculateEffects.star[1](true) / collapseInfo.starEffect[1];
                    const star2 = auto2 ? 1 : calculateEffects.star[2](true) / collapseInfo.starEffect[2];
                    if (!auto2) {
                        getId('star1After').textContent = `x${format(star0, { padding: true })}`;
                        getId('star2After').textContent = `x${format(star1, { padding: true })}`;
                        getId('star3After').textContent = `x${format(star2, { padding: true })}`;
                    }
                    const gamma = calculateEffects.S4Research4(true) / calculateEffects.S4Research4();
                    getId('gammaRayAfter').textContent = `x${format(gamma, { padding: true })}`;
                    getId('starTotal').textContent = `x${format(mass * star0 * star1 * star2 * gamma, { padding: true })}`;
                } else if (active === 5) {
                    getId('starsStatTrue').textContent = format(collapseInfo.trueStars);
                    const stars = player.buildings[4];

                    buildings[0].current.setValue(stars[1].current).plus(stars[2].current, stars[3].current, stars[4].current, stars[5].current);
                    buildings[0].total.setValue(stars[1].total).plus(stars[2].total, stars[3].total, stars[4].total, stars[5].total);
                    buildings[0].trueTotal.setValue(stars[1].trueTotal).plus(stars[2].trueTotal, stars[3].trueTotal, stars[4].trueTotal, stars[5].trueTotal);
                    buildings[0].highest.setValue(stars[1].highest).plus(stars[2].highest, stars[3].highest, stars[4].highest, stars[5].highest);
                }
            }
            for (let i = 0; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}StatTotal`).textContent = format(buildings[i].total, { padding: true });
                getId(`building${i}StatTrueTotal`).textContent = format(buildings[i].trueTotal, { padding: true });
                getId(`building${i}StatHighest`).textContent = format(buildings[i].highest, { padding: true });
            }

            getId('strange0StatTotal').textContent = format(player.strange[0].total, { padding: true });
            getId('strange1StatTotal').textContent = format(player.strange[1].total, { padding: true });
        }
    }
};

export const visualUpdate = () => {
    const { tab, subtab } = global;
    const { active, true: highest } = player.stage;
    const vacuum = player.inflation.vacuum;

    if (!player.events[0]) {
        if (highest === 5) {
            if (active === 5) { void playEvent(5, 0); }
        } else if (highest === 4) {
            if (player.elements.includes(0.5, 1)) { void playEvent(4, 0); }
        } else if (highest === 3) {
            if (player.buildings[3][0].current.moreOrEqual('5e29')) { void playEvent(3, 0); }
        } else if (highest === 2) {
            if (new Overlimit(global.vaporizationInfo.get).plus(player.vaporization.clouds).moreThan('1e4')) { void playEvent(2, 0); }
        } else if (highest === 1) {
            if (player.upgrades[1][5] === 1) { void playEvent(1, 0); }
        }
    }

    if (global.footer) {
        if (globalSave.toggles[1]) { getId('ElementsTabBtn').style.display = player.upgrades[4][1] === 1 ? '' : 'none'; }
        if (active === 1) {
            if (highest < 2) {
                getId('footerStat2').style.display = player.discharge.energyMax >= 9 ? '' : 'none';
                getId('upgradeTabBtn').style.display = player.discharge.energyMax >= 9 ? '' : 'none';
            }
        } else if (active === 2) {
            getId('footerStat1').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
        }
    }
    if (globalSave.MDSettings[0]) {
        let showReset1 = tab === 'stage' || tab === 'upgrade' || tab === 'Elements';
        if (showReset1) {
            if (active === 1) {
                showReset1 = player.upgrades[1][5] === 1;
            } else if (active === 2) {
                showReset1 = player.upgrades[2][2] === 1;
            } else if (active === 4) {
                showReset1 = player.upgrades[4][0] === 1;
            } else if (active === 5) {
                showReset1 = false;
            }
        }
        getId('reset1Footer').style.display = showReset1 ? '' : 'none';
        getId('resetCollapseFooter').style.display = active === 5 && tab === 'stage' ? '' : 'none';
        getId('stageFooter').style.display = (tab === 'stage' && (highest >= 2 || player.upgrades[1][9] === 1)) || tab === 'strangeness' ? '' : 'none';
    }

    if (tab === 'stage') {
        if (subtab.stageCurrent === 'Structures') {
            const buildings = player.buildings[active];
            const ASR = player.ASR[active];

            getId('stageTimeReal').style.display = player.stage.time !== player.time.stage ? '' : 'none';
            getId('offlineWarning').style.display = player.time.offline > 0 && player.time.offline >= maxOfflineTime() ? '' : 'none';
            if (highest < 2) { getId('toggleBuilding0').style.display = ASR >= 1 ? '' : 'none'; }
            for (let i = 1; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}True`).style.display = buildings[i].current.notEqual(buildings[i as 1].true) ? '' : 'none';
                getId(`toggleBuilding${i}`).style.display = ASR >= i ? '' : 'none';
            }
            if (active === 1) {
                getId('reset1Main').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('building2').style.display = buildings[1].trueTotal.moreOrEqual(vacuum ? '4' : '11') ? '' : 'none';
                getId('building3').style.display = buildings[2].trueTotal.moreOrEqual('2') ? '' : 'none';
                if (vacuum) {
                    getId('building4').style.display = buildings[3].trueTotal.moreOrEqual('8') ? '' : 'none';
                    getId('building5').style.display = buildings[4].trueTotal.moreOrEqual('2') ? '' : 'none';
                }
                getId('stageInfo').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('tritium').style.display = player.upgrades[1][8] === 1 ? '' : 'none';
                if (highest < 2) { getId('resetStage').style.display = player.upgrades[1][9] === 1 ? '' : 'none'; }
                if (highest < 7 && player.stage.resets < 1) { getId('resets').style.display = player.upgrades[1][5] === 1 ? '' : 'none'; }
            } else if (active === 2) {
                getId('reset1Main').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('building2').style.display = buildings[1].trueTotal.moreOrEqual('2e2') ? '' : 'none';
                getId('building3').style.display = buildings[1].trueTotal.moreOrEqual('4e6') ? '' : 'none';
                getId('building4').style.display = buildings[1].trueTotal.moreOrEqual('4e17') ? '' : 'none';
                getId('building5').style.display = buildings[1].trueTotal.moreOrEqual('4e22') ? '' : 'none';
                getId('cloudEffect').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                if (vacuum) {
                    getId('building6').style.display = buildings[1].trueTotal.moreOrEqual('8e24') ? '' : 'none';
                } else { getId('stageInfo').style.display = player.upgrades[2][2] === 1 ? '' : 'none'; }
            } else if (active === 3) {
                const upgrades = player.upgrades[3];
                const rank = player.accretion.rank;

                getId('buildings').style.display = rank >= 1 ? '' : 'none';
                getId('building2').style.display = rank >= 3 || upgrades[2] === 1 ? '' : 'none';
                getId('building3').style.display = rank >= 4 || upgrades[4] === 1 ? '' : 'none';
                getId('building4').style.display = rank >= 5 || upgrades[8] === 1 ? '' : 'none';
                if (vacuum) {
                    getId('building5').style.display = rank >= 6 || upgrades[11] === 1 ? '' : 'none';
                    getId('submersionBoost').style.display = player.researchesExtra[1][2] >= 2 ? '' : 'none';
                }
                updateRankInfo();
            } else if (active === 4) {
                const nova = player.researchesExtra[4][0];

                getId('specials').style.display = buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('special2').style.display = buildings[3].trueTotal.moreThan('0') ? '' : 'none';
                getId('special3').style.display = buildings[4].trueTotal.moreThan('0') ? '' : 'none';
                getId('reset1Main').style.display = player.upgrades[4][0] === 1 ? '' : 'none';
                getId('building2').style.display = nova >= 1 ? '' : 'none';
                getId('building3').style.display = nova >= 2 ? '' : 'none';
                getId('building4').style.display = nova >= 3 ? '' : 'none';
                getId('star1Effect').style.display = buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('star2Effect').style.display = buildings[3].trueTotal.moreThan('0') ? '' : 'none';
                getId('star3Effect').style.display = buildings[4].trueTotal.moreThan('0') ? '' : 'none';
                if (vacuum) {
                    getId('building5').style.display = player.elements[26] >= 1 ? '' : 'none';
                    getId('mainCap').style.display = player.upgrades[4][0] === 1 ? '' : 'none';
                }
            } else if (active === 5) {
                if (!vacuum) {
                    getId('buildings').style.display = player.milestones[2][0] >= 7 || player.milestones[3][0] >= 7 ? '' : 'none';
                    getId('building1').style.display = player.milestones[2][0] >= 7 ? '' : 'none';
                    getId('building2').style.display = player.milestones[3][0] >= 7 ? '' : 'none';
                }
                getId('building3').style.display = player.researchesExtra[5][0] >= 1 ? '' : 'none';
            }
        } else if (subtab.stageCurrent === 'Advanced') {
            getId('globalSpeed').style.display = global.inflationInfo.globalSpeed !== 1 ? '' : 'none';
            getId('universeAgeReal').style.display = player.inflation.age !== player.time.universe ? '' : 'none';
            getId('challenge1').style.display = vacuum && player.strangeness[5][0] >= 1 ? '' : 'none';
        }
    } else if (tab === 'upgrade' || tab === 'Elements') {
        const trueSubtab = tab === 'Elements' ? tab : subtab.upgradeCurrent;
        if (trueSubtab === 'Upgrades') {
            if (vacuum) {
                getId('researchAuto1').style.display = player.researchesExtra[1][2] >= 2 ? '' : 'none';
            }
            if (active === 1) {
                const superposition = player.upgrades[1][5] === 1;

                getId('upgrade7').style.display = superposition ? '' : 'none';
                getId('upgrade8').style.display = superposition ? '' : 'none';
                getId('upgrade9').style.display = superposition ? '' : 'none';
                getId('upgrade10').style.display = superposition ? '' : 'none';
                getId('researches').style.display = superposition ? '' : 'none';
                if (vacuum) {
                    getId('researchExtra2').style.display = player.researchesExtra[1][2] >= 2 ? '' : 'none';
                    getId('researchExtra4').style.display = player.researchesExtra[1][2] >= 1 ? '' : 'none';
                    getId('researchExtra5').style.display = player.accretion.rank >= 6 ? '' : 'none';
                }
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
                const stars = player.collapse.stars;
                const galaxy = player.buildings[5][3].true >= 1;

                getId('upgrade4').style.display = player.strangeness[4][2] >= 2 ? '' : 'none';
                getId('research4').style.display = (galaxy || stars[0] > 0) && player.strangeness[4][2] >= 1 ? '' : 'none';
                getId('research5').style.display = galaxy || stars[2] > 0 ? '' : 'none';
                getId('researchExtra2').style.display = galaxy || stars[0] > 0 ? '' : 'none';
                getId('researchExtra3').style.display = (galaxy || stars[0] > 0) && player.strangeness[4][2] >= 3 ? '' : 'none';
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
                    getId('extraResearches').style.display = player.milestones[5][0] >= 8 ? '' : 'none';
                }
                getId('upgrade3').style.display = player.researchesExtra[5][0] >= 1 ? '' : 'none';
            }
        } else if (trueSubtab === 'Elements') {
            const upgrades = player.upgrades[4];
            const neutron = player.upgrades[4][2] === 1 && (player.collapse.stars[1] > 0 || player.buildings[5][3].true >= 1);
            const grid = getId('elementsGrid');

            grid.style.display = upgrades[2] === 1 ? '' : 'flex';
            grid.classList[!neutron && upgrades[2] === 1 ? 'add' : 'remove']('tenElements');
            for (let i = 6; i <= 10; i++) { getId(`element${i}`).style.display = upgrades[2] === 1 ? '' : 'none'; }
            for (let i = 11; i <= 26; i++) { getId(`element${i}`).style.display = neutron ? '' : 'none'; }
            getId('element27').style.display = upgrades[3] === 1 ? '' : 'none';
            getId('element28').style.display = upgrades[3] === 1 ? '' : 'none';
        }
    } else if (tab === 'strangeness') {
        if (subtab.strangenessCurrent === 'Matter') {
            const bound = player.strangeness[5][5] >= 1;

            getId('strange1').style.display = player.strangeness[5][8] >= 1 ? '' : 'none';
            getId('strange1Gain').style.display = player.strangeness[5][8] >= 1 ? '' : 'none';
            getId('strangeRateType').textContent = player.strangeness[5][8] >= 1 ? 'Strange quarks rate' : 'Rate';
            getId('strange4Stage5').style.display = (vacuum ? bound : player.milestones[2][0] >= 7) ? '' : 'none';
            getId('strange5Stage5').style.display = (vacuum ? bound : player.milestones[3][0] >= 7) ? '' : 'none';
            getId('strange7Stage5').style.display = (vacuum ? bound : (player.milestones[2][0] >= 7 || player.milestones[3][0] >= 7)) ? '' : 'none';
            if (vacuum) {
                const voidProgress = player.challenges.void;

                getId('strange8Stage1').style.display = voidProgress[1] >= 1 ? '' : 'none';
                getId('strange9Stage1').style.display = voidProgress[1] >= 2 ? '' : 'none';
                getId('strange10Stage1').style.display = voidProgress[4] >= 2 ? '' : 'none';
                getId('strange8Stage2').style.display = voidProgress[1] >= 3 ? '' : 'none';
                getId('strange9Stage2').style.display = voidProgress[2] >= 1 ? '' : 'none';
                getId('strange10Stage2').style.display = voidProgress[2] >= 2 ? '' : 'none';
                getId('strange9Stage3').style.display = voidProgress[4] >= 4 ? '' : 'none';
                getId('strange10Stage3').style.display = voidProgress[5] >= 2 ? '' : 'none';
                getId('strange9Stage4').style.display = voidProgress[4] >= 3 ? '' : 'none';
                getId('strange10Stage4').style.display = voidProgress[5] >= 1 ? '' : 'none';
                getId('strange8Stage5').style.display = bound ? '' : 'none';
                getId('strange9Stage5').style.display = voidProgress[3] >= 5 ? '' : 'none';
            } else {
                const strange5 = player.milestones[4][0] >= 8;

                getId('strange7Stage1').style.display = strange5 ? '' : 'none';
                getId('strange7Stage2').style.display = strange5 ? '' : 'none';
                getId('strange8Stage3').style.display = strange5 ? '' : 'none';
                getId('strange8Stage4').style.display = strange5 ? '' : 'none';
                getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}5`).style.display = strange5 ? '' : 'none';
                getId('strange6Stage5').style.display = player.milestones[2][0] >= 7 || player.milestones[3][0] >= 7 ? '' : 'none';
            }
        } else if (subtab.strangenessCurrent === 'Milestones') {
            if (!vacuum) {
                getId('milestone1Stage5Div').style.display = player.strangeness[5][5] >= 1 ? '' : 'none';
                getId('milestone2Stage5Div').style.display = player.milestones[5][0] >= 8 ? '' : 'none';
                if (global.stageInfo.activeAll.includes(4)) { getId('milestonesStage5Progress').style.display = player.strangeness[5][5] >= 1 ? '' : 'none'; }
                if (global.stageInfo.activeAll.includes(5)) { getId('milestone2Stage5Progress').style.display = player.milestones[5][0] >= 8 ? '' : 'none'; }
            }
        }
    } else if (tab === 'settings') {
        if (subtab.settingsCurrent === 'Settings') {
            const { researchesAuto, strangeness } = player;

            getId('exportStrangelets').style.display = strangeness[5][8] >= 1 ? '' : 'none';
            getId('toggleAuto0').style.display = strangeness[5][2] >= 1 ? '' : 'none';
            getId('toggleAuto0Main').style.display = strangeness[5][2] >= 1 ? '' : 'none';
            getId('autoToggle5').style.display = researchesAuto[0] >= 1 ? '' : 'none';
            getId('autoToggle6').style.display = researchesAuto[0] >= 2 ? '' : 'none';
            getId('autoToggle7').style.display = researchesAuto[0] >= 3 ? '' : 'none';
            getId('autoToggle8').style.display = strangeness[4][6] >= 2 ? '' : 'none';
            getId('toggleAuto1').style.display = strangeness[1][4] >= 1 ? '' : 'none';
            getId('toggleAuto2').style.display = strangeness[2][4] >= 1 ? '' : 'none';
            getId('toggleAuto2Main').style.display = strangeness[2][4] >= 1 ? '' : 'none';
            getId('toggleAuto3').style.display = strangeness[3][4] >= 1 ? '' : 'none';
            getId('toggleAuto4').style.display = strangeness[4][4] >= 1 ? '' : 'none';
            getId('toggleAuto4Main').style.display = strangeness[4][4] >= 1 ? '' : 'none';
            if (highest < 2) {
                getId('resetToggles').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('dischargeHotkey').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('stageToggleReset').style.display = player.upgrades[1][9] === 1 ? '' : 'none';
                getId('stageHotkey').style.display = player.upgrades[1][9] === 1 ? '' : 'none';
            }
            if (highest < 3) {
                getId('vaporizationToggleReset').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('vaporizationHotkey').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
            }
            if (highest < 5) {
                getId('collapseToggleReset').style.display = player.upgrades[4][0] === 1 ? '' : 'none';
                getId('collapseHotkey').style.display = player.upgrades[4][0] === 1 ? '' : 'none';
                getId('elementsAsTab').style.display = player.upgrades[4][1] === 1 ? '' : 'none';
            }
            if (highest < 7) { getId('exportReward').style.display = player.stage.resets >= (vacuum ? 1 : 4) ? '' : 'none'; }
        } else if (subtab.settingsCurrent === 'History') {
            updateHistory(/*'stage'*/);
        } else if (subtab.settingsCurrent === 'Stats') {
            const { strange, strangeness } = player;
            const buildings = player.buildings[active];

            getId('stageResets').style.display = player.stage.resets > 0 ? '' : 'none';
            for (let i = 1; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}Stats`).style.display = buildings[i].trueTotal.moreThan('0') ? '' : 'none';
            }
            getId('strangeAllStats').style.display = strange[0].total > 0 ? '' : 'none';
            getId('strange1Stats').style.display = strange[1].total > 0 ? '' : 'none';

            if (!vacuum) { updateUnknown(); }
            getId('solarMassStat').style.display = active === 4 || active === 5 ? '' : 'none';
            if (active === 1) {
                getId('energyStats').style.display = highest >= 5 || player.discharge.energyMax >= 9 ? '' : 'none';
                getId('dischargeStats').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('dischargeStatTrue').style.display = player.discharge.current !== global.dischargeInfo.total ? '' : 'none';
            } else if (active === 2) {
                getId('vaporizationBoost').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('rainEffect').style.display = player.researchesExtra[2][1] >= 1 ? '' : 'none';
                getId('stormEffect').style.display = player.researchesExtra[2][2] >= 1 ? '' : 'none';
                getId('cloudStats').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
            } else if (active === 3) {
                if (vacuum) {
                    getId('rankStat0').style.display = strangeness[2][9] >= 1 ? '' : 'none';
                }
                for (let i = 1; i < global.accretionInfo.rankImage.length; i++) { getId(`rankStat${i}`).style.display = player.accretion.rank >= i ? '' : 'none'; }
            } else if (active === 4) {
                const auto2 = player.strangeness[4][4] >= 2;
                getId('star1Stat').style.display = !auto2 && buildings[2].trueTotal.moreThan('0') ? '' : 'none';
                getId('star2Stat').style.display = !auto2 && buildings[3].trueTotal.moreThan('0') ? '' : 'none';
                getId('star3Stat').style.display = !auto2 && buildings[4].trueTotal.moreThan('0') ? '' : 'none';
                getId('gammaRayStat').style.display = player.researches[4][4] >= 1 ? '' : 'none';
            }
        }
    }
};

export const getUpgradeDescription = (index: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements') => {
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
    const costName = stageIndex === 1 ? 'Energy' : stageIndex === 2 ? 'Drops' : stageIndex === 3 ? 'Mass' : 'Elements';
    if (type === 'upgrades') {
        const pointer = global[`${type}Info`][stageIndex];

        getId('upgradeText').textContent = `${pointer.name[index]}.`;
        getId('upgradeEffect').textContent = pointer.effectText[index]();
        getId('upgradeCost').textContent = player.upgrades[stageIndex][index] === 1 ? 'Created.' :
            stageIndex === 4 && global.collapseInfo.unlockU[index] > player.collapse.mass && player.buildings[5][3].true < 1 ? `Unlocked at ${format(global.collapseInfo.unlockU[index])} Mass.` :
            `${format(pointer.startCost[index])} ${costName}.`;
    } else if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];
        const level = player[type][stageIndex][index];
        if (type === 'researchesExtra' && stageIndex === 4 && index === 0) { pointer.name[0] = ['Nova', 'Supernova', 'Hypernova'][Math.min(level, 2)]; }

        getId('upgradeText').textContent = `${pointer.name[index]}.`;
        getId('upgradeEffect').textContent = pointer.effectText[index]();
        if (level >= pointer.max[index]) {
            getId('upgradeCost').textContent = 'Maxed.';
        } else if (stageIndex === 4 && type === 'researches' && global.collapseInfo.unlockR[index] > player.collapse.mass && player.buildings[5][3].true < 1) {
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
        const level = player.researchesAuto[index];

        getId('upgradeText').textContent = `${pointer.name[index]}.`;
        getId('upgradeEffect').textContent = pointer.effectText[index]();
        if (level >= pointer.max[index]) {
            getId('upgradeCost').textContent = 'Maxed.';
        } else {
            const autoStage = pointer.autoStage[index][level];
            getId('upgradeCost').textContent = !(autoStage === stageIndex || (stageIndex === 5 && autoStage === 4)) ? `This level can only be created while inside '${global.stageInfo.word[autoStage]}'.` :
                `${format(pointer.costRange[index][level])} ${costName}.`;
        }
    } else if (type === 'ASR') {
        const pointer = global.ASRInfo;
        const level = player.ASR[stageIndex];

        getId('upgradeText').textContent = `${pointer.name}.`;
        getId('upgradeEffect').textContent = pointer.effectText();
        getId('upgradeCost').textContent = level >= pointer.max[stageIndex] ? 'Maxed.' :
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
        const multilineID = getId('milestonesMultiline');
        const container = multilineID.parentElement as HTMLElement;

        getId('milestonesText').textContent = `${pointer.name[index]}. (${format(player.milestones[stageIndex][index])})`;
        if (pointer.need[index].notEqual('0')) {
            multilineID.innerHTML = `<p class="orchidText">Requirement: <span class="greenText">${pointer.needText[index]()}</span></p>
            <p class="darkvioletText">Unlock: <span class="greenText">Main reward unlocked after ${pointer.scaling[index].length - player.milestones[stageIndex][index]} more completions.</span></p>`;
        } else { multilineID.innerHTML = `<p class="darkvioletText">Reward: <span class="greenText">${pointer.rewardText[index]()}</span></p>`; }
        container.style.minHeight = `${container.offsetHeight}px`;
    }
};

export const getChallengeDescription = (index: number) => {
    let text;
    if (index === -1) {
        text = `<h3 class="orchidText">Vacuum state: <span ${player.inflation.vacuum ? 'class="greenText">true' : 'class="redText">false'}</span></h3>`;
    } else {
        const info = global.challengesInfo;
        const color = `${info.color[index]}Text`;
        text = `<h3 class="${color} bigWord">${info.name[index]}${player.challenges.active === index ? ', <span class="greenText">active</span>' : ''}</h3>
        <p class="whiteText">${info.description[index]}</p>
        <div><h4 class="${color} bigWord">Effect:</h4>
        <p>${info.effectText[index]()}</p></div>`;
    }

    if (index === 0) {
        const progress = player.challenges.void;

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
    const reward = global.challengesInfo.rewardText[0][index];
    const level = player.challenges.void[index];
    let text = '';
    for (let i = 0; i < need.length; i++) {
        text += `<div><p><span class="${level > i ? 'greenText' : 'redText'}">→</span> ${index === 2 && i === 1 ? need[i].replace('1e4', format(1e4)) : need[i]}</p>
        <p><span class="${level > i ? 'greenText' : 'redText'}">Reward:</span> ${level > i ? reward[i] : 'Not yet unlocked'}</p></div>`;
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

const updateRankInfo = () => {
    const rank = player.accretion.rank;
    if (global.debug.rankUpdated === rank) { return; }
    const rankInfo = global.accretionInfo;
    const name = getId('rankName');

    getId('rankMessage').textContent = rank === 0 ?
        'Might need more than just water... Increase Rank with Mass.' :
        `Increase it with Mass. (Return back to ${player.inflation.vacuum ? 'Preons' : 'Dust'}, but unlock something new)`;
    getId('reset1Button').textContent = rank >= rankInfo.maxRank ? 'Max Rank achieved' : `Next Rank is ${format(rankInfo.rankCost[rank])} Mass`;
    (getId('rankImage') as HTMLImageElement).src = `Used_art/${rankInfo.rankImage[rank]}`;
    name.textContent = rankInfo.rankName[rank];
    name.style.color = `var(--${rankInfo.rankColor[rank]}-text)`;
    global.debug.rankUpdated = rank;
};

export const setRemnants = () => {
    const whiteDwarf = player.researchesExtra[4][2] >= 1;
    getId('special1').title = whiteDwarf ? 'White dwarfs (Red giants)' : 'Red giants';
    (getQuery('#special1 > img') as HTMLImageElement).src = `Used_art/${whiteDwarf ? 'White%20dwarf' : 'Red%20giant'}.png`;
    getId('special1Cur').className = whiteDwarf ? 'cyanText' : 'redText';
};

const updateHistory = (/*type: 'stage'*/) => {
    if (global.debug.historyStage === player.stage.resets) { return; }
    const list = global.historyStorage.stage;
    const length = Math.min(list.length, player.history.stage.input[1]);

    let text = '';
    if (length > 0) {
        for (let i = 0; i < length; i++) {
            text += `<li class="whiteText"><span class="greenText">${format(list[i][1])} Strange quarks</span>${list[i][2] > 0 ? `, <span class="greenText">${format(list[i][2])} Strangelets</span>` : ''}, <span class="blueText">${format(list[i][0], { type: 'time' })}</span>, <span class="darkorchidText">${format(list[i][1] / list[i][0], { type: 'income', padding: true })}</span></li>`;
        }
    } else { text = '<li class="redText">Reference list is empty</li>'; }
    getId('stageResetsList').innerHTML = text;

    const stageBest = player.history.stage.best;
    getId('stageBest').innerHTML = `Best reset: <span class="whiteText"><span class="greenText">${format(stageBest[1])} Strange quarks</span>${stageBest[2] > 0 ? `, <span class="greenText">${format(stageBest[2])} Strangelets</span>` : ''}, <span class="blueText">${format(stageBest[0], { type: 'time' })}</span>, <span class="darkorchidText">${format(stageBest[1] / stageBest[0], { type: 'income', padding: true })}</span></span>`;
    global.debug.historyStage = player.stage.resets;
};

export const format = (input: number | Overlimit, settings = {} as { digits?: number, type?: 'number' | 'input' | 'time' | 'income', padding?: boolean }): string => {
    if (typeof input === 'object') { return input?.format(settings as any); }
    const type = settings.type ?? 'number';

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

        if (settings.padding === undefined) { settings.padding = true; }
    } else if (type === 'time') {
        const inputAbs = Math.abs(input);
        if (inputAbs < 60) {
            extra = 'seconds';
        } else if (inputAbs < 3600) {
            const minutes = Math.trunc(input / 60);
            const seconds = Math.trunc(input - minutes * 60);
            if (settings.padding === false && seconds === 0) { return `${minutes} minutes`; }
            return `${minutes} minutes ${seconds} seconds`;
        } else if (inputAbs < 86400) {
            const hours = Math.trunc(input / 3600);
            const minutes = Math.trunc(input / 60 - hours * 60);
            if (settings.padding === false && minutes === 0) { return `${hours} hours`; }
            return `${hours} hours ${minutes} minutes`;
        } else if (inputAbs < 31556952) {
            const days = Math.trunc(input / 86400);
            const hours = Math.trunc(input / 3600 - days * 24);
            if (settings.padding === false && hours === 0) { return `${days} days`; }
            return `${days} days ${hours} hours`;
        } else if (inputAbs < 3.1556952e10) {
            const years = Math.trunc(input / 31556952);
            const days = Math.trunc(input / 86400 - years * 365.2425);
            if (settings.padding === false && days === 0) { return `${years} years`; }
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

        settings.padding = !(settings.padding === false && Math.trunc(input) === input);
        settings.digits = input >= 1e3 && input < 1e6 ? 0 : 3;
    }
    if (!isFinite(input)) { return extra !== undefined ? `${input} ${extra}` : `${input}`; }

    const inputAbs = Math.abs(input);
    if (inputAbs >= 1e6 || (inputAbs < 1e-3 && inputAbs > 0)) {
        const precision = settings.digits ?? 2;
        let digits = Math.floor(Math.log10(inputAbs));
        let result = Math.round(input / 10 ** (digits - precision)) / (10 ** precision);
        if (Math.abs(result) === 10) {
            result /= 10;
            digits++;
        }

        let formated = settings.padding ? result.toFixed(precision) : `${result}`;
        if (type === 'input') { return `${formated}e${digits}`; }
        formated = `${formated.replace('.', globalSave.format[0])}e${digits}`;
        return extra !== undefined ? `${formated} ${extra}` : formated;
    }

    const precision = settings.digits ?? Math.max(4 - Math.floor(Math.log10(Math.max(inputAbs, 1))), 0);
    const result = Math.round(input * 10 ** precision) / 10 ** precision;

    let formated = settings.padding ? result.toFixed(precision) : `${result}`;
    if (type === 'input') { return formated; }
    formated = formated.replace('.', globalSave.format[0]);
    if (result >= 1e3) { formated = formated.replace(/\B(?=(\d{3})+(?!\d))/, globalSave.format[1]); }
    return extra !== undefined ? `${formated} ${extra}` : formated;
};

/** Default value for extra is 'normal'. Use 'soft' when Stage remained same and 'reload' after full reset */
export const stageUpdate = (extra = 'normal' as 'normal' | 'soft' | 'reload') => {
    const { stageInfo, buildingsInfo } = global;
    const { active, current, true: highest, resets } = player.stage;
    const vacuum = player.inflation.vacuum;
    const challenge = player.challenges.active;

    stageInfo.activeAll = [vacuum ? 1 : current];
    const activeAll = stageInfo.activeAll;
    if (vacuum) {
        if (player.researchesExtra[1][2] >= 2) { activeAll.push(2); }
        if (player.researchesExtra[1][2] >= 1) { activeAll.push(3); }
        if (player.accretion.rank >= 6) { activeAll.push(4); }
        if (current >= 5 && player.strangeness[5][5] >= 1) { activeAll.push(5); }
    } else {
        if (current === 5) { activeAll.unshift(4); }
        for (let i = player.strangeness[5][0]; i >= 1; i--) {
            if (current !== i) { activeAll.unshift(i); }
        }
    }

    for (let s = 1; s <= 7; s++) {
        for (const element of getClass(`stage${s}Only`)) {
            element.style.display = active === s ? '' : 'none';
        }
        for (const element of getClass(`stage${s}Include`)) {
            element.style.display = activeAll.includes(s) ? '' : 'none';
        }
        for (const element of getClass(`stage${s}Unlock`)) {
            element.style.display = highest >= s ? '' : 'none';
        }
    }

    const stageWord = getId('stageWord');
    const stageStatus = getId('stageStatus');
    if (challenge === -1) {
        stageStatus.textContent = 'Current Stage:';
        stageStatus.style.color = '';
        stageWord.textContent = stageInfo.word[current];
        stageWord.style.color = `var(--${stageInfo.textColor[current]}-text)`;
    } else {
        stageStatus.textContent = 'Currently inside:';
        stageStatus.style.color = 'var(--red-text)';
        stageWord.textContent = global.challengesInfo.name[challenge];
        stageWord.style.color = `var(--${global.challengesInfo.color[challenge]}-text)`;
    }

    getId('stageSelect').style.display = activeAll.length > 1 ? '' : 'none';
    if (player.strange[0].total <= 0 && (!vacuum || current < 5)) { getId('strangenessTabBtn').style.display = 'none'; }
    if (vacuum) {
        getId('stageReset').textContent = current >= 5 ? 'Return back to start' : 'Not ready for reset';
        if (resets >= 1 || highest >= 7) {
            getId('dischargeToggleReset').style.display = '';
            getId('vaporizationToggleReset').style.display = '';
            getId('rankToggleReset').style.display = '';
            getId('collapseToggleReset').style.display = '';
        }
    } else {
        for (let s = 2; s <= 4; s++) {
            const unlocked = highest >= 6 || resets >= s + 3;
            getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}${s}`).style.display = unlocked ? '' : 'none';
            getId(`milestone1Stage${s}Div`).style.display = unlocked ? '' : 'none';
            getId(`milestone2Stage${s}Div`).style.display = unlocked ? '' : 'none';
        }
    }

    if (extra === 'soft') {
        numbersUpdate();
        visualUpdate();
        return;
    }
    if (globalSave.MDSettings[0]) {
        getId('reset1Footer').textContent = specialHTML.resetHTML[active];
        if (extra === 'reload') { MDStrangenessPage(1); }
    }
    if (globalSave.SRSettings[0]) { //Firefox only recently (24.10.2023) added aria shortcuts (.ariaLabel)
        getId('reset1Main').setAttribute('aria-label', `${specialHTML.resetHTML[active]} reset (hotkey ${['', 'D', 'V', 'R', 'C', ''][active]})`);
        for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
            getId(`building${i}`).setAttribute('aria-label', `${buildingsInfo.name[active][i]} (hotkey ${i})`);
        }
        getId('extraResearches').setAttribute('aria-label', `${['', 'Energy', 'Cloud', 'Rank', 'Collapse', 'Galaxy'][active]} Researches`);
        getId('SRStage').textContent = `Current active Stage is '${stageInfo.word[active]}'${challenge !== -1 ? ` inside the '${global.challengesInfo.name[challenge]}'` : ''}`;
    }

    for (const text of ['upgrade', 'element']) {
        getId(`${text}Text`).textContent = 'Hover to see.';
        getId(`${text}Effect`).textContent = 'Hover to see.';
        getId(`${text}Cost`).textContent = 'Resource.';
    }
    if (extra === 'reload') {
        for (let s = 1; s <= 5; s++) {
            getId(`${stageInfo.word[s]}Switch`).style.textDecoration = active === s ? 'underline' : '';
            global.lastUpgrade[s][0] = -1;
        }
        global.lastElement = -1;
        global.lastStrangeness = [-1, -1];
        global.lastMilestone = [-1, -1];
        global.debug.historyStage = -1;
        for (const text of ['strangeness', 'milestones']) {
            getId(`${text}Stage`).textContent = '';
            getId(`${text}Text`).textContent = 'Hover to see.';
        }
        getId('strangenessEffect').textContent = 'Hover to see.';
        getId('strangenessCost').textContent = 'Strange quarks.';
        getId('milestonesMultiline').innerHTML = '<p class="orchidText">Requirement: <span class="greenText">Hover to see.</span></p><p class="darkvioletText">Unlock: <span class="greenText">Hover to see.</span></p>';
        global.lastChallenge = [player.inflation.vacuum && player.strangeness[5][0] >= 1 ? 0 : -1, -1];
        getChallengeDescription(global.lastChallenge[0]);

        global.trueActive = active;
        for (let i = 0; i < global.elementsInfo.startCost.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
        setRemnants();

        autoUpgradesSet('all');
        autoResearchesSet('researches', 'all');
        autoResearchesSet('researchesExtra', 'all');
        autoElementsSet();
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
        if (vacuum) {
            showU.push(0, 1);
            showRE.push(0, 2);
            getId('extraResearches').style.display = '';
        } else {
            getId('upgrade1').style.display = 'none';
            getId('upgrade2').style.display = 'none';
            getId('extraResearches').style.display = 'none';
        }
    } else if (active === 2) {
        showU.push(0);
        showR.push(0, 1);
        showRE.push(0, 1);
        showF.push(1, 2);
        if (vacuum) { getId('stageInfo').style.display = ''; }
    } else if (active === 3) {
        showU.push(0, 1);
        showR.push(0, 1);
        showRE.push(0);
        showF.push(0);
        global.debug.rankUpdated = -1;
        getId('reset1Main').style.display = '';
        getId('stageInfo').style.display = vacuum ? '' : 'none';
    } else if (active === 4) {
        showU.push(0, 1, 2);
        showR.push(0, 1, 2);
        showRE.push(0);
        showF.push(0, 1);
        getId('stageInfo').style.display = '';
        getId('extraResearches').style.display = '';
    } else if (active === 5) {
        showRE.push(0);
        showF.push(0, 1, 2);
        getId('reset1Main').style.display = 'none';
        getId('stageInfo').style.display = '';
        if (vacuum) {
            getId('building2').style.display = '';
            showU.push(0, 1);
            showR.push(0, 1);
            getId('extraResearches').style.display = '';
        }
    }
    getId('buildings').style.display = '';
    getId('building1').style.display = '';
    getId('upgrades').style.display = '';
    getId('researches').style.display = '';
    getId('stageResearches').style.display = '';
    if (active !== 4) { getId('specials').style.display = 'none'; }
    (getId('autoWaitInput') as HTMLInputElement).value = format(player.toggles.shop.wait[active], { type: 'input' });

    const buildingHTML = specialHTML.buildingHTML[active];
    const buildingName = buildingsInfo.name[active];
    const buildingType = buildingsInfo.type[active];
    const buildingHoverText = buildingsInfo.hoverText[active];
    for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
        (getId(`building${i}Image`) as HTMLImageElement).src = `Used_art/${buildingHTML[i - 1]}`;
        getId(`building${i}StatName`).textContent = buildingName[i];
        getId(`building${i}Name`).textContent = buildingName[i];
        getQuery(`#building${i}ProdDiv > span`).textContent = buildingType[i];
        getId(`building${i}ProdDiv`).title = buildingHoverText[i - 1];
        toggleSwap(i, 'buildings');
    }
    getId('building0StatName').textContent = buildingName[0];
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
        getId(`footerStat${i + 1}Name`).textContent = footerStatsHTML[i][2];
    }

    const body = document.body.style;
    if (active === 1) {
        body.removeProperty('--stage-text');
        body.removeProperty('--stage-button-border');
        body.removeProperty('--stage-image-borderColor');
        body.removeProperty('--image-border');
    } else {
        body.setProperty('--stage-text', `var(--${stageInfo.textColor[active]}-text)`);
        body.setProperty('--stage-button-border', stageInfo.buttonBorder[active]);
        body.setProperty('--stage-image-borderColor', stageInfo.imageBorderColor[active]);
        body.setProperty('--image-border', `url("Used_art/Stage${active} border.png")`);
    }
    getId('currentSwitch').textContent = stageInfo.word[active];

    if (global.trueActive === active) { switchTab(checkTab(global.tab) ? global.tab : 'stage'); }
    switchTheme();
};
