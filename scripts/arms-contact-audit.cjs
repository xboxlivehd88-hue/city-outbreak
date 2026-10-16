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
  // Record the ACTUAL in-engine held weapon with the corrected native skin.
  // The model is neither hidden nor displaced, and screenshots don't mutate it.
  try{ren.render(scene,cam);hip.jpeg=ren.domElement.toDataURL("image/jpeg",.42).slice(23)}
  catch(error){hip.captureError=String(error)}

  aiming=true;aimBlend=1;move(.16);
  const ads={lw:point("L_wrist_03"),rw:point("R_wrist_025"),ri:point("R_point_4_033"),lt:point("L_thumb_3_06")};
  result.push({w,hip,ads});
 }
 weapon=previous.weapon;aiming=previous.aiming;pitch=previous.pitch;aimBlend=0;
 fpsArmsInspector.set(previous.inspection);rebuildGun();move(.016);
 return result;
};
;globalThis.__v705FingerLauncherAudit=()=>{
 const save={weapon,aiming,aimBlend,inspection:fpsArmsInspector.enabled};
 fpsArmsInspector.set(false);aiming=false;aimBlend=0;reloading=false;reloadWeapon="";
 const spins=[];
 for(const w of ["pistol","rifle","shotgun","smg","m240","dmr","grenadeLauncher"]){
  weapon=w;rebuildGun();move(.025);
  const rig=gun.getObjectByName("OriginalCartoonFPSArmsGLB");
  const names=["L_point_08","L_point_2_09","L_middle_012","L_ring_2_016",
   "L_pink_019","L_thumb_2_05","R_point_030","R_middle_034",
   "R_ring_2_039","R_pink_042","R_thumb_2_027"];
  // Source AnimationMixer can establish its first PropertyMixer binding
  // after a new GLB clone is attached. Judge steady-state drift only after
  // four full authored-frame samples, not initial clip activation.
  for(let i=0;i<4;i++)poseOriginalFpsArms();
  const initial=names.map(n=>rig.getObjectByName(n)?.quaternion.clone());
  for(let i=0;i<240;i++)poseOriginalFpsArms();
  const drift=names.map((n,i)=>initial[i]?.angleTo(rig.getObjectByName(n).quaternion)||0);
  spins.push({w,sourceBones:Number(document.documentElement.dataset.fpsArmsFingerRestCount),maxDrift:Math.max(...drift),drift});
 }
 weapon=save.weapon;aiming=save.aiming;aimBlend=save.aimBlend;
 fpsArmsInspector.set(save.inspection);rebuildGun();move(.016);
 // Exercise the exact renderer-facing launcher effect path; no zombie damage.
 clearExplosionGlbs();
 const at=cam.position.clone().add(new THREE.Vector3(0,1,-3));
 const t=performance.now();spawnExplosionBurst(at,true,.055);
 const creationMs=performance.now()-t;
 const first=activeExplosionBursts.at(-1)?.sparkMesh;
 const count=first?.count||0;
 for(let i=0;i<80;i++)updateExplosionGlbs(1/60);
 const stopped=first?.count===0;
 clearExplosionGlbs();
 const t2=performance.now();spawnExplosionBurst(at,true,.055);
 const nextMs=performance.now()-t2;
 const second=activeExplosionBursts.at(-1)?.sparkMesh;
 const reused=first===second;
 clearExplosionGlbs();
 return{spins,launcher:{creationMs,nextMs,count,stopped,reused},fingerStatus:document.documentElement.dataset.fpsArmsFingerStability};
};
`;
  await page.route(url=>url.pathname.endsWith("/src/game.js"),async route=>{
    const rsp=await route.fetch();const source=await rsp.text();
    console.log("V701_SOURCE_AUDIT_INJECTED",route.request().url());
    await route.fulfill({response:rsp,body:source+addon,contentType:"application/javascript"});
  });
  await page.goto("http://127.0.0.1:4173/?v=705-source-grips",{waitUntil:"domcontentloaded",timeout:65000});
  await page.waitForFunction(()=>document.documentElement.dataset.fpsArmsGlbReady==="true",null,{timeout:90000});
  await page.waitForTimeout(9000);
  await page.locator("#start").click({noWaitAfter:true});
  await page.waitForFunction(()=>!!globalThis.__sourceWeaponGeometryAudit,null,{timeout:60000});
  report.models=await page.evaluate(()=>globalThis.__sourceWeaponGeometryAudit());
  report.handAndLauncher=await page.evaluate(()=>globalThis.__v705FingerLauncherAudit());
  console.log("V704_HAND_LAUNCHER_AUDIT="+JSON.stringify(report.handAndLauncher));

  for(const m of report.models){
   const jpeg=m.hip.jpeg;
   if(jpeg?.length>6000)console.log("V701_NATIVE_"+m.w.toUpperCase()+"_HIP_JPEG="+jpeg);
   m.hip.imageBytes=jpeg?.length||0;
   delete m.hip.jpeg;
  }

  report.passed=report.models.length===7&&report.models.every(x=>x.hip.geometry.length>0)&&
    report.handAndLauncher?.spins?.length===7&&
    report.handAndLauncher.spins.every(x=>x.sourceBones>=20&&x.maxDrift<.002)&&
    report.handAndLauncher.launcher?.reused&&report.handAndLauncher.launcher?.stopped&&
    report.handAndLauncher.launcher?.count>100;
 }catch(e){report.error=String(e.stack||e)}
 finally{console.log("SOURCE_GRIP_GEOMETRY="+JSON.stringify(report));fs.writeFileSync("V701_GRIP_GEOMETRY.json",JSON.stringify(report,null,2));await browser?.close().catch(()=>{})}
 if(!report.passed)process.exitCode=1;
})();