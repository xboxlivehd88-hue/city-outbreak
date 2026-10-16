// CITY OUTBREAK v692: browser Pointer Lock may deliver sporadic giant deltas.
// Reject cursor warps and bound one-event rotation; preserve normal mouse feel.
export function createMouseLookGuard({
 maxEventDelta=180,
 dropEventDelta=1000,
 relockWindowMs=180,
 relockDropDelta=120
}={}){
 let lockedAt=-Infinity,dropped=0,limited=0;
 const reset=(now=performance.now())=>{lockedAt=now};
 const sample=(rawX,rawY,now=performance.now())=>{
  if(!Number.isFinite(rawX)||!Number.isFinite(rawY)){dropped++;return null}
  const peak=Math.max(Math.abs(rawX),Math.abs(rawY));
  // Browser recentering when regaining pointer lock is not physical motion.
  if(peak>=dropEventDelta||
     (now>=lockedAt&&now-lockedAt<relockWindowMs&&peak>relockDropDelta)){
   dropped++;return null;
  }
  if(peak>maxEventDelta){
   limited++;
   const ratio=maxEventDelta/peak;
   return{x:rawX*ratio,y:rawY*ratio,limited:true};
  }
  return{x:rawX,y:rawY,limited:false};
 };
 return{reset,sample,get dropped(){return dropped},get limited(){return limited}};
}
