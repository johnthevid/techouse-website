import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fixture } from "./helpers.mjs";
import worker from "../worker.mjs";

const sendPath = "/api/inquiry/otp/send";
const verifyPath = "/api/inquiry/otp/verify";
const browser = { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/140.0" };
const inquiry = (email) => ({
  division: "construction",
  name: "Test Visitor",
  email,
  location: "Manila",
  requirements: "An example construction project.",
});

// Brevo is mocked: every message is captured and its six-digit code read back.
async function setup(t) {
  const f = await fixture(t);
  Object.assign(f.env, {
    INQUIRY_OTP_ENABLED: "true",
    INQUIRY_OTP_FROM: "notifications@example.test",
    BREVO_API_KEY: "test-only",
  });
  const messages = [];
  let providerStatus = 201;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.brevo.com/v3/smtp/email");
    assert.equal(options.headers["api-key"], "test-only");
    const message = JSON.parse(options.body);
    assert.deepEqual(message.sender, { name: "Techouse", email: "notifications@example.test" });
    messages.push({ code: message.textContent.match(/\b\d{6}\b/)[0], email: message.to[0].email });
    return new Response(null, { status: providerStatus });
  });
  const send = (email, ip = "203.0.113.1") =>
    f.request(sendPath, "POST", { email }, { headers: { "CF-Connecting-IP": ip } });
  const verify = (email, challenge, code) => f.request(verifyPath, "POST", { email, challenge, code });
  const post = (body, ip = "203.0.113.9") =>
    f.request("/api/inquiries", "POST", body, { headers: { ...browser, "CF-Connecting-IP": ip } });
  return { ...f, messages, send, verify, post, setProviderStatus: (s) => (providerStatus = s) };
}

test("inquiry email codes validate, expire, limit attempts and are used once", async (t) => {
  const { request, env, db, messages, send, verify, setProviderStatus } = await setup(t);
  assert.equal(
    (await request(sendPath, "POST", { email: "visitor@example.test" }, { headers: { Origin: "https://unrelated.example.test" } })).status,
    403,
  );
  env.BREVO_API_KEY = "";
  assert.equal((await send("visitor@example.test")).status, 503, "a missing key leaves verification off");
  env.BREVO_API_KEY = "test-only";
  assert.equal((await send("not an email")).status, 400);

  const email = "visitor@example.test";
  const sent = await send(" Visitor@Example.test ");
  assert.equal(sent.status, 201);
  assert.deepEqual(Object.keys(sent.value), ["challenge"]);
  const { challenge } = sent.value;
  const { code } = messages[0];
  assert.equal(messages[0].email, email);
  assert.equal((await send(email)).status, 429, "one send per minute per address");
  assert.equal((await verify("other@example.test", challenge, code)).status, 400);
  const both = await Promise.all([verify(email, challenge, code), verify(email, challenge, code)]);
  assert.deepEqual(both.map(({ status }) => status).sort(), [200, 400]);
  assert.match(both.find(({ status }) => status === 200).value.proof, /^[a-f0-9]{32}$/);

  const expired = await send("expired@example.test");
  db.prepare("UPDATE inquiry_otp SET expires=0 WHERE challenge=?").run(expired.value.challenge);
  assert.equal((await verify("expired@example.test", expired.value.challenge, messages[1].code)).status, 400);

  const limited = await send("limited@example.test");
  const correct = messages[2].code;
  const wrong = correct === "000000" ? "111111" : "000000";
  for (let i = 0; i < 5; i++)
    assert.equal((await verify("limited@example.test", limited.value.challenge, wrong)).status, 400);
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
  const stored = JSON.stringify(db.prepare("SELECT * FROM inquiry_otp").all());
  assert.ok(!stored.includes("example.test") && !stored.includes(code), "only digests are stored");
});

test("project inquiries need a fresh proof for the same address; partner applications do not", async (t) => {
  const { env, db, messages, send, verify, post } = await setup(t);
  const email = "lead@example.test";
  assert.equal((await post(inquiry(email))).status, 403, "no proof");
  assert.equal((await post({ ...inquiry(email), emailProof: "f".repeat(32) })).status, 403, "made-up proof");

  const { challenge } = (await send(email)).value;
  const { proof } = (await verify(email, challenge, messages[0].code)).value;
  assert.equal((await post({ ...inquiry("someone-else@example.test"), emailProof: proof })).status, 403);
  assert.equal((await post({ ...inquiry(email), requirements: "short", emailProof: proof })).status, 400);
  const sent = await post({ ...inquiry(" Lead@Example.test "), emailProof: proof });
  assert.equal(sent.status, 201, "a failed attempt does not use up the proof");
  assert.equal((await post({ ...inquiry(email), emailProof: proof }, "203.0.113.10")).status, 403, "used once");

  const late = "late@example.test";
  const lateChallenge = (await send(late, "203.0.113.2")).value.challenge;
  const lateProof = (await verify(late, lateChallenge, messages[1].code)).value.proof;
  db.prepare("UPDATE inquiry_otp SET proof_expires=1").run();
  assert.equal((await post({ ...inquiry(late), emailProof: lateProof }, "203.0.113.11")).status, 403, "expired");

  const partner = { topic: "partnership", name: "Partner", phone: "+63 917 000 0000", location: "Cebu", requirements: "I know many homeowners." };
  assert.equal((await post(partner, "203.0.113.12")).status, 201);

  env.INQUIRY_OTP_ENABLED = "false";
  assert.equal((await post(inquiry("off@example.test"), "203.0.113.13")).status, 201, "flag off: no code needed");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM inquiries").get().count, 3);
});

test("the hosted inquiry form verifies the email before sending", async (t) => {
  const { env, db, messages } = await setup(t);
  const require = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url);
  const { chromium } = require("playwright");
  const browserInstance = await chromium.launch({ channel: "chrome", headless: true });
  t.after(() => browserInstance.close());

  for (const width of [1440, 390]) {
    const page = await browserInstance.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", async (route) => {
      const request = route.request();
      if (!request.url().startsWith(env.APP_ORIGIN)) return route.abort();
      const response = await worker.fetch(
        new Request(request.url(), {
          method: request.method(),
          headers: { ...(await request.allHeaders()), "cf-connecting-ip": `198.51.100.${width % 250}` },
          ...(request.postDataBuffer() ? { body: request.postDataBuffer() } : {}),
        }),
        env,
      );
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
    assert.equal(await page.locator(".field:has(#inquiry-email) #inquiry-send-code").count(), 1);
    const submit = page.getByRole("button", { name: "Send inquiry" });
    await submit.click();
    assert.match(await page.locator("#inquiry-code-status").innerText(), /Send a code to your email/);

    await page.getByRole("button", { name: "Send email code" }).click();
    await page.getByLabel("Email verification code").waitFor();
    const code = messages.at(-1).code;
    await page.getByLabel("Email verification code").fill(code === "000000" ? "111111" : "000000");
    await submit.click();
    await page.getByText("The code is incorrect or has expired.", { exact: false }).waitFor();
    await page.getByLabel("Email verification code").fill(code);
    await submit.click();
    await page.getByRole("heading", { name: "Your inquiry has been sent." }).waitFor();
    assert.equal(
      await page.evaluate((otp) => Object.values(localStorage).some((v) => v.includes(otp)), code),
      false,
      "the code is not kept in the browser",
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM inquiries").get().count, 2);
});

test("the public bootstrap reports email verification off by default", async (t) => {
  const f = await fixture(t);
  const bootstrap = await f.request("/api/bootstrap.js");
  assert.match(bootstrap.value, /window\.TechouseInquiryOtp=false;/);
});
