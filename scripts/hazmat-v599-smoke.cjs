const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("fs");
(async()=>{
 let browser,page;const report={build:605,passed:false},errors=[];
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  page=await browser.newPage({viewport:{width:1200,height:800}});
  page.on("pageerror",e=>errors.push(String(e)));
  page.on("response",r=>{if(r.url().includes("/assets/zombie_hazmat.glb"))report.assetHttp=r.status()});
  await page.route(/\/src\/game\.js\?v=605$/,async route=>{
   const rsp=await route.fetch(),src=await rsp.text();
   const extraAudit="\n;globalThis.__hazmatLifecycleAudit=()=>{\n const all=zombies.filter(z=>z.kind===\"acidic\"&&!z.dead&&z.hazmatVisual);\n if(all.length<3)throw Error(\"Not enough Hazmat test actors\");\n const normal=all[0],crawler=all[1];\n // Release the first actor directly into the game PBD, never a canned pose.\n const origin=normal.g.position.clone().add(new THREE.Vector3(0,1,1));\n const initial=normal.hazmatVisual.position.clone();\n killZ(normal,false,origin,1.5);\n const isNative=normal.ragdoll?.bodyPbd?.holder===normal.hazmatVisual;\n const originalBones=normal.hazmatBones?.size||0;\n for(let i=0;i<24;i++)updateRagdoll(normal,1/60);\n const ragTravel=normal.hazmatVisual.position.distanceTo(initial);\n // Detaching each leg must not spawn the hidden generic leg debris.\n crawler.hp=Math.max(40,crawler.hp);const sameRoot=crawler.g,originalModel=crawler.hazmatModel;\n const beforeParts=parts.filter(p=>p.limb).length;\n detachLeg(crawler,\"left\");\n const afterOne={left:crawler.leftLegDetached,right:crawler.rightLegDetached,\n  nativeHidden:crawler.hazmatBones.get(\"L_UpperLeg\").scale.x<.001,\n  parts:parts.filter(p=>p.limb).length-beforeParts,modelSame:crawler.hazmatModel===originalModel};\n detachLeg(crawler,\"right\");\n hazmatZombie.sync(crawler,.016);\n const afterTwo={kind:crawler.kind,ownerStillPresent:zombies.includes(crawler),\n  sameRoot:crawler.g===sameRoot,modelSame:crawler.hazmatModel===originalModel,\n  crawler:crawler.hazmatCrawler,visual:crawler.hazmatVisual?.name,\n  bothHidden:crawler.hazmatBones.get(\"L_UpperLeg\").scale.x<.001&&\n   crawler.hazmatBones.get(\"R_UpperLeg\").scale.x<.001,\n  headHitbox:crawler.hitMeshes.some(o=>o.userData.isHead),\n  bodyHitbox:crawler.hitMeshes.some(o=>o.userData.part===\"torso\")};\n // Native user grenade GLB, no fake explosion geometry or extra damage code.\n const grenade=grenadeModelTemplate?.clone(true);\n let explosionMs=null;\n if(grenade){grenade.position.copy(crawler.g.position).add(new THREE.Vector3(0,1,.35));\n  scene.add(grenade);\n  const before=performance.now();\n  explodeGrenade({q:grenade});\n  explosionMs=performance.now()-before;\n }\n return {isNative,originalBones,ragTravel,afterOne,afterTwo,\n  explosionMs,reportedExplosionMs:document.documentElement.dataset.lastGrenadeLogicMs};\n};\n";
   const injected="\n;globalThis.__hazmatSmoke={\n ready:()=>newCityCollisionReady&&hazmatZombie.status().loaded&&hazmatZombie.status().nativeRun,\n snapshot:()=>{\n  const live=zombies.filter(z=>!z.dead),hz=live.filter(z=>z.hazmatVisual),z=hz[0],meshes=[],bones=[];\n  z?.hazmatModel?.traverse(o=>{\n   if(o.isBone)bones.push(o.name);\n   if(o.isSkinnedMesh)meshes.push({name:o.name,map:!!o.material?.map,vertices:o.geometry?.getAttribute(\"position\")?.count||0});\n  });\n  const box=z?.hazmatVisual?new THREE.Box3().setFromObject(z.hazmatVisual,true):null;\n  return {\n   build:document.documentElement.dataset.cityOutbreakBuild,wave,waveTarget,waveSpawned,\n   live:live.length,kinds:[...new Set(live.map(z=>z.kind))],\n   acidic:live.filter(z=>z.kind===\"acidic\").length,boss:live.filter(z=>z.kind===\"boss\").length,\n   attached:hz.length,original:z?.hazmatModel?.name,meshes,bones:bones.length,\n   leftLeg:bones.some(n=>/leftleg/i.test(n)),rightLeg:bones.some(n=>/rightleg/i.test(n)),\n   height:box?.getSize(new THREE.Vector3()).y,scale:z?.hazmatVisual?.scale.x,\n   clips:Object.keys(z?.hazmatActions||{}),mist:z?.hazardMist?.visible,\n   hidden:z?.rigVisual?(()=>{let seen=0;z.rigVisual.traverse(o=>{if(o.isMesh&&o.visible)seen++});return seen===0})():false,\n   headHits:z?.hitMeshes?.filter(o=>o.userData?.part===\"head\").length,\n   torsoHits:z?.hitMeshes?.filter(o=>o.userData?.part===\"torso\").length,\n   pool:BOSS_NAME_POOL.length,attachStatus:hazmatZombie.status()\n  };\n },\n motion:()=>{\n  const z=zombies.find(z=>!z.dead&&z.kind===\"acidic\"&&z.hazmatMixer);\n  if(!z)return null;\n  const mixer=z.hazmatMixer,walk=z.hazmatActions.Zombie_Walk_Root,bones=[];\n  z.hazmatModel.traverse(o=>{if(o.isBone&&/leftleg|rightleg|leftupleg|rightupleg/i.test(o.name))bones.push(o)});\n  for(const action of Object.values(z.hazmatActions))action.stop();\n  walk.reset().play();walk.timeScale=1;\n  const pose=t=>{mixer.setTime(t);return bones.map(b=>b.quaternion.clone())};\n  const a=pose(.21),b=pose(1.35);\n  return {clip:walk.getClip().name,angles:a.map((q,i)=>q.angleTo(b[i]))};\n }\n};";
   const postureAudit="\n;globalThis.__hazmatPostureAudit=()=>{\n const crawler=zombies.find(z=>z.hazmatCrawler&&!z.dead);\n const walker=zombies.find(z=>z.kind===\"acidic\"&&!z.dead&&z.hazmatVisual);\n if(!crawler||!walker)throw new Error(\"Missing original Hazmat crawler/walker\");\n const v=new THREE.Vector3(0,1,0).applyQuaternion(crawler.hazmatVisual.quaternion);\n // A nearby grenade may have temporarily knocked down the walker;\n // remove the knockdown only inside this diagnostic pose test.\n walker.knockdown=null;\n walker.attackAnim=0;walker.hazmatLastX=walker.g.position.x;\n walker.hazmatLastZ=walker.g.position.z;\n walker.g.position.x+=.1;hazmatZombie.sync(walker,.05);\n return {forward:-v.z,order:crawler.hazmatVisual.rotation.order,\n   stride:hazmatZombie.status().walkStride,\n   actorStride:walker.hazmatStrideDistance,\n   cadence:walker.hazmatActions.Zombie_Walk_Root.timeScale};\n};\n";
   const naturalRunProbe="\n;globalThis.__hazmatNaturalRunProbe=()=>{\n const z=zombies.find(z=>z.kind===\"acidic\"&&!z.dead&&z.hazmatActions?.HazmatRetargetedRun);\n if(!z)throw Error(\"No original Hazmat with recorded Run\");\n z.knockdown=null;z.attackAnim=0;\n z.hazmatLastX=z.g.position.x;z.hazmatLastZ=z.g.position.z;\n z.g.position.x+=.10;hazmatZombie.sync(z,.05);\n const a=z.hazmatActions.HazmatRetargetedRun,c=a.getClip();\n const selected=z.hazmatActionName,rate=a.timeScale;\n const names=[\"L_UpperLeg\",\"L_LowerLeg\",\"R_UpperLeg\",\"R_LowerLeg\"];\n for(const action of Object.values(z.hazmatActions))action.stop();\n a.reset().play();z.hazmatMixer.setTime(.05);\n const start=names.map(n=>z.hazmatBones.get(n)?.quaternion.clone());\n z.hazmatMixer.setTime(c.duration*.54);\n const angles=names.map((n,i)=>z.hazmatBones.get(n)?.quaternion.angleTo(start[i])||0);\n return {source:hazmatZombie.status().nativeRun,native:z.hazmatNativeRun,\n  clip:c.name,tracks:c.tracks.length,duration:c.duration,rate,selected,angles};\n};";
   const armAudit="\n;globalThis.__hazmatArmAudit=()=>{\n const hz=zombies.filter(z=>z.hazmatVisual&&!z.dead);\n const sample=hz.find(z=>z.hazmatActions?.HazmatRetargetedRun);\n if(!sample)throw Error(\"Original Hazmat and authentic Run clip unavailable\");\n const run=sample.hazmatActions.HazmatRetargetedRun.getClip();\n const idle=sample.hazmatActions.Zombie_Idle.getClip();\n const norm=s=>s.replace(/\\.quaternion$/,\"\").replace(/_\\d+$/,\"\")\n    .replace(/^mixamorig:?/i,\"\").toLowerCase();\n const keyedIdle=new Map();\n for(const track of idle.tracks)if(track.name.endsWith(\".quaternion\"))\n   keyedIdle.set(norm(track.name),track);\n const arms=[];\n for(const track of run.tracks){\n   if(!track.name.endsWith(\".quaternion\"))continue;\n   const label=norm(track.name);\n   if(!/^(left|right)(arm|forearm)$/.test(label))continue;\n   const native=keyedIdle.get(label);\n   if(!native)throw Error(\"Native Hazmat idle did not animate \"+label);\n   const base=new THREE.Quaternion().fromArray(native.values,0);\n   const quat=new THREE.Quaternion();let max=0;\n   for(let i=0;i<track.times.length;i++){\n     quat.fromArray(track.values,4*i);\n     max=Math.max(max,base.angleTo(quat));\n   }\n   arms.push({label,max});\n }\n const mistVisible=hz.filter(z=>z.hazardMist?.visible).length;\n return {total:hz.length,mistVisible,armPoseTracks:hazmatZombie.status().armPoseTracks,\n    legs:run.tracks.filter(t=>/leftupleg|leftleg|rightupleg|rightleg/i.test(t.name)).length,\n    arms};\n};";
   await route.fulfill({response:rsp,body:src+injected+extraAudit+postureAudit+naturalRunProbe+armAudit,contentType:"application/javascript"});
  });
  const rsp=await page.goto("http://127.0.0.1:4173/?v=605-hazmat-visual-test",{waitUntil:"domcontentloaded",timeout:60500});
  report.http=rsp?.status();
  await page.waitForFunction(()=>globalThis.__hazmatSmoke?.ready(),null,{timeout:110000});
  await page.locator("#start").click();
  await page.waitForFunction(()=>globalThis.__hazmatSmoke?.snapshot()?.attached===10,null,{timeout:16050});
  await page.waitForTimeout(700);
  report.state=await page.evaluate(()=>globalThis.__hazmatSmoke.snapshot());
  report.motion=await page.evaluate(()=>globalThis.__hazmatSmoke.motion());
  report.arms=await page.evaluate(()=>globalThis.__hazmatArmAudit());
  report.lifecycle=await page.evaluate(()=>globalThis.__hazmatLifecycleAudit());
  const s=report.state;
  assert.equal(report.http,200);assert.equal(report.assetHttp,200);
  assert.equal(s.build,"605");assert.equal(s.wave,1);
  assert.equal(s.waveTarget,10);assert.equal(s.waveSpawned,10);
  assert.equal(s.live,10);assert.equal(s.acidic,10);assert.equal(s.boss,0);
  assert.deepEqual(s.kinds,["acidic"]);assert.equal(s.attached,10);
  assert.equal(s.original,"OriginalHazmatZombieGLB");
  assert.equal(s.mist,false,"Hazmat red aura still rendered");assert.equal(s.hidden,true);
  assert.equal(s.meshes.length,2);
  assert(s.meshes.every(m=>m.map&&m.vertices>2000),"Original textured GLB suit/head missing");
  assert(s.bones>=50&&s.leftLeg&&s.rightLeg);
  assert(s.height>1.45&&s.height<2.8,"Wrong Hazmat world size "+s.height);
  assert(s.headHits>=1&&s.torsoHits>=1);
  assert(s.clips.includes("Zombie_Walk_Root")&&s.clips.includes("Zombie_Idle")&&s.clips.includes("Zombie_Skill"));
  assert.equal(s.pool,19);
  assert.equal(report.arms.total,10);
  assert.equal(report.arms.mistVisible,0,"Red cloud still visible on a Hazmat");
  assert(report.arms.armPoseTracks>=8,"Authentic original Hazmat arm poses not present");
  assert(report.arms.legs>=4,"Original recorded Run leg tracks disappeared");
  assert(report.arms.arms.length>=4,"Missing native left/right elbow and upper-arm animation");
  assert(report.arms.arms.every(a=>a.max<.9),
    "Running arms still pull into exaggerated postures: "+JSON.stringify(report.arms.arms));
  const uppers=report.arms.arms.filter(a=>a.label==="leftarm"||a.label==="rightarm");
  const lowers=report.arms.arms.filter(a=>a.label==="leftforearm"||a.label==="rightforearm");
  assert.equal(uppers.length,2);assert.equal(lowers.length,2);
  assert(uppers.every(a=>a.max>.12&&a.max<.5),
    "Native Hazmat arms not making a subtle opposite-side run swing: "+JSON.stringify(uppers));
  assert(lowers.every(a=>a.max>.04&&a.max<.30),
    "Native elbows look locked in place: "+JSON.stringify(lowers));
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
  report.run=await page.evaluate(()=>globalThis.__hazmatNaturalRunProbe());
  assert.equal(report.run.source,true,"Recorded Run source did not load");
  assert.equal(report.run.native,true,"Original Hazmat rig is not using recorded Run");
  assert.equal(report.run.clip,"HazmatRetargetedRun");
  assert.equal(report.run.selected,"HazmatRetargetedRun");
  assert(report.run.tracks>=16,"Not enough authentic Mixamo tracks transferred");
  assert(report.run.duration>.3&&report.run.duration<3);
  assert(report.run.rate>=.5&&report.run.rate<=1.85,
    "Funny hyperfast Hazmat running cycle remains: "+report.run.rate);
  assert(report.run.angles[1]>.25&&report.run.angles[3]>.25&&
    report.run.angles[0]>.04&&report.run.angles[2]>.04,
    "Native both legs not moving correctly: "+JSON.stringify(report.run.angles));

  assert(life.afterTwo.headHitbox&&life.afterTwo.bodyHitbox);
  assert(life.explosionMs!==null&&Number.isFinite(life.explosionMs));
  assert(life.explosionMs<4500,"Main-thread grenade blast stalls >4.5 seconds");
  assert(report.motion.angles.filter(v=>v>.1).length>=3,"Real legs not bending: "+JSON.stringify(report.motion));
  assert.equal(errors.length,0,"JS errors: "+errors.join("; "));
  report.passed=true;
 }catch(e){
  report.failure=String(e?.stack||e);
  try{report.debug=await page?.evaluate(()=>globalThis.__hazmatSmoke?.snapshot())}catch(_){}
 }finally{
  if(browser)await browser.close();
  report.errors=errors;
  fs.writeFileSync("HAZMAT_V605_AUDIT.json",JSON.stringify(report,null,2));
  console.log("HAZMAT_V599_REPORT="+JSON.stringify(report));
  if(!report.passed)process.exitCode=1;
 }
})();