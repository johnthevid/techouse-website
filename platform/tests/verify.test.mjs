import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fixture } from './helpers.mjs';
import worker from '../worker.mjs';
import { phMobile } from '../verify.mjs';
const { chromium } = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url)('playwright');

/** Stand-in SMS and email providers: each can be told to fail, and every message is kept. */
function providers(env, failing = []) {
  const sent = [];
  Object.assign(env, {
    SEMAPHORE_API_KEY: 'test-semaphore',
    TWILIO_ACCOUNT_SID: 'ACtest',
    TWILIO_AUTH_TOKEN: 'test-twilio',
    TWILIO_FROM: '+15005550006',
    RESEND_API_KEY: 'test-resend',
    VERIFY_EMAIL_FROM: 'Techouse <verify@example.com>',
    verifyFetch: async (url, init) => {
      const provider = url.includes('semaphore') ? 'semaphore' : url.includes('twilio') ? 'twilio' : 'resend';
      if (failing.includes(provider)) return new Response('down', { status: 503 });
      const text =
        provider === 'resend' ? JSON.parse(init.body).text : new URLSearchParams(init.body).get(provider === 'twilio' ? 'Body' : 'message');
      sent.push({ provider, text, code: text.match(/\d{6}/)[0] });
      return new Response(provider === 'semaphore' ? JSON.stringify([{ status: 'Queued' }]) : '{}', { status: 200 });
    },
  });
  return sent;
}
const inquiry = (extra = {}) => ({
  name: 'Ana Reyes',
  email: 'ana@example.com',
  phone: '0917 123 4567',
  division: 'solar',
  location: 'Lipa City · Batangas',
  requirements: 'Solar for our home in Lipa City.',
  ...extra,
});

test('verification: SMS first, email when SMS fails, and inquiries never lost', async (t) => {
  assert.equal(phMobile('0917 123 4567'), '+639171234567');
  assert.equal(phMobile('+63 917-123-4567'), '+639171234567');
  assert.equal(phMobile('02 8123 4567'), '');

  const f = await fixture(t);
  // No provider: verification is off and the inquiry sends as before.
  assert.deepEqual((await f.request('/api/verify/send', 'POST', { phone: '09171234567' })).value, { skipped: true });

  // SMS works: the code goes by Semaphore.
  let sent = providers(f.env);
  let reply = (await f.request('/api/verify/send', 'POST', { phone: '09171234567', email: 'ana@example.com' })).value;
  assert.deepEqual([reply.channel, reply.to, reply.fallback, reply.other], ['sms', '•••• 4567', false, true]);
  assert.equal(sent.at(-1).provider, 'semaphore');
  assert.match(sent.at(-1).text, /Techouse verification code is \d{6}\. It expires in 10 minutes/);
  // A wrong code counts down; the right one gives a token.
  const wrong = await f.request('/api/verify/check', 'POST', { id: reply.id, code: '000000' === sent.at(-1).code ? '111111' : '000000' });
  assert.equal(wrong.status, 400);
  assert.match(wrong.value.error, /4 tries left/);
  const { token } = (await f.request('/api/verify/check', 'POST', { id: reply.id, code: sent.at(-1).code })).value;
  assert.ok(token);
  const first = await f.request('/api/inquiries', 'POST', inquiry({ verification: token }));
  assert.equal(first.status, 201);
  // The same token cannot verify a second inquiry.
  const second = await f.request('/api/inquiries', 'POST', inquiry({ email: 'ana2@example.com', verification: token }));
  assert.equal(second.status, 201);

  // Semaphore and Twilio down: the code falls back to email.
  sent = providers(f.env, ['semaphore', 'twilio']);
  reply = (await f.request('/api/verify/send', 'POST', { phone: '09181234567', email: 'ben@example.com' })).value;
  assert.deepEqual([reply.channel, reply.to, reply.fallback], ['email', 'b•••@example.com', true]);
  assert.equal(sent.at(-1).provider, 'resend');
  const emailToken = (await f.request('/api/verify/check', 'POST', { id: reply.id, code: sent.at(-1).code })).value.token;
  const third = await f.request('/api/inquiries', 'POST', inquiry({ name: 'Ben', email: 'ben@example.com', phone: '09181234567', verification: emailToken }));
  assert.equal(third.status, 201);

  // Everything down: no code can be sent, and the inquiry still goes through unverified.
  providers(f.env, ['semaphore', 'twilio', 'resend']);
  assert.deepEqual((await f.request('/api/verify/send', 'POST', { phone: '09191234567', email: 'cy@example.com' })).value, { failed: true, reason: 'delivery' });
  const fourth = await f.request('/api/inquiries', 'POST', inquiry({ name: 'Cy', email: 'cy@example.com', phone: '09191234567' }));
  assert.equal(fourth.status, 201);

  await f.login();
  const list = (await f.request('/api/admin/inquiries')).value.inquiries;
  const status = (id) => list.find((q) => q.id === id).verified;
  assert.deepEqual(
    [status(first.value.id), status(second.value.id), status(third.value.id), status(fourth.value.id)],
    ['sms', 'none', 'email', 'none'],
  );
  // Only hashes are stored.
  for (const row of f.db.prepare('SELECT * FROM verifications').all()) {
    const stored = JSON.stringify(row);
    for (const secret of ['+639171234567', '09171234567', 'ana@example.com', 'ben@example.com', ...sent.map((m) => `"${m.code}"`)])
      assert.ok(!stored.includes(secret), `stored ${secret}`);
    assert.match(row.target, /^[a-f0-9]{64}$/);
  }
});

test('verification: the inquiry form asks for the code and sends a verified inquiry', async (t) => {
  const f = await fixture(t);
  const sent = providers(f.env, ['semaphore']); // Twilio carries the SMS
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', async (route) => {
    const req = route.request();
    if (!req.url().startsWith(f.env.APP_ORIGIN)) return route.abort();
    const res = await worker.fetch(
      new Request(req.url(), { method: req.method(), headers: await req.allHeaders(), ...(req.postDataBuffer() ? { body: req.postDataBuffer() } : {}) }),
      f.env,
    );
    await route.fulfill({ status: res.status, headers: Object.fromEntries(res.headers), body: Buffer.from(await res.arrayBuffer()) });
  });
  await page.goto(f.env.APP_ORIGIN + '/#/inquiry?division=construction');
  await page.waitForSelector('#inquiry-form');
  await page.fill('#inquiry-name', 'Ana Reyes');
  await page.fill('#inquiry-email', 'ana@example.com');
  await page.fill('#inquiry-phone', '0917 123 4567');
  await page.fill('#inquiry-location', 'Lipa City · Batangas');
  await page.fill('#inquiry-requirements', 'A two-storey house in Lipa City.');
  await page.locator('#inquiry-form [type="submit"]').click();
  await page.waitForSelector('.verify-dialog[open]');
  assert.match(await page.locator('.verify-dialog').textContent(), /We sent a 6-digit code by SMS to •••• 4567/);
  assert.equal(sent.at(-1).provider, 'twilio');
  // Closing the dialog keeps the form; sending again shows a new code.
  await page.locator('[data-verify-close]').click();
  await page.waitForSelector('.verify-dialog', { state: 'detached' });
  assert.equal(await page.inputValue('#inquiry-name'), 'Ana Reyes');
  await page.locator('#inquiry-form [type="submit"]').click();
  await page.waitForSelector('.verify-dialog[open]');
  await page.fill('#verify-code', '12');
  await page.locator('.verify-submit').click();
  assert.match(await page.locator('.verify-error').textContent(), /Enter the 6 digits/);
  await page.fill('#verify-code', sent.at(-1).code);
  await page.locator('.verify-submit').click();
  await page.getByRole('heading', { name: 'Your inquiry has been sent.' }).waitFor();
  const id = f.db.prepare('SELECT id FROM inquiries').get().id;
  assert.equal(f.db.prepare('SELECT channel FROM verifications WHERE inquiry_id=?').get(id).channel, 'sms');
  assert.deepEqual(errors, []);
});
