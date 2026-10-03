# LATEST LIVE STATE — 2026-10-03 — v446 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=446`
- v446 cleanup commit: `531174d4cdd2dbcf6621ef35b7e7fdf2b4417b28`
- v446 loader/deploy commit: `afcbdf40c329f0612c736d7c4b0b1b182432e755`
- v446 successful Pages run: `37152234503`
- Current `src/game.js` content SHA: `cf1a0988e61f080a31c0d93d621ee3c3b39393a8`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v444 and reported: **"works great whats next"**.
- User then asked to continue with the next cleanup before testing again.
- Therefore v444 remains the latest user-confirmed gameplay baseline; v445 and v446 are pending the user's combined live test.

## v446 cleanup — removed unused STI batching routine

Current-main audit proved:
- `batchLoadedStiCars` occurred exactly once: its own definition.
- It had zero call sites.
- `mergeGeometries` remains used elsewhere after removal, so no live utility/import was orphaned.
- `addBuilding()` remains untouched for a later independent audit.

v446 removed only:
- the 24-line unused `batchLoadedStiCars()` routine.

Verification:
- `src/game.js` parses successfully;
- net diff versus v445 contains only 24 deleted lines in `src/game.js` plus the v446 loader bump in `index.html`;
- native crawler conversion, PBD/ragdoll, M240 authored WAV path/state, grenade/spintop, live spawn-zone/connectivity protections, active zombie cap and other protected systems remain present;
- M240 audio was not modified.

## Continue cleanup carefully

The next known dead-code candidate is `addBuilding()` (currently 51 lines, one occurrence: its own definition). It belongs to the old procedural-city path and must be audited separately before deletion because it references facade/building helpers and collision data. Do not remove it together with unrelated helpers.

---

# LATEST LIVE STATE — 2026-10-03 — v445 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=445`
- v445 cleanup commit: `05399cfe0948e008b2365e43ce2ed090e619e6e0`
- v445 loader/deploy commit: `70b0831aabb8d96198881714aeae663ee18833cc`
- v445 successful Pages run: `37151991481`
- Current `src/game.js` content SHA: `a4e62edbbe4c5069c75c7d0324d99e174ae324cd`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v444 and reported: **"works great whats next"**.
- v444 is therefore the latest user-confirmed gameplay baseline before this v445 dead-code cleanup.

## v445 cleanup — removed unused exact-zone spawn helper

Current-main audit proved:
- `pointOnNewCitySpawnZone` occurred exactly once: its own definition.
- The live spawn system uses `pointNearNewCitySpawnZone()` and `zombieSpawnConnectedToPlayer()`, both of which remain live and referenced.

v445 removed only:
- the six-line unused `pointOnNewCitySpawnZone(x,z,pad)` helper.

Verification:
- `src/game.js` parses successfully;
- net diff versus confirmed-good v444 contains only six deleted lines in `src/game.js` plus the v445 loader change in `index.html`;
- `pointNearNewCitySpawnZone()` remains referenced three times;
- `zombieSpawnConnectedToPlayer()` remains referenced twice;
- native crawler conversion, PBD/ragdoll, M240 authored WAV path/state, grenade/spintop, spawn cap and other protected systems remain present;
- M240 audio was not modified.

## Continue cleanup carefully

Remaining candidates previously seen with only their own current reference include `addBuilding` and `batchLoadedStiCars`. These are much larger than the helpers removed in v442-v445 and must be inspected individually before deletion. Prefer the smallest provably unreachable block next; do not touch active spawn/PBD/crawler logic merely for cleanup.

---

# LATEST LIVE STATE — 2026-10-03 — v444 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=444`
- v444 cleanup commit: `5e8a16d36537bbde4c1d30ea83bdc88aef1a732b`
- v444 loader/deploy commit: `22f0a9e35b7ce26a3b3c488c914f4485e8a9b54a`
- v444 successful Pages run: `37151243166`
- Current `src/game.js` content SHA: `5c67d61861359d2372320570298272a65fc6ef4c`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v443 and reported: **"works great lets move on"**.
- v443 is therefore the latest user-confirmed gameplay baseline before this v444 dead-code cleanup.

## v444 cleanup — removed unused shop toggle wrapper

Current-main audit proved:
- `toggleShop` occurred exactly once: its own definition.
- Shop/input wiring uses `openShop()` directly and does not reference `toggleShop`.
- `openShop()` remains live and is still called by the between-wave shop flow.

v444 removed only:
- `function toggleShop(){if(!between)return;openShop()}`

Verification:
- `src/game.js` parses successfully;
- net diff versus the confirmed-good v443 main baseline contains only one deleted line in `src/game.js` plus the v444 loader change in `index.html`;
- native crawler conversion, PBD/ragdoll, M240 authored WAV path/state, grenade/spintop, spawn cap/connectivity and other protected systems remain present;
- M240 audio was not modified.

## Continue cleanup carefully

Continue one controlled cleanup at a time. Remaining candidates previously observed with only their own reference include `addBuilding`, `pointOnNewCitySpawnZone`, and `batchLoadedStiCars`. Re-prove references from current GitHub main before removing anything; these are larger/more structural than the v444 wrapper and should be inspected individually.

---

# LATEST LIVE STATE — 2026-10-03 — v443 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=443`
- v443 cleanup commit: `f1e867912dfb347cc3649c8d8339ed006e5c2206`
- v443 repaired full-tree/current deployment commit: `d963cdcb34549fefcbda1ef80b96edc2a5ed6c75`
- v443 successful Pages run: `37146612179`
- Current `src/game.js` content SHA: `f18c546b90d200950dab4d426716e30cd5bd47d8`
- Live game: https://xboxlivehd88-hue.github.io/city-outbreak/?v=443-d963cdcb
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v442 and reported: **"works great"**.
- v442 is therefore the last user-confirmed gameplay baseline before this v443 dead-code cleanup.

## v443 cleanup — removed unused emissive material helper/cache

Current-main audit proved:
- `EM` had no call sites and occurred only at its own definition.
- `emissiveMaterialCache` existed only in the cache declaration and inside unused `EM`.

v443 removed:
- unused `EM(c,e,r)`;
- now-unused `emissiveMaterialCache`.

Verification:
- current v443 `src/game.js` parses successfully;
- net comparison against the full v442 tree shows only `src/game.js` and `index.html` modified;
- the game.js net change is only removal of the dead cache/helper;
- loader changed from v442 to v443;
- native crawler conversion, PBD/ragdoll markers, M240 authored WAV path/state, spintop asset, spawn active cap, protected recovery doc and other protected systems remain present;
- M240 audio was not modified.

## v443 tree repair note

The first low-level v443 tree commit accidentally used an incomplete base tree. This was caught before handoff. Commit `d963cdcb34549fefcbda1ef80b96edc2a5ed6c75` rebuilt v443 on the full v442 tree. Required files were rechecked, and the final net diff versus v442 contains only the intended `src/game.js` cleanup and `index.html` loader bump. Use the repaired/current commit as authoritative.

## Continue cleanup carefully

Continue one controlled cleanup at a time. Other functions previously noticed with only their own current reference included `addBuilding`, `pointOnNewCitySpawnZone`, `batchLoadedStiCars`, and `toggleShop`; re-audit current GitHub main before deleting any of them. Do not combine removals merely because they look unused.

---

# LATEST LIVE STATE — 2026-10-03 — v442 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=442`
- v442 cleanup commit: `301f894d19219f4ae34247061820cc1754081369`
- v442 loader/deploy commit: `ff2bcbdf65d2dd3e4d021f7e8a17114e1f9f9827`
- v442 successful Pages run: `37145141583`
- Current `src/game.js` content SHA after cleanup: `aa843fd70b1eb13117f1e06e13a44ac54c7dce68`
- Live game: https://xboxlivehd88-hue.github.io/city-outbreak/?v=442-ff2bcbdf
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## v442 cleanup — removed unused UI helper imports

Audit found four named imports from `ui-helpers.js` that had no references anywhere else in current `src/game.js`:
- `clearTransientMessage`
- `clearDamageOverlay`
- `clearHitMarker`
- `clearNukeOverlays`

Only those unused import names were removed. The UI helper module remains imported and all used UI helpers are unchanged.

Verification:
- current v442 `game.js` parses successfully;
- comparing v442 against the v441 gameplay commit shows exactly one changed line: the UI-helper import list;
- native `convertLeglessToCrawler()` architecture remains present;
- PBD/ragdoll/gameplay code body is byte-identical to v441 outside the import line;
- M240 WAV path/state is unchanged and must not be tuned until the user provides the planned recording;
- grenade/spintop, spawn/connectivity, City Hall collision, weapon transforms/reloads, rain/lighting/store/pause/start/death/restart, and wave/player settings were not changed.

## Current task — continue SAFE CODE CLEANUP / PERFORMANCE AUDIT

Continue one controlled cleanup at a time. The next audit may inspect other provably unused helpers/constants, but do not combine several cleanups or perform a broad refactor. Candidate unused functions noticed during the v442 read-only audit include `EM`, `addBuilding`, `pointOnNewCitySpawnZone`, `batchLoadedStiCars`, and `toggleShop`; **do not delete them merely from this note**. Re-prove current references from GitHub main before changing anything.

---

# LATEST LIVE STATE — 2026-10-03 — v441 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=441`
- v441 gameplay cleanup commit: `fb75c87ed883de9350f2580a3803bdcb73c4ba22`
- v441 loader/deploy commit: `7bd666a779bccbd13e445de28aea6dbd319d11f0`
- v441 successful Pages run: `37144643784`
- Current `src/game.js` content SHA at handoff: `fb4f8376f013c4e3f5ab43b8cf9e434f9b65abb1`
- Current `index.html` content SHA at handoff: `6bf32fbacabb86efc634bb5fd185c79944555fcb`
- Live game: https://xboxlivehd88-hue.github.io/city-outbreak/?v=441-7bd666a
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Current task — SAFE CODE CLEANUP / PERFORMANCE AUDIT

The user asked for a Codex-style engineering audit and cleanup of the existing game. We are doing it directly in ChatGPT/GitHub, one controlled change at a time.

Goal:
- shorten/clean code where safe;
- remove truly unreachable/dead code;
- reduce duplication and expensive work;
- identify performance opportunities;
- modularize only when behavior can remain identical;
- **do not change gameplay feel while cleaning.**

Required workflow:
1. Read this file, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, current `index.html`, and current `src/game.js`.
2. Treat current GitHub `main` as source of truth.
3. Audit first; do not make broad refactors.
4. Make **one low-risk cleanup at a time**.
5. Syntax/protected-system checks after every change.
6. Commit directly to `main`, bump loader, wait for Pages success, then give a fresh cache-busted test link.
7. Screenshots/gameplay testing are final authority.

## Cleanup already completed

### v440 — removed unused duplicate audio module
- Commit: `0404bda69cc9d530cc6af2ecd10f7f8e1ee4f27f`
- Loader/deploy: `b0e14c42efc807f2fa10d39368e510b3a0918556`
- Pages run: `37144484661` success.
- Removed `src/audio.js` (49 lines).
- It was not imported by current `src/game.js`; live audio logic remains in `src/game.js`.
- No gameplay/audio behavior was intentionally changed.

### v441 — removed unreachable legacy crawler system
- Gameplay cleanup commit: `fb75c87ed883de9350f2580a3803bdcb73c4ba22`
- Loader/deploy: `7bd666a779bccbd13e445de28aea6dbd319d11f0`
- Pages run: `37144643784` success.
- Removed old pre-native-crawler `z.leglessCrawler` branches from Green Guy/walker sync.
- Removed obsolete functions:
  - `crawlerBone`
  - `buildLeglessCrawlerHitboxes`
  - `updateLeglessCrawlerHitboxes`
  - `poseLeglessCrawlerRig`
  - legacy crawler hitbox temp vectors/axis
- Removed obsolete per-frame/fire calls to `updateLeglessCrawlerHitboxes`.
- Removed old `leglessCrawler` guards from locomotion.
- **Current native crawler conversion remains intact:** losing both legs uses `convertLeglessToCrawler()`, creates a native `kind==="crawler"`, and transfers/preserves the source zombie upper-body visual.
- This cleanup removed 153 lines and added 16 lines of simplification.
- Do not reintroduce the old v428-v430 crawler-folding system.

## Important current v439+ M240 audio state — preserve during cleanup

Newest user WAV:
`assets/101961__cgeffex__heavy-machine-gun-edited.wav`

Current M240 audio behavior:
- source constant: `M240_FIRE_SAMPLE_URL="./assets/101961__cgeffex__heavy-machine-gun-edited.wav?v=439"`
- plays the uploaded edited WAV as-is;
- loops the whole WAV while trigger is held;
- stops on trigger release, reload, weapon switch, pause/shop via `stopAuto()`, and empty magazine;
- prior auto-trimming/normalizing experiments from v437/v438 were removed.
- User said v439 is **better but audio still kind of fades/goes away**; user plans to send a screen recording later. **Do not tune the M240 audio again until that recording is provided.**

Preserve M240 gameplay:
- `m240:{name:"M240 LMG",rate:78,hold:78,...}`
- ADS: `m240:{x:-.36,y:.01,z:1.20,fov:56,rx:0}`
- whole-gun recoil remains disabled:
  `const wholeGunRecoil=(weapon==="smg"||weapon==="m240")?0:recoil;`

## Protected gameplay systems — cleanup must not change behavior

Preserve unless user explicitly asks:
- v324 protected recovery identity.
- PBD death ragdoll / explosion ragdoll / knockdown behavior.
- Bullet-force death impulse remains intentionally removed.
- Native crawler conversion and preserved upper-body identity.
- M240/M17/M4/MP5 transforms, ADS, recoil and reload behavior.
- zombie spawn connectivity / anti-clumping / doorway behavior / active cap.
- City Hall collision and map boundaries.
- grenade/spintop model and attraction behavior.
- rain, lighting, street-lamp performance setup.
- start screen, store/pause, sound, death/restart.
- current wave counts, sprint/health reset, max active zombies.

## Current cleanup audit clues / next step

Known structure:
- `src/game.js` is still very large (~330 KB).
- `src/zombie-rig-data.js` is also large (~355 KB) but is generated/embedded rig data and should not be casually refactored.
- Existing small modules include UI, input, render, wave, format, performance helpers.
- The next chat should continue the read-only audit of current v441 and choose the **next lowest-risk cleanup**.
- Good categories to investigate:
  - unused constants/functions/imports;
  - duplicate helper logic;
  - allocations inside hot update paths;
  - repeated traversals/raycasts that can be cached;
  - old version-specific branches that are now provably unreachable;
  - safe extraction of self-contained systems from `game.js`.
- Do **not** do a giant refactor or move the ragdoll/crawler/spawn systems wholesale.
- Before deleting anything, prove there are no current references and compare against the current native crawler/PBD architecture.

## Testing status

v440 and v441 both deployed successfully. At this handoff point, the user has not supplied a post-v441 gameplay screenshot/test report in this chat. Treat deploy/syntax success as necessary but not proof of visual correctness.

---

# LATEST LIVE STATE — 2026-10-01 — v392 — READ THIS BEFORE OLDER SECTIONS

This section supersedes older "current live state" notes below. **Do not change the protected recovery identity** unless the user explicitly approves a new recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Gameplay commit before this handoff-doc update: `6bd953d95e27202e829dbf18573932b69e08f845`
- Loader: `./src/game.js?v=392`
- Latest v392 Pages deployment run: `36895349980` — success
- Live game: https://xboxlivehd88-hue.github.io/city-outbreak/
- Protected recovery remains **v324**. Do not redefine it automatically.

## Immediate current task — grenade GLB / spin

The user uploaded a new GLB and wants it to **completely replace the old hand-grenade visual**.

Current grenade asset:
- `assets/spintop.glb`
- Current loader cache tag: `assets/spintop.glb?v=391`
- The procedural hand-grenade visual is no longer used for thrown hand grenades.
- `throwGrenade()` clones `grenadeModelTemplate` and refuses to throw until the GLB is loaded.

Current v392 pivot/orientation:
- GLB is recentered in X/Z.
- Its **lowest Y point is moved to local Y=0**, making the bottom-center the pivot.
- Holder scale is normalized to roughly `.30 / maxDimension`.
- Thrown hand grenade is tagged `bottomYPivot:true`.
- In `update(dt)`, hand grenade rotation is:
  ```js
  g.q.rotation.y += dt * 8;
  ```
- This means a full continuous 360-degree spin around the vertical Y axis **through the bottom-center of the model**, like a top rotating on its base.
- Grenade-launcher projectiles keep their old X/Z tumble and are not affected.
- **User has not yet visually confirmed v392 in live gameplay.** The next chat should ask for/accept the user's live test result before changing the grenade again.

## Zombie spawning — latest playable-area protections

The user wanted zombies to use much more of the playable city, including passable doorway-connected areas, while never spawning outside the playable map and avoiding late-wave clumps.

Current spawn system includes:
- `MAX_ACTIVE_ZOMBIES=30`
- `RECENT_ZOMBIE_SPAWN_LIMIT=96`
- normal spawn search around `30–64` units from player
- boss spawn search around `36–70`
- spawn separation checks against recent spawn points **and living zombies**
- stronger angular distribution to prevent late-wave clumps
- full reachable-ground sampling instead of only Road/Parking rectangles
- ground-floor / stoop / doorway surfaces can be eligible
- wall-clearance check uses near-body clearance `.46`
- `pointNearNewCitySpawnZone(x,z,12)` keeps candidates near the authored city footprint
- v389 connected-playable-cell flood fill:
  - `zombieSpawnPlayableCells`
  - seeded from the player's connected walkable nav cell
  - each neighboring cell must have a full zombie-width clear path between centers
  - diagonal no-corner-squeeze rule remains
  - `validZombieSpawn()` requires `zombieSpawnConnectedToPlayer(x,z)`
- This was added specifically after screenshots showed zombies outside the playable boundary.
- If an outside spawn is reported again, **fix the connected-area / boundary validation**, do not simply shrink all spawn ranges back to the old central road-only system.

## M240 current approved/tuned state

Preserve unless the user specifically asks:
- Asset: `assets/m240b_machine_gun.glb`
- ADS config:
  ```js
  m240:{x:-.36,y:.01,z:1.20,fov:56,rx:0}
  ```
- Butt/shoulder ADS pitch:
  ```js
  m240ViewRoot.rotation.x=THREE.MathUtils.lerp(.055,.060,aimBlend);
  ```
- Whole-gun recoil is disabled for M240:
  ```js
  const wholeGunRecoil=(weapon==="smg"||weapon==="m240")?0:recoil;
  ```
- Barrel/front-only recoil around rear stock point:
  ```js
  const recoilStrength=THREE.MathUtils.lerp(.20,.125,aimBlend);
  const targetKick=-recoil*recoilStrength;
  const follow=1-Math.exp(-dt*6.5);
  ```
- User said ADS was fine, then tuned sight height down through v385 to `y:.01`.
- Do not disturb this while working on grenade/spawns.

## Other protected current systems

Preserve unless explicitly requested:
- M17 is the only starting weapon, 16-round mag, effectively unlimited reserve.
- M4/MP5 existing transforms, reloads, damage/ammo behavior.
- MP5 rear-pivot recoil system.
- v358 Hairibar-inspired ragdoll motion and 10-second corpse cleanup.
- v354 City Hall stair-side collision.
- rain/wet-ground system.
- street-lamp performance setup: only 4 real spotlights + cheap all-lamp glow/flicker.
- start screen, sound, store low-power freeze, Ready, pause, death/restart.
- health/sprint restore at new round.
- full-city zombie navigation and reachable spawn checks.

## Required workflow for next chat

Before **any** code change:
1. Fetch/read `CITY_OUTBREAK_HANDOFF.md`.
2. Fetch/read `NEXT_CHAT_HANDOFF.md`.
3. Fetch/read `CURRENT_RECOVERY_CHECKPOINT.md`.
4. Fetch current `main:index.html`.
5. Fetch current `main:src/game.js`.
6. Fetch any directly relevant module/assets.
7. Treat current GitHub `main` as source of truth, not copied chat snippets.
8. Make one controlled change at a time.
9. Commit directly to `main`.
10. Verify exact diff, syntax, and protected values.
11. Wait for GitHub Pages deployment success.
12. Give a fresh cache-busted playable link.
13. Never claim a visual/gameplay fix is approved until the user tests it.


# CITY OUTBREAK — AUTHORITATIVE HANDOFF

# NEW PROTECTED RECOVERY CHECKPOINT — 2026-09-29 — v324 — READ THIS FIRST

This section supersedes every older "current checkpoint" or "current state" section below. Older sections are retained only as historical reference.

## Recovery checkpoint identity

- **Current approved recovery build:** v324
- **Exact protected recovery commit:** `afddcebb47e06a82b4196638716f05e6f1adc941`
- **Exact protected recovery tree:** `5721309fc27f9f16ee7a2568a7f73fd429342502`
- **v324 loader commit:** `6d9cfb8aaa54916bab78f7a93c95224435c9ec5b`
- **GitHub Pages entry:** `./src/game.js?v=324`
- **Latest successful Pages deployment for the protected tree:** run `36616387389`
- **Live game:** https://xboxlivehd88-hue.github.io/city-outbreak/
- The user explicitly said the current state is a **great spot** and asked to make it the new recovery save.
- Future work starts from v324 unless the user explicitly asks to restore an older checkpoint.
- **Do not redefine or overwrite this recovery identity casually.** If a later build becomes the new approved recovery, record a new dated section above this one.

## Required workflow for every future change

1. Fetch/read this file, `NEXT_CHAT_HANDOFF.md`, current `main:index.html`, current `main:src/game.js`, and any directly relevant module such as `src/wave-utils.js`.
2. Never work from stale chat snippets when the repository can be read directly.
3. Make one controlled change at a time.
4. Commit directly to `main`; do not ask the user to run Git commands or manually upload code.
5. Verify the exact diff and protected gameplay values after the change.
6. Temporary Actions inspection/syntax workflows are allowed, but delete them immediately afterward.
7. `.github/workflows` should return to only `v182-validation.yml`.
8. Wait for the final GitHub Pages deployment to complete successfully before giving the user a cache-busted test link.
9. Code/deployment success does **not** equal gameplay approval. The user's live test is final authority.

## Current city/map — LOCKED BASELINE

The old v303 procedural city is no longer active. The active environment is the uploaded GLB:

- `assets/chicken_gun_fruzer_-_city.glb`
- Valid GLB 2.0, self-contained.
- Approx file size: 25.47 MB.
- 1 scene, 1028 nodes, 455 meshes, 9 materials, 8 textures / 8 embedded PNG images.
- Approx 309,042 triangles.
- Raw source bounds were approximately 502.52 x 707.53 x 578.54 units.
- No authored collision/physics metadata and no real punctual-light metadata were found.
- Sketchfab metadata inside the GLB identifies the asset as **"chicken gun fruzer - city"**, author **amogusstrikesback2**, license **CC-BY-4.0**.
- Old procedural ground, roads, sidewalks, curbs, buildings, lamps, barriers, road texture, and old hand-placed STI map props are disabled from the active environment.

Current map transform:
```js
const NEW_CITY_SCALE=1.55;
const NEW_CITY_X_OFFSET=21.33575;
const NEW_CITY_Y_OFFSET=28.68275;
const NEW_CITY_Z_OFFSET=8.25;
```

The scale was tuned repeatedly against the character/zombie size. **Do not change it unless the user asks.**

## Current character scale / camera / M4

```js
const PLAYER_WORLD_SCALE=1.20;
const ZOMBIE_WORLD_SCALE=1.15;
```

- Camera uses `playerGroundY + 1.65 * PLAYER_WORLD_SCALE`.
- The player was raised because the user felt too short compared with the zombies.
- The M4 hip pose was pulled back toward the shoulder:
  `m4ViewRoot.position.z = reloading ? -1.66 : THREE.MathUtils.lerp(-1.62,-1.66,aimBlend)`
- Preserve the approved M4 ADS/reload pose and do not rework other weapon transforms unless requested.

## v320–v324 city collision / navigation — CURRENT APPROVED SYSTEM

The GLB has no native collision, so collision is generated from the city's actual geometry.

### Wall collision
- Spatial collision bucket size: `CITY_COLLISION_BUCKET=4.0`.
- Collision is generated only from substantial near-vertical geometry crossing player/zombie body height.
- Roads/floors/roofs/shallow curbs are intentionally not treated as walls.
- v324 collision precision:
```js
const NEW_CITY_COLLISION_CELL=.34;
const NEW_CITY_COLLISION_MIN_Y=.10;
const NEW_CITY_COLLISION_MAX_Y=2.25;
const NEW_CITY_COLLISION_MIN_VERTICAL_SPAN=.55;
```
- Wall triangle edges are rasterized into collision cells and merged into compact AABB strips.
- `insideBuilding`, `slideBuilding`, zombie blocking, and A* all share the same collision data.
- Current player wall radius: `.36`.
- Current zombie collision radius: `.38`.
- These smaller radii are intentional: v324 was specifically made to open narrow alleys, stoops, door approaches, railings, and other passages that were too restrictive in v323.

### Zombie navigation
```js
const ZNAV_CELL=1.5;
const ZNAV_PAD=.44;
const ZNAV_MAX_NODES=3600;
```
- A* uses the generated wall collision.
- v324 tightened the nav grid from the older coarser settings so zombies can use narrow real passages without walking through walls.
- Do not restore the older v320/v323 larger player/zombie clearance values unless explicitly troubleshooting a regression.

### Stairs / vertical ground following
v323 added real walkable stair/ground following instead of treating the whole game as flat Y=0.

```js
const PLAYER_STEP_UP=.62;
const PLAYER_STEP_DOWN=1.35;
```
- `samplePlayerGroundY()` raycasts the city GLB beneath the player.
- It accepts upward-facing surfaces with world normal Y >= .42.
- `playerGroundY` smoothly follows valid treads/ground, and camera height is added on top.
- Wall collision remains separate, so vertical surfaces should not become ground.
- If stairs regress, inspect this system before inventing ramps or changing map scale.

## Zombie spawning — CURRENT APPROVED SYSTEM

v323 stopped zombies from spawning inside enclosed buildings by creating spawn zones from real outdoor map meshes.

- Spawn zones are built only from mesh names matching `Road_*` or `ParkingBG_*`.
- Large `BG_*` block planes are intentionally excluded because buildings sit on top of them.
- `validZombieSpawn()` requires the candidate to be on one of those outdoor spawn zones, outside wall collision, and more than 22 units from the player.
- Normal spawn search: `findReachableZombieSpawn(24,42)`.
- Boss spawn search: `findReachableZombieSpawn(28,46)`.
- Spawn candidates are tested for direct or A*-reachable routes to the player.
- Do not revert to random radial spawning without the road/parking-surface validation; that caused zombies to appear inside buildings and become trapped.

## Waves / zombies / headshots — CURRENT APPROVED VALUES

`src/wave-utils.js` currently starts ordinary waves at:
```js
count:10+(w-1)*3
```

So Wave 1 = 10 normal zombies, then +3 per normal wave formula. Existing boss-wave logic remains every 10th wave.

Active optimization cap:
```js
const MAX_ACTIVE_ZOMBIES=30;
```

Non-boss headshots are **not forced instant kills anymore**:
```js
const headshotToughness=1+Math.max(0,wave-1)*.2;
z.hp-=shotDamage*3/headshotToughness;
```
This implements the user's request as increasing zombie headshot resistance by 0.2 per round, so later waves do not stay guaranteed one-shot head kills. Boss headshot logic remains separate.

## Player movement / round recovery — CURRENT APPROVED VALUES

- Walk speed: 5.
- Sprint speed: **9.5**.
- Sprint drain: approximately 33.34/sec.
- Sprint recharge: 14/sec.
- At every new round / Ready transition:
  - health is restored to 100,
  - health regen state resets,
  - sprint energy is restored to 100,
  - sprint lock is cleared.
- Preserve this behavior unless the user asks to change it.

## Weapons / gameplay protections inherited from v303

Unless explicitly requested, preserve the approved weapon/reload/game systems inherited from v303:
- M17: 16-round magazine, unlimited reserve, lower base damage, centered ADS/hit alignment.
- M4: preserve damage/ammo/reload behavior; do not give unlimited ammo or lower damage.
- MP5: preserve approved ADS/recoil/reload behavior.
- Existing reload choreography is sensitive; do not copy one weapon's reload solution onto another.
- Audio remains inline in `src/game.js`; prior extraction to `src/audio.js` broke sound.
- Preserve start screen, START OUTBREAK, sound, store, pause behavior, Ready flow, death/restart, bosses, pickups, boss chest hitbox, zombie head hitboxes, and weapon collision/retraction.

## Protected historical fallback

The former clean recovery point is still valuable if a catastrophic regression requires a known pre-new-city baseline:

- clean v303 gameplay commit: `8e0c312eab781ba978ebb7f5bf503253e0d5e955`
- clean v303 exact tree: `ce560411d2751ccdc8068bfa16753cc77adeb74a`
- later exact-v303 restore commit: `15665eab18251b75934d81ba1d7775fa11a3dc0f`

**v324 is now the primary recovery. v303 is the secondary clean fallback.**

## Abandoned map history — DO NOT RESURRECT WITHOUT USER REQUEST

- Trailer Park work was abandoned.
- Havana work was abandoned and its GLB was removed from the clean baseline.
- The current city GLB replaced the old procedural city.
- Do not reintroduce Trailer Park, Havana, old procedural roads/city, or old STI map props unless the user explicitly asks.

## Immediate next-chat priority

The user has approved the current state as the new recovery checkpoint. The next chat should **not immediately redesign anything**. Start by reading the repo and asking/acting on the user's next requested test or change. If collision is revisited, first reproduce the exact problem location from a screenshot and make a narrow fix; do not globally inflate wall collision or nav padding because v324 intentionally opened tight passages.

---

# CURRENT STATE UPDATE — 2026-09-28 — READ THIS FIRST

This section supersedes older "current checkpoint" references below. Keep the older sections as project history/reference.

## Current approved live checkpoint

- Build/cache generation: **v303**
- Approved live modular/gameplay checkpoint commit: **8e0c312eab781ba978ebb7f5bf503253e0d5e955**
- GitHub Pages entry loads: `./src/game.js?v=303`
- Live game: https://xboxlivehd88-hue.github.io/city-outbreak/
- The user confirmed **v303 works fine** and approved it as the current checkpoint.
- **v301** commit `9410af6c6e999d5451afd5850b8f6ec28e55e0e5` was a behavior-neutral module-comment/documentation cleanup.
- **v302** consolidated already-approved reset UI overlay cleanup into `resetRunUiOverlays()`; it did not intentionally change gameplay.
- **v289 pause behavior remains the approved pause baseline. v290/v291 pointer-lock resume experiments were reverted.**
- Last fully approved pre-modular gameplay baseline remains **v257**, commit **138e961c2597cb5ff6099798314d1f40308388c4**.

## Current live modular structure

- `index.html` — HTML/UI shell, import map, game loader.
- `src/game.css` — live CSS. Start-screen path must remain `../assets/city-outbreak-start-v153.jpg.jpg`.
- `src/game.js` — main live runtime and gameplay state.
- `src/zombie-rig-data.js` — exact live zombie rig data.
- `src/wave-utils.js` — pure/stateless wave difficulty calculations: `diff(w)`, `isBossWave(w)`, `bossTier(w)`, and `bossScaleFactor(w)`.
- `src/performance-hud.js` — live performance HUD helper.
- `src/ui-helpers.js` — live UI rendering/wiring helpers:
  - transient messages
  - Controls modal
  - Start/Restart/Death Restart wiring
  - Pause/Resume wiring
  - boss HUD
  - sprint HUD
  - main HUD
  - death stats
  - wave/announcement display
  - Ready/Next Wave wiring
  - shop buy-button wiring
  - runtime error overlay + listener registration
- `src/render-utils.js` — renderer resize + WebGL context-loss wiring.
- `src/format-utils.js` — pure run-time formatter.
- `src/input-utils.js` — live input/event wiring:
  - key-state clearing
  - context-menu suppression
  - blur/tab-visibility safety wiring
  - pointer-lock change listener wiring
  - keyup/keydown listener wiring
  - mousemove listener wiring
  - mousedown/mouseup/pointer-cancel listener wiring

## v262–v303 approved modularization sequence

The user individually tested and approved the incremental modular changes through v303. Key later checkpoints include:
- v277 input key reset utility
- v278 runtime error overlay rendering
- v279–v285 input/listener wiring cleanup
- v286 runtime error listener wiring
- v287 damage-overlay flash rendering
- v288 shop-note rendering
- v289 pause UI rendering — **approved pause baseline**
- v290/v291 pointer-lock resume experiments — **reverted**
- v292 death-screen visibility
- v293 boss HUD hide rendering
- v294 announcement reset cleanup
- v295 shop panel visibility
- v296 duplicate transient-message reset cleanup
- v297 damage-overlay reset cleanup
- v298 hit-marker reset cleanup
- v299 nuke-overlay reset cleanup
- v300 start-screen reset hide
- v301 module header/comment refresh only — no intended runtime behavior change
- v302 consolidated the already-approved reset overlay helpers behind `resetRunUiOverlays()`
- v303 extracted only the four pure wave/difficulty calculations into `src/wave-utils.js` with formulas unchanged; the user tested it and said it works fine.

The input callbacks still keep gameplay decisions in `game.js`; helper modules primarily own registration/DOM plumbing. Do not move gameplay math or weapon behavior merely for decomposition.

## Next development recommendation after v303

The low-risk UI/input/reset work and the obvious pure wave calculation extraction are complete through v303. Do **not** force more modularization just to create modules.

Repository housekeeping after v303 removes the old unused scaffold files `src/config.js`, `src/main.js`, `src/weapons.js`, and `src/zombies.js`. They had no live references. Keep `src/audio.js` present but unused because the live/proven audio remains inline in `src/game.js`.

Recommended direction now:
1. Preserve v303 as the approved gameplay recovery point.
2. Prefer actual bug fixing, gameplay polish, map/content work, or a clearly cohesive subsystem over further tiny extractions.
3. If doing more structural work, require a genuinely isolated subsystem and keep it behavior-neutral.
4. Continue avoiding audio, reloads, weapon ADS/firing rays, zombie pathing, boss combat behavior, store timing, and frame-loop timing unless the user deliberately chooses one of those areas.
5. Continue one atomic change at a time, verify locked values, wait for Pages success when live runtime changes, then let the user test.

Sensitive/locked areas:
- inline audio
- all reload animations
- M17/M4/MP5 ADS, hit alignment, firing rays, transforms, and recoil
- zombie AI/pathing/spawn reachability
- boss movement/attacks/chest hitbox
- store low-power timing and game-time freeze
- frame loop/core timing
- v289 pause behavior
- start screen/startup/audio/death/restart behavior

## Critical locked behavior

- Audio remains **inline in `src/game.js`**. `src/audio.js` exists but is NOT live; the earlier audio extraction caused no sound.
- Do not alter approved reloads unless the user requests a specific weapon.
- Preserve M17 ADS/firing alignment, M4 state, MP5 state, store low-power behavior, boss behavior, and zombie pathing.
- Preserve `MAX_ACTIVE_ZOMBIES = 20`, full-city A* behavior, and the current 2600 A* node budget.
- Continue making one small self-contained change at a time, commit to `main`, verify the diff/locked values, wait for GitHub Pages deploy, then give a fresh cache-busted test link.

---


Last updated: 2026-09-26

Repository: xboxlivehd88-hue/city-outbreak
Branch: main
Live game: https://xboxlivehd88-hue.github.io/city-outbreak/

# READ THIS FIRST

The user expects the assistant to work directly in GitHub, make targeted commits to main, verify them, and return a fresh cache-busted GitHub Pages link. Do not give the user Git instructions when the GitHub connector can do the work.

Screenshots and the user's live testing are ground truth. Do not declare a visual/gameplay change approved until the user tests it.

# CURRENT CONFIRMED CHECKPOINTS

## Last fully approved pre-modular gameplay baseline

- Build: v257
- Commit: 138e961c2597cb5ff6099798314d1f40308388c4
- This is the safest reference point for comparing gameplay behavior.

## Cleanup checkpoint

- Build: v258
- Cleanup gameplay commit: 9a8122c04668bee68ba61c977e5f6653824f6ecf
- Cleanup was intended to preserve gameplay feel.

## Current modular working checkpoint

- Build/cache generation: v260
- Current modular checkpoint commit: 29c3b445c75952dd264f8f844333c88db0b51c40
- Current Pages entry loads:
  - ./src/game.css?v=260
  - ./src/game.js?v=260
- The user reported the modular build was back in a good state after the start-screen and audio regressions were fixed.

If a future modular extraction causes a regression, compare against v260 first, and against v257 for gameplay behavior.

# CURRENT LIVE FILE STRUCTURE

## Live

- index.html
  - HTML/UI shell
  - Three.js import map
  - loads src/game.css?v=260
  - loads src/game.js?v=260

- src/game.css
  - live CSS
  - start-screen background path must remain:
    ../assets/city-outbreak-start-v153.jpg.jpg
  - IMPORTANT: because CSS now lives inside src/, using assets/... without ../ breaks the start screen.

- src/game.js
  - main live runtime
  - most gameplay code is still here
  - audio is currently INLINE here again
  - imports exact zombie rig data from ./zombie-rig-data.js

- src/zombie-rig-data.js
  - exact live zombie rig data previously embedded in game.js
  - currently imported by game.js
  - do not replace it with assets/zombie-rig.gltf; that asset was checked and is NOT the exact same live data.

## Present but NOT live

- src/audio.js
  - created during the first audio extraction attempt
  - currently NOT imported by the live game
  - that extraction caused sound to disappear
  - proven inline audio was restored to src/game.js
  - do not assume this module is production-ready

- src/config.js
- src/main.js
- src/weapons.js
- src/zombies.js

Those four are older scaffolding and contain stale values. They are NOT authoritative and must not be wired into the live game without rebuilding them from current live code.

- build/game.part*
  - old fragments
  - not live

# MODULARIZATION HISTORY — IMPORTANT

The user chose to proceed with item #2: split the giant index.html into real files.

## What worked

1. CSS was extracted verbatim into src/game.css.
2. JavaScript was extracted verbatim into src/game.js.
3. index.html became a small shell.
4. The exact live zombie rig constant was moved into src/zombie-rig-data.js.

## What broke and was fixed

### Start screen disappeared

Cause:
- CSS moved into src/, but the background still used assets/...
- Relative paths in CSS resolve from the CSS file, not from index.html.

Fix:
- commit b24c82723fbf87554e1a79b4ac8e26b3041ae186
- current path is ../assets/city-outbreak-start-v153.jpg.jpg

### Sound disappeared

Cause:
- first audio-module extraction changed runtime behavior.

Fix:
- commit 38a114d35ec8c59a307ca4b25e6a4576688547ff
- proven audio implementation was restored inline inside src/game.js

### Browser cache

Fix:
- commit 29c3b445c75952dd264f8f844333c88db0b51c40
- index now cache-busts live CSS/JS with ?v=260

Do not repeat these regressions.

# NEXT CHAT — FIRST ACTIONS

1. Fetch current main:index.html.
2. Fetch current src/game.js.
3. Fetch current src/game.css.
4. Read this handoff.
5. Do NOT use old src/weapons.js, src/zombies.js, src/config.js, or src/main.js as source of truth.
6. Before further modular work, preserve v260 exactly.
7. Continue modularization ONE self-contained system at a time.
8. After each extraction:
   - commit to main
   - cache-bust the changed runtime file if needed
   - give user a live test link
   - wait for user test before extracting the next major system.

## Recommended next modular target

Prefer a low-risk system such as:
- UI helpers / DOM-only functions
- performance HUD
- simple constants copied from current live code
- non-weapon/non-zombie utilities

Avoid extracting audio again immediately.

Do NOT make weapons or zombie AI the next modular target. Those systems have had extensive tuning and are high-risk.

# REQUIRED REGRESSION TEST AFTER EVERY MODULAR EXTRACTION

At minimum verify with the user:

1. Start screen appears correctly.
2. Start button works.
3. Controls modal works.
4. Game starts normally.
5. Sound works:
   - gunshot
   - footsteps
   - zombie sounds
   - reload sounds
6. M17 ADS sight alignment still matches bullet impact.
7. M4 is unchanged.
8. MP5 is unchanged.
9. Reload animations are unchanged.
10. Zombies spawn and path toward player.
11. No zombie ping-pong regression.
12. Store opens after wave.
13. Store low-power mode works.
14. Ready resumes next wave.
15. Pause/resume works.
16. Restart starts cleanly.
17. Performance HUD still runs.

If any one of these breaks after an extraction, fix or revert that extraction before doing another one.

# LOCKED RELOAD RULE — VERY IMPORTANT

The user explicitly said all reload animations are locked unless that specific weapon is explicitly requested.

Do not alter reload choreography for:
- M4
- MP5
- M17
- shotgun
- DMR
- grenade launcher
- M240
- AWM

# M17 SIG — CURRENT APPROVED STATE

Current ADS:
- pistol:{x:-.36,y:.058,z:-.32,fov:55,rx:.045}
- bullet ray: true screen center
- pistolAdsZero=0
- visual hit marker centered at 50% / 50%

Also preserve:
- 16-round magazine
- effectively unlimited reserve
- current reduced body-damage behavior
- no SIG ammo drops
- reload locked

Do not restore the old -.14 ADS firing-ray offset unless the user explicitly asks for another sight correction.

# M4 — CURRENT LOCKED STATE

Asset:
- assets/classic_m4.glb.glb

Viewmodel:
- root scale 5.15
- rotation Y Math.PI
- base position about (x,-.25,-1.66)
- hip-only Z about -1.78
- ADS: rifle:{x:-.36,y:.030,z:.72,fov:48,rx:0}

M4 reload is user-approved and locked.

# MP5 — CURRENT LOCKED STATE

Asset:
- assets/animated_mp5.glb

Visible baked meshes:
- Object_126
- Object_128
- Object_130

Root:
- scale 2.25
- position (.30,-.70,-1.12)
- yaw 0

ADS:
- smg:{x:-.36,y:-.050,z:1.28,fov:55,rx:-.01}
- ADS yaw about 1.05 degrees
- ray correction X -.018
- ray correction Y -.025

MP5 uses custom recoil rather than generic whole-gun recoil.
MP5 reload is locked.

# ZOMBIE PATHING — CURRENT STATE

Preserve:
- MAX_ACTIVE_ZOMBIES = 20
- A* navigation covers the full playable city
- nav X approximately -148 .. 148
- nav Z approximately -158 .. 164
- A* node budget 2600
- reachable-spawn validation
- blocked spawn candidates can be route-tested
- stuck zombies choose a more open side instead of blindly flipping
- last-five rush behavior
- boss behavior
- boss chest hitbox
- crawler/head hitbox behavior

A prior bug caused zombies outside the old nav rectangle to ping-pong instead of routing. Do not shrink navigation back to the old central bounds.

# SHOP / PERFORMANCE

Between-wave shop low-power mode:
- freezes gameplay simulation
- freezes game timers
- suspends audio
- renders background about 4 FPS
- throttles frame callback
- blocks gameplay hotkeys while shopping
- resumes exact game-time state on Ready

Recent cleanup also:
- slowed frozen timer polling
- reset velocity/recoil/aim transient state on restart
- cleared stale UI effects on reset
- stopped movement during wave-complete transition
- fixed muzzle-flash ownership
- stopped per-second performance console spam while keeping HUD

# START SCREEN

Artwork:
- assets/city-outbreak-start-v153.jpg.jpg

Live CSS path from src/game.css:
- ../assets/city-outbreak-start-v153.jpg.jpg

Display:
- center top / cover
- no intentional distortion
- no black bars

The artwork visually contains SETTINGS and CONTROLS.
- Controls is wired to a real modal.
- Settings is still artwork only.

# VEHICLES / MAP

Preserve:
- STI asset assets/2018_subaru_wrx_sti.glb
- current parked-car collision footprint
- static city batching
- road texture assets/textures/roads/road_albedo.jpg.jpg

# ASSET / PERFORMANCE NOTES

Large assets identified for future optimization:
- road texture about 13.5 MB
- STI about 13.3 MB
- MP5 about 12.8 MB
- M4 about 9 MB

Asset compression is a separate future task. Do not combine it with weapon tuning or a major modular extraction in the same commit.

# USER WORKING STYLE

- User wants the assistant to do repo work directly.
- Do not give Git instructions.
- Keep changes small and testable.
- Provide live test links.
- Screenshots are authoritative visual feedback.
- Do not casually refactor approved weapons, reloads, or zombie behavior.

# SAFE HANDOFF SUMMARY

The project is transitioning from one huge inline file to modules.

Current v260 is the modular checkpoint to protect.
v257 is the gameplay-behavior reference.

Continue the split slowly, one low-risk subsystem at a time, and test every extraction live before moving to the next one.
