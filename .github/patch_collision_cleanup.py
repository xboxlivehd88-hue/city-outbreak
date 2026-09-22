from pathlib import Path

p=Path('index.html')
s=p.read_text()

# --- Player <-> zombie body collision helpers ---
old='''function clearKeys(){for(let k in keys)keys[k]=false}
let sprintUiPct=-1,sprintUiColor="",sprintUiState="";'''
new='''function clearKeys(){for(let k in keys)keys[k]=false}

// Soft living-body collision: prevents the player and upright zombies from
// ghosting through one another without turning enemies into rigid walls.
function zombieContactRadius(z){return z.kind==="boss"?1.05:z.kind==="crawler"?.58:.72}
function playerWorldBlocked(x,z){
 if(insideBuilding(x,z,.62))return true;
 for(const c of parkedCars)if(carPointCollision(c,x,z,.38))return true;
 return false;
}
function resolvePlayerZombieContact(oldx,oldz){
 for(const z of living()){
   if(z.dead||z.knockdown)continue;
   const minD=zombieContactRadius(z),zx=z.g.position.x,zz=z.g.position.z;
   let dx=px-zx,dz=pz-zz,d=Math.hypot(dx,dz);
   if(d>=minD)continue;
   if(d<.001){dx=oldx-zx;dz=oldz-zz;d=Math.hypot(dx,dz);if(d<.001){dx=Math.sin(yaw);dz=Math.cos(yaw);d=1}}
   const push=minD-d+.012,tx=px+dx/d*push,tz=pz+dz/d*push;
   if(!playerWorldBlocked(tx,tz)){px=tx;pz=tz}else{px=oldx;pz=oldz}
 }
}
function resolveZombiePlayerContact(z,oldx,oldz){
 if(!z||z.dead||z.knockdown)return;
 const minD=zombieContactRadius(z);
 let dx=z.g.position.x-px,dz=z.g.position.z-pz,d=Math.hypot(dx,dz);
 if(d>=minD)return;
 if(d<.001){dx=oldx-px;dz=oldz-pz;d=Math.hypot(dx,dz);if(d<.001){dx=Math.sin(z.g.rotation.y);dz=Math.cos(z.g.rotation.y);d=1}}
 const tx=px+dx/d*minD,tz=pz+dz/d*minD;
 if(!zombiePointBlocked(tx,tz,.50)){z.g.position.x=tx;z.g.position.z=tz}
 else{z.g.position.x=oldx;z.g.position.z=oldz}
}

let sprintUiPct=-1,sprintUiColor="",sprintUiState="";'''
if old not in s: raise SystemExit('clearKeys insertion point not found')
s=s.replace(old,new,1)

# Player collision after world/car collision resolution.
old='''let bp=slideBuilding(oldx,oldz,px,pz,.62);px=bp.x;pz=bp.z;
stepTimer-=dt;'''
new='''let bp=slideBuilding(oldx,oldz,px,pz,.62);px=bp.x;pz=bp.z;
resolvePlayerZombieContact(oldx,oldz);
stepTimer-=dt;'''
if old not in s: raise SystemExit('player movement collision point not found')
s=s.replace(old,new,1)

# Zombie movement collision against player.
old='''let zp=moveZombieSmart(z,ox,oz,stepX,stepZ,.50);z.g.position.x=zp.x;z.g.position.z=zp.z;

 const moved=Math.hypot(z.g.position.x-ox,z.g.position.z-oz);'''
new='''let zp=moveZombieSmart(z,ox,oz,stepX,stepZ,.50);z.g.position.x=zp.x;z.g.position.z=zp.z;
resolveZombiePlayerContact(z,ox,oz);

 const moved=Math.hypot(z.g.position.x-ox,z.g.position.z-oz);'''
if old not in s: raise SystemExit('zombie movement collision point not found')
s=s.replace(old,new,1)

# Also keep attack lunges from stepping through the player.
old='''   const ap=moveZombieSmart(z,ox,oz,ax*lunge,az*lunge,.50);z.g.position.x=ap.x;z.g.position.z=ap.z;'''
new='''   const ap=moveZombieSmart(z,ox,oz,ax*lunge,az*lunge,.50);z.g.position.x=ap.x;z.g.position.z=ap.z;resolveZombiePlayerContact(z,ox,oz);'''
if old not in s: raise SystemExit('zombie lunge collision point not found')
s=s.replace(old,new,1)

# --- Round-start corpse cleanup ---
old='''function beginBreak(){
 if(between||dying)return;'''
new='''function clearRoundCorpses(){
 // Anything still dead when the next round starts is removed in one cheap sweep.
 for(const z of zombies){if(z.dead&&z.g&&z.g.parent)releaseZombieVisual(z)}
 zombies=zombies.filter(z=>!z.dead);
 // Detached zombie limbs are corpse debris too; clear them between rounds.
 for(let i=parts.length-1;i>=0;i--){if(parts[i].limb){if(parts[i].q.parent)scene.remove(parts[i].q);parts.splice(i,1)}}
}
function beginBreak(){
 if(between||dying)return;'''
if old not in s: raise SystemExit('beginBreak insertion point not found')
s=s.replace(old,new,1)

old=''' between=false;
 if(document.pointerLockElement!==cv){try{cv.requestPointerLock?.()}catch(_){}}
 wave++;ammoState.rifle.reserve+=18+wave*2;'''
new=''' between=false;
 clearRoundCorpses();
 if(document.pointerLockElement!==cv){try{cv.requestPointerLock?.()}catch(_){}}
 wave++;ammoState.rifle.reserve+=18+wave*2;'''
if old not in s: raise SystemExit('readyNextWave cleanup point not found')
s=s.replace(old,new,1)

for required in ['function resolvePlayerZombieContact','function resolveZombiePlayerContact','function clearRoundCorpses','clearRoundCorpses();']:
    if required not in s: raise SystemExit('missing '+required)
if s.count('{')!=s.count('}') or s.count('(')!=s.count(')'):
    raise SystemExit('syntax delimiter mismatch')

p.write_text(s)
print('player/zombie collision and round corpse cleanup applied')
