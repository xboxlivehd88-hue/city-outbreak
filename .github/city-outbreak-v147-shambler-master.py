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
'''function rigTransient(z,name,hold=.34){
 if(!z.rigActions||!z.rigActions[name])return;
 const a=z.rigActions[name],base=z.rigBase;
 if(z.rigTransient&&z.rigTransient!==a)z.rigTransient.stop();
 if(base)base.fadeOut(.055);
 a.reset();a.enabled=true;a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;a.fadeIn(.05);a.play();
 z.rigTransient=a;z.rigTransientT=hold;
}
function attachRiggedZombie(z,g,kind,variant=0,hazardMist=null){''',
'''function rigTransient(z,name,hold=.34){
 if(!z.rigActions||!z.rigActions[name])return;
 const a=z.rigActions[name],base=z.rigBase;
 if(z.rigTransient&&z.rigTransient!==a)z.rigTransient.stop();
 if(base)base.fadeOut(.055);
 a.reset();a.enabled=true;a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;a.fadeIn(.05);a.play();
 z.rigTransient=a;z.rigTransientT=hold;
}

// v147: the Shambler is the master standing-zombie model. Every standing type
// clones the same skinned rig/geometry, then reads only lightweight profile
// overrides. We never load a separate full model for Sprinter/Radiated/Infected/
// Acidic/Boss. Empty overrides currently preserve the exact v146 appearance.
const SHAMBLER_RIG_PROFILE=Object.freeze({
 rigScale:1.02,
 headYOffset:-.010,
 headScale:Object.freeze([1.03,1.04,1.01]),
 neckScale:Object.freeze([1.06,1,1.06]),
 chestScale:Object.freeze([1.07,1,1.07]),
 spineScale:Object.freeze([1.045,1,1.045]),
 upperArmScale:Object.freeze([1.065,1,1.065]),
 lowerArmScale:Object.freeze([1.045,1,1.045]),
 upperLegScale:Object.freeze([1.055,1,1.055]),
 lowerLegScale:Object.freeze([1.04,1,1.04])
});
function derivedRigProfile(overrides={}){
 return Object.freeze(Object.assign(Object.create(SHAMBLER_RIG_PROFILE),overrides));
}
const ZOMBIE_RIG_PROFILES=Object.freeze({
 shambler:SHAMBLER_RIG_PROFILE,
 sprinter:derivedRigProfile(),
 radiated:derivedRigProfile(),
 infected:derivedRigProfile(),
 acidic:derivedRigProfile(),
 boss:derivedRigProfile()
});
function cloneShamblerRig(){
 return zombieRigAsset?SkeletonUtils.clone(zombieRigAsset.scene):null;
}
function applyZombieRigProfile(rig,kind){
 const p=ZOMBIE_RIG_PROFILES[kind]||SHAMBLER_RIG_PROFILE;
 rig.scale.setScalar(p.rigScale);

 const neckBone=rig.getObjectByName("Neck"),headBone=rig.getObjectByName("Head"),
       chestBone=rig.getObjectByName("Chest"),spineBone=rig.getObjectByName("Spine");
 if(headBone){headBone.position.y+=p.headYOffset;headBone.scale.set(...p.headScale)}
 if(neckBone)neckBone.scale.set(...p.neckScale);
 if(chestBone)chestBone.scale.set(...p.chestScale);
 if(spineBone)spineBone.scale.set(...p.spineScale);
 for(const nm of ["L_UpperArm","R_UpperArm"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(...p.upperArmScale)}
 for(const nm of ["L_LowerArm","R_LowerArm"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(...p.lowerArmScale)}
 for(const nm of ["L_UpperLeg","R_UpperLeg"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(...p.upperLegScale)}
 for(const nm of ["L_LowerLeg","R_LowerLeg"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(...p.lowerLegScale)}
 return{neckBone,headBone,chestBone,spineBone,profile:p};
}
function attachRiggedZombie(z,g,kind,variant=0,hazardMist=null){''',
"shambler master profile architecture"
)

replace_once(
''' const rig=SkeletonUtils.clone(zombieRigAsset.scene);
 rig.name="RiggedZombieVisual";
 rig.position.set(0,0,0);
 rig.scale.setScalar(1.02);''',
''' const rig=cloneShamblerRig();
 if(!rig)return false;
 rig.name="RiggedZombieVisual";
 rig.position.set(0,0,0);''',
"clone shambler master rig"
)

replace_once(
''' // v132 walker geometry/readability pass. The original rig left too much daylight
 // between the skull and torso. Pull the head down, bulk the major joints slightly,
 // then add a real neck bridge and a rounded clavicle/chest mass.
 const neckBone=rig.getObjectByName("Neck"),headBone=rig.getObjectByName("Head"),
       chestBone=rig.getObjectByName("Chest"),spineBone=rig.getObjectByName("Spine");
 if(headBone){headBone.position.y-=.010;headBone.scale.set(1.03,1.04,1.01)}
 if(neckBone)neckBone.scale.set(1.06,1,1.06);
 if(chestBone)chestBone.scale.set(1.07,1,1.07);
 if(spineBone)spineBone.scale.set(1.045,1,1.045);
 for(const nm of ["L_UpperArm","R_UpperArm"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(1.065,1,1.065)}
 for(const nm of ["L_LowerArm","R_LowerArm"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(1.045,1,1.045)}
 for(const nm of ["L_UpperLeg","R_UpperLeg"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(1.055,1,1.055)}
 for(const nm of ["L_LowerLeg","R_LowerLeg"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(1.04,1,1.04)}''',
''' // Apply the Shambler baseline first. Future zombie types only override the
 // measurements that actually differ, so all shared geometry stays shared.
 const {neckBone,headBone,chestBone,spineBone,profile:rigProfile}=applyZombieRigProfile(rig,kind);
 z.visualBaseKind="shambler";
 z.visualProfileKind=kind;
 z.rigVisualProfile=rigProfile;''',
"apply shambler-derived rig profile"
)

path.write_text(text,encoding="utf-8")
print("v147 shambler master-model architecture applied")
