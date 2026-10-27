'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {normalizeMode,allowedNavigation}=require('../mode-policy.cjs');
const local='http://127.0.0.1:55665';
test('offline Windows game never permits remote live-play content',()=>{
 assert.ok(allowedNavigation(local+'/index.html','offline',local));
 assert.ok(allowedNavigation(local+'/','offline',local));
 for(const candidate of [
  'https://xboxlivehd88-hue.github.io/city-outbreak/',
  'https://xboxlivehd88-hue.github.io/city-outbreak/index.html',
  'https://evil.example/city-outbreak/',
  'http://localhost:55665/index.html',
  'http://127.0.0.1:55666/index.html',
  'file:///C:/Windows/System32/calc.exe',
  'javascript:alert(1)'
 ])assert.equal(allowedNavigation(candidate,'live',local),false,candidate);
});
test('even previously saved live preference is ignored',()=>{
 assert.equal(normalizeMode('live'),'offline');
 assert.equal(normalizeMode('offline'),'offline');
 assert.equal(normalizeMode(null),'offline');
});
