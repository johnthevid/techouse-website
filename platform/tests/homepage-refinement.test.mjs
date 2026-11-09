import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fixture } from './helpers.mjs';
import worker from '../worker.mjs';
const require = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url);
const { chromium } = require('playwright');

test('Homepage refinement preserves navigation, responsive layout and image recovery', async (t) => {
  const f = await fixture(t);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  t.after(() => browser.close());
  for (const width of [1440, 1024, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: width === 1440 ? 'no-preference' : 'reduce',
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
    await page.waitForSelector('.division-banner');
    if (width === 1440) {
      await page.locator('.skip-intro').click();
      await page.waitForFunction(
        () => !document.querySelector('.division-landing').classList.contains('intro-playing'),
      );
    }
    await page.waitForTimeout(400);
    assert.equal(await page.locator('.division-banner').count(), 5);
    assert.equal(
      await page
        .locator(
          '.banner-number,.banner-rest-hint,.landing-bottom,.banner-description,.banner-points,.banner-scope',
        )
        .count(),
      0,
    );
    assert.equal(await page.locator('.banner-division-label').count(), 5);
    assert.equal(await page.locator('.landing-invitation').count(), 0);
    assert.equal(await page.locator('.banner-quote').count(), 5);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    if (width > 900) {
      await page.locator('.banner-trigger').first().focus();
      await page.waitForTimeout(800);
      assert.equal(
        await page
          .locator('.division-banner')
          .first()
          .getAttribute('class')
          .then((c) => c.includes('is-open')),
        true,
      );
      assert.equal(
        await page
          .locator('.division-banner')
          .first()
          .evaluate(
            (panel) =>
              panel.querySelector('.banner-division-label').getBoundingClientRect().bottom <=
              panel.querySelector('.banner-title-row').getBoundingClientRect().top,
          ),
        true,
      );
      const title = await page
        .locator('.division-banner h2')
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      assert.ok(title >= 48);
      assert.ok(
        (await page
          .locator('.banner-quote')
          .first()
          .evaluate((el) => el.getBoundingClientRect().height)) >= 60,
      );
    }
    await page.screenshot({
      path: `/private/tmp/techouse-homepage-${width}.png`,
      fullPage: width === 390,
    });
    if (width === 1440) {
      await page.locator('.banner-global-quote').focus();
      await page.waitForTimeout(800);
      const cue = await page.locator('.company-scroll-cue').boundingBox();
      const tagline = await page.locator('.landing-kicker').boundingBox();
      assert.ok(cue.y >= tagline.y + tagline.height);
      assert.ok(cue.x >= 70);
      await page.locator('.company-scroll-cue').hover();
      await page.waitForTimeout(700);
      assert.equal(
        await page
          .locator('.company-scroll-cue')
          .evaluate((el) => getComputedStyle(el, '::before').clipPath),
        'circle(150% at 50% 50%)',
      );
      await page.locator('.company-scroll-cue').click();
      await page.waitForTimeout(1000);
      assert.ok(await page.evaluate(() => scrollY > 100));
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    }
    // A delayed source shows branding, then reveals; a failed replacement keeps its fallback state.
    let release;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    await page.route('**/assets/solar.jpg?refinement-slow', async (route) => {
      await held;
      const res = await worker.fetch(new Request(f.env.APP_ORIGIN + '/assets/solar.jpg'), f.env);
      await route.fulfill({
        status: res.status,
        body: Buffer.from(await res.arrayBuffer()),
        contentType: 'image/jpeg',
      });
    });
    await page
      .locator('.banner-color-layer')
      .first()
      .evaluate((img) => {
        img.src = '/assets/solar.jpg?refinement-slow';
      });
    await page.waitForSelector('.division-banner.is-image-slow');
    release();
    await page.waitForFunction(
      () => document.querySelector('.banner-color-layer').dataset.previewState === 'ready',
    );
    assert.equal(await page.locator('.is-image-slow').count(), 0);
    await page.route('**/missing-refinement.jpg', (route) => route.abort());
    await page
      .locator('.banner-color-layer')
      .first()
      .evaluate((img) => {
        img.src = '/missing-refinement.jpg';
      });
    await page.waitForSelector('.division-banner.is-image-error');
    assert.deepEqual(errors, []);
    if (width > 900) {
      await page.locator('.banner-trigger').first().focus();
      await page.waitForTimeout(800);
      await page.locator('.banner-quote').first().click();
      await page.waitForURL('**/#/divisions/solar');
    }
    await page.close();
  }
});
