import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync('src/game.js','utf8');

test('performance hot paths preserve geometry and allocation invariants',()=>{
  assert.match(src,/function indexCityGroundTriangle\(t\)\{[\s\S]*?t\.waX=/);
  assert.equal((src.match(/const wa=t\.waX\*dx\+t\.waZ\*dz;/g)||[]).length,3);
  assert.equal((src.match(/const wb=t\.wbX\*dx\+t\.wbZ\*dz;/g)||[]).length,3);
  assert.match(src,/for\(let i=0;i<3;i\+\+\)\{\s*\/\/ Same three probe/);
  assert.match(src,/const settledCorpseScratch=\[\]/);
  assert.match(src,/const touched=p\.touchedNodes\|\|\(p\.touchedNodes=new Set\(\)\)/);
  assert.match(src,/if\(canopyMaterialsDirty\)\{\s*for\(const bulb of gasCanopyBulbs\)/);
});

test('precomputed ground barycentrics equal original triangle formulas',()=>{
  let state=0x85ef2a19;
  const random=()=>((state=(Math.imul(1664525,state)+1013904223)>>>0)/4294967296);
  for(let i=0;i<1500;i++){
    const ax=random()*50-25,az=random()*50-25;
    const bx=random()*50-25,bz=random()*50-25;
    const cx=random()*50-25,cz=random()*50-25;
    const x=random()*50-25,z=random()*50-25;
    const den=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);
    if(Math.abs(den)<1e-8)continue;
    const wa=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/den;
    const wb=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/den;
    const inv=1/den;
    const waNew=(bz-cz)*inv*(x-cx)+(cx-bx)*inv*(z-cz);
    const wbNew=(cz-az)*inv*(x-cx)+(ax-cx)*inv*(z-cz);
    assert.ok(Math.abs(wa-waNew)<=1e-9*Math.max(1,Math.abs(wa)));
    assert.ok(Math.abs(wb-wbNew)<=1e-9*Math.max(1,Math.abs(wb)));
  }
});

test('collision avoidance retains all three original candidate positions',()=>{
  let state=0x42c831b9;
  const random=()=>((state=(Math.imul(22695477,state)+1)>>>0)/4294967296);
  for(let i=0;i<700;i++){
    const ox=random()*100-50,oz=random()*100-50;
    const nx=random()*2-1,nz=random()*2-1,mag=random()*4+0.05;
    const side=i%2?1:-1,sx=-nz*side,sz=nx*side;
    const expected=[
      [ox+sx*mag*1.18+nx*mag*.12,oz+sz*mag*1.18+nz*mag*.12],
      [ox+sx*mag*.92,oz+sz*mag*.92],
      [ox-sx*mag*1.05+nx*mag*.08,oz-sz*mag*1.05+nz*mag*.08]
    ];
    for(let p=0;p<3;p++){
      let testX,testZ;
      if(p===0){testX=ox+sx*mag*1.18+nx*mag*.12;testZ=oz+sz*mag*1.18+nz*mag*.12;}
      else if(p===1){testX=ox+sx*mag*.92;testZ=oz+sz*mag*.92;}
      else{testX=ox-sx*mag*1.05+nx*mag*.08;testZ=oz-sz*mag*1.05+nz*mag*.08;}
      assert.equal(testX,expected[p][0]);
      assert.equal(testZ,expected[p][1]);
    }
  }
});


test('runtime CPU phase report remains diagnostic-only',()=>{
 assert.match(src,/cityFrameProfile\\.corpsesMs\\+=performance\\.now\\(\\)-corpseStart/);
 assert.match(src,/cityFrameProfile\\.livingMs\\+=performance\\.now\\(\\)-livingStart/);
 assert.match(src,/cityFrameProfile\\.generalMs\\+=performance\\.now\\(\\)-generalStart/);
 const hud=readFileSync('src/performance-hud.js','utf8');
 assert.match(hud,/reportSamples\\.length>20/);
 assert.match(hud,/navigator\\.clipboard\\.writeText/);
 assert.match(hud,/cpuCorpsesMs:/);
});
