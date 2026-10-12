const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("fs");
(async()=>{
 const report={build:641,passed:false},errors=[];let browser,page;
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  page=await browser.newPage({viewport:{width:1200,height:800}});
  page.on("pageerror",e=>errors.push(String(e)));
  await page.route(/\/src\/game\.js\?v=641$/,async route=>{
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
   "  return units.map(z=>{",
   "   const size=new THREE.Vector3();",
   "   const meshes=[];z.sprinterModel.traverse(o=>{if(o.isSkinnedMesh){",
   "    const mats=Array.isArray(o.material)?o.material:[o.material];",
   "    meshes.push({name:o.name,vertices:o.geometry.attributes.position?.count,map:mats.some(m=>!!m?.map),skin:o.skeleton.bones.length});",
   "   }});",
   "   const mixer=z.sprinterMixer,a=z.sprinterRunAction;",
   "   const sampled=[.13,.61].map(t=>{mixer.setTime(t);",
   "    return ['L_UpperLeg','L_LowerLeg','R_UpperLeg','R_LowerLeg','L_UpperArm','R_UpperArm'].map(k=>z.sprinterBones.get(k)?.quaternion.clone());});",
   "   const angles=sampled[0].map((q,i)=>q?.angleTo(sampled[1][i])||0);",
   "   const cycleHeights=[],cycleGaps=[];",
   "   for(let i=0;i<18;i++){mixer.setTime((i+.5)/18*a.getClip().duration);sprinterZombie.sync(z,0);",
   "    const current=new THREE.Box3().setFromObject(z.sprinterVisual,true);",
   "    cycleHeights.push(current.max.y-current.min.y);cycleGaps.push(current.min.y-z.g.position.y);",
   "   }",
   "   mixer.setTime(.09);sprinterZombie.sync(z,0);",
   "   const box=new THREE.Box3().setFromObject(z.sprinterVisual,true);box.getSize(size);",
   "   return {index:z.sprinterModelIndex,original:z.sprinterModel.name,cycleHeights,cycleGaps,calibration:z.sprinterCopCycleHeight||null,liveExponent:z.sprinterLiveExponent||null,sizeChecks:z.sprinterSizeChecks||0,liveCorrections:z.sprinterLiveCorrectionCount||0,",
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
   "  const copCrawlerSource=zombies.find(z=>z.kind==='sprinter'&&!z.dead&&z.sprinterModelIndex===0);",
   "  if(!copCrawlerSource)throw Error('No second Cop available to test crawling');",
   "  copCrawlerSource.hp=Math.max(40,copCrawlerSource.hp);",
   "  detachLeg(copCrawlerSource,'left');detachLeg(copCrawlerSource,'right');",
   "  const convertedCop=zombies.find(z=>z.kind==='crawler'&&z.sprinterVisual&&z.sprinterModelIndex===0);",
   "  const poseAudit=z=>{",
   "   if(!z)return null;",
   "   const frame0=z.sprinterBones.get('L_UpperArm')?.quaternion.clone();",
   "   for(let i=0;i<18;i++){z.phase+=.22;syncCrawlerUpperVisual(z);sprinterZombie.sync(z,1/30)}",
   "   const armMotion=frame0?.angleTo(z.sprinterBones.get('L_UpperArm')?.quaternion)||0;",
   "   const box=new THREE.Box3().setFromObject(z.sprinterVisual,true);",
   "   const point=key=>{const b=z.sprinterBones.get(key);if(!b)return null;",
   "    const w=b.getWorldPosition(new THREE.Vector3());return z.g.worldToLocal(w)};",
    "   const head=point('Head'),chest=point('Chest'),hips=point('Hips'),l=point('L_Hand'),r=point('R_Hand');",
    "   const ls=point('L_UpperArm'),rs=point('R_UpperArm'),le=point('L_LowerArm'),re=point('R_LowerArm');",
   "   const jointY=key=>z.sprinterBones.get(key)?.getWorldPosition(new THREE.Vector3()).y-z.g.position.y;",
   "   const armScaleRatios=['L','R'].map((side,i)=>{const u=z.sprinterBones.get(side+'_UpperArm'),e=z.sprinterBones.get(side+'_LowerArm');",
   "    const prior=z.sprinterStandingArmLengths?.[i];return prior&&u&&e?u.getWorldPosition(new THREE.Vector3()).distanceTo(e.getWorldPosition(new THREE.Vector3()))/prior:null;});",
   "   const palmDown=side=>{const hand=z.sprinterBones.get(side+'_Hand'),basis=z.sprinterCrawlerPalmBasis?.[side];",
   "    return hand&&basis?basis.palm.clone().applyQuaternion(hand.getWorldQuaternion(new THREE.Quaternion())).dot(new THREE.Vector3(0,-1,0)):null;};",
   "   const hitShot=(bone,part)=>{const b=z.sprinterBones.get(bone);if(!b)return false;",
   "    const target=b.getWorldPosition(new THREE.Vector3()),origin=target.clone().add(new THREE.Vector3(0,1.7,0));",
   "    const ray=new THREE.Raycaster(origin,new THREE.Vector3(0,-1,0),0,3.6);",
   "    return ray.intersectObjects(z.hitMeshes||[],false).some(h=>h.object.userData.zombie===z&&h.object.userData.part===part);};",
    "   const armsLocal={leftShoulder:ls?.toArray(),rightShoulder:rs?.toArray(),",
    "    leftElbow:le?.toArray(),rightElbow:re?.toArray(),",
    "    leftHand:l?.toArray(),rightHand:r?.toArray(),",
    "    leftElbowAway:ls&&le&&chest?Math.abs(le.x-chest.x)-Math.abs(ls.x-chest.x):null,",
    "    rightElbowAway:rs&&re&&chest?Math.abs(re.x-chest.x)-Math.abs(rs.x-chest.x):null,",
    "    leftHandAway:l&&ls&&chest?Math.abs(l.x-chest.x)-Math.abs(ls.x-chest.x):null,",
    "    rightHandAway:r&&rs&&chest?Math.abs(r.x-chest.x)-Math.abs(rs.x-chest.x):null,",
    "    shouldersApart:ls&&rs?Math.abs(ls.x-rs.x):null,",
    "    elbowsApart:le&&re?Math.abs(le.x-re.x):null",
    "   };",
   "   return {height:box.max.y-box.min.y,feet:box.min.y-z.g.position.y,",
   "    wristY:[jointY('L_Hand'),jointY('R_Hand')],chestY:jointY('Chest'),hipY:jointY('Hips'),palmDown:[palmDown('L'),palmDown('R')],",
   "    armScaleRatios,scalePreserved:z.sprinterCrawlerScalePreserved===true,standingWorldScale:z.sprinterStandingWorldScale,",
   "    shotHitboxes:z.hitMeshes?.length||0,hitVolumeNames:z.hitMeshes?.map(h=>h.name)||[],",
   "    shotCoverage:{head:hitShot('Head','head'),chest:hitShot('Chest','torso'),pelvis:hitShot('Hips','torso'),",
   "     leftArm:hitShot('L_LowerArm','leftArm'),rightArm:hitShot('R_LowerArm','rightArm')},",
   "    hipToChestForward:hips&&chest?hips.z-chest.z:null,",
   "    hipToHeadForward:hips&&head?hips.z-head.z:null,",
   "    trunkVerticalRise:hips&&chest?chest.y-hips.y:null,",
   "    headAboveHands:head&&l&&r?head.y-Math.max(l.y,r.y):null,",
   "    headLocalHeight:head?.y??null,",
   "    handsSeparationX:l&&r?Math.abs(l.x-r.x):null,",
   "    handsApart:l&&r?l.distanceTo(r):0,",
   "    leftAhead:l&&chest?chest.z-l.z:null,rightAhead:r&&chest?chest.z-r.z:null,",
   "    handsBelowHead:l&&r&&head?[head.y-l.y,head.y-r.y]:null,",
   "    armsLocal, naturalCrawl:!!z.sprinterCrawlerAction,retargetTracks:z.sprinterCrawlerRetargetTracks||0,",
   "    armMotion,clip:z.sprinterCrawlerAction?.getClip()?.name,",
   "    modelName:z.sprinterModel?.name,",
   "    boneCount:z.sprinterBones?.size||0,",
   "    trimmed:z.sprinterCrawlerSkinReady===true,",
   "    skin:z.sprinterCrawlerSkinAudit||null,",
   "    leftThighScale:z.sprinterBones?.get('L_UpperLeg')?.scale.x,",
   "    rightThighScale:z.sprinterBones?.get('R_UpperLeg')?.scale.x,",
   "    renderMeshes:(()=>{const out=[];z.sprinterModel?.traverse(o=>{if(!o.isSkinnedMesh)return;",
   "     const mats=Array.isArray(o.material)?o.material:[o.material];",
   "     out.push({name:o.name,visible:o.visible,faces:o.geometry.index?.count/3||0,",
   "       opacity:Math.min(...mats.filter(Boolean).map(m=>m.opacity))});",
   "    });return out})()};",
   "  };",
   "  return {maniacCrawl:poseAudit(next),copCrawl:poseAudit(convertedCop),",
   "   ragNative,ragMove,oneLegHidden,detachedGenericParts:parts.filter(p=>p.limb).length-prior,",
   "   crawlerFound:!!next,kind:next?.kind,crawlerModelSame:next?.sprinterModel===original,",
   "   crawlerNewRoot:next?.g!==oldRoot,crawlerBones:next?.sprinterBones?.size||0,",
   "   legGone:!!(next?.sprinterCrawlerSkinReady&&next.sprinterCrawlerSkinAudit?.removedTris>20),",
   "   crawlerHitboxes:next?.hitMeshes?.length||0};",
   " }",
   "};"
   ].join("\n");
   await route.fulfill({response:resp,body:src+added,contentType:"application/javascript"});
  });
  const res=await page.goto("http://127.0.0.1:4173/?v=641-sprinter-two-models&sprinterTest=1",{waitUntil:"domcontentloaded",timeout:85000});
  report.http=res?.status();
  await page.waitForFunction(()=>globalThis.__sprinterSmoke?.ready(),null,{timeout:115000});
  await page.locator("#start").click({noWaitAfter:true});
  await page.waitForFunction(()=>globalThis.__sprinterSmoke?.status()?.attached?.every(n=>n>=5),null,{timeout:90000,polling:200});
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
  assert.equal(report.models.length,10,"Expected ten authentic Wave 1 Sprinters");
  assert.deepEqual(report.models.map(z=>z.index).sort(),[0,0,0,0,0,1,1,1,1,1]);
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
  console.log("SPRINTER_V641_GROUND_CONTACTS="+JSON.stringify({cop:report.lifecycle.copCrawl,maniac:report.lifecycle.maniacCrawl}));
  assert.equal(report.lifecycle.ragNative,true,"Original Sprinter not running native PBD");
  assert(report.lifecycle.ragMove>.03,"Dead Sprinter froze instead of falling");
  assert.equal(report.lifecycle.oneLegHidden,true);
  assert.equal(report.lifecycle.detachedGenericParts,0);
  assert.equal(report.lifecycle.crawlerFound,true,"Original sprinter not preserved as crawler");
  assert.equal(report.lifecycle.kind,"crawler");
  assert.equal(report.lifecycle.crawlerModelSame,true);
  assert.equal(report.lifecycle.legGone,true);
  assert(report.lifecycle.crawlerHitboxes>2);
  for(const [type,m] of [["Cop",report.lifecycle.copCrawl],["Maniac",report.lifecycle.maniacCrawl]]){
   assert(m&&m.naturalCrawl&&m.retargetTracks>=13&&m.boneCount>=16,
     type+" original skeleton did NOT receive real crawl motion: "+JSON.stringify(m));
   assert(m.armMotion>.03,type+" arms locked/stiff in crawler animation: "+JSON.stringify(m));
   assert(m.shotHitboxes>=10&&m.hitVolumeNames.every(n=>n.startsWith("SprinterLegless_"))&&
     Object.values(m.shotCoverage||{}).every(Boolean),
     type+" CRAWLER BULLETS MISS visible head/chest/pelvis/arms: "+JSON.stringify({boxes:m.hitVolumeNames,rays:m.shotCoverage}));
   assert(m.scalePreserved&&m.armScaleRatios?.every(r=>r!==null&&r>.95&&r<1.05),
     type+" SHRANK on conversion: upper-arm original world lengths changed "+JSON.stringify(m.armScaleRatios));
   assert(m.trimmed&&m.skin?.changedMeshes>=1&&m.skin?.removedTris>20,
     type+" original thigh polygons were not safely removed: "+JSON.stringify(m.skin));
   assert(m.leftThighScale>.95&&m.rightThighScale>.95,
     type+" ZERO-SCALE THIGH still tears the shared torso skin");
   assert(m.renderMeshes.some(x=>x.visible&&x.faces>100&&x.opacity>.98),
     type+" imported skin still invisible/transparent: "+JSON.stringify(m.renderMeshes));
   assert(Number.isFinite(m.height)&&m.height>.35&&m.height<3.0,
     type+" crawler original skinned bounds unexpectedly flat or upright: "+JSON.stringify(m));
   // Cropped leg skin retains a few triangles below the model's bounds.
   // A Box3 minimum is NOT floor contact for a converted skinned torso.
   // Use real wrist/chest height instead, checked immediately below.
   assert(m.wristY?.every(y=>Number.isFinite(y)&&y>-.055&&y<.21)&&m.chestY>.22&&m.chestY<.33&&m.hipY>.045&&m.hipY<.145&&m.chestY-m.hipY>.125&&m.chestY-m.hipY<.205,
     type+" crawler wrists/chest hover above ground or clip into pavement: "+JSON.stringify(m));
   assert(m.palmDown?.every(n=>n!==null&&n>.85),
     type+" hand backs planted instead of original palms: "+JSON.stringify(m));
   assert(m.handsApart>.35&&m.handsSeparationX>.24&&m.leftAhead>-.10&&m.rightAhead>-.10,
     type+" crawler arms crossed into body: "+JSON.stringify(m));
   assert(m.hipToChestForward>.18&&m.hipToHeadForward>.23,
     type+" still crab-hunched/head below torso instead of forward crawling: "+JSON.stringify(m));
   assert(m.headAboveHands>.045&&m.headLocalHeight>.18,
     type+" head/face points below the street or arms hover above skull: "+JSON.stringify(m));
   assert(m.armsLocal?.elbowsApart>.22&&m.armsLocal?.leftElbowAway>-.04&&
     m.armsLocal?.rightElbowAway>-.04,
     type+" elbows are crossing back inside the chest: "+JSON.stringify(m.armsLocal));
  }
  assert.equal(errors.length,0,"Page errors: "+errors.join("; "));
  report.passed=true;
 }catch(e){
  report.failure=String(e?.stack||e);
  try{report.debug=await page?.evaluate(()=>globalThis.__sprinterSmoke?.status())}catch(_){}
 }finally{
  if(browser)await browser.close();
  report.errors=errors;
  fs.writeFileSync("SPRINTER_V641_AUDIT.json",JSON.stringify(report,null,2));
  console.log("SPRINTER_V641_REPORT="+JSON.stringify(report));
  if(!report.passed)process.exitCode=1;
 }
})();
