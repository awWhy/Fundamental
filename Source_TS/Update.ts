import { getId } from './Main(OnLoad)';
import { global } from './Player';

export const switchTab = (tab: string) => {
    if (global.tab !== tab) { //First hide all tabs, then show requested one
        getId('stageTab').style.display = 'none';
        getId('settingsTab').style.display = 'none';

        switch (tab) {
            case 'Stage':
                getId('stageTab').style.display = 'flex';
                global.tab = 'Stage';
                break;
            case 'Settings':
                getId('settingsTab').style.display = 'flex';
                global.tab = 'Settings';
                break;
        }
    }
};

/* Add update function here with setInterval */
/* Cost meant to be inside a button... and Owned is first span*/
/* Dont forget to change aria-label to stuff like "Buy (buidlingName), (cost Number and a Word), (if can afford), (how many owned), (how much being produced per/s of cost building)"*/
