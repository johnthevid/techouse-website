import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fixture } from './helpers.mjs';
import worker from '../worker.mjs';
const { chromium } = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url)('playwright');

test('Compact touch homepage keeps one focused story and landscape calculator retains working results', async (t) => {
  const f = await fixture(t);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  t.after(() => browser.close());
  for (const [width, height] of [
    [375, 667],
    [768, 1024],
    [812, 375],
    [1024, 768],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      hasTouch: true,
      reducedMotion: 'reduce',
    });
    t.after(() => page.close());
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
    await page.goto(f.env.APP_ORIGIN + '/');
    // Phones (under 768px): one chapter, a 2 x 2 pill grid and a menu
    const phone = width < 768;
    if (phone) {
      await page.waitForSelector('[data-mobile-home]');
      const pills = page.locator('.mh-pill:not(.is-gone)');
      assert.equal(await pills.count(), 4);
      const tops = await pills.evaluateAll(
        (els) => new Set(els.map((el) => Math.round(el.getBoundingClientRect().top))).size,
      );
      assert.equal(tops, 2);
      await page.locator('.mh-pill[data-index="1"]').click();
      await page.waitForFunction(() =>
        document.querySelectorAll('.mh-chapter')[1].classList.contains('is-on'),
      );
      assert.equal(
        await page.locator('.mh-pill[data-index="1"]').getAttribute('aria-hidden'),
        'true',
      );
      await page.locator('.mh-menu-button').click();
      assert.equal(await page.locator('.mh-menu-button').getAttribute('aria-expanded'), 'true');
      assert.deepEqual(
        await page
          .locator('.mh-menu-list > *')
          .allInnerTexts()
          .then((t) => t.map((x) => x.split('\n')[0].trim())),
        ['Our divisions', 'About Techouse', 'News', 'Join us & be a partner'],
      );
      await page.keyboard.press('Escape');
      await page.locator('.mh-pill[data-index="0"]').click();
      await page.waitForFunction(() =>
        document.querySelectorAll('.mh-chapter')[0].classList.contains('is-on'),
      );
      await page.locator('.mh-chapter.is-on .mh-cta').click();
      await page.waitForURL('**/#/divisions/solar');
    } else {
      await page.waitForSelector('.division-banner');
      assert.equal(await page.locator('.division-banner.is-open').count(), 1);
      const titles = await page.locator('.banner-title-row h2').allInnerTexts();
      assert.deepEqual(titles, [
        'Power your tomorrow.',
        'Build your next chapter.',
        'Rethink your space.',
        'Shape your next address.',
        'Rise to new possibilities.',
      ]);
      assert.equal(
        await page.locator('.banner-scroll-cue').evaluate((el) => getComputedStyle(el).position),
        'fixed',
      );
      assert.equal(await page.locator('.compact-scene-image.is-active').count(), 1);
      await page.locator('.banner-trigger').nth(1).click();
      assert.equal(await page.locator('.banner-construction.is-open').count(), 1);
      await page.evaluate(() => window.scrollTo({ top: 100, behavior: 'instant' }));
      await page.waitForTimeout(40);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForFunction(() =>
        document.querySelector('.banner-solar').classList.contains('is-open'),
      );
      await page.locator('.banner-cta').first().click();
      await page.waitForURL('**/#/divisions/solar');
    }
    await page.locator('.discovery-progress [data-step="2"]').click();
    await page.locator('#solar-estimator [name="bill"]').fill('6000');
    await page.locator('.calculate-cost').click();
    assert.equal(await page.locator('#solar-estimate-inquiry').isVisible(), true);
    assert.equal(
      await page.locator('#estimate-result').evaluate((el) => el.innerText.includes('null')),
      false,
    );
    if (width > height) {
      const tops = await page
        .locator('#solar-estimator')
        .evaluate((el) => [...el.children].map((child) => child.getBoundingClientRect().top));
      assert.ok(Math.abs(tops[0] - tops[1]) < 2);
    }
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      true,
    );
    assert.deepEqual(errors, []);
  }
});
