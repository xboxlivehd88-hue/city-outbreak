import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';

const base=(process.env.CITY_TEST_URL||'http://127.0.0.1:8765').replace(/\/$/,'');
const out='test-results/v781-effects-zombies';
await mkdir(out,{recursive:true});

for(const mode of ['rain','lights','zombies']){
 test('v781 '+mode+' isolates rendering and exports a labeled local report',
 {timeout:180000},async()=>{
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
    localStorage.setItem('city-outbreak-graphics-v1','medium');
    // Stable, slow software-WebGL test pacing; NOT a real-PC performance test.
    const raf=window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame=cb=>setTimeout(()=>raf(cb),130);
   });
   await page.goto(base+'/?benchmark='+mode,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>Number(document.documentElement.dataset.cityOutbreakBuild)>=781
    && typeof window.__cityEmptyBenchmarkState==='function',null,{timeout:90000,polling:250});
   await page.locator('#start').click({noWaitAfter:true,timeout:45000});
   await page.waitForFunction(()=>window.__cityEmptyBenchmarkState()?.running,
    null,{timeout:60000,polling:250});
   await page.waitForFunction(()=>window.__cityEmptyBenchmarkState()?.mapReady,
    null,{timeout:60000,polling:250});
   if(mode==='zombies'){
    await page.waitForFunction(()=>window.__cityEmptyBenchmarkState()?.staticSpawnComplete,
     null,{timeout:60000,polling:250});
   }
   await page.waitForTimeout(800);
   const first=await page.evaluate(()=>window.__cityEmptyBenchmarkState());
   assert.equal(first.mode,mode);
   assert.equal(first.collisionEnabled,true);
   assert.equal(first.rainEnabled,mode==='rain');
   assert.equal(first.lightingEnabled,mode==='lights');
   assert.equal(first.zombieVisualsOnly,mode==='zombies');
   assert.equal(first.zombieAIEnabled,false);
   assert.equal(first.rainVisible,mode==='rain','Medium rain visibility must be exclusive');
   if(mode!=='lights'){
    assert.equal(first.streetLightsVisible,0,'Dynamic street lights must remain off');
    assert.equal(first.canopyVisible,false,'Dynamic canopy light must remain off');
   }
   if(mode==='zombies'){
    assert.equal(first.staticSpawnComplete,true);
    assert.equal(first.zombies,8,'Eight original Wave-1 zombie models must spawn');
   }else assert.equal(first.zombies,0,'No zombies in effects-only diagnostics');
   await page.keyboard.down('w');
   await page.waitForTimeout(900);
   await page.keyboard.up('w');
   await page.waitForTimeout(200);
   const moved=await page.evaluate(()=>window.__cityEmptyBenchmarkState());
   assert.ok(moved.collisionChecks>0&&moved.groundChecks>0,'Real GLB collision must remain active');
   assert.equal(moved.zombies,first.zombies,'Frozen zombie count must remain constant');
   await page.keyboard.press('Escape');
   await page.locator('#city-performance-dropdown summary').focus();
   await page.keyboard.press('Enter');
   const downloadEvent=page.waitForEvent('download',{timeout:30000});
   await page.locator('#city-flight-save').focus();
   await page.keyboard.press('Enter');
   const download=await downloadEvent;
   const report=JSON.parse(await readFile(await download.path(),'utf8'));
   assert.equal(report.schema,'city-outbreak-flight-recorder-v1');
   assert.equal(report.build,'781');
   assert.equal(report.benchmark,mode);
   assert.equal(report.benchmarkDetail.collisionEnabled,true);
   assert.equal(report.benchmarkDetail.rainEnabled,mode==='rain');
   assert.equal(report.benchmarkDetail.lightingEnabled,mode==='lights');
   assert.equal(report.benchmarkDetail.zombieVisualsOnly,mode==='zombies');
   assert.equal(report.benchmarkDetail.zombieAIEnabled,false);
   assert.equal(report.benchmarkDetail.staticZombieCount,mode==='zombies'?8:0);
   assert.ok(report.benchmarkDetail.groundSamples>0);
   assert.ok(report.framesRecorded>0);
   assert.equal(errors.length,0,'No runtime errors');
   console.log('V781_DIAGNOSTIC_PASS',JSON.stringify({mode,frames:report.framesRecorded,
    zombies:moved.zombies,rain:moved.rainVisible,
    lights:moved.streetLightsVisible,ground:moved.groundChecks}));
   await writeFile(out+'/'+mode+'.json',JSON.stringify({first,moved,report},null,2));
  }catch(e){
   await writeFile(out+'/'+mode+'-failure.json',JSON.stringify({error:String(e),errors,
    url:page.url()},null,2));
   throw e;
  }finally{await page.close();await browser.close()}
 });
}
