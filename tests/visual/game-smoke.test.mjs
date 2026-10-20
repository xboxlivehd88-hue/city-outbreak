import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';

const base = process.env.CITY_TEST_URL || 'http://127.0.0.1:8765';
const out = 'test-results/visual';
await mkdir(out, { recursive: true });
// Inspect the original GLB's actual node/skin/animation names. This audit is
// independent of the browser so a failed source retarget cannot hide its cause.
try {
  const glb = await readFile('assets/animated_pistol.glb');
  assert.equal(glb.toString('ascii', 0, 4), 'glTF', 'Expected original GLB');
  const jsonLength = glb.readUInt32LE(12);
  const json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString('utf8'));
  const jointIndices = new Set((json.skins || []).flatMap(s => s.joints || []));
  const nodes = (json.nodes || []).map((n, i) => ({
    name: n.name || '', isSkinJoint: jointIndices.has(i)
  }));
  const fingerNamePattern = /^[LR]_(thumb|point|middle|ring|pink)_/;
  const audit = {
    modelBytes: glb.length, nodeCount: nodes.length, skinCount: json.skins?.length || 0,
    jointCount: jointIndices.size, animationNames: (json.animations || []).map(a => a.name || ''),
    matchedFingerNodes: nodes.filter(n => fingerNamePattern.test(n.name)),
    likelyHandNodes: nodes.filter(n => /thumb|point|middle|ring|pink|finger|hand|wrist/i.test(n.name)),
    firstSkinJoints: nodes.filter(n => n.isSkinJoint).slice(0, 75)
  };
  await writeFile(`${out}/m17-source-asset-audit.json`, JSON.stringify(audit, null, 2));
  console.log('M17 source audit: ' + JSON.stringify({
    jointCount: audit.jointCount, matchedFingerCount: audit.matchedFingerNodes.length,
    animationNames: audit.animationNames
  }));
} catch (error) {
  await writeFile(`${out}/m17-source-asset-audit-error.txt`, String(error));
  throw error;
}
const browser = await chromium.launch({ headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--disable-dev-shm-usage', '--ignore-gpu-blocklist'] });

test('CITY OUTBREAK loads, starts and captures pistol hip and ADS', { timeout: 180000 }, async () => {
  const page = await browser.newPage({ viewport: { width: 1024, height: 576 }, deviceScaleFactor: 1 });
  // GitHub Actions has no GPU. Use the game's existing LOWEST graphics preset
  // before the module reads settings so software WebGL can render promptly.
  // This affects only the temporary CI browser, NEVER saved player settings.
  await page.addInitScript(() => {
    localStorage.setItem('city-outbreak-graphics-v1', 'veryLow');
    // Pace the software renderer instead of freezing it. A fully frozen
    // compositor can itself prevent Chrome screenshot frames being produced.
    const nativeRaf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback =>
      window.setTimeout(() => nativeRaf(callback), 160);
    // Only in CI, retain the last actual WebGL frame so canvas.toDataURL()
    // can capture pixels without Chromium's unreliable compositor screenshot.
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, attributes) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(type)) {
        return originalGetContext.call(this, type, { ...attributes, preserveDrawingBuffer: true });
      }
      return originalGetContext.call(this, type, attributes);
    };
  });
  page.on('console', message => { if (message.type() === 'error') errors.push('console: '+message.text()); });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const capture = async name => {
    // Read the preserved WebGL framebuffer through the DOM. No Playwright
    // screenshots, element-stability waits, or CDP compositor round trips.
    try {
      const dataUrl = await page.locator('#cv').evaluate(canvas => canvas.toDataURL('image/png'), { timeout: 25000 });
      if (!dataUrl?.startsWith('data:image/png;base64,') || dataUrl.length < 1000)
        throw new Error('Canvas produced no PNG pixel data');
      await writeFile(`${out}/${name}.png`, Buffer.from(dataUrl.split(',')[1], 'base64'));
    } catch (error) {
      errors.push(`Canvas framebuffer ${name}: ${String(error)}`);
      await writeFile(`${out}/${name}-capture-error.txt`, String(error));
    }
  };
  try {
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await assert.doesNotReject(() => page.locator('#cv').waitFor({ state: 'visible', timeout: 15000 }));
    // Menu screenshot is HTML-only; canvas capture here can initialize the
    // 3D scene twice and stall software rasterization before gameplay starts.
    await page.locator('#startScreen').screenshot({ path: `${out}/01-start-menu.png`, timeout: 10000 }).catch(async e => writeFile(`${out}/01-start-menu-error.txt`, String(e)));
    await writeFile(`${out}/01-before-start.json`, JSON.stringify({url:page.url(), title:await page.title(), build:await page.locator('html').getAttribute('data-city-outbreak-build')}, null, 2));
    const build = await page.locator('html').getAttribute('data-city-outbreak-build', { timeout: 30000 }).catch(() => null);
    assert.ok(build, 'Game module must load and publish a version');
    // Start is a same-page action; don't wait for navigation after clicking.
    await page.locator('#start').click({ timeout: 30000, noWaitAfter: true });
    // CSS transition/renderer-heavy requestAnimationFrame can starve RAF-based
    // Playwright polling. Use interval polling, not the RAF default.
    try {
      await page.waitForFunction(() => document.querySelector('#startScreen')?.style.display === 'none', null, { timeout: 45000, polling: 250 });
    } catch (error) {
      await writeFile(`${out}/02-start-timeout.txt`, String(error));
      throw error;
    }
    assert.match(await page.locator('#weaponName').textContent(), /M17/i, 'M17 must be the spawned weapon');
    assert.equal(await page.locator('html').getAttribute('data-fps-arms-weapon-test-loadout'), 'm17-only');
    await page.waitForTimeout(1200);
    await capture('02-after-start-hip');
    // Pointer lock is already active after Start. Moving the mouse to an
    // absolute screen coordinate rotates the camera unpredictably in CI.
    await page.mouse.down({ button: 'right' });
    await page.waitForTimeout(1500);
    await capture('03-ads');
    await page.mouse.up({ button: 'right' });
    // Consume some ammunition before testing reload; otherwise R can be a no-op.
    await page.mouse.down({ button: 'left' });
    await page.waitForTimeout(70);
    await page.mouse.up({ button: 'left' });
    await page.keyboard.press('r');
    await page.waitForTimeout(600);
    await capture('04-reload');
    // Reload must finish before we can verify the trigger actually fires.
    await page.waitForTimeout(2900);
    await page.mouse.down({ button: 'left' });
    await page.waitForTimeout(80);
    await capture('05-firing');
    await page.mouse.up({ button: 'left' });
    await writeFile(`${out}/diagnostics.json`, JSON.stringify({ build, errors, url: page.url(), m17Grip: await page.locator('html').getAttribute('data-fps-arms-m17-grip-correction'), sourceReady: await page.locator('html').getAttribute('data-fps-arms-m17-source-rig'), sourceError: await page.locator('html').getAttribute('data-fps-arms-m17-source-error') }, null, 2));
    assert.equal(errors.length, 0, `Unhandled JavaScript errors: ${errors.join('; ')}`);
  } finally {
    await page.close();
  }
});

test.after(async () => { await browser.close(); });
