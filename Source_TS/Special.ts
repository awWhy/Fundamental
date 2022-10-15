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
    //getId('upgradeText').classList.remove('whiteText');
    getId('researchText').classList.remove('darkOrchidText', 'orangeText');
    getId('upgradeEffect').classList.remove('blueText', 'greenText');
    getId('researchEffect').classList.remove('blueText', 'greenText');
    getId('upgradeCost').classList.remove('orangeText', 'cyanText', 'greenText');
    getId('researchCost').classList.remove('orangeText', 'cyanText', 'greenText');
    body.removeProperty('--background-color');
    body.removeProperty('--window-color');
    body.removeProperty('--window-border');
    body.removeProperty('--footer-color');
    body.removeProperty('--button-main-color');
    body.removeProperty('--button-main-border');
    body.removeProperty('--button-main-hover');
    body.removeProperty('--button-tab-border');
    body.removeProperty('--button-tab-active');
    body.removeProperty('--button-extra-hover');
    body.removeProperty('--button-delete-color');
    body.removeProperty('--button-delete-hover');
    body.removeProperty('--main-text-color');
    body.removeProperty('--white-text-color');
    //body.removeProperty('--cyan-text-color');
    //body.removeProperty('--blue-text-color');
    body.removeProperty('--orange-text-color');
    body.removeProperty('--gray-text-color');
    //body.removeProperty('--orchid-text-color');
    //body.removeProperty('--darkorchid-text-color');
    //body.removeProperty('--darkviolet-test-color');
    //body.removeProperty('--red-text-color');
    body.removeProperty('--green-text-color');
    /* And set new colors */
    switch (theme.stage) {
        case 1:
            getId('researchText').classList.add('darkOrchidText');
            getId('upgradeEffect').classList.add('blueText');
            getId('researchEffect').classList.add('blueText');
            getId('upgradeCost').classList.add('orangeText');
            getId('researchCost').classList.add('orangeText');
            break;
        case 2:
            getId('researchText').classList.add('darkOrchidText');
            getId('upgradeEffect').classList.add('greenText');
            getId('researchEffect').classList.add('greenText');
            getId('upgradeCost').classList.add('cyanText');
            getId('researchCost').classList.add('cyanText');
            body.setProperty('--background-color', '#070026');
            body.setProperty('--window-color', '#000052');
            body.setProperty('--window-border', 'blue');
            body.setProperty('--footer-color', '#0000db');
            body.setProperty('--button-main-color', 'blue');
            body.setProperty('--button-main-border', '#427be1');
            body.setProperty('--button-main-hover', '#1515cf');
            body.setProperty('--button-tab-border', '#376ac5');
            body.setProperty('--button-tab-active', '#990000');
            body.setProperty('--button-extra-hover', '#2400d7');
            body.setProperty('--main-text-color', 'dodgerblue');
            body.setProperty('--gray-text-color', '#9b9b9b');
            body.setProperty('--green-text-color', '#82cb3b');
            break;
        case 3:
            getId('researchText').classList.add('orangeText');
            getId('upgradeEffect').classList.add('blueText');
            getId('researchEffect').classList.add('blueText');
            getId('upgradeCost').classList.add('greenText');
            getId('researchCost').classList.add('greenText');
            body.setProperty('--background-color', '#000804');
            body.setProperty('--window-color', '#2e1200');
            body.setProperty('--window-border', '#31373e');
            body.setProperty('--footer-color', '#221a00');
            body.setProperty('--button-main-color', '#291344');
            body.setProperty('--button-main-border', '#404040');
            body.setProperty('--button-main-hover', '#361f52');
            body.setProperty('--button-tab-border', '#484848');
            body.setProperty('--button-tab-active', '#8d4c00');
            body.setProperty('--button-extra-hover', '#624c06');
            body.setProperty('--button-delete-color', '#891313');
            body.setProperty('--button-delete-hover', '#a10a0a');
            body.setProperty('--main-text-color', '#8f8f8f');
            body.setProperty('--white-text-color', '#dfdfdf');
            body.setProperty('--orange-text-color', '#f58600');
            body.setProperty('--green-text-color', '#00db00');
            break;
    }
    setTimeout(() => { body.removeProperty('--transition'); }, 1000);
};

/* If any type of Alert is already being shown, then it will auto resolve itself (false for Confirm and null for Prompt)
   Because to throw an Error (or any type of reject()) is a bit of a pain, and feels unnecessary */
export const Alert = (text: string) => { void AlertWait(text); };
const AlertWait = async(text: string): Promise<void> => { //Export if needed
    return await new Promise((resolve) => {
        const blocker = getId('blocker') as HTMLDivElement;
        if (getId('blocker').style.display === 'block') {
            console.warn('Wasn\'t able to show another window (alert)');
            resolve();
            return;
        }

        getId('alertText').textContent = text;
        const confirm = getId('confirmBtn') as HTMLButtonElement;

        blocker.style.display = 'block';
        const close = () => {
            blocker.style.display = 'none';
            confirm.removeEventListener('click', close);
            resolve();
        };
        confirm.addEventListener('click', close);
    });
};

export const Confirm = async(text: string): Promise<boolean> => {
    return await new Promise((resolve) => {
        const blocker = getId('blocker') as HTMLDivElement;
        if (blocker.style.display === 'block') {
            console.warn('Wasn\'t able to show another window (confirm)');
            resolve(false);
            return;
        }

        getId('alertText').textContent = text;
        const cancel = getId('cancelBtn') as HTMLButtonElement;
        const confirm = getId('confirmBtn') as HTMLButtonElement;

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
        const blocker = getId('blocker') as HTMLDivElement;
        if (blocker.style.display === 'block') {
            console.warn('Wasn\'t able to show another window (prompt)');
            resolve(null);
            return;
        }

        getId('alertText').textContent = text;
        const input = getId('inputArea') as HTMLInputElement;
        let inputValue = '';
        const cancel = getId('cancelBtn') as HTMLButtonElement;
        const confirm = getId('confirmBtn') as HTMLButtonElement;

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

/* This is a pain, I had to remove animation for it to play again... Though I still think it's better than adding a class... */
export const hideFooter = () => {
    const footer = getId('footer') as HTMLDivElement;
    const hide = getId('footerColor') as HTMLDivElement;
    const toggle = getId('hideToggle') as HTMLDivElement;
    const text = getId('hideText') as HTMLParagraphElement;
    const arrow = getId('hideArrow') as HTMLDivElement;

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
    const toggle = getId('mobileDeviceToggle') as HTMLButtonElement;

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
            const toggle = getId('screenReaderToggle') as HTMLButtonElement;

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
                    player.toggles.shop.strict = false; //Having it on would be confusing (also there is no indication if can afford more than 1, but less than inputted)
                    player.intervals.main = 100; //To lag less, 100 because speed of auto buying is part of it
                    player.intervals.numbers = 1000; //To lag less, since visual information is not important
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
            const invText = getId('invisibleBought') as HTMLLabelElement;

            if (special === 'building') {
                const { buildings } = player;
                const { buildingsInfo } = global;
                let extra = index - 1;
                if (stage.current === 2 && index > 2) { extra = 1; }

                if (index === 0) {
                    invText.textContent = `You have ${format(buildings[0].current)} ${buildingsInfo.name[0]}`;
                } else {
                    invText.textContent = `You have ${format(buildings[index].current)} ${buildingsInfo.name[index]}, next one will cost ${format(buildingsInfo.cost[index])} ${buildingsInfo.name[extra]}, they are producing ${format(buildingsInfo.producing[index])} ${buildingsInfo.name[extra]} per second${player.researchesAuto[1] >= index ? `, auto is ${player.toggles.buildings[index] ? 'on' : 'off'}` : ''}`;
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

export const changeFontSize = (change = false, inputChange = false) => {
    const body = document.body.style;
    const input = getId('customFontSize') as HTMLInputElement;
    const toggle = getId('fontSizeToggle') as HTMLButtonElement;
    let enable = Boolean(localStorage.getItem('enableCustomFontSize')) ?? false;
    let size = localStorage.getItem('fontSize');

    if (change) { enable = !enable; }

    if (!enable) {
        body.setProperty('--font-size', '1em');
        localStorage.removeItem('fontSize');
        localStorage.removeItem('enableCustomFontSize');
        toggle.textContent = 'OFF';
        toggle.style.borderColor = 'crimson';
    } else {
        if (size === null || Number(size) < 10 || Number(size) > 32 || inputChange) {
            size = String(Math.min(Math.max(Math.trunc(Number(input.value) * 10) / 10, 10), 32));
            localStorage.setItem('fontSize', size);
        }
        body.setProperty('--font-size', `${size}px`);
        input.value = size;
        localStorage.setItem('enableCustomFontSize', 'true');
        toggle.textContent = 'ON';
        toggle.style.borderColor = '';
    }
};

export const playEvent = (event: number) => {
    if (getId('blocker').style.display === 'block') { return; }
    player.events[event] = true;

    //If to add new event here, then don't forget to also add it into player.events
    switch (event) {
        case 0:
            Alert('Since obtaining spended Energy is impossible, you will have to Discharge anytime you will spend it.\nBut for the first time, you can keep your Energy');
            player.discharge.energyCur += 800;
            break;
        case 1:
            Alert('Cloud density is too high... Getting more will be harder now');
            break;
        case 2:
            Alert('Getting more Mass, seems impossible. We need to change our approach, next rank is going to be Softcapped');
            global.accretionInfo.rankCost[4] = 5e29;
            getId('rankReset').textContent = 'Next rank is 5e29 Mass';
            break;
    }
};
