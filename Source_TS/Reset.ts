import { global, player, playerStart } from './Player';
import { switchTheme } from './Special';
import { calculateBuildingsCost, calculateResearchCost } from './Stage';
import { numbersUpdate, stageCheck, visualUpdate, visualUpdateUpgrades } from './Update';

export const reset = (type: 'discharge' | 'vaporization' | 'stage') => {
    const { stage, buildings } = player;

    switch (type) {
        case 'discharge': //Buildings reset at bottom
            player.energy.current = 0;
            buildings[0].current = 3;
            break;
        case 'vaporization':
            buildings[0].current = 0.0028;
            for (let i = 0; i < 3; i++) {
                player.upgrades[i] = 0;
                visualUpdateUpgrades(i);
            }
            for (let i = 0; i < global.researchesS2Info.cost.length; i++) {
                player.researches[i] = 0;
                visualUpdateUpgrades(i, 'researches');
                calculateResearchCost(i, 'researches');
            }
            break;
        case 'stage': { //Checks what stage is right now and resets parts that are only used in that stage
            player.upgrades = [];
            player.researches = [];
            const { upgrades, researches } = player;

            for (let i = 1; i < playerStart.buildings.length; i++) {
                buildings[i].current = 0;
                buildings[i].true = 0;
                buildings[i].total = 0;
                buildings[i].trueTotal = 0;
            }

            let upgradeType = 'upgradesInfo' as 'upgradesS2Info'; //TS is still incredebly stupid (no idea how to deal with it)
            let researchType = 'researchesInfo' as 'researchesS2Info';
            if (stage.current !== 1) {
                upgradeType = `upgradesS${stage.current}Info` as 'upgradesS2Info';
                researchType = `researchesS${stage.current}Info` as 'researchesS2Info';
            }
            for (let i = 0; i < global[upgradeType].cost.length; i++) {
                upgrades[i] = 0;
            }
            for (let i = 0; i < global[researchType].cost.length; i++) {
                researches[i] = 0;
            }

            switch (stage.current) {
                case 1:
                    buildings[0].current = 3;
                    player.energy.current = 0;
                    player.energy.total = 0;
                    player.discharge.current = 0;
                    break;
                case 2:
                    buildings[0].current = 0.0028;
                    player.vaporization.current = 0;
                    player.vaporization.clouds = 1;
                    break;
            }
            buildings[0].total = buildings[0].current;
            buildings[0].trueTotal = buildings[0].current;

            stageCheck();
            visualUpdate();
            switchTheme();
            break;
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
    numbersUpdate();
};
