from pathlib import Path

path = Path("index.html")
text = path.read_text(encoding="utf-8")

EXPECTED_BLOB = "8444515e93d74a9c13a4993659dfdc56505ece20"


def replace_once(old: str, new: str, label: str):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text = text.replace(old, new, 1)


# Add dedicated state for the break-action grenade-launcher reload.
replace_once(
    'reloadFreshAttached=false,reloadMagInserted=false,reloadSequence=0,runSequence=0;',
    'reloadFreshAttached=false,reloadMagInserted=false,reloadSequence=0,runSequence=0,launcherBreakRig=null,launcherFreshRound=null,launcherChamberRound=null,launcherRoundSeated=false;',
    'launcher reload globals',
)

# Reset grenade-launcher reload visuals anywhere the normal reload FX are cleared.
replace_once(
    ''' reloadFreshMag=null;reloadFreshInsertStart=null;reloadFreshInsertQuat=null;reloadFreshAttached=false;\n reloadOldMagDropped=false;reloadMagInserted=false;''',
    ''' reloadFreshMag=null;reloadFreshInsertStart=null;reloadFreshInsertQuat=null;reloadFreshAttached=false;\n if(launcherFreshRound&&launcherFreshRound.parent)launcherFreshRound.parent.remove(launcherFreshRound);\n launcherFreshRound=null;launcherRoundSeated=false;\n if(launcherBreakRig)launcherBreakRig.rotation.x=0;\n if(launcherChamberRound)launcherChamberRound.visible=false;\n reloadOldMagDropped=false;reloadMagInserted=false;''',
    'launcher reload clear',
)

# Add a compact 40mm-style round and the break-action animation controller.
replace_once(
    '''function beginReloadMagazineFX(){\n clearReloadMagazineFX(true);\n reloadOldMagDropped=false;reloadMagInserted=false;\n}\nfunction tossOldReloadMagazine(){''',
    '''function beginReloadMagazineFX(){\n clearReloadMagazineFX(true);\n reloadOldMagDropped=false;reloadMagInserted=false;\n}\nfunction makeLauncherReloadRound(parent){\n const round=new THREE.Group();\n const bodyMat=M(0x55643d,.62),rimMat=M(0xc39a4c,.34),noseMat=M(0x465638,.72);\n const body=new THREE.Mesh(new THREE.CylinderGeometry(.095,.098,.30,10),bodyMat);body.rotation.x=Math.PI/2;body.castShadow=false;round.add(body);\n const rim=new THREE.Mesh(new THREE.CylinderGeometry(.108,.108,.050,10),rimMat);rim.rotation.x=Math.PI/2;rim.position.z=.163;rim.castShadow=false;round.add(rim);\n const nose=new THREE.Mesh(new THREE.SphereGeometry(.094,10,7),noseMat);nose.scale.set(1,1,.72);nose.position.z=-.155;nose.castShadow=false;round.add(nose);\n parent.add(round);return round\n}\nfunction updateGrenadeLauncherReloadFX(rp){\n if(!reloading||reloadWeapon!=="grenadeLauncher"||!launcherBreakRig)return;\n const p=rp.p;\n // Break the front half downward, hold it fully open while the round is loaded, then snap it shut.\n const open=p<.20?smoothReload01(p/.20):p<.78?1:smoothReload01((1-p)/.22);\n launcherBreakRig.rotation.x=-.72*open;\n\n // A fresh grenade appears once the support hand reaches the pouch, then rides with the hand to the breech.\n if(p>=.36&&!launcherFreshRound&&!launcherRoundSeated&&playerHandRig){\n   launcherFreshRound=makeLauncherReloadRound(playerHandRig.left);\n   const hp=playerHandRig.pose.left;\n   launcherFreshRound.position.set(hp[0]+.055,hp[1]-.020,hp[2]-.030);\n   launcherFreshRound.rotation.set(.06,0,-.04);\n }\n if(p>=.69&&!launcherRoundSeated){\n   if(launcherFreshRound&&launcherFreshRound.parent)launcherFreshRound.parent.remove(launcherFreshRound);\n   launcherFreshRound=null;launcherRoundSeated=true;\n   if(launcherChamberRound)launcherChamberRound.visible=true;\n   tone(540,.035,"square",.075);tone(760,.025,"square",.055,.035);\n }\n}\nfunction tossOldReloadMagazine(){''',
    'launcher reload helpers',
)

# Make rebuildGun forget old launcher references after the old gun hierarchy is cleared.
replace_once(
    'gun.clear();playerHandRig=null;playerReloadPart=null;',
    'gun.clear();playerHandRig=null;playerReloadPart=null;launcherBreakRig=null;launcherFreshRound=null;launcherChamberRound=null;launcherRoundSeated=false;',
    'launcher rebuild reset',
)

# Convert the rigid launcher front half into a hinged barrel group while preserving its closed silhouette.
old_launcher = ''' }else if(weapon==='grenadeLauncher'){\n   // Break-action style grenade launcher with a thick tube, compact stock and large trigger housing.\n   stock(-.30,poly);part(.40,.34,.92,metal,-.30,-1.12);grip(-.62,-.76,-.27,rubber);\n   cyl(.145,1.62,steel,x,-.23,-2.22);cyl(.112,1.45,dark,x,-.23,-2.18);\n   let ring=new THREE.Mesh(new THREE.TorusGeometry(.155,.032,10,18),metal);ring.rotation.x=Math.PI/2;ring.position.set(x,-.23,-3.02);gun.add(ring);\n   box(.32,.18,.44,poly,x,-.38,-1.58,gun);frontSight(-2.88,-.08);\n   box(.18,.10,.20,M(0x5b6d43,.65),x,-.49,-1.46,gun);\n }'''
new_launcher = ''' }else if(weapon==='grenadeLauncher'){\n   // Break-action grenade launcher: receiver stays with the stock while the complete front barrel half hinges downward.\n   stock(-.30,poly);part(.40,.34,.92,metal,-.30,-1.12);grip(-.62,-.76,-.27,rubber);\n   // Visible hinge/pivot at the breech makes the split obvious when the barrel opens.\n   const hinge=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.48,10),dark);hinge.rotation.z=Math.PI/2;hinge.position.set(x,-.30,-1.43);gun.add(hinge);\n   launcherBreakRig=new THREE.Group();launcherBreakRig.name="GrenadeLauncherBreakBarrel";launcherBreakRig.position.set(x,-.30,-1.43);gun.add(launcherBreakRig);\n   cyl(.145,1.62,steel,0,.07,-.79,launcherBreakRig);cyl(.112,1.45,dark,0,.07,-.75,launcherBreakRig);\n   let ring=new THREE.Mesh(new THREE.TorusGeometry(.155,.032,10,18),metal);ring.rotation.x=Math.PI/2;ring.position.set(0,.07,-1.59);launcherBreakRig.add(ring);\n   box(.32,.18,.44,poly,0,-.08,-.15,launcherBreakRig);\n   box(.035,.17,.04,dark,0,.22,-1.45,launcherBreakRig);box(.15,.035,.04,dark,0,.145,-1.45,launcherBreakRig);\n   box(.18,.10,.20,M(0x5b6d43,.65),0,-.19,-.03,launcherBreakRig);\n   // Breech/chamber collar stays attached to the opening barrel.\n   let chamberRing=new THREE.Mesh(new THREE.TorusGeometry(.132,.022,8,16),metal);chamberRing.rotation.x=Math.PI/2;chamberRing.position.set(0,.07,-.015);launcherBreakRig.add(chamberRing);\n   launcherChamberRound=makeLauncherReloadRound(launcherBreakRig);launcherChamberRound.position.set(0,.07,-.10);launcherChamberRound.visible=false;\n }'''
replace_once(old_launcher, new_launcher, 'break-action launcher model')

# Give the break-action animation enough time to be readable without changing any weapon damage/ammo rules.
replace_once(
    'const duration=DETACHABLE_RELOAD_WEAPONS.has(w)?Math.max(760,1120-reloadLevel*90):Math.max(420,950-reloadLevel*120);',
    'const duration=w==="grenadeLauncher"?Math.max(1100,1550-reloadLevel*90):DETACHABLE_RELOAD_WEAPONS.has(w)?Math.max(760,1120-reloadLevel*90):Math.max(420,950-reloadLevel*120);',
    'launcher reload duration',
)

# Replace the generic support-hand reload pose only while the grenade launcher is reloading.
old_hands = ''' if(playerHandRig){\n   const ro=playerHandRig.pose.reload,h=rp.hand,pull=rp.pull||0,pouch=rp.pouch||0;\n   // Follow the old magazine as it is pulled free, then clearly reach away empty before returning with a fresh one.\n   playerHandRig.left.position.set(ro[0]*h-.10*pouch,ro[1]*h-.24*pull-.48*pouch,ro[2]*h+.05*pull+.22*pouch);\n   playerHandRig.left.rotation.set(.10*h+.11*pouch,0,-.18*h-.09*pouch);\n   playerHandRig.right.position.set(0,-.025*rp.arch,.02*rp.arch);\n   playerHandRig.right.rotation.set(.04*rp.arch,0,.05*rp.arch);\n }\n updateReloadMagazineFX(rp);'''
new_hands = ''' if(playerHandRig){\n   if(reloading&&reloadWeapon==="grenadeLauncher"){\n     const p=rp.p;let lx=0,ly=0,lz=0,lr=0,t=0;\n     // Hand works the latch, drops to the pouch, carries the grenade to the open breech, then returns to the fore-end.\n     if(p<.18){t=smoothReload01(p/.18);lx=.08*t;ly=.08*t;lz=.08*t;lr=-.10*t}\n     else if(p<.38){t=smoothReload01((p-.18)/.20);lx=.08+(-.16-.08)*t;ly=.08+(-.52-.08)*t;lz=.08+(.24-.08)*t;lr=-.10+(-.24+.10)*t}\n     else if(p<.68){t=smoothReload01((p-.38)/.30);lx=-.16+(.18+.16)*t;ly=-.52+(.24+.52)*t;lz=.24+(.11-.24)*t;lr=-.24+(.10+.24)*t}\n     else if(p<.80){lx=.18;ly=.24;lz=.11;lr=.10}\n     else{t=smoothReload01((p-.80)/.20);lx=.18*(1-t);ly=.24*(1-t);lz=.11*(1-t);lr=.10*(1-t)}\n     playerHandRig.left.position.set(lx,ly,lz);playerHandRig.left.rotation.set(.06+lr,0,-.12-rp.arch*.08);\n   }else{\n     const ro=playerHandRig.pose.reload,h=rp.hand,pull=rp.pull||0,pouch=rp.pouch||0;\n     // Follow the old magazine as it is pulled free, then clearly reach away empty before returning with a fresh one.\n     playerHandRig.left.position.set(ro[0]*h-.10*pouch,ro[1]*h-.24*pull-.48*pouch,ro[2]*h+.05*pull+.22*pouch);\n     playerHandRig.left.rotation.set(.10*h+.11*pouch,0,-.18*h-.09*pouch);\n   }\n   playerHandRig.right.position.set(0,-.025*rp.arch,.02*rp.arch);\n   playerHandRig.right.rotation.set(.04*rp.arch,0,.05*rp.arch);\n }\n updateReloadMagazineFX(rp);\n updateGrenadeLauncherReloadFX(rp);'''
replace_once(old_hands, new_hands, 'launcher hand animation')

path.write_text(text, encoding="utf-8")
print("v127 grenade launcher break-action reload patch applied")
