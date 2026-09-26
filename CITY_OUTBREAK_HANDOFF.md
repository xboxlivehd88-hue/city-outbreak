# CITY OUTBREAK — AUTHORITATIVE HANDOFF

Last updated: 2026-09-26

Repository: xboxlivehd88-hue/city-outbreak  
Branch: main  
Live game: https://xboxlivehd88-hue.github.io/city-outbreak/  
Active runtime entry: `index.html`

Live modular files:
- `src/game.css`
- `src/game.js`
- `src/audio.js`
- `src/zombie-rig-data.js`

## CURRENT BASELINES

- Last user-approved gameplay checkpoint: **v257**
- Approved gameplay commit: `138e961c2597cb5ff6099798314d1f40308388c4`
- Last user-approved gameplay checkpoint remains **v257**
- Modularization checkpoint commit: `d17c08eb0d86d86cc4feb984a739383a0ecb9c4f`
- Current `index.html` is now a small shell that loads the live files from `src/`

The cleanup commits after v257 are intended to preserve gameplay feel. They address timer polling, reset state, shop input isolation, wave-transition movement, muzzle-flash ownership, dead state, and performance-console noise.

## WORKFLOW — IMPORTANT

1. Fetch current `main:index.html` before every edit.
2. Make the smallest targeted change possible.
3. Commit directly to `main`.
4. Re-fetch and verify the changed lines.
5. Return a fresh cache-busted GitHub Pages test link.
6. User screenshots/live testing are ground truth.
7. Do not give Git instructions when the connector can do the work directly.
8. Do not claim a visual/gameplay fix is approved until the user tests it.

## LOCKED WEAPON RULE

The user explicitly said all reload animations are locked unless that specific weapon is explicitly requested.

Do **not** alter reload choreography for:
- M4
- MP5
- M17
- shotgun
- DMR
- grenade launcher
- M240
- AWM

unless the user specifically asks for that weapon's reload to change.

## M17 SIG — CURRENT APPROVED DIRECTION

The latest ADS correction that the user reacted positively to before the cleanup pass:
- ADS config: `pistol:{x:-.36,y:.058,z:-.32,fov:55,rx:.045}`
- ADS bullet ray: true screen center (`pistolAdsZero=0`)
- visual hit marker: centered at 50% / 50%
- reload remains locked
- 16-round magazine
- effectively unlimited reserve
- no SIG ammo drops

Do not reintroduce the old `-.14` ADS bullet-ray offset unless the user explicitly reports the current sight picture is wrong again.

## M4 — CURRENT LOCKED STATE

External asset:
- `assets/classic_m4.glb.glb`

Current root:
- scale `5.15`
- rotation Y `Math.PI`
- base position `(x,-.25,-1.66)`
- hip-only Z moves to about `-1.78`
- ADS remains at the approved position

ADS:
- `rifle:{x:-.36,y:.030,z:.72,fov:48,rx:0}`

M4 reload is user-approved and must not be touched unless explicitly requested.

## MP5 — CURRENT LOCKED STATE

External asset:
- `assets/animated_mp5.glb`

Visible baked meshes:
- `Object_126`
- `Object_128`
- `Object_130`

Hip root:
- scale `2.25`
- position `(.30,-.70,-1.12)`
- yaw `0`

ADS:
- `smg:{x:-.36,y:-.050,z:1.28,fov:55,rx:-.01}`
- ADS yaw about `1.05°`
- SMG ADS ray corrections:
  - X `-.018`
  - Y `-.025`

Custom MP5 recoil uses a rear pivot instead of whole-gun recoil.

MP5 reload is currently locked unless explicitly requested.

## ZOMBIE PATHING — CURRENT STATE

Current navigation improvements:
- A* covers the full playable city instead of the old central-only rectangle.
- Navigation bounds are approximately:
  - X: `-148 .. 148`
  - Z: `-158 .. 164`
- A* node budget: `2600`
- new zombies prefer reachable spawn points
- blocked spawn candidates are route-tested
- stuck recovery probes a better side instead of blindly flipping left/right
- last-five rush behavior remains
- `MAX_ACTIVE_ZOMBIES = 20`

Do not undo the expanded nav bounds or reachable-spawn checks without a specific reason.

## SHOP / PAUSE PERFORMANCE

The between-wave shop now enters low-power mode:
- gameplay simulation frozen
- game timers frozen
- audio suspended
- 3D canvas renders about 4 FPS
- frame callback throttled
- gameplay keys ignored while shopping
- Ready resumes from the same game-time state

Recent cleanup also makes `gameTimeout()` poll slowly while shop time is frozen.

## RESET / STABILITY CLEANUP

A new run now resets:
- player velocity
- previous player position
- recoil
- step timer
- aim offsets
- stale hit marker/message/damage/nuke UI

Wave completion also clears held movement immediately so the player cannot drift during the shop transition.

## START SCREEN

Start artwork:
- `assets/city-outbreak-start-v153.jpg.jpg`
- displayed with `center top / cover`
- fills the viewport without distortion or black bars

The image itself contains visible Settings and Controls artwork. Only Controls is currently wired to a real modal; Settings is not yet an implemented menu.

## VEHICLES / MAP

- STI parked-car asset is active: `assets/2018_subaru_wrx_sti.glb`
- parked-car collision uses tighter oriented footprints
- static city batching is active
- road texture is `assets/textures/roads/road_albedo.jpg.jpg`

## PERFORMANCE NOTES

- Performance HUD remains visible for live diagnosis.
- Per-second performance console logging is disabled by default.
- The heaviest startup assets are the road texture, STI, MP5, and M4 GLBs.
- Do not perform a large visual/performance refactor during weapon tuning.

## REPOSITORY STRUCTURE

The modular split is now underway.

Current live runtime:
- `index.html` — HTML/UI shell + import map
- `src/game.css` — exact extracted live CSS
- `src/game.js` — main live gameplay runtime
- `src/audio.js` — extracted live audio system
- `src/zombie-rig-data.js` — exact live zombie rig data previously embedded in game.js

Important:
- `src/config.js`, `src/main.js`, `src/weapons.js`, and `src/zombies.js` are older scaffold files and are **not yet active runtime modules**.
- `build/game.part*` files are also old fragments.

Continue the split one system at a time and test after each extraction. Do not rewrite weapon or zombie systems wholesale.

## SAFE NEXT CLEANUP OPPORTUNITIES

These were identified but intentionally not changed in the current low-risk cleanup pass:
- split the 589 KB `index.html` incrementally into real runtime modules
- optimize/compress very large static assets, especially the 4K road texture and heavy GLBs
- wire the baked Settings button to a real settings menu
- optionally make the performance HUD toggleable once active performance debugging is no longer needed

## DO NOT REGRESS

Preserve unless specifically requested:
- current M17 sight alignment
- M4 / MP5 / M17 viewmodel placement
- all reload choreography
- zombie pathing improvements
- boss behavior and boss chest hitbox
- crawler/head hitbox behavior
- STI collision footprint
- shop low-power mode
- player sprint/movement feel
- weapon damage/balance
- current start-screen presentation
