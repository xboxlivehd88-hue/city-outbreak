# CITY OUTBREAK — AUTHORITATIVE HANDOFF

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
