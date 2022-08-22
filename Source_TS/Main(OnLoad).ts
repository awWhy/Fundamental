//import { switchTab } from './Update';
import { quarks, player } from './Player';

export const getId = (id: string) => { //To type less and check if ID exist
    const i = document.getElementById(id);
    if (i !== null) {
        return i;
    }
    throw new TypeError(`ID "${id}" not found.`); //New or not, wont change result
};

//getId('atomsMain').addEventListener('click', () => switchTab('Stage'));
//getId('notRealId').addEventListener('click', () => switchTab('Settings'));

console.log(player);
console.log(quarks);
