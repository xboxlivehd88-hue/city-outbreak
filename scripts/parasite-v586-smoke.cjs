const {chromium}=require("playwright"),fs=require("fs"),assert=require("assert/strict");
(async()=>{
 const report={version:"594",pass:false};let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  const page=await browser.newPage({viewport:{width:1200,height:800}});
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  page.on("response",r=>{if(r.url().includes("parasite_des_zombie_monster_game_model_free.glb"))report.assetHttp=r.status()});
  await page.route(/\/src\/game\.js\?v=594$/,async route=>{
   const resp=await route.fetch(),source=await resp.text();
   const addon=`
;globalThis.__parasiteSmoke={
 ready:()=>!!parasiteBossAsset&&newCityCollisionReady,
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
   z.parasiteWalkPhase=phase;z.parasiteWalkBlend=1;
   z.parasiteWalkLastX=z.g.position.x-.075;
   syncParasiteBossVisual(z,.016);
   z.parasiteBossModel.updateWorldMatrix(true,true);
   z.parasiteBossModel.traverse(m=>{if(m.isSkinnedMesh)m.skeleton.update()});
   const out={};
   for(const key of keys){
    out[key]=samples[key].map(({mesh,index})=>{
     const p=new THREE.Vector3();
     mesh.getVertexPosition(index,p);mesh.localToWorld(p);
     return p.toArray();
    });
   }
   return out;
  };
  const before=pose(.10),after=pose(2.35);
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
   materials.push({name:m.name,usesVertexColors:m.material.vertexColors,
    hasColorAttribute:!!c,colorSamples:values.length,
    distinct:new Set(values.map(v=>v.map(x=>Math.round(x*20)).join("_"))).size});
  });
  return {displacement,materials};
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
   poolIncludesParasite:BOSS_NAME_POOL.includes(PARASITE_BOSS_NAME),
   poolIncludesPanzer:BOSS_NAME_POOL.includes(PANZER_BOSS_NAME),
   poolIncludesSuit:BOSS_NAME_POOL.includes(SUIT_BOSS_NAME),
   waveTarget,waveSpawned,build:document.documentElement.dataset.cityOutbreakBuild};
 }
};`;
   await route.fulfill({response:resp,body:source+addon,contentType:"application/javascript"});
  });
  const rsp=await page.goto("http://127.0.0.1:4173/?v=594-asset-test",{waitUntil:"domcontentloaded",timeout:60000});
  report.http=rsp?.status();
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.ready(),null,{timeout:110000});
  await page.locator("#start").click();
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.state().attached,null,{timeout:30000});
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.state().calibrated,null,{timeout:20000});
  await page.waitForTimeout(550);
  report.state=await page.evaluate(()=>globalThis.__parasiteSmoke.state());
  report.inspectionAtStart=await page.evaluate(()=>globalThis.__parasiteSmoke.inspect());
  report.nativeNames=await page.evaluate(()=>globalThis.__parasiteSmoke.native());
  report.actualSkinMotion=await page.evaluate(()=>globalThis.__parasiteSmoke.skinMotion());
  await page.waitForTimeout(1100);
  report.inspectionAtLater=await page.evaluate(()=>globalThis.__parasiteSmoke.inspect());
  report.inspectionAtLater.bones=report.inspectionAtLater.bones.slice(0,30);
  report.inspectionAtLater.materials=report.inspectionAtLater.materials.slice(0,10);

  // The multi-scale diagnostic proved square-law behavior in v587; check the final live size here.
  assert.equal(report.http,200);
  assert.equal(report.assetHttp,200);
  assert.equal(report.state.build,"594");
  assert.equal(report.state.wave,1);
  assert.equal(report.state.boss,"PARASITE MONSTER");
  assert.equal(report.state.model,"ParasiteBossOriginalGLB");
  assert.equal(report.state.waveTarget,1);
  assert.equal(report.state.waveSpawned,1);
  assert.equal(report.state.hitboxes,4);
  const native=report.nativeNames||[];
  assert(["LeftArm","RightArm","LeftUpLeg","RightUpLeg","LeftLeg","RightLeg"].every(k=>native.includes(k)),
   "Original imported Mixamo limbs unavailable: "+native.join(","));
  for(const key of ["LeftUpLeg","LeftLeg","RightUpLeg","RightLeg"]){
   const v=report.actualSkinMotion?.displacement[key];
   assert(v?.vertices>=10&&v.average>.015,
    "REAL "+key+" skinned mesh not walking: "+JSON.stringify(v));
  }
  assert(report.actualSkinMotion.materials.every(m=>m.usesVertexColors&&m.hasColorAttribute&&m.distinct>5),
    "Imported meshes are still white: "+JSON.stringify(report.actualSkinMotion.materials));
  assert(report.inspectionAtStart.materials.some(m=>m.name.includes("parasitezombie")),
   "Imported original mesh materials missing");
  assert.equal(report.state.calibrated,true);
  assert(Number.isFinite(report.state.size));
  // Diagnostic only: test model's final size/facing must be approved by user.
  // Do not treat a stable scene as visual signoff.
  assert(Number.isFinite(report.state.actualLiveHeight)&&report.state.actualLiveHeight>0);
  assert(Math.abs(report.state.actualLiveHeight-report.state.expectedHeight)<report.state.expectedHeight*.10,
    "Parasite visual size outside 10% of intended boss size: "+report.state.actualLiveHeight+" vs "+report.state.expectedHeight);
  assert.equal(report.state.poolIncludesParasite,false);
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
  fs.writeFileSync("PARASITE_V594_AUDIT.json",JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify(report,null,2));
  if(!report.pass)process.exitCode=1;
 }
})();
