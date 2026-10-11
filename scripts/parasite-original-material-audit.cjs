// Inspect the user-supplied ORIGINAL GLB bytes, not our runtime recolor.
const fs=require('fs');
const path='assets/parasite_des_zombie_monster_game_model_free.glb';
const buf=fs.readFileSync(path);
function word(pos){return buf.readUInt32LE(pos)}
if(buf.toString('ascii',0,4)!=='glTF')throw Error('Not GLB');
const len=word(12),type=buf.toString('ascii',16,20);
if(type!=='JSON')throw Error('No JSON chunk');
const j=JSON.parse(buf.toString('utf8',20,20+len));
const materials=(j.materials||[]).map((m,i)=>({
 id:i,name:m.name||'',pbr:m.pbrMetallicRoughness||{},
 normalTexture:m.normalTexture||null,occlusionTexture:m.occlusionTexture||null,
 emissiveTexture:m.emissiveTexture||null,emissiveFactor:m.emissiveFactor||null,
 alphaMode:m.alphaMode,doubleSided:m.doubleSided,extensions:m.extensions||{},
 extras:m.extras||{}
}));
const meshes=(j.meshes||[]).map((m,i)=>({id:i,name:m.name,primitives:(m.primitives||[]).map(p=>({
 material:p.material,mode:p.mode,attributes:p.attributes,
 color:p.attributes?.COLOR_0!=null?(j.accessors||[])[p.attributes.COLOR_0]:null,
 texcoord:p.attributes?.TEXCOORD_0!=null?(j.accessors||[])[p.attributes.TEXCOORD_0]:null,
 vertexCount:(j.accessors||[])[p.attributes.POSITION]?.count,
 targets:p.targets?.length
}))}));
const images=(j.images||[]).map((im,i)=>({
 id:i,name:im.name,mimeType:im.mimeType,uri:im.uri,
 bufferView:im.bufferView,bytes:im.bufferView!=null?j.bufferViews?.[im.bufferView]?.byteLength:null
}));
let off=12,chunks=[];
while(off+8<=buf.length){const cl=word(off);chunks.push({type:buf.toString('ascii',off+4,off+8),length:cl});off+=8+cl;}
let pngs=0,jpegs=0;
for(let k=0;k<buf.length-10;k++){
 if(buf[k]===0x89&&buf.toString('ascii',k+1,k+4)==='PNG')pngs++;
 if(buf[k]===0xff&&buf[k+1]===0xd8&&buf[k+2]===0xff)jpegs++;
}
const out={asset:path,fileBytes:buf.length,assetVersion:word(4),
 creator:j.asset,sceneCount:j.scenes?.length,nodes:j.nodes?.length,
 materials,meshes,images,textures:j.textures||[],samplers:j.samplers||[],
 extensionList:j.extensionsUsed||[],extensionsRequired:j.extensionsRequired||[],
 animationClips:(j.animations||[]).map(a=>({name:a.name,channels:a.channels?.length,samplers:a.samplers?.length})),
 chunks,embeddedPngHeaders:pngs,embeddedJpegHeaders:jpegs};
console.log('PARASITE_ORIGINAL_MATERIAL_AUDIT_START');
console.log(JSON.stringify(out,null,2));
console.log('PARASITE_ORIGINAL_MATERIAL_AUDIT_END');
fs.writeFileSync('PARASITE_ORIGINAL_MATERIAL_AUDIT.json',JSON.stringify(out,null,2)+'\n');
