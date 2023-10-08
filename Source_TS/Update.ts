import { checkTab } from './Check';
import Limit from './Limit';
import { getClass, getId, getQuery } from './Main';
import { global, player } from './Player';
import { playEvent, assignWithNoMove, specialHTML, switchTheme } from './Special';
import { autoElementsBuy, autoElementsSet, autoResearchesBuy, autoResearchesSet, autoUpgradesBuy, autoUpgradesSet, buyBuilding, calculateBuildingsCost, calculateGainedBuildings, assignBuildingInformation, collapseResetCheck, dischargeResetCheck, rankResetCheck, stageResetCheck, toggleSwap, vaporizationResetCheck, assignDischargeInformation, assignVaporizationInformation, assignCollapseInformation, shiftRange, calculateGainedStrangeness, switchStage } from './Stage';
import { overlimit } from './Types';
import { updateUnknown } from './Vacuum';

export const switchTab = (tab: string, subtab = null as null | string) => {
    if (subtab === null) {
        const oldTab = global.tab;
        getId(`${oldTab}Tab`).style.display = 'none';
        getId(`${oldTab}TabBtn`).classList.remove('tabActive');
        if (Object.hasOwn(global.tabList, `${oldTab}Subtabs`)) {
            for (const inside of global.tabList[`${oldTab as 'stage'}Subtabs`]) {
                getId(`${oldTab}SubtabBtn${inside}`).style.display = 'none';
            }
        }

        global.tab = tab;
        let subtabAmount = 0;
        getId(`${tab}Tab`).style.display = '';
        getId(`${tab}TabBtn`).classList.add('tabActive');
        if (Object.hasOwn(global.tabList, `${tab}Subtabs`)) {
            for (const inside of global.tabList[`${tab as 'stage'}Subtabs`]) {
                if (checkTab(tab, inside)) {
                    getId(`${tab}SubtabBtn${inside}`).style.display = '';
                    subtabAmount++;
                } else {
                    if (global.subtab[`${tab as 'stage'}Current`] === inside) {
                        switchTab(tab, global.tabList[`${tab as 'stage'}Subtabs`][0]);
                    }
                }
            }
        }
        getId('subtabs').style.display = subtabAmount > 1 ? '' : 'none';
        if (global.screenReader[0]) { getId('SRTab').textContent = `Current tab is '${tab}'${subtabAmount > 1 ? ` and subtab is '${global.subtab[`${tab as 'stage'}Current`]}'` : ''}`; }
    } else {
        const oldSubtab = global.subtab[`${tab as 'stage'}Current`];
        getId(`${tab}Subtab${oldSubtab}`).style.display = 'none';
        getId(`${tab}SubtabBtn${oldSubtab}`).classList.remove('tabActive');

        global.subtab[`${tab as 'stage'}Current`] = subtab;
        getId(`${tab}Subtab${subtab}`).style.display = '';
        getId(`${tab}SubtabBtn${subtab}`).classList.add('tabActive');
        if (global.screenReader[0]) { getId('SRTab').textContent = `Current subtab is '${subtab}', part of '${tab}' tab`; }
    }

    if (global.lastActive !== null) {
        switchStage(global.lastActive);
        global.lastActive = null;
    } else if (tab === 'Elements' || (tab === 'research' && (global.subtab.researchCurrent === 'Elements' || subtab === 'Elements'))) {
        const active = player.stage.active;
        if (active !== 4 && active !== 5) {
            global.lastActive = active;
            switchStage(4);
        }
    }
    visualUpdate();
    numbersUpdate();
};

//In seconds
export const maxOfflineTime = (): number => (7200 * Math.min(player.stage.true, 4) + 14400 * player.strangeness[2][6]) * (player.stage.true >= 6 ? 2 : 1 + 0.5 * player.strangeness[2][7]);
export const maxExportTime = (): number => player.stage.true >= 6 ? 172800 : 86400 * (1 + player.strangeness[4][8]);
export const exportMultiplier = (): number => {
    let mult = 1;
    if (player.stage.true >= 6 && player.strangeness[4][8] >= 1) { mult += Math.ceil(player.stage.best / 20); }
    if (!player.inflation.vacuum) { mult += global.strangeInfo.instability; }
    mult *= player.strangeness[4][7] + 1;
    return mult;
};

export const timeUpdate = (timeWarp = 0) => { //Time based information
    const { auto, buildings: autoBuy } = player.toggles;
    const { vacuum } = player.inflation;
    const { maxActive, type } = global.buildingsInfo;
    const { autoU, autoR, autoE, elements: autoElements } = global.automatization;

    let passedSeconds: number;
    if (timeWarp > 0) {
        const extraTime = Math.min(60, timeWarp);
        passedSeconds = extraTime;
        timeWarp -= extraTime;
    } else {
        const { time } = player;

        const currentTime = Date.now();
        passedSeconds = (currentTime - time.updated) / 1000;
        time.updated = currentTime;
        global.lastSave += passedSeconds;
        player.stage.export = Math.min(player.stage.export + passedSeconds, maxExportTime());
        if (time.offline < -28800 || passedSeconds < 0) {
            time.offline += passedSeconds;
            if (passedSeconds > 0 && time.offline > -28800) { time.offline = -28800; }
            return;
        } else if (passedSeconds > 60) {
            timeWarp = passedSeconds - 60;
            passedSeconds = 60;
        } else if (time.offline > 0 && player.toggles.normal[0] && player.strangeness[1][7] >= 2) {
            const extraTime = Math.min(Math.max(time.offline / 3600, 1) * passedSeconds, time.offline);
            time.offline -= Math.min(extraTime * (8 - (player.stage.true >= 6 ? player.strangeness[2][7] : 0)), time.offline);
            passedSeconds += extraTime;
        }
    }
    player.stage.time += passedSeconds;
    player.inflation.age += passedSeconds;

    if (vacuum && auto[0]) { stageResetCheck(5, true); }
    for (let i = 0; i < player.strangeness[5][10]; i++) {
        calculateGainedStrangeness(i, passedSeconds);
    }
    assignBuildingInformation();
    for (const s of global.stageInfo.activeAll) {
        if (!vacuum && auto[0]) { stageResetCheck(s, true); }
        if (s === 4) {
            if (auto[4]) { collapseResetCheck(true); }
            if (autoElements.length !== 0) { autoElementsBuy(); }
        } else if (s === 3) {
            if (auto[3]) { rankResetCheck(true); }
        } else if (s === 2) {
            if (auto[2]) { vaporizationResetCheck(true); }
        } else if (s === 1) {
            if (auto[1]) { dischargeResetCheck('interval'); }
        }

        if (autoU[s].length !== 0) { autoUpgradesBuy(s); }
        if (autoR[s].length !== 0) { autoResearchesBuy('researches', s); }
        if (autoE[s].length !== 0) { autoResearchesBuy('researchesExtra', s); }

        for (let i = maxActive[s] - 1; i >= 1; i--) {
            if (autoBuy[s][i] && player.ASR[s] >= i) { buyBuilding(i, s, true); }
            if (type[s][i] === 'producing') {
                calculateGainedBuildings(i - 1, s, passedSeconds);
            }
        }
        if (s === 1) { //Molecules from Radiation
            if (player.upgrades[1][8] === 1) { calculateGainedBuildings(vacuum ? 5 : 3, 1, passedSeconds); }
        } else if (s === 5) { //Stars from Nebulas
            const research = player.researches[5][0];

            if (research >= 1) { calculateGainedBuildings(1, 5, passedSeconds); }
            if (research >= 2) { calculateGainedBuildings(2, 5, passedSeconds); }
            if (research >= 3) { calculateGainedBuildings(3, 5, passedSeconds); }
        }
    }

    if (timeWarp > 0) { timeUpdate(timeWarp); }
};

export const numbersUpdate = () => { //This is for relevant visual info
    const { tab, subtab } = global;
    const active = player.stage.active;
    const buildings = player.buildings[active];

    if (global.footer) {
        if (active === 1) {
            getId('footerStat1Span').textContent = Limit(buildings[0].current).format({ padding: true });
            getId('footerStat2Span').textContent = format(player.discharge.energy);
        } else if (active === 2) {
            getId('footerStat1Span').textContent = Limit(player.vaporization.clouds).format({ padding: true });
            getId('footerStat2Span').textContent = Limit(buildings[0].current).format({ padding: true });
            getId('footerStat3Span').textContent = Limit(buildings[1].current).format({ padding: buildings[2].current[0] > 0 });
        } else if (active === 3) {
            getId('footerStat1Span').textContent = Limit(buildings[0].current).format({ padding: true });
        } else if (active === 4 || active === 5) {
            const stars = player.buildings[4];

            getId('footerStat1Span').textContent = format(player.collapse.mass, { padding: true });
            getId('footerStat2Span').textContent = Limit(stars[0].current).format({ padding: true });
            if (active === 5) {
                getId('footerStat3Span').textContent = Limit(stars[1].current).plus(stars[2].current, stars[3].current, stars[4].current, stars[5].current).format({ padding: true });
            }
        }
    }
    if (tab === 'stage') {
        if (subtab.stageCurrent === 'Structures') {
            const { buildingsInfo } = global;
            const howMany = player.stage.resets < 1 && player.discharge.current < 1 ? 1 : player.toggles.shop.howMany;

            for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
                const trueCountID = getId(`building${i}True`);
                assignWithNoMove(getId(`building${i}Cur`), Limit(buildings[i].current).format({ padding: trueCountID.style.display !== 'none' }));
                getId(`building${i}Prod`).textContent = Limit(buildingsInfo.producing[active][i]).format({ padding: true });
                trueCountID.textContent = `[${format(buildings[i as 1].true)}]`;

                if ((active === 4 && player.collapse.mass < global.collapseInfo.unlockB[i]) ||
                    (active === 5 && i < 3 && player.collapse.mass < global.collapseInfo.unlockG[i])) {
                    getId(`building${i}`).classList.remove('availableBuilding');
                    getId(`building${i}Btn`).textContent = `Unlocked at ${format(global.collapseInfo[active === 4 ? 'unlockB' : 'unlockG'][i])} Mass`;
                    getId(`building${i}BuyX`).textContent = 'Locked';
                    continue;
                }

                let costName: string;
                let currency: number | overlimit;
                let free = false;
                if (active === 5 && i === 3) { //Galaxy
                    costName = 'Mass';
                    currency = player.collapse.mass;
                } else {
                    let e = i - 1;
                    let extra = active;
                    if (active === 1) {
                        if (i === 1 && player.inflation.vacuum) { free = player.strangeness[1][10] >= 1; }
                    } else if (active === 2) {
                        if (i !== 1) { e = 1; }
                    } else if (active >= 3) {
                        e = 0;
                        if (active === 5) { extra = 4; }
                    }

                    costName = buildingsInfo.name[extra][e];
                    currency = player.buildings[extra][e].current;
                }

                let totalBuy = 1;
                let totalCost = calculateBuildingsCost(i, active); //This updates cost information
                if (howMany !== 1) {
                    const increase = buildingsInfo.increase[active][i];
                    const firstCost = buildingsInfo.firstCost[active][i];
                    if (free) {
                        totalBuy = howMany === -1 ? Math.max(Math.floor(Limit(currency).divide(firstCost).log(increase).toNumber()) - buildings[i as 1].true + 1, 1) : howMany;
                        if (totalBuy > 1) { totalCost = Limit(increase).power(totalBuy + buildings[i as 1].true - 1).multiply(firstCost).toArray(); }
                    } else {
                        const totalBefore = Limit(increase).power(buildings[i as 1].true).minus('1').divide(increase - 1).multiply(firstCost).toArray();

                        totalBuy = howMany === -1 ? Math.max(Math.floor(Limit(totalBefore).plus(currency).multiply(increase - 1).divide(firstCost).plus('1').log(increase).toNumber()) - buildings[i as 1].true, 1) : howMany;
                        if (totalBuy > 1) { totalCost = Limit(increase).power(totalBuy + buildings[i as 1].true).minus('1').divide(increase - 1).multiply(firstCost).minus(totalBefore).toArray(); }
                    }
                }

                getId(`building${i}BuyX`).textContent = format(totalBuy);
                if (Limit(totalCost).lessOrEqual(currency)) {
                    getId(`building${i}`).classList.add('availableBuilding');
                    getId(`building${i}Btn`).textContent = `Make for: ${Limit(totalCost).format({ padding: true })} ${costName}`;
                } else {
                    getId(`building${i}`).classList.remove('availableBuilding');
                    getId(`building${i}Btn`).textContent = `Need: ${Limit(totalCost).format({ padding: true })} ${costName}`;
                }
            }
            if (active === 1) {
                assignDischargeInformation();
                const effect = getId('dischargeEffect', false);
                if (effect !== null) { effect.textContent = format(global.upgradesInfo[1].effect[5] as number); }
                getId('reset1Button').textContent = `Next goal is ${format(global.dischargeInfo.next)} Energy`;
            } else if (active === 2) {
                assignVaporizationInformation();
                getId('reset1Button').textContent = global.vaporizationInfo.get[0] !== 0 ? `Reset for ${Limit(global.vaporizationInfo.get).format({ padding: true })} Clouds` : `Waiting for ${format(global.vaporizationInfo.effect2U2(), { padding: true })} Drops`;
            } else if (active === 3) {
                const rankCost = global.accretionInfo.rankCost[player.accretion.rank];
                if (rankCost !== 0) { getId('reset1Button').textContent = `Next Rank is ${format(rankCost)} Mass`; }
            } else if (active === 4) {
                const { collapse } = player;
                const { collapseInfo } = global;
                assignCollapseInformation();

                getId('reset1Button').textContent = `Collapse to ${format(collapseInfo.newMass, { padding: true })} Mass`;
                for (let i = 1; i <= 3; i++) {
                    getId(`starSpecial${i}Cur`).textContent = format(collapse.stars[i - 1]);
                    getId(`starSpecial${i}Get`).textContent = format(collapseInfo.starCheck[i - 1]);
                }
            }

            getId('stageTime').textContent = format(player.stage.time, { type: 'time' });
            if (player.time.offline > 0 && player.toggles.normal[0] && player.strangeness[1][7] >= 2) {
                const time = Math.max(player.time.offline / 3600, 1);
                getId('offlineBoostEffect').textContent = `+${format(time * 1, { digits: 0 })} seconds`;
                getId('offlineBoostWaste').textContent = `${format(time * (8 - (player.stage.true >= 6 ? player.strangeness[2][7] : 0)), { digits: 0 })} seconds`;
            }
            if (global.lastUpgrade[active] >= 0) { getUpgradeDescription(global.lastUpgrade[active], 'upgrades'); }
        } else if (subtab.stageCurrent === 'Advanced') {
            if (!player.inflation.vacuum) { getId('vacuumEffect').textContent = format(global.strangeInfo.instability); }
            getId('universeAge').textContent = format(player.inflation.age, { type: 'time' });
        }
    } else if (tab === 'research' || tab === 'Elements') {
        const trueSubtab = tab === 'Elements' ? tab : subtab.researchCurrent;
        if (trueSubtab === 'Researches') {
            if (global.lastResearch[active][0] >= 0) { getUpgradeDescription(global.lastResearch[active][0], global.lastResearch[active][1]); }
        } else if (trueSubtab === 'Elements') {
            if (global.lastElement >= 1) { getUpgradeDescription(global.lastElement, 'elements'); }
        }
    } else if (tab === 'strangeness') {
        if (subtab.strangenessCurrent === 'Matter') {
            const stageGain = global.strangeInfo.gain(active) / 1e12 ** player.strangeness[5][10];
            getId('strangeGain').textContent = `${format(stageGain)} ${global.strangeInfo.name[player.strangeness[5][10]]}`;
            getId('strangeTime').textContent = `${format(stageGain / player.stage.time, { padding: true })} per second`;
            getId('strangeBoost').textContent = global.strangeInfo.stageBoost[active] !== null ? format(global.strangeInfo.stageBoost[active] as number, { padding: true }) : 'none';
            getId('strange0Cur').textContent = format(player.strange[0].current);
            getId('strange1Cur').textContent = format(player.strange[1].current);
        }
    } else if (tab === 'settings') {
        if (subtab.settingsCurrent === 'Settings') {
            assignWithNoMove(getId('exportGain'), format(player.stage.export * exportMultiplier() / 86400 / 1e12 ** player.strangeness[5][10], { padding: true }));
            if (global.lastSave >= 1) { getId('isSaved').textContent = `${format(global.lastSave, { type: 'time' })} ago`; }
            getId('massShiftCur').textContent = format(global.inflationInfo.massCap);
            getId('massShiftMin').textContent = format(shiftRange(false));
            getId('massShiftMax').textContent = format(shiftRange());
        } else if (subtab.settingsCurrent === 'Stats') {
            const maxTimeExp = maxExportTime();

            getId('firstPlay').textContent = `${new Date(player.time.started).toLocaleString()} (${format((Date.now() - player.time.started) / 1000, { type: 'time' })} ago)`;
            getId('stageResetsCount').textContent = format(player.stage.resets);
            getId('stageBestGain').textContent = format(player.stage.best);
            getId('offlineStat').textContent = format(Math.max(player.time.offline, 0), { type: 'time' });
            getId('maxOfflineStat').textContent = format(maxOfflineTime(), { type: 'time' });
            getId('maxExportStat').textContent = format(exportMultiplier() * maxTimeExp / 86400 / 1e12 ** player.strangeness[5][10]);
            getId('maxExportTime').textContent = format(maxTimeExp, { type: 'time' });
            if (active === 1) {
                getId('maxEnergyStat').textContent = format(player.discharge.energyMax);
                getId('dischargeStat').textContent = format(player.discharge.current + global.dischargeInfo.bonus);
                getId('dischargeStatTrue').textContent = `[${format(player.discharge.current)}]`;
                if (player.strangeness[1][11] < 1) { getId('energyStatTrue').textContent = format(global.dischargeInfo.energyTrue); }
                if (player.inflation.vacuum) {
                    assignWithNoMove(getId('preonCapStat'), Limit(global.inflationInfo.preonCap).format({ padding: true }));
                    assignWithNoMove(getId('preonCapTill'), Limit(global.inflationInfo.preonTrue).divide(global.inflationInfo.preonCap).format({ padding: true }));
                }
            } else if (active === 2) {
                assignVaporizationInformation();
                const before = global.vaporizationInfo.cloudEffect();
                assignWithNoMove(getId('cloudsEffectCurrent'), Limit(before).format({ padding: true }));
                assignWithNoMove(getId('cloudsEffectAfter'), `x${Limit(global.vaporizationInfo.cloudEffect(true)).divide(before).format({ padding: true })}`);
                getId('maxCloudsStat').textContent = Limit(player.vaporization.cloudsMax).format();

                if (player.inflation.vacuum) {
                    const moles = player.buildings[1][5];

                    buildings[0].total = Limit(moles.total).divide('6.02214076e23').toArray();
                    buildings[0].trueTotal = Limit(moles.trueTotal).divide('6.02214076e23').toArray();
                    buildings[0].highest = Limit(moles.highest).divide('6.02214076e23').toArray();

                    assignWithNoMove(getId('oceanWorldEffect'), format(global.vaporizationInfo.oceanWorld(), { padding: true }));
                }
            } else if (active === 3) {
                getId('effectiveRank').textContent = format(global.accretionInfo.effective);
                if (player.inflation.vacuum) {
                    const mass = player.buildings[1][0];

                    buildings[0].total = Limit(mass.total).multiply('1.78266192e-33').toArray();
                    buildings[0].trueTotal = Limit(mass.trueTotal).multiply('1.78266192e-33').toArray();
                    buildings[0].highest = Limit(mass.highest).multiply('1.78266192e-33').toArray();

                    assignWithNoMove(getId('dustCapStat'), Limit(global.inflationInfo.dustCap).format({ padding: true }));
                    assignWithNoMove(getId('dustCapTill'), Limit(global.inflationInfo.dustTrue).divide(global.inflationInfo.dustCap).format({ padding: true }));
                }
            } else if (active === 4 || active === 5) {
                getId('maxSolarMassStat').textContent = format(player.collapse.massMax);
                if (player.inflation.vacuum) {
                    assignCollapseInformation();
                    assignWithNoMove(getId('mainCapStat'), Limit(global.buildingsInfo.producing[1][1]).multiply('8.96499278339628e-67', global.inflationInfo.massCap).format({ padding: true }));
                    getId('mainCapLimit').textContent = format(global.inflationInfo.massCap, { type: 'time' });
                }
                if (active === 4) {
                    const { starEffect, massEffect } = global.collapseInfo;

                    const before = massEffect();
                    assignWithNoMove(getId('starMassStatCurrent'), format(before, { padding: true }));
                    assignWithNoMove(getId('starMassStatAfter'), `x${format(massEffect(true) / before, { padding: true })}`);
                    for (let i = 0; i <= 2; i++) {
                        const before = starEffect[i]();
                        assignWithNoMove(getId(`star${i + 1}StatCurrent`), format(before, { padding: true }));
                        assignWithNoMove(getId(`star${i + 1}StatAfter`), `x${format(starEffect[i](true) / before, { padding: true })}`);
                    }
                } else if (active === 5) {
                    getId('starsStatTrue').textContent = format(global.collapseInfo.trueStars);
                    const stars = player.buildings[4];

                    buildings[0].current = Limit(stars[1].current).plus(stars[2].current, stars[3].current, stars[4].current, stars[5].current).toArray();
                    buildings[0].total = Limit(stars[1].total).plus(stars[2].total, stars[3].total, stars[4].total, stars[5].total).toArray();
                    buildings[0].trueTotal = Limit(stars[1].trueTotal).plus(stars[2].trueTotal, stars[3].trueTotal, stars[4].trueTotal, stars[5].trueTotal).toArray();
                    buildings[0].highest = Limit(stars[1].highest).plus(stars[2].highest, stars[3].highest, stars[4].highest, stars[5].highest).toArray();
                }
            }
            for (let i = 0; i < buildings.length; i++) {
                getId(`building${i}StatTotal`).textContent = Limit(buildings[i].total).format();
                getId(`building${i}StatTrueTotal`).textContent = Limit(buildings[i].trueTotal).format();
                getId(`building${i}StatHighest`).textContent = Limit(buildings[i].highest).format();
            }

            const { strange } = player;
            const strangeMax = Math.floor(strange[1].current * 1e12);
            for (let i = 0; i < strange.length; i++) {
                getId(`strange${i}StatTotal`).textContent = format(strange[i].total);
            }
            getId('strange0StatProd').textContent = format(strangeMax);
            getId('strange1StatProd').textContent = format(Math.max(1, (strangeMax - strange[0].current) / 600), { padding: true });
        }
    }
};

export const visualUpdate = () => { //This is what can appear/disappear when inside Stage
    const { tab, subtab } = global;
    const active = player.stage.active;

    if (global.footer && !player.toggles.normal[2]) {
        const check = getId('ElementsTabBtn', false);
        if (check !== null) { check.style.display = player.upgrades[4][1] === 1 ? '' : 'none'; }
    }
    if (active === 1) {
        if (global.footer && player.stage.resets < 1) {
            getId('footerStat2').style.display = player.discharge.energyMax >= (player.inflation.vacuum ? 36 : 9) ? '' : 'none';
            getId('researchTabBtn').style.display = player.discharge.current >= 4 ? '' : 'none';
        }
        if (!player.events[0] && player.upgrades[1][6] === 1) { playEvent(0, 0); }
    } else if (active === 2) {
        if (global.footer) { getId('footerStat1').style.display = player.upgrades[2][2] === 1 ? '' : 'none'; }
        if (!player.events[0]) {
            assignVaporizationInformation();
            if (Limit(global.vaporizationInfo.get).plus(player.vaporization.clouds).moreThan('1e4')) { playEvent(1, 0); }
        }
    } else if (active === 3) {
        if (!player.events[0] && Limit(player.buildings[3][0].current).moreOrEqual('5e29')) { playEvent(2, 0); }
    } else if (active === 4) {
        if (!player.events[0] && player.elements[1] > 0) { playEvent(3, 0); }
    }

    if (tab === 'stage') {
        if (subtab.stageCurrent === 'Structures') {
            const buildings = player.buildings[active];
            const multiMake = player.stage.resets >= 1 || player.discharge.current >= 1;
            const offline = player.time.offline;
            const ASR = player.ASR[active];

            if (!player.inflation.vacuum) {
                const resetMessage = active >= 4 ? 'Return back to start' : active === player.stage.current ? 'Enter next Stage' : 'Reset this Stage';
                const failMessage = (active >= 4 ? player.strange[0].total === 0 : active === player.stage.current) ? 'Not ready for more' : 'Not ready for reset';
                getId('stageReset').textContent = (active >= 4 ? player.events[1] && player.stage.current >= 5 : stageResetCheck(active)) ? resetMessage : failMessage;
            }

            getId('toggleBuy').style.display = multiMake ? '' : 'none';
            getId('autoWaitInput').style.display = player.strangeness[1][7] >= 1 ? '' : 'none';
            getId('toggleBuilding0').style.display = player.strangeness[1][7] >= 1 ? '' : 'none';
            getId('offlineBoost').style.display = offline > 0 && player.toggles.normal[0] && player.strangeness[1][7] >= 2 ? '' : 'none';
            if ((offline > 0 && offline >= maxOfflineTime()) || offline < -28800) {
                getId('offlineWarning').textContent = offline < 0 ? `Due to time manipulation game is disabled until ${new Date(Date.now() - (offline + 28800) * 1000).toLocaleString()}` : 'Offline storage is full';
                getId('offlineWarning').className = offline < 0 ? 'redText' : 'orangeText';
                getId('offlineWarning').style.display = '';
            } else { getId('offlineWarning').style.display = 'none'; }
            for (let i = 1; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}True`).style.display = Limit(buildings[i].current).notEqual(buildings[i as 1].true) ? '' : 'none';
                getId(`toggleBuilding${i}`).style.display = ASR >= i ? '' : 'none';
                getId(`building${i}BuyDiv`).style.display = multiMake ? '' : 'none';
            }
            if (active === 1) {
                const first3Discharges = player.discharge.current >= 3;

                getId('reset1Main').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('building2').style.display = Limit(buildings[1].trueTotal).moreOrEqual(player.inflation.vacuum ? '4' : '11') ? '' : 'none';
                getId('building3').style.display = Limit(buildings[2].trueTotal).moreOrEqual('2') ? '' : 'none';
                if (player.inflation.vacuum) {
                    getId('building4').style.display = Limit(buildings[3].trueTotal).moreOrEqual('8') ? '' : 'none';
                    getId('building5').style.display = Limit(buildings[4].trueTotal).moreOrEqual('2') ? '' : 'none';
                }
                getId('upgrade7').style.display = first3Discharges ? '' : 'none';
                getId('upgrade8').style.display = first3Discharges ? '' : 'none';
                getId('upgrade9').style.display = first3Discharges ? '' : 'none';
                getId('upgrade10').style.display = first3Discharges ? '' : 'none';
                if (player.stage.resets < 1) { getId('upgrades').style.display = player.discharge.energyMax >= (player.inflation.vacuum ? 36 : 9) ? '' : 'none'; }
                if (player.stage.true < 2) {
                    getId('resetStage').style.display = player.upgrades[1][9] === 1 ? '' : 'none';
                    getId('stageTimeMain').style.display = player.upgrades[1][9] === 1 ? '' : 'none';
                }
            } else if (active === 2) {
                getId('reset1Main').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('building2').style.display = Limit(buildings[1].trueTotal).moreOrEqual('200') ? '' : 'none';
                getId('building3').style.display = Limit(buildings[1].trueTotal).moreOrEqual('4e6') ? '' : 'none';
                getId('building4').style.display = Limit(buildings[1].trueTotal).moreOrEqual('4e17') ? '' : 'none';
                getId('building5').style.display = Limit(buildings[1].trueTotal).moreOrEqual('4e22') ? '' : 'none';
                getId('upgrade2').style.display = buildings[2].trueTotal[0] > 0 ? '' : 'none';
                getId('upgrade3').style.display = buildings[3].trueTotal[0] > 0 ? '' : 'none';
                getId('upgrade4').style.display = buildings[2].trueTotal[0] > 0 ? '' : 'none';
                getId('upgrade5').style.display = buildings[2].trueTotal[0] > 0 ? '' : 'none';
                getId('upgrade6').style.display = buildings[3].trueTotal[0] > 0 ? '' : 'none';
                getId('upgrade7').style.display = buildings[4].trueTotal[0] > 0 ? '' : 'none';
                getId('upgrade8').style.display = buildings[5].trueTotal[0] > 0 && player.strangeness[2][2] >= 3 ? '' : 'none';
                if (player.inflation.vacuum) {
                    getId('building6').style.display = player.strangeness[2][9] >= 1 && Limit(buildings[1].trueTotal).moreOrEqual('8e24') ? '' : 'none';
                    //getId('upgrade9').style.display = buildings[6].trueTotal[0] > 0 && player.strangeness[2][9] >= 2 ? '' : 'none';
                }
            } else if (active === 3) {
                const upgrades = player.upgrades[3];
                getId('building2').style.display = upgrades[2] === 1 ? '' : 'none';
                getId('building3').style.display = upgrades[4] === 1 ? '' : 'none';
                getId('building4').style.display = upgrades[6] === 1 ? '' : 'none';
                if (player.inflation.vacuum) { getId('building5').style.display = upgrades[11] === 1 && player.strangeness[3][8] >= 1 && player.accretion.rank >= 5 ? '' : 'none'; }
                getId('upgrade4').style.display = buildings[2].trueTotal[0] > 0 ? '' : 'none';
                if (upgrades[4] === 1) { getId('upgrade6').style.display = ''; }
                getId('upgrade9').style.display = player.accretion.rank >= 4 && player.strangeness[3][2] >= 3 ? '' : 'none';
            } else if (active === 4) {
                const nova = player.researchesExtra[4][0];

                getId('starsSpecial').style.display = nova >= 1 ? '' : 'none';
                getId('starSpecial2').style.display = nova >= 2 ? '' : 'none';
                getId('starSpecial3').style.display = nova >= 3 ? '' : 'none';
                getId('reset1Main').style.display = player.upgrades[4][0] === 1 ? '' : 'none';
                getId('building2').style.display = nova >= 1 ? '' : 'none';
                getId('building3').style.display = nova >= 2 ? '' : 'none';
                getId('building4').style.display = nova >= 3 ? '' : 'none';
                if (player.inflation.vacuum) { getId('building5').style.display = player.strangeness[4][10] >= 1 && (player.collapse.stars[2] > 0 || player.collapse.mass >= 1000) ? '' : 'none'; }
                getId('upgrade4').style.display = player.strangeness[4][2] >= 1 ? '' : 'none';
            } else if (active === 5) {
                if (!player.inflation.vacuum) {
                    const nebula = player.milestones[2][0] >= 6;
                    const cluster = player.milestones[3][0] >= 7;

                    getId('buildings').style.display = nebula || cluster ? '' : 'none';
                    getId('building1').style.display = nebula ? '' : 'none';
                    getId('building2').style.display = cluster ? '' : 'none';
                    getId('upgrades').style.display = nebula || cluster ? '' : 'none';
                    getId('upgrade1').style.display = nebula ? '' : 'none';
                    getId('upgrade2').style.display = cluster ? '' : 'none';
                } else { getId('building4').style.display = 'none'; }
                getId('building3').style.display = player.strangeness[5][6] >= 1 ? '' : 'none';
                getId('upgrade3').style.display = buildings[3].true >= 1 ? '' : 'none';
            }
        } else if (subtab.stageCurrent === 'Advanced') {
            if (player.inflation.vacuum) {
                getId('challenge1').style.display = player.strangeness[5][0] >= 1 ? '' : 'none';
            }
        }
    } else if (tab === 'research' || tab === 'Elements') {
        const trueSubtab = tab === 'Elements' ? tab : subtab.researchCurrent;
        if (trueSubtab === 'Researches') {
            if (active === 1) {
                if (player.inflation.vacuum) {
                    getId('researchExtra2').style.display = player.researchesExtra[1][2] >= 2 ? '' : 'none';
                    getId('researchExtra4').style.display = player.researchesExtra[1][2] >= 1 ? '' : 'none';
                    getId('researchExtra5').style.display = player.accretion.rank >= 6 ? '' : 'none';
                    if (player.stage.resets < 1) { getId('extraResearch').style.display = player.discharge.current >= 5 ? '' : 'none'; }
                }
            } else if (active === 2) {
                const buildings = player.buildings[2];

                getId('extraResearch').style.display = player.vaporization.clouds[0] > 0 ? '' : 'none';
                getId('research2').style.display = buildings[2].trueTotal[0] > 0 ? '' : 'none';
                getId('research3').style.display = buildings[2].trueTotal[0] > 0 ? '' : 'none';
                getId('research4').style.display = buildings[2].trueTotal[0] > 0 ? '' : 'none';
                getId('research5').style.display = buildings[3].trueTotal[0] > 0 ? '' : 'none';
                getId('research6').style.display = buildings[4].trueTotal[0] > 0 ? '' : 'none';
                getId('researchExtra3').style.display = buildings[5].trueTotal[0] > 0 ? '' : 'none';
                getId('researchExtra4').style.display = player.accretion.rank >= 6 ? '' : 'none';
            } else if (active === 3) {
                if (player.upgrades[3][4] === 1) { getId('research7').style.display = ''; }
                getId('research3').style.display = player.buildings[3][2].trueTotal[0] > 0 ? '' : 'none';
                getId('research4').style.display = player.buildings[3][2].trueTotal[0] > 0 ? '' : 'none';
                if (player.inflation.vacuum) {
                    getId('researchExtra5').style.display = player.accretion.rank >= 3 && player.researchesExtra[1][2] >= 2 ? '' : 'none';
                }
            } else if (active === 4) {
                getId('research4').style.display = player.strangeness[4][2] >= 2 ? '' : 'none';
                getId('research5').style.display = player.collapse.stars[2] > 0 || player.buildings[5][3].true >= 1 ? '' : 'none';
                getId('researchExtra2').style.display = player.collapse.stars[0] > 0 || player.buildings[5][3].true >= 1 ? '' : 'none';
                getId('researchExtra3').style.display = player.strangeness[4][2] >= 3 ? '' : 'none';
            } else if (active === 5) {
                if (!player.inflation.vacuum) {
                    getId('stageResearch').style.display = player.milestones[2][0] >= 6 || player.milestones[3][0] >= 7 ? '' : 'none';
                    getId('research1').style.display = player.milestones[2][0] >= 6 ? '' : 'none';
                    getId('research2').style.display = player.milestones[3][0] >= 7 ? '' : 'none';
                }
            }
        } else if (trueSubtab === 'Elements') {
            const neutron = player.collapse.stars[1] > 0 || player.buildings[5][3].true >= 1;
            const upgrades = player.upgrades[4];
            const grid = getId('elementsGrid');

            grid.style.display = upgrades[2] === 1 ? '' : 'flex';
            for (let i = 6; i <= 10; i++) { getId(`element${i}`).style.display = upgrades[2] === 1 ? '' : 'none'; }
            upgrades[2] === 1 && !neutron ? grid.classList.add('Elements10App') : grid.classList.remove('Elements10App');
            for (let i = 11; i <= 26; i++) { getId(`element${i}`).style.display = neutron ? '' : 'none'; }
            getId('element27').style.display = upgrades[3] === 1 ? '' : 'none';
            getId('element28').style.display = upgrades[3] === 1 ? '' : 'none';
        }
    } else if (tab === 'strangeness') {
        if (subtab.strangenessCurrent === 'Matter') {
            const vacuum = player.inflation.vacuum;
            const bound = player.strangeness[5][5] >= 1;

            getId('strange1').style.display = player.strangeness[5][10] >= 1 ? '' : 'none';
            getId('strange4Stage5').style.display = (vacuum ? bound : player.milestones[2][0] >= 6) ? '' : 'none';
            getId('strange5Stage5').style.display = (vacuum ? bound : player.milestones[3][0] >= 7) ? '' : 'none';
            getId('strange8Stage5').style.display = (vacuum ? bound : player.milestones[2][0] >= 6 || player.milestones[3][0] >= 7) ? '' : 'none';
            getId('strange7Stage5').style.display = !vacuum && bound ? '' : 'none';
            if (vacuum) {
                const voidProgress = player.challenges.void;

                getId('strange10Stage1').style.display = voidProgress[1] >= 1 ? '' : 'none';
                getId('strange11Stage1').style.display = voidProgress[1] >= 2 ? '' : 'none';
                getId('strange12Stage1').style.display = voidProgress[4] >= 2 ? '' : 'none';
                getId('strange11Stage2').style.display = voidProgress[2] >= 1 ? '' : 'none';
                getId('strange12Stage2').style.display = voidProgress[2] >= 2 ? '' : 'none';
                getId('strange10Stage3').style.display = voidProgress[4] >= 4 ? '' : 'none';
                getId('strange11Stage3').style.display = voidProgress[1] >= 3 ? '' : 'none';
                getId('strange12Stage4').style.display = voidProgress[4] >= 3 ? '' : 'none';
                getId('strange9Stage5').style.display = voidProgress[4] >= 1 ? '' : 'none';
                getId('strange10Stage5').style.display = bound ? '' : 'none';
                getId('strange11Stage5').style.display = voidProgress[3] >= 5 ? '' : 'none';
            } else {
                const strange5 = player.milestones[4][0] >= 8;

                getId('strangeBoostMain').style.display = strange5 ? '' : 'none';
                getId('strange9Stage1').style.display = strange5 ? '' : 'none';
                getId('strange8Stage2').style.display = strange5 ? '' : 'none';
                getId('strange9Stage2').style.display = strange5 ? '' : 'none';
                getId('strange8Stage3').style.display = strange5 ? '' : 'none';
                getId('strange9Stage4').style.display = strange5 ? '' : 'none';
                getId('strange10Stage4').style.display = strange5 ? '' : 'none';
                getId('strangenessSection5').style.display = strange5 ? '' : 'none';
                getId('strange6Stage5').style.display = player.milestones[2][0] >= 6 || player.milestones[3][0] >= 7 ? '' : 'none';
            }
        } else if (subtab.strangenessCurrent === 'Milestones') {
            if (!player.inflation.vacuum) {
                getId('milestone1Stage5Div').style.display = player.strangeness[5][8] >= 1 ? '' : 'none';
                getId('milestone2Stage5Div').style.display = player.strangeness[5][8] >= 1 && player.strangeness[5][6] >= 1 ? '' : 'none';
            }
        }
    } else if (tab === 'settings') {
        if (subtab.settingsCurrent === 'Settings') {
            const { strangeness } = player;
            const { true: trueStage } = player.stage;

            getId('toggleAuto0').style.display = strangeness[5][2] >= 1 ? '' : 'none';
            getId('toggleAuto0Main').style.display = strangeness[5][2] >= 1 ? '' : 'none';
            getId('exportSpecial').style.display = player.strange[0].total > 0 ? '' : 'none';
            getId('exportType').textContent = global.strangeInfo.name[strangeness[5][10]];
            getId('saveNameMatter').style.display = strangeness[5][10] >= 1 ? '' : 'none';
            getId('allStructuresHotkey').style.display = strangeness[1][7] >= 1 ? '' : 'none';
            getId('toggle0').style.display = strangeness[1][7] >= 2 ? '' : 'none';
            getId('offlineHotkey').style.display = strangeness[1][7] >= 2 ? '' : 'none';
            getId('autoToggle5').style.display = strangeness[3][6] >= 1 ? '' : 'none';
            getId('autoToggle6').style.display = strangeness[3][6] >= 2 ? '' : 'none';
            getId('autoToggle7').style.display = strangeness[3][6] >= 3 ? '' : 'none';
            getId('autoToggle8').style.display = strangeness[4][4] >= 2 ? '' : 'none';
            getId('toggleAuto1').style.display = strangeness[1][3] >= 1 ? '' : 'none';
            getId('toggleAuto2').style.display = strangeness[2][4] >= 1 ? '' : 'none';
            getId('toggleAuto2Main').style.display = strangeness[2][4] >= 1 ? '' : 'none';
            getId('toggleAuto3').style.display = strangeness[3][4] >= 1 ? '' : 'none';
            getId('toggleAuto3Main').style.display = strangeness[3][9] >= 1 ? '' : 'none';
            getId('toggleAuto4').style.display = strangeness[4][5] >= 1 ? '' : 'none';
            getId('toggleAuto4Main').style.display = strangeness[4][5] >= 1 ? '' : 'none';
            getId('stageReward').textContent = global.strangeInfo.name[strangeness[5][10]];
            getId('collapseGalaxy').style.display = strangeness[5][6] >= 2 ? '' : 'none';
            if (trueStage < 2) { getId('resetToggles').style.display = player.discharge.current >= 1 ? '' : 'none'; }
            if (trueStage < 3) { getId('vaporizationToggleReset').style.display = player.vaporization.clouds[0] > 0 ? '' : 'none'; }
            if (trueStage < 5) {
                getId('collapseToggleReset').style.display = player.collapse.mass > 0.01235 ? '' : 'none';
                getId('elementsAsSubtab').style.display = player.upgrades[4][1] === 1 ? '' : 'none';
            }
            if (trueStage < 7) { getId('switchTheme6').style.display = trueStage === 6 && strangeness[5][0] >= 1 ? '' : 'none'; }
        } else if (subtab.settingsCurrent === 'History') {
            const stageBest = player.history.stage.best;
            const converted = stageBest[0] / 1e12 ** stageBest[2];
            getId('stageBestReset1').textContent = `${format(converted)} ${global.strangeInfo.name[stageBest[2]]}`;
            getId('stageBestReset2').textContent = format(stageBest[1], { type: 'time' });
            getId('stageBestReset3').textContent = `${format(converted / stageBest[1], { padding: true })} per second`;
            updateHistory(/*'stage'*/);
        } else if (subtab.settingsCurrent === 'Stats') {
            const { strange } = player;
            const buildings = player.buildings[active];

            getId('maxExportStats').style.display = strange[0].total > 0 ? '' : 'none';
            getId('maxExportType').textContent = global.strangeInfo.name[player.strangeness[5][10]];
            getId('stageBest').style.display = strange[0].total > 0 ? '' : 'none';
            getId('stageResets').style.display = player.stage.resets > 0 ? '' : 'none';
            for (let i = 1; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}Stats`).style.display = buildings[i].trueTotal[0] > 0 ? '' : 'none';
            }
            getId('strangeAllStats').style.display = strange[0].total > 0 ? '' : 'none';
            for (let i = 1; i < strange.length; i++) {
                getId(`strange${i}Stats`).style.display = strange[i].total > 0 ? '' : 'none';
            }
            getId('strange0StatProdDiv').style.display = player.strangeness[5][10] >= 1 ? '' : 'none';

            getId('solarMassStats').style.display = active === 4 || active === 5 ? '' : 'none';
            if (!player.inflation.vacuum) { updateUnknown(); }
            if (active === 1) {
                getId('energyTrue').style.display = player.strangeness[1][11] < 1 && player.discharge.energyMax >= (player.inflation.vacuum ? 36 : 9) ? '' : 'none';
                getId('energyStats').style.display = player.discharge.energyMax >= (player.inflation.vacuum ? 36 : 9) ? '' : 'none';
                getId('dischargeStats').style.display = player.discharge.current + global.dischargeInfo.bonus > 0 ? '' : 'none';
                getId('dischargeStatTrue').style.display = global.dischargeInfo.bonus > 0 ? '' : 'none';
            } else if (active === 2) {
                getId('cloudsEffect').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('cloudsStats').style.display = player.vaporization.cloudsMax[0] > 0 ? '' : 'none';
                getId('oceanWorld').style.display = player.strangeness[2][10] >= 1 ? '' : 'none';
            } else if (active === 3) {
                if (player.inflation.vacuum) {
                    getId('rankStat0').style.display = player.strangeness[2][10] >= 1 ? '' : 'none';
                }
            } else if (active === 4) {
                const nova = player.researchesExtra[4][0];

                getId('star1Stats').style.display = nova >= 1 ? '' : 'none';
                getId('star2Stats').style.display = nova >= 2 ? '' : 'none';
                getId('star3Stats').style.display = nova >= 3 ? '' : 'none';
            }
        }
    }
};

export const getUpgradeDescription = (index: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'ASR' | 'elements') => {
    if (type === 'elements') {
        const { elementsInfo } = global;
        global.lastElement = index;

        getId('elementText').textContent = `${elementsInfo.name[index]}.`;
        getId('elementEffect').textContent = player.elements[index] >= 1 || (player.collapse.show >= index && index !== 0) ? elementsInfo.effectText[index]() : 'Effect is not yet known.';
        getId('elementCost').textContent = player.elements[index] >= 1 ? 'Obtained.' : player.elements[index] > 0 ? 'Awaiting Collapse.' : `${format(elementsInfo.startCost[index])} ${global.stageInfo.priceName}.`;
        return;
    }

    const stageIndex = player.stage.active;
    if (type === 'upgrades') {
        const pointer = global.upgradesInfo[stageIndex];
        global.lastUpgrade[stageIndex] = index;

        getId('upgradeText').textContent = `${pointer.name[index]}.`;
        getId('upgradeEffect').textContent = pointer.effectText[index]();
        getId('upgradeCost').textContent = player.upgrades[stageIndex][index] >= 1 ? 'Created.' :
            stageIndex === 4 && global.collapseInfo.unlockU[index] > player.collapse.mass ? `Unlocked at ${format(global.collapseInfo.unlockU[index])} Mass.` :
            `${format(pointer.startCost[index])} ${global.stageInfo.priceName}.`;
    } else if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];
        global.lastResearch[stageIndex] = [index, type];
        if (type === 'researchesExtra' && stageIndex === 4 && index === 0) { pointer.name[0] = ['Nova', 'Supernova', 'Hypernova'][Math.min(player.researchesExtra[4][0], 2)]; }

        getId('researchText').textContent = `${pointer.name[index]}.`;
        getId('researchEffect').textContent = pointer.effectText[index]();
        getId('researchCost').textContent = player[type][stageIndex][index] >= pointer.max[index] ? 'Maxed.' :
            stageIndex === 4 && type === 'researches' && global.collapseInfo.unlockR[index] > player.collapse.mass ? `Unlocked at ${format(global.collapseInfo.unlockR[index])} Mass.` :
            `${format(pointer.cost[index])} ${global.stageInfo.priceName}.`;
    } else if (type === 'ASR') {
        const { ASRInfo } = global;
        const autoIndex = Math.min(player.ASR[stageIndex] + 1, ASRInfo.max[stageIndex]);
        let waitValue = 2;
        if (player.inflation.vacuum && stageIndex === 3 && player.strangeness[3][4] >= 2 && Limit(global.inflationInfo.dustTrue).moreOrEqual(global.inflationInfo.dustCap)) {
            waitValue = global.inflationInfo.massCap;
        } else if (player.strangeness[1][7] >= 1) { waitValue = player.toggles.shop.wait[stageIndex]; }
        global.lastResearch[stageIndex] = [0, 'ASR'];

        getId('researchText').textContent = 'Structure Automation.';
        getId('researchEffect').textContent = `Automatically make ${player.buildings[stageIndex][autoIndex].trueTotal[0] === 0 ? '(unknown)' : global.buildingsInfo.name[stageIndex][autoIndex]}.\n(Auto will wait until ${format(waitValue)} times of the Structure cost)`;
        getId('researchCost').textContent = player.ASR[stageIndex] >= ASRInfo.max[stageIndex] ? 'Maxed.' : `${format(ASRInfo.cost[stageIndex])} ${global.stageInfo.priceName}.`;
    }
};

export const getStrangenessDescription = (index: number, stageIndex: number, type: 'strangeness' | 'milestones') => {
    const stageText = getId(`${type}Stage`);
    stageText.style.color = global.stageInfo.textColor[stageIndex];
    stageText.textContent = `${global.stageInfo.word[stageIndex]}. `;
    if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        getId('strangenessText').textContent = `${pointer.name[index]}.`;
        getId('strangenessEffect').textContent = pointer.effectText[index]();
        getId('strangenessCost').textContent = player.strangeness[stageIndex][index] >= pointer.max[index] ? 'Maxed.' : `${format(pointer.cost[index])} Strange quarks.`;
    } else {
        const pointer = global.milestonesInfo[stageIndex];

        getId('milestonesText').textContent = `${pointer.name[index]}. (${format(player.milestones[stageIndex][index])})`;
        if (player.inflation.vacuum) {
            getId('milestonesMultiline').innerHTML = `<p class="orchidText">Requirement: <span class="greenText">${pointer.needText[index]()}</span></p>
            <p class="darkvioletText">Effect: <span class="greenText">${pointer.rewardText[index]()}</span></p>`;
        } else if (pointer.need[index][0] !== 0) {
            getId('milestonesMultiline').innerHTML = `<p class="orchidText">Requirement: <span class="greenText">${pointer.needText[index]()}</span></p>
            <p class="darkvioletText">Unlock: <span class="greenText">Main reward unlocked after ${pointer.scalingOld[index].length - player.milestones[stageIndex][index]} more completions.</span></p>`;
        } else { getId('milestonesMultiline').innerHTML = `<p class="darkvioletText">Reward: <span class="greenText">${pointer.rewardText[index]()}</span></p>`; }
    }
};

export const getChallengeDescription = (index: number) => {
    const multi = getId('challengeMultiline');

    let text;
    if (index === -1) {
        text = `<h3 class="orchidText">Vacuum state: <span ${player.inflation.vacuum ? 'class="greenText">true' : 'class="redText">false'}</span></h3>`;
    } else {
        const { challengesInfo: info } = global;
        const color = `${info.color[index]}Text`;
        text = `<h3 class="${color} bigWord">${info.name[index]}${player.challenges.active === index ? ', <span class="greenText">active</span>' : ''}</h3>
        <p class="whiteText">${info.description[index]}</p>
        <div><h4 class="${color} bigWord">Effect:</h4>
        <p>${info.effectText[index]()}</p></div>`;
    }
    getId('voidRewards').style.display = index === 0 ? '' : 'none';
    if (multi.innerHTML !== text) { multi.innerHTML = text; }
};

export const getChallengeReward = (index: number/*, type: 'void'*/) => {
    const need = global.challengesInfo.needText[0][index];
    const reward = global.challengesInfo.rewardText[0][index];
    const level = player.challenges.void[index];
    let text = '';
    for (let i = 0; i < need.length; i++) {
        text += `<div><p><span class="${level > i ? 'greenText' : 'redText'}">→</span> ${need[i]}</p>
        <p><span class="${level > i ? 'greenText' : 'redText'}">Reward:</span> ${level > i ? reward[i] : 'Not yet unlocked'}</p></div>`;
    }

    const multi = getId('voidRewardsDivText');
    if (multi.innerHTML !== text) { multi.innerHTML = text; }
};

export const visualUpdateUpgrades = (index: number, stageIndex: number, type: 'upgrades' | 'elements') => {
    if (type === 'upgrades') {
        if (stageIndex !== player.stage.active) { return; }

        let color = '';
        const image = getId(`upgrade${index + 1}`);
        if (player.upgrades[stageIndex][index] >= 1) {
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
            image.tabIndex = global.screenReader[1] ? -1 : 0;
        } else { image.tabIndex = 0; }
        image.style.backgroundColor = color;
    } else /*if (type === 'elements')*/ {
        const image = getId(`element${index}`);
        if (player.elements[index] >= 1) {
            image.classList.remove('awaiting');
            image.classList.add('created');
            image.tabIndex = global.screenReader[1] ? -1 : 0;
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

export const visualUpdateResearches = (index: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'ASR' | 'strangeness') => {
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
        image = getQuery(`#research${extra}${index + 1} > input`);
    } else if (type === 'ASR') {
        if (stageIndex !== player.stage.active) { return; }
        max = global.ASRInfo.max[stageIndex];
        level = player.ASR[stageIndex];

        upgradeHTML = getId('ASRLevel');
        getId('ASRMax').textContent = `${max}`;
        image = getQuery('#ASR > input');
    } else /*if (type === 'strangeness')*/ {
        max = global.strangenessInfo[stageIndex].max[index];
        level = player.strangeness[stageIndex][index];

        upgradeHTML = getId(`strange${index + 1}Stage${stageIndex}Level`);
        getId(`strange${index + 1}Stage${stageIndex}Max`).textContent = `${max}`;
        image = getQuery(`#strange${index + 1}Stage${stageIndex} > input`);
    }

    upgradeHTML.textContent = `${level}`;
    if (level >= max) {
        upgradeHTML.style.color = 'var(--green-text-color)';
        image.tabIndex = global.screenReader[1] ? -1 : 0;
    } else if (level === 0) {
        upgradeHTML.style.color = ''; //Red
        image.tabIndex = 0;
    } else {
        upgradeHTML.style.color = 'var(--orchid-text-color)';
        image.tabIndex = 0;
    }
};

export const updateHistory = (/*type: 'stage'*/) => {
    const list = global.historyStorage.stage;

    let text = '';
    if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {
            const converted = list[i][0] / 1e12 ** list[i][2];
            text += `<li class="whiteText"><span class="greenText">${format(converted)} ${global.strangeInfo.name[list[i][2]]}</span>, <span class="blueText">${format(list[i][1], { type: 'time' })}</span>, <span class="darkorchidText">${format(converted / list[i][1], { padding: true })} per second</span></li>`;
        }
    } else { text = '<li class="redText">Reference list is empty</li>'; }

    const listID = getId('stageResetsList');
    if (listID.innerHTML !== text) { listID.innerHTML = text; }
};

export const format = (input: number | overlimit, settings = {} as { digits?: number, type?: 'number' | 'input' | 'time', padding?: boolean }): string => {
    if (typeof input !== 'number') { return Limit(input).format(settings as any); }
    const type = settings.type !== undefined ? settings.type : 'number';

    switch (type) {
        case 'input':
        case 'number': {
            if (!isFinite(input)) { return `${input}`; }
            const inputAbs = Math.abs(input);
            if (inputAbs >= 1e6 || (inputAbs < 1e-3 && inputAbs > 0)) {
                const precision = settings.digits !== undefined ? settings.digits : 2;
                let digits = Math.floor(Math.log10(inputAbs));
                let result = Math.round(input / 10 ** (digits - precision)) / (10 ** precision);
                if (Math.abs(result) === 10) {
                    result = 1;
                    digits++;
                }
                const formated = settings.padding === true ? result.toFixed(precision) : `${result}`;
                if (type === 'input') { return `${formated}e${digits}`; }
                return `${formated.replace('.', player.separator[1])}e${digits}`;
            } else {
                const precision = inputAbs >= 1e3 ? 0 : settings.digits !== undefined ? settings.digits : (inputAbs < 1 ? 4 : 2);
                const result = Math.round(input * 10 ** precision) / 10 ** precision;
                const formated = settings.padding === true ? result.toFixed(precision) : `${result}`;
                if (type === 'input') { return formated; }
                return result >= 1e3 ?
                    formated.replace(/\B(?=(\d{3})+(?!\d))/, player.separator[0]) :
                    formated.replace('.', player.separator[1]);
            }
        }
        case 'time':
            if (input > 86399999) { return `${Math.round(input / 31556952)} years`; }
            if (input > 3599999) { return `${Math.round(input / 86400)} days`; }
            if (input > 59999) { return `${Math.round(input / 3600)} hours`; }
            if (input > 999) { return `${Math.round(input / 60)} minutes`; }
            return `${Math.round(input)} seconds`;
    }
};

//Soft means that Stage wasn't changed
export const stageUpdate = (extra = 'normal' as 'normal' | 'soft' | 'reload') => {
    const { stageInfo, buildingsInfo } = global;
    const { active, current, true: highest, resets } = player.stage;
    const vacuum = player.inflation.vacuum;

    stageInfo.activeAll = [vacuum ? 1 : current];
    const activeAll = stageInfo.activeAll;
    if (vacuum) {
        if (player.researchesExtra[1][2] >= 2) { activeAll.push(2); }
        if (player.researchesExtra[1][2] >= 1) { activeAll.push(3); }
        if (player.accretion.rank >= 6) {
            activeAll.push(4);
            if (player.strangeness[5][5] >= 1 && (/*current >= 5 ||*/ player.challenges.active !== 0)) { activeAll.push(5); }
        }
    } else {
        if (current === 4) {
            if (player.milestones[5][0] >= 6) { activeAll.push(5); }
        } else if (current === 5) { activeAll.unshift(4); }
        for (let i = player.strangeness[5][0]; i >= 1; i--) {
            if (current !== i) { activeAll.unshift(i); }
        }
    }

    for (let s = 1; s <= 6; s++) {
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

    getId('stageSelect').style.display = activeAll.length > 1 ? '' : 'none';
    if (player.strange[0].total === 0) { getId('strangenessTabBtn').style.display = 'none'; }
    if (vacuum) {
        getId('stageReset').textContent = current >= 5 ? 'Return back to start' : 'Not ready for reset';
        if (resets < 1) {
            if (current < 5) {
                getId('resetStage').style.display = 'none';
                getId('stageTimeMain').style.display = 'none';
                getId('stageToggleReset').style.display = 'none';
                getId('stageSwitchHotkey').style.display = 'none';
            }
        } else {
            getId('dischargeToggleReset').style.display = '';
            getId('vaporizationToggleReset').style.display = '';
            getId('rankToggleReset').style.display = '';
            getId('collapseToggleReset').style.display = '';
        }
    } else {
        for (let s = 2; s <= 4; s++) {
            getId(`strangenessSection${s}`).style.display = resets >= s + 3 ? '' : 'none';
            getId(`milestone1Stage${s}Div`).style.display = resets >= s + 3 ? '' : 'none';
            getId(`milestone2Stage${s}Div`).style.display = resets >= s + 3 ? '' : 'none';
        }
    }
    const stageWord = getId('stageWord');
    stageWord.textContent = stageInfo.word[current];
    stageWord.style.color = stageInfo.textColor[current];

    if (extra === 'soft') {
        numbersUpdate();
        visualUpdate();
        return;
    } else if (global.screenReader[0]) { //Firefox doesn't support any Aria shorthands
        getId('reset1Main').setAttribute('aria-label', `${['', 'Discharge', 'Vaporization', 'Rank', 'Collapse', ''][active]} reset (hotkey ${['', 'D', 'V', 'R', 'C'][active]})`);
        for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
            getId(`building${i}`).setAttribute('aria-label', `${buildingsInfo.name[active][i]} (hotkey ${i})`);
        }
        getId('extraResearch').setAttribute('aria-label', `${['', 'Energy', 'Cloud', 'Rank', 'Collapse', ''][active]} researches`);
        getId('SRStage').textContent = `Current Active Stage is '${stageInfo.word[active]}'${extra === 'reload' && player.challenges.active !== 0 ? `, also inside '${global.challengesInfo.name[player.challenges.active - 1]}' challenge` : ''}`;
    }

    for (const text of ['upgrade', 'research', 'element']) {
        getId(`${text}Text`).textContent = 'Hover to see.';
        getId(`${text}Effect`).textContent = 'Hover to see.';
        getId(`${text}Cost`).textContent = 'Resource.';
    }
    if (extra === 'reload') {
        for (let s = 1; s <= 5; s++) {
            global.lastUpgrade[s] = -1;
            global.lastResearch[s][0] = -1;
        }
        global.lastElement = -1;
        for (const text of ['strangeness', 'milestones']) {
            getId(`${text}Stage`).textContent = '';
            getId(`${text}Text`).textContent = 'Hover to see.';
        }
        getId('strangenessEffect').textContent = 'Hover to see.';
        getId('strangenessCost').textContent = 'Strange quarks.';
        getId('milestonesMultiline').innerHTML = '<p class="orchidText">Requirement: <span class="greenText">Hover to see.</span></p><p class="darkvioletText">Unlock: <span class="greenText">Hover to see.</span></p>';
        getChallengeDescription(-1);

        global.lastActive = null;
        for (let i = 0; i < global.elementsInfo.startCost.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
        assignBuildingInformation();

        autoUpgradesSet('all');
        autoResearchesSet('researches', 'all');
        autoResearchesSet('researchesExtra', 'all');
        autoElementsSet();
    }

    for (let i = buildingsInfo.maxActive[active]; i < specialHTML.longestBuilding; i++) {
        getId(`building${i}Stats`).style.display = 'none';
        getId(`building${i}`).style.display = 'none';
    }
    for (let i = global.upgradesInfo[active].maxActive; i < specialHTML.longestUpgrade; i++) {
        getId(`upgrade${i + 1}`).style.display = 'none';
    }
    for (let i = global.researchesInfo[active].maxActive; i < specialHTML.longestResearch; i++) {
        getId(`research${i + 1}`).style.display = 'none';
    }
    for (let i = global.researchesExtraInfo[active].maxActive; i < specialHTML.longestResearchExtra; i++) {
        getId(`researchExtra${i + 1}`).style.display = 'none';
    }
    for (let i = specialHTML.footerStatsHTML[active].length; i < specialHTML.longestFooterStats; i++) {
        getId(`footerStat${i + 1}`).style.display = 'none';
    }

    const showU: number[] = []; //Upgrades
    const showR: number[] = []; //Researches
    const showRE: number[] = []; //ResearchesExtra
    const showF: number[] = []; //Footer stats
    if (active === 1) {
        showU.push(3, 4, 5, 6);
        showR.push(1, 2, 3, 4, 5, 6);
        showF.push(1, 2);
        if (vacuum) {
            showU.unshift(1, 2);
            showRE.push(1, 3);
            if (resets >= 1) { getId('extraResearch').style.display = ''; }
        } else {
            getId('upgrade1').style.display = 'none';
            getId('upgrade2').style.display = 'none';
            getId('extraResearch').style.display = 'none';
        }
    } else if (active === 2) {
        showU.push(1);
        showR.push(1, 2);
        showRE.push(1, 2);
        showF.push(2, 3);
    } else if (active === 3) {
        getId('reset1Main').style.display = '';
        showU.push(1, 2);
        showR.push(1, 2);
        showRE.push(1);
        showF.push(1);
    } else if (active === 4) {
        getId('extraResearch').style.display = '';
        showU.push(1, 2, 3);
        showR.push(1, 2, 3);
        showRE.push(1);
        showF.push(1, 2);
    } else if (active === 5) {
        getId('reset1Main').style.display = 'none';
        getId('extraResearch').style.display = 'none';
        showF.push(1, 2, 3);
        if (vacuum) {
            getId('building2').style.display = '';
            showU.push(1, 2);
            showR.push(1, 2);
        }
    }

    (getId('autoWaitInput') as HTMLInputElement).value = format(player.toggles.shop.wait[active]);
    getId('reset1Text').innerHTML = specialHTML.resetHTML[active]; //New ID's inside
    if (active === 3) { updateRankInfo(); }

    const buildingHTML = specialHTML.buildingHTML[active];
    for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
        (getId(`building${i}Image`) as HTMLImageElement).src = `Used_art/${buildingHTML[i - 1]}`;
        getId(`building${i}StatName`).textContent = buildingsInfo.name[active][i];
        getId(`building${i}Name`).textContent = buildingsInfo.name[active][i];
        getQuery(`#building${i}ProdDiv > span`).textContent = buildingsInfo.type[active][i];
        getId(`building${i}ProdDiv`).title = buildingsInfo.hoverText[active][i - 1];
        toggleSwap(i, 'buildings');
    }
    getId('building0StatName').textContent = buildingsInfo.name[active][0];
    toggleSwap(0, 'buildings');

    const upgradeHTML = specialHTML.upgradeHTML[active];
    for (let i = 0; i < global.upgradesInfo[active].maxActive; i++) {
        const image = getId(`upgrade${i + 1}`) as HTMLInputElement;
        if (showU.includes(i + 1)) { image.style.display = ''; }
        image.src = `Used_art/${upgradeHTML[i][0]}`;
        image.alt = upgradeHTML[i][1];
        visualUpdateUpgrades(i, active, 'upgrades');
    }

    const researchHTML = specialHTML.researchHTML[active];
    for (let i = 0; i < global.researchesInfo[active].maxActive; i++) {
        const main = getId(`research${i + 1}`);
        if (showR.includes(i + 1)) { main.style.display = ''; }
        main.className = researchHTML[i][2];
        const image = getId(`research${i + 1}Image`) as HTMLInputElement;
        image.src = `Used_art/${researchHTML[i][0]}`;
        image.alt = researchHTML[i][1];
        visualUpdateResearches(i, active, 'researches');
    }

    if (active !== 5) {
        const researchExtraHTML = specialHTML.researchExtraHTML[active];
        for (let i = 0; i < global.researchesExtraInfo[active].maxActive; i++) {
            const main = getId(`researchExtra${i + 1}`);
            if (showRE.includes(i + 1)) { main.style.display = ''; }
            main.className = researchExtraHTML[i][2];
            const image = getId(`researchExtra${i + 1}Image`) as HTMLInputElement;
            image.src = `Used_art/${researchExtraHTML[i][0]}`;
            image.alt = researchExtraHTML[i][1];
            visualUpdateResearches(i, active, 'researchesExtra');
        }
        getQuery('#extraResearch > div').className = specialHTML.researchExtraDivHTML[active][1];
        (getQuery('#extraResearch > img') as HTMLImageElement).src = `Used_art/${specialHTML.researchExtraDivHTML[active][0]}`;
    }
    visualUpdateResearches(0, active, 'ASR');

    const footerStatsHTML = specialHTML.footerStatsHTML[active];
    for (let i = 0; i < footerStatsHTML.length; i++) {
        if (showF.includes(i + 1)) { getId(`footerStat${i + 1}`).style.display = ''; }
        (getQuery(`#footerStat${i + 1} > img`) as HTMLImageElement).src = `Used_art/${footerStatsHTML[i][0]}`;
        getQuery(`#footerStat${i + 1} > p`).className = footerStatsHTML[i][1];
        getId(`footerStat${i + 1}Name`).textContent = footerStatsHTML[i][2];
    }

    stageInfo.priceName = ['', 'Energy', 'Drops', 'Mass', 'Elements', 'Elements'][active];
    const body = document.body.style;

    if (active === 1) {
        body.removeProperty('--stage-text-color');
        body.removeProperty('--stage-button-color');
        body.removeProperty('--stage-button-border');
        body.removeProperty('--image-border-main');
        body.removeProperty('--image-stage-outer');
    } else {
        body.setProperty('--stage-text-color', stageInfo.textColor[active]);
        body.setProperty('--stage-button-color', stageInfo.buttonBackgroundColor[active]);
        body.setProperty('--stage-button-border', stageInfo.buttonBorderColor[active]);
        body.setProperty('--image-border-main', `url("Used_art/Stage${active} border.png")`);
        body.setProperty('--image-stage-outer', stageInfo.imageBorderColor[active]);
    }
    getId('currentSwitch').textContent = stageInfo.word[active];

    if (global.lastActive === null) { switchTab(checkTab(global.tab) ? global.tab : 'stage'); }
    switchTheme();
};

export const updateRankInfo = () => { //Visual only
    const image = getId('rankImage', false) as HTMLImageElement;
    if (image === null) { return; } //Safety
    const name = getId('rankName', false);
    const { accretionInfo } = global;
    const rank = player.accretion.rank;

    getId('rankMessage', false).textContent = rank === 0 ?
        'Might need more than just water... Increase Rank with Mass.' :
        `Increase it with Mass. (Return back to ${player.inflation.vacuum ? 'Preons' : 'Dust'}, but unlock something new)`;
    if (accretionInfo.rankCost[rank] === 0) { getId('reset1Button').textContent = 'Max Rank achieved'; }

    image.src = `Used_art/${accretionInfo.rankImage[rank]}`;
    name.textContent = accretionInfo.rankName[rank];
    if (rank === 0) {
        name.style.color = ''; //Blue
    } else if (rank === 1) {
        name.style.color = 'var(--cyan-text-color)';
    } else if (rank === 5) {
        name.style.color = 'var(--darkviolet-text-color)';
    } else if (rank === 6) {
        name.style.color = 'var(--orange-text-color)';
    } else {
        name.style.color = 'var(--gray-text-color)';
    }

    getId('buildings').style.display = rank >= 1 ? '' : 'none';
    getId('upgrades').style.display = rank >= 1 ? '' : 'none';
    getId('upgrade3').style.display = rank >= 2 ? '' : 'none';
    getId('upgrade5').style.display = rank >= 3 ? '' : 'none';
    getId('upgrade6').style.display = rank >= 4 ? '' : 'none';
    getId('upgrade7').style.display = rank >= 4 ? '' : 'none';
    getId('upgrade8').style.display = rank >= 4 ? '' : 'none';
    getId('upgrade10').style.display = rank >= 4 ? '' : 'none';
    getId('upgrade11').style.display = rank >= 5 ? '' : 'none';
    getId('upgrade12').style.display = rank >= 5 ? '' : 'none';
    getId('upgrade13').style.display = rank >= 5 ? '' : 'none';
    getId('stageResearch').style.display = rank >= 1 ? '' : 'none';
    getId('research5').style.display = rank >= 3 ? '' : 'none';
    getId('research6').style.display = rank >= 3 ? '' : 'none';
    getId('research7').style.display = rank >= 4 ? '' : 'none';
    getId('research8').style.display = rank >= 4 ? '' : 'none';
    getId('research9').style.display = rank >= 5 ? '' : 'none';
    getId('extraResearch').style.display = rank >= 2 ? '' : 'none';
    getId('researchExtra2').style.display = rank >= 3 ? '' : 'none';
    getId('researchExtra3').style.display = rank >= 4 ? '' : 'none';
    getId('researchExtra4').style.display = rank >= 5 ? '' : 'none';
    if (player.stage.true < 4) { getId('rankToggleReset').style.display = rank >= 2 ? '' : 'none'; }
    for (let i = 1; i < accretionInfo.rankImage.length; i++) { getId(`rankStat${i}`).style.display = rank >= i ? '' : 'none'; }
};
