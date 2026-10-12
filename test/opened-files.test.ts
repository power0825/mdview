import test from 'node:test';
import assert from 'node:assert/strict';
import { addOpenedFile } from '../src/openedFiles.ts';

test('opened files are kept in open order and updated by path', () => {
  const first = { path: 'D:/docs/a.md', name: 'a.md', content: 'old' };
  const second = { path: 'D:/docs/b.md', name: 'b.md', content: 'content' };
  const updatedFirst = { path: 'D:/docs/a.md', name: 'a.md', content: 'new' };

  assert.deepEqual(addOpenedFile(addOpenedFile([], first), second), [first, second]);
  assert.deepEqual(addOpenedFile([first, second], updatedFirst), [updatedFirst, second]);
});
