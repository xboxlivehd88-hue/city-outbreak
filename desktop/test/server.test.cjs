'use strict';
const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {startGameServer,replaceDesktopImportMap}=require('../server.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'city-desktop-'));
const game=path.join(root,'game'),three=path.join(root,'three');
fs.mkdirSync(path.join(game,'src'),{recursive:true});
fs.mkdirSync(path.join(game,'assets'),{recursive:true});
fs.mkdirSync(path.join(three,'build'),{recursive:true});
fs.mkdirSync(path.join(three,'examples','jsm'),{recursive:true});
const original='<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"}}</script>';
fs.writeFileSync(path.join(game,'index.html'),original);
fs.writeFileSync(path.join(game,'src','game.js'),'export const loaded = true;');
fs.writeFileSync(path.join(game,'assets','model.glb'),Buffer.from([1,2,3,4]));
fs.writeFileSync(path.join(three,'build','three.module.js'),'export const THREE = true;');
let server,origin;
test('offline desktop server serves same game with LOCAL Three.js import map',async()=>{
  ({server,origin}=await startGameServer({gameRoot:game,threeRoot:three}));
  const response=await fetch(origin+'/');
  const html=await response.text();
  assert.equal(response.status,200);
  assert.ok(html.includes('/vendor/three/build/three.module.js'));
  assert.ok(html.includes('/vendor/three/examples/jsm/'));
  assert.ok(!html.includes('cdn.jsdelivr.net'));
  assert.equal(fs.readFileSync(path.join(game,'index.html'),'utf8'),original);
  assert.ok(response.headers.get('content-security-policy'));
});
test('serves versioned JavaScript, local Three.js and original model bytes',async()=>{
  const js=await fetch(origin+'/src/game.js?v=773');
  assert.equal(js.status,200);assert.match(js.headers.get('content-type'),/javascript/);
  assert.match(await js.text(),/loaded = true/);
  const vendor=await fetch(origin+'/vendor/three/build/three.module.js');
  assert.equal(vendor.status,200);
  assert.match(await vendor.text(),/THREE = true/);
  const asset=await fetch(origin+'/assets/model.glb?v=1');
  assert.deepEqual([...new Uint8Array(await asset.arrayBuffer())],[1,2,3,4]);
});
test('blocks repo source disclosure, unsupported files and cross-root paths',async()=>{
  assert.equal((await fetch(origin+'/CITY_OUTBREAK_HANDOFF.md')).status,403);
  assert.equal((await fetch(origin+'/desktop/main.cjs')).status,403);
  assert.equal((await fetch(origin+'/assets/secret.cjs')).status,403);
  assert.equal((await fetch(origin+'/assets/%5csecret.glb')).status,403);
  assert.equal((await fetch(origin+'/src/does-not-exist.js')).status,404);
  assert.equal((await fetch(origin+'/index.html',{method:'POST'})).status,405);
  assert.equal((await fetch(origin+'/',{headers:{Origin:'https://attacker.example'}})).status,403);
  // undici fetch ignores a custom Host header; use raw HTTP to test spoofing.
  const http=require('node:http');
  const target=new URL(origin);
  const forgedHostStatus=await new Promise((resolve,reject)=>{
    const req=http.request({hostname:target.hostname,port:target.port,path:'/',headers:{Host:'attacker.example'}},res=>{
      res.resume();resolve(res.statusCode);
    });
    req.on('error',reject);req.end();
  });
  assert.equal(forgedHostStatus,403);
  assert.equal((await fetch(origin+'/',{headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);
});
test('missing CDN import map fails rather than silently requiring internet',()=>{
  assert.throws(()=>replaceDesktopImportMap('<h1>bad import map</h1>'),/Expected pinned Three.js/);
});
after(async()=>{
  if(server)await new Promise(resolve=>server.close(resolve));
  fs.rmSync(root,{recursive:true,force:true});
});
