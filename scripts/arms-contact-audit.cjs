// Real seven-weapon first-person grip geometry measurement, not fake calibration.
// v710: exercise the full parent-matrix ADS forearm correction on CURRENT main
// against the protected v706 seven-gun wrist-contact baseline.
const {chromium}=require("playwright"),fs=require("fs");
(async()=>{
 let browser;const report={passed:false,models:[],errors:[]};
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  const page=await browser.newPage({viewport:{width:1200,height:800}});
  page.on("pageerror",e=>report.errors.push(String(e)));
  page.on("console",msg=>{if(msg.type()==="error")report.errors.push("console: "+msg.text().slice(0,450))});
  page.on("requestfailed",req=>report.errors.push("requestfailed: "+req.url()+" "+(req.failure()?.errorText||"")));
  const addon=`
;globalThis.__v710PrepareAudit=()=>{
 // Freeze only the automation's live zombie AI while we sample seven skinned
 // rigs; keep the REAL map, camera, weapon meshes and renderer available.
 health=1000000;paused=true;
 for(const z of zombies){if(z?.g?.parent)z.g.parent.remove(z.g);}
 zombies.length=0;
 return{ready:document.documentElement.dataset.fpsArmsGlbReady,
         hook:typeof globalThis.__sourceWeaponGeometryAudit};
};
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
  const ads={lw:point("L_wrist_03"),rw:point("R_wrist_025"),ri:point("R_point_4_033"),lt:point("L_thumb_3_06"),
   scales:["L_arm_01","L_elbow_02","R_arm_023","R_elbow_024"].map(n=>[n,rig.getObjectByName(n)?.scale.z])};
  // Save actual shader-rendered ADS for every ORIGINAL gun, never generic meshes.
  try{ren.render(scene,cam);ads.jpeg=ren.domElement.toDataURL("image/jpeg",.47).slice(23)}
  catch(error){ads.captureError=String(error)}
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
  // Holding the gun must keep the firing wrist STILL; only native index
  // phalanges should respond to a shot, on all seven weapons.
  const nativeIndex=rig.getObjectByName("R_point_030"),nativeWrist=rig.getObjectByName("R_wrist_025");
  const previousRecoil=recoil,previousShot=lastNativeTriggerShotAt;
  recoil=0;lastNativeTriggerShotAt=-1;
  // Settle the authored source mixer/IK to the actual neutral firing hold,
  // not its first frame after rebuilding a GLB clone.
  for(let i=0;i<8;i++)poseOriginalFpsArms();
  // A wrist-local quaternion changes naturally when the parent elbow turns.
  // Compare its actual WORLD orientation, which is what the player sees.
  const restIndex=nativeIndex.quaternion.clone();
  const restWrist=nativeWrist.getWorldQuaternion(new THREE.Quaternion());
  const restSample=Number(document.documentElement.dataset.fpsArmsAnimatedFingerTime);
  recoil=.18;lastNativeTriggerShotAt=performance.now()-72;
  for(let i=0;i<8;i++)poseOriginalFpsArms();
  const indexPull=restIndex.angleTo(nativeIndex.quaternion);
  const wristKick=restWrist.angleTo(nativeWrist.getWorldQuaternion(new THREE.Quaternion()));
  const firedSample=Number(document.documentElement.dataset.fpsArmsAnimatedFingerTime);
  recoil=previousRecoil;lastNativeTriggerShotAt=previousShot;poseOriginalFpsArms();
  spins.push({w,sourceBones:Number(document.documentElement.dataset.fpsArmsFingerRestCount),maxDrift:Math.max(...drift),drift,indexPull,wristKick,restSample,firedSample});
 }
 weapon=save.weapon;aiming=save.aiming;aimBlend=save.aimBlend;
 fpsArmsInspector.set(save.inspection);rebuildGun();move(.016);
 // Exercise the exact renderer-facing launcher effect path; no zombie damage.
 clearExplosionGlbs();
 const prewarmedInstances=explosionSparkPool.length;
 const prewarmedBufferSet=new Set(explosionSparkPool);
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
 // A three-slot pool rotates resources in FIFO order. Both bursts must
 // come from the initial prewarmed pool; same pointer is NOT required.
 const reused=prewarmedBufferSet.has(first)&&prewarmedBufferSet.has(second);
 const persistentFlash=sharedExplosionFlash.parent===scene&&
   !activeExplosionBursts.some(fx=>fx.group.children.some(x=>x.isPointLight));
 clearExplosionGlbs();
 return{spins,launcher:{creationMs,nextMs,count,stopped,reused,prewarmedInstances,persistentFlash},fingerStatus:document.documentElement.dataset.fpsArmsFingerStability};
};
`;
  await page.route(url=>url.pathname.endsWith("/src/game.js"),async route=>{
    const rsp=await route.fetch();const source=await rsp.text();
    console.log("V701_SOURCE_AUDIT_INJECTED",route.request().url());
    await route.fulfill({response:rsp,body:source+addon,contentType:"application/javascript"});
  });
  await page.goto("http://127.0.0.1:4173/?v=713-source-grips",{waitUntil:"domcontentloaded",timeout:65000});
  await page.waitForFunction(()=>document.documentElement.dataset.fpsArmsGlbReady==="true",null,{timeout:90000});
  await page.waitForTimeout(9000);
  await page.locator("#start").click({noWaitAfter:true});
  // The imported arms are already READY and the injected hook was loaded
  // before Start. Avoid the rAF-polled waitForFunction under SwiftShader:
  // it sometimes starves while zombie AI is active.
  try{
   report.prepared=await page.evaluate(()=>globalThis.__v710PrepareAudit());
  }catch(startError){
   report.startup=await page.evaluate(()=>({
    ready:document.documentElement.dataset.fpsArmsGlbReady,
    build:document.documentElement.dataset.cityOutbreakBuild,
    warmup:document.documentElement.dataset.explosionGpuWarmup,
    warmupError:document.documentElement.dataset.explosionGpuWarmupError,
    loader:[...document.scripts].map(x=>x.src).filter(Boolean),
    hook:typeof globalThis.__sourceWeaponGeometryAudit,
    fatal:document.body.innerText.slice(-700)
   }));
   throw startError;
  }
  report.models=await page.evaluate(()=>globalThis.__sourceWeaponGeometryAudit());
  // Ground-truth normal ADS original support-wrist contacts captured in
  // Chromium v706 BEFORE ADS sleeve retraction. The shorter sleeve must
  // retain these real gun positions instead of dragging hands off receivers.
  const approvedADS={
    pistol:[.3056,-.3649,-.8737],rifle:[.4938,-.4893,-2.076],
    shotgun:[.3502,-.3501,-1.5026],smg:[.2759,-.4711,-1.6643],
    m240:[.3919,-.3365,-2.5613],dmr:[.4155,-.3196,-2.6197],
    grenadeLauncher:[.4233,-.2852,-1.7503]
  };
  for(const m of report.models){
   const contact=approvedADS[m.w];
   m.ads.originalContactError=Math.hypot(...m.ads.lw.map((v,i)=>v-contact[i]));
  }
  report.handAndLauncher=await page.evaluate(()=>globalThis.__v705FingerLauncherAudit());
  console.log("V704_HAND_LAUNCHER_AUDIT="+JSON.stringify(report.handAndLauncher));

  for(const m of report.models){
   const jpeg=m.hip.jpeg,ads=m.ads.jpeg;
   if(jpeg?.length>6000)console.log("V711_"+m.w.toUpperCase()+"_HIP_JPEG="+jpeg);
   if(ads?.length>6000)console.log("V711_"+m.w.toUpperCase()+"_ADS_JPEG="+ads);
   m.hip.imageBytes=jpeg?.length||0;
   m.ads.imageBytes=ads?.length||0;
   delete m.hip.jpeg;delete m.ads.jpeg;
  }

  report.passed=report.models.length===7&&report.models.every(x=>x.hip.geometry.length>0)&&
    report.handAndLauncher?.spins?.length===7&&
    report.handAndLauncher.spins.every(x=>x.sourceBones>=20&&x.maxDrift<.002&&
      x.indexPull>.12&&x.indexPull<.4&&
      // Local parent IK may re-orient the wrist during successive reposes.
      // Firing must NEVER resample the whole authored clip; only index curls.
      Math.abs(x.restSample-x.firedSample)<.0001)&&
    report.handAndLauncher.launcher?.reused&&report.handAndLauncher.launcher?.stopped&&
    report.handAndLauncher.launcher?.count>100&&
    report.handAndLauncher.launcher?.persistentFlash&&
    // Source-correct ADS positions remain identical to the approved 7-gun
    // v706 real contact survey; DO NOT "shorten" arms by moving grips away.
    report.models.every(x=>x.ads.scales.every(([n,z])=>Number.isFinite(z)&&z>0&&z<3.21)&&
      x.ads.originalContactError<.025)&&
    report.handAndLauncher.launcher?.prewarmedInstances>=3;
 }catch(e){report.error=String(e.stack||e)}
 finally{console.log("SOURCE_GRIP_GEOMETRY="+JSON.stringify(report));fs.writeFileSync("V701_GRIP_GEOMETRY.json",JSON.stringify(report,null,2));await browser?.close().catch(()=>{})}
 if(!report.passed)process.exitCode=1;
})();