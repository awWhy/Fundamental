import Limit from './Limit';
import { getId, getQuery } from './Main';
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
        if (player.stage.true < themeNumber) { initial = true; }
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

export const switchTheme = () => {
    const { theme } = global;
    const body = document.body.style;

    if (theme.default) {
        theme.stage = player.stage.active;
        getId('currentTheme').textContent = 'Default';
    } else {
        getId('currentTheme').textContent = global.stageInfo.word[theme.stage];
    }

    let dropStatColor = '';
    let waterStatColor = '';
    body.setProperty('--transition-all', '1s');
    body.setProperty('--transition-buttons', '700ms');

    /* Full reset, because better response from CSS (also easier) */
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
    /* These colors will need to be changed in other places as well: (not just 2, but from 2 to max)
        --window-color > '.stage2windowBackground';
        --button-main-color > '.stage2backgroundButton' and 'global.stageInfo.buttonBackgroundColor[2]';
        --button-main-border > '.stage2borderButton' and 'global.stageInfo.buttonBorderColor[2]'; */
    switch (theme.stage) {
        case 1:
            for (const text of ['upgrade', 'research', 'element']) {
                getId(`${text}Effect`).style.color = '';
                getId(`${text}Cost`).style.color = '';
                if (text === 'upgrade') { continue; } //Not changed anywhere
                getId(`${text}Text`).style.color = '';
            }
            break;
        case 2:
            for (const text of ['upgrade', 'research', 'element']) {
                getId(`${text}Effect`).style.color = 'var(--green-text-color)';
                getId(`${text}Cost`).style.color = 'var(--cyan-text-color)';
                if (text === 'upgrade') { continue; }
                getId(`${text}Text`).style.color = '';
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
            body.setProperty('--main-text-color', 'var(--blue-text-color)');
            body.setProperty('--gray-text-color', '#9b9b9b');
            body.setProperty('--darkorchid-text-color', '#c71bff');
            body.setProperty('--darkviolet-text-color', '#8b6bff');
            body.setProperty('--green-text-color', '#82cb3b');
            body.setProperty('--red-text-color', '#f70000');
            if (player.stage.active === 2) {
                dropStatColor = '#3099ff';
                waterStatColor = '#3099ff';
            }
            break;
        case 3:
            for (const text of ['upgrade', 'research', 'element']) {
                getId(`${text}Effect`).style.color = '';
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
            body.setProperty('--main-text-color', 'var(--gray-text-color)');
            body.setProperty('--white-text-color', '#dfdfdf');
            body.setProperty('--orange-text-color', '#f58600');
            body.setProperty('--green-text-color', '#00db00');
            if (player.stage.active === 2) {
                dropStatColor = '#3099ff';
                waterStatColor = '#3099ff';
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
            body.setProperty('--main-text-color', 'var(--orange-text-color)');
            body.setProperty('--white-text-color', '#e5e500');
            body.setProperty('--blue-text-color', '#2e96ff');
            body.setProperty('--gray-text-color', '#8b8b8b');
            body.setProperty('--darkorchid-text-color', '#c71bff');
            body.setProperty('--darkviolet-text-color', '#9457ff');
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
            body.setProperty('--footer-color', '#2f005c');
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
            body.setProperty('--main-text-color', 'var(--darkorchid-text-color)');
            body.setProperty('--white-text-color', '#ff79ff');
            body.setProperty('--orchid-text-color', '#ff00f4');
            body.setProperty('--darkorchid-text-color', '#c000ff');
            body.setProperty('--darkviolet-text-color', '#9f52ff');
            body.setProperty('--yellow-text-color', 'var(--darkviolet-text-color)');
            break;
        case 6:
            for (const text of ['upgrade', 'research', 'element']) {
                getId(`${text}Effect`).style.color = 'var(--red-text-color)';
                getId(`${text}Cost`).style.color = '';
                if (text === 'upgrade') { continue; }
                getId(`${text}Text`).style.color = 'var(--orchid-text-color)';
            }
            body.setProperty('--background-color', 'black');
            body.setProperty('--window-color', '#01003c');
            body.setProperty('--window-border', '#7100ff');
            body.setProperty('--footer-color', '#00007a');
            body.setProperty('--button-main-color', '#2b0095');
            body.setProperty('--button-main-border', '#711bda');
            body.setProperty('--button-main-hover', '#3d00d6');
            body.setProperty('--building-can-buy', '#a80000');
            body.setProperty('--button-tab-border', '#6719c8');
            body.setProperty('--button-tab-active', '#8d0000');
            body.setProperty('--button-extra-hover', '#490070');
            body.setProperty('--button-delete-color', '#930606');
            body.setProperty('--button-delete-hover', '#b80000');
            body.setProperty('--input-border-color', '#a50000');
            body.setProperty('--input-text-color', 'red');
            body.setProperty('--button-text-color', '#efe0ff');
            body.setProperty('--main-text-color', 'var(--darkviolet-text-color)');
            body.setProperty('--gray-text-color', '#9b9b9b');
            body.setProperty('--darkviolet-text-color', '#8157ff');
            body.setProperty('--white-text-color', '#f9f5ff');
            body.setProperty('--red-text-color', 'red');
            body.setProperty('--yellow-text-color', 'var(--red-text-color)');
    }
    getQuery('#footerStat2 > p').style.color = dropStatColor;
    getQuery('#footerStat3 > p').style.color = waterStatColor;

    setTimeout(() => {
        body.removeProperty('--transition-all');
        body.removeProperty('--transition-buttons');
    }, 1000);
};

export const Alert = (text: string) => { void AlertWait(text); };
export const AlertWait = async(text: string): Promise<void> => {
    return await new Promise((resolve) => {
        const blocker = getId('blocker');
        if (blocker.style.display !== 'none') {
            console.warn("Wasn't able to show another window (alert)");
            resolve();
            return;
        }

        getId('alertText').textContent = text;
        const confirm = getId('confirmBtn');
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

export const Confirm = async(text: string, rejectValue = false): Promise<boolean> => {
    return await new Promise((resolve) => {
        const blocker = getId('blocker');
        if (blocker.style.display !== 'none') {
            console.warn("Wasn't able to show another window (confirm)");
            resolve(rejectValue);
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
        const blocker = getId('blocker');
        if (blocker.style.display !== 'none') {
            console.warn("Wasn't able to show another window (prompt)");
            resolve(null);
            return;
        }

        getId('alertText').textContent = text;
        const input = getId('inputArea') as HTMLInputElement;
        const cancel = getId('cancelBtn');
        const confirm = getId('confirmBtn');
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

export const notify = (text: string) => {
    const notification = document.createElement('p');
    notification.textContent = text;
    notification.style.animation = 'hideX 1s ease-in-out reverse';

    const mainDiv = getId('notifications');
    mainDiv.appendChild(notification);

    let timeout: number | undefined;
    const remove = () => {
        notification.removeEventListener('click', remove);
        notification.style.animation = 'hideX 1s ease-in-out forwards';
        setTimeout(() => mainDiv.removeChild(notification), 1000);
        clearTimeout(timeout);
    };

    setTimeout(() => {
        notification.style.animation = '';
        timeout = setTimeout(remove, 9000);
        notification.addEventListener('click', remove);
    }, 1000);
};

export const hideFooter = () => {
    const footer = getId('footer');
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
        getId('footerColor').style.display = '';
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
            getId('footerColor').style.display = 'none';
            arrow.style.transform = 'rotate(180deg)';
            animationReset();
        }, 1000);
    }
};

export const mobileDeviceSupport = (change = false) => {
    let enabled = Boolean(localStorage.getItem('mobile device'));
    const toggle = getId('mobileDeviceToggle');

    if (change) { enabled = !enabled; }

    if (enabled) {
        toggle.textContent = 'ON';
        toggle.style.color = 'var(--red-text-color)';
        toggle.style.borderColor = 'crimson';
        localStorage.setItem('mobile device', 'true');
        global.mobileDevice = true;
        if (change) { Alert('For full support please refresh the page. This will add touchStart event (as example: touching an upgrade to view description)'); }
    } else {
        toggle.textContent = 'OFF';
        toggle.style.color = '';
        toggle.style.borderColor = '';
        localStorage.removeItem('mobile device');
        global.mobileDevice = false;
    }
};

export const screenReaderSupport = (change = false) => {
    let enabled = Boolean(localStorage.getItem('screen reader'));
    const toggle = getId('screenReaderToggle');

    if (change) { enabled = !enabled; }

    if (enabled) {
        toggle.textContent = 'ON';
        toggle.style.color = 'var(--red-text-color)';
        toggle.style.borderColor = 'crimson';
        localStorage.setItem('screen reader', 'true');
        global.screenReader = true;
        stageCheck();
        if (change) { Alert("For full support please refresh the page. This will add focus events (as example: can view description of an upgrade by using 'tab'), also will add special tab to check progress and more (need feedback on it)"); }
    } else {
        toggle.textContent = 'OFF';
        toggle.style.color = '';
        toggle.style.borderColor = '';
        localStorage.removeItem('screen reader');
        global.screenReader = false;
    }
};

export const getInformationSR = (index: number, special: 'building' | 'resource' | 'information') => {
    if (special === 'building') {
        const { buildingsInfo } = global;
        const active = player.stage.active;
        const buildings = player.buildings[active];

        let extra = index - 1;
        if (active === 4 || (active === 5 && index < 3)) { extra = 0; }

        if (index === 0) {
            getId('SRMain').textContent = `You have ${Limit(buildings[0].current).format()} ${buildingsInfo.name[active][0]}`;
        } else {
            getId('SRMain').textContent = `You have ${Limit(buildings[index].current).format()} ${buildingsInfo.name[active][index]}${Limit(buildings[index].current).notEqual(buildings[index as 1].true) ? `, out of them ${format(buildings[index as 1].true)} are self-made ones` : ''}, they are ${buildingsInfo.type[active][index] === 'producing' ? `producing ${Limit(buildingsInfo.producing[active][index]).format()} ${buildingsInfo.name[active][extra]} per second` : `improving production of ${buildingsInfo.name[active][extra]} by ${Limit(buildingsInfo.producing[active][index]).format()}`}${player.ASR[active] >= index ? `, auto is ${player.toggles.buildings[active][index] ? 'on' : 'off'}` : ''}`;
        }
    } else if (special === 'resource') {
        if (index === 0) {
            getId('SRMain').textContent = `You have ${format(player.strange[0].current)} Strange quarks${global.strangeInfo.stageBoost[player.stage.active] !== null ? ` they are boosting production of current stage by ${format(global.strangeInfo.stageBoost[player.stage.active] as number)}` : ''}, you will gain ${format(global.strangeInfo.gain(player.stage.active))} on Stage reset`;
        } else if (index === 1) {
            if (player.stage.active === 1) {
                assignDischargeInformation();
                getId('SRMain').textContent = `You have ${format(player.discharge.energy)} Energy${player.upgrades[1][5] === 1 ? `, next discharge goal is ${format(global.dischargeInfo.next)} Energy, you reached goal ${format(player.discharge.current)} times` : ''}${global.dischargeInfo.bonus > 0 ? `, you also have +${format(global.dischargeInfo.bonus)} free goals.` : ''}`;
            } else if (player.stage.active === 2) {
                assignVaporizationInformation();
                getId('SRMain').textContent = `You have ${Limit(player.vaporization.clouds).format()} Clouds${Limit(global.vaporizationInfo.get).moreThan('1') ? `, you can get +${Limit(global.vaporizationInfo.get).format()} if you reset now` : ''}`;
            } else if (player.stage.active === 4) {
                assignCollapseInformation();
                getId('SRMain').textContent = `You have ${format(player.collapse.mass)} Mass${global.collapseInfo.newMass >= player.collapse.mass ? `, you can get +${format(global.collapseInfo.newMass - player.collapse.mass)} if you reset now` : ''}${player.researchesExtra[4][0] >= 1 ? `, also ${format(global.collapseInfo.starCheck[0])} Red giants` : ''}${player.researchesExtra[4][0] >= 2 ? `,  ${format(global.collapseInfo.starCheck[1])} Neutron stars` : ''}${player.researchesExtra[4][0] >= 3 ? ` and also ${format(global.collapseInfo.starCheck[2])} Black holes` : ''}`;
            }
        }
    } else if (special === 'information') {
        if (index === 0) {
            const { activeAll, word } = global.stageInfo;

            let activeStages = word[activeAll[0]];
            for (let i = 1; i < activeAll.length; i++) {
                activeStages += `, ${word[activeAll[i]]}`;
            }

            getId('SRMain').textContent = `Current Active Stages are ${activeStages}`;
        }
    }
};

export const changeFontSize = (change = false, inputChange = false) => {
    const toggle = getId('fontSizeToggle');
    let enabled = Boolean(localStorage.getItem('fontSize'));

    if (change) { enabled = !enabled; }

    if (!enabled) {
        document.body.style.removeProperty('--font-size');
        localStorage.removeItem('fontSize');
        toggle.textContent = 'OFF';
        toggle.style.color = 'var(--red-text-color)';
        toggle.style.borderColor = 'crimson';
    } else {
        const input = getId('customFontSize') as HTMLInputElement;
        let size = Number(localStorage.getItem('fontSize'));
        if (size < 10 || size > 32 || inputChange) {
            size = Math.min(Math.max(Math.floor(Number(input.value) * 10) / 10, 10), 32);
        }

        document.body.style.setProperty('--font-size', `${size}px`);
        localStorage.setItem('fontSize', `${size}`);
        toggle.textContent = 'ON';
        toggle.style.color = '';
        toggle.style.borderColor = '';
        input.value = `${size}`;
    }
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

//If done for span, then add class="noMoveSpan";
export const assignWithNoMove = (html: HTMLElement, text: string) => {
    html.textContent = text;
    html.style.width = `${text.length * 0.63}em`;
};

export const replayEvent = async() => {
    if (getId('blocker').style.display !== 'none') { return; }
    const event = Number(await Prompt('Which event you want to see again?\n(Write a number of that event)'));
    if (!isFinite(event) || event <= 0) { return; }

    let allowed = false;
    if ([1, 2, 3, 4].includes(event)) {
        allowed = player.stage.true > event || (player.events[0] && player.stage.true === event);
    } else if (event === 5) {
        allowed = player.events[1];
    } else if (event === 6) {
        allowed = player.events[2];
    }
    if (!allowed) { return Alert(`Event under number ${event} can't be viewed, because it isn't unlocked`); }

    playEvent(event - 1, -1);
};

export const playEvent = (event: number, index: number) => {
    if (getId('blocker').style.display !== 'none') { return; }
    if (index !== -1) { player.events[index] = true; }

    switch (event) {
        case 0: //[0] Discharge explanation
            Alert("Energy that had been spent, can't be obtained again. But doing Discharge will reset spent Energy");
            break;
        case 1: //[0] Clouds softcap
            Alert('Cloud density is too high... Getting more will be harder now');
            break;
        case 2: //[0] Accretion new Rank unlocked
            Alert('Getting more Mass, seems impossible. We need to change our approach, next Rank is going to be Softcapped');
            if (index !== -1 && player.accretion.rank <= 4) {
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
