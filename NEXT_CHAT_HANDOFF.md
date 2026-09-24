# CITY OUTBREAK — NEXT CHAT HANDOFF

Last updated: 2026-09-24

This file is the authoritative handoff for continuing development in a new ChatGPT conversation.

## 1. Project identity

- Repository: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Primary gameplay source: root `index.html`
- Live site: https://xboxlivehd88-hue.github.io/city-outbreak/
- Current gameplay build: **v152**
- Current test link: https://xboxlivehd88-hue.github.io/city-outbreak/?v=152
- Debug link: https://xboxlivehd88-hue.github.io/city-outbreak/?v=152&debug=1
- Current `index.html` blob SHA: `67314c2d8f647d50281b9ca7711c7c1bfaeaaee7`
- Latest gameplay commit: `9a5add8533ff30f87bfc9f30fba6f79de31196d8` — `Restore startup and use safer zombie nav clearance v152`
- Current clean handoff/deployment commit before this file: `16548d9aa7a825ab1047f281a963130690775c84`
- Final Pages deployment for that commit completed successfully: run `36032278345`

The next gameplay build should normally be **v153**.

## 2. User expectations / how to work

The user wants the assistant to handle the GitHub workflow end-to-end.

Do **not** ask the user to:
- paste code manually,
- download/upload patch files,
- deploy manually,
- switch sessions/tooling,
- perform Git commands themselves,

unless an actual connected GitHub tool call genuinely fails.

The user explicitly prefers short live status updates while work is happening so they know the process has not hung.

For every gameplay change:

1. Fetch the newest `main:index.html` from GitHub **first**.
2. Treat that exact fetch as the only source of truth.
3. Never patch from a stale local copy or old conversation snippet.
4. Change only the requested behavior and preserve unrelated systems.
5. Prefer a temporary one-shot GitHub Actions patch workflow for large `index.html` edits:
   - verify `git hash-object index.html` matches the expected current blob SHA,
   - run an exact/assertive patch script,
   - extract the largest inline JS module and run `node --check`,
   - run `git diff --check`,
   - add feature-specific assertions,
   - for startup/map initialization changes, run a **headless Chrome smoke test that clicks START OUTBREAK**.
6. Commit only the intended gameplay file(s) to `main`.
7. Remove temporary workflow and patch files after success.
8. Update `HANDOFF.md` and this file when the project state materially changes.
9. Wait for the **final clean-head GitHub Pages deployment** to succeed.
10. Give the user a cache-busted live link.
11. Increment the gameplay version by one.

Never say GitHub is unavailable without actually attempting/discovering the GitHub connector first.

## 3. Immediate issue history: v151 -> v152

### v151 problem

The user reported after v151:
> "it doesnt let me start now?"

v151 had introduced startup-time geometry/collider generation intended to close narrow building gaps. Syntax validation passed, but a real browser test reproduced the startup failure.

The risky v151 system:
- tagged buildings by street row,
- generated visible service infill between same-row building gaps under 2.70 m,
- added matching colliders at startup.

### v152 fix

v152 removed that startup-time physical gap-seal generation entirely.

Current safe pathing changes retained in v152:
- `ZNAV_PAD` increased from `.56` to `.72`
- route-clear sampling tightened from `1.05m` to `.85m`
- stuck-side flip cooldown remains `1.15s`
- local avoidance hold remains `.55s`
- no startup-time gap geometry/collider generation

Intent: A* should conservatively reject narrow squeeze gaps and route around them instead of trying to pass unreliable seams.

v152 was validated with a **real headless Chrome smoke test** that loaded the game, clicked `START OUTBREAK`, and successfully entered gameplay before the gameplay commit was accepted.

Important: later temporary workflow failures visible in Actions were cleanup/source-hash mismatch noise from one-shot workflows being triggered after their intended source changed. The final current Pages deployment is successful.

### Next thing to verify with the user

The user has **not yet confirmed v152 visually/playably after the startup repair** in this conversation.

At the beginning of the next chat, the safest first action is:
- ask the user to test https://xboxlivehd88-hue.github.io/city-outbreak/?v=152
- specifically verify:
  1. START OUTBREAK works,
  2. zombies no longer ping-pong at narrow building gaps,
  3. they route around blocked seams instead of getting hung up.

If the user immediately gives a new task instead, proceed with that task and fetch newest main first.

## 4. Current zombie architecture

### Standing zombie master model — v147

The **Shambler is the master standing-zombie visual baseline**.

Standing types:
- Shambler
- Sprinter
- Radiated
- Infected
- Acidic
- Boss

all clone/reuse the same standing rig/geometry and inherit the Shambler baseline. Future visual differentiation should be lightweight overrides:
- proportions,
- posture,
- material/color changes,
- small shared gore/detail meshes,
- limited attachments.

Do not create seven separate heavyweight zombie model systems unless there is a compelling reason.

Key current helpers/profiles include:
- `SHAMBLER_RIG_PROFILE`
- `ZOMBIE_RIG_PROFILES`
- `cloneShamblerRig()`
- `applyZombieRigProfile(...)`

Native crawler remains the main procedural exception for now.

### Native crawler baseline — v149

The user wanted the crawler to become its own baseline.

Current crawler visual direction:
- clearly low-profile,
- human-derived,
- bloody,
- drags itself with the upper body,
- not a short upright zombie.

v149 changed:
- removed the old round blood-colored mouth sphere/"apple in mouth" look,
- added a flat dark mouth cavity,
- added shared thin/stringy blood/drool gore,
- lowered/flattened torso, pelvis, back, head and shoulders,
- lowered limb pose,
- added shared chest/lower-body drag gore,
- added additional forearm gore,
- preserved gameplay stats/hitboxes/pathing.

Shared crawler gore geometry:
- `CRAWLER_MOUTH_GORE_GEO`
- `CRAWLER_BODY_GORE_GEO`
- `CRAWLER_FOREARM_GORE_GEO`

Shared geometry is excluded from per-zombie disposal.

### Converted crawlers

A standing zombie that loses both legs keeps its exact identity and becomes a crawler.

Preserve:
- `convertLeglessToCrawler(z)`
- `buildLeglessCrawlerHitboxes(z)`
- hidden leg rig bones,
- same-zombie identity,
- crawler collision/hitbox behavior.

## 5. Explosive knockdown — v150

The user reported that explosive "stagger" did not actually put zombies on the ground and limbs were too stiff.

Current v150 behavior:
- surviving non-boss blast victims rotate nearly horizontal onto the pavement,
- they remain down briefly and recover,
- grenade/launcher blasts no longer trigger a conflicting standing `stagger()` immediately after knockdown,
- arms and legs get a short damped blast-whip impulse,
- repeat blasts extend down time and retrigger limb reaction,
- bosses still **flinch only** and do not ragdoll/knock down.

Do not regress this.

## 6. Health/drop systems

### Health regeneration
Current:
- delay after enemy hit: **5 seconds**
- regeneration: **10 HP/sec**
- regenerates to 100
- any new enemy hit resets the delay
- pause freezes gameplay time

Constants:
`PLAYER_HEALTH_REGEN_DELAY=5`
`PLAYER_HEALTH_REGEN_RATE=10`

### Physical drops — v148
Physical zombie health drops are removed.

Normal zombie successful drop split:
- 62.5% ammo
- 37.5% cash

Overall successful-drop chance remains:
`DROP_CHANCE=.52`

Boss reward cache no longer creates a health pickup.

The three fixed map medkits remain.

The wave-shop heal button was removed earlier.

## 7. Pause system — v146

True pause/resume exists.

Behavior:
- visible Pause button during active gameplay,
- `P` toggles pause,
- Escape/pointer-lock loss pauses,
- blur/hidden visibility can pause active gameplay,
- pause overlay releases pointer lock,
- resume requests pointer lock/refocuses canvas,
- core gameplay update loop freezes,
- reload/nuke timers use pause-aware clock,
- AWM bolt readiness and run timer are pause-aware.

Important:
- do not reintroduce wall-clock timers into core gameplay if they should freeze during pause.

## 8. Zombie AI/pathing

Core helpers:
- `zombiePointBlocked(...)`
- `chooseZombieAvoidSide(...)`
- `moveZombieSmart(...)`
- `zombieRouteClear(...)`
- `buildZombieRoute(...)`
- `updateZombieRoute(...)`
- `zombieRouteWaypoint(...)`

A* safeguards:
- `ZNAV_CELL=2.0`
- current `ZNAV_PAD=.72` (v152)
- `ZNAV_MAX_NODES=1300`
- nav block cache exists

Do not remove the bounded-node safeguard.

Current stuck behavior:
- if movement is badly constrained for ~0.30 s, force repath,
- clear route/waypoint state,
- avoid-side flip cooldown ~1.15 s,
- local avoidance hold ~0.55 s,
- give A* time to take over instead of rapid left/right ping-pong.

### Final-five hunt mode

When <=5 normal zombies remain and there is no boss, they aggressively hunt the player so the player does not need to search the map.

Current approximate target speeds:
- close: 5.0
- medium: 5.4
- far: 5.8
- hard cap: 6.15

Player full sprint: 9.0

Preserve aggressive pathing even if speed is retuned.

## 9. Boss system

Boss every 10 waves.

Preserve:
- random boss names,
- boss HUD,
- scaling per boss cycle,
- Blood Slam,
- Gore Rush,
- reward cache,
- tactical-nuke immunity,
- headshots heavy but not instant-kill,
- enlarged explosive/projectile chest collision,
- explosive flinch only (no normal knockdown).

Current anti-kiting behavior from v142:
- pressure pace ~4.65–6.0 m/s depending on distance,
- Gore Rush can trigger inside ~32 m,
- Gore Rush speed ~7.6 m/s,
- player full sprint remains 9 m/s.

## 10. Performance constraints — critical

Hard rule:
`MAX_ACTIVE_ZOMBIES=20`

Do not raise/remove it unless the user explicitly asks and performance is reconsidered.

Low-end reference system:
- Dell OptiPlex 5050
- i5-7600
- 16 GB RAM
- Radeon R5 340 2 GB
- Intel HD 630

Historically **draw-call overhead matters more than raw polygon count**.

Preserve:
- static city batching,
- batched car visuals with cheap collision anchors,
- material/texture caching,
- shared FX geometry/materials,
- no pickup PointLights,
- no per-zombie PointLight eyes,
- decorative shadow exclusions,
- DPR cap ~1.25,
- max ~32 drops,
- corpse/temporary item cleanup,
- cached zombie hit meshes,
- shared/merged zombie detail geometry,
- bounded A*,
- nav cache.

## 11. Cars/map

Car collision uses oriented footprints; do not go back to oversized circular center hitboxes.

Relevant helper:
`carPointCollision(...)`

The user previously said the old car hitboxes felt too large; the current system was considered an improvement.

Map uses procedural building generation but static visual batching.

After the v151 startup regression, be conservative about adding **startup-time generated geometry/colliders**. If map/nav changes are needed:
- prefer nav-layer logic first,
- validate with a browser startup smoke test.

## 12. Player movement

- walk: 5
- sprint: 9
- full sprint lasts roughly 3 seconds
- full recovery from empty roughly 7 seconds
- exhaustion lock remains until fully recharged

## 13. Weapons / testing economy

Slots:
1. Rifle
2. MP5
3. Shotgun
4. Pistol
5. DMR
6. Grenade Launcher
7. M240
8. AWM

All unlockable guns are intentionally **$1 TEST** right now. Do not "fix" these prices unless the user asks for production balance.

Important:
- Shotgun: 8-shell base, shell-by-shell reload
- M240: 100/200
- AWM: 5/20, bolt delay
- Grenade Launcher: 6-round mag, hard 10 total carry cap
- all guns support auto-reload on empty

Current weapon balance values are in `weaponDefs`; fetch newest source before changing.

## 14. Known balance issue not yet fixed

### Tactical nuke economy exploit
Current shop nuke price is very low/test-like and nuke kills can return more cash than the purchase cost because active zombies can reach 20.

Do not silently rebalance it; user has not requested that yet.

### Upgrade caps
Magazine/damage/reload upgrades may still be repeatedly purchasable. Do not change unless asked.

## 15. Recent build history

- v139 — gore/infected visual pass
- v140 — delayed health regeneration
- v141 — faster regen: 5 s delay, 10 HP/sec
- v142 — boss anti-kiting / stronger Gore Rush pressure
- v143 — smoother early special-zombie progression
- v144 — bite popup matches actual reduced damage from missing arms
- v145 — removed redundant wave-shop heal purchase
- v146 — true pause/resume
- v147 — Shambler master standing-zombie model architecture
- v148 — removed all physical health drops; ammo/cash only
- v149 — crawler mouth gore + low-profile bloody crawler baseline
- v150 — explosive knockdown actually reaches ground + limb blast reaction
- v151 — attempted physical narrow-gap sealing + slower anti-oscillation; introduced startup regression
- v152 — removed risky physical gap generation, kept anti-oscillation, increased nav clearance/sampling, passed real browser START OUTBREAK smoke test

## 16. Supabase status

A Supabase connector/account is available and the organization visible was:
- `outbreak devs`

At the time of this handoff:
- **no Supabase project has been created**
- user explicitly said to **hold off** on backend setup

Potential future uses:
- playtest telemetry,
- remote tuning values,
- cloud saves,
- leaderboards,
- accounts,
- lobby/realtime support later.

Do not create a Supabase project unless the user asks/approves the required project/cost step.

Supabase is **not** needed for current zombie visuals, pathing, animations, or local FPS performance.

## 17. What the user is currently focused on

Current development priority has been:
1. zombie visual baselines,
2. crawler appearance,
3. explosive physical reactions,
4. zombie navigation around city geometry.

Likely next work is either:
- testing/tuning v152 pathing,
- continuing zombie visual differentiation from the Shambler master,
- further crawler polish.

Do not add HUD messages/labels to distinguish zombie classes. The user explicitly wants **the actual 3D bodies/models/silhouettes to look different**.

## 18. Copy/paste prompt for the next chat

Paste this into the next conversation:

> We are continuing my browser FPS game **CITY OUTBREAK**. Repo: `xboxlivehd88-hue/city-outbreak`, branch `main`, live site `https://xboxlivehd88-hue.github.io/city-outbreak/`. Before doing anything, use the GitHub connector to read root `NEXT_CHAT_HANDOFF.md` and `HANDOFF.md`, then fetch the newest `main:index.html`. Never work from an old copy. Current stable gameplay build is **v152** and the current test link is `https://xboxlivehd88-hue.github.io/city-outbreak/?v=152`. Latest gameplay commit is `9a5add8533ff30f87bfc9f30fba6f79de31196d8` (`Restore startup and use safer zombie nav clearance v152`). v151 broke START OUTBREAK by adding startup-time building-gap geometry/colliders; v152 removed that risky system, kept the slower anti-ping-pong behavior, increased A* clearance to .72 and route sampling to .85 m, and passed a real headless Chrome test that clicked START OUTBREAK successfully. First priority is to verify v152 starts and that zombies route around narrow building gaps without oscillating. Do all GitHub edits, validation, cleanup, Pages deployment checks and version bumps for me; do not give me manual GitHub instructions unless a real connector call fails. Preserve the Shambler shared master rig, crawler v149 baseline, v150 explosive ground knockdown + limb reaction, boss behavior, 20-active-zombie cap, pathfinding safeguards, car collision, pause system, health regen, and other performance work. Next gameplay build should normally be **v153**.

## 19. Final rule for the next assistant

When uncertain, inspect the newest GitHub source rather than guessing.

The user values:
- direct implementation,
- quick status updates,
- stable performance,
- preserving already-approved systems,
- testing the actual live build after deployment.
