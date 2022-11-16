import { getUpgradeType, global, player, playerStart } from './Player';
import { switchTheme } from './Special';
import { autoBuyUpgrades, calculateBuildingsCost, calculateResearchCost, calculateStageInformation } from './Stage';
import { numbersUpdate, stageCheck, visualUpdateUpgrades } from './Update';

export const reset = (type: 'discharge' | 'vaporization' | 'rank' | 'collapse' | 'stage') => {
    const { stage, buildings } = player;

    switch (type) {
        case 'discharge': //Buildings reset at bottom
            player.discharge.energyCur = 0;
            buildings[0].current = 3;
            break;
        case 'vaporization':
            buildings[0].current = 0.0028;
            for (let i = 0; i < player.upgrades.length; i++) {
                if (i === 1) { continue; }
                player.upgrades[i] = 0;
                visualUpdateUpgrades(i, 'upgrades');
            }
            autoBuyUpgrades('upgrades', true);
            break;
        case 'rank':
            buildings[0].current = 1e-19;
            for (let i = 0; i < player.upgrades.length; i++) {
                player.upgrades[i] = 0;
                visualUpdateUpgrades(i, 'upgrades');
            }
            for (let i = 0; i < player.researches.length; i++) {
                player.researches[i] = 0;
                calculateResearchCost(i, 'researches');
                visualUpdateUpgrades(i, 'researches');
            }
            autoBuyUpgrades('upgrades', true);
            autoBuyUpgrades('researches', true);
            break;
        case 'collapse':
            buildings[0].current = 1;
            if (player.collapse.mass < 10) {
                for (let i = 1; i < player.upgrades.length; i++) {
                    player.upgrades[i] = 0;
                    visualUpdateUpgrades(i, 'upgrades');
                }
                autoBuyUpgrades('upgrades', true);
            }
            if (player.strangeness[3][4] < 1) {
                for (let i = 1; i < player.elements.length; i++) {
                    player.elements[i] = 0;
                    visualUpdateUpgrades(i, 'elements');
                }
            }
            for (let i = 0; i < player.researches.length; i++) {
                player.researches[i] = 0;
                calculateResearchCost(i, 'researches');
                visualUpdateUpgrades(i, 'researches');
            }
            for (let i = 1; i < player.researchesExtra.length; i++) {
                player.researchesExtra[i] = 0;
                calculateResearchCost(i, 'researchesExtra');
                visualUpdateUpgrades(i, 'researchesExtra');
            }
            autoBuyUpgrades('researches', true);
            autoBuyUpgrades('researchesExtra', true);
            break;
        case 'stage': { //Checks what stage is right now and resets parts that are only used in that stage
            player.upgrades = [];
            player.elements = [];
            player.researches = [];
            player.researchesExtra = [];
            const { upgrades, researches, researchesExtra } = player;

            for (let i = 1; i < playerStart.buildings.length; i++) {
                buildings[i].current = 0;
                buildings[i].true = 0;
                buildings[i].total = 0;
                buildings[i].trueTotal = 0;
            }

            const upgradeType = getUpgradeType('upgrades') as 'upgradesS2Info';
            const researchType = getUpgradeType('researches') as 'researchesS2Info';
            const researchExtraType = getUpgradeType('researchesExtra') as 'researchesExtraS2Info';

            for (let i = 0; i < global[upgradeType].cost.length; i++) {
                upgrades[i] = 0;
            }
            for (let i = 0; i < global[researchType].cost.length; i++) {
                researches[i] = 0;
            }
            if (stage.current !== 1) {
                for (let i = 0; i < global[researchExtraType].cost.length; i++) {
                    researchesExtra[i] = 0;
                }
            }

            switch (stage.current) {
                case 1:
                    buildings[0].current = 3;
                    player.discharge.energyCur = 0;
                    player.discharge.energyMax = 0;
                    player.discharge.current = 0;
                    break;
                case 2:
                    buildings[0].current = 0.0028;
                    player.vaporization.clouds = 1;
                    break;
                case 3:
                    if (player.accretion.rank === 0) {
                        buildings[0].current = 5.97e27;
                    } else {
                        buildings[0].current = 1e-19;
                        player.accretion.rank = 1;
                    }
                    break;
                case 4: //And every after
                    buildings[0].current = 1;
                    player.collapse.mass = 0.01235;
                    player.collapse.stars = [0, 0, 0];
                    player.collapse.show = -1;
                    for (let i = 0; i < global.elementsInfo.cost.length; i++) {
                        player.elements[i] = 0;
                    }
            }
            buildings[0].total = stage.current !== 3 ? buildings[0].current : 1e-19;
            buildings[0].trueTotal = buildings[0].total;
            player.events[0] = stage.true > stage.current; //true : false

            stageCheck();
            switchTheme();
        }
    }
    if (type !== 'stage') {
        buildings[0].total = buildings[0].current;
        for (let i = 1; i < playerStart.buildings.length; i++) {
            buildings[i].current = 0;
            buildings[i].true = 0;
            buildings[i].total = 0;
            calculateBuildingsCost(i);
        }
    }
    calculateStageInformation(); //Invisible update here will break autoBuyUpgrades();
    numbersUpdate();
};
