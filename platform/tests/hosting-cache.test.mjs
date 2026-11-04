import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fixture } from './helpers.mjs';
import hostedWorker from '../../deployments/techouse-1.0/worker-entry.mjs';

test('Hosted caching reuses fingerprinted assets and keeps private responses uncached', async (t) => {
  const f = await fixture(t);
  const fetch = (path) => hostedWorker.fetch(new Request(f.env.APP_ORIGIN + path), f.env);
  const versioned = await fetch('/banner.js?v=0123456789ab');
  assert.equal(versioned.status, 200);
  assert.equal(versioned.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  const manifest = JSON.parse(
    await readFile(
      new URL('../../deployments/techouse-1.0/asset-manifest.json', import.meta.url),
      'utf8',
    ),
  );
  for (const path of [
    '/assets/fonts/' + manifest.fonts[0].file,
    '/assets/' + manifest.heroImages.elevators.file,
  ]) {
    const response = await fetch(path);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  }
  assert.equal(
    (await fetch('/banner.js')).headers.get('cache-control'),
    'public, max-age=0, must-revalidate',
  );
  for (const path of [
    '/api/bootstrap.js?v=0123456789ab',
    '/api/admin/content',
    '/api/admin/bootstrap.js',
    '/admin',
    '/office.html',
  ]) {
    const response = await fetch(path);
    assert.equal(response.headers.get('cache-control'), 'no-store', path);
  }
  const home = await fetch('/');
  assert.equal(home.status, 200);
  assert.equal(home.headers.get('cache-control'), 'no-cache');
  assert.ok((await home.text()).includes('/api/bootstrap.js'));
  const missing = await fetch('/missing-asset.js?v=0123456789ab');
  assert.equal(missing.status, 404);
  assert.ok(!missing.headers.get('cache-control')?.includes('immutable'));
});
