// Real seven-weapon first-person grip geometry measurement, not fake calibration.
const {chromium}=require("playwright"),fs=require("fs");
(async()=>{
 let browser;const report={passed:false,models:[],errors:[]};
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  const page=await browser.newPage({viewport:{width:1200,height:800}});
  page.on("pageerror",e=>report.errors.push(String(e)));
  const addon=`
;globalThis.__sourceWeaponGeometryAudit=()=>{
 const previous={weapon,aiming,pitch,inspection:fpsArmsInspector.enabled};
 fpsArmsInspector.set(false);
 const result=[];
 for(const w of ["pistol","rifle","shotgun","smg","m240","dmr","grenadeLauncher"]){
  weapon=w;aiming=false;aimBlend=0;pitch=0;reloading=false;reloadWeapon="";
  rebuildGun();move(.16);gun.updateMatrixWorld(true);
  const rig=gun.getObjectByName("OriginalCartoonFPSArmsGLB");
  const point=n=>{const b=rig?.getObjectByName(n);return b?gun.worldToLocal(b.getWorldPosition(new THREE.Vector3())).toArray().map(v=>+v.toFixed(4)):null};
  const geometry=[];
  gun.traverse(o=>{
   if(!o.isMesh||!o.visible)return;
   for(let a=o;a&&a!==gun;a=a.parent)if(a===rig||!a.visible)return;
   const b=new THREE.Box3().setFromObject(o,true);
   if(b.isEmpty())return;
   const center=gun.worldToLocal(b.getCenter(new THREE.Vector3())),size=b.getSize(new THREE.Vector3());
   geometry.push({name:o.name,center:center.toArray().map(v=>+v.toFixed(3)),size:size.toArray().map(v=>+v.toFixed(3))});
  });
  geometry.sort((a,b)=>b.size.reduce((x,y)=>x+y,0)-a.size.reduce((x,y)=>x+y,0));
  const hip={lw:point("L_wrist_03"),rw:point("R_wrist_025"),lt:point("L_thumb_3_06"),rt:point("R_thumb_3_028"),ri:point("R_point_4_033"),rp:point("R_pink_4_045"),geometry:geometry.slice(0,18)};
  aiming=true;aimBlend=1;move(.16);
  const ads={lw:point("L_wrist_03"),rw:point("R_wrist_025"),ri:point("R_point_4_033"),lt:point("L_thumb_3_06")};
  result.push({w,hip,ads});
 }
 weapon=previous.weapon;aiming=previous.aiming;pitch=previous.pitch;aimBlend=0;
 fpsArmsInspector.set(previous.inspection);rebuildGun();move(.016);
 return result;
};
`;
  await page.route(/\\/src\\/game\\.js\\?v=700$/,async route=>{
    const rsp=await route.fetch();const source=await rsp.text();
    await route.fulfill({response:rsp,body:source+addon,contentType:"application/javascript"});
  });
  await page.goto("http://127.0.0.1:4173/?v=700-source-grips",{waitUntil:"domcontentloaded",timeout:65000});
  await page.waitForFunction(()=>document.documentElement.dataset.fpsArmsGlbReady==="true",null,{timeout:90000});
  await page.waitForTimeout(9000);
  await page.locator("#start").click({noWaitAfter:true});
  await page.waitForFunction(()=>!!globalThis.__sourceWeaponGeometryAudit,null,{timeout:15000});
  report.models=await page.evaluate(()=>globalThis.__sourceWeaponGeometryAudit());
  report.passed=report.models.length===7&&report.models.every(x=>x.hip.geometry.length>0);
 }catch(e){report.error=String(e.stack||e)}
 finally{console.log("SOURCE_GRIP_GEOMETRY="+JSON.stringify(report));fs.writeFileSync("V701_GRIP_GEOMETRY.json",JSON.stringify(report,null,2));await browser?.close().catch(()=>{})}
 if(!report.passed)process.exitCode=1;
})();