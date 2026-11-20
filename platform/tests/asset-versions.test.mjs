import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Versioned scripts and styles are served with a one-year immutable cache. If a file changes but its
// ?v= tag does not, returning visitors keep the old file next to new ones and the page breaks.
// Fix a failure by running: node deployments/techouse-1.0/refresh-assets.mjs
const site = new URL('../../site/', import.meta.url);

test('every script and stylesheet in the pages carries the version of its current contents', async () => {
  for (const page of ['index.html', 'admin.html']) {
    const html = await readFile(new URL(page, site), 'utf8');
    const refs = [...html.matchAll(/(?:src|href)="\/?([\w/-]+\.(?:js|css))(?:\?v=([^"]*))?"/g)];
    assert.ok(refs.length > 0, `${page} lists no scripts or styles`);
    for (const [, file, version] of refs) {
      const hash = createHash('sha256')
        .update(await readFile(new URL(file, site)))
        .digest('hex')
        .slice(0, 12);
      assert.equal(version, hash, `${page}: ${file} is tagged ?v=${version}, its contents are ${hash}`);
    }
  }
});
