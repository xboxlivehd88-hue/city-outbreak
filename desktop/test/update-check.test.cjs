'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {MANIFEST_URL,compareVersions,validateManifest,checkForUpdate,validReleasePage}=require('../update-check.cjs');
const page='https://github.com/xboxlivehd88-hue/city-outbreak/actions/runs/40563474180';
const record={schema:1,version:'0.1.6',releasePage:page};
test('only the pinned HTTPS project manifest is contacted',()=>{
 assert.equal(MANIFEST_URL,'https://xboxlivehd88-hue.github.io/city-outbreak/updates/windows.json');
 assert.equal(compareVersions('0.1.7','0.1.6'),1);
 assert.equal(compareVersions('0.1.6','0.1.6'),0);
 assert.equal(compareVersions('0.1.5','0.1.6'),-1);
});
test('a newer verified manifest is notification-only',async()=>{
 assert.deepEqual(await checkForUpdate('0.1.5',async()=>record),{status:'available',latest:'0.1.6',releasePage:page});
 assert.deepEqual(await checkForUpdate('0.1.6',async()=>record),{status:'current',current:'0.1.6'});
 assert.deepEqual(await checkForUpdate('0.1.7',async()=>record),{status:'current',current:'0.1.7'});
});
test('reject malicious redirections, URL tricks, and invalid versions',()=>{
 for(const p of [
  'http://github.com/xboxlivehd88-hue/city-outbreak/actions/runs/40563474180',
  'https://github.com.evil.example/xboxlivehd88-hue/city-outbreak/actions/runs/40563474180',
  'https://github.com@evil.example/xboxlivehd88-hue/city-outbreak/actions/runs/40563474180',
  'https://github.com/xboxlivehd88-hue/city-outbreak/issues/1',
  'https://github.com/xboxlivehd88-hue/city-outbreak/actions/runs/40563474180?x=1',
  'file:///C:/Windows/System32/calc.exe'
 ])assert.throws(()=>validReleasePage(p));
 for(const version of ['v0.1.7','0.1.7-beta','1.2.3.4','-1.0.0','Infinity','0.01.6'])
  assert.throws(()=>validateManifest({...record,version}));
});
test('network or malformed manifest fails safely and leaves game playable',async()=>{
 const network=await checkForUpdate('0.1.6',async()=>{throw Error('offline')});
 assert.equal(network.status,'unavailable');
 const invalid=await checkForUpdate('0.1.6',async()=>({...record,releasePage:'https://evil.example'}));
 assert.equal(invalid.status,'unavailable');
});
