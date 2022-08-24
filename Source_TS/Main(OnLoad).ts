import { quarks, particles, atoms, molecules, intervals, player, energy } from './Player';
import { getUpgradeDescription, invisibleUpdate, switchTab, visualUpdate } from './Update';
import { buyBuilding, buyUpgrades } from './Stage';

export const getId = (id: string) => { //To type less and check if ID exist
    const i = document.getElementById(id);
    if (i !== null) {
        return i;
    }
    throw new TypeError(`ID "${id}" not found.`); //New or not, wont change result
};

/* Stage tab */
getId('particlesBtn').addEventListener('click', () => buyBuilding(quarks, particles));
getId('atomsBtn').addEventListener('click', () => buyBuilding(particles, atoms));
getId('moleculesBtn').addEventListener('click', () => buyBuilding(atoms, molecules));
for (let i = 1; i <= player.upgrades.length; i++) {
    getId(`upgrade${i}`).addEventListener('mouseover', () => getUpgradeDescription(i));
    getId(`upgrade${i}`).addEventListener('click', () => buyUpgrades(i));
    getId(`upgrade${i}`).addEventListener('focus', () => getUpgradeDescription(i)); //Atempt to give Screen Readers ability to buy upgrades
    getId(`upgrade${i}`).addEventListener('focus', () => buyUpgrades(i));
}
//getId('stageReset').addEventListener('click', () => stageResetCheck());

/* Footer */
getId('stageTabBtn').addEventListener('click', () => switchTab('stage'));
getId('settingsTabBtn').addEventListener('click', () => switchTab('settings'));

export const reLoad = () => {
    if (energy.total < 9) {
        getId('energyStat').style.display = 'none';
        getId('upgrades').style.display = 'none';
    }
    if (particles.total < 11) {
        getId('atomsMain').style.display = 'none';
    }
    if (atoms.total < 2) {
        getId('moleculesMain').style.display = 'none';
    }
};

reLoad();
setInterval(invisibleUpdate, intervals.main);
setInterval(visualUpdate, intervals.numbers);
