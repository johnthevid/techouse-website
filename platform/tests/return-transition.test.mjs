import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fixture } from './helpers.mjs';
import worker from '../worker.mjs';
const { chromium } = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url)('playwright');
test('Return transition preserves current styling without duplicate live IDs', async (t) => {
  const f = await fixture(t);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  t.after(() => browser.close());
  for (const width of [1440, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: 'no-preference',
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route('**/*', async (route) => {
      const req = route.request();
      if (!req.url().startsWith(f.env.APP_ORIGIN)) return route.abort();
      const res = await worker.fetch(
        new Request(req.url(), { headers: await req.allHeaders() }),
        f.env,
      );
      await route.fulfill({
        status: res.status,
        headers: Object.fromEntries(res.headers),
        body: Buffer.from(await res.arrayBuffer()),
      });
    });

    await page.goto(f.env.APP_ORIGIN + '/#/divisions/solar');
    await page.waitForSelector('.solar-streamlined');
    const read = (el) => ({
      left: el.getBoundingClientRect().left,
      font: getComputedStyle(el.querySelector('h1')).fontSize,
      bg: getComputedStyle(el.querySelector('.button')).backgroundImage,
    });
    const original = await page.locator('.cover-copy').evaluate(read);
    await page.locator('.cover-copy>.button').hover();
    assert.equal(
      await page
        .locator('.cover-copy>.button')
        .evaluate((el) => getComputedStyle(el).backgroundImage),
      original.bg,
    );
    await page.locator('.back-divisions').first().click();
    await page.waitForSelector('body.landing');
    assert.deepEqual(
      await page.locator('.previous-page-snapshot .cover-copy').evaluate(read),
      original,
    );
    assert.equal(await page.locator('.previous-page-snapshot [id]').count(), 0);
    await page.waitForSelector('.previous-page-snapshot', { state: 'detached' });
    assert.equal(await page.locator('.division-banners').count(), 1);
    assert.deepEqual(errors, []);
    await page.close();
  }
});
