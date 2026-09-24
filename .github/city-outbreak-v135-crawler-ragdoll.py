from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

def replace_once(old,new,label):
    global text
    count=text.count(old)
    if count!=1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text=text.replace(old,new,1)

# Track walker-only accessory meshes so native crawlers can hide anything that would
# otherwise remain floating at standing-zombie height.
replace_once(
''' let outerCloth=shirt,jacket=null;''',
''' let outerCloth=shirt,jacket=null,hood=null,vestPanel=null;''',
"crawler accessory handles"
)

replace_once(
'''   if(outfit===3){ // hood / collar
     let hood=box(.25,.10,.19,outerCloth,0,1.66,.015,g);hood.rotation.x=-.08;
   }''',
'''   if(outfit===3){ // hood / collar
     hood=box(.25,.10,.19,outerCloth,0,1.66,.015,g);hood.rotation.x=-.08;
   }''',
"hood handle"
)

replace_once(
''' if(outfit===2){ // simple work vest panel
   box(.18,.34,.018,ZM(0x8f7a32,.72),0,1.39,-.128,g);
 }''',
''' if(outfit===2){ // simple work vest panel
   vestPanel=box(.18,.34,.018,ZM(0x8f7a32,.72),0,1.39,-.128,g);
 }''',
"vest handle"
)

replace_once(
''' // Damage is graphic and large enough to read from across the street.
 if(i%2===0){let faceWound=box(.065,.075,.011,wound,-.085,-.025,-.130,head);faceWound.rotation.z=.20}
 if(i%4===1){let skullPatch=box(.060,.038,.009,bone,.070,.080,-.126,head);skullPatch.rotation.z=-.12}''',
''' // Damage is graphic and large enough to read from across the street.
 let faceWound=null,skullPatch=null;
 if(i%2===0){faceWound=box(.065,.075,.011,wound,-.085,-.025,-.130,head);faceWound.rotation.z=.20}
 if(i%4===1){skullPatch=box(.060,.038,.009,bone,.070,.080,-.126,head);skullPatch.rotation.z=-.12}''',
"face detail handles"
)

replace_once(
''' // Torso damage / glowing contamination.
 let torsoPatch=kind==="radiated"?new THREE.MeshBasicMaterial({color:0x4cff65}):kind==="acidic"?new THREE.MeshBasicMaterial({color:0xbf1717}):wound;
 if(i%2===1){let gash=box(.085,.135,.012,torsoPatch,-.065,1.39,-.132,g);gash.rotation.z=.16}
 if(i%4===0){let chestPatch=box(.095,.13,.012,torsoPatch,.075,1.48,-.134,g);chestPatch.rotation.z=-.12}''',
''' // Torso damage / glowing contamination.
 let torsoPatch=kind==="radiated"?new THREE.MeshBasicMaterial({color:0x4cff65}):kind==="acidic"?new THREE.MeshBasicMaterial({color:0xbf1717}):wound;
 let gash=null,chestPatch=null;
 if(i%2===1){gash=box(.085,.135,.012,torsoPatch,-.065,1.39,-.132,g);gash.rotation.z=.16}
 if(i%4===0){chestPatch=box(.095,.13,.012,torsoPatch,.075,1.48,-.134,g);chestPatch.rotation.z=-.12}''',
"torso detail handles"
)

# Native crawler face cleanup: keep eyes/mouth/skull, remove floating walker accessories.
replace_once(
'''   head.rotation.set(-.14,0,0);
   forehead.visible=false;cheekL.visible=false;cheekR.visible=false;
   jaw.scale.set(.78,.56,.66);jaw.position.y=-.128;jaw.position.z=-.018;
   browL.scale.set(.88,.78,.55);browR.scale.set(.88,.78,.55);
   if(hair){hair.scale.set(.78,.48,.72);hair.position.set(0,.125,.010);hair.rotation.x=-.06}

   // Round neck / shoulders / elbows / hands, with the neck actually meeting the skull.''',
'''   head.rotation.set(-.14,0,0);
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
   if(skullPatch)skullPatch.scale.z=.35;

   // Round neck / shoulders / elbows / hands, with the neck actually meeting the skull.''',
"crawler floating detail cleanup"
)

# Stronger ragdoll across all zombie deaths, while keeping blast deaths stronger than bullets.
replace_once(
''' const collapse=rnd();
 const forward=isBlast?(rnd()>.5?1:-1)*(1.00+rnd()*.28):(collapse<.46?1:collapse<.72?-1:(rnd()>.5?1:-1)*.30);
 const sideFall=isBlast?side*(.95+rnd()*.45):(collapse>.68?side*(.72+rnd()*.25):side*(.20+rnd()*.20));''',
''' const collapse=rnd();
 const forward=isBlast?(rnd()>.5?1:-1)*(1.08+rnd()*.38):(collapse<.40?1.02+rnd()*.28:collapse<.70?-(.82+rnd()*.24):(rnd()>.5?1:-1)*(.42+rnd()*.28));
 const sideFall=isBlast?side*(1.02+rnd()*.52):(collapse>.62?side*(.82+rnd()*.34):side*(.30+rnd()*.26));''',
"ragdoll fall variety"
)

replace_once(
'''   targetX:z.g.rotation.x+forward*(isBlast?.88:.58+rnd()*.18),
   targetZ:z.g.rotation.z+sideFall,
   targetY:z.g.rotation.y+(rnd()-.5)*(isBlast?.75:.28),
   vx:awayX*(isBlast?(1.10+.72*rnd())*power:(.24+.18*rnd())*power)+(rnd()-.5)*(isBlast?.30:.12),
   vz:awayZ*(isBlast?(1.10+.72*rnd())*power:(.24+.18*rnd())*power)+(rnd()-.5)*(isBlast?.30:.12),
   vy:isBlast?(1.65+1.05*rnd())*power:0,''',
'''   targetX:z.g.rotation.x+forward*(isBlast?.98:.78+rnd()*.22),
   targetZ:z.g.rotation.z+sideFall,
   targetY:z.g.rotation.y+(rnd()-.5)*(isBlast?.88:.58),
   vx:awayX*(isBlast?(1.18+.78*rnd())*power:(.48+.30*rnd())*power)+(rnd()-.5)*(isBlast?.36:.24),
   vz:awayZ*(isBlast?(1.18+.78*rnd())*power:(.48+.30*rnd())*power)+(rnd()-.5)*(isBlast?.36:.24),
   vy:isBlast?(1.72+1.12*rnd())*power:(.32+.34*rnd())*power,''',
"ragdoll root momentum"
)

replace_once(
'''   const loose=rag.blast?1.28+.16*rag.power:1.08;''',
'''   const loose=rag.blast?1.34+.18*rag.power:1.24;''',
"ragdoll limb looseness"
)

# More pronounced loose-joint poses on normal rigged zombies too.
replace_once(
'''   add(rigBone(z,"L_UpperArm"),.85+rnd()*.55,(rnd()-.5)*.30,-.78-rnd()*.38,.08,.72,.18);
   add(rigBone(z,"L_LowerArm"),1.05+rnd()*.55,(rnd()-.5)*.25,-.38-rnd()*.28,.13,.68,.20);
   add(rigBone(z,"R_UpperArm"),.85+rnd()*.55,(rnd()-.5)*.30, .78+rnd()*.38,.09,.72,.18);
   add(rigBone(z,"R_LowerArm"),1.05+rnd()*.55,(rnd()-.5)*.25, .38+rnd()*.28,.14,.68,.20);

   add(rigBone(z,"Neck"),-forward*.40,(rnd()-.5)*.30,-side*.25,.22,.58,.14);
   add(rigBone(z,"Head"),-forward*.72,(rnd()-.5)*.46,-side*.48,.27,.62,.19);''',
'''   add(rigBone(z,"L_UpperArm"),1.02+rnd()*.62,(rnd()-.5)*.42,-.92-rnd()*.46,.06,.82,.25);
   add(rigBone(z,"L_LowerArm"),1.22+rnd()*.62,(rnd()-.5)*.36,-.48-rnd()*.34,.11,.78,.28);
   add(rigBone(z,"R_UpperArm"),1.02+rnd()*.62,(rnd()-.5)*.42, .92+rnd()*.46,.07,.82,.25);
   add(rigBone(z,"R_LowerArm"),1.22+rnd()*.62,(rnd()-.5)*.36, .48+rnd()*.34,.12,.78,.28);

   add(rigBone(z,"Neck"),-forward*.52,(rnd()-.5)*.42,-side*.34,.18,.68,.20);
   add(rigBone(z,"Head"),-forward*.88,(rnd()-.5)*.60,-side*.62,.22,.74,.28);''',
"ragdoll upper body looseness"
)

replace_once(
''' }else{
   // Crawlers/procedural fallback get the same staged loose-joint collapse.
   add(z.legL,.65,0,-.25,.00,.38,.08);add(z.kneeL,-1.15,0,-.12,.02,.42,.08);
   add(z.legR,.30,0,.25,.00,.40,.08);add(z.kneeR,-1.05,0,.12,.03,.44,.08);
   add(z.torso,forward*.72,(rnd()-.5)*.25,side*.38,.12,.68,.13);
   add(z.armL,1.0,0,-.72,.08,.70,.18);add(z.elbowL,1.05,0,-.30,.14,.67,.18);
   add(z.armR,1.0,0,.72,.09,.70,.18);add(z.elbowR,1.05,0,.30,.15,.67,.18);
   add(z.head,-forward*.70,(rnd()-.5)*.35,-side*.42,.26,.60,.18);
 }''',
''' }else{
   // Crawlers/procedural fallback get the same looser whole-body death response.
   add(z.legL,.78,0,-.34,.00,.48,.13);add(z.kneeL,-1.30,0,-.18,.02,.50,.14);
   add(z.legR,.42,0,.34,.00,.50,.13);add(z.kneeR,-1.22,0,.18,.03,.52,.14);
   add(z.torso,forward*.88,(rnd()-.5)*.38,side*.50,.09,.78,.21);
   add(z.armL,1.18,0,-.88,.06,.82,.27);add(z.elbowL,1.28,0,-.42,.11,.78,.28);
   add(z.armR,1.18,0,.88,.07,.82,.27);add(z.elbowR,1.28,0,.42,.12,.78,.28);
   add(z.head,-forward*.86,(rnd()-.5)*.52,-side*.58,.18,.72,.27);
 }''',
"procedural ragdoll looseness"
)

# Let ordinary gun kills get a small airborne/ground-bounce component instead of only
# rotating in place. Explosions retain the larger launch.
replace_once(
''' z.g.position.x+=r.vx*dt;z.g.position.z+=r.vz*dt;
 const drag=Math.exp(-dt*(r.blast?2.5:4.0));r.vx*=drag;r.vz*=drag;
 if(r.blast){
   r.vy-=6.8*dt;
   z.g.position.y+=r.vy*dt;
   if(z.g.position.y<-.08){
     z.g.position.y=-.08;
     if(r.vy<-.30){r.vy*=-.16;r.vx*=.72;r.vz*=.72}else r.vy=0;
   }
 }else{
   const drop=smooth((r.t-.12)/.92);
   z.g.position.y=-.08*drop;
 }''',
''' z.g.position.x+=r.vx*dt;z.g.position.z+=r.vz*dt;
 const drag=Math.exp(-dt*(r.blast?2.4:3.2));r.vx*=drag;r.vz*=drag;
 r.vy-=(r.blast?6.8:5.4)*dt;
 z.g.position.y+=r.vy*dt;
 if(z.g.position.y<-.08){
   z.g.position.y=-.08;
   if(r.vy<-(r.blast?.30:.22)){
     r.vy*=r.blast?-.16:-.10;
     r.vx*=r.blast?.72:.78;r.vz*=r.blast?.72:.78;
   }else r.vy=0;
 }''',
"ragdoll ground physics"
)

replace_once(
'''   const loose=(1-t)*Math.exp(-Math.max(0,r.t-b.delay)*(r.blast?1.9:2.35))*b.wob;''',
'''   const loose=(1-t)*Math.exp(-Math.max(0,r.t-b.delay)*(r.blast?1.75:1.85))*b.wob;''',
"ragdoll settle damping"
)

replace_once(
''' if(r.t>(r.blast?1.85:1.62)&&(!r.blast||z.g.position.y<=-.079))z.falling=false;''',
''' if(r.t>(r.blast?2.00:1.90)&&z.g.position.y<=-.079)z.falling=false;''',
"ragdoll duration"
)

path.write_text(text,encoding="utf-8")
print("v135 crawler cleanup and ragdoll pass applied")
