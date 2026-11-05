import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fixture } from "./helpers.mjs";
import worker from "../worker.mjs";
const require = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url);
const { chromium } = require("playwright");
test("Call options stays compact with square QR, working choices and responsive bounds", async (t) => {
  const f = await fixture(t),
    browser = await chromium.launch({ channel: "chrome", headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", async (route) => {
    const req = route.request();
    if (!req.url().startsWith(f.env.APP_ORIGIN)) return route.abort();
    const res = await worker.fetch(
      new Request(req.url(), { headers: await req.allHeaders() }),
      f.env,
    );
    await route.fulfill({
      status: res.status,
      headers: Object.fromEntries(res.headers),
      body: Buffer.from(await res.arrayBuffer()),
    });
  });
  await page.goto(f.env.APP_ORIGIN + "/#/about");
  await page.locator("#header .header-call").click();
  const dialog = page.locator("#contact-options-dialog");
  await dialog.waitFor();
  for (const [width, height] of [
    [2560, 1440],
    [1440, 900],
    [1274, 796],
    [900, 600],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    const box = await dialog.boundingBox(),
      qr = await dialog.locator(".contact-options-qr").boundingBox();
    assert(box.width <= 820 && box.width <= width - 20);
    assert(box.height <= height - 20);
    assert(box.x >= 0 && box.y >= 0);
    assert(Math.abs(qr.width - qr.height) < 1);
    assert(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth));
    if (width >= 1274)
      assert(box.height < 650, "Card should not stretch to fill a tall screen");
    if (width === 1274)
      await page.screenshot({ path: "/tmp/techouse-contact-card.png" });
  }
  await dialog.locator("[data-contact-kind=viber]").click();
  assert(
    (
      await dialog.locator("[data-contact-app]").getAttribute("href")
    ).startsWith("viber:"),
  );
  await dialog.locator("[data-contact-kind=phone]").click();
  assert(
    (
      await dialog.locator("[data-contact-app]").getAttribute("href")
    ).startsWith("tel:"),
  );
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });
  assert.equal(await dialog.count(), 0);
  assert(
    !(await page
      .locator("html")
      .evaluate((el) => el.classList.contains("contact-dialog-open"))),
  );
  assert.deepEqual(errors, []);
});
