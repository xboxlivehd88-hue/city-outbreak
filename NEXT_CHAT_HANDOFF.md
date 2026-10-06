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
