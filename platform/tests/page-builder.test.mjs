import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fixture, content } from "./helpers.mjs";
import worker, { validateContent } from "../worker.mjs";
const require = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url);
const { chromium } = require("playwright");
test("Construction builder validates sections and keeps drafts private", async (t) => {
  const f = await fixture(t);
  await f.login();
  const section = {
    id: "one",
    type: "hero",
    hidden: false,
    tone: "green",
    layout: "right",
    title: "Public title",
    body: "Body",
    image: "assets/construction.jpg",
    alt: "Site",
    label: "Talk",
    link: "#/inquiry?division=construction",
  };
  const value = content();
  value.pages = {
    construction: {
      draft: [{ ...section, title: "Private draft" }],
      published: [section],
    },
  };
  assert.throws(() =>
    validateContent({
      ...value,
      pages: {
        construction: { draft: [{ ...section, link: "javascript:alert(1)" }] },
      },
    }),
  );
  assert.throws(() =>
    validateContent({
      ...value,
      pages: { construction: { draft: [section, section] } },
    }),
  );
  assert.doesNotThrow(() =>
    validateContent({ ...value, pages: { construction: { draft: [] } } }),
  );
  assert.throws(() =>
    validateContent({ ...value, pages: { construction: { published: [] } } }),
  );
  assert.throws(() =>
    validateContent({
      ...value,
      pages: {
        construction: { draft: [{ ...section, type: "spacer", space: 99999 }] },
      },
    }),
  );
  const current = await f.request("/api/admin/content");
  assert.equal(
    (
      await f.request("/api/admin/content", "PUT", {
        content: value,
        version: current.value.version,
      })
    ).status,
    200,
  );
  const boot = await f.request("/api/bootstrap.js");
  assert(!boot.value.includes("Private draft"));
  assert(boot.value.includes("Public title"));
});
test("Construction builder edits, reorders, saves drafts and publishes through protected office", async (t) => {
  const f = await fixture(t);
  const seeded = JSON.parse(
    f.db.prepare("SELECT body FROM content WHERE id=1").get().body,
  );
  const sample = content().projects[0];
  seeded.projects = ["residential", "commercial", "industrial"].map(
    (sector, i) => ({
      ...sample,
      id: `builder-project-${i}`,
      title: `${sector} library example`,
      sector,
    }),
  );
  seeded.projects.push({
    ...sample,
    id: "private-project",
    title: "PRIVATE PROJECT NOT VISIBLE",
    status: "draft",
  });
  f.db
    .prepare("UPDATE content SET body=? WHERE id=1")
    .run(JSON.stringify(seeded));
  await f.login();
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  t.after(() => browser.close());
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const [name, value] = f.getCookie().split("=");
  await context.addCookies([{ name, value, url: f.env.APP_ORIGIN }]);
  await context.route("**/*", async (route) => {
    const req = route.request();
    if (!req.url().startsWith(f.env.APP_ORIGIN)) return route.abort();
    const response = await worker.fetch(
      new Request(req.url(), {
        method: req.method(),
        headers: await req.allHeaders(),
        ...(req.postDataBuffer() ? { body: req.postDataBuffer() } : {}),
      }),
      f.env,
    );
    await route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: Buffer.from(await response.arrayBuffer()),
    });
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(f.env.APP_ORIGIN + "/office.html#/office/page-builder");
  await page
    .locator("#builder-fields [data-field=title]")
    .fill("Build with Techouse");
  await page
    .frameLocator("#builder-preview iframe")
    .locator(".division-cover h1")
    .getByText("Build with Techouse", { exact: true })
    .waitFor();
  await page.locator("[data-builder=save]").click();
  await page.getByText("Draft saved · public page unchanged").waitFor();
  assert(
    !(await f.request("/api/bootstrap.js")).value.includes(
      "Build with Techouse",
    ),
  );
  const live = page.frameLocator("#builder-preview iframe");
  await live.locator(".division-cover").waitFor();
  assert.equal(await live.locator("#header .brand-logo").count(), 1);
  assert.equal(await live.locator("#footer .footer-top").count(), 1);
  assert.equal(
    await live.locator(".division-cover h1").textContent(),
    "Build with Techouse",
  );
  await page.reload();
  assert.equal(
    await page.locator("#builder-fields [data-field=title]").inputValue(),
    "Build with Techouse",
  );
  await page
    .locator('[data-module="cta"]')
    .dragTo(
      page
        .frameLocator("#builder-preview iframe")
        .locator(".builder-drop-last"),
    );
  assert.equal(
    await page
      .frameLocator("#builder-preview iframe")
      .locator(".builder-canvas-section")
      .count(),
    3,
  );
  await page.locator(".builder-outline summary").click();
  await page
    .locator(".builder-item")
    .last()
    .locator('[data-move="-1"]')
    .click();
  await page.locator(".builder-outline summary").click();
  await page
    .frameLocator("#builder-preview iframe")
    .locator(".builder-canvas-section")
    .first()
    .click();
  assert.equal(
    await page.locator("#builder-fields [data-field=title]").inputValue(),
    "Build with Techouse",
  );
  assert.equal(await live.locator(".builder-section-tools").count(), 0);
  assert.equal(
    await page.locator("#builder-selection-tools [data-drag-section]").count(),
    1,
  );
  await page.locator('#builder-selection-tools [data-move="1"]').click();
  await page.locator('#builder-selection-tools [data-move="-1"]').click();
  await page.setViewportSize({ width: 1274, height: 796 });
  const canvasBounds = await page
    .locator(".builder-canvas-scroll")
    .boundingBox();
  const toolbarBounds = await page.locator(".builder-toolbar").boundingBox();
  assert(
    canvasBounds.height >= 520,
    "Compact editor leaves room for the canvas",
  );
  assert(toolbarBounds.height <= 70, "Top controls stay compact");
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  assert.equal(
    await page.locator('.builder-toolbar [data-builder="desktop"]').count(),
    1,
  );
  await page.screenshot({
    path: "/tmp/techouse-builder-laptop.png",
    fullPage: true,
  });
  await page.locator('[data-builder="fullscreen"]').click();
  assert(await page.locator("#builder-fullscreen").evaluate((el) => el.open));
  await page
    .frameLocator("#builder-fullscreen iframe")
    .locator(".builder-cta")
    .waitFor();
  assert.equal(
    await page
      .frameLocator("#builder-fullscreen iframe")
      .locator(".division-cover, .basic-division, .builder-section")
      .count(),
    3,
  );
  await page.keyboard.press("Escape");
  assert(
    !(await page.locator("#builder-fullscreen").evaluate((el) => el.open)),
  );
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.screenshot({
    path: "/tmp/techouse-builder-wide.png",
    fullPage: true,
  });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator("[data-builder=mobile]").click();
  assert(
    await page
      .locator("#builder-preview")
      .evaluate((el) => el.classList.contains("mobile")),
  );
  await page.screenshot({
    path: "/tmp/techouse-builder-desktop.png",
    fullPage: true,
  });
  page.on("dialog", (d) => d.accept());
  await page.locator("[data-builder=publish]").click();
  await page.getByText("Published · Construction page updated").waitFor();
  await page.goto(f.env.APP_ORIGIN + "/#/divisions/construction");
  await page.getByRole("heading", { name: "Build with Techouse" }).waitFor();
  await page.screenshot({
    path: "/tmp/techouse-builder-public.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.goto(f.env.APP_ORIGIN + "/office.html#/office/page-builder");
  await page.locator("#builder-fields").waitFor();
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: "/tmp/techouse-builder-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1274, height: 796 });
  await live.locator(".division-cover").click({ button: "right" });
  await page.locator('#builder-context [data-builder="remove"]').click();
  assert.equal(await live.locator(".division-cover").count(), 0);
  await page.locator('[data-builder="save"]').click();
  await page.getByText("Draft saved · public page unchanged").waitFor();
  await page.reload();
  await live.locator(".basic-division").waitFor();
  assert.equal(await live.locator(".division-cover").count(), 0);
  await live.locator(".basic-division").hover();
  assert(
    (await page.locator("#builder-hover-label").textContent()).includes(
      "Text and image",
    ),
  );
  await live.locator(".basic-division").click({ button: "right" });
  await page.locator('#builder-context [data-module="spacer"]').click();
  await page.locator('[data-field="space"]').selectOption("96");
  assert.equal(
    await live.locator(".builder-spacer").evaluate((el) => el.offsetHeight),
    96,
  );
  await page.locator('[data-module="projects"]').first().click();
  assert((await live.locator(".builder-project-card").count()) > 0);
  await page.locator('[data-module="project-tabs"]').first().click();
  const tabs = live.locator(".builder-project-tabs");
  await tabs.getByRole("tab", { name: "Commercial", exact: true }).click();
  assert.equal(
    await tabs
      .getByRole("tab", { name: "Commercial", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.locator('[data-builder="publish"]').click();
  await page.getByText("Published · Construction page updated").waitFor();
  await page.goto(f.env.APP_ORIGIN + "/#/divisions/construction");
  await page.locator(".builder-project-tabs").waitFor();
  assert.equal(await page.locator(".division-cover").count(), 0);
  await page
    .locator(".builder-project-tabs")
    .getByRole("tab", { name: "Industrial", exact: true })
    .click();
  assert.equal(
    await page
      .locator(".builder-project-tabs")
      .getByRole("tab", { name: "Industrial", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.goto(f.env.APP_ORIGIN + "/office.html#/office/page-builder");
  await live.locator(".builder-canvas-section").first().waitFor();
  await page.screenshot({
    path: "/tmp/techouse-builder-modules.png",
    fullPage: true,
  });
  const total = await live.locator(".builder-canvas-section").count();
  for (let i = 0; i < total; i++)
    await page
      .locator('#builder-selection-tools [data-builder="remove"]')
      .click();
  assert.equal(await live.locator(".builder-canvas-section").count(), 0);
  await page.locator('[data-builder="save"]').click();
  await page.getByText("Draft saved · public page unchanged").waitFor();
  await page.reload();
  await page.locator('[data-module="hero"]').first().click();
  await live.locator(".division-cover").waitFor();
  await page.locator('[data-builder="more"]').click();
  await page.keyboard.press("Escape");
  assert(await page.locator("#builder-context").isHidden());
  assert.deepEqual(errors, []);
});
