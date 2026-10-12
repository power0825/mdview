import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../src/App.css', import.meta.url), 'utf-8');

test('content toolbar keeps file name, zoom, and menu from overlapping', () => {
  assert.match(css, /\.content-toolbar\s*\{[\s\S]*display:\s*grid;/);
  assert.match(css, /\.content-toolbar\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*auto;/);
  assert.match(css, /\.toolbar-left\s*\{[\s\S]*min-width:\s*0;/);
  assert.match(css, /\.file-name\s*\{[\s\S]*overflow:\s*hidden;[\s\S]*text-overflow:\s*ellipsis;[\s\S]*white-space:\s*nowrap;/);
  assert.match(css, /\.toolbar-right\s*\{[\s\S]*flex-shrink:\s*0;/);
});
