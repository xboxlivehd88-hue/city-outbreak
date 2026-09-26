let ac,master,audioOn=false,noiseBuffer=null;

export function initAudio(){
 if(!ac){
   ac=new AudioContext();master=ac.createGain();master.gain.value=.4;master.connect(ac.destination);
   noiseBuffer=ac.createBuffer(1,Math.floor(ac.sampleRate*1.2),ac.sampleRate);
   const a=noiseBuffer.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;
 }
 ac.resume();audioOn=true
}

export function suspendAudio(){
 if(ac&&ac.state==="running")ac.suspend().catch(()=>{});
}

export function resumeAudio(){
 if(ac&&audioOn)ac.resume().catch(()=>{});
}

export function tone(f,d,type="sine",v=.1,delay=0){
 if(!audioOn)return;let t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();
 o.type=type;o.frequency.value=f;g.gain.setValueAtTime(Math.max(.001,v),t);g.gain.exponentialRampToValueAtTime(.001,t+d);
 o.connect(g);g.connect(master);o.onended=()=>{try{o.disconnect();g.disconnect()}catch(_){}};o.start(t);o.stop(t+d+.01)
}

export function noise(d=.1,v=.15,cut=500){
 if(!audioOn||!noiseBuffer)return;let s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain(),t=ac.currentTime;
 s.buffer=noiseBuffer;f.type="lowpass";f.frequency.value=cut;g.gain.setValueAtTime(Math.max(.001,v),t);g.gain.exponentialRampToValueAtTime(.001,t+d);
 s.connect(f);f.connect(g);g.connect(master);
 s.onended=()=>{try{s.disconnect();f.disconnect();g.disconnect()}catch(_){}}; 
 const maxOff=Math.max(0,noiseBuffer.duration-d-.02);s.start(t,Math.random()*maxOff,Math.min(d,noiseBuffer.duration));s.stop(t+d+.02)
}

export const gunS=()=>{noise(.1,.65,2600);tone(88,.14,"square",.28);tone(48,.2,"sine",.17,.02)},
 stepS=r=>{noise(.07,r?.16:.11,220);tone(r?105:85,.045,"sine",.055)},
 zStep=v=>{noise(.075,v*.85,130);tone(58,.05,"sine",v*.45)},
 biteS=()=>{noise(.16,.31,390);tone(92,.14,"sawtooth",.16)},
 headS=()=>{noise(.22,.48,650);tone(72,.16,"sawtooth",.18)},
 reloadS=()=>{tone(620,.04,"square",.1);setTimeout(()=>tone(390,.05,"square",.11),250);setTimeout(()=>tone(720,.04,"square",.1),600)},
 shellLoadS=()=>{tone(470,.035,"square",.085);tone(720,.025,"square",.055,.035)},
 pickupS=()=>{tone(520,.08,"sine",.13);tone(760,.1,"sine",.14,.09)};

export function groan(v){
 if(!audioOn)return;let o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter(),t=ac.currentTime;
 o.type="sawtooth";o.frequency.setValueAtTime(70+Math.random()*30,t);o.frequency.exponentialRampToValueAtTime(40+Math.random()*18,t+.55);
 f.type="lowpass";f.frequency.value=190;g.gain.setValueAtTime(Math.max(.001,v),t);g.gain.exponentialRampToValueAtTime(.001,t+.58);
 o.connect(f);f.connect(g);g.connect(master);o.onended=()=>{try{o.disconnect();f.disconnect();g.disconnect()}catch(_){}}; 
 o.start(t);o.stop(t+.60)
}
