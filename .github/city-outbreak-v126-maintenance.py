from pathlib import Path

path = Path("index.html")
text = path.read_text(encoding="utf-8")


def replace_once(old: str, new: str, label: str):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text = text.replace(old, new, 1)


# 1) Shotgun shells get a short per-shell sound instead of scheduling the full
# magazine reload sound (which contains delayed tones) on every shell.
replace_once(
    'reloadS=()=>{tone(620,.04,"square",.1);setTimeout(()=>tone(390,.05,"square",.11),250);setTimeout(()=>tone(720,.04,"square",.1),600)},pickupS=',
    'reloadS=()=>{tone(620,.04,"square",.1);setTimeout(()=>tone(390,.05,"square",.11),250);setTimeout(()=>tone(720,.04,"square",.1),600)},shellLoadS=()=>{tone(470,.035,"square",.085);tone(720,.025,"square",.055,.035)},pickupS=',
    "shotgun shell sound",
)

# 2) Cache static navigation-cell collision results. Buildings and parked cars do
# not move, so A* should not re-test the same grid cells against every collider.
replace_once(
    'const ZNAV_CELL=2.0,ZNAV_PAD=.56,ZNAV_MAX_NODES=1300;\nfunction zombieRouteClear',
    '''const ZNAV_CELL=2.0,ZNAV_PAD=.56,ZNAV_MAX_NODES=1300;\nconst ZNAV_BLOCK_CACHE=new Map();\nfunction navCellBlocked(ix,iz){\n const key=ix+","+iz;\n if(ZNAV_BLOCK_CACHE.has(key))return ZNAV_BLOCK_CACHE.get(key);\n const blocked=zombiePointBlocked(ix*ZNAV_CELL,iz*ZNAV_CELL,ZNAV_PAD);\n ZNAV_BLOCK_CACHE.set(key,blocked);return blocked\n}\nfunction zombieRouteClear''',
    "nav cache definition",
)
replace_once(
    'const open=(x,z)=>x>=minX&&x<=maxX&&z>=minZ&&z<=maxZ&&!zombiePointBlocked(x*ZNAV_CELL,z*ZNAV_CELL,ZNAV_PAD);',
    'const open=(x,z)=>x>=minX&&x<=maxX&&z>=minZ&&z<=maxZ&&!navCellBlocked(x,z);',
    "nav nearest open cache",
)
replace_once(
    '''if(zombiePointBlocked(nx*cell,nz*cell,ZNAV_PAD))continue;\n     if(d[0]&&d[1]){\n       if(zombiePointBlocked((cur.x+d[0])*cell,cur.z*cell,ZNAV_PAD)||\n          zombiePointBlocked(cur.x*cell,(cur.z+d[1])*cell,ZNAV_PAD))continue;\n     }''',
    '''if(navCellBlocked(nx,nz))continue;\n     if(d[0]&&d[1]){\n       if(navCellBlocked(cur.x+d[0],cur.z)||navCellBlocked(cur.x,cur.z+d[1]))continue;\n     }''',
    "A-star nav cache",
)

# 3) Generation counters cancel old async work when a new game starts.
replace_once(
    'reloadFreshAttached=false,reloadMagInserted=false;',
    'reloadFreshAttached=false,reloadMagInserted=false,reloadSequence=0,runSequence=0;',
    "async sequence state",
)

# 4) Dispose per-zombie GPU resources once the zombie is permanently removed.
replace_once(
    '''function releaseZombieVisual(z){\n if(!z)return;\n if(z.mixer){z.mixer.stopAllAction();if(z.rigVisual)z.mixer.uncacheRoot(z.rigVisual)}\n if(z.rigMaterials){for(const m of z.rigMaterials){try{m.dispose()}catch(_){}}z.rigMaterials.length=0}\n if(z.g&&z.g.parent)scene.remove(z.g)\n}''',
    '''function releaseZombieVisual(z){\n if(!z)return;\n if(z.mixer){z.mixer.stopAllAction();if(z.rigVisual)z.mixer.uncacheRoot(z.rigVisual)}\n if(z.rigMaterials){for(const m of z.rigMaterials){try{m.dispose()}catch(_){}}z.rigMaterials.length=0}\n if(z.ownedGeometries){for(const geo of z.ownedGeometries){try{geo.dispose()}catch(_){}}z.ownedGeometries.length=0}\n if(z.ownedMaterials){for(const m of z.ownedMaterials){try{m.dispose()}catch(_){}}z.ownedMaterials.length=0}\n if(z.g&&z.g.parent)scene.remove(z.g)\n}''',
    "zombie resource cleanup",
)
replace_once(
    ''' let hazardMist=null;\n if(kind==="radiated"||kind==="acidic"){\n   const mc=kind==="radiated"?0x38ff59:0xb81616;\n   hazardMist=new THREE.Mesh(new THREE.SphereGeometry(.38,8,6),new THREE.MeshBasicMaterial({color:mc,transparent:true,opacity:kind==="radiated"?.09:.13,depthWrite:false}));\n   hazardMist.scale.set(1.0,1.55,1.0);hazardMist.position.y=1.02;g.add(hazardMist);\n }\n\n let marker=null;''',
    ''' let hazardMist=null;\n if(kind==="radiated"||kind==="acidic"){\n   const mc=kind==="radiated"?0x38ff59:0xb81616;\n   hazardMist=new THREE.Mesh(new THREE.SphereGeometry(.38,8,6),new THREE.MeshBasicMaterial({color:mc,transparent:true,opacity:kind==="radiated"?.09:.13,depthWrite:false}));\n   hazardMist.scale.set(1.0,1.55,1.0);hazardMist.position.y=1.02;g.add(hazardMist);\n }\n const ownedMaterials=[eyeMat];\n if(patchMat!==wound)ownedMaterials.push(patchMat);\n if(torsoPatch!==wound&&torsoPatch!==patchMat)ownedMaterials.push(torsoPatch);\n if(hazardMist&&hazardMist.material)ownedMaterials.push(hazardMist.material);\n\n let marker=null;''',
    "owned zombie materials",
)
replace_once(
    'let zz={g,head,torso,armL,armR,legL,legR,chest,stomach,pelvis,neck,jaw,marker,mouth,shoulderL,shoulderR,elbowL,elbowR,kneeL,kneeR,jacket,hazardMist,',
    'let zz={g,head,torso,armL,armR,legL,legR,chest,stomach,pelvis,neck,jaw,marker,mouth,shoulderL,shoulderR,elbowL,elbowR,kneeL,kneeR,jacket,hazardMist,ownedMaterials,ownedGeometries:null,',
    "zombie ownership state",
)
replace_once(
    ''' attachRiggedZombie(zz,g,kind,i,hazardMist);\n if(kind==="boss"&&zz.rigVisual){''',
    ''' const ownedGeometrySet=new Set();\n g.traverse(o=>{if(o.isMesh&&o.geometry)ownedGeometrySet.add(o.geometry)});\n zz.ownedGeometries=[...ownedGeometrySet];\n attachRiggedZombie(zz,g,kind,i,hazardMist);\n if(kind==="boss"&&zz.rigVisual){''',
    "owned zombie geometries",
)
replace_once(
    '''bossChestHitbox.position.set(0,1.43,-.035);bossChestHitbox.userData.part="torso";bossChestHitbox.name="BossChestHitbox";g.add(bossChestHitbox);\n   zz.bossChestHitbox=bossChestHitbox;''',
    '''bossChestHitbox.position.set(0,1.43,-.035);bossChestHitbox.userData.part="torso";bossChestHitbox.name="BossChestHitbox";g.add(bossChestHitbox);\n   zz.bossChestHitbox=bossChestHitbox;zz.ownedGeometries.push(bossChestHitbox.geometry);zz.ownedMaterials.push(bossHitMat);''',
    "boss hitbox ownership",
)

# 5) Keep the convenient living() array where an array is actually needed, but
# use a count/direct iteration in hot paths to avoid short-lived arrays every frame.
replace_once(
    '''const living=()=>zombies.filter(z=>!z.dead);\nconst MAX_ACTIVE_ZOMBIES=20;\nconst waveRemainingCount=()=>living().length+Math.max(0,waveTarget-waveSpawned);''',
    '''const living=()=>zombies.filter(z=>!z.dead);\nfunction livingCount(){let n=0;for(const z of zombies)if(!z.dead)n++;return n}\nconst MAX_ACTIVE_ZOMBIES=20;\nconst waveRemainingCount=()=>livingCount()+Math.max(0,waveTarget-waveSpawned);''',
    "living count helper",
)
replace_once(
    '''function spawnQueuedZombies(){\n if(!running||dying||between)return;\n while(living().length<MAX_ACTIVE_ZOMBIES&&waveSpawned<waveTarget){\n   spawnOneZombie(waveSpawned);\n   waveSpawned++;\n }\n}''',
    '''function spawnQueuedZombies(){\n if(!running||dying||between)return;\n let activeCount=livingCount();\n while(activeCount<MAX_ACTIVE_ZOMBIES&&waveSpawned<waveTarget){\n   spawnOneZombie(waveSpawned);\n   waveSpawned++;activeCount++;\n }\n}''',
    "spawn queue allocations",
)
replace_once(
    '''function resolvePlayerZombieContact(oldx,oldz){\n for(const z of living()){''',
    '''function resolvePlayerZombieContact(oldx,oldz){\n for(const z of zombies){''',
    "player contact allocations",
)
replace_once(
    'for(const z of living())z.g.traverse(o=>{if(o.isMesh)targets.push(o)});',
    'for(const z of zombies){if(z.dead)continue;z.g.traverse(o=>{if(o.isMesh)targets.push(o)})}',
    "weapon target allocations",
)
replace_once(
    '''if(!impact){for(const z of living()){\n     const dx=g.q.position.x-z.g.position.x,dz=g.q.position.z-z.g.position.z;''',
    '''if(!impact){for(const z of zombies){\n     if(z.dead)continue;\n     const dx=g.q.position.x-z.g.position.x,dz=g.q.position.z-z.g.position.z;''',
    "launcher collision allocations",
)
replace_once(
    'const highlightLast=waveRemainingCount()<=5&&!currentBoss;',
    'const highlightLast=(active.length+Math.max(0,waveTarget-waveSpawned))<=5&&!currentBoss;',
    "last zombie count allocation",
)
replace_once(
    '''const fps=Math.round(perfFrames/Math.max(.001,perfTime)),avg=(perfTime/perfFrames*1000).toFixed(1),ri=ren.info.render;\n   perfHud.textContent="PERFORMANCE\\nFPS "+fps+"  AVG "+avg+"ms  MAX "+perfMaxMs.toFixed(1)+"ms\\nDRAWS "+ri.calls+"  TRIANGLES "+ri.triangles+"\\nZOMBIES "+living().length+"  FX "+(parts.length+impacts.length+casings.length)+"\\nPIXEL RATIO "+ren.getPixelRatio().toFixed(2);\n   console.log("CityOutbreak perf",{fps,avgMs:avg,maxMs:perfMaxMs.toFixed(1),zombies:living().length,parts:parts.length,impacts:impacts.length,casings:casings.length,renderer:ri});''',
    '''const fps=Math.round(perfFrames/Math.max(.001,perfTime)),avg=(perfTime/perfFrames*1000).toFixed(1),ri=ren.info.render,liveCount=livingCount();\n   perfHud.textContent="PERFORMANCE\\nFPS "+fps+"  AVG "+avg+"ms  MAX "+perfMaxMs.toFixed(1)+"ms\\nDRAWS "+ri.calls+"  TRIANGLES "+ri.triangles+"\\nZOMBIES "+liveCount+"  FX "+(parts.length+impacts.length+casings.length)+"\\nPIXEL RATIO "+ren.getPixelRatio().toFixed(2);\n   console.log("CityOutbreak perf",{fps,avgMs:avg,maxMs:perfMaxMs.toFixed(1),zombies:liveCount,parts:parts.length,impacts:impacts.length,casings:casings.length,renderer:ri});''',
    "debug perf allocations",
)

# 6) Zombie separation only needs a sqrt for neighbors inside the separation
# radius. The old loop performed Math.hypot for every active zombie pair.
replace_once(
    'for(const o of active){if(o===z)continue;let ox=z.g.position.x-o.g.position.x,oz=z.g.position.z-o.g.position.z,od=Math.hypot(ox,oz);if(od>0&&od<1.65){sepX+=ox/od*(1.65-od);sepZ+=oz/od*(1.65-od)}}',
    '''for(const o of active){\n   if(o===z)continue;\n   const ox=z.g.position.x-o.g.position.x,oz=z.g.position.z-o.g.position.z,od2=ox*ox+oz*oz;\n   if(od2>0&&od2<2.7225){const od=Math.sqrt(od2),push=(1.65-od)/od;sepX+=ox*push;sepZ+=oz*push}\n }''',
    "zombie separation math",
)

# 7) Reload timers are stateful. Guard them with a sequence so a timer from a
# previous run can never finish/cancel a newer reload. Shotgun shell loops use
# their compact per-shell sound.
old_reload = '''function reload(w=weapon){\n const a=ammoState[w],cap=maxMag(w);\n if(reloading||!a||a.mag===cap||a.reserve<=0||dying)return false;\n setAim(false);\n if(w==="shotgun"){\n   const shellDuration=Math.max(360,560-reloadLevel*45);\n   const finishShotgunReload=()=>{\n     finishReloadMagazineFX();reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";ui()\n   };\n   const loadShell=()=>{\n     if(!reloading||reloadWeapon!==w)return;\n     if(dying||a.mag>=cap||a.reserve<=0){finishShotgunReload();return}\n     reloadStartedAt=performance.now();reloadDurationMs=shellDuration;reloadS();\n     setTimeout(()=>{\n       if(!reloading||reloadWeapon!==w)return;\n       if(!dying&&a.mag<cap&&a.reserve>0){a.mag++;a.reserve--;ui()}\n       if(dying||a.mag>=cap||a.reserve<=0)finishShotgunReload();\n       else loadShell()\n     },shellDuration)\n   };\n   reloading=true;reloadWeapon=w;beginReloadMagazineFX();show("RELOADING");loadShell();return true\n }\n const duration=DETACHABLE_RELOAD_WEAPONS.has(w)?Math.max(760,1120-reloadLevel*90):Math.max(420,950-reloadLevel*120);\n reloading=true;reloadStartedAt=performance.now();reloadDurationMs=duration;reloadWeapon=w;beginReloadMagazineFX();reloadS();show("RELOADING");\n setTimeout(()=>{\n   const n=Math.min(cap-a.mag,a.reserve);\n   a.mag+=n;a.reserve-=n;finishReloadMagazineFX();reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";ui()\n },duration);\n return true\n}'''
new_reload = '''function reload(w=weapon){\n const a=ammoState[w],cap=maxMag(w);\n if(reloading||!a||a.mag===cap||a.reserve<=0||dying)return false;\n const seq=++reloadSequence;\n setAim(false);\n if(w==="shotgun"){\n   const shellDuration=Math.max(360,560-reloadLevel*45);\n   const finishShotgunReload=()=>{\n     if(seq!==reloadSequence)return;\n     finishReloadMagazineFX();reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";ui()\n   };\n   const loadShell=()=>{\n     if(seq!==reloadSequence||!reloading||reloadWeapon!==w)return;\n     if(dying||a.mag>=cap||a.reserve<=0){finishShotgunReload();return}\n     reloadStartedAt=performance.now();reloadDurationMs=shellDuration;shellLoadS();\n     setTimeout(()=>{\n       if(seq!==reloadSequence||!reloading||reloadWeapon!==w)return;\n       if(!dying&&a.mag<cap&&a.reserve>0){a.mag++;a.reserve--;ui()}\n       if(dying||a.mag>=cap||a.reserve<=0)finishShotgunReload();\n       else loadShell()\n     },shellDuration)\n   };\n   reloading=true;reloadWeapon=w;beginReloadMagazineFX();show("RELOADING");loadShell();return true\n }\n const duration=DETACHABLE_RELOAD_WEAPONS.has(w)?Math.max(760,1120-reloadLevel*90):Math.max(420,950-reloadLevel*120);\n reloading=true;reloadStartedAt=performance.now();reloadDurationMs=duration;reloadWeapon=w;beginReloadMagazineFX();reloadS();show("RELOADING");\n setTimeout(()=>{\n   if(seq!==reloadSequence||!reloading||reloadWeapon!==w)return;\n   const n=Math.min(cap-a.mag,a.reserve);\n   a.mag+=n;a.reserve-=n;finishReloadMagazineFX();reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";ui()\n },duration);\n return true\n}'''
replace_once(old_reload, new_reload, "reload sequence guard")

# 8) Guard other delayed gameplay actions that could survive a restart.
replace_once(
    '''tone(392,.18,"square",.12);tone(523,.2,"square",.14,.18);\n setTimeout(()=>{announce.classList.remove("show");openShop()},850);''',
    '''tone(392,.18,"square",.12);tone(523,.2,"square",.14,.18);\n const breakRun=runSequence;\n setTimeout(()=>{if(breakRun!==runSequence||!between||dying)return;announce.classList.remove("show");openShop()},850);''',
    "wave break restart guard",
)
replace_once(
    '''nukes--;nukeInProgress=true;ui();stopAuto();\n big.textContent="TACTICAL NUKE";''',
    '''nukes--;nukeInProgress=true;ui();stopAuto();\n const nukeRun=runSequence;\n big.textContent="TACTICAL NUKE";''',
    "nuke run capture",
)
replace_once(
    '''setTimeout(()=>{\n   if(!running||dying){nukeInProgress=false;return}\n   announce.classList.remove("show");''',
    '''setTimeout(()=>{\n   if(nukeRun!==runSequence)return;\n   if(!running||dying){nukeInProgress=false;return}\n   announce.classList.remove("show");''',
    "nuke restart guard",
)
replace_once(
    'function reset(){initAudio();stopAuto();clearKeys();',
    'function reset(){runSequence++;reloadSequence++;initAudio();stopAuto();clearKeys();',
    "reset generation bump",
)

path.write_text(text, encoding="utf-8")
print("v126 maintenance patch applied")
