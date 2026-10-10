# v569 — PANZER BOSS SCALE REDUCED SUBSTANTIALLY — 2026-10-10

- User reported v568 Wave 1 Panzer Zombie was **super huge** and requested a large size reduction.
- Panzer's normalized model height inside its existing zombie root reduced from **3.20 to 1.80** (43.75% smaller, 56.25% previous height); isolated `PANZER_VISUAL_HEIGHT=1.80` constant. This is a visual size test, still subject to user approval; inherited boss root scale stays untouched.
- Also parented Panzer-only torso, abdomen, pelvis, both legs and static head hitbox under new `PanzerBossScaledHitboxes` with proportional `1.80/3.20` scale to keep gun and launcher collision aligned. Procedural head hitbox remains attached to its head bone and automatically follows reduced animated model scale. Explosion body-space tests still use these same meshes.
- No changes to Panzer walking/native clips, facing/rotation, combat stats or Wave 1 test spawn. Approved Suit Guy and all existing boss rotation, normal zombies, natural crawlers, map/performance and protected v324 recovery untouched.
- Loader `./src/game.js?v=569`. **User must evaluate Panzer size in browser** before further changes; source commit alone is not visual verification.

---

# v568 — PANZER ZOMBIE NEW BOSS WAVE 1 TEST — 2026-10-10

- User uploaded **`assets/panzer_zombie.glb`** in GitHub commit `6dae100c1cf8c94c1009119de35aaf216a041feb` and requested work on the new boss. Its GLB exceeds the connected GitHub file reader's binary content limit, so native animation/skeleton metadata could not be inspected directly; load-time runtime inspection chooses imported clips where available or a procedurally constructed walker auto-rig for static meshes.
- Panzer boss is intentionally a **temporary Wave 1 solo test**, spawned 12–22 units from player with the same reachable/fallback logic used previously for Suit Guy. HUD name PANZER ZOMBIE and base boss Wave 1 test stats from `bossWaveSpec(5)`.
- New isolated `attachPanzerBossVisual` clone normalizes GLB to target local height 3.2, rotates Y 180° for initial front-facing test, uses native imported Walk/Run clip if available, otherwise builds procedural skeleton; includes dedicated chest, abdomen, pelvis, leg and head raycast hitboxes. Grenade and grenade-launcher blast/contact uses existing v565 suit body-based range logic for Panzer too. Visual/model/collider alignment **requires user-side test**; no claim animation or orientation approved.
- Panzer **NOT** added to `BOSS_NAME_POOL` yet. Waves 10, 20, 30 etc continue standard rotation including approved Suit Guy. Suit Guy v566 appearance, headshot/torso/explosion/animation logic unchanged. Other normal zombie waves, crawlers, v324 checkpoint untouched.
- Loader `./src/game.js?v=568`, update both handoffs. Test Panzer visuals, facing, proportions, movement and hitboxes before making further changes.

---

# v567 — SUIT GUY BACK IN BOSS ROTATION — 2026-10-10

- User confirmed v566 headshot fix works and approves ending the temporary Wave 1 Suit Guy test.
- Removed forced first-wave boss override and its short 12–22 unit test spawn. Wave 1 is restored to its usual 10 zombies; the existing boss schedule remains **every tenth wave** (10, 20, 30, ...), with the established 36–70 unit boss spawn distances.
- Added `SUIT GUY` to the existing `BOSS_NAME_POOL` of named bosses. Normal `nextBossName()` randomly draws without replacement until its pool is exhausted. Suit Guy can appear on any regular boss wave, **but not necessarily wave 10**, and will not repeat before other names have been drawn.
- Only attach `assets/suit guy boss.glb` and its approved v566 animation, headshot/body/explosion hitboxes when the selected boss name is `SUIT GUY`. Other named bosses use their existing rigs and behavior. Existing boss scaling, specials, bounty, UI, and other gameplay unchanged.
- Keep v555 natural crawler scale 1.53 and all protected v324 checkpoint files untouched. Active loader `./src/game.js?v=567`. Source-level verification required; browser wave playtest still pending.

---

# v566 — SUIT BOSS HEADSHOT ZONE ALIGNMENT — 2026-10-10

- User reports headshot multiplier starts well below visible neck in v565. Root cause: the separate legacy boss headshot sphere radius .32 was attached to `z.g`, multiplied by enlarged boss world scale, and extended below the visible skull.
- Replaced only the **suit boss** custom headshot collider with a small ellipsoid attached to the animated `WalkerHead` bone of the existing suit auto-rig. Calibrated to the source GLB's facial/head height: center +0.055 of source height above head bone and radii (0.063, 0.070, 0.062) times source height. Bottom stays at approximately 86.5% of full visual stature (top of neck/skull area); unlike v565 it rotates/tilts with the head.
- Previous generic walker head collider remains disabled for raycast; no body/chest/limb hitbox or explosive blast changes. Compact fallback sphere if future rig omits head bone.
- Preserve v563 approved elbow appearance; v564 arms/knees; v565 body/launcher/explosion collision; Wave 1 boss test; normal zombies/crawlers; v324 recovery. **Needs user headshot vs neck/chest testing and approval**. Loader `./src/game.js?v=566`.

---

# v565 — SUIT BOSS CHEST AND EXPLOSION HITBOXES — 2026-10-10

- User reports no chest hitbox and explosion contact on v564 suit boss. Source inspection: old `BossChestHitbox` and launcher contact at y=1.43 (procedural model), while uploaded suit model is larger. Splash area damage previously measured only from feet.
- v565 invokes the existing skinned hitbox builder for the **suit boss only**, attaches torso/hip/limb collision to the animated suit rig, moderately widens chest and hip zones, disables old procedural raycasts, and preserves the v559 head hitbox as the only active headshot target.
- The grenade launcher now checks a swept flight segment against the suit body volumes. Hand grenades and launcher blasts measure distance to those volumes for the suit boss. Original damage values and all non-suit zombie blast behavior unchanged.
- Preserve boss v563 elbow skinning, v564 reaching/knee gait, Wave 1 test spawn, natural crawler scale 1.53, all weapons, and v324 recovery. **Needs user testing; not yet approved.** Active loader `./src/game.js?v=565`.

---

# v564 — SUIT BOSS FORWARD-REACHING ARMS AND BENT-KNEE GAIT — 2026-10-10

- User **approved v563 elbow appearance** and requested the suit boss hold his arms forward toward the player, plus stop walking so straight-legged. No skin-weight, bone layout, rig or headshot changes made.
- Changed only `syncSuitBossWalk` in `src/game.js`: rotate both shoulder bones toward the character's forward axis while leaving hands just below chest level (small reaching pulse/attack movement); keep the v563 independently weighted elbows and their bends.
- Adjusted only suit boss walking: more visible hip swing and soft knee flex during each leg's forward recovery, rather than bending the trailing knee while the advancing leg stays straight. Compensating ankle motion limits feet tipping.
- v564 loader `./src/game.js?v=564`. Wave 1 continues to spawn the suit boss for visual testing. All other zombies, natural crawlers (scale 1.53), weapons, existing headshot system, protected v324 and boss rotation for later waves are unchanged.
- **Await user visual test before calling either improvement approved**. GitHub Pages status and user-browser animation are separate verifications.

---

# v563 — SUIT BOSS ELBOW SEGMENTATION — 2026-10-10

- User screenshot of v562: walking and facing are very close, but both elbows/sleeves deform into angular folds; do not change approved movement/size/facing.
- Root cause confirmed in current source: the boss-specific auto-skinning path still used regular walker vertical arm classification in `chooseRigidBone`, so almost all outstretched sleeve vertices became UpperArm and the actual forearm joints had little/no mesh to control.
- v563 fixes ONLY the suit boss (`bossTPose=true`) using horizontal bone assignment (upper arm, forearm, hand) before generic head/torso classification; blends skin weights smoothly around shoulder (X/h .135-.205), elbow (.252-.318), and wrist (.365-.405). Subtle local Y/Z elbow bends now actually articulate the forearms rather than twisting the sleeve around its length.
- No changes to suit boss base gait, position, scale, facing, special attacks, boss headshot collider, Wave 1 test, other zombies/normal crawlers, general rig physics, or protected v324.
- Main loader `./src/game.js?v=563`. Needs user visual approval; GitHub commit does not establish browser-tested appearance.

---

# v562 — SUIT BOSS SKELETON WEIGHTS AND WALK CYCLE REWORK — 2026-10-10

- v561 REJECTED by user screenshot: shoulders deform into wings, stiff/unnatural walk. Model asset is static with no glTF skin or animation tracks (verified source).
- Compared actual GLB vertex bounds, especially T-pose arms concentrated near original local Y~0.35; prior inferred shoulders were too high. Corrected boss-only upper arm joint Y relative to chest from +.025h to -.035h, narrowed T-pose arm region, and smoothly blends root arm vertices into chest across the shoulder seam instead of rigid torso/arm division.
- New separate `syncSuitBossWalk` uses distance-traveled stride phase, gentler legs with knee follow-through, stable torso counterrotation, and dedicated hanging-arm front/back swings. Regular Shambler animations stay on their existing pathway and are NOT modified. Existing v559 boss headshot volume remains in place.
- Wave 1 boss test stays mandatory; all other systems including v555 crawler scale 1.53 and protected v324 untouched. Needs user to visually test; no approval or live-browser testing claimed.
- Loader `./src/game.js?v=562`.

---

# v561 — SUIT BOSS LOCOMOTION TEST — 2026-10-10

- User v560 screenshot shows correct facing, distorted shoulders, stiff walk. Source GLB has no skin/skeleton/animations. Temporary boss-specific gait: increased hip strides and knees, more visible opposite arm swing, small footfall bob; regular walkers unaffected. Existing v559 headshot and v560 T-pose skinning retained. This does not substitute for professionally rigged GLB; user test pending.
- Wave 1 test boss only. Original waves, crawlers, v324 checkpoint unchanged. Loader v561.

---

# v560 — SUIT BOSS T-POSE RIG ANATOMY FIX — 2026-10-10

- User screenshot v559 shows sleeve distortion and unstable walk: GLB is a static T-pose mesh without imported armature. The old Shambler auto-rig assumed an A-pose with hanging arms, causing incorrect weights and exaggerated deformation.
- v560 uses a boss-only horizontal T-pose joint profile in the existing auto-skinner: shoulder/elbow/wrist joints follow X across outstretched arms; mesh arm regions are assigned by horizontal reach rather than vertical height, and each arm segment receives rigid skin weights to protect suit sleeves from stretching. Animate arms down ~1.24 rad from T pose. Other walkers retain their original rig profile. Existing v559 headshot sphere, Wave 1 boss test, protected v324 and crawler unchanged. Needs user-side visual test, not approved.
- Loader ./src/game.js?v=560.

---

# v559 — SUIT BOSS ARM POSE AND HEADSHOT ALIGNMENT — 2026-10-10

- User screenshot of v558: face orientation correct, arms still T/A pose and headshot hit registration appears around crotch. v559 exclusively lowers suit boss shoulders via existing walker auto-rig synchronization; other walker poses unchanged. Adds boss-specific head sphere centered at 2.88 world units with radius .32 and disables legacy hidden head raycasts; other boss hitboxes and combat retained. Test accuracy/visuals needed.
- Wave 1 test boss remains, original boss schedule untouched, natural crawler untouched, protected v324 untouched. Loader v559.

---

# v558 — SUIT GUY BOSS FACING AND T-POSE AUTO-RIG — 2026-10-10

- User screenshot confirms Wave 1 boss spawns, but uploaded model faces backward and remains T-pose. Inspection of GLB JSON confirmed no animations and no skins. v558 uses existing proven `buildBasicWalkerTemplate` automatic bone and skin-weight pipeline, with `syncBasicWalkerVisual` for movement/attack/death posing. Visual rotates 180 degrees to face player. Existing boss combat mechanics and Wave 1 test spawn unchanged.
- Source asset unchanged, all normal zombies/crawlers unchanged, v324 protected. Loader `./src/game.js?v=558`. Needs user visual test; no claim of approved animation or ragdoll.

---

# v557 — SUIT BOSS WAVE 1 VISIBILITY FIX — 2026-10-10

- User reported v556 suit guy boss did not show up. First-wave test spawn used normal boss distance 36–70m; v557 uses reachable candidate 12–22m and near fallback. Remaining boss waves unchanged. Adds console diagnostics and visible GLB-load error and non-culled model rendering. User validation pending.
- Loader ./src/game.js?v=557. New GLB remains assets/suit guy boss.glb. Original boss combat and protected v324, natural crawler, other gameplay unchanged.

---

# v556 — SUIT GUY TEST BOSS — 2026-10-10

- Uploaded `assets/suit guy boss.glb` at commit `0d686bb8bba2710dfa14e399c72689cc15d778ef`.
- Temporary TEST: Wave 1 always uses existing boss wave combat/spawning with name `SUIT GUY — TEST BOSS`; original boss wave rotation remains for later boss waves. Existing boss rig/hitboxes preserved while GLB is shown at an initial auto-sized height of 3.2 units. Visual animation/ragdoll of uploaded model is NOT yet validated.
- v555 natural crawler visual scale 1.53, all prior mechanics, protected v324 checkpoint unchanged. User must visually test model and Wave 1 behavior. Loader `./src/game.js?v=556`.

---

# NEW-CHAT HANDOFF — 2026-10-10 — v555 GAMEPLAY + BROKEN PLAY-LINK REPORT — READ THIS FIRST

## Authoritative sources / state
- **Repo:** `xboxlivehd88-hue/city-outbreak`, branch **`main`**. ALWAYS read GitHub current main; do not resurrect code from an old chat response.
- **Latest game build:** **v555**. Verified gameplay-source commit SHA before this docs-only handoff: **`0602d6cb8b18d4a6aa2911fc82d9870e8f2df081`** (its tree `6b950af8f4d661a3dc901a29281f23336c976d0c`).
- **Active loader in `index.html`: `./src/game.js?v=555`**, stylesheet `./src/game.css?v=525`. The docs-only commit adding this handoff will update main HEAD but NOT the gameplay code, assets, or loader.
- **GitHub Pages:** Actions run **`38069044476`** completed **SUCCESS** for the v555 game commit. **HOWEVER the user explicitly reports the most recently supplied PLAY LINK IS BROKEN.** Successful Pages Actions status does NOT confirm that the page opens, boots and plays in the user's browser. Verify base site, exact path, HTTP response/browser loading and cache behavior before claiming the link works. Historically used URL `https://xboxlivehd88-hue.github.io/city-outbreak/?v=555-native-crawler-15pct-smaller`; canonical root `https://xboxlivehd88-hue.github.io/city-outbreak/`. Do NOT present the reported broken URL as independently tested. In our environment external Pages URL could not be loaded, so user-side confirmation is needed.
- **Protected recovery:** `CURRENT_RECOVERY_CHECKPOINT.md`, v324 gameplay SHA `afddcebb47e06a82b4196638716f05e6f1adc941`, protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`, loader v324. Never modify protected checkpoint.
- **Read first** NEWEST TOP sections of `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, `index.html`, `src/game.js`, `src/game.css`; read relevant GLBs and `MODEL_CREDITS.md` when dealing with crawler.

## Current priority: NATURALLY SPAWNING crawlers only
- User uploaded `assets/zombie_number_3_-_animated.glb` and wanted it to replace **ONLY natural wave-spawned crawlers**. They begin spawning Wave 3+. Real GLB contains Mixamo rig, `Crawl`, `Running_Crawl`, `Attack`, and other clips; runtime uses skinned animation with root-motion stripping and reuses the already working gameplay hitboxes. Model credits/license are documented in `MODEL_CREDITS.md` (creator tonyflanagan, CC BY 4.0).
- Very important exclusion: `naturalCrawlerSpawn=kind==="crawler"&&forcedKind!=="crawler"`. Leg-loss conversion `makeZombie(x,zp,oldIndex,"crawler")` must keep old crawler mechanics/visual identity. Do not alter existing normal/radiated zombie models, AI/waves, damage, or zombie ragdoll generally.
- **Evolution:** v550 initially added model; v551 fixed Spine2 Mixamo bone label; v552 fixed floating legacy red gore by `hideNativeCrawlerVisual(z)` BEFORE adding GLB and raised its visual scale to 2.0; v553 aimed to fix missing face, sinking into ground, and death popping to T-pose; v554 reduced visual scale exactly 10% to **1.8**; user said **"still too big"**, so v555 reduced another 15% from 1.8 to **1.53**.
- **Current in-source value CONFIRMED: `NATURAL_CRAWLER_SCALE=1.53`**. This is **23.5% smaller than scale 2.0**. User has NOT yet visually approved scale 1.53; do not make further size reductions without a screenshot/test. Latest user message after release was **"that link is proken"**, not a visual judgment of 1.53.
- v553 face/ground/death changes remain present and also require gameplay inspection: GLB body/face alpha depth handling, face/head tilt compensation, recalculated surface clearance based on head/chest/hands/feet, uncapped initial grounding correction, and freezing mixer `timeScale=0` at death instead of `stopAllAction()` resetting the T-pose before PBD. Do not regress these when modifying scale. v549 dead-ragdoll swept wall/stair collision remains active.
- User screenshots: v551 was miniature with floating red pieces; v552 was larger but face seemed missing, corpse jumped to a T-pose, and crawler sank into ground. v553 contains source-code fixes but visual confirmation was interrupted by size requests. **All of these need testing on v555**, specifically head/face orientation, ground contact, size relative to standing walkers, death collapse and performance.
- Explicit rollback references: v554 `cc32fdff5c031126b312fadcac1e50abbace703d`; v553 `b82b9b2eca3d63d7bbfdb0ab1499ea009351e3e3`; pre-new-GLB v549 gameplay with upload `60d7eb98f2d334f17920bca93aa3c59ed9a6717c`; protected v324 must remain untouched.

## Other protected gameplay
- Preserve v548 noticeable shotgun Faster Reload per-shell formula `Math.round(380+440*Math.pow(.53,reloadLevel))`, v547 sprint drain `26.67/s` and health regeneration `12.5 HP/s` after 5-second delay, v546 3 canopy fluorescents with distance falloff and independent RNG flicker, v543 specific misplaced OFFICE sidewalk hydrant removal, v538 streetlight fixed-budget FPS optimization, graphics settings and v549 dead-ragdoll collision. Preserve shotgun reload motion, grenade explosion, zombie headshots/limb dismemberment, collisions, performance and waves. No change to all these for crawler size or a broken link.

## Safe next actions / user experience
1. Start by verifying the latest live main SHA, script loader v555, `NATURAL_CRAWLER_SCALE=1.53`, and Pages workflow/deployment URL. Resolve **BROKEN LINK FIRST** or explain the exact blocker; avoid giving a stale or unverified playable link.
2. Once user can open game, request Wave 3+ screenshots/video of NATURAL crawler at scale 1.53, then test face, surface clipping, animations, death transition, FPS, and also verify leg-loss conversion remains unchanged.
3. If a change is approved/requested, directly edit GitHub main (no manual coding instructions), preserve rollback, syntax/source-check, bump version/cache key, update BOTH handoffs at TOP, verify GitHub Pages, give current link and what to test. Never claim visual success solely from passing syntax or a Pages deployment.
4. Current handoff preparation intentionally changes ONLY these two Markdown handoff documents. It makes **NO gameplay changes**.

---

# NEW-CHAT HANDOFF — 2026-10-10 — v555 REDUCE NATIVE-SPAWN CRAWLER ANOTHER 15% — READ FIRST

**Repo `xboxlivehd88-hue/city-outbreak`, branch `main` is authoritative. User tested v554 10%-smaller naturally spawning crawler (visual scale 2.0 -> 1.8) and said STILL TOO BIG. Made ONLY another measured reduction to natural crawler GLB visual scale, retaining all v553 fixes. Do not treat size as visually approved until user tests.**

## v555 crawler adjustment
- `src/game.js` `NATURAL_CRAWLER_SCALE=1.53`, reduced a further **15% from v554's 1.8** (23.5% smaller than v552/v553 original 2.0). Controls ONLY the holder for `assets/zombie_number_3_-_animated.glb?v=550` used by naturally rolled spawning `crawler` zombies. Leg-damage conversion via `makeZombie(x,zp,oldIndex,"crawler")` is excluded by `naturalCrawlerSpawn=kind==="crawler"&&forcedKind!=="crawler"`; don't change that path.
- Preserve all recent approved/ongoing behavior from **v553**: face/body material visibility, actual GLB face rendering, ground calibration/height safeguards and no-T-pose death-to-PBD pose handoff. Animation `Crawl`, `Running_Crawl`, `Attack`, real skeleton and death PBD unchanged. Scale-dependent grounding automatically recalculates with holder size.
- No other changes to gameplay, weapons, upgrades, sprint/health, zombies, ragdolls, map, lighting or collision; original uploaded GLB, protected v324 checkpoint and `src/game.css` untouched. Only `src/game.js`, `index.html` loader **v555**, TOP of `CITY_OUTBREAK_HANDOFF.md` and `NEXT_CHAT_HANDOFF.md` changed.
- Verify GitHub main, v555 loader, exact scale, preserve animation/death/ground path, syntax check and GitHub Pages deployment. Test link after successful deployment: https://xboxlivehd88-hue.github.io/city-outbreak/?v=555-native-crawler-15pct-smaller . Wave 3+ native crawler: compare size with standing zombie, face/head clear, crawl not ground-phasing, and no jump/T-pose on death. If still large, adjust in small increments based on screenshot. User visual approval still pending.
- Next chat read latest TOP of both handoffs, recovery checkpoint, index.html, src/game.js and src/game.css from current `main` BEFORE edits. v554 rollback commit `cc32fdff5c031126b312fadcac1e50abbace703d`; never modify protected v324 checkpoint.

---

# NEW-CHAT HANDOFF — 2026-10-10 — v554 NATURAL-SPAWN CRAWLER 10% SMALLER — READ FIRST

**GitHub `main` is source of truth: `xboxlivehd88-hue/city-outbreak`. User says the newly uploaded naturally spawning crawlers are a little too big; requested exactly 10% smaller for visual test. v553 face/ground/death pose fixes are already in main and MUST remain intact. This release ONLY changes native GLB visual size; visual approval remains pending.**

- `src/game.js`: `NATURAL_CRAWLER_SCALE` changed **2.0 to 1.8**, an exact 10% reduction from v553. This value controls the holder of the animated uploaded GLB exclusively for **naturally spawned** crawlers. `naturalCrawlerSpawn=kind==="crawler"&&forcedKind!=="crawler"`; leg-damage conversions using `makeZombie(x,zp,oldIndex,"crawler")` stay entirely untouched.
- Preserve v553 **head/face visibility adjustments**, body material alpha depth ordering, dynamic face/limb ground clearance and instant foot calibration, and death handoff that freezes `naturalCrawlerMixer.timeScale=0` instead of resetting bones to T-pose. Original three Mixamo animation clips and PBD ragdoll unchanged. The geometry-height calculation automatically re-centers according to new 1.8 scale.
- `index.html` game loader advanced to **`src/game.js?v=554`** to invalidate cache. Edited only source, index, and latest TOP section of each of the two project handoffs. Asset binary `assets/zombie_number_3_-_animated.glb`, CC-BY credit, CSS, `CURRENT_RECOVERY_CHECKPOINT.md` v324, streetlights, shotgun, wave AI and other gameplay preserved.
- v553 immediate rollback version is main commit `b82b9b2eca3d63d7bbfdb0ab1499ea009351e3e3`. If user wants a different size, adjust only the `NATURAL_CRAWLER_SCALE` constant, never revert the v553 face/ground/death fixes without approval.
- Validate current HEAD, source invariants, `node --input-type=module --check < src/game.js`, Pages deployment SUCCESS, then user gameplay visual test. New link: https://xboxlivehd88-hue.github.io/city-outbreak/?v=554-native-crawler-10-percent-smaller . Wave 3+: inspect naturally spawning crawlers next to walkers, their face and head above surface, death without T-pose; converted leg-loss crawlers unchanged.
- New chat first read newest TOP sections of both `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, `index.html`, `src/game.js`, `src/game.css` from GitHub main.

---

# NEW-CHAT HANDOFF — 2026-10-10 — v553 NATIVE CRAWLER FACE, GROUNDING AND DEATH T-POSE — READ FIRST

**GitHub `main` authoritative: `xboxlivehd88-hue/city-outbreak`. User tested v552 at WAVE 5 with screenshot: naturally spawned new GLB crawlers' FACE looks absent (head into sidewalk), parts of body SUNK into ground, and on death suddenly HOP UP in a T-POSE. The uploaded skinned GLB has to remain, including its 2.0 display scale; converted leg-loss crawlers, other zombies and existing ragdoll solver must stay intact. Do not mark visually approved until user tests.**

## Root causes and targeted v553 changes
- **Death T-pose:** `beginRagdoll` called `z.naturalCrawlerMixer.stopAllAction()` right before building the PBD solver. THREE AnimationMixer `stopAllAction()` unbinds tracks and restores reference/bind values, snapping visible Mixamo bones to T-pose before `buildBodyPbd` samples them. FIX: `z.naturalCrawlerMixer.timeScale=0` on death, retaining bound live pose; PBD then captures that exact pose and takes over. Only corpse cleanup still calls `stopAllAction()` upon deletion. No changes to existing PBD constraints/physics, blast impulses, wall sweep or settlement.
- **Sinking:** v552 enlarged GLB from 0.86 to 2.0 but initial `Box3` floor alignment STILL clamped holder lift to +/-1.4 local units; severe clipping expected. FIX: apply actual measured `lift=(desiredFloor-box.min.y)/z.g.scale.y` without obsolete +/-1.4 clamp, subject to finite plausibility check abs <8. Retain ground offset as `naturalCrawlerBaseHeight`. After each LIVE crawl animation update, `updateNaturalCrawlerGroundPose` reads actual animated Head/Chest/Hands/Feet world positions (no expensive mesh raycasts), mildly raises the holder above ground if needed and damps back to calibrated base height when clear, safeguarding high/low animation poses. Check head bone center at least 0.32 above ground, chest .26, hands .08 and feet .05; the adjustment is capped at 1.8 local units and damped (12/s), scoped ONLY to naturally spawned GLB.
- **Face:** Actual source GLB's Body/face material was `alphaMode=BLEND` with double-sided transparent shading, susceptible to face sorting; switch ONLY that GLB's `Body` material to alphaTest .09 with depthWrite and DoubleSide, retain exact original texture/material shading and transparent cutout regions. Apply once at asset loading before cloning, not globally. Uploaded crawl clips pitch head downward; after mixer updates, add modest (-.12rad neck, -.26rad head) looking-up adjustment for forward visibility; this is not applied during ragdoll.
- **Protected:** Naturally spawning rolled crawlers only flag `kind==="crawler"&&forcedKind!=="crawler"`; leg-loss conversion `makeZombie(...,"crawler")` remains untouched. v549 ragdoll wall/ground physics unchanged, v548 shotgun upgrade unchanged, v547 sprint regen unchanged, v546 canopy RNG unchanged, original GLB, other models/hitboxes and zombie nav unchanged. `CURRENT_RECOVERY_CHECKPOINT.md` v324 untouched.
- Files changed: ONLY `src/game.js`, `index.html` v553 loader and prepend newest sections to `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`. Keep source asset `assets/zombie_number_3_-_animated.glb`, its CC BY 4.0 credits, CSS etc intact. Latest approved-safe gameplay before uploaded crawler is v549 asset commit `60d7eb98f2d334f17920bca93aa3c59ed9a6717c`; v552 visible-current backup `4fd306d1db629aab7d310dad9137722987b1990f`.
- Diagnostics `html.dataset.naturalCrawlerGroundLift`, `naturalCrawlerClearance`, `naturalCrawlerDeathPose="frozen"`, plus existing `naturalCrawlerAttached`. Need ES-module syntax check and GitHub Pages deploy; **visual test pending**.
- Test link after deploy: https://xboxlivehd88-hue.github.io/city-outbreak/?v=553-native-crawler-ground-face-ragdoll. Find a NATURALLY SPAWNED crawler in Wave 3+; its head/face should be visible above sidewalk, torso/hands not deeply submerged, and it must COLLAPSE FROM ITS LIVE CRAWL POSE on death rather than pop to T-pose. Test exploding native crawlers versus stair edges too. FPS check important. Ask for screenshot/video if grounding/face still wrong; don't assume verified.
- In next chat read newest TOP of both handoffs and `CURRENT_RECOVERY_CHECKPOINT.md`, current `src/game.js`, `index.html`, `src/game.css` on GitHub `main` before editing.

---

# NEW-CHAT HANDOFF — 2026-10-10 — v552 FIX TINY NEW NATIVE CRAWLER AND FLOATING RED GORE — READ FIRST

**Repo `xboxlivehd88-hue/city-outbreak` `main` authoritative. User sent an in-game screenshot of v551 at WAVE 3: naturally spawned new skinned crawler is MUCH TOO SMALL, plus there are LARGE DETACHED RED PIECES FLOATING over it. User wants both fixed. Keep converted leg-loss crawlers fully unchanged and preserve v549 ragdoll physics, other gameplay and v324 protected recovery. Current screenshot shows actual new imported model attaches, but sizing and left-over legacy visuals are wrong. User visual approval still needed.**

## v552 narrowly scoped correction
- Found exact root cause of red floating geometry in v551 `attachNaturalCrawlerVisual(z)`: **old procedural crawler gore meshes** such as `CrawlerBodyBlood`, `CrawlerMouthBlood`, `CrawlerForearmBlood` were marked `userData.visualOnly=true`. The v551 post-add traverse specifically SKIPPED any `o.userData.visualOnly`, allowing old gore to remain visible on TOP of the new skin as detached bloody cylinders, just as seen in screenshot. Fixed by invoking existing `hideNativeCrawlerVisual(z)` BEFORE `z.g.add(holder)`, hiding **ALL** legacy crawler mesh visuals regardless of `visualOnly`. The imported GLB is added afterward and remains visible. Previous generic native meshes remain available as invisible raycast/hitboxes for shooting. This exact hide function is already approved and used when preserving the upper body on converted crawlers; converted path is untouched.
- `NATURAL_CRAWLER_SCALE` increased from **0.86 to 2.0**, or approximately **2.33×** previous visual size. Existing on-load animated `THREE.Box3().setFromObject(holder)` ground alignment runs at the NEW scale, keeping crawler supported on pavement. Maintains imported `Crawl` / `Running_Crawl` / `Attack` skinned animation, model facing, hip root-motion fix, actual Mixamo bone binding (including v551 Spine2 numbering), naturally-spawned-only flag `kind==="crawler"&&forcedKind!=="crawler"`, same HP/attack/0.82-speed/waves, existing PBD ragdoll.
- Diagnostic DOM fields on attach: `html.dataset.naturalCrawlerScale="2"`, `naturalCrawlerOldGoreHidden="true"`, `naturalCrawlerAttached` incremented. If red gore still appears, inspect any uncategorized nonmesh visuals, not new model file.
- Changes ONLY `src/game.js`, `index.html` loader v552, newest TOP in BOTH `CITY_OUTBREAK_HANDOFF.md` and `NEXT_CHAT_HANDOFF.md`. Uploaded GLB `assets/zombie_number_3_-_animated.glb`, `MODEL_CREDITS.md` (author tonyflanagan, CC-BY-4.0), all CSS, checkpoint, zombie/damage systems and geometry assets untouched.
- Verify JS ES module parses and static assertions that hide called BEFORE `z.g.add(holder)` and no `userData.visualOnly` skipping persists; actual model, scale 2.0, no edits to `convertLeglessToCrawler`, baseline v551 remains recoverable: commit `22332875d9d62ca07648faeda7578e31f53187a1`. After successful GitHub Pages deploy test: https://xboxlivehd88-hue.github.io/city-outbreak/?v=552-natural-crawler-size-and-gore . **Wave 3** initial crawler: check its body/head size (adult-sized crawl), that red blood blobs no longer float above it, skin remains grounded and facing player, shots hit body/head, actual skeleton crawls and collapses properly. Visual approval required from user; tune scale later as needed.
- At start of future chats read newest tops of BOTH handoffs, recovery checkpoint, current `index.html`, `src/game.js`, `src/game.css` on GitHub main.

---

# NEW-CHAT HANDOFF — 2026-10-10 — v551 FIX MIXAMO SPINE2 BONE BINDING IN NATIVE CRAWLER GLB — READ FIRST

**Repo `xboxlivehd88-hue/city-outbreak` branch `main` authoritative. v550 installed uploaded `assets/zombie_number_3_-_animated.glb` only for naturally rolled/spawned crawlers, preserving leg-loss conversions. A real GitHub Actions GLB rig validation before handoff uncovered critical v550 error: `crawlerBoneLabel()` stripped ALL numerical characters with `/[^a-z]/g`. This misidentified `mixamorig:Spine2_51` as `spine` and failed required `Chest` binding, meaning new model would NEVER attach. v551 corrects this before user testing.**

## Fix
- `crawlerBoneLabel` now removes only the trailing serial suffix `/_\\d+$/` (GLTF's node index) before stripping punctuation with `/[^a-z0-9]/g`, and removes `mixamorig` prefix. Examples: `mixamorig:Hips_64 -> hips`, `mixamorig:Spine_53 -> spine`, `mixamorig:Spine2_51 -> spine2`, `mixamorig:LeftForeArm_24 -> leftforearm`. This maps the actual 17 important Mixamo bones uniquely for the naturally spawned crawler's skinned animations and existing PBD ragdoll. Every `NATURAL_CRAWLER_BONE_NAMES` key remains unchanged; no skipped crawler visual.
- Bump `index.html` game loader v550 -> **v551**; original GLB path remains v550 unchanged, asset binary checksum `14ef35769c43686d6b508fd7db831fc853350527`.
- Only game.js, index.html, and both newest handoff tops changed; credits file, CSS, checkpoint v324 and ALL unrelated game logic unchanged. v550 user's new model functionality as documented in previous TOP section still applies: GLB built-in Crawl/Running_Crawl/Attack animations, stripped horizontal hip root motion, body alignment and original game hitbox, naturally spawning crawlers ONLY, leg-loss conversion remains old model.
- MUST verify actual uploaded GLB normalized labels set contains all 17 mapping keys, Node game.js syntax, expected main HEAD, game Pages deploy successful. No visual approval until user checks.
- Play after Pages successful: https://xboxlivehd88-hue.github.io/city-outbreak/?v=551-native-crawler-skeleton-fix . Crawlers start rolling in **WAVE 3**. Look for the NEW clothed GLB crawling toward you, proper height/orientation/attack, correct bullets and ragdoll. Cutting off both legs on a standing walker still uses original crawler body. If old procedural model remains for native spawns, inspect `html.dataset.naturalCrawlerAsset`, `naturalCrawlerLoadError`, `naturalCrawlerAttached` and animations.
- Next chat FIRST read newest TOP of `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md` and current `index.html`, `src/game.js`, `src/game.css` on main. Current working v549 gameplay+uploaded asset commit `60d7eb98f2d334f17920bca93aa3c59ed9a6717c` is targeted rollback; v324 protection preserved.

---

# NEW-CHAT HANDOFF — 2026-10-10 — v550 NEW ANIMATED GLB FOR NATURALLY SPAWNING CRAWLERS ONLY — READ FIRST

**Authoritative repo `xboxlivehd88-hue/city-outbreak`, `main`. User uploaded `assets/zombie_number_3_-_animated.glb` and explicitly wants to REPLACE only the NATURALLY SPAWNING crawler. Do NOT change crawler conversion from leg-damaged walker/Green Guy/special zombie. User must visually test before model scale/orientation/animation is approved. Rollback if needed to v549 commit `60d7eb98f2d334f17920bca93aa3c59ed9a6717c` (which contains new asset and untouched gameplay), and preserve protected recovery v324.**

## Uploaded GLB inspection (real binary source)
- Asset SHA `14ef35769c43686d6b508fd7db831fc853350527`, 8,474,288 bytes, six skinned meshes, one 66-joint Mixamo skeleton, 11 actual animation clips: **Running_Crawl (0.7s), Idle (4.33s), Attack (2.57s), Biting_1, Biting_2, Crawl (5.17s), Death, Dying, Neck_Bite, Run, Scream**.
- Mixamo animation clips have HUGE baked `mixamorig:Hips_64` translation: e.g. Crawl forward track Y ~2.75 to 217.87 GLB local units and Running_Crawl 3.56 to 149.15 (scaled ~0.01 from source). The model root has rotated matrices and the face/eyes point toward GLB +Z. Playing clip raw adds a SECOND movement on top of game navigation (visual drifting/sliding). Source asset left UNCHANGED; normalized animated hip X/Y translations to standing rest X/Y in memory, preserving height bob on hip Z, and aligned first-frame hip height to Crawl across clips. Model yaw PI to face existing game local -Z, with v549 native crawler root -0.14 rad pitch compensated. Small scale 0.86 and one-time ground bounding-box calibration.
- License embedded in GLB: author **tonyflanagan**, source https://sketchfab.com/3d-models/zombie-number-3-animated-e3d6ca7045ad4beaaabb11b08bdf0085 , **CC BY 4.0**; attribution added in new `MODEL_CREDITS.md`.

## Only native crawler changed
- `makeZombie` new `naturalCrawlerSpawn=kind==="crawler"&&forcedKind!=="crawler"` flag. Normal wave-spawn `makeZombie(p.x,p.z,i)` rolls native; `convertLeglessToCrawler` calls `makeZombie(x,z,oldIndex,"crawler")`, so **leg-loss conversions cannot receive this model**. All their preserved-body/identity logic, no-stiffened ragdoll, combat, HP, nav, speed, attacks untouched.
- On a native spawn, use `SkeletonUtils.clone` from preloaded GLB, ONE exact skinned model per zombie. Original procedural meshes hidden but still serve as the approved, inexpensive weapon raycast/limb hitboxes and navigation. Add animation mixer per crawler: Crawl loop for low speed, Running_Crawl for faster movement, Attack for a bite; never play model's upright Idle as crawling rest. Clip selection driven by actual movement (speed) with short crossfades and speed scaling. Render no additional real lights/shadows, skinned geometry no erroneous frustum cull. If asset loads after zombies spawn, attach retrospectively to living naturally spawned crawlers.
- Extract actual arm/hip/torso/leg bones by Mixamo names for native crawlers ONLY and give their new visible model to the existing `bodyPbdRig` for dead-zombie PBD. On death stop the imported keyframe mixer; underlying joint-point gravity, collision, explosive impulses, full-body settle checks, torso/limb bends, and corpse budget stay intact. Leg-loss crawler ragdoll still uses prior system. No new ragdoll solver.
- Assets/models for walkers and Green Guy, wave percentages, crawler speed coefficient 0.82, live hitboxes, weapon shooting/dismemberment, map/collision, v549 dead ragdoll swept collision, v548 shotgun upgrade, v547 sprint/health, v546 fluorescent flicker/graphics all unchanged. `CURRENT_RECOVERY_CHECKPOINT.md` v324 and CSS unchanged.
- Files changed: `src/game.js`, `index.html` loader v550, TOP of BOTH handoffs, new `MODEL_CREDITS.md` for GLB's CC-BY-4.0 terms. No asset blob is overwritten.
- Validate JS syntax + source native/conversion distinction and run Pages deploy. Test: https://xboxlivehd88-hue.github.io/city-outbreak/?v=550-native-crawler-glb . NATURAL CRAWLERS BEGIN SPAWNING WAVE 3; check visible character model, correct facing/size/grounding, smooth animated forward crawling, head/limb damage and floppy death. To specifically verify exclusion: cut both legs off a normal zombie and check its existing crawler remains unchanged. User visual approval mandatory before further fine tuning.

---

# NEW-CHAT HANDOFF — 2026-10-10 — v549 DEAD RAGDOLL COLLISION SAFETY — READ FIRST

**Repo `xboxlivehd88-hue/city-outbreak` main source of truth. User screenshot in v548 shows blown zombie skin partly embedded in ground and reports occasional corpses stuck through walls, stairs and ground after explosions. User explicitly wants the fix WITHOUT breaking established physics. v548 gameplay commit `6ed0b8dd87e9789a5e997a39fb0048bc9e8ce134` remains the rollback reference; protected recovery v324 untouched. Visual approval PENDING user tests.**

## v549 changes
- Actual dead-zombie Hairibar-inspired PBD node `collideBodyPbdNode` formerly called `slideBuilding(oldX,oldZ,newX,newZ,pad)` on ENDPOINT only. Explosive velocity can tunnel through thin city wall cells while both endpoints are outside the collider. Added `sweepBodyPbdWall(n,pad)`: subdivides horizontal movement into <=0.14-unit increments (max 16 substeps), accumulating from last collision-resolved point and using EXISTING `slideBuilding` per increment. Starts inside a wall recover via existing `pushOutsideBuilding` once; normal movement is unaffected. Only dead-body PBD uses this, no global collider, player movement, living-zombie navigation, map or explosion-force changes.
- Previously ground probing used current new `n.pos.y` only, potentially BELOW a stair/floor after high-speed fall and missing a raised tread. Now queries `sampleRagdollGroundY` with `Math.max(n.old.y,n.pos.y)`. Existing step ascent guard remains, with an exemption when the node descended from ABOVE a new stair tread. Prevents sideways snapping through staircase sides while allowing valid landings.
- Small clearance increase of contact nodes to reduce skin clipping: skull radius .17 -> .20, hips/chest .10 -> .16, hand/foot .075 -> .085; other 0.10 unchanged. **Keep** the actual visible zombie GLBs, all skeleton joint constraints, gravity, explosion launch momentum, corpse movement, loose floppy dynamics, bounce and settle-until-down mechanics EXACTLY as before. This is a contact-only change.
- No new render lights, mesh raycasts, shadows or enemy physics globally. Test FPS on large groups of blast ragdolls, since swept collision adds extra checks only during rapid movement. Only `src/game.js`, `index.html` loader v549, and TOP of `CITY_OUTBREAK_HANDOFF.md` and `NEXT_CHAT_HANDOFF.md` changed; `src/game.css`, GLBs, `CURRENT_RECOVERY_CHECKPOINT.md` v324 untouched.
- Preserve v548 Faster Reload shotgun scaling `Math.round(380+440*Math.pow(.53,reloadLevel))`, v547 sprint 26.67 drain and 12.5 HP/s regen, v546 fluorescent arrival flicker, v543 sidewalk hydrant removal, v538 lighting, and all guns/zombies/waves/UI.
- Validate current HEAD, JS syntax, swept collision wall-crossing tests, stairs/floor sampling tests, and Pages deploy. **Do not claim all penetrations fixed without in-game testing.** Test link after success: https://xboxlivehd88-hue.github.io/city-outbreak/?v=549-ragdoll-collision-guards . Blast toward walls, stairs and the ground and check visual settling AND performance. If render mesh still intersects despite joint contact, inspect render skin separately rather than rewriting established PBD joints.
- Next chat should FIRST read newest TOP of handoffs, recovery, current `index.html`, `src/game.js`, `src/game.css` directly from GitHub main.

---

# NEW-CHAT HANDOFF — 2026-10-10 — v548 SHOTGUN FASTER RELOAD UPGRADE NOW NOTICEABLE — READ FIRST

**GitHub main is authoritative: `xboxlivehd88-hue/city-outbreak`. User tested the shotgun Faster Reload store purchase and said each upgrade felt like only ~0.05 seconds faster. The current `reload()` shotgun branch confirmed `shellDuration=Math.max(580,820-reloadLevel*45)` (only 45 milliseconds per round, with a hard minimum 580ms). Change only its scaling, without disturbing beloved v532 chamber/bottom-magazine insertion motions.**

## v548 exact adjustment
- In `src/game.js` shotgun branch of `reload()`, replace original slow linear 45ms decrease with `Math.round(380+440*Math.pow(.53,reloadLevel))` milliseconds per shell. Level 0 **820ms**, level 1 **613ms** (207ms, 25.2% faster per shell), level 2 **504ms**, level 3 **446ms**, level 4 ~**415ms**. Diminishing future gains approach 380ms with NO sudden flat floor. This applies per shell, not merely once to the whole tube.
- For an **empty 8-round shotgun**, theoretical reload times excluding scheduling/UI overhead at levels 0,1,2,3 become **6.56s**, **4.90s**, **4.03s**, **3.56s**; initial purchase therefore saves about **1.66 seconds** across 8 shells, immediately perceptible. Partial loads scale correspondingly.
- Preserve original code path: `shotgunReloadShellIndex=a.mag===0?0:1` (only first shell side-chambered when completely empty; all other shells load from bottom), same `shellDuration` sets both `reloadDurationMs` for normalized `reloadPoseProgress` animation and `gameTimeout` for shell insertion + sound, no skipped frames/teleporting shells, same shotgun visual FX/hand/elbow controls. Other guns' reload formulas, global store cost ($300) and upgrading `reloadLevel`, ammo cap, shooting, pause and reset untouched.
- Debug `document.documentElement.dataset.shotgunReloadShellMs` updates at shotgun reload start, letting next developer verify current actual per-shell duration. No UI clutter or additional rendering objects. v547 sprint/health values unchanged, as are v546 canopy RNG flickers, v543 specific hydrant, v538 performance, v534 graphics, v533 explosions, v531 grenade breakup, zombies, ragdoll, collision and all other gameplay.
- Modified only `src/game.js`, `index.html` module cache `?v=548`, and prepended handoff to BOTH `CITY_OUTBREAK_HANDOFF.md` and `NEXT_CHAT_HANDOFF.md`. Protected `CURRENT_RECOVERY_CHECKPOINT.md` v324 and `src/game.css` (v525) untouched.
- Verify patch on GitHub main, `node --input-type=module --check < src/game.js` and successful Pages deployment. User test: start with shotgun (spawn), empty gun and reload without upgrade; buy one Faster Reload in shop ($300), empty gun again and compare entire shell-by-shell sequence. Confirm all shells still visible, first empty chamber load, all later bottom loads, no arm snapping. Do NOT mark visual approval without user.
- Test link after Pages deploy: https://xboxlivehd88-hue.github.io/city-outbreak/?v=548-shotgun-reload-upgrade
- Next chat must read newest TOP of handoffs, recovery and `index.html`, `src/game.js`, `src/game.css` from GitHub main before edits.

---

# NEW-CHAT HANDOFF — 2026-10-10 — v547 MODEST SPRINT + HEALTH REGEN BALANCE — READ FIRST

**Repo `xboxlivehd88-hue/city-outbreak`, branch `main` is authoritative. User requested sprint stamina deplete a bit slower and health regenerate a bit faster. No other gameplay or lighting modifications requested.**

## v547 targeted gameplay balance
- `src/game.js`: sprint stamina **drain** changed from `33.34 * dt` to `PLAYER_SPRINT_DRAIN_RATE=26.67` units/s (~20% slower). Full 100 sprint stamina now lasts approximately **3.75s** of uninterrupted sprinting instead of **3.00s**. Sprint velocity 9.5, walking velocity 5, recharge 14/s, full-bar sprint unlock condition, stamina cap 100, UI behavior and wave reset all unchanged.
- Health regeneration **rate** changed from `PLAYER_HEALTH_REGEN_RATE=10` to **12.5 HP/sec** (+25%). Original **5-second no-damage delay** remains unchanged. Damage handling, health max 100, death rules and health reset each wave stay as before.
- `index.html` loads `src/game.js?v=547` for cache invalidation. Prepend this handoff to BOTH `CITY_OUTBREAK_HANDOFF.md` and `NEXT_CHAT_HANDOFF.md`; `CURRENT_RECOVERY_CHECKPOINT.md` protected v324 remains unchanged, along with `src/game.css` (v525). Do not modify assets or any other game modules.
- Preserve v546 gas canopy arrival-triggered independent RNG flickering + bulbs/cover tint and distance fade, v543 targeted sidewalk hydrant removal, v538 six-light shader-stable streetlamps, v534 graphics tiers, v533 explosions, v532 reloads, v531 grenade shattering, zombies/ragdolls/weapons/waves and approved Settings menu.
- Check source invariants (new drain rate exactly one use; regen exactly one rate value; old delay remains 5; sprint refill stays 14 and locked sprint unlock stays at 100; 3 gas canopy fixtures and shared single spotlight still in source). Verify main SHA, optional JS syntax, and GitHub Pages deployment SUCCESS before providing test link.
- Test: [v547 playable](https://xboxlivehd88-hue.github.io/city-outbreak/?v=547-sprint-health-balance) — from full sprint bar, hold Shift while moving and compare duration; after taking nonfatal damage, go safely without hits for 5 seconds and check quicker recovery. Do not claim playtest confirmed until user approves.
- Next chat: read latest TOP of `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, `index.html`, `src/game.js`, `src/game.css` from GitHub main before edits.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v546 FIRST VISIBLE CANOPY FLICKER TRIGGERS ON PLAYER ARRIVAL — READ FIRST

**GitHub main source of truth: `xboxlivehd88-hue/city-outbreak`. User said v544 flicker was invisible throughout a round. v545 addressed hidden tinted glass and too-short/rare events. During pre-release validation, discovered v545's early first-flicker schedule started at async GLB LOAD (even on opening screen), so these guaranteed first flickers might have already ended before the player walked to the gas station. v546 addresses this. Final visible flicker requires user testing.**

## Exact v546 fix
- `src/game.js` now initializes each of the 3 independent canopy RNG states with `next:Infinity`, i.e., no flickers while the player is distant or in the startup menu before first arriving. On `running &&` player's XZ distance to actual `Gas_Station_01` roof world-AABB EDGE <= **6 game units**, set `gasCanopyFirstApproachArmed=true`, give each of three fixtures a staggered first flicker at **3.2–4.8s, 5.5–7.1s, 7.8–9.4s** after arrival, independently randomized. Do not rearm after initial approach; future repeats remain randomized **18–54s per fixture**, events 680–1020ms with two deep dips, dim textured GLB cover as well as tubes (v545).
- `html.dataset.gasCanopyFirstFlickerArmed` reflects proximity arming; `gasCanopyFlickerEvents`, `gasCanopyActiveFlickers`, `gasCanopyIndependentFlickerRows`, `gasCanopyBulbMeshes`, `gasCanopyGlassMeshes` remain available. No extra spotlights / no .visible spotlight switches during motion, preserves v537/v538 shader-count optimization.
- All v545 GLB cover tint/bulb tint flicker, v542 distance glow range 12-34 units beyond canopy, one shared spotlight, original 50% fixtures, v543 targeted hydrant removal, graphics Low/VeryLow, shotgun/zombies/explosions/ragdoll/physics stay unchanged. `CURRENT_RECOVERY_CHECKPOINT.md` v324 untouched.
- Files touched: `src/game.js`, `index.html` loader v546, TOP of `CITY_OUTBREAK_HANDOFF.md` and `NEXT_CHAT_HANDOFF.md`. CSS v525 and assets unchanged.
- Verify JS syntax, code assertions, Pages deployment success. **User test:** Walk INTO gas station canopy and STAND looking at all three fixtures for **12 seconds** (first flicker clock starts on arrival); expect visually dimming GLB textured cover and bulb, independent short double blink per fixture. If not visible, investigate dataset counts and runtime GLB loader names and actual material references.
- Play after verified deploy: https://xboxlivehd88-hue.github.io/city-outbreak/?v=546-arrival-triggered-fluorescent-flicker
- Always read latest top sections of handoffs, recovery and current `index.html`, `src/game.js`, `src/game.css` from GitHub main when continuing.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v545 MAKE GAS-CANOPY RNG FLICKER ACTUALLY VISIBLE — READ FIRST

**Repo `xboxlivehd88-hue/city-outbreak` `main` is authoritative. User tested v544 watching gas-station fluorescents through a whole round and NEVER witnessed a flicker. That is not visually approved. Fix visibility without affecting all other game mechanics or the streetlamp FPS shader-light budget.**

## Root cause and v545 changes
- v544 faithfully used very rare streetlight RNG waits (**14–90 seconds plus additional 0–12s initial offset**) and extremely short **90–420ms** events. A round can easily pass without noticing an event.
- Probed ACTUAL uploaded binary `assets/simple_fluorescent_tube_light.glb` materials using successful separate-branch GitHub Actions inspection: **Glass** material is `alphaMode=BLEND` with **81.5% alpha**, TEXTURED baseColor, and no native emissive; bulb `LigthBulb` material is behind this glass. v544 changed only bulb MeshBasicMaterial tint and the cover glass's weak added emissive intensity, NOT its bright baseColor texture, concealing visible flicker.
- v545 in `src/game.js`: each canopy luminaire gets its own early, staggered initial RNG event after **3.5–5.7s** (row 1), **6.1–8.3s** (row 2), **8.7–10.9s** (row 3) of fixture load; subsequent independently randomized waits **18–54s per fixture**. Event lasts **680–1020ms**, with two clearly visible **0.08 brightness** dips 0–160ms and 340–490ms, and retains the streetlamp's same RNG chaotic `sin` dip levels `0.08/0.34/0.72` between them. Original fixtures do not strobe continuously or synchronize.
- Multiply BOTH real fluorescent bulb unlit tint AND textured glass cover **base material.color** by the same per-row brightness (and existing v542 player-distance fade); restore exact original glass tint at 100%. Preserve glass PBR, transparency, materials, GLB source mesh housing, mounting, 50% v541 scale and v541 geometry-based right-half removal. This actually dims the VISIBLE cover surface when a fixture flickers.
- The existing one shared canopy SpotLight follows average of three fixture RNG brightness values and existing 12–34 game-unit v542 distance fade; **no additional SpotLights**, no changing real spotlight visible status on movement/flicker, no shadows or expensive animations, protect v538 fixed SIX smart streetlights and v534 Low/VeryLow.
- Debug html dataset after GLB load: `gasCanopyIndependentFlickerRows=3`, `gasCanopyBulbMeshes=6`, `gasCanopyGlassMeshes=3`, and `gasCanopyFlickerEvents` incremented when RNG event STARTS; `gasCanopyActiveFlickers` switches on events. If these counts are wrong, inspect runtime actual GLB names/geometry and fix before claiming visually successful.
- Only `src/game.js`, `index.html` module cache bumped to v545, and latest TOP of BOTH handoffs changed. Protected v324 recovery, `src/game.css` v525, city and fluorescent GLBs, hydant v543, shotguns, explosions, weapons, zombies, collision/waves etc untouched.
- Static validation should confirm 3 independent RNG states, 1 spotlight, 3 rows, half-size, glass.tint and bulbs altered together, shortened first event and long independent waits, v545 loader; successful GitHub Pages deploy is mandatory. **Visual/FPS acceptance requires user's own gameplay test; do not claim verified actual flicker yet.**
- PLAY after verified deployment: https://xboxlivehd88-hue.github.io/city-outbreak/?v=545-visible-canopy-flicker . Stand under canopy facing all three fixtures for **about 12–15 seconds**. Expect each to noticeably blink/dim on its own; keep watching another minute for irregular repeats. If no blink, debug runtime DOM counts and screenshots/video.
- For next chat read most recent TOP of `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, `index.html`, `src/game.js`, and `src/game.css` directly from `main`.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v544 GAS-STATION FLUORESCENTS MATCH RARE STREETLAMP RNG FLICKER — READ FIRST

**Repo `xboxlivehd88-hue/city-outbreak`, branch `main` is authoritative. User requested: give the three already-approved size/placement gas-station fluorescents the SAME rare, independent random flicker as the city's streetlights. Keep distance behavior and fixed spotlight budget, do not touch v543 hydrant removal or other game mechanics. Visual approval of flickering pending user test.**

## v544 changes
- `src/game.js` adds three independent `gasCanopyFlickerStates`, initialized once during existing v541 fixture cloning. Each fixture (not its individual twin tubes) flickers separately, independent of the other two and independent of streetlamp heads. Uses **same** `nextStreetLampFlickerTime(t)` for randomized 14-90s wait, extra per-fixture initial 0-12s offset; same `90+random*330` millisecond short flicker interval, fresh random seed, and exact same `chaos=sin((t+seed)*.082)+sin((t+seed*7.1)*.193)` / brightness `0.08, 0.34, 0.72` dips. Otherwise each remains full brightness. Not a frequent synchronized horror strobe.
- Bulb MeshBasicMaterial colors and translucent-glass emissive intensity multiply their original brightness by **both** v542 distance fade and their own corresponding fixture's RNG flicker factor. Off distance remains 34 game units beyond gas canopy edge, fully on within 12, smooth in between. After async load apply initial state immediately, then update per frame using same clock `t` as streetlights.
- One stationary gas canopy warm fill SpotLight intensity follows distance and **average flicker of the 3 independent fixtures**, so the pump floor subtly reacts. Crucial: no new real lights, no `.visible` changes on moving/flicker, fixed six streetlamps on High and fixed one gas-canopy light remain. Graphics preset Off still disables real canopy SpotLight; v534 Low/Very Low remain cheap. `syncGasCanopyLighting` respects cached average brightness on preset changes.
- Exposes `html.dataset.gasCanopyIndependentFlickerRows=3` for source diagnostic. Keeps authentic GLB, three rows, original-size ×0.50 single-luminaire geometry-trim, front-to-back placement; do not remove lights again. Existing `gasCanopyFixtures=3`, v542 distance fade, v543 OFFICE hydrant removal, v538 fixed streetlamp budget all protected.
- Only `src/game.js`, `index.html` loader v544, and both handoff documents updated. `src/game.css` v525, city/fixture GLBs, `CURRENT_RECOVERY_CHECKPOINT.md` (v324), gameplay physics/weapons/zombies and all other modules untouched.
- Verify exact-3 fixture count, independent 3 RNG states, same streetlight timing/dip function, unchanged spotlight count/visibility, distance fade, `src/game.js?v=544`, and successful Pages deploy. User should test near gas station for up to ~1–2 minutes to witness RARE flickers, watch that the three never all blink deliberately in sync and floor glow responds subtly. No unverified FPS or live visual claims.
- Play after successful deploy: https://xboxlivehd88-hue.github.io/city-outbreak/?v=544-independent-gas-canopy-flicker
- Next chat MUST read newest TOP sections of `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, `index.html`, `src/game.js`, `src/game.css` from GitHub main before touching anything.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v543 REMOVE ONE MISPLACED OFFICE SIDEWALK HYDRANT — READ FIRST

**GitHub `main` on `xboxlivehd88-hue/city-outbreak` is authoritative. User provided 3 screenshots of a red hydrant standing awkwardly in the middle of the sidewalk near the OFFICE entry and explicitly clarified that the object the crosshair is pointing at should be removed. THIS is the specific red fire hydrant, not the OFFICE entrance structure. All prior approved gameplay/lighting retained; visual verification still needed.**

## v543 focused removal
- Inspected actual binary city GLB using temporary GitHub Actions probe on separate unmerged `hydrant-location-probe` branch. It reports EXACTLY THREE distinct hydrants in `assets/chicken_gun_fruzer_-_city.glb`: `Hydrant__2_` source node 395, mesh 396 centered local (-18.27,-18.08,21.54), world (~-6.98,0.66,41.63); `Hydrant__1_` source node 397, mesh 398 at world (~6.08,0.66,-34.57); `Hydrant` source node 425, mesh 426 at world (~-5.07,0.66,29.72). Nearby `Office_01__1_` is centered around world (-13.55,6.29,47.25). The targeted object is the first hydrant by this OFFICE structure, **not all hydrants**.
- `src/game.js` adds `removeOfficeSidewalkHydrant(map)` when city GLB loads. Finds only hydrant-named mesh(es) with measured WORLD position within 0.85 units of (-6.98,41.63). On **exactly 1 match**, detaches its own hydrant group (or mesh fallback) so the red hydrant and its actual geometry disappear, preserving the other two. Never deletes an object solely because of a name match or guessed screen position. If names/geometry change, safe no-op with warning instead of deleting random world geometry.
- Important: called immediately after `scene.add(map); map.updateMatrixWorld(true)` and BEFORE wet materials, city spawns/nav, `scanExactCityLampAnchors`, `buildNewCityCollision`. Therefore removed hydrant cannot leave a phantom collider or affect walkability. Diagnostic: `document.documentElement.dataset.officeSidewalkHydrantRemoved` should be `1`.
- Only `src/game.js`, `index.html` loader bumped to v543, and both top-of-file handoffs updated. `CURRENT_RECOVERY_CHECKPOINT.md` v324 remains untouched. `src/game.css`, city GLB asset, all 3 canopy fixtures, v542 distance fade, v538 fixed streetlights, Low/Very Low presets, weapon effects, zombies, ragdoll, waves unchanged.
- Verify before declaring success: inspect GitHub main commit, source assertion one target within 0.85 units, two other coordinates safely apart, syntax/deployment checks. VISUAL confirmation from user required. Test link after Pages completes: https://xboxlivehd88-hue.github.io/city-outbreak/?v=543-office-sidewalk-hydrant-removal . Walk back to OFFICE entrance pictured in screenshot and confirm red sidewalk-center hydrant absent, but neighboring doorway, building, sidewalk and other hydrants unaffected.
- On next chat read newest TOP of `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, `index.html`, `src/game.js`, `src/game.css` from main first. Separate probe branch is not part of main.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v542 DISTANCE-ACTIVATED GAS STATION CANOPY LIGHTS — READ FIRST

**GitHub `main`, repo `xboxlivehd88-hue/city-outbreak`, is authoritative. User likes the 3 smaller gas station lights but reported they remain on no matter how far the player gets. This is a targeted distance-based lighting change only. Visual confirmation PENDING.**

## v542 modifications
- `src/game.js` adds `updateGasCanopyLighting(dt,instant=false)`: get player's X/Z distance to nearest real canopy footprint edge (zero inside), FULL brightness within 12 world units outside canopy, smoothly fade from 12 to 34, fully dark past 34. Player returns => bulbs/spotlighting fade back on.
- All 3 authentic single fluorescent fixtures stay at v541 **50% scale**, one per pump bay, long axis front-to-back. Keep dark fixture housing permanently visible; fade real glowing bulb material colors and glass emissive level, skip drawing the bulbs once practically off. One shared warm spot on the ground ramps proportionally (HIGH 355, MEDIUM 210, LOW/VeryLow/Off 0).
- Keep shared spotlight `visible` constant DURING movement/camera turns (change only when graphics preset changes), altering `intensity` instead. This avoids v536-v537 dynamic shader recompile frame drops and protects six pooled v538 smart streetlamp spots. Do not add real lights or raycasts. Same v541 left-half geometry-trim and GLB assets.
- Set debug `html.dataset.gasCanopyLightsOn` only when bulb on/off state changes; `gasCanopyLightFadeRange="12-34"`. After async map/light GLB installation apply proximity immediately so far-away bulbs do not flash on; continue every frame inside existing animation function.
- Existing Low/Very Low remain no canopy spotlight but glowing fluorescent tube material near the player, with the same distance fade. Graphics Settings and mode changes retained.
- Files touched: only `src/game.js`, `index.html` loader v542, and both handoff docs prepended. Protected `CURRENT_RECOVERY_CHECKPOINT.md` v324 untouched. Preserve approved shotguns, explosions, grenades, settings, zombie AI/ragdoll/waves, camera/collisions, streetlight optimization, v541 fixtures.
- Static falloff cases tested (inside: 1, outside 12: 1, 23: 0.5, 34+: 0). JS source checked for three clones and half-size scale. Need successful GitHub Pages deployment and user test; no unmeasured FPS or visual claims.
- PLAY: https://xboxlivehd88-hue.github.io/city-outbreak/?v=542-canopy-distance-lights . Under gas canopy expect three lit fixtures; walk away down road, they should gradually go dark; return and bulbs and the ground light brighten. On High compare turning/stuttering; please share screenshot if anything seems wrong.
- In next chat read current TOP of `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, plus `index.html`, `src/game.js`, `src/game.css` directly from GitHub main before changes.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v541 RESTORE VISIBLE SMALL CANOPY FLUORESCENT FIXTURES — READ FIRST

**GitHub `main` is the source of truth. User tested v540 and provided a screenshot clearly showing ALL THREE fluorescent fixtures MISSING, while the gas-pump area remained illuminated. This was a regression from v539; user requires 3 visible fixtures, at exactly 50% of v539 scale, without the RIGHT luminaire of each original double fixture. User has not yet approved the revised visuals.**

## v541 root cause and fix
- v540 returned early in `installGasStationCanopyFixtures(map)` when `source.getObjectByName("Zlight.001")` (and `Zlight`) failed to match loader-generated scene node names. Three.js GLTFLoader sanitizes or renames names, especially punctuation. As a result, **NO THREE CLONES or shared canopy light were added**; screenshot confirms all 3 fixtures absent.
- Removed that name-dependent early-return block. Now determine source midpoint X from `new THREE.Box3().setFromObject(source)` and iterate actual mesh descendants; each mesh world-bounds midpoint to the RIGHT of original model center belongs to duplicate right fixture. Remove ONLY those mesh descendants, keeping complete left housing, cover glass and both internal tubes regardless of GLTFLoader mesh/node names. The previously inspected actual GLB geometry (12 mesh primitives, separated at X≈0) supports this split. Validate at least 4 mesh components in each half; if an uploaded GLB changes unexpectedly, log a warning but **never make all three light fixtures disappear again**.
- Maintain v540 half of original v539 model scale by computing scale from the ORIGINAL full-GLB bounds (before trim), then multiply by 0.50. Recenter remaining authentic left fixture so all 3 copies are front-to-back under the 3 gas canopy bays. Keep original GLB asset unchanged. Keep shared spotlight identical and shadowless and v538 fixed six-light streetlight budget.
- Expose `dataset.gasCanopyFixtures=3`, `dataset.gasCanopySingleLeftLights=3` when trim successful, `gasCanopyRemovedRightMeshes`, `gasCanopyTrimError`, `gasCanopyScaleRatio=0.50` for debugging.
- Change ONLY `src/game.js`, `index.html` game loader v541, and the newest section at TOP of BOTH handoff documents. `src/game.css` remains v525. Do NOT alter approved shotgun, grenades, explosions, zombies, graphics Settings, collisions, waves or protected `CURRENT_RECOVERY_CHECKPOINT.md` v324.
- Verify code has 3 clones, GLB bounds determine split, no name lookup early-return, shared spotlight unchanged; check GitHub Pages deploy, then user screenshot visual test. We cannot truthfully assert live in-game visual quality without user's inspection.
- TEST: https://xboxlivehd88-hue.github.io/city-outbreak/?v=541-visible-small-canopy-fixtures . Look up from beneath the gas station canopy; expect THREE separate small fixture housings, each with two glowing tubes, mounted centrally in each lane. No side-by-side duplicate housings. Confirm placement/brightness/FPS.
- On next chat read new TOP of `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, `index.html`, `src/game.js`, `src/game.css`. Latest GitHub `main` supersedes older notes.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v540 HALF-SIZE SINGLE FLUORESCENT CANOPY LIGHT PER BAY — READ FIRST

**Repo `xboxlivehd88-hue/city-outbreak`, branch `main` remains source of truth. User visually tested v539 and supplied a screenshot: the 3 fixtures were far too large and each had an unwanted duplicate fixture on the RIGHT. User requested: “make them 50% smaller and we dont need the lights on the right of each set”. v539 was NOT visually approved. v540 changes only that requested canopy model size/composition.**

## v540 changes and exact source-GLB diagnosis
- The v539 probe's REAL source GLB scene list shows the original `assets/simple_fluorescent_tube_light.glb` has two full side-by-side luminaires: **`Zlight` at source X[-0.79,-0.08]**, and the parallel **`Zlight.001` at X[0.07,0.78]**. Each luminaire has its own base, glass cover and two `LigthBulb` meshes. The user wants the right entire luminaire removed, not just one glowing bulb.
- In `installGasStationCanopyFixtures(map)`, after loading the original unchanged GLB, remove its entire `Zlight.001` subtree before making three clones, leaving the authentic complete left `Zlight` assembly (one housing, glass, TWO internal tubes) per canopy bay. No geometry cutting, third-party replacement, shader clipping, new draw calls or mesh copies. Recenter on the bounds of the remaining housing.
- Capture v539's ORIGINAL full-GLB dimensions BEFORE removing the right duplicate, calculate the EXACT same v539 roof-bounded size, then multiply by **0.50**. This prevents auto-width sizing from compensating for removal. Based on inspected GLB/map geometry, v539 scale was 2.05 and v540 scale is ~1.025; fixture front-back length reduces ~6.19 to ~3.10 world units.
- Keep the THREE rows aligned front-to-back centered under the three real canopy bays, mounted immediately below actual roof underside. Do not change the shared warm-white shadowless pump spotlight, the fixed six-streetlight High shader budget, or graphics presets.
- Bump `index.html` module loader from v539 to **v540**; CSS v525, unchanged original fluorescent GLB path and other modules untouched. Record `dataset.gasCanopySingleLeftLights=3`, `gasCanopyScaleRatio=0.50` for debug.
- Protected `CURRENT_RECOVERY_CHECKPOINT.md` v324 untouched; preserve all v539 and prior gameplay, zombie AI, weapon reloads, grenade breakup, graphics presets, opening screen and UI.
- Validation: assert exact `Zlight`/`Zlight.001` names against v539 probe logs, one removed before cloning, scale half original, 3 loops, v540 loader; JS syntax and GitHub Pages deploy. **No visual approval until user tests**.
- New test link after Pages deployment: https://xboxlivehd88-hue.github.io/city-outbreak/?v=540-single-half-size-canopy-lights . At the gas station look UP: THREE small separate single housings, ONE centered per bay (not pairs); each single housing still has its two built-in glowing tubes. Compare size vs screenshot, roof mount, brightness and FPS. Ask user for a screenshot if further tweak needed.
- GitHub main remains authoritative. On next chat read newest sections of `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, `index.html`, `src/game.js` and `src/game.css` first.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v539 GAS STATION CANOPY FLUORESCENT LIGHTS — READ FIRST

**Repo `xboxlivehd88-hue/city-outbreak`, branch `main` is source of truth. User requested directly installing 3 newly uploaded `assets/simple_fluorescent_tube_light.glb` instances underneath gas-station canopy, one centered in each of 3 bays front-to-back, all illuminated, plus deploy/test link/handoff. User screenshot on v538 showed canopy from beneath. Keep v538 FIXED SIX smart streetlight shader budget; past 20-spotlight High caused camera-turn frame drops.**

## v539 changes
- A temporary separate `canopy-inspection-probe` branch was created (not merged to main) to inspect binary GLB assets in GitHub Actions with a Python GLB scene/bounds inspector. Inspected uploaded light GLB: two side-by-side luminous strips per model and native bounds around X[-0.79,0.78], Z[-1.51,1.51]; original long axis +Z. Inspected city's *actual* `Gas_Station_01` GLB geometry: canopy roof spans LOCAL X[-29.98,-21.17], Z[-11.22,-3.96], top Y=-14.64, underside Y=-15.25. Original map has `NEW_CITY_SCALE=1.55`; so real under-roof offset is **0.61×1.55 world units below roof top**. No guessing from screenshot.
- `src/game.js` introduces `installGasStationCanopyFixtures(map)`: on async map GLB load locate real `Gas_Station_01` via `map.getObjectByName`; world AABB gives 3 evenly centered X positions (at 1/6, 3/6, 5/6 of canopy width), front-back Z center; load uploaded `assets/simple_fluorescent_tube_light.glb?v=539`, clone it exactly 3 times, face long axis along world Z, keep correct source aspect ratio/size in each lane, place model upper surface 0.04m below actual underside; casts no shadows, no collisions/nav changes. Original GLB geometries/materials are preserved for body/glass, with real GLB bulb meshes switched to glowing unlit white-yellow shader and glass given gentle emissive detail (materials cloned per instance). Exposes `html.dataset.gasCanopyFixtures=3`, rows, ceiling, model-load-error attributes for debugging.
- All three fixtures visually glow, while one shared fixed, broad warm-white shadowless SpotLight centered below the roof illuminates the pump area across all three rows. This avoids adding 3 extra costly dynamic spotlights to v538 six fixed streetlamp spots. `syncGasCanopyLighting()`: Full High intensity355; Reduced Medium 210; Off/Low/Very Low 0 (glowing tube bulbs remain visible). Only changes visibility when player changes graphics settings, NEVER on camera turns, preserving v538 constant streetlight visibility performance logic.
- `index.html` game.js loader cache bump v539 (CSS v525/menu untouched). Both handoffs prepended. Protected `CURRENT_RECOVERY_CHECKPOINT.md` v324 unchanged. v532 shotgun, v531 grenade shatter, v533 explosion, all zombie/world physics, v534 graphics and v538 smart-light selection unchanged.
- Validation: JS syntax, exact three model clones, static map bounds/fixture placement math checks, gameplay source preservation and GitHub Pages deploy success required. No visual quality claim until user tests.
- Test: https://xboxlivehd88-hue.github.io/city-outbreak/?v=539-gas-canopy-fluorescents — head to gas station pictured (three-bay canopy), look UP from pump island. See three aligned glowing fluorescent GLB fixtures running front-to-back, one centered in each bay; check light spill on ground, no roof clipping, screenshot and FPS. Change lights Off vs Full to verify real pump area illumination scales but bulbs remain visually on.
- When starting another chat: fetch newest TOP entries of `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, source `index.html` and `src/game.js` directly from GitHub main. Never rely on old summaries.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v538 EARLIER SMART STREETLIGHT ACTIVATION — READ FIRST

**GitHub main is authoritative. User reported severe frame drops turning the camera after v535/v536. v537 fixed by keeping exactly 6 real live spotlights on High (2 Medium, 0 Low/VeryLow) and reassigning/fading without .visible toggles. User asks that lights "come on a little sooner". Keep v537 stable shader-light count and all previously approved gameplay.**

## v538 targeted lighting timing (no other gameplay/render changes)
- Preserves `src/game.js` v537 fixed real-light pool of SIX on High, TWO Reduced, zero Off/Low/Very Low. These six remain `visible=true` at all times within High; 3D shader spotlight counts do NOT fluctuate with camera turns. Bulbs at every physical lamp still glow independently. No return to v535 all-20 live spotlights or v536 variable visibility per frame.
- `chooseStreetLampHeads()` now selects possible lamp heads to prelight up to **78 game units** away (was 62), with expanded **27-unit all-direction near activation** / **34-unit sticky keep radius** (was 19/25). Widened camera-space candidate angle beyond actual horizontal FOV by **29° entering** / **36° exit/keep** (previous 12°/20°), plus the existing spotlight spill estimate. Candidates thus start lighting substantially sooner on turn/approach and avoid obvious screen-edge popping.
- More predictive ranking: slight near/ahead priority and stronger incumbent retention, still capped at six. Selection every **150 ms instead of 250 ms**, inexpensive scan of existing head list only, no raycasts. Fade interpolation rate **15 instead of 11** for smoother yet quicker turnover; still dims to black BEFORE teleporting a pool light to its new head. No added particle physics, geometry, new lamp models or shadowmaps.
- Existing High lighting intensity, range, rare individual flicker, High materials/sky, v534 graphics menu and Low presets unchanged. v532 shotgun, v531 grenade breakup, v533 explosion and v525 opening menu unaffected.
- Files changed: only `src/game.js`, `index.html` JS loader bumped from v537 to v538, and both handoff documents prepended. Protected `CURRENT_RECOVERY_CHECKPOINT.md` v324 unchanged; CSS v525 and `src/grenade-shatter.js` unmodified.
- Verify JS syntax, mock candidate angle/distance selection and fixed spotlight visibility under fast turns, then commit main and wait for Pages deploy success. User needs visually test! Do not claim measured FPS gains.
- Cache-busted test link after deployment: https://xboxlivehd88-hue.github.io/city-outbreak/?v=538-early-smart-lights. On HIGH walk/turn toward rows of lamps; should already see warm ground illumination near the edge of view. Look rapidly around and compare FPS with v537; six real lights stay stable. If frame drops persist investigate render info/frame budget rather than adding spotlights.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v537 FIX CAMERA-TURN FRAME DROPS FROM SPOTLIGHT SHADERS — READ FIRST

**GitHub main authoritative. User reports "its frame dropping real bad when looking around" after v535 all-lights and v536 view-cone visibility. v536 spawned a real SpotLight for every actual streetlamp and repeatedly toggled .visible as camera turned; this changes active Three.js spotlight count and can recompile expensive lighting shaders, causing stalls. Preserve approved visual realism while fixing severe FPS.**

## v537 targeted fix
- Instead of spawning a REAL spotlight for all ~20 heads as in v535/v536, allocate a maximum of **SIX shadowless real SpotLights** for High/Full and **TWO** for Medium/Reduced; zero in Low and Very Low. Keep original independently flickering bulb point glows for EVERY lamp head regardless of real-light budget.
- Stable render shader count: on High keep all six spotlight objects `visible=true` even when out of view and set their *intensity* toward 0; do NOT toggle `visible` on camera turns, which changes Three.js's spotlight permutation/program. Only preset changes alter active count. Each slot has `currentHead`, `desiredHead`, `fade`; real lights are mapped to nearby/view-visible lampheads. On reassignment fade DOWN before moving any light then fade UP; never teleport a bright light from a rear pole to a forward pole.
- Pick candidates at most once per 250ms, with widened camera-angle view cone, 19-unit fully omnidirectional near bubble (25-unit sticky), and max 62-unit distant range; incumbent-selection bonus reduces thrash. This lights near and ahead of player while leaving distant rear illumination absent, exactly as user asked. No expensive occlusion raycasts. Medium still tracks only the two nearest lamps, Low/Very Low stay glow-only. Retain warm range/intensity and individual rare per-head flicker.
- Existing Settings label remains FULL — SMART VIEW LIGHTING, with helper text updated to explain the six-light High budget and stable GPU workload.\n- Only modify `src/game.js` streetlight logic; `index.html` cache bumps game.js to v537, approved `src/game.css?v=525` / artwork untouched. Both handoffs updated on TOP. Protected v324 `CURRENT_RECOVERY_CHECKPOINT.md` untouched, grenade-shatter/shotgun/zombie/collision/AI untouched.
- Run full JS syntax, mocked High 6 / Reduced 2 / Off 0 simulation with rapid camera turns and assert HIGH .visible count ALWAYS =6, no accidental visible toggling; then verify Pages success. No unverified FPS claims.
- User play URL: https://xboxlivehd88-hue.github.io/city-outbreak/?v=537-turn-fps-fix
- Test with High setting: walk down street, spin view rapidly, compare performance HUD FPS and stutter with v536; see that bulbs stay visually on and nearby street pavement remains illuminated. If still FPS-limited, can lower High light budget to 4 without touching physics.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v536 CAMERA-AWARE STREETLIGHT CULLING — READ FIRST

**GitHub main is authoritative. User approved v533 explosion, v532 shotgun elbow reload, v531 grenade breakup, v525 menu. v535 established a genuine real spotlight at ALL lamps on HIGH. User now requests performance win: lights in the PLAYER VIEW should remain active, while those BEHIND/outside the view should be hidden until the player looks toward or gets close. Preserve v534 Very Low/Low presets, v535 realistic road lighting, existing rare flicker, gameplay and protected v324 checkpoint.**

## v536 targeted streetlight optimization
- `src/game.js` v535 FULL/HIGH still creates a warm real shadowless SpotLight for EVERY actual streetlamp head and aims it at its own pavement. Rather than rendering them all per-frame, FULL now checks head positions against the player's XZ camera forward vector, dynamically computed horizontal camera FOV, and an expanded view cone that includes ~22 world units of offscreen light spill. No wall occlusion/raycasting, which would be costly/unreliable. Lights behind/far outside view are `visible=false` after a short fade and thus excluded from active Three.js GPU lighting; lights near the player are always eligible even behind them.
- Camera-based **culling every 160ms**, not per-frame. Close lamps enter at 25 world units and stay active until 33 units. Enter cone margin 17 degrees plus spill radius; exit margin 27 degrees to prevent flicker. Actual intensity fades in/out over ~0.3s (`1-exp(-dt*11)`) before a light is hidden, rather than visually popping. Light culled if beyond camera far distance + light radius. Preserve individual rare bulb/head flicker and spotlight intensity; fade only affects real spotlight contribution.
- Off still 0 real spotlights, cheapest decorative glow stays on. Reduced/Medium still only 2 nearest spotlights (unchanged). High/FULL allows all **visible and near** lamps at once, not an arbitrary cap of 4. The city map and zombies are NOT hidden or despawned; no collision/ragdoll/gun changes. `document.documentElement.dataset.streetLampVisibleRealLights` publishes actual active count for tests.
- Existing Settings menu remains a single five-tab modal. FULL option relabeled `FULL — SMART VIEW LIGHTING`; user help text explains active front/near lighting. No new controls. `index.html` JS cache bust to v536; `src/game.css?v=525` unchanged, menu approved.
- Both `CITY_OUTBREAK_HANDOFF.md` and `NEXT_CHAT_HANDOFF.md` prepended; protected `CURRENT_RECOVERY_CHECKPOINT.md` v324 unchanged. Low/Very Low presets and recovery untouched. No changes to original streetlamp geometry, shadows or lighting range.
- Validate JS and mock camera-facing tests: front far visible, back far hidden, close-back lit, slow turn hysteresis and fade, FULL->HALF->OFF->FULL transitions; deployment only after checks. User visual review required; do not claim FPS improvement measured.
- Test link after Pages success: https://xboxlivehd88-hue.github.io/city-outbreak/?v=536-view-smart-lights. On High, see real light at all lamps ahead; turn 180 degrees and behind far lamps should stop adding GPU lights (bulbs still glow), nearby lamps stay illuminated, no obvious hard pop. Look back and lighting fades in; compare FPS counter and inspect lamp count. Low/Very Low/Medium unchanged.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v535 HIGH ENABLES ALL REAL STREETLIGHTS — READ FIRST

**GitHub main is authoritative. User asked: "i think the lights should be all on for max settings". Latest v534 Low/Very Low presets preserve performance. v533 explosions, v532 shotgun elbow, v531 grenade shatter, and v525 widescreen title/settings are user approved.**

## v535 lighting-only adjustments
- ROOT CAUSE: old `STREET_LAMP_LIGHT_POOL_SIZE=4` allocated only FOUR THREE.SpotLights which moved to the 4 nearest lampheads even on HIGH/FULL. Remaining poles had decorative glowing bulb only, without illuminated pavement. v535 creates one real warm unshadowed spotlight per actual lamp head in `setupStreetLampLighting()` (all GLB replacements plus all manual placements; count dynamically determined). FULL pins every spotlight to its own lamp head aiming at pavement, and all remain simultaneously active. Existing unique rare unsynchronized lamp flicker, range and intensity are preserved.
- `updateStreetLampLighting()` modes: FULL=all live, pinned lights; HALF/REDUCED=at most TWO nearby real spotlights as before, other allocated spotlights invisible; OFF=zero real spotlights, cheap bulb glow retained. Switching between modes restores correct assignments immediately. In FULL there is no periodic nearest-lamp repinning. Rare approved flicker affects individual spotlight intensity but doesn't disable the rest. Extra lights on HIGH can cost GPU, so LOW/VERY LOW still use OFF, MEDIUM still uses REDUCED.
- Existing `GRAPHICS_PRESETS.high` already includes `lights:"full"`. Changed the independent Setting options under Graphics to OFF — GLOW ONLY / REDUCED — NEAREST 2 / FULL — ALL STREETLAMPS. No new Settings button/tabs.
- Only `src/game.js`, `index.html` (game loader v535) and BOTH handoff docs updated. No changes to CSS, approved menu artwork, grenades, shotgun, zombie mechanics, world geometry/collision, or v324 recovery checkpoint.
- Test: High should light the road/sidewalk underneath every lamp simultaneously. Medium only two nearest pools, Low and Very Low still no real lamp spotlights. Compare visible street illumination and FPS. Static code checks and simulation should be run; live visual result needs user's confirmation.
- Link after Pages successful deploy: https://xboxlivehd88-hue.github.io/city-outbreak/?v=535-all-lights-high

---

# NEW-CHAT HANDOFF — 2026-10-09 — v534 ACTUAL LOW-END GRAPHICS + VERY LOW PRESET — READ FIRST

**GitHub main is source of truth. User said previously LOW still looked and ran too high-quality even with all effects disabled. User-approved visuals/gameplay through v533 must be protected: v525 widescreen Settings/start, v531 actual grenade casing breakup, v532 shotgun elbow reload, v533 dramatic explosion.**

## v534 visual-only performance change
- Existing LOW v533 was 60% pixel ratio, original detailed city meshes/material shader textures and original fully procedural cloud shader, with original 220-unit camera draw distance. Simply turning rain/lights/shadows off could not lower enough for weak laptops. v534 addresses all of those GPU costs directly.
- Presets now: HIGH remains 1.10 pixel ratio, original 220 view distance, full normal/roughness/metalness/AO/emissive maps and procedural sky, original shadow/rain/lighting/particle settings (no visual change). MEDIUM 0.85 ratio / 165 visual distance, medium anisotropic textures, existing effects. LOW **0.45 pixel ratio / 115-unit view distance** (vs old 0.60/220), only basic city color textures (no costly normal/roughness/metalness/AO/emissive detail maps), nearest-mipmap filters/aniso=1, simpler moon/night sky without fractal animated clouds, no shadows/rain/real streetlamp light pool, 25% particles, 2 settled corpses. New VERY LOW **0.35 ratio / 75 draw distance**, plain city material colors (no base color maps), same simplified sky, no rain/lights/shadows, 10% particles, 0 settled corpses.
- Both LOW and VERY LOW update `camera.far`, sky sphere scale (keeps sky inside far-plane), fog density to soften far clipping, and pixel ratio. Sky uses `uSimplified` ShaderMaterial uniform to bypass expensive FBM clouds. HIGH uses the original shader path with `uSimplified=0`. No changes to any collisions, nav, zombie AI/limits, hit detection, or ragdolls.
- `applyCityTextureQuality()` caches original maps / filtering per material/texture via WeakMap, only touches city GLB render materials. On quality switch strips expensive maps then **restores exact originals on HIGH**, without changing city meshes, guns or zombie models. Hooks into map GLB load after wet-road materials are applied, so saved LOW/VERY LOW config works regardless of asynchronous load order.
- Settings screen remains ONE Settings modal with the same five tabs and both preset selectors (start/pause). Added VERY LOW option, expanded render resolution list 35/45/60/75/85/110%, and separately adjustable VIEW DISTANCE, WORLD TEXTURE DETAIL, SKY/CLOUD DETAIL. Low preset now displays distinct visibly lower quality. Custom selections saved to existing localStorage keys. Updated particle options include 10%, corpses include 2.
- `index.html` bumped only game.js cache to `?v=534`; existing CSS `v=525` and approved artwork unchanged. Both handoffs updated at TOP. Protected `CURRENT_RECOVERY_CHECKPOINT.md` v324 unmodified. Grenade-shatter module untouched.
- Static full game.js JS syntax tested, preset normalize/migration tested and city material low -> veryLow -> medium -> high reversibility tested. **No live GPU/FPS performance figures claimed**. Test Pages link after successful deploy: https://xboxlivehd88-hue.github.io/city-outbreak/?v=534-real-low-graphics
- Test opening SETTINGS quality Low then Very Low: difference should be clearly noticeable (pixelation, reduced city texture and draw distance), FPS HUD should report lower Pixel Ratio. Switch to HIGH and confirm fully restored textured city, 220 distance, original moon/clouds. Also test shotgun shell reload, grenade G, performance on weak computer. If GPU remains slow, inspect draw calls and CPU profilers before changing gameplay.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v533 MORE DRAMATIC HIGH-QUALITY EXPLOSIONS — READ FIRST

**GitHub main is source of truth. User approved the v532 shotgun elbow fix ("thats great"), and now wants explosions "a little more dramatic". Keep the approved shotgun reload, v531 REAL grenade-casing breakup, v530 explosion architecture, v525 title and settings, and protected v324 recovery unchanged.**

## v533 visual-only adjustments
- Targeted only the existing `spawnExplosionBurst()` + flash updater in `src/game.js`. Current approved v531 shattering occurs first, then center core flash, then the larger explosion after ~55ms. Those calls/timings are UNCHANGED.
- New High-extra intensity coefficient `spectacle=clamp((graphicsOptions.particles/100-.5)/.5,0,1)`; remains ZERO through 50% particles (Low and Medium), smoothly rises for Custom, equals 1 at High. No new settings or gameplay knobs.
- High grenade: ~149 irregular fire/smoke puff sprites vs 110 on v532; 256 visible instanced sparks/debris vs 200; launcher ~115 puffs vs 85 and 205 sparks vs 160. +7 fiery tongues burst outward/upward at High (zero in Low/Medium), added as ordinary existing fire sprites; initial brightness and higher spark trajectory speed make blast punchier. Smoke moves slightly faster/higher and persists ~0.31s longer at High, with total effect lifetime 2.18s High vs 1.75s Low/Medium. Existing center flash and 3-layer fireball retained.
- High transient point light intensity increased from 3.2 to 5.2, radius from 8.0 to 10.3 world units, NO shadows, decays over 0.23 seconds; respects `graphicsOptions.lights==="off"`. Light only created if effective quality >=85%.
- Crucial: no ground-growing GLB, ground decals, craters, expanding ground, or mesh scale animation. Airborne smoke/fire/sparks only. Reuses shared textures and single instanced spark draw call per blast, max concurrent visual explosions unchanged. Low/Medium remain near v532 load; Custom scales.
- Both grenade and launcher still use `spawnExplosionBurst`; original damage/radius/knockback/sounds/fuse/ragdoll unchanged. Grenade-shatter helper file unchanged. `src/game.js` and `index.html` JS cache bump to 533 plus two handoff updates ONLY. `src/game.css?v=525` and protected `CURRENT_RECOVERY_CHECKPOINT.md` unchanged.
- Static JS parse and lightweight effect-loop test must pass; *live visual outcome requires user's review*, do not claim it is user-approved until tested.
- Play link after Pages successful deploy: https://xboxlivehd88-hue.github.io/city-outbreak/?v=533-dramatic-explosion. Test grenade G and unlocked launcher (7) at HIGH vs LOW. Confirm shell bursts from grenade, no floor patch, bright flash and smoke/sparks, and smooth performance.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v532 SHOTGUN RELOAD ELBOW NATURAL BEND — READ FIRST

**GitHub main authoritative. User uploaded ~50sec 2560x1440 gameplay video showing shotgun reload left/support-arm elbow visibly stiff while the hand moves. User explicitly requested direct fix. Prior assistant incorrectly claimed GitHub tools unavailable; GitHub tools HAVE BEEN USED to commit and deploy past builds. Keep executing directly in repo. v531 user-approved grenade shatter, v530 approved explosion; v525 approved widescreen menu.**

## v532 focused change
- Inspected current `src/game.js` `updateShotgunReloadFX()` and video. Found ROOT CAUSE: arm blend was `smoothstep(shotgunReloadCant,0,.85)`, which returns 0 after empty-gun chamber shell as shotgun levels. Thus for EVERY BOTTOM-fed shell, hand animated but the shoulder/elbow stayed on their rigid, fixed rest positions.
- Replaced ONLY the camera-space shoulder/elbow *pose solver* block in `updateShotgunReloadFX()`. The existing approved hand movement stages, shell actor path, side-first-on-empty/bottom-afterward logic, `shotgunReloadCant` motion, firing, ADS and reload timings were untouched.
- New smooth `stroke=smoothReload01(p/.21)*smoothReload01((1-p)/.12)` drives articulation through each shell cycle, including BOTTOM-feed with zero gun cant. Blend is `max(receiverTurn,stroke)`; preserves side-chamber cant transitions, eases elbow in/out with home-hand pose between shells. Subtle shoulder follow (-0.025x,+0.020y,-0.025z); the elbow is computed from camera-space shoulder-to-wrist reach at 48% plus a projected OUTWARD bend perpendicular to that reach, variable with hand reach and active insertion beat. Helps avoid straight-stiff upper arm and keeps elbow following wrist through loading.
- Only `src/game.js`, `index.html` (JS cache v532), and BOTH TOP handoff docs changed. `src/game.css?v=525` unchanged, protected v324 `CURRENT_RECOVERY_CHECKPOINT.md` unchanged, grenade-shatter module unchanged. Other weapons M4/MP5/M17 and zombie physics unaffected.
- JS syntax and targeted simulations: test bottom shell p=0..1 with shotgun cant=0 shows nonzero articulation through loading and 0 at both endpoints; chamber shell still follows gun roll. Actual live visual positioning needs user approval, never claim perfect sight-line prematurely.
- Playable after Pages success: https://xboxlivehd88-hue.github.io/city-outbreak/?v=532-shotgun-elbow. Test empty shotgun side load then bottom shells; watch elbow visibly flex and shoulder stay near player body. Test partially full gun bottom-only reload too. Verify shell inserts remain on correct ports and timing unchanged.
- If elbow still appears stiff or swings too wide, adjust ONLY the camera-space elbow bend in `updateShotgunReloadFX()` after user video test, never revert approved hand trajectory.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v531 REAL GRENADE CASING SHATTERS FROM INSIDE — READ FIRST

**GitHub main is source of truth. User approved v530 large explosion spark/fire/smoke effect, but grenade appeared to disappear rather than burst: wants the explosion visibly BEGIN INSIDE spinning grenade and rip the grenade apart, not a swapped particle pop. Keep v525 widescreen title, five-tab Settings, and protected v324.**

## v531 updates
- New `src/grenade-shatter.js`: extracts triangles from the ACTUAL `assets/spintop.glb` grenade meshes (body + stick) at exact world-space angle on the detonation frame, groups faces into 4/6/8 directional chunks depending on graphics particle setting, keeps original textured mesh materials, and physically sends shell pieces flying and tumbling with gravity, brief soft bounce and ~0.54–0.84sec lifetime. This visually breaks the grenade apart; no generic replacement grenade. Also shatters launcher projectile sphere + band, using same helper. Short-lived fragment geometry is disposed after use and during reset; cap 36 fragments across blasts.
- Both `explodeGrenade` and `explodeLauncherRound` calculate the projectile's real center via `Box3.setFromObject`, shatter visible source mesh BEFORE scene removal, then spawn the existing v530 explosion from that exact visual center. The existing gameplay detonation position `p=g.q.position.clone()` and original damage calculations remain absolutely unchanged.
- New tight white-yellow ignition flash starts at *center* t=0, while full existing v530 fireball/smoke layers wait only .055s. Gives a visible shell rupture before main blast, without growing anything or building any ground. The existing spark instancing and quality scaling remain.
- `src/game.js` imports and updates the new helper per frame, clearing it on reset. No changes to sounds, fuse, collisions, zombie knockdown, ragdolls, waves, weapon mechanics or settings; graphics CSS unchanged v525. `index.html` loader bumps to `src/game.js?v=531`. Old rejected `floor_smashedexploded.glb` remains unused.
- Both handoffs updated at TOP. Protected `CURRENT_RECOVERY_CHECKPOINT.md` v324 untouched. Syntactic/static validation done; user still must visually approve timing/size in live game.
- Play URL after Pages deployment: https://xboxlivehd88-hue.github.io/city-outbreak/?v=531-shattering-grenade. User test with G: watch existing spinning grenade burst into textured chunks while inner flash happens, followed immediately by dense v530 explosion. Launcher after unlocking with 7 should burst casing too. Check High and Low and FPS.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v530 HIGH-FIDELITY DENSE EXPLOSIONS (HIGH GRAPHICS) — READ FIRST

**GitHub `main` is authoritative. User approved v528 direct explosions with NO ground buildup and v529 airborne sparks, now requests a bigger, more nearly realistic explosion specifically on HIGH. Preserve v525 full-width start menu, single Settings icon, all five Settings tabs, and protected v324 recovery.**

## v530 visual-only changes
- `src/game.js` upgrades `spawnExplosionBurst()`: immediate multi-layer white-hot/amber/orange fireball; many distinct irregular textured smoke/fire puffs moving upward and outward, now 60% smoke, color graded charcoal to warm light gray; brighter 3D hot sparks/debris of several colors using ONE shared instanced mesh per explosion; short local orange PointLight on HIGH only when independent light setting is not off, no shadows. No growth of whole blast, ground patch, crater, floor model, ring or ground animation. Sprite size is fixed from first frame; cloud motion and fade is in the air.
- High particle count hand grenade: ~110 independently rendered airborne smoke/fire puffs, plus ~200 sparks/rock fragments (compared with v529 30 puffs + 60 sparks). Launcher: ~85 puffs + ~160 sparks (vs 22 + 46). Both also receive immediate layered fireball. Most particles are in the air for 0.3-1.7 sec; entire visual cleared by 1.75s.
- Quality scaling uses the existing `graphicsOptions.particles/100` and `Math.pow(quality,1.65)` for puffs, `Math.pow(quality,1.8)` for sparks, yielding approximately 11 puffs + 16 sparks on Low for grenade, 35 puffs + 57 sparks on Medium, 110 + 200 on High; Custom smoothly varies densities. Shared texture generation ONCE at runtime and spark instancing keep per-blast allocations manageable; max simultaneous explosion effect count Low=2, Medium=3, High/Custom=4. Short PointLight only at effective particle quality ≥85% and when lights enabled.
- Uploaded `assets/floor_smashedexploded.glb` remains intact but intentionally unused because it produced a ground-building animation user expressly rejected.
- CRITICAL: Both `explodeGrenade()` and `explodeLauncherRound()` damage radii/formulas, weapon mechanics, zombie knockdowns/ragdoll and audio are unchanged. Explosion rendering only. `index.html` cache-busts game.js to v530, `src/game.css?v=525` unchanged. Both handoffs prepended. Protected `CURRENT_RECOVERY_CHECKPOINT.md` v324 unchanged.
- JS syntax/static checks only; NOT a live visual approval. Test URL after successful Pages deploy: https://xboxlivehd88-hue.github.io/city-outbreak/?v=530-hifi-blasts. Verify G throws grenade, unlocked launcher shot (7), smoke/sparks visible and no ground; High density vs Low and actual FPS.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v529 VISIBLE EXPLOSION PARTICLES, NO GROUND — READ FIRST

**Current source of truth: GitHub `main`. User confirmed v528 properly REMOVED the unwanted ground buildup: "so thats gperfect but now there is no particals". Main task: RESTORE VISIBLE airborne explosion sparks/embers while keeping the blast direct and no ground patch. v525 widescreen start menu and Settings user-approved.**

## v529 implementation
- Preserve v528 immediate fire/smoke sprites and NO loaded explosion GLB. The supplied `assets/floor_smashedexploded.glb` remains in assets, unused, since its ground-building sequence was rejected.
- Added 3D visible sparks/hot fragments, launching immediately with the fireball. Each blast creates **ONE InstancedMesh draw call** using shared low-poly Tetrahedron geometry and a bright unlit/toneMapping-off material; each spark has its own colorful per-instance color, position, velocity, gravity and lifetime (0.38–0.81s). These are distinct floating orange/yellow/white sparks visible in the world, not part of the ground. Spawn includes center sparkle and airborne outward trajectories.
- At LOW graphic quality ensure at least 14 visible sparks; higher quality scales count using existing cosmetic particle setting (grenade 60 @100%, grenade-launcher 46 @100%). Sparks appear immediately with fixed initial sizes then shrink away individually, **never grow**. Their 3D meshes share geometry/material, avoiding per-particle drawcalls, and are updated while the game is running (pause freezes them). Existing smoke/fire sprites remain and fade normally; all effect instances are removed automatically within 1 second and reset cleanup remains.
- Both `explodeGrenade` and `explodeLauncherRound` still call `spawnExplosionBurst` from v528. All blast damage, radius, audio, recoil, ammo, zombie impulses, ragdoll, collisions, and weapon logic remain untouched.
- `index.html` bumps ONLY `./src/game.js?v=529`, stylesheet stays v525. CSS/title/settings unchanged, protected v324 recovery `CURRENT_RECOVERY_CHECKPOINT.md` untouched. BOTH handoffs updated at TOP. No third-party dependencies.
- Smoke/fire effects and sparks are purely visual; no floor/crater graphics of any kind. Static JS syntax and verification done; do not claim user's live visuals approved until user confirms.
- Test: https://xboxlivehd88-hue.github.io/city-outbreak/?v=529-visible-sparks. Throw G grenade and fire unlocked grenade launcher (7) to see bright orange/yellow sparks spraying up/out immediately with explosion and smoke, not a ground patch. Verify Low graphics also still has some sparks and game remains smooth.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v528 GUARANTEED EXPLOSION-ONLY, NO FLOOR / CRATER GLB — READ FIRST

**Live GitHub main authoritative. User rejected v526 AND v527: "still has that gound built then explodes why did you even have it do that?" Their intended visual is ONLY an immediate explosion, NO built-up ground patch and NO artificial growth. v525 title / settings menu remains approved; preserve.**

## v528 implementation
- v526/v527 mistake: the uploaded `assets/floor_smashedexploded.glb` is a mixed staged ground/explosion scene, and v527 heuristic filtering could not reliably isolate the ground component. The model bytes remain safely IN GITHUB but are **no longer loaded or rendered as grenade explosion VFX**. This is a deliberate fallback to guarantee the unwanted ground stage cannot return. Don't claim it is now using the user's GLB animation.
- Replaced the GLB VFX section in `src/game.js` with a short, immediate THREE.Sprite fireball/embers/smoke effect (~1 second); sprites use once-generated shared 96px radial CanvasTextures, fixed scale from the first frame, and only move upwards/outwards + fade. **No ground mesh, decal, crater, terrain animation, scale-up, or delayed buildup.**
- Both `explodeGrenade()` and `explodeLauncherRound()` now call `spawnExplosionBurst(p, false/true)` directly. Their damage, blast radii, knockdown/ragdoll calls, projectile trajectories, sound and fuse logic were not modified. Low/Medium/High settings change cosmetic sprite count and simultaneous effect cap only.
- Existing `updateExplosionGlbs(dt)` / `clearExplosionGlbs()` function names retained for minimal integration diff but now only update/remove short-lived sprite effects, clearing on reset, and pause naturally freezes effects. No external GLB loading overhead anymore. `index.html` game.js loader bumped to `v=528`; CSS remains v525 and opening artwork unchanged.
- **Important limitation:** This is a guaranteed ground-free procedural explosion, NOT a reconstruction of the exact GLB's explosion component. To use the exact uploaded explosion without ground, user will ultimately need the animation separated in the source GLB or reliable mesh/clip inspection; current 9.7 MB binary inaccessible to GitHub text connector.
- Validation: compare preserved damage formulas in BOTH explosion routines; code syntax passed; confirm no live GLB usage; verify handoffs, unchanged CSS, protected v324 checkpoint. User should test immediately at https://xboxlivehd88-hue.github.io/city-outbreak/?v=528-direct-explosion
- Test: G hand grenade and grenade-launcher impact (weapon 7 once purchased). New fireball should appear on detonation *immediately*, disappear in ~1s, and never create flat ground. Confirm original weapon gameplay and zombies still react. Do not claim visual approval until user confirms.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v527 EXPLOSION ONLY, NO EXPANDING GROUND PATCH — READ FIRST

**GitHub `main` authoritative. User disliked v526 grenade effects because they grow into a huge patch of ground before exploding. Their explicit instruction: "i dont need the growth i just want the explosion". Preserve user-approved v525 start-screen artwork and all five Settings tabs.**

## v527 changes
- In `src/game.js`, removed v526's 0.30→1.00 explosion-GLB scaling during the first 0.16s. New visual effect appears at FINAL size immediately; no custom growth, pop or expanding crater timing.
- Both hand grenade and grenade launcher still use the same uploaded `assets/floor_smashedexploded.glb`, now loaded as `?v=527`. At one-time model load, the scene is scanned for **separate low, broad, very flat ground/floor/crater meshes**, by conservative geometry and names. They are hidden, leaving the remaining visible explosion geometry and its original GLB animation. Bounds/scale are recomputed from retained visible geometry so the ground does not make the blast tiny or enormous.
- If the GLB is a **single, inseparable ground-only mesh**, the code intentionally uses the original cheap explosion particles rather than display the user's disliked ground patch. There is NO guarantee model components can be separated without inspecting binary internals. New visual sizes target 4.2 units launcher / 4.8 units grenade, reduced from v526 6.5 / 7.7. Effect instances still share GLB geometry and are capped according to graphics quality.
- Original explosion SOUND, gameplay DAMAGE, radii, zombie impulses, and ragdoll routines are **unchanged**; `explodeLauncherRound()` and `explodeGrenade()` call the same `spawnExplosionGlb()` introduced in v526. Reset/pause cleanup remains. `index.html` loader only bumped JS to `src/game.js?v=527`; existing CSS, image and controls untouched. Protected v324 checkpoint never edited.
- JavaScript syntax / code inspection passed, but the 9.7MB binary GLB was inaccessible to direct inspection through the GitHub text connector. This is a targeted best-effort visual correction; user live visual confirmation required. Do not claim perfect look before test.
- Test link after successful Pages deploy: https://xboxlivehd88-hue.github.io/city-outbreak/?v=527-explosion-only
- Ask user to throw a grenade (G), fire the grenade launcher (7, once unlocked), look for direct blast without expanding floor slab, and verify zombie knockdowns. If the GLB's embedded animation still grows ground, investigate separating/replacing the specific track; do not change gameplay or approved menu.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v526 NEW GLB EXPLOSIONS FOR BOTH GRENADES — READ FIRST

**Live GitHub `main` authoritative. User approved v525 including widescreen title + START/SETTINGS alignment. Do not change that UI. User uploaded `assets/floor_smashedexploded.glb` for BOTH hand grenade and grenade-launcher explosion visuals.**

## v526 changes
- New uploaded GLB `assets/floor_smashedexploded.glb` (9,711,816 bytes; GitHub blob `a5d8a294950997d864a4b5a1fa1741abbbf9e939`) verified on main. Source GLB bytes were too large for GitHub text connector to inspect scene contents, so **its appearance and whether animation clips exist are UNVERIFIED**. Model will be loaded once by `GLTFLoader` at startup. If it loads, template is bottom-centered and sized from its 3D bounding box; if animations exist, they run once.
- In `src/game.js` both `explodeGrenade()` and `explodeLauncherRound()` now call `spawnExplosionGlb()` for their VISUAL explosion only; launcher diameter 6.5 world units, hand grenade 7.7. GLB visuals last ~1.35s for static model or clip duration up to 5 seconds, then detach. Only 2 GLB explosions coexist on LOW, 3 on MEDIUM and 4 on HIGH/CUSTOM. Existing original cheap particle burst remains fallback while asset loads/fails.
- NO changes to each weapon's original explosive SOUND, damage, radius, physical projectile behavior, zombie damage, knockdown, ragdolls, collision, or wave logic. They still execute after the model spawns.
- `updateExplosionGlbs(dt)` advances one-shot clips + visual scale pop inside existing update loop, naturally freezes when paused. `reset()` clears transient explosion models. Geometry, animations and textures are shared between instances; no reloading huge GLB per explosion.
- `index.html` updates ONLY game JS cache bust `src/game.js?v=526`; existing approved CSS `v=525` and start/menu art unchanged. Update top of BOTH handoff documents. Protected `CURRENT_RECOVERY_CHECKPOINT.md` v324 never edited.
- Static checks confirmed both explosion branches use the GLB with fallback, old damage loops untouched, reset cleanup and loader references present. **No user live visual/gameplay test yet**; actual GLB orientation, exact size, and animation style may require tuning. Do NOT claim visual perfection.
- Playable: https://xboxlivehd88-hue.github.io/city-outbreak/?v=526-glb-blasts
- Test: throw grenade with G, compare the new explosion model; unlock/buy grenade launcher, shoot a wall/ground/zombie and check it uses same model; confirm damage/ragdoll, normal grenade spin, and graphics Low preset. If model seems motionless, giant, buried or absent, inspect GLB at runtime and adjust only VFX. Leave approved v525 start menu alone.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v525 WIDESCREEN START ART AND VERIFIED CLICK TARGETS — READ FIRST

**Current source of truth: GitHub `main`. User rejected v523 zoomed art and v524 narrow pillarboxed art. User approved generating wider artwork, personally uploaded `assets/city-outbreak-start-v525.jpg`, and asked for the new playable link and correct START button location.**

## v525 details
- Verified uploaded `assets/city-outbreak-start-v525.jpg` exists on main with blob `4e9c1c1c99e2580539bdf43baea5a2f1d7683646`. Inspected actual pixels: 1808×870 (aspect ratio ~2.078:1). The image has one baked SETTINGS icon, one large START OUTBREAK plate, and no CONTROLS icon.
- Updated only `src/game.css` and stylesheet loader in `index.html` plus BOTH handoffs. Opening `#startScreen` now uses `background: #080909 url("../assets/city-outbreak-start-v525.jpg") center center/cover no-repeat`. Removed v524's shaded side gutters and blurred duplicate artwork, which user disliked.
- The invisible `#startPanel` tracks COVER image bounds (width `max(100%,207.8161vh)`; height `max(100%,48.1195vw)`), staying centered at 50%/50%, so clickable areas track the actual image under crop/resize.
- Aligned `#start` overlay to left 40.8%, top 49.9%, width 18.8%, height 9% of the image bounds; `#showSettings` overlay right 2.35%, top 3.75%, width 4.65%, height 10.3%. Both remain INVISIBLE: NO duplicated DOM art.
- Responsive support: for screens narrower than 2:1, present image stretched to screen width and height (to keep SETTINGS from cropping off on 16:9) and make panel 100% screen; at 3:2 or narrower, use `contain` with image-aligned panel to avoid extreme distortion on portrait.
- `index.html` changes stylesheet loader only to `./src/game.css?v=525`; existing `./src/game.js?v=523` is unchanged. `src/game.js` remains blob `f236384f427aa513caf2e67621f7f1edf285815c`. Settings menu contains Controls, Display, Graphics, Effects, Performance; all presets/settings unchanged.
- Browser layout mock tests used uploaded JPEG, headless Chromium and Playwright at 1648×790, 1920×1080, 1280×720, 1024×768 and 390×844. Both visible hitboxes were clicked in each mock at their centres and handler fired; 1648×790 borders visually line up with baked START/SETTINGS plate. These are LOCAL MOCKS, not proof actual live game gameplay works.
- Preserved approved shotgun, M4, animation, ragdoll, zombie, lighting, map, waves and performance logic. Protected v324 `CURRENT_RECOVERY_CHECKPOINT.md` unchanged.

## Post-deployment test
- URL: https://xboxlivehd88-hue.github.io/city-outbreak/?v=525-wide-title-alignment
- Have user inspect full-bleed title, confirm no narrow side gutters or excess cropping, click START OUTBREAK and SETTINGS, verify all five tabs. If any alignment mismatch occurs on user's browser, adjust CSS-only hitbox; no gameplay changes.
- Never claim user visually approved v525 before screenshot/confirmation. Keep latest handoffs at TOP; direct commit to main, verify deployment, and share fresh link.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v524 START-SCREEN ZOOM / RESPONSIVE IMAGE FIT — READ FIRST

**GitHub `main` authoritative. The user tested v523 on a 1648×790-ish browser viewport and said the entire game title artwork is TOO ZOOMED IN. User explicitly asked assistant to fix this directly, without asking for instructions.**

## v524 precise changes
- **No new image asset needed**: reuse approved `assets/city-outbreak-start-v523.jpg` (1672×941; single baked SETTINGS icon; no CONTROLS icon). Prior v523 `#startScreen` used `center top/cover`, which cropped the bottom of this 16:9 art in a much wider browser content rectangle.
- **CSS-only visual/layout fix**: opening `#startScreen` now renders the entire JPG centered using `contain`, with a subdued blurred use of the SAME asset behind it to fill wider/taller gutters. This does NOT hide/mask any button. The foreground artwork remains uncropped and aspect-ratio-correct.
- Existing `#startPanel` hit-target wrapper now matches the **contained image** bounds using width `min(100%,177.6833vh)`, height `min(100%,56.2799vw)`, centered at 50%/50%. This makes baked-image button hit areas responsive even when letterboxed.
- `#start` invisible target adjusted to left 37.1%, top 50.6%, width 24.6%, height 10%, matching new JPG's actual START OUTBREAK plate. `#showSettings` adjusted to right 2.1%, top 3.0%, width 5.7%, height 11.3%, matching original SETTINGS plate. No additional visible button.
- `index.html` bumps ONLY stylesheet cache to `./src/game.css?v=524`; unchanged JS loader `./src/game.js?v=523`. **No game.js changes**: approved shotgun reload, weapons, NPCs, ragdolls, collision, map, rain, waves and graphics settings preserved. Existing five GAME SETTINGS tabs (Controls, Display, Graphics, Effects, Performance) and quality presets remain as before. Protected v324 recovery file unchanged.
- CSS new layout was checked against v523 JPEG at a 1648×789 viewport with a generated composition preview: artwork is fully visible, START hitbox sits over START sign, SETTINGS hitbox sits over gear plate, gutters show softly darkened image continuation. This is layout calculation and preview, NOT visual approval or a live gameplay test.

## User test / next step
- After Pages deploy: https://xboxlivehd88-hue.github.io/city-outbreak/?v=524-full-artwork
- Confirm entire start art now visible (particularly bottom zombie/street/weapon), not cropped/zoomed; single SETTINGS graphic remains; clicking SETTINGS opens five-tab menu, clicking START begins game. Pause/quality presets also still work.
- If user wants further framing changes, adjust only front-end layout; never touch approved gameplay or protected `CURRENT_RECOVERY_CHECKPOINT.md` v324. Keep updating both handoffs at TOP and link the new deployed Pages build.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v523 CLEAN APPROVED START ART / ONE SETTINGS BUTTON — READ FIRST

**GitHub `main` remains the only source of truth. The user approved the redesigned start-screen artwork and uploaded the JPEG themselves.**

## Latest v523 change (opening screen only)
- Verified uploaded `assets/city-outbreak-start-v523.jpg` exists on `main` (blob `a2fc6994b8fc44e2791b2ebba4f753db96888cf8`) and visually inspected it: new CITY OUTBREAK splash art shows a single SETTINGS gear icon at upper-right and NO old CONTROLS icon. Keep original `assets/city-outbreak-start-v153.jpg.jpg` as an untouched backup.
- `src/game.css`: `#startScreen` now uses the actual uploaded v523 JPG. Completely removed v522's visually unacceptable `#startScreen::before` shifted-image mask. Moved existing invisible `#showSettings` hit target to right 2.3%, top 3.3%, width 6.2%, height 11.2% to follow the new baked SETTINGS icon at the upper right; no additional visible button was added.
- `index.html`: loader query changed to `./src/game.css?v=523` and `./src/game.js?v=523` for cache refresh. Existing `#showSettings` HTML and its five-tab GAME SETTINGS modal unchanged.
- `src/game.js` gameplay SOURCE UNCHANGED (blob `f236384f427aa513caf2e67621f7f1edf285815c`), including the original settings click handler; old CONTROLS hotspot remains absent. All five Settings tabs (Controls, Display, Graphics, Effects, Performance) and Low/Medium/High/Custom presets remain as in v522.
- No edits to the user's approved shotgun animation/reload, M4, zombies, ragdoll, collision, rain, wave code, or protected `CURRENT_RECOVERY_CHECKPOINT.md` v324.

## v523 test, caution, continuation
- Code-level checks: new image path is present, old v153 artwork is not referenced by active opening CSS, v522 pseudo-element mask is fully removed, one existing SETTINGS hotspot remains, five modal tabs and loaders are intact.
- Uploaded artwork itself was viewed from GitHub; LIVE browser click alignment and actual rendered appearance still require user testing. DO NOT claim end-to-end visual/gameplay approval before user confirms. In particular confirm the SETTINGS hotspot matches the upper-right gear icon on the user's screen.
- Playable after GitHub Pages finishes: https://xboxlivehd88-hue.github.io/city-outbreak/?v=523-clean-start-art
- Ask user to verify: top-right shows one clean SETTINGS icon; icon opens GAME SETTINGS with all five tabs; old Controls area does nothing; Start Outbreak still works; pause menu settings and LOW preset work. If hotspot is off on other aspect ratios, adjust only the `#showSettings` CSS target.
- Never overwrite protected recovery v324 without explicit user approval. Always commit directly to `main`, verify deployment, and update both handoff documents at the top.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v522 REMOVE OLD CONTROLS ICON; ORIGINAL SETTINGS OPENS EVERYTHING — READ FIRST

**GitHub `main` is authoritative. Read these newest top sections before changing the game.**

## User's current request / screenshot
- User supplied screenshot `image(20261009-170700).png`: opening screen still visually shows two baked top-right image buttons, SETTINGS (left) and CONTROLS (right). Exact instruction: **"are yu able to remove the controls button and just move everything to the settings button?"**
- Previous v520/v521 implementation already merged Controls, Display, Graphics, Effects and Performance into one menu, but v521's transparent click hotspot `#showControls` at right 1.0%, width 6.4% was actually over the BAKED CONTROLS artwork button, not the existing SETTINGS graphic. User wanted one Settings button.
- **v522** makes only the left original SETTINGS graphic interactive, disables the separate Controls icon/click target, and visually covers the old Controls drawing using a softened patch of the same JPG. This is an approximation because the Controls graphic is baked into `assets/city-outbreak-start-v153.jpg.jpg` and original binary was not modified.
- User-facing v522 has not yet been visually approved and should be tested in browser.

## Commits and current state
- `index.html` v522 commit `6192f32b530b1fc233abc236417196d4cdd1c0d9` (blob `627620a03b1f6ceb4248919674a656fa375a9a63`): renamed `#showControls` to `#showSettings` and cache-busted JS+CSS loaders to `v=522`. Existing Settings controls pane and 4 other tabs remain.
- `src/game.js` v522 commit `bd1a10a155e263eaaddd3f4b73a9627c8af30f7f` (blob `f236384f427aa513caf2e67621f7f1edf285815c`): changed only the existing opening menu click event selector to `#showSettings`; continues to invoke `openGraphicsModal("controls")`. Actual graphics/weapon/ragdoll/collision code is from v520 and unchanged.
- `src/game.css` v522 commits `a3bf7e57a183c6756989ee38ebfb155ee0fed67a`, follow-up `258b4843457bdb99b7ea4848a782d2c78b373ebe` (blob `18ba72c3bb392532b9504587a876270d748eebde`): `#showSettings` invisible hotspot correctly aligned on left icon `right:6.3%;top:1%;width:5.7%;height:11.2%`, with keyboard focus outline. Adds `#startScreen::before` overlay showing a SHIFTED sample of the existing artwork, softly masked using radial-gradient at right icon (~97.1% width, 6.5% height). The overlay covers old baked CONTROLS picture without adding second button. Original JPG file unchanged.
- Preserve protected `CURRENT_RECOVERY_CHECKPOINT.md` v324. All approved v517 shotgun ejection/chamber, zombie ragdoll until settled, effects and v520 settings unaffected.

## Test and follow-up
- Confirm opening screen visually shows only SETTINGS icon top-right and old Controls icon is concealed as naturally as possible; if mask artifact is visible, adjust the CSS masked art offset, not gameplay or background replacement. Clicking the left SETTINGS icon should open one GAME SETTINGS modal, defaulting to Controls tab, with Display/Graphics/Effects/Performance still functional. Right old Controls location must not be clickable. Pause settings must still open same controls.
- Full `src/game.js` syntax passed parsing before commit; code change is selector only. CSS and index changes are local to menu. No live browser rendering test possible yet.
- Existing v520 graph options include resolution, shadow quality, rain, splashes, streetlights, cosmetic particles and settled-corpse limit, with Low/Medium/High/Custom saved presets. Don't regress.
- Give cache-busted link `https://xboxlivehd88-hue.github.io/city-outbreak/?v=522-one-settings-button`.

Maintain direct main GitHub commits and top handoffs. Don't claim the old icon looks perfectly erased until user sees the actual Pages UI.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v521 RESTORE EXISTING OPENING-SCREEN SETTINGS BUTTON — READ FIRST

**GitHub main is source of truth. This newest top section supersedes earlier v520 current-state summaries.**

## Latest user correction (UI-only)
- User said: **"i see what you did and you didnt have to create an new settings button when there is one there already why"**.
- In v520 an existing `#showControls` button was RESTYLED from its original invisible clickable region aligned with the opening art into a new visible rectangular SETTINGS button in the upper right. This was unnecessary. The user wants to use the **original opening artwork SETTINGS button**.
- **v521 CSS ONLY** restores the existing `#showControls` to its exact v519 transparent clickable region: right 1%, top .8%, width 6.4%, height 10.6%, opacity .01, pointer-events auto. It retains a visible keyboard-focus outline. Removed the additional rectangular button look and hover style; there is **one** opening/settings trigger, the preexisting button.
- CSS commit: `1769717d15e526cbd2326885beacc79cda337666`, blob `7acc78a4be8acb56608dbdbc9825d7a6656be4d1`.
- index loader CSS cache bust `./src/game.css?v=521`, index commit `d6e9d6b070011dbd541362e10df2bac97d7115c4`, blob `f1a61140cef51df2dc563167268ee90e440aba2a`.
- Gameplay code remains **v520** at `./src/game.js?v=520` (no gameplay edit). Current `src/game.js` blob `a07b7f08e731f574595e5543fc981b5c58e67064` as fetched for this change.
- Protected v324 recovery remains intact.

## Existing settings interface preserved
- Original start-menu `#showControls` is wired by `src/game.js` to `openGraphicsModal("controls")`. This opens the single **GAME SETTINGS** modal with CONTROL / DISPLAY / GRAPHICS / EFFECTS / PERFORMANCE tabs. It is not a second Settings button.
- Modal still contains Low/Medium/High/Custom graphics quality selector, independent render resolution, shadow quality, real streetlights, rain, rain splashes, cosmetic particle density, and max settled corpses. Pause menu retains quality select + Advanced button, correctly using the same modal.
- v520 gameplay/performance work is unchanged: shotgun v517 first-shell chamber only if empty, spent shell GLB, M4, collision, ragdoll, maps, waves, and controls untouched. Corpses clear only once settled; effects limited to cosmetic particles.
- Start screen extra floating `.graphicsStartOptions` panel was already removed in v520 and remains absent in v521.

## Validation and user test
- Read both handoffs, protected checkpoint, index, game, CSS from live GitHub main.
- Confirmed CSS originally overwrote `#showControls` positioning/appearance in v520. Replaced only that one selector group and changed only index CSS version.
- Test original settings icon/word already drawn on title-screen background at upper right: click it, see GAME SETTINGS tabs and controls. No duplicate rectangular SETTINGS button should appear. Choose LOW > PERFORMANCE, adjust particles/corpses, close, and play.
- No live browser rendered screenshot/benchmark taken yet; user must confirm original-image button aligns and is clickable.

Do not reintroduce a separate start SETTINGS button. Continue direct GitHub commits, cache-busted Pages link, newest handoffs at top.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v520 SETTINGS NOW INSIDE THE ACTUAL OPENING SCREEN MENU — READ FIRST

**READ THIS TOP ENTRY FIRST. GitHub main is authoritative. This newer v520 entry supersedes the older v520 note below that says a separate start-screen graphics widget or only four tabs.**

## Latest user request and completed changes
- User clarified: **"ok great but with the graphic settings can we put them in the actual settings on the opening screen"** while we were completing v520 low-end performance controls.
- Implemented a visible **SETTINGS** button at the TOP RIGHT of the title screen in place of the nearly invisible `#showControls` hotspot; removed floating bottom-left start `graphicsStartOptions`.
- Existing separate old `#controlsModal` was removed from index. The original full keyboard/gamepad controls list was relocated into the same graphics/settings dialog as the first **CONTROLS** tab, with no input/controls behavior changed.
- One shared `#graphicsAdvancedModal` is now **GAME SETTINGS** with **FIVE** tabs: CONTROLS, DISPLAY, GRAPHICS, EFFECTS, PERFORMANCE. Graphics quality preset `#graphicsQualityStart` is INSIDE this modal at top, rather than on title image.
- Start SETTINGS opens CONTROLS tab by default; user may select Display, Graphics, Effects and Performance. Pause > Advanced Graphics opens the SAME dialog on DISPLAY. Existing pause preset select remains. All tabs share persistent settings.
- User's low-end system: on start screen click SETTINGS > QUALITY PRESET > **LOW**. Alternatively adjust individual CPU/GPU settings via tabs.
- Final UI integration game commit `a14a28cc582bc00993e6de0308ea91811dd0147a`, game blob `a07b7f08e731f574595e5543fc981b5c58e67064`; index commit `c447442d2dedd14aebb75271acb189212833e262`, index blob `3d44cccad3fe6c1ab9a312711c7c01f9d7df06d4`; CSS commit `d1093a4c5169c56c2eab0f44fb79eb50986ac052`, CSS blob `84d49c1aef1c3ad11c32f916b3ed16e1247d67b3`.
- Loader remains `./src/game.js?v=520`, style `./src/game.css?v=520`. Previous v520 CPU/GPU logic changes remain in the same main branch and are detailed in the following older v520 section.

## v520 features protected
- Quality High/Medium/Low/Custom, resolution scaling, sun shadow quality OFF/LOW 256/MEDIUM 512/HIGH 768, streetlamp real spotlights, rain and splashes, cosmetic particle percentage 25/50/75/100, max settled corpse cap 0/4/10/20.
- Corpse cleanup waits until ragdoll `active===false` before removing any settled corpse, preserving user-approved falls. Living zombies and AI unmodified; explosion particle setting changes only visuals, not explosion damage.
- v517 shotgun empty-only chamber, bottom load otherwise, approved GLB spent ejections, ADS stats and all weapons unchanged.
- Protected v324 recovery checkpoint NEVER touched.

## Tests completed
- Full edited JavaScript syntax parses, index contains all 5 paired tabs and no standalone floating graphics card or old controls modal, CSS has visible SETTINGS button and 5-column nav.
- Mocked real settings handlers: start SETTINGS opens Controls; Performance tab works; adjusting particle density and corpse cap independently switches to CUSTOM; shadow LOW updates shadow map to 256; pause shortcut opens DISPLAY; LOW restores 60% pixel ratio/shadows off/particles 25%/4 settled corpses; HIGH restores full quality. Confirmed no change to approved shotgun reload.
- This is static/runtime mock testing, **not a live browser gameplay or FPS benchmark**. User must test new title menu and record FPS differences during waves.

## Continuing workflow
- Commit any adjustments directly to live GitHub `main`, verify current `index.html` + `src/game.js`, update both handoff docs at TOP, share cache-busted Pages URL.
- Preserve recovery checkpoint `CURRENT_RECOVERY_CHECKPOINT.md` (v324).

---

# NEW-CHAT HANDOFF — 2026-10-09 — v520 LOW-END PERFORMANCE CONTROLS & TABBED GRAPHICS MENU — READ FIRST

**GitHub main is authoritative; newest dated top entry supersedes older "current" sections.**

## User intent, approvals and source
- User approved v517 shotgun and v519 graphics individual effects, is currently testing on a **low-end system**, provided reference image of extensive Graphics/GPU/CPU settings and said **"thats make this happen as im currently on a low end system"**.
- v520 directly implements safe low-end optimization: maximum settled corpses, cosmetic particle density, shadow quality, and reorganized four-tab advanced graphics UI.
- **User has NOT visually/performance approved v520.** No actual browser GPU FPS benchmark claimed.
- Gameplay commits: first `0e72170885ae9bb9bbbd9e6cbf05be369bed7b2a`, finalized tab wiring `6aef98ef8a82fd26d8bda723423a415e29cecdc0`; game blob `3072275071b126293747671d3be5c196a0199da0`.
- Index markup version bump commit `46cdc012a690b17ebaf963b5f9ebd5b46e0656b9`, index blob `f8d2a6a559ce69b1ea83b63604f2ca76c0d62bde`.
- CSS styling commit `48d5301255ae78fbaf4a77468ead1b33cc8f50df`, CSS blob `8a10ade89f897f14d2df9b1f269454d512b129bf`.
- Loaders `src/game.js?v=520` and `src/game.css?v=520`. Original GLB assets, game map, zombies, weapons, shotgun ammo/reload/ejected shell, keyboard controls, audio untouched.
- **Never edit protected v324 CURRENT_RECOVERY_CHECKPOINT.md unless user explicitly requests it.**

## Menu
- Both start and pause still have simple Low/Medium/High/Custom selectors and Advanced Graphics buttons. Advanced dialog now has four switchable tab sections: **Display**, **Graphics**, **Effects**, **Performance**.
- Display: 60/75/85/original 110% render ratio.
- Graphics: shadow quality Off/Low 256/Medium 512/High 768 shadowmap pixels, and real streetlight setting Off/Reduced/Full.
- Effects: Rain Off/Reduced/Full, Rain Splashes On/Off.
- Performance: Cosmetic Particle Density 25%/50%/75%/100% and Maximum Visible Settled Corpses 0/4/10/20.
- Visual language dark blue/grey, small responsive tabs. Tabs only show/hide control sections and do not reset any selection. Changing a per-effect option still marks **Custom**, saves locally using existing `city-outbreak-graphics-v1` and `city-outbreak-graphics-custom-v2` keys. Old v519 saved boolean `shadows` migrates to `shadowQuality`.
- New preset defaults: **High** original resolution 1.10, high shadows 768, full rain/splash/lights, 100% particles, max20 settled corpses (old fixed 10-second lifetime still applies when settled); **Medium** .85, shadows off, half rain/lights, no splashes, 50% particles and 10 settled corpses; **Low** .60, shadows off, no rain/lights, no splashes, 25% particles, at most 4 SETTLED corpses.
- Do not change default High selection for pre-existing saved preferences, except user may choose Low manually.

## Implementation and safeguards
- In src/game.js `cosmeticParticleCount(count)` scales only VISUAL blood fragments, impact dust meshes, launcher and grenade particles: original launcher 34 / grenade 55, Low ~9 / ~14, Medium 17 / 28, High original. Damage, blast impulse, hitboxes and number of enemies unchanged.
- Dead zombie update continues full ragdoll simulation via `if(z.ragdoll?.active!==false)updateRagdoll(z,dt)`. Existing 10-second corpse cleanup now checks `z.ragdoll?.active===false` (must be settled). After update, `settledCorpses` filters dead, not already removed and **ragdoll.active exactly false**, sorts oldest first, removes only excess beyond `graphicsOptions.corpses`. Avoid culling any falling ragdolls or living zombies; graphics options may not force physics sleep early.
- Shadow quality uses `sun.shadow.mapSize` 256/512/768 with disposal of old render target on change, existing `ren.shadowMap.enabled` and `sun.castShadow`; Off disables.
- Old Low/Medium/High lighting and world-rain settings continue to work.
- No full-screen, FOV, view distance or alternative render engine changes in this version; don't add misleading toggles without actual corresponding features.

## Tests completed
- Fetched live main both handoffs, protected checkpoint, index, full JS/CSS and perf HUD before changes.
- After full game code commit, complete JavaScript parses.
- Verified 7 live settings HTML controls, all four tabs and CSS hidden-panel rules, render/CSS loader v520, preserved approved shotgun empty-only side chamber, GLB spent shell orientation/size, ragdoll active condition and M4 zero.
- Tested cosmetic multiplier at 25/50/75/100% for particle count 2/3/10/34/55; Low launcher9 & grenade14, Medium17 &28, High34 &55.
- Normalization tests for legacy saved `shadows:false` and new Custom fields pass.
- **Not browser-rendered/benchmarked**; user should test FPS upper-left, selecting Low and compare High, then try Performance tab corpse limit 4, particle density 25, Graphics tab shadows off, Effects tab rain off. Test several waves / explosions / zombie ragdolls to ensure falling bodies stay visible until they settle. If memory/performance regression, inspect current repo and fix surgically.

## Workflow
- Direct GitHub main edits, full validation, update both handoffs, cache-busted Pages test link. Protected v324 untouched.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v519 CUSTOM ADVANCED GRAPHICS CONTROLS — READ FIRST

**GitHub `main` remains the source of truth. This newest top section supersedes older current-build handoffs.**

## User's latest request / approved gameplay
- User approved v517 (empty shotgun chambers first shell from side, partially loaded shotgun uses bottom feed only); v518 introduced Low/Medium/High graphics presets.
- User now asked: **"are you able to make it so the player is able to turn on or off things separately. like maybe look ingto other game graphic settings and see how the have there menues?"**
- Researched standard PC graphics menus (Fortnite video presets, Unreal Engine scalability docs): presets plus manual per-feature options are conventional. v519 implements that.
- **v519** still needs user's actual in-browser visual/FPS testing; no measured benchmark claimed.
- Loader `./src/game.js?v=519` and stylesheet `./src/game.css?v=519` in index.html.
- Game initial commit `944a294ff44c3be70b851a1ecf983b65a0ee510c`; follow-up Escape/dialog commit `6bc676e2b206940d0cb5e08451f2d4dc3290a403`, gameplay blob `c52daf99b5bd443a896aee1ae84b3be4bf15f11b`.
- index.html GUI commit `3e97ac2bd5c7b3b6244d261119c2e08d4262dabf`, blob `86ecc73a9a04bd88147797ec92df74183ee28945`.
- CSS dialog commit `b44c836c6491f35e2f740b2d3128e617193f5765`, blob `0dc720bfa9bc38401bbce8ca241cc74020c57f88`.
- GLB assets untouched. Protected `CURRENT_RECOVERY_CHECKPOINT.md` v324 untouched.

## UI and independent settings
- Existing Low / Medium / High selectors remain both on start screen and pause menu, with a new `CUSTOM — MANUAL` option.
- Both locations now have **ADVANCED GRAPHICS...** button. Either opens ONE shared fullscreen overlay dialog `#graphicsAdvancedModal` above start/pause. It has accessible field labels, descriptions, a close button, click-outside dismiss, Escape-to-close, responsive styling, and current preset indication.
- Five truly independently adjustable options using `[data-graphics-option]`:
  1. **Render Resolution**: 60%, 75%, 85%, or up to 110% pixel-ratio cap. Changing calls existing renderer resize function.
  2. **Dynamic Shadows**: On/Off (`ren.shadowMap.enabled`, `sun.castShadow`).
  3. **Rain**: Off/Reduced (310 streaks)/Full (620 streaks); rain updater and draw range respect value.
  4. **Rain Splashes**: On/Off independent of preset, only visible when rain is on.
  5. **Real Streetlight Lighting**: Off/Reduced (half existing real spotlights)/Full; decorative low-cost lamp glow stays.
- Changing any setting switches quality label in both selectors to **CUSTOM** immediately, without changing other options. Presets overwrite all individual options at once. Selecting CUSTOM again restores saved manual settings.
- `GRAPHICS_PRESETS` defaults match v518 exactly:
   - High original: res 1.10, shadows on, rain 620, splashes on, full lights.
   - Medium: res .85, shadows off, rain 310, splashes off, half lights.
   - Low: res .60, shadows off, rain0, splashes off, real lights off.
- Existing preset key `city-outbreak-graphics-v1` is reused; custom settings are stored as JSON at `city-outbreak-graphics-custom-v2`; both guarded with try/catch to handle blocked localStorage.
- Async lamp GLB loading uses `graphicsOptions.lights` to recompute live budget, preserving choice after map finishes loading.
- No antialias checkbox (Three.js WebGLRenderer constructor AA cannot be toggled without renderer recreation); no false controls added. No collision, AI, wave, zombie count, controls or weapon changes.

## Verification and next test
- Read newest handoff sections, protected recovery, index.html, full src/game.js and CSS from current GitHub main. Researched Epic docs.
- Full JS syntax check passes. Mocked real graphics methods, both preset selectors, modal controls and a lamp pool of 8: tested High, Medium, Low; manually changed Medium to Shadows ON -> CUSTOM without losing its rain 310 or resolution .85; independently switched Rain OFF and lights OFF while retaining Shadows; switching to Low and back to Custom restored manual state. Confirmed storage JSON, both settings controls synced, modal opens/closes.
- Verified all 5 advanced controls and their CSS present, v519 game/CSS cache busts, and approved v517 shotgun code unchanged. Escape support parsed. No GPU benchmark or live Pages browser rendering performed.
- User test: open Start > ADVANCED GRAPHICS, try Rain OFF + Shadows ON + Render Resolution 60%, verify CUSTOM and whether FPS improves. Pause and verify same values there; restart browser and verify remembered choices. Compare FPS in upper-left; confirm game/zombie/spawn/collision/reloads untouched.
- For performance, GPU-heavy toggles are render resolution, sun shadows, spotlights; rain/splash effects primarily help effect update work. Rendering improvements are hardware dependent.

Continue direct GitHub main edits + versioned cache-busted Pages links. Keep handoffs up to date. **Never edit protected v324 recovery unless explicitly directed.**

---

# NEW-CHAT HANDOFF — 2026-10-09 — v518 GRAPHICS QUALITY PRESETS FOR LOW-END SYSTEMS — READ FIRST

**GitHub main is authoritative. This newest section supersedes all earlier "current" entries.**

## User request and current build
- User approved v517 shotgun behavior and asked **"is there some way we can make it so i can lower the graphics settings so this can be played on lower end systems?"**
- v518 introduces **Low, Medium, High** settings in both the start screen and pause overlay, immediate live adjustment and persistence in browser localStorage.
- Gameplay commit `aabc76d77374d52939dbd8c7509e49148db9a8bc`, followed by game follow-up `5cff8aa49f8708b58a449f187042d52b17cb353d`, game blob `7dc8c8ffc99dc34e4a5e1ee788380a725cc4b752`.
- index/menu + game/CSS loader commit `6631700b1d9fbf518946721b5536417776f38cad`, index blob `68e662ef6dbc5c754a2b72f3424ee234d3a4c1bc`.
- CSS selector styling commit `b3737ada847bccd988f8523fc02606c5375469a5`, CSS blob `ba8dbb56acc6551908deff2816f25e9583f166c0`.
- index now loads `./src/game.js?v=518` and `./src/game.css?v=518`. Protected v324 recovery checkpoint unchanged.
- **Pending user visual/performance test**; don't claim FPS gains as measured without benchmark.

## Graphics preset behavior
- **High (original v517 graphics)**: Three.js renderer pixel ratio `Math.min(devicePixelRatio,1.10)`; sun shadows ON; all 620 world-space rain drops plus 56 splash slots; full existing real streetlight pool. Initial choice when no prior saved preference.
- **Medium**: pixel ratio cap `.85`; sun shadows OFF; only 310 live rain streaks, with rain splashes hidden and skipped; approximately half of the preexisting nearby real streetlight pool (cheap point glow unchanged).
- **Low (fastest)**: pixel ratio cap `.60`; shadows OFF; rain streaks/splashes OFF, rain raycast/update loop skipped; live streetlight spotlights OFF but cheap, warm always-on streetlight glows preserved. Scene illumination from original hemisphere/directional lights remains, geometry & zombies preserved.
- Switching calls `ren.setPixelRatio(...)`, existing render resize callback, toggles `ren.shadowMap.enabled`/`sun.castShadow`, rain geometry drawRange and visibility, lamp budget; no restart needed.
- Saved in `localStorage["city-outbreak-graphics-v1"]` guarded with try/catch; both `.graphicsQualitySelect` synchronized and document root data attribute updated.
- Async city GLB lamp creation recomputes the chosen lamp budget when pool becomes available. No model/collider/nav/weapon/wave logic altered.
- Start-screen menu is a visible bottom-left `GRAPHICS QUALITY` select, and another is in paused panel above Resume. CSS selector styled to match UI.

## Verification and precautions
- Read newest sections of both repo handoffs, protected checkpoint, index, source game, stylesheet, renderer resize util and performance HUD.
- Parsed entire modified game JS successfully.
- Executed isolated `applyGraphicsQuality()` with mocked renderer / lamp pool (8 lamps) and both selectors:
  - High: pixel ratio 1.10, shadows yes, 620 rain, 8 live lamps, splashes yes
  - Medium: pixel ratio .85, shadows no, 310 rain, 4 lamps, splashes no
  - Low: pixel ratio .60, shadows no, 0 rain, 0 lamps, splashes no
  - High again restored original state.
- Verified both controls, CSS/loader cache versions, async streetlamp handling, approved v517 shotgun empty-only chamber logic.
- No real in-browser GPU performance benchmark done yet. Ask user to compare **FPS** shown upper-left while moving and during zombie waves; presets should affect rendering cost not enemy count/gameplay rules.
- If problems, address only new renderer effect toggles or menu controls and never alter protected approved shotgun behavior.

## Workflows
- Keep code in GitHub `main` and handoff latest top sections. Present cache-busted Pages link. Never edit `CURRENT_RECOVERY_CHECKPOINT.md` v324 unless user explicitly says so.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v517 CHAMBER SHELL ONLY WHEN SHOTGUN IS EMPTY — READ FIRST

**GitHub `main` is authoritative. This newest section supersedes older current build notes.**

## User instruction and latest gameplay state
- User approved v516's first side-chamber / subsequent bottom-feed shotgun animation and clarified: **"the only time a single shell goes in the right side of the shotgun is when there are no more rounds in the gun."**
- **v517** gameplay commit `94f60786ebf4fbe988cf84aa4dbc61cc0bc658f2`, `src/game.js` blob `ef37b99b7e411eb4a461a2a567dd69106e02a9c9`.
- Loader `./src/game.js?v=517`, commit `3f9c7ebf6124b39564884fcdbe78ef111469415c`.
- User has NOT visually approved v517; only logic validation so far. Protected v324 recovery untouched.

## Only change in gameplay — shotgun reload mode initialization
- At start of `reload(w="shotgun")`, changed `shotgunReloadShellIndex=0` to `shotgunReloadShellIndex=a.mag===0?0:1`.
- This reuses ALL existing v516 mechanics unchanged:
  - Shotgun **completely empty (0 in magazine)**: `shotgunReloadShellIndex===0` for FIRST shell, which uses user-approved canted side-chamber feed. Once inserted, counter increments and shotgun smoothly returns to LEVEL for any remaining rounds loaded from the bottom.
  - Shotgun **has at least one round remaining (1 to capacity−1)**: index begins at 1; the entire reload uses BOTTOM magazine feed and shotgun never intentionally rotates sideways.
- Each shell still increases `a.mag`, decreases reserve, and increments `shotgunReloadShellIndex` only after insertion. Shell rate, visual hand paths, audio, ammo quantities unchanged.
- v516 gun roll/level easing, arm motion, red reload cartridge actor, bottom GLB inserter-based port unchanged. v514 approved shotgun GLB spent shell 0.19 scale/direction unchanged. M4 and every other weapon unchanged.

## Validation
- Fetched both latest handoffs, protected `CURRENT_RECOVERY_CHECKPOINT.md`, `index.html` and complete `src/game.js` from live `main`.
- Complete JS passed syntax parser; verified exact v516 roll, side/bottom paths, v514 spent shell and M4 ADS zero retained.
- Dry-run mode checks for magazine amounts 0, 1, 2, 5 and 7: only 0 starts with side-chamber; all others and every later shell select bottom. No in-browser visual verification yet.
- Gameplay + loader committed to main. Both handoff files updated as part of v517.

## User test
Fire shotgun empty and reload: first shell side chamber, shotgun rolls level, later shells feed from bottom. Then reload with e.g. 3–5 shells still in gun: ALL shells feed from the bottom with NO initial side-chamber cant. Confirm gun stays level on partial reload and previous approved ejection remains.

Continue direct GitHub edits with version bump and updated handoffs. Preserve protected v324 checkpoint.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v516 SHOTGUN LEVELS AFTER FIRST SHELL, BOTTOM LOAD REMAINS — READ FIRST

**GitHub main is authoritative. This top entry supersedes older current build notes.**

## User feedback and v516 objective
- User reviewed v515 and said **"ok so the motion is there but after the first loaded shell the shotgun doesnt need to be on its right side anymore"**.
- Current **v516** is committed for user testing; visual result not yet approved.
- Gameplay commit `5ff3e4507ede2ac9a30add090c98d4cd42874757`; gameplay blob `cee4123411ad8fe7fb30318a2807971f6995feed`.
- Loader: `./src/game.js?v=516`, loader commit `8e42e69cdd68f72b887d7526e1e8efa570f8c59b`.
- Shotgun GLB `assets/shotgun_test.glb?v=501` and CSS unchanged; protected v324 recovery untouched.

## EXACT CHANGE
- In `move(dt)`, v515 held `shotgunReloadCant` at 1 for the entire `reloading` interval, including bottom loading, keeping the shotgun on its side after the first shell.
- **v516:** hold `targetCant=1` ONLY while `reloading&&reloadWeapon==="shotgun"&&shotgunReloadShellIndex===0`. When the first cartridge is fully loaded, `shotgunReloadShellIndex` increments from 0 to 1 (already v515) and `targetCant=0`. `shotgunReloadCant` eases back to 0 using Three.js damping with rate 8 rather than snapping, while the bottom loading cycles proceed without turning onto a side.
- Preserve exact first-chamber `gun.rotation.z=1.15*shotgunCant` and `rotation.y=-.21*shotgunCant`; values remain unchanged, only the target and easing on transition are altered.
- New per-shell bottom-loading path `shotgunBottomLoadPort` from v515, bottom pickup/align/press/forward shell actor, arm poses and trigger/grip positions remain untouched.
- Ejected spent-shell GLB orientation and 0.19 max dimension from approved v514 untouched. M4 and all other weapons, ADS, reload duration, ammo logic and weapon order untouched.

## Validation
- Fetched latest main handoffs, checkpoint, index.html, src/game.js before change.
- Full modified JS parses. Diff confined to one shotgun cant-control block in `move(dt)`.
- Simple numerical damping check at 60 fps: first shell roll reaches 0.9999 by 820ms, then fades to 0.0015 over the next 820ms. This is a unit/math check, NOT a visual/browser verification.
- Commit gameplay, loader and both docs directly to `main`.
- User test: fire 3-4 shells and reload; first shell should play established side-chamber sequence with gun rolled, then gun should return smoothly to natural level position for ALL later bottom-fed shells, not remain rolled on its side. Watch for hand snapping at transition; give feedback if needed.

Always preserve the protected v324 recovery. Provide cache-busted Pages test link; never claim visual approval before user tests.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v515 FIRST SHOTGUN SHELL CHAMBERED FROM SIDE, REST LOADED BELOW — READ FIRST

**GitHub main is authoritative. Latest top sections supersede older notes.**

## New user instruction and approved baseline
- After testing v514, the user said **"perfect"** — v514 shell size/orientation, model ejection and shotgun reload were approved.
- User has now learned the real shotgun's loading sequence and requested **"one shell from the left then the rest is loaded into the bottom"**.
- Preserve v514 shotgun firing, ADS, spent-shell GLB model/size/orientation, gun cant, red shell actor, reload speed, M4 and all other guns. Update only how subsequent shotgun shells feed.
- Current gameplay **v515** commit `184a06d7b9227bfc43f210f217a90d6c48dee4c0`; game blob `97ee29b29db8dbfa04728bd963f39580a6a80036`.
- Loader `./src/game.js?v=515`, commit `663216341078e1be21d9d0917453823aad93e676`.
- GLB asset still `assets/shotgun_test.glb?v=501`; protected recovery v324 untouched.
- **User has not visually approved v515 yet.**

## v515 exact changes
- Add `shotgunReloadShellIndex=0`, reset at beginning of each shotgun reload. Increment by 1 only when a shell actually loads into magazine/ammo. If only one shell needed, only the original side-chamber motion plays.
- **First shell** (`shotgunReloadShellIndex===0`) preserves the exact approved v514 side/chamber loading coordinates and camera-space arm pose; shell still advances inward and forward during the same p=.74-.91 phases.
- **Subsequent shells** go into a new `shotgunBottomLoadPort` computed in `rebuildGun()` from the GLB's `inserter` node, offset toward the bottom of the receiver (x clamp .28-.54, y base-.24 clamp -.84..-.58, z clamp -1.65..-.78). Hand leaves pump and comes UP from below to this bottom gate. The shell goes up into the port and then forward down the magazine tube. It returns along the same underside corridor to the pump, avoiding an over-the-top loop for every shell.
- Separate camera-relative waypoint set for bottom feed versus chamber: lower pickup/approach/align; bottom pressIn=bottomPort+(0,-.06,.065) and pushForward=bottomPort+(0,+.025,-.27). Shell actor wrist offset on bottom route transitions (.035,+.105,-.075) -> (.015,+.08,-.09) -> (.005,+.035,-.12), so shell goes in with the hand. Original chamber offsets fully preserved.
- Existing projectile/shotgun reload physics, audio trigger, shell cycle duration `Math.max(580,820-reloadLevel*45)`, reserve/magazine math, ejection original GLB shell scale 0.19/orientation correction and overall gun roll `1.15*shotgunCant` untouched.
- Added new bottom target + index reset to weapon rebuild state. No M4 or other weapon changes.

## Validation and next test
- Read live `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, `index.html`, `src/game.js` on main before edit.
- Full modified JS passed syntax check. Verified preserved approved M4 ADS zero, shotgun roll/yaw/ADS, shell-duration, actual GLB spent casings, support-shoulder pose, weapon hotkey sequence and red/brass shell actor.
- Gameplay/loader committed. **No browser visual confirmation was possible; this is a user TEST build.**
- User should fire 3-4 shells, press R: **first shell travels over the receiver into its side/chamber port; all remaining shells travel under receiver into bottom loading gate, then forward toward muzzle.** Confirm hand doesn't stretch across gun or snap between shots. Gun should remain at approved v514 left cant, red/brass spent ejections unchanged.
- If needed adjust only bottom-feed port and motion based on user video, rather than altering approved first shell or weapon transforms.

Continue direct GitHub commits, update top of both handoffs, give cache-busted Pages link. Preserve v324 recovery.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v514 SHOTGUN SPENT SHELL SMALLER & REORIENTED — READ FIRST

**GitHub `main` is authoritative. This newest top section supersedes prior current-build notes.**

## User feedback and current approved state
- User tested v513 and said **"ok love it, 2 things the shells ejected are facing the wrong way and they seem a bit large"**.
- **v513 shotgun ejected GLB shell model is approved in principle.** The v512 side-load reload animation, hand movement, ADS, weapon behaviors, and all other guns must remain untouched.
- v514 is the latest **test** version; ejected-shell orientation/size have not yet been visually approved.
- Loader `./src/game.js?v=514`, gameplay commit `a6846a001d769edcc60f63c15a3472a8aaba36b5`, new game blob `eaed8d4482522b259d4f72ff97f3d09d35409b17`. Loader commit `2c2b77334d55dae38a30ebdc5cfb936233031980`.
- GLB asset `assets/shotgun_test.glb?v=501` unchanged; CSS `v500` unchanged. Protected recovery v324 untouched.

## v514 shotgun spent shell-only edits
- `shotgunSpentShellTemplate` still clones original `shotgunShellTemplate` mesh/material/texture and normalizes original GLB shell. Reduced ejected shell maximum dimension from **0.23** to **0.19** (about **17.4% smaller**): `ejected.scale.setScalar(.19/Math.max(.001,size.x,size.y,size.z))`.
- In the `if(shotgunCase)` branch of `casing()`, after copying the gun's world quaternion, apply `q.rotateY(Math.PI)` before small random pitch/roll to match the shotgun model root's original `rotation.y=Math.PI` correction (source gun barrel +Z, game -Z). This flips the shell's displayed forward/backward direction.
- All non-shotgun guns still use `FX.casingGeo` brass cylinders and original ejection physics; shotgun still ejects genuine GLB mesh.
- No other ejection physics, casing lifetime, spawn origin, barrel recoil, shotgun reload, ADS, stats, magazine capacity, or keybindings changed.

## Verification and user test
- Read main's latest handoff docs, current checkpoint, index, game before editing.
- Full modified `src/game.js` parsed successfully. Guarded approved shotgun roll/yaw, reload duration, red-shell insertion path, M4 ADS zero, shotgun ADS, weapon ordering, and generic-casing fallback.
- Changes are exactly two snippets in game code, plus loader bump. **No actual visual/browser confirmation yet.**
- Test: fire shotgun and look for slightly smaller spent GLB shells ejecting the opposite facing direction; confirm reload is still the approved v512/v513 presentation. Other weapons' casings remain generic.

Continue direct GitHub main commits and cache-busted Pages test links; update handoffs after modifications.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v513 SHOTGUN EJECTS ACTUAL GLB SHELL — READ FIRST

**GitHub `main` is authoritative. This newest section supersedes earlier current-state notes.**

## User approval and v513 scoped request
- User tested **v512** and explicitly said: **"its fine only problem is the emty shells that are ejected are still the one you made they need to be replaced with the shell model but only for the shotgun"**.
- Treat **v512 shotgun reload, left-roll pose, bent support arm, over-top feed, right-side breech insertion and shell disappearance as APPROVED**. DO NOT rework them without the user's request.
- Current v513 test build: `./src/game.js?v=513`, with game.js commit `b5a01e9ff0314ce266343f5c6a2cbf6f4c969cc2` and game blob `91ce96631b443ae084596f924eca51ead6be4b8d`; index loader commit `9e59756761e53cc21d5254b2d69215ab20cfffc1`.
- Original shotgun GLB remains `assets/shotgun_test.glb?v=501`. CSS v500, protected recovery v324 intact.

## What v513 changes (SHOTGUN EJECTION ONLY)
- Existing `casing()` created a generic `FX.casingGeo` / brass cylinder for ALL guns, including shotgun.
- Added a separate `shotgunSpentShellTemplate` initialized/null-reset with shotgun rebuild.
- In existing shotgun model rebuild: use the already-recognized **original GLB `shell` node** (saved as `shotgunShellTemplate`). Clone its real mesh/materials once into an independent group, recenter source display offset using its bounding box, normalize its largest side to **0.23 units** and save as `shotgunSpentShellTemplate`. Continue hiding the GLB's loose display shell on the idle gun.
- On `casing()`, if `weapon==="shotgun" && shotgunSpentShellTemplate` clone that original GLB model and allow a slight random tumble. For other weapons and for async asset fallback, retain the exact existing generic brass cylinder.
- Preserve the *same* generic ejection world origin `gun.localToWorld(.56,-.26,-1.05)`, casing velocity, lifetime, gravity, spin and cleanup cap. Do not alter any other firearm.
- **No changes** to shotgun reload FX's procedural red shell actor (the user approved that separately), shell timing, gameplay stats, ADS, crosshair, weapon loadout, or M4.
- User requested the original GLB ejected casing model; do not confuse it with the red/brass reload shell actor.

## Validation
- Fetched latest handoff documents, recovery checkpoint, index.html, and src/game.js from main before editing.
- Full edited JS passed parser check; verified exact existing gun roll `1.15*shotgunCant`, yaw `-.21*shotgunCant`, shotgun right-side breech `pushForward`, M4 ADS zero, weapon order and unchanged reload duration.
- GitHub main gameplay & loader committed. **Not visually verified in a live browser**; user to test shotgun ejection and other weapon casing preservation.

## v513 test
Fire shotgun while watching the ejected shells: ejected models should look like the actual GLB model, not miniature brass cylinders; visible red/brass reload insertion should behave exactly like the approved v512. Optionally test M4/M17 ejection remains generic.

Continue direct GitHub changes and cache-busted Pages links. Update both handoff files at top after each change. Preserve the protected v324 checkpoint.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v512 SHOTGUN SHELL SEATS INTO BREECH — READ FIRST

GitHub `main` is authoritative. This newest dated section supersedes all older current-state handoff sections.

## Current user feedback and version status
- User supplied `2026-10-09 02-36-29.mp4` testing v511 and said "the shells are not going into the breach close but not close enough".
- Inspected frames (19.8-second video). The shell is visible and the shotgun is held at the approved left-roll angle, but the red/brass cartridge stops visibly outside/above the receiver before disappearing.
- **v512** is committed to `main`, pending user visual approval.
- Gameplay commit: `a17c29b5de85ce0a40e7899ed8c1c7ffba07c088`; source blob: `bb49e2076a2a357e07397249034441b30a509d4f`.
- Loader commit: `f2779264783c01b035c71821599b6d9cb7c6ca4d`. index loader: `./src/game.js?v=512`.
- Shotgun asset stays `assets/shotgun_test.glb?v=501` and CSS stays v500.

## v512 surgical adjustment (shotgun reload FX ONLY)
- Keep v511-approved `gun.rotation.z=1.15*shotgunCant` (~66deg left roll) and `gun.rotation.y=-.21*shotgunCant`; do not alter these.
- Keep the v511 camera-space bent elbow and shoulder positions and hand's over-the-top → inward → forward timing; no changes to hand approach, visual shell model, ADS, firing, M4 or other weapons.
- Final two hand waypoints nudged inward/deeper: `pressIn=port+(-.015,.040,.04)` instead of `port+(.04,.055,.04)`; `pushForward=port+(-.09,.02,-.30)` instead of `port+(-.045,.03,-.25)`.
- Critical defect: old shell stayed attached at a constant `hand + (.075,.065,-.075)`, which left it **outside and above** the breach even when the hand pushed forward. v512 blends the actual cartridge's hand-local offset starting at p=.72: `(.075,.065,-.075)` -> `(-.09,-.015,-.075)` by p=.83 -> `(-.19,-.06,-.115)` by p=.91 (using smooth steps). This makes shell tip cross receiver upper lip and end `port+(-.28,-.04,-.415)`, deeper into the shotgun instead of vanish outside.
- Shell actor still appears at p>=.29 and disappears on complete forward seating p>=.91. 820ms shell timer and ammo count unchanged.

## Validation/constraints
- Before editing read top of both live handoffs, CURRENT_RECOVERY_CHECKPOINT.md, index.html, src/game.js from main.
- Parsed complete edited JS successfully. Checked exact approved weapon cycle order, M4 ADS zero, shotgun ADS, shell duration, rotation/yaw, bent elbow and shell actor unchanged.
- Verified displacement at p=.72, .775, .83, .87, .91 mathematically; endpoint is inside port x/y and .415 units forward. This is source/geometry validation, NOT real in-browser visual confirmation.
- Protected v324 recovery not touched.

## Next test
Fire several shotgun rounds, press R: shotgun left roll/arm should look the same as v511. Red/brass shell should now **enter the breech visibly during the last inward-and-forward push**, rather than hovering just outside before disappearing. If insertion is visually offset, inspect exact new video and adjust only seating position; do not change approved gun/arm and timing.

Continue direct GitHub commits and cache-busted Pages links, maintain handoffs. Do not claim visual success without user test.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v511 SHOTGUN SUPPORT ELBOW FINAL BEND TUNE — READ FIRST

GitHub `main` is authoritative. This entry at the top supersedes older "current" entries.

## Current v511 test (not yet approved visually)
- User uploaded `2026-10-09 02-29-57.mp4` (30.9s) testing v510 and said: "its so close just not there yet just a little more adjustment."
- Examined extracted frames: v510 gun roll and red/brass shell + over-top/inward/forward stroke are very close. However, the left arm still appears to be a long, almost straight diagonal rod reaching up to the shell/receiver.
- Keep approved gun left roll `1.15rad`, right-side receiver visibility `-.21rad` yaw, shell visibility, forward two-stage stroke, grip and ADS untouched.
- **v511** loader `./src/game.js?v=511`. Gameplay commit `5054c25c1002d4dda39cfec229f58f14d8a14287`; gameplay blob `dae5d3cd6b874358a16a1b0ce6042cbb307fa6a2`.
- Loader commit `46b17a9d2b7590bee5671c0b680a827588e69e6e`.
- Shotgun GLB `assets/shotgun_test.glb?v=501` and CSS v500 unchanged.
- Protected v324 recovery and approved M4 remain untouched.

## v511 microscopic shotgun-only change
- Previous camera-space shoulder `(-.52,-1.04,.16)` sits effectively behind player's camera, extending full upper arm as pole. It is now `(-.44,-1.00,-.26)` so upper arm originates more naturally from player's lower-left torso.
- Previous elbow `Math.min(-.27,handView.x-.24)` and camera-space Y range `[-.84,-.50]` left wrist-to-elbow almost straight on screen. New elbow x `Math.min(-.52,handView.x-.38)`, Y clamp `[-.84,-.62]`, and interpolated depth factor `.52` (was `.64`) produces a visibly bent elbow with sleeve close to player's body. No change to actual hand or shell trajectory.
- Representative 2D projected angle tests at three possible hand positions changed elbow angle from ~115/141/131 degrees to ~86/96/97 degrees, respectively (more human-like bend). This is geometry validation, not gameplay visual verification.
- All shell and hand keyframes, +X inward then -Z forward stroke, 820ms shell interval, cylinder materials/scale, ADS/hip/crosshair, M4, weapon order, and game stats unchanged.
- Full JavaScript source passed syntax parser and exact protected values checked.

## What user should test
Fire 2-4 shells and reload. The shotgun should still roll to the exact approved angle; support elbow should be bent rather than acting as a long bar across the screen while shell hand rises, pushes inward and then forward. If elbow still clips or looks wrong, inspect next video and make only narrowly scoped changes.

## Workflow
Commit edits directly to GitHub main, update `index.html` loader and both handoff docs; return cache-busted game link. Preserve approved v324 recovery. Never claim rendered visual success without actual gameplay verification.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v510 SHOTGUN HAND PUSHES SHELL IN AND FORWARD — READ FIRST

GitHub `main` is authoritative. This top section supersedes previous "current" notes.

## User's latest test and request
- User tested v509; attached `2026-10-09 02-06-24.mp4` (about 18 seconds).
- Exact feedback: **"the shell looks like it being plugg in not loaded and the left arm should be over with shell then push shell in and forward this is close"**.
- This means v509 left arm and gun cant are getting closer. Preserve them. Specifically fix shell orientation and couple hand motion to the shell through TWO distinct loading beats: inward then forward toward the muzzle.
- v510 is committed but **visual correctness not yet user confirmed**.

## v510 source and deployment
- Game version v510, loader `./src/game.js?v=510`.
- Gameplay commit `020ae07ad5462ebf54b70cb6fad9df985e9752a9`.
- Gameplay source blob `9c22efb785eede4a64d68fd8c89370634c43363b`.
- Loader commit `e24a7377951d500a609f1bf1ab5ce198f7080506`.
- Shotgun GLB remains `assets/shotgun_test.glb?v=501`; CSS unchanged from v500.
- Protected recovery v324 unchanged.

## Isolated v510 improvements to `updateShotgunReloadFX`
1. Keep v509 over-top approach, camera-space fixed shoulder/elbow solution, shell visibility, and v506-approved roll (`1.15*shotgunCant`) and yaw (`-.21*shotgunCant`).
2. From the upper crossing, support hand/shell arrive just outside loading port (`align`), then press inward to `pressIn = port + (.04,.055,.04)` (progress .74–.83), then deliberately **push FORWARD toward muzzle (-Z)** to `pushForward = port + (-.045,.03,-.25)` (progress .83–.91). Hand stays connected to shell the whole way. Finally retract hand along upper-right path to foregrip (.91–1).
3. Replace v509 shell-axis alignment on X (which resembled a plug) with **longitudinal -Z orientation**, brass cap trailing toward the hand (+Z). Existing red hull, brass base and primer remain.
4. Remove v509 independent shell transform interpolation during insertion: shell is positioned at `hand + (.075,.065,-.075)` every frame, and remains visible during inward and forward beats. Remove actor when insertion is complete (`p>=.91`).
5. Shell timing still `Math.max(580,820-reloadLevel*45)`; magazine increment unchanged. Gun roll/ADS, firing stats, reticle, M4, other weapons, keybinds untouched.

## Validation and test focus
- Read latest handoffs, recovery, index.html, src/game.js from `main` before editing.
- Visually examined user's v509 footage; previous shell oriented sideways and moved independently.
- Parsed complete updated JavaScript. Pure vector waypoint checks ensure inward movement and a distinct forward (-Z) push; preserved locked M4 zero, shotgun ADS and weapon order.
- Github commits and new loader verified. No browser in-game rendering check yet.
- User should fire 2–4 shells, press R, watch the **left hand carry a shell over the gun, line it up at the right port, press inward and drive it forward before releasing**; return arm over gun rather than dropping under. Check arm remains bent and gun holds v506 cant. Ask only for feedback from actual play if needed.

Maintain versioned cache-busted Pages playable link; don't declare visual fix user-approved before their test.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v509 SHOTGUN SUPPORT ARM VERTICAL-POLE CORRECTION — READ FIRST

GitHub `main` is authoritative. This newest section supersedes past current-state notes.

## User complaint and root cause
- User reviewed v508 and uploaded `2026-10-09 01-58-40.mp4` (16.5 s), asking **"how did we go backwards?"**.
- In video: a huge straight/vertical left support arm stands up beside the tilted shotgun, shell near its top. Not credible human grip.
- Earlier v506 **shotgun rolled onto left side / visible right-side loading port** was user-approved; user wanted the support hand not to travel beneath the gun then back above.
- v507/v508 made the arm progressively worse because gun-local shoulder/elbow rotation and camera-relative hand targets were not solved together as a proper joint chain; code-only syntax checks were incorrectly treated as sufficient evidence of visual quality. Do NOT claim visuals are verified without actual gameplay.

## Current TEST build, pending visual review
- Version: **v509**. Loader: `./src/game.js?v=509`
- Gameplay commit: `42402024af134a903c8e9d699baf44c13cd6b617`.
- Gameplay blob: `c7bf75888e581cc97b7bab2717309d1dd36ad388`.
- Loader commit: `a0e75250732e8ccbe6203e52439d0e7ae79e33ab`.
- Shotgun model still `assets/shotgun_test.glb?v=501`; CSS v500; protected recovery v324 untouched.

## Isolated v509 support arm changes
- Keeps gun's approved full reload cant `+1.15rad` roll and `-.21rad` yaw, v505 red/brass visible shell, per-shell insertion, 820ms timing, gameplay, ADS, M4 and hotkeys.
- `updateShotgunReloadFX` no longer uses the physically **gun-rotated support shoulder** as the full-reload upper-arm base. It solves a fixed player/camera-space shoulder `(-.52,-1.04,.16)`, while positioning the elbow **to the left and below the current camera-space hand** with explicit constraints. Both are converted to gun-local so the existing procedural arm meshes are posed consistently after the shotgun rotation.
- Arm anchors blend in progressively with `shotgunReloadCant` and blend out while gun returns from reload; support arm is not reset abruptly when final round seats.
- Upper hand trajectory capped at camera `topY=-.22` maximum, preventing extreme upward reach. Keeps v508 no-undergun pickup, across-receiver, right-side shell insertion path.
- Shell actors are suppressed on recovery/after load, and existing per-shell shell-position continuity retained.

## Validation
- Read both latest handoffs, current recovery checkpoint, index.html and game.js on live `main`.
- Inspected new user video frames showing vertical pole.
- Full JS syntax parsed successfully, guarded M4 zero/shotgun ADS, locked roll, visible shell, per-shell rate, and weapon order.
- Sampled projected elbow geometries assert elbow is left/below wrist.
- **Browser/visual test could NOT be completed**: container has Chromium but no network DNS for GitHub Pages. User must visually test; do not state this is already fixed.

## Next test
Fire 2-4 shells then press R. Confirm shotgun still rolls LEFT, loading occurs on RIGHT with visible red shell, but support arm now angles naturally from lower-left body to bent elbow to hand rather than forming a huge vertical pole. Look for hand/arm snapping back after last round. Preserve approved shotgun rotation and M4.

Continue direct Github commits and cache-busted Pages builds. Any further visual fixes should be motivated by captured footage, not ungrounded numbers.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v508 SHOTGUN ARM REGRESSION FIX — READ FIRST

**GitHub main is the single source of truth. Read latest sections at top of all handoff and recovery docs before future changes.**

## Latest build (PENDING USER VISUAL APPROVAL)
- Version **v508**; loader `./src/game.js?v=508`.
- Gameplay commit `3dd3e28802cedc00647258eb3b27790c60007adf`; game.js blob `699e9fe2da475ec81fed3c8a826e223815395704`.
- Loader commit `1f10506fe8f1810f96a381c9346d7f40c8c7c7b7`.
- Shotgun source `assets/shotgun_test.glb?v=501`, unchanged; CSS v500 unchanged.
- Approved M4 behavior, weapon hotkeys and full weapon gameplay unchanged; protected **v324** recovery untouched.

## User reported visual v507 regression
User supplied **14-second gameplay video** `2026-10-09 01-47-50.mp4`, stating **"this doesnt look right at all"**. Inspected frames: v507's body-anchored camera shoulder and local-over-forearm route made a huge straight-looking left arm reaching skyward in front of the camera while the shotgun sat far right. This is worse than v506. Previously user explicitly approved **v506 shotgun rolled left/right-side load angle**, but wanted the support arm to stop moving underneath the gun before returning over the top.

## v508 isolated repair
- **RESTORED the v506 shotgun support arm / fixed gun-local shoulder and elbow behavior** rather than retaining v507's camera-reanchored shoulder which produced the visually oversized arm.
- Kept v506's approved shotgun `+1.15rad` left side roll, `-.21rad` yaw, and persistent hold for all shells.
- Kept v505 red hull / brass-base reload-shell actor, right-side loading target and per-shell 820ms timing.
- Eliminated the v506/v507 below-gun/chest `pouch` detour altogether.
- NEW compact, upper-only reload hand waypoints are placed in **camera/view-relative coordinates** using current shotgun rotation, position, scale and inverse quaternion, then converted into gun-local for arm and shell. This matters because gun-local +Y pointed SIDEWAYS when the gun was rolled 66°.
- Path: forward pump → compact shell pickup above receiver → pass slightly left over the top → across to right side → right loading port → return via a quadratic curve along the same upper corridor. No major up-and-out wrist reach and no underside dip.
- Removed v507's special "keep support arm articulated throughout shotgun roll recovery" branch; restored v506 arm reset when reload finishes to avoid floating skyward after final shell.
- Did **not** alter shotgun ADS, its hip size, gameplay, shell actor, weapon order or any M4 code.

## Validation already performed
- Read live top of `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, `index.html`, `src/game.js` from `main`.
- Inspected uploaded 14-second video (v507 arm regression).
- Explicitly compared original **v506** `updateShotgunReloadFX` source via GitHub commit `daede8c738107cca1ba354fa253ac08e8c8a4103` against v507 and restored v506 arm with new camera-relative path.
- Full new JS parsed successfully and guarded exact approved values: M4 zero, shotgun ADS and stats, v506 roll/yaw, visible shell actor, 820ms timing, cycle order.
- Confirmed gameplay and loader committed to GitHub main. **Visual gameplay not yet user-confirmed**.

## v508 user test
Fire 2-4 shotgun shells, then press R. Watch for:
1. Gun remains canted left at the **same approved v506 angle**.
2. No huge straight/skyward arm like v507.
3. Left hand carries clearly visible red/brass shell **close above the shotgun receiver** and inserts on its right side; never travels under it.
4. Return to foregrip is compact and connected to shoulder.
5. Shooting, hip and ADS and all other guns unchanged.

Do not declare v508 visually fixed until user tests it. If still unnatural, use user's actual video and preserve approved loading angle rather than arbitrarily moving the gun.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v507 NATURAL SHOTGUN SUPPORT ARM OVER TOP — READ FIRST

**GitHub main is the source of truth. This newest section supersedes older notes.**

## Test version and user feedback
- Current **v507** gameplay commit: `3671443142c0c4ecb14ba4ecbfe1ca4ae07b0347`; game.js blob: `af7d02c69eeeb6be2bc82503a195a6d3d1a784fb`.
- Loader `./src/game.js?v=507`; loader commit `0350eb443b436d91062afdebaffff85c6ac80386`.
- User reviewed v506 with attached 20.6s gameplay video `2026-10-09 01-32-51.mp4` and said: **"side load is good now it looks like the player arm is going under the shotgun then back over top it doesnt look natural"**.
- Keep v506's approved clear shotgun-on-left-side gun roll and the v505 visible red/brass shell and right-side port. Change ONLY support arm trajectory.
- Still unapproved visually pending user testing.

## v507 changes
- Replaced the shotgun reload arm's dip to `pouch=(-.15,-1.05,-.58)` (which passed under the gun) with an above-receiver path: home pump → `overFore=home+(.28,.36,.40)` → `overLeft=port+(-.25,.54,-.18)` → `overRight=port+(.18,.47,-.14)` → right port `atPort=port+(.15,.10,.07)`. It returns around the *same upper side* using a quadratic Bézier with overFore control instead of under the gun.
- Kept every shell actor and right-side insertion timing/waypoints from v505/v506; `overRight` and `atPort` still exactly match existing shell-path math (avoids insertion teleport).
- Anchors **support shoulder to the player's camera/body** during shotgun cant, rather than allowing the whole shoulder to roll underneath with the gun. Converts a body-space point `(-.34,-.96,-.12)` to gun-local using inverse gun quaternion, position, scale; blends it in with `shotgunReloadCant`.
- Elbow lift follows **camera-up direction** during cant, creating a bent forearm rather than an awkward rigid vertical arm.
- After the final shell, arm remains articulated briefly while the shotgun rolls back and blends seamlessly to resting arm pose; no last-shell snap.
- No changes to shotgun roll `+1.15rad` (~66°), yaw `-.21rad`, other shotgun transforms, ADS, 820ms shell timing, ammunition, sounds, M4 or any other weapon.
- Shotgun GLB still `assets/shotgun_test.glb?v=501`. Crosshair CSS still v500.
- Protected v324 recovery pointer untouched.

## Validation
- Re-read live top of `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, plus `index.html` and `src/game.js` on main.
- Inspected attached video frames.
- Full JavaScript source parsed before commit; verified exact baseline M4 zero, shotgun roll/port/shell actor, ADS and weapon order retained.
- GitHub gameplay and loader writes confirmed.
- **No live gameplay/visual inspection completed**. User must test and report actual results.

## v507 test
Fire 3-4 shotgun shells, press R. The hand should go up from the pump, carry the red shell **above** the gun, cross the receiver, insert on its right side, and return over the top to the fore-end. NO arm dropping underneath and emerging on top, and no detached shoulder or snap after last shell. Verify standard hip/ADS and all other weapons remain as before.

The user's pattern is direct implement-and-test: commit fixes to main, update handoffs, give cache-busted Pages URL. Do not ask whether to make an agreed change.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v506 SHOTGUN CLEAR LEFT-SIDE ROLL DURING RELOAD — READ FIRST

**GitHub main is authoritative. This entry supersedes older current-state handoffs.**

## User feedback and next test
- User reviewed v505 and confirmed the red reload shell is now **present**, but said the shotgun is still **not turned onto its left side** for a natural right-side reload.
- Current **v506** is committed for user testing; not yet visually approved.
- Gameplay commit: `daede8c738107cca1ba354fa253ac08e8c8a4103`.
- Gameplay blob: `25fae6d16bc9b1c303a7079c5e0dff6e9e9f631a`.
- Loader: `./src/game.js?v=506`, index commit `b81f6661aaf0b10fdfdd553ccb8f63491f0958c5`.
- Shotgun model still `assets/shotgun_test.glb?v=501`, CSS still v500, first-person ADS still v503.

## v506 shotgun-only changes
- Previous v505 shotgun reload: `+.40rad` / ~23° roll and `-.09rad` yaw; barely visibly on its side.
- NEW: `gun.rotation.z=1.15*shotgunCant` (~66° positive roll **onto its LEFT side**) while `gun.rotation.y=-.21*shotgunCant` shows the receiver's right (+X) loading-port wall to the player. Small localized position changes `x+=.095*shotgunCant`, `y+=.045*shotgunCant`, `z+=.055*shotgunCant`, `rotation.x+=.035*shotgunCant` keep right-side loading area readable and shotgun held near firing hand.
- Persistent reload blend approaches 1 with damping rate 12 while loading and decays at 6.5 after finish. Hold through multi-shell reload; do NOT tie it to per-shell `rp.arch`.
- Existing right firing-hand grip pivot stays in place; shotgun, support arm and shell actor rotate together.
- Visible red/brass shell actor and over-the-top shell path from v505 **untouched**, as are 820ms shell timing and ammo increments.
- M4, other guns, crosshair circle, shotgun ADS, stats, keybinds and protected v324 recovery **untouched**.

## Verification and pending validation
- Read newest handoff entries at top of both docs, recovery checkpoint, `index.html`, `src/game.js` on `main` before changes.
- Full updated JS passed parser check; verified protected M4 ADS zero, shotgun ADS/stats/weapon order, and v505 shell animation remained present.
- Committed both gameplay and loader on `main`.
- **User still needs to visually test**: fire 2–4 shells, press R; right side should face toward them as gun rolls left and stays there during over-top insertion, then smoothly returns when finished.

Do not claim v506 visual fix approved until tested. Scope further adjustments to shotgun only. Always commit to GitHub and deliver cache-busted live game URL.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v505 OVER-TOP SHOTGUN SHELL RELOAD / VISIBLE SHELLS — READ FIRST

GitHub `main` is authoritative. This newest section supersedes older current-state notes below.

## Current TEST build (not user-approved yet)
- Version **v505**, loader `./src/game.js?v=505`.
- Latest gameplay commit: `09e9c48b94aa11f296795511cf84d64e8f10c0c2`; blob `e2be8a84a81da1ffc6e103b6743afa3ffc610ccf` (the previous v505 base gameplay commit was `a4c8252ed613fb86f46d603ddef20fd169650bb7`).
- Loader commit: `28bdccb1ca8cbce47d762bbe1f4e93c2e41548cd`.
- Shotgun GLB remains `assets/shotgun_test.glb?v=501`, unchanged.
- v500 reticle, approved M4 transforms/stats, and v497 key lineup preserved.
- Protected v324 recovery not modified.

## User's v504 test video and feedback
User uploaded video `2026-10-09 01-17-17.mp4` (30.47 seconds), and said "doesnt look natural should be loaded over top and it doesnt show the shells being loaded either." Inspected gameplay frames: v504 had an exaggerated tilted gun and a visually missing red shell, despite code cloning the GLB's separate shell. The arm appeared over-extended.

## v505 changes (shotgun only)
- Reduced persistent full-reload left roll from `+.70` to `+.40` radians (~23 degrees), yaw magnitude from `-.17` to `-.09`, and X pitch/additional position offsets. Gun stays canted between successive shell cycles and returns smoothly when finished.
- Shotgun-only left shoulder start point moved nearer the weapon `(-.27,-.99,-.43)`, reducing unnaturally long support-arm geometry.
- New per-shell hand path: leave pump → low body pouch → rise on the **LEFT/OVER THE TOP of the receiver** → cross the top → descend to right receiver loading port → return to pump. A modeled elbow bend/anchored shoulder is used instead of generic offset movement.
- **Guaranteed visible shell:** v503/v504 attempted to clone the original GLB loose shell, but its actor did not appear in user footage. The real shotgun GLB and `shotgunShellTemplate` are preserved; the *moving reload shell actor* is now a 3D red hull with brass base and primer, sized ~.22 units, carried ahead of the glove and physically slid toward the right-side port. No fake floating shell at idle.
- Per-shell timing changed `Math.max(360,560-reloadLevel*45)` to `Math.max(580,820-reloadLevel*45)` for visible, readable insertion. Ammo count increments once at end of each shell cycle as before.
- Follow-up continuity fix: the visible shell insertion path at p=.77 now starts at the *exact same position* as the over-top carry, preventing a shell teleport at the transition.
- Crosshair/ADS and all other weapons untouched.

## Validation
- Read latest `CITY_OUTBREAK_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, `CURRENT_RECOVERY_CHECKPOINT.md`, `index.html`, and `src/game.js` on main first.
- Inspected user video and high-res reload frames.
- Confirmed game.js parses with a JS function parser before commit; protected M4 ADS zero `.040`, shotgun ADS, shotgun weapon stats, weapon order, and 72px reticle source present.
- GitHub gameplay & index writes confirmed. **No live browser playback verified; user must test appearance**.

## v505 test instructions
Fire 2–4 shots, then press R. Confirm shotgun slightly cants left, **red/brass shell rises above receiver and crosses over the top**, is visibly inserted through the RIGHT-side loading port, and repeats cleanly for each missing shell. Confirm that arm doesn't become a long stalk, gun doesn't over-roll, and returns to hip-ready orientation after completion. Record video if shell still fails to appear.

Keep M4 completely untouched. Continue making direct GitHub commits and provide cache-busted Pages test links. Do not send the user a plan instead of making the code change.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v504 SHOTGUN LEFT CANT / RIGHT-SIDE TUBE RELOAD — READ FIRST

GitHub `main` is authoritative. This top section supersedes all older current-state notes.

## Latest user direction
User approved the v503 shotgun direction ("ok i like it") and asked for the shotgun itself to be turned **onto its left side during reload**, exposing its **right-side shell-loading area**. They explicitly want implementation in GitHub, not more proposals/questions.

## Latest test build — NOT YET USER-CONFIRMED
- v504: `./src/game.js?v=504` via `index.html`
- v504 gameplay commit: `8e6f83e9dcd22417a456ac8234db38d4cbab2f30`
- v504 game blob: `0da91e4e0adeb9bcf635b45168ebbe65d64a7244`
- Loader commit: `98931d10f6e3083195e709d560002f27ca5453cb`
- Shotgun GLB remains `assets/shotgun_test.glb?v=501`.
- CSS stays v500; no changes.
- v503 shotgun model/ADS/hand targets/right-side shell-by-shell behavior preserved.
- v497 weapon order, approved M4, and protected v324 recovery untouched.

## Isolated v504 change
- Added persistent `shotgunReloadCant` state, smoothly damped in/out in the main `move(dt)` weapon transform, and reset when rebuilding weapons.
- The shotgun now rolls **+0.70 radians (~40 degrees)** left (positive Z) with a slight **-0.17 rad Y yaw**, making the right (+X) side of the receiver more visible.
- Gun and both arms are repositioned to pivot about the actual measured right firing-hand grip. Gun-local shell actor and support-hand targets follow the rotated gun, rather than remaining in an upright orientation.
- The roll stays held through all shells, **not** driven by the per-shell `rp.arch` cycle (which reset every 560ms and made the gun snap upright between rounds).
- After the final shell, gun slowly returns to its normal ready orientation. Right hand keeps the grip without per-shell bobbing.
- Original `updateShotgunReloadFX` hand/body/right-side port path, GLB shell actor, sound, reload timing and ammo increments remain intact.
- All other weapons still use their exact pre-v504 reload transforms.

## Validation
- Re-read top of both handoff documents, current recovery pointer, index.html and game.js from latest `main`.
- Patched only the shotgun-specific transform code and state plus neutral right-hand grip during shotgun reload.
- Parsed the complete edited game.js with JavaScript syntax parser (PASS).
- Verified unchanged M4 `RIFLE_ADS_ZERO_Y=.040`, shotgun ADS `z:-.30`, shotgun 8-pellet stats, weapon cycle order and shell animation code.
- Damping continuity calculation showed smooth progression (not resetting each shell).
- No browser gameplay/visual confirmation yet; do not claim user-approved or visually verified.

## User test focus
Fire 2–4 shells, press R:
1. Shotgun tilts to its left and visibly presents the right receiver side;
2. right hand holds grip, left hand feeds each shell into right-side loading area;
3. gun stays on its left side through multiple shells instead of bouncing each cycle;
4. returns naturally to hip-ready orientation afterward;
5. normal hip/ADS, firing, ammo count, and reticle unchanged.

Preserve approved M4 work. Make further adjustments only in response to user's actual test feedback.

---

# NEW-CHAT HANDOFF — 2026-10-09 — v503 SHOTGUN ADS WIDTH / GEOMETRY HANDS / RIGHT-SIDE SHELL RELOAD — READ FIRST

GitHub `main` remains authoritative. This top section supersedes prior current-state notes.

## Current unapproved test build
- **v503**
- Loader: `./src/game.js?v=503`
- Shotgun source model: `assets/shotgun_test.glb?v=501` (unchanged)
- Gameplay commit: `dcfdaf04c87e7daddcfefb241d353b5ecf1e574d`
- Gameplay blob SHA: `b1d36a93e9cf9c5362df9f5e46b9d6e694721e5e`
- Loader commit: `b8c60a0b23b9ae94371052e11e8683b186f99029`
- CSS still v500 (no change).
- Protected recovery remains v324, unchanged.

## User video and specific complaints (2026-10-09)
From a 38-second user video of v502:
1. The shotgun looked too slim in ADS.
2. Both hands still looked wrong, not placed naturally.
3. This specific shotgun takes shells on the **RIGHT side**, so reload must not be on the left/bottom.

## v503 isolated modifications
- Shotgun ADS no longer scales down by the global 16%. Shotgun-specific ADS scale loss is now just 4.5% while all other weapon values are preserved.
- Shotgun ADS depth changed from `z:-.48` to `z:-.30` to keep more of the receiver/wood stock visually readable without moving the sight sideways.
- Hands are measured from actual imported model geometry. Real `pump` and `trigger` bounding-box centers (transformed into gun space) are used for the left support and right firing hands, with conservative spatial clamps. Fallback positions are `left [.35,-.45,-1.80]`, `right [.40,-.48,-.88]` if the nodes are absent.
- A right-hand SIDE (+X) loading-port target is derived from the real `inserter`/trigger part.
- Each 560ms shotgun shell reload now animates the **left support hand** from pump down to body and across to the right-side loading port, inserting and returning to pump. The right firing hand stays on grip.
- Existing fixed-shoulder, articulated upper/forearm helper is reused to prevent translating the whole shoulder.
- The source GLB's exact `shell` node, previously saved as `shotgunShellTemplate` in v502, is cloned and normalized into a visible per-shell reload actor; the floating idle shell remains hidden.
- Shell actor cleanup on reload finish, rebuild, and per-shell intervals.
- Shotgun reload timing, ammo increments, sound, stats and other weapons unchanged.

## Validation already performed
- Fetched latest GitHub main handoff/recovery/index/game before code changes.
- User video inspected.
- Game source JavaScript syntax parsed successfully before commit.
- Preserved exact `RIFLE_ADS_ZERO_Y=.040`, weapon-cycle order, and shotgun stats.
- Committed gameplay and loader to `main`; live visual test remains **pending user review**.
- This is a first test pass for real shell choreography. Do not call the hand grip, ADS size or insertion location approved until user checks it on screen.

## v503 test target
1. ADS shotgun receiver/stock looks fuller, but sights remain aligned with hits.
2. The left hand grips the real pump; right grips trigger/stock and neither floats.
3. Press R with 1–3 shells missing: support arm reaches down for each shell, visibly brings the model shell to the **right side** of receiver, inserts, and returns.
4. Confirm ammo increments once per shell, no red shell hanging under idle receiver, no arm jump between shell cycles.
5. Confirm M4 work and v497 key order unchanged.

Keep work scoped to shotgun only until user approves. If a visual correction is needed, inspect new video/screenshots before adjusting geometry again.

---

# NEW-CHAT HANDOFF — 2026-10-08 — v502 SHOTGUN HAND ALIGNMENT / LOOSE SHELL CLEANUP — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v502**
- Loader: `./src/game.js?v=502`
- Shotgun asset remains `assets/shotgun_test.glb?v=501`
- v502 gameplay commit: `840303d5c3733e2269580ea43d16ee78755e1c07`
- v502 game blob: `8d6e3d6dda4c4b4dbb5c1f68ae7081f44d5640a6`
- v502 loader commit: `c7de27c9501e0ece2b66f65709a1b219e288d93f`
- v501 GLB replacement remains the model baseline.
- v500 shotgun reticle remains preserved.
- v498 shotgun starting loadout remains approved.
- v497 weapon order remains approved.
- M4 remains locked/preserved.
- Protected recovery remains **v324** unchanged.

## Why v501 needed correction
User screenshot showed:
- support hand/arm was too low/far forward and did not actually grip the pump;
- firing hand was also too low relative to the real trigger/grip area;
- the GLB's loose source shell was permanently visible/floating under the receiver.

## v502 isolated corrections

### Real-geometry hand alignment
Shotgun hand pose changed from:
- left `[.17,-.43,-1.83]`
- right `[.36,-.61,-.72]`

to:
- left `[.34,-.30,-1.18]`
- right `[.39,-.40,-.82]`

These targets were chosen from the actual transformed GLB geometry:
- left hand moves onto the real pump/fore-end region;
- right hand moves up toward the real trigger/grip region.

### Loose shell removed from idle shotgun
The source GLB's separate real node:
- `shell` / `shell_shotgun_0`

is no longer visible on the idle viewmodel.

The exact shell node is cloned before hiding and retained as:
- `shotgunShellTemplate`

That template is intentionally reserved for the next mechanical step:
- shell-by-shell reload actor;
- spent-shell ejection during the real pump cycle.

Do **not** replace it with generic procedural shell geometry unless required.

## Not changed in v502
- shotgun model scale/placement;
- shotgun ADS transform;
- shotgun reticle:
  - 72 px hip circle;
  - hidden in ADS;
- shotgun mechanics:
  `rate:520, spread:.090, pellets:8, body:.72, recoil:.22, baseMag:8`
- M4 and all approved weapon work.

## Validation
- required current handoff/recovery/index/game files re-read before editing;
- user screenshot inspected;
- source GLB geometry/hierarchy re-checked;
- committed v502 source passed syntax parse;
- updated shotgun hand pose exists exactly once;
- real shell clone exists exactly once;
- idle source shell hide exists exactly once;
- v500 reticle, shotgun stats, and M4 `.040` zero remain unchanged.

## v502 user test target
Check:
1. support hand now actually contacts/grips the wooden pump;
2. firing hand sits naturally at trigger/grip;
3. no loose red shotgun shell floats under the receiver;
4. model placement and reticle remain unchanged.

Once hand placement is approved, use `shotgunShellTemplate` for proper shell loading/ejection tied to pump mechanics.

Do not mark v502 confirmed-good until user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-08 — v501 SHOTGUN GLB REPLACEMENT TEST — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v501**
- Loader: `./src/game.js?v=501`
- Shotgun asset: `assets/shotgun_test.glb?v=501`
- v501 gameplay commit: `ca424f13dba0d8320aabf21d9111127f1f877026`
- v501 game blob SHA: `9f8b7a3106324d2deacddce25b7e8d0213bf3fd0`
- v501 loader/index commit: `3f2b7cdc7d083d98c51dabff1d83f90610062810`
- v500 shotgun reticle behavior is preserved.
- v498 shotgun starting loadout remains approved.
- v497 weapon order remains approved.
- M4 remains locked/preserved.
- Protected recovery remains **v324** unchanged.

## Uploaded shotgun GLB inspection
Exact asset:
- `assets/shotgun_test.glb`
- size: 4,800,952 bytes
- glTF 2.0
- 14 nodes
- 5 meshes
- 0 animations
- 0 skins

Named real parts:
- `base`
- `shell`
- `trigger`
- `inserter`
- `pump`

The model is static, but those parts are separate nodes and are intentionally retained for future pump/reload animation work.

## v501 isolated change — replace shotgun model
- old procedural shotgun geometry removed;
- uploaded `shotgun_test.glb` is now the sole visible shotgun model;
- source barrel points +Z, so the viewmodel is rotated 180° around Y to face game-forward -Z;
- model is normalized at runtime to a **3.25-unit overall shotgun length**;
- initial placement preserves the old shotgun footprint approximately:
  - center X `.36`
  - center Y `-.32`
  - center Z `-1.70`
  - muzzle remains around the prior ~`-3.3` first-person depth;
- real pump/shell/trigger/inserter nodes are saved for future animation.

## Preserved
No shotgun gameplay mechanics changed:
`rate:520, spread:.090, pellets:8, body:.72, recoil:.22, baseMag:8`

Also preserved:
- v500 72 px hip circle;
- reticle hidden during shotgun ADS;
- shotgun active starting loadout;
- M17 on key 1 / shotgun key 3;
- all approved M4 work;
- `RIFLE_ADS_ZERO_Y=.040`.

## Validation
- required handoff/recovery/index/game files re-read first;
- deployed Pages artifact used to inspect the actual binary GLB;
- GLB hierarchy and authored axis verified;
- committed v501 source passed syntax parse;
- old procedural shotgun branch no longer exists;
- shotgun GLB loader exists exactly once;
- real pump reference exists;
- shotgun stats and v500 reticle behavior unchanged.

## v501 user test target
Check only the new shotgun model:
1. correct orientation (barrel forward);
2. reasonable hip-fire size and position;
3. no old procedural shotgun geometry visible;
4. ADS remains functional;
5. hands still appear with the shotgun.

Do not call v501 confirmed-good until user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-08 — v500 WIDER SHOTGUN HIP CIRCLE / HIDE IN ADS — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v500**
- Loader: `./src/game.js?v=500`
- CSS: `./src/game.css?v=500`
- v500 gameplay commit: `c980e88056b1fddbd73aa32ba84783a8cb002145`
- v500 game blob SHA: `84470aa33f616fe937e58d0d0fb98db251a215c5`
- v500 CSS commit: `0d4d46e3cc886bfc0c451ec811be8bc2f36da2b7`
- v500 CSS blob SHA: `2f2e4a78f551c1d51f52d38e8d73016af6752f20`
- v500 loader/index commit: `1e77a31ae39ed384426e67aef14b97dea4299573`
- v499 was tested and rejected only because the hip circle needed to be wider and the reticle should disappear in ADS.
- v498 shotgun starting loadout remains approved.
- v497 weapon order remains approved.
- M4 remains locked/preserved.
- Protected recovery remains **v324** unchanged.

## v500 isolated shotgun reticle correction
Shotgun only:
- hip-fire reticle remains a circle;
- hip-fire diameter increased from **54 px** to **72 px**;
- shotgun reticle now disappears completely whenever ADS is active;
- the old `+` bars remain disabled for the shotgun.

Other weapons keep their previous reticle behavior.

## Important: shotgun mechanics unchanged
The actual shotgun definition remains:
`shotgun:{name:"SHOTGUN",rate:520,hold:9999,spread:.090,pellets:8,body:.72,recoil:.22,baseMag:8}`

No changes to:
- pellet spread;
- damage;
- recoil;
- ADS transform;
- model;
- sound;
- reload behavior.

## Preserved approved state
- Shotgun active on spawn;
- M17 unlocked;
- M4 locked/not in spawn loadout;
- approved v497 number-key order;
- all approved M4 shooting/ADS/reload work;
- `RIFLE_ADS_ZERO_Y=.040`.

## Validation
- required current handoff/recovery/index/game/CSS files were re-read before editing;
- committed game source passed syntax parse;
- shotgun hip reticle is exactly 72 px in source/CSS;
- shotgun reticle uses ADS visibility off;
- shotgun mechanics definition is unchanged;
- M4 ADS zero is unchanged.

## v500 user test target
With the shotgun:
1. hip-fire shows a noticeably wider circular reticle;
2. pressing ADS makes the reticle disappear completely;
3. releasing ADS restores the wide circle;
4. M17 and other weapon reticles are unchanged.

Do not mark v500 confirmed-good until the user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-08 — v499 SHOTGUN CIRCLE RETICLE TEST — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v499**
- Loader: `./src/game.js?v=499`
- CSS: `./src/game.css?v=499`
- v499 gameplay commit: `68183e7df95381c96a7a3064647d84d1e369129e`
- v499 game blob SHA: `cb0b5ee94ad038d9f2fb0a4c2c4e7ca9dc1771ac`
- v499 CSS commit: `e7b8d63e6eae59392a8431c7948b482cb8c762da`
- v499 CSS blob SHA: `637027f71689438e46cee56d2cde34b18a7cb848`
- v499 loader/index commit: `3ae68aa4111cc4eb187651e58e80e0ddea7722ef`
- v498 shotgun starting loadout was user-approved as **perfect** before this reticle change.
- v497 weapon-slot lineup remains user-confirmed good.
- M4 work remains locked/preserved.
- Protected recovery remains **v324** unchanged.

## v499 isolated shotgun change — circular crosshair
User requested the shotgun crosshair be a circle rather than a `+`, because hip-fire represents a wider pellet spread than ADS.

Shotgun reticle now:
- uses a white circular outline;
- hides the old horizontal/vertical `+` bars;
- stays visible during shotgun ADS instead of disappearing;
- smoothly shrinks with `aimBlend`.

Current visual sizes:
- hip-fire: **54 px** diameter;
- full ADS: **24 px** diameter.

Exact size interpolation:
`THREE.MathUtils.lerp(54,24,aimBlend)`

Other weapons keep the prior crosshair behavior:
- normal `+` when hip-firing;
- crosshair hidden during ADS where that was already the behavior.

## Important: no shotgun mechanics changed yet
The actual shotgun definition remains exactly:
`shotgun:{name:"SHOTGUN",rate:520,hold:9999,spread:.090,pellets:8,body:.72,recoil:.22,baseMag:8}`

No pellet spread, damage, recoil, ADS transform, model, sound, or reload behavior changed in v499.

## Preserved approved state
- temporary shotgun tuning loadout from v498:
  - Shotgun active on spawn;
  - M17 unlocked;
  - M4 locked/not in spawn loadout;
- approved v497 number-key lineup;
- M4 `RIFLE_ADS_ZERO_Y=.040`;
- all approved M4 transforms/reload work.

## Validation
- required current handoff/recovery/index/game/CSS files were re-read before editing;
- committed game source passed syntax parse;
- dynamic shotgun reticle helper exists exactly once;
- 54→24 px interpolation exists exactly once;
- shotgun circle CSS exists exactly once;
- shotgun `+` pseudo-elements are disabled exactly once;
- shotgun mechanics definition remains unchanged;
- M4 `.040` ADS zero remains unchanged.

## v499 user test target
With the shotgun:
1. hip-fire reticle is a **circle**, not a `+`;
2. hip circle is visibly wider;
3. hold ADS and the circle smoothly tightens;
4. the circle remains visible in ADS;
5. switch to M17 and confirm its old crosshair behavior is unchanged.

Do not mark v499 confirmed-good until the user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-08 — v498 SHOTGUN TUNING START LOADOUT — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v498**
- Loader: `./src/game.js?v=498`
- v498 gameplay commit: `bd21b29dee421163ba18930b7d455a9db0aad0a2`
- v498 game blob SHA: `1bf441ec33f2e6bf608ea260fe1659ad13828fd6`
- v498 index/loader commit: `521421204228a17251da9bd03b7d86ff9c41aecd`
- v497 weapon-slot lineup remains user-confirmed good.
- **M4 work is locked/preserved; shotgun is now the active tuning focus.**
- Protected recovery remains **v324** unchanged.

## v498 isolated change — temporary shotgun tuning loadout

The user asked to shift focus to the shotgun and work on it the same way the M4 was tuned.

Temporary starting loadout is now:
- **M17 unlocked**
- **Shotgun unlocked**
- **Shotgun active on spawn**
- **M4 locked / not in starting loadout**

Initial active state:
- `weapon="shotgun"`
- `magSize=8`
- shotgun ammo remains `8 / 30`

Both the initial game state and the full reset/new-run state use this same loadout.

The visible starting HUD was updated to:
- `8 / 30`
- `SHOTGUN`

## Approved v497 weapon slots preserved
1. M17
2. M4
3. Shotgun
4. MP5
5. M240
6. DMR
7. Grenade Launcher
8. AWM

Mouse-wheel order remains the same approved lineup.

## M4 preservation rule
Do not change the approved M4 work while tuning the shotgun unless the user explicitly asks.

In particular, preserve:
- M4 asset and transforms;
- approved v484 shooting/ADS baseline;
- `RIFLE_ADS_ZERO_Y=.040`;
- v496 reload timing/choreography;
- physical M4 mag drop/body pickup/insertion/charging work.

The M4 can still be unlocked through the store; it is simply removed from the temporary spawn loadout during shotgun tuning.

## Current shotgun baseline before new tuning
Current shotgun definition remains unchanged in v498:
`shotgun:{name:"SHOTGUN",rate:520,hold:9999,spread:.090,pellets:8,body:.72,recoil:.22,baseMag:8}`

No shotgun transforms, ADS, damage, recoil, spread, sound, or reload behavior were changed yet. v498 changes only which weapons the player starts with.

## Validation
- required handoff/recovery/index/game files were re-read before editing;
- committed v498 game source passed syntax parse;
- initial and reset loadouts both resolve to Shotgun + M17 with M4 locked;
- v497 hotkey map remains unchanged;
- M4 `.040` ADS zero remains unchanged;
- starting HUD matches shotgun active state.

## v498 user test target
Start/restart a run and verify:
1. player starts holding the Shotgun;
2. Shotgun is available on key 3;
3. M17 is available on key 1;
4. M4 is not unlocked at spawn;
5. all approved v497 key assignments remain correct.

Once confirmed, continue shotgun tuning one isolated change at a time.

Do not mark v498 confirmed-good until the user tests it.

---

# USER-CONFIRMED GOOD — 2026-10-08 — v497 WEAPON SLOT LINEUP APPROVED

The user tested v497 and replied **"great"**.

Treat v497 weapon-slot mapping as approved/current:
1. M17
2. M4
3. Shotgun
4. MP5
5. M240
6. DMR
7. Grenade Launcher
8. AWM

Mouse-wheel cycling uses the same order.

No gameplay code changed in this confirmation update.

---

# NEW-CHAT HANDOFF — 2026-10-08 — v497 WEAPON SLOT REMAP TEST — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v497**
- Loader: `./src/game.js?v=497`
- v497 gameplay commit: `03d87497e1a70a18ced026eeaef60649b8dd5a3a`
- v497 loader commit: `d02ff2d926b2b0277944468c9639dcabf9efadad`
- v497 game blob SHA: `7e62e938c05e7d44a0d8f87c8bc78ae45052cdeb`
- v496 reload behavior is otherwise preserved exactly.
- **v484 remains the last user-confirmed good shooting/ADS baseline.**
- Protected recovery remains **v324** unchanged.

## v497 isolated change — weapon lineup / key binds

Requested number-key mapping is now:

1. M17 SIG — `pistol`
2. M4 CARBINE — `rifle`
3. Shotgun — `shotgun`
4. MP5 — `smg`
5. M240 LMG — `m240`
6. DMR — `dmr`
7. Grenade Launcher — `grenadeLauncher`
8. AWM ULTIMATE — `awm`

Exact hotkey map:
`{Digit1:"pistol",Digit2:"rifle",Digit3:"shotgun",Digit4:"smg",Digit5:"m240",Digit6:"dmr",Digit7:"grenadeLauncher",Digit8:"awm"}`

Mouse-wheel cycle order was changed to the same lineup:
`["pistol","rifle","shotgun","smg","m240","dmr","grenadeLauncher","awm"]`

The controls modal already said only `Weapons 1 — 8`, so no stale per-weapon labels existed there.

## Preserved from v496
- M4 reload timing remains `Math.max(1450,1800-reloadLevel*70)`;
- anchored/articulated M4 support arm remains;
- physical old-mag drop/settle remains;
- body pickup, measured insertion, staged charging remain;
- M4 asset unchanged;
- `RIFLE_ADS_ZERO_Y=.040` unchanged.

## Validation
- required current handoff/recovery/index/game files were re-read first;
- committed v497 source passed syntax parse;
- requested hotkey map exists exactly once;
- requested wheel order exists exactly once;
- M4 ADS zero and reload timing remain unchanged.

## v497 user test target
Verify number keys:
- 1 M17
- 2 M4
- 3 Shotgun
- 4 MP5
- 5 M240
- 6 DMR
- 7 Grenade Launcher
- 8 AWM

Also verify mouse-wheel cycling follows that same order, skipping locked weapons as before.

Do not call v497 confirmed-good until user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-08 — v496 FASTER M4 RELOAD TIMING TEST — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v496**
- Loader: `./src/game.js?v=496`
- M4 asset unchanged: `assets/ar-15_style_rifle.glb?v=466`
- v496 gameplay commit: `16e6d959ec69e9afd20314ff7a1d2b59fb71fcc0`
- v496 loader commit: `1c6e43ea921efa8ce4681c2b1e5e519880895dfa`
- v496 `src/game.js` blob SHA: `b25f69adf2a053ceb6599320e205097d446a601a`
- v485-v495 were tested and rejected for reload behavior.
- **v484 remains the last user-confirmed good shooting/ADS baseline.**
- Protected recovery remains **v324** unchanged.

## Why v495 was rejected
User said the reload still felt too slow.

## v496 isolated correction
Only M4 reload duration changed.

Previous:
`Math.max(1700,2200-reloadLevel*90)`

Now:
`Math.max(1450,1800-reloadLevel*70)`

Base M4 reload is now about **1.8 seconds** instead of 2.2 seconds.

Everything else from v495 is intentionally preserved:
- anchored shoulder / articulated elbow and forearm;
- body/belt reach;
- physical dropped-mag fall and ground settle;
- off-body loaded spare pickup;
- measured geometry-guided insertion;
- staged charging choreography;
- bolt travel `24 Z`;
- charging-handle travel `30 Z`.

## Locked v484 M4 values preserved
Do not change:
- hip `.54,-.56,-1.48`
- pitch `-8°`
- yaw `0°`
- roll `-6°`
- ADS FOV `48`
- `RIFLE_ADS_ZERO_Y=.040`
- rate `105`
- hold `190`
- spread `.004`
- body `1`
- recoil `.105`
- base mag `12`.

## Validation
- required current files re-read before edit;
- committed v496 source passed syntax parse;
- timing marker exists exactly once;
- approved ADS zero, M4 asset, articulated arm helper, bolt travel, and charging-handle travel remain unchanged.

## v496 test target
Reload with **R** and verify the reload now feels fast enough while preserving the v495 physical choreography.

Do not mark v496 good until user approves it.

---

# NEW-CHAT HANDOFF — 2026-10-08 — v495 ANCHORED M4 ARM REACH / FASTER RELOAD TEST — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v495**
- Loader: `./src/game.js?v=495`
- Active M4 asset unchanged: `assets/ar-15_style_rifle.glb?v=466`
- v495 gameplay commit: `9cab9f61d2fe3e05f22b26b1a77e57b84384c6ad`
- v495 loader commit: `1124711cf9bef9dff37374c60b3197ba2f85eba9`
- v495 `src/game.js` blob SHA: `a4294ace71915123e69f8c7e5c8846a5c7a7d17f`
- v485-v494 were tested and rejected for reload behavior.
- **v484 remains the last user-confirmed good shooting/ADS baseline.**
- Protected recovery remains **v324** unchanged.

## Why v494 was rejected

User reported:
1. the player arm still did not visually reach the player's body/belt;
2. the reload had become too slow.

The key structural cause was found in the procedural arm implementation:
- the previous M4 reload moved the entire left-arm group;
- shoulder, upper arm, forearm, and hand translated together;
- therefore the hand could move downward, but the shoulder moved with it, so the arm never visually stretched from the player into a belt/body reach.

## v495 isolated correction

### Shoulder now stays anchored to the player
The left M4 support arm now has explicit articulated references:
- fixed left shoulder;
- base elbow;
- base hand position;
- upper-arm mesh;
- forearm mesh;
- hand geometry.

During M4 reload:
- shoulder stays fixed;
- elbow is solved between shoulder and the target hand position with a bend bias;
- upper arm and forearm cylinders are reoriented/rescaled to their live endpoints;
- hand geometry moves to the solved hand position;
- after reload the normal approved hand/arm pose is restored.

The magazine-follow phase now drives the **articulated hand position** instead of translating the whole left arm group.

### Body/belt target corrected
M4 body/pouch hand offset changed from:
- `(-.42,-1.15,-.18)`

to:
- `(-.32,-.95,1.15)`

Because negative Z is forward in this first-person setup, the old target was still far out in front of the player. The new +Z offset brings the hand back toward the torso/belt area while keeping it low.

### Reload speed corrected
M4 duration changed from:
- `Math.max(2200,2800-reloadLevel*90)`

to:
- `Math.max(1700,2200-reloadLevel*90)`

Base reload is now about **2.2 seconds** instead of 2.8 seconds.

The deliberate charging sequence from v494 is preserved.

## Preserved from v494
- empty mag falls, bounces lightly, settles on ground, remains visible;
- fresh loaded mag is created only after the hand reaches the body/pouch phase;
- measured geometry-guided magazine insertion;
- slower staged charging action;
- bolt travel `24` authored Z units;
- charging handle travel `30` authored Z units.

## Locked v484 M4 values preserved
Do not change unless explicitly asked:
- hip `.54,-.56,-1.48`
- pitch `-8°`
- yaw `0°`
- roll `-6°`
- ADS FOV `48`
- `RIFLE_ADS_ZERO_Y=.040`
- rate `105`
- hold `190`
- spread `.004`
- body damage `1`
- recoil `.105`
- base mag `12`
- asset `assets/ar-15_style_rifle.glb?v=466`

## Validation
- current main and required handoffs/recovery files were re-read before editing;
- v495 committed source passed a module-safe syntax parse after stripping static import lines;
- post-write checks confirmed exactly one copy of:
  - `RIFLE_ADS_ZERO_Y=.040`;
  - unchanged M4 asset path;
  - articulated M4 left-arm helper;
  - articulated reset helper;
  - fixed shoulder capture;
  - magazine-to-articulated-hand follow;
  - 2.2 s rifle reload timing;
  - preserved bolt/charging-handle travel.

## v495 user test target
Reload with **R** and verify:
1. shoulder stays visually connected to player;
2. elbow bends and hand actually reaches back toward the body/belt;
3. fresh mag comes back from that body reach;
4. reload no longer feels excessively slow;
5. dropped empty mag still reaches/settles on ground;
6. charging still reads as deliberate rather than twitchy;
7. approved v484 hip/ADS/shot alignment remains unchanged.

Do not call v495 confirmed-good until the user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-08 — v494 PHYSICAL / SLOWER M4 RELOAD TEST — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v494**
- Loader: `./src/game.js?v=494`
- M4 asset unchanged: `assets/ar-15_style_rifle.glb?v=466`
- v494 gameplay commit: `686f0fb16e813a7eb17787ecadd02f28502b1173`
- v494 loader commit: `716762798d87a75327dea2dfa352dfc5fd018c8e`
- v494 `src/game.js` blob SHA: `d3d234e45f7e79d7e88b3bc6fc961521aded2e6f`
- v485-v493 were tested and rejected for reload behavior.
- **v484 remains the last user-confirmed good shooting/ADS baseline.**
- Protected recovery remains **v324** unchanged.

## Why v493 was rejected

User supplied a new video and reported three immersion problems:
1. the empty magazine should visibly fall all the way to the ground;
2. the fresh magazine still appeared magically in the support hand instead of coming from the player/body;
3. the M4 charging action looked fake and too fast.

Frame-by-frame review confirmed the charging portion occupied only a very short fraction of the ~1.55 s rifle reload.

## v494 isolated M4 reload changes

### Empty magazine now physically falls and settles
- discarded M4 mag lifetime increased from ~2.15 s to **8 s**;
- initial drop impulse reduced so it falls naturally rather than being thrown away;
- spin reduced;
- reload-mag ground impacts are counted;
- after one/two small impacts the mag:
  - stops translating;
  - stops spinning;
  - stays settled at ground height;
- it remains visible on the ground for several seconds.

### Fresh magazine now comes from below the player view
- M4 pouch/body offset moved farther down/off-screen:
  `(-.42,-1.15,-.18)`
- fresh spare is **not created until p=.50**, after the empty support hand has already moved below the visible frame;
- there is no visible spare before that moment;
- loaded spare is created at the off-screen body/pouch position;
- the same magazine then rises into view already in the hand;
- measured v491 geometry still controls carry and magwell insertion.

### M4 reload slowed for immersion
- rifle reload timing changed from roughly:
  `Math.max(1150,1550-reloadLevel*90)`
- to:
  `Math.max(2200,2800-reloadLevel*90)`
- base reload is therefore about **2.8 s** before reload-speed upgrades.

### Charging rebuilt as readable beats
After mag seating:
1. hand deliberately reaches the charging handle;
2. handle/bolt pull rearward;
3. short rearward hold;
4. controlled forward release;
5. hand returns to the fore-end.

Model travel was reduced from exaggerated v493 values:
- bolt: `34 -> 24` authored Z units
- charging handle: `42 -> 30` authored Z units

This should read as deliberate physical manipulation instead of a snap/twitch.

## Locked v484 M4 values preserved
Do not change unless user explicitly asks:
- hip `.54,-.56,-1.48`
- pitch `-8°`
- yaw `0°`
- roll `-6°`
- ADS FOV `48`
- `RIFLE_ADS_ZERO_Y=.040`
- rate `105`
- hold `190`
- spread `.004`
- body damage `1`
- recoil `.105`
- base mag `12`
- asset `assets/ar-15_style_rifle.glb?v=466`

## Validation
- user v493 clip reviewed frame-by-frame;
- exact deployed v493 Pages artifact used as local patch base;
- local v494 passed `node --check`;
- local Git blob SHA:
  `d3d234e45f7e79d7e88b3bc6fc961521aded2e6f`
- GitHub committed blob matched exactly;
- post-write checks confirmed locked ADS zero, unchanged M4 asset, 2.8 s reload timing, off-screen spare creation, settling dropped-mag physics, and reduced/slower charge travel.

## v494 user test target
Reload with **R** and verify:
1. empty mag visibly falls all the way to ground;
2. it bounces/settles and remains there;
3. empty hand disappears below view before a fresh mag appears;
4. loaded spare rises naturally from below the player/body with the hand;
5. same spare inserts into the M4;
6. charging is slower and reads as reach → pull → hold → release;
7. no fake snap/twitch;
8. approved v484 hip/ADS/shot alignment remains unchanged.

Do not call v494 confirmed-good until user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-08 — v493 LOWER M4 SPARE / LOADED-MAG PRESENTATION TEST — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v493**
- Loader: `./src/game.js?v=493`
- M4 asset unchanged: `assets/ar-15_style_rifle.glb?v=466`
- v493 gameplay commit: `10cd2fc99a541bee7749d62cabafe58768e3947b`
- v493 loader commit: `24d9a6bf971d9c982e512b91c82ee51d0b829967`
- v493 `src/game.js` blob SHA: `1077c332c22f1fd54f17513ff1b201a0d6860215`
- v485-v492 were tested and rejected for reload behavior.
- **v484 remains the last user-confirmed good shooting/ADS baseline.**
- Protected recovery remains **v324** unchanged.

## Why v492 was rejected

User video showed the new spare pickup was still visually wrong:
- the spare appeared too close to the player/camera;
- it looked oversized/floating rather than like a magazine coming from the body;
- from that side-on view it also read like the same empty magazine rather than a loaded replacement.

Frame-by-frame review confirmed the pouch anchor's Z offset `+.60` was pulling the spare toward the camera.

## v493 isolated correction

### Lower/farther body pickup
M4 spare pickup offset changed from:
- `(-.30,-.72,.60)`

to:
- `(-.40,-1.00,-.12)`

This moves the spare:
- farther left;
- substantially lower;
- farther away from the camera instead of toward it.

The spare is still created after the old mag drops, but its root remains hidden until about `p=.44`, when the support hand is nearly at the below-screen pouch point. It should therefore **rise from below the screen with the hand** instead of floating next to the camera.

### Loaded vs empty magazine distinction
- If the M4 was actually fired empty (`ammoState.rifle.mag===0`), the discarded old magazine's real GLB `bullets` group is hidden.
- Tactical reloads preserve remaining rounds visually.
- The fresh spare explicitly forces the real GLB `bullets` / `bullets_bullets_0` group visible before and during pickup/carry.
- This makes the replacement read as a loaded spare rather than the empty magazine that was just dropped.

### Preserved from v491/v492
- actual body/pouch reach and grab timing;
- measured magazine top/grip geometry;
- physical-axis magwell insertion;
- old seated-mag removal;
- fresh mag becomes active `playerReloadPart`;
- visible bolt/charging-handle action.

## Locked v484 M4 values preserved
Do not change unless explicitly asked:
- hip `.54,-.56,-1.48`
- pitch `-8°`
- yaw `0°`
- roll `-6°`
- ADS FOV `48`
- `RIFLE_ADS_ZERO_Y=.040`
- rate `105`
- hold `190`
- spread `.004`
- body damage `1`
- recoil `.105`
- base mag `12`
- asset `assets/ar-15_style_rifle.glb?v=466`

## Validation
- v492 user video inspected frame-by-frame.
- Exact v492 Pages artifact used as local patch base.
- v493 local file passed `node --check`.
- Local Git blob SHA: `1077c332c22f1fd54f17513ff1b201a0d6860215`
- GitHub committed blob matched exactly.
- Post-write checks confirmed locked ADS zero, asset path, measured insertion geometry, bolt/charging action, lower pouch offset, fresh loaded rounds, and empty-old-mag logic.

## v493 user test target
Reload with **R** and verify:
1. old mag drops;
2. support hand reaches down below the normal view;
3. spare does not float close to the camera;
4. spare emerges upward from the body/belt area with the hand;
5. replacement visibly looks loaded;
6. same spare continues into the working geometry-guided insertion;
7. charging remains visible and controlled;
8. approved v484 hip/ADS/shot alignment is unchanged.

Do not call v493 confirmed-good until the user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-08 — v492 M4 BODY/POUCH PICKUP TEST — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v492**
- Loader: `./src/game.js?v=492`
- Active M4 asset unchanged: `assets/ar-15_style_rifle.glb?v=466`
- v492 gameplay commit: `3f19615ac68a8ba89f00138c494abbe940f6ab30`
- v492 loader commit: `0d19d753f8bf9316bfa39de11b70e71a92fef0a3`
- Current v492 `src/game.js` blob SHA: `50add9c99be7a19098334b47c2c1b2c03b75a53d`
- v485-v491 were tested and rejected for reload behavior.
- **v484 remains the last user-confirmed good shooting/ADS baseline.**
- Protected recovery remains **v324** unchanged.

## Why v491 was rejected

The user supplied a new video and reported that after the old magazine dropped, the replacement magazine simply appeared in the player's hand instead of being grabbed from the player's body.

Frame-by-frame review confirmed:
- the support hand moved downward;
- the fresh magazine was created directly at/with the hand during that motion;
- there was no readable body/pouch magazine waiting point and no actual grab beat.

The geometry-guided insertion work from v491 was not the reported problem in this test and is preserved.

## v492 isolated M4 reload correction

### Real body/pouch pickup phase
v492 adds a dedicated M4 spare-mag body/pouch anchor:
- support-hand group offset: `(-.30,-.72,.60)`
- corresponding physical grip point in gun-local space is derived from the approved rifle hand pose.

Reload sequence is now:

1. old magazine releases/drops at about `p=.30`;
2. spare magazine is placed at the fixed body/pouch point at about `p=.31`;
3. that spare remains fixed at the body while the **empty** support hand reaches down to it;
4. the hand reaches the pouch by about `p=.46`;
5. there is a brief grab/hold beat from about `.46-.50`;
6. **only after `p=.50`** does that exact same spare magazine begin moving;
7. from `.50-.75`, hand + magazine travel together from body/pouch toward the measured below-magwell position;
8. from `.75-.86`, v491's measured physical-axis insertion seats the magazine;
9. charging begins after seating.

### No more mag materializing in hand
- The fresh magazine exists at the body/pouch before the support hand arrives.
- Before `p=.50`, it is not mathematically attached to the hand and cannot move with the hand.
- After `p=.50`, the support hand is locked to the magazine's measured lower grip point and carries it as one object.

### Preserved from v491
- measured physical magazine top-center:
  `(0.0005, 0.055, 0.0306)`
- measured lower grip point:
  `(-0.003, 0.45, -1.61)`
- physical insertion axis derived from those mesh points;
- old seated magazine hidden/removed correctly;
- fresh replacement becomes active `playerReloadPart`;
- visible bolt/charging-handle action retained.

## Locked v484 M4 values preserved
Do not change unless explicitly asked:
- hip `.54,-.56,-1.48`
- pitch `-8°`
- yaw `0°`
- roll `-6°`
- ADS FOV `48`
- `RIFLE_ADS_ZERO_Y=.040`
- rate `105`
- hold `190`
- spread `.004`
- body damage `1`
- recoil `.105`
- base mag `12`
- asset `assets/ar-15_style_rifle.glb?v=466`

## Validation
- User v491 video inspected frame-by-frame.
- Exact deployed v491 Pages artifact was downloaded and used as the patch base.
- Locally patched v492 file passed `node --check`.
- Locally computed Git blob SHA:
  `50add9c99be7a19098334b47c2c1b2c03b75a53d`
- GitHub committed v492 blob matched that SHA **exactly**.
- Post-write checks confirmed exactly one copy of:
  - `RIFLE_ADS_ZERO_Y=.040`
  - unchanged M4 asset path
  - M4 body/pouch hand offset
  - body/pouch grip anchor
  - `p=.31` spare creation
  - `p=.50` grab transition
  - measured physical magazine top point
  - old seated-mag removal
  - bolt and charging-handle travel.

## v492 user test target
Reload with **R** and verify:
1. old magazine drops;
2. rifle becomes empty;
3. empty support hand visibly reaches down toward the player's body;
4. spare magazine is waiting at the body/pouch area rather than appearing in the hand;
5. hand reaches and grabs it;
6. same magazine then comes up with the hand toward the rifle;
7. geometry-guided magwell insertion remains smooth;
8. charging remains visible and controlled;
9. approved v484 hip/ADS/shot alignment remains unchanged.

Do not call v492 confirmed-good until the user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-07 — v491 GEOMETRY-GUIDED M4 INSERTION TEST — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v491**
- Loader: `./src/game.js?v=491`
- Active M4 asset unchanged: `assets/ar-15_style_rifle.glb?v=466`
- v491 gameplay commit: `6b14d88117cbc6fd085be42b59fae4cee279ca4a`
- v491 loader commit: `88227ecb0e2bbd502a69e53e047347580c0902f3`
- Current v491 `src/game.js` blob SHA: `21e0bba01837a8d53cc36838c0299d1d89b85e7d`
- v485-v490 were tested and rejected for reload behavior.
- **v484 remains the last user-confirmed good shooting/ADS baseline.**
- Protected recovery remains **v324** unchanged.

## Why v490 was rejected

The user supplied a new v490 video and reported the reload was still broken.

Frame-by-frame review confirmed:
- the magazine still did not enter the physical mouth of the magwell cleanly;
- origin-based positioning was still visually offset from the actual magazine geometry.

The exact deployed M4 GLB was parsed again. The key issue was that previous math still aligned the exported **magazine node origin**, but that origin is not centered on the physical top/opening of the visible magazine.

## Measured real magazine geometry

Direct POSITION-accessor inspection of `magazine_ar 15 2_0` gave these measured local-space points:

- physical magazine top-center ≈ `(0.0005, 0.055, 0.0306)`
- lower hand/grip area ≈ `(-0.003, 0.45, -1.61)`

The magazine mesh spans roughly:
- X: `-0.1136 .. 0.1136`
- Y: `-0.1006 .. 0.7300`
- Z: `-1.7312 .. 0.0336`

These values come from the actual GLB mesh, not guessed node axes.

## v491 isolated reload correction

### Physical top of magazine drives insertion
- v491 no longer uses the magazine node origin as the insertion reference.
- It builds the exact seated world transform from the saved home position/quaternion/scale.
- It transforms the **measured physical magazine top-center** into world space.
- It also transforms the measured lower grip point into world space.

### Real physical insertion axis
- v491 derives the insertion direction from:
  - measured grip world point → measured top world point.
- This produces the actual magazine long-axis direction in the current tilted first-person rifle pose.
- The below-magwell staging position is computed along that measured physical axis.

### Carry → below magwell → seat
- The fresh magazine is first positioned so its measured lower grip point is exactly at the rendered support hand.
- That world-space position is saved as the carry start.
- From the player's body/hand, the magazine travels toward a **physically correct point below the seated top**, not toward the node origin.
- Final insertion then moves from that below point to the exact seated world transform along the physical magazine axis.
- The support hand remains attached to the measured lower grip point throughout carry and insertion.

### Existing good behavior preserved
- old seated mag hidden after release;
- hidden old node removed once replacement seats;
- fresh replacement itself becomes active `playerReloadPart`;
- v488+ visible bolt/charging-handle movement retained;
- no changes to approved shooting/ADS tuning.

## Locked v484 M4 values preserved
Do not change unless explicitly asked:
- hip `.54,-.56,-1.48`
- pitch `-8°`
- yaw `0°`
- roll `-6°`
- ADS FOV `48`
- `RIFLE_ADS_ZERO_Y=.040`
- rate `105`
- hold `190`
- spread `.004`
- body damage `1`
- recoil `.105`
- base mag `12`
- asset `assets/ar-15_style_rifle.glb?v=466`

## Validation
Committed v491 source checks confirmed exactly one copy each of:
- `RIFLE_ADS_ZERO_Y=.040`
- unchanged M4 asset path
- measured physical top point
- measured hand/grip point
- physical insertion-axis derivation
- world-space seated transform
- old seated-mag removal
- bolt movement
- charging-handle movement

Current v491 game blob:
`21e0bba01837a8d53cc36838c0299d1d89b85e7d`

## v491 user test target
Reload with **R** and verify:
1. old mag drops cleanly;
2. rifle becomes visibly empty;
3. fresh mag stays with support hand;
4. fresh mag approaches the actual underside of the magwell;
5. visible top of magazine lines up with the physical magwell opening;
6. mag inserts along its own long axis without climbing the receiver side;
7. no snap/teleport at seating;
8. charging remains visible and controlled;
9. normal hip pose and approved v484 ADS alignment return exactly.

Do not call v491 confirmed-good until the user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-07 — v490 UNDER-MAGWELL M4 INSERTION TEST — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v490**
- Loader: `./src/game.js?v=490`
- Active M4 asset unchanged: `assets/ar-15_style_rifle.glb?v=466`
- v490 gameplay commits:
  - `29e3884b603e0fd936b9bd086fd4ac9496624ee9`
  - scope correction `0ebac8cf3afe5860046302f06dbdf8fe33bdbc70`
- v490 loader commit: `1cad74713377e91bb35deb82d9db00e4102752c9`
- Current v490 `src/game.js` blob SHA: `4a6faccccc8c5105082e102e73e5d59bc4d4eb26`
- v485/v486/v487/v488/v489 were tested and rejected for reload behavior.
- **v484 remains the last user-confirmed good shooting/ADS baseline.**
- Protected recovery remains **v324** unchanged.

## Why v489 was rejected

User said v489 was on a great path, but the replacement magazine:
- traveled upward along the side of the rifle;
- then appeared/snapped into the M4 instead of entering the magwell continuously.

Frame-by-frame review of the user's v489 clip confirmed the final hand→gun transfer used one diagonal interpolation from the hand-carried magazine position directly to the magwell alignment point. That path crossed the receiver side.

## v490 isolated reload correction

### Two-stage final insertion
The hand-carried magazine now uses a strict two-stage final approach:

1. **Low alignment phase**
   - magazine remains low;
   - its X and Z move into exact alignment with the saved magwell home position;
   - Y remains at or below `home.y - 34`;
   - this moves the mag beneath the rifle instead of diagonally up the receiver side.

2. **Straight-up insertion phase**
   - once X/Z are centered under the magwell, only Y changes;
   - magazine moves directly from the below-magwell point into the exact saved home transform;
   - no diagonal receiver-crossing path remains.

### Support hand follows magazine continuously
- During both final approach stages, the support hand is mathematically re-solved to the actual magazine base each frame.
- The real magazine base point (`local z≈-1.55`) drives hand placement.
- This keeps the hand physically attached to the magazine while it moves underneath and then straight upward into the magwell.

### Existing good v489/v488 behavior preserved
- old seated magazine forced hidden after release;
- old seated hidden node removed after fresh mag seats;
- fresh replacement becomes the active/seated `playerReloadPart`;
- visible bolt carrier charging action retained;
- visible charging-handle-shaped `ar15.005` motion retained.

## Locked v484 M4 values preserved
Do not change unless user explicitly asks:
- hip `.54,-.56,-1.48`
- pitch `-8°`
- yaw `0°`
- roll `-6°`
- ADS FOV `48`
- `RIFLE_ADS_ZERO_Y=.040`
- rate `105`
- hold `190`
- spread `.004`
- body damage `1`
- recoil `.105`
- base mag `12`
- asset `assets/ar-15_style_rifle.glb?v=466`

## Validation
Post-write checks on the committed v490 source confirmed:
- `RIFLE_ADS_ZERO_Y=.040` still appears exactly once;
- M4 asset path remains unchanged;
- under-magwell X/Z alignment exists exactly once;
- support-hand-to-magazine-base follow exists;
- old seated node removal remains present;
- bolt and charging-handle travel remain present.

Current committed v490 game blob:
`4a6faccccc8c5105082e102e73e5d59bc4d4eb26`

## v490 user test target
Reload with **R** and verify:
1. old magazine drops cleanly;
2. rifle is visibly empty;
3. fresh magazine is visibly carried by support hand;
4. fresh mag moves **under** the magwell first, not up the side of the receiver;
5. hand stays attached to the mag during that move;
6. mag then moves straight upward into the magwell;
7. no visual snap/teleport at seating;
8. charging action remains visible and controlled;
9. normal hip pose and approved v484 ADS alignment return exactly.

Do not call v490 confirmed-good until the user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-07 — v489 HAND-CARRIED M4 MAGAZINE TEST — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v489**
- Loader: `./src/game.js?v=489`
- Active M4 asset unchanged: `assets/ar-15_style_rifle.glb?v=466`
- v489 gameplay commit: `aceb1afeef8f30690efe27d978e7f9171e7f2a32`
- v489 loader commit: `ecaf258ee375128e843f0f4c1471fe08389ad09b`
- v489 `src/game.js` blob SHA: `aefdc68ce62e4be30761db61548e5ffc5cffd8c1`
- v485/v486/v487/v488 were tested and rejected for reload behavior.
- **v484 remains the last user-confirmed good shooting/ADS baseline.**
- Protected recovery remains **v324** unchanged.

## Why v488 was rejected

The user supplied a new video. v488 was materially better, but two reload problems remained:
1. the dumped magazine looked good while a magazine still appeared to remain in the M4;
2. the fresh magazine did not visibly travel with the player/support hand from the body back into the gun.

Frame-by-frame review confirmed the replacement was still following a precomputed path under the rifle rather than the actual support hand.

## v489 isolated M4 reload correction

### Old seated magazine
- The real seated magazine is visible only until release.
- After the old-mag drop starts, the original seated magazine root and its mesh descendants are **forced hidden every frame** until the replacement seats.
- When the replacement finally seats, the old hidden seated node is removed from the rifle hierarchy so it cannot remain as a hidden duplicate across later reloads.

### Fresh magazine is now truly hand-carried
- The fresh magazine still stays parented inside the imported M4 hierarchy so the FBX scale remains stable.
- However, during the carry phase its position is solved in world space against the actual rendered support hand.
- The code uses the real support-hand world position from `playerHandRig.left`.
- The base/lower portion of the real magazine (`local z≈-1.55`) is locked to that support-hand position.
- This makes the magazine visually travel **with the player's hand**, from the player's body/pouch area toward the rifle.
- At reload progress `p≈.67`, the current hand-carried transform is frozen as the insertion start.
- The magazine then transfers from the hand to an alignment point below the magwell, and finally seats into the exact saved home transform at `p≈.86`.
- The fresh replacement itself becomes the new active/seated `playerReloadPart`.

### Charging action retained
- v488 model-scale charging is preserved:
  - bolt carrier rearward movement: `+34 Z units`
  - charging-handle-shaped `ar15.005`: `+42 Z units`
- Charging timing was shifted to begin after the new magazine seats.
- Support-hand timing was adjusted to finish insertion before the charging pull.

## Locked v484 M4 values preserved
Do not change unless user explicitly asks:
- hip `.54,-.56,-1.48`
- pitch `-8°`
- yaw `0°`
- roll `-6°`
- ADS FOV `48`
- `RIFLE_ADS_ZERO_Y=.040`
- rate `105`
- hold `190`
- spread `.004`
- body damage `1`
- recoil `.105`
- base mag `12`
- asset `assets/ar-15_style_rifle.glb?v=466`

## Validation
Post-write source checks on v489 confirmed exactly one copy each of:
- `RIFLE_ADS_ZERO_Y=.040`
- M4 asset path `ar-15_style_rifle.glb?v=466`
- forced hidden-old-mag guard
- true support-hand world-position lock
- magazine base lock point `(0,0,-1.55)`
- old seated node removal
- bolt carrier `+34 Z`
- charging handle `+42 Z`

Committed v489 game blob:
`aefdc68ce62e4be30761db61548e5ffc5cffd8c1`

## v489 user test target
Reload with **R** and verify:
1. old magazine pulls free and drops;
2. the rifle is visibly empty after that release;
3. fresh magazine is visibly carried by the support hand from the player/body area;
4. hand and magazine move together toward the M4;
5. magazine transfers from hand into the magwell and remains seated;
6. charging handle/bolt still pull rearward and return;
7. no duplicate magazine remains;
8. normal hip pose and approved v484 ADS alignment return exactly.

Do not call v489 confirmed-good until the user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-07 — v488 MODEL-SCALE M4 RELOAD TEST — READ THIS FIRST

GitHub main is authoritative. This section supersedes older current-state notes below.

## Current test state
- Test build: **v488**
- Loader: `./src/game.js?v=488`
- M4 asset unchanged: `assets/ar-15_style_rifle.glb?v=466`
- v488 gameplay commit: `03a440a4f8604c6e6e49689efd15fb35dc16bff6`
- v488 loader commit: `3af2f3c7957aac6da09d360a8d8d640430cf4f63`
- v488 `src/game.js` blob SHA: `8bb7f6cdbef51bdc1f56d51cdf9b08a6bbe6eaaa`
- v485/v486/v487 were tested and rejected.
- **v484 remains the last user-confirmed good baseline.**
- Protected recovery remains **v324** unchanged.

## Why v487 looked unchanged

The user supplied another video and correctly reported that v487 did not visibly improve the reload.

The exact deployed GLB and deployed v487 source were inspected directly. The key discovery:
- this Sketchfab/FBX GLB uses roughly **100-unit authored coordinates**;
- prior reload movement values such as `.34`, `1.05`, `.38`, etc. were effectively microscopic after import transforms;
- direct mesh bounds show:
  - real magazine mesh height along Y: about **176 units**;
  - bolt carrier length along Z: about **76 units**;
  - `ar15.005` charging-handle-shaped part length along Z: about **125 units**.

The deployed v487 `src/game.js` was confirmed byte-for-byte identical to GitHub before editing.

## v488 changes — M4 reload only

- Old seated magazine now visibly pulls downward by up to **34 authored Y units** before the drop.
- Fresh replacement starts about **96 authored Y units** below the magwell.
- It visibly travels to an alignment point **26 Y units** below the magwell, then seats to the exact saved home transform.
- The fresh replacement itself becomes the new active/seated `playerReloadPart`.
  - It is **not removed** and replaced by suddenly revealing the old hidden magazine.
  - This prevents the “one drops / one stays / replacement never comes back” behavior.
- Real bolt carrier now pulls rearward by **34 authored Z units**.
- `ar15.005` charging-handle-shaped part now pulls rearward by **42 authored Z units**.
- Charging movement spans a larger visible time window.
- Left support hand performs a controlled rearward charging motion synchronized to the handle, then returns.
- Right hand remains stable.

## Locked v484 M4 values preserved
Do not change unless explicitly asked:
- hip `.54,-.56,-1.48`
- pitch `-8°`
- yaw `0°`
- roll `-6°`
- ADS FOV `48`
- `RIFLE_ADS_ZERO_Y=.040`
- rate `105`
- hold `190`
- spread `.004`
- body damage `1`
- recoil `.105`
- base mag `12`
- asset `assets/ar-15_style_rifle.glb?v=466`

## Validation
- v487 user video inspected frame-by-frame.
- Exact deployed GLB parsed directly.
- Exact deployed v487 game file Git blob matched GitHub: `600a92884d32e661161c7095fd27ea6dbb0cedfc`.
- Patched v488 file passed `node --check`.
- Locally calculated Git blob SHA for syntax-checked v488 file:
  `8bb7f6cdbef51bdc1f56d51cdf9b08a6bbe6eaaa`
- GitHub committed blob matched that SHA exactly.
- Post-write checks confirmed approved `.040` ADS zero and M4 asset path remain unchanged.

## v488 test target
Reload with **R** and verify:
1. old magazine visibly pulls free and drops;
2. no seated duplicate remains;
3. fresh magazine visibly rises from below and seats into the gun;
4. that fresh magazine remains seated after reload;
5. charging handle and bolt visibly pull rearward and return;
6. support hand performs one controlled charge, not a wild sweep;
7. normal hip pose and v484 ADS alignment return exactly.

Do not call v488 confirmed-good until the user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-07 — v487 M4 MAGAZINE/CHARGING AXIS FIX TEST — READ THIS FIRST

This section supersedes older current-state sections below. **GitHub main is the source of truth.**

## Current test state

- Test build: **v487**
- Loader: `./src/game.js?v=487`
- Active M4 asset remains: `assets/ar-15_style_rifle.glb?v=466`
- v487 gameplay commit: `d6d3e843d9d6cef99bb4655f46cd789f0fbcf5ab`
- v487 loader commit: `5fb6b4be85ed2f6f43bdae8ccf0695b5acc952f9`
- Current v487 `src/game.js` blob SHA: `600a92884d32e661161c7095fd27ea6dbb0cedfc`
- **v484 remains the last user-confirmed good baseline** until a later reload build is approved.
- v485 and v486 were tested and rejected.
- Protected recovery remains **v324** unchanged.

## Why v486 was rejected

User video showed:
- the dumped magazine looked good;
- one magazine still appeared to remain;
- the replacement magazine did not visibly return into the gun;
- the rifle still did not visibly get charged.

Frame-by-frame review plus direct GLB geometry inspection identified the model-space axis mistake:
- the magazine body is authored primarily along **Z** and inserts/removes along Z;
- the rifle/receiver/bolt is authored lengthwise along **Y**;
- v486 still moved the fresh magazine mostly on Y and moved the bolt carrier on Z.

## v487 isolated reload corrections

### Old magazine visibility
- When the rifle magazine is dumped, the real seated `magazine` root is now explicitly set `visible=false`.
- Its mesh descendants are also hidden.
- This prevents the original seated magazine from visually remaining behind while the dropped clone falls.

### Replacement magazine
- Fresh replacement still stays in the imported M4 coordinate space to avoid the v485 scale blow-up.
- It now starts below the magwell on **model-space Z**:
  - `fresh.position.z -= 1.05`
- Alignment point is also on Z:
  - `align.z -= .32`
- It then seats directly back into the exact saved home transform.
- At seating completion, the real magazine root and descendants are explicitly made visible again.

### Charging action
- Direct GLB geometry inspection confirmed the rifle longitudinal axis is **Y**.
- The real `bolt carrier` now moves rearward on Y:
  - `position.y -= .38 * cycle`
- The separate `ar15.005` node is treated as the external charging-handle part and moves rearward on Y with the bolt:
  - `position.y -= .46 * cycle`
- Both parts return to their exact saved home positions after the charge.
- Hands remain on the stabilized v486 M4-only choreography during this phase; no large charging-arm sweep was reintroduced.

## GLB geometry evidence used

Current deployed M4 GLB has no animations/skins and contains separate nodes:
- `magazine`
- `bullets`
- `bolt carrier`
- `ar15.005`

Direct position bounds show:
- magazine mesh extends mainly down Z;
- bolt carrier / receiver geometry extends mainly along Y;
- `ar15.005` is a long, thin receiver-top part appropriate for the visible charging action.

## Locked M4 baseline preserved

Do **not** change unless explicitly requested:
- hip position `(.54,-.56,-1.48)`
- pitch `-8°`
- yaw `0°`
- roll `-6°`
- ADS FOV `48`
- `RIFLE_ADS_ZERO_Y=.040`
- rate `105`
- hold `190`
- spread `.004`
- body damage `1`
- recoil `.105`
- base mag `12`
- M4 asset `assets/ar-15_style_rifle.glb?v=466`

## Validation

Post-write source checks confirmed:
- `RIFLE_ADS_ZERO_Y=.040` still appears exactly once;
- M4 asset path remains unchanged;
- fresh-mag Z-axis path exists exactly once;
- bolt Y-axis charging movement exists exactly once;
- `ar15.005` charging-handle binding exists exactly once;
- committed v487 game blob is `600a92884d32e661161c7095fd27ea6dbb0cedfc`.

## v487 user test target

Fire several rounds and reload with **R**. Verify:
1. only the dumped old magazine leaves the gun;
2. no second seated magazine remains visible after the dump;
3. fresh magazine visibly travels back up into the magwell;
4. magazine is present again after reload;
5. external charging handle / bolt visibly pull rearward and return;
6. hands remain controlled during the charge;
7. rifle returns to exact v484 hip pose;
8. v484 ADS shot / marker synchronization remains perfect.

Do not call v487 confirmed-good until the user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-07 — v486 M4 RELOAD FIX TEST — READ THIS FIRST

This section supersedes older current-state sections below. **GitHub main is the source of truth.**

## Current test state

- Test build: **v486**
- Loader: `./src/game.js?v=486`
- Active M4 asset remains: `assets/ar-15_style_rifle.glb?v=466`
- v486 gameplay commit: `c85458ed89b97455c589e71f1dd0208b8869de21`
- v486 loader commit: `2c17b1a101e867098bf9a8bde6a36e4df83338cc`
- Current v486 `src/game.js` blob SHA: `ac1c7b158d58b5878dcf6a2ed561753aebaf6d0e`
- **v484 remains the last user-confirmed good baseline** until the user approves a later reload build.
- v485 was tested and **not approved**.
- Protected recovery remains **v324** unchanged.

## Why v485 was rejected

The user supplied a video and reported:
- the magazine drops, but visible bullets remain floating where the magazine came from;
- near the end of reload / charging phase, the arms/geometry go all over the place.

Frame-by-frame review plus direct inspection of the deployed GLB showed three exact causes:

1. `bullets` is a separate sibling node under `RootNode`, not a child of `magazine`.
   - v485 moved the real `magazine` but left the `bullets` node behind.
2. The imported magazine node carries unusual FBX-authored scale/transform data.
   - v485 temporarily parented a fresh cloned magazine to the procedural support-hand group.
   - that caused the clone to inherit incompatible scale and produced huge black stretched polygons during reload.
3. The generic detachable-magazine hand path leaves `pull=1` until reload completion.
   - that caused an abrupt support-arm return near the bolt-cycle/end phase.

## v486 M4 reload fixes

v486 is still an isolated M4 reload change.

### Cartridge / magazine assembly
- Finds the real `bullets` node.
- Reparents `bullets` under the real `magazine` using `Object3D.attach()` after world matrices are updated.
- This preserves the original visible cartridge placement while making the cartridges travel with the magazine.
- Dropped old-mag clone now contains both magazine + cartridges.
- Fresh replacement clone also contains both magazine + cartridges.

### Fresh-mag scale stability
- Fresh M4 magazine is **no longer parented to the procedural hand**.
- It stays in the same imported-model coordinate space as the seated magazine.
- It uses the real magazine's local scale/orientation.
- It starts below the magwell, is guided upward, then seats into the exact magazine home transform.
- This removes the giant black stretched geometry seen in the user's v485 video.

### M4-only arm choreography
- M4 now has a dedicated support-hand reload path instead of the generic detachable-mag path.
- Support hand reaches/pulls, dips for replacement, guides the new magazine, and returns to the fore-end **before** the bolt cycle.
- Right/firing hand is held stable during M4 reload.
- This removes the end-of-reload arm snap/wild sweep.

### Bolt carrier
- The real `bolt carrier` node remains the charging/bolt visual.
- It cycles only after the new magazine seats.
- Arm choreography is already back in its normal position during that bolt movement.

## Locked M4 baseline preserved

Do **not** change unless user explicitly asks:
- hip position `(.54,-.56,-1.48)`
- pitch `-8°`
- yaw `0°`
- roll `-6°`
- ADS FOV `48`
- `RIFLE_ADS_ZERO_Y=.040`
- rate `105`
- hold `190`
- spread `.004`
- body damage `1`
- recoil `.105`
- base mag `12`
- M4 asset `assets/ar-15_style_rifle.glb?v=466`

## Validation

- User video inspected frame-by-frame.
- Deployed GLB hierarchy confirmed exact siblings:
  - `magazine`
  - `bullets`
  - `bolt carrier`
- GLB still has 0 embedded animations and 0 skins.
- Staged v486 JS passed `node --check`.
- Locally syntax-checked Git blob SHA matched committed GitHub blob exactly:
  - `ac1c7b158d58b5878dcf6a2ed561753aebaf6d0e`
- Loader bumped only after gameplay commit.

## v486 user test target

Fire several rounds and reload with **R**. Verify:
1. magazine and visible cartridges leave together;
2. no bullets remain floating under the receiver;
3. no huge black stretched polygons appear;
4. support arm moves smoothly and is back on the fore-end before bolt cycling;
5. bolt carrier cycles without the arms flying around;
6. rifle returns to exact v484 hip pose;
7. v484 ADS bullet / hit-marker alignment remains perfect.

Do not mark v486 confirmed-good until user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-07 — v485 M4 REAL-MAGAZINE / BOLT RELOAD TEST — READ THIS FIRST

This section supersedes older current-state sections below. **GitHub main is the source of truth.**

## Current test state

- Test build: **v485**
- Loader: `./src/game.js?v=485`
- Active M4 asset remains: `assets/ar-15_style_rifle.glb?v=466`
- v485 gameplay commit: `16304fe6429dec5e3eaabfcfeae28b9e123152cc`
- v485 loader commit: `76acec2815529e4e92fe506cd4d4794c6d9ad887`
- Current v485 `src/game.js` blob SHA: `01ef1e420946ad214871308c81521ff477810b91`
- Previous user-confirmed good baseline remains **v484** until the user tests v485.
- Protected recovery remains **v324** unchanged:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`

## What changed in v485 — M4 reload only

The user asked to implement the full M4 reload using the real parts in the uploaded GLB.

Direct inspection of the deployed `assets/ar-15_style_rifle.glb` confirmed:
- there are **0 embedded animation clips**;
- there are **0 skins**;
- the real detachable magazine node is named exactly `magazine`;
- the real bolt-carrier node is named exactly `bolt carrier`.

Important discovery: the previous M4 reload hookup searched for `Magazine_m4_0` / `Magazine`, which do not exist in this GLB, so it could not actually bind the real magazine.

v485 now:
- binds the real `magazine` node;
- keeps the seated real magazine parented to the imported M4 so approved hip/ADS transforms remain intact;
- visibly pulls and drops a cloned old magazine while preserving its exact world transform;
- creates a fresh clone from the real magazine;
- carries the fresh magazine through the support-hand reload path;
- lines it up below the real magwell and seats it straight upward;
- restores the real seated magazine at insertion;
- binds the real `bolt carrier` node and visibly cycles it after the fresh magazine seats;
- adds a small insertion clack using the existing tone system;
- gives M4 reload its own duration: base `1550 ms`, minimum `1150 ms` with reload upgrades;
- adds a reload-only rifle presentation/cant so the magwell is easier to see.

## Locked M4 values preserved

Do **not** retune these unless the user explicitly asks:
- approved hip position `(.54,-.56,-1.48)`
- hip pitch `-8°`
- hip yaw `0°`
- hip roll `-6°`
- ADS FOV `48`
- shared M4 ADS bullet/hit-marker zero `RIFLE_ADS_ZERO_Y=.040`
- M4 asset `assets/ar-15_style_rifle.glb?v=466`
- weapon values: rate `105`, hold `190`, spread `.004`, body damage `1`, recoil `.105`, base mag `12`.

The reload-only rifle transform blends from/to the approved hip pose and does not replace the locked normal hip/ADS transforms.

## Validation performed before push

- The exact v484 Pages artifact was inspected to confirm the GLB node names.
- Staged v485 `src/game.js` passed `node --check`.
- Git blob SHA of the syntax-checked staged file matched GitHub after commit: `01ef1e420946ad214871308c81521ff477810b91`.
- Post-write checks confirmed one copy each of:
  - `RIFLE_ADS_ZERO_Y=.040`
  - `assets/ar-15_style_rifle.glb?v=466`
  - real `magazine` lookup
  - real `bolt carrier` lookup
  - `updateM4ReloadMagazineFX`.

## What to test

Reload the M4 with **R** and specifically watch:
1. rifle cants inward/up without disturbing the normal hip pose afterward;
2. old real-model magazine visibly pulls free and drops;
3. support hand retrieves a fresh copy of that same magazine;
4. fresh magazine aligns under the magwell and seats cleanly;
5. real bolt carrier cycles near the end;
6. after reload, the M4 returns exactly to the approved v484 hip/ADS positions;
7. ADS hit marker and bullets still match the user-approved v484 alignment.

Do not call v485 user-confirmed good until the user tests it.

---

# NEW-CHAT HANDOFF — 2026-10-07 — v484 USER-CONFIRMED GOOD M4 ADS BASELINE — READ THIS FIRST

This section supersedes older current-state sections below. **GitHub main is the source of truth.**

## Exact current live state

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Loader: `./src/game.js?v=484`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v484 gameplay commit: `4a9745b8235093856286f9453daca0c0f77514f4`
- v484 loader commit: `25c4ae400ac636427415747109d1e7b6ef978cdd`
- Current `src/game.js` SHA: `f72de72b3a9daea3b2b10bd3805862e90f813979`
- Current pre-handoff main commit: `1c4c52c3828bbce76b1bf54a0f888b2e82187da5`
- Verified successful Pages run for that state: `37712032872`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - do not change this checkpoint unless the user explicitly asks.

## Latest user confirmation

After the v484 ADS hit-marker / bullet-ray synchronization fix, the user said:

> **"perfect i need a new chat hand off"**

Therefore:
- **v484 is the latest user-confirmed good baseline**;
- preserve the current M4 ADS/shot alignment unless the user explicitly asks to change it;
- the M4 tuning phase is **not explicitly declared finished**, so keep the temporary M4 starting loadout in place until the user says tuning is complete.

## Current M4 implementation — preserve this baseline

### Model / starting loadout

- M4 uses the user's uploaded `assets/ar-15_style_rifle.glb`.
- Old `classic_m4.glb.glb` is no longer the runtime M4 model.
- New game and full restart currently start with:
  - `weapon="rifle"`
  - `unlocked.rifle=true`
  - M17 remains unlocked.
- This is intentionally temporary for M4 tuning.

### Approved hip pose

Current M4 hip root:
- position `(.54, -.56, -1.48)`
- pitch `-8°`
- yaw `0°`
- roll `-6°`

The user previously explicitly liked this placement. Do not alter it casually.

### Real ACOG / ADS

The actual GLB ACOG is used, not a fake overlay.

Current code:
- identifies `acog` / `acog_optic.001_0`;
- computes the real rear/front aperture centers from the ACOG mesh geometry;
- derives the true optical axis;
- rotates that optical axis to camera forward (`0,0,-1`);
- places the rear aperture about `0.18` first-person units in front of the eye;
- blends from approved hip pose to this calculated ADS target;
- M4 stays visible in ADS;
- old M4 full-screen scope overlay is disabled;
- AWM scope behavior remains unchanged;
- rifle ADS FOV remains `48`.

### ACOG hip rendering

Current source already contains the later ACOG two-pass rendering fix:
- source texture is mostly opaque housing with a small translucent glass region;
- opaque body pass:
  - `transparent=false`
  - `depthWrite=true`
  - `alphaTest=.985`
  - `alphaToCoverage=true`
- transparent glass pass:
  - cloned ACOG mesh
  - `transparent=true`
  - `depthWrite=false`
  - `alphaTest=.005`
  - shader discards near-opaque pixels (`alpha >= .985`)
- optic emissive intensity is clamped to `.15`.

This was specifically added to prevent the whole ACOG from self-sorting / showing internal geometry at hip-fire. Do not replace the real ACOG geometry.

### M4 ADS shot / visible hit-marker sync — v484

The current shared constant is:

- `RIFLE_ADS_ZERO_Y = .040`

It is used by **both**:
1. the actual M4 ADS bullet ray;
2. the visible M4 ADS hit-marker position.

The visible marker was previously stuck at screen-center even while the shot ray moved. v484 fixed that mismatch by driving both from the same constant.

Current behavior:
- M4 ADS ray uses `RIFLE_ADS_ZERO_Y`;
- M4 hit marker top uses `50 - RIFLE_ADS_ZERO_Y * 50` percent;
- at `.040`, marker is around `48%` top.

User said **"perfect"** after this synchronization fix. Preserve `.040` unless they explicitly ask to retune it.

## Important current M4 values

- weapon definition remains:
  - rate `105`
  - hold `190`
  - spread `.004`
  - body damage `1`
  - recoil `.105`
  - base mag `12`
- rifle ADS FOV: `48`
- hip pose: `.54,-.56,-1.48`, rotation `-8°,0°,-6°`
- rear ACOG eye distance target: `-0.18`
- shared M4 ADS zero: `.040`

## Known caution for next chat

Do **not** assume every historic M4 complaint is still active just because it appears in older sections.

The only authoritative current state is current `main` + this newest top section.

Also:
- user previously complained about strong recoil during M4 ADS, but no separate recoil-tuning commit is present after the current v484 baseline;
- because the user ended this chat with **"perfect"**, do not proactively change recoil in the new chat unless they bring it up again;
- do not restore the normal starting loadout until the user explicitly says M4 tuning is finished.

## Required workflow in the new chat

Before changing anything:
1. read the newest top sections of `CITY_OUTBREAK_HANDOFF.md`;
2. read `NEXT_CHAT_HANDOFF.md`;
3. read `CURRENT_RECOVERY_CHECKPOINT.md`;
4. read current `index.html`;
5. read current `src/game.js`;
6. read any relevant module/asset path;
7. make one isolated change at a time;
8. commit directly to `main`;
9. bump loader version;
10. verify syntax/diff;
11. verify final GitHub Pages run succeeds;
12. update both handoffs again.

Never work from old chat assumptions instead of current GitHub main.

---

# M4 TUNING PHASE — 2026-10-07 — v484 — ADS HIT MARKER / BULLET RAY SYNC FIX — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=484`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v484 gameplay commit: `4a9745b8235093856286f9453daca0c0f77514f4`
- v484 loader commit: `25c4ae400ac636427415747109d1e7b6ef978cdd`
- Current `src/game.js` SHA: `f72de72b3a9daea3b2b10bd3805862e90f813979`
- Protected recovery remains **v324** unchanged.

## Why the user saw no movement

User correctly reported that even after waiting, the visible M4 ADS hit marker appeared to stay in the same place.

Root cause:
- the actual M4 bullet ray had been moved upward using `rifleAdsZeroY`;
- but `hitMark()` still hard-coded the rifle's visible hit marker to `top: 50%`;
- therefore the bullet ray could move while the on-screen marker remained visually frozen at screen center.

This is why the previous calibration looked like it was not changing.

## v484 fix

Create one shared M4 ADS zero constant:

- `RIFLE_ADS_ZERO_Y = .040`

Use it for both:

1. the actual rifle ADS bullet ray;
2. the visible M4 ADS hit-marker position.

The M4 hit marker top is now calculated from the same normalized-device-coordinate Y value:
- CSS top = `50 - RIFLE_ADS_ZERO_Y * 50`
- with `.040`, marker renders at approximately `48%` instead of `50%`.

This guarantees the visible marker and real bullet ray cannot drift apart during further tuning.

## Intentionally unchanged

v484 does **not** change:
- M4 scope/ACOG geometry;
- current ACOG rendering/material behavior;
- optical-axis alignment;
- hip placement;
- ADS eye distance;
- FOV;
- recoil;
- damage/spread/fire rate;
- reload;
- sound;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

Verification:
- full `src/game.js` syntax parse passed;
- exact gameplay diff is limited to shared M4 ADS zero constant + hit-marker sync + ray using same constant.

## v484 test focus

Check one thing only:
- when the M4 hits while ADS, does the visible hit marker now appear at the same upward-adjusted point as the real shot zero instead of remaining stuck at screen center?

If still off, adjust **only `RIFLE_ADS_ZERO_Y`**. The marker and shot ray will now move together automatically.

---

# M4 TUNING PHASE — 2026-10-07 — v483 — VISIBLE ADS IMPACT CORRECTION — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=483`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v483 gameplay commit: `03ddd83adaa123d6ba80d812e0e21840178680c1`
- v483 loader commit: `f016e15f577420b246f1628c940c79c009f1f56c`
- Current `src/game.js` SHA: `c586e0efef8fd0319a90eabde4c33260515447d9`
- Protected recovery remains **v324** unchanged.

## Why v483 exists

User said the ADS impact looked like it had not moved at all and correctly challenged the previous changes.

The video being tested showed v481. The recent zero changes were:
- v480: `+0.006`
- v481: `+0.009`
- v482: `+0.012`

Each step was only `+0.003` normalized-device-coordinate Y, which is only about 1–2 pixels on a 1080p view. Visually, those increments were effectively imperceptible.

That was the problem: the correct shot-ray variable was being changed, but by far too little.

## v483 change

Only the M4 ADS shot zero changes:

Before:
- `rifleAdsZeroY=+0.012`

Now:
- `rifleAdsZeroY=+0.040`

This is a deliberately visible upward correction so the next test can clearly show whether the impact is moving toward the marked reticle point.

Only applies while:
- `aiming===true`
- `weapon==="rifle"`

## Intentionally unchanged

v483 does **not** change:
- ACOG placement;
- ACOG material/rendering;
- hip placement;
- ADS eye distance;
- FOV;
- recoil;
- damage/spread/fire rate;
- reload;
- sound;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

Verification:
- exact gameplay diff is one line;
- full `src/game.js` syntax parse passed.

## v483 test focus

Check only whether the M4 ADS impact now moves visibly upward toward the marked reticle point.

If it overshoots or is still low, adjust only `rifleAdsZeroY` from this now-visible baseline.

---

# M4 TUNING PHASE — 2026-10-07 — v482 — ADS IMPACT RAISED ONE MORE STEP — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=482`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v482 gameplay commit: `daa2c5de8de91f35a1454b9b3dfd7a1bd4d96df3`
- v482 loader commit: `94e14a4b19fad8506b1389774fd8186a27957a2c`
- Current `src/game.js` SHA: `71a925b5b5ce32b7671cf41008eb29a27c6b5b06`
- Protected recovery remains **v324** unchanged.

## User-observed v481 result

User supplied a newer ADS test video and said:
- impact is **still not quite at the marked reticle point**;
- it is **getting close**.

Current v481 value:
- `rifleAdsZeroY=+0.009`

The new video still shows the M4 ADS impact slightly low relative to the desired reticle point.

## v482 change

Only the M4 ADS shot zero changes:

Before:
- `rifleAdsZeroY=+0.009`

Now:
- `rifleAdsZeroY=+0.012`

This is the same small +0.003 step used in the previous tuning passes.

Only applies while:
- `aiming===true`
- `weapon==="rifle"`

## Intentionally unchanged

v482 does **not** change:
- current M4 ADS recoil baseline;
- ACOG optical-axis alignment;
- ACOG rendering/material handling;
- v470 hip placement;
- eye distance;
- FOV;
- recoil base value;
- damage/spread/fire rate;
- reload;
- sound;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

Verification:
- exact v482 gameplay diff is one line;
- full `src/game.js` syntax parse passed.

## v482 test focus

Check only:
1. M4 ADS impact now lands at the user-marked reticle point;
2. no change to recoil or scope placement/rendering.

If impact is still slightly low/high, continue adjusting only `rifleAdsZeroY`.

---

# M4 TUNING PHASE — 2026-10-07 — v481 — ADS IMPACT RAISED FURTHER TO USER-MARKED POINT — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=481`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v481 gameplay commit: `797350820946ee05acd9b22c2a195d63db6132fd`
- v481 loader commit: `566a1530bdbf673c31d5cb9de6252de6416fcf4c`
- Current `src/game.js` SHA: `8f5f1f4998c9980b75c3cea84bab3f06fe1b4bcd`
- Protected recovery remains **v324** unchanged.

## User's latest correction

User said the M4 ADS hit marker still needs to be moved **up further** to the user-marked red-arrow/reticle point.

Current v480 already used:
- `rifleAdsZeroY=+0.006`

That was still slightly too low.

## v481 change

Only the M4 ADS shot zero changes:

Before:
- `rifleAdsZeroY=+0.006`

Now:
- `rifleAdsZeroY=+0.009`

Only applies while:
- `aiming===true`
- `weapon==="rifle"`

Effect:
- raises the M4 ADS impact another small step toward the user-marked reticle point;
- hip-fire shot ray remains unchanged;
- all other weapons remain unchanged.

## Intentionally unchanged

v481 does **not** change:
- current M4 ADS recoil behavior;
- true ACOG optical-axis alignment;
- ACOG rendering/material structure;
- v470 hip placement;
- eye distance;
- FOV;
- recoil base value;
- damage/spread/fire rate;
- reload;
- sound;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

Verification:
- exact v481 gameplay diff is one line;
- full `src/game.js` syntax parse passed.

## v481 test focus

Check only:
1. M4 ADS impact lands at the user-marked reticle point;
2. recoil remains as in the current baseline;
3. ACOG alignment/rendering remain unchanged.

If impact is still low/high, adjust only `rifleAdsZeroY` next.

---

# M4 TUNING PHASE — 2026-10-07 — v480 — ADS IMPACT RAISED TO USER-MARKED RETICLE POINT — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=480`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v480 gameplay commit: `4569ffb25120ee741d6a53e172d8940002b9d4f7`
- v480 loader commit: `e6c1d7f8f5cf2df9d908fa566ce53e1e8e2679cc`
- Current `src/game.js` SHA: `662a4d0c56c419d86bd18348e2ad6be61d2bf202`
- Protected recovery remains **v324** unchanged.

## User's latest correction

User supplied a v479 video and explicitly indicated that, while ADS, the bullet hit point should be at the **red-arrow / reticle point**.

v479 already had:
- true optical-axis ACOG ADS;
- two-pass ACOG body/glass rendering;
- calmer full-ADS M4 recoil;
- rifle-only ADS zero `+0.003`.

The user wants the impact slightly higher.

## v480 change

Only the M4 ADS shot zero changes:

Before:
- `rifleAdsZeroY=+0.003`

Now:
- `rifleAdsZeroY=+0.006`

Only applies while:
- `aiming===true`
- `weapon==="rifle"`

Effect:
- raises the M4 ADS impact a small additional amount toward the user-marked red-arrow/reticle point;
- hip-fire shot ray remains unchanged;
- every other weapon remains unchanged.

## Intentionally unchanged

v480 does **not** change:
- v479 M4 ADS recoil reduction;
- true ACOG optical-axis alignment;
- ACOG rendering/material structure;
- hip placement;
- eye distance;
- FOV;
- recoil base value;
- damage/spread/fire rate;
- reload;
- sound;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

Verification:
- exact v480 gameplay diff is one line;
- full `src/game.js` syntax parse passed.

## v480 test focus

Check only:
1. ADS impact now lands at the user-marked reticle point;
2. recoil remains as controlled as v479;
3. ACOG alignment/rendering remain unchanged.

If the impact is still slightly off, adjust only `rifleAdsZeroY` next.

---

# M4 TUNING PHASE — 2026-10-07 — v479 — VIDEO-BASED ADS ZERO + RECOIL CORRECTION — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=479`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v478 optical-axis / two-pass ACOG baseline commit: `3059db7d2fc70349175a77243fb9fee53ab307a8`
- v479 ADS-recoil prep commit: `95309a80a2074338ebd5cc95fa464af330b6eacf`
- v479 final gameplay commit: `bfde34ec1566cbd8224905fef51cd44472c24426`
- v479 loader commit: `1ef7f488a3b174f366e9949c29e742c75a5e0250`
- Current `src/game.js` SHA: `73d416aa34164c6051c90078339fec1dd0f66f1b`
- Protected recovery remains **v324** unchanged.

## User-provided v478 video result

User uploaded a ~51 second gameplay video recorded from the live v478 URL:
- `?v=478-37706847064`

User explicitly reported:
- while ADS, the hit/impact is **a little low compared with the reticle**;
- M4 recoil while ADS is **out of control**.

The video confirms both.

This means the v478 structural fixes should remain:
- true optical-axis ADS from the real ACOG aperture geometry;
- removal of the old `-0.008` downward shot offset;
- two-pass ACOG body/glass rendering;
- approved v470 hip placement.

The new issues are fine-tuning on top of that correct structure.

## v479 change 1 — tiny ADS zero raise

v478 returned the rifle ADS shot ray to camera center.

The v478 video still shows impact just slightly below the modeled reticle, so v479 adds a very small upward rifle-only ADS zero:

- `rifleAdsZeroY = +0.003`

Only applies when:
- `aiming===true`
- `weapon==="rifle"`

Effect:
- raises M4 ADS impact slightly;
- hip-fire ray is unchanged;
- every other weapon is unchanged.

This is deliberately much smaller than the old v476/v477 `-0.008` correction.

## v479 change 2 — calm M4 ADS recoil

The old M4 whole-gun recoil was still applied at full strength through the ACOG.

At each shot the existing rifle recoil value could kick the complete ADS viewmodel sharply, making automatic fire through the optic hard to control.

v479 now smoothly scales only the M4 viewmodel recoil as ADS comes in:

- hip-fire M4 recoil scale = `1.0`
- full-ADS M4 recoil scale = `0.22`
- blend follows `aimBlend`

Current behavior:
- `rifleAdsRecoilScale = lerp(1, 0.22, aimBlend)`
- whole-gun recoil uses that scale only for the rifle.

This keeps:
- hip-fire recoil unchanged;
- base rifle recoil state unchanged;
- other weapons unchanged;
- no camera recoil system was added or removed.

## Preserved v478 fixes

Do not regress these:

### Real optical-axis ADS
- exact ACOG mesh: `acog_optic.001_0`;
- rear/front 5% aperture bands define the real optical axis;
- ADS quaternion aligns that axis camera-forward;
- rear aperture remains solved near `0.18` units in front of the eye.

### Two-pass ACOG
- opaque housing pass;
- transparent glass pass;
- prevents the overwhelmingly opaque scope body from self-sorting as one transparent mesh at hip.

### Approved placement
- v470 hip placement remains the baseline;
- no new hip position/scale/orientation changes in v479.

## Intentionally unchanged

v479 does **not** change:
- M4 hip placement;
- ACOG geometry;
- ACOG optical-axis calculation;
- ACOG eye distance;
- rifle ADS FOV;
- base M4 damage/spread/fire rate;
- reload choreography;
- sound;
- ammo;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

Verification:
- latest v479 gameplay diff is limited to rifle ADS zero and ADS viewmodel recoil scale;
- full `src/game.js` syntax parse passed.

## v479 test focus

User should check:
1. ADS impact/hit now lands on the reticle instead of slightly low;
2. automatic-fire recoil through the ACOG is much calmer and controllable;
3. true optical-axis ADS remains aligned;
4. hip-fire ACOG still renders cleanly;
5. approved hip placement remains unchanged.

If impact is still slightly off, adjust only `rifleAdsZeroY` from the next video/screenshot. If recoil needs one more adjustment, change only the rifle ADS recoil scale.

---

# M4 TUNING PHASE — 2026-10-07 — v478 — TRUE OPTICAL-AXIS ADS + TWO-PASS ACOG — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=478`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v478 gameplay commit: `3059db7d2fc70349175a77243fb9fee53ab307a8`
- v478 loader commit: `0cbf57898ff846029d8935a368162f3118aa02e2`
- v478 loader Pages run: `37706610309` — build/deploy succeeded.
- Current `src/game.js` SHA: `7e205729b4f87389613c56f745362fafad3b796a`
- Protected recovery remains **v324** unchanged.

## User-provided v477 video result

User uploaded a ~21.5 second gameplay video and explicitly reported:
- while ADS, the scope/reticle is not actually lined up with the shot;
- impacts do not land where the modeled sight is aimed;
- the ACOG still looks broken at hip-fire even though the source GLB is known-good.

The video confirms both issues.

### ADS diagnosis

Previous builds centered ADS using the **whole ACOG outer bounding box**.

That is not the true optical center because the ACOG mesh includes:
- housing;
- mount;
- knobs;
- the actual tube/lens.

v477 also added a manual `-2.5°` full-ADS pitch and retained a manual `rifleAdsZeroY=-.008` shot correction.

Those separate guesses could not guarantee that:
1. modeled optic axis;
2. camera center;
3. bullet ray

all agreed.

### Hip-fire ACOG diagnosis

A temporary repo-side GLB diagnostic parsed the actual `acog_optic.001_0` geometry and `optic.001` texture alpha, then the diagnostic workflow was deleted.

Important measured facts:
- ACOG position geometry longitudinal range is local Y `-0.647548...` to `0.789419...`;
- rear 5% aperture band mean is approximately local X `-0.02582`, local Z `0.04577`;
- front 5% aperture band mean is approximately local X `-0.02496`, local Z `0.02683`;
- the ACOG base-color PNG is 1024×1024;
- **1,000,538 / 1,048,576 pixels are fully opaque alpha 255**;
- only **44,627 pixels are below alpha 250**.

Therefore the ACOG is overwhelmingly opaque housing with a small translucent glass area.

Rendering the entire mesh as one transparent object was the reason hip-fire could show internal knobs/body geometry through the housing. The GLB geometry itself remains valid.

Temporary detailed diagnostic workflow was removed in commit:
- `f50098127dd849a33a0d4b0df4e0d7ed1529cb65`

## v478 fix — ADS from the actual optical tube

v478 no longer uses the ACOG outer-box center.

At M4 rebuild:
1. find exact mesh `acog_optic.001_0`;
2. inspect its real position attribute;
3. average the rear-most 5% of the tube vertices;
4. average the front-most 5%;
5. transform those aperture centers into M4-root space;
6. build the real optical-axis vector from rear center to front center;
7. calculate the quaternion that aligns that axis exactly with camera forward `(0,0,-1)`;
8. solve the M4 root position so the actual rear aperture lands at screen center about `0.18` units in front of the eye.

This replaces:
- whole-housing box-center aiming;
- the manual `adsEyeYCorrection`;
- the v477 `-2.5°` ADS pitch guess.

Hip pose remains the approved v470 pose and quaternion-slerps into the true optical-axis ADS quaternion.

## v478 shot alignment

The previous M4-only manual shot offset:
- `rifleAdsZeroY=-.008`

is removed.

Once the modeled optical axis itself is centered on camera forward, the M4 ADS shot ray returns to true screen/camera center.

The goal is now one shared line:
- modeled ACOG optical axis;
- screen center;
- bullet ray.

No independent visual-vs-hit offsets remain.

## v478 fix — two-pass ACOG rendering

The actual GLB ACOG remains in use.

Instead of making the entire scope transparent:

### Opaque body pass
- original ACOG mesh;
- `transparent=false`;
- `depthWrite=true`;
- `depthTest=true`;
- `alphaTest=.985`;
- `alphaToCoverage=true`;
- emissive strength remains clamped to `.15`.

This writes proper depth for the overwhelmingly opaque housing and prevents internal scope geometry from showing through it at hip.

### Transparent glass pass
- clone of the exact same ACOG geometry;
- uses the original texture/material maps;
- `transparent=true`;
- `depthWrite=false`;
- `depthTest=true`;
- discards fully/near-opaque pixels in the shader and renders only the small translucent glass region;
- emissive remains clamped to `.15`.

This keeps the real modeled lens see-through without turning the entire housing into one transparent self-sorting object.

## Intentionally unchanged

v478 does not change:
- approved v470 hip position;
- M4 normalized overall size;
- M4 forward orientation;
- ADS FOV 48;
- recoil;
- damage/spread/fire rate;
- ammo;
- sounds;
- reload choreography;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

Verification:
- full current `src/game.js` syntax parse passed;
- exact v478 diff is limited to M4 optic-axis calculation, M4 ACOG body/glass rendering, removal of M4 manual ADS zero, and quaternion ADS blending;
- protected v324 recovery remains unchanged.

## v478 test focus

User should verify from gameplay/video:
1. at hip, the ACOG housing no longer looks split/open or shows internal knobs through itself;
2. ADS moves the **real optical tube** directly to eye center;
3. reticle/sight picture is centered without manual visual nudges;
4. shots land exactly where the modeled ACOG is aimed;
5. approved hip placement is otherwise unchanged.

If any tiny ADS correction remains after v478, tune from the optical-axis result only. Do not reintroduce separate visual and bullet offsets.

---

# M4 TUNING PHASE — 2026-10-06 — v477 — ADS REAR-DROP TEST ONLY — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=477`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v477 gameplay commit: `3140614df9ca37b76f0413f0edf717794167dfe6`
- v477 loader commit: `ee4b44924de17e05e41e8e30c3bda084b4465f51`
- Current `src/game.js` SHA: `1760f0847385de32f58735cb13910ffb89be3611`
- Protected recovery remains **v324** unchanged.

## User's requested next step

After v476 the user said the rear of the gun still needs to come down while ADS and chose **option 1 first**.

This build intentionally changes only one variable so the result is easy to judge.

## v477 change

Only the M4 full-ADS pitch endpoint changes:

Before:
- hip pitch = `-8°`
- full ADS pitch = `0°`

Now:
- hip pitch = `-8°`
- full ADS pitch = `-2.5°`

Current line:
- `m4ViewRoot.rotation.x = lerp(-8°, -2.5°, aimBlend)`

Effect:
- rear of rifle stays slightly lower at full ADS;
- front of rifle rises relative to the rear;
- reticle/iron-sight relationship can be judged without changing any other ADS variable.

## Intentionally unchanged

v477 does **not** change:
- ACOG material;
- ACOG vertical target correction;
- horizontal alignment;
- eye distance;
- FOV 48;
- rifle ADS shot zero;
- approved v470 hip placement;
- recoil;
- damage/spread/fire rate;
- reload;
- sound;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

Verification:
- exact gameplay diff is one line;
- full `src/game.js` syntax parse passed.

## v477 test focus

Check only:
1. whether the rear of the rifle is now lower enough in ADS;
2. whether the reticle lines up better with the iron sight;
3. whether the scope still sits acceptably relative to the eye.

Do not change scope material or shot zero until this pitch-only test is evaluated.

---

# M4 TUNING PHASE — 2026-10-06 — v476 — ACOG VIEW CLEANUP / FINAL ADS ZERO NUDGE — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=476`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v476 gameplay commit: `0f11aa9b4f5b452d3fcfb052e554e8f3015e1e8e`
- v476 loader commit: `547bb3999857252fc87d4785441fade77e9e71fd`
- Current `src/game.js` SHA: `abd72e7e112bc815ab1dd7963c8df3a08b3c5922`
- Protected recovery remains **v324** unchanged.

## User-observed v475 result

User supplied a screenshot and said:
- ADS is very close;
- scope still looks a bit broken;
- scope still sits a little high;
- bullet hit lands just a hair above the iron sight.

The screenshot shows:
- real ACOG is now see-through;
- horizontal alignment is good;
- eye distance is good;
- only a small additional vertical correction is needed;
- the remaining scope artifact is consistent with our runtime material still forcing blended glass to write depth / use alpha-test behavior instead of behaving like the authored BLEND material.

## v476 changes

### 1. Small additional ACOG vertical correction

ADS eye-line correction changed:
- from `-.034`
- to `-.042`

This lowers only the full-ADS ACOG target a small amount.

### 2. ACOG blended-depth cleanup

Keep the real GLB ACOG and its transparency, but make the runtime material behave more like authored glTF `alphaMode: BLEND`:

- `transparent=true`
- `depthWrite=false`
- `depthTest=true`
- `alphaTest=0`
- no forced front-side override
- emissive intensity remains clamped at `.15`

This is intended to clean up the remaining internal/split transparency artifact while preserving see-through glass.

### 3. Tiny M4 ADS shot-zero correction

The rifle ADS ray now uses:
- `rifleAdsZeroY=-.008`

Only while:
- aiming;
- weapon is `rifle`.

This moves the impact point slightly downward so it lands on the sight instead of just above it.

Hip-fire and every other weapon's ray remain unchanged.

## Intentionally unchanged

v476 does not change:
- approved v470 hip placement;
- horizontal ACOG alignment;
- rear-lens distance;
- ADS FOV 48;
- scale/orientation;
- recoil;
- damage/spread/fire rate;
- ammo;
- sounds;
- reload choreography;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

Verification:
- exact v476 gameplay diff contains only the three M4 ADS/material refinements above;
- full `src/game.js` syntax parse passed.

## v476 test focus

Check:
1. scope sits slightly lower and more naturally centered;
2. see-through ACOG looks cleaner internally;
3. bullet impact now lands on the sight instead of just above it;
4. horizontal alignment and eye distance remain good;
5. approved hip placement remains unchanged.

If this is good, preserve these M4 placement/ADS values before moving on to the next M4 issue.

---

# M4 TUNING PHASE — 2026-10-06 — v475 — ORIGINAL ACOG GLASS TRANSPARENCY RESTORED — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=475`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v475 gameplay/material commit: `3194812a2c7fae48f0a881b8b24ca83362398d2e`
- v475 loader commit: `13a8096ad6bc2d270a42198967b8550c70c4812a`
- Current `src/game.js` SHA: `6d2332ae17c88e82b1f3602b00061491192ec480`
- Protected recovery remains **v324** unchanged.

## What the v474 screenshot proved

User showed the real ACOG aligned in ADS but completely black/opaque through the lens and said they know the GLB itself can be viewed through.

The cause is confirmed in our own runtime material override from v472:
- we set the original ACOG material to `transparent=false`;
- that stopped the earlier transparency/emissive artifact;
- but it also made the modeled glass surface opaque.

So the uploaded GLB was not at fault. Our v472 material override removed its see-through behavior.

## v475 fix

Only the runtime ACOG material transparency is corrected.

Before:
- `transparent=false`
- `alphaTest=.12`

Now:
- `transparent=true`
- `alphaTest=.02`

Preserved from the v472 stabilization:
- `opacity=1`
- `depthWrite=true`
- `depthTest=true`
- emissive intensity reduced to `.15`
- original GLB geometry/textures/material maps remain in use.

This restores the GLB's intended lens transparency while keeping the strong Sketchfab emissive export from blowing out the optic in-game.

## Intentionally unchanged

v475 does not change:
- v470 hip placement;
- v474 vertical ADS correction;
- horizontal ADS alignment;
- rear-lens distance;
- ADS FOV 48;
- recoil;
- damage/spread/fire rate;
- ammo;
- sound;
- reload choreography;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

Verification:
- exact v475 gameplay diff is limited to two ACOG material lines;
- full `src/game.js` syntax parse passed.

## v475 test focus

Check:
1. real ACOG remains centered as in v474;
2. lens is now actually see-through;
3. hip-fire optic still looks correct;
4. no return of the old glow/split artifact.

If transparency is restored but the glass still needs tuning, adjust only the real ACOG material next.

---

# M4 TUNING PHASE — 2026-10-06 — v474 — ACOG ADS VERTICAL EYE-LINE CORRECTION — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=474`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v474 ADS vertical-fix commit: `58c5605ee155031b3360943a5e4670cdf211a267`
- v474 loader commit: `6f3511eceaf966f0a6909648820a7d059eb71318`
- Current `src/game.js` SHA: `0bbc70d1a44458a4d74d06a0697f937cc4778e50`
- Protected recovery remains **v324** unchanged.

## User-observed v473 result

User tested true model-based ACOG ADS and said it was a **really good first try**.

Screenshot/feedback confirmed:
- real ACOG moves to the eye;
- horizontal centering is already very close;
- eye distance / scope size is already close;
- hip placement remains approved;
- primary remaining problem: ACOG viewing axis sits **way too high** on screen.

The screenshot places the optic center roughly 200 pixels above the screen center at 1920×1080.

## v474 change — vertical ADS only

Only the calculated full-ADS ACOG eye line changes.

The real GLB ACOG target calculation now adds:
- `adsEyeYCorrection=-.034`

This lowers the full-ADS M4/ACOG target while leaving:
- X centering unchanged;
- rear lens distance unchanged at about `0.18`;
- rifle ADS FOV unchanged at `48`;
- v470 hip placement unchanged;
- ACOG material fix unchanged;
- true model-based ADS path unchanged.

The correction is based on the user's v473 screenshot and the current 48° ADS FOV / rear-lens distance rather than changing multiple transform values at once.

## Intentionally unchanged

v474 does not change:
- M4 hip pose;
- scale;
- yaw/pitch/roll behavior outside the existing ADS blend;
- scope distance;
- FOV;
- recoil;
- damage/spread/fire rate;
- ammo;
- sound;
- reload choreography;
- temporary M4 starting loadout;
- any unrelated weapon/game system.

Verification:
- exact v474 gameplay diff is limited to the ACOG target Y calculation;
- full `src/game.js` syntax parse passed.

## v474 test focus

Check:
1. ACOG is now centered vertically on the eye/screen;
2. horizontal centering stays good;
3. scope distance/size still feels good;
4. player can naturally look through the modeled optic;
5. hip placement remains exactly as approved.

If it still needs adjustment, tune only the ADS eye target from the next screenshot.

---

# M4 TUNING PHASE — 2026-10-06 — v473 — TRUE MODEL-BASED ACOG ADS — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=473`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v473 true-ADS gameplay commit: `06944eb7cc3cd11e9fa7a6dbe816d727fd711cc8`
- v473 loader commit: `c909e73b25f33ee2617f981ed731bced8cf389c9`
- Current `src/game.js` SHA: `e5bcc7fe28a5579dd66eeb868f4b65a9fa698978`
- Protected recovery remains **v324** unchanged.

## User-confirmed v472 result

User tested the real GLB ACOG after the Three.js material correction and said: **"perfect"**.

That means:
- original ACOG geometry from the uploaded GLB is approved;
- v470 overall M4 placement remains approved;
- do not replace the optic geometry;
- do not move the hip-fire pose unless the user explicitly asks.

## User's v473 request

User wants true ADS using the actual modeled ACOG:
- bring the scope to the player's eye;
- keep the real M4 visible;
- look through the modeled optic;
- stop using the old fake/full-screen M4 scope overlay.

## v473 change — actual model-based ADS

The old M4 ADS path was still legacy behavior:
- right-click showed `scopeOverlay`;
- the complete gun was hidden while aiming;
- the player never actually looked through the modeled ACOG.

v473 removes that behavior **for the M4 only**.

### Real ACOG alignment

The game now finds the actual GLB node:
- `acog`
- fallback mesh: `acog_optic.001_0`

At rebuild time it:
1. measures the real ACOG bounding box;
2. finds the optic center;
3. uses the existing normalized M4 scale;
4. computes a full-ADS root target that centers the optic on the camera;
5. places the rear of the ACOG about **0.18 first-person units in front of the camera**.

This means the final ADS position is based on the actual uploaded GLB geometry instead of hand-tuned guesses.

### M4 overlay removed

For M4:
- `scopeOverlay` no longer opens;
- `gun.visible` stays true while aiming;
- crosshair still fades out while aiming;
- current rifle ADS FOV remains `48`.

AWM behavior is unchanged:
- AWM still uses the full-screen scope overlay;
- AWM still hides its viewmodel while scoped.

### Hip placement preserved

v470 hip pose remains exactly:
- X `.54`
- Y `-.56`
- Z `-1.48`
- pitch `-8°`
- roll `-6°`

As `aimBlend` approaches 1, M4 root position now blends to the dynamically calculated ACOG eye-alignment target.

M4 rotation still blends to zero at full ADS.

## Intentionally unchanged

v473 does not change:
- v472 ACOG material fix;
- v470 hip placement;
- rifle scale normalization;
- recoil;
- damage/spread/fire rate;
- ammo;
- sounds;
- reload choreography;
- temporary M4 starting loadout;
- other weapons;
- AWM scope behavior.

Verification:
- exact v473 gameplay diff is limited to M4 ACOG ADS target calculation and removal of legacy M4 overlay/hide behavior;
- full `src/game.js` syntax parse passed.

## v473 test focus

User should test right-click ADS and report:
1. does the real ACOG move to the eye smoothly;
2. is the optic centered;
3. can the player see through the modeled scope naturally;
4. is the rear lens too close/far;
5. is FOV 48 comfortable or should magnification be stronger/weaker;
6. hip placement still looks exactly like approved v470/v472.

Do not change hip placement while tuning ADS.

---

# M4 TUNING PHASE — 2026-10-06 — v472 — ORIGINAL GLB ACOG RESTORED / THREE.JS MATERIAL FIX — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=472`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v472 gameplay/material-fix commit: `36afed664c22853e1a4b916e667b31ab5ebd457d`
- v472 loader commit: `bacd8818502fa26973ddebffb6ab02feca2378d9`
- Current `src/game.js` SHA: `20e5c4c0428fd24184e8fb2a2d300d4be469ea64`
- Protected recovery remains **v324** unchanged.

## Critical GLB inspection result

The user said the replacement GLB itself opens correctly on their end and asked us to inspect the actual binary instead of assuming the model was broken.

A temporary GitHub Actions diagnostic parsed the binary `assets/ar-15_style_rifle.glb` directly, then the workflow was deleted.

Confirmed GLB facts:
- GLB version 2, about 12.75 MB;
- source metadata identifies Sketchfab model **AR-15 style rifle**;
- the scope is a real separate node named `acog`;
- its mesh is `acog_optic.001_0`;
- its material is `optic.001`;
- the optic geometry/accessor bounds are valid;
- there is no malformed/broken scope geometry in the GLB.

The important exporter/material detail:
- `optic.001` uses `alphaMode: BLEND`;
- it also uses an emissive texture;
- emissive factor is white;
- `KHR_materials_emissive_strength` is **10.0**.

That combination renders correctly in Sketchfab but is the likely cause of the broken-looking ACOG inside Three.js:
- the whole ACOG mesh becomes one transparent object;
- self-depth/transparency sorting can look wrong in first person;
- emissive strength 10 greatly exaggerates the visual artifact.

Therefore the problem is **our Three.js material handling, not the user's GLB geometry**.

## v471 status

v471's procedural replacement optic is **not the intended solution**.

The user explicitly objected and asked us to inspect the real GLB. v472 removes the fake optic approach.

## v472 fix

v472 restores the original ACOG geometry from the uploaded GLB.

Only the original ACOG material is corrected in-game:
- detect exact mesh `acog_optic.001_0` / material `optic.001`;
- clone that optic material only;
- preserve its original textures/normal maps/geometry;
- disable whole-mesh transparent blending;
- restore normal depth test/write;
- use a small alpha-test threshold for texture cutout behavior;
- reduce emissive intensity from exported 10.0 to 0.15;
- keep front-side rendering.

The rest of the GLB is untouched.

## Placement baseline remains approved v470

User explicitly said they like the v470 placement.

v472 does **not** change:
- hip X/Y/Z;
- M4 pitch/roll;
- scale normalization;
- forward orientation;
- ADS blend target;
- recoil;
- damage/spread/fire rate;
- ammo;
- sounds;
- reload choreography;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

## v472 test focus

Check:
1. v470 placement still looks exactly the same;
2. the original GLB ACOG is back;
3. the ACOG no longer looks split/broken/over-glowing;
4. ADS still behaves normally.

If optic appearance is still wrong, continue from the actual `acog` node/material rather than replacing the geometry.

---

# M4 TUNING PHASE — 2026-10-06 — v471 — BROKEN IMPORTED OPTIC REPLACED — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=471`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v471 optic replacement commits:
  - `672e5440a3ad3bb92de4b2309838bcf33a856967`
  - `5bc5a8e6873dd0b0464a0d5b2fda7b0c54bdfcdc`
- v471 loader commit: `4ba8eb387bdd049eccc3a7a3f493a90d2da5dd97`
- v471 successful Pages run: `37537472601`
- Current `src/game.js` SHA: `bd5527dd50f96c8a4179fa0eb75dce7188032576`
- Protected recovery remains **v324** unchanged.

## User-observed v470 result

User supplied a screenshot and said:
- **they like the v470 placement for sure**;
- the imported scope/optic still looks very broken.

Therefore v470's complete M4 pose is now the placement baseline and must not be changed while fixing the optic.

## v471 change — optic only

The v470 M4 placement is preserved exactly.

The replacement GLB's broken imported optic is hidden:
- semantic names are preferred: scope / optic / acog / lens / eyepiece / eyecup / reticle / sight;
- if the exporter used generic names, a bounded top/rear spatial fallback removes the imported optic region only.

A clean compact M4 optic is mounted procedurally in the replacement rifle's local coordinate space:
- dark metal tube;
- clean front/rear lens surfaces;
- compact mount;
- follows the rifle root naturally through hip, ADS blend and reload.

The second v471 commit corrected transform-space handling before deployment so optic detection and placement are based on the rifle's raw local geometry rather than already-transformed camera coordinates.

## Intentionally unchanged

v471 does **not** change:
- v470 hip placement;
- M4 scale;
- forward orientation;
- ADS pose/blend;
- recoil;
- damage/spread/fire rate;
- ammo;
- sounds;
- reload choreography;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

Verification:
- full `src/game.js` syntax parse passed;
- v471 loader Pages run `37537472601` completed successfully.

## v471 test focus

Check only:
1. v470 placement still looks the same;
2. broken imported optic is gone;
3. clean replacement optic sits properly on top of the rifle;
4. ADS still behaves normally.

If placement remains approved, do not alter it in the next step.

---

# M4 TUNING PHASE — 2026-10-06 — v470 — DEDICATED FIRST-PERSON M4 POSE — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=470`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v470 pose commit: `4b84bcdd5cb7f3f49ee790540da5425a52ec9963`
- v470 loader commit: `ad2f38fa61e77ade8245d81bc65ab3b111cbbf54`
- v470 successful Pages run: `37535907982`
- Current `src/game.js` SHA: `1fe960e410eacaf73890b15f3276166ae6df9b84`
- Protected recovery remains **v324** unchanged.

## User-observed v469 result

User supplied another screenshot and said the M4 **still looked very broken**.

The screenshot showed:
- orientation was correct;
- scale was usable;
- rifle was still too centered/upright in first person;
- rear/stock area still crowded the camera;
- front perspective still felt stretched;
- optic still looked wrong in the bad pose.

User then explicitly told us to stop explaining and **just do the fix**.

## v470 change — replacement M4 gets its own first-person pose

v469's limited Y/Z hip offset was replaced by a dedicated replacement-M4 pose.

### Hip-fire pose

At hip:
- X = `.54` — moves rifle farther right;
- Y = `-.56` — lowers it substantially;
- Z = `-1.48` — brings the complete rifle back from the stretched/far-away v469 perspective;
- pitch = `-8°`;
- yaw = `0°`;
- roll = `-6°`.

The same pose is also used immediately when the GLB is rebuilt so there is no old neutral-pose flash.

### ADS blend

As `aimBlend` reaches full ADS, the replacement M4 smoothly returns to the existing centered ADS root:
- X `.36`;
- Y `-.25`;
- Z `-1.66`;
- rotation `0,0,0`.

This preserves the existing ADS target while giving hip-fire a proper shouldered/right-side pose.

### Reload

Reload uses the existing neutral root:
- position `.36,-.25,-1.66`;
- rotation `0,0,0`.

Reload choreography itself was not rewritten.

## Intentionally unchanged

v470 does not change:
- bounds-based scale normalization;
- forward/backward M4 orientation;
- ADS configuration/FOV;
- recoil;
- damage/spread/fire rate;
- ammo;
- sound;
- magazine lookup;
- temporary M4 starting loadout;
- any unrelated weapon/game system.

The optic mesh itself is still untouched. First test this corrected complete-gun pose; if the optic still looks malformed, fix the optic separately next.

Verification:
- exact v470 gameplay diff is limited to M4 root pose/rebuild and M4 runtime pose blending;
- full `src/game.js` syntax parse passed;
- Pages run `37535907982` completed successfully.

## v470 test focus

User should check only:
1. does the M4 now sit lower/right like a shouldered rifle;
2. does it stop looking held against the chin;
3. does the front perspective look less stretched/far away;
4. does the optic still look broken in this improved pose;
5. what happens when entering ADS.

If the optic is still visibly malformed, make the next build an optic-only M4 fix.

---

# M4 TUNING PHASE — 2026-10-06 — v469 — HIP-FIRE PLACEMENT CORRECTION — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=469`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v469 hip-pose commit: `f2e7ff414d7ca3fdd0d2e2d7127bf0445b2cd129`
- v469 loader commit: `cd9dab90bba29b7968ea9ac8cbb7f86db251222f`
- v469 successful Pages run: `37534672201`
- Current `src/game.js` SHA: `e6e84c74067bd5311f1716acfbe4f3f4d08d412e`
- Protected recovery remains **v324** unchanged.

## User-observed v468 result

User supplied a screenshot and reported:
- M4 now points the correct direction;
- the scope/optic looks broken;
- the front of the gun feels too far away;
- the pose looks like the player is holding the rifle up to their chin.

Screenshot interpretation:
- replacement M4 orientation is now correct;
- scale remains usable;
- the stock/rear of the rifle crowds the camera too high/close in hip-fire, exaggerating perspective and making the rifle look stretched;
- optic appearance may be partly caused by this poor hip viewing angle and should not be separately modified until placement is corrected.

## v469 change — hip pose only

Only the replacement M4's hip-fire position changed.

Before:
- hip Y inherited `-.25`;
- hip Z was `-1.62`;
- ADS/reload used approximately `-.25 / -1.66`.

Now while not reloading:
- hip Y starts at `-.42` and smoothly returns to `-.25` as ADS reaches full aim;
- hip Z starts at `-1.85` and smoothly returns to `-1.66` as ADS reaches full aim.

During reload:
- Y remains `-.25`;
- Z remains `-1.66`.

Therefore:
- the hip-fire rifle sits lower;
- the complete rifle sits a little farther from the camera, reducing the oversized stock/chin effect and perspective stretch;
- **full ADS position is intentionally unchanged**;
- **reload position is intentionally unchanged**.

## Optic/scope handling

The scope itself was **not modified in v469**.

Reason:
- the screenshot was taken from the bad hip pose;
- first correct the complete rifle placement;
- then use the v469 screenshot to determine whether the optic is genuinely malformed/backward or was simply viewed from an extreme angle.

Do not hide, rotate, replace, or procedurally rebuild the optic until the user tests v469.

## Intentionally unchanged

- bounds-based scale normalization;
- M4 Y orientation;
- full ADS transform/position;
- recoil;
- firing/spread/damage;
- ammo;
- sound;
- reload choreography;
- magazine lookup;
- temporary M4 starting loadout;
- unrelated weapons/game systems.

Verification:
- full `src/game.js` syntax parse passed;
- exact v469 gameplay diff is limited to the M4 hip-pose block;
- Pages run `37534672201` completed successfully.

## v469 test focus

User should send/describe:
1. whether the rifle now feels shouldered instead of held at the chin;
2. whether the stock/rear looks less oversized;
3. whether the front of the rifle feels less excessively distant;
4. what the optic looks like now in hip-fire;
5. optionally what ADS looks like, since full ADS placement was preserved.

Then address the optic separately if it still looks broken.

---

# M4 TUNING PHASE — 2026-10-06 — v468 — REPLACEMENT M4 ORIENTATION FLIP — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=468`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v468 orientation-fix commit: `16df10a4ccf392bc752ac34946d00cf50f138734`
- v468 loader commit: `d651da078e308db717fb3662e29db4313cde6a7c`
- Current `src/game.js` SHA: `815ff85b302473435355d65189d618430ba20864`
- Protected recovery remains **v324** unchanged.

## User-observed v467 result

User supplied a screenshot of v467 and reported the replacement M4 was **pointed the wrong way**.

The screenshot confirmed:
- the v467 bounds-based scale normalization worked well enough to make the complete rifle visible;
- the black/blocked-screen problem from v466 was gone;
- the rifle was oriented 180° backward, with the front end pointing toward the player/camera.

## v468 change

Only M4 horizontal orientation changed:

Before:
- `m4Root.rotation.y=Math.PI`

Now:
- `m4Root.rotation.y=0`

This removes the old asset's 180° Y rotation, which the replacement GLB does not need.

## Intentionally unchanged

v468 does **not** change:
- bounds-based scale normalization;
- hip-fire position;
- ADS transforms;
- recoil;
- firing/spread/damage;
- ammo;
- sounds;
- reload choreography;
- magazine lookup;
- temporary M4 starting loadout;
- any unrelated weapon/game system.

Verification:
- exact v468 gameplay diff is one line;
- full `src/game.js` syntax parse passed.

## v468 test focus

User should confirm:
1. barrel now points away from the player;
2. stock is toward the player;
3. size remains reasonable;
4. note where the rifle sits in hip-fire;
5. test ADS only after orientation is confirmed.

Do not combine position/ADS changes into the orientation fix. Make the next M4-only adjustment from the user's v468 screenshot/feedback.

---

# M4 TUNING PHASE — 2026-10-06 — v467 — REPLACEMENT M4 SCALE NORMALIZATION — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Loader: `./src/game.js?v=467`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v467 scale-fix commit: `3b3a2d45da09d47a407e95bfb4cea98bebaf25e1`
- v467 loader commit: `57bbc3aa8888a122cf10aa98974193568ef1e20c`
- v467 successful Pages run: `37532220116`
- Current `src/game.js` SHA: `c6d007875d4544340a6dea8fea40a3b70e250e7c`
- Protected recovery remains **v324** unchanged.

## Why v467 was needed

User tested v466 and supplied a screenshot showing:
- almost the entire world view blacked out;
- only a large dark triangular/sliver-like portion of the weapon visible near the lower-left;
- HUD remained visible.

Diagnosis:
- the new GLB was loading correctly;
- the old hard-coded M4 scale `5.15` was specific to the previous `classic_m4` asset;
- the replacement GLB uses a different authored scale, so multiplying it by 5.15 made the rifle enormous around/inside the camera.

## v467 change

Only M4 visual scale handling changed.

Before:
- M4 root always used `scale.setScalar(5.15)`.

Now:
- clone the replacement M4;
- compute its actual `THREE.Box3` bounds;
- read the largest dimension;
- scale the replacement so its longest dimension becomes about `3.45` first-person units, matching the established old M4 visual length.

Current code concept:
- `m4RawSize = new THREE.Box3().setFromObject(m4Root).getSize(...)`
- `m4RawLength = max(x,y,z)`
- `m4Root.scale = 3.45 / m4RawLength`

This makes the replacement asset independent of its source-file unit scale.

## Intentionally unchanged

Do not treat v467 as final M4 placement.

Still unchanged:
- M4 orientation/rotation;
- hip-fire position;
- ADS transforms;
- recoil;
- firing/spread/damage;
- ammo;
- sound;
- reload choreography;
- magazine node lookup;
- temporary M4 starting loadout.

## v467 test focus

The next test is specifically to see the whole replacement rifle clearly enough to tune it.

User should report:
1. whether the black/blocked screen is gone;
2. whether the complete rifle is visible;
3. whether it faces the correct direction;
4. whether size now looks reasonable;
5. where it sits in hip-fire;
6. what ADS looks like.

Do not change multiple transform values at once. Use the visible v467 result to tune one M4-only issue per build.

---

# M4 TUNING PHASE — 2026-10-06 — v466 — NEW M4 GLB FULL VIEWMODEL REPLACEMENT — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=466`
- New uploaded M4 asset: `assets/ar-15_style_rifle.glb`
- Asset upload commit: `07f513f3e57a018f655be2ae73d642c5f78a66ee`
- v466 gameplay/model-swap commit: `a9ca029ecc65154f96a100397a1953346dc279ae`
- v466 loader commit: `9859c166028eb5232c58b2acfd1472a99bb219e5`
- v466 successful Pages run: `37531314757`
- Current `src/game.js` SHA: `bb34c8b8faddcfd457d8690b7052155eb9528137`
- Protected recovery remains **v324** unchanged.

## v466 M4 model replacement

User uploaded `assets/ar-15_style_rifle.glb` and requested it fully replace the old M4 model.

Current runtime M4 loader now uses:
- `assets/ar-15_style_rifle.glb?v=466`

The previous runtime source:
- `assets/classic_m4.glb.glb`

is no longer referenced by `src/game.js`.

The old file remains in `assets` only as an unused rollback asset; it is not loaded or displayed by the game.

### Scope intentionally limited

v466 changed only the M4 GLB source URL.

The existing M4 first-person setup is deliberately preserved for the first visual test:
- current scale unchanged;
- current rotation unchanged;
- current hip-fire position unchanged;
- current ADS transforms unchanged;
- recoil unchanged;
- firing/spread/damage unchanged;
- ammo unchanged;
- sounds unchanged;
- reload logic unchanged.

The current model-specific magazine lookup still attempts:
- `Magazine_m4_0`
- `Magazine`

If the new GLB uses different node names, the weapon itself will still load, but detachable-mag reload visuals may need a separate M4-only follow-up after the user tests the replacement.

Verification:
- exact v466 gameplay diff is one line replacing the old M4 GLB source with the new uploaded asset;
- full `src/game.js` syntax parse passed;
- Pages run `37531314757` completed successfully;
- no unrelated gameplay system was changed.

## Temporary M4 starting loadout remains active

v465's temporary tuning loadout remains in place:
- new game starts holding M4;
- reset/restart starts holding M4;
- M4 is unlocked;
- M17 remains unlocked/switchable.

Keep this temporary setup until the user explicitly says M4 tuning is finished.

## v466 test focus

User should now inspect the replacement M4 and report:
1. whether the new model appears;
2. whether its size is too large/small;
3. whether it faces the correct direction;
4. whether hip-fire placement is correct;
5. whether ADS lines up;
6. whether reload/magazine visuals still work.

Do not adjust those values until the user reports what is visually wrong.

---

# M4 TUNING PHASE — 2026-10-06 — v465 — TEMPORARY M4 STARTING LOADOUT — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=465`
- v465 gameplay commit: `1a4bb5091c4d877524f7af81153ff6ccf3a86757`
- v465 loader commit: `c3ba421d4d0acdb3ee6ee6785b7587853623cc7f`
- Current `src/game.js` SHA: `1c3f27a55c4e315ce955192d4eee7890f09123ae`
- **v464 remains the latest user-confirmed good baseline before this M4 tuning change.**
- Protected recovery remains **v324** and must not be changed unless the user explicitly approves a new recovery checkpoint.

## New phase: M4 tuning

User wants to work specifically on the M4 and requested that the player temporarily spawn with it until the M4 is in a good spot.

The user also said they will later upload a **new GLB file to replace the old M4 model** once this phase is underway.

### v465 change — temporary M4 starting loadout

Only the starting weapon/unlock state changed in two places:
1. initial game state;
2. full reset/restart state.

Both now use:
- `weapon="rifle"`
- `unlocked.rifle=true`

The M17 remains unlocked:
- `unlocked.pistol=true`

This means:
- a new run starts with the M4 already in the player's hands;
- restart/reset also starts with the M4;
- the player can still switch to the M17;
- the M4 does not need to be purchased before testing.

No other M4 behavior changed in v465:
- current M4 model is unchanged;
- ADS/transforms are unchanged;
- recoil is unchanged;
- firing ray/spread/damage are unchanged;
- ammo remains the existing rifle ammo state;
- sounds are unchanged;
- reload behavior is unchanged;
- store code is otherwise unchanged.

Verification:
- full `src/game.js` syntax parse passed;
- exact gameplay diff is limited to the two starting-loadout definitions;
- no map, zombie, ragdoll, crawler, grenade, rain, collision, M240, boss, sprint, pause/shop, or other gameplay system was changed.

## M4 tuning rule

Until the user says the M4 is in a good spot:
- keep the M4 as the temporary starting weapon;
- make M4 changes one isolated step at a time;
- do not disturb other approved weapons/systems;
- when the user uploads the new M4 GLB, inspect the exact uploaded asset and current M4 loader/model code before replacing anything;
- do not guess the new asset filename/path.

Once the user explicitly says M4 tuning is finished, restore the intended permanent starting loadout as a separate isolated change.

## v465 test focus

User should confirm:
1. starting a new game immediately gives them the M4;
2. restart/reset also gives them the M4;
3. M4 fires/reloads/ADS exactly as it did before;
4. M17 is still available for switching;
5. no unrelated gameplay regression.

---

# CLEANUP COMPLETE — 2026-10-06 — v464 USER-CONFIRMED GOOD — READ THIS FIRST

This section supersedes older cleanup-status sections below. **GitHub main is authoritative.**

## Cleanup phase status

- **CLEANUP/PERFORMANCE PHASE IS COMPLETE.**
- User tested v464 and reported: **"it works"**.
- **v464 is the latest user-confirmed good build.**
- Current live loader: `./src/game.js?v=464`
- Current `src/game.js` SHA: `d81c5ba4f5e152ecafeb13b3f6b4f6dd4ae67d9c`
- Current `src/ui-helpers.js` SHA: `023797b0e936474c622ce32599fe02a550c27076`
- v464 successful gameplay Pages run: `37526091354`
- v464 final documented-state Pages run before this note: `37526330902`

## Final cleanup decision

A final audit was performed after the user confirmed v464 good.

The only remaining obvious low-risk allocation candidate is:
- `getFxCounts:()=>({parts:parts.length,impacts:impacts.length,casings:casings.length})`
- it is consumed by the performance HUD approximately once per second.

That allocation is intentionally **not changed** because:
- it is extremely low frequency;
- the performance gain would be negligible;
- making another code change solely to remove one tiny once-per-second object is not worth adding regression/deployment noise.

Most other remaining allocation sites are inside protected/high-risk systems and must not be touched merely for micro-optimization:
- reload/viewmodel choreography;
- PBD/ragdoll/crawler behavior;
- zombie spawning/connectivity/navigation/collision;
- grenade/spintop;
- map/collision;
- gun transforms/ADS/recoil;
- M240 audio;
- start/death/restart/shop/pause.

## Protected recovery

Protected recovery remains **v324** and is unchanged:
- gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
- protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
- loader `./src/game.js?v=324`

Do not redefine this checkpoint unless the user explicitly approves a new recovery checkpoint.

## What happens next

Do not continue cleanup automatically.

The next development work should be a **new feature/fix phase chosen by the user**, starting from user-confirmed-good v464.

Before any new gameplay change:
1. read the newest top sections of both handoff files;
2. read `CURRENT_RECOVERY_CHECKPOINT.md`;
3. read current `index.html`;
4. read current `src/game.js`;
5. read any module relevant to the requested change;
6. make one isolated change at a time and preserve v464 as the latest confirmed-good cleanup baseline until the user confirms a newer build.

---

# LATEST LIVE STATE — 2026-10-06 — v464 — SPRINT HUD RETURN-OBJECT ALLOCATION CLEANUP — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=464`
- v464 sprint HUD helper cleanup commit: `7f5c24e5e8524b74e0c4348db48501815cb4fa4e`
- v464 UI-helper cache-bust/game import commit: `7ca254845936987cbf240f9c999b1f7be0319083`
- v464 loader/deploy commit: `ff2a8208f1997b30e3efe4ec2d3ddfebb3de8bb2`
- v464 successful Pages run: `37526091354`
- Current `src/game.js` content SHA: `d81c5ba4f5e152ecafeb13b3f6b4f6dd4ae67d9c`
- Current `src/ui-helpers.js` content SHA: `023797b0e936474c622ce32599fe02a550c27076`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v463 and reported: **"looks fine to me"**.
- **v463 is therefore the latest user-confirmed good build.**
- v464 is live but remains **unconfirmed** until the user tests it.
- Preserve the current v459/v457 rain-cover behavior and the `rainCoverOrigin` scratch-vector optimization.

## v464 cleanup — reuse sprint HUD result object

Audit found:
- v463 already stopped allocating the sprint HUD argument object every gameplay frame;
- `renderSprintHud()` itself still returned a brand-new `{pct,color,state}` object every frame;
- the return value is consumed immediately by the single runtime caller, `updateSprintUI()`.

Verification before change:
- all `src/*.js` files were checked;
- `renderSprintHud` has one runtime caller in `game.js` plus its import, and one definition in `ui-helpers.js`.

v464 changed only:
- added one reusable module-level `sprintHudResult` object;
- `renderSprintHud()` writes the same `pct`, `color`, and `state` values into that reusable object;
- returns the same reusable object instead of allocating a new result object each frame;
- bumped the `ui-helpers.js` import query to `?v=464` so the browser definitely loads the new helper.

Behavior intentionally unchanged:
- sprint drain/recharge rates;
- sprint lock/unlock behavior;
- sprint speed;
- HUD percentage math;
- HUD color thresholds;
- READY / RECOVERING / percentage text;
- `updateSprintUI()` caller behavior.

Verification:
- current `src/game.js` parses successfully;
- current `src/ui-helpers.js` parses successfully;
- exact diffs are limited to the reusable sprint result object and the helper import cache-bust;
- Pages run `37526091354` completed successfully;
- rain/rain-cover, PBD/ragdoll, crawler conversion, zombie spawning/connectivity/anti-clumping, grenade/spintop, map/collision, gun transforms/ADS/recoil, M240 audio, and start/death/restart/shop/pause were not changed;
- protected v324 recovery remains unchanged.

## Cleanup finish estimate

After v464, estimate **0–2 worthwhile low-risk cleanup passes remain**.

The remaining safe candidate is mainly low-frequency performance HUD bookkeeping. Most other remaining allocation sites are inside protected/high-risk systems and should not be touched for marginal gains.

If v464 is good, reassess whether one final performance-bookkeeping cleanup is worthwhile. If not, declare the cleanup phase complete.

## v464 test focus

User should confirm:
1. game remains smooth/playable;
2. sprint drains and recharges normally;
3. exhausting sprint still enters RECOVERING and unlocks normally;
4. sprint HUD percentage, color, READY and RECOVERING states look unchanged;
5. no boss/rain/unrelated regression.

## Next step after user test

If v464 is good, either do one final isolated low-frequency performance HUD bookkeeping cleanup or call cleanup complete if the remaining gain is too small to justify another change.

---

# LATEST LIVE STATE — 2026-10-06 — v463 — SPRINT HUD PER-FRAME ARGUMENT CLEANUP — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=463`
- v463 cleanup commit: `cf12e9f2a8b3eae2c91bdb21867cfabaf8d61ca8`
- v463 loader commit: `a53c5a156991ff8211e18012ebdd2ab4fe8c37f5`
- v463 Pages retrigger commit: `0bba34921b87c1242016f1d3ebe0599e4acf512f` — index-only comment, no gameplay change.
- v463 successful Pages run: `37524511578`
- Current `src/game.js` content SHA: `a345236d3c528bbe714623f994fc52729cb7c6f4`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v462 through a boss wave and reported: **"boss wave worked just fine"**.
- **v462 is therefore the latest user-confirmed good build.**
- v463 is live but remains **unconfirmed** until the user tests it.
- Keep the playable v459/v457 rain-cover behavior. Do not revert the `rainCoverOrigin` scratch-vector optimization unless the user explicitly asks.

## v463 cleanup — reuse sprint HUD render arguments

Audit found:
- `updateSprintUI()` is called every gameplay frame from `move()`;
- it created a fresh argument object every call only to pass the same two DOM references plus current sprint values/state to `renderSprintHud()`;
- the helper consumes that object immediately.

v463 changed only:
- added one reusable `sprintHudRenderArgs` object;
- before each call, refreshes `energy`, `locked`, and the three previous-render values;
- calls the same `renderSprintHud()` helper with the same effective values.

Behavior intentionally unchanged:
- sprint drain rate;
- sprint recharge rate;
- sprint lock/unlock behavior;
- sprint speed;
- sprint bar percentage;
- sprint bar color;
- READY / RECOVERING / percentage text.

Verification:
- full current `src/game.js` parses successfully;
- exact v463 gameplay diff is limited to sprint HUD argument-object reuse;
- loader is `./src/game.js?v=463`;
- initial loader Pages run `37523689985` built successfully but remained stuck in GitHub's `github-pages` environment gate and was cancelled by the deployment retrigger;
- no-code retrigger commit `0bba34921b87c1242016f1d3ebe0599e4acf512f` produced successful Pages run `37524511578`;
- rain/rain-cover, PBD/ragdoll, crawler conversion, zombie spawning/connectivity/anti-clumping, grenade/spintop, map/collision, gun transforms/ADS/recoil, M240 audio, and start/death/restart/shop/pause were not changed;
- protected v324 recovery remains unchanged.

## Cleanup finish estimate

The cleanup phase is now very close to finished.

After v463, estimate **1–3 worthwhile low-risk passes remain**.

The audit shows the remaining obvious allocation sites are increasingly low-value:
- `renderSprintHud()` itself still returns one tiny object per frame;
- performance HUD FX-count bookkeeping allocates only about once per second;
- most other remaining hot allocations are inside protected/risky systems such as reload/viewmodel choreography, ragdoll/crawlers, spawning/navigation/collision, grenades, or weapon interactions.

Stop cleanup once the remaining safe UI/performance bookkeeping wins are exhausted. Do not touch protected systems merely to remove tiny allocations.

## v463 test focus

User should confirm:
1. game remains smooth/playable;
2. sprint drains normally while running;
3. sprint recharges normally;
4. empty sprint still enters RECOVERING and unlocks normally;
5. sprint HUD percentage/color/READY state look unchanged;
6. boss, rain, and other gameplay remain unchanged.

## Next step after user test

If v463 is good, continue with at most one isolated low-risk UI/performance bookkeeping cleanup at a time. Reassess after each one whether cleanup is effectively complete.

---

# LATEST LIVE STATE — 2026-10-06 — v462 — BOSS HUD PER-FRAME ALLOCATION CLEANUP — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=462`
- v462 cleanup commit: `124371bfd385e1f35038d79f4d65400c9edc18b5`
- v462 loader/deploy commit: `f2467715179e7c7cd7cbdd0db414531273190406`
- v462 successful Pages run: `37521541188` — succeeded on deployment attempt 3 after two GitHub-side HTTP 500 deploy failures; no code changed between attempts.
- Current `src/game.js` content SHA: `06c50b9992a5bc0f88a5d2aa7f3c53a56b8ff891`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v461 and reported: **"everything looks good let move to the next step"**.
- **v461 is therefore the latest user-confirmed good build.**
- v462 is live but remains **unconfirmed** until the user tests it.
- Keep the playable v459/v457 rain-cover behavior. Do not revert the `rainCoverOrigin` scratch-vector optimization unless the user explicitly asks.

## v462 cleanup — reuse boss HUD render arguments

Audit found:
- `updateBossUI()` runs every active gameplay frame;
- it created a fresh options object every call only to pass the same four DOM element references plus the current `boss` and `wave` values to `renderBossHud()`;
- `renderBossHud()` consumes the object immediately and does not retain it.

v462 changed only:
- added one reusable `bossHudRenderArgs` object;
- before each render, writes the current `currentBoss` reference and `wave` value into it;
- calls the same `renderBossHud()` helper with the same effective values.

Behavior intentionally unchanged:
- boss HUD visibility;
- boss name;
- boss wave text;
- boss HP bar math;
- boss gameplay, health, attacks, rewards, spawning or AI.

Verification:
- full current `src/game.js` parses successfully;
- exact v462 gameplay diff is limited to the boss HUD argument-object reuse;
- loader is `./src/game.js?v=462`;
- Pages run `37521541188` completed successfully;
- the first two deploy attempts for that run failed only because GitHub Pages returned HTTP 500 while creating the deployment; attempt 3 succeeded with unchanged code;
- rain/rain-cover, PBD/ragdoll, crawler conversion, zombie spawning/connectivity/anti-clumping, grenade/spintop, map/collision, gun transforms/ADS/recoil, M240 audio, and start/death/restart/shop/pause were not changed;
- protected v324 recovery remains unchanged.

## Cleanup finish estimate

The broad cleanup is close to completion.

Current estimate after v462:
- roughly **2–4 additional worthwhile low-risk cleanup passes** remain;
- likely candidates are remaining transient UI/performance bookkeeping allocations that can be removed without touching gameplay behavior;
- once those are exhausted, stop cleanup rather than chasing micro-optimizations inside protected/risky systems.

Do **not** optimize merely for the sake of changing code inside:
- reload/viewmodel choreography;
- PBD/ragdoll/crawler behavior;
- zombie spawning/navigation/collision;
- grenade/spintop;
- map/collision;
- weapon transforms/ADS/recoil;
- M240 audio.

Those remaining hotspots are not worth the regression risk for this cleanup phase.

## v462 test focus

User should confirm:
1. game remains smooth/playable;
2. boss HUD is hidden normally when there is no boss;
3. if a boss wave is reached, boss name/health bar/wave text still behave normally;
4. no unrelated visual/gameplay regression;
5. rain behavior remains the same as v461/v459.

## Next step after user test

If v462 is good, continue with one isolated low-risk cleanup. Prefer a UI/performance-bookkeeping allocation target and keep all protected gameplay systems untouched.

---

# LATEST LIVE STATE — 2026-10-06 — v461 — STREETLAMP NEAREST-LIGHT SCRATCH CLEANUP — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=461`
- v461 cleanup commit: `e8661fb58c68cebd61a6ba4c0bf68d15a53d2848`
- v461 loader/deploy commit: `36b64f14c6bf503f24fe88d3f151783205369b9f`
- v461 successful Pages run: `37520364015`
- Current `src/game.js` content SHA: `c611e4e700a26aac7a8bc784a149e527c921cc2e`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User moved on from v460 to the next cleanup step, so **v460 is now user-confirmed good**.
- v461 is live but must remain **unconfirmed** until the user tests it.
- v459/v457 rain-cover behavior remains intentionally preferred for performance; do not revert the `rainCoverOrigin` scratch-vector optimization unless the user explicitly asks.

## v461 cleanup — reuse streetlamp nearest-light scratch entries

Audit found:
- `updateStreetLampLighting()` rebuilt a temporary array of `{i,d}` objects with `.map()` and then created another temporary array with `.slice()` every ~220 ms;
- those temporary allocations existed only to choose the same nearest real streetlamp spotlights.

v461 changed only:
- added one reusable `streetLampNearestScratch` array;
- initializes its small entry objects only when the streetlamp-head count changes;
- rewrites the same index and squared-distance values into those existing entries;
- sorts the same entries with the exact same `a.d-b.d` comparator;
- uses the first existing pool-size entries directly instead of creating a sliced copy.

Behavior intentionally unchanged:
- streetlamp head positions;
- real spotlight pool size;
- spotlight range, intensity, angle, penumbra and decay;
- nearest-light squared-distance math and ordering;
- lamp flicker/glow behavior;
- player position inputs and update cadence.

Verification:
- full current `src/game.js` parses cleanly;
- the v461 gameplay diff is limited to the scratch declaration and nearest-light selection block;
- v461 loader is `./src/game.js?v=461`;
- Pages run `37520364015` completed successfully for the v461 loader commit;
- rain, rain-cover logic, PBD/ragdoll, crawler conversion, zombie spawning/connectivity/anti-clumping, grenade/spintop, map/collision, gun transforms/ADS/recoil, M240 audio, and start/death/restart/shop/pause were not changed;
- protected v324 recovery remains unchanged.

## Test focus

User should confirm:
- game remains smooth/playable;
- streetlamps still look and light the scene normally while moving around;
- nearby real streetlights follow the player exactly as before, with no popping, missing light, or wrong lamp selected;
- normal rare lamp flicker/intensity behavior is unchanged;
- rain behavior is unchanged from v460/v459.

## Next cleanup guidance

If v461 is good, continue with one more isolated low-risk allocation/performance cleanup outside protected gameplay systems and outside rain-cover logic.

---

# LATEST LIVE STATE — 2026-10-06 — v460 — RAIN SPLASH ALLOCATION CLEANUP — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=460`
- v460 cleanup commit: `bec4a7f1f99941827df4554f5f4ad815853b65cf`
- v460 loader/deploy commit: `c7b47b8d862be1332ba93ca5222081bfca1b9fcd`
- v460 successful Pages run: `37517596459`
- Current `src/game.js` content SHA: `a8289386443f5582fd839793f26d8d28caeffcd0`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v459 and reported: **"this is fine lets move on"**.
- v459 is therefore the latest user-confirmed gameplay baseline before this v460 cleanup.
- v459 intentionally keeps the v457 rain-cover behavior because that state was playable; do not revert it under cleanup unless the user explicitly asks.

## v460 cleanup — remove per-frame rain splash array allocation

Audit found:
- each active rain splash built a fresh 24-number temporary `verts` JavaScript array every frame;
- those values were immediately copied into the existing `rainSplashPositions` typed buffer;
- the temporary array was unnecessary garbage in a frequently updated visual effect.

v460 changed only:
- removed the temporary 24-number `verts` array;
- wrote the exact same 24 coordinates directly into `rainSplashPositions` in the same order.

Verification:
- `src/game.js` parses successfully;
- rain-cover logic is untouched and still uses the v457/v459 `rainCoverOrigin` scratch-vector behavior;
- splash spread/rise/position math is unchanged;
- no rain intensity, cover detection, wind, lighting, city collision, spawn behavior, crawler/ragdoll logic, grenade logic, weapon behavior, or M240 audio were changed;
- protected v324 recovery remains unchanged.

## Test focus

User should confirm:
- game remains smooth/playable;
- rain splashes still appear normally on the ground;
- no malformed, stretched, missing, or flickering splash geometry appears;
- known v457/v459 rain-cover behavior is unchanged.

## Next cleanup guidance

If v460 is good, continue with another low-risk allocation cleanup outside the rain-cover logic itself. Do not revert the rain-cover scratch-vector optimization.

---

# LATEST LIVE STATE — 2026-10-06 — v459 — EXACT v457 GAME RESTORE — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=459`
- v459 restore commit: `fd3a5515a0411146acf3c9d540ab38520c3ee84c`
- v459 loader commit: `b9b07af9fbff210e2b373d11b0ad7eb4331e3b1b`
- Current `src/game.js` content SHA: `dfbb183df16d8d6a5df8f103f66bc3584311f137`
- That SHA is **exactly the same as v457**.
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- v456 was confirmed good by the user.
- v457 introduced a rain-cover behavior issue: going under cover caused rain to stop globally, **but performance remained playable**.
- v458 reverted to the exact v456 game code to restore the older rain behavior.
- User tested v458 and reported it was **so laggy it was unplayable**, and explicitly asked to go back to v457.
- Therefore v458 is rejected as the preferred live state because of severe performance regression.
- v459 restores the exact v457 `src/game.js` byte-for-byte and only advances the loader to force cache refresh.

## Important rain/performance decision

Current preferred state is the v457 behavior because performance is more important than the rain-cover bug.

v459 intentionally includes:
- reusable `rainCoverOrigin` scratch vector;
- `rainCoverRay.set(rainCoverOrigin.set(px,playerGroundY+1.35,pz),rainUp);`

Do **not** automatically revert this again unless the user explicitly asks. The user chose v457 behavior over the laggy v458 state.

## Verification

- Current `src/game.js` SHA exactly matches v457: `dfbb183df16d8d6a5df8f103f66bc3584311f137`.
- JavaScript parses successfully.
- Native crawler conversion, PBD/ragdoll, grenade/spintop, spawn systems, weapons, and M240 audio remain unchanged.
- Protected v324 recovery remains unchanged.

## Next cleanup guidance

Do not touch rain-cover logic next. Continue cleanup/performance work somewhere else, one isolated change at a time, after the user confirms v459 is playable again.

---

# LATEST LIVE STATE — 2026-10-06 — v458 — RAIN REGRESSION REVERT — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=458`
- v458 revert commit: `102b3527fee9e74151cb5e8891660520430c280f`
- v458 loader commit: `1695e09f55e6e2197b7972d1052520787a9bb562`
- Current `src/game.js` content SHA: `e025864266c8e1642a4b5f2ab9b663149b1a0a4e`
- **Important:** that game SHA exactly matches user-confirmed-good v456.
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v456 and reported: **"everything seems fine to me"**.
- User then tested v457 and reported a rain regression: **"when under cover the rain stops but stops everywhere"**.
- Therefore v457 is **not** a good baseline.
- v458 restores the exact v456 `src/game.js` content and only advances the loader version.

## v457 regression and v458 revert

v457 attempted to reuse a scratch `THREE.Vector3` for the rain-cover ray origin.

User-observed regression:
- entering cover caused rain to stop everywhere rather than behaving locally as before.

v458 restores the exact prior implementation:
- `rainCoverRay.set(new THREE.Vector3(px,playerGroundY+1.35,pz),rainUp);`
- removes the added `rainCoverOrigin` scratch vector.

Verification:
- `src/game.js` SHA is exactly the same as v456: `e025864266c8e1642a4b5f2ab9b663149b1a0a4e`;
- JavaScript parses successfully;
- native crawler conversion, PBD/ragdoll, grenade/spintop, spawn systems, weapons, and M240 audio remain unchanged;
- v324 protected recovery remains unchanged.

## Cleanup guidance

Do not retry the v457 rain-vector reuse optimization. Continue future performance cleanup only with a different isolated target, and keep v456/v458 behavior as the known-good rain baseline.

---

# LATEST LIVE STATE — 2026-10-06 — v457 — PERFORMANCE CLEANUP IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=457`
- v457 cleanup commit: `afacdc8ab76d9e9e38b434cfb0ea83561420769f`
- v457 loader/deploy commit: `6301a22913f8472e4c6bbbd6d05b660c5f667b0c`
- v457 successful Pages run: `37507139259`
- Current `src/game.js` content SHA: `dfbb183df16d8d6a5df8f103f66bc3584311f137`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v456 and reported: **"everything seems fine to me"**.
- v456 is therefore the latest user-confirmed gameplay baseline before this v457 cleanup.

## v457 cleanup — reuse rain-cover ray origin vector

The obvious dead-code/wrapper pass is essentially exhausted, so cleanup has moved into low-risk allocation reduction.

Audit found:
- `updateRainCover()` created a fresh `THREE.Vector3(px, playerGroundY+1.35, pz)` every rain-cover check.
- The existing rain-cover logic only needs a temporary ray-origin vector.

v457 changed only:
- added one reusable `rainCoverOrigin` scratch vector next to the existing `rainUp` vector;
- replaced the repeated `new THREE.Vector3(...)` allocation with `rainCoverOrigin.set(...)`.

Verification:
- `src/game.js` parses successfully;
- net diff versus confirmed-good v456 is two changed lines in `src/game.js` plus the v457 loader bump in `index.html`;
- rain-cover ray coordinates and behavior are unchanged;
- no rain intensity, splash, wind, lighting, city collision, spawn behavior, crawler/ragdoll logic, grenade logic, weapon behavior, or M240 audio were changed;
- protected v324 recovery remains unchanged.

## Continue cleanup carefully

Continue with low-risk per-frame/per-check allocation cleanup only when the replacement is behavior-equivalent and easy to verify. Avoid speculative hot-path rewrites.

---

# LATEST LIVE STATE — 2026-10-06 — v456 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=456`
- v456 cleanup commit: `02780353b8abb5db27c9506006cee8b055edd744`
- v456 loader/deploy commit: `e0aa7fc32f8cf6e128d197f90fcb1aeeb4c2473c`
- v456 successful Pages run: `37502443553`
- Current `src/game.js` content SHA: `e025864266c8e1642a4b5f2ab9b663149b1a0a4e`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v455 and reported: **"things look fine"**.
- v455 is therefore the latest user-confirmed gameplay baseline before this v456 cleanup.

## v456 cleanup — inlined one-use zombie outfit-color wrapper

Audit proved:
- `rigOutfitColor(kind,seedish)` had exactly two occurrences: its definition and one call.
- The `kind` argument was unused.
- The helper only selected one of the existing six outfit colors using `Math.abs(seedish)%6`.

v456 changed only:
- removed the four-line `rigOutfitColor()` wrapper;
- inlined the exact same six-color palette lookup using the existing `variant` value at its only call site.

Verification:
- `src/game.js` parses successfully;
- net diff versus confirmed-good v455 is one added line / five deleted lines in `src/game.js` plus the v456 loader bump in `index.html`;
- zombie outfit colors and variant selection are unchanged;
- zombie eye colors remain unchanged;
- no model selection, transforms, animations, hitboxes, crawler behavior, PBD/ragdoll physics, spawn behavior, grenade logic, weapon behavior, or M240 audio were changed;
- protected v324 recovery remains unchanged.

## Continue cleanup carefully

The obvious tiny visual wrappers are now nearly exhausted. Re-audit current main before the next cleanup; prefer another exact one-use wrapper or duplicate glue rather than changing active gameplay math or hot paths.

---

# LATEST LIVE STATE — 2026-10-06 — v455 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=455`
- v455 cleanup commit: `91ee037f4611165160d925f3bdf51281f5932e30`
- v455 loader/deploy commit: `c518eb4e2266eb36cd9959f77a56389c6360a903`
- v455 successful Pages run: `37498009800`
- Current `src/game.js` content SHA: `d92904531c27475cadd7477a1a6b22ae7aa42e50`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v454 and reported: **"works fine"**.
- v454 is therefore the latest user-confirmed gameplay baseline before this v455 cleanup.

## v455 cleanup — inlined one-use zombie eye-color wrapper

Audit proved:
- `rigEyeColor(kind)` had exactly two occurrences: its definition and one call.
- The helper only returned the existing eye-color ternary.

v455 changed only:
- removed the three-line `rigEyeColor(kind)` wrapper;
- inlined the exact same eye-color expression at its only call site.

Verification:
- `src/game.js` parses successfully;
- net diff versus confirmed-good v454 is one added line / four deleted lines in `src/game.js` plus the v455 loader bump in `index.html`;
- zombie eye colors themselves are unchanged;
- `rigOutfitColor()` remains untouched;
- no model selection, transforms, animations, hitboxes, crawler behavior, PBD/ragdoll physics, spawn behavior, grenade logic, weapon behavior, or M240 audio were changed;
- protected v324 recovery remains unchanged.

## Continue cleanup carefully

Continue with fresh proof for tiny one-call visual/setup wrappers only. `rigOutfitColor()` remains a likely next candidate; re-audit current main before changing it.

---

# LATEST LIVE STATE — 2026-10-06 — v454 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=454`
- v454 cleanup commit: `b7368e6f31468ba79d5a1d35b1bb37cc04a00f82`
- v454 loader/deploy commit: `ab50c02df56f037222cfe962034c265ffb8b901d`
- v454 successful Pages run: `37496402874`
- Current `src/game.js` content SHA: `670d18b83ee51c978b3bb413c9806e04eb5a9ae0`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v453 and reported: **"spawn just fine"**.
- v453 is therefore the latest user-confirmed gameplay baseline before this v454 cleanup.

## v454 cleanup — inlined one-use zombie rig clone wrapper

Audit proved:
- `cloneShamblerRig()` had exactly two occurrences: its definition and one call.
- The helper only returned `zombieRigAsset ? SkeletonUtils.clone(zombieRigAsset.scene) : null`.

v454 changed only:
- removed the three-line `cloneShamblerRig()` wrapper;
- inlined that exact clone expression at its only call site.

Verification:
- `src/game.js` parses successfully;
- net diff versus confirmed-good v453 is one added line / four deleted lines in `src/game.js` plus the v454 loader bump in `index.html`;
- zombie eye/outfit helpers remain untouched;
- no model selection, transforms, animations, hitboxes, crawler behavior, PBD/ragdoll physics, spawn behavior, grenade logic, weapon behavior, or M240 audio were changed;
- protected v324 recovery remains unchanged.

## Continue cleanup carefully

Continue with fresh proof for tiny one-call wrappers only. Prefer visual/setup wrappers such as `rigEyeColor()` or `rigOutfitColor()` before touching spawn math or performance-sensitive gameplay code.

---

# LATEST LIVE STATE — 2026-10-06 — v453 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=453`
- v453 cleanup commit: `6940b50c8094305e3d31d40cfb8bc48dc4153a21`
- v453 loader/deploy commit: `b6a8f22c804d5368f77b55e502a11a36ada0d217`
- v453 successful Pages run: `37495244154`
- Current `src/game.js` content SHA: `817294c0365d63f5eb6da39d0bb91fb89c1ed86e`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v452 and reported: **"seems fine"**.
- v452 is therefore the latest user-confirmed gameplay baseline before this v453 cleanup.

## v453 cleanup — inlined one-use recent-spawn reset wrapper

Audit proved:
- `clearRecentZombieSpawns()` had exactly two occurrences: its one-line definition and one call at the start of `spawnWave()`.
- The helper only executed `recentZombieSpawnPoints.length=0`.

v453 changed only:
- removed the one-line `clearRecentZombieSpawns()` wrapper;
- inlined the exact same `recentZombieSpawnPoints.length=0` statement at its only call site.

Verification:
- `src/game.js` parses successfully;
- net diff versus confirmed-good v452 is one added line / two deleted lines in `src/game.js` plus the v453 loader bump in `index.html`;
- spawn-angle distribution code remains present and unchanged;
- no spawn distances, connectivity, anti-clumping, wave sizing, crawler/ragdoll behavior, grenade logic, weapon behavior, or M240 audio were changed;
- protected v324 recovery remains unchanged.

## Continue cleanup carefully

Continue fresh proof for tiny one-call wrappers or duplicate glue only. The simple dead-code/import pass is now largely exhausted; do not make behavior-changing spawn or hot-path refactors under the cleanup label.

---

# LATEST LIVE STATE — 2026-10-06 — v452 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=452`
- v452 cleanup commit: `1084126efffb2ad61204fd57938828e3c26d6b87`
- v452 loader/deploy commit: `b84c10e50fa16e35f0a2314f0b17ff840cdae7ce`
- v452 successful Pages run: `37494044485`
- Current `src/game.js` content SHA: `ba8206645a825a850eb1d9554489fc762260535b`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v451 and reported: **"plays just fine"**.
- v451 is therefore the latest user-confirmed gameplay baseline before this v452 cleanup.

## v452 cleanup — inlined one-use ragdoll visual wrapper

Audit proved:
- `ragVisibleHolder(z)` had exactly two occurrences: its one-line definition and one call.
- The helper only returned `z?.walkerVisual || null`.

v452 changed only:
- removed the one-line `ragVisibleHolder(z)` wrapper;
- replaced its single call with the exact inline expression `z?.walkerVisual || null`.

Verification:
- `src/game.js` parses successfully;
- net diff versus confirmed-good v451 is one added line / two deleted lines in `src/game.js` plus the v452 loader bump in `index.html`;
- no ragdoll parameters, timing, physics, crawler behavior, spawn logic, grenade logic, weapon behavior, or M240 audio were changed;
- native crawler conversion, PBD/ragdoll markers, grenade/spintop, active zombie cap and other protected systems remain present.

## Continue cleanup carefully

The import audit is clean: every current import is still used. Continue with fresh proof for tiny one-call wrappers, duplicate glue, or low-risk no-op code before considering hot-path/performance refactors.

---

# LATEST LIVE STATE — 2026-10-06 — v451 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=451`
- v451 cleanup commit: `77709c85dfb959c310f26dd39409b7c8270f124d`
- v451 loader/deploy commit: `980769fe3c190ddca15ea62e2dd7552f9d3c7ddd`
- v451 successful Pages run: `37491026700`
- Current `src/game.js` content SHA: `3cf64dadfdcd20fd00effc6a36d02d10f970a534`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v450 and reported: **"visuals are good"**.
- v450 is therefore the latest user-confirmed gameplay baseline before this v451 dead-code cleanup.

## v451 cleanup — removed obsolete city batching no-op

Audit proved:
- `batchStaticCity()` was literally an empty function.
- Its only other reference was one call to that empty function.
- The surrounding comments described old batching behavior that no longer exists.

v451 removed only:
- the empty `batchStaticCity(){}` stub;
- its single no-op call;
- the now-misleading comments associated with those two lines.

Verification:
- `src/game.js` parses successfully;
- net diff versus confirmed-good v450 contains only eight deleted lines in `src/game.js` plus the v451 loader bump in `index.html`;
- uploaded city GLB path remains present;
- native crawler conversion, PBD/ragdoll, M240 authored WAV path/state, grenade/spintop, live spawn/connectivity protections, active zombie cap and other protected systems remain present;
- M240 audio was not modified.

## Continue cleanup carefully

The simple one-occurrence dead functions/constants have been exhausted. Continue with a fresh audit for other safe no-op wrappers, stale imports, duplicate helpers, or low-risk hot-path cleanup. Do not jump into gameplay behavior changes.

---

# LATEST LIVE STATE — 2026-10-06 — v450 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=450`
- v450 cleanup commit: `207c04117d196d568c215c96b9f2f1259e52370c`
- v450 loader/deploy commit: `75f1d967846d7880efe4769c679d0e44d8e13d8f`
- v450 successful Pages run: `37489433155`
- Current `src/game.js` content SHA: `db5556a1a89bd9092584e5611b7730c1d8a0fb6d`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User last explicitly confirmed v448 good with: **"im good lets move on"**.
- User then asked to continue through v449 and v450 before testing.
- Therefore v448 remains the latest user-confirmed gameplay baseline; v449 + v450 are pending the user's combined live test.

## v450 cleanup — removed obsolete procedural facade generator/cache

Current-main audit proved:
- `facadeMaterial` occurred exactly once: its own function definition, with zero callers.
- `facadeMaterialCache` existed only in the declaration and inside that dead function.
- Current city visuals come from the uploaded city GLB, not this old in-browser procedural facade generator.

v450 removed:
- the 76-line unused `facadeMaterial(base,variant)` function;
- `facadeMaterialCache` from the declaration while preserving the live `buildingColliders=[]` array;
- the three-line obsolete comment describing procedural building facades.

Verification:
- `src/game.js` parses successfully;
- net diff versus current v449 main contains only `src/game.js` and the v450 loader change in `index.html`;
- `buildingColliders` remains live;
- native crawler conversion, PBD/ragdoll, M240 authored WAV path/state, grenade/spintop, live spawn/connectivity protections, active zombie cap and other protected systems remain present;
- M240 audio was not modified.

## Test focus

Because v449 + v450 only remove unreachable old procedural-city helpers, the user mainly needs to verify:
- the city/map loads with all expected buildings/textures;
- no missing/white/black building surfaces appear;
- collision, zombie spawning/pathing, weapons, grenades, crawlers/ragdolls, shop and round transitions still feel normal.

If those are normal, continue the cleanup audit from current main and re-prove any next candidate before deletion.

---

# LATEST LIVE STATE — 2026-10-03 — v449 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=449`
- v449 cleanup commit: `2fc38604175ea3612dd8f355f2fa6f43b57777aa`
- v449 loader/deploy commit: `58e401a400e3aa0edfa676b349bdc4b7c12c539a`
- Current `src/game.js` content SHA: `5c207eb5b76a86fbfb807fd794f5502f073b9e14`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v448 and said: **"im good lets move on"**.
- v448 is therefore the latest user-confirmed gameplay baseline before this v449 dead-code cleanup.

## v449 cleanup — removed unused fire escape helper

Current-main audit proved:
- `addFireEscape` occurred exactly once: its own definition.
- It had zero call sites after removal of the old procedural `addBuilding()` path.

v449 removed only:
- the 8-line unused `addFireEscape(x,y,z,h,side,p)` helper.

Verification:
- `src/game.js` parses successfully;
- net diff versus confirmed-good v448 contains only eight deleted lines in `src/game.js` plus the v449 loader bump in `index.html`;
- `facadeMaterial()` and `facadeMaterialCache` remain untouched for later isolated cleanup;
- native crawler conversion, PBD/ragdoll, M240 authored WAV path/state, grenade/spintop, live spawn/connectivity protections, active zombie cap and other protected systems remain present;
- M240 audio was not modified.

## Deployment note

- Initial v449 Pages run `37156222511` failed in GitHub Pages/Jekyll because GitHub's own metadata API returned `Net::ReadTimeout`; JavaScript/source verification had already passed.
- Fresh v449 Pages run `37156349588`, rerun attempt 2, completed successfully with build + deploy + status reporting all successful.
- Current deployed/docs commit for that successful run: `7989305193dd74268995737c979fa6f9f01cfab1`.

## Continue cleanup carefully

The next known dead procedural-city block is `facadeMaterial()` (76 lines, one occurrence: its own definition). Its `facadeMaterialCache` is only used by that function. Re-audit current main before removing them; keep that as its own isolated cleanup after v449 is user-tested.

---

# LATEST LIVE STATE — 2026-10-03 — v448 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=448`
- v448 cleanup commit: `8c983c0c32d486bbaf47db0f0073bf784a94fcab`
- v448 loader/deploy commit: `e2e5cfa90f68dae30e2918e866e9946d68751aaf`
- v448 successful Pages run: `37154133985`
- Current `src/game.js` content SHA: `785ffabe2298537d17cb2ee962fba55b25dedc54`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v447 and reported: **"works fine next step"**.
- v447 is therefore the latest user-confirmed gameplay baseline before this v448 dead-code cleanup.

## v448 cleanup — removed unused water tower helper

Current-main audit proved:
- `makeWaterTower` occurred exactly once: its own definition.
- It had zero call sites after the v447 removal of the obsolete `addBuilding()` procedural-city routine.

v448 removed only:
- the 7-line unused `makeWaterTower(x,y,z,p)` helper.

Verification:
- `src/game.js` parses successfully;
- net diff versus confirmed-good v447 contains only seven deleted lines in `src/game.js` plus the v448 loader bump in `index.html`;
- `addFireEscape()` and `facadeMaterial()` remain untouched for later isolated cleanup;
- native crawler conversion, PBD/ragdoll, M240 authored WAV path/state, grenade/spintop, live spawn/connectivity protections, active zombie cap and other protected systems remain present;
- M240 audio was not modified.

## Continue cleanup carefully

Current dead procedural-city candidates:
- `addFireEscape()` — one occurrence, own definition, 8 lines.
- `facadeMaterial()` — one occurrence, own definition, 76 lines; its `facadeMaterialCache` is also only used by that helper.

Prefer `addFireEscape()` next because it is the smaller isolated removal. Re-audit current main before deleting anything.

---

# LATEST LIVE STATE — 2026-10-03 — v447 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=447`
- v447 cleanup commit: `a0612be5eb6f7594215a1cf274936d1049eb17cc`
- v447 loader/deploy commit: `501671e4bc0dfc3049f8eb874c12f53896e75310`
- v447 successful Pages run: `37153260579`
- Current `src/game.js` content SHA: `4b9f993016ec22e227e208bb41165329ec0fb42f`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v446 and reported: **"still working as it should"**.
- v446 is therefore the latest user-confirmed gameplay baseline before this v447 dead-code cleanup.

## v447 cleanup — removed unused procedural building routine

Current-main audit proved:
- `addBuilding` occurred exactly once: its own definition.
- It had zero call sites.
- Current city gameplay uses the uploaded city GLB/collision path, not this old procedural building generator.

v447 removed only:
- the 51-line unused `addBuilding(w,h,d,x,z,base,variant)` function.

Verification:
- `src/game.js` parses successfully;
- net diff versus confirmed-good v446 contains only 51 deleted lines in `src/game.js` plus the v447 loader bump in `index.html`;
- native crawler conversion, PBD/ragdoll, M240 authored WAV path/state, grenade/spintop, live spawn-zone/connectivity protections, active zombie cap and other protected systems remain present;
- M240 audio was not modified.

## Newly exposed dead helpers — do not bundle blindly

Removing `addBuilding()` leaves these helpers with exactly one occurrence each (their own definition):
- `facadeMaterial`
- `addFireEscape`
- `makeWaterTower`

Audit them individually before deletion. They are likely remnants of the same old procedural-city path, but keep the one-cleanup-at-a-time rule.

---

# LATEST LIVE STATE — 2026-10-03 — v446 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=446`
- v446 cleanup commit: `531174d4cdd2dbcf6621ef35b7e7fdf2b4417b28`
- v446 loader/deploy commit: `afcbdf40c329f0612c736d7c4b0b1b182432e755`
- v446 successful Pages run: `37152234503`
- Current `src/game.js` content SHA: `cf1a0988e61f080a31c0d93d621ee3c3b39393a8`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v444 and reported: **"works great whats next"**.
- User then asked to continue with the next cleanup before testing again.
- Therefore v444 remains the latest user-confirmed gameplay baseline; v445 and v446 are pending the user's combined live test.

## v446 cleanup — removed unused STI batching routine

Current-main audit proved:
- `batchLoadedStiCars` occurred exactly once: its own definition.
- It had zero call sites.
- `mergeGeometries` remains used elsewhere after removal, so no live utility/import was orphaned.
- `addBuilding()` remains untouched for a later independent audit.

v446 removed only:
- the 24-line unused `batchLoadedStiCars()` routine.

Verification:
- `src/game.js` parses successfully;
- net diff versus v445 contains only 24 deleted lines in `src/game.js` plus the v446 loader bump in `index.html`;
- native crawler conversion, PBD/ragdoll, M240 authored WAV path/state, grenade/spintop, live spawn-zone/connectivity protections, active zombie cap and other protected systems remain present;
- M240 audio was not modified.

## Continue cleanup carefully

The next known dead-code candidate is `addBuilding()` (currently 51 lines, one occurrence: its own definition). It belongs to the old procedural-city path and must be audited separately before deletion because it references facade/building helpers and collision data. Do not remove it together with unrelated helpers.

---

# LATEST LIVE STATE — 2026-10-03 — v445 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=445`
- v445 cleanup commit: `05399cfe0948e008b2365e43ce2ed090e619e6e0`
- v445 loader/deploy commit: `70b0831aabb8d96198881714aeae663ee18833cc`
- v445 successful Pages run: `37151991481`
- Current `src/game.js` content SHA: `a4e62edbbe4c5069c75c7d0324d99e174ae324cd`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v444 and reported: **"works great whats next"**.
- v444 is therefore the latest user-confirmed gameplay baseline before this v445 dead-code cleanup.

## v445 cleanup — removed unused exact-zone spawn helper

Current-main audit proved:
- `pointOnNewCitySpawnZone` occurred exactly once: its own definition.
- The live spawn system uses `pointNearNewCitySpawnZone()` and `zombieSpawnConnectedToPlayer()`, both of which remain live and referenced.

v445 removed only:
- the six-line unused `pointOnNewCitySpawnZone(x,z,pad)` helper.

Verification:
- `src/game.js` parses successfully;
- net diff versus confirmed-good v444 contains only six deleted lines in `src/game.js` plus the v445 loader change in `index.html`;
- `pointNearNewCitySpawnZone()` remains referenced three times;
- `zombieSpawnConnectedToPlayer()` remains referenced twice;
- native crawler conversion, PBD/ragdoll, M240 authored WAV path/state, grenade/spintop, spawn cap and other protected systems remain present;
- M240 audio was not modified.

## Continue cleanup carefully

Remaining candidates previously seen with only their own current reference include `addBuilding` and `batchLoadedStiCars`. These are much larger than the helpers removed in v442-v445 and must be inspected individually before deletion. Prefer the smallest provably unreachable block next; do not touch active spawn/PBD/crawler logic merely for cleanup.

---

# LATEST LIVE STATE — 2026-10-03 — v444 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=444`
- v444 cleanup commit: `5e8a16d36537bbde4c1d30ea83bdc88aef1a732b`
- v444 loader/deploy commit: `22f0a9e35b7ce26a3b3c488c914f4485e8a9b54a`
- v444 successful Pages run: `37151243166`
- Current `src/game.js` content SHA: `5c67d61861359d2372320570298272a65fc6ef4c`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v443 and reported: **"works great lets move on"**.
- v443 is therefore the latest user-confirmed gameplay baseline before this v444 dead-code cleanup.

## v444 cleanup — removed unused shop toggle wrapper

Current-main audit proved:
- `toggleShop` occurred exactly once: its own definition.
- Shop/input wiring uses `openShop()` directly and does not reference `toggleShop`.
- `openShop()` remains live and is still called by the between-wave shop flow.

v444 removed only:
- `function toggleShop(){if(!between)return;openShop()}`

Verification:
- `src/game.js` parses successfully;
- net diff versus the confirmed-good v443 main baseline contains only one deleted line in `src/game.js` plus the v444 loader change in `index.html`;
- native crawler conversion, PBD/ragdoll, M240 authored WAV path/state, grenade/spintop, spawn cap/connectivity and other protected systems remain present;
- M240 audio was not modified.

## Continue cleanup carefully

Continue one controlled cleanup at a time. Remaining candidates previously observed with only their own reference include `addBuilding`, `pointOnNewCitySpawnZone`, and `batchLoadedStiCars`. Re-prove references from current GitHub main before removing anything; these are larger/more structural than the v444 wrapper and should be inspected individually.

---

# LATEST LIVE STATE — 2026-10-03 — v443 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=443`
- v443 cleanup commit: `f1e867912dfb347cc3649c8d8339ed006e5c2206`
- v443 repaired full-tree/current deployment commit: `d963cdcb34549fefcbda1ef80b96edc2a5ed6c75`
- v443 successful Pages run: `37146612179`
- Current `src/game.js` content SHA: `f18c546b90d200950dab4d426716e30cd5bd47d8`
- Live game: https://xboxlivehd88-hue.github.io/city-outbreak/?v=443-d963cdcb
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v442 and reported: **"works great"**.
- v442 is therefore the last user-confirmed gameplay baseline before this v443 dead-code cleanup.

## v443 cleanup — removed unused emissive material helper/cache

Current-main audit proved:
- `EM` had no call sites and occurred only at its own definition.
- `emissiveMaterialCache` existed only in the cache declaration and inside unused `EM`.

v443 removed:
- unused `EM(c,e,r)`;
- now-unused `emissiveMaterialCache`.

Verification:
- current v443 `src/game.js` parses successfully;
- net comparison against the full v442 tree shows only `src/game.js` and `index.html` modified;
- the game.js net change is only removal of the dead cache/helper;
- loader changed from v442 to v443;
- native crawler conversion, PBD/ragdoll markers, M240 authored WAV path/state, spintop asset, spawn active cap, protected recovery doc and other protected systems remain present;
- M240 audio was not modified.

## v443 tree repair note

The first low-level v443 tree commit accidentally used an incomplete base tree. This was caught before handoff. Commit `d963cdcb34549fefcbda1ef80b96edc2a5ed6c75` rebuilt v443 on the full v442 tree. Required files were rechecked, and the final net diff versus v442 contains only the intended `src/game.js` cleanup and `index.html` loader bump. Use the repaired/current commit as authoritative.

## Continue cleanup carefully

Continue one controlled cleanup at a time. Other functions previously noticed with only their own current reference included `addBuilding`, `pointOnNewCitySpawnZone`, `batchLoadedStiCars`, and `toggleShop`; re-audit current GitHub main before deleting any of them. Do not combine removals merely because they look unused.

---

# LATEST LIVE STATE — 2026-10-03 — v442 — CLEANUP AUDIT IN PROGRESS — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=442`
- v442 cleanup commit: `301f894d19219f4ae34247061820cc1754081369`
- v442 loader/deploy commit: `ff2bcbdf65d2dd3e4d021f7e8a17114e1f9f9827`
- v442 successful Pages run: `37145141583`
- Current `src/game.js` content SHA after cleanup: `aa843fd70b1eb13117f1e06e13a44ac54c7dce68`
- Live game: https://xboxlivehd88-hue.github.io/city-outbreak/?v=442-ff2bcbdf
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## v442 cleanup — removed unused UI helper imports

Audit found four named imports from `ui-helpers.js` that had no references anywhere else in current `src/game.js`:
- `clearTransientMessage`
- `clearDamageOverlay`
- `clearHitMarker`
- `clearNukeOverlays`

Only those unused import names were removed. The UI helper module remains imported and all used UI helpers are unchanged.

Verification:
- current v442 `game.js` parses successfully;
- comparing v442 against the v441 gameplay commit shows exactly one changed line: the UI-helper import list;
- native `convertLeglessToCrawler()` architecture remains present;
- PBD/ragdoll/gameplay code body is byte-identical to v441 outside the import line;
- M240 WAV path/state is unchanged and must not be tuned until the user provides the planned recording;
- grenade/spintop, spawn/connectivity, City Hall collision, weapon transforms/reloads, rain/lighting/store/pause/start/death/restart, and wave/player settings were not changed.

## Current task — continue SAFE CODE CLEANUP / PERFORMANCE AUDIT

Continue one controlled cleanup at a time. The next audit may inspect other provably unused helpers/constants, but do not combine several cleanups or perform a broad refactor. Candidate unused functions noticed during the v442 read-only audit include `EM`, `addBuilding`, `pointOnNewCitySpawnZone`, `batchLoadedStiCars`, and `toggleShop`; **do not delete them merely from this note**. Re-prove current references from GitHub main before changing anything.

---

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

# LATEST LIVE STATE — 2026-10-01 — v392 — READ THIS BEFORE OLDER SECTIONS

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


# CITY OUTBREAK — AUTHORITATIVE HANDOFF

# NEW PROTECTED RECOVERY CHECKPOINT — 2026-09-29 — v324 — READ THIS FIRST

This section supersedes every older "current checkpoint" or "current state" section below. Older sections are retained only as historical reference.

## Recovery checkpoint identity

- **Current approved recovery build:** v324
- **Exact protected recovery commit:** `afddcebb47e06a82b4196638716f05e6f1adc941`
- **Exact protected recovery tree:** `5721309fc27f9f16ee7a2568a7f73fd429342502`
- **v324 loader commit:** `6d9cfb8aaa54916bab78f7a93c95224435c9ec5b`
- **GitHub Pages entry:** `./src/game.js?v=324`
- **Latest successful Pages deployment for the protected tree:** run `36616387389`
- **Live game:** https://xboxlivehd88-hue.github.io/city-outbreak/
- The user explicitly said the current state is a **great spot** and asked to make it the new recovery save.
- Future work starts from v324 unless the user explicitly asks to restore an older checkpoint.
- **Do not redefine or overwrite this recovery identity casually.** If a later build becomes the new approved recovery, record a new dated section above this one.

## Required workflow for every future change

1. Fetch/read this file, `NEXT_CHAT_HANDOFF.md`, current `main:index.html`, current `main:src/game.js`, and any directly relevant module such as `src/wave-utils.js`.
2. Never work from stale chat snippets when the repository can be read directly.
3. Make one controlled change at a time.
4. Commit directly to `main`; do not ask the user to run Git commands or manually upload code.
5. Verify the exact diff and protected gameplay values after the change.
6. Temporary Actions inspection/syntax workflows are allowed, but delete them immediately afterward.
7. `.github/workflows` should return to only `v182-validation.yml`.
8. Wait for the final GitHub Pages deployment to complete successfully before giving the user a cache-busted test link.
9. Code/deployment success does **not** equal gameplay approval. The user's live test is final authority.

## Current city/map — LOCKED BASELINE

The old v303 procedural city is no longer active. The active environment is the uploaded GLB:

- `assets/chicken_gun_fruzer_-_city.glb`
- Valid GLB 2.0, self-contained.
- Approx file size: 25.47 MB.
- 1 scene, 1028 nodes, 455 meshes, 9 materials, 8 textures / 8 embedded PNG images.
- Approx 309,042 triangles.
- Raw source bounds were approximately 502.52 x 707.53 x 578.54 units.
- No authored collision/physics metadata and no real punctual-light metadata were found.
- Sketchfab metadata inside the GLB identifies the asset as **"chicken gun fruzer - city"**, author **amogusstrikesback2**, license **CC-BY-4.0**.
- Old procedural ground, roads, sidewalks, curbs, buildings, lamps, barriers, road texture, and old hand-placed STI map props are disabled from the active environment.

Current map transform:
```js
const NEW_CITY_SCALE=1.55;
const NEW_CITY_X_OFFSET=21.33575;
const NEW_CITY_Y_OFFSET=28.68275;
const NEW_CITY_Z_OFFSET=8.25;
```

The scale was tuned repeatedly against the character/zombie size. **Do not change it unless the user asks.**

## Current character scale / camera / M4

```js
const PLAYER_WORLD_SCALE=1.20;
const ZOMBIE_WORLD_SCALE=1.15;
```

- Camera uses `playerGroundY + 1.65 * PLAYER_WORLD_SCALE`.
- The player was raised because the user felt too short compared with the zombies.
- The M4 hip pose was pulled back toward the shoulder:
  `m4ViewRoot.position.z = reloading ? -1.66 : THREE.MathUtils.lerp(-1.62,-1.66,aimBlend)`
- Preserve the approved M4 ADS/reload pose and do not rework other weapon transforms unless requested.

## v320–v324 city collision / navigation — CURRENT APPROVED SYSTEM

The GLB has no native collision, so collision is generated from the city's actual geometry.

### Wall collision
- Spatial collision bucket size: `CITY_COLLISION_BUCKET=4.0`.
- Collision is generated only from substantial near-vertical geometry crossing player/zombie body height.
- Roads/floors/roofs/shallow curbs are intentionally not treated as walls.
- v324 collision precision:
```js
const NEW_CITY_COLLISION_CELL=.34;
const NEW_CITY_COLLISION_MIN_Y=.10;
const NEW_CITY_COLLISION_MAX_Y=2.25;
const NEW_CITY_COLLISION_MIN_VERTICAL_SPAN=.55;
```
- Wall triangle edges are rasterized into collision cells and merged into compact AABB strips.
- `insideBuilding`, `slideBuilding`, zombie blocking, and A* all share the same collision data.
- Current player wall radius: `.36`.
- Current zombie collision radius: `.38`.
- These smaller radii are intentional: v324 was specifically made to open narrow alleys, stoops, door approaches, railings, and other passages that were too restrictive in v323.

### Zombie navigation
```js
const ZNAV_CELL=1.5;
const ZNAV_PAD=.44;
const ZNAV_MAX_NODES=3600;
```
- A* uses the generated wall collision.
- v324 tightened the nav grid from the older coarser settings so zombies can use narrow real passages without walking through walls.
- Do not restore the older v320/v323 larger player/zombie clearance values unless explicitly troubleshooting a regression.

### Stairs / vertical ground following
v323 added real walkable stair/ground following instead of treating the whole game as flat Y=0.

```js
const PLAYER_STEP_UP=.62;
const PLAYER_STEP_DOWN=1.35;
```
- `samplePlayerGroundY()` raycasts the city GLB beneath the player.
- It accepts upward-facing surfaces with world normal Y >= .42.
- `playerGroundY` smoothly follows valid treads/ground, and camera height is added on top.
- Wall collision remains separate, so vertical surfaces should not become ground.
- If stairs regress, inspect this system before inventing ramps or changing map scale.

## Zombie spawning — CURRENT APPROVED SYSTEM

v323 stopped zombies from spawning inside enclosed buildings by creating spawn zones from real outdoor map meshes.

- Spawn zones are built only from mesh names matching `Road_*` or `ParkingBG_*`.
- Large `BG_*` block planes are intentionally excluded because buildings sit on top of them.
- `validZombieSpawn()` requires the candidate to be on one of those outdoor spawn zones, outside wall collision, and more than 22 units from the player.
- Normal spawn search: `findReachableZombieSpawn(24,42)`.
- Boss spawn search: `findReachableZombieSpawn(28,46)`.
- Spawn candidates are tested for direct or A*-reachable routes to the player.
- Do not revert to random radial spawning without the road/parking-surface validation; that caused zombies to appear inside buildings and become trapped.

## Waves / zombies / headshots — CURRENT APPROVED VALUES

`src/wave-utils.js` currently starts ordinary waves at:
```js
count:10+(w-1)*3
```

So Wave 1 = 10 normal zombies, then +3 per normal wave formula. Existing boss-wave logic remains every 10th wave.

Active optimization cap:
```js
const MAX_ACTIVE_ZOMBIES=30;
```

Non-boss headshots are **not forced instant kills anymore**:
```js
const headshotToughness=1+Math.max(0,wave-1)*.2;
z.hp-=shotDamage*3/headshotToughness;
```
This implements the user's request as increasing zombie headshot resistance by 0.2 per round, so later waves do not stay guaranteed one-shot head kills. Boss headshot logic remains separate.

## Player movement / round recovery — CURRENT APPROVED VALUES

- Walk speed: 5.
- Sprint speed: **9.5**.
- Sprint drain: approximately 33.34/sec.
- Sprint recharge: 14/sec.
- At every new round / Ready transition:
  - health is restored to 100,
  - health regen state resets,
  - sprint energy is restored to 100,
  - sprint lock is cleared.
- Preserve this behavior unless the user asks to change it.

## Weapons / gameplay protections inherited from v303

Unless explicitly requested, preserve the approved weapon/reload/game systems inherited from v303:
- M17: 16-round magazine, unlimited reserve, lower base damage, centered ADS/hit alignment.
- M4: preserve damage/ammo/reload behavior; do not give unlimited ammo or lower damage.
- MP5: preserve approved ADS/recoil/reload behavior.
- Existing reload choreography is sensitive; do not copy one weapon's reload solution onto another.
- Audio remains inline in `src/game.js`; prior extraction to `src/audio.js` broke sound.
- Preserve start screen, START OUTBREAK, sound, store, pause behavior, Ready flow, death/restart, bosses, pickups, boss chest hitbox, zombie head hitboxes, and weapon collision/retraction.

## Protected historical fallback

The former clean recovery point is still valuable if a catastrophic regression requires a known pre-new-city baseline:

- clean v303 gameplay commit: `8e0c312eab781ba978ebb7f5bf503253e0d5e955`
- clean v303 exact tree: `ce560411d2751ccdc8068bfa16753cc77adeb74a`
- later exact-v303 restore commit: `15665eab18251b75934d81ba1d7775fa11a3dc0f`

**v324 is now the primary recovery. v303 is the secondary clean fallback.**

## Abandoned map history — DO NOT RESURRECT WITHOUT USER REQUEST

- Trailer Park work was abandoned.
- Havana work was abandoned and its GLB was removed from the clean baseline.
- The current city GLB replaced the old procedural city.
- Do not reintroduce Trailer Park, Havana, old procedural roads/city, or old STI map props unless the user explicitly asks.

## Immediate next-chat priority

The user has approved the current state as the new recovery checkpoint. The next chat should **not immediately redesign anything**. Start by reading the repo and asking/acting on the user's next requested test or change. If collision is revisited, first reproduce the exact problem location from a screenshot and make a narrow fix; do not globally inflate wall collision or nav padding because v324 intentionally opened tight passages.

---

# CURRENT STATE UPDATE — 2026-09-28 — READ THIS FIRST

This section supersedes older "current checkpoint" references below. Keep the older sections as project history/reference.

## Current approved live checkpoint

- Build/cache generation: **v303**
- Approved live modular/gameplay checkpoint commit: **8e0c312eab781ba978ebb7f5bf503253e0d5e955**
- GitHub Pages entry loads: `./src/game.js?v=303`
- Live game: https://xboxlivehd88-hue.github.io/city-outbreak/
- The user confirmed **v303 works fine** and approved it as the current checkpoint.
- **v301** commit `9410af6c6e999d5451afd5850b8f6ec28e55e0e5` was a behavior-neutral module-comment/documentation cleanup.
- **v302** consolidated already-approved reset UI overlay cleanup into `resetRunUiOverlays()`; it did not intentionally change gameplay.
- **v289 pause behavior remains the approved pause baseline. v290/v291 pointer-lock resume experiments were reverted.**
- Last fully approved pre-modular gameplay baseline remains **v257**, commit **138e961c2597cb5ff6099798314d1f40308388c4**.

## Current live modular structure

- `index.html` — HTML/UI shell, import map, game loader.
- `src/game.css` — live CSS. Start-screen path must remain `../assets/city-outbreak-start-v153.jpg.jpg`.
- `src/game.js` — main live runtime and gameplay state.
- `src/zombie-rig-data.js` — exact live zombie rig data.
- `src/wave-utils.js` — pure/stateless wave difficulty calculations: `diff(w)`, `isBossWave(w)`, `bossTier(w)`, and `bossScaleFactor(w)`.
- `src/performance-hud.js` — live performance HUD helper.
- `src/ui-helpers.js` — live UI rendering/wiring helpers:
  - transient messages
  - Controls modal
  - Start/Restart/Death Restart wiring
  - Pause/Resume wiring
  - boss HUD
  - sprint HUD
  - main HUD
  - death stats
  - wave/announcement display
  - Ready/Next Wave wiring
  - shop buy-button wiring
  - runtime error overlay + listener registration
- `src/render-utils.js` — renderer resize + WebGL context-loss wiring.
- `src/format-utils.js` — pure run-time formatter.
- `src/input-utils.js` — live input/event wiring:
  - key-state clearing
  - context-menu suppression
  - blur/tab-visibility safety wiring
  - pointer-lock change listener wiring
  - keyup/keydown listener wiring
  - mousemove listener wiring
  - mousedown/mouseup/pointer-cancel listener wiring

## v262–v303 approved modularization sequence

The user individually tested and approved the incremental modular changes through v303. Key later checkpoints include:
- v277 input key reset utility
- v278 runtime error overlay rendering
- v279–v285 input/listener wiring cleanup
- v286 runtime error listener wiring
- v287 damage-overlay flash rendering
- v288 shop-note rendering
- v289 pause UI rendering — **approved pause baseline**
- v290/v291 pointer-lock resume experiments — **reverted**
- v292 death-screen visibility
- v293 boss HUD hide rendering
- v294 announcement reset cleanup
- v295 shop panel visibility
- v296 duplicate transient-message reset cleanup
- v297 damage-overlay reset cleanup
- v298 hit-marker reset cleanup
- v299 nuke-overlay reset cleanup
- v300 start-screen reset hide
- v301 module header/comment refresh only — no intended runtime behavior change
- v302 consolidated the already-approved reset overlay helpers behind `resetRunUiOverlays()`
- v303 extracted only the four pure wave/difficulty calculations into `src/wave-utils.js` with formulas unchanged; the user tested it and said it works fine.

The input callbacks still keep gameplay decisions in `game.js`; helper modules primarily own registration/DOM plumbing. Do not move gameplay math or weapon behavior merely for decomposition.

## Next development recommendation after v303

The low-risk UI/input/reset work and the obvious pure wave calculation extraction are complete through v303. Do **not** force more modularization just to create modules.

Repository housekeeping after v303 removes the old unused scaffold files `src/config.js`, `src/main.js`, `src/weapons.js`, and `src/zombies.js`. They had no live references. Keep `src/audio.js` present but unused because the live/proven audio remains inline in `src/game.js`.

Recommended direction now:
1. Preserve v303 as the approved gameplay recovery point.
2. Prefer actual bug fixing, gameplay polish, map/content work, or a clearly cohesive subsystem over further tiny extractions.
3. If doing more structural work, require a genuinely isolated subsystem and keep it behavior-neutral.
4. Continue avoiding audio, reloads, weapon ADS/firing rays, zombie pathing, boss combat behavior, store timing, and frame-loop timing unless the user deliberately chooses one of those areas.
5. Continue one atomic change at a time, verify locked values, wait for Pages success when live runtime changes, then let the user test.

Sensitive/locked areas:
- inline audio
- all reload animations
- M17/M4/MP5 ADS, hit alignment, firing rays, transforms, and recoil
- zombie AI/pathing/spawn reachability
- boss movement/attacks/chest hitbox
- store low-power timing and game-time freeze
- frame loop/core timing
- v289 pause behavior
- start screen/startup/audio/death/restart behavior

## Critical locked behavior

- Audio remains **inline in `src/game.js`**. `src/audio.js` exists but is NOT live; the earlier audio extraction caused no sound.
- Do not alter approved reloads unless the user requests a specific weapon.
- Preserve M17 ADS/firing alignment, M4 state, MP5 state, store low-power behavior, boss behavior, and zombie pathing.
- Preserve `MAX_ACTIVE_ZOMBIES = 20`, full-city A* behavior, and the current 2600 A* node budget.
- Continue making one small self-contained change at a time, commit to `main`, verify the diff/locked values, wait for GitHub Pages deploy, then give a fresh cache-busted test link.

---


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
