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


export function setupFocusSafety({
 onFocusLost,
 windowTarget=window,
 documentTarget=document
}){
 if(typeof onFocusLost!=="function")return;
 windowTarget.addEventListener("blur",onFocusLost);
 documentTarget.addEventListener("visibilitychange",()=>{
  if(documentTarget.hidden)onFocusLost();
 });
}


export function setupPointerLockChange(handler,{
 documentTarget=document
}={}){
 if(typeof handler!=="function")return;
 documentTarget.addEventListener("pointerlockchange",handler);
}


export function setupKeyUp(handler,{
 windowTarget=window
}={}){
 if(typeof handler!=="function")return;
 windowTarget.addEventListener("keyup",handler);
}


export function setupKeyDown(handler,{
 windowTarget=window
}={}){
 if(typeof handler!=="function")return;
 windowTarget.addEventListener("keydown",handler);
}


export function setupMouseMove(handler,{
 documentTarget=document
}={}){
 if(typeof handler!=="function")return;
 documentTarget.addEventListener("mousemove",handler);
}


export function setupMouseActions({
 onMouseDown,
 onMouseUp,
 onPointerCancel,
 documentTarget=document
}){
 if(typeof onMouseDown==="function")documentTarget.addEventListener("mousedown",onMouseDown);
 if(typeof onMouseUp==="function")documentTarget.addEventListener("mouseup",onMouseUp);
 if(typeof onPointerCancel==="function")documentTarget.addEventListener("pointercancel",onPointerCancel);
}
