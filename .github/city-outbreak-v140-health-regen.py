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
'''let zombies=[],kits=[],drops=[],parts=[],casings=[],impacts=[],px=0,pz=-15,yaw=0,pitch=0,health=100,kills=0,heads=0,cash=0,wave=1,weapon="rifle",magSize=12,damageLevel=1,reloadLevel=0,unlocked={rifle:true,smg:false,shotgun:false,pistol:false,dmr:false,grenadeLauncher:false,m240:false,awm:false},ammoState={rifle:{mag:12,reserve:72},smg:{mag:30,reserve:90},shotgun:{mag:8,reserve:30},pistol:{mag:15,reserve:60},dmr:{mag:10,reserve:30},grenadeLauncher:{mag:0,reserve:0},m240:{mag:100,reserve:200},awm:{mag:5,reserve:20}},grenades=2,nukes=0,nukeInProgress=false,waveTarget=0,waveSpawned=0,currentBoss=null,bossWaveName="",usedBossNames=[],running=false,dying=false,reloading=false,between=false,waveTimer=0,lastCount=0,recoil=0,stepTimer=0,aimX=0,aimY=0,last=performance.now(),playerVX=0,playerVZ=0,lastPX=0,lastPZ=-15,lookSensitivity=.0024,keys={w:false,a:false,s:false,d:false,shift:false},msgTimer,hitTimer,triggerHeld=false,autoDelay=null,autoTimer=null,sprintEnergy=100,sprintLocked=false,aiming=false,aimBlend=0,awmReadyAt=0,runStartTime=0;''',
'''let zombies=[],kits=[],drops=[],parts=[],casings=[],impacts=[],px=0,pz=-15,yaw=0,pitch=0,health=100,kills=0,heads=0,cash=0,wave=1,weapon="rifle",magSize=12,damageLevel=1,reloadLevel=0,unlocked={rifle:true,smg:false,shotgun:false,pistol:false,dmr:false,grenadeLauncher:false,m240:false,awm:false},ammoState={rifle:{mag:12,reserve:72},smg:{mag:30,reserve:90},shotgun:{mag:8,reserve:30},pistol:{mag:15,reserve:60},dmr:{mag:10,reserve:30},grenadeLauncher:{mag:0,reserve:0},m240:{mag:100,reserve:200},awm:{mag:5,reserve:20}},grenades=2,nukes=0,nukeInProgress=false,waveTarget=0,waveSpawned=0,currentBoss=null,bossWaveName="",usedBossNames=[],running=false,dying=false,reloading=false,between=false,waveTimer=0,lastCount=0,recoil=0,stepTimer=0,aimX=0,aimY=0,last=performance.now(),playerVX=0,playerVZ=0,lastPX=0,lastPZ=-15,lookSensitivity=.0024,keys={w:false,a:false,s:false,d:false,shift:false},msgTimer,hitTimer,triggerHeld=false,autoDelay=null,autoTimer=null,sprintEnergy=100,sprintLocked=false,aiming=false,aimBlend=0,awmReadyAt=0,runStartTime=0;
const PLAYER_HEALTH_REGEN_DELAY=10,PLAYER_HEALTH_REGEN_RATE=5;
let healthRegenCooldown=0,healthRegenShown=100;''',
"regen globals"
)

replace_once(
'''function bossDamagePlayer(z,amount,label,knock=0){
 if(dying||!running)return;
 health=Math.max(0,health-Math.round(amount));''',
'''function resetHealthRegenDelay(){
 healthRegenCooldown=PLAYER_HEALTH_REGEN_DELAY;
 healthRegenShown=Math.ceil(Math.max(0,health));
}
function updateHealthRegen(dt){
 if(healthRegenCooldown>0){healthRegenCooldown=Math.max(0,healthRegenCooldown-dt);return}
 if(health<=0||health>=100||dying||!running)return;
 health=Math.min(100,health+PLAYER_HEALTH_REGEN_RATE*dt);
 const shown=Math.ceil(health);
 if(shown!==healthRegenShown||health>=100){healthRegenShown=shown;ui()}
}
function bossDamagePlayer(z,amount,label,knock=0){
 if(dying||!running)return;
 health=Math.max(0,health-Math.round(amount));resetHealthRegenDelay();''',
"regen helper and boss reset"
)

replace_once(
'''function bite(z){if(z.cool>0)return;z.cool=z.attack;z.attackAnim=.62;z.attackSide=Math.random()>.5?1:-1;rigTransient(z,"Attack",.48);let armPenalty=((!z.armL.parent?1:0)+(!z.armR.parent?1:0))*.2;health=Math.max(0,health-z.damage*(1-armPenalty));biteS();damage.classList.add("show");setTimeout(()=>damage.classList.remove("show"),140);ui();if(health<=0){showDeathScreen()}else show("-"+z.damage+" HEALTH")}''',
'''function bite(z){if(z.cool>0)return;z.cool=z.attack;z.attackAnim=.62;z.attackSide=Math.random()>.5?1:-1;rigTransient(z,"Attack",.48);let armPenalty=((!z.armL.parent?1:0)+(!z.armR.parent?1:0))*.2;health=Math.max(0,health-z.damage*(1-armPenalty));resetHealthRegenDelay();biteS();damage.classList.add("show");setTimeout(()=>damage.classList.remove("show"),140);ui();if(health<=0){showDeathScreen()}else show("-"+z.damage+" HEALTH")}''',
"bite regen reset"
)

replace_once(
'''if(p.life<=0){scene.remove(p.q);parts.splice(i,1)}}if(dying){cam.rotation.z=Math.min(1.2,cam.rotation.z+dt*.5);cam.position.y=Math.max(.25,cam.position.y-dt*.55);return}if(!running)return;move(dt);updateDrops(dt);if(between){return}for(let z of zombies){''',
'''if(p.life<=0){scene.remove(p.q);parts.splice(i,1)}}if(dying){cam.rotation.z=Math.min(1.2,cam.rotation.z+dt*.5);cam.position.y=Math.max(.25,cam.position.y-dt*.55);return}if(!running)return;updateHealthRegen(dt);move(dt);updateDrops(dt);if(between){return}for(let z of zombies){''',
"regen update loop"
)

replace_once(
'''px=0;pz=-15;yaw=0;pitch=0;health=100;kills=0;heads=0;cash=0;wave=1;weapon="rifle";''',
'''px=0;pz=-15;yaw=0;pitch=0;health=100;healthRegenCooldown=0;healthRegenShown=100;kills=0;heads=0;cash=0;wave=1;weapon="rifle";''',
"regen reset"
)

path.write_text(text,encoding="utf-8")
print("v140 player health regeneration patch applied")
