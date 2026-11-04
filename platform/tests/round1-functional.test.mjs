import test from "node:test";
import assert from "node:assert/strict";
import { fixture, content } from "./helpers.mjs";
test("F1 complete enrollment, publish, public delivery, logout", async (t) => {
  const f = await fixture(t);
  const { first, second } = await f.login();
  assert.equal(first.value.stage, "enroll");
  assert.equal(second.status, 200);
  assert.equal(second.value.recoveryCodes.length, 8);
  const initial = await f.request("/api/admin/content");
  assert.equal(initial.status, 200);
  const save = await f.request("/api/admin/content", "PUT", {
    content: content(),
    version: initial.value.version,
  });
  assert.equal(save.status, 200);
  const publicData = await f.request("/api/bootstrap.js");
  assert(publicData.value.includes("Sample"));
  assert(!publicData.value.includes("Private draft"));
  assert(!publicData.value.includes("Secret post"));
  const home = await f.request("/");
  assert(home.value.includes("/api/bootstrap.js"));
  assert.equal((await f.request("/api/auth/logout", "POST", {})).status, 200);
  assert.equal((await f.request("/api/admin/content")).status, 401);
});
