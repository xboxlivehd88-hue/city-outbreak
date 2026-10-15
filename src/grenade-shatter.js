// CITY OUTBREAK v672 — prepared source-GLB casing fragments.
// Source textured grenade meshes are divided ONCE per geometry/quality tier.
// Detonation only positions pooled pieces; no triangle extraction or buffer
// geometry creation is allowed on the explosion frame.
import * as THREE from "three";

const activeCasingPieces=[];
const cachedChunks=new WeakMap();
const tempWorld=new THREE.Vector3();
const tempQuat=new THREE.Quaternion();
const tempScale=new THREE.Vector3();
const tmpCenter=new THREE.Vector3();

function buildChunks(geometry,sectors){
 const pos=geometry.getAttribute("position");
 if(!pos)return[];
 const normal=geometry.getAttribute("normal"),uv=geometry.getAttribute("uv"),index=geometry.getIndex();
 geometry.computeBoundingBox();
 const midpoint=geometry.boundingBox.getCenter(new THREE.Vector3());
 const buckets=Array.from({length:sectors},()=>({p:[],n:[],uv:[],sum:new THREE.Vector3(),count:0}));
 const triangles=Math.min(700,Math.floor((index?index.count:pos.count)/3));
 for(let t=0;t<triangles;t++){
  let cx=0,cz=0;
  const indices=[0,1,2].map(v=>index?index.getX(t*3+v):t*3+v);
  for(const i of indices){cx+=pos.getX(i);cz+=pos.getZ(i)}
  const angle=Math.atan2(cz/3-midpoint.z,cx/3-midpoint.x);
  const k=Math.max(0,Math.min(sectors-1,Math.floor((angle+Math.PI)/(Math.PI*2)*sectors)));
  const dst=buckets[k];
  for(const i of indices){
   const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
   dst.p.push(x,y,z);dst.sum.x+=x;dst.sum.y+=y;dst.sum.z+=z;dst.count++;
   if(normal)dst.n.push(normal.getX(i),normal.getY(i),normal.getZ(i));
   if(uv)dst.uv.push(uv.getX(i),uv.getY(i));
  }
 }
 const out=[];
 for(const bucket of buckets){
  if(bucket.count<3)continue;
  const pivot=bucket.sum.multiplyScalar(1/bucket.count);
  const points=new Float32Array(bucket.p.length);
  for(let j=0;j<points.length;j+=3){
   points[j]=bucket.p[j]-pivot.x;
   points[j+1]=bucket.p[j+1]-pivot.y;
   points[j+2]=bucket.p[j+2]-pivot.z;
  }
  const chunkGeometry=new THREE.BufferGeometry();
  chunkGeometry.setAttribute("position",new THREE.BufferAttribute(points,3));
  if(normal)chunkGeometry.setAttribute("normal",new THREE.Float32BufferAttribute(bucket.n,3));
  else chunkGeometry.computeVertexNormals();
  if(uv)chunkGeometry.setAttribute("uv",new THREE.Float32BufferAttribute(bucket.uv,2));
  chunkGeometry.computeBoundingSphere();
  out.push({geometry:chunkGeometry,pivot:pivot.clone(),pool:[]});
 }
 return out;
}
function getChunks(geometry,sectors){
 let variants=cachedChunks.get(geometry);
 if(!variants){variants=new Map();cachedChunks.set(geometry,variants)}
 if(!variants.has(sectors))variants.set(sectors,buildChunks(geometry,sectors));
 return variants.get(sectors);
}

// Call this ONCE after the GLB finishes loading, not on explosion.
export function prepareCasingFragments(model){
 let prepared=0;
 model?.traverse(o=>{
  if(!o.isMesh||!o.geometry?.attributes?.position)return;
  for(const count of [4,6,8]){getChunks(o.geometry,count);prepared++}
 });
 return prepared;
}

function discardCasingPiece(piece){
 if(piece.mesh.parent)piece.mesh.parent.remove(piece.mesh);
 if(piece.spec.pool.length<3)piece.spec.pool.push(piece.mesh);
 // Geometry is retained and shared with the cached original GLB template.
}
export function clearCasingFragments(){
 for(const piece of activeCasingPieces)discardCasingPiece(piece);
 activeCasingPieces.length=0;
}
export function activeCasingFragmentCount(){return activeCasingPieces.length}

export function burstCasingIntoFragments(projectile,center,scene,particlePercentage=100){
 if(!projectile||!scene)return 0;
 projectile.updateMatrixWorld(true);
 const quality=Math.max(0,Math.min(1,particlePercentage/100));
 const sectors=quality>=.75?8:quality>=.45?6:4;
 const pieces=[];
 projectile.traverse(source=>{
  if(!source.isMesh||!source.geometry?.attributes?.position)return;
  const material=Array.isArray(source.material)?source.material[0]:source.material;
  source.getWorldQuaternion(tempQuat);source.getWorldScale(tempScale);
  for(const spec of getChunks(source.geometry,sectors)){
   const shard=spec.pool.pop()||new THREE.Mesh(spec.geometry,material);
   shard.material=material;shard.name="GrenadeRealCasingFragment";
   // Local fragment geometry is cached; the current thrown grenade's WORLD
   // transform still determines exactly where each textured face tears open.
   tmpCenter.copy(spec.pivot).applyMatrix4(source.matrixWorld);
   shard.position.copy(tmpCenter);
   shard.quaternion.copy(tempQuat);
   shard.scale.copy(tempScale);
   shard.castShadow=false;shard.receiveShadow=false;
   scene.add(shard);
   tempWorld.copy(tmpCenter).sub(center);
   tempWorld.y+=.15+Math.random()*.25;
   if(tempWorld.lengthSq()<.0001)tempWorld.set(Math.random()-.5,.7,Math.random()-.5);
   tempWorld.normalize().multiplyScalar(2.8+Math.random()*3.4);
   tempWorld.y+=1.0+Math.random()*2.5;
   pieces.push({
    mesh:shard,spec,vel:tempWorld.clone(),
    spin:new THREE.Vector3((Math.random()-.5)*22,(Math.random()-.5)*24,(Math.random()-.5)*22),
    age:0,life:.54+Math.random()*.30,floorY:Math.max(0,center.y-.19)
   });
  }
 });
 for(const piece of pieces)activeCasingPieces.push(piece);
 while(activeCasingPieces.length>36)discardCasingPiece(activeCasingPieces.shift());
 return pieces.length;
}
export function updateCasingFragments(dt){
 for(let i=activeCasingPieces.length-1;i>=0;i--){
  const p=activeCasingPieces[i];p.age+=dt;
  p.vel.y-=10.8*dt;p.mesh.position.addScaledVector(p.vel,dt);
  p.mesh.rotation.x+=p.spin.x*dt;
  p.mesh.rotation.y+=p.spin.y*dt;
  p.mesh.rotation.z+=p.spin.z*dt;
  if(p.mesh.position.y<p.floorY&&p.vel.y<0){
   p.mesh.position.y=p.floorY;p.vel.y*=-.15;p.vel.x*=.6;p.vel.z*=.6;
  }
  if(p.age>=p.life){discardCasingPiece(p);activeCasingPieces.splice(i,1)}
 }
}
