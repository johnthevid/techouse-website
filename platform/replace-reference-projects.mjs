/** Replace only the local preview's project library; preserve an exact project backup. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createEnvironment } from './local.mjs';
const projects = JSON.parse(await readFile(new URL('./seeds/reference-projects.json', import.meta.url), 'utf8'));
const counts = Object.fromEntries(['residential','commercial','industrial'].map(sector => [sector,projects.filter(project=>project.sector===sector).length]));
if (JSON.stringify(counts) !== JSON.stringify({residential:4,commercial:6,industrial:3})) throw Error('Unexpected reference project counts');
const { db } = await createEnvironment();
try {
  db.exec('BEGIN IMMEDIATE');
  const row = db.prepare('SELECT body FROM content WHERE id=1').get();
  const content = JSON.parse(row.body);
  const folder = new URL('./.data/backups/', import.meta.url);
  await mkdir(folder,{recursive:true,mode:0o700});
  const backup = new URL(`projects-before-reference-replacement-${Date.now()}.json`,folder);
  await writeFile(backup,JSON.stringify(content.projects || [],null,2)+'\n',{mode:0o600,flag:'wx'});
  const replaced = content.projects?.length || 0;
  content.projects = projects;
  content.portfolioVersion = 2;
  db.prepare('UPDATE content SET body=?,version=version+1 WHERE id=1').run(JSON.stringify(content));
  db.prepare('INSERT INTO audit(time,actor,action) VALUES(?,?,?)').run(Date.now(),'local-development','Replaced preview projects with 13 credited real-world references; prior projects backed up');
  db.exec('COMMIT');
  console.log(JSON.stringify({replaced,counts,total:projects.length,backup:backup.pathname}));
} catch(error) { db.exec('ROLLBACK'); throw error; } finally { db.close(); }
