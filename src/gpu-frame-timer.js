// CITY OUTBREAK v677 — async, nonblocking WebGL2 GPU frame-time sampling.
// Unlike performance.now() around renderer.render(), EXT_disjoint_timer_query_webgl2
// measures GPU execution. Never wait for a query or call finish/readPixels.
// Queries are sampled sparsely, polled later and discarded on disjoint/context loss.
export function createGpuFrameTimer(renderer){
 const gl=renderer?.getContext?.();
 const ext=gl?.getExtension?.("EXT_disjoint_timer_query_webgl2")||null;
 const supported=!!(ext&&gl?.createQuery&&gl?.beginQuery&&gl?.getQueryParameter);
 const pending=[],samples=[];
 const stats={status:supported?"collecting":"unavailable",avgMs:null,worstMs:null,
  p95Ms:null,samples:0,pending:0,disjoints:0};
 let current=null,frame=0,contextLost=false;
 function discard(query){
  try{gl.deleteQuery(query)}catch(_){}
 }
 function poll(){
  if(!supported||contextLost)return;
  try{
   if(gl.isContextLost?.()){
    contextLost=true;stats.status="context-lost";
    for(const q of pending)discard(q);
    pending.length=0;
    return;
   }
   if(gl.getParameter(ext.GPU_DISJOINT_EXT)){
    for(const q of pending)discard(q);
    pending.length=0;samples.length=0;
    stats.samples=0;stats.avgMs=null;stats.worstMs=null;stats.p95Ms=null;
    stats.disjoints++;stats.status="disjoint";
    return;
   }
   // Availability is checked first: asking for the actual elapsed time
   // before it is ready would synchronously stall the main thread.
   for(let i=pending.length-1;i>=0;i--){
    const q=pending[i];
    if(!gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE))continue;
    const ns=gl.getQueryParameter(q,gl.QUERY_RESULT);
    discard(q);pending.splice(i,1);
    const ms=ns/1000000;
    if(!Number.isFinite(ms)||ms<0||ms>1000)continue;
    samples.push(ms);if(samples.length>45)samples.shift();
   }
   if(samples.length){
    const sorted=[...samples].sort((a,b)=>a-b);
    stats.avgMs=samples.reduce((sum,v)=>sum+v,0)/samples.length;
    stats.worstMs=sorted[sorted.length-1];
    stats.p95Ms=sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*.95)-1)];
    stats.samples=samples.length;stats.status="ready";
   }else if(stats.status!=="disjoint")stats.status="collecting";
   stats.pending=pending.length;
  }catch(e){
   stats.status="unavailable";contextLost=true;
   for(const q of pending)discard(q);
   pending.length=0;stats.pending=0;
  }
 }
 function begin(){
  if(!supported||contextLost)return false;
  frame++;
  if(frame%6!==0)return false; // ~12 measurements/sec at a 75 Hz display.
  poll();
  if(current||pending.length>=3)return false;
  try{
   current=gl.createQuery();
   if(!current)return false;
   gl.beginQuery(ext.TIME_ELAPSED_EXT,current);
   return true;
  }catch(_){
   if(current)discard(current);current=null;
   stats.status="unavailable";contextLost=true;
   return false;
  }
 }
 function end(){
  if(!current||contextLost)return;
  try{
   gl.endQuery(ext.TIME_ELAPSED_EXT);
   pending.push(current);stats.pending=pending.length;
  }catch(_){
   discard(current);
   stats.status="unavailable";contextLost=true;
  }finally{current=null}
 }
 function snapshot(){
  poll();
  return {...stats};
 }
 return {begin,end,snapshot};
}
