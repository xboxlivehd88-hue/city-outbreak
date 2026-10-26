'use strict';
// CITY OUTBREAK desktop: sandboxed local snapshot and trusted GitHub Pages
// live-play mode. Remote content never receives Node integration or a preload.
const {app,BrowserWindow,session,Menu,dialog}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
const {startGameServer}=require('./server.cjs');
const {LIVE_URL,normalizeMode,allowedNavigation}=require('./mode-policy.cjs');
let win,gameServer,origin,effectiveMode='offline',preferredMode='offline';
let watchers=[],reloadTimer,loading=false;
app.setAppUserModelId('com.cityoutbreak.desktopdev');

function modeFile(){return path.join(app.getPath('userData'),'play-mode.json')}
function loadPreference(){
  try{return normalizeMode(JSON.parse(fs.readFileSync(modeFile(),'utf8')).mode)}
  catch(_){return 'offline'}
}
function savePreference(next){
  const file=modeFile();
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,JSON.stringify({mode:next})+'\n',{encoding:'utf8',mode:0o600});
}
function enableLocalDevelopmentReload(root){
  if(app.isPackaged)return;
  const reload=()=>{
    if(effectiveMode!=='offline')return;
    clearTimeout(reloadTimer);
    reloadTimer=setTimeout(()=>win&&!win.isDestroyed()&&win.webContents.reloadIgnoringCache(),350);
  };
  for(const dir of [path.join(root,'src'),path.join(root,'index.html')]){
    try{watchers.push(fs.watch(dir,{recursive:true},reload))}
    catch(err){console.warn('Dev file watcher unavailable:',dir,err.message)}
  }
}
function installMenu(){
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label:'GAME',submenu:[
      {label:'Play latest online (updates on launch)',type:'radio',checked:effectiveMode==='live',
       accelerator:'CmdOrCtrl+Shift+L',click:()=>void chooseMode('live')},
      {label:'Play offline (built-in version)',type:'radio',checked:effectiveMode==='offline',
       accelerator:'CmdOrCtrl+Shift+O',click:()=>void chooseMode('offline')},
      {type:'separator'},
      {label:'Refresh current game',accelerator:'F5',click:()=>win?.webContents.reloadIgnoringCache()},
      {label:'Fullscreen',accelerator:'F11',click:()=>win?.setFullScreen(!win.isFullScreen())},
      {type:'separator'},
      {label:'Quit',role:'quit'}
    ]},
    {label:'HELP',submenu:[
      {label:'How game updates work',click:()=>void dialog.showMessageBox(win,{
        type:'info',title:'CITY OUTBREAK — Updates',buttons:['OK'],message:'Online mode updates game content on each launch.',
        detail:'Online mode loads the official CITY OUTBREAK GitHub Pages game in a sandboxed window. Weapon, zombie and graphics fixes on GitHub Pages arrive the next time you open or refresh the game. Offline mode runs the bundled snapshot. Updating the Windows executable itself still requires a separately verified, signed distribution; no EXE is silently downloaded or executed.'
      })}
    ]}
  ]));
}
async function loadSelectedMode(next){
  if(loading||!win||win.isDestroyed())return;
  loading=true;
  effectiveMode=next;
  installMenu();
  try{
    await win.loadURL(next==='live'?LIVE_URL:origin+'/index.html');
    win.setTitle('CITY OUTBREAK — '+(next==='live'?'LIVE ONLINE':'OFFLINE SNAPSHOT'));
  }catch(err){
    if(next==='live'){
      console.warn('Official live game unavailable; switching to offline copy:',err.message);
      effectiveMode='offline';
      installMenu();
      try{await win.loadURL(origin+'/index.html')}catch(inner){console.error('Offline fallback failed:',inner)}
      await dialog.showMessageBox(win,{
        type:'warning',title:'Online game unavailable',buttons:['OK'],
        message:'Could not load the official live game.',
        detail:'CITY OUTBREAK opened the offline copy instead. Check your connection and choose GAME → Play latest online when it is available.'
      });
    }else{
      console.error('Offline game failed:',err);
    }
  }finally{loading=false}
}
async function chooseMode(next){
  if(loading||!win||win.isDestroyed())return;
  if(next!==effectiveMode){
    const choice=await dialog.showMessageBox(win,{
      type:'question',buttons:['Switch game','Cancel'],defaultId:1,cancelId:1,
      title:'Switch CITY OUTBREAK mode',
      message:'Switch to '+(next==='live'?'the latest online game':'the offline game')+'?',
      detail:'Switching restarts your current round. It does not download, install, or run an executable.'
    });
    if(choice.response!==0)return;
  }
  if(loading)return;
  try{savePreference(next);preferredMode=next}
  catch(err){console.warn('Could not save preferred mode:',err.message)}
  await loadSelectedMode(next);
}
async function openGame(){
  const gameRoot=app.isPackaged?path.join(process.resourcesPath,'game'):path.resolve(__dirname,'..');
  const threeRoot=app.isPackaged?path.join(process.resourcesPath,'vendor','three'):
      path.join(app.getAppPath(),'node_modules','three');
  const started=await startGameServer({gameRoot,threeRoot});
  gameServer=started.server;origin=started.origin;
  preferredMode=loadPreference();
  session.defaultSession.setPermissionRequestHandler((webContents,permission,callback)=>{
    const sameWindow=!!win&&webContents===win.webContents;
    const loaded=webContents.getURL();
    const isTrusted=sameWindow&&allowedNavigation(loaded,effectiveMode,origin);
    callback(!!isTrusted&&['pointerLock','fullscreen','clipboard-sanitized-write'].includes(permission));
  });
  win=new BrowserWindow({
    width:1440,height:900,minWidth:960,minHeight:600,
    title:'CITY OUTBREAK — Windows Development Edition',
    backgroundColor:'#171b22',autoHideMenuBar:false,
    webPreferences:{
      nodeIntegration:false,contextIsolation:true,sandbox:true,
      webSecurity:true,allowRunningInsecureContent:false,webviewTag:false
      // Deliberately NO preload: live websites must not have native APIs.
    }
  });
  win.webContents.on('will-attach-webview',event=>event.preventDefault());
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',(event,url)=>{
    if(!allowedNavigation(url,effectiveMode,origin))event.preventDefault();
  });
  win.webContents.on('will-redirect',(event,url)=>{
    if(!allowedNavigation(url,effectiveMode,origin))event.preventDefault();
  });
  win.webContents.on('render-process-gone',(_event,details)=>console.error('CITY OUTBREAK renderer exited:',details));
  // F12 debugging is development-only, never in the distributed EXE.
  win.webContents.on('before-input-event',(event,input)=>{
    if(app.isPackaged||input.type!=='keyDown'||input.key!=='F12')return;
    win.webContents.toggleDevTools();event.preventDefault();
  });
  await loadSelectedMode(preferredMode);
  enableLocalDevelopmentReload(gameRoot);
}
app.whenReady().then(openGame).catch(error=>{console.error('CITY OUTBREAK startup failed:',error);app.quit()});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('before-quit',()=>{
  clearTimeout(reloadTimer);
  for(const watcher of watchers)watcher.close();
  watchers=[];gameServer?.close();
});
