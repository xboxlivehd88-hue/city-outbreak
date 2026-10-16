// CITY OUTBREAK v700 — original 47-bone open arms WITH the selected real gun visible.
// The SAME extended wrist and elbow targets are used for all seven guns.
// H restores the exact existing grip controller; J reveals palm axes in 90° steps.
export function createArmsInspector(onChanged){
 // Default to BOTH native ungripped hands and the unchanged real firearm on screen.
 let enabled=false,quarter=0,weaponVisible=true; // v701 calibrated grips default; H for open source
 const el=document.createElement("div");
 el.id="fps-arms-orientation-reference";
 el.style.cssText="position:fixed;left:50%;top:10%;transform:translateX(-50%);z-index:250;pointer-events:none;background:rgba(8,15,20,.82);border:2px solid #f3a855;border-radius:6px;color:white;font:600 13px/1.5 Arial,sans-serif;padding:7px 12px;text-align:center;text-shadow:0 1px 2px black;max-width:90vw";
 document.body.appendChild(el);
 const update=(weapon="")=>{
  el.style.display=enabled?"block":"none";
  const label="INSPECTION ONLY — HANDS NOT GRIPPING · "+weapon.toUpperCase()+" · WRIST "+quarter*90+"° · PRESS H FOR REAL GRIP · J: turn · K: "+(weaponVisible?"hide":"show")+" gun";
  if(enabled&&el.textContent!==label)el.textContent=label;
  document.documentElement.dataset.fpsArmsInspectionMode=enabled?"extended":"normal";
  document.documentElement.dataset.fpsArmsInspectionRotation=String(quarter*90);
  document.documentElement.dataset.fpsArmsInspectionWeaponVisible=String(weaponVisible);
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
