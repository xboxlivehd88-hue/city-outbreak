'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {LIVE_URL,normalizeMode,allowedNavigation}=require('../mode-policy.cjs');
const local='http://127.0.0.1:55665';
test('live mode permits only the official HTTPS game page',()=>{
  assert.equal(LIVE_URL,'https://xboxlivehd88-hue.github.io/city-outbreak/');
  assert.ok(allowedNavigation(LIVE_URL,'live',local));
  assert.ok(allowedNavigation(LIVE_URL+'index.html?v=775','live',local));
  for(const bad of [
    'http://xboxlivehd88-hue.github.io/city-outbreak/',
    'https://xboxlivehd88-hue.github.io.evil.example/city-outbreak/',
    'https://evil.example/city-outbreak/',
    'https://xboxlivehd88-hue.github.io/evil/',
    'https://xboxlivehd88-hue.github.io@evil.example/city-outbreak/',
    'file:///C:/Windows/System32/calc.exe',
    'javascript:alert(1)',
    'https://xboxlivehd88-hue.github.io:444/city-outbreak/',
    'https://xboxlivehd88-hue.github.io/city-outbreak/another.html'
  ])assert.equal(allowedNavigation(bad,'live',local),false,bad);
});
test('offline mode cannot escape its ephemeral localhost game page',()=>{
  assert.ok(allowedNavigation(local+'/index.html','offline',local));
  assert.ok(allowedNavigation(local+'/','offline',local));
  assert.equal(allowedNavigation('http://127.0.0.1:55666/index.html','offline',local),false);
  assert.equal(allowedNavigation('http://localhost:55665/index.html','offline',local),false);
  assert.equal(allowedNavigation(local+'/assets/other.html','offline',local),false);
  assert.equal(allowedNavigation(LIVE_URL,'offline',local),false);
});
test('untrusted persisted game mode fails closed to offline',()=>{
  assert.equal(normalizeMode('live'),'live');
  assert.equal(normalizeMode('offline'),'offline');
  assert.equal(normalizeMode('https://evil.example'),'offline');
  assert.equal(normalizeMode(null),'offline');
});
