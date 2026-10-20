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
      // Human visual review without relying on the GitHub artifact viewer:
      // publish compact actual WebGL frame thumbnails in the job log. Retain
      // the original full-resolution PNG files in the artifact as well.
      if (['02-after-start-hip','03-ads','04-reload-20pct','04-reload-55pct','04-reload-75pct'].includes(name)) {
        const jpg = await page.locator('#cv').evaluate(canvas => {
          const t = document.createElement('canvas');
          t.width = 640; t.height = 360;
          t.getContext('2d').drawImage(canvas, 0, 0, t.width, t.height);
          return t.toDataURL('image/jpeg', .62).split(',')[1];
        });
        console.log('M17_QA_JPEG_' + name + ':' + jpg);
      }
      // Enlargement around the real grip, old drop, and approaching new mag.
      if (['04-reload-20pct','04-reload-55pct','04-reload-75pct'].includes(name)) {
        const crop = await page.locator('#cv').evaluate(canvas => {
          const t = document.createElement('canvas');
          t.width = 640; t.height = 480;
          t.getContext('2d').drawImage(canvas, 385, 235, 450, 338, 0, 0, 640, 480);
          return t.toDataURL('image/jpeg', .72).split(',')[1];
        });
        console.log('M17_QA_CROP_' + name + ':' + crop);
      }
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
    // v753 fix is real only if the ORIGINAL imported source clip retargets.
    // Either readiness or an explicit error ends waiting; an error fails QA.
    await page.waitForFunction(() => {
      const d = document.documentElement.dataset;
      return d.fpsArmsM17SourceRig === 'true' || !!d.fpsArmsM17SourceError;
    }, null, { timeout: 16000, polling: 250 });
    await page.waitForTimeout(1200);
    await capture('02-after-start-hip');
    // Use genuine ADS without pointer-locked synthetic mouse events: the
    // latter used to rotate the CI camera skyward before reload photos.
    assert.equal(await page.evaluate(() => window.__cityM17VisualTestAim?.(true)), true);
    await page.waitForTimeout(1100);
    await capture('03-ads');
    await page.evaluate(() => window.__cityM17VisualTestAim?.(false));
    await page.waitForTimeout(450);
    // QA-only deterministic staging keeps each first-person reload frame
    // frozen long enough for slow software WebGL to draw and be captured.
    // This doesn't change timing or controls in the actual game.
    await page.evaluate(() => {
      document.documentElement.dataset.m17VisualTestHold = 'true';
      document.documentElement.dataset.m17VisualTestPhase = '0.20';
    });
    const started = await page.evaluate(() => window.__cityM17VisualTestStart?.() ?? false);
    assert.equal(started, true, 'CI must start a real M17 reload before sampling');
    await page.waitForTimeout(900);
    console.log('M17_QA_START_STATE:' + JSON.stringify(await page.evaluate(() => {
      const d = document.documentElement.dataset;
      return { carrier: d.m17MagazineCarrier, source: d.m17MagazineSource,
        error: d.m17MagazineSourceError, progress: d.m17MagazineReloadProgress,
        phase: d.m17VisualTestPhase, seat: d.m17MagazineSeat };
    })));
    const samples = [0.20, 0.40, 0.55, 0.65, 0.75, 0.85];
    const reloadTelemetry = [];
    for (const target of samples) {
      await page.evaluate(p => {
        document.documentElement.dataset.m17VisualTestPhase = p.toFixed(2);
      }, target);
      try {
        await page.waitForFunction(target => {
          const d = document.documentElement.dataset;
          return Math.abs(Number(d.m17MagazineReloadProgress) - target) < .018;
        }, target, { timeout: 18000, polling: 100 });
      } catch (err) {
        console.log('M17_QA_STAGE_TIMEOUT:' + JSON.stringify(await page.evaluate(() => ({
          phase: document.documentElement.dataset.m17VisualTestPhase,
          progress: document.documentElement.dataset.m17MagazineReloadProgress,
          carrier: document.documentElement.dataset.m17MagazineCarrier,
          error: document.documentElement.dataset.m17MagazineSourceError
        }))));
        throw err;
      }
      // Allow software WebGL to complete the render, not just update DOM.
      await page.waitForTimeout(340);
      const state = await page.evaluate(() => {
        const d = document.documentElement.dataset;
        return { progress: d.m17MagazineReloadProgress || null,
          distance: d.m17MagazineInsertDistance || null,
          oldDropped: d.m17MagazineOldDropped || null,
          freshVisible: d.m17MagazineFreshVisible || null,
          inserted: d.m17MagazineInserted || null,
          source: d.m17MagazineSource || null,
          carrier: d.m17MagazineCarrier || null,
          seat: d.m17MagazineSeat || null,
          boundsRatio: d.m17MagazineBoundsRatio || null,
          dimensions: d.m17MagazineGeometrySize || null };
      });
      reloadTelemetry.push({ target, ...state });
      await capture('04-reload-' + Math.round(target * 100).toString().padStart(2, '0') + 'pct');
    }
    await writeFile(`${out}/m17-reload-stages.json`, JSON.stringify(reloadTelemetry, null, 2));
    assert.equal(reloadTelemetry[0].carrier, 'ready', 'Original M17 GLB magazine must be seated');
    assert.match(reloadTelemetry[0].source || '', /17rnd[ _]mag_3/i);
    assert.ok(Number(reloadTelemetry[0].boundsRatio) > .10 &&
      Number(reloadTelemetry[0].boundsRatio) < .90,
      'Original magazine must be proportionate to imported pistol bounds');
    assert.equal(reloadTelemetry[0].oldDropped, 'false', 'Seated old magazine must be present early');
    assert.equal(reloadTelemetry[1].oldDropped, 'true', 'Old magazine must leave the gun');
    assert.equal(reloadTelemetry[1].freshVisible, 'true', 'Replacement magazine must rise from the player');
    assert.ok(reloadTelemetry.some(t => Number(t.distance) < .25 && t.freshVisible === 'true'),
      'Fresh magazine must approach the actual GLB seated pose');
    // Release the QA clock hold and let the normal reload finish.
    await page.evaluate(() => {
      delete document.documentElement.dataset.m17VisualTestHold;
      delete document.documentElement.dataset.m17VisualTestPhase;
    });
    // Reload must finish before we can verify the trigger actually fires.
    await page.waitForTimeout(2220);
    await page.mouse.down({ button: 'left' });
    await page.waitForTimeout(80);
    await capture('05-firing');
    await page.mouse.up({ button: 'left' });
    await writeFile(`${out}/diagnostics.json`, JSON.stringify({ build, errors, url: page.url(), m17Grip: await page.locator('html').getAttribute('data-fps-arms-m17-grip-correction'), sourceReady: await page.locator('html').getAttribute('data-fps-arms-m17-source-rig'), sourceError: await page.locator('html').getAttribute('data-fps-arms-m17-source-error'), sourceBones: await page.locator('html').getAttribute('data-fps-arms-m17-source-bones'), sourceDeltaDegrees: await page.locator('html').getAttribute('data-fps-arms-m17-source-delta-degrees') }, null, 2));
    assert.equal(errors.length, 0, `Unhandled JavaScript errors: ${errors.join('; ')}`);
    const sourceReady = await page.locator('html').getAttribute('data-fps-arms-m17-source-rig');
    const sourceError = await page.locator('html').getAttribute('data-fps-arms-m17-source-error');
    assert.equal(sourceReady, 'true', `Original M17 grip not active: ${sourceError}`);
    assert.ok(Number(await page.locator('html').getAttribute('data-fps-arms-m17-source-bones')) >= 12,
      'Expected at least 12 mapped original right-grip joints');
  } finally {
    await page.close();
  }
});

test.after(async () => { await browser.close(); });
