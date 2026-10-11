const {chromium}=require("playwright"),fs=require("fs"),assert=require("assert/strict");
(async()=>{
 const report={version:"591",pass:false};let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  const page=await browser.newPage({viewport:{width:1200,height:800}});
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  page.on("response",r=>{if(r.url().includes("parasite_des_zombie_monster_game_model_free.glb"))report.assetHttp=r.status()});
  await page.route(/\/src\/game\.js\?v=591$/,async route=>{
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
  const rsp=await page.goto("http://127.0.0.1:4173/?v=591-asset-test",{waitUntil:"domcontentloaded",timeout:60000});
  report.http=rsp?.status();
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.ready(),null,{timeout:110000});
  await page.locator("#start").click();
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.state().attached,null,{timeout:30000});
  await page.waitForFunction(()=>globalThis.__parasiteSmoke?.state().calibrated,null,{timeout:20000});
  await page.waitForTimeout(550);
  report.state=await page.evaluate(()=>globalThis.__parasiteSmoke.state());
  // The multi-scale diagnostic proved square-law behavior in v587; check the final live size here.
  assert.equal(report.http,200);
  assert.equal(report.assetHttp,200);
  assert.equal(report.state.build,"591");
  assert.equal(report.state.wave,1);
  assert.equal(report.state.boss,"PARASITE MONSTER");
  assert.equal(report.state.model,"ParasiteBossOriginalGLB");
  assert.equal(report.state.waveTarget,1);
  assert.equal(report.state.waveSpawned,1);
  assert.equal(report.state.hitboxes,4);
  assert.equal(report.state.calibrated,true);
  assert(Number.isFinite(report.state.size));
  // Diagnostic only: test model's final size/facing must be approved by user.
  // Do not treat a stable scene as visual signoff.
  assert(Number.isFinite(report.state.actualLiveHeight)&&report.state.actualLiveHeight>0);
  assert(report.state.actualLiveHeight<25,"Unexpected enormous visual: "+report.state.actualLiveHeight);
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
  fs.writeFileSync("PARASITE_V591_AUDIT.json",JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify(report,null,2));
  if(!report.pass)process.exitCode=1;
 }
})();
