const fs=require("fs");
const file="assets/animated_injured_zombie_crawling_loop.glb";
const bin=fs.readFileSync(file);
if(bin.toString("ascii",0,4)!=="glTF")throw Error("Invalid GLB magic");
let gltf=null,at=12;
while(at+8<=bin.length){const len=bin.readUInt32LE(at),tag=bin.toString("ascii",at+4,at+8);if(tag==="JSON"){gltf=JSON.parse(bin.toString("utf8",at+8,at+8+len));break;}at+=8+len}
if(!gltf)throw Error("GLB JSON chunk missing");
const nodes=gltf.nodes||[],anims=gltf.animations||[];
const report={
file,bytes:bin.length,generator:gltf.asset?.generator,scenes:gltf.scenes?.length,
nodeCount:nodes.length,meshCount:gltf.meshes?.length,textureCount:gltf.textures?.length,
imageCount:gltf.images?.length,materialNames:(gltf.materials||[]).map(m=>({name:m.name,alphaMode:m.alphaMode,doubleSided:m.doubleSided,pbr:m.pbrMetallicRoughness,normal:m.normalTexture,emissive:m.emissiveTexture,legacy:m.extensions?.KHR_materials_pbrSpecularGlossiness,otherExtensions:Object.keys(m.extensions||{})})),textures:gltf.textures,images:gltf.images?.map(img=>({name:img.name,mimeType:img.mimeType,bufferView:img.bufferView,uri:img.uri})),extensionsUsed:gltf.extensionsUsed,
skins:(gltf.skins||[]).map(s=>({joints:s.joints?.length,bones:(s.joints||[]).map(i=>nodes[i]?.name)})),
animations:anims.map(a=>({name:a.name||"(unnamed)",channels:a.channels?.length,samplers:a.samplers?.length,targets:(a.channels||[]).slice(0,42).map(c=>({node:nodes[c.target?.node]?.name||"#"+c.target?.node,path:c.target?.path}))})),
rootNodes:(gltf.scenes||[]).flatMap(s=>(s.nodes||[]).map(i=>({name:nodes[i]?.name,translation:nodes[i]?.translation,rotation:nodes[i]?.rotation,scale:nodes[i]?.scale,children:nodes[i]?.children?.length}))),
accessorBounds:(gltf.accessors||[]).filter(a=>a.type==="VEC3"&&a.min&&a.max).slice(0,15).map(a=>({min:a.min,max:a.max,count:a.count})),
namedNodes:nodes.map((n,i)=>({i,name:n.name,translation:n.translation,rotation:n.rotation,scale:n.scale,mesh:n.mesh,skin:n.skin})).filter(n=>n.name||n.mesh!==undefined||n.skin!==undefined).slice(0,100)
};
fs.writeFileSync("INJURED_CRAWLER_GLB_AUDIT.json",JSON.stringify(report,null,2));
console.log("INJURED_CRAWLER_GLB_AUDIT_START");
console.log(JSON.stringify(report,null,2));
console.log("INJURED_CRAWLER_GLB_AUDIT_END");
