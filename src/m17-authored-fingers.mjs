// CITY OUTBREAK v725: ACTUAL user-uploaded animated_pistol.glb finger animation.
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
export function applyM17AuthoredPistolFingerClip(THREE,rig,progress,reloading){
 if(!data)return {ready:false,error,applied:0,maxDegrees:0};
 if(!rig||!reloading)return{ready:true,error:"",applied:0,maxDegrees:0};
 let bones=targetCache.get(rig);
 if(!bones){bones=BONES.map(name=>rig.getObjectByName(name));targetCache.set(rig,bones);}
 const srcFrame=THREE.MathUtils.clamp(progress,0,1)*(FRAMES-1);
 const f=Math.min(FRAMES-2,Math.floor(srcFrame));
 const blend=srcFrame-f;
 const axis=new THREE.Vector3(),q=new THREE.Quaternion();
 let applied=0,maxDegrees=0;
 for(let i=0;i<BONES.length;i++){
  const bone=bones[i];if(!bone)continue;
  const at=(frame,component)=>{
   const n=data[frame*STRIDE+i*3+component];
   return n>127?n-256:n;
  };
  const dx=THREE.MathUtils.lerp(at(f,0),at(f+1,0),blend);
  const dy=THREE.MathUtils.lerp(at(f,1),at(f+1,1),blend);
  const dz=THREE.MathUtils.lerp(at(f,2),at(f+1,2),blend);
  const deg=Math.hypot(dx,dy,dz);
  if(deg<.01)continue;
  // Left hand reaches for the real SIG magazine; use the full source
  // 3-joint finger articulation. Right hand stays on the pistol trigger:
  // its 70-degree scripted source-index bend is restrained during reload.
  const weight=i<20?.92:i>=24&&i<=27?.12:.32;
  const angle=THREE.MathUtils.degToRad(deg*weight);
  axis.set(dx,dy,dz).normalize();
  q.setFromAxisAngle(axis,angle);
  bone.quaternion.multiply(q).normalize();
  applied++;
  maxDegrees=Math.max(maxDegrees,deg*weight);
 }
 return{ready:true,error:"",applied,maxDegrees};
}
export const m17ActualSourceInfo=Object.freeze({
 file:"animated_pistol.glb",sourceClip:"allanimations",sourceDuration:8.8,
 sourceChannels:101,samples:31,retargetedBones:40,
 copiedWeaponMeshes:0,copiedArmMeshes:0
});
