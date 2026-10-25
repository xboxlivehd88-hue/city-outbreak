'use strict';
// Local, offline asset server for the Windows Development Edition.
// No remote scripts, no exposed Node APIs, no arbitrary filesystem browsing.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const MIME = Object.freeze({
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.mjs':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.glb':'model/gltf-binary',
  '.gltf':'model/gltf+json',
  '.bin':'application/octet-stream',
  '.png':'image/png', '.jpg':'image/jpeg','.jpeg':'image/jpeg',
  '.webp':'image/webp', '.gif':'image/gif', '.svg':'image/svg+xml',
  '.wav':'audio/wav', '.mp3':'audio/mpeg', '.ogg':'audio/ogg',
  '.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf',
  '.ico':'image/x-icon'
});
const THREE_JS_CDN='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
const THREE_ADDONS_CDN='https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/';
const CSP=[
  "default-src 'self' blob: data:",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "connect-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "media-src 'self' blob: data:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-src 'none'"
].join('; ');

function replaceDesktopImportMap(html){
  if(!html.includes(THREE_JS_CDN)||!html.includes(THREE_ADDONS_CDN))
    throw Error('Expected pinned Three.js CDN import map; update desktop import map rewrite when browser imports change');
  return html.replaceAll(THREE_JS_CDN,'/vendor/three/build/three.module.js')
             .replaceAll(THREE_ADDONS_CDN,'/vendor/three/examples/jsm/');
}
function sendError(res,status,text){
  res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(text);
}
function inDirectory(root,file){
  const rel=path.relative(root,file);
  return rel===''||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel));
}
function createGameServer({gameRoot,threeRoot}){
  if(!path.isAbsolute(gameRoot)||!path.isAbsolute(threeRoot))
    throw Error('Game and Three.js paths must be absolute');
  const server=http.createServer(async(req,res)=>{
    if(req.method!=='GET'&&req.method!=='HEAD')return sendError(res,405,'Method not allowed');
    let url,pathname;
    try{
      url=new URL(req.url,'http://127.0.0.1');
      pathname=decodeURIComponent(url.pathname);
    }catch(_){return sendError(res,400,'Invalid URL')}
    if(pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').includes('..'))
      return sendError(res,403,'Forbidden');
    // Reject external webpages attempting to request localhost game assets.
    const expectedHost='127.0.0.1:'+req.socket.localPort;
    if(req.headers.host!==expectedHost)return sendError(res,403,'Invalid host');
    if(req.headers.origin&&req.headers.origin!=='http://'+expectedHost)
      return sendError(res,403,'External origin denied');
    if(req.headers['sec-fetch-site']==='cross-site')
      return sendError(res,403,'Cross-site request denied');
    const isVendor=pathname.startsWith('/vendor/three/');
    const relativePath=pathname==='/'?'index.html':
      isVendor?pathname.slice('/vendor/three/'.length):pathname.slice(1);
    if(!relativePath||relativePath.startsWith('.')||(!isVendor&&!/^(index\.html|src\/|assets\/)/.test(relativePath)))
      return sendError(res,403,'Forbidden');
    const root=isVendor?threeRoot:gameRoot;
    const full=path.resolve(root,relativePath);
    if(!inDirectory(root,full))return sendError(res,403,'Forbidden');
    const ext=path.extname(full).toLowerCase();
    if(!MIME[ext])return sendError(res,403,'Unsupported file type');
    try{
      const actual=await fs.promises.realpath(full);
      if(!inDirectory(await fs.promises.realpath(root),actual))return sendError(res,403,'Forbidden');
      const stat=await fs.promises.stat(actual);
      if(!stat.isFile())return sendError(res,404,'Not found');
      const headers={
        'Content-Type':MIME[ext],
        'X-Content-Type-Options':'nosniff',
        'Content-Security-Policy':CSP,
        'Cache-Control':'no-store',
        'Access-Control-Allow-Origin':'none'
      };
      // Rewrite only the import-map URLs on the desktop-served HTML. The
      // actual browser index.html in GitHub Pages is never modified.
      if(relativePath==='index.html'&&!isVendor){
        const html=replaceDesktopImportMap(await fs.promises.readFile(actual,'utf8'));
        const payload=Buffer.from(html);
        res.writeHead(200,{...headers,'Content-Length':payload.length});
        if(req.method==='HEAD')res.end();else res.end(payload);
      }else{
        res.writeHead(200,{...headers,'Content-Length':stat.size});
        if(req.method==='HEAD')res.end();
        else fs.createReadStream(actual).pipe(res);
      }
    }catch(err){
      sendError(res,err?.code==='ENOENT'?404:500,err?.code==='ENOENT'?'Not found':'Local asset error');
    }
  });
  return server;
}
async function startGameServer(opts){
  const server=createGameServer(opts);
  await new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.listen(0,'127.0.0.1',resolve);
  });
  const address=server.address();
  return {server,origin:'http://127.0.0.1:'+address.port};
}
module.exports={createGameServer,startGameServer,replaceDesktopImportMap};
