import test from "node:test";
import assert from "node:assert/strict";
import { fixture, credentials } from "./helpers.mjs";
test("password change and MFA removal require reauthentication and revoke sessions", async (t) => {
  const f = await fixture(t);
  const { second } = await f.login();
  const newPassword = "A different private password for fixture only";
  const recovery = second.value.recoveryCodes;
  assert.equal(
    (
      await f.request("/api/auth/password", "POST", {
        password: "incorrect",
        newPassword,
        code: recovery[0],
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await f.request("/api/auth/password", "POST", {
        password: credentials.password,
        newPassword,
        code: recovery[0],
      })
    ).status,
    200,
  );
  assert.equal((await f.request("/api/admin/content")).status, 401);
  assert.equal(
    (await f.request("/api/auth/login", "POST", credentials)).status,
    401,
  );
  assert.equal(
    (
      await f.request("/api/auth/login", "POST", {
        email: credentials.email,
        password: newPassword,
      })
    ).value.stage,
    "mfa",
  );
  assert.equal(
    (await f.request("/api/auth/verify", "POST", { code: recovery[1] })).status,
    200,
  );
  assert.equal(
    (
      await f.request("/api/auth/mfa/remove", "POST", {
        password: newPassword,
        code: recovery[2],
      })
    ).status,
    200,
  );
  assert.equal((await f.request("/api/admin/content")).status, 401);
  assert.equal(f.db.prepare("SELECT mfa,recovery FROM users").get().mfa, null);
  assert.equal(
    (
      await f.request("/api/auth/login", "POST", {
        email: credentials.email,
        password: newPassword,
      })
    ).value.stage,
    "enroll",
  );
  assert.equal((await f.request("/api/admin/content")).status, 401);
});
test("restored office shell and bootstrap are private", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.request("/office.html")).status, 302);
  assert.equal((await f.request("/api/admin/bootstrap.js")).status, 401);
  await f.login();
  const boot = await f.request("/api/admin/bootstrap.js");
  assert.equal(boot.status, 200);
  assert(boot.value.includes("TechouseAdmin"));
  assert(boot.response.headers.get("cache-control").includes("no-store"));
  const office = await f.request("/office.html");
  assert.equal(office.status, 200);
  assert(office.value.includes("/secure-office.js"));
});
