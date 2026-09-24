from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

def replace_once(old,new,label):
    global text
    count=text.count(old)
    if count!=1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text=text.replace(old,new,1)

# Walker visual geometry: keep the performant rig, but give it a connected neck/upper torso
# and fuller proportions without multiplying the expensive skinned rig itself.
replace_once(
'''function rigOutfitColor(kind,seedish=0){
 const colors=[0x4a5549,0x5a5145,0x33495a,0x665e54,0x4b403f,0x3d474c];
 return colors[Math.abs(seedish)%colors.length];
}
function rigTransient(z,name,hold=.34){''',
'''function rigOutfitColor(kind,seedish=0){
 const colors=[0x4a5549,0x5a5145,0x33495a,0x665e54,0x4b403f,0x3d474c];
 return colors[Math.abs(seedish)%colors.length];
}
// Shared geometry: only two inexpensive rigid detail meshes per standing rig.
const ZRIG_NECK_DETAIL_GEO=new THREE.CylinderGeometry(.070,.086,.22,10,1,false);
const ZRIG_UPPER_DETAIL_GEO=new THREE.SphereGeometry(.24,10,7);
function rigTransient(z,name,hold=.34){''',
"rig detail geometry"
)

replace_once(
''' const eye=rigEyeColor(kind), outfit=rigOutfitColor(kind,variant),ownedRigMaterials=[];
 rig.traverse(o=>{''',
''' const eye=rigEyeColor(kind), outfit=rigOutfitColor(kind,variant),ownedRigMaterials=[];
 let rigSkinMat=null,rigShirtMat=null;
 rig.traverse(o=>{''',
"rig material refs"
)

replace_once(
'''     if(nm.includes("shirt")){n.color.setHex(outfit)}
     if(nm.includes("skin")){
       const skin=[0x858474,0x78766b,0x91866e,0x727a70][variant%4];n.color.setHex(skin);
     }''',
'''     if(nm.includes("shirt")){n.color.setHex(outfit);if(!rigShirtMat)rigShirtMat=n}
     if(nm.includes("skin")){
       const skin=[0x858474,0x78766b,0x91866e,0x727a70][variant%4];n.color.setHex(skin);if(!rigSkinMat)rigSkinMat=n;
     }''',
"rig material capture"
)

replace_once(
''' });
 g.add(rig);
 const mixer=new THREE.AnimationMixer(rig), actions={};''',
''' });
 // v132 walker geometry/readability pass. The original rig left too much daylight
 // between the skull and torso. Pull the head down, bulk the major joints slightly,
 // then add a real neck bridge and a rounded clavicle/chest mass.
 const neckBone=rig.getObjectByName("Neck"),headBone=rig.getObjectByName("Head"),
       chestBone=rig.getObjectByName("Chest"),spineBone=rig.getObjectByName("Spine");
 if(headBone){headBone.position.y-=.055;headBone.scale.set(1.05,1.02,1.05)}
 if(neckBone)neckBone.scale.set(1.07,1,1.07);
 if(chestBone)chestBone.scale.set(1.08,1,1.06);
 if(spineBone)spineBone.scale.set(1.05,1,1.04);
 for(const nm of ["L_UpperArm","R_UpperArm"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(1.06,1,1.06)}
 for(const nm of ["L_UpperLeg","R_UpperLeg"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(1.05,1,1.05)}
 if(neckBone&&rigSkinMat){
   const bridge=new THREE.Mesh(ZRIG_NECK_DETAIL_GEO,rigSkinMat);
   bridge.name="WalkerNeckBridge";bridge.position.set(0,.085,-.018);bridge.rotation.x=-.08;
   bridge.userData.visualOnly=true;bridge.raycast=()=>{};neckBone.add(bridge);
 }
 if(chestBone&&rigShirtMat){
   const upper=new THREE.Mesh(ZRIG_UPPER_DETAIL_GEO,rigShirtMat);
   upper.name="WalkerUpperTorsoDetail";upper.scale.set(1.22,.40,.66);upper.position.set(0,.075,-.018);
   upper.userData.visualOnly=true;upper.raycast=()=>{};chestBone.add(upper);
 }
 g.add(rig);
 const mixer=new THREE.AnimationMixer(rig), actions={};''',
"walker rig detail pass"
)

# Align the invisible procedural head hitbox with the lower visible head and add a little
# more roundness for fallback/procedural use.
replace_once(
''' let neck=new THREE.Mesh(new THREE.CylinderGeometry(.056,.066,.125,6),skin);neck.position.set(0,1.68,-.035);neck.rotation.x=-.08;g.add(neck);
 let head=new THREE.Mesh(new THREE.CylinderGeometry(.142,.122,.29,6,1,false),skin);
 head.position.set(0,1.88,-.070);''',
''' let neck=new THREE.Mesh(new THREE.CylinderGeometry(.060,.072,.16,8),skin);neck.position.set(0,1.70,-.035);neck.rotation.x=-.08;g.add(neck);
 let head=new THREE.Mesh(new THREE.CylinderGeometry(.142,.122,.29,8,1,false),skin);
 head.position.set(0,1.83,-.070);''',
"head neck connection"
)

# Leg loss -> crawler conversion, in place. This preserves the zombie and wave count,
# swaps from the skinned standing rig to the already-existing procedural crawler style,
# and keeps the detached legs as physical gore pieces.
replace_once(
'''function detachArm(z,side){
 const key=side==="left"?"leftArmDetached":"rightArmDetached";
 if(z[key])return;
 const arm=side==="left"?z.armL:z.armR;
 if(!launchDetachedLimb(z,arm,side,false))return;
 z[key]=true;
 hideRigLimb(z,side==="left"?"L_UpperArm":"R_UpperArm");
 if(side==="left")z.armL=new THREE.Group();else z.armR=new THREE.Group();
 noise(.12,.22,350);show(side==="left"?"LEFT ARM OFF":"RIGHT ARM OFF");
}
function detachLeg(z,side){''',
'''function detachArm(z,side){
 const key=side==="left"?"leftArmDetached":"rightArmDetached";
 if(z[key])return;
 const arm=side==="left"?z.armL:z.armR;
 if(!launchDetachedLimb(z,arm,side,false))return;
 z[key]=true;
 hideRigLimb(z,side==="left"?"L_UpperArm":"R_UpperArm");
 if(z.hitMeshes)z.hitMeshes=z.hitMeshes.filter(o=>o.userData.part!==(side==="left"?"leftArm":"rightArm"));
 if(side==="left")z.armL=new THREE.Group();else z.armR=new THREE.Group();
 noise(.12,.22,350);show(side==="left"?"LEFT ARM OFF":"RIGHT ARM OFF");
}
function replaceZombieGeo(z,mesh,geo){
 if(!mesh)return;
 const old=mesh.geometry;
 if(z.ownedGeometries&&old){const i=z.ownedGeometries.indexOf(old);if(i>=0)z.ownedGeometries.splice(i,1)}
 try{old?.dispose()}catch(_){}
 mesh.geometry=geo;
 if(z.ownedGeometries)z.ownedGeometries.push(geo);
}
function convertLeglessToCrawler(z){
 if(!z||z.dead||z.kind==="boss"||z.kind==="crawler"||z.hp<=0||!z.leftLegDetached||!z.rightLegDetached)return;
 // Drop the standing skinned visual and reveal the procedural body that was already
 // kept underneath as the accurate hitbox. This avoids spawning a second zombie.
 if(z.rigVisual){
   const rig=z.rigVisual;
   if(z.mixer){z.mixer.stopAllAction();try{z.mixer.uncacheRoot(rig)}catch(_){}}
   if(rig.parent)rig.parent.remove(rig);
   if(z.rigMaterials){for(const m of z.rigMaterials){try{m.dispose()}catch(_){}}z.rigMaterials.length=0}
   z.rigVisual=null;z.mixer=null;z.rigActions=null;z.rigBase=null;z.rigTransient=null;z.rigTransientT=0;
 }
 z.g.traverse(o=>{if(o.isMesh&&!o.userData.detached)o.visible=true});
 z.kind="crawler";z.nightmareType="crawler";z.role="charger";z.lurch=.90;z.strideScale=1;
 const d=diff(wave);z.speed=d.speed*.82;z.damage=Math.round(d.damage*.95);z.attack=d.attack;
 z.legDamage=0;z.limp=0;z.knockdown=null;z.ragdoll=null;z.falling=false;z.stagger=Math.max(z.stagger,.18);
 z.g.rotation.x=-.10;z.g.rotation.z=0;z.g.position.y=z.groundY||0;

 replaceZombieGeo(z,z.torso,new THREE.CylinderGeometry(.205,.160,.49,12,2,false));
 z.torso.scale.set(1.08,1,.78);z.torso.position.set(0,.80,-.10);z.torso.rotation.x=-.24;
 replaceZombieGeo(z,z.pelvis,new THREE.CylinderGeometry(.165,.145,.23,10,2,false));
 z.pelvis.scale.set(1,1,.82);z.pelvis.position.set(0,.48,.03);z.pelvis.rotation.x=-.18;
 replaceZombieGeo(z,z.head,new THREE.SphereGeometry(.155,12,9));
 z.head.position.set(0,1.25,-.24);z.head.scale.set(.94,1.08,.84);z.head.rotation.set(-.18,0,0);
 replaceZombieGeo(z,z.neck,new THREE.CylinderGeometry(.060,.072,.13,10));
 z.neck.position.set(0,1.07,-.18);z.neck.rotation.x=-.42;

 if(z.jacket)z.jacket.visible=false;
 if(z.shoulderL){z.shoulderL.position.set(-.25,.99,-.12)}
 if(z.shoulderR){z.shoulderR.position.set(.25,.99,-.12)}
 if(z.armL&&z.armL.parent){z.armL.position.y=.98;z.armL.position.z=-.12;z.armL.rotation.x=.86;z.armL.rotation.z=-.18}
 if(z.armR&&z.armR.parent){z.armR.position.y=.98;z.armR.position.z=-.12;z.armR.rotation.x=.86;z.armR.rotation.z=.18}
 if(z.elbowL)z.elbowL.rotation.x=.48;if(z.elbowR)z.elbowR.rotation.x=.48;

 const back=new THREE.Mesh(new THREE.SphereGeometry(.255,12,8),z.torso.material);
 back.name="LeglessCrawlerBack";back.scale.set(1.05,.72,.72);back.position.set(0,.95,-.08);back.rotation.x=-.18;
 back.userData.zombie=z;back.userData.part="torso";z.g.add(back);
 if(z.ownedGeometries)z.ownedGeometries.push(back.geometry);
 if(z.hitMeshes)z.hitMeshes.push(back);
 z.navForceRepath=true;z.navCheckT=0;z.think=0;
 show("CRIPPLED — CRAWLER");
}
function detachLeg(z,side){''',
"legless crawler helper"
)

replace_once(
''' if(!launchDetachedLimb(z,leg,side,true))return;
 z[key]=true;
 hideRigLimb(z,side==="left"?"L_UpperLeg":"R_UpperLeg");
 if(side==="left")z.legL=new THREE.Group();else z.legR=new THREE.Group();
 z.legDamage=3;
 noise(.15,.25,280);show(side==="left"?"LEFT LEG OFF":"RIGHT LEG OFF");
}''',
''' if(!launchDetachedLimb(z,leg,side,true))return;
 z[key]=true;
 hideRigLimb(z,side==="left"?"L_UpperLeg":"R_UpperLeg");
 if(z.hitMeshes)z.hitMeshes=z.hitMeshes.filter(o=>o.userData.part!==(side==="left"?"leftLeg":"rightLeg"));
 if(side==="left")z.legL=new THREE.Group();else z.legR=new THREE.Group();
 z.legDamage=3;
 noise(.15,.25,280);show(side==="left"?"LEFT LEG OFF":"RIGHT LEG OFF");
 if(z.leftLegDetached&&z.rightLegDetached&&z.hp>0)convertLeglessToCrawler(z);
}''',
"crawler conversion trigger"
)

# Detached limbs remain visible gore but stop intercepting bullets.
replace_once(
''' limb.traverse(o=>{if(o.isMesh){o.visible=true;o.castShadow=false;o.receiveShadow=false}});''',
''' limb.traverse(o=>{if(o.isMesh){o.visible=true;o.castShadow=false;o.receiveShadow=false;o.userData.detached=true;o.userData.zombie=null;o.raycast=()=>{}}});''',
"detached limb raycast"
)

# Drops: +0.20 absolute probability (32% -> 52%) and a clearly floating presentation.
replace_once(
'''// Each zombie has a 32% chance to leave one physical pickup.''',
'''// Each zombie has a 52% chance to leave one physical pickup.''',
"drop chance comment"
)
replace_once(
'''const DROP_CHANCE=.32, DROP_LIFETIME=15, DROP_PICKUP_RADIUS=1.45, MAX_ACTIVE_DROPS=32;''',
'''const DROP_CHANCE=.52, DROP_LIFETIME=15, DROP_PICKUP_RADIUS=1.45, MAX_ACTIVE_DROPS=32, DROP_BASE_Y=.16;''',
"drop chance"
)
replace_once(
''' g.position.set(pos.x+(rnd()-.5)*.65,.04,pos.z+(rnd()-.5)*.65);
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});scene.add(g);
 drops.push({g,type,amount,weapon:ammoWeapon,life:DROP_LIFETIME,phase:rnd()*Math.PI*2,baseY:.04});''',
''' g.position.set(pos.x+(rnd()-.5)*.65,DROP_BASE_Y,pos.z+(rnd()-.5)*.65);
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});scene.add(g);
 drops.push({g,type,amount,weapon:ammoWeapon,life:DROP_LIFETIME,phase:rnd()*Math.PI*2,baseY:DROP_BASE_Y});''',
"random drop height"
)
replace_once(
''' g.position.set(pos.x+ox,.04,pos.z+oz);g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});scene.add(g);
 drops.push({g,type,amount,weapon:ammoWeapon,life:DROP_LIFETIME,phase:rnd()*Math.PI*2,baseY:.04});''',
''' g.position.set(pos.x+ox,DROP_BASE_Y,pos.z+oz);g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});scene.add(g);
 drops.push({g,type,amount,weapon:ammoWeapon,life:DROP_LIFETIME,phase:rnd()*Math.PI*2,baseY:DROP_BASE_Y});''',
"fixed drop height"
)
replace_once(
'''   d.g.position.y=d.baseY+.05+Math.sin(d.phase)*.055;''',
'''   d.g.position.y=d.baseY+.12+Math.sin(d.phase)*.07;''',
"drop float motion"
)

path.write_text(text,encoding="utf-8")
print("v132 walker/crawler/drop patch applied")
