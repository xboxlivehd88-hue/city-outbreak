// CITY OUTBREAK v719 — only 13 bone-rotation tracks sampled from user-uploaded
// animated_pistol.glb (allanimations, 8.8s, 101 channels, 51-joint source).
// This is NOT the source pistol model: no Beretta, meshes, textures, gun
// transforms, magazines, or non-arm source geometry are imported.
// 15 authored keyframes from the first magazine-hand cycle (0–2.75s).
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
export function applyPistolSourceMotion(THREE,rig,{reloading=false,progress=0}={}){
 // Runs after the existing original 47-bone IK, restoring finger quaternions
 // upstream each frame. No additive accumulation, no weapon/optic movement.
 let bones=CACHE.get(rig);
 if(!bones){bones=TARGET_BONES.map(n=>rig.getObjectByName(n));CACHE.set(rig,bones);}
 const t=reloading?THREE.MathUtils.clamp(progress,0,1)*2.75:.95;
 let hi=1;
 while(hi<TIMES.length-1&&t>TIMES[hi])hi++;
 const lo=hi-1;
 const blend=THREE.MathUtils.clamp((t-TIMES[lo])/(TIMES[hi]-TIMES[lo]),0,1);
 const data=getKeys(),euler=new THREE.Euler(),delta=new THREE.Quaternion(),weighted=new THREE.Quaternion();
 for(let i=0;i<bones.length;i++){
  const bone=bones[i];if(!bone)continue;
  // Left wrist twists only slightly on magazine reload; its POSITION and the
  // elbow/arm IK never change. Right wrist is completely untouched.
  if(i===0&&!reloading)continue;
  // Right index is STILL exclusively controlled by the original trigger
  // animation during firing; use sampled source rotations only while reloading.
  if(i>=11&&!reloading)continue;
  const weight=i===0?.17:i>=11?.22:(reloading?.48:.17);
  const off=i*3;
  const x=THREE.MathUtils.lerp(signed(data[lo*FRAME_STRIDE+off]),signed(data[hi*FRAME_STRIDE+off]),blend);
  const y=THREE.MathUtils.lerp(signed(data[lo*FRAME_STRIDE+off+1]),signed(data[hi*FRAME_STRIDE+off+1]),blend);
  const z=THREE.MathUtils.lerp(signed(data[lo*FRAME_STRIDE+off+2]),signed(data[hi*FRAME_STRIDE+off+2]),blend);
  euler.set(THREE.MathUtils.degToRad(x),THREE.MathUtils.degToRad(y),THREE.MathUtils.degToRad(z),"XYZ");
  delta.setFromEuler(euler);
  weighted.identity().slerp(delta,weight);
  bone.quaternion.multiply(weighted).normalize();
 }
}
export const pistolSourceMotionInfo=Object.freeze({
 source:"animated_pistol.glb",clip:"allanimations",sourceDuration:8.8,
 sourceBones:51,sourceChannels:101,retargetedJoints:13,
 sourceGunGeometryImported:false
});
