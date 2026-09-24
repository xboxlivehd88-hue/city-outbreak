#!/usr/bin/env python3
from pathlib import Path
p=Path("index.html")
s=p.read_text()
old_css='''#startScreen{position:absolute;inset:0;background:linear-gradient(180deg,#0d0f10f2,#15191cf2);display:flex;align-items:center;justify-content:center;text-align:center;z-index:5;padding:24px;box-sizing:border-box}
#startPanel{width:min(620px,92vw);background:#090b0dcc;border:1px solid #ffffff1f;border-radius:18px;padding:28px 30px 26px;box-shadow:0 20px 70px #000a;backdrop-filter:blur(5px)}
#startPanel h1{font-size:44px;letter-spacing:4px;margin:0 0 6px}
#startPanel .tagline{margin:0 0 20px;color:#bfc6ca;font-size:14px;letter-spacing:.5px}
#controlsCard{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;text-align:left;background:#ffffff08;border:1px solid #ffffff12;border-radius:12px;padding:14px 16px;margin:0 auto 18px}
.controlRow{display:flex;align-items:center;justify-content:space-between;gap:14px;color:#d8dde0;font-size:13px;padding:5px 0}
.key{display:inline-block;min-width:58px;text-align:center;padding:5px 8px;border-radius:7px;background:#1c2226;border:1px solid #ffffff24;color:#fff;font-weight:900;font-size:12px;box-shadow:inset 0 -2px 0 #0007}
#startActions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
#startScreen button{font-size:16px;font-weight:900;padding:11px 20px;border:0;border-radius:9px;cursor:pointer;margin:0}
#start{background:#e8e8e8;color:#111}
#restart{background:#2b3034;color:#eee;border:1px solid #ffffff20}
button{font-size:18px;padding:12px 20px;border:0;border-radius:9px;cursor:pointer;margin:6px}
.small{font-size:13px;color:#ddd;line-height:1.5}
@media(max-width:560px){#controlsCard{grid-template-columns:1fr}#startPanel h1{font-size:34px}#startPanel{padding:22px 18px}}
'''
new_css='''#startScreen{position:absolute;inset:0;background:#080909 url("assets/city-outbreak-start-v153.jpg") center center/cover no-repeat;display:block;z-index:5;box-sizing:border-box;overflow:hidden}
#startScreen:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.12),transparent 45%,rgba(0,0,0,.08));pointer-events:none}
#startPanel{position:absolute;left:50%;bottom:8.5%;transform:translateX(-50%);z-index:2;width:min(560px,90vw);text-align:center}
#startPanel h1,#startPanel .tagline{display:none}
#startActions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}
#startScreen button{font-size:16px;font-weight:900;letter-spacing:1.4px;padding:13px 24px;border-radius:8px;cursor:pointer;margin:0;box-shadow:0 8px 28px #000a}
#start{background:#dfe5e2e8;color:#111;border:1px solid #fff9;min-width:210px}
#restart{display:none}
#showControls{background:#0b1013d9;color:#e8edef;border:1px solid #ffffff55;min-width:132px}
#controlsModal{position:absolute;inset:0;z-index:4;display:none;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:#020405c7;backdrop-filter:blur(4px)}
#controlsModal.show{display:flex}
#controlsPanel{width:min(560px,92vw);max-height:82vh;overflow:auto;background:#0a0d0ff2;border:1px solid #ffffff30;border-radius:16px;padding:20px 22px;box-shadow:0 20px 70px #000c}
#controlsHeader{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #ffffff20}
#controlsHeader h2{margin:0;font-size:23px;letter-spacing:2px}
#closeControls{min-width:auto!important;padding:8px 11px!important;background:#252b2f!important;color:#fff!important;border:1px solid #ffffff28!important;box-shadow:none!important}
#controlsCard{display:grid;grid-template-columns:1fr 1fr;gap:7px 14px;text-align:left}
.controlRow{display:flex;align-items:center;justify-content:space-between;gap:14px;color:#d8dde0;font-size:13px;padding:6px 0;border-bottom:1px solid #ffffff0b}
.key{display:inline-block;min-width:58px;text-align:center;padding:5px 8px;border-radius:7px;background:#1c2226;border:1px solid #ffffff24;color:#fff;font-weight:900;font-size:12px;box-shadow:inset 0 -2px 0 #0007}
button{font-size:18px;padding:12px 20px;border:0;border-radius:9px;cursor:pointer;margin:6px}
.small{font-size:13px;color:#ddd;line-height:1.5}
@media(max-width:560px){#controlsCard{grid-template-columns:1fr}#startPanel{bottom:5.5%}#startActions{gap:8px}#startScreen button{font-size:13px;padding:11px 16px}#start{min-width:180px}}
'''
old_html='''<div id="startScreen"><div id="startPanel">
<h1>CITY OUTBREAK</h1>
<p class="tagline">Survive the outbreak. Gear up between waves. Boss fight every 10 rounds.</p>
<div id="controlsCard">
<div class="controlRow"><span>Move</span><span class="key">W A S D</span></div>
<div class="controlRow"><span>Aim / Look</span><span class="key">MOUSE</span></div>
<div class="controlRow"><span>Sprint</span><span class="key">SHIFT</span></div>
<div class="controlRow"><span>Fire</span><span class="key">LEFT CLICK</span></div>
<div class="controlRow"><span>Aim Down Sights</span><span class="key">RIGHT CLICK</span></div>
<div class="controlRow"><span>Reload</span><span class="key">R</span></div>
<div class="controlRow"><span>Pause</span><span class="key">P / ESC</span></div>
<div class="controlRow"><span>Weapons</span><span class="key">1 — 8</span></div>
<div class="controlRow"><span>Grenade</span><span class="key">G</span></div>
<div class="controlRow"><span>Tactical Nuke</span><span class="key">N</span></div>
</div>
<div id="startActions"><button id="start">START OUTBREAK</button><button id="restart">RESTART</button></div>
</div></div>
'''
new_html='''<div id="startScreen"><div id="startPanel">
<div id="startActions"><button id="start">START OUTBREAK</button><button id="showControls" type="button">CONTROLS</button><button id="restart">RESTART</button></div>
</div>
<div id="controlsModal" aria-hidden="true"><div id="controlsPanel" role="dialog" aria-modal="true" aria-labelledby="controlsTitle">
<div id="controlsHeader"><h2 id="controlsTitle">CONTROLS</h2><button id="closeControls" type="button" aria-label="Close controls">CLOSE</button></div>
<div id="controlsCard">
<div class="controlRow"><span>Move</span><span class="key">W A S D</span></div>
<div class="controlRow"><span>Aim / Look</span><span class="key">MOUSE</span></div>
<div class="controlRow"><span>Sprint</span><span class="key">SHIFT</span></div>
<div class="controlRow"><span>Fire</span><span class="key">LEFT CLICK</span></div>
<div class="controlRow"><span>Aim Down Sights</span><span class="key">RIGHT CLICK</span></div>
<div class="controlRow"><span>Reload</span><span class="key">R</span></div>
<div class="controlRow"><span>Pause</span><span class="key">P / ESC</span></div>
<div class="controlRow"><span>Weapons</span><span class="key">1 — 8</span></div>
<div class="controlRow"><span>Grenade</span><span class="key">G</span></div>
<div class="controlRow"><span>Tactical Nuke</span><span class="key">N</span></div>
</div></div></div></div>
'''
old_js='''rebuildGun();document.querySelector("#start").onclick=reset;document.querySelector("#restart").onclick=reset;document.querySelector("#deathRestart").onclick=reset;'''
new_js='''rebuildGun();document.querySelector("#start").onclick=reset;document.querySelector("#restart").onclick=reset;document.querySelector("#deathRestart").onclick=reset;
const controlsModal=document.querySelector("#controlsModal"),showControlsBtn=document.querySelector("#showControls"),closeControlsBtn=document.querySelector("#closeControls");
function setStartControls(open){controlsModal.classList.toggle("show",open);controlsModal.setAttribute("aria-hidden",open?"false":"true");if(open)closeControlsBtn.focus();else showControlsBtn.focus()}
showControlsBtn.onclick=()=>setStartControls(true);closeControlsBtn.onclick=()=>setStartControls(false);controlsModal.addEventListener("click",e=>{if(e.target===controlsModal)setStartControls(false)});'''
for old,name in [(old_css,"start CSS"),(old_html,"start HTML"),(old_js,"start JS hook")]:
    if s.count(old)!=1: raise SystemExit(f"{name} assertion failed: {s.count(old)}")
s=s.replace(old_css,new_css).replace(old_html,new_html).replace(old_js,new_js)
p.write_text(s)
