from pathlib import Path
import re
import subprocess

path = Path("index.html")
text = path.read_text(encoding="utf-8")

old_ammo = 'shotgun:{mag:6,reserve:30}'
if text.count(old_ammo) != 2:
    raise SystemExit(f"Expected 2 shotgun ammo-state occurrences, found {text.count(old_ammo)}")
text = text.replace(old_ammo, 'shotgun:{mag:8,reserve:30}')

old_def = 'shotgun:{name:"SHOTGUN",rate:520,hold:9999,spread:.055,pellets:7,body:.72,recoil:.22,baseMag:6}'
if text.count(old_def) != 1:
    raise SystemExit(f"Expected 1 shotgun weapon definition, found {text.count(old_def)}")
text = text.replace(old_def, 'shotgun:{name:"SHOTGUN",rate:520,hold:9999,spread:.055,pellets:7,body:.72,recoil:.22,baseMag:8}')

old_reload = '''function reload(w=weapon){
 const a=ammoState[w],cap=maxMag(w);
 if(reloading||!a||a.mag===cap||a.reserve<=0||dying)return false;
 setAim(false);
 const duration=DETACHABLE_RELOAD_WEAPONS.has(w)?Math.max(760,1120-reloadLevel*90):Math.max(420,950-reloadLevel*120);
 reloading=true;reloadStartedAt=performance.now();reloadDurationMs=duration;reloadWeapon=w;beginReloadMagazineFX();reloadS();show("RELOADING");
 setTimeout(()=>{
   const n=Math.min(cap-a.mag,a.reserve);
   a.mag+=n;a.reserve-=n;finishReloadMagazineFX();reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";ui()
 },duration);
 return true
}'''

new_reload = '''function reload(w=weapon){
 const a=ammoState[w],cap=maxMag(w);
 if(reloading||!a||a.mag===cap||a.reserve<=0||dying)return false;
 setAim(false);
 if(w==="shotgun"){
   const shellDuration=Math.max(360,560-reloadLevel*45);
   const finishShotgunReload=()=>{
     finishReloadMagazineFX();reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";ui()
   };
   const loadShell=()=>{
     if(!reloading||reloadWeapon!==w)return;
     if(dying||a.mag>=cap||a.reserve<=0){finishShotgunReload();return}
     reloadStartedAt=performance.now();reloadDurationMs=shellDuration;reloadS();
     setTimeout(()=>{
       if(!reloading||reloadWeapon!==w)return;
       if(!dying&&a.mag<cap&&a.reserve>0){a.mag++;a.reserve--;ui()}
       if(dying||a.mag>=cap||a.reserve<=0)finishShotgunReload();
       else loadShell()
     },shellDuration)
   };
   reloading=true;reloadWeapon=w;beginReloadMagazineFX();show("RELOADING");loadShell();return true
 }
 const duration=DETACHABLE_RELOAD_WEAPONS.has(w)?Math.max(760,1120-reloadLevel*90):Math.max(420,950-reloadLevel*120);
 reloading=true;reloadStartedAt=performance.now();reloadDurationMs=duration;reloadWeapon=w;beginReloadMagazineFX();reloadS();show("RELOADING");
 setTimeout(()=>{
   const n=Math.min(cap-a.mag,a.reserve);
   a.mag+=n;a.reserve-=n;finishReloadMagazineFX();reloading=false;reloadStartedAt=0;reloadDurationMs=0;reloadWeapon="";ui()
 },duration);
 return true
}'''

if text.count(old_reload) != 1:
    raise SystemExit(f"Expected exactly one current reload() block, found {text.count(old_reload)}")
text = text.replace(old_reload, new_reload)
path.write_text(text, encoding="utf-8")

html = path.read_text(encoding="utf-8")
scripts = re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', html, flags=re.S | re.I)
if not scripts:
    raise SystemExit("No inline JavaScript found")
js_path = Path("/tmp/city-outbreak-v125.js")
js_path.write_text(max(scripts, key=len), encoding="utf-8")
subprocess.run(["node", "--check", str(js_path)], check=True)
