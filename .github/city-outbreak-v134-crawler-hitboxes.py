from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

def replace_once(old,new,label):
    global text
    count=text.count(old)
    if count!=1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text=text.replace(old,new,1)

# Dedicated shooting collision for walkers that become crawlers. v133 kept the
# original visual rig but left the old invisible standing hitboxes behind.
replace_once(
'''function poseLeglessCrawlerRig(z,walk=0,walk2=0,attack=0){
 if(!z||!z.leglessCrawler||!z.rigVisual)return;''',
'''function buildLeglessCrawlerHitboxes(z){
 if(!z||z.crawlerHitboxes)return;
 // Retire the standing procedural hitboxes. They remain as hidden support geometry,
 // but must no longer be raycast targets once the visual body drops to the street.
 if(z.hitMeshes)for(const o of z.hitMeshes){if(o)o.raycast=()=>{}}

 const mat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,depthTest:false,colorWrite:false});
 const hitboxes=[];
 const add=(geo,x,y,zz,part,isHead=false)=>{
   const q=new THREE.Mesh(geo,mat);
   q.position.set(x,y,zz);q.name="LeglessCrawler_"+part;
   q.castShadow=false;q.receiveShadow=false;
   q.userData.zombie=z;q.userData.part=part;if(isHead)q.userData.isHead=true;
   z.g.add(q);hitboxes.push(q);
   if(z.ownedGeometries)z.ownedGeometries.push(geo);
   return q;
 };
 // The preserved rig is pitched forward about 41 degrees. These volumes sit over
 // the low chest, skull and weight-bearing arms seen by the player.
 add(new THREE.BoxGeometry(.62,.50,.86),0,.53,-.70,"torso");
 add(new THREE.SphereGeometry(.215,9,7),0,.64,-1.17,"head",true);
 if(!z.leftArmDetached)add(new THREE.BoxGeometry(.20,.28,.62),-.31,.36,-.58,"leftArm");
 if(!z.rightArmDetached)add(new THREE.BoxGeometry(.20,.28,.62),.31,.36,-.58,"rightArm");
 if(z.ownedMaterials)z.ownedMaterials.push(mat);
 z.crawlerHitboxes=hitboxes;
 z.hitMeshes=hitboxes;
}
function poseLeglessCrawlerRig(z,walk=0,walk2=0,attack=0){
 if(!z||!z.leglessCrawler||!z.rigVisual)return;''',
"crawler hitbox helper"
)

replace_once(
''' hideRigLimb(z,"L_UpperLeg");hideRigLimb(z,"R_UpperLeg");
 poseLeglessCrawlerRig(z,0,0,0);

 z.navForceRepath=true;z.navCheckT=0;z.think=0;''',
''' hideRigLimb(z,"L_UpperLeg");hideRigLimb(z,"R_UpperLeg");
 poseLeglessCrawlerRig(z,0,0,0);
 buildLeglessCrawlerHitboxes(z);

 z.navForceRepath=true;z.navCheckT=0;z.think=0;''',
"build crawler hitboxes on conversion"
)

# Grenade launcher projectile collision also used a standing-zombie center point.
# Lower the collision sphere for every crawler (native or converted).
replace_once(
'''     }else{
       const dy=g.q.position.y-(z.g.position.y+1);
       if(dx*dx+dy*dy+dz*dz<.49){impact=true;break}
     }''',
'''     }else{
       const crawler=z.kind==="crawler";
       const dy=g.q.position.y-(z.g.position.y+(crawler?.55:1));
       const rr=crawler?.78:.70;
       if(dx*dx+dy*dy+dz*dz<rr*rr){impact=true;break}
     }''',
"crawler launcher collision"
)

path.write_text(text,encoding="utf-8")
print("v134 crawler hitbox patch applied")
