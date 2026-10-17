// CITY OUTBREAK v730: ACTUAL user-uploaded animated_pistol.glb finger animation.
// Extracted from 101 source GLB channels, full 51-joint skeleton, clip
// 'allanimations' at 31 samples over genuine 0–2.75s magazine sequence.
// 40 authored finger-joint quaternion curves are retargeted by bone name,
// stored as signed one-degree axis-angle rotation vectors relative to t=0.
// NO source Beretta/pistol gun mesh, material, texture, slide, magazine, camera,
// source arm mesh or arm rig is imported. Only original cartoon_fps_arms.glb
// skinned hands and original SIG M17 weapon remain visible.
const BONES=["L_thumb_04","L_thumb_2_05","L_thumb_3_06","Joint_3_07","L_point_08","L_point_2_09","L_point_3_010","L_point_4_011","L_middle_012","L_middle_2_00","L_middle_3_013","L_middle_4_014","L_ring_015","L_ring_2_016","L_ring_3_017","L_ring_4_018","L_pink_019","L_pink_2_020","L_pink_3_021","L_pink_4_022","R_thumb_026","R_thumb_2_027","R_thumb_3_028","Joint_3_2_029","R_point_030","R_point_2_031","R_point_3_032","R_point_4_033","R_middle_034","R_middle_2_035","R_middle_3_036","R_middle_4_037","R_ring_038","R_ring_2_039","R_ring_3_040","R_ring_4_041","R_pink_042","R_pink_2_043","R_pink_3_044","R_pink_4_045"];
const FRAMES=31,STRIDE=BONES.length*3,BYTES=FRAMES*STRIDE;
const DEFLATE="eNrV1l1v0zAUBuDjY+fDSfq1bgMxEPySARv8fLgBccMFQmiIVZuWpcuaxImNaydpuaiUbijRcvVWrfPYcXN8AJ78lZBh3HscxhXkKewKAedx4+0qhcffJuRN93EIVaEeMWvtKuu+S8jL7iMpFLmsp6C2dkhB+0EqKJusQ7VBtYrYuO8TfL6P61DJTJwWm0eOuRJN/p3JyyZ/F+XdlouEUpDWPUvwsDNbhmQseGpydh3+ynBh8mXsXSi4NfnrjUqb339ON9m4jDXueYLT7m4EU8GX9gW8in5maJf2J/YvAGKTv2y5n+5lu15UgOg45sFr92OCo75ciq5rNt+6QX+u5/XuUgUMfQ/EAC7l/hCuQwMORe8u0W7wINcL4yiZTWyNvRotMpqbfBPzOyUzuX5HflzjCuoy/m3hFs1YpohLwxDy1o06uy7EGR7ZenWcz4PcObH3TKeRLJ8Va8S9dXVpsLXoYMX4tsuiiNTuhwTH/bmjEclad9KXO5ekdXWdnHV2WbF8sKvrBlQBb85f7c57cf9pcsx5dDSQezyEu9e5/19d8qJ7uyHSnMypyfNixgtm58xW40CWh9ZdOvofdGB7kpz5O1zdX510b+vKTJCxdcflyC2pvT/NA19Wk7I0c2DatWd6JNDd4ep+8lX3hrASFXDb6XPpswrDej6eo2RQreskLdZvjF2mXxG2233d3VW6W2SkrgNMt5S2DhNJdaPIlDJzW3/PmlqBO9zTvfrnga6/WPa9sQ==";
// True original user GLB L_wrist_03 quaternion DELTAS from the FIRST
// 2.75 seconds, sampled 31 times in source local space. This is the missing
// wrist articulation: previously fixed-game-wrist IK erased it completely.
// No gun objects, camera movement, right trigger-hand positions or meshes.
const LEFT_WRIST_SOURCE="AAAABP4ADPH/Av4AAAAA/P39+/j5/vP1BPH0B/HrAfDqAOjnBt/i9+/g8Pfg7vrg8vTh9e7j/Pb4/Pb4/Pb4//j6/vr7/vn7/vn7/fj8/vn8//r+Afv/AvwBAAAA";
// The uploaded clip has a 51-joint source hierarchy, including L_forearm_02.
// The game's earlier 47-joint arms have no matching forearm-twist bone.
// Preserve that authentic 0–2.75s forearm rotation as a calibrated wrist
// twist only while RELOADING; the native wrist POSITION stays at its gun goal.
const SOURCE_LEFT_FOREARM="AAAAAAAAAAD/AAAAAAAAAAD9AAD5AAD1AAD0AADrAADqAADnAADiAADgAADhAADhAADiAADkAAD5AAD5AAD5AAD6AAD7AAD7AAD8AAD8AAD9AAD+AAD/AAAAAAAA";
const LEFT_FOREARM_BYTES=Uint8Array.from(atob(SOURCE_LEFT_FOREARM),c=>c.charCodeAt(0));
if(LEFT_FOREARM_BYTES.length!==FRAMES*3)throw Error("Source pistol forearm samples wrong length");
const LEFT_WRIST_BYTES=Uint8Array.from(atob(LEFT_WRIST_SOURCE),c=>c.charCodeAt(0));
if(LEFT_WRIST_BYTES.length!==FRAMES*3)throw Error("Source pistol wrist animation has wrong length");
let data=null,error="",targetCache=new WeakMap();
const loading=(async()=>{
 try{
  if(typeof DecompressionStream!=="function")throw Error("Browser lacks DecompressionStream");
  const packedBytes=Uint8Array.from(atob(DEFLATE),c=>c.charCodeAt(0));
  const inflated=new Response(new Blob([packedBytes]).stream()
   .pipeThrough(new DecompressionStream("deflate")));
  const raw=new Uint8Array(await inflated.arrayBuffer());
  if(raw.length!==BYTES)throw Error("Decoded true source finger data length "+raw.length+" != "+BYTES);
  data=raw;
 }catch(e){
  error=String(e);console.warn("M17 source clip unavailable",e);
 }
})();
// One deterministic target-pose owner for all M17 fingers. Every pose begins
// from the original target GLB mixer sampled at its frozen .56s neutral hold.
// This function never resamples that mixer or modifies the gun or palm position.
export function applyM17AuthoredPistolFingerClip(THREE,rig,progress,reloading,triggerPulse=0){
 if(!data)return{ready:false,error,applied:0,maxDegrees:0,wristDegrees:0,forearmDegrees:0,triggerDegrees:0};
 if(!rig)return{ready:true,error:"",applied:0,maxDegrees:0,wristDegrees:0,forearmDegrees:0,triggerDegrees:0};
 let bones=targetCache.get(rig);
 if(!bones){bones=BONES.map(name=>rig.getObjectByName(name));targetCache.set(rig,bones)}
 const rotate=(name,axis,angle)=>{
  if(Math.abs(angle)<1e-7)return;
  const bone=rig.getObjectByName(name);
  if(bone)bone.rotateOnAxis(axis,angle);
 };
 const X=new THREE.Vector3(1,0,0),Y=new THREE.Vector3(0,1,0);
 const smooth=(a,b)=>THREE.MathUtils.smoothstep(progress,a,b);
 // Never pop the hand open on reload start or suddenly clench on finish:
 // blend out original source-rig gripping as the uploaded fingers animate,
 // then blend the same grip back as the source clip returns to time zero.
 const leftHold=reloading?THREE.MathUtils.clamp(1-smooth(.075,.32)+smooth(.77,.99),0,1):1;
 for(const name of ["L_point_08","L_middle_012","L_ring_015","L_pink_019"])
  rotate(name,X,-.48*leftHold);
 for(const name of ["L_point_2_09","L_middle_2_00","L_ring_2_016","L_pink_2_020"])
  rotate(name,X,-.64*leftHold);
 rotate("L_thumb_04",X,-.11*leftHold);
 rotate("L_thumb_04",Y,.15*leftHold);
 rotate("L_thumb_2_05",X,-.22*leftHold);
 // The SIG firing hand stays on the trigger throughout reloading.
 for(const name of ["R_middle_034","R_ring_038","R_pink_042"])
  rotate(name,X,-.036);
 for(const name of ["R_middle_2_035","R_ring_2_039","R_pink_2_043"])
  rotate(name,X,-.068);
 rotate("R_point_030",X,-.25);
 rotate("R_point_2_031",X,-.31);
 let triggerDegrees=0,applied=0,maxDegrees=0,wristDegrees=0,forearmDegrees=0;
 const signed=n=>n>127?n-256:n;
 const read=(bytes,f,index)=>signed(bytes[f*3+index]);
 const q=new THREE.Quaternion(),axis=new THREE.Vector3();
 if(!reloading){
  // One firing beat: use the uploader's source-index articulation, NOT
  // another recoil-based hand/wrist transform. Both index joints respond.
  const pulse=THREE.MathUtils.clamp(triggerPulse,0,1);
  if(pulse>0){
   for(const [name,weight] of [["R_point_030",.72],["R_point_2_031",1]]){
    const idx=BONES.indexOf(name),f=6;
    const dx=signed(data[f*STRIDE+idx*3]),dy=signed(data[f*STRIDE+idx*3+1]),dz=signed(data[f*STRIDE+idx*3+2]);
    const magnitude=Math.hypot(dx,dy,dz);
    const degrees=Math.min(27,Math.max(14,magnitude*.43))*weight*pulse;
    const bone=bones[idx];
    if(!bone)continue;
    // Original source axes are clip-local; preserve the calibrated natural
    // trigger-flex axis of target bone (local X), with authored amplitude.
    bone.rotateX(-THREE.MathUtils.degToRad(degrees));
    triggerDegrees=Math.max(triggerDegrees,degrees);applied++;
   }
  }
  return{ready:true,error:"",applied,maxDegrees:triggerDegrees,
   wristDegrees,forearmDegrees,triggerDegrees};
 }
 const srcFrame=THREE.MathUtils.clamp(progress,0,1)*(FRAMES-1);
 const f=Math.min(FRAMES-2,Math.floor(srcFrame)),blend=srcFrame-f;
 const readInterp=(bytes,i)=>THREE.MathUtils.lerp(read(bytes,f,i),read(bytes,f+1,i),blend);
 // Wrist orientation is authored, while native IK owns its actual contact
 // position. No source gun mesh or alternate arm skeleton is attached.
 const wrist=rig.getObjectByName("L_wrist_03");
 if(wrist){
  const x=readInterp(LEFT_WRIST_BYTES,0),y=readInterp(LEFT_WRIST_BYTES,1),z=readInterp(LEFT_WRIST_BYTES,2);
  const magnitude=Math.hypot(x,y,z);
  if(magnitude>.01){
   wristDegrees=magnitude*.76;
   axis.set(x,y,z).normalize();
   wrist.quaternion.multiply(q.setFromAxisAngle(axis,THREE.MathUtils.degToRad(wristDegrees))).normalize();
  }
  // 51-joint source has forearm twist absent in the 47-joint target. Transfer
  // only twist rotation to the wrist; never scale or rotate the whole arm.
  const fx=readInterp(LEFT_FOREARM_BYTES,0),fy=readInterp(LEFT_FOREARM_BYTES,1),fz=readInterp(LEFT_FOREARM_BYTES,2);
  const magnitudeFore=Math.hypot(fx,fy,fz);
  if(magnitudeFore>.01){
   forearmDegrees=Math.min(32,magnitudeFore)*.58;
   axis.set(fx,fy,fz).normalize();
   wrist.quaternion.multiply(q.setFromAxisAngle(axis,THREE.MathUtils.degToRad(forearmDegrees))).normalize();
  }
 }
 // The uploaded left-hand magazine sequence owns the entire support
 // finger chain. Do not simultaneously animate the right shooting hand.
 for(let i=0;i<20;i++){
  const bone=bones[i];if(!bone)continue;
  const at=(f,j)=>signed(data[f*STRIDE+i*3+j]);
  const dx=THREE.MathUtils.lerp(at(f,0),at(f+1,0),blend);
  const dy=THREE.MathUtils.lerp(at(f,1),at(f+1,1),blend);
  const dz=THREE.MathUtils.lerp(at(f,2),at(f+1,2),blend);
  const deg=Math.hypot(dx,dy,dz);
  if(deg<.01)continue;
  const weight=.92;
  axis.set(dx,dy,dz).normalize();
  bone.quaternion.multiply(q.setFromAxisAngle(axis,THREE.MathUtils.degToRad(deg*weight))).normalize();
  applied++;maxDegrees=Math.max(maxDegrees,deg*weight);
 }
 return{ready:true,error:"",applied,maxDegrees,wristDegrees,forearmDegrees,triggerDegrees:0};
}
export const m17ActualSourceInfo=Object.freeze({
 file:"animated_pistol.glb",sourceClip:"allanimations",sourceDuration:8.8,
 sourceChannels:101,samples:31,retargetedBones:40,retargetedWristBones:1,
 copiedWeaponMeshes:0,copiedArmMeshes:0
});
