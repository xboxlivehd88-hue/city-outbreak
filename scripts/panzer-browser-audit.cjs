// An integration test of the real GLB, loaded by the actual game module.
// Do not infer limb motion from quaternion math alone: sample skinned vertices.
const {chromium}=require("playwright");
const fs=require("fs");
const os=require("os");
const assert=require("assert/strict");
(async()=>{
 const output={build:"v580+calibration-candidate",test:"panzer-original-skeleton-visible-vertex-motion",startedAt:new Date().toISOString(),pass:false};
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  const page=await browser.newPage({viewport:{width:1200,height:800}});
  const errors=[],logs=[];
  page.on("pageerror",e=>errors.push(String(e)));
  page.on("console",msg=>{if(/panzer|glb|webgl|error/i.test(msg.text()))logs.push(msg.type()+": "+msg.text().slice(0,600))});
  page.on("response",resp=>{if(/panzer_zombie.glb/.test(resp.url()))output.modelRequest={status:resp.status(),url:resp.url()}});
  let injected=false;
  await page.route(/\/src\/game\.js\?v=580$/,async route=>{
   const resp=await route.fetch();
   const source=await resp.text();
   // Test the corrected quadratic skinning scale before committing it to main.
   const oldCorrection="const correction=desiredWorldHeight/measuredHeight;";
   if(source.split(oldCorrection).length!==2)throw Error("Expected original Panzer calibration");
   const correctedSource=source.replace(oldCorrection,
     "const correction=z.panzerBossMixer?Math.sqrt(desiredWorldHeight/measuredHeight):desiredWorldHeight/measuredHeight;");
   const addon=`
;globalThis.__panzerOriginalSkinAudit={
 ready:()=>!!panzerBossAsset,
 run:()=>{
  if(!panzerBossAsset)throw Error("Panzer GLB not loaded");
  const z={kind:"boss",bossName:PANZER_BOSS_NAME,dead:false,g:new THREE.Group(),
   hitMeshes:[],ownedGeometries:[],ownedMaterials:[]};
  attachPanzerBossVisual(z);
  if(!z.panzerBossVisual)throw Error("Panzer visual was not constructed");
  if(!z.panzerBossMixer)throw Error("Native Panzer GLB was not selected; forced fallback?");
  if(z.panzerBossAutoRig)throw Error("Expected original GLB skin, found procedural replacement");
  // Match production update order: advance mixer, pose both legs, then
  // perform the v570 one-time height calibration before ANY mesh measurements.
  z.panzerBossMixer.update(.016);
  z.panzerWalkLastX=z.g.position.x-.04;
  syncPanzerBossWalk(z,.016,true);
  function measureRealGeometry(){
   z.panzerBossModel.updateWorldMatrix(true,true);
   const bounds=new THREE.Box3(),p=new THREE.Vector3();
   bounds.makeEmpty();let vertices=0;
   z.panzerBossModel.traverse(mesh=>{
    if(!mesh.isSkinnedMesh)return;
    const pos=mesh.geometry.getAttribute("position");
    for(let i=0;i<pos.count;i+=Math.max(1,Math.floor(pos.count/1400))){
     mesh.getVertexPosition(i,p);mesh.localToWorld(p);bounds.expandByPoint(p);vertices++;
    }
   });
   return {height:bounds.max.y-bounds.min.y,minY:bounds.min.y,maxY:bounds.max.y,sampledVertices:vertices};
  }
  const beforeScale=z.panzerBossVisual.scale.x;
  const preCalibration=measureRealGeometry();
  calibratePanzerBossVisual(z);
  calibratePanzerBossVisual(z);
  const afterScale=z.panzerBossVisual.scale.x;
  const postCalibration=measureRealGeometry();
  z.panzerBossModel.updateWorldMatrix(true,true);
  const posedBounds=new THREE.Box3().setFromObject(z.panzerBossModel,true);
  const worldHeight=posedBounds.max.y-posedBounds.min.y;
  const joints=z.panzerNativeLegBones;
  const keys=["L_UpperLeg","L_LowerLeg","L_Foot","R_UpperLeg","R_LowerLeg","R_Foot"];
  for(const key of keys)if(!joints[key]?.bone)throw Error("MISSING "+key);
  const selections={};let meshes=0;
  for(const key of keys)selections[key]=[];
  z.panzerBossModel.traverse(mesh=>{
   if(!mesh.isSkinnedMesh)return;meshes++;
   const ia=mesh.geometry.getAttribute("skinIndex"),wa=mesh.geometry.getAttribute("skinWeight");
   if(!ia||!wa)return;
   const byId=new Map();
   for(const key of keys){const ix=mesh.skeleton.bones.indexOf(joints[key].bone);if(ix>=0)byId.set(ix,key)}
   if(!byId.size)return;
   // Sample vertices with strong attachment to this particular real joint.
   const found=Object.fromEntries(keys.map(k=>[k,[]]));
   for(let i=0;i<ia.count;i++){
    for(let k=0;k<Math.min(4,ia.itemSize,wa.itemSize);k++){
     const key=byId.get(ia.getComponent(i,k));
     if(key&&wa.getComponent(i,k)>=.60)found[key].push(i);
    }
   }
   for(const key of keys){
    const v=found[key];
    for(let i=0;i<Math.min(60,v.length);i++){
     const index=v[Math.floor(i*(v.length-1)/Math.min(60,v.length))];
     selections[key].push({mesh,index});
    }
   }
  });
  const counts=Object.fromEntries(keys.map(k=>[k,selections[k].length]));
  if(keys.some(k=>counts[k]<12))throw Error("Not enough original GLB skin vertices per joint "+JSON.stringify(counts));
  function poseAt(phase){
   z.panzerWalkBlend=1;z.panzerWalkPhase=phase;
   // Trigger normal moving gait WITHOUT moving root: displacement must come
   // from actual deformed limbs, not the fake boss sliding through the scene.
   z.panzerWalkLastX=z.g.position.x-.04;z.panzerWalkLastZ=z.g.position.z;
   syncPanzerBossWalk(z,.016,true);
   z.panzerBossModel.updateWorldMatrix(true,true);
   z.panzerBossModel.traverse(mesh=>{if(mesh.isSkinnedMesh)mesh.skeleton.update()});
   const points={},angles={};
   for(const key of keys){
    points[key]=selections[key].map(({mesh,index})=>{
     const v=new THREE.Vector3();
     mesh.getVertexPosition(index,v);
     mesh.localToWorld(v);
     return [v.x,v.y,v.z];
    });
    angles[key]=joints[key].bone.quaternion.angleTo(joints[key].rest);
   }
   return {points,angles};
  }
  const A=poseAt(.10),B=poseAt(2.10),C=poseAt(4.45);
  const displacement={};
  for(const key of keys){
   let max=0,avg=0;
   for(let i=0;i<A.points[key].length;i++){
    const d=Math.max(
     Math.hypot(...A.points[key][i].map((v,j)=>v-B.points[key][i][j])),
     Math.hypot(...A.points[key][i].map((v,j)=>v-C.points[key][i][j]))
    );
    max=Math.max(max,d);avg+=d;
   }
   displacement[key]={avgMeters:avg/A.points[key].length,maxMeters:max,angleAtLast:C.angles[key]};
  }
  return {
   auditVersion:"v580",panzerSourceHeight:z.panzerSourceHeight,
   approvedVisualTarget:PANZER_VISUAL_HEIGHT,
   measuredWorldHeight:worldHeight,
   beforeScale,afterScale,preCalibration,postCalibration,
   finalHolderScale:z.panzerBossVisual.scale.x,
   sourceClip:z.panzerBossAnimation,visibleMeshes:meshes,
   names:Object.fromEntries(keys.map(k=>[k,joints[k].bone.name])),
   skinSamples:counts,
   displacement,selectedNative:!!z.panzerBossMixer,forcedFallback:!!z.panzerBossAutoRig
  };
 }
};
`;
   injected=true;
   await route.fulfill({response:resp,body:correctedSource+addon,contentType:"application/javascript"});
  });
  const response=await page.goto("http://127.0.0.1:4173/?panzer-browser-audit=1",{waitUntil:"domcontentloaded",timeout:60000});
  output.siteStatus=response?.status();
  await page.waitForFunction(()=>globalThis.__panzerOriginalSkinAudit?.ready()===true,{timeout:100000});
  assert(injected,"Game script interception failed");
  const result=await page.evaluate(()=>globalThis.__panzerOriginalSkinAudit.run());
  Object.assign(output,result);
  // Both *actual* skinned leg meshes must move, not just the hidden joint bones.
  for(const key of ["L_UpperLeg","L_LowerLeg","R_UpperLeg","R_LowerLeg"]){
   assert(result.displacement[key].avgMeters>.015,key+" real skinned mesh did not move enough: "+result.displacement[key].avgMeters);
  }
  const ratio=result.displacement.R_UpperLeg.avgMeters/result.displacement.L_UpperLeg.avgMeters;
  assert(ratio>.30&&ratio<3.3,"Right/left thigh movement ratio incorrect: "+ratio);
  assert(result.postCalibration.height>2.7&&result.postCalibration.height<3.7,
    "Rendered Panzer skin not approximately approved 3.2-unit height: "+result.postCalibration.height);
  output.pass=true;
  output.errors=errors.slice(0,15);output.logs=logs.slice(-20);
 }catch(e){
  output.failure=String(e?.stack||e);
  output.errors=(output.errors||[]);output.logs=output.logs||[];
 }finally{
  if(browser)await browser.close();
  output.completedAt=new Date().toISOString();
  fs.writeFileSync("PANZER_BROWSER_AUDIT.json",JSON.stringify(output,null,2)+"\n");
  console.log(JSON.stringify(output,null,2));
  if(!output.pass)process.exitCode=1;
 }
})();
