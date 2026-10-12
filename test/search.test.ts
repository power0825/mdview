import test from 'node:test';
import assert from 'node:assert/strict';
import { searchMarkdownFiles } from '../src/search.ts';

test('search matches file names and markdown content with line snippets', () => {
  const results = searchMarkdownFiles(
    [
      {
        path: 'D:/docs/intro.md',
        name: 'intro.md',
        content: '# Intro\nInstall the desktop app\n',
      },
      {
        path: 'D:/docs/notes.md',
        name: 'release-notes.md',
        content: '# Notes\nNothing here\n',
      },
    ],
    'install'
  );

  assert.deepEqual(results, [
    {
      filePath: 'D:/docs/intro.md',
      fileName: 'intro.md',
      matchType: 'content',
      lineNumber: 2,
      snippet: 'Install the desktop app',
    },
  ]);

  assert.equal(searchMarkdownFiles([], '').length, 0);
});

test('search returns every matching content line in each file', () => {
  const results = searchMarkdownFiles(
    [
      {
        path: 'D:/docs/guide.md',
        name: 'guide.md',
        content: 'alpha\ninstall app\nbeta\nreinstall app\n',
      },
    ],
    'install'
  );

  assert.deepEqual(results, [
    {
      filePath: 'D:/docs/guide.md',
      fileName: 'guide.md',
      matchType: 'content',
      lineNumber: 2,
      snippet: 'install app',
    },
    {
      filePath: 'D:/docs/guide.md',
      fileName: 'guide.md',
      matchType: 'content',
      lineNumber: 4,
      snippet: 'reinstall app',
    },
  ]);
});
