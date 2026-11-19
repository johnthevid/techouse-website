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
    assert.equal(await page.locator('.landing-kicker').isVisible(), false);
    assert.equal(await page.locator('.banner-quote,.banner-details').count(), 0);
    assert.equal(await page.locator('.banner-scroll-cue').count(), 1);
    assert.equal(await page.locator('#company .eyebrow,#company .company-divisions').count(), 0);
    assert.equal(await page.locator('#company p').count(), 2);
    assert.equal(await page.locator('#footer .footer-bottom').count(), 0);
    assert.equal(await page.locator('#footer .footer-top .footer-socials a').count(), 2);
    assert.equal(await page.locator('#footer .footer-brand .footer-company-name').count(), 1);
    assert.match(await page.locator('.footer-copyright').innerText(), /All rights reserved/);
    assert.equal(await page.locator('.banner-scroll-label').innerText(), 'About Techouse');
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    if (width > 1100) {
      const initialMetrics = await page
        .locator('.banner-content')
        .first()
        .evaluate((el) => ({
          width: el.offsetWidth,
          font: getComputedStyle(el.querySelector('h2')).fontSize,
        }));
      const anchor = await page
        .locator('.banner-division-label')
        .first()
        .evaluate((el) => el.getBoundingClientRect().top);
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
              panel.querySelector('.banner-division-label').getBoundingClientRect().top >=
              panel.querySelector('.banner-title-row').getBoundingClientRect().bottom,
          ),
        true,
      );
      const title = await page
        .locator('.division-banner h2')
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      assert.ok(title >= 48);
      const expandedMetrics = await page
        .locator('.banner-content')
        .first()
        .evaluate((el) => ({
          width: el.offsetWidth,
          font: getComputedStyle(el.querySelector('h2')).fontSize,
        }));
      assert.deepEqual(expandedMetrics, initialMetrics);
      const labelTop = await page
        .locator('.banner-division-label')
        .first()
        .evaluate((el) => el.getBoundingClientRect().top);
      assert.ok(Math.abs(labelTop - anchor + 64) < 1, `Label moved ${labelTop - anchor}px`);
      await page.locator('.banner-trigger').nth(2).focus();
      await page.waitForTimeout(100);
      const midTop = await page
        .locator('.banner-division-label')
        .first()
        .evaluate((el) => el.getBoundingClientRect().top);
      assert.ok(midTop >= anchor - 65 && midTop <= anchor + 1);
      await page.locator('.banner-trigger').first().focus();
      await page.waitForTimeout(800);
      assert.ok(
        (await page
          .locator('.banner-division-label')
          .first()
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))) >= 22,
      );
    }
    await page.screenshot({
      path: `/private/tmp/techouse-homepage-${width}.png`,
      fullPage: width === 390,
    });
    if (width === 1440) {
      await page.locator('.banner-global-quote').focus();
      await page.waitForTimeout(800);
      assert.equal(await page.locator('.company-scroll-cue').count(), 0);
      assert.equal(
        await page.locator('.landing-kicker').evaluate((el) => getComputedStyle(el).fontWeight),
        '300',
      );
      await page.locator('.banner-scroll-cue').click();
      await page.waitForTimeout(1000);
      assert.ok(await page.evaluate(() => scrollY > 100));
      assert.equal(
        await page.locator('#company-title').evaluate((el) => getComputedStyle(el).textAlign),
        'center',
      );
      assert.equal(await page.locator('#company a.button').getAttribute('href'), '#/about');
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
      await page.locator('.banner-trigger').first().press('Enter');
      await page.waitForURL('**/#/divisions/solar');
    }
    await page.close();
  }
});

test('Brand opening completes, skips and cleans up navigation and failed imagery', async (t) => {
  const f = await fixture(t);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
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
  const unlocked = async () => {
    await page.waitForSelector('.brand-intro', { state: 'detached', timeout: 8000 });
    assert.equal(
      await page.evaluate(
        () =>
          document.documentElement.classList.contains('intro-scroll-locked') ||
          document.querySelector('#main').inert,
      ),
      false,
    );
  };
  await page.goto(f.env.APP_ORIGIN + '/');
  await page.waitForSelector('.brand-intro[data-phase="mark"]');
  assert.equal(
    await page.locator('.brand-intro').evaluate((el) => getComputedStyle(el).backgroundColor),
    'rgb(255, 255, 255)',
  );
  await page.waitForTimeout(350);
  await page.screenshot({ path: '/private/tmp/techouse-brand-mark.png' });
  await page.waitForSelector('.brand-intro[data-phase="wordmark"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/private/tmp/techouse-brand-wordmark.png' });
  await page.waitForSelector('.brand-intro[data-phase="message"]');
  assert.equal(
    await page.locator('.brand-intro-message').textContent(),
    await page.locator('.landing-kicker').textContent(),
  );
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/private/tmp/techouse-brand-message.png' });
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('.brand-intro').getAttribute('data-phase'), 'message');
  await page.waitForSelector('[data-reveal-phase="headline"]');
  assert.equal(
    await page
      .locator('.banner-content')
      .first()
      .evaluate((el) => getComputedStyle(el).opacity),
    '0',
  );
  await page.waitForSelector('[data-reveal-phase="divisions"]');
  await unlocked();
  await page.screenshot({ path: '/private/tmp/techouse-brand-complete.png' });
  await page.goto(f.env.APP_ORIGIN + '/');
  await page.locator('.skip-intro').press('Enter');
  await unlocked();
  await page.goto(f.env.APP_ORIGIN + '/');
  await page.waitForSelector('.brand-intro');
  await page.evaluate(() => {
    location.hash = '/about';
  });
  await unlocked();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(f.env.APP_ORIGIN + '/');
  assert.equal(await page.locator('.brand-intro').count(), 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/techouse-logo-horizontal.png', (route) => route.abort());
  await page.goto(f.env.APP_ORIGIN + '/');
  await page.waitForSelector('.brand-intro');
  await unlocked();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  await page.close();
});
