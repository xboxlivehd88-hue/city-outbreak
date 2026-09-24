# URGENT USER CORRECTION — READ BEFORE ANY DEVELOPMENT

Last updated: 2026-09-24

This correction supersedes contradictory statements below.

## Current confirmed state
- **v180 START OUTBREAK works.**
- **The STI does NOT show up in v180.** This is expected from the code because v180 deliberately removed the STI runtime integration to restore startup.
- The uploaded STI asset remains in the repo at `assets/2018_subaru_wrx_sti.glb`.
- The next chat's first requested gameplay task is still to integrate that STI safely as the sedan visual without breaking START OUTBREAK.

## IMPORTANT M4 CORRECTION
The user has now explicitly said:
> "the m4 is acting with unlimited ammo and less damage that i didnt ask for"

Therefore the previous handoff statement saying M4 unlimited ammo + reduced damage was desired is WRONG and must not be treated as user intent.

Next chat must:
1. Fetch newest `main:index.html`.
2. Inspect the M4/`rifle` values and the changes introduced around v171.
3. Restore the M4 to its intended pre-v171 ammo/reload/damage behavior, using repository history/current code evidence rather than guessing values.
4. Do not assume the M17 should be changed at the same time unless the user asks; the complaint specifically names the M4.
5. Preserve the imported M4 GLB and approved ADS work.
6. Test firing, ammo decrement, reload, damage behavior, START OUTBREAK, and general startup before pushing.

## STI task
Reintroduce `assets/2018_subaru_wrx_sti.glb` as visual-only replacement for type-0/procedural sedans:
- preserve existing oriented collision footprint;
- load model once and clone/reuse;
- no per-car network load;
- no expensive shadows/lights;
- do not reference `parkedCars` from an async loader before initialization;
- do not reproduce v177/v179 startup regression;
- run a real browser smoke test that clicks START OUTBREAK before declaring success;
- visually verify the STI actually appears, not merely that the GLB loads.

## Versioning
Current confirmed gameplay baseline remains **v180**, gameplay commit `34a9cabbb3c8f2fa04f1b5ff6d34af6fbd224771`.
Documentation commits after it are not gameplay changes.
Next gameplay release should normally be **v181**, but fetch current main and verify before editing.

---
# CITY OUTBREAK — CURRENT HANDOFF (v180)

Last updated: 2026-09-24

## READ THIS FIRST
This section supersedes older build/version information later in this file.

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Live site: https://xboxlivehd88-hue.github.io/city-outbreak/
- Current confirmed-working build: **v180**
- v180 gameplay commit: `34a9cabbb3c8f2fa04f1b5ff6d34af6fbd224771`
- Current root `index.html` content/blob SHA after v180: `345c6c7250d897ad2c7e89188e3b58c4ae394f47`
- User explicitly confirmed v180 START OUTBREAK works.
- Next gameplay build should normally be **v181**.

## Immediate next task
The user wants the uploaded **2018 Subaru WRX STI** tried again as the sedan visual.

Asset already in repo:
- `assets/2018_subaru_wrx_sti.glb`

IMPORTANT: v177's STI runtime integration caused the START OUTBREAK regression. v179's partial fix was still broken. v180 completely removed STI runtime integration and restored the procedural sedan path; user confirmed startup works.

When reintroducing STI:
1. Fetch newest `main:index.html` first.
2. Do NOT recreate the v177 async callback that references `parkedCars` from the loader.
3. Keep existing sedan collision metadata/oriented footprints; GLB is visual only.
4. Load the STI once and clone it; no per-car network loads.
5. Preserve performance: no STI shadows/lights, shared geometry/materials where possible.
6. Prefer an integration whose async loader cannot mutate undeclared/not-yet-initialized startup state.
7. Validate JS syntax, `git diff --check`, and exact assertions.
8. MUST run a real browser/headless Chrome smoke test that clicks START OUTBREAK before accepting/pushing the gameplay change.
9. Only after startup passes should the STI build be considered successful.
10. Then push to main and provide cache-busted v181 link.

## Recent critical history
- v171: M4 + M17 are starter-unlocked, unlimited ammo, intentionally reduced base damage; upgrades still increase damage. M17 store unlock and M4/M17 ammo purchases removed.
- v172: M17 no longer detaches its magazine for reload.
- v173: targeted loose M17 presentation props.
- v174: incorrect M17 X rotation made pistol lie down.
- v175: corrected M17 orientation/centering with Y rotation; user said visual placement was perfect except two gold circular cuff/arm ends.
- v176: over-aggressive M17 root-child whitelist accidentally removed the pistol.
- v177: STI sedan visual integration added, but later proved to cause startup trouble.
- v178: removed the bad M17 whitelist, restored complete assembled M17 hierarchy, and sank pistol cuff endpoints into gloves.
- v179: attempted STI startup-order repair; user reported START OUTBREAK still did not work.
- v180: removed STI runtime integration entirely and restored known-stable procedural sedan startup. User confirmed: "its fixed now".

## M17 current rules
Asset: `assets/low-poly_sig_sauer_m17.glb`
Preserve v175 transform unless user asks otherwise:
- Y rotation `Math.PI/2`
- normalize longest dimension to ~0.53
- centered by bounding box
- positioned around `y=-.30, z=-1.02`
Only the known loose display props should be removed:
- `919 p320 17rnd empty mag_0`
- `9x19_1`
- `919_2`
- `919 p320 17rnd mag_3`
Do NOT restore the v176 root whitelist.

## M4 current rules
Asset: `assets/classic_m4.glb.glb` (double extension is intentional).
Internal key remains `rifle`; player-facing name is M4 Carbine.
M4/M17 are starter weapons with unlimited ammo.
M4 ADS has the close-eye-relief overlay system from v167; do not casually rebuild it.

## Road/start screen
Road texture working asset:
- `assets/textures/roads/road_albedo.jpg.jpg`
User approved the v158 road result.
High-res start artwork:
- `assets/city-outbreak-start-v153.jpg.jpg`
Do not change either unless requested.

## Mandatory workflow
User wants the assistant to do GitHub work end-to-end, not give manual Git instructions.
For every gameplay change:
- fetch newest main/index.html;
- patch only that source;
- preserve unrelated systems;
- validate JS syntax;
- run `git diff --check`;
- use feature assertions;
- for startup/map/asset-loader changes, run a real headless browser START OUTBREAK smoke test;
- push directly to main;
- remove temporary patch/workflow files;
- update handoff docs when state materially changes;
- confirm final Pages deployment when tooling permits;
- return cache-busted live link;
- increment gameplay version.

## Architecture discussion
User asked whether to split the giant `index.html`. Recommended future structure is GitHub Pages still hosting the game, but code gradually extracted into `js/game.js`, `player.js`, `weapons.js`, `zombies.js`, `vehicles.js`, `map.js`, `ui.js`, etc. Do this incrementally from a known-good build, never as a giant rewrite. Supabase is NOT for this code split; Supabase is for future persistent backend data such as accounts, cloud saves, leaderboards, telemetry. No Supabase project has been created; user previously chose to hold off.

---
## CURRENT BUILD — v153 (2026-09-24)
- Added approved CITY OUTBREAK cinematic start-screen artwork at `assets/city-outbreak-start-v153.jpg`.
- Start screen uses the artwork full-screen with `background-size: cover`.
- The real START OUTBREAK hit area is aligned over the artwork's START OUTBREAK button.
- The artwork's CONTROLS area opens a clean popup containing the keyboard/mouse controls, removing the old controls clutter from the start screen.
- Gameplay systems were otherwise preserved from v152.
- Current gameplay index blob after v153 menu alignment: `a6b3c2dbf6bbb25f5b42ebed387e1fdeae4823f9`.

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
