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
'''#bossFill{height:100%;width:100%;background:linear-gradient(90deg,#650000,#b51616 55%,#ff5757);transition:width .08s linear}
</style>''',
'''#bossFill{height:100%;width:100%;background:linear-gradient(90deg,#650000,#b51616 55%,#ff5757);transition:width .08s linear}
#pauseBtn{position:absolute;right:16px;bottom:16px;z-index:7;display:none;margin:0;padding:9px 14px;border:1px solid #ffffff32;border-radius:9px;background:#090b0dcc;color:#fff;font:900 12px Arial;letter-spacing:1px;cursor:pointer}
#pauseBtn.show{display:block}
#pauseOverlay{position:absolute;inset:0;z-index:20;display:none;align-items:center;justify-content:center;background:#050708d9;backdrop-filter:blur(4px);text-align:center}
#pauseOverlay.show{display:flex}
#pausePanel{width:min(410px,86vw);padding:28px 24px;background:#0b0e10f2;border:1px solid #ffffff28;border-radius:16px;box-shadow:0 18px 60px #000a}
#pausePanel h2{margin:0 0 8px;font-size:38px;letter-spacing:4px}
#pausePanel p{margin:0 0 20px;color:#c8ced1;font-size:14px;line-height:1.5}
#resumeGame{margin:0;padding:12px 28px;border:0;border-radius:9px;background:#e8e8e8;color:#111;font-size:16px;font-weight:900;cursor:pointer}
</style>''',
"pause css"
)

replace_once(
'''<div class="stats"><span id="ammo">12 / 72</span><br><span id="kills">KILLS 0</span><br><span id="heads">HEADSHOTS 0</span><br><span id="wave">WAVE 1</span><br><span id="remaining">ZOMBIES 6</span><br><span id="cash">CASH $0</span><br><span id="weaponName">RIFLE</span><br><span id="grenadeCount">GRENADES 2</span><br><span id="nukeCount">NUKES 0</span></div><div id="bossHUD">''',
'''<div class="stats"><span id="ammo">12 / 72</span><br><span id="kills">KILLS 0</span><br><span id="heads">HEADSHOTS 0</span><br><span id="wave">WAVE 1</span><br><span id="remaining">ZOMBIES 6</span><br><span id="cash">CASH $0</span><br><span id="weaponName">RIFLE</span><br><span id="grenadeCount">GRENADES 2</span><br><span id="nukeCount">NUKES 0</span></div><button id="pauseBtn" type="button">PAUSE [P]</button><div id="bossHUD">''',
"pause button html"
)

replace_once(
'''<div id="announce"><b id="big"></b><span id="small"></span></div>
<div id="death">''',
'''<div id="announce"><b id="big"></b><span id="small"></span></div>
<div id="pauseOverlay"><div id="pausePanel"><h2>PAUSED</h2><p>The outbreak is frozen exactly where you left it.<br>Press P or choose Resume when you are ready.</p><button id="resumeGame" type="button">RESUME GAME</button></div></div>
<div id="death">''',
"pause overlay html"
)

replace_once(
'''<div class="controlRow"><span>Reload</span><span class="key">R</span></div>''',
'''<div class="controlRow"><span>Reload</span><span class="key">R</span></div>
<div class="controlRow"><span>Pause</span><span class="key">P / ESC</span></div>''',
"pause control hint"
)

replace_once(
'''const healthText=document.querySelector("#healthText"),healthBar=document.querySelector("#healthBar"),ammoEl=document.querySelector("#ammo"),killsEl=document.querySelector("#kills"),headsEl=document.querySelector("#heads"),waveEl=document.querySelector("#wave"),remainingEl=document.querySelector("#remaining"),cashEl=document.querySelector("#cash"),weaponNameEl=document.querySelector("#weaponName"),grenadeEl=document.querySelector("#grenadeCount"),nukeEl=document.querySelector("#nukeCount"),nukeFlash=document.querySelector("#nukeFlash"),nukeShock=document.querySelector("#nukeShock"),shop=document.querySelector("#shop"),shopCash=document.querySelector("#shopCash"),shopNote=document.querySelector("#shopNote"),damage=document.querySelector("#damage"),hitmarker=document.querySelector("#hitmarker"),announce=document.querySelector("#announce"),big=document.querySelector("#big"),small=document.querySelector("#small"),death=document.querySelector("#death"),msg=document.querySelector("#msg"),startScreen=document.querySelector("#startScreen"),bossHUD=document.querySelector("#bossHUD"),bossFill=document.querySelector("#bossFill"),bossNameEl=document.querySelector("#bossName"),bossSubEl=document.querySelector("#bossSub"),sprintFill=document.querySelector("#sprintFill"),sprintState=document.querySelector("#sprintState"),scopeOverlay=document.querySelector("#scopeOverlay");''',
'''const healthText=document.querySelector("#healthText"),healthBar=document.querySelector("#healthBar"),ammoEl=document.querySelector("#ammo"),killsEl=document.querySelector("#kills"),headsEl=document.querySelector("#heads"),waveEl=document.querySelector("#wave"),remainingEl=document.querySelector("#remaining"),cashEl=document.querySelector("#cash"),weaponNameEl=document.querySelector("#weaponName"),grenadeEl=document.querySelector("#grenadeCount"),nukeEl=document.querySelector("#nukeCount"),nukeFlash=document.querySelector("#nukeFlash"),nukeShock=document.querySelector("#nukeShock"),shop=document.querySelector("#shop"),shopCash=document.querySelector("#shopCash"),shopNote=document.querySelector("#shopNote"),damage=document.querySelector("#damage"),hitmarker=document.querySelector("#hitmarker"),announce=document.querySelector("#announce"),big=document.querySelector("#big"),small=document.querySelector("#small"),death=document.querySelector("#death"),msg=document.querySelector("#msg"),startScreen=document.querySelector("#startScreen"),bossHUD=document.querySelector("#bossHUD"),bossFill=document.querySelector("#bossFill"),bossNameEl=document.querySelector("#bossName"),bossSubEl=document.querySelector("#bossSub"),sprintFill=document.querySelector("#sprintFill"),sprintState=document.querySelector("#sprintState"),scopeOverlay=document.querySelector("#scopeOverlay"),pauseBtn=document.querySelector("#pauseBtn"),pauseOverlay=document.querySelector("#pauseOverlay"),resumeGameBtn=document.querySelector("#resumeGame");''',
"pause dom refs"
)

replace_once(
'''let zombies=[],kits=[],drops=[],parts=[],casings=[],impacts=[],px=0,pz=-15,yaw=0,pitch=0,health=100,kills=0,heads=0,cash=0,wave=1,weapon="rifle",magSize=12,damageLevel=1,reloadLevel=0,unlocked={rifle:true,smg:false,shotgun:false,pistol:false,dmr:false,grenadeLauncher:false,m240:false,awm:false},ammoState={rifle:{mag:12,reserve:72},smg:{mag:30,reserve:90},shotgun:{mag:8,reserve:30},pistol:{mag:15,reserve:60},dmr:{mag:10,reserve:30},grenadeLauncher:{mag:0,reserve:0},m240:{mag:100,reserve:200},awm:{mag:5,reserve:20}},grenades=2,nukes=0,nukeInProgress=false,waveTarget=0,waveSpawned=0,currentBoss=null,bossWaveName="",usedBossNames=[],running=false,dying=false,reloading=false,between=false,waveTimer=0,lastCount=0,recoil=0,stepTimer=0,aimX=0,aimY=0,last=performance.now(),playerVX=0,playerVZ=0,lastPX=0,lastPZ=-15,lookSensitivity=.0024,keys={w:false,a:false,s:false,d:false,shift:false},msgTimer,hitTimer,triggerHeld=false,autoDelay=null,autoTimer=null,sprintEnergy=100,sprintLocked=false,aiming=false,aimBlend=0,awmReadyAt=0,runStartTime=0;
const PLAYER_HEALTH_REGEN_DELAY=5,PLAYER_HEALTH_REGEN_RATE=10;
let healthRegenCooldown=0,healthRegenShown=100;''',
'''let zombies=[],kits=[],drops=[],parts=[],casings=[],impacts=[],px=0,pz=-15,yaw=0,pitch=0,health=100,kills=0,heads=0,cash=0,wave=1,weapon="rifle",magSize=12,damageLevel=1,reloadLevel=0,unlocked={rifle:true,smg:false,shotgun:false,pistol:false,dmr:false,grenadeLauncher:false,m240:false,awm:false},ammoState={rifle:{mag:12,reserve:72},smg:{mag:30,reserve:90},shotgun:{mag:8,reserve:30},pistol:{mag:15,reserve:60},dmr:{mag:10,reserve:30},grenadeLauncher:{mag:0,reserve:0},m240:{mag:100,reserve:200},awm:{mag:5,reserve:20}},grenades=2,nukes=0,nukeInProgress=false,waveTarget=0,waveSpawned=0,currentBoss=null,bossWaveName="",usedBossNames=[],running=false,dying=false,reloading=false,between=false,paused=false,pauseStartedAt=0,pausedAccumulatedMs=0,waveTimer=0,lastCount=0,recoil=0,stepTimer=0,aimX=0,aimY=0,last=performance.now(),playerVX=0,playerVZ=0,lastPX=0,lastPZ=-15,lookSensitivity=.0024,keys={w:false,a:false,s:false,d:false,shift:false},msgTimer,hitTimer,triggerHeld=false,autoDelay=null,autoTimer=null,sprintEnergy=100,sprintLocked=false,aiming=false,aimBlend=0,awmReadyAt=0,runStartTime=0;
const PLAYER_HEALTH_REGEN_DELAY=5,PLAYER_HEALTH_REGEN_RATE=10;
let healthRegenCooldown=0,healthRegenShown=100;
function gameTimeNow(){
 const now=performance.now();
 return now-pausedAccumulatedMs-(paused?now-pauseStartedAt:0);
}
function gameTimeout(fn,ms){
 const deadline=gameTimeNow()+ms;
 const check=()=>{
   const remaining=deadline-gameTimeNow();
   if(paused||remaining>1){setTimeout(check,paused?180:Math.min(180,Math.max(4,remaining)));return}
   fn();
 };
 return setTimeout(check,Math.max(0,ms));
}''',
"pause globals and game clock"
)

replace_once(
''' const p=Math.max(0,Math.min(1,(performance.now()-reloadStartedAt)/reloadDurationMs));''',
''' const p=Math.max(0,Math.min(1,(gameTimeNow()-reloadStartedAt)/reloadDurationMs));''',
"reload animation game clock"
)

replace_once(
'''function showDeathScreen(){
 running=false;dying=true;stopAuto();clearKeys();setAim(false);
 const elapsed=runStartTime>0?performance.now()-runStartTime:0;''',
'''function showDeathScreen(){
 running=false;dying=true;paused=false;pauseOverlay.classList.remove("show");pauseBtn.classList.remove("show");stopAuto();clearKeys();setAim(false);
 const elapsed=runStartTime>0?gameTimeNow()-runStartTime:0;''',
"death pause cleanup"
)

replace_once(
'''function reload(w=weapon){
 const a=ammoState[w],cap=maxMag(w);
 if(reloading||!a||a.mag===cap||a.reserve<=0||dying)return false;''',
'''function reload(w=weapon){
 const a=ammoState[w],cap=maxMag(w);
 if(paused||reloading||!a||a.mag===cap||a.reserve<=0||dying)return false;''',
"block reload while paused"
)

replace_once(
'''     reloadStartedAt=performance.now();reloadDurationMs=shellDuration;shellLoadS();
     setTimeout(()=>{''',
'''     reloadStartedAt=gameTimeNow();reloadDurationMs=shellDuration;shellLoadS();
     gameTimeout(()=>{''',
"pause-aware shotgun shell"
)

replace_once(
''' reloading=true;reloadStartedAt=performance.now();reloadDurationMs=duration;reloadWeapon=w;beginReloadMagazineFX();reloadS();show("RELOADING");
 setTimeout(()=>{''',
''' reloading=true;reloadStartedAt=gameTimeNow();reloadDurationMs=duration;reloadWeapon=w;beginReloadMagazineFX();reloadS();show("RELOADING");
 gameTimeout(()=>{''',
"pause-aware magazine reload"
)

replace_once(
'''function fire(){
 if(!running||reloading||dying||between)return;
 if(weapon==="awm"&&performance.now()<awmReadyAt){show("CYCLING BOLT");return}''',
'''function fire(){
 if(!running||paused||reloading||dying||between)return;
 if(weapon==="awm"&&gameTimeNow()<awmReadyAt){show("CYCLING BOLT");return}''',
"pause fire guard and awm clock"
)

replace_once(
''' A().mag--;if(weapon==="awm")awmReadyAt=performance.now()+1150;weaponSound();''',
''' A().mag--;if(weapon==="awm")awmReadyAt=gameTimeNow()+1150;weaponSound();''',
"awm game clock"
)

replace_once(
'''function triggerDown(){if(!running||dying||between)return;''',
'''function triggerDown(){if(!running||paused||dying||between)return;''',
"trigger pause guard"
)

replace_once(
'''function beginBreak(){
 if(between||dying)return;
 between=true;stopAuto();''',
'''function beginBreak(){
 if(between||dying)return;
 between=true;pauseBtn.classList.remove("show");stopAuto();''',
"hide pause button in shop"
)

replace_once(
''' document.body.style.cursor="";
 between=false;
 clearRoundCorpses();''',
''' document.body.style.cursor="";
 between=false;pauseBtn.classList.add("show");
 clearRoundCorpses();''',
"show pause button next wave"
)

replace_once(
'''function throwGrenade(){
 if(!running||dying||between||grenades<=0)return;''',
'''function throwGrenade(){
 if(!running||paused||dying||between||grenades<=0)return;''',
"grenade pause guard"
)

replace_once(
'''function detonateNuke(){
 if(!running||dying||between||nukeInProgress)return;''',
'''function detonateNuke(){
 if(!running||paused||dying||between||nukeInProgress)return;''',
"nuke pause guard"
)

replace_once(
''' setTimeout(()=>{
   if(nukeRun!==runSequence)return;''',
''' gameTimeout(()=>{
   if(nukeRun!==runSequence)return;''',
"pause-aware nuke timer"
)

replace_once(
'''function clearKeys(){for(let k in keys)keys[k]=false}

// Soft living-body collision:''',
'''function clearKeys(){for(let k in keys)keys[k]=false}
function setGamePaused(next){
 if(next){
   if(paused||!running||dying||between)return;
   paused=true;pauseStartedAt=performance.now();
   clearKeys();stopAuto();setAim(false);
   pauseOverlay.classList.add("show");pauseBtn.classList.remove("show");
   document.body.style.cursor="default";
   if(document.pointerLockElement===cv)document.exitPointerLock?.();
   if(ac&&ac.state==="running")ac.suspend().catch(()=>{});
   return;
 }
 if(!paused)return;
 const now=performance.now(),pausedFor=Math.max(0,now-pauseStartedAt);
 pausedAccumulatedMs+=pausedFor;pauseStartedAt=0;paused=false;last=now;
 pauseOverlay.classList.remove("show");
 if(running&&!dying&&!between)pauseBtn.classList.add("show");
 document.body.style.cursor="";
 if(ac&&audioOn)ac.resume().catch(()=>{});
 cv.focus();
 if(document.pointerLockElement!==cv){try{cv.requestPointerLock?.()}catch(_){}}
}
pauseBtn.addEventListener("click",()=>setGamePaused(true));
resumeGameBtn.addEventListener("click",()=>setGamePaused(false));

// Soft living-body collision:''',
"pause functions"
)

replace_once(
'''function frame(t){let dt=Math.min(.04,(t-last)/1000);last=t;update(dt);ren.render(scene,cam);requestAnimationFrame(frame)}requestAnimationFrame(frame);''',
'''function frame(t){let dt=Math.min(.04,(t-last)/1000);last=t;if(!paused)update(dt);ren.render(scene,cam);requestAnimationFrame(frame)}requestAnimationFrame(frame);''',
"freeze update loop"
)

replace_once(
'''function reset(){runSequence++;reloadSequence++;initAudio();stopAuto();clearKeys();runStartTime=performance.now();''',
'''function reset(){runSequence++;reloadSequence++;paused=false;pauseStartedAt=0;pausedAccumulatedMs=0;pauseOverlay.classList.remove("show");initAudio();stopAuto();clearKeys();runStartTime=gameTimeNow();''',
"reset pause clock"
)

replace_once(
'''startScreen.style.display="none";document.body.style.cursor="";running=true;spawnWave();ui();cv.focus();''',
'''startScreen.style.display="none";document.body.style.cursor="";running=true;pauseBtn.classList.add("show");spawnWave();ui();cv.focus();''',
"show pause button on start"
)

replace_once(
'''addEventListener("keydown",e=>{let k=e.key.toLowerCase();if(k in keys)keys[k]=true;if(k==="r"&&!e.repeat)reload();if(k==="g"&&!e.repeat)throwGrenade();if(k==="n"&&!e.repeat)detonateNuke();if(k==="1")setWeapon("rifle");if(k==="2")setWeapon("smg");if(k==="3")setWeapon("shotgun");if(k==="4")setWeapon("pistol");if(k==="5")setWeapon("dmr");if(k==="6")setWeapon("grenadeLauncher");if(k==="7")setWeapon("m240");if(k==="8")setWeapon("awm");if(["w","a","s","d","r","g","n","1","2","3","4","5","6","7","8","shift"].includes(k))e.preventDefault()});''',
'''addEventListener("keydown",e=>{let k=e.key.toLowerCase();if(k==="p"&&!e.repeat){setGamePaused(!paused);e.preventDefault();return}if(paused){if(["w","a","s","d","r","g","n","1","2","3","4","5","6","7","8","shift"].includes(k))e.preventDefault();return}if(k in keys)keys[k]=true;if(k==="r"&&!e.repeat)reload();if(k==="g"&&!e.repeat)throwGrenade();if(k==="n"&&!e.repeat)detonateNuke();if(k==="1")setWeapon("rifle");if(k==="2")setWeapon("smg");if(k==="3")setWeapon("shotgun");if(k==="4")setWeapon("pistol");if(k==="5")setWeapon("dmr");if(k==="6")setWeapon("grenadeLauncher");if(k==="7")setWeapon("m240");if(k==="8")setWeapon("awm");if(["w","a","s","d","r","g","n","1","2","3","4","5","6","7","8","shift"].includes(k))e.preventDefault()});''',
"pause keyboard"
)

replace_once(
'''addEventListener("keyup",e=>{let k=e.key.toLowerCase();if(k in keys)keys[k]=false});addEventListener("blur",()=>{clearKeys();stopAuto();setAim(false)});document.addEventListener("visibilitychange",()=>{if(document.hidden){clearKeys();stopAuto();setAim(false)}});''',
'''addEventListener("keyup",e=>{let k=e.key.toLowerCase();if(k in keys)keys[k]=false});addEventListener("blur",()=>{clearKeys();stopAuto();setAim(false);if(running&&!dying&&!between&&!paused)setGamePaused(true)});document.addEventListener("visibilitychange",()=>{if(document.hidden){clearKeys();stopAuto();setAim(false);if(running&&!dying&&!between&&!paused)setGamePaused(true)}});''',
"auto pause on focus loss"
)

replace_once(
'''   if(between){document.body.style.cursor="default";shop.style.cursor="default"}
   else if(running&&!dying)show("CLICK GAME TO LOCK AIM");''',
'''   if(between){document.body.style.cursor="default";shop.style.cursor="default"}
   else if(running&&!dying&&!paused)setGamePaused(true);''',
"escape pointer lock pause"
)

replace_once(
'''document.addEventListener("mousemove",e=>{if(document.pointerLockElement===cv){''',
'''document.addEventListener("mousemove",e=>{if(!paused&&document.pointerLockElement===cv){''',
"block look while paused"
)

replace_once(
'''document.addEventListener("mousedown",e=>{
 if(e.button===2){''',
'''document.addEventListener("mousedown",e=>{
 if(paused)return;
 if(e.button===2){''',
"block mouse while paused"
)

path.write_text(text,encoding="utf-8")
print("v146 true pause system applied")
