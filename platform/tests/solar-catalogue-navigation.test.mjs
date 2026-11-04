import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fixture } from './helpers.mjs';
import worker from '../worker.mjs';
const require = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url);
const { chromium } = require('playwright');

test('Solar equipment navigation, official imagery and responsive catalogue', async (t) => {
  const f = await fixture(t);
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const request = route.request();
    if (!request.url().startsWith(f.env.APP_ORIGIN)) return route.abort();
    const response = await worker.fetch(new Request(request.url(), { method: request.method(), headers: await request.allHeaders() }), f.env);
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
  });
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/solar');
  await page.waitForSelector('.solar-subnav-call', { state: 'attached' });
  assert.deepEqual(await page.evaluate(() => { const host = document.createElement('div'); host.innerHTML = window.TechouseSolarExtras.confirmationMarkup(3300, 'DEMO-REFERENCE-TEST', true); return [...host.querySelectorAll('.modal-actions > *')].map((el) => ({ siteVisit: el.hasAttribute('data-request-visit'), reference: el.dataset.inquiryId })); }), [{ siteVisit: true, reference: 'DEMO-REFERENCE-TEST' }]);
  await page.waitForFunction(() => !document.querySelector('.division-subnav').classList.contains('solar-call-visible'));
  assert.equal(await page.locator('#solar-technical').evaluate((el) => el.open), false);
  await page.locator('[data-scroll="solar-technical"]').click();
  await page.waitForFunction(() => document.querySelector('#solar-technical').open);
  await page.waitForFunction(() => document.querySelector('#products').getBoundingClientRect().top >= document.querySelector('.division-subnav').getBoundingClientRect().bottom && document.querySelector('#products').getBoundingClientRect().top < 300);
  assert.equal(await page.locator('.solar-subnav-call').evaluate((el) => el.inert), false);
  assert.equal(await page.locator('.solar-subnav-call').getAttribute('href'), 'tel:+639855626888');
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForFunction(() => document.querySelector('.solar-subnav-call').inert);
  const slider = page.locator('.solar-offset-control input');
  await slider.focus();
  const previous = +(await slider.inputValue());
  await slider.press('ArrowLeft');
  assert.equal(+(await slider.inputValue()), previous - 5);
  await page.locator('#solar-discovery').scrollIntoViewIfNeeded();
  assert.match(await page.locator('.discovery-story-photo').getAttribute('alt'), /home interior/);
  await page.locator('[data-next]').click();
  await page.locator('[name=goal][value="Lower electricity costs"]').check();
  assert.match(await page.locator('.discovery-story-photo').getAttribute('src'), /peso-meralco-bill/);
  await page.locator('.discovery-story-photo').evaluate((img) => img.decode());
  for (const [category, count] of [['panels', 3], ['inverters', 5], ['batteries', 3]]) {
    await page.goto(f.env.APP_ORIGIN + '/#/divisions/solar/products/' + category);
    await page.waitForSelector('.catalogue-refined');
    assert.equal(await page.locator('.catalogue-product').count(), count);
    assert.deepEqual(await page.locator('.catalogue-tab-count').allTextContents(), ['3', '5', '3']);
    assert.equal(await page.locator('.catalogue-partnership').count(), 1);
    const row = await page.locator('.catalogue-product').evaluateAll((cards) => cards.slice(0, 3).map((card) => ({ top: card.getBoundingClientRect().top, height: card.getBoundingClientRect().height })));
    assert.ok(row.every((card) => Math.abs(card.top - row[0].top) < 2 && card.height < 470), 'Three compact products must share the desktop row');
    for (const image of await page.locator('.catalogue-product img').all()) {
      assert.match(await image.getAttribute('src'), /^assets\/skyworth-products\/.*\.png$/);
      await image.evaluate((el) => { el.loading = 'eager'; return el.decode(); });
    }
    for (const href of await page.locator('.catalogue-actions a[target="_blank"]').evaluateAll(links => links.map(link => link.getAttribute('href')))) {
      const response = await f.request('/' + href);
      assert.equal(response.status, 200, 'Datasheet must exist: ' + href);
      assert.equal(response.response.headers.get('content-type'), 'application/pdf');
    }
    assert.equal(await page.locator('a.catalogue-image, .catalogue-image a').count(), 0);
    const catalogueUrl = page.url();
    await page.locator('.catalogue-image').first().click();
    assert.equal(page.url(), catalogueUrl);
    assert.equal(page.context().pages().length, 1);
    await page.screenshot({ path: '/tmp/refined-' + category + '.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: '/tmp/refined-mobile-' + category + '.png' });
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/solar');
  await page.locator('[data-scroll="solar-technical"]').click();
  await page.waitForFunction(() => document.querySelector('#solar-technical').open);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  const button = await page.locator('.solar-subnav-call').boundingBox();
  const links = await page.locator('.solar-subnav-links').boundingBox();
  assert.ok(links.x + links.width <= button.x, 'Mobile navigation links must not overlap Call us');
  await page.screenshot({ path: '/tmp/refined-solar-mobile.png' });
  await page.locator('.solar-learning').evaluate((el) => { el.closest('details').open = true; });
  await page.locator('[data-forward]').click();
  await page.locator('[data-forward]').click();
  await page.locator('.panel-choice-guide summary').click();
  assert.equal(await page.locator('.panel-choice-guide').evaluate((el) => el.open), true);
  assert.equal(await page.locator('.panel-choice-content dt').count(), 3);
  await page.locator('#solar-technical').evaluate((el) => { el.open = false; });
  await page.locator('[data-forward]').click();
  await page.waitForFunction(() => document.querySelector('#solar-technical').open);
  assert.match(await page.locator('[data-forward]').textContent(), /View equipment/);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.locator('.panel-choice-guide').screenshot({ path: '/tmp/panel-choice-mobile.png' });
  // Category switches share a track and must not rebuild or vertically move the page.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/solar/products/panels');
  await page.waitForSelector('.catalogue-tabs');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => scrollTo(0, 120));
  const categoryHeights = {};
  for (const category of ['inverters', 'batteries', 'panels']) {
    const before = await page.evaluate(() => ({ y: scrollY, top: document.querySelector('.catalogue-tabs').getBoundingClientRect().top }));
    await page.locator('.catalogue-tabs a[href$="/' + category + '"]').click();
    const samples = await page.evaluate(async () => {
      const results = [];
      for (let i = 0; i < 8; i++) {
        await new Promise(requestAnimationFrame);
        results.push({ y: scrollY, top: document.querySelector('.catalogue-tabs').getBoundingClientRect().top,
          gaps: [...document.querySelectorAll('.catalogue-slide-track')].map(track => {
            const [a, b] = track.children;
            return b.getBoundingClientRect().left - a.getBoundingClientRect().right;
          }) });
      }
      return results;
    });
    assert.ok(samples.some(sample => sample.gaps.length === 2), 'Both sections must use connected tracks');
    for (const sample of samples) {
      assert.equal(sample.y, before.y);
      assert.equal(sample.top, before.top);
      assert.ok(sample.gaps.every(gap => Math.abs(gap) < 1), 'Category edges must stay joined');
    }
    await page.waitForFunction(() => !document.querySelector('.catalogue-slide-track'));
    categoryHeights[category] = await page.locator('.catalogue-products').evaluate(element => element.getBoundingClientRect().height);
  }
  assert.ok(categoryHeights.inverters > categoryHeights.panels + 200, 'Shorter categories must release unused space below the grid');
  assert.ok(categoryHeights.inverters > categoryHeights.batteries + 200);
  await page.locator('.catalogue-tabs a[href$="/inverters"]').click();
  await page.locator('.catalogue-tabs a[href$="/batteries"]').click();
  await page.waitForFunction(() => !document.querySelector('.catalogue-slide-track'));
  assert.equal(await page.locator('.catalogue-product').count(), 3);
  assert.equal(await page.locator('#catalogue-title').count(), 1);
  assert.equal(await page.evaluate(() => scrollY), 120);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.evaluate(() => scrollTo(0, 100));
  await page.locator('.catalogue-tabs a[href$="/panels"]').click();
  assert.equal(await page.evaluate(() => scrollY), 100);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.equal(await page.locator('.catalogue-slide-track').count(), 0);
  assert.deepEqual(errors, []);
});
