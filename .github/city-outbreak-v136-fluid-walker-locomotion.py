from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

def replace_once(old,new,label):
    global text
    count=text.count(old)
    if count!=1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text=text.replace(old,new,1)

# Store locomotion phase state on each rig. This layer runs after the embedded
# animation clip and corrects the rig's knee direction while syncing gait to
# actual distance travelled instead of a coarse five-key animation clock.
replace_once(
''' z.rigVisual=rig;z.mixer=mixer;z.rigActions=actions;z.rigBase=base;z.rigTransient=null;z.rigTransientT=0;z.rigMaterials=ownedRigMaterials;
 return true;
}
function setZombieLocomotion(z,wantsRun){''',
''' z.rigVisual=rig;z.mixer=mixer;z.rigActions=actions;z.rigBase=base;z.rigTransient=null;z.rigTransientT=0;z.rigMaterials=ownedRigMaterials;
 z.rigPolishPhase=(variant%4)*1.37;z.rigRunBlend=(kind==="sprinter"||kind==="infected"||kind==="acidic")?1:0;
 z.rigLastMoveX=g.position.x;z.rigLastMoveZ=g.position.z;
 const hips=rig.getObjectByName("Hips");z.rigHipsBaseY=hips?hips.position.y:.9;
 return true;
}
function applyRigLocomotionPolish(z,wantsRun,dt){
 if(!z||!z.rigVisual||z.leglessCrawler||z.kind==="boss")return;
 const naturalRunner=z.kind==="sprinter"||z.kind==="infected"||z.kind==="acidic";
 const runTarget=(wantsRun||naturalRunner)?1:0;
 z.rigRunBlend=Math.max(0,Math.min(1,(z.rigRunBlend||0)+(runTarget-(z.rigRunBlend||0))*Math.min(1,dt*4.2)));
 const rb=z.rigRunBlend;

 const gx=z.g.position.x,gz=z.g.position.z;
 const lastX=Number.isFinite(z.rigLastMoveX)?z.rigLastMoveX:gx,lastZ=Number.isFinite(z.rigLastMoveZ)?z.rigLastMoveZ:gz;
 const moved=Math.min(.45,Math.hypot(gx-lastX,gz-lastZ));
 z.rigLastMoveX=gx;z.rigLastMoveZ=gz;
 // About 1.4 m per full walk cycle and 2.4 m per full run cycle.
 const radPerM=4.45+(2.62-4.45)*rb;
 if(moved>.00015)z.rigPolishPhase=(z.rigPolishPhase||0)+moved*radPerM;
 const p=z.rigPolishPhase||0,s=Math.sin(p),c=Math.cos(p);

 const lUpper=rigBone(z,"L_UpperLeg"),rUpper=rigBone(z,"R_UpperLeg"),
       lLower=rigBone(z,"L_LowerLeg"),rLower=rigBone(z,"R_LowerLeg"),
       lFoot=rigBone(z,"L_Foot"),rFoot=rigBone(z,"R_Foot"),
       lArm=rigBone(z,"L_UpperArm"),rArm=rigBone(z,"R_UpperArm"),
       hips=rigBone(z,"Hips"),spine=rigBone(z,"Spine"),chest=rigBone(z,"Chest"),head=rigBone(z,"Head");

 // Correct anatomy: on this skeleton negative lower-leg X bends the knee backward.
 // The embedded Shamble/Sprint clips used positive X, which visually hyperextended them.
 const thighAmp=.27+(.62-.27)*rb;
 if(lUpper)lUpper.rotation.x=s*thighAmp;
 if(rUpper)rUpper.rotation.x=-s*thighAmp;
 const lf=Math.max(0,Math.sin(p+.68)),rf=Math.max(0,Math.sin(p+Math.PI+.68));
 const lFlex=lf*lf,rFlex=rf*rf;
 const kneeBase=.045+.035*rb,kneeAmp=.34+.46*rb;
 if(lLower)lLower.rotation.x=-(kneeBase+lFlex*kneeAmp);
 if(rLower)rLower.rotation.x=-(kneeBase+rFlex*kneeAmp);
 if(lFoot)lFoot.rotation.x=(kneeBase+lFlex*kneeAmp)*.42-.035*rb;
 if(rFoot)rFoot.rotation.x=(kneeBase+rFlex*kneeAmp)*.42-.035*rb;

 // Two small rises per stride make the hips feel weight-bearing rather than sliding.
 if(hips){
   hips.position.y=(z.rigHipsBaseY||.9)+(0.008+.020*rb)*(1-Math.cos(p*2))*.5;
   hips.rotation.z=s*(.008+.018*rb);
 }
 if(spine){spine.rotation.y+=s*(.018+.028*rb);spine.rotation.z+=c*(.010+.014*rb)}
 if(chest){chest.rotation.y-=s*(.014+.023*rb);chest.rotation.z-=c*(.008+.012*rb)}
 if(head){head.rotation.z+=s*(.008+.012*rb)}

 // The old Sprint clip kept both arms mostly forward. Pump opposite the legs so
 // final-five walkers actually read as running, while preserving Attack/Hit poses.
 if((z.rigTransientT||0)<=0){
   const armBase=.20+.02*rb,armAmp=.09+.35*rb;
   if(lArm)lArm.rotation.x=armBase-s*armAmp;
   if(rArm)rArm.rotation.x=armBase+s*armAmp;
 }
}
function setZombieLocomotion(z,wantsRun){''',
"locomotion polish helper"
)

# Apply the correction after the mixer writes its keyframes so the new anatomical
# leg pose wins, while Attack/Hit upper-body clips remain intact.
replace_once(
''' if(z.rigBase)z.rigBase.timeScale=rigScale;
 if(z.rigTransientT>0){z.rigTransientT-=dt;if(z.rigTransientT<=0){if(z.rigTransient)z.rigTransient.fadeOut(.08);if(z.rigBase)z.rigBase.reset().fadeIn(.10).play();z.rigTransient=null;}}
 z.mixer.update(dt);
}''',
''' if(z.rigBase)z.rigBase.timeScale=rigScale;
 if(z.rigTransientT>0){z.rigTransientT-=dt;if(z.rigTransientT<=0){if(z.rigTransient)z.rigTransient.fadeOut(.08);if(z.rigBase)z.rigBase.reset().fadeIn(.10).play();z.rigTransient=null;}}
 z.mixer.update(dt);
 applyRigLocomotionPolish(z,huntRun,dt);
}''',
"apply locomotion polish"
)

# Reset rig root/hip offsets before ragdoll so death physics starts from a clean
# world pose rather than carrying a gait bob into the collapse.
replace_once(
'''function beginRagdoll(z,force=1,blastOrigin=null){
 if(z.ragdoll)return;
 if(z.mixer)z.mixer.stopAllAction();
 z.g.rotation.order="YXZ";z.falling=true;''',
'''function beginRagdoll(z,force=1,blastOrigin=null){
 if(z.ragdoll)return;
 if(z.mixer)z.mixer.stopAllAction();
 if(z.rigVisual&&!z.leglessCrawler){
   z.rigVisual.position.y=0;
   const hips=rigBone(z,"Hips");if(hips&&Number.isFinite(z.rigHipsBaseY))hips.position.y=z.rigHipsBaseY;
 }
 z.g.rotation.order="YXZ";z.falling=true;''',
"ragdoll locomotion reset"
)

path.write_text(text,encoding="utf-8")
print("v136 fluid walker locomotion patch applied")
