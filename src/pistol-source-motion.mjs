// CITY OUTBREAK v720 — 21 genuine hand-joint rotation tracks sampled from user-uploaded
// animated_pistol.glb (allanimations, 8.8s, 101 channels, 51-joint source).
// This is NOT the source pistol model: no Beretta, meshes, textures, gun
// transforms, magazines, or non-arm source geometry are imported.
// 15 sampled keyframes from the first magazine-hand cycle (0–2.75s).
// Values: signed int8 degrees of source joint rotation relative to frame zero,
// in XYZ order, 13 joints × 3 rotations × 15 frames = 585 signed bytes.
// Original 47-bone cartoon_fps_arms.glb and approved M17 are retained.
const TIMES=[0,.2,.4,.55,.7,.85,1.05,1.3,1.5,1.7,1.9,2.15,2.4,2.65,2.75];
const TARGET_BONES=[
 "L_wrist_03","L_thumb_04","L_thumb_2_05","L_point_08","L_point_2_09",
 "L_middle_012","L_middle_2_00","L_ring_015","L_ring_2_016",
 "L_pink_019","L_pink_2_020","R_point_030","R_point_2_031"
];
const KEYS="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACvP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9wL/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+/f5AAIA/fr/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+wcIQfT6A/L0AAMABAH+DfoEAAAAAfz/CQAA7/oA3QAA4Pz/6QAA+wcIQ/T6CfPp/AwAEPkI8+0O4fkE5vIL5QAA0vEF9QAAzfcD9AAA+wcIRfT6Cebj/AwAEPkI8+0O4fkE5vIL5QAA0vEF9QAAzfcD9AAA+wcIRvT68vTh/AwAEPkI8+0O4fkE5vIL5QAA0vEF9QAAzfcD9AAA+wcIRvT6+O7jAQz5EPMN8+0O4fkE5vIL5QAA0vEF9QAAzfcD9AAA+wcIRvT6/Pb5BgDw+QMVFfYRCvkEA/UPDP77BfEF/gAAEvcDCQAA+wcIRfT6AfT2BPvz+QMVFfYRCvkEA/UPDP77BfEF/gAAEvcDCQAA+wcIRPT6/vn7BPvz+QMVFfYRCvkEA/UPDP77BfEF/gAAEvcDCQAA+wcIQvT6/vn9A/v1+gISEfgPCPoDA/cNCv78BfME/wAAD/kCCAAA+wcIQfT6AvwAAf/9/gAEBf8EAv8BAf4DAgD/Av0BAAAABP8BAgAA+wcIP/T6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

// Additional sampled SOURCE joints absent from v719: true third knuckle,
// fingertips and thumb articulation on the same original 47-bone target.
// Signed XYZ Euler deltas sampled from the uploaded 8.8s GLB's 0–2.75s
// magazine segment at exactly the TIMES above. No source geometry present.
const ADDITIONAL_BONES=[
 "L_thumb_3_06","L_point_3_010","L_middle_3_013","L_ring_3_017",
 "R_thumb_2_027","R_thumb_3_028","R_point_3_032","R_thumb_026"
];
const EXTRA_KEYS="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAQD/HAAAAAAAAwAAAAAAAAAAAAAAAQEDAwD+FgAAAQAA8wAA6QAA8AAAAAAAAgEEBAD9DwAAAQAA8wAA6QAA8AAAAAAAAwIGBgD8CgAAAv8A8wAA6QAA8AAAAAAABAIJCAH7CgAAA/8A/QAA6QAA8AAAAAAABgMLCgH6CwAAA/8BBAAAGwAAGPv4FAAABwMNDAH5DwAABP8BBAAAGwAAGPv4FAAA//wQDgAAEgAABP8ABAAAGwAAGPv4FAAAAAAAAAAAFwAAAAAAAwAAFwAAFPz6EQAAAAAAAAAAHAAAAAAAAQAABgAABf/+BAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const SOURCE_ELBOWS=[
 [0,0,0,0,0,0],[-.8,.8,-3.6,.5,.1,-3.9],[0,0,0,0,0,0],
 [-.7,4.2,-2.1,-1.2,-.6,-1.2],[1,2,.7,-1.1,-1.3,1.5],
 [4.9,-2.1,-.6,-1.2,-1.3,3.2],[12.2,-5.5,-11.9,-1.9,-1.8,3.3],
 [7.9,-3.2,-5.6,-2.7,-3.2,4],[4.1,2.3,-2.3,-2.9,-3.6,4.9],
 [.3,5.7,-.8,-3.3,-4.5,3.5],[.7,4.7,3,-3.7,-5.4,7.1],
 [.1,4.3,-1.2,-3.2,-5.2,3.3],[-.1,3.9,.8,-2.8,-4.3,4.3],
 [-.3,.6,-.3,-.6,-1.7,.4],[0,0,0,0,0,0]
];
let extraDecoded=null;
const getExtra=()=>{
 if(!extraDecoded){
  extraDecoded=Uint8Array.from(atob(EXTRA_KEYS),ch=>ch.charCodeAt(0));
  if(extraDecoded.length!==TIMES.length*ADDITIONAL_BONES.length*3)
   throw Error("Invalid M17 source third-finger-joint key data (expected 360 bytes)");
 }
 return extraDecoded;
};
function frame(time){
 const t=Math.max(0,Math.min(2.75,time));
 let hi=1;
 while(hi<TIMES.length-1&&t>TIMES[hi])hi++;
 const lo=hi-1;
 return {lo,hi,blend:Math.max(0,Math.min(1,(t-TIMES[lo])/(TIMES[hi]-TIMES[lo])))};
}
export function getPistolReloadElbowOffset(THREE,side,p){
 const {lo,hi,blend}=frame(Math.max(0,Math.min(1,p))*2.75);
 const j=side==="left"?0:3;
 const a=SOURCE_ELBOWS[lo],b=SOURCE_ELBOWS[hi],k=.009;
 // Retarget genuine source elbow trajectory without changing real wrist/gun
 // contact. The source has two additional forearm bones our rig lacks.
 return new THREE.Vector3(
  THREE.MathUtils.lerp(a[j],b[j],blend)*k,
  THREE.MathUtils.lerp(a[j+1],b[j+1],blend)*k,
  THREE.MathUtils.lerp(a[j+2],b[j+2],blend)*k
 );
}

const FRAME_STRIDE=TARGET_BONES.length*3;
const CACHE=new WeakMap();
let decoded=null;
const getKeys=()=>{
 if(!decoded){
  decoded=Uint8Array.from(atob(KEYS),ch=>ch.charCodeAt(0));
  if(decoded.length!==TIMES.length*FRAME_STRIDE)throw Error("M17 source finger keys corrupted");
 }
 return decoded;
};
const signed=v=>v>127?v-256:v;
export function applyPistolSourceMotion(THREE,rig,{reloading=false,progress=0,triggerPulse=0}={}){
 // Run AFTER original IK + authored finger mixer. No retained rotations:
 // v704 per-frame reset ensures this can never spin the original finger bones.
 let bones=CACHE.get(rig);
 if(!bones){
  bones=[...TARGET_BONES,...ADDITIONAL_BONES].map(n=>rig.getObjectByName(n));
  CACHE.set(rig,bones);
 }
 const source=getKeys(),extra=getExtra();
 // v719 used a mid-reload pose while holding the gun, barely visible at 17%.
 // Hold normal M17 with existing original hand grip; sample source only on
 // a genuine reload or at the real index-finger firing pulse.
 const {lo,hi,blend}=frame(reloading?Math.max(0,Math.min(1,progress))*2.75:0);
 const euler=new THREE.Euler(),delta=new THREE.Quaternion(),weighted=new THREE.Quaternion();
 if(reloading)for(let i=0;i<bones.length;i++){
  const bone=bones[i];if(!bone)continue;
  const sourceArray=i<TARGET_BONES.length?source:extra;
  const j=i<TARGET_BONES.length?i:i-TARGET_BONES.length;
  const stride=(i<TARGET_BONES.length?TARGET_BONES.length:ADDITIONAL_BONES.length)*3;
  const at=(f,a)=>signed(sourceArray[f*stride+j*3+a]);
  const x=THREE.MathUtils.lerp(at(lo,0),at(hi,0),blend);
  const y=THREE.MathUtils.lerp(at(lo,1),at(hi,1),blend);
  const z=THREE.MathUtils.lerp(at(lo,2),at(hi,2),blend);
  // The uploaded animation's left hand reaches to the magazine; it can
  // articulate strongly because this hand has released the foregrip.
  // The right firing-hand grip remains restrained, without wrist rotation.
  const weight=i===0?.42:
   (i<11||i>=13&&i<15||i>=TARGET_BONES.length&&i<TARGET_BONES.length+4)?.74:
   i===11?.05:i===12?.24:.22;
  euler.set(THREE.MathUtils.degToRad(x),
   THREE.MathUtils.degToRad(y),THREE.MathUtils.degToRad(z),"XYZ");
  delta.setFromEuler(euler);
  weighted.identity().slerp(delta,weight);
  bone.quaternion.multiply(weighted).normalize();
 }
 // SOURCE right-index middle phalanx flexes ~70 degrees in the original
 // clip. Map that to the ORIGINAL target's known inward trigger bend axis,
 // limited to ~22 degrees, on an actual shot, WITHOUT wrist recoil motion.
 if(!reloading&&triggerPulse>0&&bones[12]){
  const deg=Math.abs(signed(source[6*FRAME_STRIDE+12*3])); // t=1.05
  const sourceBend=Math.min(.39,THREE.MathUtils.degToRad(deg)*.32);
  bones[12].rotateX(-sourceBend*Math.max(0,Math.min(1,triggerPulse)));
 }
}
export const pistolSourceMotionInfo=Object.freeze({
 source:"animated_pistol.glb",clip:"allanimations",sourceDuration:8.8,
 sourceBones:51,sourceChannels:101,retargetedJoints:21,
 sourceGunGeometryImported:false,sourceElbowMotion:true
});
