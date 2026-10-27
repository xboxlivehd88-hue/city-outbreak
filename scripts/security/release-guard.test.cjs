'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {checkProject}=require('./release-guard.cjs');
const root=path.resolve(__dirname,'../..');
const prodPaths=require('node:child_process').execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
test('actual repository passes the security policy',()=>assert.deepEqual(checkProject(root,prodPaths),[]));
test('tampering with security-sensitive settings or adding executables breaks the policy',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'city-security-'));
 try{
  for(const name of ['desktop/package.json','desktop/main.cjs','desktop/mode-policy.cjs','desktop/server.cjs','index.html']){
    const full=path.join(temp,name);
    fs.mkdirSync(path.dirname(full),{recursive:true});
    fs.copyFileSync(path.join(root,name),full);
  }
  const file=path.join(temp,'desktop/main.cjs');
  fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('nodeIntegration:false','nodeIntegration:true'));
  const failures=checkProject(temp,['desktop/main.cjs','desktop/package.json','assets/suspicious.exe']);
  assert.ok(failures.some(e=>e.includes('Node integration')));
  assert.ok(failures.some(e=>e.includes('Unexpected Windows executable')));
 }finally{fs.rmSync(temp,{recursive:true,force:true})}
});
