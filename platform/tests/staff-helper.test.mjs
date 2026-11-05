import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fixture } from "./helpers.mjs";
import worker from "../worker.mjs";
const require = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url);
const { chromium } = require("playwright");
test("Tip runs independently on 1.0.1 without builder code or automatic record actions", async (t) => {
  const f = await fixture(t);
  await f.login();
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  t.after(() => browser.close());
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const [name, value] = f.getCookie().split("=");
  await ctx.addCookies([{ name, value, url: f.env.APP_ORIGIN }]);
  let writes = 0;
  await ctx.route("**/*", async (route) => {
    const r = route.request();
    if (!r.url().startsWith(f.env.APP_ORIGIN)) return route.abort();
    if (!["GET", "HEAD"].includes(r.method())) writes++;
    const res = await worker.fetch(
      new Request(r.url(), {
        method: r.method(),
        headers: await r.allHeaders(),
        ...(r.postDataBuffer() ? { body: r.postDataBuffer() } : {}),
      }),
      f.env,
    );
    await route.fulfill({
      status: res.status,
      headers: Object.fromEntries(res.headers),
      body: Buffer.from(await res.arrayBuffer()),
    });
  });
  const page = await ctx.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(f.env.APP_ORIGIN + "/#/about");
  assert.equal(await page.locator("#staff-helper").count(), 0);
  await page.goto(f.env.APP_ORIGIN + "/office.html#/office");
  assert.equal(
    await page.evaluate(() => typeof window.TechousePageBuilder),
    "undefined",
  );
  await page.getByRole("button", { name: "Open Tip staff helper" }).click();
  assert.equal(await page.locator('[data-guide="builder"]').count(), 0);
  await page.locator("#staff-helper-input").fill("How do I add a project?");
  await page.locator("#staff-helper-question button").click();
  await page.waitForURL("**#/office/projects");
  await page.locator(".staff-helper-highlight").waitFor();
  for (let i = 0; i < 4; i++)
    await page.locator('[data-helper="next"]').click();
  await page.locator('[data-guide="delete"]').click();
  await page.waitForURL("**#/office/inquiries");
  for (let i = 0; i < 3; i++)
    await page.locator('[data-helper="next"]').click();
  assert.equal(await page.locator("#modal[open]").count(), 0);
  assert.equal(writes, 0);
  await page.locator('[data-guide="text"]').click();
  await page.waitForURL("**#/office/customizer");
  for (let i = 0; i < 2; i++)
    await page.locator('[data-helper="next"]').click();
  await page.setViewportSize({ width: 390, height: 844 });
  const box = await page.locator("#staff-helper-panel").boundingBox();
  assert(box.x >= 0 && box.x + box.width <= 390);
  await page.keyboard.press("Escape");
  assert(await page.locator("#staff-helper-panel").isHidden());
  assert.equal(writes, 0);
  assert.deepEqual(errors, []);
});
