import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { fixture, credentials, content } from "./helpers.mjs";
test("S3 expiry, brute-force cap, hostile structure, setup replay and secure deployment cookies", async (t) => {
  const f = await fixture(t);
  await f.login();
  f.db.prepare("UPDATE sessions SET expires=0").run();
  assert.equal((await f.request("/api/admin/content")).status, 401);
  await f.request("/api/auth/login", "POST", credentials);
  for (let i = 0; i < 5; i++)
    assert.equal(
      (await f.request("/api/auth/verify", "POST", { code: "incorrect" }))
        .status,
      401,
    );
  assert.equal(
    (await f.request("/api/auth/verify", "POST", { code: "incorrect" })).status,
    429,
  );
  f.env.COOKIE_SECURE = "true";
  f.env.APP_ORIGIN = "https://techouse.example";
  const login = await f.request("/api/auth/login", "POST", credentials);
  const set = login.response.headers.get("set-cookie");
  assert(set.startsWith("__Host-techouse_session="));
  assert(set.includes("; Secure"));
  assert(login.response.headers.get("strict-transport-security"));
  f.env.COOKIE_SECURE = "false";
  f.env.APP_ORIGIN = "http://127.0.0.1:8787";
  const token = "a".repeat(64);
  f.db
    .prepare("INSERT INTO invitations(token,email,expires) VALUES(?,?,?)")
    .run(
      createHash("sha256").update(token).digest("hex"),
      "owner@example.test",
      Date.now() + 60000,
    );
  assert.equal(
    (
      await f.request("/api/auth/setup", "POST", {
        token,
        password: "A strong setup password for tests",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await f.request("/api/auth/setup", "POST", {
        token,
        password: "A different setup password test",
      })
    ).status,
    403,
  );
  for (let i = 0; i < 9; i++)
    await f.request("/api/auth/login", "POST", {
      email: "unknown@example.test",
      password: "incorrect",
    });
  assert.equal(
    (
      await f.request("/api/auth/login", "POST", {
        email: "unknown@example.test",
        password: "incorrect",
      })
    ).status,
    429,
  );
  assert.equal((await f.request("/.data/auth-key")).status, 404);
  assert.equal(
    (await f.request("/%2e%2e/platform/.data/auth-key")).status,
    404,
  );
  assert.equal(
    (await f.request("/api/auth/setup", "POST", "not json")).status,
    400,
  );
});
