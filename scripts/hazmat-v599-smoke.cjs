const {chromium}=require("playwright"),fs=require("fs"),assert=require("node:assert/strict");
(async()=>{
 let browser,page;const report={build:599,passed:false};const errors=[];
 try{
  browser=await chromium.launch({headless:true,args:["--enable-unsafe-swiftshader","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]});
  page=await browser.newPage({viewport:{width:1200,height:800}});
  page.on("pageerror",e=>errors.push(String(e)));
  page.on("response",r=>{if(r.url().includes("/assets/zombie_hazmat.glb"))report.assetHttp=r.status()});
  await page.route(/\/src\/game\.js\?v=599$/,async route=>{
    const rsp=await route.fetch(),source=await rsp.text();
    const audit=String.raw