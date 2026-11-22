import test from "node:test";
import assert from "node:assert/strict";
import { fixture, credentials, content } from "./helpers.mjs";
import { totp, validateContent } from "../worker.mjs";

test("second-factor guesses are capped per account across fresh sign-ins", async (t) => {
  const f = await fixture(t);
  // Four password sign-ins of five wrong codes each use the hourly account budget.
  for (let round = 0; round < 4; round++) {
    assert.equal((await f.request("/api/auth/login", "POST", credentials)).status, 200);
    for (let i = 0; i < 5; i++)
      assert.equal(
        (await f.request("/api/auth/verify", "POST", { code: "000000" })).status,
        401,
      );
  }
  const fresh = await f.request("/api/auth/login", "POST", credentials);
  const code = await totp(fresh.value.secret, Math.floor(Date.now() / 30000));
  assert.equal((await f.request("/api/auth/verify", "POST", { code })).status, 429);
});

test("project createdAt accepts only a bounded date string", () => {
  const valid = content("Dated");
  valid.projects[0].createdAt = "2026-11-04T01:00:00Z";
  assert.equal(validateContent(valid).projects[0].createdAt, "2026-11-04T01:00:00Z");
  for (const createdAt of [{ nested: true }, ["x"], 42, "not a date", "2026-11-04" + " ".repeat(64)]) {
    const input = content("Dated");
    input.projects[0].createdAt = createdAt;
    const stored = validateContent(input).projects[0].createdAt;
    assert.equal(typeof stored, "string");
    assert.notEqual(stored, createdAt);
    assert(!Number.isNaN(Date.parse(stored)));
  }
});
