import { checkUpgradeReset } from './Check';
import { player, playerStart } from './Player';
import { autoUpgradesSet, calculateBuildingsCost, calculateMaxLevel, calculateResearchCost, calculateStageInformation } from './Stage';
import { numbersUpdate, visualUpdate, visualUpdateUpgrades } from './Update';

export const reset = (type: 'discharge' | 'vaporization' | 'rank' | 'collapse' | 'stage', stageIndex: number[]) => {
    if (type !== 'stage') {
        const { buildings } = player;

        for (const s of stageIndex) {
            buildings[s][0].current = playerStart.buildings[s][0].current;
            buildings[s][0].total = playerStart.buildings[s][0].total;
            for (let i = 1; i < playerStart.buildings[s].length; i++) {
                buildings[s][i].current = 0;
                buildings[s][i].true = 0;
                buildings[s][i].total = 0;
                calculateBuildingsCost(i, s);
            }

            if (type === 'discharge') { continue; }

            for (let i = 0; i < playerStart.upgrades[s].length; i++) {
                if (checkUpgradeReset(i, s, 'upgrades')) {
                    player.upgrades[s][i] = 0;
                    visualUpdateUpgrades(i, s, 'upgrades');
                }
            }
            autoUpgradesSet('upgrades', s);

            if (type === 'vaporization') { continue; }

            for (let i = 0; i < playerStart.researches[s].length; i++) {
                player.researches[s][i] = 0;
                calculateResearchCost(i, s, 'researches');
                visualUpdateUpgrades(i, s, 'researches');
            }
            autoUpgradesSet('researches', s);

            if (type === 'rank') { continue; }

            for (let i = 0; i < playerStart.researchesExtra[s].length; i++) {
                if (checkUpgradeReset(i, s, 'researchesExtra')) {
                    player.researchesExtra[s][i] = 0;
                    calculateResearchCost(i, s, 'researchesExtra');
                    visualUpdateUpgrades(i, s, 'researchesExtra');
                }
            }
            autoUpgradesSet('researchesExtra', s);
        }
    }

    switch (type) {
        case 'discharge':
            player.discharge.energyCur = 0;
            break;
        case 'collapse':
            if (player.strangeness[4][4] < 1) {
                for (let i = 1; i < player.elements.length; i++) {
                    player.elements[i] = 0;
                    visualUpdateUpgrades(i, 4, 'elements');
                }
            }
            break;
        case 'stage': {
            const start = structuredClone(playerStart) as typeof player; //Reference issues

            for (const s of stageIndex) {
                player.buildings[s] = start.buildings[s];
                player.upgrades[s] = start.upgrades[s];
                player.researches[s] = start.researches[s];
                player.researchesExtra[s] = start.researchesExtra[s];

                if (s === 1) {
                    player.discharge.energyCur = 0;
                    player.discharge.energyMax = 0;
                    player.discharge.current = 0;
                } else if (s === 2) {
                    player.vaporization.clouds = 1;
                } else if (s === 3) {
                    player.accretion.rank = 0;
                    player.buildings[3][0].current = 5.97e27;
                } else if (s === 4) {
                    player.collapse.mass = 0.01235;
                    player.collapse.stars = [0, 0, 0];
                    player.collapse.show = -1;
                    player.elements = start.elements;
                }

                if (s !== 5) {
                    player.ASR[s] = player.strangeness[s][[6, 5, 5, 6][s - 1]];
                } else {
                    player.ASR[5] = 0;
                }
                calculateResearchCost(0, s, 'ASR');

                for (let i = 1; i < playerStart.buildings[s].length; i++) { calculateBuildingsCost(i, s); }
                for (let i = 0; i < playerStart.researches[s].length; i++) { calculateMaxLevel(i, s, 'researches'); }
                for (let i = 0; i < playerStart.researchesExtra[s].length; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }

                autoUpgradesSet('upgrades', s);
                autoUpgradesSet('researches', s); //They need cost updated first
                autoUpgradesSet('researchesExtra', s);
            }
        }
    }
    calculateStageInformation(); //Without it, there will be bugs
    if (type !== 'stage') { visualUpdate(); }
    numbersUpdate();
};
