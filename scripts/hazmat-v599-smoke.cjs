// v695 final synchronized loader: run against committed index.html game.js?v=695 and approved two-natural-crawler rotation.
const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("fs");
// v680 DMR source geometry audit: inspect user's real uploaded GLB, not a
// guessed procedural replacement. Print bounded node, accessor and material
// facts into the browser CI log for correct first-person orientation/scale.
try{
 const bin=fs.readFileSync("assets/norinco_m305a.glb");
 const jsonBytes=bin.readUInt32LE(12),tag=bin.toString("ascii",16,20);
 if(tag!=="JSON")throw Error("GLB JSON header missing: "+tag);
 const gltf=JSON.parse(bin.toString("utf8",20,20+jsonBytes));
 const meshFacts=(gltf.meshes||[]).slice(0,24).map((m,i)=>({
  index:i,name:m.name,
  surfaces:m.primitives?.map(p=>{
   const a=gltf.accessors?.[p.attributes?.POSITION];
   return{min:a?.min,max:a?.max,faces:gltf.accessors?.[p.indices]?.count,
    material:gltf.materials?.[p.material]?.name};
  }).slice(0,6)
 }));
 console.log("DMR_SOURCE_GLB_AUDIT="+JSON.stringify({
  bytes:bin.length,nodes:(gltf.nodes||[]).slice(0,35).map((n,i)=>({
   i,name:n.name,mesh:n.mesh,translation:n.translation,rotation:n.rotation,scale:n.scale,
   matrix:n.matrix?.slice(0,16)})),
  meshes:meshFacts,materials:(gltf.materials||[]).map(m=>m.name).slice(0,18),
  animations:(gltf.animations||[]).map(a=>a.name),scenes:gltf.scenes?.length
 }));
}catch(error){console.log("DMR_SOURCE_GLB_AUDIT_ERROR="+String(error))}

(async()=>{
 let browser,page;const report={build:658,passed:false},errors=[];
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  page=await browser.newPage({viewport:{width:1200,height:800}});
  page.on("pageerror",e=>errors.push(String(e)));
  page.on("console",msg=>{
   if(/THREE\\.WebGLProgram|Shader Error|shader compilation|program link/i.test(msg.text()))
    errors.push("SHADER: "+msg.text().slice(0,500));
  });
  page.on("response",r=>{if(r.url().includes("/assets/zombie_hazmat.glb"))report.assetHttp=r.status()});
  await page.route(/\/src\/game\.js\?v=695$/,async route=>{
   const rsp=await route.fetch(),src=await rsp.text();
   const extraAudit="\n;globalThis.__hazmatLifecycleAudit=()=>{\n const all=zombies.filter(z=>z.kind===\"acidic\"&&!z.dead&&z.hazmatVisual);\n if(all.length<3)throw Error(\"Not enough Hazmat test actors\");\n const normal=all[0],crawler=all[1];\n // Release the first actor directly into the game PBD, never a canned pose.\n const origin=normal.g.position.clone().add(new THREE.Vector3(0,1,1));\n const initial=normal.hazmatVisual.position.clone();\n killZ(normal,false,origin,1.5);\n const isNative=normal.ragdoll?.bodyPbd?.holder===normal.hazmatVisual;\n const originalBones=normal.hazmatBones?.size||0;\n for(let i=0;i<24;i++)updateRagdoll(normal,1/60);\n const ragTravel=normal.hazmatVisual.position.distanceTo(initial);\n // Detaching each leg must not spawn the hidden generic leg debris.\n crawler.hp=Math.max(40,crawler.hp);const sameRoot=crawler.g,originalModel=crawler.hazmatModel;\n const beforeParts=parts.filter(p=>p.limb).length;\n detachLeg(crawler,\"left\");\n const afterOne={left:crawler.leftLegDetached,right:crawler.rightLegDetached,\n  nativeHidden:crawler.hazmatBones.get(\"L_UpperLeg\").scale.x<.001,\n  parts:parts.filter(p=>p.limb).length-beforeParts,modelSame:crawler.hazmatModel===originalModel};\n detachLeg(crawler,\"right\");\n hazmatZombie.sync(crawler,.016);\n const afterTwo={kind:crawler.kind,ownerStillPresent:zombies.includes(crawler),\n  sameRoot:crawler.g===sameRoot,modelSame:crawler.hazmatModel===originalModel,\n  crawler:crawler.hazmatCrawler,visual:crawler.hazmatVisual?.name,\n  bothHidden:crawler.hazmatBones.get(\"L_UpperLeg\").scale.x<.001&&\n   crawler.hazmatBones.get(\"R_UpperLeg\").scale.x<.001,\n  headHitbox:crawler.hitMeshes.some(o=>o.userData.isHead),\n  bodyHitbox:crawler.hitMeshes.some(o=>o.userData.part===\"torso\")};\n // Native user grenade GLB, no fake explosion geometry or extra damage code.\n const grenade=grenadeModelTemplate?.clone(true);\n let explosionMs=null;\n if(grenade){grenade.position.copy(crawler.g.position).add(new THREE.Vector3(0,1,.35));\n  scene.add(grenade);\n  const before=performance.now();\n  explodeGrenade({q:grenade});\n  explosionMs=performance.now()-before;\n }\n return {isNative,originalBones,ragTravel,afterOne,afterTwo,\n  explosionMs,reportedExplosionMs:document.documentElement.dataset.lastGrenadeLogicMs};\n};\n";
   const injected="\n;globalThis.__hazmatSmoke={\n ready:()=>newCityCollisionReady&&hazmatZombie.status().loaded,\n forceHazmats:()=>{for(let i=0;i<10;i++)makeZombie(px+8+i*.25,pz+8+i*.25,300+i,'acidic')},\n snapshot:()=>{\n  const live=zombies.filter(z=>!z.dead&&z.kind==='acidic'),hz=live.filter(z=>z.hazmatVisual),z=hz[0],meshes=[],bones=[];\n  z?.hazmatModel?.traverse(o=>{\n   if(o.isBone)bones.push(o.name);\n   if(o.isSkinnedMesh)meshes.push({name:o.name,map:!!o.material?.map,vertices:o.geometry?.getAttribute(\"position\")?.count||0});\n  });\n  const box=z?.hazmatVisual?new THREE.Box3().setFromObject(z.hazmatVisual,true):null;\n  return {\n   build:document.documentElement.dataset.cityOutbreakBuild,wave,waveTarget,waveSpawned,\n   live:live.length,kinds:[...new Set(live.map(z=>z.kind))],\n   acidic:live.filter(z=>z.kind===\"acidic\").length,boss:live.filter(z=>z.kind===\"boss\").length,\n   attached:hz.length,original:z?.hazmatModel?.name,meshes,bones:bones.length,\n   leftLeg:bones.some(n=>/leftleg/i.test(n)),rightLeg:bones.some(n=>/rightleg/i.test(n)),\n   height:box?.getSize(new THREE.Vector3()).y,scale:z?.hazmatVisual?.scale.x,\n   clips:Object.keys(z?.hazmatActions||{}),mist:hz.some(a=>a.hazardMist?.visible===true),mistObjects:hz.filter(a=>!!a.hazardMist).length,\n   hidden:z?.rigVisual?(()=>{let seen=0;z.rigVisual.traverse(o=>{if(o.isMesh&&o.visible)seen++});return seen===0})():false,\n   headHits:z?.hitMeshes?.filter(o=>o.userData?.part===\"head\").length,\n   torsoHits:z?.hitMeshes?.filter(o=>o.userData?.part===\"torso\").length,\n   pool:BOSS_NAME_POOL.length,armTuning:hazmatZombie.status().armTuning,attachStatus:hazmatZombie.status()\n  };\n },\n motion:()=>{\n  const z=zombies.find(z=>!z.dead&&z.kind===\"acidic\"&&z.hazmatMixer);\n  if(!z)return null;\n  const mixer=z.hazmatMixer,walk=z.hazmatActions.Zombie_Walk_Root,bones=[];\n  z.hazmatModel.traverse(o=>{if(o.isBone&&/leftleg|rightleg|leftupleg|rightupleg/i.test(o.name))bones.push(o)});\n  for(const action of Object.values(z.hazmatActions))action.stop();\n  walk.reset().play();walk.timeScale=1;\n  const pose=t=>{mixer.setTime(t);return bones.map(b=>b.quaternion.clone())};\n  const a=pose(.21),b=pose(1.35);\n  return {clip:walk.getClip().name,angles:a.map((q,i)=>q.angleTo(b[i]))};\n }\n};";
   const postureAudit="\n;globalThis.__hazmatPostureAudit=()=>{\n const crawler=zombies.find(z=>z.hazmatCrawler&&!z.dead);\n const walker=zombies.find(z=>z.kind===\"acidic\"&&!z.dead&&z.hazmatVisual);\n if(!crawler||!walker)throw new Error(\"Missing original Hazmat crawler/walker\");\n const v=new THREE.Vector3(0,1,0).applyQuaternion(crawler.hazmatVisual.quaternion);\n // A nearby grenade may have temporarily knocked down the walker;\n // remove the knockdown only inside this diagnostic pose test.\n walker.knockdown=null;\n walker.attackAnim=0;walker.hazmatLastX=walker.g.position.x;\n walker.hazmatLastZ=walker.g.position.z;\n walker.g.position.x+=.1;hazmatZombie.sync(walker,.05);\n return {forward:-v.z,order:crawler.hazmatVisual.rotation.order,\n   stride:hazmatZombie.status().walkStride,\n   actorStride:walker.hazmatStrideDistance,\n   cadence:walker.hazmatActions.Zombie_Walk_Root.timeScale};\n};\n";
   const greenAudit=`\n;globalThis.__greenAuraAudit={
 ready:()=>newCityCollisionReady&&(!!radiatedGreenGuyTemplate||!!radiatedGreenGuyError),
 run:()=>{
  const modelReady=!!radiatedGreenGuyTemplate,modelError=String(radiatedGreenGuyError||"");
  const before=zombies.length;
  makeZombie(3,8,before,"radiated");
  const green=zombies[before];
  if(!green)throw Error("Forced Green Guy did not spawn");
  const getAuraNames=root=>{
   const out=[];root?.traverse(o=>{if(o.isMesh&&/Aura|Mist/i.test(o.name||""))out.push(o.name)});
   return out;
  };
  const standing={kind:green.kind,model:!!green.radiatedGreenVisual,
   rigged:green.radiatedGreenBones?.size||0,
   hitboxes:green.hitMeshes?.length||0,hasMist:!!green.hazardMist,
   auras:getAuraNames(green.g)};
  green.hp=Math.max(green.hp,70);
  detachLeg(green,"left");
  detachLeg(green,"right");
  const crawler=zombies[before];
  const converted={kind:crawler?.kind,preservedModel:!!crawler?.radiatedGreenVisual,
   hitboxes:crawler?.hitMeshes?.length||0,hasMist:!!crawler?.hazardMist,
   hasIdentityAura:!!crawler?.crawlerIdentityAura,
   auras:getAuraNames(crawler?.g)};
  return {modelReady,modelError,standing,converted};
 }
};`;
   // v680 inspect real first-person gun world bounds at level and max-look-down.
   const eyeAudit=`
;globalThis.__eyeHeightAudit=()=>{
 const prior=pitch,selected=weapon,ground=playerGroundY;
 move(0);cam.updateMatrixWorld(true);
 const eye=cam.position.y-ground;
 const sampleGun=()=>[0,-.70,-1.05].map(p=>{
  pitch=p;move(0);cam.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(gun,true);
  return{pitch:p,groundClearance:bounds.min.y-ground,meshBelowEye:cam.position.y-bounds.min.y};
 });
 const dmrSamples=sampleGun();
 weapon="shotgun";rebuildGun();const samples=sampleGun();
 weapon=selected;rebuildGun();pitch=prior;move(0);cam.updateMatrixWorld(true);
 return{eye,selected,dmrSamples,expected:PLAYER_EYE_HEIGHT,original:1.65*PLAYER_WORLD_SCALE,
    worldScale:PLAYER_WORLD_SCALE,samples};
};`;
   const dmrAudit=`
;globalThis.__dmrV678Audit=()=>{
 const root=gun.getObjectByName("OriginalNorincoM305ALeisure");
 const meshNames=[],materialNames=[],visibleMaps=[];
 root?.traverse(o=>{
  if(o.isMesh&&o.visible){
   meshNames.push(o.name);
   for(const mat of (Array.isArray(o.material)?o.material:[o.material])){
    if(mat){materialNames.push(mat.name);visibleMaps.push(!!mat.map)}
   }
  }
 });
 const box=root?new THREE.Box3().setFromObject(root,true):null;
 const gunBox=root?new THREE.Box3().setFromObject(gun,true):null;
 return{weapon,ready:!!unlocked.dmr,ammo:ammoState.dmr.mag,spare:ammoState.dmr.reserve,
  name:weaponDefs.dmr.name,cycle:WEAPON_CYCLE_ORDER.slice(),
  source:document.documentElement.dataset.dmrSourceVisual,
  magazine:playerReloadPart?.name,magParent:playerReloadPart?.parent?.name,
  magMaterial:playerReloadPart?.material?.name,magOriginalTexture:!!playerReloadPart?.material?.map,
  importedMag:!!gun.getObjectByName("m305a_leisure_mag_bakelite_0"),
  glbReady:document.documentElement.dataset.dmrGlbReady,
  error:document.documentElement.dataset.dmrGlbError||"",
  geometry:meshNames,materials:materialNames,realTextures:visibleMaps,
  sourceLength:document.documentElement.dataset.dmrModelLength,
  viewScale:document.documentElement.dataset.dmrViewScale,
  worldSize:box?.getSize(new THREE.Vector3()).toArray(),
  gunSize:gunBox?.getSize(new THREE.Vector3()).toArray(),
  retired:!("awm" in weaponDefs)&&!("awm" in unlocked)&&!("awm" in ammoState)&&
    !("awm" in ADS)&&!("awm" in HAND_POSES)&&!("awm" in WEAPON_CONTACT)
 };
};
`;
   // v680: measure the real DMR whole-gun pose, including attached real
   // magazine/hands. The test does not perform or mutate reload choreography.
   // v695 confirms that every game START unlocks all seven weapons, with
   // real keyboard hotkeys; do not bypass the availability check here.
   const allWeaponsTestAudit=`
;globalThis.__armsV686Inventory=()=>{
 const state={flag:document.documentElement.dataset.fpsArmsWeaponTestLoadout,
   selected:weapon,allUnlocked:Object.keys(unlocked).every(k=>unlocked[k]===true),
   guns:Object.keys(unlocked).filter(k=>unlocked[k]),ammo:Object.fromEntries(Object.entries(ammoState).map(([k,v])=>[k,{mag:v.mag,reserve:v.reserve}]))};
 const keys=[["Digit1","pistol"],["Digit2","rifle"],["Digit3","shotgun"],
   ["Digit4","smg"],["Digit5","m240"],["Digit6","dmr"],["Digit7","grenadeLauncher"]];
 state.hotkeys=keys.map(([code,expected])=>{
  onKeyDown({code,key:code.at(-1),repeat:false,preventDefault:()=>{}});
  move(.016); // actual weapon-frame pose settles after each key switch
  return{code,expected,selected:weapon};
 });
 setWeapon("dmr");move(.016);
 return state;
};`;
   const fpsArmsAudit=`
;globalThis.__fpsArmsV687Audit=()=>{
 const old=weapon,oldAim=aiming,oldPitch=pitch;
 aiming=false;aimBlend=0;pitch=0;reloading=false;reloadWeapon="";
 const data=[];
 for(const w of ["dmr","rifle","smg","shotgun","pistol","m240","grenadeLauncher"]){
  weapon=w;rebuildGun();move(.1);gun.updateMatrixWorld(true);
  const root=gun.getObjectByName("OriginalCartoonFPSArmsGLB"),skin=[];
  root?.traverse(o=>{if(o.isSkinnedMesh)skin.push(o)});
  let oldMeshes=0;
  for(const name of ["LeftPlayerArm","RightPlayerArm"])
   gun.getObjectByName(name)?.traverse(o=>{if(o.isMesh)oldMeshes++});
  const fit=side=>{
   const wrist=root?.getObjectByName(side==="left"?"L_wrist_03":"R_wrist_025");
   const ctrl=side==="left"?playerHandRig?.leftFore:playerHandRig?.rightFore;
   const group=side==="left"?playerHandRig?.left:playerHandRig?.right;
   if(!wrist||!ctrl||!group)return null;
   const p=fpsJointEnds(ctrl,group).b;
   return gun.worldToLocal(wrist.getWorldPosition(new THREE.Vector3())).distanceTo(p);
  };
  const palm=side=>{
   const wrist=root?.getObjectByName(side==="left"?"L_wrist_03":"R_wrist_025");
   if(!wrist)return null;
   const worldQuat=wrist.getWorldQuaternion(new THREE.Quaternion());
   const localQuat=gun.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(worldQuat);
   return new THREE.Vector3(1,0,0).applyQuaternion(localQuat).toArray();
  };
  const fingerNodes=["L_point_08","L_middle_012","L_ring_015","R_point_030","R_middle_034","R_thumb_026"];
  const animated=fingerNodes.map(name=>root?.getObjectByName(name)).filter(Boolean);
  fpsNativeMixer?.setTime(.12);
  const early=animated.map(j=>j.quaternion.clone());
  fpsNativeMixer?.setTime(1.55);
  const delta=animated.map((j,i)=>j.quaternion.angleTo(early[i]));
  poseOriginalFpsArms();gun.updateMatrixWorld(true);
  data.push({w,skin:skin.length,bones:skin[0]?.skeleton?.bones?.length,
   rotationX:root?.rotation.x,orientationReported:document.documentElement.dataset.fpsArmsRootRotationX,
   textured:!!skin[0]?.material?.map,oldMeshes,visible:root?.visible,
   leftError:fit("left"),rightError:fit("right"),leftPalm:palm("left"),rightPalm:palm("right"),
   fingerAnimationMax:Math.max(0,...delta),
   profile:document.documentElement.dataset.fpsArmsNativeGripProfile,
   handScale:document.documentElement.dataset.fpsArmsHandScale,
   animation:document.documentElement.dataset.fpsArmsRealAnimation});
 }
 weapon=old;aiming=oldAim;pitch=oldPitch;rebuildGun();move(0);
 return{source:document.documentElement.dataset.fpsArmsSource,
  error:document.documentElement.dataset.fpsArmsError,
  clips:document.documentElement.dataset.fpsArmsAnimationClips,
  sourceGripClip:document.documentElement.dataset.fpsArmsSourceGripAnimation,
  sourceGripDuration:Number(document.documentElement.dataset.fpsArmsSourceGripDuration),data};
};`;
   // v695: unlike a wrist-distance-only check, inspect pistol support/trigger
   // wrist relationship and actual elbow clearance both at hip and full ADS.
   // Do not move the M17 pistol body or the original loaded magazine.
   const m17GripAudit=`
;globalThis.__m17V695GripAudit=()=>{
 const prev=weapon,prevAim=aiming,prevPitch=pitch;
 weapon="pistol";aiming=false;aimBlend=0;pitch=0;reloading=false;reloadWeapon="";
 rebuildGun();move(.25);
 const sample=()=>{
  gun.updateMatrixWorld(true);
  const rig=gun.getObjectByName("OriginalCartoonFPSArmsGLB");
  const point=name=>{
   const bone=rig?.getObjectByName(name);
   return bone?gun.worldToLocal(bone.getWorldPosition(new THREE.Vector3())):null;
  };
  const l=point("L_wrist_03"),r=point("R_wrist_025");
  return{
   left:l?.toArray(),right:r?.toArray(),separation:l&&r?l.distanceTo(r):null,
   leftElbow:point("L_elbow_02")?.toArray(),rightElbow:point("R_elbow_024")?.toArray(),
   leftIndex:!!rig?.getObjectByName("L_point_08"),
   leftFingerJointNames:["L_point_2_09","L_middle_2_00","L_ring_2_016","L_pink_2_020"].filter(n=>!!rig?.getObjectByName(n)),
   rightIndex:!!rig?.getObjectByName("R_point_030"),
   handPoseProfile:document.documentElement.dataset.fpsArmsNativeGripProfile,
   source:document.documentElement.dataset.fpsArmsSource,
   mag:playerReloadPart?.name||"",
   gunModels:gun.children.filter(q=>q.name==="ExternalM17SIG").length,
   visualSkin:!!rig?.visible
  };
 };
 const hip=sample();
 aiming=true;move(.6);
 const ads=sample();
 aiming=false;aimBlend=0;weapon=prev;pitch=prevPitch;rebuildGun();move(.01);
 aiming=prevAim;
 return{hip,ads,pistolGrips:FPS_NATIVE_GRIPS.pistol};
};
// Render a real Chromium frame for human comparison in hip and ADS.
globalThis.__m17V695Preview=(ads)=>{
 weapon="pistol";aiming=!!ads;aimBlend=ads?1:0;pitch=0;
 reloading=false;reloadWeapon="";rebuildGun();move(.25);
 // Capture the actual WebGL canvas directly immediately after a native frame.
 // Full-page Playwright screenshot waits on compositing and can time out.
 ren.render(scene,cam);
 const jpeg=document.querySelector("#cv")?.toDataURL("image/jpeg",.35);
 return jpeg?.startsWith("data:image/jpeg;base64,")?jpeg.slice(23):null;
};
// The visual preview must not change the weapon needed by following DMR tests.
globalThis.__m17V695PreviewRestore=()=>{
 weapon="dmr";aiming=false;aimBlend=0;pitch=0;
 reloading=false;reloadWeapon="";rebuildGun();move(.016);
};`;
   const dmrShoulderAudit=`
;globalThis.__dmrV683ShoulderAudit=()=>{
 const previousAim=aiming,previousPitch=pitch;
 if(weapon!=="dmr")throw Error("DMR must be selected for shoulder pose audit");
 aiming=false;aimBlend=0;pitch=0;dmrShoulderBlend=0;dmrRightGripBlend=0;
 move(.50);
 const hip={x:gun.position.x,y:gun.position.y,z:gun.position.z,yaw:gun.rotation.y,
  blend:dmrShoulderBlend,grip:dmrRightGripBlend,
  indexTip:playerHandRig?.dmrIndexTip?.position?.toArray(),
  indexVisible:!!playerHandRig?.dmrIndexTip?.visible,
  triggerWrist:playerHandRig?.rightHandBase?.clone().lerp(new THREE.Vector3(.41,-.64,-1.48),dmrRightGripBlend).toArray(),
  mag:playerReloadPart?.name,
  gunHasBothHands:!!gun.getObjectByName("RightPlayerArm")&&!!gun.getObjectByName("LeftPlayerArm")};
 aiming=true;move(.50);
 // Real 3D ray/optic projection at full ADS, not just matching arbitrary
 // position constants. This must land on the SAME camera center as shots.
 gun.updateMatrixWorld(true);cam.updateMatrixWorld(true);
 const sight=dmrOpticAimPoint?.clone();
 const projected=sight?gun.localToWorld(sight).project(cam):null;
 const zero=JSON.parse(document.documentElement.dataset.dmrSightZeroCorrection||"null");
 const ads={x:gun.position.x,y:gun.position.y,z:gun.position.z,yaw:gun.rotation.y,blend:dmrShoulderBlend,
  opticPose:dmrOpticPose?{...dmrOpticPose}:null,
  zero,screen:projected?.toArray()||null,
  magazine:playerReloadPart?.name,hitMarkerCenter:[.5,.5],
  mag:playerReloadPart?.name};
 aiming=previousAim;pitch=previousPitch;rebuildGun();move(0);
 return{hip,ads};
};`;
   // Run the real DMR visuals at several points through a complete reload.
   const dmrMechanicsAudit=`
;globalThis.__dmrV682MechanicsAudit=()=>{
 aiming=false;aimBlend=0;pitch=0;weapon="dmr";rebuildGun();
 dmrShoulderBlend=1;dmrRightGripBlend=1;recoil=0;
 move(.016);
 const cartridges=[];
 dmrCartridgeTemplate?.traverse(o=>{if(o.isMesh)cartridges.push({name:o.name,material:o.material?.name,texture:!!o.material?.map})});
 const before={gun:[gun.position.x,gun.position.y,gun.position.z],optic:dmrOpticPose?{...dmrOpticPose}:null,
    sourceCartridges:cartridges,mag:playerReloadPart?.name};
 recoil=.16;move(.016);
 const shot={gunRotation:gun.rotation.x,visualAngle:dmrRecoilVisual,receiverRotation:dmrViewRoot?.rotation.x||0,
  sourceCartridge:!!dmrCartridgeTemplate};
 recoil=0;dmrRecoilVisual=0;
 reloading=true;reloadWeapon="dmr";reloadDurationMs=1000;
 const samples=[.06,.23,.34,.57,.82,.92].map(p=>{
  reloadStartedAt=gameTimeNow()-p*1000;move(.016);
  return{p,x:gun.position.x,y:gun.position.y,z:gun.position.z,pitch:gun.rotation.x,
    oldDropped:reloadOldMagDropped,fresh:!!reloadFreshMag,inserted:reloadMagInserted,
    leftHand:playerHandRig?.leftGripAnchor?.position?.toArray(),magName:playerReloadPart?.name};
 });
 finishReloadMagazineFX();reloading=false;reloadWeapon="";reloadDurationMs=0;rebuildGun();
 return{before,shot,samples};
};`;
   const profileAudit=`
;globalThis.__city678PerfAudit=()=>{
 const now=performance.now(),prior={
  check:rainCoverCheckAt,x:rainCoverLastX,y:rainCoverLastY,z:rainCoverLastZ,
  count:perfRainCoverChecks
 };
 rainCoverCheckAt=now-300;
 rainCoverLastX=px;rainCoverLastY=playerGroundY+1.35;rainCoverLastZ=pz;
 updateRainCover(now);
 const stationarySkipped=perfRainCoverChecks===prior.count;
 rainCoverCheckAt=now-310;rainCoverLastX=px-1;
 updateRainCover(now+1);
 const movedChecked=perfRainCoverChecks===prior.count+1;
 rainCoverCheckAt=prior.check;rainCoverLastX=prior.x;
 rainCoverLastY=prior.y;rainCoverLastZ=prior.z;
 return{
  navBuildBudget:ZOMBIE_ASTAR_PER_FRAME,stationarySkipped,movedChecked,
  hudStats:JSON.parse(document.documentElement.dataset.cityPerformanceBreakdown||"null")
 };
};`;
   const staticAudit=`
;globalThis.__city678StaticMapAudit=()=>{
 const imported=newCityRoot,meshes=[];
 imported?.traverse(o=>{if(o.isMesh&&meshes.length<12)meshes.push(o)});
 const before=meshes.map(o=>o.matrixWorld.elements.slice());
 const floorBefore=samplePlayerGroundY(px,pz,playerGroundY);
 imported.updateMatrixWorld(true);
 const after=meshes.map(o=>o.matrixWorld.elements.slice());
 const floorAfter=samplePlayerGroundY(px,pz,playerGroundY);
 return {count:Number(document.documentElement.dataset.staticCityTransformNodes||0),
  mode:document.documentElement.dataset.staticCityTransformMode,
  mapReady:!!newCityCollisionReady,
  staticMeshes:meshes.filter(o=>o.matrixAutoUpdate===false).length,
  sampleCount:meshes.length,
  unchanged:before.every((matrix,i)=>matrix.every((v,k)=>Math.abs(v-after[i][k])<1e-8)),
  floorBefore,floorAfter};
};`;
   const gpuFrameAudit=`
;globalThis.__city678GpuAudit=()=>{
 const ext={TIME_ELAPSED_EXT:35007,GPU_DISJOINT_EXT:36795};
 let begins=0,ends=0,deleted=0;
 const gl={
  QUERY_RESULT_AVAILABLE:34919,QUERY_RESULT:34918,
  getExtension:name=>name==="EXT_disjoint_timer_query_webgl2"?ext:null,
  createQuery:()=>({}),beginQuery:()=>{begins++},endQuery:()=>{ends++},
  getQueryParameter:(q,key)=>key===34919?true:7500000,
  getParameter:()=>false,deleteQuery:()=>{deleted++}
 };
 const fake=createGpuFrameTimer({getContext:()=>gl});
 for(let i=0;i<12;i++){if(fake.begin())fake.end()}
 const measured=fake.snapshot();
 const unsupported=createGpuFrameTimer({getContext:()=>({getExtension:()=>null})}).snapshot();
 return {measured,begins,ends,deleted,unsupported,live:cityGpuTimer.snapshot()};
};`;
   await route.fulfill({response:rsp,body:src+injected+extraAudit+postureAudit+greenAudit+eyeAudit+dmrAudit+allWeaponsTestAudit+fpsArmsAudit+m17GripAudit+dmrShoulderAudit+dmrMechanicsAudit+profileAudit+staticAudit+gpuFrameAudit,contentType:"application/javascript"});
  });
  const rsp=await page.goto("http://127.0.0.1:4173/?v=695-hazmat-visual-test",{waitUntil:"domcontentloaded",timeout:63100});
  report.http=rsp?.status();
  await page.waitForFunction(()=>globalThis.__hazmatSmoke?.ready(),null,{timeout:110000});
  // Shaders, textures and actual pooled instance buffers must be initialized
  // by the idle menu, BEFORE the first live grenade impacts gameplay frames.
  await page.waitForFunction(()=>document.documentElement.dataset.explosionGpuWarmup==="ready",null,{timeout:30000});
  report.grenadeGpuPrewarm=await page.evaluate(()=>({
   status:document.documentElement.dataset.explosionGpuWarmup,
   timeMs:Number(document.documentElement.dataset.explosionGpuWarmupMs||0),
   error:document.documentElement.dataset.explosionGpuWarmupError||""
  }));
  await page.locator("#start").click({noWaitAfter:true});
  await page.evaluate(()=>globalThis.__hazmatSmoke.forceHazmats());
  await page.waitForFunction(()=>globalThis.__hazmatSmoke?.snapshot()?.attached===10,null,{timeout:45000});
  await page.waitForTimeout(700);
  await page.waitForFunction(()=>!!document.documentElement.dataset.cityPerformanceBreakdown,null,{timeout:45000});
  report.performance=await page.evaluate(()=>globalThis.__city678PerfAudit());
  report.gpuFrame=await page.evaluate(()=>globalThis.__city678GpuAudit());
  report.staticMap=await page.evaluate(()=>globalThis.__city678StaticMapAudit());
  await page.waitForFunction(()=>document.documentElement.dataset.dmrGlbReady==="true",null,{timeout:65000});
  await page.waitForFunction(()=>document.documentElement.dataset.fpsArmsGlbReady==="true",null,{timeout:65000});
  report.mouseLookProtection=await page.evaluate(()=>document.documentElement.dataset.mouseLookProtection);
  assert.equal(report.mouseLookProtection,"v692-active","preserve passing v692 mouse-look protection");
  report.nativeArms=await page.evaluate(()=>globalThis.__fpsArmsV687Audit());
  report.m17Grip=await page.evaluate(()=>globalThis.__m17V695GripAudit());
  report.m17Sleeves=await page.evaluate(()=>document.documentElement.dataset.fpsArmsM17SleeveProfile);
  assert.equal(report.m17Sleeves,"v695-source-sleeve-taper","M17 must use original skinned mesh with fitted sleeve taper");
  report.m17Taper=await page.evaluate(()=>({
   vertexCount:Number(document.documentElement.dataset.fpsArmsM17TaperVerts||0),
   gloveSize:document.documentElement.dataset.fpsArmsM17GloveScale
  }));
  assert(report.m17Taper.vertexCount>=40&&report.m17Taper.gloveSize==="0.86",
   "M17 must actually modify original sleeve vertices and size its visible glove: "+JSON.stringify(report.m17Taper));
  // Visual capture is diagnostic, NOT allowed to make otherwise-correct
  // gameplay regression fail on headless SwiftShader screenshot stalls.
  report.m17Preview={};
  for(const ads of [false,true]){
   const key=ads?"ads":"hip";
   try{
    const jpeg=await page.evaluate(a=>globalThis.__m17V695Preview(a),ads);
    report.m17Preview[key]=jpeg?.length||0;
    if(jpeg?.length>6000)console.log("M17_V695_"+key.toUpperCase()+"_JPEG="+jpeg);
   }catch(captureError){report.m17Preview[key]=String(captureError).slice(0,220)}
  }
  await page.evaluate(()=>globalThis.__m17V695PreviewRestore());
  report.dmrTest=await page.evaluate(()=>globalThis.__dmrV678Audit());
  report.eyeHeight=await page.evaluate(()=>globalThis.__eyeHeightAudit());
  report.dmrShoulder=await page.evaluate(()=>globalThis.__dmrV683ShoulderAudit());
  report.dmrMechanics=await page.evaluate(()=>globalThis.__dmrV682MechanicsAudit());
  report.state=await page.evaluate(()=>globalThis.__hazmatSmoke.snapshot());
  report.motion=await page.evaluate(()=>globalThis.__hazmatSmoke.motion());
  report.lifecycle=await page.evaluate(()=>globalThis.__hazmatLifecycleAudit());
  await page.waitForTimeout(170); // force real WebGL shader compilation/render
  report.grenadeFx=await page.evaluate(()=>({
   prepared:Number(document.documentElement.dataset.grenadePreparedFragmentTiers||0),
   particles:Number(document.documentElement.dataset.grenadeLastSpriteCount||0),
   batchDraws:Number(document.documentElement.dataset.grenadeLastSpriteDraws||0),
   fragmentCount:Number(document.documentElement.dataset.lastGrenadeFragments||0),
   shellMs:Number(document.documentElement.dataset.lastGrenadeShatterMs),
   smokeMs:Number(document.documentElement.dataset.lastGrenadeVisualMs),
   logicMs:Number(document.documentElement.dataset.lastGrenadeLogicMs),
   batches:String(document.documentElement.dataset.grenadeLastSpriteDraws||"")
  }));
  const s=report.state;
  assert.equal(report.http,200);assert.equal(report.assetHttp,200);
  assert.equal(s.build,"631");assert.equal(s.wave,1);
  assert(report.dmrTest.weapon==="dmr"&&report.dmrTest.ready&&
   report.dmrTest.name==="DMR"&&report.dmrTest.ammo===10&&
   report.dmrTest.spare===30&&report.dmrTest.source==="norinco_m305a_leisure"&&
   report.dmrTest.glbReady==="true"&&!report.dmrTest.error&&
   report.dmrTest.geometry.includes("m305a_leisure_m305a_0")&&
   report.dmrTest.geometry.includes("m305a_leisure_attachments_0")&&
   report.dmrTest.magazine==="m305a_leisure_mag_bakelite_0"&&
   report.dmrTest.importedMag&&
   report.dmrTest.magMaterial==="mag_bakelite"&&report.dmrTest.magOriginalTexture&&
   report.dmrTest.realTextures.some(Boolean)&&
   // The source model's authored 3.8-unit local barrel length does not depend
   // on world-facing direction. A world-axis Z AABB check incorrectly fails
   // when the player is facing sideways during browser pointer lock.
   Math.abs(Number(report.dmrTest.sourceLength)*Number(report.dmrTest.viewScale)-3.8)<.035&&
   report.dmrTest.worldSize?.some(dim=>dim>2.5&&dim<5.5)&&
   report.dmrTest.retired&&report.dmrTest.cycle.includes("dmr")&&
   !report.dmrTest.cycle.includes("awm"),
   "v680 must equip test DMR and remove retired sniper: "+JSON.stringify(report.dmrTest));
  assert(report.m17Grip?.hip?.source==="cartoon_fps_arms.glb"&&
    report.m17Grip.hip.visualSkin&&report.m17Grip.hip.leftIndex&&report.m17Grip.hip.rightIndex&&
    report.m17Grip.hip.leftFingerJointNames?.length===4&&
    report.m17Grip.hip.gunModels===1&&report.m17Grip.hip.handPoseProfile==="pistol"&&
    report.m17Grip.pistolGrips?.left?.roll===.16&&
    report.m17Grip.pistolGrips?.right?.roll===3.02&&
    report.m17Grip.pistolGrips?.left?.delta?.[0]===-.085&&
    report.m17Grip.pistolGrips?.right?.delta?.[2]===.03&&
    report.m17Grip.pistolGrips?.left?.delta?.[1]===-.065&&
    report.m17Grip.pistolGrips?.left?.delta?.[2]===.07&&
    // v690 baseline .217m hip / .054m ADS: closer at hip, no ADS overlap.
    report.m17Grip.hip.separation>.10&&report.m17Grip.hip.separation<.195&&
    report.m17Grip.ads.separation>.06&&report.m17Grip.ads.separation<.15&&
    // Restore v687's *authored* aiming transition, which legitimately
    // shifts skinned wrists by ~0.08-0.16 and elbows by ~0.07-0.10 units.
    // v688 forced these bones to remain still and stretched the sleeves.
    ["left","right"].every(k=>
       report.m17Grip.hip[k]?.length===3&&report.m17Grip.ads[k]?.length===3&&
       report.m17Grip.hip[k].every((v,i)=>Math.abs(v-report.m17Grip.ads[k][i])<.19))&&
    ["leftElbow","rightElbow"].every(k=>
       report.m17Grip.hip[k]?.length===3&&report.m17Grip.ads[k]?.length===3&&
       report.m17Grip.hip[k].every((v,i)=>Math.abs(v-report.m17Grip.ads[k][i])<.13))&&
    report.m17Grip.hip.left[0]<report.m17Grip.hip.right[0]&&
    report.m17Grip.ads.left[0]<report.m17Grip.ads.right[0],
    "v695 M17 source-finger grip fit should not spread sleeves or disconnect wrists: "+
    JSON.stringify(report.m17Grip));
  assert(report.nativeArms?.source==="cartoon_fps_arms.glb"&&
    !report.nativeArms.error&&Number(report.nativeArms.clips)>0&&
    report.nativeArms.data?.length===7&&
    report.nativeArms.sourceGripClip==="CINEMA_4D_Main"&&
    report.nativeArms.sourceGripDuration>2&&
    report.nativeArms.data.every(o=>o.skin===1&&o.bones===47&&
      Math.abs(o.rotationX-Math.PI)<.000001&&
      Math.abs(Number(o.orientationReported)-Math.PI)<.00001&&
      o.textured&&o.oldMeshes===0&&o.visible&&
      o.leftError<.26&&o.rightError<.26&&
      o.rightPalm?.[0]<-.6&&
      (o.w==="pistol"?o.leftPalm?.[0]>.5:o.leftPalm?.[1]>.6)&&
      o.fingerAnimationMax>.03&&o.animation==="true"&&
      Math.abs(Number(o.handScale)-1.20)<.00001&&o.profile===o.w),
    "Native original cartoon FPS rig missing/misaligned: "+JSON.stringify(report.nativeArms));
  assert(report.dmrShoulder?.hip?.blend>.99&&
    report.dmrShoulder.hip.x>.305&&report.dmrShoulder.hip.x<.315&&
    report.dmrShoulder.hip.y<-.23&&report.dmrShoulder.hip.y>-.25&&
    report.dmrShoulder.hip.z>.75&&report.dmrShoulder.hip.z<.77&&
    report.dmrShoulder.hip.yaw>.055&&report.dmrShoulder.hip.yaw<.065&&
    report.dmrShoulder.hip.gunHasBothHands&&
    report.dmrShoulder.hip.indexVisible&&report.dmrShoulder.hip.grip>.99&&
    report.dmrShoulder.hip.indexTip?.[2]<-1.57&&
    report.dmrShoulder.hip.triggerWrist?.[2]<-1.46&&
    report.dmrShoulder.hip.mag==="m305a_leisure_mag_bakelite_0"&&
    report.dmrShoulder.ads.opticPose&&
    Math.abs(report.dmrShoulder.ads.x-report.dmrShoulder.ads.opticPose.x*.84)<.025&&
    Math.abs(report.dmrShoulder.ads.y-report.dmrShoulder.ads.opticPose.y)<.025&&
    Math.abs(report.dmrShoulder.ads.z-report.dmrShoulder.ads.opticPose.z)<.025&&
    report.dmrShoulder.ads.z>0&&
    Math.abs(report.dmrShoulder.ads.yaw)<.005&&
    report.dmrShoulder.ads.mag==="m305a_leisure_mag_bakelite_0"&&
    Math.abs(report.dmrShoulder.ads.zero?.verticalModelUnits-.052)<1e-6&&
    Math.abs(report.dmrShoulder.ads.zero?.horizontalModelUnits-.007)<1e-6&&
    Math.abs(report.dmrShoulder.ads.zero?.zoomFov-48)<1e-6&&
    Math.abs(report.dmrShoulder.ads.screen?.[0]||0)<.015&&
    Math.abs(report.dmrShoulder.ads.screen?.[1]||0)<.015&&
    report.dmrShoulder.ads.screen?.[2]>-1&&
    report.dmrShoulder.ads.screen?.[2]<1,
    "v695 preserve hip; the actual original DMR sight must project to the unchanged center hit ray: "+
    JSON.stringify(report.dmrShoulder));
  assert(report.dmrMechanics?.before?.mag==="m305a_leisure_mag_bakelite_0"&&
    report.dmrMechanics.before.sourceCartridges?.some(c=>c.material==="cartridge"&&c.texture)&&
    Math.abs(report.dmrMechanics.shot.gunRotation)<.0001&&
    report.dmrMechanics.shot.visualAngle>0&&report.dmrMechanics.shot.visualAngle<.035&&
    report.dmrMechanics.shot.sourceCartridge&&
    report.dmrMechanics.samples[0].oldDropped===false&&
    report.dmrMechanics.samples[2].oldDropped===true&&
    report.dmrMechanics.samples[3].fresh===true&&
    report.dmrMechanics.samples[4].fresh===true&&
    report.dmrMechanics.samples[5].inserted===true&&
    report.dmrMechanics.samples.every(p=>
      Math.abs(p.x-report.dmrMechanics.before.gun[0])<.005&&
      Math.abs(p.y-report.dmrMechanics.before.gun[1])<.005&&
      Math.abs(p.z-report.dmrMechanics.before.gun[2])<.005&&
      Math.abs(p.pitch)<.005),
    "v695 must use GLB cartridges, only muzzle recoil, and NEVER push the gun during reload: "+JSON.stringify(report.dmrMechanics));
  assert(Math.abs(report.eyeHeight.eye-2.10)<.025&&
   Math.abs(report.eyeHeight.eye-report.eyeHeight.original-.12)<.025&&
   report.eyeHeight.worldScale===1.20&&report.eyeHeight.samples.length===3&&
   report.eyeHeight.samples.every(x=>x.groundClearance>-.025)&&
    report.eyeHeight.dmrSamples?.every(x=>x.groundClearance>-.015),
   "Player eye increase should be ONLY 12cm with preserved player scale: "+
    JSON.stringify(report.eyeHeight));
  assert(report.staticMap?.count>150&&report.staticMap.mode==="frozen-static-world"&&
    report.staticMap.mapReady&&report.staticMap.sampleCount>=8&&
    report.staticMap.staticMeshes===report.staticMap.sampleCount&&
    report.staticMap.unchanged&&
    Math.abs(report.staticMap.floorBefore-report.staticMap.floorAfter)<1e-7,
   "Static GLB transform freeze must preserve existing physical world matrices and player ground: "+
    JSON.stringify(report.staticMap));
  assert.equal(s.waveTarget,10);assert.equal(s.waveSpawned,10);
  assert.equal(s.live,10);assert.equal(s.acidic,10);assert.equal(s.boss,0);
  assert.deepEqual(s.kinds,["acidic"]);assert.equal(s.attached,10);
  assert.equal(s.original,"OriginalHazmatZombieGLB");
  assert.equal(s.mist,false);assert.equal(s.mistObjects,0);assert.equal(s.hidden,true);
  assert.equal(s.meshes.length,2);
  assert(s.meshes.every(m=>m.map&&m.vertices>2000),"Original textured GLB suit/head missing");
  assert(s.bones>=50&&s.leftLeg&&s.rightLeg);
  assert(s.height>1.45&&s.height<2.8,"Wrong Hazmat world size "+s.height);
  assert(s.headHits>=1&&s.torsoHits>=1);
  assert(s.clips.includes("Zombie_Walk_Root")&&s.clips.includes("Zombie_Idle")&&s.clips.includes("Zombie_Skill"));
  assert.equal(s.pool,19);
  assert(report.gpuFrame.measured.status==="ready"&&
   Math.abs(report.gpuFrame.measured.avgMs-7.5)<.001&&
   Math.abs(report.gpuFrame.measured.p95Ms-7.5)<.001&&
   report.gpuFrame.measured.samples===2&&
   report.gpuFrame.begins===2&&report.gpuFrame.ends===2&&
   report.gpuFrame.deleted===2&&
   report.gpuFrame.unsupported.status==="unavailable"&&
   ["ready","collecting","unavailable","disjoint"].includes(report.gpuFrame.live.status),
   "Nonblocking actual GPU timer failed synthetic asynchronous query/unsupported case: "+
   JSON.stringify(report.gpuFrame));
  const frame=report.performance.hudStats;
  assert(frame&&Number.isFinite(frame.frameSamples)&&frame.frameSamples>=1&&
   frame.gpu?.status&&
   (frame.frameSamples<5
    ?frame.frameMedianMs===null&&frame.frameP95Ms===null
    :Number.isFinite(frame.frameMedianMs)&&Number.isFinite(frame.frameP95Ms)&&
      Number.isFinite(frame.frameMaxMs)&&
      frame.frameP95Ms>=frame.frameMedianMs&&frame.frameMaxMs>=frame.frameP95Ms),
   "v680 steady-state frame pacing must exclude too-few startup samples: "+JSON.stringify(frame));
  assert(report.performance.navBuildBudget===1&&
   report.performance.stationarySkipped&&report.performance.movedChecked&&
   Number.isFinite(report.performance.hudStats?.updateMs)&&
   Number.isFinite(report.performance.hudStats?.renderSubmitMs)&&
   Number.isFinite(report.performance.hudStats?.rainMs)&&
   Number.isFinite(report.performance.hudStats?.navWorstMs)&&
   Number.isFinite(report.performance.hudStats?.roofWorstMs),
   "v680 navigation frame budget and stationary rain raycast profiling failed: "+
   JSON.stringify(report.performance));
  assert.equal(s.armTuning.reference,"Zombie_Idle");
  assert(s.armTuning.tracks>=4&&s.armTuning.upperArms>=2&&
    s.armTuning.left&&s.armTuning.right,"Native left/right Hazmat arms not retuned");
  assert(s.armTuning.upperOriginalArc>.06,
    "Original running arm motion not located: "+JSON.stringify(s.armTuning));
  assert(s.armTuning.upperCorrectedArc>.018&&
    s.armTuning.upperCorrectedArc<s.armTuning.upperOriginalArc*.6,
    "Arm swing not noticeably reduced or became stiff: "+JSON.stringify(s.armTuning));
  assert.equal(s.armTuning.nativeLegTracksUnchanged,true);
  const life=report.lifecycle;
  assert.equal(life.isNative,true,"Ragdoll not attached to original Hazmat skeleton");
  assert(life.ragTravel>.03,"Visible Hazmat remains frozen after a death");
  assert(life.originalBones>=16);
  assert.equal(life.afterOne.left,true);
  assert.equal(life.afterOne.parts,0,"Generic old limb was ejected");
  assert.equal(life.afterOne.nativeHidden,true);
  assert.equal(life.afterTwo.kind,"crawler");
  assert.equal(life.afterTwo.ownerStillPresent,true);
  assert.equal(life.afterTwo.sameRoot,true);
  assert.equal(life.afterTwo.modelSame,true,"Hazmat swapped into a generic crawler");
  assert.equal(life.afterTwo.bothHidden,true);
  const posture=await page.evaluate(()=>globalThis.__hazmatPostureAudit());
  report.posture=posture;
  assert.equal(posture.order,"YXZ");
  assert(posture.forward>.45,"Crawler still leans backward");
  assert(posture.stride>.55&&posture.stride<.85,
    "Missing native GLB gait calibration "+posture.stride);
  assert(posture.actorStride>.55&&posture.actorStride<1.05);
  assert(posture.cadence>5.6,"Walking still capped at skating cadence");

  assert(life.afterTwo.headHitbox&&life.afterTwo.bodyHitbox);
  assert(life.explosionMs!==null&&Number.isFinite(life.explosionMs));
  assert(life.explosionMs<4500,"Main-thread grenade blast stalls >4.5 seconds");
  assert(report.grenadeGpuPrewarm?.status==="ready"&&
   report.grenadeGpuPrewarm?.timeMs>0&&
   !report.grenadeGpuPrewarm.error,
   "v680 explosion shader/texture/particle buffers weren't prewarmed: "+JSON.stringify(report.grenadeGpuPrewarm));
  assert(report.grenadeFx.prepared>=3&&report.grenadeFx.fragmentCount>0&&
   report.grenadeFx.particles>=100&&report.grenadeFx.batchDraws===2&&
   report.grenadeFx.batches==="2"&&
   Number.isFinite(report.grenadeFx.shellMs)&&Number.isFinite(report.grenadeFx.smokeMs)&&
   Number.isFinite(report.grenadeFx.logicMs),
   "Optimized grenade must preserve original GLB shattering and full-detail smoke/fire in only 2 GPU draws: "+
   JSON.stringify(report.grenadeFx));
  assert(report.motion.angles.filter(v=>v>.1).length>=3,"Real legs not bending: "+JSON.stringify(report.motion));
  await page.waitForFunction(()=>globalThis.__greenAuraAudit?.ready(),null,{timeout:30000});
  report.green=await page.evaluate(()=>globalThis.__greenAuraAudit.run());
  assert.equal(report.green.standing.kind,"radiated");
  assert.equal(report.green.modelReady,true,"Original Green Guy GLB failed to load: "+report.green.modelError);
  assert(report.green.standing.hitboxes>=3,
    "Green Guy hitboxes missing: "+JSON.stringify(report.green.standing));
  assert.equal(report.green.standing.model,report.green.modelReady,
    "Green Guy model was available but not attached");
  if(report.green.modelReady)
    assert(report.green.standing.rigged>=12,"Original Green Guy skeleton damaged");
  assert.equal(report.green.standing.hasMist,false,"Standing Green Guy still has green mist");
  assert.deepEqual(report.green.standing.auras,[],"Green Guy still has aura mesh");
  assert.equal(report.green.converted.kind,"crawler");
  assert.equal(report.green.converted.preservedModel,true,"Original Green Guy lost on conversion to crawler");
  assert(report.green.converted.hitboxes>=1);
  assert.equal(report.green.converted.hasMist,false);
  assert.equal(report.green.converted.hasIdentityAura,false);
  assert.deepEqual(report.green.converted.auras,[],"Legless Green Guy still has aura mesh");
  // Exercise actual 1-7 hotkeys AFTER every gun-geometry / DMR sight /
  // reload regression. Seven synthetic switches in one JS task have no
  // intervening render, so they must not contaminate sight bounds checks.
  report.testLoadout=await page.evaluate(()=>globalThis.__armsV686Inventory());
  assert(report.testLoadout?.flag==="all-seven"&&
    report.testLoadout.selected==="dmr"&&report.testLoadout.allUnlocked&&
    report.testLoadout.guns?.length===7&&
    report.testLoadout.hotkeys?.length===7&&
    report.testLoadout.hotkeys.every(x=>x.selected===x.expected)&&
    report.testLoadout.ammo?.grenadeLauncher?.mag===6&&
    report.testLoadout.ammo?.grenadeLauncher?.reserve===4&&
    Object.values(report.testLoadout.ammo||{}).every(a=>a.mag>0),
    "v695 ALL 7 guns must be ready at spawn, numbered keys work, and all have rounds: "+
    JSON.stringify(report.testLoadout));
  assert.equal(errors.length,0,"JS errors: "+errors.join("; "));
  report.passed=true;
 }catch(e){
  report.failure=String(e?.stack||e);
  try{report.debug=await page?.evaluate(()=>globalThis.__hazmatSmoke?.snapshot())}catch(_){}
 }finally{
  if(browser)await browser.close();
  report.errors=errors;
  fs.writeFileSync("HAZMAT_V658_AUDIT.json",JSON.stringify(report,null,2));
  console.log("HAZMAT_V599_REPORT="+JSON.stringify(report));
  if(!report.passed)process.exitCode=1;
 }
})();