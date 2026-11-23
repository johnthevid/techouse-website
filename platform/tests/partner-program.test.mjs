import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fixture } from './helpers.mjs';
import worker from '../worker.mjs';
const { chromium } = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url)('playwright');

test('Partner page and application flow', async (t) => {
  const f = await fixture(t);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  t.after(() => browser.close());
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    t.after(() => page.close());
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route('**/*', async (route) => {
      const req = route.request();
      if (!req.url().startsWith(f.env.APP_ORIGIN)) return route.abort();
      const res = await worker.fetch(
        new Request(req.url(), { method: req.method(), headers: await req.allHeaders(), ...(req.postDataBuffer() ? { body: req.postDataBuffer() } : {}) }),
        f.env,
      );
      await route.fulfill({
        status: res.status,
        headers: Object.fromEntries(res.headers),
        body: Buffer.from(await res.arrayBuffer()),
      });
    });

    // Partner page: calculator and slideshow.
    await page.goto(f.env.APP_ORIGIN + '/#/partnership');
    await page.locator('#partner-value').fill('2000000');
    await page.locator('#partner-count').fill('3');
    await page.waitForFunction(
      () => document.querySelector('#partner-total').textContent === '₱300,000',
    );
    assert.equal(await page.locator('#partner-sum').textContent(), '5% of 3 projects at ₱2,000,000');
    await page.locator('[data-slide-next]').click();
    assert.equal(await page.locator('[data-slide-number]').textContent(), '2');
    await page.locator('[data-slide-go="6"]').click();
    assert.equal(await page.locator('[data-next-label]').textContent(), 'Start again');
    assert.equal(await page.locator('[data-slide-image]:not([hidden])').count(), 1);
    assert.equal(await page.locator('#header .header-call').count(), 0);

    // Application: each step validates before moving on.
    await page.locator('.partner-cover .button').click();
    await page.waitForURL(/#\/partnership\/apply$/);
    const current = () => page.locator('.partner-apply-steps [aria-current="step"]').textContent();
    await page.locator('[data-apply-next]').click();
    assert.match(await current(), /About you/);
    await page.locator('#pa-name').fill('Maria Santos');
    await page.locator('#pa-phone').fill('0917 555 0123');
    await page.locator('#pa-location').fill('Lipa, Batangas');
    await page.locator('[data-apply-next]').click();
    assert.match(await current(), /Your network/);
    await page.locator('[data-apply-next]').click();
    assert.match(await current(), /Your network/, 'a role is required');
    await page.locator('.partner-choice', { hasText: 'Electrician or contractor' }).click();
    await page.locator('.partner-choice', { hasText: 'Homeowners' }).click();
    await page.locator('[data-apply-next]').click();
    assert.match(await current(), /Review/);
    assert.equal(
      await page.evaluate(() => document.activeElement.textContent),
      'Review',
      'focus moves to the step heading',
    );
    await page.locator('.partner-apply-submit').click();
    assert.equal(await page.locator('.partner-apply-done').count(), 0, 'agreements are required');
    for (const box of await page.locator('.partner-agree input').all()) await box.check();
    await page.locator('.partner-apply-submit').click();
    await page.locator('.partner-apply-done').waitFor();
    const saved = await page.evaluate(
      () => JSON.parse(localStorage.getItem('techouse.sample.inquiries.v1')).at(-1),
    );
    assert.equal(saved.topic, 'partnership');
    assert.equal(saved.company, '');
    assert.match(saved.requirements, /Role: Electrician or contractor/);
    // On the hosted site the application also reaches the team's inbox.
    const stored = f.db.prepare("SELECT topic, phone FROM inquiries WHERE id=?").get(saved.id);
    assert.equal(stored?.topic, 'partnership');
    assert.ok(saved.token);

    // A partner application is not a project inquiry.
    await page.goto(f.env.APP_ORIGIN + '/#/inquiry');
    assert.equal(await page.locator('#saved-inquiry-history').count(), 0);
    await page.goto(f.env.APP_ORIGIN + '/#/inquiry?topic=partnership');
    await page.waitForURL(/#\/partnership\/apply$/);

    assert.deepEqual(errors, []);
    await page.evaluate(() => localStorage.clear());
  }
});
