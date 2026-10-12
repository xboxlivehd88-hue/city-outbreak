const fs=require('fs');
const names=['animated_zombie_cop_running_loop.glb','zombie_running_on_metel_maniac.glb'];
const results=[];
for(const name of names){
 const path='assets/'+name,b=fs.readFileSync(path);
 if(b.toString('ascii',0,4)!=='glTF')throw Error('Bad GLB header: '+name);
 const len=b.readUInt32LE(12),type=b.toString('ascii',16,20);
 if(type!=='JSON')throw Error('Missing GLB JSON: '+name);
 const gltf=JSON.parse(b.toString('utf8',20,20+len));
 const nodes=gltf.nodes||[],skins=gltf.skins||[],acc=gltf.accessors||[],mats=gltf.materials||[];
 const meshes=gltf.meshes||[],anims=gltf.animations||[];
 const channels=anims.map(a=>({
  name:a.name||'(unnamed)',
  channels:(a.channels||[]).length,
  duration:Math.max(0,...(a.samplers||[]).map(s=>acc[s.input]?.max?.[0]||0)),
  paths:[...new Set((a.channels||[]).map(c=>c.target?.path))],
  driven:(a.channels||[]).map(c=>({
    node:nodes[c.target.node]?.name||String(c.target.node),
    path:c.target.path,
    frames:acc[a.samplers[c.sampler]?.input]?.count,
    interpolation:a.samplers[c.sampler]?.interpolation||'LINEAR'
  }))
 }));
 const meshNodes=nodes.map((n,i)=>({i,name:n.name,mesh:n.mesh,skin:n.skin,scale:n.scale,rotation:n.rotation,translation:n.translation})).filter(n=>n.mesh!==undefined);
 const result={
  file:name,bytes:b.length,asset:gltf.asset,scene:gltf.scene,sceneRoots:gltf.scenes?.[gltf.scene||0]?.nodes?.map(n=>({index:n,name:nodes[n]?.name,scale:nodes[n]?.scale,translation:nodes[n]?.translation})),
  nodeCount:nodes.length,meshCount:meshes.length,meshNodes,
  skins:skins.map(s=>({jointCount:s.joints?.length,root:nodes[s.skeleton]?.name,joints:s.joints?.map(j=>nodes[j]?.name)})),
  animations:channels,
  geometry:meshes.map((m,i)=>({name:m.name,index:i,primitives:m.primitives?.map(p=>({
   mode:p.mode,vertices:acc[p.attributes?.POSITION]?.count,
   boundsMin:acc[p.attributes?.POSITION]?.min,boundsMax:acc[p.attributes?.POSITION]?.max,
   skinned:!!(p.attributes?.JOINTS_0!==undefined&&p.attributes?.WEIGHTS_0!==undefined),
   material:mats[p.material]?.name,attributes:Object.keys(p.attributes||{})
  }))})),materials:mats.map(m=>({name:m.name,doubleSided:m.doubleSided,baseColorTexture:m.pbrMetallicRoughness?.baseColorTexture?.index,baseColorFactor:m.pbrMetallicRoughness?.baseColorFactor})),images:(gltf.images||[]).map(im=>({name:im.name,mimeType:im.mimeType})),
 };
 results.push(result);
 console.log('SPRINTER_ASSET_AUDIT='+JSON.stringify(result));
}
fs.writeFileSync('SPRINTER_ASSET_AUDIT.json',JSON.stringify(results,null,2));
