/** Cloudflare Worker: all publishing requires password + TOTP, an opaque session and CSRF.
 * Never place encryption keys, passwords, or MFA secrets in public assets or browser storage.
 */
import { scrypt } from "node:crypto";
const encoder = new TextEncoder();
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const hex = (bytes) =>
  Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
const unhex = (value) =>
  Uint8Array.from(value.match(/../g) || [], (x) => parseInt(x, 16));
const random = (length = 32) =>
  hex(crypto.getRandomValues(new Uint8Array(length)));
const hash = async (value) =>
  hex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
export function equal(a, b) {
  const x = encoder.encode(String(a)),
    y = encoder.encode(String(b));
  let mismatch = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++)
    mismatch |= (x[i] || 0) ^ (y[i] || 0);
  return mismatch === 0;
}
export async function passwordHash(password, salt = random(16)) {
  const derived = await new Promise((resolve, reject) =>
    scrypt(
      password,
      unhex(salt),
      32,
      { N: 16384, r: 8, p: 5, maxmem: 32 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    ),
  );
  return `scrypt$16384$8$5$${salt}$${hex(derived)}`;
}
async function verifyPassword(password, stored) {
  const parts = stored.split("$");
  return (
    parts.length === 6 &&
    parts.slice(0, 4).join("$") === "scrypt$16384$8$5" &&
    equal(await passwordHash(password, parts[4]), stored)
  );
}
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function base32(bytes) {
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  return bits
    .match(/.{1,5}/g)
    .map((v) => alphabet[parseInt(v.padEnd(5, "0"), 2)])
    .join("");
}
function decode32(secret) {
  const bits = [...secret]
    .map((v) => alphabet.indexOf(v).toString(2).padStart(5, "0"))
    .join("");
  return Uint8Array.from(
    (bits.match(/.{8}/g) || []).map((v) => parseInt(v, 2)),
  );
}
export async function totp(secret, step) {
  const key = await crypto.subtle.importKey(
    "raw",
    decode32(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const counter = new Uint8Array(8);
  new DataView(counter.buffer).setBigUint64(0, BigInt(step));
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, counter));
  const offset = bytes.at(-1) & 15;
  return String(
    (new DataView(bytes.buffer).getUint32(offset) & 0x7fffffff) % 1000000,
  ).padStart(6, "0");
}
async function seal(text, env, decrypt = false) {
  const key = await crypto.subtle.importKey(
    "raw",
    unhex(env.AUTH_KEY),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"],
  );
  if (decrypt) {
    const [iv, payload] = text.split(".");
    return new TextDecoder().decode(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: unhex(iv) },
        key,
        unhex(payload),
      ),
    );
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return `${hex(iv)}.${hex(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(text)))}`;
}
const query = (env, sql, ...args) => env.DB.prepare(sql).bind(...args);
async function audit(env, actor, action) {
  await query(
    env,
    "INSERT INTO audit(time,actor,action) VALUES(?,?,?)",
    Date.now(),
    actor,
    action,
  ).run();
}
async function rate(env, id, max, seconds = 900) {
  const now = Date.now();
  const record = await query(
    env,
    `INSERT INTO limits(id,count,expires) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=CASE WHEN expires<? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<? THEN excluded.expires ELSE expires END RETURNING count`,
    await hash(id),
    now + seconds * 1000,
    now,
    now,
  ).first();
  if (record.count > max)
    fail(429, "Too many attempts. Please try again later.");
}
async function body(request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    fail(415, "Send JSON.");
  const reader = request.body?.getReader();
  let size = 0,
    chunks = [];
  if (reader)
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 5_000_000) {
        await reader.cancel();
        fail(413, "Request too large.");
      }
      chunks.push(value);
    }
  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const c of chunks) {
      bytes.set(c, offset);
      offset += c.length;
    }
    const value = JSON.parse(new TextDecoder().decode(bytes));
    if (!value || typeof value !== "object" || Array.isArray(value))
      fail(400, "Send a JSON object.");
    return value;
  } catch {
    fail(400, "Invalid JSON.");
  }
}
function cookie(env, token, maxAge) {
  return `${env.COOKIE_SECURE === "false" ? "techouse_session" : "__Host-techouse_session"}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${env.COOKIE_SECURE === "false" ? "" : "; Secure"}`;
}
async function session(request, env, kind) {
  const name =
    env.COOKIE_SECURE === "false"
      ? "techouse_session"
      : "__Host-techouse_session";
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(name + "="))
    ?.slice(name.length + 1);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) fail(401, "Please sign in.");
  const record = await query(
    env,
    "SELECT * FROM sessions WHERE id=? AND expires>?",
    await hash(token),
    Date.now(),
  ).first();
  if (!record || (kind && record.kind !== kind))
    fail(401, "Please complete sign-in.");
  return record;
}
async function issue(env, email, kind, secret = null) {
  const token = random(),
    csrf = random();
  const age = kind === "admin" ? 3600 : 300;
  await query(
    env,
    "INSERT INTO sessions(id,email,kind,csrf,expires,secret,created) VALUES(?,?,?,?,?,?,?)",
    await hash(token),
    email,
    kind,
    csrf,
    Date.now() + age * 1000,
    secret,
    Date.now(),
  ).run();
  return { token, csrf, age };
}
function origin(request, env) {
  if (request.headers.get("origin") !== env.APP_ORIGIN)
    fail(403, "Request origin rejected.");
}
function csrf(request, record) {
  if (!equal(request.headers.get("x-csrf-token") || "", record.csrf))
    fail(403, "Reload the page and try again.");
}
const selectors = [
  ".landing-kicker",
  "#landing-title",
  "#company-title",
  ".company-story p:nth-of-type(1)",
  ".company-story-close",
  ".page-hero h1",
  ".page-hero p",
  ".content-columns h2",
  ".content-columns > div:first-child p:nth-of-type(1)",
  ".content-columns > div:first-child p:nth-of-type(2)",
  ".scope-panel .scope-label",
  ".scope-panel p:nth-of-type(1)",
  ".scope-panel p:nth-of-type(2)",
];
const divisions = [
  "solar",
  "construction",
  "prefabrication",
  "development",
  "elevators",
];
for (const id of divisions)
  for (const sel of ["h2", ".banner-division-label"])
    selectors.push(`[data-banner="${id}"] ${sel}`);
// Retired homepage fields are accepted only to clean older saved drafts on their next save.
const retiredSelectors = new Set([
  ".company-intro p:nth-of-type(1)",
  ".company-intro p:nth-of-type(2)",
  ".landing-invitation .intro-step:first-child",
  ".landing-invitation .intro-step:last-child",
  ...divisions.flatMap((id) =>
    [".banner-hook", ".banner-description"].map((sel) => `[data-banner="${id}"] ${sel}`),
  ),
]);
function text(value, limit = 5000) {
  if (typeof value !== "string" || value.length > limit)
    fail(400, "Invalid or oversized text.");
  return value;
}
function image(value) {
  text(value, 1_400_000);
  if (
    !value ||
    (/^assets\/[a-zA-Z0-9_./ -]+$/.test(value) && !value.includes(".."))
  )
    return value;
  if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value))
    return value;
  fail(400, "Use a local asset or JPEG, PNG or WebP image.");
}
export function validateContent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    fail(400, "Invalid content.");
  const content = {
    text: {},
    images: {},
    projects: [],
    posts: [],
    portfolioVersion: 2,
  };
  for (const field of ["text", "images"])
    if (
      input[field] !== undefined &&
      (!input[field] ||
        typeof input[field] !== "object" ||
        Array.isArray(input[field]))
    )
      fail(400, "Invalid content fields.");
  for (const [key, value] of Object.entries(input.text || {})) {
    if (retiredSelectors.has(key)) {
      text(value);
      continue;
    }
    if (!selectors.includes(key)) fail(400, "Unknown text field.");
    content.text[key] = text(value);
  }
  for (const [key, value] of Object.entries(input.images || {})) {
    if (!divisions.includes(key)) fail(400, "Unknown banner.");
    content.images[key] = image(value);
  }
  for (const type of ["projects", "posts"]) {
    if (!Array.isArray(input[type]) || input[type].length > 100)
      fail(400, "Too many entries.");
    const ids = new Set();
    content[type] = input[type].map((p) => {
      if (
        !p ||
        typeof p !== "object" ||
        Array.isArray(p) ||
        typeof p.id !== "string" ||
        !/^[a-zA-Z0-9_-]{1,100}$/.test(p.id) ||
        ids.has(p.id)
      )
        fail(400, "Each entry needs a unique valid ID.");
      ids.add(p.id);
      if (!["draft", "published"].includes(p.status))
        fail(400, "Invalid publication status.");
      const row = {
        id: p.id,
        title: text(p.title, 200),
        status: p.status,
        sample: Boolean(p.sample),
        image: image(p.image || ""),
        cover: image(
          [
            "architecture.jpg",
            "solar.jpg",
            "construction.jpg",
            "development.jpg",
          ].includes(p.cover)
            ? "assets/" + p.cover
            : p.cover || "",
        ),
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      for (const key of [
        "location",
        "capacity",
        "system",
        "projectCost",
        "roi",
        "annualMaintenance",
        "roofType",
        "engineeringChallenges",
        "clientFeedback",
        "previewAssumptions",
        "description",
        "summary",
        "body",
        "division",
        "provider",
        "source",
        "photoSource",
      ])
        if (p[key] !== undefined)
          row[key] = text(p[key], key === "body" ? 20000 : 5000);
      for (const key of ["source", "photoSource"])
        if (row[key] && !/^https:\/\//.test(row[key]))
          fail(400, "Reference links must use HTTPS.");
      if (type === "projects") {
        if (!["residential", "commercial", "industrial"].includes(p.sector))
          fail(400, "Invalid sector.");
        row.sector = p.sector;
        row.reference = Boolean(p.reference);
        if (p.gallery !== undefined && !Array.isArray(p.gallery))
          fail(400, "Invalid project gallery.");
        if (p.gallery?.length > 3)
          fail(400, "Maximum three images per project.");
        row.gallery = (p.gallery || []).map((g) => {
          if (!g || typeof g !== "object" || Array.isArray(g))
            fail(400, "Invalid project photo.");
          return {
            src: image(g.src),
            caption: text(g.caption || ""),
            source: /^https:\/\//.test(g.source || "") ? text(g.source) : "",
          };
        });
      }
      return row;
    });
  }
  return content;
}
async function getContent(env, published = false) {
  const row = await query(env, "SELECT * FROM content WHERE id=1").first();
  const value = row
    ? JSON.parse(row.body)
    : { text: {}, images: {}, projects: [], posts: [], portfolioVersion: 2 };
  if (published)
    for (const type of ["posts", "projects"])
      value[type] = value[type].filter((p) => p.status === "published");
  return { content: value, version: row?.version || 0 };
}
async function route(request, env) {
  const url = new URL(request.url),
    path = url.pathname;
  if (!env.AUTH_KEY || !/^[a-f0-9]{64}$/.test(env.AUTH_KEY))
    fail(503, "Server security configuration is incomplete.");
  if (request.method === "OPTIONS") return new Response(null, { status: 405 });
  if (path.startsWith("/api/") && !["GET", "HEAD"].includes(request.method))
    origin(request, env);
  if (path === "/api/bootstrap.js" && request.method === "GET") {
    const { content } = await getContent(env, true);
    return new Response(
      `window.TechouseBoot=${JSON.stringify(content).replace(/</g, "\\u003c")};`,
      { headers: { "Content-Type": "application/javascript" } },
    );
  }
  if (path === "/api/auth/setup" && request.method === "POST") {
    await rate(
      env,
      "setup:" + (request.headers.get("cf-connecting-ip") || "local"),
      10,
    );
    const input = await body(request);
    if (
      typeof input.token !== "string" ||
      !/^[a-f0-9]{64}$/.test(input.token) ||
      typeof input.password !== "string" ||
      input.password.length < 16 ||
      input.password.length > 256
    )
      fail(
        400,
        "Use the one-time setup link and a password of 16–256 characters.",
      );
    const digest = await hash(input.token);
    const invite = await query(
      env,
      "SELECT email FROM invitations WHERE token=? AND expires>?",
      digest,
      Date.now(),
    ).first();
    if (!invite) fail(403, "Setup link is invalid or expired.");
    const result = await query(
      env,
      "INSERT OR IGNORE INTO users(email,password) SELECT email,? FROM invitations WHERE token=? AND expires>?",
      await passwordHash(input.password),
      digest,
      Date.now(),
    ).run();
    if (!result.meta.changes)
      fail(409, "This account has already been created.");
    await query(env, "DELETE FROM invitations WHERE token=?", digest).run();
    await audit(env, invite.email, "account_provisioned");
    return json({ email: invite.email });
  }
  if (path === "/api/auth/login" && request.method === "POST") {
    const input = await body(request);
    const email = String(input.email || "")
      .toLowerCase()
      .trim();
    await rate(
      env,
      "login-ip:" + (request.headers.get("cf-connecting-ip") || "local"),
      30,
    );
    await rate(env, "login-user:" + email, 8);
    const user = await query(
      env,
      "SELECT * FROM users WHERE email=?",
      email,
    ).first();
    const dummy =
      "scrypt$16384$8$5$00000000000000000000000000000000$" + "0".repeat(64);
    if (typeof input.password !== "string" || input.password.length > 256)
      fail(401, "Invalid sign-in details.");
    const valid = await verifyPassword(input.password, user?.password || dummy);
    if (!valid || !user) {
      await audit(env, "anonymous", "login_failed");
      fail(401, "Invalid sign-in details.");
    }
    const secret = user.mfa
      ? null
      : base32(crypto.getRandomValues(new Uint8Array(20)));
    const s = await issue(
      env,
      email,
      user.mfa ? "mfa" : "enroll",
      secret ? await seal(secret, env) : null,
    );
    await audit(env, email, "password_verified");
    return json(
      {
        stage: user.mfa ? "mfa" : "enroll",
        csrf: s.csrf,
        ...(secret
          ? {
              secret,
              uri: `otpauth://totp/Techouse:${encodeURIComponent(email)}?secret=${secret}&issuer=Techouse&algorithm=SHA1&digits=6&period=30`,
            }
          : {}),
      },
      200,
      { "Set-Cookie": cookie(env, s.token, s.age) },
    );
  }
  if (path === "/api/auth/verify" && request.method === "POST") {
    const s = await session(request, env);
    if (!["mfa", "enroll"].includes(s.kind)) fail(403, "Sign in again.");
    csrf(request, s);
    const attempt = await query(
      env,
      "UPDATE sessions SET attempts=attempts+1 WHERE id=? AND attempts<5 RETURNING attempts",
      s.id,
    ).first();
    if (!attempt) fail(429, "Too many verification attempts. Sign in again.");
    const input = await body(request);
    const user = await query(
      env,
      "SELECT * FROM users WHERE email=?",
      s.email,
    ).first();
    const secret = await seal(
      s.kind === "enroll" ? s.secret : user.mfa,
      env,
      true,
    );
    const now = Math.floor(Date.now() / 30000);
    let step = -1;
    for (const n of [now - 1, now, now + 1])
      if (n > user.last_step && equal(input.code || "", await totp(secret, n)))
        step = n;
    let recovery = null;
    if (step < 0 && s.kind === "mfa" && typeof input.code === "string") {
      const codes = JSON.parse(user.recovery);
      const digest = await hash(input.code.trim());
      if (codes.includes(digest)) recovery = codes.filter((v) => v !== digest);
    }
    if (step < 0 && !recovery) fail(401, "Invalid or already-used code.");
    let recoveryCodes;
    if (s.kind === "enroll") {
      recoveryCodes = Array.from({ length: 8 }, () => random(12));
      const result = await query(
        env,
        "UPDATE users SET mfa=?,last_step=?,recovery=? WHERE email=? AND mfa IS NULL",
        s.secret,
        step,
        JSON.stringify(await Promise.all(recoveryCodes.map(hash))),
        s.email,
      ).run();
      if (!result.meta.changes)
        fail(409, "Authenticator already enrolled. Sign in again.");
    } else {
      const result = recovery
        ? await query(
            env,
            "UPDATE users SET recovery=? WHERE email=? AND recovery=?",
            JSON.stringify(recovery),
            s.email,
            user.recovery,
          ).run()
        : await query(
            env,
            "UPDATE users SET last_step=? WHERE email=? AND last_step<?",
            step,
            s.email,
            step,
          ).run();
      if (!result.meta.changes) fail(401, "Code already used.");
    }
    await query(env, "DELETE FROM sessions WHERE email=?", s.email).run();
    const full = await issue(env, s.email, "admin");
    await audit(env, s.email, "mfa_login");
    return json(
      { csrf: full.csrf, ...(recoveryCodes ? { recoveryCodes } : {}) },
      200,
      { "Set-Cookie": cookie(env, full.token, full.age) },
    );
  }
  if (path === "/api/auth/session" && request.method === "GET") {
    const s = await session(request, env, "admin");
    return json({ email: s.email, csrf: s.csrf });
  }
  if (
    ["/api/auth/password", "/api/auth/mfa/remove"].includes(path) &&
    request.method === "POST"
  ) {
    const active = await session(request, env, "admin");
    csrf(request, active);
    await rate(env, "account-security:" + active.email, 5);
    const input = await body(request);
    const user = await query(
      env,
      "SELECT * FROM users WHERE email=?",
      active.email,
    ).first();
    if (
      typeof input.password !== "string" ||
      input.password.length > 256 ||
      !(await verifyPassword(input.password, user.password))
    )
      fail(401, "Re-verification failed.");
    const secret = await seal(user.mfa, env, true);
    const now = Math.floor(Date.now() / 30000);
    let step = -1;
    for (const n of [now - 1, now, now + 1])
      if (n > user.last_step && equal(input.code || "", await totp(secret, n)))
        step = n;
    let recovery = JSON.parse(user.recovery);
    if (step < 0) {
      const digest = await hash(String(input.code || "").trim());
      if (!recovery.includes(digest))
        fail(401, "Use a fresh authenticator code or unused recovery code.");
      recovery = recovery.filter((x) => x !== digest);
    }
    const remove = path.endsWith("/remove");
    if (
      !remove &&
      (typeof input.newPassword !== "string" ||
        input.newPassword.length < 16 ||
        input.newPassword.length > 256 ||
        input.newPassword === input.password)
    )
      fail(400, "Choose a different password with 16–256 characters.");
    const result = await query(
      env,
      "UPDATE users SET password=?,mfa=?,last_step=?,recovery=? WHERE email=? AND password=? AND last_step=? AND recovery=?",
      remove ? user.password : await passwordHash(input.newPassword),
      remove ? null : user.mfa,
      remove ? -1 : Math.max(step, user.last_step),
      remove ? "[]" : JSON.stringify(recovery),
      user.email,
      user.password,
      user.last_step,
      user.recovery,
    ).run();
    if (!result.meta.changes)
      fail(409, "Account changed. Sign in and try again.");
    await query(env, "DELETE FROM sessions WHERE email=?", user.email).run();
    await audit(env, user.email, remove ? "mfa_removed" : "password_changed");
    return json({ ok: true, reenroll: remove }, 200, {
      "Set-Cookie": cookie(env, "", 0),
    });
  }
  if (path === "/api/admin/bootstrap.js" && request.method === "GET") {
    const active = await session(request, env, "admin");
    const saved = await getContent(env);
    const payload = JSON.stringify({
      email: active.email,
      csrf: active.csrf,
      version: saved.version,
    }).replace(/</g, "\\u003c");
    return new Response(
      `window.TechouseAdmin=${payload};window.TechouseBoot=${JSON.stringify(saved.content).replace(/</g, "\\u003c")};`,
      { headers: { "Content-Type": "application/javascript" } },
    );
  }
  if (path === "/office.html") {
    try {
      await session(request, env, "admin");
    } catch {
      return Response.redirect(new URL("/admin", url).href, 302);
    }
    const asset = await env.ASSETS.fetch(
      new Request(new URL("/index.html", url), request),
    );
    const html = (await asset.text()).replace(
      '<script src="icons.js',
      '<script src="/platform-mode.js"></script><script src="/api/admin/bootstrap.js"></script><script src="/secure-office.js" defer></script><script src="icons.js',
    );
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
  if (path === "/api/auth/logout" && request.method === "POST") {
    const s = await session(request, env);
    csrf(request, s);
    await query(env, "DELETE FROM sessions WHERE id=?", s.id).run();
    return json({ ok: true }, 200, { "Set-Cookie": cookie(env, "", 0) });
  }
  if (path === "/api/admin/content") {
    const s = await session(request, env, "admin");
    if (request.method === "GET") return json(await getContent(env));
    if (request.method === "PUT") {
      csrf(request, s);
      const input = await body(request);
      const value = validateContent(input.content);
      const result = await query(
        env,
        "UPDATE content SET body=?,version=version+1 WHERE id=1 AND version=?",
        JSON.stringify(value),
        Number(input.version),
      ).run();
      if (!result.meta.changes)
        fail(409, "Content changed elsewhere. Reload before saving.");
      await audit(env, s.email, "content_saved");
      return json(await getContent(env));
    }
    fail(405, "Method not allowed.");
  }
  if (path.startsWith("/api/")) fail(404, "Not found.");
  if (!["GET", "HEAD"].includes(request.method))
    fail(405, "Method not allowed.");
  if (path === "/admin" || path === "/admin/")
    return env.ASSETS.fetch(new Request(new URL("/admin.html", url), request));
  const asset = await env.ASSETS.fetch(request);
  if (path === "/" || path === "/index.html") {
    const html = (await asset.text()).replace(
      '<script src="icons.js',
      '<script src="/platform-mode.js"></script><script src="/api/bootstrap.js"></script><script src="icons.js',
    );
    return new Response(html, { status: asset.status, headers: asset.headers });
  }
  return asset;
}
export default {
  async fetch(request, env) {
    let response;
    try {
      response = await route(request, env);
    } catch (error) {
      response = json(
        {
          error: error.status
            ? error.message
            : "Server error. Please try again.",
        },
        error.status || 500,
      );
    }
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-src 'self' https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'",
    );
    if (env.COOKIE_SECURE !== "false")
      headers.set("Strict-Transport-Security", "max-age=31536000");
    if (
      new URL(request.url).pathname.startsWith("/api/") ||
      new URL(request.url).pathname.startsWith("/admin") ||
      new URL(request.url).pathname === "/office.html"
    )
      headers.set("Cache-Control", "no-store");
    return new Response(response.body, { status: response.status, headers });
  },
  async scheduled(event, env) {
    const now = Date.now();
    await query(env, "DELETE FROM sessions WHERE expires<?", now).run();
    await query(env, "DELETE FROM limits WHERE expires<?", now).run();
    await query(
      env,
      "DELETE FROM audit WHERE time<?",
      now - 90 * 86400000,
    ).run();
  },
};
