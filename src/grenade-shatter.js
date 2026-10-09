// CITY OUTBREAK v531 — cosmetic grenade casing breakup.
// Extract actual GLB faces at the CURRENT world orientation so the grenade
// visibly tears into its own textured pieces rather than simply disappearing.
// Projectiles, damage, knockback, audio, and the existing explosion VFX are untouched.
import * as THREE from "three";

const activeCasingPieces=[];
const tmpVertex=new THREE.Vector3();
const tmpNormal=new THREE.Vector3();
const tmpCentroid=new THREE.Vector3();

function discardCasingPiece(piece){
 if(piece.mesh.parent)piece.mesh.parent.remove(piece.mesh);
 piece.mesh.geometry.dispose();
}

export function clearCasingFragments(){
 for(const piece of activeCasingPieces)discardCasingPiece(piece);
 activeCasingPieces.length=0;
}

export function burstCasingIntoFragments(projectile,center,scene,particlePercentage=100){
 if(!projectile||!scene)return 0;
 projectile.updateMatrixWorld(true);
 const quality=Math.max(0,Math.min(1,particlePercentage/100));
 // Keep the little source GLB recognizable even in Low, without many drawcalls.
 const sectors=quality>=.75?8:quality>=.45?6:4;
 const chunks=[];
 projectile.traverse(mesh=>{
   if(!mesh.isMesh||!mesh.geometry?.attributes?.position)return;
   const geometry=mesh.geometry;
   const pos=geometry.getAttribute("position");
   const normal=geometry.getAttribute("normal");
   const uv=geometry.getAttribute("uv");
   const index=geometry.getIndex();
   const triangleCount=Math.min(700,Math.floor((index?index.count:pos.count)/3));
   const worldNormal=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
   const buckets=Array.from({length:sectors},()=>({p:[],n:[],uv:[],total:new THREE.Vector3(),vertices:0}));
   for(let t=0;t<triangleCount;t++){
     const triP=[],triN=[],triUv=[];
     tmpCentroid.set(0,0,0);
     for(let v=0;v<3;v++){
       const i=index?index.getX(t*3+v):t*3+v;
       const world=tmpVertex.set(pos.getX(i),pos.getY(i),pos.getZ(i)).applyMatrix4(mesh.matrixWorld).clone();
       triP.push(world);
       tmpCentroid.add(world);
       if(normal)triN.push(tmpNormal.set(normal.getX(i),normal.getY(i),normal.getZ(i)).applyMatrix3(worldNormal).normalize().clone());
       if(uv)triUv.push(uv.getX(i),uv.getY(i));
     }
     tmpCentroid.multiplyScalar(1/3).sub(center);
     const angle=Math.atan2(tmpCentroid.z,tmpCentroid.x);
     const distance=Math.hypot(tmpCentroid.x,tmpCentroid.z);
     const sector=distance<.008?t%sectors:Math.min(sectors-1,Math.floor((angle+Math.PI)/(2*Math.PI)*sectors));
     const dst=buckets[sector];
     for(let v=0;v<3;v++){
       const world=triP[v];
       dst.p.push(world.x,world.y,world.z);
       dst.total.add(world);
       dst.vertices++;
       if(normal){const n=triN[v];dst.n.push(n.x,n.y,n.z)}
       if(uv)dst.uv.push(triUv[v*2],triUv[v*2+1]);
     }
   }
   for(const bucket of buckets){
     if(bucket.vertices<3)continue;
     const centerWorld=bucket.total.multiplyScalar(1/bucket.vertices);
     const positions=new Float32Array(bucket.p.length);
     for(let j=0;j<bucket.p.length;j+=3){
       positions[j]=bucket.p[j]-centerWorld.x;
       positions[j+1]=bucket.p[j+1]-centerWorld.y;
       positions[j+2]=bucket.p[j+2]-centerWorld.z;
     }
     const shardGeometry=new THREE.BufferGeometry();
     shardGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
     if(normal)shardGeometry.setAttribute("normal",new THREE.Float32BufferAttribute(bucket.n,3));
     else shardGeometry.computeVertexNormals();
     if(uv)shardGeometry.setAttribute("uv",new THREE.Float32BufferAttribute(bucket.uv,2));
     shardGeometry.computeBoundingSphere();
     const material=Array.isArray(mesh.material)?mesh.material[0]:mesh.material;
     const shard=new THREE.Mesh(shardGeometry,material);
     shard.name="GrenadeRealCasingFragment";
     shard.position.copy(centerWorld);
     shard.castShadow=false;shard.receiveShadow=false;
     scene.add(shard);
     const away=centerWorld.clone().sub(center);
     away.y+=.15+Math.random()*.25;
     if(away.lengthSq()<.0001)away.set(Math.random()-.5,.7,Math.random()-.5);
     away.normalize();
     const speed=2.8+Math.random()*3.4;
     const velocity=away.multiplyScalar(speed);
     velocity.y+=1.0+Math.random()*2.5;
     chunks.push({
       mesh:shard,vel:velocity,
       spin:new THREE.Vector3((Math.random()-.5)*22,(Math.random()-.5)*24,(Math.random()-.5)*22),
       age:0,life:.54+Math.random()*.30,floorY:Math.max(0,center.y-.19)
     });
   }
 });
 // Reserve a small fixed maximum if several grenades explode at once.
 for(const chunk of chunks)activeCasingPieces.push(chunk);
 while(activeCasingPieces.length>36)discardCasingPiece(activeCasingPieces.shift());
 return chunks.length;
}

export function updateCasingFragments(dt){
 for(let i=activeCasingPieces.length-1;i>=0;i--){
   const p=activeCasingPieces[i];
   p.age+=dt;
   p.vel.y-=10.8*dt;
   p.mesh.position.addScaledVector(p.vel,dt);
   p.mesh.rotation.x+=p.spin.x*dt;
   p.mesh.rotation.y+=p.spin.y*dt;
   p.mesh.rotation.z+=p.spin.z*dt;
   if(p.mesh.position.y<p.floorY&&p.vel.y<0){
     p.mesh.position.y=p.floorY;
     p.vel.y*=-.15;
     p.vel.x*=.6;p.vel.z*=.6;
   }
   if(p.age>=p.life){
     discardCasingPiece(p);
     activeCasingPieces.splice(i,1);
   }
 }
}
