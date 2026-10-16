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
