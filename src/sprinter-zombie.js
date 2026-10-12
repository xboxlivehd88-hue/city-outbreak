// CITY OUTBREAK v611 — genuine animated Sprinter GLBs, 50/50. Keep gameplay on z.g.
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

const FILES=[
 "assets/animated_zombie_cop_running_loop.glb?v=612",
 "assets/zombie_running_on_metel_maniac.glb?v=612"
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
 function sync(z,dt){
  if(!z?.sprinterVisual)return;
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
 function freeze(z){if(z?.sprinterMixer)z.sprinterMixer.timeScale=0}
 function release(z){
  if(z?.sprinterMixer)try{z.sprinterMixer.stopAllAction()}catch(_){}
  if(z){
   z.sprinterMixer=null;z.sprinterRunAction=null;z.sprinterVisual=null;
   z.sprinterModel=null;z.sprinterBones=null;z.sprinterHitboxes=null;
  }
 }
 return{load,attach,sync,freeze,release,suppressDetached,status};
}
