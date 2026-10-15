// CITY OUTBREAK performance HUD module.
// Measures and displays runtime performance without owning gameplay behavior.
export function createPerformanceGuard({
 renderer,
 livingCount,
 getFxCounts,
 getTimings=()=>null,
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
   const p=getTimings();
   const fmt=n=>Number.isFinite(n)?n.toFixed(1):"–";
   perfHud.textContent="PERFORMANCE\nFPS "+fps+
    "  AVG "+avg+"ms  MAX "+perfMaxMs.toFixed(1)+"ms"+
    "\nDRAWS "+ri.calls+"  TRIANGLES "+ri.triangles+
    "\nZOMBIES "+liveCount+"  FX "+(fx.parts+fx.impacts+fx.casings)+
    "\nEXPLOSIONS "+(fx.bursts||0)+"  SMOKE/FIRE "+(fx.batchedSprites||0)+" IN "+(fx.batchDraws||0)+" DRAWS"+
    "\nSHELL FRAGMENTS "+(fx.fragments||0)+
    "\nFX GPU PREWARM "+(fx.gpuWarmup||"waiting")+
    (fx.lastGrenade?"\nGRENADE CPU "+fmt(fx.lastGrenade.total)+"ms | FX "+fmt(fx.lastGrenade.visual)+
      " | SHELL "+fmt(fx.lastGrenade.fragments)+" | REACT "+fmt(fx.lastGrenade.reactions)+
      "ms | DEATHS "+(fx.lastGrenade.ragdolls||0):"")+
    "\nPIXEL RATIO "+renderer.getPixelRatio().toFixed(2)+
    (p?"\nCPU GAME "+fmt(p.updateMs)+"ms | LIGHTS "+fmt(p.lightsMs)+
     " | RAIN "+fmt(p.rainMs)+" | RENDER SUBMIT "+fmt(p.renderSubmitMs)+
     "\nCPU WORST "+fmt(p.worstCpuMs)+"ms  HITCHES >50ms "+p.hitches+
     "\nAI REPATHS "+p.navBuilds+" / DEFERRED "+p.navDeferred+
     "  MAX "+fmt(p.navWorstMs)+"ms"+
     "\nROOF RAYS "+p.roofChecks+"  MAX "+fmt(p.roofWorstMs)+"ms":"");
   // CPU 'render submit' excludes asynchronously executing GPU work.
   if(consoleLogging)console.log("CityOutbreak perf",{fps,avgMs:avg,maxMs:perfMaxMs.toFixed(1),zombies:liveCount,parts:fx.parts,impacts:fx.impacts,casings:fx.casings,renderer:ri});
   perfTick=0;perfFrames=0;perfTime=0;perfMaxMs=0;
  }
 };
}
