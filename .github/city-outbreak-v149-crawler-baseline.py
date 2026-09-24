from pathlib import Path

path=Path("index.html")
text=path.read_text(encoding="utf-8")

def replace_once(old,new,label):
    global text
    count=text.count(old)
    if count!=1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text=text.replace(old,new,1)

replace_once(
'''const ZRIG_UPPER_DETAIL_GEO=mergeZombieDetail([
 zombieEllipsoid(.24,1.16,.37,.68,0,.022,-.018,12,8),
 zombieEllipsoid(.105,1.05,.82,.92,-.225,.035,-.026,10,7),
 zombieEllipsoid(.105,1.05,.82,.92,.225,.035,-.026,10,7)
]);''',
'''const ZRIG_UPPER_DETAIL_GEO=mergeZombieDetail([
 zombieEllipsoid(.24,1.16,.37,.68,0,.022,-.018,12,8),
 zombieEllipsoid(.105,1.05,.82,.92,-.225,.035,-.026,10,7),
 zombieEllipsoid(.105,1.05,.82,.92,.225,.035,-.026,10,7)
]);
// Shared crawler gore meshes: built once, then reused by every native crawler.
// This keeps the new bloody silhouette cheap instead of generating unique gore
// geometry for every crawler instance.
const CRAWLER_MOUTH_GORE_GEO=mergeZombieDetail([
 zombieEllipsoid(.046,1.18,.20,.16,0,-.105,-.158,10,6),
 zombieEllipsoid(.013,.34,2.20,.28,-.030,-.145,-.160,8,5),
 zombieEllipsoid(.011,.30,2.75,.26,.004,-.158,-.161,8,5),
 zombieEllipsoid(.010,.28,1.85,.25,.032,-.140,-.159,8,5),
 zombieEllipsoid(.020,.55,.75,.24,-.050,-.126,-.156,8,5)
]);
const CRAWLER_BODY_GORE_GEO=mergeZombieDetail([
 zombieEllipsoid(.105,1.30,.56,.18,-.045,.715,-.265,10,7),
 zombieEllipsoid(.076,.78,1.30,.18,.110,.680,-.250,10,7),
 zombieEllipsoid(.090,1.42,.42,.22,-.055,.390,-.105,10,7),
 zombieEllipsoid(.052,.64,1.22,.18,.115,.500,-.175,9,6)
]);
const CRAWLER_FOREARM_GORE_GEO=mergeZombieDetail([
 zombieEllipsoid(.050,.78,1.34,.17,0,0,-.052,9,6),
 zombieEllipsoid(.027,.52,.85,.16,.026,-.028,-.057,8,5)
]);''',
"shared crawler gore geometry"
)

replace_once(
'''   torso.geometry=new THREE.SphereGeometry(.225,13,9);
   torso.scale.set(1.02,1.28,.74);
   torso.position.set(0,.79,-.10);
   torso.rotation.x=-.24;

   try{pelvis.geometry.dispose()}catch(_){}
   pelvis.geometry=new THREE.SphereGeometry(.165,11,8);
   pelvis.scale.set(1.02,.72,.84);
   pelvis.position.set(0,.49,.03);
   pelvis.rotation.x=-.18;''',
'''   torso.geometry=new THREE.SphereGeometry(.225,13,9);
   torso.scale.set(1.08,.94,.96);
   torso.position.set(0,.69,-.14);
   torso.rotation.x=-.31;

   try{pelvis.geometry.dispose()}catch(_){}
   pelvis.geometry=new THREE.SphereGeometry(.165,11,8);
   pelvis.scale.set(1.08,.60,1.02);
   pelvis.position.set(0,.39,.05);
   pelvis.rotation.x=-.24;''',
"lower flatter crawler torso"
)

replace_once(
'''   crawlerBack.scale.set(1.05,.72,.72);
   crawlerBack.position.set(0,.95,-.08);
   crawlerBack.rotation.x=-.18;''',
'''   crawlerBack.scale.set(1.08,.54,.88);
   crawlerBack.position.set(0,.80,-.12);
   crawlerBack.rotation.x=-.27;''',
"lower crawler back"
)

replace_once(
'''   head.geometry=new THREE.SphereGeometry(.154,14,10);
   head.position.set(0,1.23,-.215);
   head.scale.set(.98,1.06,.88);
   head.rotation.set(-.14,0,0);''',
'''   head.geometry=new THREE.SphereGeometry(.154,14,10);
   head.position.set(0,1.08,-.235);
   head.scale.set(.98,1.02,.90);
   head.rotation.set(-.20,0,0);''',
"lower crawler head"
)

replace_once(
'''   try{mouth.geometry.dispose()}catch(_){}
   mouth.geometry=new THREE.SphereGeometry(.041,10,6);mouth.scale.set(1.10,.18,.28);mouth.position.set(0,-.096,-.139);mouth.rotation.set(0,0,0);''',
'''   try{mouth.geometry.dispose()}catch(_){}
   // The old sphere read like an apple/ball in the crawler's mouth. Keep the
   // cavity flat and dark; blood is layered over it separately below.
   mouth.geometry=new THREE.BoxGeometry(.094,.024,.014);mouth.material=dark;
   mouth.scale.set(1,1,1);mouth.position.set(0,-.100,-.151);mouth.rotation.set(.03,0,0);''',
"flat crawler mouth cavity"
)

replace_once(
'''   // Turn the mouth itself into a bloody bite zone and add a downward smear using
   // the existing geometry/material budget.
   mouth.material=wound;mouth.scale.set(1.22,1.35,1.25);mouth.position.z=-.145;

   // Round neck / shoulders / elbows / hands, with the neck actually meeting the skull.
   try{neck.geometry.dispose()}catch(_){}
   neck.geometry=new THREE.CylinderGeometry(.058,.072,.18,10);
   neck.position.set(0,1.08,-.175);neck.rotation.x=-.36;''',
'''   // Blood now hangs from and smears around the dark mouth instead of replacing it.
   const crawlerMouthGore=new THREE.Mesh(CRAWLER_MOUTH_GORE_GEO,wound);
   crawlerMouthGore.name="CrawlerMouthBlood";crawlerMouthGore.userData.visualOnly=true;
   crawlerMouthGore.userData.sharedGeometry=true;crawlerMouthGore.raycast=()=>{};
   crawlerMouthGore.castShadow=false;crawlerMouthGore.receiveShadow=false;head.add(crawlerMouthGore);

   // One shared body-gore mesh covers the chest plus lower drag wound.
   const crawlerBodyGore=new THREE.Mesh(CRAWLER_BODY_GORE_GEO,wound);
   crawlerBodyGore.name="CrawlerBodyBlood";crawlerBodyGore.userData.visualOnly=true;
   crawlerBodyGore.userData.sharedGeometry=true;crawlerBodyGore.raycast=()=>{};
   crawlerBodyGore.castShadow=false;crawlerBodyGore.receiveShadow=false;g.add(crawlerBodyGore);

   // The generic zombie setup already bloodies one forearm. Add the same cheap
   // shared smear to the opposite forearm so crawlers read as arm-dragging bodies.
   const crawlerCleanForearm=i%2===0?foreArmR:foreArmL;
   const crawlerArmGore=new THREE.Mesh(CRAWLER_FOREARM_GORE_GEO,wound);
   crawlerArmGore.name="CrawlerForearmBlood";crawlerArmGore.userData.visualOnly=true;
   crawlerArmGore.userData.sharedGeometry=true;crawlerArmGore.raycast=()=>{};
   crawlerArmGore.castShadow=false;crawlerArmGore.receiveShadow=false;crawlerCleanForearm.add(crawlerArmGore);

   // Round neck / shoulders / elbows / hands, with the neck actually meeting the skull.
   try{neck.geometry.dispose()}catch(_){}
   neck.geometry=new THREE.CylinderGeometry(.058,.072,.18,10);
   neck.position.set(0,.93,-.195);neck.rotation.x=-.43;''',
"stringy mouth gore and body blood"
)

replace_once(
'''   shoulderL.position.set(-shoulderOffset,.99,-.12);
   shoulderR.position.set( shoulderOffset,.99,-.12);
   const crawlerClavicle=new THREE.Mesh(new THREE.SphereGeometry(.205,11,7),outfit===0?shirt:outerCloth);
   crawlerClavicle.scale.set(1.25,.30,.60);crawlerClavicle.position.set(0,.985,-.105);crawlerClavicle.rotation.x=-.18;g.add(crawlerClavicle);''',
'''   shoulderL.position.set(-shoulderOffset,.84,-.15);
   shoulderR.position.set( shoulderOffset,.84,-.15);
   const crawlerClavicle=new THREE.Mesh(new THREE.SphereGeometry(.205,11,7),outfit===0?shirt:outerCloth);
   crawlerClavicle.scale.set(1.25,.26,.70);crawlerClavicle.position.set(0,.835,-.135);crawlerClavicle.rotation.x=-.26;g.add(crawlerClavicle);''',
"lower crawler shoulders"
)

replace_once(
'''     crawlerCloth.scale.set(1.02,.68,.70);
     crawlerCloth.position.set(0,.93,-.085);
     crawlerCloth.rotation.x=-.18;''',
'''     crawlerCloth.scale.set(1.05,.52,.88);
     crawlerCloth.position.set(0,.79,-.12);
     crawlerCloth.rotation.x=-.27;''',
"lower crawler clothing mass"
)

replace_once(
'''   // Re-pose the smoother limbs into a low, weight-bearing crawl.
   legL.position.set(-hipOffset,.50,.12);legR.position.set(hipOffset,.50,.12);
   legL.rotation.x=-1.18;legR.rotation.x=-1.08;
   armL.position.set(-shoulderOffset,.98,-.12);armR.position.set(shoulderOffset,.98,-.12);
   armL.rotation.x=.86;armR.rotation.x=.86;
   armL.rotation.z=-.18;armR.rotation.z=.18;
   elbowL.rotation.x=.48;elbowR.rotation.x=.48;

   g.rotation.x=-.10;''',
'''   // Re-pose into a visibly lower crawl: chest and hips ride closer to the
   // pavement while the forearms carry more of the crawler's weight.
   legL.position.set(-hipOffset,.39,.14);legR.position.set(hipOffset,.39,.14);
   legL.rotation.x=-1.24;legR.rotation.x=-1.15;
   armL.position.set(-shoulderOffset,.83,-.15);armR.position.set(shoulderOffset,.83,-.15);
   armL.rotation.x=.98;armR.rotation.x=.98;
   armL.rotation.z=-.20;armR.rotation.z=.20;
   elbowL.rotation.x=.58;elbowR.rotation.x=.58;

   g.rotation.x=-.14;''',
"lower crawler pose"
)

replace_once(
''' const ownedGeometrySet=new Set();
 g.traverse(o=>{if(o.isMesh&&o.geometry)ownedGeometrySet.add(o.geometry)});''',
''' const ownedGeometrySet=new Set();
 g.traverse(o=>{if(o.isMesh&&o.geometry&&!o.userData.sharedGeometry)ownedGeometrySet.add(o.geometry)});''',
"preserve shared crawler gore geometry"
)

path.write_text(text,encoding="utf-8")
print("v149 crawler baseline gore and low-profile pass applied")
