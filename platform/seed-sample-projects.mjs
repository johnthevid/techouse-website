/** Add the explicitly requested illustrative portfolio to the local CMS without replacing existing projects. */
import { readFile } from 'node:fs/promises';
import { createEnvironment } from './local.mjs';
const samples = JSON.parse(await readFile(new URL('./seeds/sample-projects.json', import.meta.url), 'utf8'));
const { db } = await createEnvironment();
try {
  db.exec('BEGIN IMMEDIATE');
  const stored = db.prepare('SELECT body FROM content WHERE id=1').get();
  const content = JSON.parse(stored.body);
  const ids = new Set((content.projects || []).map((project) => project.id));
  const additions = samples.filter((project) => !ids.has(project.id));
  content.projects = [...(content.projects || []), ...additions];
  if (additions.length) {
    db.prepare('UPDATE content SET body=?,version=version+1 WHERE id=1').run(JSON.stringify(content));
    db.prepare('INSERT INTO audit(time,actor,action) VALUES(?,?,?)').run(Date.now(), 'local-development', 'Added requested illustrative solar project samples');
  }
  db.exec('COMMIT');
  console.log(JSON.stringify({ added: additions.length, requestedSamples: Object.fromEntries(['residential','commercial','industrial'].map((sector) => [sector, content.projects.filter((project) => project.id.startsWith('illustrative-') && project.sector === sector).length])), existingProjectsPreserved: content.projects.length - additions.length }));
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
} finally { db.close(); }
