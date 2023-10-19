import { getId, getQuery } from './Main';
import { global, player } from './Player';
import { calculateMaxLevel } from './Stage';
import { numbersUpdate, visualUpdate } from './Update';

export const specialHTML = { //First values for images from here must be from true vacuum
    resetHTML: [
        '',
        '<span class="bigWord orangeText">Discharge</span>. Reset current Structures and Energy. Will also boost production by <span id="dischargeBase" class="orangeText"></span>, if to reset with enough Energy.',
        '<span class="bigWord grayText">Vaporization</span>. Structures, Upgrades, will be reset. But in return gain <span class="grayText">Clouds</span>. It takes a lot to form more than one.',
        '<img src="Used_art/Missing.png" alt="" loading="lazy" draggable="false" id="rankImage">Current <span class="bigWord darkorchidText">Rank</span> is: <span id="rankName"></span>. <span id="rankMessage"></span>',
        '<span class="bigWord orchidText">Collapse</span> - everything will be lost, but at same time gained. Even remnants have their own unique strength and effects.',
        ''
    ],
    longestBuilding: 7, //+1
    buildingHTML: [ //outerHTML is slow
        [],
        ['Preon.png', 'Quarks.png', 'Particle.png', 'Atom.png', 'Molecule.png'], //[0] === src
        ['Drop.png', 'Puddle.png', 'Pond.png', 'Lake.png', 'Sea.png', 'Ocean.png'],
        ['Cosmic%20dust.png', 'Planetesimal.png', 'Protoplanet.png', 'Natural%20satellite.png', 'Subsatellite.png'],
        ['Brown%20dwarf.png', 'Orange%20dwarf.png', 'Red%20supergiant.png', 'Blue%20hypergiant.png', 'Quasi%20star.png'],
        ['Nebula.png', 'Star%20cluster.png', 'Galaxy.png']
    ],
    longestUpgrade: 13,
    upgradeHTML: [
        [],
        [
            ['UpgradeQ1.png', 'Weak force'], //[1] === alt
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
            ['UpgradeW1.png', 'H2O'],
            ['UpgradeW2.png', 'Spread'],
            ['UpgradeW3.png', 'Vaporization'],
            ['UpgradeW4.png', 'Tension'],
            ['UpgradeW5.png', 'Stress'],
            ['UpgradeW6.png', 'Stream'],
            ['UpgradeW7.png', 'River'],
            ['UpgradeW8.png', 'Tsunami'],
            ['UpgradeW9.png', 'Tide']
        ],
        [
            ['UpgradeA1.png', 'Motion'],
            ['UpgradeA2.png', 'Gas'],
            ['UpgradeA3.png', 'Micrometeoroid'],
            ['UpgradeA4.png', 'Instability'],
            ['UpgradeA5.png', 'Gravity'],
            ['UpgradeA6.png', 'Pile'],
            ['UpgradeA7.png', 'Magma'],
            ['UpgradeA8.png', 'Equilibrium'],
            ['UpgradeA9.png', 'Orbit'],
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
    longestResearch: 9,
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
            ['ResearchW1.png', 'H2O+', 'stage2borderImage'],
            ['ResearchW2.png', 'H2O++', 'stage2borderImage'],
            ['ResearchW3.png', 'Tension+', 'stage2borderImage'],
            ['ResearchW4.png', 'Stress+', 'stage2borderImage'],
            ['ResearchW5.png', 'Streams+', 'stage2borderImage'],
            ['ResearchW6.png', 'Channel', 'stage2borderImage']
        ],
        [
            ['ResearchA1.png', 'Mass+', 'stage3borderImage'],
            ['ResearchA2.png', 'Adhesion', 'stage2borderImage'],
            ['ResearchA3.png', 'Weathering', 'stage3borderImage'],
            ['ResearchA4.png', 'Shattering', 'stage3borderImage'],
            ['ResearchA5.png', 'Collision', 'stage3borderImage'],
            ['ResearchA6.png', 'Binary', 'stage3borderImage'],
            ['ResearchA7.png', 'Gravity+', 'stage1borderImage'],
            ['ResearchA8.png', 'Layers', 'stage7borderImage'],
            ['ResearchA9.png', 'Drag', 'stage1borderImage']
        ],
        [
            ['ResearchS1.png', 'Orbit', 'stage5borderImage'],
            ['ResearchS2.png', '2 stars', 'stage5borderImage'],
            ['ResearchS3.png', 'Protodisc', 'stage7borderImage'],
            ['ResearchS4.png', 'Planetary nebula', 'stage5borderImage'],
            ['ResearchS5.png', 'Gamma-rays', 'stage6borderImage']
        ],
        [
            ['ResearchG1.png', 'Density', 'stage1borderImage'],
            ['ResearchG2.png', 'Frequency', 'stage6borderImage']
        ]
    ],
    longestResearchExtra: 5,
    researchExtraDivHTML: [
        [],
        ['Energy%20Researches.png', 'stage4borderImage'],
        ['Cloud%20Researches.png', 'stage2borderImage'],
        ['Rank%20Researches.png', 'stage6borderImage'],
        ['Collapse%20Researches.png', 'stage6borderImage'],
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
            ['ResearchClouds4.png', 'Water Accretion', 'stage2borderImage']
        ],
        [
            ['ResearchRank1.png', 'Ocean', 'stage3borderImage'],
            ['ResearchRank2.png', 'Rank', 'stage3borderImage'],
            ['ResearchRank3.png', 'Weight', 'stage3borderImage'],
            ['ResearchRank4.png', 'Viscosity', 'stage2borderImage'],
            ['ResearchRank5.png', 'Water Rank', 'stage2borderImage']
        ],
        [
            ['ResearchCollapse1.png', 'Supernova', 'stage6borderImage'],
            ['ResearchCollapse2.png', 'Mass transfer', 'stage7borderImage'],
            ['ResearchCollapse3.png', 'White dwarf', 'stage1borderImage']
        ],
        []
    ],
    longestFooterStats: 3,
    footerStatsHTML: [
        [],
        [
            ['Energy%20mass.png', 'stage1borderImage cyanText', 'Mass'], //[2] === textcontent
            ['Energy.png', 'stage4borderImage orangeText', 'Energy']
        ],
        [
            ['Clouds.png', 'stage3borderImage grayText', 'Clouds'],
            ['Water.png', 'stage2borderImage blueText', 'Moles'],
            ['Drop.png', 'stage2borderImage blueText', 'Drops']
        ],
        [
            ['Mass.png', 'stage3borderImage grayText', 'Mass']
        ],
        [
            ['Main_sequence%20mass.png', 'stage1borderImage cyanText', 'Mass'],
            ['Elements.png', 'stage4borderImage orangeText', 'Elements']
        ],
        [
            ['Main_sequence%20mass.png', 'stage1borderImage cyanText', 'Mass'],
            ['Elements.png', 'stage4borderImage orangeText', 'Elements'],
            ['Stars.png', 'stage7borderImage redText', 'Stars']
        ]
    ],
    cache: {
        imagesDiv: document.createElement('div'),
        idMap: new Map<string, HTMLElement>(),
        classMap: new Map<string, HTMLCollectionOf<HTMLElement>>(),
        queryMap: new Map<string, HTMLElement>()
    }
};

export const preventImageUnload = () => {
    const { footerStatsHTML: footer, buildingHTML: build, upgradeHTML: upgrade, researchHTML: research, researchExtraHTML: extra, researchExtraDivHTML: extraDiv } = specialHTML;
    //Duplicates are ignored, unless they are from Strangeness, because duplicates from there could become unique in future

    let images = '';
    for (let s = 1; s <= 5; s++) {
        for (let i = 0; i < footer[s].length; i++) {
            if (s === 2) {
                if (i === 2) { continue; } //Drops
            } else if (s === 5 && i < 2) { continue; } //Solar mass and Elements
            images += `<img src="Used_art/${footer[s][i][0]}" loading="lazy">`;
        }
        for (let i = 0; i < build[s].length; i++) {
            images += `<img src="Used_art/${build[s][i]}" loading="lazy">`;
        }
        for (let i = 0; i < upgrade[s].length; i++) {
            images += `<img src="Used_art/${upgrade[s][i][0]}" loading="lazy">`;
        }
        for (let i = 0; i < research[s].length; i++) {
            images += `<img src="Used_art/${research[s][i][0]}" loading="lazy">`;
        }
        for (let i = 0; i < extra[s].length; i++) {
            images += `<img src="Used_art/${extra[s][i][0]}" loading="lazy">`;
        }
        if (extraDiv[s].length > 0) { images += `<img src="Used_art/${extraDiv[s][0]}" loading="lazy">`; }
        images += `<img src="Used_art/Stage${s}%20border.png" loading="lazy">`;
    }
    specialHTML.cache.imagesDiv.innerHTML = images; //Saved just in case
};

export const setTheme = (theme: number | null) => {
    if (theme !== null) {
        if (player.stage.true < theme) { theme = null; }
        if (theme === 6 && player.stage.true < 7 && player.strangeness[5][0] < 1) { theme = null; }
    }

    global.theme = theme;
    theme === null ? localStorage.removeItem('theme') : localStorage.setItem('theme', `${theme}`);
    switchTheme();
};

export const switchTheme = () => {
    const body = document.body.style;
    const theme = global.theme ?? player.stage.active;
    getId('currentTheme').textContent = global.theme === null ? 'Default' : global.stageInfo.word[theme];

    let dropStatColor = '';
    let waterStatColor = '';
    body.setProperty('--transition-all', '1s');
    body.setProperty('--transition-buttons', '700ms');

    /* Full reset, because better response from CSS (also easier) */
    body.removeProperty('--background-color');
    body.removeProperty('--window-color');
    body.removeProperty('--window-border');
    body.removeProperty('--footer-color');
    body.removeProperty('--button-color');
    body.removeProperty('--button-border');
    body.removeProperty('--button-hover');
    body.removeProperty('--building-afford');
    body.removeProperty('--tab-active');
    body.removeProperty('--tab-elements');
    body.removeProperty('--tab-strangeness');
    body.removeProperty('--hollow-hover');
    body.removeProperty('--footerButton-hover');
    body.removeProperty('--input-border');
    body.removeProperty('--input-text');
    body.removeProperty('--button-text');
    body.removeProperty('--main-text');
    body.removeProperty('--white-text');
    //body.removeProperty('--cyan-text');
    body.removeProperty('--blue-text');
    body.removeProperty('--orange-text');
    body.removeProperty('--gray-text');
    body.removeProperty('--orchid-text');
    body.removeProperty('--darkorchid-text');
    body.removeProperty('--darkviolet-text');
    body.removeProperty('--red-text');
    body.removeProperty('--green-text');
    body.removeProperty('--yellow-text');
    /* These colors will need to be changed in other places as well: (not just 2)
        --window-color > '.stage2windowBackground';
        --button-border > '.stage2borderButton' and 'global.stageInfo.buttonBorder[2]'; */
    switch (theme) {
        case 1:
            for (const text of ['upgrade', 'element']) {
                getId(`${text}Text`).style.color = '';
                getId(`${text}Effect`).style.color = '';
                getId(`${text}Cost`).style.color = '';
            }
            break;
        case 2:
            for (const text of ['upgrade', 'element']) {
                getId(`${text}Text`).style.color = 'var(--white-text)';
                getId(`${text}Effect`).style.color = 'var(--green-text)';
                getId(`${text}Cost`).style.color = 'var(--cyan-text)';
            }
            body.setProperty('--background-color', '#070026');
            body.setProperty('--window-color', '#000052');
            body.setProperty('--window-border', 'blue');
            body.setProperty('--footer-color', '#0000db');
            body.setProperty('--button-color', '#0000eb');
            body.setProperty('--button-border', '#386cc7');
            body.setProperty('--button-hover', '#2929ff');
            body.setProperty('--building-afford', '#b30000');
            body.setProperty('--tab-active', '#990000');
            body.setProperty('--hollow-hover', '#2400d7');
            body.setProperty('--input-border', '#4747ff');
            body.setProperty('--input-text', 'dodgerblue');
            body.setProperty('--main-text', 'var(--blue-text)');
            body.setProperty('--gray-text', '#9b9b9b');
            body.setProperty('--darkorchid-text', '#c71bff');
            body.setProperty('--darkviolet-text', '#8b6bff');
            body.setProperty('--green-text', '#82cb3b');
            body.setProperty('--red-text', '#f70000');
            if (player.stage.active === 2) {
                dropStatColor = '#3099ff';
                waterStatColor = '#3099ff';
            }
            break;
        case 3:
            for (const text of ['upgrade', 'element']) {
                getId(`${text}Text`).style.color = 'var(--orange-text)';
                getId(`${text}Effect`).style.color = '';
                getId(`${text}Cost`).style.color = 'var(--green-text)';
            }
            body.setProperty('--background-color', '#000804');
            body.setProperty('--window-color', '#2e1200');
            body.setProperty('--window-border', '#31373e');
            body.setProperty('--footer-color', '#221a00');
            body.setProperty('--button-color', '#291344');
            body.setProperty('--button-border', '#424242');
            body.setProperty('--button-hover', '#382055');
            body.setProperty('--building-afford', '#9e0000');
            body.setProperty('--tab-active', '#8d4c00');
            body.setProperty('--tab-elements', 'var(--tab-active)');
            body.setProperty('--hollow-hover', '#5a2100');
            body.setProperty('--footerButton-hover', '#1a1a1a');
            body.setProperty('--input-border', '#8b4a00');
            body.setProperty('--input-text', '#e77e00');
            body.setProperty('--main-text', 'var(--gray-text)');
            body.setProperty('--white-text', '#dfdfdf');
            body.setProperty('--orange-text', '#f58600');
            body.setProperty('--green-text', '#00db00');
            if (player.stage.active === 2) {
                dropStatColor = '#3099ff';
                waterStatColor = '#3099ff';
            }
            break;
        case 4:
            for (const text of ['upgrade', 'element']) {
                getId(`${text}Text`).style.color = 'var(--blue-text)';
                getId(`${text}Effect`).style.color = 'var(--green-text)';
                getId(`${text}Cost`).style.color = 'var(--cyan-text)';
            }
            body.setProperty('--background-color', '#140e04');
            body.setProperty('--window-color', '#4e0000');
            body.setProperty('--window-border', '#894800');
            body.setProperty('--footer-color', '#4e0505');
            body.setProperty('--button-color', '#6a3700');
            body.setProperty('--button-border', '#a35700');
            body.setProperty('--button-hover', '#8a4700');
            body.setProperty('--building-afford', '#007f95');
            body.setProperty('--tab-active', '#008297');
            body.setProperty('--tab-elements', 'var(--tab-active)');
            body.setProperty('--tab-strangeness', '#00a500');
            body.setProperty('--hollow-hover', '#605100');
            body.setProperty('--footerButton-hover', '#212121');
            body.setProperty('--input-border', '#008399');
            body.setProperty('--input-text', '#05c3c3');
            body.setProperty('--button-text', '#d9d900');
            body.setProperty('--main-text', 'var(--orange-text)');
            body.setProperty('--white-text', '#e5e500');
            body.setProperty('--blue-text', '#2e96ff');
            body.setProperty('--gray-text', '#8b8b8b');
            body.setProperty('--darkorchid-text', '#c71bff');
            body.setProperty('--darkviolet-text', '#9457ff');
            body.setProperty('--red-text', 'red');
            body.setProperty('--green-text', '#00e600');
            body.setProperty('--yellow-text', 'var(--green-text)');
            break;
        case 5:
            for (const text of ['upgrade', 'element']) {
                getId(`${text}Text`).style.color = 'var(--orange-text)';
                getId(`${text}Effect`).style.color = 'var(--green-text)';
                getId(`${text}Cost`).style.color = 'var(--red-text)';
            }
            body.setProperty('--background-color', '#060010');
            body.setProperty('--window-color', '#001d42');
            body.setProperty('--window-border', '#35466e');
            body.setProperty('--footer-color', '#2f005c');
            body.setProperty('--button-color', '#4a008f');
            body.setProperty('--button-border', '#8f004c');
            body.setProperty('--button-hover', '#6800d6');
            body.setProperty('--building-afford', '#8603ff');
            body.setProperty('--tab-active', '#8500ff');
            body.setProperty('--hollow-hover', '#3b0080');
            body.setProperty('--footerButton-hover', '#1a1a1a');
            body.setProperty('--input-border', '#3656a1');
            body.setProperty('--input-text', '#6a88cd');
            body.setProperty('--button-text', '#fc9cfc');
            body.setProperty('--main-text', 'var(--darkorchid-text)');
            body.setProperty('--white-text', '#ff79ff');
            body.setProperty('--orchid-text', '#ff00f4');
            body.setProperty('--darkorchid-text', '#c000ff');
            body.setProperty('--darkviolet-text', '#9f52ff');
            body.setProperty('--yellow-text', 'var(--darkviolet-text)');
            break;
        case 6:
            for (const text of ['upgrade', 'element']) {
                getId(`${text}Text`).style.color = 'var(--orchid-text)';
                getId(`${text}Effect`).style.color = 'var(--red-text)';
                getId(`${text}Cost`).style.color = '';
            }
            body.setProperty('--background-color', 'black');
            body.setProperty('--window-color', '#01003c');
            body.setProperty('--window-border', '#7100ff');
            body.setProperty('--footer-color', '#00007a');
            body.setProperty('--button-color', '#2b0095');
            body.setProperty('--button-border', '#6c1ad1');
            body.setProperty('--button-hover', '#3d00d6');
            body.setProperty('--building-afford', '#b30000');
            body.setProperty('--tab-active', '#8d0000');
            body.setProperty('--hollow-hover', '#490070');
            body.setProperty('--input-border', '#a50000');
            body.setProperty('--input-text', 'red');
            body.setProperty('--button-text', '#efe0ff');
            body.setProperty('--main-text', 'var(--darkviolet-text)');
            body.setProperty('--gray-text', '#9b9b9b');
            body.setProperty('--darkviolet-text', '#8157ff');
            body.setProperty('--white-text', '#f9f5ff');
            body.setProperty('--red-text', 'red');
            body.setProperty('--yellow-text', 'var(--red-text)');
    }
    getQuery('#footerStat2 > p').style.color = dropStatColor;
    getQuery('#footerStat3 > p').style.color = waterStatColor;

    setTimeout(() => {
        body.removeProperty('--transition-all');
        body.removeProperty('--transition-buttons');
    }, 1000);
};

export const Alert = async(text: string): Promise<void> => {
    return await new Promise((resolve) => {
        const blocker = getId('blocker');
        if (blocker.style.display !== 'none') {
            resolve();
            Notify('Another Alert is already active');
            return;
        }

        getId('alertText').textContent = text;
        const confirm = getId('confirmBtn');
        blocker.style.display = '';
        confirm.focus();

        const key = async(button: KeyboardEvent) => {
            if (button.key === 'Escape' || button.key === 'Enter' || button.key === ' ') {
                button.preventDefault();
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
        const blocker = getId('blocker');
        if (blocker.style.display !== 'none') {
            resolve(false);
            Notify('Another Alert is already active');
            return;
        }

        getId('alertText').textContent = text;
        const cancel = getId('cancelBtn');
        const confirm = getId('confirmBtn');
        blocker.style.display = '';
        cancel.style.display = '';
        confirm.focus();

        const yes = () => { close(true); };
        const no = () => { close(false); };
        const key = (button: KeyboardEvent) => {
            if (button.key === 'Escape') {
                button.preventDefault();
                no();
            } else if (button.key === 'Enter' || button.key === ' ') {
                if (document.activeElement !== cancel) {
                    button.preventDefault();
                    yes();
                }
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

export const Prompt = async(text: string, inputValue = ''): Promise<string | null> => {
    return await new Promise((resolve) => {
        const blocker = getId('blocker');
        if (blocker.style.display !== 'none') {
            resolve(null);
            Notify('Another Alert is already active');
            return;
        }

        getId('alertText').textContent = text;
        const input = getId('inputArea') as HTMLInputElement;
        const cancel = getId('cancelBtn');
        const confirm = getId('confirmBtn');
        blocker.style.display = '';
        cancel.style.display = '';
        input.style.display = '';
        input.value = inputValue;
        input.focus();

        const yes = () => { close(input.value); };
        const no = () => { close(null); };
        const key = (button: KeyboardEvent) => {
            if (button.key === 'Escape') {
                button.preventDefault();
                no();
            } else if (button.key === 'Enter' || button.key === ' ') {
                if (document.activeElement !== cancel) {
                    button.preventDefault();
                    yes();
                }
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

export const Notify = (text: string) => {
    const div = getId('notifications');
    const notification = document.createElement('p');
    notification.textContent = text;
    notification.style.animation = 'hideX 1s ease-in-out reverse';
    div.style.pointerEvents = '';
    if (global.screenReader) { notification.setAttribute('role', 'alert'); } //Firefox doesn't support any Aria shorthands

    const mainDiv = getId('notifications');
    mainDiv.appendChild(notification);

    let timeout: number | undefined;
    const remove = () => {
        notification.removeEventListener('click', remove);
        notification.style.animation = 'hideX 1s ease-in-out forwards';
        setTimeout(() => {
            mainDiv.removeChild(notification);
            div.style.pointerEvents = '';
        }, 1000);
        clearTimeout(timeout);
    };

    setTimeout(() => {
        notification.style.animation = '';
        div.style.pointerEvents = 'auto';
        timeout = setTimeout(remove, 9000);
        notification.addEventListener('click', remove);
    }, 1000);
};

export const hideFooter = () => {
    const footer = getId('footer');
    const footerArea = getId('footerMain');
    const toggle = getId('hideToggle');
    const arrow = getId('hideArrow');

    const animationReset = () => {
        footer.style.animation = '';
        arrow.style.animation = '';
        toggle.addEventListener('click', hideFooter);
    };

    global.footer = !global.footer;
    toggle.removeEventListener('click', hideFooter);
    if (global.footer) {
        footerArea.style.display = '';
        arrow.style.transform = '';
        footer.style.animation = 'hideY 1s reverse';
        arrow.style.animation = 'rotate 1s reverse';
        getId('hideText').textContent = 'Hide';
        setTimeout(animationReset, 1000);

        numbersUpdate();
        visualUpdate();
    } else {
        footer.style.animation = 'hideY 1s backwards';
        arrow.style.animation = 'rotate 1s backwards';
        getId('hideText').textContent = 'Show';
        setTimeout(() => {
            footerArea.style.display = 'none';
            arrow.style.transform = 'rotate(180deg)';
            animationReset();
        }, 1000);
    }
};

export const changeFontSize = (change = false) => {
    const input = getId('customFontSize') as HTMLInputElement;
    let size = Number(change ? input.value : localStorage.getItem('fontSize'));
    if (size === 0) { size = 16; }

    if (size === 16) {
        document.body.style.fontSize = '';
        localStorage.removeItem('fontSize');
    } else {
        size = Math.floor(Math.min(Math.max(size, 10), 32) * 100) / 100;
        document.body.style.fontSize = `${size}px`;
        localStorage.setItem('fontSize', `${size}`);
    }
    input.value = `${size}`;
};

export const changeFormat = (point: boolean) => {
    const htmlInput = (point ? getId('decimalPoint') : getId('thousandSeparator')) as HTMLInputElement;
    const allowed = ['.', ',', ' ', '_', '^', '"', "'", '`', '|'].includes(htmlInput.value);
    if (!allowed || (point ? player.separator[0] : player.separator[1]) === htmlInput.value) {
        if (point && player.separator[0] === '.') {
            (getId('thousandSeparator') as HTMLInputElement).value = '';
            player.separator[0] = '';
        }
        htmlInput.value = point ? '.' : '';
    }
    point ? player.separator[1] = htmlInput.value : player.separator[0] = htmlInput.value;
};

export const MDStrangenessPage = (stageIndex: number) => {
    for (let s = 1; s <= 5; s++) { getId(`strangenessSection${s}`).style.display = 'none'; }
    getId(`strangenessSection${stageIndex}`).style.display = '';
};

export const replayEvent = async() => {
    if (getId('blocker').style.display !== 'none') { return; }

    let last;
    if (player.stage.true >= 6) {
        last = 7;
    } else if (player.strange[0].total > 0) {
        last = player.event ? 6 : 5;
    } else {
        last = player.stage.true - (player.event ? 0 : 1);
        if (last < 1) { return void Alert('There are no unlocked events'); }
    }

    let text = 'Which event do you want to see again?\nEvent 1: To Discharge;';
    if (last >= 2) { text += '\nEvent 2: Clouds softcap;'; }
    if (last >= 3) { text += '\nEvent 3: New Rank;'; }
    if (last >= 4) { text += '\nEvent 4: Element activation;'; }
    if (last >= 5) { text += '\nEvent 5: Intergalactic space;'; }
    if (last >= 6) { text += '\nEvent 6: First Galaxy;'; }
    if (last >= 7) { text += '\nEvent 7: True Vacuum;'; }

    const event = Number(await Prompt(text, `${last}`));
    if (!isFinite(event) || event < 1 || Math.trunc(event) !== event || event > last) { return; }

    void playEvent(event, false);
};

export const playEvent = async(event: number, award = true) => {
    if (getId('blocker').style.display !== 'none') { return; }
    if (award) { player.event = true; }

    switch (event) {
        case 1:
            return void Alert("Spent Energy can be regained only with Discharge, reaching new Goal isn't required for it");
        case 2:
            return void Alert('Cloud density is too high... Strength of new Clouds will be weaker');
        case 3:
            if (award) {
                global.accretionInfo.rankCost[4] = 5e29;
                global.debug.rankUpdated = -1;
            }
            return void Alert("Accretion can't continue without a new Rank. Next Rank is going to be softcapped");
        case 4:
            return void Alert("Elements require Collapse to be activated. Solar mass won't decrease from Collapse");
        case 5:
            return void Alert('Intergalactic space is currently empty, but after returning back to Microworld and completing different Milestones, new end will arrive');
        case 6:
            if (award) { calculateMaxLevel(4, 4, 'strangeness', true); }
            return void Alert('Galaxy will boost Nebulas and Star clusters, but for the price of everything else');
        case 7:
            await Alert('Vacuum is too unstable. Vacuum instability is imminent');
            return void Alert('False Vacuum decayed, new Forces and Structures are expected');
    }
};
