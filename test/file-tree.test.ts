import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFileTree } from '../src/fileTree.ts';

test('markdown files are grouped into a folder tree using relative paths', () => {
  const tree = buildFileTree('D:/docs', [
    { path: 'D:/docs/guide/intro.md', name: 'intro.md' },
    { path: 'D:/docs/guide/setup.md', name: 'setup.md' },
    { path: 'D:/docs/readme.md', name: 'readme.md' },
  ]);

  assert.deepEqual(tree, [
    {
      type: 'folder',
      name: 'guide',
      path: 'D:/docs/guide',
      children: [
        { type: 'file', name: 'intro.md', path: 'D:/docs/guide/intro.md' },
        { type: 'file', name: 'setup.md', path: 'D:/docs/guide/setup.md' },
      ],
    },
    { type: 'file', name: 'readme.md', path: 'D:/docs/readme.md' },
  ]);
});
