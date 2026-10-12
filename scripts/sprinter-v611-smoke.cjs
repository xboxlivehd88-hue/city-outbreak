const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("fs");
(async()=>{
 const report={build:614,passed:false},errors=[];let browser,page;
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  page=await browser.newPage({viewport:{width:1200,height:800}});
  page.on("pageerror",e=>errors.push(String(e)));
  await page.route(/\/src\/game\.js\?v=614$/,async route=>{
   const resp=await route.fetch(),src=await resp.text();
   const added=[
   "",
   ";globalThis.__sprinterSmoke={",
   " ready:()=>newCityCollisionReady&&sprinterZombie.status().loaded.every(Boolean),",
   " status:()=>sprinterZombie.status(),",
   " spawn:()=>{",
   "  const units=zombies.filter(z=>z.kind==='sprinter'&&!z.dead&&z.sprinterVisual);",
   "  const counts=[0,0];for(const z of units)counts[z.sprinterModelIndex]++;",
   "  globalThis.__sprinterWaveAudit={wave,waveTarget,waveSpawned,kinds:[...new Set(zombies.filter(z=>!z.dead).map(z=>z.kind))],count:units.length,counts,testOnly:sprinterOnlyTest};",
   "  return [units.find(z=>z.sprinterModelIndex===0),units.find(z=>z.sprinterModelIndex===1)].filter(Boolean).map(z=>{
   "   const box=new THREE.Box3().setFromObject(z.sprinterVisual,true),size=new THREE.Vector3();box.getSize(size);",
   "   const meshes=[];z.sprinterModel.traverse(o=>{if(o.isSkinnedMesh){",
   "    const mats=Array.isArray(o.material)?o.material:[o.material];",
   "    meshes.push({name:o.name,vertices:o.geometry.attributes.position?.count,map:mats.some(m=>!!m?.map),skin:o.skeleton.bones.length});",
   "   }});",
   "   const mixer=z.sprinterMixer,a=z.sprinterRunAction;",
   "   const sampled=[.13,.61].map(t=>{mixer.setTime(t);",
   "    return ['L_UpperLeg','L_LowerLeg','R_UpperLeg','R_LowerLeg','L_UpperArm','R_UpperArm'].map(k=>z.sprinterBones.get(k)?.quaternion.clone());});",
   "   const angles=sampled[0].map((q,i)=>q?.angleTo(sampled[1][i])||0);",
   "   const cycleHeights=[],cycleGaps=[];",
   "   for(let i=0;i<18;i++){mixer.setTime((i+.5)/18*a.getClip().duration);",
   "    const current=new THREE.Box3().setFromObject(z.sprinterVisual,true);",
   "    cycleHeights.push(current.max.y-current.min.y);cycleGaps.push(current.min.y-z.g.position.y);",
   "   }",
   "   mixer.setTime(.09);",
   "   return {index:z.sprinterModelIndex,original:z.sprinterModel.name,cycleHeights,cycleGaps,calibration:z.sprinterCopCycleHeight||null,",
   "    bones:z.sprinterBones.size,skinned:meshes,worldHeight:size.y,groundGap:box.min.y-z.g.position.y,",
   "    headHits:z.hitMeshes.filter(h=>h.userData.isHead).length,bodyHits:z.hitMeshes.filter(h=>h.userData.part==='torso').length,",
   "    limbHits:z.hitMeshes.filter(h=>/Arm|Leg/.test(h.userData.part||'')).length,",
   "    runClip:a.getClip().name,runFrames:a.getClip().tracks.length,angles};",
   "  });",
   " },",
   " lifecycle:()=>{",
   "  const cop=zombies.find(z=>z.kind==='sprinter'&&z.sprinterVisual&&z.sprinterModelIndex===0),",
   "   maniac=zombies.find(z=>z.kind==='sprinter'&&z.sprinterVisual&&z.sprinterModelIndex===1);",
   "  if(!cop||!maniac)throw Error('Two original Sprinters missing');",
   "  const start=cop.sprinterVisual.position.clone(),origin=cop.g.position.clone().add(new THREE.Vector3(0,1,1));",
   "  killZ(cop,false,origin,1.4);",
   "  const ragNative=cop.ragdoll?.bodyPbd?.holder===cop.sprinterVisual;",
   "  for(let i=0;i<24;i++)updateRagdoll(cop,1/60);",
   "  const ragMove=cop.sprinterVisual.position.distanceTo(start);",
   "  const original=maniac.sprinterModel,oldRoot=maniac.g,prior=parts.filter(p=>p.limb).length;",
   "  maniac.hp=Math.max(40,maniac.hp);",
   "  detachLeg(maniac,'left');",
   "  const oneLegHidden=maniac.sprinterBones.get('L_UpperLeg').scale.x<.001;",
   "  detachLeg(maniac,'right');",
   "  const next=zombies.find(z=>z.kind==='crawler'&&z.sprinterVisual);",
   "  return {ragNative,ragMove,oneLegHidden,detachedGenericParts:parts.filter(p=>p.limb).length-prior,",
   "   crawlerFound:!!next,kind:next?.kind,crawlerModelSame:next?.sprinterModel===original,",
   "   crawlerNewRoot:next?.g!==oldRoot,crawlerBones:next?.sprinterBones?.size||0,",
   "   legGone:next?.sprinterBones?.get('L_UpperLeg')?.scale.x<.001&&next?.sprinterBones?.get('R_UpperLeg')?.scale.x<.001,",
   "   crawlerHitboxes:next?.hitMeshes?.length||0};",
   " }",
   "};"
   ].join("\n");
   await route.fulfill({response:resp,body:src+added,contentType:"application/javascript"});
  });
  const res=await page.goto("http://127.0.0.1:4173/?v=614-sprinter-two-models",{waitUntil:"domcontentloaded",timeout:85000});
  report.http=res?.status();
  await page.waitForFunction(()=>globalThis.__sprinterSmoke?.ready(),null,{timeout:115000});
  await page.locator("#start").click({noWaitAfter:true});
  await page.waitForFunction(()=>globalThis.__sprinterSmoke?.status()?.attached?.every(n=>n>=5),null,{timeout:30000});
  await page.waitForTimeout(450);
  report.assets=await page.evaluate(()=>globalThis.__sprinterSmoke.status());
  report.models=await page.evaluate(()=>globalThis.__sprinterSmoke.spawn());
  report.wave=await page.evaluate(()=>globalThis.__sprinterWaveAudit);
  assert.equal(report.wave.wave,1);
  assert.equal(report.wave.waveTarget,10);assert.equal(report.wave.waveSpawned,10);
  assert.equal(report.wave.testOnly,true);
  assert.deepEqual(report.wave.kinds,["sprinter"]);
  assert.deepEqual(report.wave.counts,[5,5]);
  assert.equal(report.wave.count,10);
  assert.equal(report.http,200);
  assert.deepEqual(report.assets.loaded,[true,true],"Both original GLBs not loaded");
  assert.equal(report.models.length,2,"Expected TWO original animated Sprinters");
  assert.deepEqual(report.models.map(z=>z.index).sort(),[0,1]);
  for(const m of report.models){
   assert(m.bones>=16,"Original native armature absent: "+JSON.stringify(m));
   assert(m.skinned.length>=2&&m.skinned.every(x=>x.vertices>=100),
    "Original textured skinned meshes missing");
   assert(m.skinned.some(x=>x.map),"Uploaded source textures not visible");
   assert(m.worldHeight>1.35&&m.worldHeight<2.7,"Wrong physical size "+m.worldHeight);
   assert(m.cycleHeights.length===18);
   assert(Math.max(...m.cycleHeights)<2.75,
     "RUNNING MODEL GETS MASSIVE during clip: "+JSON.stringify(m.cycleHeights));
   assert(Math.min(...m.cycleHeights)>1.05,
     "Running model collapses to tiny figure: "+JSON.stringify(m.cycleHeights));
   assert(Math.min(...m.cycleGaps)>-.30&&Math.max(...m.cycleGaps)<.6,
     "Running model goes below street or floats: "+JSON.stringify(m.cycleGaps));
   assert(m.groundGap>-.4&&m.groundGap<.4,"Feet sunk/floating "+m.groundGap);
   assert(m.headHits>=1&&m.bodyHits>=2&&m.limbHits>=8,"Hitboxes incomplete");
   assert(m.runFrames>=20,"Not using the original animated run");
   assert(m.angles.slice(0,4).filter(v=>v>.08).length>=3,"Real knees don't animate: "+JSON.stringify(m.angles));
  }
  report.lifecycle=await page.evaluate(()=>globalThis.__sprinterSmoke.lifecycle());
  assert.equal(report.lifecycle.ragNative,true,"Original Sprinter not running native PBD");
  assert(report.lifecycle.ragMove>.03,"Dead Sprinter froze instead of falling");
  assert.equal(report.lifecycle.oneLegHidden,true);
  assert.equal(report.lifecycle.detachedGenericParts,0);
  assert.equal(report.lifecycle.crawlerFound,true,"Original sprinter not preserved as crawler");
  assert.equal(report.lifecycle.kind,"crawler");
  assert.equal(report.lifecycle.crawlerModelSame,true);
  assert.equal(report.lifecycle.legGone,true);
  assert(report.lifecycle.crawlerHitboxes>2);
  assert.equal(errors.length,0,"Page errors: "+errors.join("; "));
  report.passed=true;
 }catch(e){
  report.failure=String(e?.stack||e);
  try{report.debug=await page?.evaluate(()=>globalThis.__sprinterSmoke?.status())}catch(_){}
 }finally{
  if(browser)await browser.close();
  report.errors=errors;
  fs.writeFileSync("SPRINTER_V614_AUDIT.json",JSON.stringify(report,null,2));
  console.log("SPRINTER_V614_REPORT="+JSON.stringify(report));
  if(!report.passed)process.exitCode=1;
 }
})();
