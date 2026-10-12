const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("fs");
(async()=>{
 let browser,page;const report={build:632,passed:false},errors=[];
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  page=await browser.newPage({viewport:{width:1200,height:800}});
  page.on("pageerror",e=>errors.push(String(e)));
  page.on("response",r=>{if(r.url().includes("/assets/zombie_hazmat.glb"))report.assetHttp=r.status()});
  await page.route(/\/src\/game\.js\?v=632$/,async route=>{
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
   await route.fulfill({response:rsp,body:src+injected+extraAudit+postureAudit+greenAudit,contentType:"application/javascript"});
  });
  const rsp=await page.goto("http://127.0.0.1:4173/?v=632-hazmat-visual-test",{waitUntil:"domcontentloaded",timeout:63100});
  report.http=rsp?.status();
  await page.waitForFunction(()=>globalThis.__hazmatSmoke?.ready(),null,{timeout:110000});
  await page.locator("#start").click({noWaitAfter:true});
  await page.evaluate(()=>globalThis.__hazmatSmoke.forceHazmats());
  await page.waitForFunction(()=>globalThis.__hazmatSmoke?.snapshot()?.attached===10,null,{timeout:45000});
  await page.waitForTimeout(700);
  report.state=await page.evaluate(()=>globalThis.__hazmatSmoke.snapshot());
  report.motion=await page.evaluate(()=>globalThis.__hazmatSmoke.motion());
  report.lifecycle=await page.evaluate(()=>globalThis.__hazmatLifecycleAudit());
  const s=report.state;
  assert.equal(report.http,200);assert.equal(report.assetHttp,200);
  assert.equal(s.build,"631");assert.equal(s.wave,1);
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
  assert.equal(errors.length,0,"JS errors: "+errors.join("; "));
  report.passed=true;
 }catch(e){
  report.failure=String(e?.stack||e);
  try{report.debug=await page?.evaluate(()=>globalThis.__hazmatSmoke?.snapshot())}catch(_){}
 }finally{
  if(browser)await browser.close();
  report.errors=errors;
  fs.writeFileSync("HAZMAT_V632_AUDIT.json",JSON.stringify(report,null,2));
  console.log("HAZMAT_V599_REPORT="+JSON.stringify(report));
  if(!report.passed)process.exitCode=1;
 }
})();