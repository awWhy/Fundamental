import { assignHotkeys, detectShift, removeHotkey } from './Hotkeys';
import { cloneArray, deepClone, getClass, getId, getQuery, globalSaveStart, pauseGame, playerStart } from './Main';
import { global, player, prepareVacuum, updatePlayer } from './Player';
import { assignResetInformation, setActiveStage, toggleChallengeType } from './Stage';
import type { globalSaveType, hotkeysList, numbersList } from './Types';
import { format, numbersUpdate, stageUpdate, switchTab, visualProgressUnlocks, visualUpdate } from './Update';

export const globalSave: globalSaveType = {
    intervals: {
        numbers: 80,
        visual: 800,
        autoSave: 20000
    },
    hotkeys: {
        makeAll: ['M', 'M'],
        toggleAll: ['Shift A', 'Shift A'],
        createAll: ['U', 'U'],
        toggleUpgrades: ['None', 'None'],
        discharge: ['D', 'D'],
        toggleDischarge: ['None', 'None'],
        vaporization: ['V', 'V'],
        toggleVaporization: ['None', 'None'],
        rank: ['R', 'R'],
        toggleRank: ['None', 'None'],
        collapse: ['C', 'C'],
        toggleCollapse: ['None', 'None'],
        galaxy: ['G', 'G'],
        merge: ['Shift M', 'Shift M'],
        toggleMerge: ['None', 'None'],
        nucleation: ['N', 'N'],
        toggleNucleation: ['None', 'None'],
        stage: ['S', 'S'],
        toggleStage: ['None', 'None'],
        verses: ['Shift V', 'Shift V'],
        end: ['Shift B', 'Shift B'],
        exitChallenge: ['Shift E', 'Shift E'],
        supervoid: ['Shift S', 'Shift S'],
        warp: ['Shift W', 'Shift W'],
        pause: ['P', 'P'],
        tabRight: ['Arrow Right', 'Arrow Right'],
        tabLeft: ['Arrow Left', 'Arrow Left'],
        subtabUp: ['Arrow Up', 'Arrow Up'],
        subtabDown: ['Arrow Down', 'Arrow Down'],
        stageRight: ['Shift Arrow Right', 'Shift Arrow Right'],
        stageLeft: ['Shift Arrow Left', 'Shift Arrow Left']
    },
    numbers: {
        makeStructure: 'Numbers',
        toggleStructure: 'Numpad',
        enterChallenge: 'Shift Numbers'
    },
    toggles: [false, false, false, false, false, false, true, true, false],
    format: ['.', ''],
    theme: null,
    fontSize: 16,
    MDSettings: [false, false, false],
    SRSettings: [false, false],
    developerMode: false
};

export const saveGlobalSettings = (noSaving = false): string => {
    const hotkeysClone = deepClone(globalSave.hotkeys);
    const encoder = new TextEncoder();
    for (const key in hotkeysClone) {
        const array = hotkeysClone[key as hotkeysList];
        for (let i = 0; i < array.length; i++) {
            array[i] = String.fromCharCode(...encoder.encode(array[i]));
        }
    }
    const clone = { ...globalSave };
    clone.hotkeys = hotkeysClone;
    const save = btoa(JSON.stringify(clone));
    if (!noSaving) { localStorage.setItem(specialHTML.localStorage.settings, save); }
    return save;
};

export const toggleSpecial = (number: number, type: 'global' | 'mobile' | 'reader', change = false, reload = false) => {
    let toggles;
    if (type === 'mobile') {
        toggles = globalSave.MDSettings;
    } else if (type === 'reader') {
        toggles = globalSave.SRSettings;
    } else {
        toggles = globalSave.toggles;
    }

    if (change) {
        if (reload) {
            return void (async() => {
                if (!await Confirm('Changing this setting will reload the page, confirm?\n(Game will not autosave)')) { return; }
                pauseGame();
                toggles[number] = !toggles[number];
                saveGlobalSettings();
                window.location.reload();
                void Alert('Awaiting game reload');
            })();
        } else {
            toggles[number] = !toggles[number];
            saveGlobalSettings();
        }
    }

    let toggleHTML;
    if (type === 'mobile') {
        toggleHTML = getId(`MDToggle${number}`);
    } else if (type === 'reader') {
        toggleHTML = getId(`SRToggle${number}`);
    } else {
        toggleHTML = getId(`globalToggle${number}`);
    }

    if (!toggles[number]) {
        toggleHTML.style.color = 'var(--green-text)';
        toggleHTML.style.borderColor = 'forestgreen';
        toggleHTML.textContent = 'OFF';
    } else {
        toggleHTML.style.color = '';
        toggleHTML.style.borderColor = '';
        toggleHTML.textContent = 'ON';
    }
};

export const specialHTML = { //Images here are from true vacuum for easier cache
    /** [textContent] */
    resetHTML: ['', 'Discharge', 'Vaporization', 'Rank', 'Collapse', 'Merge', 'Nucleation'],
    longestBuilding: 7, //+1
    /** [src] */
    buildingHTML: [
        [],
        ['Preon.png', 'Quarks.png', 'Particle.png', 'Atom.png', 'Molecule.png'],
        ['Drop.png', 'Puddle.png', 'Pond.png', 'Lake.png', 'Sea.png', 'Ocean.png'],
        ['Cosmic%20dust.png', 'Planetesimal.png', 'Protoplanet.png', 'Natural%20satellite.png', 'Subsatellite.png'],
        ['Brown%20dwarf.png', 'Orange%20dwarf.png', 'Red%20supergiant.png', 'Blue%20hypergiant.png', 'Quasi%20star.png'],
        ['Nebula.png', 'Star%20cluster.png', 'Galaxy.png'],
        ['Dark%20planet.png']
    ],
    longestUpgrade: 14,
    /** [src] */
    upgradeHTML: [
        [], [
            'UpgradeQ1.png',
            'UpgradeQ2.png',
            'UpgradeQ3.png',
            'UpgradeQ4.png',
            'UpgradeQ5.png',
            'UpgradeQ6.png',
            'UpgradeQ7.png',
            'UpgradeQ8.png',
            'UpgradeQ9.png',
            'UpgradeQ10.png',
            'UpgradeQ11.png'
        ], [
            'UpgradeW1.png',
            'UpgradeW2.png',
            'UpgradeW3.png',
            'UpgradeW4.png',
            'UpgradeW5.png',
            'UpgradeW6.png',
            'UpgradeW7.png',
            'UpgradeW8.png',
            'UpgradeW9.png'
        ], [
            'UpgradeA1.png',
            'UpgradeA2.png',
            'UpgradeA3.png',
            'UpgradeA4.png',
            'UpgradeA5.png',
            'UpgradeA6.png',
            'UpgradeA7.png',
            'UpgradeA8.png',
            'UpgradeA9.png',
            'UpgradeA10.png',
            'UpgradeA11.png',
            'UpgradeA12.png',
            'UpgradeA13.png',
            'UpgradeA14.png'
        ], [
            'UpgradeS1.png',
            'UpgradeS2.png',
            'UpgradeS3.png',
            'UpgradeS4.png',
            'UpgradeS5.png',
            'Missing.png'
        ], [
            'UpgradeG1.png',
            'UpgradeG2.png',
            'UpgradeG3.png',
            'UpgradeG4.png',
            'UpgradeG5.png',
            'UpgradeG6.png',
            'UpgradeG7.png'
        ], [
            'UpgradeD1.png',
            'Missing.png'
        ]
    ],
    longestResearch: 9,
    /** [src, className] */
    researchHTML: [
        [], [
            ['ResearchQ1.png', 'stage1borderImage'],
            ['ResearchQ2.png', 'stage1borderImage'],
            ['ResearchQ3.png', 'stage1borderImage'],
            ['ResearchQ4.png', 'stage4borderImage'],
            ['ResearchQ5.png', 'stage4borderImage'],
            ['ResearchQ6.png', 'stage4borderImage']
        ], [
            ['ResearchW1.png', 'stage2borderImage'],
            ['ResearchW2.png', 'stage2borderImage'],
            ['ResearchW3.png', 'stage2borderImage'],
            ['ResearchW4.png', 'stage2borderImage'],
            ['ResearchW5.png', 'stage2borderImage'],
            ['ResearchW6.png', 'stage2borderImage'],
            ['Missing.png', 'stage2borderImage']
        ], [
            ['ResearchA1.png', 'stage3borderImage'],
            ['ResearchA2.png', 'stage2borderImage'],
            ['ResearchA3.png', 'stage3borderImage'],
            ['ResearchA4.png', 'stage3borderImage'],
            ['ResearchA5.png', 'stage3borderImage'],
            ['ResearchA6.png', 'stage3borderImage'],
            ['ResearchA7.png', 'stage1borderImage'],
            ['ResearchA8.png', 'redBorderImage'],
            ['ResearchA9.png', 'stage1borderImage']
        ], [
            ['ResearchS1.png', 'stage5borderImage'],
            ['ResearchS2.png', 'stage5borderImage'],
            ['ResearchS3.png', 'redBorderImage'],
            ['ResearchS4.png', 'stage5borderImage'],
            ['ResearchS5.png', 'stage6borderImage'],
            ['ResearchS6.png', 'stage4borderImage']
        ], [
            ['ResearchG1.png', 'stage1borderImage'],
            ['ResearchG2.png', 'stage6borderImage'],
            ['ResearchG3.png', 'stage6borderImage'],
            ['ResearchG4.png', 'stage4borderImage'],
            ['Missing.png', 'redBorderImage']
        ], [
            ['ResearchD1.png', 'stage3borderImage'],
            ['ResearchD2.png', 'stage2borderImage'],
            ['ResearchD3.png', 'stage3borderImage'],
            ['ResearchD4.png', 'stage3borderImage']
        ]
    ],
    longestResearchExtra: 6,
    /** [src, className, hoverText] */
    researchExtraDivHTML: [
        [],
        ['Energy%20Researches.png', 'stage4borderImage', 'Energy'],
        ['Cloud%20Researches.png', 'stage2borderImage', 'Clouds'],
        ['Rank%20Researches.png', 'stage6borderImage', 'Rank'],
        ['Collapse%20Researches.png', 'stage6borderImage', 'Collapse'],
        ['Galaxy%20Researches.png', 'stage3borderImage', 'Galaxy'],
        ['Dark%20energy%20Researches.png', 'stage3borderImage', 'Dark energy']
    ],
    /** [src, className] */
    researchExtraHTML: [
        [], [
            ['ResearchEnergy1.png', 'stage1borderImage'],
            ['ResearchEnergy2.png', 'stage5borderImage'],
            ['ResearchEnergy3.png', 'stage3borderImage'],
            ['ResearchEnergy4.png', 'stage1borderImage'],
            ['ResearchEnergy5.png', 'stage6borderImage'],
            ['ResearchEnergy6.png', 'stage1borderImage']
        ], [
            ['ResearchClouds1.png', 'stage3borderImage'],
            ['ResearchClouds2.png', 'stage2borderImage'],
            ['ResearchClouds3.png', 'stage4borderImage'],
            ['ResearchClouds4.png', 'stage2borderImage'],
            ['ResearchClouds5.png', 'stage2borderImage']
        ], [
            ['ResearchRank1.png', 'stage3borderImage'],
            ['ResearchRank2.png', 'stage3borderImage'],
            ['ResearchRank3.png', 'stage3borderImage'],
            ['ResearchRank4.png', 'stage2borderImage'],
            ['ResearchRank5.png', 'stage2borderImage'],
            ['ResearchRank6.png', 'stage6borderImage']
        ], [
            ['ResearchCollapse1.png', 'stage6borderImage'],
            ['ResearchCollapse2.png', 'redBorderImage'],
            ['ResearchCollapse3.png', 'stage1borderImage'],
            ['ResearchCollapse4.png', 'stage6borderImage'],
            ['Missing.png', 'redBorderImage']
        ], [
            ['ResearchGalaxy1.png', 'stage3borderImage'],
            ['ResearchGalaxy2.png', 'brownBorderImage'],
            ['ResearchGalaxy3.png', 'stage3borderImage'],
            ['ResearchGalaxy4.png', 'brownBorderImage'],
            ['Missing.png', 'redBorderImage'],
            ['Missing.png', 'redBorderImage']
        ], [
            ['ResearchDark1.png', 'stage3borderImage'],
            ['ResearchDark2.png', 'stage6borderImage'],
            ['ResearchDark3.png', 'stage3borderImage'],
            ['ResearchDark4.png', 'stage3borderImage'],
            ['ResearchDark5.png', 'stage6borderImage']
        ]
    ],
    longestFooterStats: 3,
    /** [src, className, textcontent] */
    footerStatsHTML: [
        [], [
            ['Energy%20mass.png', 'stage1borderImage cyanText', 'Mass'],
            ['Energy.png', 'stage4borderImage orangeText', 'Energy']
        ], [
            ['Water.png', 'stage2borderImage blueText', 'Moles'],
            ['Drop.png', 'stage2borderImage blueText', 'Drops'],
            ['Clouds.png', 'stage3borderImage grayText', 'Clouds']
        ], [
            ['Mass.png', 'stage3borderImage grayText', 'Mass']
        ], [
            ['Elements.png', 'stage4borderImage orangeText', 'Stardust'],
            ['Main_sequence%20mass.png', 'stage1borderImage cyanText', 'Mass']
        ], [
            ['Elements.png', 'stage4borderImage orangeText', 'Stardust'],
            ['Main_sequence%20mass.png', 'stage1borderImage cyanText', 'Mass'],
            ['Stars.png', 'redBorderImage redText', 'Stars']
        ], [
            ['Dark%20matter.png', 'stage3borderImage grayText', 'Matter'],
            ['Dark%20energy.png', 'stage3borderImage grayText', 'Energy'],
            ['Dark%20fluid.png', 'stage6borderImage darkvioletText', 'Fluid']
        ]
    ],
    mobileDevice: { //All browsers that I tested didn't properly detected more than 1 touch
        /** [X, Y] */
        start: [0, 0]
    },
    localStorage: {
        /** Index for game's primary save slot */
        main: 'fundamentalSave',
        /** Index for global game settings */
        settings: 'fundamentalSettings'
    },
    cache: {
        imagesDiv: document.createElement('div'), //Saved just in case
        /** Lazy way to optimize HTML, without it can't properly detect changes */
        innerHTML: new Map<string | HTMLElement, any>(),
        idMap: new Map<string, HTMLElement>(),
        classMap: new Map<string, HTMLCollectionOf<HTMLElement>>(),
        queryMap: new Map<string, HTMLElement>()
    },
    errorCooldowns: [] as string[],
    /** [text, true ? incrementFunc : closeFunc] */
    notifications: [] as Array<[string, (instantClose?: boolean) => void]>,
    /** [priority, closeFunc] */
    alert: [null, null] as [number | null, (() => void) | null],
    /** Function to update current hover text */
    hoverText: null as null | (() => void),
    bigWindow: null as 'version' | 'hotkeys' | null,
    styleSheet: document.createElement('style') //Secondary
};

export const preventImageUnload = () => {
    if (global.offline.active || global.paused) {
        global.offline.cacheUpdate = true;
        return;
    }
    const { footerStatsHTML: footer, buildingHTML: build, upgradeHTML: upgrade, researchHTML: research, researchExtraHTML: extra, researchExtraDivHTML: extraDiv } = specialHTML;

    let images = '';
    for (let s = 1; s <= 6; s++) {
        for (let i = 0; i < footer[s].length; i++) {
            if (s === 2) {
                if (i === 1) { continue; } //Drops
            } else if (s === 5 && i < 2) { continue; } //Solar mass and Stardust
            images += `<img src="Used_art/${footer[s][i][0]}" loading="lazy">`;
        }
        for (let i = 0; i < build[s].length; i++) {
            images += `<img src="Used_art/${build[s][i]}" loading="lazy">`;
        }
        for (let i = 0; i < upgrade[s].length; i++) {
            images += `<img src="Used_art/${upgrade[s][i]}" loading="lazy">`;
        }
        for (let i = 0; i < research[s].length; i++) {
            images += `<img src="Used_art/${research[s][i][0]}" loading="lazy">`;
        }
        for (let i = 0; i < extra[s].length; i++) {
            images += `<img src="Used_art/${extra[s][i][0]}" loading="lazy">`;
        }
        images += `<img src="Used_art/${extraDiv[s][0]}" loading="lazy">`;
        images += `<img src="Used_art/Stage${s}%20border.png" loading="lazy">`;
    }
    for (const text of global.accretionInfo.rankImage) { //Already cached in Accretion stats, this only refreshes it
        images += `<img src="Used_art/${text}" loading="lazy">`;
    }
    for (const text of ['Red%20giant', 'White%20dwarf', 'Neutron%20star', 'Quark%20star', 'Galaxy%20group']) { //Galaxy%20cluster
        images += `<img src="Used_art/${text}.png" loading="lazy">`;
    }
    specialHTML.cache.imagesDiv.innerHTML = images;

    setTimeout(preventImageUnload, 3600_000);
};

/** Not providing value for 'theme' will make it use one from globalSave and remove all checks */
export const setTheme = (theme = 'current' as 'current' | number | null) => {
    if (theme !== 'current') {
        if (globalSave.theme === null || globalSave.theme > 0) { getId(`switchTheme${globalSave.theme ?? 0}`).style.textDecoration = ''; }

        globalSave.theme = theme;
        saveGlobalSettings();
        getId('currentTheme').textContent = theme === null ? 'Default' : theme === -1 ? 'Quantum' : global.stageInfo.word[theme];
        if (theme === null || theme > 0) { getId(`switchTheme${theme ?? 0}`).style.textDecoration = 'underline'; }
    } else { theme = globalSave.theme; }

    const upgradeTypes = ['upgrade', 'element'];
    const properties = {
        '--background-color': '#030012',
        '--window-color': '#12121c',
        '--window-border': 'cornflowerblue',
        '--footer-color': 'darkblue',
        '--button-color': 'mediumblue',
        '--button-border': 'darkcyan',
        '--button-hover': '#2626ff',
        '--building-afford': '#a90000',
        '--tab-active': '#8b00c5',
        '--tab-elements': '#9f6700',
        '--tab-strangeness': '#00b100',
        '--tab-inflation': '#6c1ad1',
        '--hollow-hover': '#170089',
        '--footerButton-hover': '#181818',
        '--input-border': '#831aa5',
        '--input-text': '#cf71ff',
        '--button-text': '#e3e3e3',
        '--main-text': 'var(--cyan-text)',
        '--white-text': 'white',
        //'--cyan-text': '#00d6d6',
        '--blue-text': 'dodgerblue',
        '--orange-text': 'darkorange',
        '--gray-text': '#8f8f8f',
        '--orchid-text': '#e14bdb',
        '--darkorchid-text': '#bd24ef',
        '--darkviolet-text': '#8b3cec',
        '--brown-text': '#9b7346',
        '--red-text': '#eb0000',
        '--green-text': '#00e900',
        '--yellow-text': '#fafa00'
    };

    /* Many of these colors will need to be changed in other places (find them with quick search, there are too many of them) */
    switch (theme ?? player.stage.active) {
        case 1:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = 'var(--darkorchid-text)';
                getId(`${text}Effect`).style.color = 'var(--blue-text)';
                getId(`${text}Cost`).style.color = 'var(--orange-text)';
            }
            properties['--tab-inflation'] = 'var(--tab-active)';
            break;
        case 2:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = 'var(--white-text)';
                getId(`${text}Effect`).style.color = 'var(--green-text)';
                getId(`${text}Cost`).style.color = 'var(--cyan-text)';
            }
            properties['--background-color'] = '#070026';
            properties['--window-color'] = '#000052';
            properties['--window-border'] = 'blue';
            properties['--footer-color'] = '#0000db';
            properties['--button-color'] = '#0000eb';
            properties['--button-border'] = '#386cc7';
            properties['--button-hover'] = '#2929ff';
            properties['--building-afford'] = '#b30000';
            properties['--tab-active'] = '#990000';
            properties['--hollow-hover'] = '#2400d7';
            properties['--input-border'] = '#4747ff';
            properties['--input-text'] = 'dodgerblue';
            properties['--main-text'] = 'var(--blue-text)';
            properties['--gray-text'] = '#9b9b9b';
            properties['--darkorchid-text'] = '#c71bff';
            properties['--darkviolet-text'] = '#9061ff';
            properties['--green-text'] = '#82cb3b';
            properties['--red-text'] = '#f70000';
            break;
        case 3:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = 'var(--orange-text)';
                getId(`${text}Effect`).style.color = 'var(--blue-text)';
                getId(`${text}Cost`).style.color = 'var(--green-text)';
            }
            properties['--background-color'] = '#000804';
            properties['--window-color'] = '#2e1200';
            properties['--window-border'] = '#31373e';
            properties['--footer-color'] = '#221a00';
            properties['--button-color'] = '#291344';
            properties['--button-border'] = '#424242';
            properties['--button-hover'] = '#382055';
            properties['--building-afford'] = '#9e0000';
            properties['--tab-active'] = '#8d4c00';
            properties['--tab-elements'] = 'var(--tab-active)';
            properties['--hollow-hover'] = '#5a2100';
            properties['--footerButton-hover'] = '#1a1a1a';
            properties['--input-border'] = '#8b4a00';
            properties['--input-text'] = '#e77e00';
            properties['--main-text'] = 'var(--gray-text)';
            properties['--white-text'] = '#dfdfdf';
            properties['--orange-text'] = '#f58600';
            properties['--green-text'] = '#00db00';
            break;
        case 4:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = 'var(--blue-text)';
                getId(`${text}Effect`).style.color = 'var(--green-text)';
                getId(`${text}Cost`).style.color = 'var(--cyan-text)';
            }
            properties['--background-color'] = '#140e04';
            properties['--window-color'] = '#4e0000';
            properties['--window-border'] = '#894800';
            properties['--footer-color'] = '#4e0505';
            properties['--button-color'] = '#6a3700';
            properties['--button-border'] = '#a35700';
            properties['--button-hover'] = '#8a4700';
            properties['--building-afford'] = '#007f95';
            properties['--tab-active'] = '#008297';
            properties['--tab-elements'] = 'var(--tab-active)';
            properties['--tab-strangeness'] = '#00a500';
            properties['--hollow-hover'] = '#605100';
            properties['--footerButton-hover'] = '#212121';
            properties['--input-border'] = '#008399';
            properties['--input-text'] = '#05c3c3';
            properties['--button-text'] = '#d9d900';
            properties['--main-text'] = 'var(--orange-text)';
            properties['--white-text'] = '#e5e500';
            properties['--blue-text'] = '#2e96ff';
            properties['--gray-text'] = '#8b8b8b';
            properties['--darkorchid-text'] = '#c71bff';
            properties['--darkviolet-text'] = '#9457ff';
            properties['--red-text'] = 'red';
            properties['--green-text'] = '#00e600';
            properties['--yellow-text'] = 'var(--green-text)';
            break;
        case 5:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = 'var(--orange-text)';
                getId(`${text}Effect`).style.color = 'var(--green-text)';
                getId(`${text}Cost`).style.color = 'var(--red-text)';
            }
            properties['--background-color'] = '#060010';
            properties['--window-color'] = '#001d42';
            properties['--window-border'] = '#35466e';
            properties['--footer-color'] = '#2f005c';
            properties['--button-color'] = '#4a008f';
            properties['--button-border'] = '#8f004c';
            properties['--button-hover'] = '#6800d6';
            properties['--building-afford'] = '#8603ff';
            properties['--tab-active'] = '#8500ff';
            properties['--tab-inflation'] = 'var(--tab-active)';
            properties['--hollow-hover'] = '#3b0080';
            properties['--footerButton-hover'] = '#1a1a1a';
            properties['--input-border'] = '#3656a1';
            properties['--input-text'] = '#6a88cd';
            properties['--button-text'] = '#fc9cfc';
            properties['--main-text'] = 'var(--darkorchid-text)';
            properties['--white-text'] = '#ff79ff';
            properties['--orchid-text'] = '#ff00f4';
            properties['--darkorchid-text'] = '#c000ff';
            properties['--darkviolet-text'] = '#8861ff';
            properties['--yellow-text'] = 'var(--darkviolet-text)';
            break;
        case 6:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = 'var(--orchid-text)';
                getId(`${text}Effect`).style.color = 'var(--orange-text)';
                getId(`${text}Cost`).style.color = 'var(--red-text)';
            }
            properties['--background-color'] = 'black';
            properties['--window-color'] = '#01003c';
            properties['--window-border'] = '#6500e0';
            properties['--footer-color'] = '#00007a';
            properties['--button-color'] = '#2b0095';
            properties['--button-border'] = '#6c1ad1';
            properties['--button-hover'] = '#3d00d6';
            properties['--building-afford'] = '#b30000';
            properties['--tab-active'] = '#8d0000';
            properties['--tab-inflation'] = 'var(--tab-active)';
            properties['--hollow-hover'] = '#490070';
            properties['--input-border'] = '#a50000';
            properties['--input-text'] = 'red';
            properties['--button-text'] = '#bfbdff';
            properties['--main-text'] = 'var(--darkviolet-text)';
            properties['--white-text'] = '#aba8ff';
            properties['--gray-text'] = '#95979d';
            properties['--darkviolet-text'] = '#8157ff';
            properties['--red-text'] = 'red';
            properties['--yellow-text'] = 'var(--green-text)';
            break;
        case -1:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = 'var(--cyan-text)';
                getId(`${text}Effect`).style.color = 'var(--blue-text)';
                getId(`${text}Cost`).style.color = 'var(--brown-text)';
            }
            properties['--background-color'] = '#041004';
            properties['--window-color'] = '#063003';
            properties['--window-border'] = '#008500';
            properties['--footer-color'] = '#055205';
            properties['--button-color'] = '#094e04';
            properties['--button-border'] = '#00a300';
            properties['--button-hover'] = '#5c401f';
            properties['--building-afford'] = 'var(--tab-active)';
            properties['--tab-active'] = '#8c2eff';
            properties['--tab-strangeness'] = '#0093ad';
            properties['--tab-inflation'] = 'var(--tab-active)';
            properties['--hollow-hover'] = '#0e5309';
            properties['--footerButton-hover'] = '#251f18';
            properties['--input-border'] = '#008ba3';
            properties['--input-text'] = '#05c7c7';
            properties['--button-text'] = '#ccffff';
            properties['--main-text'] = 'var(--green-text)';
            properties['--white-text'] = '#f5ffff';
            properties['--blue-text'] = '#3399ff';
            properties['--gray-text'] = '#999999';
            properties['--darkorchid-text'] = '#c33df0';
            properties['--darkviolet-text'] = '#a052ff';
            properties['--brown-text'] = '#a97e4c';
            properties['--green-text'] = '#00e000';
            properties['--yellow-text'] = 'var(--cyan-text)';
    }

    const bodyStyle = document.documentElement.style;
    bodyStyle.setProperty('--transition-all', '500ms');
    for (const property in properties) { bodyStyle.setProperty(property, properties[property as keyof typeof properties]); }

    setTimeout(() => { bodyStyle.setProperty('--transition-all', '0ms'); }, 500);
};

export const Alert = async(text: string, priority = 0): Promise<void> => {
    return await new Promise((resolve) => {
        if (specialHTML.alert[0] !== null) {
            if (specialHTML.alert[0] < priority) {
                (specialHTML.alert[1] as () => undefined)();
                Notify(`Alert has been replaced with higher priority one\nOld text: ${getId('alertText').textContent}`);
            } else {
                resolve();
                Notify(`Another Alert is already active\nMissed text: ${text}`);
                return;
            }
        }

        getId('alertText').textContent = text;
        const body = document.documentElement;
        const blocker = getId('alertMain');
        const confirm = getId('alertConfirm');
        blocker.style.display = '';
        body.classList.remove('noTextSelection');
        const oldFocus = document.activeElement as HTMLElement | null;
        confirm.focus();

        const key = async(event: KeyboardEvent) => {
            const shift = detectShift(event);
            if (shift === null) { return; }
            const code = event.code;
            if (code === 'Escape' || code === 'Enter' || code === 'Space') {
                if (shift) { return; }
                close();
            } else if (code === 'Tab') {
                confirm.focus();
            } else { return; }
            event.preventDefault();
        };
        const close = () => {
            if (!globalSave.toggles[2]) { body.classList.add('noTextSelection'); }
            blocker.style.display = 'none';
            body.removeEventListener('keydown', key);
            confirm.removeEventListener('click', close);
            specialHTML.alert = [null, null];
            oldFocus?.focus();
            resolve();
        };
        specialHTML.alert = [priority, close];
        body.addEventListener('keydown', key);
        confirm.addEventListener('click', close);
    });
};

export const Confirm = async(text: string, priority = 0): Promise<boolean> => {
    return await new Promise((resolve) => {
        if (specialHTML.alert[0] !== null) {
            if (specialHTML.alert[0] < priority) {
                (specialHTML.alert[1] as () => undefined)();
                Notify(`Alert has been replaced with higher priority one\nOld text: ${getId('alertText').textContent}`);
            } else {
                resolve(false);
                Notify(`Another Alert is already active\nMissed text: ${text}`);
                return;
            }
        }

        getId('alertText').textContent = text;
        const body = document.documentElement;
        const blocker = getId('alertMain');
        const cancel = getId('alertCancel');
        const confirm = getId('alertConfirm');
        blocker.style.display = '';
        cancel.style.display = '';
        body.classList.remove('noTextSelection');
        const oldFocus = document.activeElement as HTMLElement | null;
        (globalSave.toggles[8] ? cancel : confirm).focus();

        let result = false;
        const yes = () => {
            result = true;
            close();
        };
        const key = (event: KeyboardEvent) => {
            const shift = detectShift(event);
            if (shift === null) { return; }
            const code = event.code;
            if (code === 'Escape') {
                if (shift) { return; }
                close();
            } else if (code === 'Enter' || code === 'Space') {
                if (shift || document.activeElement === cancel) { return; }
                yes();
            } else if (code === 'Tab') {
                (document.activeElement === cancel ? confirm : cancel).focus();
            } else { return; }
            event.preventDefault();
        };
        const close = () => {
            if (!globalSave.toggles[2]) { body.classList.add('noTextSelection'); }
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            body.removeEventListener('keydown', key);
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', close);
            specialHTML.alert = [null, null];
            oldFocus?.focus();
            resolve(result);
        };
        specialHTML.alert = [priority, close];
        body.addEventListener('keydown', key);
        confirm.addEventListener('click', yes);
        cancel.addEventListener('click', close);
    });
};

export const Prompt = async(text: string, placeholder = '', priority = 0): Promise<string | null> => {
    return await new Promise((resolve) => {
        if (specialHTML.alert[0] !== null) {
            if (specialHTML.alert[0] < priority) {
                (specialHTML.alert[1] as () => undefined)();
                Notify(`Alert has been replaced with higher priority one\nOld text: ${getId('alertText').textContent}`);
            } else {
                resolve(null);
                Notify(`Another Alert is already active\nMissed text: ${text}`);
                return;
            }
        }

        getId('alertText').textContent = text;
        const body = document.documentElement;
        const blocker = getId('alertMain');
        const input = getId('alertInput') as HTMLInputElement;
        const cancel = getId('alertCancel');
        const confirm = getId('alertConfirm');
        blocker.style.display = '';
        cancel.style.display = '';
        input.style.display = '';
        body.classList.remove('noTextSelection');
        input.placeholder = placeholder;
        input.value = '';
        const oldFocus = document.activeElement as HTMLElement | null;
        input.focus();

        let result: null | string = null;
        const yes = () => {
            result = input.value === '' ? input.placeholder : input.value;
            close();
        };
        const key = (event: KeyboardEvent) => {
            const shift = detectShift(event);
            if (shift === null) { return; }
            const code = event.code;
            if (code === 'Escape') {
                if (shift) { return; }
                close();
            } else if (code === 'Enter' || code === 'Space') {
                const active = document.activeElement;
                if (shift || (code === 'Space' && active === input) || active === cancel) { return; }
                yes();
            } else if (code === 'Tab') {
                const last = globalSave.toggles[8] ? confirm : cancel;
                if (shift && document.activeElement === input) {
                    last.focus();
                } else if (!shift && document.activeElement === last) {
                    input.focus();
                } else { return; }
            } else { return; }
            event.preventDefault();
        };
        const close = () => {
            if (!globalSave.toggles[2]) { body.classList.add('noTextSelection'); }
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            input.style.display = 'none';
            body.removeEventListener('keydown', key);
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', close);
            specialHTML.alert = [null, null];
            oldFocus?.focus();
            resolve(result);
        };
        specialHTML.alert = [priority, close];
        body.addEventListener('keydown', key);
        confirm.addEventListener('click', yes);
        cancel.addEventListener('click', close);
    });
};

export const Notify = (text: string) => {
    const notifications = specialHTML.notifications;

    let index;
    for (let i = 0; i < notifications.length; i++) {
        if (notifications[i][0] === text) {
            index = i;
            break;
        }
    }

    if (index === undefined) {
        let count = 1;
        let timeout: number;

        const html = document.createElement('p');
        html.textContent = text;
        html.style.animation = 'hideX 800ms ease-in-out reverse';
        html.style.pointerEvents = 'none';
        if (globalSave.SRSettings[0]) { html.role = 'alert'; }
        getId('notifications').append(html);

        const pointer = notifications[notifications.push([text, (instantClose = false) => {
            if (instantClose) {
                if (html.style.animation === '') { remove(); }
                return;
            }
            count++;
            html.textContent = `${text} | x${count}`;
            if (timeout === undefined) { return; }
            clearTimeout(timeout);
            timeout = setTimeout(remove, 7200);
        }]) - 1];
        const remove = () => {
            const index = notifications.indexOf(pointer);
            if (index !== -1) { notifications.splice(index, 1); }
            html.removeEventListener('click', clickEvent);
            html.style.animation = 'hideX 800ms ease-in-out forwards';
            html.style.pointerEvents = 'none';
            setTimeout(() => html.remove(), 800);
            clearTimeout(timeout);
        };
        const clickEvent = () => {
            if (global.hotkeys.shift) { return remove(); }
            for (let i = notifications.length - 1; i >= 0; i--) { notifications[i][1](true); }
        };
        setTimeout(() => {
            html.style.animation = '';
            html.style.pointerEvents = '';
            timeout = setTimeout(remove, 7200);
            html.addEventListener('click', clickEvent);
        }, 800);
    } else { notifications[index][1](); }
};

/** Notify about error in the code with a cooldown of 20 seconds */
export const errorNotify = (text: string) => {
    const errorCooldowns = specialHTML.errorCooldowns;
    if (errorCooldowns.includes(text)) { return; }

    Notify(text);
    errorCooldowns.push(text);
    setTimeout(() => {
        const index = errorCooldowns.indexOf(text);
        if (index !== -1) { errorCooldowns.splice(index, 1); }
    }, 2e4);
};

export const resetMinSizes = (full = true) => {
    for (let i = 1; i <= 3; i++) {
        const element = getQuery(`#special${i} > p`);
        specialHTML.cache.innerHTML.set(element, '');
        element.style.minWidth = '';
    }
    for (let i = 0; i < global.researchesInfo[player.stage.active].maxActive; i++) {
        const element = getQuery(`#research${i + 1} span`);
        specialHTML.cache.innerHTML.set(element, '');
        element.style.minWidth = '';
    }
    for (let i = 0; i < global.researchesExtraInfo[player.stage.active].maxActive; i++) {
        const element = getQuery(`#researchExtra${i + 1} span`);
        specialHTML.cache.innerHTML.set(element, '');
        element.style.minWidth = '';
    }

    if (!full) { return; }
    const mile = getId('milestonesMultiline').parentElement as HTMLElement;
    specialHTML.cache.innerHTML.set(mile, '');
    mile.style.minHeight = '';
};

export const changeFontSize = (initial = false) => {
    const input = getId('customFontSize') as HTMLInputElement;
    const size = Math.min(Math.max(initial ? globalSave.fontSize : (input.value === '' ? 16 : Math.floor(Number(input.value) * 100) / 100), 12), 24);
    if (!initial) {
        globalSave.fontSize = size;
        saveGlobalSettings();
        resetMinSizes();
    }

    document.documentElement.style.fontSize = size === 16 ? '' : `${size}px`;
    input.value = `${size}`;
    (getId('phoneStyle') as HTMLLinkElement).media = `screen and (max-width: ${893 * size / 16 + 32}px)`;
    (getId('miniPhoneStyle') as HTMLLinkElement).media = `screen and (max-width: ${362 * size / 16 + 32}px)`;
};

export const changeFormat = (point: boolean) => {
    const htmlInput = (point ? getId('decimalPoint') : getId('thousandSeparator')) as HTMLInputElement;
    let value = htmlInput.value.replace(' ', ' '); //No break space
    const allowed = ['.', '·', ',', ' ', '_', "'", '"', '`', '|'].includes(value);
    if (!allowed || globalSave.format[point ? 1 : 0] === value) {
        if (point && globalSave.format[1] === '.') {
            (getId('thousandSeparator') as HTMLInputElement).value = '';
            globalSave.format[1] = '';
        }
        value = point ? '.' : '';
        htmlInput.value = value;
    }
    globalSave.format[point ? 0 : 1] = value;
    saveGlobalSettings();
};

export const enableApril = (firstLoad = false) => {
    const active = !global.april.active;
    global.april.active = active;
    const names1U = global.upgradesInfo[1].name;
    names1U[2] = active ? 'Positrons' : 'Electrons';
    for (let i = 3; i < 9; i++) {
        if (i === 5) { continue; }
        names1U[i] = active ? `Anti${names1U[i][0].toLowerCase()}${names1U[i].slice(1)}` :
            `${names1U[i][4].toUpperCase()}${names1U[i].slice(5)}`;
    }
    specialHTML.upgradeHTML[1][2] = `UpgradeQ3${active ? '_A' : ''}.png`;
    specialHTML.upgradeHTML[1][3] = `UpgradeQ4${active ? '_A' : ''}.png`;
    for (const ID of getClass('newAntiName')) {
        const current = ID.textContent as string;
        ID.textContent = active ? `Anti${current[0].toLowerCase()}${current.slice(1)}` :
            `${current[4].toUpperCase()}${current.slice(5)}`;
    }
    const names4U = global.upgradesInfo[4].name;
    names4U[1] = `${active ? 'Antiproton-Antiproton' : 'Proton-Proton'} chain`;
    names4U[2] = `${active ? 'Anticarbon-Antinitrogen-Antioxygen' : 'Carbon-Nitrogen-Oxygen'} cycle`;
    names4U[3] = `${active ? 'Antihelium' : 'Helium'} fusion`;
    names4U[5] = `${active ? 'Antiproton' : 'Proton'} capture`;
    global.researchesInfo[1].name[0] = `Stronger ${names1U[6]}`;
    global.researchesInfo[1].name[1] = `Better ${names1U[7]}`;
    global.researchesInfo[1].name[2] = `Improved ${names1U[8]}`;
    const namesE = global.elementsInfo.name;
    for (let i = 0; i < namesE.length; i++) {
        const index = namesE[i].indexOf(' ') + 1;
        namesE[i] = active ? `${namesE[i].slice(0, index)}Anti${namesE[i][index].toLowerCase()}${namesE[i].slice(index + 1)}` :
            `${namesE[i].slice(0, index)}${namesE[i][index + 4].toUpperCase()}${namesE[i].slice(index + 5)}`;
        (getId(`element${i}`) as HTMLInputElement).alt = namesE[i];
    }
    global.strangenessInfo[4].name[8] = active ? 'Antineutronium' : 'Neutronium';
    global.challengesInfo[0].rewardText[0][4][2] = `'${global.strangenessInfo[4].name[8]}' (Interstellar)`;
    (getQuery('#strange9Stage4 > input') as HTMLInputElement).alt = global.strangenessInfo[4].name[8];

    if (firstLoad) { return; }
    if (!active) {
        if (global.april.ultravoid === false) { toggleChallengeType(true); }
        if (global.april.quantum) {
            global.april.quantum = false;
            global.challengesInfo[1].name = 'Vacuum stability';
        }
        if (global.april.light) { enableLightness(); }
    }
    stageUpdate();
    global.offline.cacheUpdate = false;
    preventImageUnload();
};
export const enableLightness = () => {
    const active = !global.april.light;
    global.april.light = active;
    const Light = active ? 'Light' : 'Dark';
    const Dark = active ? 'Dark' : 'Light';
    for (const ID of getClass('newLightName')) { ID.textContent = Light; }
    const nameS6 = global.buildingsInfo.name[6];
    for (let i = 0; i < nameS6.length; i++) { nameS6[i] = nameS6[i].replace(Dark, Light); }
    for (const type of ['upgradesInfo', 'researchesInfo', 'researchesExtraInfo'] as const) {
        const names = global[type][6].name;
        for (let i = 0; i < names.length; i++) {
            names[i] = names[i].replace(Dark, Light);
        }
    }
    global.upgradesInfo[6].name[0] = global.upgradesInfo[6].name[0].replace(Dark, Light);
    global.researchesInfo[6].name[0] = global.researchesInfo[6].name[0].replace(Dark, Light);
    global.buildingsInfo.hoverText[6][0] = `${nameS6[0]} softcap`;
    global.stageInfo.costName[6] = nameS6[0];

    specialHTML.researchExtraDivHTML[6][2] = `${Light} energy`;
    getQuery('#verse0 > div > p:last-of-type').dataset.title = nameS6[0];
    getId('energyGainStage6').ariaLabel = `${Light} energy gain`;
    const darknessInfo = global.challengesInfo[2];
    darknessInfo.name = active ? 'Lightness' : 'Darkness';
    for (let i = 0; i < darknessInfo.rewardText.length; i++) {
        darknessInfo.rewardText[i] = darknessInfo.rewardText[i].replace(Dark, Light);
    }
    (getId('challenge3') as HTMLInputElement).alt = darknessInfo.name;
    global.strangenessInfo[6].name[3] = darknessInfo.name;
    (getId('strange4Stage6') as HTMLInputElement).alt = darknessInfo.name;
    specialHTML.buildingHTML[6][0] = `${Light}%20planet.png`;
    specialHTML.footerStatsHTML[6][0][0] = `${Light}%20matter.png`;
    (getQuery('#globalStat5 img') as HTMLImageElement).src = `Used_art/${specialHTML.footerStatsHTML[6][0][0]}`;
    specialHTML.upgradeHTML[6][0] = `UpgradeD1${active ? '_L' : ''}.png`;
    specialHTML.researchHTML[6][0][0] = `ResearchD1${active ? '_L' : ''}.png`;
    specialHTML.researchHTML[6][2][0] = `ResearchD3${active ? '_L' : ''}.png`;
    specialHTML.researchExtraHTML[6][0][0] = `ResearchDark1${active ? '_L' : ''}.png`;
    specialHTML.researchExtraHTML[6][3][0] = `ResearchDark4${active ? '_L' : ''}.png`;

    stageUpdate();
    global.offline.cacheUpdate = false;
    preventImageUnload();
};
export const enterUltravoid = () => {
    global.april.ultravoid = true;
    const lastSave = global.lastSave;
    const currentSave = deepClone(player);

    prepareVacuum(false); //Set buildings values
    updatePlayer(deepClone(playerStart));
    stageUpdate(true, true);
    setTimeout(() => {
        if (specialHTML.alert[0] !== null) { (specialHTML.alert[1] as () => undefined)(); }
        global.lastSave = lastSave;
        enableApril();
        updatePlayer(currentSave);
        stageUpdate(true, true);
        Notify('Must have been a bad dream');
    }, 30_000);
};
export const enterQuantum = () => {
    pauseGame();
    const html = document.documentElement;
    html.style.backgroundColor = 'black';
    getId('body').style.display = 'none';
    getId('notifications').style.display = 'none';
    setTimeout(() => {
        const cache: Record<string, Array<[string, () => any]>> = {};
        const query = (which: string): HTMLElement => {
            cache[which] ??= [];
            return getQuery(which);
        };
        const addEvent = (which: string, eventType: string, event: (...any: any) => any) => {
            const addTo = query(which);
            cache[which].push([eventType, event]);
            addTo.addEventListener(eventType, event);
        };
        const styleSheet = document.createElement('style');

        const oldTheme = globalSave.theme;
        let timeoutID: undefined | number;
        const main = document.createElement('div');
        main.id = 'quantum';
        main.innerHTML = '<input type="image" src="Used_art/False%20vacuum.png" alt="Exit" draggable="false" id="leaveQuantum" class="interactiveImage" style="opacity: 0;">';
        main.className = 'insideTab';
        styleSheet.textContent = '#leaveQuantum { width: 48px; height: 48px; transition: opacity 30s; cursor: help; }';
        document.body.append(main);
        document.head.append(styleSheet);
        query('#leaveQuantum').addEventListener('click', () => {
            clearTimeout(timeoutID);
            for (const remove in cache) {
                const pointer = cache[remove];
                if (pointer.length > 0) {
                    const element = getQuery(remove);
                    for (let i = 0; i < pointer.length; i++) {
                        element.removeEventListener(pointer[i][0], pointer[i][1]);
                    }
                }
                specialHTML.cache.queryMap.delete(remove);
            }
            main.remove();
            styleSheet.remove();
            html.style.backgroundColor = '';
            getId('body').style.display = '';
            getId('notifications').style.display = '';
            global.hotkeys.disabled = false;
            globalSave.theme = oldTheme;
            setTheme();
            pauseGame(false);
        }, { once: true });
        timeoutID = setTimeout(() => {
            query('#leaveQuantum').style.opacity = '';
            timeoutID = setTimeout(() => {
                styleSheet.textContent += 'html { transition-duration: 120s; }';
                html.style.background = '#041004';
                timeoutID = setTimeout(() => {
                    globalSave.theme = -1;
                    setTheme();

                    const button = document.createElement('button');
                    button.textContent = 'Quantize';
                    button.type = 'button';
                    button.id = 'quantize';
                    button.style.opacity = '0';
                    main.append(button);
                    styleSheet.textContent += '#quantize { width: 8em; transition: opacity 30s; }';
                    setTimeout(() => (button.style.opacity = ''), 0);
                    addEvent('#quantize', 'click', () => {
                        getId('notifications').style.display = '';
                        Notify('Work in progress, return later');
                    });
                }, 120_000);
            }, 30_000);
        }, 4_000);
    }, 6_000);
};

export const MDStrangenessPage = (stageIndex: number) => {
    getId(`strangenessSection${global.debug.MDStrangePage}`).style.display = 'none';
    getId(`strangenessSection${stageIndex}`).style.display = '';
    global.debug.MDStrangePage = stageIndex;
};

export const checkProgress = () => {
    progressMain();

    const universes = player.inflation.vacuum ? player.verses[0].true : player.verses[0].other[2];
    if (universes > player.progress.universe) { player.progress.universe = universes; }
    const index = player.inflation.vacuum ? 1 : 0;
    for (let i = player.progress.element[index] + 1; i < global.elementsInfo.maxActive; i++) {
        if (player.elements[i] === 0) { break; }
        player.progress.element[index] = i;
    }
    for (let i = player.progress.results; i < 1; i++) {
        if (player.merge.rewards[i] < 1) { break; }
        player.progress.results = i + 1;
    }
};
const progressMain = () => {
    const progress = player.progress.main;
    if (progress >= 24 || global.offline.active) { return; }
    if (player.inflation.ends[1] >= 1) { return progressUp(24); }
    if (progress >= 23) { return; }
    if (player.darkness.energy >= 1000) { return progressUp(23, 12); }
    if (progress >= 22) { return; }
    if (player.verses[0].true >= 5) { return progressUp(22, 11); }
    if (progress >= 21) { return; }
    if (player.inflation.ends[0] >= 1) { return progressUp(21); }
    if (progress >= 20) { return; }
    if (player.inflation.vacuum) {
        if (player.verses[0].total >= 1) { return progressUp(20, 10); }
        if (progress >= 18) { return; }
        if (player.merge.resets >= 1) { return progressUp(18, 8); }
        if (progress >= 17) { return; }
        if (player.stage.resets >= 1) { return progressUp(17, 7); }
        if (progress >= 16) { return; }
        if (player.stage.current >= 5) { return progressUp(16); }
        if (progress >= 15) { return; }
        progressUp(15, 6);
    } else if (progress < 19) {
        if (player.verses[0].total >= 1) { return progressUp(19, 9); }
        if (progress >= 14) { return; }
        if (player.stage.resets >= 7) { return progressUp(14); }
        if (progress >= 13) { return; }
        if (player.stage.resets >= 6) { return progressUp(13); }
        if (progress >= 12) { return; }
        if (player.stage.resets >= 5) { return progressUp(12); }
        if (progress >= 11) { return; }
        if (player.stage.resets >= 4) { return progressUp(11); }
        if (progress >= 10) { return; }
        if (player.stage.active >= 5) { return progressUp(10, 5); }
        if (progress >= 9) { return; }
        if (player.stage.current >= 5) { return progressUp(9); }
        if (progress >= 8) { return; }
        if (player.collapse.stars[1] >= 1) { return progressUp(8, 4); }
        if (progress >= 7) { return; }
        if (player.stage.current >= 4) { return progressUp(7); }
        if (progress >= 6) { return; }
        if (player.buildings[3][0].current.moreOrEqual(5e29)) { return progressUp(6, 3); }
        if (progress >= 5) { return; }
        if (player.stage.current >= 3) { return progressUp(5); }
        if (progress >= 4) { return; }
        if (assignResetInformation.newClouds() + player.vaporization.clouds > 1e4) { return progressUp(4, 2); }
        if (progress >= 3) { return; }
        if (player.stage.current >= 2) { return progressUp(3); }
        if (progress >= 2) { return; }
        if (player.upgrades[1][9] === 1) { return progressUp(2, 1); }
        if (progress >= 1) { return; }
        if (player.buildings[1][1].true >= 12) { progressUp(1); }
    }
};
const progressUp = (newValue: number, event = null as null | number) => {
    const old = player.progress.main;
    player.progress.main = newValue;
    if (event !== null) { playEvent(event, false); }
    if (old < 6 && newValue >= 6) {
        assignResetInformation.maxRank();
        global.debug.rankUpdated = null;
    }
    visualProgressUnlocks();
    if (global.tabs.current === 'stage') {
        if (old < 15 && newValue >= 15) { switchTab(); }
    } else if (global.tabs.current === 'strangeness') {
        if (old < 20 && newValue >= 20) { switchTab(); }
    } else if (global.tabs.current === 'settings') {
        if (old < 17 && (newValue >= 17 || (old < 11 && newValue >= 11))) { switchTab(); }
    }
    if (old < 25 && (newValue >= 25 || (old < 17 && (newValue >= 18 || (old < 10 && (newValue >= 10 || old < 1)))))) {
        stageUpdate(old < 1);
    } else if (old === 17) {
        setTimeout(() => {
            setActiveStage(6, player.stage.active);
            stageUpdate();
        });
    }
    if (globalSave.developerMode) { Notify(`Game progress had increased to ${newValue}`); }
};

export const replayEvent = async() => {
    const progress = player.progress.main;
    const last = progress >= 23 ? 12 :
        progress >= 22 ? 11 :
        progress >= 20 ? 10 :
        progress >= 19 ? 9 :
        progress >= 18 ? 8 :
        progress >= 17 ? 7 :
        progress >= 15 ? 6 :
        progress >= 10 ? 5 :
        progress >= 8 ? 4 :
        progress >= 6 ? 3 :
        progress >= 4 ? 2 :
        progress >= 2 ? 1 : 0;
    if (last < 1) { return void Alert('There are no unlocked events'); }

    let text = 'Which event do you want to see again?\nEvent 1: Stage reset';
    if (last >= 2) { text += '\nEvent 2: Clouds softcap'; }
    if (last >= 3) { text += '\nEvent 3: New Rank'; }
    if (last >= 4) { text += '\nEvent 4: New Elements'; }
    if (last >= 5) { text += '\nEvent 5: Intergalactic'; }
    if (last >= 6) { text += '\nEvent 6: True Vacuum'; }
    if (last >= 7) { text += '\nEvent 7: Void unlocked'; }
    if (last >= 8) { text += '\nEvent 8: First Merge'; }
    if (last >= 9) { text += '\nEvent 9: Inflation'; }
    if (last >= 10) { text += '\nEvent 10: Universal End'; }
    if (last >= 11) { text += '\nEvent 11: Stability unlocked'; }
    if (last >= 12) { text += '\nEvent 12: Better End'; }

    const event = Number(await Prompt(text, `${last}`));
    if (event <= 0 || !isFinite(event)) { return; }
    if (event > last) { return void Alert('That event is not unlocked'); }
    playEvent(event);
};

/** Sets player.event to true if replay is false */
const playEvent = (event: number, replay = true) => {
    let text = 'No such event.';
    if (event === 1) {
        text = 'A new reset tier has been unlocked. It will allow the creation of higher tier Structures, but for the price of everything else.';
    } else if (event === 2) {
        text = `Cloud density is too high... Any new Clouds past ${format(1e4)} will be weaker due to the softcap.`;
    } else if (event === 3) {
        text = 'Cannot gain any more Mass with the current Rank. A new one has been unlocked, but reaching it will softcap the Mass production.';
    } else if (event === 4) {
        text = 'That last explosion not only created the first Neutron stars, but also unlocked new Elements through Supernova nucleosynthesis.';
    } else if (event === 5) {
        text = `There are no Structures in Intergalactic yet, but knowledge for their creation can be found within the previous Stages. Stage resets and exports will now award Strange quarks, and '${global.elementsInfo.name[26]}' will improve Stage reset reward based on total produced Stardust.\n(Intergalactic Stars are combined Interstellar Stars. Export rewards are based on highest reset value, that stored value will decrease by claimed amount)`;
    } else if (event === 6) {
        text = 'As Galaxies began to Merge, their combined Gravity pushed Vacuum out of its local minimum into a more stable global minimum. New forces and Structures are expected within this new and true Vacuum state.';
    } else if (event === 7) {
        text = "With Vacuum decaying, the remaining matter had rearranged itself, which had lead to the formation of the very first Challenge ‒ 'Void'. Check it out in the 'Advanced' subtab.\n(There is no reason to stay inside Challenges past time limit)";
    } else if (event === 8) {
        text = "As Galaxies began to Merge, their combined Gravity started forming an even bigger Structure ‒ 'Universe'. Will need to maximize Galaxies before every Merge to get enough Score to create it.\n(Merge reset can only be done a limited amount of times per Stage reset)";
    } else if (event === 9) {
        text = "Now that current Universe is finished, it's time to Inflate a new one and so to unlock the 'Inflation' tab.\n(Universes only use specialized hotkeys. Also 'Nucleosynthesis' unlocks more Elements based on self-made Universes)";
    } else if (event === 10) {
        text = "Unlocked ability to End current Universes through basic End reset ‒ 'Big Crunch', also unlocked harder version of Void ‒ 'Supervoid' which is immune to End resets.\n(Will need to click the 'Void' button to toggle into Supervoid. End reset reward base will be increased by +1 if inside true Vacuum)";
    } else if (event === 11) {
        text = "After so many Universe resets, false Vacuum had became at the same time more and less stable, this had unlocked a new Challenge ‒ 'Vacuum stability'.";
    } else if (event === 12) {
        text = `${format(1000)} ${global.april.light ? 'Light' : 'Dark'} energy allows to do a more advanced End reset ‒ 'Big Rip', this one just adds non-self-made Universes into Cosmons gain base.\n(Doing it for the first time will also unlock new Inflation and ability to create new types of self-made Universes)`;
    }
    if (!replay) {
        text += "\n\n(Can be viewed again with 'Events' button in Settings tab)";
        if (specialHTML.alert[0] !== null) { return Notify(`Wasn't able to show event ${event}, event text:\n${text}`); }
    }
    return void Alert(text);
};

const buildBigWindow = (subWindow: string): null | HTMLElement => {
    if (getId('closeBigWindow', true) === null) {
        getId('bigWindow').innerHTML = '<article role="dialog" aria-modal="false"><button type="button" id="closeBigWindow">Close</button></article>';
        specialHTML.styleSheet.textContent += `#bigWindow > article { display: flex; flex-direction: column; align-items: center; width: 38rem; max-width: 80vw; height: 42rem; max-height: 90vh; background-color: var(--window-color); border: 3px solid var(--window-border); border-radius: 12px; padding: 1em 1em 0.8em; row-gap: 1em; }
            #bigWindow > article > button { flex-shrink: 0; border-radius: 4px; width: 6em; font-size: 0.92em; }
            #bigWindow > article > div { width: 100%; height: 100%; overflow-y: auto; overscroll-behavior-y: none; } `;
    }

    if (getId(subWindow, true) !== null) { return null; }
    const mainHTML = document.createElement('div');
    getQuery('#bigWindow > article').prepend(mainHTML);
    mainHTML.id = subWindow;
    return mainHTML;
};
const addCloseEvents = (sectionHTML: HTMLElement, firstTargetHTML = null as HTMLElement | null) => {
    const body = document.documentElement;
    const closeButton = getId('closeBigWindow');
    const windowHMTL = getId('bigWindow');
    if (firstTargetHTML === null) { firstTargetHTML = closeButton; }
    const key = (event: KeyboardEvent) => {
        if (specialHTML.alert[0] !== null || detectShift(event) !== false) { return; }
        const code = event.code;
        if (firstTargetHTML === closeButton ? (code === 'Escape' || code === 'Enter' || code === 'Space') :
            ((!global.hotkeys.disabled && code === 'Escape') || ((code === 'Enter' || code === 'Space') && document.activeElement === closeButton))) {
            event.preventDefault();
            close();
        }
    };
    const close = () => {
        specialHTML.bigWindow = null;
        windowHMTL.style.display = 'none';
        sectionHTML.style.display = 'none';
        body.removeEventListener('keydown', key);
        closeButton.removeEventListener('click', close);
    };
    body.addEventListener('keydown', key);
    closeButton.addEventListener('click', close);
    sectionHTML.style.display = '';
    windowHMTL.style.display = '';
    firstTargetHTML.focus();
};

export const openVersionInfo = () => {
    if (specialHTML.bigWindow !== null) { return; }
    const mainHTML = buildBigWindow('versionHTML');
    if (mainHTML !== null) {
        mainHTML.innerHTML = `${global.lastUpdate !== null ? `<h5><span class="bigWord">Last update:</span> <span class="whiteText">${new Date(global.lastUpdate).toLocaleString()}</span></h5><br>` : ''}
        <h6>v0.2.8</h6><p>- Abyss full rebalance and End reset rework\n- Auto Stage now has different modes\n- Max export rewards is now 12 hours\n- Removed log\n<a href="https://docs.google.com/document/d/1HsAhoa31UsRFGK3BULeXMKHN9exUIIQ_UveKwj2EuMY/edit?usp=sharing" target="_blank" rel="noopener noreferrer">Full changelog</a></p>
        <h6>v0.2.7</h6><p>- Small speed up to Universes\n- Stage resets now save peak Strange quarks</p>
        <h6>v0.2.6</h6><p>- New content (End)\n- Mobile shorcuts are now available outside of related support\n- Ability to change number hotkeys and use numbers for other hotkeys\n- Create all Upgrades button\n- Improved hover text\n\n- Added hotkeys for toggling autos</p>
        <h6>v0.2.5</h6><p>- Abyss rework\n- New (second) Challenge\n- Global footer stats\n- Small visual improvements\n- Improved swiping hotkeys for Phones</p>
        <h6>v0.2.4</h6><p>- Offline ticks are now as effective as Online\n- Inflation loadouts\n\n- Added the log\n- Minor Strangeness rebalance</p>
        <h6>v0.2.3</h6><p>- Supervoid rework\n- Abyss small rebalance</p>
        <h6>v0.2.2</h6><p>- New content (Supervoid)\n- Entering Void now saves the game to load it after exiting</p>
        <h6>v0.2.1</h6><p>- New content (Abyss)\n- Full game rebalance\n- Custom hotkeys\n- Updated supports\n- Many small changes and additions</p>
        <h6>v0.2.0</h6><p>- Reworked balance for all Stages past first reset cycle\n- Many quality of life additions\n- Most of settings are now saved separate from save file\n- Some more work on Mobile device support</p>
        <h6>v0.1.9</h6><p>- More true Vacuum balance\n- Reworked time related formats\n- Offline time reworked</p>
        <h6>v0.1.8</h6><p>- True Vacuum small balance changes\n- Upgrades and Researches merged\n- Copy to the clipboard, load from string save file options</p>
        <h6>v0.1.7</h6><p>- New content (Void)\n- Further balance changes</p>
        <h6>v0.1.6</h6><p>- Massive rebalance and reworks for all Stages</p>
        <h6>v0.1.5</h6><p>- True Vacuum minor balance\n- Images no longer unload\n- Screen reader support reworked</p>
        <h6>v0.1.4</h6><p>- Custom scrolls\n- Notifications</p>
        <h6>v0.1.3</h6><p>- True Vacuum balance changes\n- Submerged Stage minor balance\n- Replay event button\n\n- History for Stage resets</p>
        <h6>v0.1.2</h6><p>- New content (Vacuum)\n- Version window\n- Permanently removed text movement</p>
        <h6>v0.1.1</h6><p>- More balance changes for late game</p>
        <h6>v0.1.0</h6><p>- New content (Intergalactic)\n- Balance changes for late game</p>
        <h6>v0.0.9</h6><p>- New content (Milestones)\n- More Interstellar and late game balance</p>
        <h6>v0.0.8</h6><p>- Minor speed up to all Stages past Microworld</p>
        <h6>v0.0.7</h6><p>- New content (Strangeness)\n- Microworld Stage rework\n\n- Stats for the Save file name</p>
        <h6>v0.0.6</h6><p>- Added hotkeys list\n\n- Option to remove text movement\n- Ability to rename the save file</p>
        <h6>v0.0.5</h6><p>- New content (Interstellar)\n- Basic loading screen\n\n- Added hotkeys</p>
        <h6>v0.0.4</h6><p>- Speed up to all Stages\n- Basic events\n\n- Added numbers format</p>
        <h6>v0.0.3</h6><p>- New content (Accretion)\n- Submerged Stage extended</p>
        <h6>v0.0.2</h6><p>- Stats subtab</p>
        <h6>v0.0.1</h6><p>- Submerged Stage rework\n\n- Mobile device support</p>
        <h6>v0.0.0</h6><p>- First published version\n\n- Submerged Stage placeholder</p>`;
        specialHTML.styleSheet.textContent += `#versionHTML h6 { font-size: 1.18em; }
            #versionHTML p { line-height: 1.3em; white-space: pre-line; color: var(--white-text); margin-top: 0.2em; margin-bottom: 1.4em; }
            #versionHTML p:last-of-type { margin-bottom: 0; } `;
    }

    specialHTML.bigWindow = 'version';
    addCloseEvents(getId('versionHTML'));
    getQuery('#bigWindow > article').ariaLabel = 'Versions menu';
};

export const openHotkeys = () => {
    if (specialHTML.bigWindow !== null) { return; }
    const mainHTML = buildBigWindow('hotkeysHTML');
    if (mainHTML !== null) {
        mainHTML.innerHTML = `<h3 id="hotkeysMessage" class="bigWord" aria-live="assertive">Highlighted hotkeys can be modified</h3>
        ${globalSave.MDSettings[0] ? `<p>Left or Right swipe ‒ <span class="whiteText">change current tab</span></p>
        <p>Diagonal Down or Up swipe ‒ <span class="whiteText">change current subtab</span></p>
        <p id="stageSwipe">Long Left or Right swipe ‒ <span class="whiteText">change current active Stage</span></p>` : ''}
        <label id="tabRightHotkey"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">change tab to the next one</span></label>
        <label id="tabLeftHotkey"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">change tab to the previous one</span></label>
        <label id="subtabUpHotkey"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">change subtab to the next one</span></label>
        <label id="subtabDownHotkey"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">change subtab to the previous one</span></label>
        <label id="stageRightHotkey"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">change active Stage to the next one</span></label>
        <label id="stageLeftHotkey"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">change active Stage to the previous one</span></label>
        <label id="makeStructureHotkey"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">make a Structure</span></label>
        <p id="makeAllHotkey"><span></span> <span class="whiteText">or</span> <label><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">make all Structures</span></label></p>
        <label id="enterChallengeHotkey"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">enter the Challenge</span></label>
        <p id="exitChallengeHotkey"><span></span> <span class="whiteText">or</span> <label><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">exit out of the current Challenge</span></label></p>
        <div>
            <label id="createAllHotkey"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Upgrades</span></label>
            <label id="dischargeHotkey" class="orangeText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Discharge</span></label>
            <label id="vaporizationHotkey" class="blueText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Vaporization</span></label>
            <label id="rankHotkey" class="darkorchidText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Rank</span></label>
            <label id="collapseHotkey" class="orchidText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Collapse</span></label>
            <label id="galaxyHotkey" class="grayText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Galaxy</span></label>
            <label id="mergeHotkey" class="darkvioletText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Merge</span></label>
            <label id="nucleationHotkey" class="orangeText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Nucleation</span></label>
            <label id="stageHotkey" class="stageText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Stage</span></label>
            <label id="versesHotkey" class="darkvioletText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Verses</span></label>
            <label id="endHotkey" class="redText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">End</span></label>
            <label id="warpHotkey" class="blueText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Warp</span></label>
            <label id="pauseHotkey" class="grayText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">pause</span></label>
        </div>
        <p>Enter <span class="whiteText">or</span> Space ‒ <span class="whiteText">click selected HTML Element or confirm Alert</span></p>
        <p>Escape ‒ <span class="whiteText">cancel changing the hotkey, close Alert or Notification</span></p>
        <p>Tab <span class="whiteText">and</span> Shift Tab ‒ <span class="whiteText">select another HTML Element</span></p>
        <p id="autoTogglesHeader" class="bigWord">Auto toggles</p>
        <label id="toggleStructureHotkey"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">toggle auto Structure</span></label>
        <p id="toggleAllHotkey"><span></span> <span class="whiteText">or</span> <label><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">toggle all auto Structures</span></label></p>
        <div>
            <label id="toggleUpgradesHotkey"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Upgrades</span></label>
            <label id="toggleDischargeHotkey" class="orangeText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Discharge</span></label>
            <label id="toggleVaporizationHotkey" class="blueText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Vaporization</span></label>
            <label id="toggleRankHotkey" class="darkorchidText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Rank</span></label>
            <label id="toggleCollapseHotkey" class="orchidText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Collapse</span></label>
            <label id="toggleMergeHotkey" class="darkvioletText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Merge</span></label>
            <label id="toggleNucleationHotkey" class="orangeText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Nucleation</span></label>
            <label id="toggleStageHotkey" class="stageText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Stage</span></label>
            <label id="supervoidHotkey" class="darkvioletText"><button type="button" class="selectBtn"></button> ‒ <span class="whiteText">Void type</span></label>
        </div>
        <p>Holding Enter on last selected button will repeatedly press it, also works with Mouse and Touch events on some buttons</p>
        <p>Shift clicking the hotkey will set it to the default value or remove it</p>
        <p>Numlock being ON can break Numpad hotkeys</p>
        <label id="hotkeysToggleLabel" title="Turn ON, if using non-QWERTY layout keyboard">Language dependant hotkeys </label>
        <button type="button" id="restoreHotkeys" class="selectBtn">Restore default hotkeys values</button>`; //Spacebar at the end of label is required
        const toggle = getId('globalToggle0');
        getId('hotkeysToggleLabel').append(toggle);
        toggle.style.display = '';
        specialHTML.styleSheet.textContent += `#hotkeysHTML { display: flex; flex-direction: column; align-items: center; row-gap: 0.2em; }
            #hotkeysHTML > div { display: grid; grid-template-columns: 1fr 1fr 1fr; width: 100%; gap: 0.3em; }
            #hotkeysHTML > div label { justify-self: center; width: max-content; } `;

        const changeHotkey = async(number: boolean): Promise<string | string[] | null> => {
            return await new Promise((resolve) => {
                getId('hotkeysMessage').textContent = 'Awaiting new value for the hotkey';
                const body = document.documentElement;
                let result: null | string | string[] = null;
                const detect = async(event: KeyboardEvent) => {
                    const { key, code } = event;
                    if (code === 'Tab' || code === 'Enter' || code === 'Space') { return; }
                    event.preventDefault();
                    if (code === 'Escape') { return finish(); }
                    if (key === 'Control' || key === 'Shift' || key === 'Alt') { return; }
                    if (key === 'Meta' || event.metaKey) {
                        getId('hotkeysMessage').textContent = "Meta isn't allowed";
                        return;
                    }
                    let prefix = event.ctrlKey ? 'Ctrl ' : '';
                    if (event.shiftKey) { prefix += 'Shift '; }
                    if (event.altKey) { prefix += 'Alt '; }
                    if (number) {
                        if (code.includes('Digit') || code.includes('Numpad')) {
                            result = prefix + (code.includes('Numpad') ? 'Numpad' : 'Numbers');
                        } else {
                            getId('hotkeysMessage').textContent = 'Only numbers can be used here';
                            return;
                        }
                    } else {
                        if (code.includes('Digit') || code.includes('Numpad')) {
                            const converted = prefix + code.replace('Digit', '').replace('Numpad', 'Num ');
                            result = [converted, converted];
                        } else {
                            result = [key.length === 1 ? key.toUpperCase() : key.replaceAll(/([A-Z]+)/g, ' $1').trimStart(),
                                key.length === 1 ? code.replace('Key', '') : code.replaceAll(/([A-Z]+)/g, ' $1').trimStart()];
                            if (result[0] !== '') {
                                result[0] = prefix + result[0];
                            } else { result[0] = 'None'; }
                            if (result[1] !== '') {
                                result[1] = prefix + result[1];
                            } else { result[1] = 'None'; }
                        }
                    }
                    finish();
                };
                const clickClose = () => {
                    global.hotkeys.disabled = false;
                    finish(false);
                };
                const finish = (keyboard = true) => {
                    body.removeEventListener('keydown', detect);
                    body.removeEventListener('click', clickClose, { capture: true });
                    if (keyboard) {
                        body.addEventListener('keyup', () => { global.hotkeys.disabled = false; }, { once: true });
                    }
                    resolve(result);
                };
                global.hotkeys.disabled = true;
                body.addEventListener('keydown', detect);
                body.addEventListener('click', clickClose, { capture: true });
            });
        };
        const index = globalSave.toggles[0] ? 0 : 1;
        for (const key in globalSaveStart.hotkeys) {
            const button = getQuery(`#${key}Hotkey button`);
            button.textContent = globalSave.hotkeys[key as hotkeysList][index];
            button.addEventListener('click', async(event) => {
                const index = globalSave.toggles[0] ? 0 : 1;
                let newHotkey: string[] | null;
                if (event.shiftKey) {
                    newHotkey = removeHotkey(globalSave.hotkeys[key as hotkeysList][index]) === null ?
                        cloneArray(globalSaveStart.hotkeys[key as hotkeysList]) :
                        newHotkey = globalSave.hotkeys[key as hotkeysList];
                } else {
                    button.style.borderBottomStyle = 'dashed';
                    newHotkey = await changeHotkey(false) as string[];
                    button.style.borderBottomStyle = '';
                    getId('hotkeysMessage').textContent = 'Highlighted hotkeys can be modified';
                    if (newHotkey === null) { return; }
                }
                const removed = removeHotkey(newHotkey[index]) as hotkeysList;
                if (globalSaveStart.hotkeys[removed] !== undefined) { getQuery(`#${removed}Hotkey button`).textContent = 'None'; }
                button.textContent = newHotkey[index];
                globalSave.hotkeys[key as hotkeysList] = newHotkey;
                button.textContent = newHotkey[index];
                assignHotkeys();
                saveGlobalSettings();
            });
        }
        /** Actual type is Record<numbersList, string> */
        const extraHotkeyName: Record<string, string> = {
            makeStructure: 'makeAll',
            toggleStructure: 'toggleAll',
            enterChallenge: 'exitChallenge'
        };
        for (const key in globalSaveStart.numbers) {
            const button = getQuery(`#${key}Hotkey button`);
            button.textContent = globalSave.numbers[key as numbersList];
            getQuery(`#${extraHotkeyName[key]}Hotkey span`).textContent = globalSave.numbers[key as numbersList].replace('Numbers', '0').replace('Numpad', 'Num 0');
            button.addEventListener('click', async(event) => {
                let newHotkey: string | null;
                if (event.shiftKey) {
                    newHotkey = removeHotkey(globalSave.numbers[key as numbersList], true) === null ?
                        globalSaveStart.numbers[key as numbersList] :
                        globalSave.numbers[key as numbersList];
                } else {
                    button.style.borderBottomStyle = 'dashed';
                    newHotkey = await changeHotkey(true) as string;
                    button.style.borderBottomStyle = '';
                    getId('hotkeysMessage').textContent = 'Highlighted hotkeys can be modified';
                    if (newHotkey === null) { return; }
                }
                const removed = removeHotkey(newHotkey, true) as numbersList;
                if (extraHotkeyName[removed] !== undefined) {
                    getQuery(`#${removed}Hotkey button`).textContent = 'None';
                    getQuery(`#${extraHotkeyName[removed]}Hotkey span`).textContent = 'None';
                }
                button.textContent = newHotkey;
                getQuery(`#${extraHotkeyName[key]}Hotkey span`).textContent = newHotkey.replace('Numbers', '0').replace('Numpad', 'Num 0');
                globalSave.numbers[key as numbersList] = newHotkey;
                assignHotkeys();
                saveGlobalSettings();
            });
        }
        getId('restoreHotkeys').addEventListener('click', () => {
            globalSave.hotkeys = deepClone(globalSaveStart.hotkeys);
            globalSave.numbers = deepClone(globalSaveStart.numbers);
            const index = globalSave.toggles[0] ? 0 : 1;
            for (const key in globalSave.hotkeys) { getQuery(`#${key}Hotkey button`).textContent = globalSave.hotkeys[key as hotkeysList][index]; }
            for (const key in globalSave.numbers) {
                const value = globalSave.numbers[key as numbersList];
                getQuery(`#${key}Hotkey button`).textContent = value;
                getQuery(`#${extraHotkeyName[key]}Hotkey span`).textContent = value.replace('Numbers', '0').replace('Numpad', 'Num 0');
            }
            assignHotkeys();
            saveGlobalSettings();
        });
    }

    specialHTML.bigWindow = 'hotkeys';
    addCloseEvents(getId('hotkeysHTML'), getQuery('#tabRightHotkey button'));
    getQuery('#bigWindow > article').ariaLabel = 'Hotkeys menu';
    visualProgressUnlocks();
    visualUpdate();
};

export const cheatStrangeQuarks = () => {
    if (player.strange[0].current <= 0) { 
        player.strange[0].current = 10;
        player.strange[0].total = 10;
    } else {
        player.strange[0].current *= 10;
        player.strange[0].total *= 10;
    }
    numbersUpdate();
    visualUpdate();
};

export const cheatInflations = () => {
    if (player.cosmon[0].current <= 0) { 
        player.cosmon[0].current = 10;
        player.cosmon[0].total = 10;
    } else {
        player.cosmon[0].current *= 10;
        player.cosmon[0].total *= 10;
    }
    numbersUpdate();
    visualUpdate();
};

export const cheatCosmons = () => {
    if (player.cosmon[1].current <= 0) { 
        player.cosmon[1].current = 10;
        player.cosmon[1].total = 10;
    } else {
        player.cosmon[1].current *= 10;
        player.cosmon[1].total *= 10;
    }
    numbersUpdate();
    visualUpdate();
};