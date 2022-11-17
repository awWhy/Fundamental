import { checkTab } from './Check';
import { getClass, getId } from './Main';
import { getUpgradeType, global, globalStart, player, playerStart } from './Player';
import { playEvent } from './Special';
import { autoBuyUpgrades, buyBuilding, calculateBuildingsCost, calculateGainedBuildings, calculateMaxLevel, calculateResearchCost, calculateStageInformation, collapseResetCheck, dischargeResetCheck, rankResetCheck, stageResetCheck, vaporizationResetCheck } from './Stage';

//No tab checking, because if someone will use HTML to enable button, they can do same for insides
export const switchTab = (tab: string, subtab = 'tabOnly') => {
    if (global.tab !== tab && subtab === 'tabOnly') {
        /* First remove current tab, then show new tab */
        getId(`${global.tab}Tab`).style.display = 'none';
        getId(`${global.tab}TabBtn`).classList.remove('tabActive');
        if (Object.hasOwn(global.subtab, global.tab + 'Current')) {
            for (const inside of global.tabList[global.tab + 'Subtabs']) {
                getId(`${global.tab}SubtabBtn${inside}`).style.display = 'none';
            }
        }

        global.tab = tab;
        let subtabAmount = 0;
        getId(`${tab}Tab`).style.display = '';
        getId(`${tab}TabBtn`).classList.add('tabActive');
        if (Object.hasOwn(global.subtab, tab + 'Current')) {
            for (const inside of global.tabList[tab + 'Subtabs']) {
                if (checkTab(tab, inside)) {
                    getId(`${tab}SubtabBtn${inside}`).style.display = '';
                    subtabAmount++;
                } else {
                    if (global.subtab[tab + 'Current' as 'settingsCurrent'] === inside) {
                        switchTab(tab, globalStart.subtab[tab + 'Current' as 'settingsCurrent']);
                    } //While 'keyof typeof global.subtab' would work, this is shorter and easier to read
                }
            }
        }
        getId('subtabs').style.display = subtabAmount >= 2 ? '' : 'none';
        getId('invisibleTab').textContent = `Current tab is ${global.tab} tab${subtabAmount >= 2 ? ` and its subtab is ${global.subtab[tab + 'Current' as 'settingsCurrent']}` : ''}`; //Tell's screen reader current tab for easier navigation
    } else if (subtab !== 'tabOnly' && subtab !== global.subtab[tab + 'Current' as 'settingsCurrent']) {
        getId(`${tab}Subtab${global.subtab[tab + 'Current' as 'settingsCurrent']}`).style.display = 'none';
        getId(`${tab}SubtabBtn${global.subtab[tab + 'Current' as 'settingsCurrent']}`).classList.remove('tabActive');
        global.subtab[tab + 'Current' as 'settingsCurrent'] = subtab;
        getId(`${tab}Subtab${global.subtab[tab + 'Current' as 'settingsCurrent']}`).style.display = '';
        getId(`${tab}SubtabBtn${global.subtab[tab + 'Current' as 'settingsCurrent']}`).classList.add('tabActive');
        if (global.screenReader && global.tab === tab) { getId('invisibleTab').textContent = `Current subtab is ${global.subtab[tab + 'Current' as 'settingsCurrent']}, part of ${tab} tab`; }
    }
    /* Update tab information (tab can be clicked to update sooner) */
    visualUpdate();
    numbersUpdate();
};

export const maxOfflineTime = () => global.timeSpecial.maxOffline = 7200 + 7200 * player.researchesAuto[2];

export const invisibleUpdate = (timeLeft = 0) => { //This is only for important or time based info
    const { time, stage, toggles } = player;
    const { timeSpecial } = global;

    const passedTime = timeLeft === 0 ? (Date.now() - time.updated) : 0;
    let passedSeconds = timeLeft === 0 ? (passedTime / 1000) : timeLeft;
    if (timeLeft === 0) { time.updated = Date.now(); }
    if (passedTime < 0) {
        return console.warn('Negative passed time detected.');
    }
    if (timeLeft === 0) { timeSpecial.lastSave += passedTime; }

    if (passedSeconds > maxOfflineTime() / 100) { //Function will call itself until this condition is false
        if (passedSeconds > timeSpecial.maxOffline) {
            passedSeconds = timeSpecial.maxOffline;
            console.log(`Offline time was reduced to it's max of ${timeSpecial.maxOffline / 3600} hours.`);
        }
        timeLeft = passedSeconds - timeSpecial.maxOffline / 100;
        passedSeconds = timeSpecial.maxOffline / 100;
    } else if (timeLeft !== 0) {
        timeLeft = 0;
    }
    if (player.strangeness[3][7] >= 1) { stage.export = Math.min(stage.export + passedSeconds / 86400, 1); }

    calculateStageInformation();
    if (global.automatization.autoE.length !== 0) { autoBuyUpgrades('researchesExtra'); }
    if (global.automatization.autoR.length !== 0) { autoBuyUpgrades('researches'); }
    if (global.automatization.autoU.length !== 0) { autoBuyUpgrades('upgrades'); }
    if (stage.current === 1 && player.upgrades[6] === 1) { calculateGainedBuildings(3, passedSeconds); }
    for (let i = global.buildingsInfo.name.length - 1; i >= 1; i--) {
        if (toggles.buildings[i] && player.researchesAuto[1] >= i) { buyBuilding(i, true); }
        if ((stage.current === 2 && i > 2) || (stage.current === 3 && i > 3)) { continue; }
        calculateGainedBuildings(i - 1, passedSeconds);
    }
    /* If weird bugs will happen because of auto and void, then split function to isolate async part and call it normally */
    if (toggles.auto[0]) { void stageResetCheck(true); }
    if (stage.current === 4 && toggles.auto[4]) { void collapseResetCheck(true); }
    if (stage.current === 3 && toggles.auto[3]) { void rankResetCheck(true); }
    if (stage.current === 2 && toggles.auto[2]) { void vaporizationResetCheck(true); }
    if (stage.current === 1 && toggles.auto[1]) { void dischargeResetCheck('interval'); }

    if (timeLeft > 0) { invisibleUpdate(timeLeft); }
};

export const numbersUpdate = () => { //This is for relevant visual info
    const { stage, buildings, upgrades } = player;
    const { tab, subtab } = global;

    if (global.footer) {
        if (stage.current === 1) {
            getId('quarks').textContent = format(buildings[0].current);
            if (player.discharge.energyMax >= 9) { getId('energy').textContent = format(player.discharge.energyCur, 0); }
        } else if (stage.current === 2) {
            getId('water').textContent = format(buildings[0].current);
            if (tab !== 'stage') { getId('drops').textContent = format(buildings[1].current); }
            if (upgrades[1] === 1) { getId('clouds').textContent = format(player.vaporization.clouds); }
        } else if (stage.current === 3) {
            getId('mass').textContent = format(buildings[0].current);
        } else if (stage.current >= 4) {
            getId('solarMass').textContent = format(player.collapse.mass);
            getId('elements').textContent = format(buildings[0].current);
        }
    }
    if (tab === 'stage') {
        const { buildingsInfo, lastUpgrade } = global;
        const { shop } = player.toggles;

        for (let i = 1; i < buildingsInfo.name.length; i++) {
            getId(`building${i}True`).textContent = `[${format(buildings[i].true, 0)}]`;
            getId(`building${i}Cur`).textContent = format(buildings[i].current);
            getId(`building${i}Prod`).textContent = format(buildingsInfo.producing[i]);
            let e = i - 1;
            if (stage.current === 2 && i !== 1) {
                e = 1; //Drops
            } else if (stage.current >= 3) {
                e = 0; //Mass || Elements
            }

            if (stage.current >= 4 && player.collapse.mass < global.collapseInfo.unlockB[i]) {
                getId(`building${i}`).classList.remove('availableBuilding');
                getId(`building${i}Btn`).textContent = `Unlocked at ${format(global.collapseInfo.unlockB[i])} Mass`;
                getId(`building${i}BuyX`).textContent = 'Locked';
                continue;
            }

            let totalCost: number;
            let totalBuy: number;
            if (player.researchesAuto[0] === 0 || shop.howMany === 1 || (buildingsInfo.cost[i] > buildings[e].current && (!shop.strict || shop.howMany === -1))) {
                totalCost = buildingsInfo.cost[i];
                totalBuy = 1;
            } else {
                const totalBefore = buildingsInfo.startCost[i] * ((buildingsInfo.increase[i] ** buildings[i].true - 1) / (buildingsInfo.increase[i] - 1));
                const maxAfford = shop.strict && shop.howMany !== -1 ? 1 : Math.trunc(Math.log((totalBefore + buildings[e].current) * (buildingsInfo.increase[i] - 1) / buildingsInfo.startCost[i] + 1) / Math.log(buildingsInfo.increase[i])) - buildings[i].true;
                totalBuy = shop.howMany === -1 ? maxAfford : shop.strict ? shop.howMany : Math.min(maxAfford, shop.howMany);
                totalCost = buildingsInfo.startCost[i] * ((buildingsInfo.increase[i] ** (totalBuy + buildings[i].true) - 1) / (buildingsInfo.increase[i] - 1)) - totalBefore;
            }

            if (totalCost <= buildings[e].current) {
                getId(`building${i}`).classList.add('availableBuilding');
                getId(`building${i}Btn`).textContent = `Make for: ${format(totalCost)} ${buildingsInfo.name[e]}`;
                getId(`building${i}BuyX`).textContent = format(totalBuy);
            } else {
                getId(`building${i}`).classList.remove('availableBuilding');
                getId(`building${i}Btn`).textContent = `Need: ${format(totalCost)} ${buildingsInfo.name[e]}`;
                getId(`building${i}BuyX`).textContent = format(totalBuy);
            }
        }
        if (stage.current === 1) {
            getId('dischargeReset').textContent = `Next goal is ${format(global.dischargeInfo.next, 0)} Energy`;
            getId('dischargeEffect').textContent = format(global.upgradesInfo.effect[3], 0);
        } else if (stage.current === 2) {
            getId('vaporizationReset').textContent = `Reset for ${format(global.vaporizationInfo.get)} Clouds`;
        } else if (stage.current >= 4) {
            getId('collapseReset').textContent = `Collapse to ${format(global.collapseInfo.newMass)} Mass`;
            for (let i = 1; i <= player.researchesExtra[0]; i++) {
                getId(`starSpecial${i}Cur`).textContent = format(player.collapse.stars[i - 1], 0);
                getId(`starSpecial${i}Get`).textContent = format(global.collapseInfo.starCheck[i - 1], 0);
            }
        }

        if (lastUpgrade[0] !== null && lastUpgrade[2]) { getUpgradeDescription(lastUpgrade[0], lastUpgrade[1]); }
    } else if (tab === 'research') {
        const { lastResearch } = global;

        if (lastResearch[0] !== null && lastResearch[2]) { getUpgradeDescription(lastResearch[0], lastResearch[1]); }
    } else if (tab === 'strangeness') {
        getId('strange0Cur').textContent = format(player.strange[0].true, 0);
        getId('strange0Prod').textContent = 'none'; /*format(global.strangeInfo.producing[0])*/
        getId('strange0Gain').textContent = format(global.strangeInfo.stageGain + 1, 0);
    } else if (tab === 'settings') {
        if (subtab.settingsCurrent === 'settings') {
            if (global.timeSpecial.lastSave >= 1000) { getId('isSaved').textContent = `${format(global.timeSpecial.lastSave, 0, 'time')} ago`; }
            getId('exportGain').textContent = format(stage.export);
        } else if (subtab.settingsCurrent === 'stats') {
            getId('firstPlay').textContent = `${format(Date.now() - player.time.started, 0, 'time')} ago`;
            getId('stageResetsCount').textContent = format(stage.resets, 0);
            getId('maxOfflineStat').textContent = `${maxOfflineTime() / 3600} hours`;
            for (let i = 0; i < player.buildings.length; i++) {
                if (buildings[i].trueTotal === 0) { continue; } //Not break, because you might be able to make building out of order (probably)
                getId(`building${i}StatTotal`).textContent = format(buildings[i].total);
                getId(`building${i}StatTrueTotal`).textContent = format(buildings[i].trueTotal);
            }
            if (stage.current === 1) {
                getId('maxEnergyStat').textContent = format(player.discharge.energyMax, 0);
                getId('dischargeStat').textContent = format(player.discharge.current, 0);
                getId('dischargeStatsBonus').textContent = `[+${format(player.strangeness[0][2], 0)}]`;
            }
        }
    }
};

export const visualUpdate = () => { //This is everything that can be shown later
    const { stage, buildings, upgrades, researchesAuto, strangeness } = player;
    const { screenReader } = global;

    /* Most are hidden through stageCheck(); */
    if (stage.current === 1) {
        const { discharge } = player;

        getId('energyStat').style.display = discharge.energyMax >= 9 ? '' : 'none';
        getId('discharge').style.display = upgrades[3] === 1 ? '' : 'none';
        getId('building2').style.display = buildings[1].trueTotal >= 11 ? '' : 'none';
        getId('building3').style.display = buildings[2].trueTotal >= 2 ? '' : 'none';
        if (discharge.energyMax >= 9) { getId('upgrades').style.display = ''; }
        if (discharge.current >= 1) { getId('resetToggles').style.display = ''; }
        for (let i = 5; i <= 8; i++) {
            getId(`upgrade${i}`).style.display = discharge.current >= 3 ? '' : 'none';
        }
        if (discharge.current >= 4) { getId('researchTabBtn').style.display = ''; }
        if (upgrades[7] === 1) { getId('stage').style.display = ''; }
        getId('toggleAuto1').style.display = strangeness[0][3] >= 1 ? '' : 'none';
        getId('stageReset').textContent = buildings[3].current >= 1.67e21 ? 'Enter next stage' : 'You are not ready';
        if (screenReader) { getId('invisibleGetResource1').style.display = discharge.energyMax > 0 ? '' : 'none'; }

        if (global.tab === 'settings' && global.subtab.settingsCurrent === 'stats') {
            getId('energyStats').style.display = discharge.energyMax >= 9 ? '' : 'none';
            getId('dischargeStats').style.display = discharge.current >= 1 || strangeness[0][2] >= 1 ? '' : 'none';
            getId('dischargeStatsBonus').style.display = strangeness[0][2] >= 1 ? '' : 'none';
        }

        if (!player.events[0] && upgrades[4] === 1) { playEvent(0); }
    } else if (stage.current === 2) {
        const { vaporization } = player;

        getId('dropStat').style.display = global.tab !== 'stage' ? '' : 'none';
        getId('cloudStat').style.display = upgrades[1] === 1 ? '' : 'none';
        getId('vaporization').style.display = upgrades[1] === 1 ? '' : 'none';
        getId('vaporizationToggleReset').style.display = stage.true > 2 || vaporization.clouds > 1 ? '' : 'none';
        getId('cloudResearch').style.display = vaporization.clouds > 1 ? '' : 'none';
        getId('building2').style.display = buildings[1].trueTotal >= 300 ? '' : 'none';
        getId('building3').style.display = buildings[1].trueTotal >= 5e6 ? '' : 'none';
        getId('building4').style.display = buildings[1].trueTotal >= 5e17 ? '' : 'none';
        getId('building5').style.display = buildings[1].trueTotal >= 5e22 ? '' : 'none';
        getId('upgradeW3').style.display = buildings[2].trueTotal >= 1 ? '' : 'none';
        getId('upgradeW4').style.display = buildings[2].trueTotal >= 1 ? '' : 'none';
        getId('researchW3').style.display = buildings[2].trueTotal >= 1 ? '' : 'none';
        getId('researchW4').style.display = buildings[2].trueTotal >= 1 ? '' : 'none';
        getId('upgradeW2').style.display = buildings[3].trueTotal >= 1 ? '' : 'none';
        getId('upgradeW5').style.display = buildings[3].trueTotal >= 1 ? '' : 'none';
        getId('researchW5').style.display = buildings[3].trueTotal >= 1 ? '' : 'none';
        getId('upgradeW6').style.display = buildings[4].trueTotal >= 1 ? '' : 'none';
        getId('researchW6').style.display = buildings[4].trueTotal >= 1 ? '' : 'none';
        getId('researchClouds3').style.display = buildings[5].trueTotal >= 1 ? '' : 'none';
        getId('upgradeW7').style.display = buildings[5].trueTotal >= 1 && strangeness[1][2] >= 3 ? '' : 'none';
        getId('toggleAuto2').style.display = strangeness[1][4] >= 1 ? '' : 'none';
        getId('toggleAuto2Mark').style.display = strangeness[1][4] >= 1 ? '' : 'none';
        getId('stageReset').textContent = buildings[1].current >= 1.194e29 ? 'Enter next stage' : 'You are not ready';
        if (screenReader) { getId('invisibleGetResource1').style.display = upgrades[1] === 1 ? '' : 'none'; }

        if (!player.events[0] && global.vaporizationInfo.get + vaporization.clouds > 1e4) { playEvent(1); }
    } else if (stage.current === 3) {
        const { accretion } = player;

        getId('buildings').style.display = accretion.rank !== 0 ? '' : 'none';
        getId('upgrades').style.display = accretion.rank >= 1 ? '' : 'none';
        getId('stageResearch').style.display = accretion.rank >= 1 ? '' : 'none';
        getId('upgradeA3').style.display = accretion.rank >= 2 ? '' : 'none';
        getId('rankResearch').style.display = accretion.rank >= 2 ? '' : 'none';
        getId('researchRank2').style.display = accretion.rank >= 3 ? '' : 'none';
        getId('upgradeA5').style.display = accretion.rank >= 3 ? '' : 'none';
        getId('researchA5').style.display = accretion.rank >= 3 ? '' : 'none';
        getId('upgradeA6').style.display = accretion.rank >= 4 || upgrades[4] === 1 ? '' : 'none';
        getId('researchA6').style.display = accretion.rank >= 4 || upgrades[4] === 1 ? '' : 'none';
        getId('upgradeA7').style.display = accretion.rank >= 4 ? '' : 'none';
        getId('upgradeA8').style.display = accretion.rank >= 4 ? '' : 'none';
        getId('upgradeA9').style.display = accretion.rank >= 4 ? '' : 'none';
        getId('researchA7').style.display = accretion.rank >= 4 ? '' : 'none';
        getId('researchRank3').style.display = accretion.rank >= 4 ? '' : 'none';
        getId('upgradeA10').style.display = accretion.rank >= 5 ? '' : 'none';
        getId('upgradeA11').style.display = accretion.rank >= 5 ? '' : 'none';
        getId('upgradeA12').style.display = accretion.rank >= 5 ? '' : 'none';
        getId('researchA8').style.display = accretion.rank >= 5 ? '' : 'none';
        getId('researchRank4').style.display = accretion.rank >= 5 ? '' : 'none';
        getId('upgradeA4').style.display = buildings[2].trueTotal >= 1 ? '' : 'none';
        getId('researchA3').style.display = buildings[2].trueTotal >= 1 ? '' : 'none';
        getId('researchA4').style.display = buildings[2].trueTotal >= 1 ? '' : 'none';
        getId('rankToggleReset').style.display = stage.true > 3 || accretion.rank >= 2 ? '' : 'none';
        getId('building2').style.display = upgrades[2] === 1 ? '' : 'none';
        getId('building3').style.display = upgrades[4] === 1 ? '' : 'none';
        getId('building4').style.display = upgrades[6] === 1 ? '' : 'none';
        getId('toggleAuto3').style.display = strangeness[2][4] >= 1 ? '' : 'none';
        getId('stageReset').textContent = buildings[0].current >= 2.47e31 ? 'Enter next stage' : 'You are not ready';

        if (global.tab === 'settings' && global.subtab.settingsCurrent === 'stats') {
            for (let i = 0; i < global.accretionInfo.rankImage.length; i++) {
                getId(`rankStat${i}`).style.display = accretion.rank >= i ? '' : 'none';
            }
        }

        if (!player.events[0] && buildings[0].current >= 5e29) { playEvent(2); }
    } else if (stage.current >= 4) {
        const { collapse, researchesExtra } = player;

        getId('collapse').style.display = upgrades[0] === 1 ? '' : 'none';
        getId('collapseToggleReset').style.display = stage.true > 4 || collapse.mass > 0.01235 ? '' : 'none';
        getId('starsSpecial').style.display = researchesExtra[0] >= 1 ? '' : 'none';
        getId('starSpecial2').style.display = researchesExtra[0] >= 2 ? '' : 'none';
        getId('starSpecial3').style.display = researchesExtra[0] >= 3 ? '' : 'none';
        getId('starResearch').style.display = buildings[2].trueTotal > 0 ? '' : 'none';
        getId('elementsGrid').style.display = upgrades[2] === 1 ? '' : 'flex';
        for (let i = 6; i <= 10; i++) {
            getId(`element${i}`).style.display = upgrades[2] === 1 ? '' : 'none';
        }
        upgrades[2] === 1 && collapse.mass < 10 ?
            getId('elementsGrid').classList.add('Elements10App') :
            getId('elementsGrid').classList.remove('Elements10App');
        for (let i = 11; i <= 26; i++) {
            getId(`element${i}`).style.display = collapse.mass >= 10 ? '' : 'none';
        }
        getId('building2').style.display = upgrades[1] === 1 ? '' : 'none';
        getId('building3').style.display = upgrades[2] === 1 ? '' : 'none';
        getId('building4').style.display = collapse.mass >= 10 ? '' : 'none';
        getId('toggleAuto4').style.display = strangeness[3][5] >= 1 ? '' : 'none';
        getId('toggleAuto4Mark').style.display = strangeness[3][5] >= 1 ? '' : 'none';
        getId('researchS4').style.display = strangeness[3][2] >= 1 ? '' : 'none';
        getId('upgradeS4').style.display = strangeness[3][2] >= 2 ? '' : 'none';
        getId('element27').style.display = upgrades[3] === 1 ? '' : 'none';
        getId('element28').style.display = upgrades[3] === 1 ? '' : 'none';
        getId('researchStar2').style.display = strangeness[3][2] >= 3 ? '' : 'none';
        getId('stageReset').textContent = stage.current === 5 ? 'Return back to start' : 'You are not ready';
        if (screenReader) { getId('invisibleGetResource1').style.display = upgrades[0] === 1 ? '' : 'none'; }

        if (!player.events[0] && researchesExtra[0] >= 1) { playEvent(3); }
    }
    if (stage.true >= 5) {
        getId('toggleBuilding0').style.display = researchesAuto[1] >= 1 && researchesAuto[0] >= 2 ? '' : 'none';
        getId('researchAuto4').style.display = strangeness[2][6] >= 1 ? '' : 'none';
        getId('autoTogglesUpgrades').style.display = researchesAuto[3] >= 1 ? '' : 'none';
        getId('autoToggle6').style.display = researchesAuto[3] >= 2 ? '' : 'none';
        getId('autoToggle7').style.display = researchesAuto[3] >= 3 ? '' : 'none';
        getId('exportSpecial').style.display = strangeness[3][7] >= 1 ? '' : 'none';
    }

    for (let i = 1; i < global.buildingsInfo.name.length; i++) {
        getId(`building${i}True`).style.display = buildings[i].current !== buildings[i].true ? '' : 'none';
        getId(`toggleBuilding${i}`).style.display = researchesAuto[1] >= i ? '' : 'none';
        getId(`building${i}Stats`).style.display = buildings[i].trueTotal > 0 ? '' : 'none';
        getId(`building${i}BuyDiv`).style.display = researchesAuto[0] > 0 ? '' : 'none';
        if (screenReader) { getId(`invisibleGetBuilding${i}`).style.display = buildings[i].trueTotal > 0 ? '' : 'none'; }
    }
    getId('toggleBuy').style.display = researchesAuto[0] > 0 ? '' : 'none';
};

export const getUpgradeDescription = (index: number, type: 'upgrades' | 'elements' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'strangeness', extra = 0) => {
    const { stage } = player;
    const { stageInfo } = global;

    if (type === 'researches' || type === 'researchesAuto' || type === 'researchesExtra') {
        let typeInfo = 'researchesAutoInfo' as 'researchesAutoInfo' | 'researchesS2Info';
        if (type !== 'researchesAuto') { typeInfo = getUpgradeType(type) as 'researchesS2Info'; }
        global.lastResearch = [index, type, global[typeInfo].effect[index] !== null];

        /* Special cases */
        if (type === 'researchesAuto' && index === 1) {
            const autoIndex = Math.min(player.researchesAuto[1] + 1, global.buildingsInfo.name.length - 1);
            global.researchesAutoInfo.effect[1] = player.buildings[autoIndex].trueTotal !== 0 ? global.buildingsInfo.name[autoIndex] : '(unknown)';
        } else if (stage.current >= 4 && type === 'researchesExtra' && index === 0) {
            const starIndex = Math.min(player.researchesExtra[0] + 2, global.buildingsInfo.name.length - 1);
            global.researchesExtraS4Info.effect[0] = player.buildings[starIndex].trueTotal !== 0 ? global.buildingsInfo.name[starIndex] : '(Unknown)';
        }

        /* To explain: Effect.textContent = effectText[0] + effect[n] + effectText[1];
           Unless effect[n] === null, then it just Effect.textContent = effectText[0] */
        getId('researchText').textContent = global[typeInfo].description[index];
        getId('researchEffect').textContent = `${global[typeInfo].effectText[index][0]}${format(global[typeInfo].effect[index] ?? '')}${global[typeInfo].effect[index] !== null ? `${global[typeInfo].effectText[index][1]}` : ''}`;
        getId('researchCost').textContent = player[type][index] === global[typeInfo].max[index] ? 'Maxed.' :
            type === 'researchesAuto' && index !== 1 && stage.current !== stageInfo.autoStage[index] ? `Can't be created outside of ${stageInfo.word[stageInfo.autoStage[index] - 1]} stage.` :
            stage.current >= 4 && type === 'researches' && global.collapseInfo.unlockR[index] > player.collapse.mass ? `Unlocked at ${format(global.collapseInfo.unlockR[index])} Mass.` :
            `${format(global[typeInfo].cost[index])} ${stageInfo.priceName}.`;
    } else if (type === 'elements') {
        const typeInfo = 'elementsInfo' as const;

        getId('elementText').textContent = global[typeInfo].description[index];
        getId('elementEffect').textContent = player[type][index] === 1 || player.collapse.show >= index ? `${global[typeInfo].effectText[index][0]}${format(global[typeInfo].effect[index] ?? '')}${global[typeInfo].effect[index] !== null ? `${global[typeInfo].effectText[index][1]}` : ''}` : 'Effect is not yet known.';
        getId('elementCost').textContent = player[type][index] === 1 ? 'Obtained.' : `${format(global[typeInfo].cost[index])} ${stageInfo.priceName}.`;
    } else if (type === 'upgrades') {
        const typeInfo = getUpgradeType(type) as 'upgradesS2Info';
        global.lastUpgrade = [index, type, global[typeInfo].effect[index] !== null];

        getId('upgradeText').textContent = global[typeInfo].description[index];
        getId('upgradeEffect').textContent = `${global[typeInfo].effectText[index][0]}${format(global[typeInfo].effect[index] ?? '')}${global[typeInfo].effect[index] !== null ? `${global[typeInfo].effectText[index][1]}` : ''}`;
        getId('upgradeCost').textContent = player[type][index] === 1 ? 'Created.' :
            stage.current >= 4 && global.collapseInfo.unlockU[index] > player.collapse.mass ? `Unlocked at ${format(global.collapseInfo.unlockU[index])} Mass.` :
            `${format(global[typeInfo].cost[index])} ${stageInfo.priceName}.`;
    } else {
        const typeInfo = 'strangenessInfo' as const;

        /* Special cases */
        if ((extra === 0 && index === 6) || (extra === 1 && index === 5)) { //Auto only to save space
            global.strangenessInfo[extra].effect[index] = extra === stage.current - 1 ? global.buildingsInfo.name[Math.min(player.strangeness[0][6] + 1, global.buildingsInfo.name.length - 1)] : '(unavailable)';
        }

        getId('strangenessStage').style.color = stageInfo.textColor[extra];
        getId('strangenessStage').textContent = `${stageInfo.word[extra]}.`;
        getId('strangenessText').textContent = ` ${global[typeInfo][extra].description[index]}`;
        getId('strangenessEffect').textContent = `${global[typeInfo][extra].effectText[index][0]}${format(global[typeInfo][extra].effect[index] ?? '')}${global[typeInfo][extra].effect[index] !== null ? `${global[typeInfo][extra].effectText[index][1]}` : ''}`;
        getId('strangenessCost').textContent = player[type][extra][index] === global[typeInfo][extra].max[index] ? 'Maxed.' : `${format(global[typeInfo][extra].cost[index])} Strange quarks.`;
    }
};

export const visualUpdateUpgrades = (index: number, type: 'upgrades' | 'elements' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'strangeness', extraNum = 0) => {
    const { stage } = player;

    let typeInfo = 'researchesAutoInfo' as 'researchesAutoInfo' | 'researchesS2Info'; //If to add as 'upgradesS2Info' or 'elementsInfo', TS won't realize that code bellow has check for property 'max'...
    if (type === 'elements') {
        typeInfo = 'elementsInfo' as 'researchesS2Info';
    } else if (type === 'strangeness') {
        typeInfo = 'strangenessInfo' as 'researchesS2Info';
    } else if (type !== 'researchesAuto') {
        typeInfo = getUpgradeType(type) as 'researchesS2Info';
    }

    let extra = '';
    if (type === 'researchesAuto') {
        extra = 'Auto';
    } else if (type === 'strangeness') {
        extra = `Stage${extraNum + 1}`;
    } else if (stage.current === 2) {
        if (type === 'researches' || type === 'upgrades') {
            extra = 'W';
        } else if (type === 'researchesExtra') {
            extra = 'Clouds';
        }
    } else if (stage.current === 3) {
        if (type === 'researches' || type === 'upgrades') {
            extra = 'A';
        } else if (type === 'researchesExtra') {
            extra = 'Rank';
        }
    } else if (stage.current >= 4) {
        if (type === 'researches' || type === 'upgrades') {
            extra = 'S';
        } else if (type === 'researchesExtra') {
            extra = 'Star';
        }
    }

    let upgradeHTML: HTMLElement;
    if (type === 'researches' || type === 'researchesAuto' || type === 'researchesExtra') {
        upgradeHTML = getId(`research${extra}${index + 1}Level`);
    } else if (type === 'elements') {
        upgradeHTML = getId(`element${index}`);
    } else if (type === 'strangeness') {
        upgradeHTML = getId(`strange${index + 1}${extra}Level`);
    } else {
        upgradeHTML = getId(`upgrade${extra}${index + 1}`);
    }

    if (type !== 'strangeness') {
        if (Object.hasOwn(global[typeInfo], 'max')) {
            getId(`research${extra}${index + 1}Max`).textContent = `${global[typeInfo].max[index]}`;
            upgradeHTML.textContent = `${player[type][index]}`;
            if (player[type][index] === global[typeInfo].max[index]) {
                upgradeHTML.style.color = 'var(--green-text-color)';
            } else if (player[type][index] === 0) {
                upgradeHTML.style.color = ''; //Red
            } else {
                upgradeHTML.style.color = 'var(--orchid-text-color)';
            }
        } else {
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
                if (stage.current === 2) {
                    color = 'darkgreen';
                } else if (stage.current === 3) {
                    color = '#0000b1'; //Darker blue
                } else if (stage.current >= 4) {
                    color = '#1f1f8f'; //Brigher midnightblue
                }
            }
            upgradeHTML.style.backgroundColor = player[type][index] === 1 ? color : '';
        }
    } else {
        //getId(`strange${index + 1}${extra}Max`).textContent = `${global[typeInfo as 'strangenessInfo'][extraNum].max[index]}`;
        upgradeHTML.textContent = `${player[type][extraNum][index]}`;
        if (player[type][extraNum][index] === global[typeInfo as 'strangenessInfo'][extraNum].max[index]) {
            upgradeHTML.style.color = 'var(--green-text-color)';
        } else if (player[type][extraNum][index] === 0) {
            upgradeHTML.style.color = ''; //Red
        } else {
            upgradeHTML.style.color = 'var(--orchid-text-color)';
        }
    }
};

export const updateRankInfo = () => {
    const { accretion } = player;
    const { accretionInfo } = global;
    const image = getId('rankImage') as HTMLImageElement;
    const name = getId('rankName') as HTMLSpanElement;

    //Important Rank information
    accretionInfo.rankCost[4] = player.events[0] ? 5e29 : 0;

    //Visuals
    getId('rankMessage').textContent = accretion.rank === 0 ?
        'Might need more than just water... You can increase rank with Mass.' :
        'You can increase it with Mass. (Return back to Dust, but unlock something new)';
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

export const format = (input: number | string, digits = 'auto' as 'auto' | number, type = 'number' as 'number' | 'input' | 'time'): string => {
    if (typeof input !== 'number') { return input; } //String's are being send here (for a reason)
    const precision = digits === 'auto' ? (input < 1e3 ? (input < 1 ? 4 : 2) : 0) : digits;
    switch (type) { //toLocaleString() is banned, I don't want that slowness and weird behavior
        case 'input':
        case 'number':
            if (!isFinite(input)) { return 'Infinity'; }
            if (input >= 1e6 || (input < 1e-3 && input > 0)) { //Format for these cases
                const digits = Math.floor(Math.log10(input));
                const endValue = Math.round(input / 10 ** (digits - 2)) / 100; //I feel like I am losing my mind to floats
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
                return `${Math.trunc(input / 86400000)} days`;
            } else if (input >= 7200000) {
                return `${Math.trunc(input / 3600000)} hours`;
            } else if (input >= 600000) {
                return `${Math.trunc(input / 60000)} minutes`;
            } else {
                return `${Math.trunc(input / 1000)} seconds`;
            }
    }
};

export const stageCheck = (extra = '' as 'soft' | 'reload') => {
    const { stage } = player;
    const { stageInfo, buildingsInfo, researchesAutoInfo } = global;

    //Add (change) unique information
    if (stage.current === 1) {
        stageInfo.priceName = 'Energy';
        buildingsInfo.name = ['Quarks', 'Particles', 'Atoms', 'Molecules']; //Assign new constants
        buildingsInfo.type = ['producing', 'producing', 'producing', 'producing'];
        buildingsInfo.increase = [0, 1.4, 1.4, 1.4];
        globalStart.buildingsInfo.startCost = [0, 3, 24, 3];
        globalStart.researchesAutoInfo.cost[1] = 4000;
        researchesAutoInfo.scaling[1] = 8000;
    } else if (stage.current === 2) {
        stageInfo.priceName = 'Drops';
        buildingsInfo.name = ['Moles', 'Drops', 'Puddles', 'Ponds', 'Lakes', 'Seas'];
        buildingsInfo.type = ['producing', 'producing', 'producing', 'improves', 'improves', 'improves'];
        buildingsInfo.increase = [0, 1.2, 1.2, 1.2, 1.2, 1.2];
        globalStart.buildingsInfo.startCost = [0, 0.0028, 100, 1e7, 1e18, 1e23];
        globalStart.researchesAutoInfo.cost[1] = 1e10;
        researchesAutoInfo.scaling[1] = 1000;
    } else if (stage.current === 3) {
        stageInfo.priceName = 'Mass';
        buildingsInfo.name = ['Mass', 'Cosmic dust', 'Planetesimals', 'Protoplanets', 'Satellites'];
        buildingsInfo.type = ['producing', 'producing', 'producing', 'producing', 'improves'];
        buildingsInfo.increase = [0, 1.15, 1.15, 1.15, 10];
        globalStart.buildingsInfo.startCost = [0, 1e-19, 1e-9, 1e21, 1e17];
        globalStart.researchesAutoInfo.cost[1] = 1e-7;
        researchesAutoInfo.scaling[1] = 1e17;
        updateRankInfo();
    } else if (stage.current >= 4) {
        stageInfo.priceName = 'Elements';
        buildingsInfo.name = ['Elements', 'Brown dwarfs', 'Main sequence', 'Red supergiants', 'Blue hypergiants'];
        buildingsInfo.type = ['producing', 'producing', 'producing', 'producing', 'producing'];
        buildingsInfo.increase = [0, 1.4, 1.55, 1.70, 1.85];
        globalStart.buildingsInfo.startCost = [0, 1, 1e5, 1e16, 1e31];
        globalStart.researchesAutoInfo.cost[1] = 1e6;
        researchesAutoInfo.scaling[1] = 1e11;
        for (let i = 1; i < global.elementsInfo.cost.length; i++) { visualUpdateUpgrades(i, 'elements'); }
    }
    calculateStageInformation();

    //Remove (hide) all information that might be missing in a new stage
    getId('buildings').style.display = '';
    for (let i = buildingsInfo.name.length; i < playerStart.buildings.length; i++) {
        getId(`building${i}`).style.display = 'none';
        getId(`building${i}Stats`).style.display = 'none';
        if (global.screenReader) { getId(`invisibleGetBuilding${i}`).style.display = 'none'; }
    }
    if (extra !== 'soft') { //I should probably add more into here...
        for (const text of ['upgrade', 'research', 'element']) {
            getId(`${text}Text`).textContent = 'Hover to see.';
            getId(`${text}Effect`).textContent = 'Hover to see.';
            getId(`${text}Cost`).textContent = 'Resource.';
        }
        if (extra === 'reload') {
            getId('strangenessStage').textContent = '';
            getId('strangenessText').textContent = 'Hover to see.';
            getId('strangenessEffect').textContent = 'Hover to see.';
            getId('strangenessCost').textContent = 'Strange quarks.';
            for (let s = 0; s < global.strangenessInfo.length; s++) {
                for (let i = 0; i < global.strangenessInfo[s].cost.length; i++) {
                    calculateResearchCost(i, 'strangeness', s);
                    visualUpdateUpgrades(i, 'strangeness', s);
                }
            }
        }
        global.lastUpgrade[0] = null;
        global.lastResearch[0] = null;
    }

    //Hide | show stage specific information (what isn't here is already in visualUpdate())
    for (let s = 1; s <= 5; s++) {
        for (const i of getClass(`stage${s}Only`)) {
            if (s <= 3) {
                i.style.display = stage.current === s ? '' : 'none';
            } else {
                i.style.display = stage.current >= s ? '' : 'none';
            }
        }
    }

    for (const i of getClass('stage2Unlock')) { i.style.display = stage.true >= 2 ? '' : 'none'; }
    for (const i of getClass('stage5Unlock')) { i.style.display = stage.true >= 5 ? '' : 'none'; }
    if (localStorage.getItem('theme') !== null) { getId('themeArea').style.display = ''; }
    for (let i = 2; i <= stageInfo.word.length; i++) { getId(`switchTheme${i}`).style.display = stage.true >= i ? '' : 'none'; }
    if (stage.true >= 5) {
        for (let i = 2; i <= 4; i++) {
            getId(`strangenessSection${i}`).style.display = stage.resets >= i + 3 ? '' : 'none';
        }
        if (player.strange[0].total < 1) { getId('strangenessTabBtn').style.display = 'none'; }
        //stage.resets >= 8 || (stage.current === 5 && stage.resets >= 7) ? '' : 'none';
        //Section, stage.resets >= 11 || (stage.current === 5 && stage.resets >= 7) ? '' : 'none';
        if (stage.resets < 15) { getId('toggleAuto0').style.display = 'none'; }
        if (stage.resets < 15) { getId('toggleAuto0Mark').style.display = 'none'; }
    }

    //Buildings, researches and upgrades
    for (let i = 1; i < buildingsInfo.name.length; i++) {
        buildingsInfo.startCost[i] = globalStart.buildingsInfo.startCost[i];
        getId(`building${i}`).style.color = stage.current >= 5 ? 'var(--orange-text-color)' : '';
        getId(`building${i}StatName`).style.color = stage.current >= 5 ? 'var(--orange-text-color)' : '';
        getId(`building${i}StatName`).textContent = buildingsInfo.name[i];
        getId(`building${i}Name`).textContent = buildingsInfo.name[i];
        getId(`building${i}Type`).textContent = buildingsInfo.type[i];
        calculateBuildingsCost(i);
    }
    getId('building0StatName').style.color = stage.current >= 5 ? 'var(--orange-text-color)' : '';
    getId('building0StatName').textContent = buildingsInfo.name[0];

    const upgradeType = getUpgradeType('upgrades') as 'upgradesS2Info';
    const researchType = getUpgradeType('researches') as 'researchesS2Info';
    const researchExtraType = getUpgradeType('researchesExtra') as 'researchesExtraS2Info';

    //Should be before calculateMaxLevel();
    autoBuyUpgrades('upgrades', true);
    global.automatization.autoR = [];
    global.automatization.autoE = [];

    for (let i = 0; i < global[upgradeType].cost.length; i++) { visualUpdateUpgrades(i, 'upgrades'); }
    //If max level can change it will update it, if max level always same, then it will only calculateResearchCost(); and visualUpdateUpgrades();
    for (let i = 0; i < global[researchType].cost.length; i++) { calculateMaxLevel(i, 'researches'); }
    if (stage.current !== 1) { //No idea if stage 1 will ever have it
        for (let i = 0; i < global[researchExtraType].cost.length; i++) { calculateMaxLevel(i, 'researchesExtra'); }
    }
    for (let i = 0; i < researchesAutoInfo.cost.length; i++) { calculateMaxLevel(i, 'researchesAuto'); }

    //Special information
    const body = document.body.style;
    getId('stageWord').textContent = stageInfo.word[stage.current - 1];
    if (stage.current === 1) {
        body.removeProperty('--border-image');
        body.removeProperty('--border-stage');
        body.removeProperty('--stage-text-color');
    } else {
        body.setProperty('--border-image', `url(Used_art/Stage${stage.current}%20border.png)`);
        body.setProperty('--border-stage', stageInfo.borderColor[stage.current - 1]);
        body.setProperty('--stage-text-color', stageInfo.textColor[stage.current - 1]);
    }
    if (global.screenReader) {
        getId('invisibleBought').textContent = `Current stage is '${stageInfo.word[stage.current - 1]}'`;
        if (stage.current === 3) {
            getId('invisibleGetResource1').style.display = 'none';
        } else { //'Rank' is never used
            stageInfo.resourceName = ['Energy', 'Clouds', 'Rank', 'Stars'][Math.min(stage.current - 1, 3)];
            getId('invisibleGetResource1').textContent = `Get information for ${stageInfo.resourceName}`;
        }
        for (let i = 0; i < buildingsInfo.name.length; i++) {
            getId(`invisibleGetBuilding${i}`).textContent = `Get information for ${buildingsInfo.name[i]}`;
        }
        getId('invisibleGetResource2').style.display = player.strange[0].total > 0 ? '' : 'none';
    }
    visualUpdate();
};
