// CITY OUTBREAK input-state utilities.
// Pure helpers only: no DOM listeners or gameplay behavior in this module.
export function clearKeyState(keys){
 for(const key in keys)keys[key]=false;
}


export function setupGameContextMenuGuard({
 canvas,
 documentTarget=document
}){
 if(!canvas)return;
 canvas.addEventListener("contextmenu",event=>event.preventDefault());
 documentTarget.addEventListener("contextmenu",event=>{
  if(documentTarget.pointerLockElement===canvas)event.preventDefault();
 });
}
