import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fixture } from './helpers.mjs';
import worker from '../worker.mjs';
const { chromium } = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url)('playwright');
test('Partnership concept has responsive entry points and an editable demo inquiry', async (t) => {
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

    await page.goto(f.env.APP_ORIGIN + '/#/');
    await page.locator('.partnership-banner a').click();
    await page.waitForURL('**/#/partnership');
    await page.waitForSelector('.partnership-cards');
    assert.equal(await page.locator('.partnership-cards article').count(), 3);
    console.log(
      width,
      await page.evaluate(() => ({
        w: innerWidth,
        sw: document.documentElement.scrollWidth,
        items: [...document.querySelectorAll('body *')]
          .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
          .map((e) => [e.tagName, e.className, e.getBoundingClientRect().right])
          .slice(0, 12),
      })),
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    await page.screenshot({
      path: `/private/tmp/techouse-partnership-${width}.png`,
      fullPage: true,
    });
    await page.locator('.partnership-hero .button').click();
    await page.waitForSelector('#inquiry-form');
    assert.match(await page.locator('#inquiry-requirements').inputValue(), /Partnership inquiry/);
    assert.equal(await page.locator('.page-hero h1').innerText(), 'Let’s work together.');
    await page
      .locator('#inquiry-requirements')
      .fill('Partnership inquiry: interested in collaborating on solar projects.');
    assert.deepEqual(errors, []);
    await page.close();
  }
});
