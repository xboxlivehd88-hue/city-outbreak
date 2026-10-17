// v723 — measurable WORLD wrist/elbow travel from the user's ACTUAL
// animated_pistol.glb / allanimations / first 2.75s reload sequence.
// All coordinates are relative to the animated source PISTOL, with the source
// pistol's rotation removed. There are NO copied source pistol meshes, arms,
// textures, materials, cameras or scene objects in CITY OUTBREAK.
// Row layout: source clip time, LEFT WRIST delta XYZ, LEFT ELBOW delta XYZ.
// Local source unit => target viewmodel metres, applied only while M17 reloading.
// 15 frames (source key-timed) — interpolated at arbitrary game reload progress.
const SOURCE=[
 [0,0,0,0,0,0,0],
 [.2,-.01,.02,.03,-.46,8.03,-2.34],
 [.4,0,0,0,0,0,0],
 [.55,0,.06,.05,-4.91,1.04,-2.12],
 [.7,-.04,-3.03,-.97,-4.72,3.44,-4.53],
 [.85,.88,-12.91,-5.13,-2.27,-2.38,-8.65],
 [1.05,9.34,-26.7,-15.59,1.1,-8.98,-19.47],
 [1.3,3.63,-13.07,-8.21,-6.7,-9.52,-12.02],
 [1.5,.24,-8.15,-3.99,-9.3,-4.82,-7.69],
 [1.7,.16,-.27,-.7,-6.73,1.72,-3.65],
 [1.9,.16,-.26,-.7,-5.73,4.19,-4.14],
 [2.15,.11,-.19,-.49,-4.31,1.34,-2.73],
 [2.4,.06,-.1,-.27,-3.59,1.56,-2.33],
 [2.65,.01,-.03,-.06,-.61,2.11,-1.18],
 [2.75,0,0,0,0,0,0]
];
const WRIST_M_PER_SOURCE_UNIT=.022;
const ELBOW_M_PER_SOURCE_UNIT=.014;
export function getM17SourceReloadTravel(THREE,progress){
 const time=THREE.MathUtils.clamp(progress,0,1)*2.75;
 let i=1;
 while(i<SOURCE.length-1&&SOURCE[i][0]<time)i++;
 const a=SOURCE[i-1],b=SOURCE[i];
 const blend=THREE.MathUtils.smoothstep(
  THREE.MathUtils.clamp((time-a[0])/(b[0]-a[0]),0,1),0,1);
 const v=(offset,k)=>new THREE.Vector3(
  THREE.MathUtils.lerp(a[offset],b[offset],blend)*k,
  THREE.MathUtils.lerp(a[offset+1],b[offset+1],blend)*k,
  THREE.MathUtils.lerp(a[offset+2],b[offset+2],blend)*k);
 return {wrist:v(1,WRIST_M_PER_SOURCE_UNIT),
         elbow:v(4,ELBOW_M_PER_SOURCE_UNIT),
         sourceTime:time};
}
export const m17SourceReloadMotion=Object.freeze({
 clip:"allanimations",animationDuration:8.8,
 reloadSegmentStart:0,reloadSegmentEnd:2.75,
 sampledFrames:SOURCE.length,sourceGunMeshesImported:0
});
