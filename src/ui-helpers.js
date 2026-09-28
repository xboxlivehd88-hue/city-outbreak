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


export function renderBossHud({bossHUD,bossNameEl,bossSubEl,bossFill,boss,wave}){
 if(boss&&!boss.dead&&boss.g.parent){
  bossHUD.classList.add("show");
  bossNameEl.textContent=boss.bossName||"BOSS";
  bossSubEl.textContent="WAVE "+wave+" BOSS FIGHT";
  bossFill.style.width=Math.max(0,Math.min(100,boss.hp/boss.maxHP*100))+"%";
 }else{
  bossHUD.classList.remove("show");
 }
}


export function hideBossHud(bossHUD){
 if(bossHUD)bossHUD.classList.remove("show");
}


export function renderSprintHud({
 sprintFill,
 sprintState,
 energy,
 locked,
 previousPct=-1,
 previousColor="",
 previousState=""
}){
 const pct=Math.max(0,Math.min(100,energy));
 const shown=Math.ceil(pct);
 const color=pct>55?"#58b96a":pct>25?"#d5ad45":"#c64646";
 const state=locked?"RECOVERING":pct>=99?"READY":shown+"%";
 if(shown!==previousPct)sprintFill.style.width=shown+"%";
 if(color!==previousColor)sprintFill.style.background=color;
 if(state!==previousState)sprintState.textContent=state;
 return {pct:shown,color,state};
}


export function renderMainHud({elements,values}){
 const {
  healthText,healthBar,ammoEl,killsEl,headsEl,waveEl,remainingEl,
  cashEl,shopCash,weaponNameEl,grenadeEl,nukeEl
 }=elements;
 healthText.textContent=values.healthText;
 healthBar.style.width=values.healthWidth;
 healthBar.style.background=values.healthColor;
 ammoEl.textContent=values.ammoText;
 killsEl.textContent=values.killsText;
 headsEl.textContent=values.headsText;
 waveEl.textContent=values.waveText;
 remainingEl.textContent=values.remainingText;
 cashEl.textContent=values.cashText;
 shopCash.textContent=values.cashText;
 weaponNameEl.textContent=values.weaponText;
 grenadeEl.textContent=values.grenadeText;
 nukeEl.textContent=values.nukeText;
}


export function renderDeathStats({kills,time,wave,rounds},{
 killsEl=document.querySelector("#deathKills"),
 timeEl=document.querySelector("#deathTime"),
 waveEl=document.querySelector("#deathWave"),
 roundsEl=document.querySelector("#deathRounds")
}={}){
 if(killsEl)killsEl.textContent=kills;
 if(timeEl)timeEl.textContent=time;
 if(waveEl)waveEl.textContent=wave;
 if(roundsEl)roundsEl.textContent=rounds;
}


export function showAnnouncement({container,titleEl,subtitleEl,title,subtitle}){
 titleEl.textContent=title;
 subtitleEl.textContent=subtitle;
 container.classList.add("show");
}

export function hideAnnouncement(container){
 container.classList.remove("show");
}


export function setupReadyNextButton(readyHandler,{
 readyButton=document.querySelector("#readyNext")
}={}){
 if(readyButton)readyButton.addEventListener("click",readyHandler);
}


export function setupShopBuyButtons(shopElement,buyHandler){
 if(!shopElement)return;
 shopElement.querySelectorAll("[data-buy]").forEach(button=>{
  button.addEventListener("click",()=>buyHandler(button.dataset.buy));
 });
}


export function showRuntimeErrorOverlay(message,{
 root=document.body
}={}){
 const errorBox=document.createElement("div");
 errorBox.style.cssText="position:fixed;left:12px;bottom:12px;z-index:99999;background:rgba(120,0,0,.92);color:white;padding:10px 12px;font:13px monospace;max-width:70vw;border:1px solid #fff";
 errorBox.textContent="GAME ERROR: "+message;
 root.appendChild(errorBox);
}


export function setupRuntimeErrorListener(handler,{
 windowTarget=window
}={}){
 if(typeof handler!=="function")return;
 windowTarget.addEventListener("error",handler);
}


export function flashDamageOverlay(element,duration=140){
 if(!element)return;
 element.classList.add("show");
 setTimeout(()=>element.classList.remove("show"),duration);
}


export function renderShopNote(element,text){
 if(!element)return;
 element.textContent=text;
}


export function renderPauseUi({pauseOverlay,pauseButton,paused,showPauseButton}){
 if(pauseOverlay){
  if(paused)pauseOverlay.classList.add("show");
  else pauseOverlay.classList.remove("show");
 }
 if(pauseButton){
  if(showPauseButton)pauseButton.classList.add("show");
  else pauseButton.classList.remove("show");
 }
}


export function renderDeathScreenVisibility(element,visible){
 if(!element)return;
 if(visible)element.classList.add("show");
 else element.classList.remove("show");
}
