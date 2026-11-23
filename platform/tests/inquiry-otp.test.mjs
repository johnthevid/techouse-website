import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fixture } from "./helpers.mjs";
import worker from "../worker.mjs";

const sendPath = "/api/inquiry/otp/send";
const verifyPath = "/api/inquiry/otp/verify";

async function setup(t) {
  const fixtureData = await fixture(t);
  const { env } = fixtureData;
  Object.assign(env, {
    INQUIRY_OTP_ENABLED: "true",
    INQUIRY_OTP_FROM: "Techouse <notifications@example.test>",
    SES_REGION: "ap-southeast-1",
    SES_ACCESS_KEY_ID: "test-id",
    SES_SECRET_ACCESS_KEY: "test-secret",
  });
  const messages = [];
  let providerStatus = 201;
  t.mock.method(globalThis, "fetch", async (request) => {
    assert.equal(request.url, "https://email.ap-southeast-1.amazonaws.com/v2/email/outbound-emails");
    assert.match(request.headers.get("authorization"), /ap-southeast-1\/ses\/aws4_request/);
    const message = await request.json();
    const code = message.Content.Simple.Body.Text.Data.match(/\b\d{6}\b/)[0];
    messages.push({ code, email: message.Destination.ToAddresses[0] });
    return new Response(null, { status: providerStatus });
  });
  return { ...fixtureData, messages, setProviderStatus: (status) => { providerStatus = status; } };
}

test("inquiry OTP validates, expires, limits attempts and is consumed once", async (t) => {
  const { request, env, db, messages, setProviderStatus } = await setup(t);
  const send = (email) => request(sendPath, "POST", { email });
  const verify = (email, challenge, code) => request(verifyPath, "POST", { email, challenge, code });
  assert.equal((await request(sendPath, "POST", { email: "visitor@example.test" }, {
    headers: { Origin: "https://unrelated.example.test" },
  })).status, 403);
  env.INQUIRY_OTP_ENABLED = "false";
  assert.equal((await send("visitor@example.test")).status, 503);
  env.INQUIRY_OTP_ENABLED = "true";
  assert.equal((await send("not an email")).status, 400);

  const email = "visitor@example.test";
  const sent = await send(" Visitor@example.test ");
  assert.equal(sent.status, 201);
  assert.deepEqual(Object.keys(sent.value), ["challenge"]);
  const { challenge } = sent.value;
  const { code } = messages[0];
  assert.equal(messages[0].email, email);
  assert.equal((await send(email)).status, 429);
  assert.equal((await verify("other@example.test", challenge, code)).status, 400);
  const consumed = await Promise.all([verify(email, challenge, code), verify(email, challenge, code)]);
  assert.deepEqual(consumed.map(({ status }) => status).sort(), [200, 400]);

  const expired = await send("expired@example.test");
  db.prepare("UPDATE inquiry_otp SET expires=0 WHERE challenge=?").run(expired.value.challenge);
  assert.equal((await verify("expired@example.test", expired.value.challenge, messages[1].code)).status, 400);

  const limited = await send("limited@example.test");
  const correct = messages[2].code;
  const incorrect = correct === "000000" ? "111111" : "000000";
  for (let i = 0; i < 5; i++)
    assert.equal((await verify("limited@example.test", limited.value.challenge, incorrect)).status, 400);
  assert.equal((await verify("limited@example.test", limited.value.challenge, correct)).status, 400);

  const first = await send("resend@example.test");
  db.prepare("UPDATE limits SET expires=0").run();
  const second = await send("resend@example.test");
  assert.equal(second.status, 201);
  assert.equal((await verify("resend@example.test", first.value.challenge, messages[3].code)).status, 400);
  assert.equal((await verify("resend@example.test", second.value.challenge, messages[4].code)).status, 200);

  setProviderStatus(500);
  assert.equal((await send("failed@example.test")).status, 502);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM inquiry_otp").get().count, 4);
});

test("the inquiry form verifies the email before saving the browser-local demo", async (t) => {
  const { env, messages } = await setup(t);
  const require = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url);
  const { chromium } = require("playwright");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  t.after(() => browser.close());

  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    await page.route("**/*", async (route) => {
      const request = route.request();
      if (!request.url().startsWith(env.APP_ORIGIN)) return route.abort();
      const response = await worker.fetch(new Request(request.url(), {
        method: request.method(),
        headers: await request.allHeaders(),
        body: request.postData() || undefined,
      }), env);
      await route.fulfill({
        status: response.status,
        headers: Object.fromEntries(response.headers),
        body: Buffer.from(await response.arrayBuffer()),
      });
    });
    await page.goto(env.APP_ORIGIN + "/#/inquiry?division=construction");
    await page.locator("#inquiry-name").fill("Test Visitor");
    await page.locator("#inquiry-location").fill("Manila");
    await page.locator("#inquiry-requirements").fill("An example construction project.");
    await page.locator("#inquiry-email").fill(`visitor-${width}@example.test`);
    const submit = page.getByRole("button", { name: "Save demo inquiry" });
    assert.equal(await page.locator("#inquiry-email + .inquiry-email-check #inquiry-send-code").count(), 1);
    await submit.click();
    assert.match(await page.locator("#inquiry-code-status").innerText(), /Request an email code/);
    await page.getByRole("button", { name: "Send email code" }).click();
    await page.getByLabel("Email verification code").waitFor();
    const code = messages.at(-1).code;
    await page.getByLabel("Email verification code").fill(code === "000000" ? "111111" : "000000");
    await submit.click();
    await page.getByText("The code is incorrect or unavailable.", { exact: false }).waitFor();
    await page.getByLabel("Email verification code").fill(code);
    await submit.click();
    await page.getByRole("heading", { name: "Your demo inquiry is saved." }).waitFor();
    assert.equal(await page.evaluate((otp) => Object.values(localStorage).some((value) =>
      value.includes('"code":"' + otp + '"')
    ), code), false);
    await page.close();
  }
});
