# CITY OUTBREAK — NEXT CHAT HANDOFF

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
