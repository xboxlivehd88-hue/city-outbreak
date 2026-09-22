from pathlib import Path

p=Path('index.html')
s=p.read_text()

old='''function reloadPoseProgress(){
 if(!reloading||reloadDurationMs<=0)return{p:0,arch:0,hand:0,mag:0,grab:0};
 const p=Math.max(0,Math.min(1,(performance.now()-reloadStartedAt)/reloadDurationMs));
 const arch=Math.sin(Math.PI*p);
 const hand=p<.25?smoothReload01(p/.25):p<.76?1:smoothReload01((1-p)/.24);
 const mag=p<.22?0:p<.40?smoothReload01((p-.22)/.18):p<.76?1:smoothReload01((1-p)/.24);
 const grab=detachableMagazineReload()?(p<.28?0:p<.43?smoothReload01((p-.28)/.15):p<.50?1:p<.64?smoothReload01((.64-p)/.14):0):0;
 return{p,arch,hand,mag,grab};
}'''
new='''function reloadPoseProgress(){
 if(!reloading||reloadDurationMs<=0)return{p:0,arch:0,hand:0,pull:0,pouch:0};
 const p=Math.max(0,Math.min(1,(performance.now()-reloadStartedAt)/reloadDurationMs));
 const arch=Math.sin(Math.PI*p);
 if(!detachableMagazineReload()){
   const hand=p<.25?smoothReload01(p/.25):p<.76?1:smoothReload01((1-p)/.24);
   return{p,arch,hand,pull:0,pouch:0};
 }
 // Clear readable beats: reach mag -> pull it free -> empty hand to pouch -> fresh mag back up -> seat it.
 const hand=p<.16?smoothReload01(p/.16):p<.86?1:smoothReload01((1-p)/.14);
 const pull=p<.16?0:p<.32?smoothReload01((p-.16)/.16):1;
 const pouch=p<.30?0:p<.48?smoothReload01((p-.30)/.18):p<.56?1:p<.76?smoothReload01((.76-p)/.20):0;
 return{p,arch,hand,pull,pouch};
}'''
if old not in s: raise SystemExit('reloadPoseProgress target not found')
s=s.replace(old,new,1)

old='''function tossOldReloadMagazine(){
 if(!detachableMagazineReload()||reloadOldMagDropped||!playerReloadPart.parent)return;
 const oldMag=playerReloadPart.clone(true);oldMag.name="DiscardedMagazine";oldMag.visible=true;
 oldMag.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
 oldMag.position.copy(playerReloadPart.position);oldMag.quaternion.copy(playerReloadPart.quaternion);oldMag.scale.copy(playerReloadPart.scale);
 gun.add(oldMag);gun.updateMatrixWorld(true);scene.attach(oldMag);
 const throwV=new THREE.Vector3(-1.65,-1.15,.55).applyQuaternion(cam.quaternion);
 parts.push({q:oldMag,v:throwV,life:1.20,reloadMag:true,spin:new THREE.Vector3(7.5,5.2,8.8)});
 playerReloadPart.visible=false;reloadOldMagDropped=true;
}'''
new='''function tossOldReloadMagazine(){
 if(!detachableMagazineReload()||reloadOldMagDropped||!playerReloadPart.parent)return;
 const oldMag=playerReloadPart.clone(true);oldMag.name="DiscardedMagazine";oldMag.visible=true;
 oldMag.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
 oldMag.position.copy(playerReloadPart.position);oldMag.quaternion.copy(playerReloadPart.quaternion);oldMag.scale.copy(playerReloadPart.scale);
 gun.add(oldMag);gun.updateMatrixWorld(true);scene.attach(oldMag);
 // Keep the discarded mag in the player's view for a moment instead of firing it off-screen.
 const throwV=new THREE.Vector3(-.48,-.10,-.22).applyQuaternion(cam.quaternion);
 parts.push({q:oldMag,v:throwV,life:2.15,reloadMag:true,spin:new THREE.Vector3(4.2,3.1,5.0)});
 playerReloadPart.visible=false;reloadOldMagDropped=true;
}'''
if old not in s: raise SystemExit('tossOldReloadMagazine target not found')
s=s.replace(old,new,1)

old='''function spawnFreshReloadMagazine(){
 if(!detachableMagazineReload()||reloadFreshMag||reloadMagInserted||!playerHandRig)return;
 const fresh=playerReloadPart.clone(true);fresh.name="FreshReloadMagazine";fresh.visible=true;
 fresh.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
 playerHandRig.left.add(fresh);
 const hp=playerHandRig.pose.left;
 fresh.position.set(hp[0]+.015,hp[1]-.13,hp[2]+.055);
 const homeQ=playerReloadPart.userData.reloadHomeQuat||playerReloadPart.quaternion;
 fresh.quaternion.copy(homeQ);fresh.rotation.z+=.10;
 reloadFreshMag=fresh;reloadFreshAttached=false;
}'''
new='''function spawnFreshReloadMagazine(){
 if(!detachableMagazineReload()||reloadFreshMag||reloadMagInserted||!playerHandRig)return;
 const fresh=playerReloadPart.clone(true);fresh.name="FreshReloadMagazine";fresh.visible=true;
 fresh.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
 playerHandRig.left.add(fresh);
 const hp=playerHandRig.pose.left;
 // It appears only once the empty hand has reached the pouch area, then rides back up in that hand.
 fresh.position.set(hp[0]+.012,hp[1]-.15,hp[2]+.050);
 const homeQ=playerReloadPart.userData.reloadHomeQuat||playerReloadPart.quaternion;
 fresh.quaternion.copy(homeQ);fresh.rotation.z+=.08;
 reloadFreshMag=fresh;reloadFreshAttached=false;
}'''
if old not in s: raise SystemExit('spawnFreshReloadMagazine target not found')
s=s.replace(old,new,1)

old='''function updateReloadMagazineFX(rp){
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
}'''
new='''function updateReloadMagazineFX(rp){
 if(!reloading||!detachableMagazineReload())return;
 const home=playerReloadPart.userData.reloadHome,targetQ=playerReloadPart.userData.reloadHomeQuat||playerReloadPart.quaternion;

 // The real mag stays visible while the support hand pulls it downward out of the magwell.
 if(!reloadOldMagDropped&&home){
   const pull=rp.pull||0;
   playerReloadPart.visible=true;playerReloadPart.position.copy(home);
   playerReloadPart.position.y-=.25*pull;playerReloadPart.position.z+=.045*pull;
   playerReloadPart.quaternion.copy(targetQ);
   playerReloadPart.rotation.x+=.07*pull;
   if(rp.p>=.32)tossOldReloadMagazine();
 }

 // Intentional empty-hand gap. The replacement mag does not exist until the hand reaches the pouch.
 if(rp.p>=.56&&!reloadFreshMag&&!reloadMagInserted)spawnFreshReloadMagazine();

 // Let the hand visibly carry the new mag upward before it leaves the hand and lines up with the magwell.
 if(rp.p>=.67&&reloadFreshMag&&!reloadFreshAttached){
   playerHandRig.left.updateMatrixWorld(true);gun.attach(reloadFreshMag);
   reloadFreshInsertStart=reloadFreshMag.position.clone();reloadFreshInsertQuat=reloadFreshMag.quaternion.clone();reloadFreshAttached=true;
 }
 if(reloadFreshMag&&reloadFreshAttached&&reloadFreshInsertStart){
   const t=smoothReload01((rp.p-.67)/.17);
   reloadFreshMag.position.lerpVectors(reloadFreshInsertStart,home,t);
   reloadFreshMag.quaternion.slerpQuaternions(reloadFreshInsertQuat,targetQ,t);
   if(rp.p>=.84){
     if(reloadFreshMag.parent)reloadFreshMag.parent.remove(reloadFreshMag);
     reloadFreshMag=null;reloadFreshInsertStart=null;reloadFreshInsertQuat=null;reloadFreshAttached=false;
     playerReloadPart.position.copy(home);playerReloadPart.quaternion.copy(targetQ);playerReloadPart.visible=true;reloadMagInserted=true;
   }
 }
}'''
if old not in s: raise SystemExit('updateReloadMagazineFX target not found')
s=s.replace(old,new,1)

old=''' if(playerHandRig){
   const ro=playerHandRig.pose.reload,h=rp.hand,g=rp.grab||0;
   playerHandRig.left.position.set(ro[0]*h-.08*g,ro[1]*h-.30*g,ro[2]*h+.20*g);
   playerHandRig.left.rotation.set(.10*h+.12*g,0,-.18*h-.10*g);
   playerHandRig.right.position.set(0,-.025*rp.arch,.02*rp.arch);
   playerHandRig.right.rotation.set(.04*rp.arch,0,.05*rp.arch);
 }
 updateReloadMagazineFX(rp);'''
new=''' if(playerHandRig){
   const ro=playerHandRig.pose.reload,h=rp.hand,pull=rp.pull||0,pouch=rp.pouch||0;
   // Follow the old magazine as it is pulled free, then clearly reach away empty before returning with a fresh one.
   playerHandRig.left.position.set(ro[0]*h-.10*pouch,ro[1]*h-.24*pull-.48*pouch,ro[2]*h+.05*pull+.22*pouch);
   playerHandRig.left.rotation.set(.10*h+.11*pouch,0,-.18*h-.09*pouch);
   playerHandRig.right.position.set(0,-.025*rp.arch,.02*rp.arch);
   playerHandRig.right.rotation.set(.04*rp.arch,0,.05*rp.arch);
 }
 updateReloadMagazineFX(rp);'''
if old not in s: raise SystemExit('hand animation target not found')
s=s.replace(old,new,1)

# Give the multi-stage magazine animation enough screen time even with reload upgrades.
old=''' const duration=Math.max(420,950-reloadLevel*120);
 reloading=true;reloadStartedAt=performance.now();reloadDurationMs=duration;reloadWeapon=w;beginReloadMagazineFX();reloadS();show("RELOADING");'''
new=''' const duration=DETACHABLE_RELOAD_WEAPONS.has(w)?Math.max(760,1120-reloadLevel*90):Math.max(420,950-reloadLevel*120);
 reloading=true;reloadStartedAt=performance.now();reloadDurationMs=duration;reloadWeapon=w;beginReloadMagazineFX();reloadS();show("RELOADING");'''
if old not in s: raise SystemExit('reload duration target not found')
s=s.replace(old,new,1)

if s.count('{')!=s.count('}'): raise SystemExit('brace mismatch')
if s.count('(')!=s.count(')'): raise SystemExit('paren mismatch')

p.write_text(s)
print('reload smoothing patch applied')
