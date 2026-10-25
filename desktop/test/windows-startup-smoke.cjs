'use strict';
// Windows CI: run the ACTUAL packaged application with an ephemeral loopback
// Chrome DevTools port; inspect the rendered page and click the REAL start.
// This avoids Playwright Electron.launch's Node inspector dependency, which
// is disabled in packaged executables. No debugging port in release builds.
const { chromium }=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const path=require('node:path');
const net=require('node:net');
const assert=require('node:assert/strict');
const base=path.resolve(__dirname,'../../test-results/windows');
const exe=path.resolve(__dirname,'../dist/win-unpacked/CITY OUTBREAK Development.exe');
let proc=null,browser=null,page=null,childLogs=[];
const problems=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function getFreePort(){
 const s=net.createServer();
 await new Promise((resolve,reject)=>s.listen(0,'127.0.0.1',resolve).once('error',reject));
 const p=s.address().port;
 await new Promise(resolve=>s.close(resolve));
 return p;
}
(async()=>{
 await fs.mkdir(base,{recursive:true});
 const port=await getFreePort();
 proc=spawn(exe,[
  '--remote-debugging-port='+port,
  '--remote-debugging-address=127.0.0.1',
  '--enable-logging=stderr',
  '--enable-webgl','--use-angle=swiftshader',
  '--enable-unsafe-swiftshader','--ignore-gpu-blocklist',
  '--disable-gpu-sandbox'
 ],{windowsHide:true,cwd:path.dirname(exe),env:{...process.env,CITY_DESKTOP_SMOKE:'1'},stdio:['ignore','pipe','pipe']});
 for(const [stream,label] of [[proc.stdout,'stdout'],[proc.stderr,'stderr']]){
  stream.on('data',data=>{
   const line=data.toString();
   childLogs.push(label+': '+line);
   if(childLogs.length>200)childLogs.shift();
  });
 }
 proc.on('error',err=>problems.push('process launch: '+err.message));
 let available=false;
 for(let t=0;t<140;t++){
  if(proc.exitCode!==null)throw Error('Packaged application exited early with code '+proc.exitCode+'; logs: '+childLogs.join(' | ').slice(-6000));
  try{
   const resp=await fetch('http://127.0.0.1:'+port+'/json/version',{signal:AbortSignal.timeout(500)});
   if(resp.ok){available=true;break}
  }catch(_){}
  await sleep(250);
 }
 if(!available)throw Error('Electron remote debugging never became available: '+childLogs.join(' | ').slice(-6000));
 browser=await chromium.connectOverCDP('http://127.0.0.1:'+port,{timeout:20000});
 const context=browser.contexts()[0];
 for(let t=0;t<120;t++){
  page=context.pages().find(p=>p.url().startsWith('http://127.0.0.1:')&&!p.url().endsWith('/json/version'));
  if(page)break;
  await sleep(250);
 }
 if(!page)throw Error('Electron opened no local game page. Logs: '+childLogs.join(' | ').slice(-4000));
 page.on('pageerror',e=>problems.push('pageerror: '+e.stack));
 page.on('console',m=>{if(m.type()==='error')problems.push('console: '+m.text())});
 page.on('requestfailed',req=>problems.push('requestfailed: '+req.url()+' '+req.failure()?.errorText));
 page.on('response',res=>{if(res.status()>=400)problems.push('http '+res.status()+' '+res.url())});
 await page.waitForLoadState('domcontentloaded',{timeout:15000});
 console.log('CITY_DESKTOP_LAUNCH '+JSON.stringify({url:page.url(),title:await page.title()}));
 await fs.writeFile(path.join(base,'launch.html'),await page.content());
 await page.screenshot({path:path.join(base,'01-launch.png'),timeout:15000}).catch(e=>problems.push('screenshot: '+e.message));
 assert.equal(await page.locator('#start').count(),1,'START GAME button must exist');
 try{
  await page.locator('#city-performance-dropdown').waitFor({state:'attached',timeout:35000});
 }catch(e){
  throw Error('The game module did not initialize (performance HUD absent). '+problems.join(' | '));
 }
 await page.locator('#start').click({timeout:15000});
 await page.waitForTimeout(6500);
 const state=await page.evaluate(()=>({
  startScreenDisplay:getComputedStyle(document.querySelector('#startScreen')).display,
  gameBuild:document.documentElement.dataset.cityOutbreakBuild,
  weapon:document.querySelector('#weaponName')?.textContent,
  wave:document.querySelector('#wave')?.textContent,
  hud:!!document.querySelector('#city-performance-dropdown')
 }));
 await fs.writeFile(path.join(base,'state.json'),JSON.stringify({state,problems,childLogs},null,2));
 await page.screenshot({path:path.join(base,'02-after-start.png'),timeout:10000}).catch(e=>problems.push('game screenshot: '+e.message));
 console.log('CITY_DESKTOP_START_RESULT '+JSON.stringify(state));
 assert.equal(state.startScreenDisplay,'none','START GAME did not dismiss the title screen');
 assert.match(state.weapon||'',/M17/i,'M17 must be equipped after startup');
 assert.ok(state.hud,'Game performance HUD must be initialized');
 assert.equal(problems.filter(s=>s.startsWith('pageerror:')).length,0,'Game JavaScript error: '+problems.join(' | '));
 console.log('CITY_DESKTOP_SMOKE_PASS');
})().catch(async err=>{
 console.error('CITY_DESKTOP_SMOKE_FAILED',String(err));
 console.error('CITY_DESKTOP_PROBLEMS',JSON.stringify(problems));
 console.error('CITY_DESKTOP_PROCESS_LOG',childLogs.join('\n').slice(-9000));
 await fs.mkdir(base,{recursive:true}).catch(()=>{});
 await fs.writeFile(path.join(base,'failure.txt'),String(err)+'\n'+problems.join('\n')+'\n'+childLogs.join('\n')).catch(()=>{});
 process.exitCode=1;
}).finally(async()=>{
 if(browser)try{await browser.close()}catch(_){}
 if(proc&&proc.exitCode===null){proc.kill();await sleep(250)}
});
