from pathlib import Path

path = Path("index.html")
text = path.read_text(encoding="utf-8")


def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text = text.replace(old, new, 1)

# Shoulder the MP5 closer and put the sight line at the true screen center.
replace_once(
    ' smg:{x:-.36,y:.030,z:-.92,fov:54,rx:0},',
    ' smg:{x:-.36,y:.033,z:-.40,fov:55,rx:-.01},',
    'MP5 ADS pose'
)

# Keep the compact MP5 nearly full-size in ADS. The generic 16% shrink made it read as if it were held at arm's length.
replace_once(
    'const adsScale=1-aimBlend*.16;const rp=reloadPoseProgress();',
    'const adsScale=1-aimBlend*(weapon==="smg"?.05:.16);const rp=reloadPoseProgress();',
    'MP5 ADS scale'
)

# Hands stay attached to the compact fore-end/grip while the gun is pulled back into the shoulder.
replace_once(
    ' smg:{left:[.18,-.45,-1.60],right:[.36,-.62,-.82],reload:[.10,-.18,.31]},',
    ' smg:{left:[.18,-.44,-1.64],right:[.36,-.61,-.80],reload:[.10,-.18,.31]},',
    'MP5 hand pose'
)

old_model = ''' }else if(weapon==='smg'){
   // MP5-style compact roller-delayed SMG silhouette: tubular upper, polymer lower/handguard,
   // curved magazine, hooded front sight and A3-style collapsible stock.
   // Upper receiver and cocking tube.
   cyl(.148,.98,metal,x,-.235,-1.08);cyl(.052,.92,steel,x,-.105,-1.32);
   part(.405,.31,.72,poly,-.385,-1.03);grip(-.64,-.80,-.17);
   // Classic compact polymer fore-end with subtle vent/rib detail.
   let mp5Fore=part(.40,.285,.54,poly,-.30,-1.69);mp5Fore.rotation.x=.015;
   for(const sx of [-.155,.155])for(let zz=-1.52;zz>-1.91;zz-=.13)box(.022,.07,.075,dark,x+sx,-.285,zz,gun);
   // Short barrel and three-lug style muzzle profile.
   cyl(.052,.50,steel,x,-.235,-2.07);cyl(.068,.17,dark,x,-.235,-2.375);
   for(const sx of [-.055,.055])box(.027,.055,.09,steel,x+sx,-.235,-2.33,gun);
   // Curved 30-round magazine. Keep the whole group as the reloadable part so the existing
   // detachable-magazine animation continues to work unchanged.
   const mp5Mag=new THREE.Group();mp5Mag.name="MP5Magazine";mp5Mag.position.set(x,-.61,-1.19);gun.add(mp5Mag);
   let mp5m1=bevelBox(.19,.28,.24,metal,0,-.04,0,mp5Mag);mp5m1.rotation.x=-.035;
   let mp5m2=bevelBox(.185,.27,.235,metal,0,-.285,-.035,mp5Mag);mp5m2.rotation.x=-.12;
   let mp5m3=bevelBox(.17,.20,.22,metal,0,-.505,-.105,mp5Mag);mp5m3.rotation.x=-.22;
   for(const mz of [-.075,0,.075])box(.018,.63,.018,dark,mz,-.25,.125,mp5Mag);
   mp5Mag.userData.reloadHome=mp5Mag.position.clone();mp5Mag.userData.reloadHomeQuat=mp5Mag.quaternion.clone();playerReloadPart=mp5Mag;
   // A3-style twin-rail retractable stock and butt plate.
   for(const sx of [-.155,.155])cyl(.024,.76,steel,x+sx,-.30,-.43);
   box(.39,.30,.085,rubber,x,-.31,-.055,gun);box(.33,.07,.11,dark,x,-.47,-.06,gun);
   // Rear drum-style sight and iconic hooded front sight.
   let mp5Rear=new THREE.Mesh(new THREE.TorusGeometry(.065,.018,8,18),dark);mp5Rear.position.set(x,-.065,-.67);gun.add(mp5Rear);
   box(.16,.045,.11,dark,x,-.13,-.68,gun);
   let mp5Hood=new THREE.Mesh(new THREE.TorusGeometry(.105,.022,8,20),dark);mp5Hood.position.set(x,-.13,-2.08);gun.add(mp5Hood);
   box(.026,.12,.035,dark,x,-.20,-2.08,gun);
   // Ejection port and left-side charging handle give the receiver its familiar MP5 profile.
   box(.018,.105,.29,M(0x070808,.18),x+.158,-.245,-1.06,gun);
   cyl(.025,.17,dark,x-.16,-.12,-1.58,gun,"x");
   let mp5Knob=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),dark);mp5Knob.position.set(x-.245,-.12,-1.58);gun.add(mp5Knob);
 }else if(weapon==='shotgun'){'''

new_model = ''' }else if(weapon==='smg'){
   // Higher-detail MP5 A3-style first-person model. The stock extends behind the camera instead
   // of putting a giant butt plate in front of the player's face.
   const mp5Gunmetal=M(0x171a1b,.24),mp5Black=M(0x0d0f10,.58),mp5Poly=M(0x1b1e1f,.76);

   // Stamped tubular receiver, rear cap and front trunnion.
   cyl(.148,1.02,mp5Gunmetal,x,-.235,-1.08);
   cyl(.154,.13,dark,x,-.235,-.545);
   cyl(.157,.13,dark,x,-.235,-1.585);
   box(.315,.055,.82,mp5Black,x,-.355,-1.08,gun);
   box(.028,.10,.64,dark,x-.145,-.205,-1.08,gun);
   box(.028,.10,.64,dark,x+.145,-.205,-1.08,gun);

   // Cocking tube and the raised bridge joining it to the receiver.
   cyl(.050,.86,steel,x,-.095,-1.36);
   box(.18,.075,.26,mp5Gunmetal,x,-.145,-1.57,gun);

   // Polymer trigger housing, magwell and pistol grip.
   part(.405,.31,.66,mp5Poly,-.405,-1.02);
   part(.35,.34,.29,mp5Poly,-.455,-1.30);
   grip(-.65,-.78,-.18,mp5Poly);
   box(.30,.055,.18,dark,x,-.515,-1.31,gun);
   // Selector axle and short selector lever on the visible side.
   cyl(.035,.035,dark,x+.205,-.40,-.91,gun,"x");
   let mp5Selector=box(.025,.035,.16,dark,x+.225,-.38,-.84,gun);mp5Selector.rotation.x=-.55;
   for(const pxp of [-.145,.145]){let pin=new THREE.Mesh(new THREE.CylinderGeometry(.020,.020,.025,8),steel);pin.rotation.z=Math.PI/2;pin.position.set(x+pxp,-.39,-1.16);gun.add(pin)}

   // Slim MP5 handguard with a tapered lower profile and stamped side ribs.
   let mp5Fore=part(.405,.275,.58,mp5Poly,-.305,-1.82);mp5Fore.rotation.x=.018;
   part(.35,.13,.52,mp5Black,-.405,-1.82);
   for(const sx of [-.165,.165])for(let zz=-1.60;zz>-2.03;zz-=.11)box(.020,.075,.060,dark,x+sx,-.29,zz,gun);
   box(.32,.055,.08,dark,x,-.17,-2.07,gun);

   // Short barrel and recognizable three-lug muzzle.
   cyl(.046,.43,steel,x,-.235,-2.225);
   cyl(.066,.16,dark,x,-.235,-2.445);
   for(const a of [-1,0,1]){
     const lug=new THREE.Mesh(new THREE.BoxGeometry(.034,.052,.075),steel);
     lug.position.set(x+a*.048,-.235+(a===0?.052:0),-2.405);gun.add(lug)
   }

   // Five-section curved 30-round magazine. It remains one reloadable group so the existing
   // magazine drop/fresh-mag sequence works exactly as before.
   const mp5Mag=new THREE.Group();mp5Mag.name="MP5Magazine";mp5Mag.position.set(x,-.61,-1.27);gun.add(mp5Mag);
   const magSegs=[
     [0,-.02,0,.195,.18,.235,-.02],
     [0,-.185,-.012,.193,.18,.232,-.07],
     [0,-.345,-.045,.188,.18,.228,-.13],
     [0,-.495,-.095,.180,.17,.220,-.20],
     [0,-.625,-.160,.168,.15,.210,-.27]
   ];
   for(const s of magSegs){let m=bevelBox(s[3],s[4],s[5],metal,s[0],s[1],s[2],mp5Mag);m.rotation.x=s[6]}
   for(const mx of [-.064,.064])box(.016,.68,.018,dark,mx,-.28,.118,mp5Mag);
   box(.17,.040,.215,dark,0,-.705,-.205,mp5Mag);
   mp5Mag.userData.reloadHome=mp5Mag.position.clone();mp5Mag.userData.reloadHomeQuat=mp5Mag.quaternion.clone();playerReloadPart=mp5Mag;

   // A3 retractable stock rails. The actual butt pad sits behind the eye/camera where a
   // shouldered stock belongs, so it no longer blocks the screen in hip fire or ADS.
   for(const sx of [-.155,.155])cyl(.023,.92,steel,x+sx,-.295,.03);
   box(.37,.22,.10,rubber,x,-.31,.49,gun);
   box(.34,.065,.13,dark,x,-.445,.48,gun);
   box(.36,.20,.10,dark,x,-.30,-.49,gun);

   // Properly aligned MP5 iron sights: both apertures now share the same vertical sight line.
   // The rear diopter is smaller; the front hood is larger and farther forward.
   box(.18,.075,.13,dark,x,-.115,-.735,gun);
   let mp5Rear=new THREE.Mesh(new THREE.TorusGeometry(.050,.013,8,22),mp5Black);mp5Rear.position.set(x,-.030,-.735);gun.add(mp5Rear);
   box(.045,.085,.050,dark,x-.075,-.075,-.735,gun);box(.045,.085,.050,dark,x+.075,-.075,-.735,gun);

   box(.20,.075,.10,dark,x,-.145,-2.075,gun);
   let mp5Hood=new THREE.Mesh(new THREE.TorusGeometry(.088,.017,8,24),mp5Black);mp5Hood.position.set(x,-.030,-2.075);gun.add(mp5Hood);
   box(.024,.092,.035,dark,x,-.082,-2.075,gun);

   // Ejection-port recess, cocking slot and left charging handle.
   box(.018,.100,.30,M(0x060707,.18),x+.151,-.235,-1.05,gun);
   box(.022,.065,.33,dark,x-.151,-.105,-1.45,gun);
   cyl(.024,.17,dark,x-.16,-.105,-1.63,gun,"x");
   let mp5Knob=new THREE.Mesh(new THREE.SphereGeometry(.044,10,7),dark);mp5Knob.position.set(x-.245,-.105,-1.63);gun.add(mp5Knob);
 }else if(weapon==='shotgun'){'''

replace_once(old_model, new_model, 'MP5 geometry block')

path.write_text(text, encoding="utf-8")
print('v129 MP5 geometry/ADS patch applied')
