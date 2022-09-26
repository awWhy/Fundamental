import { global, player, playerStart } from './Player';
import { switchTheme } from './Special';
import { calculateBuildingsCost } from './Stage';
import { numbersUpdate, stageCheck, visualUpdate, visualUpdateUpgrades } from './Update';

export const reset = (type: 'discharge' | 'vaporization' | 'stage') => {
    const { stage, buildings } = player;

    switch (type) {
        case 'discharge': //Buildings reset at bottom
            player.discharge.energyCur = 0;
            buildings[0].current = 3;
            break;
        case 'vaporization':
            buildings[0].current = 0.0028;
            for (let i = 0; i < player.upgrades.length; i++) {
                if (i === 1) { continue; } //Just skips that loop
                player.upgrades[i] = 0;
                visualUpdateUpgrades(i);
            }
            break;
        case 'stage': { //Checks what stage is right now and resets parts that are only used in that stage
            player.upgrades = [];
            player.researches = [];
            player.researchesExtra = [];
            const { upgrades, researches, researchesExtra } = player;

            for (let i = 1; i < playerStart.buildings.length; i++) {
                buildings[i].current = 0;
                buildings[i].true = 0;
                buildings[i].total = 0;
                buildings[i].trueTotal = 0;
            }

            const upgradeType = `upgrades${stage.current !== 1 ? `S${stage.current}` : ''}Info` as 'upgradesS2Info';
            const researchType = `researches${stage.current !== 1 ? `S${stage.current}` : ''}Info` as 'researchesS2Info';
            const researchExtraType = `researchesExtra${stage.current !== 1 ? `S${stage.current}` : ''}Info` as 'researchesExtraS2Info';

            for (let i = 0; i < global[upgradeType].cost.length; i++) {
                upgrades[i] = 0;
            }
            for (let i = 0; i < global[researchType].cost.length; i++) {
                researches[i] = 0;
            }
            if (stage.current === 2) { //No idea if stage 1 will ever have it
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
