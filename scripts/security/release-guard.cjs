'use strict';
// First-party, dependency-free fail-closed release policy. This catches
// inadvertent unsafe desktop changes and unexpected native files in Git.
// It is NOT a malware detector or a substitute for CodeQL / Defender.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..');
function read(relative,root=ROOT){return fs.readFileSync(path.join(root,relative),'utf8')}
function checkProject(root=ROOT,trackedPaths=null){
 const problems=[];
 const fail=(condition,message)=>{if(!condition)problems.push(message)};
 const pkg=JSON.parse(read('desktop/package.json',root));
 fail(pkg.build?.publish===null,'Native updater / publishing must remain disabled until signed release process exists');
 fail(pkg.build?.asar===true,'Windows application should package core native JavaScript in asar');
 fail(!pkg.scripts?.preinstall&&!pkg.scripts?.install&&!pkg.scripts?.postinstall&&!pkg.scripts?.prepare,
   'Unexpected npm install lifecycle script in desktop/package.json');
 for(const [name,ver] of Object.entries({...pkg.dependencies,...pkg.devDependencies})){
   fail(/^\d+\.\d+\.\d+(?:-[\da-zA-Z.-]+)?$/.test(ver),
     'Package '+name+' needs an exact semver version rather than a moving range');
 }
 fail(!Object.keys({...pkg.dependencies,...pkg.devDependencies}).some(k=>/^(electron-updater|node-pty|remote|express)$/i.test(k)),
      'Unexpected native updater / remote-access package');
 const main=read('desktop/main.cjs',root);
 for(const [expression,label] of [
   [/nodeIntegration\s*:\s*false/,'Node integration must be disabled'],
   [/contextIsolation\s*:\s*true/,'Renderer context isolation must be enabled'],
   [/sandbox\s*:\s*true/,'Chromium sandbox must be enabled'],
   [/webSecurity\s*:\s*true/,'Web security must remain enabled'],
   [/allowRunningInsecureContent\s*:\s*false/,'Insecure content must be blocked'],
   [/webviewTag\s*:\s*false/,'Electron webview tags must be disabled'],
   [/setWindowOpenHandler\s*\(/,'Popups must be explicitly handled'],
   [/setPermissionRequestHandler\s*\(/,'Permission requests must be restricted'],
   [/allowedNavigation\s*\(/,'Navigation must be allowlisted']
 ])fail(expression.test(main),label);
 for(const [expression,label] of [
   [/\bpreload\s*:/,'No privileged preload script is approved'],
   [/\b(?:autoUpdater|electron-updater|shell\.openExternal)\b/,'No native updater/external app launcher is approved'],
   [/\bnodeIntegration\s*:\s*true/,'Dangerous native Node integration found'],
   [/\bwebSecurity\s*:\s*false/,'Web security disabled'],
   [/\bsandbox\s*:\s*false/,'Renderer sandbox disabled'],
   [/\bwebviewTag\s*:\s*true/,'Unsafe webview enabled']
 ])fail(!expression.test(main),label);
 const mode=read('desktop/mode-policy.cjs',root);
 fail(mode.includes("const LIVE_URL='https://xboxlivehd88-hue.github.io/city-outbreak/'"),
     'Official live URL changed; manual security review required');
 fail(/url\.hostname===['"]xboxlivehd88-hue\.github\.io['"]/.test(mode),
     'Online hostname restriction missing');
 fail(/url\.protocol===['"]https:['"]/.test(mode),'Online content must require HTTPS');
 const server=read('desktop/server.cjs',root);
 fail(server.includes("server.listen(0,'127.0.0.1',resolve)"),'Local asset server must bind loopback only');
 fail(server.includes('req.headers.host!==expectedHost'),'Local asset server host filtering missing');
 fail(server.includes("req.headers['sec-fetch-site']==='cross-site'"),
     'Local asset server cross-site filtering missing');
 const browser=read('index.html',root);
 fail(browser.includes('https://cdn.jsdelivr.net/npm/three@0.180.0/'),
     'Unexpected change to pinned browser Three.js CDN version');
 const scripts=[...browser.matchAll(/<script\b[^>]*src\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]);
 fail(scripts.length===1&&/^\.\/src\/game\.js\?v=\d+$/.test(scripts[0]),
      'Unexpected page scripts; require source review of every added script');
 const paths=trackedPaths??execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
 const allowedNative=new Set(['desktop/scripts/verify-windows-release.ps1']);
 for(const file of paths){
   if(/\.(?:exe|dll|sys|scr|com|msi|msp|bat|cmd|vbs|vbe|hta|ps1)$/i.test(file)&&!allowedNative.has(file))
     problems.push('Unexpected Windows executable/script in repository: '+file);
 }
 for(const rel of paths.filter(p=>/^src\/.*\.(?:js|mjs)$/.test(p))){
   const code=read(rel,root);
   if(/\b(?:eval\s*\(|new\s+Function\s*\(|require\s*\(\s*['"](?:node:)?child_process['"]\s*\))/.test(code))
     problems.push('Dangerous dynamic code or process launch pattern in '+rel);
 }
 return problems;
}
if(require.main===module){
 try{
   const failures=checkProject();
   if(failures.length){console.error('CITY OUTBREAK security policy FAILED:\n'+failures.map(x=>'  - '+x).join('\n'));process.exitCode=1;}
   else console.log('CITY OUTBREAK security policy PASS: desktop sandbox, pinned online origin, no unexpected native executables');
 }catch(error){console.error('CITY OUTBREAK security policy ERROR:',error.message);process.exitCode=1;}
}
module.exports={checkProject};
