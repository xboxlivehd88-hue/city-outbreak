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
