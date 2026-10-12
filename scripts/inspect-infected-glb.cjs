// Inspect the user's actual binary GLB in GitHub Actions; no assumptions about rig naming.
const fs=require('fs');
const p='assets/zombie_animated.glb';
const b=fs.readFileSync(p);
if(b.toString('ascii',0,4)!=='glTF')throw Error('Not a binary glTF');
const version=b.readUInt32LE(4),length=b.readUInt32LE(8);
let off=12,model=null;
while(off+8<=b.length){
 const size=b.readUInt32LE(off),type=b.toString('ascii',off+4,off+8);
 if(type==='JSON'){model=JSON.parse(b.toString('utf8',off+8,off+8+size));break;}
 off+=8+size;
}
if(!model)throw Error('GLB JSON chunk absent');
const nodes=model.nodes||[],skins=model.skins||[],meshes=model.meshes||[],animations=model.animations||[];
const bindings=animations.map(a=>({name:a.name,durationTracks:a.samplers?.length,channels:a.channels?.length,
 targets:[...new Set((a.channels||[]).map(c=>(nodes[c.target?.node]?.name||'#'+c.target?.node)+':'+c.target?.path))].slice(0,125)}));
const named=nodes.map((n,i)=>({i,n:n.name||'',t:n.translation,r:n.rotation,s:n.scale,mesh:n.mesh,skin:n.skin,children:n.children})).filter(n=>n.n||n.skin!==undefined);
const material=(model.materials||[]).map((m,i)=>({i,name:m.name,pbr:m.pbrMetallicRoughness?.baseColorFactor,base:m.pbrMetallicRoughness?.baseColorTexture?.index,legacy:m.extensions?.KHR_materials_pbrSpecularGlossiness?.diffuseTexture?.index}));
const bounds=(model.accessors||[]).filter(a=>a.type==='VEC3'&&a.min&&a.max).slice(0,22).map(a=>({min:a.min,max:a.max,count:a.count}));
const summary={file:p,bytes:b.length,headerVersion:version,declaredLength:length,
 generator:model.asset?.generator,nodes:nodes.length,meshes:meshes.length,
 materials:material,textures:model.textures?.length,images:model.images?.length,
 meshData:meshes.map((m,i)=>({i,name:m.name,primitives:m.primitives?.map(p=>({mode:p.mode,
  skinIndices:!!p.attributes?.JOINTS_0,skinWeights:!!p.attributes?.WEIGHTS_0,material:p.material,
  positionAccessor:p.attributes?.POSITION}))})),
 skins:skins.map(s=>({name:s.name,skeleton:s.skeleton,joints:s.joints?.length,
  boneNames:s.joints?.map(i=>nodes[i]?.name||'#'+i)})),
 animations:bindings,namedNodes:named.slice(0,210),bounds};
console.log('INFECTED_GLB_AUDIT_START');
console.log(JSON.stringify(summary,null,2));
console.log('INFECTED_GLB_AUDIT_END');
fs.writeFileSync('INFECTED_GLB_AUDIT.json',JSON.stringify(summary,null,2));
