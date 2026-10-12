import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldShowContentToolbar } from '../src/readingView.ts';

test('content toolbar is hidden while reading in fullscreen', () => {
  assert.equal(
    shouldShowContentToolbar({ hasCurrentFile: true, isFullscreen: true }),
    false
  );
});

test('content toolbar is shown for an opened file outside fullscreen', () => {
  assert.equal(
    shouldShowContentToolbar({ hasCurrentFile: true, isFullscreen: false }),
    true
  );
});
