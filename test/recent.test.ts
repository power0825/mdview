import test from 'node:test';
import assert from 'node:assert/strict';
import { addRecentEntry } from '../src/recent.ts';

test('recent entries are deduplicated by type and path with newest first', () => {
  const entries = addRecentEntry(
    [
      {
        type: 'file',
        path: 'D:/docs/a.md',
        name: 'a.md',
        lastOpenedAt: 10,
      },
      {
        type: 'folder',
        path: 'D:/docs',
        name: 'docs',
        lastOpenedAt: 20,
      },
    ],
    {
      type: 'file',
      path: 'D:/docs/a.md',
      name: 'a.md',
      lastOpenedAt: 30,
    }
  );

  assert.deepEqual(
    entries.map((entry) => `${entry.type}:${entry.path}:${entry.lastOpenedAt}`),
    ['file:D:/docs/a.md:30', 'folder:D:/docs:20']
  );
});
