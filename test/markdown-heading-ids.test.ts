import test from 'node:test';
import assert from 'node:assert/strict';
import { parseToc, renderMarkdown } from '../src/markdown.ts';

test('rendered markdown headings use the same ids as the table of contents', () => {
  const content = '# 第一章\n\n## 小节\n\n## 小节';
  const toc = parseToc(content);
  const html = renderMarkdown(content);

  assert.equal(toc[0].id, '第一章');
  assert.equal(toc[0].children[0].id, '小节');
  assert.equal(toc[0].children[1].id, '小节-1');
  assert.match(html, /<h1 id="第一章">第一章<\/h1>/);
  assert.match(html, /<h2 id="小节">小节<\/h2>/);
  assert.match(html, /<h2 id="小节-1">小节<\/h2>/);
});
