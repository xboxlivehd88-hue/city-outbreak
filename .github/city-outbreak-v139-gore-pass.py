from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

def replace_once(old,new,label):
    global text
    count=text.count(old)
    if count!=1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text=text.replace(old,new,1)

# Add sunken eye sockets plus shared face/chest gore geometry for rigged walkers.
replace_once(
'''const ZRIG_FACE_DARK_GEO=mergeZombieDetail([
 zombieEllipsoid(.040,1.02,.20,.24,-.054,.058,-.166,9,6),    // brow L
 zombieEllipsoid(.040,1.02,.20,.24,.054,.058,-.166,9,6),     // brow R
 zombieEllipsoid(.045,1.08,.17,.20,0,-.095,-.163,10,6),      // mouth
 zombieEllipsoid(.012,.52,.30,.34,-.014,-.051,-.181,8,5),    // nostril L
 zombieEllipsoid(.012,.52,.30,.34,.014,-.051,-.181,8,5)      // nostril R
]);''',
'''const ZRIG_FACE_DARK_GEO=mergeZombieDetail([
 zombieEllipsoid(.050,1.06,.52,.28,-.055,.018,-.158,10,7),   // sunken socket L
 zombieEllipsoid(.050,1.06,.52,.28,.055,.018,-.158,10,7),    // sunken socket R
 zombieEllipsoid(.040,1.02,.20,.24,-.054,.058,-.169,9,6),    // brow L
 zombieEllipsoid(.040,1.02,.20,.24,.054,.058,-.169,9,6),     // brow R
 zombieEllipsoid(.045,1.08,.17,.20,0,-.095,-.168,10,6),      // mouth
 zombieEllipsoid(.012,.52,.30,.34,-.014,-.051,-.184,8,5),    // nostril L
 zombieEllipsoid(.012,.52,.30,.34,.014,-.051,-.184,8,5)      // nostril R
]);
const ZRIG_FACE_GORE_GEO=mergeZombieDetail([
 zombieEllipsoid(.057,1.18,.22,.20,0,-.100,-.187,10,6),      // bloody mouth smear
 zombieEllipsoid(.050,.78,1.02,.18,-.091,-.040,-.169,10,7),  // torn cheek
 zombieEllipsoid(.034,.52,1.22,.16,-.070,-.105,-.180,9,6),   // jaw drip
 zombieEllipsoid(.030,.62,.82,.16,-.125,.055,-.135,9,6)      // temple cut
]);
const ZRIG_CHEST_GORE_GEO=mergeZombieDetail([
 zombieEllipsoid(.090,1.22,.48,.18,-.060,.020,-.167,10,7),   // collar soak
 zombieEllipsoid(.066,.72,1.15,.16,.095,-.060,-.170,10,7),   // chest streak
 zombieEllipsoid(.045,.62,.84,.14,-.155,.005,-.150,9,6)      // shoulder wound
]);''',
"walker gore geometry"
)

# Capture the existing cloned wound material and make it wet/dark enough to read.
replace_once(
''' const eye=rigEyeColor(kind), outfit=rigOutfitColor(kind,variant),ownedRigMaterials=[];
 let rigSkinMat=null,rigShirtMat=null,rigHairMat=null;''',
''' const eye=rigEyeColor(kind), outfit=rigOutfitColor(kind,variant),ownedRigMaterials=[];
 let rigSkinMat=null,rigShirtMat=null,rigHairMat=null,rigWoundMat=null;''',
"wound material ref"
)

replace_once(
'''     if(nm.includes("skin")){
       const skin=[0x858474,0x78766b,0x91866e,0x727a70][variant%4];n.color.setHex(skin);if(!rigSkinMat)rigSkinMat=n;
     }
     if(nm.includes("hair")){if(!rigHairMat)rigHairMat=n}
     if(nm.includes("pants")){n.color.setHex([0x292c30,0x38332f,0x2d363a][variant%3])}
     if(nm.includes("wound")){n.color.setHex(kind==="radiated"?0x398a45:kind==="acidic"?0x9f1717:0x841c1a)}
     if(nm.includes("eyes")){''',
'''     if(nm.includes("skin")){
       // Cooler, bruised corpse tones so the new human face reads undead rather than friendly.
       const skin=[0x73796e,0x696d64,0x817665,0x657168][variant%4];n.color.setHex(skin);if(!rigSkinMat)rigSkinMat=n;
     }
     if(nm.includes("hair")){if(!rigHairMat)rigHairMat=n}
     if(nm.includes("pants")){n.color.setHex([0x292c30,0x38332f,0x2d363a][variant%3])}
     if(nm.includes("wound")){
       n.color.setHex(kind==="radiated"?0x2d8a3d:kind==="acidic"?0x981010:0x77100f);
       n.roughness=.58;n.metalness=.04;if(!rigWoundMat)rigWoundMat=n;
     }
     if(nm.includes("eyes")){''',
"corpse skin and wound material"
)

# Attach gore to the same head/chest bones as the human anatomy. Mirror by variant
# so the whole crowd does not have the exact same injury pattern.
replace_once(
'''   if(rigHairMat){
     const features=new THREE.Mesh(ZRIG_FACE_DARK_GEO,rigHairMat);
     features.name="WalkerHumanFaceDark";features.castShadow=false;features.receiveShadow=false;
     features.userData.visualOnly=true;features.raycast=()=>{};headBone.add(features);
   }
 }
 if(chestBone&&rigShirtMat){
   const upper=new THREE.Mesh(ZRIG_UPPER_DETAIL_GEO,rigShirtMat);
   upper.name="WalkerUpperTorsoDetail";upper.userData.visualOnly=true;upper.raycast=()=>{};chestBone.add(upper);
 }''',
'''   if(rigHairMat){
     const features=new THREE.Mesh(ZRIG_FACE_DARK_GEO,rigHairMat);
     features.name="WalkerHumanFaceDark";features.castShadow=false;features.receiveShadow=false;
     features.userData.visualOnly=true;features.raycast=()=>{};headBone.add(features);
   }
   if(rigWoundMat){
     const faceGore=new THREE.Mesh(ZRIG_FACE_GORE_GEO,rigWoundMat);
     faceGore.name="WalkerFaceGore";faceGore.scale.x=variant%2?-1:1;faceGore.rotation.z=((variant%3)-1)*.045;
     faceGore.castShadow=false;faceGore.receiveShadow=false;faceGore.userData.visualOnly=true;faceGore.raycast=()=>{};headBone.add(faceGore);
   }
 }
 if(chestBone&&rigShirtMat){
   const upper=new THREE.Mesh(ZRIG_UPPER_DETAIL_GEO,rigShirtMat);
   upper.name="WalkerUpperTorsoDetail";upper.userData.visualOnly=true;upper.raycast=()=>{};chestBone.add(upper);
   if(rigWoundMat&&kind!=="boss"){
     const chestGore=new THREE.Mesh(ZRIG_CHEST_GORE_GEO,rigWoundMat);
     chestGore.name="WalkerChestGore";chestGore.scale.x=variant%2?-1:1;chestGore.rotation.z=((variant%4)-1.5)*.025;
     chestGore.castShadow=false;chestGore.receiveShadow=false;chestGore.userData.visualOnly=true;chestGore.raycast=()=>{};chestBone.add(chestGore);
   }
 }''',
"attach walker gore"
)

# Make the existing native crawler wounds fit the new rounded human anatomy instead
# of hiding them. This avoids extra crawler draw calls and keeps disposal correct.
replace_once(
'''   if(hair)hair.visible=false;
   if(hood)hood.visible=false;
   if(vestPanel)vestPanel.visible=false;
   if(gash)gash.visible=false;
   if(chestPatch)chestPatch.visible=false;
   if(faceWound)faceWound.scale.z=.28;
   if(skullPatch)skullPatch.scale.z=.28;''',
'''   if(hair)hair.visible=false;
   if(hood)hood.visible=false;
   if(vestPanel)vestPanel.visible=false;

   // Re-shape the old wound meshes to the crawler's actual rounded body.
   if(faceWound){
     try{faceWound.geometry.dispose()}catch(_){}
     faceWound.geometry=new THREE.SphereGeometry(.052,10,7);
     faceWound.material=wound;faceWound.visible=true;
     faceWound.scale.set(.82,1.05,.20);faceWound.position.set(i%2?-.088:.088,-.040,-.139);faceWound.rotation.z=i%2?.22:-.22;
   }
   if(skullPatch){
     try{skullPatch.geometry.dispose()}catch(_){}
     skullPatch.geometry=new THREE.SphereGeometry(.042,9,6);
     skullPatch.visible=true;skullPatch.scale.set(.90,.64,.18);skullPatch.position.set(i%2?.075:-.075,.084,-.126);
   }
   if(gash){
     try{gash.geometry.dispose()}catch(_){}
     gash.geometry=new THREE.SphereGeometry(.076,10,7);
     gash.material=wound;gash.visible=true;gash.scale.set(.92,1.35,.22);
     gash.position.set(i%2?-.085:.085,.82,-.260);gash.rotation.set(-.20,0,i%2?.18:-.18);
   }
   if(chestPatch){
     try{chestPatch.geometry.dispose()}catch(_){}
     chestPatch.geometry=new THREE.SphereGeometry(.067,10,7);
     chestPatch.material=wound;chestPatch.visible=true;chestPatch.scale.set(1.18,.70,.22);
     chestPatch.position.set(i%2?.090:-.090,.94,-.245);chestPatch.rotation.set(-.18,0,i%2?-.14:.14);
   }

   // Turn the mouth itself into a bloody bite zone and add a downward smear using
   // the existing geometry/material budget.
   mouth.material=wound;mouth.scale.set(1.22,1.35,1.25);mouth.position.z=-.145;''',
"crawler gore reposition"
)

# Crawler forearm injury is already present as patchMat; make it read as bloodier.
replace_once(
''' if(i%2===0){let p=box(.052,.13,.012,patchMat,0,-.16,-.055,foreArmL);p.rotation.x=.1}
 else{let p=box(.052,.13,.012,patchMat,0,-.16,-.055,foreArmR);p.rotation.x=.1}''',
''' if(i%2===0){let p=box(.065,.17,.014,patchMat,0,-.16,-.058,foreArmL);p.rotation.x=.1;p.rotation.z=.12}
 else{let p=box(.065,.17,.014,patchMat,0,-.16,-.058,foreArmR);p.rotation.x=.1;p.rotation.z=-.12}''',
"larger limb gore"
)

path.write_text(text,encoding="utf-8")
print("v139 gore infected visual pass applied")
