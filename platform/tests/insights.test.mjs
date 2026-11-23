import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./helpers.mjs";
import { channelOf, cleanPath, referrerHost } from "../insights.mjs";

const browser = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
  "CF-Connecting-IP": "203.0.113.7",
};
const inquiry = {
  division: "solar",
  name: "Ana Reyes",
  email: "ana@example.test",
  phone: "+63 917 000 0000",
  location: "Lipa, Batangas",
  requirements: "Rooftop solar for a two-storey home.",
  solarSector: "residential",
  solarSavings: 4200,
  attribution: { referrer: "https://www.facebook.com/", source: "facebook", medium: "paid", campaign: "november-solar", landing: "/divisions/solar" },
};

test("traffic sources are classified from campaign tags, then the referring site", () => {
  assert.equal(channelOf({ referrer: "" }), "Direct");
  assert.equal(channelOf({ referrer: "google.com" }), "Search");
  assert.equal(channelOf({ referrer: "l.facebook.com" }), "Social");
  assert.equal(channelOf({ referrer: "t.co" }), "Social");
  assert.equal(channelOf({ referrer: "philstar.com" }), "Referral");
  assert.equal(channelOf({ source: "facebook", medium: "cpc" }), "Paid");
  assert.equal(channelOf({ source: "newsletter" }), "Email");
  assert.equal(channelOf({ source: "flyer", medium: "qr" }), "Campaign");
  assert.equal(referrerHost("https://www.google.com.ph/search?q=x", "techouse.test"), "google.com.ph");
  assert.equal(referrerHost("https://techouse.test/#/about", "techouse.test"), "");
  assert.equal(referrerHost("javascript:alert(1)", "techouse.test"), "");
  assert.equal(cleanPath("/Divisions/Solar/?x=1"), "/divisions/solar");
  assert.equal(cleanPath("/<script>"), "/other");
});

test("page views and events are stored without cookies or addresses; bots and the office are ignored", async (t) => {
  const f = await fixture(t);
  const view = (data, headers = browser) => f.request("/api/collect", "POST", data, { headers });
  assert.equal((await view({ type: "view", path: "/", entry: true, referrer: "https://www.google.com/" })).status, 204);
  assert.equal((await view({ type: "view", path: "/divisions/solar" })).status, 204);
  assert.equal((await view({ type: "view", path: "/" }, { ...browser, "User-Agent": "Googlebot/2.1" })).status, 204);
  assert.equal((await view({ type: "view", path: "/office/inquiries" })).status, 204);
  assert.equal((await view({ type: "event", name: "call", path: "/" })).status, 204);
  assert.equal((await view({ type: "event", name: "made-up", path: "/" })).status, 400);
  const rows = f.db.prepare("SELECT * FROM page_views ORDER BY id").all();
  assert.equal(rows.length, 2);
  assert.equal(rows[0].channel, "Search");
  assert.equal(rows[0].referrer, "google.com");
  assert.equal(rows[0].device, "mobile");
  assert.equal(rows[0].visitor, rows[1].visitor);
  assert.doesNotMatch(JSON.stringify(rows), /203\.0\.113\.7|iPhone/);
  assert.equal(f.db.prepare("SELECT COUNT(*) n FROM site_events").get().n, 1);
  // Measurements from another site are refused like every other write.
  const foreign = await f.request("/api/collect", "POST", { type: "view", path: "/" }, { headers: { ...browser, Origin: "https://evil.example" } });
  assert.equal(foreign.status, 403);
});

test("public inquiries are validated, stored with their source, and managed only by signed-in staff", async (t) => {
  const f = await fixture(t);
  const sent = await f.request("/api/inquiries", "POST", inquiry, { headers: browser });
  assert.equal(sent.status, 201);
  assert.match(sent.value.id, /^TH-\d{6}-[0-9A-F]{6}$/);
  const row = f.db.prepare("SELECT * FROM inquiries").get();
  assert.equal(row.channel, "Paid");
  assert.equal(row.campaign, "facebook / paid · november-solar");
  assert.equal(row.landing, "/divisions/solar");
  assert.equal(row.solar_savings, 4200);
  assert.equal((await f.request("/api/inquiries", "POST", { ...inquiry, email: "not-an-email" }, { headers: browser })).status, 400);
  assert.equal((await f.request("/api/inquiries", "POST", { ...inquiry, division: "general" }, { headers: browser })).status, 400);
  assert.equal((await f.request("/api/inquiries", "POST", { ...inquiry, requirements: "short" }, { headers: browser })).status, 400);
  // The hidden field catches simple bots: the reply looks normal and nothing is stored.
  const trap = await f.request("/api/inquiries", "POST", { ...inquiry, email: "bot@example.test", website: "http://spam" }, { headers: browser });
  assert.equal(trap.status, 201);
  assert.equal(f.db.prepare("SELECT COUNT(*) n FROM inquiries").get().n, 1);

  assert.equal((await f.request("/api/admin/inquiries")).status, 401);
  assert.equal((await f.request("/api/admin/analytics")).status, 401);
  await f.login();
  const list = await f.request("/api/admin/inquiries");
  assert.equal(list.value.inquiries.length, 1);
  assert.equal(list.value.inquiries[0].status, "new");
  const id = list.value.inquiries[0].id;
  const updated = await f.request("/api/admin/inquiries/update", "POST", { id, status: "contacted", note: "Called, sending a quote.", seen: true });
  assert.equal(updated.status, 200);
  assert.equal(updated.value.inquiry.status, "contacted");
  assert.ok(updated.value.inquiry.seenAt);
  assert.equal((await f.request("/api/admin/inquiries/update", "POST", { id, status: "maybe" })).status, 400);
  const noCsrf = await f.request("/api/admin/inquiries/delete", "POST", { id }, { headers: { "X-CSRF-Token": "x".repeat(64) } });
  assert.equal(noCsrf.status, 403);
  assert.equal((await f.request("/api/admin/inquiries/delete", "POST", { id })).status, 200);
  assert.equal(f.db.prepare("SELECT COUNT(*) n FROM inquiries").get().n, 0);
});

test("inquiries are rate limited per network address", async (t) => {
  const f = await fixture(t);
  const statuses = [];
  for (let i = 0; i < 8; i++)
    statuses.push((await f.request("/api/inquiries", "POST", { ...inquiry, email: `lead${i}@example.test` }, { headers: browser })).status);
  assert.deepEqual(statuses.slice(0, 6), [201, 201, 201, 201, 201, 201]);
  assert.equal(statuses[7], 429);
});

test("the analytics summary joins traffic, sources and leads for the selected range", async (t) => {
  const f = await fixture(t);
  const other = { ...browser, "CF-Connecting-IP": "198.51.100.4", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140" };
  await f.request("/api/collect", "POST", { type: "view", path: "/", entry: true, source: "facebook", medium: "paid", campaign: "november-solar" }, { headers: browser });
  await f.request("/api/collect", "POST", { type: "view", path: "/divisions/solar" }, { headers: browser });
  await f.request("/api/collect", "POST", { type: "view", path: "/inquiry" }, { headers: browser });
  await f.request("/api/collect", "POST", { type: "event", name: "inquiry_start", path: "/inquiry" }, { headers: browser });
  await f.request("/api/collect", "POST", { type: "event", name: "error", path: "/about", detail: "TypeError: x is undefined" }, { headers: other });
  await f.request("/api/collect", "POST", { type: "view", path: "/about", entry: true, referrer: "https://www.google.com/" }, { headers: other });
  await f.request("/api/inquiries", "POST", inquiry, { headers: browser });
  await f.login();
  const { status, value } = await f.request("/api/admin/analytics?days=7");
  assert.equal(status, 200);
  assert.equal(value.days, 7);
  assert.equal(value.daily.length, 7);
  assert.deepEqual(value.totals, { views: 4, visitors: 2, visits: 2, inquiries: 1, partners: 0 });
  assert.equal(value.daily.at(-1).inquiries, 1);
  assert.deepEqual(value.channels.map((c) => [c.name, c.visitors, c.inquiries]), [["Search", 1, 0], ["Paid", 1, 1]]);
  assert.deepEqual(value.funnel.map((s) => s.visitors), [2, 1, 1, 1, 1]);
  assert.equal(value.campaigns[0].name, "facebook / paid · november-solar");
  assert.equal(value.errors[0].detail, "TypeError: x is undefined");
  assert.equal(value.pages.length, 4);
  assert.equal((await f.request("/api/admin/analytics?days=13")).value.days, 30);
});

test("only the browser that sent an inquiry can attach a site-visit preference", async (t) => {
  const f = await fixture(t);
  const sent = await f.request("/api/inquiries", "POST", inquiry, { headers: browser });
  assert.match(sent.value.token, /^[0-9a-f]{32}$/);
  const start = new Date(Date.now() + 8 * 3600000);
  let date;
  for (let i = 2; !date; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    if (![0, 6].includes(d.getUTCDay())) date = d.toISOString().slice(0, 10);
  }
  const visit = { id: sent.value.id, token: sent.value.token, date, time: "11:00" };
  assert.equal((await f.request("/api/inquiries/visit", "POST", { ...visit, token: "0".repeat(32) }, { headers: browser })).status, 404);
  assert.equal((await f.request("/api/inquiries/visit", "POST", { ...visit, time: "03:00" }, { headers: browser })).status, 400);
  assert.equal((await f.request("/api/inquiries/visit", "POST", visit, { headers: browser })).status, 200);
  assert.notEqual(f.db.prepare("SELECT token FROM inquiries").get().token, sent.value.token);
  await f.login();
  const listed = (await f.request("/api/admin/inquiries")).value.inquiries[0];
  assert.deepEqual([listed.visit.date, listed.visit.time], [date, "11:00"]);
  assert.equal(listed.token, undefined);
});

test("partner applications are stored with a phone, kept out of project inquiry counts", async (t) => {
  const f = await fixture(t);
  const partner = { topic: "partnership", name: "Leo Cruz", phone: "+63 918 000 1111", location: "Batangas", requirements: "Partner application\nRole: Electrician or contractor" };
  assert.equal((await f.request("/api/inquiries", "POST", { ...partner, phone: "" }, { headers: browser })).status, 400);
  assert.equal((await f.request("/api/inquiries", "POST", partner, { headers: browser })).status, 201);
  await f.request("/api/inquiries", "POST", inquiry, { headers: browser });
  await f.login();
  const list = (await f.request("/api/admin/inquiries")).value.inquiries;
  assert.deepEqual(list.map((q) => q.topic).sort(), ["partnership", "project"]);
  const { totals } = (await f.request("/api/admin/analytics?days=7")).value;
  assert.deepEqual([totals.inquiries, totals.partners], [1, 1]);
});
