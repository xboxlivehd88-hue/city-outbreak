import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';

const base=(process.env.CITY_TEST_URL||'http://127.0.0.1:8765').replace(/\/$/,'');
const out='test-results/v780-comparison';
await mkdir(out,{recursive:true});

const scenarios=[
 {mode:'collision',effects:false},
 {mode:'environment',effects:true}
];
for(const scenario of scenarios){
 test('v780 '+scenario.mode+' uses real city collisions, zero zombies and a labeled flight report',
 {timeout:200000},async()=>{
  const browser=await chromium.launch({headless:true,args:[
   '--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
   '--disable-dev-shm-usage','--ignore-gpu-blocklist'
  ]});
  const page=await browser.newPage({viewport:{width:1024,height:576},
   deviceScaleFactor:1,acceptDownloads:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.addInitScript(()=>{
    // CI software WebGL is for functional validation, not gaming-PC FPS.
    localStorage.setItem('city-outbreak-graphics-v1','medium');
    const raf=window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame=cb=>setTimeout(()=>raf(cb),120);
   });
   await page.goto(base+'/?benchmark='+scenario.mode,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>Number(document.documentElement.dataset.cityOutbreakBuild)>=780&&
    typeof window.__cityEmptyBenchmarkState==='function',null,{timeout:90000,polling:250});
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.cityBenchmark),scenario.mode);
   await page.locator('#start').click({noWaitAfter:true,timeout:45000});
   await page.waitForFunction(()=>window.__cityEmptyBenchmarkState()?.running===true,
    null,{timeout:90000,polling:250});
   await page.waitForFunction(()=>window.__cityEmptyBenchmarkState()?.mapReady===true,
    null,{timeout:90000,polling:250});
   await page.waitForTimeout(1000);
   const before=await page.evaluate(()=>window.__cityEmptyBenchmarkState());
   assert.equal(before.zombies,0,'No zombie spawn in benchmarks');
   assert.equal(before.collisionEnabled,true,'Must activate original collision functions');
   assert.equal(before.effectsEnabled,scenario.effects,'Effects toggle must match comparison');
   if(!scenario.effects){
    assert.equal(before.rainVisible,false,'Collision-only mode must hide rain');
    assert.equal(before.streetLightsVisible,0,'Collision-only mode must hide dynamic lamps');
   }else{
    assert.equal(before.rainVisible,true,'Medium environment test must render weather');
   }
   await page.keyboard.down('w');
   await page.waitForTimeout(1300);
   await page.keyboard.up('w');
   await page.waitForTimeout(350);
   const after=await page.evaluate(()=>window.__cityEmptyBenchmarkState());
   assert.ok(after.collisionChecks>0,'Player movement MUST invoke actual collision');
   assert.ok(after.groundChecks>0,'Player movement MUST raycast actual GLB terrain');
   assert.ok(Math.hypot(after.x-before.x,after.z-before.z)>.04,'Player must move with collisions enabled');
   assert.equal(after.zombies,0,'Movement must not spawn a wave');
   // Headless click is intercepted by the WebGL pointer-lock compositor;
   // keyboard focus triggers actual native HTML summary and save button.
   await page.keyboard.press('Escape');
   await page.locator('#city-performance-dropdown summary').focus();
   await page.keyboard.press('Enter');
   const downloadWait=page.waitForEvent('download',{timeout:30000});
   await page.locator('#city-flight-save').focus();
   await page.keyboard.press('Enter');
   const dl=await downloadWait;
   const report=JSON.parse(await readFile(await dl.path(),'utf8'));
   assert.equal(report.build,'780');
   assert.equal(report.benchmark,scenario.mode);
   assert.equal(report.benchmarkDetail.collisionEnabled,true);
   assert.equal(report.benchmarkDetail.environmentEffectsEnabled,scenario.effects);
   assert.ok(report.benchmarkDetail.collisionChecks>0);
   assert.ok(report.benchmarkDetail.groundSamples>0);
   assert.ok(report.framesRecorded>0);
   assert.equal(errors.length,0,'No unhandled game errors');
   console.log('CITY_V780_SCENARIO_PASS',JSON.stringify({mode:scenario.mode,
    movement:Math.hypot(after.x-before.x,after.z-before.z),checks:after.collisionChecks,
    floorChecks:after.groundChecks,rain:after.rainVisible,zombies:after.zombies,
    recordedFrames:report.framesRecorded}));
   await writeFile(out+'/'+scenario.mode+'.json',JSON.stringify({before,after,report},null,2));
  }catch(e){
   await writeFile(out+'/'+scenario.mode+'-failure.json',JSON.stringify({error:String(e),errors,
    url:page.url()},null,2));
   throw e;
  }finally{await page.close();await browser.close();}
 });
}
