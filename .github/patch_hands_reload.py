from pathlib import Path

p=Path('index.html')
s=p.read_text()

# First-person hand/reload state next to the existing gun root.
old='''const gun=new THREE.Group();cam.add(gun);scene.add(cam);let muzzle;'''
new='''const gun=new THREE.Group();cam.add(gun);scene.add(cam);let muzzle;
let playerHandRig=null,playerReloadPart=null,reloadStartedAt=0,reloadDurationMs=0,reloadWeapon="";'''
if old not in s: raise SystemExit('gun root anchor not found')
s=s.replace(old,new,1)

# Add tactical arms/hands and reload pose helpers before rebuildGun.
old='''function rebuildGun(){
 gun.traverse(o=>{if(o!==gun&&o.geometry){try{o.geometry.dispose()}catch(_){}}});
 gun.clear();'''
new='''const HAND_POSES={
 rifle:{left:[.18,-.45,-1.72],right:[.36,-.62,-.74],reload:[.10,-.16,.50]},
 smg:{left:[.18,-.46,-1.43],right:[.36,-.62,-.82],reload:[.10,-.18,.31]},
 shotgun:{left:[.17,-.43,-1.83],right:[.36,-.61,-.72],reload:[.08,-.14,.63]},
 pistol:{left:[.20,-.56,-.80],right:[.36,-.60,-.72],reload:[-.22,-.42,.34]},
 dmr:{left:[.17,-.46,-2.00],right:[.36,-.63,-.80],reload:[.10,-.16,.66]},
 grenadeLauncher:{left:[.17,-.46,-1.58],right:[.36,-.62,-.76],reload:[.09,-.13,.58]},
 m240:{left:[.15,-.45,-2.03],right:[.36,-.64,-.82],reload:[.12,.08,.72]},
 awm:{left:[.16,-.46,-2.08],right:[.36,-.64,-.82],reload:[.10,-.14,.70]}
};
function fpsArmSegment(a,b,r,mat,parent){
 const d=new THREE.Vector3().subVectors(b,a),len=d.length(),mid=new THREE.Vector3().addVectors(a,b).multiplyScalar(.5);
 const q=new THREE.Mesh(new THREE.CylinderGeometry(r*.90,r,len,8),mat);q.position.copy(mid);
 q.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());q.castShadow=false;q.receiveShadow=false;parent.add(q);return q
}
function fpsHand(parent,hand,side,glove){
 const palm=new THREE.Mesh(new THREE.SphereGeometry(.105,9,7),glove);palm.scale.set(.92,1.00,1.30);palm.position.copy(hand);palm.castShadow=false;parent.add(palm);
 const thumb=new THREE.Mesh(new THREE.CylinderGeometry(.030,.038,.13,7),glove);thumb.position.set(hand.x+(side==='left'?.085:-.085),hand.y+.015,hand.z+.025);thumb.rotation.z=side==='left'?-.75:.75;thumb.rotation.x=.28;thumb.castShadow=false;parent.add(thumb);
 for(let i=0;i<3;i++){const f=new THREE.Mesh(new THREE.CylinderGeometry(.020,.024,.13,6),glove);f.position.set(hand.x+(i-1)*.045,hand.y-.035,hand.z-.060);f.rotation.x=Math.PI/2;f.castShadow=false;parent.add(f)}
}
function addPlayerHands(){
 const pose=HAND_POSES[weapon]||HAND_POSES.rifle;
 const sleeve=M(0x27302d,.88),cuff=M(0x171b1b,.90),glove=M(0x111414,.82);
 const right=new THREE.Group(),left=new THREE.Group();right.name='RightPlayerArm';left.name='LeftPlayerArm';gun.add(right,left);
 const rs=new THREE.Vector3(.80,-1.12,.08),ls=new THREE.Vector3(-.35,-1.08,.06),rh=new THREE.Vector3(...pose.right),lh=new THREE.Vector3(...pose.left);
 const rm=new THREE.Vector3().lerpVectors(rs,rh,.58),lm=new THREE.Vector3().lerpVectors(ls,lh,.58);
 fpsArmSegment(rs,rm,.105,sleeve,right);fpsArmSegment(rm,rh,.086,cuff,right);fpsHand(right,rh,'right',glove);
 fpsArmSegment(ls,lm,.105,sleeve,left);fpsArmSegment(lm,lh,.086,cuff,left);fpsHand(left,lh,'left',glove);
 playerHandRig={right,left,pose};
}
function smoothReload01(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)}
function reloadPoseProgress(){
 if(!reloading||reloadDurationMs<=0)return{p:0,arch:0,hand:0,mag:0};
 const p=Math.max(0,Math.min(1,(performance.now()-reloadStartedAt)/reloadDurationMs));
 const arch=Math.sin(Math.PI*p);
 const hand=p<.30?smoothReload01(p/.30):p<.68?1:smoothReload01((1-p)/.32);
 const mag=p<.28?0:p<.46?smoothReload01((p-.28)/.18):p<.66?1:smoothReload01((1-p)/.34);
 return{p,arch,hand,mag};
}
function rebuildGun(){
 gun.traverse(o=>{if(o!==gun&&o.geometry){try{o.geometry.dispose()}catch(_){}}});
 gun.clear();playerHandRig=null;playerReloadPart=null;'''
if old not in s: raise SystemExit('rebuildGun anchor not found')
s=s.replace(old,new,1)

# Track the detachable magazine mesh on guns that use the magazine helper.
old=''' const magazine=(y,z,w=.22,h=.48,d=.32,ang=.08)=>{let q=part(w,h,d,metal,y,z);q.rotation.x=ang;box(w*.72,.035,d*1.03,dark,x,y+h*.22,z,gun);return q};'''
new=''' const magazine=(y,z,w=.22,h=.48,d=.32,ang=.08)=>{let q=part(w,h,d,metal,y,z);q.rotation.x=ang;q.userData.reloadHome=q.position.clone();playerReloadPart=q;box(w*.72,.035,d*1.03,dark,x,y+h*.22,z,gun);return q};'''
if old not in s: raise SystemExit('magazine helper anchor not found')
s=s.replace(old,new,1)

# Build hands after the weapon itself so they grip the final weapon layout.
old=''' muzzle=new THREE.PointLight(0xffb35a,0,4);muzzle.position.set(x,-.23,muzzleZ);gun.add(muzzle);
}'''
new=''' muzzle=new THREE.PointLight(0xffb35a,0,4);muzzle.position.set(x,-.23,muzzleZ);gun.add(muzzle);
 addPlayerHands();
}'''
if old not in s: raise SystemExit('muzzle/rebuild end anchor not found')
s=s.replace(old,new,1)

# Record reload duration/timing so visual animation is synchronized to ammo transfer.
old='''function reload(w=weapon){
 const a=ammoState[w],cap=maxMag(w);
 if(reloading||!a||a.mag===cap||a.reserve<=0||dying)return false;
 reloading=true;reloadS();show("RELOADING");
 setTimeout(()=>{
   const n=Math.min(cap-a.mag,a.reserve);
   a.mag+=n;a.reserve-=n;reloading=false;ui()
 },Math.max(420,950-reloadLevel*120));
 return true
}'''
new='''function reload(w=weapon){
 const a=ammoState[w],cap=maxMag(w);
 if(reloading||!a||a.mag===cap||a.reserve<=0||dying)return false;
 const duration=Math.max(420,950-reloadLevel*120);
 reloading=true;reloadStartedAt=performance.now();reloadDurationMs=duration;reloadWeapon=w;reloadS();show("RELOADING");
 setTimeout(()=>{
   const n=Math.min(cap-a.mag,a.reserve);
   a.mag+=n;a.reserve-=n;reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";ui()
 },duration);
 return true
}'''
if old not in s: raise SystemExit('reload function anchor not found')
s=s.replace(old,new,1)

# Layer reload motion on top of the existing recoil/ADS transform without changing ADS coordinates.
old='''playerVX=(px-lastPX)/Math.max(dt,.001);playerVZ=(pz-lastPZ)/Math.max(dt,.001);lastPX=px;lastPZ=pz;cam.position.set(px,1.65,pz);cam.rotation.order="YXZ";cam.rotation.y=yaw;cam.rotation.x=pitch;cam.rotation.z=0;recoil=Math.max(0,recoil-dt*1.35);const ac2=ads();const adsScale=1-aimBlend*.16;gun.scale.setScalar(adsScale);gun.position.x=ac2.x*adsScale*aimBlend;gun.position.z=ac2.z*aimBlend+recoil*.42;gun.position.y=ac2.y*aimBlend-recoil*.08;gun.rotation.x=(ac2.rx||0)*aimBlend+recoil*2.05;gun.rotation.y=0;gun.rotation.z=0;gun.visible=!(weapon==="awm"&&aimBlend>.88);'''
new='''playerVX=(px-lastPX)/Math.max(dt,.001);playerVZ=(pz-lastPZ)/Math.max(dt,.001);lastPX=px;lastPZ=pz;cam.position.set(px,1.65,pz);cam.rotation.order="YXZ";cam.rotation.y=yaw;cam.rotation.x=pitch;cam.rotation.z=0;recoil=Math.max(0,recoil-dt*1.35);const ac2=ads();const adsScale=1-aimBlend*.16;const rp=reloadPoseProgress();
 const reloadTilt=(weapon==="grenadeLauncher"?.34:weapon==="pistol"?.28:weapon==="shotgun"?.24:.20)*rp.arch;
 gun.scale.setScalar(adsScale);
 gun.position.x=ac2.x*adsScale*aimBlend+rp.arch*(weapon==="pistol"?.05:.10);
 gun.position.z=ac2.z*aimBlend+recoil*.42+rp.arch*.09;
 gun.position.y=ac2.y*aimBlend-recoil*.08-rp.arch*(weapon==="m240"?.12:.18);
 gun.rotation.x=(ac2.rx||0)*aimBlend+recoil*2.05+reloadTilt;
 gun.rotation.y=rp.arch*(weapon==="grenadeLauncher"?.10:.04);
 gun.rotation.z=-rp.arch*(weapon==="pistol"?.30:weapon==="grenadeLauncher"?.24:.16);
 if(playerHandRig){
   const ro=playerHandRig.pose.reload,h=rp.hand;
   playerHandRig.left.position.set(ro[0]*h,ro[1]*h,ro[2]*h);
   playerHandRig.left.rotation.set(.10*h,0,-.18*h);
   playerHandRig.right.position.set(0,-.025*rp.arch,.02*rp.arch);
   playerHandRig.right.rotation.set(.04*rp.arch,0,.05*rp.arch);
 }
 if(playerReloadPart&&playerReloadPart.userData.reloadHome){
   const home=playerReloadPart.userData.reloadHome,m=rp.mag;
   playerReloadPart.position.copy(home);playerReloadPart.position.y-=.28*m;playerReloadPart.position.z+=.08*m;
 }
 gun.visible=!(weapon==="awm"&&aimBlend>.88);'''
if old not in s: raise SystemExit('gun transform anchor not found')
s=s.replace(old,new,1)

# Reset any reload animation state on a fresh run.
old='''rebuildGun();dying=false;between=false;reloading=false;death.classList.remove("show");'''
new='''rebuildGun();dying=false;between=false;reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";death.classList.remove("show");'''
if old not in s: raise SystemExit('reset reload state anchor not found')
s=s.replace(old,new,1)

for required in ['function addPlayerHands','function reloadPoseProgress','playerHandRig.left.position.set','playerReloadPart.position.copy(home)','reloadStartedAt=performance.now()']:
    if required not in s: raise SystemExit('missing '+required)
if s.count('{')!=s.count('}') or s.count('(')!=s.count(')'):
    raise SystemExit('syntax delimiter mismatch')

p.write_text(s)
print('first-person hands and reload animation patch applied')
