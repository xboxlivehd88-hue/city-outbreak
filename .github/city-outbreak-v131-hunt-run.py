from pathlib import Path

path = Path("index.html")
text = path.read_text(encoding="utf-8")

def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text = text.replace(old, new, 1)

# Add a lightweight locomotion switch that reuses the rig's existing Sprint clip.
# Walkers cross-fade only when hunt mode activates; natural sprinters remain unchanged.
replace_once(
''' z.rigVisual=rig;z.mixer=mixer;z.rigActions=actions;z.rigBase=base;z.rigTransient=null;z.rigTransientT=0;z.rigMaterials=ownedRigMaterials;
 return true;
}
function releaseZombieVisual(z){''',
''' z.rigVisual=rig;z.mixer=mixer;z.rigActions=actions;z.rigBase=base;z.rigTransient=null;z.rigTransientT=0;z.rigMaterials=ownedRigMaterials;
 return true;
}
function setZombieLocomotion(z,wantsRun){
 if(!z||!z.rigActions)return;
 const naturalRunner=z.kind==="sprinter"||z.kind==="infected"||z.kind==="acidic";
 const desiredName=(wantsRun||naturalRunner)?"Sprint":"Shamble";
 const desired=z.rigActions[desiredName]||z.rigActions.Shamble||z.rigActions.Idle;
 if(!desired||z.rigBase===desired)return;
 const previous=z.rigBase;z.rigBase=desired;
 // Attack/flinch clips own the skeleton briefly. Updating rigBase here makes the
 // correct locomotion resume as soon as the transient animation finishes.
 if(z.rigTransientT>0)return;
 if(previous)previous.fadeOut(.18);
 desired.reset();desired.enabled=true;desired.setLoop(THREE.LoopRepeat,Infinity);desired.fadeIn(.18).play();
}
function releaseZombieVisual(z){''',
'locomotion helper'
)

# Compute hunt mode before the mixer update, switch walkers to Sprint, and match the
# playback rate to the already-tuned final-five rush without changing movement speed.
replace_once(
'''z.cool=Math.max(0,z.cool-dt);z.stagger=Math.max(0,(z.stagger||0)-dt);z.attackAnim=Math.max(0,z.attackAnim-dt);
if(z.mixer){
 const rigScale=(z.kind==="sprinter"||z.kind==="infected"||z.kind==="acidic")?Math.max(.95,z.speed*.74):z.kind==="boss"?Math.max(.58,z.speed*.54):Math.max(.66,z.speed*.61);
 if(z.rigBase)z.rigBase.timeScale=rigScale;
 if(z.rigTransientT>0){z.rigTransientT-=dt;if(z.rigTransientT<=0){if(z.rigTransient)z.rigTransient.fadeOut(.08);if(z.rigBase)z.rigBase.reset().fadeIn(.10).play();z.rigTransient=null;}}
 z.mixer.update(dt);
}
z.groan-=dt;z.step-=dt;z.surgeT-=dt;z.pauseClock-=dt;
let animRate=0;
if(z.pauseClock<=0){z.pauseClock=1.1+rnd()*3.2;if(rnd()<.22)z.stagger=Math.max(z.stagger,.10+rnd()*.12)}
if(z.surgeT<=0){z.surgeT=.65+rnd()*1.7;z.zig*=-1}z.think-=dt;
z.avoidT=Math.max(0,(z.avoidT||0)-dt);z.navFlipCooldown=Math.max(0,(z.navFlipCooldown||0)-dt);
const playerDistToZombie=Math.hypot(px-z.g.position.x,pz-z.g.position.z);
const huntMode=highlightLast&&z.kind!=="boss";
if(z.kind!=="boss")updateZombieRoute(z,dt,huntMode);''',
'''z.cool=Math.max(0,z.cool-dt);z.stagger=Math.max(0,(z.stagger||0)-dt);z.attackAnim=Math.max(0,z.attackAnim-dt);
const playerDistToZombie=Math.hypot(px-z.g.position.x,pz-z.g.position.z);
const huntMode=highlightLast&&z.kind!=="boss";
const huntRun=huntMode&&z.kind!=="crawler"&&z.kind!=="boss";
if(z.mixer){
 setZombieLocomotion(z,huntRun);
 const naturalRunner=z.kind==="sprinter"||z.kind==="infected"||z.kind==="acidic";
 const huntRigScale=playerDistToZombie>32?1.44:playerDistToZombie>16?1.34:1.24;
 const rigScale=huntRun&&!naturalRunner?huntRigScale:naturalRunner?Math.max(.95,z.speed*.74):z.kind==="boss"?Math.max(.58,z.speed*.54):Math.max(.66,z.speed*.61);
 if(z.rigBase)z.rigBase.timeScale=rigScale;
 if(z.rigTransientT>0){z.rigTransientT-=dt;if(z.rigTransientT<=0){if(z.rigTransient)z.rigTransient.fadeOut(.08);if(z.rigBase)z.rigBase.reset().fadeIn(.10).play();z.rigTransient=null;}}
 z.mixer.update(dt);
}
z.groan-=dt;z.step-=dt;z.surgeT-=dt;z.pauseClock-=dt;
let animRate=0;
if(z.pauseClock<=0){z.pauseClock=1.1+rnd()*3.2;if(rnd()<.22)z.stagger=Math.max(z.stagger,.10+rnd()*.12)}
if(z.surgeT<=0){z.surgeT=.65+rnd()*1.7;z.zig*=-1}z.think-=dt;
z.avoidT=Math.max(0,(z.avoidT||0)-dt);z.navFlipCooldown=Math.max(0,(z.navFlipCooldown||0)-dt);
if(z.kind!=="boss")updateZombieRoute(z,dt,huntMode);''',
'hunt run animation switch'
)

path.write_text(text, encoding="utf-8")
print("v131 hunt run animation patch applied")
