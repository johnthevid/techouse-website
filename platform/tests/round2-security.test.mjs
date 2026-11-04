import test from "node:test";
import assert from "node:assert/strict";
import { fixture, content, credentials } from "./helpers.mjs";
import { totp } from "../worker.mjs";
test("S2 MFA replay, recovery replay, cookie fixation and stored script payloads", async (t) => {
  const f = await fixture(t);
  const first = await f.request("/api/auth/login", "POST", credentials);
  const challenge = f.getCookie();
  const code = await totp(first.value.secret, Math.floor(Date.now() / 30000));
  const verified = await f.request("/api/auth/verify", "POST", { code });
  assert.equal(verified.status, 200);
  const cookie = f.getCookie();
  assert.notEqual(cookie, challenge);
  assert(verified.response.headers.get("set-cookie").includes("HttpOnly"));
  assert(
    verified.response.headers.get("set-cookie").includes("SameSite=Strict"),
  );
  await f.request("/api/auth/logout", "POST", {});
  await f.request("/api/auth/login", "POST", credentials);
  assert.equal(
    (await f.request("/api/auth/verify", "POST", { code })).status,
    401,
  );
  const recovery = verified.value.recoveryCodes[0];
  assert.equal(
    (await f.request("/api/auth/verify", "POST", { code: recovery })).status,
    200,
  );
  let snapshot = await f.request("/api/admin/content");
  const hostile = content("<img src=x onerror=alert(1)>");
  hostile.projects[0].image = "data:image/svg+xml;base64,PHN2Zz4=";
  assert.equal(
    (
      await f.request("/api/admin/content", "PUT", {
        content: hostile,
        version: snapshot.value.version,
      })
    ).status,
    400,
  );
  hostile.projects[0].image = "assets/solar.jpg";
  hostile.projects[0].source = "javascript:alert(1)";
  assert.equal(
    (
      await f.request("/api/admin/content", "PUT", {
        content: hostile,
        version: snapshot.value.version,
      })
    ).status,
    400,
  );
  hostile.projects[0].source = "https://example.test";
  assert.equal(
    (
      await f.request("/api/admin/content", "PUT", {
        content: hostile,
        version: snapshot.value.version,
      })
    ).status,
    200,
  );
  assert(!(await f.request("/api/bootstrap.js")).value.includes("<img"));
  await f.request("/api/auth/logout", "POST", {});
  await f.request("/api/auth/login", "POST", credentials);
  assert.equal(
    (await f.request("/api/auth/verify", "POST", { code: recovery })).status,
    401,
  );
});
