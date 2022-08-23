import { getId } from './Main(OnLoad)';
import { global } from './Player';

export const switchTab = (tab: string) => {
    switch (tab) {
        case 'Stage':
            getId('stageTab').style.display = 'flex';
            getId('settingsTab').style.display = 'none';
            global.tab = 'Stage';
            break;
        case 'Settings':
            getId('stageTab').style.display = 'none';
            getId('settingsTab').style.display = 'flex';
            global.tab = 'Settings';
            break;
    } /* Make it better for more tabs */
    console.log(global.tab);
};

/* Add update function here with setInterval */
