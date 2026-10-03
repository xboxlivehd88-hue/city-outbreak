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

# CURRENT NEXT-CHAT STATE — 2026-10-01 — v392 — READ THIS FIRST

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


# CITY OUTBREAK — NEXT CHAT HANDOFF

# CURRENT NEXT-CHAT STATE — 2026-09-29 — v324 RECOVERY — READ THIS FIRST

This section supersedes every older "current next-chat state" below.

## Start here

- **Current approved recovery build:** v324
- **Exact protected recovery commit:** `afddcebb47e06a82b4196638716f05e6f1adc941`
- **Exact protected recovery tree:** `5721309fc27f9f16ee7a2568a7f73fd429342502`
- **GitHub Pages loader:** `./src/game.js?v=324`
- **Successful Pages run for the protected tree:** `36616387389`
- **Repo:** `xboxlivehd88-hue/city-outbreak`
- **Branch:** `main`
- **Live:** https://xboxlivehd88-hue.github.io/city-outbreak/
- The user explicitly called the current state a **great spot** and asked to make it the new recovery save.
- Former v303 remains a secondary clean fallback only.

Before any new code change, fetch/read:
1. `CITY_OUTBREAK_HANDOFF.md`
2. `NEXT_CHAT_HANDOFF.md`
3. current `main:index.html`
4. current `main:src/game.js`
5. any directly relevant module, especially `src/wave-utils.js`

Do not work from stale conversation code.

## What is live now

### City
Active environment:
`assets/chicken_gun_fruzer_-_city.glb`

Current transform:
```js
const NEW_CITY_SCALE=1.55;
const NEW_CITY_X_OFFSET=21.33575;
const NEW_CITY_Y_OFFSET=28.68275;
const NEW_CITY_Z_OFFSET=8.25;
```

Old procedural roads/city, old road texture, barriers, lamps, and old parked STI props are disabled.

### Character/world scale
```js
const PLAYER_WORLD_SCALE=1.20;
const ZOMBIE_WORLD_SCALE=1.15;
```

Camera height:
`playerGroundY + 1.65 * PLAYER_WORLD_SCALE`

### M4
The user said the rifle looked held too far out. Current hip/ADS Z tuning:
```js
m4ViewRoot.position.z =
  reloading ? -1.66 : THREE.MathUtils.lerp(-1.62,-1.66,aimBlend);
```
Do not disturb approved ADS/reload behavior unless asked.

## Collision/navigation

Current wall collision:
```js
const NEW_CITY_COLLISION_CELL=.34;
const NEW_CITY_COLLISION_MIN_Y=.10;
const NEW_CITY_COLLISION_MAX_Y=2.25;
const NEW_CITY_COLLISION_MIN_VERTICAL_SPAN=.55;
```

Other current navigation values:
```js
const ZOMBIE_COLLISION_RADIUS=.38;
const ZNAV_CELL=1.5;
const ZNAV_PAD=.44;
const ZNAV_MAX_NODES=3600;
const playerWallRadius=.36;
```

- Collision is generated from real near-vertical GLB wall geometry.
- Roads/floors/roofs/shallow curbs remain walkable.
- v324 deliberately uses finer collision/nav and smaller player/zombie clearance than v323 so tight alleys, stoops, door approaches, railings, and other narrow passages are usable.
- Do not globally increase these radii/padding to fix a single problem.

### Stairs
```js
const PLAYER_STEP_UP=.62;
const PLAYER_STEP_DOWN=1.35;
```

`samplePlayerGroundY()` raycasts the real GLB and follows upward-facing stair/ground surfaces. The camera uses `playerGroundY`. This was added because stairs previously behaved like walls / flat ground.

## Zombie spawning

Current spawning is restricted to real outdoor ground:
- only `Road_*` and `ParkingBG_*` mesh bounds become spawn zones,
- large `BG_*` planes are excluded,
- `validZombieSpawn()` also rejects wall collision and requires >22 units from player,
- normal spawn search = 24–42 units,
- boss spawn search = 28–46 units,
- candidate must have a direct or A*-reachable route.

This fixed zombies spawning inside buildings and getting trapped. Preserve it.

## Waves / active cap / headshots

`src/wave-utils.js` normal wave formula:
```js
count:10+(w-1)*3
```

Active cap:
```js
const MAX_ACTIVE_ZOMBIES=30;
```

Non-boss headshot formula:
```js
const headshotToughness=1+Math.max(0,wave-1)*.2;
z.hp-=shotDamage*3/headshotToughness;
```

Boss headshots stay on their separate boss formula.

## Player sprint / round reset

- walk speed = 5
- sprint speed = 9.5
- sprint drain ~= 33.34/sec
- recharge = 14/sec
- every new round restores health to 100
- every new round restores sprint to 100 and clears sprint lock

## Workflow rules for this user

- Do the GitHub work directly.
- One controlled change at a time.
- Do not ask the user to manually edit/upload or run Git commands.
- Verify exact diff and locked values.
- Temporary inspection/syntax workflow is okay, then delete it.
- Final `.github/workflows` should contain only `v182-validation.yml`.
- Wait for successful Pages deployment before giving a test URL.
- Use a new cache-busted link each test.
- Never say gameplay is fixed just because code deployed; user live testing is authoritative.

## Protected fallback

Primary recovery now:
`afddcebb47e06a82b4196638716f05e6f1adc941` / tree `5721309fc27f9f16ee7a2568a7f73fd429342502`

Secondary clean fallback:
v303 tree `ce560411d2751ccdc8068bfa16753cc77adeb74a`

Do not resurrect Trailer Park, Havana, or old procedural-city experiments unless the user explicitly asks.

## Best next action

Do **not** invent the next feature. The current build is intentionally frozen as the new recovery point. Read the user's next request and make the smallest change that satisfies it while preserving v324.

---

# CURRENT NEXT-CHAT STATE — 2026-09-28 — READ THIS FIRST

This section supersedes older v260 "current checkpoint" notes below.

- Current approved modular build: **v303**
- Current approved gameplay/code commit: **8e0c312eab781ba978ebb7f5bf503253e0d5e955**
- GitHub Pages loader: `./src/game.js?v=303`
- Last fully approved pre-modular gameplay baseline: **v257**
- v257 commit: **138e961c2597cb5ff6099798314d1f40308388c4**
- The user tested v303 and said it works fine. Treat v303 as the current approved recovery point.
- v301 was comments/documentation only.
- v302 consolidated already-approved reset UI overlay cleanup into `resetRunUiOverlays()`.
- v289 is the approved pause behavior; v290/v291 were reverted.

## Live helper modules now in use

- `src/performance-hud.js`
- `src/ui-helpers.js`
- `src/render-utils.js`
- `src/format-utils.js`
- `src/input-utils.js`
- `src/zombie-rig-data.js`
- `src/wave-utils.js`

`src/game.js` remains the live gameplay/state runtime. The recently completed v277–v286 work moved safe input/UI/event plumbing only; gameplay decisions remain in `game.js`.

## v301–v303 most recent work

- **v301** `9410af6c6e999d5451afd5850b8f6ec28e55e0e5` — refreshed stale module header comments. `input-utils.js` now accurately says it owns browser-event/input plumbing; no intended gameplay behavior change.
- **v302** `1a6b95e0af4c5170dee1dfaaa1618e8b4264613c` — added `resetRunUiOverlays()` in `src/ui-helpers.js` and replaced the cluster of already-approved reset UI cleanup calls with that helper. Start-screen hiding, hit-marker timer clearing, pointer lock, audio init, state reset, wave spawn, and gameplay remain in `game.js`.
- **v303** `8e0c312eab781ba978ebb7f5bf503253e0d5e955` — extracted only `diff(w)`, `isBossWave(w)`, `bossTier(w)`, and `bossScaleFactor(w)` into `src/wave-utils.js`; formulas and gameplay values were unchanged. The user tested it and said it works fine.

## Next-step guidance

The easy input/UI/reset work and pure wave calculation extraction are complete through v303. Do not keep extracting tiny functions just to modularize more.

Repository housekeeping after v303 removes the stale, unused scaffold files `src/config.js`, `src/main.js`, `src/weapons.js`, and `src/zombies.js`; they had no live references. Keep `src/audio.js` present but unused because live audio remains inline in `game.js`.

Next direction: favor actual bug fixing/gameplay/map/content polish, or only a genuinely cohesive behavior-neutral subsystem if more structural work is needed. Keep boss-name state, `nextBossName()`, `ensureBossWaveName()`, `bossPressureSpeed()`, `bossWaveSpec()`, boss attacks/spawning, and all sensitive systems in `game.js` for now.

After any live-runtime change: atomic commit -> verify exact diff/locked values -> wait for Pages deployment success -> give cache-busted test link -> wait for user approval.

Continue to avoid high-risk areas unless deliberately tackling them:
- audio extraction
- reloads
- weapon ADS/firing rays
- zombie AI/pathing
- store pause/low-power timing
- frame loop/game timing

Keep the one-change → commit → verify → Pages deploy → user test workflow.

---


Read CITY_OUTBREAK_HANDOFF.md first. It is the authoritative full project state.

## Current working checkpoint

- Current modular build: v260
- Current modular gameplay/file-structure checkpoint: 29c3b445c75952dd264f8f844333c88db0b51c40
- Last fully approved pre-modular gameplay baseline: v257
- v257 commit: 138e961c2597cb5ff6099798314d1f40308388c4

The user has reached the conversation limit and wants development continued in the next chat.

## What just happened

We started splitting the giant index.html into real files.

Current live structure:
- index.html — HTML/UI shell and import map
- src/game.css — live CSS
- src/game.js — main live runtime
- src/zombie-rig-data.js — exact live zombie rig data imported by game.js

Important:
- src/audio.js exists but is NOT live.
- Audio extraction caused sound to disappear.
- Proven audio code was restored inline in src/game.js.
- Do not re-import src/audio.js without carefully reworking and testing it.

The first CSS extraction also broke the start-screen image because relative URLs changed.
Current correct CSS path is:
- ../assets/city-outbreak-start-v153.jpg.jpg

Current index.html cache-busts:
- ./src/game.css?v=260
- ./src/game.js?v=260

## First thing to do next chat

1. Fetch current main:index.html.
2. Fetch current src/game.js.
3. Fetch current src/game.css.
4. Read CITY_OUTBREAK_HANDOFF.md.
5. Preserve the current v260 behavior exactly before further modularization.

## Current task to continue

Continue item #2: modularize the game safely.

Do it ONE self-contained system at a time.

Recommended next target:
- UI-only helpers, performance HUD, or simple utilities.

Avoid next:
- audio
- weapons
- reload code
- zombie AI/pathing

Weapons/zombies/reloads have been heavily tuned and are high-risk.

After every extraction:
1. commit directly to main
2. update cache-bust if needed
3. re-fetch/verify
4. give the user a GitHub Pages test link
5. wait for user testing before extracting another major system

## Regression checklist after every extraction

Must still work:
- start screen visible
- Start Outbreak works
- Controls modal works
- game starts
- sound works
- M17 irons hit where aimed
- M4 unchanged
- MP5 unchanged
- all reload animations unchanged
- zombies path correctly
- no zombie ping-pong
- shop opens
- shop low-power freeze works
- Ready resumes
- pause works
- restart works
- performance HUD works

If an extraction breaks any of these, fix/revert it before proceeding.

## Locked reload rule

Do not change any reload animation unless the user explicitly asks for that specific weapon.

Especially preserve:
- M4 reload
- MP5 reload
- M17 reload

## M17 current state

- ADS: pistol:{x:-.36,y:.058,z:-.32,fov:55,rx:.045}
- actual bullet ray is true screen center
- pistolAdsZero=0
- hit marker centered
- 16-round mag
- effectively unlimited reserve
- reload locked

## Zombie pathing current state

Preserve:
- MAX_ACTIVE_ZOMBIES = 20
- full-city A* navigation
- nav X about -148 to 148
- nav Z about -158 to 164
- node budget 2600
- reachable spawn checks
- stuck-side probing instead of blind flip
- last-five rush behavior

## Shop optimization current state

Store low-power mode:
- freezes simulation
- freezes game timers
- suspends audio
- 3D background about 4 FPS
- throttles frame callback
- blocks gameplay hotkeys
- resumes exact game time on Ready

## User workflow

The user wants the assistant to:
- do the GitHub work directly
- not give Git instructions
- keep changes small
- provide live test links
- use screenshots as ground truth
- avoid touching approved systems without a reason

Do not trust old src/config.js, src/main.js, src/weapons.js, or src/zombies.js. They are stale scaffolding, not the live source of truth.
