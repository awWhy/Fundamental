import { checkTab } from './Check';
import { getClass, getId } from './Main';
import { global, player } from './Player';
import { playEvent, specialHTML, switchTheme } from './Special';
import { autoElements, autoUpgradesBuy, autoUpgradesSet, buyBuilding, calculateBuildingsCost, calculateGainedBuildings, calculateMaxLevel, calculateResearchCost, calculateStageInformation, collapseResetCheck, dischargeResetCheck, rankResetCheck, stageResetCheck, toggleSwap, vaporizationResetCheck } from './Stage';

//No tab checking, because if someone will use HTML to enable button, they can do same for insides
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
        getId('invisibleTab').textContent = `Current tab is ${tab} tab${subtabAmount > 1 ? ` and its subtab is ${global.subtab[tab + 'Current' as 'settingsCurrent']}` : ''}`; //Tell's screen reader current tab for easier navigation
    } else {
        const oldSubtab = global.subtab[tab + 'Current' as 'settingsCurrent'];
        getId(`${tab}Subtab${oldSubtab}`).style.display = 'none';
        getId(`${tab}SubtabBtn${oldSubtab}`).classList.remove('tabActive');

        global.subtab[tab + 'Current' as 'settingsCurrent'] = subtab;
        getId(`${tab}Subtab${subtab}`).style.display = '';
        getId(`${tab}SubtabBtn${subtab}`).classList.add('tabActive');
        if (global.screenReader) { getId('invisibleTab').textContent = `Current subtab is ${subtab}, part of ${tab} tab`; }
    }

    visualUpdate();
    numbersUpdate();
};

//In seconds
export const maxOfflineTime = (): number => (14400 + 14400 * player.researchesAuto[1]) * maxOfflineMultiplier();
const maxOfflineMultiplier = (): number => 1 + player.strangeness[2][7];

const maxExportTime = (): number => 86400 * (1 + player.strangeness[4][8]);
export const exportMultiplier = (): number => player.strangeness[4][7];

//Only interval is allowed to call this function
export const invisibleUpdate = (timeLeft = 0) => { //This is only for important or time based info
    const { time, toggles } = player;

    let passedSeconds: number;
    if (timeLeft === 0) {
        const passedTime = Date.now() - time.updated;
        time.updated = Date.now();
        if (passedTime < 0) { return console.warn('Negative passed time detected.'); }
        passedSeconds = passedTime / 1000;
        global.timeSpecial.lastSave += passedTime;
        player.stage.export = Math.min(player.stage.export + passedSeconds, maxExportTime());
    } else {
        passedSeconds = timeLeft;
    }

    if (passedSeconds > 60) { //Function will call itself until this condition is false
        const offline = passedSeconds > 3600 ? 900 : 60;
        const maxOffline = maxOfflineTime();
        if (passedSeconds > maxOffline) {
            passedSeconds = maxOffline;
            console.log(`Offline time was reduced to it's max of ${maxOffline / 3600} hours.`);
        }
        timeLeft = passedSeconds - offline;
        passedSeconds = offline;
    } else if (timeLeft !== 0) {
        timeLeft = 0;
    }

    const { buildingsInfo, automatization } = global;

    for (const s of global.stageInfo.activeAll) {
        if (toggles.auto[0]) { stageResetCheck(s, true); }

        if (s === 4 && toggles.auto[4]) { collapseResetCheck(true); }
        if (s === 3 && toggles.auto[3]) { rankResetCheck(true); }
        if (s === 2 && toggles.auto[2]) { vaporizationResetCheck(true); }
        if (s === 1 && toggles.auto[1]) { dischargeResetCheck('interval'); }

        if (s === 4) { autoElements(); }
        if (automatization.autoE[s].length !== 0) { autoUpgradesBuy('researchesExtra', s); }
        if (automatization.autoR[s].length !== 0) { autoUpgradesBuy('researches', s); }
        if (automatization.autoU[s].length !== 0) { autoUpgradesBuy('upgrades', s); }
        calculateStageInformation();

        for (let i = buildingsInfo.name[s].length - 1; i >= 1; i--) {
            if (toggles.buildings[s][i] && player.ASR[s] >= i) { buyBuilding(i, s, true); }
            if (buildingsInfo.type[s][i] === 'producing') {
                calculateGainedBuildings(i - 1, s, passedSeconds);
            }
        }
        if (s === 1 && player.upgrades[1][6] === 1) { calculateGainedBuildings(3, 1, passedSeconds); } //Stage 1 special producer (Molecules from Radiation)
        if (s === 5) { //Stage 5 special producer (Stars from Nebulas)
            if (player.researches[5][0] >= 1) { calculateGainedBuildings(1, 5, passedSeconds); }
            if (player.researches[5][0] >= 2) { calculateGainedBuildings(2, 5, passedSeconds); }
            if (player.researches[5][0] >= 3) { calculateGainedBuildings(3, 5, passedSeconds); }
        }
    }

    if (timeLeft > 0) { invisibleUpdate(timeLeft); }
};

export const numbersUpdate = () => { //This is for relevant visual info (can be done async)
    const { buildings } = player;
    const { tab, subtab } = global;
    const active = player.stage.active;

    if (global.footer) {
        if (active === 1) {
            getId('quarks').textContent = format(buildings[1][0].current);
            getId('energy').textContent = format(player.discharge.energy, 0);
        } else if (active === 2) {
            getId('water').textContent = format(buildings[2][0].current);
            getId('drops').textContent = format(buildings[2][1].current);
            getId('clouds').textContent = format(player.vaporization.clouds);
        } else if (active === 3) {
            getId('mass').textContent = format(buildings[3][0].current);
        } else if (active === 4 || active === 5) {
            getId('elements').textContent = format(buildings[4][0].current);
            getId('solarMass').textContent = format(player.collapse.mass);
            if (active === 5) {
                getId('stars').textContent = format(buildings[5][0].current);
            }
        }
    }
    if (tab === 'stage') {
        const { buildingsInfo, collapseInfo } = global;
        const { collapse } = player;
        const { shop } = player.toggles;

        for (let i = 1; i < buildingsInfo.name[active].length; i++) {
            getId(`building${i}True`).textContent = `[${format(buildings[active][i].true, 0)}]`;
            getId(`building${i}Cur`).textContent = format(buildings[active][i].current);
            getId(`building${i}Prod`).textContent = format(buildingsInfo.producing[active][i]);

            if ((active === 4 && collapse.mass < collapseInfo.unlockB[i]) ||
                (active === 5 && collapse.mass < collapseInfo.unlockG[i])) {
                getId(`building${i}`).classList.remove('availableBuilding');
                getId(`building${i}Btn`).textContent = `Unlocked at ${format(collapseInfo[active === 4 ? 'unlockB' : 'unlockG'][i])} Mass`;
                getId(`building${i}BuyX`).textContent = 'Locked';
                continue;
            }

            const galaxy = active === 5 && i === 3;

            let e = i - 1;
            if (active === 2 && i !== 1) {
                e = 1; //Drops
            } else if (active >= 3) { //3, 4, 5
                e = 0; //Mass || Elements
            }
            const extra = active === 5 ? 4 : active;

            let currency: number;
            if (galaxy) {
                currency = player.collapse.mass;
            } else {
                currency = buildings[extra][e].current;
            }

            let totalCost: number;
            let totalBuy: number;
            if (player.researchesAuto[0] === 0 || shop.howMany === 1 || (buildingsInfo.cost[active][i] > currency && (!shop.strict || shop.howMany === -1))) {
                totalCost = buildingsInfo.cost[active][i];
                totalBuy = 1;
            } else {
                const totalBefore = buildingsInfo.firstCost[active][i] * ((buildingsInfo.increase[active][i] ** buildings[active][i].true - 1) / (buildingsInfo.increase[active][i] - 1));
                const maxAfford = shop.strict && shop.howMany !== -1 ? 1 : Math.trunc(Math.log((totalBefore + currency) * (buildingsInfo.increase[active][i] - 1) / buildingsInfo.firstCost[active][i] + 1) / Math.log(buildingsInfo.increase[active][i])) - buildings[active][i].true;
                totalBuy = shop.howMany === -1 ? maxAfford : shop.strict ? shop.howMany : Math.min(maxAfford, shop.howMany);
                totalCost = buildingsInfo.firstCost[active][i] * ((buildingsInfo.increase[active][i] ** (totalBuy + buildings[active][i].true) - 1) / (buildingsInfo.increase[active][i] - 1)) - totalBefore;
            }

            if (totalCost <= currency) {
                getId(`building${i}`).classList.add('availableBuilding');
                getId(`building${i}Btn`).textContent = `Make for: ${format(totalCost)} ${galaxy ? 'Mass' : buildingsInfo.name[extra][e]}`;
                getId(`building${i}BuyX`).textContent = format(totalBuy);
            } else {
                getId(`building${i}`).classList.remove('availableBuilding');
                getId(`building${i}Btn`).textContent = `Need: ${format(totalCost)} ${galaxy ? 'Mass' : buildingsInfo.name[extra][e]}`;
                getId(`building${i}BuyX`).textContent = format(totalBuy);
            }
        }
        if (active === 1) {
            getId('dischargeReset').textContent = `Next goal is ${format(global.dischargeInfo.next, 0)} Energy`;
            getId('dischargeEffect').textContent = format(global.upgradesInfo[1].effect[3] as number, 0);
        } else if (active === 2) {
            getId('vaporizationReset').textContent = `Reset for ${format(global.vaporizationInfo.get)} Clouds`;
        } else if (active === 4) {
            getId('collapseReset').textContent = `Collapse to ${format(collapseInfo.newMass)} Mass`;
            for (let i = 1; i <= player.researchesExtra[4][0]; i++) {
                getId(`starSpecial${i}Cur`).textContent = format(collapse.stars[i - 1], 0);
                getId(`starSpecial${i}Get`).textContent = format(collapseInfo.starCheck[i - 1], 0);
            }
        }

        if (global.lastUpgrade[1]) { getUpgradeDescription(global.lastUpgrade[0], 'auto', 'upgrades'); }
    } else if (tab === 'research') {
        if (subtab.researchCurrent === 'Researches') {
            if (global.lastResearch[1]) { getUpgradeDescription(global.lastResearch[0], 'auto', global.lastResearch[2]); }
        } else if (subtab.researchCurrent === 'Elements') {
            if (global.lastElement[1]) { getUpgradeDescription(global.lastElement[0], 4, 'elements'); }
        }
    } else if (tab === 'strangeness') {
        if (subtab.strangenessCurrent === 'Matter') {
            getId('strange0Cur').textContent = format(player.strange[0].true, 0);
            const stageBoost = global.strangeInfo.stageBoost[Math.min(active)];
            getId('strange0Prod').textContent = stageBoost !== null ? format(stageBoost) : 'none';
            getId('strange0Gain').textContent = format(global.strangeInfo.stageGain + (active >= 4 ? global.strangeInfo.extraGain : 0), 0);
        }
    } else if (tab === 'settings') {
        if (subtab.settingsCurrent === 'Settings') {
            if (global.timeSpecial.lastSave >= 1000) { getId('isSaved').textContent = `${format(global.timeSpecial.lastSave, 0, 'time')} ago`; }
            getId('exportGain').textContent = format(player.stage.export * exportMultiplier() / 86400);
        } else if (subtab.settingsCurrent === 'Stats') {
            const { strange } = player;

            getId('firstPlay').textContent = `${format(Date.now() - player.time.started, 0, 'time')} ago`;
            getId('stageResetsCount').textContent = format(player.stage.resets, 0);
            getId('maxOfflineStat').textContent = `${format(maxOfflineTime() / 3600, 2)} hours`;
            getId('maxExportStat').textContent = format(maxExportTime() * exportMultiplier() / 86400, 0);
            for (let i = 0; i < buildings[active].length; i++) {
                if (buildings[active][i].trueTotal === 0) { continue; }
                getId(`building${i}StatTotal`).textContent = format(buildings[active][i].total);
                getId(`building${i}StatTrueTotal`).textContent = format(buildings[active][i].trueTotal);
                getId(`building${i}StatHighest`).textContent = format(buildings[active][i].highest);
            }
            for (let i = 0; i < strange.length; i++) {
                if (strange[i].total === 0) { continue; }
                getId(`strange${i}StatTotal`).textContent = format(strange[i].total);
            }
            if (active === 1) {
                getId('maxEnergyStat').textContent = format(player.discharge.energyMax, 0);
                getId('dischargeStat').textContent = format(player.discharge.current, 0);
                getId('dischargeStatBonus').textContent = `[+${format(player.strangeness[1][2], 0)}]`;
            } else if (active === 2) {
                getId('maxCloudsStat').textContent = format(player.vaporization.cloudsMax);
            } else if (active === 4 || active === 5) {
                getId('maxSolarMassStat').textContent = format(player.collapse.massMax);
                if (active === 5) {
                    getId('starsStatTrue').textContent = format(global.collapseInfo.trueStars);
                }
            }
        }
    }
};

export const visualUpdate = () => { //This is what can appear/disappear when inside Stage (can be done async)
    const { stage, buildings, upgrades, researchesAuto, ASR, strangeness, milestones } = player;
    const { tab, subtab } = global;
    const activeAll = global.stageInfo.activeAll;
    const active = stage.active;

    /* I might clean it up later (only to read easier) */
    if (activeAll.includes(1)) {
        const { discharge } = player;

        if (tab === 'settings') {
            if (subtab.settingsCurrent === 'Settings') {
                getId('toggleAuto1').style.display = strangeness[1][3] >= 1 ? '' : 'none';
            }
        }

        if (active === 1) {
            getId('energyStat').style.display = discharge.energyMax >= 9 ? '' : 'none';
            if (discharge.current >= 4) { getId('researchTabBtn').style.display = ''; }
            if (tab === 'stage') {
                getId('building2').style.display = buildings[1][1].trueTotal >= 11 ? '' : 'none';
                getId('building3').style.display = buildings[1][2].trueTotal >= 2 ? '' : 'none';
                if (discharge.energyMax >= 9) { getId('upgrades').style.display = ''; }
                getId('discharge').style.display = upgrades[1][3] === 1 ? '' : 'none';
                for (let i = 5; i <= 8; i++) {
                    getId(`upgrade${i}`).style.display = discharge.current >= 3 ? '' : 'none';
                }
                if (upgrades[1][7] === 1) { getId('stage').style.display = ''; }
                getId('stageReset').textContent = buildings[1][3].current >= 1.67e21 ?
                    active === stage.current ? 'Enter next Stage' : 'Reset this Stage' : 'You are not ready';
            } else if (tab === 'settings') {
                if (subtab.settingsCurrent === 'Settings') {
                    if (discharge.current >= 1) { getId('resetToggles').style.display = ''; }
                } else if (subtab.settingsCurrent === 'Stats') {
                    getId('energyStats').style.display = discharge.energyMax >= 9 ? '' : 'none';
                    getId('dischargeStats').style.display = discharge.current >= 1 || strangeness[1][2] >= 1 ? '' : 'none';
                    getId('dischargeStatBonus').style.display = strangeness[1][2] >= 1 ? '' : 'none';
                }
            } else if (tab === 'special') {
                getId('invisibleGetResource1').style.display = discharge.energyMax >= 9 ? '' : 'none';
            }
        }
    }
    if (activeAll.includes(2)) {
        const { vaporization } = player;

        if (tab === 'settings') {
            if (subtab.settingsCurrent === 'Settings') {
                getId('vaporizationToggleReset').style.display = stage.true > 2 || vaporization.clouds > 1 ? '' : 'none';
                getId('toggleAuto2').style.display = strangeness[2][4] >= 1 ? '' : 'none';
                getId('toggleAuto2Mark').style.display = strangeness[2][4] >= 1 ? '' : 'none';
            }
        }

        if (active === 2) {
            getId('cloudStat').style.display = upgrades[2][1] === 1 ? '' : 'none';
            if (tab === 'stage') {
                getId('vaporization').style.display = upgrades[2][1] === 1 ? '' : 'none';
                getId('building2').style.display = buildings[2][1].trueTotal >= 300 ? '' : 'none';
                getId('building3').style.display = buildings[2][1].trueTotal >= 5e6 ? '' : 'none';
                getId('building4').style.display = buildings[2][1].trueTotal >= 5e17 ? '' : 'none';
                getId('building5').style.display = buildings[2][1].trueTotal >= 5e22 ? '' : 'none';
                getId('upgrade3').style.display = buildings[2][2].trueTotal >= 1 ? '' : 'none';
                getId('upgrade4').style.display = buildings[2][2].trueTotal >= 1 ? '' : 'none';
                getId('upgrade2').style.display = buildings[2][3].trueTotal >= 1 ? '' : 'none';
                getId('upgrade5').style.display = buildings[2][3].trueTotal >= 1 ? '' : 'none';
                getId('upgrade6').style.display = buildings[2][4].trueTotal >= 1 ? '' : 'none';
                getId('upgrade7').style.display = buildings[2][5].trueTotal >= 1 && strangeness[2][2] >= 3 ? '' : 'none';
                getId('stageReset').textContent = buildings[2][1].current >= 1.194e29 ?
                    active === stage.current ? 'Enter next Stage' : 'Reset this Stage' : 'You are not ready';
            } else if (tab === 'research') {
                if (subtab.researchCurrent === 'Researches') {
                    getId('extraResearch').style.display = vaporization.clouds > 1 ? '' : 'none';
                    getId('research3').style.display = buildings[2][2].trueTotal >= 1 ? '' : 'none';
                    getId('research4').style.display = buildings[2][2].trueTotal >= 1 ? '' : 'none';
                    getId('research5').style.display = buildings[2][3].trueTotal >= 1 ? '' : 'none';
                    getId('research6').style.display = buildings[2][4].trueTotal >= 1 ? '' : 'none';
                    getId('researchExtra3').style.display = buildings[2][5].trueTotal >= 1 ? '' : 'none';
                }
            } else if (tab === 'settings') {
                if (subtab.settingsCurrent === 'Stats') {
                    getId('cloudsStats').style.display = upgrades[2][1] === 1 ? '' : 'none';
                }
            } else if (tab === 'special') {
                getId('invisibleGetResource2').style.display = upgrades[2][1] === 1 ? '' : 'none';
            }
            if (!player.events[0] && global.vaporizationInfo.get + vaporization.clouds > 1e4) { playEvent(1, 0); }
        }
    }
    if (activeAll.includes(3)) {
        const { accretion } = player;

        if (tab === 'settings') {
            if (subtab.settingsCurrent === 'Settings') {
                getId('rankToggleReset').style.display = stage.true > 3 || accretion.rank >= 2 ? '' : 'none';
                getId('toggleAuto3').style.display = strangeness[3][4] >= 1 ? '' : 'none';
            }
        }

        if (active === 3) {
            if (tab === 'stage') {
                getId('buildings').style.display = accretion.rank >= 1 ? '' : 'none';
                getId('upgrades').style.display = accretion.rank >= 1 ? '' : 'none';
                getId('upgrade3').style.display = accretion.rank >= 2 ? '' : 'none';
                getId('upgrade5').style.display = accretion.rank >= 3 ? '' : 'none';
                getId('upgrade6').style.display = accretion.rank >= 4 || upgrades[3][4] === 1 ? '' : 'none';
                getId('upgrade7').style.display = accretion.rank >= 4 ? '' : 'none';
                getId('upgrade8').style.display = accretion.rank >= 4 ? '' : 'none';
                getId('upgrade9').style.display = accretion.rank >= 4 && strangeness[3][2] >= 3 ? '' : 'none';
                getId('upgrade10').style.display = accretion.rank >= 4 ? '' : 'none';
                getId('upgrade11').style.display = accretion.rank >= 5 ? '' : 'none';
                getId('upgrade12').style.display = accretion.rank >= 5 ? '' : 'none';
                getId('upgrade13').style.display = accretion.rank >= 5 ? '' : 'none';
                getId('upgrade4').style.display = buildings[3][2].trueTotal >= 1 ? '' : 'none';
                getId('building2').style.display = upgrades[3][2] === 1 ? '' : 'none';
                getId('building3').style.display = upgrades[3][4] === 1 ? '' : 'none';
                getId('building4').style.display = upgrades[3][6] === 1 ? '' : 'none';
                getId('stageReset').textContent = buildings[3][0].current >= 2.47e31 ?
                    active === stage.current ? 'Enter next Stage' : 'Reset this Stage' : 'You are not ready';
            } else if (tab === 'research') {
                if (subtab.researchCurrent === 'Researches') {
                    getId('stageResearch').style.display = accretion.rank >= 1 ? '' : 'none';
                    getId('extraResearch').style.display = accretion.rank >= 2 ? '' : 'none';
                    getId('researchExtra2').style.display = accretion.rank >= 3 ? '' : 'none';
                    getId('research5').style.display = accretion.rank >= 3 ? '' : 'none';
                    getId('research6').style.display = accretion.rank >= 4 || upgrades[3][4] === 1 ? '' : 'none';
                    getId('research7').style.display = accretion.rank >= 4 ? '' : 'none';
                    getId('researchExtra3').style.display = accretion.rank >= 4 ? '' : 'none';
                    getId('research8').style.display = accretion.rank >= 5 ? '' : 'none';
                    getId('researchExtra4').style.display = accretion.rank >= 5 ? '' : 'none';
                    getId('research3').style.display = buildings[3][2].trueTotal >= 1 ? '' : 'none';
                    getId('research4').style.display = buildings[3][2].trueTotal >= 1 ? '' : 'none';
                }
            } else if (tab === 'settings') {
                if (subtab.settingsCurrent === 'Stats') {
                    for (let i = 0; i < global.accretionInfo.rankImage.length; i++) {
                        getId(`rankStat${i}`).style.display = accretion.rank >= i ? '' : 'none';
                    }
                }
            }
            if (!player.events[0] && buildings[3][0].current >= 5e29) { playEvent(2, 0); }
        }
    }
    if (activeAll.includes(4)) {
        const { collapse, researchesExtra } = player;

        if (tab === 'stage') {
            if (active >= 4) { getId('stageReset').textContent = player.events[1] && stage.current === 5 ? 'Return back to start' : 'You are not ready'; }
        } else if (tab === 'research') {
            if (subtab.researchCurrent === 'Elements') {
                const grid = getId('elementsGrid') as HTMLDivElement;

                grid.style.display = upgrades[4][2] === 1 ? '' : 'flex';
                for (let i = 6; i <= 10; i++) {
                    getId(`element${i}`).style.display = upgrades[4][2] === 1 ? '' : 'none';
                }
                upgrades[4][2] === 1 && collapse.mass < 10 ?
                    grid.classList.add('Elements10App') :
                    grid.classList.remove('Elements10App');
                for (let i = 11; i <= 26; i++) {
                    getId(`element${i}`).style.display = collapse.mass >= 10 ? '' : 'none';
                }
                getId('element27').style.display = upgrades[4][3] === 1 ? '' : 'none';
                getId('element28').style.display = upgrades[4][3] === 1 ? '' : 'none';
            }
        } else if (tab === 'settings') {
            if (subtab.settingsCurrent === 'Settings') {
                getId('collapseToggleReset').style.display = stage.true > 4 || collapse.mass > 0.01235 ? '' : 'none';
                getId('toggleAuto4').style.display = strangeness[4][5] >= 1 ? '' : 'none';
                getId('toggleAuto4Mark').style.display = strangeness[4][5] >= 1 ? '' : 'none';
            }
        }

        if (active === 4) {
            if (tab === 'stage') {
                getId('starsSpecial').style.display = researchesExtra[4][0] >= 1 ? '' : 'none';
                getId('starSpecial2').style.display = researchesExtra[4][0] >= 2 ? '' : 'none';
                getId('starSpecial3').style.display = researchesExtra[4][0] >= 3 ? '' : 'none';
                getId('collapse').style.display = upgrades[4][0] === 1 ? '' : 'none';
                getId('building2').style.display = upgrades[4][1] === 1 ? '' : 'none';
                getId('building3').style.display = upgrades[4][2] === 1 ? '' : 'none';
                getId('building4').style.display = collapse.mass >= 10 ? '' : 'none';
                getId('upgrade4').style.display = strangeness[4][2] >= 1 ? '' : 'none';
            } else if (tab === 'research') {
                if (subtab.researchCurrent === 'Researches') {
                    getId('extraResearch').style.display = buildings[4][2].trueTotal > 0 ? '' : 'none';
                    getId('research4').style.display = strangeness[4][2] >= 2 ? '' : 'none';
                    getId('researchExtra2').style.display = strangeness[4][2] >= 3 ? '' : 'none';
                }
            } else if (tab === 'special') {
                getId('invisibleGetResource4').style.display = upgrades[4][0] === 1 ? '' : 'none';
            }
            if (!player.events[0] && researchesExtra[4][0] >= 1) { playEvent(3, 0); }
        }
    }
    if (activeAll.includes(5)) { //Not inside stage.true >= 5, just in case
        if (active === 5) {
            const nebula = milestones[2][0] >= 3;
            const cluster = milestones[3][0] >= 3;

            if (tab === 'stage') {
                getId('buildings').style.display = nebula || cluster ? '' : 'none';
                getId('building1').style.display = nebula ? '' : 'none';
                getId('building2').style.display = cluster ? '' : 'none';
                getId('building3').style.display = strangeness[5][6] >= 1 ? '' : 'none';
                getId('upgrades').style.display = nebula || cluster ? '' : 'none';
                getId('upgrade1').style.display = nebula ? '' : 'none';
                getId('upgrade2').style.display = cluster ? '' : 'none';
                getId('upgrade3').style.display = buildings[5][3].current >= 1 ? '' : 'none';
            } else if (tab === 'research') {
                if (subtab.researchCurrent === 'Researches') {
                    getId('stageResearch').style.display = nebula || cluster ? '' : 'none';
                    getId('research1').style.display = nebula ? '' : 'none';
                    getId('research2').style.display = cluster ? '' : 'none';
                }
            }
        }
    }
    if (stage.true >= 5) {
        if (tab === 'stage') {
            getId('toggleBuilding0').style.display = ASR[active] >= 1 && researchesAuto[0] >= 2 ? '' : 'none';
        } else if (tab === 'research') {
            if (subtab.researchCurrent === 'Researches') {
                getId('researchAuto3').style.display = strangeness[3][6] >= 1 ? '' : 'none';
            }
        } else if (tab === 'strangeness') {
            if (subtab.strangenessCurrent === 'Matter') {
                const strange5 = milestones[4][0] >= 3;
                const nebula = milestones[2][0] >= 3;
                const cluster = milestones[3][0] >= 3;

                getId('strange9Stage1').style.display = strange5 ? '' : 'none';
                getId('strange8Stage2').style.display = strange5 ? '' : 'none';
                getId('strange9Stage2').style.display = strange5 ? '' : 'none';
                getId('strange8Stage3').style.display = strange5 ? '' : 'none';
                getId('strange9Stage4').style.display = strange5 ? '' : 'none';
                getId('strange10Stage4').style.display = strange5 ? '' : 'none';
                getId('strangenessSection5').style.display = strange5 ? '' : 'none';
                getId('strange4Stage5').style.display = nebula ? '' : 'none';
                getId('strange5Stage5').style.display = cluster ? '' : 'none';
                getId('strange6Stage5').style.display = nebula || cluster ? '' : 'none';
                getId('strange7Stage5').style.display = strangeness[5][5] >= 1 ? '' : 'none';
            } else if (subtab.strangenessCurrent === 'Milestones') {
                getId('milestone1Stage5Div').style.display = strangeness[5][8] >= 1 ? '' : 'none';
                getId('milestone2Stage5Div').style.display = strangeness[5][8] >= 1 && strangeness[5][6] >= 1 ? '' : 'none';
            }
        } else if (tab === 'settings') {
            if (subtab.settingsCurrent === 'Settings') {
                getId('toggleAuto0').style.display = strangeness[5][2] >= 1 ? '' : 'none';
                getId('toggleAuto0Mark').style.display = strangeness[5][2] >= 1 ? '' : 'none';
                getId('autoTogglesUpgrades').style.display = researchesAuto[2] >= 1 ? '' : 'none';
                getId('autoToggle6').style.display = researchesAuto[2] >= 2 ? '' : 'none';
                getId('autoToggle7').style.display = researchesAuto[2] >= 3 ? '' : 'none';
                getId('exportSpecial').style.display = strangeness[4][7] >= 1 ? '' : 'none';
            } else if (subtab.settingsCurrent === 'Stats') {
                getId('maxExportStats').style.display = strangeness[4][7] >= 1 ? '' : 'none';
                getId('unknownStructures').style.display = milestones[1][0] >= 5 || milestones[2][1] >= 4 ||
                    milestones[3][1] >= 5 || milestones[4][1] >= 5 || milestones[5][1] >= 8 ? '' : 'none';
                getId('unknownStructure1').style.display = milestones[1][0] >= 5 ? '' : 'none';
                getId('unknownStructure2').style.display = milestones[2][1] >= 4 ? '' : 'none';
                getId('unknownStructure3').style.display = milestones[3][1] >= 5 ? '' : 'none';
                getId('unknownStructure4').style.display = milestones[4][1] >= 5 ? '' : 'none';
                getId('unknownStructure5').style.display = milestones[5][1] >= 8 ? '' : 'none';
            }
        }
    }

    if (tab === 'stage') {
        getId('toggleBuy').style.display = researchesAuto[0] > 0 ? '' : 'none';
        for (let i = 1; i < global.buildingsInfo.name[active].length; i++) {
            getId(`building${i}True`).style.display = buildings[active][i].current !== buildings[active][i].true ? '' : 'none';
            getId(`toggleBuilding${i}`).style.display = ASR[active] >= i ? '' : 'none';
            getId(`building${i}BuyDiv`).style.display = researchesAuto[0] > 0 ? '' : 'none';
        }
    } else if (tab === 'settings') {
        if (subtab.settingsCurrent === 'Stats') {
            for (let i = 1; i < global.buildingsInfo.name[active].length; i++) {
                getId(`building${i}Stats`).style.display = buildings[active][i].trueTotal > 0 ? '' : 'none';
            }
        }
    } else if (tab === 'special') {
        for (let i = 1; i < global.buildingsInfo.name[active].length; i++) {
            getId(`invisibleGetBuilding${i}`).style.display = buildings[active][i].trueTotal > 0 ? '' : 'none';
        }
    }
};

export const getUpgradeDescription = (index: number, stageIndex: 'auto' | number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements' | 'strangeness' | 'milestones') => {
    //No auto return if stageIndex !== player.stage.active, because (!auto) should already be doing it
    if (stageIndex === 'auto') { stageIndex = player.stage.active; }
    const { stageInfo } = global;

    if (type === 'researches' || type === 'researchesExtra') {
        const typeInfo = type + 'Info' as 'researchesInfo';
        if (global[typeInfo][stageIndex].effect[index] === undefined) { return; } //Just in case some issues with HTML not being hidden
        global.lastResearch = [index, global[typeInfo][stageIndex].effect[index] !== null, type];

        getId('researchText').textContent = global[typeInfo][stageIndex].description[index];
        getId('researchEffect').textContent = global[typeInfo][stageIndex].effectText[index]();
        getId('researchCost').textContent = player[type][stageIndex][index] === global[typeInfo][stageIndex].max[index] ? 'Maxed.' :
            stageIndex === 4 && type === 'researches' && global.collapseInfo.unlockR[index] > player.collapse.mass ? `Unlocked at ${format(global.collapseInfo.unlockR[index])} Mass.` :
            `${format(global[typeInfo][stageIndex].cost[index])} ${stageInfo.priceName}.`;
    } else if (type === 'researchesAuto') {
        const typeInfo = 'researchesAutoInfo' as const;
        global.lastResearch = [index, false, type];

        getId('researchText').textContent = global[typeInfo].description[index];
        getId('researchEffect').textContent = global[typeInfo].effectText[index]();
        getId('researchCost').textContent = player[type][index] === global[typeInfo].max[index] ? 'Maxed.' :
            stageIndex !== global.researchesAutoInfo.autoStage[index] ? `Can't be created outside of ${stageInfo.word[global.researchesAutoInfo.autoStage[index]]} stage.` :
            `${format(global[typeInfo].cost[index])} ${stageInfo.priceName}.`;
    } else if (type === 'ASR') {
        const autoIndex = Math.min(player.ASR[stageIndex] + 1, global.ASRInfo.max[stageIndex]);
        global.lastResearch = [index, false, type];

        getId('researchText').textContent = 'Automatization for making structures.';
        getId('researchEffect').textContent = `Will automatically make ${player.buildings[stageIndex][autoIndex].trueTotal !== 0 ? global.buildingsInfo.name[stageIndex][autoIndex] : '(unknown)'}.\n(Auto will make them, only when have 2 times of the Structure cost)`;
        getId('researchCost').textContent = player.ASR[stageIndex] === global.ASRInfo.max[stageIndex] ? 'Maxed.' :
            `${format(global.ASRInfo.cost[stageIndex])} ${stageInfo.priceName}.`;
    } else if (type === 'elements') {
        const { elementsInfo } = global;
        global.lastElement = [index, elementsInfo.effect[index] !== null];

        getId('elementText').textContent = elementsInfo.description[index] +
            (global.automatization.elements.includes(index) ? ' (Disabled)' : '');
        getId('elementEffect').textContent = !player.collapse.show.includes(index) ?
            'Effect is not yet known.' : elementsInfo.effectText[index]();
        getId('elementCost').textContent = player.elements[index] === 1 ? 'Obtained.' : `${format(elementsInfo.cost[index])} ${stageInfo.priceName}.`;
    } else if (type === 'upgrades') {
        const typeInfo = 'upgradesInfo' as const;
        if (global[typeInfo][stageIndex].effect[index] === undefined) { return; }
        global.lastUpgrade = [index, global[typeInfo][stageIndex].effect[index] !== null];

        getId('upgradeText').textContent = global[typeInfo][stageIndex].description[index];
        getId('upgradeEffect').textContent = global[typeInfo][stageIndex].effectText[index]();
        getId('upgradeCost').textContent = player[type][stageIndex][index] === 1 ? 'Created.' :
            stageIndex === 4 && global.collapseInfo.unlockU[index] > player.collapse.mass ? `Unlocked at ${format(global.collapseInfo.unlockU[index])} Mass.` :
            `${format(global[typeInfo][stageIndex].cost[index])} ${stageInfo.priceName}.`;
    } else /*if (type === 'strangeness' || type === 'milestones')*/ {
        const typeInfo = type + 'Info' as 'strangenessInfo';

        const stageText = getId(`${type}Stage`) as HTMLSpanElement;
        stageText.style.color = stageInfo.textColor[stageIndex];
        stageText.textContent = `${stageInfo.word[stageIndex]}. `;
        getId(`${type}Text`).textContent = `${global[typeInfo][stageIndex].description[index]}`;
        if (type === 'strangeness') {
            getId('strangenessEffect').textContent = global[typeInfo][stageIndex].effectText[index]();
            getId('strangenessCost').textContent = player[type][stageIndex][index] === global[typeInfo][stageIndex].max[index] ? 'Maxed.' : `${format(global[typeInfo][stageIndex].cost[index])} Strange quarks.`;
        } else {
            const level = player[type][stageIndex][index];

            if (level < global[typeInfo as 'milestonesInfo'][stageIndex].need[index].length) {
                getId('milestonesCost').textContent = global[typeInfo as 'milestonesInfo'][stageIndex].needText[index][0] + format(global[typeInfo as 'milestonesInfo'][stageIndex].need[index][player[type][stageIndex][index]]) + global[typeInfo as 'milestonesInfo'][stageIndex].needText[index][1];
                getId('milestonesReward').textContent = `You will gain ${format(global[typeInfo as 'milestonesInfo'][stageIndex].quarks[index][level], 0)} Strange quarks for reaching this milestone.`;
                getId('milestonesCostMain').style.display = '';
                getId('milestonesRewardMain').style.display = '';
            } else {
                getId('milestonesCostMain').style.display = 'none';
                getId('milestonesRewardMain').style.display = 'none';
            }

            getId('milestonesEffect').textContent = level >= global[typeInfo as 'milestonesInfo'][stageIndex].unlock[index] ?
                global[typeInfo as 'milestonesInfo'][stageIndex].rewardText[index] :
                `Next reward unlocked after ${global[typeInfo as 'milestonesInfo'][stageIndex].unlock[index] - level} more completions.`;
        }
    }
};

export const visualUpdateUpgrades = (index: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements' | 'strangeness') => {
    if ((type === 'upgrades' || type === 'researches' || type === 'researchesExtra' || type === 'ASR') && stageIndex !== player.stage.active) { return; }

    let maxHTML = undefined as undefined | HTMLElement;
    let progress: boolean | number[];
    let upgradeHTML: HTMLElement;
    const typeInfo = type + 'Info' as 'researchesInfo';
    if (type === 'upgrades') {
        progress = player[type][stageIndex][index] === 1;

        upgradeHTML = getId(`upgrade${index + 1}`);
    } else if (type === 'researches' || type === 'researchesExtra') {
        progress = [player[type][stageIndex][index], global[typeInfo][stageIndex].max[index]];

        const extra = type === 'researchesExtra' ? 'Extra' : '';
        upgradeHTML = getId(`research${extra}${index + 1}Level`);
        maxHTML = getId(`research${extra}${index + 1}Max`);
    } else if (type === 'researchesAuto') {
        progress = [player[type][index], global[typeInfo as 'researchesAutoInfo'].max[index]];

        upgradeHTML = getId(`researchAuto${index + 1}Level`);
        maxHTML = getId(`researchAuto${index + 1}Max`);
    } else if (type === 'ASR') {
        progress = [player[type][stageIndex], global[typeInfo as 'ASRInfo'].max[stageIndex]];

        upgradeHTML = getId('ASRLevel');
        maxHTML = getId('ASRMax');
    } else if (type === 'elements') {
        progress = player[type][index] === 1;

        upgradeHTML = getId(`element${index}`);
    } else {
        progress = [player[type][stageIndex][index], global[typeInfo][stageIndex].max[index]];

        upgradeHTML = getId(`strange${index + 1}Stage${stageIndex}Level`);
        //maxHTML = getId(`strange${index + 1}Stage${stageIndex}Max`);
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
            }
        }
        upgradeHTML.style.backgroundColor = progress as boolean ? color : '';
    } else {
        const max = (progress as number[])[1];
        const level = (progress as number[])[0];

        if (maxHTML !== undefined) { maxHTML.textContent = `${max}`; }
        upgradeHTML.textContent = `${level}`;
        if (level === max) {
            upgradeHTML.style.color = 'var(--green-text-color)';
        } else if (level === 0) {
            upgradeHTML.style.color = ''; //Red
        } else {
            upgradeHTML.style.color = 'var(--orchid-text-color)';
        }
    }
};

export const updateRankInfo = () => {
    if (player.stage.active !== 3) { return; }
    const { accretion } = player;
    const { accretionInfo } = global;
    const image = getId('rankImage') as HTMLImageElement;
    const name = getId('rankName') as HTMLSpanElement;

    //Visuals
    accretionInfo.rankCost[4] = player.events[0] ? 5e29 : 0; //Calculated before Rank reset (here it's only for visual)
    getId('rankMessage').textContent = accretion.rank === 0 ?
        'Might need more than just water... You can increase rank with Mass.' :
        'Increase it with Mass. (Return back to Dust, but unlock something new)';
    getId('rankReset').textContent = accretionInfo.rankCost[accretion.rank] === 0 ?
        'Max rank achieved' : `Next rank is ${format(accretionInfo.rankCost[accretion.rank])} Mass`;
    image.src = `Used_art/${accretionInfo.rankImage[accretion.rank]}.png`;
    image.alt = accretionInfo.rankName[accretion.rank];
    name.textContent = accretionInfo.rankName[accretion.rank];
    if (accretion.rank === 0) {
        name.style.color = ''; //Blue
    } else if (accretion.rank === 1) {
        name.style.color = 'var(--cyan-text-color)';
    } else if (accretion.rank === 5) {
        name.style.color = 'var(--darkviolet-text-color)';
    } else {
        name.style.color = 'var(--gray-text-color)';
    }
};

export const format = (input: number, precision = 'auto' as 'auto' | number, type = 'number' as 'number' | 'input' | 'time'): string => {
    const inputAbs = Math.abs(input);
    if (precision === 'auto') { precision = inputAbs < 1e3 ? (inputAbs < 1 ? 4 : 2) : 0; }

    switch (type) { //toLocaleString() is banned, I don't want that slowness and weird behavior
        case 'input':
        case 'number':
            if (!isFinite(input)) { return `${input}`; }
            if (inputAbs >= 1e6 || (inputAbs < 1e-3 && inputAbs > 0)) { //Format for these cases
                let digits = Math.floor(Math.log10(inputAbs));
                let endValue = Math.round(input / 10 ** (digits - 2)) / 100;
                if (Math.abs(endValue) === 10) {
                    endValue = 1;
                    digits++;
                }
                if (type === 'input') { return `${endValue}e${digits}`; }
                return `${(`${endValue}`).replace('.', player.separator[1])}e${digits}`;
            } else { //Regex will fail if input >= 1e6 (add g to regex to fix it) or input <= 1000 while precision >= 3 (split('.') string in that case)
                if (precision > 0) {
                    const endValue = Math.round(input * (10 ** precision)) / (10 ** precision);
                    if (type === 'input') { return `${endValue}`; }
                    return endValue >= 1000 ?
                        (`${endValue}`).replace(/\B(?=(\d{3})+(?!\d))/, player.separator[0]).replace('.', player.separator[1]) :
                        (`${endValue}`).replace('.', player.separator[1]);
                } else {
                    if (type === 'input') { return `${Math.round(input)}`; }
                    return (`${Math.round(input)}`).replace(/\B(?=(\d{3})+(?!\d))/, player.separator[0]);
                }
            }
        case 'time':
            if (input >= 172800000) {
                return `${Math.floor(input / 86400000)} days`;
            } else if (input >= 7200000) {
                return `${Math.floor(input / 3600000)} hours`;
            } else if (input >= 600000) {
                return `${Math.floor(input / 60000)} minutes`;
            } else {
                return `${Math.floor(input / 1000)} seconds`;
            }
    }
};

export const stageCheck = (extra = '' as 'soft' | 'reload') => {
    const { stage } = player;
    const { stageInfo, buildingsInfo } = global;

    stageInfo.activeAll = [stage.current];
    if (stage.current === 4) {
        if (player.milestones[5][0] >= 4) { stageInfo.activeAll.push(5); }
    } else if (stage.current === 5) { stageInfo.activeAll.unshift(4); }
    for (let i = player.strangeness[5][0]; i >= 1; i--) {
        if (stage.current !== i) { stageInfo.activeAll.unshift(i); }
    }
    const active = stage.active;

    if (extra !== 'soft') {
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

            calculateStageInformation();
            for (let s = 1; s < global.strangenessInfo.length; s++) {
                for (let i = 0; i < global.strangenessInfo[s].cost.length; i++) {
                    calculateResearchCost(i, s, 'strangeness'); //Can be changed into calculateMaxLevel();
                    visualUpdateUpgrades(i, s, 'strangeness'); //If max level will dynamicly change
                }
            }
            autoUpgradesSet('upgrades');
            autoUpgradesSet('researches');
            autoUpgradesSet('researchesExtra');
            autoElements(true);
            for (const s of stageInfo.activeAll) { //Does useless visualUpdateUpgrades();
                calculateMaxLevel(0, s, 'ASR');
                for (let i = 1; i < buildingsInfo.name[s].length; i++) { calculateBuildingsCost(i, s); }
                for (let i = 0; i < global.researchesInfo[s].cost.length; i++) { calculateMaxLevel(i, s, 'researches'); }
                for (let i = 0; i < global.researchesExtraInfo[s].cost.length; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }
            }
            for (let i = 0; i < global.researchesAutoInfo.cost.length; i++) { calculateMaxLevel(i, global.researchesAutoInfo.autoStage[i], 'researchesAuto'); }
        }
        global.lastUpgrade[1] = false;
        global.lastResearch[0] = -1;
        global.lastResearch[1] = false;
        global.lastElement[1] = false;
    }

    //Hide | show what is required
    for (let i = buildingsInfo.name[active].length; i < specialHTML.longestBuilding; i++) {
        getId(`building${i}Stats`).style.display = 'none';
        getId(`building${i}`).style.display = 'none';
    }
    for (let i = global.upgradesInfo[active].cost.length; i < specialHTML.longestUpgrade; i++) {
        getId(`upgrade${i + 1}`).style.display = 'none';
    }
    for (let i = global.researchesInfo[active].cost.length; i < specialHTML.longestResearch; i++) {
        getId(`research${i + 1}`).style.display = 'none';
    }
    for (let i = global.researchesExtraInfo[active].cost.length; i < specialHTML.longestResearchExtra; i++) {
        getId(`researchExtra${i + 1}`).style.display = 'none';
    }

    for (let s = 1; s <= 5; s++) {
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

    //Special cases (mostly against errors with visualUpdate() being interupted)
    getId('buildings').style.display = '';
    getId('building1').style.display = '';
    getId('stageResearch').style.display = '';
    getId('extraResearch').style.display = 'none';
    if (active === 5) {
        getId('solarMassStat').style.display = '';
        getId('elementStat').style.display = '';
        getId('solarMassStats').style.display = '';
    }
    if (localStorage.getItem('theme') !== null) { getId('themeArea').style.display = ''; }

    if (stage.true >= 5) {
        for (let i = 2; i <= 4; i++) {
            getId(`strangenessSection${i}`).style.display = stage.resets >= i + 3 ? '' : 'none';
        }
        if (player.strange[0].total < 1) { getId('strangenessTabBtn').style.display = 'none'; }
        if (stageInfo.activeAll.length === 1) { getId('stageSelect').style.display = 'none'; }
    }

    //Prepare new stage information
    stageInfo.priceName = ['Energy', 'Drops', 'Mass', 'Elements'][Math.min(active - 1, 3)];
    updateRankInfo();

    for (let i = 1; i < buildingsInfo.name[active].length; i++) {
        getId(`building${i}StatName`).textContent = buildingsInfo.name[active][i];
        getId(`building${i}Name`).textContent = buildingsInfo.name[active][i];
        getId(`building${i}Type`).textContent = buildingsInfo.type[active][i];
        const image = getId(`building${i}Image`) as HTMLImageElement;
        image.src = `Used_art/${specialHTML.buildingHTML[active][i - 1][0]}.png`;
        image.alt = specialHTML.buildingHTML[active][i - 1][1];
        toggleSwap(i, 'buildings');
    }
    getId('building0StatName').textContent = buildingsInfo.name[active][0];
    toggleSwap(0, 'buildings');
    for (let i = 0; i < global.upgradesInfo[active].cost.length; i++) {
        getId(`upgrade${i + 1}`).style.display = '';
        const image = getId(`upgrade${i + 1}`) as HTMLInputElement;
        image.src = `Used_art/${specialHTML.upgradeHTML[active][i][0]}.png`;
        image.alt = specialHTML.upgradeHTML[active][i][1];
        visualUpdateUpgrades(i, active, 'upgrades');
    }
    for (let i = 0; i < global.researchesInfo[active].cost.length; i++) {
        const main = getId(`research${i + 1}`) as HTMLDivElement;
        main.style.display = '';
        main.className = specialHTML.researchHTML[active][i][2];
        const image = getId(`research${i + 1}Image`) as HTMLInputElement;
        image.src = `Used_art/${specialHTML.researchHTML[active][i][0]}.png`;
        image.alt = specialHTML.researchHTML[active][i][1];
        visualUpdateUpgrades(i, active, 'researches');
    }
    if (active !== 1 && active !== 5) {
        for (let i = 0; i < global.researchesExtraInfo[active].cost.length; i++) {
            const main = getId(`researchExtra${i + 1}`) as HTMLDivElement;
            main.style.display = '';
            main.className = specialHTML.researchExtraHTML[active][i][2];
            const image = getId(`researchExtra${i + 1}Image`) as HTMLInputElement;
            image.src = `Used_art/${specialHTML.researchExtraHTML[active][i][0]}.png`;
            image.alt = specialHTML.researchExtraHTML[active][i][1];
            visualUpdateUpgrades(i, active, 'researchesExtra');
        }
        const image = document.querySelector('#extraResearch > img') as HTMLImageElement;
        image.src = `Used_art/${specialHTML.researchExtraDivHTML[active][0]}.png`;
        image.alt = specialHTML.researchExtraDivHTML[active][1];
        (document.querySelector('#extraResearch > div') as HTMLDivElement).className = specialHTML.researchExtraDivHTML[active][2];
    }
    visualUpdateUpgrades(0, active, 'ASR');

    if (active >= 4) {
        for (let i = 1; i < global.elementsInfo.cost.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
    }

    const body = document.body.style;
    const stageWord = getId('stageWord') as HTMLSpanElement;
    stageWord.textContent = stageInfo.word[stage.current];
    stageWord.style.color = stageInfo.textColor[stage.current];
    if (stage.current === 1) {
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
    if (global.screenReader) {
        getId('invisibleBought').textContent = `Current Active Stage is '${stageInfo.word[active]}'`;
        for (let i = buildingsInfo.name[active].length; i < specialHTML.longestBuilding; i++) {
            getId(`invisibleGetBuilding${i}`).style.display = 'none';
        }
        for (let i = 0; i < buildingsInfo.name[active].length; i++) {
            getId(`invisibleGetBuilding${i}`).textContent = `Get information for ${buildingsInfo.name[active][i]}`;
        }
        getId('invisibleGetResource0').style.display = player.strange[0].total > 0 ? '' : 'none';
        getId('invisibleGetResource1').style.display = active === 1 ? '' : 'none';
        getId('invisibleGetResource2').style.display = active === 2 ? '' : 'none';
        getId('invisibleGetResource4').style.display = active === 4 ? '' : 'none';
        getId('invisibleInformation0').style.display = stage.true >= 5 ? '' : 'none';
    }

    //Includes visualUpdate();
    switchTab(checkTab(global.tab) ? global.tab : 'stage'); //Cheap way to deal with unallowed tabs/subtabs
    if (global.theme.default || extra === 'reload') { switchTheme(); }
};
