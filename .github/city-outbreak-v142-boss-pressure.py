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
'''function bossScaleFactor(w){return Math.pow(1.1,bossTier(w))}
function nextBossName(){''',
'''function bossScaleFactor(w){return Math.pow(1.1,bossTier(w))}
const BOSS_CHARGE_MAX_RANGE=32,BOSS_CHARGE_SPEED=7.6;
function bossPressureSpeed(dist,base){
 // A boss should eventually close on a player who only walks backward, but full
 // 9 m/s sprint remains a clean escape. Pressure eases as the boss gets close so
 // Slam / normal attacks still have readable timing.
 if(dist>28)return Math.max(base,6.0);
 if(dist>18)return Math.max(base,5.55);
 if(dist>10)return Math.max(base,4.65);
 return base;
}
function nextBossName(){''',
"boss pressure constants"
)

replace_once(
'''function startBossCharge(z){
 z.bossAttackState="charge";z.bossAttackT=1.45;z.bossChargeHit=false;
 show((z.bossName||"BOSS")+" — GORE RUSH");
 tone(72,.30,"square",.22);rigTransient(z,"Attack",.55)
}''',
'''function startBossCharge(z,dist=17){
 // Longer rushes from farther away let Gore Rush function as a gap closer instead
 // of only triggering after the boss has already reached the player.
 const extra=Math.min(1.0,Math.max(0,dist-10)*.045);
 z.bossAttackState="charge";z.bossAttackT=1.55+extra;z.bossChargeHit=false;
 show((z.bossName||"BOSS")+" — GORE RUSH");
 tone(72,.30,"square",.22);rigTransient(z,"Attack",.55)
}''',
"long range charge duration"
)

replace_once(
''' }else if(z.bossSpecialCd<=0){
   if(dist<5.4)startBossSlam(z);
   else if(dist<17)startBossCharge(z);
 }
}''',
''' }else if(z.bossSpecialCd<=0){
   if(dist<5.4)startBossSlam(z);
   else if(dist<BOSS_CHARGE_MAX_RANGE)startBossCharge(z,dist);
 }
}''',
"long range boss special trigger"
)

replace_once(
''' const huntRigScale=playerDistToZombie>32?1.44:playerDistToZombie>16?1.34:1.24;
 const rigScale=huntRun&&!naturalRunner?huntRigScale:naturalRunner?Math.max(.95,z.speed*.74):z.kind==="boss"?Math.max(.58,z.speed*.54):Math.max(.66,z.speed*.61);
 if(z.rigBase)z.rigBase.timeScale=rigScale;''',
''' const huntRigScale=playerDistToZombie>32?1.44:playerDistToZombie>16?1.34:1.24;
 const bossRigScale=z.kind==="boss"?
   (z.bossAttackState==="charge"?2.05:playerDistToZombie>28?1.72:playerDistToZombie>18?1.56:playerDistToZombie>10?1.38:Math.max(.58,z.speed*.54)):1;
 const rigScale=huntRun&&!naturalRunner?huntRigScale:naturalRunner?Math.max(.95,z.speed*.74):z.kind==="boss"?bossRigScale:Math.max(.66,z.speed*.61);
 if(z.rigBase)z.rigBase.timeScale=rigScale;''',
"boss locomotion animation sync"
)

replace_once(
''' let zig=Math.sin(z.phase*.55)*z.strafe*z.zig*.28,
 surge=1+(Math.sin(z.phase*1.35)>.72?z.surge*0.6:0),
 shamble=(z.nightmareType==="twitch"?1.00:z.nightmareType==="brute"?.88:z.nightmareType==="crawler"?.90:.84)
          +Math.max(0,Math.sin(z.phase*z.gait))*(z.nightmareType==="twitch"?.22:.14)*z.lurch,
 stun=z.stagger>0?(kind==="boss"?.72:.18):1,
 limpSlow=Math.max(.42,1-z.legDamage*.18-z.limp*.08);
 if(kind==="boss"&&z.bossAttackState==="charge")surge*=2.35;
 if(kind==="boss"&&z.bossAttackState==="slam")stun*=.05;
 let ox=z.g.position.x,oz=z.g.position.z;
 // Final-five rush: all remaining zombies move fast enough to pressure the player,
 // but are hard-capped below the player's 9 m/s full sprint.
 const huntTargetSpeed=playerDistToZombie>32?5.8:playerDistToZombie>16?5.4:5.0;
 const navSpeed=huntMode?Math.min(6.15,Math.max(huntTargetSpeed,z.speed)):z.speed;
 const motionScale=huntMode?1:surge*shamble;
let stepX=(nx+sx*zig)*navSpeed*motionScale*stun*limpSlow*dt,stepZ=(nz+sz*zig)*navSpeed*motionScale*stun*limpSlow*dt;''',
''' let zig=Math.sin(z.phase*.55)*z.strafe*z.zig*.28,
 surge=1+(Math.sin(z.phase*1.35)>.72?z.surge*0.6:0),
 shamble=(z.nightmareType==="twitch"?1.00:z.nightmareType==="brute"?.88:z.nightmareType==="crawler"?.90:.84)
          +Math.max(0,Math.sin(z.phase*z.gait))*(z.nightmareType==="twitch"?.22:.14)*z.lurch,
 stun=z.stagger>0?(kind==="boss"?.72:.18):1,
 limpSlow=Math.max(.42,1-z.legDamage*.18-z.limp*.08);
 const bossCharging=kind==="boss"&&z.bossAttackState==="charge";
 const bossPressuring=kind==="boss"&&!z.bossAttackState&&playerDistToZombie>10;
 if(kind==="boss"&&z.bossAttackState==="slam")stun*=.05;
 let ox=z.g.position.x,oz=z.g.position.z;
 // Final-five rush remains capped below the player's 9 m/s sprint. Boss pressure
 // uses the same principle: it beats walking, but a committed full sprint escapes.
 const huntTargetSpeed=playerDistToZombie>32?5.8:playerDistToZombie>16?5.4:5.0;
 let navSpeed=huntMode?Math.min(6.15,Math.max(huntTargetSpeed,z.speed)):z.speed;
 if(kind==="boss")navSpeed=bossCharging?BOSS_CHARGE_SPEED:bossPressureSpeed(playerDistToZombie,z.speed);
 const motionScale=(huntMode||bossCharging||bossPressuring)?1:surge*shamble;
let stepX=(nx+sx*zig)*navSpeed*motionScale*stun*limpSlow*dt,stepZ=(nz+sz*zig)*navSpeed*motionScale*stun*limpSlow*dt;''',
"boss pressure movement"
)

path.write_text(text,encoding="utf-8")
print("v142 boss pursuit pressure patch applied")
