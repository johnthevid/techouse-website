/** Visitor analytics and stored inquiries.
 * Privacy: no cookies, no IP addresses. A visitor is a salted hash of the day, network address
 * and browser, so the same person counts once a day and cannot be followed across days.
 */
const DAY = 86400000;
const MANILA = 8 * 3600000;
export const divisions = ["solar", "construction", "prefabrication", "development", "elevators"];
export const inquiryStatuses = ["new", "contacted", "qualified", "won", "closed", "spam"];
const eventNames = ["inquiry_start", "call", "email", "viber", "social", "estimate", "datasheet", "error"];
const bots =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|pingdom|uptime|monitor|curl|wget|python|node-fetch|axios/i;
const searchHosts = /(^|\.)(google|bing|yahoo|duckduckgo|ecosia|yandex|baidu|brave|startpage)\./;
const socialHosts =
  /(^|\.)(facebook|fb|instagram|tiktok|linkedin|lnkd|t|x|twitter|youtube|messenger|threads|pinterest|reddit|viber)\.(com|co|me|net)$/;

export const dayKey = (time) => new Date(time + MANILA).toISOString().slice(0, 10);

function clean(value, limit) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}
function token(value) {
  return clean(value, 60)
    .toLowerCase()
    .replace(/[^a-z0-9 _.\-]/g, "");
}
export function cleanPath(value) {
  const path = clean(value, 160).toLowerCase().split("?")[0].replace(/\/+$/, "") || "/";
  return /^\/[a-z0-9\-/_]{0,140}$/.test(path) ? path : "/other";
}
export function referrerHost(value, ownHost) {
  try {
    const url = new URL(clean(value, 500));
    if (!/^https?:$/.test(url.protocol)) return "";
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    return host === ownHost ? "" : host.slice(0, 100);
  } catch {
    return "";
  }
}
/** Where a visit came from: a tagged campaign first, then the referring site. */
export function channelOf({ referrer = "", source = "", medium = "" }) {
  if (/^(cpc|ppc|paid|paidsocial|paid-social|ads?|display|boost(ed)?)$/.test(medium)) return "Paid";
  if (medium === "email" || source === "newsletter") return "Email";
  if (/social/.test(medium) || /^(facebook|fb|instagram|ig|tiktok|linkedin|messenger|viber)$/.test(source))
    return "Social";
  if (source || medium) return "Campaign";
  if (!referrer) return "Direct";
  if (searchHosts.test(referrer)) return "Search";
  if (socialHosts.test(referrer)) return "Social";
  return "Referral";
}
function attribution(input, ownHost) {
  const value = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const referrer = referrerHost(value.referrer, ownHost);
  const source = token(value.source),
    medium = token(value.medium),
    campaign = token(value.campaign);
  return {
    referrer,
    channel: channelOf({ referrer, source, medium }),
    campaign: [source, medium].filter(Boolean).join(" / ") + (campaign ? ` · ${campaign}` : ""),
    landing: value.landing === undefined ? "" : cleanPath(value.landing),
  };
}
function device(agent) {
  if (/iPad|Tablet|Nexus (7|9|10)|SM-T|Kindle|Silk/i.test(agent)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(agent)) return "mobile";
  return "desktop";
}
async function visitorOf(request, env, hash, time) {
  const address = request.headers.get("cf-connecting-ip") || "local";
  const agent = request.headers.get("user-agent") || "";
  return (await hash(`visitor|${env.AUTH_KEY}|${dayKey(time)}|${address}|${agent}`)).slice(0, 20);
}
const emailPattern = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,180}\.[a-z]{2,24}$/i;

// PROPERTY PIN: an optional solar inquiry pin and roof outline. Coordinates must fall in the
// Philippines, corners within 2 km of the pin; the roof area is computed here, never trusted.
const PH = { south: 4, north: 21.5, west: 116, east: 127.5 };
const inPH = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && lat >= PH.south && lat <= PH.north && lng >= PH.west && lng <= PH.east;
/** Area in square metres of a small lat/lng polygon (local flat projection; ample for a roof). */
export function roofArea(points) {
  const lat0 = (points.reduce((sum, [lat]) => sum + lat, 0) / points.length) * (Math.PI / 180);
  const xy = points.map(([lat, lng]) => [lng * 111320 * Math.cos(lat0), lat * 110540]);
  let twice = 0;
  for (let i = 0; i < xy.length; i++) {
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[(i + 1) % xy.length];
    twice += x1 * y2 - x2 * y1;
  }
  return Math.abs(twice) / 2;
}
export function parseSite(input, fail) {
  if (input === undefined || input === null) return null;
  const bad = () => fail(400, "We could not read the property pin. Remove it and try again.");
  if (typeof input !== "object" || Array.isArray(input)) bad();
  const lat = Number(input.lat), lng = Number(input.lng);
  if (typeof input.lat !== "number" || typeof input.lng !== "number" || !inPH(lat, lng))
    fail(400, "The property pin must be in the Philippines.");
  const source = input.source === "gps" ? "gps" : "map";
  let accuracy = null;
  if (input.accuracy !== undefined && input.accuracy !== null) {
    if (typeof input.accuracy !== "number" || !(input.accuracy >= 0 && input.accuracy <= 10000)) bad();
    accuracy = Math.round(input.accuracy);
  }
  let roof = [];
  if (input.roof !== undefined && input.roof !== null) {
    if (!Array.isArray(input.roof) || input.roof.length < 3 || input.roof.length > 24) bad();
    roof = input.roof.map((corner) => {
      if (!Array.isArray(corner) || corner.length !== 2 || !corner.every((n) => typeof n === "number")) bad();
      const [a, b] = corner;
      if (!inPH(a, b) || Math.abs(a - lat) > 0.02 || Math.abs(b - lng) > 0.02) bad();
      return [Math.round(a * 1e6) / 1e6, Math.round(b * 1e6) / 1e6];
    });
  }
  const area = roof.length ? Math.round(roofArea(roof)) : null;
  if (area !== null && (area < 4 || area > 200000)) bad();
  return {
    lat: Math.round(lat * 1e6) / 1e6,
    lng: Math.round(lng * 1e6) / 1e6,
    accuracy,
    source,
    roof,
    roofArea: area,
  };
}
// Optional answers some divisions ask for (inquiry form and the Elevators page planner).
// Each value must come from a fixed list; anything else is dropped. Labels live in
// site/inquiry-details.js, which also lists the details each elevator service asks for.
const elevatorDetails = {
  building: ["residential", "commercial", "industrial"],
  elevatorType: ["passenger", "home", "bed", "cargo", "panoramic", "unsure"],
  capacity: ["450", "630", "800", "1000", "1600", "2000", "unsure"],
  item: ["none", "wheelchair", "stretcher", "bed", "furniture", "goods", "pallet", "vehicle", "other"],
  doors: ["1", "2-opposite", "2-adjacent", "unsure"],
  machineRoom: ["with", "without", "unsure"],
  shaft: ["plans", "building", "ready", "none"],
  timeline: ["3m", "6m", "12m", "planning"],
  condition: ["running", "issues", "stopped"],
  age: ["under10", "10to20", "over20", "unsure"],
  contract: ["none", "other", "techouse"],
  scope: ["upgrade", "replace", "advise"],
  brand: ["hitachi", "mitsubishi", "epss", "other", "unknown"],
  stopped: ["yes", "no"],
  client: ["yes", "no"],
};
export const detailChoices = {
  solar: { roofType: ["concrete", "metal", "tile", "asphalt", "other", "unsure"] },
  elevators: {
    // repair and replacement came from the first planner; kept so older requests stay valid.
    service: ["install", "maintenance", "modernisation", "parts", "repair", "replacement"],
    ...elevatorDetails,
  },
};
const detailNumbers = { floors: [2, 120], units: [1, 50], quantity: [1, 999] };
const detailTexts = { part: 200, partNumber: 80, model: 80 };
const issueChoices = ["breakdowns", "parts", "ride", "doors", "look", "safety"];
export function parseDetails(division, input, fail) {
  const choices = detailChoices[division];
  if (!choices || !input || typeof input !== "object" || Array.isArray(input)) return null;
  const details = {};
  for (const [key, allowed] of Object.entries(choices))
    if (allowed.includes(input[key])) details[key] = input[key];
  if (division === "elevators") {
    for (const [key, [min, max]] of Object.entries(detailNumbers))
      if (Number.isInteger(input[key]) && input[key] >= min && input[key] <= max) details[key] = input[key];
    for (const [key, max] of Object.entries(detailTexts)) {
      const value = clean(input[key], max + 1);
      if (value.length > max) fail(400, "Shorten your elevator answers and try again.");
      if (value) details[key] = value;
    }
    if (Array.isArray(input.issues)) {
      const issues = [...new Set(input.issues.filter((v) => issueChoices.includes(v)))];
      if (issues.length) details.issues = issues;
    }
  }
  return Object.keys(details).length ? details : null;
}
const detailsOf = (row) => {
  try {
    return row?.data ? JSON.parse(row.data) : null;
  } catch {
    return null;
  }
};

const siteRecord = (row) =>
  row
    ? {
        lat: row.lat,
        lng: row.lng,
        accuracy: row.accuracy,
        source: row.source,
        roof: row.roof ? JSON.parse(row.roof) : [],
        roofArea: row.roof_area,
      }
    : null;

function inquiryRecord(row) {
  return {
    id: row.id,
    createdAt: new Date(row.created).toISOString(),
    updatedAt: new Date(row.updated).toISOString(),
    seenAt: row.seen ? new Date(row.seen).toISOString() : null,
    status: row.status,
    topic: row.topic || "project",
    division: row.division,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    location: row.location,
    capacity: row.capacity,
    requirements: row.requirements,
    solarSector: row.solar_sector,
    solarSavings: row.solar_savings,
    channel: row.channel,
    referrer: row.referrer,
    campaign: row.campaign,
    landing: row.landing,
    note: row.note,
    visit: row.visit ? JSON.parse(row.visit) : null,
  };
}

/** Returns a Response for analytics/inquiry routes, or null when the path is not one of them. */
export async function insightsRoute(request, env, path, tools) {
  const { query, rate, body, fail, json, hash, session, csrf, audit } = tools;
  const method = request.method;
  const ownHost = new URL(env.APP_ORIGIN).hostname.replace(/^www\./, "");
  const address = request.headers.get("cf-connecting-ip") || "local";

  if (path === "/api/collect" && method === "POST") {
    const agent = request.headers.get("user-agent") || "";
    const input = await body(request);
    if (!agent || bots.test(agent)) return new Response(null, { status: 204 });
    await rate(env, "collect:" + address, 300);
    const now = Date.now();
    const visitor = await visitorOf(request, env, hash, now);
    const route = cleanPath(input.path);
    if (route.startsWith("/office")) return new Response(null, { status: 204 });
    if (input.type === "view") {
      const source = attribution(input, ownHost);
      await query(
        env,
        "INSERT INTO page_views(time,day,path,visitor,entry,channel,referrer,campaign,device,country) VALUES(?,?,?,?,?,?,?,?,?,?)",
        now,
        dayKey(now),
        route,
        visitor,
        input.entry === true ? 1 : 0,
        source.channel,
        source.referrer,
        source.campaign,
        device(agent),
        clean(request.cf?.country || request.headers.get("cf-ipcountry") || "", 2).toUpperCase(),
      ).run();
    } else if (input.type === "event" && eventNames.includes(input.name)) {
      await query(
        env,
        "INSERT INTO site_events(time,day,name,path,visitor,detail) VALUES(?,?,?,?,?,?)",
        now,
        dayKey(now),
        input.name,
        route,
        visitor,
        clean(input.detail, 160),
      ).run();
    } else fail(400, "Unknown measurement.");
    return new Response(null, { status: 204 });
  }

  if (path === "/api/inquiries" && method === "POST") {
    await rate(env, "inquiry-ip:" + address, 6, 3600);
    const input = await body(request);
    const field = (name, max, required = false, min = 1) => {
      const value = clean(input[name], max + 1);
      if (value.length > max) fail(400, "Please shorten your answers and try again.");
      if (required && value.length < min) fail(400, "Please complete the required fields.");
      return value;
    };
    // Partner applications (Be a partner page) share the inbox; they need a phone, email is optional.
    const topic = input.topic === "partnership" ? "partnership" : "project";
    const record = {
      division: topic === "partnership" ? "solar" : field("division", 40, true),
      name: field("name", 100, true),
      email: field("email", 200, topic === "project"),
      phone: field("phone", 35),
      company: field("company", 150),
      location: field("location", 200, true),
      capacity: field("capacity", 150),
      requirements: field("requirements", 5000, true, 10),
    };
    if (!divisions.includes(record.division)) fail(400, "Choose a division.");
    const site = record.division === "solar" && topic === "project" ? parseSite(input.site, fail) : null;
    const details = topic === "project" ? parseDetails(record.division, input.details, fail) : null;
    if ((record.email || topic === "project") && !emailPattern.test(record.email))
      fail(400, "Enter a valid email address.");
    if (topic === "partnership" && !record.phone) fail(400, "Add a mobile number so the team can call you.");
    if (record.phone && !/^[+\d][\d\s()\-.]{5,34}$/.test(record.phone))
      fail(400, "Enter a valid mobile number, or leave it blank.");
    await rate(env, "inquiry-contact:" + (record.email || record.phone).toLowerCase(), 4, 3600);
    const sector = ["residential", "commercial", "industrial"].includes(input.solarSector)
      ? input.solarSector
      : "";
    const savings =
      typeof input.solarSavings === "number" &&
      Number.isFinite(input.solarSavings) &&
      input.solarSavings > 0 &&
      input.solarSavings < 100_000_000
        ? Math.round(input.solarSavings)
        : null;
    const now = Date.now();
    const id = `TH-${dayKey(now).slice(2).replaceAll("-", "")}-${(await hash(crypto.randomUUID()))
      .slice(0, 6)
      .toUpperCase()}`;
    // A filled hidden field means an automated submission: answer normally, store nothing.
    if (clean(input.website, 200))
      return json({ id, token: crypto.randomUUID().replaceAll("-", ""), createdAt: new Date(now).toISOString() }, 201);
    const source = attribution(input.attribution, ownHost);
    // The visitor's browser keeps this token so it alone can add a site-visit preference later.
    const token = crypto.randomUUID().replaceAll("-", "");
    await query(
      env,
      "INSERT INTO inquiries(id,created,updated,status,topic,division,name,email,phone,company,location,capacity,requirements,solar_sector,solar_savings,channel,referrer,campaign,landing,visitor,token) VALUES(?,?,?,'new',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      id,
      now,
      now,
      topic,
      record.division,
      record.name,
      record.email,
      record.phone,
      record.company,
      record.location,
      record.capacity,
      record.requirements,
      record.division === "solar" ? sector : "",
      record.division === "solar" ? savings : null,
      source.channel,
      source.referrer,
      source.campaign,
      source.landing,
      await visitorOf(request, env, hash, now),
      await hash(token),
    ).run();
    if (site)
      await query(
        env,
        "INSERT INTO inquiry_sites(inquiry_id,lat,lng,accuracy,source,roof,roof_area) VALUES(?,?,?,?,?,?,?)",
        id,
        site.lat,
        site.lng,
        site.accuracy,
        site.source,
        site.roof.length ? JSON.stringify(site.roof) : "",
        site.roofArea,
      ).run();
    if (details)
      await query(env, "INSERT INTO inquiry_details(inquiry_id,data) VALUES(?,?)", id, JSON.stringify(details)).run();
    return json({ id, token, createdAt: new Date(now).toISOString() }, 201);
  }

  if (path === "/api/inquiries/visit" && method === "POST") {
    await rate(env, "visit-ip:" + address, 20, 3600);
    const input = await body(request);
    const date = clean(input.date, 10),
      time = clean(input.time, 5);
    const start = Date.parse(dayKey(Date.now()) + "T00:00:00Z");
    const when = Date.parse(date + "T00:00:00Z");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !(when > start && when <= start + 120 * DAY) ||
      [0, 6].includes(new Date(when).getUTCDay()) ||
      !["09:00", "11:00", "14:00", "16:00"].includes(time)
    )
      fail(400, "Choose a future weekday and a preferred time.");
    const row = await query(env, "SELECT id, token FROM inquiries WHERE id=?", clean(input.id, 40)).first();
    if (!row || !row.token || !tools.equal(row.token, await hash(clean(input.token, 64))))
      fail(404, "We could not find this inquiry. Please call or email the team instead.");
    await query(
      env,
      "UPDATE inquiries SET visit=?, updated=? WHERE id=?",
      JSON.stringify({ date, time, timezone: "Asia/Manila", requestedAt: new Date().toISOString() }),
      Date.now(),
      row.id,
    ).run();
    return json({ ok: true });
  }

  if (path === "/api/admin/inquiries" && method === "GET") {
    await session(request, env, "admin");
    const { results } = await query(
      env,
      "SELECT * FROM inquiries ORDER BY created DESC LIMIT 1000",
    ).all();
    // Property pins join by inquiry; an older database without the table simply has none.
    const sites = new Map();
    try {
      const { results: rows } = await query(env, "SELECT * FROM inquiry_sites").all();
      for (const row of rows) sites.set(row.inquiry_id, siteRecord(row));
    } catch {}
    const details = new Map();
    try {
      const { results: rows } = await query(env, "SELECT * FROM inquiry_details").all();
      for (const row of rows) details.set(row.inquiry_id, detailsOf(row));
    } catch {}
    return json({
      inquiries: results.map((row) => ({
        ...inquiryRecord(row),
        site: sites.get(row.id) || null,
        details: details.get(row.id) || null,
      })),
    });
  }

  if (path === "/api/admin/inquiries/update" && method === "POST") {
    const s = await session(request, env, "admin");
    csrf(request, s);
    const input = await body(request);
    const row = await query(env, "SELECT * FROM inquiries WHERE id=?", clean(input.id, 40)).first();
    if (!row) fail(404, "This inquiry no longer exists. Reload the list.");
    const status = input.status === undefined ? row.status : input.status;
    if (!inquiryStatuses.includes(status)) fail(400, "Unknown inquiry status.");
    if (input.note !== undefined && (typeof input.note !== "string" || input.note.length > 2000))
      fail(400, "Keep notes under 2,000 characters.");
    const note = input.note === undefined ? row.note : input.note.trim();
    const now = Date.now();
    const seen = input.seen === true ? row.seen || now : row.seen;
    const changed = status !== row.status || note !== row.note;
    await query(
      env,
      "UPDATE inquiries SET status=?,note=?,seen=?,updated=? WHERE id=?",
      status,
      note,
      seen,
      changed ? now : row.updated,
      row.id,
    ).run();
    if (status !== row.status) await audit(env, s.email, `inquiry_${status}`);
    // Keep the property pin on the returned record; the back office replaces its copy with this one.
    const siteRow = await query(env, "SELECT * FROM inquiry_sites WHERE inquiry_id=?", row.id)
      .first()
      .catch(() => null);
    const detailRow = await query(env, "SELECT * FROM inquiry_details WHERE inquiry_id=?", row.id)
      .first()
      .catch(() => null);
    return json({
      inquiry: {
        ...inquiryRecord({ ...row, status, note, seen, updated: changed ? now : row.updated }),
        site: siteRecord(siteRow),
        details: detailsOf(detailRow),
      },
    });
  }

  if (path === "/api/admin/inquiries/delete" && method === "POST") {
    const s = await session(request, env, "admin");
    csrf(request, s);
    const input = await body(request);
    const result = await query(env, "DELETE FROM inquiries WHERE id=?", clean(input.id, 40)).run();
    if (!result.meta.changes) fail(404, "This inquiry no longer exists. Reload the list.");
    await query(env, "DELETE FROM inquiry_sites WHERE inquiry_id=?", clean(input.id, 40))
      .run()
      .catch(() => {});
    await query(env, "DELETE FROM inquiry_details WHERE inquiry_id=?", clean(input.id, 40))
      .run()
      .catch(() => {});
    await audit(env, s.email, "inquiry_deleted");
    return json({ ok: true });
  }

  if (path === "/api/admin/analytics" && method === "GET") {
    await session(request, env, "admin");
    const requested = Number(new URL(request.url).searchParams.get("days"));
    const days = [7, 30, 90, 365].includes(requested) ? requested : 30;
    return json(await analytics(env, query, days));
  }
  return null;
}

async function analytics(env, query, days) {
  const now = Date.now();
  // Whole Manila days: today plus the previous days-1.
  const todayStart = Date.parse(dayKey(now) + "T00:00:00+08:00");
  const from = todayStart - (days - 1) * DAY;
  const previousFrom = from - days * DAY;
  const all = async (sql, ...args) => (await query(env, sql, ...args).all()).results;
  const one = async (sql, ...args) => (await query(env, sql, ...args).first()) || {};
  const totals = async (start, end) => {
    const views = await one(
      "SELECT COUNT(*) views, COUNT(DISTINCT visitor) visitors, COALESCE(SUM(entry),0) visits FROM page_views WHERE time>=? AND time<?",
      start,
      end,
    );
    const leads = await one(
      "SELECT COALESCE(SUM(topic='project'),0) inquiries, COALESCE(SUM(topic='partnership'),0) partners FROM inquiries WHERE created>=? AND created<? AND status<>'spam'",
      start,
      end,
    );
    return {
      views: views.views || 0,
      visitors: views.visitors || 0,
      visits: views.visits || 0,
      inquiries: leads.inquiries || 0,
      partners: leads.partners || 0,
    };
  };
  const current = await totals(from, now + 1);
  const previous = await totals(previousFrom, from);
  const daily = await all(
    "SELECT day, COUNT(*) views, COUNT(DISTINCT visitor) visitors FROM page_views WHERE time>=? GROUP BY day",
    from,
  );
  const leads = await all(
    "SELECT created, division, channel, campaign, status FROM inquiries WHERE created>=? AND status<>'spam' AND topic='project'",
    from,
  );
  const series = [];
  for (let t = from; t <= now; t += DAY) {
    const day = dayKey(t);
    const row = daily.find((d) => d.day === day);
    series.push({
      day,
      views: row?.views || 0,
      visitors: row?.visitors || 0,
      inquiries: leads.filter((l) => dayKey(l.created) === day).length,
    });
  }
  const count = (list, key) =>
    Object.entries(
      list.reduce((acc, item) => ((acc[item[key] || ""] = (acc[item[key] || ""] || 0) + 1), acc), {}),
    ).map(([name, value]) => ({ name, value }));
  const entries = await all(
    "SELECT channel, COUNT(DISTINCT visitor) visitors FROM page_views WHERE time>=? AND entry=1 GROUP BY channel",
    from,
  );
  const leadChannels = count(leads, "channel");
  const channels = ["Direct", "Search", "Social", "Referral", "Paid", "Email", "Campaign"]
    .map((name) => ({
      name,
      visitors: entries.find((e) => e.channel === name)?.visitors || 0,
      inquiries: leadChannels.find((e) => e.name === name)?.value || 0,
    }))
    .filter((c) => c.visitors || c.inquiries);
  const campaignVisits = await all(
    "SELECT campaign name, COUNT(DISTINCT visitor) visitors FROM page_views WHERE time>=? AND entry=1 AND campaign<>'' GROUP BY campaign ORDER BY visitors DESC LIMIT 12",
    from,
  );
  const leadCampaigns = count(leads.filter((l) => l.campaign), "campaign");
  const campaigns = [
    ...new Set([...campaignVisits.map((c) => c.name), ...leadCampaigns.map((c) => c.name)]),
  ].map((name) => ({
    name,
    visitors: campaignVisits.find((c) => c.name === name)?.visitors || 0,
    inquiries: leadCampaigns.find((c) => c.name === name)?.value || 0,
  }));
  const events = await all(
    "SELECT name, COUNT(*) total, COUNT(DISTINCT visitor) visitors FROM site_events WHERE time>=? AND name<>'error' GROUP BY name",
    from,
  );
  const reached = async (pattern) =>
    (
      await one(
        "SELECT COUNT(DISTINCT visitor) visitors FROM page_views WHERE time>=? AND path GLOB ?",
        from,
        pattern,
      )
    ).visitors || 0;
  return {
    days,
    from: new Date(from).toISOString(),
    generatedAt: new Date(now).toISOString(),
    totals: current,
    previous,
    daily: series,
    pages: await all(
      "SELECT path, COUNT(*) views, COUNT(DISTINCT visitor) visitors, MAX(time) last FROM page_views WHERE time>=? GROUP BY path ORDER BY views DESC LIMIT 40",
      from,
    ),
    lastViews: await all("SELECT path, MAX(time) last FROM page_views GROUP BY path"),
    channels,
    referrers: await all(
      "SELECT referrer name, COUNT(DISTINCT visitor) visitors FROM page_views WHERE time>=? AND entry=1 AND referrer<>'' GROUP BY referrer ORDER BY visitors DESC LIMIT 10",
      from,
    ),
    campaigns,
    devices: await all(
      "SELECT device name, COUNT(DISTINCT visitor) visitors FROM page_views WHERE time>=? GROUP BY device ORDER BY visitors DESC",
      from,
    ),
    countries: await all(
      "SELECT country name, COUNT(DISTINCT visitor) visitors FROM page_views WHERE time>=? AND country<>'' GROUP BY country ORDER BY visitors DESC LIMIT 6",
      from,
    ),
    events,
    funnel: [
      { step: "Visited the website", visitors: current.visitors },
      { step: "Viewed a division page", visitors: await reached("/divisions/*") },
      { step: "Opened the inquiry form", visitors: await reached("/inquiry") },
      {
        step: "Started typing an inquiry",
        visitors: events.find((e) => e.name === "inquiry_start")?.visitors || 0,
      },
      { step: "Sent an inquiry", visitors: current.inquiries },
    ],
    divisions: count(leads, "division"),
    pipeline: await all("SELECT status name, COUNT(*) value FROM inquiries GROUP BY status"),
    errors: await all(
      "SELECT path, detail, COUNT(*) total, MAX(time) last FROM site_events WHERE time>=? AND name='error' GROUP BY path, detail ORDER BY last DESC LIMIT 20",
      from,
    ),
  };
}

/** Daily clean-up: keep about 13 months of traffic. Inquiries are kept until staff delete them. */
export async function pruneInsights(env, query, now = Date.now()) {
  const cutoff = now - 400 * DAY;
  await query(env, "DELETE FROM page_views WHERE time<?", cutoff).run();
  await query(env, "DELETE FROM site_events WHERE time<?", cutoff).run();
}
