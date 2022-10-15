import { getClass, getId } from './Main';
import { global, globalStart, player, playerStart } from './Player';
import { playEvent } from './Special';
import { buyBuilding, calculateBuildingsCost, calculateGainedBuildings, calculateResearchCost } from './Stage';

export const switchTab = (tab = 'none', subtab = 'tabOnly') => {
    if (global.tab !== tab && subtab === 'tabOnly') {
        /* First remove current tab, then show new tab */
        getId(`${global.tab}Tab`).style.display = 'none';
        getId(`${global.tab}TabBtn`).classList.remove('tabActive');
        global.tab = tab !== 'none' ? tab : 'stage';
        getId(`${global.tab}Tab`).style.display = '';
        getId(`${global.tab}TabBtn`).classList.add('tabActive');
        getId('invisibleTab').textContent = `Current tab is ${global.tab} tab`; //Tell's screen reader current tab for easier navigation

        /* Subtabs */
        getId('subtabs').style.display = Object.hasOwn(global.subtab, tab + 'Current') ? '' : 'none';
        getId('settingsSubtabBtnsettings').style.display = global.tab === 'settings' ? '' : 'none';
        getId('settingsSubtabBtnstats').style.display = global.tab === 'settings' ? '' : 'none';
    } else if (subtab !== 'tabOnly' && subtab !== global.subtab[tab + 'Current' as 'settingsCurrent']) {
        getId(`${tab}Subtab${global.subtab[tab + 'Current' as 'settingsCurrent']}`).style.display = 'none';
        getId(`${tab}SubtabBtn${global.subtab[tab + 'Current' as 'settingsCurrent']}`).classList.remove('tabActive');
        global.subtab[tab + 'Current' as 'settingsCurrent'] = subtab;
        getId(`${tab}Subtab${global.subtab[tab + 'Current' as 'settingsCurrent']}`).style.display = '';
        getId(`${tab}SubtabBtn${global.subtab[tab + 'Current' as 'settingsCurrent']}`).classList.add('tabActive');
        //Also 'as keyof typeof global.subtab' would work as well, but this is shorter
        if (global.screenReader && global.tab === tab) { getId('invisibleTab').textContent = `Current subtab is ${global.subtab[tab + 'Current' as 'settingsCurrent']} subtab`; }
    }
    /* Update tab information (tab can be clicked to update sooner) */
    visualUpdate();
    numbersUpdate();
};

//Because it's an arrow function, removing {}, allows to auto return (base + bonus)
export const maxOfflineTime = () => global.timeSpecial.maxOffline = 7200 + 7200 * player.researchesAuto[2];

export const invisibleUpdate = (timeLeft = 0) => { //This is only for important or time based info
    const { stage, time, buildings, upgrades, researches, researchesExtra, researchesAuto, toggles } = player;
    const { timeSpecial, buildingsInfo } = global;

    const passedTime = timeLeft === 0 ? (Date.now() - time.updated) : 0;
    let passedSeconds = timeLeft === 0 ? (passedTime / 1000) : timeLeft;
    if (timeLeft === 0) { time.updated = Date.now(); }
    if (passedTime < 0) {
        return console.warn('Negative passed time detected.');
    }
    if (timeLeft === 0) { timeSpecial.lastSave += passedTime; }

    if (passedSeconds > 900) { //Function will call itself untill condition is true
        if (passedSeconds > maxOfflineTime()) {
            passedSeconds = timeSpecial.maxOffline;
            console.log(`Offline time was reduced to it's max of ${timeSpecial.maxOffline / 3600} hours.`);
        }
        timeLeft = passedSeconds - 900;
        passedSeconds = 900;
    } else if (timeLeft !== 0) {
        timeLeft = 0;
    }

    if (stage.current === 1) {
        const { discharge } = player;
        const { upgradesInfo } = global;

        if (toggles.buildings[3] && researchesAuto[1] >= 3) { buyBuilding(3, true); }
        buildingsInfo.producing[3] = 0.3 * buildings[3].current * upgradesInfo.effect[3] ** discharge.current;
        if (upgrades[5] === 1) { buildingsInfo.producing[3] *= upgradesInfo.effect[5] ** buildings[3].true; }
        calculateGainedBuildings(2, passedSeconds);

        upgradesInfo.effect[5] = Math.trunc((1.02 + 0.01 * researches[1]) * 100) / 100;
        upgradesInfo.effect[3] = 4 + 1 * researches[3];
        upgradesInfo.effect[6] = 0;
        if (buildingsInfo.producing[3] > 1) { //Because Math.log(0) === -infinity and Math.log(1) === 0
            upgradesInfo.effect[6] = Math.log(buildingsInfo.producing[3]) * 12 ** player.researches[2];
            if (upgrades[7] === 1) { upgradesInfo.effect[6] *= discharge.energyCur; }
        }
        if (upgrades[6] === 1) { calculateGainedBuildings(3, passedSeconds); }

        if (toggles.buildings[2] && researchesAuto[1] >= 2) { buyBuilding(2, true); }
        buildingsInfo.producing[2] = 0.4 * buildings[2].current * upgradesInfo.effect[3] ** discharge.current;
        if (upgrades[2] === 1) { buildingsInfo.producing[2] *= 5; }
        if (upgrades[5] === 1) { buildingsInfo.producing[2] *= upgradesInfo.effect[5] ** buildings[2].true; }
        calculateGainedBuildings(1, passedSeconds);

        if (toggles.buildings[1] && researchesAuto[1] >= 1) { buyBuilding(1, true); }
        buildingsInfo.producing[1] = 0.5 * buildings[1].current * upgradesInfo.effect[3] ** discharge.current;
        if (upgrades[1] === 1) { buildingsInfo.producing[1] *= 10; }
        if (upgrades[5] === 1) { buildingsInfo.producing[1] *= upgradesInfo.effect[5] ** buildings[1].true; }
        calculateGainedBuildings(0, passedSeconds);

        if (discharge.energyMax < discharge.energyCur) { discharge.energyMax = discharge.energyCur; }
    } else if (stage.current === 2) {
        const { vaporizationInfo, upgradesS2Info, researchesExtraS2Info } = global;
        const { vaporization } = player;

        if (toggles.buildings[5] && researchesAuto[1] >= 5) { buyBuilding(5, true); }
        buildingsInfo.producing[5] = 2 * buildings[5].current;
        researchesExtraS2Info.effect[2] = vaporization.clouds ** 0.1;
        if (researchesExtra[2] >= 1) { buildingsInfo.producing[5] *= researchesExtraS2Info.effect[2]; }

        if (toggles.buildings[4] && researchesAuto[1] >= 4) { buyBuilding(4, true); }
        buildingsInfo.producing[4] = 2 * buildings[4].current;
        if (buildingsInfo.producing[5] > 1) { buildingsInfo.producing[4] *= buildingsInfo.producing[5]; }

        upgradesS2Info.effect[5] = 1 + researches[5];
        if (upgrades[5] === 1) { buildings[3].current = buildings[3].true + buildings[4].current * upgradesS2Info.effect[5]; }

        if (toggles.buildings[3] && researchesAuto[1] >= 3) { buyBuilding(3, true); }
        buildingsInfo.producing[3] = 2 * buildings[3].current;
        if (buildingsInfo.producing[4] > 1) { buildingsInfo.producing[3] *= buildingsInfo.producing[4]; }

        upgradesS2Info.effect[4] = 1 + researches[4];
        if (upgrades[4] === 1) { buildings[2].current = buildings[2].true + buildings[3].current * upgradesS2Info.effect[4]; }

        if (toggles.buildings[2] && researchesAuto[1] >= 2) { buyBuilding(2, true); }
        buildingsInfo.producing[2] = 2 * buildings[2].current * vaporization.clouds;
        upgradesS2Info.effect[2] = 0.02 + researches[2] * 0.02;
        upgradesS2Info.effect[3] = 0.02 + researches[3] * 0.03;
        if (upgrades[2] === 1 && researches[1] >= 2) {
            buildingsInfo.producing[2] *= buildings[0].total ** upgradesS2Info.effect[2];
        } else if (upgrades[2] === 1) {
            buildingsInfo.producing[2] *= buildings[0].current ** upgradesS2Info.effect[2];
        }
        if (upgrades[3] === 1 && researches[1] >= 1) {
            buildingsInfo.producing[2] *= buildings[1].total ** upgradesS2Info.effect[3];
        } else if (upgrades[3] === 1) {
            buildingsInfo.producing[2] *= buildings[1].current ** upgradesS2Info.effect[3];
        }
        if (buildingsInfo.producing[3] > 1) { buildingsInfo.producing[2] *= buildingsInfo.producing[3]; }
        researchesExtraS2Info.effect[1] = 10 ** (player.researchesExtra[1] - 1);
        calculateGainedBuildings(1, passedSeconds);

        if (buildings[0].current < 0.0028 && buildings[1].current === 0) { buildings[0].current = 0.0028; }
        if (buildings[1].current < buildings[1].true) {
            buildings[1].true = Math.trunc(buildings[1].current);
            calculateBuildingsCost(1);
        }

        if (toggles.buildings[1] && researchesAuto[1] >= 1) { buyBuilding(1, true); }
        buildingsInfo.producing[1] = 0.0006 * buildings[1].current;
        if (researches[0] >= 1) { buildingsInfo.producing[1] *= 3 ** researches[0]; }
        if (upgrades[0] === 1) { buildingsInfo.producing[1] *= 1.1 ** buildings[1].true; }
        calculateGainedBuildings(0, passedSeconds);

        vaporizationInfo.get = (researchesExtra[0] === 0 ? buildings[1].current : buildings[1].total) / 1e10;
        if (vaporizationInfo.get > 1) { //1e4 is softcap, game will force calculation as if you already at softcap if you reached 1e4 total clouds
            const check = vaporizationInfo.get ** 0.6 + vaporization.clouds;
            const calculate = (check - 1e4 > 0) ? Math.max(1e4 - vaporization.clouds, 1) : 1;
            vaporizationInfo.get = calculate + (vaporizationInfo.get - calculate) ** (check > 1e4 ? 0.36 : 0.6);
        }
    } else if (stage.current === 3) {
        const { upgradesS3Info, researchesS3Info, researchesExtraS3Info } = global;
        const { accretion } = player;

        //upgrades[6] === 1, can be moved into buildingsInfo.unlocked[4], if hotkeys will be added
        if (toggles.buildings[4] && researchesAuto[1] >= 4 && upgrades[6] === 1) { buyBuilding(4, true); }
        buildingsInfo.producing[4] = (upgrades[11] === 1 ? 1.15 : 1.1) ** buildings[4].current;

        if (toggles.buildings[3] && researchesAuto[1] >= 3) { buyBuilding(3, true); }
        buildingsInfo.producing[3] = 0.1 * buildings[3].current;
        if (upgrades[4] === 1 && researchesExtra[2] > 0) { buildingsInfo.producing[3] *= 2; }
        if (buildingsInfo.producing[4] > 1) { buildingsInfo.producing[3] *= buildingsInfo.producing[4]; }
        calculateGainedBuildings(2, passedSeconds);

        if (toggles.buildings[2] && researchesAuto[1] >= 2) { buyBuilding(2, true); }
        buildingsInfo.producing[2] = 0.1 * buildings[2].current;
        researchesS3Info.effect[5] = buildings[0].current ** (0.025 * researches[5]);
        if (upgrades[3] === 1) { buildingsInfo.producing[2] *= 1.02 ** buildings[2].true; }
        if (upgrades[4] === 1) { buildingsInfo.producing[2] *= 4; }
        if (researches[2] > 0) { buildingsInfo.producing[2] *= 3 ** researches[2]; }
        if (researches[4] > 0) { buildingsInfo.producing[2] *= 5 ** researches[4]; }
        if (researches[5] > 0) { buildingsInfo.producing[2] *= researchesS3Info.effect[5]; }
        calculateGainedBuildings(1, passedSeconds);

        if (toggles.buildings[1] && researchesAuto[1] >= 1) { buyBuilding(1, true); }
        buildingsInfo.producing[1] = 5e-20 * buildings[1].current;
        upgradesS3Info.effect[0] = 1.01 + 0.01 * researches[1];
        upgradesS3Info.effect[1] = buildings[1].current ** (0.05 + 0.01 * researchesExtra[3]);
        upgradesS3Info.effect[7] = 2 * 1.5 ** researches[6];
        upgradesS3Info.effect[9] = 10 * 3 ** researches[7];
        researchesExtraS3Info.effect[0] = 1.1 ** researchesExtra[0];
        researchesExtraS3Info.effect[1] = (1 + 0.1 * researchesExtra[1]) ** accretion.rank;
        if (upgrades[0] === 1) { buildingsInfo.producing[1] *= upgradesS3Info.effect[0] ** buildings[1].true; }
        if (upgrades[1] === 1) { buildingsInfo.producing[1] *= upgradesS3Info.effect[1]; }
        if (upgrades[2] === 1) { buildingsInfo.producing[1] *= 2; }
        if (upgrades[5] === 1) { buildingsInfo.producing[1] *= 3; }
        if (upgrades[7] === 1) { buildingsInfo.producing[1] *= upgradesS3Info.effect[7]; }
        if (upgrades[8] === 1) { buildingsInfo.producing[1] *= 2; }
        if (upgrades[9] === 1) { buildingsInfo.producing[1] *= upgradesS3Info.effect[9]; }
        if (researches[0] > 0) { buildingsInfo.producing[1] *= 3 ** researches[0]; }
        if (researches[3] > 0) { buildingsInfo.producing[1] *= 2 ** researches[3]; }
        if (researchesExtra[0] > 0) { buildingsInfo.producing[1] *= researchesExtraS3Info.effect[0]; }
        if (researchesExtra[1] > 0) { buildingsInfo.producing[1] *= researchesExtraS3Info.effect[1]; }
        if (accretion.rank >= 5) { //I know that close to 1, softcap is at weakest point
            buildingsInfo.producing[1] **= buildingsInfo.producing[1] < 1 ? 1.1 : 0.8;
        }
        calculateGainedBuildings(0, passedSeconds);

        if (buildings[0].current > 1e30 && accretion.rank < 5) { buildings[0].current = 1e30; }
    }
    if (timeLeft > 0) { invisibleUpdate(timeLeft); }
};

export const numbersUpdate = () => { //This is for relevant visual info
    const { stage, buildings, upgrades } = player;
    const { tab, subtab } = global;

    if (global.footer) {
        if (stage.current === 1) {
            getId('quarks').textContent = `Quarks: ${format(buildings[0].current)}`;
            if (player.discharge.energyMax >= 9) { getId('energy').textContent = `Energy: ${format(player.discharge.energyCur, 0)}`; }
        } else if (stage.current === 2) {
            getId('water').textContent = `Moles: ${format(buildings[0].current)}`;
            if (tab !== 'stage') { getId('drops').textContent = `Drops: ${format(buildings[1].current)}`; }
            if (upgrades[1] === 1) { getId('clouds').textContent = `Clouds: ${format(player.vaporization.clouds)}`; }
        } else if (stage.current === 3) {
            getId('mass').textContent = `Mass: ${format(buildings[0].current)}`;
        }
    }
    if (tab === 'stage') {
        const { buildingsInfo, lastUpgrade } = global;

        for (let i = 1; i < buildingsInfo.name.length; i++) {
            getId(`building${i}Cur`).textContent = format(buildings[i].current);
            getId(`building${i}Prod`).textContent = format(buildingsInfo.producing[i]);
            let e = i - 1;
            if (stage.current === 2 && i !== 1) {
                e = 1; //Drops
            } else if (stage.current === 3) {
                e = 0; //Mass
            }
            if (buildingsInfo.cost[i] <= buildings[e].current) {
                getId(`building${i}Btn`).classList.add('availableBuilding');
                getId(`building${i}Btn`).textContent = `Buy for: ${format(buildingsInfo.cost[i])} ${buildingsInfo.name[e]}`;
            } else {
                getId(`building${i}Btn`).classList.remove('availableBuilding');
                getId(`building${i}Btn`).textContent = `Need: ${format(buildingsInfo.cost[i])} ${buildingsInfo.name[e]}`;
            }
        }
        if (stage.current === 1) {
            if (upgrades[3] === 1) {
                getId('dischargeReset').textContent = `Next goal is ${format(global.dischargeInfo.next, 0)} Energy`;
                getId('dischargeEffect').textContent = format(global.upgradesInfo.effect[3], 0);
            }
        } else if (stage.current === 2) {
            if (upgrades[1] === 1) {
                getId('vaporizationReset').textContent = `Reset for ${format(global.vaporizationInfo.get)} Clouds`;
            }
        }

        if (lastUpgrade[0] !== null && lastUpgrade[2]) { getUpgradeDescription(lastUpgrade[0], lastUpgrade[1]); }
    } else if (tab === 'research') {
        const { lastResearch } = global;

        if (lastResearch[0] !== null && lastResearch[2]) { getUpgradeDescription(lastResearch[0], lastResearch[1]); }
    } else if (tab === 'settings') {
        if (subtab.settingsCurrent === 'settings') {
            if (global.timeSpecial.lastSave >= 1000) { getId('isSaved').textContent = `${format(global.timeSpecial.lastSave, 0, 'time')} ago`; }
        } else if (subtab.settingsCurrent === 'stats') {
            getId('firstPlay').textContent = `${format(Date.now() - player.time.started, 0, 'time')} ago`;
            getId('stageResetsCount').textContent = format(stage.resets, 0);
            getId('maxOfflineStat').textContent = `${maxOfflineTime() / 3600} hours`;
            for (let i = 0; i < player.buildings.length; i++) {
                if (buildings[i].trueTotal === 0) { continue; } //Not break, because you might be able to buy building out of order (probably)
                getId(`building${i}StatName`).textContent = global.buildingsInfo.name[i];
                if (i !== 0) { getId(`building${i}StatTrue`).textContent = format(buildings[i].true, 0); }
                getId(`building${i}StatTotal`).textContent = format(buildings[i].total);
                getId(`building${i}StatTrueTotal`).textContent = format(buildings[i].trueTotal);
            }
            if (stage.current === 1) {
                getId('maxEnergyStat').textContent = format(player.discharge.energyMax, 0);
                getId('dischargeStat').textContent = format(player.discharge.current, 0);
            }
        }
    }
};

export const visualUpdate = () => { //This is everything that can be shown later
    const { stage, buildings, upgrades, researchesAuto } = player;
    const { screenReader } = global;

    /* They are going to be hidden with stageCheck(); */
    if (stage.current === 1) {
        const { discharge } = player;

        getId('energyStat').style.display = discharge.energyMax >= 9 ? '' : 'none';
        getId('discharge').style.display = upgrades[3] === 1 ? '' : 'none';
        if (buildings[1].trueTotal >= 11) { getId('building2').style.display = ''; }
        if (buildings[2].trueTotal >= 2) { getId('building3').style.display = ''; }
        if (discharge.energyMax >= 9) { getId('upgrades').style.display = ''; }
        if (discharge.current >= 1) { getId('resetToggles').style.display = ''; }
        for (let i = 5; i <= 8; i++) {
            getId(`upgrade${i}`).style.display = discharge.current >= 3 ? '' : 'none';
        }
        if (discharge.current >= 4) { getId('researchTabBtn').style.display = ''; }
        if (upgrades[7] === 1) { getId('stage').style.display = ''; }
        getId('stageReset').textContent = buildings[3].current >= 1.67e21 ? 'Enter next stage' : 'You are not ready';
        if (screenReader) { getId('invisibleGetResource1').style.display = discharge.energyMax > 0 ? '' : 'none'; }

        if (global.tab === 'settings' && global.subtab.settingsCurrent === 'stats') {
            getId('energyStats').style.display = discharge.energyMax >= 9 ? '' : 'none';
            getId('dischargeStats').style.display = discharge.current >= 1 ? '' : 'none';
        }

        if (!player.events[0] && upgrades[4] === 1) { playEvent(0); }
    } else if (stage.current === 2) {
        const { vaporization } = player;

        getId('dropStat').style.display = global.tab !== 'stage' ? '' : 'none';
        getId('cloudStat').style.display = upgrades[1] === 1 ? '' : 'none';
        getId('vaporization').style.display = upgrades[1] === 1 ? '' : 'none';
        getId('vaporizationToggleReset').style.display = stage.true > 2 ? '' : (vaporization.current > 0 ? '' : 'none');
        getId('cloudResearch').style.display = vaporization.current > 0 ? '' : 'none';
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
        if (buildings[1].trueTotal >= 300) { getId('building2').style.display = ''; }
        if (buildings[1].trueTotal >= 5e6) { getId('building3').style.display = ''; }
        if (buildings[1].trueTotal >= 5e17) { getId('building4').style.display = ''; }
        if (buildings[1].trueTotal >= 5e22) { getId('building5').style.display = ''; }
        getId('stageReset').textContent = buildings[1].current >= 1.194e29 ? 'Enter next stage' : 'You are not ready';
        if (screenReader) { getId('invisibleGetResource1').style.display = upgrades[1] === 1 ? '' : 'none'; }

        if (!player.events[1] && global.vaporizationInfo.get + vaporization.clouds > 1e4) { playEvent(1); }
    } else if (stage.current === 3) {
        const { accretion } = player;

        getId('buildings').style.display = accretion.rank !== 0 ? '' : 'none';
        if (accretion.rank >= 1) { getId('upgrades').style.display = ''; }
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
        getId('rankToggleReset').style.display = stage.true > 3 ? '' : (accretion.rank >= 2 ? '' : 'none');
        getId('building2').style.display = upgrades[2] === 1 ? '' : 'none';
        getId('building3').style.display = upgrades[4] === 1 ? '' : 'none';
        getId('building4').style.display = upgrades[6] === 1 ? '' : 'none';
        getId('stageReset').textContent = buildings[0].current >= 1e32 ? 'Enter next stage' : 'You are not ready';

        if (global.tab === 'settings' && global.subtab.settingsCurrent === 'stats') {
            for (let i = 0; i < global.accretionInfo.rankImage.length; i++) {
                getId(`rankStat${i}`).style.display = accretion.rank >= i ? '' : 'none';
            }
        }

        if (!player.events[2] && buildings[0].current >= 5e29) { playEvent(2); }
    }

    for (let i = 1; i < playerStart.buildings.length; i++) {
        getId(`toggleBuilding${i}`).style.display = researchesAuto[1] >= i ? '' : 'none';
        getId(`building${i}Stats`).style.display = buildings[i].trueTotal > 0 ? '' : 'none';
        if (screenReader) { getId(`invisibleGetBuilding${i}`).style.display = buildings[i].trueTotal > 0 ? '' : 'none'; }
    }
    getId('toggleBuy').style.display = researchesAuto[0] > 0 ? '' : 'none';
};

export const getUpgradeDescription = (index: number, type = 'upgrades' as 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto', check = 0) => {
    const { stage } = player;
    if (check !== 0 && check !== stage.current) { return; }

    if (type !== 'upgrades') {
        let typeInfo = 'researchesAutoInfo' as 'researchesAutoInfo' | 'researchesS2Info';
        if (type !== 'researchesAuto') {
            typeInfo = `${type}${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'researchesS2Info';
        }
        global.lastResearch = [index, type, global[typeInfo].effect[index] !== null];

        /* Special cases */
        if (type === 'researchesAuto' && index === 1) {
            const autoIndex = Math.min(player.researchesAuto[1] + 1, global.buildingsInfo.name.length - 1);
            global.researchesAutoInfo.effect[1] = player.buildings[autoIndex].trueTotal !== 0 ? global.buildingsInfo.name[autoIndex] : '(uknown)';
        }

        /* To explain: Effect.textContent = effectText[0] + effect[n] + effectText[1];
           Unless effect[n] === null, then it just Effect.textContent = effectText[0] */
        getId('researchText').textContent = global[typeInfo].description[index];
        getId('researchEffect').textContent = `${global[typeInfo].effectText[index][0]}${format(global[typeInfo].effect[index] ?? '')}${global[typeInfo].effect[index] !== null ? `${global[typeInfo].effectText[index][1]}` : ''}`;
        getId('researchCost').textContent = player[type][index] === global[typeInfo].max[index] ? 'Maxed.' : `${format(global[typeInfo].cost[index])} ${global.stageInfo.priceName[player.stage.current - 1]}.`;
    } else {
        const typeInfo = `${type}${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'upgradesS2Info';
        global.lastUpgrade = [index, type, global[typeInfo].effect[index] !== null];

        getId('upgradeText').textContent = global[typeInfo].description[index];
        getId('upgradeEffect').textContent = `${global[typeInfo].effectText[index][0]}${format(global[typeInfo].effect[index] ?? '')}${global[typeInfo].effect[index] !== null ? `${global[typeInfo].effectText[index][1]}` : ''}`;
        getId('upgradeCost').textContent = player[type][index] === 1 ? 'Bought.' : `${format(global[typeInfo].cost[index])} ${global.stageInfo.priceName[player.stage.current - 1]}.`;
    }
};

export const visualUpdateUpgrades = (index: number, type = 'upgrades' as 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto') => {
    const { stage } = player;

    let typeInfo = 'researchesAutoInfo' as 'researchesAutoInfo' | 'researchesS2Info';
    if (type !== 'researchesAuto') {
        typeInfo = `${type}${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'researchesS2Info';
    }

    let extra = '';
    if (type === 'researchesAuto') {
        extra = 'Auto';
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
    }

    let upgradeHTML: HTMLElement;
    if (type !== 'upgrades') {
        upgradeHTML = getId(`research${extra}${index + 1}Level`);
    } else {
        upgradeHTML = getId(`upgrade${extra}${index + 1}`);
    }

    if (Object.hasOwn(global[typeInfo], 'max')) {
        getId(`research${extra}${index + 1}Max`).textContent = format(global[typeInfo].max[index], 0);
        upgradeHTML.textContent = format(player[type][index], 0);
        upgradeHTML.classList.remove('redText', 'orchidText', 'greenText');
        if (player[type][index] === global[typeInfo].max[index]) { //If I add as 'upgradesS2Info', TS won't realize that this code will never be done if object doesn't have property 'max'...
            upgradeHTML.classList.add('greenText');
        } else if (player[type][index] === 0) {
            upgradeHTML.classList.add('redText');
        } else {
            upgradeHTML.classList.add('orchidText');
        }
    } else {
        let color = 'green';
        if (stage.current === 2) {
            color = 'darkgreen';
        } else if (stage.current === 3) {
            color = '#0000b1'; //Darker blue
        }
        upgradeHTML.style.backgroundColor = player[type][index] === 1 ? color : '';
    }
};

export const updateRankInfo = () => {
    const { accretion } = player;
    const { accretionInfo } = global;
    const image = getId('rankImage') as HTMLImageElement;
    const name = getId('rankName') as HTMLSpanElement;

    //Important Rank information
    accretionInfo.rankCost[4] = player.events[2] ? 5e29 : 0;
    global.researchesExtraS3Info.max[0] = accretion.rank <= 2 ? 12 : 29;
    calculateResearchCost(0, 'researchesExtra');
    visualUpdateUpgrades(0, 'researchesExtra');

    //Visuals
    getId('rankMessage').textContent = accretion.rank === 0 ?
        'Might need more than just water... You can increase rank with Mass.' :
        'You can increase it with Mass. (Return back to Dust, but unlock something new)';
    getId('rankReset').textContent = accretionInfo.rankCost[accretion.rank] === 0 ?
        'Max rank achieved' : `Next rank is ${format(accretionInfo.rankCost[accretion.rank])} Mass`;
    image.src = `Used_art/${accretionInfo.rankImage[accretion.rank]}.png`;
    image.alt = accretionInfo.rankName[accretion.rank];
    name.textContent = accretionInfo.rankName[accretion.rank];
    name.classList.remove('blueText', 'cyanText', 'grayText', 'darkvioletText');
    if (accretion.rank === 0) {
        name.classList.add('blueText');
    } else if (accretion.rank === 1) {
        name.classList.add('cyanText');
    } else if (accretion.rank === 5) {
        name.classList.add('darkvioletText');
    } else {
        name.classList.add('grayText');
    }
};

export const format = (input: number | string, precision = typeof input === 'number' ? (input < 1e3 ? (input < 1 ? 4 : 2) : 0) : 0, type = 'number' as 'number' | 'time') => {
    if (typeof input !== 'number') { return input; } //String's are being send here (for a reason)
    switch (type) {
        case 'number':
            if (!isFinite(input)) { return 'Infinity'; }
            if (input >= 1e6 || (input <= 1e-3 && input > 0)) { //Format for these cases
                const digits = Math.floor(Math.log10(input));
                return `${(Math.round(input / 10 ** (digits - 2)) / 100).toLocaleString()}e${digits}`; //I hate floats
            } else {
                if (precision > 0) {
                    return (Math.round(input * (10 ** precision)) / (10 ** precision)).toLocaleString();
                } else {
                    return (Math.round(input)).toLocaleString();
                }
            }
        case 'time': //I don't fully know how to make hours:minutes:seconds, or if even needed
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

export const stageCheck = () => {
    const { stage } = player; //Can be added upgrades, researches, researchesAuto
    const { stageInfo, buildingsInfo, researchesAutoInfo } = global;

    //First remove (hide) all information that might be missing in a new stage
    getId('buildings').style.display = stage.current !== 3 ? '' : 'none';
    for (let i = 2; i < playerStart.buildings.length; i++) {
        getId(`building${i}`).style.display = 'none';
    }
    getId('upgradeText').textContent = 'Hover to see.';
    getId('upgradeEffect').textContent = 'Hover to see.';
    getId('upgradeCost').textContent = 'Resource.';
    getId('researchText').textContent = 'Hover to see.';
    getId('researchEffect').textContent = 'Hover to see.';
    getId('researchCost').textContent = 'Resource.';
    global.lastUpgrade[0] = null;
    global.lastResearch[0] = null;

    //Hide | show stage specific information (what isn't here is already in visualUpdate())
    for (let s = 1; s <= 3; s++) { //s <= max stage you can have; This one shows all that is needed from start of every stage
        for (const i of getClass(`stage${s}Only`)) {
            if (stage.true === s) {
                if (!i.classList.contains('notFromStart')) { i.style.display = ''; }
            } else {
                i.style.display = 'none';
            }
        }
    }

    for (const i of getClass('stage1Unlock')) {
        i.style.display = stage.true > 1 ? '' : 'none';
    }
    if (stage.current === 3) { getId('upgrades').style.display = 'none'; }
    if (localStorage.getItem('theme') !== null) { getId('themeArea').style.display = ''; }
    for (let i = 2; i <= stageInfo.word.length; i++) {
        getId(`switchTheme${i}`).style.display = stage.true >= i ? '' : 'none';
    }
    getId('researchAuto3').style.display = stage.true >= 2 ? '' : 'none';

    //Add (change) unique information
    if (stage.current === 1) {
        buildingsInfo.name = ['Quarks', 'Particles', 'Atoms', 'Molecules']; //Assign new constants
        buildingsInfo.type = ['producing', 'producing', 'producing', 'producing'];
        buildingsInfo.increase = [1.4, 1.4, 1.4, 1.4];
        globalStart.buildingsInfo.cost = [0, 3, 24, 3];
        globalStart.researchesAutoInfo.cost[1] = 3000;
        researchesAutoInfo.scalling[1] = 5000;
        global.dischargeInfo.next = 10 ** player.discharge.current; //Calculate stage specific part's
    } else if (stage.current === 2) {
        buildingsInfo.name = ['Moles', 'Drops', 'Puddles', 'Ponds', 'Lakes', 'Seas'];
        buildingsInfo.type = ['producing', 'producing', 'producing', 'improves', 'improves', 'improves'];
        buildingsInfo.increase = [1.2, 1.2, 1.2, 1.2, 1.2, 1.2];
        globalStart.buildingsInfo.cost = [0, 0.0028, 100, 1e7, 1e18, 1e23];
        globalStart.researchesAutoInfo.cost[1] = 1e10;
        researchesAutoInfo.scalling[1] = 1000;
    } else if (stage.current === 3) {
        buildingsInfo.name = ['Mass', 'Cosmic dust', 'Planetesimals', 'Protoplanets', 'Satellites'];
        buildingsInfo.type = ['producing', 'producing', 'producing', 'producing', 'improves'];
        buildingsInfo.increase = [1.15, 1.15, 1.15, 1.15, 10];
        globalStart.buildingsInfo.cost = [0, 1e-19, 1e-9, 1e21, 1e17];
        globalStart.researchesAutoInfo.cost[1] = 1e-7;
        researchesAutoInfo.scalling[1] = 1e17;
        updateRankInfo();
    }

    //Buildings, researches and upgrades (using information from above)
    for (let i = 1; i < buildingsInfo.name.length; i++) {
        getId(`building${i}Name`).textContent = buildingsInfo.name[i];
        getId(`building${i}Type`).textContent = buildingsInfo.type[i];
        calculateBuildingsCost(i);
    }

    const upgradeType = `upgrades${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'upgradesS2Info'; //If something can be moved higher in code
    const researchType = `researches${stage.current > 1 ? `S${stage.current}` : ''}Info` as 'researchesS2Info';
    const researchExtraType = `researchesExtraS${stage.current}Info` as 'researchesExtraS2Info';

    for (let i = 0; i < global[upgradeType].cost.length; i++) {
        if (player.upgrades[i] > 1) {
            player.upgrades[i] = 1;
            console.error(`Upgrade (${i + 1}) had an illegal value`); //Just in case, can't be done in updatePlayer(); because max level can and will change
        }
        visualUpdateUpgrades(i); //If new stage added, then need to add new 'extra' value inside
    }
    for (let i = 0; i < global[researchType].cost.length; i++) {
        if (player.researches[i] > global[researchType].max[i]) {
            player.researches[i] = global[researchType].max[i];
            console.error(`Research (${i + 1}) had level above maxium`);
        }
        calculateResearchCost(i, 'researches');
        visualUpdateUpgrades(i, 'researches');
    }
    if (stage.current !== 1) { //No idea if stage 1 will ever have it
        for (let i = 0; i < global[researchExtraType].cost.length; i++) {
            if (player.researchesExtra[i] > global[researchExtraType].max[i]) {
                player.researchesExtra[i] = global[researchExtraType].max[i];
                console.error(`Special research (${i + 1}) had level above maxium`);
            }
            calculateResearchCost(i, 'researchesExtra');
            visualUpdateUpgrades(i, 'researchesExtra');
        }
    }
    researchesAutoInfo.max[1] = buildingsInfo.name.length - 1; //Same across all stages, cannot be moved above stage.current check
    for (let i = 0; i < researchesAutoInfo.cost.length; i++) {
        if (player.researchesAuto[i] > global.researchesAutoInfo.max[i]) {
            player.researchesAuto[i] = global.researchesAutoInfo.max[i];
            console.error(`Research (${i + 1}) for automatization had level above maxium`);
        }
        calculateResearchCost(i, 'researchesAuto');
        visualUpdateUpgrades(i, 'researchesAuto');
    }

    //Special information
    const body = document.body.style;
    getId('stageWord').textContent = stageInfo.word[stage.current - 1];
    if (stage.current === 1) {
        body.removeProperty('--border-image');
        body.removeProperty('--border-stage');
        body.removeProperty('--stage-text-color');
    } else {
        body.setProperty('--border-image', `url(Used_art/Stage${stage.current}%20border.png)`);
        if (stage.current === 2) {
            body.setProperty('--border-stage', '#1460a8');
            body.setProperty('--stage-text-color', 'dodgerblue');
        } else if (stage.current === 3) {
            body.setProperty('--border-stage', '#5b5b75');
            body.setProperty('--stage-text-color', '#8f8f8f');
        }
    }
    if (global.screenReader) {
        getId('invisibleBought').textContent = `Current stage is '${stageInfo.word[stage.current - 1]}'`;
        getId('invisibleGetResource1').textContent = `Get information for ${stageInfo.resourceName[stage.current - 1]}`;
        if (stage.current === 3) { getId('invisibleGetResource1').style.display = 'none'; }
        for (let i = 0; i < buildingsInfo.name.length; i++) {
            getId(`invisibleGetBuilding${i}`).textContent = `Get information for ${buildingsInfo.name[i]}`;
        }
    }
};
