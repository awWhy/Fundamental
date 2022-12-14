# Fundamental
Attempt to make something\
Can be played at 'https://awwhy.github.io/Fundamental/' \
(Work in Progress)\
**v0.0.9** > Stage 4 speed up. Stage 5 second part, some balance changes, \
There was a bug when launching game for the **first time**, buildings weren't producing, \
Only way to fix it on your side, is by deleting game Cookies (Local storage)

#### Should be supported by:
1. Modern browsers,
2. Mobile devices (to some amount),
3. Screen readers (need feedback)

---
### If you plan do anything with this, then you need to:
#### `npm install` - This will install everything that was used in here.
#### Keep in mind it will install latest version of dependencies, so something might break.
---

## Special NPM commands: (Configure first)
1. `npm build` - to convert all .ts files into a single .js (browsers cant use .ts).
2. `npm watch` - same as build, but will convert automatically, when detects any changes.
##### You can add `:map` if you need to see from which file and line, error has came from in a browser.
3. `npm lint` - to check if there are any obvious mistakes in .ts file, also helps to keep same style.
4. `npm fix` - will auto fix lint for you that it can by itself.
