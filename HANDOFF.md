# City Outbreak — Chat / Developer Handoff

Last updated: 2026-09-21

## Project links

- Repository: https://github.com/xboxlivehd88-hue/city-outbreak
- Branch: `main`
- GitHub Pages: https://xboxlivehd88-hue.github.io/city-outbreak/
- Current cache-busted test build: https://xboxlivehd88-hue.github.io/city-outbreak/?v=88
- Debug / performance build: https://xboxlivehd88-hue.github.io/city-outbreak/?v=88&debug=1
- Source of truth: root `index.html`

IMPORTANT: Do not overwrite root `index.html` from older local copies. Always fetch the current GitHub `main:index.html`, patch that file, then push it back.

## Current release state

Gameplay baseline immediately before this handoff:

- Commit: `eee0417d2778b9167fb167fc31497d39b9af946c`
- Message: `Recenter ADS and add full sniper crosshair`
- GitHub Pages deployment completed successfully.
- This commit was made in response to the user reporting that ADS was off-center and the AWM scope did not have a complete crosshair.
- The user has NOT yet confirmed the v88 result. The next chat should have the user test v88 before reworking ADS again.

The handoff documentation commit(s) come after the gameplay commit above and should not be treated as gameplay changes.

## User workflow / expectations

The user tests directly in Chrome on Windows and sends screenshots. They prefer:

- direct code changes instead of long conceptual plans
- pushing changes to GitHub for them
- a live GitHub Pages link after each update
- short, practical progress messages
- preserving a good stable baseline instead of redesigning unrelated systems
- cache-busted links (`?v=89`, `?v=90`, etc.) after future changes

When a change is pushed:
1. Fetch the latest root `index.html`.
2. Patch only what is needed.
3. Push to `main`.
4. Check the GitHub Pages Actions workflow.
5. Give the user a cache-busted Pages link.

## Immediate priority: ADS

The current active work is aim-down-sights.

User's desired ADS reference:
- looks like a conventional FPS iron-sight view
- rear sight centered on screen
- front sight aligned inside/through rear sight
- gun body should not block the sight picture
- sights must visually be attached to the gun/rail
- hold RIGHT CLICK to ADS
- LEFT CLICK must still fire while RIGHT CLICK remains held
- artificial hipfire crosshair disappears while ADS

Recent ADS history:
1. v84 initially only zoomed/centered the weapon; user rejected it because it did not look like real ADS.
2. v85 added actual rear/front iron sight geometry and per-weapon ADS transforms, but the gun receiver blocked the view.
3. v86 lowered/pushed weapon back and fixed simultaneous RMB ADS + LMB fire.
4. v87 attached the iron sights to the top rail, removed tall awkward sight supports, slightly scaled the weapon while ADS, and set all gun unlock prices to $1 for testing.
5. User then reported:
   - ADS appeared off-center
   - AWM sniper scope did not have a full crosshair
6. v88 / commit `eee0417...` attempted to fix both:
   - added full horizontal + vertical scope reticle via `#scopeReticle`
   - adjusted the ADS X positioning to compensate for ADS scale

Current relevant code:
- `const ADS={...}`
- `function setAim(v)`
- ADS interpolation in `function move(dt)`
- `rearIron(...)` and `frontIron(...)` helpers in `rebuildGun()`
- AWM overlay CSS: `#scopeOverlay`, `#scopeReticle`

Current ADS config:
```js
const ADS={
 rifle:{x:-.36,y:.005,z:-1.16,fov:58,rx:0},
 smg:{x:-.36,y:.045,z:-.38,fov:54,rx:0},
 shotgun:{x:-.36,y:.025,z:-.48,fov:56,rx:0},
 pistol:{x:-.36,y:.058,z:-.32,fov:55,rx:0},
 dmr:{x:-.36,y:.015,z:-.54,fov:48,rx:0},
 grenadeLauncher:{x:-.36,y:.040,z:-.45,fov:56,rx:0},
 m240:{x:-.36,y:.005,z:-1.24,fov:56,rx:0},
 awm:{x:-.36,y:.005,z:-.62,fov:28,rx:0}
};
```

Current rifle sights:
```js
rearIron(-.69,-.010,.90);
frontIron(-2.66,-.010,.86);
```

Current M240 sights:
```js
rearIron(-.82,-.010,.95);
frontIron(-3.67,-.010,.90);
```

Current ADS transform includes:
```js
const ac2=ads();
const adsScale=1-aimBlend*.16;
gun.scale.setScalar(adsScale);
gun.position.x=ac2.x*adsScale*aimBlend;
gun.position.z=ac2.z*aimBlend+recoil*.42;
gun.position.y=ac2.y*aimBlend-recoil*.08;
```

Do not assume ADS is finished until the user tests v88.

## Weapons

Weapon slots:
- 1 Rifle
- 2 SMG
- 3 Shotgun
- 4 Pistol
- 5 DMR
- 6 Grenade Launcher
- 7 M240 LMG
- 8 AWM Ultimate

Current weapon definitions:
```js
rifle:{name:"RIFLE",rate:105,hold:190,spread:.004,pellets:1,body:1,recoil:.105,baseMag:12}
smg:{name:"SMG",rate:72,hold:150,spread:.012,pellets:1,body:.75,recoil:.065,baseMag:30}
shotgun:{name:"SHOTGUN",rate:520,hold:9999,spread:.055,pellets:7,body:.72,recoil:.22,baseMag:6}
pistol:{name:"PISTOL",rate:240,hold:9999,spread:.007,pellets:1,body:1.15,recoil:.09,baseMag:15}
dmr:{name:"DMR",rate:330,hold:9999,spread:.0025,pellets:1,body:2.15,recoil:.16,baseMag:10}
grenadeLauncher:{name:"GRENADE LAUNCHER",rate:900,hold:9999,spread:0,pellets:1,body:0,recoil:.28,baseMag:6}
m240:{name:"M240 LMG",rate:78,hold:130,spread:.010,pellets:1,body:1.20,recoil:.09,baseMag:100}
awm:{name:"AWM ULTIMATE",rate:1150,hold:9999,spread:.00055,pellets:1,body:8.0,recoil:.30,baseMag:5}
```

M240:
- 100-round magazine
- starts with 200 reserve when unlocked
- full-auto
- slot 7

AWM Ultimate:
- 5-round magazine
- starts with 20 reserve when unlocked
- high body damage
- bolt-cycle delay enforced by `awmReadyAt`
- slot 8
- scoped ADS overlay

Grenade Launcher:
- 6-round magazine
- hard 10-round total carry cap (loaded + reserve)
- impact-detonating projectile
- blast radius about 6.5m
- slot 6

### Temporary test prices

All unlockable guns currently cost **$1** intentionally for testing:

- Pistol $1
- SMG $1
- Shotgun $1
- DMR $1
- Grenade Launcher $1
- M240 $1
- AWM $1

The shop labels include `$1 TEST`.
Ammo and upgrades remain at normal prices.
Do not restore normal gun prices until the user asks.

Current ammo shop:
- Rifle +36 — $120
- SMG +60 — $110
- Shotgun +18 — $140
- Pistol +48 — $90
- DMR +24 — $160
- Grenade Launcher +3 — $225
- M240 +100 — $275
- AWM +10 — $300

## Boss system

Boss fight every 10 rounds:
- waves 10, 20, 30, etc.
- after rounds 9, 19, 29, etc., the shop warns that the next round is a boss fight
- random unique boss name
- boss health bar shown at top of screen

Boss name pool currently includes names such as:
- GORE TITAN
- THE REND KING
- MAWBREAKER
- THE ABATTOIR
- RIBCAGE
- BUTCHER PRIME
- BLOODHOWL
- THE SPLIT-JAW
- THE RED GIANT
- MARROWLORD
- GUTSPIKE
- THE CARRION OX
- SCARFLESH
- THE RUINED HERCULES
- GRAVEBULK

Scaling:
```js
bossScaleFactor(w) = Math.pow(1.1, bossTier(w))
```
So each boss cycle scales about 10% from the previous one.

Current first-boss base:
- HP around 184 before later boss multiplier
- speed `2.25 * mult`
- damage around 21
- special cooldown about `6.5 / mult`

Boss visual:
- larger bodybuilder silhouette
- bloodier/darker materials
- heavy arms/chest/legs
- red gore light accent
- user likes the boss overall

Boss special attacks:
- BLOOD SLAM: close-range area attack + knockback
- GORE RUSH: charge attack + heavy collision damage

Boss reward:
- boss cash bounty
- guaranteed reward cache containing:
  - health +100
  - money $25
  - 20 rounds for an unlocked normal weapon
  - grenade-launcher ammo if launcher is unlocked and has room

Boss headshots do heavy damage instead of instant-killing the boss.

Boss is excluded from tactical-nuke victim list so the nuke does not bypass the boss fight.

## Zombies

Zombie visuals are currently at a user-approved hold point. Do not casually redesign them.

Current rig:
- embedded glTF
- 17-bone skeleton
- AnimationMixer
- animations: Idle, Shamble, Sprint, Attack, Hit

Visual direction:
- low-poly / faceted infected humans
- visible polygonal planes
- hunched chest-led movement
- different glowing eyes by type
- blood/wounds and worn clothes

Important old transparency fix:
Rigged zombie materials must remain:
```js
side=THREE.DoubleSide
transparent=false
opacity=1
depthWrite=true
depthTest=true
```
This fixed the user's see-through zombie bug. Preserve it.

Crawler still uses procedural fallback rather than the rigged model.

AI roles include:
- charger
- flanker
- interceptor
- stalker

Known old freeze fix:
The player-distance calculation must exist before the AI think block:
```js
const playerDistToZombie=Math.hypot(px-z.g.position.x,pz-z.g.position.z);
```
Do not regress this.

## Waves / performance cap

Wave scaling:
```js
count: 6+(w-1)*3
hp: 3+Math.floor((w-1)*.7)
speed: 1.15+(w-1)*.12
attack: Math.max(.32,.86-(w-1)*.04)
damage: 10+Math.floor((w-1)/3)*2
```

Performance baseline:
```js
MAX_ACTIVE_ZOMBIES = 20
```

Only up to 20 zombies are active at a time; later wave zombies remain queued. HUD zombie count includes active + queued.

User explicitly said this 20-zombie system made the game "much smoother". Preserve it.

Cleanup:
- corpse lifetime: ~10 seconds
- item drop lifetime: ~15 seconds
- max active drops: 32

Last-five marker:
- red diamond / yellow center
- appears when total remaining in the wave <= 5
- does not appear for the boss

## Drops

Normal zombie drop chance:
```js
DROP_CHANCE=.32
```

Drop categories:
- ammo 50%
- money 30%
- health 20%

Typical tiers:
- ammo: 5 / 10 / 15 / 20
- money: $5 / $10 / $15 / $25
- health: +10 / +25 / +50 / +75 / +100
- +100 health is rarest

Performance cleanup already removed per-drop PointLights; pickups use emissive materials instead.

Drop labels are cached.

## Sprint

Current movement:
- walk speed: 5
- sprint speed: 9
- full sprint duration: about 3 seconds
- drain: about 33.34 stamina/sec
- refill: 14 stamina/sec (~7 seconds from empty)
- after fully exhausting sprint, sprint remains locked until fully refilled

Sprint bar:
- bottom-left HUD
- green -> yellow -> red
- says RECOVERING when exhausted

## HUD / menus

Gameplay HUD:
- bottom-left: health + sprint only
- top-right stats remain:
  - ammo
  - kills
  - headshots
  - wave
  - zombies / boss
  - cash
  - weapon
  - grenades
  - nukes
- boss health/name bar at top during boss fight

Opening screen:
- clean centered panel
- controls listed there instead of cluttering gameplay HUD
- controls include 1–8 weapons and right-click ADS

Shop:
organized into:
- Ammo
- Upgrades
- Weapons
- Equipment

## Performance work already completed

The user's test PC:
- Dell OptiPlex 5050
- Intel Core i5-7600 @ 3.50 GHz
- 16 GB RAM
- AMD Radeon R5 340 2 GB
- Intel HD Graphics 630 also present
- SSD

Treat this machine as a useful low-end/minimum-performance target.

Pre-city-batching debug screenshot showed approximately:
- 43 FPS
- 23.3 ms average frame time
- 27.2 ms max frame time
- 2,114 draw calls
- 37,882 triangles
- only 3 zombies
- 0 FX
- pixel ratio 1.00

That pointed to draw-call overhead rather than triangle count.

Completed performance work:
- active-zombie cap 20
- corpses cleaned at ~10 sec
- drops cleaned at ~15 sec
- cached zombie textures
- cached drop-label textures/materials
- proper disposal of unique zombie rig materials
- shared grenade/explosion particle geometry/materials
- removed pickup PointLights
- reduced temporary Vector3 allocations in launcher collision
- throttled sprint DOM writes
- removed full HUD rewrite every render frame
- optional `?debug=1` performance HUD
- pixel-ratio cap reduced to 1.25
- decorative city meshes removed from shadow pass
- facade/common material caching
- static city geometry batching via `mergeGeometries`
- old gun geometry disposed on weapon rebuild

Static city batching lives in:
```js
function batchStaticCity()
```

IMPORTANT: The user never sent a post-batching debug screenshot, so we do not yet have verified new draw-call/FPS numbers. A useful future test is:
https://xboxlivehd88-hue.github.io/city-outbreak/?v=88&debug=1

If performance is still weak, inspect actual post-batching draw calls before reducing visual quality or zombie count.

## City / rendering

The city is procedural and intentionally resembles a generic major U.S. city without copying proprietary game assets.

Current cues:
- NYC-style brick/prewar facades
- glass office towers
- beige limestone/art-deco towers
- brownstone-like facades
- storefront bands
- fire escapes
- rooftop mechanicals / water towers
- roads, curbs, crosswalks, lamps, parked cars
- dense skyline

Rendering baseline:
- Three.js 0.180
- ACES filmic tone mapping
- pixel ratio cap 1.25
- directional sun with 1024 shadow map
- static city mesh batching enabled

Do not remove city identity merely to chase FPS unless the user explicitly agrees.

## Current controls

- WASD — move
- Shift — sprint
- Mouse — look
- Left click — fire
- Hold right click — ADS
- R — reload
- 1–8 — weapon slots
- G — hand grenade
- N — tactical nuke

Pointer lock is used.
Mouse input is handled so RMB ADS and LMB fire can work simultaneously.

## Tactical nuke

- bought in shop
- currently $100 TEST
- N to deploy during a wave
- kills normal active zombies
- boss is immune
- because later waves use queued zombies, nuking active zombies does not necessarily erase the whole remaining wave

## Important source-code cautions

1. `index.html` is currently a very large single-file prototype. Do not refactor it into modules in the middle of a gameplay request unless the user explicitly asks.
2. Always fetch latest `main:index.html` before patching.
3. Use the fetched blob SHA in `update_file`.
4. Do not patch an old file saved in /mnt/data or another chat.
5. Keep changes narrow. This project has many tightly coupled gameplay systems.
6. Parse/syntax-check the module before pushing when possible.
7. Check the GitHub Pages workflow after pushing.
8. Next cache-buster after v88 should be `?v=89`.

## GitHub connector workflow

Typical sequence:

1. Fetch current file:
```
mcp__GitHub__fetch_file
repository_full_name: xboxlivehd88-hue/city-outbreak
path: index.html
ref: main
encoding: utf-8
```

2. Patch the returned string.

3. Push:
```
mcp__GitHub__update_file
repository_full_name: xboxlivehd88-hue/city-outbreak
path: index.html
sha: <current blob sha>
branch: main
message: <short commit message>
content: <complete patched index.html>
```

4. Check Actions:
```
https://api.github.com/repos/xboxlivehd88-hue/city-outbreak/actions/runs?branch=main&per_page=10
```

5. Give the user:
```
https://xboxlivehd88-hue.github.io/city-outbreak/?v=<next number>
```

## Suggested first message/action in the next chat

The user should tell the new chat to read this `HANDOFF.md`, then continue from v88.

The very first gameplay task should be:
1. Have the user test v88 ADS.
2. If ADS is still off-center, use their screenshot to tune only the per-weapon ADS X/Y/Z and sight geometry.
3. If the AWM reticle still looks wrong, fix only `#scopeOverlay` / `#scopeReticle`.
4. Do not disturb the boss, sprint, zombie, shop, or performance systems while doing that.

## Current definition of success for ADS

Rifle / M240:
- rear sight visually attached to top rail
- front sight aligned through rear aperture
- sight picture centered on screen
- gun receiver not obscuring target
- no artificial crosshair while ADS
- LMB fires while RMB remains held

AWM:
- centered circular scope view
- full horizontal line across the scope
- full vertical line across the scope
- shot goes through scope center
- gun model disappears once fully scoped
