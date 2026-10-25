'use strict';
// Launch the ACTUAL packaged Windows Electron app, click the real START GAME
// button and require observable gameplay. CI-only; no gameplay test hooks.
// A successful installer/ZIP is not proof the main game JS ever executed.
const { _electron: electron } = require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');

const folder=path.resolve(__dirname,'../../test-results/windows');
const exe=path.resolve(__dirname,'../dist/win-unpacked/CITY OUTBREAK Development.exe');
const issues=[];
let app;
(async()=>{
 await fs.mkdir(folder,{recursive:true});
 app=await electron.launch({
  executablePath:exe,
  timeout:90000,
  env:{...process.env,CITY_DESKTOP_SMOKE:'1'},
  args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader',
   '--ignore-gpu-blocklist','--disable-gpu-sandbox']
 });
 const page=await app.firstWindow({timeout:90000});
 page.on('pageerror',e=>issues.push('pageerror: '+e.stack));
 page.on('console',m=>{if(m.type()==='error')issues.push('console: '+m.text())});
 page.on('requestfailed',req=>issues.push('requestfailed: '+req.url()+' '+req.failure()?.errorText));
 page.on('response',r=>{if(r.status()>=400)issues.push('http '+r.status()+': '+r.url())});
 await page.waitForLoadState('domcontentloaded');
 await fs.writeFile(path.join(folder,'launch.html'),await page.content());
 await page.screenshot({path:path.join(folder,'01-launch.png')});
 console.log('CITY_DESKTOP_LAUNCH '+JSON.stringify({url:page.url(),title:await page.title()}));
 assert.equal(await page.locator('#start').count(),1,'START GAME button must exist');
 // Catch unhandled import failures before attempting the button.
 try{await page.locator('#city-performance-dropdown').waitFor({state:'attached',timeout:40000})}
 catch(e){
  throw Error('Game module never initialized (performance HUD missing): '+issues.join(' | '));
 }
 // Playwright click provides an actual user gesture. No special gameplay bypass.
 await page.locator('#start').click({timeout:30000});
 await page.waitForTimeout(9000);
 const state=await page.evaluate(()=>({
  startScreenClass:document.querySelector('#startScreen')?.className,
  startScreenDisplay:getComputedStyle(document.querySelector('#startScreen')).display,
  gameBuild:document.documentElement.dataset.cityOutbreakBuild,
  weapon:document.querySelector('#weaponName')?.textContent,
  wave:document.querySelector('#wave')?.textContent,
  sceneRenderer:!!document.querySelector('#cv'),
  performanceHud:!!document.querySelector('#city-performance-dropdown'),
  errors:document.querySelector('#runtimeErrorOverlay')?.textContent||''
 }));
 await fs.writeFile(path.join(folder,'state.json'),JSON.stringify({state,issues},null,2));
 await page.screenshot({path:path.join(folder,'02-after-start.png')});
 console.log('CITY_DESKTOP_START_RESULT '+JSON.stringify(state));
 assert.equal(state.startScreenDisplay,'none','Clicking START GAME must dismiss start menu');
 assert.match(state.weapon||'',/M17/i,'M17 must be the spawned gun');
 assert.ok(state.performanceHud,'Performance HUD must be initialized');
 assert.equal(issues.filter(s=>s.startsWith('pageerror:')).length,0,'JavaScript runtime errors: '+issues.join(' | '));
 console.log('CITY_DESKTOP_SMOKE_PASS');
})().catch(async err=>{
 console.error('CITY_DESKTOP_SMOKE_FAILED',err);
 console.error('CITY_DESKTOP_ERRORS',JSON.stringify(issues));
 try{await fs.writeFile(path.join(folder,'failure.txt'),String(err)+'\n'+issues.join('\n'))}catch(_){}
 process.exitCode=1;
}).finally(async()=>{if(app){try{await app.close()}catch(_){}}});
