import { getId } from './Main(OnLoad)';

/*export const switchTheme = (theme = 1, initial = false) => {
    switch (theme) {
        case 1:
            break;
        case 2:
            break;
    }
};*/

export const alert = (text: string) => {
    getId('alertText').textContent = text;
    getId('blocker').style.display = 'block';
    const close = () => {
        getId('blocker').style.display = 'none';
        getId('confirmBtn').removeEventListener('click', close);
    };
    getId('confirmBtn').addEventListener('click', close);
};

/*export const confirm = (text: string) => {
    getId('alertText').textContent = text;
    getId('blocker').style.display = 'block';
    const close = () => {
        getId('blocker').style.display = 'none';
        getId('confirmBtn').removeEventListener('click', close);
        return true;
    };
    getId('confirmBtn').addEventListener('click', close);
};

export const promt = (text: string, value = '') => {
    getId('alertText').textContent = text;
    getId('blocker').style.display = 'block';
    return value;
};*/
