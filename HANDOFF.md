# CITY OUTBREAK — CURRENT CHAT / DEVELOPER HANDOFF

Last updated: 2026-09-24

## Project / deployment

- Repository: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Source of truth: root `index.html`
- GitHub Pages: https://xboxlivehd88-hue.github.io/city-outbreak/
- Current gameplay build to test: https://xboxlivehd88-hue.github.io/city-outbreak/?v=139
- Debug build: https://xboxlivehd88-hue.github.io/city-outbreak/?v=139&debug=1
- Current `index.html` blob SHA at handoff: `b4e68f63054d04acc56288be8239f2b74811d08b`
- Current branch HEAD before this handoff-doc commit: `af3f1d55fe5a1227be6c7cec5ed69a120c2669ac`
- Latest gameplay commit: `4f6e29de1a45250e42fe66d330fd544c1465fcd1` — `Add zombie gore and infected visual detail v139`
- Pages deployment for the current branch completed successfully.

IMPORTANT: the handoff/documentation commit comes after the gameplay commit. Do not treat the handoff commit as a gameplay change.

## Mandatory working method

The user expects the assistant to do the GitHub work directly. Do not make them paste code, upload files, download files, or manually deploy unless an actual GitHub tool call fails.

For every gameplay change:

1. Fetch the latest `main:index.html` from GitHub first.
2. Treat that exact file as the only source of truth. Never patch an old local copy.
3. Modify only the requested behavior; preserve unrelated systems.
4. Sanity-check braces/parentheses and obvious JS syntax if possible.
5. Push directly to `main` using the current blob SHA.
6. Check GitHub Pages / Actions until deployment succeeds.
7. Give the user a cache-busted live link.
8. Increment the cache-bust version by one for a new gameplay release.

The next gameplay release after the current v139 should normally be **v140**.

Do not tell the user GitHub/repo-write is unavailable unless a real GitHub connector call in that session actually fails. The user strongly prefers end-to-end execution.

## Immediate state / next-chat priority

Current stable gameplay build is **v139**.

Latest visual/zombie progression:

- v133 preserved the exact walker identity when both legs are lost and fixed visible neck/crawler identity
- v134 gave converted crawlers dedicated low shooting/head/arm hitboxes and crawler grenade-impact height
- v135 cleaned native crawler geometry and strengthened ragdolls across all zombie deaths
- v136 corrected backward-looking knees and added smoother distance-synced walk/run locomotion
- v137 softened flat shading and rounded walker silhouettes
- v138 added human facial anatomy to walkers and native crawlers: nose, cheeks, ears, jaw/chin, brows, mouth, clavicle/shoulder transitions
- **v139** adds the undead/gore pass: cooler corpse-like skin, darker/sunken eye sockets, wet dark-red face/jaw blood, collar/chest gore, stronger limb wounds, and properly repositioned crawler face/chest wounds
- v139 intentionally preserves v136 movement speeds/AI/pathing, v134 hitboxes, v135 ragdolls, crawler conversion identity, drop rate 52%, and the 20-active-zombie performance cap

Current live test:
https://xboxlivehd88-hue.github.io/city-outbreak/?v=139

If the user reports zombie visual issues next, fetch the newest `main:index.html` first. Do not undo the v136 locomotion correction or v134 converted-crawler hitboxes while tuning appearance.

## Current reload-system code to inspect

Relevant globals near the gun setup:

```js
let playerHandRig=null,
    playerReloadPart=null,
    reloadStartedAt=0,
    reloadDurationMs=0,
    reloadWeapon="",
    reloadOldMagDropped=false,
    reloadFreshMag=null,
    reloadFreshInsertStart=null,
    reloadFreshInsertQuat=null,
    reloadFreshAttached=false,
    reloadMagInserted=false;
```

Relevant functions:

- `HAND_POSES`
- `fpsArmSegment(...)`
- `fpsHand(...)`
- `addPlayerHands()`
- `smoothReload01(...)`
- `reloadPoseProgress()`
- `detachableMagazineReload(...)`
- `clearReloadMagazineFX(...)`
- `beginReloadMagazineFX()`
- `tossOldReloadMagazine()`
- `spawnFreshReloadMagazine()`
- `updateReloadMagazineFX(rp)`
- `finishReloadMagazineFX()`
- `rebuildGun()`
- `reload(w=weapon)`
- first-person transforms inside `move(dt)`
- temporary physics cleanup in `parts[]`

Current detachable reload weapons:

```js
const DETACHABLE_RELOAD_WEAPONS = new Set([
  "rifle","smg","pistol","dmr","m240","awm"
]);
```

Shotgun and grenade launcher intentionally do not use the magazine-toss sequence.

### Current v124 smoothing behavior

`reloadPoseProgress()` now uses separate concepts for:

- `arch` — gun dip/tilt
- `hand` — support-hand travel
- `pull` — pulling old mag out
- `pouch` — hand moving down toward/away from the pouch

The discarded-mag throw velocity was deliberately reduced so the old magazine should stay visible:

```js
const throwV = new THREE.Vector3(-.48,-.10,-.22).applyQuaternion(cam.quaternion);
```

Discarded magazines stay alive around 2.15 seconds and use `reloadMag:true` in `parts[]` so they spin/fall/bounce similarly to other temporary physics pieces.

The real magazine is kept visible during the pull stage, then hidden only after the discard is created.

The fresh replacement magazine is intentionally delayed until the hand reaches the pouch area.

### If v124 still looks wrong

Do not immediately change gun geometry or ADS. Prefer tuning these first:

- old-mag release time
- discarded-mag velocity / spin
- how long the hand visibly holds the old magazine before release
- length of the empty-hand gap
- how low/off-screen the support hand travels to the pouch
- fresh-mag spawn timing
- fresh-mag local position relative to the left hand
- insertion start/end times
- support-hand return timing

A stronger version, if needed, would explicitly attach the **old** magazine clone to the support hand for a short pull-out phase before detaching it into world physics. That would make it unmistakable that the hand removed it. Only do this if v124 is still visually unclear.

## First-person hands / gun presentation

Visible tactical-gloved hands and forearms were added in v122 so weapons no longer look like they float in mid-air.

`HAND_POSES` contains per-weapon hand positions for:

- Rifle
- SMG
- Shotgun
- Pistol
- DMR
- Grenade Launcher
- M240
- AWM

Reloading automatically exits ADS via `setAim(false)` so the player can see the animation.

Important: gun/ADS tuning took many iterations and the user previously asked to leave the guns alone. The current hand/reload work is an exception because the user explicitly requested it. Do not casually rebuild weapon silhouettes or ADS alignment while polishing reloads.

## Recent gameplay history

### v114 — explosion knockdown recovery

Normal zombies hit by surviving grenade/launcher blasts:

- fall to the ground
- cannot move/attack while down
- stay down longer from stronger/closer blasts
- get back up and resume pursuit
- repeated blasts can extend knockdown

Bosses resist full knockdown.

### v115 — parked-car collision

Old oversized circular car hitboxes were replaced with oriented footprints based on vehicle dimensions.

Important helper:

```js
carPointCollision(...)
```

Player can slide around cars instead of getting caught on large invisible circles.

### v116–v119 — zombie pathing / hunt AI

Zombies now have:

- look-ahead obstacle awareness
- remembered left/right avoidance choices
- stuck detection
- route recalculation
- bounded lightweight A* routing around buildings/cars
- waypoint following with line-of-sight smoothing

Important helpers:

- `zombiePointBlocked(...)`
- `chooseZombieAvoidSide(...)`
- `moveZombieSmart(...)`
- `zombieRouteClear(...)`
- `buildZombieRoute(...)`
- `updateZombieRoute(...)`
- `zombieRouteWaypoint(...)`

A* is bounded for performance (`ZNAV_MAX_NODES=1300`). Preserve that performance safeguard.

### Final-five hunt mode

When total remaining zombies <= 5 and no boss is active, normal remaining zombies aggressively hunt the player so the player does not have to search the city.

Current tuned rush speeds after the user asked to reduce them by 2:

- close: ~5.0
- medium: ~5.4
- far: ~5.8
- cap: ~6.15

Player full sprint is 9.0, so a player with sprint can still escape.

Keep the aggressive pathing even if speed is later retuned.

### v120 — boss explosive collision / reaction

Boss projectile chest collision was enlarged so grenade-launcher rounds do not pass through the large visible chest.

Boss explosive reaction is a short controlled flinch / Hit reaction, not the normal-zombie knockdown and not the old broken sideways blast lean.

### v121 — living-body collision + round cleanup

Player and upright living zombies can no longer ghost through each other.

Helpers include:

- `zombieContactRadius(z)`
- `resolvePlayerZombieContact(...)`
- `resolveZombiePlayerContact(...)`

Boss has a larger contact radius.

Knocked-down zombies remain passable so they do not trap the player.

At the beginning of a new round, old dead zombie bodies and severed limbs are swept/removed in a batch for performance.

### v122 — hands + initial reload motion

Added first-person hands/forearms and gun dip/tilt/support-hand movement.

### v123 — magazine swap

Added:

- removable old magazine
- discarded magazine physics
- fresh magazine prop
- fresh-mag insertion
- pistol removable magazine
- M240 ammo-box handling

Gameplay commit for v123 was `5fd9b25353ec0dadf385b3860a3f6b6b69f6a325`.

### v124 — reload readability smoothing

Latest gameplay commit:

`ec1e9c4472e03676a230a2a00df5140c62e32f41`

Goal: make old-mag removal/drop, empty-hand pouch reach, fresh-mag pickup, and insertion visibly distinct.

## Weapons

Weapon slots:

1. Rifle
2. SMG
3. Shotgun
4. Pistol
5. DMR
6. Grenade Launcher
7. M240 LMG
8. AWM Ultimate

All unlockable gun prices are still intentionally **$1 for testing**. Do not restore normal prices unless asked.

Important weapon behavior:

- M240: 100-round mag / ammo box, 200 reserve when unlocked, full-auto
- AWM: 5-round mag, 20 reserve, bolt-action delay, very high damage, scoped ADS
- Grenade Launcher: 6-round mag, hard 10 TOTAL carry cap including loaded rounds, impact projectile
- all weapons support auto-reload on empty while manual `R` remains available

## Boss system

Boss every 10 waves: 10, 20, 30, etc.

Features:

- warning after 9/19/29/etc.
- random boss name
- boss health bar
- bosses scale around 10% each boss cycle
- Blood Slam
- Gore Rush
- guaranteed reward cache
- tactical-nuke immunity
- headshots do heavy damage, not instant kill
- enlarged grenade-launcher chest collision
- explosive flinch only; no full knockdown

Do not regress the boss chest hitbox fix.

## Zombie visuals / ragdoll

Standing zombies use embedded rigged glTF skeletal animation. Crawler remains procedural fallback.

Important rig-material fix that must remain:

```js
side=THREE.DoubleSide
transparent=false
opacity=1
depthWrite=true
depthTest=true
```

This fixed a severe see-through zombie issue.

Death system includes:

- visible limb detachment
- bloody stumps
- detached limb physics
- staged body collapse
- explosion impulse ragdolls
- living explosion knockdown/get-up behavior

Do not casually replace the approved zombie visual baseline.

## Waves / performance

Critical performance rule:

```js
MAX_ACTIVE_ZOMBIES = 20
```

The user specifically said the game became much smoother with this system. Keep it.

Other performance work to preserve:

- static city batching
- cached city/facade materials
- cached zombie/drop textures
- shared explosion geometry/materials
- no pickup PointLights
- decorative objects excluded from shadow pass
- pixel ratio cap 1.25
- corpse/item cleanup
- max ~32 item drops
- optional `?debug=1` HUD
- A* route search bounded and low-frequency

User test PC / minimum-performance reference:

- Dell OptiPlex 5050
- i5-7600
- 16 GB RAM
- Radeon R5 340 2 GB
- Intel HD 630

Draw-call overhead has historically been a bigger concern than polygon count.

## Sprint

Current movement:

- walk: 5
- sprint: 9
- about 3 seconds of full sprint
- about 7 seconds to fully recover from empty
- exhausted sprint locks until full recharge

Health/sprint HUD is bottom-left.

## Cars / map

Car visuals are currently paused/stable. Do not resume redesigning them unless asked.

Car collision was tightened in v115 and should not be reverted to a simple large center-radius check.

Map/building layout is also stable. Preserve static batching and collision anchors.

## Death / restart / run summary

Death screen supports direct restart without browser refresh.

Current run summary includes:

- kills
- run time
- wave reached
- rounds cleared (`wave - 1`)

Restart invokes the existing full `reset()` path.

## User preferences / communication

The user is collaborative and likes short, practical status messages.

Strong preferences:

- do the code work for them
- push to GitHub directly
- do not repeatedly explain manual Git/GitHub steps
- preserve stable systems while changing only the requested behavior
- give a cache-busted live link after gameplay changes
- respond well to screenshot-driven iteration

When the user says something feels wrong, first inspect the exact current code before changing anything. They care about regressions.

## Next-chat copy/paste summary

If starting a new chat, the user can paste this:

> We are continuing my browser FPS game CITY OUTBREAK. Repo: `xboxlivehd88-hue/city-outbreak`, branch `main`, live site `https://xboxlivehd88-hue.github.io/city-outbreak/`. Read the root `HANDOFF.md` first, then fetch the latest `main:index.html`; never work from a stale copy. Do all GitHub edits/pushes/deploy checks for me. Current gameplay build is v124. Latest gameplay commit is `ec1e9c4472e03676a230a2a00df5140c62e32f41` (`Smooth magazine drop and fresh reload sequence`). Current work is first-person reload polish. We added visible hands, removable magazines, discarded-mag physics, a deliberate empty-hand pouch reach, fresh-mag pickup, and reinsertion. I have not yet confirmed v124 visually. First have me test `https://xboxlivehd88-hue.github.io/city-outbreak/?v=124`. If it still needs work, make old-mag removal/drop, empty-hand reach, fresh-mag pickup and insertion easier to see without changing the gun models/ADS. Preserve all existing zombie AI/pathing, boss behavior, collisions, performance optimizations, $1 test gun prices, and 20-active-zombie cap. After the next gameplay change push to main, verify Pages, and give me `?v=125`.


## Recent release history (v125-v139)

- v125 — shotgun base 8 shells + shell-by-shell reload
- v126 — maintenance/performance pass: nav-cell cache, async sequence guards, resource cleanup, hot-path allocation reductions
- v127 — grenade-launcher break-action reload with visible round insertion
- v128 — SMG renamed MP5 and first MP5-style geometry pass
- v129 — denser MP5 geometry, corrected sights, improved shouldered ADS
- v130 — performance cleanup: removed per-zombie PointLights, cached hit meshes, reduced allocations/shadow work
- v131 — normal walkers cross-fade to Sprint animation during final-five hunt mode without changing movement speed
- v132 — walker geometry/head connection, double-leg-loss crawler conversion, drop chance 32%→52%, higher floating drops
- v133 — same-zombie crawler conversion identity + native crawler head/neck cleanup
- v134 — dedicated low converted-crawler hitboxes + crawler explosive collision fix
- v135 — crawler geometry cleanup + stronger all-zombie ragdoll response
- v136 — corrected knee bend direction + smoother distance-synced walking/running
- v137 — smoother shading + rounded walker skull/jaw/body silhouette
- v138 — humanized walker and native crawler facial/body anatomy
- v139 — corpse tones, sunken sockets, face/jaw blood, collar/chest gore, crawler wound repositioning

