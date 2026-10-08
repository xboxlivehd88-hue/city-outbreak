# M4 TUNING PHASE — 2026-10-07 — v479 — VIDEO-BASED ADS ZERO + RECOIL CORRECTION — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=479`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v478 optical-axis / two-pass ACOG baseline commit: `3059db7d2fc70349175a77243fb9fee53ab307a8`
- v479 ADS-recoil prep commit: `95309a80a2074338ebd5cc95fa464af330b6eacf`
- v479 final gameplay commit: `bfde34ec1566cbd8224905fef51cd44472c24426`
- v479 loader commit: `1ef7f488a3b174f366e9949c29e742c75a5e0250`
- Current `src/game.js` SHA: `73d416aa34164c6051c90078339fec1dd0f66f1b`
- Protected recovery remains **v324** unchanged.

## User-provided v478 video

User tested live v478 from:
- `?v=478-37706847064`

They reported:
- ADS hit/impact is a little **low** compared with the reticle;
- M4 ADS recoil is **out of control**.

The video confirms both.

## v479 fixes

### ADS shot zero
Add a tiny rifle-only ADS correction:
- `rifleAdsZeroY=+0.003`

Only applies while aiming with the M4.

This raises impact slightly toward the modeled reticle.

### ADS recoil
Reduce only the M4 viewmodel recoil as ADS blends in:
- hip recoil scale = `1.0`
- full ADS recoil scale = `0.22`
- smooth `lerp(1,0.22,aimBlend)`

This leaves hip recoil and other weapons unchanged.

## Preserve v478 structure

Do not regress:
- real ACOG optical-axis alignment;
- rear/front 5% aperture calculation;
- removal of old `-0.008` shot offset;
- two-pass ACOG body/glass rendering;
- approved v470 hip placement;
- ~0.18 rear-lens eye distance.

## Next test

Ask user to check:
- hit lands on reticle instead of slightly low;
- automatic ADS recoil is now controlled;
- scope remains aligned;
- hip ACOG still looks clean.

If one is still slightly off, tune only that single value next.

Temporary M4 starting loadout remains active.

---

# M4 TUNING PHASE — 2026-10-07 — v478 — TRUE OPTICAL-AXIS ADS + TWO-PASS ACOG — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=478`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v478 gameplay commit: `3059db7d2fc70349175a77243fb9fee53ab307a8`
- v478 loader commit: `0cbf57898ff846029d8935a368162f3118aa02e2`
- v478 loader Pages run: `37706610309` — build/deploy succeeded.
- Current `src/game.js` SHA: `7e205729b4f87389613c56f745362fafad3b796a`
- Protected recovery remains **v324** unchanged.

## User-provided v477 video

The user uploaded a ~21.5s gameplay video and reported:
- ADS sight/reticle is not lined up;
- shots are not landing where the modeled sight is aimed;
- ACOG still looks broken at hip even though the GLB is correct.

Video confirms both.

## Root cause — ADS

Previous code centered the **whole ACOG outer bounds**, not the actual optical tube.

Because the outer mesh includes knobs/mount/body, outer-box center != aperture/reticle axis.

v477 also had:
- manual full-ADS pitch endpoint `-2.5°`;
- manual M4 shot offset `rifleAdsZeroY=-.008`.

Those independent guesses allowed the modeled sight and bullet ray to disagree.

## Root cause — hip scope

A temporary GLB diagnostic measured the real `acog_optic.001_0` mesh/texture.

Key facts:
- ACOG is overwhelmingly opaque housing;
- base-color alpha texture is 1024×1024;
- 1,000,538 / 1,048,576 pixels are alpha 255;
- only 44,627 pixels are below alpha 250;
- rear/front 5% tube bands have stable centers suitable for measuring the true optical axis.

So the hip artifact came from rendering the entire scope mesh as one transparent object, causing transparent self-sorting/internal geometry bleed.

Temporary diagnostic workflow was deleted in commit `f50098127dd849a33a0d4b0df4e0d7ed1529cb65`.

## v478 fix

### True optical-axis ADS
At rebuild:
- find exact mesh `acog_optic.001_0`;
- average rear-most 5% of tube vertices;
- average front-most 5%;
- transform both into M4-root space;
- derive true optical-axis vector;
- compute quaternion that points that axis exactly camera-forward;
- solve root position so the actual rear aperture lands at screen center ~0.18 units from the eye.

Hip pose remains approved v470 and quaternion-slerps into the calculated ADS quaternion.

### Shot ray
Remove:
- `rifleAdsZeroY=-.008`.

M4 ADS now uses camera/screen center because the modeled optical axis is also aligned to that same center.

### Two-pass ACOG
Opaque body:
- original ACOG mesh;
- `transparent=false`;
- `depthWrite=true`;
- `alphaTest=.985`;
- `alphaToCoverage=true`.

Transparent glass:
- exact geometry clone;
- original maps/textures;
- `transparent=true`;
- `depthWrite=false`;
- shader discards near-opaque pixels so only glass region blends.

Both passes retain emissive clamp `.15`.

This should keep the real glass see-through while preventing the opaque housing from revealing its internals at hip.

## Do not change

Preserve:
- approved v470 hip placement;
- overall M4 size/orientation;
- FOV 48;
- recoil;
- damage/spread;
- ammo;
- sounds;
- reload choreography;
- temporary M4 starting loadout;
- unrelated systems.

## Next test

Ask user to verify:
- hip ACOG no longer looks broken/open;
- ADS lines the actual optical tube up with the eye;
- shots land where modeled sight aims;
- hip placement stayed the same.

Do not reintroduce separate visual and bullet offsets if fine-tuning is needed.

---

# M4 TUNING PHASE — 2026-10-06 — v477 — ADS REAR-DROP TEST ONLY — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=477`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v477 gameplay commit: `3140614df9ca37b76f0413f0edf717794167dfe6`
- v477 loader commit: `ee4b44924de17e05e41e8e30c3bda084b4465f51`
- Current `src/game.js` SHA: `1760f0847385de32f58735cb13910ffb89be3611`
- Protected recovery remains **v324** unchanged.

## User's chosen next step

User chose **option 1 first**: lower the rear of the rifle while ADS.

## v477 change

Only the M4 pitch endpoint at full ADS changed:
- from `0°`
- to `-2.5°`

Hip pitch stays `-8°`.

No scope-material, ADS-target, eye-distance, FOV, zeroing, recoil, damage, reload, sound, or hip-placement changes.

## Next test

Ask user only whether:
- the rear now sits lower enough;
- reticle and iron sight line up better;
- scope remains comfortably aligned to the eye.

Keep this as a single-variable ADS test.

Temporary M4 starting loadout remains active.

---

# M4 TUNING PHASE — 2026-10-06 — v476 — ACOG VIEW CLEANUP / FINAL ADS ZERO NUDGE — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=476`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v476 gameplay commit: `0f11aa9b4f5b452d3fcfb052e554e8f3015e1e8e`
- v476 loader commit: `547bb3999857252fc87d4785441fade77e9e71fd`
- Current `src/game.js` SHA: `abd72e7e112bc815ab1dd7963c8df3a08b3c5922`
- Protected recovery remains **v324** unchanged.

## User-observed v475 result

User screenshot showed:
- real ACOG is now see-through;
- ADS is very close;
- scope still sits slightly high;
- scope transparency still has a small internal artifact;
- hit lands just a hair above the iron sight.

## v476 changes

Only three M4 ADS refinements:

1. ACOG vertical target:
   - `adsEyeYCorrection` from `-.034` to `-.042`.

2. Real ACOG blend behavior:
   - `transparent=true`
   - `depthWrite=false`
   - `depthTest=true`
   - `alphaTest=0`
   - remove forced side override
   - emissive clamp stays `.15`.

3. M4 ADS shot zero:
   - `rifleAdsZeroY=-.008` only while aiming with rifle.

Do not change:
- v470 hip placement;
- horizontal ADS alignment;
- eye distance;
- FOV 48;
- recoil/damage/reload/sound;
- other weapons.

## Next test

Ask user to confirm:
- scope is now vertically centered;
- glass looks cleaner;
- impact lands on sight;
- horizontal/eye distance stayed good;
- hip placement remains approved.

If good, preserve the current M4 pose/ADS values before moving to the next M4 issue.

---

# M4 TUNING PHASE — 2026-10-06 — v475 — ORIGINAL ACOG GLASS TRANSPARENCY RESTORED — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=475`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v475 gameplay/material commit: `3194812a2c7fae48f0a881b8b24ca83362398d2e`
- v475 loader commit: `13a8096ad6bc2d270a42198967b8550c70c4812a`
- Current `src/game.js` SHA: `6d2332ae17c88e82b1f3602b00061491192ec480`
- Protected recovery remains **v324** unchanged.

## User-observed v474 result

The real ACOG is aligned well in ADS, but the lens is completely black/opaque. User correctly noted the source GLB itself is viewable through.

## Root cause

Our v472 material override set the ACOG to:
- `transparent=false`

That fixed the earlier emissive/transparency artifact but also made the modeled glass opaque.

The GLB is not broken.

## v475 fix

Restore see-through behavior on the original ACOG material:
- `transparent=true`
- `alphaTest=.02`

Keep:
- original ACOG geometry and textures;
- `depthWrite=true`;
- `depthTest=true`;
- reduced emissive intensity `.15`.

Do not change:
- v470 hip placement;
- v474 ADS alignment;
- scope distance;
- FOV;
- recoil/damage/reload/sound.

## Next test

Ask user only:
- is the real ACOG lens see-through now;
- is ADS alignment still good;
- did hip-fire optic appearance remain clean;
- did the old glow/split artifact stay gone.

Temporary M4 starting loadout remains active.

---

# M4 TUNING PHASE — 2026-10-06 — v474 — ACOG ADS VERTICAL EYE-LINE CORRECTION — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=474`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v474 ADS vertical-fix commit: `58c5605ee155031b3360943a5e4670cdf211a267`
- v474 loader commit: `6f3511eceaf966f0a6909648820a7d059eb71318`
- Current `src/game.js` SHA: `0bbc70d1a44458a4d74d06a0697f937cc4778e50`
- Protected recovery remains **v324** unchanged.

## User-observed v473 result

User said true model ADS was a **really good first try**, but the ACOG sits much too high.

From the screenshot:
- horizontal alignment is already close;
- rear-lens distance / apparent size is already close;
- the optic center is roughly 200 px above screen center at 1920×1080.

## v474 fix

Only the calculated M4 ADS Y target changes:
- adds `adsEyeYCorrection=-.034`.

Everything else remains:
- same real ACOG geometry;
- same ACOG material fix;
- same rear-lens distance (`~0.18`);
- same rifle FOV (48);
- same v470 hip placement;
- same model-based ADS behavior;
- same recoil/damage/reload/sound.

## Next test

Check only:
- vertical centering of the real ACOG;
- horizontal centering stays good;
- eye distance stays good;
- hip placement remains unchanged.

If more tuning is needed, adjust only the ADS target from the next screenshot.

Temporary M4 starting loadout remains active.

---

# M4 TUNING PHASE — 2026-10-06 — v473 — TRUE MODEL-BASED ACOG ADS — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=473`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v473 true-ADS gameplay commit: `06944eb7cc3cd11e9fa7a6dbe816d727fd711cc8`
- v473 loader commit: `c909e73b25f33ee2617f981ed731bced8cf389c9`
- Current `src/game.js` SHA: `e5bcc7fe28a5579dd66eeb868f4b65a9fa698978`
- Protected recovery remains **v324** unchanged.

## Approved baseline

User tested v472 and said **"perfect"**.

Treat as approved:
- real ACOG geometry/material appearance;
- v470 hip placement;
- M4 direction and scale.

Do not change those while tuning ADS.

## v473 request / behavior

User asked to use the modeled ACOG as actual ADS by bringing it to the eye and seeing through it.

v473:
- disables the legacy M4 full-screen scope overlay;
- keeps the M4 visible during ADS;
- finds the actual `acog` node / `acog_optic.001_0` mesh;
- measures its real bounds;
- calculates full ADS position from that geometry;
- centers the optic on the camera;
- places rear lens about `0.18` in front of the eye;
- keeps rifle FOV at 48 for first test;
- preserves AWM overlay behavior.

Hip pose remains exactly v470:
- `.54,-.56,-1.48`
- pitch `-8°`
- roll `-6°`

Full ADS rotation becomes zero as before, but position now uses the calculated real-scope target rather than the old `.36,-.25,-1.66` guess.

## Next test

Ask user to check:
- real ACOG moves to eye;
- centered correctly;
- can see through modeled optic;
- rear lens distance;
- whether FOV 48 feels right;
- approved hip placement is unchanged.

If ADS is slightly off, tune only the ADS eye target/FOV. Do not disturb approved hip placement or replace the optic.

Temporary M4 starting loadout remains active.

---

# M4 TUNING PHASE — 2026-10-06 — v472 — ORIGINAL GLB ACOG RESTORED / THREE.JS MATERIAL FIX — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=472`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v472 gameplay/material-fix commit: `36afed664c22853e1a4b916e667b31ab5ebd457d`
- v472 loader commit: `bacd8818502fa26973ddebffb6ab02feca2378d9`
- Current `src/game.js` SHA: `20e5c4c0428fd24184e8fb2a2d300d4be469ea64`
- Protected recovery remains **v324** unchanged.

## What was learned from the actual GLB

The user correctly pointed out that the GLB opens normally on their end and asked us to inspect the binary itself.

A temporary repo-side diagnostic parsed the real GLB, then was removed.

Confirmed:
- scope node: `acog`;
- scope mesh: `acog_optic.001_0`;
- scope material: `optic.001`;
- scope geometry is valid;
- material uses `alphaMode: BLEND`;
- material has emissive texture/factor;
- emissive strength extension is **10.0**.

So the broken-looking optic in-game is not bad GLB geometry. It is a Three.js rendering/material issue: the whole ACOG is being treated as transparent and heavily emissive, which causes first-person transparency/depth/glow artifacts.

## v472 fix

Remove the v471 fake/procedural replacement optic approach.

Restore the original ACOG from the uploaded GLB and adjust only its runtime material:
- keep original geometry/textures;
- disable transparent blending on the whole optic mesh;
- enable depth test/write;
- use small alpha-test cutoff;
- reduce emissive intensity to 0.15.

Do not replace the ACOG geometry unless the user explicitly asks.

## Approved placement baseline

User said they like v470 placement for sure.

Do not change:
- hip pose;
- scale;
- rotation;
- ADS blend target;
- overall M4 placement.

No recoil/damage/ammo/sound/reload/unrelated systems changed in v472.

## Next test

Ask user only:
- does the original ACOG now look intact;
- did v470 placement stay the same;
- does ADS still behave normally.

If optic still has an issue, work directly from exact node `acog`, mesh `acog_optic.001_0`, material `optic.001`.

Temporary M4 starting loadout remains active.

---

# M4 TUNING PHASE — 2026-10-06 — v471 — BROKEN IMPORTED OPTIC REPLACED — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=471`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v471 optic commits:
  - `672e5440a3ad3bb92de4b2309838bcf33a856967`
  - `5bc5a8e6873dd0b0464a0d5b2fda7b0c54bdfcdc`
- v471 loader commit: `4ba8eb387bdd049eccc3a7a3f493a90d2da5dd97`
- v471 Pages run: `37537472601` success
- Current `src/game.js` SHA: `bd5527dd50f96c8a4179fa0eb75dce7188032576`
- Protected recovery remains **v324** unchanged.

## User-approved placement baseline

User said they **like the v470 placement for sure**.

Do not alter:
- v470 hip position;
- pitch/roll;
- ADS blend target;
- overall M4 placement

unless the user explicitly asks.

## v471 optic fix

The imported replacement-GLB optic still looked visibly broken in v470.

v471:
- hides the bad imported optic assembly by semantic name where possible;
- uses a bounded top/rear spatial fallback for generic mesh names;
- mounts a new compact procedural optic in the rifle's local coordinate space;
- keeps v470 placement unchanged.

The second v471 commit corrected local-vs-transformed coordinate handling before live deployment.

No recoil/damage/ammo/sound/reload/unrelated systems changed.

## Next test

Ask user only whether:
- placement stayed the same;
- broken optic is gone;
- replacement optic looks correctly mounted;
- ADS still behaves normally.

Temporary M4 starting loadout remains active.

---

# M4 TUNING PHASE — 2026-10-06 — v470 — DEDICATED FIRST-PERSON M4 POSE — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=470`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v470 pose commit: `4b84bcdd5cb7f3f49ee790540da5425a52ec9963`
- v470 loader commit: `ad2f38fa61e77ade8245d81bc65ab3b111cbbf54`
- v470 Pages run: `37535907982` success
- Current `src/game.js` SHA: `1fe960e410eacaf73890b15f3276166ae6df9b84`
- Protected recovery remains **v324** unchanged.

## User-observed v469 result

User screenshot showed the M4 still looked badly posed:
- correct direction;
- usable scale;
- too centered/upright;
- rear/stock crowded camera;
- front perspective looked stretched;
- optic still looked broken.

User explicitly told us to **just do the fix** instead of explaining it.

## v470 fix

The replacement M4 now has its own first-person hip pose.

Hip:
- X `.54`
- Y `-.56`
- Z `-1.48`
- pitch `-8°`
- yaw `0°`
- roll `-6°`

As ADS blends in, root returns to the existing centered ADS pose:
- X `.36`
- Y `-.25`
- Z `-1.66`
- rotation `0,0,0`

Reload stays at the existing neutral root `.36,-.25,-1.66`, rotation zero.

No recoil/damage/sound/ammo/ADS-FOV/reload choreography/unrelated systems changed.

The optic itself is not modified yet. If it still looks malformed after this complete-gun pose correction, make the next build optic-only.

## Next test

Ask user to inspect:
- shouldered lower/right hip pose;
- whether chin-crowding is gone;
- whether front perspective looks natural;
- optic appearance;
- ADS behavior.

Temporary M4 starting loadout remains active.

---

# M4 TUNING PHASE — 2026-10-06 — v469 — HIP-FIRE PLACEMENT CORRECTION — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=469`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v469 hip-pose commit: `f2e7ff414d7ca3fdd0d2e2d7127bf0445b2cd129`
- v469 loader commit: `cd9dab90bba29b7968ea9ac8cbb7f86db251222f`
- v469 Pages run: `37534672201` success
- Current `src/game.js` SHA: `e6e84c74067bd5311f1716acfbe4f3f4d08d412e`
- Protected recovery remains **v324** unchanged.

## User-observed v468 result

User screenshot showed:
- rifle orientation now correct;
- scope looks broken;
- front of rifle feels too far away;
- rifle looks held too high, like against the player's chin.

## v469 fix

Only the M4 hip-fire pose changed.

Hip-fire now:
- lowers M4 root Y from `-.25` to `-.42`;
- moves M4 root Z from `-1.62` to `-1.85`.

As ADS blends in:
- Y smoothly returns to `-.25`;
- Z smoothly returns to `-1.66`.

Reload stays at:
- Y `-.25`;
- Z `-1.66`.

So full ADS and reload placement remain unchanged.

## Scope/optic rule

The optic itself was **not changed yet**.

First see how it looks after the corrected hip pose. If it still looks broken, make a separate M4-only optic fix from the user's next screenshot/ADS test.

Do not combine optic changes with unrelated recoil/damage/reload work.

## Next test

Ask user to check:
- whether rifle now looks shouldered rather than held at chin;
- whether rear/stock is less oversized;
- whether front no longer feels absurdly far away;
- what optic looks like now;
- ADS if possible.

Temporary M4 starting loadout remains active.

---

# M4 TUNING PHASE — 2026-10-06 — v468 — REPLACEMENT M4 ORIENTATION FLIP — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=468`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v468 orientation-fix commit: `16df10a4ccf392bc752ac34946d00cf50f138734`
- v468 loader commit: `d651da078e308db717fb3662e29db4313cde6a7c`
- Current `src/game.js` SHA: `815ff85b302473435355d65189d618430ba20864`
- Protected recovery remains **v324** unchanged.

## User-observed v467 result

User screenshot showed:
- replacement rifle now visible at a usable scale;
- black-screen/oversize issue fixed;
- rifle pointed 180° backward.

## v468 fix

Only the replacement M4's Y rotation changed:
- from `Math.PI`
- to `0`

Do not change scale, position, ADS, recoil, damage, sound, reload or unrelated systems until the user tests v468.

## Next test

Confirm:
- muzzle points away from player;
- stock is toward player;
- size remains acceptable;
- note hip-fire placement;
- then inspect ADS.

Temporary M4 starting loadout remains active.

---

# M4 TUNING PHASE — 2026-10-06 — v467 — REPLACEMENT M4 SCALE NORMALIZATION — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=467`
- Active M4 asset: `assets/ar-15_style_rifle.glb?v=466`
- v467 scale-fix commit: `3b3a2d45da09d47a407e95bfb4cea98bebaf25e1`
- v467 loader commit: `57bbc3aa8888a122cf10aa98974193568ef1e20c`
- v467 Pages run: `37532220116` success
- Current `src/game.js` SHA: `c6d007875d4544340a6dea8fea40a3b70e250e7c`
- Protected recovery remains **v324** unchanged.

## User-observed v466 problem

User screenshot showed the replacement M4 massively oversized around the camera:
- nearly full black screen;
- only a dark weapon wedge/sliver visible;
- HUD still visible.

The replacement GLB itself was loading; the old M4's fixed `5.15` scale was incompatible with the new asset's authored size.

## v467 fix

Only the M4 visual scale was changed:
- compute the cloned GLB's `Box3` bounds;
- find its longest dimension;
- normalize that longest dimension to about `3.45` first-person units.

Orientation, position, ADS, recoil, damage, sound, reload and all unrelated systems remain unchanged.

## Next test / next step

The purpose of v467 is to make the complete new rifle visible so placement can be tuned.

Ask the user to report or screenshot:
- whether the blocked/black view is fixed;
- whether the whole rifle is visible;
- direction/orientation;
- apparent size;
- hip-fire placement;
- ADS alignment.

Then change one M4-only transform issue at a time.

Temporary M4 starting loadout remains active.

---

# M4 TUNING PHASE — 2026-10-06 — v466 — NEW M4 GLB FULL VIEWMODEL REPLACEMENT — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live state

- Loader: `./src/game.js?v=466`
- New M4 asset: `assets/ar-15_style_rifle.glb`
- Asset upload commit: `07f513f3e57a018f655be2ae73d642c5f78a66ee`
- v466 model-swap commit: `a9ca029ecc65154f96a100397a1953346dc279ae`
- v466 loader commit: `9859c166028eb5232c58b2acfd1472a99bb219e5`
- v466 Pages run: `37531314757` success
- Current `src/game.js` SHA: `bb34c8b8faddcfd457d8690b7052155eb9528137`
- Protected recovery remains **v324** unchanged.

## What changed

The old M4 runtime GLB:
- `assets/classic_m4.glb.glb`

was replaced in the M4 loader by:
- `assets/ar-15_style_rifle.glb?v=466`

Only the model source URL changed.

The old GLB file still exists in `assets` for rollback but is no longer referenced or loaded by the game.

The temporary M4 testing loadout remains:
- player starts with M4;
- reset/restart starts with M4;
- M4 unlocked;
- M17 remains unlocked.

## Important: first test before tuning

Do not immediately retune transforms.

The first v466 test should establish how the new GLB sits using the old M4 values:
- size;
- orientation;
- hip-fire position;
- ADS alignment;
- reload/magazine visual.

Existing scale/position/ADS/recoil/damage/ammo/sound/reload logic were intentionally left unchanged.

Current magazine lookup still expects `Magazine_m4_0` or `Magazine`. If the new GLB uses another node name, fix that separately only after observing the reload test.

## Next step

Ask the user what is visually wrong with v466, then make one M4-only adjustment at a time. Do not touch unrelated weapons/game systems.

---

# M4 TUNING PHASE — 2026-10-06 — v465 — TEMPORARY M4 STARTING LOADOUT — READ THIS FIRST

This section supersedes older current-phase/status sections below. **GitHub main is authoritative.**

## Current live / baseline state

- Loader: `./src/game.js?v=465`
- v465 gameplay commit: `1a4bb5091c4d877524f7af81153ff6ccf3a86757`
- v465 loader commit: `c3ba421d4d0acdb3ee6ee6785b7587853623cc7f`
- Current `src/game.js` SHA: `1c3f27a55c4e315ce955192d4eee7890f09123ae`
- **v464 is the latest user-confirmed good baseline before the M4 tuning phase.**
- Protected recovery remains **v324** unchanged.

## User's current goal

The user wants to fix/tune the M4.

For this phase, they explicitly want the player to **spawn with the M4** until they feel the weapon is in a good spot.

After that work begins, the user plans to upload a **new GLB file to replace the old M4 model**.

## v465 change

Temporary testing loadout only:
- initial state now starts with `weapon="rifle"`;
- reset/restart also starts with `weapon="rifle"`;
- `unlocked.rifle=true` in both starting-loadout definitions;
- M17 remains unlocked.

So every new run/restart starts holding the M4 while still allowing the player to switch to the M17.

No M4 model, ADS, recoil, damage, ammo, sound, reload, or firing behavior changed.

Verification:
- full `src/game.js` syntax parse passed;
- diff is limited to the two starting-loadout definitions;
- unrelated systems are untouched.

## Next work rule

Keep M4 as the temporary starting weapon until the user explicitly says M4 tuning is finished.

When the user uploads the replacement M4 GLB:
1. inspect the actual uploaded asset/current repo;
2. identify the exact filename/path;
3. read the current M4 model-loading and transform code;
4. replace only the M4 model first;
5. let the user test before retuning transforms/ADS/recoil unless replacement itself requires minimal alignment.

Do not guess asset names or work from an old model assumption.

## v465 test focus

Confirm:
- new game starts with M4;
- restart/reset starts with M4;
- M4 otherwise behaves exactly as before;
- M17 remains switchable;
- no unrelated regressions.

---

# CLEANUP COMPLETE — 2026-10-06 — v464 USER-CONFIRMED GOOD — READ THIS FIRST

This section supersedes older cleanup-status sections below. **GitHub main is authoritative.**

## Current live / confirmed state

- **Cleanup/performance phase is complete.**
- User tested v464 and said: **"it works"**.
- **v464 is the latest user-confirmed good build.**
- Loader: `./src/game.js?v=464`
- Current `src/game.js` SHA: `d81c5ba4f5e152ecafeb13b3f6b4f6dd4ae67d9c`
- Current `src/ui-helpers.js` SHA: `023797b0e936474c622ce32599fe02a550c27076`
- v464 successful gameplay Pages run: `37526091354`
- v464 documented-state Pages run before this completion note: `37526330902`

## Why cleanup stops here

Final audit after v464 confirmation found only one obvious safe allocation left:
- the performance HUD's `getFxCounts()` callback creates one tiny object roughly once per second.

Do **not** change it just to chase a microscopic allocation. The gain is negligible.

Remaining meaningful allocation sites are mostly entangled with protected/high-risk systems:
- reload/viewmodels;
- PBD/ragdoll/crawlers;
- zombie spawning/navigation/collision;
- grenade/spintop;
- map/collision;
- gun transforms/ADS/recoil;
- M240 audio;
- start/death/restart/shop/pause.

Do not resume cleanup automatically.

## Protected recovery

Protected recovery remains **v324**:
- gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
- protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
- loader `./src/game.js?v=324`

Never change this unless the user explicitly approves a new recovery checkpoint.

## Next-chat rule

The next work is a new user-chosen feature/fix phase starting from confirmed-good v464.

Before changing anything:
- read the newest top sections of both handoff files;
- read `CURRENT_RECOVERY_CHECKPOINT.md`;
- read current `index.html`;
- read current `src/game.js`;
- read the relevant module(s);
- make one isolated change at a time;
- preserve v464 as the latest confirmed-good cleanup baseline until the user confirms a newer build.

---

# LATEST LIVE STATE — 2026-10-06 — v464 — SPRINT HUD RETURN-OBJECT ALLOCATION CLEANUP — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=464`
- v464 helper cleanup commit: `7f5c24e5e8524b74e0c4348db48501815cb4fa4e`
- v464 helper cache-bust/game import commit: `7ca254845936987cbf240f9c999b1f7be0319083`
- v464 loader commit: `ff2a8208f1997b30e3efe4ec2d3ddfebb3de8bb2`
- v464 successful Pages run: `37526091354`
- Current `src/game.js` SHA: `d81c5ba4f5e152ecafeb13b3f6b4f6dd4ae67d9c`
- Current `src/ui-helpers.js` SHA: `023797b0e936474c622ce32599fe02a550c27076`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v463 and said: **"looks fine to me"**.
- **v463 is the latest user-confirmed good build.**
- v464 is live and awaiting user test.
- Preserve the current v459/v457 rain-cover behavior and its `rainCoverOrigin` scratch-vector optimization.

## v464 cleanup

Only the sprint HUD helper's return allocation changed.

Before:
- `renderSprintHud()` created a new `{pct,color,state}` result object every gameplay frame.

Now:
- one reusable module-level `sprintHudResult` object stores those same three output values;
- the helper returns that same object every frame;
- `updateSprintUI()` still immediately copies `pct`, `color`, and `state` into the same cached variables;
- `ui-helpers.js` import was cache-busted to `?v=464`.

All sprint behavior and display math are unchanged.

Verification:
- only one runtime caller was found for `renderSprintHud()`;
- `game.js` and `ui-helpers.js` both parse cleanly;
- Pages run `37526091354` succeeded;
- all protected gameplay systems remain untouched;
- protected v324 recovery remains unchanged.

## Cleanup finish estimate

After v464, estimate **0–2 worthwhile low-risk passes remain**.

The only obvious safe remaining candidate is a small low-frequency performance HUD bookkeeping allocation. If that gain is too small to justify another change, cleanup should be declared complete rather than touching protected systems.

## v464 test focus

Check:
1. game smooth/playable;
2. sprint drains/recharges normally;
3. exhausted sprint still shows RECOVERING and unlocks correctly;
4. sprint HUD percentage, color and READY state are unchanged;
5. no boss/rain/unrelated regression.

## Next step after confirmation

If v464 is good, reassess one final performance HUD bookkeeping cleanup. If it is not worth the risk/noise, call the cleanup phase complete.

---

# LATEST LIVE STATE — 2026-10-06 — v463 — SPRINT HUD PER-FRAME ARGUMENT CLEANUP — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=463`
- v463 cleanup commit: `cf12e9f2a8b3eae2c91bdb21867cfabaf8d61ca8`
- v463 loader commit: `a53c5a156991ff8211e18012ebdd2ab4fe8c37f5`
- v463 Pages retrigger commit: `0bba34921b87c1242016f1d3ebe0599e4acf512f` — no gameplay change.
- v463 successful Pages run: `37524511578`
- Current `src/game.js` content SHA: `a345236d3c528bbe714623f994fc52729cb7c6f4`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v462 through a boss wave and said: **"boss wave worked just fine"**.
- **v462 is the latest user-confirmed good build.**
- v463 is live and awaiting user test.
- Preserve the current v459/v457 rain-cover behavior and its `rainCoverOrigin` scratch-vector optimization.

## v463 cleanup

Only sprint HUD argument allocation changed.

Before:
- `updateSprintUI()` created a new options object every gameplay frame.

Now:
- one reusable `sprintHudRenderArgs` object holds the same static sprint HUD element references;
- each frame updates the current sprint energy/locked state plus the cached previous render values;
- `renderSprintHud()` receives the same effective values.

Sprint behavior is unchanged:
- drain/recharge rates;
- lock/recovery behavior;
- sprint speed;
- percentage, color, READY and RECOVERING display.

Verification:
- full `src/game.js` syntax parse passed;
- exact gameplay diff is limited to this reusable HUD argument object;
- first v463 loader run `37523689985` built successfully but got stuck in GitHub's Pages environment gate;
- no-code index retrigger commit `0bba34921b87c1242016f1d3ebe0599e4acf512f` cancelled that waiting run and successful Pages run `37524511578` deployed the same v463 game;
- all protected systems remain untouched;
- protected v324 recovery remains unchanged.

## Cleanup finish estimate

After v463, estimate **1–3 worthwhile low-risk passes remain**.

Likely safe remainder:
- possibly remove the tiny return-object allocation from `renderSprintHud()`;
- possibly one low-frequency performance HUD bookkeeping allocation.

Do not chase remaining allocations inside reload/viewmodels, PBD/ragdoll/crawlers, zombie spawn/navigation/collision, grenades, map/collision, weapons, or M240 audio.

If the remaining safe wins are too small to justify another change, call cleanup complete.

## v463 test focus

Check:
1. game smooth/playable;
2. sprint drains and recharges normally;
3. exhausting sprint still shows RECOVERING and unlocks normally;
4. sprint HUD percentage, color and READY state look unchanged;
5. no boss/rain/unrelated regression.

## Next step after confirmation

If v463 is good, do at most one isolated low-risk UI/performance bookkeeping cleanup at a time and reassess whether cleanup should end.

---

# LATEST LIVE STATE — 2026-10-06 — v462 — BOSS HUD PER-FRAME ALLOCATION CLEANUP — READ THIS FIRST

This section supersedes older "current live state" sections below. **GitHub main is authoritative.** Do not redefine the protected recovery checkpoint.

## Current live build

- Repo: `xboxlivehd88-hue/city-outbreak`
- Branch: `main`
- Current loader: `./src/game.js?v=462`
- v462 cleanup commit: `124371bfd385e1f35038d79f4d65400c9edc18b5`
- v462 loader/deploy commit: `f2467715179e7c7cd7cbdd0db414531273190406`
- v462 successful Pages run: `37521541188` — attempt 3 succeeded after two GitHub Pages HTTP 500 deployment failures with unchanged code.
- Current `src/game.js` content SHA: `06c50b9992a5bc0f88a5d2aa7f3c53a56b8ff891`
- Protected recovery remains **v324**:
  - gameplay commit `afddcebb47e06a82b4196638716f05e6f1adc941`
  - protected tree `5721309fc27f9f16ee7a2568a7f73fd429342502`
  - never change this unless the user explicitly approves a new recovery checkpoint.

## Latest test status

- User tested v461 and said: **"everything looks good let move to the next step"**.
- **v461 is the latest user-confirmed good build.**
- v462 is live and awaiting user test.
- Preserve the current v459/v457 rain-cover behavior and its `rainCoverOrigin` scratch-vector optimization.

## v462 cleanup

Only boss HUD argument allocation changed.

Before:
- `updateBossUI()` created a new object every gameplay frame to call `renderBossHud()`.

Now:
- one reusable `bossHudRenderArgs` object holds the same static HUD element references;
- each frame only `boss` and `wave` are refreshed;
- `renderBossHud()` receives the same effective values and remains otherwise unchanged.

No boss gameplay logic changed. Boss visibility, name, wave label and HP bar math are identical.

Verification:
- `src/game.js` full syntax parse passed;
- v462 gameplay diff is limited to this reusable HUD object;
- Pages run `37521541188` succeeded;
- initial deployment attempts 1 and 2 failed with GitHub-side HTTP 500 errors; attempt 3 succeeded without any code change;
- all protected systems remain untouched;
- protected v324 recovery remains unchanged.

## Cleanup finish estimate

Cleanup is nearing the end.

After v462, estimate **2–4 worthwhile low-risk passes remain**. Focus only on transient UI/performance-bookkeeping allocations or similarly isolated code.

Once those are exhausted, call cleanup complete rather than touching protected/high-risk systems just for tiny gains.

Do not touch:
- reload/viewmodel choreography;
- PBD/ragdoll or crawler behavior;
- zombie spawning/connectivity/navigation/anti-clumping;
- grenade/spintop;
- map/collision;
- gun transforms/ADS/recoil;
- M240 audio;
- start/death/restart/shop/pause.

## v462 test focus

Check:
1. game smooth/playable;
2. boss HUD hidden normally when there is no boss;
3. if a boss wave is reached, boss name/health bar/wave text work normally;
4. no unrelated regression;
5. rain behavior unchanged.

## Next step after confirmation

If v462 is good, do one more isolated low-risk cleanup, preferably transient HUD/performance bookkeeping. Do not broaden scope.

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
- Keep the playable v459/v457 rain-cover behavior. Do not revert the `rainCoverOrigin` scratch-vector optimization unless the user explicitly asks.

## v461 cleanup — streetlamp nearest-light allocation removal

Only the streetlamp real-light nearest-selection scratch work changed:

- before: every ~220 ms, `updateStreetLampLighting()` used `.map()` to create one new `{i,d}` object per lamp head, sorted that new array, then used `.slice()` to create another temporary nearest-lights array;
- now: one reusable `streetLampNearestScratch` array holds the same small `{i,d}` entries, rewrites their values, runs the exact same distance sort, and reads the first pool-size entries directly.

Do not reinterpret this as a lighting retune. The following are unchanged:
- lamp model/placement;
- real spotlight count;
- light range/intensity/angle/penumbra/decay;
- glow and rare flicker behavior;
- update interval;
- squared-distance nearest-light math.

Verification completed:
- full `src/game.js` syntax parse passed;
- exact gameplay diff is limited to the scratch declaration and nearest-light selection block;
- v461 loader/deploy Pages run `37520364015` succeeded;
- protected systems were not touched;
- protected v324 recovery is unchanged.

## v461 test focus

Check:
1. game stays smooth/playable;
2. streetlamps look normal while walking around the city;
3. nearby real lights transfer between lamp heads normally with no missing light, wrong lamp, or obvious popping;
4. rare lamp flicker/intensity behavior is unchanged;
5. rain behavior is unchanged from v460/v459.

## Next step after user test

If the user confirms v461 is good, continue cleanup/performance only with one isolated behavior-equivalent optimization at a time. Stay away from rain-cover logic and all protected gameplay systems unless specifically asked.

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

# CURRENT NEXT-CHAT STATE — 2026-10-01 — v392 — READ THIS FIRST

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
