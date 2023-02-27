import Limit from './Limit';
import { getId } from './Main';
import { global, player } from './Player';
import { assignCollapseInformation, assignDischargeInformation, assignVaporizationInformation } from './Stage';
import { format, numbersUpdate, stageCheck, visualUpdate } from './Update';

//Eventually might move more HTML into here
export const specialHTML = {
    resetHTML: [ /* All new ID's need to be checked for being null */
        '',
        '<span class="bigWord orangeText">Discharge</span>. Reset current Structures and Energy. Will also boost production by <span id="dischargeEffect" class="orangeText"></span>, if to reset with enough Energy.',
        '<span class="bigWord grayText">Vaporization</span>. Structures, upgrades, will be reset. But in return gain <span class="grayText">Clouds</span>. It takes a lot to form more than one.',
        '<img id="rankImage" src="Used_art/Missing.png" alt="Missing">Current <span class="bigWord darkorchidText">Rank</span> is: <span id="rankName" class="blueText"></span>. <span id="rankMessage"></span>',
        '<span class="bigWord orchidText">Collapse</span> - Everything will be lost, but at same time gained. Each of the Stars will produce something unique and special.',
        ''
    ],
    longestBuilding: 7, //Max +1; If max will increase then new HTML need to be added into index.html
    buildingHTML: [ //outerHTML is slow
        [],
        [
            ['Preon.png', 'Preon'], //[0] === image; [1] === alt
            ['Quarks.png', 'Quarks'],
            ['Particle.png', 'Particle'],
            ['Atom.png', 'Atom'],
            ['Molecule.png', 'Molecule']
        ],
        [
            ['Drop.png', 'Drop of water'],
            ['Puddle.png', 'Puddle'],
            ['Pond.png', 'Pond'],
            ['Lake.png', 'Lake'],
            ['Sea.png', 'Sea'],
            ['Ocean.png', 'Ocean']
        ],
        [
            ['Cosmic%20dust.png', 'Cosmic dust'],
            ['Planetesimal.png', 'Planetesimal'],
            ['Protoplanet.png', 'Protoplanet'],
            ['Natural%20satellite.png', 'Moon'],
            ['Subsatellite.png', 'Submoon']
        ],
        [
            ['Brown%20dwarf.png', 'Brown dwarf'],
            ['Orange%20dwarf.png', 'Orange dwarf'],
            ['Red%20supergiant.png', 'Red supergiant'],
            ['Blue%20hypergiant.png', 'Blue hypergiant'],
            ['Quasi%20star.png', 'Quasi star']
        ],
        [
            ['Nebula.png', 'Nebula'],
            ['Star%20cluster.png', 'Star cluster'],
            ['Galaxy.png', 'Galaxy'],
            ['Galaxy%20filament.png', 'Galaxy filaments']
        ]
    ],
    longestUpgrade: 13, //If max will increase then new HTML need to be added into index.html
    upgradeHTML: [
        [],
        [
            ['UpgradeQ1.png', 'Weak force'],
            ['UpgradeQ2.png', 'Strong force'],
            ['UpgradeQ3.png', 'Electron'],
            ['UpgradeQ4.png', 'Proton'],
            ['UpgradeQ5.png', 'Neutron'],
            ['UpgradeQ6.png', 'Superposition'],
            ['UpgradeQ7.png', 'Protium'],
            ['UpgradeQ8.png', 'Deuterium'],
            ['UpgradeQ9.png', 'Tritium'],
            ['UpgradeQ10.png', 'Fusion']
        ],
        [
            ['UpgradeW1.png', 'Mole'],
            ['UpgradeW2.png', 'Vaporization'],
            ['UpgradeW3.png', 'Tension'],
            ['UpgradeW4.png', 'Stress'],
            ['UpgradeW5.png', 'Stream'],
            ['UpgradeW6.png', 'River'],
            ['UpgradeW7.png', 'Tsunami']
        ],
        [
            ['UpgradeA1.png', 'Motion'],
            ['UpgradeA2.png', 'Gas'],
            ['UpgradeA3.png', 'Micrometeoroid'],
            ['UpgradeA4.png', 'Instability'],
            ['UpgradeA5.png', 'Gravity'],
            ['UpgradeA6.png', 'Pile'],
            ['UpgradeA7.png', 'Orbit'],
            ['UpgradeA8.png', 'Magma'],
            ['UpgradeA9.png', 'Equilibrium'],
            ['UpgradeA10.png', 'Atmosphere'],
            ['UpgradeA11.png', 'Pebble'],
            ['UpgradeA12.png', 'Tidal force'],
            ['UpgradeA13.png', 'Ring']
        ],
        [
            ['UpgradeS1.png', 'Collapse'],
            ['UpgradeS2.png', 'Reaction'],
            ['UpgradeS3.png', 'CNO'],
            ['UpgradeS4.png', 'Helium fusion']
        ],
        [
            ['UpgradeG1.png', 'Instability'],
            ['UpgradeG2.png', 'Super cluster'],
            ['UpgradeG3.png', 'Quasar']
        ]
    ],
    longestResearch: 8, //If max will increase then new HTML need to be added into index.html
    researchHTML: [
        [],
        [
            ['ResearchQ1.png', 'Protium+', 'stage1borderImage'], //[2] === className
            ['ResearchQ2.png', 'Deuterium+', 'stage1borderImage'],
            ['ResearchQ3.png', 'Tritium+', 'stage1borderImage'],
            ['ResearchQ4.png', 'Discharge-', 'stage4borderImage'],
            ['ResearchQ5.png', 'Discharge+', 'stage4borderImage'],
            ['ResearchQ6.png', 'Discharge++', 'stage4borderImage']
        ],
        [
            ['ResearchW1.png', 'Moles+', 'stage2borderImage'],
            ['ResearchW2.png', 'Moles++', 'stage2borderImage'],
            ['ResearchW3.png', 'Tension+', 'stage2borderImage'],
            ['ResearchW4.png', 'Stress+', 'stage2borderImage'],
            ['ResearchW5.png', 'Streams+', 'stage2borderImage'],
            ['ResearchW6.png', 'Channel', 'stage2borderImage']
        ],
        [
            ['ResearchA1.png', 'Mass+', 'stage3borderImage'],
            ['ResearchA2.png', 'Adhesion', 'stage2borderImage'],
            ['ResearchA3.png', 'Weathering', 'stage3borderImage'],
            ['ResearchA4.png', 'Collision', 'stage3borderImage'],
            ['ResearchA5.png', 'Binary', 'stage3borderImage'],
            ['ResearchA6.png', 'Gravity+', 'stage1borderImage'],
            ['ResearchA7.png', 'Layers', 'stage7borderImage'],
            ['ResearchA8.png', 'Drag', 'stage1borderImage']
        ],
        [
            ['ResearchS1.png', 'Orbit', 'stage5borderImage'],
            ['ResearchS2.png', '2 stars', 'stage5borderImage'],
            ['ResearchS3.png', 'Protodisc', 'stage7borderImage'],
            ['ResearchS4.png', 'Planetary nebula', 'stage5borderImage']
        ],
        [
            ['ResearchG1.png', 'Density', 'stage1borderImage'],
            ['ResearchG2.png', 'Frequency', 'stage6borderImage']
        ]
    ],
    longestResearchExtra: 5, //If max will increase then new HTML need to be added into index.html
    researchExtraDivHTML: [
        [],
        ['Energy%20Researches.png', 'Energy researches', 'stage4borderImage'],
        ['Cloud%20Researches.png', 'Cloud researches', 'stage2borderImage'],
        ['Rank%20Researches.png', 'Rank researches', 'stage6borderImage'],
        ['Star%20Researches.png', 'Star researches', 'stage6borderImage'],
        []
    ],
    researchExtraHTML: [
        [],
        [
            ['ResearchEnergy1.png', 'Strong force+', 'stage1borderImage'],
            ['ResearchEnergy2.png', 'Radiation+', 'stage5borderImage'],
            ['ResearchEnergy3.png', 'Accretion', 'stage3borderImage'],
            ['ResearchEnergy4.png', 'Preon Mass', 'stage1borderImage'],
            ['ResearchEnergy5.png', 'Impulse', 'stage6borderImage']
        ],
        [
            ['ResearchClouds1.png', 'Vaporization+', 'stage3borderImage'],
            ['ResearchClouds2.png', 'Rain', 'stage2borderImage'],
            ['ResearchClouds3.png', 'Storm', 'stage4borderImage'],
            ['Ocean%20world.png', 'Ocean world', 'stage2borderImage']
        ],
        [
            ['ResearchRank1.png', 'Ocean', 'stage3borderImage'],
            ['ResearchRank2.png', 'Rank', 'stage3borderImage'],
            ['ResearchRank3.png', 'Weight', 'stage3borderImage'],
            ['ResearchRank4.png', 'Viscosity', 'stage2borderImage'],
            ['ResearchRank5.png', 'Water rank', 'stage2borderImage']
        ],
        [
            ['ResearchStar1.png', 'Supernova', 'stage6borderImage'],
            ['ResearchStar2.png', 'White dwarf', 'stage1borderImage']
        ],
        []
    ],
    longestFooterStats: 3, //If max will increase then new HTML need to be added into index.html
    footerStatsHTML: [
        [],
        [
            ['Energy%20mass.png', 'Energy mass', 'stage1borderImage cyanText', 'Mass'], //[3] === textcontent
            ['Energy.png', 'Energy', 'stage4borderImage orangeText', 'Energy']
        ],
        [
            ['Clouds.png', 'Clouds', 'stage3borderImage grayText', 'Clouds'],
            ['Water.png', 'H2O', 'stage2borderImage blueText', 'Moles'],
            ['Drop.png', 'Drop of water', 'stage2borderImage blueText', 'Drops']
        ],
        [
            ['Mass.png', 'Mass', 'stage3borderImage grayText', 'Mass']
        ],
        [
            ['Main_sequence%20mass.png', 'Solar mass', 'stage1borderImage cyanText', 'Mass'],
            ['Elements.png', 'Elements', 'stage4borderImage orangeText', 'Elements']
        ],
        [
            ['Main_sequence%20mass.png', 'Solar mass', 'stage1borderImage cyanText', 'Mass'],
            ['Elements.png', 'Elements', 'stage4borderImage orangeText', 'Elements'],
            ['Stars.png', 'Stars', 'stage7borderImage redText', 'Stars']
        ]
    ]
};

export const setTheme = (themeNumber: number, initial = false) => {
    if (!initial) {
        let allowed = player.stage.true >= themeNumber;
        if (themeNumber === 6) { allowed = false; }
        if (!allowed) { initial = true; }
    }

    if (initial) {
        global.theme.default = true;
        localStorage.removeItem('theme');
    } else {
        global.theme.default = false;
        global.theme.stage = themeNumber;
        localStorage.setItem('theme', `${themeNumber}`);
    }
    switchTheme();
};

//Not done through CSS, because worse (?)
export const switchTheme = () => {
    const { theme } = global;
    const body = document.body.style;
    const dropStat = document.querySelector('#footerStat2 > p') as HTMLParagraphElement;
    const waterStat = document.querySelector('#footerStat3 > p') as HTMLParagraphElement;

    if (theme.default) {
        theme.stage = player.stage.active;
        getId('currentTheme').textContent = 'Default';
    } else {
        getId('currentTheme').textContent = global.stageInfo.word[theme.stage];
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
    dropStat.style.color = '';
    waterStat.style.color = '';
    /* These colors will need to be changed in other places as well: (not just 2, but from 2 to max)
        --window-color > '.stage2windowBackground';
        --button-main-color > '.stage2backgroundButton' and 'global.stageInfo.buttonBackgroundColor[2]';
        --button-main-border > '.stage2borderButton' and 'global.stageInfo.buttonBorderColor[2]'; */
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
            if (player.stage.active === 2) {
                dropStat.style.color = '#3099ff';
                waterStat.style.color = '#3099ff';
            }
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
            if (player.stage.active === 2) {
                dropStat.style.color = '#3099ff';
                waterStat.style.color = '#3099ff';
            }
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
            body.setProperty('--background-color', '#060010');
            body.setProperty('--window-color', '#001d42');
            body.setProperty('--window-border', '#35466e');
            body.setProperty('--footer-color', '#320061');
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
            break;
        case 6:
            //Violet text
            //White white text
            //Black BG
    }
    setTimeout(() => {
        body.removeProperty('--transition-all');
        body.removeProperty('--transition-buttons');
    }, 1000);
};

export const Alert = (text: string) => { void AlertWait(text); };
export const AlertWait = async(text: string): Promise<void> => {
    return await new Promise((resolve) => {
        const blocker = getId('blocker') as HTMLDivElement;
        if (blocker.style.display !== 'none') {
            console.warn("Wasn't able to show another window (alert)");
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
        if (blocker.style.display !== 'none') {
            console.warn("Wasn't able to show another window (confirm)");
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
        if (blocker.style.display !== 'none') {
            console.warn("Wasn't able to show another window (prompt)");
            resolve(null);
            return;
        }

        getId('alertText').textContent = text;
        const input = getId('inputArea') as HTMLInputElement;
        const cancel = getId('cancelBtn') as HTMLButtonElement;
        const confirm = getId('confirmBtn') as HTMLButtonElement;
        blocker.style.display = '';
        cancel.style.display = '';
        input.style.display = '';
        input.value = '';
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

        numbersUpdate();
        visualUpdate();
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
        footer.style.animation = ''; //Better than using a class
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

export const screenReaderSupport = (info = false as boolean | number, type = 'toggle' as 'toggle' | 'button', special = 'building' as 'reload' | 'building' | 'resource' | 'information') => {
    switch (type) {
        case 'toggle': {
            const change = info as boolean;
            let turnOn = Boolean(localStorage.getItem('screen reader') ?? false);
            const toggle = getId('screenReaderToggle') as HTMLButtonElement;

            if (change) { turnOn = !turnOn; }

            if (turnOn) {
                if (special === 'reload') { player.toggles.shop.strict = false; } //Too lazy to add dynamic aria-label for current status

                toggle.textContent = 'ON';
                toggle.style.color = 'var(--red-text-color)';
                toggle.style.borderColor = 'crimson';
                localStorage.setItem('screen reader', 'true');
                global.screenReader = true;
                stageCheck();
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
                const { buildingsInfo } = global;
                const active = player.stage.active;
                const buildings = player.buildings[active];

                let extra = index - 1;
                if (active === 4 || active === 5) { extra = 0; }

                if (index === 0) {
                    invText.textContent = `You have ${Limit(buildings[0].current).format()} ${buildingsInfo.name[active][0]}`;
                } else {
                    invText.textContent = `You have ${Limit(buildings[index].current).format()} ${buildingsInfo.name[active][index]}${Limit(buildings[index].current).notEqual(buildings[index as 1].true) ? `, out of them ${format(buildings[index as 1].true)} are self-made ones` : ''}, they are ${buildingsInfo.type[active][index] === 'producing' ? `producing ${Limit(buildingsInfo.producing[active][index]).format()} ${buildingsInfo.name[active][extra]} per second` : `improving production of ${buildingsInfo.name[active][extra]} by ${Limit(buildingsInfo.producing[active][index]).format()}`}${player.ASR[active] >= index ? `, auto is ${player.toggles.buildings[active][index] ? 'on' : 'off'}` : ''}`;
                }
            } else if (special === 'resource') {
                if (index === 0) {
                    invText.textContent = `You have ${format(player.strange[0].current)} Strange quarks${global.strangeInfo.stageBoost[player.stage.active] !== null ? ` they are boosting production of current stage by ${format(global.strangeInfo.stageBoost[player.stage.active] as number)}` : ''}, you will gain ${format(global.strangeInfo.gain(player.stage.active))} on Stage reset`;
                } else if (index === 1) {
                    if (player.stage.active === 1) {
                        assignDischargeInformation();
                        invText.textContent = `You have ${format(player.discharge.energy)} Energy${player.upgrades[1][5] === 1 ? `, next discharge goal is ${format(global.dischargeInfo.next)} Energy, you reached goal ${format(player.discharge.current)} times` : ''}${player.strangeness[1][2] >= 1 ? `, you also have +${format(player.strangeness[1][2])} free goals.` : ''}`;
                    } else if (player.stage.active === 2) {
                        assignVaporizationInformation();
                        invText.textContent = `You have ${Limit(player.vaporization.clouds).format()} Clouds${Limit(global.vaporizationInfo.get).moreThan([1, 0]) ? `, you can get +${Limit(global.vaporizationInfo.get).format()} if you reset now` : ''}`;
                    } else if (player.stage.active === 4) {
                        assignCollapseInformation();
                        invText.textContent = `You have ${format(player.collapse.mass)} Mass${global.collapseInfo.newMass >= player.collapse.mass ? `, you can get +${format(global.collapseInfo.newMass - player.collapse.mass)} if you reset now` : ''}${player.researchesExtra[4][0] >= 1 ? `, also ${format(global.collapseInfo.starCheck[0])} Red giants` : ''}${player.researchesExtra[4][0] >= 2 ? `,  ${format(global.collapseInfo.starCheck[1])} Neutron stars` : ''}${player.researchesExtra[4][0] >= 3 ? ` and also ${format(global.collapseInfo.starCheck[2])} Black holes` : ''}`;
                    }
                }
            } else if (special === 'information') {
                let activeStages = '';

                for (let i = 0; i < global.stageInfo.activeAll.length; i++) {
                    activeStages += (i === 0 ? '' : ', ') + global.stageInfo.word[global.stageInfo.activeAll[i]];
                }

                invText.textContent = `Current Active Stages are ${activeStages}`;
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
    if (!allowed || (point ? player.separator[0] === htmlInput.value || htmlInput.value.length === 0 : player.separator[1] === htmlInput.value)) {
        htmlInput.value = point ? '.' : '';
        return;
    }
    point ?
        player.separator[1] = htmlInput.value :
        player.separator[0] = htmlInput.value;
};

//If done for span, then add display: inline-block;
export const assignWithNoMove = (html: HTMLElement, text: string) => {
    html.textContent = text;
    html.style.width = `${text.length * 0.6}em`;
};

export const playEvent = (event: number, index: number) => {
    if (getId('blocker').style.display !== 'none') { return; }
    player.events[index] = true;

    switch (event) {
        case 0: //[0] Discharge explanation
            Alert("Energy that had been spent, can't be obtained again. But doing Discharge will reset spent Energy");
            break;
        case 1: //[0] Clouds softcap
            Alert('Cloud density is too high... Getting more will be harder now');
            break;
        case 2: //[0] Accretion new Rank unlocked
            Alert('Getting more Mass, seems impossible. We need to change our approach, next Rank is going to be Softcapped');
            if (player.accretion.rank <= 4) {
                global.accretionInfo.rankCost[4] = 5e29;
                const button = getId('reset1Button');
                if (button.textContent === 'Max Rank achieved') { button.textContent = 'Next Rank is 5e29 Mass'; }
            }
            break;
        case 3: //[0] Collapse explanation
            Alert('Any Collapse reset from now on will give even more rewards. Collapse is only possible when can increase any of rewards.\nRewards effects are unknown, but with more Elements will be revealed');
            break;
        case 4: //[1] Entering Intergalactic
            Alert("There doesn't seem to be anything here. Let's try going back to start and find what is missing");
            break;
        case 5: //[2] Creating Galaxy
            Alert('Galaxy will boost production of Nebulas and Star clusters, but for the cost of every other structure/upgrade.\nElements are disabled until can afford them again');
    }
};
