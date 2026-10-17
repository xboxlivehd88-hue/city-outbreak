// CITY OUTBREAK performance HUD module. v677: separate asynchronous GPU execution from CPU and vsync frame pacing.
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
  // v726: diagnostics should be accessible, not cover gameplay.
  // Keep the GPU/CPU profiler alive behind a collapsed native dropdown.
  const wrap=document.createElement("details");
  wrap.id="city-performance-dropdown";
  wrap.style.cssText="position:fixed;left:12px;top:12px;z-index:99998;color:#ecf3f5;background:#080d12df;border:1px solid #aab7c144;border-radius:7px;font:12px/1.45 monospace;max-width:min(92vw,570px);";
  const label=document.createElement("summary");
  label.textContent="PERFORMANCE";
  label.style.cssText="cursor:pointer;user-select:none;padding:5px 9px;outline-offset:2px;font:600 11px/1.3 Arial,sans-serif;letter-spacing:.08em;";
  label.setAttribute("aria-label","Show or hide performance statistics");
  perfHud=document.createElement("pre");
  perfHud.style.cssText="margin:0;padding:8px 10px;border-top:1px solid #ffffff22;white-space:pre-wrap;word-break:break-word;font:12px/1.45 monospace;max-height:65vh;overflow:auto;";
  perfHud.textContent="Collecting...";
  wrap.append(label,perfHud);
  document.body.appendChild(wrap);
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
     "\nFRAME "+(p.frameSamples>=5?"P50 "+fmt(p.frameMedianMs)+"ms | P95 "+fmt(p.frameP95Ms)+"ms | MAX "+fmt(p.frameMaxMs)+"ms":"PACING WARMUP ("+(p.frameSamples||0)+" FRAMES)") +
     "\nGPU RENDER "+(p.gpu?.status==="ready"
       ?fmt(p.gpu.avgMs)+"ms AVG | "+fmt(p.gpu.p95Ms)+"ms P95 | "+fmt(p.gpu.worstMs)+"ms WORST"
       :p.gpu?.status==="unavailable"?"NOT EXPOSED BY BROWSER":String(p.gpu?.status||"collecting"))+
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
