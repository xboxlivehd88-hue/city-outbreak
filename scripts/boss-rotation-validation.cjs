const {chromium}=require("playwright");
const fs=require("fs");
const assert=require("assert/strict");
(async()=>{
 const report={test:"v585 boss rotation integration",version:"585",pass:false,time:new Date().toISOString()};
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  const page=await browser.newPage({viewport:{width:1200,height:800}});
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.route(/\/src\/game\.js\?v=585$/,async route=>{
   const resp=await route.fetch(),original=await resp.text();
   const addon=`
;globalThis.__bossRotation585={
 ready:()=>!!panzerBossAsset&&newCityCollisionReady,
 wave1:()=>({
   wave,boss:currentBoss?.bossName||null,target:waveTarget,spawned:waveSpawned,
   candidateNames:[...BOSS_NAME_POOL],panzerModelReady:!!panzerBossAsset,
   panzerSize:PANZER_VISUAL_HEIGHT,
   visiblePanzerTest:zombies.some(z=>!z.dead&&z.bossName===PANZER_BOSS_NAME)
 }),
 forcePanzerBossWave:()=>{
   for(const z of zombies)releaseZombieVisual(z);
   zombies=[];
   currentBoss=null;
   bossWaveName=PANZER_BOSS_NAME;
   wave=10;
   spawnWave();
   const boss=currentBoss;
   if(!boss)throw Error("No boss spawned in wave 10");
   return {
     wave,selected:boss.bossName,target:waveTarget,spawned:waveSpawned,
     panzerVisible:!!boss.panzerBossVisual,
     usingOriginalModel:!!boss.panzerBossMixer,
     visualHeightGoal:PANZER_VISUAL_HEIGHT,
     liveModelScaleFactor:boss.panzerBossVisual?.scale.x||null,
     bossHud:!!bossHUD,
     poolHasSuitGuy:BOSS_NAME_POOL.includes(SUIT_BOSS_NAME),
     poolHasPanzer:BOSS_NAME_POOL.includes(PANZER_BOSS_NAME),
     poolUnique:new Set(BOSS_NAME_POOL).size===BOSS_NAME_POOL.length
   };
 },
 rotateNames:()=>{
   const before=usedBossNames.slice();
   usedBossNames=[];
   const names=[];
   for(let i=0;i<BOSS_NAME_POOL.length;i++)names.push(nextBossName());
   usedBossNames=before;
   return {names,length:BOSS_NAME_POOL.length};
 }
};
`;
   await route.fulfill({response:resp,body:original+addon,contentType:"application/javascript"});
  });
  const response=await page.goto("http://127.0.0.1:4173/?verify=v585",{waitUntil:"domcontentloaded",timeout:60000});
  report.http=response?.status();
  await page.waitForFunction(()=>globalThis.__bossRotation585?.ready(),null,{timeout:110000});
  await page.locator("#start").click();
  await page.waitForTimeout(750);
  const wave1=await page.evaluate(()=>globalThis.__bossRotation585.wave1());
  report.wave1=wave1;
  assert.equal(wave1.wave,1);
  assert.equal(wave1.boss,null,"Wave 1 should not spawn Panzer");
  assert.equal(wave1.visiblePanzerTest,false,"Panzer must not spawn in Wave 1");
  assert.equal(wave1.target,10,"Wave 1 should return to normal 10-zombie count");
  assert(wave1.candidateNames.includes("PANZER ZOMBIE")&&wave1.candidateNames.includes("SUIT GUY"));
  const random=await page.evaluate(()=>globalThis.__bossRotation585.rotateNames());
  assert.equal(random.names.length,random.length);
  assert.equal(new Set(random.names).size,random.length,"Boss no-repeat rotation failed");
  report.bossPool={size:random.length,unique:true,panzerPresent:random.names.includes("PANZER ZOMBIE")};
  const bossWave=await page.evaluate(()=>globalThis.__bossRotation585.forcePanzerBossWave());
  report.bossWave=bossWave;
  assert.equal(bossWave.wave,10);
  assert.equal(bossWave.selected,"PANZER ZOMBIE");
  assert.equal(bossWave.target,1);
  assert.equal(bossWave.spawned,1);
  assert.equal(bossWave.panzerVisible,true);
  assert.equal(bossWave.usingOriginalModel,true);
  assert.equal(bossWave.visualHeightGoal,3.2);
  assert.equal(bossWave.poolHasPanzer,true);
  assert.equal(bossWave.poolHasSuitGuy,true);
  assert.equal(bossWave.poolUnique,true);
  report.errors=errors;
  assert.equal(errors.length,0,"Browser had JS exceptions: "+errors.join("; "));
  report.pass=true;
 }catch(e){
  report.failure=String(e?.stack||e);
 }finally{
  if(browser)await browser.close();
  report.completedAt=new Date().toISOString();
  fs.writeFileSync("BOSS_ROTATION_V585_AUDIT.json",JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify(report,null,2));
  if(!report.pass)process.exitCode=1;
 }
})();
