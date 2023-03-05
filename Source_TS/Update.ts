import { checkTab } from './Check';
import Limit from './Limit';
import { getClass, getId } from './Main';
import { cloneArray, global, player } from './Player';
import { playEvent, assignWithNoMove, specialHTML, switchTheme } from './Special';
import { autoElementsBuy, autoElementsSet, autoResearchesBuy, autoResearchesSet, autoUpgradesBuy, autoUpgradesSet, buyBuilding, calculateBuildingsCost, calculateGainedBuildings, calculateMaxLevel, assignBuildingInformation, collapseResetCheck, dischargeResetCheck, rankResetCheck, stageResetCheck, toggleSwap, vaporizationResetCheck, assignDischargeInformation, assignVaporizationInformation, assignCollapseInformation } from './Stage';
import { overlimit } from './Types';
import { updateUnknown } from './Vacuum';

export const switchTab = (tab: string, subtab = null as null | string) => {
    if (subtab === null) {
        const oldTab = global.tab;
        getId(`${oldTab}Tab`).style.display = 'none';
        getId(`${oldTab}TabBtn`).classList.remove('tabActive');
        if (Object.hasOwn(global.subtab, oldTab + 'Current')) {
            for (const inside of global.tabList[oldTab + 'Subtabs' as 'settingsSubtabs']) {
                getId(`${oldTab}SubtabBtn${inside}`).style.display = 'none';
            }
        }

        global.tab = tab;
        let subtabAmount = 0;
        getId(`${tab}Tab`).style.display = '';
        getId(`${tab}TabBtn`).classList.add('tabActive');
        if (Object.hasOwn(global.subtab, tab + 'Current')) {
            for (const inside of global.tabList[tab + 'Subtabs' as 'settingsSubtabs']) {
                if (checkTab(tab, inside)) {
                    getId(`${tab}SubtabBtn${inside}`).style.display = '';
                    subtabAmount++;
                } else {
                    if (global.subtab[tab + 'Current' as 'settingsCurrent'] === inside) {
                        switchTab(tab, global.tabList[tab + 'Subtabs' as 'settingsSubtabs'][0]);
                    }
                }
            }
        }
        getId('subtabs').style.display = subtabAmount > 1 ? '' : 'none';
        getId('SRTab').textContent = `Current tab is ${tab} tab${subtabAmount > 1 ? ` and its subtab is ${global.subtab[tab + 'Current' as 'settingsCurrent']}` : ''}`;
    } else {
        const oldSubtab = global.subtab[tab + 'Current' as 'settingsCurrent'];
        getId(`${tab}Subtab${oldSubtab}`).style.display = 'none';
        getId(`${tab}SubtabBtn${oldSubtab}`).classList.remove('tabActive');

        global.subtab[tab + 'Current' as 'settingsCurrent'] = subtab;
        getId(`${tab}Subtab${subtab}`).style.display = '';
        getId(`${tab}SubtabBtn${subtab}`).classList.add('tabActive');
        if (global.screenReader) { getId('SRTab').textContent = `Current subtab is ${subtab}, part of ${tab} tab`; }
    }

    visualUpdate();
    numbersUpdate();
};

//In seconds
export const maxOfflineTime = (): number => !player.inflation.vacuum ?
/**/((14400 + 14400 * player.researchesAuto[1]) * (1 + player.strangeness[2][7])) :
/**/(28800 + 28800 * player.researchesAuto[1]);
export const maxExportTime = (): number => 86400 * (player.inflation.vacuum ? (1 + player.strangeness[4][8]) : 2);
export const exportMultiplier = (): number => player.strangeness[4][7] * (player.inflation.vacuum ? 2 : 1);

export const timeUpdate = (timeWarp = 0) => { //Time based information
    const { toggles } = player;
    const vacuum = player.inflation.vacuum;

    let passedSeconds: number;
    if (timeWarp > 0) {
        const extraTime = Math.min(60, timeWarp);
        passedSeconds = extraTime;
        timeWarp -= extraTime;
    } else {
        const { time } = player;

        passedSeconds = (Date.now() - time.updated) / 1000;
        time.updated = Date.now();
        if (passedSeconds < 0) {
            time.offline += passedSeconds;
            return; //To prevent free time warps
        }
        global.timeSpecial.lastSave += passedSeconds * 1000;
        player.stage.export = Math.min(player.stage.export + passedSeconds, maxExportTime());
        if (passedSeconds > 60) {
            const extraTime = passedSeconds - 60;
            passedSeconds = 60;
            time.offline += extraTime;
            time.offline = Math.min(time.offline, maxOfflineTime());
        } else if (time.offline !== 0 && (toggles.normal[0] || player.researchesAuto[0] < 3)) {
            if (time.offline > 0) {
                const extraTime = Math.min(Math.max(time.offline / 3600, 1) * passedSeconds, time.offline);
                time.offline -= Math.min(extraTime * (6 / (vacuum && player.strangeness[2][7] >= 1 ? 1.5 * player.strangeness[2][7] : 1)), time.offline);
                passedSeconds += extraTime;
            } else { time.offline += passedSeconds; }
        }
    }
    const { buildingsInfo, automatization } = global;

    assignBuildingInformation();
    if (vacuum && toggles.auto[0]) { stageResetCheck(5, true); }
    for (const s of global.stageInfo.activeAll) {
        if (!vacuum && toggles.auto[0]) { stageResetCheck(s, true); }
        if (s === 4 && toggles.auto[4]) { collapseResetCheck(true); }
        if (s === 3 && toggles.auto[3]) { rankResetCheck(true); }
        if (s === 2 && toggles.auto[2]) { vaporizationResetCheck(true); }
        if (s === 1 && toggles.auto[1]) { dischargeResetCheck('interval'); }

        if (s === 4 && automatization.elements.length !== 0) { autoElementsBuy(); }
        if (automatization.autoE[s].length !== 0) { autoResearchesBuy('researchesExtra', s); }
        if (automatization.autoR[s].length !== 0) { autoResearchesBuy('researches', s); }
        if (automatization.autoU[s].length !== 0) { autoUpgradesBuy(s); }

        for (let i = buildingsInfo.maxActive[s] - 1; i >= 1; i--) {
            if (toggles.buildings[s][i] && player.ASR[s] >= i) { buyBuilding(i, s, true); }
            if (buildingsInfo.type[s][i] === 'producing') {
                calculateGainedBuildings(i - 1, s, passedSeconds);
            }
        }
        if (s === 1 && player.upgrades[1][8] === 1) { calculateGainedBuildings(player.inflation.vacuum ? 5 : 3, 1, passedSeconds); } //Molecules from Radiation
        if (s === 5) { //Stars from Nebulas
            const research = player.researches[5][0];

            if (research >= 1) { calculateGainedBuildings(1, 5, passedSeconds); }
            if (research >= 2) { calculateGainedBuildings(2, 5, passedSeconds); }
            if (research >= 3) { calculateGainedBuildings(3, 5, passedSeconds); }
        }
    }

    if (timeWarp > 0) { timeUpdate(timeWarp); }
};

export const numbersUpdate = () => { //This is for relevant visual info (can be done async)
    const { tab, subtab } = global;
    const active = player.stage.active;
    const buildings = player.buildings[active];

    if (global.footer) {
        if (active === 1) {
            getId('footerStat1Span').textContent = Limit(buildings[0].current).format();
            getId('footerStat2Span').textContent = format(player.discharge.energy);
        } else if (active === 2) {
            getId('footerStat1Span').textContent = Limit(player.vaporization.clouds).format();
            getId('footerStat2Span').textContent = !player.inflation.vacuum ? Limit(buildings[0].current).format() :
                Limit(player.buildings[1][5].current).divide([6.02214076, 23]).format();
            getId('footerStat3Span').textContent = Limit(buildings[1].current).format();
        } else if (active === 3) {
            getId('footerStat1Span').textContent = !player.inflation.vacuum ? Limit(buildings[0].current).format() :
                Limit(player.buildings[1][0].current).multiply([1.78266192, -33]).format();
        } else if (active === 4 || active === 5) {
            const stars = player.buildings[4];

            getId('footerStat1Span').textContent = format(player.collapse.mass);
            getId('footerStat2Span').textContent = Limit(stars[0].current).format();
            if (active === 5) {
                buildings[0].current = Limit(stars[1].current).plus(stars[2].current, stars[3].current, stars[4].current).toArray();
                getId('footerStat3Span').textContent = Limit(buildings[0].current).format();
            }
        }
    }
    if (tab === 'stage') {
        if (subtab.stageCurrent === 'Structures') {
            const { buildingsInfo } = global;
            const howMany = player.toggles.shop.howMany;
            const strict = player.toggles.shop.strict;

            for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}True`).textContent = `[${format(buildings[i as 1].true)}]`;
                getId(`building${i}Cur`).textContent = Limit(buildings[i].current).format();
                getId(`building${i}Prod`).textContent = Limit(buildingsInfo.producing[active][i]).format();

                if ((active === 4 && player.collapse.mass < global.collapseInfo.unlockB[i]) ||
                    (active === 5 && player.collapse.mass < global.collapseInfo.unlockG[i])) {
                    getId(`building${i}`).classList.remove('availableBuilding');
                    getId(`building${i}Btn`).textContent = `Unlocked at ${format(global.collapseInfo[active === 4 ? 'unlockB' : 'unlockG'][i])} Mass`;
                    getId(`building${i}BuyX`).textContent = 'Locked';
                    continue;
                }

                let costName: string;
                let currency: number | overlimit;
                if (active === 5 && i === 3) { //Galaxy
                    costName = 'Mass';
                    currency = player.collapse.mass;
                } else {
                    let e = i - 1;
                    let extra = active;
                    if (active === 2) {
                        if (i !== 1) { e = 1; } //Drops
                    } else if (active >= 3) { //3, 4, 5
                        e = 0; //Mass || Elements
                        if (active === 5) { extra = 4; }
                    }

                    costName = buildingsInfo.name[extra][e];
                    currency = cloneArray(player.buildings[extra][e].current);
                }

                let totalCost: overlimit;
                let totalBuy: number;
                const cost = calculateBuildingsCost(i, active);
                if (player.researchesAuto[0] === 0 || howMany === 1 || ((howMany === -1 || !strict) && Limit(cost).moreThan(currency))) {
                    totalCost = cost;
                    totalBuy = 1;
                } else {
                    const increase = buildingsInfo.increase[active][i];
                    const firstCost = buildingsInfo.firstCost[active][i];
                    const alreadyBought = buildings[i as 1].true;
                    const totalBefore = Limit(increase).power(alreadyBought).minus([1, 0]).divide(increase - 1).multiply(firstCost).toArray();

                    if (howMany === -1 || !strict) {
                        const maxAfford = Math.floor(Limit(totalBefore).plus(currency).multiply(increase - 1).divide(firstCost).plus([1, 0]).log(10).divide(Math.log10(increase)).toNumber()) - alreadyBought;
                        totalBuy = howMany === -1 ? maxAfford : Math.min(maxAfford, howMany);
                    } else {
                        totalBuy = howMany;
                    }
                    totalCost = Limit(increase).power(totalBuy + alreadyBought).minus([1, 0]).divide(increase - 1).multiply(firstCost).minus(totalBefore).toArray();
                }

                getId(`building${i}BuyX`).textContent = format(totalBuy);
                if (Limit(totalCost).lessOrEqual(currency)) {
                    getId(`building${i}`).classList.add('availableBuilding');
                    getId(`building${i}Btn`).textContent = `Make for: ${Limit(totalCost).format()} ${costName}`;
                } else {
                    getId(`building${i}`).classList.remove('availableBuilding');
                    getId(`building${i}Btn`).textContent = `Need: ${Limit(totalCost).format()} ${costName}`;
                }
            }
            if (active === 1) {
                assignDischargeInformation();
                const effect = getId('dischargeEffect');
                if (effect !== null) { effect.textContent = format(global.upgradesInfo[1].effect[5] as number); }
                getId('reset1Button').textContent = `Next goal is ${format(global.dischargeInfo.next)} Energy`;
            } else if (active === 2) {
                assignVaporizationInformation();
                getId('reset1Button').textContent = `Reset for ${Limit(global.vaporizationInfo.get).format()} Clouds`;
            } else if (active === 4) {
                const { collapse } = player;
                const { collapseInfo } = global;
                assignCollapseInformation();

                getId('reset1Button').textContent = `Collapse to ${format(collapseInfo.newMass)} Mass`;
                for (let i = 1; i <= player.researchesExtra[4][0]; i++) {
                    getId(`starSpecial${i}Cur`).textContent = format(collapse.stars[i - 1]);
                    getId(`starSpecial${i}Get`).textContent = format(collapseInfo.starCheck[i - 1]);
                }
            }

            if (player.time.offline > 0 && (player.toggles.normal[0] || player.researchesAuto[0] < 3)) {
                const time = Math.max(player.time.offline / 3600, 1);
                getId('offlineBoostEffect').textContent = `+${format(time * 1, { digits: 0 })} seconds`;
                getId('offlineBoostWaste').textContent = `${format(time * (6 / (player.inflation.vacuum && player.strangeness[2][7] >= 1 ? 1.5 * player.strangeness[2][7] : 1)), { digits: 0 })} seconds`;
            }
            if (global.lastUpgrade[0]) { getUpgradeDescription(global.lastUpgrade[1], 'auto', 'upgrades'); }
        }
    } else if (tab === 'research') {
        if (subtab.researchCurrent === 'Researches') {
            if (global.lastResearch[0]) { getUpgradeDescription(global.lastResearch[1], 'auto', global.lastResearch[2]); }
        } else if (subtab.researchCurrent === 'Elements') {
            if (global.lastElement[0]) { getUpgradeDescription(global.lastElement[1], 4, 'elements'); }
        }
    } else if (tab === 'strangeness') {
        if (subtab.strangenessCurrent === 'Matter') {
            const stageBoost = global.strangeInfo.stageBoost[active];

            getId('strange0Cur').textContent = format(player.strange[0].current);
            getId('strange0Prod').textContent = stageBoost !== null ? format(stageBoost) : 'none';
            getId('strange0Gain').textContent = format(global.strangeInfo.gain(active));
        }
    } else if (tab === 'settings') {
        if (subtab.settingsCurrent === 'Settings') {
            assignWithNoMove(getId('exportGain'), format(player.stage.export * exportMultiplier() / 86400, { padding: true }));
            if (global.timeSpecial.lastSave >= 1000) { getId('isSaved').textContent = `${format(global.timeSpecial.lastSave, { type: 'time' })} ago`; }
        } else if (subtab.settingsCurrent === 'Stats') {
            const { strange } = player;

            getId('firstPlay').textContent = `${format(Date.now() - player.time.started, { type: 'time' })} ago`;
            getId('stageResetsCount').textContent = format(player.stage.resets);
            getId('offlineStat').textContent = format(player.time.offline * 1000, { type: 'time' });
            getId('maxOfflineStat').textContent = `${format(maxOfflineTime() / 3600)} hours`;
            getId('maxExportStat').textContent = format(maxExportTime() * exportMultiplier() / 86400);
            if (active === 1) {
                getId('maxEnergyStat').textContent = format(player.discharge.energyMax);
                getId('dischargeStat').textContent = format(player.discharge.current);
                getId('dischargeStatBonus').textContent = `[+${format(global.dischargeInfo.bonus)}]`;
                if (player.inflation.vacuum) {
                    assignWithNoMove(getId('preonCapStat'), format(global.inflationInfo.preonCap));
                }
            } else if (active === 2) {
                getId('maxCloudsStat').textContent = Limit(player.vaporization.cloudsMax).format();

                if (player.inflation.vacuum) {
                    const moles = player.buildings[1][5];

                    buildings[0].trueTotal = Limit(moles.trueTotal).divide([6.02214076, 23]).toArray();
                    buildings[0].highest = Limit(moles.highest).divide([6.02214076, 23]).toArray();
                }
            } else if (active === 3) {
                if (player.inflation.vacuum) {
                    const mass = player.buildings[1][0];

                    buildings[0].total = Limit(mass.total).multiply([1.78266192, -33]).toArray();
                    buildings[0].trueTotal = Limit(mass.trueTotal).multiply([1.78266192, -33]).toArray();
                    buildings[0].highest = Limit(mass.highest).multiply([1.78266192, -33]).toArray();

                    assignWithNoMove(getId('dustCapStat'), format(global.inflationInfo.dustCap));
                }
            } else if (active === 4 || active === 5) {
                getId('maxSolarMassStat').textContent = format(player.collapse.massMax);
                if (player.inflation.vacuum) {
                    assignWithNoMove(getId('mainCapStat'), Limit(global.buildingsInfo.producing[1][1]).multiply([5.378995670037768, -64]).format());
                }
                if (active === 4) {
                    const { starEffect } = global.collapseInfo;

                    assignWithNoMove(getId('star1StatCurrent'), format(starEffect[0]()));
                    assignWithNoMove(getId('star1StatAfter'), format(starEffect[0](true)));
                    assignWithNoMove(getId('star2StatCurrent'), format(starEffect[1]()));
                    assignWithNoMove(getId('star2StatAfter'), format(starEffect[1](true)));
                    assignWithNoMove(getId('star3StatCurrent'), format(starEffect[2]()));
                    assignWithNoMove(getId('star3StatAfter'), format(starEffect[2](true)));
                } else if (active === 5) {
                    getId('starsStatTrue').textContent = format(global.collapseInfo.trueStars);
                    const stars = player.buildings[4];

                    buildings[0].total = Limit(stars[1].total).plus(stars[2].total, stars[3].total, stars[4].total).toArray();
                    buildings[0].trueTotal = Limit(stars[1].trueTotal).plus(stars[2].trueTotal, stars[3].trueTotal, stars[4].trueTotal).toArray();
                    buildings[0].highest = Limit(stars[1].highest).plus(stars[2].highest, stars[3].highest, stars[4].highest).toArray();
                }
            }
            for (let i = 0; i < buildings.length; i++) {
                getId(`building${i}StatTotal`).textContent = Limit(buildings[i].total).format();
                getId(`building${i}StatTrueTotal`).textContent = Limit(buildings[i].trueTotal).format();
                getId(`building${i}StatHighest`).textContent = Limit(buildings[i].highest).format();
            }
            for (let i = 0; i < strange.length; i++) {
                getId(`strange${i}StatTotal`).textContent = format(strange[i].total);
            }
        }
    }
};

export const visualUpdate = () => { //This is what can appear/disappear when inside Stage (can be done async)
    const { stage } = player;
    const { tab, subtab } = global;
    const activeAll = global.stageInfo.activeAll;
    const active = stage.active;

    if (active === 1) {
        if (global.footer) { getId('footerStat2').style.display = player.discharge.unlock ? '' : 'none'; }
        if (player.strange[0].total <= 0) { getId('researchTabBtn').style.display = player.discharge.current >= 4 ? '' : 'none'; }
        if (!player.events[0] && player.upgrades[1][6] === 1) { playEvent(0, 0); }
    } else if (active === 2) {
        if (global.footer) { getId('footerStat1').style.display = player.upgrades[2][1] === 1 ? '' : 'none'; }
        if (!player.events[0]) {
            assignVaporizationInformation();
            if (Limit(global.vaporizationInfo.get).plus(player.vaporization.clouds).moreThan([1, 4])) { playEvent(1, 0); }
        }
    } else if (active === 3) {
        if (!player.events[0] && Limit(player.buildings[3][0].current).moreOrEqual([5, 29])) { playEvent(2, 0); }
    } else if (active === 4) {
        if (!player.events[0] && player.researchesExtra[4][0] >= 1) { playEvent(3, 0); }
    }

    if (tab === 'stage') {
        if (subtab.stageCurrent === 'Structures') {
            const buildings = player.buildings[active];
            const researchAuto0 = player.researchesAuto[0];
            const ASR = player.ASR[active];

            if (player.inflation.vacuum) {
                getId('stageReset').textContent = stage.current >= 5 ? 'Return back to start' : 'You are not ready';
                if (player.strange[0].total <= 0 && stage.current < 5) { getId('resetStage').style.display = 'none'; }
            } else {
                getId('stageReset').textContent =
                    active === 1 ? (Limit(buildings[3].current).moreOrEqual([1.67, 21]) ? (active === stage.current ? 'Enter next Stage' : 'Reset this Stage') : 'You are not ready') :
                    active === 2 ? (Limit(buildings[1].current).moreOrEqual([1.194, 29]) ? (active === stage.current ? 'Enter next Stage' : 'Reset this Stage') : 'You are not ready') :
                    active === 3 ? (Limit(buildings[0].current).moreOrEqual([2.47, 31]) ? (active === stage.current ? 'Enter next Stage' : 'Reset this Stage') : 'You are not ready') :
                    (player.events[1] && stage.current === 5 ? 'Return back to start' : 'You are not ready');
            }

            getId('toggleBuy').style.display = researchAuto0 >= 1 ? '' : 'none';
            getId('toggleBuilding0').style.display = researchAuto0 >= 2 ? '' : 'none';
            getId('offlineBoost').style.display = player.time.offline > 0 && (player.toggles.normal[0] || player.researchesAuto[0] < 3) ? '' : 'none';
            for (let i = 1; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}True`).style.display = Limit(buildings[i].current).notEqual(buildings[i as 1].true) ? '' : 'none';
                getId(`toggleBuilding${i}`).style.display = ASR >= i ? '' : 'none';
                getId(`building${i}BuyDiv`).style.display = researchAuto0 > 0 ? '' : 'none';
            }
            if (active === 1) {
                const discharge = player.discharge.current;

                getId('reset1Main').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('building2').style.display = Limit(buildings[1].trueTotal).moreOrEqual(player.inflation.vacuum ? [4, 0] : [1.1, 1]) ? '' : 'none';
                getId('building3').style.display = Limit(buildings[2].trueTotal).moreOrEqual([2, 0]) ? '' : 'none';
                if (player.inflation.vacuum) {
                    getId('building4').style.display = Limit(buildings[3].trueTotal).moreOrEqual([8, 0]) ? '' : 'none';
                    getId('building5').style.display = Limit(buildings[4].trueTotal).moreOrEqual([2, 0]) ? '' : 'none';
                }
                getId('upgrades').style.display = player.discharge.unlock ? '' : 'none';
                getId('upgrade7').style.display = discharge >= 3 ? '' : 'none';
                getId('upgrade8').style.display = discharge >= 3 ? '' : 'none';
                getId('upgrade9').style.display = discharge >= 3 ? '' : 'none';
                getId('upgrade10').style.display = discharge >= 3 ? '' : 'none';
                if (stage.true < 2) { getId('resetStage').style.display = player.upgrades[1][9] === 1 ? '' : 'none'; }
            } else if (active === 2) {
                getId('reset1Main').style.display = player.upgrades[2][1] === 1 ? '' : 'none';
                getId('building2').style.display = Limit(buildings[1].trueTotal).moreOrEqual([3, 2]) ? '' : 'none';
                getId('building3').style.display = Limit(buildings[1].trueTotal).moreOrEqual([5, 6]) ? '' : 'none';
                getId('building4').style.display = Limit(buildings[1].trueTotal).moreOrEqual([5, 17]) ? '' : 'none';
                getId('building5').style.display = Limit(buildings[1].trueTotal).moreOrEqual([5, 22]) ? '' : 'none';
                if (player.inflation.vacuum) { getId('building6').style.display = 'none'; }
                getId('upgrade2').style.display = Limit(buildings[3].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
                getId('upgrade3').style.display = Limit(buildings[2].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
                getId('upgrade4').style.display = Limit(buildings[2].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
                getId('upgrade5').style.display = Limit(buildings[3].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
                getId('upgrade6').style.display = Limit(buildings[4].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
                getId('upgrade7').style.display = Limit(buildings[5].trueTotal).moreOrEqual([1, 0]) && player.strangeness[2][2] >= 3 ? '' : 'none';
            } else if (active === 3) {
                const upgrades = player.upgrades[3];
                getId('building2').style.display = upgrades[2] === 1 ? '' : 'none';
                getId('building3').style.display = upgrades[4] === 1 ? '' : 'none';
                getId('building4').style.display = upgrades[6] === 1 ? '' : 'none';
                if (player.inflation.vacuum) { getId('building5').style.display = 'none'; }
                getId('upgrade4').style.display = Limit(buildings[2].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
                if (upgrades[4] === 1) { getId('upgrade6').style.display = ''; }
                getId('upgrade9').style.display = player.accretion.rank >= 4 && player.strangeness[3][2] >= 3 ? '' : 'none';
            } else if (active === 4) {
                const upgrades = player.upgrades[4];
                const nova = player.researchesExtra[4][0];

                getId('starsSpecial').style.display = nova >= 1 ? '' : 'none';
                getId('starSpecial2').style.display = nova >= 2 ? '' : 'none';
                getId('starSpecial3').style.display = nova >= 3 ? '' : 'none';
                getId('reset1Main').style.display = upgrades[0] === 1 ? '' : 'none';
                if (!player.inflation.vacuum) {
                    getId('building2').style.display = upgrades[1] === 1 ? '' : 'none';
                    getId('building3').style.display = upgrades[2] === 1 ? '' : 'none';
                    getId('building4').style.display = player.collapse.mass >= 10 ? '' : 'none';
                } else { getId('building5').style.display = 'none'; }
                getId('upgrade4').style.display = player.strangeness[4][2] >= 1 ? '' : 'none';
            } else if (active === 5) {
                if (!player.inflation.vacuum) {
                    const nebula = player.milestones[2][0] >= 3;
                    const cluster = player.milestones[3][0] >= 3;

                    getId('buildings').style.display = nebula || cluster ? '' : 'none';
                    getId('building1').style.display = nebula ? '' : 'none';
                    getId('building2').style.display = cluster ? '' : 'none';
                    getId('upgrades').style.display = nebula || cluster ? '' : 'none';
                    getId('upgrade1').style.display = nebula ? '' : 'none';
                    getId('upgrade2').style.display = cluster ? '' : 'none';
                } else { getId('building4').style.display = 'none'; }
                getId('building3').style.display = player.strangeness[5][6] >= 1 ? '' : 'none';
                getId('upgrade3').style.display = Limit(buildings[3].current).moreOrEqual([1, 0]) ? '' : 'none';
            }
        }
    } else if (tab === 'research') {
        if (subtab.researchCurrent === 'Researches') {
            if (player.strangeness[3][6] < 1) { getId('researchAuto3').style.display = 'none'; }

            if (active === 1) {
                if (player.inflation.vacuum) {
                    getId('extraResearch').style.display = stage.current > 1 || player.discharge.current >= 5 ? '' : 'none';
                    getId('researchExtra2').style.display = stage.current >= 3 ? '' : 'none';
                    getId('researchExtra4').style.display = stage.current >= 2 ? '' : 'none';
                    getId('researchExtra5').style.display = stage.current >= 4 ? '' : 'none';
                }
            } else if (active === 2) {
                const buildings = player.buildings[2];

                getId('extraResearch').style.display = Limit(player.vaporization.clouds).moreThan([1, 0]) ? '' : 'none';
                getId('research3').style.display = Limit(buildings[2].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
                getId('research4').style.display = Limit(buildings[2].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
                getId('research5').style.display = Limit(buildings[3].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
                getId('research6').style.display = Limit(buildings[4].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
                getId('researchExtra3').style.display = Limit(buildings[5].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
            } else if (active === 3) {
                if (player.upgrades[3][4] === 1) { getId('research6').style.display = ''; }
                getId('research3').style.display = Limit(player.buildings[3][2].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
                getId('research4').style.display = Limit(player.buildings[3][2].trueTotal).moreOrEqual([1, 0]) ? '' : 'none';
                getId('researchExtra5').style.display = player.accretion.rank >= 3 && player.researchesExtra[1][2] >= 2 ? '' : 'none';
            } else if (active === 4) {
                getId('research4').style.display = player.strangeness[4][2] >= 2 ? '' : 'none';
                getId('extraResearch').style.display = Limit(player.buildings[4][2].trueTotal).moreThan([0, 0]) ? '' : 'none';
                getId('researchExtra2').style.display = player.strangeness[4][2] >= 3 ? '' : 'none';
            } else if (active === 5) {
                if (!player.inflation.vacuum) {
                    getId('stageResearch').style.display = player.milestones[2][0] >= 3 || player.milestones[3][0] >= 3 ? '' : 'none';
                    getId('research1').style.display = player.milestones[2][0] >= 3 ? '' : 'none';
                    getId('research2').style.display = player.milestones[3][0] >= 3 ? '' : 'none';
                }
            }
        } else if (subtab.researchCurrent === 'Elements') {
            const mass = player.collapse.mass >= 10;
            const upgrades = player.upgrades[4];
            const grid = getId('elementsGrid') as HTMLDivElement;

            grid.style.display = upgrades[2] === 1 ? '' : 'flex';
            for (let i = 6; i <= 10; i++) { getId(`element${i}`).style.display = upgrades[2] === 1 ? '' : 'none'; }
            upgrades[2] === 1 && !mass ? grid.classList.add('Elements10App') : grid.classList.remove('Elements10App');
            for (let i = 11; i <= 26; i++) { getId(`element${i}`).style.display = mass ? '' : 'none'; }
            getId('element27').style.display = mass && upgrades[3] === 1 ? '' : 'none';
            getId('element28').style.display = mass && upgrades[3] === 1 ? '' : 'none';
            getId('elementsExtra').style.display = player.inflation.vacuum && player.strangeness[4][4] >= 1 ? '' : 'none';
        }
    } else if (tab === 'strangeness') {
        if (subtab.strangenessCurrent === 'Matter') {
            const vacuum = player.inflation.vacuum;
            const strange5 = vacuum || player.milestones[4][0] >= 3;

            getId('strange9Stage1').style.display = strange5 ? '' : 'none';
            getId('strangenessSection2').style.display = vacuum || stage.resets >= 5 ? '' : 'none';
            getId('strange8Stage2').style.display = strange5 ? '' : 'none';
            getId('strange9Stage2').style.display = strange5 ? '' : 'none';
            getId('strangenessSection3').style.display = vacuum || stage.resets >= 6 ? '' : 'none';
            getId('strange8Stage3').style.display = strange5 ? '' : 'none';
            getId('strangenessSection4').style.display = vacuum || stage.resets >= 7 ? '' : 'none';
            getId('strange9Stage4').style.display = strange5 ? '' : 'none';
            getId('strange10Stage4').style.display = strange5 ? '' : 'none';
            getId('strangenessSection5').style.display = strange5 ? '' : 'none';
            getId('strange4Stage5').style.display = (vacuum ? player.strangeness[5][5] >= 1 : player.milestones[2][0] >= 3) ? '' : 'none';
            getId('strange5Stage5').style.display = (vacuum ? player.strangeness[5][5] >= 1 : player.milestones[3][0] >= 3) ? '' : 'none';
            getId('strange6Stage5').style.display = vacuum || player.milestones[2][0] >= 3 || player.milestones[3][0] >= 3 ? '' : 'none';
            getId('strange7Stage5').style.display = player.strangeness[5][5] >= 1 ? '' : 'none';
            getId('strange8Stage5').style.display = (vacuum ? player.strangeness[5][5] >= 1 : player.milestones[2][0] >= 3 || player.milestones[3][0] >= 3) ? '' : 'none';
        } else if (subtab.strangenessCurrent === 'Milestones') {
            getId('milestone1Stage5Div').style.display = player.strangeness[5][8] >= 1 ? '' : 'none';
            getId('milestone2Stage5Div').style.display = player.strangeness[5][8] >= 1 && player.strangeness[5][6] >= 1 ? '' : 'none';
        }
    } else if (tab === 'settings') {
        if (subtab.settingsCurrent === 'Settings') {
            const { researchesAuto, strangeness } = player;

            getId('toggleAuto0').style.display = strangeness[5][2] >= 1 ? '' : 'none';
            getId('toggleAuto0Mark').style.display = strangeness[5][2] >= 1 ? '' : 'none';
            getId('exportSpecial').style.display = strangeness[4][7] >= 1 ? '' : 'none';
            if (player.strange[0].total <= 0 && stage.current < 5 && player.inflation.vacuum) {
                getId('stageToggleReset').style.display = 'none';
                getId('stageSwitchHotkey').style.display = 'none';
            }
            getId('toggle0').style.display = researchesAuto[0] >= 3 ? '' : 'none';
            getId('offlineStorage').textContent = researchesAuto[0] >= 3 ? 'Auto consume offline storage' : 'Offline storage';
            getId('autoTogglesUpgrades').style.display = researchesAuto[2] >= 1 ? '' : 'none';
            getId('autoToggle6').style.display = researchesAuto[2] >= 2 ? '' : 'none';
            getId('autoToggle7').style.display = researchesAuto[2] >= 3 ? '' : 'none';

            if (activeAll.includes(1)) {
                getId('toggleAuto1').style.display = strangeness[1][3] >= 1 ? '' : 'none';
                if (stage.true < 2) { getId('resetToggles').style.display = player.discharge.current >= 1 ? '' : 'none'; }
            }
            if (activeAll.includes(2)) {
                if (stage.true < 3) { getId('vaporizationToggleReset').style.display = Limit(player.vaporization.clouds).moreThan([1, 0]) ? '' : 'none'; }
                getId('toggleAuto2').style.display = strangeness[2][4] >= 1 ? '' : 'none';
                getId('toggleAuto2Mark').style.display = strangeness[2][4] >= 1 ? '' : 'none';
            }
            if (activeAll.includes(3)) {
                getId('toggleAuto3').style.display = strangeness[3][4] >= 1 ? '' : 'none';
            }
            if (activeAll.includes(4)) {
                if (stage.true < 5) { getId('collapseToggleReset').style.display = player.collapse.mass > 0.01235 ? '' : 'none'; }
                getId('toggleAuto4').style.display = strangeness[4][5] >= 1 ? '' : 'none';
                getId('toggleAuto4Mark').style.display = strangeness[4][5] >= 1 ? '' : 'none';
            }
        } else if (subtab.settingsCurrent === 'Stats') {
            const buildings = player.buildings[active];

            getId('maxExportStats').style.display = player.strangeness[4][7] >= 1 ? '' : 'none';
            for (let i = 1; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}Stats`).style.display = Limit(buildings[i].trueTotal).moreThan([0, 0]) ? '' : 'none';
            }

            getId('stageResets').style.display = stage.resets > 0 ? '' : 'none';
            if (!player.inflation.vacuum) { updateUnknown(); }
            if (active === 1) {
                getId('energyStats').style.display = player.discharge.unlock ? '' : 'none';
                getId('dischargeStats').style.display = player.discharge.current + global.dischargeInfo.bonus > 0 ? '' : 'none';
                getId('dischargeStatBonus').style.display = global.dischargeInfo.bonus > 0 ? '' : 'none';
                if (!player.inflation.vacuum) { getId('preonCap').style.display = 'none'; }
            } else if (active === 2) {
                getId('cloudsStats').style.display = player.upgrades[2][1] === 1 ? '' : 'none';
            } else if (active === 3) {
                getId('rankStat0').style.display = !player.inflation.vacuum || player.researchesExtra[2][3] >= 1 ? '' : 'none';
                if (!player.inflation.vacuum) { getId('dustCap').style.display = 'none'; }
            } else if (active === 4) {
                const nova = player.researchesExtra[4][0];

                getId('starsStats').style.display = nova >= 1 ? '' : 'none';
                getId('star2Stats').style.display = nova >= 2 ? '' : 'none';
                getId('star3Stats').style.display = nova >= 3 ? '' : 'none';
            }
        }
    } else if (tab === 'special') {
        const buildings = player.buildings[active];

        for (let i = 1; i < global.buildingsInfo.maxActive[active]; i++) {
            getId(`SRBuild${i}`).style.display = Limit(buildings[i].trueTotal).moreThan([0, 0]) ? '' : 'none';
        }

        if (active === 1) {
            getId('SRExtra1').style.display = player.discharge.unlock ? '' : 'none';
        } else if (active === 2) {
            getId('SRExtra1').style.display = player.upgrades[2][1] === 1 ? '' : 'none';
        } else if (active === 4) {
            getId('SRExtra1').style.display = player.upgrades[4][0] === 1 ? '' : 'none';
        }
    }
};

export const getUpgradeDescription = (index: number, stageIndex: 'auto' | number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements' | 'strangeness' | 'milestones') => {
    if (stageIndex === 'auto') { stageIndex = player.stage.active; }

    if (type === 'upgrades') {
        const pointer = global.upgradesInfo[stageIndex];
        global.lastUpgrade = [pointer.effect[index] !== null, index];

        getId('upgradeText').textContent = pointer.description[index];
        getId('upgradeEffect').textContent = pointer.effectText[index]();
        getId('upgradeCost').textContent = player.upgrades[stageIndex][index] >= 1 ? 'Created.' :
            stageIndex === 4 && global.collapseInfo.unlockU[index] > player.collapse.mass ? `Unlocked at ${format(global.collapseInfo.unlockU[index])} Mass.` :
            `${format(pointer.startCost[index])} ${global.stageInfo.priceName}.`;
    } else if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[type + 'Info' as 'researchesInfo'][stageIndex];
        global.lastResearch = [pointer.effect[index] !== null, index, type];

        getId('researchText').textContent = pointer.description[index];
        getId('researchEffect').textContent = pointer.effectText[index]();
        getId('researchCost').textContent = player[type][stageIndex][index] >= pointer.max[index] ? 'Maxed.' :
            stageIndex === 4 && type === 'researches' && global.collapseInfo.unlockR[index] > player.collapse.mass ? `Unlocked at ${format(global.collapseInfo.unlockR[index])} Mass.` :
            `${format(pointer.cost[index])} ${global.stageInfo.priceName}.`;
    } else if (type === 'researchesAuto') {
        const { researchesAutoInfo } = global;
        global.lastResearch = [false, index, type];

        getId('researchText').textContent = researchesAutoInfo.description[index];
        getId('researchEffect').textContent = researchesAutoInfo.effectText[index]();
        getId('researchCost').textContent = player.researchesAuto[index] >= researchesAutoInfo.max[index] ? 'Maxed.' :
            stageIndex !== researchesAutoInfo.autoStage[index] ? `Can't be created outside of ${global.stageInfo.word[researchesAutoInfo.autoStage[index]]} stage.` :
            `${format(researchesAutoInfo.cost[index])} ${global.stageInfo.priceName}.`;
    } else if (type === 'ASR') {
        const { ASRInfo } = global;
        const autoIndex = Math.min(player.ASR[stageIndex] + 1, ASRInfo.max[stageIndex]);
        global.lastResearch = [false, index, type];

        getId('researchText').textContent = 'Automatization for making Structures.';
        getId('researchEffect').textContent = `Will automatically make ${Limit(player.buildings[stageIndex][autoIndex].trueTotal).notEqual([0, 0]) ? global.buildingsInfo.name[stageIndex][autoIndex] : '(unknown)'}.\n(Auto will make them, only when have 2 times of the Structure cost)`;
        getId('researchCost').textContent = player.ASR[stageIndex] >= ASRInfo.max[stageIndex] ? 'Maxed.' : `${format(ASRInfo.cost[stageIndex])} ${global.stageInfo.priceName}.`;
    } else if (type === 'elements') {
        const { elementsInfo } = global;
        global.lastElement = [elementsInfo.effect[index] !== null, index];

        getId('elementText').textContent = elementsInfo.description[index] + (player.collapse.disabled && player.collapse.show.includes(index) ? ' (Disabled)' : '');
        getId('elementEffect').textContent = !player.collapse.show.includes(index) ? 'Effect is not yet known.' : elementsInfo.effectText[index]();
        getId('elementCost').textContent = player.elements[index] >= 1 ? 'Obtained.' : `${format(elementsInfo.startCost[index])} ${global.stageInfo.priceName}.`;
    } else if (type === 'strangeness' || type === 'milestones') {
        const stageText = getId(`${type}Stage`) as HTMLSpanElement;
        stageText.style.color = global.stageInfo.textColor[stageIndex];
        stageText.textContent = `${global.stageInfo.word[stageIndex]}. `;
        if (type === 'strangeness') {
            const pointer = global.strangenessInfo[stageIndex];

            getId('strangenessText').textContent = `${pointer.description[index]}`;
            getId('strangenessEffect').textContent = pointer.effectText[index]();
            getId('strangenessCost').textContent = player.strangeness[stageIndex][index] >= pointer.max[index] ? 'Maxed.' : `${format(pointer.cost[index])} Strange quarks.`;
        } else {
            const pointer = global.milestonesInfo[stageIndex];
            const level = player.milestones[stageIndex][index];

            getId('milestonesText').textContent = `${pointer.description[index]}`;
            if (level < pointer.need[index].length) {
                getId('milestonesCost').textContent = pointer.needText[index][0] + format(pointer.need[index][player.milestones[stageIndex][index]]) + pointer.needText[index][1];
                getId('milestonesReward').textContent = `You will gain ${format(pointer.quarks[index][level])} Strange quarks for reaching this milestone.`;
                getId('milestonesCostMain').style.display = '';
                getId('milestonesRewardMain').style.display = '';
            } else {
                getId('milestonesCostMain').style.display = 'none';
                getId('milestonesRewardMain').style.display = 'none';
            }
            getId('milestonesEffect').textContent = level >= pointer.unlock[index] ? pointer.rewardText[index] : `Next reward unlocked after ${pointer.unlock[index] - level} more completions.`;
        }
    }
};

export const visualUpdateUpgrades = (index: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements' | 'strangeness') => {
    if (stageIndex !== player.stage.active && (type === 'upgrades' || type === 'researches' || type === 'researchesExtra' || type === 'ASR' || (type === 'elements' && player.stage.active !== 5))) { return; }

    let maxHTML = undefined as undefined | HTMLElement;
    let progress: boolean | number[];
    let upgradeHTML: HTMLElement;
    if (type === 'upgrades') {
        progress = player.upgrades[stageIndex][index] >= 1;

        upgradeHTML = getId(`upgrade${index + 1}`);
    } else if (type === 'researches' || type === 'researchesExtra') {
        progress = [player[type][stageIndex][index], global[type + 'Info' as 'researchesInfo'][stageIndex].max[index]];

        const extra = type === 'researchesExtra' ? 'Extra' : '';
        upgradeHTML = getId(`research${extra}${index + 1}Level`);
        maxHTML = getId(`research${extra}${index + 1}Max`);
    } else if (type === 'researchesAuto') {
        progress = [player.researchesAuto[index], global.researchesAutoInfo.max[index]];

        upgradeHTML = getId(`researchAuto${index + 1}Level`);
        maxHTML = getId(`researchAuto${index + 1}Max`);
    } else if (type === 'ASR') {
        progress = [player.ASR[stageIndex], global.ASRInfo.max[stageIndex]];

        upgradeHTML = getId('ASRLevel');
        maxHTML = getId('ASRMax');
    } else if (type === 'elements') {
        progress = player.elements[index] >= 1;

        upgradeHTML = getId(`element${index}`);
    } else /*if (type === 'strangeness')*/ {
        progress = [player.strangeness[stageIndex][index], global.strangenessInfo[stageIndex].max[index]];

        upgradeHTML = getId(`strange${index + 1}Stage${stageIndex}Level`);
        maxHTML = getId(`strange${index + 1}Stage${stageIndex}Max`);
    }

    if (type === 'upgrades' || type === 'elements') {
        let color = 'green';
        if (type === 'elements') {
            if ([1, 2, 3, 4, 11, 12, 19, 20].includes(index)) {
                color = '#780000'; //Darker darkred
            } else if ([5, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 18].includes(index)) {
                color = '#a55900'; //Darker darkorange
            } else {
                color = '#0000c1'; //Darker mediumblue
            }
        } else {
            if (stageIndex === 2) {
                color = 'darkgreen';
            } else if (stageIndex === 3) {
                color = '#0000b1'; //Darker blue
            } else if (stageIndex === 4) {
                color = '#1f1f8f'; //Brigher midnightblue
            } else if (stageIndex === 5) {
                color = '#990000'; //Brigher maroon
            }
        }
        upgradeHTML.style.backgroundColor = progress as boolean ? color : '';
    } else {
        const max = (progress as number[])[1];
        const level = (progress as number[])[0];

        (maxHTML as HTMLElement).textContent = `${max}`;
        upgradeHTML.textContent = `${level}`;
        if (level >= max) {
            upgradeHTML.style.color = 'var(--green-text-color)';
        } else if (level === 0) {
            upgradeHTML.style.color = ''; //Red
        } else {
            upgradeHTML.style.color = 'var(--orchid-text-color)';
        }
    }
};

export const format = (input: number | overlimit, settings = {} as { digits?: 0, type?: 'number' | 'input' | 'time', padding?: boolean }): string => {
    if (typeof input === 'object') { return Limit(input).format(settings as any); }
    const type = settings.type ?? 'number';

    switch (type) {
        case 'input':
        case 'number': {
            if (!isFinite(input)) { return `${input}`; }
            const inputAbs = Math.abs(input);
            if (inputAbs >= 1e6 || (inputAbs < 1e-3 && inputAbs > 0)) {
                let digits = Math.floor(Math.log10(inputAbs));
                let endValue: number | string = Math.round(input / 10 ** (digits - 2)) / 100;
                if (Math.abs(endValue) === 10) {
                    endValue = 1;
                    digits++;
                }
                if (settings.padding === true) { endValue = endValue.toFixed(2); }
                if (type === 'input') { return `${endValue}e${digits}`; }
                return `${`${endValue}`.replace('.', player.separator[1])}e${digits}`;
            } else {
                const precision = inputAbs >= 1e3 || settings.digits === 0 ? 0 : (inputAbs < 1 ? 4 : 2);
                let endValue: number | string = Math.round(input * 10 ** precision) / 10 ** precision;
                if (settings.padding === true && precision > 0) { endValue = endValue.toFixed(precision); }
                if (type === 'input') { return `${endValue}`; }
                return endValue >= 1000 ?
                    `${endValue}`.replace(/\B(?=(\d{3})+(?!\d))/, player.separator[0]) :
                    `${endValue}`.replace('.', player.separator[1]);
            }
        }
        case 'time':
            if (input >= 172800000) {
                return `${Math.round(input / 86400000)} days`;
            } else if (input >= 7200000) {
                return `${Math.round(input / 3600000)} hours`;
            } else if (input >= 600000) {
                return `${Math.round(input / 60000)} minutes`;
            } else {
                return `${Math.round(input / 1000)} seconds`;
            }
    }
};

//Soft means that Stage wasn't changed
export const stageCheck = (extra = '' as 'soft' | 'reload') => {
    const { stage } = player;
    const { stageInfo, buildingsInfo } = global;
    const vacuum = player.inflation.vacuum;

    if (vacuum) {
        stageInfo.activeAll = [1];
        if (stage.current >= 3) { stageInfo.activeAll.push(2); }
        if (stage.current >= 2) { stageInfo.activeAll.push(3); }
        if (stage.current >= 4) {
            stageInfo.activeAll.push(4);
            if (player.strangeness[5][5] >= 1) { stageInfo.activeAll.push(5); }
        }
    } else {
        stageInfo.activeAll = [stage.current];
        if (stage.current === 4) {
            if (player.milestones[5][0] >= 4) { stageInfo.activeAll.push(5); }
        } else if (stage.current === 5) { stageInfo.activeAll.unshift(4); }
        for (let i = player.strangeness[5][0]; i >= 1; i--) {
            if (stage.current !== i) { stageInfo.activeAll.unshift(i); }
        }
    }
    const active = stage.active;

    for (let s = 1; s <= 6; s++) {
        for (const i of getClass(`stage${s}Only`)) {
            i.style.display = active === s ? '' : 'none';
        }
        for (const i of getClass(`stage${s}Include`)) {
            i.style.display = stageInfo.activeAll.includes(s) ? '' : 'none';
        }
        for (const i of getClass(`stage${s}Unlock`)) {
            i.style.display = stage.true >= s ? '' : 'none';
        }
    }

    getId('solarMassStats').style.display = active === 4 || active === 5 ? '' : 'none';
    getId('mainCap').style.display = vacuum && (active === 4 || active === 5) ? '' : 'none';
    getId('stageSelect').style.display = stageInfo.activeAll.length > 1 ? '' : 'none';
    if (player.strange[0].total <= 0) {
        getId('strangenessTabBtn').style.display = 'none';
        getId('strangeAllStats').style.display = 'none';
    }
    if (vacuum && stage.current < 3) { getId('researchAuto2').style.display = 'none'; }

    if (global.screenReader) {
        if (extra !== 'soft') {
            getId('SRMain').textContent = `Current Active Stage is '${stageInfo.word[active]}'`;
            for (let i = buildingsInfo.maxActive[active]; i < specialHTML.longestBuilding; i++) { getId(`SRBuild${i}`).style.display = 'none'; }
            for (let i = 0; i < buildingsInfo.maxActive[active]; i++) { getId(`SRBuild${i}`).textContent = `Information for ${buildingsInfo.name[active][i]}`; }
            getId('SRExtra0').style.display = player.strange[0].total > 0 ? '' : 'none';
            if (active === 1 || active === 2 || active === 4) {
                getId('SRExtra1').textContent = `Information for ${['', 'Energy', 'Clouds', 'Rank', 'Stars', ''][active]}`;
            } else { getId('SRExtra1').style.display = 'none'; }
        }
        getId('SRInfo0').style.display = stage.true >= 5 ? '' : 'none';
        getId('SRHotkeyA').style.display = stageInfo.activeAll.length > 1 ? '' : 'none';
    }
    if (extra === 'soft') { return; }

    for (const text of ['upgrade', 'research', 'element']) {
        getId(`${text}Text`).textContent = 'Hover to see.';
        getId(`${text}Effect`).textContent = 'Hover to see.';
        getId(`${text}Cost`).textContent = 'Resource.';
    }
    if (extra === 'reload') {
        for (const text of ['strangeness', 'milestones']) {
            getId(`${text}Stage`).textContent = '';
            getId(`${text}Text`).textContent = 'Hover to see.';
            getId(`${text}Effect`).textContent = 'Hover to see.';
        }
        getId('strangenessCost').textContent = 'Strange quarks.';
        getId('milestonesCost').textContent = 'Hover to see.';
        getId('milestonesReward').textContent = 'Strange quarks.';
        getId('milestonesCostMain').style.display = '';
        getId('milestonesRewardMain').style.display = '';

        assignBuildingInformation();
        autoUpgradesSet('all');
        autoResearchesSet('researches', 'all');
        autoResearchesSet('researchesExtra', 'all');
        autoElementsSet();

        for (const s of stageInfo.activeAll) {
            calculateMaxLevel(0, s, 'ASR');
            for (let i = 0; i < stageInfo.maxResearches[s]; i++) { calculateMaxLevel(i, s, 'researches'); }
            for (let i = 0; i < stageInfo.maxResearchesExtra[s]; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }
        }
        for (let i = 0; i < global.researchesAutoInfo.startCost.length; i++) { calculateMaxLevel(i, global.researchesAutoInfo.autoStage[i], 'researchesAuto'); }
        for (let s = 1; s < global.strangenessInfo.length; s++) {
            for (let i = 0; i < global.strangenessInfo[s].startCost.length; i++) {
                calculateMaxLevel(i, s, 'strangeness');
            }
        }
    }
    global.lastUpgrade[0] = false;
    global.lastResearch[0] = false;
    global.lastResearch[1] = -1;
    global.lastElement[0] = false;

    //Hide | show what is required
    for (let i = buildingsInfo.maxActive[active]; i < specialHTML.longestBuilding; i++) {
        getId(`building${i}Stats`).style.display = 'none';
        getId(`building${i}`).style.display = 'none';
    }
    for (let i = stageInfo.maxUpgrades[active]; i < specialHTML.longestUpgrade; i++) {
        getId(`upgrade${i + 1}`).style.display = 'none';
    }
    for (let i = stageInfo.maxResearches[active]; i < specialHTML.longestResearch; i++) {
        getId(`research${i + 1}`).style.display = 'none';
    }
    for (let i = stageInfo.maxResearchesExtra[active]; i < specialHTML.longestResearchExtra; i++) {
        getId(`researchExtra${i + 1}`).style.display = 'none';
    }
    for (let i = specialHTML.footerStatsHTML[active].length; i < specialHTML.longestFooterStats; i++) {
        getId(`footerStat${i + 1}`).style.display = 'none';
    }

    const showU = [] as number[]; //Which upgrades need to be shown
    const showR = [] as number[]; //Researches
    const showRE = [] as number[]; //ResearchesExtra
    const showF = [] as number[]; //Footer stats
    if (active === 1) {
        showU.push(3, 4, 5, 6);
        showR.push(1, 2, 3, 4, 5, 6);
        showF.push(1, 2);
        if (vacuum) {
            showU.unshift(1, 2);
            showRE.push(1, 3);
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
        if (vacuum) { showRE.push(4); }
    } else if (active === 3) {
        getId('reset1Main').style.display = '';
        showU.push(1, 2);
        showR.push(1, 2);
        showRE.push(1);
        showF.push(1);
    } else if (active === 4) {
        showU.push(1, 2, 3);
        showR.push(1, 2, 3);
        showRE.push(1);
        showF.push(1, 2);
        if (vacuum) {
            getId('building2').style.display = '';
            getId('building3').style.display = '';
            getId('building4').style.display = '';
        }
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

    getId('reset1Text').innerHTML = specialHTML.resetHTML[active]; //Can contain new ID's

    const buildingHTML = specialHTML.buildingHTML[active];
    for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
        const image = getId(`building${i}Image`) as HTMLImageElement;
        image.src = `Used_art/${buildingHTML[i - 1][0]}`;
        image.alt = buildingHTML[i - 1][1];
        getId(`building${i}StatName`).textContent = buildingsInfo.name[active][i];
        getId(`building${i}Name`).textContent = buildingsInfo.name[active][i];
        getId(`building${i}Type`).textContent = buildingsInfo.type[active][i];
        toggleSwap(i, 'buildings');
    }
    getId('building0StatName').textContent = buildingsInfo.name[active][0];
    toggleSwap(0, 'buildings');

    const upgradeHTML = specialHTML.upgradeHTML[active];
    for (let i = 0; i < stageInfo.maxUpgrades[active]; i++) {
        const image = getId(`upgrade${i + 1}`) as HTMLInputElement;
        if (showU.includes(i + 1)) { image.style.display = ''; }
        image.src = `Used_art/${upgradeHTML[i][0]}`;
        image.alt = upgradeHTML[i][1];
        visualUpdateUpgrades(i, active, 'upgrades');
    }

    const researchHTML = specialHTML.researchHTML[active];
    for (let i = 0; i < stageInfo.maxResearches[active]; i++) {
        const main = getId(`research${i + 1}`) as HTMLDivElement;
        if (showR.includes(i + 1)) { main.style.display = ''; }
        main.className = researchHTML[i][2];
        const image = getId(`research${i + 1}Image`) as HTMLInputElement;
        image.src = `Used_art/${researchHTML[i][0]}`;
        image.alt = researchHTML[i][1];
        visualUpdateUpgrades(i, active, 'researches');
    }

    const researchExtraHTML = specialHTML.researchExtraHTML[active];
    for (let i = 0; i < stageInfo.maxResearchesExtra[active]; i++) {
        const main = getId(`researchExtra${i + 1}`) as HTMLDivElement;
        if (showRE.includes(i + 1)) { main.style.display = ''; }
        main.className = researchExtraHTML[i][2];
        const image = getId(`researchExtra${i + 1}Image`) as HTMLInputElement;
        image.src = `Used_art/${researchExtraHTML[i][0]}`;
        image.alt = researchExtraHTML[i][1];
        visualUpdateUpgrades(i, active, 'researchesExtra');
    }
    if (active !== 5) {
        const researchExtraDivHTML = specialHTML.researchExtraDivHTML[active];
        const image = document.querySelector('#extraResearch > img') as HTMLImageElement;
        image.src = `Used_art/${researchExtraDivHTML[0]}`;
        image.alt = researchExtraDivHTML[1];
        (document.querySelector('#extraResearch > div') as HTMLDivElement).className = researchExtraDivHTML[2];
    }
    visualUpdateUpgrades(0, active, 'ASR');

    const footerStatsHTML = specialHTML.footerStatsHTML[active];
    for (let i = 0; i < footerStatsHTML.length; i++) {
        if (showF.includes(i + 1)) { getId(`footerStat${i + 1}`).style.display = ''; }
        const image = document.querySelector(`#footerStat${i + 1} > img`) as HTMLImageElement;
        image.src = `Used_art/${footerStatsHTML[i][0]}`;
        image.alt = footerStatsHTML[i][1];
        (document.querySelector(`#footerStat${i + 1} > p`) as HTMLParagraphElement).className = footerStatsHTML[i][2];
        getId(`footerStat${i + 1}Name`).textContent = footerStatsHTML[i][3];
    }

    updateRankInfo();
    if (active === 4 || active === 5) {
        for (let i = 1; i < global.elementsInfo.startCost.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
    }

    if (!vacuum) {
        const stageWord = getId('stageWord') as HTMLSpanElement;
        stageWord.textContent = stageInfo.word[stage.current];
        stageWord.style.color = stageInfo.textColor[stage.current];
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
        body.setProperty('--image-border-main', `url(Used_art/Stage${active}%20border.png)`);
        body.setProperty('--image-stage-outer', stageInfo.imageBorderColor[active]);
    }
    getId('currentSwitch').textContent = stageInfo.word[active];

    switchTab(checkTab(global.tab) ? global.tab : 'stage'); //Deal with unallowed tabs/subtabs (also visualUpdate)
    switchTheme(); //Some colors are based on active Stage
};

export const updateRankInfo = () => { //Visual only
    if (player.stage.active !== 3) { return; }
    const image = getId('rankImage') as HTMLImageElement;
    if (image === null) { return; } //Called twice anyway
    const name = getId('rankName') as HTMLSpanElement;
    const { accretionInfo } = global;
    const rank = player.accretion.rank;

    getId('rankMessage').textContent = rank === 0 ?
        'Might need more than just water... You can increase rank with Mass.' :
        'Increase it with Mass. (Return back to Dust, but unlock something new)';
    getId('reset1Button').textContent = accretionInfo.rankCost[rank] === 0 ?
        'Max Rank achieved' : `Next Rank is ${format(accretionInfo.rankCost[rank])} Mass`;
    image.src = `Used_art/${accretionInfo.rankImage[rank]}`;
    image.alt = accretionInfo.rankName[rank];
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
    getId('research6').style.display = rank >= 4 ? '' : 'none';
    getId('research7').style.display = rank >= 4 ? '' : 'none';
    getId('research8').style.display = rank >= 5 ? '' : 'none';
    getId('extraResearch').style.display = rank >= 2 ? '' : 'none';
    getId('researchExtra2').style.display = rank >= 3 ? '' : 'none';
    getId('researchExtra3').style.display = rank >= 4 ? '' : 'none';
    getId('researchExtra4').style.display = rank >= 5 ? '' : 'none';
    if (player.stage.true < 4) { getId('rankToggleReset').style.display = rank >= 2 ? '' : 'none'; }
    for (let i = 1; i < accretionInfo.rankImage.length; i++) { getId(`rankStat${i}`).style.display = rank >= i ? '' : 'none'; }
};
