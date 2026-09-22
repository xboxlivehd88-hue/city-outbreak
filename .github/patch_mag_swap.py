from pathlib import Path
import subprocess

p=Path('index.html')
s=p.read_text()
expected='420e6d4a6477543588ec54abe93bfeea70be0b9c'
actual=subprocess.check_output(['git','hash-object','index.html'],text=True).strip()
if actual!=expected:
    raise SystemExit(f'index.html changed before patch: expected {expected}, got {actual}')

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'missing patch target: {label}')
    s=s.replace(old,new,1)

rep('let playerHandRig=null,playerReloadPart=null,reloadStartedAt=0,reloadDurationMs=0,reloadWeapon="";',
'''let playerHandRig=null,playerReloadPart=null,reloadStartedAt=0,reloadDurationMs=0,reloadWeapon="",reloadOldMagDropped=false,reloadFreshMag=null,reloadFreshInsertStart=null,reloadFreshInsertQuat=null,reloadFreshAttached=false,reloadMagInserted=false;''','reload globals')

rep(''' pistol:{left:[.20,-.56,-.80],right:[.36,-.60,-.72],reload:[-.22,-.42,.34]},''',
''' pistol:{left:[.20,-.56,-.80],right:[.36,-.60,-.72],reload:[.14,-.13,.07]},''','pistol hand pose')
rep(''' m240:{left:[.15,-.45,-2.03],right:[.36,-.64,-.82],reload:[.12,.08,.72]},''',
''' m240:{left:[.15,-.45,-2.03],right:[.36,-.64,-.82],reload:[.32,-.18,.55]},''','m240 hand pose')

old='''function smoothReload01(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)}
function reloadPoseProgress(){
 if(!reloading||reloadDurationMs<=0)return{p:0,arch:0,hand:0,mag:0};
 const p=Math.max(0,Math.min(1,(performance.now()-reloadStartedAt)/reloadDurationMs));
 const arch=Math.sin(Math.PI*p);
 const hand=p<.30?smoothReload01(p/.30):p<.68?1:smoothReload01((1-p)/.32);
 const mag=p<.28?0:p<.46?smoothReload01((p-.28)/.18):p<.66?1:smoothReload01((1-p)/.34);
 return{p,arch,hand,mag};
}
'''
new='''function smoothReload01(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)}
const DETACHABLE_RELOAD_WEAPONS=new Set(["rifle","smg","pistol","dmr","m240","awm"]);
function detachableMagazineReload(w=reloadWeapon||weapon){return DETACHABLE_RELOAD_WEAPONS.has(w)&&!!playerReloadPart}
function reloadPoseProgress(){
 if(!reloading||reloadDurationMs<=0)return{p:0,arch:0,hand:0,mag:0,grab:0};
 const p=Math.max(0,Math.min(1,(performance.now()-reloadStartedAt)/reloadDurationMs));
 const arch=Math.sin(Math.PI*p);
 const hand=p<.25?smoothReload01(p/.25):p<.76?1:smoothReload01((1-p)/.24);
 const mag=p<.22?0:p<.40?smoothReload01((p-.22)/.18):p<.76?1:smoothReload01((1-p)/.24);
 const grab=detachableMagazineReload()?(p<.28?0:p<.43?smoothReload01((p-.28)/.15):p<.50?1:p<.64?smoothReload01((.64-p)/.14):0):0;
 return{p,arch,hand,mag,grab};
}
function clearReloadMagazineFX(showReal=true){
 if(reloadFreshMag&&reloadFreshMag.parent)reloadFreshMag.parent.remove(reloadFreshMag);
 reloadFreshMag=null;reloadFreshInsertStart=null;reloadFreshInsertQuat=null;reloadFreshAttached=false;
 reloadOldMagDropped=false;reloadMagInserted=false;
 if(showReal&&playerReloadPart){
   playerReloadPart.visible=true;
   if(playerReloadPart.userData.reloadHome)playerReloadPart.position.copy(playerReloadPart.userData.reloadHome);
   if(playerReloadPart.userData.reloadHomeQuat)playerReloadPart.quaternion.copy(playerReloadPart.userData.reloadHomeQuat);
 }
}
function beginReloadMagazineFX(){
 clearReloadMagazineFX(true);
 reloadOldMagDropped=false;reloadMagInserted=false;
}
function tossOldReloadMagazine(){
 if(!detachableMagazineReload()||reloadOldMagDropped||!playerReloadPart.parent)return;
 const oldMag=playerReloadPart.clone(true);oldMag.name="DiscardedMagazine";oldMag.visible=true;
 oldMag.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
 oldMag.position.copy(playerReloadPart.position);oldMag.quaternion.copy(playerReloadPart.quaternion);oldMag.scale.copy(playerReloadPart.scale);
 gun.add(oldMag);gun.updateMatrixWorld(true);scene.attach(oldMag);
 const throwV=new THREE.Vector3(-1.65,-1.15,.55).applyQuaternion(cam.quaternion);
 parts.push({q:oldMag,v:throwV,life:1.20,reloadMag:true,spin:new THREE.Vector3(7.5,5.2,8.8)});
 playerReloadPart.visible=false;reloadOldMagDropped=true;
}
function spawnFreshReloadMagazine(){
 if(!detachableMagazineReload()||reloadFreshMag||reloadMagInserted||!playerHandRig)return;
 const fresh=playerReloadPart.clone(true);fresh.name="FreshReloadMagazine";fresh.visible=true;
 fresh.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
 playerHandRig.left.add(fresh);
 const hp=playerHandRig.pose.left;
 fresh.position.set(hp[0]+.015,hp[1]-.13,hp[2]+.055);
 const homeQ=playerReloadPart.userData.reloadHomeQuat||playerReloadPart.quaternion;
 fresh.quaternion.copy(homeQ);fresh.rotation.z+=.10;
 reloadFreshMag=fresh;reloadFreshAttached=false;
}
function updateReloadMagazineFX(rp){
 if(!reloading||!detachableMagazineReload())return;
 if(rp.p>=.22&&!reloadOldMagDropped)tossOldReloadMagazine();
 if(rp.p>=.38&&!reloadFreshMag&&!reloadMagInserted)spawnFreshReloadMagazine();
 if(rp.p>=.54&&reloadFreshMag&&!reloadFreshAttached){
   playerHandRig.left.updateMatrixWorld(true);gun.attach(reloadFreshMag);
   reloadFreshInsertStart=reloadFreshMag.position.clone();reloadFreshInsertQuat=reloadFreshMag.quaternion.clone();reloadFreshAttached=true;
 }
 if(reloadFreshMag&&reloadFreshAttached&&reloadFreshInsertStart){
   const t=smoothReload01((rp.p-.54)/.22),home=playerReloadPart.userData.reloadHome;
   reloadFreshMag.position.lerpVectors(reloadFreshInsertStart,home,t);
   const targetQ=playerReloadPart.userData.reloadHomeQuat||playerReloadPart.quaternion;
   reloadFreshMag.quaternion.slerpQuaternions(reloadFreshInsertQuat,targetQ,t);
   if(rp.p>=.76){
     if(reloadFreshMag.parent)reloadFreshMag.parent.remove(reloadFreshMag);
     reloadFreshMag=null;reloadFreshInsertStart=null;reloadFreshInsertQuat=null;reloadFreshAttached=false;
     playerReloadPart.position.copy(home);playerReloadPart.quaternion.copy(targetQ);playerReloadPart.visible=true;reloadMagInserted=true;
   }
 }
}
function finishReloadMagazineFX(){clearReloadMagazineFX(true)}
'''
rep(old,new,'reload helper block')

rep('''function rebuildGun(){
 gun.traverse(o=>{if(o!==gun&&o.geometry){try{o.geometry.dispose()}catch(_){}}});
 gun.clear();playerHandRig=null;playerReloadPart=null;''',
'''function rebuildGun(){
 clearReloadMagazineFX(true);
 gun.traverse(o=>{if(o!==gun&&o.geometry){try{o.geometry.dispose()}catch(_){}}});
 gun.clear();playerHandRig=null;playerReloadPart=null;''','rebuild cleanup')

rep(''' const magazine=(y,z,w=.22,h=.48,d=.32,ang=.08)=>{let q=part(w,h,d,metal,y,z);q.rotation.x=ang;q.userData.reloadHome=q.position.clone();playerReloadPart=q;box(w*.72,.035,d*1.03,dark,0,h*.22,0,q);return q};''',
''' const magazine=(y,z,w=.22,h=.48,d=.32,ang=.08)=>{let q=part(w,h,d,metal,y,z);q.rotation.x=ang;q.userData.reloadHome=q.position.clone();q.userData.reloadHomeQuat=q.quaternion.clone();playerReloadPart=q;box(w*.72,.035,d*1.03,dark,0,h*.22,0,q);return q};''','magazine home rotation')

rep('''   let pg=grip(-.61,-.72,-.18,rubber);pg.scale.x=.92;pg.scale.z=.86;
   cyl(.043,.55,steel,x,-.205,-1.38);box(.17,.025,.30,dark,x,-.58,-.72,gun);''',
'''   let pg=grip(-.61,-.72,-.18,rubber);pg.scale.x=.92;pg.scale.z=.86;
   magazine(-.69,-.73,.12,.32,.14,-.02);
   cyl(.043,.55,steel,x,-.205,-1.38);box(.17,.025,.30,dark,x,-.58,-.72,gun);''','pistol magazine')

rep('''   let can=bevelBox(.32,.38,.34,M(0x4f5a43,.72),x+.30,-.66,-1.48,gun);can.rotation.x=.03;
   box(.34,.040,.36,dark,x+.30,-.45,-1.48,gun);''',
'''   let can=bevelBox(.32,.38,.34,M(0x4f5a43,.72),x+.30,-.66,-1.48,gun);can.rotation.x=.03;
   can.userData.reloadHome=can.position.clone();can.userData.reloadHomeQuat=can.quaternion.clone();playerReloadPart=can;
   box(.34,.040,.36,dark,0,.21,0,can);''','m240 ammo box reload part')

rep('''function setWeapon(w){if(!unlocked[w])return;stopAuto();setAim(false);weapon=w;rebuildGun();weaponNameEl.textContent=wd().name;show(wd().name);ui()}''',
'''function setWeapon(w){if(reloading||!unlocked[w])return;stopAuto();setAim(false);weapon=w;rebuildGun();weaponNameEl.textContent=wd().name;show(wd().name);ui()}''','weapon switch reload guard')

rep(''' reloading=true;reloadStartedAt=performance.now();reloadDurationMs=duration;reloadWeapon=w;reloadS();show("RELOADING");
 setTimeout(()=>{
   const n=Math.min(cap-a.mag,a.reserve);
   a.mag+=n;a.reserve-=n;reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";ui()
 },duration);''',
''' reloading=true;reloadStartedAt=performance.now();reloadDurationMs=duration;reloadWeapon=w;beginReloadMagazineFX();reloadS();show("RELOADING");
 setTimeout(()=>{
   const n=Math.min(cap-a.mag,a.reserve);
   a.mag+=n;a.reserve-=n;finishReloadMagazineFX();reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";ui()
 },duration);''','reload lifecycle')

old=''' if(playerHandRig){
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
'''
new=''' if(playerHandRig){
   const ro=playerHandRig.pose.reload,h=rp.hand,g=rp.grab||0;
   playerHandRig.left.position.set(ro[0]*h-.08*g,ro[1]*h-.30*g,ro[2]*h+.20*g);
   playerHandRig.left.rotation.set(.10*h+.12*g,0,-.18*h-.10*g);
   playerHandRig.right.position.set(0,-.025*rp.arch,.02*rp.arch);
   playerHandRig.right.rotation.set(.04*rp.arch,0,.05*rp.arch);
 }
 updateReloadMagazineFX(rp);
'''
rep(old,new,'move reload hand and mag')

rep('''if(p.limb){
 const sp=p.spin||new THREE.Vector3(4,5,3);p.q.rotation.x+=sp.x*dt;p.q.rotation.y+=sp.y*dt;p.q.rotation.z+=sp.z*dt;
 if(p.q.position.y<.08){p.q.position.y=.08;p.v.y*=-.20;p.v.x*=.68;p.v.z*=.68;sp.multiplyScalar(.62)}
}''',
'''if(p.limb||p.reloadMag){
 const sp=p.spin||new THREE.Vector3(4,5,3);p.q.rotation.x+=sp.x*dt;p.q.rotation.y+=sp.y*dt;p.q.rotation.z+=sp.z*dt;
 if(p.q.position.y<.08){p.q.position.y=.08;p.v.y*=-.20;p.v.x*=.68;p.v.z*=.68;sp.multiplyScalar(.62)}
}''','thrown magazine physics')

if s.count('{')!=s.count('}') or s.count('(')!=s.count(')'):
    raise SystemExit('delimiter mismatch after patch')
for marker in ['tossOldReloadMagazine','spawnFreshReloadMagazine','updateReloadMagazineFX(rp)','DiscardedMagazine','FreshReloadMagazine']:
    if marker not in s:
        raise SystemExit(f'missing result marker {marker}')
p.write_text(s)
print('magazine swap reload patch applied')
