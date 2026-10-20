// v753 — Use actual original GLB names, discovered by Playwright asset audit.
// Original finger nodes: R_middle1_..., R_middle2_... (no extra underscore).
// Target cartoon FPS arms: R_middle_034, R_middle_2_035, etc.
// Retarget ONLY right gripping fingers and thumb. Never touch the index,
// left hand, wrists, pistol model, ADS, or authored reload.
export function createM17SourceGrip(THREE, GLTFLoader) {
 let ready=false, error="", source=null, joints=[], clipName="", maxSourceDeltaDegrees=0;
 const targetNames={
  thumb:["R_thumb_026","R_thumb_2_027","R_thumb_3_028"],
  middle:["R_middle_034","R_middle_2_035","R_middle_3_036","R_middle_4_037"],
  ring:["R_ring_038","R_ring_2_039","R_ring_3_040","R_ring_4_041"],
  pink:["R_pink_042","R_pink_2_043","R_pink_3_044","R_pink_4_045"]
 };
 const temp=new THREE.Quaternion();
 new GLTFLoader().load("assets/animated_pistol.glb?v=753",gltf=>{
  source=gltf.scene;
  source.traverse(bone=>{
   if(!bone.isBone)return;
   const m=/^R_(thumb|middle|ring|pink)([1-4])_\d+$/.exec(bone.name);
   if(!m)return;
   const targetName=targetNames[m[1]][Number(m[2])-1];
   if(targetName)joints.push({bone,targetName,bind:bone.quaternion.clone()});
  });
  const clip=gltf.animations.find(x=>x.name==="allanimations")||gltf.animations[0];
  if(!clip||joints.length<12){
   error=`Original pistol grip nodes not mapped: clip=${clip?.name||"none"}, count=${joints.length}`;
   return;
  }
  clipName=clip.name;
  const mixer=new THREE.AnimationMixer(source);
  mixer.clipAction(clip).play();
  mixer.setTime(0);
  for(const {bone,bind} of joints){
   temp.copy(bind).invert().multiply(bone.quaternion).normalize();
   maxSourceDeltaDegrees=Math.max(maxSourceDeltaDegrees,
    THREE.MathUtils.radToDeg(2*Math.acos(Math.min(1,Math.abs(temp.w)))));
  }
  ready=true;
 },undefined,e=>{error=String(e);});
 return {
  apply(target){
   if(!ready)return false;
   let applied=0;
   for(const {bone,targetName,bind} of joints){
    const to=target.getObjectByName(targetName);
    if(!to)continue;
    temp.copy(bind).invert().multiply(bone.quaternion).normalize();
    to.quaternion.multiply(temp).normalize();
    applied++;
   }
   return applied>0;
  },
  get ready(){return ready;},
  get error(){return error;},
  get clipName(){return clipName;},
  get boneCount(){return joints.length;},
  get maxSourceDeltaDegrees(){return maxSourceDeltaDegrees;}
 };
}
