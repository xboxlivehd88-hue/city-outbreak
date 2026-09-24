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
'''function addBuilding(w,h,d,x,z,base,variant,navRow=""){
 const style=variant%8,mat=facadeMaterial(base,variant),q=box(w,h,d,mat,x,h/2,z);q.userData.cityMain=true;
 buildingColliders.push({x,z,hx:w/2,hz:d/2,navRow});''',
'''function addBuilding(w,h,d,x,z,base,variant){
 const style=variant%8,mat=facadeMaterial(base,variant),q=box(w,h,d,mat,x,h/2,z);q.userData.cityMain=true;
 buildingColliders.push({x,z,hx:w/2,hz:d/2});''',
"restore safe building signature"
)

replace_once(
'''    addBuilding(w1,h1,d1,x1,z,base,buildingId++,"front:"+side);''',
'''    addBuilding(w1,h1,d1,x1,z,base,buildingId++);''',
"restore front building calls"
)

replace_once(
'''    addBuilding(w,h,d,x,z+(rz-.5)*3.5,base,buildingId++,"mid:"+side);''',
'''    addBuilding(w,h,d,x,z+(rz-.5)*3.5,base,buildingId++);''',
"restore mid building calls"
)

replace_once(
'''    addBuilding(w,h,d,x,z+(rz-.5)*4,base,buildingId++,"back:"+side);''',
'''    addBuilding(w,h,d,x,z+(rz-.5)*4,base,buildingId++);''',
"restore back building calls"
)

replace_once(
'''  addBuilding(w,h,d,x,crossBuildingZ(false,d,.8+rz1*1.6),base,buildingId++,"cross:south");
  addBuilding(w,h,d,x,crossBuildingZ(true,d,.8+rz2*1.6),base,buildingId++,"cross:north");
}

// v151: neighboring buildings in the same street row can leave tiny procedural
// seams that look passable but are unreliable once zombie body clearance and the
// 2 m nav grid are applied. Close only those accidental sub-2.7 m seams with a
// visible service infill and matching collider. Real alleys between rows, the
// avenue, cross street, sidewalks and larger passages remain untouched.
const MIN_RELIABLE_BUILDING_GAP=2.70;
const serviceGapMat=M(0x474b4b,.95);
function sealNarrowBuildingGaps(){
 const rows=new Map();
 for(const b of buildingColliders){
   if(!b.navRow)continue;
   if(!rows.has(b.navRow))rows.set(b.navRow,[]);
   rows.get(b.navRow).push(b);
 }
 let sealed=0;
 for(const [rowKey,row] of rows){
   const alongX=rowKey.startsWith("cross:");
   row.sort((a,b)=>alongX?a.x-b.x:a.z-b.z);
   for(let i=0;i<row.length-1;i++){
     const a=row[i],b=row[i+1];
     if(alongX){
       const aEdge=a.x+a.hx,bEdge=b.x-b.hx,gap=bEdge-aEdge;
       const lo=Math.max(a.z-a.hz,b.z-b.hz),hi=Math.min(a.z+a.hz,b.z+b.hz),overlap=hi-lo;
       if(gap>0&&gap<MIN_RELIABLE_BUILDING_GAP&&overlap>1.25){
         const w=gap+.12,d=Math.max(1.25,overlap),x=(aEdge+bEdge)*.5,z=(lo+hi)*.5;
         const q=box(w,2.45,d,serviceGapMat,x,1.225,z);q.userData.cityGapSeal=true;
         buildingColliders.push({x,z,hx:w*.5,hz:d*.5,navSeal:true});
         sealed++;
       }
     }else{
       const aEdge=a.z+a.hz,bEdge=b.z-b.hz,gap=bEdge-aEdge;
       const lo=Math.max(a.x-a.hx,b.x-b.hx),hi=Math.min(a.x+a.hx,b.x+b.hx),overlap=hi-lo;
       if(gap>0&&gap<MIN_RELIABLE_BUILDING_GAP&&overlap>1.25){
         const w=Math.max(1.25,overlap),d=gap+.12,x=(lo+hi)*.5,z=(aEdge+bEdge)*.5;
         const q=box(w,2.45,d,serviceGapMat,x,1.225,z);q.userData.cityGapSeal=true;
         buildingColliders.push({x,z,hx:w*.5,hz:d*.5,navSeal:true});
         sealed++;
       }
     }
   }
 }
 console.log("CityOutbreak narrow building gaps sealed",{sealed,minGap:MIN_RELIABLE_BUILDING_GAP});
}
sealNarrowBuildingGaps();
}''',
'''  addBuilding(w,h,d,x,crossBuildingZ(false,d,.8+rz1*1.6),base,buildingId++);
  addBuilding(w,h,d,x,crossBuildingZ(true,d,.8+rz2*1.6),base,buildingId++);
}''',
"remove runtime gap-seal generation"
)

replace_once(
'''const ZNAV_CELL=2.0,ZNAV_PAD=.56,ZNAV_MAX_NODES=1300;''',
'''// v152: keep city generation untouched and make pathfinding itself conservative.
 // The larger clearance makes A* reject squeeze gaps that are technically open
 // but too narrow for reliable zombie motion, without adding startup-time geometry.
const ZNAV_CELL=2.0,ZNAV_PAD=.72,ZNAV_MAX_NODES=1300;''',
"safer nav clearance"
)

replace_once(
''' const d=Math.hypot(x2-x1,z2-z1),steps=Math.max(1,Math.ceil(d/1.05));''',
''' const d=Math.hypot(x2-x1,z2-z1),steps=Math.max(1,Math.ceil(d/.85));''',
"denser route clearance sampling"
)

path.write_text(text,encoding="utf-8")
print("v152 startup-safe nav clearance fix applied")
