import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../src/game.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../../index.html',import.meta.url),'utf8');
test('v782 isolated shambler geometry sharing guards',()=>{
 assert.match(html,/game\.js\?v=782/);
 assert.match(source,/if\(kind==="shambler"\)v782ShareShamblerGeometry\(g\)/);
 assert.match(source,/if\(!p\|\|\(geo\.type!=="BoxGeometry"&&geo\.type!=="CylinderGeometry"\)\)return/);
 assert.match(source,/o\.userData\.sharedGeometry=true/);
 assert.match(source,/!o\.userData\.sharedGeometry/);
 assert.match(source,/pooledShamblerGeometries:v782ShamblerGeometryCache\.size/);
 assert.match(source,/model\.traverse\(o=>\{if\(o\.isMesh\)o\.receiveShadow=false\}\)/);
});
