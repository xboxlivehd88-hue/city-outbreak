'use strict';
// CITY OUTBREAK desktop: offline gameplay; one HTTPS update-manifest request on
// startup, with NO polling, remote renderer, background download, or installer.
const {app,BrowserWindow,session,Menu,dialog,Notification,clipboard}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
const {startGameServer}=require('./server.cjs');
const {allowedNavigation}=require('./mode-policy.cjs');
const {checkForUpdate}=require('./update-check.cjs');
let win,gameServer,origin,watchers=[],reloadTimer,updateTimer;
let checking=false,updateInfo=null;
app.setAppUserModelId('com.cityoutbreak.desktopdev');

function enableLocalDevelopmentReload(root){
 if(app.isPackaged)return;
 const reload=()=>{
  clearTimeout(reloadTimer);
  reloadTimer=setTimeout(()=>win&&!win.isDestroyed()&&win.webContents.reloadIgnoringCache(),350);
 };
 for(const dir of [path.join(root,'src'),path.join(root,'index.html')]){
  try{watchers.push(fs.watch(dir,{recursive:true},reload))}
  catch(err){console.warn('Dev file watcher unavailable:',dir,err.message)}
 }
}
function updateTitle(){
 if(!win||win.isDestroyed())return;
 win.setTitle(updateInfo?.status==='available'?
  'CITY OUTBREAK — UPDATE AVAILABLE v'+updateInfo.latest:
  'CITY OUTBREAK — OFFLINE GAME v'+app.getVersion());
}
async function showUpdateInfo(info){
 if(!win||win.isDestroyed())return;
 if(info.status==='available'){
  const choice=await dialog.showMessageBox(win,{
   type:'info',title:'CITY OUTBREAK — Update available',
   message:'New Windows version '+info.latest+' is available',
   detail:'Your game will keep working offline. No files will be downloaded or installed automatically. To review the approved GitHub build, choose Copy link, then paste it into your browser. Do not bypass Chrome or Defender warnings.',
   buttons:['Copy official GitHub link','Later'],defaultId:1,cancelId:1,noLink:true
  });
  if(choice.response===0)clipboard.writeText(info.releasePage);
 }else if(info.status==='current'){
  await dialog.showMessageBox(win,{type:'info',title:'CITY OUTBREAK — Updates',
   message:'Your Windows version '+app.getVersion()+' is up to date.',
   detail:'The game only checks once at startup. You can check again from HELP.',
   buttons:['OK']});
 }else{
  await dialog.showMessageBox(win,{type:'warning',title:'CITY OUTBREAK — Updates',
   message:'Could not check for updates right now.',
   detail:'Your offline game still works. Try HELP → Check for updates now later.',
   buttons:['OK']});
 }
}
async function checkUpdates(manual=false){
 if(checking||!win||win.isDestroyed())return;
 checking=true;
 try{
  const result=await checkForUpdate(app.getVersion());
  updateInfo=result;
  updateTitle();
  installMenu();
  if(manual){await showUpdateInfo(result);return}
  if(result.status==='available'){
   // A non-modal Windows toast never interrupts the START GAME button.
   try{
    if(Notification.isSupported()){
     const notice=new Notification({
      title:'CITY OUTBREAK update available',
      body:'Version '+result.latest+' is ready. Open HELP → View available update.'
     });
     notice.show();
    }
   }catch(error){console.warn('Windows update notification unavailable:',error.message)}
  }
 }finally{checking=false}
}
function installMenu(){
 Menu.setApplicationMenu(Menu.buildFromTemplate([
  {label:'GAME',submenu:[
   {label:'Play offline — built-in version',enabled:false},
   {type:'separator'},
   {label:'Refresh current game',accelerator:'F5',click:()=>win?.webContents.reloadIgnoringCache()},
   {label:'Fullscreen',accelerator:'F11',click:()=>win?.setFullScreen(!win.isFullScreen())},
   {type:'separator'},
   {label:'Quit',role:'quit'}
  ]},
  {label:'HELP',submenu:[
   {label:'Check for updates now',click:()=>void checkUpdates(true)},
   {label:updateInfo?.status==='available'?'View available update v'+updateInfo.latest:'No pending update notice',
    enabled:updateInfo?.status==='available',
    click:()=>void showUpdateInfo(updateInfo)},
   {type:'separator'},
   {label:'How updates work',click:()=>void dialog.showMessageBox(win,{
    type:'info',title:'CITY OUTBREAK — Updates',buttons:['OK'],
    message:'Game files stay on your PC.',
    detail:'CITY OUTBREAK makes one short HTTPS request to the official version list when it opens. It checks only the version number and stops. You can check manually from HELP. It never streams gameplay, continuously polls, downloads or installs EXEs, or allows remote control. New builds are reviewed and installed manually.'
   })}
  ]}
 ]));
}
async function openGame(){
 const gameRoot=app.isPackaged?path.join(process.resourcesPath,'game'):path.resolve(__dirname,'..');
 const threeRoot=app.isPackaged?path.join(process.resourcesPath,'vendor','three'):
     path.join(app.getAppPath(),'node_modules','three');
 const started=await startGameServer({gameRoot,threeRoot});
 gameServer=started.server;origin=started.origin;
 session.defaultSession.setPermissionRequestHandler((webContents,permission,callback)=>{
  const sameWindow=!!win&&webContents===win.webContents;
  callback(!!sameWindow&&allowedNavigation(webContents.getURL(),'offline',origin)&&
   ['pointerLock','fullscreen','clipboard-sanitized-write'].includes(permission));
 });
 win=new BrowserWindow({
  width:1440,height:900,minWidth:960,minHeight:600,
  title:'CITY OUTBREAK — OFFLINE GAME',
  backgroundColor:'#171b22',autoHideMenuBar:false,
  webPreferences:{
   nodeIntegration:false,contextIsolation:true,sandbox:true,
   webSecurity:true,allowRunningInsecureContent:false,webviewTag:false
   // No preload; game page does not receive Node APIs.
  }
 });
 win.webContents.on('will-attach-webview',event=>event.preventDefault());
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(event,url)=>{
  if(!allowedNavigation(url,'offline',origin))event.preventDefault();
 });
 win.webContents.on('will-redirect',(event,url)=>{
  if(!allowedNavigation(url,'offline',origin))event.preventDefault();
 });
 win.webContents.on('render-process-gone',(_event,details)=>console.error('CITY OUTBREAK renderer exited:',details));
 win.webContents.on('before-input-event',(event,input)=>{
  if(app.isPackaged||input.type!=='keyDown'||input.key!=='F12')return;
  win.webContents.toggleDevTools();event.preventDefault();
 });
 installMenu();
 await win.loadURL(origin+'/index.html');
 updateTitle();
 enableLocalDevelopmentReload(gameRoot);
 // No live-play mode; previously saved LIVE preference is deliberately ignored.
 // Only a single HTTPS metadata request, after startup. CI smoke stays offline.
 if(process.env.CITY_DESKTOP_SMOKE!=='1'){
  updateTimer=setTimeout(()=>{void checkUpdates(false)},4000);
 }
}
app.whenReady().then(openGame).catch(error=>{console.error('CITY OUTBREAK startup failed:',error);app.quit()});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('before-quit',()=>{
 clearTimeout(reloadTimer);clearTimeout(updateTimer);
 for(const watcher of watchers)watcher.close();
 watchers=[];gameServer?.close();
});
