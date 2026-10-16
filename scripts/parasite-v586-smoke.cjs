// v695 regression rerun: synchronized GPU timer, frame pacing warmup gate and original zombie source.
// v695 verified-shader rerun on final loaded source and protected zombie tests.
// v695 final synchronized loader: run against committed index.html game.js?v=695 and approved two-natural-crawler rotation.
const {chromium}=require("playwright"),fs=require("fs"),assert=require("assert/strict");
(async()=>{
 const report={version:"678",pass:false},errors=[];let browser,page;
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  page=await browser.newPage({viewport:{width:1200,height:800}});
  page.on("pageerror",e=>errors.push(String(e)));
  page.on("response",r=>{if(r.url().includes("parasite_des_zombie_monster_game_model_free.glb"))report.assetHttp=r.status()});
  await page.route(/\/src\/game\.js\?v=695$/,async route=>{
   const resp=await route.fetch(),source=await resp.text();
   const addon=`
;globalThis.__parasiteSmoke={
 ready:()=>!!parasiteBossAsset&&!!naturalCrawlerAsset&&!!injuredCrawlerAsset&&!!infectedGlbAsset&&newCityCollisionReady,
 waveOne:()=>({wave,target:waveTarget,spawned:waveSpawned,live:zombies.filter(z=>!z.dead).length,bosses:zombies.filter(z=>z.kind==="boss"&&!z.dead).length,kinds:[...new Set(zombies.filter(z=>!z.dead).map(z=>z.kind))],preview:!sprinterOnlyTest,
  newCrawlerCount:zombies.filter(z=>!z.dead&&z.injuredCrawlerVisual).length,
  oldCrawlerCount:zombies.filter(z=>!z.dead&&z.naturalCrawlerVisual).length}),
 normalRotation:()=>({
  first:[0,.08,.5,.99].map(roll=>rolledZombieKind(1,roll)),
  second:[.05,.7].map(roll=>rolledZombieKind(2,roll)),
  fifth:[.025,.8].map(roll=>rolledZombieKind(5,roll)),
  sixth:[.055,.8].map(roll=>rolledZombieKind(6,roll))
 }),
 // Test-only: exercise the actual original GLB without changing normal Wave 1.
 // These actors are added AFTER confirming the player's real first ten spawns.
 seedBothNaturalCrawlers:()=>{
  const first=zombies.filter(z=>!z.dead&&z.kind==="shambler");
  if(first.length<3)throw Error("Wave 1 normal shamblers not restored");
  const oldWave=wave,oldRoll=rolledZombieKind,start=zombies.length;
  try{
   wave=5;rolledZombieKind=()=>"crawler";
   for(let i=0;i<24;i++){
    const p=first[i%first.length].g.position;
    makeZombie(p.x,p.z,100+i);
    const added=zombies.slice(start);
    if(added.some(z=>z.injuredCrawlerSpawn)&&added.some(z=>z.naturalCrawlerSpawn))break;
   }
  }finally{rolledZombieKind=oldRoll;wave=oldWave}
  const created=zombies.slice(start);
  const injured=created.find(z=>z.injuredCrawlerSpawn);
  const original=created.find(z=>z.naturalCrawlerSpawn);
  if(!injured||!original)throw Error("Both crawler GLBs not selected during normal rotation");
  const before=created.map(z=>({injured:z.injuredCrawlerSpawn,natural:z.naturalCrawlerSpawn,
   injuredRig:!!z.injuredCrawlerVisual,naturalRig:!!z.naturalCrawlerVisual}));
  for(const z of created)if(z!==injured&&z!==original)releaseZombieVisual(z);
  const removed=new Set(created.filter(z=>z!==injured&&z!==original));
  zombies=zombies.filter(z=>!removed.has(z));
  return{variants:before,selected:created.length,liveNew:!!injured.injuredCrawlerVisual,
   liveOld:!!original.naturalCrawlerVisual,
   preservedOriginalClips:original.naturalCrawlerActions?.Crawl?.getClip()?.name==="Crawl"&&
    original.naturalCrawlerActions?.Running_Crawl?.getClip()?.name==="Running_Crawl",
   nativeInjuredClip:injured.injuredCrawlerAction?.getClip()?.tracks?.length===51,
   waveNow:wave};
 },
 forcedCrawlerConversionStillSeparate:()=>{
  const base=zombies.find(z=>z.kind==="shambler"&&!z.dead);
  const p=base.g.position,n=zombies.length;
  makeZombie(p.x,p.z,300,"crawler");
  const z=zombies[n];
  const result={forcedHasNatural:!!z.naturalCrawlerSpawn,forcedHasInjured:!!z.injuredCrawlerSpawn,
   forcedHasEitherVisual:!!(z.injuredCrawlerVisual||z.naturalCrawlerVisual)};
  releaseZombieVisual(z);zombies.splice(n,1);
  return result;
 },
 injuredCrawlerAudit:()=>{
  const all=zombies.filter(z=>!z.dead&&z.injuredCrawlerSpawn);
  const first=all[0],v=first?.injuredCrawlerVisual;
  const box=v?new THREE.Box3().setFromObject(v,true):null;
  const size=box?.getSize(new THREE.Vector3());
  return {count:all.length,skinned:!!first?.injuredCrawlerModel?.getObjectByProperty("isSkinnedMesh",true),
   bones:first?.injuredCrawlerBones?.size||0,clip:injuredCrawlerAsset?.clip?.name,
   clipTracks:injuredCrawlerAsset?.clip?.tracks?.length||0,
   mixer:!!first?.injuredCrawlerMixer,actionPlaying:first?.injuredCrawlerAction?.isRunning()||false,
   scale:v?.scale.x,length:Math.max(size?.x||0,size?.z||0),height:size?.y||0,
   floor:box?.min.y,ground:first?.g.position.y,
   hitboxes:first?.injuredHitboxes?.length||0,
   crawlTravelSpeed:first?.injuredCrawlerTravelSpeed,
   crawlPhase:first?.injuredCrawlerGroundPhase,
   clearance:document.documentElement.dataset.injuredCrawlerGroundClearance,
   oldHitboxesReplaced:!!first?.injuredHitboxes?.length&&
    first.hitMeshes.every(h=>h.name.startsWith("InjuredGLBHit_")),
   materials:(()=>{const mats=[];first?.injuredCrawlerModel?.traverse(o=>{
    if(o.isSkinnedMesh)for(const mat of (Array.isArray(o.material)?o.material:[o.material]))
     mats.push({name:mat.name,diffuse:!!mat.map?.image,normal:!!mat.normalMap?.image,
      width:mat.map?.image?.width||0,colorSpace:mat.map?.colorSpace});
   });return mats})()};
 },
 injuredMotionAudit:()=>{
  const z=zombies.find(a=>a.injuredCrawlerVisual&&!a.dead);
  if(!z)throw Error("Missing injured crawler in Wave 5 test");
  const clip=injuredCrawlerAsset.clip,holder=z.injuredCrawlerVisual;
  const boneNames=["L_UpperArm","R_UpperArm","L_UpperLeg",
   "R_UpperLeg","L_LowerLeg","R_LowerLeg","L_Foot","R_Foot"];
  const bones=boneNames.map(name=>z.injuredCrawlerBones.get(name));
  if(bones.some(b=>!b))throw Error("Missing original animation joints");
  const start=bones.map(b=>b.quaternion.clone());
  const orig=z.g.position.clone(),prev=[z.injuredCrawlerPrevX,z.injuredCrawlerPrevZ];
  const rootY=holder.position.y;
  let maxArmChange=0,maxLegChange=0,maxRootChange=0,minFloorGap=Infinity,maxFloorGap=-Infinity;
  let minKnee=Infinity,minFoot=Infinity,minToe=Infinity,maxClipCorrection=0;
   let minPull=Infinity,maxPull=-Infinity;
  for(let i=0;i<95;i++){
   z.g.position.x+=.013;z.g.position.z+=.007;
   updateInjuredCrawlerVisual(z,1/60);
   for(let j=0;j<bones.length;j++){
    const angle=start[j].angleTo(bones[j].quaternion);
    if(j<2)maxArmChange=Math.max(maxArmChange,angle);
    else maxLegChange=Math.max(maxLegChange,angle);
   }
   maxRootChange=Math.max(maxRootChange,Math.abs(holder.position.y-rootY));
   // Verify actual knee/foot world clearance after bone-only correction.
   for(const side of ["L","R"]){
    const knee=z.injuredCrawlerBones.get(side+"_LowerLeg");
    const foot=z.injuredCrawlerBones.get(side+"_Foot");
    minKnee=Math.min(minKnee,knee.getWorldPosition(new THREE.Vector3()).y-z.g.position.y);
    minFoot=Math.min(minFoot,foot.getWorldPosition(new THREE.Vector3()).y-z.g.position.y);
   }
   maxClipCorrection=Math.max(maxClipCorrection,
    Number(document.documentElement.dataset.injuredCrawlerLegCorrection||0));
   if(i%12===0){
    const bounds=new THREE.Box3().setFromObject(holder,true);
    const gap=bounds.min.y-z.g.position.y;
    minFloorGap=Math.min(minFloorGap,gap);maxFloorGap=Math.max(maxFloorGap,gap);
   }
  }
  const legTracks=clip.tracks.filter(track=>/(left|right)(up)?leg/i.test(track.name)).length;
  const time=z.injuredCrawlerAction.time;
  z.g.position.copy(orig);z.injuredCrawlerPrevX=prev[0];z.injuredCrawlerPrevZ=prev[1];
  updateInjuredCrawlerHitboxes(z);
  return {legTracks,clipName:clip.name,clipTracks:clip.tracks.length,
   maxArmChange,maxLegChange,maxRootChange,minFloorGap,maxFloorGap,
   minKnee,minFoot,maxClipCorrection,
   playbackTime:time,originalBones:bones.length,oldPinnedLegs:!!z.injuredCrawlerDragLegPose};
 },
 injuredDamageAudit:()=>{
  const z=zombies.find(a=>a.injuredCrawlerVisual&&!a.dead);
  if(!z)throw Error("new crawler missing");
  const before=parts.filter(p=>p.limb).length,old=z.g.getObjectByName("CrawlerBodyBlood");
  const head=z.injuredHitboxes.find(h=>h.part==="head");
  const loc=head.mesh.getWorldPosition(new THREE.Vector3());
  const r=new THREE.Raycaster();r.set(loc.clone().add(new THREE.Vector3(0,0,2)),
   new THREE.Vector3(0,0,-1));
  const hit=r.intersectObject(head.mesh,false).length;
  const prior=z.injuredCrawlerModel?.getObjectByProperty("isSkinnedMesh",true)?.geometry?.index?.count||0;
  detachArm(z,"left");detachLeg(z,"right");
  const after=z.injuredCrawlerModel?.getObjectByProperty("isSkinnedMesh",true)?.geometry?.index?.count||0;
  const legacyMeshes=[];
  z.g.traverse(o=>{if(o.isMesh&&!o.name.startsWith("InjuredGLBHit_")&&
   !o.userData.visualOnly&&!o.isSkinnedMesh&&o.visible)legacyMeshes.push(o.name||"unnamed")});
  return {hit,partsDelta:parts.filter(p=>p.limb).length-before,oldGoreVisible:!!old?.visible,
   clipped:prior-after,legacyMeshes,armGone:z.leftArmDetached,legGone:z.rightLegDetached,
   liveSkinned:!!z.injuredCrawlerModel?.getObjectByProperty("isSkinnedMesh",true)};
 },
 seedInfectedAudit:()=>{
  const slots=zombies.filter(z=>!z.dead&&z.kind==="shambler").slice(0,3);
  if(slots.length!==3)throw Error("Missing normal Wave 1 shambler positions");
  for(let i=0;i<3;i++)makeZombie(slots[i].g.position.x,slots[i].g.position.z,
   waveSpawned+i,"infected");
  return zombies.filter(z=>!z.dead&&z.kind==="infected"&&z.infectedVisual).length;
 },
 infectedDebug:()=>({
  wave,waveSpawned,waveTarget,ready:!!infectedGlbAsset,assetError:String(infectedGlbError||""),
  attached:document.documentElement.dataset.infectedGlbAttached,
  attachError:document.documentElement.dataset.infectedGlbAttachError,
  gameErrors:document.documentElement.dataset.cityOutbreakBuild,
  zombies:zombies.slice(0,10).map(z=>({kind:z.kind,dead:z.dead,
   rig:!!z.rigVisual,newVisual:!!z.infectedVisual,
   bones:z.infectedBones?.size||0,source:z.infectedGLBSource||null}))
 }),
 infectedVisualQA:()=>{
  const z=zombies.find(a=>a.kind==="infected"&&!a.dead&&a.infectedVisual);
  if(!z)throw Error("No live original Infected for render audit");
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x283038);
  scene.add(new THREE.HemisphereLight(0xd9e6f4,0x474a3a,2.5));
  const sun=new THREE.DirectionalLight(0xffffff,2.6);sun.position.set(-2,6,5);scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(14,14),
   new THREE.MeshLambertMaterial({color:0x62686b}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.04;scene.add(ground);
  const rd=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});
  rd.setSize(360,420);rd.setPixelRatio(1);rd.outputColorSpace=THREE.SRGBColorSpace;
  const camera=new THREE.PerspectiveCamera(43,360/420,.1,60);
  const result=[];
  const snap=(name)=>{
   // Hitbox userData.zombie is circular: sanitize only for clone, restore
   // before game continues. This does not modify skinned geometry or gameplay.
   const restored=[];
   z.infectedVisual.traverse(o=>{
    if(o.userData&&o.userData.zombie){
     restored.push([o,o.userData]);o.userData={...o.userData,zombie:null};
    }
   });
   let copy;
   try{copy=SkeletonUtils.clone(z.infectedVisual)}
   finally{for(const [o,data] of restored)o.userData=data}
   scene.add(copy);copy.updateMatrixWorld(true);
   // The articulated body can skid during collapse. Keep the diagnostic
   // camera aimed at the corpse rather than losing it outside a fixed crop.
   const bounds=new THREE.Box3().setFromObject(copy,true);
   const center=bounds.getCenter(new THREE.Vector3());
   copy.position.x-=center.x;copy.position.z-=center.z;
   copy.updateMatrixWorld(true);
   if(name.includes("side"))camera.position.set(4.1,1.55,1.0);
   else camera.position.set(1.45,1.45,4.2);
   camera.lookAt(0,.77,0);
   rd.render(scene,camera);
   result.push({name,jpeg:rd.domElement.toDataURL("image/jpeg",.75)});
   scene.remove(copy);
  };
  z.phase=.30;syncInfectedGLB(z,0);snap("walk_a");
  z.phase=Math.PI*.5;syncInfectedGLB(z,0);snap("walk_b");snap("walk_side");
  killZ(z,false,z.g.position.clone());
  for(let i=0;i<10;i++)updateRagdoll(z,1/60);
  snap("death_early");snap("death_early_side");
  for(let i=0;i<19;i++)updateRagdoll(z,1/60);
  snap("death_half");snap("death_half_side");
  for(let i=0;i<62;i++)updateRagdoll(z,1/60);
  snap("death_settled");snap("death_side");
  rd.dispose();return result;
 },
 infectedCrawlerAudit:()=>{
  const z=zombies.find(a=>a.kind==="infected"&&!a.dead&&a.infectedVisual);
  if(!z)throw Error("New Infected GLB not attached: "+JSON.stringify({
   ready:!!infectedGlbAsset,error:infectedGlbError,
   attachError:document.documentElement.dataset.infectedGlbAttachError,
   zombies:zombies.filter(q=>!q.dead).map(q=>({kind:q.kind,infectedVisual:!!q.infectedVisual,
    rig:!!q.rigVisual,hasHitMeshes:!!q.hitMeshes,source:q.infectedGLBSource})).slice(0,10)
  }));
  const beforeCount=zombies.length,root=z.g,visual=z.infectedVisual,meshCount=[];
  const glb=z.infectedModel,source=z.infectedGLBSource,hadTexture=!!glb?.getObjectByProperty;
  visual.traverse(o=>{if(o.isSkinnedMesh)meshCount.push(o.name)});
  // v658: verify actual source Mixamo shoulder/elbow/wrist chains while
  // STANDING, before amputating. A screenshot alone can hide T-pose regression.
  const prevPhase=z.phase,standingFrames=[];
  for(const p of [.3,Math.PI*.5,Math.PI*1.2,Math.PI*1.65]){
   z.phase=p;syncInfectedGLB(z,0);
   const point=key=>{
    const b=z.infectedBones?.get(key);
    return b?z.g.worldToLocal(b.getWorldPosition(new THREE.Vector3())).toArray():null;
   };
   standingFrames.push({
    phase:p,arms:[-1,1].map(side=>{
     const pre=side<0?"L":"R";
     return{shoulder:point(pre+"_UpperArm"),elbow:point(pre+"_LowerArm"),
      wrist:point(pre+"_Hand")};
    }),
    knees:[point("L_UpperLeg"),point("L_LowerLeg"),point("L_Foot"),
     point("R_UpperLeg"),point("R_LowerLeg"),point("R_Foot")]
   });
  }
  z.phase=prevPhase;syncInfectedGLB(z,0);
  // v695: sample an entire authored gait instead of only four sparse upper
  // body checkpoints. One real Mixamo ankle's forward maximum can fall
  // between those four phases despite its full cycle articulating correctly.
  // Reset foot-plant bookkeeping for these static rig samples; the separate
  // 64-frame MOVING actor test below still asserts truly planted feet.
  const gaitFootFrames=[];
  for(let i=0;i<24;i++){
   z.infectedFootPlants=null;
   z.phase=i*Math.PI*2/24;
   syncInfectedGLB(z,0);
   gaitFootFrames.push(["L","R"].map(side=>{
    const foot=z.infectedBones.get(side+"_Foot");
    return z.g.worldToLocal(foot.getWorldPosition(new THREE.Vector3())).toArray();
   }));
  }
  z.infectedFootPlants=null;
  z.phase=prevPhase;syncInfectedGLB(z,0);
  // v658: measure shoes in WORLD SPACE while a REAL actor advances.
  // Previous tests rotated knees in place and missed ice-skating planted feet.
  const initialActor=z.g.position.clone(),initialPhase=z.phase;
  z.infectedFootPlants=null;
  const footSupport={L:{n:0,maxStep:0},R:{n:0,maxStep:0}};
  const former={L:null,R:null};
  for(let i=0;i<64;i++){
   z.g.position.z-=.023;z.phase+=.115;syncInfectedGLB(z,1/60);
   for(const side of ["L","R"]){
    const foot=z.infectedBones.get(side+"_Foot");
    const p=foot.getWorldPosition(new THREE.Vector3()),state=z.infectedFootPlants?.[side];
    if(!state?.swinging&&former[side]){
     const dxz=Math.hypot(p.x-former[side].x,p.z-former[side].z);
     footSupport[side].maxStep=Math.max(footSupport[side].maxStep,dxz);
     footSupport[side].n++;
    }
    former[side]=state&&!state.swinging?p:null;
   }
  }
  const groundedStepAudit={...footSupport,actorTravel:initialActor.distanceTo(z.g.position)};
  z.g.position.copy(initialActor);z.phase=initialPhase;
  z.infectedFootPlants=null;syncInfectedGLB(z,0);
  const angle=(a,b)=>{const d=a.reduce((s,v,i)=>s+v*b[i],0);
   const la=Math.hypot(...a),lb=Math.hypot(...b);
   return Math.acos(Math.max(-1,Math.min(1,d/(la*lb||1))))};
  const metrics=standingFrames.map(f=>f.arms.map(a=>{
   const s=a.shoulder,e=a.elbow,w=a.wrist;
   return{handDrop:s[1]-w[1],elbowDrop:s[1]-e[1],
    handForward:s[2]-w[2],elbowForward:s[2]-e[2],
    elbowFlex:angle(e.map((v,i)=>v-s[i]),w.map((v,i)=>v-e[i]))};
  }));
  const knees=standingFrames.map(frame=>[0,1].map(i=>{
   const j=i*3,H=frame.knees[j],K=frame.knees[j+1],F=frame.knees[j+2];
   return angle(K.map((n,k)=>n-H[k]),F.map((n,k)=>n-K[k]));
  }));
  const legTravel=[0,1].map(i=>{
   const a=gaitFootFrames.map(f=>f[i]);
   return{forward:Math.max(...a.map(p=>p[2]))-Math.min(...a.map(p=>p[2])),
    lift:Math.max(...a.map(p=>p[1]))-Math.min(...a.map(p=>p[1]))};
  });
  const sizeBounds=new THREE.Box3().setFromObject(visual,true);
  const skinnedHeight=sizeBounds.max.y-sizeBounds.min.y;
  const standingAudit={frames:standingFrames,metrics,knees,legTravel,skinnedHeight,groundedStepAudit,
   wristTravel:[0,1].map(i=>Math.max(...standingFrames.map(f=>f.arms[i].wrist[2]))-
    Math.min(...standingFrames.map(f=>f.arms[i].wrist[2]))),
   kneeAngles:["L_LowerLeg","R_LowerLeg"].map(key=>{
    const bone=z.infectedBones.get(key),rest=z.infectedRest.get(key);
    return bone?.quaternion.angleTo(rest)||0;
   })};
  // A single severed original GLB leg may leave a toe-weighted boot triangle.
  // Count triangles in the CURRENT render index that still reference weighted
  // severed Foot / ToeBase vertices (not merely the old uncut base geometry).
  const residualFootFaces=side=>{
   const root=z.infectedBones.get((side==="left"?"L":"R")+"_Foot");
   const removed=new Set();root?.traverse(b=>{if(b.isBone)removed.add(b)});
   let faces=0;
   visual.traverse(mesh=>{
    if(!mesh.isSkinnedMesh||!mesh.skeleton)return;
    const geo=mesh.geometry,base=mesh.userData.infectedBaseGeometry||geo;
    const skin=base.getAttribute("skinIndex"),weight=base.getAttribute("skinWeight");
    if(!skin||!weight)return;
    const ids=new Set(mesh.skeleton.bones.map((b,i)=>removed.has(b)?i:-1).filter(i=>i>=0));
    if(!ids.size)return;
    const distal=i=>{
     let w=0;for(let k=0;k<Math.min(4,skin.itemSize,weight.itemSize);k++)
      if(ids.has(skin.getComponent(i,k)))w+=weight.getComponent(i,k);
     return w;
    };
    const index=geo.index,n=index?.count||geo.getAttribute("position").count;
    const read=i=>index?index.getX(i):i;
    for(let k=0;k+2<n;k+=3)
     if(Math.max(distal(read(k)),distal(read(k+1)),distal(read(k+2)))>.12)faces++;
   });
   return faces;
  };
  z.hp=Math.max(z.hp,65);
  detachLeg(z,"left");
  const firstFootResidue=residualFootFaces("left");
  detachLeg(z,"right");
  const finalFootResidue=[residualFootFaces("left"),residualFootFaces("right")];
  poseOriginalInfectedCrawler(z);
  const hitboxes=z.hitMeshes||[],bones=z.crawlerUpperBones;
  const jp=key=>bones?.get(key)?.getWorldPosition(new THREE.Vector3())||null;
  const local=key=>{const q=jp(key);return q?z.g.worldToLocal(q):null;};
  const h=local("Hips"),c=local("Chest"),head=local("Head"),
   left=local("L_Hand"),right=local("R_Hand");
  // v658: inspect ORIGINAL joints at forward plant, backward pull, and
  // recovered hand lift. Also ensure elbow bends below the shoulder toward
  // the ground and neither elbow folds behind its shoulder.
  const originalPhase=z.phase,armFrames=[];
  for(const crawlPhase of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
   z.phase=crawlPhase;poseOriginalInfectedCrawler(z);
   armFrames.push(["L_Hand","R_Hand","L_LowerArm","R_LowerArm","L_UpperArm","R_UpperArm"]
    .map(key=>local(key)?.toArray()||null));
  }
  z.phase=originalPhase;poseOriginalInfectedCrawler(z);
  const elbowsSupportChest=armFrames.every(frame=>[0,1].every(side=>{
   const wrist=frame[side],elbow=frame[side+2],shoulder=frame[side+4];
   return wrist&&elbow&&shoulder&&elbow[1]<shoulder[1]-.035&&
    elbow[1]>wrist[1]-.09&&
    elbow[2]<shoulder[2]+.06&&elbow[2]>wrist[2]-.12&&
    wrist[2]<shoulder[2]-.065;
  }));
  const armMotion={
   leftTravel:Math.abs(armFrames[0][0][2]-armFrames[2][0][2]),
   rightTravel:Math.abs(armFrames[0][1][2]-armFrames[2][1][2]),
   leftElbowTravel:Math.abs(armFrames[0][2][2]-armFrames[2][2][2]),
   rightElbowTravel:Math.abs(armFrames[0][3][2]-armFrames[2][3][2]),
   // LEFT planted at PI/2 and recovers at 3PI/2; RIGHT is opposite.
   leftRecoveryLift:armFrames[3][0][1]-armFrames[1][0][1],
   rightRecoveryLift:armFrames[1][1][1]-armFrames[3][1][1],
   oppositeStroke:(armFrames[0][0][2]-armFrames[2][0][2])*
    (armFrames[0][1][2]-armFrames[2][1][2])<0,
   elbowsSupportChest
  };
  const skinAudit=z.infectedCrawlerSkinAudit||null,clippedSkins=[];
  visual.traverse(o=>{if(o.isSkinnedMesh)clippedSkins.push({
   name:o.name,faces:Math.floor((o.geometry.index?.count||o.geometry.attributes.position?.count||0)/3)})});
  const visualBox=new THREE.Box3().setFromObject(visual,true);
  const shoot=key=>{
   const bone=bones?.get(key);if(!bone)return false;
   const origin=bone.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,1,0));
   const ray=new THREE.Raycaster(origin,new THREE.Vector3(0,-1,0),0,3);
   return ray.intersectObjects(hitboxes,false).some(x=>x.object.userData.zombie===z);
  };
  return{kind:z.kind,source:z.crawlerSourceKind,originalActor:zombies.includes(z),
   noReplacement:zombies.length===beforeCount,sameRoot:z.g===root,sameVisibleRig:z.infectedVisual===visual,uploadedGLB:source,
   visibleSkins:meshCount.length,colliders:hitboxes.length,skinAudit,clippedSkins,armMotion,standingAudit,firstFootResidue,finalFootResidue,
   hasNativeTexture:(()=>{let ok=false;glb?.traverse(o=>{if(o.isSkinnedMesh&&(Array.isArray(o.material)?o.material:[o.material]).some(m=>!!m?.map))ok=true});return ok})(),
   pose:{hipY:h?.y,chestY:c?.y,headY:head?.y,headForward:h&&head?h.z-head.z:null,
    chestForward:h&&c?h.z-c.z:null,handYs:[left?.y,right?.y],
    handsApart:left&&right?left.distanceTo(right):null,
    visualHeight:visualBox.max.y-visualBox.min.y},
   headshot:hitboxes.some(x=>x.userData.part==="head"&&x.userData.isHead),
   body:hitboxes.some(x=>x.userData.part==="torso"),hitHead:shoot("Head"),hitChest:shoot("Chest"),
   leftLegGone:z.leftLegDetached,rightLegGone:z.rightLegDetached,flag:z.infectedCrawler};
 },
 infectedCrawlerDeathAudit:()=>{
  const z=zombies.find(a=>a.infectedCrawler&&!a.dead&&a.infectedVisual);
  if(!z)throw Error("Converted original Infected crawler unavailable");
  const visual=z.infectedVisual,model=z.infectedModel;
  killZ(z,false,z.g.position.clone());
  const r=z.ragdoll,f=r?.infectedPhysical;
  if(!f)throw Error("Converted crawler entered the old knotting particle solver");
  let worstJointError=0,penetration=0;
  const original=new Map([...f.nodes].map(([k,n])=>[k,n.p.clone()]));
  for(let i=0;i<165;i++){
   if(!r.active)break;
   updateRagdoll(z,1/60);
   for(const edge of f.edges){
    const a=f.nodes.get(edge.a),b=f.nodes.get(edge.b);
    worstJointError=Math.max(worstJointError,Math.abs(a.p.distanceTo(b.p)-edge.l)/edge.l);
   }
   for(const node of f.nodes.values()){
    const floor=sampleRagdollGroundY(node.p.x,node.p.z,f.groundY,node.p.y);
    penetration=Math.max(penetration,floor+node.radius-node.p.y);
   }
  }
  const nonLeg=[...f.nodes].filter(([k])=>!k.includes("Leg")&&!k.includes("Foot"));
  const spread=Math.max(...nonLeg.map(([k,n])=>n.p.distanceTo(f.nodes.get("Hips").p)));
  return{dead:z.dead,source:z.infectedGLBSource,originalVisual:z.infectedVisual===visual,
   originalModel:z.infectedModel===model,physical:!!f,oldPbd:!!r.bodyPbd,
   nodes:f.nodes.size,edges:f.edges.length,spread,
   worstJointError,penetration,
   legsMissing:!f.nodes.has("L_Foot")&&!f.nodes.has("R_Foot"),
   finite:[...f.nodes.values()].every(n=>[...n.p.toArray(),...n.previous.toArray()].every(Number.isFinite))};
 },
 infectedDeathAudit:()=>{
  const z=zombies.find(a=>a.kind==="infected"&&!a.dead&&a.infectedVisual&&!a.infectedCrawler);
  if(!z)throw Error("Original standing Infected missing for articulated death test");
  const visual=z.infectedVisual,model=z.infectedModel,bones=z.infectedBones;
  const start=z.g.position.clone(),initialHeadY=bones.get("Head").getWorldPosition(new THREE.Vector3()).y;
  killZ(z,false,z.g.position.clone());
  const rag=z.ragdoll,f=rag?.infectedPhysical;
  if(!f)throw Error("Original infected did not enter articulated ragdoll");
  const away=new THREE.Vector3(z.g.position.x-px,0,z.g.position.z-pz).normalize();
  const chestNode=f.nodes.get("Chest"),hipNode=f.nodes.get("Hips");
  const releaseChest=chestNode.p.clone().sub(chestNode.previous);
  const releaseHip=hipNode.p.clone().sub(hipNode.previous);
  const backwardImpulse=releaseChest.clone().sub(releaseHip).dot(away);
  const samples=[],segmentErrors=[];
  let worstPenetration=0,peakMotion=0;
  for(let i=0;i<240;i++){
   if(!rag.active)break;
   updateRagdoll(z,1/60);
   for(const e of f.edges){
    const a=f.nodes.get(e.a),b=f.nodes.get(e.b);
    segmentErrors.push(Math.abs(a.p.distanceTo(b.p)-e.l)/e.l);
   }
   for(const n of f.nodes.values()){
    const floor=sampleRagdollGroundY(n.p.x,n.p.z,f.groundY,n.p.y);
    worstPenetration=Math.max(worstPenetration,floor+n.radius-n.p.y);
   }
   peakMotion=Math.max(peakMotion,f.maxMotion);
   if([9,29,47,90,150,210].includes(i)){
    samples.push({frame:i,headY:bones.get("Head").getWorldPosition(new THREE.Vector3()).y,
     hipY:bones.get("Hips").getWorldPosition(new THREE.Vector3()).y,
     minLowerBodyY:Math.min(...["L_LowerLeg","R_LowerLeg","L_Foot","R_Foot"].map(key=>
      bones.get(key)?.getWorldPosition(new THREE.Vector3()).y-rag.floorY??0)),
     contacts:f.contactCount});
   }
  }
  return{dead:z.dead,bodyPbd:!!rag.bodyPbd,physical:!!f,
   sameOriginalVisual:z.infectedVisual===visual,sameOriginalGLB:z.infectedModel===model,
   initialHeadY,samples,contacts:f.contactCount,settled:!rag.active,backwardImpulse,
   maxSegmentError:Math.max(...segmentErrors),worstPenetration,peakMotion,
   originalBones:bones.size,nodes:f.nodes.size,edges:f.edges.length,
   finite:[...f.nodes.values()].every(n=>[...n.p.toArray(),...n.previous.toArray()].every(Number.isFinite))};
 },
 selectViaRealBossRotation:()=>{
  // Force the final available name in the existing no-repeat bag, NOT the
  // spawn code or hardwired name: exercise the actual Wave 10 selection.
  for(const z of zombies)releaseZombieVisual(z);
  zombies=[];currentBoss=null;bossWaveName="";wave=10;sprinterOnlyTest=false;
  usedBossNames=BOSS_NAME_POOL.filter(n=>n!==PARASITE_BOSS_NAME);
  spawnWave();
  return {selected:bossWaveName,used:[...usedBossNames],poolSize:BOSS_NAME_POOL.length,
   unique:new Set(BOSS_NAME_POOL).size};
 },
 verifyRefill:()=>{const next=nextBossName();return {next,bag:[...usedBossNames]}},
 probe:()=>{
  const z=zombies.find(a=>a.bossName===PARASITE_BOSS_NAME&&!a.dead);
  if(!z?.parasiteBossVisual)return null;
  const holder=z.parasiteBossVisual,model=z.parasiteBossModel;
  const original=holder.scale.x,records=[];
  for(const factor of [.05,.15,.35,.65,1,1.5,2]){
   holder.scale.setScalar(original*factor);
   model.updateWorldMatrix(true,true);
   const b=new THREE.Box3().setFromObject(model,true);
   const entries=[];model.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const box=new THREE.Box3().setFromObject(mesh,true);
    const p=new THREE.Vector3(),real=new THREE.Box3().makeEmpty();
    const pos=mesh.geometry?.getAttribute("position");
    let n=0;
    if(pos)for(let i=0;i<pos.count;i+=Math.max(1,Math.floor(pos.count/500))){
     if(mesh.isSkinnedMesh)mesh.getVertexPosition(i,p);else p.fromBufferAttribute(pos,i);
     mesh.localToWorld(p);real.expandByPoint(p);n++;
    }
    entries.push({name:mesh.name,skinned:!!mesh.isSkinnedMesh,samples:n,
     boxHeight:box.max.y-box.min.y,vertexHeight:real.max.y-real.min.y});
   });
   records.push({factor,holderScale:holder.scale.x,boxHeight:b.max.y-b.min.y,
    boxes:entries.sort((a,b)=>b.boxHeight-a.boxHeight).slice(0,15)});
  }
  holder.scale.setScalar(original);model.updateWorldMatrix(true,true);
  return records;
 },
 preview:()=>{
  // Isolated front three-quarter visual QA of the ACTUAL 70-bone GLB.
  // Show full skin after two different imported Run/Attack poses.
  const z=zombies.find(a=>a.bossName===PARASITE_BOSS_NAME&&!a.dead);
  if(!z?.parasiteWalkAction||!z?.parasiteArmAction)return [];
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x29332f);
  const copy=SkeletonUtils.clone(z.parasiteBossModel);
  const root=new THREE.Group();root.rotation.y=z.parasiteBossVisual.rotation.y;
  root.scale.set(z.g.scale.x*z.parasiteBossVisual.scale.x,
   z.g.scale.y*z.parasiteBossVisual.scale.y,
   z.g.scale.z*z.parasiteBossVisual.scale.z);
  root.add(copy);scene.add(root);
  scene.add(new THREE.HemisphereLight(0xdfe8f2,0x55543e,2.7));
  const key=new THREE.DirectionalLight(0xffffff,2.7);key.position.set(5,10,8);scene.add(key);
  const fill=new THREE.DirectionalLight(0xc4d0ff,1.1);fill.position.set(-4,5,-6);scene.add(fill);
  const mixer=new THREE.AnimationMixer(copy);
  const w=mixer.clipAction(z.parasiteWalkAction.getClip()),a=mixer.clipAction(z.parasiteArmAction.getClip());
  w.setLoop(THREE.LoopRepeat,Infinity).play();a.setLoop(THREE.LoopRepeat,Infinity).play();
  const rd=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true,alpha:false});
  rd.setSize(240,290);rd.setPixelRatio(1);rd.outputColorSpace=THREE.SRGBColorSpace;
  const camera=new THREE.PerspectiveCamera(42,240/290,.1,100);
  const result=[];
  for(const t of [.12,.50,1.27]){
   mixer.setTime(t);
   root.updateMatrixWorld(true);
   const box=new THREE.Box3().setFromObject(root,true);
   const size=box.getSize(new THREE.Vector3()),c=box.getCenter(new THREE.Vector3());
   const dy=Math.max(3.2,size.y);
   camera.position.set(c.x+dy*.17,c.y+dy*.05,c.z+dy*1.88);
   camera.lookAt(c);
   rd.render(scene,camera);
   result.push({time:t,image:rd.domElement.toDataURL("image/jpeg",.7)});
  }
  rd.dispose();return result;
 },
 native:()=>{
  const z=zombies.find(a=>a.bossName===PARASITE_BOSS_NAME&&!a.dead);
  return [...(z?.parasiteNativeBones?.keys()||[])];
 },
 skinMotion:()=>{
  const z=zombies.find(a=>a.bossName===PARASITE_BOSS_NAME&&!a.dead);
  if(!z||!z.parasiteNativeBones)return {error:"missing test actor"};
  const keys=["LeftUpLeg","LeftLeg","RightUpLeg","RightLeg"];
  const samples=Object.fromEntries(keys.map(k=>[k,[]]));
  z.parasiteBossModel.traverse(mesh=>{
   if(!mesh.isSkinnedMesh)return;
   const ix=mesh.geometry.getAttribute("skinIndex"),wt=mesh.geometry.getAttribute("skinWeight");
   if(!ix||!wt)return;
   for(const key of keys){
    const joint=z.parasiteNativeBones.get(key);
    if(!joint)continue;
    const boneIndex=mesh.skeleton.bones.indexOf(joint);
    if(boneIndex<0)continue;
    // Sample along the ENTIRE weighted thigh/shin. The old first-55
    // selection was clustered at the joint, falsely hiding leg displacement.
    const found=[];
    for(let i=0;i<ix.count;i++){
     for(let j=0;j<4;j++)if(ix.getComponent(i,j)===boneIndex&&wt.getComponent(i,j)>.48){
      found.push(i);break;
     }
    }
    const arr=samples[key];
    const room=Math.max(0,60-arr.length);
    for(let t=0;t<Math.min(room,found.length);t++){
     const idx=found[Math.floor(t*(found.length-1)/Math.max(1,Math.min(room,found.length)-1))];
     arr.push({mesh,index:idx});
    }
   }
  });
  const pose=(phase)=>{
   z.parasiteBossMixer.setTime(phase);
   z.parasiteBossModel.updateWorldMatrix(true,true);
   z.parasiteBossModel.traverse(m=>{if(m.isSkinnedMesh)m.skeleton.update()});
   const out={};
   out.__bonePose={};
   for(const [name,joint] of z.parasiteNativeBones){
    const p=new THREE.Vector3();joint.getWorldPosition(p);
    out.__bonePose[name]={quaternion:joint.quaternion.toArray(),position:p.toArray()};
   }
   const left=z.parasiteNativeBones.get("LeftHand"),right=z.parasiteNativeBones.get("RightHand");
   if(left&&right){
    const p=new THREE.Vector3(),q=new THREE.Vector3();
    left.getWorldPosition(p);right.getWorldPosition(q);
    out.__hands={left:p.toArray(),right:q.toArray(),distance:p.distanceTo(q)};
   }
   for(const key of keys){
    out[key]=samples[key].map(({mesh,index})=>{
     const p=new THREE.Vector3();
     mesh.getVertexPosition(index,p);mesh.localToWorld(p);
     return p.toArray();
    });
   }
   return out;
  };
  // v597: sample the actual recorded, retargeted keyframe animations,
  // not hand-coded joint swings. Set action speeds to 1 for deterministic
  // time lookup, then compare opposite gait plus attack reaching frames.
  z.parasiteWalkAction.timeScale=1;
  z.parasiteArmAction.timeScale=1;
  const before=pose(.20),after=pose(1.45);
  const boneAngles={},boneWorldDistances={};
  for(const key of keys){
   const A=before.__bonePose[key],B=after.__bonePose[key];
   const q1=new THREE.Quaternion(...A.quaternion),q2=new THREE.Quaternion(...B.quaternion);
   boneAngles[key]=q1.angleTo(q2);
  }
  const dist=(a,b)=>Math.hypot(...before.__bonePose[a].position.map((v,i)=>v-before.__bonePose[b].position[i]));
  for(const [key,from,to] of [
    ["LeftUpper","LeftUpLeg","LeftLeg"],["LeftLower","LeftLeg","LeftFoot"],
    ["RightUpper","RightUpLeg","RightLeg"],["RightLower","RightLeg","RightFoot"],
    ["SpineHeight","Hips","Head"]]){
    boneWorldDistances[key]=dist(from,to);
  }
  const displacement={};
  for(const key of keys){
   const d=before[key].map((p,i)=>Math.hypot(...p.map((v,j)=>v-after[key][i][j])));
   displacement[key]={vertices:d.length,average:d.reduce((a,b)=>a+b,0)/Math.max(1,d.length),
    max:Math.max(0,...d)};
  }
  const materials=[];
  z.parasiteBossModel.traverse(m=>{
   if(!m.isSkinnedMesh)return;
   const c=m.geometry.getAttribute("color");
   const values=[];
   if(c)for(let i=0;i<c.count;i+=Math.max(1,Math.floor(c.count/80)))
    values.push([c.getX(i),c.getY(i),c.getZ(i)]);
   const mat=m.material,tex=mat.map,normal=mat.normalMap;
   materials.push({name:m.name,usesVertexColors:mat.vertexColors,
    hasColorAttribute:!!c,colorSamples:values.length,
    distinct:new Set(values.map(v=>v.map(x=>Math.round(x*20)).join("_"))).size,
    diffuse:!!tex,normal:!!normal,
    diffuseWidth:tex?.image?.width||0,diffuseHeight:tex?.image?.height||0,
    uvCount:m.geometry.getAttribute("uv")?.count||0,
    colorSpace:tex?.colorSpace||null,normalWidth:normal?.image?.width||0,
    textureUUID:tex?.uuid||null});
  });
  const armMotion={};
  for(const side of ["left","right"]){
   const a=before.__hands?.[side],b=after.__hands?.[side];
   armMotion[side]=a&&b?Math.hypot(...a.map((v,i)=>v-b[i])):null;
  }
  return {displacement,materials,boneAngles,boneWorldDistances,
    armMotion,handGap:{before:before.__hands?.distance,after:after.__hands?.distance}};
 },
 inspect:()=>{
  const z=zombies.find(a=>a.bossName===PARASITE_BOSS_NAME&&!a.dead);
  if(!z)return null;
  const clip=parasiteBossAsset.animations[0];
  const model=z.parasiteBossModel;
  const materials=[],nodes=[],bones=[],skinned=[],meshes=[];
  model.traverse(o=>{
   if(o.isBone)bones.push({name:o.name,quaternion:o.quaternion.toArray(),position:o.position.toArray()});
   if(o.isMesh){
    meshes.push({name:o.name,skinned:o.isSkinnedMesh,visible:o.visible});
    for(const m of Array.isArray(o.material)?o.material:[o.material]){
     if(!m)continue;
     materials.push({name:m.name,color:m.color?.getHexString(),type:m.type,
      map:!!m.map,emissive:m.emissive?.getHexString(),roughness:m.roughness,
      texture:{width:m.map?.image?.width,height:m.map?.image?.height},
      mapColorSpace:m.map?.colorSpace});
    }
    if(o.isSkinnedMesh)skinned.push({name:o.name,boneCount:o.skeleton.bones.length,bones:o.skeleton.bones.slice(0,25).map(b=>b.name)});
   }
   if(o.name)nodes.push(o.name);
  });
  const action=z.parasiteBossMixer?._actions?.[0];
  const tracks=clip.tracks.slice(0,25).map(t=>({name:t.name,type:t.ValueTypeName,keyframes:t.times.length,first:Array.from(t.values).slice(0,4)}));
  let bound=0;const unbound=[];
  for(const t of clip.tracks){
   const target=t.name.split(".")[0];
   if(THREE.PropertyBinding.findNode(model,target))bound++;
   else if(unbound.length<28)unbound.push(target);
  }
  return {
   clips:parasiteBossAsset.animations.map(c=>({name:c.name,duration:c.duration,tracks:c.tracks.length})),
   totalTracks:clip.tracks.length,bound,unbound,tracks,
   modelChildren:model.children.map(o=>o.name),nodes:nodes.slice(0,65),bones:bones.slice(0,48),
   skinned,meshes,materials,
   mixer:{time:z.parasiteBossMixer?.time,actionTime:action?.time,
    actionWeight:action?.getEffectiveWeight(),actionEnabled:action?.enabled,
    actionPaused:action?.paused,
    boundProperties:action?._propertyBindings?.length,
    bindingExample:action?._propertyBindings?.slice(0,5).map(p=>({name:p?.binding?.path,node:p?.binding?.node?.name}))}
  };
 },
 state:()=>{
  const z=zombies.find(a=>a.bossName===PARASITE_BOSS_NAME&&!a.dead);
  return {wave,boss:z?.bossName||null,model:z?.parasiteBossModel?.name,
   attached:!!z?.parasiteBossVisual,hitboxes:z?.parasiteBossHitboxes?.length||0,
   mixer:!!z?.parasiteBossMixer,clips:parasiteBossAsset?.animations?.map(c=>c.name)||[],
   size:z?.parasiteMeasuredHeight||null,calibrated:!!z?.parasiteSizeCalibrated,
   sizeFrames:z?.parasiteSizeFrames||null,stableFrames:z?.parasiteSizeStableFrames||null,
   initialMeasurements:z?.parasiteHeightSamples||null,
   expectedHeight:z?.g?.scale.y*PARASITE_BOSS_VISUAL_HEIGHT||null,
   actualLiveHeight:z?.parasiteBossModel?new THREE.Box3().setFromObject(z.parasiteBossModel,true).getSize(new THREE.Vector3()).y:null,
   holderScale:z?.parasiteBossVisual?.scale.y||null,
   recorded:z?.parasiteRetargetStats||null,
   nativeRun:!!z?.parasiteWalkAction,nativeAttack:!!z?.parasiteArmAction,
   poolIncludesParasite:BOSS_NAME_POOL.includes(PARASITE_BOSS_NAME),
   poolIncludesPanzer:BOSS_NAME_POOL.includes(PANZER_BOSS_NAME),
   poolIncludesSuit:BOSS_NAME_POOL.includes(SUIT_BOSS_NAME),
   waveTarget,waveSpawned,build:document.documentElement.dataset.cityOutbreakBuild};
 }
};`;
   await route.fulfill({response:resp,body:source+addon,contentType:"application/javascript"});
  });
  const rsp=await page.goto("http://127.0.0.1:4173/?v=695-rotation-regression",{waitUntil:"domcontentloaded",timeout:63100});
  report.http=rsp?.status();
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.ready(),null,{timeout:110000});
  await page.locator("#start").click({noWaitAfter:true});
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.waveOne()?.spawned===10,null,{timeout:70000});
  report.waveOne=await page.evaluate(()=>globalThis.__parasiteSmoke.waveOne());
  report.normalRotation=await page.evaluate(()=>globalThis.__parasiteSmoke.normalRotation());
  report.crawlerRotation=await page.evaluate(()=>globalThis.__parasiteSmoke.seedBothNaturalCrawlers());
  report.forcedCrawler=await page.evaluate(()=>globalThis.__parasiteSmoke.forcedCrawlerConversionStillSeparate());
  report.injuredCrawler=await page.evaluate(()=>globalThis.__parasiteSmoke.injuredCrawlerAudit());
  report.injuredMotion=await page.evaluate(()=>globalThis.__parasiteSmoke.injuredMotionAudit());
  report.injuredDamage=await page.evaluate(()=>globalThis.__parasiteSmoke.injuredDamageAudit());
  report.infectedTestActors=await page.evaluate(()=>globalThis.__parasiteSmoke.seedInfectedAudit());
  const infectedImages=await page.evaluate(()=>globalThis.__parasiteSmoke.infectedVisualQA());
  report.infectedRenderFrames=infectedImages.map(f=>({name:f.name,bytes:f.jpeg.length}));
  for(const f of infectedImages)console.log("INFECTED_DIAGNOSTIC_"+f.name+"="+f.jpeg);
  report.infectedCrawler=await page.evaluate(()=>globalThis.__parasiteSmoke.infectedCrawlerAudit());
  report.infectedCrawlerDeath=await page.evaluate(()=>globalThis.__parasiteSmoke.infectedCrawlerDeathAudit());
  report.infectedDeath=await page.evaluate(()=>globalThis.__parasiteSmoke.infectedDeathAudit());
  report.rotation=await page.evaluate(()=>globalThis.__parasiteSmoke.selectViaRealBossRotation());
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.state().attached,null,{timeout:30000});
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.state().nativeRun&&
   globalThis.__parasiteSmoke?.state().nativeAttack,null,{timeout:30000});
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.state().calibrated,null,{timeout:50000});
  await page.waitForTimeout(550);
  report.state=await page.evaluate(()=>globalThis.__parasiteSmoke.state());
  report.inspectionAtStart=await page.evaluate(()=>globalThis.__parasiteSmoke.inspect());
  report.nativeNames=await page.evaluate(()=>globalThis.__parasiteSmoke.native());
  report.actualSkinMotion=await page.evaluate(()=>globalThis.__parasiteSmoke.skinMotion());
  try{
   const frames=await page.evaluate(()=>globalThis.__parasiteSmoke.preview());
   report.previewFrames=frames.map(f=>({time:f.time,bytes:f.image.length}));
   for(let i=0;i<frames.length;i++){
    console.log("PARASITE_V658_VISUAL_FRAME_"+i+"="+frames[i].image);
   }
  }catch(e){report.previewError=String(e)}

  await page.waitForTimeout(1100);
  report.inspectionAtLater=await page.evaluate(()=>globalThis.__parasiteSmoke.inspect());
  report.inspectionAtLater.bones=report.inspectionAtLater.bones.slice(0,30);
  report.inspectionAtLater.materials=report.inspectionAtLater.materials.slice(0,10);

  // The multi-scale diagnostic proved square-law behavior in v587; check the final live size here.
  assert.equal(report.http,200);
  assert.equal(report.assetHttp,200);
  assert.equal(report.state.build,"631");
  assert.equal(report.waveOne.wave,1);
  assert.equal(report.waveOne.target,10);
  assert.equal(report.waveOne.spawned,10);
  assert.equal(report.waveOne.bosses,0,"Wave 1 must contain only normal zombies");
  assert.equal(report.waveOne.preview,true,"Normal game must not force Sprinter-only test mode");
  assert.deepEqual(report.waveOne.kinds,["shambler"],"Wave 1 must return to normal shamblers");
  assert.equal(report.waveOne.newCrawlerCount,0,"No injured crawlers in Wave 1 after rotation approval");
  assert.equal(report.waveOne.oldCrawlerCount,0,"Original natural crawler stays eligible Wave 3+");
  assert(report.crawlerRotation?.liveNew&&report.crawlerRotation.liveOld&&
   report.crawlerRotation.preservedOriginalClips&&report.crawlerRotation.nativeInjuredClip&&
   report.crawlerRotation.waveNow===1&&
   report.crawlerRotation.variants.some(z=>z.injured&&z.injuredRig)&&
   report.crawlerRotation.variants.some(z=>z.natural&&z.naturalRig),
   "Both authentic crawler GLBs must spawn in normal rotation: "+JSON.stringify(report.crawlerRotation));
  assert(!report.forcedCrawler.forcedHasNatural&&!report.forcedCrawler.forcedHasInjured&&
   !report.forcedCrawler.forcedHasEitherVisual,"Forced crawler conversion unexpectedly replaced");
  assert(report.injuredCrawler?.count===1&&report.injuredCrawler.skinned&&
   report.injuredCrawler.bones>=14&&report.injuredCrawler.mixer&&
   report.injuredCrawler.actionPlaying&&report.injuredCrawler.clipTracks>=25&&
   report.injuredCrawler.length>.8&&report.injuredCrawler.length<4&&
   report.injuredCrawler.height>.15&&report.injuredCrawler.height<3&&
   Math.abs(report.injuredCrawler.floor-report.injuredCrawler.ground)<.30,
   "New injured crawler not animated/grounded: "+JSON.stringify(report.injuredCrawler));
  assert(report.injuredCrawler.hitboxes>=14&&report.injuredCrawler.oldHitboxesReplaced&&
   report.injuredCrawler.materials.length>=3&&
   report.injuredCrawler.materials.every(m=>m.diffuse&&m.normal&&m.width>0&&m.colorSpace==="srgb"),
   "Original crawler textures or new animated hit volumes missing: "+JSON.stringify(report.injuredCrawler));
  assert(report.injuredMotion.originalBones===8&&
   report.injuredMotion.clipTracks===51&&
   report.injuredMotion.maxArmChange>.025&&
   report.injuredMotion.maxLegChange>.004&&
   report.injuredMotion.maxRootChange<.00001&&
   !report.injuredMotion.oldPinnedLegs&&
   report.injuredMotion.minFloorGap>-.30&&report.injuredMotion.maxFloorGap<.40&&
   report.injuredMotion.minKnee>-.08&&report.injuredMotion.minFoot>-.08&&
   report.injuredMotion.maxClipCorrection>=0,
   "v695 original crawl must drag legs above the pavement without any root lift: "+
    JSON.stringify(report.injuredMotion));
  assert(report.injuredDamage.hit>0&&report.injuredDamage.partsDelta===0&&
   !report.injuredDamage.oldGoreVisible&&report.injuredDamage.legacyMeshes.length===0&&
   report.injuredDamage.clipped>0&&report.injuredDamage.armGone&&report.injuredDamage.legGone&&
   report.injuredDamage.liveSkinned,
   "The new crawler displayed generic limbs or old body mesh: "+JSON.stringify(report.injuredDamage));
  assert.deepEqual(report.normalRotation.first,["shambler","shambler","shambler","shambler"],
   "Wave 1 returns to approved shamblers");
  assert.deepEqual(report.normalRotation.second,["sprinter","shambler"],
   "Preserve Wave 2 mixed roster");
  assert.deepEqual(report.normalRotation.fifth,["infected","shambler"],
   "Original Infected must remain in normal Wave 5 rotation");
  assert.deepEqual(report.normalRotation.sixth,["infected","shambler"],
   "Original Infected must stay in later mixed waves");
  assert.equal(report.infectedTestActors,3,
   "Original Infected GLB must still spawn and attach for crawler/death regression");
  assert(report.infectedCrawler.originalActor&&report.infectedCrawler.noReplacement&&
   report.infectedCrawler.sameRoot&&report.infectedCrawler.sameVisibleRig&&
   report.infectedCrawler.flag&&report.infectedCrawler.source==="infected"&&
   report.infectedCrawler.kind==="crawler"&&report.infectedCrawler.visibleSkins>0&&
   report.infectedCrawler.uploadedGLB==="assets/zombie_animated.glb"&&
   report.infectedCrawler.hasNativeTexture,
   "Infected switched into a generic crawler instead of retaining its original rig: "+JSON.stringify(report.infectedCrawler));
  assert(report.infectedCrawler.leftLegGone&&report.infectedCrawler.rightLegGone&&
   report.infectedCrawler.headshot&&report.infectedCrawler.body&&
   report.infectedCrawler.colliders>=8&&report.infectedCrawler.hitHead&&
   report.infectedCrawler.hitChest,
   "Preserved Infected crawler missing legs/shot hitboxes: "+JSON.stringify(report.infectedCrawler));
  assert(report.infectedCrawlerDeath?.dead&&report.infectedCrawlerDeath.physical&&
   !report.infectedCrawlerDeath.oldPbd&&report.infectedCrawlerDeath.originalVisual&&
   report.infectedCrawlerDeath.originalModel&&report.infectedCrawlerDeath.legsMissing&&
   report.infectedCrawlerDeath.nodes>=9&&report.infectedCrawlerDeath.edges>=8&&
   report.infectedCrawlerDeath.worstJointError<.16&&
   report.infectedCrawlerDeath.penetration<.08&&report.infectedCrawlerDeath.spread>.25&&
   report.infectedCrawlerDeath.finite,
   "Original converted crawler death must not use tangled PBD or invert arms: "+
    JSON.stringify(report.infectedCrawlerDeath));
  const infected=report.infectedCrawler,ip=infected.pose;
  const stand=infected.standingAudit;
  assert(stand?.wristTravel?.every(x=>x>.05)&&
   stand.metrics.every(frame=>frame.every(arm=>
    arm.handDrop>.16&&arm.elbowDrop>.12&&arm.handForward>.055&&
    arm.elbowForward>-.035&&arm.elbowFlex>.20)),
   "Original Infected standing arms remain T-posed or straight despite v658 IK: "+
    JSON.stringify(stand?.metrics));

  assert(stand.skinnedHeight>1.90&&stand.skinnedHeight<2.85,
   "Infected GLB still undersized compared with human eye/camera height: "+stand.skinnedHeight);
  assert(stand.knees?.every(frame=>frame.every(k=>Number.isFinite(k)&&k<2.1))&&
   [0,1].every(i=>Math.max(...stand.knees.map(f=>f[i]))>.16&&
    stand.legTravel[i].forward>.075&&stand.legTravel[i].lift>.04)&&
   stand.groundedStepAudit.actorTravel>1.2&&
   ["L","R"].every(side=>stand.groundedStepAudit[side].n>8&&
    stand.groundedStepAudit[side].maxStep<.18),
   "Infected real Mixamo knees are locked or ankles aren't stepping: "+JSON.stringify({
    knees:stand.knees,travel:stand.legTravel}));
  assert(infected.skinAudit?.changed>=1&&infected.skinAudit?.removed>=10,
   "Leg skin clipping failed; zero-scaled thighs pull torso into ball: "+JSON.stringify(infected));
  assert(infected.firstFootResidue===0&&infected.finalFootResidue?.every(n=>n===0),
   "Severed Infected still displays skinned boot/toe faces: "+JSON.stringify([infected.firstFootResidue,infected.finalFootResidue]));
  assert(report.infectedDeath?.dead&&report.infectedDeath.physical&&
   !report.infectedDeath.bodyPbd&&report.infectedDeath.sameOriginalVisual&&
   report.infectedDeath.sameOriginalGLB&&report.infectedDeath.originalBones>=15&&
   report.infectedDeath.nodes>=14&&report.infectedDeath.edges>=13&&
   report.infectedDeath.finite&&report.infectedDeath.maxSegmentError<.15&&
   report.infectedDeath.worstPenetration<.08&&
   report.infectedDeath.samples.length>=3&&
   report.infectedDeath.initialHeadY-report.infectedDeath.samples[2].headY>.35&&
   report.infectedDeath.peakMotion>.1&&report.infectedDeath.backwardImpulse>.002&&
   report.infectedDeath.samples[1].minLowerBodyY>-.10&&
   report.infectedDeath.samples[2].minLowerBodyY>-.08&&
   // Sometimes a correctly grounded corpse fully settles before frame 90;
   // accept its last sampled contact only with >=8 real floor contacts.
   (report.infectedDeath.samples[3]?.minLowerBodyY ??
    (report.infectedDeath.settled&&report.infectedDeath.contacts>=8?
     report.infectedDeath.samples[2].minLowerBodyY:-10))>-.10,
   "Infected articulated physics must preserve segment lengths and ground contact while falling: "+
   JSON.stringify(report.infectedDeath));
  assert(ip&&ip.hipY>.025&&ip.hipY<.16&&ip.chestY>ip.hipY+.16&&
   ip.chestY>.27&&ip.chestY<.47&&ip.headY>.16&&ip.headForward>.14&&ip.handsApart>.22,
   "Infected still folded into a compact ball instead of dragging on its pelvis: "+JSON.stringify(ip));
  assert(infected.armMotion?.leftTravel>.08&&infected.armMotion?.rightTravel>.08&&
   infected.armMotion?.leftElbowTravel>.035&&infected.armMotion?.rightElbowTravel>.035&&
   infected.armMotion?.leftRecoveryLift>.025&&infected.armMotion?.rightRecoveryLift>.025&&
   infected.armMotion?.oppositeStroke&&infected.armMotion?.elbowsSupportChest,
   "Original Infected arms must plant, pull BACK under raised chest, recover FORWARD, never reverse elbows: "+JSON.stringify(infected.armMotion));
  assert(ip.handYs?.every(y=>Number.isFinite(y)&&y>-.12&&y<.38),
   "Infected support hands hover far above ground or clip floor: "+JSON.stringify(ip));
  assert.equal(report.rotation.poolSize,19);
  assert.equal(report.rotation.unique,19,"Boss rotation contains duplicate names");
  assert.equal(report.rotation.selected,"PARASITE MONSTER","Parasite not drawn through real no-repeat rotation");
  assert.equal(report.rotation.used.length,19,"No-repeat bag did not include every boss");
  assert.equal(report.state.wave,10);
  assert.equal(report.state.boss,"PARASITE MONSTER");
  assert.equal(report.state.model,"ParasiteBossOriginalGLB");
  assert.equal(report.state.waveTarget,1);
  assert.equal(report.state.waveSpawned,1);
  assert.equal(report.state.hitboxes,4);
  assert.equal(report.state.nativeRun,true,"Not running recorded Mixamo Run");
  assert.equal(report.state.nativeAttack,true,"Not running recorded Mixamo Attack");
  assert.equal(report.state.recorded?.run,"Run");
  assert.equal(report.state.recorded?.arms,"Attack");
  assert(report.state.recorded?.runSourceFrames>=20,"Source Run must be genuinely multiframe");
  assert(report.state.recorded?.walkTracks>=8&&report.state.recorded?.armTracks>=6,
   "Imported retarget not bound to Parasite native skeleton: "+JSON.stringify(report.state.recorded));
  const native=report.nativeNames||[];
  assert(["LeftArm","RightArm","LeftUpLeg","RightUpLeg","LeftLeg","RightLeg"].every(k=>native.includes(k)),
   "Original imported Mixamo limbs unavailable: "+native.join(","));
  for(const key of ["LeftUpLeg","LeftLeg","RightUpLeg","RightLeg"]){
   const v=report.actualSkinMotion?.displacement[key];
   assert(v?.vertices>=10&&v.average>.015,
    "REAL "+key+" skinned mesh not walking: "+JSON.stringify(v));
  }
  assert(["LeftHand","RightHand"].every(n=>native.includes(n)),"Hand joints missing");
  assert(report.actualSkinMotion.handGap.before>.5&&report.actualSkinMotion.handGap.after>.5,
    "Hands still together: "+JSON.stringify(report.actualSkinMotion.handGap));
  assert(report.actualSkinMotion.armMotion.left>.09&&report.actualSkinMotion.armMotion.right>.09,
    "Arms barely moving: "+JSON.stringify(report.actualSkinMotion.armMotion));
  assert(report.actualSkinMotion.boneAngles.LeftLeg>.1&&report.actualSkinMotion.boneAngles.RightLeg>.1,
    "Both knees not articulating");
  assert(report.actualSkinMotion.materials.length===2&&
    report.actualSkinMotion.materials.every(m=>m.diffuse&&m.normal&&
      m.diffuseWidth>0&&m.diffuseHeight>0&&m.normalWidth>0&&m.uvCount>0&&
      m.colorSpace==="srgb"&&!m.usesVertexColors),
    "Original embedded textures not restored on both skinned meshes: "+
      JSON.stringify(report.actualSkinMotion.materials));
  assert(report.inspectionAtStart.materials.some(m=>m.name.includes("parasitezombie")),
   "Imported original mesh materials missing");
  assert.equal(report.state.calibrated,true);
  assert(Number.isFinite(report.state.size));
  // Diagnostic only: test model's final size/facing must be approved by user.
  // Do not treat a stable scene as visual signoff.
  assert(Number.isFinite(report.state.actualLiveHeight)&&report.state.actualLiveHeight>0);
  // The original model has a fixed 0.9*1.57763 holder transform, even when
  // the ACTUAL recorded walk is bent, crouched or airborne in a keyframe.
  assert(Math.abs(report.state.holderScale-1.419867)<.00001,
   "Approved 10%-smaller Parasite holder scale changed");
  assert(report.state.actualLiveHeight>3.6&&report.state.actualLiveHeight<5.5,
   "Recorded movement made boss geometry implausibly sized: "+report.state.actualLiveHeight);
  assert.equal(report.state.poolIncludesParasite,true);
  report.refill=await page.evaluate(()=>globalThis.__parasiteSmoke.verifyRefill());
  assert.equal(report.refill.bag.length,1,"Boss selection did not refill after all 19 names");
  assert.equal(report.state.poolIncludesPanzer,true);
  assert.equal(report.state.poolIncludesSuit,true);
  assert.equal(errors.length,0,"Browser JS exceptions: "+errors.join("; "));
  report.errors=errors;report.pass=true;
 }catch(e){
  report.failure=String(e?.stack||e);
  try{report.debugState=await page.evaluate(()=>globalThis.__parasiteSmoke?.state())}catch(_){}
  try{report.debugInfected=await page.evaluate(()=>globalThis.__parasiteSmoke?.infectedDebug())}catch(_){}
  report.errors=errors;
 }
 finally{
  if(browser)await browser.close();
  report.completedAt=new Date().toISOString();
  fs.writeFileSync("PARASITE_V658_AUDIT.json",JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify(report,null,2));
  if(!report.pass)process.exitCode=1;
 }
})();
