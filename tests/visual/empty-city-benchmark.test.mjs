import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const base=(process.env.CITY_TEST_URL||'http://127.0.0.1:8765').replace(/\/$/,'');
const out='test-results/empty-city';
await mkdir(out,{recursive:true});

test('v778 empty city starts with zero zombies, moves and reports rendering', {timeout:180000}, async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
  '--disable-dev-shm-usage','--ignore-gpu-blocklist'
 ]});
 const page=await browser.newPage({viewport:{width:1024,height:576},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',error=>errors.push('pageerror: '+error.message));
 page.on('console',message=>{if(message.type()==='error')errors.push('console: '+message.text())});
 try{
  await page.addInitScript(()=>{
   // Software WebGL on CI is NOT a performance benchmark of a gaming GPU.
   localStorage.setItem('city-outbreak-graphics-v1','veryLow');
   const raf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=callback=>setTimeout(()=>raf(callback),160);
  });
  await page.goto(base+'/?benchmark=empty',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>{
   const d=document.documentElement.dataset;
   return d.cityBenchmark==='empty'&&d.cityOutbreakBuild==='778'&&typeof window.__cityEmptyBenchmarkState==='function';
  },null,{polling:250,timeout:90000});
  await page.locator('#start').click({noWaitAfter:true,timeout:45000});
  await page.waitForFunction(()=>document.querySelector('#startScreen')?.style.display==='none',
    null,{polling:250,timeout:90000});
  await page.waitForFunction(()=>window.__cityEmptyBenchmarkState()?.running===true,
    null,{polling:250,timeout:30000});
  await page.waitForTimeout(900);
  const first=await page.evaluate(()=>window.__cityEmptyBenchmarkState());
  assert.equal(first.zombies,0,'Empty baseline MUST NOT spawn zombies');
  assert.equal(first.rainVisible,false,'Rain geometry must be hidden');
  assert.equal(first.splashVisible,false,'Rain splashes must be hidden');
  assert.equal(first.streetLightsVisible,0,'Dynamic street lights must be disabled');
  assert.equal(first.canopyVisible,false,'Canopy lighting must be disabled');
  assert.match(await page.locator('#remaining').textContent(),/ZOMBIES\s+0/);
  await page.keyboard.down('w');
  await page.waitForTimeout(950);
  await page.keyboard.up('w');
  const moved=await page.evaluate(()=>window.__cityEmptyBenchmarkState());
  assert.ok(Math.hypot(moved.x-first.x,moved.z-first.z)>0.05,
    'WASD should move the camera in empty-city mode');
  // Use browser input and real pointer lock; direct QA mutation is never used.
  const locked=await page.evaluate(()=>document.pointerLockElement?.id==='cv');
  if(!locked){
   await page.locator('#cv').click({position:{x:512,y:250},noWaitAfter:true,timeout:10000});
   await page.waitForTimeout(400);
  }
  const beforeLook=await page.evaluate(()=>window.__cityEmptyBenchmarkState());
  await page.mouse.move(520,260);await page.mouse.move(533,268);
  await page.waitForTimeout(500);
  const afterLook=await page.evaluate(()=>window.__cityEmptyBenchmarkState());
  assert.ok(Math.abs(afterLook.yaw-beforeLook.yaw)+Math.abs(afterLook.pitch-beforeLook.pitch)>.0001,
    'Actual mouse look should rotate the camera');
  // Release pointer lock to interact with the visible reporting UI.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1600);
  const performance=await page.locator('#city-performance-dropdown pre').textContent();
  assert.match(performance,/DRAWS\s+\d+/,'Performance report must show draw calls');
  assert.match(performance,/TRIANGLES\s+\d+/,'Performance report must show triangles');
  assert.match(performance,/ZOMBIES\s+0/,'Performance report must confirm zero zombies');
  const report={first,moved,afterLook,performance,errors};
  await writeFile(out+'/baseline-ci-report.json',JSON.stringify(report,null,2));
  // Save a real image from the WebGL canvas when the CI driver permits readback.
  try{
   const png=await page.locator('#cv').evaluate(canvas=>canvas.toDataURL('image/png'),{timeout:12000});
   if(png.startsWith('data:image/png;base64,')&&png.length>1500)
    await writeFile(out+'/empty-city.png',Buffer.from(png.split(',')[1],'base64'));
  }catch(e){await writeFile(out+'/canvas-capture-note.txt',String(e));}
  assert.equal(errors.length,0,'The page must have no uncaught JS errors');
  console.log('EMPTY_CITY_V778_PASS',JSON.stringify({zombies:first.zombies,movementMeters:Math.hypot(moved.x-first.x,moved.z-first.z),cameraLook:true,performanceReport:true}));
 }catch(e){
  await writeFile(out+'/failure.json',JSON.stringify({message:String(e),errors,url:page.url()},null,2));
  throw e;
 }finally{await page.close();await browser.close();}
});
