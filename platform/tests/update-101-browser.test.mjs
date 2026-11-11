import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fixture } from "./helpers.mjs";
import worker from "../worker.mjs";
const require = createRequire(process.env.PLAYWRIGHT_MODULE || import.meta.url);
const { chromium } = require("playwright");

test("1.0.1 inquiry actions, annual estimate and visit lifecycle", async (t) => {
  const f = await fixture(t);
  const content = JSON.parse(
    f.db.prepare("SELECT body FROM content WHERE id=1").get().body,
  );
  content.projects = ["residential", "commercial", "industrial"].flatMap(
    (sector) =>
      [1, 2].map((i) => ({
        id: `${sector}-${i}`,
        title: `${sector} example ${i}`,
        sector,
        status: "published",
        sample: true,
        image: "assets/solar.jpg",
        location: "Demo city",
        capacity: "5 kWp",
        description: "Test example only.",
      })),
  );
  f.db
    .prepare("UPDATE content SET body=? WHERE id=1")
    .run(JSON.stringify(content));
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  t.after(() => browser.close());
  const widths = process.env.TECHOUSE_TEST_WIDTH
    ? [Number(process.env.TECHOUSE_TEST_WIDTH)]
    : [2560, 1440, 768, 390];
  for (const width of widths) {
    const page = await browser.newPage({
      viewport: { width, height: width === 2560 ? 1440 : 900 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
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
    await page.goto(f.env.APP_ORIGIN + "/#/inquiry?division=solar");
    await page.waitForSelector("#inquiry-form");
    assert.equal(
      await page
        .locator('#header a[href*="/inquiry"], #footer a[href*="/inquiry"]')
        .count(),
      0,
    );
    await page.evaluate(() => {
      const q = {
        id: "TEST-VISIT",
        createdAt: new Date().toISOString(),
        solarSavings: 3000,
      };
      window.TechouseVisits.setInquiry(q);
      document.querySelector("#inquiry-form-area").innerHTML =
        `<div class="success">${window.TechouseSolarExtras.confirmationMarkup(q.solarSavings, q.id)}</div>`;
      window.TechouseSolarExtras.afterInquiry("solar", q.solarSavings, q.id);
    });
    assert.match(
      await page.locator("#modal .solar-savings-amount").innerText(),
      /36,000\s*per year/,
    );
    await page.locator("#modal [data-request-visit]").click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `/tmp/techouse-101-calendar-${width}.png` });
    assert.equal(
      await page.locator("#modal [data-request-visit]").isVisible(),
      false,
    );
    assert.ok(
      await page
        .locator("#modal")
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 2),
    );
    await page.locator("#modal [data-cancel-visit]").click();
    await page.waitForSelector("#modal .visit-card", { state: "detached" });
    assert.equal(
      await page.locator("#modal [data-request-visit]").isVisible(),
      true,
    );
    assert.equal(
      await page.locator("#modal [data-visit-recommendation]").count(),
      1,
    );
    await page.locator("#modal [data-request-visit]").click();
    await page.waitForTimeout(550);
    if (!(await page.locator("#modal [data-date]:enabled").count()))
      await page.locator('#modal [data-month="1"]').click();
    await page.locator("#modal [data-date]:enabled").first().click();
    await page.locator("#modal [name=time]").first().check();
    await page.locator("#modal .visit-card [type=submit]").click();
    await page.waitForSelector("#modal .request-ticket");
    assert.equal(await page.locator("#modal .ticket-visit").count(), 1);
    assert.equal(
      await page.locator("#inquiry-form-area [data-request-visit]").count(),
      0,
    );
    assert.equal(
      await page.locator('#modal a[href*="section=projects"]').count(),
      1,
    );
    await page.locator("#modal [data-stay]").click();
    await page.waitForFunction(() => !document.querySelector("#modal").open);
    assert.equal(
      await page.locator("#inquiry-form-area [data-request-visit]").count(),
      0,
    );
    await page.goto(f.env.APP_ORIGIN + "/#/divisions");
    await page.waitForSelector(".directory-card img");
    await page.waitForFunction(
      () =>
        document.querySelector(".directory-card img").dataset.previewState ===
        "ready",
    );
    await page
      .locator(".directory-card img")
      .first()
      .evaluate((img) => img.decode());
    assert.equal(await page.locator(".footer-socials a").count(), 2);
    for (const sector of ["residential", "commercial", "industrial"]) {
      await page.evaluate((sector) => {
        localStorage.setItem(
          "techouse.sample.inquiries.v1",
          JSON.stringify([
            {
              id: "SAVED-" + sector,
              division: "solar",
              solarSector: sector,
              location: "Demo city",
              requirements: "Example saved requirements",
              createdAt: new Date().toISOString(),
            },
          ]),
        );
      }, sector);
      await page.goto(f.env.APP_ORIGIN + "/#/inquiry?division=solar");
      await page.reload();
      await page.waitForSelector("#saved-inquiry-history");
      assert.equal(await page.locator("#inquiry-form").isVisible(), false);
      assert.equal(await page.locator(".contact-grid").isVisible(), false);
      assert.equal(
        await page.locator(".saved-inquiry-cards").isVisible(),
        true,
      );
      assert.match(
        await page.locator(".page-hero h1").innerText(),
        /already have an inquiry/i,
      );
      await page.screenshot({
        path: `/tmp/techouse-inquiry-overview-${width}-${sector}.png`,
        fullPage: true,
      });
      await page.locator(`[data-review-inquiry="SAVED-${sector}"]`).click();
      assert.equal(
        await page.locator("#saved-inquiry-history").isVisible(),
        true,
      );
      assert.equal(
        await page.locator(".inquiry-project-slideshow").isVisible(),
        true,
      );
      assert.equal(
        await page.locator("#inquiry-expanded-details").isVisible(),
        true,
      );
      assert.equal(await page.locator("#inquiry-back").isVisible(), false);
      await page.locator(`[data-review-inquiry="SAVED-${sector}"]`).click();
      assert.equal(await page.locator(".contact-grid").isVisible(), false);
      await page.locator(`[data-review-inquiry="SAVED-${sector}"]`).click();
      assert.equal(await page.locator(".contact-grid").isVisible(), true);
      assert.equal(await page.locator(".page-hero").isVisible(), true);
      assert.equal(
        await page
          .locator(`[data-review-inquiry="SAVED-${sector}"]`)
          .getAttribute("aria-expanded"),
        "true",
      );

      assert.equal(
        await page.locator(".contact-aside #completed-solar-projects").count(),
        1,
      );
      assert.equal(
        await page.locator(".contact-grid + #completed-solar-projects").count(),
        0,
      );
      assert.match(
        await page
          .locator(".inquiry-project-slideshow")
          .getAttribute("aria-label"),
        new RegExp(sector, "i"),
      );
      assert.match(
        await page
          .locator(".inquiry-project-slideshow > a")
          .getAttribute("href"),
        new RegExp("sector=" + sector),
      );
      const count = await page.locator(".inquiry-project-slide").count();
      assert.ok(
        count > 0,
        JSON.stringify(
          await page.evaluate(() =>
            window.TechouseContent.snapshot().projects.map((p) => ({
              sector: p.sector,
              status: p.status,
            })),
          ),
        ),
      );
      if (count > 1) {
        await page.locator('[data-slide="1"]').click();
        assert.equal(
          await page.locator("[data-slide-position]").innerText(),
          "2 / " + count,
        );
      }
      await page.waitForTimeout(550);
      assert.equal(
        await page.locator(".saved-inquiry-cards").isVisible(),
        true,
      );
      assert.equal(
        await page.locator("#saved-inquiry-history > details").count(),
        0,
      );
      const bounds = await page.evaluate(() => {
        const box = (selector) => {
          const r = document.querySelector(selector).getBoundingClientRect();
          return { x: r.x, right: r.right, y: r.y, width: r.width };
        };
        return {
          viewport: document.documentElement.clientWidth,
          pageWidth: document.documentElement.scrollWidth,
          grid: box(".contact-grid"),
          form: box("#inquiry-form-area"),
          aside: box(".contact-aside"),
          carousel: box(".inquiry-project-window"),
          history: box("#saved-inquiry-history"),
        };
      });
      assert.ok(
        bounds.pageWidth <= bounds.viewport + 1,
        `No horizontal page overflow at ${width}: ${JSON.stringify(bounds)}`,
      );
      assert.ok(
        bounds.carousel.right <= bounds.grid.right + 1,
        "Slideshow stays within the grid",
      );
      assert.ok(
        bounds.form.width >= Math.min(300, bounds.grid.width),
        "Inquiry card retains readable width",
      );
      if (width > 900) {
        assert.ok(
          bounds.form.width > bounds.grid.width * 0.6 &&
            bounds.form.width < bounds.grid.width * 0.7,
          "Ticket occupies roughly two-thirds",
        );
        assert.ok(
          Math.abs(bounds.form.y - bounds.aside.y) < 2,
          "Slideshow aligns alongside ticket",
        );
      } else
        assert.ok(bounds.aside.y > bounds.form.y, "Mobile expansion stacks");
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: `/tmp/techouse-101-projects-${width}-${sector}.png`,
        fullPage: true,
      });
      await page.locator("[data-collapse-inquiry]").click();
      await page.locator("#saved-inquiry-history > a").click();
      await page
        .locator('#repeat-inquiry-dialog [data-existing-action="continue"]')
        .click();
      await page.waitForSelector("#inquiry-form");
      await page.locator("#inquiry-division").selectOption("construction");
      await page.locator("#inquiry-name").fill("Demo visitor");
      await page.locator("#inquiry-email").fill("demo@example.com");
      await page.locator("#inquiry-location").fill("Demo city");
      await page
        .locator("#inquiry-requirements")
        .fill("A separate construction project.");
      await page.locator("#inquiry-form [type=submit]").click();
      await page.waitForSelector(".success");
      await page.reload();
      await page.waitForSelector("#saved-inquiry-history");
      assert.equal(await page.locator(".contact-grid").isVisible(), false);
      assert.match(
        await page.locator("#saved-inquiry-history .inquiry-count").innerText(),
        /2/,
      );
      assert.equal(
        await page.locator(".saved-inquiry-cards button").count(),
        2,
      );
      for (const card of await page
        .locator(".saved-inquiry-cards button")
        .all())
        assert.equal(await card.isVisible(), true);
      await page.locator(".saved-inquiry-cards button").first().click();
      assert.match(
        await page.locator(".saved-inquiry-current h2").innerText(),
        /construction/i,
      );
      await page.locator("[data-collapse-inquiry]").click();
      await page.locator(`[data-review-inquiry="SAVED-${sector}"]`).click();
      assert.match(
        await page.locator(".saved-inquiry-current h2").innerText(),
        /solar/i,
      );
      assert.equal(
        await page.locator("[data-review-inquiry][aria-pressed=true]").count(),
        1,
      );
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.locator("[data-collapse-inquiry]").click();
      await page.screenshot({
        path: `/tmp/techouse-inquiry-cards-${width}-${sector}.png`,
        fullPage: true,
      });
      if (sector === "residential") {
        await page.goto(f.env.APP_ORIGIN + "/#/divisions/solar");
        await page.locator('[data-scroll="estimator"]').click();
        await page.waitForSelector("#solar-estimator");
        await page.locator('#solar-estimator input[name="bill"]').fill("6000");
        await page.locator("#solar-estimator .calculate-cost").click();
        const inquiry = page.locator("#solar-estimate-inquiry");
        await inquiry.scrollIntoViewIfNeeded();
        await page.evaluate(() => new Promise(resolve => {
          let previous = scrollY, stable = 0;
          const check = () => { stable = Math.abs(scrollY - previous) < 0.1 ? stable + 1 : 0; previous = scrollY; if (stable >= 8) resolve(); else requestAnimationFrame(check); };
          requestAnimationFrame(check);
        }));
        const before = await page.evaluate(() => ({
          hash: location.hash,
          scroll: scrollY,
          height: document.documentElement.scrollHeight,
          ctaTop: document.querySelector('#solar-estimate-inquiry').getBoundingClientRect().top,
        }));
        await inquiry.click();
        await page.waitForSelector("#repeat-inquiry-dialog[open]");
        assert.match(
          await page.locator("#repeat-inquiry-title").innerText(),
          /2 inquiries/,
        );
        assert.equal(
          await page.evaluate(
            () => getComputedStyle(document.documentElement).overflowY,
          ),
          "hidden",
        );
        await page.waitForTimeout(280);
        await page.screenshot({ path: `/tmp/techouse-repeat-prompt-${width}.png` });
        await page.locator('[data-existing-action="cancel"]').click();
        await page.waitForSelector("#repeat-inquiry-dialog", {
          state: "detached",
        });
        assert.equal(await page.evaluate(() => location.hash), before.hash);
        const after = await page.evaluate(() => ({
          scroll: scrollY,
          height: document.documentElement.scrollHeight,
          ctaTop: document.querySelector('#solar-estimate-inquiry').getBoundingClientRect().top,
        }));
        assert.ok(
          Math.abs(after.scroll - before.scroll) < 2,
          `Cancel scroll changed at ${width}px: before ${JSON.stringify(before)}, after ${JSON.stringify(after)}`,
        );
        await inquiry.click();
        await page.keyboard.press("Escape");
        await page.waitForSelector("#repeat-inquiry-dialog", {
          state: "detached",
        });
        await inquiry.click();
        await page.locator('[data-existing-action="view"]').click();
        await page.waitForSelector("#saved-inquiry-history");
        assert.equal(await page.locator(".contact-grid").isVisible(), false);
        await page.locator("#saved-inquiry-history > a").click();
        await page.locator('[data-existing-action="continue"]').click();
        await page.waitForSelector("#inquiry-form");
        assert.equal(
          await page
            .locator("#inquiry-form")
            .getAttribute("data-solar-savings"),
          "4800",
        );
        assert.equal(
          await page.locator("#inquiry-division").inputValue(),
          "solar",
        );
        assert.equal(await page.locator("#repeat-inquiry-dialog").count(), 0);
      }
    }
    await page.goto(f.env.APP_ORIGIN + "/#/divisions/solar/products/inverters");
    await page.waitForSelector(".catalogue-product img");
    for (const image of await page.locator(".catalogue-product img").all()) {
      await image.evaluate(async (img) => {
        img.loading = "eager";
        await img.decode();
      });
      await image.evaluate(
        (img) => new Promise((resolve) => requestAnimationFrame(resolve)),
      );
      assert.equal(
        await image.evaluate((img) => img.style.backgroundImage),
        "",
      );
    }
    await page.screenshot({
      path: `/tmp/techouse-101-products-white-${width}.png`,
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    await page.close();
  }
});
