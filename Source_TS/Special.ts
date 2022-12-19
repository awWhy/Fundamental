import { getClass, getId } from './Main';
import { global, player } from './Player';
import { format, stageCheck } from './Update';

export const setTheme = (themeNumber: number, initial = false) => {
    const { theme } = global;

    if (initial) {
        theme.default = true;
        localStorage.removeItem('theme');
    } else {
        theme.default = false;
        theme.stage = themeNumber;
        localStorage.setItem('theme', `${themeNumber}`);
    }
    switchTheme();
};

//While most of it can be set with CSS, I think it's better not, because it might slow down page load
export const switchTheme = () => {
    const { stage } = player;
    const { stageInfo, theme } = global;
    const body = document.body.style;

    if (theme.default) {
        theme.stage = stage.active;
        getId('currentTheme').textContent = 'Default';
    } else {
        getId('currentTheme').textContent = stageInfo.word[theme.stage];
    }

    /* Full reset, for easier out of order theme change */
    body.setProperty('--transition-all', '1s');
    body.setProperty('--transition-buttons', '700ms');
    for (const text of ['upgrade', 'research', 'element']) {
        getId(`${text}Effect`).style.color = '';
        getId(`${text}Cost`).style.color = '';
        if (text === 'upgrade') { continue; } //Not changed anywhere
        getId(`${text}Text`).style.color = '';
    }
    body.removeProperty('--background-color');
    body.removeProperty('--window-color');
    body.removeProperty('--window-border');
    body.removeProperty('--footer-color');
    body.removeProperty('--button-main-color');
    body.removeProperty('--button-main-border');
    body.removeProperty('--button-main-hover');
    body.removeProperty('--building-can-buy');
    body.removeProperty('--button-tab-border');
    body.removeProperty('--button-tab-active');
    body.removeProperty('--button-extra-hover');
    body.removeProperty('--button-delete-color');
    body.removeProperty('--button-delete-hover');
    body.removeProperty('--input-border-color');
    body.removeProperty('--input-text-color');
    body.removeProperty('--button-text-color');
    body.removeProperty('--main-text-color');
    body.removeProperty('--white-text-color');
    //body.removeProperty('--cyan-text-color');
    body.removeProperty('--blue-text-color');
    body.removeProperty('--orange-text-color');
    body.removeProperty('--gray-text-color');
    body.removeProperty('--orchid-text-color');
    body.removeProperty('--darkorchid-text-color');
    body.removeProperty('--darkviolet-text-color');
    body.removeProperty('--red-text-color');
    body.removeProperty('--green-text-color');
    body.removeProperty('--yellow-text-color');
    getId('dropStat').style.color = '';
    getId('waterStat').style.color = '';
    /* And set new colors */
    //--window-color shares color with class "stage2window", so need to be changed in both places
    switch (theme.stage) {
        case 2:
            for (const text of ['upgrade', 'research', 'element']) {
                getId(`${text}Effect`).style.color = 'var(--green-text-color)';
                getId(`${text}Cost`).style.color = 'var(--cyan-text-color)';
            }
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
            body.setProperty('--input-border-color', '#4747ff');
            body.setProperty('--input-text-color', 'dodgerblue');
            body.setProperty('--main-text-color', 'dodgerblue');
            body.setProperty('--gray-text-color', '#9b9b9b');
            body.setProperty('--darkorchid-text-color', '#c71bff');
            body.setProperty('--darkviolet-text-color', '#a973ff');
            body.setProperty('--green-text-color', '#82cb3b');
            body.setProperty('--red-text-color', '#f70000');
            getId('dropStat').style.color = '#3099ff';
            getId('waterStat').style.color = '#3099ff';
            break;
        case 3:
            for (const text of ['upgrade', 'research', 'element']) {
                getId(`${text}Cost`).style.color = 'var(--green-text-color)';
                if (text === 'upgrade') { continue; }
                getId(`${text}Text`).style.color = 'var(--orange-text-color)';
            }
            body.setProperty('--background-color', '#000804');
            body.setProperty('--window-color', '#2e1200');
            body.setProperty('--window-border', '#31373e');
            body.setProperty('--footer-color', '#221a00');
            body.setProperty('--button-main-color', '#291344');
            body.setProperty('--button-main-border', '#404040');
            body.setProperty('--button-main-hover', '#361f52');
            body.setProperty('--button-tab-border', '#484848');
            body.setProperty('--button-tab-active', '#8d4c00');
            body.setProperty('--button-extra-hover', '#5a2100');
            body.setProperty('--button-delete-color', '#891313');
            body.setProperty('--button-delete-hover', '#a10a0a');
            body.setProperty('--input-border-color', '#8b4a00');
            body.setProperty('--input-text-color', '#e77e00');
            body.setProperty('--main-text-color', '#8f8f8f');
            body.setProperty('--white-text-color', '#dfdfdf');
            body.setProperty('--orange-text-color', '#f58600');
            body.setProperty('--green-text-color', '#00db00');
            getId('dropStat').style.color = '#3099ff';
            getId('waterStat').style.color = '#3099ff';
            break;
        case 4:
            for (const text of ['upgrade', 'research', 'element']) {
                getId(`${text}Effect`).style.color = 'var(--green-text-color)';
                getId(`${text}Cost`).style.color = 'var(--cyan-text-color)';
                if (text === 'upgrade') { continue; }
                getId(`${text}Text`).style.color = 'var(--blue-text-color)';
            }
            body.setProperty('--background-color', '#140e04');
            body.setProperty('--window-color', '#4e0000');
            body.setProperty('--window-border', '#894800');
            body.setProperty('--footer-color', '#4e0505');
            body.setProperty('--button-main-color', '#6a3700');
            body.setProperty('--button-main-border', '#9f6700');
            body.setProperty('--button-main-hover', '#914b00');
            body.setProperty('--building-can-buy', '#007f95');
            body.setProperty('--button-tab-border', '#af5d00');
            body.setProperty('--button-tab-active', '#008297');
            body.setProperty('--button-extra-hover', '#605100');
            body.setProperty('--button-delete-color', '#8f0000');
            body.setProperty('--button-delete-hover', '#ad0000');
            body.setProperty('--input-border-color', '#008399');
            body.setProperty('--input-text-color', '#05c3c3');
            body.setProperty('--button-text-color', '#d9d900');
            body.setProperty('--main-text-color', 'darkorange');
            body.setProperty('--white-text-color', '#e5e500');
            body.setProperty('--blue-text-color', '#2694ff');
            body.setProperty('--gray-text-color', '#8b8b8b');
            body.setProperty('--darkorchid-text-color', '#c71bff');
            body.setProperty('--darkviolet-text-color', '#9859ff');
            body.setProperty('--red-text-color', 'red');
            body.setProperty('--green-text-color', '#00e600');
            body.setProperty('--yellow-text-color', 'var(--green-text-color)');
            break;
        case 5:
            for (const text of ['upgrade', 'research', 'element']) {
                getId(`${text}Effect`).style.color = 'var(--green-text-color)';
                getId(`${text}Cost`).style.color = 'var(--red-text-color)';
                if (text === 'upgrade') { continue; }
                getId(`${text}Text`).style.color = 'var(--orange-text-color)';
            }
            body.setProperty('--background-color', '#1f001f');
            body.setProperty('--window-color', '#001d42');
            body.setProperty('--window-border', '#35466e');
            body.setProperty('--footer-color', '#390052');
            body.setProperty('--button-main-color', '#4a008f');
            body.setProperty('--button-main-border', '#8a0049');
            body.setProperty('--button-main-hover', '#6800d6');
            body.setProperty('--building-can-buy', '#8603ff');
            body.setProperty('--button-tab-border', '#9d0054');
            body.setProperty('--button-tab-active', '#8500ff');
            body.setProperty('--button-extra-hover', '#3b0080');
            body.setProperty('--button-delete-color', '#800000');
            body.setProperty('--button-delete-hover', '#9b1212');
            body.setProperty('--input-border-color', '#3656a1');
            body.setProperty('--input-text-color', '#6a88cd');
            body.setProperty('--button-text-color', '#fc9cfc');
            body.setProperty('--main-text-color', '#c000ff');
            body.setProperty('--white-text-color', '#ff79ff');
            body.setProperty('--orchid-text-color', '#ff00f4');
            body.setProperty('--darkorchid-text-color', '#c000ff');
            body.setProperty('--darkviolet-text-color', '#9f52ff');
            body.setProperty('--yellow-text-color', 'var(--darkviolet-text-color)');
    }
    setTimeout(() => {
        body.removeProperty('--transition-all');
        body.removeProperty('--transition-buttons');
    }, 1000);
};

/* If any type of Alert is already being shown, then it will auto resolve itself (false for Confirm and null for Prompt)
   Because to throw an Error (or any type of reject()) is a bit of a pain, and feels unnecessary */
export const Alert = (text: string) => { void AlertWait(text); };
const AlertWait = async(text: string): Promise<void> => { //Export if needed
    return await new Promise((resolve) => {
        const blocker = getId('blocker') as HTMLDivElement;
        if (blocker.style.display === '') {
            console.warn('Wasn\'t able to show another window (alert)');
            resolve();
            return;
        }

        getId('alertText').textContent = text;
        const confirm = getId('confirmBtn') as HTMLButtonElement;
        blocker.style.display = '';
        confirm.focus();

        const key = async(button: KeyboardEvent) => {
            if (button.key === 'Escape' || button.key === 'Enter') {
                close();
            }
        };
        const close = () => {
            blocker.style.display = 'none';
            document.removeEventListener('keydown', key);
            confirm.removeEventListener('click', close);
            resolve();
        };
        document.addEventListener('keydown', key);
        confirm.addEventListener('click', close);
    });
};

export const Confirm = async(text: string): Promise<boolean> => {
    return await new Promise((resolve) => {
        const blocker = getId('blocker') as HTMLDivElement;
        if (blocker.style.display === '') {
            console.warn('Wasn\'t able to show another window (confirm)');
            resolve(false);
            return;
        }

        getId('alertText').textContent = text;
        const cancel = getId('cancelBtn') as HTMLButtonElement;
        const confirm = getId('confirmBtn') as HTMLButtonElement;
        blocker.style.display = '';
        cancel.style.display = '';
        confirm.focus();

        const yes = () => { close(true); };
        const no = () => { close(false); };
        const key = (button: KeyboardEvent) => {
            if (button.key === 'Escape') {
                no();
            } else if (button.key === 'Enter') {
                yes();
            }
        };
        const close = (result: boolean) => {
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            document.removeEventListener('keydown', key);
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            resolve(result);
        };
        document.addEventListener('keydown', key);
        confirm.addEventListener('click', yes);
        cancel.addEventListener('click', no);
    });
};

export const Prompt = async(text: string): Promise<string | null> => {
    return await new Promise((resolve) => {
        const blocker = getId('blocker') as HTMLDivElement;
        if (blocker.style.display === '') {
            console.warn('Wasn\'t able to show another window (prompt)');
            resolve(null);
            return;
        }

        getId('alertText').textContent = text;
        const input = getId('inputArea') as HTMLInputElement;
        const cancel = getId('cancelBtn') as HTMLButtonElement;
        const confirm = getId('confirmBtn') as HTMLButtonElement;
        input.value = '';
        blocker.style.display = '';
        cancel.style.display = '';
        input.style.display = '';
        input.focus();

        const yes = () => { close(input.value); };
        const no = () => { close(null); };
        const key = (button: KeyboardEvent) => {
            if (button.key === 'Escape') {
                no();
            } else if (button.key === 'Enter') {
                yes();
            }
        };
        const close = (result: string | null) => {
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            input.style.display = 'none';
            document.removeEventListener('keydown', key);
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            resolve(result);
        };
        document.addEventListener('keydown', key);
        confirm.addEventListener('click', yes);
        cancel.addEventListener('click', no);
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
        setTimeout(() => { //While forwards would work, I'm lazy to pause animation
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
        toggle.style.color = 'var(--red-text-color)';
        toggle.style.borderColor = 'crimson';
        localStorage.setItem('mobile device', 'true');
        global.mobileDevice = true;
        if (change) { Alert('For full support please refresh the page. This will add on touch start check upgrade and touch end create an upgrade.\n(For non mobile device this will cause issues)'); }
    } else {
        toggle.textContent = 'OFF';
        toggle.style.color = '';
        toggle.style.borderColor = '';
        localStorage.removeItem('mobile device');
        global.mobileDevice = false;
    }
};

export const screenReaderSupport = (info = false as boolean | number, type = 'toggle' as 'toggle' | 'button', special = 'building' as 'reload' | 'building' | 'resource') => {
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
                toggle.style.color = 'var(--red-text-color)';
                toggle.style.borderColor = 'crimson';
                localStorage.setItem('screen reader', 'true');
                global.screenReader = true;
                if (special === 'reload') {
                    /* This is recommended options, being set after every reload */
                    player.toggles.shop.strict = false; //Want to decrease amount of items you can tab into
                }
                stageCheck('soft'); //Update related information instanly
                if (change) { Alert('You will get: focus event on upgrades to get description (Refresh page to get it, also I need feedback on it), special tab to check progress and more.\n(For non screen readers this will cause issues)'); }
            } else {
                toggle.textContent = 'OFF';
                toggle.style.color = '';
                toggle.style.borderColor = '';
                localStorage.removeItem('screen reader');
                global.screenReader = false;
            }
            break;
        }
        case 'button': {
            const index = info as number;
            const invText = getId('invisibleBought') as HTMLLabelElement;

            if (special === 'building') {
                const { buildings } = player;
                const { buildingsInfo } = global;
                const active = player.stage.active;

                let extra = index - 1;
                if (active >= 4) { extra = 0; }

                if (index === 0) {
                    invText.textContent = `You have ${format(buildings[active][0].current)} ${buildingsInfo.name[active][0]}`;
                } else {
                    invText.textContent = `You have ${format(buildings[active][index].current)} ${buildingsInfo.name[active][index]}${buildings[active][index].current !== buildings[active][index].true ? `, out of them ${format(buildings[active][index].true, 0)} are self-made ones` : ''}, they are ${buildingsInfo.type[active][index] === 'producing' ? `producing ${format(buildingsInfo.producing[active][index])} ${buildingsInfo.name[active][extra]} per second` : `improving production of ${buildingsInfo.name[active][extra]} by ${format(buildingsInfo.producing[active][index])}`}${player.ASR[active] >= index ? `, auto is ${player.toggles.buildings[active][index] ? 'on' : 'off'}` : ''}`;
                }
            } else if (special === 'resource') {
                if (index === 1) {
                    invText.textContent = `You have ${format(player.discharge.energyCur)} Energy${player.upgrades[1][3] === 1 ? `, next discharge goal is ${format(global.dischargeInfo.next)} Energy, you reached goal ${format(player.discharge.current, 0)} times` : ''}${player.strangeness[1][2] >= 1 ? `, you also have +${format(player.strangeness[1][2], 0)} free goals.` : ''}`;
                } else if (index === 2) {
                    invText.textContent = `You have ${format(player.vaporization.clouds)} Clouds${global.vaporizationInfo.get > 1 ? `, you can get +${format(global.vaporizationInfo.get)} if you reset now` : ''}`;
                } else if (index === 4) {
                    invText.textContent = `You have ${format(player.collapse.mass)} Mass${global.collapseInfo.newMass >= player.collapse.mass ? `, you can get +${format(global.collapseInfo.newMass - player.collapse.mass)} if you reset now` : ''}${player.researchesExtra[4][0] >= 1 ? `, also ${format(global.collapseInfo.starCheck[0], 0)} Red giants` : ''}${player.researchesExtra[4][0] >= 2 ? `,  ${format(global.collapseInfo.starCheck[1], 0)} Neutron stars` : ''}${player.researchesExtra[4][0] >= 3 ? ` and also ${format(global.collapseInfo.starCheck[2], 0)} Black holes` : ''}`;
                } else if (index === 0) {
                    invText.textContent = `You have ${format(player.strange[0].true, 0)} Strange quarks${global.strangeInfo.stageBoost[player.stage.active] !== null ? ` they are boosting production of current stage by ${format(global.strangeInfo.stageBoost[player.stage.active] as number)}` : ''}, you will gain ${format(global.strangeInfo.stageGain + (player.stage.active >= 4 ? global.strangeInfo.extraGain : 0, 0))} on Stage reset`;
                }
            }
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
        body.removeProperty('--font-size');
        localStorage.removeItem('fontSize');
        localStorage.removeItem('enableCustomFontSize');
        toggle.textContent = 'OFF';
        toggle.style.color = 'var(--red-text-color)';
        toggle.style.borderColor = 'crimson';
    } else {
        if (size === null || Number(size) < 10 || Number(size) > 32 || inputChange) {
            size = `${Math.min(Math.max(Math.trunc(Number(input.value) * 10) / 10, 10), 32)}`;
            localStorage.setItem('fontSize', size);
        }
        body.setProperty('--font-size', `${size}px`);
        input.value = size;
        localStorage.setItem('enableCustomFontSize', 'true');
        toggle.textContent = 'ON';
        toggle.style.color = '';
        toggle.style.borderColor = '';
    }
};

export const changeFormat = (point: boolean) => {
    const htmlInput = point ?
        getId('decimalPoint') as HTMLInputElement :
        getId('thousandSeparator') as HTMLInputElement;
    const allowed = ['.', ',', ' ', '_', '^', '"', "'", '`', '|'].includes(htmlInput.value);
    if (!allowed || (point && (player.separator[0] === htmlInput.value || htmlInput.value.length === 0)) || (!point && player.separator[1] === htmlInput.value)) {
        htmlInput.value = point ? '.' : '';
        return;
    }
    if (point) {
        player.separator[1] = htmlInput.value;
    } else {
        player.separator[0] = htmlInput.value;
    }
};

export const removeTextMovement = (change = false) => {
    const add = getClass('statFoot');

    if (change) {
        if (localStorage.getItem('textMove') === null) {
            localStorage.setItem('textMove', 'false');
        } else {
            localStorage.removeItem('textMove');
        }
    }

    for (const i of add) {
        i.classList.contains('noMove') ?
            i.classList.remove('noMove') :
            i.classList.add('noMove');
    }
};

//It's here, because mostly not important for gameplay
export const playEvent = (event: number, index: number) => {
    if (getId('blocker').style.display === '') { return; } //Return if Alert is being shown, event should be called later again (if not then will need to setTimeout())
    player.events[index] = true;

    switch (event) {
        case 0: //[0] Discharge explanation
            Alert('Since you can\'t get back Energy that you had spent, you will need to Discharge anytime you spend it.\nBut for the first time, you can keep your Energy');
            if (player.stage.true === 1) { player.discharge.energyCur += 800; }
            break;
        case 1: //[0] Clouds softcap
            Alert('Cloud density is too high... Getting more will be harder now');
            break;
        case 2: //[0] Accretion new rank unlocked
            Alert('Getting more Mass, seems impossible. We need to change our approach, next Rank is going to be Softcapped');
            if (player.accretion.rank === 4) {
                global.accretionInfo.rankCost[4] = 5e29;
                getId('rankReset').textContent = 'Next rank is 5e29 Mass';
            }
            break;
        case 3: //[0] Collapse explanation
            Alert('Any Collapse reset from now on will give extra rewards, but you can only Collapse when can get more or equal Mass.\nEach reward effect will be hidden to you for now');
            break;
        case 4: //[1] Entering intergalactic
            Alert('There doesn\'t seem to be anything here. Let\'s try going back to start and find what is missing');
    }
};
