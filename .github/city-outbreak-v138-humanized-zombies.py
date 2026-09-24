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
'''// Shared low-cost geometry for the standing rig. Reused by every walker so the
// silhouette gets softer without allocating unique geometry per zombie.
const ZRIG_NECK_DETAIL_GEO=new THREE.CylinderGeometry(.064,.084,.285,12,1,false);
const ZRIG_UPPER_DETAIL_GEO=new THREE.SphereGeometry(.24,12,8);
const ZRIG_HEAD_SHELL_GEO=new THREE.SphereGeometry(.158,14,10);
const ZRIG_JAW_SHELL_GEO=new THREE.SphereGeometry(.118,12,8);''',
'''// Shared low-cost geometry for the standing rig. Facial anatomy is merged into
// two meshes per zombie so human detail does not explode draw-call count.
function zombieEllipsoid(r,sx,sy,sz,x,y,z,segX=10,segY=7){
 const g=new THREE.SphereGeometry(r,segX,segY);g.scale(sx,sy,sz);g.translate(x,y,z);return g
}
function mergeZombieDetail(parts){
 const g=mergeGeometries(parts,false);for(const p of parts)p.dispose();return g
}
const ZRIG_NECK_DETAIL_GEO=new THREE.CylinderGeometry(.064,.084,.285,12,1,false);
const ZRIG_HUMAN_FACE_GEO=mergeZombieDetail([
 zombieEllipsoid(.158,.99,1.10,.79,0,.008,-.043,14,10),       // skull
 zombieEllipsoid(.118,.82,.58,.72,0,-.105,-.055,12,8),       // jaw
 zombieEllipsoid(.050,.52,1.08,.52,0,-.010,-.163,10,7),      // nose bridge
 zombieEllipsoid(.038,.82,.62,.90,0,-.048,-.174,10,7),       // nose tip
 zombieEllipsoid(.050,.90,.72,.43,-.086,-.028,-.146,10,7),   // cheek L
 zombieEllipsoid(.050,.90,.72,.43,.086,-.028,-.146,10,7),    // cheek R
 zombieEllipsoid(.050,.52,1.00,.34,-.158,.004,-.042,10,7),   // ear L
 zombieEllipsoid(.050,.52,1.00,.34,.158,.004,-.042,10,7),    // ear R
 zombieEllipsoid(.042,.88,.58,.68,0,-.145,-.095,10,7)        // chin
]);
const ZRIG_FACE_DARK_GEO=mergeZombieDetail([
 zombieEllipsoid(.040,1.02,.20,.24,-.054,.058,-.166,9,6),    // brow L
 zombieEllipsoid(.040,1.02,.20,.24,.054,.058,-.166,9,6),     // brow R
 zombieEllipsoid(.045,1.08,.17,.20,0,-.095,-.163,10,6),      // mouth
 zombieEllipsoid(.012,.52,.30,.34,-.014,-.051,-.181,8,5),    // nostril L
 zombieEllipsoid(.012,.52,.30,.34,.014,-.051,-.181,8,5)      // nostril R
]);
const ZRIG_UPPER_DETAIL_GEO=mergeZombieDetail([
 zombieEllipsoid(.24,1.16,.37,.68,0,.022,-.018,12,8),
 zombieEllipsoid(.105,1.05,.82,.92,-.225,.035,-.026,10,7),
 zombieEllipsoid(.105,1.05,.82,.92,.225,.035,-.026,10,7)
]);''',
"human walker shared geometry"
)

replace_once(
''' const eye=rigEyeColor(kind), outfit=rigOutfitColor(kind,variant),ownedRigMaterials=[];
 let rigSkinMat=null,rigShirtMat=null;''',
''' const eye=rigEyeColor(kind), outfit=rigOutfitColor(kind,variant),ownedRigMaterials=[];
 let rigSkinMat=null,rigShirtMat=null,rigHairMat=null;''',
"walker material refs"
)

replace_once(
'''     if(nm.includes("shirt")){n.color.setHex(outfit);if(!rigShirtMat)rigShirtMat=n}
     if(nm.includes("skin")){
       const skin=[0x858474,0x78766b,0x91866e,0x727a70][variant%4];n.color.setHex(skin);if(!rigSkinMat)rigSkinMat=n;
     }
     if(nm.includes("pants")){n.color.setHex([0x292c30,0x38332f,0x2d363a][variant%3])}''',
'''     if(nm.includes("shirt")){n.color.setHex(outfit);if(!rigShirtMat)rigShirtMat=n}
     if(nm.includes("skin")){
       const skin=[0x858474,0x78766b,0x91866e,0x727a70][variant%4];n.color.setHex(skin);if(!rigSkinMat)rigSkinMat=n;
     }
     if(nm.includes("hair")){if(!rigHairMat)rigHairMat=n}
     if(nm.includes("pants")){n.color.setHex([0x292c30,0x38332f,0x2d363a][variant%3])}''',
"walker hair material capture"
)

replace_once(
''' if(headBone&&rigSkinMat&&kind!=="boss"){
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
 if(chestBone&&rigShirtMat){
   const upper=new THREE.Mesh(ZRIG_UPPER_DETAIL_GEO,rigShirtMat);
   upper.name="WalkerUpperTorsoDetail";upper.scale.set(1.16,.37,.68);upper.position.set(0,.022,-.018);
   upper.userData.visualOnly=true;upper.raycast=()=>{};chestBone.add(upper);
 }''',
''' if(headBone&&rigSkinMat&&kind!=="boss"){
   // Human-readable skull, jaw, nose, cheeks, ears and chin in one shared mesh.
   const face=new THREE.Mesh(ZRIG_HUMAN_FACE_GEO,rigSkinMat);
   face.name="WalkerHumanFace";face.castShadow=true;face.receiveShadow=true;
   face.userData.visualOnly=true;face.raycast=()=>{};headBone.add(face);
   // Brows, mouth and nostrils use the existing hair/dark material as one second mesh.
   if(rigHairMat){
     const features=new THREE.Mesh(ZRIG_FACE_DARK_GEO,rigHairMat);
     features.name="WalkerHumanFaceDark";features.castShadow=false;features.receiveShadow=false;
     features.userData.visualOnly=true;features.raycast=()=>{};headBone.add(features);
   }
 }
 if(chestBone&&rigShirtMat){
   const upper=new THREE.Mesh(ZRIG_UPPER_DETAIL_GEO,rigShirtMat);
   upper.name="WalkerUpperTorsoDetail";upper.userData.visualOnly=true;upper.raycast=()=>{};chestBone.add(upper);
 }''',
"human walker face and shoulders"
)

# Round the procedural eye sockets used by native crawlers. Standing rig zombies hide
# this old procedural layer, so this change is crawler-focused.
replace_once(
''' for(const ex of [-.055,.055]){
   let socket=box(.040,.026,.010,dark,ex,.018,-.122,head);
   let eye=new THREE.Mesh(new THREE.SphereGeometry(.022,6,4),eyeMat);
   eye.position.set(ex,.018,-.137);head.add(eye);
 }''',
''' for(const ex of [-.055,.055]){
   let socket=new THREE.Mesh(new THREE.SphereGeometry(.034,9,6),dark);
   socket.scale.set(1.08,.68,.42);socket.position.set(ex,.018,-.126);head.add(socket);
   let eye=new THREE.Mesh(new THREE.SphereGeometry(.023,8,6),eyeMat);
   eye.position.set(ex,.018,-.145);head.add(eye);
 }''',
"round crawler eye sockets"
)

# Replace the native crawler's barrel torso and mannequin face with softer human anatomy.
replace_once(
'''   // Rounded torso / pelvis. More segments only on crawlers, so the global zombie
   // performance budget stays essentially unchanged.
   try{torso.geometry.dispose()}catch(_){}
   torso.geometry=new THREE.CylinderGeometry(.205,.160,.49,12,2,false);
   torso.scale.set(1.08,1.0,.78);
   torso.position.set(0,.80,-.10);
   torso.rotation.x=-.24;

   try{pelvis.geometry.dispose()}catch(_){}
   pelvis.geometry=new THREE.CylinderGeometry(.165,.145,.23,10,2,false);
   pelvis.scale.set(1.0,1.0,.82);
   pelvis.position.set(0,.48,.03);
   pelvis.rotation.x=-.18;''',
'''   // Human torso / pelvis instead of the old barrel-like crawler body.
   try{torso.geometry.dispose()}catch(_){}
   torso.geometry=new THREE.SphereGeometry(.225,13,9);
   torso.scale.set(1.02,1.28,.74);
   torso.position.set(0,.79,-.10);
   torso.rotation.x=-.24;

   try{pelvis.geometry.dispose()}catch(_){}
   pelvis.geometry=new THREE.SphereGeometry(.165,11,8);
   pelvis.scale.set(1.02,.72,.84);
   pelvis.position.set(0,.49,.03);
   pelvis.rotation.x=-.18;''',
"human crawler torso"
)

replace_once(
'''   // Cleaner crawler skull. Remove the old block-face planes that were producing
   // the crown/helmet-looking silhouette and keep only small facial details.
   try{head.geometry.dispose()}catch(_){}
   head.geometry=new THREE.SphereGeometry(.150,12,8);
   head.position.set(0,1.23,-.215);
   head.scale.set(.96,1.03,.86);
   head.rotation.set(-.14,0,0);
   forehead.visible=false;cheekL.visible=false;cheekR.visible=false;
   browL.visible=false;browR.visible=false;
   jaw.scale.set(.72,.50,.60);jaw.position.y=-.126;jaw.position.z=-.010;
   nose.scale.set(.72,.72,.52);nose.position.z=-.118;
   if(hair)hair.visible=false;
   if(hood)hood.visible=false;
   if(vestPanel)vestPanel.visible=false;
   if(gash)gash.visible=false;
   if(chestPatch)chestPatch.visible=false;
   if(faceWound)faceWound.scale.z=.35;
   if(skullPatch)skullPatch.scale.z=.35;''',
'''   // Humanized crawler skull and face: eyes sit in rounded sockets, with visible
   // cheekbones, nose, brows, jaw, chin and ears rather than mannequin blocks.
   try{head.geometry.dispose()}catch(_){}
   head.geometry=new THREE.SphereGeometry(.154,14,10);
   head.position.set(0,1.23,-.215);
   head.scale.set(.98,1.06,.88);
   head.rotation.set(-.14,0,0);
   forehead.visible=false;

   for(const c of [cheekL,cheekR]){try{c.geometry.dispose()}catch(_){ }c.geometry=new THREE.SphereGeometry(.050,10,7);c.visible=true}
   cheekL.scale.set(.92,.72,.46);cheekR.scale.set(.92,.72,.46);
   cheekL.position.set(-.086,-.030,-.108);cheekR.position.set(.086,-.030,-.108);

   for(const b of [browL,browR]){try{b.geometry.dispose()}catch(_){ }b.geometry=new THREE.SphereGeometry(.040,9,6);b.visible=true}
   browL.scale.set(1.02,.20,.28);browR.scale.set(1.02,.20,.28);
   browL.position.set(-.052,.054,-.132);browR.position.set(.052,.054,-.132);

   try{jaw.geometry.dispose()}catch(_){}
   jaw.geometry=new THREE.SphereGeometry(.112,12,8);jaw.scale.set(.88,.58,.76);jaw.position.set(0,-.116,-.020);

   try{nose.geometry.dispose()}catch(_){}
   nose.geometry=new THREE.SphereGeometry(.040,10,7);nose.scale.set(.56,1.05,.68);nose.position.set(0,-.008,-.142);nose.rotation.set(0,0,0);

   try{mouth.geometry.dispose()}catch(_){}
   mouth.geometry=new THREE.SphereGeometry(.041,10,6);mouth.scale.set(1.10,.18,.28);mouth.position.set(0,-.096,-.139);mouth.rotation.set(0,0,0);

   const earGeoL=new THREE.SphereGeometry(.045,9,6),earGeoR=new THREE.SphereGeometry(.045,9,6);
   const earL=new THREE.Mesh(earGeoL,skin),earR=new THREE.Mesh(earGeoR,skin);
   earL.scale.set(.55,1,.38);earR.scale.copy(earL.scale);
   earL.position.set(-.151,.002,-.020);earR.position.set(.151,.002,-.020);head.add(earL);head.add(earR);

   const chin=new THREE.Mesh(new THREE.SphereGeometry(.040,9,6),skin);
   chin.scale.set(.90,.60,.72);chin.position.set(0,-.148,-.060);head.add(chin);

   if(hair)hair.visible=false;
   if(hood)hood.visible=false;
   if(vestPanel)vestPanel.visible=false;
   if(gash)gash.visible=false;
   if(chestPatch)chestPatch.visible=false;
   if(faceWound)faceWound.scale.z=.28;
   if(skullPatch)skullPatch.scale.z=.28;''',
"human crawler face"
)

# Slightly broader clavicle/shoulder relationship for the native crawler.
replace_once(
'''   shoulderL.position.set(-shoulderOffset,.99,-.12);
   shoulderR.position.set( shoulderOffset,.99,-.12);''',
'''   shoulderL.position.set(-shoulderOffset,.99,-.12);
   shoulderR.position.set( shoulderOffset,.99,-.12);
   const crawlerClavicle=new THREE.Mesh(new THREE.SphereGeometry(.205,11,7),outfit===0?shirt:outerCloth);
   crawlerClavicle.scale.set(1.25,.30,.60);crawlerClavicle.position.set(0,.985,-.105);crawlerClavicle.rotation.x=-.18;g.add(crawlerClavicle);''',
"crawler clavicle"
)

path.write_text(text,encoding="utf-8")
print("v138 humanized walker and crawler pass applied")
