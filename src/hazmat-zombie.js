// CITY OUTBREAK v599: original uploaded 53-bone animated Hazmat GLB, ONLY for Acidic zombies.
// Keeps original helmet, suit, face, textures, animation, root game AI/physics and red mist.
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
export function createHazmatZombieController(){
  let source=null,loadingError=null,attached=0,attachDebug=null;
  const url="assets/zombie_hazmat.glb?v=601";
  const clipsRequired=["Zombie_Idle","Zombie_Walk_Root","Zombie_Skill"];
  function load(onReady){
    new GLTFLoader().load(url,gltf=>{
      const clips=new Map((gltf.animations||[]).map(c=>[c.name,c]));
      if(!clipsRequired.every(k=>clips.has(k))){
        loadingError=new Error("Missing original Hazmat animation clips");
        document.documentElement.dataset.hazmatAsset="failed";
        console.error("Hazmat animation source invalid",loadingError);
        return;
      }
      // Strip just horizontal HIP/root displacement from the real recorded walk.
      // Physical navigation already moves zombies in X/Z, so this prevents skating.
      const walk=clips.get("Zombie_Walk_Root").clone();
      for(const t of walk.tracks){
        if(!t.name.endsWith(".position")||!/(rootjoint|mixamorig[:_]?hips)/i.test(t.name))continue;
        const x=t.values[0],z=t.values[2];
        for(let i=0;i<t.values.length;i+=3){t.values[i]=x;t.values[i+2]=z}
      }
      clips.set("Zombie_Walk_Root",walk);
      source={scene:gltf.scene,clips};
      document.documentElement.dataset.hazmatAsset="loaded";
      document.documentElement.dataset.hazmatClips=[...clips.keys()].join(",");
      console.log("CITY OUTBREAK v600: original native Hazmat GLB loaded", [...clips.keys()]);
      onReady?.();
    },undefined,e=>{
      loadingError=e;document.documentElement.dataset.hazmatAsset="failed";
      console.error("CITY OUTBREAK: Hazmat GLB could not load",e);
    });
  }
  // Map the ORIGINAL 53 weighted Hazmat Mixamo bones into the already
  // approved game ragdoll's anatomical names; no procedural rig replaces it.
  const boneNames={
   Hips:"hips",Spine:"spine",Chest:"spine2",Neck:"neck",Head:"head",
   L_UpperArm:"leftarm",L_LowerArm:"leftforearm",L_Hand:"lefthand",
   R_UpperArm:"rightarm",R_LowerArm:"rightforearm",R_Hand:"righthand",
   L_UpperLeg:"leftupleg",L_LowerLeg:"leftleg",L_Foot:"leftfoot",
   R_UpperLeg:"rightupleg",R_LowerLeg:"rightleg",R_Foot:"rightfoot"
  };
  function nativeBones(model){
   const found=new Map(),mapped=new Map();
   model.traverse(o=>{if(o.isBone)found.set(o.name.replace(/_[0-9]+$/,"")
     .replace(/^mixamorig:?/i,"").toLowerCase(),o)});
   for(const [key,name] of Object.entries(boneNames)){
     const bone=found.get(name);if(bone)mapped.set(key,bone);
   }
   return mapped;
  }
  function suppressDetached(z){
   if(!z?.hazmatBones)return;
   for(const [flag,name] of [
    ["leftLegDetached","L_UpperLeg"],["rightLegDetached","R_UpperLeg"],
    ["leftArmDetached","L_UpperArm"],["rightArmDetached","R_UpperArm"]]){
    if(z[flag])z.hazmatBones.get(name)?.scale.setScalar(.00001);
   }
  }
  function freeze(z){if(z?.hazmatMixer)z.hazmatMixer.timeScale=0}
  function crawl(z){
   if(!z?.hazmatVisual||z.dead)return false;
   // KEEP the same textured/skinned Hazmat zombie and red mist; don't
   // create the game's generic crawler or discard this Mixamo skeleton.
   z.kind="crawler";z.nightmareType="crawler";z.hazmatCrawler=true;
   z.speed*=.82;z.legDamage=0;
   z.hazmatCrawlY=-.52;
   if(z.hitMeshes)for(const h of z.hitMeshes)h.raycast=()=>{};
   const mat=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false});
   const hits=[];
   const add=(name,w,h,d,x,y,part,isHead=false)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    m.name=name;m.position.set(x,y,.32);m.userData.zombie=z;m.userData.part=part;
    if(isHead)m.userData.isHead=true;
    m.castShadow=false;m.receiveShadow=false;z.g.add(m);hits.push(m);
    z.ownedGeometries?.push(m.geometry);
   };
   add("HazmatCrawlerChest",.76,.48,.76,0,.46,"torso");
   add("HazmatCrawlerHead",.37,.37,.39,0,.78,"head",true);
   add("HazmatCrawlerLeftArm",.26,.28,.60,-.32,.33,"leftArm");
   add("HazmatCrawlerRightArm",.26,.28,.60,.32,.33,"rightArm");
   z.ownedMaterials?.push(mat);z.hitMeshes=hits;
   suppressDetached(z);
   return true;
  }
  function attach(z){
    if(!source||!z||z.dead||z.kind!=="acidic"||z.hazmatVisual)return false;
    const model=SkeletonUtils.clone(source.scene);model.name="OriginalHazmatZombieGLB";
    let skinned=0;
    model.traverse(o=>{
      if(!o.isMesh)return;
      if(o.isSkinnedMesh)skinned++;
      o.castShadow=false;o.receiveShadow=false;o.frustumCulled=false;
      o.userData.visualOnly=true;o.raycast=()=>{};
    });
    const bones=nativeBones(model);
    if(bones.size<16){attachDebug={failure:"Hazmat native bones missing",bones:bones.size};return false;}
    if(skinned<2){attachDebug={failure:"Original skin not found",skinned};console.warn("HAZMAT ATTACH ISSUE",attachDebug);return false;}
    const mixer=new THREE.AnimationMixer(model),actions={};
    for(const [name,clip] of source.clips){
      const a=mixer.clipAction(clip);
      a.setLoop(name==="Zombie_Idle"||name==="Zombie_Walk_Root"?THREE.LoopRepeat:THREE.LoopOnce,Infinity);
      if(name==="Zombie_Skill"||name==="Zombie_EnemySpotted")a.clampWhenFinished=true;
      actions[name]=a;
    }
    const idle=actions.Zombie_Idle;
    idle.reset().play();mixer.update(.025);model.updateWorldMatrix(true,true);
    const bounds=new THREE.Box3().setFromObject(model,true);
    const height=bounds.max.y-bounds.min.y;
    attachDebug={skinned,height,min:bounds.min.toArray(),max:bounds.max.toArray()};
    console.log("HAZMAT ORIGINAL BOUNDS",attachDebug);
    if(!Number.isFinite(height)||height<.000001){mixer.stopAllAction();return false}
    // Import-sized (not guessed) standing figure, same ~1.92m scale as walkers.
    const holder=new THREE.Group();holder.name="HazmatZombieVisual";
    // v600: GLTFLoader's first-frame Mixamo bind matrix reports 0.015m
    // but the real animated mesh measures 1.73m at holder scale 1.
    // Never magnify by 126x based on that stale startup bound.
    holder.scale.setScalar(1.10);
    holder.rotation.y=Math.PI;
    model.position.set(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,
      -(bounds.min.z+bounds.max.z)/2);
    holder.add(model);z.g.add(holder);
    z.hazmatVisual=holder;z.hazmatModel=model;z.hazmatMixer=mixer;
    z.hazmatActions=actions;z.hazmatAction=idle;z.hazmatActionName="Zombie_Idle";
    z.hazmatSourceHeight=height;z.hazmatBones=bones;
    z.hazmatLastX=z.g.position.x;z.hazmatLastZ=z.g.position.z;
    // Hide old rig and legacy clothes. Retain original hidden gameplay collider,
    // old ragdoll physics, and ONLY the existing red contamination mist.
    if(z.rigVisual)z.rigVisual.traverse(o=>{if(o.isMesh)o.visible=false});
    else z.g.traverse(o=>{if(o.isMesh&&o!==z.hazardMist&&!o.userData.visualOnly)o.visible=false});
    if(z.hazardMist)z.hazardMist.visible=true;
    document.documentElement.dataset.hazmatAttached=String(++attached);
    console.log("CITY OUTBREAK v600: native Hazmat visual attached",
      {originalHeight:height,scale:holder.scale.x,skinned});
    return true;
  }
  function sync(z,dt){
    if(!z?.hazmatMixer||z.dead)return;
    if(z.knockdown?.bodyPbd?.holder===z.hazmatVisual)return;
    if(z.hazmatMixer.timeScale===0)z.hazmatMixer.timeScale=1;
    const x=z.g.position.x,y=z.g.position.z;
    const distance=Math.hypot(x-(z.hazmatLastX??x),y-(z.hazmatLastZ??y));
    z.hazmatLastX=x;z.hazmatLastZ=y;
    const speed=distance/Math.max(.008,dt);
    const desired=(z.attackAnim||0)>.035?"Zombie_Skill":speed>.08?"Zombie_Walk_Root":"Zombie_Idle";
    const next=z.hazmatActions[desired];
    if(next&&next!==z.hazmatAction){
      z.hazmatAction?.fadeOut(.14);
      next.reset().fadeIn(.14).play();
      z.hazmatAction=next;z.hazmatActionName=desired;
    }
    // 2.625s native walk was only played at 1x while the zombie ran multiple
    // meters: drive the REAL recorded stride cadence with ground displacement.
    z.hazmatActions.Zombie_Walk_Root.timeScale=
     THREE.MathUtils.clamp(speed*source.clips.get("Zombie_Walk_Root").duration/
       (z.hazmatCrawler?.86:1.12),.6,5.6);
    z.hazmatActions.Zombie_Skill.timeScale=source.clips.get("Zombie_Skill").duration/.60;
    z.hazmatMixer.update(Math.max(0,dt));
    // The real native clip contains scale tracks: reapply amputations
    // after the mixer so a leg never reappears at a later keyframe.
    suppressDetached(z);
    if(z.hazmatCrawler){
     z.hazmatVisual.position.y=z.hazmatCrawlY;
     z.hazmatVisual.rotation.x=.70;
     z.hazmatVisual.rotation.y=Math.PI;
    }
  }
  function release(z){
    if(z?.hazmatMixer)try{z.hazmatMixer.stopAllAction()}catch(_){}
    if(z){
      z.hazmatMixer=null;z.hazmatActions=null;z.hazmatAction=null;
      z.hazmatVisual=null;z.hazmatModel=null;z.hazmatBones=null;
    }
  }
  return {load,attach,sync,release,freeze,crawl,suppressDetached,
    status:()=>({loaded:!!source,error:String(loadingError||""),clips:[...(source?.clips.keys()||[])],attached,attachDebug})};
}
