'use strict';
// Windows desktop always loads its bundled, locally-served game.
// Remote update manifest data must NEVER become a page navigation.
function allowedNavigation(candidate,_mode,offlineOrigin){
 if(typeof candidate!=='string'||candidate.length>2048)return false;
 let url,local;
 try{url=new URL(candidate);local=new URL(offlineOrigin)}catch(_){return false}
 return !url.username&&!url.password&&url.protocol==='http:'&&
  local.hostname==='127.0.0.1'&&url.origin===local.origin&&
  (url.pathname==='/'||url.pathname==='/index.html');
}
function normalizeMode(_value){return 'offline'}
module.exports={normalizeMode,allowedNavigation};
