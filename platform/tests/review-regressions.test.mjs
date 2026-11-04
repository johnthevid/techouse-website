import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createEnvironment } from '../local.mjs';
import { validateContent } from '../worker.mjs';
import { fixture, content } from './helpers.mjs';

test('Invalid request shapes and project photos return validation errors', async (t) => {
  const f = await fixture(t);
  for (const input of ['null', '[]', 'true', '42', '"text"']) {
    assert.equal((await f.request('/api/auth/login', 'POST', input)).status, 400);
  }
  for (const photo of [null, [], false, 'photo']) {
    const invalid = content('Invalid photo');
    invalid.projects[0].gallery = [photo];
    assert.throws(() => validateContent(invalid), { status: 400 });
  }
  for (const field of ['text', 'images']) {
    const invalid = content('Invalid field');
    invalid[field] = [];
    assert.throws(() => validateContent(invalid), { status: 400 });
  }
  const invalid = content('Invalid ID');
  invalid.projects[0].id = 123;
  assert.throws(() => validateContent(invalid), { status: 400 });
  assert.doesNotThrow(() => validateContent(content('Valid project')));
});

test('Local startup preserves a valid key and never replaces an unreadable or invalid one', async (t) => {
  const folder = await mkdtemp(join(tmpdir(), 'techouse-key-review-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const keyPath = join(folder, 'auth-key');
  const original = 'a'.repeat(64);
  await writeFile(keyPath, original, { mode: 0o600 });
  const { env, db } = await createEnvironment(folder);
  assert.equal(env.AUTH_KEY, original);
  db.close();
  assert.equal(await readFile(keyPath, 'utf8'), original);
  await writeFile(keyPath, 'invalid-test-key');
  await assert.rejects(createEnvironment(folder), /authentication key is invalid/);
  assert.equal(await readFile(keyPath, 'utf8'), 'invalid-test-key');
  await rm(keyPath);
  await mkdir(keyPath);
  await assert.rejects(createEnvironment(folder));
  await rm(keyPath, { recursive: true });
  await assert.rejects(createEnvironment(folder), /authentication key is missing/);
  const fresh = await createEnvironment(join(folder, 'fresh'));
  assert.match(fresh.env.AUTH_KEY, /^[a-f0-9]{64}$/);
  fresh.db.close();
});
