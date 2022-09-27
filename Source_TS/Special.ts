import { getId } from './Main';
import { global, player } from './Player';
import { format } from './Update';

export const setTheme = (themeNumber: number, initial = false) => {
    const { theme } = global;

    if (initial) {
        theme.default = true;
        localStorage.removeItem('theme');
    } else {
        theme.default = false;
        theme.stage = themeNumber;
        localStorage.setItem('theme', String(themeNumber));
    }
    switchTheme();
};

export const switchTheme = () => {
    const { stage } = player;
    const { stageInfo, theme } = global;
    const body = document.body.style;

    body.setProperty('--transition', '1s'); //Buttons are ignored
    if (theme.default) {
        theme.stage = stage.current;
        getId('currentTheme').textContent = 'Default';
    } else {
        getId('currentTheme').textContent = stageInfo.word[theme.stage - 1];
    }

    /* Full reset, for easier out of order theme change */
    getId('upgradeCost').classList.remove('orangeText', 'cyanText');
    getId('researchCost').classList.remove('orangeText', 'cyanText');
    body.removeProperty('--background-color');
    body.removeProperty('--window-color');
    body.removeProperty('--window-border');
    body.removeProperty('--footer-color');
    body.removeProperty('--button-main-color');
    body.removeProperty('--button-main-border');
    body.removeProperty('--button-main-hover');
    body.removeProperty('--button-extra-hover');
    //body.removeProperty('--button-delete-color');
    //body.removeProperty('--button-delete-hover');
    body.removeProperty('--main-text-color');
    //body.removeProperty('--white-text-color');
    //body.removeProperty('--cyan-text-color');
    body.removeProperty('--blue-text-color');
    //body.removeProperty('--orange-text-color');
    body.removeProperty('--gray-text-color');
    //body.removeProperty('--orchid-text-color');
    //body.removeProperty('--darkorchid-text-color');
    //body.removeProperty('--red-text-color');
    //body.removeProperty('--green-text-color');
    /* And set new colors */
    switch (theme.stage) {
        case 1:
            getId('upgradeCost').classList.add('orangeText');
            getId('researchCost').classList.add('orangeText');
            break;
        case 2:
            getId('upgradeCost').classList.add('cyanText');
            getId('researchCost').classList.add('cyanText');
            body.setProperty('--background-color', '#070026');
            body.setProperty('--window-color', '#000052');
            body.setProperty('--window-border', 'blue');
            body.setProperty('--footer-color', '#0000db');
            body.setProperty('--button-main-color', 'blue');
            body.setProperty('--button-main-border', '#427be1');
            body.setProperty('--button-main-hover', '#1515cf');
            body.setProperty('--button-extra-hover', '#2400d7');
            body.setProperty('--main-text-color', 'dodgerblue');
            body.setProperty('--blue-text-color', '#82cb3b');
            body.setProperty('--gray-text-color', '#9b9b9b');
            break;
    }
    setTimeout(() => { body.removeProperty('--transition'); }, 1000);
};

export const Alert = (text: string) => {
    const blocker = getId('blocker');
    if (getId('blocker').style.display === 'block') {
        return console.warn('Wasn\'t able to show another window (alert)');
    }

    getId('alertText').textContent = text;
    const confirm = getId('confirmBtn');

    blocker.style.display = 'block';
    const close = () => {
        blocker.style.display = 'none';
        confirm.removeEventListener('click', close);
    };
    confirm.addEventListener('click', close);
};

export const Confirm = async(text: string): Promise<boolean> => {
    return await new Promise((resolve) => {
        const blocker = getId('blocker');
        if (blocker.style.display === 'block') {
            console.warn('Wasn\'t able to show another window (confirm)');
            resolve(false);
            return;
        }

        getId('alertText').textContent = text;
        const cancel = getId('cancelBtn');
        const confirm = getId('confirmBtn');

        blocker.style.display = 'block';
        cancel.style.display = 'block';
        const yes = async() => {
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            resolve(true);
        };
        const no = async() => {
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            resolve(false);
        };
        confirm.addEventListener('click', yes);
        cancel.addEventListener('click', no);
    });
};

export const Prompt = async(text: string): Promise<string | null> => {
    return await new Promise((resolve) => {
        const blocker = getId('blocker');
        if (blocker.style.display === 'block') {
            console.warn('Wasn\'t able to show another window (prompt)');
            resolve(null);
            return;
        }

        getId('alertText').textContent = text;
        const input = getId('inputArea') as HTMLInputElement;
        let inputValue = '';
        const cancel = getId('cancelBtn');
        const confirm = getId('confirmBtn');

        blocker.style.display = 'block';
        cancel.style.display = 'block';
        input.style.display = 'block';
        const getValue = () => {
            inputValue = input.value;
        };
        const yes = async() => {
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            input.style.display = 'none';
            input.value = '';
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            input.removeEventListener('blur', getValue);
            resolve(inputValue);
        };
        const no = async() => {
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            input.style.display = 'none';
            input.value = '';
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            input.removeEventListener('blur', getValue);
            resolve(null);
        };
        confirm.addEventListener('click', yes);
        cancel.addEventListener('click', no);
        input.addEventListener('blur', getValue);
    });
};

/* This is a pain, I had to remove animation for it to play again... Though I still think it's better that adding a class... */
export const hideFooter = () => {
    const footer = getId('footer');
    const hide = getId('footerColor');
    const toggle = getId('hideToggle');
    const text = getId('hideText');
    const arrow = getId('hideArrow');

    global.footer = !global.footer;
    toggle.removeEventListener('click', hideFooter);
    if (global.footer) {
        hide.style.display = '';
        arrow.style.transform = '';
        footer.style.animation = 'hide 1s forwards reverse';
        arrow.style.animation = 'rotate 1s forwards reverse';
        text.textContent = 'Hide';
    } else {
        footer.style.animation = 'hide 1s backwards';
        arrow.style.animation = 'rotate 1s backwards';
        text.textContent = 'Show';
        setTimeout(() => {
            hide.style.display = 'none';
            arrow.style.transform = 'rotate(180deg)';
        }, 1000);
    }
    setTimeout(() => {
        footer.style.animation = '';
        arrow.style.animation = '';
        toggle.addEventListener('click', hideFooter);
    }, 1000);
};

export const mobileDeviceSupport = (change = false) => {
    let turnOn = Boolean(localStorage.getItem('mobile device') ?? false);
    const toggle = getId('mobileDeviceToggle');

    if (change) { turnOn = !turnOn; }

    if (turnOn) {
        toggle.textContent = 'ON';
        toggle.style.borderColor = 'crimson';
        localStorage.setItem('mobile device', 'true');
        global.mobileDevice = true;
        if (change) { Alert('For full support please refresh page. This will add focus event for upgrades, to get description (more can be added if anyone using it)'); }
    } else {
        toggle.textContent = 'OFF';
        toggle.style.borderColor = '';
        localStorage.removeItem('mobile device');
        global.mobileDevice = false;
    }
    if (global.screenReader) { toggle.setAttribute('aria-label', `Mobile device support is ${toggle.textContent}`); }
};

export const screenReaderSupport = (info = false as boolean | number, type = 'toggle', special = 'building') => {
    switch (type) {
        case 'toggle': {
            const change = info as boolean;
            let turnOn = Boolean(localStorage.getItem('screen reader') ?? false);
            const toggle = getId('screenReaderToggle');

            if (change) { turnOn = !turnOn; }
            /* Its a nightmare to try and remove event listener's...
               So as of now refresh of page is the best (and only) way I know how
               Also I'm super confused on how tabindex works... */
            if (turnOn) {
                toggle.textContent = 'ON';
                toggle.style.borderColor = 'crimson';
                toggle.setAttribute('aria-label', 'Screen reader support is ON');
                localStorage.setItem('screen reader', 'true');
                global.screenReader = true;
                if (special === 'reload') {
                    /* This is recommended options, being set after every reload */
                    player.buyToggle.strict = false; //Having it on would be confusing (also there is no indication if can afford more than 1, but less than inputted)
                    global.intervals.main = 100; //To lag less, 100 because speed of auto buying is part of it
                    global.intervals.numbers = 1000; //To lag less, since visual information is not important
                }
                if (change) { Alert('For full support please refresh page. You will get: focus event on upgrades to get description (I need feedback on it), special tab to check progress and more.\n(For non screen readers it auto sets recommended settings on some stuff)'); }
            } else {
                toggle.textContent = 'OFF';
                toggle.style.borderColor = '';
                toggle.setAttribute('aria-label', 'Screen reader support is OFF');
                localStorage.removeItem('screen reader');
                global.screenReader = false;
            }
            break;
        }
        case 'button': {
            const index = info as number;
            const { stage } = player;
            const invText = getId('invisibleBought');

            if (special === 'building') {
                const { buildings } = player;
                const { buildingsInfo } = global;
                let extra = index - 1;
                if (stage.current === 2 && index > 2) { extra = 1; }

                if (index === 0) {
                    invText.textContent = `You have ${format(buildings[0].current)} ${buildingsInfo.name[0]}`;
                } else {
                    invText.textContent = `You have ${format(buildings[index].current)} ${buildingsInfo.name[index]}, next one will cost ${format(buildingsInfo.cost[index])} ${buildingsInfo.name[extra]}, they are producing ${format(buildingsInfo.producing[index])} ${buildingsInfo.name[extra]} per second${player.researchesAuto[1] >= index ? `, auto is ${player.toggles[index + 3] ? 'on' : 'off'}` : ''}`;
                }
            } else {
                if (stage.current === 1) {
                    invText.textContent = `You have ${player.discharge.energyCur} Energy${player.upgrades[3] === 1 ? `, next discharge goal is ${format(global.dischargeInfo.next)} Energy` : ''}`;
                } else if (stage.current === 2) {
                    invText.textContent = `You have ${player.vaporization.clouds} Clouds`;
                }
            }
            break;
        }
    }
};

export const changeFontSize = (change = false) => {
    const body = document.body.style;
    const input = getId('customFontSize') as HTMLInputElement;
    let size = localStorage.getItem('fontSize');

    if (!player.toggles[3]) {
        body.setProperty('--font-size', '1em');
        localStorage.removeItem('fontSize');
    } else {
        if (size === null || Number(size) < 10 || Number(size) > 32 || change) {
            size = String(Math.min(Math.max(Math.trunc(Number(input.value) * 10) / 10, 10), 32));
            localStorage.setItem('fontSize', size);
        }
        body.setProperty('--font-size', `${size}px`);
        input.value = size;
    }
};
