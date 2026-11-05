import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fixture } from "./helpers.mjs";
import worker from "../worker.mjs";
const require = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url);
const { chromium } = require("playwright");
test("Staff helper stays private, guides real controls and never performs record actions", async (t) => {
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
  await page.locator(".staff-helper-launcher").click();
  await page.locator('[data-guide="builder"]').click();
  await page.waitForURL("**#/office/page-builder");
  await page.locator(".staff-helper-highlight").waitFor();
  assert(
    (await page.locator("#staff-helper-panel h2").textContent()).includes(
      "Choose your module",
    ),
  );
  await page.locator('.builder-palette [data-module="cta"]').click();
  await page
    .getByRole("heading", { name: "Edit the section", exact: true })
    .waitFor();
  await page.screenshot({ path: "/tmp/techouse-staff-helper-tour.png" });
  await page.locator('[data-helper="end"]').click();
  page.once("dialog", (d) => d.dismiss());
  await page.locator('[data-guide="projects"]').click();
  assert(page.url().includes("page-builder"));
  await page.locator('[data-builder="undo"]').click();
  await page.locator('[data-guide="delete"]').click();
  await page.waitForURL("**#/office/inquiries");
  for (let i = 0; i < 3; i++)
    await page.locator('[data-helper="next"]').click();
  assert.equal(await page.locator("#modal[open]").count(), 0);
  assert.equal(writes, 0);
  await page.locator("#staff-helper-input").fill("How do I add a project?");
  await page.locator("#staff-helper-question button").click();
  await page.waitForURL("**#/office/projects");
  for (let i = 0; i < 4; i++)
    await page.locator('[data-helper="next"]').click();
  assert.equal(writes, 0);
  await page.setViewportSize({ width: 390, height: 844 });
  const box = await page.locator("#staff-helper-panel").boundingBox();
  assert(box.x >= 0 && box.x + box.width <= 390);
  await page.screenshot({ path: "/tmp/techouse-staff-helper-mobile.png" });
  await page.keyboard.press("Escape");
  assert(await page.locator("#staff-helper-panel").isHidden());
  await page.goto(f.env.APP_ORIGIN + "/#/about");
  assert.equal(await page.locator("#staff-helper").count(), 0);
  assert.deepEqual(errors, []);
});
