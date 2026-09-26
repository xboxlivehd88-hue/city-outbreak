// CITY OUTBREAK performance HUD module.
// Extracted from the proven v260 runtime without changing gameplay behavior.
export function createPerformanceGuard({
 renderer,
 livingCount,
 getFxCounts,
 enabled=true,
 consoleLogging=false
}){
 let perfTick=0,perfFrames=0,perfTime=0,perfMaxMs=0,perfHud=null;
 if(enabled){
  perfHud=document.createElement("div");
  perfHud.style.cssText="position:fixed;left:14px;top:14px;z-index:99998;background:#050708dd;color:#dfe7ea;border:1px solid #ffffff25;border-radius:9px;padding:8px 10px;font:12px/1.45 monospace;pointer-events:none;white-space:pre";
  perfHud.textContent="PERFORMANCE\ncollecting...";
  document.body.appendChild(perfHud);
 }
 return function perfGuard(dt){
  if(!enabled)return;
  perfTick+=dt;perfTime+=dt;perfFrames++;perfMaxMs=Math.max(perfMaxMs,dt*1000);
  if(perfTick>=1){
   const fps=Math.round(perfFrames/Math.max(.001,perfTime)),avg=(perfTime/perfFrames*1000).toFixed(1),ri=renderer.info.render,liveCount=livingCount(),fx=getFxCounts();
   perfHud.textContent="PERFORMANCE\nFPS "+fps+"  AVG "+avg+"ms  MAX "+perfMaxMs.toFixed(1)+"ms\nDRAWS "+ri.calls+"  TRIANGLES "+ri.triangles+"\nZOMBIES "+liveCount+"  FX "+(fx.parts+fx.impacts+fx.casings)+"\nPIXEL RATIO "+renderer.getPixelRatio().toFixed(2);
   if(consoleLogging)console.log("CityOutbreak perf",{fps,avgMs:avg,maxMs:perfMaxMs.toFixed(1),zombies:liveCount,parts:fx.parts,impacts:fx.impacts,casings:fx.casings,renderer:ri});
   perfTick=0;perfFrames=0;perfTime=0;perfMaxMs=0;
  }
 };
}
