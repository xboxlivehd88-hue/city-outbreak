from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

def replace_once(old,new,label):
    global text
    count=text.count(old)
    if count!=1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text=text.replace(old,new,1)

replace_once(
'''// -------------------- ZOMBIE DROPS --------------------
// Each zombie has a 52% chance to leave one physical pickup.
// Drop type weights: ammo 50%, money 30%, health 20%.
// Maximums requested: ammo 20 rounds, money $25, health 100.
// Health 100 is intentionally the rarest single drop tier.
const DROP_CHANCE=.52, DROP_LIFETIME=15, DROP_PICKUP_RADIUS=1.45, MAX_ACTIVE_DROPS=32, DROP_BASE_Y=.16;
const dropGeo={
 ammo:new THREE.BoxGeometry(.56,.28,.38),
 money:new THREE.BoxGeometry(.50,.16,.32),
 health:new THREE.BoxGeometry(.54,.34,.42)
};
const dropMat={
 ammo:new THREE.MeshStandardMaterial({color:0x786b42,emissive:0x3d2b0d,emissiveIntensity:.30,roughness:.72,metalness:.03}),
 money:new THREE.MeshStandardMaterial({color:0x477b48,emissive:0x173f1b,emissiveIntensity:.30,roughness:.78}),
 health:new THREE.MeshStandardMaterial({color:0xe5e1d5,emissive:0x511010,emissiveIntensity:.24,roughness:.72})
};''',
'''// -------------------- ZOMBIE DROPS --------------------
// Each zombie has a 52% chance to leave one physical pickup.
// v148 removes health pickups completely. The old 50:30 ammo-to-money ratio is
// preserved proportionally, so successful drops are now 62.5% ammo / 37.5% cash.
const DROP_CHANCE=.52, DROP_LIFETIME=15, DROP_PICKUP_RADIUS=1.45, MAX_ACTIVE_DROPS=32, DROP_BASE_Y=.16;
const dropGeo={
 ammo:new THREE.BoxGeometry(.56,.28,.38),
 money:new THREE.BoxGeometry(.50,.16,.32)
};
const dropMat={
 ammo:new THREE.MeshStandardMaterial({color:0x786b42,emissive:0x3d2b0d,emissiveIntensity:.30,roughness:.72,metalness:.03}),
 money:new THREE.MeshStandardMaterial({color:0x477b48,emissive:0x173f1b,emissiveIntensity:.30,roughness:.78})
};''',
"drop definitions without health"
)

replace_once(
'''function randomDropAmount(type){
 if(type==="ammo")return weightedTier(rnd(),[[5,35],[10,30],[15,22],[20,13]]);
 if(type==="money")return weightedTier(rnd(),[[5,40],[10,30],[15,20],[25,10]]);
 return weightedTier(rnd(),[[10,35],[25,30],[50,22],[75,10],[100,3]]);
}''',
'''function randomDropAmount(type){
 if(type==="ammo")return weightedTier(rnd(),[[5,35],[10,30],[15,22],[20,13]]);
 return weightedTier(rnd(),[[5,40],[10,30],[15,20],[25,10]]);
}''',
"remove health amount tiers"
)

replace_once(
''' const r=rnd(),type=r<.50?"ammo":r<.80?"money":"health";let amount=randomDropAmount(type);''',
''' const type=rnd()<.625?"ammo":"money";let amount=randomDropAmount(type);''',
"redistribute zombie drop types"
)

replace_once(
''' }else if(type==="money"){
   labelText="$"+amount;labelColor=0x76e27e;
   box(.36,.025,.22,M(0xc9d8b1,.72),0,.34,0,g);
   box(.05,.035,.25,M(0x294e2e,.78),0,.355,0,g);
 }else{
   labelText="HEALTH +"+amount;labelColor=0xff7777;
   box(.12,.035,.30,M(0xb52d2d,.72),0,.44,0,g);
   box(.32,.035,.10,M(0xb52d2d,.72),0,.44,0,g);
 }''',
''' }else{
   labelText="$"+amount;labelColor=0x76e27e;
   box(.36,.025,.22,M(0xc9d8b1,.72),0,.34,0,g);
   box(.05,.035,.25,M(0x294e2e,.78),0,.355,0,g);
 }''',
"remove zombie health pickup visual"
)

replace_once(
'''function spawnFixedDrop(pos,type,amount,ammoWeapon=null,ox=0,oz=0){
 if(drops.length>=MAX_ACTIVE_DROPS){const old=drops.shift();if(old&&old.g.parent)scene.remove(old.g)}
 const g=new THREE.Group(),body=new THREE.Mesh(dropGeo[type],dropMat[type]);
 body.castShadow=true;body.receiveShadow=true;body.position.y=.24;g.add(body);
 let labelText="",labelColor=0xffffff;
 if(type==="ammo"){
   ammoWeapon=ammoWeapon||randomAmmoWeapon();labelText=weaponDefs[ammoWeapon].name+" +"+amount;labelColor=0xf0c467;
   for(let k=-1;k<=1;k++){const round=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.23,7),M(0xc29742,.38));round.rotation.z=Math.PI/2;round.position.set(k*.13,.43,0);g.add(round)}
 }else if(type==="money"){
   labelText="$"+amount;labelColor=0x76e27e;box(.36,.025,.22,M(0xc9d8b1,.72),0,.34,0,g);box(.05,.035,.25,M(0x294e2e,.78),0,.355,0,g);
 }else{
   labelText="HEALTH +"+amount;labelColor=0xff7777;box(.12,.035,.30,M(0xb52d2d,.72),0,.44,0,g);box(.32,.035,.10,M(0xb52d2d,.72),0,.44,0,g);
 }
 const label=makeDropLabel(labelText,labelColor);label.position.set(0,1.03,0);g.add(label);''',
'''function spawnFixedDrop(pos,type,amount,ammoWeapon=null,ox=0,oz=0){
 if(type!=="ammo"&&type!=="money")return;
 if(drops.length>=MAX_ACTIVE_DROPS){const old=drops.shift();if(old&&old.g.parent)scene.remove(old.g)}
 const g=new THREE.Group(),body=new THREE.Mesh(dropGeo[type],dropMat[type]);
 body.castShadow=true;body.receiveShadow=true;body.position.y=.24;g.add(body);
 let labelText="",labelColor=0xffffff;
 if(type==="ammo"){
   ammoWeapon=ammoWeapon||randomAmmoWeapon();labelText=weaponDefs[ammoWeapon].name+" +"+amount;labelColor=0xf0c467;
   for(let k=-1;k<=1;k++){const round=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.23,7),M(0xc29742,.38));round.rotation.z=Math.PI/2;round.position.set(k*.13,.43,0);g.add(round)}
 }else{
   labelText="$"+amount;labelColor=0x76e27e;box(.36,.025,.22,M(0xc9d8b1,.72),0,.34,0,g);box(.05,.035,.25,M(0x294e2e,.78),0,.355,0,g);
 }
 const label=makeDropLabel(labelText,labelColor);label.position.set(0,1.03,0);g.add(label);''',
"remove fixed health drop support"
)

replace_once(
'''function spawnBossRewardCache(pos){
 const ammoPool=Object.keys(unlocked).filter(w=>unlocked[w]&&w!=="grenadeLauncher");
 const ammoWeapon=ammoPool[Math.floor(rnd()*ammoPool.length)]||"rifle";
 spawnFixedDrop(pos,"health",100,null,-.9,.25);
 spawnFixedDrop(pos,"money",25,null,.9,.25);
 spawnFixedDrop(pos,"ammo",20,ammoWeapon,0,-.85);
 if(unlocked.grenadeLauncher)spawnFixedDrop(pos,"ammo",Math.min(4,Math.max(1,10-launcherAmmoTotal())),"grenadeLauncher",0,.85);
}
function collectDrop(d){
 if(d.type==="health"){
   if(health>=100)return false;
   const before=health;health=Math.min(100,health+d.amount);
   show("HEALTH +"+Math.round(health-before));
 }else if(d.type==="money"){
   cash+=d.amount;show("CASH +$"+d.amount);
 }else{''',
'''function spawnBossRewardCache(pos){
 const ammoPool=Object.keys(unlocked).filter(w=>unlocked[w]&&w!=="grenadeLauncher");
 const ammoWeapon=ammoPool[Math.floor(rnd()*ammoPool.length)]||"rifle";
 spawnFixedDrop(pos,"money",25,null,.9,.25);
 spawnFixedDrop(pos,"ammo",20,ammoWeapon,0,-.85);
 if(unlocked.grenadeLauncher)spawnFixedDrop(pos,"ammo",Math.min(4,Math.max(1,10-launcherAmmoTotal())),"grenadeLauncher",0,.85);
}
function collectDrop(d){
 if(d.type==="money"){
   cash+=d.amount;show("CASH +$"+d.amount);
 }else{''',
"remove boss health reward and health collection"
)

path.write_text(text,encoding="utf-8")
print("v148 removed physical health drops")
