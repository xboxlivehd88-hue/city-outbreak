from pathlib import Path

path = Path("index.html")
text = path.read_text(encoding="utf-8")

def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text = text.replace(old, new, 1)

# 1) Zombie eyes already use bright/emissive materials. One real-time PointLight per zombie
# is expensive and largely redundant, especially at the 20-active-zombie cap.
replace_once(
''' let eyeGlow=new THREE.PointLight(eyeCol,kind==="boss"?1.1:.72,2.1,2.1);eyeGlow.position.set(0,.02,-.18);head.add(eyeGlow);''',
''' // Eye glow stays in the eye/emissive material; avoid a dynamic PointLight on every zombie.''',
'zombie eye lights'
)

# 2) Mark rigged visual meshes as visual-only so shooting can skip them entirely.
replace_once(
'''   o.castShadow=true;o.receiveShadow=true;o.frustumCulled=true;
   // The invisible procedural geometry remains responsible for shooting/hit zones.
   o.raycast=()=>{};''',
'''   o.castShadow=true;o.receiveShadow=true;o.frustumCulled=true;o.userData.visualOnly=true;
   // The invisible procedural geometry remains responsible for shooting/hit zones.
   o.raycast=()=>{};''',
'visual-only rig tag'
)

# 3) Cache only actual hitbox meshes once at zombie creation instead of recursively traversing
# every zombie for every automatic-weapon shot.
replace_once(
''' g.traverse(o=>{if(o.isMesh){o.userData.zombie=zz;if(!o.userData.part)o.userData.part="body";const major=(o===torso||o===head||o===pelvis);o.castShadow=major;o.receiveShadow=major}});
 zombies.push(zz);if(kind==="boss")currentBoss=zz''',
''' const hitMeshes=[];
 g.traverse(o=>{
   if(!o.isMesh)return;
   if(o.userData.visualOnly){o.castShadow=false;o.receiveShadow=false;return}
   o.userData.zombie=zz;if(!o.userData.part)o.userData.part="body";
   const major=(o===torso||o===head||o===pelvis);o.castShadow=major;o.receiveShadow=major;
   hitMeshes.push(o)
 });
 zz.hitMeshes=hitMeshes;
 zombies.push(zz);if(kind==="boss")currentBoss=zz''',
'zombie hitbox cache'
)

# 4) Reuse frame/shot scratch arrays and aim vector to reduce garbage-collector hitches.
replace_once(
'''const living=()=>zombies.filter(z=>!z.dead);
function livingCount(){let n=0;for(const z of zombies)if(!z.dead)n++;return n}''',
'''const living=()=>zombies.filter(z=>!z.dead);
const activeFrame=[];
function livingCount(){let n=0;for(const z of zombies)if(!z.dead)n++;return n}''',
'active frame scratch'
)

replace_once(
'''spawnQueuedZombies();
const active=living();
updateBossUI();''',
'''spawnQueuedZombies();
activeFrame.length=0;for(const z of zombies)if(!z.dead)activeFrame.push(z);
const active=activeFrame;
updateBossUI();''',
'frame living allocation'
)

replace_once(
'''const ray=new THREE.Raycaster();''',
'''const ray=new THREE.Raycaster(),rayAim=new THREE.Vector2(),rayTargets=[];''',
'raycast scratch objects'
)

replace_once(
''' let didHit=false,headHit=false,targets=[];
 for(const z of zombies){if(z.dead)continue;z.g.traverse(o=>{if(o.isMesh)targets.push(o)})}
 for(let pellet=0;pellet<wd().pellets;pellet++){
   const adsSpread=aiming?(weapon==="awm"?.08:.38):1,sx=aimX+(Math.random()-.5)*wd().spread*adsSpread,sy=aimY+(Math.random()-.5)*wd().spread*adsSpread;
   ray.setFromCamera(new THREE.Vector2(sx,sy),cam);
   let hit=ray.intersectObjects(targets,false)[0];''',
''' let didHit=false,headHit=false;rayTargets.length=0;
 for(const z of zombies){if(z.dead)continue;if(z.hitMeshes)rayTargets.push(...z.hitMeshes)}
 for(let pellet=0;pellet<wd().pellets;pellet++){
   const adsSpread=aiming?(weapon==="awm"?.08:.38):1,sx=aimX+(Math.random()-.5)*wd().spread*adsSpread,sy=aimY+(Math.random()-.5)*wd().spread*adsSpread;
   rayAim.set(sx,sy);ray.setFromCamera(rayAim,cam);
   let hit=ray.intersectObjects(rayTargets,false)[0];''',
'raycast target traversal'
)

# 5) The highly detailed first-person gun is already lit normally; it does not need to be
# submitted again to the world shadow map. This is especially useful for the higher-detail MP5.
replace_once(
''' muzzle=new THREE.PointLight(0xffb35a,0,4);muzzle.position.set(x,-.23,muzzleZ);gun.add(muzzle);
 addPlayerHands();
}''',
''' muzzle=new THREE.PointLight(0xffb35a,0,4);muzzle.position.set(x,-.23,muzzleZ);gun.add(muzzle);
 addPlayerHands();
 gun.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
}''',
'first person weapon shadows'
)

# 6) Pickups are tiny decorative objects. Keep their appearance/materials but remove their
# shadow-map submissions, which can stack up to 32 active drops.
replace_once(
''' g.position.set(pos.x+(rnd()-.5)*.65,.04,pos.z+(rnd()-.5)*.65);
 scene.add(g);
 drops.push({g,type,amount,weapon:ammoWeapon,life:DROP_LIFETIME,phase:rnd()*Math.PI*2,baseY:.04});''',
''' g.position.set(pos.x+(rnd()-.5)*.65,.04,pos.z+(rnd()-.5)*.65);
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});scene.add(g);
 drops.push({g,type,amount,weapon:ammoWeapon,life:DROP_LIFETIME,phase:rnd()*Math.PI*2,baseY:.04});''',
'random drop shadows'
)

replace_once(
''' const label=makeDropLabel(labelText,labelColor);label.position.set(0,1.03,0);g.add(label);
 g.position.set(pos.x+ox,.04,pos.z+oz);scene.add(g);
 drops.push({g,type,amount,weapon:ammoWeapon,life:DROP_LIFETIME,phase:rnd()*Math.PI*2,baseY:.04});''',
''' const label=makeDropLabel(labelText,labelColor);label.position.set(0,1.03,0);g.add(label);
 g.position.set(pos.x+ox,.04,pos.z+oz);g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});scene.add(g);
 drops.push({g,type,amount,weapon:ammoWeapon,life:DROP_LIFETIME,phase:rnd()*Math.PI*2,baseY:.04});''',
'fixed drop shadows'
)

# 7) Avoid a temporary THREE.Vector3 allocation in the hot FX loop.
replace_once(
'''const sp=p.spin||new THREE.Vector3(4,5,3);p.q.rotation.x+=sp.x*dt;p.q.rotation.y+=sp.y*dt;p.q.rotation.z+=sp.z*dt;
 if(p.q.position.y<.08){p.q.position.y=.08;p.v.y*=-.20;p.v.x*=.68;p.v.z*=.68;sp.multiplyScalar(.62)}''',
'''const sp=p.spin,sx=sp?sp.x:4,sy=sp?sp.y:5,sz=sp?sp.z:3;p.q.rotation.x+=sx*dt;p.q.rotation.y+=sy*dt;p.q.rotation.z+=sz*dt;
 if(p.q.position.y<.08){p.q.position.y=.08;p.v.y*=-.20;p.v.x*=.68;p.v.z*=.68;if(sp)sp.multiplyScalar(.62)}''',
'FX spin allocation'
)

path.write_text(text, encoding="utf-8")
print("v130 performance patch applied")
