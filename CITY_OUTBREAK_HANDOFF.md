# CITY OUTBREAK — CHAT HANDOFF

Last updated: 2026-09-25
Repository: xboxlivehd88-hue/city-outbreak
Branch: main
Live GitHub Pages: https://xboxlivehd88-hue.github.io/city-outbreak/
Main game source: index.html

## HOW TO WORK WITH THE USER
- Edit GitHub directly. Do not give the user Git instructions unless explicitly requested.
- Keep responses concise and practical.
- Do not say a visual/gameplay fix is confirmed until the user tests it or you have actual browser visual verification.
- Preserve approved systems and avoid unrelated edits/regressions.
- Use a new ?v=### cache-busting link after each game update.

## APPROVED / DO NOT REGRESS
- MAX_ACTIVE_ZOMBIES = 20.
- Existing zombie AI/pathfinding, bosses, crawlers, explosive reactions.
- Player movement, sprint, pause, drops, map, roads, start screen.
- Existing weapon models and ADS except targeted fixes requested by user.
- Car collision footprints remain smaller than visual cars.
- M17 v175 orientation/overall first-person placement was approved.
- M4 behavior: rifle {name:"M4 CARBINE",rate:105,hold:190,spread:.004,pellets:1,body:1,recoil:.105,baseMag:12}; 12-round mag, 72 reserve.
- STI parked-car system currently uses 3 cars and real GLB asset.

## IMPORTANT ASSETS
- Road: assets/textures/roads/road_albedo.jpg.jpg
- Start art: assets/city-outbreak-start-v153.jpg.jpg
- M4: assets/classic_m4.glb.glb
- M17: assets/low-poly_sig_sauer_m17.glb
- STI: assets/2018_subaru_wrx_sti.glb

## M17 CURRENT STATE
User wanted 16-round M17, unlimited reserve ammo, lower base damage, no SIG ammo drops, and visible reload.
- M17 ammo: 16-round magazine, reserve displayed as infinity.
- M17 base body damage .82 and still scales with store damageLevel.
- M17 removed from zombie/boss ammo drops.
- GLB contains magazine nodes but no animation clips.
- The original GLB magazine caused repeated transform/visibility problems.
- v195 successfully removed the ugly hanging source magazine from the idle pistol. PRESERVE THAT.
- Reload hand choreography from v201 onward is considered good by user. PRESERVE THE MOVEMENT unless asked.
- Later versions use a dedicated procedural reload magazine actor rather than relying on the troublesome GLB magazine.
- User still could not visually see magazine drop/insertion. Left M17 support hand/arm was reduced to .72 scale around v205 because it appeared to hide the magazine. User says smaller hands are okay but left hand needs some repositioning.
- Do not spend more time on reload right now unless user returns to it.

## CURRENT PRIORITY — M17 ADS / ZOMBIE HEAD HITBOX
Latest user request before handoff:
"When ADS on the M17 the hit seems to be a bit higher when fired; I have to lower the gun to get a head shot. Also I think the hit box on the zombie may not reflect the whole head."

This has NOT been fixed yet. Start here in the next chat.

Relevant firing code in index.html:
- rayAim / ray / rayTargets are near function fire().
- Current shot ray:
  const adsSpread=aiming?(weapon==="awm"?.08:.38):1,
        sx=aimX+(Math.random()-.5)*wd().spread*adsSpread,
        sy=aimY+(Math.random()-.5)*wd().spread*adsSpread;
  rayAim.set(sx,sy);
  ray.setFromCamera(rayAim,cam);
- Hits use z.hitMeshes and userData.isHead / userData.part.
- User specifically reports M17 ADS impact appears ABOVE the intended point. Diagnose crosshair/ADS ray alignment before changing visual pistol orientation.
- Do NOT move the approved M17 model/ADS position just to compensate if the actual issue is aimX/aimY/ray origin.
- Inspect how aimX/aimY are set/updated and whether M17 ADS uses a visual sight alignment that differs from ray center.
- Also inspect zombie head hit meshes. User suspects the hitbox does not cover the whole visible head. Expand/align the head hitbox to visible skull/head geometry without making upper torso count as headshots.
- Check normal zombies, crawlers, and bosses separately if they use different hit meshes/scales.
- Make targeted changes only, then give a cache-busted GitHub Pages test link.

## RELOAD DETAILS TO PRESERVE FOR LATER
Current addPlayerHands contains:
  if(weapon==='pistol') left.scale.setScalar(.72);
This was added because the support hand appeared to swallow the magazine.
User says hand movement is great. If returning to reload, first reposition the smaller left hand and debug the reload magazine actor visibility; do not rebuild the choreography.

## PERFORMANCE
Debug HUD is enabled.
Known busy-city performance historically ~37-40 FPS with high triangle count; empty areas can reach 75 FPS.
v192 reduced shadows, pixel ratio, pathfinding cadence, and FX load.
Global static-city batching may still hurt frustum culling. Spatial/chunked batching is a future optimization candidate.
Do not alter performance systems while fixing M17 ADS/head hitboxes.

## VEHICLES
STI is loaded from assets/2018_subaru_wrx_sti.glb and used for parked cars.
Only 3 parked STIs currently.
Car collision is intentionally tighter than visual geometry.

## CLEANUP FOR LATER
Shop may still contain obsolete M17 ammo purchase (pistolAmmo) even though M17 reserve is unlimited. Remove/hide during a later store cleanup, not during unrelated fixes.

## SAFE WORKFLOW
1. Fetch current main/index.html before editing.
2. Make the smallest targeted change.
3. Update main directly.
4. Report commit/change accurately.
5. Give live URL with a NEW ?v= number.
6. Ask user to test the exact behavior changed.
7. Treat screenshots/video as ground truth.
8. Never claim visual confirmation you do not have.

## LAST KNOWN LIVE TEST
User's screenshot showed ?v=205. Fetch current main before assuming exact latest commit/version.

## NEXT CHAT FIRST ACTION
Fetch current index.html and investigate:
1. M17 ADS ray/crosshair alignment (shots appear high).
2. Zombie head hitbox coverage vs visible head.
Preserve all approved M17 visual orientation and the good reload hand animation.
