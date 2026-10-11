// CITY OUTBREAK v599: original uploaded 53-bone animated Hazmat GLB, ONLY for Acidic zombies.
// Keeps original helmet, suit, face, textures, animation, root game AI/physics and red mist.
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
export function createHazmatZombieController(){
  let source=null,loadingError=null,attached=0,attachDebug=null;
  const url="assets/zombie_hazmat.glb?v=600";
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
  function attach(z){
    if(!source||!z||z.dead||z.kind!=="acidic"||z.hazmatVisual)return false;
    const model=SkeletonUtils.clone(source.scene);model.name="OriginalHazmatZombieGLB";
    let skinned=0;
    model.traverse(o=>{
      if(!o.isMesh)return;
      if(o.isSkinnedMesh)skinned++;
      o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;
      o.userData.visualOnly=true;o.raycast=()=>{};
    });
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
    z.hazmatSourceHeight=height;
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
    const x=z.g.position.x,y=z.g.position.z;
    const distance=Math.hypot(x-(z.hazmatLastX??x),y-(z.hazmatLastZ??y));
    z.hazmatLastX=x;z.hazmatLastZ=y;
    const speed=distance/Math.max(.008,dt);
    const desired=(z.attackAnim||0)>.035?"Zombie_Skill":speed>.12?"Zombie_Walk_Root":"Zombie_Idle";
    const next=z.hazmatActions[desired];
    if(next&&next!==z.hazmatAction){
      z.hazmatAction?.fadeOut(.14);
      next.reset().fadeIn(.14).play();
      z.hazmatAction=next;z.hazmatActionName=desired;
    }
    z.hazmatActions.Zombie_Walk_Root.timeScale=THREE.MathUtils.clamp(speed/1.15,.45,1.65);
    z.hazmatActions.Zombie_Skill.timeScale=source.clips.get("Zombie_Skill").duration/.60;
    z.hazmatMixer.update(Math.max(0,dt));
  }
  function release(z){
    if(z?.hazmatMixer)try{z.hazmatMixer.stopAllAction()}catch(_){}
    if(z){
      z.hazmatMixer=null;z.hazmatActions=null;z.hazmatAction=null;
      z.hazmatVisual=null;z.hazmatModel=null;
    }
  }
  return {load,attach,sync,release,
    status:()=>({loaded:!!source,error:String(loadingError||""),clips:[...(source?.clips.keys()||[])],attached,attachDebug})};
}
