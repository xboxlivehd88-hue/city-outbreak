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
'''function releaseZombieVisual(z){
 if(!z)return;
 if(z.mixer){z.mixer.stopAllAction();if(z.rigVisual)z.mixer.uncacheRoot(z.rigVisual)}
 if(z.rigMaterials){for(const m of z.rigMaterials){try{m.dispose()}catch(_){}}z.rigMaterials.length=0}
 if(z.ownedGeometries){for(const geo of z.ownedGeometries){try{geo.dispose()}catch(_){}}z.ownedGeometries.length=0}
 if(z.ownedMaterials){for(const m of z.ownedMaterials){try{m.dispose()}catch(_){}}z.ownedMaterials.length=0}
 if(z.g&&z.g.parent)scene.remove(z.g)
}

function makeZombie(x,z,i,forcedKind=null,bossSpec=null){
 let d=diff(wave),g=new THREE.Group(),scale=.90+rnd()*.045;
 let roll=rnd(),kind=forcedKind||"shambler";
 if(!forcedKind){
  if(wave>=6&&roll<.07)kind="acidic";
  else if(wave>=5&&roll<.13)kind="infected";
  else if(wave>=4&&roll<.20)kind="radiated";
  else if(wave>=3&&roll<.30)kind="crawler";
  else if(wave>=2&&roll<.42)kind="sprinter";
 }''',
'''function releaseZombieVisual(z){
 if(!z)return;
 if(z.mixer){z.mixer.stopAllAction();if(z.rigVisual)z.mixer.uncacheRoot(z.rigVisual)}
 if(z.rigMaterials){for(const m of z.rigMaterials){try{m.dispose()}catch(_){}}z.rigMaterials.length=0}
 if(z.ownedGeometries){for(const geo of z.ownedGeometries){try{geo.dispose()}catch(_){}}z.ownedGeometries.length=0}
 if(z.ownedMaterials){for(const m of z.ownedMaterials){try{m.dispose()}catch(_){}}z.ownedMaterials.length=0}
 if(z.g&&z.g.parent)scene.remove(z.g)
}

// v143: introduce special infected gradually instead of jumping from 0% on wave 1
// straight to 42% on wave 2. Each new threat gets a wave to become readable before
// the full mixed roster settles back near the old late-wave intensity.
function rolledZombieKind(w,roll){
 if(w<2)return "shambler";
 if(w===2)return roll<.18?"sprinter":"shambler";
 if(w===3){
   if(roll<.08)return "crawler";
   if(roll<.24)return "sprinter";
   return "shambler";
 }
 if(w===4){
   if(roll<.05)return "radiated";
   if(roll<.13)return "crawler";
   if(roll<.30)return "sprinter";
   return "shambler";
 }
 if(w===5){
   if(roll<.05)return "infected";
   if(roll<.10)return "radiated";
   if(roll<.19)return "crawler";
   if(roll<.35)return "sprinter";
   return "shambler";
 }
 // Wave 6 introduces acidic zombies at 38% total specials. Sprinters then gain
 // 1.5 percentage points per wave until the total settles around 43%.
 const sprinterChance=Math.min(.19,.14+Math.max(0,w-6)*.015);
 if(roll<.04)return "acidic";
 if(roll<.09)return "infected";
 if(roll<.15)return "radiated";
 if(roll<.24)return "crawler";
 if(roll<.24+sprinterChance)return "sprinter";
 return "shambler";
}

function makeZombie(x,z,i,forcedKind=null,bossSpec=null){
 let d=diff(wave),g=new THREE.Group(),scale=.90+rnd()*.045;
 let roll=rnd(),kind=forcedKind||rolledZombieKind(wave,roll);''',
"progressive special zombie mix"
)

path.write_text(text,encoding="utf-8")
print("v143 progressive special zombie mix applied")
