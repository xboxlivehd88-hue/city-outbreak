
const fs=require('fs');
function parse(path){
 const b=fs.readFileSync(path);if(b.toString('ascii',0,4)!=='glTF')throw Error('Bad glb '+path);
 const n=b.readUInt32LE(12),j=JSON.parse(b.toString('utf8',20,20+n));
 const nodes=j.nodes||[],clips=(j.animations||[]).map(a=>{
  const names=a.channels.map(c=>nodes[c.target.node]?.name||'unnamed'),trackNames=[...new Set(names)];
  const samplers=a.samplers||[];const keyCounts=samplers.map(s=>j.accessors[s.input]?.count||0);
  const ranges=samplers.map(s=>j.accessors[s.input]?.max?.[0]||0);
  return {name:a.name,channels:a.channels?.length,keyMin:Math.min(...keyCounts),keyMax:Math.max(...keyCounts),duration:Math.max(...ranges),
    targets:trackNames.filter(x=>/Hips|Leg|Foot|Arm|Spine|Pelvis|Upper|Knee|Thigh|mixamorig/i.test(x)).slice(0,25),
    sample:trackNames.slice(0,12),hasLegs:trackNames.some(x=>/Leg|Foot|Knee|Thigh/i.test(x))};
 });
 const legNodes=nodes.map((x,i)=>({name:x.name,i})).filter(x=>/Hips|UpLeg|Leg|Foot|Knee|Ankle|Thigh|Shoulder|Arm/i.test(x.name||'')).slice(0,45);
 const skins=(j.skins||[]).map(s=>({jointCount:s.joints?.length,first:s.joints?.slice(0,20).map(i=>nodes[i]?.name)}));
 return {path,bytes:b.length,clips,legNodes,skins};
}
const assets=[
'assets/parasite_des_zombie_monster_game_model_free.glb',
'assets/zombie_number_3_-_animated.glb',
'assets/walkers.glb',
'assets/green guy.glb',
'assets/panzer_zombie.glb',
'assets/suit guy boss.glb'
];
const all=assets.map(path=>{try{return parse(path)}catch(e){return {path,error:String(e)}}});
console.log('WALK_CLIP_AUDIT_START');
console.log(JSON.stringify(all,null,2));
console.log('WALK_CLIP_AUDIT_END');
fs.writeFileSync('PARASITE_ORIGINAL_MATERIAL_AUDIT.json',JSON.stringify(all,null,2)+'\n');
