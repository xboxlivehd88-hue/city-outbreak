// v695 diagnostic; read the original GLB's source joint geometry, no modification.
const fs=require("fs");
const b=fs.readFileSync("assets/cartoon_fps_arms.glb");
if(b.toString("ascii",0,4)!=="glTF")throw Error("bad GLB");
const n=b.readUInt32LE(12);
const j=JSON.parse(b.toString("utf8",20,20+n));
const bones=(j.skins?.[0]?.joints||[]).map((k,i)=>({index:i,node:k,name:j.nodes[k]?.name,
 t:j.nodes[k]?.translation,r:j.nodes[k]?.rotation,s:j.nodes[k]?.scale,
 children:j.nodes[k]?.children?.map(c=>j.nodes[c]?.name)}));
const meshes=(j.meshes||[]).map((m,i)=>({index:i,name:m.name,primitives:m.primitives?.map(p=>({
 material:j.materials?.[p.material]?.name,
 attrs:p.attributes,position:j.accessors?.[p.attributes?.POSITION],
 skinIndex:j.accessors?.[p.attributes?.JOINTS_0],
 weights:j.accessors?.[p.attributes?.WEIGHTS_0],indices:j.accessors?.[p.indices]?.count
}))}));
const tops=j.nodes?.map((n,i)=>({index:i,name:n.name,children:n.children,skin:n.skin,mesh:n.mesh,translation:n.translation,rotation:n.rotation,scale:n.scale}))
 .filter(x=>x.skin!=null||x.mesh!=null);
console.log("M17_SOURCE_ANATOMY="+JSON.stringify({bytes:b.length,scenes:j.scenes?.length,
  animations:j.animations?.map(a=>({name:a.name,channels:a.channels?.length,samplers:a.samplers?.length})),
  joints:bones,meshes,meshNodes:tops,materials:j.materials?.map(m=>m.name)}));


// v695 precise original-skinned-mesh audit: count source vertices per primary
// bone and their X/Y/Z spans. Prevent another speculative transform tweak.
const base=20+n+8,prim=j.meshes[0].primitives[0];
const get=(name)=>{
 const a=j.accessors[prim.attributes[name]],view=j.bufferViews[a.bufferView];
 const start=base+(view.byteOffset||0)+(a.byteOffset||0);
 const components=name==="JOINTS_0"||name==="WEIGHTS_0"?4:3;
 const bytes=name==="JOINTS_0"?2:4,step=view.byteStride||components*bytes;
 const out=[];
 for(let i=0;i<a.count;i++){
  let vals=[];
  for(let k=0;k<components;k++){
   let pos=start+i*step+k*bytes;
   vals.push(name==="JOINTS_0"?b.readUInt16LE(pos):b.readFloatLE(pos));
  }
  out.push(vals);
 }
 return out;
};
const p=get("POSITION"),indices=get("JOINTS_0"),weights=get("WEIGHTS_0"),parts={};
for(let i=0;i<p.length;i++){
 let slot=weights[i].indexOf(Math.max(...weights[i])),joint=indices[i][slot],
 name=bones[joint]?.name||"joint_"+joint;
 const t=parts[name]||(parts[name]={n:0,min:[1e8,1e8,1e8],max:[-1e8,-1e8,-1e8],sum:[0,0,0]});
 t.n++;
 for(let k=0;k<3;k++){t.min[k]=Math.min(t.min[k],p[i][k]);t.max[k]=Math.max(t.max[k],p[i][k]);t.sum[k]+=p[i][k]}
}
for(const o of Object.values(parts))o.centroid=o.sum.map(v=>Math.round(v/o.n*100)/100);
console.log("M17_SOURCE_SKIN_VERTEX_GROUPS="+JSON.stringify(parts));
