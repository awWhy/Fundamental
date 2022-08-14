import { switchTab } from './Update';

const idCheck = (id: string) => { //To type less and check if ID exist
    if (document.getElementById(id) && id !== null) {
        return document.getElementById(id);
    }
    return console.error(`Id "${id}" not found`);
}

export const getId = (id: string) => idCheck(id) as HTMLElement; //Without this (or ?.), there will be errors

getId('atomsMain').addEventListener('click', () => switchTab('Stage'));
getId('').addEventListener('click', () => switchTab('Settings'))