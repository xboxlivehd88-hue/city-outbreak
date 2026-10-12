// CITY OUTBREAK v611 — genuine animated Sprinter GLBs, 50/50. Keep gameplay on z.g.
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

const FILES=[
 "assets/animated_zombie_cop_running_loop.glb?v=627",
 "assets/zombie_running_on_metel_maniac.glb?v=627"
];
const ANATOMY={
 Hips:"hips",Spine:"spine",Chest:"spine2",Neck:"neck",Head:"head",
 L_UpperArm:"leftarm",L_LowerArm:"leftforearm",L_Hand:"lefthand",
 R_UpperArm:"rightarm",R_LowerArm:"rightforearm",R_Hand:"righthand",
 L_UpperLeg:"leftupleg",L_LowerLeg:"leftleg",L_Foot:"leftfoot",
 R_UpperLeg:"rightupleg",R_LowerLeg:"rightleg",R_Foot:"rightfoot"
};
function cleanBoneName(name){
 return (name||"").toLowerCase()
   .replace(/^mixamorig[:_]?/,"").replace(/_[0-9]+$/,"");
}
function namedBones(root){
 const lookup=new Map(),result=new Map();
 root.traverse(o=>{if(o.isBone)lookup.set(cleanBoneName(o.name),o)});
 for(const [key,label] of Object.entries(ANATOMY)){
  const b=lookup.get(label);if(b)result.set(key,b);
 }
 return result;
}
export function createSprinterZombieController(){
 const assets=[null,null],errors=[null,null];
 const loadedCounts=[0,0],tempWorld=new THREE.Vector3();
 function status(){
  return {loaded:assets.map(a=>!!a),errors:errors.map(e=>String(e||"")),
   files:FILES,clips:assets.map(a=>a?.originalClipName||null),
   durations:assets.map(a=>a?.run?.duration||null),attached:loadedCounts.slice()};
 }
 function load(onLoaded){
  FILES.forEach((url,index)=>{
   new GLTFLoader().load(url,async gltf=>{
    try{
     const best=(gltf.animations||[]).find(a=>a.tracks.length>=16&&a.duration>.3);
     if(!best)throw Error("Missing a real multi-joint running animation");
     const meshes=[];gltf.scene.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o)});
     if(!meshes.length)throw Error("The original skin is missing");
     const bones=namedBones(gltf.scene);
     if(bones.size<16)throw Error("Required original Sprinter skeleton joints missing: "+bones.size);
     // Sketchfab sometimes stores colors in legacy specular/gloss PBR.
     // Load those original diffuse PNGs rather than replacing the user's GLB materials.
     const specs=gltf.parser?.json?.materials||[];
     const legacy=specs.map((m,i)=>({
      index:i,name:m.name,
      texture:m.extensions?.KHR_materials_pbrSpecularGlossiness?.diffuseTexture?.index
     })).filter(x=>Number.isInteger(x.texture));
     if(legacy.length){
      const textures=await Promise.all(legacy.map(x=>gltf.parser.getDependency("texture",x.texture)));
      legacy.forEach((spec,i)=>{
       const tex=textures[i];if(!tex)return;
       tex.colorSpace=THREE.SRGBColorSpace;tex.needsUpdate=true;
       gltf.scene.traverse(o=>{
        if(!o.isMesh)return;
        const materials=Array.isArray(o.material)?o.material:[o.material];
        for(const m of materials)if(m?.name===spec.name&&!m.map){
         m.map=tex;m.needsUpdate=true;
        }
       });
      });
     }
     const run=best.clone();
     // The game AI already applies horizontal root movement. Keep only the
     // source clip's vertical bob and every authentic arm/knee/foot frame.
     for(const track of run.tracks){
      if(!track.name.endsWith(".position")||!/hips|rootjoint/i.test(track.name))continue;
      const firstX=track.values[0],firstZ=track.values[2];
      for(let i=0;i<track.values.length;i+=3){
       track.values[i]=firstX;track.values[i+2]=firstZ;
      }
     }
     assets[index]={scene:gltf.scene,run,originalClipName:best.name,skinned:meshes.length,
       originalBones:bones.size};
     errors[index]=null;onLoaded?.(index);
    }catch(e){errors[index]=e;console.error("CITY OUTBREAK: Sprinter model validation failed",FILES[index],e)}
   },undefined,e=>{errors[index]=e;console.error("CITY OUTBREAK: Sprinter GLB failed",url,e)});
  });
 }
 function syncHitboxes(z){
  const hits=z?.sprinterHitboxes,bones=z?.sprinterBones;
  if(!hits?.length||!bones)return;
  z.g.updateWorldMatrix(true,false);
  for(const h of hits){
   const b=bones.get(h.userData.sprinterBone);
   if(!b)continue;
   b.getWorldPosition(tempWorld);
   z.g.worldToLocal(tempWorld);
   h.position.copy(tempWorld);
  }
 }
 function attach(z,index){
  if(!z||z.kind!=="sprinter"||z.dead||z.sprinterVisual)return false;
  const variant=Math.abs(index|0)%2,asset=assets[variant];
  if(!asset)return false;
  const model=SkeletonUtils.clone(asset.scene);
  const bones=namedBones(model);
  if(bones.size<16)return false;
  model.name=variant===0?"OriginalAnimatedSprinterCop":"OriginalAnimatedSprinterManiac";
  model.traverse(o=>{
   if(!o.isMesh)return;
   o.castShadow=false;o.receiveShadow=false;
   o.frustumCulled=false;o.userData.visualOnly=true;o.raycast=()=>{};
  });
  const mixer=new THREE.AnimationMixer(model);
  const action=mixer.clipAction(asset.run);
  action.setLoop(THREE.LoopRepeat,Infinity);
  action.reset().play();mixer.update(.09);
  model.updateWorldMatrix(true,true);
  // Evaluate the POSED imported mesh, not its unanimated bind-pose transform.
  const box=new THREE.Box3().setFromObject(model,true),size=new THREE.Vector3();
  box.getSize(size);
  // Cop's first skinned frame can report a tiny bind-pose Box3 (~.015m)
  // despite its original GLB later rendering at normal human scale.
  // Match the Hazmat workaround: keep natural native scale, never magnify 100x.
  const staleCopBounds=variant===0&&Number.isFinite(size.y)&&size.y<.05;
  if(!staleCopBounds&&(!Number.isFinite(size.y)||size.y<.05||size.y>2000)){
   console.warn("Sprinter source bounds invalid",variant,size.toArray());
   return false;
  }
  const center=box.getCenter(new THREE.Vector3());
  const holder=new THREE.Group();holder.name="SprinterOriginalAnimatedGLB";
  holder.rotation.y=Math.PI;
  holder.scale.setScalar(staleCopBounds?1.0:THREE.MathUtils.clamp(1.88/size.y,.007,12));
  model.position.set(-center.x,-box.min.y,-center.z);
  holder.add(model);
  // Remove ONLY the old procedural visuals; its physics/AI state lives on z.g.
  z.g.traverse(o=>{if(o.isMesh){
   o.visible=false;o.castShadow=false;o.receiveShadow=false;o.raycast=()=>{};
  }});
  z.g.add(holder);
  if(staleCopBounds){
   // v615: per-Cop skinned bind offsets vary. Never reuse an untested
   // holder scale or model offset for a DIFFERENT Cop in the same wave.
   const prior=asset.calibration;
   if(prior)holder.scale.setScalar(prior.scale);
   const poseBounds=new THREE.Box3(),cycle=new THREE.Box3(),frameCount=prior?7:16;
   const scan=()=>{
    cycle.makeEmpty();
    for(let k=0;k<frameCount;k++){
     mixer.setTime(.04+(k+.5)*asset.run.duration/frameCount);
     holder.updateWorldMatrix(true,true);
     poseBounds.setFromObject(holder,true);
     if(!poseBounds.isEmpty())cycle.union(poseBounds);
    }
    mixer.setTime(.09);
    return cycle.clone();
   };
   let bounds=scan(),h0=bounds.max.y-bounds.min.y;
   let exponent=prior?.exponent||1;
   if(!prior){
    const initialScale=holder.scale.x;
    holder.scale.setScalar(initialScale*2);
    const doubled=scan(),h1=doubled.max.y-doubled.min.y;
    const p=Math.log(h1/Math.max(h0,.001))/Math.LN2;
    exponent=Number.isFinite(p)?THREE.MathUtils.clamp(p,.65,2.6):1;
    holder.scale.setScalar(initialScale);
   }
   const rootScale=new THREE.Vector3();z.g.getWorldScale(rootScale);
   const goal=1.80*Math.max(.01,Math.abs(rootScale.y));
   for(let i=0;i<3;i++){
    const h=bounds.max.y-bounds.min.y;
    if(!Number.isFinite(h)||h<.001)break;
    holder.scale.multiplyScalar(THREE.MathUtils.clamp(Math.pow(goal/h,1/exponent),.001,150));
    bounds=scan();
    if(Math.abs(bounds.max.y-bounds.min.y-goal)<.035)break;
   }
   // Center THIS actor's original skinned animation relative to its own
   // current rotated root and align lowest sampled sole to the ground.
   const bottom=new THREE.Vector3(
    (bounds.min.x+bounds.max.x)*.5,bounds.min.y,
    (bounds.min.z+bounds.max.z)*.5);
   z.g.updateWorldMatrix(true,false);
   const local=z.g.worldToLocal(bottom);
   holder.position.x-=local.x;holder.position.z-=local.z;
   holder.position.y+=.025-local.y;
   mixer.setTime(.09);
   z.sprinterCopCycleHeight=bounds.max.y-bounds.min.y;
   z.sprinterScaleExponent=exponent;z.sprinterInitialHeight=h0;
   // v619: full LIVE browser gait was ~16–18 units despite the spawn
   // calibration reading ~1.9. Apply the independent corrective factor
   // to the actual skinned visual only; all gameplay scales stay unchanged.
   // Refit from measured live gait in subsequent tested increments.
   holder.scale.multiplyScalar(.115);
   z.sprinterSizeChecks=0;
   if(!prior)asset.calibration={scale:holder.scale.x/.115,exponent};
  }
  z.sprinterVisual=holder;z.sprinterModel=model;z.sprinterBones=bones;
  z.sprinterMixer=mixer;z.sprinterRunAction=action;
  z.sprinterModelIndex=variant;z.sprinterSourceHeight=size.y;
  z.sprinterStaleCopBounds=staleCopBounds;
  z.sprinterLastX=z.g.position.x;z.sprinterLastZ=z.g.position.z;

  // Invisible anatomical shooting volumes driven from original animated joints.
  // Retain original damage types and headshot/limb rules rather than raycast
  // against the artwork or a single all-body collision cylinder.
  const mat=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,depthTest:false});
  const specs=[
   ["Head","head",.36,.39,.34,true],
   ["Chest","torso",.57,.58,.39,false],
   ["Hips","torso",.48,.36,.38,false],
   ["L_UpperArm","leftArm",.24,.36,.25,false],
   ["L_LowerArm","leftArm",.20,.34,.22,false],
   ["R_UpperArm","rightArm",.24,.36,.25,false],
   ["R_LowerArm","rightArm",.20,.34,.22,false],
   ["L_UpperLeg","leftLeg",.26,.45,.27,false],
   ["L_LowerLeg","leftLeg",.20,.39,.23,false],
   ["R_UpperLeg","rightLeg",.26,.45,.27,false],
   ["R_LowerLeg","rightLeg",.20,.39,.23,false]
  ];
  const hits=[];
  for(const [key,part,w,h,d,isHead] of specs){
   if(!bones.has(key))continue;
   const geo=new THREE.BoxGeometry(w,h,d),hit=new THREE.Mesh(geo,mat);
   hit.name="SprinterHit_"+part+"_"+key;
   hit.userData.zombie=z;hit.userData.part=part;hit.userData.sprinterBone=key;
   if(isHead)hit.userData.isHead=true;
   hit.castShadow=false;hit.receiveShadow=false;
   z.g.add(hit);hits.push(hit);
   z.ownedGeometries?.push(geo);
  }
  z.ownedMaterials?.push(mat);
  z.sprinterHitboxes=hits;z.hitMeshes=hits;
  syncHitboxes(z);
  loadedCounts[variant]++;
  return true;
 }
 const liveBounds=new THREE.Box3(),liveCycleBounds=new THREE.Box3(),liveRootScale=new THREE.Vector3();
 function stabilizeCop(z){
  if(z.sprinterModelIndex!==0||z.dead||z.knockdown)return;
  const tick=++z.sprinterSizeChecks;
  if(![1,2,3,4,5,6,8,12,18,30,60,120].includes(tick))return;
  const holder=z.sprinterVisual;
  const bounds=new THREE.Box3();
  holder.updateWorldMatrix(true,true);
  bounds.setFromObject(holder,true);
  const actualHeight=bounds.max.y-bounds.min.y;
  if(!Number.isFinite(actualHeight)||actualHeight<.001)return;
  z.g.getWorldScale(liveRootScale);
  const target=1.90*Math.abs(liveRootScale.y);
  // v620: measure the ACTUAL current living skin, not the inaccurate
  // reset-and-replay bind-pose fit which kept allowing 10-18m police zombies.
  // The original Cop's live scaled geometry has confirmed exponent ~2.
  if(actualHeight>target*1.07||actualHeight<target*.93){
   const correction=THREE.MathUtils.clamp(Math.sqrt(target/actualHeight),.12,5);
   holder.scale.multiplyScalar(correction);
   holder.updateWorldMatrix(true,true);
   bounds.setFromObject(holder,true);
   const foot=new THREE.Vector3((bounds.min.x+bounds.max.x)*.5,
     bounds.min.y,(bounds.min.z+bounds.max.z)*.5);
   z.g.updateWorldMatrix(true,false);
   z.g.worldToLocal(foot);
   holder.position.x-=foot.x;
   holder.position.z-=foot.z;
   holder.position.y+=.025-foot.y;
   z.sprinterLiveCorrectionCount=(z.sprinterLiveCorrectionCount||0)+1;
  }
  z.sprinterLastMeasuredHeight=bounds.max.y-bounds.min.y;
 }
 function sync(z,dt){
  if(!z?.sprinterVisual)return;
  // v621: a legless converted crawler must not restart Run and overwrite its
  // planted hands/crawl posture (original mixer stays frozen for its skin).
  if(z.kind==="crawler"){syncCrawler(z,dt);return;}
  if(!z.dead&&!z.knockdown&&z.sprinterMixer){
   if(z.sprinterMixer.timeScale===0)z.sprinterMixer.timeScale=1;
   const gx=z.g.position.x,gz=z.g.position.z;
   const speed=Math.hypot(gx-(z.sprinterLastX??gx),gz-(z.sprinterLastZ??gz))/Math.max(.008,dt);
   z.sprinterLastX=gx;z.sprinterLastZ=gz;
   // Keep the actual animation's recorded running cadence. Over-speeding
   // the source clip made Hazmat knees/arms look like a cartoon.
   z.sprinterRunAction.timeScale=THREE.MathUtils.clamp(speed/2.0,.20,1.40);
   z.sprinterMixer.update(Math.max(0,dt));
   suppressDetached(z);
   stabilizeCop(z);
  }
  syncHitboxes(z);
 }
 function suppressDetached(z){
  if(!z?.sprinterBones)return;
  for(const [flag,key] of [
   ["leftArmDetached","L_UpperArm"],["rightArmDetached","R_UpperArm"],
   ["leftLegDetached","L_UpperLeg"],["rightLegDetached","R_UpperLeg"]
  ])if(z[flag])z.sprinterBones.get(key)?.scale.setScalar(.00001);
 }
 // v624: A Mixamo skin blends adjacent leg/hip/torso vertices. Scaling a thigh
 // bone to 0.00001 to "amputate" it pulls weighted pelvis and shirt polygons
 // into a point, making translucent-looking holes and flying torn triangles.
 // For a LEGLESS CRAWLER ONLY, remove triangles that belong to the original
 // leg skin weights, and restore the skeleton's native scale. Keep the exact
 // original textured GLB upper body, original arms, original skinned pose.
 function preserveLeglessCrawlerSkin(source,crawler){
  const model=source?.sprinterModel,bones=source?.sprinterBones;
  if(!model||!bones?.size||!crawler)return false;
  const legs=new Set(["leftupleg","leftleg","leftfoot","lefttoebase",
    "rightupleg","rightleg","rightfoot","righttoebase"]);
  let originalTris=0,keptTris=0,removedTris=0,changedMeshes=0;
  const outputs=[];
  model.traverse(mesh=>{
   if(!mesh.isSkinnedMesh||!mesh.geometry)return;
   const original=mesh.geometry,ids=original.getAttribute("skinIndex"),
     weights=original.getAttribute("skinWeight"),pos=original.getAttribute("position");
   if(!ids||!weights||!pos)return;
   const skeleton=mesh.skeleton,legIndices=new Set();
   for(let i=0;i<skeleton.bones.length;i++)
    if(legs.has(cleanBoneName(skeleton.bones[i].name)))legIndices.add(i);
   if(legIndices.size<4)return;
   const influence=new Float32Array(pos.count);
   for(let i=0;i<pos.count;i++){
    let value=0;
    for(let j=0;j<4;j++)if(legIndices.has(ids.getComponent(i,j)))
     value+=weights.getComponent(i,j);
    influence[i]=value;
   }
   const indices=original.index,read=i=>indices?indices.getX(i):i;
   const count=indices?indices.count:pos.count,keep=[];
   let cut=0;
   for(let i=0;i+2<count;i+=3){
    const a=read(i),b=read(i+1),c=read(i+2);
    const wa=influence[a],wb=influence[b],wc=influence[c];
    const mostlyLeg=(wa>.55?1:0)+(wb>.55?1:0)+(wc>.55?1:0);
    // Mixed seam triangles stay with the original torso; remove only clear
    // leg-only faces. This avoids holes in hip and shoulder skin.
    if(mostlyLeg>=2||(wa+wb+wc)/3>.72){cut++;continue}
    keep.push(a,b,c);
   }
   const total=Math.floor(count/3);
   if(cut<8||keep.length<30)return;
   // Preserve GLB mesh, materials, joints, UVs and normals. Copy just its
   // index list; the source geometry is shared with standing Sprinters.
   const clipped=original.clone();
   clipped.clearGroups();
   clipped.setIndex(keep);
   mesh.geometry=clipped;
   mesh.visible=true;
   if(!crawler.ownedGeometries)crawler.ownedGeometries=[];
   crawler.ownedGeometries.push(clipped);
   changedMeshes++;originalTris+=total;removedTris+=cut;keptTris+=keep.length/3;
   outputs.push({mesh:mesh.name,removed:cut,original:total});
  });
  if(!changedMeshes)return false;
  // Restore only the previously collapsed real thigh transforms AFTER the
  // original leg triangles are gone. Other GLB bones and colors untouched.
  for(const key of ["L_UpperLeg","R_UpperLeg"]){
   const bone=bones.get(key);if(bone){bone.scale.set(1,1,1);bone.updateMatrixWorld(true)}
  }
  crawler.sprinterCrawlerSkinAudit={changedMeshes,originalTris,
   removedTris,keptTris,meshes:outputs,nativeThighScale:true};
  return true;
 }

 // v625: a converted legless Sprinter needs ACTUAL crawl joint keys. Twisting
 // randomly frozen RUN frames with hand-made arm quaternions was visibly
 // broken despite numerical ground tests. Retarget the existing real Mixamo
 // Crawl animation to the ORIGINAL Cop/Maniac skinned GLB instead. Never
 // change a standing sprinter's successful Run clip, size or amputations.
 const crawlClipCache=new Map(),crawlerBounds=new THREE.Box3();
 function beginCrawler(z,crawlerAsset){
  if(!z?.sprinterVisual||!z.sprinterModel||!z.sprinterMixer||!crawlerAsset?.scene)return false;
  if(z.sprinterCrawlerAction)return true;
  const sourceClip=crawlerAsset.clips?.get("Crawl");
  if(!sourceClip||!sourceClip.tracks?.length)return false;
  const srcBones=new Map(),dstBones=new Map();
  crawlerAsset.scene.traverse(o=>{if(o.isBone)srcBones.set(cleanBoneName(o.name),o)});
  // Preserve the original imported skeleton and native skin inverse binds.
  const restored=new Set();
  z.sprinterModel.traverse(o=>{
   if(o.isSkinnedMesh&&!restored.has(o.skeleton)){
    o.skeleton.pose();restored.add(o.skeleton);
   }
   if(o.isBone)dstBones.set(cleanBoneName(o.name),o);
  });
  const index=z.sprinterModelIndex;
  let clip=crawlClipCache.get(index),mapped=0;
  if(!clip){
   const tracks=[];
   const sourceQuat=new THREE.Quaternion(),sourceInv=new THREE.Quaternion(),
    destQuat=new THREE.Quaternion(),frame=new THREE.Quaternion(),out=new THREE.Quaternion();
   for(const t of sourceClip.tracks){
    if(!t.name.endsWith(".quaternion")||t.values.length<4)continue;
    const clean=cleanBoneName(t.name.slice(0,-11).split("/").pop());
    const src=srcBones.get(clean),dst=dstBones.get(clean);
    if(!src||!dst)continue;
    sourceQuat.copy(src.quaternion).normalize();
    sourceInv.copy(sourceQuat).invert();
    destQuat.copy(dst.quaternion).normalize();
    const values=new Float32Array(t.values.length);
    for(let k=0;k<t.values.length;k+=4){
     frame.fromArray(t.values,k).normalize();
     out.copy(destQuat).multiply(sourceInv).multiply(frame).normalize();
     out.toArray(values,k);
    }
    tracks.push(new THREE.QuaternionKeyframeTrack(dst.name+".quaternion",t.times,values));
   }
   if(tracks.length<13){
    console.warn("Sprinter crawler native Crawl retarget incomplete",tracks.length);
    return false;
   }
   clip=new THREE.AnimationClip("NativeOriginalSprinterCrawl_"+index,sourceClip.duration,tracks);
   crawlClipCache.set(index,clip);
  }
  mapped=clip.tracks.length;
  z.sprinterMixer.stopAllAction();
  z.sprinterMixer.timeScale=1;
  const action=z.sprinterMixer.clipAction(clip);
  action.setLoop(THREE.LoopRepeat,Infinity);
  action.reset().play();
  z.sprinterMixer.setTime(.12);
  z.sprinterCrawlerAction=action;
  z.sprinterCrawlerRetargetTracks=mapped;
  const holder=z.sprinterVisual,bones=z.sprinterBones;
  z.g.updateWorldMatrix(true,true);
  const hips=bones.get("Hips"),chest=bones.get("Chest");
  if(hips&&chest){
   const a=hips.getWorldPosition(new THREE.Vector3()),b=chest.getWorldPosition(new THREE.Vector3());
   z.g.worldToLocal(a);z.g.worldToLocal(b);
   const spine=b.sub(a);
   if(spine.lengthSq()>.00001){
    const target=new THREE.Vector3(0,.16,-1).normalize();
    holder.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(spine.normalize(),target));
   }
  }
  // Separate torso orientation from positional grounding. Never rotate each
  // arm independently or collapse a Mixamo hip joint to imitate a crawler.
  const measure=()=>{
   holder.updateWorldMatrix(true,true);
   crawlerBounds.setFromObject(holder,true);
   return crawlerBounds.max.y-crawlerBounds.min.y;
  };
  const originalTime=z.sprinterMixer.time;
  const sample=()=>{
   let height=0;
   for(let j=0;j<10;j++){
    z.sprinterMixer.setTime((j+.5)*clip.duration/10);
    height=Math.max(height,measure());
   }
   z.sprinterMixer.setTime(originalTime);
   return height;
  };
  let h=sample();
  if(Number.isFinite(h)&&h>.08){
   const rootScale=new THREE.Vector3();z.g.getWorldScale(rootScale);
   const target=1.03*Math.abs(rootScale.y);
   const startScale=holder.scale.x;
   holder.scale.multiplyScalar(.84);
   const probe=sample();
   let exponent=Math.log(probe/h)/Math.log(.84);
   exponent=Number.isFinite(exponent)?THREE.MathUtils.clamp(exponent,.65,2.6):1;
   holder.scale.setScalar(startScale);
   for(let i=0;i<3;i++){
    h=sample();
    if(!Number.isFinite(h)||h<.01||Math.abs(h-target)<.035)break;
    holder.scale.multiplyScalar(THREE.MathUtils.clamp(Math.pow(target/h,1/exponent),.25,3));
   }
  }
  const ground=()=>{
   const height=measure(),box=crawlerBounds;
   if(!Number.isFinite(height)||box.isEmpty())return;
   const floor=z.g.position.y+.035;
   const oldY=holder.position.y,oldMin=box.min.y;
   holder.position.y+=.1;
   const newMin=(measure(),crawlerBounds.min.y);
   holder.position.y=oldY;
   const slope=(newMin-oldMin)/.1;
   const gain=Math.abs(slope)>.15&&Math.abs(slope)<8?slope:Math.max(.2,z.g.scale.y);
   holder.position.y+=THREE.MathUtils.clamp((floor-oldMin)/gain,-3,3);
  };
  ground();
  const hip=hips?.getWorldPosition(new THREE.Vector3());
  if(hip){
   z.g.worldToLocal(hip);
   holder.position.x-=hip.x;
   holder.position.z-=hip.z;
  }
  ground();
  z.sprinterCrawlerBasePos=holder.position.clone();
  z.sprinterCrawlerBaseQuat=holder.quaternion.clone();
  z.sprinterCrawlerHeight=measure();
  return true;
 }
 // Aim a bent, outside-the-ribcage forearm down to the pavement.
 // Do not scale/translate joints or overwrite the torso's real Crawl clip.
 const supportDir=new THREE.Vector3(),parentWorld=new THREE.Quaternion();
 const upDir=new THREE.Vector3(),elbowDir=new THREE.Vector3();
 function aimSprinterCrawlerSupport(z,bones,side,phase){
  const prefix=side<0?"L":"R";
  const arm=bones.get(prefix+"_UpperArm"),
   lower=bones.get(prefix+"_LowerArm"),hand=bones.get(prefix+"_Hand");
  if(!arm||!lower||!hand)return;
  const orient=(bone,child,dir)=>{
   if(!bone.parent||child.position.lengthSq()<.000001)return;
   bone.parent.getWorldQuaternion(parentWorld);
   supportDir.copy(dir).applyQuaternion(parentWorld.invert()).normalize();
   bone.quaternion.setFromUnitVectors(upDir.copy(child.position).normalize(),supportDir);
  };
  // Slight alternating reach without crossing the centerline.
  const walk=Math.sin(phase)*.085;
  elbowDir.set(side*.64,-.56,-.72+walk).normalize();
  orient(arm,lower,elbowDir);
  arm.updateWorldMatrix(true,true);
  // Hands should land ahead of the elbows, not bend backwards into ribs.
  elbowDir.set(side*.40,-.38,-.87-walk).normalize();
  orient(lower,hand,elbowDir);
 }
 function syncCrawler(z,dt){
  if(!z?.sprinterCrawlerAction||!z.sprinterMixer||z.dead||z.knockdown)return;
  z.sprinterMixer.update(Math.max(0,dt)*.82);
  // v626: the source crawler's local arm axes do not match the Cop/Maniac
  // Mixamo bind axes. Retargeting those arm rotations directly folds the
  // wrists through the chest. Pose their ORIGINAL bone chains toward the
  // forward ground-support direction in WORLD space after mixer updates.
  // Preserve the source crawl cycle on hips, spine and neck and all skins.
  const cb=z.sprinterBones;
  if(cb?.size){
   const phase=(z.phase||0)+(z.sprinterMixer.time||0)*5;
   aimSprinterCrawlerSupport(z,cb,-1,phase);
   aimSprinterCrawlerSupport(z,cb,1,phase+Math.PI);
   const neck=cb.get("Neck"),head=cb.get("Head");
   if(neck)neck.rotateX(-.16);
   if(head)head.rotateX(-.12);
  }
  // The actual Crawl animation owns shoulders/elbows/hands. Keep ground
  // clearance without costly all-vertex bounds checks on every frame.
  z.sprinterCrawlerTick=(z.sprinterCrawlerTick||0)+1;
  if(z.sprinterCrawlerTick<=12||z.sprinterCrawlerTick%36===0){
   const holder=z.sprinterVisual;
   holder.updateWorldMatrix(true,true);
   crawlerBounds.setFromObject(holder,true);
   const floor=z.g.position.y+.035,error=floor-crawlerBounds.min.y;
   if(Number.isFinite(error)&&Math.abs(error)>.035){
    // The Cop GLB moves its skinned vertices nonlinearly: measure an
    // actual holder translation, not just divide by the zombie root scale.
    const base=holder.position.y,minY=crawlerBounds.min.y;
    holder.position.y=base+.10;
    holder.updateWorldMatrix(true,true);
    crawlerBounds.setFromObject(holder,true);
    const slope=(crawlerBounds.min.y-minY)/.10;
    holder.position.y=base;
    const gain=Number.isFinite(slope)&&Math.abs(slope)>.12&&Math.abs(slope)<8?
      slope:Math.max(.2,z.g.scale.y);
    holder.position.y+=THREE.MathUtils.clamp(error/gain,-.38,.38);
   }
  }
 }
 function freeze(z){if(z?.sprinterMixer)z.sprinterMixer.timeScale=0}
 function release(z){
  if(z?.sprinterMixer)try{z.sprinterMixer.stopAllAction()}catch(_){}
  if(z){
   z.sprinterMixer=null;z.sprinterRunAction=null;z.sprinterVisual=null;
   z.sprinterModel=null;z.sprinterBones=null;z.sprinterHitboxes=null;
  }
 }
 return{load,attach,sync,beginCrawler,freeze,release,suppressDetached,preserveLeglessCrawlerSkin,status};
}
