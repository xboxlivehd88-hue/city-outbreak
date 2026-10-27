'use strict';
// A read-only, one-shot version inquiry. It never downloads or executes code.
const https=require('node:https');
const {URL}=require('node:url');
const MANIFEST_URL='https://xboxlivehd88-hue.github.io/city-outbreak/updates/windows.json';
const MAX_BYTES=4096;
const VERSION_RE=/^(0|[1-9]\d{0,2})\.(0|[1-9]\d{0,2})\.(0|[1-9]\d{0,3})$/;
function parseVersion(value){
 if(typeof value!=='string'||!VERSION_RE.test(value))throw Error('Invalid version');
 return value.split('.').map(Number);
}
function compareVersions(a,b){
 const aa=parseVersion(a),bb=parseVersion(b);
 for(let i=0;i<3;i++)if(aa[i]!==bb[i])return Math.sign(aa[i]-bb[i]);
 return 0;
}
function validReleasePage(raw){
 if(typeof raw!=='string'||raw.length>250)throw Error('Invalid release page');
 const u=new URL(raw);
 if(u.protocol!=='https:'||u.host!=='github.com'||u.username||u.password||u.search||u.hash)
   throw Error('Release page must be official GitHub HTTPS');
 if(!/^\/xboxlivehd88-hue\/city-outbreak\/(?:actions\/runs\/[1-9]\d{0,18}|releases\/tag\/[A-Za-z0-9._-]{1,70})$/.test(u.pathname))
   throw Error('Release page must identify an official CI run or release tag');
 return u.toString();
}
function validateManifest(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||value.schema!==1)throw Error('Invalid update manifest schema');
 parseVersion(value.version);
 return {version:value.version,releasePage:validReleasePage(value.releasePage)};
}
function fetchManifest(){
 return new Promise((resolve,reject)=>{
  let completed=false;
  const finish=(error,value)=>{if(completed)return;completed=true;if(error)reject(error);else resolve(value)};
  const req=https.get(MANIFEST_URL,{
   timeout:5000,
   headers:{Accept:'application/json','Cache-Control':'no-cache','User-Agent':'CityOutbreak-Version-Check'}
  },res=>{
   if(res.statusCode!==200){res.resume();finish(Error('Version manifest HTTP '+res.statusCode));return}
   const ct=String(res.headers['content-type']||'');
   if(!/application\/json/i.test(ct)){res.resume();finish(Error('Unexpected manifest content type'));return}
   let payload='',size=0;
   res.setEncoding('utf8');
   res.on('data',chunk=>{
    size+=Buffer.byteLength(chunk);
    if(size>MAX_BYTES){req.destroy(Error('Version manifest too large'));return}
    payload+=chunk;
   });
   res.on('end',()=>{
    if(completed)return;
    try{finish(null,validateManifest(JSON.parse(payload)))}catch(error){finish(error)}
   });
   res.on('error',e=>finish(e));
  });
  req.on('timeout',()=>req.destroy(Error('Update check timed out')));
  req.on('error',e=>finish(e));
 });
}
async function checkForUpdate(currentVersion,fetcher=fetchManifest){
 parseVersion(currentVersion);
 try{
  const remote=validateManifest(await fetcher());
  return compareVersions(remote.version,currentVersion)>0?
   {status:'available',latest:remote.version,releasePage:remote.releasePage}:
   {status:'current',current:currentVersion};
 }catch(error){return {status:'unavailable',reason:String(error?.message||error).slice(0,120)}}
}
module.exports={MANIFEST_URL,parseVersion,compareVersions,validReleasePage,validateManifest,fetchManifest,checkForUpdate};
