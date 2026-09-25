# CITY OUTBREAK — CHAT HANDOFF

Last updated: 2026-09-25
Repository: xboxlivehd88-hue/city-outbreak
Branch: main
Live GitHub Pages: https://xboxlivehd88-hue.github.io/city-outbreak/
Main game source: index.html
Latest main commit at this handoff: 9889497c98 (Move MP5 hip view farther back toward player)

## HOW TO WORK WITH THE USER
- Edit GitHub directly. Do not give the user Git instructions unless explicitly requested.
- The user expects you to do the repo work, commit to main, and return a cache-busted GitHub Pages test link.
- Keep replies concise and practical.
- Screenshots from the user are ground truth.
- Do not claim visual/gameplay behavior is fixed until the user tests it or you can actually verify the running browser view.
- Fetch current main/index.html before every edit to avoid stale SHA conflicts.
- Make targeted changes only. Do not refactor unrelated systems during weapon tuning.

## APPROVED / DO NOT REGRESS
- MAX_ACTIVE_ZOMBIES = 20.
- Existing zombie AI/pathfinding, bosses, crawlers, final-wave behavior, explosive reactions.
- Player movement, sprint, pause, drops, map, roads, start screen.
- Vehicle systems / STI parked-car system and current tighter car collision footprints.
- M4 model/behavior/ADS unless specifically requested.
- M17 current model/ADS alignment and current headshot behavior unless specifically requested.
- Current MP5 firing mechanics and recoil behavior are considered good by the user. Do not replace them while fixing placement.

## IMPORTANT ASSETS
- Road: assets/textures/roads/road_albedo.jpg.jpg
- Start art: assets/city-outbreak-start-v153.jpg.jpg
- M4: assets/classic_m4.glb.glb
- M17: assets/low-poly_sig_sauer_m17.glb
- MP5: assets/animated_mp5.glb
- STI: assets/2018_subaru_wrx_sti.glb

## M17 CURRENT STATE — APPROVED / PAUSED
The M17 work is no longer the current priority.
- M17 ADS firing-ray correction is currently:
  const pistolAdsZero=(aiming&&weapon==="pistol")?-.14:0;
- The user tested this and said the M17 ADS/hit alignment was excellent.
- Do not move the approved M17 model/iron-sight view unless the user asks.
- M17 16-round magazine, unlimited reserve behavior, reduced body damage, no SIG ammo drops remain.
- M17 reload hand choreography was considered good, although magazine visibility/insertion was not fully solved. User intentionally moved on from it.
- Left M17 support hand/arm was reduced to .72 scale. Preserve unless returning to that reload task.

## ZOMBIE HEAD HITBOX — FIXED
Earlier headshot debugging found visible child meshes under the zombie head could intercept the ray as body hits.
Current fix:
- head.traverse(...) marks all visible head-attached meshes as part="head" and isHead=true.
- Neck remains a separate sibling and should not count as a headshot.
- Legless crawler keeps its dedicated head hit sphere.
- Boss chest hitbox remains separate torso geometry.
Do not undo this classification during MP5 work.

# CURRENT PRIORITY — MP5 MODEL / FIRST-PERSON PLACEMENT

The user supplied and added:
assets/animated_mp5.glb

The source GLB has unusual FBX/skinning coordinates. After several failed rig attempts, the MP5 is now rebuilt from the actual source mesh geometry with baked corrective transforms. This finally produced the correct visible MP5 shape. DO NOT go back to the original full skinned rig or remove the baked transform solution unless there is a very strong reason.

## MP5 MODEL REBUILD
The visible gun is built from:
- Object_126
- Object_128
- Object_130

with hard-coded corrective matrices in the mp5Bake array.

Current root:
- mp5Root.name = "ExternalAnimatedMP5"
- mp5Root.rotation.y = 0 for hip
- materials are a dark MeshStandardMaterial with DoubleSide while tuning.

## MP5 MAGAZINE
Object_128 is currently treated as the actual MP5 magazine:
- renamed "MP5Magazine"
- mesh.position.y += .055 to seat it higher into the magwell
- reloadHome and reloadHomeQuat are stored
- playerReloadPart = mp5Magazine

The existing detachable-mag reload system was modified so the nested MP5 magazine can:
- clone/drop using its world transform
- create a fresh magazine
- insert back into the MP5 parent space rather than generic gun space

This was wired in around commit d37fa0af1b.
The user wanted the magazine to be in the gun at idle and part of the reload instead of floating below it.
Do NOT revert to a separate floating procedural MP5 magazine.
Visual reload success has not been fully re-approved after later placement changes, so re-check it only after hip placement is settled.

## MP5 STARTING INVENTORY
For faster testing the MP5 is temporarily unlocked at game start:
unlocked={rifle:true,smg:true,...}

This was changed in both initial state and reset() around commit a319f55d94.
Do not remove this until MP5 tuning is finished unless the user asks.

## MP5 RECOIL — USER APPROVED
The user said the mechanics/recoil now work.
Current design:
- generic whole-gun recoil is disabled for SMG:
  const wholeGunRecoil=weapon==="smg"?0:recoil;
- MP5 root gets its own recoil pivot:
  const kick=recoil*1.65;
  recoilPivotY=.08;
  recoilPivotZ=.45;
- This keeps the rear/stock mostly planted while the barrel rises.
Do not return the MP5 to generic whole-gun recoil.

## MP5 ADS — CLOSE / MOSTLY TUNED
Current ADS config:
smg:{x:-.36,y:-.050,z:1.28,fov:55,rx:-.01}

Current MP5 internal ADS yaw:
adsYaw = THREE.MathUtils.degToRad(1.05)

The yaw/pivot math is designed to move the butt while keeping the front/barrel area nearly fixed.

Current MP5-specific ADS firing-ray correction:
- smgAdsZeroX = -.018
- smgAdsZeroY = -.025

Hit marker follows that MP5 ADS ray:
- left ~49.1%
- top ~51.25%

The user previously reported the hit marker was above/right of the iron sight; this correction was added.
Do not change the ADS ray/marker again unless the user reports it is still off after the latest placement tests.

## MP5 HANDS
Current HAND_POSES.smg:
left:  [.22,-.54,-1.72]
right: [.50,-.68,-1.18]
reload:[.10,-.18,.31]

SMG arms fade out in full ADS using smgAdsArmScale to prevent them blocking the sights.

## CURRENT MP5 HIP-FIRE VALUES
As of latest main commit 9889497c98:
- mp5Root.scale.setScalar(2.25)
- mp5Root.position.set(.30,-.70,-1.12)
- mp5Root.rotation.y = 0

Runtime hip-to-ADS blend:
- scale: 2.25 -> 1.55
- x: .30 -> (.36 + adsPivotX)
- y: -.70 -> -.40
- z: -1.12 -> (-1.55 + adsPivotZ)
- hipYaw = 0
- adsYaw = 1.05 degrees

The user had said the facing was fine, the gun needed to be moved back toward the player and possibly made larger.
Sequence:
- v234 / d31f5323 moved hip X to .30 and scale to 2.25.
- a319f55d94 temporarily unlocked MP5 at start.
- latest main 9889497c98 moved hip Z from -1.30 to -1.12 (closer to the camera/player) without changing scale.
IMPORTANT: the user's screenshot immediately before handoff showed v235 / a319f55d94, so they likely have NOT visually tested the latest 9889497c98 hip-Z change yet.

## NEXT CHAT FIRST ACTION
1. Fetch current CITY_OUTBREAK_HANDOFF.md and index.html.
2. Confirm main still contains latest MP5 hip values:
   scale 2.25
   position (.30,-.70,-1.12)
3. Do NOT make another blind placement change first.
4. Give the user a fresh cache-busted GitHub Pages link for current main (use a new version number, e.g. ?v=236-9889497c) and have them test the latest closer hip placement.
5. If the user says it still needs to come back/closer, increase hip Z in small visible steps (for example -1.12 -> -1.00) while keeping x/y/facing unchanged.
6. If the distance looks correct but it still looks too small, increase HIP scale only (for example 2.25 -> 2.40 or 2.50) while preserving ADS target scale 1.55.
7. Do not alter ADS alignment, recoil, magazine logic, M17, M4, zombies, map, vehicles, or performance while doing this.

## SAFE MP5 TUNING RULE
Hip-fire and ADS have been intentionally separated.
When changing hip view:
- change only the HIP side of the lerps
- preserve ADS target values
- preserve adsYaw 1.05 unless specifically fixing butt alignment
- preserve MP5-specific ray zero unless specifically fixing impact alignment
- preserve recoil pivot behavior

## PERFORMANCE
Debug HUD is enabled.
Known city performance is typically mid-30s to low-40s FPS depending on scene load.
Do not touch optimization while finishing MP5 placement.

## SAFE WORKFLOW
1. Fetch current main/index.html before editing.
2. Make the smallest targeted change.
3. Commit directly to main.
4. Re-fetch the changed file and verify the exact values are present.
5. Give a new cache-busted GitHub Pages test URL.
6. Ask the user to test exactly the changed behavior.
7. Treat the user's screenshot as the authoritative visual result.
