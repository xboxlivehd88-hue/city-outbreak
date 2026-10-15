// CITY OUTBREAK v672: one draw call for fire and one for smoke,
// even when High graphics requests ~160 animated source-textured billboards.
// Each quad still has its own color, spin, position, size and alpha lifetime.
// Dynamic instance attributes live in a per-blast geometry and are disposed.
// Shared shaders/textures are NOT recreated for each grenade.
import * as THREE from "three";

// v676: per-texture batch pool. Reserve the FIRST blast's instance buffers
// while the title screen is idle and recycle them after particles expire.
// This does not change particle counts, textures, blending, or animation.
const materials=new WeakMap();
const batchPool=new WeakMap();
const MAX_IDLE_BATCHES_PER_TEXTURE=2;
const dummy=new THREE.Object3D();
const spinQuat=new THREE.Quaternion();
const viewQuat=new THREE.Quaternion();
const axis=new THREE.Vector3(0,0,1);
const tempColor=new THREE.Color();

function particleMaterial(texture,smoke){
 let material=materials.get(texture);
 if(material)return material;
 material=new THREE.ShaderMaterial({
  uniforms:{uTexture:{value:texture}},
  vertexShader:`
   // Three.js declares instanceColor through USE_INSTANCING_COLOR.
   attribute float instanceOpacity;
   varying vec2 vUv;
   varying vec3 vColor;
   varying float vOpacity;
   void main(){
    vUv=uv;vColor=instanceColor;vOpacity=instanceOpacity;
    gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);
   }`,
  fragmentShader:`
   uniform sampler2D uTexture;
   varying vec2 vUv;
   varying vec3 vColor;
   varying float vOpacity;
   void main(){
    vec4 texel=texture2D(uTexture,vUv);
    gl_FragColor=vec4(texel.rgb*vColor,texel.a*vOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`,
  transparent:true,depthWrite:false,depthTest:true,
  blending:smoke?THREE.NormalBlending:THREE.AdditiveBlending,
  side:THREE.DoubleSide,toneMapped:false,fog:false
 });
 materials.set(texture,material);
 return material;
}

export function createExplosionParticleBatch(texture,smoke,particles){
 if(!particles.length)return null;
 let pool=batchPool.get(texture);
 let batch=null;
 if(pool){
  const idx=pool.findIndex(item=>item.capacity>=particles.length);
  if(idx>=0)batch=pool.splice(idx,1)[0];
 }
 if(!batch){
  const geometry=new THREE.PlaneGeometry(1,1);
  const opacity=new THREE.InstancedBufferAttribute(new Float32Array(particles.length),1);
  opacity.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("instanceOpacity",opacity);
  const mesh=new THREE.InstancedMesh(geometry,particleMaterial(texture,smoke),particles.length);
  mesh.name=smoke?"BatchedExplosionSmoke":"BatchedExplosionFire";
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=false;
  batch={mesh,geometry,opacity,particles:[],capacity:particles.length,texture};
 }
 batch.mesh.count=particles.length;
 batch.particles=particles;
 for(let i=0;i<particles.length;i++){
  tempColor.setHex(particles[i].color);
  batch.mesh.setColorAt(i,tempColor);
 }
 if(batch.mesh.instanceColor)batch.mesh.instanceColor.needsUpdate=true;
 return batch;
}
// Called only during title-screen prewarming, not during the blast frame.
export function primeExplosionParticleBatch(texture,smoke,capacity=160){
 const samples=Array.from({length:capacity},()=>({color:0xffffff}));
 const batch=createExplosionParticleBatch(texture,smoke,samples);
 // Keep the buffers in memory for the first true combat explosion.
 return batch;
}
export function drawExplosionParticleBatch(batch,cameraQuaternion,ruptureDelay=0,age=0){
 if(!batch)return;
 const {particles,mesh,opacity}=batch;
 viewQuat.copy(cameraQuaternion);
 for(let i=0;i<particles.length;i++){
  const p=particles[i];
  const alive=p.age<p.life&&(p.core||age>=ruptureDelay);
  const remain=alive?Math.max(0,1-p.age/p.life):0;
  const opacityNow=remain>0?p.opacity*Math.pow(remain,p.smoke?1.15:1.85):0;
  opacity.setX(i,opacityNow);
  // THREE.Sprite billboarding recreated using one camera-facing quaternion.
  // A per-particle spin still rotates the textured quad around the view axis.
  spinQuat.setFromAxisAngle(axis,p.rotation);
  dummy.quaternion.copy(viewQuat).multiply(spinQuat);
  dummy.position.copy(p.position);
  dummy.scale.set(p.size,p.size,1);
  dummy.updateMatrix();
  mesh.setMatrixAt(i,dummy.matrix);
 }
 opacity.needsUpdate=true;
 mesh.instanceMatrix.needsUpdate=true;
}
export function disposeExplosionParticleBatch(batch){
 if(!batch)return;
 if(batch.mesh.parent)batch.mesh.parent.remove(batch.mesh);
 batch.particles=[];
 batch.mesh.count=0;
 let pool=batchPool.get(batch.texture);
 if(!pool){pool=[];batchPool.set(batch.texture,pool)}
 if(pool.length<MAX_IDLE_BATCHES_PER_TEXTURE){
  pool.push(batch);return;
 }
 // Only excess concurrent-blast instances are discarded. Core reusable
 // geometry/material/texture pools survive and do not cause repeated spikes.
 batch.geometry.dispose();
}
