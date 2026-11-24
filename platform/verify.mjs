/**
 * Customer verification codes for inquiries, with fallbacks.
 * A 6-digit code goes by SMS first (Semaphore, then Twilio) and by email when SMS is unavailable or
 * fails (Resend). If no provider is configured, verification is off and inquiries send as before.
 * If every provider fails, the inquiry still goes through and staff see it as not verified.
 * Codes are stored only as salted hashes, expire after 10 minutes and allow 5 attempts.
 *
 * Worker secrets (none are required; each one switches a channel on):
 *   SEMAPHORE_API_KEY [+ SEMAPHORE_SENDER]           SMS in the Philippines (semaphore.co)
 *   TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM   backup SMS (twilio.com)
 *   RESEND_API_KEY + VERIFY_EMAIL_FROM                email (resend.com), e.g. "Techouse <verify@example.com>"
 */
const CODE_MINUTES = 10;
const TOKEN_MINUTES = 30;
const MAX_ATTEMPTS = 5;

/** Philippine mobile numbers in E.164 (+639XXXXXXXXX), or "" when the number is not one. */
export function phMobile(value) {
  const digits = String(value || "").replace(/[^\d+]/g, "");
  const match = digits.match(/^(?:\+?63|0)?(9\d{9})$/);
  return match ? `+63${match[1]}` : "";
}
const emailPattern = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const normalEmail = (value) => {
  const email = String(value || "").trim().toLowerCase();
  return emailPattern.test(email) ? email : "";
};
const maskPhone = (phone) => `•••• ${phone.slice(-4)}`;
const maskEmail = (email) => {
  const [name, domain] = email.split("@");
  return `${name[0]}•••@${domain}`;
};
const message = (code) =>
  `Your Techouse verification code is ${code}. It expires in ${CODE_MINUTES} minutes. Do not share it.`;

/** Which channels have a provider configured. */
export function channels(env) {
  const sms = [];
  if (env.SEMAPHORE_API_KEY) sms.push("semaphore");
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM) sms.push("twilio");
  const email = env.RESEND_API_KEY && env.VERIFY_EMAIL_FROM ? ["resend"] : [];
  return { sms, email, on: sms.length > 0 || email.length > 0 };
}

// PROVIDERS: each resolves when the message was accepted and throws otherwise.
async function deliver(env, provider, to, text) {
  const send = env.verifyFetch || fetch; // tests inject a stand-in
  const ok = async (response) => {
    if (!response.ok) throw new Error(`${provider} ${response.status}`);
    return response;
  };
  if (provider === "semaphore") {
    const form = new URLSearchParams({ apikey: env.SEMAPHORE_API_KEY, number: to.replace("+", ""), message: text });
    if (env.SEMAPHORE_SENDER) form.set("sendername", env.SEMAPHORE_SENDER);
    const response = await ok(await send("https://api.semaphore.co/api/v4/priority", { method: "POST", body: form }));
    const value = await response.json().catch(() => null);
    if (!Array.isArray(value) || !value.length || value[0].status === "Failed") throw new Error("semaphore rejected");
    return;
  }
  if (provider === "twilio") {
    const form = new URLSearchParams({ To: to, From: env.TWILIO_FROM, Body: text });
    await ok(
      await send(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(env.TWILIO_ACCOUNT_SID)}/Messages.json`, {
        method: "POST",
        headers: { Authorization: `Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}` },
        body: form,
      }),
    );
    return;
  }
  if (provider === "resend") {
    await ok(
      await send("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.VERIFY_EMAIL_FROM, to: [to], subject: "Your Techouse verification code", text }),
      }),
    );
    return;
  }
  throw new Error("unknown provider");
}

function sixDigits() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(values[0] % 1000000).padStart(6, "0");
}

/** Handles /api/verify/*; returns a Response, or null for other paths. */
// Every stored value is hashed with the Worker's secret AUTH_KEY, so a leaked table cannot be
// reversed by trying every phone number.
const salted = (tools, env) => (value) => tools.hash(`${env.AUTH_KEY}|${value}`);

export async function verifyRoute(request, env, path, tools) {
  const { query, rate, body, fail, json, equal } = tools;
  const hash = salted(tools, env);
  if (!path.startsWith("/api/verify/")) return null;
  if (request.method !== "POST") fail(405, "Method not allowed.");
  const address = request.headers.get("cf-connecting-ip") || "local";
  const available = channels(env);

  if (path === "/api/verify/send") {
    const input = await body(request);
    if (!available.on) return json({ skipped: true });
    const phone = phMobile(input.phone);
    const email = normalEmail(input.email);
    if (!phone && !email) fail(400, "Add a mobile number or email address to receive a code.");
    await rate(env, "verify-ip:" + address, 10, 3600);
    // Try the channel asked for first, then the other one: SMS falls back to email and back.
    const sms = phone ? available.sms.map((p) => ["sms", p, phone]) : [];
    const mail = email ? available.email.map((p) => ["email", p, email]) : [];
    const order = input.channel === "email" ? [...mail, ...sms] : [...sms, ...mail];
    if (!order.length) return json({ failed: true, reason: "no-channel" });
    const wanted = order[0][0];
    const code = sixDigits();
    const id = crypto.randomUUID();
    for (const [channel, provider, to] of order) {
      await rate(env, "verify-to:" + to, 4, 900);
      try {
        await deliver(env, provider, to, message(code));
      } catch {
        continue; // next provider or channel
      }
      const now = Date.now();
      await query(
        env,
        "INSERT INTO verifications(id,created,expires,channel,target,code_hash,attempts) VALUES(?,?,?,?,?,?,0)",
        id,
        now,
        now + CODE_MINUTES * 60000,
        channel,
        await hash("verify-target:" + to),
        await hash(`verify-code:${id}:${code}`),
      ).run();
      return json({
        id,
        channel,
        to: channel === "sms" ? maskPhone(to) : maskEmail(to),
        fallback: channel !== wanted,
        // Offer the other channel when the customer gave one.
        other: channel === "sms" ? !!mail.length : !!sms.length,
      });
    }
    return json({ failed: true, reason: "delivery" });
  }

  if (path === "/api/verify/check") {
    const input = await body(request);
    const id = typeof input.id === "string" ? input.id.slice(0, 40) : "";
    const code = typeof input.code === "string" ? input.code.replace(/\D/g, "").slice(0, 6) : "";
    await rate(env, "verify-check-ip:" + address, 30, 900);
    const row = await query(env, "SELECT * FROM verifications WHERE id=?", id).first();
    if (!row || row.expires < Date.now() || row.verified)
      fail(400, "This code has expired. Send a new one.");
    if (row.attempts >= MAX_ATTEMPTS) fail(429, "Too many tries. Send a new code.");
    await query(env, "UPDATE verifications SET attempts=attempts+1 WHERE id=?", id).run();
    if (code.length !== 6 || !equal(await hash(`verify-code:${id}:${code}`), row.code_hash)) {
      const left = MAX_ATTEMPTS - row.attempts - 1;
      fail(400, left > 0 ? `That code is not right. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many tries. Send a new code.");
    }
    const token = crypto.randomUUID().replaceAll("-", "");
    await query(env, "UPDATE verifications SET verified=?, token=? WHERE id=?", Date.now(), await hash("verify-token:" + token), id).run();
    return json({ token });
  }
  fail(404, "Not found.");
}

/**
 * Links a verified code to a new inquiry. Returns the channel ("sms" or "email") when the token is
 * valid, recent, unused and was sent to this inquiry's mobile number or email; otherwise null.
 */
export async function useVerification(env, tools, token, inquiryId, phone, email) {
  if (typeof token !== "string" || !token || token.length > 64) return null;
  const { query } = tools;
  const hash = salted(tools, env);
  const row = await query(env, "SELECT * FROM verifications WHERE token=?", await hash("verify-token:" + token))
    .first()
    .catch(() => null);
  if (!row || row.inquiry_id || !row.verified || row.verified < Date.now() - TOKEN_MINUTES * 60000) return null;
  const targets = [phMobile(phone), normalEmail(email)].filter(Boolean);
  const hashes = await Promise.all(targets.map((t) => hash("verify-target:" + t)));
  if (!hashes.includes(row.target)) return null;
  await query(env, "UPDATE verifications SET inquiry_id=? WHERE id=?", inquiryId, row.id).run();
  return row.channel;
}
