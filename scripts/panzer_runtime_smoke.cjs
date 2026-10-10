const fs=require('fs');
const {spawn}=require('child_process');
const {chromium}=require('playwright');
const marker='   console.log("CITY OUTBREAK v580: both ORIGINAL Panzer legs now driven",{';
const source=fs.readFileSync('src/game.js','utf8');
if(source.split(marker).length!==2)throw Error('Missing unique v580 probe insertion point');
const patch=String.raw\`
   // Ephemeral CI diagnostic, never committed to the actual game.
   if(new URLSearchParams(location.search).has("panzerProbe")){
     const rightKnee=z.panzerNativeLegBones.R_LowerLeg?.bone;
     let sampledMesh=null,sampledVertices=[];
     model.traverse(mesh=>{
       if(sampledMesh||!mesh.isSkinnedMesh||!rightKnee)return;
       const boneIndex=mesh.skeleton.bones.indexOf(rightKnee);
       if(boneIndex<0)return;
       const skinI=mesh.geometry.getAttribute("skinIndex");
       const skinW=mesh.geometry.getAttribute("skinWeight");
       const good=[];
       for(let i=0;i<skinI.count;i++){
         for(let k=0;k<4;k++){
           if(skinI.getComponent(i,k)===boneIndex&&skinW.getComponent(i,k)>.65){
             good.push(i);break;
           }
         }
       }
       if(good.length>40){
         sampledMesh=mesh;
         sampledVertices=good.filter((_,i)=>i%Math.max(1,Math.floor(good.length/30))===0).slice(0,30);
       }
     });
     const q=b=>b?.quaternion.toArray()||null;
     window.__panzerRigProbe=()=>{
       model.updateWorldMatrix(true,true);
       if(sampledMesh)sampledMesh.skeleton.update();
       const samples=[];
       if(sampledMesh)for(const i of sampledVertices)
         samples.push(sampledMesh.getVertexPosition(i,new THREE.Vector3()).toArray());
       return {
         mode:z.panzerBossAutoRig?"fallback":"native",
         phase:z.panzerWalkPhase||0,
         rightHipName:z.panzerNativeLegBones.R_UpperLeg?.bone.name||null,
         rightKneeName:rightKnee?.name||null,
         rightHipQuaternion:q(z.panzerNativeLegBones.R_UpperLeg?.bone),
         rightKneeQuaternion:q(rightKnee),
         leftKneeQuaternion:q(z.panzerNativeLegBones.L_LowerLeg?.bone),
         skinVertices:samples
       };
     };
     window.__panzerForceStep=()=>{
       z.g.position.x+=.09;
       syncPanzerBossWalk(z,1/60,true);
       return window.__panzerRigProbe();
     };
   }
\`;
fs.writeFileSync('src/game.js',source.replace(marker,patch+marker));
const server=spawn('python3',['-m','http.server','4173'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try{
   await sleep(1200);
   browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
   const page=await browser.newPage({viewport:{width:1280,height:720}});
   const errs=[];
   page.on('pageerror',e=>errs.push(String(e)));
   page.on('console',msg=>{const text=msg.text();if(/Panzer|error|Error/.test(text))console.log('BROWSER',text.slice(0,800))});
   await page.goto('http://127.0.0.1:4173/?panzerProbe=1&v=580',{waitUntil:'domcontentloaded'});
   await page.locator('#start').click({timeout:20000});
   await page.waitForFunction(()=>typeof window.__panzerForceStep==='function',null,{timeout:90000});
   const shots=[];
   for(let i=0;i<110;i++){
     const shot=await page.evaluate(()=>window.__panzerForceStep());
     shots.push(shot);
   }
   const first=shots[0];
   const qDelta=(a,b)=>Math.hypot(...a.map((v,k)=>v-b[k]));
   const rightHipMotion=Math.max(...shots.map(s=>qDelta(first.rightHipQuaternion,s.rightHipQuaternion)));
   const rightKneeMotion=Math.max(...shots.map(s=>qDelta(first.rightKneeQuaternion,s.rightKneeQuaternion)));
   const leftKneeMotion=Math.max(...shots.map(s=>qDelta(first.leftKneeQuaternion,s.leftKneeQuaternion)));
   const vertexMotion=Math.max(...shots.flatMap(s=>s.skinVertices.map((v,i)=>Math.hypot(...v.map((a,k)=>a-first.skinVertices[i][k])))));
   const report={
     mode:first.mode,hip:first.rightHipName,knee:first.rightKneeName,
     rightHipMotion,rightKneeMotion,leftKneeMotion,vertexMotion,
     sampleCount:first.skinVertices.length,
     phaseDelta:shots.at(-1).phase-first.phase,
     pageErrors:errs
   };
   console.log('PANZER_RUNTIME_RESULT',JSON.stringify(report,null,2));
   if(first.mode!=='native')throw Error('Native Panzer was not selected: '+JSON.stringify(report));
   if(!/j_hip_ri_08/.test(first.rightHipName||'')||!/j_knee_ri_09/.test(first.rightKneeName||''))throw Error('Real GLB right-leg bones not bound');
   if(rightHipMotion<.10||rightKneeMotion<.10||leftKneeMotion<.10)throw Error('Both-leg rotations did not occur');
   if(first.skinVertices.length<5||vertexMotion<.012)throw Error('VISIBLE right-leg geometry did not deform');
   console.log('PASS: original Panzer RIGHT knee and thigh animate AND skinned right-leg vertices move.');
 }finally{
   if(browser)await browser.close();
   server.kill('SIGTERM');
 }
})().catch(e=>{console.error('PANZER CI FAILURE:',e.stack||e);process.exitCode=1;server.kill('SIGTERM')});
