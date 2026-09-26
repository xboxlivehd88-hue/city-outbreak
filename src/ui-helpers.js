// CITY OUTBREAK DOM-only UI helpers.
// Keeps transient message timing out of the main gameplay runtime.
const transientMessageTimers=new WeakMap();

export function showTransientMessage(element,text,duration=1000){
 element.textContent=text;
 element.classList.add("show");
 const previous=transientMessageTimers.get(element);
 if(previous)clearTimeout(previous);
 const timer=setTimeout(()=>{
  element.classList.remove("show");
  transientMessageTimers.delete(element);
 },duration);
 transientMessageTimers.set(element,timer);
}

export function clearTransientMessage(element){
 const timer=transientMessageTimers.get(element);
 if(timer)clearTimeout(timer);
 transientMessageTimers.delete(element);
 element.classList.remove("show");
}


export function setupControlsModal({
 modal=document.querySelector("#controlsModal"),
 openButton=document.querySelector("#showControls"),
 closeButton=document.querySelector("#closeControls")
}={}){
 if(!modal||!openButton||!closeButton)return;
 const setOpen=open=>{
  modal.classList.toggle("show",open);
  modal.setAttribute("aria-hidden",open?"false":"true");
  if(open)closeButton.focus();
  else openButton.focus();
 };
 openButton.onclick=()=>setOpen(true);
 closeButton.onclick=()=>setOpen(false);
 modal.addEventListener("click",event=>{
  if(event.target===modal)setOpen(false);
 });
}


export function setupResetButtons(resetHandler,{
 startButton=document.querySelector("#start"),
 restartButton=document.querySelector("#restart"),
 deathRestartButton=document.querySelector("#deathRestart")
}={}){
 if(startButton)startButton.onclick=resetHandler;
 if(restartButton)restartButton.onclick=resetHandler;
 if(deathRestartButton)deathRestartButton.onclick=resetHandler;
}


export function setupPauseButtons(setPaused,{
 pauseButton=document.querySelector("#pauseBtn"),
 resumeButton=document.querySelector("#resumeGame")
}={}){
 if(pauseButton)pauseButton.addEventListener("click",()=>setPaused(true));
 if(resumeButton)resumeButton.addEventListener("click",()=>setPaused(false));
}
