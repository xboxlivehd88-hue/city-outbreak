// v740 — runtime retarget of the uploaded original pistol ANIMATION (not its weapon mesh).
// The loaded GLB stays off-scene; only named finger-bone local rotation deltas
// are mapped from its 51-bone skeleton onto the existing 47-bone textured arms.
export function createM17SourceGrip(THREE, GLTFLoader) {
 let ready=false, error="", source=null, bind=new Map(), joints=[], clipName="";
 new GLTFLoader().load("assets/animated_pistol.glb?v=740", gltf=>{
  source=gltf.scene;
  source.traverse(o=>{if(o.isBone && /^[LR]_(thumb|point|middle|ring|pink)_/.test(o.name)){
   bind.set(o.name,o.quaternion.clone());joints.push(o);
  }});
  const clip=gltf.animations.find(x=>x.name==="allanimations")||gltf.animations[0];
  if(!clip||joints.length<20){error="Source finger bones or animation not found";return;}
  clipName=clip.name;
  const mixer=new THREE.AnimationMixer(source);
  mixer.clipAction(clip).play();
  mixer.setTime(0);
  ready=true;
 },undefined,e=>{error=String(e);});
 const temp=new THREE.Quaternion();
 return {
  apply(target){
   if(!ready)return false;
   for(const bone of joints){
    const to=target.getObjectByName(bone.name);
    if(!to)continue;
    // Preserve target mesh bind basis while transferring source clip's pose.
    temp.copy(bind.get(bone.name)).invert().multiply(bone.quaternion);
    to.quaternion.multiply(temp).normalize();
   }
   return true;
  },
  get ready(){return ready;},
  get error(){return error;},
  get clipName(){return clipName;},
  get boneCount(){return joints.length;}
 };
}
