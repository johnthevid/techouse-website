import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fixture } from './helpers.mjs';
import worker from '../worker.mjs';
import { parseDetails } from '../insights.mjs';
const { chromium } = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url)('playwright');

const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const inquiry = (extra = {}) => ({
  name: 'Maria Santos',
  email: 'maria@example.com',
  division: 'elevators',
  location: 'Makati · Metro Manila',
  requirements: 'A bed elevator for our clinic building.',
  ...extra,
});

test('division questions: the server keeps only known answers and stores them per inquiry', async (t) => {
  assert.equal(parseDetails('construction', { roofType: 'metal' }, fail), null);
  assert.deepEqual(parseDetails('solar', { roofType: 'metal', service: 'install' }, fail), { roofType: 'metal' });
  assert.equal(parseDetails('solar', { roofType: 'thatch' }, fail), null);
  assert.deepEqual(
    parseDetails('elevators', { service: 'install', floors: 6, capacity: '1600', item: 'bed', doors: '2-opposite', building: 'castle', floors2: 3 }, fail),
    { service: 'install', capacity: '1600', item: 'bed', doors: '2-opposite', floors: 6 },
  );
  assert.equal(parseDetails('elevators', { floors: 1 }, fail), null);
  assert.equal(parseDetails('elevators', { floors: '6' }, fail), null);
  assert.throws(() => parseDetails('elevators', { part: 'x'.repeat(201) }, fail), (e) => e.status === 400);

  const f = await fixture(t);
  const sent = await f.request('/api/inquiries', 'POST', inquiry({ details: { service: 'parts', brand: 'hitachi', part: 'Main control board' } }));
  assert.equal(sent.status, 201);
  const roof = await f.request('/api/inquiries', 'POST', inquiry({ email: 'r@example.com', division: 'solar', details: { roofType: 'tile' } }));
  assert.equal(roof.status, 201);
  await f.login();
  const list = (await f.request('/api/admin/inquiries')).value.inquiries;
  assert.deepEqual(list.find((q) => q.id === sent.value.id).details, { service: 'parts', brand: 'hitachi', part: 'Main control board' });
  assert.deepEqual(list.find((q) => q.id === roof.value.id).details, { roofType: 'tile' });
  const updated = await f.request('/api/admin/inquiries/update', 'POST', { id: roof.value.id, status: 'contacted' });
  assert.deepEqual(updated.value.inquiry.details, { roofType: 'tile' });
  assert.equal((await f.request('/api/admin/inquiries/delete', 'POST', { id: sent.value.id })).status, 200);
  assert.equal(f.db.prepare('SELECT COUNT(*) n FROM inquiry_details').get().n, 1);

  // Closed division pages are a validated setting.
  const snapshot = await f.request('/api/admin/content');
  const body = structuredClone(snapshot.value.content);
  for (const bad of [['castle'], 'development', ['development', 'development']]) {
    body.settings = { closedDivisions: bad };
    assert.equal((await f.request('/api/admin/content', 'PUT', { content: body, version: snapshot.value.version })).status, 400);
  }
  body.settings = { closedDivisions: [] };
  assert.equal((await f.request('/api/admin/content', 'PUT', { content: body, version: snapshot.value.version })).status, 200);
});

async function open(t, f) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  t.after(() => browser.close());
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', async (route) => {
    const req = route.request();
    if (!req.url().startsWith(f.env.APP_ORIGIN)) return route.abort();
    const res = await worker.fetch(
      new Request(req.url(), {
        method: req.method(),
        headers: await req.allHeaders(),
        ...(req.postDataBuffer() ? { body: req.postDataBuffer() } : {}),
      }),
      f.env,
    );
    await route.fulfill({ status: res.status, headers: Object.fromEntries(res.headers), body: Buffer.from(await res.arrayBuffer()) });
  });
  return { page, errors, context };
}

test('division questions: elevator planner hands its answers to the inquiry, solar asks the roof type', async (t) => {
  const f = await fixture(t);
  const { page, errors } = await open(t, f);
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/elevators');
  await page.waitForSelector('#elevator-start [data-lift-plan]');
  // Only the first question shows until a service is chosen.
  assert.equal(await page.locator('.lift-q[data-q="building"]').isVisible(), false);
  await page.locator('.lift-choices label', { hasText: 'Parts and components' }).click();
  assert.equal(await page.locator('[data-parts-offer]').isVisible(), true);
  assert.equal(await page.locator('.lift-q[data-q="capacity"]').isVisible(), false);
  await page.locator('.lift-choices label', { hasText: 'New installation' }).click();
  assert.equal(await page.locator('[data-parts-offer]').isVisible(), false);
  await page.locator('.lift-q[data-q="building"] label', { hasText: 'Commercial' }).click();
  await page.fill('#lift-floors', '5');
  await page.locator('.lift-stepper [data-step="1"]').click();
  await page.locator('.lift-q[data-q="capacity"] label', { hasText: '1,600 kg' }).click();
  await page.locator('.lift-q[data-q="item"] label', { hasText: 'A hospital bed' }).click();
  await page.locator('.lift-q[data-q="doors"] label', { hasText: 'Two, front and back' }).click();
  await page.locator('.lift-plan [type="submit"]').click();

  await page.waitForSelector('#inquiry-form [data-details="elevators"]:not([hidden])');
  assert.equal(await page.inputValue('#inquiry-lift-service'), 'install');
  assert.equal(await page.inputValue('#inquiry-lift-floors'), '6');
  assert.equal(await page.inputValue('#inquiry-lift-item'), 'bed');
  assert.equal(await page.locator('[data-lift="brand"]').isVisible(), false);
  assert.match(await page.inputValue('#inquiry-requirements'), /new elevator installation for a commercial building with 6 floors/);
  // Solar asks for the roof type instead; other divisions ask neither.
  await page.selectOption('#inquiry-division', 'solar');
  assert.equal(await page.locator('#inquiry-roof').isVisible(), true);
  assert.equal(await page.locator('#inquiry-lift-service').isVisible(), false);
  await page.selectOption('#inquiry-division', 'construction');
  assert.equal(await page.locator('#inquiry-roof').isVisible(), false);
  await page.selectOption('#inquiry-division', 'elevators');
  // The untouched elevator sentence was cleared when the visitor left Elevators.
  assert.equal(await page.inputValue('#inquiry-requirements'), '');
  await page.fill('#inquiry-requirements', 'A bed elevator for our clinic building.');

  await page.fill('#inquiry-name', 'Maria Santos');
  await page.fill('#inquiry-email', 'maria@example.com');
  await page.fill('#inquiry-location', 'Makati · Metro Manila');
  const answer = page.waitForResponse((r) => r.url().endsWith('/api/inquiries'));
  await page.locator('#inquiry-form [type="submit"]').click();
  assert.equal((await answer).status(), 201);
  await page.waitForSelector('.success');
  const row = f.db.prepare('SELECT data FROM inquiry_details').get();
  assert.deepEqual(JSON.parse(row.data), { service: 'install', building: 'commercial', floors: 6, capacity: '1600', item: 'bed', doors: '2-opposite' });

  // Staff see the answers in the inbox.
  await f.login();
  const [name, value] = f.getCookie().split('=');
  await page.context().addCookies([{ name, value, url: f.env.APP_ORIGIN }]);
  const id = f.db.prepare('SELECT inquiry_id FROM inquiry_details').get().inquiry_id;
  await page.goto(f.env.APP_ORIGIN + '/office.html#/office/inquiries?id=' + encodeURIComponent(id));
  await page.waitForSelector('.ix-facts');
  const facts = await page.locator('.ix-facts').first().textContent();
  assert.match(facts, /Service neededNew installation/);
  assert.match(facts, /Elevator size21 people or a hospital bed \(1,600 kg\)/);
  assert.match(facts, /Car entrancesTwo, front and back/);
  assert.deepEqual(errors, []);
});

test('division pages: Real estate development starts closed and staff can open it', async (t) => {
  const f = await fixture(t);
  const { page, errors } = await open(t, f);
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/development');
  await page.waitForSelector('.division-coming-soon');
  assert.match(await page.locator('h1').textContent(), /coming soon/);
  // Links stay visible but explain instead of opening the page.
  await page.goto(f.env.APP_ORIGIN + '/#/divisions');
  const link = page.locator('main a[href="#/divisions/development"]').first();
  assert.equal(await link.getAttribute('aria-disabled'), 'true');
  await link.click({ force: true });
  assert.match(await page.locator('#toast').textContent(), /coming soon/);
  assert.match(page.url(), /#\/divisions$/);
  // Other division pages are unaffected.
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/elevators');
  await page.waitForSelector('#elevator-start');

  // Staff open the page from Website customizer → Division pages.
  await f.login();
  const snapshot = await f.request('/api/admin/content');
  const body = structuredClone(snapshot.value.content);
  body.settings = { closedDivisions: [] };
  assert.equal((await f.request('/api/admin/content', 'PUT', { content: body, version: snapshot.value.version })).status, 200);
  await page.goto(f.env.APP_ORIGIN + '/');
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/development');
  await page.waitForSelector('#development-start');
  assert.equal(await page.locator('.division-coming-soon').count(), 0);
  assert.deepEqual(errors, []);
});
