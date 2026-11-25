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

test('elevator planner: two steps, a layout per service, answers carried to the inquiry', async (t) => {
  const f = await fixture(t);
  const { page, errors } = await open(t, f);
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/elevators');
  await page.waitForSelector('#elevator-start [data-ev-plan]');
  // Step 1 offers four services; step 2 is locked until one is chosen.
  assert.equal(await page.locator('.ev-service').count(), 4);
  assert.equal(await page.locator('.ev-progress [data-go-step="2"]').isDisabled(), true);
  assert.equal(await page.locator('[data-step-panel="2"]').isVisible(), false);

  // Each service opens in Simple mode: two or three plain questions.
  await page.locator('.ev-service[data-service="install"]').click();
  const visibleRows = () => page.locator('[data-ev-form="install"] .ev-row:visible').count();
  assert.equal(await visibleRows(), 3);
  assert.equal(await page.locator('[data-ev-form="install"] [data-q="floors"] label').innerText(), 'How many floors?');
  // Detailed adds the rest in the same ledger; an answer given in Simple stays.
  await page.locator('[data-ev-form="install"] label[data-value="residential"]').click();
  await page.locator('.ev-mode [data-mode="detailed"]').click();
  assert.equal(await visibleRows(), 9);
  assert.equal(await page.locator('[data-ev-form="install"] input[value="residential"]').isChecked(), true);
  // "What is a machine room?" explains itself on tap.
  const tip = page.locator('[data-ev-form="install"] [data-q="machineRoom"] .ev-tip');
  assert.equal(await tip.locator('.ev-tip-text').isVisible(), false);
  await tip.locator('.ev-tip-button').click();
  assert.equal(await tip.locator('.ev-tip-text').isVisible(), true);
  assert.match(await tip.locator('.ev-tip-text').textContent(), /room, usually on the roof/);
  await page.keyboard.press('Escape');
  await page.mouse.move(0, 0);
  assert.equal(await tip.locator('.ev-tip-text').isVisible(), false);
  await page.locator('[data-step-panel="2"] [data-go-step="1"]').click();

  // Parts: the 7-day promise and text fields.
  await page.locator('.ev-service[data-service="parts"]').click();
  assert.equal(await page.locator('[data-ev-form="parts"]').isVisible(), true);
  assert.match(await page.locator('[data-ev-form="parts"] .ev-promise').textContent(), /as little as 7 days/);
  assert.equal(await page.locator('[data-ev-form="install"]').isVisible(), false);
  // Maintenance: a stopped elevator shows the call-now note.
  await page.locator('[data-step-panel="2"] [data-go-step="1"]').click();
  await page.locator('.ev-service[data-service="maintenance"]').click();
  assert.equal(await page.locator('[data-urgent]').isVisible(), false);
  await page.locator('[data-ev-form="maintenance"] label[data-value="stopped"]').click();
  assert.equal(await page.locator('[data-urgent]').isVisible(), true);
  assert.match(await page.locator('[data-ev-form="maintenance"] [data-q="floors"] label').textContent(), /does it serve/);

  // New installation: the spec sheet, including machine room or machine-room-less.
  await page.locator('[data-step-panel="2"] [data-go-step="1"]').click();
  await page.locator('.ev-service[data-service="install"]').click();
  const form = page.locator('[data-ev-form="install"]');
  await form.locator('[data-q="building"] label[data-value="commercial"]').click();
  await form.locator('[data-q="elevatorType"] label[data-value="bed"]').click();
  await form.locator('#ev-install-floors').fill('5');
  await form.locator('[data-q="floors"] [data-step="1"]').click();
  await form.locator('[data-q="capacity"] label[data-value="1600"]').click();
  await form.locator('[data-q="item"] label[data-value="bed"]').click();
  await form.locator('[data-q="doors"] label[data-value="2-opposite"]').click();
  await form.locator('[data-q="machineRoom"] label[data-value="without"]').click();
  await form.locator('[data-q="shaft"] label[data-value="building"]').click();
  await form.locator('[data-q="timeline"] label[data-value="6m"]').click();
  const summary = await page.locator('.ev-summary').textContent();
  assert.match(summary, /Machine roomMachine-room-less/);
  assert.match(summary, /Floors served6 floors/);
  await page.locator('[data-send]').click();

  // The inquiry shows the answers with a way back; the size field gives way to them.
  await page.waitForSelector('#inquiry-form .inquiry-elevator:not([hidden]) dl');
  assert.match(await page.locator('.inquiry-elevator').textContent(), /Elevator typeHospital bed/);
  assert.equal(await page.locator('#inquiry-capacity').isVisible(), false);
  assert.match(await page.inputValue('#inquiry-requirements'), /new elevator installation for a commercial building with 6 floors/);
  // Solar asks for the roof type instead; other divisions ask neither.
  await page.selectOption('#inquiry-division', 'solar');
  assert.equal(await page.locator('#inquiry-roof').isVisible(), true);
  assert.equal(await page.locator('.inquiry-elevator').isVisible(), false);
  await page.selectOption('#inquiry-division', 'construction');
  assert.equal(await page.locator('#inquiry-roof').isVisible(), false);
  await page.selectOption('#inquiry-division', 'elevators');
  // The untouched starting sentence was cleared when the visitor left Elevators.
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
  assert.deepEqual(JSON.parse(row.data), {
    service: 'install',
    building: 'commercial',
    elevatorType: 'bed',
    capacity: '1600',
    item: 'bed',
    doors: '2-opposite',
    machineRoom: 'without',
    shaft: 'building',
    timeline: '6m',
    floors: 6,
  });

  // Staff see the answers in the inbox.
  await f.login();
  const [name, value] = f.getCookie().split('=');
  await page.context().addCookies([{ name, value, url: f.env.APP_ORIGIN }]);
  const id = f.db.prepare('SELECT inquiry_id FROM inquiry_details').get().inquiry_id;
  await page.goto(f.env.APP_ORIGIN + '/office.html#/office/inquiries?id=' + encodeURIComponent(id));
  await page.waitForSelector('.ix-facts');
  const facts = await page.locator('.ix-facts').first().textContent();
  assert.match(facts, /Service neededNew installation/);
  assert.match(facts, /Machine roomMachine-room-less/);
  assert.match(facts, /Car entrancesTwo, front and back/);
  assert.deepEqual(errors, []);
});

test('elevator page: types and services share one tabbed section, brands close it', async (t) => {
  const f = await fixture(t);
  const { page, errors } = await open(t, f);
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/elevators');
  await page.waitForSelector('#elevator-range');
  assert.match(await page.locator('#elevator-range h2').textContent(), /Every elevator,\s*every service\./);
  const typesTab = page.locator('#ev-tab-types');
  const servicesTab = page.locator('#ev-tab-services');
  assert.equal(await typesTab.getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#ev-panel-services').isVisible(), false);
  for (const [tab, id, count] of [[typesTab, 'types', 7], [servicesTab, 'services', 4]]) {
    await tab.click();
    const show = page.locator(`[data-ev-slides="${id}"]`);
    assert.equal(await show.isVisible(), true);
    assert.equal(await show.locator('[data-slide]').count(), count);
    await show.locator('[data-slide-next]').click();
    assert.equal(await show.locator('[data-slide-number]').textContent(), '2');
    await show.locator(`[data-slide-go="${count - 1}"]`).click();
    await show.locator('[data-slide-next]').click();
    assert.equal(await show.locator('[data-slide-number]').textContent(), '1');
  }
  // Arrow keys move between the tabs.
  await servicesTab.focus();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await typesTab.getAttribute('aria-selected'), 'true');
  // Without uploaded photos, each type shows its drawing.
  assert.equal(await page.locator('[data-ev-slides="types"] .ev-slide-photo').count(), 0);
  // Brands sit at the bottom of the section.
  assert.deepEqual(
    await page.locator('#elevator-range .ev-brand-name').allTextContents(),
    ['Hitachi', 'EPSS', 'Shanghai Mitsubishi'],
  );
  // A service slide opens the planner on that service.
  await servicesTab.click();
  await page.locator('[data-ev-slides="services"] [data-slide-go="3"]').click();
  await page.locator('[data-start-service="parts"]').click();
  assert.equal(await page.locator('[data-ev-form="parts"]').isVisible(), true);
  assert.deepEqual(errors, []);
});

test('elevator photos: staff upload one per type and it replaces the drawing', async (t) => {
  const f = await fixture(t);
  await f.login();
  const png =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const snapshot = await f.request('/api/admin/content');
  const body = structuredClone(snapshot.value.content);
  body.images = { ...body.images, 'elevator-castle': png };
  assert.equal((await f.request('/api/admin/content', 'PUT', { content: body, version: snapshot.value.version })).status, 400);
  body.images = { ...snapshot.value.content.images, 'elevator-bed': png, 'brand-epss': png };
  assert.equal((await f.request('/api/admin/content', 'PUT', { content: body, version: snapshot.value.version })).status, 200);
  const { page, errors, context } = await open(t, f);
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/elevators');
  await page.waitForSelector('[data-ev-slides="types"]');
  const photo = page.locator('[data-ev-slides="types"] [data-slide-art="2"] img.ev-slide-photo');
  assert.equal(await photo.count(), 1);
  assert.equal(await photo.getAttribute('alt'), 'Hospital bed elevator');
  assert.equal(await page.locator('[data-ev-slides="types"] [data-slide-art="0"] svg').count(), 1);
  // An uploaded brand logo replaces the name; the others keep their names.
  assert.equal(await page.locator('#elevator-brands img.ev-brand-logo[alt="EPSS"]').count(), 1);
  assert.deepEqual(await page.locator('#elevator-brands .ev-brand-name').allTextContents(), ['Hitachi', 'Shanghai Mitsubishi']);
  // The back office offers an upload for each elevator type.
  const [name, value] = f.getCookie().split('=');
  await context.addCookies([{ name, value, url: f.env.APP_ORIGIN }]);
  await page.goto(f.env.APP_ORIGIN + '/office.html#/office/customizer');
  await page.locator('[data-customizer-section="elevator-photos"]').click();
  assert.equal(await page.locator('#customizer-elevator-photos [data-banner-upload^="elevator-"]').count(), 7);
  assert.equal(await page.locator('#customizer-elevator-photos [data-banner-upload^="brand-"][data-format="png"]').count(), 3);
  // The picker shows each slot's status and opens one editor at a time.
  assert.match(await page.locator('[data-photo-select="elevator-bed"]').textContent(), /Your photo/);
  assert.match(await page.locator('[data-photo-select="elevator-home"]').textContent(), /Drawing shown/);
  await page.locator('[data-photo-select="brand-hitachi"]').click();
  assert.equal(await page.locator('[data-photo-editor="brand-hitachi"]').isVisible(), true);
  assert.equal(await page.locator('[data-photo-editor="elevator-passenger"]').isVisible(), false);
  assert.match(await page.locator('.preview-panel-heading h3').textContent(), /Elevators page — Hitachi/);
  // The back office has no transition animations.
  assert.equal(await page.locator('.photo-pick').first().evaluate((el) => getComputedStyle(el).transitionDuration), '0s');
  assert.deepEqual(errors, []);
});

test('homepage news ticker: latest published updates between the logo and the actions', async (t) => {
  const f = await fixture(t);
  await f.login();
  const snapshot = await f.request('/api/admin/content');
  const body = structuredClone(snapshot.value.content);
  body.posts = [
    { id: 'hitachi-makati', title: 'Three Hitachi elevators for Makati', summary: 'News.', body: 'News.', division: 'elevators', status: 'published', sample: false, cover: 'architecture.jpg' },
    { id: 'draft-one', title: 'Draft only', summary: 'Draft.', body: 'Draft.', division: 'solar', status: 'draft', sample: false, cover: 'architecture.jpg' },
  ];
  assert.equal((await f.request('/api/admin/content', 'PUT', { content: body, version: snapshot.value.version })).status, 200);
  const { page, errors } = await open(t, f);
  await page.goto(f.env.APP_ORIGIN + '/');
  await page.waitForSelector('.banner-nav.has-news .news-ticker');
  const links = page.locator('.news-ticker-list:not([aria-hidden]) a');
  assert.equal(await links.count(), 1);
  assert.match(await links.first().textContent(), /Three Hitachi elevators for Makati/);
  assert.equal(await links.first().getAttribute('href'), '#/updates/hitachi-makati');
  // 60% white, so it informs without competing with the header actions.
  assert.equal(await links.first().evaluate((a) => getComputedStyle(a).color), 'rgba(255, 255, 255, 0.6)');
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

test('division pages: own call to action in the header and section bar; menu on narrow screens', async (t) => {
  const f = await fixture(t);
  const { page, errors } = await open(t, f);
  for (const [id, label] of [['construction', 'Let’s start building'], ['prefabrication', 'Let’s start forming'], ['elevators', 'Let’s start elevating']]) {
    await page.goto(f.env.APP_ORIGIN + '/#/divisions/' + id);
    await page.waitForSelector('.construction-subnav .division-subnav-cta', { state: 'attached' });
    const header = page.locator('#header .nav-actions a.button');
    assert.match(await header.textContent(), new RegExp(label));
    assert.equal(await header.getAttribute('href'), '#/inquiry?division=' + id);
    const bar = page.locator('.construction-subnav .division-subnav-cta');
    assert.equal(await bar.getAttribute('href'), '#/inquiry?division=' + id);
    // The bar button appears once the header's button has scrolled away.
    assert.equal(await bar.isVisible(), false);
    await page.evaluate(() => scrollTo(0, 2000));
    await page.waitForFunction(() => document.querySelector('.construction-subnav').classList.contains('has-cta'));
  }
  // Narrow screens: a menu button names the section and opens the links as a list.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(f.env.APP_ORIGIN + '/');
  await page.goto(f.env.APP_ORIGIN + '/#/divisions/construction');
  const toggle = page.locator('.division-subnav-toggle');
  await toggle.waitFor();
  assert.equal(await page.locator('.division-subnav-links a').first().isVisible(), false);
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('.division-subnav-links a').first().isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.deepEqual(errors, []);
});
