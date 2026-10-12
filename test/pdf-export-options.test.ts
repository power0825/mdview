import test from 'node:test';
import assert from 'node:assert/strict';
import { createPdfExportOptions } from '../src/pdfExport.ts';

test('pdf export options avoid splitting markdown blocks across pages', () => {
  const options = createPdfExportOptions('example.md');

  assert.deepEqual(options.pagebreak.mode, ['css', 'legacy']);
  assert.deepEqual(options.pagebreak.avoid, [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'pre',
    'blockquote',
    'table',
    'img',
    'li',
  ]);
});
