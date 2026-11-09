import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, content } from './helpers.mjs';

test('Homepage content saves active labels and retires old copy without rejecting legacy drafts', async (t) => {
  const f = await fixture(t);
  await f.login();
  const record = await f.request('/api/admin/content');
  const draft = content('A client-approved headline');
  draft.text['.company-intro p:nth-of-type(2)'] = 'Retired second paragraph';
  draft.text['.company-intro p:nth-of-type(1)'] = 'Old summary';
  draft.text['.company-story p:nth-of-type(1)'] = 'An approved story';
  draft.text['.company-story-close'] = 'An approved closing line';
  draft.text['.landing-kicker'] = 'An editable company promise';
  draft.text['[data-banner="solar"] .banner-division-label'] = 'Solar energy';
  draft.text['.landing-invitation .intro-step:first-child'] = 'Old invitation';
  draft.text['[data-banner="solar"] .banner-hook'] = 'Old hook';
  draft.text['[data-banner="solar"] .banner-description'] = 'Old description';
  const saved = await f.request('/api/admin/content', 'PUT', {
    content: draft,
    version: record.value.version,
  });
  assert.equal(saved.status, 200);
  const read = await f.request('/api/admin/content');
  assert.equal(
    read.value.content.text['[data-banner="solar"] .banner-division-label'],
    'Solar energy',
  );
  assert.equal(read.value.content.text['.landing-kicker'], 'An editable company promise');
  assert.equal(
    Object.keys(read.value.content.text).some((key) =>
      /banner-hook|banner-description|intro-step/.test(key),
    ),
    false,
  );
  assert.equal(Object.hasOwn(read.value.content.text, '.company-intro p:nth-of-type(2)'), false);
  assert.equal(read.value.content.text['.company-story p:nth-of-type(1)'], 'An approved story');
  assert.equal(read.value.content.text['.company-story-close'], 'An approved closing line');
  assert.equal(Object.hasOwn(read.value.content.text, '.company-intro p:nth-of-type(1)'), false);
  const invalid = structuredClone(draft);
  invalid.text['#unapproved-selector'] = 'Should be rejected';
  assert.equal(
    (
      await f.request('/api/admin/content', 'PUT', {
        content: invalid,
        version: read.value.version,
      })
    ).status,
    400,
  );
});
