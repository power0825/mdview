import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSearchQueryOccurrenceIndexBeforeLine,
  getSearchResultOccurrenceIndex,
} from '../src/searchNavigation.ts';

test('search navigation uses the clicked result occurrence among duplicate snippets', () => {
  assert.equal(
    getSearchResultOccurrenceIndex(['same result', 'other', 'same result'], 'same result', 2),
    1
  );

  assert.equal(
    getSearchResultOccurrenceIndex(['same result', 'other', 'same result'], 'same result', 0),
    0
  );
});

test('search navigation counts query occurrences before the clicked result line', () => {
  assert.equal(
    getSearchQueryOccurrenceIndexBeforeLine(
      '# Intro\ninstall first\n## install heading\ninstall target\n',
      'install',
      4
    ),
    2
  );

  assert.equal(
    getSearchQueryOccurrenceIndexBeforeLine(
      'install twice install\ninstall target\n',
      'install',
      2
    ),
    2
  );
});
