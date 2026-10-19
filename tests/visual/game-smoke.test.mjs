import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.CITY_TEST_URL || 'http://127.0.0.1:8765';
const out = 'test-results/visual';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--disable-dev-shm-usage'] });

test('CITY OUTBREAK loads, starts and captures pistol hip and ADS', { timeout: 150000 }, async () => {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const capture = async (name) => {
    // Capture the actual WebGL canvas, excluding HUD/overlays. Bound every
    // attempt so a stalled GPU screenshot cannot consume the whole test.
    try {
      await page.locator('#cv').screenshot({ path: `${out}/${name}.png`, timeout: 12000, animations: 'disabled' });
    } catch (error) {
      errors.push(`Canvas capture ${name}: ${error.message}`);
      // Retain diagnostics even if the software WebGL renderer stalls.
      await writeFile(`${out}/${name}-capture-error.txt`, String(error));
    }
  };
  try {
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await assert.doesNotReject(() => page.locator('#cv').waitFor({ state: 'visible', timeout: 15000 }));
    await capture('01-start-menu');
    const build = await page.locator('html').getAttribute('data-city-outbreak-build', { timeout: 30000 }).catch(() => null);
    assert.ok(build, 'Game module must load and publish a version');
    // Start is a same-page action; don't wait for navigation after clicking.
    await page.locator('#start').click({ timeout: 30000, noWaitAfter: true });
    await page.waitForFunction(() => document.querySelector('#startScreen')?.style.display === 'none', null, { timeout: 30000 });
    assert.match(await page.locator('#weaponName').textContent(), /M17/i, 'M17 must be the spawned weapon');
    assert.equal(await page.locator('html').getAttribute('data-fps-arms-weapon-test-loadout'), 'm17-only');
    await page.waitForTimeout(4500);
    await capture('02-after-start-hip');
    await page.mouse.move(800, 450);
    await page.mouse.down({ button: 'right' });
    await page.waitForTimeout(1500);
    await capture('03-ads');
    await page.mouse.up({ button: 'right' });
    // Consume some ammunition before testing reload; otherwise R can be a no-op.
    await page.mouse.click(800, 450);
    await page.keyboard.press('r');
    await page.waitForTimeout(600);
    await capture('04-reload');
    await page.mouse.down({ button: 'left' });
    await page.waitForTimeout(250);
    await capture('05-firing');
    await page.mouse.up({ button: 'left' });
    await writeFile(`${out}/diagnostics.json`, JSON.stringify({ build, errors, url: page.url(), m17Grip: await page.locator('html').getAttribute('data-fps-arms-m17-grip-correction'), sourceReady: await page.locator('html').getAttribute('data-fps-arms-m17-source-rig') }, null, 2));
    assert.equal(errors.length, 0, `Unhandled JavaScript errors: ${errors.join('; ')}`);
  } finally {
    await page.close();
  }
});

test.after(async () => { await browser.close(); });
