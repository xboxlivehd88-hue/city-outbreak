'use strict';
// Pin the only live-play destination. Never accept a user-controlled URL,
// redirects to a different host, or redirects outside the real game path.
const LIVE_URL='https://xboxlivehd88-hue.github.io/city-outbreak/';
function normalizeMode(value){return value==='live'?'live':'offline'}
function allowedNavigation(candidate,mode,offlineOrigin){
  if(typeof candidate!=='string'||candidate.length>2048)return false;
  let url;
  try{url=new URL(candidate)}catch(_){return false}
  if(url.username||url.password)return false;
  if(mode==='live'){
    return url.protocol==='https:'&&url.hostname==='xboxlivehd88-hue.github.io'&&
      url.port===''&& (url.pathname==='/city-outbreak/'||url.pathname==='/city-outbreak/index.html');
  }
  try{
    const local=new URL(offlineOrigin);
    return url.protocol==='http:'&&url.origin===local.origin&&
       (url.pathname==='/'||url.pathname==='/index.html');
  }catch(_){return false}
}
module.exports={LIVE_URL,normalizeMode,allowedNavigation};
