import { global, player, playerStart } from './Player';
import { switchTheme } from './Special';
import { calculateBuildingsCost } from './Stage';
import { numbersUpdate, stageCheck, visualUpdate } from './Update';

export const reset = (type: 'discharge' | 'stage') => {
    const { stage, buildings } = player;

    switch (type) {
        case 'discharge':
            player.energy.current = 0;
            for (let i = 0; i < playerStart.buildings.length; i++) {
                if (i === 0) {
                    buildings[0].current = 3;
                    buildings[0].total += 3;
                } else {
                    buildings[i].current = 0;
                    buildings[i].true = 0;
                    calculateBuildingsCost(i);
                }
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
            }

            switch (stage.current) {
                case 1:
                    player.energy.current = 0;
                    player.energy.total = 0;
                    player.discharge.current = 0;
                    buildings[0].current = 3;
                    buildings[0].total = 3;
                    for (let i = 0; i < global.upgradesInfo.cost.length; i++) {
                        upgrades[i] = 0;
                    }
                    for (let i = 0; i < global.researchesInfo.cost.length; i++) {
                        researches[i] = 0;
                    }
                    break;
                case 2:
                    buildings[0].current = 0.0028;
                    buildings[0].total = 0.0028;
                    //Reset upgrades
                    //Reset researches
                    break;
            }
            stageCheck();
            visualUpdate();
            switchTheme();
            break;
        }
    }
    numbersUpdate();
};
