import { checkTab, stageResetType, milestoneGetValue } from './Check';
import { changeSubtab } from './Hotkeys';
import Overlimit from './Limit';
import { assignInnerHTML, getClass, getId, getQuery, toggleSwap } from './Main';
import { effectsCache, global, player, universeName } from './Player';
import { MDStrangenessPage, Notify, checkProgress, globalSave, resetMinSizes, setTheme, specialHTML } from './Special';
import { calculateBuildingsCost, stageResetCheck, setActiveStage, calculateEffects, assignBuildingsProduction, assignResetInformation, calculateVerseCost, calculateTreeCost } from './Stage';
import type { gameSubtab, gameTab } from './Types';

/** Tab being null will test current tab/subtab being unlocked and updates subtab list */
export const switchTab = (tab = null as null | gameTab, subtab = null as null | gameSubtab): void => {
    const oldTab = global.tabs.current;
    if (tab === null) {
        if (!checkTab(oldTab)) { return switchTab('stage'); }

        let subtabAmount = 0;
        for (const inside of global.tabs[oldTab].list) {
            const unlocked = checkTab(oldTab, inside);
            getId(`${oldTab}SubtabBtn${inside}`).style.display = unlocked ? '' : 'none';
            if (unlocked) {
                subtabAmount++;
            } else if (global.tabs[oldTab].current === inside) {
                switchTab(oldTab, global.tabs[oldTab].list[0]);
            }
        }
        getId('subtabs').style.visibility = subtabAmount > 1 ? '' : 'hidden';
        return;
    } else if (subtab === null) {
        if (oldTab === tab) { return changeSubtab('up'); }
        getId(`${oldTab}Tab`).style.display = 'none';
        getId(`${oldTab}TabBtn`).classList.remove('tabActive');

        global.tabs.current = tab;
        getId(`${tab}Tab`).style.display = '';
        getId(`${tab}TabBtn`).classList.add('tabActive');

        let subtabAmount = 0;
        for (const inside of global.tabs[oldTab].list) {
            getId(`${oldTab}SubtabBtn${inside}`).style.display = 'none';
        }
        for (const inside of global.tabs[tab].list) {
            if (checkTab(tab, inside)) {
                getId(`${tab}SubtabBtn${inside}`).style.display = '';
                subtabAmount++;
            } else if (global.tabs[tab].current === inside) {
                switchTab(tab, global.tabs[tab].list[0]);
            }
        }
        getId('subtabs').style.visibility = subtabAmount > 1 ? '' : 'hidden';
        if (globalSave.SRSettings[0]) { getId('SRTab').textContent = `Current tab is '${tab}'${subtabAmount > 1 ? ` and subtab is '${global.tabs[tab].current}'` : ''}`; }
    } else {
        const oldSubtab = global.tabs[tab].current;
        getId(`${tab}Subtab${oldSubtab}`).style.display = 'none';
        getId(`${tab}SubtabBtn${oldSubtab}`).classList.remove('tabActive');

        global.tabs[tab].current = subtab;
        getId(`${tab}Subtab${subtab}`).style.display = '';
        getId(`${tab}SubtabBtn${subtab}`).classList.add('tabActive');
        if (oldTab !== tab) { return; }
        if (globalSave.SRSettings[0]) { getId('SRTab').textContent = `Current subtab is '${subtab}', part of '${tab}' tab`; }
    }

    const active = player.stage.active;
    if ((tab === 'upgrade' && global.tabs.upgrade.current === 'Elements') || tab === 'Elements') {
        if (active !== 4 && active !== 5) {
            if (tab === 'upgrade' && subtab === null) {
                switchTab('upgrade', 'Upgrades');
            } else {
                setActiveStage(global.trueActive === 5 ? 5 : 4, global.trueActive);
                stageUpdate();
            }
            return;
        }
    } else if (global.trueActive !== active) {
        setActiveStage(global.stageInfo.activeAll.includes(global.trueActive) ? global.trueActive : Math.min(player.stage.current, 5));
        stageUpdate();
        return;
    }
    visualUpdate();
    numbersUpdate();
};

export const numbersUpdate = (ignoreOffline = false) => {
    if (global.offline.active && !ignoreOffline) { return; }
    const tab = global.tabs.current;
    const subtab = global.tabs[tab].current;
    const active = player.stage.active;
    const buildings = player.buildings[active];
    const challenge = player.challenges.active;
    const vacuum = player.inflation.vacuum;

    if (!global.debug.timeLimit) {
        let noTime = null as boolean | null;
        if (challenge !== null) {
            noTime = player.time[global.challengesInfo[challenge].resetType] > global.challengesInfo[challenge].time;
        } else if (!vacuum && player.tree[0][4] < 1 && player.progress.main >= 11) {
            const s = Math.min(player.stage.current, 4);
            const info = global.milestonesInfo;
            let maxTime = 0;
            for (let i = 0; i < info[s].need.length; i++) {
                if (player.milestones[s][i] >= info[s].scaling[i].length) {
                    if (s === 4 && player.milestones[5][i] < info[5].scaling[i].length) {
                        maxTime = Math.max(info[5].reward[i], maxTime);
                    }
                    continue;
                }
                maxTime = Math.max(info[s].reward[i], maxTime);
            }
            if (maxTime > 0) { noTime = player.time.stage > maxTime; }
        }

        if (noTime) {
            Notify(`Time limit has been reached for ${challenge !== null ? `the '${global.challengesInfo[challenge].name}'` : 'all Milestones'}`);
            global.debug.timeLimit = true;
        } else if (noTime === null) { global.debug.timeLimit = true; }
    }

    {
        if (!globalSave.toggles[4]) {
            getId('globalStat1Span').textContent = format(player.discharge.energy, { padding: 'exponent' });
            getId('globalStat2Span').textContent = format(player.buildings[2][1].current, { padding: true });
            getId('globalStat3Span').textContent = format(player.buildings[3][0].current, { padding: true });
            getId('globalStat4Span').textContent = format(player.buildings[4][0].current, { padding: true });
            getId('globalStat5Span').textContent = format(player.buildings[6][0].current, { padding: true });
        }
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

            getId('footerStat1Span').textContent = format(stars[0].current, { padding: true });
            getId('footerStat2Span').textContent = format(player.collapse.mass, { padding: true });
            if (active === 5) {
                getId('footerStat3Span').textContent = format(new Overlimit(stars[1].current).allPlus(stars[2].current, stars[3].current, stars[4].current, stars[5].current), { padding: true });
            }
        } else if (active === 6) {
            getId('footerStat1Span').textContent = format(buildings[0].current, { padding: true });
            getId('footerStat2Span').textContent = format(player.darkness.energy, { padding: 'exponent' });
            getId('footerStat3Span').textContent = format(player.darkness.fluid, { padding: true });
        }
        const value = global.hotkeys.shift;
        const shiftButton = getId('shiftFooter');
        if (specialHTML.cache.innerHTML.get(shiftButton) !== value) {
            specialHTML.cache.innerHTML.set(shiftButton, value);
            shiftButton.style.borderColor = value ? 'forestgreen' : '';
            shiftButton.style.color = value ? 'var(--green-text)' : '';
        }
    }

    if (tab === 'stage') {
        if (subtab === 'Structures') {
            const buildingsInfo = global.buildingsInfo;
            const howMany = global.hotkeys.shift ? (global.hotkeys.ctrl ? 100 : 1) : global.hotkeys.ctrl ? 10 : player.toggles.shop.input;
            const speed = global.inflationInfo.globalSpeed;

            if (active === 2 && buildings[2].true < 1) { assignBuildingsProduction.S2Build2(true); }
            for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
                const trueCountID = getId(`building${i}True`);
                getId(`building${i}Cur`).textContent = format(buildings[i].current, { padding: trueCountID.style.display !== 'none' });
                getId(`building${i}Prod`).textContent = format(buildingsInfo.type[active][i - 1] === 'producing' ? new Overlimit(buildingsInfo.producing[active][i]).multiply(speed) : buildingsInfo.producing[active][i], { padding: true });
                trueCountID.textContent = `[${format(buildings[i as 1].true, { padding: 'exponent' })}]`;

                let lockText;
                if (active === 3) {
                    if (i > 1 && player.upgrades[3][global.accretionInfo.unlockA[i - 2]] !== 1) {
                        lockText = 'Unlocked with Upgrade';
                    }
                } else if (active === 4) {
                    if (player.researchesExtra[5][0] < 1 && player.collapse.mass < global.collapseInfo.unlockB[i]) {
                        lockText = `Unlocked at ${format(global.collapseInfo.unlockB[i])} Mass`;
                    }
                }
                if (lockText !== undefined) {
                    getId(`building${i}`).classList.remove('availableB');
                    getId(`building${i}Btn`).textContent = lockText;
                    getId(`building${i}BuyX`).textContent = 'Locked';
                    continue;
                }

                let costName: string;
                let currency: number | Overlimit;
                let free = false;
                let multi = true;
                if (active === 5 && i === 3) { //Galaxy
                    costName = 'Mass';
                    currency = player.collapse.mass;
                    multi = false;
                } else {
                    let e = i - 1;
                    let extra = active;
                    if (active === 1) {
                        if (player.tree[1][8] >= 1) {
                            free = true;
                        } else if (i === 1 && vacuum) {
                            free = (player.challenges.supervoid[3] >= 5 || player.researchesExtra[1][2] >= 1) && player.strangeness[1][8] >= 1;
                        }
                    } else if (active === 2) {
                        if (i !== 1) { e = 1; }
                        free = player.tree[1][8] >= 2;
                    } else if (active >= 3) {
                        e = 0;
                        if (active === 5) { extra = 4; }
                        if (active < 6) { free = player.tree[1][8] >= (active === 3 ? 3 : 4); }
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
                        buy = howMany <= 0 ? Math.max(Math.floor(new Overlimit(currency).multiply(scaling - 1).divide(cost).plus(1).log(scaling).toNumber()), 1) : howMany;
                        if (buy > 1) { cost.multiply(new Overlimit(scaling).power(buy).minus(1).divide(scaling - 1)); }
                    }
                }

                getId(`building${i}`).classList[cost.lessOrEqual(currency) ? 'add' : 'remove']('availableB');
                getId(`building${i}Btn`).textContent = `Need: ${format(cost, { padding: true })} ${costName}`;
                getId(`building${i}BuyX`).textContent = format(buy, { padding: 'exponent' });
            }
            if (active === 1) {
                const dischargeInfo = global.dischargeInfo;
                getId('reset0Button').textContent = dischargeInfo.energyTrue > player.discharge.energy ? 'Reset to regain spent Energy' : `Next goal is ${format(dischargeInfo.next, { padding: true })} Energy`;
                getQuery('#tritiumEffect > span:last-of-type').textContent = format(effectsCache.tritium * speed, { padding: true });
                getQuery('#dischargeEffect > span').textContent = format(dischargeInfo.base ** dischargeInfo.total, { padding: true });
                getQuery('#energySpent > span').textContent = format(dischargeInfo.energyTrue - player.discharge.energy, { padding: 'exponent' });
                if (vacuum) {
                    const preonCap = calculateEffects.preonsHardcap();
                    getId('preonCapRatio').textContent = format(assignBuildingsProduction.S1Build1(true).divide(preonCap), { padding: true });
                    getQuery('#preonCap > span').textContent = format(preonCap.multiply(speed), { padding: true });
                }
            } else if (active === 2) {
                getId('reset0Button').textContent = `Reset for ${format(Math.max(global.vaporizationInfo.get, 0), { padding: true })} Clouds`;
                getQuery('#cloudEffect > span').textContent = format(calculateEffects.clouds(), { padding: true });
                if (vacuum) {
                    getQuery('#molesProduction > span:last-of-type').textContent = format(effectsCache.tritium / 6.02214076e23 * speed, { padding: true });
                }

                const rainNow = calculateEffects.S2Extra1(player.researchesExtra[2][1]);
                const rainAfter = calculateEffects.S2Extra1(player.researchesExtra[2][1], true);
                getQuery('#vaporizationBoostTotal > span').textContent = format((calculateEffects.clouds(true) / calculateEffects.clouds()) * (rainAfter / rainNow) * (calculateEffects.S2Extra2(rainAfter) / calculateEffects.S2Extra2(rainNow)), { padding: true });
            } else if (active === 3) {
                getQuery('#dustSoftcap > span').textContent = format(global.accretionInfo.dustSoft);
                if (player.accretion.rank < global.accretionInfo.maxRank && player.strangeness[3][4] >= 2) { getId('reset0Button').textContent = `Next Rank is in ${format(new Overlimit(calculateEffects.rankCost()).minus(buildings[0].total).max(0), { padding: true })} Mass`; }
                if (vacuum) {
                    getQuery('#massProduction > span').textContent = format(new Overlimit(assignBuildingsProduction.S1Build1()).multiply(1.78266192e-33 * speed), { padding: true });
                    getQuery('#submersionBoost > span').textContent = format(calculateEffects.submersion(), { padding: true });
                    if (player.researchesExtra[3][5] < 1) {
                        const dustCap = calculateEffects.dustHardcap();
                        getId('dustCapRatio').textContent = format(assignBuildingsProduction.S3Build1(true).divide(dustCap), { padding: true });
                        getQuery('#dustCap > span').textContent = format(dustCap, { padding: true });
                    }
                }
            } else if (active === 4 || active === 5) {
                const collapseInfo = global.collapseInfo;
                const starProd = buildingsInfo.producing[4];
                let total = player.strangeness[4][4] >= 3 ? 1 : (calculateEffects.mass(true) / calculateEffects.mass()) * (calculateEffects.S4Research4(true) / calculateEffects.S4Research4()) * ((1 + (calculateEffects.S5Upgrade2(true) - calculateEffects.S5Upgrade2()) / effectsCache.galaxyBase) ** (player.buildings[5][3].true * 2));
                if (player.strangeness[4][4] < 2) {
                    const restProd = new Overlimit(starProd[1]).allPlus(starProd[3], starProd[4], starProd[5]);
                    total *= new Overlimit(starProd[2]).multiply(calculateEffects.star[0](true) / effectsCache.star[0]).plus(restProd).divide(restProd.plus(starProd[2])).replaceNaN(1).toNumber() * (calculateEffects.star[1](true) / effectsCache.star[1]) * (calculateEffects.star[2](true) / effectsCache.star[2]);
                }

                if (active === 4) {
                    getId('reset0Button').textContent = `Collapse is at ${format(collapseInfo.newMass, { padding: true })} Mass`;
                    getQuery('#solarMassEffect > span').textContent = format(calculateEffects.mass(), { padding: true });
                    for (let i = 0; i < 3; i++) {
                        getId(`special${i + 1}Cur`).textContent = format(player.collapse.stars[i], { padding: 'exponent' });
                        getId(`special${i + 1}Get`).textContent = format(collapseInfo.starCheck[i], { padding: 'exponent' });
                        getQuery(`#star${i + 1}Effect > span:last-of-type`).textContent = format(effectsCache.star[i], { padding: true });

                        /* Fixes text movement */
                        const mainQuery = getQuery(`#special${i + 1} > p`);
                        const widthTest = mainQuery.getBoundingClientRect().width;
                        if (specialHTML.cache.innerHTML.get(mainQuery) !== widthTest) {
                            specialHTML.cache.innerHTML.set(mainQuery, widthTest);
                            mainQuery.style.minWidth = `${widthTest}px`;
                        }
                    }
                    if (player.strangeness[4][4] < 3) { getQuery('#collapseBoostTotal > span').textContent = format(total, { padding: true }); }
                    if (vacuum) {
                        getQuery('#mainCap > span').textContent = format(collapseInfo.solarCap, { padding: true });
                        getId('mainCapTill').textContent = format(assignResetInformation.timeUntil(), { padding: true });
                    }
                } else if (active === 5) {
                    const merge = player.merge;
                    if (vacuum || (player.tree[0][5] >= 1 && challenge !== 1)) {
                        const mergeInfo = global.mergeInfo;

                        const mergeEffects = [calculateEffects.reward[0](), calculateEffects.reward[1]()];
                        const remaining = calculateEffects.mergeMaxResets() - merge.resets;
                        getId('reset0Button').textContent = `Can reset ${remaining} more time${remaining !== 1 ? 's' : ''}`;
                        for (let i = 0; i < 2; i++) {
                            getId(`special${i + 1}Cur`).textContent = format(merge.rewards[i], { padding: 'exponent' });
                            getId(`special${i + 1}Get`).textContent = format(mergeInfo.checkReward[i], { padding: 'exponent' });
                            getQuery(`#merge${i + 1}Effect > span`).textContent = format(mergeEffects[i], { padding: true });
                        }
                        if (vacuum) { getQuery('#mainCapHardS5 > span').textContent = format(collapseInfo.solarCap, { padding: true }); }
                        if (player.strangeness[5][9] < 2) { getQuery('#mergeBoostTotal > span').textContent = format((buildings[3].true / (mergeInfo.galaxies + 1) + 1) * (calculateEffects.reward[0](true) / mergeEffects[0]) * (calculateEffects.reward[1](true) / mergeEffects[1]), { padding: true }); }

                        const groupsCost = calculateEffects.groupsCost();
                        const groupsTotal = player.researchesExtra[5][1] >= 2;
                        getQuery('#merge1Effect > span:last-of-type').textContent = `${groupsCost}`;
                        getQuery('#merge1Effect > span:nth-of-type(2)').textContent = `${(groupsTotal ? mergeInfo.galaxies : buildings[3].true) - (mergeInfo.checkReward[0] + merge[groupsTotal ? 'rewards' : 'claimed'][0]) * groupsCost}`;
                        const clustersTotal = player.researchesExtra[5][5] >= 2;
                        getQuery('#merge2Effect > span:nth-of-type(2)').textContent = `${(clustersTotal ? mergeInfo.galaxies : buildings[3].true) - (mergeInfo.checkReward[1] + merge[clustersTotal ? 'rewards' : 'claimed'][1]) * 100}`;
                    } else { getId('reset0Button').textContent = `Requires ${format(calculateEffects.mergeRequirement())} Galaxies`; }
                    if (player.strangeness[4][4] < 2) { getQuery('#mainCapPostS5 > span').textContent = format(collapseInfo[vacuum ? 'solarCap' : 'newMass'] * (calculateEffects.star[2](true) / effectsCache.star[2]), { padding: true }); }
                    getQuery('#elementsProductionS5 > span').textContent = format(new Overlimit(starProd[1]).allPlus(starProd[2], starProd[3], starProd[4], starProd[5]).multiply(speed), { padding: true });
                    if (player.strangeness[4][4] < 3) { getQuery('#collapseBoostTotalS5 > span').textContent = format(total, { padding: true }); }
                    getQuery('#mainCapS5 > span').textContent = format(collapseInfo.newMass, { padding: true });
                    getQuery('#timeSinceGalaxy > span').textContent = format(merge.since, { type: 'time' });
                }
            } else if (active === 6) {
                getId('darkSoftcap').textContent = format(calculateEffects.darkSoftcap(), { padding: true });
                const mergeScore = calculateEffects.mergeScore();
                const producings = [assignBuildingsProduction.verse0()];

                const softcap = calculateEffects.darkSoftcap();
                const current = buildings[0].current.toNumber();
                if (current > softcap) {
                    producings[0] = ((softcap * (softcap + 24 * producings[0] * speed) + 8 * current * (2 * current + softcap)) ** 0.5 - softcap) / 4 - current;
                } else { producings[0] *= speed; }
                for (let i = 0; i < producings.length; i++) {
                    getId(`verse${i}True`).textContent = `[${format(global.inflationInfo.trueUniverses, { padding: 'exponent' })}]`;
                    getId(`verse${i}Cur`).textContent = format(player.verses[i].current, { padding: 'exponent' });
                    getId(`verse${i}Prod`).textContent = format(producings[i], { padding: true });

                    let lockText;
                    if (!vacuum) {
                        if (player.tree[0][5] < 1) { lockText = 'Requires true Vacuum state'; }
                    } else if (challenge !== null) {
                        if (player.progress.main < 24 || challenge !== 0) {
                            lockText = 'Disabled by the Challenge';
                        } else if (global.challengesInfo[0].time < player.time[global.challengesInfo[0].resetType]) {
                            lockText = 'Out of Challenge time';
                        }
                    }
                    if (lockText !== undefined) {
                        getId(`verse${i}`).classList.remove('availableB');
                        getId(`verse${i}Btn`).textContent = lockText;
                        getId(`verse${i}BuyX`).textContent = 'Locked';
                        continue;
                    }

                    const cost = calculateVerseCost();
                    getId(`verse${i}`).classList[cost <= mergeScore ? 'add' : 'remove']('availableB');
                    getId(`verse${i}Btn`).textContent = `Need: ${format(cost, { padding: true })} Merge score`;
                    getId(`verse${i}BuyX`).textContent = '1';
                }
                const selfVerses = player.verses[0].other;
                getId('verse0True').dataset.title = `Basic: ${format(player.verses[0].true)}${selfVerses[2] < 1 ? '' : ` + False: ${format(selfVerses[2])}`}${selfVerses[0] < 1 ? '' : ` + Void: ${format(selfVerses[0])}`}`;

                const stable = vacuum || player.tree[0][5] >= 1;
                if (stable && player.darkness.active) {
                    getId('reset0Button').textContent = `Reset for ${format(Math.max(assignResetInformation.newFluid(), 0), { padding: true })} Dark fluid`;
                    getQuery('#darkEnergySpent > span').textContent = format(global.dischargeInfo.energyStage[6] - player.darkness.energy, { padding: 'exponent' });
                    const darkPost = calculateEffects.darkFluid(true);
                    getQuery('#nucleationBoostTotal > span').textContent = format((darkPost / effectsCache.fluid) * (calculateEffects.effectiveDarkEnergy(darkPost) / calculateEffects.effectiveDarkEnergy()) ** (player.researchesExtra[6][3] / 40), { padding: true });
                }
                if (stable && challenge !== 1) {
                    const merge = player.merge;
                    getId('mergeScore0Cur').textContent = format(global.mergeInfo.galaxies, { padding: 'exponent' });
                    getId('mergeScore1Cur').textContent = format(merge.rewards[0] * 2, { padding: 'exponent' });
                    getId('mergeScore2Cur').textContent = format(merge.rewards[1] * 4, { padding: 'exponent' });
                    getId('mergeScoreTotal').textContent = format(mergeScore, { padding: 'exponent' });
                    const safe = calculateEffects.mergeMaxResets(true) - merge.resets;
                    let post = mergeScore;
                    if (safe > 0) {
                        const allowed = player.buildings[5][3].true * (safe - 1);
                        const plusTrue = player.buildings[5][3].true + allowed;
                        const allGalaxies = global.mergeInfo.galaxies + (player.strangeness[5][9] >= 2 ? plusTrue : allowed);
                        post += plusTrue + //Galaxies
                            Math.floor(player.researchesExtra[5][1] >= 2 ? allGalaxies / calculateEffects.groupsCost() - merge.rewards[0] : (global.mergeInfo.checkReward[0] + merge.claimed[0]) * safe) * 2 + //Groups
                            Math.floor(player.researchesExtra[5][5] >= 2 ? allGalaxies / 100 - merge.rewards[1] : (global.mergeInfo.checkReward[1] + merge.claimed[1]) * safe) * 4; //Clusters
                    }
                    getId('mergeScoreAfter').textContent = format(post, { padding: 'exponent' });

                    getQuery('#mergeResetsS6 > span').textContent = format(merge.resets, { padding: 'exponent' });
                    getQuery('#mergeResetsS6 > span:last-of-type').textContent = format(calculateEffects.mergeMaxResets(), { padding: 'exponent' });
                }
                getQuery('#universeTime > span').textContent = format(player.inflation.age, { type: 'time' });
                getQuery('#universeTimeReal > span').textContent = format(player.time.universe, { type: 'time' });
            }

            const cosmonGain = calculateEffects.cosmonGain();
            getId('reset2Button').textContent = (!player.darkness.active && global.inflationInfo.trueUniverses >= 1) || player.darkness.energy >= 1000 ? `Big ${player.darkness.energy >= 1000 ? 'Rip' : 'Crunch'} for ${format(cosmonGain, { padding: true })} Cosmons` : `Requires ${player.darkness.active ? `${format(1000)} Dark energy` : 'a self-made Universe'}`;
            if (!vacuum && (active < 4 || active >= 6)) {
                getId('stageReward').textContent = format(calculateEffects.strangeGain(false), { padding: true });
                getId('reset1Button').textContent = stageResetCheck(active) ? 'Requirements are met' : active === 6 && (!player.darkness.active || player.tree[0][5] < 1 || player.tree[0][4] < 1) ? 'No Stage resets available' :
                    `Requires ${active === 6 ? `${format(1000)} Dark energy` : active === 3 ? `${format(2.45576045e31)} Mass` : active === 2 ? `${format(1.19444e29)} Drops` : `${format(1.67133125e21)} Molecules`}`;
            } else {
                if (player.elements[26] < 0.5) { assignResetInformation.quarksGain(); }
                getId('stageReward').textContent = format(global.strangeInfo.strange0Gain, { padding: true });
                if (challenge !== null && global.challengesInfo[challenge].resetType === 'stage' && global.challengesInfo[challenge].time < player.time.stage) { getId('reset1Button').textContent = 'Out of Challenge time'; }
            }
            getQuery('#stageTime > span').textContent = format(player.stage.time, { type: 'time' });
            getQuery('#stageTimeReal > span').textContent = format(player.time.stage, { type: 'time' });
            getQuery('#globalSpeed > span').textContent = format(speed, { padding: true });
            if (player.time.excess < 0) { getQuery('#gameDisabled > span').textContent = format(-player.time.excess / 1000, { type: 'time' }); }
        } else if (subtab === 'Advanced') {
            getChallengeDescription();
            getChallengeRewards();
        }
    } else if (tab === 'upgrade' || tab === 'Elements') {
        if (subtab === 'Upgrades') {
            for (let i = 0; i < global.upgradesInfo[active].maxActive; i++) { visualUpdateUpgrades(i, active, 'upgrades'); }
            for (let i = 0; i < global.researchesInfo[active].maxActive; i++) { visualUpdateResearches(i, active, 'researches'); }
            for (let i = 0; i < global.researchesExtraInfo[active].maxActive; i++) { visualUpdateResearches(i, active, 'researchesExtra'); }
            for (let i = 0; i < global.researchesAutoInfo.name.length; i++) { visualUpdateResearches(i, 0, 'researchesAuto'); }
            visualUpdateResearches(0, active, 'ASR');
            getUpgradeDescription(global.lastUpgrade[active][1]);
        } else if (subtab === 'Elements') {
            for (let i = 0; i < global.elementsInfo.name.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
            if (global.lastElement !== 0) { getUpgradeDescription('elements'); }
        }
    } else if (tab === 'strangeness') {
        if (subtab === 'Matter') {
            const interstellar = vacuum || active === 4 || active === 5;
            if (interstellar && player.elements[26] < 0.5) { assignResetInformation.quarksGain(); }
            const mainGain = interstellar ? global.strangeInfo.strange0Gain : calculateEffects.strangeGain(false, active !== 6 || !player.darkness.active || player.tree[0][5] < 1 || player.tree[0][4] < 1);
            getId('strange0Gain').textContent = format(mainGain, { padding: true });
            getId('strangeRate').textContent = format(mainGain / player.time.stage, { type: 'income' });
            getId('strange0Cur').textContent = format(player.strange[0].current, { padding: true });
            getId('strange1Cur').textContent = format(player.strange[1].current, { padding: true });
            getId('stageTimeStrangeness').textContent = format(player.time.stage, { type: 'time' });
            if (vacuum) { getId('strange1Gain').textContent = format(global.strangeInfo.strange1Gain, { padding: true }); }
            if (interstellar || active === Math.min(player.stage.current, 5)) {
                getQuery('#strangePeak > span').textContent = format(player.stage.peak[0], { type: 'income' });
                getId('strangePeakAt').textContent = format(player.stage.peak[1], { type: 'time' });
            }
            if (getId('strange1EffectsMain').style.display !== 'none') {
                const information = global.strangeInfo.strangeletsInfo;
                const canReset = stageResetCheck(5);
                getId('strange1Effect1Stat0').textContent = `${format(information[0] * 100, { padding: true })}% of current${vacuum ? '' : ' Interstellar'} Strange quarks ${vacuum && player.tree[0][5] >= 1 ? 'and Strangelets rates' : 'rate'}`;
                getId('strange1Effect1Stat1').textContent = `Which is equal to ${format(canReset ? information[0] * mainGain / player.time.stage : 0, { type: 'income' })}${vacuum && player.tree[0][5] >= 1 ? ` and ${format(canReset ? information[0] * global.strangeInfo.strange1Gain / player.time.stage : 0, { type: 'income' })}` : ''}${player.progress.main >= 19 ? ', not affected by global speed' : ''}`;
                getId('strange1Effect2Stat').textContent = format(information[1], { padding: true });
            }
            if (getId('strange0EffectsMain').style.display !== 'none') {
                const stageBoost = global.strangeInfo.stageBoost;
                const strangeness = player.strangeness;

                getId('strange0Effect1Stat').textContent = format(strangeness[1][6] >= 1 ? stageBoost[1] : 1, { padding: true });
                getId('strange0Effect2Stat').textContent = format(strangeness[2][6] >= 1 ? stageBoost[2] : 1, { padding: true });
                getId('strange0Effect3Stat').textContent = format(strangeness[3][7] >= 1 ? stageBoost[3] : 1, { padding: true });
                getId('strange0Effect4Stat').textContent = format(strangeness[4][7] >= 1 ? stageBoost[4] : 1, { padding: true });
                getId('strange0Effect5Stat').textContent = format(strangeness[5][7] >= 1 ? stageBoost[5] : 1, { padding: true });
            }
            for (let s = 1; s < global.strangenessInfo.length; s++) {
                for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) { visualUpdateResearches(i, s, 'strangeness'); }
            }
            getUpgradeDescription('strangeness');
        } else if (subtab === 'Milestones') {
            const time = player.time[challenge === 0 && player.toggles.supervoid ? 'vacuum' : 'stage'];
            const noTime = vacuum ? time > global.challengesInfo[0].time : (challenge === 1 || player.tree[0][4] < 1);
            for (let s = 1; s < global.milestonesInfo.length; s++) {
                const info = global.milestonesInfo[s];
                for (let i = 0; i < info.need.length; i++) {
                    getId(`milestone${i + 1}Stage${s}Current`).textContent = format(milestoneGetValue(i, s), { padding: true });
                    getId(`milestone${i + 1}Stage${s}Required`).textContent = !vacuum && player.milestones[s][i] >= info.scaling[i].length ? 'Maxed' :
                        noTime && (vacuum || time > info.reward[i]) ? 'No time' : format(info.need[i], { padding: true });
                }
            }
            getUpgradeDescription('milestones');
        }
    } else if (tab === 'inflation') {
        if (subtab === 'Inflations') {
            getId('cosmon0Span').textContent = format(player.cosmon[0].current, { padding: 'exponent' });
            getId('cosmon1Span').textContent = format(player.cosmon[1].current, { padding: true });
            getId('inflatonGainTrue').textContent = format(global.inflationInfo.trueUniverses + 1, { padding: 'exponent' });
            getId('endTime').textContent = format(player.time.end, { type: 'time' });
            const cosmonGain = calculateEffects.cosmonGain();
            getQuery('#cosmonGain > span').textContent = format(cosmonGain, { padding: true });
            getQuery('#cosmonRate > span').textContent = format(cosmonGain / player.time.end, { type: 'income' });
            getId('cosmonPeak').textContent = format(player.inflation.peak[0], { type: 'income' });
            getId('cosmonPeakAt').textContent = format(player.inflation.peak[1], { type: 'time' });
            for (let s = 0; s <= 1; s++) {
                for (let i = 0; i < global.treeInfo[s].name.length; i++) { visualUpdateResearches(i, s, 'inflations'); }
            }
            getUpgradeDescription('inflations');
        }
    } else if (tab === 'settings') {
        if (subtab === 'Settings') {
            const exportTypes = [];
            const exportReward = player.time.export;
            const conversion = Math.min(exportReward[0] / 43200_000, 1);
            if (challenge === null || global.challengesInfo[challenge].resetType === 'stage') {
                const claimPer = player.inflation.ends[0] >= 1 ? 1 : 2.5;
                exportTypes.push(`<span class="greenText">${format((exportReward[1] / claimPer + 1) * conversion, { padding: true })}</span> Strange quarks`);
                if (exportReward[2] > 0 || (vacuum ? player.strangeness[5][8] >= 1 : (player.darkness.active && player.tree[0][5] >= 1 && player.tree[0][4] >= 1))) { exportTypes.push(`<span class="greenText">${format(exportReward[2] / claimPer * conversion, { padding: true })}</span> Strangelets`); }
            }
            if (player.inflation.ends[1] >= 1) { exportTypes.push(`<span class="darkvioletText">${format(exportReward[3] / 5 * conversion, { padding: true })}</span> Cosmons`); }
            if (exportTypes.length !== 0) { assignInnerHTML('#exportReward', `Current reward is ${exportTypes.join(', ')}`); }
            getId('warpButton').textContent = `${Math.floor(player.time.offline / (60_000 * Math.min(7 - player.tree[0][6], 6)))} Warps`;
            if (global.lastSave >= 1000) { getId('isSaved').textContent = `${format(global.lastSave / 1000, { type: 'time' })} ago`; }
        } else if (subtab === 'Stats') {
            getId('firstPlayAgo').textContent = format((player.time.updated - player.time.started) / 1000, { type: 'time' });
            getId('onlineTotal').textContent = format(player.time.online / 1000, { type: 'time' });
            getQuery('#offlineStorage > span').textContent = format(player.time.offline / 1000, { type: 'time' });
            getQuery('#stageResets > span').textContent = format(player.stage.resets, { padding: 'exponent' });
            getQuery('#endResets > span').textContent = format(player.inflation.ends[0], { padding: 'exponent' });
            getId('endResetsType2').textContent = format(player.inflation.ends[1], { padding: 'exponent' });
            getQuery('#trueUniversesStats > span').textContent = format(global.inflationInfo.trueUniverses, { padding: 'exponent' });
            getId('trueUniversesHigh').textContent = format(player.verses[0].highest, { padding: 'exponent' });
            getQuery('#trueUniversesLow > span').textContent = player.inflation.ends[1] >= 1 ? `${player.verses[0].lowest[0]}` : 'Infinity';

            const exportReward = player.time.export;
            const claimPer = player.inflation.ends[0] >= 1 ? 1 : 2.5;
            assignInnerHTML('#exportQuarksMax', `<span class="whiteText">${format((exportReward[1] / claimPer + 1), { padding: true })}</span>${claimPer !== 1 ? ` (<span class="whiteText">${format(exportReward[1], { padding: true })}</span>)` : ''}`);
            assignInnerHTML('#exportStrangeletsMax > span', `<span class="whiteText">${format(exportReward[2] / claimPer, { padding: true })}</span>${claimPer !== 1 ? ` (<span class="whiteText">${format(exportReward[2], { padding: true })}</span>)` : ''}`);
            assignInnerHTML('#exportCosmonMax > span', `<span class="whiteText">${format(exportReward[3] / 5, { padding: true })}</span> (<span class="whiteText">${format(exportReward[3], { padding: true })}</span>)`);
            getId('exportTimeToMax').textContent = format(43200 - exportReward[0] / 1000, { type: 'time' });
            if (active === 1) {
                const info = global.dischargeInfo;
                getQuery('#dischargeStat > span').textContent = format(info.total);
                getId('dischargeStatTrue').textContent = ` [${player.discharge.current}]`;
                getQuery('#dischargeScaleStat > span').textContent = format(info.scaling);
                for (let s = 1; s < (vacuum ? 6 : 2); s++) {
                    const energyType = info.energyType[s];
                    getId(`energyGainStage${s}Total`).textContent = format(info.energyStage[s], { padding: 'exponent' });
                    for (let i = 1; i < global.buildingsInfo.maxActive[s]; i++) {
                        const index = i + (vacuum ? 0 : 2);
                        getId(`energyGainStage${s}Build${index}Cur`).textContent = format(energyType[i] * player.buildings[s][i as 1].true, { padding: 'exponent' });
                        getId(`energyGainStage${s}Build${index}Per`).textContent = format(energyType[i]);
                    }
                }
                getQuery('#effectiveEnergyStat > span').textContent = format(calculateEffects.effectiveEnergy(), { padding: true });
            } else if (active === 2) {
                const clouds = calculateEffects.clouds(true) / calculateEffects.clouds();
                getQuery('#cloudStat > span').textContent = format(clouds, { padding: true });
                const rainNow = calculateEffects.S2Extra1(player.researchesExtra[2][1]);
                const rainAfter = calculateEffects.S2Extra1(player.researchesExtra[2][1], true);
                const rain = rainAfter / rainNow;
                const storm = calculateEffects.S2Extra2(rainAfter) / calculateEffects.S2Extra2(rainNow);
                getQuery('#rainStat > span').textContent = format(rain, { padding: true });
                getQuery('#stormStat > span').textContent = format(storm, { padding: true });
                getId('cloudEffectTotal').textContent = format(clouds * rain * storm, { padding: true });

                if (vacuum) {
                    buildings[0].total.setValue(player.buildings[1][5].total).divide(6.02214076e23);
                    buildings[0].trueTotal.setValue(player.buildings[1][5].trueTotal).divide(6.02214076e23);
                }
            } else if (active === 3) {
                getId('currentRank').textContent = format(global.accretionInfo.effective);
                getId('currentRankTrue').textContent = ` [${format(player.accretion.rank, { padding: 'exponent' })}]`;
                if (vacuum) {
                    buildings[0].trueTotal.setValue(player.buildings[1][0].trueTotal).multiply(1.78266192e-33);
                }
            } else if (active === 4 || active === 5) {
                getQuery('#trueStarsStat > span').textContent = format(global.collapseInfo.trueStars, { padding: 'exponent' });
                if (active === 4) {
                    if (player.strangeness[4][4] < 3) {
                        const auto2 = player.strangeness[4][4] >= 2;
                        const mass = calculateEffects.mass(true) / calculateEffects.mass();
                        getQuery('#solarMassStat > span').textContent = format(mass, { padding: true });
                        let star0 = 1;
                        const star1 = auto2 ? 1 : calculateEffects.star[1](true) / effectsCache.star[1];
                        const star2 = auto2 ? 1 : calculateEffects.star[2](true) / effectsCache.star[2];
                        if (!auto2) {
                            const starProd = global.buildingsInfo.producing[4];
                            const restProd = new Overlimit(starProd[1]).allPlus(starProd[3], starProd[4], starProd[5]);
                            star0 = new Overlimit(starProd[2]).multiply(calculateEffects.star[0](true) / effectsCache.star[0]).plus(restProd).divide(restProd.plus(starProd[2])).replaceNaN(1).toNumber();
                            getQuery('#star1Stat > span').textContent = format(star0, { padding: true });
                            getQuery('#star2Stat > span:last-of-type').textContent = format(star1, { padding: true });
                            getQuery('#star3Stat > span').textContent = format(star2, { padding: true });
                        }
                        const gamma = calculateEffects.S4Research4(true) / calculateEffects.S4Research4();
                        getQuery('#gammaRayStat > span').textContent = format(gamma, { padding: true });
                        const quasar = (1 + (calculateEffects.S5Upgrade2(true) - calculateEffects.S5Upgrade2()) / effectsCache.galaxyBase) ** player.buildings[5][3].true;
                        getQuery('#quasarStat > span').textContent = format(quasar, { padding: true });
                        getId('starTotal').textContent = format(mass * star0 * star1 * star2 * gamma * (quasar ** 2), { padding: true });
                    }
                } else if (active === 5) {
                    getQuery('#galaxyBase > span').textContent = format(effectsCache.galaxyBase, { padding: true });
                    const stars = player.buildings[4];
                    buildings[0].total.setValue(stars[1].total).allPlus(stars[2].total, stars[3].total, stars[4].total, stars[5].total);
                    buildings[0].trueTotal.setValue(stars[1].trueTotal).allPlus(stars[2].trueTotal, stars[3].trueTotal, stars[4].trueTotal, stars[5].trueTotal);
                    if (vacuum || (player.tree[0][5] >= 1 && challenge !== 1)) {
                        getQuery('#mergeResets > span').textContent = format(player.merge.resets, { padding: 'exponent' });
                        getQuery('#mergeResets > span:last-of-type').textContent = format(calculateEffects.mergeMaxResets(), { padding: 'exponent' });
                        const auto2 = player.strangeness[5][9] >= 2;
                        const base = buildings[3].true / (global.mergeInfo.galaxies + 1) + 1;
                        getQuery('#mergeBaseStat > span').textContent = format(base, { padding: true });
                        const reward1 = auto2 ? 1 : calculateEffects.reward[0](true) / calculateEffects.reward[0]();
                        const reward2 = auto2 ? 1 : calculateEffects.reward[1](true) / calculateEffects.reward[1]();
                        if (!auto2) {
                            getQuery('#merge1Stat > span').textContent = format(reward1, { padding: true });
                            getQuery('#merge2Stat > span').textContent = format(reward2, { padding: true });
                        }
                        getId('mergeTotal').textContent = format(base * reward1 * reward2, { padding: true });
                    }
                }
            } else if (active === 6) {
                if (vacuum || player.tree[0][5] >= 1) {
                    assignResetInformation.newFluid();
                    const post = calculateEffects.darkFluid(true);
                    const base = post / effectsCache.fluid;
                    getQuery('#darkFluidStat > span').textContent = format(base, { padding: true });
                    const quint = (calculateEffects.effectiveDarkEnergy(post) / calculateEffects.effectiveDarkEnergy()) ** (player.researchesExtra[6][3] / 40);
                    getQuery('#quintessenceStat > span').textContent = format(quint, { padding: true });
                    getId('nucleationTotal').textContent = format(base * quint, { padding: true });

                    getQuery('#effectiveDarkEnergyStat > span').textContent = format(calculateEffects.effectiveDarkEnergy(), { padding: true });
                    const energyType = global.dischargeInfo.energyType[6];
                    for (let i = 1; i < energyType.length; i++) {
                        getId(`energyGainStage6Build${i}Cur`).textContent = format(energyType[i] * buildings[i as 1].true, { padding: 'exponent' });
                        getId(`energyGainStage6Build${i}Per`).textContent = format(energyType[i]);
                    }
                }
            }
            for (let i = 0; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}StatTotal`).textContent = format(buildings[i].total, { padding: true });
                getId(`building${i}StatTrueTotal`).textContent = format(buildings[i].trueTotal, { padding: true });
            }

            getId('strange0StatTotal').textContent = format(player.strange[0].total, { padding: true });
            getId('strange1StatTotal').textContent = format(player.strange[1].total, { padding: true });
            getId('verse0StatTotal').textContent = format(player.verses[0].total, { padding: 'exponent' });
            getId('cosmon0StatTotal').textContent = format(player.cosmon[0].total, { padding: 'exponent' });
            getId('cosmon1StatTotal').textContent = format(player.cosmon[1].total, { padding: true });
        }
    }

    const hoverText = specialHTML.hoverText;
    if (hoverText !== null) { hoverText(); }
};

export const visualUpdate = (ignoreOffline = false) => {
    if (global.offline.active && !ignoreOffline) { return; }
    checkProgress();
    const tab = global.tabs.current;
    const subtab = global.tabs[tab].current;
    const active = player.stage.active;
    const vacuum = player.inflation.vacuum;
    const highest = player.progress.main;

    {
        let showReset1 = tab === 'upgrade' || tab === 'Elements';
        if (globalSave.toggles[1]) { getId('ElementsTabBtn').style.display = player.upgrades[4][1] === 1 ? '' : 'none'; }
        if (active === 1) {
            if (player.upgrades[1][5] !== 1) { showReset1 = false; }
        } else if (active === 2) {
            getId('footerStat3').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
            if (player.upgrades[2][2] !== 1) { showReset1 = false; }
        } else if (active === 4) {
            getId('resetExtraFooter').style.display = player.researchesExtra[5][0] >= 1 ? '' : 'none';
            if (player.upgrades[4][0] !== 1) { showReset1 = false; }
        } else if (active === 5) {
            getId('resetExtraFooter').style.display = tab === 'stage' && subtab === 'Structures' ? '' : 'none';
            if (player.upgrades[5][3] !== 1) { showReset1 = false; }
        } else if (active === 6) {
            getId('footerStat2').style.display = player.upgrades[6][0] === 1 ? '' : 'none';
            getId('footerStat3').style.display = player.upgrades[6][0] === 1 ? '' : 'none';
            getId('resetExtraFooter').style.display = tab === 'stage' && subtab === 'Structures' && player.upgrades[5][3] === 1 ? '' : 'none';
            if (player.upgrades[6][0] !== 1) { showReset1 = false; }
        }
        getId('reset2Footer').style.display = tab === 'inflation' ? '' : 'none';
        getId('reset1Footer').style.display = tab === 'strangeness' ? '' : 'none';
        getId('reset0Footer').style.display = showReset1 ? '' : 'none';
        getId('exitFooter').style.display = player.challenges.active !== null ? '' : 'none';
        if (highest < 20) {
            if (highest < 1) { getId('footerStat2').style.display = 'none'; }
            if (highest < 16 && (vacuum || highest < 2)) { getId('reset1Footer').style.display = 'none'; }
            getId('reset2Footer').style.display = 'none';
        }
    }
    if (specialHTML.bigWindow === 'hotkeys') {
        getId('warpHotkey').style.display = player.challenges.supervoid[3] >= 4 ? '' : 'none';
        if (highest < 24) {
            if (highest < 3) {
                getId('autoTogglesHeader').style.display = player.ASR[1] >= 1 ? '' : 'none';
                getId('toggleStructureHotkey').style.display = player.ASR[1] >= 1 ? '' : 'none';
                getId('toggleAllHotkey').style.display = player.ASR[1] >= 1 ? '' : 'none';
            }
            if (highest < 17) {
                getId('toggleUpgradesHotkey').style.display = player.researchesAuto[0] >= 1 ? '' : 'none';
                getId('dischargeHotkey').style.display = (!vacuum && highest >= 11) || player.upgrades[1][5] === 1 ? '' : 'none';
                getId('vaporizationHotkey').style.display = (!vacuum && highest >= 11) || player.upgrades[2][2] === 1 ? '' : 'none';
                getId('rankHotkey').style.display = (!vacuum && highest >= 11) || global.stageInfo.activeAll.includes(3) ? '' : 'none';
                getId('collapseHotkey').style.display = (!vacuum && highest >= 11) || player.upgrades[4][0] === 1 ? '' : 'none';
            }
            if (highest < 18) {
                getId('toggleStageHotkey').style.display = player.strangeness[5][6] >= 1 ? '' : 'none';
                getId('toggleDischargeHotkey').style.display = player.strangeness[1][4] >= 1 ? '' : 'none';
                getId('toggleVaporizationHotkey').style.display = player.strangeness[2][4] >= 1 ? '' : 'none';
                getId('toggleRankHotkey').style.display = player.strangeness[3][4] >= 1 ? '' : 'none';
                getId('toggleCollapseHotkey').style.display = player.strangeness[4][4] >= 1 ? '' : 'none';
                getId('galaxyHotkey').style.display = (vacuum ? player.strangeness[5][3] >= 1 : player.milestones[4][1] >= 8) ? '' : 'none';
                getId('mergeHotkey').style.display = player.upgrades[5][3] === 1 ? '' : 'none';
            }
            getId('nucleationHotkey').style.display = player.upgrades[6][0] === 1 ? '' : 'none';
        }
    }

    if (tab === 'stage') {
        if (subtab === 'Structures') {
            const buildings = player.buildings[active];
            const buildingsToggle = player.toggles.buildings[active];
            const ASR = player.ASR[active];

            getId('exportMaxed').style.display = !globalSave.developerMode && player.time.export[0] >= 43200_000 ? '' : 'none';
            getId('gameDisabled').style.display = player.time.excess < 0 ? '' : 'none';
            let anyON = buildingsToggle[1];
            let anyOFF = false;
            for (let i = 1; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}True`).style.display = buildings[i].current.notEqual(buildings[i as 1].true) ? '' : 'none';
                getId(`building${i}Btn`).tabIndex = ASR >= i && buildingsToggle[i] ? -1 : 0;
                getId(`toggleBuilding${i}`).style.display = ASR >= i ? '' : 'none';

                if (!anyON) { anyON = ASR >= i && buildingsToggle[i]; }
                if (!anyOFF) { anyOFF = ASR >= i && !buildingsToggle[i]; }
            }
            const toggleHTML = getId('toggleAll');
            toggleHTML.style.color = anyON ? 'var(--green-text)' : '';
            toggleHTML.style.borderColor = anyON ? 'forestgreen' : '';
            toggleHTML.textContent = anyON ? (anyOFF ? 'Few ON' : 'All ON') : 'All OFF';

            if (active === 1) {
                getId('reset0Main').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('building2').style.display = buildings[1].trueTotal.moreOrEqual(vacuum ? 5 : 18) ? '' : 'none';
                getId('building3').style.display = buildings[2].trueTotal.moreOrEqual(2) ? '' : 'none';
                if (vacuum) {
                    getId('building4').style.display = buildings[3].trueTotal.moreOrEqual(18) || player.upgrades[1][2] === 1 ? '' : 'none';
                    getId('building5').style.display = buildings[4].trueTotal.moreOrEqual(2) ? '' : 'none';
                }
                getId('stageInfo').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('tritiumEffect').style.display = player.upgrades[1][8] === 1 ? '' : 'none';
                getId('energySpent').style.display = (player.challenges.supervoid[3] < 5 && player.accretion.rank < 6) || player.strangeness[1][9] < 1 || player.discharge.energy !== global.dischargeInfo.energyTrue ? '' : 'none';
                getId('autoWaitMain').style.display = player.tree[1][8] < 1 ? '' : 'none';
            } else if (active === 2) {
                const drops = buildings[1].trueTotal;
                getId('reset0Main').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('building2').style.display = drops.moreOrEqual(400) || buildings[1].true >= 100 ? '' : 'none';
                getId('building3').style.display = drops.moreOrEqual(8e6) ? '' : 'none';
                getId('building4').style.display = drops.moreOrEqual(8e17) ? '' : 'none';
                getId('building5').style.display = drops.moreOrEqual(8e22) ? '' : 'none';
                getId('cloudEffect').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('vaporizationBoostTotal').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('autoWaitMain').style.display = player.tree[1][8] < 2 ? '' : 'none';
                if (vacuum) {
                    getId('building6').style.display = drops.moreOrEqual(2e25) ? '' : 'none';
                } else { getId('stageInfo').style.display = player.upgrades[2][2] === 1 ? '' : 'none'; }
            } else if (active === 3) {
                const upgrades = player.upgrades[3];

                getId('buildings').style.display = player.accretion.rank >= 1 ? '' : 'none';
                getId('building2').style.display = upgrades[2] === 1 || buildings[2].trueTotal.moreThan(0) ? '' : 'none';
                getId('building3').style.display = upgrades[4] === 1 || buildings[3].trueTotal.moreThan(0) ? '' : 'none';
                getId('building4').style.display = upgrades[8] === 1 || buildings[4].trueTotal.moreThan(0) ? '' : 'none';
                getId('dustSoftcap').style.display = global.accretionInfo.dustSoft !== 1 ? '' : 'none';
                getId('autoWaitMain').style.display = player.tree[1][8] < 3 ? '' : 'none';
                if (vacuum) {
                    getId('building5').style.display = upgrades[11] === 1 || buildings[5].trueTotal.moreThan(0) ? '' : 'none';
                    getId('dustCap').style.display = player.researchesExtra[3][5] < 1 ? '' : 'none';
                    getId('submersionBoost').style.display = player.researchesExtra[1][2] >= 2 ? '' : 'none';
                } else { getId('stageInfo').style.display = global.accretionInfo.dustSoft !== 1 ? '' : 'none'; }
                updateRankInfo();
            } else if (active === 4) {
                const nova = player.researchesExtra[4][0];
                const star1 = buildings[2].trueTotal.moreThan(0);
                const star2 = buildings[3].trueTotal.moreThan(0);
                const star3 = buildings[4].trueTotal.moreThan(0);

                getId('reset0Main').style.display = player.upgrades[4][0] === 1 ? '' : 'none';
                getId('specials').style.display = star1 ? '' : 'none';
                getId('special2').style.display = star2 ? '' : 'none';
                getId('special3').style.display = star3 ? '' : 'none';
                getId('building2').style.display = nova >= 1 ? '' : 'none';
                getId('building3').style.display = nova >= 2 ? '' : 'none';
                getId('building4').style.display = nova >= 3 ? '' : 'none';
                getId('star1Effect').style.display = star1 ? '' : 'none';
                getId('star2Effect').style.display = star2 ? '' : 'none';
                getId('star3Effect').style.display = star3 ? '' : 'none';
                getId('collapseBoostTotal').style.display = player.strangeness[4][4] < 3 && player.upgrades[4][0] === 1 ? '' : 'none';
                getId('autoWaitMain').style.display = player.tree[1][8] < 4 ? '' : 'none';
                if (vacuum) {
                    if (player.challenges.active !== 0) { getId('building5').style.display = player.elements[26] >= 1 ? '' : 'none'; }
                    getId('mainCap').style.display = player.upgrades[4][0] === 1 ? '' : 'none';
                }
                setRemnants();
            } else if (active === 5) {
                const stable = vacuum || (player.tree[0][5] >= 1 && player.challenges.active !== 1);
                getId('reset0Main').style.display = player.upgrades[5][3] === 1 ? '' : 'none';
                getId('specials').style.display = stable && player.researchesExtra[5][1] >= 1 ? '' : 'none';
                getId('mergeEffects').style.display = stable && player.researchesExtra[5][1] >= 1 ? '' : 'none';
                getId('mergeBoostTotal').style.display = player.strangeness[5][9] < 2 && stable && player.upgrades[5][3] === 1 ? '' : 'none';
                if (stable) {
                    getId('special2').style.display = player.researchesExtra[5][5] >= 1 ? '' : 'none';
                    getId('merge2Effect').style.display = player.researchesExtra[5][5] >= 1 ? '' : 'none';
                }
                if (!vacuum) {
                    getId('mergeTrue').style.display = stable ? '' : 'none';
                    getId('mergeFalse').style.display = !stable ? '' : 'none';
                    getId('buildings').style.display = player.milestones[2][0] >= 7 || player.milestones[3][0] >= 7 ? '' : 'none';
                    getId('building1').style.display = player.milestones[2][0] >= 7 ? '' : 'none';
                    getId('building2').style.display = player.milestones[3][0] >= 7 ? '' : 'none';
                }
                getId('building3').style.display = player.researchesExtra[5][0] >= 1 ? '' : 'none';
                getId('mainCapPostS5').style.display = player.strangeness[4][4] < 2 && player.researchesExtra[5][0] >= 1 ? '' : 'none';
                getId('collapseBoostTotalS5').style.display = player.strangeness[4][4] < 3 ? '' : 'none';
                getId('timeSinceGalaxy').style.display = player.researchesExtra[5][0] >= 1 ? '' : 'none';
                getId('autoWaitMain').style.display = player.tree[1][8] < 4 ? '' : 'none';
            } else if (active === 6) {
                const stable = vacuum || player.tree[0][5] >= 1;
                const darkEnergy = stable && player.upgrades[6][0] === 1;
                getId('reset0Main').style.display = darkEnergy ? '' : 'none';
                getId('building1').style.display = darkEnergy || player.researches[6][0] >= 6 ? '' : 'none';
                getId('darkEnergySpent').style.display = darkEnergy ? '' : 'none';
                getId('nucleationBoostTotal').style.display = darkEnergy ? '' : 'none';
                getId('mergeScore').style.display = stable && player.researchesExtra[5][0] >= 1 ? '' : 'none';
                getId('mergeResetsS6').style.display = stable && player.upgrades[5][3] === 1 ? '' : 'none';
                if (stable) {
                    getId('mergeScore1').style.display = player.researchesExtra[5][1] >= 1 ? '' : 'none';
                    getId('mergeScore2').style.display = player.researchesExtra[5][5] >= 1 ? '' : 'none';
                    getQuery('#mergeResetsS6 > span').style.color = `var(--${player.merge.resets >= calculateEffects.mergeMaxResets() ? 'green' : 'red'}-text)`;
                }
            }
            if (highest < 17) {
                if (highest < 3) { getId('toggleAll').style.display = ASR >= 1 ? '' : 'none'; }
                if (highest < 5) { getId('autoWaitMain').style.display = 'none'; }
                if (active === 1) {
                    getId('resets').style.display = (!vacuum && highest >= 2) || player.upgrades[1][5] === 1 ? '' : 'none';
                } else if (active === 2) {
                    if (vacuum) { getId('resets').style.display = player.upgrades[2][2] === 1 ? '' : 'none'; }
                } else if (active === 4) {
                    if (vacuum) { getId('resets').style.display = player.upgrades[4][0] === 1 ? '' : 'none'; }
                }
                if (vacuum || highest < 11) { getId('exportMaxed').style.display = 'none'; }
            }
        } else if (subtab === 'Advanced') {
            (getId('challengeName') as HTMLButtonElement).disabled = global.lastChallenge[0] === 1 ? !global.april : global.lastChallenge[0] !== 0;
            getId('voidRewardsHead').style.display = global.lastChallenge[0] === 0 ? '' : 'none';
            getId('voidRewards').style.display = global.lastChallenge[0] === 0 ? '' : 'none';
            if (global.lastChallenge[0] === 0) {
                const progress = player.challenges.voidCheck;
                getId('voidRewards').style.display = '';
                getId('voidReward2').style.display = progress[1] >= 3 ? '' : 'none';
                getId('voidReward3').style.display = progress[1] >= 2 ? '' : 'none';
                getId('voidReward4').style.display = progress[3] >= 5 ? '' : 'none';
                getId('voidReward5').style.display = progress[4] >= 5 ? '' : 'none';
            }
            getId('challengeRewards').style.display = (global.lastChallenge[0] !== 0 || global.ultravoid === null) && (global.lastChallenge[0] !== 1 || !global.sessionToggles[2]) ? '' : 'none';
            getId('stabilityRewardsHead').style.display = global.lastChallenge[0] === 1 ? '' : 'none';
            getId('darknessTierMain').style.display = global.lastChallenge[0] === 2 ? '' : 'none';
            getId('challengesToggles').style.display = player.strangeness[5][6] >= (vacuum ? 1 : 2) ? '' : 'none';
            if (highest < 24) {
                if (highest < 20) { (getId('challengeName') as HTMLButtonElement).disabled = true; }
                if (highest < 22) { getId('challengeRewards').style.display = global.lastChallenge[0] !== 1 ? '' : 'none'; }
                getId('challenge3').style.display = player.strangeness[6][3] >= 1 ? '' : 'none';
            }
        }
    } else if (tab === 'upgrade' || tab === 'Elements') {
        if (subtab === 'Upgrades') {
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
                    getId('upgrade11').style.display = superposition && player.strangeness[5][10] >= 1 ? '' : 'none';
                    getId('extraResearches').style.display = superposition ? '' : 'none';
                    getId('researchExtra2').style.display = player.researchesExtra[1][2] >= 2 ? '' : 'none';
                    getId('researchExtra4').style.display = player.researchesExtra[1][2] >= 1 ? '' : 'none';
                    getId('researchExtra5').style.display = player.accretion.rank >= 6 ? '' : 'none';
                    getId('researchExtra6').style.display = player.accretion.rank >= 6 && player.strangeness[5][10] >= 1 ? '' : 'none';
                }
                if (highest < 17) { getId('researches').style.display = superposition ? '' : 'none'; }
            } else if (active === 2) {
                const puddle2 = player.buildings[2][2].trueTotal.moreThan(0);
                const puddle3 = player.buildings[2][3].trueTotal.moreThan(0);
                const puddle4 = player.buildings[2][4].trueTotal.moreThan(0);
                const puddle5 = player.buildings[2][5].trueTotal.moreThan(0);

                getId('upgrade2').style.display = puddle2 ? '' : 'none';
                getId('upgrade3').style.display = puddle3 ? '' : 'none';
                getId('upgrade4').style.display = puddle2 ? '' : 'none';
                getId('upgrade5').style.display = puddle2 ? '' : 'none';
                getId('upgrade6').style.display = puddle3 ? '' : 'none';
                getId('upgrade7').style.display = puddle4 ? '' : 'none';
                getId('upgrade8').style.display = puddle5 && player.strangeness[2][2] >= 3 ? '' : 'none';
                if (vacuum) {
                    getId('upgrade9').style.display = player.buildings[2][6].trueTotal.moreThan(0) && player.strangeness[2][8] >= 3 ? '' : 'none';
                    getId('research7').style.display = puddle5 && player.strangeness[5][10] >= 2 && player.tree[1][5] >= 3 ? '' : 'none';
                    getId('researchExtra4').style.display = player.accretion.rank >= 6 ? '' : 'none';
                    getId('researchExtra5').style.display = player.accretion.rank >= 7 && player.strangeness[5][10] >= 2 ? '' : 'none';
                }
                getId('research2').style.display = puddle2 ? '' : 'none';
                getId('research3').style.display = puddle2 ? '' : 'none';
                getId('research4').style.display = puddle2 ? '' : 'none';
                getId('research5').style.display = puddle3 ? '' : 'none';
                getId('research6').style.display = puddle4 ? '' : 'none';
                getId('extraResearches').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('researchExtra3').style.display = puddle5 ? '' : 'none';
            } else if (active === 3) {
                const rank = player.accretion.rank;
                const planetesimal = player.buildings[3][2].trueTotal.moreThan(0);

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
                    getId('upgrade14').style.display = rank >= 7 && player.strangeness[5][10] >= 3 ? '' : 'none';
                    getId('researchExtra5').style.display = rank >= 3 && player.researchesExtra[1][2] >= 2 ? '' : 'none';
                    getId('researchExtra6').style.display = rank >= 6 && player.strangeness[5][10] >= 3 ? '' : 'none';
                } else {
                    getId('upgrades').style.display = rank >= 1 ? '' : 'none';
                    getId('stageResearches').style.display = rank >= 1 ? '' : 'none';
                }
            } else if (active === 4) {
                const strangeness = player.strangeness;
                const stars = player.collapse.stars;
                const galaxy = player.researchesExtra[5][0] >= 1;

                getId('upgrade4').style.display = strangeness[4][2] >= 3 ? '' : 'none';
                getId('upgrade5').style.display = strangeness[4][9] >= 1 ? '' : 'none';
                getId('upgrade6').style.display = strangeness[5][10] >= 4 ? '' : 'none';
                getId('research4').style.display = (galaxy || stars[0] > 0) && strangeness[4][2] >= 1 ? '' : 'none';
                getId('research5').style.display = galaxy || stars[2] > 0 ? '' : 'none';
                getId('research6').style.display = (galaxy || stars[2] > 0) && strangeness[4][9] >= 3 ? '' : 'none';
                getId('researchExtra2').style.display = galaxy || stars[0] > 0 ? '' : 'none';
                getId('researchExtra3').style.display = (galaxy || stars[0] > 0) && strangeness[4][2] >= 2 ? '' : 'none';
                getId('researchExtra4').style.display = (galaxy || stars[1] > 0) && strangeness[4][9] >= 2 ? '' : 'none';
                getId('researchExtra5').style.display = (galaxy || stars[2] > 0) && strangeness[5][10] >= 4 ? '' : 'none';
            } else if (active === 5) {
                const galaxy = player.researchesExtra[5][0] >= 1;
                const unlocked = vacuum ? player.accretion.rank >= 7 : player.tree[0][5] >= 1;
                const stable = unlocked && player.challenges.active !== 1;
                getId('upgrade3').style.display = galaxy ? '' : 'none';
                getId('upgrade4').style.display = galaxy && (vacuum ? player.accretion.rank >= 7 : player.milestones[5][1] >= 8) ? '' : 'none';
                getId('upgrade5').style.display = unlocked ? '' : 'none';
                getId('upgrade6').style.display = unlocked ? '' : 'none';
                getId('upgrade7').style.display = unlocked ? '' : 'none';
                getId('research3').style.display = unlocked ? '' : 'none';
                getId('research4').style.display = unlocked ? '' : 'none';
                getId('research5').style.display = unlocked ? '' : 'none';
                getId('researchExtra2').style.display = stable ? '' : 'none';
                getId('researchExtra3').style.display = stable ? '' : 'none';
                getId('researchExtra4').style.display = stable ? '' : 'none';
                getId('researchExtra5').style.display = stable ? '' : 'none';
                getId('researchExtra6').style.display = stable ? '' : 'none';
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
                if (highest < 19) {
                    for (let i = 4; i < global.upgradesInfo[5].maxActive; i++) { getId(`upgrade${i + 1}`).style.display = 'none'; }
                    for (let i = 2; i < global.researchesInfo[5].maxActive; i++) { getId(`research${i + 1}`).style.display = 'none'; }
                    for (let i = 1; i < global.researchesExtraInfo[5].maxActive; i++) { getId(`researchExtra${i + 1}`).style.display = 'none'; }
                }
            } else if (active === 6) {
                const stable = vacuum || player.tree[0][5] >= 1;
                const darkEnergy = stable && player.upgrades[6][0] === 1;
                getId('upgrades').style.display = darkEnergy || player.researches[6][0] >= 20 ? '' : 'none';
                getId('stageResearches').style.display = stable && player.darkness.active ? '' : 'none';
                getId('extraResearches').style.display = darkEnergy ? '' : 'none';
                if (stable) {
                    getId('upgrade2').style.display = darkEnergy ? '' : 'none';
                    getId('research2').style.display = darkEnergy || player.researches[6][0] >= 10 ? '' : 'none';
                    getId('research3').style.display = darkEnergy || player.researches[6][0] >= 12 ? '' : 'none';
                    getId('research4').style.display = darkEnergy ? '' : 'none';
                }
            }
        } else if (subtab === 'Elements') {
            const upgrades = player.upgrades[4];
            const neutron = player.upgrades[4][2] === 1 && (player.collapse.stars[1] > 0 || player.researchesExtra[5][0] >= 1);
            const verses = upgrades[4] === 1 ? 1 + calculateEffects.trueUniverses() : 0;

            let columns = 18 - (upgrades[3] === 1 ? 0 : 2) - (verses > 1 ? 0 : verses === 1 ? 1 : 2);
            getId('elementsGrid').style.display = upgrades[2] === 1 ? '' : 'flex';
            for (let i = 6; i <= 10; i++) { getId(`element${i}`).style.display = upgrades[2] === 1 ? '' : 'none'; }
            for (let i = 11; i <= 26; i++) { getId(`element${i}`).style.display = neutron ? '' : 'none'; }
            if (!neutron) {
                columns = 8;
            } else {
                const show = player.progress.element[vacuum ? 1 : 0];
                if (show < 23) { //26 - showAhead
                    for (let i = 26; i > Math.max(show + 3, 10); i--) { getId(`element${i}`).style.display = 'none'; }
                    columns = Math.max(show - 9, 8); //min + show + showAhead - 20
                }
            }
            getId('element27').style.display = upgrades[3] === 1 ? '' : 'none';
            getId('element28').style.display = upgrades[3] === 1 ? '' : 'none';
            for (let i = 29; i < global.elementsInfo.name.length; i++) {
                getId(`element${i}`).style.display = verses >= i - 28 ? '' : 'none';
            }
            document.documentElement.style.setProperty('--elements-columns', `${columns}`);
        }
    } else if (tab === 'strangeness') {
        if (subtab === 'Matter') {
            const strangeness = player.strangeness;
            const universes = player.verses[0].current;
            const show1 = universes < 2 || global.sessionToggles[1];
            const show2 = universes < 3 || global.sessionToggles[1];
            const show3 = universes < 5 || global.sessionToggles[1];
            const strangeletsUnlocked = vacuum ? strangeness[5][8] >= 1 : (player.darkness.active && player.tree[0][5] >= 1 && player.tree[0][4] >= 1);
            getId('strange1').style.display = strangeletsUnlocked || player.strange[1].total > 0 ? '' : 'none';
            if (getId('strange0EffectsMain').style.display !== 'none') {
                getId('strange0Effect1Level2').style.display = strangeness[1][6] >= 2 ? '' : 'none';
                getId('strange0Effect2Level2').style.display = strangeness[2][6] >= 2 ? '' : 'none';
                getId('strange0Effect3Level2').style.display = strangeness[3][7] >= 2 ? '' : 'none';
                getId('strange0Effect4Level2').style.display = strangeness[4][7] >= 2 ? '' : 'none';
                getId('strange0Effect5Level2').style.display = strangeness[5][7] >= 2 ? '' : 'none';
            }
            if (vacuum) {
                const bound = strangeness[5][3] >= 1;
                const voidProgress = player.challenges.void;

                getId('strange1Unlocked').style.display = strangeletsUnlocked ? '' : 'none';
                getId('strange5Stage1').style.display = voidProgress[4] >= 1 || show3 ? '' : 'none';
                getId('strange8Stage1').style.display = voidProgress[1] >= 1 ? '' : 'none';
                getId('strange9Stage1').style.display = (universes >= 1 ? global.sessionToggles[1] : voidProgress[1] >= 2) ? '' : 'none';
                getId('strange10Stage1').style.display = voidProgress[4] >= 2 ? '' : 'none';
                getId('strange5Stage2').style.display = voidProgress[4] >= 1 || show3 ? '' : 'none';
                getId('strange8Stage2').style.display = voidProgress[1] >= 3 ? '' : 'none';
                getId('strange9Stage2').style.display = voidProgress[2] >= 1 ? '' : 'none';
                getId('strange10Stage2').style.display = voidProgress[2] >= 2 ? '' : 'none';
                getId('strange5Stage3').style.display = voidProgress[4] >= 1 || show3 ? '' : 'none';
                getId('strange9Stage3').style.display = voidProgress[4] >= 4 ? '' : 'none';
                getId('strange10Stage3').style.display = voidProgress[5] >= 1 ? '' : 'none';
                getId('strange5Stage4').style.display = voidProgress[4] >= 1 || show3 ? '' : 'none';
                getId('strange9Stage4').style.display = voidProgress[4] >= 3 ? '' : 'none';
                getId('strange10Stage4').style.display = voidProgress[4] >= 5 ? '' : 'none';
                getId('strange1Stage5').style.display = bound ? '' : 'none';
                getId('strange2Stage5').style.display = bound ? '' : 'none';
                getId('strange5Stage5').style.display = (universes >= 5 ? show3 : voidProgress[4] >= 1) && bound ? '' : 'none';
                getId('strange6Stage5').style.display = show1 && bound ? '' : 'none';
                getId('strange8Stage5').style.display = bound ? '' : 'none';
                getId('strange9Stage5').style.display = voidProgress[5] >= 2 || (universes >= 12 ? global.sessionToggles[1] : voidProgress[3] >= 5) ? '' : 'none';
                getId('strange10Stage5').style.display = (universes >= 5 ? show3 : voidProgress[3] >= 6) && bound ? '' : 'none';
                getId('strange11Stage5').style.display = voidProgress[2] >= 3 && bound ? '' : 'none';
                getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}6`).style.display = voidProgress[5] >= 2 ? '' : 'none';
                getId('strange4Stage6').style.display = !player.darkness.active || global.sessionToggles[1] ? '' : 'none';
                if (globalSave.MDSettings[0] && global.debug.MDStrangePage === 6 && voidProgress[5] < 2) { MDStrangenessPage(1); }
            } else {
                const milestones = player.milestones;
                const strange5 = milestones[4][0] >= 8;
                const firstTwo = milestones[2][0] >= 7 || milestones[3][0] >= 7;

                getId('strange0Type').textContent = global.strangeInfo.name[strangeletsUnlocked && active === 6 ? 1 : 0];
                getId('strangeRateType').textContent = global.strangeInfo.name[strangeletsUnlocked && active === 6 ? 1 : 0];
                getId('strange5Stage1').style.display = show3 ? '' : 'none';
                getId('strange7Stage1').style.display = strange5 ? '' : 'none';
                getId('strange5Stage2').style.display = show3 ? '' : 'none';
                getId('strange7Stage2').style.display = strange5 ? '' : 'none';
                getId('strange5Stage3').style.display = show3 ? '' : 'none';
                getId('strange8Stage3').style.display = strange5 ? '' : 'none';
                getId('strange5Stage4').style.display = show3 ? '' : 'none';
                getId('strange8Stage4').style.display = strange5 ? '' : 'none';
                getId('strange1Stage5').style.display = firstTwo ? '' : 'none';
                getId('strange2Stage5').style.display = firstTwo ? '' : 'none';
                getId('strange3Stage5').style.display = milestones[5][0] >= 8 ? '' : 'none';
                getId('strange4Stage5').style.display = firstTwo ? '' : 'none';
                getId('strange5Stage5').style.display = show3 && milestones[4][1] >= 8 ? '' : 'none';
                getId('strange6Stage5').style.display = show1 && firstTwo ? '' : 'none';
                getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}5`).style.display = strange5 ? '' : 'none';
                if (globalSave.MDSettings[0] && ((global.debug.MDStrangePage === 5 && !strange5) || global.debug.MDStrangePage > 5)) { MDStrangenessPage(1); }
                if (highest < 15) { getId('strange0').style.cursor = milestones[4][0] < 8 ? 'unset' : ''; }
            }
            getId('strange6Stage1').style.display = show1 ? '' : 'none';
            getId('strange6Stage2').style.display = show1 ? '' : 'none';
            getId('strange6Stage3').style.display = show1 ? '' : 'none';
            getId('strange7Stage3').style.display = show2 ? '' : 'none';
            getId('strange6Stage4').style.display = show1 ? '' : 'none';
            getId('strange7Stage4').style.display = show2 ? '' : 'none';
            getId('strange7Stage5').style.display = universes < 8 || global.sessionToggles[1] ? '' : 'none';
        } else if (subtab === 'Milestones') {
            if (!vacuum) {
                const milestonesS4 = player.milestones[4];
                getId('milestone1Stage5Div').style.display = milestonesS4[0] >= 8 ? '' : 'none';
                getId('milestone2Stage5Div').style.display = milestonesS4[1] >= 8 ? '' : 'none';
                if (global.stageInfo.activeAll.includes(4)) { getId('milestonesStage5Main').style.display = milestonesS4[0] >= 8 ? '' : 'none'; }
                if (global.stageInfo.activeAll.includes(5)) { getId('milestone2Stage5Main').style.display = milestonesS4[1] >= 8 ? '' : 'none'; }
            }
        }
    } else if (tab === 'inflation') {
        if (subtab === 'Inflations') {
            const supervoid = player.challenges.supervoid;
            getId('inflation7Tree1').style.display = supervoid[3] >= 4 ? '' : 'none';
            getId('inflation3Tree2').style.display = supervoid[3] >= 3 ? '' : 'none';
            getId('inflation4Tree2').style.display = 'none';
            getId('inflation5Tree2').style.display = supervoid[1] >= 1 ? '' : 'none';
            getId('inflation6Tree2').style.display = supervoid[2] >= 1 ? '' : 'none';
            getId('inflation7Tree2').style.display = supervoid[3] >= 1 ? '' : 'none';
            getId('inflation8Tree2').style.display = 'none';
            getId('inflation9Tree2').style.display = supervoid[1] >= 3 ? '' : 'none';
        } else if (subtab === 'Milestones') {
            const supervoid = player.challenges.supervoid;
            getId('inflationSupervoid1').style.display = supervoid[1] >= 2 ? '' : 'none';
            getId('inflationSupervoid2').style.display = supervoid[3] >= 2 ? '' : 'none';
            getId('inflationSupervoid3').style.display = supervoid[3] >= 5 ? '' : 'none';
            getQuery('#inflationMilestone1 > span > span').textContent = format(1.5);
            getQuery('#endMilestone2 > span > span').textContent = format(0.2);
            getId('endMilestone1').classList[player.inflation.ends[0] >= 1 ? 'remove' : 'add']('uncompleted');
            getId('endMilestone2').classList[player.inflation.ends[1] >= 1 ? 'remove' : 'add']('uncompleted');
            const current = player.verses[0].current;
            getId('inflationMilestone2').classList[current >= 2 ? 'remove' : 'add']('uncompleted');
            getId('inflationMilestone3').classList[current >= 3 ? 'remove' : 'add']('uncompleted');
            getId('inflationMilestone4').classList[current >= 5 ? 'remove' : 'add']('uncompleted');
            getId('inflationMilestone5').classList[current >= 8 ? 'remove' : 'add']('uncompleted');
            getId('inflationMilestone6').classList[current >= 12 ? 'remove' : 'add']('uncompleted');
        }
    } else if (tab === 'settings') {
        if (subtab === 'Settings') {
            const { researchesAuto, strangeness } = player;

            const exportTypes = [];
            const exportReward = player.time.export;
            const stable = vacuum || player.tree[0][5] >= 1;
            if (player.challenges.active === null || global.challengesInfo[player.challenges.active].resetType === 'stage') {
                const claimPer = player.inflation.ends[0] >= 1 ? 1 : 2.5;
                exportTypes.push(format((exportReward[1] / claimPer + 1) / 43200, { type: 'income' }).replace(' ', ' Strange quarks '));
                if (exportReward[2] > 0 || (vacuum ? strangeness[5][8] >= 1 : (stable && player.darkness.active && player.tree[0][4] >= 1))) { exportTypes.push(format(exportReward[2] / claimPer / 43200, { type: 'income' }).replace(' ', ' Strangelets ')); }
            }
            if (player.inflation.ends[1] >= 1) { exportTypes.push(format(exportReward[3] / 216000, { type: 'income' }).replace(' ', ' Cosmons ')); }
            const exportRewardId = getId('exportReward');
            if (exportTypes.length !== 0) { exportRewardId.dataset.title = exportTypes.join('\n'); }
            exportRewardId.style.display = exportTypes.length !== 0 ? '' : 'none';
            getId('collapsePointsMax').textContent = strangeness[5][4] >= 1 ? 'There is no maximum value' : 'Maximum value is 40';
            getId('warpButton').style.display = player.challenges.supervoid[3] >= 4 ? '' : 'none';
            getId('autoTogglesUpgrades').style.display = researchesAuto[0] >= 1 || researchesAuto[1] >= 2 ? '' : 'none';
            getId('autoElMain').style.display = researchesAuto[1] >= 2 ? '' : 'none';
            getId('autoUMain').style.display = researchesAuto[0] >= 1 ? '' : 'none';
            getId('autoRMain').style.display = researchesAuto[0] >= 2 ? '' : 'none';
            getId('autoEMain').style.display = researchesAuto[0] >= 3 ? '' : 'none';
            getId('autoSMain').style.display = player.verses[0].current >= 12 ? '' : 'none';
            getId('toggleAuto0').style.display = strangeness[5][6] >= 1 ? '' : 'none';
            getId('toggleAuto0Info').style.display = strangeness[5][6] >= 1 ? '' : 'none';
            if (getId('toggleAuto0Menu').style.display !== 'none') {
                const input1 = getId('stageInput') as HTMLInputElement;
                const input2 = getId('stageInputType') as HTMLInputElement;
                if (![input1, input2].includes(document.activeElement as HTMLInputElement)) {
                    const type = stageResetType();
                    input1.value = format(player.stage.input[type], { type: 'input' });
                    getId('stageAutoType').textContent = ['Strange quarks', 'seconds this Stage', 'seconds since peak'][type - 1];
                    input1.dataset.type = `${type}`;
                    input2.value = `${type}`;
                }
                if (!vacuum) {
                    getId('stageAutoInterstellar1').style.display = strangeness[5][6] >= 2 ? '' : 'none';
                    getId('stageAutoInterstellar2').style.display = strangeness[5][6] >= 2 ? '' : 'none';
                    getId('stageAutoMerge').style.display = stable && player.challenges.active !== 1 ? '' : 'none';
                }
            }
            getId('toggleAuto1').style.display = strangeness[1][4] >= 1 || (researchesAuto[2] >= 1 && (vacuum || player.stage.current === 1)) ? '' : 'none';
            const showAuto2 = strangeness[2][4] >= 1 || (vacuum ? researchesAuto[2] >= 3 : (researchesAuto[2] >= 1 && player.stage.current === 2));
            getId('toggleAuto2').style.display = showAuto2 ? '' : 'none';
            getId('toggleAuto2Info').style.display = showAuto2 ? '' : 'none';
            getId('toggleAuto3').style.display = strangeness[3][4] >= 1 || (vacuum ? researchesAuto[2] >= 2 : (researchesAuto[2] >= 1 && player.stage.current === 3)) ? '' : 'none';
            const showAuto4 = strangeness[4][4] >= 1 || (vacuum ? researchesAuto[2] >= 4 : (researchesAuto[2] >= 1 && player.stage.current >= 4));
            getId('toggleAuto4').style.display = showAuto4 ? '' : 'none';
            getId('toggleAuto4Info').style.display = showAuto4 ? '' : 'none';
            getId('toggleAuto9').style.display = strangeness[5][9] >= 1 ? '' : 'none';
            getId('toggleAuto9Info').style.display = stable && player.challenges.active !== 1 && strangeness[5][9] >= 1 ? '' : 'none';
            const showAuto6 = player.verses[0].lowest[0] <= 3;
            getId('nucleationToggleReset').style.display = stable && player.darkness.active ? '' : 'none';
            getId('toggleAuto10').style.display = showAuto6 ? '' : 'none';
            getId('toggleAuto10Info').style.display = showAuto6 ? '' : 'none';
            if (highest < 24) {
                if (highest < 9) { getId('elementsAsTab').style.display = player.upgrades[4][1] === 1 ? '' : 'none'; }
                if (highest < 15) { getId('autoStageSwitch').style.display = player.milestones[4][1] >= 8 ? '' : 'none'; }
                if (highest < 17) {
                    getId('resetToggles').style.display = (!vacuum && highest >= 2) || player.upgrades[1][5] === 1 ? '' : 'none';
                    getId('dischargeToggleReset').style.display = (!vacuum && highest >= 11) || player.upgrades[1][5] === 1 ? '' : 'none';
                    getId('vaporizationToggleReset').style.display = (!vacuum && highest >= 11) || player.upgrades[2][2] === 1 ? '' : 'none';
                    getId('rankToggleReset').style.display = (!vacuum && highest >= 11) || global.stageInfo.activeAll.includes(3) ? '' : 'none';
                    getId('collapseToggleReset').style.display = (!vacuum && highest >= 11) || player.upgrades[4][0] === 1 ? '' : 'none';
                    getId('hideGlobalStats').style.display = vacuum && player.stage.current >= 2 ? '' : 'none';
                    if (vacuum || highest < 11) { exportRewardId.style.display = 'none'; }
                }
                if (highest < 18) {
                    getId('vaporizationExtra').style.display = player.challenges.void[4] >= 1 ? '' : 'none';
                    getId('mergeToggleReset').style.display = player.upgrades[5][3] === 1 ? '' : 'none';
                    getId('saveFileNameGalaxy').style.display = (vacuum ? player.strangeness[5][3] >= 1 : player.milestones[4][1] >= 8) ? '' : 'none';
                }
                if (highest < 19 && vacuum) { getId('stageAutoMerge').style.display = player.upgrades[5][3] === 1 ? '' : 'none'; }
                if (player.upgrades[6][0] !== 1) { getId('nucleationToggleReset').style.display = 'none'; }
            }
        } else if (subtab === 'History') {
            updateStageHistory();
            updateEndHistory();
        } else if (subtab === 'Stats') {
            getId('firstPlay').textContent = new Date(player.time.started).toLocaleString();
            getId('offlineStorage').style.display = player.challenges.supervoid[3] >= 4 ? '' : 'none';
            const strangeletsUnlocked = vacuum ? player.strangeness[5][8] >= 1 : (player.darkness.active && player.tree[0][5] >= 1 && player.tree[0][4] >= 1);
            getId('exportStrangeletsMax').style.display = strangeletsUnlocked || player.time.export[2] > 0 ? '' : 'none';
            getId('exportCosmonMax').style.display = player.inflation.ends[1] >= 1 ? '' : 'none';
            for (let i = 1; i < global.buildingsInfo.maxActive[active]; i++) {
                getId(`building${i}Stats`).style.display = player.buildings[active][i].trueTotal.moreThan(0) ? '' : 'none';
            }
            getId('strange1Stats').style.display = strangeletsUnlocked || player.strange[1].total > 0 ? '' : 'none';

            getId('trueStarsStat').style.display = active === 4 || active === 5 ? '' : 'none';
            if (active === 1) {
                getId('dischargeStat').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                getId('dischargeStatTrue').style.display = player.discharge.current !== global.dischargeInfo.total ? '' : 'none';
                getId('dischargeScaleStat').style.display = player.upgrades[1][5] === 1 ? '' : 'none';
                for (let s = 1; s <= (vacuum ? 5 : 1); s++) {
                    let anyUnlocked = false;
                    for (let i = 1; i < global.buildingsInfo.name[s].length; i++) {
                        const unlocked = i < global.buildingsInfo.maxActive[s] && player.buildings[s][i].trueTotal.moreThan(0);
                        if (!anyUnlocked) { anyUnlocked = unlocked; }
                        getId(`energyGainStage${s}Build${i + (vacuum ? 0 : 2)}`).style.display = unlocked ? '' : 'none';
                    }
                    getId(s === 1 ? 'energyGainStats' : `energyGainStage${s}`).style.display = anyUnlocked ? '' : 'none';
                }
                if (highest < 1) { getId('energyGainStats').style.display = 'none'; }
            } else if (active === 2) {
                getId('vaporizationBoost').style.display = player.upgrades[2][2] === 1 ? '' : 'none';
                getId('rainStat').style.display = player.researchesExtra[2][1] >= 1 ? '' : 'none';
                getId('stormStat').style.display = player.researchesExtra[2][2] >= 1 ? '' : 'none';
            } else if (active === 3) {
                getId('currentRankTrue').style.display = global.accretionInfo.effective !== player.accretion.rank ? '' : 'none';
                if (vacuum) {
                    getId('rankStat0').style.display = player.strangeness[2][9] >= 1 ? '' : 'none';
                }
                for (let i = 1; i < global.accretionInfo.rankImage.length; i++) { getId(`rankStat${i}`).style.display = player.accretion.rank >= i ? '' : 'none'; }
            } else if (active === 4) {
                getId('collapseBoost').style.display = player.strangeness[4][4] < 3 && player.upgrades[4][0] === 1 ? '' : 'none';
                if (player.strangeness[4][4] < 3) {
                    const auto2 = player.strangeness[4][4] >= 2;
                    getId('star1Stat').style.display = !auto2 && player.buildings[active][2].trueTotal.moreThan(0) ? '' : 'none';
                    getId('star2Stat').style.display = !auto2 && player.buildings[active][3].trueTotal.moreThan(0) ? '' : 'none';
                    getId('star3Stat').style.display = !auto2 && player.buildings[active][4].trueTotal.moreThan(0) ? '' : 'none';
                    getId('gammaRayStat').style.display = player.researchesExtra[5][0] >= 1 || player.collapse.stars[2] >= 1 ? '' : 'none';
                    getId('quasarStat').style.display = player.researchesExtra[5][0] >= 1 ? '' : 'none';
                }
            } else if (active === 5) {
                const stable = vacuum || (player.tree[0][5] >= 1 && player.challenges.active !== 1);
                getId('mergeResets').style.display = stable && player.upgrades[5][3] === 1 ? '' : 'none';
                getId('galaxyBase').style.display = player.researchesExtra[5][0] >= 1 ? '' : 'none';
                getId('mergeBoost').style.display = stable && player.upgrades[5][3] === 1 ? '' : 'none';
                if (stable) {
                    getQuery('#mergeResets > span').style.color = `var(--${player.merge.resets >= calculateEffects.mergeMaxResets() ? 'green' : 'red'}-text)`;
                    const auto2 = player.strangeness[5][9] >= 2;
                    getId('merge1Stat').style.display = !auto2 && player.researchesExtra[5][1] >= 1 ? '' : 'none';
                    getId('merge2Stat').style.display = !auto2 && player.researchesExtra[5][5] >= 1 ? '' : 'none';
                }
            } else if (active === 6) {
                getId('nucleationBoost').style.display = player.upgrades[6][0] === 1 ? '' : 'none';
                getId('effectiveDarkEnergyStat').style.display = player.upgrades[6][0] === 1 ? '' : 'none';
                getId('energyGainStage6').style.display = player.upgrades[6][0] === 1 ? '' : 'none';
                if (vacuum || player.tree[0][5] >= 1) {
                    getId('quintessenceStat').style.display = player.researchesExtra[6][3] >= 1 ? '' : 'none';
                }
            }
        }
    }

    if (!globalSave.toggles[3]) { getId('fakeFooter').style.height = `${getId('footer').offsetHeight + globalSave.fontSize * 2}px`; }
    if (globalSave.SRSettings[0]) {
        for (const element of getClass('hasTitle')) { element.ariaDescription = element.dataset.title as string; }
    }
};
export const visualProgressUnlocks = () => {
    const highest = player.progress.main;
    const vacuum = player.inflation.vacuum;

    getId('upgradeTabBtn').style.display = highest >= 1 ? '' : 'none';
    getId('strangenessTabBtn').style.display = highest >= 16 || (!vacuum && highest >= 11) ? '' : 'none';
    getId('inflationTabBtn').style.display = highest >= 19 ? '' : 'none';
    getId('createAllFooter').style.display = highest >= 1 ? '' : 'none';
    getId('reset1Main').style.display = highest >= 16 || (!vacuum && highest >= 2) ? '' : 'none';
    getId('reset2Main').style.display = highest >= 20 ? '' : 'none';
    getId('stageRewardOld').style.display = highest < 10 ? '' : 'none';
    getId('stageRewardNew').style.display = highest >= 10 ? '' : 'none';
    getId('verse0True').style.display = highest >= 21 ? '' : 'none';
    getId('stageTimeReal').style.display = highest >= 19 ? '' : 'none';
    getId('universeTimeReal').style.display = highest >= 19 ? '' : 'none';
    getId('globalSpeed').style.display = highest >= 19 ? '' : 'none';
    getId('challenge1').style.display = highest >= 17 ? '' : 'none';
    getId('challenge2').style.cursor = highest >= 22 ? '' : 'help';
    (getId('voidRewardsHead') as HTMLButtonElement).disabled = highest < 20;
    getId('researchAuto3').style.display = highest >= 19 ? '' : 'none';
    getId('toggleHover0').style.display = highest >= 3 ? '' : 'none';
    getId('toggleMax0').style.display = highest >= 7 ? '' : 'none';
    getId('strangenessVisibility').style.display = highest >= 19 ? '' : 'none';
    for (let s = 2; s <= 4; s++) {
        const unlocked = highest >= s + 10;
        getId(`strangeness${globalSave.MDSettings[0] ? 'Page' : 'Section'}${s}`).style.display = unlocked ? '' : 'none';
        getId(`milestone1Stage${s}Div`).style.display = unlocked ? '' : 'none';
        getId(`milestone2Stage${s}Div`).style.display = unlocked ? '' : 'none';
    }
    if (globalSave.MDSettings[0]) {
        getId('toggleHover1').style.display = highest >= 19 ? '' : 'none';
        getId('toggleMax1').style.display = highest >= 19 ? '' : 'none';
        getId('createAllStrangeness').style.display = highest >= 19 ? '' : 'none';
    } else { getId('strangenessToggles').style.display = highest >= 19 ? '' : 'none'; }
    getId('cosmon1').style.display = highest >= 20 ? '' : 'none';
    getId('cosmonGain').style.display = highest >= 20 ? '' : 'none';
    getId('cosmonRate').style.display = highest >= 20 ? '' : 'none';
    getId('inflation4Tree1').style.display = highest >= 20 ? '' : 'none';
    getId('inflation5Tree1').style.display = highest >= 20 ? '' : 'none';
    getId('inflation6Tree1').style.display = highest >= 24 ? '' : 'none';
    getId('inflationsTree2').style.display = highest >= 20 ? '' : 'none';
    getId('inflationSupervoid').style.display = highest >= 20 ? '' : 'none';
    getId('endMilestone1').style.display = highest >= 20 ? '' : 'none';
    getId('endMilestone2').style.display = highest >= 20 ? '' : 'none';
    getQuery('#resetToggles span').style.display = highest >= 17 || (!vacuum && highest >= 11) ? '' : 'none';
    getId('stageToggleReset').style.display = highest >= 16 || (!vacuum && highest >= 2) ? '' : 'none';
    getId('endToggleReset').style.display = highest >= 20 ? '' : 'none';
    getId('themeArea').style.display = highest >= 3 || globalSave.theme !== null ? '' : 'none';
    getId('switchTheme2').style.display = highest >= 3 ? '' : 'none';
    getId('switchTheme3').style.display = highest >= 5 ? '' : 'none';
    getId('switchTheme4').style.display = highest >= 7 ? '' : 'none';
    getId('switchTheme5').style.display = highest >= 10 ? '' : 'none';
    getId('switchTheme6').style.display = highest >= 18 ? '' : 'none';
    getId('saveFileNameStage').style.display = highest >= 2 ? '' : 'none';
    getId('saveFileNameStrange').style.display = highest >= 17 || (!vacuum && highest >= 11) ? '' : 'none';
    getId('saveFileNameVacuum').style.display = highest >= 15 ? '' : 'none';
    getId('saveFileNameUniverse').style.display = highest >= 18 ? '' : 'none';
    getId('saveFileNameInflaton').style.display = highest >= 19 ? '' : 'none';
    getId('saveFileNameCosmon').style.display = highest >= 21 ? '' : 'none';
    getId('endHistory').style.display = highest >= 21 ? '' : 'none';
    getId('endResets').style.display = highest >= 21 ? '' : 'none';
    getId('exportStats').style.display = highest >= 17 || (!vacuum && highest >= 11) ? '' : 'none';
    getId('stageResets').style.display = highest >= 17 || (!vacuum && highest >= 3) ? '' : 'none';
    getId('trueUniversesStats').style.display = highest >= 21 ? '' : 'none';
    getId('trueUniversesLow').style.display = highest >= 24 ? '' : 'none';
    getId('strangeAllStats').style.display = highest >= 17 || (!vacuum && highest >= 11) ? '' : 'none';
    getId('inflatonStat').style.display = highest >= 19 ? '' : 'none';
    getId('cosmon1Stat').style.display = highest >= 21 ? '' : 'none';
    getId('effectiveEnergyStat').style.display = highest >= 1 ? '' : 'none';
    if (highest >= 3) { getId('toggleAll').style.display = ''; }
    if (highest >= 9) { getId('elementsAsTab').style.display = ''; }
    if (highest >= 15) {
        getId('strange0').style.cursor = '';
        getId('autoStageSwitch').style.display = '';
    } else if (!vacuum) { assignInnerHTML('#mergeFalse', 'Attempt to <span class="darkvioletText">Merge</span> <span class="grayText">Galaxies</span> together to create even bigger Structures. Might have severe consequences'); }
    if (highest >= 17) {
        getId('resets').style.display = '';
        getId('researches').style.display = '';
        getId('resetToggles').style.display = '';
        getId('dischargeToggleReset').style.display = '';
        getId('vaporizationToggleReset').style.display = '';
        getId('rankToggleReset').style.display = '';
        getId('collapseToggleReset').style.display = '';
        getId('hideGlobalStats').style.display = '';
        if (!globalSave.toggles[4]) { getId('globalStats').style.display = ''; }
    }
    if (highest >= 18) {
        getId('stageSelect').style.display = '';
        getId('vaporizationExtra').style.display = '';
        getId('mergeToggleReset').style.display = '';
        getId('saveFileNameGalaxy').style.display = '';
    }
    if (highest >= 24) {
        getId('challenge3').style.display = '';
    }

    if (specialHTML.bigWindow === 'hotkeys') {
        getId('stageRightHotkey').style.display = highest >= 9 ? '' : 'none';
        getId('stageLeftHotkey').style.display = highest >= 9 ? '' : 'none';
        getId('enterChallengeHotkey').style.display = highest >= 17 ? '' : 'none';
        getId('exitChallengeHotkey').style.display = highest >= 17 ? '' : 'none';
        getId('createAllHotkey').style.display = highest >= 1 ? '' : 'none';
        getId('versesHotkey').style.display = highest >= 18 ? '' : 'none';
        getId('stageHotkey').style.display = highest >= 16 || (!vacuum && highest >= 2) ? '' : 'none';
        getId('supervoidHotkey').style.display = highest >= 20 ? '' : 'none';
        getId('endHotkey').style.display = highest >= 20 ? '' : 'none';
        getId('toggleMergeHotkey').style.display = highest >= 18 ? '' : 'none';
        getId('toggleNucleationHotkey').style.display = highest >= 24 ? '' : 'none';
        if (globalSave.MDSettings[0]) { getId('stageSwipe').style.display = highest >= 9 ? '' : 'none'; }
        if (highest >= 3) {
            getId('autoTogglesHeader').style.display = '';
            getId('toggleStructureHotkey').style.display = '';
            getId('toggleAllHotkey').style.display = '';
        }
        if (highest >= 17) {
            getId('toggleUpgradesHotkey').style.display = '';
            getId('dischargeHotkey').style.display = '';
            getId('vaporizationHotkey').style.display = '';
            getId('rankHotkey').style.display = '';
            getId('collapseHotkey').style.display = '';
        }
        if (highest >= 18) {
            getId('toggleStageHotkey').style.display = '';
            getId('toggleDischargeHotkey').style.display = '';
            getId('toggleVaporizationHotkey').style.display = '';
            getId('toggleRankHotkey').style.display = '';
            getId('toggleCollapseHotkey').style.display = '';
            getId('galaxyHotkey').style.display = '';
            getId('mergeHotkey').style.display = '';
        }
        if (highest >= 24) { getId('nucleationHotkey').style.display = ''; }
    }
};

export const getUpgradeDescription = (type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements' | 'strangeness' | 'milestones' | 'inflations') => {
    if (type === 'inflations') {
        const index = global.lastInflation[0];
        if (index === null) {
            getId('inflationText').textContent = 'Hover to see.';
            getId('inflationEffect').textContent = 'Hover to see.';
            getId('inflationCost').textContent = 'Inflatons.';
            return;
        }
        const stageIndex = global.lastInflation[1];
        const pointer = global.treeInfo[stageIndex];
        const level = player.tree[stageIndex][index];

        getId('inflationText').textContent = `${stageIndex === 0 && global.loadouts.open ? `#${index + 1}. ` : ''}${pointer.name[index]}. (Level ${format(level)} out of ${format(pointer.max[index])})`;
        getId('inflationEffect').textContent = pointer.effectText[index]();
        if (level >= pointer.max[index]) {
            getId('inflationCost').textContent = 'Fully activated.';
        } else {
            let newLevel = 1 + level;
            let cost = pointer.cost[index];
            if (player.toggles.max[2] !== global.hotkeys.shift) {
                while (pointer.max[index] > newLevel) {
                    const check = cost + calculateTreeCost(index, stageIndex, newLevel);
                    if (player.cosmon[stageIndex].current < check) { break; }
                    cost = check;
                    newLevel++;
                }
            }
            getId('inflationCost').textContent = `${cost === 0 ? 'None' : `${format(cost)} ${stageIndex === 0 ? 'Inflatons' : 'Cosmons'}`}${stageIndex !== 0 ? ', non-refundable' : ''}.${newLevel - level > 1 ? ` [x${newLevel - level}]` : ''}`;
        }
    } else if (type === 'strangeness') {
        const index = global.lastStrangeness[0];
        const stageText = getId('strangenessStage');
        if (index === null) {
            stageText.textContent = '';
            getId('strangenessText').textContent = 'Hover to see.';
            getId('strangenessEffect').textContent = 'Hover to see.';
            getId('strangenessCost').textContent = 'Strange quarks.';
            return;
        }
        const stageIndex = global.lastStrangeness[1];
        const pointer = global.strangenessInfo[stageIndex];
        const level = player.strangeness[stageIndex][index];

        stageText.style.color = `var(--${global.stageInfo.textColor[stageIndex]}-text)`;
        stageText.textContent = `${global.stageInfo.word[stageIndex]}. `;
        getId('strangenessText').textContent = `${pointer.name[index]}. (Level ${format(level)} out of ${format(pointer.max[index])})`;
        getId('strangenessEffect').textContent = pointer.effectText[index]();
        if (level >= pointer.max[index]) {
            getId('strangenessCost').textContent = 'Maxed.';
        } else if (player.challenges.active === 1 && stageIndex < 4 && player.milestones[stageIndex][1] >= (stageIndex === 1 ? 6 : 7)) {
            getId('strangenessCost').textContent = `${global.stageInfo.word[stageIndex]} is removed from the reset cycle.`;
        } else {
            let newLevel = 1 + level;
            let cost = pointer.cost[index];
            if (player.toggles.max[1] !== global.hotkeys.shift) {
                while (pointer.max[index] > newLevel) {
                    const check = cost + (player.inflation.vacuum ?
                        Math.floor(Math.round((pointer.firstCost[index] * pointer.scaling[index] ** newLevel) * 100) / 100) :
                        Math.floor(Math.round((pointer.firstCost[index] + pointer.scaling[index] * newLevel) * 100) / 100));
                    if (player.strange[0].current < check) { break; }
                    cost = check;
                    newLevel++;
                }
            }
            getId('strangenessCost').textContent = `${format(cost)} Strange quarks.${newLevel - level > 1 ? ` [x${newLevel - level}]` : ''}`;
        }
    } else if (type === 'milestones') {
        const index = global.lastMilestone[0];
        const stageText = getId('milestonesStage');
        const multilineID = getId('milestonesMultiline');
        if (index === null) {
            stageText.textContent = '';
            getId('milestonesText').textContent = 'Hover to see.';
            assignInnerHTML(multilineID, `<p class="orchidText">Requirement: <span class="greenText">Hover to see.</span></p>
            <p class="blueText">Time limit: <span class="greenText">Hover to see.</span></p>
            <p class="darkvioletText">${player.inflation.vacuum ? 'Effect' : 'Unlock'}: <span class="greenText">Hover to see.</span></p>`);
            return;
        }
        const stageIndex = global.lastMilestone[1];
        const pointer = global.milestonesInfo[stageIndex];
        const level = player.milestones[stageIndex][index];

        let text;
        stageText.style.color = `var(--${global.stageInfo.textColor[stageIndex]}-text)`;
        stageText.textContent = `${global.stageInfo.word[stageIndex]}. `;
        getId('milestonesText').textContent = `${pointer.name[index]}. (Tier ${format(level, { padding: 'exponent' })}${player.inflation.vacuum ? '' : ` out of ${pointer.scaling[index].length}`}${pointer.recent[index] !== 0 ? `, +${format(pointer.recent[index], { padding: 'exponent' })} recently` : ''})`;
        if (player.inflation.vacuum) {
            const isActive = player.challenges.active === 0 && player.tree[0][4] >= 1;
            text = `<p class="orchidText">Requirement: <span class="greenText">${pointer.needText[index]()}</span></p>
            <p class="blueText">Time limit: <span class="greenText">${format(global.challengesInfo[0].time - (isActive ? player.time[player.toggles.supervoid ? 'vacuum' : 'stage'] : 0), { type: 'time' })} ${isActive ? 'remains ' : ''}to increase this tier within Void.</span></p>
            <p class="darkvioletText">Effect: <span class="greenText">${pointer.rewardText[index]()}</span>${player.tree[0][4] < 1 ? ' <span class="redText">(Disabled)</span>' : ''}</p>`;
        } else if (level < pointer.scaling[index].length) {
            const isActive = global.stageInfo.activeAll.includes(Math.min(stageIndex, 4));
            const timeLimit = isActive && (player.tree[0][4] < 1 || player.challenges.active === 1);
            text = `<p class="orchidText">Requirement: <span class="greenText">${pointer.needText[index]()}</span></p>
            <p class="blueText">Time limit: <span class="greenText">${format(pointer.reward[index] - (timeLimit ? player.time.stage : 0), { type: 'time' })} ${timeLimit ? 'remains ' : ''}to complete this tier within ${isActive ? 'current' : global.stageInfo.word[index === 0 && stageIndex === 5 ? 4 : stageIndex]} Stage.</span></p>
            <p class="darkvioletText">Unlock: <span class="greenText">Main reward unlocked after ${pointer.scaling[index].length - level} more completions.</span></p>`;
        } else { text = `<p class="darkvioletText">Reward: <span class="greenText">${pointer.rewardText[index]()}</span></p>`; }

        if (assignInnerHTML(multilineID, text)) {
            const container = multilineID.parentElement as HTMLElement;
            const heightTest = container.getBoundingClientRect().height;
            if (specialHTML.cache.innerHTML.get(container) !== heightTest) {
                specialHTML.cache.innerHTML.set(container, heightTest);
                container.style.minHeight = `${heightTest}px`;
            }
        }
    } else if (type === 'elements') {
        const index = global.lastElement;
        if (index === null) {
            getId('elementText').textContent = 'Hover to see.';
            getId('elementEffect').textContent = 'Hover to see.';
            getId('elementCost').textContent = 'Stardust.';
            return;
        }
        const pointer = global.elementsInfo;

        getId('elementText').textContent = `${pointer.name[index]}.`;
        getId('elementEffect').textContent = player.elements[index] > 0 || (player.progress.element[player.inflation.vacuum ? 1 : 0] >= index && index !== 0) ? pointer.effectText[index]() : 'Effect is not yet known.';
        getId('elementCost').textContent = player.elements[index] >= 1 ? 'Obtained.' :
            player.elements[index] > 0 ? 'Awaiting Collapse.' :
            index === 0 ? 'Unknown.' : `${format(pointer.cost[index])} Stardust.${globalSave.MDSettings[0] ? ' (Hold to create)' : ''}`;
    } else {
        const stageIndex = player.stage.active;
        const index = global.lastUpgrade[stageIndex][0];
        if (index === null) {
            getId('upgradeText').textContent = 'Hover to see.';
            getId('upgradeEffect').textContent = 'Hover to see.';
            getId('upgradeCost').textContent = `${global.stageInfo.costName[stageIndex]}.`;
        } else if (type === 'upgrades') {
            const pointer = global[`${type}Info`][stageIndex];
            const notEnoughUniverses = stageIndex === 5 && global.mergeInfo.unlockU[index] > calculateEffects.trueUniverses();

            getId('upgradeText').textContent = `${pointer.name[index]}.`;
            getId('upgradeEffect').textContent = notEnoughUniverses && global.mergeInfo.unlockU[index] > player.progress.universe ? 'Effect will be revealed once requirements are met.' : pointer.effectText[index]();
            getId('upgradeCost').textContent = player.upgrades[stageIndex][index] === 1 ? 'Created.' :
                stageIndex === 1 && player.upgrades[1][5] !== 1 && ((index === 3 || index === 4) && player.buildings[1][(player.inflation.vacuum ? 4 : 2) + (index === 3 ? 0 : 1)].total.equal(0)) ? `Requires any amount of ${index === 3 ? 'Atoms' : 'Molecules'} to create.` :
                stageIndex === 2 && index === 0 && player.buildings[2][1].true < 1 && player.buildings[2][2].true < 1 ? 'Requires any amount of self-made Drops to create.' :
                stageIndex === 4 && global.collapseInfo.unlockU[index] > player.collapse.mass && player.researchesExtra[5][0] < 1 ? `Unlocked at ${format(global.collapseInfo.unlockU[index])} Mass.` :
                notEnoughUniverses ? `Unlocked at ${global.mergeInfo.unlockU[index]} ${universeName()} Universes.` :
                `${format(pointer.cost[index])} ${global.stageInfo.costName[stageIndex]}.`;
        } else if (type === 'researches' || type === 'researchesExtra') {
            const pointer = global[`${type}Info`][stageIndex];
            const level = player[type][stageIndex][index];
            if (type === 'researchesExtra' && stageIndex === 4 && index === 0) { pointer.name[0] = ['Nova', 'Supernova', 'Hypernova'][Math.min(level, 2)]; }
            const notEnoughUniverses = stageIndex === 5 && global.mergeInfo[`unlock${type === 'researches' ? 'R' : 'E'}`][index] > calculateEffects.trueUniverses();

            getId('upgradeText').textContent = `${pointer.name[index]}. (Level ${format(level)} out of ${format(pointer.max[index])})`;
            getId('upgradeEffect').textContent = notEnoughUniverses && global.mergeInfo[`unlock${type === 'researches' ? 'R' : 'E'}`][index] > player.progress.universe ? 'Effect will be revealed once requirements are met.' : pointer.effectText[index]();
            if (level >= pointer.max[index]) {
                getId('upgradeCost').textContent = 'Maxed.';
            } else if (stageIndex === 4 && type === 'researches' && global.collapseInfo.unlockR[index] > player.collapse.mass && player.researchesExtra[5][0] < 1) {
                getId('upgradeCost').textContent = `Unlocked at ${format(global.collapseInfo.unlockR[index])} Mass.`;
            } else if (stageIndex === 5 && type === 'researchesExtra' && player.strangeness[5][3] < 1) {
                getId('upgradeCost').textContent = "Requires 'Gravitational bound' Strangeness.";
            } else if (notEnoughUniverses) {
                getId('upgradeCost').textContent = `Unlocked at ${global.mergeInfo[`unlock${type === 'researches' ? 'R' : 'E'}`][index]} ${universeName()} Universes.`;
            } else {
                let newLevels = 1;
                let cost = pointer.cost[index];
                const tillMax = pointer.max[index] - level;
                if (tillMax > 1 && (player.toggles.max[0] !== global.hotkeys.shift)) {
                    const scaling = pointer.scaling[index];
                    if (typeof cost === 'number') {
                        const currency = player[stageIndex === 1 ? 'discharge' : 'darkness'].energy;
                        if (stageIndex === 1 && (player.challenges.supervoid[3] >= 5 || player.accretion.rank >= 6) && player.strangeness[1][9] >= 1) {
                            newLevels = Math.min(Math.max(Math.floor((currency - cost) / scaling + 1), 1), tillMax);
                            if (newLevels > 1) { cost += (newLevels - 1) * scaling; }
                        } else {
                            const simplify = cost - scaling / 2;
                            newLevels = Math.min(Math.max(Math.floor(((simplify ** 2 + 2 * scaling * currency) ** 0.5 - simplify) / scaling), 1), tillMax);
                            if (newLevels > 1) { cost = newLevels * (newLevels * scaling / 2 + simplify); }
                        }
                    } else {
                        const currency = player.buildings[stageIndex === 5 ? 4 : stageIndex][stageIndex === 2 ? 1 : 0].current;
                        newLevels = Math.min(Math.max(Math.floor(new Overlimit(currency).multiply(scaling - 1).divide(cost).plus(1).log(scaling).toNumber()), 1), tillMax);
                        if (newLevels > 1) { cost = new Overlimit(scaling).power(newLevels).minus(1).divide(scaling - 1).multiply(cost); }
                    }
                }

                getId('upgradeCost').textContent = `${format(cost)} ${stageIndex === 6 && type === 'researchesExtra' ? 'Dark energy' : global.stageInfo.costName[stageIndex]}.${newLevels > 1 ? ` [x${newLevels}]` : ''}`;
            }
        } else if (type === 'researchesAuto') {
            const pointer = global.researchesAutoInfo;
            let level = player.researchesAuto[index];

            getId('upgradeText').textContent = `${pointer.name[index]}. (Level ${level} out of ${pointer.max[index]})`;
            getId('upgradeEffect').textContent = pointer.effectText[index]();
            if (level >= pointer.max[index]) {
                getId('upgradeCost').textContent = 'Maxed.';
            } else {
                const autoStage = pointer.autoStage[index][level];
                if (index === 1) { //Level from here can only be used for cost
                    if (player.strangeness[4][6] >= 1) { level--; }
                } else if (index === 2) {
                    if (player.strangeness[1][4] >= 1) { level--; }
                    if (player.strangeness[2][4] >= 1) { level--; }
                    if (player.strangeness[3][4] >= 1) { level--; }
                    if (player.strangeness[4][4] >= 1) { level--; }
                    if (player.inflation.vacuum) { level++; }
                }
                if (index === 1 && player.strangeness[4][6] >= 1) { level = Math.max(level - 1, 0); }
                getId('upgradeCost').textContent = `${format(pointer.costRange[index][Math.max(level, 0)])} ${global.stageInfo.costName[autoStage]}. ${!(autoStage === stageIndex || (stageIndex === 5 && autoStage === 4)) ? `(Requires to be in the '${global.stageInfo.word[autoStage]}')` : ''}`;
            }
        } else if (type === 'ASR') {
            const pointer = global.ASRInfo;
            const level = player.ASR[stageIndex];

            getId('upgradeText').textContent = `${pointer.name}. (Level ${level} out of ${pointer.max[stageIndex]})`;
            getId('upgradeEffect').textContent = pointer.effectText();
            getId('upgradeCost').textContent = level >= pointer.max[stageIndex] ? 'Maxed.' :
                stageIndex === 1 && player.upgrades[1][5] !== 1 ? "Cannot be created without 'Superposition' Upgrade." :
                stageIndex === 3 && player.accretion.rank < 1 ? "Cannot be created at 'Ocean world' Rank." :
                `${format(pointer.costRange[stageIndex][level])} ${global.stageInfo.costName[stageIndex]}.`;
        }
    }
};

export const getChallengeDescription = () => {
    const index = global.lastChallenge[0];
    const info = global.challengesInfo[index];
    const isActive = player.challenges.active === index || (index === 2 && player.darkness.active);
    const nameID = getId('challengeName');
    nameID.textContent = info.name;
    nameID.style.color = `var(--${info.color}-text)`;
    getId('challengeActive').style.display = isActive ? '' : 'none';

    const unlocked = index !== 1 || player.progress.main >= 22;
    const time = player.time[info.resetType];
    (nameID.parentElement as HTMLElement).style.display = unlocked ? '' : 'none';
    let text = !unlocked ? '' : `<p class="whiteText">${info.description()}</p>
    <article><h4 class="${info.color}Text bigWord">Effects:</h4>
    <div>${info.effectText()}</article>
    <p class="blueText">${isActive || index === 2 ? 'Remaining time' : 'Time limit'} is <span class="cyanText">${format(info.time - (isActive || index === 2 ? time : 0), { type: 'time' })}</span></p></div>`;

    if (index === 1) {
        const vacuum = player.inflation.vacuum;
        const gain = vacuum ? global.inflationInfo.trueUniverses + 1 : 1;
        text += `${unlocked ? '<article>' : ''}<h3 class="darkorchidText bigWord">Vacuum information</h3>
        <p class="orchidText">Vacuum state: <span class="${vacuum ? 'greenText">true' : 'redText">false'}</span> | Resets: <span class="darkorchidText">${player.inflation.resets}</span></p>
        ${player.progress.main >= 19 ? `<p class="darkvioletText">Current Inflatons gain: <span class="${vacuum ? 'green' : 'red'}Text">${format(gain, { padding: 'exponent' })}</span> | Rate: <span class="${vacuum ? 'green' : 'red'}Text">${format(gain / time, { type: 'income' })}</span></p>` : ''}
        <p class="orchidText">Time since last reset: <span class="darkorchidText">${format(player.inflation.time, { type: 'time' })}</span>${player.progress.main >= 19 ? ` (Real: <span class="darkorchidText">${format(time, { type: 'time' })}</span>)` : ''}</p>${unlocked ? '</article>' : ''}`;
    }
    assignInnerHTML('#challengeMultiline', text);
};

export const getChallengeRewards = () => {
    let text = '<p class="greenText center">'; //Need to be closed
    if (global.lastChallenge[0] === 0) {
        const info = global.challengesInfo[0];

        const stage = global.lastChallenge[1];
        const supervoid = global.sessionToggles[0];
        const reward = info.rewardText[supervoid ? 1 : 0][stage];
        const current = player.challenges[supervoid ? 'supervoidMax' : 'void'][stage];
        const best = player.challenges[supervoid ? 'supervoid' : 'voidCheck'][stage];
        const arrayMax = player.challenges[supervoid ? 'supervoid' : 'void'];
        const total = 1 + arrayMax[1] + arrayMax[2] + arrayMax[3] + arrayMax[4] + arrayMax[5];
        getId('voidRewardsHead').textContent = `${supervoid ? 'Supervoid' : 'Void'} rewards:`;
        text += `All rewards are located in the '${supervoid ? 'Inflation' : 'Strangeness'}' Tab\nAlso gain ${supervoid ? `a single Inflaton after unlocking ${total - global.inflationInfo.totalSuper} more` : `${total} Strange quarks, which is equal to total`} rewards</p>`;
        for (let i = 0; i < reward.length; i++) {
            const needText = info.needText[stage][i]();
            if (needText === null) { continue; }
            const unlocked = current > i;
            let failText;
            if (!unlocked && player.challenges.active === 0) {
                if (supervoid && !player.toggles.supervoid) {
                    failText = 'Supervoid only';
                } else if (player.time[supervoid ? 'vacuum' : 'stage'] > info.time) {
                    failText = 'Out of time';
                } else if (stage === 2 && i === 2 && player.accretion.rank > 1 && (player.challenges.supervoid[3] < 2 || player.strangeness[3][4] < 2)) {
                    failText = 'Failed';
                }
            }

            text += `<div><p><span class="${unlocked ? 'greenText' : 'redText'}">→ </span>${needText}${failText !== undefined ? ` <span class="redText">(${failText})</span>` : !unlocked && globalSave.SRSettings[0] ? ' (Not completed)' : ''}</p>
            <p><span class="${unlocked ? 'greenText' : 'redText'}">Reward: </span>${best > i ? reward[i] : 'Effect is not yet known'}</p></div>`;
        }
    } else if (global.lastChallenge[0] === 1) {
        const info = global.challengesInfo[1];

        const current = player.challenges.stability;
        text += `${current} Completions, can be increased by Merging Galaxies while active\nAlso gain a single Inflaton after 1 more completion</p>`;
        for (let i = 0; i < info.rewardText.length; i++) {
            const unlocked = current > i;
            let failText;
            if (!unlocked && player.challenges.active === 1) {
                if (player.time.vacuum > info.time) {
                    failText = 'Out of time';
                }
            }

            text += `<div><p><span class="${unlocked ? 'greenText' : 'redText'}">→ </span>${info.needText[i]}${failText !== undefined ? ` <span class="redText">(${failText})</span>` : !unlocked && globalSave.SRSettings[0] ? ' (Not completed)' : ''}</p>
            <p><span class="${unlocked ? 'greenText' : 'redText'}">Reward: </span>${unlocked ? info.rewardText[i] : 'Effect is not yet known'}</p></div>`;
        }
    } else {
        const info = global.challengesInfo[2];

        const current = player.verses[0].lowest[0];
        text += `Completed by causing End reset with at least ${format(1000)} Dark energy\nMost of rewards are related to Darkness automatization</p>`;
        for (let i = info.rewardText.length - 1; i >= 0; i--) {
            const unlocked = current <= i;
            let failText;
            if (global.inflationInfo.trueUniverses > i) {
                failText = 'Too many Universes';
            }

            text += `<div><p><span class="${unlocked ? 'greenText' : 'redText'}">→ </span>Complete with ${format(i)} self-made Universes${failText !== undefined ? ` <span class="redText">(${failText})</span>` : !unlocked && globalSave.SRSettings[0] ? ' (Not completed)' : ''}</p>
            <p><span class="${unlocked ? 'greenText' : 'redText'}">Reward: </span>${unlocked ? info.rewardText[i] : 'Effect is not yet known'}</p></div>`;
        }
    }
    assignInnerHTML('#challengeRewardsMultiline', text);
};

const visualUpdateUpgrades = (index: number, stageIndex: number, type: 'upgrades' | 'elements') => {
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
                color = '#660000'; //Darker maroon
            }
            image.tabIndex = globalSave.SRSettings[0] && globalSave.SRSettings[1] ? 0 : -1;
        } else { image.tabIndex = 0; }
        image.style.backgroundColor = color;
    } else if (type === 'elements') {
        const image = getId(`element${index}`);
        if (player.elements[index] >= 1) {
            image.classList.remove('awaiting');
            image.classList.add('created');
            if (index > 0) { image.tabIndex = globalSave.SRSettings[0] && globalSave.SRSettings[1] ? 0 : -1; }
        } else {
            image.classList[player.elements[index] > 0 ? 'add' : 'remove']('awaiting');
            image.classList.remove('created');
            if (index > 0) { image.tabIndex = 0; }
        }
    }
};

const visualUpdateResearches = (index: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'strangeness' | 'inflations') => {
    let max: number;
    let level: number;
    let textPointer: string;
    let fixMove = false;
    if (type === 'researches' || type === 'researchesExtra') {
        if (stageIndex !== player.stage.active) { return; }
        max = global[`${type}Info`][stageIndex].max[index];
        level = player[type][stageIndex][index];

        textPointer = `#research${type === 'researches' ? '' : 'Extra'}${index + 1}`;
        fixMove = true;
    } else if (type === 'researchesAuto') {
        max = global.researchesAutoInfo.max[index];
        level = player.researchesAuto[index];

        textPointer = `#researchAuto${index + 1}`;
    } else if (type === 'ASR') {
        if (stageIndex !== player.stage.active) { return; }
        max = global.ASRInfo.max[stageIndex];
        level = player.ASR[stageIndex];

        textPointer = '#ASR';
    } else if (type === 'strangeness') {
        max = global.strangenessInfo[stageIndex].max[index];
        level = player.strangeness[stageIndex][index];

        textPointer = `#strange${index + 1}Stage${stageIndex}`;
    } else /*if (type === 'inflations')*/ {
        max = global.treeInfo[stageIndex].max[index];
        level = player.tree[stageIndex][index];

        textPointer = `#inflation${index + 1}Tree${stageIndex + 1}`;
    }

    let text = '<span class="';
    if (level >= max) {
        text += 'greenText';
        getQuery(`${textPointer} > input`).tabIndex = globalSave.SRSettings[0] && globalSave.SRSettings[1] ? 0 : -1;
    } else if (level === 0) {
        text += 'redText';
        getQuery(`${textPointer} > input`).tabIndex = 0;
    } else {
        text += 'orchidText';
        getQuery(`${textPointer} > input`).tabIndex = 0;
    }
    text += `">${format(level, { padding: 'exponent' })}</span>`;
    if (max < 1e3) { text += `/<span class="greenText">${max}</span>`; }

    const mainHTML = getQuery(`${textPointer} > span`);
    if (assignInnerHTML(mainHTML, text)) {
        mainHTML.classList[max < 1e3 ? 'remove' : 'add']('noMaxLevel');

        if (!fixMove) { return; }
        const widthTest = mainHTML.getBoundingClientRect().width;
        if (specialHTML.cache.innerHTML.get(textPointer) !== widthTest) {
            specialHTML.cache.innerHTML.set(textPointer, widthTest);
            mainHTML.style.minWidth = `${widthTest}px`;
        }
    }
};

const updateRankInfo = () => {
    const rank = player.accretion.rank;
    if (global.debug.rankUpdated === rank) { return; }
    const rankInfo = global.accretionInfo;
    const name = getId('rankName');
    const nameExtra = getId('rankExtra');

    getId('reset0Button').textContent = rank >= rankInfo.maxRank ? 'Max Rank achieved' : `Next Rank is ${format(calculateEffects.rankCost())} Mass`;
    const maxInfoRank = Math.min(rank, 7);
    (getId('rankImage') as HTMLImageElement).src = `Used_art/${rankInfo.rankImage[maxInfoRank]}`;
    name.textContent = rank > 7 ? 'PG' : rankInfo.rankName[rank];
    name.style.color = `var(--${rankInfo.rankColor[maxInfoRank]}-text)`;
    nameExtra.style.display = rank > 7 ? '' : 'none';
    if (rank > 7) { nameExtra.textContent = `+${format(rank - 7, { padding: 'exponent' })}`; }
    global.debug.rankUpdated = rank;
};

export const updateCollapsePoints = () => {
    const points = player.collapse.points;
    const array = new Array(points.length);
    for (let i = 0; i < points.length; i++) { array[i] = format(points[i], { type: 'input' }); }
    getId('collapsePoints').textContent = array.length !== 0 ? `${array.join(', ')} or ` : '';
};

const setRemnants = () => {
    if (player.stage.active === 4) {
        const whiteDwarf = player.researchesExtra[4][2] >= 1;
        const src1 = whiteDwarf ? 'White%20dwarf' : 'Red%20giant';
        const img1 = getQuery('#special1 > img') as HTMLImageElement;
        if (specialHTML.cache.innerHTML.get(img1) !== src1) {
            specialHTML.cache.innerHTML.set(img1, src1);
            img1.src = `Used_art/${src1}.png`;
            img1.alt = whiteDwarf ? 'White dwarfs (Red giants)' : 'Red giants';
            getId('special1').dataset.title = img1.alt;
            getId('special1Cur').style.color = `var(--${whiteDwarf ? 'cyan' : 'red'}-text)`;
        }
        getId('star1Effect').dataset.title = `Boost to ${player.elements[27] >= 1 ? 'Brown dwarfs, ' : ''}Main-sequence${player.elements[33] >= 1 ? ', Red supergiants' : ''}`;

        const quarkStar = player.researchesExtra[4][3] >= 1;
        const src2 = quarkStar ? 'Quark%20star' : 'Neutron%20star';
        const img2 = getQuery('#special2 > img') as HTMLImageElement;
        if (specialHTML.cache.innerHTML.get(img2) !== src2) {
            specialHTML.cache.innerHTML.set(img2, src2);
            const name = global.april ? 'Antineutron' : 'neutron';
            img2.src = `Used_art/${src2}.png`;
            img2.alt = quarkStar ? `Quark stars (${name} stars)` : `${name} stars`;
            getId('special2').dataset.title = img2.alt;
            getId('special2Cur').style.color = 'var(--darkviolet-text)';
            getId('star2Effect').dataset.title = `Boost${quarkStar ? ' and cost decrease' : ''} to Interstellar Stars`;
        }

        if (player.inflation.vacuum) { getId('star3Effect').dataset.title = `Boost to the Solar mass gain${player.researchesExtra[4][4] >= 1 ? ', global speed' : ''} and delay to the Preons hardcap`; }
        if (globalSave.SRSettings[0]) { getId('specials').ariaLabel = 'Stars remnants'; }
    } else if (player.stage.active === 5) {
        const img1 = getQuery('#special1 > img') as HTMLImageElement;
        specialHTML.cache.innerHTML.set(img1, 'Group');
        img1.src = 'Used_art/Galaxy%20group.png';
        img1.alt = 'Galaxy groups';
        getId('special1').dataset.title = 'Galaxy groups';
        getId('special1Cur').style.color = 'var(--gray-text)';

        const img2 = getQuery('#special2 > img') as HTMLImageElement;
        specialHTML.cache.innerHTML.set(img2, 'Cluster');
        img2.src = 'Used_art/Missing.png'; //Galaxy%20cluster
        img2.alt = 'Galaxy clusters';
        getId('special2').dataset.title = 'Galaxy clusters';
        getId('special2Cur').style.color = 'var(--gray-text)';
        if (globalSave.SRSettings[0]) { getId('specials').ariaLabel = 'Merge results'; }
    }
};

const updateStageHistory = () => {
    if (global.debug.historyStage === player.stage.resets) { return; }
    const list = global.historyStorage.stage;

    let text = '';
    for (let i = 0; i < Math.min(list.length, player.history.stage.input[1]); i++) {
        text += `<li>${format(list[i][1], { padding: true })} Strange quarks, <span class="darkorchidText">${format(list[i][1] / list[i][0], { type: 'income' })}</span> | Peak: <span class="darkorchidText">${format(list[i][3], { type: 'income' })}</span>\n${list[i][2] > 0 ? `${format(list[i][2], { padding: true })} Strangelets, <span class="darkorchidText">${format(list[i][2] / list[i][0], { type: 'income' })}</span>, ` : ''}<span class="blueText">${format(list[i][0], { type: 'time' })}</span> | At: <span class="blueText">${format(list[i][4], { type: 'time' })}</span></li>`;
    }
    getId('stageHistoryList').innerHTML = text !== '' ? text : '<li class="redText">Reference list is empty</li>';

    const best = player.history.stage.best;
    getId('stageHistoryBest').innerHTML = `${format(best[1], { padding: true })} Strange quarks, <span class="darkorchidText">${format(best[1] / best[0], { type: 'income' })}</span> | Peak: <span class="darkorchidText">${format(best[3], { type: 'income' })}</span>\n${best[2] > 0 ? `${format(best[2], { padding: true })} Strangelets, <span class="darkorchidText">${format(best[2] / best[0], { type: 'income' })}</span>, ` : ''}<span class="blueText">${format(best[0], { type: 'time' })}</span> | At: <span class="blueText">${format(best[4], { type: 'time' })}</span>`;
    global.debug.historyStage = player.stage.resets;
};
const updateEndHistory = () => {
    const total = player.inflation.ends[0] + player.inflation.ends[1] + player.inflation.ends[2];
    if (global.debug.historyEnd === total) { return; }
    const list = global.historyStorage.end;

    let text = '';
    for (let i = 0; i < Math.min(list.length, player.history.end.input[1]); i++) {
        text += `<li><span class="darkvioletText">${format(list[i][1], { padding: true })} Cosmons</span>, <span class="darkorchidText">${format(list[i][1] / list[i][0], { type: 'income' })}</span> | Peak: <span class="darkorchidText">${format(list[i][3], { type: 'income' })}</span>\n<span class="darkvioletText">Type:</span> <span class="brownText">Big ${list[i][2] === 2 ? 'Freeze' : list[i][2] === 1 ? 'Rip' : 'Crunch'}</span>, <span class="blueText">${format(list[i][0], { type: 'time' })}</span> | At: <span class="blueText">${format(list[i][4], { type: 'time' })}</span></li>`;
    }
    getId('endHistoryList').innerHTML = text !== '' ? text : '<li class="redText">Reference list is empty</li>';

    const best = player.history.end.best;
    getId('endHistoryBest').innerHTML = `<span class="darkvioletText">${format(best[1], { padding: true })} Cosmons</span>, <span class="darkorchidText">${format(best[1] / best[0], { type: 'income' })}</span> | Peak: <span class="darkorchidText">${format(best[3], { type: 'income' })}</span>\n<span class="darkvioletText">Type:</span> <span class="brownText">Big ${best[2] === 2 ? 'Freeze' : best[2] === 1 ? 'Rip' : 'Crunch'}</span>, <span class="blueText">${format(best[0], { type: 'time' })}</span> | At: <span class="blueText">${format(best[4], { type: 'time' })}</span>`;
    global.debug.historyEnd = total;
};

/** @param padding 'exponent' value will behave as true, but only after number turns into its shorter version */
export const format = (input: number | Overlimit, settings = {} as { type?: 'number' | 'input' | 'time' | 'income', padding?: boolean | 'exponent' }): string => {
    if (typeof input === 'object') { return input?.format(settings as any); }
    const type = settings.type ?? 'number';
    let padding = settings.padding;

    let extra;
    if (type === 'income') { //1.2345e6 per second
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

        padding ??= true;
    } else if (type === 'time') { //12 Minutes 34 Seconds
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

        padding ??= true;
    }
    if (!isFinite(input)) { return extra !== undefined ? `${input} ${extra}` : `${input}`; }

    const inputAbs = Math.abs(input);
    if (inputAbs >= 1e6 || (inputAbs < 1e-4 && inputAbs > 0)) { //1.23e123 (-1.23e-123)
        if (padding === 'exponent') { padding = true; }

        let digits = Math.floor(Math.log10(inputAbs));
        let precision = 3 - Math.floor(Math.log10(Math.abs(digits)));
        let result = Math.round(input / 10 ** (digits - precision)) / 10 ** precision;
        if (Math.abs(result) === 10) { //To remove rare bugs
            result /= 10;
            digits++;
            if (digits === -4) { return format(1e-4 * result, settings); }
            if (padding) { precision = 3 - Math.floor(Math.log10(Math.abs(digits))); }
        }

        let formated = padding ? result.toFixed(precision) : `${result}`;
        if (type === 'input') { return `${formated}e${digits}`; }
        formated = `${formated.replace('.', globalSave.format[0])}e${digits}`;
        return extra !== undefined ? `${formated} ${extra}` : formated;
    }

    { //12345 (-12345)
        let precision = inputAbs < 10 ? 5 : (5 - Math.floor(Math.log10(inputAbs)));
        const result = Math.round(input * 10 ** precision) / 10 ** precision;

        const resultAbs = Math.abs(result); //To remove rare bugs
        if (resultAbs === 1e3 && (extra === 'millenniums' || extra === 'megaannums')) { return format(result * (extra === 'millenniums' ? 3.1556952e10 : 3.1556952e13), settings); }
        if (resultAbs === 1e6) { return format(result, settings); }
        if (padding === 'exponent') {
            padding = false;
        } else if (padding) { precision = resultAbs < 10 ? 5 : (5 - Math.floor(Math.log10(resultAbs))); }

        let formated = padding ? result.toFixed(precision) : `${result}`;
        if (type === 'input') { return formated; }
        let index = formated.indexOf('.');
        if (index !== -1) {
            formated = `${formated.slice(0, index)}${globalSave.format[0]}${formated.slice(index + 1)}`;
        } else { index = formated.length; }
        if (index > 3) {
            index -= 3;
            formated = `${formated.slice(0, index)}${globalSave.format[1]}${formated.slice(index)}`;
        }
        return extra !== undefined ? `${formated} ${extra}` : formated;
    }
};

export const stageUpdate = (changed = true, ignoreOffline = false) => {
    const { stageInfo, buildingsInfo } = global;
    const { active, current } = player.stage;
    const highest = player.progress.main;
    const activeAll = stageInfo.activeAll;
    const vacuum = player.inflation.vacuum;
    const challenge = player.challenges.active;

    activeAll.length = 0;
    if (vacuum) {
        activeAll.push(1);
        if (player.researchesExtra[1][2] >= 2) { activeAll.push(2); }
        if (current >= 2) { activeAll.push(3); } //player.researchesExtra[1][2] >= 1
        if (current >= 4) { activeAll.push(4); } //player.accretion.rank >= 6
        if (current >= 5 && player.strangeness[5][3] >= 1) { activeAll.push(5); } //player.elements[26] >= 1
    } else {
        if (current === 1 || (challenge !== 1 && player.milestones[1][1] >= 6)) { stageInfo.activeAll.push(1); }
        if (current === 2 || (challenge !== 1 && player.milestones[2][1] >= 7)) { stageInfo.activeAll.push(2); }
        if (current === 3 || (challenge !== 1 && player.milestones[3][1] >= 7)) { stageInfo.activeAll.push(3); }
        if (current >= 4) { activeAll.push(4); }
        if (current >= 5) { activeAll.push(5); } //player.elements[26] >= 1
    }
    if (highest >= 18) { activeAll.push(6); } //current >= 6
    if (global.offline.active && !ignoreOffline) {
        if (!global.offline.stage[1]) { global.offline.stage[1] = changed; }
        return;
    }

    for (let s = 1; s <= 6; s++) {
        for (const element of getClass(`stage${s}Only`)) { element.style.display = active === s ? '' : 'none'; }
        for (const element of getClass(`stage${s}Include`)) { element.style.display = activeAll.includes(s) ? '' : 'none'; }
    }

    const stageWord = getId('stageWord');
    stageWord.textContent = stageInfo.word[current];
    stageWord.style.color = `var(--${stageInfo.textColor[current]}-text)`;
    if (vacuum || active === 4 || active === 5) { getId('reset1Button').textContent = highest >= 10 ? (current >= 5 ? 'Requirements are met' : `Requires '${global.elementsInfo.name[26]}' Element`) : 'Requirements are unknown'; }
    if (challenge !== null) {
        getId('currentChallenge').style.display = '';
        const currentID = getQuery('#currentChallenge > span');
        currentID.textContent = global.challengesInfo[challenge].name;
        currentID.style.color = `var(--${global.challengesInfo[challenge].color}-text)`;
    } else { getId('currentChallenge').style.display = 'none'; }

    if (highest < 18) {
        if (highest < 17) {
            if (changed) {
                getId('resets').style.display = '';
                getId('researches').style.display = '';
            }
            if (!globalSave.toggles[4]) { getId('globalStats').style.display = vacuum && current >= 2 ? '' : 'none'; }
        }
        getId('stageSelect').style.display = activeAll.length > 1 ? '' : 'none';
    }
    if (vacuum) {
        getId('milestonesProgressArea').style.display = challenge === 0 && player.tree[0][4] >= 1 ? '' : 'none';
    } else {
        getId('strangePeak').style.display = active === Math.min(current, 5) || active === 4 || active === 5 ? '' : 'none';
    }

    if (!changed) {
        visualUpdate(ignoreOffline);
        numbersUpdate(ignoreOffline);
        return;
    }
    const researchExtraDivHTML = specialHTML.researchExtraDivHTML[active];
    if (globalSave.SRSettings[0]) {
        getId('extraResearches').ariaLabel = `${researchExtraDivHTML[2]} Researches (Special)`;
        getId('SRStage').textContent = `Current active Stage is '${stageInfo.word[active]}'${active !== global.trueActive ? `, will be changed to '${stageInfo.word[global.trueActive]}' after changing tab` : ''}`;
    }

    const upgradesInfo = global.upgradesInfo[active];
    const researchesInfo = global.researchesInfo[active];
    const researchesExtraInfo = global.researchesExtraInfo[active];
    const footerStatsHTML = specialHTML.footerStatsHTML[active];
    for (let i = Math.max(buildingsInfo.maxActive[active], 1); i < specialHTML.longestBuilding; i++) {
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
    const showE: number[] = []; //ResearchesExtra
    const showF: number[] = []; //Footer stats
    if (active === 1) {
        showU.push(2, 3, 4, 5);
        showR.push(0, 1, 2, 3, 4, 5);
        showF.push(0, 1);
        getId('specials').style.display = 'none';
        getId('resetExtraFooter').style.display = 'none';
        if (vacuum) {
            showU.push(0, 1);
            showE.push(0, 2);
        } else {
            getId('upgrade1').style.display = 'none';
            getId('upgrade2').style.display = 'none';
            getId('extraResearches').style.display = 'none';
        }
    } else if (active === 2) {
        showU.push(0);
        showR.push(0, 1);
        showE.push(0, 1);
        showF.push(0, 1);
        getId('specials').style.display = 'none';
        getId('resetExtraFooter').style.display = 'none';
        if (vacuum) { getId('stageInfo').style.display = ''; }
    } else if (active === 3) {
        showU.push(0, 1);
        showR.push(0, 1);
        showE.push(0);
        showF.push(0);
        global.debug.rankUpdated = null;
        getId('specials').style.display = 'none';
        getId('resetExtraFooter').style.display = 'none';
        getId('reset0Main').style.display = '';
        if (vacuum) { getId('stageInfo').style.display = ''; }
    } else if (active === 4) {
        showU.push(0, 1, 2);
        showR.push(0, 1, 2);
        showE.push(0);
        showF.push(0, 1);
        getId('stageInfo').style.display = '';
        getId('extraResearches').style.display = '';
        getId('resetExtraFooter').textContent = 'Galaxy';
    } else if (active === 5) {
        showE.push(0);
        showF.push(0, 1, 2);
        getId('stageInfo').style.display = '';
        getId('special3').style.display = 'none';
        if (vacuum) {
            showU.push(0, 1);
            showR.push(0, 1);
            getId('building2').style.display = '';
            getId('extraResearches').style.display = '';
        }
        setRemnants();
        getId('resetExtraFooter').textContent = 'Collapse';
    } else if (active === 6) {
        showF.push(0);
        showU.push(0);
        showR.push(0);
        showE.push(0, 1, 2, 3, 4);
        getId('stageInfo').style.display = '';
        getId('autoWaitMain').style.display = '';
        getId('specials').style.display = 'none';
        getId('resetExtraFooter').textContent = 'Merge';
    }
    getId('buildings').style.display = '';
    getId('building1').style.display = '';
    getId('upgrades').style.display = '';
    getId('stageResearches').style.display = '';
    (getId('autoWaitInput') as HTMLInputElement).value = format(player.toggles.shop.wait[active], { type: 'input' });
    resetMinSizes(false);

    const buildingHTML = specialHTML.buildingHTML[active];
    const buildingName = buildingsInfo.name[active];
    const buildingType = buildingsInfo.type[active];
    const buildingHoverText = buildingsInfo.hoverText[active];
    for (let i = 1; i < buildingsInfo.maxActive[active]; i++) {
        (getQuery(`#building${i} > img`) as HTMLImageElement).src = `Used_art/${buildingHTML[i - 1]}`;
        getQuery(`#building${i}Stats > h4`).textContent = buildingName[i];
        getId(`building${i}Name`).textContent = buildingName[i];
        getQuery(`#building${i}ProdDiv > span`).textContent = buildingType[i - 1];
        getId(`building${i}ProdDiv`).dataset.title = buildingHoverText[i - 1];
        toggleSwap(i, 'buildings');
    }
    getQuery('#building0Stats > h4').textContent = buildingName[0];

    const upgradeHTML = specialHTML.upgradeHTML[active];
    for (let i = 0; i < upgradesInfo.maxActive; i++) {
        const image = getId(`upgrade${i + 1}`) as HTMLInputElement;
        if (showU.includes(i)) { image.style.display = ''; }
        image.src = `Used_art/${upgradeHTML[i]}`;
        image.alt = upgradesInfo.name[i];
    }

    const researchHTML = specialHTML.researchHTML[active];
    for (let i = 0; i < researchesInfo.maxActive; i++) {
        const main = getId(`research${i + 1}`);
        if (showR.includes(i)) { main.style.display = ''; }
        main.className = researchHTML[i][1];
        const image = getQuery(`#research${i + 1} > input`) as HTMLInputElement;
        image.src = `Used_art/${researchHTML[i][0]}`;
        image.alt = researchesInfo.name[i];
    }

    const researchExtraHTML = specialHTML.researchExtraHTML[active];
    for (let i = 0; i < researchesExtraInfo.maxActive; i++) {
        const main = getId(`researchExtra${i + 1}`);
        if (showE.includes(i)) { main.style.display = ''; }
        main.className = researchExtraHTML[i][1];
        const image = getQuery(`#researchExtra${i + 1} > input`) as HTMLInputElement;
        image.src = `Used_art/${researchExtraHTML[i][0]}`;
        image.alt = researchesExtraInfo.name[i];
    }
    getQuery('#extraResearches > div').className = `researchesDiv ${researchExtraDivHTML[1]}`;
    const extraImgId = getQuery('#extraResearches > img') as HTMLImageElement;
    extraImgId.src = `Used_art/${researchExtraDivHTML[0]}`;
    extraImgId.dataset.title = `${researchExtraDivHTML[2]} Researches (Special)`;

    for (let i = 0; i < footerStatsHTML.length; i++) {
        if (showF.includes(i)) { getId(`footerStat${i + 1}`).style.display = ''; }
        (getQuery(`#footerStat${i + 1} > img`) as HTMLImageElement).src = `Used_art/${footerStatsHTML[i][0]}`;
        getQuery(`#footerStat${i + 1} > p`).className = footerStatsHTML[i][1];
        getQuery(`#footerStat${i + 1} span`).textContent = footerStatsHTML[i][2];
    }
    getId('reset0Footer').textContent = specialHTML.resetHTML[active];

    const bodyStyle = document.documentElement.style;
    bodyStyle.setProperty('--stage-text', `var(--${stageInfo.textColor[active]}-text)`);
    bodyStyle.setProperty('--stage-subtext', `var(--${stageInfo.textColor[active === 6 ? 3 : active]}-text)`);
    bodyStyle.setProperty('--stage-button-border', stageInfo.buttonBorder[active]);
    bodyStyle.setProperty('--stage-image-borderColor', stageInfo.imageBorderColor[active]);
    bodyStyle.setProperty('--image-border', `url("Used_art/Stage${active} border.png")`);

    visualUpdate(ignoreOffline);
    numbersUpdate(ignoreOffline);
    if (globalSave.theme === null) { setTheme(); }
};
