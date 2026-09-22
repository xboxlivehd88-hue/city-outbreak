from pathlib import Path

path = Path("index.html")
text = path.read_text(encoding="utf-8")


def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text = text.replace(old, new, 1)

# Rename player-facing SMG labels without changing the internal 'smg' key.
replace_once('<button data-buy="smgAmmo">SMG +60<br>$110</button>', '<button data-buy="smgAmmo">MP5 +60<br>$110</button>', 'shop ammo label')
replace_once('<button data-buy="smg">Unlock SMG<br>$1 TEST</button>', '<button data-buy="smg">Unlock MP5<br>$1 TEST</button>', 'shop unlock label')
replace_once('smg:{name:"SMG",rate:72,hold:150,spread:.012,pellets:1,body:.75,recoil:.065,baseMag:30}', 'smg:{name:"MP5",rate:72,hold:150,spread:.012,pellets:1,body:.75,recoil:.065,baseMag:30}', 'weapon display name')
replace_once('show("+60 SMG AMMO")', 'show("+60 MP5 AMMO")', 'ammo purchase message')
replace_once('show("SMG ALREADY UNLOCKED")', 'show("MP5 ALREADY UNLOCKED")', 'already unlocked message')
replace_once('show("SMG UNLOCKED")', 'show("MP5 UNLOCKED")', 'unlock message')

# Slightly move the support hand forward so it sits naturally on the MP5 handguard.
replace_once('smg:{left:[.18,-.46,-1.43],right:[.36,-.62,-.82],reload:[.10,-.18,.31]}',
             'smg:{left:[.18,-.45,-1.60],right:[.36,-.62,-.82],reload:[.10,-.18,.31]}',
             'MP5 hand pose')

old_model = ''' }else if(weapon==='smg'){
   // Compact SMG with collapsible stock, short barrel and box magazine.
   part(.38,.34,.92,metal,-.30,-1.05);part(.34,.30,.48,poly,-.29,-1.58);grip(-.62,-.82,-.18);
   magazine(-.67,-1.18,.20,.62,.26,-.05);cyl(.06,.58,steel,x,-.245,-1.94);muzzleBrake(-2.23,.095);rail(-1.20,.86,-.10);
   for(const sx of [-.18,.18])cyl(.027,.70,steel,x+sx,-.30,-.45);box(.43,.33,.10,rubber,x,-.31,-.08,gun);
   rearIron(-.68,-.010,.82);frontIron(-1.86,-.010,.78);box(.018,.12,.26,dark,x+.20,-.28,-.90,gun);
 }else if(weapon==='shotgun'){'''

new_model = ''' }else if(weapon==='smg'){
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

replace_once(old_model, new_model, 'SMG model block')

path.write_text(text, encoding="utf-8")
print('v128 MP5 patch applied')
