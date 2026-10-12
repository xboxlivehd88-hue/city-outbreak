const {chromium}=require("playwright"),fs=require("fs"),assert=require("assert/strict");
(async()=>{
 const report={version:"608",pass:false};let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  const page=await browser.newPage({viewport:{width:1200,height:800}});
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  page.on("response",r=>{if(r.url().includes("parasite_des_zombie_monster_game_model_free.glb"))report.assetHttp=r.status()});
  await page.route(/\/src\/game\.js\?v=608$/,async route=>{
   const resp=await route.fetch(),source=await resp.text();
   const addon=`
;globalThis.__parasiteSmoke={
 ready:()=>!!parasiteBossAsset&&!!naturalCrawlerAsset&&newCityCollisionReady,
 waveOne:()=>({wave,target:waveTarget,spawned:waveSpawned,live:zombies.filter(z=>!z.dead).length,bosses:zombies.filter(z=>z.kind==="boss"&&!z.dead).length}),
 selectViaRealBossRotation:()=>{
  // Force the final available name in the existing no-repeat bag, NOT the
  // spawn code or hardwired name: exercise the actual Wave 10 selection.
  for(const z of zombies)releaseZombieVisual(z);
  zombies=[];currentBoss=null;bossWaveName="";wave=10;
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
  const rsp=await page.goto("http://127.0.0.1:4173/?v=608-rotation-regression",{waitUntil:"domcontentloaded",timeout:60800});
  report.http=rsp?.status();
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.ready(),null,{timeout:110000});
  await page.locator("#start").click();
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.waveOne()?.spawned===10,null,{timeout:30000});
  report.waveOne=await page.evaluate(()=>globalThis.__parasiteSmoke.waveOne());
  report.rotation=await page.evaluate(()=>globalThis.__parasiteSmoke.selectViaRealBossRotation());
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.state().attached,null,{timeout:30000});
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.state().nativeRun&&
   globalThis.__parasiteSmoke?.state().nativeAttack,null,{timeout:30000});
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.state().calibrated,null,{timeout:20000});
  await page.waitForTimeout(550);
  report.state=await page.evaluate(()=>globalThis.__parasiteSmoke.state());
  report.inspectionAtStart=await page.evaluate(()=>globalThis.__parasiteSmoke.inspect());
  report.nativeNames=await page.evaluate(()=>globalThis.__parasiteSmoke.native());
  report.actualSkinMotion=await page.evaluate(()=>globalThis.__parasiteSmoke.skinMotion());
  try{
   const frames=await page.evaluate(()=>globalThis.__parasiteSmoke.preview());
   report.previewFrames=frames.map(f=>({time:f.time,bytes:f.image.length}));
   for(let i=0;i<frames.length;i++){
    console.log("PARASITE_V608_VISUAL_FRAME_"+i+"="+frames[i].image);
   }
  }catch(e){report.previewError=String(e)}

  await page.waitForTimeout(1100);
  report.inspectionAtLater=await page.evaluate(()=>globalThis.__parasiteSmoke.inspect());
  report.inspectionAtLater.bones=report.inspectionAtLater.bones.slice(0,30);
  report.inspectionAtLater.materials=report.inspectionAtLater.materials.slice(0,10);

  // The multi-scale diagnostic proved square-law behavior in v587; check the final live size here.
  assert.equal(report.http,200);
  assert.equal(report.assetHttp,200);
  assert.equal(report.state.build,"608");
  assert.equal(report.waveOne.wave,1);
  assert.equal(report.waveOne.target,10);
  assert.equal(report.waveOne.spawned,10);
  assert.equal(report.waveOne.bosses,0,"Wave 1 must contain only normal zombies");
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
 }
 finally{
  if(browser)await browser.close();
  report.completedAt=new Date().toISOString();
  fs.writeFileSync("PARASITE_V608_AUDIT.json",JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify(report,null,2));
  if(!report.pass)process.exitCode=1;
 }
})();
