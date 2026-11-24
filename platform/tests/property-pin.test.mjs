import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fixture } from './helpers.mjs';
import worker from '../worker.mjs';
import { parseSite, roofArea } from '../insights.mjs';
const { chromium } = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url)('playwright');

const KEY = 'AIza' + 'T'.repeat(35);
// About a 12 m × 9 m roof in Nasugbu, Batangas.
const ROOF = [
  [14.07206, 120.63292],
  [14.07206, 120.63303],
  [14.07198, 120.63303],
  [14.07198, 120.63292],
];
const inquiry = (extra = {}) => ({
  name: 'Juan dela Cruz',
  email: 'juan@example.com',
  division: 'solar',
  location: 'Nasugbu · Batangas',
  requirements: 'Rooftop solar for our home in Nasugbu.',
  ...extra,
});

test('property pin: the server validates the pin and computes the roof area itself', async (t) => {
  const fail = (status, message) => {
    throw Object.assign(new Error(message), { status });
  };
  assert.equal(parseSite(undefined, fail), null);
  const site = parseSite({ lat: 14.072, lng: 120.633, source: 'map', roof: ROOF, roofArea: 1 }, fail);
  assert.ok(site.roofArea > 90 && site.roofArea < 130, `roof area ${site.roofArea}`);
  assert.equal(site.roofArea, Math.round(roofArea(ROOF)));
  assert.equal(site.source, 'map');
  for (const bad of [
    { lat: 1.29, lng: 103.85 }, // Singapore
    { lat: '14.07', lng: 120.63 },
    { lat: 14.07, lng: 120.63, roof: [[14.07, 120.63]] },
    { lat: 14.07, lng: 120.63, roof: [[14.07, 120.63], [14.2, 120.63], [14.07, 120.7]] },
    { lat: 14.07, lng: 120.63, accuracy: -1 },
  ])
    assert.throws(() => parseSite(bad, fail), (e) => e.status === 400);

  const f = await fixture(t);
  const sent = await f.request('/api/inquiries', 'POST', inquiry({
    site: { lat: 14.072011, lng: 120.632981, accuracy: 12, source: 'gps', roof: ROOF, roofArea: 5 },
  }));
  assert.equal(sent.status, 201);
  // A pin on a non-solar inquiry is ignored, and one outside the Philippines is refused.
  assert.equal((await f.request('/api/inquiries', 'POST', inquiry({ email: 'b@example.com', division: 'construction', site: { lat: 14.07, lng: 120.63 } }))).status, 201);
  assert.equal((await f.request('/api/inquiries', 'POST', inquiry({ email: 'c@example.com', site: { lat: 1.29, lng: 103.85 } }))).status, 400);
  await f.login();
  const list = (await f.request('/api/admin/inquiries')).value.inquiries;
  const pinned = list.find((q) => q.id === sent.value.id);
  assert.deepEqual(
    { lat: pinned.site.lat, lng: pinned.site.lng, accuracy: pinned.site.accuracy, source: pinned.site.source, corners: pinned.site.roof.length },
    { lat: 14.072011, lng: 120.632981, accuracy: 12, source: 'gps', corners: 4 },
  );
  assert.ok(pinned.site.roofArea > 90, 'server area, not the 5 m² the browser claimed');
  assert.equal(list.find((q) => q.division === 'construction').site, null);
  assert.equal((await f.request('/api/admin/inquiries/delete', 'POST', { id: sent.value.id })).status, 200);
  assert.equal(f.db.prepare('SELECT COUNT(*) n FROM inquiry_sites').get().n, 0);
  // The Google Maps key is a validated setting.
  const snapshot = await f.request('/api/admin/content');
  const body = structuredClone(snapshot.value.content);
  body.settings = { googleMapsKey: 'not-a-key' };
  assert.equal((await f.request('/api/admin/content', 'PUT', { content: body, version: snapshot.value.version })).status, 400);
  body.settings = { googleMapsKey: KEY };
  assert.equal((await f.request('/api/admin/content', 'PUT', { content: body, version: snapshot.value.version })).status, 200);
});

// A stand-in for the Google Maps script: enough of Map, Polygon, MVCArray, LatLng, event and
// Places for the pin and outline flow, so the browser test runs without a key or network.
const fakeMaps = `(() => {
  const listeners = new WeakMap();
  const on = (target, name, fn) => {
    const all = listeners.get(target) || {};
    (all[name] ||= []).push(fn);
    listeners.set(target, all);
    return { remove() {} };
  };
  const fire = (target, name, arg) => (listeners.get(target)?.[name] || []).forEach((fn) => fn(arg));
  class LatLng {
    constructor(a, b) { if (typeof a === 'object') ({ lat: a, lng: b } = a); this._a = a; this._b = b; }
    lat() { return this._a; } lng() { return this._b; }
  }
  class MVCArray {
    constructor(items = []) { this.items = [...items]; }
    getArray() { return this.items; } getLength() { return this.items.length; }
    push(v) { this.items.push(v); fire(this, 'insert_at', this.items.length - 1); }
    pop() { const v = this.items.pop(); fire(this, 'remove_at', this.items.length); return v; }
    clear() { while (this.items.length) this.pop(); }
  }
  class Map {
    constructor(el, options) {
      this.el = el; this.center = new LatLng(options.center.lat, options.center.lng); this.zoom = options.zoom;
      el.dataset.fakeMap = options.mapTypeId;
      window.__fakeMap = this;
      setTimeout(() => fire(this, 'idle'));
    }
    addListener(name, fn) { return on(this, name, fn); }
    getCenter() { return this.center; }
    setCenter(c) { this.center = c instanceof LatLng ? c : new LatLng(c.lat, c.lng); fire(this, 'center_changed'); fire(this, 'idle'); }
    getZoom() { return this.zoom; } setZoom(z) { this.zoom = z; }
    fitBounds() {}
    click(lat, lng) { fire(this, 'click', { latLng: new LatLng(lat, lng) }); }
  }
  class Polygon { constructor(o) { window.__fakePolygon = o; } }
  window.google = { maps: { Map, Polygon, MVCArray, LatLng,
    event: { addListener: on },
    places: { PlaceAutocompleteElement: class extends HTMLElement {} },
  } };
  customElements.define('gmp-place-autocomplete', window.google.maps.places.PlaceAutocompleteElement);
  const callback = new URL(document.currentScript.src).searchParams.get('callback');
  window[callback]();
})();`;

test('property pin: pin on the map, outline the roof and send it with a solar inquiry', async (t) => {
  const f = await fixture(t);
  await f.login();
  const snapshot = await f.request('/api/admin/content');
  const body = structuredClone(snapshot.value.content);
  body.settings = { googleMapsKey: KEY };
  assert.equal((await f.request('/api/admin/content', 'PUT', { content: body, version: snapshot.value.version })).status, 200);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  t.after(() => browser.close());
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
    geolocation: { latitude: 14.07201, longitude: 120.63298, accuracy: 12 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const staticMaps = [];
  await page.route('**/*', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.host === 'maps.googleapis.com' && url.pathname === '/maps/api/js')
      return route.fulfill({ contentType: 'text/javascript', body: fakeMaps });
    if (url.host === 'maps.googleapis.com' && url.pathname === '/maps/api/staticmap') {
      staticMaps.push(url);
      return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="640" height="320" fill="#6f7d4c"/></svg>' });
    }
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
  await page.goto(f.env.APP_ORIGIN + '/#/inquiry?division=solar');
  await page.waitForSelector('.property-pin .pin-card');
  // Only solar inquiries offer the pin.
  await page.selectOption('#inquiry-division', 'construction');
  assert.equal(await page.locator('.property-pin').isVisible(), false);
  await page.selectOption('#inquiry-division', 'solar');
  assert.equal(await page.locator('.property-pin').isVisible(), true);
  await page.fill('#inquiry-location', 'Nasugbu · Batangas');

  // GPS at the property.
  await page.locator('[data-pin-gps]').click();
  await page.waitForSelector('.pin-status');
  assert.match(await page.locator('.pin-status').first().textContent(), /14\.0720, 120\.6330 · ±12 m/);

  // Move the pin on the map; the pin stays centred while the map moves.
  await page.locator('.pin-status [data-pin-map]').click();
  await page.waitForSelector('.pin-sheet[open] [data-fake-map="hybrid"]');
  await page.evaluate(() => window.__fakeMap.setCenter({ lat: 14.07202, lng: 120.63297 }));
  assert.match(await page.locator('[data-pin-coords]').textContent(), /14\.07202° N, 120\.63297° E/);
  await page.locator('[data-pin-confirm]').click();
  await page.waitForSelector('.pin-sheet', { state: 'detached' });
  assert.match(await page.locator('.pin-status').first().textContent(), /14\.0720, 120\.6330Move pin$/);

  // Outline the roof: Done waits for three corners; Undo removes the last one.
  await page.locator('[data-pin-outline]').click();
  await page.waitForSelector('.pin-sheet[open] [data-fake-map="satellite"]');
  assert.equal(await page.locator('[data-pin-done]').isDisabled(), true);
  for (const [lat, lng] of [...ROOF, [14.0721, 120.6331]]) await page.evaluate(([a, b]) => window.__fakeMap.click(a, b), [lat, lng]);
  await page.locator('[data-pin-undo]').click();
  assert.match(await page.locator('[data-pin-chip]').textContent(), /4 corners · ≈ \d+ m² · room for about \d+ panels/);
  await page.locator('[data-pin-done]').click();
  assert.match(await page.locator('.property-pin').textContent(), /Roof outlined≈ \d+ m²/);
  const preview = new URL(await page.locator('.pin-preview img').getAttribute('src'));
  assert.equal(preview.searchParams.get('maptype'), 'satellite');
  assert.match(preview.searchParams.get('path'), /14\.07206,120\.63292\|.*\|14\.07206,120\.63292$/);

  // Send the inquiry: the pin and outline reach the inbox.
  await page.fill('#inquiry-name', 'Juan dela Cruz');
  await page.fill('#inquiry-email', 'juan@example.com');
  await page.fill('#inquiry-requirements', 'Rooftop solar for our home in Nasugbu.');
  const answer = page.waitForResponse((r) => r.url().endsWith('/api/inquiries'));
  await page.locator('#inquiry-form [type="submit"]').click();
  const reply = await answer;
  assert.equal(reply.status(), 201, await reply.text());
  await page.waitForSelector('.solar-confirmation-title');
  const row = f.db.prepare('SELECT * FROM inquiry_sites').get();
  assert.equal(row.source, 'map');
  assert.equal(JSON.parse(row.roof).length, 4);
  assert.ok(row.roof_area > 90 && row.roof_area < 130, `stored ${row.roof_area}`);

  // The back office shows the property to the sales team (the fixture's signed-in session).
  const [name, value] = f.getCookie().split('=');
  await context.addCookies([{ name, value, url: f.env.APP_ORIGIN }]);
  const id = f.db.prepare('SELECT inquiry_id FROM inquiry_sites').get().inquiry_id;
  await page.goto(f.env.APP_ORIGIN + '/office.html#/office/inquiries?id=' + encodeURIComponent(id));
  await page.waitForSelector('.ix-site');
  const sales = await page.locator('.ix-site').textContent();
  assert.match(sales, /14\.07202\d*, 120\.63297\d* placed by the customer on the map/);
  assert.match(sales, /4 corners · ≈ \d+ m² · about \d+ panels at 620 W/);
  assert.match(await page.locator('.ix-site a.button').getAttribute('href'), /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=14\.07202/);
  assert.equal(await page.locator('.ix-site img').count(), 1);
  assert.deepEqual(errors, []);
});
