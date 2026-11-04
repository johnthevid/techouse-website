import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fixture } from "./helpers.mjs";
import worker from "../worker.mjs";
const require = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url);
const { chromium } = require("playwright");

test("1.0.1 component integration: calendar, storage and restored visits", async (t) => {
  const f = await fixture(t);
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  t.after(() => browser.close());
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (!request.url().startsWith(f.env.APP_ORIGIN)) return route.abort();
    const response = await worker.fetch(
      new Request(request.url(), {
        method: request.method(),
        headers: await request.allHeaders(),
      }),
      f.env,
    );
    await route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: Buffer.from(await response.arrayBuffer()),
    });
  });
  await page.goto(f.env.APP_ORIGIN + "/#/inquiry");
  const q = {
    id: "AUDIT-INQUIRY",
    division: "solar",
    solarSector: "residential",
    location: "Demo city",
    solarSavings: 4800,
    requirements: "Demo roof assessment request.",
    createdAt: "2026-11-04T01:00:00Z",
  };
  async function load(visits = []) {
    await page.evaluate(
      ({ q, visits }) => {
        localStorage.setItem(
          "techouse.sample.inquiries.v1",
          JSON.stringify([q]),
        );
        localStorage.setItem(
          "techouse-demo-site-visits-v1",
          JSON.stringify(visits),
        );
      },
      { q, visits },
    );
    await page.reload();
    await page.waitForSelector("[data-review-inquiry]");
    await page.locator("[data-review-inquiry]").click();
  }
  async function openCalendar() {
    await page.locator("#inquiry-form-area [data-request-visit]").click();
    await page.waitForSelector(".visit-card");
    if (!(await page.locator("[data-date]:enabled").count()))
      await page.locator('[data-month="1"]').click();
  }
  await t.test(
    "a malformed sibling does not hide a valid saved visit",
    async () => {
      await load([
        null,
        {
          id: "AUDIT-VISIT",
          inquiryId: q.id,
          status: "requested",
          date: "2026-11-09",
          time: "11:00",
          timezone: "Asia/Manila",
        },
      ]);
      assert.equal(
        await page.locator("#inquiry-form-area [data-request-visit]").count(),
        0,
      );
      assert.match(
        await page.locator("#inquiry-form-area .ticket-visit").innerText(),
        /November 9, 2026/,
      );
    },
  );
  await t.test(
    "choosing a date retains keyboard focus on that date",
    async () => {
      await load();
      await openCalendar();
      const date = await page
        .locator("[data-date]:enabled")
        .first()
        .getAttribute("data-date");
      await page.locator(`[data-date="${date}"]`).focus();
      await page.keyboard.press("Space");
      assert.equal(
        await page.evaluate(() => document.activeElement.dataset.date),
        date,
      );
      assert.equal(
        await page
          .locator(`[data-date="${date}"]`)
          .getAttribute("aria-pressed"),
        "true",
      );
    },
  );
  await t.test(
    "other-tab storage notifications do not discard an open visit form",
    async () => {
      await load();
      await openCalendar();
      await page.locator("[data-date]:enabled").first().click();
      const selected = await page.locator("[data-selected]").innerText();
      await page.evaluate(() =>
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "unrelated-preference",
            newValue: "changed",
          }),
        ),
      );
      assert.equal(await page.locator(".visit-card").count(), 1);
      assert.equal(await page.locator("[data-selected]").innerText(), selected);
    },
  );
  await t.test(
    "an inline saved visit preserves ticket layout and persistence",
    async () => {
      await load();
      await openCalendar();
      await page.locator("[data-date]:enabled").first().click();
      await page.locator(".visit-card [name=time]").first().check();
      await page.locator(".visit-card [type=submit]").click();
      await page.waitForSelector(".saved-inquiry-current .ticket-visit");
      assert.equal(
        await page.locator(".inquiry-expanded-row").isVisible(),
        true,
      );
      assert.equal(await page.locator(".visit-card").count(), 0);
      assert.equal(
        await page.locator("#inquiry-form-area [data-request-visit]").count(),
        0,
      );
      assert.equal(
        await page.locator(".saved-inquiry-current .request-ticket").count(),
        0,
      );
      assert.equal(
        await page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("techouse-demo-site-visits-v1"))
              .length,
        ),
        1,
      );
      await page.reload();
      await page.locator("[data-review-inquiry]").click();
      assert.equal(
        await page.locator("#inquiry-form-area [data-request-visit]").count(),
        0,
      );
    },
  );
  await t.test(
    "a storage failure keeps the request editable and reports no booking",
    async () => {
      await load();
      await openCalendar();
      await page.locator("[data-date]:enabled").first().click();
      await page.locator(".visit-card [name=time]").first().check();
      await page.evaluate(() => {
        const original = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
          if (key === "techouse-demo-site-visits-v1")
            throw new DOMException("Test storage limit", "QuotaExceededError");
          return original.call(this, key, value);
        };
      });
      await page.locator(".visit-card [type=submit]").click();
      await page.waitForFunction(
        () =>
          document.querySelector(".visit-card [data-error]").textContent
            .length > 0,
      );
      assert.match(
        await page.locator("[data-error]").innerText(),
        /Nothing has been booked/,
      );
      assert.equal(
        await page.locator(".visit-card [type=submit]").isEnabled(),
        true,
      );
      assert.equal(await page.locator(".visit-card").count(), 1);
    },
  );
  assert.deepEqual(errors, []);
});
