import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createFrameFlightRecorder} from '../../src/frame-flight-recorder.mjs';

test('captures short automatic spikes with before/after history while normal frames recover',()=>{
 let clockMs=0,readouts=0;
 const recorder=createFrameFlightRecorder({capacity:40,maxEvents:5,clock:()=>clockMs,
  getContext:()=>{readouts++;return {zombies:10,draws:250}}});
 for(let i=0;i<20;i++){clockMs+=16;recorder.observe(16,4,3,.2,.2,.4,clockMs)}
 clockMs+=112;recorder.observe(112,45,38,1,1,5,clockMs);
 for(let i=0;i<60;i++){clockMs+=16;recorder.observe(16,4,3,.2,.2,.4,clockMs)}
 const data=recorder.snapshot();
 assert.equal(readouts,1,'Context collected only for one spike');
 assert.equal(data.events.length,1);
 assert.equal(data.events[0].wallMs,112);
 assert.equal(data.events[0].phase,'update');
 assert.equal(data.events[0].context.zombies,10);
 assert.ok(data.events[0].preceding.length>=12,'Pre-spike samples preserved');
 assert.ok(data.events[0].after.length>0,'Post-spike samples preserved');
 assert.equal(data.historyFrames,40,'Ring history stays bounded');
 assert.equal(data.recentFrames.length,40);
 assert.equal(data.summary.totalSpikeEvents,1);
 assert.ok(data.summary.p95FrameMs<=16.1,'One short spike is not persistent FPS loss');
});
test('disable stops sampling completely and re-enable resumes without data loss',()=>{
 let ticks=0;
 const recorder=createFrameFlightRecorder({clock:()=>++ticks});
 recorder.observe(16,1,1,0,0,0,16);
 const before=recorder.snapshot();
 recorder.setEnabled(false);
 for(let i=0;i<500;i++)recorder.observe(100,80,40,10,10,20,100+i);
 const disabled=recorder.snapshot();
 assert.equal(disabled.framesRecorded,before.framesRecorded);
 assert.equal(disabled.historyFrames,before.historyFrames);
 assert.equal(disabled.events.length,before.events.length);
 assert.equal(disabled.enabled,false);
 recorder.setEnabled(true);
 recorder.observe(70,55,50,1,1,3,1000);
 assert.equal(recorder.eventCount(),1);
 recorder.reset();
 const reset=recorder.snapshot();
 assert.equal(reset.framesRecorded,0);
 assert.equal(reset.events.length,0);
 assert.equal(reset.historyFrames,0);
});
test('spike log and ring stay bounded even over long recordings',()=>{
 let t=0;
 const recorder=createFrameFlightRecorder({capacity:32,maxEvents:3,clock:()=>t});
 for(let i=0;i<3000;i++){t+=60;recorder.observe(60,40,30,1,1,8,t)}
 const data=recorder.snapshot();
 assert.equal(data.historyFrames,32);
 assert.equal(data.events.length,3);
 assert.equal(data.recentFrames.length,32);
 assert.ok(data.events.every(e=>e.preceding.length<=12&&e.after.length<=12));
 assert.ok(data.overheadSample.measuredCalls>0,'Recorder times itself periodically');
});
