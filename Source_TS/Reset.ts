import { player, playerStart } from './Player';

export const reset = (type: 'discharge' | 'stage') => {
    const { stage, buildings } = player;

    switch (type) {
        case 'discharge':
            player.energy.current = 0;
            for (let i = 0; i <= 3; i++) {
                if (i === 0) {
                    buildings[0].current = 3;
                    buildings[0].total += 3;
                } else {
                    buildings[i].current = 0;
                    buildings[i].true = 0;
                }
            }
            break;
        case 'stage': { //Checks what stage is right now and resets parts that are only used in that stage
            const { upgrades, researches } = player;

            switch (stage.true) {
                case 1:
                    reset('discharge');
                    player.energy.total = 0;
                    player.discharge.current = 0;
                    for (let i = 0; i <= 3; i++) {
                        if (i === 0) {
                            buildings[0].current = 3;
                            buildings[0].total = 3;
                        } else {
                            buildings[i].total = 0;
                        }
                    }
                    for (let i = 0; i < playerStart.upgrades.length; i++) {
                        upgrades[i] = 0;
                    }
                    for (let i = 0; i < playerStart.researches.length; i++) {
                        researches[i] = 0;
                    }
                    break;
                case 2:
                    /* Since I don't have stage 3 yet nothing to put here */
                    for (let i = 0; i <= 1; i++) {
                        if (i === 0) {
                            buildings[0].current = 1;
                            buildings[0].total = 1;
                        } else {
                            buildings[i].current = 0;
                            buildings[i].true = 0;
                            buildings[i].total = 0;
                        }
                    }
                    break;
            }
            break;
        }
    }
};
