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
    // Phones (under 600px): one chapter over a swipeable photo strip, five round selectors,
    // Call us and Get a quote fixed at the bottom, and a menu
    const phone = width < 600;
    if (phone) {
      await page.waitForSelector('[data-mobile-home]');
      const picks = page.locator('.mh-pick button');
      assert.equal(await picks.count(), 5);
      const tops = await picks.evaluateAll(
        (els) => new Set(els.map((el) => Math.round(el.getBoundingClientRect().top))).size,
      );
      assert.equal(tops, 1);
      assert.equal(await page.locator('#header .header-call').isVisible(), false);
      assert.deepEqual(
        await page
          .locator('.mh-bar a')
          .evaluateAll((els) => els.map((el) => [el.textContent.trim(), el.getAttribute('href')])),
        [
          ['Call us', 'tel:+639855626888'],
          ['Get a quote', '#/inquiry'],
        ],
      );
      await picks.nth(1).click();
      await page.waitForFunction(() =>
        document.querySelectorAll('.mh-chapter')[1].classList.contains('is-on'),
      );
      assert.equal(await picks.nth(1).getAttribute('aria-pressed'), 'true');
      // Swiping the photo left moves to the next division
      await page.waitForFunction(
        () => !document.querySelector('.division-landing').classList.contains('intro-playing'),
      );
      const stage = await page.locator('.mh-stage').boundingBox();
      const y = stage.y + stage.height * 0.45;
      await page.mouse.move(stage.x + stage.width - 40, y);
      await page.mouse.down();
      for (let x = stage.x + stage.width - 40; x > stage.x + 40; x -= 30)
        await page.mouse.move(x, y);
      await page.mouse.up();
      await page.waitForFunction(() =>
        document.querySelectorAll('.mh-chapter')[2].classList.contains('is-on'),
      );
      assert.equal(await picks.nth(2).getAttribute('aria-pressed'), 'true');
      await page.locator('.mh-menu-button').click();
      assert.equal(await page.locator('.mh-menu-button').getAttribute('aria-expanded'), 'true');
      assert.deepEqual(
        await page
          .locator('.mh-menu-list > *')
          .allInnerTexts()
          .then((t) => t.map((x) => x.split('\n')[0].trim())),
        ['Our divisions', 'About Techouse', 'News', 'Be a partner'],
      );
      await page.keyboard.press('Escape');
      await page.locator('.mh-pick button[data-index="0"]').click();
      await page.waitForFunction(() =>
        document.querySelectorAll('.mh-chapter')[0].classList.contains('is-on'),
      );
      await page.locator('.mh-chapter.is-on .mh-cta').click();
      await page.waitForURL('**/#/divisions/solar');
    } else if (width >= 600 && height >= 600) {
      // Touch tablets: five panels, tap to open, X to close, the open panel's button navigates
      await page.waitForSelector('[data-tablet-home]');
      assert.equal(await page.locator('.division-banners').isVisible(), false);
      assert.equal(await page.locator('.tp-panel').count(), 5);
      assert.equal(await page.locator('.tp-panel.is-open').count(), 0);
      await page.locator('.tp-panel[data-index="1"] .tp-hit').click();
      assert.equal(
        await page.locator('.tp-panel[data-index="1"]').getAttribute('class'),
        'tp-panel is-open',
      );
      assert.match(page.url(), /\/$|#\/?$/);
      await page.locator('.tp-panel[data-index="3"] .tp-hit').click();
      assert.equal(await page.locator('.tp-panel.is-open').getAttribute('data-index'), '3');
      await page.locator('.tp-panel.is-open .tp-close').click();
      assert.equal(await page.locator('.tp-panel.is-open').count(), 0);
      await page.locator('.tp-panel[data-index="0"] .tp-hit').click();
      await page.locator('.tp-panel.is-open .tp-cta').click();
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
    await page.locator('.discovery-progress [data-step="1"]').click();
    await page.locator('#solar-estimator [name="bill"]').fill('6000');
    await page.locator('.solar-usage-choices label:has(input[value="50"])').click();
    await page.locator('.solar-coverage-choices label:has(input[value="80"])').click();
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
