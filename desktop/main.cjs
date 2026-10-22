'use strict';
// CITY OUTBREAK desktop shell. Gameplay remains in ../src/game.js.
// Local-only assets and sandboxed renderer; do not allow external navigation.
const {app,BrowserWindow,session}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
const {startGameServer}=require('./server.cjs');

let win,gameServer,origin,watchers=[],reloadTimer;
app.setAppUserModelId('com.cityoutbreak.desktopdev');

function enableLocalDevelopmentReload(root){
  if(app.isPackaged)return;
  const reload=()=>{
    clearTimeout(reloadTimer);
    reloadTimer=setTimeout(()=>{
      if(win&&!win.isDestroyed())win.webContents.reloadIgnoringCache();
    },350);
  };
  for(const dir of [path.join(root,'src'),path.join(root,'index.html')]){
    try{watchers.push(fs.watch(dir,{recursive:true},reload))}
    catch(err){console.warn('Dev file watcher unavailable:',dir,err.message)}
  }
}
async function openGame(){
  const gameRoot=app.isPackaged?path.join(process.resourcesPath,'game'):path.resolve(__dirname,'..');
  const threeRoot=path.join(app.getAppPath(),'node_modules','three');
  const started=await startGameServer({gameRoot,threeRoot});
  gameServer=started.server;origin=started.origin;
  session.defaultSession.setPermissionRequestHandler((webContents,permission,callback)=>{
    const sameWindow=win&&webContents===win.webContents;
    const isLocal=sameWindow&&webContents.getURL().startsWith(origin+'/');
    callback(!!isLocal&&['pointerLock','fullscreen','clipboard-sanitized-write'].includes(permission));
  });
  win=new BrowserWindow({
    width:1440,height:900,minWidth:960,minHeight:600,
    title:'CITY OUTBREAK — Windows Development Edition',
    backgroundColor:'#171b22',
    autoHideMenuBar:true,
    webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,
      webSecurity:true,allowRunningInsecureContent:false}
  });
  win.webContents.on('will-attach-webview',event=>event.preventDefault());
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',(event,url)=>{
    if(!url.startsWith(origin+'/'))event.preventDefault();
  });
  win.webContents.on('before-input-event',(event,input)=>{
    if(input.type!=='keyDown')return;
    if(input.key==='F11'){win.setFullScreen(!win.isFullScreen());event.preventDefault()}
    if(!app.isPackaged&&input.key==='F12'){win.webContents.toggleDevTools();event.preventDefault()}
    if(!app.isPackaged&&(input.key==='F5'||(input.control&&input.key.toLowerCase()==='r'))){
      win.webContents.reloadIgnoringCache();event.preventDefault();
    }
  });
  win.webContents.on('render-process-gone',(_event,details)=>{
    console.error('CITY OUTBREAK renderer process exited:',details);
  });
  await win.loadURL(origin+'/index.html');
  enableLocalDevelopmentReload(gameRoot);
}
app.whenReady().then(openGame).catch(error=>{
  console.error('CITY OUTBREAK desktop startup failed:',error);
  app.quit();
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)void openGame()});
app.on('before-quit',()=>{
  clearTimeout(reloadTimer);
  for(const watcher of watchers)watcher.close();
  watchers=[];
  gameServer?.close();
});
