import test from 'node:test';
import assert from 'node:assert/strict';
import { getStartupMarkdownFile } from '../electron/startup.ts';

test('startup parser finds markdown file arguments', () => {
  assert.equal(
    getStartupMarkdownFile([
      'C:/Program Files/MDView/MDView.exe',
      'D:/docs/readme.md',
    ]),
    'D:/docs/readme.md'
  );

  assert.equal(getStartupMarkdownFile(['MDView.exe', '--flag', 'D:/docs/a.txt']), null);
});
