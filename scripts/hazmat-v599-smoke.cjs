const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("fs");
(async()=>{
 let browser,page;const report={build:599,passed:false},errors=[];
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  page=await browser.newPage({viewport:{width:1200,height:800}});
  page.on("pageerror",e=>errors.push(String(e)));
  page.on("response",r=>{if(r.url().includes("/assets/zombie_hazmat.glb"))report.assetHttp=r.status()});
  await page.route(/\/src\/game\.js\?v=599$/,async route=>{
   const rsp=await route.fetch(),src=await rsp.text();
   const injected="\n;globalThis.__hazmatSmoke={\n ready:()=>newCityCollisionReady&&hazmatZombie.status().loaded,\n snapshot:()=>{\n  const live=zombies.filter(z=>!z.dead),hz=live.filter(z=>z.hazmatVisual),z=hz[0],meshes=[],bones=[];\n  z?.hazmatModel?.traverse(o=>{\n   if(o.isBone)bones.push(o.name);\n   if(o.isSkinnedMesh)meshes.push({name:o.name,map:!!o.material?.map,vertices:o.geometry?.getAttribute(\"position\")?.count||0});\n  });\n  const box=z?.hazmatVisual?new THREE.Box3().setFromObject(z.hazmatVisual,true):null;\n  return {\n   build:document.documentElement.dataset.cityOutbreakBuild,wave,waveTarget,waveSpawned,\n   live:live.length,kinds:[...new Set(live.map(z=>z.kind))],\n   acidic:live.filter(z=>z.kind===\"acidic\").length,boss:live.filter(z=>z.kind===\"boss\").length,\n   attached:hz.length,original:z?.hazmatModel?.name,meshes,bones:bones.length,\n   leftLeg:bones.some(n=>/leftleg/i.test(n)),rightLeg:bones.some(n=>/rightleg/i.test(n)),\n   height:box?.getSize(new THREE.Vector3()).y,scale:z?.hazmatVisual?.scale.x,\n   clips:Object.keys(z?.hazmatActions||{}),mist:z?.hazardMist?.visible,\n   hidden:z?.rigVisual?(()=>{let seen=0;z.rigVisual.traverse(o=>{if(o.isMesh&&o.visible)seen++});return seen===0})():false,\n   headHits:z?.hitMeshes?.filter(o=>o.userData?.part===\"head\").length,\n   torsoHits:z?.hitMeshes?.filter(o=>o.userData?.part===\"torso\").length,\n   pool:BOSS_NAME_POOL.length\n  };\n },\n motion:()=>{\n  const z=zombies.find(z=>!z.dead&&z.kind===\"acidic\"&&z.hazmatMixer);\n  if(!z)return null;\n  const mixer=z.hazmatMixer,walk=z.hazmatActions.Zombie_Walk_Root,bones=[];\n  z.hazmatModel.traverse(o=>{if(o.isBone&&/leftleg|rightleg|leftupleg|rightupleg/i.test(o.name))bones.push(o)});\n  for(const action of Object.values(z.hazmatActions))action.stop();\n  walk.reset().play();walk.timeScale=1;\n  const pose=t=>{mixer.setTime(t);return bones.map(b=>b.quaternion.clone())};\n  const a=pose(.21),b=pose(1.35);\n  return {clip:walk.getClip().name,angles:a.map((q,i)=>q.angleTo(b[i]))};\n }\n};";
   await route.fulfill({response:rsp,body:src+injected,contentType:"application/javascript"});
  });
  const rsp=await page.goto("http://127.0.0.1:4173/?v=599-hazmat-visual-test",{waitUntil:"domcontentloaded",timeout:60000});
  report.http=rsp?.status();
  await page.waitForFunction(()=>globalThis.__hazmatSmoke?.ready(),null,{timeout:110000});
  await page.locator("#start").click();
  await page.waitForFunction(()=>globalThis.__hazmatSmoke?.snapshot()?.attached===10,null,{timeout:30000});
  await page.waitForTimeout(700);
  report.state=await page.evaluate(()=>globalThis.__hazmatSmoke.snapshot());
  report.motion=await page.evaluate(()=>globalThis.__hazmatSmoke.motion());
  const s=report.state;
  assert.equal(report.http,200);assert.equal(report.assetHttp,200);
  assert.equal(s.build,"599");assert.equal(s.wave,1);
  assert.equal(s.waveTarget,10);assert.equal(s.waveSpawned,10);
  assert.equal(s.live,10);assert.equal(s.acidic,10);assert.equal(s.boss,0);
  assert.deepEqual(s.kinds,["acidic"]);assert.equal(s.attached,10);
  assert.equal(s.original,"OriginalHazmatZombieGLB");
  assert.equal(s.mist,true);assert.equal(s.hidden,true);
  assert.equal(s.meshes.length,2);
  assert(s.meshes.every(m=>m.map&&m.vertices>2000),"Original textured GLB suit/head missing");
  assert(s.bones>=50&&s.leftLeg&&s.rightLeg);
  assert(s.height>1.45&&s.height<2.8,"Wrong Hazmat world size "+s.height);
  assert(s.headHits>=1&&s.torsoHits>=1);
  assert(s.clips.includes("Zombie_Walk_Root")&&s.clips.includes("Zombie_Idle")&&s.clips.includes("Zombie_Skill"));
  assert.equal(s.pool,19);
  assert(report.motion.angles.filter(v=>v>.1).length>=3,"Real legs not bending: "+JSON.stringify(report.motion));
  assert.equal(errors.length,0,"JS errors: "+errors.join("; "));
  report.passed=true;
 }catch(e){
  report.failure=String(e?.stack||e);
  try{report.debug=await page?.evaluate(()=>globalThis.__hazmatSmoke?.snapshot())}catch(_){}
 }finally{
  if(browser)await browser.close();
  report.errors=errors;
  fs.writeFileSync("HAZMAT_V599_AUDIT.json",JSON.stringify(report,null,2));
  console.log("HAZMAT_V599_REPORT="+JSON.stringify(report));
  if(!report.passed)process.exitCode=1;
 }
})();