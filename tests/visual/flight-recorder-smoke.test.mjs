import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const base=(process.env.CITY_TEST_URL||'http://127.0.0.1:8765').replace(/\/$/,'');
const out='test-results/flight-recorder';
await mkdir(out,{recursive:true});

test('v779 flight recorder runs inside game, exports offline JSON and disables cleanly',{timeout:180000},async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
  '--disable-dev-shm-usage','--ignore-gpu-blocklist'
 ]});
 const page=await browser.newPage({viewport:{width:1024,height:576},deviceScaleFactor:1,acceptDownloads:true});
 const errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 try{
  await page.addInitScript(()=>{
   localStorage.setItem('city-outbreak-graphics-v1','veryLow');
   const raf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>setTimeout(()=>raf(cb),150);
  });
  await page.goto(base+'/?benchmark=empty',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>Number(document.documentElement.dataset.cityOutbreakBuild)>=779,
    null,{timeout:90000,polling:250});
  await page.locator('#start').click({noWaitAfter:true,timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#startScreen')?.style.display==='none',
    null,{timeout:60000,polling:250});
  await page.waitForTimeout(1800);
  assert.equal(await page.locator('#city-flight-toggle').count(),1);
  await page.keyboard.press('Escape');
  // Keyboard control avoids Linux software-WebGL compositor/pointer lock
  // intercepting Playwright's synthetic mouse click on the HTML dropdown.
  // Still exercises real DOM focus, Enter key events and the buttons.
  await page.locator('#city-performance-dropdown summary').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(450);
  assert.match(await page.locator('#city-flight-status').textContent(),/Recording locally/);
  await page.locator('#city-flight-toggle').focus();
  await page.keyboard.press('Enter');
  assert.match(await page.locator('#city-flight-status').textContent(),/Recording disabled/);
  const downloadPromise=page.waitForEvent('download',{timeout:30000});
  await page.locator('#city-flight-save').focus();
  await page.keyboard.press('Enter');
  const download=await downloadPromise;
  assert.equal(download.suggestedFilename(),'city-outbreak-flight-report.json');
  const report=JSON.parse(await readFile(await download.path(),'utf8'));
  assert.equal(report.schema,'city-outbreak-flight-recorder-v1');
  assert.ok(Number(report.build)>=779,'Recorder must work with later game builds');
  assert.equal(report.benchmark,'empty-city');
  assert.equal(report.enabled,false,'OFF switch stops recorder');
  assert.ok(report.framesRecorded>0,'Frame observations were collected');
  assert.ok(report.historyFrames>0,'Recent frames are bounded');
  assert.ok(report.historyFrames<=480,'Recording must not grow without bounds');
  assert.ok(report.events.length>0,'Simulated slow CI frame pacing should trigger stutter events');
  assert.ok(report.events.length<=24,'Spike log is bounded');
  assert.ok(report.events.every(e=>Array.isArray(e.preceding)&&Array.isArray(e.after)));
  assert.ok(report.overheadSample&&typeof report.overheadSample==='object');
  assert.equal(errors.length,0,'No page JS crashes');
  console.log('FLIGHT_RECORDER_V779_PASS',JSON.stringify({events:report.events.length,frames:report.framesRecorded,overhead:report.overheadSample}));
  await writeFile(out+'/verified-export.json',JSON.stringify(report,null,2));
 }catch(error){
  await writeFile(out+'/failure.json',JSON.stringify({error:String(error),errors,url:page.url()},null,2));
  throw error;
 }finally{await page.close();await browser.close()}
});
