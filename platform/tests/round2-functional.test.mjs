import test from "node:test";
import assert from "node:assert/strict";
import { fixture, content, credentials } from "./helpers.mjs";
test("F2 persistence across clients, draft handling, conflict and recovery login", async (t) => {
  const f = await fixture(t);
  const { second } = await f.login();
  let record = await f.request("/api/admin/content");
  const saved = await f.request("/api/admin/content", "PUT", {
    content: content("Updated shared title"),
    version: record.value.version,
  });
  assert.equal(saved.status, 200);
  assert.equal(
    (
      await f.request("/api/admin/content", "PUT", {
        content: content("stale overwrite"),
        version: record.value.version,
      })
    ).status,
    409,
  );
  assert.equal(
    (await f.request("/api/admin/content")).value.content.text[
      "#landing-title"
    ],
    "Updated shared title",
  );
  await f.request("/api/auth/logout", "POST", {});
  assert.equal(
    (await f.request("/api/auth/login", "POST", credentials)).value.stage,
    "mfa",
  );
  assert.equal(
    (
      await f.request("/api/auth/verify", "POST", {
        code: second.value.recoveryCodes[0],
      })
    ).status,
    200,
  );
  const bootstrap = await f.request("/api/bootstrap.js");
  assert(bootstrap.value.includes("Updated shared title"));
  assert(!bootstrap.value.includes("stale overwrite"));
});
