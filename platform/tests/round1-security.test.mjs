import test from "node:test";
import assert from "node:assert/strict";
import { fixture, content, credentials } from "./helpers.mjs";
test("S1 password and MFA bypass, CSRF, SQL injection and security headers", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.request("/api/admin/content")).status, 401);
  assert.equal(
    (
      await f.request("/api/admin/content", "PUT", {
        content: content(),
        version: 1,
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await f.request("/api/auth/login", "POST", {
        email: "' OR 1=1--",
        password: "test",
      })
    ).status,
    401,
  );
  const login = await f.request("/api/auth/login", "POST", credentials);
  assert.equal(login.status, 200);
  assert.equal((await f.request("/api/admin/content")).status, 401);
  assert.equal(
    (
      await f.request(
        "/api/auth/verify",
        "POST",
        { code: "000000" },
        { headers: { "X-CSRF-Token": "wrong" } },
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await f.request(
        "/api/auth/verify",
        "POST",
        { code: "000000" },
        { headers: { Origin: "https://evil.example" } },
      )
    ).status,
    403,
  );
  const response = (await f.request("/admin")).response;
  assert(
    response.headers
      .get("content-security-policy")
      .includes("object-src 'none'"),
  );
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("cache-control"), "no-store");
});
