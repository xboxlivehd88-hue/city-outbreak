from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

def replace_once(old,new,label):
    global text
    count=text.count(old)
    if count!=1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text=text.replace(old,new,1)

# 1) Make the standing rig's neck visually obvious instead of letting the head sit
# directly on the upper torso.
replace_once(
'''const ZRIG_NECK_DETAIL_GEO=new THREE.CylinderGeometry(.070,.086,.22,10,1,false);
const ZRIG_UPPER_DETAIL_GEO=new THREE.SphereGeometry(.24,10,7);''',
'''const ZRIG_NECK_DETAIL_GEO=new THREE.CylinderGeometry(.065,.082,.28,10,1,false);
const ZRIG_UPPER_DETAIL_GEO=new THREE.SphereGeometry(.24,10,7);''',
"walker neck geometry"
)

replace_once(
''' if(headBone){headBone.position.y-=.055;headBone.scale.set(1.05,1.02,1.05)}
 if(neckBone)neckBone.scale.set(1.07,1,1.07);''',
''' if(headBone){headBone.position.y-=.015;headBone.scale.set(1.05,1.02,1.05)}
 if(neckBone)neckBone.scale.set(1.04,1,1.04);''',
"walker head neck spacing"
)

replace_once(
'''   const bridge=new THREE.Mesh(ZRIG_NECK_DETAIL_GEO,rigSkinMat);
   bridge.name="WalkerNeckBridge";bridge.position.set(0,.085,-.018);bridge.rotation.x=-.08;
   bridge.userData.visualOnly=true;bridge.raycast=()=>{};neckBone.add(bridge);''',
'''   const bridge=new THREE.Mesh(ZRIG_NECK_DETAIL_GEO,rigSkinMat);
   bridge.name="WalkerNeckBridge";bridge.position.set(0,.040,-.018);bridge.rotation.x=-.08;
   bridge.castShadow=true;bridge.receiveShadow=true;bridge.userData.visualOnly=true;bridge.raycast=()=>{};neckBone.add(bridge);''',
"walker neck bridge placement"
)

replace_once(
'''   upper.name="WalkerUpperTorsoDetail";upper.scale.set(1.22,.40,.66);upper.position.set(0,.075,-.018);''',
'''   upper.name="WalkerUpperTorsoDetail";upper.scale.set(1.18,.33,.64);upper.position.set(0,.025,-.018);''',
"walker upper torso clearance"
)

# 2) Keep a handle to the procedural hair so native crawlers can reshape it.
replace_once(
''' let mouth=box(.075,.012,.008,kind==="acidic"?ZM(0xaa1616,.75):ZM(0x361718,.9),0,-.112,-.128,head);
 if(i%3!==0){let hair=box(.19,.040,.135,ZM(i%2?0x221d19:0x30271f,.94),0,.145,-.005,head);hair.rotation.x=-.02}''',
''' let mouth=box(.075,.012,.008,kind==="acidic"?ZM(0xaa1616,.75):ZM(0x361718,.9),0,-.112,-.128,head);
 let hair=null;
 if(i%3!==0){hair=box(.19,.040,.135,ZM(i%2?0x221d19:0x30271f,.94),0,.145,-.005,head);hair.rotation.x=-.02}''',
"crawler hair handle"
)

# 3) Native crawler head cleanup. The sphere from the previous pass still had the old
# box-face pieces sized for a cylindrical head, creating the odd crown/face geometry.
replace_once(
'''   // Head becomes a proper rounded skull instead of a six-sided column.
   try{head.geometry.dispose()}catch(_){}
   head.geometry=new THREE.SphereGeometry(.155,12,9);
   head.position.set(0,1.25,-.24);
   head.scale.set(.94,1.08,.84);
   head.rotation.set(-.18,0,0);

   // Flatten the old blocky face add-ons so they read as surface detail instead of bricks.
   forehead.scale.set(1.0,.60,.45);
   cheekL.scale.set(.78,.82,.45);cheekR.scale.set(.78,.82,.45);
   jaw.scale.set(.92,.72,.78);
   browL.scale.z=.45;browR.scale.z=.45;

   // Round neck / shoulders / elbows / hands.
   try{neck.geometry.dispose()}catch(_){}
   neck.geometry=new THREE.CylinderGeometry(.060,.072,.13,10);
   neck.position.set(0,1.07,-.18);neck.rotation.x=-.42;''',
'''   // Cleaner crawler skull. Remove the old block-face planes that were producing
   // the crown/helmet-looking silhouette and keep only small facial details.
   try{head.geometry.dispose()}catch(_){}
   head.geometry=new THREE.SphereGeometry(.150,12,8);
   head.position.set(0,1.23,-.215);
   head.scale.set(.96,1.03,.86);
   head.rotation.set(-.14,0,0);
   forehead.visible=false;cheekL.visible=false;cheekR.visible=false;
   jaw.scale.set(.78,.56,.66);jaw.position.y=-.128;jaw.position.z=-.018;
   browL.scale.set(.88,.78,.55);browR.scale.set(.88,.78,.55);
   if(hair){hair.scale.set(.78,.48,.72);hair.position.set(0,.125,.010);hair.rotation.x=-.06}

   // Round neck / shoulders / elbows / hands, with the neck actually meeting the skull.
   try{neck.geometry.dispose()}catch(_){}
   neck.geometry=new THREE.CylinderGeometry(.058,.072,.18,10);
   neck.position.set(0,1.08,-.175);neck.rotation.x=-.36;''',
"native crawler head cleanup"
)

# 4) v132 swapped a legless walker to the procedural crawler model. Replace that with
# an in-place state change that keeps the exact same skinned zombie/outfit/head.
old_start=text.index("function replaceZombieGeo(z,mesh,geo){")
old_end=text.index("function detachLeg(z,side){",old_start)
if old_start<0 or old_end<0:
    raise SystemExit("legless crawler conversion block not found")
new_block='''function poseLeglessCrawlerRig(z,walk=0,walk2=0,attack=0){
 if(!z||!z.leglessCrawler||!z.rigVisual)return;
 const rig=z.rigVisual;
 // Keep the original zombie identity, but lower and pitch that same body into a
 // weight-bearing crawl. The severed upper-leg bones remain hidden.
 rig.position.y=-.53;
 rig.rotation.x=-.72;
 rig.rotation.z=0;
 const hips=rigBone(z,"Hips"),spine=rigBone(z,"Spine"),chest=rigBone(z,"Chest"),
       neck=rigBone(z,"Neck"),headB=rigBone(z,"Head"),
       lua=rigBone(z,"L_UpperArm"),rua=rigBone(z,"R_UpperArm"),
       lla=rigBone(z,"L_LowerArm"),rla=rigBone(z,"R_LowerArm");
 if(hips)hips.rotation.set(-.10,0,0);
 if(spine)spine.rotation.set(.18+Math.abs(walk)*.025,0,walk*.025);
 if(chest)chest.rotation.set(.20+attack*.08,0,-walk*.035);
 if(neck)neck.rotation.set(-.24,0,0);
 if(headB)headB.rotation.set(-.10+attack*.04,0,walk*.035);
 if(lua)lua.rotation.set(.98+walk*.20,0,-.34);
 if(rua)rua.rotation.set(.98+walk2*.20,0,.34);
 if(lla)lla.rotation.set(.58+Math.max(0,walk)*.24,0,-.10);
 if(rla)rla.rotation.set(.58+Math.max(0,walk2)*.24,0,.10);
}
function convertLeglessToCrawler(z){
 if(!z||z.dead||z.kind==="boss"||z.leglessCrawler||z.hp<=0||!z.leftLegDetached||!z.rightLegDetached)return;
 z.leglessCrawler=true;
 z.kind="crawler";z.nightmareType="crawler";z.role="charger";z.lurch=.90;z.strideScale=1;
 const d=diff(wave);z.speed=d.speed*.82;z.damage=Math.round(d.damage*.95);z.attack=d.attack;
 z.legDamage=0;z.limp=0;z.knockdown=null;z.ragdoll=null;z.falling=false;z.stagger=Math.max(z.stagger,.18);
 z.g.rotation.x=0;z.g.rotation.z=0;z.g.position.y=z.groundY||0;

 // Preserve the exact rig/materials/outfit from the walker. Stop normal walking clips;
 // the crawler pose below drives the surviving upper body instead.
 if(z.mixer)z.mixer.stopAllAction();
 z.rigBase=null;z.rigTransient=null;z.rigTransientT=0;
 hideRigLimb(z,"L_UpperLeg");hideRigLimb(z,"R_UpperLeg");
 poseLeglessCrawlerRig(z,0,0,0);

 z.navForceRepath=true;z.navCheckT=0;z.think=0;
 show("CRIPPLED — CRAWLER");
}
'''
text=text[:old_start]+new_block+text[old_end:]

# 5) Do not let the locomotion state machine restart Shamble on a legless rig crawler.
replace_once(
'''if(z.mixer){
 setZombieLocomotion(z,huntRun);
 const naturalRunner=z.kind==="sprinter"||z.kind==="infected"||z.kind==="acidic";''',
'''if(z.mixer){
 if(!z.leglessCrawler)setZombieLocomotion(z,huntRun);
 const naturalRunner=z.kind==="sprinter"||z.kind==="infected"||z.kind==="acidic";''',
"legless mixer locomotion"
)

replace_once(
''' if(z.rigBase)z.rigBase.timeScale=rigScale;
 if(z.rigTransientT>0){z.rigTransientT-=dt;if(z.rigTransientT<=0){if(z.rigTransient)z.rigTransient.fadeOut(.08);if(z.rigBase)z.rigBase.reset().fadeIn(.10).play();z.rigTransient=null;}}
 z.mixer.update(dt);''',
''' if(z.rigBase)z.rigBase.timeScale=rigScale;
 if(z.rigTransientT>0){z.rigTransientT-=dt;if(z.rigTransientT<=0){if(z.rigTransient)z.rigTransient.fadeOut(.08);if(z.rigBase)z.rigBase.reset().fadeIn(.10).play();z.rigTransient=null;}}
 z.mixer.update(dt);''',
"mixer block anchor"
)

# 6) Re-apply the crawl pose after the mixer each frame so hit/attack actions cannot
# leave the preserved rig standing upright.
replace_once(
'''       isCrawler=kind==="crawler",isBoss=kind==="boss",isSprinter=kind==="sprinter"||kind==="infected"||kind==="acidic",isRadiated=kind==="radiated",
       forwardPulse=Math.max(0,walk)*.018;

 // The chest is literally ahead of the hips.''',
'''       isCrawler=kind==="crawler",isBoss=kind==="boss",isSprinter=kind==="sprinter"||kind==="infected"||kind==="acidic",isRadiated=kind==="radiated",
       forwardPulse=Math.max(0,walk)*.018;

 if(z.leglessCrawler&&z.rigVisual)poseLeglessCrawlerRig(z,walk,walk2,attack);

 // The chest is literally ahead of the hips.''',
"crawler rig pose update"
)

# 7) Native crawler procedural animation is fine; legless rig crawlers should not have
# invisible procedural arm/leg transforms fighting the preserved visual rig.
replace_once(
''' if(isCrawler){
   z.armL.rotation.x=.92+walk*.22+attack*.18; z.armR.rotation.x=.92+walk2*.22+attack*.18;
   z.armL.rotation.z=-.14; z.armR.rotation.z=.14;
   if(z.elbowL)z.elbowL.rotation.x=.42+Math.max(0,walk)*.28+attack*.20;
   if(z.elbowR)z.elbowR.rotation.x=.42+Math.max(0,walk2)*.28+attack*.20;
 }else if(isSprinter){''',
''' if(isCrawler){
   if(!z.leglessCrawler){
     z.armL.rotation.x=.92+walk*.22+attack*.18; z.armR.rotation.x=.92+walk2*.22+attack*.18;
     z.armL.rotation.z=-.14; z.armR.rotation.z=.14;
     if(z.elbowL)z.elbowL.rotation.x=.42+Math.max(0,walk)*.28+attack*.20;
     if(z.elbowR)z.elbowR.rotation.x=.42+Math.max(0,walk2)*.28+attack*.20;
   }
 }else if(isSprinter){''',
"crawler procedural arms"
)

replace_once(
''' if(isCrawler){
   z.legL.rotation.x=-1.12+walk2*.04; z.legR.rotation.x=-1.04+walk*.04;
   z.g.position.y=z.groundY+.003;
 }else if(isBoss){''',
''' if(isCrawler){
   if(!z.leglessCrawler){z.legL.rotation.x=-1.12+walk2*.04;z.legR.rotation.x=-1.04+walk*.04}
   z.g.position.y=z.groundY+.003;
 }else if(isBoss){''',
"crawler procedural legs"
)

path.write_text(text,encoding="utf-8")
print("v133 crawler identity/head/neck patch applied")
