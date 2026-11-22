import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContent } from '../worker.mjs';

// Projects belong to a division; each division has its own categories (site/portfolio.js).
const content = (project) => ({
  text: {},
  images: {},
  posts: [],
  projects: [
    {
      id: 'p1',
      title: 'Project',
      location: 'Location',
      capacity: 'Key fact',
      description: 'Description',
      status: 'published',
      sample: false,
      gallery: [],
      ...project,
    },
  ],
});

test('Projects carry a division with matching categories; older records stay solar', () => {
  const legacy = validateContent(content({ sector: 'residential' })).projects[0];
  assert.equal(legacy.division, 'solar');
  for (const [division, sector] of [
    ['solar', 'industrial'],
    ['construction', 'commercial'],
    ['prefabrication', 'institutional'],
    ['development', 'mixed-use'],
    ['elevators', 'modernisation'],
  ]) {
    const saved = validateContent(content({ division, sector })).projects[0];
    assert.deepEqual([saved.division, saved.sector], [division, sector]);
  }
  assert.throws(
    () => validateContent(content({ division: 'elevators', sector: 'residential' })),
    /Invalid sector/,
  );
  assert.throws(
    () => validateContent(content({ division: 'solar', sector: 'maintenance' })),
    /Invalid sector/,
  );
  assert.throws(
    () => validateContent(content({ division: 'mining', sector: 'residential' })),
    /Invalid division/,
  );
});
