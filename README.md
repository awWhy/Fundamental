# Fundamental Mod Test 
#### (original version v0.2.8)
Original can be played at 'https://awwhy.github.io/Fundamental/' \
If you want to report a bug (here or on discord), try to give details on how it happened and screenshot of any errors in console (Errors look like small wall of red text, as example: Uncaught TypeError: Cannot read properties of null (reading '0')). Probably would be an error in the mod.

#### Should be supported by:
1. Modern browsers,
2. Mobile devices,
3. Screen readers

---
### If you plan do anything with this, then you need to:
#### `npm install` - This will install everything that was used in here.
#### Keep in mind it will install latest version of dependencies, so something might break.
---

## Special NPM commands: (Configure first)
1. `npm run build` - to convert all .ts files into a single .js (browsers cant use .ts).
2. `npm run watch` - same as build, but will convert automatically, when detects any changes.
##### You can add `:map` if you need to see from which file and line, error has came from in a browser.
3. `npm run lint` - to check if there are any obvious mistakes in .ts file, also helps to keep same style.
4. `npm run fix` - will auto fix lint for you that it can by itself.

## Guide:

### Upgrades:
I've added an example upgrade in Intergalactic, there are some important places you need to go to add an upgrade:
1. Player.ts: 
    Find the upgradesInfo, researchInfo, etc. that you want to add to, and add the name, description, cost, scaling (if applicable), and increase maxAcive by amount added to that section
2. Special.ts: 
    Find the relavant area, and insert a line (in the correct spot) with the image source
3. Somewhere:
    Figure out where the effect goes based on what the upgrade should do. Depends on your upgrade

### Saves:
There is one save, which is from something, idk where, but it is pretty far, but is from 0.2.7, not 0.2.8. \
To add your own:
1. Get your file from 'export save file'
2. Copy the string from the file
3. Paste it into Saves.txt onto a new line