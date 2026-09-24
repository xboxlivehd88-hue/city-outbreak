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
''' if(z.knockdown){
   z.knockdown.downDur=Math.max(z.knockdown.downDur,.48+power*.42);
   z.knockdown.vx+=nx*(1.3+power*1.5);
   z.knockdown.vz+=nz*(1.3+power*1.5);
   return;
 }

 if(z.mixer)z.mixer.stopAllAction();
 z.attackAnim=0;z.cool=Math.max(z.cool,.6);
 z.stagger=0;z.blastT=0;

 const k=z.knockdown={
   t:0,
   fallDur:.34+Math.min(.14,power*.06),
   downDur:.42+power*.46+rnd()*.22,
   riseDur:.72+rnd()*.18,
   baseX:z.g.rotation.x,baseZ:z.g.rotation.z,baseYPos:z.g.position.y,
   fallX:z.g.rotation.x+(-localZ)*(1.08+power*.18),
   fallZ:z.g.rotation.z+( localX)*(1.08+power*.18),
   vx:nx*(1.8+power*2.25),
   vz:nz*(1.8+power*2.25),
   bones:[]
 };

 const add=(o,dxr,dyr,dzr)=>{
   if(!o||!o.parent)return;
   k.bones.push({
     o,
     sx:o.rotation.x,sy:o.rotation.y,sz:o.rotation.z,
     tx:o.rotation.x+dxr,ty:o.rotation.y+dyr,tz:o.rotation.z+dzr,
     phase:rnd()*6.28
   });
 };

 if(z.rigVisual){
   add(rigBone(z,"Hips"),.18*localZ,0,-.22*localX);
   add(rigBone(z,"Spine"),.42+(rnd()-.5)*.18,(rnd()-.5)*.14,-localX*.28);
   add(rigBone(z,"Chest"),.48+(rnd()-.5)*.22,(rnd()-.5)*.18,-localX*.34);
   add(rigBone(z,"Neck"),-.30,(rnd()-.5)*.18,localX*.22);
   add(rigBone(z,"Head"),-.52,(rnd()-.5)*.28,localX*.34);
   add(rigBone(z,"L_UpperArm"),.82+(rnd()-.5)*.30,0,-.62-rnd()*.24);
   add(rigBone(z,"L_LowerArm"),.78+rnd()*.35,0,-.25-rnd()*.18);
   add(rigBone(z,"R_UpperArm"),.82+(rnd()-.5)*.30,0,.62+rnd()*.24);
   add(rigBone(z,"R_LowerArm"),.78+rnd()*.35,0,.25+rnd()*.18);
   add(rigBone(z,"L_UpperLeg"),.38+(rnd()-.5)*.28,0,-.18);
   add(rigBone(z,"L_LowerLeg"),-.72-rnd()*.28,0,-.08);
   add(rigBone(z,"R_UpperLeg"),.28+(rnd()-.5)*.28,0,.18);
   add(rigBone(z,"R_LowerLeg"),-.68-rnd()*.28,0,.08);
 }else{
   add(z.torso,.48+(rnd()-.5)*.18,0,-localX*.28);
   add(z.head,-.46,(rnd()-.5)*.20,localX*.30);
   add(z.armL,.86,0,-.58);add(z.elbowL,.72,0,-.22);
   add(z.armR,.86,0,.58);add(z.elbowR,.72,0,.22);
   add(z.legL,.38,0,-.16);add(z.kneeL,-.72,0,-.08);
   add(z.legR,.28,0,.16);add(z.kneeR,-.68,0,.08);
 }
}''',
''' if(z.knockdown){
   // A second blast while already down keeps the zombie on the pavement longer,
   // adds another shove, and re-triggers the short limb-whip impulse.
   z.knockdown.downDur=Math.max(z.knockdown.downDur,.82+power*.55);
   z.knockdown.vx+=nx*(1.5+power*1.8);
   z.knockdown.vz+=nz*(1.5+power*1.8);
   z.knockdown.impactT=0;
   z.knockdown.impactScale=Math.max(z.knockdown.impactScale||1,.90+power*.35);
   return;
 }

 if(z.mixer)z.mixer.stopAllAction();
 z.attackAnim=0;z.cool=Math.max(z.cool,.8);
 z.stagger=0;z.blastT=0;

 // v150: blast knockdowns finish near-horizontal instead of stopping in a
 // 60-degree lean. The group rotates around its ground-level origin, so roughly
 // 88–92 degrees lays the body onto the street without sinking the whole rig.
 const fallAngle=1.52+Math.min(.09,power*.045);
 const k=z.knockdown={
   t:0,
   fallDur:.26+Math.min(.10,power*.045),
   downDur:.72+power*.58+rnd()*.24,
   riseDur:.78+rnd()*.18,
   baseX:z.g.rotation.x,baseZ:z.g.rotation.z,baseYPos:z.g.position.y,
   groundDrop:z.kind==="crawler"?.025:.085,
   fallX:z.g.rotation.x+(-localZ)*fallAngle,
   fallZ:z.g.rotation.z+( localX)*fallAngle,
   vx:nx*(2.0+power*2.65),
   vz:nz*(2.0+power*2.65),
   impactT:0,impactScale:.90+power*.35,
   bones:[]
 };

 // kick controls the brief blast-pressure whip. It decays quickly, while the
 // target rotations below remain as the loose-limbed downed pose.
 const add=(o,dxr,dyr,dzr,kick=.08,kickRate=0)=>{
   if(!o||!o.parent)return;
   k.bones.push({
     o,
     sx:o.rotation.x,sy:o.rotation.y,sz:o.rotation.z,
     tx:o.rotation.x+dxr,ty:o.rotation.y+dyr,tz:o.rotation.z+dzr,
     phase:rnd()*6.28,kick,kickRate,kickDir:rnd()>.5?1:-1
   });
 };

 if(z.rigVisual){
   add(rigBone(z,"Hips"),.26*localZ,0,-.32*localX,.08,1);
   add(rigBone(z,"Spine"),.58+(rnd()-.5)*.22,(rnd()-.5)*.20,-localX*.38,.10,2);
   add(rigBone(z,"Chest"),.68+(rnd()-.5)*.26,(rnd()-.5)*.24,-localX*.46,.12,3);
   add(rigBone(z,"Neck"),-.42,(rnd()-.5)*.25,localX*.32,.15,4);
   add(rigBone(z,"Head"),-.68,(rnd()-.5)*.36,localX*.46,.18,5);

   // Arms and legs get the strongest impulse so the blast visibly travels
   // through the extremities instead of the torso falling with stiff limbs.
   add(rigBone(z,"L_UpperArm"),1.10+(rnd()-.5)*.42,(rnd()-.5)*.24,-.92-rnd()*.35,.34,7);
   add(rigBone(z,"L_LowerArm"),1.30+rnd()*.45,(rnd()-.5)*.28,-.42-rnd()*.25,.39,9);
   add(rigBone(z,"R_UpperArm"),1.10+(rnd()-.5)*.42,(rnd()-.5)*.24,.92+rnd()*.35,.34,8);
   add(rigBone(z,"R_LowerArm"),1.30+rnd()*.45,(rnd()-.5)*.28,.42+rnd()*.25,.39,10);
   add(rigBone(z,"L_UpperLeg"),.72+(rnd()-.5)*.36,(rnd()-.5)*.16,-.30-rnd()*.18,.27,6);
   add(rigBone(z,"L_LowerLeg"),-1.18-rnd()*.34,(rnd()-.5)*.14,-.15-rnd()*.12,.32,8);
   add(rigBone(z,"R_UpperLeg"),.62+(rnd()-.5)*.36,(rnd()-.5)*.16,.30+rnd()*.18,.27,7);
   add(rigBone(z,"R_LowerLeg"),-1.14-rnd()*.34,(rnd()-.5)*.14,.15+rnd()*.12,.32,9);
 }else{
   // Native crawlers/procedural fallback use the same impulse concept.
   add(z.torso,.62+(rnd()-.5)*.22,0,-localX*.38,.12,3);
   add(z.head,-.62,(rnd()-.5)*.28,localX*.42,.18,5);
   add(z.armL,1.12,(rnd()-.5)*.22,-.90,.34,7);add(z.elbowL,1.28,(rnd()-.5)*.20,-.38,.39,9);
   add(z.armR,1.12,(rnd()-.5)*.22,.90,.34,8);add(z.elbowR,1.28,(rnd()-.5)*.20,.38,.39,10);
   add(z.legL,.68,(rnd()-.5)*.14,-.26,.27,6);add(z.kneeL,-1.10,(rnd()-.5)*.12,-.13,.32,8);
   add(z.legR,.58,(rnd()-.5)*.14,.26,.27,7);add(z.kneeR,-1.06,(rnd()-.5)*.12,.13,.32,9);
 }
}''',
"strong ground knockdown and limb impulse"
)

replace_once(
'''function updateKnockdown(z,dt){
 const k=z.knockdown;if(!k)return false;
 k.t+=dt;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};''',
'''function updateKnockdown(z,dt){
 const k=z.knockdown;if(!k)return false;
 k.t+=dt;k.impactT=(k.impactT||0)+dt;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};''',
"track blast limb impulse time"
)

replace_once(
''' z.g.rotation.x=k.baseX+(k.fallX-k.baseX)*root;
 z.g.rotation.z=k.baseZ+(k.fallZ-k.baseZ)*root;
 z.g.position.y=k.baseYPos-.055*root;''',
''' z.g.rotation.x=k.baseX+(k.fallX-k.baseX)*root;
 z.g.rotation.z=k.baseZ+(k.fallZ-k.baseZ)*root;
 z.g.position.y=k.baseYPos-(k.groundDrop||.055)*root;''',
"grounded knockdown height"
)

replace_once(
''' for(const b of k.bones){
   const loose=k.t<fallEnd?Math.sin(k.t*15+b.phase)*.045*(1-pose):0;
   b.o.rotation.x=b.sx+(b.tx-b.sx)*pose+loose;
   b.o.rotation.y=b.sy+(b.ty-b.sy)*pose+loose*.45;
   b.o.rotation.z=b.sz+(b.tz-b.sz)*pose+loose*.65;
 }''',
''' for(const b of k.bones){
   const settle=k.t<fallEnd?Math.sin(k.t*15+b.phase)*.035*(1-pose):0;
   const whip=Math.sin(k.impactT*(19+(b.kickRate||0))+b.phase)*(b.kick||.08)*(k.impactScale||1)*Math.exp(-k.impactT*5.0);
   const w=whip*(b.kickDir||1);
   b.o.rotation.x=b.sx+(b.tx-b.sx)*pose+settle+w;
   b.o.rotation.y=b.sy+(b.ty-b.sy)*pose+settle*.35+w*.42;
   b.o.rotation.z=b.sz+(b.tz-b.sz)*pose+settle*.55+w*.72;
 }''',
"visible limb blast whip"
)

replace_once(
'''     else{blastReact(z,p,.70+force*1.15);if(z.kind!=="boss")stagger(z,false)}
''',
'''     else blastReact(z,p,.70+force*1.15)
''',
"launcher blast uses knockdown only"
)

replace_once(
'''     else{blastReact(z,p,.55+force*.95);if(z.kind!=="boss")stagger(z,false)}
''',
'''     else blastReact(z,p,.55+force*.95)
''',
"grenade blast uses knockdown only"
)

path.write_text(text,encoding="utf-8")
print("v150 explosive knockdown and limb reaction patch applied")
