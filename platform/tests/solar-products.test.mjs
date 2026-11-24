import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fixture } from "./helpers.mjs";
import worker from "../worker.mjs";
const require = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url);
const { chromium } = require("playwright");

const product = (over = {}) => ({
  id: "p-1",
  category: "panels",
  status: "published",
  title: "Test Panel <b>X</b>",
  subtitle: "Bifacial",
  capacity: "600 W",
  specs: ["Line one", ""],
  image: "assets/skyworth-products/module-g12.png",
  websiteModel: "G12",
  imageSource: "https://example.com/g12",
  pdf: "assets/Solar Documents/Skyworth Materials/Batteries/EN_C&I PV & Battery-202604.pdf",
  ...over,
});

test("solar products are validated, saved and kept as drafts away from visitors", async (t) => {
  const f = await fixture(t);
  await f.login();
  const { value } = await f.request("/api/admin/content");
  const save = (products) =>
    f.request("/api/admin/content", "PUT", {
      content: { ...value.content, products },
      version: (f.version ??= value.version),
    });
  for (const bad of [
    product({ category: "cables" }),
    product({ title: "  " }),
    product({ pdf: "javascript:alert(1)" }),
    product({ pdf: "assets/../worker.mjs" }),
    product({ imageSource: "http://plain.example" }),
    product({ specs: Array(9).fill("x") }),
    product({ image: "https://example.com/x.png" }),
  ])
    assert.equal((await save([bad])).status, 400, JSON.stringify(bad).slice(0, 80));
  const saved = await save([
    product(),
    product({ id: "p-2", status: "draft", title: "Secret draft", pdf: "https://example.com/d.pdf" }),
  ]);
  assert.equal(saved.status, 200);
  assert.deepEqual(saved.value.content.products[0].specs, ["Line one"]);
  // Visitors receive published products only.
  const boot = await (await worker.fetch(new Request(f.env.APP_ORIGIN + "/api/bootstrap.js"), f.env)).text();
  assert.match(boot, /Test Panel/);
  assert.doesNotMatch(boot, /Secret draft/);
  // A record too large for one database row is refused with a clear message.
  const huge = "data:image/jpeg;base64," + "A".repeat(650_000);
  const tooBig = await f.request("/api/admin/content", "PUT", {
    content: {
      ...saved.value.content,
      products: [1, 2, 3].map((i) => product({ id: "big-" + i, image: huge })),
    },
    version: saved.value.version,
  });
  assert.equal(tooBig.status, 413);
});

test("staff edit a product in the back office and visitors see it on the equipment page", async (t) => {
  const f = await fixture(t);
  await f.login();
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  t.after(() => browser.close());
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const [name, value] = f.getCookie().split("=");
  await context.addCookies([{ name, value, url: f.env.APP_ORIGIN }]);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.route("**/*", async (route) => {
    const r = route.request();
    if (!r.url().startsWith(f.env.APP_ORIGIN)) return route.abort();
    const response = await worker.fetch(
      new Request(r.url(), {
        method: r.method(),
        headers: await r.allHeaders(),
        ...(r.postDataBuffer() ? { body: r.postDataBuffer() } : {}),
      }),
      f.env,
    );
    await route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: Buffer.from(await response.arrayBuffer()),
    });
  });
  await page.goto(f.env.APP_ORIGIN + "/office.html#/office/products");
  await page.waitForSelector(".px-row");
  assert.equal(await page.locator(".px-row").count(), 11);
  await page.locator('[data-pick-product="builtin-1"]').click();
  await page.locator('[name="title"]').fill("QM210RTHCD Series <i>Pro</i>");
  await page.locator('[name="capacity"]').fill("625–645 W");
  assert.match(await page.locator(".px-preview-frame h2").innerText(), /<i>Pro<\/i>/);
  // Page preview: the real category page in a frame, with the unsaved name, outlined.
  await page.locator('[data-panel="page"]').click();
  assert.equal(await page.locator('[data-panel="page"]').getAttribute("aria-selected"), "true");
  const preview = page.frameLocator(".px-page-viewport iframe");
  await preview.locator(".catalogue-product.is-previewed h2").waitFor();
  assert.equal(await preview.locator(".catalogue-product.is-previewed h2").innerText(), "QM210RTHCD Series <i>Pro</i>");
  await page.locator('[data-preview-category="inverters"]').click();
  await preview.locator('.catalogue-page[data-category="inverters"]').waitFor();
  await page.locator('[data-panel="edit"]').click();
  await page.locator('[name="pdfMode"][value="link"]').check();
  await page.locator('[name="pdfLink"]').fill("https://example.com/new.pdf");
  await page.locator(".px-actions [type=submit]").click();
  await page.waitForFunction(() => document.querySelector(".ix-save-state")?.textContent.startsWith("Saved"));
  // Reorder: the second inverter moves to the top of its group.
  await page.locator('[data-move-product="builtin-5"][data-direction="-1"]').click();
  await page.waitForFunction(() => document.querySelector(".ix-save-state")?.textContent === "Order saved.");
  // Draft a battery: it disappears from the public page.
  await page.locator('[data-pick-product="builtin-11"]').click();
  await page.locator('[name="status"]').selectOption("draft");
  await page.locator(".px-actions [type=submit]").click();
  await page.waitForFunction(() => document.querySelector(".ix-save-state")?.textContent.includes("as a draft"));
  // New product, from the Add product tab: its draft survives a trip to Edit product.
  await page.locator('.px-panel-tabs [data-panel="add"]').click();
  assert.equal(await page.locator('.px-panel-tabs [data-panel="add"]').getAttribute("aria-selected"), "true");
  await page.locator('[name="title"]').fill("Kept while switching");
  await page.locator('.px-panel-tabs [data-panel="edit"]').click();
  await page.locator('.px-panel-tabs [data-panel="add"]').click();
  assert.equal(await page.locator('[name="title"]').inputValue(), "Kept while switching");
  await page.locator("[data-cancel-product]").click();
  assert.equal(await page.locator('[name="title"]').inputValue(), "");
  await page.locator('[data-new-product="batteries"]').click();
  assert.equal(await page.locator('[name="category"]').inputValue(), "batteries");
  await page.locator('[name="title"]').fill("Test Cabinet 300");
  assert.equal(await page.locator('[name="status"]').inputValue(), "draft", "new products start hidden");
  await page.locator('[name="status"]').selectOption("published");
  await page.locator('[name="pdfMode"][value="none"]').check();
  await page.locator(".px-actions [type=submit]").click();
  await page.waitForFunction(() => document.querySelector(".ix-save-state")?.textContent.startsWith("Added"));
  assert.equal(await page.locator('.px-panel-tabs [data-panel="edit"]').getAttribute("aria-selected"), "true", "a new product opens in Edit product");
  const stored = JSON.parse(f.db.prepare("SELECT body FROM content WHERE id=1").get().body).products;
  assert.equal(stored.length, 12);
  assert.equal(stored[0].pdf, "https://example.com/new.pdf");
  assert.equal(stored[3].id, "builtin-5");

  const publicPage = await (await browser.newContext()).newPage();
  publicPage.on("pageerror", (e) => errors.push(e.message));
  await publicPage.route("**/*", async (route) => {
    const r = route.request();
    if (!r.url().startsWith(f.env.APP_ORIGIN)) return route.abort();
    const response = await worker.fetch(new Request(r.url(), { method: r.method(), headers: await r.allHeaders() }), f.env);
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
  });
  await publicPage.goto(f.env.APP_ORIGIN + "/#/divisions/solar/products/panels");
  await publicPage.waitForSelector(".catalogue-product h2");
  assert.equal(await publicPage.locator(".catalogue-product h2").first().innerText(), "QM210RTHCD Series <i>Pro</i>");
  assert.equal(await publicPage.locator(".catalogue-product h2 i").count(), 0, "names are text, not markup");
  assert.equal(
    await publicPage.locator(".catalogue-product .button").first().getAttribute("href"),
    "https://example.com/new.pdf",
  );
  await publicPage.goto(f.env.APP_ORIGIN + "/#/divisions/solar/products/batteries");
  await publicPage.waitForSelector(".catalogue-product h2");
  const batteries = await publicPage.locator(".catalogue-product h2").allInnerTexts();
  assert.ok(batteries.includes("Test Cabinet 300"), JSON.stringify(batteries));
  assert.ok(!batteries.includes("Commercial & Industrial Storage"), "drafts stay hidden");
  assert.equal(await publicPage.locator('.catalogue-tabs a[href$="batteries"] .catalogue-tab-count').innerText(), "3");
  assert.deepEqual(errors, []);
});
