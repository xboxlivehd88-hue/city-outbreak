// CITY OUTBREAK v698 — intentionally non-gameplay, original source-arm reference.
// The SAME extended wrist and elbow targets are used for all seven guns.
// H restores the exact existing grip controller; J reveals palm axes in 90° steps.
export function createArmsInspector(onChanged){
 let enabled=true,quarter=0,weaponVisible=false;
 const el=document.createElement("div");
 el.id="fps-arms-orientation-reference";
 el.style.cssText="position:fixed;left:50%;top:10%;transform:translateX(-50%);z-index:250;pointer-events:none;background:rgba(8,15,20,.82);border:1px solid #9cabb9;border-radius:6px;color:white;font:600 13px/1.5 Arial,sans-serif;padding:7px 12px;text-align:center;text-shadow:0 1px 2px black;max-width:90vw";
 document.body.appendChild(el);
 const update=(weapon="")=>{
  el.style.display=enabled?"block":"none";
  const label="ORIGINAL ARMS EXTENDED · "+weapon.toUpperCase()+" · wrist "+quarter*90+"° · H: normal grip · J: turn hands · K: "+(weaponVisible?"hide":"show")+" gun · 1–7: guns";
  if(enabled&&el.textContent!==label)el.textContent=label;
  document.documentElement.dataset.fpsArmsInspectionMode=enabled?"extended":"normal";
  document.documentElement.dataset.fpsArmsInspectionRotation=String(quarter*90);
 };
 const set=next=>{
  if(!!next!==enabled){enabled=!!next;onChanged?.()}
  update();
 };
 const turn=q=>{quarter=((q%4)+4)%4;update()};
 const toggleWeapon=()=>{weaponVisible=!weaponVisible;onChanged?.();update()};
 update();
 return{get enabled(){return enabled},get quarter(){return quarter},get weaponVisible(){return weaponVisible},set,turn,toggleWeapon,update,
  state:()=>({mode:enabled?"extended":"normal",turn:quarter*90,weaponVisible})};
}
