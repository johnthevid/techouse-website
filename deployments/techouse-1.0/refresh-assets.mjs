/** Run before deployment so edited scripts/styles get fresh browser-cache URLs. */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const site = resolve(dirname(fileURLToPath(import.meta.url)), '../../site');
for (const name of ['index.html', 'admin.html']) {
  const file = resolve(site, name);
  const source = await readFile(file, 'utf8');
  const pattern = /((?:src|href)=")(\/?[\w/-]+\.(?:js|css))(?:\?v=[^"]*)?(\")/g;
  const versions = new Map();
  for (const match of source.matchAll(pattern)) {
    const bytes = await readFile(resolve(site, match[2].replace(/^\//, '')));
    versions.set(match[2], createHash('sha256').update(bytes).digest('hex').slice(0, 12));
  }
  const updated = source.replace(
    pattern,
    (_, prefix, asset, suffix) => `${prefix}${asset}?v=${versions.get(asset)}${suffix}`,
  );
  if (updated !== source) await writeFile(file, updated);
}
console.log('Script and stylesheet cache versions match their file contents.');
