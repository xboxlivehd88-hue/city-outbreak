// CITY OUTBREAK v779 — local-only, bounded frame-time flight recorder.
// No screenshots, audio, video, network traffic, persistent logs or per-frame objects.
// Disabled mode returns before sampling. ON mode writes to preallocated typed arrays.
export function createFrameFlightRecorder({
 capacity=480,maxEvents=24,getContext=()=>({}),clock=()=>performance.now()
}={}){
 const keys=['wall','cpu','update','lights','rain','render'];
 const samples=keys.map(()=>new Float32Array(capacity));
 const times=new Float64Array(capacity);
 const events=[];
 let enabled=true,count=0,at=0,frames=0,baseMs=16.7,lastSpikeAt=-Infinity;
 let measuredCalls=0,measuredTotal=0,measuredMax=0,pending=null;
 let startAt=clock();
 const num=n=>Number.isFinite(n)?Math.max(0,n):0;
 const round=n=>Math.round(n*100)/100;
 function recent(limit=12){
  const output=[];
  for(let i=Math.max(0,count-limit);i<count;i++){
   const index=(at-count+i+capacity)%capacity;
   const row={t:round(times[index]-startAt)};
   keys.forEach((key,k)=>row[key]=round(samples[k][index]));
   output.push(row);
  }
  return output;
 }
 function reset(){
  count=0;at=0;frames=0;baseMs=16.7;lastSpikeAt=-Infinity;
  events.length=0;pending=null;
  measuredCalls=0;measuredTotal=0;measuredMax=0;startAt=clock();
 }
 function setEnabled(value){enabled=!!value;return enabled;}
 function observe(wall,cpu,update,lights,rain,render,time){
  if(!enabled)return;
  const measuring=++frames%120===0;
  const t0=measuring?clock():0;
  wall=num(wall);cpu=num(cpu);update=num(update);
  lights=num(lights);rain=num(rain);render=num(render);
  times[at]=time;
  samples[0][at]=wall;samples[1][at]=cpu;samples[2][at]=update;
  samples[3][at]=lights;samples[4][at]=rain;samples[5][at]=render;
  at=(at+1)%capacity;count=Math.min(capacity,count+1);
  if(pending&&frames%4===0){
   pending.after.push({t:round(time-startAt),wall:round(wall),cpu:round(cpu)});
   if(pending.after.length>=12)pending=null;
  }
  const threshold=Math.max(25,baseMs*2.5);
  // EWMA tracks normal pacing, but a single spike cannot inflate the baseline.
  if(wall<35)baseMs=baseMs*.985+wall*.015;
  if((wall>=50||cpu>=35||wall>threshold)&&time-lastSpikeAt>=350){
   lastSpikeAt=time;
   let context={};
   try{context=getContext()||{}}catch(_){context={error:'context-unavailable'}}
   const parts={update,lights,rain,render};
   const dominant=Object.keys(parts).reduce((a,b)=>parts[b]>parts[a]?b:a,'update');
   const source=cpu>35?'in-frame':wall>50?'frame-gap':'slow-frame';
   const event={t:round(time-startAt),wallMs:round(wall),cpuMs:round(cpu),
    updateMs:round(update),lightsMs:round(lights),rainMs:round(rain),
    renderMs:round(render),phase:source==='in-frame'?dominant:source,
    thresholdMs:round(threshold),context,preceding:recent(12),after:[]};
   events.push(event);if(events.length>maxEvents)events.shift();
   pending=event;
  }
  if(measuring){
   const cost=clock()-t0;
   if(Number.isFinite(cost)&&cost>=0){
    measuredCalls++;measuredTotal+=cost;measuredMax=Math.max(measuredMax,cost);
   }
  }
 }
 function snapshot(){
  const rows=recent(capacity);
  const ordered=rows.map(row=>row.wall).sort((a,b)=>a-b);
  const quantile=q=>ordered.length?ordered[Math.min(ordered.length-1,Math.ceil(q*ordered.length)-1)]:null;
  return {schema:'city-outbreak-flight-recorder-v1',enabled,capacity,maxEvents,
   framesRecorded:frames,historyFrames:count,events:events.slice(),
   summary:{p50FrameMs:quantile(.5),p95FrameMs:quantile(.95),
    worstHistoryFrameMs:ordered.length?ordered[ordered.length-1]:null,
    totalSpikeEvents:events.length,normalFrameEstimateMs:round(baseMs)},
   overheadSample:{measuredCalls,averageSampledCallMs:measuredCalls?round(measuredTotal/measuredCalls):null,
    worstSampledCallMs:measuredCalls?round(measuredMax):null,
    note:'One in every 120 recorder calls is timed; spike-frame overhead may be higher. Not a causal ON/OFF performance comparison.'},
   recentFrames:rows};
 }
 return {observe,reset,setEnabled,snapshot,isEnabled:()=>enabled,eventCount:()=>events.length};
}

// UI lives inside the existing collapsed PERFORMANCE menu; no screen overlay.
export function mountFlightRecorderControls(recorder,{root=document,getMeta=()=>({})}={}){
 const panel=root.getElementById('city-performance-dropdown');
 if(!panel)return null;
 const wrap=root.createElement('div');
 wrap.id='city-flight-recorder-controls';
 wrap.style.cssText='border-top:1px solid #ffffff22;padding:8px 10px;font:12px Arial,sans-serif;display:flex;gap:6px;flex-wrap:wrap;align-items:center;';
 const toggle=root.createElement('button');
 toggle.id='city-flight-toggle';
 const save=root.createElement('button');
 save.id='city-flight-save';save.textContent='SAVE FLIGHT REPORT (.JSON)';
 const clear=root.createElement('button');
 clear.id='city-flight-clear';clear.textContent='CLEAR HISTORY';
 const status=root.createElement('span');status.id='city-flight-status';
 status.style.cssText='flex-basis:100%;opacity:.9';
 const style='padding:5px 7px;background:#243640;color:#e9f4f7;border:1px solid #ffffff55;border-radius:4px;cursor:pointer;font:11px Arial,sans-serif;';
 toggle.style.cssText=style;save.style.cssText=style;clear.style.cssText=style;
 function refresh(){
  toggle.textContent=recorder.isEnabled()?'RECORDER: ON (CLICK TO DISABLE)':'RECORDER: OFF (CLICK TO ENABLE)';
  const data=recorder.snapshot();
  status.textContent=(recorder.isEnabled()?'Recording locally':'Recording disabled')+
   ' · '+data.events.length+' spikes saved · '+data.historyFrames+' recent frames · no video or uploads';
 }
 toggle.addEventListener('click',()=>{recorder.setEnabled(!recorder.isEnabled());refresh()});
 clear.addEventListener('click',()=>{recorder.reset();refresh()});
 save.addEventListener('click',()=>{
  const report={...recorder.snapshot(),exportedAt:new Date().toISOString(),...getMeta()};
  const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=root.createElement('a');
  a.href=url;a.download='city-outbreak-flight-report.json';
  root.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
  refresh();
 });
 wrap.append(toggle,save,clear,status);
 const readout=panel.querySelector('pre');
 panel.insertBefore(wrap,readout);
 panel.addEventListener('toggle',()=>{if(panel.open)refresh()});
 refresh();
 return {refresh};
}
