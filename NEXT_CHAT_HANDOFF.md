# CITY OUTBREAK — NEXT CHAT HANDOFF

# CURRENT NEXT-CHAT STATE — 2026-09-29 — READ THIS FIRST

**Read `CITY_OUTBREAK_HANDOFF.md` before making any change. Its newest top section is authoritative.**

## Checkpoints

- **Protected clean fallback: v303**
  - approved v303 gameplay commit: `8e0c312eab781ba978ebb7f5bf503253e0d5e955`
  - clean v303 restore commit: `d7618b8dc26b982f0cfcc8f36b7123e57827a279`
  - exact clean restore tree: `ce560411d2751ccdc8068bfa16753cc77adeb74a`
- **Current live runtime: v334**
  - runtime commit: `c90b33b685ffba3d056a1fe53464930a411de788`
  - loader: `./src/game.js?v=334`
  - Pages deployment succeeded
- **Immediate pre-collision comparison point: v333**
  - commit: `e07067ba609dbf74f4fd50e2c5d04a6f1f455358`
  - same Trailer Park and current helmet tuning, before the v334 collision builder

The user explicitly wants **v303 kept as a good fallback**. Do not redefine the fallback to v334.

## Current visuals that should stay locked

Trailer Park:
```js
const TRAILER_PARK_SCALE=1.25;
const TRAILER_PARK_Y_OFFSET=.97;
```

Helmet:
```js
const ZOMBIE_HELMET_TARGET_WIDTH=.38;
const ZOMBIE_HELMET_HEAD_Y=.055;
const ZOMBIE_HELMET_HEAD_Z=-.085;
const ZOMBIE_HELMET_PITCH=.06981;
```

The user said **helmet size is great**. Do not resize it unless specifically asked.

Helmet asset: `assets/ww2_stahlhelm_m35_heer.glb`.
Trailer Park asset: `assets/trailer_park.glb`.

Every zombie gets a visual-only helmet: standing types attach to the animated Head bone, crawlers to their procedural head. Helmet raycasts are disabled, so headshot collision remains the existing zombie hitbox.

## What was happening at the handoff

The user asked whether the Trailer Park GLB contained collision. Inspection found no dedicated authored collision/physics data. The user then asked to build collision.

v334 is the first targeted collision pass:
- groups `Home...` meshes into conservative home footprints
- uses triangle-coverage segmentation for long Fence/Railing meshes instead of one giant AABB
- adds conservative metal trash-can collision
- skips tiny/low/distant geometry
- protects the player spawn around `(0,-15)`
- clears the zombie nav block cache after rebuilding

The collision pass was deployed successfully, but the conversation ended before a separate focused user collision test was reported.

## FIRST TASK NEXT CHAT

**Do not start new features first. Test/finish the v334 Trailer Park collision pass.**

Test with the user:
- spawn movement is free
- trailer/home walls block appropriately
- fence openings remain passable
- no long invisible fence walls
- no getting snagged on overly fat colliders
- zombies still path to the player and do not ping-pong or become unreachable

If a collision problem exists:
- edit only the targeted collision builder first
- keep map scale/Y and helmet transform unchanged
- compare against v333 if necessary
- never revert to the old generic "AABB every mesh" Street City approach
- only fall all the way back to v303 if there is a broader gameplay regression

After collision is user-approved, the next logical work is to tune zombie navigation/search bounds for the Trailer Park **only if actual testing shows it is needed**. Do not preemptively rewrite pathing.

## Locked regression-sensitive systems

Do not casually touch:
- audio (live/proven audio is inline in `src/game.js`; `src/audio.js` unused)
- all reloads
- M17/M4/MP5 ADS/firing alignment
- boss combat/chest hitbox
- store low-power timing
- frame-loop timing
- v289 pause behavior
- start/restart/death/start-screen behavior
- v303 wave-utils formulas
- `MAX_ACTIVE_ZOMBIES=20`

## Work style required

The user wants the assistant to do the GitHub work directly, not give Git/manual upload instructions.

For every runtime change:
1. fetch latest `main` source first
2. one atomic change
3. commit to `main`
4. verify exact diff + locked values
5. wait for Pages success
6. provide cache-busted live link
7. wait for user testing

Do not say something is "fixed" until the user tests it.

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
