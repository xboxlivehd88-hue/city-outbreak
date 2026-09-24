from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

def replace_once(old,new,label):
    global text
    count=text.count(old)
    if count!=1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text=text.replace(old,new,1)

replace_once(
'''// Shared geometry: only two inexpensive rigid detail meshes per standing rig.
const ZRIG_NECK_DETAIL_GEO=new THREE.CylinderGeometry(.065,.082,.28,10,1,false);
const ZRIG_UPPER_DETAIL_GEO=new THREE.SphereGeometry(.24,10,7);''',
'''// Shared low-cost geometry for the standing rig. Reused by every walker so the
// silhouette gets softer without allocating unique geometry per zombie.
const ZRIG_NECK_DETAIL_GEO=new THREE.CylinderGeometry(.064,.084,.285,12,1,false);
const ZRIG_UPPER_DETAIL_GEO=new THREE.SphereGeometry(.24,12,8);
const ZRIG_HEAD_SHELL_GEO=new THREE.SphereGeometry(.158,14,10);
const ZRIG_JAW_SHELL_GEO=new THREE.SphereGeometry(.118,12,8);''',
"shared rounded walker geometry"
)

replace_once(
'''     n.flatShading=true;
     n.side=THREE.DoubleSide;''',
'''     // v137: use the rig's authored vertex normals instead of forcing every
     // polygon to shade as a separate flat face. This keeps the low-poly style
     // while removing the harsh box/mannequin look.
     n.flatShading=false;
     n.side=THREE.DoubleSide;''',
"smooth rig materials"
)

replace_once(
''' const neckBone=rig.getObjectByName("Neck"),headBone=rig.getObjectByName("Head"),
       chestBone=rig.getObjectByName("Chest"),spineBone=rig.getObjectByName("Spine");
 if(headBone){headBone.position.y-=.015;headBone.scale.set(1.05,1.02,1.05)}
 if(neckBone)neckBone.scale.set(1.04,1,1.04);
 if(chestBone)chestBone.scale.set(1.08,1,1.06);
 if(spineBone)spineBone.scale.set(1.05,1,1.04);
 for(const nm of ["L_UpperArm","R_UpperArm"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(1.06,1,1.06)}
 for(const nm of ["L_UpperLeg","R_UpperLeg"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(1.05,1,1.05)}''',
''' const neckBone=rig.getObjectByName("Neck"),headBone=rig.getObjectByName("Head"),
       chestBone=rig.getObjectByName("Chest"),spineBone=rig.getObjectByName("Spine");
 if(headBone){headBone.position.y-=.010;headBone.scale.set(1.03,1.04,1.01)}
 if(neckBone)neckBone.scale.set(1.06,1,1.06);
 if(chestBone)chestBone.scale.set(1.07,1,1.07);
 if(spineBone)spineBone.scale.set(1.045,1,1.045);
 for(const nm of ["L_UpperArm","R_UpperArm"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(1.065,1,1.065)}
 for(const nm of ["L_LowerArm","R_LowerArm"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(1.045,1,1.045)}
 for(const nm of ["L_UpperLeg","R_UpperLeg"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(1.055,1,1.055)}
 for(const nm of ["L_LowerLeg","R_LowerLeg"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(1.04,1,1.04)}''',
"soften walker proportions"
)

replace_once(
''' if(neckBone&&rigSkinMat){
   const bridge=new THREE.Mesh(ZRIG_NECK_DETAIL_GEO,rigSkinMat);
   bridge.name="WalkerNeckBridge";bridge.position.set(0,.040,-.018);bridge.rotation.x=-.08;
   bridge.castShadow=true;bridge.receiveShadow=true;bridge.userData.visualOnly=true;bridge.raycast=()=>{};neckBone.add(bridge);
 }
 if(chestBone&&rigShirtMat){''',
''' if(neckBone&&rigSkinMat){
   const bridge=new THREE.Mesh(ZRIG_NECK_DETAIL_GEO,rigSkinMat);
   bridge.name="WalkerNeckBridge";bridge.position.set(0,.036,-.018);bridge.rotation.x=-.08;
   bridge.castShadow=true;bridge.receiveShadow=true;bridge.userData.visualOnly=true;bridge.raycast=()=>{};neckBone.add(bridge);
 }
 if(headBone&&rigSkinMat&&kind!=="boss"){
   // The embedded head is intentionally low-poly. A pair of shared rounded shells
   // gives it a human skull/jaw silhouette while the original eyes, hair, wounds,
   // animation and skinning remain visible over/through the same head bone.
   const skull=new THREE.Mesh(ZRIG_HEAD_SHELL_GEO,rigSkinMat);
   skull.name="WalkerRoundedSkull";skull.position.set(0,.008,-.043);skull.scale.set(.99,1.10,.79);
   skull.castShadow=true;skull.receiveShadow=true;skull.userData.visualOnly=true;skull.raycast=()=>{};headBone.add(skull);
   const jawFill=new THREE.Mesh(ZRIG_JAW_SHELL_GEO,rigSkinMat);
   jawFill.name="WalkerRoundedJaw";jawFill.position.set(0,-.105,-.055);jawFill.scale.set(.82,.58,.72);
   jawFill.castShadow=true;jawFill.receiveShadow=true;jawFill.userData.visualOnly=true;jawFill.raycast=()=>{};headBone.add(jawFill);
 }
 if(chestBone&&rigShirtMat){''',
"rounded walker face shell"
)

replace_once(
'''   upper.name="WalkerUpperTorsoDetail";upper.scale.set(1.18,.33,.64);upper.position.set(0,.025,-.018);''',
'''   upper.name="WalkerUpperTorsoDetail";upper.scale.set(1.16,.37,.68);upper.position.set(0,.022,-.018);''',
"round upper torso"
)

path.write_text(text,encoding="utf-8")
print("v137 rounded walker visual pass applied")
