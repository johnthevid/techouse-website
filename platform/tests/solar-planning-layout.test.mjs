import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fixture } from './helpers.mjs';
import worker from '../worker.mjs';
const { chromium } = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url)('playwright');
test('Three-step solar planner preserves selections, calculation and responsive layout', async (t) => {
  const f = await fixture(t);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  t.after(() => browser.close());
  for (const width of [1440, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
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
    await page.waitForSelector('.solar-planning-pages');
    const margins = await page.evaluate(() =>
      ['.cover-copy', '.division-wrap', '#footer > .container'].map((selector) => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return { left: r.left, right: r.right };
      }),
    );
    assert.ok(
      margins.every(
        (r) => Math.abs(r.left - margins[1].left) < 1 && Math.abs(r.right - margins[1].right) < 1,
      ),
    );
    assert.equal(await page.locator('#estimator').isVisible(), false);
    await page.locator('#solar-discovery input[value="Commercial"]').check();
    await page.locator('[data-next]').click();
    assert.equal(await page.locator('#estimator').isVisible(), false);
    await page.locator('#solar-discovery input[value="Energy after sunset"]').check();
    await page.locator('[data-next]').click();
    assert.equal(await page.locator('#estimator').isVisible(), true);
    await page.locator('#solar-estimator input[name="bill"]').fill('6000');
    await page.locator('.calculate-cost').click();
    assert.equal(await page.locator('#solar-estimate-inquiry').isVisible(), true);
    await page.screenshot({ path: `/private/tmp/techouse-planner-${width}.png`, fullPage: true });
    const dimensions = await page.locator('#solar-estimator').evaluate((el) => ({
      width: el.getBoundingClientRect().width,
      parent: el.closest('.solar-planning-pages').getBoundingClientRect().width,
    }));
    assert.ok(Math.abs(dimensions.width - dimensions.parent) < 3);
    assert.equal(await page.locator('.solar-estimate-back').count(), 0);
    await page.locator('.discovery-progress [data-step="1"]').click();
    assert.equal(
      await page.locator('#solar-discovery input[value="Energy after sunset"]').isChecked(),
      true,
    );
    await page.locator('[data-back]').click();
    assert.equal(
      await page.locator('#solar-discovery input[value="Commercial"]').isChecked(),
      true,
    );
    await page.locator('[data-scroll="estimator"]').click();
    assert.equal(await page.locator('#estimator').isVisible(), true);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    assert.equal(await page.locator('#estimate-result .estimate-ready > span').count(), 0);
    await page.locator('.solar-technical-guide > summary').click();
    assert.equal(await page.locator('.skyworth-range-card').count(), 3);
    assert.equal(await page.locator('.skyworth-range-card .range-model-label').count(), 0);
    assert.equal(await page.locator('.skyworth-range-card a').count(), 3);
    assert.deepEqual(
      await page
        .locator('.skyworth-range-card a')
        .evaluateAll((links) => links.map((a) => a.getAttribute('href'))),
      [
        '#/divisions/solar/products/panels',
        '#/divisions/solar/products/inverters',
        '#/divisions/solar/products/batteries',
      ],
    );
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('.discovery-progress [data-step="0"]').click();
    await page.locator('.discovery-progress [data-step="1"]').click();
    await page
      .locator('.discovery-stage')
      .evaluate((el) =>
        Promise.all(el.getAnimations().map((animation) => animation.finished.catch(() => {}))),
      );
    assert.equal(
      await page.locator('.discovery-stage').evaluate((el) => getComputedStyle(el).filter),
      'none',
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
});
