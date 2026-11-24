/** Email verification codes for project inquiries, sent through Brevo.
 * Gated by INQUIRY_OTP_ENABLED=true with INQUIRY_OTP_FROM (a Brevo-verified sender) and the
 * BREVO_API_KEY secret. A verified code returns a short-lived proof that POST /api/inquiries
 * consumes, so the check cannot be skipped by posting to the inquiry endpoint directly.
 */
import { createHmac, randomInt } from "node:crypto";

const CODE_MINUTES = 10;
const PROOF_MINUTES = 30;

// On only with the flag, the sender and the key, so a half-finished setup never blocks inquiries.
export const inquiryOtpEnabled = (env) =>
  env.INQUIRY_OTP_ENABLED === "true" && !!env.BREVO_API_KEY && !!env.INQUIRY_OTP_FROM;

function digest(env, purpose, value) {
  const key = Uint8Array.from(env.AUTH_KEY.match(/../g) || [], (x) => parseInt(x, 16));
  return createHmac("sha256", key).update(`inquiry-otp:${purpose}:${value}`).digest("hex");
}
const normal = (email) => (typeof email === "string" ? email.trim().toLowerCase() : "");
const emailKey = (env, email) => digest(env, "email", normal(email));

/** Returns a Response for /api/inquiry/otp/* routes, or null for other paths. */
export async function inquiryOtpRoute(request, env, path, tools) {
  const send = path === "/api/inquiry/otp/send";
  if (request.method !== "POST" || (!send && path !== "/api/inquiry/otp/verify")) return null;
  const { query, rate, body, fail, json, random, emailPattern } = tools;
  if (!inquiryOtpEnabled(env)) fail(503, "Email verification is temporarily unavailable.");
  const ip = request.headers.get("cf-connecting-ip") || "local";
  await rate(env, `inquiry-otp:${send ? "send" : "verify"}:${ip}`, send ? 10 : 60, 900);
  const input = await body(request, 1024);
  const email = normal(input.email);
  if (email.length > 200 || !emailPattern.test(email)) fail(400, "Enter a valid email address.");
  const key = emailKey(env, email);
  const now = Date.now();

  if (!send) {
    if (
      typeof input.challenge !== "string" ||
      !/^[a-f0-9]{32}$/.test(input.challenge) ||
      typeof input.code !== "string" ||
      !/^\d{6}$/.test(input.code)
    )
      fail(400, "Enter the six-digit code from your email.");
    const proof = random(16);
    const code = digest(env, "code", `${input.challenge}:${input.code}`);
    const result = await query(
      env,
      `UPDATE inquiry_otp SET attempts=attempts+1,
       consumed=CASE WHEN digest=?1 THEN 1 ELSE 0 END,
       proof=CASE WHEN digest=?1 THEN ?2 ELSE '' END,
       proof_expires=CASE WHEN digest=?1 THEN ?3 ELSE 0 END
       WHERE email_key=?4 AND challenge=?5 AND expires>?6 AND attempts<5 AND consumed=0
       RETURNING consumed`,
      code,
      digest(env, "proof", proof),
      now + PROOF_MINUTES * 60_000,
      key,
      input.challenge,
      now,
    ).first();
    if (!result?.consumed)
      fail(400, "The code is incorrect or has expired. Check it or request a new code.");
    return json({ verified: true, proof });
  }

  await rate(env, `inquiry-otp:resend:${key}`, 1, 60);
  await rate(env, `inquiry-otp:hour:${key}`, 5, 3600);
  const challenge = random(16);
  const code = String(randomInt(1_000_000)).padStart(6, "0");
  await query(
    env,
    `INSERT INTO inquiry_otp(email_key,challenge,digest,expires) VALUES(?,?,?,?)
     ON CONFLICT(email_key) DO UPDATE SET challenge=excluded.challenge, digest=excluded.digest,
     expires=excluded.expires, attempts=0, consumed=0, proof='', proof_expires=0`,
    key,
    challenge,
    digest(env, "code", `${challenge}:${code}`),
    now + CODE_MINUTES * 60_000,
  ).run();

  let accepted = false;
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json", "api-key": env.BREVO_API_KEY },
      body: JSON.stringify({
        sender: { email: env.INQUIRY_OTP_FROM, name: "Techouse" },
        to: [{ email }],
        subject: "Your Techouse verification code",
        textContent: `Your Techouse verification code is ${code}. It expires in ${CODE_MINUTES} minutes. If you did not request it, you can ignore this email.`,
      }),
      signal: AbortSignal.timeout(10_000),
      redirect: "error",
    });
    accepted = response.ok;
  } catch {
    // Provider errors and configuration are never shown to the browser.
  }
  if (!accepted) {
    await query(env, "DELETE FROM inquiry_otp WHERE email_key=? AND challenge=?", key, challenge).run();
    fail(502, "We could not send the code. Please try again in a minute.");
  }
  return json({ challenge }, 201);
}

/** Uses up the proof for this address. Fails with 403 when verification is on and the proof is missing or stale. */
export async function consumeInquiryProof(env, query, fail, email, proof) {
  if (!inquiryOtpEnabled(env)) return;
  const ok =
    typeof proof === "string" &&
    /^[a-f0-9]{32}$/.test(proof) &&
    (await query(
      env,
      `UPDATE inquiry_otp SET proof='', proof_expires=0
       WHERE email_key=? AND proof=? AND proof_expires>? RETURNING email_key`,
      emailKey(env, email),
      digest(env, "proof", proof),
      Date.now(),
    ).first());
  if (!ok) fail(403, "Verify your email address with a new code, then send again.");
}

export async function pruneInquiryOtp(env, query, now = Date.now()) {
  await query(env, "DELETE FROM inquiry_otp WHERE expires<=? AND proof_expires<=?", now, now).run();
}
