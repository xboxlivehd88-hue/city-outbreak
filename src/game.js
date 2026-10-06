import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
import {ZOMBIE_RIG_GLTF} from "./zombie-rig-data.js";
import {createPerformanceGuard} from "./performance-hud.js?v=262";
import {showTransientMessage,setupControlsModal,setupResetButtons,setupPauseButtons,renderBossHud,hideBossHud,renderSprintHud,renderMainHud,renderDeathStats,showAnnouncement,hideAnnouncement,setupReadyNextButton,setupShopBuyButtons,showRuntimeErrorOverlay,setupRuntimeErrorListener,flashDamageOverlay,hideStartScreen,resetRunUiOverlays,renderShopNote,renderPauseUi,renderDeathScreenVisibility,renderShopVisibility} from "./ui-helpers.js?v=464";
import {setupRendererResize,setupWebGLContextLossHandler} from "./render-utils.js?v=267";
import {formatRunTime} from "./format-utils.js?v=273";
import {clearKeyState,setupGameContextMenuGuard,setupFocusSafety,setupPointerLockChange,setupKeyUp,setupKeyDown,setupMouseMove,setupMouseActions} from "./input-utils.js?v=285";
import {diff,isBossWave,bossTier,bossScaleFactor} from "./wave-utils.js?v=321";
let zombieRigAsset=null,zombieRigError=null;
try{
 zombieRigAsset=await new Promise((resolve,reject)=>new GLTFLoader().parse(ZOMBIE_RIG_GLTF,"",resolve,reject));
 console.log("CITY OUTBREAK: custom rigged zombie loaded",zombieRigAsset.animations.map(a=>a.name));
}catch(e){zombieRigError=e;console.error("CITY OUTBREAK: zombie rig failed to load",e)}

// v395: user-supplied Radiated zombie visual. The source GLB is a static T-pose,
 // so it is auto-rigged at runtime while the existing invisible zombie rig/hitboxes
 // continue to own gameplay, damage, navigation and ragdoll bookkeeping.
let radiatedGreenGuyAsset=null,radiatedGreenGuyTemplate=null,radiatedGreenGuyError=null;
new GLTFLoader().load("assets/green%20guy.glb?v=395",gltf=>{
 radiatedGreenGuyAsset=gltf;
 radiatedGreenGuyTemplate=buildRadiatedGreenGuyTemplate(gltf.scene);
 console.log("CITY OUTBREAK: green guy radiated model loaded",{
   animations:gltf.animations?.map(a=>a.name)||[],
   autoRig:!!radiatedGreenGuyTemplate,
   height:radiatedGreenGuyTemplate?.userData?.sourceHeight||0
 });
 for(const z of zombies){if(z.kind==="radiated"&&!z.radiatedGreenVisual)attachRadiatedGreenGuy(z,z.g)}
},undefined,e=>{radiatedGreenGuyError=e;console.error("CITY OUTBREAK: green guy radiated model failed to load",e)});

// v399: user-supplied replacement for the common/basic Shambler walkers.
// The GLB is static, so CITY OUTBREAK builds a measured runtime rig while
// retaining the approved Shambler stats, AI, spawn weighting and gameplay logic.
let basicWalkerAsset=null,basicWalkerTemplate=null,basicWalkerError=null;
new GLTFLoader().load("assets/walkers.glb?v=399",gltf=>{
 basicWalkerAsset=gltf;
 basicWalkerTemplate=buildBasicWalkerTemplate(gltf.scene);
 console.log("CITY OUTBREAK: walkers.glb loaded",{
   animations:gltf.animations?.map(a=>a.name)||[],
   autoRig:!!basicWalkerTemplate,
   height:basicWalkerTemplate?.userData?.sourceHeight||0
 });
 for(const z of zombies){
   if(z.kind==="shambler"&&!z.walkerVisual&&attachBasicWalkerVisual(z,z.g))buildBasicWalkerHitboxes(z);
 }
},undefined,e=>{basicWalkerError=e;console.error("CITY OUTBREAK: walkers.glb failed to load",e)});

const cv=document.querySelector("#cv"),cross=document.querySelector("#crosshair"),healthText=document.querySelector("#healthText"),healthBar=document.querySelector("#healthBar"),ammoEl=document.querySelector("#ammo"),killsEl=document.querySelector("#kills"),headsEl=document.querySelector("#heads"),waveEl=document.querySelector("#wave"),remainingEl=document.querySelector("#remaining"),cashEl=document.querySelector("#cash"),weaponNameEl=document.querySelector("#weaponName"),grenadeEl=document.querySelector("#grenadeCount"),nukeEl=document.querySelector("#nukeCount"),nukeFlash=document.querySelector("#nukeFlash"),nukeShock=document.querySelector("#nukeShock"),shop=document.querySelector("#shop"),shopCash=document.querySelector("#shopCash"),shopNote=document.querySelector("#shopNote"),damage=document.querySelector("#damage"),hitmarker=document.querySelector("#hitmarker"),announce=document.querySelector("#announce"),big=document.querySelector("#big"),small=document.querySelector("#small"),death=document.querySelector("#death"),msg=document.querySelector("#msg"),startScreen=document.querySelector("#startScreen"),bossHUD=document.querySelector("#bossHUD"),bossFill=document.querySelector("#bossFill"),bossNameEl=document.querySelector("#bossName"),bossSubEl=document.querySelector("#bossSub"),sprintFill=document.querySelector("#sprintFill"),sprintState=document.querySelector("#sprintState"),scopeOverlay=document.querySelector("#scopeOverlay"),pauseBtn=document.querySelector("#pauseBtn"),pauseOverlay=document.querySelector("#pauseOverlay"),resumeGameBtn=document.querySelector("#resumeGame");
let ac,master,audioOn=false,noiseBuffer=null;
const M240_FIRE_SAMPLE_URL="./assets/101961__cgeffex__heavy-machine-gun-edited.wav?v=439";
let m240FireBuffer=null,m240FireLoad=null,m240FireSource=null,m240FireGain=null;
function loadM240FireSample(){
 if(!ac)return Promise.resolve(null);
 if(m240FireBuffer)return Promise.resolve(m240FireBuffer);
 if(m240FireLoad)return m240FireLoad;
 m240FireLoad=fetch(M240_FIRE_SAMPLE_URL,{cache:"force-cache"})
   .then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.arrayBuffer()})
   .then(buf=>ac.decodeAudioData(buf))
   .then(decoded=>{m240FireBuffer=decoded;return decoded})
   .catch(err=>{console.error("CITY OUTBREAK: M240 edited firing WAV failed to load",err);m240FireLoad=null;return null});
 return m240FireLoad;
}
function startM240FireAudio(){
 if(!audioOn||!ac)return false;
 if(m240FireSource)return true;
 if(!m240FireBuffer){loadM240FireSample();return false}
 const src=ac.createBufferSource(),g=ac.createGain(),t=ac.currentTime;
 src.buffer=m240FireBuffer;
 // v439: the newly uploaded file is the authored M240 loop. Play it exactly
 // as supplied: start on trigger, loop continuously, stop on trigger release.
 src.loop=true;src.loopStart=0;src.loopEnd=m240FireBuffer.duration;
 g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.90,t+.008);
 src.connect(g);g.connect(master);
 m240FireSource=src;m240FireGain=g;
 src.onended=()=>{
   if(m240FireSource===src){m240FireSource=null;m240FireGain=null}
   try{src.disconnect();g.disconnect()}catch(_){}
 };
 src.start(t,0);return true;
}
function stopM240FireAudio(fade=.018){
 const src=m240FireSource,g=m240FireGain;if(!src)return;
 m240FireSource=null;m240FireGain=null;
 const t=ac?.currentTime||0;
 try{
   if(g){
     g.gain.cancelScheduledValues(t);
     g.gain.setValueAtTime(Math.max(.001,g.gain.value||.001),t);
     g.gain.linearRampToValueAtTime(.001,t+fade);
   }
   src.stop(t+fade+.005);
 }catch(_){}
}
function initAudio(){
 if(!ac){
   ac=new AudioContext();master=ac.createGain();master.gain.value=.4;master.connect(ac.destination);
   noiseBuffer=ac.createBuffer(1,Math.floor(ac.sampleRate*1.2),ac.sampleRate);
   const a=noiseBuffer.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;
 }
 loadM240FireSample();
 ac.resume();audioOn=true
}
function tone(f,d,type="sine",v=.1,delay=0){
 if(!audioOn)return;let t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();
 o.type=type;o.frequency.value=f;g.gain.setValueAtTime(Math.max(.001,v),t);g.gain.exponentialRampToValueAtTime(.001,t+d);
 o.connect(g);g.connect(master);o.onended=()=>{try{o.disconnect();g.disconnect()}catch(_){}};o.start(t);o.stop(t+d+.01)
}
function noise(d=.1,v=.15,cut=500){
 if(!audioOn||!noiseBuffer)return;let s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain(),t=ac.currentTime;
 s.buffer=noiseBuffer;f.type="lowpass";f.frequency.value=cut;g.gain.setValueAtTime(Math.max(.001,v),t);g.gain.exponentialRampToValueAtTime(.001,t+d);
 s.connect(f);f.connect(g);g.connect(master);
 s.onended=()=>{try{s.disconnect();f.disconnect();g.disconnect()}catch(_){}};
 const maxOff=Math.max(0,noiseBuffer.duration-d-.02);s.start(t,Math.random()*maxOff,Math.min(d,noiseBuffer.duration));s.stop(t+d+.02)
}
const gunS=()=>{noise(.1,.65,2600);tone(88,.14,"square",.28);tone(48,.2,"sine",.17,.02)},stepS=r=>{noise(.07,r?.16:.11,220);tone(r?105:85,.045,"sine",.055)},zStep=v=>{noise(.075,v*.85,130);tone(58,.05,"sine",v*.45)},biteS=()=>{noise(.16,.31,390);tone(92,.14,"sawtooth",.16)},headS=()=>{noise(.22,.48,650);tone(72,.16,"sawtooth",.18)},reloadS=()=>{tone(620,.04,"square",.1);setTimeout(()=>tone(390,.05,"square",.11),250);setTimeout(()=>tone(720,.04,"square",.1),600)},shellLoadS=()=>{tone(470,.035,"square",.085);tone(720,.025,"square",.055,.035)},pickupS=()=>{tone(520,.08,"sine",.13);tone(760,.1,"sine",.14,.09)};
function groan(v){
 if(!audioOn)return;let o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter(),t=ac.currentTime;
 o.type="sawtooth";o.frequency.setValueAtTime(70+Math.random()*30,t);o.frequency.exponentialRampToValueAtTime(40+Math.random()*18,t+.55);
 f.type="lowpass";f.frequency.value=190;g.gain.setValueAtTime(Math.max(.001,v),t);g.gain.exponentialRampToValueAtTime(.001,t+.58);
 o.connect(f);f.connect(g);g.connect(master);o.onended=()=>{try{o.disconnect();f.disconnect();g.disconnect()}catch(_){}};
 o.start(t);o.stop(t+.60)
}
const scene=new THREE.Scene();scene.background=new THREE.Color(0x171b22);scene.fog=new THREE.FogExp2(0x242321,.0047);
const cam=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.08,220),ren=new THREE.WebGLRenderer({canvas:cv,antialias:true});ren.setPixelRatio(Math.min(devicePixelRatio,1.10));ren.shadowMap.enabled=true;ren.shadowMap.type=THREE.PCFShadowMap;ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.18;

// v344 early-night atmosphere: dark but still readable, with cool moon fill
// and enough exposure left for the warm street lamps to visibly light the road.
scene.add(new THREE.HemisphereLight(0x73879a,0x4b4036,.92));
let sun=new THREE.DirectionalLight(0xb9c9d6,1.35);
sun.position.set(18,35,-92);sun.castShadow=true;sun.shadow.mapSize.set(768,768);sun.shadow.camera.left=-62;sun.shadow.camera.right=62;sun.shadow.camera.top=62;sun.shadow.camera.bottom=-62;scene.add(sun);

const earlyNightSkyUniforms={uTime:{value:0}};
const earlyNightSkyMaterial=new THREE.ShaderMaterial({
 side:THREE.BackSide,
 depthWrite:false,
 depthTest:false,
 fog:false,
 uniforms:earlyNightSkyUniforms,
 vertexShader:`
 varying vec3 vDir;
 void main(){
   vDir=normalize(position);
   gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
 }`,
 fragmentShader:`
 precision highp float;
 varying vec3 vDir;
 uniform float uTime;

 float hash3(vec3 p){
   p=fract(p*.3183099+.1);
   p*=17.0;
   return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
 }
 float noise3(vec3 p){
   vec3 i=floor(p),f=fract(p);
   f=f*f*(3.0-2.0*f);
   return mix(
     mix(mix(hash3(i+vec3(0,0,0)),hash3(i+vec3(1,0,0)),f.x),
         mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
     mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),
         mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);
 }
 float fbm(vec3 p){
   float v=0.0,a=.5;
   v+=a*noise3(p);p=p*2.03+vec3(1.7,2.1,.8);a*=.5;
   v+=a*noise3(p);p=p*2.01+vec3(.4,1.3,2.4);a*=.5;
   v+=a*noise3(p);p=p*2.04+vec3(2.2,.7,1.1);a*=.5;
   v+=a*noise3(p);
   return v;
 }
 void main(){
   vec3 d=normalize(vDir);
   float horizon=pow(1.0-clamp(d.y,0.0,1.0),2.15);
   vec3 zenith=vec3(.020,.034,.060);
   vec3 horizonCol=vec3(.235,.185,.118);
   vec3 sky=mix(zenith,horizonCol,horizon*.82);
   float lowGlow=exp(-abs(d.y-.035)*7.0);
   sky+=vec3(.105,.073,.040)*lowGlow;

   vec3 drift=vec3(uTime*.0022,0.0,-uTime*.0014);
   float n1=fbm(d*3.55+drift);
   float n2=fbm(d*8.4-drift*1.8);
   float cloudNoise=n1*.72+n2*.28;
   float cloudBand=smoothstep(-.16,.05,d.y)*(1.0-smoothstep(.62,.86,d.y));
   float clouds=smoothstep(.46,.68,cloudNoise+.055)*cloudBand;
   vec3 darkCloud=vec3(.052,.049,.052);
   vec3 tanCloud=vec3(.285,.225,.145);
   vec3 cloudCol=mix(darkCloud,tanCloud,smoothstep(.48,.75,cloudNoise));

   // Small full moon, low over the skyline and slightly off-center from spawn.
   vec3 moonDir=normalize(vec3(.18,.25,-.963));
   float md=dot(d,moonDir);
   float moon=smoothstep(cos(.0264),cos(.0198),md);
   float halo=smoothstep(cos(.077),cos(.0275),md);
   vec3 moonUp=normalize(vec3(-moonDir.x*moonDir.y,1.0-moonDir.y*moonDir.y,-moonDir.z*moonDir.y));
   float moonY=dot(d,moonUp);
   float moonTexture=.88+.12*noise3(d*95.0);
   sky+=vec3(.31,.275,.205)*halo*.22;
   sky=mix(sky,vec3(.94,.88,.72)*moonTexture,moon);

   // Keep the upper moon readable, while a dense tan cloud bank covers its bottom.
   float upperMoon=moon*smoothstep(-.001,.009,moonY);
   float lowerMoon=moon*(1.0-smoothstep(-.010,.006,moonY));
   float cloudOpacity=clouds*.78*(1.0-upperMoon*.90);
   float lowerCover=lowerMoon*(.64+.36*smoothstep(.40,.70,cloudNoise));
   cloudOpacity=max(cloudOpacity,lowerCover*.92);
   sky=mix(sky,cloudCol,clamp(cloudOpacity,0.0,.94));

   // Faint moonlit haze keeps silhouettes visible without turning the sky gray.
   sky+=vec3(.022,.027,.034)*smoothstep(-.05,.38,d.y);
   gl_FragColor=vec4(sky,1.0);
 }`
});
const earlyNightSky=new THREE.Mesh(new THREE.SphereGeometry(185,48,24),earlyNightSkyMaterial);
earlyNightSky.renderOrder=-1000;earlyNightSky.frustumCulled=false;scene.add(earlyNightSky);
document.documentElement.dataset.earlyNightSky="1";

// v348: heavier world-space rain with stronger wind, wet surfaces and pooled
// pavement splashes. The approved streak length range stays unchanged.
const RAIN_DROP_COUNT=620;
const RAIN_RADIUS=29;
const RAIN_TOP=20;
const RAIN_BOTTOM=-2.0;
const RAIN_WIND_X=1.72;
const RAIN_WIND_Z=-.68;
const rainPositions=new Float32Array(RAIN_DROP_COUNT*6);
const rainX=new Float32Array(RAIN_DROP_COUNT);
const rainY=new Float32Array(RAIN_DROP_COUNT);
const rainZ=new Float32Array(RAIN_DROP_COUNT);
const rainSpeed=new Float32Array(RAIN_DROP_COUNT);
const rainLength=new Float32Array(RAIN_DROP_COUNT);
const rainGeometry=new THREE.BufferGeometry();
const rainPositionAttr=new THREE.BufferAttribute(rainPositions,3);
rainPositionAttr.setUsage(THREE.DynamicDrawUsage);
rainGeometry.setAttribute("position",rainPositionAttr);
const rainMaterial=new THREE.LineBasicMaterial({
 color:0xc7d2dc,
 transparent:true,
 opacity:.39,
 depthWrite:false,
 depthTest:true
});
const rainLines=new THREE.LineSegments(rainGeometry,rainMaterial);
rainLines.frustumCulled=false;
rainLines.renderOrder=850;
scene.add(rainLines);

// One additional draw call for small four-way pavement splashes.
const RAIN_SPLASH_COUNT=56;
const RAIN_SPLASH_RADIUS=8.5;
const rainSplashPositions=new Float32Array(RAIN_SPLASH_COUNT*24);
const rainSplashAge=new Float32Array(RAIN_SPLASH_COUNT);
const rainSplashLife=new Float32Array(RAIN_SPLASH_COUNT);
const rainSplashX=new Float32Array(RAIN_SPLASH_COUNT);
const rainSplashY=new Float32Array(RAIN_SPLASH_COUNT);
const rainSplashZ=new Float32Array(RAIN_SPLASH_COUNT);
const rainSplashSize=new Float32Array(RAIN_SPLASH_COUNT);
const rainSplashActive=new Uint8Array(RAIN_SPLASH_COUNT);
const rainSplashGeometry=new THREE.BufferGeometry();
const rainSplashAttr=new THREE.BufferAttribute(rainSplashPositions,3);
rainSplashAttr.setUsage(THREE.DynamicDrawUsage);
rainSplashGeometry.setAttribute("position",rainSplashAttr);
const rainSplashMaterial=new THREE.LineBasicMaterial({
 color:0xd5dfe6,
 transparent:true,
 opacity:.30,
 depthWrite:false,
 depthTest:true
});
const rainSplashes=new THREE.LineSegments(rainSplashGeometry,rainSplashMaterial);
rainSplashes.frustumCulled=false;
rainSplashes.renderOrder=851;
scene.add(rainSplashes);

const rainCoverRay=new THREE.Raycaster();
const rainUp=new THREE.Vector3(0,1,0),rainCoverOrigin=new THREE.Vector3();
let rainCoverCheckAt=-1e9,rainCovered=false,rainOpacity=.39,rainSplashSpawnAcc=0,rainSplashCursor=0;

function resetRainDrop(i,randomY=true,centerX=0,centerY=0,centerZ=-15){
 const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*RAIN_RADIUS;
 rainX[i]=centerX+Math.cos(a)*r;
 rainZ[i]=centerZ+Math.sin(a)*r;
 rainY[i]=centerY+(randomY?RAIN_BOTTOM+Math.random()*(RAIN_TOP-RAIN_BOTTOM):RAIN_TOP+Math.random()*4);
 rainSpeed[i]=17+Math.random()*9;
 // Keep v347's approved streak length exactly.
 rainLength[i]=.48+Math.random()*.72;
}
for(let i=0;i<RAIN_DROP_COUNT;i++)resetRainDrop(i,true,0,0,-15);

function hideRainSplash(i){
 const j=i*24;
 for(let k=0;k<8;k++){
   rainSplashPositions[j+k*3]=0;
   rainSplashPositions[j+k*3+1]=-9999;
   rainSplashPositions[j+k*3+2]=0;
 }
 rainSplashActive[i]=0;
}
for(let i=0;i<RAIN_SPLASH_COUNT;i++)hideRainSplash(i);

function spawnRainSplash(){
 const i=rainSplashCursor++%RAIN_SPLASH_COUNT;
 const a=Math.random()*Math.PI*2,r=1.4+Math.sqrt(Math.random())*(RAIN_SPLASH_RADIUS-1.4);
 const x=px+Math.cos(a)*r,z=pz+Math.sin(a)*r;
 const y=sampleZombieGroundY(x,z,playerGroundY)+.025;
 rainSplashX[i]=x;rainSplashY[i]=y;rainSplashZ[i]=z;
 rainSplashAge[i]=0;rainSplashLife[i]=.16+Math.random()*.12;
 rainSplashSize[i]=.055+Math.random()*.075;
 rainSplashActive[i]=1;
}
function updateRainSplashes(dt){
 if(!rainCovered){
   rainSplashSpawnAcc+=dt*34;
   while(rainSplashSpawnAcc>=1){spawnRainSplash();rainSplashSpawnAcc-=1}
 }else rainSplashSpawnAcc=Math.min(rainSplashSpawnAcc,.25);

 for(let i=0;i<RAIN_SPLASH_COUNT;i++){
   if(!rainSplashActive[i])continue;
   rainSplashAge[i]+=dt;
   const life=rainSplashLife[i];
   if(rainSplashAge[i]>=life){hideRainSplash(i);continue}
   const p=rainSplashAge[i]/life;
   const spread=rainSplashSize[i]*(.28+p*1.15);
   const rise=Math.sin(p*Math.PI)*rainSplashSize[i]*.72;
   const x=rainSplashX[i],y=rainSplashY[i],z=rainSplashZ[i],j=i*24;
   rainSplashPositions[j]=x;rainSplashPositions[j+1]=y;rainSplashPositions[j+2]=z;
   rainSplashPositions[j+3]=x+spread;rainSplashPositions[j+4]=y+rise;rainSplashPositions[j+5]=z;
   rainSplashPositions[j+6]=x;rainSplashPositions[j+7]=y;rainSplashPositions[j+8]=z;
   rainSplashPositions[j+9]=x-spread;rainSplashPositions[j+10]=y+rise;rainSplashPositions[j+11]=z;
   rainSplashPositions[j+12]=x;rainSplashPositions[j+13]=y;rainSplashPositions[j+14]=z;
   rainSplashPositions[j+15]=x;rainSplashPositions[j+16]=y+rise;rainSplashPositions[j+17]=z+spread;
   rainSplashPositions[j+18]=x;rainSplashPositions[j+19]=y;rainSplashPositions[j+20]=z;
   rainSplashPositions[j+21]=x;rainSplashPositions[j+22]=y+rise;rainSplashPositions[j+23]=z-spread;
 }
 rainSplashAttr.needsUpdate=true;
 rainSplashMaterial.opacity=rainOpacity*.76;
}

function updateRainCover(t){
 if(t-rainCoverCheckAt<240)return;
 rainCoverCheckAt=t;
 rainCovered=false;
 if(!newCityRoot)return;
 rainCoverRay.set(rainCoverOrigin.set(px,playerGroundY+1.35,pz),rainUp);
 rainCoverRay.near=.15;rainCoverRay.far=18;
 const hits=rainCoverRay.intersectObject(newCityRoot,true);
 for(const hit of hits){
   let o=hit.object,hidden=false;
   while(o&&o!==newCityRoot){
     if(o.visible===false||o.userData?.replacedStreetLamp){hidden=true;break}
     o=o.parent;
   }
   if(!hidden){rainCovered=true;break}
 }
}
function updateRainEffect(dt,t){
 if(!rainLines)return;
 updateRainCover(t);
 const targetOpacity=rainCovered?.02:.39;
 rainOpacity=THREE.MathUtils.lerp(rainOpacity,targetOpacity,Math.min(1,dt*7));
 rainMaterial.opacity=rainOpacity;
 if(paused||shopLowPower)return;
 const groundBottom=playerGroundY+RAIN_BOTTOM;
 const recycleRadius=RAIN_RADIUS+4,recycleRadiusSq=recycleRadius*recycleRadius;
 for(let i=0;i<RAIN_DROP_COUNT;i++){
   rainX[i]+=RAIN_WIND_X*dt;
   rainZ[i]+=RAIN_WIND_Z*dt;
   rainY[i]-=rainSpeed[i]*dt;
   const dx=rainX[i]-px,dz=rainZ[i]-pz;
   if(rainY[i]<groundBottom||dx*dx+dz*dz>recycleRadiusSq){
     resetRainDrop(i,false,px,playerGroundY,pz);
   }
   const j=i*6,len=rainLength[i];
   const leanX=RAIN_WIND_X*.055*len,leanZ=RAIN_WIND_Z*.055*len;
   rainPositions[j]=rainX[i];
   rainPositions[j+1]=rainY[i];
   rainPositions[j+2]=rainZ[i];
   rainPositions[j+3]=rainX[i]-leanX;
   rainPositions[j+4]=rainY[i]+len;
   rainPositions[j+5]=rainZ[i]-leanZ;
 }
 rainPositionAttr.needsUpdate=true;
 updateRainSplashes(dt);
}
document.documentElement.dataset.rainEffect="world-space-heavy-wet";
document.documentElement.dataset.rainDropCount=String(RAIN_DROP_COUNT);
document.documentElement.dataset.rainSplashCount=String(RAIN_SPLASH_COUNT);

// Wet road/ground treatment: clone only ground-family materials so buildings,
// props and the approved street lamps are not altered.
function applyWetCityMaterials(map){
 map.updateMatrixWorld(true);
 const wetMaterialCache=new Map(),box=new THREE.Box3(),size=new THREE.Vector3();
 let wetMeshes=0;
 map.traverse(o=>{
   if(!o.isMesh||o.isSkinnedMesh)return;
   let p=o,mode="";
   while(p&&p!==map){
     const name=p.name||"";
     if(/^Road_\d/i.test(name)||/^ParkingBG_/i.test(name)){mode="road";break}
     if(/^BG_/i.test(name)){mode="ground"}
     p=p.parent;
   }
   if(!mode)return;
   if(mode==="ground"){
     box.setFromObject(o);box.getSize(size);
     if(size.y>.42)return;
   }
   const wetOne=mat=>{
     if(!mat||!mat.clone)return mat;
     const key=mat.uuid+"|"+mode;
     let wet=wetMaterialCache.get(key);
     if(wet)return wet;
     wet=mat.clone();
     // v351: keep the pavement visibly damp, but avoid mirror-like moon streaks.
     // Higher roughness spreads/dims the highlight and zero metalness prevents the
     // road from behaving like a reflective strip when the moon is behind buildings.
     if(wet.color)wet.color.multiplyScalar(mode==="road"?.80:.92);
     if("roughness" in wet)wet.roughness=Math.max(wet.roughness??1,mode==="road"?.68:.78);
     if("metalness" in wet)wet.metalness=0;
     if("envMapIntensity" in wet)wet.envMapIntensity=Math.min(wet.envMapIntensity??1,.08);
     wet.needsUpdate=true;wetMaterialCache.set(key,wet);return wet;
   };
   o.material=Array.isArray(o.material)?o.material.map(wetOne):wetOne(o.material);
   wetMeshes++;
 });
 document.documentElement.dataset.wetSurfaceMeshes=String(wetMeshes);
 console.log("CITY OUTBREAK: wet road/ground materials applied",{wetMeshes});
}

const materialCache=new Map(),zombieMaterialCache=new Map();
const M=(c,r=.82)=>{const k=c+"|"+r;let m=materialCache.get(k);if(!m){m=new THREE.MeshStandardMaterial({color:c,roughness:r});materialCache.set(k,m)}return m};
const ZM=(c,r=.9)=>{const k=c+"|"+r;let m=zombieMaterialCache.get(k);if(!m){m=new THREE.MeshStandardMaterial({color:c,roughness:r,flatShading:true});zombieMaterialCache.set(k,m)}return m};
function box(w,h,d,m,x,y,z,p=scene){let q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);q.position.set(x,y,z);q.castShadow=true;q.receiveShadow=true;p.add(q);return q}

function taperedPrism(topW,bottomW,h,topD,bottomD,m,x,y,z,p=scene){
 const tw=topW/2,bw=bottomW/2,td=topD/2,bd=bottomD/2,hh=h/2;
 const pos=new Float32Array([
   -bw,-hh,-bd, bw,-hh,-bd, bw,-hh,bd, -bw,-hh,bd,
   -tw, hh,-td, tw, hh,-td, tw, hh,td, -tw, hh,td
 ]);
 const idx=[0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0];
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
 const q=new THREE.Mesh(geo,m);q.position.set(x,y,z);q.castShadow=true;q.receiveShadow=true;p.add(q);return q;
}


const buildingColliders=[];


const zombieTexCache=new Map();
function zombieTex(baseHex,kind=0){
 const cacheKey=baseHex+"|"+kind;if(zombieTexCache.has(cacheKey))return zombieTexCache.get(cacheKey);
 const cv=document.createElement("canvas");cv.width=192;cv.height=192;const c=cv.getContext("2d");
 const base="#"+baseHex.toString(16).padStart(6,"0");c.fillStyle=base;c.fillRect(0,0,192,192);

 for(let i=0;i<520;i++){
   const x=Math.random()*192,y=Math.random()*192,r=1+Math.random()*9,a=.03+Math.random()*.11;
   if(kind===0)c.fillStyle=`rgba(${45+Math.random()*85},${48+Math.random()*74},${38+Math.random()*60},${a})`;
   else c.fillStyle=`rgba(${18+Math.random()*55},${18+Math.random()*52},${16+Math.random()*48},${a})`;
   c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
 }
 if(kind===0){
   for(let i=0;i<34;i++){
     c.fillStyle=`rgba(${70+Math.random()*85},${10+Math.random()*35},${14+Math.random()*35},${.06+Math.random()*.14})`;
     c.beginPath();c.ellipse(Math.random()*192,Math.random()*192,4+Math.random()*16,2+Math.random()*8,Math.random()*Math.PI,0,Math.PI*2);c.fill();
   }
   for(let i=0;i<16;i++){
     c.strokeStyle=`rgba(${70+Math.random()*40},${80+Math.random()*50},${120+Math.random()*70},${.04+Math.random()*.08})`;
     c.lineWidth=.7+Math.random()*1.5;c.beginPath();let x=Math.random()*192,y=Math.random()*192;
     c.moveTo(x,y);c.bezierCurveTo(x+10,y-6,x+22,y+12,x+30+(Math.random()-.5)*18,y+20+(Math.random()-.5)*18);c.stroke();
   }
 }else{
   for(let i=0;i<28;i++){
     c.strokeStyle=`rgba(12,12,12,${.08+Math.random()*.13})`;c.lineWidth=1+Math.random()*3;
     c.beginPath();let y=Math.random()*192;c.moveTo(0,y);c.lineTo(192,y+(Math.random()-.5)*26);c.stroke();
   }
   for(let i=0;i<22;i++){
     c.fillStyle=`rgba(210,205,190,${.025+Math.random()*.055})`;
     c.fillRect(Math.random()*192,Math.random()*192,8+Math.random()*24,1+Math.random()*3);
   }
   for(let i=0;i<14;i++){
     c.fillStyle=`rgba(90,20,18,${.05+Math.random()*.1})`;
     c.beginPath();c.arc(Math.random()*192,Math.random()*192,2+Math.random()*9,0,Math.PI*2);c.fill();
   }
 }
 const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;tx.wrapS=tx.wrapT=THREE.RepeatWrapping;
 tx.repeat.set(kind===0?1.15:1.7,kind===0?1.15:1.7);
 const mat=new THREE.MeshStandardMaterial({color:0xffffff,map:tx,roughness:kind===0?.92:.98,metalness:0,flatShading:true});zombieTexCache.set(cacheKey,mat);return mat;
}



const CITY_COLLISION_BUCKET=4.0;
const cityCollisionBuckets=new Map();
function cityCollisionKey(ix,iz){return ix+","+iz}
function indexCityCollider(b){
 const minX=Math.floor((b.x-b.hx)/CITY_COLLISION_BUCKET),maxX=Math.floor((b.x+b.hx)/CITY_COLLISION_BUCKET);
 const minZ=Math.floor((b.z-b.hz)/CITY_COLLISION_BUCKET),maxZ=Math.floor((b.z+b.hz)/CITY_COLLISION_BUCKET);
 for(let iz=minZ;iz<=maxZ;iz++)for(let ix=minX;ix<=maxX;ix++){
   const key=cityCollisionKey(ix,iz);let bucket=cityCollisionBuckets.get(key);
   if(!bucket){bucket=[];cityCollisionBuckets.set(key,bucket)}bucket.push(b);
 }
}
function nearbyBuildingColliders(x,z,r=.45){
 if(!cityCollisionBuckets.size)return buildingColliders;
 const minX=Math.floor((x-r)/CITY_COLLISION_BUCKET),maxX=Math.floor((x+r)/CITY_COLLISION_BUCKET);
 const minZ=Math.floor((z-r)/CITY_COLLISION_BUCKET),maxZ=Math.floor((z+r)/CITY_COLLISION_BUCKET);
 const found=[],seen=new Set();
 for(let iz=minZ;iz<=maxZ;iz++)for(let ix=minX;ix<=maxX;ix++){
   const bucket=cityCollisionBuckets.get(cityCollisionKey(ix,iz));if(!bucket)continue;
   for(const b of bucket)if(!seen.has(b)){seen.add(b);found.push(b)}
 }
 return found;
}
function insideBuilding(x,z,r=.45){
 // Hot path: collision probes run constantly for the player, zombies and A*.
 // Read the spatial buckets directly so common probes do not allocate a new
 // array + Set on every call. Duplicate bucket entries are harmless here
 // because this function only needs the first blocking collider.
 if(!cityCollisionBuckets.size){
   for(const b of buildingColliders){
     if(x>b.x-b.hx-r&&x<b.x+b.hx+r&&z>b.z-b.hz-r&&z<b.z+b.hz+r)return true
   }
   return false
 }
 const minX=Math.floor((x-r)/CITY_COLLISION_BUCKET),maxX=Math.floor((x+r)/CITY_COLLISION_BUCKET);
 const minZ=Math.floor((z-r)/CITY_COLLISION_BUCKET),maxZ=Math.floor((z+r)/CITY_COLLISION_BUCKET);
 for(let iz=minZ;iz<=maxZ;iz++)for(let ix=minX;ix<=maxX;ix++){
   const bucket=cityCollisionBuckets.get(cityCollisionKey(ix,iz));if(!bucket)continue;
   for(const b of bucket){
     if(x>b.x-b.hx-r&&x<b.x+b.hx+r&&z>b.z-b.hz-r&&z<b.z+b.hz+r)return true
   }
 }
 return false
}
function slideBuilding(oldx,oldz,newx,newz,r=.45){
 if(!insideBuilding(newx,newz,r))return{x:newx,z:newz};
 if(!insideBuilding(newx,oldz,r))return{x:newx,z:oldz};
 if(!insideBuilding(oldx,newz,r))return{x:oldx,z:newz};
 return{x:oldx,z:oldz};
}
function pushOutsideBuilding(x,z,r=.45){
 for(let pass=0;pass<4;pass++){
   let moved=false;
   for(const b of nearbyBuildingColliders(x,z,r)){
     const minX=b.x-b.hx-r,maxX=b.x+b.hx+r,minZ=b.z-b.hz-r,maxZ=b.z+b.hz+r;
     if(x>minX&&x<maxX&&z>minZ&&z<maxZ){
       const dL=x-minX,dR=maxX-x,dB=z-minZ,dT=maxZ-z,m=Math.min(dL,dR,dB,dT);
       if(m===dL)x=minX;else if(m===dR)x=maxX;else if(m===dB)z=minZ;else z=maxZ;
       moved=true;
     }
   }
   if(!moved)break;
 }
 return{x,z}
}

// v313: uploaded city GLB is now the entire active world environment.
// The old procedural ground, roads, sidewalks, buildings, lamps, barriers and road texture are not created.
const NEW_CITY_SCALE=1.55;
// Keep the exact v313 player/spawn anchor fixed while tuning the city scale.
const NEW_CITY_X_OFFSET=21.33575;
const NEW_CITY_Y_OFFSET=28.68275;
const NEW_CITY_Z_OFFSET=8.25;
let newCityRoot=null;
const newCitySpawnZones=[];
const playerGroundRaycaster=new THREE.Raycaster();
const playerGroundNormal=new THREE.Vector3();
const playerGroundNormalMatrix=new THREE.Matrix3();
const PLAYER_STEP_UP=.62,PLAYER_STEP_DOWN=1.35;
let playerGroundY=0;
buildingColliders.length=0;

function buildNewCitySpawnZones(map){
 newCitySpawnZones.length=0;
 if(typeof zombieSpawnPlayableCells!=="undefined"){zombieSpawnPlayableCells.clear();zombieSpawnPlayableCellsReady=false}
 map.updateMatrixWorld(true);
 const box3=new THREE.Box3(),size3=new THREE.Vector3();
 map.traverse(o=>{
   if(!o.isMesh||o.isSkinnedMesh)return;
   const name=o.name||"";
   // Restrict zombie spawns to true outdoor road / parking ground pieces.
   // Do not use the large BG block planes because buildings sit on top of them.
   if(!(/^Road_\d/i.test(name)||/^ParkingBG_/i.test(name)))return;
   box3.setFromObject(o);box3.getSize(size3);
   if(size3.y>.55||size3.x<1.4||size3.z<1.4)return;
   newCitySpawnZones.push({
     minX:box3.min.x,maxX:box3.max.x,
     minZ:box3.min.z,maxZ:box3.max.z,
     name,type:/^ParkingBG_/i.test(name)?"parking":"road"
   });
 });
 document.documentElement.dataset.newCitySpawnZones=String(newCitySpawnZones.length);
 console.log("CITY OUTBREAK: outdoor zombie spawn zones built",{count:newCitySpawnZones.length});
}
function pointNearNewCitySpawnZone(x,z,maxGap=12){
 for(const zone of newCitySpawnZones){
   const dx=x<zone.minX?zone.minX-x:x>zone.maxX?x-zone.maxX:0;
   const dz=z<zone.minZ?zone.minZ-z:z>zone.maxZ?z-zone.maxZ:0;
   if(dx*dx+dz*dz<=maxGap*maxGap)return true;
 }
 return false;
}
function samplePlayerGroundY(x,z,currentY){
 if(!newCityRoot)return currentY;
 playerGroundRaycaster.ray.origin.set(x,currentY+PLAYER_STEP_UP+.08,z);
 playerGroundRaycaster.ray.direction.set(0,-1,0);
 playerGroundRaycaster.near=0;
 playerGroundRaycaster.far=PLAYER_STEP_UP+PLAYER_STEP_DOWN+.22;
 const hits=playerGroundRaycaster.intersectObject(newCityRoot,true);
 for(const hit of hits){
   if(!hit.face||!hit.object||!hit.object.isMesh)continue;
   playerGroundNormalMatrix.getNormalMatrix(hit.object.matrixWorld);
   playerGroundNormal.copy(hit.face.normal).applyMatrix3(playerGroundNormalMatrix).normalize();
   // Only stand on upward-facing ground/treads; vertical walls remain wall collision.
   if(playerGroundNormal.y<.42)continue;
   const dy=hit.point.y-currentY;
   if(dy<=PLAYER_STEP_UP&&dy>=-PLAYER_STEP_DOWN)return hit.point.y;
 }
 return currentY;
}

// Gameplay uses this deterministic RNG in many systems; keep it independent of map generation.
let seed=73419;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}

// v324: selective collision generated from the uploaded city's real wall geometry, with finer passage precision.
// Only substantial near-vertical surfaces crossing player/zombie body height are used;
// roads, floors, roofs and shallow curbs stay walkable.
const NEW_CITY_COLLISION_CELL=.34;
const NEW_CITY_COLLISION_MIN_Y=.10;
const NEW_CITY_COLLISION_MAX_Y=2.25;
const NEW_CITY_COLLISION_MIN_VERTICAL_SPAN=.55;
const NEW_CITY_GROUND_BUCKET=3.0;
const NEW_CITY_GROUND_MIN_Y=-.35;
const NEW_CITY_GROUND_MAX_Y=7.5;
const ZOMBIE_STEP_UP=.62;
const ZOMBIE_STEP_DOWN=1.35;
const cityGroundBuckets=new Map();
let newCityCollisionReady=false;
function cityGroundKey(ix,iz){return ix+","+iz}
function indexCityGroundTriangle(t){
 const minX=Math.floor(t.minX/NEW_CITY_GROUND_BUCKET),maxX=Math.floor(t.maxX/NEW_CITY_GROUND_BUCKET);
 const minZ=Math.floor(t.minZ/NEW_CITY_GROUND_BUCKET),maxZ=Math.floor(t.maxZ/NEW_CITY_GROUND_BUCKET);
 for(let iz=minZ;iz<=maxZ;iz++)for(let ix=minX;ix<=maxX;ix++){
   const key=cityGroundKey(ix,iz);let bucket=cityGroundBuckets.get(key);
   if(!bucket){bucket=[];cityGroundBuckets.set(key,bucket)}bucket.push(t);
 }
}
function sampleZombieGroundY(x,z,currentY){
 const bucket=cityGroundBuckets.get(cityGroundKey(Math.floor(x/NEW_CITY_GROUND_BUCKET),Math.floor(z/NEW_CITY_GROUND_BUCKET)));
 if(!bucket)return currentY;
 let found=false,best=-Infinity;
 for(const t of bucket){
   if(x<t.minX-.001||x>t.maxX+.001||z<t.minZ-.001||z>t.maxZ+.001)continue;
   const den=(t.bz-t.cz)*(t.ax-t.cx)+(t.cx-t.bx)*(t.az-t.cz);
   if(Math.abs(den)<1e-8)continue;
   const wa=((t.bz-t.cz)*(x-t.cx)+(t.cx-t.bx)*(z-t.cz))/den;
   const wb=((t.cz-t.az)*(x-t.cx)+(t.ax-t.cx)*(z-t.cz))/den;
   const wc=1-wa-wb;
   if(wa<-.002||wb<-.002||wc<-.002)continue;
   const y=wa*t.ay+wb*t.by+wc*t.cy;
   if(y>currentY+ZOMBIE_STEP_UP||y<currentY-ZOMBIE_STEP_DOWN)continue;
   if(y>best){best=y;found=true}
 }
 return found?best:currentY;
}
function zombieSpawnGroundY(x,z){
 const bucket=cityGroundBuckets.get(cityGroundKey(Math.floor(x/NEW_CITY_GROUND_BUCKET),Math.floor(z/NEW_CITY_GROUND_BUCKET)));
 if(!bucket)return null;
 let found=false,best=-Infinity;
 for(const t of bucket){
   if(x<t.minX-.001||x>t.maxX+.001||z<t.minZ-.001||z>t.maxZ+.001)continue;
   const den=(t.bz-t.cz)*(t.ax-t.cx)+(t.cx-t.bx)*(t.az-t.cz);
   if(Math.abs(den)<1e-8)continue;
   const wa=((t.bz-t.cz)*(x-t.cx)+(t.cx-t.bx)*(z-t.cz))/den;
   const wb=((t.cz-t.az)*(x-t.cx)+(t.ax-t.cx)*(z-t.cz))/den;
   const wc=1-wa-wb;
   if(wa<-.002||wb<-.002||wc<-.002)continue;
   const y=wa*t.ay+wb*t.by+wc*t.cy;
   // Ground-floor / stoop / doorway surfaces only. Roofs and upper floors remain invalid.
   if(y<NEW_CITY_GROUND_MIN_Y-.02||y>.64)continue;
   if(y>best){best=y;found=true}
 }
 return found?best:null;
}
function sampleRagdollGroundY(x,z,currentFloor,bodyY){
 const bucket=cityGroundBuckets.get(cityGroundKey(Math.floor(x/NEW_CITY_GROUND_BUCKET),Math.floor(z/NEW_CITY_GROUND_BUCKET)));
 if(!bucket)return currentFloor;
 let found=false,best=-Infinity;
 for(const t of bucket){
   if(x<t.minX-.001||x>t.maxX+.001||z<t.minZ-.001||z>t.maxZ+.001)continue;
   const den=(t.bz-t.cz)*(t.ax-t.cx)+(t.cx-t.bx)*(t.az-t.cz);
   if(Math.abs(den)<1e-8)continue;
   const wa=((t.bz-t.cz)*(x-t.cx)+(t.cx-t.bx)*(z-t.cz))/den;
   const wb=((t.cz-t.az)*(x-t.cx)+(t.ax-t.cx)*(z-t.cz))/den;
   const wc=1-wa-wb;
   if(wa<-.002||wb<-.002||wc<-.002)continue;
   const y=wa*t.ay+wb*t.by+wc*t.cy;
   if(y>bodyY+.55)continue;
   if(y>best){best=y;found=true}
 }
 return found?best:currentFloor;
}
function buildNewCityCollision(map){
 buildingColliders.length=0;cityCollisionBuckets.clear();cityGroundBuckets.clear();
 map.updateMatrixWorld(true);

 const used=new Set(),a=new THREE.Vector3(),b=new THREE.Vector3(),cc=new THREE.Vector3();
 const ab=new THREE.Vector3(),ac=new THREE.Vector3(),normal=new THREE.Vector3();
 let meshCount=0,triangleCount=0,blockingTriangles=0;

 const mark=(x,z)=>{
   const ix=Math.floor(x/NEW_CITY_COLLISION_CELL),iz=Math.floor(z/NEW_CITY_COLLISION_CELL);
   used.add(ix+","+iz);
 };
 const sampleEdge=(p,q)=>{
   const dx=q.x-p.x,dz=q.z-p.z,dist=Math.hypot(dx,dz);
   const steps=Math.max(1,Math.ceil(dist/(NEW_CITY_COLLISION_CELL*.34)));
   for(let i=0;i<=steps;i++){
     const t=i/steps;mark(p.x+dx*t,p.z+dz*t);
   }
 };

 map.traverse(o=>{
   if(!o.isMesh||o.userData.replacedStreetLamp||o.isSkinnedMesh||!o.geometry||!o.geometry.attributes||!o.geometry.attributes.position)return;
   const pos=o.geometry.attributes.position,idx=o.geometry.index;
   meshCount++;
   const read=(out,vi)=>out.fromBufferAttribute(pos,vi).applyMatrix4(o.matrixWorld);
   const tris=idx?Math.floor(idx.count/3):Math.floor(pos.count/3);
   for(let t=0;t<tris;t++){
     const j=t*3,ia=idx?idx.getX(j):j,ib=idx?idx.getX(j+1):j+1,ic=idx?idx.getX(j+2):j+2;
     read(a,ia);read(b,ib);read(cc,ic);triangleCount++;
     const minY=Math.min(a.y,b.y,cc.y),maxY=Math.max(a.y,b.y,cc.y);
     ab.subVectors(b,a);ac.subVectors(cc,a);normal.crossVectors(ab,ac);
     const nl=normal.length();if(nl<1e-6)continue;
     const ny=normal.y/nl;

     // Build a cheap walkable-surface index for zombies. This mirrors the player's
     // upward-facing ground rule but avoids full-city raycasts during gameplay.
     if(ny>=.42&&minY>=NEW_CITY_GROUND_MIN_Y&&maxY<=NEW_CITY_GROUND_MAX_Y){
       const minX=Math.min(a.x,b.x,cc.x),maxX=Math.max(a.x,b.x,cc.x);
       const minZ=Math.min(a.z,b.z,cc.z),maxZ=Math.max(a.z,b.z,cc.z);
       const areaXZ=Math.abs((b.x-a.x)*(cc.z-a.z)-(b.z-a.z)*(cc.x-a.x));
       if(areaXZ>.0008)indexCityGroundTriangle({
         ax:a.x,ay:a.y,az:a.z,bx:b.x,by:b.y,bz:b.z,cx:cc.x,cy:cc.y,cz:cc.z,
         minX,maxX,minZ,maxZ
       });
     }

     if(maxY<NEW_CITY_COLLISION_MIN_Y||minY>NEW_CITY_COLLISION_MAX_Y||maxY-minY<NEW_CITY_COLLISION_MIN_VERTICAL_SPAN)continue;
     // Ignore floors, roofs and strong slopes for horizontal blocking; stair height
     // is handled by the walkable-ground index above.
     if(Math.abs(ny)>.38)continue;
     const spanX=Math.max(a.x,b.x,cc.x)-Math.min(a.x,b.x,cc.x);
     const spanZ=Math.max(a.z,b.z,cc.z)-Math.min(a.z,b.z,cc.z);
     const horizontalSpan=Math.max(spanX,spanZ),verticalSpan=maxY-minY;
     // Keep the old .12 threshold for short detail, but retain tall slender faces
     // (columns/pillars) down to .035 so they become solid without fattening walls.
     if(horizontalSpan<.035||(horizontalSpan<.12&&verticalSpan<1.10))continue;
     blockingTriangles++;
     sampleEdge(a,b);sampleEdge(b,cc);sampleEdge(cc,a);
   }
 });

 // Merge adjacent wall cells across each Z row into compact AABB strips. Doorways
 // remain open because no cells are created where the GLB has no wall triangles.
 const rows=new Map();
 for(const key of used){
   const comma=key.indexOf(","),ix=+key.slice(0,comma),iz=+key.slice(comma+1);
   let row=rows.get(iz);if(!row){row=[];rows.set(iz,row)}row.push(ix);
 }
 let colliderCount=0;
 for(const [iz,xs] of rows){
   xs.sort((m,n)=>m-n);
   let start=xs[0],prev=xs[0];
   const flush=end=>{
     const cells=end-start+1;
     const hit={
       x:(start+end+1)*NEW_CITY_COLLISION_CELL*.5,
       z:(iz+.5)*NEW_CITY_COLLISION_CELL,
       hx:Math.max(.08,cells*NEW_CITY_COLLISION_CELL*.5-.025),
       hz:NEW_CITY_COLLISION_CELL*.5-.025,
       source:"newCity"
     };
     buildingColliders.push(hit);indexCityCollider(hit);colliderCount++;
   };
   for(let i=1;i<xs.length;i++){
     const ix=xs[i];
     if(ix===prev||ix===prev+1){prev=ix;continue}
     flush(prev);start=prev=ix;
   }
   flush(prev);
 }
 ZNAV_BLOCK_CACHE.clear();
 zombieSpawnPlayableCellsReady=false;
 zombieSpawnPlayableCells.clear();
 newCityCollisionReady=true;
 document.documentElement.dataset.newCityCollision="1";
 document.documentElement.dataset.newCityColliderCount=String(colliderCount);document.documentElement.dataset.newCityGroundBuckets=String(cityGroundBuckets.size);
 console.log("CITY OUTBREAK: new city selective collision built",{
   meshCount,triangleCount,blockingTriangles,cells:used.size,colliderCount
 });
}

// v354: exact blockers for the broad City Hall staircase side walls shown in
// the player's screenshot. The v353 church guess was the wrong landmark.
// These four AABBs match the two stair-side walls on both CityHall instances.
function addCityHallStairSideWallColliders(map){
 const boxes=[
   // CityHall_01: staircase runs outward along Z.
   {minX:-18.096,maxX:-17.832,minZ:-43.100,maxZ:-36.698},
   {minX:-9.699,maxX:-9.434,minZ:-43.100,maxZ:-36.698},
   // CityHall_01__1: same staircase rotated 90 degrees in the authored map.
   {minX:35.663,maxX:42.065,minZ:-49.921,maxZ:-49.656},
   {minX:35.663,maxX:42.065,minZ:-41.523,maxZ:-41.259}
 ];
 const corners=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
 let added=0;
 for(const b of boxes){
   corners[0].set(b.minX,-17.45,b.minZ);
   corners[1].set(b.maxX,-17.45,b.minZ);
   corners[2].set(b.minX,-17.45,b.maxZ);
   corners[3].set(b.maxX,-17.45,b.maxZ);
   for(const p of corners)map.localToWorld(p);
   let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
   for(const p of corners){
     minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);
     minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z);
   }
   const hit={
     x:(minX+maxX)*.5,z:(minZ+maxZ)*.5,
     hx:(maxX-minX)*.5+.025,
     hz:(maxZ-minZ)*.5+.025,
     source:"cityHallStairSideWall"
   };
   buildingColliders.push(hit);indexCityCollider(hit);added++;
 }
 ZNAV_BLOCK_CACHE.clear();
 zombieSpawnPlayableCellsReady=false;
 zombieSpawnPlayableCells.clear();
 document.documentElement.dataset.cityHallStairWallColliders=String(added);
 console.log("CITY OUTBREAK: City Hall stair side-wall collision added",{added});
}

// v412: refine the approved photo-matched fence placement.
// Keep the exact alley between House_03__1_ and House_04__2_, but move the
// visible panel 15% of its original ~1.58m width deeper into the alley
// (~0.24m toward -X) and widen it slightly so each end overlaps the building
// edges instead of reading as a freestanding panel.
function addPhotoMatchedHouseGapFence(map){
 const source=map.getObjectByName("Fence_01__22_")||map.getObjectByName("Fence_01__28_")||map.getObjectByName("Fence_01");
 if(!source){console.warn("CITY OUTBREAK: v411 photo fence source not found");return}

 map.updateMatrixWorld(true);source.updateMatrixWorld(true);
 const mapInv=new THREE.Matrix4().copy(map.matrixWorld).invert();
 const rel=new THREE.Matrix4().multiplyMatrices(mapInv,source.matrixWorld);
 const basePos=new THREE.Vector3(),baseQuat=new THREE.Quaternion(),baseScale=new THREE.Vector3();
 rel.decompose(basePos,baseQuat,baseScale);

 // Clone the exact panel at its authored world orientation/scale first.
 const fence=source.clone(true);
 fence.name="PhotoMatchedHouseGapFence_v412";
 fence.matrixAutoUpdate=true;
 fence.position.copy(basePos);
 fence.quaternion.copy(baseQuat);
 fence.scale.copy(baseScale);
 fence.traverse(o=>{
   o.visible=true;
   o.userData.externalMapAsset=true;
   o.userData.v412PhotoGapFence=true;
   if(o.isMesh){o.castShadow=false;o.receiveShadow=false}
 });
 map.add(fence);
 map.updateMatrixWorld(true);fence.updateMatrixWorld(true);

 // The GLB fence root has a large internal pivot offset. Work from the
 // visible geometry itself, widen along its actual long axis, then re-center
 // the visible panel in the photographed opening.
 const box=new THREE.Box3().setFromObject(fence),size=new THREE.Vector3(),center=new THREE.Vector3();
 box.getSize(size);box.getCenter(center);

 // Target ~1.72m visible width: enough to overlap the ~1.50m opening by
 // roughly 11cm per side without making the panel look oversized.
 const currentLong=Math.max(size.x,size.z),targetLong=1.72,widen=targetLong/Math.max(.001,currentLong);
 if(size.z>=size.x)fence.scale.z*=widen;
 else fence.scale.x*=widen;
 fence.updateMatrixWorld(true);

 // "Back 15%" = 15% of the original ~1.58m panel width ~= 0.24m deeper
 // into the alley. The houses extend toward -X; the street is on +X.
 box.setFromObject(fence);box.getSize(size);box.getCenter(center);
 const targetWorld=new THREE.Vector3(-9.64-(1.58*.15),center.y,76.226);
 const currentLocal=map.worldToLocal(center.clone());
 const targetLocal=map.worldToLocal(targetWorld.clone());
 fence.position.add(targetLocal.sub(currentLocal));
 fence.updateMatrixWorld(true);

 box.setFromObject(fence);box.getSize(size);box.getCenter(center);
 const hit={
   x:center.x,z:center.z,
   hx:size.x*.5+.045,
   hz:size.z*.5+.045,
   source:"v412PhotoGapFence"
 };
 buildingColliders.push(hit);indexCityCollider(hit);
 ZNAV_BLOCK_CACHE.clear();
 zombieSpawnPlayableCellsReady=false;
 zombieSpawnPlayableCells.clear();
 document.documentElement.dataset.v412PhotoGapFence="1";
 console.log("CITY OUTBREAK: v412 widened/recessed photographed alley fence added",{
   gameCenter:[center.x,center.y,center.z],
   size:[size.x,size.y,size.z],
   targetGap:{left:"House_03__1_",right:"House_04__2_",width:1.502,centerZ:76.226,facadeX:-9.64}
 });
}

// v336: true one-for-one replacement of the city's 15 authored Light_01 lamps.
// Use each original lamp root's exact world origin and yaw. No extra lamps are
// added in this build; power-line-side placement will be handled only after these
// replacements are visually approved.
const STREET_LAMP_URL="assets/low_poly_street_light.glb";
const STREET_LAMP_HEIGHT_SCALE=1.40;
const streetLampInstances=[];

function scanExactCityLampAnchors(map){
 map.updateMatrixWorld(true);
 const lampRoots=[];
 map.traverse(o=>{
   if(o===map||o.isMesh)return;
   if(/^Light_01(?:$|_)/i.test(o.name||""))lampRoots.push(o);
 });
 const replacements=[];
 const pos=new THREE.Vector3(),center=new THREE.Vector3(),box=new THREE.Box3();
 for(const root of lampRoots){
   // The original lamp's root is its pole base. Its bounding-box center is
   // shifted toward the lamp arm/head, so this vector gives the authored
   // direction the old fixture actually faced.
   root.getWorldPosition(pos);
   box.setFromObject(root).getCenter(center);
   const dx=center.x-pos.x,dz=center.z-pos.z;
   const rotY=Math.hypot(dx,dz)>.01?Math.atan2(-dz,dx):0;
   replacements.push({
     x:pos.x,y:pos.y,z:pos.z,
     rotY,
     kind:"replacement",
     sourceName:root.name||""
   });
   root.traverse(n=>{n.userData.replacedStreetLamp=true});
   root.visible=false;
 }
 document.documentElement.dataset.authoredLampMatches=String(replacements.length);
 document.documentElement.dataset.streetLampReplacementCount=String(replacements.length);
 document.documentElement.dataset.streetLampAddedCount="0";
 console.log("CITY OUTBREAK: one-for-one lamp anchors scanned",{
   replacements:replacements.length,
   names:replacements.map(p=>p.sourceName)
 });
 return replacements;
}

// v341: five hand-placed additional street lamps on the curb opposite the
// long PowerLines_01 row. The approved v337 replacement lamps above remain
// untouched. These points are authored directly from the city GLB coordinates,
// with the church entrance/stair frontage intentionally left clear.
const EXTRA_STREET_LAMP_LOCAL_POINTS=[
 {x:-7.38,y:-18.45,z:-26.0,rotY:Math.PI},
 {x:-7.38,y:-18.45,z:-16.0,rotY:Math.PI},
 {x:-7.38,y:-18.45,z:4.0,rotY:Math.PI},
 {x:-7.38,y:-18.45,z:14.0,rotY:Math.PI},
 {x:-7.38,y:-18.45,z:30.0,rotY:Math.PI}
];
function buildManualAdditionalStreetLamps(map){
 const placements=[];
 const p=new THREE.Vector3();
 for(const spec of EXTRA_STREET_LAMP_LOCAL_POINTS){
   p.set(spec.x,spec.y,spec.z);
   map.localToWorld(p);
   placements.push({
     x:p.x,
     y:samplePlayerGroundY(p.x,p.z,p.y),
     z:p.z,
     rotY:spec.rotY,
     kind:"additional-manual"
   });
 }
 document.documentElement.dataset.streetLampCandidateCount=String(placements.length);
 document.documentElement.dataset.streetLampAddedCount=String(placements.length);
 console.log("CITY OUTBREAK: v341 manual additional street lamps built",{
   added:placements.length,
   localPoints:EXTRA_STREET_LAMP_LOCAL_POINTS
 });
 return placements;
}

// v342: tight pole-base collision for all placed street lamps.
// Only the vertical post is solid; the lamp arm/head does not create invisible walls.
const STREET_LAMP_COLLISION_HALF=.13;
function addStreetLampColliders(placements){
 let added=0;
 for(const p of placements){
   const hit={
     x:p.x,z:p.z,
     hx:STREET_LAMP_COLLISION_HALF,
     hz:STREET_LAMP_COLLISION_HALF,
     source:"streetLamp"
   };
   buildingColliders.push(hit);
   indexCityCollider(hit);
   added++;
 }
 ZNAV_BLOCK_CACHE.clear();
 zombieSpawnPlayableCellsReady=false;
 zombieSpawnPlayableCells.clear();
 document.documentElement.dataset.streetLampCollisionCount=String(added);
 console.log("CITY OUTBREAK: street lamp pole collision added",{
   count:added,halfSize:STREET_LAMP_COLLISION_HALF
 });
}

// v366: every street-lamp head now carries a cheap always-on emissive glow so
// lamps no longer appear to switch on just because the 4 real spotlights moved.
// The small spotlight pool is preserved for performance and follows the nearest
// lamps, while each lamp gets its own rare, unsynchronized horror flicker.
const STREET_LAMP_HEAD_LOCAL_X=2.607625;
const STREET_LAMP_HEAD_LOCAL_Y=5.785485;
const STREET_LAMP_LIGHT_POOL_SIZE=4;
const STREET_LAMP_LIGHT_RANGE=17;
const STREET_LAMP_LIGHT_INTENSITY=220;
const streetLampLightHeads=[];
const streetLampLightPool=[];
const streetLampLightTargets=[];
const streetLampFlickerStates=[];
const streetLampNearestScratch=[];
let streetLampGlowPoints=null;
let streetLampGlowBrightness=null;
let streetLampLightLastUpdate=-1e9;

function nextStreetLampFlickerTime(t){
 return t+14000+Math.random()*76000;
}
function setupStreetLampGlow(){
 if(streetLampGlowPoints||!streetLampLightHeads.length)return;
 const pos=new Float32Array(streetLampLightHeads.length*3);
 streetLampGlowBrightness=new Float32Array(streetLampLightHeads.length);
 for(let i=0;i<streetLampLightHeads.length;i++){
   const h=streetLampLightHeads[i],j=i*3;
   pos[j]=h.x;pos[j+1]=h.y;pos[j+2]=h.z;
   streetLampGlowBrightness[i]=1;
   streetLampFlickerStates.push({
     next:nextStreetLampFlickerTime(performance.now()+Math.random()*12000),
     until:0,seed:Math.random()*1000
   });
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
 geo.setAttribute("brightness",new THREE.BufferAttribute(streetLampGlowBrightness,1));
 const mat=new THREE.ShaderMaterial({
   transparent:true,
   depthWrite:false,
   depthTest:true,
   blending:THREE.AdditiveBlending,
   uniforms:{uColor:{value:new THREE.Color(0xffd27a)}},
   vertexShader:`
     attribute float brightness;
     varying float vBrightness;
     void main(){
       vBrightness=brightness;
       vec4 mv=modelViewMatrix*vec4(position,1.0);
       gl_PointSize=clamp(78.0/max(1.0,-mv.z),3.2,14.0);
       gl_Position=projectionMatrix*mv;
     }`,
   fragmentShader:`
     uniform vec3 uColor;
     varying float vBrightness;
     void main(){
       float d=length(gl_PointCoord-vec2(.5));
       float halo=1.0-smoothstep(.10,.50,d);
       float core=1.0-smoothstep(.02,.16,d);
       float a=(halo*.42+core*.58)*vBrightness;
       if(a<.01)discard;
       gl_FragColor=vec4(uColor,a);
     }`
 });
 streetLampGlowPoints=new THREE.Points(geo,mat);
 streetLampGlowPoints.name="StreetLampAlwaysOnGlow";
 streetLampGlowPoints.frustumCulled=false;
 streetLampGlowPoints.renderOrder=120;
 scene.add(streetLampGlowPoints);
}
function updateStreetLampFlicker(t){
 if(!streetLampGlowBrightness)return;
 let changed=false;
 for(let i=0;i<streetLampFlickerStates.length;i++){
   const s=streetLampFlickerStates[i];
   if(!s.until&&t>=s.next){
     s.until=t+90+Math.random()*330;
     s.seed=Math.random()*1000;
   }
   let brightness=1;
   if(s.until){
     if(t>=s.until){
       s.until=0;
       s.next=nextStreetLampFlickerTime(t);
     }else{
       const chaos=Math.sin((t+s.seed)*.082)+Math.sin((t+s.seed*7.1)*.193);
       brightness=chaos>1.0?.08:chaos>.30?.34:.72;
     }
   }
   if(Math.abs(streetLampGlowBrightness[i]-brightness)>.001){
     streetLampGlowBrightness[i]=brightness;
     changed=true;
   }
 }
 if(changed&&streetLampGlowPoints){
   streetLampGlowPoints.geometry.attributes.brightness.needsUpdate=true;
 }
}
function setupStreetLampLighting(placements){
 if(streetLampLightPool.length||!placements.length)return;
 for(const p of placements){
   const headX=p.x+Math.cos(p.rotY)*STREET_LAMP_HEAD_LOCAL_X;
   const headZ=p.z-Math.sin(p.rotY)*STREET_LAMP_HEAD_LOCAL_X;
   const headY=p.y+STREET_LAMP_HEAD_LOCAL_Y*STREET_LAMP_HEIGHT_SCALE;
   streetLampLightHeads.push({x:headX,y:headY,z:headZ,groundY:p.y});
 }
 setupStreetLampGlow();
 for(let i=0;i<Math.min(STREET_LAMP_LIGHT_POOL_SIZE,streetLampLightHeads.length);i++){
   const target=new THREE.Object3D();
   scene.add(target);
   const light=new THREE.SpotLight(
     0xffd27a,
     STREET_LAMP_LIGHT_INTENSITY,
     STREET_LAMP_LIGHT_RANGE,
     Math.PI/3.25,
     .58,
     1.65
   );
   light.castShadow=false;
   light.visible=true;
   light.target=target;
   light.userData.streetLampHeadIndex=-1;
   scene.add(light);
   streetLampLightTargets.push(target);
   streetLampLightPool.push(light);
 }
 document.documentElement.dataset.streetLampRealLights=String(streetLampLightPool.length);
 document.documentElement.dataset.streetLampAlwaysOnGlow=String(streetLampLightHeads.length);
 updateStreetLampLighting(performance.now(),true);
}
function updateStreetLampLighting(t,force=false){
 if(!streetLampLightPool.length)return;
 updateStreetLampFlicker(t);

 // Reassign the expensive real spotlights only at the old low frequency.
 // Their on/off state is no longer used for the normal lamp appearance.
 if(force||t-streetLampLightLastUpdate>=220){
   streetLampLightLastUpdate=t;
   if(streetLampNearestScratch.length!==streetLampLightHeads.length){
     streetLampNearestScratch.length=0;
     for(let i=0;i<streetLampLightHeads.length;i++)streetLampNearestScratch.push({i,d:0});
   }
   for(let i=0;i<streetLampLightHeads.length;i++){
     const h=streetLampLightHeads[i],pick=streetLampNearestScratch[i];
     pick.i=i;
     pick.d=(h.x-px)*(h.x-px)+(h.z-pz)*(h.z-pz);
   }
   streetLampNearestScratch.sort((a,b)=>a.d-b.d);
   for(let i=0;i<streetLampLightPool.length;i++){
     const light=streetLampLightPool[i],target=streetLampLightTargets[i],pick=streetLampNearestScratch[i];
     if(!pick)continue;
     const h=streetLampLightHeads[pick.i];
     light.position.set(h.x,h.y,h.z);
     target.position.set(h.x,h.groundY+.05,h.z);
     light.userData.streetLampHeadIndex=pick.i;
     light.visible=true;
   }
 }

 // Normally the real lights stay at full power. Only the rare per-lamp flicker
 // above is allowed to dip the matching spotlight intensity.
 for(const light of streetLampLightPool){
   const i=light.userData.streetLampHeadIndex;
   const brightness=i>=0&&streetLampGlowBrightness?streetLampGlowBrightness[i]:1;
   light.intensity=STREET_LAMP_LIGHT_INTENSITY*brightness;
   light.visible=true;
 }
}

function addStreetLamps(placements){
 if(streetLampInstances.length||!placements.length)return;
 new GLTFLoader().load(STREET_LAMP_URL,gltf=>{
   const source=gltf.scene;source.updateMatrixWorld(true);
   const sourceMeshes=[];source.traverse(o=>{if(o.isMesh)sourceMeshes.push(o)});
   const base=new THREE.Matrix4(),instanceMatrix=new THREE.Matrix4();
   const pos=new THREE.Vector3(),quat=new THREE.Quaternion(),scale=new THREE.Vector3(1,STREET_LAMP_HEIGHT_SCALE,1),yAxis=new THREE.Vector3(0,1,0);
   for(const src of sourceMeshes){
     const mats=Array.isArray(src.material)?src.material:[src.material];
     for(const mat of mats)if(mat&&mat.emissive&&mat.emissive.getHex()!==0){
       mat.emissiveIntensity=Math.max(mat.emissiveIntensity||1,2.35);
       mat.needsUpdate=true;
     }
     const inst=new THREE.InstancedMesh(src.geometry,src.material,placements.length);
     inst.name="StreetLampBatch";inst.castShadow=false;inst.receiveShadow=false;inst.userData.streetLampBatch=true;
     for(let i=0;i<placements.length;i++){
       const p=placements[i];
       pos.set(p.x,p.y,p.z);quat.setFromAxisAngle(yAxis,p.rotY);
       base.compose(pos,quat,scale);instanceMatrix.copy(base).multiply(src.matrixWorld);inst.setMatrixAt(i,instanceMatrix);
     }
     inst.instanceMatrix.needsUpdate=true;inst.computeBoundingSphere();scene.add(inst);streetLampInstances.push(inst);
   }
   document.documentElement.dataset.streetLampCount=String(placements.length);
   document.documentElement.dataset.streetLampBatches=String(streetLampInstances.length);
   console.log("CITY OUTBREAK: one-for-one replacement street lamps loaded",{
     total:placements.length,heightScale:STREET_LAMP_HEIGHT_SCALE
   });
 },undefined,err=>{
   document.documentElement.dataset.streetLampError=String(err&&err.message||err);
   console.error("Street lamp GLB load failed",err);
 });
}

new GLTFLoader().load("assets/chicken_gun_fruzer_-_city.glb?v=320",gltf=>{
 const map=gltf.scene;
 map.name="ChickenGunCityMap";
 map.scale.setScalar(NEW_CITY_SCALE);
 map.position.set(NEW_CITY_X_OFFSET,NEW_CITY_Y_OFFSET,NEW_CITY_Z_OFFSET);
 map.traverse(o=>{
   o.userData.externalMapAsset=true;
   if(!o.isMesh)return;
   o.castShadow=false;o.receiveShadow=false;
   const mats=Array.isArray(o.material)?o.material:[o.material];
   for(const mat of mats)if(mat){
     for(const key of ["map","normalMap","roughnessMap","metalnessMap","emissiveMap"]){
       const tx=mat[key];
       if(tx){tx.anisotropy=Math.min(4,ren.capabilities.getMaxAnisotropy());tx.needsUpdate=true}
     }
   }
 });
 scene.add(map);map.updateMatrixWorld(true);newCityRoot=map;
 applyWetCityMaterials(map);
 buildNewCitySpawnZones(map);
 const streetLampPlacements=scanExactCityLampAnchors(map);
 buildNewCityCollision(map);
 addCityHallStairSideWallColliders(map);
 addPhotoMatchedHouseGapFence(map);
 const additionalStreetLampPlacements=buildManualAdditionalStreetLamps(map);
 const allStreetLampPlacements=streetLampPlacements.concat(additionalStreetLampPlacements);
 addStreetLampColliders(allStreetLampPlacements);
 // Finalize spawn connectivity after every late-added blocker is installed.
 zombieSpawnPlayableCellsReady=false;zombieSpawnPlayableCells.clear();
 setupStreetLampLighting(allStreetLampPlacements);
 addStreetLamps(allStreetLampPlacements);
 const bounds=new THREE.Box3().setFromObject(map),size=new THREE.Vector3();bounds.getSize(size);
 document.documentElement.dataset.newCityLoaded="1";
 document.documentElement.dataset.newCityScale=String(NEW_CITY_SCALE);
 document.documentElement.dataset.newCitySize=[size.x.toFixed(2),size.y.toFixed(2),size.z.toFixed(2)].join("x");
 console.log("CITY OUTBREAK: new city GLB loaded",{
   scale:NEW_CITY_SCALE,
   size:[size.x,size.y,size.z],
   position:[NEW_CITY_X_OFFSET,NEW_CITY_Y_OFFSET,NEW_CITY_Z_OFFSET]
 });
},undefined,err=>{
 document.documentElement.dataset.newCityLoadError=String(err&&err.message||err);
 newCityCollisionReady=true;
 console.error("New city GLB load failed",err);
});

// v313: old hand-placed STI map props are disabled with the procedural city.
const parkedCars=[];

function carPointCollision(c,x,z,pad=.35){
 const dx=x-c.position.x,dz=z-c.position.z,a=c.rotation.y,co=Math.cos(a),si=Math.sin(a);
 const lx=co*dx-si*dz,lz=si*dx+co*dz;
 const hw=c.userData.carHalfW||.88,hl=c.userData.carHalfL||2.30;
 const qx=Math.max(Math.abs(lx)-hw,0),qz=Math.max(Math.abs(lz)-hl,0);
 return qx*qx+qz*qz<pad*pad;
}
const ZOMBIE_COLLISION_RADIUS=.38;
function zombiePointBlocked(x,z,r=ZOMBIE_COLLISION_RADIUS){
 if(insideBuilding(x,z,r))return true;
 for(const c of parkedCars)if(carPointCollision(c,x,z,r))return true;
 return false;
}
function chooseZombieAvoidSide(z,nx,nz,r=ZOMBIE_COLLISION_RADIUS){
 const sideX=-nz,sideZ=nx,probe=1.35;
 const lx=z.g.position.x+sideX*probe+nx*.20,lz=z.g.position.z+sideZ*probe+nz*.20;
 const rx=z.g.position.x-sideX*probe+nx*.20,rz=z.g.position.z-sideZ*probe+nz*.20;
 const leftFree=!zombiePointBlocked(lx,lz,r),rightFree=!zombiePointBlocked(rx,rz,r);
 if(leftFree&&!rightFree)return 1;
 if(rightFree&&!leftFree)return -1;
 if(leftFree&&rightFree){
   const ld=Math.hypot(px-lx,pz-lz),rd=Math.hypot(px-rx,pz-rz);
   return ld<=rd?1:-1;
 }
 return z.avoidSide||z.side||1;
}
function moveZombieSmart(z,ox,oz,stepX,stepZ,r=ZOMBIE_COLLISION_RADIUS){
 const tx=ox+stepX,tz=oz+stepZ;
 if(!zombiePointBlocked(tx,tz,r))return{x:tx,z:tz,blocked:false};

 const mag=Math.hypot(stepX,stepZ)||.001,nx=stepX/mag,nz=stepZ/mag;
 let side=z.avoidSide||z.side||1,sx=-nz*side,sz=nx*side;
 const tries=[
   [ox+sx*mag*1.18+nx*mag*.12,oz+sz*mag*1.18+nz*mag*.12],
   [ox+sx*mag*.92,oz+sz*mag*.92],
   [ox-sx*mag*1.05+nx*mag*.08,oz-sz*mag*1.05+nz*mag*.08]
 ];
 for(let i=0;i<tries.length;i++){
   const p=tries[i];
   if(!zombiePointBlocked(p[0],p[1],r)){
     if(i===2)z.avoidSide=-side;
     return{x:p[0],z:p[1],blocked:true};
   }
 }
 return{x:ox,z:oz,blocked:true};
}

// v152: keep city generation untouched and make pathfinding itself conservative.
 // Finer cells and realistic body clearance keep alleys, stoops and door approaches usable
 // while still routing zombies around true walls.
const ZNAV_CELL=1.0,ZNAV_PAD=.38,ZNAV_MAX_NODES=6000,
      ZNAV_MIN_X=-148,ZNAV_MAX_X=148,ZNAV_MIN_Z=-158,ZNAV_MAX_Z=164;
const ZNAV_BLOCK_CACHE=new Map();
function navCellBlocked(ix,iz){
 const key=ix+","+iz;
 if(ZNAV_BLOCK_CACHE.has(key))return ZNAV_BLOCK_CACHE.get(key);
 const blocked=zombiePointBlocked(ix*ZNAV_CELL,iz*ZNAV_CELL,ZNAV_PAD);
 ZNAV_BLOCK_CACHE.set(key,blocked);return blocked
}
const zombieSpawnPlayableCells=new Set();
let zombieSpawnPlayableCellsReady=false;
function zombieSpawnCellKey(ix,iz){return ix+","+iz}
function zombieSpawnCellOpen(ix,iz){
 const x=ix*ZNAV_CELL,z=iz*ZNAV_CELL;
 if(x<ZNAV_MIN_X+1||x>ZNAV_MAX_X-1||z<ZNAV_MIN_Z+1||z>ZNAV_MAX_Z-1)return false;
 if(!pointNearNewCitySpawnZone(x,z,12))return false;
 if(zombieSpawnGroundY(x,z)===null)return false;
 return !zombiePointBlocked(x,z,.46);
}
function buildConnectedZombieSpawnCells(){
 zombieSpawnPlayableCells.clear();
 zombieSpawnPlayableCellsReady=false;
 let sx=Math.round(px/ZNAV_CELL),sz=Math.round(pz/ZNAV_CELL),seed=null;
 for(let r=0;r<=5&&!seed;r++){
   for(let dz=-r;dz<=r&&!seed;dz++)for(let dx=-r;dx<=r;dx++){
     if(r&&Math.abs(dx)!==r&&Math.abs(dz)!==r)continue;
     const ix=sx+dx,iz=sz+dz;
     if(zombieSpawnCellOpen(ix,iz)){seed=[ix,iz];break}
   }
 }
 if(!seed)return;
 const qx=[seed[0]],qz=[seed[1]];
 let qi=0;
 zombieSpawnPlayableCells.add(zombieSpawnCellKey(seed[0],seed[1]));
 const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
 while(qi<qx.length){
   const cx=qx[qi],cz=qz[qi];qi++;
   for(const d of dirs){
     const nx=cx+d[0],nz=cz+d[1],key=zombieSpawnCellKey(nx,nz);
     if(zombieSpawnPlayableCells.has(key)||!zombieSpawnCellOpen(nx,nz))continue;
     // v389: neighboring grid cells only connect when a full zombie-width path
     // between their centers is clear. This stops the 1 m flood grid from
     // hopping across thin authored boundary walls.
     if(!zombieRouteClear(cx*ZNAV_CELL,cz*ZNAV_CELL,nx*ZNAV_CELL,nz*ZNAV_CELL,.46))continue;
     // Keep the diagonal no-corner-squeeze rule as a second guard.
     if(d[0]&&d[1]&&(!zombieSpawnCellOpen(cx+d[0],cz)||!zombieSpawnCellOpen(cx,cz+d[1])))continue;
     zombieSpawnPlayableCells.add(key);qx.push(nx);qz.push(nz);
   }
 }
 zombieSpawnPlayableCellsReady=true;
 document.documentElement.dataset.zombieSpawnPlayableCells=String(zombieSpawnPlayableCells.size);
 console.log("CITY OUTBREAK: connected zombie spawn area built",{cells:zombieSpawnPlayableCells.size,seed});
}
function zombieSpawnConnectedToPlayer(x,z){
 if(!zombieSpawnPlayableCellsReady)buildConnectedZombieSpawnCells();
 if(!zombieSpawnPlayableCellsReady)return false;
 const ix=Math.round(x/ZNAV_CELL),iz=Math.round(z/ZNAV_CELL);
 if(zombieSpawnPlayableCells.has(zombieSpawnCellKey(ix,iz)))return true;
 // Candidate may sit near a cell edge/door threshold; accept only if an adjacent
 // connected cell has direct body-clearance to the exact candidate point.
 for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
   const nx=ix+dx,nz=iz+dz;
   if(!zombieSpawnPlayableCells.has(zombieSpawnCellKey(nx,nz)))continue;
   if(zombieRouteClear(x,z,nx*ZNAV_CELL,nz*ZNAV_CELL,.46))return true;
 }
 return false;
}
function zombieRouteClear(x1,z1,x2,z2,r=ZNAV_PAD){
 const d=Math.hypot(x2-x1,z2-z1),steps=Math.max(1,Math.ceil(d/.85));
 for(let i=1;i<=steps;i++){
   const t=i/steps;
   if(zombiePointBlocked(x1+(x2-x1)*t,z1+(z2-z1)*t,r))return false;
 }
 return true;
}
function navNearestOpen(ix,iz,minX,maxX,minZ,maxZ){
 const open=(x,z)=>x>=minX&&x<=maxX&&z>=minZ&&z<=maxZ&&!navCellBlocked(x,z);
 if(open(ix,iz))return[ix,iz];
 for(let r=1;r<=4;r++){
   for(let x=ix-r;x<=ix+r;x++){
     if(open(x,iz-r))return[x,iz-r];
     if(open(x,iz+r))return[x,iz+r];
   }
   for(let z=iz-r+1;z<=iz+r-1;z++){
     if(open(ix-r,z))return[ix-r,z];
     if(open(ix+r,z))return[ix+r,z];
   }
 }
 return null;
}
function navHeapPush(heap,node){
 let i=heap.length;heap.push(node);
 while(i>0){
   const p=(i-1)>>1;
   if(heap[p].f<=node.f)break;
   heap[i]=heap[p];i=p;
 }
 heap[i]=node;
}
function navHeapPop(heap){
 if(!heap.length)return null;
 const root=heap[0],last=heap.pop();
 if(heap.length){
   let i=0;
   while(true){
     let l=i*2+1,r=l+1,b=i;
     if(l<heap.length&&heap[l].f<(b===i?last.f:heap[b].f))b=l;
     if(r<heap.length&&heap[r].f<(b===i?last.f:heap[b].f))b=r;
     if(b===i)break;
     heap[i]=heap[b];i=b;
   }
   heap[i]=last;
 }
 return root;
}
function buildZombieRoute(sx,sz,gx,gz){
 if(zombieRouteClear(sx,sz,gx,gz))return[];

 const margin=34,cell=ZNAV_CELL;
 let minX=Math.floor((Math.min(sx,gx)-margin)/cell),maxX=Math.ceil((Math.max(sx,gx)+margin)/cell);
 let minZ=Math.floor((Math.min(sz,gz)-margin)/cell),maxZ=Math.ceil((Math.max(sz,gz)+margin)/cell);
 // Search the full playable city instead of the old central-only rectangle.
 minX=Math.max(Math.floor(ZNAV_MIN_X/cell),minX);maxX=Math.min(Math.ceil(ZNAV_MAX_X/cell),maxX);
 minZ=Math.max(Math.floor(ZNAV_MIN_Z/cell),minZ);maxZ=Math.min(Math.ceil(ZNAV_MAX_Z/cell),maxZ);

 let s=navNearestOpen(Math.round(sx/cell),Math.round(sz/cell),minX,maxX,minZ,maxZ);
 let g=navNearestOpen(Math.round(gx/cell),Math.round(gz/cell),minX,maxX,minZ,maxZ);
 if(!s||!g)return null;

 const key=(x,z)=>x+","+z,goalKey=key(g[0],g[1]);
 const open=[],best=new Map(),closed=new Set();
 const h=(x,z)=>Math.hypot(g[0]-x,g[1]-z);
 const start={x:s[0],z:s[1],g:0,f:h(s[0],s[1]),parent:null};
 navHeapPush(open,start);best.set(key(start.x,start.z),0);
 const dirs=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[-1,1,1.414],[1,-1,1.414],[-1,-1,1.414]];
 let found=null,expanded=0;
 while(open.length&&expanded++<ZNAV_MAX_NODES){
   const cur=navHeapPop(open),ck=key(cur.x,cur.z);
   if(closed.has(ck))continue;
   if(ck===goalKey){found=cur;break}
   closed.add(ck);

   for(const d of dirs){
     const nx=cur.x+d[0],nz=cur.z+d[1];
     if(nx<minX||nx>maxX||nz<minZ||nz>maxZ)continue;
     const nk=key(nx,nz);if(closed.has(nk))continue;
     if(navCellBlocked(nx,nz))continue;
     if(d[0]&&d[1]){
       if(navCellBlocked(cur.x+d[0],cur.z)||navCellBlocked(cur.x,cur.z+d[1]))continue;
     }
     const ng=cur.g+d[2];
     if(ng>=(best.get(nk)??Infinity))continue;
     best.set(nk,ng);
     navHeapPush(open,{x:nx,z:nz,g:ng,f:ng+h(nx,nz),parent:cur});
   }
 }
 if(!found)return null;

 const raw=[];
 for(let n=found;n&&n.parent;n=n.parent)raw.push({x:n.x*cell,z:n.z*cell});
 raw.reverse();
 if(!raw.length)return[];

 // Line-of-sight smoothing removes grid zig-zag and leaves only useful corners.
 const smooth=[],origin={x:sx,z:sz};
 let anchor=origin,i=0;
 while(i<raw.length){
   let far=i;
   for(let j=i;j<raw.length;j++){
     if(zombieRouteClear(anchor.x,anchor.z,raw[j].x,raw[j].z,ZNAV_PAD))far=j;
     else break;
   }
   const p=raw[far];smooth.push(p);anchor=p;i=far+1;
 }
 // End at the real player point when it is reachable from the last waypoint.
 const last=smooth[smooth.length-1]||origin;
 if(zombieRouteClear(last.x,last.z,gx,gz,ZNAV_PAD))smooth.push({x:gx,z:gz});
 return smooth;
}
function updateZombieRoute(z,dt,huntMode,goalX=px,goalZ=pz){
 z.navCheckT=Math.max(0,(z.navCheckT||0)-dt);
 if(z.navPath&&z.navPath.length){
   while(z.navIndex<z.navPath.length){
     const w=z.navPath[z.navIndex];
     if(Math.hypot(w.x-z.g.position.x,w.z-z.g.position.z)<1.15)z.navIndex++;
     else break;
   }
   if(z.navIndex>=z.navPath.length){z.navPath=null;z.navIndex=0}
 }

 if(z.navCheckT>0)return;
 // Stagger route checks per zombie and run them less often; movement/avoidance still runs every frame.
 z.navCheckT=(huntMode?.46:.78)+((z.g.id%7)*.035);

 const goalMoved=Math.hypot(goalX-(z.navGoalX??goalX),goalZ-(z.navGoalZ??goalZ))>(huntMode?3.2:4.8);
 // Direct pursuit should use the zombie's real physical clearance. A* keeps
 // its slightly larger conservative padding for routing around obstacles.
 // This also lets a Radiated Green Guy route toward a thrown spin-top grenade.
 const directClear=zombieRouteClear(z.g.position.x,z.g.position.z,goalX,goalZ,ZOMBIE_COLLISION_RADIUS);
 if(directClear){
   z.navPath=null;z.navIndex=0;z.navGoalX=goalX;z.navGoalZ=goalZ;
   return;
 }
 if(!z.navPath||goalMoved||z.navForceRepath){
   const route=buildZombieRoute(z.g.position.x,z.g.position.z,goalX,goalZ);
   z.navForceRepath=false;
   z.navGoalX=goalX;z.navGoalZ=goalZ;
   if(route&&route.length){z.navPath=route;z.navIndex=0;z.avoidT=0}
   else{
     z.navPath=null;z.navIndex=0;
     const dx=goalX-z.g.position.x,dz=goalZ-z.g.position.z,dl=Math.hypot(dx,dz)||1;
     z.avoidSide=chooseZombieAvoidSide(z,dx/dl,dz/dl,.52);
     z.avoidT=Math.max(z.avoidT||0,.90);
     z.navCheckT=.24;
   }
 }
}
function zombieRouteWaypoint(z){
 if(!z.navPath||z.navIndex>=z.navPath.length)return null;
 return z.navPath[z.navIndex];
}

const gun=new THREE.Group();cam.add(gun);scene.add(cam);let muzzle;
// External M4 Carbine visual. The GLB is the sole M4 viewmodel; rebuild when loaded.
let m4ModelTemplate=null,m4AdsOccluders=[],m4ViewRoot=null;
new GLTFLoader().load("assets/ar-15_style_rifle.glb?v=466",gltf=>{
 m4ModelTemplate=gltf.scene;
 m4ModelTemplate.traverse(o=>{
   o.userData.externalWeaponAsset=true;
   if(o.isMesh){
     o.castShadow=false;o.receiveShadow=false;
     const mats=Array.isArray(o.material)?o.material:[o.material];
     for(const mat of mats)if(mat){
       for(const key of ["map","normalMap","roughnessMap","metalnessMap"]){
         const tx=mat[key];if(tx){tx.anisotropy=Math.min(4,ren.capabilities.getMaxAnisotropy());tx.needsUpdate=true}
       }
     }
   }
 });
 if(weapon==="rifle")rebuildGun();
},undefined,err=>console.warn("M4 GLB load failed; M4 viewmodel unavailable",err));
// Supplied SIG Sauer M17 GLB. The GLB is the sole visible M17 viewmodel.
let m17ModelTemplate=null;
new GLTFLoader().load("assets/low-poly_sig_sauer_m17.glb",gltf=>{
 m17ModelTemplate=gltf.scene;
 m17ModelTemplate.traverse(o=>{
   o.userData.externalWeaponAsset=true;
   if(o.isMesh){
     o.castShadow=false;o.receiveShadow=false;
     const mats=Array.isArray(o.material)?o.material:[o.material];
     for(const mat of mats)if(mat)for(const key of ["map","normalMap","roughnessMap","metalnessMap"]){
       const tx=mat[key];if(tx){tx.anisotropy=Math.min(4,ren.capabilities.getMaxAnisotropy());tx.needsUpdate=true}
     }
   }
 });
 if(weapon==="pistol")rebuildGun();
},undefined,err=>console.warn("M17 GLB load failed; M17 viewmodel unavailable",err));
// Supplied animated MP5 GLB. Use it as the SMG viewmodel while preserving existing MP5 gameplay.
let mp5ModelTemplate=null,mp5Animations=[],mp5ViewRoot=null,mp5RecoilPivot=null;
new GLTFLoader().load("assets/animated_mp5.glb",gltf=>{
 mp5ModelTemplate=gltf.scene;
 mp5Animations=gltf.animations||[];
 mp5ModelTemplate.traverse(o=>{
   o.userData.externalWeaponAsset=true;
   if(o.isMesh){
     o.castShadow=false;o.receiveShadow=false;
     const mats=Array.isArray(o.material)?o.material:[o.material];
     for(const mat of mats)if(mat)for(const key of ["map","normalMap","roughnessMap","metalnessMap"]){
       const tx=mat[key];if(tx){tx.anisotropy=Math.min(4,ren.capabilities.getMaxAnisotropy());tx.needsUpdate=true}
     }
   }
 });
 if(weapon==="smg")rebuildGun();
},undefined,err=>console.warn("MP5 GLB load failed; MP5 viewmodel unavailable",err));
let m240ModelTemplate=null,m240ViewRoot=null,m240ViewModel=null,m240ViewBasePos=null,m240ViewBaseQuat=null,m240BarrelKick=0;
const m240RecoilAxis=new THREE.Vector3(1,0,0),m240RecoilPoint=new THREE.Vector3(0,0,-1.82),m240RecoilQuat=new THREE.Quaternion();
new GLTFLoader().load("assets/m240b_machine_gun.glb",gltf=>{
 m240ModelTemplate=gltf.scene;
 m240ModelTemplate.traverse(o=>{o.userData.externalWeaponAsset=true;if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
 if(weapon==="m240")rebuildGun();
});

// v392: user-supplied grenade GLB pivots from its bottom center and spins
// 360 degrees around its vertical Y axis, like a top rotating on its base.
let grenadeModelTemplate=null;
new GLTFLoader().load("assets/spintop.glb?v=391",gltf=>{
 const holder=new THREE.Group(),model=gltf.scene;
 model.traverse(o=>{
   o.userData.externalGrenadeAsset=true;
   if(o.isMesh){o.castShadow=false;o.receiveShadow=false}
 });
 model.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(model);
 const center=new THREE.Vector3(),size=new THREE.Vector3();
 box.getCenter(center);box.getSize(size);
 // X/Z stay centered, but Y uses the model's lowest point as the rotation pivot.
 model.position.x-=center.x;
 model.position.z-=center.z;
 model.position.y-=box.min.y;
 holder.add(model);
 const maxDim=Math.max(size.x,size.y,size.z,.001);
 holder.scale.setScalar(.30/maxDim);
 holder.name="GrenadeGLBTemplate";
 holder.userData.bottomYPivot=true;
 grenadeModelTemplate=holder;
},undefined,err=>console.warn("Grenade GLB load failed; grenade unavailable",err));
let playerHandRig=null,playerReloadPart=null,reloadStartedAt=0,reloadDurationMs=0,reloadWeapon="",reloadOldMagDropped=false,reloadFreshMag=null,reloadFreshInsertStart=null,reloadFreshInsertQuat=null,reloadFreshAttached=false,reloadMagInserted=false,reloadSequence=0,runSequence=0,launcherBreakRig=null,launcherFreshRound=null,launcherChamberRound=null,launcherRoundSeated=false;
const FX={
 bloodGeoSmall:new THREE.SphereGeometry(.04,5,4),
 bloodGeoBig:new THREE.SphereGeometry(.075,5,4),
 bloodMat:new THREE.MeshStandardMaterial({color:0x760909,roughness:.9}),
 boneMat:new THREE.MeshStandardMaterial({color:0x82745c,roughness:.85}),
 impactGeo:new THREE.SphereGeometry(.025,4,3),
 impactMat:new THREE.MeshStandardMaterial({color:0xbbb6a8,roughness:.8}),
 casingGeo:new THREE.CylinderGeometry(.025,.025,.12,7),
 casingMat:new THREE.MeshStandardMaterial({color:0xb88a32,roughness:.35}),
 explosionGeo:new THREE.SphereGeometry(.055,5,4),
 launcherDustMat:new THREE.MeshStandardMaterial({color:0x695946,roughness:.82}),
 launcherFlashMat:new THREE.MeshStandardMaterial({color:0xd8a34a,roughness:.58,emissive:0x5a3108,emissiveIntensity:.32}),
 grenadeDustMat:new THREE.MeshStandardMaterial({color:0x5c5142,roughness:.86}),
 grenadeFlashMat:new THREE.MeshStandardMaterial({color:0xd29a46,roughness:.58,emissive:0x542b08,emissiveIntensity:.30})
};
function capFX(){
 while(parts.length>64){const p=parts.shift();if(p&&p.q&&p.q.parent)scene.remove(p.q)}
 while(impacts.length>24){const p=impacts.shift();if(p&&p.q&&p.q.parent)scene.remove(p.q)}
 while(casings.length>18){const c=casings.shift();if(c&&c.q&&c.q.parent)scene.remove(c.q)}
}
let zombies=[],kits=[],drops=[],parts=[],casings=[],impacts=[],px=0,pz=-15,yaw=0,pitch=0,health=100,kills=0,heads=0,cash=0,wave=1,weapon="rifle",magSize=12,damageLevel=1,reloadLevel=0,unlocked={rifle:true,smg:false,shotgun:false,pistol:true,dmr:false,grenadeLauncher:false,m240:false,awm:false},ammoState={rifle:{mag:12,reserve:72},smg:{mag:30,reserve:90},shotgun:{mag:8,reserve:30},pistol:{mag:16,reserve:999999},dmr:{mag:10,reserve:30},grenadeLauncher:{mag:0,reserve:0},m240:{mag:100,reserve:200},awm:{mag:5,reserve:20}},grenades=2,nukes=0,nukeInProgress=false,waveTarget=0,waveSpawned=0,currentBoss=null,bossWaveName="",usedBossNames=[],running=false,dying=false,reloading=false,between=false,paused=false,pauseStartedAt=0,pausedAccumulatedMs=0,recoil=0,stepTimer=0,aimX=0,aimY=0,last=performance.now(),playerVX=0,playerVZ=0,lastPX=0,lastPZ=-15,lookSensitivity=.0024,keys={w:false,a:false,s:false,d:false,shift:false},hitTimer,triggerHeld=false,autoDelay=null,autoTimer=null,sprintEnergy=100,sprintLocked=false,aiming=false,aimBlend=0,awmReadyAt=0,runStartTime=0;
let shopLowPower=false,shopPauseStartedAt=0,shopPausedAccumulatedMs=0,lastShopRenderAt=0;
const PLAYER_HEALTH_REGEN_DELAY=5,PLAYER_HEALTH_REGEN_RATE=10;
let healthRegenCooldown=0,healthRegenShown=100;
function gameTimeNow(){
 const now=performance.now();
 const manualPause=paused?now-pauseStartedAt:0;
 const shopPause=shopLowPower?now-shopPauseStartedAt:0;
 return now-pausedAccumulatedMs-shopPausedAccumulatedMs-manualPause-shopPause;
}
function gameTimeout(fn,ms){
 const deadline=gameTimeNow()+ms;
 const check=()=>{
   const remaining=deadline-gameTimeNow();
   const timeFrozen=paused||shopLowPower;
   if(timeFrozen||remaining>1){setTimeout(check,timeFrozen?180:Math.min(180,Math.max(4,remaining)));return}
   fn();
 };
 return setTimeout(check,Math.max(0,ms));
}

const weaponDefs={
 rifle:{name:"M4 CARBINE",rate:105,hold:190,spread:.004,pellets:1,body:1,recoil:.105,baseMag:12},
 smg:{name:"MP5",rate:72,hold:150,spread:.012,pellets:1,body:.75,recoil:.065,baseMag:30},
 shotgun:{name:"SHOTGUN",rate:520,hold:9999,spread:.090,pellets:8,body:.72,recoil:.22,baseMag:8},
 pistol:{name:"M17 SIG",rate:240,hold:9999,spread:.007,pellets:1,body:.82,recoil:.09,baseMag:16},
 dmr:{name:"DMR",rate:330,hold:9999,spread:.0025,pellets:1,body:2.15,recoil:.16,baseMag:10},
 grenadeLauncher:{name:"GRENADE LAUNCHER",rate:900,hold:9999,spread:0,pellets:1,body:0,recoil:.28,baseMag:6},
 m240:{name:"M240 LMG",rate:78,hold:78,spread:.010,pellets:1,body:1.20,recoil:.09,baseMag:100},
 awm:{name:"AWM ULTIMATE",rate:1150,hold:9999,spread:.00055,pellets:1,body:8.0,recoil:.30,baseMag:5}
};
const ADS={
 rifle:{x:-.36,y:.030,z:.72,fov:48,rx:0},
 smg:{x:-.36,y:-.050,z:1.28,fov:55,rx:-.01},
 shotgun:{x:-.36,y:.025,z:-.48,fov:56,rx:0},
 pistol:{x:-.36,y:.058,z:-.32,fov:55,rx:.045},
 dmr:{x:-.36,y:.010,z:-1.00,fov:48,rx:0},
 grenadeLauncher:{x:-.36,y:.040,z:-.45,fov:56,rx:0},
 m240:{x:-.36,y:.01,z:1.20,fov:56,rx:0},
 awm:{x:-.36,y:.005,z:-.62,fov:28,rx:0}
};
function ads(){return ADS[weapon]||ADS.rifle}
function wd(){return weaponDefs[weapon]}
function maxMag(w=weapon){
 if(w==="grenadeLauncher")return 6;
 const base=weaponDefs[w].baseMag;
 return base+(w==="shotgun"?Math.floor((magSize-12)/5):Math.max(0,magSize-12));
}
function A(){return ammoState[weapon]}

function cyl(rad,len,mat,x,y,z,parent=gun,axis="z"){
 const q=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,len,14),mat);
 if(axis==="z")q.rotation.x=Math.PI/2; else if(axis==="x")q.rotation.z=Math.PI/2;
 q.position.set(x,y,z);q.castShadow=true;parent.add(q);return q
}
function bevelBox(w,hh,d,mat,x,y,z,parent=gun){
 const shape=new THREE.Shape();let r=Math.min(w,hh)*.12;
 shape.moveTo(-w/2+r,-hh/2);shape.lineTo(w/2-r,-hh/2);shape.quadraticCurveTo(w/2,-hh/2,w/2,-hh/2+r);
 shape.lineTo(w/2,hh/2-r);shape.quadraticCurveTo(w/2,hh/2,w/2-r,hh/2);shape.lineTo(-w/2+r,hh/2);
 shape.quadraticCurveTo(-w/2,hh/2,-w/2,hh/2-r);shape.lineTo(-w/2,-hh/2+r);shape.quadraticCurveTo(-w/2,-hh/2,-w/2+r,-hh/2);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelThickness:.025,bevelSize:.02,bevelSegments:2});
 geo.center();let q=new THREE.Mesh(geo,mat);q.position.set(x,y,z);q.castShadow=true;parent.add(q);return q
}
const HAND_POSES={
 rifle:{left:[.18,-.45,-1.72],right:[.36,-.62,-.74],reload:[.10,-.16,.50]},
 smg:{left:[.22,-.54,-1.72],right:[.50,-.68,-1.18],reload:[.10,-.18,.31]},
 shotgun:{left:[.17,-.43,-1.83],right:[.36,-.61,-.72],reload:[.08,-.14,.63]},
 pistol:{left:[.31,-.38,-.84],right:[.40,-.36,-.82],reload:[.14,-.13,.07]},
 dmr:{left:[.17,-.46,-2.00],right:[.36,-.63,-.80],reload:[.10,-.16,.66]},
 grenadeLauncher:{left:[.17,-.46,-1.58],right:[.36,-.62,-.76],reload:[.09,-.13,.58]},
 m240:{left:[.15,-.45,-2.03],right:[.36,-.64,-.82],reload:[.32,-.18,.55]},
 awm:{left:[.16,-.46,-2.08],right:[.36,-.64,-.82],reload:[.10,-.14,.70]}
};
function fpsArmSegment(a,b,r,mat,parent){
 const d=new THREE.Vector3().subVectors(b,a),len=d.length(),mid=new THREE.Vector3().addVectors(a,b).multiplyScalar(.5);
 const q=new THREE.Mesh(new THREE.CylinderGeometry(r*.90,r,len,8),mat);q.position.copy(mid);
 q.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());q.castShadow=false;q.receiveShadow=false;parent.add(q);return q
}
function fpsHand(parent,hand,side,glove){
 const palm=new THREE.Mesh(new THREE.SphereGeometry(.105,9,7),glove);palm.scale.set(.92,1.00,1.30);palm.position.copy(hand);palm.castShadow=false;parent.add(palm);
 const thumb=new THREE.Mesh(new THREE.CylinderGeometry(.030,.038,.13,7),glove);thumb.position.set(hand.x+(side==='left'?.085:-.085),hand.y+.015,hand.z+.025);thumb.rotation.z=side==='left'?-.75:.75;thumb.rotation.x=.28;thumb.castShadow=false;parent.add(thumb);
 for(let i=0;i<3;i++){const f=new THREE.Mesh(new THREE.CylinderGeometry(.020,.024,.13,6),glove);f.position.set(hand.x+(i-1)*.045,hand.y-.035,hand.z-.060);f.rotation.x=Math.PI/2;f.castShadow=false;parent.add(f)}
}
function addPlayerHands(){
 const pose=HAND_POSES[weapon]||HAND_POSES.rifle;
 const sleeve=M(0x27302d,.88),cuff=M(0x171b1b,.90),glove=M(0x111414,.82);
 const right=new THREE.Group(),left=new THREE.Group();right.name='RightPlayerArm';left.name='LeftPlayerArm';gun.add(right,left);
 // The pistol support hand was visually swallowing the reload magazine. Scale only
 // the M17 left-hand/arm geometry down while preserving the approved animation path.
 if(weapon==='pistol')left.scale.setScalar(.72);
 const rs=new THREE.Vector3(.80,-1.12,.08),ls=new THREE.Vector3(-.35,-1.08,.06),rh=new THREE.Vector3(...pose.right),lh=new THREE.Vector3(...pose.left);
 const rm=new THREE.Vector3().lerpVectors(rs,rh,.58),lm=new THREE.Vector3().lerpVectors(ls,lh,.58);
 fpsArmSegment(rs,rm,.105,sleeve,right);fpsArmSegment(rm,weapon==='pistol'?rh.clone().lerp(rm,.14):rh,.086,cuff,right);fpsHand(right,rh,'right',glove);
 fpsArmSegment(ls,lm,.105,sleeve,left);fpsArmSegment(lm,weapon==='pistol'?lh.clone().lerp(lm,.14):lh,.086,cuff,left);fpsHand(left,lh,'left',glove);
 playerHandRig={right,left,pose};
}
function smoothReload01(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)}
const DETACHABLE_RELOAD_WEAPONS=new Set(["rifle","smg","pistol","dmr","m240","awm"]);
function detachableMagazineReload(w=reloadWeapon||weapon){return DETACHABLE_RELOAD_WEAPONS.has(w)&&!!playerReloadPart}
function reloadPoseProgress(){
 if(!reloading||reloadDurationMs<=0)return{p:0,arch:0,hand:0,pull:0,pouch:0,grab:0};
 const p=Math.max(0,Math.min(1,(gameTimeNow()-reloadStartedAt)/reloadDurationMs));
 const arch=Math.sin(Math.PI*p);
 if(!detachableMagazineReload()){
   const hand=p<.25?smoothReload01(p/.25):p<.76?1:smoothReload01((1-p)/.24);
   return{p,arch,hand,pull:0,pouch:0,grab:0};
 }
 // Clear readable beats: reach mag -> pull it free -> empty hand to pouch -> fresh mag back up -> seat it.
 const hand=p<.16?smoothReload01(p/.16):p<.86?1:smoothReload01((1-p)/.14);
 const pull=p<.16?0:p<.32?smoothReload01((p-.16)/.16):1;
 const pouch=p<.30?0:p<.48?smoothReload01((p-.30)/.18):p<.56?1:p<.76?smoothReload01((.76-p)/.20):0;
 return{p,arch,hand,pull,pouch,grab:0};
}
function clearReloadMagazineFX(showReal=true){
 if(reloadFreshMag&&reloadFreshMag.parent)reloadFreshMag.parent.remove(reloadFreshMag);
 reloadFreshMag=null;reloadFreshInsertStart=null;reloadFreshInsertQuat=null;reloadFreshAttached=false;
 if(launcherFreshRound&&launcherFreshRound.parent)launcherFreshRound.parent.remove(launcherFreshRound);
 launcherFreshRound=null;launcherRoundSeated=false;
 if(launcherBreakRig)launcherBreakRig.rotation.x=0;
 if(launcherChamberRound)launcherChamberRound.visible=false;
 reloadOldMagDropped=false;reloadMagInserted=false;
 if(showReal&&playerReloadPart){
   if(playerReloadPart.userData.reloadOnly)playerReloadPart.traverse(o=>{if(o.isMesh)o.visible=false});else playerReloadPart.visible=true;
   if(playerReloadPart.userData.reloadHome)playerReloadPart.position.copy(playerReloadPart.userData.reloadHome);
   if(playerReloadPart.userData.reloadHomeQuat)playerReloadPart.quaternion.copy(playerReloadPart.userData.reloadHomeQuat);
 }
}
function beginReloadMagazineFX(){
 clearReloadMagazineFX(true);
 reloadOldMagDropped=false;reloadMagInserted=false;
 if(playerReloadPart&&playerReloadPart.userData.reloadOnly)playerReloadPart.traverse(o=>{if(o.isMesh)o.visible=true});
}
function makeLauncherReloadRound(parent){
 const round=new THREE.Group();
 const bodyMat=M(0x55643d,.62),rimMat=M(0xc39a4c,.34),noseMat=M(0x465638,.72);
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.095,.098,.30,10),bodyMat);body.rotation.x=Math.PI/2;body.castShadow=false;round.add(body);
 const rim=new THREE.Mesh(new THREE.CylinderGeometry(.108,.108,.050,10),rimMat);rim.rotation.x=Math.PI/2;rim.position.z=.163;rim.castShadow=false;round.add(rim);
 const nose=new THREE.Mesh(new THREE.SphereGeometry(.094,10,7),noseMat);nose.scale.set(1,1,.72);nose.position.z=-.155;nose.castShadow=false;round.add(nose);
 parent.add(round);return round
}
function updateGrenadeLauncherReloadFX(rp){
 if(!reloading||reloadWeapon!=="grenadeLauncher"||!launcherBreakRig)return;
 const p=rp.p;
 // Break the front half downward, hold it fully open while the round is loaded, then snap it shut.
 const open=p<.20?smoothReload01(p/.20):p<.78?1:smoothReload01((1-p)/.22);
 launcherBreakRig.rotation.x=-.72*open;

 // A fresh grenade appears once the support hand reaches the pouch, then rides with the hand to the breech.
 if(p>=.36&&!launcherFreshRound&&!launcherRoundSeated&&playerHandRig){
   launcherFreshRound=makeLauncherReloadRound(playerHandRig.left);
   const hp=playerHandRig.pose.left;
   launcherFreshRound.position.set(hp[0]+.055,hp[1]-.020,hp[2]-.030);
   launcherFreshRound.rotation.set(.06,0,-.04);
 }
 if(p>=.69&&!launcherRoundSeated){
   if(launcherFreshRound&&launcherFreshRound.parent)launcherFreshRound.parent.remove(launcherFreshRound);
   launcherFreshRound=null;launcherRoundSeated=true;
   if(launcherChamberRound)launcherChamberRound.visible=true;
   tone(540,.035,"square",.075);tone(760,.025,"square",.055,.035);
 }
}
function tossOldReloadMagazine(){
 if(!detachableMagazineReload()||reloadOldMagDropped||!playerReloadPart.parent)return;
 const oldMag=playerReloadPart.clone(true);oldMag.name="DiscardedMagazine";oldMag.visible=true;
 oldMag.traverse(o=>{o.visible=true;if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
 // MP5 magazine lives inside the imported MP5 hierarchy. Preserve its exact
 // world transform when cloning it out for the drop. Other weapons keep the proven path.
 if(reloadWeapon==="smg"){
   playerReloadPart.updateMatrixWorld(true);
   const magWorld=playerReloadPart.matrixWorld.clone();
   scene.add(oldMag);
   magWorld.decompose(oldMag.position,oldMag.quaternion,oldMag.scale);
 }else{
   gun.add(oldMag);
   oldMag.position.copy(playerReloadPart.position);oldMag.quaternion.copy(playerReloadPart.quaternion);oldMag.scale.copy(playerReloadPart.scale);
   gun.updateMatrixWorld(true);oldMag.updateMatrixWorld(true);scene.attach(oldMag);
 }
 // Keep the discarded mag in the player's view for a moment instead of firing it off-screen.
 // Drop mostly straight down in camera space so it stays under the pistol on screen.
 const throwV=new THREE.Vector3(-.04,-.26,-.02).applyQuaternion(cam.quaternion);
 parts.push({q:oldMag,v:throwV,life:2.15,reloadMag:true,spin:new THREE.Vector3(4.2,3.1,5.0)});
 playerReloadPart.traverse(o=>{if(o.isMesh)o.visible=false});reloadOldMagDropped=true;
}
function spawnFreshReloadMagazine(){
 if(!detachableMagazineReload()||reloadFreshMag||reloadMagInserted||!playerHandRig)return;
 const fresh=playerReloadPart.clone(true);fresh.name="FreshReloadMagazine";fresh.visible=true;
 fresh.traverse(o=>{o.visible=true;if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
 playerHandRig.left.add(fresh);
 // Local coordinates here are relative to the hand itself. Do not add the hand's
 // gun-space pose a second time; that was placing the fresh magazine far away.
 const homeQ=playerReloadPart.userData.reloadHomeQuat||playerReloadPart.quaternion;
 if(reloadWeapon==="rifle"){
   // The M4 magazine home quaternion is gun-local. Convert that orientation into
   // left-hand local space so the fresh magazine is already aligned with the real
   // magwell while the player is carrying it, instead of rotating sideways later.
   fresh.position.set(.02,.10,-.015);
   gun.updateMatrixWorld(true);playerHandRig.left.updateMatrixWorld(true);
   const gunWorldQ=new THREE.Quaternion(),handWorldQ=new THREE.Quaternion();
   gun.getWorldQuaternion(gunWorldQ);playerHandRig.left.getWorldQuaternion(handWorldQ);
   const magWorldQ=gunWorldQ.clone().multiply(homeQ);
   fresh.quaternion.copy(handWorldQ.clone().invert().multiply(magWorldQ));
 }else if(reloadWeapon==="smg"&&mp5ViewRoot){
   // MP5 magazine home is local to the baked MP5 geometry, not to the support hand.
   // Convert the real seated magazine's WORLD orientation into hand-local space so
   // the fresh magazine is already pointing the right way before insertion.
   fresh.position.set(.01,.12,-.01);
   gun.updateMatrixWorld(true);mp5ViewRoot.updateMatrixWorld(true);
   playerReloadPart.updateMatrixWorld(true);playerHandRig.left.updateMatrixWorld(true);
   const magWorldQ=new THREE.Quaternion(),handWorldQ=new THREE.Quaternion();
   playerReloadPart.getWorldQuaternion(magWorldQ);
   playerHandRig.left.getWorldQuaternion(handWorldQ);
   fresh.quaternion.copy(handWorldQ.clone().invert().multiply(magWorldQ));
   fresh.scale.multiplyScalar(mp5ViewRoot.scale.x);
 }else{
   fresh.position.set(0,.24,-.015);
   fresh.quaternion.copy(homeQ);fresh.rotation.z+=.08;
 }
 reloadFreshMag=fresh;reloadFreshAttached=false;
}
function updateMP5ReloadMagazineFX(rp,home,targetQ){
 // MP5-only reload: keep the magazine in the support hand through insertion.
 if(!reloadOldMagDropped&&home){
   const pull=rp.pull||0;
   playerReloadPart.visible=true;playerReloadPart.position.copy(home);
   playerReloadPart.position.y-=.25*pull;playerReloadPart.position.z+=.045*pull;
   playerReloadPart.quaternion.copy(targetQ);playerReloadPart.rotation.x+=.07*pull;
   if(rp.p>=.32)tossOldReloadMagazine();
 }
 if(rp.p>=.56&&!reloadFreshMag&&!reloadMagInserted)spawnFreshReloadMagazine();

 if(reloadFreshMag&&!reloadMagInserted&&rp.p>=.67){
   gun.updateMatrixWorld(true);
   playerHandRig.left.updateMatrixWorld(true);
   playerReloadPart.updateMatrixWorld(true);

   const freshWorld=new THREE.Vector3(),homeWorld=new THREE.Vector3();
   reloadFreshMag.getWorldPosition(freshWorld);
   playerReloadPart.getWorldPosition(homeWorld);
   const freshGun=gun.worldToLocal(freshWorld.clone());
   const homeGun=gun.worldToLocal(homeWorld.clone());

   // Two-stage hand-carried path:
   // 1) line the fresh mag up directly BELOW the real MP5 magwell;
   // 2) push the hand/mag pair straight upward into the magwell.
   const alignGun=homeGun.clone();
   alignGun.y-=.42;
   alignGun.z+=.015;
   const desired=rp.p<.76
     ? freshGun.clone().lerp(alignGun,smoothReload01((rp.p-.67)/.09))
     : alignGun.clone().lerp(homeGun,smoothReload01((rp.p-.76)/.08));

   playerHandRig.left.position.add(desired.sub(freshGun));
   playerHandRig.left.updateMatrixWorld(true);
 }
 if(rp.p>=.84&&reloadFreshMag&&!reloadMagInserted){
   if(reloadFreshMag.parent)reloadFreshMag.parent.remove(reloadFreshMag);
   reloadFreshMag=null;reloadFreshInsertStart=null;reloadFreshInsertQuat=null;reloadFreshAttached=false;
   playerReloadPart.position.copy(home);playerReloadPart.quaternion.copy(targetQ);
   playerReloadPart.visible=!playerReloadPart.userData.reloadOnly;reloadMagInserted=true;
 }
}
function updateReloadMagazineFX(rp){
 if(!reloading||!detachableMagazineReload())return;
 const home=playerReloadPart.userData.reloadHome,targetQ=playerReloadPart.userData.reloadHomeQuat||playerReloadPart.quaternion;
 if(reloadWeapon==="smg"){
   updateMP5ReloadMagazineFX(rp,home,targetQ);
   return;
 }
 if(reloadWeapon==="pistol"){
   // M17 speed reload: the old magazine drops freely while the support hand is
   // already reaching for the replacement. This keeps the two actions visually separate.
   if(!reloadOldMagDropped&&home){
     playerReloadPart.position.copy(home);playerReloadPart.quaternion.copy(targetQ);
     playerReloadPart.traverse(o=>{if(o.isMesh)o.visible=true});
     // Hold briefly under the grip, then visibly travel downward before detaching.
     const ejectT=smoothReload01(Math.max(0,Math.min(1,(rp.p-.06)/.16)));
     playerReloadPart.position.y-=.34*ejectT;
     if(rp.p>=.24)tossOldReloadMagazine();
   }
   // Start retrieving the fresh magazine while the old one is still visibly falling.
   if(rp.p>=.30&&!reloadFreshMag&&!reloadMagInserted)spawnFreshReloadMagazine();
   if(reloadFreshMag&&!reloadFreshAttached){
     // Hold the replacement by its bottom/base plate so the long body of the
     // magazine projects clearly above the support hand instead of being buried in it.
     // Offset above the hand so the fingers appear to hold the base plate.
     // With the M17 support-hand group scaled to 72%, compensate the magazine
     // locally and offset it toward the thumb side so the hand holds the base instead of covering it.
     reloadFreshMag.scale.setScalar(1/.72);
     reloadFreshMag.position.set(.15,.34,-.02);
     reloadFreshMag.quaternion.copy(targetQ);
   }
   if(rp.p>=.64&&reloadFreshMag&&!reloadFreshAttached){
     playerHandRig.left.updateMatrixWorld(true);gun.attach(reloadFreshMag);
     reloadFreshInsertStart=reloadFreshMag.position.clone();reloadFreshInsertQuat=reloadFreshMag.quaternion.clone();reloadFreshAttached=true;
   }
   if(reloadFreshMag&&reloadFreshAttached&&reloadFreshInsertStart){
     const t=smoothReload01((rp.p-.64)/.23);
     reloadFreshMag.position.lerpVectors(reloadFreshInsertStart,home,t);
     reloadFreshMag.quaternion.slerpQuaternions(reloadFreshInsertQuat,targetQ,t);
     if(rp.p>=.89){
       if(reloadFreshMag.parent)reloadFreshMag.parent.remove(reloadFreshMag);
       reloadFreshMag=null;reloadFreshInsertStart=null;reloadFreshInsertQuat=null;reloadFreshAttached=false;
       playerReloadPart.position.copy(home);playerReloadPart.quaternion.copy(targetQ);playerReloadPart.traverse(o=>{if(o.isMesh)o.visible=false});reloadMagInserted=true;
     }
   }
   return;
 }
 // Shared detachable-magazine animation for the other weapons.
 if(!reloadOldMagDropped&&home){
   const pull=rp.pull||0;
   playerReloadPart.visible=true;playerReloadPart.position.copy(home);
   playerReloadPart.position.y-=.25*pull;playerReloadPart.position.z+=.045*pull;
   playerReloadPart.quaternion.copy(targetQ);playerReloadPart.rotation.x+=.07*pull;
   if(rp.p>=.32)tossOldReloadMagazine();
 }
 if(rp.p>=.56&&!reloadFreshMag&&!reloadMagInserted)spawnFreshReloadMagazine();
 if(rp.p>=.67&&reloadFreshMag&&!reloadFreshAttached){
   playerHandRig.left.updateMatrixWorld(true);
   const insertParent=(reloadWeapon==="smg"&&playerReloadPart.parent)?playerReloadPart.parent:gun;
   insertParent.updateMatrixWorld(true);insertParent.attach(reloadFreshMag);
   reloadFreshInsertStart=reloadFreshMag.position.clone();reloadFreshInsertQuat=reloadFreshMag.quaternion.clone();reloadFreshAttached=true;
 }
 if(reloadFreshMag&&reloadFreshAttached&&reloadFreshInsertStart){
   if(reloadWeapon==="rifle"){
     // M4 insertion path: first line the magazine up directly below the real
     // magwell, then push it straight upward. This prevents the old diagonal path
     // from cutting through the side of the receiver.
     const align=home.clone();align.y-=.30;align.z+=.025;
     if(rp.p<.76){
       const t=smoothReload01((rp.p-.67)/.09);
       reloadFreshMag.position.lerpVectors(reloadFreshInsertStart,align,t);
       reloadFreshMag.quaternion.slerpQuaternions(reloadFreshInsertQuat,targetQ,t);
     }else{
       const t=smoothReload01((rp.p-.76)/.08);
       reloadFreshMag.position.lerpVectors(align,home,t);
       reloadFreshMag.quaternion.copy(targetQ);
     }
   }else{
     const t=smoothReload01((rp.p-.67)/.17);
     reloadFreshMag.position.lerpVectors(reloadFreshInsertStart,home,t);
     reloadFreshMag.quaternion.slerpQuaternions(reloadFreshInsertQuat,targetQ,t);
   }
   if(rp.p>=.84){
     if(reloadFreshMag.parent)reloadFreshMag.parent.remove(reloadFreshMag);
     reloadFreshMag=null;reloadFreshInsertStart=null;reloadFreshInsertQuat=null;reloadFreshAttached=false;
     playerReloadPart.position.copy(home);playerReloadPart.quaternion.copy(targetQ);playerReloadPart.visible=!playerReloadPart.userData.reloadOnly;reloadMagInserted=true;
   }
 }
}
function finishReloadMagazineFX(){clearReloadMagazineFX(true)}
function rebuildGun(){
 clearReloadMagazineFX(true);
 gun.traverse(o=>{if(o!==gun&&o.geometry&&!o.userData.externalWeaponAsset){try{o.geometry.dispose()}catch(_){}}});
 gun.clear();playerHandRig=null;playerReloadPart=null;m4ViewRoot=null;mp5ViewRoot=null;mp5RecoilPivot=null;m240ViewRoot=null;m240ViewModel=null;m240ViewBasePos=null;m240ViewBaseQuat=null;m240BarrelKick=0;launcherBreakRig=null;launcherFreshRound=null;launcherChamberRound=null;launcherRoundSeated=false;
 const x=.36,metal=M(0x25292b,.28),steel=M(0x141719,.2),dark=M(0x090b0c,.32),poly=M(0x202426,.68),rubber=M(0x141617,.88),wood=M(0x65462e,.72),brass=M(0xb48a45,.36);
 const part=(w,h,d,mat,y,z)=>bevelBox(w,h,d,mat,x,y,z);
 const grip=(y,z,ang=-.22,mat=poly)=>{let q=part(.24,.55,.30,mat,y,z);q.rotation.x=ang;for(let yy=-.16;yy<.18;yy+=.09)box(.205,.018,.315,dark,x,y+yy,z-.005,gun);return q};
 const magazine=(y,z,w=.22,h=.48,d=.32,ang=.08)=>{let q=part(w,h,d,metal,y,z);q.rotation.x=ang;q.userData.reloadHome=q.position.clone();q.userData.reloadHomeQuat=q.quaternion.clone();playerReloadPart=q;box(w*.72,.035,d*1.03,dark,0,h*.22,0,q);return q};
 const rail=(z,len=.7,y=-.095)=>{box(.24,.045,len,dark,x,y,z,gun);for(let dz=-len*.42;dz<len*.43;dz+=.09)box(.27,.018,.025,metal,x,y-.028,z+dz,gun)};
 const muzzleBrake=(z,rad=.105)=>{cyl(rad,.22,dark,x,-.235,z);for(const dx of [-.065,.065])box(.035,.08,.08,M(0x050606,.25),x+dx,-.235,z-.01,gun)};
 const optic=(z,y=-.025,scale=1)=>{cyl(.11*scale,.48*scale,dark,x,y,z);for(const zz of [-.18,.18]){let r=new THREE.Mesh(new THREE.TorusGeometry(.125*scale,.025*scale,8,16),metal);r.rotation.x=Math.PI/2;r.position.set(x,y,z+zz*scale);gun.add(r)}box(.20*scale,.055,.14*scale,dark,x,y+.12*scale,z,gun)};
 const frontSight=(z,y=-.08)=>{box(.035,.17,.04,dark,x,y,z,gun);box(.15,.035,.04,dark,x,y-.075,z,gun)};
 const rearIron=(z,y=-.010,sc=1)=>{
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.070*sc,.012*sc,6,18),dark);ring.position.set(x,y,z);gun.add(ring);
   box(.19*sc,.040,.095,dark,x,y-.088*sc,z,gun);
   box(.026,.075*sc,.060,dark,x-.072*sc,y-.050*sc,z,gun);
   box(.026,.075*sc,.060,dark,x+.072*sc,y-.050*sc,z,gun);
 };
 const frontIron=(z,y=-.010,sc=1)=>{
   box(.022,.115*sc,.045,dark,x,y-.055*sc,z,gun);
   box(.022,.105*sc,.050,dark,x-.070*sc,y-.068*sc,z,gun);
   box(.022,.105*sc,.050,dark,x+.070*sc,y-.068*sc,z,gun);
   box(.17*sc,.032,.070,dark,x,y-.122*sc,z,gun);
 };
 const stock=(z,mat=poly)=>{let s=part(.36,.42,.70,mat,-.42,z);s.rotation.x=-.12;box(.38,.46,.11,rubber,x,-.42,z+.35,gun);return s};

 if(weapon==='rifle'){
   if(m4ModelTemplate){
     // Normalize the replacement GLB from its authored bounds into the established
     // first-person M4 length. The previous 5.15 scale was specific to the old asset.
     const m4Root=m4ModelTemplate.clone(true);m4Root.name="ExternalM4Carbine";
     // The GLB's original ACOG geometry is valid. Its exported optic material uses
     // alpha blending plus very strong emissive output, which looks correct in
     // Sketchfab but causes sorting/glow artifacts in Three.js first person.
     const m4RawBox=new THREE.Box3().setFromObject(m4Root);
     const m4RawSize=m4RawBox.getSize(new THREE.Vector3());
     const m4RawLength=Math.max(m4RawSize.x,m4RawSize.y,m4RawSize.z);
     m4Root.scale.setScalar(m4RawLength>1e-5?3.45/m4RawLength:1);
     m4Root.rotation.set(THREE.MathUtils.degToRad(-8),0,THREE.MathUtils.degToRad(-6));
     m4Root.position.set(.54,-.56,-1.48);m4ViewRoot=m4Root;

     m4AdsOccluders=[];
     m4Root.traverse(o=>{
       o.userData.externalWeaponAsset=true;
       if(o.isMesh){
         o.castShadow=false;o.receiveShadow=false;
         const n=(o.name||"").toLowerCase();
         const mats=Array.isArray(o.material)?o.material:[o.material];
         const isOriginalAcog=n==="acog_optic.001_0"||n.includes("acog")||mats.some(m=>(m?.name||"").toLowerCase()==="optic.001");
         if(isOriginalAcog){
           const fixed=mats.map(m=>{
             if(!m)return m;
             const c=m.clone();
             c.transparent=false;
             c.opacity=1;
             c.depthWrite=true;
             c.depthTest=true;
             c.alphaTest=.12;
             if(c.emissive)c.emissive.setHex(0xffffff);
             if("emissiveIntensity" in c)c.emissiveIntensity=.15;
             c.side=THREE.FrontSide;
             c.needsUpdate=true;
             return c;
           });
           o.material=Array.isArray(o.material)?fixed:fixed[0];
           o.renderOrder=0;
         }
         if(n.includes("stock")||n.includes("butt"))m4AdsOccluders.push(o);
       }
     });
     gun.add(m4Root);
     // Detach the model's real magazine into gun-local space so the existing
     // drop / fresh-mag / insert animation can keep working with the new visual.
     const m4Mag=m4Root.getObjectByName("Magazine_m4_0")||m4Root.getObjectByName("Magazine");
     if(m4Mag){
       gun.updateMatrixWorld(true);m4Root.updateMatrixWorld(true);gun.attach(m4Mag);
       m4Mag.userData.externalWeaponAsset=true;
       m4Mag.userData.reloadHome=m4Mag.position.clone();m4Mag.userData.reloadHomeQuat=m4Mag.quaternion.clone();
       playerReloadPart=m4Mag;
     }
   }
 }else if(weapon==='smg'){
   if(mp5ModelTemplate){
     // The source MP5 stores its three gun meshes in huge FBX/skinning coordinates.
     // Bake the exact corrective transforms into those meshes so they become a normal,
     // compact MP5 centered around the origin before we place it in first person.
     const mp5Root=new THREE.Group();mp5Root.name="ExternalAnimatedMP5";
     const recoilPivot=new THREE.Group();recoilPivot.name="MP5RearRecoilPivot";recoilPivot.position.set(0,.08,.45);mp5Root.add(recoilPivot);
     const mp5Geo=new THREE.Group();mp5Geo.name="ExternalAnimatedMP5Geometry";mp5Geo.position.set(0,-.08,-.45);recoilPivot.add(mp5Geo);
     mp5RecoilPivot=recoilPivot;
     const mp5Bake=[
       ["Object_126",[
        -0.000034095201,0,0,-0.014564577587,
         0,-0.000034092519,-0.000000427460,-2.279781086399,
         0,-0.000000427460, 0.000034092519, 0.535103813563,
         0,0,0,1
       ]],
       ["Object_128",[
        -0.000034095202,0,0,-0.014564581393,
         0,-0.000034092518,-0.000000427459,-2.277218296286,
         0,-0.000000427460, 0.000034092519, 0.533305785922,
         0,0,0,1
       ]],
       ["Object_130",[
        -0.000034095201,0,0,-0.014847277160,
         0.000000000002,-0.000034092521,-0.000000427460,-2.275620921018,
         0.000000000001,-0.000000427466, 0.000034092519, 0.537253060443,
         0,0,0,1
       ]]
     ];
     let mp5Magazine=null;
     for(const [meshName,mv] of mp5Bake){
       const src=mp5ModelTemplate.getObjectByName(meshName);
       if(!src||!src.geometry)continue;
       const geo=src.geometry.clone();
       geo.applyMatrix4(new THREE.Matrix4().set(...mv));
       geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();
       const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({
         color:0x303538,roughness:.46,metalness:.52,side:THREE.DoubleSide
       }));
       mesh.name=meshName+"_CleanMP5";
       mesh.userData.externalWeaponAsset=true;
       mesh.castShadow=false;mesh.receiveShadow=false;
       // Object_128 is the curved MP5 magazine. Seat it firmly into the magwell
       // at idle and use this exact model piece for drop / fresh-mag / insertion.
       if(meshName==="Object_128"){
         mesh.name="MP5Magazine";
         mesh.position.y+=.15;
         mesh.userData.reloadHome=mesh.position.clone();
         mesh.userData.reloadHomeQuat=mesh.quaternion.clone();
         mp5Magazine=mesh;
       }
       mp5Geo.add(mesh);
     }
     if(mp5Magazine)playerReloadPart=mp5Magazine;
     // The baked gun is now ~1 unit long with a normal MP5 profile. At hip fire,
     // cant it sideways so the receiver/magazine are clearly visible.
     // Hip-fire uses a slightly larger/closer presentation. ADS blends back to
     // the existing approved 1.55 scale so the sight picture is not disturbed.
     mp5Root.scale.setScalar(2.25);
     mp5Root.position.set(.30,-.70,-1.12);
     mp5Root.rotation.y=0;
     gun.add(mp5Root);
     mp5ViewRoot=mp5Root;
     document.documentElement.dataset.mp5Viewmodel="clean-baked-mp5";
   }
  }else if(weapon==='shotgun'){
   // Pump shotgun with twin tubes, ribbed fore-end, receiver and shoulder stock.
   stock(-.42,wood);part(.37,.30,.86,metal,-.30,-1.10);grip(-.61,-.72,-.30,wood);
   cyl(.058,1.72,steel,x,-.235,-2.42);cyl(.052,1.38,dark,x,-.37,-2.26);muzzleBrake(-3.26,.075);
   let pump=part(.46,.31,.62,wood,-.32,-1.82);for(let zz=-2.04;zz<-1.55;zz+=.085)box(.49,.035,.035,dark,x,-.31,zz,gun);
   box(.055,.045,1.55,dark,x,-.11,-2.27,gun);frontSight(-3.02,-.11);
   box(.02,.12,.28,dark,x+.20,-.30,-1.05,gun);
 }else if(weapon==='pistol'){
   if(m17ModelTemplate){
     const m17Root=m17ModelTemplate.clone(true);m17Root.name="ExternalM17SIG";
     // The source GLB is authored with the pistol's barrel along +X (not Z).
     // Remove its loose presentation props first, then rotate +X -> game forward (-Z).
     // All four named nodes are loose presentation props in this GLB. Remove them
     // from the displayed pistol, including the loaded magazine that was hanging below it.
     const m17SourceMag=m17Root.getObjectByName("919 p320 17rnd mag_3");
     let m17ReloadTemplate=null;
     if(m17SourceMag){
       m17ReloadTemplate=m17SourceMag.clone(true);
       m17ReloadTemplate.traverse(o=>{o.userData.externalWeaponAsset=true;if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
     }
     // Hard guarantee: no magazine mesh from the source GLB is allowed to remain on
     // the idle first-person pistol. Collect first, then remove, so nested nodes cannot
     // survive because a parent was detached earlier in the loop.
     const m17LooseProps=[];
     m17Root.traverse(o=>{
       const n=(o.name||"").toLowerCase();
       if(n.includes("mag")||n==="9x19_1"||n==="919_2")m17LooseProps.push(o);
     });
     for(const prop of m17LooseProps)if(prop.parent)prop.parent.remove(prop);
     // Preserve the complete assembled M17 hierarchy; only the four loose display props above are removed.
     m17Root.rotation.set(0,Math.PI/2,0);
     // Normalize only the assembled pistol, after applying its correct axis rotation.
     const bounds=new THREE.Box3().setFromObject(m17Root),size=new THREE.Vector3();bounds.getSize(size);
     const longest=Math.max(size.x,size.y,size.z)||1;m17Root.scale.setScalar(.53/longest);
     const scaledBounds=new THREE.Box3().setFromObject(m17Root),center=new THREE.Vector3();scaledBounds.getCenter(center);
     m17Root.position.set(x-center.x,-.30-center.y,-1.02-center.z);
     m17Root.traverse(o=>{o.userData.externalWeaponAsset=true;if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
     gun.add(m17Root);
     // The visible pistol stays clean. A hidden clone of the real GLB magazine is
     // the reload actor: reveal at reload start, pull/drop it, then clone it from the
     // pouch and insert the replacement. It is never part of the idle pistol hierarchy.
     if(m17ReloadTemplate){
       // Use a dedicated first-person reload magazine. The source GLB magazine node
       // has presentation transforms that have repeatedly made it unreliable as an
       // animation actor. Keep the real pistol model, but use simple visible geometry
       // for the moving magazine so the reload always reads clearly.
       const m17ReloadMag=new THREE.Group();m17ReloadMag.name="M17ReloadMagazineCarrier";
       // Oversized debug-readable magazine: keep it unmistakable in first person.
       // Once placement is confirmed we can reduce it to exact scale.
       const magBody=new THREE.Mesh(new THREE.BoxGeometry(.16,.48,.11),M(0x202326,.92));
       const magBase=new THREE.Mesh(new THREE.BoxGeometry(.20,.045,.14),M(0x111315,.98));
       magBase.position.y=-.255;
       m17ReloadMag.add(magBody,magBase);
       m17ReloadMag.traverse(o=>{o.userData.externalWeaponAsset=true;if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
       // Seat the animation actor directly under the visible grip.
       m17ReloadMag.position.set(x,-.70,-.73);m17ReloadMag.rotation.set(-.10,0,0);
       m17ReloadMag.userData.externalWeaponAsset=true;m17ReloadMag.userData.reloadOnly=true;
       m17ReloadMag.userData.reloadHome=m17ReloadMag.position.clone();m17ReloadMag.userData.reloadHomeQuat=m17ReloadMag.quaternion.clone();
       gun.add(m17ReloadMag);
       m17ReloadMag.traverse(o=>{if(o.isMesh)o.visible=false});
       playerReloadPart=m17ReloadMag;
       document.documentElement.dataset.m17IdleMagazine="hidden";
       document.documentElement.dataset.m17SourceMagNodes=String(m17LooseProps.length);
     }else playerReloadPart=null;
   }
 }else if(weapon==='dmr'){
   // Long-range marksman rifle with extended handguard, scope and heavier barrel.
   stock(-.36,M(0x3f342b,.68));part(.36,.31,1.18,metal,-.30,-1.18);part(.32,.28,1.12,poly,-.28,-2.10);
   grip(-.63,-.80,-.25);magazine(-.64,-1.30,.23,.52,.34,.08);cyl(.066,1.65,steel,x,-.235,-3.18);muzzleBrake(-4.0,.11);
   rail(-1.72,1.62,-.095);rearIron(-.74,-.010,.86);frontIron(-3.22,-.010,.82);
   for(let zz=-1.72;zz>-2.55;zz-=.17){for(const sx of [-.15,.15])box(.025,.075,.10,dark,x+sx,-.27,zz,gun)}
   box(.018,.12,.36,dark,x+.20,-.28,-1.17,gun);box(.20,.045,.08,dark,x,-.14,-.56,gun);
 }else if(weapon==='m240'){
   if(m240ModelTemplate){
     const root=new THREE.Group(),model=m240ModelTemplate.clone(true);
     root.add(model);root.traverse(o=>o.userData.externalWeaponAsset=true);
     model.updateMatrixWorld(true);
     let bx=new THREE.Box3().setFromObject(model),sz=new THREE.Vector3();bx.getSize(sz);
     if(sz.x>=sz.y&&sz.x>=sz.z)model.rotation.y=Math.PI/2;
     else if(sz.y>=sz.x&&sz.y>=sz.z)model.rotation.x=-Math.PI/2;
     else model.rotation.y=Math.PI;
     model.updateMatrixWorld(true);
     bx=new THREE.Box3().setFromObject(model);const ctr=new THREE.Vector3();bx.getCenter(ctr);bx.getSize(sz);
     const m240Scale=4.28/Math.max(.001,sz.z);
     model.scale.setScalar(m240Scale);
     model.position.copy(ctr).multiplyScalar(-m240Scale);
     root.position.set(x,-.62,-2.14);
     root.rotation.y=Math.PI;
     root.rotation.x=.055;
     gun.add(root);
     m240ViewRoot=root;m240ViewModel=model;
     m240ViewBasePos=model.position.clone();
     m240ViewBaseQuat=model.quaternion.clone();
   }
 }else if(weapon==='awm'){
   // AWM Ultimate: long precision rifle, skeletal stock, oversized scope and heavy fluted barrel.
   stock(-.35,M(0x38404a,.58));part(.34,.30,1.12,metal,-.29,-1.25);part(.29,.25,1.35,M(0x2f3a43,.60),-.27,-2.20);
   grip(-.64,-.82,-.28,rubber);magazine(-.61,-1.28,.20,.40,.28,.04);
   cyl(.060,2.10,steel,x,-.225,-3.65);muzzleBrake(-4.72,.115);
   rail(-1.63,1.45,-.08);optic(-1.66,-.005,1.24);
   // scope bell and rear eyepiece
   cyl(.155,.30,dark,x,-.005,-2.00);cyl(.115,.24,dark,x,-.005,-1.25);
   for(let zz=-2.18;zz>-3.15;zz-=.19){for(const sx of [-.13,.13])box(.022,.06,.12,dark,x+sx,-.26,zz,gun)}
   // folding bipod
   for(const sx of [-.16,.16]){let leg=cyl(.022,.72,steel,x+sx,-.48,-3.18,gun,"y");leg.rotation.z=sx<0?-.30:.30}
   box(.018,.12,.36,dark,x+.19,-.28,-1.18,gun);
 }else if(weapon==='grenadeLauncher'){
   // Break-action grenade launcher: receiver stays with the stock while the complete front barrel half hinges downward.
   stock(-.30,poly);part(.40,.34,.92,metal,-.30,-1.12);grip(-.62,-.76,-.27,rubber);
   // Visible hinge/pivot at the breech makes the split obvious when the barrel opens.
   const hinge=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.48,10),dark);hinge.rotation.z=Math.PI/2;hinge.position.set(x,-.30,-1.43);gun.add(hinge);
   launcherBreakRig=new THREE.Group();launcherBreakRig.name="GrenadeLauncherBreakBarrel";launcherBreakRig.position.set(x,-.30,-1.43);gun.add(launcherBreakRig);
   cyl(.145,1.62,steel,0,.07,-.79,launcherBreakRig);cyl(.112,1.45,dark,0,.07,-.75,launcherBreakRig);
   let ring=new THREE.Mesh(new THREE.TorusGeometry(.155,.032,10,18),metal);ring.rotation.x=Math.PI/2;ring.position.set(0,.07,-1.59);launcherBreakRig.add(ring);
   box(.32,.18,.44,poly,0,-.08,-.15,launcherBreakRig);
   box(.035,.17,.04,dark,0,.22,-1.45,launcherBreakRig);box(.15,.035,.04,dark,0,.145,-1.45,launcherBreakRig);
   box(.18,.10,.20,M(0x5b6d43,.65),0,-.19,-.03,launcherBreakRig);
   // Breech/chamber collar stays attached to the opening barrel.
   let chamberRing=new THREE.Mesh(new THREE.TorusGeometry(.132,.022,8,16),metal);chamberRing.rotation.x=Math.PI/2;chamberRing.position.set(0,.07,-.015);launcherBreakRig.add(chamberRing);
   launcherChamberRound=makeLauncherReloadRound(launcherBreakRig);launcherChamberRound.position.set(0,.07,-.10);launcherChamberRound.visible=false;
 }
 // Shared procedural trigger/receiver details belong only to the remaining
 // procedural weapons. The M4, MP5 and M17 GLBs already contain their own hardware.
 const externalViewmodel=weapon==='rifle'||weapon==='smg'||weapon==='pistol';
 if(!externalViewmodel){
   if(weapon!=='pistol'){
     const guard=new THREE.Mesh(new THREE.TorusGeometry(.11,.025,8,16,Math.PI),dark);guard.rotation.z=Math.PI;guard.position.set(x,-.48,weapon==='shotgun'?-1.02:-.94);gun.add(guard);
   }
   for(const dx of [-.12,.12]){let pin=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.025,8),brass);pin.rotation.z=Math.PI/2;pin.position.set(x+dx,-.29,-1.0);gun.add(pin)}
 }
 const muzzleZ=weapon==='shotgun'?-3.38:weapon==='smg'?-2.36:weapon==='pistol'?-1.56:weapon==='dmr'?-4.13:weapon==='m240'?-4.34:weapon==='awm'?-4.84:weapon==='grenadeLauncher'?-3.12:-3.40;
 muzzle=new THREE.PointLight(0xffb35a,0,4);muzzle.position.set(x,-.23,muzzleZ);gun.add(muzzle);
 addPlayerHands();
 gun.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
}

function setAim(v){
 aiming=!!v&&running&&!dying&&!between&&document.pointerLockElement===cv;
 if(!aiming){gun.visible=true;if(aimBlend<=.01)gun.scale.setScalar(1)}
 const scopedAim=aiming&&(weapon==="awm"||weapon==="rifle");
 scopeOverlay.classList.toggle("show",scopedAim);
 scopeOverlay.classList.toggle("m4Scope",aiming&&weapon==="rifle");
 cross.style.opacity=aiming?"0":"1";
}
const WEAPON_CYCLE_ORDER=["pistol","rifle","smg","shotgun","dmr","grenadeLauncher","m240","awm"];
function setWeapon(w){if(reloading||!unlocked[w])return;stopAuto();setAim(false);weapon=w;rebuildGun();weaponNameEl.textContent=wd().name;show(wd().name);ui()}
function cycleWeapon(dir){
 if(reloading)return;
 const available=WEAPON_CYCLE_ORDER.filter(w=>unlocked[w]);
 if(available.length<2)return;
 let i=available.indexOf(weapon);
 if(i<0)i=0;else i=(i+(dir>0?1:-1)+available.length)%available.length;
 setWeapon(available[i]);
}
function shotgunDamageScale(distance){
 if(distance<=3.5)return 1.45;
 if(distance<=8)return THREE.MathUtils.lerp(1.45,1.05,(distance-3.5)/4.5);
 if(distance<=16)return THREE.MathUtils.lerp(1.05,.68,(distance-8)/8);
 if(distance<=28)return THREE.MathUtils.lerp(.68,.38,(distance-16)/12);
 return .26;
}
function weaponSound(){
 if(weapon==="pistol"){noise(.075,.38,1100);tone(125,.055,"square",.13);return}
 if(weapon==="dmr"){noise(.13,.62,1450);tone(78,.10,"square",.19);return}
 if(weapon==="m240"){if(!startM240FireAudio()){noise(.095,.62,1650);tone(74,.085,"square",.18);tone(112,.045,"sine",.06)}return}
 if(weapon==="awm"){noise(.20,.92,1500);tone(54,.16,"square",.28);tone(92,.11,"sine",.12,.02);return}
 if(weapon==="grenadeLauncher"){noise(.14,.72,850);tone(62,.18,"square",.30);tone(118,.08,"sine",.12,.02);return}if(weapon==="shotgun"){noise(.16,.8,1800);tone(58,.22,"square",.34)}else if(weapon==="smg"){noise(.07,.5,2300);tone(105,.09,"square",.18)}else gunS()}

const BOSS_NAME_POOL=["GORE TITAN","THE REND KING","MAWBREAKER","THE ABATTOIR","RIBCAGE","MEATSAINT","BUTCHER PRIME","BLOODHOWL","THE SPLIT-JAW","THE RED GIANT","MARROWLORD","GUTSPIKE","THE CARRION OX","SCARFLESH","THE RUINED HERCULES","GRAVEBULK"];



const BOSS_CHARGE_MAX_RANGE=32,BOSS_CHARGE_SPEED=7.6;
function bossPressureSpeed(dist,base){
 // A boss should eventually close on a player who only walks backward, but full
 // 9 m/s sprint remains a clean escape. Pressure eases as the boss gets close so
 // Slam / normal attacks still have readable timing.
 if(dist>28)return Math.max(base,6.0);
 if(dist>18)return Math.max(base,5.55);
 if(dist>10)return Math.max(base,4.65);
 return base;
}
function nextBossName(){
 let pool=BOSS_NAME_POOL.filter(n=>!usedBossNames.includes(n));
 if(!pool.length){usedBossNames=[];pool=[...BOSS_NAME_POOL]}
 const name=pool[Math.floor(rnd()*pool.length)];usedBossNames.push(name);return name
}
function ensureBossWaveName(w){if(isBossWave(w)&&!bossWaveName)bossWaveName=nextBossName();return bossWaveName}
function bossWaveSpec(w){
 const mult=bossScaleFactor(w),tier=bossTier(w);
 return {name:ensureBossWaveName(w),hp:Math.round(184*mult),speed:2.25*mult,attack:.80/mult,damage:Math.round(21*mult),bounty:250+tier*75,specialCd:6.5/mult}
}
const bossHudRenderArgs={bossHUD,bossNameEl,bossSubEl,bossFill,boss:null,wave:1};
function updateBossUI(){
 bossHudRenderArgs.boss=currentBoss;
 bossHudRenderArgs.wave=wave;
 renderBossHud(bossHudRenderArgs);
}
function resetHealthRegenDelay(){
 healthRegenCooldown=PLAYER_HEALTH_REGEN_DELAY;
 healthRegenShown=Math.ceil(Math.max(0,health));
}
function updateHealthRegen(dt){
 if(healthRegenCooldown>0){healthRegenCooldown=Math.max(0,healthRegenCooldown-dt);return}
 if(health<=0||health>=100||dying||!running)return;
 health=Math.min(100,health+PLAYER_HEALTH_REGEN_RATE*dt);
 const shown=Math.ceil(health);
 if(shown!==healthRegenShown||health>=100){healthRegenShown=shown;ui()}
}
function bossDamagePlayer(z,amount,label,knock=0){
 if(dying||!running)return;
 health=Math.max(0,health-Math.round(amount));resetHealthRegenDelay();
 if(knock>0){
   let dx=px-z.g.position.x,dz=pz-z.g.position.z,d=Math.hypot(dx,dz)||1;
   const ox=px,oz=pz;let np=slideBuilding(ox,oz,px+dx/d*knock,pz+dz/d*knock,.62);px=np.x;pz=np.z;
 }
 noise(.18,.40,360);tone(58,.20,"sawtooth",.18);
 flashDamageOverlay(damage,180);
 show(label+"  -"+Math.round(amount)+" HEALTH");ui();
 if(health<=0){showDeathScreen()}
}
function startBossSlam(z){
 z.bossAttackState="slam";z.bossAttackT=.72;z.bossChargeHit=false;
 show((z.bossName||"BOSS")+" — BLOOD SLAM");
 tone(48,.45,"sawtooth",.24);rigTransient(z,"Attack",.65)
}
function resolveBossSlam(z){
 const p=z.g.position.clone().add(new THREE.Vector3(0,.65,0));
 burst(p,true);burst(p.clone().add(new THREE.Vector3(.5,0,.2)),true);burst(p.clone().add(new THREE.Vector3(-.5,0,-.2)),true);
 noise(.32,.85,520);tone(38,.42,"sine",.42);
 const d=Math.hypot(px-z.g.position.x,pz-z.g.position.z);
 if(d<5.6)bossDamagePlayer(z,z.damage*1.10,"BLOOD SLAM",2.8)
}
function startBossCharge(z,dist=17){
 // Longer rushes from farther away let Gore Rush function as a gap closer instead
 // of only triggering after the boss has already reached the player.
 const extra=Math.min(1.0,Math.max(0,dist-10)*.045);
 z.bossAttackState="charge";z.bossAttackT=1.55+extra;z.bossChargeHit=false;
 show((z.bossName||"BOSS")+" — GORE RUSH");
 tone(72,.30,"square",.22);rigTransient(z,"Attack",.55)
}
function tickBossSpecial(z,dt,dist){
 if(z.kind!=="boss"||z.dead)return;
 z.bossSpecialCd=Math.max(-1,(z.bossSpecialCd||0)-dt);
 if(z.bossAttackState){
   z.bossAttackT-=dt;
   if(z.bossAttackState==="charge"&&!z.bossChargeHit&&dist<1.65){
     z.bossChargeHit=true;bossDamagePlayer(z,z.damage*1.35,"GORE RUSH",3.4)
   }
   if(z.bossAttackT<=0){
     if(z.bossAttackState==="slam")resolveBossSlam(z);
     z.bossAttackState="";z.bossSpecialCd=(6.2+rnd()*2.4)/bossScaleFactor(wave);
   }
 }else if(z.bossSpecialCd<=0){
   if(dist<5.4)startBossSlam(z);
   else if(dist<BOSS_CHARGE_MAX_RANGE)startBossCharge(z,dist);
 }
}

let lastZombieMarkerMaterial=null;
function createLastZombieMarker(){
 // One tiny shared texture/material for all last-zombie markers.
 // Markers are created lazily only when the wave reaches five remaining.
 if(!lastZombieMarkerMaterial){
   const cv=document.createElement("canvas");cv.width=48;cv.height=48;const c=cv.getContext("2d");
   c.translate(24,24);
   c.beginPath();c.moveTo(-10,-5);c.lineTo(10,-5);c.lineTo(0,11);c.closePath();
   c.fillStyle="rgba(235,58,52,.96)";c.fill();
   c.strokeStyle="rgba(25,25,25,.92)";c.lineWidth=3;c.lineJoin="round";c.stroke();
   const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;
   tx.minFilter=THREE.LinearFilter;tx.magFilter=THREE.LinearFilter;
   lastZombieMarkerMaterial=new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:false,depthWrite:false});
 }
 const spr=new THREE.Sprite(lastZombieMarkerMaterial);spr.scale.set(.62,.62,1);spr.renderOrder=999;return spr
}










// Shared low-cost geometry for the standing rig. Facial anatomy is merged into
// two meshes per zombie so human detail does not explode draw-call count.
function zombieEllipsoid(r,sx,sy,sz,x,y,z,segX=10,segY=7){
 const g=new THREE.SphereGeometry(r,segX,segY);g.scale(sx,sy,sz);g.translate(x,y,z);return g
}
function mergeZombieDetail(parts){
 const g=mergeGeometries(parts,false);for(const p of parts)p.dispose();return g
}
const ZRIG_NECK_DETAIL_GEO=new THREE.CylinderGeometry(.064,.084,.285,12,1,false);
const ZRIG_HUMAN_FACE_GEO=mergeZombieDetail([
 zombieEllipsoid(.158,.99,1.10,.79,0,.008,-.043,14,10),       // skull
 zombieEllipsoid(.118,.82,.58,.72,0,-.105,-.055,12,8),       // jaw
 zombieEllipsoid(.050,.52,1.08,.52,0,-.010,-.163,10,7),      // nose bridge
 zombieEllipsoid(.038,.82,.62,.90,0,-.048,-.174,10,7),       // nose tip
 zombieEllipsoid(.050,.90,.72,.43,-.086,-.028,-.146,10,7),   // cheek L
 zombieEllipsoid(.050,.90,.72,.43,.086,-.028,-.146,10,7),    // cheek R
 zombieEllipsoid(.050,.52,1.00,.34,-.158,.004,-.042,10,7),   // ear L
 zombieEllipsoid(.050,.52,1.00,.34,.158,.004,-.042,10,7),    // ear R
 zombieEllipsoid(.042,.88,.58,.68,0,-.145,-.095,10,7)        // chin
]);
const ZRIG_FACE_DARK_GEO=mergeZombieDetail([
 zombieEllipsoid(.050,1.06,.52,.28,-.055,.018,-.158,10,7),   // sunken socket L
 zombieEllipsoid(.050,1.06,.52,.28,.055,.018,-.158,10,7),    // sunken socket R
 zombieEllipsoid(.040,1.02,.20,.24,-.054,.058,-.169,9,6),    // brow L
 zombieEllipsoid(.040,1.02,.20,.24,.054,.058,-.169,9,6),     // brow R
 zombieEllipsoid(.045,1.08,.17,.20,0,-.095,-.168,10,6),      // mouth
 zombieEllipsoid(.012,.52,.30,.34,-.014,-.051,-.184,8,5),    // nostril L
 zombieEllipsoid(.012,.52,.30,.34,.014,-.051,-.184,8,5)      // nostril R
]);
const ZRIG_FACE_GORE_GEO=mergeZombieDetail([
 zombieEllipsoid(.057,1.18,.22,.20,0,-.100,-.187,10,6),      // bloody mouth smear
 zombieEllipsoid(.050,.78,1.02,.18,-.091,-.040,-.169,10,7),  // torn cheek
 zombieEllipsoid(.034,.52,1.22,.16,-.070,-.105,-.180,9,6),   // jaw drip
 zombieEllipsoid(.030,.62,.82,.16,-.125,.055,-.135,9,6)      // temple cut
]);
const ZRIG_CHEST_GORE_GEO=mergeZombieDetail([
 zombieEllipsoid(.090,1.22,.48,.18,-.060,.020,-.167,10,7),   // collar soak
 zombieEllipsoid(.066,.72,1.15,.16,.095,-.060,-.170,10,7),   // chest streak
 zombieEllipsoid(.045,.62,.84,.14,-.155,.005,-.150,9,6)      // shoulder wound
]);
const ZRIG_UPPER_DETAIL_GEO=mergeZombieDetail([
 zombieEllipsoid(.24,1.16,.37,.68,0,.022,-.018,12,8),
 zombieEllipsoid(.105,1.05,.82,.92,-.225,.035,-.026,10,7),
 zombieEllipsoid(.105,1.05,.82,.92,.225,.035,-.026,10,7)
]);
// Shared crawler gore meshes: built once, then reused by every native crawler.
// This keeps the new bloody silhouette cheap instead of generating unique gore
// geometry for every crawler instance.
const CRAWLER_MOUTH_GORE_GEO=mergeZombieDetail([
 zombieEllipsoid(.046,1.18,.20,.16,0,-.105,-.158,10,6),
 zombieEllipsoid(.013,.34,2.20,.28,-.030,-.145,-.160,8,5),
 zombieEllipsoid(.011,.30,2.75,.26,.004,-.158,-.161,8,5),
 zombieEllipsoid(.010,.28,1.85,.25,.032,-.140,-.159,8,5),
 zombieEllipsoid(.020,.55,.75,.24,-.050,-.126,-.156,8,5)
]);
const CRAWLER_BODY_GORE_GEO=mergeZombieDetail([
 zombieEllipsoid(.105,1.30,.56,.18,-.045,.715,-.265,10,7),
 zombieEllipsoid(.076,.78,1.30,.18,.110,.680,-.250,10,7),
 zombieEllipsoid(.090,1.42,.42,.22,-.055,.390,-.105,10,7),
 zombieEllipsoid(.052,.64,1.22,.18,.115,.500,-.175,9,6)
]);
const CRAWLER_FOREARM_GORE_GEO=mergeZombieDetail([
 zombieEllipsoid(.050,.78,1.34,.17,0,0,-.052,9,6),
 zombieEllipsoid(.027,.52,.85,.16,.026,-.028,-.057,8,5)
]);
function rigTransient(z,name,hold=.34){
 if(!z.rigActions||!z.rigActions[name])return;
 const a=z.rigActions[name],base=z.rigBase;
 if(z.rigTransient&&z.rigTransient!==a)z.rigTransient.stop();
 if(base)base.fadeOut(.055);
 a.reset();a.enabled=true;a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;a.fadeIn(.05);a.play();
 z.rigTransient=a;z.rigTransientT=hold;
}

// v147: the Shambler is the master standing-zombie model. Every standing type
// clones the same skinned rig/geometry, then reads only lightweight profile
// overrides. We never load a separate full model for Sprinter/Radiated/Infected/
// Acidic/Boss. Empty overrides currently preserve the exact v146 appearance.
const SHAMBLER_RIG_PROFILE=Object.freeze({
 rigScale:1.02,
 headYOffset:-.010,
 headScale:Object.freeze([1.03,1.04,1.01]),
 neckScale:Object.freeze([1.06,1,1.06]),
 chestScale:Object.freeze([1.07,1,1.07]),
 spineScale:Object.freeze([1.045,1,1.045]),
 upperArmScale:Object.freeze([1.065,1,1.065]),
 lowerArmScale:Object.freeze([1.045,1,1.045]),
 upperLegScale:Object.freeze([1.055,1,1.055]),
 lowerLegScale:Object.freeze([1.04,1,1.04])
});
function derivedRigProfile(overrides={}){
 return Object.freeze(Object.assign(Object.create(SHAMBLER_RIG_PROFILE),overrides));
}
const ZOMBIE_RIG_PROFILES=Object.freeze({
 shambler:SHAMBLER_RIG_PROFILE,
 sprinter:derivedRigProfile(),
 radiated:derivedRigProfile(),
 infected:derivedRigProfile(),
 acidic:derivedRigProfile(),
 boss:derivedRigProfile()
});
const RADIATED_GREEN_BONE_KEYS=Object.freeze([
 "Hips","Spine","Chest","Neck","Head",
 "L_UpperArm","L_LowerArm","R_UpperArm","R_LowerArm",
 "L_UpperLeg","L_LowerLeg","R_UpperLeg","R_LowerLeg"
]);
const radiatedArmRestL=new THREE.Vector3(-1,0,0),radiatedArmRestR=new THREE.Vector3(1,0,0),radiatedArmTarget=new THREE.Vector3();
function buildRadiatedGreenGuyTemplate(source){
 if(!source)return null;
 source.updateMatrixWorld(true);
 const invRoot=new THREE.Matrix4().copy(source.matrixWorld).invert(),pieces=[];
 source.traverse(o=>{
   if(!o.isMesh||!o.geometry)return;
   const geo=o.geometry.clone();
   const rel=new THREE.Matrix4().multiplyMatrices(invRoot,o.matrixWorld);
   geo.applyMatrix4(rel);geo.computeBoundingBox();
   pieces.push({geo,material:o.material,name:o.name||"GreenGuyMesh"});
 });
 if(!pieces.length)return null;
 const box=new THREE.Box3().makeEmpty();
 for(const p of pieces)box.union(p.geo.boundingBox);
 const size=new THREE.Vector3(),center=new THREE.Vector3();box.getSize(size);box.getCenter(center);
 const h=size.y;
 if(!Number.isFinite(h)||h<.25)return null;
 const shift=new THREE.Matrix4().makeTranslation(-center.x,-box.min.y,-center.z);
 for(const p of pieces){p.geo.applyMatrix4(shift);p.geo.computeBoundingBox()}
 const rig=new THREE.Group();rig.name="RadiatedGreenGuyAutoRig";rig.userData.sourceHeight=h;
 const bone=(name,x,y,z)=>{const b=new THREE.Bone();b.name="Green"+name;b.position.set(x,y,z);return b};
 const hips=bone("Hips",0,h*.50,0),
       spine=bone("Spine",0,h*.105,0),
       chest=bone("Chest",0,h*.105,0),
       neck=bone("Neck",0,h*.095,0),
       head=bone("Head",0,h*.075,0),
       // v398: measured from the uploaded GLB. The T-pose shoulder line is
       // around 0.66h, not up at the chest/neck line used by the first auto-rig.
       lua=bone("L_UpperArm",-h*.15,-h*.04,0),
       lla=bone("L_LowerArm",-h*.23,0,0),
       rua=bone("R_UpperArm", h*.15,-h*.04,0),
       rla=bone("R_LowerArm", h*.23,0,0),
       lul=bone("L_UpperLeg",-h*.065,-h*.02,0),
       lll=bone("L_LowerLeg",0,-h*.245,0),
       rul=bone("R_UpperLeg", h*.065,-h*.02,0),
       rll=bone("R_LowerLeg",0,-h*.245,0);
 hips.add(spine,lul,rul);spine.add(chest);chest.add(neck,lua,rua);neck.add(head);lua.add(lla);rua.add(rla);lul.add(lll);rul.add(rll);rig.add(hips);
 const bones=[hips,spine,chest,neck,head,lua,lla,rua,rla,lul,lll,rul,rll],bi=Object.freeze({
   hips:0,spine:1,chest:2,neck:3,head:4,lua:5,lla:6,rua:7,rla:8,lul:9,lll:10,rul:11,rll:12
 });
 const chooseRigidBone=(x,y,z)=>{
   const yf=y/h,ax=Math.abs(x),left=x<0;
   if(yf>.84)return bi.head;
   if(yf>.77)return bi.neck;

   // v403: rigid anatomical segmentation. Each triangle belongs to exactly one
   // body part, so clothing/body vertices can never stretch between torso and arm.
   if(yf>.31&&yf<.74){
     const armMinFrac=.105+THREE.MathUtils.clamp((.68-yf)/.36,0,1)*.075;
     if(ax>h*armMinFrac){
       if(yf>.56)return left?bi.lua:bi.rua;
       return left?bi.lla:bi.rla;
     }
   }

   if(yf<.46){
     if(yf<.245)return left?bi.lll:bi.rll;
     return left?bi.lul:bi.rul;
   }
   if(yf<.53)return bi.hips;
   if(yf<.64)return bi.spine;
   return bi.chest;
 };
 const skinned=[];
 for(const p of pieces){
   // v423: restore the uploaded Green Guy model. The previous builder called
   // a missing skin-weight helper and referenced hand/foot bones this rig does
   // not contain. Use the actual measured rigid segmentation instead.
   const pos=p.geo.attributes.position,indices=[],weights=[];
   for(let i=0;i<pos.count;i++){
     const boneIndex=chooseRigidBone(pos.getX(i),pos.getY(i),pos.getZ(i));
     indices.push(boneIndex,0,0,0);weights.push(1,0,0,0);
   }
   p.geo.setAttribute("skinIndex",new THREE.Uint16BufferAttribute(indices,4));
   p.geo.setAttribute("skinWeight",new THREE.Float32BufferAttribute(weights,4));
   const cloneMat=m=>{const c=m.clone();c.side=THREE.DoubleSide;c.needsUpdate=true;return c};
   const mat=Array.isArray(p.material)?p.material.map(cloneMat):cloneMat(p.material);
   const mesh=new THREE.SkinnedMesh(p.geo,mat);
   mesh.name=p.name;mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.userData.visualOnly=true;mesh.raycast=()=>{};
   rig.add(mesh);skinned.push(mesh);
 }
 rig.updateMatrixWorld(true);
 const skeleton=new THREE.Skeleton(bones);skeleton.calculateInverses();
 for(const mesh of skinned)mesh.bind(skeleton,mesh.matrixWorld);
 return rig;
}
function attachRadiatedGreenGuy(z,g){
 if(!z||z.kind!=="radiated"||z.radiatedGreenVisual||!radiatedGreenGuyTemplate)return false;
 const holder=new THREE.Group(),model=SkeletonUtils.clone(radiatedGreenGuyTemplate);
 holder.name="RadiatedGreenGuyVisual";model.name="RadiatedGreenGuyModel";
 const sourceHeight=radiatedGreenGuyTemplate.userData.sourceHeight||1.98;
 holder.scale.setScalar(1.98/sourceHeight);
 // The uploaded GLB's authored forward axis is opposite the live zombie rig.
 holder.rotation.y=Math.PI;
 holder.add(model);g.add(holder);
 z.radiatedGreenVisual=holder;z.radiatedGreenModel=model;z.radiatedGreenBones=new Map();
 for(const key of RADIATED_GREEN_BONE_KEYS){
   const b=model.getObjectByName("Green"+key);if(b)z.radiatedGreenBones.set(key,b);
 }
 if(z.rigVisual)z.rigVisual.traverse(o=>{if(o.isMesh)o.visible=false});
 z.radiatedGreenLastX=g.position.x;z.radiatedGreenLastZ=g.position.z;z.radiatedGreenMoveBlend=0;
 console.log("CITY OUTBREAK: Radiated uses auto-rigged green guy.glb",{bones:z.radiatedGreenBones.size,facingDeg:180});
 return true;
}
function buildRadiatedGreenHitboxes(z){
 if(!z?.radiatedGreenBones?.size)return false;
 // Retire the old procedural body's ray targets for this zombie only. Those meshes
 // remain hidden support geometry for legacy limb/ragdoll bookkeeping.
 if(z.hitMeshes)for(const o of z.hitMeshes)if(o)o.raycast=()=>{};

 const mat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,depthTest:false,colorWrite:false});
 const hitboxes=[];
 const add=(boneName,geo,x,y,zz,part,isHead=false)=>{
   const bone=z.radiatedGreenBones.get(boneName);if(!bone)return null;
   const q=new THREE.Mesh(geo,mat);q.position.set(x,y,zz);q.name="RadiatedGreenHit_"+part+"_"+boneName;
   q.castShadow=false;q.receiveShadow=false;q.userData.zombie=z;q.userData.part=part;
   if(isHead)q.userData.isHead=true;
   bone.add(q);hitboxes.push(q);
   if(z.ownedGeometries)z.ownedGeometries.push(geo);
   return q;
 };
 // These volumes follow the auto-rig bones, so the hit zones stay on the visible
 // Green Guy while walking, attacking, staggering and losing limbs.
 add("Head",new THREE.SphereGeometry(.245,10,8),0,.055,0,"head",true);
 add("Chest",new THREE.BoxGeometry(.54,.66,.36),0,-.11,0,"torso");
 add("Hips",new THREE.BoxGeometry(.38,.32,.30),0,-.07,0,"torso");

 add("L_UpperArm",new THREE.BoxGeometry(.44,.24,.28),-.22,0,0,"leftArm");
 add("L_LowerArm",new THREE.BoxGeometry(.42,.22,.26),-.20,0,0,"leftArm");
 add("R_UpperArm",new THREE.BoxGeometry(.44,.24,.28), .22,0,0,"rightArm");
 add("R_LowerArm",new THREE.BoxGeometry(.42,.22,.26), .20,0,0,"rightArm");

 add("L_UpperLeg",new THREE.BoxGeometry(.20,.44,.22),0,-.21,0,"leftLeg");
 add("L_LowerLeg",new THREE.BoxGeometry(.18,.43,.20),0,-.205,0,"leftLeg");
 add("R_UpperLeg",new THREE.BoxGeometry(.20,.44,.22),0,-.21,0,"rightLeg");
 add("R_LowerLeg",new THREE.BoxGeometry(.18,.43,.20),0,-.205,0,"rightLeg");

 if(z.ownedMaterials)z.ownedMaterials.push(mat);
 z.radiatedHitboxes=hitboxes;z.hitMeshes=hitboxes;
 document.documentElement.dataset.radiatedGreenHitboxes=String(hitboxes.length);
 return hitboxes.length>0;
}
// v413: Hairibar-style visible-rig bridge.
// The v358 hidden support skeleton already owns the real joint-space ragdoll.
// New GLB zombies now inherit the SUPPORT RIG'S ACTUAL RELATIVE JOINT MOTION
// after physics/collisions/bounces instead of running a second fake death pose.
// Using relative angular deltas avoids the raw-rest-axis retarget distortion
// that broke the walker in v400.
const CUSTOM_VISIBLE_RAGDOLL_KEYS=Object.freeze([
 "Hips","Spine","Chest","Neck","Head",
 "L_UpperArm","L_LowerArm","R_UpperArm","R_LowerArm",
 "L_UpperLeg","L_LowerLeg","R_UpperLeg","R_LowerLeg"
]);
function customRagdollAngleDelta(a){return Math.atan2(Math.sin(a),Math.cos(a))}
function syncCustomVisualFromRagdoll(z,bones,holder,storeKey){
 if(!z?.dead||!z?.ragdoll||!bones?.size||!holder)return false;
 const rag=z.ragdoll;
 if(!Array.isArray(rag.bones)||!rag.bones.length)return false;

 let base=z[storeKey];
 if(!base){
   const rotations=new Map();
   for(const key of CUSTOM_VISIBLE_RAGDOLL_KEYS){
     const b=bones.get(key);if(b)rotations.set(key,b.rotation.clone());
   }
   base=z[storeKey]={
     holderY:holder.position.y,
     holderX:holder.rotation.x,
     holderZ:holder.rotation.z,
     rotations
   };
 }

 const bySupportBone=new Map();
 for(const state of rag.bones)if(state?.o)bySupportBone.set(state.o,state);

 // Remove only leftover locomotion bob/lean. The parent zombie group z.g already
 // receives the true Hairibar-style root launch, tumble, bounce and ground settle.
 const settle=Math.min(1,Math.max(0,(z.corpseAge||0)/.18));
 const smooth=settle*settle*(3-2*settle);
 holder.position.y=THREE.MathUtils.lerp(base.holderY,0,smooth);
 holder.rotation.x=THREE.MathUtils.lerp(base.holderX,0,smooth);
 holder.rotation.z=THREE.MathUtils.lerp(base.holderZ,0,smooth);

 const apply=(key,amount=1)=>{
   const dst=bones.get(key),support=rigBone(z,key),state=support?bySupportBone.get(support):null,rest=base.rotations.get(key);
   if(!dst||!support||!state||!rest)return 0;
   const dx=customRagdollAngleDelta(state.o.rotation.x-state.sx);
   const dy=customRagdollAngleDelta(state.o.rotation.y-state.sy);
   const dz=customRagdollAngleDelta(state.o.rotation.z-state.sz);
   dst.rotation.set(rest.x+dx*amount,rest.y+dy*amount,rest.z+dz*amount);
   return 1;
 };

 // v420: visible custom zombies follow the simulated ragdoll 1:1.
 // Previous sub-1.0 multipliers visibly stiffened the hips/spine/chest/neck
 // and upper legs even while the hidden support rig was moving freely.
 let applied=0;
 applied+=apply("Hips",1.00);
 applied+=apply("Spine",1.00);
 applied+=apply("Chest",1.00);
 applied+=apply("Neck",1.00);
 applied+=apply("Head",1.00);
 applied+=apply("L_UpperArm",1.00);
 applied+=apply("L_LowerArm",1.00);
 applied+=apply("R_UpperArm",1.00);
 applied+=apply("R_LowerArm",1.00);
 applied+=apply("L_UpperLeg",1.00);
 applied+=apply("L_LowerLeg",1.00);
 applied+=apply("R_UpperLeg",1.00);
 applied+=apply("R_LowerLeg",1.00);
 return applied>=8;
}
function syncRadiatedGreenGuy(z,dt=0){
 const h=z?.radiatedGreenVisual,bones=z?.radiatedGreenBones;if(!h||!bones?.size)return;
 if(z.crawlerUpperVisual===h&&syncCrawlerUpperVisual(z))return;
 const g=z.g,gx=g.position.x,gz=g.position.z,lastX=Number.isFinite(z.radiatedGreenLastX)?z.radiatedGreenLastX:gx,lastZ=Number.isFinite(z.radiatedGreenLastZ)?z.radiatedGreenLastZ:gz;
 const speedNow=Math.hypot(gx-lastX,gz-lastZ)/Math.max(dt,.001);
 z.radiatedGreenLastX=gx;z.radiatedGreenLastZ=gz;
 const canWalk=!z.dead&&!z.knockdown,targetMove=canWalk&&speedNow>.08?1:0;
 z.radiatedGreenMoveBlend=THREE.MathUtils.lerp(z.radiatedGreenMoveBlend||0,targetMove,Math.min(1,dt*7));
 const blend=z.radiatedGreenMoveBlend,p=z.rigPolishPhase||z.phase||0,step=Math.sin(p),attack=Math.max(0,Math.min(1,(z.attackAnim||0)/.62));
 h.rotation.y=Math.PI;
 if(z.knockdown?.bodyPbd?.holder===h)return;
 if(z.dead&&z.ragdoll?.bodyPbd?.holder===h)return;
 if(z.dead&&syncCustomVisualFromRagdoll(z,bones,h,"radiatedVisibleRagdollBase"))return;
 h.position.y=Math.abs(step)*.028*blend;
 h.rotation.x=-.035*blend-attack*.025;
 h.rotation.z=step*.025*blend+(z.staggerDir||1)*(z.stagger||0)*.045;
 const hips=bones.get("Hips"),spine=bones.get("Spine"),chest=bones.get("Chest"),neck=bones.get("Neck"),head=bones.get("Head"),
       lua=bones.get("L_UpperArm"),lla=bones.get("L_LowerArm"),rua=bones.get("R_UpperArm"),rla=bones.get("R_LowerArm"),
       lul=bones.get("L_UpperLeg"),lll=bones.get("L_LowerLeg"),rul=bones.get("R_UpperLeg"),rll=bones.get("R_LowerLeg");
 if(hips)hips.rotation.set(0,step*.035*blend,0);
 if(spine)spine.rotation.set(-.025*blend,0,-step*.020*blend);
 if(chest)chest.rotation.set(-.035*blend,0,step*.030*blend);
 if(neck)neck.rotation.set(.025*blend,0,-step*.018*blend);
 if(head)head.rotation.set(.035*blend,-step*.055*blend,step*.020*blend);
 const armSwing=step*.24*blend,attackReach=attack*.28;
 // Keep both arms clearly outside the torso while walking upright.
 if(lua){radiatedArmTarget.set(-.36,-.93,armSwing-attackReach).normalize();lua.quaternion.setFromUnitVectors(radiatedArmRestL,radiatedArmTarget)}
 if(rua){radiatedArmTarget.set(.36,-.93,-armSwing-attackReach).normalize();rua.quaternion.setFromUnitVectors(radiatedArmRestR,radiatedArmTarget)}
 if(lla)lla.rotation.set(0,0,-.05-attack*.08);
 if(rla)rla.rotation.set(0,0,.05+attack*.08);
 if(lul)lul.rotation.set(step*.36*blend,0,0);
 if(rul)rul.rotation.set(-step*.36*blend,0,0);
 if(lll)lll.rotation.set(Math.max(0,-step)*.48*blend,0,0);
 if(rll)rll.rotation.set(Math.max(0,step)*.48*blend,0,0);
}
const BASIC_WALKER_BONE_KEYS=Object.freeze([
 "Hips","Spine","Chest","Neck","Head",
 "L_UpperArm","L_LowerArm","R_UpperArm","R_LowerArm",
 "L_UpperLeg","L_LowerLeg","R_UpperLeg","R_LowerLeg","L_Hand","R_Hand","L_Foot","R_Foot"
]);
function buildBasicWalkerTemplate(source){
 if(!source)return null;
 source.updateMatrixWorld(true);
 const invRoot=new THREE.Matrix4().copy(source.matrixWorld).invert(),pieces=[];
 source.traverse(o=>{
   if(!o.isMesh||!o.geometry)return;
   const geo=o.geometry.clone(),rel=new THREE.Matrix4().multiplyMatrices(invRoot,o.matrixWorld);
   geo.applyMatrix4(rel);geo.computeBoundingBox();
   pieces.push({geo,material:o.material,name:o.name||"BasicWalkerMesh"});
 });
 if(!pieces.length)return null;
 const box=new THREE.Box3().makeEmpty();for(const p of pieces)box.union(p.geo.boundingBox);
 const size=new THREE.Vector3(),center=new THREE.Vector3();box.getSize(size);box.getCenter(center);
 const h=size.y;if(!Number.isFinite(h)||h<.25)return null;
 const shift=new THREE.Matrix4().makeTranslation(-center.x,-box.min.y,-center.z);
 for(const p of pieces){p.geo.applyMatrix4(shift);p.geo.computeBoundingBox()}
 const rig=new THREE.Group();rig.name="BasicWalkerAutoRig";rig.userData.sourceHeight=h;
 const bone=(name,x,y,z)=>{const b=new THREE.Bone();b.name="Walker"+name;b.position.set(x,y,z);return b};
 // World-space profiling of walkers.glb: hips ~.46h, shoulders ~.70h,
 // elbows ~.55h and hands ~.37h. Preserve its authored A-pose.
 const hips=bone("Hips",0,h*.46,0),
       spine=bone("Spine",0,h*.13,0),
       chest=bone("Chest",0,h*.12,0),
       neck=bone("Neck",0,h*.09,0),
       head=bone("Head",0,h*.08,0),
       lua=bone("L_UpperArm",-h*.07,-h*.01,0),
       lla=bone("L_LowerArm",-h*.11,-h*.15,0),
       lhand=bone("L_Hand",-h*.10,-h*.17,0),
       rua=bone("R_UpperArm", h*.07,-h*.01,0),
       rla=bone("R_LowerArm", h*.11,-h*.15,0),
       rhand=bone("R_Hand", h*.10,-h*.17,0),
       lul=bone("L_UpperLeg",-h*.055,-h*.02,0),
       lll=bone("L_LowerLeg",0,-h*.23,0),
       lfoot=bone("L_Foot",0,-h*.20,h*.015),
       rul=bone("R_UpperLeg", h*.055,-h*.02,0),
       rll=bone("R_LowerLeg",0,-h*.23,0),
       rfoot=bone("R_Foot",0,-h*.20,h*.015);
 hips.add(spine,lul,rul);spine.add(chest);chest.add(neck,lua,rua);neck.add(head);
 lua.add(lla);lla.add(lhand);rua.add(rla);rla.add(rhand);
 lul.add(lll);lll.add(lfoot);rul.add(rll);rll.add(rfoot);rig.add(hips);
 const bones=[hips,spine,chest,neck,head,lua,lla,rua,rla,lul,lll,rul,rll,lhand,rhand,lfoot,rfoot],bi=Object.freeze({
   hips:0,spine:1,chest:2,neck:3,head:4,lua:5,lla:6,rua:7,rla:8,lul:9,lll:10,rul:11,rll:12,lhand:13,rhand:14,lfoot:15,rfoot:16
 });
 const chooseRigidBone=(x,y,z)=>{
   const yf=y/h,ax=Math.abs(x),left=x<0;
   // v406: keep the full head/neck visual shell rigidly together. Splitting
   // these triangles between Head and Neck made the face tear apart on death.
   if(yf>.745)return bi.head;

   // v404: rigid anatomical segmentation. Each triangle belongs to exactly one
   // body part, so clothing/body vertices cannot stretch between torso and limbs.
   if(yf>.31&&yf<.74){
     const armMinFrac=.105+THREE.MathUtils.clamp((.68-yf)/.36,0,1)*.075;
     if(ax>h*armMinFrac){
       if(yf>.56)return left?bi.lua:bi.rua;
       if(yf>.39)return left?bi.lla:bi.rla;
       return left?bi.lhand:bi.rhand;
     }
   }

   if(yf<.46){
     if(yf<.095)return left?bi.lfoot:bi.rfoot;
     if(yf<.245)return left?bi.lll:bi.rll;
     return left?bi.lul:bi.rul;
   }
   if(yf<.53)return bi.hips;
   if(yf<.64)return bi.spine;
   return bi.chest;
 };
 const jointBlend=(yf,boundary,width=.035)=>Math.max(0,1-Math.abs(yf-boundary)/width)*.22;
 const chooseWalkerWeights=(x,y,z)=>{
   const yf=y/h,primary=chooseRigidBone(x,y,z);
   let secondary=primary,w=0;
   const blend=(idx,boundary,width=.035)=>{const bw=jointBlend(yf,boundary,width);if(bw>w){secondary=idx;w=bw}};
   if(primary===bi.lua){blend(bi.lla,.56);blend(bi.chest,.70,.045)}
   else if(primary===bi.rua){blend(bi.rla,.56);blend(bi.chest,.70,.045)}
   else if(primary===bi.lla){blend(bi.lua,.56);blend(bi.lhand,.39)}
   else if(primary===bi.rla){blend(bi.rua,.56);blend(bi.rhand,.39)}
   else if(primary===bi.lhand)blend(bi.lla,.39);
   else if(primary===bi.rhand)blend(bi.rla,.39);
   else if(primary===bi.lul){blend(bi.lll,.245);blend(bi.hips,.445,.04)}
   else if(primary===bi.rul){blend(bi.rll,.245);blend(bi.hips,.445,.04)}
   else if(primary===bi.lll){blend(bi.lul,.245);blend(bi.lfoot,.095)}
   else if(primary===bi.rll){blend(bi.rul,.245);blend(bi.rfoot,.095)}
   else if(primary===bi.lfoot)blend(bi.lll,.095);
   else if(primary===bi.rfoot)blend(bi.rll,.095);
   else if(primary===bi.spine){blend(bi.hips,.53);blend(bi.chest,.64)}
   else if(primary===bi.chest)blend(bi.spine,.64);
   return secondary===primary||w<=.001?[primary,1,0,0]:[primary,1-w,secondary,w];
 };
 const skinned=[];
 for(const p of pieces){
   // v423: a small blend only at anatomical seams keeps the skin connected while
   // elbows/knees/shoulders move. Most vertices remain effectively rigid.
   const geo=p.geo.index?p.geo.toNonIndexed():p.geo;
   p.geo=geo;
   const pos=geo.attributes.position,indices=[],weights=[];
   for(let i=0;i<pos.count;i++){
     const w=chooseWalkerWeights(pos.getX(i),pos.getY(i),pos.getZ(i));
     indices.push(w[0],w[2],0,0);weights.push(w[1],w[3],0,0);
   }
   geo.setAttribute("skinIndex",new THREE.Uint16BufferAttribute(indices,4));
   geo.setAttribute("skinWeight",new THREE.Float32BufferAttribute(weights,4));
   const cloneMat=m=>{const c=m.clone();c.side=THREE.DoubleSide;c.needsUpdate=true;return c};
   const mat=Array.isArray(p.material)?p.material.map(cloneMat):cloneMat(p.material);
   const mesh=new THREE.SkinnedMesh(geo,mat);
   mesh.name=p.name;mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.userData.visualOnly=true;mesh.raycast=()=>{};
   rig.add(mesh);skinned.push(mesh);
 }
 rig.updateMatrixWorld(true);
 const skeleton=new THREE.Skeleton(bones);skeleton.calculateInverses();
 for(const mesh of skinned)mesh.bind(skeleton,mesh.matrixWorld);
 return rig;
}
function attachBasicWalkerVisual(z,g){
 if(!z||z.kind!=="shambler"||z.walkerVisual||!basicWalkerTemplate)return false;
 const holder=new THREE.Group(),model=SkeletonUtils.clone(basicWalkerTemplate);
 holder.name="BasicWalkerVisual";model.name="BasicWalkerModel";
 const sourceHeight=basicWalkerTemplate.userData.sourceHeight||9.46;
 holder.scale.setScalar(1.92/sourceHeight);
 holder.rotation.y=Math.PI;
 holder.add(model);g.add(holder);
 z.walkerVisual=holder;z.walkerModel=model;z.walkerSourceHeight=sourceHeight;z.walkerBones=new Map();
 for(const key of BASIC_WALKER_BONE_KEYS){
   const b=model.getObjectByName("Walker"+key);if(b)z.walkerBones.set(key,b);
 }
 if(z.rigVisual)z.rigVisual.traverse(o=>{if(o.isMesh)o.visible=false});
 z.walkerLastX=g.position.x;z.walkerLastZ=g.position.z;z.walkerMoveBlend=0;
 console.log("CITY OUTBREAK: basic Shambler uses walkers.glb",{bones:z.walkerBones.size,facingDeg:180});
 return true;
}
function buildBasicWalkerHitboxes(z){
 if(!z?.walkerBones?.size)return false;
 if(z.hitMeshes)for(const o of z.hitMeshes)if(o)o.raycast=()=>{};
 const h=z.walkerSourceHeight||9.46,mat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,depthTest:false,colorWrite:false}),hitboxes=[];
 const add=(boneName,geo,pos,quat,part,isHead=false)=>{
   const bone=z.walkerBones.get(boneName);if(!bone)return null;
   const q=new THREE.Mesh(geo,mat);q.position.copy(pos||new THREE.Vector3());if(quat)q.quaternion.copy(quat);
   q.name="BasicWalkerHit_"+part+"_"+boneName;q.castShadow=false;q.receiveShadow=false;q.userData.zombie=z;q.userData.part=part;if(isHead)q.userData.isHead=true;
   bone.add(q);hitboxes.push(q);if(z.ownedGeometries)z.ownedGeometries.push(geo);return q;
 };
 const yAxis=new THREE.Vector3(0,1,0);
 const segment=(boneName,childName,part,width,depth)=>{
   const b=z.walkerBones.get(boneName),c=z.walkerBones.get(childName);if(!b||!c)return;
   const dir=c.position.clone(),len=dir.length();if(len<.001)return;
   const quat=new THREE.Quaternion().setFromUnitVectors(yAxis,dir.clone().normalize());
   add(boneName,new THREE.BoxGeometry(width,len,depth),dir.multiplyScalar(.5),quat,part,false);
 };
 add("Head",new THREE.SphereGeometry(h*.115,10,8),new THREE.Vector3(0,h*.025,0),null,"head",true);
 add("Chest",new THREE.BoxGeometry(h*.22,h*.23,h*.16),new THREE.Vector3(0,-h*.045,0),null,"torso");
 add("Hips",new THREE.BoxGeometry(h*.18,h*.15,h*.15),new THREE.Vector3(0,-h*.035,0),null,"torso");
 segment("L_UpperArm","L_LowerArm","leftArm",h*.09,h*.09);segment("L_LowerArm","L_Hand","leftArm",h*.085,h*.085);
 segment("R_UpperArm","R_LowerArm","rightArm",h*.09,h*.09);segment("R_LowerArm","R_Hand","rightArm",h*.085,h*.085);
 segment("L_UpperLeg","L_LowerLeg","leftLeg",h*.10,h*.10);segment("L_LowerLeg","L_Foot","leftLeg",h*.09,h*.09);
 segment("R_UpperLeg","R_LowerLeg","rightLeg",h*.10,h*.10);segment("R_LowerLeg","R_Foot","rightLeg",h*.09,h*.09);
 if(z.ownedMaterials)z.ownedMaterials.push(mat);
 z.walkerHitboxes=hitboxes;z.hitMeshes=hitboxes;document.documentElement.dataset.basicWalkerHitboxes=String(hitboxes.length);
 return hitboxes.length>0;
}
function syncBasicWalkerVisual(z,dt=0){
 const holder=z?.walkerVisual,bones=z?.walkerBones;if(!holder||!bones?.size)return;
 if(z.crawlerUpperVisual===holder&&syncCrawlerUpperVisual(z))return;
 holder.rotation.y=Math.PI;
 if(z.knockdown?.bodyPbd?.holder===holder)return;
 if(z.dead&&z.ragdoll?.bodyPbd?.holder===holder)return;
 if(z.dead&&z.ragdoll?.directVisual===holder)return;
 if(z.dead&&syncCustomVisualFromRagdoll(z,bones,holder,"walkerVisibleRagdollBase"))return;

 // Legacy fallback only: if the hidden support ragdoll is unavailable, keep the
 // previous no-stretch death pose rather than leaving the custom mesh frozen.
 // Normal custom-model deaths now take the v413 Hairibar-style bridge above.
 // v402: never feed the custom GLB raw ragdoll quaternions. On death,
 // let the approved root ragdoll move/tumble the whole zombie while this model's
 // own joints fold and settle. Rotations only = no mesh stretching.
 if(z.dead){
   const age=Math.max(0,z.corpseAge||0),t=Math.max(0,Math.min(1,age/1.25));
   const ease=t*t*(3-2*t),damp=Math.exp(-age*1.45),
         wob=Math.sin(age*8.1+(z.phase||0))*damp,
         wob2=Math.sin(age*10.7+(z.phase||0)*1.73+1.2)*damp,
         wob3=Math.sin(age*7.3+(z.phase||0)*.81+2.1)*damp;
   const side=(Math.sin((z.phase||0)*1.71)>=0?1:-1);
   const hips=bones.get("Hips"),spine=bones.get("Spine"),chest=bones.get("Chest"),neck=bones.get("Neck"),head=bones.get("Head"),
         lua=bones.get("L_UpperArm"),lla=bones.get("L_LowerArm"),rua=bones.get("R_UpperArm"),rla=bones.get("R_LowerArm"),
         lul=bones.get("L_UpperLeg"),lll=bones.get("L_LowerLeg"),rul=bones.get("R_UpperLeg"),rll=bones.get("R_LowerLeg"),
         lfoot=bones.get("L_Foot"),rfoot=bones.get("R_Foot");

   // Capture the exact live walk/run/attack pose once. Death starts from here,
   // so the walker never snaps back to its authored A/T pose before falling.
   if(!z.walkerDeathPose){
     const bonePose=new Map();
     for(const key of BASIC_WALKER_BONE_KEYS){
       const b=bones.get(key);if(b)bonePose.set(key,b.rotation.clone());
     }
     z.walkerDeathPose={
       holderY:holder.position.y,holderX:holder.rotation.x,holderZ:holder.rotation.z,
       bones:bonePose
     };
   }
   const base=z.walkerDeathPose,lerpRot=(bone,key,tx,ty,tz,wx=0,wy=0,wz=0)=>{
     if(!bone)return;
     const r=base.bones.get(key)||{x:0,y:0,z:0};
     bone.rotation.set(
       THREE.MathUtils.lerp(r.x,tx,ease)+wx,
       THREE.MathUtils.lerp(r.y,ty,ease)+wy,
       THREE.MathUtils.lerp(r.z,tz,ease)+wz
     );
   };

   holder.position.y=THREE.MathUtils.lerp(base.holderY,-.035,ease);
   holder.rotation.x=THREE.MathUtils.lerp(base.holderX,.16,ease)+wob3*.025;
   holder.rotation.z=THREE.MathUtils.lerp(base.holderZ,side*.12,ease)+wob*.05;

   lerpRot(hips,"Hips",.24,side*.10,side*.20,wob*.07,wob2*.025,wob3*.04);
   lerpRot(spine,"Spine",.48,-side*.12,side*.28,wob2*.09,wob*.035,wob3*.055);
   lerpRot(chest,"Chest",.38,side*.10,-side*.25,-wob*.07,wob2*.03,-wob3*.05);
   lerpRot(neck,"Neck",-.08,0,side*.06,wob*.02,0,wob2*.02);
   lerpRot(head,"Head",-.20,side*.18,-side*.20,wob*.08,wob2*.05,-wob3*.07);
   // v408: the hidden approved zombie rig already owns the real ragdoll.
   // Drive the visible walker shoulder/elbow joints from those simulated bones
   // instead of running a second fake arm-collapse animation.
   const copyRagdollArm=(dst,key,zBias)=>{
     const src=rigBone(z,key);
     if(!dst||!src)return false;
     dst.rotation.set(src.rotation.x,src.rotation.y,src.rotation.z+zBias);
     return true;
   };
   if(!copyRagdollArm(lua,"L_UpperArm", .34))lerpRot(lua,"L_UpperArm",.82,0,.30,wob*.30,wob2*.10,wob3*.13);
   if(!copyRagdollArm(rua,"R_UpperArm",-.34))lerpRot(rua,"R_UpperArm",.68,0,-.32,-wob2*.30,wob*.10,-wob3*.13);
   if(!copyRagdollArm(lla,"L_LowerArm", .06))lerpRot(lla,"L_LowerArm",.72,0,.12,wob2*.27,0,wob*.10);
   if(!copyRagdollArm(rla,"R_LowerArm",-.06))lerpRot(rla,"R_LowerArm",.58,0,-.14,-wob*.27,0,-wob2*.10);
   lerpRot(lul,"L_UpperLeg",-.58,0,-.12,wob3*.20,wob*.075,0);
   lerpRot(rul,"R_UpperLeg",.44,0,.14,-wob*.20,wob2*.075,0);
   lerpRot(lll,"L_LowerLeg",-.94,0,0,wob*.32,0,0);
   lerpRot(rll,"R_LowerLeg",-.78,0,0,-wob2*.32,0,0);
   lerpRot(lfoot,"L_Foot",.38,0,0,wob3*.10,0,0);
   lerpRot(rfoot,"R_Foot",.32,0,0,-wob*.10,0,0);
   return;
 }
 if(z.knockdown)return;

 const gx=z.g.position.x,gz=z.g.position.z,lastX=Number.isFinite(z.walkerLastX)?z.walkerLastX:gx,lastZ=Number.isFinite(z.walkerLastZ)?z.walkerLastZ:gz;
 const moved=Math.hypot(gx-lastX,gz-lastZ);z.walkerLastX=gx;z.walkerLastZ=gz;
 z.walkerMoveBlend=THREE.MathUtils.lerp(z.walkerMoveBlend||0,moved>.00015?1:0,Math.min(1,dt*8));

 // Use the approved Shambler's distance-driven locomotion phase/run blend so the
 // uploaded model stays synchronized with the real game movement instead of
 // running an unrelated canned cycle.
 const phase=z.rigPolishPhase||z.phase||0,run=Math.max(0,Math.min(1,z.rigRunBlend||0)),walk=z.walkerMoveBlend;
 const s=Math.sin(phase),c=Math.cos(phase),lf=Math.max(0,Math.sin(phase+.68)),rf=Math.max(0,Math.sin(phase+Math.PI+.68));
 const attack=Math.max(0,Math.min(1,(z.attackAnim||0)/.62)),stagger=Math.max(0,Math.min(1,z.stagger||0));

 const hips=bones.get("Hips"),spine=bones.get("Spine"),chest=bones.get("Chest"),neck=bones.get("Neck"),head=bones.get("Head"),
       lua=bones.get("L_UpperArm"),lla=bones.get("L_LowerArm"),rua=bones.get("R_UpperArm"),rla=bones.get("R_LowerArm"),
       lul=bones.get("L_UpperLeg"),lll=bones.get("L_LowerLeg"),rul=bones.get("R_UpperLeg"),rll=bones.get("R_LowerLeg"),
       lfoot=bones.get("L_Foot"),rfoot=bones.get("R_Foot");

 const thighAmp=(.38+(.72-.38)*run)*walk;
 const kneeBase=.10+.05*run,kneeAmp=.62+.54*run;
 const armBase=.12+.05*run,armAmp=(.38+.34*run)*walk;

 holder.position.y=(.010+.020*run)*(1-Math.cos(phase*2))*.5*walk;
 holder.rotation.x=-.018*walk-attack*.018;
 holder.rotation.z=s*(.012+.010*run)*walk+(z.staggerDir||1)*stagger*.035;

 if(hips)hips.rotation.set(0,s*(.018+.012*run)*walk,s*(.008+.012*run)*walk);
 if(spine)spine.rotation.set(-.018*walk,s*(.020+.025*run)*walk,c*(.010+.012*run)*walk);
 if(chest)chest.rotation.set(-.028*walk,-s*(.016+.020*run)*walk,-c*(.008+.010*run)*walk);
 if(neck)neck.rotation.set(.018*walk,0,0);
 if(head)head.rotation.set(.028*walk,-s*(.045+.020*run)*walk,s*(.012+.010*run)*walk+stagger*.025);

 // v408: use the same real skeleton that drives Shambler locomotion,
 // attacks and hit reactions. The Z biases only convert its down-arm rest pose
 // to the uploaded walker's authored A-pose shoulder orientation.
 const supportLua=rigBone(z,"L_UpperArm"),supportRua=rigBone(z,"R_UpperArm"),
       supportLla=rigBone(z,"L_LowerArm"),supportRla=rigBone(z,"R_LowerArm");
 if(lua){
   if(supportLua)lua.rotation.set(supportLua.rotation.x,supportLua.rotation.y*.65,.34+supportLua.rotation.z*.65);
   else lua.rotation.set(armBase-s*armAmp-attack*.42,0,.34);
 }
 if(rua){
   if(supportRua)rua.rotation.set(supportRua.rotation.x,supportRua.rotation.y*.65,-.34+supportRua.rotation.z*.65);
   else rua.rotation.set(armBase+s*armAmp-attack*.42,0,-.34);
 }
 if(lla){
   if(supportLla)lla.rotation.set(supportLla.rotation.x,supportLla.rotation.y*.65,.06+supportLla.rotation.z*.65);
   else lla.rotation.set(.12+Math.max(0,s)*(.20+.12*run)+attack*.24,0,.06);
 }
 if(rla){
   if(supportRla)rla.rotation.set(supportRla.rotation.x,supportRla.rotation.y*.65,-.06+supportRla.rotation.z*.65);
   else rla.rotation.set(.12+Math.max(0,-s)*(.20+.12*run)+attack*.24,0,-.06);
 }

 if(lul)lul.rotation.set(s*thighAmp,0,0);
 if(rul)rul.rotation.set(-s*thighAmp,0,0);
 const lk=kneeBase+lf*lf*kneeAmp,rk=kneeBase+rf*rf*kneeAmp;
 if(lll)lll.rotation.set(lk,0,0);
 if(rll)rll.rotation.set(rk,0,0);
 if(lfoot)lfoot.rotation.set(-lk*.42-.035*run,0,0);
 if(rfoot)rfoot.rotation.set(-rk*.42-.035*run,0,0);
}
function applyZombieRigProfile(rig,kind){
 const p=ZOMBIE_RIG_PROFILES[kind]||SHAMBLER_RIG_PROFILE;
 rig.scale.setScalar(p.rigScale);

 const neckBone=rig.getObjectByName("Neck"),headBone=rig.getObjectByName("Head"),
       chestBone=rig.getObjectByName("Chest"),spineBone=rig.getObjectByName("Spine");
 if(headBone){headBone.position.y+=p.headYOffset;headBone.scale.set(...p.headScale)}
 if(neckBone)neckBone.scale.set(...p.neckScale);
 if(chestBone)chestBone.scale.set(...p.chestScale);
 if(spineBone)spineBone.scale.set(...p.spineScale);
 for(const nm of ["L_UpperArm","R_UpperArm"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(...p.upperArmScale)}
 for(const nm of ["L_LowerArm","R_LowerArm"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(...p.lowerArmScale)}
 for(const nm of ["L_UpperLeg","R_UpperLeg"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(...p.upperLegScale)}
 for(const nm of ["L_LowerLeg","R_LowerLeg"]){const b=rig.getObjectByName(nm);if(b)b.scale.set(...p.lowerLegScale)}
 return{neckBone,headBone,chestBone,spineBone,profile:p};
}
function attachRiggedZombie(z,g,kind,variant=0,hazardMist=null){
 if(!zombieRigAsset||kind==="crawler")return false;
 // Keep old procedural pieces as invisible hitboxes; the skinned rig is visual only.
 g.traverse(o=>{if(o.isMesh){o.visible=false;o.castShadow=false;o.receiveShadow=false}});
 if(hazardMist){hazardMist.visible=true;hazardMist.raycast=()=>{}};
 const rig=zombieRigAsset?SkeletonUtils.clone(zombieRigAsset.scene):null;
 if(!rig)return false;
 rig.name="RiggedZombieVisual";
 rig.position.set(0,0,0);
 const eye=kind==="radiated"?0x52ff62:(kind==="infected"||kind==="acidic")?0xff4141:kind==="boss"?0xf4f7ff:0xffdf43, outfit=[0x4a5549,0x5a5145,0x33495a,0x665e54,0x4b403f,0x3d474c][Math.abs(variant)%6],ownedRigMaterials=[];
 let rigSkinMat=null,rigShirtMat=null,rigHairMat=null,rigWoundMat=null;
 rig.traverse(o=>{
   if(!o.isMesh)return;
   o.castShadow=true;o.receiveShadow=true;o.frustumCulled=true;o.userData.visualOnly=true;
   // The invisible procedural geometry remains responsible for shooting/hit zones.
   o.raycast=()=>{};
   const mats=Array.isArray(o.material)?o.material:[o.material];
   const copies=mats.map(m=>{
     const n=m.clone();
     // v137: use the rig's authored vertex normals instead of forcing every
     // polygon to shade as a separate flat face. This keeps the low-poly style
     // while removing the harsh box/mannequin look.
     n.flatShading=false;
     n.side=THREE.DoubleSide;
     n.transparent=false;
     n.opacity=1;
     n.depthWrite=true;
     n.depthTest=true;
     const nm=(m.name||"").toLowerCase();
     if(nm.includes("shirt")){n.color.setHex(outfit);if(!rigShirtMat)rigShirtMat=n}
     if(nm.includes("skin")){
       // Cooler, bruised corpse tones so the new human face reads undead rather than friendly.
       const skin=[0x73796e,0x696d64,0x817665,0x657168][variant%4];n.color.setHex(skin);if(!rigSkinMat)rigSkinMat=n;
     }
     if(nm.includes("hair")){if(!rigHairMat)rigHairMat=n}
     if(nm.includes("pants")){n.color.setHex([0x292c30,0x38332f,0x2d363a][variant%3])}
     if(nm.includes("wound")){
       n.color.setHex(kind==="radiated"?0x2d8a3d:kind==="acidic"?0x981010:0x77100f);
       n.roughness=.58;n.metalness=.04;if(!rigWoundMat)rigWoundMat=n;
     }
     if(nm.includes("eyes")){
       n.color.setHex(eye);n.emissive?.setHex(eye);n.emissiveIntensity=3.2;
     }
     n.needsUpdate=true;ownedRigMaterials.push(n);return n;
   });
   o.material=Array.isArray(o.material)?copies:copies[0];
   const finalMats=Array.isArray(o.material)?o.material:[o.material];
   for(const fm of finalMats){fm.side=THREE.DoubleSide;fm.transparent=false;fm.opacity=1;fm.depthWrite=true;fm.depthTest=true;fm.needsUpdate=true;}
 });
 // Apply the Shambler baseline first. Future zombie types only override the
 // measurements that actually differ, so all shared geometry stays shared.
 const {neckBone,headBone,chestBone,spineBone,profile:rigProfile}=applyZombieRigProfile(rig,kind);
 z.visualBaseKind="shambler";
 z.visualProfileKind=kind;
 z.rigVisualProfile=rigProfile;
 if(neckBone&&rigSkinMat){
   const bridge=new THREE.Mesh(ZRIG_NECK_DETAIL_GEO,rigSkinMat);
   bridge.name="WalkerNeckBridge";bridge.position.set(0,.036,-.018);bridge.rotation.x=-.08;
   bridge.castShadow=true;bridge.receiveShadow=true;bridge.userData.visualOnly=true;bridge.raycast=()=>{};neckBone.add(bridge);
 }
 if(headBone&&rigSkinMat&&kind!=="boss"){
   // Human-readable skull, jaw, nose, cheeks, ears and chin in one shared mesh.
   const face=new THREE.Mesh(ZRIG_HUMAN_FACE_GEO,rigSkinMat);
   face.name="WalkerHumanFace";face.castShadow=true;face.receiveShadow=true;
   face.userData.visualOnly=true;face.raycast=()=>{};headBone.add(face);
   // Brows, mouth and nostrils use the existing hair/dark material as one second mesh.
   if(rigHairMat){
     const features=new THREE.Mesh(ZRIG_FACE_DARK_GEO,rigHairMat);
     features.name="WalkerHumanFaceDark";features.castShadow=false;features.receiveShadow=false;
     features.userData.visualOnly=true;features.raycast=()=>{};headBone.add(features);
   }
   if(rigWoundMat){
     const faceGore=new THREE.Mesh(ZRIG_FACE_GORE_GEO,rigWoundMat);
     faceGore.name="WalkerFaceGore";faceGore.scale.x=variant%2?-1:1;faceGore.rotation.z=((variant%3)-1)*.045;
     faceGore.castShadow=false;faceGore.receiveShadow=false;faceGore.userData.visualOnly=true;faceGore.raycast=()=>{};headBone.add(faceGore);
   }
 }
 if(chestBone&&rigShirtMat){
   const upper=new THREE.Mesh(ZRIG_UPPER_DETAIL_GEO,rigShirtMat);
   upper.name="WalkerUpperTorsoDetail";upper.userData.visualOnly=true;upper.raycast=()=>{};chestBone.add(upper);
   if(rigWoundMat&&kind!=="boss"){
     const chestGore=new THREE.Mesh(ZRIG_CHEST_GORE_GEO,rigWoundMat);
     chestGore.name="WalkerChestGore";chestGore.scale.x=variant%2?-1:1;chestGore.rotation.z=((variant%4)-1.5)*.025;
     chestGore.castShadow=false;chestGore.receiveShadow=false;chestGore.userData.visualOnly=true;chestGore.raycast=()=>{};chestBone.add(chestGore);
   }
 }
 g.add(rig);
 const mixer=new THREE.AnimationMixer(rig), actions={};
 for(const clip of zombieRigAsset.animations)actions[clip.name]=mixer.clipAction(clip);
 const baseName=(kind==="sprinter"||kind==="infected"||kind==="acidic")?"Sprint":"Shamble";
 const base=actions[baseName]||actions.Shamble||actions.Idle;
 if(base){base.enabled=true;base.setLoop(THREE.LoopRepeat,Infinity);base.play();}
 z.rigVisual=rig;z.mixer=mixer;z.rigActions=actions;z.rigBase=base;z.rigTransient=null;z.rigTransientT=0;z.rigMaterials=ownedRigMaterials;
 z.rigPolishPhase=(variant%4)*1.37;z.rigRunBlend=(kind==="sprinter"||kind==="infected"||kind==="acidic")?1:0;
 z.rigLastMoveX=g.position.x;z.rigLastMoveZ=g.position.z;
 const hips=rig.getObjectByName("Hips");z.rigHipsBaseY=hips?hips.position.y:.9;
 return true;
}
function applyRigLocomotionPolish(z,wantsRun,dt){
 if(!z||!z.rigVisual||z.kind==="boss")return;
 const naturalRunner=z.kind==="sprinter"||z.kind==="infected"||z.kind==="acidic";
 const runTarget=(wantsRun||naturalRunner)?1:0;
 z.rigRunBlend=Math.max(0,Math.min(1,(z.rigRunBlend||0)+(runTarget-(z.rigRunBlend||0))*Math.min(1,dt*4.2)));
 const rb=z.rigRunBlend;

 const gx=z.g.position.x,gz=z.g.position.z;
 const lastX=Number.isFinite(z.rigLastMoveX)?z.rigLastMoveX:gx,lastZ=Number.isFinite(z.rigLastMoveZ)?z.rigLastMoveZ:gz;
 const moved=Math.min(.45,Math.hypot(gx-lastX,gz-lastZ));
 z.rigLastMoveX=gx;z.rigLastMoveZ=gz;
 // About 1.4 m per full walk cycle and 2.4 m per full run cycle.
 const radPerM=4.45+(2.62-4.45)*rb;
 if(moved>.00015)z.rigPolishPhase=(z.rigPolishPhase||0)+moved*radPerM;
 const p=z.rigPolishPhase||0,s=Math.sin(p),c=Math.cos(p);

 const lUpper=rigBone(z,"L_UpperLeg"),rUpper=rigBone(z,"R_UpperLeg"),
       lLower=rigBone(z,"L_LowerLeg"),rLower=rigBone(z,"R_LowerLeg"),
       lFoot=rigBone(z,"L_Foot"),rFoot=rigBone(z,"R_Foot"),
       lArm=rigBone(z,"L_UpperArm"),rArm=rigBone(z,"R_UpperArm"),
       hips=rigBone(z,"Hips"),spine=rigBone(z,"Spine"),chest=rigBone(z,"Chest"),head=rigBone(z,"Head");

 // v427: the support/special-infected rig is NOT the 180-degree walker
 // holder. Its anatomical knee hinge is the opposite local-X sign. Keeping the
 // walker sign here made these zombies bend like flamingos.
 const thighAmp=.27+(.62-.27)*rb;
 if(lUpper)lUpper.rotation.x=s*thighAmp;
 if(rUpper)rUpper.rotation.x=-s*thighAmp;
 const lf=Math.max(0,Math.sin(p+.68)),rf=Math.max(0,Math.sin(p+Math.PI+.68));
 const lFlex=lf*lf,rFlex=rf*rf;
 const kneeBase=.045+.035*rb,kneeAmp=.34+.46*rb;
 if(lLower)lLower.rotation.x=-(kneeBase+lFlex*kneeAmp);
 if(rLower)rLower.rotation.x=-(kneeBase+rFlex*kneeAmp);
 if(lFoot)lFoot.rotation.x=(kneeBase+lFlex*kneeAmp)*.42-.035*rb;
 if(rFoot)rFoot.rotation.x=(kneeBase+rFlex*kneeAmp)*.42-.035*rb;

 // Two small rises per stride make the hips feel weight-bearing rather than sliding.
 if(hips){
   hips.position.y=(z.rigHipsBaseY||.9)+(0.008+.020*rb)*(1-Math.cos(p*2))*.5;
   hips.rotation.z=s*(.008+.018*rb);
 }
 if(spine){spine.rotation.y+=s*(.018+.028*rb);spine.rotation.z+=c*(.010+.014*rb)}
 if(chest){chest.rotation.y-=s*(.014+.023*rb);chest.rotation.z-=c*(.008+.012*rb)}
 if(head){head.rotation.z+=s*(.008+.012*rb)}

 // The old Sprint clip kept both arms mostly forward. Pump opposite the legs so
 // final-five walkers actually read as running, while preserving Attack/Hit poses.
 if((z.rigTransientT||0)<=0){
   const armBase=.20+.02*rb,armAmp=.09+.35*rb;
   if(lArm)lArm.rotation.x=armBase-s*armAmp;
   if(rArm)rArm.rotation.x=armBase+s*armAmp;
 }
}
function setZombieLocomotion(z,wantsRun){
 if(!z||!z.rigActions)return;
 const naturalRunner=z.kind==="sprinter"||z.kind==="infected"||z.kind==="acidic";
 const desiredName=(wantsRun||naturalRunner)?"Sprint":"Shamble";
 const desired=z.rigActions[desiredName]||z.rigActions.Shamble||z.rigActions.Idle;
 if(!desired||z.rigBase===desired)return;
 const previous=z.rigBase;z.rigBase=desired;
 // Attack/flinch clips own the skeleton briefly. Updating rigBase here makes the
 // correct locomotion resume as soon as the transient animation finishes.
 if(z.rigTransientT>0)return;
 if(previous)previous.fadeOut(.18);
 desired.reset();desired.enabled=true;desired.setLoop(THREE.LoopRepeat,Infinity);desired.fadeIn(.18).play();
}
function releaseZombieVisual(z){
 if(!z)return;
 // v432: do not uncache the animation root while tearing down a live zombie.
 // Three.js can hit an invalid internal action/binding cache entry and throw
 // "Cannot set properties of undefined (setting '_cacheIndex')", freezing the
 // game during leg-loss crawler replacement. Stop actions and drop references;
 // the removed mixer/root can then be garbage-collected safely.
 if(z.radiatedGreenMixer){try{z.radiatedGreenMixer.stopAllAction()}catch(_){}}
 if(z.mixer){try{z.mixer.stopAllAction()}catch(_){}}
 z.radiatedGreenMixer=null;z.mixer=null;z.rigActions=null;z.rigBase=null;z.rigTransient=null;
 if(z.rigMaterials){for(const m of z.rigMaterials){try{m.dispose()}catch(_){}}z.rigMaterials.length=0}
 if(z.ownedGeometries){for(const geo of z.ownedGeometries){try{geo.dispose()}catch(_){}}z.ownedGeometries.length=0}
 if(z.ownedMaterials){for(const m of z.ownedMaterials){try{m.dispose()}catch(_){}}z.ownedMaterials.length=0}
 if(z.g&&z.g.parent)scene.remove(z.g)
}

// v143: introduce special infected gradually instead of jumping from 0% on wave 1
// straight to 42% on wave 2. Each new threat gets a wave to become readable before
// the full mixed roster settles back near the old late-wave intensity.
function rolledZombieKind(w,roll){
 if(w<2)return "shambler";
 if(w===2)return roll<.18?"sprinter":"shambler";
 if(w===3){
   if(roll<.08)return "crawler";
   if(roll<.24)return "sprinter";
   return "shambler";
 }
 if(w===4){
   if(roll<.05)return "radiated";
   if(roll<.13)return "crawler";
   if(roll<.30)return "sprinter";
   return "shambler";
 }
 if(w===5){
   if(roll<.05)return "infected";
   if(roll<.10)return "radiated";
   if(roll<.19)return "crawler";
   if(roll<.35)return "sprinter";
   return "shambler";
 }
 // Wave 6 introduces acidic zombies at 38% total specials. Sprinters then gain
 // 1.5 percentage points per wave until the total settles around 43%.
 const sprinterChance=Math.min(.19,.14+Math.max(0,w-6)*.015);
 if(roll<.04)return "acidic";
 if(roll<.09)return "infected";
 if(roll<.15)return "radiated";
 if(roll<.24)return "crawler";
 if(roll<.24+sprinterChance)return "sprinter";
 return "shambler";
}

const PLAYER_WORLD_SCALE=1.20;
const ZOMBIE_WORLD_SCALE=1.15;

function makeZombie(x,z,i,forcedKind=null,bossSpec=null){
 let d=diff(wave),g=new THREE.Group(),scale=(.90+rnd()*.045)*ZOMBIE_WORLD_SCALE;
 let roll=rnd(),kind=forcedKind||rolledZombieKind(wave,roll);

 const nightmareType = kind==="crawler"?"crawler":(kind==="boss"?"brute":((kind==="sprinter"||kind==="infected"||kind==="acidic")?"twitch":"normal"));
 const bodyType=i%3, outfit=i%4;
 g.scale.set(scale,scale*(.99+rnd()*.018),scale);

 const skinBase=[0x8c8b79,0x7d796d,0x92896f,0x747d73][i%4],
       skin=zombieTex(skinBase,0),
       shirt=zombieTex([0x4d5848,0x5a5146,0x34495a,0x68655e,0x59413e][i%5],1),
       plaid=zombieTex([0x643b35,0x30494b,0x5d5233][i%3],1),
       work=zombieTex([0x46525a,0x786b31,0x554338][i%3],1),
       hoodie=zombieTex([0x3b4144,0x4d4b47,0x36474b][i%3],1),
       pants=zombieTex([0x26292d,0x373330,0x2c373d][i%3],2),
       wound=ZM(0x98211f,.88),
       dark=ZM(0x17191a,.92),
       bone=ZM(0xd6ceba,.78),
       shoe=ZM(0x1c1e20,.96),
       eyeCol=kind==="radiated"?0x52ff62:kind==="infected"||kind==="acidic"?0xff3e3e:kind==="boss"?0xf4f7ff:0xffe34e,
       eyeMat=new THREE.MeshBasicMaterial({color:eyeCol});

 const shoulderOffset=(bodyType===0?.235:bodyType===2?.265:.25),
       hipOffset=(bodyType===0?.105:bodyType===2?.122:.113),
       hunchBias=kind==="sprinter"||kind==="infected"||kind==="acidic"?.13+rnd()*.035:kind==="boss"?.07:.095+rnd()*.035,
       shoulderDrop=(rnd()-.5)*.045,
       armDrop=.025+rnd()*.045,
       headLean=(rnd()-.5)*.055,
       limpSide=rnd()>.5?1:-1;

 // Intentionally visible low-poly construction: torso / pelvis / joints read like a carved mannequin.
 let torso=taperedPrism(bodyType===0?.33:bodyType===2?.39:.36,bodyType===0?.245:bodyType===2?.295:.27,.57,.205,.165,shirt,0,1.34,-.025,g);
 let pelvis=taperedPrism(bodyType===0?.255:bodyType===2?.30:.275,bodyType===0?.23:bodyType===2?.265:.245,.205,.18,.16,pants,0,.91,0,g);
 let chest=torso,stomach=null;

 let outerCloth=shirt,jacket=null,hood=null,vestPanel=null;
 if(outfit===1)outerCloth=plaid;
 if(outfit===2)outerCloth=work;
 if(outfit===3)outerCloth=hoodie;

 // Clothing has visible thickness instead of being painted skin.
 if(outfit!==0){
   jacket=taperedPrism(bodyType===0?.345:bodyType===2?.405:.375,bodyType===0?.265:bodyType===2?.315:.29,.51,.218,.178,outerCloth,0,1.36,-.030,g);
   if(outfit===3){ // hood / collar
     hood=box(.25,.10,.19,outerCloth,0,1.66,.015,g);hood.rotation.x=-.08;
   }
 }
 if(outfit===2){ // simple work vest panel
   vestPanel=box(.18,.34,.018,ZM(0x8f7a32,.72),0,1.39,-.128,g);
 }

 // Head: six broad planes, narrower jaw, cheek planes. Much less "box head".
 let neck=new THREE.Mesh(new THREE.CylinderGeometry(.060,.072,.16,8),skin);neck.position.set(0,1.70,-.035);neck.rotation.x=-.08;g.add(neck);
 let head=new THREE.Mesh(new THREE.CylinderGeometry(.142,.122,.29,8,1,false),skin);
 head.position.set(0,1.83,-.070);head.scale.set(.96,1.0,.82);head.rotation.y=Math.PI/6;head.rotation.x=-.05;head.userData.isHead=true;g.add(head);
 // Invisible headshot volume covers the full visible skull/face instead of only
 // the narrow low-poly head mesh. It remains attached to the head animation.
 const headHitbox=new THREE.Mesh(new THREE.SphereGeometry(.185,10,8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false}));
 headHitbox.position.set(0,.005,-.005);headHitbox.scale.set(1.0,1.08,.92);
 headHitbox.userData.isHead=true;headHitbox.userData.part="head";headHitbox.castShadow=false;headHitbox.receiveShadow=false;head.add(headHitbox);
 let forehead=box(.17,.075,.035,skin,0,.075,-.102,head);forehead.rotation.x=-.03;
 let jaw=taperedPrism(.132,.108,.082,.102,.087,skin,0,-.135,-.025,head);jaw.rotation.x=.045;
 let cheekL=box(.068,.09,.035,skin,-.092,-.015,-.092,head);cheekL.rotation.z=-.10;
 let cheekR=box(.068,.09,.035,skin,.092,-.015,-.092,head);cheekR.rotation.z=.10;
 let browL=box(.055,.013,.008,dark,-.046,.048,-.120,head);browL.rotation.z=-.06;
 let browR=box(.055,.013,.008,dark,.046,.048,-.120,head);browR.rotation.z=.06;

 for(const ex of [-.055,.055]){
   let socket=new THREE.Mesh(new THREE.SphereGeometry(.034,9,6),dark);
   socket.scale.set(1.08,.68,.42);socket.position.set(ex,.018,-.126);head.add(socket);
   let eye=new THREE.Mesh(new THREE.SphereGeometry(.023,8,6),eyeMat);
   eye.position.set(ex,.018,-.145);head.add(eye);
 }
 // Eye glow stays in the eye/emissive material; avoid a dynamic PointLight on every zombie.
 let nose=taperedPrism(.030,.018,.055,.024,.016,skin,0,-.010,-.126,head);nose.rotation.x=Math.PI/2;
 let mouth=box(.075,.012,.008,kind==="acidic"?ZM(0xaa1616,.75):ZM(0x361718,.9),0,-.112,-.128,head);
 let hair=null;
 if(i%3!==0){hair=box(.19,.040,.135,ZM(i%2?0x221d19:0x30271f,.94),0,.145,-.005,head);hair.rotation.x=-.02}

 // Damage is graphic and large enough to read from across the street.
 let faceWound=null,skullPatch=null;
 if(i%2===0){faceWound=box(.065,.075,.011,wound,-.085,-.025,-.130,head);faceWound.rotation.z=.20}
 if(i%4===1){skullPatch=box(.060,.038,.009,bone,.070,.080,-.126,head);skullPatch.rotation.z=-.12}

 // Chunky shoulders, faceted limbs, visible elbow joints.
 const sleeveMat=outfit===0?shirt:outerCloth;
 let shoulderL=new THREE.Mesh(new THREE.BoxGeometry(.145,.125,.115),sleeveMat);shoulderL.position.set(-shoulderOffset,1.55,-.040);shoulderL.rotation.z=-.16;shoulderL.rotation.x=.08;g.add(shoulderL);
 let shoulderR=shoulderL.clone();shoulderR.position.x=shoulderOffset;shoulderR.rotation.z=.16;g.add(shoulderR);

 let armL=new THREE.Group(),armR=new THREE.Group();
 armL.position.set(-shoulderOffset,1.50,-.045);armR.position.set(shoulderOffset,1.50,-.045);g.add(armL);g.add(armR);

 let upperArmL=new THREE.Mesh(new THREE.CylinderGeometry(.058,.050,.31,6),outfit===0?skin:sleeveMat);upperArmL.position.y=-.155;armL.add(upperArmL);
 let upperArmR=upperArmL.clone();armR.add(upperArmR);

 let elbowL=new THREE.Group(),elbowR=new THREE.Group();elbowL.position.set(0,-.315,-.010);elbowR.position.set(0,-.315,-.010);armL.add(elbowL);armR.add(elbowR);
 let elbowJointL=new THREE.Mesh(new THREE.BoxGeometry(.095,.080,.085),skin);elbowL.add(elbowJointL);let elbowJointR=elbowJointL.clone();elbowR.add(elbowJointR);
 let foreArmL=new THREE.Mesh(new THREE.CylinderGeometry(.050,.040,.30,6),skin);foreArmL.position.set(0,-.15,-.025);foreArmL.rotation.x=.08;elbowL.add(foreArmL);
 let foreArmR=foreArmL.clone();elbowR.add(foreArmR);
 let handL=new THREE.Mesh(new THREE.BoxGeometry(.078,.105,.095),skin);handL.position.set(0,-.315,-.060);handL.rotation.x=.12;elbowL.add(handL);
 let handR=handL.clone();elbowR.add(handR);

 // Broad bloody patch / contamination patch on a whole limb rather than a tiny cut.
 const patchMat=kind==="radiated"?new THREE.MeshBasicMaterial({color:0x46ff59}):kind==="acidic"?new THREE.MeshBasicMaterial({color:0xc51c1c}):wound;
 if(i%2===0){let p=box(.065,.17,.014,patchMat,0,-.16,-.058,foreArmL);p.rotation.x=.1;p.rotation.z=.12}
 else{let p=box(.065,.17,.014,patchMat,0,-.16,-.058,foreArmR);p.rotation.x=.1;p.rotation.z=-.12}

 // Long human legs with explicit knee blocks.
 let legL=new THREE.Group(),legR=new THREE.Group();legL.position.set(-hipOffset,.80,0);legR.position.set(hipOffset,.80,0);g.add(legL);g.add(legR);
 let thighL=new THREE.Mesh(new THREE.CylinderGeometry(.082,.072,.38,6),pants);thighL.position.y=-.19;legL.add(thighL);let thighR=thighL.clone();legR.add(thighR);
 let kneeL=new THREE.Group(),kneeR=new THREE.Group();kneeL.position.set(0,-.38,0);kneeR.position.set(0,-.38,0);legL.add(kneeL);legR.add(kneeR);
 let kneeJointL=new THREE.Mesh(new THREE.BoxGeometry(.10,.085,.085),pants);kneeL.add(kneeJointL);let kneeJointR=kneeJointL.clone();kneeR.add(kneeJointR);
 let calfL=new THREE.Mesh(new THREE.CylinderGeometry(.066,.054,.34,6),pants);calfL.position.set(0,-.17,-.010);kneeL.add(calfL);let calfR=calfL.clone();kneeR.add(calfR);
 let footL=new THREE.Mesh(new THREE.BoxGeometry(.115,.060,.235),shoe);footL.position.set(0,-.36,-.060);kneeL.add(footL);let footR=footL.clone();kneeR.add(footR);

 // Torso damage / glowing contamination.
 let torsoPatch=kind==="radiated"?new THREE.MeshBasicMaterial({color:0x4cff65}):kind==="acidic"?new THREE.MeshBasicMaterial({color:0xbf1717}):wound;
 let gash=null,chestPatch=null;
 if(i%2===1){gash=box(.085,.135,.012,torsoPatch,-.065,1.39,-.132,g);gash.rotation.z=.16}
 if(i%4===0){chestPatch=box(.095,.13,.012,torsoPatch,.075,1.48,-.134,g);chestPatch.rotation.z=-.12}

 let hazardMist=null;
 if(kind==="radiated"||kind==="acidic"){
   const mc=kind==="radiated"?0x38ff59:0xb81616;
   hazardMist=new THREE.Mesh(new THREE.SphereGeometry(.38,8,6),new THREE.MeshBasicMaterial({color:mc,transparent:true,opacity:kind==="radiated"?.09:.13,depthWrite:false}));
   hazardMist.scale.set(1.0,1.55,1.0);hazardMist.position.y=1.02;g.add(hazardMist);
 }
 const ownedMaterials=[eyeMat];
 if(patchMat!==wound)ownedMaterials.push(patchMat);
 if(torsoPatch!==wound&&torsoPatch!==patchMat)ownedMaterials.push(torsoPatch);
 if(hazardMist&&hazardMist.material)ownedMaterials.push(hazardMist.material);

 let marker=null;
 let safe=pushOutsideBuilding(x,z,.50);g.position.set(safe.x,0,safe.z);scene.add(g);

 const baseArmLX=.22+rnd()*.045,baseArmRX=.20+rnd()*.045,
       gait=kind==="sprinter"||kind==="infected"||kind==="acidic"?.95+rnd()*.10:kind==="boss"?.72+rnd()*.07:.84+rnd()*.10,
       bob=.002+rnd()*.002,
       limp=rnd()*.34,dragSide=limpSide,
       turnRate=kind==="sprinter"||kind==="infected"||kind==="acidic"?2.45+rnd()*.60:kind==="boss"?1.45+rnd()*.20:2.05+rnd()*.48,
       pauseClock=.35+rnd()*1.2,attackAnim=0,attackSide=rnd()>.5?1:-1,feral=.92+rnd()*.14,twitch=.18+rnd()*.40,snapBias=(rnd()-.5)*.025,snapRate=.96+rnd()*.45;

 let hp=d.hp,speed=d.speed*(.94+rnd()*.07),damage=d.damage,attack=d.attack,strafe=d.strafe*.24,surge=d.surge;
 if(kind==="sprinter"){speed*=1.36;attack*=.84;damage=Math.round(damage*1.05);strafe*=1.15;surge+=.10}
 if(kind==="radiated"){speed*=1.15;damage=Math.round(damage*1.15);hp=Math.ceil(hp*1.15)}
 if(kind==="infected"){speed*=1.27;damage=Math.round(damage*1.20);hp=Math.ceil(hp*1.18);attack*=.90}
 if(kind==="acidic"){speed*=1.19;damage=Math.round(damage*1.28);hp=Math.ceil(hp*1.28);attack*=.92}
 if(kind==="crawler"){speed*=.82;damage=Math.round(damage*.95);hp=Math.ceil(hp*.95)}
 if(kind==="boss"){const spec=bossSpec||bossWaveSpec(wave);speed=spec.speed;damage=spec.damage;hp=spec.hp;attack=spec.attack;strafe*=.10;surge=Math.min(.98,surge+.10);g.scale.multiplyScalar(1.58)}

 let zz={g,head,torso,armL,armR,legL,legR,chest,stomach,pelvis,neck,jaw,marker,mouth,shoulderL,shoulderR,elbowL,elbowR,kneeL,kneeR,jacket,hazardMist,ownedMaterials,ownedGeometries:null,
   baseArmLX,baseArmRX,headLean,gait,bob,limp,dragSide,hunch:hunchBias,turnRate,lurch:kind==="sprinter"||kind==="infected"||kind==="acidic"?1.10:kind==="boss"?.76:.92,
   shoulderDrop,pauseClock,attackAnim,attackSide,feral,twitch,snapBias,snapRate,nightmareType,armDrop,kind,groundY:0,
   hp,maxHP:hp,dead:false,speed,attack,damage,strafe,surge,bossName:kind==="boss"?(bossSpec?.name||bossWaveName||"BOSS"):"",bossBounty:kind==="boss"?(bossSpec?.bounty||250):0,bossSpecialCd:kind==="boss"?(bossSpec?.specialCd||7.5):0,bossAttackState:"",bossAttackT:0,bossChargeHit:false,
   cool:0,groan:1+rnd()*3,step:.2+rnd()*.38,phase:rnd()*6.28,zig:rnd()>.5?1:-1,surgeT:.5+rnd()*2,stagger:0,staggerDir:1,
   leftArmHP:2,rightArmHP:2,leftLegHP:2.5,rightLegHP:2.5,legDamage:0,leftArmDetached:false,rightArmDetached:false,leftLegDetached:false,rightLegDetached:false,ragdoll:null,knockdown:null,falling:false,corpseAge:0,fallDir:rnd()>.5?1:-1,fallAxis:rnd()>.55?"z":"x",fallSpeed:3.2+rnd()*2.1,
   role:(()=>{let r=rnd();if(kind==="boss")return "charger";if(kind==="sprinter"||kind==="infected"||kind==="acidic")return r<.58?"charger":"interceptor";if(kind==="crawler")return "charger";if(kind==="radiated")return r<.62?"charger":"flanker";if(wave<2)return "charger";return r<.58?"charger":r<.82?"flanker":"stalker"})(),
   side:i%2?1:-1,think:rnd()*.05,targetX:px,targetZ:pz,bravery:.75+rnd()*.5,groupOffset:(rnd()-.5)*5,
   avoidSide:i%2?1:-1,avoidT:0,stuckT:0,lastNavX:safe.x,lastNavZ:safe.z,navFlipCooldown:0,
   navPath:null,navIndex:0,navCheckT:rnd()*.45,navGoalX:px,navGoalZ:pz,navForceRepath:false,
   strideScale:kind==="sprinter"||kind==="infected"||kind==="acidic"?1.18:kind==="boss"?.88:1.0};

 if(kind==="crawler"){
   // v111 crawler geometry pass: keep the low crawling silhouette, but replace the
   // chunky mannequin pieces with rounder, higher-segment anatomy.
   kneeL.visible=false;kneeR.visible=false;

   // Human torso / pelvis instead of the old barrel-like crawler body.
   try{torso.geometry.dispose()}catch(_){}
   torso.geometry=new THREE.SphereGeometry(.225,13,9);
   torso.scale.set(1.08,.94,.96);
   torso.position.set(0,.69,-.14);
   torso.rotation.x=-.31;

   try{pelvis.geometry.dispose()}catch(_){}
   pelvis.geometry=new THREE.SphereGeometry(.165,11,8);
   pelvis.scale.set(1.08,.60,1.02);
   pelvis.position.set(0,.39,.05);
   pelvis.rotation.x=-.24;

   // A rounded shoulder/back mass removes the flat rectangular upper-body silhouette.
   const crawlerBack=new THREE.Mesh(
     new THREE.SphereGeometry(.255,12,8),
     outfit===0?shirt:outerCloth
   );
   crawlerBack.scale.set(1.08,.54,.88);
   crawlerBack.position.set(0,.80,-.12);
   crawlerBack.rotation.x=-.27;
   g.add(crawlerBack);

   // Humanized crawler skull and face: eyes sit in rounded sockets, with visible
   // cheekbones, nose, brows, jaw, chin and ears rather than mannequin blocks.
   try{head.geometry.dispose()}catch(_){}
   head.geometry=new THREE.SphereGeometry(.154,14,10);
   head.position.set(0,1.08,-.235);
   head.scale.set(.98,1.02,.90);
   head.rotation.set(-.20,0,0);
   forehead.visible=false;

   for(const c of [cheekL,cheekR]){try{c.geometry.dispose()}catch(_){ }c.geometry=new THREE.SphereGeometry(.050,10,7);c.visible=true}
   cheekL.scale.set(.92,.72,.46);cheekR.scale.set(.92,.72,.46);
   cheekL.position.set(-.086,-.030,-.108);cheekR.position.set(.086,-.030,-.108);

   for(const b of [browL,browR]){try{b.geometry.dispose()}catch(_){ }b.geometry=new THREE.SphereGeometry(.040,9,6);b.visible=true}
   browL.scale.set(1.02,.20,.28);browR.scale.set(1.02,.20,.28);
   browL.position.set(-.052,.054,-.132);browR.position.set(.052,.054,-.132);

   try{jaw.geometry.dispose()}catch(_){}
   jaw.geometry=new THREE.SphereGeometry(.112,12,8);jaw.scale.set(.88,.58,.76);jaw.position.set(0,-.116,-.020);

   try{nose.geometry.dispose()}catch(_){}
   nose.geometry=new THREE.SphereGeometry(.040,10,7);nose.scale.set(.56,1.05,.68);nose.position.set(0,-.008,-.142);nose.rotation.set(0,0,0);

   try{mouth.geometry.dispose()}catch(_){}
   // The old sphere read like an apple/ball in the crawler's mouth. Keep the
   // cavity flat and dark; blood is layered over it separately below.
   mouth.geometry=new THREE.BoxGeometry(.094,.024,.014);mouth.material=dark;
   mouth.scale.set(1,1,1);mouth.position.set(0,-.100,-.151);mouth.rotation.set(.03,0,0);

   const earGeoL=new THREE.SphereGeometry(.045,9,6),earGeoR=new THREE.SphereGeometry(.045,9,6);
   const earL=new THREE.Mesh(earGeoL,skin),earR=new THREE.Mesh(earGeoR,skin);
   earL.scale.set(.55,1,.38);earR.scale.copy(earL.scale);
   earL.position.set(-.151,.002,-.020);earR.position.set(.151,.002,-.020);head.add(earL);head.add(earR);

   const chin=new THREE.Mesh(new THREE.SphereGeometry(.040,9,6),skin);
   chin.scale.set(.90,.60,.72);chin.position.set(0,-.148,-.060);head.add(chin);

   if(hair)hair.visible=false;
   if(hood)hood.visible=false;
   if(vestPanel)vestPanel.visible=false;

   // Re-shape the old wound meshes to the crawler's actual rounded body.
   if(faceWound){
     try{faceWound.geometry.dispose()}catch(_){}
     faceWound.geometry=new THREE.SphereGeometry(.052,10,7);
     faceWound.material=wound;faceWound.visible=true;
     faceWound.scale.set(.82,1.05,.20);faceWound.position.set(i%2?-.088:.088,-.040,-.139);faceWound.rotation.z=i%2?.22:-.22;
   }
   if(skullPatch){
     try{skullPatch.geometry.dispose()}catch(_){}
     skullPatch.geometry=new THREE.SphereGeometry(.042,9,6);
     skullPatch.visible=true;skullPatch.scale.set(.90,.64,.18);skullPatch.position.set(i%2?.075:-.075,.084,-.126);
   }
   if(gash){
     try{gash.geometry.dispose()}catch(_){}
     gash.geometry=new THREE.SphereGeometry(.076,10,7);
     gash.material=wound;gash.visible=true;gash.scale.set(.92,1.35,.22);
     gash.position.set(i%2?-.085:.085,.82,-.260);gash.rotation.set(-.20,0,i%2?.18:-.18);
   }
   if(chestPatch){
     try{chestPatch.geometry.dispose()}catch(_){}
     chestPatch.geometry=new THREE.SphereGeometry(.067,10,7);
     chestPatch.material=wound;chestPatch.visible=true;chestPatch.scale.set(1.18,.70,.22);
     chestPatch.position.set(i%2?.090:-.090,.94,-.245);chestPatch.rotation.set(-.18,0,i%2?-.14:.14);
   }

   // Blood now hangs from and smears around the dark mouth instead of replacing it.
   const crawlerMouthGore=new THREE.Mesh(CRAWLER_MOUTH_GORE_GEO,wound);
   crawlerMouthGore.name="CrawlerMouthBlood";crawlerMouthGore.userData.visualOnly=true;
   crawlerMouthGore.userData.sharedGeometry=true;crawlerMouthGore.raycast=()=>{};
   crawlerMouthGore.castShadow=false;crawlerMouthGore.receiveShadow=false;head.add(crawlerMouthGore);

   // One shared body-gore mesh covers the chest plus lower drag wound.
   const crawlerBodyGore=new THREE.Mesh(CRAWLER_BODY_GORE_GEO,wound);
   crawlerBodyGore.name="CrawlerBodyBlood";crawlerBodyGore.userData.visualOnly=true;
   crawlerBodyGore.userData.sharedGeometry=true;crawlerBodyGore.raycast=()=>{};
   crawlerBodyGore.castShadow=false;crawlerBodyGore.receiveShadow=false;g.add(crawlerBodyGore);

   // The generic zombie setup already bloodies one forearm. Add the same cheap
   // shared smear to the opposite forearm so crawlers read as arm-dragging bodies.
   const crawlerCleanForearm=i%2===0?foreArmR:foreArmL;
   const crawlerArmGore=new THREE.Mesh(CRAWLER_FOREARM_GORE_GEO,wound);
   crawlerArmGore.name="CrawlerForearmBlood";crawlerArmGore.userData.visualOnly=true;
   crawlerArmGore.userData.sharedGeometry=true;crawlerArmGore.raycast=()=>{};
   crawlerArmGore.castShadow=false;crawlerArmGore.receiveShadow=false;crawlerCleanForearm.add(crawlerArmGore);

   // Round neck / shoulders / elbows / hands, with the neck actually meeting the skull.
   try{neck.geometry.dispose()}catch(_){}
   neck.geometry=new THREE.CylinderGeometry(.058,.072,.18,10);
   neck.position.set(0,.93,-.195);neck.rotation.x=-.43;

   for(const s of [shoulderL,shoulderR]){
     try{s.geometry.dispose()}catch(_){}
     s.geometry=new THREE.SphereGeometry(.082,10,7);
     s.scale.set(1.05,.92,.95);
   }
   shoulderL.position.set(-shoulderOffset,.84,-.15);
   shoulderR.position.set( shoulderOffset,.84,-.15);
   const crawlerClavicle=new THREE.Mesh(new THREE.SphereGeometry(.205,11,7),outfit===0?shirt:outerCloth);
   crawlerClavicle.scale.set(1.25,.26,.70);crawlerClavicle.position.set(0,.835,-.135);crawlerClavicle.rotation.x=-.26;g.add(crawlerClavicle);

   for(const a of [upperArmL,upperArmR]){
     try{a.geometry.dispose()}catch(_){}
     a.geometry=new THREE.CylinderGeometry(.062,.047,.34,10,2,false);
   }
   for(const e of [elbowJointL,elbowJointR]){
     try{e.geometry.dispose()}catch(_){}
     e.geometry=new THREE.SphereGeometry(.055,9,6);
     e.scale.set(1.0,.86,.92);
   }
   for(const a of [foreArmL,foreArmR]){
     try{a.geometry.dispose()}catch(_){}
     a.geometry=new THREE.CylinderGeometry(.052,.037,.32,10,2,false);
   }
   for(const h of [handL,handR]){
     try{h.geometry.dispose()}catch(_){}
     h.geometry=new THREE.SphereGeometry(.054,9,6);
     h.scale.set(.88,1.16,.92);
   }

   // Upper legs stay tucked under the body, but are smoother and more organic.
   for(const t of [thighL,thighR]){
     try{t.geometry.dispose()}catch(_){}
     t.geometry=new THREE.CylinderGeometry(.080,.062,.36,9,2,false);
   }

   // Hide the stiff outer jacket shell on crawlers and replace it with a rounded cloth mass.
   if(jacket){
     jacket.visible=false;
     const crawlerCloth=new THREE.Mesh(new THREE.SphereGeometry(.265,11,7),outerCloth);
     crawlerCloth.scale.set(1.05,.52,.88);
     crawlerCloth.position.set(0,.79,-.12);
     crawlerCloth.rotation.x=-.27;
     g.add(crawlerCloth);
   }

   // Re-pose into a visibly lower crawl: chest and hips ride closer to the
   // pavement while the forearms carry more of the crawler's weight.
   legL.position.set(-hipOffset,.39,.14);legR.position.set(hipOffset,.39,.14);
   legL.rotation.x=-1.24;legR.rotation.x=-1.15;
   armL.position.set(-shoulderOffset,.83,-.15);armR.position.set(shoulderOffset,.83,-.15);
   armL.rotation.x=.98;armR.rotation.x=.98;
   armL.rotation.z=-.20;armR.rotation.z=.20;
   elbowL.rotation.x=.58;elbowR.rotation.x=.58;

   g.rotation.x=-.14;
 }

 const ownedGeometrySet=new Set();
 g.traverse(o=>{if(o.isMesh&&o.geometry&&!o.userData.sharedGeometry)ownedGeometrySet.add(o.geometry)});
 zz.ownedGeometries=[...ownedGeometrySet];
 attachRiggedZombie(zz,g,kind,i,hazardMist);
 if(kind==="radiated")attachRadiatedGreenGuy(zz,g);
 if(kind==="shambler")attachBasicWalkerVisual(zz,g);
 if(kind==="boss"&&zz.rigVisual){
   zz.rigVisual.scale.multiplyScalar(1.10);
   const chestBone=zz.rigVisual.getObjectByName("Chest");if(chestBone)chestBone.scale.set(1.30,1.08,1.22);
   for(const nm of ["L_UpperArm","R_UpperArm"]){const b=zz.rigVisual.getObjectByName(nm);if(b)b.scale.set(1.26,1.12,1.26)}
   for(const nm of ["L_UpperLeg","R_UpperLeg"]){const b=zz.rigVisual.getObjectByName(nm);if(b)b.scale.set(1.14,1.08,1.14)}
   zz.rigVisual.traverse(o=>{if(!o.isMesh)return;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){const nm=(m.name||"").toLowerCase();if(nm.includes("wound"))m.color.setHex(0x780909);if(nm.includes("skin"))m.color.lerp(new THREE.Color(0x692724),.28);if(nm.includes("shirt"))m.color.lerp(new THREE.Color(0x3b1010),.42);m.needsUpdate=true}});

   // Dedicated boss chest collision matching the enlarged visible model.
   const bossHitMat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false});
   const bossChestHitbox=new THREE.Mesh(new THREE.BoxGeometry(.72,.78,.48),bossHitMat);
   bossChestHitbox.position.set(0,1.43,-.035);bossChestHitbox.userData.part="torso";bossChestHitbox.name="BossChestHitbox";g.add(bossChestHitbox);
   zz.bossChestHitbox=bossChestHitbox;zz.ownedGeometries.push(bossChestHitbox.geometry);zz.ownedMaterials.push(bossHitMat);

   const goreGlow=new THREE.PointLight(0x8f1010,.7,4.5,2);goreGlow.position.set(0,1.55,.15);g.add(goreGlow);
 }

 // Everything visibly attached to the skull (face, jaw, ears, wounds, eyes, hair)
 // counts as head. The neck is a sibling of head, so it remains outside the headshot volume.
 head.traverse(o=>{if(o.isMesh){o.userData.part="head";o.userData.isHead=true}});
 torso.userData.part="torso";pelvis.userData.part="torso";
 armL.traverse(o=>{if(o.isMesh)o.userData.part="leftArm"});armR.traverse(o=>{if(o.isMesh)o.userData.part="rightArm"});
 legL.traverse(o=>{if(o.isMesh)o.userData.part="leftLeg"});legR.traverse(o=>{if(o.isMesh)o.userData.part="rightLeg"});
 const hitMeshes=[];
 g.traverse(o=>{
   if(!o.isMesh)return;
   if(o.userData.visualOnly){o.castShadow=false;o.receiveShadow=false;return}
   o.userData.zombie=zz;if(!o.userData.part)o.userData.part="body";
   const major=(o===torso||o===head||o===pelvis);o.castShadow=major;o.receiveShadow=major;
   hitMeshes.push(o)
 });
 zz.hitMeshes=hitMeshes;
 if(kind==="radiated")buildRadiatedGreenHitboxes(zz);
 if(kind==="shambler")buildBasicWalkerHitboxes(zz);
 zombies.push(zz);if(kind==="boss")currentBoss=zz
}

function medkit(x,z){let g=new THREE.Group();box(1,.38,.72,M(0xe7e4da),0,.35,0,g);box(.18,.05,.5,M(0xa52c2c),0,.56,0,g);box(.5,.05,.18,M(0xa52c2c),0,.56,0,g);g.position.set(x,0,z);scene.add(g);kits.push({g,used:false})}medkit(-10,8);medkit(16,56);medkit(-17,91);

// -------------------- ZOMBIE DROPS --------------------
// Each zombie has a 52% chance to leave one physical pickup.
// v148 removes health pickups completely. The old 50:30 ammo-to-money ratio is
// preserved proportionally, so successful drops are now 62.5% ammo / 37.5% cash.
const DROP_CHANCE=.52, DROP_LIFETIME=15, DROP_PICKUP_RADIUS=1.45, MAX_ACTIVE_DROPS=32, DROP_BASE_Y=.16;
const dropGeo={
 ammo:new THREE.BoxGeometry(.56,.28,.38),
 money:new THREE.BoxGeometry(.50,.16,.32)
};
const dropMat={
 ammo:new THREE.MeshStandardMaterial({color:0x786b42,emissive:0x3d2b0d,emissiveIntensity:.30,roughness:.72,metalness:.03}),
 money:new THREE.MeshStandardMaterial({color:0x477b48,emissive:0x173f1b,emissiveIntensity:.30,roughness:.78})
};
function weightedTier(r,tiers){
 let total=0;for(const t of tiers)total+=t[1];
 let x=r*total;
 for(const t of tiers){x-=t[1];if(x<=0)return t[0]}
 return tiers[tiers.length-1][0]
}
function randomDropAmount(type){
 if(type==="ammo")return weightedTier(rnd(),[[5,35],[10,30],[15,22],[20,13]]);
 return weightedTier(rnd(),[[5,40],[10,30],[15,20],[25,10]]);
}
function randomAmmoWeapon(){
 // Grenade-launcher pickups are only eligible while the player has room under
 // the hard 10-round total cap. This prevents unusable launcher drops from
 // being selected while full, and makes them eligible again after any round is fired.
 const pool=Object.keys(unlocked).filter(w=>unlocked[w]&&w!=="pistol"&&(w!=="grenadeLauncher"||launcherAmmoTotal()<10));
 return pool.length?pool[Math.floor(rnd()*pool.length)]:null;
}
const dropLabelCache=new Map();
function makeDropLabel(text,color=0xffffff){
 const key=text+"|"+color;let mat=dropLabelCache.get(key);if(mat){const sp=new THREE.Sprite(mat);sp.scale.set(1.65,.52,1);sp.renderOrder=900;return sp}
 const cv=document.createElement("canvas");cv.width=256;cv.height=80;const c=cv.getContext("2d");
 c.clearRect(0,0,256,80);c.font="900 27px Arial";c.textAlign="center";c.textBaseline="middle";
 c.strokeStyle="rgba(0,0,0,.92)";c.lineWidth=8;c.strokeText(text,128,40);
 c.fillStyle="#"+color.toString(16).padStart(6,"0");c.fillText(text,128,40);
 const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;
 mat=new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:false,depthWrite:false});dropLabelCache.set(key,mat);
 const sp=new THREE.Sprite(mat);
 sp.scale.set(1.65,.52,1);sp.renderOrder=900;return sp
}
function spawnZombieDrop(pos){
 if(rnd()>DROP_CHANCE)return;
 if(drops.length>=MAX_ACTIVE_DROPS){
   const old=drops.shift();if(old&&old.g.parent)scene.remove(old.g);
 }
 let type=rnd()<.625?"ammo":"money";let amount=randomDropAmount(type);if(type==="ammo"&&!randomAmmoWeapon())type="money";
 const g=new THREE.Group(),body=new THREE.Mesh(dropGeo[type],dropMat[type]);
 body.castShadow=true;body.receiveShadow=true;body.position.y=.24;g.add(body);

 let labelText="",labelColor=0xffffff,ammoWeapon=null;
 if(type==="ammo"){
   ammoWeapon=randomAmmoWeapon();
   if(!ammoWeapon){type="money";amount=randomDropAmount("money");labelText="$"+amount;labelColor=0x76e27e}
   else if(ammoWeapon==="grenadeLauncher")amount=weightedTier(rnd(),[[1,55],[2,32],[3,13]]);
   if(type==="ammo"){
   labelText=weaponDefs[ammoWeapon].name+" +"+amount;
   labelColor=0xf0c467;
   // visible brass rounds on the ammo box
   for(let k=-1;k<=1;k++){
     const round=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.23,7),M(0xc29742,.38));
     round.rotation.z=Math.PI/2;round.position.set(k*.13,.43,0);g.add(round);
   }
   }
 }else{
   labelText="$"+amount;labelColor=0x76e27e;
   box(.36,.025,.22,M(0xc9d8b1,.72),0,.34,0,g);
   box(.05,.035,.25,M(0x294e2e,.78),0,.355,0,g);
 }

 const label=makeDropLabel(labelText,labelColor);label.position.set(0,1.03,0);g.add(label);

 // scatter slightly from corpse so multiple drops/corpses don't overlap perfectly
 g.position.set(pos.x+(rnd()-.5)*.65,DROP_BASE_Y,pos.z+(rnd()-.5)*.65);
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});scene.add(g);
 drops.push({g,type,amount,weapon:ammoWeapon,life:DROP_LIFETIME,phase:rnd()*Math.PI*2,baseY:DROP_BASE_Y});
}
function spawnFixedDrop(pos,type,amount,ammoWeapon=null,ox=0,oz=0){
 if(type!=="ammo"&&type!=="money")return;
 if(drops.length>=MAX_ACTIVE_DROPS){const old=drops.shift();if(old&&old.g.parent)scene.remove(old.g)}
 const g=new THREE.Group(),body=new THREE.Mesh(dropGeo[type],dropMat[type]);
 body.castShadow=true;body.receiveShadow=true;body.position.y=.24;g.add(body);
 let labelText="",labelColor=0xffffff;
 if(type==="ammo"){
   ammoWeapon=ammoWeapon||randomAmmoWeapon();labelText=weaponDefs[ammoWeapon].name+" +"+amount;labelColor=0xf0c467;
   for(let k=-1;k<=1;k++){const round=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.23,7),M(0xc29742,.38));round.rotation.z=Math.PI/2;round.position.set(k*.13,.43,0);g.add(round)}
 }else{
   labelText="$"+amount;labelColor=0x76e27e;box(.36,.025,.22,M(0xc9d8b1,.72),0,.34,0,g);box(.05,.035,.25,M(0x294e2e,.78),0,.355,0,g);
 }
 const label=makeDropLabel(labelText,labelColor);label.position.set(0,1.03,0);g.add(label);
 g.position.set(pos.x+ox,DROP_BASE_Y,pos.z+oz);g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});scene.add(g);
 drops.push({g,type,amount,weapon:ammoWeapon,life:DROP_LIFETIME,phase:rnd()*Math.PI*2,baseY:DROP_BASE_Y});
}
function spawnBossRewardCache(pos){
 const ammoPool=Object.keys(unlocked).filter(w=>unlocked[w]&&w!=="pistol"&&w!=="grenadeLauncher");
 const ammoWeapon=ammoPool[Math.floor(rnd()*ammoPool.length)]||"rifle";
 spawnFixedDrop(pos,"money",25,null,.9,.25);
 spawnFixedDrop(pos,"ammo",20,ammoWeapon,0,-.85);
 if(unlocked.grenadeLauncher)spawnFixedDrop(pos,"ammo",Math.min(4,Math.max(1,10-launcherAmmoTotal())),"grenadeLauncher",0,.85);
}
function collectDrop(d){
 if(d.type==="money"){
   cash+=d.amount;show("CASH +$"+d.amount);
 }else{
   if(d.weapon==="grenadeLauncher"){
     const added=addGrenadeLauncherAmmo(d.amount);
     if(added<=0){
       // If a launcher box was already on the ground when the player reached
       // the 10-round cap, convert it to useful ammo instead of making the
       // player wait until all launcher rounds are gone.
       const pool=Object.keys(unlocked).filter(w=>unlocked[w]&&w!=="grenadeLauncher");
       const fallback=pool[Math.floor(rnd()*pool.length)]||"rifle";
       ammoState[fallback].reserve+=d.amount;
       show(weaponDefs[fallback].name+" AMMO +"+d.amount);
     }else show("GRENADE LAUNCHER AMMO +"+added);
   }else{
     ammoState[d.weapon].reserve+=d.amount;
     show(weaponDefs[d.weapon].name+" AMMO +"+d.amount);
   }
 }
 pickupS();ui();return true
}
function updateDrops(dt){
 for(let i=drops.length-1;i>=0;i--){
   const d=drops[i];d.life-=dt;d.phase+=dt*2.1;
   d.g.rotation.y+=dt*.85;
   d.g.position.y=d.baseY+.12+Math.sin(d.phase)*.07;
   const dist=Math.hypot(px-d.g.position.x,pz-d.g.position.z);
   if(dist<DROP_PICKUP_RADIUS&&collectDrop(d)){
     scene.remove(d.g);drops.splice(i,1);continue;
   }
   if(d.life<=0){
     scene.remove(d.g);drops.splice(i,1);
   }
 }
}

const living=()=>zombies.filter(z=>!z.dead);
const activeFrame=[];
function livingCount(){let n=0;for(const z of zombies)if(!z.dead)n++;return n}
const MAX_ACTIVE_ZOMBIES=30;
const RECENT_ZOMBIE_SPAWN_LIMIT=96;
const recentZombieSpawnPoints=[];
let zombieSpawnAngleOffset=0;
const ZOMBIE_SPAWN_GOLDEN_ANGLE=Math.PI*(3-Math.sqrt(5));
const waveRemainingCount=()=>livingCount()+Math.max(0,waveTarget-waveSpawned);
function spawnAngleDiff(a,b){return Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))}
function rememberZombieSpawn(p){
 recentZombieSpawnPoints.push({x:p.x,z:p.z});
 if(recentZombieSpawnPoints.length>RECENT_ZOMBIE_SPAWN_LIMIT)recentZombieSpawnPoints.shift();
}
function zombieSpawnSpreadOk(x,z,minSeparation,minAngle){
 const a=Math.atan2(z-pz,x-px);
 for(const p of recentZombieSpawnPoints){
   if(Math.hypot(x-p.x,z-p.z)<minSeparation)return false;
   if(minAngle>0){
     const pa=Math.atan2(p.z-pz,p.x-px);
     const da=Math.abs(Math.atan2(Math.sin(a-pa),Math.cos(a-pa)));
     if(da<minAngle)return false;
   }
 }
 // Late waves continually refill the 30-active cap. Keep new arrivals away from
 // living zombies too, so replacement spawns do not reform a large clump.
 const liveSep=Math.max(3.4,minSeparation*.72);
 for(const live of zombies){
   if(live.dead)continue;
   if(Math.hypot(x-live.g.position.x,z-live.g.position.z)<liveSep)return false;
 }
 return true;
}
function validZombieSpawn(x,z){
 if(x<ZNAV_MIN_X+2||x>ZNAV_MAX_X-2||z<ZNAV_MIN_Z+2||z>ZNAV_MAX_Z-2)return false;
 // v388: stay within the authored city footprint. Nearby sidewalks/plazas and
 // doorway-connected interiors are still allowed; detached exterior ground is not.
 if(!pointNearNewCitySpawnZone(x,z,12))return false;
 if(zombieSpawnGroundY(x,z)===null)return false;
 // Use near-body clearance so real passable doorways/entrances stay eligible.
 if(insideBuilding(x,z,.46))return false;
 if(!zombieSpawnConnectedToPlayer(x,z))return false;
 for(const c of parkedCars)if(carPointCollision(c,x,z,.85))return false;
 return Math.hypot(x-px,z-pz)>28;
}
function reachableZombieSpawn(x,z,allowRoute=true){
 if(!validZombieSpawn(x,z))return false;
 if(zombieRouteClear(x,z,px,pz,ZNAV_PAD))return true;
 if(!allowRoute)return false;
 const route=buildZombieRoute(x,z,px,pz);
 return route!==null&&route.length>0;
}
function findReachableZombieSpawn(minDist,maxDist,spread=true,targetAngle=null){
 const spreadPasses=spread?[
   {sep:14.0,tol:.52,ang:.22},
   {sep:11.5,tol:.78,ang:.16},
   {sep:9.0,tol:1.08,ang:.11},
   {sep:6.5,tol:1.50,ang:.06},
   {sep:4.5,tol:Math.PI,ang:0}
 ]:[{sep:0,tol:Math.PI,ang:0}];
 const angleOk=(x,z,tol)=>{
   if(targetAngle===null||tol>=Math.PI)return true;
   return spawnAngleDiff(Math.atan2(z-pz,x-px),targetAngle)<=tol;
 };
 for(const spreadRule of spreadPasses){
   // v386: sample the full reachable ground ring first, not just Road_/ParkingBG_.
   // Closed interiors fail routing; interiors connected by a genuine passable door
   // are valid because the same collision/nav rules can route a zombie through it.
   for(let tries=0;tries<84;tries++){
     const a=targetAngle===null
       ?rnd()*Math.PI*2
       :targetAngle+(rnd()-.5)*Math.min(Math.PI*2,spreadRule.tol*2);
     const d2=minDist*minDist+rnd()*(maxDist*maxDist-minDist*minDist);
     const dist=Math.sqrt(d2),x=px+Math.cos(a)*dist,z=pz+Math.sin(a)*dist;
     if(!angleOk(x,z,spreadRule.tol))continue;
     if(!zombieSpawnSpreadOk(x,z,spreadRule.sep,spreadRule.ang))continue;
     if(reachableZombieSpawn(x,z,false))return{x,z};
   }
   for(let tries=0;tries<36;tries++){
     const a=targetAngle===null
       ?rnd()*Math.PI*2
       :targetAngle+(rnd()-.5)*Math.min(Math.PI*2,spreadRule.tol*2);
     const d2=minDist*minDist+rnd()*(maxDist*maxDist-minDist*minDist);
     const dist=Math.sqrt(d2),x=px+Math.cos(a)*dist,z=pz+Math.sin(a)*dist;
     if(!angleOk(x,z,spreadRule.tol))continue;
     if(!zombieSpawnSpreadOk(x,z,spreadRule.sep,spreadRule.ang))continue;
     if(reachableZombieSpawn(x,z,true))return{x,z};
   }

   // Keep authored road/parking rectangles as a fallback, but they are no longer
   // the only legal spawn surfaces.
   if(newCitySpawnZones.length){
     for(let tries=0;tries<60;tries++){
       const zone=newCitySpawnZones[Math.floor(rnd()*newCitySpawnZones.length)];
       const pad=.65,usableX=zone.maxX-zone.minX-pad*2,usableZ=zone.maxZ-zone.minZ-pad*2;
       if(usableX<=0||usableZ<=0)continue;
       const x=zone.minX+pad+rnd()*usableX,z=zone.minZ+pad+rnd()*usableZ;
       const dist=Math.hypot(x-px,z-pz);
       if(dist<minDist||dist>maxDist)continue;
       if(!angleOk(x,z,spreadRule.tol))continue;
       if(!zombieSpawnSpreadOk(x,z,spreadRule.sep,spreadRule.ang))continue;
       if(reachableZombieSpawn(x,z,false))return{x,z};
     }
     for(let tries=0;tries<48;tries++){
       const zone=newCitySpawnZones[Math.floor(rnd()*newCitySpawnZones.length)];
       const pad=.65,usableX=zone.maxX-zone.minX-pad*2,usableZ=zone.maxZ-zone.minZ-pad*2;
       if(usableX<=0||usableZ<=0)continue;
       const x=zone.minX+pad+rnd()*usableX,z=zone.minZ+pad+rnd()*usableZ;
       const dist=Math.hypot(x-px,z-pz);
       if(dist<minDist||dist>maxDist)continue;
       if(!angleOk(x,z,spreadRule.tol))continue;
       if(!zombieSpawnSpreadOk(x,z,spreadRule.sep,spreadRule.ang))continue;
       if(reachableZombieSpawn(x,z,true))return{x,z};
     }
   }
   // Ring fallback starts from this zombie's assigned approach direction and
   // fans left/right from there, instead of choosing another random corridor.
   const center=targetAngle===null?rnd()*Math.PI*2:targetAngle;
   for(let ring=minDist+2;ring<=maxDist;ring+=4){
     for(let k=0;k<24;k++){
       const step=(k===0?0:Math.ceil(k/2)*(k%2?1:-1))*(Math.PI*2/24);
       const a=center+step,x=px+Math.cos(a)*ring,z=pz+Math.sin(a)*ring;
       if(!angleOk(x,z,spreadRule.tol))continue;
       if(!zombieSpawnSpreadOk(x,z,spreadRule.sep,spreadRule.ang))continue;
       if(reachableZombieSpawn(x,z,true))return{x,z};
     }
   }
 }
 return null;
}
function spawnOneZombie(i){
 if(!newCityCollisionReady)return false;
 const targetAngle=zombieSpawnAngleOffset+i*ZOMBIE_SPAWN_GOLDEN_ANGLE;
 const p=findReachableZombieSpawn(30,64,true,targetAngle);
 if(!p)return false;
 rememberZombieSpawn(p);
 makeZombie(p.x,p.z,i);
 return true;
}
function spawnQueuedZombies(){
 if(!running||dying||between)return;
 let activeCount=livingCount();
 while(activeCount<MAX_ACTIVE_ZOMBIES&&waveSpawned<waveTarget){
   if(!spawnOneZombie(waveSpawned))break;
   waveSpawned++;activeCount++;
 }
}
function spawnWave(){
 let d=diff(wave);currentBoss=null;recentZombieSpawnPoints.length=0;zombieSpawnAngleOffset=rnd()*Math.PI*2;
 if(isBossWave(wave)){
   const spec=bossWaveSpec(wave);waveTarget=1;waveSpawned=0;
   let sx=px,sz=pz,ok=false;
   const bossSpawn=findReachableZombieSpawn(36,70,false,null);
   if(bossSpawn){sx=bossSpawn.x;sz=bossSpawn.z;ok=true}
   if(!ok){
     // Extremely defensive fallback: keep boss-wave behavior intact even if the
     // route search cannot find a candidate during this frame. The expanded A*
     // will still take over immediately after spawn.
     for(let tries=0;tries<60&&!ok;tries++){const a=rnd()*Math.PI*2,dist=36+rnd()*34;sx=px+Math.sin(a)*dist;sz=pz+Math.cos(a)*dist;ok=validZombieSpawn(sx,sz)}
   }
   if(!ok){const a=rnd()*Math.PI*2,dist=38+rnd()*30;sx=px+Math.sin(a)*dist;sz=pz+Math.cos(a)*dist;const safe=pushOutsideBuilding(sx,sz,.85);sx=safe.x;sz=safe.z}
   makeZombie(sx,sz,0,"boss",spec);waveSpawned=1;show("BOSS INBOUND: "+spec.name);updateBossUI();ui();return
 }
 waveTarget=d.count;waveSpawned=0;spawnQueuedZombies();ui()
}
function ui(){
 const ammo=A(),weaponDef=wd();
 renderMainHud({
  elements:{healthText,healthBar,ammoEl,killsEl,headsEl,waveEl,remainingEl,cashEl,shopCash,weaponNameEl,grenadeEl,nukeEl},
  values:{
   healthText:String(Math.ceil(Math.max(0,health))),
   healthWidth:Math.max(0,health)+"%",
   healthColor:health>60?"#55a45c":health>30?"#c49b43":"#ae3535",
   ammoText:weapon==="pistol"?ammo.mag+" / ∞":ammo.mag+" / "+ammo.reserve,
   killsText:"KILLS "+kills,
   headsText:"HEADSHOTS "+heads,
   waveText:"WAVE "+wave,
   remainingText:currentBoss&&!currentBoss.dead?"BOSS 1":"ZOMBIES "+waveRemainingCount(),
   cashText:"CASH $"+cash,
   weaponText:weaponDef.name,
   grenadeText:"GRENADES "+grenades,
   nukeText:"NUKES "+nukes
  }
 });
 updateBossUI();
}
function show(s){showTransientMessage(msg,s)}
function burst(pos,big=false){
 const count=big?10:3;
 for(let i=0;i<count;i++){
   let q=new THREE.Mesh(big?FX.bloodGeoBig:FX.bloodGeoSmall,i%4===0?FX.boneMat:FX.bloodMat);
   const s=big?.55+rnd()*.8:.45+rnd()*.5;q.scale.setScalar(s);q.position.copy(pos);scene.add(q);
   parts.push({q,v:new THREE.Vector3((rnd()-.5)*(big?5:2),rnd()*(big?4:2),(rnd()-.5)*(big?5:2)),life:big?.5+rnd()*.4:.26});
 }
 capFX()
}

function hitMark(head=false){
  hitmarker.textContent=head?"✕":"×";
  // Keep the M17 hit marker visually centered on screen. This does not change
  // the pistol's approved ADS firing ray / zero.
  hitmarker.style.left=(aiming&&weapon==="smg")?"49.1%":"50%";
  hitmarker.style.top=(aiming&&weapon==="smg")?"51.25%":"50%";
  hitmarker.classList.toggle("head",head);
  hitmarker.classList.add("show");
  clearTimeout(hitTimer);
  hitTimer=setTimeout(()=>hitmarker.classList.remove("show","head"),90);
  if(head){tone(1180,.045,"square",.11);tone(1580,.055,"sine",.08,.025)}
  else tone(760,.025,"square",.045);
}
function casing(){
  const q=new THREE.Mesh(FX.casingGeo,FX.casingMat);
  q.rotation.z=Math.PI/2;
  const wp=new THREE.Vector3();
  gun.localToWorld(wp.set(.56,-.26,-1.05));
  q.position.copy(wp);scene.add(q);
  const right=new THREE.Vector3(1,0,0).applyQuaternion(cam.quaternion),up=new THREE.Vector3(0,1,0);
  casings.push({q,v:right.multiplyScalar(1.7+Math.random()*.8).add(up.multiplyScalar(1.1+Math.random()*.7)),life:1.0,spin:(Math.random()-.5)*18});
  capFX()
}
function impactFX(p){
  for(let i=0;i<2;i++){
    const q=new THREE.Mesh(FX.impactGeo,FX.impactMat);
    q.position.copy(p);let s=.7+Math.random()*.65;q.scale.setScalar(s);scene.add(q);
    impacts.push({q,v:new THREE.Vector3((Math.random()-.5)*1.6,Math.random()*1.5,(Math.random()-.5)*1.6),life:.16+Math.random()*.12});
  }
  capFX()
}
function stagger(z,hs){
  const boss=z.kind==="boss";
  z.stagger=Math.max(z.stagger||0,boss?(hs?.09:.055):(hs?.30:.20));
  z.staggerDir=(Math.random()>.5?1:-1);
  if(!boss)rigTransient(z,"Hit",hs?.34:.28);
}

function rigBone(z,name){return z.rigVisual?z.rigVisual.getObjectByName(name):null}
function ragBone(z,name){
 const wb=z?.walkerBones?.get(name);if(wb)return wb;
 return rigBone(z,name);
}

const BODY_PBD_KEYS=Object.freeze([
 "Hips","Spine","Chest","Neck","Head",
 "L_UpperArm","L_LowerArm","L_Hand","R_UpperArm","R_LowerArm","R_Hand",
 "L_UpperLeg","L_LowerLeg","L_Foot","R_UpperLeg","R_LowerLeg","R_Foot"
]);
const BODY_PBD_EDGES=Object.freeze([
 ["Hips","Spine"],["Spine","Chest"],["Chest","Neck"],["Neck","Head"],
 ["Chest","L_UpperArm"],["L_UpperArm","L_LowerArm"],["L_LowerArm","L_Hand"],
 ["Chest","R_UpperArm"],["R_UpperArm","R_LowerArm"],["R_LowerArm","R_Hand"],
 ["Hips","L_UpperLeg"],["L_UpperLeg","L_LowerLeg"],["L_LowerLeg","L_Foot"],
 ["Hips","R_UpperLeg"],["R_UpperLeg","R_LowerLeg"],["R_LowerLeg","R_Foot"],
 ["L_UpperArm","R_UpperArm"],["L_UpperLeg","R_UpperLeg"]
]);
const bodyPbdTmpA=new THREE.Vector3(),bodyPbdTmpB=new THREE.Vector3(),bodyPbdTmpC=new THREE.Vector3(),bodyPbdScale=new THREE.Vector3();
const bodyPbdParentQ=new THREE.Quaternion(),bodyPbdInvQ=new THREE.Quaternion(),bodyPbdDeltaQ=new THREE.Quaternion();

function bodyPbdRig(z){
 if(z?.walkerBones?.size&&z.walkerVisual)return{holder:z.walkerVisual,bones:z.walkerBones,kind:"walker"};
 if(z?.radiatedGreenBones?.size&&z.radiatedGreenVisual)return{holder:z.radiatedGreenVisual,bones:z.radiatedGreenBones,kind:"radiated"};
 if(z?.rigVisual){
   const bones=new Map();
   for(const key of BODY_PBD_KEYS){const b=z.rigVisual.getObjectByName(key);if(b)bones.set(key,b)}
   if(bones.size>=8)return{holder:z.rigVisual,bones,kind:"rig"};
 }
 const bones=new Map();
 const add=(key,o)=>{if(o&&o.parent)bones.set(key,o)};
 add("Hips",z?.pelvis);add("Chest",z?.torso);add("Head",z?.head);
 add("L_UpperArm",z?.armL);add("L_LowerArm",z?.elbowL);
 add("R_UpperArm",z?.armR);add("R_LowerArm",z?.elbowR);
 add("L_UpperLeg",z?.legL);add("L_LowerLeg",z?.kneeL);
 add("R_UpperLeg",z?.legR);add("R_LowerLeg",z?.kneeR);
 return bones.size>=7?{holder:z.g,bones,kind:"procedural"}:null;
}
function bodyPbdBoneAllowed(z,key){
 if(z.leftArmDetached&&(key==="L_UpperArm"||key==="L_LowerArm"||key==="L_Hand"))return false;
 if(z.rightArmDetached&&(key==="R_UpperArm"||key==="R_LowerArm"||key==="R_Hand"))return false;
 if(z.leftLegDetached&&(key==="L_UpperLeg"||key==="L_LowerLeg"||key==="L_Foot"))return false;
 if(z.rightLegDetached&&(key==="R_UpperLeg"||key==="R_LowerLeg"||key==="R_Foot"))return false;
 return true;
}
function bodyPbdPushOutsideCar(c,x,z,pad=.08){
 const dx=x-c.position.x,dz=z-c.position.z,a=c.rotation.y,co=Math.cos(a),si=Math.sin(a);
 let lx=co*dx-si*dz,lz=si*dx+co*dz;
 const hw=(c.userData.carHalfW||.88)+pad,hl=(c.userData.carHalfL||2.30)+pad;
 if(Math.abs(lx)>=hw||Math.abs(lz)>=hl)return{x,z};
 const px=hw-Math.abs(lx),pz=hl-Math.abs(lz);
 if(px<pz)lx=(lx<0?-1:1)*hw;else lz=(lz<0?-1:1)*hl;
 return{x:c.position.x+co*lx+si*lz,z:c.position.z-si*lx+co*lz};
}
function buildBodyPbd(z,rag,isBlast,blastOrigin,inheritedVX,inheritedVZ,power,options=null){
 const rig=bodyPbdRig(z);if(!rig)return null;
 z.g.updateMatrixWorld(true);rig.holder.updateMatrixWorld(true);
 const nodes=new Map();
 const centerY=z.g.position.y+1.0,bodyCenterD=isBlast&&blastOrigin?Math.hypot(z.g.position.x-blastOrigin.x,centerY-blastOrigin.y,z.g.position.z-blastOrigin.z):0;
 for(const key of BODY_PBD_KEYS){
   if(!bodyPbdBoneAllowed(z,key))continue;
   const bone=rig.bones.get(key);if(!bone||!bone.parent)continue;
   const pos=new THREE.Vector3();bone.getWorldPosition(pos);
   let vx=inheritedVX,vz=inheritedVZ,vy=0;
   if(isBlast&&blastOrigin){
     const dx=pos.x-blastOrigin.x,dy=pos.y-blastOrigin.y,dz=pos.z-blastOrigin.z,nodeD=Math.hypot(dx,dy,dz)||1;
     // v427: explosive kills are intentionally comic-book violent.
     // Even the far side of a lethal blast gets a large launch; proximity and
     // per-limb distance still make the closest side fly harder.
     const asym=THREE.MathUtils.clamp(1+(bodyCenterD-nodeD)*.30,.78,1.62);
     const horiz=Math.hypot(dx,dz)||1,launch=(8.4+power*3.05)*asym;
     vx=dx/horiz*launch;vz=dz/horiz*launch;
     vy=(6.2+power*2.15)*asym+Math.max(0,dy/nodeD)*1.6;
   }
   const distal=key.includes("Hand")||key.includes("Foot")||key.includes("Lower")||key==="Head";
   const random=distal?(isBlast?2.35:1.18):(isBlast?1.25:.62);
   vx+=(rnd()-.5)*random;vy+=(rnd()-.5)*random*.72;vz+=(rnd()-.5)*random;
   const invMass=(key==="Hips"||key==="Chest")?.62:key==="Spine"?.72:1;
   const radius=key==="Head"?.17:key.includes("Hand")||key.includes("Foot")?.075:.10;
   nodes.set(key,{key,bone,pos,vel:new THREE.Vector3(vx,vy,vz),old:new THREE.Vector3(),invMass,radius,lastGroundY:rag.floorY});
 }
 // v427: feet need their own segment. Create a lightweight virtual toe in the
 // foot bone's authored forward direction; the ankle/foot can now rotate
 // independently instead of looking welded to the lower leg.
 for(const side of ["L","R"]){
   const footKey=side+"_Foot",toeKey=side+"_Toe",foot=nodes.get(footKey),footBone=rig.bones.get(footKey);
   if(!foot||!footBone)continue;
   footBone.getWorldQuaternion(bodyPbdParentQ);
   const toeDir=new THREE.Vector3(0,0,1).applyQuaternion(bodyPbdParentQ).normalize();
   const toePos=foot.pos.clone().addScaledVector(toeDir,.23);
   nodes.set(toeKey,{
     key:toeKey,bone:null,pos:toePos,
     vel:foot.vel.clone().add(new THREE.Vector3((rnd()-.5)*.18,(rnd()-.5)*.10,(rnd()-.5)*.18)),
     old:new THREE.Vector3(),invMass:1.12,radius:.055,lastGroundY:rag.floorY,virtual:true
   });
 }
 if(!nodes.has("Hips")||!nodes.has("Chest")||!nodes.has("Head")||nodes.size<7)return null;
 const edges=[];
 for(const [a,b] of BODY_PBD_EDGES){
   const na=nodes.get(a),nb=nodes.get(b);if(na&&nb)edges.push({a:na,b:nb,len:na.pos.distanceTo(nb.pos)});
 }
 // Procedural/crawler fallbacks may have no explicit Spine/Neck bones.
 if(nodes.get("Hips")&&nodes.get("Chest")&&!nodes.get("Spine")){
   const a=nodes.get("Hips"),b=nodes.get("Chest");edges.push({a,b,len:a.pos.distanceTo(b.pos)});
 }
 if(nodes.get("Chest")&&nodes.get("Head")&&!nodes.get("Neck")){
   const a=nodes.get("Chest"),b=nodes.get("Head");edges.push({a,b,len:a.pos.distanceTo(b.pos)});
 }
 for(const side of ["L","R"]){
   const f=nodes.get(side+"_Foot"),t=nodes.get(side+"_Toe");
   if(f&&t)edges.push({a:f,b:t,len:f.pos.distanceTo(t.pos)});
 }
 // v426: restore the v423 articulation map. Branch roots must NOT be
 // oriented toward multiple children: doing that made Chest fight between both
 // shoulders and Hips fight between both thighs, visually folding the corpse
 // into a tight ball. Shoulder/hip spacing stays physical through PBD distance
 // constraints; only single-chain bones drive visible rotations.
 const linkPairs=[
   ["Hips","Spine"],["Spine","Chest"],["Chest","Neck"],["Neck","Head"],
   ["L_UpperArm","L_LowerArm"],["L_LowerArm","L_Hand"],
   ["R_UpperArm","R_LowerArm"],["R_LowerArm","R_Hand"],
   ["L_UpperLeg","L_LowerLeg"],["L_LowerLeg","L_Foot"],["L_Foot","L_Toe"],
   ["R_UpperLeg","R_LowerLeg"],["R_LowerLeg","R_Foot"],["R_Foot","R_Toe"]
 ];
 const links=[];
 for(const [a,b] of linkPairs){
   const bone=rig.bones.get(a),child=rig.bones.get(b),na=nodes.get(a),nb=nodes.get(b);
   if(!bone||!na||!nb||!bone.parent)continue;
   bone.getWorldPosition(bodyPbdTmpA);
   if(child)child.getWorldPosition(bodyPbdTmpB);else bodyPbdTmpB.copy(nb.pos);
   bone.parent.getWorldQuaternion(bodyPbdParentQ);bodyPbdInvQ.copy(bodyPbdParentQ).invert();
   const restDir=bodyPbdTmpB.sub(bodyPbdTmpA).applyQuaternion(bodyPbdInvQ).normalize().clone();
   links.push({a,b,bone,baseQuat:bone.quaternion.clone(),restDir});
 }
 return{holder:rig.holder,bones:rig.bones,rigKind:rig.kind,nodes,edges,links,settleT:0,allDown:false,maxSpeed:999,followRoot:!!options?.followRoot};
}
function solveBodyPbdEdge(e){
 const d=bodyPbdTmpA.subVectors(e.b.pos,e.a.pos),dist=d.length();if(dist<1e-6)return;
 const corr=(dist-e.len)/dist,w1=e.a.invMass,w2=e.b.invMass,ws=w1+w2;if(ws<=0)return;
 d.multiplyScalar(corr);e.a.pos.addScaledVector(d,w1/ws);e.b.pos.addScaledVector(d,-w2/ws);
}
function collideBodyPbdNode(n,rag){
 const pad=Math.max(.055,n.radius*.72),slide=slideBuilding(n.old.x,n.old.z,n.pos.x,n.pos.z,pad);
 n.pos.x=slide.x;n.pos.z=slide.z;
 for(const c of parkedCars){
   if(carPointCollision(c,n.pos.x,n.pos.z,pad)){const pushed=bodyPbdPushOutsideCar(c,n.pos.x,n.pos.z,pad);n.pos.x=pushed.x;n.pos.z=pushed.z}
 }
 let gy=sampleRagdollGroundY(n.pos.x,n.pos.z,rag.floorY,n.pos.y);
 if(Number.isFinite(n.lastGroundY)&&gy>n.lastGroundY+.18&&n.pos.y<gy+n.radius+.24){
   n.pos.x=n.old.x;n.pos.z=n.old.z;gy=n.lastGroundY;
 }
 const floor=gy+n.radius,touched=n.pos.y<floor;
 if(touched)n.pos.y=floor;
 n.lastGroundY=gy;
 return touched;
}
function orientBodyPbd(z,pbd){
 const hips=pbd.nodes.get("Hips"),holder=pbd.holder,hipsBone=pbd.bones.get("Hips");
 if(!hips||!holder||!hipsBone)return;
 if(pbd.followRoot&&holder!==z.g){
   z.g.position.x=hips.pos.x;z.g.position.z=hips.pos.z;
 }
 z.g.updateMatrixWorld(true);holder.updateMatrixWorld(true);hipsBone.getWorldPosition(bodyPbdTmpA);
 bodyPbdTmpC.subVectors(hips.pos,bodyPbdTmpA);
 if(holder.parent){
   holder.parent.getWorldQuaternion(bodyPbdParentQ);bodyPbdInvQ.copy(bodyPbdParentQ).invert();
   bodyPbdTmpC.applyQuaternion(bodyPbdInvQ);
   holder.parent.getWorldScale(bodyPbdScale);
   bodyPbdTmpC.x/=Math.max(.0001,bodyPbdScale.x);bodyPbdTmpC.y/=Math.max(.0001,bodyPbdScale.y);bodyPbdTmpC.z/=Math.max(.0001,bodyPbdScale.z);
 }
 holder.position.add(bodyPbdTmpC);holder.updateMatrixWorld(true);
 for(const link of pbd.links){
   const target=pbd.nodes.get(link.b),bone=link.bone,parent=bone.parent;if(!target||!parent)continue;
   bone.getWorldPosition(bodyPbdTmpA);bodyPbdTmpB.subVectors(target.pos,bodyPbdTmpA);
   if(bodyPbdTmpB.lengthSq()<1e-8)continue;
   parent.getWorldQuaternion(bodyPbdParentQ);bodyPbdInvQ.copy(bodyPbdParentQ).invert();
   bodyPbdTmpB.applyQuaternion(bodyPbdInvQ).normalize();
   bodyPbdDeltaQ.setFromUnitVectors(link.restDir,bodyPbdTmpB);
   bone.quaternion.copy(bodyPbdDeltaQ.multiply(link.baseQuat));bone.updateMatrixWorld(true);
 }
 holder.updateMatrixWorld(true);
}
function updateBodyPbd(z,rag,dt){
 const p=rag.bodyPbd;if(!p)return false;
 const steps=Math.max(1,Math.min(3,Math.ceil(dt/(1/60)))),h=dt/steps;
 for(let step=0;step<steps;step++){
   const touched=new Set();
   for(const n of p.nodes.values()){n.old.copy(n.pos);n.vel.y-=9.81*h;n.pos.addScaledVector(n.vel,h)}
   for(let iter=0;iter<5;iter++)for(const e of p.edges)solveBodyPbdEdge(e);
   for(const n of p.nodes.values())if(collideBodyPbdNode(n,rag))touched.add(n);
   for(let iter=0;iter<2;iter++)for(const e of p.edges)solveBodyPbdEdge(e);
   for(const n of p.nodes.values()){
     if(collideBodyPbdNode(n,rag))touched.add(n);
     n.vel.subVectors(n.pos,n.old).multiplyScalar(.995/Math.max(h,.001));
     if(touched.has(n)){n.vel.x*=.62;n.vel.z*=.62;if(n.vel.y<0)n.vel.y=-n.vel.y*.10}
   }
 }
 let contacts=0,maxSpeed=0;
 for(const n of p.nodes.values()){
   const floor=(Number.isFinite(n.lastGroundY)?n.lastGroundY:rag.floorY)+n.radius;
   if(n.pos.y<=floor+.04)contacts++;
   maxSpeed=Math.max(maxSpeed,n.vel.length());
 }
 const down=k=>{const n=p.nodes.get(k);return !!n&&n.pos.y<=(Number.isFinite(n.lastGroundY)?n.lastGroundY:rag.floorY)+n.radius+.10};
 const needContacts=Math.max(4,Math.min(7,Math.ceil(p.nodes.size*.46)));
 p.allDown=down("Hips")&&down("Chest")&&down("Head")&&contacts>=needContacts;
 p.maxSpeed=maxSpeed;p.settleT=p.allDown&&maxSpeed<.22?p.settleT+dt:0;
 orientBodyPbd(z,p);
 rag.contactCount=contacts;rag.fullBodyDown=p.allDown;rag.grounded=p.allDown;
 if(p.settleT>1.10){rag.active=false;z.falling=false}else z.falling=true;
 return true;
}
function hideRigLimb(z,name){
 const b=rigBone(z,name);
 if(b){b.scale.set(.001,.001,.001);b.updateMatrixWorld(true)}
 const gb=z.radiatedGreenBones?.get(name);
 if(gb){gb.scale.set(.001,.001,.001);gb.updateMatrixWorld(true)}
 const wb=z.walkerBones?.get(name);
 if(wb){wb.scale.set(.001,.001,.001);wb.updateMatrixWorld(true)}
}
function addLimbStump(z,pos,leg=false){
 const q=new THREE.Mesh(FX.bloodGeoBig,FX.bloodMat);
 q.position.copy(pos);
 q.scale.set(leg?.95:.78,leg?.48:.42,leg?.95:.78);
 q.castShadow=false;q.receiveShadow=false;z.g.add(q);
}
function launchDetachedLimb(z,limb,side,leg=false){
 if(!limb||!limb.parent)return false;
 const local=limb.position.clone();
 limb.traverse(o=>{if(o.isMesh){o.visible=true;o.castShadow=false;o.receiveShadow=false;o.userData.detached=true;o.userData.zombie=null;o.raycast=()=>{}}});
 z.g.updateMatrixWorld(true);limb.updateMatrixWorld(true);
 scene.attach(limb);
 const push=(side==="left"?-1:1);
 parts.push({
   q:limb,
   v:new THREE.Vector3(push*(.9+rnd()*1.3)+(rnd()-.5)*.6,leg?1.5+rnd()*1.4:2.0+rnd()*1.8,(rnd()-.5)*2.2),
   spin:new THREE.Vector3((rnd()-.5)*9,(rnd()-.5)*11,(rnd()-.5)*9),
   life:8,limb:true
 });
 addLimbStump(z,local,leg);capFX();return true;
}
function detachArm(z,side){
 const key=side==="left"?"leftArmDetached":"rightArmDetached";
 if(z[key])return;
 if(z.radiatedGreenVisual||z.walkerVisual){
   const customBones=z.radiatedGreenBones||z.walkerBones;
   const bone=customBones?.get(side==="left"?"L_UpperArm":"R_UpperArm");
   const p=new THREE.Vector3();if(bone)bone.getWorldPosition(p);else p.copy(z.g.position).add(new THREE.Vector3(side==="left"?-.35:.35,1.35,0));
   z[key]=true;hideRigLimb(z,side==="left"?"L_UpperArm":"R_UpperArm");
   if(z.hitMeshes){
     for(const o of z.hitMeshes)if(o?.userData?.part===(side==="left"?"leftArm":"rightArm"))o.raycast=()=>{};
     z.hitMeshes=z.hitMeshes.filter(o=>o.userData.part!==(side==="left"?"leftArm":"rightArm"));
   }
   if(side==="left")z.armL=new THREE.Group();else z.armR=new THREE.Group();
   burst(p,true);noise(.12,.22,350);show(side==="left"?"LEFT ARM OFF":"RIGHT ARM OFF");return;
 }
 const arm=side==="left"?z.armL:z.armR;
 if(!launchDetachedLimb(z,arm,side,false))return;
 z[key]=true;
 hideRigLimb(z,side==="left"?"L_UpperArm":"R_UpperArm");
 if(z.hitMeshes)z.hitMeshes=z.hitMeshes.filter(o=>o.userData.part!==(side==="left"?"leftArm":"rightArm"));
 if(side==="left")z.armL=new THREE.Group();else z.armR=new THREE.Group();
 noise(.12,.22,350);show(side==="left"?"LEFT ARM OFF":"RIGHT ARM OFF");
}
function hideNativeCrawlerVisual(crawler){
 if(!crawler?.g)return;
 crawler.g.traverse(o=>{
   if(!o.isMesh)return;
   // v436: the native crawler uses its visible body meshes as ray targets too.
   // Three.js raycasting does not require a mesh to be rendered, so hide ALL
   // native crawler meshes visually while leaving their raycast functions intact.
   // This removes the generic crawler shell without sacrificing stable mechanics.
   o.visible=false;
   o.castShadow=false;o.receiveShadow=false;
 });
}
function captureCrawlerUpperPose(holder,bones,type){
 const rotations=new Map();
 for(const key of ["Hips","Spine","Chest","Neck","Head","L_UpperArm","L_LowerArm","R_UpperArm","R_LowerArm"]){
   const b=bones?.get(key);if(b)rotations.set(key,b.rotation.clone());
 }
 return{type,holderPos:holder.position.clone(),holderQuat:holder.quaternion.clone(),rotations};
}
function transferCrawlerUpperVisual(source,crawler){
 let holder=null,bones=null,type="";
 if(source?.walkerVisual&&source?.walkerBones?.size){holder=source.walkerVisual;bones=source.walkerBones;type="walker"}
 else if(source?.radiatedGreenVisual&&source?.radiatedGreenBones?.size){holder=source.radiatedGreenVisual;bones=source.radiatedGreenBones;type="green"}
 else return false;

 const pose=captureCrawlerUpperPose(holder,bones,type);
 // Retire the old standing hitboxes embedded in this model. The native crawler's
 // stable hitboxes remain active underneath the preserved visible upper body.
 holder.traverse(o=>{
   if(o.userData?.zombie===source){o.raycast=()=>{};o.visible=false}
 });
 holder.removeFromParent();hideNativeCrawlerVisual(crawler);crawler.g.add(holder);
 holder.position.copy(pose.holderPos);holder.position.y-=type==="walker"?.48:.46;
 holder.quaternion.copy(pose.holderQuat);

 crawler.crawlerUpperVisual=holder;crawler.crawlerUpperBones=bones;crawler.crawlerUpperPose=pose;
 if(type==="walker"){
   crawler.walkerVisual=holder;crawler.walkerBones=bones;crawler.walkerModel=source.walkerModel;crawler.walkerSourceHeight=source.walkerSourceHeight;
   source.walkerVisual=null;source.walkerModel=null;source.walkerBones=null;
 }else{
   crawler.radiatedGreenVisual=holder;crawler.radiatedGreenBones=bones;crawler.radiatedGreenModel=source.radiatedGreenModel;
   source.radiatedGreenVisual=null;source.radiatedGreenModel=null;source.radiatedGreenBones=null;
   const geo=new THREE.SphereGeometry(.38,8,6),mat=new THREE.MeshBasicMaterial({color:0x46ff59,transparent:true,opacity:.10,depthWrite:false});
   const aura=new THREE.Mesh(geo,mat);aura.name="PreservedGreenCrawlerAura";aura.scale.set(1.10,.70,1.18);aura.position.set(0,.54,-.04);aura.userData.visualOnly=true;aura.raycast=()=>{};
   crawler.g.add(aura);if(crawler.ownedGeometries)crawler.ownedGeometries.push(geo);if(crawler.ownedMaterials)crawler.ownedMaterials.push(mat);
 }
 return true;
}
function setCrawlerArmToward(bones,upperKey,lowerKey,side,phase){
 const upper=bones.get(upperKey),lower=bones.get(lowerKey);if(!upper||!lower)return;
 const restUpper=lower.position.clone().normalize();
 // Imported walker/Green Guy models face +Z inside their holder; holders rotate
 // 180° to face the live zombie direction. Reach forward (+Z), down and slightly out.
 const reach=.10*Math.sin(phase),targetUpper=new THREE.Vector3(side*.34,-.42,.84+reach).normalize();
 upper.quaternion.setFromUnitVectors(restUpper,targetUpper);

 const hand=lower.children.find(o=>o.isBone);
 if(hand){
   const restLower=hand.position.clone().normalize();
   const targetLower=new THREE.Vector3(side*.12,-.26,.96-.06*Math.sin(phase)).normalize();
   lower.quaternion.setFromUnitVectors(restLower,targetLower);
 }else{
   // Green Guy lower arms have no hand bone; use a simple forward elbow bend.
   lower.rotation.set(.72+Math.max(0,Math.sin(phase))* .12,0,side*.035);
 }
}
function syncCrawlerUpperVisual(z){
 const holder=z?.crawlerUpperVisual,bones=z?.crawlerUpperBones,pose=z?.crawlerUpperPose;
 if(!holder||!bones?.size||!pose)return false;
 if(z.knockdown?.bodyPbd?.holder===holder)return true;
 if(z.dead&&z.ragdoll?.bodyPbd?.holder===holder)return true;

 const phase=z.phase||0,s=Math.sin(phase),attack=Math.max(0,Math.min(1,(z.attackAnim||0)/.62));
 holder.position.copy(pose.holderPos);holder.position.y-=pose.type==="walker"?.48:.46;
 holder.quaternion.copy(pose.holderQuat);

 const add=(key,x=0,y=0,zz=0)=>{
   const b=bones.get(key),r=pose.rotations.get(key);if(!b||!r)return;
   b.rotation.set(r.x+x,r.y+y,r.z+zz);
 };
 // A restrained upper-body crawl: enough forward fold to read as crawling without
 // collapsing the imported skin around its root pivot.
 add("Hips",.56,s*.025,0);
 add("Spine",.10,0,s*.025);
 add("Chest",.06,0,-s*.020);
 add("Neck",-.18,0,0);
 add("Head",-.16+attack*.025,-s*.045,s*.015);
 // v436: point both arm chains toward the crawl direction instead of applying
 // mirrored Euler offsets. This fixes the preserved walker's backwards arm.
 setCrawlerArmToward(bones,"L_UpperArm","L_LowerArm",-1,phase);
 setCrawlerArmToward(bones,"R_UpperArm","R_LowerArm", 1,phase+Math.PI);
 holder.updateMatrixWorld(true);
 return true;
}
function crawlerMatColor(mat,fallback){
 const m=Array.isArray(mat)?mat[0]:mat;
 return m?.color?.isColor?m.color.getHex():fallback;
}
function captureCrawlerIdentity(z){
 const kind=z?.kind||"shambler";
 let skin=crawlerMatColor(z?.head?.material,0x7d796d),
     shirt=crawlerMatColor(z?.torso?.material,0x4d5848),
     pants=crawlerMatColor(z?.pelvis?.material,0x26292d),
     eye=kind==="radiated"?0x52ff62:(kind==="infected"||kind==="acidic"?0xff3e3e:0xffe34e),
     aura=0;

 // The imported walker and Green Guy visuals are the identities the user sees,
 // so give their crawler forms explicit matching family palettes rather than the
 // hidden procedural fallback colors.
 if(z?.walkerVisual){
   skin=0xb89478;shirt=0x3567a3;pants=0x172845;eye=0xffd85a;
 }
 if(z?.radiatedGreenVisual||kind==="radiated"){
   skin=0x78a64e;shirt=0x315a8e;pants=0x1b314d;eye=0x52ff62;aura=0x46ff59;
 }else if(kind==="infected"){
   skin=0x777164;shirt=0x5b3030;pants=0x252a31;eye=0xff3e3e;aura=0x8f1616;
 }else if(kind==="acidic"){
   skin=0x71805e;shirt=0x4b5d2d;pants=0x252b25;eye=0xff3e3e;aura=0x78a629;
 }else if(kind==="sprinter"){
   shirt=0x4a505b;pants=0x202733;
 }
 return{kind,skin,shirt,pants,eye,aura,walker:!!z?.walkerVisual,green:!!z?.radiatedGreenVisual};
}
function tintCrawlerMaterial(obj,hex){
 if(!obj)return;
 const mats=Array.isArray(obj.material)?obj.material:[obj.material];
 for(const m of mats){if(m?.color?.isColor){m.color.setHex(hex);m.needsUpdate=true}}
}
function applyCrawlerIdentity(crawler,id){
 if(!crawler||!id)return;
 crawler.crawlerSourceKind=id.kind;
 crawler.crawlerSourceWalker=id.walker;
 crawler.crawlerSourceGreen=id.green;

 tintCrawlerMaterial(crawler.head,id.skin);
 tintCrawlerMaterial(crawler.neck,id.skin);
 tintCrawlerMaterial(crawler.jaw,id.skin);
 tintCrawlerMaterial(crawler.torso,id.shirt);
 tintCrawlerMaterial(crawler.chest,id.shirt);
 tintCrawlerMaterial(crawler.pelvis,id.pants);
 tintCrawlerMaterial(crawler.jacket,id.shirt);
 tintCrawlerMaterial(crawler.shoulderL,id.shirt);
 tintCrawlerMaterial(crawler.shoulderR,id.shirt);

 // Keep hands/forearms readable as the same corpse skin while the crawler drags.
 for(const arm of [crawler.armL,crawler.armR]){
   if(!arm)continue;
   arm.traverse(o=>{
     if(!o.isMesh||!o.material)return;
     const mats=Array.isArray(o.material)?o.material:[o.material];
     for(const m of mats){
       if(!m?.color?.isColor)continue;
       // Leave very dark wound/detail materials alone; recolor the visible flesh.
       const lum=(m.color.r+m.color.g+m.color.b)/3;
       if(lum>.16){m.color.setHex(id.skin);m.needsUpdate=true}
     }
   });
 }
 if(crawler.ownedMaterials?.[0]?.color?.isColor){
   crawler.ownedMaterials[0].color.setHex(id.eye);
   crawler.ownedMaterials[0].needsUpdate=true;
 }

 if(id.aura){
   const geo=new THREE.SphereGeometry(.34,8,6);
   const mat=new THREE.MeshBasicMaterial({color:id.aura,transparent:true,opacity:.10,depthWrite:false});
   const glow=new THREE.Mesh(geo,mat);
   glow.name="CrawlerIdentityAura";glow.scale.set(1.12,.72,1.20);glow.position.set(0,.62,-.10);
   glow.userData.visualOnly=true;glow.raycast=()=>{};crawler.g.add(glow);
   crawler.crawlerIdentityAura=glow;
   if(crawler.ownedGeometries)crawler.ownedGeometries.push(geo);
   if(crawler.ownedMaterials)crawler.ownedMaterials.push(mat);
 }
}
function convertLeglessToCrawler(z){
 if(!z||z.dead||z.kind==="boss"||z.kind==="crawler"||z.hp<=0||!z.leftLegDetached||!z.rightLegDetached)return;

 // v431: do NOT fold a standing skinned zombie into a crawler. The game already
 // has a dedicated native crawler body/animation/hitbox setup that was authored
 // to crawl low to the ground. Replacing the crippled zombie in-place avoids the
 // inverted-head/blob failures from v428-v430 on walkers, Green Guy and specials.
 const oldIndex=zombies.indexOf(z);
 if(oldIndex<0)return;

 const identity=captureCrawlerIdentity(z);
 const x=z.g.position.x,zp=z.g.position.z,yaw=z.g.rotation.y,
       hp=Math.max(1,z.hp),maxHP=Math.max(hp,z.maxHP||hp),
       oldGround=Number.isFinite(z.groundY)?z.groundY:(z.g.position.y||0),
       oldCool=z.cool||0,oldGroan=z.groan||1,oldPhase=z.phase||0;

 makeZombie(x,zp,oldIndex,"crawler");
 const crawler=zombies.pop();
 if(!crawler)return;

 crawler.g.position.x=x;crawler.g.position.z=zp;
 crawler.g.rotation.y=yaw;crawler.groundY=oldGround;crawler.g.position.y=oldGround+.003;
 crawler.hp=hp;crawler.maxHP=maxHP;
 crawler.cool=oldCool;crawler.groan=oldGroan;crawler.phase=oldPhase;
 crawler.navForceRepath=true;crawler.navCheckT=0;crawler.think=0;
 crawler.stagger=.08;
 const preservedUpper=transferCrawlerUpperVisual(z,crawler);
 if(!preservedUpper)applyCrawlerIdentity(crawler,identity);

 zombies[oldIndex]=crawler;
 releaseZombieVisual(z);
 show("CRIPPLED — CRAWLER");
}
function detachLeg(z,side){
 const key=side==="left"?"leftLegDetached":"rightLegDetached";
 if(z[key])return;
 if(z.radiatedGreenVisual||z.walkerVisual){
   const customBones=z.radiatedGreenBones||z.walkerBones;
   const bone=customBones?.get(side==="left"?"L_UpperLeg":"R_UpperLeg");
   const p=new THREE.Vector3();if(bone)bone.getWorldPosition(p);else p.copy(z.g.position).add(new THREE.Vector3(side==="left"?-.15:.15,.72,0));
   z[key]=true;hideRigLimb(z,side==="left"?"L_UpperLeg":"R_UpperLeg");
   if(z.hitMeshes){
     for(const o of z.hitMeshes)if(o?.userData?.part===(side==="left"?"leftLeg":"rightLeg"))o.raycast=()=>{};
     z.hitMeshes=z.hitMeshes.filter(o=>o.userData.part!==(side==="left"?"leftLeg":"rightLeg"));
   }
   if(side==="left")z.legL=new THREE.Group();else z.legR=new THREE.Group();
   z.legDamage=3;burst(p,true);noise(.15,.25,280);show(side==="left"?"LEFT LEG OFF":"RIGHT LEG OFF");
   if(z.leftLegDetached&&z.rightLegDetached&&z.hp>0)convertLeglessToCrawler(z);
   return;
 }
 const leg=side==="left"?z.legL:z.legR;
 if(!launchDetachedLimb(z,leg,side,true))return;
 z[key]=true;
 hideRigLimb(z,side==="left"?"L_UpperLeg":"R_UpperLeg");
 if(z.hitMeshes)z.hitMeshes=z.hitMeshes.filter(o=>o.userData.part!==(side==="left"?"leftLeg":"rightLeg"));
 if(side==="left")z.legL=new THREE.Group();else z.legR=new THREE.Group();
 z.legDamage=3;
 noise(.15,.25,280);show(side==="left"?"LEFT LEG OFF":"RIGHT LEG OFF");
 if(z.leftLegDetached&&z.rightLegDetached&&z.hp>0)convertLeglessToCrawler(z);
}
function limbDamage(z,part,amount){
 if(part==="leftArm"&&!z.leftArmDetached){z.leftArmHP-=amount;if(z.leftArmHP<=0)detachArm(z,"left")}
 if(part==="rightArm"&&!z.rightArmDetached){z.rightArmHP-=amount;if(z.rightArmHP<=0)detachArm(z,"right")}
 if(part==="leftLeg"&&!z.leftLegDetached){z.leftLegHP-=amount;z.legDamage=Math.min(3,z.legDamage+amount*.55);z.stagger=Math.max(z.stagger,.32);if(z.leftLegHP<=0)detachLeg(z,"left")}
 if(part==="rightLeg"&&!z.rightLegDetached){z.rightLegHP-=amount;z.legDamage=Math.min(3,z.legDamage+amount*.55);z.stagger=Math.max(z.stagger,.32);if(z.rightLegHP<=0)detachLeg(z,"right")}
}

// v415: Hairibar-style UNPOWERED death ragdoll for every zombie death.
// Do not stiffen on first contact; stay loose until the entire corpse is down.
// Hairibar.Ragdoll keeps a simulated skeleton separate from the visible/target
// skeleton, then maps the simulated result back to the visible character.
// Its Unpowered state applies no animation-matching drive: gravity, momentum,
// collisions, damping and soft joint limits keep running until the body truly
// reaches the ground and settles. CITY OUTBREAK ports that behavior to Three.js.
function ragSpringAcceleration(offset,velocity,alpha,dampingRatio,dt,maxAccel){
 const h=Math.max(1/120,Math.min(1/30,dt));
 const k=alpha/(h*h);
 const d=dampingRatio*(2*Math.sqrt(k));
 return THREE.MathUtils.clamp(-k*offset-d*velocity,-maxAccel,maxAccel);
}
// Hairibar's Unpowered joints have no animation drive; only their soft angular
// limits push back. Begin applying the limit spring in the outer 20% of travel,
// matching Hairibar's default limitContactDistanceFactor=.2 behavior.
function ragSoftLimitAcceleration(offset,velocity,limit,dt,maxAccel){
 const start=limit*.80,mag=Math.abs(offset);
 if(mag<=start)return 0;
 const sign=offset<0?-1:1,penetration=offset-sign*start;
 return ragSpringAcceleration(penetration,velocity,.010,.72,dt,maxAccel);
}
const ragContactPos=new THREE.Vector3();
function ragdollBodyContactState(z,r){
 // v415: touching the floor is NOT the same as "finished ragdoll".
 // Hairibar Unpowered bodies stay dynamic after contact; we only permit sleep
 // once the central mass is genuinely down and the limbs have nearly stopped.
 if(!z?.rigVisual&&!z?.walkerBones?.size&&!z?.radiatedGreenBones?.size){
   const down=!!r.rootGrounded;
   return{contacts:down?7:0,hips:down,chest:down,head:down,coreDown:down,allDown:down};
 }
 z.g.updateMatrixWorld(true);
 let contacts=0,hips=false,chest=false,head=false;
 const probes=[
   ["Hips","hips",.24],["Chest","chest",.26],["Head","head",.24],
   ["L_LowerArm","limb",.18],["R_LowerArm","limb",.18],
   ["L_LowerLeg","limb",.18],["R_LowerLeg","limb",.18]
 ];
 for(const [key,role,pad] of probes){
   const b=ragBone(z,key);if(!b)continue;
   b.getWorldPosition(ragContactPos);
   const gy=sampleRagdollGroundY(ragContactPos.x,ragContactPos.z,r.floorY,ragContactPos.y);
   const hit=ragContactPos.y<=gy+pad;
   if(!hit)continue;
   contacts++;
   if(role==="hips")hips=true;
   else if(role==="chest")chest=true;
   else if(role==="head")head=true;
 }
 const coreDown=hips&&chest&&head;
 return{contacts,hips,chest,head,coreDown,allDown:coreDown&&contacts>=5};
}
function blastBoneProfile(role){
 switch(role){
   case "hips": return{lx:.72,ly:.58,lz:.68,airA:.0014,airD:.11,groundA:.010,groundD:.90,maxA:42,gust:.70,inertia:.62,couple:.58,root:.42,impact:.72};
   case "spine":return{lx:.82,ly:.66,lz:.78,airA:.0012,airD:.10,groundA:.009,groundD:.88,maxA:46,gust:.82,inertia:.72,couple:.62,root:.45,impact:.78};
   case "chest":return{lx:.92,ly:.76,lz:.88,airA:.0010,airD:.09,groundA:.008,groundD:.86,maxA:50,gust:.95,inertia:.82,couple:.64,root:.48,impact:.84};
   case "upperLeg":return{lx:1.34,ly:.88,lz:1.08,airA:.00065,airD:.075,groundA:.0065,groundD:.84,maxA:58,gust:1.15,inertia:1.00,couple:.48,root:.36,impact:1.00};
   case "lowerLeg":return{lx:1.58,ly:.16,lz:.20,airA:.00042,airD:.060,groundA:.0055,groundD:.82,maxA:64,gust:1.38,inertia:1.32,couple:.38,root:.30,impact:1.18};
   case "upperArm":return{lx:1.72,ly:1.34,lz:1.62,airA:.00036,airD:.052,groundA:.0048,groundD:.80,maxA:70,gust:1.62,inertia:1.52,couple:.34,root:.28,impact:1.30};
   case "lowerArm":return{lx:1.92,ly:1.18,lz:1.48,airA:.00028,airD:.045,groundA:.0042,groundD:.78,maxA:76,gust:1.88,inertia:1.78,couple:.26,root:.22,impact:1.48};
   case "neck":return{lx:.76,ly:.68,lz:.74,airA:.00075,airD:.070,groundA:.0070,groundD:.86,maxA:58,gust:1.18,inertia:.92,couple:.48,root:.34,impact:.96};
   case "head":return{lx:1.00,ly:.92,lz:1.00,airA:.00052,airD:.060,groundA:.0060,groundD:.84,maxA:64,gust:1.48,inertia:1.18,couple:.40,root:.30,impact:1.12};
   case "torso":return{lx:1.02,ly:.82,lz:.96,airA:.00090,airD:.085,groundA:.0075,groundD:.86,maxA:54,gust:1.05,inertia:.88,couple:.56,root:.42,impact:.90};
   default:return{lx:1.40,ly:1.00,lz:1.18,airA:.00050,airD:.060,groundA:.0055,groundD:.82,maxA:62,gust:1.30,inertia:1.12,couple:.40,root:.30,impact:1.00};
 }
}
function beginRagdoll(z,force=1,blastOrigin=null){
 if(z.ragdoll)return;
 // v421: capture/release the exact live pose. Do not normalize the holder or
 // hips before ragdoll starts; that was silently snapping every corpse toward
 // the same pre-fall setup. Stop animation only after leaving the current bone
 // transforms exactly where the last live frame put them.
 if(z.mixer)z.mixer.stopAllAction();
 z.g.rotation.order="YXZ";z.falling=true;

 const isBlast=!!blastOrigin;
 // v421: death has no authored fall direction. Pick a one-time release imbalance
 // from the exact live pose, like letting go of a loose skeleton. This seed is
 // never re-applied after release, so two deaths do not follow the same path.
 const releaseAngle=rnd()*Math.PI*2,releaseTilt=1.15+rnd()*1.55;
 const releaseX=Math.cos(releaseAngle)*releaseTilt,releaseZ=Math.sin(releaseAngle)*releaseTilt;
 const ox=isBlast?blastOrigin.x:px,oz=isBlast?blastOrigin.z:pz;
 const d=Math.hypot(z.g.position.x-ox,z.g.position.z-oz)||1;
 const awayX=(z.g.position.x-ox)/d,awayZ=(z.g.position.z-oz)/d;
 const power=Math.max(.65,Math.min(isBlast?4.6:2.6,force));
 // v420: an ordinary gunshot death inherits the zombie's actual movement.
 // Death removes control; it does not erase momentum or add a fake stop first.
 const inheritedVX=THREE.MathUtils.clamp(Number.isFinite(z.motionVX)?z.motionVX:0,-6.5,6.5);
 const inheritedVZ=THREE.MathUtils.clamp(Number.isFinite(z.motionVZ)?z.motionVZ:0,-6.5,6.5);
 const directVisual=z?.walkerVisual||null;
 const directVisibleBones=!!directVisual;

 const rag=z.ragdoll={
   t:0,bones:[],blast:isBlast,unpowered:true,active:true,power,settleT:0,
   grounded:false,rootGrounded:false,bodyGrounded:false,fullBodyDown:false,
   contactCount:0,maxContactCount:0,bounceCount:0,
   floorY:Number.isFinite(z.groundY)?z.groundY:z.g.position.y,
   baseX:z.g.rotation.x,baseY:z.g.rotation.y,baseZ:z.g.rotation.z,
   directVisual,
   holderStartY:directVisual?directVisual.position.y:0,
   holderDrop:0,holderVy:0,holderDropTarget:-(.52+rnd()*.16),
   // v422: the visible skeleton now does the collapsing. Keep root rotation small
   // for direct walkers so the corpse cannot look like a rigid plank pivoting at
   // its feet. Blast retains some whole-body tumble, but substantially less.
   ravx:isBlast?(rnd()-.5)*(directVisibleBones?(1.25+power*.30):(2.35+power*.62)):(directVisibleBones?(rnd()-.5)*.50:releaseX),
   ravy:isBlast?(rnd()-.5)*(directVisibleBones?(1.05+power*.24):(1.85+power*.46)):(directVisibleBones?(rnd()-.5)*.16:(rnd()-.5)*.22),
   ravz:isBlast?(rnd()-.5)*(directVisibleBones?(1.35+power*.32):(2.55+power*.68)):(directVisibleBones?(rnd()-.5)*.50:releaseZ),
   rootPhase:rnd()*6.283,
   vx:isBlast?awayX*(2.38+1.48*rnd())*power+(rnd()-.5)*.72:inheritedVX*.94,
   vz:isBlast?awayZ*(2.38+1.48*rnd())*power+(rnd()-.5)*.72:inheritedVZ*.94,
   vy:isBlast?(2.62+1.68*rnd())*power:0,
   hips:null,hipsStartY:0,hipsTargetY:0,
   bodyPbd:null
 };
 rag.bodyPbd=buildBodyPbd(z,rag,isBlast,blastOrigin,inheritedVX*.94,inheritedVZ*.94,power);
 if(rag.bodyPbd)return;

 const add=(o,role)=>{
   if(!o||!o.parent)return;
   const p=blastBoneProfile(role);
   // v421: each joint gets only an initial release velocity. After this instant
   // there is no wobble oscillator or authored death target driving it.
   const spin=(rag.blast?(3.05+.54*rag.power):(2.20+.36*rag.power))*p.inertia;
   rag.bones.push({
     o,role,p,
     sx:o.rotation.x,sy:o.rotation.y,sz:o.rotation.z,
     ox:0,oy:0,oz:0,
     avx:(rnd()-.5)*(rag.blast?2.20:1.75)*spin,
     avy:(rnd()-.5)*(rag.blast?2.00:1.55)*spin,
     avz:(rnd()-.5)*(rag.blast?2.20:1.75)*spin,
     parentState:null
   });
 };

 const ragHips=ragBone(z,"Hips");
 if(ragHips){
   const hips=ragHips;
   rag.hips=hips;
   if(hips){rag.hipsStartY=hips.position.y;rag.hipsTargetY=hips.position.y}

   add(ragBone(z,"L_UpperLeg"),"upperLeg");
   add(ragBone(z,"R_UpperLeg"),"upperLeg");
   add(ragBone(z,"L_LowerLeg"),"lowerLeg");
   add(ragBone(z,"R_LowerLeg"),"lowerLeg");

   add(hips,"hips");
   add(ragBone(z,"Spine"),"spine");
   add(ragBone(z,"Chest"),"chest");

   add(ragBone(z,"L_UpperArm"),"upperArm");
   add(ragBone(z,"L_LowerArm"),"lowerArm");
   add(ragBone(z,"R_UpperArm"),"upperArm");
   add(ragBone(z,"R_LowerArm"),"lowerArm");

   add(ragBone(z,"Neck"),"neck");
   add(ragBone(z,"Head"),"head");
 }else{
   add(z.legL,"upperLeg");add(z.kneeL,"lowerLeg");
   add(z.legR,"upperLeg");add(z.kneeR,"lowerLeg");
   add(z.torso,"torso");
   add(z.armL,"upperArm");add(z.elbowL,"lowerArm");
   add(z.armR,"upperArm");add(z.elbowR,"lowerArm");
   add(z.head,"head");
 }

 const byObject=new Map(rag.bones.map(b=>[b.o,b]));
 for(const b of rag.bones){
   let p=b.o.parent;
   while(p&&p!==z.g&&!byObject.has(p))p=p.parent;
   b.parentState=byObject.get(p)||null;
 }
}
function updateRagdoll(z,dt){
 if(!z.ragdoll)beginRagdoll(z);
 const r=z.ragdoll;r.t+=dt;
 if(r.bodyPbd){updateBodyPbd(z,r,dt);return}

 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};

 if(r.unpowered){
   const rootDamp=Math.exp(-dt*(r.fullBodyDown?.55:.08));
   z.g.rotation.x+=r.ravx*dt;
   z.g.rotation.y+=r.ravy*dt;
   z.g.rotation.z+=r.ravz*dt;
   r.ravx*=rootDamp;r.ravy*=rootDamp;r.ravz*=rootDamp;
 }
 // v422: ordinary custom-model deaths collapse by losing support vertically,
 // instead of needing large root rotation to "tip" the whole zombie over.
 if(r.directVisual&&!r.blast){
   if(!r.fullBodyDown){
     r.holderVy-=9.2*dt;
     r.holderDrop+=r.holderVy*dt;
     if(r.holderDrop<r.holderDropTarget){
       r.holderDrop=r.holderDropTarget;
       if(r.holderVy<0)r.holderVy=-r.holderVy*.08;
     }
   }else{
     r.holderVy*=Math.exp(-dt*5);
   }
   r.directVisual.position.y=r.holderStartY+r.holderDrop;
 }

 z.g.position.x+=r.vx*dt;z.g.position.z+=r.vz*dt;
 const drag=Math.exp(-dt*(r.fullBodyDown?(r.blast?.95:.80):(r.blast?.28:.16)));
 r.vx*=drag;r.vz*=drag;
 r.vy-=(r.blast?6.35:5.4)*dt;
 z.g.position.y+=r.vy*dt;
 r.floorY=sampleRagdollGroundY(z.g.position.x,z.g.position.z,r.floorY,z.g.position.y);
 const floorContact=r.floorY-.08;
 r.rootGrounded=false;
 if(z.g.position.y<=floorContact+.018&&r.vy<=0){
   z.g.position.y=floorContact;r.rootGrounded=true;
   // Explosions may bounce the whole body a few times. Ordinary gunshot deaths
   // keep only a tiny root rebound; their visible bounce comes from loose joints.
   const maxBounces=r.blast?3:1,minImpact=r.blast?-.52:-.34;
   if(r.vy<minImpact&&r.bounceCount<maxBounces){
     const bounce=r.blast?([.34,.20,.10][r.bounceCount]||.08):.08;
     r.vy=-r.vy*bounce;
     r.vx*=r.blast?(r.bounceCount===0?.68:.52):.72;
     r.vz*=r.blast?(r.bounceCount===0?.68:.52):.72;
     r.bounceCount++;
     r.rootGrounded=false;
   }else{
     r.vy=0;r.vx*=r.blast?.72:.80;r.vz*=r.blast?.72:.80;
   }
 }

 // v417: do NOT fake per-bone gravity with an inward pendulum torque.
 // Hairibar's bones can translate as separate rigidbodies; our support rig cannot.
 // The v416 torque therefore pulled every child under its parent and compacted the
 // corpse into a ball. Keep Unpowered joints alive with a tiny unbiased free-drift
 // torque instead: no target pose, no center-seeking force, and no inward bias.
 for(const b of r.bones){
   const p=b.p;
   const steps=Math.max(1,Math.min(3,Math.ceil(dt/(1/60)))),h=dt/steps;
   for(let step=0;step<steps;step++){
     // v421: true release state. No oscillator, target pose, root steering or
     // animation-matching force is allowed after death. Only soft anatomical
     // limits and passive drag remain active between real contact events.
     const kneeAngle=b.sx+b.ox;
     const ax=b.role==="lowerLeg"
       ?(kneeAngle<.02?THREE.MathUtils.clamp((.02-kneeAngle)*38-b.avx*4,0,p.maxA*1.25)
        :kneeAngle>1.48?THREE.MathUtils.clamp((1.48-kneeAngle)*38-b.avx*4,-p.maxA*1.25,0):0)
       :ragSoftLimitAcceleration(b.ox,b.avx,p.lx,h,p.maxA*1.25);
     const ay=ragSoftLimitAcceleration(b.oy,b.avy,p.ly,h,p.maxA*1.25);
     const az=ragSoftLimitAcceleration(b.oz,b.avz,p.lz,h,p.maxA*1.25);
     b.avx+=ax*h;b.avy+=ay*h;b.avz+=az*h;
     const angularDrag=Math.exp(-h*(r.fullBodyDown?.34:.030));
     b.avx*=angularDrag;b.avy*=angularDrag;b.avz*=angularDrag;
     b.ox+=b.avx*h;b.oy+=b.avy*h;b.oz+=b.avz*h;

     // Emergency projection only beyond the soft limit, equivalent to Hairibar's
     // joint projection safety. It prevents a huge shock from exploding the rig.
     const project=(axis,limit,velAxis)=>{
       const hard=limit*1.10,v=b[axis];
       if(v>hard){b[axis]=hard;b[velAxis]=-Math.abs(b[velAxis])*.10}
       else if(v<-hard){b[axis]=-hard;b[velAxis]=Math.abs(b[velAxis])*.10}
     };
     if(b.role==="lowerLeg"){
       const knee=b.sx+b.ox;
       if(knee<-.06){b.ox=-.06-b.sx;b.avx=Math.abs(b.avx)*.08}
       else if(knee>1.58){b.ox=1.58-b.sx;b.avx=-Math.abs(b.avx)*.08}
     }else project("ox",p.lx,"avx");
     project("oy",p.ly,"avy");project("oz",p.lz,"avz");
   }
   b.o.rotation.x=b.sx+b.ox;b.o.rotation.y=b.sy+b.oy;b.o.rotation.z=b.sz+b.oz;
 }

 const contact=ragdollBodyContactState(z,r);
 r.contactCount=contact.contacts;
 r.bodyGrounded=contact.contacts>0;
 r.fullBodyDown=contact.allDown;
 r.grounded=r.fullBodyDown;

 // Every NEW body contact gets a small collision response. This approximates the
 // separate rigidbody contacts Hairibar/PhysX would generate and keeps hands,
 // elbows, knees and head flopping after the first thing touches the pavement.
 // Ground contact should kill whole-body pinwheel energy, not freeze the joints.
 // The visible "pinned and spinning" corpse came from preserving root angular
 // velocity while also adding a fresh random root jolt on every new contact.
 // v420: first contact must not pin the corpse. Leave root angular
 // momentum alone while only a hand/foot/hip is touching; add friction only
 // after the core (hips + chest + head) is actually down.
 if(r.rootGrounded||contact.coreDown){
   // Root friction stops the corpse from rotating/pinwheeling on the pavement.
   // This does NOT damp the individual bones, which remain loose until settled.
   const rootGroundDrag=Math.exp(-dt*(r.rootGrounded?6.0:(contact.allDown?2.15:1.10)));
   r.ravx*=rootGroundDrag;r.ravy*=rootGroundDrag;r.ravz*=rootGroundDrag;
 }
 if(contact.contacts>r.maxContactCount){
   const newHits=contact.contacts-r.maxContactCount;
   const jolt=(r.blast?.20:.13)*Math.max(1,newHits);
   // Keep impact life in the individual limbs only. Do not spin the entire
   // corpse around its ground contact point.
   for(const b of r.bones){
     const impact=b.p?.impact||1;
     b.avx+=(rnd()-.5)*jolt*1.45*impact;
     b.avy+=(rnd()-.5)*jolt*1.15*impact;
     b.avz+=(rnd()-.5)*jolt*1.60*impact;
   }
   r.maxContactCount=contact.contacts;
 }

 let maxBoneSpin=0;
 for(const b of r.bones)maxBoneSpin=Math.max(maxBoneSpin,Math.abs(b.avx||0),Math.abs(b.avy||0),Math.abs(b.avz||0));
 const rootSpin=Math.max(Math.abs(r.ravx||0),Math.abs(r.ravy||0),Math.abs(r.ravz||0));

 // "Sleep" is allowed only after the corpse is genuinely lying down:
 // hips + chest + head on the ground, at least five body probes touching,
 // and both root and every joint staying nearly motionless for 1.25 seconds.
 const settled=contact.allDown&&Math.abs(r.vy)<.035&&Math.hypot(r.vx,r.vz)<.07&&rootSpin<.055&&maxBoneSpin<.070;
 r.settleT=settled?r.settleT+dt:0;
 if(r.settleT>1.25){r.active=false;z.falling=false}else z.falling=true;
}
function killZ(z,hs,p,ragForce=1,ragOrigin=null){
 if(z.dead)return;
 z.dead=true;if(z.marker)z.marker.visible=false;z.corpseAge=0;z.knockdown=null;
 // v421: dead bodies have no navigation state at all. The active-zombie loop
 // already excludes them; clear any cached route too so nothing can steer a corpse.
 z.navPath=null;z.navIndex=0;z.navForceRepath=false;z.navCheckT=0;
 beginRagdoll(z,ragForce,ragOrigin);kills++;if(z.kind==="boss"){cash+=z.bossBounty;spawnBossRewardCache(z.g.position.clone());currentBoss=null;hideBossHud(bossHUD);show("BOSS SLAIN — $"+z.bossBounty+" BOUNTY + REWARD CACHE");bossWaveName=""}else{cash+=hs?45:25;spawnZombieDrop(z.g.position)}hitMark(hs);
 if(hs){heads++;headS();burst(p,true);if(z.head&&z.head.parent)z.g.remove(z.head)}
 else{noise(.12,.16,260)}
 // Dead bodies keep the silhouette but stop expensive shadow work immediately.
 z.g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}}); z.g.rotation.order="YXZ";
 ui()
}
function showDeathScreen(){
 running=false;dying=true;paused=false;pauseOverlay.classList.remove("show");pauseBtn.classList.remove("show");stopAuto();clearKeys();setAim(false);
 const elapsed=runStartTime>0?gameTimeNow()-runStartTime:0;
 renderDeathStats({
  kills:String(kills),
  time:formatRunTime(elapsed),
  wave:String(wave),
  rounds:String(Math.max(0,wave-1))
 });
 renderDeathScreenVisibility(death,true);
 if(document.pointerLockElement===cv)document.exitPointerLock?.();
 document.body.style.cursor="default";
}
function bite(z){if(z.cool>0)return;z.cool=z.attack;z.attackAnim=.62;z.attackSide=Math.random()>.5?1:-1;rigTransient(z,"Attack",.48);let armPenalty=((!z.armL.parent?1:0)+(!z.armR.parent?1:0))*.2,dealt=z.damage*(1-armPenalty);health=Math.max(0,health-dealt);resetHealthRegenDelay();biteS();flashDamageOverlay(damage,140);ui();if(health<=0){showDeathScreen()}else{const shownDamage=Math.round(dealt*10)/10;show("-"+shownDamage+" HEALTH")}}
function reload(w=weapon){
 const a=ammoState[w],cap=maxMag(w),infiniteReserve=w==="pistol";
 if(paused||reloading||!a||a.mag===cap||(!infiniteReserve&&a.reserve<=0)||dying)return false;
 const seq=++reloadSequence;
 if(w==="m240")stopM240FireAudio();
 setAim(false);
 if(w==="shotgun"){
   const shellDuration=Math.max(360,560-reloadLevel*45);
   const finishShotgunReload=()=>{
     if(seq!==reloadSequence)return;
     finishReloadMagazineFX();reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";ui()
   };
   const loadShell=()=>{
     if(seq!==reloadSequence||!reloading||reloadWeapon!==w)return;
     if(dying||a.mag>=cap||a.reserve<=0){finishShotgunReload();return}
     reloadStartedAt=gameTimeNow();reloadDurationMs=shellDuration;shellLoadS();
     gameTimeout(()=>{
       if(seq!==reloadSequence||!reloading||reloadWeapon!==w)return;
       if(!dying&&a.mag<cap&&a.reserve>0){a.mag++;a.reserve--;ui()}
       if(dying||a.mag>=cap||a.reserve<=0)finishShotgunReload();
       else loadShell()
     },shellDuration)
   };
   reloading=true;reloadWeapon=w;beginReloadMagazineFX();show("RELOADING");loadShell();return true
 }
 const duration=w==="grenadeLauncher"?Math.max(1100,1550-reloadLevel*90):w==="pistol"?Math.max(1250,1750-reloadLevel*90):DETACHABLE_RELOAD_WEAPONS.has(w)?Math.max(760,1120-reloadLevel*90):Math.max(420,950-reloadLevel*120);
 reloading=true;reloadStartedAt=gameTimeNow();reloadDurationMs=duration;reloadWeapon=w;beginReloadMagazineFX();reloadS();show("RELOADING");
 gameTimeout(()=>{
   if(seq!==reloadSequence||!reloading||reloadWeapon!==w)return;
   const n=infiniteReserve?(cap-a.mag):Math.min(cap-a.mag,a.reserve);
   a.mag+=n;if(!infiniteReserve)a.reserve-=n;finishReloadMagazineFX();reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";ui()
 },duration);
 return true
}
function autoReloadIfEmpty(w=weapon){
 const a=ammoState[w];
 if(a&&a.mag<=0&&(w==="pistol"||a.reserve>0)&&!reloading&&!dying)reload(w)
}
const ray=new THREE.Raycaster(),rayAim=new THREE.Vector2(),rayTargets=[];
const cityProjectileRay=new THREE.Raycaster(),cityProjectileDir=new THREE.Vector3();
const cityProjectileNormal=new THREE.Vector3(),cityProjectileNormalMatrix=new THREE.Matrix3();
function validCityProjectileHit(hit){
 let o=hit&&hit.object;
 while(o&&o!==newCityRoot){
   if(o.visible===false||o.userData?.replacedStreetLamp)return false;
   o=o.parent;
 }
 return !!hit&&o===newCityRoot;
}
function firstCityProjectileHit(origin,direction,maxDistance){
 if(!newCityRoot||maxDistance<=.001)return null;
 cityProjectileRay.set(origin,direction);
 cityProjectileRay.near=.002;cityProjectileRay.far=maxDistance;
 const hits=cityProjectileRay.intersectObject(newCityRoot,true);
 for(const hit of hits)if(validCityProjectileHit(hit))return hit;
 return null;
}
function cityProjectileSegmentHit(from,to){
 cityProjectileDir.subVectors(to,from);
 const dist=cityProjectileDir.length();
 if(dist<=.001)return null;
 cityProjectileDir.multiplyScalar(1/dist);
 return firstCityProjectileHit(from,cityProjectileDir,dist+.01);
}
function cityProjectileHitNormal(hit){
 if(!hit?.face||!hit.object)return null;
 cityProjectileNormalMatrix.getNormalMatrix(hit.object.matrixWorld);
 return cityProjectileNormal.copy(hit.face.normal).applyMatrix3(cityProjectileNormalMatrix).normalize();
}
function fire(){
 if(!running||paused||reloading||dying||between)return;
 if(weapon==="awm"&&gameTimeNow()<awmReadyAt){show("CYCLING BOLT");return}
 if(A().mag<=0){
  if(weapon==="m240")stopM240FireAudio();
  tone(180,.05,"square",.08);
  if(weapon==="pistol"||A().reserve>0){autoReloadIfEmpty(weapon)}else show("EMPTY");
  return
 }
 A().mag--;if(weapon==="awm")awmReadyAt=gameTimeNow()+1150;weaponSound();if(weapon!=="grenadeLauncher")casing();recoil=Math.min(.3,recoil+wd().recoil);const flashMuzzle=muzzle;flashMuzzle.intensity=10;setTimeout(()=>{if(flashMuzzle)flashMuzzle.intensity=0},42);ui();
 if(weapon==="grenadeLauncher"){
  const firedWeapon=weapon;
  fireGrenadeLauncherRound();
  autoReloadIfEmpty(firedWeapon);
  return
 }
 let didHit=false,headHit=false;rayTargets.length=0;
 for(const z of zombies){if(z.dead)continue;if(z.hitMeshes)rayTargets.push(...z.hitMeshes)}
 for(let pellet=0;pellet<wd().pellets;pellet++){
   const adsSpread=aiming?(weapon==="awm"?.08:weapon==="shotgun"?.62:.38):1;
   // M17 ADS fires through true screen center. The ADS rig itself is pitched
   // so the aligned front/rear iron sights sit on this same point.
   const pistolAdsZero=0;
   // MP5 iron-sight zero: current impacts are just above/right of the sight picture.
   // Shift only the SMG ADS ray slightly left/down; hip fire and other weapons are untouched.
   const smgAdsZeroX=(aiming&&weapon==="smg")?-.018:0;
   const smgAdsZeroY=(aiming&&weapon==="smg")?-.025:0;
   const sx=aimX+smgAdsZeroX+(Math.random()-.5)*wd().spread*adsSpread,
         sy=aimY+pistolAdsZero+smgAdsZeroY+(Math.random()-.5)*wd().spread*adsSpread;
   rayAim.set(sx,sy);ray.setFromCamera(rayAim,cam);
   const cityHit=firstCityProjectileHit(ray.ray.origin,ray.ray.direction,80);
   let hit=ray.intersectObjects(rayTargets,false)[0];
   if(!hit)hit=pointBlankWeaponHit();
   const zombieHitDistance=hit?.point?ray.ray.origin.distanceTo(hit.point):Infinity;
   if(cityHit&&cityHit.distance<=zombieHitDistance+.01){
     impactFX(cityHit.point);
     continue;
   }
   if(hit&&zombieHitDistance<80){
     let z=hit.object.userData.zombie;if(!z)continue;
     let hs=hit.object.userData.isHead===true,part=hit.object.userData.part||"body";
     let shotDamage=wd().body*damageLevel;if(weapon==="shotgun")shotDamage*=shotgunDamageScale(zombieHitDistance);
     const limbHit=part==="leftArm"||part==="rightArm"||part==="leftLeg"||part==="rightLeg";
     const healthDamage=part==="leftArm"||part==="rightArm"?shotDamage*.15:
                        part==="leftLeg"||part==="rightLeg"?shotDamage*.18:shotDamage;
     if(hs){if(z.kind==="boss")z.hp-=Math.max(shotDamage*2.6,4.5);else{const headshotToughness=1+Math.max(0,wave-1)*.2;z.hp-=shotDamage*3/headshotToughness}}else z.hp-=healthDamage;
     if(limbHit)limbDamage(z,part,weapon==="shotgun"?shotDamage*2:shotDamage);
     impactFX(hit.point);burst(hit.point,false);didHit=true;headHit=headHit||hs;
     // v421: a lethal hit skips the living hit-reaction animation completely.
     // The exact current pose is released directly into ragdoll.
     if(z.hp<=0&&!z.dead)killZ(z,hs,hit.point);
     else stagger(z,hs);
   }
 }
 if(didHit)hitMark(headHit);
 autoReloadIfEmpty(weapon);
}
function stopAuto(){triggerHeld=false;stopM240FireAudio();if(autoDelay){clearTimeout(autoDelay);autoDelay=null}if(autoTimer){clearInterval(autoTimer);autoTimer=null}}
function triggerDown(){if(!running||paused||dying||between)return;initAudio();fire();triggerHeld=true;if(autoDelay)clearTimeout(autoDelay);autoDelay=setTimeout(()=>{if(!triggerHeld||weapon==="shotgun"||weapon==="grenadeLauncher"||weapon==="awm")return;autoTimer=setInterval(()=>{if(triggerHeld)fire()},wd().rate)},wd().hold)}
function triggerUp(){stopAuto()}

function openShop(){
 if(document.pointerLockElement===cv)document.exitPointerLock?.();
 if(!shopLowPower){
   shopLowPower=true;
   shopPauseStartedAt=performance.now();
   lastShopRenderAt=0;
   clearKeys();stopAuto();setAim(false);
   if(ac&&ac.state==="running")ac.suspend().catch(()=>{});
 }
 renderShopVisibility(shop,true);
 document.body.style.cursor="default";
 shop.style.cursor="default";
 ui();
}
function buy(type){
 const needUnlock={rifleAmmo:"rifle",smgAmmo:"smg",shotgunAmmo:"shotgun",pistolAmmo:"pistol",dmrAmmo:"dmr",grenadeLauncherAmmo:"grenadeLauncher",m240Ammo:"m240",awmAmmo:"awm"};
 if(needUnlock[type]&&!unlocked[needUnlock[type]]){show("UNLOCK "+weaponDefs[needUnlock[type]].name+" FIRST");return}
 let price=0,ok=false;

 if(type==="rifleAmmo"){price=120;if(cash>=price){cash-=price;ammoState.rifle.reserve+=36;show("+36 M4 CARBINE AMMO");ok=true}}
 if(type==="smgAmmo"){price=110;if(cash>=price){cash-=price;ammoState.smg.reserve+=60;show("+60 MP5 AMMO");ok=true}}
 if(type==="shotgunAmmo"){price=140;if(cash>=price){cash-=price;ammoState.shotgun.reserve+=18;show("+18 SHOTGUN SHELLS");ok=true}}
 if(type==="pistolAmmo"){price=90;if(cash>=price){cash-=price;ammoState.pistol.reserve+=48;show("+48 M17 SIG AMMO");ok=true}}
 if(type==="dmrAmmo"){price=160;if(cash>=price){cash-=price;ammoState.dmr.reserve+=24;show("+24 DMR AMMO");ok=true}}
 if(type==="grenadeLauncherAmmo"){price=225;if(launcherAmmoTotal()>=10){show("GRENADE LAUNCHER AMMO FULL");ok=true}else if(cash>=price){const n=addGrenadeLauncherAmmo(3);cash-=price;show("+"+n+" GRENADE LAUNCHER ROUNDS");ok=true}}
 if(type==="m240Ammo"){price=275;if(cash>=price){cash-=price;ammoState.m240.reserve+=100;show("+100 M240 AMMO");ok=true}}
 if(type==="awmAmmo"){price=300;if(cash>=price){cash-=price;ammoState.awm.reserve+=10;show("+10 AWM ROUNDS");ok=true}}
 if(type==="mag"){price=250;if(cash>=price){cash-=price;magSize+=5;show("MAGAZINE +5");ok=true}}
 if(type==="damage"){price=350;if(cash>=price){cash-=price;damageLevel++;show("DAMAGE LEVEL "+damageLevel);ok=true}}
 if(type==="reload"){price=300;if(cash>=price){cash-=price;reloadLevel++;show("FASTER RELOAD");ok=true}}
 if(type==="rifle"){price=1;if(unlocked.rifle){show("M4 CARBINE ALREADY UNLOCKED");ok=true}else if(cash>=price){cash-=price;unlocked.rifle=true;show("M4 CARBINE UNLOCKED");ok=true}}
 if(type==="smg"){price=1;if(unlocked.smg){show("MP5 ALREADY UNLOCKED");ok=true}else if(cash>=price){cash-=price;unlocked.smg=true;show("MP5 UNLOCKED");ok=true}}
 if(type==="grenade"){price=175;if(cash>=price){cash-=price;grenades++;show("+1 GRENADE");ok=true}}
 if(type==="nuke"){price=100;if(cash>=price){cash-=price;nukes++;show("TACTICAL NUKE ACQUIRED");ok=true}}
 if(type==="pistol"){price=1;if(unlocked.pistol){show("M17 SIG ALREADY UNLOCKED");ok=true}else if(cash>=price){cash-=price;unlocked.pistol=true;show("M17 SIG UNLOCKED");ok=true}}
 if(type==="dmr"){price=1;if(unlocked.dmr){show("DMR ALREADY UNLOCKED");ok=true}else if(cash>=price){cash-=price;unlocked.dmr=true;show("DMR UNLOCKED");ok=true}}
 if(type==="grenadeLauncher"){price=1;if(unlocked.grenadeLauncher){show("GRENADE LAUNCHER ALREADY UNLOCKED");ok=true}else if(cash>=price){cash-=price;unlocked.grenadeLauncher=true;ammoState.grenadeLauncher.mag=6;ammoState.grenadeLauncher.reserve=0;show("GRENADE LAUNCHER UNLOCKED — 6 ROUND MAGAZINE");ok=true}}
 if(type==="m240"){price=1;if(unlocked.m240){show("M240 ALREADY UNLOCKED");ok=true}else if(cash>=price){cash-=price;unlocked.m240=true;ammoState.m240.mag=100;ammoState.m240.reserve=200;show("M240 LMG UNLOCKED");ok=true}}
 if(type==="awm"){price=1;if(unlocked.awm){show("AWM ULTIMATE ALREADY UNLOCKED");ok=true}else if(cash>=price){cash-=price;unlocked.awm=true;ammoState.awm.mag=5;ammoState.awm.reserve=20;show("AWM ULTIMATE UNLOCKED");ok=true}}
 if(type==="shotgun"){price=1;if(unlocked.shotgun){show("SHOTGUN ALREADY UNLOCKED");ok=true}else if(cash>=price){cash-=price;unlocked.shotgun=true;show("SHOTGUN UNLOCKED");ok=true}}
 if(!ok&&cash<price)show("NOT ENOUGH CASH");ui()
}
setupShopBuyButtons(shop,buy);
function clearRoundCorpses(){
 // Anything still dead when the next round starts is removed in one cheap sweep.
 for(const z of zombies){if(z.dead&&z.g&&z.g.parent)releaseZombieVisual(z)}
 zombies=zombies.filter(z=>!z.dead);
 // Detached zombie limbs are corpse debris too; clear them between rounds.
 for(let i=parts.length-1;i>=0;i--){if(parts[i].limb){if(parts[i].q.parent)scene.remove(parts[i].q);parts.splice(i,1)}}
}
function beginBreak(){
 if(between||dying)return;
 between=true;pauseBtn.classList.remove("show");stopAuto();clearKeys();setAim(false);
 const breakTitle="WAVE "+wave+" COMPLETE";
 let breakSubtitle="";
 if(isBossWave(wave+1)){ensureBossWaveName(wave+1);breakSubtitle="SHOP OPEN — NEXT ROUND IS A BOSS FIGHT";renderShopNote(shopNote,"WARNING: NEXT ROUND IS A BOSS FIGHT — "+bossWaveName+".")}else{breakSubtitle="SHOP OPEN — PRESS READY WHEN YOU ARE SET";renderShopNote(shopNote,"Take your time. The next wave will not start until you press Ready.")}
 showAnnouncement({container:announce,titleEl:big,subtitleEl:small,title:breakTitle,subtitle:breakSubtitle});
 tone(392,.18,"square",.12);tone(523,.2,"square",.14,.18);
 const breakRun=runSequence;
 setTimeout(()=>{if(breakRun!==runSequence||!between||dying)return;hideAnnouncement(announce);openShop()},850);
}
function readyNextWave(){
 if(!between||dying)return;
 renderShopVisibility(shop,false);
 document.body.style.cursor="";
 if(shopLowPower){
   const now=performance.now();
   shopPausedAccumulatedMs+=Math.max(0,now-shopPauseStartedAt);
   shopPauseStartedAt=0;shopLowPower=false;last=now;lastShopRenderAt=0;
   clearKeys();
   if(ac&&audioOn)ac.resume().catch(()=>{});
 }
 between=false;pauseBtn.classList.add("show");
 clearRoundCorpses();
 if(document.pointerLockElement!==cv){try{cv.requestPointerLock?.()}catch(_){}}
 wave++;
 // Every new round begins fully recovered so the player is ready immediately.
 health=100;healthRegenCooldown=0;healthRegenShown=100;
 sprintEnergy=100;sprintLocked=false;updateSprintUI();
 ammoState.rifle.reserve+=18+wave*2;
 let waveTitle="",waveSubtitle="";
 if(isBossWave(wave)){ensureBossWaveName(wave);waveTitle="WAVE "+wave+" — BOSS FIGHT";waveSubtitle=bossWaveName+" IS COMING"}else{waveTitle="WAVE "+wave;waveSubtitle=diff(wave).count+" ZOMBIES INCOMING"}
 showAnnouncement({container:announce,titleEl:big,subtitleEl:small,title:waveTitle,subtitle:waveSubtitle});
 tone(440,.08,"square",.13);tone(660,.1,"square",.14,.1);tone(880,.16,"square",.15,.22);
 spawnWave();ui();cv.focus();
 setTimeout(()=>hideAnnouncement(announce),750);
}
setupReadyNextButton(readyNextWave);

const thrown=[];
function launcherAmmoTotal(){const a=ammoState.grenadeLauncher;return a.mag+a.reserve}
function addGrenadeLauncherAmmo(n){
 const a=ammoState.grenadeLauncher,space=Math.max(0,10-launcherAmmoTotal());
 const add=Math.min(space,n);
 a.reserve+=add;
 return add;
}
function fireGrenadeLauncherRound(){
 const q=new THREE.Mesh(new THREE.SphereGeometry(.10,10,7),M(0x4c5b36,.52));
 const band=new THREE.Mesh(new THREE.TorusGeometry(.105,.018,7,12),M(0xc79a45,.38));band.rotation.x=Math.PI/2;q.add(band);
 const start=new THREE.Vector3();cam.getWorldPosition(start);
 const dir=new THREE.Vector3();cam.getWorldDirection(dir);
 // A close zombie can occupy the normal .85 m projectile spawn point. Detect that
 // muzzle-space contact first so the round impacts the zombie instead of appearing
 // on the far side of it.
 const fx=-Math.sin(yaw),fz=-Math.cos(yaw),spec=weaponContactSpec("grenadeLauncher");
 let closeImpact=null,closeAlong=Infinity;
 for(const z of zombies){
   if(!z||z.dead)continue;
   const dx=z.g.position.x-px,dz=z.g.position.z-pz,along=dx*fx+dz*fz;
   if(along<.05||along>1.20)continue;
   const lateral=Math.abs(dx*fz-dz*fx),pad=z.kind==="boss"?.52:z.kind==="crawler"?.16:.30;
   if(lateral<=spec.width+pad&&along<closeAlong){closeImpact=z;closeAlong=along}
 }
 if(closeImpact){
   q.position.copy(start).addScaledVector(dir,Math.max(.18,Math.min(.70,closeAlong-.18)));q.position.y-=.08;
   scene.add(q);explodeLauncherRound({q,v:new THREE.Vector3(),fuse:0,launcher:true});return;
 }
 q.position.copy(start).addScaledVector(dir,.85);q.position.y-=.08;
 const vel=dir.multiplyScalar(25);vel.y+=1.1;scene.add(q);
 thrown.push({q,v:vel,fuse:3.0,launcher:true});
}
function captureKnockdownRest(pbd){
 return{
   holderPos:pbd.holder.position.clone(),holderQuat:pbd.holder.quaternion.clone(),
   bones:[...pbd.bones.values()].filter(Boolean).map(b=>({b,q:b.quaternion.clone()}))
 };
}
function addKnockdownBlastImpulse(z,k,origin,strength){
 const p=k?.bodyPbd;if(!p)return;
 const power=Math.max(.55,Math.min(2.2,strength)),cy=z.g.position.y+1;
 const centerD=Math.hypot(z.g.position.x-origin.x,cy-origin.y,z.g.position.z-origin.z);
 for(const n of p.nodes.values()){
   const dx=n.pos.x-origin.x,dy=n.pos.y-origin.y,dz=n.pos.z-origin.z,d=Math.hypot(dx,dy,dz)||1,h=Math.hypot(dx,dz)||1;
   const asym=THREE.MathUtils.clamp(1+(centerD-d)*.24,.82,1.48),launch=(5.7+power*2.45)*asym;
   n.vel.x+=dx/h*launch;n.vel.z+=dz/h*launch;n.vel.y+=(4.3+power*1.65)*asym;
 }
 p.settleT=0;k.active=true;k.recovering=false;k.t=0;z.falling=true;
}
function beginKnockdown(z,origin,strength=1){
 if(!z||z.dead||z.kind==="boss")return;
 if(z.knockdown?.bodyPbd){addKnockdownBlastImpulse(z,z.knockdown,origin,strength);return}

 if(z.mixer)z.mixer.stopAllAction();
 z.attackAnim=0;z.cool=Math.max(z.cool,.8);z.stagger=0;z.blastT=0;
 const power=Math.max(.55,Math.min(2.2,strength));
 const rag={
   t:0,bones:[],blast:true,unpowered:true,active:true,power,settleT:0,
   grounded:false,rootGrounded:false,bodyGrounded:false,fullBodyDown:false,
   contactCount:0,maxContactCount:0,bounceCount:0,
   floorY:Number.isFinite(z.groundY)?z.groundY:z.g.position.y,
   bodyPbd:null
 };
 const vx=THREE.MathUtils.clamp(Number.isFinite(z.motionVX)?z.motionVX:0,-6.5,6.5),
       vz=THREE.MathUtils.clamp(Number.isFinite(z.motionVZ)?z.motionVZ:0,-6.5,6.5);
 rag.bodyPbd=buildBodyPbd(z,rag,true,origin,vx*.82,vz*.82,power,{followRoot:true});
 if(!rag.bodyPbd){z.stagger=Math.max(z.stagger,.42);return}
 const rest=captureKnockdownRest(rag.bodyPbd);
 z.knockdown={
   bodyPbd:rag.bodyPbd,rag,rest,t:0,minDown:.58+power*.18,
   recovering:false,recoverT:0,recoverDur:.72,
   recoverHolderPos:null,recoverHolderQuat:null,recoverBones:null,
   recoverGY:z.g.position.y
 };
 z.falling=true;
}
function updateKnockdown(z,dt){
 const k=z.knockdown;if(!k)return false;k.t+=dt;
 const rag=k.rag,p=k.bodyPbd;
 if(!k.recovering){
   if(rag.active!==false)updateBodyPbd(z,rag,dt);
   if(rag.active===false&&k.t>=k.minDown){
     k.recovering=true;k.recoverT=0;
     k.recoverHolderPos=p.holder.position.clone();k.recoverHolderQuat=p.holder.quaternion.clone();
     k.recoverBones=k.rest.bones.map(x=>({b:x.b,from:x.b.quaternion.clone(),to:x.q}));
     k.recoverGY=z.g.position.y;
     z.groundY=sampleZombieGroundY(z.g.position.x,z.g.position.z,z.groundY||0);
   }
   return true;
 }
 k.recoverT+=dt;
 const raw=Math.max(0,Math.min(1,k.recoverT/k.recoverDur)),u=raw*raw*(3-2*raw);
 p.holder.position.lerpVectors(k.recoverHolderPos,k.rest.holderPos,u);
 p.holder.quaternion.copy(k.recoverHolderQuat).slerp(k.rest.holderQuat,u);
 for(const x of k.recoverBones)x.b.quaternion.copy(x.from).slerp(x.to,u);
 z.g.position.y=THREE.MathUtils.lerp(k.recoverGY,z.groundY||0,u);
 p.holder.updateMatrixWorld(true);
 if(raw>=1){
   z.falling=false;z.knockdown=null;z.stagger=.10;z.think=0;
   if(z.mixer&&z.rigBase){
     z.mixer.stopAllAction();z.rigBase.reset().fadeIn(.10).play();
     z.rigTransient=null;z.rigTransientT=0;
   }
   return false;
 }
 return true;
}
function blastReact(z,origin,strength=1){
 if(!z||z.dead)return;
 if(z.kind==="boss"){
   // Bosses flinch from explosives but never enter the old sideways blast-stagger pose.
   z.blastT=0;z.blastVX=0;z.blastVZ=0;z.blastLean=0;z.stagger=0;
   if(z.mixer)rigTransient(z,"Hit",Math.min(.34,.20+.06*strength));
   z.cool=Math.max(z.cool,.16);
   return;
 }
 beginKnockdown(z,origin,strength);
}
function explodeLauncherRound(g){
 noise(.34,.95,1100);tone(46,.42,"sine",.48);tone(92,.20,"square",.20);
 const p=g.q.position.clone();scene.remove(g.q);
 for(let i=0;i<34;i++){let q=new THREE.Mesh(FX.explosionGeo,i%4?FX.launcherDustMat:FX.launcherFlashMat);q.scale.setScalar(.40+rnd()*1.0);q.position.copy(p);scene.add(q);parts.push({q,v:new THREE.Vector3((rnd()-.5)*12,rnd()*7,(rnd()-.5)*12),life:.30+rnd()*.45})}
 for(const z of living()){
   const d=z.g.position.distanceTo(p);
   if(d<6.5){
     const blast=Math.max(2,Math.ceil((7-d)*1.55))*damageLevel;
     const force=Math.max(.35,1-d/6.5);
     z.hp-=blast;
     if(z.hp<=0&&!z.dead)killZ(z,false,z.g.position.clone().add(new THREE.Vector3(0,1.2,0)),3.00+force*3.35,p);
     else blastReact(z,p,.70+force*1.15)
   }
 }
}
function throwGrenade(){
 if(!running||paused||dying||between||grenades<=0)return;
 if(!grenadeModelTemplate){show("GRENADE MODEL LOADING");return}
 grenades--;ui();tone(260,.04,"square",.06);
 const q=grenadeModelTemplate.clone(true);
 q.name="ThrownGrenadeGLB";
 const start=new THREE.Vector3();cam.getWorldPosition(start);q.position.copy(start);
 const dir=new THREE.Vector3();cam.getWorldDirection(dir);
 const vel=dir.multiplyScalar(11);vel.y+=4.8;scene.add(q);
 thrown.push({q,v:vel,fuse:2.15,bottomYPivot:true});show("GRENADE!");
}
function radiatedSpinTopTarget(z){
 let best=null,bestD=Infinity;
 for(const g of thrown){
   if(!g||g.launcher||!g.bottomYPivot||g.fuse<=0||!g.q?.parent)continue;
   const dx=g.q.position.x-z.g.position.x,dz=g.q.position.z-z.g.position.z,d2=dx*dx+dz*dz;
   if(d2<bestD){bestD=d2;best=g}
 }
 return best;
}
function explodeGrenade(g){
 noise(.42,.95,900);tone(48,.45,"sine",.42);
 const p=g.q.position.clone();scene.remove(g.q);
 for(let i=0;i<55;i++){let q=new THREE.Mesh(FX.explosionGeo,i%3?FX.grenadeDustMat:FX.grenadeFlashMat);q.scale.setScalar(.45+rnd()*1.15);q.position.copy(p);scene.add(q);parts.push({q,v:new THREE.Vector3((rnd()-.5)*10,rnd()*7,(rnd()-.5)*10),life:.45+rnd()*.55})}
 for(const z of living()){
   const d=z.g.position.distanceTo(p);
   if(d<7.5){
     const blast=Math.max(1,Math.ceil((8-d)/2))*damageLevel,force=Math.max(.25,1-d/7.5);
     z.hp-=blast;
     if(z.hp<=0&&!z.dead)killZ(z,false,z.g.position.clone().add(new THREE.Vector3(0,1.4,0)),2.90+force*3.30,p);
     else blastReact(z,p,.55+force*.95)
   }
 }
}

function detonateNuke(){
 if(!running||paused||dying||between||nukeInProgress)return;
 if(nukes<=0){show("NO TACTICAL NUKES");return}
 nukes--;nukeInProgress=true;ui();stopAuto();
 const nukeRun=runSequence;
 showAnnouncement({container:announce,titleEl:big,subtitleEl:small,title:"TACTICAL NUKE",subtitle:"INBOUND"});
 tone(880,.11,"square",.12);tone(660,.11,"square",.12,.18);tone(440,.18,"square",.14,.36);
 gameTimeout(()=>{
   if(nukeRun!==runSequence)return;
   if(!running||dying){nukeInProgress=false;return}
   hideAnnouncement(announce);
   nukeFlash.classList.remove("boom");nukeShock.classList.remove("boom");
   void nukeFlash.offsetWidth;void nukeShock.offsetWidth;
   nukeFlash.classList.add("boom");nukeShock.classList.add("boom");
   noise(.95,1,700);tone(42,.95,"sine",.5);tone(78,.55,"square",.20,.05);
   const victims=living().filter(z=>z.kind!=="boss").slice();
   for(const z of victims){
     if(z.dead)continue;
     if(rnd()<DROP_CHANCE*.42)spawnZombieDrop(z.g.position);
     z.dead=true;if(z.marker)z.marker.visible=false;
     z.corpseAge=3.5;
     z.fallDir=rnd()>.5?1:-1;z.fallAxis=rnd()>.5?"x":"z";
     beginRagdoll(z,1.35);
     z.g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
   }
   kills+=victims.length;
   cash+=victims.length*10;
   nukeInProgress=false;
   ui();
   show("NUKE: "+victims.length+" ZOMBIES ELIMINATED");
   setTimeout(()=>{nukeFlash.classList.remove("boom");nukeShock.classList.remove("boom")},1000);
 },850)
}

function clearKeys(){clearKeyState(keys)}
function setGamePaused(next){
 if(next){
   if(paused||!running||dying||between)return;
   paused=true;pauseStartedAt=performance.now();
   clearKeys();stopAuto();setAim(false);
   renderPauseUi({pauseOverlay,pauseButton:pauseBtn,paused:true,showPauseButton:false});
   document.body.style.cursor="default";
   if(document.pointerLockElement===cv)document.exitPointerLock?.();
   if(ac&&ac.state==="running")ac.suspend().catch(()=>{});
   return;
 }
 if(!paused)return;
 const now=performance.now(),pausedFor=Math.max(0,now-pauseStartedAt);
 pausedAccumulatedMs+=pausedFor;pauseStartedAt=0;paused=false;last=now;
 renderPauseUi({pauseOverlay,pauseButton:pauseBtn,paused:false,showPauseButton:running&&!dying&&!between});
 document.body.style.cursor="";
 if(ac&&audioOn)ac.resume().catch(()=>{});
 cv.focus();
 if(document.pointerLockElement!==cv){try{cv.requestPointerLock?.()}catch(_){}}
}
setupPauseButtons(setGamePaused,{pauseButton:pauseBtn,resumeButton:resumeGameBtn});

// First-person weapon contact. The guns/hands are camera-space viewmodels, so
// they cannot physically collide with world meshes on their own. Treat a zombie
// crowding the muzzle as contact and push the complete weapon/hand rig back/up.
// This preserves zombie attack range instead of turning the gun into an invisible wall.
const WEAPON_CONTACT={
 rifle:{reach:2.20,width:.74,retract:.88,tilt:.46},
 smg:{reach:1.72,width:.70,retract:.68,tilt:.40},
 shotgun:{reach:2.24,width:.76,retract:.92,tilt:.48},
 pistol:{reach:1.22,width:.62,retract:.46,tilt:.30},
 dmr:{reach:2.38,width:.76,retract:.96,tilt:.50},
 grenadeLauncher:{reach:1.98,width:.74,retract:.82,tilt:.45},
 m240:{reach:2.38,width:.80,retract:.98,tilt:.50},
 awm:{reach:2.52,width:.76,retract:1.02,tilt:.52}
};
function weaponContactSpec(w=weapon){return WEAPON_CONTACT[w]||WEAPON_CONTACT.rifle}
function weaponZombieContactAmount(){
 if(!running||dying||between)return 0;
 const spec=weaponContactSpec(),fx=-Math.sin(yaw),fz=-Math.cos(yaw);
 let strongest=0;
 for(const z of zombies){
   if(!z||z.dead||z.knockdown)continue;
   const dx=z.g.position.x-px,dz=z.g.position.z-pz;
   const along=dx*fx+dz*fz;
   if(along<=.05)continue;
   const lateral=Math.abs(dx*fz-dz*fx);
   const bossPad=z.kind==="boss"?.42:z.kind==="crawler"?.10:.22;
   const reach=spec.reach+bossPad;
   if(along>reach+.30||lateral>spec.width+bossPad)continue;
   const dist=Math.hypot(dx,dz);
   if(dist>=reach)continue;
   const fullAt=z.kind==="boss"?.92:.68;
   const amt=Math.max(0,Math.min(1,(reach-dist)/Math.max(.25,reach-fullAt)));
   if(amt>strongest)strongest=amt;
 }
 return strongest;
}
// If the camera has been crowded into a zombie mesh, normal front-face raycasting
// can miss because the ray starts inside the target. Retry from just behind the
// camera, but only while a zombie is actually inside the weapon-contact zone.
function pointBlankWeaponHit(){
 if(weaponZombieContactAmount()<=.02)return null;
 const spec=weaponContactSpec(),savedOrigin=ray.ray.origin.clone(),dir=ray.ray.direction.clone();
 ray.ray.origin.addScaledVector(dir,-(spec.reach+.65));
 const hits=ray.intersectObjects(rayTargets,false);
 ray.ray.origin.copy(savedOrigin);
 const fx=-Math.sin(yaw),fz=-Math.cos(yaw);
 for(const hit of hits){
   const z=hit.object?.userData?.zombie;
   if(!z||z.dead)continue;
   const dx=z.g.position.x-px,dz=z.g.position.z-pz,dist=Math.hypot(dx,dz);
   const along=dx*fx+dz*fz,lateral=Math.abs(dx*fz-dz*fx);
   const bossPad=z.kind==="boss"?.42:z.kind==="crawler"?.10:.22;
   if(along>-.10&&dist<=spec.reach+bossPad+.55&&lateral<=spec.width+bossPad+.18)return hit;
 }
 return null;
}

// Soft living-body collision: prevents the player and upright zombies from
// ghosting through one another without turning enemies into rigid walls.
function zombieContactRadius(z){return z.kind==="boss"?1.05:z.kind==="crawler"?.58:.72}
function playerWorldBlocked(x,z){
 if(insideBuilding(x,z,.62))return true;
 for(const c of parkedCars)if(carPointCollision(c,x,z,.38))return true;
 return false;
}
function resolvePlayerZombieContact(oldx,oldz){
 for(const z of zombies){
   if(z.dead||z.knockdown)continue;
   const minD=zombieContactRadius(z),zx=z.g.position.x,zz=z.g.position.z;
   let dx=px-zx,dz=pz-zz,d=Math.hypot(dx,dz);
   if(d>=minD)continue;
   if(d<.001){dx=oldx-zx;dz=oldz-zz;d=Math.hypot(dx,dz);if(d<.001){dx=Math.sin(yaw);dz=Math.cos(yaw);d=1}}
   const push=minD-d+.012,tx=px+dx/d*push,tz=pz+dz/d*push;
   if(!playerWorldBlocked(tx,tz)){px=tx;pz=tz}else{px=oldx;pz=oldz}
 }
}
function resolveZombiePlayerContact(z,oldx,oldz){
 if(!z||z.dead||z.knockdown)return;
 const minD=zombieContactRadius(z);
 let dx=z.g.position.x-px,dz=z.g.position.z-pz,d=Math.hypot(dx,dz);
 if(d>=minD)return;
 if(d<.001){dx=oldx-px;dz=oldz-pz;d=Math.hypot(dx,dz);if(d<.001){dx=Math.sin(z.g.rotation.y);dz=Math.cos(z.g.rotation.y);d=1}}
 const tx=px+dx/d*minD,tz=pz+dz/d*minD;
 if(!zombiePointBlocked(tx,tz,.50)){z.g.position.x=tx;z.g.position.z=tz}
 else{z.g.position.x=oldx;z.g.position.z=oldz}
}

let sprintUiPct=-1,sprintUiColor="",sprintUiState="";
const sprintHudRenderArgs={sprintFill,sprintState,energy:100,locked:false,previousPct:-1,previousColor:"",previousState:""};
function updateSprintUI(){
 sprintHudRenderArgs.energy=sprintEnergy;
 sprintHudRenderArgs.locked=sprintLocked;
 sprintHudRenderArgs.previousPct=sprintUiPct;
 sprintHudRenderArgs.previousColor=sprintUiColor;
 sprintHudRenderArgs.previousState=sprintUiState;
 const next=renderSprintHud(sprintHudRenderArgs);
 sprintUiPct=next.pct;
 sprintUiColor=next.color;
 sprintUiState=next.state;
}
function move(dt){aimBlend+=(aiming?1:-1)*dt*8;aimBlend=Math.max(0,Math.min(1,aimBlend));const ac=ads(),targetFov=aiming?ac.fov:70,newFov=cam.fov+(targetFov-cam.fov)*Math.min(1,dt*10);if(Math.abs(newFov-cam.fov)>.015){cam.fov=newFov;cam.updateProjectionMatrix()}let f=(keys.w?1:0)-(keys.s?1:0),r=(keys.d?1:0)-(keys.a?1:0),len=Math.hypot(f,r)||1,moving=!!(f||r);let sprinting=moving&&keys.shift&&!sprintLocked&&sprintEnergy>0;if(sprinting){sprintEnergy=Math.max(0,sprintEnergy-33.34*dt);if(sprintEnergy<=0){sprintEnergy=0;sprintLocked=true;sprinting=false}}else{sprintEnergy=Math.min(100,sprintEnergy+14*dt);if(sprintLocked&&sprintEnergy>=100)sprintLocked=false}updateSprintUI();if(moving){f/=len;r/=len;let sp=sprinting?9.5:5,fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);let oldx=px,oldz=pz;px+=(fx*f+rx*r)*sp*dt;pz+=(fz*f+rz*r)*sp*dt;
for(const c of parkedCars){
 if(carPointCollision(c,px,pz,.38)){
   const tx=px,tz=pz;
   px=tx;pz=oldz;
   if(carPointCollision(c,px,pz,.38)){
     px=oldx;pz=tz;
     if(carPointCollision(c,px,pz,.38)){px=oldx;pz=oldz}
   }
   break;
 }
}
const playerWallRadius=.36;
let bp=slideBuilding(oldx,oldz,px,pz,playerWallRadius);px=bp.x;pz=bp.z;
resolvePlayerZombieContact(oldx,oldz);
const targetGroundY=samplePlayerGroundY(px,pz,playerGroundY);
const groundFollowRate=targetGroundY>playerGroundY?18:13;
playerGroundY=THREE.MathUtils.lerp(playerGroundY,targetGroundY,Math.min(1,dt*groundFollowRate));
stepTimer-=dt;if(stepTimer<=0){stepS(sprinting);stepTimer=sprinting?.19:.38}}else stepTimer=0;playerVX=(px-lastPX)/Math.max(dt,.001);playerVZ=(pz-lastPZ)/Math.max(dt,.001);lastPX=px;lastPZ=pz;cam.position.set(px,playerGroundY+1.65*PLAYER_WORLD_SCALE,pz);cam.rotation.order="YXZ";cam.rotation.y=yaw;cam.rotation.x=pitch;cam.rotation.z=0;recoil=Math.max(0,recoil-dt*1.35);const ac2=ads();const adsScale=1-aimBlend*(weapon==="smg"?.05:weapon==="rifle"?.04:.16);const rp=reloadPoseProgress();
 const reloadTilt=(weapon==="grenadeLauncher"?.34:weapon==="pistol"?.28:weapon==="shotgun"?.24:.20)*rp.arch;
 gun.scale.setScalar(adsScale);
 gun.position.x=ac2.x*adsScale*aimBlend+rp.arch*(weapon==="pistol"?.05:.10);
 const wholeGunRecoil=(weapon==="smg"||weapon==="m240")?0:recoil;
 gun.position.z=ac2.z*aimBlend+wholeGunRecoil*.42+rp.arch*.09;
 gun.position.y=ac2.y*aimBlend-wholeGunRecoil*.08-rp.arch*(weapon==="m240"?.12:.18);
 gun.rotation.x=(ac2.rx||0)*aimBlend+wholeGunRecoil*2.05+reloadTilt;
 gun.rotation.y=rp.arch*(weapon==="grenadeLauncher"?.10:.04);
 gun.rotation.z=-rp.arch*(weapon==="pistol"?.30:weapon==="grenadeLauncher"?.24:.16);
 // Do not alter any locked reload choreography. Outside reload, a zombie crowding
 // the muzzle pushes the complete gun + both hands toward the player and raises
 // the muzzle, so viewmodel geometry no longer passes through the zombie.
 const weaponContact=reloading?0:weaponZombieContactAmount(),contactSpec=weaponContactSpec();
 gun.position.z+=weaponContact*contactSpec.retract;
 gun.rotation.x+=weaponContact*contactSpec.tilt;
 if(weapon==="rifle"&&m4ViewRoot){
   // Replacement M4 gets its own first-person pose instead of inheriting the old
   // classic_m4 geometry placement. Hip-fire sits lower/right with a mild downward
   // pitch and roll, then blends back to the existing centered ADS pose.
   if(reloading){
     m4ViewRoot.position.set(.36,-.25,-1.66);
     m4ViewRoot.rotation.set(0,0,0);
   }else{
     m4ViewRoot.position.x=THREE.MathUtils.lerp(.54,.36,aimBlend);
     m4ViewRoot.position.y=THREE.MathUtils.lerp(-.56,-.25,aimBlend);
     m4ViewRoot.position.z=THREE.MathUtils.lerp(-1.48,-1.66,aimBlend);
     m4ViewRoot.rotation.x=THREE.MathUtils.lerp(THREE.MathUtils.degToRad(-8),0,aimBlend);
     m4ViewRoot.rotation.y=0;
     m4ViewRoot.rotation.z=THREE.MathUtils.lerp(THREE.MathUtils.degToRad(-6),0,aimBlend);
   }
 }
 if(weapon==="smg"&&mp5ViewRoot){
   const a=aimBlend;
   // Hip: move the complete gun farther forward so the stock is smaller/tucked away.
   const hipYaw=0;
   // Hip is now a straighter shouldered pose: the muzzle stays near the same
   // screen location while the stock moves farther right instead of floating mid-screen.
   const adsYaw=THREE.MathUtils.degToRad(1.05);
   const pivotZ=-.50,mp5Scale=1.55;
   const adsPivotX=mp5Scale*(0-Math.sin(adsYaw)*pivotZ);
   const adsPivotZ=mp5Scale*(pivotZ-Math.cos(adsYaw)*pivotZ);
   const yawNow=THREE.MathUtils.lerp(hipYaw,adsYaw,a);
   mp5ViewRoot.rotation.y=yawNow;
   mp5ViewRoot.scale.setScalar(THREE.MathUtils.lerp(2.25,1.55,a));
   mp5ViewRoot.position.x=THREE.MathUtils.lerp(.30,.36+adsPivotX,a);
   mp5ViewRoot.position.y=THREE.MathUtils.lerp(-.70,-.40,a);
   mp5ViewRoot.position.z=THREE.MathUtils.lerp(-1.12,-1.55+adsPivotZ,a);

   // v375: keep the MP5 stock/root planted. Only the geometry pivots around
   // the rear of the receiver, giving a small muzzle rise without whole-gun bounce.
   if(mp5RecoilPivot)mp5RecoilPivot.rotation.x=recoil*.28;
 }
 if(weapon==="m240"&&m240ViewRoot){
   // v379: lower the butt in ADS by pitching the complete M240 the opposite
   // direction from v378; keep the current ADS height/depth unchanged.
   m240ViewRoot.rotation.x=THREE.MathUtils.lerp(.055,.060,aimBlend);
 }
 if(weapon==="m240"&&m240ViewModel&&m240ViewBasePos&&m240ViewBaseQuat){
   // v382: heavy-machine-gun recoil stays at the barrel/front only. Stronger
   // visible rise returns, but slower smoothing keeps sustained ADS from bouncing.
   const recoilStrength=THREE.MathUtils.lerp(.20,.125,aimBlend);
   const targetKick=-recoil*recoilStrength;
   const follow=1-Math.exp(-dt*6.5);
   m240BarrelKick=THREE.MathUtils.lerp(m240BarrelKick,targetKick,follow);
   m240RecoilQuat.setFromAxisAngle(m240RecoilAxis,m240BarrelKick);
   m240ViewModel.quaternion.copy(m240RecoilQuat).multiply(m240ViewBaseQuat);
   m240ViewModel.position.copy(m240ViewBasePos).sub(m240RecoilPoint).applyQuaternion(m240RecoilQuat).add(m240RecoilPoint);
 }
 if(playerHandRig){
   // The imported M4 is much more realistic than the old block rifle. In ADS,
   // fade the procedural arms out so they do not form the giant V around the optic.
   // They remain fully visible at hip-fire and during reload.
   const rifleAdsArmScale=(weapon==="rifle"&&!reloading)?Math.max(.001,1-aimBlend*1.35):1;
   const smgAdsArmScale=(weapon==="smg"&&!reloading)?Math.max(.001,1-aimBlend*1.35):1;
   const adsArmScale=weapon==="smg"?smgAdsArmScale:rifleAdsArmScale;
   playerHandRig.left.scale.setScalar(adsArmScale);playerHandRig.right.scale.setScalar(adsArmScale);
   // Imported M4 ADS: the GLB root already sits 1.66 units forward of the camera.
   // ADS therefore moves the gun BACK toward the eye with a positive Z offset.
   // Earlier negative ADS Z values pushed the entire rifle farther away and exposed
   // the receiver/stock from behind, which is why v160-v163 looked progressively wrong.
   if(weapon==="rifle")for(const o of m4AdsOccluders)o.visible=aimBlend<.62||reloading;
   if(reloading&&reloadWeapon==="grenadeLauncher"){
     const p=rp.p;let lx=0,ly=0,lz=0,lr=0,t=0;
     // Hand works the latch, drops to the pouch, carries the grenade to the open breech, then returns to the fore-end.
     if(p<.18){t=smoothReload01(p/.18);lx=.08*t;ly=.08*t;lz=.08*t;lr=-.10*t}
     else if(p<.38){t=smoothReload01((p-.18)/.20);lx=.08+(-.16-.08)*t;ly=.08+(-.52-.08)*t;lz=.08+(.24-.08)*t;lr=-.10+(-.24+.10)*t}
     else if(p<.68){t=smoothReload01((p-.38)/.30);lx=-.16+(.18+.16)*t;ly=-.52+(.24+.52)*t;lz=.24+(.11-.24)*t;lr=-.24+(.10+.24)*t}
     else if(p<.80){lx=.18;ly=.24;lz=.11;lr=.10}
     else{t=smoothReload01((p-.80)/.20);lx=.18*(1-t);ly=.24*(1-t);lz=.11*(1-t);lr=.10*(1-t)}
     playerHandRig.left.position.set(lx,ly,lz);playerHandRig.left.rotation.set(.06+lr,0,-.12-rp.arch*.08);
   }else if(reloading&&reloadWeapon==="pistol"){
     const p=rp.p;let lx=0,ly=0,lz=0,rz=0,t=0;
     // Old mag is released by the firing hand. At the same moment the support hand
     // dives to the belt, grabs the replacement, then brings it straight to the magwell.
     if(p<.12){lx=0;ly=0;lz=0}
     else if(p<.36){t=smoothReload01((p-.12)/.24);lx=-.24*t;ly=-.72*t;lz=.25*t;rz=-.24*t}
     else if(p<.48){lx=-.24;ly=-.72;lz=.25;rz=-.24}
     else if(p<.72){t=smoothReload01((p-.48)/.24);lx=-.24+.36*t;ly=-.72+.52*t;lz=.25-.19*t;rz=-.24+.12*t}
     else if(p<.90){lx=.12;ly=-.20;lz=.06;rz=-.12}
     else{t=smoothReload01((p-.90)/.10);lx=.12*(1-t);ly=-.11*(1-t);lz=.06*(1-t);rz=-.12*(1-t)}
     playerHandRig.left.position.set(lx,ly,lz);playerHandRig.left.rotation.set(.08,0,rz);
   }else{
     const ro=playerHandRig.pose.reload,h=rp.hand,pull=rp.pull||0,pouch=rp.pouch||0;
     playerHandRig.left.position.set(ro[0]*h-.10*pouch,ro[1]*h-.24*pull-.48*pouch,ro[2]*h+.05*pull+.22*pouch);
     playerHandRig.left.rotation.set(.10*h+.11*pouch,0,-.18*h-.09*pouch);
   }
   playerHandRig.right.position.set(0,-.025*rp.arch,.02*rp.arch);
   playerHandRig.right.rotation.set(.04*rp.arch,0,.05*rp.arch);
 }
 updateReloadMagazineFX(rp);
 updateGrenadeLauncherReloadFX(rp);
 const fullScopeAim=aiming&&(weapon==="awm"||weapon==="rifle");
 scopeOverlay.classList.toggle("show",fullScopeAim);
 scopeOverlay.classList.toggle("m4Scope",aiming&&weapon==="rifle");
 gun.visible=!fullScopeAim;for(let k of kits){if(k.used)continue;k.g.rotation.y+=dt*.8;if(Math.hypot(px-k.g.position.x,pz-k.g.position.z)<1.5&&health<100){k.used=true;scene.remove(k.g);health=Math.min(100,health+40);pickupS();ui();show("+40 HEALTH")}}}
function update(dt){
perfGuard(dt);capFX();
for(let i=thrown.length-1;i>=0;i--){let g=thrown[i];g.fuse-=dt;
 const grenadeOldPos=g.q.position.clone();
 g.v.y-=8.5*dt;g.q.position.addScaledVector(g.v,dt);
 if(g.bottomYPivot){
   // Hand grenade: spin a full 360 around the vertical axis through its bottom-center pivot.
   g.q.rotation.y+=dt*8;
 }else{
   // Preserve grenade-launcher projectile tumble.
   g.q.rotation.x+=dt*8;g.q.rotation.z+=dt*6;
 }
 const cityImpact=cityProjectileSegmentHit(grenadeOldPos,g.q.position);
 if(g.launcher){
   let impact=g.q.position.y<.10||insideBuilding(g.q.position.x,g.q.position.z,.05);
   if(cityImpact){g.q.position.copy(cityImpact.point);impact=true}
   if(!impact){for(const c of parkedCars){if(carPointCollision(c,g.q.position.x,g.q.position.z,.10)){impact=true;break}}}
   if(!impact){for(const z of zombies){
     if(z.dead)continue;
     const dx=g.q.position.x-z.g.position.x,dz=g.q.position.z-z.g.position.z;
     if(z.kind==="boss"){
       const chestY=z.g.position.y+1.43*(z.g.scale.y||1),dy=g.q.position.y-chestY;
       if(dx*dx+dz*dz<.92*.92&&Math.abs(dy)<1.12){impact=true;break}
     }else{
       const crawler=z.kind==="crawler";
       const dy=g.q.position.y-(z.g.position.y+(crawler?.55:1));
       const rr=crawler?.78:.70;
       if(dx*dx+dy*dy+dz*dz<rr*rr){impact=true;break}
     }
   }}
   if(impact||g.fuse<=0){explodeLauncherRound(g);thrown.splice(i,1);continue}
 }else{
   if(cityImpact){
     const n=cityProjectileHitNormal(cityImpact);
     g.q.position.copy(cityImpact.point);
     if(n){
       g.q.position.addScaledVector(n,.035);
       g.v.reflect(n).multiplyScalar(.46);
     }else{
       g.v.multiplyScalar(-.34);
     }
   }else if(g.q.position.y<.12){
     g.q.position.y=.12;g.v.y*=-.38;g.v.x*=.76;g.v.z*=.76
   }
   if(g.fuse<=0){explodeGrenade(g);thrown.splice(i,1)}
 }
}
for(let i=casings.length-1;i>=0;i--){let c=casings[i];c.life-=dt;c.v.y-=4.5*dt;c.q.position.addScaledVector(c.v,dt);c.q.rotation.x+=c.spin*dt;c.q.rotation.z+=c.spin*.7*dt;if(c.q.position.y<.04){c.q.position.y=.04;c.v.y*=-.22;c.v.x*=.72;c.v.z*=.72}if(c.life<=0){scene.remove(c.q);casings.splice(i,1)}}
for(let i=impacts.length-1;i>=0;i--){let p=impacts[i];p.life-=dt;p.v.y-=3*dt;p.q.position.addScaledVector(p.v,dt);if(p.life<=0){scene.remove(p.q);impacts.splice(i,1)}}
for(let i=parts.length-1;i>=0;i--){let p=parts[i];p.life-=dt;p.v.y-=5*dt;p.q.position.addScaledVector(p.v,dt);
if(p.limb||p.reloadMag){
 const sp=p.spin,sx=sp?sp.x:4,sy=sp?sp.y:5,sz=sp?sp.z:3;p.q.rotation.x+=sx*dt;p.q.rotation.y+=sy*dt;p.q.rotation.z+=sz*dt;
 if(p.q.position.y<.08){p.q.position.y=.08;p.v.y*=-.20;p.v.x*=.68;p.v.z*=.68;if(sp)sp.multiplyScalar(.62)}
}
if(p.life<=0){scene.remove(p.q);parts.splice(i,1)}}if(dying){cam.rotation.z=Math.min(1.2,cam.rotation.z+dt*.5);cam.position.y=Math.max(.25,cam.position.y-dt*.55);return}if(!running)return;updateHealthRegen(dt);move(dt);updateDrops(dt);if(between){return}for(let z of zombies){
 if(!z.dead)continue;
 z.corpseAge+=dt;
 // v414: keep Hairibar-style unpowered simulation alive until body-contact
 // settlement explicitly marks rag.active=false. Never stop just because a
 // scripted fall timer or root-ground flag says the corpse is "done."
 if(z.ragdoll?.active!==false)updateRagdoll(z,dt);
 syncRadiatedGreenGuy(z,dt);syncBasicWalkerVisual(z,dt);
 if(z.corpseAge>10&&z.g.parent){releaseZombieVisual(z);z.cleaned=true;}
}
if(zombies.some(z=>z.cleaned))zombies=zombies.filter(z=>!z.cleaned);
spawnQueuedZombies();
activeFrame.length=0;for(const z of zombies)if(!z.dead)activeFrame.push(z);
const active=activeFrame;
updateBossUI();
const highlightLast=(active.length+Math.max(0,waveTarget-waveSpawned))<=5&&!currentBoss;
for(let z of active){
 if(!Number.isFinite(z.g.position.x)||!Number.isFinite(z.g.position.y)||!Number.isFinite(z.g.position.z)){
   const a=rnd()*Math.PI*2,dist=16+rnd()*8;let safe=pushOutsideBuilding(px+Math.sin(a)*dist,pz+Math.cos(a)*dist,.85);
   z.g.position.set(safe.x,0,safe.z);z.groundY=0;z.targetX=px;z.targetZ=pz;z.stagger=.25;z.navPath=null;z.navIndex=0;z.navCheckT=0;
 }
 z.groundCheckT=(z.groundCheckT||0)-dt;
 if(z.groundCheckT<=0&&!z.knockdown){
   z.groundCheckT=.07+(z.phase%1)*.035;
   const targetGround=sampleZombieGroundY(z.g.position.x,z.g.position.z,z.groundY||0);
   z.groundY=THREE.MathUtils.lerp(z.groundY||0,targetGround,.72);
 }
 if(highlightLast&&!z.marker){
   z.marker=createLastZombieMarker();
   z.marker.position.set(0,2.48,0);
   z.g.add(z.marker);
 }
 if(z.marker)z.marker.visible=highlightLast;

 if(z.knockdown){
   z.cool=Math.max(0,z.cool-dt);
   z.groan-=dt;z.step-=dt;
   updateKnockdown(z,dt);
   syncRadiatedGreenGuy(z,dt);syncBasicWalkerVisual(z,dt);
   continue;
 }

z.cool=Math.max(0,z.cool-dt);z.stagger=Math.max(0,(z.stagger||0)-dt);z.attackAnim=Math.max(0,z.attackAnim-dt);
const playerDistToZombie=Math.hypot(px-z.g.position.x,pz-z.g.position.z);
const huntMode=highlightLast&&z.kind!=="boss";
const huntRun=huntMode&&z.kind!=="crawler"&&z.kind!=="boss";
if(z.mixer){
 setZombieLocomotion(z,huntRun);
 const naturalRunner=z.kind==="sprinter"||z.kind==="infected"||z.kind==="acidic";
 const huntRigScale=playerDistToZombie>32?1.44:playerDistToZombie>16?1.34:1.24;
 const bossRigScale=z.kind==="boss"?
   (z.bossAttackState==="charge"?2.05:playerDistToZombie>28?1.72:playerDistToZombie>18?1.56:playerDistToZombie>10?1.38:Math.max(.58,z.speed*.54)):1;
 const rigScale=huntRun&&!naturalRunner?huntRigScale:naturalRunner?Math.max(.95,z.speed*.74):z.kind==="boss"?bossRigScale:Math.max(.66,z.speed*.61);
 if(z.rigBase)z.rigBase.timeScale=rigScale;
 if(z.rigTransientT>0){z.rigTransientT-=dt;if(z.rigTransientT<=0){if(z.rigTransient)z.rigTransient.fadeOut(.08);if(z.rigBase)z.rigBase.reset().fadeIn(.10).play();z.rigTransient=null;}}
 z.mixer.update(dt);
 applyRigLocomotionPolish(z,huntRun,dt);
}
z.groan-=dt;z.step-=dt;z.surgeT-=dt;z.pauseClock-=dt;
let animRate=0;
if(z.pauseClock<=0){z.pauseClock=1.1+rnd()*3.2;if(rnd()<.22)z.stagger=Math.max(z.stagger,.10+rnd()*.12)}
if(z.surgeT<=0){z.surgeT=.65+rnd()*1.7;z.zig*=-1}z.think-=dt;
z.avoidT=Math.max(0,(z.avoidT||0)-dt);z.navFlipCooldown=Math.max(0,(z.navFlipCooldown||0)-dt);
const spinTopDecoy=(z.radiatedGreenVisual||z.walkerVisual)?radiatedSpinTopTarget(z):null;
const pursuitX=spinTopDecoy?spinTopDecoy.q.position.x:px,pursuitZ=spinTopDecoy?spinTopDecoy.q.position.z:pz;
if(z.kind!=="boss")updateZombieRoute(z,dt,huntMode,pursuitX,pursuitZ);
if(z.kind==="boss")tickBossSpecial(z,dt,playerDistToZombie);
if(z.think<=0){
 z.think=huntMode?.025+rnd()*.025:.08+rnd()*.10;
 const speed=Math.hypot(playerVX,playerVZ),lead=Math.min(1.5,speed*.14);
 let tx=pursuitX, tz=pursuitZ;

 // While a spin-top grenade is live, Green Guys ignore role offsets and commit
 // directly to the grenade. Otherwise preserve the approved player-pursuit logic.
 if(!spinTopDecoy&&z.role==="interceptor"){
   tx=px+playerVX*lead*.75;tz=pz+playerVZ*lead*.75;
 }
 if(!spinTopDecoy&&z.role==="flanker"&&playerDistToZombie>5){
   const pd=playerDistToZombie||1;
   const nx=(px-z.g.position.x)/pd,nz=(pz-z.g.position.z)/pd;
   const off=Math.min(2.8,1.4+playerDistToZombie*.055);
   tx=px+(-nz)*z.side*off;
   tz=pz+(nx)*z.side*off;
 }
 if(!spinTopDecoy&&z.role==="stalker"){
   // stalkers still close distance and never park in place while the player is nearby
   tx=px+playerVX*lead*.28;tz=pz+playerVZ*lead*.28;
 }
 if(!spinTopDecoy&&z.role==="charger"){
   tx=px+playerVX*lead*.18;tz=pz+playerVZ*lead*.18;
 }

 // Keep every normal role strongly biased toward the player. A Green Guy
 // following the spin-top stays fully committed to that grenade until it explodes.
 if(!spinTopDecoy){
   tx=px+(tx-px)*.42;
   tz=pz+(tz-pz)*.42;
   if(huntMode||playerDistToZombie<6||active.length<=2){tx=px;tz=pz}
 }

 // If direct pursuit is blocked, follow the A* corner route until line of sight opens again.
 const wp=zombieRouteWaypoint(z);
 if(wp){tx=wp.x;tz=wp.z}

 z.targetX=tx;z.targetZ=tz;
}
let dx=z.targetX-z.g.position.x,dz=z.targetZ-z.g.position.z;
let td=Math.hypot(dx,dz)||.001,d=(spinTopDecoy?td:playerDistToZombie)||.001;
const wantedYaw=Math.atan2(dx,dz)+Math.PI;
 const turnDelta=Math.atan2(Math.sin(wantedYaw-z.g.rotation.y),Math.cos(wantedYaw-z.g.rotation.y));
 z.g.rotation.y+=turnDelta*Math.min(1,dt*z.turnRate);
 const lookX=spinTopDecoy?pursuitX:px,lookZ=spinTopDecoy?pursuitZ:pz;
 const playerYaw=Math.atan2(lookX-z.g.position.x,lookZ-z.g.position.z)+Math.PI;
 const lookDelta=Math.atan2(Math.sin(playerYaw-z.g.rotation.y),Math.cos(playerYaw-z.g.rotation.y));
 const playerLook=Math.max(-.42,Math.min(.42,lookDelta));

 const walk=Math.sin(z.phase),
       walk2=Math.sin(z.phase+Math.PI),
       attack=z.attackAnim>0?Math.sin((.62-z.attackAnim)/.62*Math.PI):0,
       claw=z.attackSide||1,drag=z.dragSide,
       limpL=drag<0?1-z.limp*.24:1,limpR=drag>0?1-z.limp*.24:1,
       rootSway=walk*(.008+z.limp*.004),shoulderLead=turnDelta*.08,
       headSnap=Math.sin(last*.0017*z.snapRate+z.twitch*1.08)*z.snapBias,
       kind=z.kind||"shambler",
       isCrawler=kind==="crawler",isBoss=kind==="boss",isSprinter=kind==="sprinter"||kind==="infected"||kind==="acidic",isRadiated=kind==="radiated",
       forwardPulse=Math.max(0,walk)*.018;

 // The chest is literally ahead of the hips. This is the "invisible rope through the chest" behavior.
 if(!isCrawler){
   z.torso.position.z=-.025-(isSprinter?.075:.055)-forwardPulse;
   z.neck.position.z=-.035-(isSprinter?.055:.035)-forwardPulse*.65;
   z.head.position.z=-.070-(isSprinter?.055:.035)-forwardPulse*.75;
   z.armL.position.z=-.045-(isSprinter?.035:.018)-forwardPulse*.45;
   z.armR.position.z=-.045-(isSprinter?.035:.018)-forwardPulse*.45;
 }
 z.torso.rotation.x=-(z.hunch + (isBoss?.015:(isSprinter?.045:isRadiated?.025:.020))) - attack*(isBoss?.045:.070);
 z.torso.rotation.z=z.shoulderDrop + rootSway*(isBoss?.10:.20);
 z.torso.rotation.y=walk*(isSprinter?.018:.010)+shoulderLead*.10;
 if(z.jacket){z.jacket.position.z=z.torso.position.z-.004;z.jacket.rotation.x=z.torso.rotation.x*.52;z.jacket.rotation.z=z.torso.rotation.z*.65;z.jacket.rotation.y=z.torso.rotation.y*.85}
 if(z.pelvis){z.pelvis.rotation.y=-walk*(isSprinter?.024:.016);z.pelvis.rotation.z=-rootSway*.10;z.pelvis.rotation.x=-.015}
 if(z.neck){z.neck.rotation.z=z.headLean*.06;z.neck.rotation.x=-.08-attack*.012}
 if(z.jaw){z.jaw.rotation.x=.045+attack*.12+Math.abs(Math.sin(z.phase*.23))*.006}
 z.head.rotation.x=-.05-Math.abs(walk)*(isSprinter?.014:.008)-attack*.07;
 z.head.rotation.z=z.headLean+Math.sin(z.phase*.30)*.007+headSnap*.03;
 z.head.rotation.y=Math.sin(z.phase*.26)*(isSprinter?.014:.009)+attack*.03*claw+playerLook*(isBoss?.32:.48);

 // Hands hang heavy and slightly forward; elbows stay bent.
 if(isCrawler){
   z.armL.rotation.x=.92+walk*.22+attack*.18; z.armR.rotation.x=.92+walk2*.22+attack*.18;
   z.armL.rotation.z=-.14; z.armR.rotation.z=.14;
   if(z.elbowL)z.elbowL.rotation.x=.42+Math.max(0,walk)*.28+attack*.20;
   if(z.elbowR)z.elbowR.rotation.x=.42+Math.max(0,walk2)*.28+attack*.20;
 }else if(isSprinter){
   z.armL.rotation.x=z.baseArmLX+walk*.15+attack*(claw<0?.28:.14);
   z.armR.rotation.x=z.baseArmRX+walk2*.15+attack*(claw>0?.28:.14);
   z.armL.rotation.z=-.17+walk2*.022+((drag<0)?-.025-z.armDrop*.05:0);
   z.armR.rotation.z=.17-walk2*.022+((drag>0)?.025+z.armDrop*.05:0);
   if(z.elbowL)z.elbowL.rotation.x=.25+Math.max(0,walk)*.17+attack*(claw<0?.26:.10);
   if(z.elbowR)z.elbowR.rotation.x=.25+Math.max(0,walk2)*.17+attack*(claw>0?.26:.10);
 }else if(isBoss){
   z.armL.rotation.x=.14+walk*.045+attack*(claw<0?.17:.08);
   z.armR.rotation.x=.14+walk2*.045+attack*(claw>0?.17:.08);
   z.armL.rotation.z=-.11; z.armR.rotation.z=.11;
   if(z.elbowL)z.elbowL.rotation.x=.20+Math.max(0,walk)*.06;
   if(z.elbowR)z.elbowR.rotation.x=.20+Math.max(0,walk2)*.06;
 }else{
   z.armL.rotation.x=z.baseArmLX+walk*.065+attack*(claw<0?.23:.10);
   z.armR.rotation.x=z.baseArmRX+walk2*.065+attack*(claw>0?.23:.10);
   z.armL.rotation.z=-.15+walk2*.012+((drag<0)?-.020-z.armDrop*.045:0);
   z.armR.rotation.z=.15-walk2*.012+((drag>0)?.020+z.armDrop*.045:0);
   if(z.elbowL)z.elbowL.rotation.x=.27+Math.max(0,walk)*.11+attack*(claw<0?.25:.08);
   if(z.elbowR)z.elbowR.rotation.x=.27+Math.max(0,walk2)*.11+attack*(claw>0?.25:.08);
 }

 // Actual distance traveled drives the feet. No independent "walking while sliding" clock.
 if(isCrawler){
   z.legL.rotation.x=-1.12+walk2*.04;z.legR.rotation.x=-1.04+walk*.04;
   z.g.position.y=z.groundY+.003;
 }else if(isBoss){
   z.legL.rotation.x=walk2*.15*z.strideScale-attack*.015;
   z.legR.rotation.x=walk*.15*z.strideScale-attack*.015;
   z.legL.rotation.z=-rootSway*.025; z.legR.rotation.z=rootSway*.025;
   if(z.kneeL)z.kneeL.rotation.x=.07+Math.max(0,-walk2)*.18;
   if(z.kneeR)z.kneeR.rotation.x=.07+Math.max(0,-walk)*.18;
   z.g.position.y=z.groundY;
 }else if(isSprinter){
   z.legL.rotation.x=walk2*.28*z.strideScale*limpL-attack*.025;
   z.legR.rotation.x=walk*.28*z.strideScale*limpR-attack*.025;
   z.legL.rotation.z=-rootSway*.045; z.legR.rotation.z=rootSway*.045;
   if(z.kneeL)z.kneeL.rotation.x=.06+Math.max(0,-walk2)*.34+(drag<0?z.limp*.035:0);
   if(z.kneeR)z.kneeR.rotation.x=.06+Math.max(0,-walk)*.34+(drag>0?z.limp*.035:0);
   z.g.position.y=z.groundY;
 }else{
   z.legL.rotation.x=walk2*.21*z.strideScale*limpL-attack*.018;
   z.legR.rotation.x=walk*.21*z.strideScale*limpR-attack*.018;
   z.legL.rotation.z=-rootSway*.038; z.legR.rotation.z=rootSway*.038;
   if(z.kneeL)z.kneeL.rotation.x=.05+Math.max(0,-walk2)*.30+(drag<0?z.limp*.045:0);
   if(z.kneeR)z.kneeR.rotation.x=.05+Math.max(0,-walk)*.30+(drag>0?z.limp*.045:0);
   z.g.position.y=z.groundY;
 }

 if(z.hazardMist){z.hazardMist.rotation.y+=dt*.24;z.hazardMist.scale.y=1.48+Math.sin(last*.002+z.phase)*.08}

 const attackRange=isBoss?1.34:isCrawler?1.04:isSprinter?1.08:1.00;
 const movementClearance=isBoss?.50:ZOMBIE_COLLISION_RADIUS;
 if(d>attackRange){let nx=dx/td,nz=dz/td,sx=-nz,sz=nx;
 let sepX=0,sepZ=0;
 for(const o of active){
   if(o===z)continue;
   const ox=z.g.position.x-o.g.position.x,oz=z.g.position.z-o.g.position.z,od2=ox*ox+oz*oz;
   if(od2>0&&od2<2.7225){const od=Math.sqrt(od2),push=(1.65-od)/od;sepX+=ox*push;sepZ+=oz*push}
 }
 nx+=sepX*.55;nz+=sepZ*.55;
 let nl=Math.hypot(nx,nz)||1;nx/=nl;nz/=nl;

 // Look ahead instead of waiting to physically grind into a wall/car.
 const followingRoute=!!zombieRouteWaypoint(z);
 const probeDist=(huntMode?1.55:1.15)+Math.min(.75,z.speed*.16);
 const aheadBlocked=zombiePointBlocked(z.g.position.x+nx*probeDist,z.g.position.z+nz*probeDist,movementClearance);
 if(!followingRoute&&aheadBlocked&&z.avoidT<=0){
   z.avoidSide=chooseZombieAvoidSide(z,nx,nz,movementClearance);
   z.avoidT=huntMode?1.05:.78;
 }
 if(!followingRoute&&z.avoidT>0){
   const ax=-nz*z.avoidSide,az=nx*z.avoidSide;
   const direct=huntMode?.34:.24;
   nx=ax*(1-direct)+nx*direct;
   nz=az*(1-direct)+nz*direct;
   const al=Math.hypot(nx,nz)||1;nx/=al;nz/=al;
 }

 let zig=Math.sin(z.phase*.55)*z.strafe*z.zig*.28,
 surge=1+(Math.sin(z.phase*1.35)>.72?z.surge*0.6:0),
 shamble=(z.nightmareType==="twitch"?1.00:z.nightmareType==="brute"?.88:z.nightmareType==="crawler"?.90:.84)
          +Math.max(0,Math.sin(z.phase*z.gait))*(z.nightmareType==="twitch"?.22:.14)*z.lurch,
 // v420: bullet hits are visual reactions, not a movement freeze.
       stun=z.stagger>0?(kind==="boss"?.72:1):1,
 limpSlow=Math.max(.42,1-z.legDamage*.18-z.limp*.08);
 const bossCharging=kind==="boss"&&z.bossAttackState==="charge";
 const bossPressuring=kind==="boss"&&!z.bossAttackState&&playerDistToZombie>10;
 if(kind==="boss"&&z.bossAttackState==="slam")stun*=.05;
 let ox=z.g.position.x,oz=z.g.position.z;
 // Final-five rush remains capped below the player's 9 m/s sprint. Boss pressure
 // uses the same principle: it beats walking, but a committed full sprint escapes.
 const huntTargetSpeed=playerDistToZombie>32?5.8:playerDistToZombie>16?5.4:5.0;
 let navSpeed=huntMode?Math.min(6.15,Math.max(huntTargetSpeed,z.speed)):z.speed;
 if(huntMode&&kind==="crawler")navSpeed*=.75;
 if(kind==="boss")navSpeed=bossCharging?BOSS_CHARGE_SPEED:bossPressureSpeed(playerDistToZombie,z.speed);
 const motionScale=(huntMode||bossCharging||bossPressuring)?1:surge*shamble;
let stepX=(nx+sx*zig)*navSpeed*motionScale*stun*limpSlow*dt,stepZ=(nz+sz*zig)*navSpeed*motionScale*stun*limpSlow*dt;
let moveLen=Math.hypot(stepX,stepZ);
const strideRate=(kind==="sprinter"||kind==="infected"||kind==="acidic")?8.8:kind==="boss"?5.0:kind==="crawler"?6.2:6.8;
z.phase += moveLen*strideRate;
let zp=moveZombieSmart(z,ox,oz,stepX,stepZ,movementClearance);z.g.position.x=zp.x;z.g.position.z=zp.z;
resolveZombiePlayerContact(z,ox,oz);
 // Preserve actual pre-death planar velocity so a lethal hit does not erase
 // forward motion before the body goes limp.
 z.motionVX=(z.g.position.x-ox)/Math.max(dt,.001);
 z.motionVZ=(z.g.position.z-oz)/Math.max(dt,.001);

 const moved=Math.hypot(z.g.position.x-ox,z.g.position.z-oz);
 if(moveLen>.012&&moved<moveLen*.28){
   z.stuckT=(z.stuckT||0)+dt;
 }else{
   z.stuckT=Math.max(0,(z.stuckT||0)-dt*2.5);
 }
 if(z.stuckT>.30){
   z.navForceRepath=true;
   z.navCheckT=0;
   z.navPath=null;z.navIndex=0;
   if(z.navFlipCooldown<=0){
     // Do not blindly reverse direction: that caused zombies to ping-pong at
     // the same wall. Probe both sides and commit to the more open/playerward one.
     z.avoidSide=chooseZombieAvoidSide(z,nx,nz,movementClearance);
     z.navFlipCooldown=1.35;
   }
   z.avoidT=.85;
   z.stuckT=0;
   z.think=0;
 }if(z.stagger>0){const sr=z.kind==="boss"?.07:.24;z.torso.rotation.z+=z.staggerDir*sr;z.head.rotation.z-=z.staggerDir*sr*.55;if(z.kind==="boss"){z.g.position.x-=nx*.18*dt;z.g.position.z-=nz*.18*dt;}}if(z.step<=0&&d<14){zStep(Math.max(.018,.10*(1-d/16)));z.step=Math.max(.34,.62-z.speed*.035+rnd()*.18)}}else if(!spinTopDecoy){
 if(z.attackAnim>0&&d>.001){
   const ax=(px-z.g.position.x)/d,az=(pz-z.g.position.z)/d;
   const ox=z.g.position.x,oz=z.g.position.z,lunge=(z.kind==="boss"?.38:z.kind==="crawler"?.16:.28)*dt;
   const ap=moveZombieSmart(z,ox,oz,ax*lunge,az*lunge,movementClearance);z.g.position.x=ap.x;z.g.position.z=ap.z;resolveZombiePlayerContact(z,ox,oz);
 }
 if(z.cool<=0&&!(z.kind==="boss"&&z.bossAttackState))bite(z)
}
 if(z.blastT>0){
   z.blastT=Math.max(0,z.blastT-dt);
   const ox=z.g.position.x,oz=z.g.position.z;
   const bp=slideBuilding(ox,oz,ox+(z.blastVX||0)*dt,oz+(z.blastVZ||0)*dt,.50);
   z.g.position.x=bp.x;z.g.position.z=bp.z;
   const bd=Math.exp(-dt*5.0);z.blastVX*=bd;z.blastVZ*=bd;
   const lean=(z.blastT/.55)*(z.blastLean||0);
   if(z.rigVisual){
     const chest=rigBone(z,"Chest"),headB=rigBone(z,"Head"),hips=rigBone(z,"Hips");
     if(chest)chest.rotation.z+=lean;
     if(headB)headB.rotation.z-=lean*.65;
     if(hips)hips.rotation.z+=lean*.35;
   }else{
     if(z.torso)z.torso.rotation.z+=lean;
     if(z.head)z.head.rotation.z-=lean*.65;
   }
 }
 syncRadiatedGreenGuy(z,dt);syncBasicWalkerVisual(z,dt);
 if(z.groan<=0&&d<30){groan(Math.max(.025,.19*(1-d/32)));z.groan=Math.max(.8,1.7-wave*.04)+rnd()*2.8}}if(active.length===0&&waveSpawned>=waveTarget)beginBreak()}
const perfGuard=createPerformanceGuard({
 renderer:ren,
 livingCount,
 getFxCounts:()=>({parts:parts.length,impacts:impacts.length,casings:casings.length}),
 enabled:true,
 consoleLogging:false
}); // HUD stays visible; console spam stays off unless explicitly needed
setupWebGLContextLossHandler(cv,()=>show("GRAPHICS RESET — REFRESH IF NEEDED"));
setupRendererResize({renderer:ren,camera:cam});
function frame(t){
 let dt=Math.min(.04,(t-last)/1000);last=t;
 if(shopLowPower){
   // Shop UI is DOM-based, so the 3D world can stay frozen. Redraw at only 4 FPS
   // and throttle the frame callback itself so CPU + GPU both get a real break.
   if(t-lastShopRenderAt>=250){lastShopRenderAt=t;ren.render(scene,cam)}
   setTimeout(()=>requestAnimationFrame(frame),250);return;
 }
 if(!paused)update(dt);
 updateStreetLampLighting(t);
 updateRainEffect(dt,t);
 earlyNightSky.position.copy(cam.position);
 earlyNightSkyUniforms.uTime.value=t*.001;
 ren.render(scene,cam);
 requestAnimationFrame(frame)
}
requestAnimationFrame(frame);
function reset(){runSequence++;reloadSequence++;paused=false;pauseStartedAt=0;pausedAccumulatedMs=0;shopLowPower=false;shopPauseStartedAt=0;shopPausedAccumulatedMs=0;lastShopRenderAt=0;pauseOverlay.classList.remove("show");initAudio();stopAuto();clearKeys();runStartTime=gameTimeNow();for(let z of zombies)releaseZombieVisual(z);zombies=[];for(let p of parts)scene.remove(p.q);parts=[];for(let c of casings)scene.remove(c.q);casings=[];for(let g of thrown)scene.remove(g.q);thrown.length=0;for(let p of impacts)scene.remove(p.q);impacts=[];for(let d of drops)if(d.g.parent)scene.remove(d.g);drops=[];for(let k of kits){if(k.used){scene.add(k.g);k.used=false}}px=0;pz=-15;playerGroundY=0;yaw=0;pitch=0;playerVX=0;playerVZ=0;lastPX=0;lastPZ=-15;recoil=0;stepTimer=0;aimX=0;aimY=0;health=100;healthRegenCooldown=0;healthRegenShown=100;kills=0;heads=0;cash=0;wave=1;weapon="rifle";magSize=12;damageLevel=1;reloadLevel=0;unlocked={rifle:true,smg:false,shotgun:false,pistol:true,dmr:false,grenadeLauncher:false,m240:false,awm:false};ammoState={rifle:{mag:12,reserve:72},smg:{mag:30,reserve:90},shotgun:{mag:8,reserve:30},pistol:{mag:16,reserve:999999},dmr:{mag:10,reserve:30},grenadeLauncher:{mag:0,reserve:0},m240:{mag:100,reserve:200},awm:{mag:5,reserve:20}};grenades=2;nukes=0;nukeInProgress=false;waveTarget=0;waveSpawned=0;aiming=false;aimBlend=0;awmReadyAt=0;cam.fov=70;cam.updateProjectionMatrix();gun.scale.setScalar(1);scopeOverlay.classList.remove("show");cross.style.opacity="1";currentBoss=null;bossWaveName="";usedBossNames=[];hideBossHud(bossHUD);sprintEnergy=100;sprintLocked=false;sprintUiPct=-1;sprintUiColor="";sprintUiState="";updateSprintUI();renderShopNote(shopNote,"Take your time. The next wave will not start until you press Ready.");rebuildGun();dying=false;between=false;reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";resetRunUiOverlays({death,announce,shop,hitmarker,damage,nukeFlash,nukeShock,msg});clearTimeout(hitTimer);hideStartScreen(startScreen);document.body.style.cursor="";running=true;pauseBtn.classList.add("show");spawnWave();ui();cv.focus();if(document.pointerLockElement!==cv){try{cv.requestPointerLock?.()}catch(_){}}}
rebuildGun();setupResetButtons(reset);
setupControlsModal();
const weaponHotkeys={Digit1:"rifle",Digit2:"smg",Digit3:"shotgun",Digit4:"pistol",Digit5:"dmr",Digit6:"grenadeLauncher",Digit7:"m240",Digit8:"awm"};
const onKeyDown=e=>{let k=e.key.toLowerCase(),hotWeapon=weaponHotkeys[e.code],gameKey=["w","a","s","d","r","g","n","shift"].includes(k)||!!hotWeapon;if(k==="p"&&!e.repeat){setGamePaused(!paused);e.preventDefault();return}if(paused||between){if(gameKey)e.preventDefault();return}if(k in keys)keys[k]=true;if(k==="r"&&!e.repeat)reload();if(k==="g"&&!e.repeat)throwGrenade();if(k==="n"&&!e.repeat)detonateNuke();if(hotWeapon&&!e.repeat)setWeapon(hotWeapon);if(gameKey)e.preventDefault()};
setupKeyDown(onKeyDown);
const onWeaponWheel=e=>{
 if(!running||paused||dying||between||document.pointerLockElement!==cv)return;
 if(Math.abs(e.deltaY)<1)return;
 e.preventDefault();
 cycleWeapon(e.deltaY>0?1:-1);
};
document.addEventListener("wheel",onWeaponWheel,{passive:false});
const onKeyUp=e=>{let k=e.key.toLowerCase();if(k in keys)keys[k]=false};
setupKeyUp(onKeyUp);
const onInputFocusLost=()=>{clearKeys();stopAuto();setAim(false);if(running&&!dying&&!between&&!paused)setGamePaused(true)};
setupFocusSafety({onFocusLost:onInputFocusLost});
const onPointerLockChanged=()=>{
 if(document.pointerLockElement!==cv){
   stopAuto();setAim(false);
   if(between){document.body.style.cursor="default";shop.style.cursor="default"}
   else if(running&&!dying&&!paused)setGamePaused(true);
 }else{
   document.body.style.cursor="";
   if(running&&!between&&!dying)show("AIM LOCKED");
 }
};
setupPointerLockChange(onPointerLockChanged);
const onMouseMove=e=>{if(!paused&&document.pointerLockElement===cv){const adsLook=aiming?(weapon==="awm"?.34:.72):1;yaw-=e.movementX*lookSensitivity*adsLook;pitch-=e.movementY*lookSensitivity*.9*adsLook;pitch=Math.max(-1.05,Math.min(1.05,pitch));aimX=0;aimY=0;}};
setupMouseMove(onMouseMove);
const onMouseDown=e=>{
 if(paused)return;
 if(e.button===2){
   if(document.pointerLockElement===cv)setAim(true);
   e.preventDefault();return;
 }
 if(e.button===0){
   if(document.pointerLockElement!==cv){
     if(e.target===cv){cv.focus();cv.requestPointerLock?.();e.preventDefault()}
     return;
   }
   triggerDown();e.preventDefault();return;
 }
};
const onMouseUp=e=>{
 if(e.button===0)triggerUp();
 if(e.button===2)setAim(false);
};
const onPointerCancel=()=>{triggerUp();setAim(false)};
setupMouseActions({onMouseDown,onMouseUp,onPointerCancel});
setupGameContextMenuGuard({canvas:cv});
updateSprintUI();ui();

let runtimeErrorShown=false;
const onRuntimeError=e=>{
 if(runtimeErrorShown)return;runtimeErrorShown=true;
 showRuntimeErrorOverlay(e.message||"unknown error");
 console.error("City Outbreak runtime error",e.error||e.message);
};
setupRuntimeErrorListener(onRuntimeError);

