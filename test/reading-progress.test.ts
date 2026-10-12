import test from 'node:test';
import assert from 'node:assert/strict';
import { getActiveHeadingId } from '../src/readingProgress.ts';

test('active heading is the latest heading above the reading threshold', () => {
  const headings = [
    { id: 'intro', top: 20 },
    { id: 'setup', top: 180 },
    { id: 'usage', top: 360 },
  ];

  assert.equal(getActiveHeadingId(headings, 190), 'setup');
  assert.equal(getActiveHeadingId(headings, 15), 'intro');
});
