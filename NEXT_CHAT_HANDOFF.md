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
